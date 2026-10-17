(() => {
 document.querySelectorAll('.application-body[id]').forEach(body=>{if(!body.querySelector('iframe'))return;for(const position of ['top','bottom']){const close=document.createElement('button');close.type='button';close.className='application-form-close form-close-'+position;close.dataset.closeApplication=body.id;close.textContent='Close −';position==='top'?body.prepend(close):body.append(close)}});
 let tallyReady,scrollTarget,scrollTimer;
 function alignApplication(body){scrollTarget=body;clearTimeout(scrollTimer);const align=()=>{if(scrollTarget===body&&!body.hidden)body.scrollIntoView({behavior:'smooth',block:'start'})};align();scrollTimer=setTimeout(align,1400)}
 for(const type of ['wheel','touchstart','keydown'])document.addEventListener(type,()=>{scrollTarget=null;clearTimeout(scrollTimer)},{passive:true});
 function setupTally(body){
  const frames=[...body.querySelectorAll('iframe[data-lazy-form]')].filter(f=>f.dataset.lazyForm.startsWith('https://tally.so/'));
  if(!frames.length)return;
  frames.forEach(f=>{f.removeAttribute('data-tally-src');f.setAttribute('scrolling','no');const resize=()=>{const h=parseFloat(f.style.height);if(h>100&&f.style.getPropertyValue('--form-content-height')!==h+'px'){f.style.setProperty('--form-content-height',h+'px');if(scrollTarget===body)alignApplication(body)}};new MutationObserver(resize).observe(f,{attributes:true,attributeFilter:['style']});resize()});
  tallyReady??=window.Tally?Promise.resolve():new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='/assets/js/tally.embed.js';script.onload=resolve;script.onerror=reject;document.head.append(script)});
  tallyReady.then(()=>window.Tally?.loadEmbeds()).catch(()=>{});
 }
 const toggles=[...document.querySelectorAll('[data-open-application]')];
 const transitions=new WeakMap();
 async function setOpen(id,open){const body=document.getElementById(id);if(!body)return;
  transitions.get(body)?.cancel();body.style.overflow='';
  toggles.filter(b=>b.dataset.openApplication===id).forEach(b=>b.setAttribute('aria-expanded',String(open)));
  const external=body.parentNode.querySelectorAll('.application-external');
  const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
  if(open){body.hidden=false;external.forEach(p=>p.hidden=false);setupTally(body);body.querySelectorAll('iframe[data-lazy-form]').forEach(f=>{if(!f.getAttribute('src'))f.src=f.dataset.lazyForm});
   if(body.querySelector('iframe[data-lazy-form*="tally.so"]'))setTimeout(()=>alignApplication(body),480);
   const anim=body.animate([{opacity:0,transform:'translateY(-24px)'},{opacity:1,transform:'none'}],{duration:reduced?0:450,easing:'cubic-bezier(.22,1,.36,1)'});transitions.set(body,anim);return;
  }
  body.querySelectorAll('video').forEach(video=>video.pause());if(body.hidden)return;
  body.style.overflow='hidden';const anim=body.animate([{height:body.getBoundingClientRect().height+'px',opacity:1,transform:'translateY(0)'},{height:'0px',opacity:0,transform:'translateY(-65px)'}],{duration:reduced?0:600,easing:'cubic-bezier(.22,1,.36,1)'});transitions.set(body,anim);
  try{await anim.finished;if(transitions.get(body)!==anim)return;body.hidden=true;body.style.overflow='';external.forEach(p=>p.hidden=true)}catch(e){}
 }
 document.querySelectorAll('[data-close-application]').forEach(button=>button.addEventListener('click',async()=>{
  const id=button.dataset.closeApplication,body=document.getElementById(id);body?.querySelectorAll('video').forEach(v=>v.pause());await setOpen(id,false);
  const opener=toggles.find(b=>b.dataset.openApplication===id);opener?.scrollIntoView({behavior:'smooth',block:'center'});opener?.focus({preventScroll:true});
 }));
 toggles.forEach(b=>b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();const body=document.getElementById(b.dataset.openApplication);setOpen(body.id,b.getAttribute('aria-expanded')!=='true')}));
 document.querySelectorAll('[data-scroll-application]').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();const target=document.getElementById(b.dataset.scrollApplication),body=target?.querySelector('.application-body')||document.getElementById(b.getAttribute('aria-controls'));if(body)setOpen(body.id,true);else target?.scrollIntoView({behavior:'smooth',block:'start'})}));
 const options=[...document.querySelectorAll('[data-contribution-tier]')],checkout=document.getElementById('patron-checkout');
 options.forEach(b=>b.addEventListener('click',()=>{
  const same=b.getAttribute('aria-expanded')==='true',slug=b.dataset.contributionTier;
  options.forEach(o=>o.setAttribute('aria-expanded','false'));setOpen('patron-checkout',!same);b.setAttribute('aria-expanded',String(!same));
  if(!same){const frame=checkout.querySelector('iframe'),amount=slug.startsWith('deep-significance')?'2500':slug.startsWith('belief-bond')?'':'10',params='?useTheme=true'+(amount?'&amount='+amount:''),src='https://opencollective.com/embed/once-collective/contribute/'+slug+params;
   if(frame.src!==src)frame.src=src;checkout.querySelector('a').href='https://opencollective.com/once-collective/contribute/'+slug+'/checkout'+params;}
 }));
})();
document.querySelectorAll('[data-ambient-video]').forEach(video=>{new IntersectionObserver(entries=>{if(entries[0].isIntersecting&&video.dataset.userPaused!=='true'){video.preload='metadata';video.muted=true;video.play().catch(()=>{})}else video.pause()},{rootMargin:'100px'}).observe(video)});


// Editorial films load on approach. Inline films have only click-to-pause and optional progress.
document.querySelectorAll('[data-mux-film],[data-inline-film]').forEach(video=>{
 const inline=video.hasAttribute('data-inline-film');let userPaused=false,visible=false,hasStopped=false;
 async function play(){try{await ONCEMedia.ensure(video);if(visible&&!userPaused&&video.dataset.userPaused!=='true')await video.play()}catch(e){video.dataset.playbackError=e.message||e.name}}
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible){if(inline)play();else ONCEMedia.ensure(video).catch(()=>{})}else video.pause()},{threshold:.12}).observe(video);
 if(inline){
  video.controls=false;video.muted=true;video.loop=true;video.setAttribute('disablepictureinpicture','');video.setAttribute('controlslist','nodownload nofullscreen noremoteplayback');
  function toggle(){userPaused=!userPaused;if(userPaused){hasStopped=true;video.pause()}else{video.muted=video.hasAttribute('data-silent-film')||!hasStopped;video.volume=video.hasAttribute('data-silent-film')?0:1;play()}video.setAttribute('aria-label',userPaused?'Play film':'Pause film')}
  video.addEventListener('click',toggle);video.addEventListener('keydown',e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();toggle()}});
  if(video.hasAttribute('data-minimal-progress')){const progress=document.createElement('progress');progress.className='film-progress';progress.max=1;progress.value=0;progress.setAttribute('aria-label','Film progress');video.after(progress);video.addEventListener('timeupdate',()=>{progress.value=video.duration?video.currentTime/video.duration:0})}
 }
});
// About symbols share the same Colour Burst material as Apply and the home symbols.
document.querySelectorAll('[data-about-symbol]').forEach(el=>ONCEColourBurst.attach(el,el.querySelector('.about-symbol-burst')));

// Reactive border around the square hero loop.
document.querySelectorAll('[data-border-burst]').forEach(el=>ONCEColourBurst.attach(el,el.querySelector('.hero-border-surface')));
// The photograph pins when its lower edge reaches the upper third of the screen;
// the following film then travels behind its opaque surface.
document.querySelectorAll('.world-media-stack').forEach(stack=>{
 const photo=stack.querySelector('.world-image'),image=photo.querySelector('img');
 const measure=()=>stack.style.setProperty('--stack-image-height',photo.getBoundingClientRect().height+'px');
 new ResizeObserver(measure).observe(photo);image.addEventListener('load',measure);measure();
});

// Found films remain silent, including native controls and enlarged playback.
document.querySelectorAll('video[data-silent-film]').forEach(video=>{video.muted=true;video.defaultMuted=true;video.volume=0;video.addEventListener('volumechange',()=>{if(!video.muted||video.volume!==0){video.muted=true;video.volume=0}})});
// Reflect native playback events for consistent media state across all page players.
document.querySelectorAll('video').forEach(video=>{
 video.addEventListener('playing',()=>video.dataset.playbackState='playing');
 video.addEventListener('pause',()=>video.dataset.playbackState='paused');
 video.addEventListener('volumechange',()=>video.dataset.audioState=video.muted||video.volume===0?'muted':'enabled');
});

// The Circle application film starts silently and gains audio on the first page click.
document.querySelectorAll('video[data-unmute-on-interaction]').forEach(video=>{
 document.addEventListener('click',event=>{video.muted=false;video.volume=1;video.dataset.audioState='enabled';if(event.target===video){event.preventDefault();event.stopPropagation();ONCEMedia.ensure(video).then(()=>video.play()).catch(error=>video.dataset.playbackError=error.message)}},{capture:true,once:true});
});

document.querySelectorAll('[data-social-symbol]').forEach(el=>ONCEColourBurst.attach(el,el.querySelector('.social-burst')));

// Email success is shown only after the configured receiver confirms storage.
document.querySelectorAll('[data-contact-email]').forEach(form=>{
 const status=form.querySelector('[role=status]'),submit=form.querySelector('[type=submit]');
 form.addEventListener('submit',async event=>{event.preventDefault();if(!form.reportValidity())return;submit.disabled=true;status.textContent='Saving…';
  const data=new FormData(form),mailingList=data.get('mailingList')==='on';
  try{const response=await fetch('/api/email-capture',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:data.get('email'),mailingList,website:data.get('website'),source:form.dataset.contactEmail})});if(!response.ok)throw new Error('Submission failed');const result=await response.json();if(!result.saved)throw new Error('Not saved');const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;await form.animate([{opacity:1},{opacity:0}],{duration:reduced?0:300,fill:'forwards'}).finished;const message=document.createElement('p');message.className='contact-email-success';message.setAttribute('role','status');message.textContent=mailingList?'Look out for updates in your inbox.':'Thank you. Your email has been received.';form.replaceWith(message)}catch(error){status.textContent='We couldn’t save your email. Please try again later.';submit.disabled=false}
 });
});
