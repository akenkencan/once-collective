(() => {
 document.querySelectorAll('.rotating-card').forEach(card=>{let angle=0;
 const rotate=()=>{angle-=90;card.style.setProperty('--card-angle',angle+'deg');card.setAttribute('aria-label','Rotate card 90 degrees counterclockwise. Current rotation '+Math.abs(angle%360)+' degrees')};
 card.addEventListener('click',rotate);card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();rotate()}});
 });
})();