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
   try{await size.finished;if(run!==revision)return false;panel.hidden=!open;animation.forEach(a=>a.cancel());animation=null;return true}catch(error){return false}
  }
  panel.addEventListener('click',event=>{if(!(event.target instanceof Element)||!event.target.closest('[data-found-close]'))return;const restore=panel.contains(document.activeElement);setOpen(false).then(done=>{if(done&&restore&&!open)toggle.focus({preventScroll:true})})});
  const attention=new IntersectionObserver(entries=>{entries.forEach(entry=>{toggle.dataset.readInView=String(entry.isIntersecting)})},{threshold:.1});attention.observe(toggle);
  async function locatePassage(){const target=document.getElementById(location.hash.slice(1));if(target&&(target===panel||panel.contains(target))){await setOpen(true);target.scrollIntoView({block:target===panel?'start':'center'})}}panel.inert=true;locatePassage();window.addEventListener('hashchange',locatePassage);toggle.addEventListener('click',async()=>{const opening=!open,done=await setOpen(opening);if(done&&opening&&open){const peek=Math.min(240,innerHeight*.3),needed=panel.getBoundingClientRect().top+peek-innerHeight+24;if(needed>0)window.scrollBy({top:needed,behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'})}});if(toggle.tagName!=='BUTTON')toggle.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setOpen(!open)}});
 }

 // Warm at most two approaching films; one initial segment is retained until playback.
 const connection=navigator.connection,queue=[];let warming=0;
 function pump(){while(warming<2&&queue.length){const video=queue.shift();warming++;ONCEMedia.warm(video).catch(()=>{}).finally(()=>{warming--;pump()})}}
 if(!connection?.saveData&&!/^(slow-)?2g$/.test(connection?.effectiveType||'')){
  const seen=new WeakSet(),warmObserver=new IntersectionObserver(entries=>{entries.filter(e=>e.isIntersecting).forEach(e=>{if(seen.has(e.target))return;seen.add(e.target);queue.push(e.target);warmObserver.unobserve(e.target)});pump()},{rootMargin:'900px'});
  document.querySelectorAll('video[data-hls]').forEach(video=>warmObserver.observe(video));
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
  const observer=new IntersectionObserver(entries=>{if(!entries[0].isIntersecting){clearTimeout(leaveTimer);fade();near=false}},{rootMargin:'200px'});observer.observe(box);
  return {check,stop:fade};
 });
 let pending=false,px=-1000,py=-1000;
 function update(){if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;films.forEach(f=>f.check(px,py))})}
 document.addEventListener('pointermove',e=>{px=e.clientX;py=e.clientY;update()},{passive:true});document.addEventListener('mousemove',e=>{px=e.clientX;py=e.clientY;update()},{passive:true});window.addEventListener('scroll',update,{passive:true});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)films.forEach(f=>f.stop())});
})();
