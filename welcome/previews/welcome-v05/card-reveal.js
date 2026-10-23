(() => {
 const details=document.getElementById('meaning-more'),group=document.querySelector('.framed-reveal'),tray=group.querySelector('.card-reveal'),cards=[...tray.querySelectorAll('.falling-card')],collapse=document.querySelector('.collapse-tape'),paperStack=document.querySelector('.meaning-paper-stack'),paperTray=document.querySelector('.paper-card-tray'),aside=group.parentElement,portrait=group.querySelector('.joker-portrait'),body=details.querySelector('.meaning-expanded');
 let expanded=details.open,anim,frame;
 function layout(){
  const distributed=innerWidth>740&&innerWidth<=1100,mobile=innerWidth<=740;
  if(distributed&&tray.parentNode!==aside)aside.append(tray);else if(!distributed&&tray.parentNode!==group)group.append(tray);
  const width=tray.clientWidth||group.clientWidth,cw=Math.min(width*.45,Math.max(130,Math.min(300,innerHeight*.19))),padding=Math.max(16,cw*.12);
  paperTray.style.height=expanded&&!mobile?(paperTray.clientWidth/1.43)+'px':'0px';
  let heights=[0,0];
  if(distributed){const specimens=aside.querySelector('.meaning-specimens');heights[0]=Math.min(0,specimens.getBoundingClientRect().bottom-tray.getBoundingClientRect().top+24)}
  const origin=portrait.getBoundingClientRect(),stage=tray.getBoundingClientRect();
  cards.forEach((card,i)=>{
   if(mobile&&i>=2){card.style.display='none';return}
   if(card.classList.contains('optional-reveal')){card.style.display='none';return}
   card.style.display='';
   const final=card.classList.contains('reveal-finale'),img=card.tagName==='IMG'?card:card.querySelector('img'),natural=img.naturalHeight/img.naturalWidth||1,ratio=card.classList.contains('reveal-clockwise')?1/natural:natural;
   const col=card.classList.contains('reveal-clockwise')?1:heights[0]<=heights[1]?0:1;
   const w=final?Math.min(width*.95,cw*2.1,innerHeight*.55):cw,h=w*ratio,y=final?Math.max(...heights)+h*.1:heights[col],x=final?(width-w)/2:((width-cw*2-padding)/2+col*(cw+padding));
   Object.assign(card.style,{width:w+'px',height:h+'px',left:x+'px',top:y+'px'});if(card.classList.contains('reveal-clockwise')){card.style.setProperty('--turned-width',h+'px');card.style.setProperty('--turned-height',w+'px')}
   card.style.setProperty('--hidden-x',(origin.left+origin.width/2-stage.left-x-w/2)+'px');
   card.style.setProperty('--hidden-y',(origin.top+origin.height*.55-stage.top-y-h/2)+'px');
   if(final)heights=[y+h+padding,y+h+padding];else heights[col]=y+h+padding;
  });
  // Fit the right-hand cards to the left article and its revealed paper, allowing
  // only half that paper's height to extend the overall section.
  let total=Math.max(0,...heights)+24;
  if(!mobile){const leftCard=paperTray.clientWidth/1.43,article=paperStack.querySelector('article'),budget=Math.max(220,article.getBoundingClientRect().bottom+leftCard*1.5-stage.top),scale=Math.min(1,budget/total);if(scale<1){cards.filter(card=>card.style.display!=='none').forEach(card=>{const w=parseFloat(card.style.width)*scale,h=parseFloat(card.style.height)*scale,x=width/2+(parseFloat(card.style.left)-width/2)*scale,y=parseFloat(card.style.top)*scale;Object.assign(card.style,{width:w+'px',height:h+'px',left:x+'px',top:y+'px'});if(card.classList.contains('reveal-clockwise')){card.style.setProperty('--turned-width',h+'px');card.style.setProperty('--turned-height',w+'px')}card.style.setProperty('--hidden-x',(origin.left+origin.width/2-stage.left-x-w/2)+'px');card.style.setProperty('--hidden-y',(origin.top+origin.height*.55-stage.top-y-h/2)+'px')});total*=scale}}
  collapse.tabIndex=expanded?0:-1;tray.style.height=expanded?total+'px':'0px';
 }
 function queue(){cancelAnimationFrame(frame);frame=requestAnimationFrame(layout)}
 function sync(){const updates=group.querySelector('.frame-updates-slot');updates.inert=expanded;updates.setAttribute('aria-hidden',String(expanded));if(expanded&&updates.querySelector('button')?.getAttribute('aria-expanded')==='true')document.dispatchEvent(new CustomEvent('once:signup-close'));portrait.setAttribute('aria-expanded',String(expanded));paperTray.classList.toggle('is-open',expanded);paperTray.setAttribute('aria-hidden',String(!expanded));group.classList.toggle('is-open',expanded);tray.classList.toggle('is-open',expanded);paperStack.classList.toggle('is-open',expanded);tray.setAttribute('aria-hidden',String(!expanded));layout()}
 details.querySelector('summary').addEventListener('click',e=>{
  e.preventDefault();expanded=!expanded;
  const from=details.open?body.getBoundingClientRect().height:0;if(anim)anim.cancel();details.open=true;sync();
  body.style.overflow='hidden';const current=body.animate([{height:from+'px'},{height:(expanded?body.scrollHeight:0)+'px'}],{duration:matchMedia('(prefers-reduced-motion:reduce)').matches?0:(expanded?800:1600),easing:'cubic-bezier(.65,0,.35,1)',fill:'forwards'});anim=current;
  current.onfinish=()=>{if(anim!==current)return;details.open=expanded;current.cancel();anim=null;body.style.overflow='';queue()};
 });
 collapse.addEventListener('click',()=>{if(expanded){details.querySelector('summary').click();details.querySelector('summary').focus({preventScroll:true})}});
 portrait.addEventListener('click',()=>details.querySelector('summary').click());portrait.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();details.querySelector('summary').click()}});
 tray.querySelectorAll('img').forEach(img=>img.addEventListener('load',queue));const observer=new ResizeObserver(queue);[group,paperStack,aside].forEach(e=>observer.observe(e));window.addEventListener('resize',queue);sync();
})();
