import test from 'node:test';
import assert from 'node:assert/strict';
import { axisLabelState, axisLabelConfig, axisLabelTransform, axisLabelBounds } from '../web/components/workspace_modes/axis_label_layout.js';
import { createWorkspaceView } from '../web/components/workspace_modes/view_state.js';
import { swapMatrixAxes } from '../web/components/workspace_modes/xy_axis_swap.js';

test('default label anchors follow X direction and keep Y/Z right-centered',()=>{
    assert.equal(axisLabelConfig({},'x','bottom').anchor,1);assert.equal(axisLabelConfig({},'x','top').anchor,7);
    for(const name of ['y','z'])for(const origin of ['top','bottom'])assert.deepEqual(axisLabelConfig({},name,origin),{anchor:5,angle:0,x:1,y:.5});
    for(let anchor=0;anchor<9;anchor++){
        const config=axisLabelConfig({labelAnchor:anchor,labelAngle:45},'x','bottom');
        assert.equal(config.x,(anchor%3)/2);assert.equal(config.y,Math.floor(anchor/3)/2);
        assert.equal(axisLabelTransform(config).origin,`${100*config.x}% ${100*config.y}%`);
    }
});

test('rotated label bounds use a fixed world point for every alignment',()=>{
    const point={x:100,y:200},bounds=angle=>axisLabelBounds(point,80,18,axisLabelConfig({labelAngle:angle},'x','bottom'));
    assert.deepEqual(bounds(0),{left:60,top:200,right:140,bottom:218});
    const ninety=bounds(90);assert.ok(Math.abs(ninety.left-82)<1e-9);assert.ok(Math.abs(ninety.right-100)<1e-9);assert.equal(ninety.top,160);assert.equal(ninety.bottom,240);
    for(let anchor=0;anchor<9;anchor++)for(const angle of [0,45,90,180,270,360]){
        const config=axisLabelConfig({labelAnchor:anchor,labelAngle:angle},'x','bottom'),box=axisLabelBounds(point,80,18,config);
        assert.ok(box.left<=point.x+1e-9&&box.right>=point.x-1e-9&&box.top<=point.y+1e-9&&box.bottom>=point.y-1e-9);
        assert.ok(Math.abs((box.right-box.left)-(80*Math.abs(Math.cos(angle*Math.PI/180))+18*Math.abs(Math.sin(angle*Math.PI/180))))<1e-9);
    }
});

test('label settings persist independently per axis and survive swaps without changing tasks or values',()=>{
    const seed={mode:'xy',xy:{x:{bindings:['1||a'],values:[1],labelAnchor:8,labelAngle:360},y:{bindings:['1||b'],values:[2],labelAnchor:0,labelAngle:45},z:{bindings:['1||c'],values:[3],labelAnchor:4,labelAngle:90}}};
    const view=createWorkspaceView(JSON.parse(JSON.stringify(seed)));assert.equal(view.xy.x.labelAngle,360);assert.equal(view.xy.x.labelAnchor,8);
    swapMatrixAxes(view.xy,'x','z');assert.equal(view.xy.x.labelAnchor,8);assert.equal(view.xy.x.labelAngle,360);assert.equal(view.xy.z.labelAnchor,4);assert.equal(view.xy.z.labelAngle,90);assert.deepEqual(view.xy.x.values,[3]);
    assert.deepEqual(axisLabelState({labelAnchor:99,labelAngle:999}),{labelAngle:360});assert.deepEqual(axisLabelState({labelAnchor:1.5,labelAngle:NaN}),{});
    assert.equal(axisLabelConfig({labelAnchor:0},'x','top').anchor,0);
});
