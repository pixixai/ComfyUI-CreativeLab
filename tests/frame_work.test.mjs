import test from 'node:test';
import assert from 'node:assert/strict';
import { createFrameWork } from '../web/components/frame_work.js';

function frames(run){
    const old={request:globalThis.requestAnimationFrame,cancel:globalThis.cancelAnimationFrame},callbacks=new Map();let serial=0;
    globalThis.requestAnimationFrame=fn=>{callbacks.set(++serial,fn);return serial;};globalThis.cancelAnimationFrame=id=>callbacks.delete(id);
    const next=()=>{const batch=[...callbacks.values()];callbacks.clear();for(const fn of batch)fn();};
    try{run(next,callbacks);}finally{globalThis.requestAnimationFrame=old.request;globalThis.cancelAnimationFrame=old.cancel;}
}
test('progressive work yields its first paint and spreads components over frames',()=>frames(next=>{
    const seen=[],queue=createFrameWork();queue.replace(Array.from({length:5},(_,i)=>()=>seen.push(i)),{afterPaint:true});
    next();assert.deepEqual(seen,[]);next();assert.ok(seen.length>0&&seen.length<=2);
    while(queue.pending)next();assert.deepEqual(seen,[0,1,2,3,4]);
}));
test('closing, changing owner or replacing a batch never runs obsolete work',()=>frames((next,callbacks)=>{
    let active=true;const seen=[],queue=createFrameWork(()=>active);
    queue.replace([()=>seen.push('old')]);queue.replace([()=>seen.push('current')]);next();assert.deepEqual(seen,['current']);
    queue.replace([()=>seen.push('closed')]);queue.clear();next();assert.equal(callbacks.size,0);
    queue.replace([()=>seen.push('wrong workspace')]);active=false;next();assert.equal(queue.pending,0);assert.deepEqual(seen,['current']);
}));
test('a running batch can replace its remaining jobs without executing the previous tail',()=>frames(next=>{
    const seen=[],queue=createFrameWork();queue.replace([()=>{seen.push('start');queue.replace([()=>seen.push('next')]);},()=>seen.push('obsolete')]);
    next();next();assert.deepEqual(seen,['start','next']);
}));
