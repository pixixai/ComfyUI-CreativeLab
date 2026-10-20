import assert from 'node:assert/strict';
import fs from 'node:fs';

export async function runXYToolbarChecks(send,sessionId,screenshotPrefix,click) {
    const evaluate=async expression=>{const result=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true},sessionId);assert.equal(result.exceptionDetails,undefined,JSON.stringify(result.exceptionDetails));return result.result.value;};
    const shot=async suffix=>{if(screenshotPrefix){const result=await send('Page.captureScreenshot',{format:'png'},sessionId);fs.writeFileSync(`${screenshotPrefix}-${suffix}.png`,Buffer.from(result.data,'base64'));}};
    const choose=async(name,source)=>evaluate(`(()=>{const input=document.querySelector('[data-xy-axis-source=${name}]');input.value=${JSON.stringify(source)};input.dispatchEvent(new Event('change',{bubbles:true}));})()`);
    assert.equal(await evaluate(`(()=>{const toolbar=document.querySelector('.clab-xy-toolbar'),r=toolbar.getBoundingClientRect(),canvas=document.querySelector('#clab-cards-container').getBoundingClientRect(),switcher=toolbar.querySelector('.clab-xy-origin-switch');return Math.abs((r.left+r.right-canvas.left-canvas.right)/2)<1&&canvas.bottom-r.bottom===20&&getComputedStyle(toolbar).borderRadius==='30px'&&toolbar.getAttribute('role')==='toolbar'&&[...toolbar.querySelectorAll(':scope>button')].map(button=>Object.keys(button.dataset)[0]).join(',')==='xyReassign,xyRecords,xyReset'&&switcher.querySelectorAll('button').length===2&&switcher.querySelectorAll('[aria-pressed=true]').length===1&&!document.querySelector('.clab-xy-orientation,.clab-xy-toolbar-separator,[data-xy-origin-options],#clab-cards-container>.clab-mode-controls')&&document.querySelector('[data-xy-run]').textContent==='▶ 运行 · 4 项';})()`),true);
    await click('[data-xy-origin=top]');assert.equal(await evaluate(`window.xyzModeDemo.view.xy.origin==='top'&&!document.querySelector('.axis-y').classList.contains('points-up')&&document.querySelector('[data-xy-origin=top]').getAttribute('aria-pressed')==='true'&&document.querySelector('[data-xy-origin=bottom]').getAttribute('aria-pressed')==='false'`),true);
    await click('[data-xy-origin=bottom]');await shot('toolbar');
    const p=await evaluate(`(()=>{const r=document.querySelector('[data-xy-reset]').getBoundingClientRect();return{x:(r.left+r.right)/2,y:(r.top+r.bottom)/2,zoom:window.xyzModeDemo.view.xy.zoom};})()`);
    await send('Input.dispatchMouseEvent',{type:'mouseWheel',x:p.x,y:p.y,deltaX:0,deltaY:-120},sessionId);await new Promise(resolve=>setTimeout(resolve,80));assert.equal(await evaluate(`window.xyzModeDemo.view.xy.zoom===${p.zoom}`),true);
    await evaluate(`document.querySelector('[data-xy-origin=top]').focus()`);
    for(const type of ['keyDown','keyUp'])await send('Input.dispatchKeyEvent',{type,key:' ',code:'Space',windowsVirtualKeyCode:32},sessionId);
    assert.equal(await evaluate(`window.xyzModeDemo.view.xy.origin==='top'&&document.activeElement===document.querySelector('[data-xy-origin=top]')&&!document.querySelector('#clab-cards-container').classList.contains('clab-xy-grabbing')`),true);
    await click('[data-xy-origin=bottom]');
    console.log('PASS bottom toolbar uses a two-button direction capsule, separate records icon, concise run count, no separator and isolated wheel/Space gestures');

    await evaluate(`window.toolbarBefore=window.xyzModeDemo.cards.map(card=>({card,json:JSON.stringify(card),image:document.querySelector('.clab-card[data-card-id="'+card.id+'"] img')}));window.toolbarAxisKeys=['x','y','z'].map(name=>window.xyzModeDemo.view.xy[name].bindings[0]);`);
    await click('[data-xy-reassign]');
    assert.equal(await evaluate(`(()=>{const p=document.querySelector('.clab-xy-axis-panel:popover-open'),a=document.querySelector('[data-xy-reassign]').getBoundingClientRect();return p.getBoundingClientRect().bottom<a.top&&p.querySelectorAll('select').length===3&&!p.textContent.includes('附加记录参数');})()`),true);
    await evaluate(`document.querySelector('[data-xy-axis-source=x]').focus()`);
    for(const type of ['keyDown','keyUp'])await send('Input.dispatchKeyEvent',{type,key:'ArrowDown',code:'ArrowDown',windowsVirtualKeyCode:40},sessionId);
    assert.equal(await evaluate(`window.xyzModeDemo.view.xy.x.bindings[0]===window.toolbarAxisKeys[1]&&window.xyzModeDemo.view.xy.y.bindings[0]===window.toolbarAxisKeys[0]`),true,'native select did not swap the complete axis groups');
    await choose('y','z');
    assert.equal(await evaluate(`window.xyzModeDemo.view.xy.y.bindings[0]===window.toolbarAxisKeys[2]&&window.xyzModeDemo.view.xy.z.bindings[0]===window.toolbarAxisKeys[0]&&window.toolbarBefore.length===window.xyzModeDemo.cards.length&&window.toolbarBefore.every(({card,json,image})=>window.xyzModeDemo.cards.includes(card)&&JSON.stringify(card)===json&&document.querySelector('.clab-card[data-card-id="'+card.id+'"] img')===image)&&!!document.querySelector('.clab-xy-axis-panel:popover-open')`),true);
    await shot('axis-assignments');await choose('y','z');await choose('x','y');await click('.clab-xy-popup-close');
    assert.equal(await evaluate(`JSON.stringify(['x','y','z'].map(name=>window.xyzModeDemo.view.xy[name].bindings[0]))===JSON.stringify(window.toolbarAxisKeys)`),true);
    console.log('PASS axis panel supports native keyboard assignment, swaps XYZ parameter values atomically and retains task/media/history identities');

    await click('[data-xy-records]');
    assert.equal(await evaluate(`(()=>{const p=document.querySelector('.clab-xy-record-panel:popover-open'),a=document.querySelector('[data-xy-records]').getBoundingClientRect();return p.getBoundingClientRect().bottom<a.top;})()`),true);await shot('record-settings');await click('[data-xy-add-record]');
    assert.equal(await evaluate(`document.querySelector('.clab-module-binding-popover:popover-open')?.getAttribute('aria-label')==='附加记录参数'&&!!document.querySelector('.clab-binding-start-pick')&&window.xyzModeDemo.view.xy.records.length===1`),true);
    await click('button[data-xy-node="110"]');await click('[data-xy-parameter="110||enabled"]');await click('.clab-xy-popup-close');
    await click('[data-xy-records]');
    assert.equal(await evaluate(`document.querySelector('.clab-xy-record').textContent.includes('开关')&&window.xyzModeDemo.cards.every(card=>card.recordParameters[0].key==='110||enabled'&&card.areas.find(area=>area.xyRecordKey==='110||enabled')?.recordOnly)`),true);
    await click('[data-xy-remove-record]');assert.equal(await evaluate(`window.xyzModeDemo.view.xy.records.length===0&&!!document.querySelector('.clab-xy-record-panel:popover-open')&&!document.querySelector('.clab-xy-record')`),true);await click('.clab-xy-popup-close');
    console.log('PASS separate records icon opens its own upward panel and adds, binds and removes immediately');
    await click('[data-xy-reset]');
    return 3;
}
