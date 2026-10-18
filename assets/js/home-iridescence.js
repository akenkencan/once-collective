/* Source-position reveals with monotonic zoom and the same return path. */
(()=>{
 const symbols=new Map(),plane=document.createElement('div'),reduced=()=>matchMedia('(prefers-reduced-motion:reduce)').matches||document.body.classList.contains('is-motion-paused');
 plane.className='home-reveal-plane';plane.setAttribute('aria-hidden','true');document.body.append(plane);
 let current=null,revealing=false,exitTimer,sequence=0,words=[];
 function sourceStyle(source){let opacity=1,filters=[];for(let e=source;e&&e!==document.body;e=e.parentElement){const css=getComputedStyle(e);opacity*=Number(css.opacity);if(css.filter!=='none')filters.push(css.filter)}return{opacity,filter:filters.join(' ')||'none'}}
 function retire(){
  const batch=words;words=[];++sequence;
  for(const item of batch){
   const css=getComputedStyle(item.word),start={opacity:css.opacity,filter:css.filter,transform:css.transform},rect=item.source.getBoundingClientRect(),base=sourceStyle(item.source),target=`translate(${rect.x-item.x}px,${rect.y-item.y}px) scale(${rect.width/item.width})`;
   item.word.getAnimations().forEach(a=>a.cancel());
   const animation=item.word.animate([start,{opacity:base.opacity,filter:base.filter,transform:target}],{duration:reduced()?0:950,easing:'cubic-bezier(.22,1,.36,1)',fill:'forwards'});
   animation.finished.then(()=>{item.source.classList.remove('is-word-lifted');item.word.remove();if(!plane.childElementCount){plane.classList.remove('is-visible');document.body.classList.remove('home-words-in-flight')}}).catch(()=>{});
  }
 }
 function show(name){
  if(words.length)retire();++sequence;words=[];document.body.classList.add("home-words-in-flight");const rows=['first','second','third','fourth','fifth','sixth'];
  const margin=Math.max(16,innerWidth*.018),centre=innerWidth/2,clearance=Math.max(72,innerHeight*.115),lane=centre-clearance-margin;
  rows.forEach((rowName,rowIndex)=>{
   const all=[...document.querySelectorAll('.fullscreen-section:not(.overlay) .text-row.'+rowName+' [data-symbol-word="'+name+'"]')],unique=new Map();
   all.sort((a,b)=>{const score=e=>{const r=e.getBoundingClientRect();return r.right>0&&r.left<innerWidth?0:1};return score(a)-score(b)}).forEach(e=>{if(!e.classList.contains('is-word-lifted')&&!unique.has(e.textContent.trim()))unique.set(e.textContent.trim(),e)});
   const selected=[...unique.values()].slice(0,innerWidth<800?1:2).sort((a,b)=>a.getBoundingClientRect().x-b.getBoundingClientRect().x),hash=[...name].reduce((v,c)=>v+c.charCodeAt(0),0)+rowIndex*17;
   selected.forEach((source,i)=>{
    const rect=source.getBoundingClientRect(),css=getComputedStyle(source),factor=Math.min(1,lane/Math.max(1,rect.width)),width=rect.width*factor,height=rect.height*factor,side=selected.length>1?i:hash%2;
    const x=(side?centre+clearance:margin)+(lane-width)*(((hash*13+i*29)%101)/100),y=Math.max(12,Math.min(innerHeight-height-12,rect.y));
    const word=document.createElement('span');word.className='home-reveal-word';word.textContent=source.textContent;
    Object.assign(word.style,{fontFamily:css.fontFamily,fontWeight:css.fontWeight,fontSize:parseFloat(css.fontSize)*factor+'px',lineHeight:(parseFloat(css.lineHeight)||parseFloat(css.fontSize)*1.2)*factor+'px',letterSpacing:(parseFloat(css.letterSpacing)||0)*factor+'px',left:x+'px',top:y+'px',width:width+'px',height:height+'px',transformOrigin:'0 0'});
    const from=`translate(${rect.x-x}px,${rect.y-y}px) scale(.8)`;plane.append(word);source.classList.add("is-word-lifted");words.push({word,from,source,x,y,width});
    word.animate([{opacity:0,filter:'blur(30px)',transform:from},{opacity:1,filter:'blur(0px)',transform:'translate(0,0) scale(1)'}],{duration:reduced()?0:1700,delay:Math.min(rowIndex,5-rowIndex)*55,easing:'cubic-bezier(.12,1,.22,1)',fill:'both'});
   });
  });plane.classList.add('is-visible');
 }
 function reset(name){const item=symbols.get(name);if(!item)return;item.link.classList.remove('is-energized');item.link.classList.add('is-retreating');item.api.off();setTimeout(()=>{if(current!==name)item.link.classList.remove('is-retreating')},950)}
 function enter(name,reveal){
  clearTimeout(exitTimer);if(current===name&&revealing===reveal)return;if(current&&current!==name)reset(current);current=name;revealing=reveal;
  delete document.body.dataset.keyboardSymbol;delete document.body.dataset.wordSymbol;
  if(reveal){document.body.dataset.keyboardSymbol=name;show(name)}else{document.body.dataset.wordSymbol=name;retire()}
  const item=symbols.get(name);if(item){item.link.classList.remove('is-retreating');item.link.classList.add('is-energized');item.api.on()}
 }
 function leave(){clearTimeout(exitTimer);exitTimer=setTimeout(()=>{const old=current;current=null;revealing=false;delete document.body.dataset.keyboardSymbol;delete document.body.dataset.wordSymbol;retire();if(old)reset(old)},90)}
 document.querySelectorAll('[data-oil-symbol]').forEach(link=>{const api=ONCEColourBurst.attach(link,link.querySelector('.oil-face'));symbols.set(link.dataset.oilSymbol,{link,api});link.addEventListener('pointerenter',()=>enter(link.dataset.oilSymbol,true));link.addEventListener('pointerleave',leave);link.addEventListener('focus',()=>enter(link.dataset.oilSymbol,true));link.addEventListener('blur',leave)});
 document.querySelectorAll('[data-symbol-word]').forEach(word=>{word.addEventListener('pointerenter',()=>enter(word.dataset.symbolWord,false));word.addEventListener('pointerleave',leave)});
})();
