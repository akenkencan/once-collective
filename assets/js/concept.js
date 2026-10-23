/* Centre the film itself and follow late image/font layout changes briefly. */
(()=>{
 const local=/^(localhost|127\.0\.0\.1)$/.test(location.hostname),welcome=!!document.getElementById('showreel-video'),video=document.getElementById(welcome?'showreel-video':'concept-reel-video');let raf=0;
 function stop(){cancelAnimationFrame(raf);raf=0}
 function centre(){
  if(!video)return;stop();let previous=NaN;const until=performance.now()+5000;
  function follow(now){const box=video.getBoundingClientRect(),target=box.top+scrollY+box.height/2-innerHeight/2;if(!Number.isFinite(previous)||Math.abs(target-previous)>1){window.scrollTo({top:target,behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});previous=target}if(now<until)raf=requestAnimationFrame(follow);else raf=0}
  raf=requestAnimationFrame(follow);
 }
 ['wheel','touchstart','pointerdown'].forEach(type=>addEventListener(type,stop,{passive:true}));
 document.addEventListener('click',event=>{const link=event.target.closest('a');if(!link||!/^showreel$/i.test((link.querySelector('.burst-label')||link).textContent.trim()))return;event.preventDefault();event.stopImmediatePropagation();document.querySelector('.nav-menu-wrapper[data-menu-open="true"] .menu-icon-wrap.long')?.click();const dialog=document.getElementById('welcome-site-menu');if(dialog?.open)dialog.close();if(video){history.pushState(null,'',location.pathname+location.search+(welcome?'#showreel':'#Showreel'));centre()}else location.href=local?'/concept.html#Showreel':'/concept#Showreel'},true);
 if(video&&/^#showreel$/i.test(location.hash)){centre();addEventListener('load',centre,{once:true});document.fonts?.ready.then(centre);video.addEventListener('loadedmetadata',centre,{once:true})}
})();
