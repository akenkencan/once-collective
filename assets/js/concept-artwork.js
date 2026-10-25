// The laminate wakes as the viewer approaches; the expanded image remains still.
(()=>{
 const card=document.querySelector('.concept-darling-art'),trigger=card?.querySelector('.concept-art-trigger'),dialog=document.querySelector('#concept-art-viewer');if(!card||!trigger||!dialog)return;
 const reduced=matchMedia('(prefers-reduced-motion:reduce)');let point=null,frame=0,near=0,rx=0,ry=0;
 function paint(){frame=0;const r=card.getBoundingClientRect();let target=0,x=.5,y=.5;
  if(point&&!dialog.open&&!reduced.matches){const dx=Math.max(r.left-point.x,0,point.x-r.right),dy=Math.max(r.top-point.y,0,point.y-r.bottom),p=Math.max(0,1-Math.hypot(dx,dy)/180);target=p*p*(3-2*p);x=Math.max(0,Math.min(1,(point.x-r.left)/r.width));y=Math.max(0,Math.min(1,(point.y-r.top)/r.height))}
  const tx=(y-.5)*-11.25*target,ty=(x-.5)*11.25*target;near+=(target-near)*.12;rx+=(tx-rx)*.12;ry+=(ty-ry)*.12;
  card.style.setProperty('--foil-near',near.toFixed(4));card.style.setProperty('--foil-x',(x*100)+'%');card.style.setProperty('--foil-y',(y*100)+'%');card.style.setProperty('--foil-rx',rx+'deg');card.style.setProperty('--foil-ry',ry+'deg');
  if(Math.abs(target-near)>.001||Math.abs(tx-rx)>.005||Math.abs(ty-ry)>.005)schedule();
 }
 function schedule(){if(!frame)frame=requestAnimationFrame(paint)}
 document.addEventListener('pointermove',e=>{point={x:e.clientX,y:e.clientY};schedule()},{passive:true});document.documentElement.addEventListener('pointerleave',()=>{point=null;schedule()});window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);reduced.addEventListener('change',schedule);
 trigger.addEventListener('click',()=>{dialog.showModal();dialog.classList.add('is-visible');schedule()});
 dialog.addEventListener('click',e=>{if(e.target.tagName!=='IMG')dialog.close()});dialog.addEventListener('close',()=>{dialog.classList.remove('is-visible');trigger.focus({preventScroll:true});schedule()});
})();
