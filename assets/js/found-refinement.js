(() => {
 const toggle=document.querySelector('.found-read-toggle'),panel=document.querySelector('.found-read-panel');
 if(toggle&&panel){
  let animation=null,open=false;
  const change=()=>{
   const from=panel.hidden?0:panel.getBoundingClientRect().height;animation?.cancel();open=!open;panel.hidden=false;
   toggle.setAttribute('aria-expanded',String(open));panel.inert=!open;
   const to=open?panel.scrollHeight:0;
   animation=panel.animate([{height:from+'px',opacity:open?0:1},{height:to+'px',opacity:open?1:0}],{duration:matchMedia('(prefers-reduced-motion:reduce)').matches?0:650,easing:'cubic-bezier(.22,1,.36,1)',fill:'both'});
   animation.onfinish=()=>{panel.hidden=!open;animation.cancel();animation=null};
  };
  panel.inert=true;toggle.addEventListener('click',change);toggle.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();change()}});
 }
 const films=[...document.querySelectorAll('[data-proximity-film]')].map(box=>{
  const video=box.querySelector('video');video.autoplay=false;video.loop=false;video.muted=true;video.pause();
  let near=false,playing=false,available=false;
  async function start(){if(playing||!available)return;playing=true;video.currentTime=0;try{await video.play();box.classList.add('is-playing')}catch{playing=false}}
  video.addEventListener('ended',()=>{box.classList.remove('is-playing');playing=false});
  new IntersectionObserver(entries=>{available=entries[0].isIntersecting;if(!available){video.pause();playing=false;near=false;box.classList.remove('is-playing')}},{rootMargin:'100px'}).observe(box);
  return {box,video,stop(){video.pause();playing=false;near=false;box.classList.remove("is-playing")},check(x,y){const r=box.getBoundingClientRect(),next=x>r.left-100&&x<r.right+100&&y>r.top-100&&y<r.bottom+100;if(next&&!near)start();near=next},start};
 });
 let pending=false,px=-1000,py=-1000;
 document.addEventListener('pointermove',e=>{px=e.clientX;py=e.clientY;if(!pending){pending=true;requestAnimationFrame(()=>{pending=false;films.forEach(f=>f.check(px,py))})}},{passive:true});
 // Touch users can reveal each film with a tap, with the same one-shot playback.
 films.forEach(f=>{f.box.addEventListener('touchstart',()=>f.start(),{passive:true});f.box.style.pointerEvents='auto'});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)films.forEach(f=>{f.stop()})});
})();
