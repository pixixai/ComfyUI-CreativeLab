import test from 'node:test';
import assert from 'node:assert/strict';
import { createFrameWork } from '../web/components/frame_work.js';

function frames(run){
    const old={request:globalThis.requestAnimationFrame,cancel:globalThis.cancelAnimationFrame,performance:globalThis.performance},callbacks=new Map();let serial=0,clock=0;
    globalThis.performance={now:()=>clock};
    globalThis.requestAnimationFrame=fn=>{callbacks.set(++serial,fn);return serial;};globalThis.cancelAnimationFrame=id=>callbacks.delete(id);
    const next=()=>{const batch=[...callbacks.values()];callbacks.clear();for(const fn of batch)fn();};
    try{run(next,callbacks,ms=>clock+=ms);}finally{globalThis.requestAnimationFrame=old.request;globalThis.cancelAnimationFrame=old.cancel;globalThis.performance=old.performance;}
}
test('opening yields its first paint but cheap controls can finish together',()=>frames(next=>{
    const seen=[],queue=createFrameWork();queue.replace(Array.from({length:5},(_,i)=>()=>seen.push(i)),{afterPaint:true});
    next();assert.deepEqual(seen,[]);next();assert.deepEqual(seen,[0,1,2,3,4]);
    while(queue.pending)next();assert.deepEqual(seen,[0,1,2,3,4]);
}));
test('expensive work yields on elapsed time, including a smaller navigation budget',()=>frames((next,callbacks,spend)=>{
    const seen=[],queue=createFrameWork();const jobs=()=>Array.from({length:5},(_,i)=>()=>{seen.push(i);spend(2);});
    queue.replace(jobs());next();assert.deepEqual(seen,[0,1,2]);assert.equal(queue.pending,2);
    next();assert.deepEqual(seen,[0,1,2,3,4]);
    seen.length=0;queue.replace(jobs(),{budgetMs:2});next();assert.deepEqual(seen,[0]);assert.equal(queue.pending,4);
    queue.clear();assert.equal(callbacks.size,0);
}));
test('a presentation group continues across frames before the next group starts',()=>frames((next,callbacks,spend)=>{
    const seen=[],queue=createFrameWork();let items=0;
    queue.replace([()=>{spend(3);seen.push(++items);return items===3;},()=>seen.push('revealed')]);
    next();assert.deepEqual(seen,[1,2]);next();assert.deepEqual(seen,[1,2,3,'revealed']);
    assert.equal(queue.pending,0);assert.equal(callbacks.size,0);
}));
test('players can wait for a paint after ordinary content even with spare frame time',()=>frames(next=>{
    const seen=[],queue=createFrameWork();let yielded=false;
    queue.replace([()=>seen.push('controls'),()=>{if(!yielded){yielded=true;return 'yield';}seen.push('player');}]);
    next();assert.deepEqual(seen,['controls']);assert.equal(queue.pending,1);
    next();assert.deepEqual(seen,['controls','player']);
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
