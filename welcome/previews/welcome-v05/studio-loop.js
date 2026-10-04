(() => {
 const v=document.querySelector('video.studio-loop'),button=document.querySelector('.studio-play-retry');if(!v)return;
 v.muted=true;v.defaultMuted=true;v.volume=0;
 const play=()=>{v.muted=true;v.play().then(()=>button.hidden=true).catch(()=>{button.hidden=false})};
 v.addEventListener('canplay',play);v.addEventListener('playing',()=>button.hidden=true);button.addEventListener('click',play);
 if(window.Hls&&Hls.isSupported()){
  const h=new Hls({maxBufferLength:15});h.attachMedia(v);
  h.on(Hls.Events.MEDIA_ATTACHED,()=>h.loadSource(v.dataset.stream));h.on(Hls.Events.MANIFEST_PARSED,play);
  let retries=0;h.on(Hls.Events.ERROR,(_,data)=>{if(!data.fatal)return;if(retries++<2){if(data.type===Hls.ErrorTypes.MEDIA_ERROR)h.recoverMediaError();else h.startLoad()}else button.hidden=false});
 }else{v.src=v.dataset.stream;v.load()}
 new IntersectionObserver(entries=>{if(entries[0].isIntersecting)play()},{threshold:.1}).observe(v);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)play()});
})();
