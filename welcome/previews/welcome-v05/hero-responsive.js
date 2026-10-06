(() => {
 const copy=document.querySelector('.hero-copy'),ending=copy.querySelector('.hero-ending'),art=document.querySelector('.hero-art'),scene=art.querySelector('.scene'),reveal=copy.querySelector('.hero-affirmation'),intro=copy.querySelector('.hero-intro');
 const compact=matchMedia('(max-width:1050px)');
 function place(){
  if(compact.matches){scene.after(ending);reveal.style.height='0px';reveal.setAttribute('aria-hidden','true');return}
  if(ending.parentNode!==copy)copy.append(ending);
  const available=Math.max(0,copy.clientHeight-intro.offsetHeight-ending.offsetHeight-24);
  const progress=Math.max(0,Math.min(1,(innerWidth-1080)/360));
  const height=Math.min(available,copy.clientWidth*.72)*progress;
  reveal.style.height=height+'px';reveal.style.setProperty('--reveal-progress',progress);reveal.setAttribute('aria-hidden',String(height<80));
 }
 const observer=new ResizeObserver(()=>requestAnimationFrame(place));[copy,intro,art].forEach(e=>observer.observe(e));compact.addEventListener('change',place);window.addEventListener('resize',place);document.fonts.ready.then(place);place();
})();