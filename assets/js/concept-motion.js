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
 const video=document.getElementById('concept-reel-video'),dialog=document.querySelector('.reel-dialog'),slot=document.querySelector('.reel-embedded-slot'),dialogSlot=document.querySelector('.reel-dialog-slot'),button=document.querySelector('.reel-expand');let loaded=false;
 function load(){if(loaded)return;loaded=true;const src=video.dataset.hls;if(video.canPlayType('application/vnd.apple.mpegurl'))video.src=src;else if(window.Hls?.isSupported()){const hls=new Hls();hls.loadSource(src);hls.attachMedia(video)}else video.src=src}
 function restore(){if(video.parentNode!==slot)slot.append(video);video.focus()}
 video.addEventListener('click',()=>{if(dialog.open)return;load();dialogSlot.append(video);dialog.showModal();video.play().catch(()=>{});dialog.querySelector('.reel-close').focus()});
 video.addEventListener('play',load,{once:true});video.addEventListener('pointerdown',load,{once:true});
 dialog.querySelector('.reel-close').addEventListener('click',()=>dialog.close());dialog.addEventListener('close',restore);
 dialog.addEventListener('click',e=>{if(e.target===dialog||e.target===dialogSlot)dialog.close()});
})();
