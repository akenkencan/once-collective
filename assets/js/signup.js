(()=>{
 let panel,clip,opener,animation=[],revision=0,opened=false;
 const reduced=()=>matchMedia('(prefers-reduced-motion:reduce)').matches;
 async function reveal(open,fast=false){
  const run=++revision,from=clip.getBoundingClientRect().height,previous=getComputedStyle(panel).transform;animation.forEach(a=>a.cancel());opened=open;
  if(open)panel.hidden=false;panel.inert=!open;opener?.setAttribute('aria-expanded',String(open));
  const height=panel.scrollHeight,time=reduced()?0:fast?180:650,easing='cubic-bezier(.22,1,.36,1)';clip.style.height=from+'px';
  const move=panel.animate([{transform:from>0?previous:open?'translateY(-'+height+'px)':'none'},{transform:open?'none':'translateY(-'+height+'px)'}],{duration:time,easing,fill:'forwards'}),size=clip.animate([{height:from+'px'},{height:(open?height:0)+'px'}],{duration:time,easing,fill:'forwards'});animation=[move,size];
  document.dispatchEvent(new CustomEvent('once:contact-layout'));
  try{await size.finished;if(run!==revision)return;clip.style.height=open?'auto':'0px';if(!open)panel.hidden=true;animation.forEach(a=>a.cancel());animation=[];document.dispatchEvent(new CustomEvent('once:contact-layout'))}catch(error){}
 }
 async function close(){if(!panel)return;await reveal(false);opener?.focus({preventScroll:true})}
 document.addEventListener('click',event=>{
  const button=event.target.closest('a,button');if(!button)return;
  const label=(button.querySelector('.burst-label')||button).textContent.trim();if(!/^(leave an email|reach out|get updates)$/i.test(label))return;
  event.preventDefault();event.stopImmediatePropagation();if(opener===button&&panel&&opened){close();return}
  document.dispatchEvent(new CustomEvent('once:email-opening'));opener?.setAttribute('aria-expanded','false');opener=button;
  const paper=!!button.closest('.updates-carpet,.frame-updates-slot');
  if(!panel){clip=document.createElement('div');clip.className='signup-reveal-clip';clip.style.height='0px';panel=document.createElement('section');panel.id='once-signup-panel';panel.className='once-signup-panel';panel.hidden=true;panel.innerHTML='<iframe title="Get ONCE updates" scrolling="no"></iframe>';clip.append(panel)}
  const frame=panel.querySelector('iframe'),url=(location.hostname==='127.0.0.1'||location.hostname==='localhost'?'/signup.html':'/signup')+(paper?'?theme=paper&v=20261021-round13':'?v=20261021-round13');if(frame.getAttribute('src')!==url)frame.src=url;clip.classList.toggle('signup-paper',paper);
  const anchor=button.closest('.updates-carpet,.frame-updates-slot,.contact-actions,.application-actions,.what-ending')||button.parentElement;
  if(paper&&!anchor.parentElement.classList.contains('welcome-signup-group')){const group=document.createElement('div');group.className='welcome-signup-group'+(button.closest('.frame-updates-slot')?' frame-signup-group':'');anchor.before(group);group.append(anchor)}
  anchor.after(clip);button.setAttribute('aria-controls',panel.id);reveal(true);
 },true);
 document.addEventListener('once:signup-close',()=>{if(panel&&opened)reveal(false,true)});document.addEventListener('once:social-opening',()=>{if(panel&&opened)reveal(false)});
 window.addEventListener('message',event=>{if(event.origin!==location.origin||event.source!==panel?.querySelector('iframe').contentWindow||event.data?.type!=='once-signup-height')return;const height=Number(event.data.height);if(height>0&&height<2000){panel.querySelector('iframe').style.height=height+'px';if(opened&&animation.length)reveal(true)}});
})();
