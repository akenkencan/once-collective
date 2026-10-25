// Colour and light emerge only near the card; the idle card has no animation loop.
(()=>{
 const cards=[...document.querySelectorAll('.proximity-foil')].map(el=>({el,near:0,rx:0,ry:0,x:50,y:50,visible:true}));if(!cards.length)return;
 const reduced=matchMedia('(prefers-reduced-motion:reduce)');let point=null,frame=0;
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 function paint(){frame=0;let moving=false;
  for(const c of cards){let target=0,x=50,y=50;
   if(c.visible&&point&&!reduced.matches&&!c.el.classList.contains('is-expanded')){const r=c.el.getBoundingClientRect(),d=Math.hypot(Math.max(r.left-point.x,0,point.x-r.right),Math.max(r.top-point.y,0,point.y-r.bottom)),p=clamp(1-d/150,0,1);target=p*p*(3-2*p);x=clamp((point.x-r.left)/r.width,0,1)*100;y=clamp((point.y-r.top)/r.height,0,1)*100}
   const rx=(y/100-.5)*-10*target,ry=(x/100-.5)*10*target;c.near+=(target-c.near)*.1;c.rx+=(rx-c.rx)*.1;c.ry+=(ry-c.ry)*.1;c.x+=(x-c.x)*.1;c.y+=(y-c.y)*.1;
   c.el.style.setProperty('--foil-near',c.near.toFixed(4));c.el.style.setProperty('--foil-x',c.x+'%');c.el.style.setProperty('--foil-y',c.y+'%');c.el.style.setProperty('--foil-rx',c.rx+'deg');c.el.style.setProperty('--foil-ry',c.ry+'deg');
   moving||=Math.abs(target-c.near)>.001||Math.abs(rx-c.rx)>.005||Math.abs(ry-c.ry)>.005||Math.abs(x-c.x)>.05||Math.abs(y-c.y)>.05;
  }if(moving)schedule();
 }
 function schedule(){if(!frame&&!document.hidden)frame=requestAnimationFrame(paint)}
 const visibility=new IntersectionObserver(entries=>{entries.forEach(e=>{const c=cards.find(c=>c.el===e.target);c.visible=e.isIntersecting});schedule()},{rootMargin:'180px'});cards.forEach(c=>visibility.observe(c.el));
 document.addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;point={x:e.clientX,y:e.clientY};schedule()},{passive:true});document.documentElement.addEventListener('pointerleave',()=>{point=null;schedule()});document.addEventListener('visibilitychange',()=>{point=null;schedule()});window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);reduced.addEventListener('change',schedule);
 document.querySelectorAll('.welcome-film-card').forEach(link=>link.addEventListener('click',e=>{const film=document.getElementById('showreel');if(!film)return;e.preventDefault();film.scrollIntoView({block:'center',behavior:reduced.matches?'instant':'smooth'});history.replaceState(null,'',location.pathname+location.search+'#showreel')}));
})();
