(() => {
 const dock=document.querySelector('.concept-triangle-dock'),motion=dock?.querySelector('.concept-triangle-motion'),story=document.querySelector('.concept-story');
 if(motion&&window.lottie){
  const animation=lottie.loadAnimation({container:motion.querySelector('.concept-triangle-film'),renderer:'svg',loop:false,autoplay:false,path:'/assets/animations/concept-evolution.json',rendererSettings:{preserveAspectRatio:'xMidYMid meet'}});
  let scheduled=false,ready=false;
  function update(){scheduled=false;const target=dock.getBoundingClientRect(),box=story.getBoundingClientRect();
   const start=scrollY+box.top,end=scrollY+target.top+target.height/2-innerHeight/2,p=Math.max(0,Math.min(1,(scrollY-start)/Math.max(1,end-start)));
   const docked=target.top+target.height/2<=innerHeight/2+1;const travelling=!docked&&box.top<innerHeight;motion.classList.toggle('is-travelling',travelling);motion.classList.toggle('is-docked',docked);
   motion.style.visibility=box.bottom<0||box.top>innerHeight?'hidden':'visible';
   if(ready){const frame=Math.min(animation.totalFrames-1,Math.round((docked?1:p)*(animation.totalFrames-1)));animation.goToAndStop(frame,true);motion.dataset.frame=String(frame)}
  }
  function request(){if(!scheduled){scheduled=true;requestAnimationFrame(update)}}
  animation.addEventListener('DOMLoaded',()=>{ready=true;update()});animation.addEventListener('loaded_images',()=>{ready=true;update()});window.addEventListener('scroll',request,{passive:true});window.addEventListener('resize',request);new ResizeObserver(request).observe(story);update();
 }

})();

(() => {
 const intro=document.querySelector('.concept-intro');if(!intro)return;
 const tracks=[['.fader',[[0,0],[11,1],[24,1],[34,0]]],['.fade1',[[6,0],[17,1],[29,1],[37,0]]],['.fade2',[[10,0],[23,1],[29,1],[37,0]]]];
 const items=tracks.map(([selector,points])=>({el:intro.querySelector(selector),points}));let pending=false;
 function interpolate(points,p){if(p<=points[0][0])return points[0][1];for(let i=1;i<points.length;i++){if(p<=points[i][0]){const [x,a]=points[i-1],[y,b]=points[i],t=(p-x)/(y-x),smooth=t*t*(3-2*t);return a+(b-a)*smooth}}return points.at(-1)[1]}
 function update(){pending=false;const r=intro.getBoundingClientRect(),p=Math.max(0,Math.min(37,-r.top/Math.max(1,r.height-innerHeight*.35)*37));items.forEach(({el,points})=>{if(el)el.style.setProperty('--intro-opacity',matchMedia('(prefers-reduced-motion:reduce)').matches?'1':String(interpolate(points,p)))});intro.dataset.scrollProgress=p.toFixed(2)}
 function request(){if(!pending){pending=true;requestAnimationFrame(update)}}window.addEventListener('scroll',request,{passive:true});window.addEventListener('resize',request);update();
})();

// Show the cue after one second, then retire it as the opening text comes into view.
(()=>{const cue=document.querySelector('.concept-scroll-cue');if(!cue)return;let dismissed=false;const reveal=setTimeout(()=>{if(!dismissed)cue.style.opacity='.5'},1000);function retire(){requestAnimationFrame(()=>{const first=document.querySelector('.concept-intro .fader');if(!dismissed&&scrollY>4&&Number(first?.style.getPropertyValue('--intro-opacity'))>.01){dismissed=true;clearTimeout(reveal);cue.style.opacity='0';cue.style.pointerEvents='none'}})}window.addEventListener('scroll',retire,{passive:true});retire()})();
