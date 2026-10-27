/* Open Collective remains the default on every visit; Stripe is an explicit preview. */
(()=>{
 const toggle=document.querySelector('[data-contribution-toggle]');if(!toggle)return;
 const panels=[...document.querySelectorAll('[data-contribution-view]')];
 function select(stripe){
  const mode=stripe?'stripe':'open-collective';toggle.setAttribute('aria-checked',String(stripe));
  panels.forEach(panel=>{const active=panel.dataset.contributionView===mode;panel.hidden=!active;panel.inert=!active;if(active&&!matchMedia('(prefers-reduced-motion:reduce)').matches)panel.animate([{opacity:.35},{opacity:1}],{duration:220,easing:'ease-out'})});
  document.dispatchEvent(new CustomEvent('once:contribution-mode',{detail:{mode}}));
 }
 toggle.addEventListener('click',()=>select(toggle.getAttribute('aria-checked')!=='true'));
})();
