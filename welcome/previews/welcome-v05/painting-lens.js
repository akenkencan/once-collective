(() => {
 const frame=document.querySelector('.joker-portrait'),image=frame?.querySelector('.joker-art');if(!image)return;
 const lens=document.createElement('span');lens.className='painting-lens';lens.setAttribute('aria-hidden','true');frame.append(lens);
 const magnifier=document.createElement('img');magnifier.className='painting-magnifier';magnifier.alt='';magnifier.src='/assets/images/oct22/magnifying-glass.webp';frame.append(magnifier);
 const pointer=matchMedia('(any-hover:hover) and (any-pointer:fine)');
 function move(e){
  if(!pointer.matches||e.pointerType==='touch')return;
  const box=image.getBoundingClientRect(),outer=frame.getBoundingClientRect();
  const scale=Math.min(box.width/image.naturalWidth,box.height/image.naturalHeight),w=image.naturalWidth*scale,h=image.naturalHeight*scale;
  if(!w||!h)return;
  const left=box.left+(box.width-w)/2,top=box.top+(box.height-h)/2,x=e.clientX-left,y=e.clientY-top;
  if(x<0||y<0||x>w||y>h){frame.classList.remove('lens-active');return}
  const diameter=Math.min(190,outer.width*.68),radius=diameter/2,zoom=2.9;
  const lx=e.clientX-outer.left,ly=e.clientY-outer.top;
  Object.assign(lens.style,{width:diameter+'px',height:diameter+'px',left:(lx-radius)+'px',top:(ly-radius)+'px',backgroundImage:'url("'+image.currentSrc+'")',backgroundSize:(w*zoom)+'px '+(h*zoom)+'px',backgroundPosition:(radius-x*zoom)+'px '+(radius-y*zoom)+'px'});
  const toolWidth=diameter*304/140;Object.assign(magnifier.style,{width:toolWidth+'px',left:(e.clientX-outer.left-toolWidth*118/304)+'px',top:(e.clientY-outer.top-toolWidth*99/304)+'px'});
  frame.classList.add('lens-active');
 }
 frame.addEventListener('pointermove',move);frame.addEventListener('pointerleave',()=>frame.classList.remove('lens-active'));window.addEventListener('resize',()=>frame.classList.remove('lens-active'));
})();
