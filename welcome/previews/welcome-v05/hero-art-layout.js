(() => {
 const art=document.querySelector('.hero-trickster'),copy=document.querySelector('.hero-copy'),side=document.querySelector('.hero-art'),hero=copy.closest('section');
 hero.style.position='relative';
 function place(){
  if(innerWidth<=740)return;
  const h=hero.getBoundingClientRect(),anchor=(innerWidth<=1050?side:copy).getBoundingClientRect();
  const top=anchor.bottom-h.top+16;
  const room=Math.max(0,h.height-top-14);
  const width=Math.min(anchor.width,room*2912/1632,420);
  Object.assign(art.style,{left:(anchor.left-h.left)+'px',top:top+'px',width:width+'px',height:(width*1632/2912)+'px'});
 }
 const observer=new ResizeObserver(place);[hero,copy,side].forEach(el=>observer.observe(el));window.addEventListener('resize',place);place();
})();