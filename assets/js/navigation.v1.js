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

// Nearby navigation follows distance; the final 20% clears on the logo itself.
(()=>{
 const wrapper=document.querySelector('body>.navbar-wrapper'),brand=wrapper?.querySelector('.brand'),logo=brand?.querySelector('.logo-navbar')||brand,menu=brand?.querySelector('.symbol-menu'),right=wrapper?.querySelector('.menu-icon-wrap');if(!wrapper||!logo||!right)return;
 const clamp=n=>Math.max(0,Math.min(1,n));let point={x:-9999,y:-9999},queued=false;
 function proximity(rect,rx,ry){const dx=Math.max(rect.left-point.x,0,point.x-rect.right),dy=Math.max(rect.top-point.y,0,point.y-rect.bottom);return {inside:dx===0&&dy===0,p:clamp(1-Math.hypot(dx/rx,dy/ry))}}
 function update(){queued=false;const l=proximity(logo.getBoundingClientRect(),Math.min(432,innerWidth*.36),228),r=proximity(right.getBoundingClientRect(),Math.min(324,innerWidth*.27),184),keyboard=brand.contains(document.activeElement)&&document.activeElement.matches(':focus-visible'),left=keyboard?1:l.p,symbols=keyboard||l.inside?1:l.p*.8;
  wrapper.style.setProperty('--nav-left',left);wrapper.style.setProperty('--nav-right',r.p);wrapper.style.setProperty('--nav-symbols',symbols);wrapper.style.setProperty('--nav-symbol-blur',(1-symbols)*9+'px');wrapper.style.setProperty('--nav-symbol-brightness',.25+.75*symbols);
  document.body.classList.toggle('nav-left-near',left>0);document.body.classList.toggle('nav-right-near',r.p>0);brand.classList.toggle('symbol-menu-open',symbols>0);
  if(menu)menu.style.setProperty('--symbol-menu-top',(logo.getBoundingClientRect().bottom-brand.getBoundingClientRect().top+24)+'px');
 }
 function queue(){if(!queued){queued=true;requestAnimationFrame(update)}}document.addEventListener('pointermove',event=>{point={x:event.clientX,y:event.clientY};queue()},{passive:true});brand.addEventListener('focusin',queue);brand.addEventListener('focusout',queue);window.addEventListener('resize',queue);new ResizeObserver(queue).observe(logo);update();
})();

// Returning from the Found footer exposes navigation until the next downward scroll.
(()=>{let held=false,atTop=false,last=scrollY;document.querySelectorAll('[data-back-to-top]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();held=true;atTop=false;document.body.classList.add('nav-return-visible');window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'})}));window.addEventListener('scroll',()=>{if(held){if(scrollY<2)atTop=true;else if(atTop&&scrollY>last+1){held=false;document.body.classList.remove('nav-return-visible')}}last=scrollY},{passive:true});window.addEventListener('wheel',e=>{if(held&&e.deltaY>0){held=false;document.body.classList.remove('nav-return-visible')}},{passive:true})})();

// Original symbol masks share the site's Colour Burst on hover.
(()=>{function setup(){if(!window.ONCEColourBurst)return;document.querySelectorAll('.brand .symbol-menu>.navbar-symbol').forEach(link=>{if(link.querySelector('.nav-symbol-burst'))return;const surface=document.createElement('span');surface.className='nav-symbol-burst';surface.setAttribute('aria-hidden','true');surface.style.setProperty('--nav-symbol-mask',getComputedStyle(link).backgroundImage);link.append(surface);ONCEColourBurst.attach(link,surface)})}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});else setup()})();
