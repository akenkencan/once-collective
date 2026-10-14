(() => {
 document.querySelectorAll('[data-oil-symbol]').forEach(link=>{
  const api=window.ONCEColourBurst.attach(link,link.querySelector('.oil-face'));let timer;
  function enter(){clearTimeout(timer);link.classList.remove('is-retreating');link.classList.add('is-energized');api.on()}
  function leave(){if(document.activeElement===link)return;link.classList.remove('is-energized');link.classList.add('is-retreating');api.on();timer=setTimeout(()=>{link.classList.remove('is-retreating');api.off()},360)}
  link.addEventListener('pointerenter',enter);link.addEventListener('pointerleave',leave);link.addEventListener('focus',()=>{enter();document.body.dataset.keyboardSymbol=link.dataset.oilSymbol});link.addEventListener('blur',()=>{delete document.body.dataset.keyboardSymbol;leave()});
 });
})();
