/* React canvas adaptation of Alex's supplied HeatWord experiment.
   Uses the official symbol bitmap; no randomisation, shape switching or replacement letters.
   Only redraws during pointer changes/short settling. Static colour for reduced motion. */
const {createElement:h,useEffect,useRef,useState}=React;
function HeatSymbol({symbol,active,point,heat=60,soft=50,area=50,intensity=1,edgeOnly=false}){
 const canvas=useRef(null);
 const state=useRef({image:null,field:null,raf:0,power:0,x:.5,y:.5});
 useEffect(()=>{let live=true;const img=new Image();img.onload=()=>{if(!live)return;const base=document.createElement('canvas');base.width=base.height=256;const g=base.getContext('2d',{willReadFrequently:true});g.fillStyle='#000';g.fillRect(0,0,256,256);g.shadowColor='white';g.shadowBlur=6+soft/8;for(let i=0;i<4;i++)g.drawImage(img,32,32,192,192);state.current.field=g.getImageData(0,0,256,256).data;state.current.image=img;paint(active?1:0,.5,.5)};img.src=`../../assets/symbols/white/${symbol}.png`;return()=>{live=false;cancelAnimationFrame(state.current.raf)}},[symbol,soft]);
 function paint(power,x,y){
  const c=canvas.current,s=state.current;if(!c||!s.field)return;
  const g=c.getContext('2d'),out=g.createImageData(256,256);
  // Original HeatWord field: cursor cooling, nonlinear reveal, thresholded neon palette.
  const stops=[[0,[255,150,225]],[.1,[255,90,190]],[.2,[255,50,60]],[.32,[255,150,40]],[.42,[255,228,100]],[.54,[120,215,255]],[.68,[40,120,245]],[.84,[12,44,150]],[1,[6,18,80]]];
  const spread=.5+area/100, radius=(60+heat*.5)*1.3*spread, reveal=(95+heat*.55)*1.3*spread;
  for(let py=0,i=0;py<256;py++)for(let px=0;px<256;px++,i+=4){
   const distance=Math.hypot(px-x*256,py-y*256), fall=Math.max(0,1-distance/radius);
   const value=s.field[i]*(1-power*(.35+heat*.0055)*fall);
   if(value<34||(edgeOnly&&s.field[i]>235))continue;
   const u=Math.max(0,Math.min(1,(value-34)/221));let b=1;while(b<stops.length-1&&u>stops[b][0])b++;
   const a=b-1,f=(u-stops[a][0])/(stops[b][0]-stops[a][0]);
   const t=Math.max(0,1-distance*distance/(reveal*reveal)),mix=power*t*t*(3-2*t);
   for(let j=0;j<3;j++)out.data[i+j]=150*(1-mix)+(stops[a][1][j]*(1-f)+stops[b][1][j]*f)*mix;
   out.data[i+3]=255*Math.max(0,Math.min(1,(value-34)/26))*power;
  }
  g.putImageData(out,0,0);
 }

 useEffect(()=>{const s=state.current;cancelAnimationFrame(s.raf);const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;let frames=0;function tick(){const target=active?intensity:0;s.power=reduced?target:s.power+(target-s.power)*.2;s.x=reduced?point.x:s.x+(point.x-s.x)*.25;s.y=reduced?point.y:s.y+(point.y-s.y)*.25;paint(s.power,s.x,s.y);if(!reduced&&++frames<32&&(Math.abs(target-s.power)>.005||Math.abs(point.x-s.x)>.005||Math.abs(point.y-s.y)>.005))s.raf=requestAnimationFrame(tick)}tick();return()=>cancelAnimationFrame(s.raf)},[active,point.x,point.y,heat,area,intensity]);
 return h('span',{className:'heat-symbol'},h('img',{src:`../../assets/symbols/white/${symbol}.png`,alt:'',width:80,height:80}),h('canvas',{ref:canvas,width:256,height:256,'aria-hidden':true}));
}
