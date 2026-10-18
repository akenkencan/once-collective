(()=>{
 let panel,clip,opener,animation=[],revision=0;
 const reduced=()=>matchMedia('(prefers-reduced-motion:reduce)').matches;
 async function reveal(open){
  const run=++revision,from=clip.hidden?0:clip.getBoundingClientRect().height;animation.forEach(a=>a.cancel());
  if(open){clip.hidden=false;panel.hidden=false}
  opener?.setAttribute('aria-expanded',String(open));const height=panel.getBoundingClientRect().height,time=reduced()?0:600;
  const move=panel.animate([{transform:open?'translateY(-100%)':'none'},{transform:open?'none':'translateY(-100%)'}],{duration:time,easing:'cubic-bezier(.22,1,.36,1)',fill:'forwards'}),size=clip.animate([{height:from+'px'},{height:(open?height:0)+'px'}],{duration:time,easing:'cubic-bezier(.22,1,.36,1)',fill:'forwards'});animation=[move,size];
  document.dispatchEvent(new CustomEvent('once:contact-layout'));
  try{await size.finished;if(run!==revision)return;if(!open){clip.hidden=true;panel.hidden=true}animation.forEach(a=>a.cancel());document.dispatchEvent(new CustomEvent('once:contact-layout'))}catch(error){}
 }
 async function close(){if(!panel)return;await reveal(false);opener?.focus({preventScroll:true})}
 document.addEventListener('click',event=>{
  const button=event.target.closest('a,button');if(!button)return;
  const label=(button.querySelector('.burst-label')||button).textContent.trim();if(!/^(leave an email|reach out|get updates)$/i.test(label))return;
  event.preventDefault();event.stopImmediatePropagation();if(opener===button&&panel&&!panel.hidden&&button.getAttribute('aria-expanded')==='true'){close();return}
  document.dispatchEvent(new CustomEvent('once:email-opening'));opener?.setAttribute('aria-expanded','false');opener=button;
  if(!panel){clip=document.createElement('div');clip.className='signup-reveal-clip';clip.hidden=true;panel=document.createElement('section');panel.id='once-signup-panel';panel.className='once-signup-panel';panel.hidden=true;panel.innerHTML='<iframe title="Get ONCE updates" scrolling="no"></iframe>';panel.querySelector('iframe').src=location.hostname==='127.0.0.1'||location.hostname==='localhost'?'/signup.html':'/signup';clip.append(panel)}
  const anchor=button.closest('.contact-actions,.application-actions,.what-ending')||button.parentElement;anchor.after(clip);button.setAttribute('aria-controls',panel.id);reveal(true);
 },true);
 document.addEventListener('once:social-opening',()=>{if(panel&&!panel.hidden)reveal(false)});
 window.addEventListener('message',event=>{if(event.origin!==location.origin||event.source!==panel?.querySelector('iframe').contentWindow||event.data?.type!=='once-signup-height')return;const height=Number(event.data.height);if(height>0&&height<2000)panel.querySelector('iframe').style.height=height+'px'});
})();
