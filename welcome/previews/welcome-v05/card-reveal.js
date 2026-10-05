(() => {
 const details=document.getElementById('meaning-more'),group=document.querySelector('.framed-reveal'),tray=group.querySelector('.card-reveal'),cards=[...tray.querySelectorAll(".falling-card")],collapse=document.querySelector(".collapse-tape"),paperStack=document.querySelector(".meaning-paper-stack");
 function layout(){
  const width=group.clientWidth,cw=width*.45,padding=width*.065;
  const mobile=matchMedia('(max-width:740px)').matches;
  paperTray.style.height=expanded&&!mobile?(paperTray.clientWidth/1.43)+'px':'0px';
  let heights=[0,0];
  cards.forEach((card,i)=>{
   if(mobile&&i>=2){card.style.display='none';return}
   card.style.display='';
   if(card.classList.contains('reveal-finale')){
    const img=card.querySelector("img"),y=Math.max(...heights),ratio=img.naturalHeight/img.naturalWidth||1.33;
    const yellow=document.querySelector('.paper-card-tray img');
    const room=yellow.getBoundingClientRect().bottom-tray.getBoundingClientRect().top-y;
    const w=Math.max(cw,Math.min(width*.96,Math.max(0,room)/ratio)),ch=w*ratio;
    Object.assign(card.style,{width:w+'px',height:ch+'px',left:(width-w)/2+'px',top:y+'px'});
    card.style.setProperty('--hidden-x','0px');card.style.setProperty('--hidden-y',(-ch-y-40)+'px');heights=[y+ch,y+ch];return;
   }
   if(card.classList.contains('optional-reveal')){
    const y=Math.max(...heights),w=width*.96,ch=w*(card.naturalHeight/card.naturalWidth||1.33);
    const available=document.querySelector('.meaning-paper-stack').getBoundingClientRect().bottom-tray.getBoundingClientRect().top;
    const fits=innerWidth>740&&innerWidth<=1100&&y+ch+64<available;
    card.style.display=fits?'block':'none';if(!fits)return;
    Object.assign(card.style,{width:w+'px',height:ch+'px',left:width*.02+'px',top:y+'px'});
    card.style.setProperty('--hidden-x','0px');card.style.setProperty('--hidden-y',(-ch-y-40)+'px');heights=[y+ch+padding,y+ch+padding];return;
   }
   const col=[0,1,0,0,1,0,1][i]??i%2;
   const ratio=card.naturalWidth&&card.naturalHeight?card.naturalHeight/card.naturalWidth:1;
   const ch=cw*ratio,x=col?width*.53:width*.02,y=heights[col];
   card.style.width=cw+'px';card.style.height=ch+'px';card.style.left=x+'px';card.style.top=y+'px';
   card.style.setProperty('--hidden-x',(width/2-x-cw/2)+'px');card.style.setProperty('--hidden-y',(-ch-y-40)+'px');
   heights[col]+=ch+padding;
  });
  collapse.tabIndex=expanded?0:-1;tray.style.height=details.open?(Math.max(...heights)+50)+'px':'0px';
 }
 const paperTray=document.querySelector('.paper-card-tray');
 function sync(open=details.open){paperTray.style.height=open?(paperTray.clientWidth/1.43)+'px':'0px';paperTray.classList.toggle('is-open',open);paperTray.setAttribute('aria-hidden',String(!open));group.classList.toggle('is-open',open);paperStack.classList.toggle('is-open',open);tray.setAttribute('aria-hidden',String(!open));layout()}
 const body=details.querySelector('.meaning-expanded');
 let expanded=details.open,anim;
 details.querySelector('summary').addEventListener('click',e=>{
  e.preventDefault();expanded=!expanded;
  const from=details.open?body.getBoundingClientRect().height:0;
  if(anim)anim.cancel();
  details.open=true;
  sync(expanded);
  const to=expanded?body.scrollHeight:0;
  const duration=matchMedia('(prefers-reduced-motion: reduce)').matches?0:800;
  body.style.overflow='hidden';
  anim=body.animate([{height:from+'px'},{height:to+'px'}],{duration,easing:'cubic-bezier(.65,0,.35,1)',fill:'forwards'});
  anim.onfinish=()=>{details.open=expanded;anim.cancel();anim=null;body.style.overflow='';layout()};
 });
collapse.addEventListener('click',()=>{group.classList.add('is-closing');paperStack.classList.add('is-closing');setTimeout(()=>{details.querySelector('summary').click();details.querySelector('summary').focus({preventScroll:true});group.classList.remove('is-closing');paperStack.classList.remove('is-closing')},matchMedia('(prefers-reduced-motion: reduce)').matches?0:800)});
tray.querySelectorAll('img').forEach(c=>c.addEventListener('load',layout));const observer=new ResizeObserver(layout);observer.observe(group);observer.observe(document.querySelector(".meaning-paper-stack"));sync();
})();
