/* A word keeps one rendered owner through lift, return and rest. */
(()=>{
 const symbols=new Map(),groups=new Map(),plane=document.createElement('div'),reduced=()=>matchMedia('(prefers-reduced-motion:reduce)').matches||document.body.classList.contains('is-motion-paused');
 plane.className='home-reveal-plane';plane.setAttribute('aria-hidden','true');document.body.append(plane);
 let current=null,revealing=false,exitTimer,raf=0;
 const resting=new WeakMap(),words=[...document.querySelectorAll('.fullscreen-section:not(.overlay) [data-symbol-word]')];
 function cacheRest(){words.forEach(source=>{const base={opacity:.6,blur:source.classList.contains('large-word')?14:source.classList.contains('med-word')?10:8};resting.set(source,base);source.style.setProperty('--home-word-rest-blur',base.blur+'px')})}
 cacheRest();
 const lerp=(a,b,t)=>a+(b-a)*t;
 function typography(item){const r=item.source.getBoundingClientRect(),css=getComputedStyle(item.source);Object.assign(item.word.style,{fontFamily:css.fontFamily,fontWeight:css.fontWeight,fontSize:css.fontSize,lineHeight:css.lineHeight,letterSpacing:css.letterSpacing,color:css.color,width:r.width+'px',height:r.height+'px'});item.width=r.width;item.height=r.height}
 function own(source){const word=document.createElement('span'),r=source.getBoundingClientRect(),base=resting.get(source);word.className='home-reveal-word';word.textContent=source.textContent;Object.assign(word.style,{left:'0px',top:'0px',transformOrigin:'0 0'});const item={source,word,base,width:r.width,height:r.height,draw:{x:r.x,y:r.y,scale:1,...base}};typography(item);plane.append(word);source.classList.add('is-word-lifted');return item}
 function transition(group,phase){group.phase=phase;group.began=performance.now();group.items.forEach(item=>{if(phase==='out'&&item!==group.representative){item.draw.opacity=0;item.word.style.opacity='0'}item.start={...item.draw}});schedule()}
 function retire(){for(const group of groups.values())if(group.phase==='out')transition(group,'return')}
 function show(name){retire();const margin=Math.max(16,innerWidth*.018),centre=innerWidth/2,clearance=Math.max(72,innerHeight*.115),lane=centre-clearance-margin;
  ['first','second','third','fourth','fifth','sixth'].forEach((row,rowIndex)=>{
   const all=[...document.querySelectorAll('.fullscreen-section:not(.overlay) .text-row.'+row+' [data-symbol-word="'+name+'"]')],unique=new Map();
   for(const source of all){const key=source.textContent.trim();if(!unique.has(key))unique.set(key,[]);unique.get(key).push(source)}
   [...unique.entries()].slice(0,innerWidth<800?1:2).forEach(([text,sources],i)=>{
    const key=row+'|'+name+'|'+text;let group=groups.get(key);if(!group){group={items:sources.map(own),phase:'rest'};groups.set(key,group)}
    group.representative=group.items.reduce((best,item)=>{const score=e=>{const r=e.source.getBoundingClientRect();return Math.abs((r.left+r.right)/2-centre)+(r.right<0||r.left>innerWidth?innerWidth*4:0)};return score(item)<score(best)?item:best},group.items[0]);
    const r=group.representative.source.getBoundingClientRect(),scale=Math.min(1,lane/Math.max(1,r.width)),width=r.width*scale,height=r.height*scale,hash=[...name].reduce((v,c)=>v+c.charCodeAt(0),0)+rowIndex*17,side=unique.size>1?i:hash%2;
    group.target={x:(side?centre+clearance:margin)+(lane-width)*(((hash*13+i*29)%101)/100),y:Math.max(12,Math.min(innerHeight-height-12,r.y)),scale,opacity:1,blur:0};transition(group,'out');
   });
  });plane.classList.add('is-visible');
 }
 function paint(now){raf=0;const rectangles=new Map();for(const group of groups.values())for(const item of group.items)rectangles.set(item,item.source.getBoundingClientRect());for(const group of groups.values()){
   const duration=reduced()?0:group.phase==='out'?1500:1250,t=group.phase==='rest'?1:duration?Math.min(1,(now-group.began)/duration):1,ease=1-Math.pow(1-t,4);
   for(const item of group.items){const r=rectangles.get(item),home={x:r.x,y:r.y,scale:1,...item.base};let target=home;
    if(group.phase==='out')target=item===group.representative?group.target:{...home,opacity:0};
    const from=item.start||home;item.draw=Object.fromEntries(Object.keys(home).map(key=>[key,group.phase==='rest'?home[key]:lerp(from[key],target[key],ease)]));const d=item.draw;
    item.word.style.transform=`translate(${d.x}px,${d.y}px) scale(${d.scale})`;item.word.style.opacity=String(d.opacity);const focus=item.source.classList.contains('home-word-direct-focus');item.focus=(item.focus||0)+((focus?1:0)-(item.focus||0))*.3;item.word.style.transform=`translate(${d.x}px,${d.y}px) scale(${d.scale*(1+.08*item.focus)})`;item.word.style.opacity=String(d.opacity+(1-d.opacity)*item.focus);item.word.style.filter=`blur(${d.blur*(1-item.focus)}px)`;item.word.dataset.phase=group.phase;
   }
   if(group.phase==='return'&&t===1){group.items.forEach(item=>{item.source.classList.remove('is-word-lifted');item.word.remove()});for(const [key,value] of groups)if(value===group)groups.delete(key)}
  }schedule()}
 function schedule(){if(!raf&&groups.size&&!document.hidden)raf=requestAnimationFrame(paint)}
 document.addEventListener('visibilitychange',()=>{if(document.hidden)clearAll();else schedule()});window.addEventListener('resize',()=>{groups.forEach(group=>group.items.forEach(typography));schedule()});
 function reset(name){const item=symbols.get(name);if(!item)return;item.link.classList.remove('is-energized');item.link.classList.add('is-retreating');item.api.off();setTimeout(()=>{if(current!==name)item.link.classList.remove('is-retreating')},950)}
 function enter(name,reveal){if((document.documentElement.classList.contains('home-gravity-opening')||!document.body.classList.contains('home-activation-armed')))return;clearTimeout(exitTimer);if(current===name&&revealing===reveal)return;if(current&&current!==name)reset(current);current=name;revealing=reveal;delete document.body.dataset.keyboardSymbol;delete document.body.dataset.wordSymbol;if(reveal){document.body.dataset.keyboardSymbol=name;show(name)}else{document.body.dataset.wordSymbol=name;retire()}const item=symbols.get(name);if(item){item.link.classList.remove('is-retreating');item.link.classList.add('is-energized');item.api.on()}}
 function clearFocus(){words.forEach(word=>word.classList.remove('home-word-direct-focus'))}
 function clearAll(){clearTimeout(exitTimer);const old=current;current=null;revealing=false;delete document.body.dataset.keyboardSymbol;delete document.body.dataset.wordSymbol;clearFocus();if(old)reset(old);groups.forEach(group=>group.items.forEach(item=>{item.source.classList.remove('is-word-lifted');item.word.remove()}));groups.clear();cancelAnimationFrame(raf);raf=0;plane.classList.remove('is-visible')}
 window.addEventListener('blur',clearAll);window.addEventListener('pagehide',clearAll);document.documentElement.addEventListener('pointerleave',clearAll);
 document.querySelectorAll('.nav-menu-wrapper').forEach(menu=>new MutationObserver(()=>{if(menu.hasAttribute('data-menu-open'))clearAll()}).observe(menu,{attributes:true,attributeFilter:['data-menu-open']}));
 function leave(){clearTimeout(exitTimer);exitTimer=setTimeout(()=>{const old=current;current=null;revealing=false;clearFocus();delete document.body.dataset.keyboardSymbol;delete document.body.dataset.wordSymbol;retire();if(old)reset(old)},90)}
 document.querySelectorAll('[data-oil-symbol]').forEach(link=>{const api=ONCEColourBurst.attach(link,link.querySelector('.oil-face'));symbols.set(link.dataset.oilSymbol,{link,api});link.addEventListener('pointerenter',()=>enter(link.dataset.oilSymbol,true));link.addEventListener('pointerleave',leave);link.addEventListener('focus',()=>enter(link.dataset.oilSymbol,true));link.addEventListener('blur',leave)});
 document.querySelectorAll('[data-symbol-word]').forEach(word=>{word.addEventListener('pointerenter',()=>{if((document.documentElement.classList.contains('home-gravity-opening')||!document.body.classList.contains('home-activation-armed')))return;clearFocus();word.classList.add('home-word-direct-focus');enter(word.dataset.symbolWord,false)});word.addEventListener('pointerleave',()=>{word.classList.remove('home-word-direct-focus');leave()})});
})();
