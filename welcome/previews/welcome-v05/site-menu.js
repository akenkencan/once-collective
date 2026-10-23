(() => {
 const menu=document.getElementById('welcome-site-menu'),toggle=document.querySelector('.welcome-menu-toggle');
 function close(){menu.close();toggle.setAttribute('aria-expanded','false')}
 toggle.addEventListener('click',()=>{menu.showModal();toggle.setAttribute('aria-expanded','true')});
 menu.querySelector('.welcome-menu-close').addEventListener('click',close);
 menu.addEventListener('close',()=>toggle.setAttribute('aria-expanded','false'));
 menu.addEventListener('click',e=>{if(e.target===menu)close()});
 menu.querySelector('[data-local-showreel]').addEventListener('click',e=>{e.preventDefault();e.stopPropagation();close();(()=>{const video=document.getElementById('showreel-video'),b=video.getBoundingClientRect();window.scrollTo({top:b.top+scrollY+b.height/2-innerHeight/2,behavior:'smooth'})})();history.pushState(null,'',location.pathname+'#showreel')});
})();