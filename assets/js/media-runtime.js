/* Shared media setup, with bounded first-segment warming for Found. */
(()=>{
 const jobs=new WeakMap();
 function applyStart(video){const offset=Number(video.dataset.startTime)||0;if(offset<=0||video.dataset.startApplied)return;video.currentTime=offset;video.dataset.startApplied='true';video.addEventListener('seeking',()=>{if(video.loop&&video.currentTime<offset-.05)video.currentTime=offset})}
 function setup(video,warm){
  if(jobs.has(video)){const old=jobs.get(video);if(!warm)old.activate();return old}
  let resolveReady,rejectReady,resolveWarm,rejectWarm;const record={hls:null,active:!warm,stopped:false,ready:new Promise((resolve,reject)=>{resolveReady=resolve;rejectReady=reject}),warm:new Promise((resolve,reject)=>{resolveWarm=resolve;rejectWarm=reject})};record.warm.catch(()=>{});record.ready.catch(()=>{});
  record.activate=()=>{record.active=true;video.preload='auto';if(record.hls){Object.assign(record.hls.config,{maxBufferLength:20,maxMaxBufferLength:40,maxBufferSize:60*1000*1000});if(record.stopped){record.hls.startLoad(-1);record.stopped=false}}};
  jobs.set(video,record);video.playsInline=true;video.preload=warm?'metadata':'auto';video.dataset.warmStart=warm?'warming':'playback';
  const ready=()=>{applyStart(video);resolveReady(video)},fail=error=>{rejectReady(error);rejectWarm(error);video.dataset.warmStart='unavailable'};
  video.addEventListener('loadedmetadata',ready,{once:true});video.addEventListener('error',()=>fail(video.error||new Error('Film unavailable')),{once:true});video.addEventListener('play',record.activate);
  if(video.readyState>=1)ready();
  if(video.dataset.hls){
   if(window.Hls?.isSupported()&&!/^((?!chrome|android).)*safari/i.test(navigator.userAgent)){
    record.hls=new Hls(warm?{maxBufferLength:2,maxMaxBufferLength:4,maxBufferSize:4*1000*1000,backBufferLength:0,startLevel:0,capLevelToPlayerSize:true}:{maxBufferLength:20});
    record.hls.on(Hls.Events.BUFFER_APPENDED,()=>{let ahead=0;for(let i=0;i<video.buffered.length;i++)if(video.buffered.start(i)<=video.currentTime+.1)ahead=Math.max(ahead,video.buffered.end(i)-video.currentTime);
     if(ahead>=1.5){if(!record.active&&!record.stopped){record.hls.stopLoad();record.stopped=true;video.dataset.warmStart='ready'}resolveWarm(video)}
    });
    record.hls.on(Hls.Events.ERROR,(_,data)=>{if(data.fatal)fail(new Error(data.details))});record.hls.loadSource(video.dataset.hls);record.hls.attachMedia(video);
   }else{video.addEventListener('loadeddata',()=>{video.dataset.warmStart='ready';resolveWarm(video)},{once:true});video.addEventListener('loadedmetadata',()=>resolveWarm(video),{once:true});video.src=video.dataset.hls;video.load()}
  }else{video.addEventListener('loadeddata',()=>resolveWarm(video),{once:true});video.load()}
  return record;
 }
 window.ONCEMedia={ensure(video){return setup(video,false).ready},warm(video){return setup(video,true).warm}};
})();
