// Original Tally embed loader, kept visible from the start.
const arkhiveFrame=document.querySelector('#tally-mount iframe');
arkhiveFrame.src=arkhiveFrame.dataset.tallySrc;
const tallyScript=document.createElement('script');
tallyScript.src='https://tally.so/widgets/embed.js';
tallyScript.onload=()=>{if(window.Tally)window.Tally.loadEmbeds()};
document.body.append(tallyScript);
// Match the actual content height without a minimum-height floor.
window.addEventListener('message',event=>{
 if(event.origin!=='https://tally.so'||event.source!==arkhiveFrame.contentWindow)return;
 let data=event.data;try{if(typeof data==='string')data=JSON.parse(data)}catch{return}
 const height=Number(data?.payload?.height??data?.height);
 if(Number.isFinite(height)&&height>100&&height<5000)arkhiveFrame.style.height=Math.ceil(height)+'px';
});
