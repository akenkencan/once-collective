/* Word hover identifies one symbol; direct symbol hover reveals words in their measured slots. */
(()=>{
 const symbols=new Map(),plane=document.createElement('div');plane.className='home-reveal-plane';plane.setAttribute('aria-hidden','true');document.body.append(plane);
 let current=null,revealing=false,exitTimer,frame=0,pairs=[];
 document.querySelectorAll('[data-oil-symbol]').forEach(link=>{
  const api=ONCEColourBurst.attach(link,link.querySelector('.oil-face'));symbols.set(link.dataset.oilSymbol,{link,api});
  link.addEventListener('pointerenter',()=>enter(link.dataset.oilSymbol,true));link.addEventListener('pointerleave',leave);
  link.addEventListener('focus',()=>enter(link.dataset.oilSymbol,true));link.addEventListener('blur',leave);
 });
 function align(){if(!revealing)return;for(const {source,word} of pairs){const r=source.getBoundingClientRect();word.style.left=r.left+'px';word.style.top=r.top+'px';word.style.width=r.width+'px';word.style.height=r.height+'px'}frame=requestAnimationFrame(align)}
 function show(name){
  cancelAnimationFrame(frame);plane.replaceChildren();pairs=[];
  const rows=['first','second','third','fourth','fifth','sixth'];
  document.querySelectorAll('.fullscreen-section:not(.overlay) [data-symbol-word="'+name+'"]').forEach(source=>{
   const r=source.getBoundingClientRect();if(r.right<=0||r.left>=innerWidth||r.bottom<=0||r.top>=innerHeight)return;
   const css=getComputedStyle(source),word=document.createElement('span'),row=source.closest('.text-row'),index=rows.findIndex(n=>row.classList.contains(n));
   word.className='home-reveal-word';word.textContent=source.textContent;word.style.fontFamily=css.fontFamily;word.style.fontSize=css.fontSize;word.style.fontWeight=css.fontWeight;word.style.lineHeight=css.lineHeight;word.style.letterSpacing=css.letterSpacing;
   plane.append(word);pairs.push({source,word});
   word.animate([{opacity:0,filter:'blur(32px)',transform:'translateY(12px)'},{opacity:1,filter:'blur(0px)',transform:'translateY(0)'}],{duration:matchMedia('(prefers-reduced-motion:reduce)').matches?0:1100,delay:Math.min(index,5-index)*110,easing:'cubic-bezier(.16,1,.3,1)',fill:'both'});
  });plane.classList.add('is-visible');align();
 }
 function enter(name,reveal=false){
  clearTimeout(exitTimer);if(current===name&&revealing===reveal)return;if(current&&current!==name)reset(current);current=name;revealing=reveal;
  const item=symbols.get(name);if(!item)return;delete document.body.dataset.keyboardSymbol;delete document.body.dataset.wordSymbol;
  if(reveal){document.body.dataset.keyboardSymbol=name;show(name)}else{document.body.dataset.wordSymbol=name;plane.classList.remove('is-visible');cancelAnimationFrame(frame)}
  item.link.classList.remove('is-retreating');item.link.classList.add('is-energized');item.api.on();
 }
 function reset(name){const item=symbols.get(name);if(!item)return;item.link.classList.remove('is-energized');item.link.classList.add('is-retreating');setTimeout(()=>{if(current!==name){item.link.classList.remove('is-retreating');item.api.off()}},650)}
 function leave(){clearTimeout(exitTimer);exitTimer=setTimeout(()=>{const old=current;current=null;revealing=false;cancelAnimationFrame(frame);plane.classList.remove('is-visible');delete document.body.dataset.keyboardSymbol;delete document.body.dataset.wordSymbol;if(old)reset(old)},100)}
 document.querySelectorAll('[data-symbol-word]').forEach(word=>{word.addEventListener('pointerenter',()=>enter(word.dataset.symbolWord));word.addEventListener('pointerleave',leave)});
})();
