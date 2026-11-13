import assert from 'node:assert/strict';

export async function runXYGestureChecks(send,sessionId) {
    const evaluate=async expression=>{const result=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true},sessionId);assert.equal(result.exceptionDetails,undefined,JSON.stringify(result.exceptionDetails));return result.result.value;};
    const settle=()=>evaluate('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
    const mouse=(type,p,extra={})=>send('Input.dispatchMouseEvent',{type,...p,...extra},sessionId);
    const point=selector=>evaluate(`(()=>{const el=document.querySelector(${JSON.stringify(selector)}),r=el.getBoundingClientRect(),x=(r.left+r.right)/2,y=(r.top+r.bottom)/2;if(!el.contains(document.elementFromPoint(x,y)))throw Error('Gesture target is obscured: '+${JSON.stringify(selector)});return{x,y};})()`);
    const click=async(selector,modifiers=0)=>{const p=await point(selector);await mouse('mouseMoved',p);await mouse('mousePressed',p,{button:'left',buttons:1,clickCount:1,modifiers});await mouse('mouseReleased',p,{button:'left',buttons:0,clickCount:1,modifiers});await settle();};
    const drag=async(selector,button='left',dx=24,dy=16)=>{const p=await point(selector),end={x:p.x+dx,y:p.y+dy};await mouse('mouseMoved',p);await mouse('mousePressed',p,{button,buttons:button==='left'?1:4,clickCount:1});await mouse('mouseMoved',end,{button,buttons:button==='left'?1:4});await mouse('mouseReleased',end,{button,buttons:0,clickCount:1});await settle();};
    await evaluate(`(async()=>{window.showXYZDemo();const xy=window.xyzModeDemo.view.xy;Object.assign(xy.x,{bindings:['110||steps'],values:[20,30],gap:4,margin:10});Object.assign(xy.y,{bindings:['110||sampler'],values:['Euler','DPM'],gap:4,margin:10});Object.assign(xy.z,{enabled:true,bindings:['110||cfg'],values:[5,7,9],current:0,display:'single'});xy.origin='bottom';xy.previewRecords=[];xy.previewRecordsExpanded=false;for(const axis of [xy.x,xy.y,xy.z]){delete axis.labelAngle;delete axis.labelAnchor;}const {state,getActiveWorkspace}=await import('/extensions/clab/components/ui_state.js'),{reconcileMatrixArchive}=await import('/extensions/clab/components/workspace_modes/xy_archive.js'),{synchronizeMatrix}=await import('/extensions/clab/components/workspace_modes/xy_model.js'),{workflowParameters}=await import('/extensions/clab/components/workspace_modes/parameters.js');const workspace=getActiveWorkspace();reconcileMatrixArchive(state.cards,xy,workspace.archivedTasks,workspace.view.table);synchronizeMatrix(state.cards,xy,workflowParameters());window.showXYZDemo();document.querySelector('[data-xy-reset]').click();})()`);await settle();
    const ids=await evaluate(`(async()=>{const {state,getActiveWorkspace}=await import('/extensions/clab/components/ui_state.js'),{visibleMatrixCells}=await import('/extensions/clab/components/workspace_modes/xy_model.js');return visibleMatrixCells(state.cards,getActiveWorkspace().view.xy).sort((a,b)=>a.y-b.y||a.x-b.x).map(item=>item.card.id);})()`);
    assert.equal(ids.length,4);
    const selection=preview=>evaluate(preview?`[...document.querySelectorAll('.clab-review-grid-stage .clab-card.selected')].map(e=>e.dataset.cardId)`:`import('/extensions/clab/components/ui_state.js').then(({state})=>state.cards.filter(card=>state.selectedAreaIds.includes(card.xyOutputId)).map(card=>card.id))`);
    for(const preview of [false,true]){
        if(preview){
            await evaluate(`(async()=>{const {state,getActiveWorkspace}=await import('/extensions/clab/components/ui_state.js');const xy=getActiveWorkspace().view.xy;xy.records=[{id:'gesture-record',key:'110||steps'},{id:'gesture-prompt',key:'110||text'}];for(const card of state.cards){const out=card.areas.find(area=>area.id===card.xyOutputId);if(!out)continue;out.history=['/view?filename=first.png','/view?filename=second.png'];out.historyIndex=1;out.resultUrl=out.history[1];out.mediaSize={url:out.resultUrl,width:160,height:90};out.historyRuns=[{recordParameters:[{key:'110||steps',label:'记录步数',value:12},{key:'110||text',label:'XYZ参数 · 正向提示词',value:'long prompt <safe> '.repeat(200)+'x'.repeat(512)}]},{recordParameters:[{key:'110||steps',label:'记录步数',value:34},{key:'110||text',label:'XYZ参数 · 正向提示词',value:'long prompt <safe> '.repeat(200)+'x'.repeat(512)}]}];}window.gestureOpeningTransform=document.querySelector('#clab-cards-container .clab-cards-wrapper').style.transform;window.gestureWorkspaceBefore=JSON.stringify({xy,cards:state.cards},(key,value)=>['zoom','panX','panY','cameraReady','previewRecords','previewRecordsExpanded','tiling','display'].includes(key)?undefined:value);document.querySelector('#clab-btn-preview').click();})()`);
            await settle();
            assert.equal(await evaluate(`document.querySelector('.clab-review-grid-stage .clab-cards-wrapper').style.transform`),await evaluate('window.gestureOpeningTransform'),'preview entry reset the workspace camera');
            await click('[data-review-xy-fit]');
        }
        const stage=preview?'.clab-review-grid-stage':'#clab-cards-container',cell=id=>`${stage} .clab-card[data-card-id="${id}"] .clab-preview-bg`;
        await click(cell(ids[0]));assert.deepEqual(await selection(preview),[ids[0]]);
        await click(cell(ids[1]),2);assert.equal((await selection(preview)).length,2);
        await click(cell(ids[0]));await click(cell(ids[3]),8);assert.deepEqual((await selection(preview)).sort(),[...ids].sort());
        await click(cell(ids[0]));await click(cell(ids[2]),8);assert.deepEqual((await selection(preview)).sort(),[ids[0],ids[2]].sort());
        await click(cell(ids[0]),2);assert.deepEqual(await selection(preview),[ids[2]]);
        const transform=()=>evaluate(`document.querySelector('${stage} .clab-cards-wrapper').style.transform`);
        for(const button of ['left','middle']){
            const before=await transform(),selected=await selection(preview);
            await drag(cell(ids[0]),button);assert.notEqual(await transform(),before,`${preview?'preview':'workspace'} ${button} drag did not pan`);
            assert.deepEqual(await selection(preview),selected,'panning changed selection');
            assert.equal(await evaluate(`!!document.querySelector('.clab-module-binding-popover:popover-open')`),false,'panning opened a binding/axis panel');
        }
        const before=await transform();await drag(`${stage} .axis-x`);assert.notEqual(await transform(),before);
        assert.equal(await evaluate(`!!document.querySelector('.clab-xy-values:popover-open')`),false,'axis drag was treated as a click');
        const wheelPoint=await point(cell(ids[0])),beforeWheel=await transform();
        await evaluate(`window.gestureWheelBlocker=event=>event.stopImmediatePropagation();document.addEventListener('wheel',window.gestureWheelBlocker,true);`);
        try {await mouse('mouseWheel',wheelPoint,{deltaX:0,deltaY:-60});await settle();assert.notEqual(await transform(),beforeWheel,'ancestor wheel listener blocked matrix zoom');}
        finally{await evaluate(`document.removeEventListener('wheel',window.gestureWheelBlocker,true);delete window.gestureWheelBlocker;`);}
        if(preview){
            assert.equal(await evaluate(`!!document.querySelector('.clab-preview-modal-left [data-review-xy-record]')&&!document.querySelector('.clab-preview-modal-right [data-review-xy-record]')`),true);
            await click('.clab-preview-modal-left [data-review-xy-record]');await click(cell(ids[0]));
            assert.equal(await evaluate(`getComputedStyle(document.querySelector('[data-review-xy-fit]')).textAlign`),'center');
            assert.equal(await evaluate(`document.querySelectorAll('.clab-review-grid-stage .clab-review-xy-records').length===1&&!document.querySelector('.clab-review-grid-stage .clab-card .clab-review-xy-records')`),true);
            assert.equal(await evaluate(`(async()=>{const {getActiveWorkspace}=await import('/extensions/clab/components/ui_state.js'),{createWorkspaceView}=await import('/extensions/clab/components/workspace_modes/view_state.js');const view=getActiveWorkspace().view;return view.xy.previewRecords.includes('110||steps')&&createWorkspaceView(JSON.parse(JSON.stringify(view))).xy.previewRecords.includes('110||steps');})()`),true);
            assert.match(await evaluate(`document.querySelector('[data-review-xy-cell-info]').textContent`),/记录步数34/);
            await evaluate(`document.querySelector('.clab-review-grid-stage').dispatchEvent(new KeyboardEvent('keydown',{bubbles:true,cancelable:true,key:'ArrowLeft'}))`);
            assert.match(await evaluate(`document.querySelector('[data-review-xy-cell-info]').textContent`),/记录步数12/);
            assert.equal(await evaluate(`(async()=>{const {state,getActiveWorkspace}=await import('/extensions/clab/components/ui_state.js');return JSON.stringify({xy:getActiveWorkspace().view.xy,cards:state.cards},(key,value)=>['zoom','panX','panY','cameraReady','previewRecords','previewRecordsExpanded','tiling','display'].includes(key)?undefined:value)===window.gestureWorkspaceBefore;})()`),true);
            assert.match(await evaluate(`document.querySelector('.clab-review-xy-records [data-record-value]').textContent`),/12[\s\S]*34/);
            for(const origin of ['top','bottom']){
                await click('[data-review-xy-orientation][value='+origin+']');
                await mouse('mouseWheel',await point(stage),{deltaX:0,deltaY:-30});await settle();
                assert.equal(await evaluate(`(()=>{const stage=document.querySelector('.clab-review-grid-stage'),table=stage.querySelector('.clab-review-xy-records').getBoundingClientRect(),z=stage.querySelector('.clab-xy-z-binding').getBoundingClientRect(),y=stage.querySelector('[data-xy-bind=y]').getBoundingClientRect(),title=stage.querySelector('.clab-xy-layer-title').getBoundingClientRect();return Math.abs(table.right-z.right)<1&&(${JSON.stringify(origin)}==='bottom'?Math.abs(table.top-y.top)<1&&table.bottom<z.top&&title.bottom<y.top:Math.abs(table.bottom-y.bottom)<1&&table.top>z.bottom&&title.bottom<z.top);})()`),true,'record table or Z title overlaps a binding summary in '+origin);
            }
            assert.equal(await evaluate(`(async()=>{const {capturePreviewLayout}=await import('/extensions/clab/components/contextmenu/content/preview_layout_export.js');const layout=await capturePreviewLayout(document.querySelector('.clab-review-grid-stage'));document.body.append(layout.outer);try{const box=layout.outer.getBoundingClientRect(),record=layout.outer.querySelector('.clab-review-xy-records').getBoundingClientRect();return record.left>=box.left&&record.top>=box.top&&record.right<=box.right&&record.bottom<=box.bottom;}finally{layout.outer.remove();}})()`),true,'matrix export clips the shared record table');
            const sharedTransform=await transform();
            for(const selector of ['[data-xy-z-layer="1"]','[data-review-xy-tiles]','[data-review-xy-tiles]','[data-xy-z-layer="0"]']){
                await evaluate(`document.querySelector(${JSON.stringify(selector)}==='[data-review-xy-tiles]'?${JSON.stringify(selector)}:'.clab-review-grid-stage '+${JSON.stringify(selector)}).click()`);await settle();
                assert.equal(await transform(),sharedTransform,'Z layer/tile action reset the preview camera');
                if(selector==='[data-review-xy-tiles]'&&await evaluate(`document.querySelector('[data-review-xy-tiles]').checked`))assert.equal(await evaluate(`(()=>{const stage=document.querySelector('.clab-review-grid-stage'),table=stage.querySelector('.clab-review-xy-records').getBoundingClientRect(),left=Math.min(...[...stage.querySelectorAll('.clab-card')].map(card=>card.getBoundingClientRect().left));return table.right<left&&!!stage.querySelector('.clab-xy-z-binding.is-public');})()`),true,'moving the public Z header displaced records over matrix media');
            }
            await click('[data-review-mode=browse]');await click('[data-review-mode=xy]');
            assert.equal(await transform(),sharedTransform,'switching preview pages reset the camera');
            await click('.clab-preview-modal-close');
            assert.equal(await evaluate(`document.querySelector('#clab-cards-container .clab-cards-wrapper').style.transform`),sharedTransform,'workspace did not receive the preview camera');
            await click('#clab-btn-preview');await settle();
            assert.equal(await transform(),sharedTransform,'reopening preview lost the shared camera');
            assert.equal(await evaluate(`document.querySelector('[data-review-xy-record]').checked&&!!document.querySelector('.clab-review-xy-records')`),true,'reopening preview lost the checked record parameter');
            assert.equal(await evaluate(`(()=>{const stage=document.querySelector('.clab-review-grid-stage'),table=stage.querySelector('.clab-review-xy-records').getBoundingClientRect(),y=stage.querySelector('[data-xy-bind=y]').getBoundingClientRect(),z=stage.querySelector('.clab-xy-z-binding').getBoundingClientRect(),title=stage.querySelector('.clab-xy-layer-title').getBoundingClientRect();return table.width>0&&Math.abs(table.right-z.right)<1&&Math.abs(table.top-y.top)<1&&title.bottom<y.top;})()`),true,'reopened matrix needs a click to position its title/record table');
            assert.deepEqual(await evaluate(`[...document.querySelectorAll('.clab-review-xy-records [role=columnheader]')].map(node=>node.textContent)`),['节点名称','参数名称','参数值']);
            assert.equal(await evaluate(`document.querySelector('.clab-review-xy-records [data-record-node]').textContent==='XYZ参数'&&document.querySelector('.clab-review-xy-records [data-record-parameter]').textContent==='步数'`),true);
            assert.equal(await evaluate(`(()=>{const cell=document.querySelector('.clab-review-xy-records [data-record-value]');return cell.title.includes(cell.textContent)&&getComputedStyle(cell).webkitLineClamp==='2';})()`),true);
            await click('[data-review-xy-record][value="110||text"]');
            const collapsedHeight=await evaluate(`document.querySelector('.clab-review-xy-records').getBoundingClientRect().height`);
            await click('[data-review-xy-records-expanded]');
            assert.equal(await evaluate(`(()=>{const table=document.querySelector('.clab-review-xy-records'),cell=table.querySelectorAll('[data-record-value]')[1];return table.classList.contains('is-expanded')&&table.getBoundingClientRect().height>${collapsedHeight}+40&&getComputedStyle(cell).webkitLineClamp==='none'&&cell.textContent.endsWith('x'.repeat(512))&&cell.scrollWidth<=cell.clientWidth+1;})()`),true,'expanded content is clipped or makes a column grow horizontally');
            for(const origin of ['bottom','top']){
                await click('[data-review-xy-orientation][value='+origin+']');
                assert.equal(await evaluate(`(async()=>{const {getActiveWorkspace}=await import('/extensions/clab/components/ui_state.js');const zoom=getActiveWorkspace().view.xy.zoom,stage=document.querySelector('.clab-review-grid-stage'),table=stage.querySelector('.clab-review-xy-records').getBoundingClientRect(),y=stage.querySelector('[data-xy-bind=y]').getBoundingClientRect(),z=stage.querySelector('.clab-xy-z-binding').getBoundingClientRect();return Math.abs(table.right-z.right)<1&&Math.abs(table.width/zoom-480)<2&&(${JSON.stringify(origin)}==='bottom'?table.top<y.top&&table.bottom<z.top&&Math.abs(z.top-table.bottom-12*zoom)<3:table.bottom>y.bottom&&table.top>z.bottom&&Math.abs(table.top-z.bottom-12*zoom)<3);})()`),true,'tall table did not shift away from Z summary in '+origin);
            }
            await click('.clab-preview-modal-close');await click('#clab-btn-preview');await settle();
            assert.equal(await evaluate(`document.querySelector('[data-review-xy-records-expanded]').checked&&document.querySelector('.clab-review-xy-records').classList.contains('is-expanded')`),true,'expanded-content preference was not restored');
            assert.equal(await evaluate(`(async()=>{const {getActiveWorkspace}=await import('/extensions/clab/components/ui_state.js'),{createWorkspaceView}=await import('/extensions/clab/components/workspace_modes/view_state.js');return createWorkspaceView(JSON.parse(JSON.stringify(getActiveWorkspace().view))).xy.previewRecordsExpanded;})()`),true);
            await click('[data-review-xy-records-expanded]');
            await click('.clab-preview-modal-close');await click('#clab-btn-preview');await settle();
            assert.equal(await evaluate(`document.querySelector('[data-review-xy-records-expanded]').checked`),false,'collapsed-content preference was not restored');

            await click('.clab-preview-modal-close');
        }
    }
    console.log('PASS workspace and preview XY share camera across entry, pan/zoom, Z switches, remount and return, with Ctrl/Shift selection and recorded parameter values');
    return 1;
}
