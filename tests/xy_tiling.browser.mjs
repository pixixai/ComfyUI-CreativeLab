import assert from 'node:assert/strict';
import fs from 'node:fs';

export async function runXYTilingChecks(send,sessionId) {
    const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true},sessionId);assert.equal(r.exceptionDetails,undefined,JSON.stringify(r.exceptionDetails));return r.result.value;};
    const settle=()=>evaluate('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
    const click=async selector=>{const p=await evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});e.scrollIntoView({block:'nearest',inline:'nearest'});const r=e.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2};})()`);for(const type of ['mouseMoved','mousePressed','mouseReleased'])await send('Input.dispatchMouseEvent',{type,...p,...(type==='mouseMoved'?{}:{button:'left',clickCount:1,buttons:type==='mousePressed'?1:0})},sessionId);await settle();};
    const shot=async name=>{if(process.env.CLAB_DOCK_SCREENSHOT_PREFIX){const {data}=await send('Page.captureScreenshot',{format:'png'},sessionId);fs.writeFileSync(process.env.CLAB_DOCK_SCREENSHOT_PREFIX+'-'+name+'.png',Buffer.from(data,'base64'));}};
    const change=async(key,value)=>{await evaluate(`(()=>{const input=document.querySelector('.clab-xy-tiling-panel:popover-open [data-xy-tiling=${key}]')||document.querySelector('.clab-preview-modal.visible [data-xy-tiling=${key}]');input.value=${JSON.stringify(value)};input.dispatchEvent(new Event('change',{bubbles:true}));})()`);await settle();};
    await evaluate(`window.showXYZDemo();const xy=window.xyzModeDemo.view.xy;xy.z.display='single';xy.tiling={columns:0,rowGap:240,columnGap:360};window.showXYZDemo();document.querySelector('[data-xy-reset]').click();`);await settle();
    for(const [selector,panel]of [['[data-xy-reassign]','.clab-xy-axis-panel'],['[data-xy-records]','.clab-xy-record-panel']]){
        await click('#clab-panel '+selector);assert.equal(await evaluate(`!!document.querySelector('${panel}:popover-open')`),true);
        await click('#clab-panel '+selector);assert.equal(await evaluate(`!!document.querySelector('${panel}:popover-open')`),false,'second click reopens '+selector);
    }
    assert.equal(await evaluate(`document.querySelector('#clab-panel [data-xy-tile-settings]').hidden`),true);
    assert.equal(await evaluate(`document.querySelector('[data-xy-reset]').closest('.clab-xy-toolbar-start')!==null&&[...document.querySelector('.clab-xy-toolbar-center').children].map(e=>e.matches('.clab-xy-tiling')?'tiles':e.dataset.xyOriginOptions!==undefined?'origin':e.dataset.xyRunAxisOptions!==undefined?'priority':e.dataset.xyReassign!==undefined?'swap':'records').join(',')==='origin,priority,swap,records,tiles'`),true);
    assert.equal(await evaluate(`(()=>{const dock=document.querySelector('.clab-tool-dock').getBoundingClientRect(),left=document.querySelector('[data-xy-reset]').getBoundingClientRect(),center=document.querySelector('.clab-xy-toolbar-center').getBoundingClientRect(),right=document.querySelector('.clab-toolbar-right').getBoundingClientRect();return left.right<center.left&&center.right<=right.left+1&&Math.abs(center.left+center.right-dock.left-dock.right)<2;})()`),true);
    const before=await evaluate(`JSON.stringify([window.xyzModeDemo.view.xy.zoom,window.xyzModeDemo.view.xy.panX,window.xyzModeDemo.view.xy.panY])`);
    await click('#clab-panel [data-xy-toggle-layers]');
    assert.equal(await evaluate(`document.querySelectorAll('#clab-cards-container .clab-xy-layer-axes').length===3&&document.querySelectorAll('#clab-cards-container .clab-z-tick').length===0&&getComputedStyle(document.querySelector('#clab-cards-container .axis-z')).visibility==='hidden'`),true);
    assert.equal(await evaluate(`JSON.stringify([window.xyzModeDemo.view.xy.zoom,window.xyzModeDemo.view.xy.panX,window.xyzModeDemo.view.xy.panY])`),before);
    assert.equal(await evaluate(`document.querySelector('#clab-panel [data-xy-tile-settings]').hidden`),false);
    await click('#clab-panel [data-xy-tile-settings]');await click('#clab-panel [data-xy-tile-settings]');assert.equal(await evaluate(`!!document.querySelector('.clab-xy-tiling-panel:popover-open')`),false);
    await click('#clab-panel [data-xy-tile-settings]');await change('columns','1');await change('rowGap','75');await change('columnGap','55');
    const tiles=await evaluate(`(()=>{const cells=[...document.querySelectorAll('#clab-cards-container .clab-card:not([hidden])')],lefts=[...new Set(cells.map(cell=>cell.style.left))];return {lefts,tiling:window.xyzModeDemo.view.xy.tiling,open:!!document.querySelector('.clab-xy-tiling-panel:popover-open'),x:window.xyzModeDemo.view.xy.x.values};})()`);assert.ok(tiles.lefts.length===2&&tiles.tiling.rowGap===75&&tiles.open,JSON.stringify(tiles));
    assert.equal(await evaluate(`(()=>{const row=document.querySelector('.clab-xy-tiling-panel:popover-open [data-xy-tiling=rowGap]').getBoundingClientRect(),col=document.querySelector('.clab-xy-tiling-panel:popover-open [data-xy-tiling=columnGap]').getBoundingClientRect();return Math.abs(row.top-col.top)<1&&row.right<col.left;})()`),true);
    assert.equal(await evaluate(`(()=>{const root=document.querySelector('#clab-cards-container'),header=root.querySelector('.clab-xy-z-binding.is-public').getBoundingClientRect();return header.bottom<Math.min(...[...root.querySelectorAll('.clab-xy-layer-title')].map(title=>title.getBoundingClientRect().top));})()`),true);
    await shot('tiling-workspace');
    await click('#clab-panel [data-xy-tile-settings]');
    await click('#clab-cards-container .clab-xy-z-binding.is-public [data-xy-bind=z]');assert.equal(await evaluate(`!!document.querySelector('.clab-module-binding-popover:popover-open .clab-binding-params')`),true);await click('.clab-xy-popup-close');
    await click('#clab-btn-preview');await settle();
    assert.equal(await evaluate(`document.querySelector('[data-review-xy-tiles]').checked&&!document.querySelector('.clab-review-grid-stage [data-xy-toggle-layers]')`),true);
    assert.equal(await evaluate(`!document.querySelector('.clab-preview-modal-right [data-xy-tile-settings]')&&!document.querySelector('.clab-xy-tiling-inline').hidden`),true);
    await change('columns','2');await change('columnGap','90');
    assert.equal(await evaluate(`window.xyzModeDemo.view.xy.tiling.columns===2&&window.xyzModeDemo.view.xy.tiling.columnGap===90`),true);
    assert.equal(await evaluate(`(()=>{const e=document.querySelector('.clab-review-xy-tiling-section'),s=getComputedStyle(e);return parseFloat(s.paddingTop)>=8&&s.borderTopColor===s.borderBottomColor&&s.borderTopWidth==='1px';})()`),true);
    await shot('tiling-preview');
    await click('[data-review-xy-tiles]');assert.equal(await evaluate(`document.querySelector('.clab-xy-tiling-inline').hidden`),true);assert.equal(await evaluate(`window.xyzModeDemo.view.xy.z.display==='single'&&getComputedStyle(document.querySelector('.clab-review-grid-stage .axis-z')).visibility==='visible'`),true);
    await click('.clab-preview-modal-close');await settle();
    assert.equal(await evaluate(`document.querySelector('#clab-panel [data-xy-toggle-layers]').getAttribute('aria-pressed')`),'false');
    assert.equal(await evaluate(`document.querySelector('#clab-panel [data-xy-tile-settings]').hidden&&!document.querySelector('#clab-cards-container .clab-xy-z-binding').classList.contains('is-public')&&getComputedStyle(document.querySelector('#clab-cards-container .axis-z')).visibility==='visible'`),true);
    await click('#clab-btn-preview');await settle();await click('[data-review-xy-tiles]');assert.equal(await evaluate(`!document.querySelector('.clab-xy-tiling-inline').hidden&&document.querySelector('.clab-preview-modal.visible [data-xy-tiling=columns]').value==='2'`),true);await click('[data-review-xy-tiles]');await click('.clab-preview-modal-close');await settle();
    await evaluate(`window.xyzModeDemo.view.xy.tiling={columns:0,rowGap:240,columnGap:360};window.showXYZDemo();`);
    console.log('PASS native toolbar/settings menus close on second click; tiling layout persists and syncs with preview while hiding Z ticks and retaining camera/run scope');
    return 1;
}
