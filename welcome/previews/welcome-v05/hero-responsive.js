(() => {
 const hero=document.querySelector('.hero');if(!hero)return;
 const copy=hero.querySelector('.hero-copy'),art=hero.querySelector('.hero-art'),scene=art.querySelector('.scene'),ending=hero.querySelector('.hero-ending'),objects=hero.querySelector('.hero-composition');
 const mid=matchMedia('(min-width:741px) and (max-width:1100px)'),compact=matchMedia('(max-width:1050px)');
 function place(){
  if(compact.matches){if(ending.parentNode!==art)scene.after(ending)}else if(ending.parentNode!==copy)copy.append(ending);
  if(mid.matches){if(objects.parentNode!==hero)hero.append(objects)}else if(objects.parentNode!==art)art.append(objects);
 }
 mid.addEventListener('change',place);compact.addEventListener('change',place);place();
})();
