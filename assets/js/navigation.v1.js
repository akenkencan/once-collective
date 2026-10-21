(() => {
  const wrapper = document.querySelector('.nav-menu-wrapper');
  const opener = document.querySelector('body > .navbar-wrapper .menu-icon-wrap');
  const closer = wrapper?.querySelector('.menu-icon-wrap');
  const panel = wrapper?.querySelector('.nav-menu');
  if (!wrapper || !opener || !closer || !panel) return;
  let previousOverflow = '';
  const focusable = () => [...panel.querySelectorAll('a[href], [tabindex="0"]')].filter(el => el.getClientRects().length);
  function setOpen(open) {
    if ((wrapper.dataset.menuOpen === 'true') === open) return;
    wrapper.dataset.menuOpen = String(open);
    wrapper.inert = !open;
    opener.setAttribute('aria-expanded', String(open));
    if (open) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      closer.focus();
    } else {
      document.body.style.overflow = previousOverflow;
      opener.focus();
    }
  }
  opener.addEventListener('click', () => setOpen(true));
  closer.addEventListener('click', () => setOpen(false));
  wrapper.querySelector('.menu-clickout')?.addEventListener('click', () => setOpen(false));
  for (const control of [opener, closer]) control.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); control.click(); }
  });
  document.addEventListener('keydown', event => {
    if (wrapper.dataset.menuOpen !== 'true') return;
    if (event.key === 'Escape') { event.preventDefault(); setOpen(false); }
    if (event.key === 'Tab') {
      const items = focusable(), first = items[0], last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
})();

// The logo resolves first, then the symbols clear inside their shared corridor.
(()=>{
 const wrapper=document.querySelector('body>.navbar-wrapper'),brand=wrapper?.querySelector('.brand'),logo=brand?.querySelector('.logo-navbar')||brand,menu=brand?.querySelector('.symbol-menu'),right=wrapper?.querySelector('.menu-icon-wrap');if(!wrapper||!logo||!right)return;
 const clamp=n=>Math.max(0,Math.min(1,n));let point={x:-9999,y:9999},queued=false;
 function distance(rect,rx,ry){return Math.hypot(Math.max(rect.left-point.x,0,point.x-rect.right)/rx,Math.max(rect.top-point.y,0,point.y-rect.bottom)/ry)}
 function update(){
  queued=false;const lr=logo.getBoundingClientRect(),mr=menu?.getBoundingClientRect()||lr,pad=Math.min(44,Math.max(24,innerWidth*.028));
  if(menu)menu.style.setProperty('--symbol-menu-top',(lr.bottom-brand.getBoundingClientRect().top+24)+'px');
  const corridor={left:Math.max(0,Math.min(lr.left,mr.left)-pad),right:Math.max(lr.right,mr.right)+pad,top:0,bottom:Math.max(lr.bottom,mr.bottom)+pad};
  const near=clamp(1-distance(corridor,Math.min(475.2,innerWidth*.396),250.8)),top=clamp((innerHeight*.2-point.y)/(innerHeight*.1)),keyboard=brand.contains(document.activeElement)&&document.activeElement.matches(':focus-visible'),touch=matchMedia('(hover:none)').matches;
  const clarity=keyboard?1:clamp((near-.5)*2),ghost=clamp((near-.25)*4)*.28,symbols=keyboard?1:touch?0:Math.max(ghost+.72*clarity,.28*top),left=keyboard||touch?1:Math.max(clamp(near*2),top),rightNear=clamp(1-distance(right.getBoundingClientRect(),Math.min(356.4,innerWidth*.297),202.4));
  wrapper.style.setProperty('--nav-left',left);wrapper.style.setProperty('--nav-right',touch?1:Math.max(rightNear,top));wrapper.style.setProperty('--nav-symbols',symbols);wrapper.style.setProperty('--nav-symbol-blur',(1-clarity)*9+'px');wrapper.style.setProperty('--nav-symbol-brightness',.25+.75*clarity);
  document.body.classList.toggle('nav-left-near',left>0);document.body.classList.toggle('nav-right-near',rightNear>0||top>0);brand.classList.toggle('symbol-menu-open',symbols>0);if(menu)menu.style.pointerEvents=symbols>.05?'auto':'none';
 }
 function queue(){if(!queued){queued=true;requestAnimationFrame(update)}}
 document.addEventListener('pointermove',event=>{point={x:event.clientX,y:event.clientY};queue()},{passive:true});document.addEventListener('pointerleave',()=>{point={x:-9999,y:9999};queue()});brand.addEventListener('focusin',queue);brand.addEventListener('focusout',queue);window.addEventListener('resize',queue);new ResizeObserver(queue).observe(logo);update();
})();

// Returning from the Found footer exposes navigation until the next downward scroll.
(()=>{let held=false,atTop=false,last=scrollY;document.querySelectorAll('[data-back-to-top]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();held=true;atTop=false;document.body.classList.add('nav-return-visible');window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'})}));window.addEventListener('scroll',()=>{if(held){if(scrollY<2)atTop=true;else if(atTop&&scrollY>last+1){held=false;document.body.classList.remove('nav-return-visible')}}last=scrollY},{passive:true});window.addEventListener('wheel',e=>{if(held&&e.deltaY>0){held=false;document.body.classList.remove('nav-return-visible')}},{passive:true})})();

// Original symbol masks share the site's Colour Burst on hover.
(()=>{function setup(){if(!window.ONCEColourBurst)return;document.querySelectorAll('.brand .symbol-menu>.navbar-symbol').forEach(link=>{if(link.querySelector('.nav-symbol-burst'))return;const surface=document.createElement('span');surface.className='nav-symbol-burst';surface.setAttribute('aria-hidden','true');surface.style.setProperty('--nav-symbol-mask',getComputedStyle(link).backgroundImage);link.append(surface);ONCEColourBurst.attach(link,surface)})}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});else setup()})();
