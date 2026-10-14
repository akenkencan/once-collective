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

// Public Mux films: lazy streaming, native controls, and no credentials in the browser.
document.querySelectorAll('[data-mux-film]').forEach(video=>{
 let loaded=false;function load(){if(loaded)return;loaded=true;if(video.canPlayType('application/vnd.apple.mpegurl'))video.src=video.dataset.hls;else if(window.Hls?.isSupported()){const hls=new Hls();hls.loadSource(video.dataset.hls);hls.attachMedia(video)}else video.src=video.dataset.hls}
 const io=new IntersectionObserver(entries=>{if(entries[0].isIntersecting){load();io.disconnect()}},{rootMargin:'300px'});io.observe(video);video.addEventListener('pointerdown',load,{once:true});
});
// Scroll reveals own their opacity; removed Webflow timelines cannot leave copy hidden.
document.querySelectorAll('.concept-page .section-8>*').forEach(el=>{
 el.classList.add('concept-scroll-reveal');const io=new IntersectionObserver(entries=>{if(entries[0].isIntersecting){el.classList.add('is-visible');io.disconnect()}},{threshold:.15});io.observe(el);
});
