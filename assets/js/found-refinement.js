(() => {
 const toggle=document.querySelector('.found-read-toggle'),panel=document.querySelector('.found-read-panel');
 if(toggle&&panel){
  let animation=null,open=false,revision=0;
  const clip=document.createElement('div');clip.className='found-read-clip';panel.before(clip);clip.append(panel);
  const opening=panel.querySelector('.found-vision-opening img');if(opening){opening.loading='eager';opening.fetchPriority='high';opening.decode?.().catch(()=>{})}
  async function setOpen(next){
   const run=++revision,from=panel.hidden?0:clip.getBoundingClientRect().height;animation?.forEach(a=>a.cancel());open=next;toggle.setAttribute('aria-expanded',String(open));panel.inert=!open;
   panel.hidden=false;const height=panel.scrollHeight,time=matchMedia('(prefers-reduced-motion:reduce)').matches?0:700,easing='cubic-bezier(.22,1,.36,1)';
   const size=clip.animate([{height:from+'px'},{height:(open?height:0)+'px'}],{duration:time,easing,fill:'forwards'}),slide=panel.animate([{transform:open?'translateY(-50px)':'none',opacity:open?0:1},{transform:open?'none':'translateY(-50px)',opacity:open?1:0}],{duration:time,easing,fill:'forwards'});animation=[size,slide];
   try{await size.finished;if(run!==revision)return;panel.hidden=!open;animation.forEach(a=>a.cancel());animation=null}catch(error){}
  }
  document.querySelector('.found-read-close')?.addEventListener('click',()=>{setOpen(false);toggle.scrollIntoView({behavior:'smooth',block:'center'});toggle.focus({preventScroll:true})});
  if(location.hash==='#found-read-panel'){setOpen(true);requestAnimationFrame(()=>panel.scrollIntoView({block:'start'}))}else panel.inert=true;toggle.addEventListener('click',()=>setOpen(!open));toggle.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setOpen(!open)}});
 }

 const films=[...document.querySelectorAll('[data-proximity-film]')].map(box=>{
  const video=box.querySelector('video');video.autoplay=false;video.loop=false;video.muted=true;video.playsInline=true;
  let near=false,active=false,finished=false,leaveTimer,fadeTimer,token=0;
  function fade(){active=false;token++;box.classList.remove('is-playing');fadeTimer=setTimeout(()=>video.pause(),850)}
  async function start(){
   clearTimeout(leaveTimer);clearTimeout(fadeTimer);if(active||finished)return;
   active=true;const run=++token;box.classList.add('is-playing');
   try{await ONCEMedia.ensure(video);if(run!==token||!active)return;video.currentTime=0;await video.play();delete box.dataset.playbackError}
   catch(e){active=false;box.classList.remove('is-playing');box.dataset.playbackError=e.message||e.name}
  }
  function check(x,y){const r=box.getBoundingClientRect(),next=r.bottom>0&&r.top<innerHeight&&x>r.left-180&&x<r.right+180&&y>r.top-180&&y<r.bottom+180;
   if(next){clearTimeout(leaveTimer);if(!near){finished=false;start()}}
   else if(near){leaveTimer=setTimeout(fade,1200);finished=false}
   near=next;
  }
  video.addEventListener('ended',()=>{finished=true;fade()});
  box.addEventListener('pointerenter',()=>{finished=false;start()});box.addEventListener('focus',()=>{finished=false;start()});function interact(){video.muted=true;video.volume=0;if(active&&!video.paused){video.pause()}else if(active){video.play().catch(()=>{})}else{finished=false;start()}}
  box.addEventListener('click',interact);box.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();interact()}});
  const observer=new IntersectionObserver(entries=>{if(entries[0].isIntersecting)ONCEMedia.ensure(video).catch(()=>{});else{clearTimeout(leaveTimer);fade();near=false}},{rootMargin:'200px'});observer.observe(box);
  return {check,stop:fade};
 });
 let pending=false,px=-1000,py=-1000;
 function update(){if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;films.forEach(f=>f.check(px,py))})}
 document.addEventListener('pointermove',e=>{px=e.clientX;py=e.clientY;update()},{passive:true});document.addEventListener('mousemove',e=>{px=e.clientX;py=e.clientY;update()},{passive:true});window.addEventListener('scroll',update,{passive:true});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)films.forEach(f=>f.stop())});
})();
