import test from 'node:test';
import assert from 'node:assert/strict';
import {comparisonViews,panComparison,zoomComparison,clearComparisonSlot,alignComparisonView} from '../web/components/contextmenu/content/preview_compare_view.js';
const config=()=>({a:'first',b:'second',view:{x:0,y:0,zoom:1,split:.5}});
const sizes={a:{width:500,height:300},b:{width:500,height:300}};
test('unlocked comparison panes share deltas while a locked pane retains its complete camera',()=>{
    const c=config(),views=comparisonViews(c);panComparison(c,'a',10,20);
    assert.deepEqual(views.a,views.b);const frozen=structuredClone(views.a);c.locks.a=true;
    zoomComparison(c,'b',2,{x:.2,y:-.1},sizes);panComparison(c,'b',30,40);
    assert.deepEqual(views.a,frozen);assert.equal(views.b.zoom,2);assert.equal(c.view.zoom,2);
    const before=structuredClone(views);panComparison(c,'a',100,100);zoomComparison(c,'a',2,{x:0,y:0},sizes);
    assert.deepEqual(views,before);
});
test('unlocking retains divergent cameras and subsequent operations apply relative changes without snapping',()=>{
    const c=config(),views=comparisonViews(c);c.locks.a=true;panComparison(c,'b',30,40);
    c.locks.a=false;panComparison(c,'a',5,6);
    assert.deepEqual(views.a,{x:5,y:6,zoom:1});assert.deepEqual(views.b,{x:35,y:46,zoom:1});
    zoomComparison(c,'a',2,{x:0,y:0},sizes);assert.deepEqual(views.a,{x:10,y:12,zoom:2});assert.deepEqual(views.b,{x:70,y:92,zoom:2});
});
test('removing a comparison slot clears only that slot and restores its default camera',()=>{
    const c=config(),views=comparisonViews(c);c.locks.a=true;views.a.zoom=4;
    clearComparisonSlot(c,'a');assert.equal(c.a,'');assert.equal(c.b,'second');assert.equal(c.locks.a,false);assert.deepEqual(c.views.a,{x:0,y:0,zoom:1});
});
test('explicit view alignment matches peer zoom and pan while preserving the lock',()=>{
    const c=config(),views=comparisonViews(c);c.locks.a=true;Object.assign(views.a,{x:30,y:-20,zoom:1.5});Object.assign(views.b,{x:-12,y:45,zoom:3});
    alignComparisonView(c,'a');assert.deepEqual(views.a,{x:-12,y:45,zoom:3});assert.equal(c.locks.a,true);assert.deepEqual(views.b,{x:-12,y:45,zoom:3});assert.notEqual(views.a,views.b);assert.equal(c.view.split,.5);
    c.b='';alignComparisonView(c,'a');assert.deepEqual(views.a,{x:0,y:0,zoom:1});
});
