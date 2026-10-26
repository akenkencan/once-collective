import {test,expect} from 'bun:test';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
function fixture(){
 const window={},handlers=new Map(),steps=[];let clock=0,active=true,swipe=true;
 runInNewContext(readFileSync(new URL('../assets/js/gallery-gestures.js',import.meta.url),'utf8'),{window});
 const element={clientWidth:900,addEventListener(type,fn){const list=handlers.get(type)||[];list.push(fn);handlers.set(type,list)},removeEventListener(type,fn){handlers.set(type,(handlers.get(type)||[]).filter(f=>f!==fn))}};
 const binding=window.ONCEGalleryGestures.attach(element,{step:delta=>steps.push(delta),enabled:()=>active,canSwipe:()=>active&&swipe,now:()=>clock});
 function emit(type,values={}){const event={type,deltaX:0,deltaY:0,deltaMode:0,prevented:false,stopped:false,preventDefault(){this.prevented=true},stopImmediatePropagation(){this.stopped=true},...values};for(const fn of handlers.get(type)||[]){fn(event);if(event.stopped)break}return event}
 return {steps,emit,binding,tick:n=>clock+=n,active:value=>active=value,swipe:value=>swipe=value};
}
test('vertical reading and Ctrl zoom never advance the gallery',()=>{const f=fixture();expect(f.emit('wheel',{deltaY:200,deltaX:8}).prevented).toBe(false);expect(f.emit('wheel',{deltaX:200,ctrlKey:true}).prevented).toBe(false);expect(f.steps).toEqual([])});
test('a sideways gesture advances once despite trackpad inertia; a new gesture advances again',()=>{const f=fixture();for(const deltaX of [20,24,30,90,60]){expect(f.emit('wheel',{deltaX}).prevented).toBe(true);f.tick(30)}expect(f.steps).toEqual([1]);f.tick(230);f.emit('wheel',{deltaX:-70});expect(f.steps).toEqual([1,-1])});
test('Shift-wheel and line-based horizontal wheels are supported',()=>{const f=fixture();f.emit('wheel',{shiftKey:true,deltaY:80});f.tick(250);f.emit('wheel',{deltaX:-4,deltaMode:1});expect(f.steps).toEqual([1,-1])});
test('hidden galleries preserve native horizontal scrolling',()=>{const f=fixture();f.active(false);expect(f.emit('wheel',{deltaX:150}).prevented).toBe(false);expect(f.steps).toEqual([])});
test('a touch swipe advances and suppresses the following accidental click',()=>{const f=fixture();f.emit('pointerdown',{pointerType:'touch',pointerId:1,clientX:250,clientY:120});f.emit('pointerup',{pointerType:'touch',pointerId:1,clientX:110,clientY:126});expect(f.steps).toEqual([1]);expect(f.emit('click').stopped).toBe(true);f.tick(501);expect(f.emit('click').stopped).toBe(false)});
test('vertical touch gestures and two-finger pinches do not change graphics',()=>{const f=fixture();f.emit('pointerdown',{pointerType:'touch',pointerId:1,clientX:250,clientY:100});f.emit('pointerup',{pointerType:'touch',pointerId:1,clientX:210,clientY:300});expect(f.steps).toEqual([]);f.emit('pointerdown',{pointerType:'touch',pointerId:1,clientX:250,clientY:120});f.emit('pointerdown',{pointerType:'touch',pointerId:2,clientX:130,clientY:120});f.emit('pointerup',{pointerType:'touch',pointerId:2,clientX:10,clientY:120});f.emit('pointerup',{pointerType:'touch',pointerId:1,clientX:110,clientY:120});expect(f.steps).toEqual([])});
test('cancelled gestures and detached bindings cannot advance graphics',()=>{const f=fixture();f.emit('pointerdown',{pointerType:'touch',pointerId:1,clientX:250,clientY:120});f.emit('pointercancel',{pointerType:'touch',pointerId:1,clientX:10,clientY:120});f.binding.destroy();f.emit('wheel',{deltaX:200});expect(f.steps).toEqual([])});

test('zoomed viewers can browse with sideways wheels while touch remains available for panning',()=>{const f=fixture();f.swipe(false);f.emit('wheel',{deltaX:80});expect(f.steps).toEqual([1]);f.emit('pointerdown',{pointerType:'touch',pointerId:1,clientX:250,clientY:120});f.emit('pointerup',{pointerType:'touch',pointerId:1,clientX:110,clientY:126});expect(f.steps).toEqual([1])});
