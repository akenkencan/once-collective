(()=>{
 const dock=document.querySelector('.concept-triangle-dock'),motion=dock?.querySelector('.concept-triangle-motion'),story=document.querySelector('.concept-story');if(!motion||!story)return;
 const mobile=matchMedia('(max-width:600px)').matches,size=mobile?360:640;
 const films=[...motion.querySelectorAll('canvas[data-scroll-frames]')].map(el=>{el.width=size;el.height=size;return {el,context:el.getContext('2d',{alpha:false}),count:Number(el.dataset.frameCount),cache:new Map(),wanted:0,shown:-1}});
 let scheduled=false,last=0,position=null,progress=null,previousScroll=scrollY,mode="travelling",spring=0,velocity=0;
 function paint(film){const low=film.cache.get(film.wanted),high=film.cache.get(film.next);if(!low?.ready)return;film.context.globalAlpha=1;film.context.drawImage(low.image,0,0,size,size);if(high?.ready&&film.mix>0){film.context.globalAlpha=film.mix;film.context.drawImage(high.image,0,0,size,size);film.context.globalAlpha=1}film.el.dataset.frame=String(film.wanted);film.el.dataset.frameNext=String(film.next);film.el.dataset.frameMix=film.mix.toFixed(4)}
 function frame(film,index,show=false){
  if(film.cache.has(index))return;
  const image=new Image(),entry={image,ready:false};image.decoding='async';image.fetchPriority=show?'high':'low';film.cache.set(index,entry);
  image.src='/assets/animations/'+film.el.dataset.scrollFrames+(mobile?'/mobile':'')+'/frame-'+String(index+1).padStart(3,'0')+'.webp';
  image.decode().then(()=>{entry.ready=true;if(index===film.wanted||index===film.next)paint(film)}).catch(()=>{});
  if(film.cache.size>28){for(const key of film.cache.keys()){if(Math.abs(key-film.wanted)>7){film.cache.delete(key);break}}}
 }
 function update(now){
  scheduled=false;const target=dock.getBoundingClientRect(),box=story.getBoundingClientRect(),center=target.top+target.height/2,rest=innerHeight/2,start=scrollY+box.top,end=scrollY+center-rest;
  const raw=Math.max(0,Math.min(1,(scrollY-start)/Math.max(1,end-start))),reduced=matchMedia('(prefers-reduced-motion:reduce)').matches,dt=Math.min(.032,Math.max(.001,(now-(last||now-16))/1000)),delta=scrollY-previousScroll,docked=center<=rest;last=now;previousScroll=scrollY;
  if(docked){mode='docked';spring=0;velocity=0;position=center;progress=1;Object.assign(motion.style,{position:'absolute',inset:'0px',left:'0px',top:'0px',width:'100%',height:'100%',transform:'none'})}
  else{
   if(mode==='docked'&&delta<=0&&!reduced){spring=Math.min(14,Math.max(0,center-rest));velocity=0;mode='release'}
   if(delta>0||reduced){spring=0;velocity=0;mode='travelling'}
   if(mode==='release'){velocity+=(-360*spring-32*velocity)*dt;spring+=velocity*dt;if(Math.abs(spring)<.03&&Math.abs(velocity)<.3){spring=0;velocity=0;mode='travelling'}}
   position=rest+spring;progress=raw;Object.assign(motion.style,{position:'fixed',inset:'auto',left:(target.left+target.width/2)+'px',top:position+'px',width:target.width+'px',height:target.height+'px',transform:'translate(-50%,-50%)'});
  }
  motion.classList.remove('is-travelling','is-docked');Object.assign(motion.style,{opacity:'1',visibility:box.bottom<0||box.top>innerHeight?'hidden':'visible'});motion.dataset.scrollProgress=progress.toFixed(4);motion.dataset.docked=String(docked);
  const p=progress*progress;motion.dataset.animationProgress=p.toFixed(4);const grade=Math.max(0,Math.min(1,p/.3)),smooth=grade*grade*(3-2*grade);motion.style.filter='brightness('+(.7+.3*smooth)+')';motion.style.setProperty('--intro-vignette',String(1-smooth));
  const fade=Math.max(0,Math.min(1,(p-.32)/.18));for(const film of films){film.el.style.opacity=film.el.classList.contains('concept-triangle-older')?String(.5*(1-fade*fade*(3-2*fade))):'1';const position=docked?film.count-1:Math.min(film.count-1-.00001,p*(film.count-1)),index=Math.floor(position);film.wanted=index;film.next=Math.min(film.count-1,index+1);film.mix=position-index;frame(film,index,true);frame(film,film.next,true);paint(film);for(const delta of [1,-1,2,-2,3,-3]){const next=index+delta;if(next>=0&&next<film.count)frame(film,next)}}
  if(mode==='release')request();
 }
 function request(){if(!scheduled){scheduled=true;requestAnimationFrame(update)}}
 window.addEventListener('scroll',request,{passive:true});window.addEventListener('resize',request);new ResizeObserver(request).observe(story);request();
})();

(() => {
 const intro=document.querySelector('.concept-intro');if(!intro)return;const title=intro.querySelector('.fader'),once=intro.querySelector('.fade1'),lines=[...intro.querySelectorAll('.concept-poem-line')],reduce=matchMedia('(prefers-reduced-motion:reduce)');let pending=false;
 const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t)};
 function update(){pending=false;const rect=intro.getBoundingClientRect(),p=Math.max(0,Math.min(100,-rect.top/Math.max(1,rect.height-innerHeight)*100));const scroll=Math.max(0,-rect.top/innerHeight),base=innerWidth<=740?4.4:4.8,exit=smooth((scroll-base*.25)/(base*.17)),starts=[base*.18,base*.265,base*.385,base*.47];[title,once].forEach((el,i)=>{const alpha=reduce.matches?1:smooth((scroll-i*base*.02)/(base*.07))*(1-exit);el.style.setProperty('--intro-opacity',alpha);el.style.setProperty('--intro-lift',(-32*exit)+'px')});lines.forEach((el,i)=>{const alpha=reduce.matches?1:smooth((scroll-starts[i])/(base*.065))*(1-smooth((p-88)/10));el.style.setProperty('--intro-opacity',alpha);el.style.setProperty('--intro-lift',(12*(1-alpha)-85*exit)+'px')});intro.dataset.scrollProgress=p.toFixed(2)}
 function request(){if(!pending){pending=true;requestAnimationFrame(update)}}window.addEventListener('scroll',request,{passive:true});window.addEventListener('resize',request);reduce.addEventListener('change',request);update();
})();

// Show the cue after one second, then retire it as the opening text comes into view.
(()=>{const cue=document.querySelector('.concept-scroll-cue');if(!cue)return;let dismissed=false;const reveal=setTimeout(()=>{if(!dismissed)cue.style.opacity='.5'},150);function retire(){requestAnimationFrame(()=>{const first=document.querySelector('.concept-intro .fader');if(!dismissed&&scrollY>4&&(Number(first?.style.getPropertyValue('--intro-opacity'))>.01||scrollY>innerHeight*.25)){dismissed=true;clearTimeout(reveal);cue.style.opacity='0';cue.style.pointerEvents='none'}})}window.addEventListener('scroll',retire,{passive:true});retire()})();
