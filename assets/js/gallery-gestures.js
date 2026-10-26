// One deliberate sideways gesture advances one graphic; vertical reading and zoom remain native.
(()=>{
 function attach(element,{step,enabled=()=>true,canSwipe=enabled,now=()=>performance.now()}){
  let lastWheel=-Infinity,sum=0,taken=false,blockClickUntil=0,touchStart=null,pinched=false;const touches=new Set();
  function wheel(event){
   if(!enabled()||event.ctrlKey||event.metaKey)return;
   const x=event.deltaX|| (event.shiftKey?event.deltaY:0),y=event.shiftKey?0:event.deltaY;
   if(Math.abs(x)<=Math.abs(y)*1.2||!x)return;
   event.preventDefault();const time=now();if(time-lastWheel>220){sum=0;taken=false}lastWheel=time;if(taken)return;
   const amount=x*(event.deltaMode===1?16:event.deltaMode===2?element.clientWidth:1);if(sum&&Math.sign(amount)!==Math.sign(sum))sum=0;sum+=amount;
   if(Math.abs(sum)>=55){taken=true;step(sum>0?1:-1)}
  }
  function down(event){if(event.pointerType!=='touch')return;touches.add(event.pointerId);if(touches.size>1){pinched=true;touchStart=null}else if(canSwipe()){pinched=false;touchStart={x:event.clientX,y:event.clientY}}}
  function end(event){if(event.pointerType!=='touch')return;const start=touchStart,one=touches.size===1;touches.delete(event.pointerId);
   if(event.type!=='pointercancel'&&one&&!pinched&&start&&canSwipe()){const dx=event.clientX-start.x,dy=event.clientY-start.y;if(Math.abs(dx)>48&&Math.abs(dx)>Math.abs(dy)*1.3){blockClickUntil=now()+500;step(dx<0?1:-1)}}
   if(!touches.size){touchStart=null;pinched=false}
  }
  function click(event){if(now()<blockClickUntil){event.preventDefault();event.stopImmediatePropagation()}}
  element.addEventListener('wheel',wheel,{passive:false});element.addEventListener('pointerdown',down,{passive:true});element.addEventListener('pointerup',end,{passive:true});element.addEventListener('pointercancel',end,{passive:true});element.addEventListener('click',click,true);
  return {destroy(){element.removeEventListener('wheel',wheel);element.removeEventListener('pointerdown',down);element.removeEventListener('pointerup',end);element.removeEventListener('pointercancel',end);element.removeEventListener('click',click,true)}};
 }
 window.ONCEGalleryGestures={attach};
})();
