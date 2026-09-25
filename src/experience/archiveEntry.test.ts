import { describe, expect, it, vi } from 'vitest';
import { bindArchiveEntry } from './archiveEntry';
function event(type:string,props:Record<string,unknown>={}){const e=new Event(type,{cancelable:true});Object.assign(e,props);return e;}
describe('archive entry input lifetime',()=>{
 for(const key of ['ArrowDown','Enter',' ','Spacebar'])it(`enters once with ${key}`,()=>{const target=new EventTarget();const complete=vi.fn();const cleanup=bindArchiveEntry(target as Window,complete);target.dispatchEvent(event('keydown',{key}));target.dispatchEvent(event('wheel',{deltaY:12}));expect(complete).toHaveBeenCalledTimes(1);cleanup();});
 it('ignores reverse input and removes all listeners after exit',()=>{const target=new EventTarget();const complete=vi.fn();const cleanup=bindArchiveEntry(target as Window,complete);target.dispatchEvent(event('wheel',{deltaY:-1}));expect(complete).not.toHaveBeenCalled();cleanup();target.dispatchEvent(event('wheel',{deltaY:10}));target.dispatchEvent(event('keydown',{key:'Enter'}));expect(complete).not.toHaveBeenCalled();});
 it('accepts upward touch swipes and rearms on a new gate',()=>{const target=new EventTarget();const complete=vi.fn();let cleanup=bindArchiveEntry(target as Window,complete);target.dispatchEvent(event('touchstart',{touches:[{clientY:150}]}));target.dispatchEvent(event('touchend',{changedTouches:[{clientY:80}]}));expect(complete).toHaveBeenCalledTimes(1);cleanup();cleanup=bindArchiveEntry(target as Window,complete);target.dispatchEvent(event('wheel',{deltaY:1}));expect(complete).toHaveBeenCalledTimes(2);cleanup();});
});
