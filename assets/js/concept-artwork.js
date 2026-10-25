// One image moves continuously between its reserved page position and the right-hand viewing area.
(()=>{
 const card=document.querySelector('.concept-darling-art'),trigger=card?.querySelector('.concept-art-trigger'),source=trigger?.querySelector('img'),dialog=document.querySelector('#concept-art-viewer'),image=dialog?.querySelector('img'),dimmer=dialog?.querySelector('.artwork-dimmer');if(!source||!dialog||!image||!dimmer)return;
 const reduced=matchMedia('(prefers-reduced-motion:reduce)');let motion=null,shade=null,revision=0,expanded=false;
 function destination(){const sourceBox=source.getBoundingClientRect(),h=Math.min(innerHeight*.9,(innerWidth-32)*1280/905),w=h*905/1280,right=Math.min(innerWidth-16,Math.max(w+16,sourceBox.right));return {left:right-w,top:(innerHeight-h)/2,width:w,height:h}}
 function place(r){Object.assign(image.style,{left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px'})}
 async function move(next){
  const run=++revision,wasOpen=dialog.open,from=wasOpen?image.getBoundingClientRect():source.getBoundingClientRect(),opacity=wasOpen?getComputedStyle(dimmer).opacity:'0';
  motion?.cancel();shade?.cancel();expanded=next;
  if(!wasOpen){dialog.showModal();card.classList.add('is-expanded');trigger.setAttribute('aria-expanded','true')}
  const landing=next?destination():source.getBoundingClientRect(),hasLanding=landing.width>0&&landing.height>0,to=hasLanding?landing:from;place(to);
  const start=`translate(${from.left-to.left}px,${from.top-to.top}px) scale(${from.width/to.width},${from.height/to.height})`,options={duration:reduced.matches?0:650,easing:'cubic-bezier(.22,.75,.22,1)',fill:'forwards'};
  motion=image.animate([{transform:start,opacity:1},{transform:'translate(0,0) scale(1)',opacity:hasLanding?1:0}],options);shade=dimmer.animate([{opacity},{opacity:next?1:0}],options);
  try{await motion.finished;if(run!==revision)return;motion.cancel();shade.cancel();motion=null;shade=null;dimmer.style.opacity=next?'1':'0';if(!next){dialog.close();card.classList.remove('is-expanded');trigger.setAttribute('aria-expanded','false');trigger.focus({preventScroll:true})}}catch{}
 }
 trigger.addEventListener('click',()=>move(true));dialog.addEventListener('click',event=>move(event.target===image?!expanded:false));dialog.addEventListener('cancel',e=>{e.preventDefault();move(false)});
 dialog.addEventListener('close',()=>{revision++;motion?.cancel();shade?.cancel();expanded=false;card.classList.remove('is-expanded');trigger.setAttribute('aria-expanded','false')});window.addEventListener('resize',()=>{if(dialog.open&&expanded)move(source.getBoundingClientRect().width>0)});
})();
