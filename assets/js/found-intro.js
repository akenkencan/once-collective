// The three lines come into typographic register around the heading's central axis.
(()=>{
 const heading=document.querySelector('.found-main-heading');if(!heading)return;
 const lines=[...heading.children],reduced=matchMedia('(prefers-reduced-motion:reduce)');let pending=false;
 function update(){pending=false;if(reduced.matches){lines.forEach(line=>{line.style.opacity='1';line.style.transform='none';line.style.letterSpacing='normal';line.style.filter='none'});return}
  const top=heading.getBoundingClientRect().top;
  lines.forEach((line,i)=>{const raw=Math.max(0,Math.min(1,(innerHeight*.73-top-i*36)/(innerHeight*.35))),p=raw*raw*(3-2*raw);line.style.opacity=String(.52+.48*p);line.style.transform='translateX('+((i%2?-1:1)*9*(1-p))+'px)';line.style.letterSpacing=((1-p)*.024)+'em';line.style.filter='blur('+((1-p)*.65)+'px)';line.dataset.registered=p.toFixed(3)});
 }
 function request(){if(!pending){pending=true;requestAnimationFrame(update)}}
 window.addEventListener('scroll',request,{passive:true});window.addEventListener('resize',request);reduced.addEventListener('change',request);document.fonts?.ready.then(request);request();
})();
// Each phrase develops slowly as it enters view, without stopping document flow.
(()=>{
 const heading=document.querySelector('.found-signal-line')?.parentElement;if(!heading)return;
 const section=document.createElement('section'),stage=document.createElement('div');section.className='found-signal-scroll';section.id='found-experience';stage.className='found-signal-stage';heading.before(section);section.append(stage);stage.append(heading);
 const lines=[...heading.querySelectorAll('.found-signal-line')],reduced=matchMedia('(prefers-reduced-motion:reduce)');let pending=false;
 heading.classList.add('found-signal-heading','is-exposing');
 function update(){pending=false;
  lines.forEach(line=>{const raw=Math.max(0,Math.min(1,(innerHeight*.92-line.getBoundingClientRect().top)/(innerHeight*.62))),p=reduced.matches?1:raw*raw*(3-2*raw);line.style.setProperty('--exposure',String(p));line.style.setProperty('--exposure-edge',(p*122-11)+'%');const fade=Math.max(0,Math.min(1,(p-.72)/.28));line.style.setProperty('--spectrum-strength',String(1-fade*fade*(3-2*fade)));line.dataset.exposure=p.toFixed(3)})
 }
 function request(){if(!pending){pending=true;requestAnimationFrame(update)}}
 window.addEventListener('scroll',request,{passive:true});window.addEventListener('resize',request);reduced.addEventListener('change',request);document.fonts?.ready.then(request);request();
})();
