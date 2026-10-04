/* All lens values transcribed from OC Website / Symbolistic 5 / Linked Words.
   Titles and questions retained from REBIRTH; route names from The Rebirth Brief. */
const symbols=[
 {key:'star',title:'Vision',question:'The Why',route:'The Attractor',entry:'Found'},
 {key:'triangle',title:'Mission',question:'The What',route:'The Strategy',entry:'Seen'},
 {key:'circle',title:'Culture',question:'The Who & How',route:'The Culture',entry:'Felt'},
 {key:'square',title:'Container',question:'The Show',route:'The System',entry:'Known'},
 {key:'root',title:'Driver',question:'The Tangible How',route:'The Game',entry:'Held'}
];
const lenses=[
 {label:'We need collective…',words:['Transformation','Imagination','Action','Wisdom','Power']},
 {label:'The High Brow',words:['Space','Direction','Energy','Wisdom','Unity']},
 {label:'The Action',words:['Living','Seeing','Moving','Collecting','Connecting']},
 {label:'The Esoteric',words:['Evolution','Purpose','Action','Education','Possibility']},
 {label:'Elemental',words:['Spirit','Wind','Water','Fire','Earth']},
 {label:'Technological Analogy',words:['Goal','Output','Processor','Database','API']},
 {label:'Meditative',words:['Being','Seeing','Living','Knowing','Feeling']}
];
function SymbolButton({s,i,active,setActive}){const [point,setPoint]=useState({x:.5,y:.5});return h('button',{className:'symbol-choice','aria-pressed':active,'aria-controls':'lens-panel','aria-label':`${s.title}: ${s.question}`,onPointerEnter:()=>setActive(i),onPointerMove:e=>{const r=e.currentTarget.querySelector('.heat-symbol').getBoundingClientRect();setPoint({x:Math.max(0,Math.min(1,(e.clientX-r.left)/r.width)),y:Math.max(0,Math.min(1,(e.clientY-r.top)/r.height))})},onPointerLeave:()=>setPoint({x:.5,y:.5}),onFocus:()=>setActive(i),onClick:()=>setActive(i)},h(HeatSymbol,{symbol:s.key,active,point}),h('span',{className:'symbol-title'},s.title,h('small',null,s.question)));}
function SymSet(){const [active,setActive]=useState(0);const s=symbols[active];return h(React.Fragment,null,
 h('div',{className:'symset-machine'},h('div',{className:'symbol-spine',role:'group','aria-label':'Select a symbol'},symbols.map((s,i)=>h(SymbolButton,{key:s.key,s,i,active:i===active,setActive}))),
 h('div',{id:'lens-panel',className:'lens-panel','aria-live':'polite','aria-atomic':true},h('div',{className:'route-line'},h('span',{className:'note'},'Site framing'),h('strong',null,s.entry),h('span',null,s.route),h('img',{className:'symset-mobile-art',src:'../welcome-v03/materials/frame.webp',alt:''})),
 h('div',{className:'lens-grid'},lenses.map((l,i)=>h('div',{className:`lens lens-${i}`,key:l.label},h('span',{className:'note'},l.label),h('strong',null,l.words[active])))))) ,
 h('details',{className:'lens-comparison'},h('summary',null,'Compare all lenses'),h('div',{className:'table-scroll',tabIndex:0,'aria-label':'All symbol lenses comparison'},h('table',null,h('caption',null,'Symbol framings'),h('thead',null,h('tr',null,h('th',{scope:'col'},'Lens'),symbols.map(s=>h('th',{scope:'col',key:s.key},h('img',{className:'frame-heading-symbol',src:`../../assets/symbols/white/${s.key}.png`,alt:''}),s.title)))),h('tbody',null,lenses.map(l=>h('tr',{key:l.label},h('th',{scope:'row'},l.label),l.words.map((w,i)=>h('td',{key:i,className:i===active?'selected-column':''},w)))))))));
}
ReactDOM.createRoot(document.getElementById('symset-react')).render(h(SymSet));
