const gamma='https://regennaissance-lnq2lo2.gamma.site/';
export function pickLuckyDip(data,random=Math.random,recent=[]){
 if(random()<1/3)return gamma;
 const preferred=random()<.8?data.selected:data.other,alternate=preferred===data.selected?data.other:data.selected;
 const pool=preferred?.length?preferred:alternate;if(!pool?.length)return gamma;
 const fresh=pool.filter(url=>!recent.includes(url)),choices=fresh.length?fresh:pool;
 return choices[Math.min(choices.length-1,Math.floor(random()*choices.length))];
}
if(typeof document!=='undefined'){
 const buttons=[...document.querySelectorAll('[data-lucky-dip]')];let links={selected:[],other:[]},recent=[];
 try{recent=JSON.parse(localStorage.getItem('once-lucky-history')||'[]')}catch{}
 fetch('/assets/data/lucky-dip-links.json?v=20261018-round5').then(r=>{if(!r.ok)throw new Error('Unavailable');return r.json()}).then(data=>links=data).catch(()=>{});
 for(const button of buttons)button.addEventListener('click',()=>{const url=pickLuckyDip(links,Math.random,recent);button.href=url;if(url!==gamma){recent=[...recent.filter(x=>x!==url),url].slice(-12);try{localStorage.setItem('once-lucky-history',JSON.stringify(recent))}catch{}}});
}
