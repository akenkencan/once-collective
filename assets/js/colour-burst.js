/* ONCE Colour Burst. Reuse with data-colour-burst on any button/link.
   Symbols share the same renderer through ONCEColourBurst.attach(element, surface). */
(() => {
 const reduced=matchMedia('(prefers-reduced-motion:reduce)'),registry=new Map();
 const spectrum=["#1E3A5F", "#3E6FA8", "#7A4FA0", "#C2507E", "#D9A441", "#4F8F5B"].map(hex=>[parseInt(hex.slice(1,3),16),parseInt(hex.slice(3,5),16),parseInt(hex.slice(5,7),16)]),dark=[35,21,30];
 function attach(element,surface){
  if(registry.has(element))return registry.get(element);
  const canvas=document.createElement('canvas');canvas.className='burst-canvas';canvas.width=canvas.height=180;surface.replaceChildren(canvas);
  const liquidMatte=surface.classList.contains('burst-surface');
  const ctx=canvas.getContext('2d',{alpha:liquidMatte}),pixels=ctx.createImageData(180,180),seed=Math.random()*6.283;let active=false,frame=0,last=0,start=0;
  function noise(x,y){const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy,ux=fx*fx*(3-2*fx),uy=fy*fy*(3-2*fy);const hash=(a,b)=>{const n=Math.sin(a*127.1+b*311.7+seed)*43758.5453;return n-Math.floor(n)};return (hash(ix,iy)*(1-ux)+hash(ix+1,iy)*ux)*(1-uy)+(hash(ix,iy+1)*(1-ux)+hash(ix+1,iy+1)*ux)*uy}
  function paint(now){
   if(!active||document.hidden)return;
   if(now-last>32){last=now;const t=reduced.matches?0:(now-start)/1000*2.775;
    for(let y=0;y<180;y++)for(let x=0;x<180;x++){
     const dx=(x-90)/90-.045*Math.sin(t*.7+seed),dy=(y-90)/90-.045*Math.cos(t*.6+seed),r=Math.hypot(dx,dy),a=Math.atan2(dy,dx);
     const fold=.13*Math.sin(a*5+r*7-t*.7+seed)+.09*Math.sin(a*8-r*9+t*.6)+.07*Math.sin(dx*11+dy*8-t*.5);
     const u=((r+fold-t*.25)%1+1)%1,v=((a/6.283+.09*Math.sin(r*5+a*3+t*.35)+t*.018+seed)%1+1)%1;
     const k=(y*180+x)*4;
     const phase=((u+v*.16)*6)%6,index=Math.floor(phase),fraction=phase-index;
     const blend=Math.max(0,Math.min(1,(fraction-.5)*2.35+.5)),smooth=blend*blend*(3-2*blend),next=(index+1)%6;
     for(let q=0;q<3;q++)pixels.data[k+q]=spectrum[index][q]*(1-smooth)+spectrum[next][q]*smooth;
     // Thin dark currents occupy only a small fraction of the material.
     const seam=Math.sin((r+fold-t*.25)*42+a*.8);if(r>.78&&seam>.998){const mix=(seam-.998)/.002*.45;for(let q=0;q<3;q++)pixels.data[k+q]=pixels.data[k+q]*(1-mix)+dark[q]*mix}
     const reveal=reduced.matches?1:Math.min(1,(now-start)/280),rough=noise(dx*5+t*.13,dy*5-t*.1)*.65+noise(dx*13-t*.08,dy*13)*.35;
     const edge=r+(rough-.5)*.48*Math.min(1,r*4)+fold*.35;
     pixels.data[k+3]=liquidMatte?255*Math.max(0,Math.min(1,((1-Math.pow(1-reveal,2))*1.85-edge)*24)):255;
    }ctx.putImageData(pixels,0,0);
   }
   if(!reduced.matches)frame=requestAnimationFrame(paint);
  }
  function on(){element.classList.add('is-bursting');if(!active){active=true;start=performance.now();paint(start)}}
  function off(){element.classList.remove('is-bursting');active=false;cancelAnimationFrame(frame)}
  element.addEventListener('pointerenter',on);element.addEventListener('pointerleave',()=>{if(document.activeElement!==element)off()});element.addEventListener('focus',on);element.addEventListener('blur',off);
  const api={on,off};registry.set(element,api);return api;
 }
 document.querySelectorAll('[data-colour-burst]').forEach(el=>{const surface=document.createElement('span');surface.className='burst-surface';surface.setAttribute('aria-hidden','true');el.prepend(surface);attach(el,surface)});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)registry.forEach(api=>api.off())});
 window.ONCEColourBurst={attach};
})();
