import assert from 'node:assert/strict';

export async function runXYFocusChecks(send,sessionId,click) {
    const evaluate=async expression=>{const result=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true},sessionId);assert.equal(result.exceptionDetails,undefined,JSON.stringify(result.exceptionDetails));return result.result.value;};
    const key=async(type,code='Space',key=' ',windowsVirtualKeyCode=32,text)=>send('Input.dispatchKeyEvent',{type,code,key,windowsVirtualKeyCode,...(text===undefined?{}:{text})},sessionId);
    for(const selector of ['.clab-z-tick','.clab-xy-layer-title','[data-xy-bind=z]','[data-xy-origin=top]','[data-xy-reset]','[data-xy-config]','[data-xy-config-options]']){
        await click(selector);
        if(await evaluate(`!!document.querySelector('.clab-module-binding-popover:popover-open')`)){await key('keyDown','Escape','Escape',27);await key('keyUp','Escape','Escape',27);}
        const p=await evaluate(`(()=>{const target=document.querySelector(${JSON.stringify(selector)}),r=document.querySelector('#clab-cards-container').getBoundingClientRect();target.focus();window.xyFocusState=JSON.stringify([window.xyzModeDemo.view.xy.origin,window.xyzModeDemo.view.xy.z]);return{x:r.left+r.width*.65,y:r.top+r.height*.45,panX:window.xyzModeDemo.view.xy.panX,panY:window.xyzModeDemo.view.xy.panY};})()`);
        await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:p.x,y:p.y},sessionId);await key('keyDown');
        assert.equal(await evaluate(`document.querySelector('#clab-cards-container').classList.contains('clab-xy-grabbing')&&!document.activeElement.matches('button')`),true,`button focus blocked Space after ${selector}`);
        await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:p.x+16,y:p.y+11},sessionId);await key('keyUp');
        assert.equal(await evaluate(`Math.abs(window.xyzModeDemo.view.xy.panX-${p.panX}-16)<.01&&Math.abs(window.xyzModeDemo.view.xy.panY-${p.panY}-11)<.01&&!document.querySelector('#clab-cards-container').classList.contains('clab-xy-grabbing')&&JSON.stringify([window.xyzModeDemo.view.xy.origin,window.xyzModeDemo.view.xy.z])===window.xyFocusState`),true,`Space failed to pan or activated the previous control after ${selector}`);
        await click('[data-xy-reset]');
    }
    console.log('PASS Space takes priority over retained Z/toolbar/anchor focus, pans without a mouse button and does not reactivate controls');
    await click('[data-xy-bind=z]');
    const p=await evaluate(`(()=>{const input=document.querySelector('.clab-binding-search'),r=document.querySelector('#clab-cards-container').getBoundingClientRect();input.value='';input.focus();return{x:r.right-20,y:r.top+30};})()`);
    await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:p.x,y:p.y},sessionId);await key('keyDown','Space',' ',32,' ');await key('keyUp');
    assert.equal(await evaluate(`document.querySelector('.clab-binding-search').value===' '&&!document.querySelector('#clab-cards-container').classList.contains('clab-xy-grabbing')`),true,'Space in a binding search was stolen by the hand tool');
    await key('keyDown','Escape','Escape',27);await key('keyUp','Escape','Escape',27);
    await click('[data-xy-origin=bottom]');await click('[data-xy-reset]');
    console.log('PASS open binding inputs keep native Space text editing even when the pointer is over the canvas');
    return 2;
}
