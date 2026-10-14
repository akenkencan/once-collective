(() => {
 const toggles=[...document.querySelectorAll('[data-open-application]')];
 function setOpen(id,open){const body=document.getElementById(id);if(!body)return;
  body.hidden=!open;
  if(open)body.querySelectorAll('iframe[data-lazy-form]').forEach(f=>{if(!f.getAttribute('src'))f.src=f.dataset.lazyForm});
  toggles.filter(b=>b.dataset.openApplication===id).forEach(b=>b.setAttribute('aria-expanded',String(open)));
  body.parentNode.querySelectorAll('.application-external').forEach(p=>p.hidden=!open);
  if(open)body.animate([{opacity:0,transform:'translateY(-12px)'},{opacity:1,transform:'none'}],{duration:matchMedia('(prefers-reduced-motion:reduce)').matches?0:450,easing:'ease-out'});
 }
 toggles.forEach(b=>b.addEventListener('click',e=>{e.preventDefault();const body=document.getElementById(b.dataset.openApplication);setOpen(body.id,body.hidden)}));
 document.querySelectorAll('[data-scroll-application]').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();document.getElementById(b.dataset.scrollApplication)?.scrollIntoView({behavior:'smooth',block:'center'})}));
 const options=[...document.querySelectorAll('[data-contribution-tier]')],checkout=document.getElementById('patron-checkout');
 options.forEach(b=>b.addEventListener('click',()=>{
  const same=b.getAttribute('aria-expanded')==='true',slug=b.dataset.contributionTier;
  options.forEach(o=>o.setAttribute('aria-expanded','false'));setOpen('patron-checkout',!same);b.setAttribute('aria-expanded',String(!same));
  if(!same){const frame=checkout.querySelector('iframe'),amount=slug.startsWith('deep-significance')?'2500':slug.startsWith('belief-bond')?'':'10',params='?useTheme=true'+(amount?'&amount='+amount:''),src='https://opencollective.com/embed/once-collective/contribute/'+slug+params;
   if(frame.src!==src)frame.src=src;checkout.querySelector('a').href='https://opencollective.com/once-collective/contribute/'+slug+'/checkout'+params;}
 }));
})();
document.querySelectorAll('[data-ambient-video]').forEach(video=>{new IntersectionObserver(entries=>{if(entries[0].isIntersecting){video.preload='metadata';video.muted=true;video.play().catch(()=>{})}else video.pause()},{rootMargin:'100px'}).observe(video)});


// Editorial films load on approach. Inline films have only click-to-pause and optional progress.
document.querySelectorAll('[data-mux-film],[data-inline-film]').forEach(video=>{
 const inline=video.hasAttribute('data-inline-film');let userPaused=false,visible=false;
 async function play(){try{await ONCEMedia.ensure(video);if(visible&&!userPaused)await video.play()}catch(e){video.dataset.playbackError=e.message||e.name}}
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible){if(inline)play();else ONCEMedia.ensure(video).catch(()=>{})}else video.pause()},{threshold:.12}).observe(video);
 if(inline){
  video.controls=false;video.muted=true;video.loop=true;video.setAttribute('disablepictureinpicture','');video.setAttribute('controlslist','nodownload nofullscreen noremoteplayback');video.addEventListener('volumechange',()=>{if(!video.muted)video.muted=true});
  function toggle(){userPaused=!userPaused;if(userPaused)video.pause();else play();video.setAttribute('aria-label',userPaused?'Play film':'Pause film')}
  video.addEventListener('click',toggle);video.addEventListener('keydown',e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();toggle()}});
  if(video.hasAttribute('data-minimal-progress')){const progress=document.createElement('progress');progress.className='film-progress';progress.max=1;progress.value=0;progress.setAttribute('aria-label','Film progress');video.after(progress);video.addEventListener('timeupdate',()=>{progress.value=video.duration?video.currentTime/video.duration:0})}
 }
});
// About symbols share the same Colour Burst material as Apply and the home symbols.
document.querySelectorAll('[data-about-symbol]').forEach(el=>ONCEColourBurst.attach(el,el.querySelector('.about-symbol-burst')));
