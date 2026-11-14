import test from 'node:test';
import assert from 'node:assert/strict';
import { observeMediaDimensions } from '../web/components/workspace_modes/media_dimensions.js';

test('media dimension probes share URLs, release unused requests, retry errors and bound cached measurements',()=>{
    const old={Image:globalThis.Image,document:globalThis.document},probes=[];
    class Probe{constructor(){this.naturalWidth=160;this.naturalHeight=90;this.videoWidth=320;this.videoHeight=180;probes.push(this);}removeAttribute(){this.removed=true;}load(){this.reset=true;}}
    globalThis.Image=Probe;globalThis.document={createElement:()=>new Probe()};
    try{
        const a=[],b=[],stop=observeMediaDimensions('same.png',false,value=>a.push(value));
        observeMediaDimensions('same.png',false,value=>b.push(value));assert.equal(probes.length,1);
        stop();probes[0].onload();assert.deepEqual(a,[]);assert.deepEqual(b,[{width:160,height:90}]);
        observeMediaDimensions('same.png',false,value=>a.push(value));assert.equal(probes.length,1);assert.deepEqual(a,b);
        const cancel=observeMediaDimensions('cancel.webm',true,()=>assert.fail('removed listener called'));const video=probes.at(-1);cancel();assert.ok(video.removed&&video.reset);
        observeMediaDimensions('retry.png',false,()=>{});probes.at(-1).onerror();const before=probes.length;
        observeMediaDimensions('retry.png',false,()=>{});assert.equal(probes.length,before+1);probes.at(-1).onload();
        for(let i=0;i<129;i++){observeMediaDimensions('bounded-'+i,false,()=>{});probes.at(-1).onload();}
        const count=probes.length;observeMediaDimensions('bounded-0',false,()=>{});assert.equal(probes.length,count+1);
    }finally{globalThis.Image=old.Image;globalThis.document=old.document;}
});
