(() => {
 let tallyReady,scrollTarget,scrollTimer;
 const toggles=[...document.querySelectorAll('[data-open-application]')],transitions=new WeakMap(),clips=new WeakMap(),requests=new WeakMap();
 const reduced=()=>matchMedia('(prefers-reduced-motion:reduce)').matches;
 function alignApplication(body){
  scrollTarget=body;clearTimeout(scrollTimer);
  const align=()=>{if(scrollTarget!==body||body.hidden)return;const opener=toggles.find(b=>b.dataset.openApplication===body.id);let top;
   if(body.id==='community-form-body')top=scrollY+body.getBoundingClientRect().top-innerHeight*.5;
   else top=scrollY+(opener||body).getBoundingClientRect().top-innerHeight*.3;
   window.scrollTo({top:Math.max(0,top),behavior:reduced()?'instant':'smooth'});
  };align();scrollTimer=setTimeout(align,1300);
 }
 for(const type of ['wheel','touchstart','keydown'])document.addEventListener(type,()=>{scrollTarget=null;clearTimeout(scrollTimer)},{passive:true});
 function setupTally(body){
  const frames=[...body.querySelectorAll('iframe[data-lazy-form]')].filter(f=>f.dataset.lazyForm.startsWith('https://tally.so/'));if(!frames.length)return;
  frames.forEach(f=>{f.removeAttribute('data-tally-src');f.setAttribute('scrolling','no');if(f.dataset.resizeReady)return;f.dataset.resizeReady='true';const resize=()=>{const h=parseFloat(f.style.height);if(h>100&&f.style.getPropertyValue('--form-content-height')!==h+'px'){f.style.setProperty('--form-content-height',h+'px');if(scrollTarget===body)alignApplication(body)}};new MutationObserver(resize).observe(f,{attributes:true,attributeFilter:['style']});resize()});
  tallyReady??=window.Tally?Promise.resolve():new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='/assets/js/tally.embed.js';script.onload=resolve;script.onerror=reject;document.head.append(script)});tallyReady.then(()=>window.Tally?.loadEmbeds()).catch(()=>{});
 }
 function clipFor(body){if(clips.has(body))return clips.get(body);const clip=document.createElement('div');clip.className='application-reveal-clip';body.before(clip);clip.append(body);clips.set(body,clip);return clip}
 async function setOpen(id,open){
  const body=document.getElementById(id);if(!body)return;if(open&&body.classList.contains('contact-socials'))document.dispatchEvent(new CustomEvent('once:social-opening'));const request=(requests.get(body)||0)+1;requests.set(body,request);if(open&&id==='connected-application-body'){const detail={id,waits:[]};document.dispatchEvent(new CustomEvent('once:application-opening',{detail}));await Promise.all(detail.waits);if(requests.get(body)!==request)return;}const clip=clipFor(body),previous=transitions.get(body),from=body.hidden?0:clip.getBoundingClientRect().height;previous?.forEach(a=>a.cancel());
  toggles.filter(b=>b.dataset.openApplication===id).forEach(b=>b.setAttribute('aria-expanded',String(open)));body.dataset.disclosureOpen=String(open);
  const external=clip.parentNode.querySelectorAll('.application-external');
  if(open){body.hidden=false;external.forEach(p=>p.hidden=false);setupTally(body);body.querySelectorAll('iframe[data-lazy-form]').forEach(f=>{if(!f.getAttribute('src'))f.src=f.dataset.lazyForm})}
  else{scrollTarget=null;clearTimeout(scrollTimer);body.querySelectorAll('video').forEach(v=>v.pause());if(body.hidden)return}
  clip.style.overflow='visible';clip.style.clipPath='inset(0 -100vmax -100vmax -100vmax)';const height=body.getBoundingClientRect().height,time=reduced()?0:700,easing=open?'cubic-bezier(.22,1,.36,1)':'cubic-bezier(.6,0,.35,1)';
  const slide=body.animate([{transform:open?'translateY(-100%)':'none'},{transform:open?'none':'translateY(-100%)'}],{duration:time,easing,fill:'forwards'}),size=clip.animate([{height:from+'px'},{height:(open?height:0)+'px'}],{duration:time,easing,fill:'forwards'}),run=[slide,size];transitions.set(body,run);
  document.dispatchEvent(new CustomEvent('once:contact-layout'));
  if(open&&body.querySelector('iframe[data-lazy-form*="tally.so"]'))setTimeout(()=>{if(body.dataset.disclosureOpen==='true')alignApplication(body)},time);
  try{await size.finished;if(transitions.get(body)!==run)return;if(!open){body.hidden=true;external.forEach(p=>p.hidden=true)}run.forEach(a=>a.cancel());clip.style.overflow='';document.dispatchEvent(new CustomEvent('once:contact-layout'))}catch(error){}
 }
 document.addEventListener('once:email-opening',()=>{document.querySelectorAll('.contact-socials').forEach(body=>{if(!body.hidden)setOpen(body.id,false)})});
 document.addEventListener('once:pitch-opening',event=>{const body=document.getElementById('connected-application-body');if(body&&!body.hidden)event.detail.waits.push(setOpen(body.id,false))});
 document.querySelectorAll('[data-close-application]').forEach(button=>button.addEventListener('click',async()=>{const id=button.dataset.closeApplication;await setOpen(id,false);const opener=toggles.find(b=>b.dataset.openApplication===id)||document.querySelector('[data-contribution-tier][aria-expanded="true"]');if(id==='patron-checkout')document.querySelectorAll('[data-contribution-tier]').forEach(b=>b.setAttribute('aria-expanded','false'));opener?.focus({preventScroll:true});opener?.scrollIntoView({behavior:'smooth',block:'center'})}));
 toggles.forEach(b=>b.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();setOpen(b.dataset.openApplication,b.getAttribute('aria-expanded')!=='true')}));
 document.querySelectorAll('[data-scroll-application]').forEach(b=>b.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();const target=document.getElementById(b.dataset.scrollApplication),body=target?.querySelector('.application-body')||document.getElementById(b.getAttribute('aria-controls'));if(body)setOpen(body.id,true)}));
 const options=[...document.querySelectorAll('[data-contribution-tier]')],checkout=document.getElementById('patron-checkout');
 options.forEach(b=>b.addEventListener('click',()=>{const same=b.getAttribute('aria-expanded')==='true',slug=b.dataset.contributionTier;options.forEach(o=>o.setAttribute('aria-expanded','false'));setOpen('patron-checkout',!same);b.setAttribute('aria-expanded',String(!same));if(!same){const frame=checkout.querySelector('iframe'),amount=slug.startsWith('deep-significance')?'2500':slug.startsWith('belief-bond')?'':'10',params='?useTheme=true'+(amount?'&amount='+amount:''),src='https://opencollective.com/embed/once-collective/contribute/'+slug+params;if(frame.src!==src)frame.src=src;checkout.querySelector('a').href='https://opencollective.com/once-collective/contribute/'+slug+'/checkout'+params}}));
 const copy=document.querySelector('.about-editorial-copy'),art=document.querySelector('.about-main-art img');if(copy&&art){let height=copy.getBoundingClientRect().height;new ResizeObserver(()=>{const next=copy.getBoundingClientRect().height;if(Math.abs(next-height)>12){art.animate([{transform:'translateY('+Math.min(55,Math.abs(next-height)*.2)*(next>height?-1:1)+'px)'},{transform:'translateY(0)'}],{duration:reduced()?0:850,easing:'cubic-bezier(.22,1,.36,1)'});height=next}}).observe(copy)}
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

document.querySelectorAll('[data-social-symbol]').forEach(el=>ONCEColourBurst.attach(el,el.querySelector('.social-burst')));

// Email success is shown only after the configured receiver confirms storage.
document.querySelectorAll('[data-contact-email]').forEach(form=>{
 const status=form.querySelector('[role=status]'),submit=form.querySelector('[type=submit]');
 form.addEventListener('submit',async event=>{event.preventDefault();if(!form.reportValidity())return;submit.disabled=true;status.textContent='Saving…';
  const data=new FormData(form),mailingList=data.get('mailingList')==='on';
  try{const response=await fetch('/api/email-capture',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:data.get('email'),mailingList,website:data.get('website'),source:form.dataset.contactEmail})});if(!response.ok)throw new Error('Submission failed');const result=await response.json();if(!result.saved)throw new Error('Not saved');const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;await form.animate([{opacity:1},{opacity:0}],{duration:reduced?0:300,fill:'forwards'}).finished;const message=document.createElement('p');message.className='contact-email-success';message.setAttribute('role','status');message.textContent=mailingList?'Look out for updates in your inbox.':'Thank you. Your email has been received.';form.replaceWith(message)}catch(error){status.textContent='We couldn’t save your email. Please try again later.';submit.disabled=false}
 });
});

(()=>{const paper=document.querySelector('.about-artefact-stage');if(!paper)return;function align(){paper.style.setProperty('--paper-origin','0px');paper.style.setProperty('--paper-origin',paper.getBoundingClientRect().left+'px')}new ResizeObserver(align).observe(paper.parentElement);window.addEventListener('resize',align);align()})();
