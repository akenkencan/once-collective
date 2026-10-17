/* A local PDF.js slide viewer shared by the Arkhive and patronage pitches. */

const reduced=()=>matchMedia('(prefers-reduced-motion:reduce)').matches;
const duration=()=>reduced()?0:550;
const downloadIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/></svg>';
for(const button of document.querySelectorAll('[data-pitch-src]')){
 const dock=document.getElementById(button.dataset.pitchDock),title=button.dataset.pitchTitle;
 const dialog=document.createElement('dialog');dialog.className='pitch-dialog';dialog.setAttribute('aria-label',title);document.body.append(dialog);
 const reader=document.createElement('section');reader.className='pitch-reader';reader.setAttribute('aria-label',title);reader.dataset.mode='hidden';
 reader.innerHTML='<header class="pitch-toolbar"><strong></strong><div class="pitch-tools"><button type="button" data-pitch-expand aria-label="Expand pitch">⤢</button><a class="pitch-download" download aria-label="Download '+title+'" title="Download PDF">'+downloadIcon+'</a><button type="button" data-pitch-minimize aria-label="Minimise pitch">−</button></div></header><div class="pitch-stage" tabindex="0" role="button" aria-label="Expand pitch preview"><img class="pitch-slide" alt="" decoding="async"/><p class="pitch-status" role="status">Loading pitch…</p></div><footer class="pitch-pagination"><button type="button" data-pitch-prev aria-label="Previous slide">←</button><span aria-live="polite">1</span><button type="button" data-pitch-next aria-label="Next slide">→</button></footer>';
 reader.querySelector('strong').textContent=title;reader.querySelector('a').href=button.dataset.pitchSrc;dock.append(reader);
 const stage=reader.querySelector('.pitch-stage'),image=reader.querySelector('.pitch-slide'),status=reader.querySelector('.pitch-status'),counter=reader.querySelector('.pitch-pagination span'),prev=reader.querySelector('[data-pitch-prev]'),next=reader.querySelector('[data-pitch-next]');
 const deck=button.dataset.pitchSrc.includes('arkhive')?'arkhive':'patronage',pdf={numPages:deck==='arkhive'?15:21};
 let page=1,rendering=0;reader.dataset.pages=String(pdf.numPages);
 const slideURL=n=>'/assets/pitches/slides/'+deck+'/slide-'+String(n).padStart(2,'0')+'.webp';
 async function load(){return pdf}
 async function render(){const run=++rendering;status.hidden=false;status.textContent='Loading slide…';image.alt=title+', slide '+page;
  try{const nextImage=new Image();nextImage.src=slideURL(page);await nextImage.decode();if(run!==rendering)return;image.src=nextImage.src;image.width=nextImage.naturalWidth;image.height=nextImage.naturalHeight;reader.style.setProperty('--pitch-ratio',nextImage.naturalWidth+'/'+nextImage.naturalHeight);status.hidden=true;counter.textContent=page+' / '+pdf.numPages;prev.disabled=page<=1;next.disabled=page>=pdf.numPages;reader.dataset.page=String(page);if(page<pdf.numPages){const preload=new Image();preload.src=slideURL(page+1)}}catch(error){status.textContent='Preview unavailable. Download the PDF using the toolbar.';reader.dataset.error=error.message}}
 // Fetch only the small first slide as the action approaches the viewport.
 const preloadObserver=new IntersectionObserver(entries=>{if(entries[0].isIntersecting){const preview=new Image();preview.src=slideURL(1);preloadObserver.disconnect()}},{rootMargin:'400px'});preloadObserver.observe(button);
 function expand(){if(dialog.open)return;const wasDocked=reader.dataset.mode==='docked',from=wasDocked?reader.getBoundingClientRect():null;dock.hidden=true;dialog.append(reader);reader.dataset.mode='expanded';dialog.showModal();button.setAttribute('aria-expanded','true');const to=reader.getBoundingClientRect();reader.animate(from?[{transformOrigin:'0 0',transform:`translate(${from.x-to.x}px,${from.y-to.y}px) scale(${from.width/to.width},${from.height/to.height})`,opacity:.65},{transformOrigin:'0 0',transform:'none',opacity:1}]:[{transform:'translateY(35px) scale(.96)',opacity:0},{transform:'none',opacity:1}],{duration:duration(),easing:'cubic-bezier(.22,1,.36,1)'});render();reader.querySelector('[data-pitch-minimize]').focus({preventScroll:true})}
 function minimize(){if(!dialog.open)return;const from=reader.getBoundingClientRect();dialog.close();dock.hidden=false;dock.append(reader);reader.dataset.mode='docked';button.setAttribute('aria-expanded','false');const to=reader.getBoundingClientRect();reader.animate([{transformOrigin:'0 0',transform:`translate(${from.x-to.x}px,${from.y-to.y}px) scale(${from.width/to.width},${from.height/to.height})`,opacity:1},{transformOrigin:'0 0',transform:'none',opacity:1}],{duration:duration(),easing:'cubic-bezier(.22,1,.36,1)'});render();stage.focus({preventScroll:true})}
 function dismiss(){if(reader.dataset.mode!=='hidden')toggleDock(true)}
 let dockAnimation,slideAnimation,dockRevision=0;
 async function toggleDock(forceClose=false){
  const revision=++dockRevision,closing=forceClose||reader.dataset.mode!=='hidden';
  dockAnimation?.cancel();slideAnimation?.cancel();
  if(dialog.open)dialog.close();dock.append(reader);
  if(closing){
   reader.dataset.mode='closing';button.setAttribute('aria-expanded','false');
   const height=dock.getBoundingClientRect().height;
   slideAnimation=reader.animate([{transform:'none',opacity:1},{transform:'translateY(-100%)',opacity:0}],{duration:duration(),easing:'cubic-bezier(.65,0,.35,1)',fill:'forwards'});
   dockAnimation=dock.animate([{height:height+'px'},{height:'0px'}],{duration:duration(),easing:'cubic-bezier(.65,0,.35,1)',fill:'forwards'});
   try{await dockAnimation.finished;if(revision!==dockRevision)return;dock.hidden=true;reader.dataset.mode='hidden';slideAnimation.cancel();dockAnimation.cancel();++rendering}catch(error){}
  }else{
   dock.hidden=false;reader.dataset.mode='docked';button.setAttribute('aria-expanded','true');render();
   const height=reader.getBoundingClientRect().height;
   window.scrollTo({top:window.scrollY+button.getBoundingClientRect().top-20,behavior:reduced()?'instant':'smooth'});
   dockAnimation=dock.animate([{height:'0px'},{height:height+'px'}],{duration:duration(),easing:'cubic-bezier(.22,1,.36,1)',fill:'forwards'});
   slideAnimation=reader.animate([{transform:'translateY(-100%)',opacity:0},{transform:'none',opacity:1}],{duration:duration(),easing:'cubic-bezier(.22,1,.36,1)',fill:'forwards'});
   try{await dockAnimation.finished;if(revision===dockRevision){dockAnimation.cancel();slideAnimation.cancel()}}catch(error){}
  }
 }
 button.addEventListener('click',()=>toggleDock());reader.querySelector('[data-pitch-expand]').addEventListener('click',expand);reader.querySelector('[data-pitch-minimize]').addEventListener('click',()=>dialog.open?minimize():toggleDock(true));
 stage.addEventListener('click',()=>{if(!dialog.open)expand()});stage.addEventListener('keydown',event=>{if(!dialog.open&&(event.key==='Enter'||event.key===' ')){event.preventDefault();expand()}});
 async function change(delta){await load();page=Math.max(1,Math.min(pdf.numPages,page+delta));render()}
 prev.addEventListener('click',()=>change(-1));next.addEventListener('click',()=>change(1));
 dialog.addEventListener('cancel',event=>{event.preventDefault();minimize()});dialog.addEventListener('click',event=>{if(event.target===dialog)minimize()});
 dialog.addEventListener('keydown',event=>{if(event.key==='ArrowRight'){event.preventDefault();change(1)}if(event.key==='ArrowLeft'){event.preventDefault();change(-1)}});
 document.addEventListener('click',event=>{const action=event.target.closest('button,[data-open-application],[data-scroll-application]');if(action&&action!==button&&!reader.contains(action))dismiss()},true);
 let resize;new ResizeObserver(()=>{clearTimeout(resize);resize=setTimeout(()=>{if(reader.dataset.mode!=='hidden')render()},100)}).observe(stage);
}
