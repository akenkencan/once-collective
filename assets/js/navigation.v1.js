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

// Keep the complete logo-to-symbol corridor open, including brief pointer departures.
(() => {
 const brand=document.querySelector('body > .navbar-wrapper .brand'),menu=brand?.querySelector('.symbol-menu');
 if(!brand)return;
 if(menu){const positionMenu=()=>{const logo=brand.querySelector('.logo-navbar')||brand;menu.style.setProperty('--symbol-menu-top',(logo.getBoundingClientRect().bottom-brand.getBoundingClientRect().top+24)+'px')};new ResizeObserver(positionMenu).observe(brand);positionMenu()}
 let timer;
 function open(){clearTimeout(timer);timer=undefined;brand.classList.add('symbol-menu-open')}
 function closeLater(){if(timer)return;timer=setTimeout(()=>{brand.classList.remove('symbol-menu-open');timer=undefined},850)}
 brand.addEventListener('pointerenter',open);
 brand.addEventListener('focusin',open);
 brand.addEventListener('focusout',event=>{if(!brand.contains(event.relatedTarget))closeLater()});
 document.addEventListener('pointermove',event=>{
  const approaching=event.clientX<Math.min(432,innerWidth*.36)&&event.clientY<228;
  document.body.classList.toggle('nav-left-near',approaching);
  document.body.classList.toggle('nav-right-near',event.clientX>innerWidth-Math.min(360,innerWidth*.3)&&event.clientY<204);
  if(approaching)open();
  if(!brand.classList.contains('symbol-menu-open'))return;
  const logo=brand.getBoundingClientRect(),symbols=menu?.getBoundingClientRect()||logo;
  const inside=event.clientX>=0&&event.clientX<=Math.max(432,logo.right,symbols.right)+72&&event.clientY>=0&&event.clientY<=Math.max(228,logo.bottom,symbols.bottom)+54;
  if(inside){clearTimeout(timer);timer=undefined}else closeLater();
 },{passive:true});
})();

// Returning from the Found footer exposes navigation until the next downward scroll.
(()=>{let held=false,atTop=false,last=scrollY;document.querySelectorAll('[data-back-to-top]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();held=true;atTop=false;document.body.classList.add('nav-return-visible');window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'})}));window.addEventListener('scroll',()=>{if(held){if(scrollY<2)atTop=true;else if(atTop&&scrollY>last+1){held=false;document.body.classList.remove('nav-return-visible')}}last=scrollY},{passive:true});window.addEventListener('wheel',e=>{if(held&&e.deltaY>0){held=false;document.body.classList.remove('nav-return-visible')}},{passive:true})})();

// Original symbol masks share the site's Colour Burst on hover.
(()=>{function setup(){if(!window.ONCEColourBurst)return;document.querySelectorAll('.brand .symbol-menu>.navbar-symbol').forEach(link=>{if(link.querySelector('.nav-symbol-burst'))return;const surface=document.createElement('span');surface.className='nav-symbol-burst';surface.setAttribute('aria-hidden','true');surface.style.setProperty('--nav-symbol-mask',getComputedStyle(link).backgroundImage);link.append(surface);ONCEColourBurst.attach(link,surface)})}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});else setup()})();
