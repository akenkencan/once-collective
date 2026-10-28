const {test,expect}=require('bun:test');
const {pickLuckyDip}=require('../assets/js/lucky-dip.js');
const pitch='https://regennaissance-lnq2lo2.gamma.site/';
const data={entries:[{url:'https://example.test/first',createdAt:'2026-01-01'},{url:'https://example.test/second',createdAt:'2026-01-01'}]};
test('the pitch occupies exactly the lower 30 percent of the route draw',()=>{
 expect(pickLuckyDip(data,()=>0)).toBe(pitch);
 expect(pickLuckyDip(data,()=>.299999)).toBe(pitch);
 expect(pickLuckyDip(data,()=>.3)).not.toBe(pitch);
 expect(pickLuckyDip(data,()=>.999999)).not.toBe(pitch);
});
test('the other 70 percent selects eligible content and respects recent history',()=>{
 let pitches=0,content=0;
 for(let i=0;i<1000;i++){let draw=0;const result=pickLuckyDip(data,()=>draw++===0?(i+.5)/1000:.5);if(result===pitch)pitches++;else{expect(data.entries.some(e=>e.url===result)).toBe(true);content++;}}
 expect(pitches).toBe(300);expect(content).toBe(700);
 expect(pickLuckyDip(data,()=>.5,['https://example.test/first'])).toBe('https://example.test/second');
});
