import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const source=fs.readFileSync(new URL('../web/components/workspace_modes/table_window.js',import.meta.url),'utf8').replace(/^import .*;\r?\n/gm,'').replaceAll('export ','');
const {tableTrackOffsets,tableTrackRange,tableRenderRange}=new Function(source+';return {tableTrackOffsets,tableTrackRange,tableRenderRange};')();

test('table preloading retains its window until the inner buffer is crossed',()=>{
    const offsets=tableTrackOffsets(Array.from({length:1000}),()=>144);
    const first=tableRenderRange(offsets,0,720,720);
    assert.equal(tableRenderRange(offsets,144,720,720,first),first);
    const later=tableRenderRange(offsets,720,720,720,first);assert.notEqual(later,first);
    assert.ok(later.end-later.start<=17);
    const jump=tableRenderRange(offsets,144*500,720,720,later);assert.ok(jump.start>490&&jump.end<520);
});

test('table windows locate variable-height rows, preserve full extent and clamp distant jumps',()=>{
    const offsets=tableTrackOffsets([48,144,320,96],size=>size);
    assert.deepEqual(offsets,[0,48,192,512,608]);
    assert.deepEqual(tableTrackRange(offsets,50,100,0),{start:1,end:2});
    assert.deepEqual(tableTrackRange(offsets,192,20,0),{start:2,end:3});
    assert.deepEqual(tableTrackRange(offsets,550,100,0),{start:3,end:4});
    assert.deepEqual(tableTrackRange(offsets,0,50,100),{start:0,end:2});
    assert.deepEqual(tableTrackRange([0],0,100),{start:0,end:0});
});

test('a large table window stays bounded at the beginning, middle and final row',()=>{
    const offsets=tableTrackOffsets(Array.from({length:10000}),()=>144);
    for(const top of [0,144*5000,144*9998]){
        const range=tableTrackRange(offsets,top,720);
        assert.ok(range.end-range.start<=10);assert.ok(range.start>=0&&range.end<=10000);
        assert.ok(offsets[range.start]<=top);assert.ok(offsets[range.end]>=Math.min(top+720,offsets.at(-1)));
    }
});
