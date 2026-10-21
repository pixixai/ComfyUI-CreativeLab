import assert from 'node:assert/strict';
import fs from 'node:fs';

export async function runXYLabelChecks(send,sessionId,click,screenshotPrefix) {
    const evaluate=async expression=>{const result=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true},sessionId);assert.equal(result.exceptionDetails,undefined,JSON.stringify(result.exceptionDetails));return result.result.value;};
    const type=async(selector,text)=>{await click(selector);for(const type of ['keyDown','keyUp'])await send('Input.dispatchKeyEvent',{type,key:'a',code:'KeyA',windowsVirtualKeyCode:65,modifiers:2},sessionId);await send('Input.insertText',{text},sessionId);await click('.clab-xy-values h4');};
    await evaluate(`(async()=>{const {state,createEmptyWorkspace,getActiveWorkspace,syncStateToActiveWorkspace,applyWorkspaceToState}=await import('/extensions/clab/components/ui_state.js');syncStateToActiveWorkspace();window.labelOriginalWorkspace=getActiveWorkspace();const demo=createEmptyWorkspace('刻度方向测试',{cards:[],view:{mode:'xy',xy:{x:{bindings:['110||steps'],values:[20,30]},y:{bindings:['110||sampler'],values:['Euler','DPM']},z:{enabled:true,bindings:['110||cfg'],values:[5,7,9]},outputNodeId:'111'}}});state.workspaces.push(demo);applyWorkspaceToState(demo);document.dispatchEvent(new Event('clab_render_ui'));window.labelDemo=demo;window.labelCardsBefore=JSON.stringify(demo.cards);window.labelImages=[...document.querySelectorAll('#clab-cards-container img')];window.labelAt=name=>document.querySelector(name==='z'?'.clab-z-tick[data-xy-z-layer="0"]':'.clab-axis-label[data-xy-edit-values='+name+'][data-xy-tick="0"]');window.labelPointError=name=>{const tick=window.labelAt(name),style=getComputedStyle(tick),matrix=new DOMMatrix(style.transform),origin=style.transformOrigin.split(' ').map(parseFloat);return Math.max(Math.abs(matrix.e+origin[0]),Math.abs(matrix.f+origin[1]));};})()`);
    for(const origin of ['bottom','top']){
        await click('[data-xy-origin='+origin+']');
        for(const name of ['x','y','z']){
            await click('.axis-'+name);
            assert.equal(await evaluate(`(()=>{const h=document.querySelector('.clab-xy-values h4'),controls=h.nextElementSibling;return controls.classList.contains('clab-xy-label-controls')&&controls.nextElementSibling.classList.contains('clab-axis-value-tabs')&&controls.querySelectorAll('[data-xy-label-anchor]').length===9&&Number(controls.querySelector('[aria-pressed=true]').dataset.xyLabelAnchor)===${name==='x'?(origin==='bottom'?1:7):5}&&document.querySelector('[data-xy-label-angle]').value==='0'&&window.labelPointError('${name}')<.001;})()`),true,`wrong default anchor for ${name}/${origin}`);
            await click('.clab-xy-popup-close');
        }
    }
    console.log('PASS X/Y/Z alignment controls sit below the value heading and follow both orientation defaults');
    await click('[data-xy-origin=bottom]');
    for(const name of ['x','y','z']){
        await click('.axis-'+name);await evaluate(`window.labelTick=window.labelAt('${name}');window.labelPoint=JSON.stringify(window.labelTick.xyPosition);window.labelCamera=JSON.stringify([window.labelDemo.view.xy.zoom,window.labelDemo.view.xy.panX,window.labelDemo.view.xy.panY]);`);
        await type('[data-xy-label-angle]','45');
        for(let anchor=0;anchor<9;anchor++){
            await click('[data-xy-label-anchor="'+anchor+'"]');
            assert.equal(await evaluate(`window.labelAt('${name}')===window.labelTick&&JSON.stringify(window.labelTick.xyPosition)===window.labelPoint&&window.labelPointError('${name}')<.001&&window.labelDemo.view.xy.${name}.labelAnchor===${anchor}&&JSON.stringify([window.labelDemo.view.xy.zoom,window.labelDemo.view.xy.panX,window.labelDemo.view.xy.panY])===window.labelCamera`),true,`${name} label point moved when choosing anchor ${anchor}`);
        }
        for(const angle of [90,180,360]){await type('[data-xy-label-angle]',String(angle));assert.equal(await evaluate(`window.labelPointError('${name}')<.001&&JSON.stringify(window.labelTick.xyPosition)===window.labelPoint&&window.labelDemo.view.xy.${name}.labelAngle===${angle}`),true);}
        await type('[data-xy-label-angle]','45');await click('.clab-xy-popup-close');
        await click(name==='z'?'.clab-z-tick[data-xy-z-layer="0"]':'.clab-axis-label[data-xy-edit-values='+name+'][data-xy-tick="0"]');
        if(name==='z'){assert.equal(await evaluate(`window.labelDemo.view.xy.z.current===0&&!document.querySelector('.clab-xy-values:popover-open')`),true,'rotated Z value lost its layer-selection hit target');await click('.axis-z');}
        assert.equal(await evaluate(`document.querySelector('.clab-xy-values:popover-open')?.getAttribute('aria-label')==='${name.toUpperCase()}轴设置'&&document.querySelector('[data-xy-label-angle]').value==='45'`),true,'rotated label hit target did not follow its text');
        await type('[data-xy-label-angle]','360');await click('.clab-xy-popup-close');await click('.axis-'+name);assert.equal(await evaluate(`document.querySelector('[data-xy-label-angle]').value==='360'&&document.querySelector('[data-xy-label-anchor="8"]').getAttribute('aria-pressed')==='true'`),true);await click('.clab-xy-popup-close');
    }
    console.log('PASS all nine text anchors rotate around the same tick point at 45/90/180/360 degrees without changing the camera or media');
    await click('.axis-x');
    const dial=await evaluate(`(()=>{const r=document.querySelector('[data-xy-label-dial]').getBoundingClientRect(),p=document.querySelector('.clab-xy-values').getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2,r:r.width/2-4,left:p.left,top:p.top};})()`);
    await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:dial.x+dial.r,y:dial.y},sessionId);await send('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',buttons:1,clickCount:1,x:dial.x+dial.r,y:dial.y},sessionId);
    for(const [dx,dy,angle]of [[0,1,90],[-1,0,180],[0,-1,270]]){
        await send('Input.dispatchMouseEvent',{type:'mouseMoved',button:'left',buttons:1,x:dial.x+dx*dial.r,y:dial.y+dy*dial.r},sessionId);
        assert.equal(await evaluate(`(async()=>{await new Promise(requestAnimationFrame);const p=document.querySelector('.clab-xy-values').getBoundingClientRect();return document.querySelector('[data-xy-label-angle]').value==='${angle}'&&window.labelDemo.view.xy.x.labelAngle===${angle}&&window.labelPointError('x')<.001&&Math.abs(p.left-${dial.left})<1&&Math.abs(p.top-${dial.top})<1;})()`),true,'dial did not update angle/preview in sync or moved its panel during dragging');
    }
    await send('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',buttons:0,clickCount:1,x:dial.x,y:dial.y-dial.r},sessionId);
    assert.equal(await evaluate(`(async()=>{const {buildPersistedState}=await import('/extensions/clab/components/ui_state.js'),{createWorkspaceView}=await import('/extensions/clab/components/workspace_modes/view_state.js');const saved=buildPersistedState().workspaces.find(w=>w.id===window.labelDemo.id),view=createWorkspaceView(saved.view);return view.xy.x.labelAngle===270&&view.xy.y.labelAngle===360&&view.xy.z.labelAnchor===8&&JSON.stringify(window.labelDemo.cards)===window.labelCardsBefore&&window.labelImages.every(image=>image.isConnected);})()`),true);
    await click('[data-xy-label-angle]');for(const type of ['keyDown','keyUp'])await send('Input.dispatchKeyEvent',{type,key:'a',code:'KeyA',windowsVirtualKeyCode:65,modifiers:2},sessionId);await send('Input.insertText',{text:'315'},sessionId);
    for(const type of ['keyDown','keyUp'])await send('Input.dispatchKeyEvent',{type,key:'Escape',code:'Escape',windowsVirtualKeyCode:27},sessionId);
    assert.equal(await evaluate(`(()=>{const saved=JSON.parse(window.testApp.graph.serialize().nodes[0].widgets_values[0]);return saved.workspaces.find(w=>w.id===window.labelDemo.id).view.xy.x.labelAngle===315;})()`),true,'closing an angle edit before blur lost its final value during workflow serialization');
    await click('.axis-x');await type('[data-xy-label-angle]','270');
    if(screenshotPrefix){const shot=await send('Page.captureScreenshot',{format:'png'},sessionId);fs.writeFileSync(screenshotPrefix+'-label-controls.png',Buffer.from(shot.data,'base64'));}
    await click('.clab-xy-popup-close');await click('[data-xy-reset]');
    await evaluate(`(async()=>{const {state,applyWorkspaceToState}=await import('/extensions/clab/components/ui_state.js');applyWorkspaceToState(window.labelOriginalWorkspace);state.workspaces=state.workspaces.filter(w=>w!==window.labelDemo);document.dispatchEvent(new Event('clab_render_ui'));})()`);
    console.log('PASS native angle dial updates the degree input live, keeps its panel steady, persists independently per axis and retains tasks/media');
    return 3;
}
