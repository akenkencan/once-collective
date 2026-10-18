/* Controls belong to their visual; Community controls share one margin rail. */
(()=>{
 const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches,isCommunity=document.body.classList.contains('page-community'),isAbout=document.body.classList.contains('page-about'),isWelcome=!!document.querySelector('.studio-heading');
 if(isWelcome)return;
 const rails=[];let queued=false;
 function position(){queued=false;for(const {region,button} of rails){const r=region.getBoundingClientRect(),shown=region.getClientRects().length&&r.height>0&&r.bottom>0&&r.top<innerHeight;button.hidden=!shown;button.style.top=(r.top+r.height/2)+'px'}}
 function requestPosition(){if(!queued){queued=true;requestAnimationFrame(position)}}
 for(const event of ['scroll','resize'])window.addEventListener(event,requestPosition,{passive:true});
 function add(region,{gif,vector,global=false}={}){
  if(!region||region.hasAttribute('data-motion-control'))return;region.dataset.motionControl='';region.classList.add('motion-region');
  const button=document.createElement('button');button.type='button';button.className='motion-toggle'+(global?' motion-toggle-global':'')+(isCommunity?' motion-toggle-rail':'');
  let paused=false,still,held=[],vectorStill;
  function reflect(){button.setAttribute('aria-label',paused?'Play animation':'Pause animation');button.setAttribute('aria-pressed',String(paused));button.innerHTML=paused?'<svg viewBox="0 0 20 20" aria-hidden="true"><path d="m7 4 9 6-9 6Z"/></svg>':'<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7 5v10M13 5v10"/></svg>'}
  reflect();
  if(isCommunity){document.body.append(button);rails.push({region,button});new ResizeObserver(requestPosition).observe(region);requestPosition()}else region.append(button);
  function toggle(){
   paused=!paused;reflect();if(global&&paused)region.querySelectorAll('.text-row [style*="transform"]').forEach(el=>el.style.setProperty('--paused-transform',getComputedStyle(el).transform));region.classList.toggle('is-motion-paused',paused);
   [region,...region.querySelectorAll('[data-once-liquid],[data-oil-symbol],[data-about-symbol],[data-colour-burst]')].forEach(el=>{el.dataset.motionPaused=String(paused);el.dispatchEvent(new CustomEvent('once:motion',{detail:{paused}}))});
   if(paused){held=region.getAnimations({subtree:true}).filter(a=>a.playState==='running');held.forEach(a=>a.pause())}else{held.forEach(a=>a.play());held=[]}
   region.querySelectorAll('video').forEach(video=>{video.dataset.userPaused=String(paused);if(paused){video.dataset.wasPlaying=String(!video.paused);video.pause()}else if(video.dataset.wasPlaying==='true')video.play().catch(()=>{})});
   if(vector){if(paused){vectorStill=vector.cloneNode(true);vectorStill.removeAttribute('id');vectorStill.classList.add('motion-vector-still');vector.after(vectorStill);vector.style.visibility='hidden'}else{vectorStill?.remove();vector.style.visibility=''}}
   if(gif){if(paused){still=document.createElement('canvas');still.className='motion-still';const draw=()=>{if(paused&&gif.naturalWidth){still.width=gif.naturalWidth;still.height=gif.naturalHeight;still.getContext('2d').drawImage(gif,0,0)}};if(gif.complete)draw();else gif.addEventListener('load',draw,{once:true});gif.after(still);gif.style.visibility='hidden'}else{still?.remove();gif.style.visibility=''}}
  }
  button.addEventListener('click',event=>{event.stopPropagation();toggle()});if(gif){region.addEventListener('click',event=>{if(event.target===gif||event.target===still)toggle()});gif.style.cursor='pointer'}
  if(reduced)toggle();
 }
 document.querySelectorAll('[data-once-liquid]').forEach(region=>{if(!isAbout)add(region)});
 document.querySelectorAll('img[src*=".gif"]').forEach(gif=>{if(isCommunity&&gif.src.includes('CircleArray'))return;add(gif.closest('.community-art')||gif.parentElement,{gif})});
 if(!isCommunity)document.querySelectorAll('[data-animation-type="lottie"]').forEach(region=>{const vector=region.querySelector('svg');if(vector)add(region,{vector});else new MutationObserver((changes,observer)=>{const vector=region.querySelector('svg');if(vector){add(region,{vector});observer.disconnect()}}).observe(region,{childList:true,subtree:true})});
 document.querySelectorAll('video[loop]').forEach(video=>{if(isCommunity||video.hasAttribute('data-inline-film'))return;add(video.closest('figure')||video.parentElement)});
 if(document.querySelector('[data-oil-symbol]'))add(document.body,{global:true});
})();
