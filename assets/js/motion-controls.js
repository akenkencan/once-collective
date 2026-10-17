/* One small control per animated visual; GIFs also toggle by clicking their image. */
(()=>{
 const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
 function add(region,{gif,vector,global=false}={}){
  if(!region||region.dataset.motionControl)return;region.dataset.motionControl='';region.classList.add('motion-region');
  const button=document.createElement('button');button.type='button';button.className='motion-toggle'+(global?' motion-toggle-global':'');button.setAttribute('aria-label','Pause animation');button.setAttribute('aria-pressed','false');button.innerHTML='<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7 5v10M13 5v10"/></svg>';region.append(button);
  let paused=false,still,held=[],vectorStill;
  function toggle(){
   paused=!paused;button.setAttribute('aria-label',paused?'Play animation':'Pause animation');button.setAttribute('aria-pressed',String(paused));button.innerHTML=paused?'<svg viewBox="0 0 20 20" aria-hidden="true"><path d="m7 4 9 6-9 6Z"/></svg>':'<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7 5v10M13 5v10"/></svg>';
   if(global&&paused)region.querySelectorAll('.text-row [style*="transform"]').forEach(el=>el.style.setProperty('--paused-transform',getComputedStyle(el).transform));
   region.classList.toggle('is-motion-paused',paused);
   [region,...region.querySelectorAll('[data-once-liquid],[data-oil-symbol],[data-about-symbol],[data-colour-burst]')].forEach(el=>el.dispatchEvent(new CustomEvent('once:motion',{detail:{paused}})));
   if(paused){held=region.getAnimations({subtree:true}).filter(a=>a.playState==='running');held.forEach(a=>a.pause())}else{held.forEach(a=>a.play());held=[]}
   const videos=region.querySelectorAll('video');videos.forEach(video=>{video.dataset.userPaused=String(paused);if(paused){video.dataset.wasPlaying=String(!video.paused);video.pause()}else if(video.dataset.wasPlaying==='true')video.play().catch(()=>{})});
   if(vector){if(paused){vectorStill=vector.cloneNode(true);vectorStill.removeAttribute('id');vectorStill.classList.add('motion-vector-still');vector.after(vectorStill);vector.style.visibility='hidden'}else{vectorStill?.remove();vector.style.visibility=''}}
   if(gif){if(paused){still=document.createElement('canvas');still.width=gif.naturalWidth;still.height=gif.naturalHeight;still.className='motion-still';const draw=()=>{if(paused&&gif.naturalWidth){still.width=gif.naturalWidth;still.height=gif.naturalHeight;still.getContext('2d').drawImage(gif,0,0)}};if(gif.complete)draw();else gif.addEventListener('load',draw,{once:true});gif.after(still);gif.style.visibility='hidden'}else{still?.remove();gif.style.visibility=''}}
  }
  button.addEventListener('click',event=>{event.stopPropagation();toggle()});if(gif){region.addEventListener('click',event=>{if(event.target===gif||event.target===still)toggle()});gif.style.cursor='pointer'}
  if(reduced)toggle();
 }
 document.querySelectorAll('[data-once-liquid]').forEach(region=>add(region));
 document.querySelectorAll('img[src*=".gif"]').forEach(gif=>{const region=gif.closest('.community-art')||gif.parentElement;add(region,{gif})});
 document.querySelectorAll('[data-animation-type="lottie"]').forEach(region=>{const vector=region.querySelector('svg');if(vector)add(region,{vector});else new MutationObserver((changes,observer)=>{const vector=region.querySelector('svg');if(vector){add(region,{vector});observer.disconnect()}}).observe(region,{childList:true,subtree:true})});
 document.querySelectorAll('.framed-reveal,#symset-react,.hero-art,.cards-context').forEach(region=>add(region));
 document.querySelectorAll('video[loop]').forEach(video=>{const region=video.closest('figure')||video.parentElement;add(region)});
 if(document.querySelector('[data-oil-symbol]'))add(document.body,{global:true});
})();