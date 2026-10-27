const {test,expect}=require('bun:test');const vm=require('node:vm'),fs=require('node:fs');
const source=fs.readFileSync(require('node:path').join(__dirname,'../assets/js/media-runtime.js'),'utf8');
function fixture({quality=false,saveData=false}={}){
 const instances=[];
 class Hls{
  static isSupported(){return true}static Events={MANIFEST_PARSED:'manifest',BUFFER_APPENDED:'buffer',ERROR:'error'};static ErrorTypes={NETWORK_ERROR:'network',MEDIA_ERROR:'media'};
  constructor(config){this.config=config;this.events={};this.levels=[{width:480,height:270},{width:1280,height:720},{width:1920,height:1080}];instances.push(this)}
  on(k,f){this.events[k]=f}loadSource(s){this.source=s}attachMedia(v){this.video=v}stopLoad(){this.stops=(this.stops||0)+1}startLoad(){this.starts=(this.starts||0)+1}recoverMediaError(){this.recoveries=(this.recoveries||0)+1}destroy(){this.destroyed=true}emit(k,d){this.events[k]?.(k,d)}
 }
 const context={window:{Hls},Hls,navigator:{userAgent:'Chrome',connection:{saveData}}};vm.runInNewContext(source,context);
 const events={},video={dataset:{hls:'https://example.test/film.m3u8'},hasAttribute:n=>quality&&n==='data-quality-first',readyState:0,currentTime:0,buffered:{length:0,start:()=>0,end:()=>6},addEventListener(k,f){(events[k]??=[]).push(f)},emit(k){events[k]?.forEach(f=>f())}};
 function manifest(){instances.at(-1).emit(Hls.Events.MANIFEST_PARSED);video.emit('loadedmetadata')}
 function buffered(){video.buffered.length=1;instances.at(-1).emit(Hls.Events.BUFFER_APPENDED)}
 return{api:context.window.ONCEMedia,video,instances,Hls,manifest,buffered};
}
test('warm caches an opening fragment, then playback resumes the same instance with a retained back buffer',async()=>{const f=fixture(),warm=f.api.warm(f.video),h=f.instances[0];expect(h.config.autoStartLoad).toBe(false);expect(h.config.maxBufferLength).toBe(4);f.manifest();f.buffered();await warm;expect(h.stops).toBe(1);expect(f.video.dataset.warmStart).toBe('ready');await f.api.ensure(f.video);expect(h.starts).toBe(2);expect(h.config.maxBufferLength).toBe(20);expect(h.config.backBufferLength).toBe(30);expect(f.instances.length).toBe(1);f.buffered();expect(h.stops).toBe(1)});
test('activation during warm-up never stops the playing stream',async()=>{const f=fixture();f.api.warm(f.video);const ready=f.api.ensure(f.video);f.manifest();await ready;f.buffered();expect(f.instances[0].stops).toBeUndefined()});
test('ordinary playback retains adaptive defaults and the normal buffer',async()=>{const f=fixture(),ready=f.api.ensure(f.video);f.manifest();expect(await ready).toBe(f.video);expect(f.instances[0].config.maxBufferLength).toBe(20);expect(f.instances[0].startLevel).toBeUndefined();expect(f.instances[0].config.capLevelToPlayerSize).toBeUndefined()});
test('requested art films start with an HD rendition while adaptive quality remains uncapped',async()=>{const f=fixture({quality:true});const ready=f.api.ensure(f.video);f.manifest();await ready;const h=f.instances[0];expect(h.startLevel).toBe(2);expect(f.video.dataset.initialQuality).toBe('1920x1080');expect(h.config.capLevelToPlayerSize).toBeUndefined();expect(h.config.autoLevelCapping).toBeUndefined()});
test('data saver does not force an HD opening',async()=>{const f=fixture({quality:true,saveData:true}),ready=f.api.ensure(f.video);f.manifest();await ready;expect(f.instances[0].startLevel).toBeUndefined()});
test('recoverable fatal network and media errors retry within finite bounds',async()=>{const f=fixture(),warm=f.api.warm(f.video),h=f.instances[0];f.manifest();h.emit(f.Hls.Events.ERROR,{fatal:true,type:'network',details:'networkError'});expect(h.starts).toBe(2);h.emit(f.Hls.Events.ERROR,{fatal:true,type:'media',details:'decodeError'});expect(h.recoveries).toBe(1);f.buffered();await warm;expect(h.destroyed).toBeUndefined()});
test('unrecoverable preload failures reject and permit a fresh future attempt',async()=>{const f=fixture(),warm=f.api.warm(f.video),h=f.instances[0];h.emit(f.Hls.Events.ERROR,{fatal:true,type:'other',details:'badManifest'});await expect(warm).rejects.toThrow('badManifest');expect(h.destroyed).toBe(true);expect(f.video.dataset.warmStart).toBe('unavailable');const retry=f.api.ensure(f.video);f.manifest();await retry;expect(f.instances.length).toBe(2)});
