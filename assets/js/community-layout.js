// Keep the same illustration node, with a text section separating it from the identity animation.
(()=>{
 const map=document.querySelector('.community-personal-map'),lifestyle=document.querySelector('.community-lifestyle');if(!map||!lifestyle)return;
 const home=document.createComment('Personal map desktop position');map.before(home);
 const small=matchMedia('(max-width:800px)');function arrange(){if(small.matches)lifestyle.append(map);else home.after(map)}
 small.addEventListener('change',arrange);arrange();
})();
