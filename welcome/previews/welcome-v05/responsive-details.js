(() => {
 const mode=matchMedia('(min-width:741px) and (max-width:1100px)');
 const what=document.querySelector('.what-copy'),whatEnd=document.querySelector('.what-ending'),objects=document.querySelector('.what-grid>aside'),scene=objects.querySelector('.diagram-pending');
 const cards=document.querySelector('.cards-context'),cardsEnd=document.querySelector('.cards-ending'),blue=cards.querySelector('.card-back'),right=document.querySelector('.after-form-artefacts');
 function place(){
  const clearance=blue.closest('.welcome-card-clearance');if(clearance&&(cardsEnd.parentNode!==cards||cardsEnd.nextElementSibling!==clearance))clearance.before(cardsEnd);
  if(mode.matches){if(whatEnd.parentNode!==objects)scene.before(whatEnd);}
  else{if(whatEnd.parentNode!==what)what.append(whatEnd);}
 }
 mode.addEventListener('change',place);place();
 // Keep the intermediate Symset image inside the existing lens area.
 const section=document.querySelector('.symset-section'),corner=section.querySelector('.symset-corner-art'),panel=document.querySelector('.lens-panel');
 if(panel&&corner)panel.append(corner);
})();
