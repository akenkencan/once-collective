const gamma='https://regennaissance-lnq2lo2.gamma.site/';
const cutoff=Date.parse('2022-01-01T00:00:00.000Z');
export function eligibleLuckyLinks(data){
 return [...new Set((Array.isArray(data?.entries)?data.entries:[]).filter(entry=>{
  const created=Date.parse(entry?.createdAt);if(entry?.selected!==true||!Number.isFinite(created)||created<cutoff)return false;
  try{const url=new URL(entry.url);return url.protocol==='https:'||url.protocol==='http:'}catch{return false}
 }).map(entry=>entry.url))];
}
export function pickLuckyDip(data,random=Math.random,recent=[]){
 if(random()<1/3)return gamma;
 const pool=eligibleLuckyLinks(data);if(!pool.length)return gamma;
 const fresh=pool.filter(url=>!recent.includes(url)),choices=fresh.length?fresh:pool;
 return choices[Math.min(choices.length-1,Math.floor(random()*choices.length))];
}
if(typeof document!=='undefined'){
 const buttons=[...document.querySelectorAll('[data-lucky-dip]')];let links={entries:[]},recent=[];
 try{const history=JSON.parse(localStorage.getItem('once-lucky-history')||'[]');if(Array.isArray(history))recent=history.filter(url=>typeof url==='string')}catch{}
 fetch('/assets/data/lucky-dip-links.json?v=20261022-round23').then(r=>{if(!r.ok)throw new Error('Unavailable');return r.json()}).then(data=>links=data).catch(()=>{});
 for(const button of buttons)button.addEventListener('click',()=>{const url=pickLuckyDip(links,Math.random,recent);button.href=url;if(url!==gamma){recent=[...recent.filter(x=>x!==url),url].slice(-12);try{localStorage.setItem('once-lucky-history',JSON.stringify(recent))}catch{}}});
}
