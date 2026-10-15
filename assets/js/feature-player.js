/* Shared showreel and UtopiaFound player. Reuses the Welcome triangle artwork and motion. */
document.querySelectorAll('[data-feature-player]').forEach(panel=>{
 const video=panel.querySelector('video'),slot=panel.querySelector('.reel-embedded-slot'),button=panel.querySelector('.feature-play'),dialog=document.querySelector('.reel-dialog'),expanded=dialog.querySelector('.reel-dialog-slot');
 let started=false;
 async function start(){video.muted=false;video.volume=1;button.hidden=true;started=true;expanded.append(video);dialog.showModal();try{await ONCEMedia.ensure(video);await video.play()}catch(e){video.dataset.playbackError=e.message;dialog.close();button.hidden=false}dialog.querySelector('.reel-close').focus()}
 button.addEventListener('click',start);
 video.addEventListener('pointerdown',()=>{video.muted=false;video.volume=1});
 video.addEventListener('click',e=>{
  if(!dialog.open){start();return}
  const r=video.getBoundingClientRect(),ratio=(video.videoWidth||16)/(video.videoHeight||9),w=Math.min(r.width,r.height*ratio),h=w/ratio,left=r.left+(r.width-w)/2,top=r.top+(r.height-h)/2;
  if(e.clientX<left+24||e.clientX>left+w-24||e.clientY<top+20||e.clientY>top+h){e.preventDefault();dialog.close()}
 });
 dialog.querySelector('.reel-close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',e=>{if(e.target===dialog||e.target===expanded)dialog.close()});
 dialog.addEventListener('close',()=>{video.pause();slot.prepend(video);button.hidden=false;button.setAttribute('aria-label',started?'Resume film':'Play film');button.focus({preventScroll:true})});
});
