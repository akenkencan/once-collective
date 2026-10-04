// Share the same cursor-responsive canvas treatment with the supporting symbols.
function SurfaceHeat({symbol}){
 const [active,setActive]=React.useState(false),[point,setPoint]=React.useState({x:.5,y:.5});
 return React.createElement('span',{className:'surface-heat',onPointerEnter:()=>setActive(true),onPointerLeave:()=>setActive(false),onPointerMove:e=>{const r=e.currentTarget.getBoundingClientRect();setPoint({x:(e.clientX-r.left)/r.width,y:(e.clientY-r.top)/r.height})}},React.createElement(HeatSymbol,{symbol,active,point}));
}
document.querySelectorAll('img.section-symbol').forEach(img=>{
 const symbol=img.src.split('/').pop().replace('.png','');
 const mount=document.createElement('span');mount.className=img.className+' heat-mount';mount.setAttribute('role','img');mount.setAttribute('aria-label',img.alt);img.replaceWith(mount);
 ReactDOM.createRoot(mount).render(React.createElement(SurfaceHeat,{symbol}));
});
document.querySelectorAll('.enter-portal,.header-enter').forEach(link=>{
 link.addEventListener('pointermove',e=>{const r=link.getBoundingClientRect();link.style.setProperty('--heat-x',((e.clientX-r.left)/r.width*100)+'%');link.style.setProperty('--heat-y',((e.clientY-r.top)/r.height*100)+'%')});
});
// Cover symbols rendered later by the comparison component as well.
function mountRemainingSymbols(){
 document.querySelectorAll('img.frame-heading-symbol,img.section-symbol').forEach(img=>{
  if(img.closest('.heat-symbol'))return;
  const symbol=img.src.split('/').pop().replace('.png',''),mount=document.createElement('span');
  mount.className=img.className+' heat-mount';mount.setAttribute('role','img');mount.setAttribute('aria-label',img.alt||symbol);img.replaceWith(mount);
  ReactDOM.createRoot(mount).render(React.createElement(SurfaceHeat,{symbol}));
 });
}
new MutationObserver(mountRemainingSymbols).observe(document.getElementById('symset-react'),{childList:true,subtree:true});mountRemainingSymbols();
// The footer lettering uses the same local field cooling and palette, at device resolution.
const portal=document.querySelector('.enter-portal');
const logo=portal.querySelector('.portal-logo'),logoWrap=document.createElement('span');
logoWrap.className='thermal-target thermal-logo';logo.before(logoWrap);logoWrap.append(logo);
const label=portal.querySelector('.portal-label');label.classList.add('thermal-target');
[logoWrap,label].forEach(target=>{
 const overlay=document.createElement('canvas');overlay.setAttribute('aria-hidden','true');
 const words=target===label?label.textContent.trim():null;target.append(overlay);
 let field,w,h,power=0,want=0,x=.5,y=.5,tx=.5,ty=.5,raf=0;
 const stops=[[255,150,225],[255,50,60],[255,228,100],[120,215,255],[40,120,245],[6,18,80]];
 function build(){
  const r=target.getBoundingClientRect();w=Math.max(1,Math.round((r.width+16)*2));h=Math.max(1,Math.round((r.height+16)*2));overlay.width=w;overlay.height=h;
  const base=document.createElement('canvas');base.width=w;base.height=h;const g=base.getContext('2d',{willReadFrequently:true});
  g.fillStyle='white';g.shadowColor='white';g.shadowBlur=3;
  if(words){
   const css=getComputedStyle(label),range=document.createRange();range.selectNodeContents(label.firstChild);const textRect=range.getBoundingClientRect();
   g.font=`${css.fontWeight} ${parseFloat(css.fontSize)*2}px ${css.fontFamily}`;
   g.letterSpacing=`${(parseFloat(css.letterSpacing)||0)*2}px`;
   const metrics=g.measureText(words),ascent=metrics.fontBoundingBoxAscent,descent=metrics.fontBoundingBoxDescent;
   g.textBaseline='alphabetic';
   g.fillText(words,(textRect.left-r.left+8)*2,(textRect.top-r.top+8)*2+(textRect.height*2-ascent-descent)/2+ascent);
  }
  else if(logo.complete&&logo.naturalWidth)g.drawImage(logo,16,16,w-32,h-32);
  field=g.getImageData(0,0,w,h).data;
 }
 function tick(){
  power+=(want-power)*.13;x+=(tx-x)*.13;y+=(ty-y)*.13;
  if(field){const g=overlay.getContext('2d'),out=g.createImageData(w,h),radius=Math.max(h*1.8,w*.65);
   for(let py=0,i=0;py<h;py++)for(let px=0;px<w;px++,i+=4){
    const alpha=field[i+3]/255;if(!alpha)continue;
    const distance=Math.hypot(px-x*w,py-y*h),t=Math.max(0,1-distance/radius),reveal=t*t*(3-2*t)*power;
    const heat=Math.min(4.99,Math.max(0,(1-t*.72)*4.99)),a=Math.floor(heat),f=heat-a;
    for(let j=0;j<3;j++)out.data[i+j]=stops[a][j]*(1-f)+stops[Math.min(5,a+1)][j]*f;
    out.data[i+3]=alpha*reveal*255;
   }g.putImageData(out,0,0);
  }
  if(Math.abs(want-power)>.005||Math.abs(tx-x)>.005||Math.abs(ty-y)>.005)raf=requestAnimationFrame(tick);else raf=0;
 }
 function start(){if(!raf)raf=requestAnimationFrame(tick)}
 portal.addEventListener('pointermove',e=>{const r=target.getBoundingClientRect();tx=(e.clientX-r.left+8)/(r.width+16);ty=(e.clientY-r.top+8)/(r.height+16);want=1;start()});
 portal.addEventListener('pointerleave',()=>{want=0;start()});
 portal.addEventListener('focus',()=>{tx=ty=.5;want=1;start()});portal.addEventListener('blur',()=>{want=0;start()});
 new ResizeObserver(build).observe(target);logo.addEventListener('load',build);document.fonts.ready.then(build);build();
});
