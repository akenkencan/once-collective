function ShowreelTriangle({panelElement=null,buttonSelector=".play-showreel"}={}){
 const [active,setActive]=React.useState(false),[near,setNear]=React.useState(false),[point,setPoint]=React.useState({x:.5,y:.5}),[intensity,setIntensity]=React.useState(.4);
 React.useEffect(()=>{
  const panel=panelElement||document.getElementById('showreel'),button=panel.querySelector(buttonSelector);
  function move(e){const r=panel.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*2-1,y=(e.clientY-r.top)/r.height*2-1,d=Math.min(1,Math.hypot(x,y)),angle=Math.atan2(y,x);
   setActive(true);setIntensity(1-d);setPoint({x:.5+Math.cos(angle)*d*.4,y:.5+Math.sin(angle)*d*.4});if(d<=.5)setNear(true);
  }
  function leave(){setActive(false);setNear(false)}
  function focus(){setActive(true);setNear(true);setIntensity(1);setPoint({x:.5,y:.5})}
  panel.addEventListener('pointermove',move);panel.addEventListener('pointerleave',leave);button.addEventListener('focus',focus);button.addEventListener('blur',leave);
  return()=>{panel.removeEventListener('pointermove',move);panel.removeEventListener('pointerleave',leave);button.removeEventListener('focus',focus);button.removeEventListener('blur',leave)};
 },[]);
 return React.createElement('span',{className:'video-triangle'+(near?' points-right':'')},React.createElement(HeatSymbol,{symbol:'triangle',active,point,intensity:1,edgeOnly:false,soft:20,area:35+intensity*50}));
}
const welcomePlayMount=document.getElementById('showreel-play-symbol');
if(welcomePlayMount)ReactDOM.createRoot(welcomePlayMount).render(React.createElement(ShowreelTriangle));
document.querySelectorAll('[data-welcome-triangle]').forEach(mount=>ReactDOM.createRoot(mount).render(React.createElement(ShowreelTriangle,{panelElement:mount.closest('[data-feature-player]'),buttonSelector:'.feature-play'})));
