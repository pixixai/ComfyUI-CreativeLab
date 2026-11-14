import test from 'node:test';
import assert from 'node:assert/strict';
import { virtualizeTasks,intersectsViewport,xyDetailLevel,estimatedModuleHeight } from '../web/components/workspace_modes/viewport_geometry.js';

test('viewport buffers include approaching cells in both directions but reject distant and hidden geometry',()=>{
    const view={left:100,top:100,right:500,bottom:500};
    const box=(left,top,width=100,height=100)=>({left,top,width,height,right:left+width,bottom:top+height});
    assert.equal(intersectsViewport(box(20,100),view),true);assert.equal(intersectsViewport(box(550,100),view),true);
    assert.equal(intersectsViewport(box(800,100),view),false);assert.equal(intersectsViewport(box(100,800),view),false);assert.equal(intersectsViewport(box(100,100,0),view),false);
});
test('large task sets virtualize controls and XY overview remains lightweight until zoomed or selected',()=>{
    assert.equal(virtualizeTasks(Array.from({length:40},()=>({areas:[]}))),true);assert.equal(virtualizeTasks([{areas:Array(160)}]),true);assert.equal(virtualizeTasks([{areas:[]}]),false);
    assert.equal(xyDetailLevel(320,.2),'summary');assert.equal(xyDetailLevel(320,.5),'full');assert.equal(xyDetailLevel(320,.1,true),'full');
    assert.ok(estimatedModuleHeight({type:'edit',autoHeight:true,value:'line\n'.repeat(20)})>estimatedModuleHeight({type:'edit',autoHeight:true,value:'short'}));
    assert.equal(estimatedModuleHeight({type:'preview',mediaSize:{width:160,height:90}},320),180);
});


test('card layout cache invalidates when text, bindings, width or media changes',async()=>{
    const {layoutSignature,sameLayout,deferredLayoutHTML}=await import('../web/components/workspace_modes/card_layout.js');
    const area={type:'edit',value:'a',autoHeight:true,targetNodeId:'1'};
    const first=layoutSignature(area,320);assert.equal(sameLayout(first,layoutSignature(area,320)),true);
    assert.equal(sameLayout(first,layoutSignature(area,400)),false);area.value='longer';assert.equal(sameLayout(first,layoutSignature(area,320)),false);
    assert.equal(deferredLayoutHTML('<video src="a.mp4" poster="a.png"><source src="b.mp4"></video>'),'<video data-clab-layout-src="a.mp4" data-clab-layout-poster="a.png"><source data-clab-layout-src="b.mp4"></video>');
});
test('run following reveals targets without oscillating when a target exceeds the viewport',async()=>{
    const {revealDelta}=await import('../web/components/workspace_modes/viewport_geometry.js');
    assert.equal(revealDelta(20,80,10,100),0);assert.equal(revealDelta(-20,80,10,100),30);assert.equal(revealDelta(50,150,10,100),-40);assert.equal(revealDelta(10,300,10,100),0);
});
