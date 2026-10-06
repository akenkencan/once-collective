(() => {
 const column=document.querySelector('.studio-materials'),text=document.querySelector('.studio-heading>article'),composition=column.querySelector('.studio-composition'),tiles=column.querySelector('.studio-underlay');
 let frame;
 function layout(){
  cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{
   if(getComputedStyle(tiles).display==='none'){column.classList.remove('tiles-tucked');return}
   const c=column.getBoundingClientRect(),p=composition.getBoundingClientRect(),t=text.getBoundingClientRect(),height=tiles.getBoundingClientRect().height;
   const naturalBottom=p.bottom+38+height;
   const tuck=naturalBottom>t.bottom+16;
   column.style.setProperty('--tile-top',Math.max(0,p.bottom-c.top-height*.72)+'px');
   column.classList.toggle('tiles-tucked',tuck);
  });
 }
 const observer=new ResizeObserver(layout);[column,text,composition,tiles].forEach(el=>observer.observe(el));window.addEventListener('resize',layout);layout();
})();