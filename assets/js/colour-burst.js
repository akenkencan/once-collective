/* ONCE Colour Burst. Reuse with data-colour-burst on any button/link.
   Symbols share the same renderer through ONCEColourBurst.attach(element, surface). */
(() => {
 const reduced=matchMedia('(prefers-reduced-motion:reduce)'),registry=new Map();
 let texture=null,dark=[12,19,20];const image=new Image();image.src='/assets/images/colour-burst-reference-opal.webp';
 image.onload=()=>{const c=document.createElement('canvas');c.width=256;c.height=194;const x=c.getContext('2d');x.drawImage(image,0,0,256,194);texture=x.getImageData(0,0,256,194).data;
  let darkest=Infinity;for(let i=0;i<texture.length;i+=4){const sum=texture[i]+texture[i+1]+texture[i+2];if(sum<darkest){darkest=sum;dark=[texture[i],texture[i+1],texture[i+2]]}}
  // Use only luminous oil bands from the supplied image. Propagate the nearest
  // eligible sampled pixel through its dark/brown regions, without inventing hues.
  const seen=new Uint8Array(256*194),queue=new Int32Array(256*194);let head=0,tail=0;
  for(let i=0;i<seen.length;i++){const k=i*4,a=texture[k],b=texture[k+1],c=texture[k+2];if(Math.max(a,b,c)>150&&Math.min(a,b,c)>85&&Math.max(a,b,c)-Math.min(a,b,c)>22&&((c>a*.92)||(b>a*1.08)||(a>175&&b>165&&c>115))&&(.2126*a+.7152*b+.0722*c)>130){seen[i]=1;queue[tail++]=i}}
  while(head<tail){const i=queue[head++],px=i%256,py=Math.floor(i/256);for(const j of [px>0?i-1:-1,px<255?i+1:-1,py>0?i-256:-1,py<193?i+256:-1])if(j>=0&&!seen[j]){seen[j]=1;queue[tail++]=j;for(let q=0;q<3;q++)texture[j*4+q]=texture[i*4+q]}}};
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
     if(texture){const sx=u*254,sy=v*192,ix=Math.floor(sx),iy=Math.floor(sy),fx=sx-ix,fy=sy-iy;
      for(let q=0;q<3;q++){const p=(iy*256+ix)*4+q;pixels.data[k+q]=(texture[p]*(1-fx)+texture[p+4]*fx)*(1-fy)+(texture[p+1024]*(1-fx)+texture[p+1028]*fx)*fy}
     }else{pixels.data[k]=116;pixels.data[k+1]=179;pixels.data[k+2]=204}
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
