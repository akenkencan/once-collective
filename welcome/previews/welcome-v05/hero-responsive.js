(() => {
 const copy=document.querySelector('.hero-copy'),ending=copy.querySelector('.hero-ending'),art=document.querySelector('.hero-art'),scene=art.querySelector('.scene'),reveal=copy.querySelector('.hero-affirmation'),intro=copy.querySelector('.hero-intro');
 const compact=matchMedia('(max-width:1050px)');
 function place(){
  if(compact.matches){scene.after(ending);reveal.style.height='0px';reveal.setAttribute('aria-hidden','true');return}
  if(ending.parentNode!==copy)copy.append(ending);
  const available=Math.max(0,copy.clientHeight-intro.offsetHeight-ending.offsetHeight-24);
  const imageWidth=360,imageHeight=imageWidth*1648/2944;
  const visible=innerWidth>=1296&&copy.clientWidth>=imageWidth&&available>=imageHeight;
  const height=visible?imageHeight:0;
  reveal.style.height=height+'px';
  reveal.setAttribute('aria-hidden',String(!visible||height<80));
 }
 const observer=new ResizeObserver(()=>requestAnimationFrame(place));[copy,intro,art].forEach(e=>observer.observe(e));compact.addEventListener('change',place);window.addEventListener('resize',place);document.fonts.ready.then(place);place();
})();