/* Shared HLS setup: bounded HD opening cache, then normal adaptive playback. */
(()=>{
 const jobs=new WeakMap();
 function applyStart(video){const offset=Number(video.dataset.startTime)||0;if(offset<=0||video.dataset.startApplied)return;video.currentTime=offset;video.dataset.startApplied='true';video.addEventListener('seeking',()=>{if(video.loop&&video.currentTime<offset-.05)video.currentTime=offset})}
 function setup(video,warm){
  if(jobs.has(video)){const old=jobs.get(video);if(!warm)old.activate();return old}
  let resolveReady,rejectReady,resolveWarm,rejectWarm;
  const record={hls:null,active:!warm,stopped:false,networkRetries:0,mediaRetries:0,ready:new Promise((a,b)=>{resolveReady=a;rejectReady=b}),warm:new Promise((a,b)=>{resolveWarm=a;rejectWarm=b})};record.ready.catch(()=>{});record.warm.catch(()=>{});
  record.activate=()=>{record.active=true;video.preload='auto';if(record.hls){Object.assign(record.hls.config,{maxBufferLength:20,maxMaxBufferLength:40,maxBufferSize:60*1000*1000,backBufferLength:30});if(record.stopped){record.stopped=false;record.hls.startLoad(-1)}}};
  jobs.set(video,record);video.playsInline=true;video.preload=warm?'metadata':'auto';video.dataset.warmStart=warm?'warming':'playback';
  const ready=()=>{applyStart(video);resolveReady(video)},fail=error=>{rejectReady(error);rejectWarm(error);video.dataset.warmStart='unavailable';jobs.delete(video);record.hls?.destroy()};
  video.addEventListener('loadedmetadata',ready,{once:true});video.addEventListener('error',()=>fail(video.error||new Error('Film unavailable')),{once:true});video.addEventListener('play',record.activate);if(video.readyState>=1)ready();
  if(video.dataset.hls){
   if(window.Hls?.isSupported()&&!/^((?!chrome|android).)*safari/i.test(navigator.userAgent)){
    const hls=record.hls=new Hls(warm?{autoStartLoad:false,maxBufferLength:4,maxMaxBufferLength:8,maxBufferSize:20*1000*1000,backBufferLength:30}:{autoStartLoad:false,maxBufferLength:20,backBufferLength:30});
    hls.on(Hls.Events.MANIFEST_PARSED,()=>{
     // Pick an HD opening for these art films; subsequent fragments remain fully adaptive.
     if(video.hasAttribute('data-quality-first')&&!navigator.connection?.saveData&&!/^(slow-)?2g$/.test(navigator.connection?.effectiveType||'')){
      const levels=hls.levels||[],limit=1920;let chosen=-1;
      levels.forEach((level,i)=>{if(level.width<=limit&&(chosen<0||level.width>levels[chosen].width))chosen=i});
      if(chosen>=0){hls.startLevel=chosen;video.dataset.initialQuality=levels[chosen].width+'x'+levels[chosen].height}
     }
     hls.startLoad(-1);
    });
    hls.on(Hls.Events.BUFFER_APPENDED,()=>{let ahead=0;for(let i=0;i<video.buffered.length;i++)if(video.buffered.start(i)<=video.currentTime+.1)ahead=Math.max(ahead,video.buffered.end(i)-video.currentTime);
     if(ahead>=4){if(!record.active&&!record.stopped){hls.stopLoad();record.stopped=true;video.dataset.warmStart='ready'}resolveWarm(video)}
    });
    hls.on(Hls.Events.ERROR,(_,data)=>{if(!data.fatal)return;if(data.type===Hls.ErrorTypes?.NETWORK_ERROR&&record.networkRetries++<2){hls.startLoad(-1);return}if(data.type===Hls.ErrorTypes?.MEDIA_ERROR&&record.mediaRetries++<1){hls.recoverMediaError();return}fail(new Error(data.details))});hls.loadSource(video.dataset.hls);hls.attachMedia(video);
   }else{video.addEventListener('loadeddata',()=>{video.dataset.warmStart='ready';resolveWarm(video)},{once:true});video.src=video.dataset.hls;video.preload='auto';video.load()}
  }else{video.addEventListener('loadeddata',()=>resolveWarm(video),{once:true});video.load()}
  return record;
 }
 window.ONCEMedia={ensure(video){return setup(video,false).ready},warm(video){return setup(video,true).warm}};
})();
