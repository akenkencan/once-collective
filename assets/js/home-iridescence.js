(() => {
 const reduced=matchMedia('(prefers-reduced-motion:reduce)');
 // Sampled from the landing-page iridescence and design-system oil-slick references.
 const palette=[[211,143,115],[211,185,122],[186,199,135],[159,198,142],[134,196,156],[124,191,176],[116,179,204],[126,148,215],[160,132,218],[194,137,213],[216,133,191],[216,135,159]];
 const links=[...document.querySelectorAll('[data-oil-symbol]')];
 links.forEach(link=>{
  const face=link.querySelector('.oil-face');face.replaceChildren();
  const canvas=document.createElement('canvas');canvas.className='oil-canvas';canvas.width=canvas.height=180;face.append(canvas);
  const ctx=canvas.getContext('2d',{alpha:false}),pixels=ctx.createImageData(180,180);let running=false,frame=0,start=0,last=0;
  function draw(now){
   if(!running||document.hidden)return;
   if(now-last>40){
    last=now;const t=reduced.matches?0:(now-start)/1000;
    for(let y=0;y<180;y++)for(let x=0;x<180;x++){
     const dx=(x-90)/90,dy=(y-90)/90,r=Math.hypot(dx,dy),a=Math.atan2(dy,dx);
     // A travelling radial wave, folded by several angular currents. Bands originate at the centre.
     const folds=.12*Math.sin(a*5+r*7-t*.6)+.08*Math.sin(a*9-r*10+t*.4)+.045*Math.sin(dx*17+dy*11+t);
     const wave=(r+folds)*12-t*2.7+.5*Math.sin(a*3+r*5-t*.3);
     const n=((wave%palette.length)+palette.length)%palette.length,i=Math.floor(n),f=n-i;
     const c=palette[i],d=palette[(i+1)%palette.length];
     const ridge=1; // Preserve sampled RGB values; no extra saturation or brightness shift.
     const k=(y*180+x)*4;
     for(let q=0;q<3;q++)pixels.data[k+q]=Math.min(255,(c[q]*(1-f)+d[q]*f)*ridge);
     pixels.data[k+3]=255;
    }
    ctx.putImageData(pixels,0,0);
   }
   if(!reduced.matches)frame=requestAnimationFrame(draw);
  }
  function activate(){link.classList.add('is-energized');if(!running){running=true;start=performance.now();draw(start)}}
  function deactivate(){if(document.activeElement===link)return;link.classList.remove('is-energized');running=false;cancelAnimationFrame(frame)}
  link.addEventListener('pointerenter',activate);link.addEventListener('pointerleave',deactivate);
  link.addEventListener('focus',()=>{document.body.dataset.keyboardSymbol=link.dataset.oilSymbol;activate()});
  link.addEventListener('blur',()=>{delete document.body.dataset.keyboardSymbol;deactivate()});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){running=false;cancelAnimationFrame(frame)}else if(link.classList.contains('is-energized'))activate()});
 });
})();
