(()=>{
 let panel,opener;
 function close(){if(!panel)return;panel.hidden=true;document.dispatchEvent(new CustomEvent('once:contact-layout')); opener?.setAttribute('aria-expanded','false');opener?.focus({preventScroll:true})}
 document.addEventListener('click',event=>{
  const button=event.target.closest('a,button');if(!button)return;
  const label=(button.querySelector('.burst-label')||button).textContent.trim();
  if(!/^(leave an email|reach out|get updates)$/i.test(label))return;
  event.preventDefault();event.stopImmediatePropagation();
  if(opener===button&&panel&&!panel.hidden){close();return}
  opener?.setAttribute('aria-expanded','false');opener=button;
  if(!panel){panel=document.createElement('section');panel.id='once-signup-panel';panel.className='once-signup-panel';panel.innerHTML='<iframe title="Get ONCE updates" src="/signup" scrolling="no"></iframe><button type="button" class="signup-close">Close −</button>';panel.querySelector('iframe').src=location.hostname==='127.0.0.1'||location.hostname==='localhost'?'/signup.html':'/signup';panel.querySelector('button').addEventListener('click',close)}
  const anchor=button.closest('.contact-actions,.application-actions,.what-ending')||button.parentElement;anchor.after(panel);panel.hidden=false;document.dispatchEvent(new CustomEvent('once:contact-layout'));button.setAttribute('aria-expanded','true');button.setAttribute('aria-controls',panel.id);
  panel.animate([{opacity:0,transform:'translateY(-12px)'},{opacity:1,transform:'none'}],{duration:matchMedia('(prefers-reduced-motion:reduce)').matches?0:300,easing:'ease-out'});
 },true);
 window.addEventListener('message',event=>{if(event.origin!==location.origin||event.source!==panel?.querySelector('iframe').contentWindow||event.data?.type!=='once-signup-height')return;const height=Number(event.data.height);if(height>0&&height<2000)panel.querySelector('iframe').style.height=height+'px'});
})();