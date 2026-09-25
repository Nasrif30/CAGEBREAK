/** Listeners exist only while the final archive invitation is active. */
export function bindArchiveEntry(target:Window,onEnter:()=>void) {
 let used=false,startY:number|undefined;
 const enter=()=>{if(!used){used=true;onEnter();}};
 const wheel=(event:WheelEvent)=>{if(event.deltaY>0) enter();};
 const key=(event:KeyboardEvent)=>{if(event.altKey||event.ctrlKey||event.metaKey||event.repeat) return; if(['ArrowDown','Enter',' ','Spacebar'].includes(event.key)){event.preventDefault();enter();}};
 const start=(event:TouchEvent)=>{startY=event.touches[0]?.clientY;};
 const end=(event:TouchEvent)=>{const y=event.changedTouches[0]?.clientY;if(startY!==undefined&&y!==undefined&&startY-y>24)enter();startY=undefined;};
 target.addEventListener('wheel',wheel,{passive:true});target.addEventListener('keydown',key);target.addEventListener('touchstart',start,{passive:true});target.addEventListener('touchend',end,{passive:true});
 return ()=>{target.removeEventListener('wheel',wheel);target.removeEventListener('keydown',key);target.removeEventListener('touchstart',start);target.removeEventListener('touchend',end);};
}
