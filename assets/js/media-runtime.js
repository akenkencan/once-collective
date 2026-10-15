/* Shared media loading; all hover and inline films use the same source setup. */
(() => {
 const jobs=new WeakMap();
 function applyStart(video){const offset=Number(video.dataset.startTime)||0;if(offset<=0||video.dataset.startApplied)return;video.currentTime=offset;video.dataset.startApplied='true';video.addEventListener('seeking',()=>{if(video.loop&&video.currentTime<offset-.05)video.currentTime=offset})}
 function ensure(video){
  if(jobs.has(video))return jobs.get(video);
  const job=new Promise((resolve,reject)=>{
   if(video.readyState>=1){applyStart(video);resolve(video);return}
   video.preload='auto';video.playsInline=true;
   video.addEventListener('loadedmetadata',()=>{applyStart(video);resolve(video)},{once:true});
   video.addEventListener('error',()=>reject(video.error||new Error('Film unavailable')),{once:true});
   if(video.dataset.hls){
    const src=video.dataset.hls;
    if(window.Hls?.isSupported()&&!/^((?!chrome|android).)*safari/i.test(navigator.userAgent)){
     const hls=new Hls({maxBufferLength:20});hls.loadSource(src);hls.attachMedia(video);
     hls.on(Hls.Events.ERROR,(_,data)=>{if(data.fatal)reject(new Error(data.details))});
    }else{video.src=src;video.load()}
   }else video.load();
  });jobs.set(video,job);return job;
 }
 window.ONCEMedia={ensure};
})();
