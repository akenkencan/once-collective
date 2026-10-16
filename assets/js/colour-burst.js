/* ONCE Colour Burst. Reuse with data-colour-burst on any button/link.
   Symbols share the same renderer through ONCEColourBurst.attach(element, surface). */
(() => {
 const reduced=matchMedia('(prefers-reduced-motion:reduce)'),registry=new Map();
 const spectrum=["#FF9EC7", "#C9A0FF", "#8FD3FF", "#9FF0C0", "#F7E58A", "#FFB38A"].map(hex=>[parseInt(hex.slice(1,3),16),parseInt(hex.slice(3,5),16),parseInt(hex.slice(5,7),16)]),dark=[35,21,30];
 function attach(element,surface){
  if(registry.has(element))return registry.get(element);
  const canvas=document.createElement('canvas');canvas.className='burst-canvas';canvas.width=canvas.height=180;surface.replaceChildren(canvas);
  const ink=element.querySelector('.burst-ink');
  const ctx=canvas.getContext('2d',{alpha:true}),pixels=ctx.createImageData(180,180),seed=Math.random()*6.283;let active=false,wanted=false,frame=0,last=0,lastStep=0,reveal=0,flow=0;
  function noise(x,y){const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy,ux=fx*fx*(3-2*fx),uy=fy*fy*(3-2*fy);const hash=(a,b)=>{const n=Math.sin(a*127.1+b*311.7+seed)*43758.5453;return n-Math.floor(n)};return (hash(ix,iy)*(1-ux)+hash(ix+1,iy)*ux)*(1-uy)+(hash(ix,iy+1)*(1-ux)+hash(ix+1,iy+1)*ux)*uy}
  function paint(now){
   if(!active)return;if(document.hidden){frame=requestAnimationFrame(paint);return;}
   if(now-last>32){const dt=Math.min(.06,Math.max(0,(now-lastStep)/1000));lastStep=now;last=now;reveal=reduced.matches?(wanted?1:0):Math.max(0,Math.min(1,reveal+(wanted?dt/.95:-dt/.72)));flow+=dt*(wanted?(.7+3.7*reveal):-4.4);const t=reduced.matches?0:flow;const eased=reveal*reveal*(3-2*reveal);element.dataset.burstProgress=String(Math.round(reveal*100));element.dataset.burstState=wanted?(reveal===1?'flowing':'entering'):'leaving';
    for(let y=0;y<180;y++)for(let x=0;x<180;x++){
     const dx=(x-90)/90,dy=(y-90)/90,r=Math.hypot(dx,dy),a=Math.atan2(dy,dx);
     // One fluid level set controls both the visible edge and every nested colour band.
     const n=noise(dx*3.2+t*.035,dy*3.2-t*.025),fine=noise(dx*10+n*2,dy*10-n*2);
     const fold=.10*Math.sin(a*5+r*6-t*.28)+.055*Math.sin(a*9-r*8+t*.2);
     const field=r+(n-.5)*.55*Math.min(1,r*4)+(fine-.5)*.10+fold;
     const front=eased*1.95;
     const depth=front-field;
     const phase=((depth*1.85+t*.075)%1+1)%1*6,index=Math.floor(phase),fraction=phase-index;
     const smooth=fraction*fraction*(3-2*fraction),next=(index+1)%6,k=(y*180+x)*4;
     const grain=(noise(x*.8+t,y*.8)-.5)*6;
     const c=spectrum[index].map((v,q)=>v*(1-smooth)+spectrum[next][q]*smooth),lum=c[0]*.299+c[1]*.587+c[2]*.114,shade=.83+.13*n;for(let q=0;q<3;q++)pixels.data[k+q]=(lum*.1+c[q]*.9)*shade+grain;
     // A fine bronze/dark edge, rather than red or brown across the coloured body.
     const lip=Math.max(0,1-Math.abs(depth-.018)/.025)*.38;
     for(let q=0;q<3;q++)pixels.data[k+q]=pixels.data[k+q]*(1-lip)+dark[q]*lip;
     pixels.data[k+3]=255*Math.max(0,Math.min(1,depth*42));
    }ctx.putImageData(pixels,0,0);if(ink){const mask='url('+canvas.toDataURL('image/png')+')';ink.style.maskImage=mask;ink.style.webkitMaskImage=mask;}
   }
   if(!wanted&&reveal===0){active=false;element.classList.remove('is-bursting');element.dataset.burstState='idle';return}if(!reduced.matches)frame=requestAnimationFrame(paint);
  }
  function on(){wanted=true;element.classList.add('is-bursting');if(!active){active=true;last=0;lastStep=performance.now();paint(lastStep)}else if(reduced.matches)paint(performance.now()+33)}
  function off(){wanted=false;if(reduced.matches){reveal=0;active=false;cancelAnimationFrame(frame);element.classList.remove('is-bursting');element.dataset.burstState='idle'}}
  element.addEventListener('pointerenter',on);element.addEventListener('pointerleave',()=>{if(!element.matches(':focus-visible'))off()});element.addEventListener('focus',on);element.addEventListener('blur',off);
  const api={on,off};registry.set(element,api);return api;
 }
 document.querySelectorAll('[data-colour-burst]').forEach(el=>{const label=document.createElement('span');label.className='burst-label';while(el.firstChild)label.append(el.firstChild);el.append(label);const ink=label.cloneNode(true);ink.className='burst-ink';ink.setAttribute('aria-hidden','true');el.append(ink);const surface=document.createElement('span');surface.className='burst-surface';surface.setAttribute('aria-hidden','true');el.prepend(surface);attach(el,surface)});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)registry.forEach((api,element)=>{if(element.matches(':hover')||document.activeElement===element||element.classList.contains('is-energized'))api.on()})});
 window.ONCEColourBurst={attach};
})();
