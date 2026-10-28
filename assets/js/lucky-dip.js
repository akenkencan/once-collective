const gamma='https://regennaissance-lnq2lo2.gamma.site/';
const cutoff=Date.parse('2021-01-01T00:00:00.000Z');
export function eligibleLuckyEntries(data){
 const unique=new Map();for(const entry of Array.isArray(data?.entries)?data.entries:[]){const created=Date.parse(entry?.createdAt);if(!Number.isFinite(created)||created<cutoff)continue;try{const url=new URL(entry.url);if(url.protocol!=='https:'&&url.protocol!=='http:')continue}catch{continue}const previous=unique.get(entry.url);unique.set(entry.url,{url:entry.url,selected:previous?.selected===true||entry.selected===true})}return [...unique.values()];
}
export function eligibleLuckyLinks(data){return eligibleLuckyEntries(data).map(entry=>entry.url)}
export function pickLuckyDip(data,random=Math.random,recent=[]){
 if(random()<.3)return gamma;
 const pool=eligibleLuckyEntries(data);if(!pool.length)return gamma;
 const fresh=pool.filter(entry=>!recent.includes(entry.url)),choices=fresh.length?fresh:pool,weight=entry=>entry.selected?1.35:1;
 let draw=random()*choices.reduce((sum,entry)=>sum+weight(entry),0);for(const entry of choices){draw-=weight(entry);if(draw<0)return entry.url}return choices.at(-1).url;
}
if(typeof document!=='undefined'){
 const buttons=[...document.querySelectorAll('[data-lucky-dip]')];let links={entries:[]},recent=[];
 try{const history=JSON.parse(localStorage.getItem('once-lucky-history')||'[]');if(Array.isArray(history))recent=history.filter(url=>typeof url==='string')}catch{}
 fetch('/assets/data/lucky-dip-links.json?v=20261022-round26').then(r=>{if(!r.ok)throw new Error('Unavailable');return r.json()}).then(data=>links=data).catch(()=>{});
 for(const button of buttons)button.addEventListener('click',()=>{const url=pickLuckyDip(links,Math.random,recent);button.href=url;if(url!==gamma){recent=[...recent.filter(x=>x!==url),url].slice(-12);try{localStorage.setItem('once-lucky-history',JSON.stringify(recent))}catch{}}});
}
