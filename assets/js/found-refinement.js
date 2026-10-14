(() => {
 const toggle=document.querySelector('.found-read-toggle'),panel=document.querySelector('.found-read-panel');
 if(toggle&&panel){
  let animation=null,open=false;
  function setOpen(next){
   animation?.cancel();animation=null;open=next;toggle.setAttribute('aria-expanded',String(open));panel.inert=!open;
   if(!open){panel.hidden=true;return}
   panel.hidden=false;const height=panel.scrollHeight;
   animation=panel.animate([{height:'0px',opacity:0},{height:height+'px',opacity:1}],{duration:matchMedia('(prefers-reduced-motion:reduce)').matches?0:650,easing:'cubic-bezier(.22,1,.36,1)'});
   animation.onfinish=()=>{animation=null};
  }
  document.querySelector('.found-read-close')?.addEventListener('click',()=>{setOpen(false);toggle.scrollIntoView({behavior:'smooth',block:'center'});toggle.focus({preventScroll:true})});
  panel.inert=true;toggle.addEventListener('click',()=>setOpen(!open));toggle.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setOpen(!open)}});
 }
 const films=[...document.querySelectorAll('[data-proximity-film]')].map(box=>{
  const video=box.querySelector('video');video.autoplay=false;video.loop=false;video.muted=true;video.playsInline=true;video.pause();
  let near=false,playing=false,available=false;
  let loaded=false;function load(){if(loaded||!video.dataset.hls)return;loaded=true;if(video.canPlayType('application/vnd.apple.mpegurl'))video.src=video.dataset.hls;else if(window.Hls?.isSupported()){const hls=new Hls();hls.loadSource(video.dataset.hls);hls.attachMedia(video)}else video.src=video.dataset.hls}
  async function start(){load();const rect=box.getBoundingClientRect();if(playing||(!available&&(rect.bottom<0||rect.top>innerHeight)))return;playing=true;try{video.currentTime=0;await video.play();box.classList.add('is-playing')}catch(error){playing=false;box.dataset.playbackError=error.name}}
  video.addEventListener('ended',()=>{box.classList.remove('is-playing');playing=false});
  new IntersectionObserver(entries=>{available=entries[0].isIntersecting;if(available){video.preload='metadata';if(near)start()}else{video.pause();playing=false;near=false;box.classList.remove('is-playing')}},{rootMargin:'240px'}).observe(box);
  box.addEventListener('click',start);box.addEventListener('pointerenter',start);box.addEventListener('focus',start);box.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();start()}});
  return {box,video,stop(){video.pause();playing=false;near=false;box.classList.remove('is-playing')},check(x,y){const r=box.getBoundingClientRect(),next=x>r.left-220&&x<r.right+220&&y>r.top-220&&y<r.bottom+220;if(next&&(!near||!playing&&video.currentTime===0))start();near=next}};
 });
 let pending=false,px=-1000,py=-1000;
 function update(){if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;films.forEach(f=>f.check(px,py))})}
 document.addEventListener('pointermove',e=>{px=e.clientX;py=e.clientY;update()},{passive:true});
 document.addEventListener('mousemove',e=>{px=e.clientX;py=e.clientY;update()},{passive:true});window.addEventListener('scroll',update,{passive:true});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)films.forEach(f=>f.stop())});
})();
