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
  const margin=Math.max(16,innerWidth*.018),centre=innerWidth/2,clearance=Math.max(72,innerHeight*.115),lane=centre-clearance-margin,gap=18;
  const rows=new Map();
  for(const item of pairs){const r=item.source.getBoundingClientRect(),scale=item.appliedScale||1;item.base={x:r.x-(item.dx||0),y:r.y-(item.dy||0),width:r.width/scale,height:r.height/scale};if(!rows.has(item.row))rows.set(item.row,[]);rows.get(item.row).push(item)}
  for(const [rowIndex,items] of rows){
   items.sort((a,b)=>a.base.x-b.base.x);
   const hash=[...current].reduce((v,c)=>v+c.charCodeAt(0),0)+rowIndex*17;
   const plans=items.map((item,i)=>{const side=items.length>1?i:(hash%2),factor=Math.min(1,lane/item.base.width),width=item.base.width*factor,start=side?centre+clearance:margin,spread=((hash*13+i*29)%101)/100,x=start+(lane-width)*spread;return {item,x,factor}});
   const best={plans};
   for(const {item,x,factor} of best.plans){const y=Math.max(12,Math.min(innerHeight-item.base.height*factor-12,item.base.y));item.dx=x-item.base.x;item.dy=y-item.base.y;item.appliedScale=factor;const r={left:x,top:y,width:item.base.width*factor,height:item.base.height*factor};item.word.style.fontSize=item.font*factor+'px';item.word.style.lineHeight=item.line*factor+'px';item.word.style.letterSpacing=item.letter*factor+'px';item.word.style.left=r.left+'px';item.word.style.top=r.top+'px';item.word.style.width=r.width+'px';item.word.style.height=r.height+'px'}
  }

 }
 function show(name){
  cancelAnimationFrame(frame);restore();plane.replaceChildren();pairs=[];
  const rows=['first','second','third','fourth','fifth','sixth'];
  const candidates=[];
  for(const rowName of rows){
   const all=[...document.querySelectorAll('.fullscreen-section:not(.overlay) .text-row.'+rowName+' [data-symbol-word="'+name+'"]')];
   const unique=new Map();all.sort((a,b)=>{const score=e=>{const r=e.getBoundingClientRect();return r.right>0&&r.left<innerWidth?0:1};return score(a)-score(b)}).forEach(e=>{if(!unique.has(e.textContent.trim()))unique.set(e.textContent.trim(),e)});
   candidates.push(...[...unique.values()].slice(0,innerWidth<800?1:2));
  }
  candidates.forEach(source=>{
   const css=getComputedStyle(source),word=document.createElement('span'),row=source.closest('.text-row'),index=rows.findIndex(n=>row.classList.contains(n));
   word.className='home-reveal-word';word.textContent=source.textContent;word.style.fontFamily=css.fontFamily;word.style.fontSize=css.fontSize;word.style.fontWeight=css.fontWeight;word.style.lineHeight=css.lineHeight;word.style.letterSpacing=css.letterSpacing;
   plane.append(word);pairs.push({source,word,row:index,font:Number(css.fontSize.replace('px','')),line:Number(css.lineHeight.replace('px',''))||Number(css.fontSize.replace('px',''))*1.2,letter:Number(css.letterSpacing.replace('px',''))||0,translate:source.style.translate,scale:source.style.scale,origin:source.style.transformOrigin});
   word.animate([{opacity:0,filter:'blur(30px)',transform:'scale(.80)',offset:0},{opacity:.85,filter:'blur(9px)',transform:'scale(.985)',offset:.48},{opacity:1,filter:'blur(0px)',transform:'scale(1)',offset:1}],{duration:matchMedia('(prefers-reduced-motion:reduce)').matches||document.body.classList.contains('is-motion-paused')?0:1450,delay:Math.min(index,5-index)*65,easing:'cubic-bezier(.16,1,.3,1)',fill:'both'});
  });plane.classList.add('is-visible');align();
 }
 function enter(name,reveal=false){
  clearTimeout(exitTimer);if(current===name&&revealing===reveal)return;if(current&&current!==name)reset(current);current=name;revealing=reveal;
  const item=symbols.get(name);if(!item)return;delete document.body.dataset.keyboardSymbol;delete document.body.dataset.wordSymbol;
  if(reveal){document.body.dataset.keyboardSymbol=name;show(name)}else{document.body.dataset.wordSymbol=name;restore();plane.classList.remove('is-visible');cancelAnimationFrame(frame)}
  item.link.classList.remove('is-retreating');item.link.classList.add('is-energized');item.api.on();
 }
 function reset(name){const item=symbols.get(name);if(!item)return;item.link.classList.remove('is-energized');item.link.classList.add('is-retreating');item.api.off();setTimeout(()=>{if(current!==name){item.link.classList.remove('is-retreating');item.api.off()}},650)}
 function leave(){clearTimeout(exitTimer);exitTimer=setTimeout(()=>{const old=current;current=null;revealing=false;cancelAnimationFrame(frame);restore();plane.classList.remove('is-visible');delete document.body.dataset.keyboardSymbol;delete document.body.dataset.wordSymbol;if(old)reset(old)},100)}
 document.querySelectorAll('[data-symbol-word]').forEach(word=>{word.addEventListener('pointerenter',()=>enter(word.dataset.symbolWord));word.addEventListener('pointerleave',leave)});
})();
