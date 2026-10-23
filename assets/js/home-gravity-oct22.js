/* Original text and parallax stay mounted throughout the opening. */
(()=>{
 const root=document.documentElement,text=document.querySelector('.fullscreen-section:not(.overlay)>.text'),links=[...document.querySelectorAll('[data-oil-symbol]')];
 if(!text||links.length!==5){root.classList.remove('home-gravity-opening');return}
 const reduced=matchMedia('(prefers-reduced-motion:reduce)'),desktop=matchMedia('(min-width:992px)'),heights=[16,6.19,3.5,3.5,6.19,16];
 if(!desktop.matches){root.classList.remove('home-gravity-opening');document.body.classList.add('home-gravity-complete','home-activation-armed');return}
 const layers=[...text.children].filter(e=>e.classList.contains('text-row')).map((row,index)=>{const wrap=document.createElement('div');wrap.className='home-depth-row';wrap.style.height=heights[index]+'vh';row.before(wrap);wrap.append(row);return{wrap,index}});
 const iconRow=links[0].parentElement;iconRow.inert=true;
 let frame=0,started=0,finished=false,geometry;
 const clamp=t=>Math.max(0,Math.min(1,t)),cubic=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
 function layout(){
  const row=links[0].parentElement;if(!links[0].offsetHeight||!row.getBoundingClientRect().height){geometry=null;return false}
  const origin=row.getBoundingClientRect().top,centres=links.map(link=>origin+link.offsetTop+link.offsetHeight/2),centre=centres[2];
  geometry={centres,centre};const first=desktop.matches?centres[0]:innerHeight*.15,last=desktop.matches?centres[4]:innerHeight*.89;
  layers.forEach(({wrap,index})=>{let y=first+(last-first)*index/(layers.length-1);if(index===0)y-=innerHeight*.025;wrap.style.top=(y-innerHeight*heights[index]/200)+'px';wrap.dataset.homeY=y.toFixed(3)});return true;
 }
 function finish(){
  finished=true;links.forEach(link=>link.style.setProperty('--opening-y','0px'));
  layers.forEach(({wrap})=>{wrap.style.transform='none';wrap.style.opacity='1'});
  root.classList.remove('home-gravity-opening');document.body.classList.add('home-gravity-complete');document.body.dataset.homeOpening='settled';text.style.visibility='';cancelAnimationFrame(frame);frame=0;document.dispatchEvent(new CustomEvent('once:home-ready'));if(!desktop.matches||reduced.matches)arm();
 }
 function paint(now){
  frame=0;if(!geometry&&!layout()){frame=requestAnimationFrame(paint);return}if(!started)started=now;
  if(reduced.matches||!desktop.matches){finish();return}
  // Preserve the original inOutCubic spread and the star's quarter-duration delay.
  // The duration is stretched uniformly, so their relative movement stays intact.
  const elapsed=now-started-650,duration=2400,starDelay=duration*.25;
  const progress=links.map((_,index)=>cubic(clamp((elapsed-(index===0?starDelay:0))/duration)));
  document.body.classList.add('home-opening-ready');text.style.visibility='visible';document.body.dataset.homeOpening=elapsed<=0?'together':'spreading';
  links.forEach((link,index)=>link.style.setProperty('--opening-y',((geometry.centre-geometry.centres[index])*(1-progress[index]))+'px'));
  const p=progress[0];root.style.setProperty('--home-opening-progress',p);
  for(const {wrap,index} of layers){const y=Number(wrap.dataset.homeY),side=index<3?-1:1,depth=index===0||index===5?180:index===1||index===4?280:380,arc=Math.sin((1-p)*Math.PI/2);
   wrap.style.transform=`perspective(1200px) translate3d(0,${(geometry.centre-y)*(1-p)}px,${-depth*arc}px) rotateX(${side*42*(1-p)}deg)`;
   wrap.style.opacity=String(Math.min(1,p*6));
  }
  if(elapsed>=duration+starDelay){finish();return}frame=requestAnimationFrame(paint);
 }
 function arm(){if(!finished)return;iconRow.inert=false;document.body.classList.add('home-activation-armed')}
 ['pointermove','keydown','pointerdown'].forEach(type=>document.addEventListener(type,arm,true));
 // Stop symbol/word activation, while the existing mousemove parallax keeps running.
 function guard(event){if(!root.classList.contains('home-gravity-opening'))return;if(event.target instanceof Element&&event.target.closest('[data-oil-symbol],[data-symbol-word]')){event.stopImmediatePropagation();if(event.cancelable&&(event.type==='click'||event.type==='keydown'))event.preventDefault()}}
 ['pointerover','pointerenter','mouseover','mouseenter','focus','focusin','click','keydown'].forEach(type=>document.addEventListener(type,guard,true));
 layout();document.fonts?.ready.then(layout);new ResizeObserver(layout).observe(links[0]);frame=requestAnimationFrame(paint);
 window.addEventListener('resize',()=>{layout();if(!finished&&!frame)frame=requestAnimationFrame(paint)});reduced.addEventListener('change',()=>{if(reduced.matches&&!finished)finish()});window.addEventListener('pagehide',()=>cancelAnimationFrame(frame));
})();
