/* One opening timeline drives the symbol spread and the type planes it pulls. */
(()=>{
 const root=document.documentElement,text=document.querySelector('.fullscreen-section:not(.overlay)>.text'),links=[...document.querySelectorAll('[data-oil-symbol]')];
 if(!text||links.length!==5){root.classList.remove('home-gravity-opening');return}
 const reduced=matchMedia('(prefers-reduced-motion:reduce)'),desktop=matchMedia('(min-width:992px)'),heights=[16,6.19,3.5,3.5,6.19,16];
 const layers=[...text.children].filter(e=>e.classList.contains('text-row')).map((row,index)=>{const wrap=document.createElement('div');wrap.className='home-depth-row';wrap.style.height=heights[index]+'vh';row.before(wrap);wrap.append(row);return{wrap,index}});
 let frame=0,started=0,finished=false,geometry;
 function layout(){
  // offsetTop/Height exclude both the legacy and the opening transforms.
  const row=links[0].parentElement;if(!links[0].offsetHeight||!row.getBoundingClientRect().height){geometry=null;return false}const origin=row.getBoundingClientRect().top,centres=links.map(link=>origin+link.offsetTop+link.offsetHeight/2),centre=centres[2];
  geometry={centres,centre};const first=desktop.matches?centres[0]:innerHeight*.15,last=desktop.matches?centres[4]:innerHeight*.89;layers.forEach(({wrap,index})=>{const y=first+(last-first)*index/(layers.length-1);wrap.style.top=(y-innerHeight*heights[index]/200)+'px';wrap.dataset.homeY=y.toFixed(3)});return true;
 }
 function finish(){layout();finished=true;links.forEach(link=>link.style.setProperty('--opening-y','0px'));layers.forEach(({wrap})=>{wrap.style.transform='none';wrap.style.opacity='1'});root.classList.remove('home-gravity-opening');document.body.classList.add('home-gravity-complete');text.style.visibility='';cancelAnimationFrame(frame)}
 function paint(now){
  if(!geometry&&!layout()){frame=requestAnimationFrame(paint);return}if(!started)started=now;
  if(reduced.matches){finish();return}if(!desktop.matches){finish();layers.forEach(({wrap,index})=>wrap.animate([{opacity:0},{opacity:1}],{duration:1000,delay:index*55,fill:'backwards',easing:'cubic-bezier(.22,1,.36,1)'}));return}
  const t=Math.max(0,Math.min(1,(now-started-350)/5200)),p=t*t*t*(10+t*(-15+6*t));
  document.body.classList.add('home-opening-ready');text.style.visibility='visible';root.style.setProperty('--home-opening-progress',p);document.body.dataset.homeOpening=p===0?'together':p===1?'settled':'spreading';
  links.forEach((link,index)=>link.style.setProperty('--opening-y',((geometry.centre-geometry.centres[index])*(1-p))+'px'));
  for(const {wrap,index} of layers){const y=Number(wrap.dataset.homeY),side=index<3?-1:1,depth=index===0||index===5?260:index===1||index===4?480:680;
   wrap.style.transform=`perspective(950px) translate3d(0,${(geometry.centre-y)*(1-p)}px,${-depth*(1-p)}px) rotateX(${side*64*(1-p)}deg)`;
   wrap.style.opacity=String(Math.min(1,p*7));
  }
  if(t===1){finish();return}frame=requestAnimationFrame(paint);
 }
 layout();document.fonts?.ready.then(layout);new ResizeObserver(layout).observe(links[0]);frame=requestAnimationFrame(paint);
 window.addEventListener('resize',()=>{layout();if(!finished&&!frame)frame=requestAnimationFrame(paint)});
 reduced.addEventListener('change',()=>{if(reduced.matches)finish()});window.addEventListener('pagehide',()=>cancelAnimationFrame(frame));
})();
