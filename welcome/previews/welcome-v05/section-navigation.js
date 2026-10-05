document.addEventListener('click',event=>{
 const a=event.target.closest('a[href^="#"],a[href^="/#"]');if(!a)return;
 const hash=a.getAttribute('href').replace(/^\//,''),target=document.getElementById(hash.slice(1));if(!target)return;
 event.preventDefault();target.scrollIntoView({block:'start',behavior:'auto'});
 history.pushState(null,'',location.pathname+location.search+hash);
});
