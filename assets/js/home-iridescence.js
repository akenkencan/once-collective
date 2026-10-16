/* Word hover identifies one symbol; direct symbol hover reveals words in their measured slots. */
(()=>{
 const symbols=new Map(),plane=document.createElement('div');plane.className='home-reveal-plane';plane.setAttribute('aria-hidden','true');document.body.append(plane);
 let current=null,revealing=false,exitTimer,frame=0,pairs=[];
 document.querySelectorAll('[data-oil-symbol]').forEach(link=>{
  const api=ONCEColourBurst.attach(link,link.querySelector('.oil-face'));symbols.set(link.dataset.oilSymbol,{link,api});
  link.addEventListener('pointerenter',()=>enter(link.dataset.oilSymbol,true));link.addEventListener('pointerleave',leave);
  link.addEventListener('focus',()=>enter(link.dataset.oilSymbol,true));link.addEventListener('blur',leave);
 });
 function restore(){for(const item of pairs){item.source.style.translate=item.translate;item.source.style.scale=item.scale;item.source.style.transformOrigin=item.origin}}
 function align(){
  if(!revealing)return;
  const margin=Math.max(16,innerWidth*.018),centre=innerWidth/2,clearance=Math.max(72,innerHeight*.115),lane=centre-clearance-margin-(innerWidth>=992?85:0),gap=18;
  const rows=new Map();
  for(const item of pairs){const r=item.source.getBoundingClientRect(),scale=item.appliedScale||1;item.base={x:r.x-(item.dx||0),y:r.y-(item.dy||0),width:r.width/scale,height:r.height/scale};if(!rows.has(item.row))rows.set(item.row,[]);rows.get(item.row).push(item)}
  for(const [rowIndex,items] of rows){
   items.sort((a,b)=>a.base.x-b.base.x);let best;
   for(let split=0;split<=items.length;split++){
    const groups=[items.slice(0,split),items.slice(split)];const preferred=[1,1,0,0,1,0][rowIndex];let cost=0,plans=[];
    groups.forEach((group,side)=>{if(!group.length)return;const total=group.reduce((sum,item)=>sum+item.base.width,0),factor=Math.min(1,(lane-gap*(group.length-1))/total),used=total*factor+gap*(group.length-1),start=side?centre+clearance:margin,desired=group.reduce((sum,item)=>sum+item.base.x,0)/group.length,x0=Math.max(start,Math.min(start+lane-used,desired));let x=x0;
     group.forEach(item=>{if(side!==preferred)cost+=innerWidth*1.5;cost+=Math.abs(x-item.base.x)+Math.abs(1-factor)*200;plans.push({item,x,factor});x+=item.base.width*factor+gap})});
    if(!best||cost<best.cost)best={cost,plans};
   }
   for(const {item,x,factor} of best.plans){const y=Math.max(12,Math.min(innerHeight-item.base.height*factor-12,item.base.y));item.dx=x-item.base.x;item.dy=y-item.base.y;item.appliedScale=factor;item.source.style.transformOrigin='0 0';item.source.style.scale=String(factor);item.source.style.translate=item.dx+'px '+item.dy+'px';const r=item.source.getBoundingClientRect();item.word.style.fontSize=item.font*factor+'px';item.word.style.lineHeight=item.line*factor+'px';item.word.style.letterSpacing=item.letter*factor+'px';item.word.style.left=r.left+'px';item.word.style.top=r.top+'px';item.word.style.width=r.width+'px';item.word.style.height=r.height+'px'}
  }
  frame=requestAnimationFrame(align);
 }
 function show(name){
  cancelAnimationFrame(frame);restore();plane.replaceChildren();pairs=[];
  const rows=['first','second','third','fourth','fifth','sixth'];
  document.querySelectorAll('.fullscreen-section:not(.overlay) [data-symbol-word="'+name+'"]').forEach(source=>{
   const r=source.getBoundingClientRect();if(r.right<=0||r.left>=innerWidth||r.bottom<=0||r.top>=innerHeight)return;
   const css=getComputedStyle(source),word=document.createElement('span'),row=source.closest('.text-row'),index=rows.findIndex(n=>row.classList.contains(n));
   word.className='home-reveal-word';word.textContent=source.textContent;word.style.fontFamily=css.fontFamily;word.style.fontSize=css.fontSize;word.style.fontWeight=css.fontWeight;word.style.lineHeight=css.lineHeight;word.style.letterSpacing=css.letterSpacing;
   plane.append(word);pairs.push({source,word,row:index,font:Number(css.fontSize.replace('px','')),line:Number(css.lineHeight.replace('px',''))||Number(css.fontSize.replace('px',''))*1.2,letter:Number(css.letterSpacing.replace('px',''))||0,translate:source.style.translate,scale:source.style.scale,origin:source.style.transformOrigin});
   word.animate([{opacity:0,filter:'blur(32px)',transform:'scale(.78) translateY(12px)'},{opacity:1,filter:'blur(0px)',transform:'scale(1) translateY(0)'}],{duration:matchMedia('(prefers-reduced-motion:reduce)').matches?0:1100,delay:Math.min(index,5-index)*110,easing:'cubic-bezier(.16,1,.3,1)',fill:'both'});
  });plane.classList.add('is-visible');align();
 }
 function enter(name,reveal=false){
  clearTimeout(exitTimer);if(current===name&&revealing===reveal)return;if(current&&current!==name)reset(current);current=name;revealing=reveal;
  const item=symbols.get(name);if(!item)return;delete document.body.dataset.keyboardSymbol;delete document.body.dataset.wordSymbol;
  if(reveal){document.body.dataset.keyboardSymbol=name;show(name)}else{document.body.dataset.wordSymbol=name;restore();plane.classList.remove('is-visible');cancelAnimationFrame(frame)}
  item.link.classList.remove('is-retreating');item.link.classList.add('is-energized');item.api.on();
 }
 function reset(name){const item=symbols.get(name);if(!item)return;item.link.classList.remove('is-energized');item.link.classList.add('is-retreating');setTimeout(()=>{if(current!==name){item.link.classList.remove('is-retreating');item.api.off()}},650)}
 function leave(){clearTimeout(exitTimer);exitTimer=setTimeout(()=>{const old=current;current=null;revealing=false;cancelAnimationFrame(frame);restore();plane.classList.remove('is-visible');delete document.body.dataset.keyboardSymbol;delete document.body.dataset.wordSymbol;if(old)reset(old)},100)}
 document.querySelectorAll('[data-symbol-word]').forEach(word=>{word.addEventListener('pointerenter',()=>enter(word.dataset.symbolWord));word.addEventListener('pointerleave',leave)});
})();
