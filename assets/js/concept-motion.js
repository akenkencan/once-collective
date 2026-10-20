(()=>{
 const dock=document.querySelector('.concept-triangle-dock'),motion=dock?.querySelector('.concept-triangle-motion'),story=document.querySelector('.concept-story');if(!motion||!story)return;
 const mobile=matchMedia('(max-width:600px)').matches,size=mobile?360:640;
 const films=[...motion.querySelectorAll('canvas[data-scroll-frames]')].map(el=>{el.width=size;el.height=size;return {el,context:el.getContext('2d',{alpha:false}),count:Number(el.dataset.frameCount),cache:new Map(),wanted:0,shown:-1}});
 let scheduled=false;
 function paint(film,index,image){if(film.wanted!==index||film.shown===index)return;film.context.drawImage(image,0,0,size,size);film.shown=index;film.el.dataset.frame=String(index)}
 function frame(film,index,show=false){
  const cached=film.cache.get(index);if(cached){if(show&&cached.ready)paint(film,index,cached.image);return}
  const image=new Image(),entry={image,ready:false};image.decoding='async';image.fetchPriority=show?'high':'low';film.cache.set(index,entry);
  image.src='/assets/animations/'+film.el.dataset.scrollFrames+(mobile?'/mobile':'')+'/frame-'+String(index+1).padStart(3,'0')+'.webp';
  image.decode().then(()=>{entry.ready=true;paint(film,index,image)}).catch(()=>{});
  if(film.cache.size>28){for(const key of film.cache.keys()){if(Math.abs(key-film.wanted)>7){film.cache.delete(key);break}}}
 }
 function update(){scheduled=false;const target=dock.getBoundingClientRect(),box=story.getBoundingClientRect(),start=scrollY+box.top,end=scrollY+target.top+target.height/2-innerHeight/2;
  const p=Math.max(0,Math.min(1,(scrollY-start)/Math.max(1,end-start))),docked=target.top+target.height/2<=innerHeight/2+1;
  motion.classList.toggle('is-travelling',!docked&&box.top<innerHeight);motion.classList.toggle('is-docked',docked);motion.style.visibility=box.bottom<0||box.top>innerHeight?'hidden':'visible';motion.dataset.scrollProgress=p.toFixed(4);
  const fade=Math.max(0,Math.min(1,(p-.32)/.18));for(const film of films){film.el.style.opacity=film.el.classList.contains('concept-triangle-older')?String(.5*(1-fade*fade*(3-2*fade))):'1';const index=Math.round((docked?1:p)*(film.count-1));film.wanted=index;frame(film,index,true);for(const delta of [1,-1,2,-2,3,-3]){const next=index+delta;if(next>=0&&next<film.count)frame(film,next)}}
 }
 function request(){if(!scheduled){scheduled=true;requestAnimationFrame(update)}}
 window.addEventListener('scroll',request,{passive:true});window.addEventListener('resize',request);new ResizeObserver(request).observe(story);update();
})();

(() => {
 const intro=document.querySelector('.concept-intro');if(!intro)return;
 const tracks=[['.fader',[[0,0],[11,1],[24,1],[34,0]]],['.fade1',[[6,0],[17,1],[29,1],[37,0]]],['.fade2',[[10,0],[23,1],[29,1],[37,0]]],['.fade3',[[24,0],[32,1],[37,1]]]];
 const items=tracks.map(([selector,points])=>({el:intro.querySelector(selector),points}));let pending=false;
 function interpolate(points,p){if(p<=points[0][0])return points[0][1];for(let i=1;i<points.length;i++){if(p<=points[i][0]){const [x,a]=points[i-1],[y,b]=points[i],t=(p-x)/(y-x),smooth=t*t*(3-2*t);return a+(b-a)*smooth}}return points.at(-1)[1]}
 function update(){pending=false;const r=intro.getBoundingClientRect(),p=Math.max(0,Math.min(37,-r.top/Math.max(1,r.height-innerHeight*.35)*37));items.forEach(({el,points})=>{if(el)el.style.setProperty('--intro-opacity',matchMedia('(prefers-reduced-motion:reduce)').matches?'1':String(interpolate(points,p)))});intro.dataset.scrollProgress=p.toFixed(2)}
 function request(){if(!pending){pending=true;requestAnimationFrame(update)}}window.addEventListener('scroll',request,{passive:true});window.addEventListener('resize',request);update();
})();

// Show the cue after one second, then retire it as the opening text comes into view.
(()=>{const cue=document.querySelector('.concept-scroll-cue');if(!cue)return;let dismissed=false;const reveal=setTimeout(()=>{if(!dismissed)cue.style.opacity='.5'},150);function retire(){requestAnimationFrame(()=>{const first=document.querySelector('.concept-intro .fader');if(!dismissed&&scrollY>4&&Number(first?.style.getPropertyValue('--intro-opacity'))>.01){dismissed=true;clearTimeout(reveal);cue.style.opacity='0';cue.style.pointerEvents='none'}})}window.addEventListener('scroll',retire,{passive:true});retire()})();
