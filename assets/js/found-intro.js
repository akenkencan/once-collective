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
