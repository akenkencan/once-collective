// Low-resolution liquid interference, drawn only while the invitation is in view.
(()=>{
 const canvas=document.querySelector('.found-liquid-bar'),button=canvas?.closest('button');if(!button)return;const ctx=canvas.getContext('2d',{alpha:false});if(!ctx)return;
 const reduced=matchMedia('(prefers-reduced-motion:reduce)'),connection=navigator.connection;let visible=false,frame=0,last=0,time=0,hover=0,target=0,px=.5;
 const material=window.ONCEPleromaPalette;if(!material)return;const palette=Array.from({length:6},(_,i)=>material['c'+i].slice(1).match(/../g).map(hex=>parseInt(hex,16)));palette.push(palette[0]);
 canvas.width=560;canvas.height=72;const data=ctx.createImageData(canvas.width,canvas.height);
 function draw(){const w=canvas.width,h=canvas.height,t=time;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
   const u=x/w,v=y/h,dx=u-px,warp=Math.sin(u*9+Math.cos(v*4+t*.23)*2+t*.16),swirl=Math.sin(v*5-u*4+t*.21)+Math.cos(u*7+v*3-t*.18),field=Math.sin(u*14+warp*2.2+swirl*1.6+t*.3)+Math.cos(v*6+warp*1.3-t*.2),phase=(field*.74+swirl*.45+t*.12+8)%1;
   const pos=phase*(palette.length-1),i=Math.floor(pos),f=pos-i,a=palette[i],b=palette[i+1],edge=Math.pow(Math.abs(Math.sin(field*3+swirl*2)),12),light=.82+edge*.18+hover*.08*Math.exp(-dx*dx*12),index=(y*w+x)*4;
   data.data[index]=(a[0]+(b[0]-a[0])*f)*light;data.data[index+1]=(a[1]+(b[1]-a[1])*f)*light;data.data[index+2]=(a[2]+(b[2]-a[2])*f)*light;data.data[index+3]=255;
  }ctx.putImageData(data,0,0);
 }
 function animate(now){frame=0;if(!visible||document.hidden||button.getAttribute('aria-expanded')==='true')return;if(now-last>65){time+=Math.min((now-last)/1000,.1)*(1+hover*.3);last=now;hover+=(target-hover)*.08;draw()}if(!reduced.matches&&!connection?.saveData)frame=requestAnimationFrame(animate)}
 function start(){if(visible&&!document.hidden&&!frame){last=performance.now();draw();if(!reduced.matches&&!connection?.saveData&&button.getAttribute('aria-expanded')!=='true')frame=requestAnimationFrame(animate)}}
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)start();else{cancelAnimationFrame(frame);frame=0}},{rootMargin:'100px'}).observe(button);
 new MutationObserver(()=>{cancelAnimationFrame(frame);frame=0;start()}).observe(button,{attributes:true,attributeFilter:['aria-expanded']});
 button.addEventListener('pointermove',e=>{const r=button.getBoundingClientRect();px=(e.clientX-r.left)/r.width;target=1},{passive:true});button.addEventListener('pointerleave',()=>target=0);button.addEventListener('focus',()=>target=1);button.addEventListener('blur',()=>target=0);document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0}else start()});reduced.addEventListener('change',()=>{cancelAnimationFrame(frame);frame=0;start()});draw();
})();
