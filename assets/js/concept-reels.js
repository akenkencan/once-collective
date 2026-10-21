// Two steady film strips, loaded only on desktop when their section approaches.
(()=>{
 const stage=document.querySelector('.concept-film-stage');if(!stage)return;
 const desktop=matchMedia('(min-width:901px)'),reduced=matchMedia('(prefers-reduced-motion:reduce)');let built=false,near=false;
 function sync(){
  if(desktop.matches&&near&&!built){
   stage.querySelectorAll('.concept-art-reel').forEach((reel,index)=>{const track=reel.querySelector('.concept-art-reel-track'),sequence=track.querySelector('.concept-art-reel-sequence'),copy=sequence.cloneNode(true);copy.setAttribute('aria-hidden','true');track.append(copy);track.querySelectorAll('img[data-reel-src]').forEach(img=>{img.src=img.dataset.reelSrc;img.removeAttribute('data-reel-src')});const size=()=>{const duration=sequence.getBoundingClientRect().height/22;track.style.animationDuration=duration+'s';if(index)track.style.animationDelay=-(duration*.27)+'s'};new ResizeObserver(size).observe(sequence);size()});built=true;
  }
  stage.classList.toggle('reels-running',desktop.matches&&near&&!document.hidden&&!reduced.matches);
 }
 new IntersectionObserver(entries=>{near=entries[0].isIntersecting;sync()},{rootMargin:'200px'}).observe(stage);desktop.addEventListener('change',sync);reduced.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);sync();
})();
