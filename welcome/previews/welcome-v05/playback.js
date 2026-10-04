/* Native controls, with HLS.js for browsers without native HLS playback. */
(() => {
 const video=document.getElementById('showreel-video');
 const button=document.querySelector('.play-showreel');
 const status=document.querySelector('.video-status');
 let hls;
 function failure(message){status.textContent=message;status.hidden=false;button.hidden=false;button.setAttribute('aria-label','Retry showreel');}
 function setup(){
  if(window.Hls&&Hls.isSupported()){
   hls=new Hls();hls.loadSource(video.dataset.stream);hls.attachMedia(video);
   hls.on(Hls.Events.ERROR,(_,data)=>{if(data.fatal)failure('The film could not load. Check your connection and try again.');});
  }else if(video.canPlayType('application/vnd.apple.mpegurl'))video.src=video.dataset.stream;
  else failure('This browser cannot play the film. Please try a current browser.');
 }
 setup();
 button.addEventListener('click',async()=>{
  status.hidden=true;
  if(video.error){if(hls)hls.destroy();setup();}
  else if(hls)hls.startLoad();
  try{await video.play();}catch(e){failure('Playback could not start. Please try again.');}
 });
 video.addEventListener('playing',()=>{button.hidden=true;status.hidden=true;});
 video.addEventListener('error',()=>failure('The film could not load. Please try again.'));
})();
