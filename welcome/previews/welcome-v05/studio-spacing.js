(() => {
 const column=document.querySelector('.studio-materials'),text=document.querySelector('.studio-heading>article'),composition=column.querySelector('.studio-composition'),tiles=column.querySelector('.studio-underlay');
 const extras=document.querySelector('.studio-extra-tiles'),section=document.querySelector('.studio-heading');
 let frame;
 function layout(){
  cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{
   if(getComputedStyle(tiles).display==='none'){column.classList.remove('tiles-tucked');extras.classList.remove('has-room');return}
   const c=column.getBoundingClientRect(),p=composition.getBoundingClientRect(),t=text.getBoundingClientRect(),height=tiles.getBoundingClientRect().height;
   const naturalBottom=p.bottom+38+height;
   const tileSize=(t.width-48)/4,space=c.bottom-t.bottom;
   const fits=innerWidth>=1152&&space>=tileSize+28;
   const sectionBox=section.getBoundingClientRect();
   Object.assign(extras.style,{left:(t.left-sectionBox.left)+'px',top:(t.bottom-sectionBox.top+20)+'px',width:t.width+'px'});
   extras.classList.toggle('has-room',fits);
   const tuck=naturalBottom>t.bottom+16;
   column.style.setProperty('--tile-top',Math.max(0,p.bottom-c.top-height*.72)+'px');
   column.classList.toggle('tiles-tucked',tuck);
  });
 }
 const observer=new ResizeObserver(layout);[column,text,composition,tiles].forEach(el=>observer.observe(el));window.addEventListener('resize',layout);layout();
})();