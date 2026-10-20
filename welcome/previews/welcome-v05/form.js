// Keep the complete form in normal page flow, without a separate scroll area.
(()=>{const frame=document.querySelector('#tally-mount iframe');if(!frame)return;frame.setAttribute('scrolling','no');
 function resize(height){height=Number(height);if(!Number.isFinite(height)||height<100||height>20000)return;const value=Math.ceil(height)+'px';if(frame.style.getPropertyValue('--arkhive-form-height')!==value)frame.style.setProperty('--arkhive-form-height',value)}
 window.addEventListener('message',event=>{if(event.origin!=='https://tally.so'||event.source!==frame.contentWindow)return;let data=event.data;try{if(typeof data==='string')data=JSON.parse(data)}catch{return}resize(data?.payload?.height??data?.height)});
 new MutationObserver(()=>{const height=parseFloat(frame.style.height);if(height>100)resize(height)}).observe(frame,{attributes:true,attributeFilter:['style']});
 if(!frame.src)frame.src=frame.dataset.tallySrc;
 // Tally initializes eager frames only when this lazy-loading marker is absent.
 frame.removeAttribute('data-tally-src');
 const script=document.createElement('script');script.src='/assets/js/tally.embed.js';script.onload=()=>window.Tally?.loadEmbeds();document.body.append(script);
})();