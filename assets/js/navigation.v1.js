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
 if(!brand||!menu)return;
 let timer;
 function open(){clearTimeout(timer);timer=undefined;brand.classList.add('symbol-menu-open')}
 function closeLater(){if(timer)return;timer=setTimeout(()=>{brand.classList.remove('symbol-menu-open');timer=undefined},850)}
 brand.addEventListener('pointerenter',open);
 brand.addEventListener('focusin',open);
 brand.addEventListener('focusout',event=>{if(!brand.contains(event.relatedTarget))closeLater()});
 document.addEventListener('pointermove',event=>{
  if(!brand.classList.contains('symbol-menu-open'))return;
  const logo=brand.getBoundingClientRect(),symbols=menu.getBoundingClientRect();
  const inside=event.clientX>=0&&event.clientX<=Math.max(logo.right,symbols.right)+36&&event.clientY>=0&&event.clientY<=Math.max(logo.bottom,symbols.bottom)+28;
  if(inside){clearTimeout(timer);timer=undefined}else closeLater();
 },{passive:true});
})();
