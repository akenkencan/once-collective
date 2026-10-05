(() => {
 const menu=document.getElementById('welcome-site-menu'),toggle=document.querySelector('.welcome-menu-toggle');
 function close(){menu.close();toggle.setAttribute('aria-expanded','false')}
 toggle.addEventListener('click',()=>{menu.showModal();toggle.setAttribute('aria-expanded','true')});
 menu.querySelector('.welcome-menu-close').addEventListener('click',close);
 menu.addEventListener('close',()=>toggle.setAttribute('aria-expanded','false'));
 menu.addEventListener('click',e=>{if(e.target===menu)close()});
 menu.querySelector('[data-local-showreel]').addEventListener('click',e=>{e.preventDefault();e.stopPropagation();close();document.getElementById('showreel').scrollIntoView({behavior:'smooth',block:'center'});history.pushState(null,'',location.pathname+'#showreel')});
})();