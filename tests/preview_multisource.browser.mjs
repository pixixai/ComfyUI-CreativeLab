import fs from 'node:fs';
import assert from 'node:assert/strict';

export async function runPreviewMultisourceChecks(send,sessionId){
    const evaluate=async expression=>{const result=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true},sessionId);assert.ok(!result.exceptionDetails,JSON.stringify(result.exceptionDetails));return result.result.value;};
    const wait=()=>evaluate('new Promise(resolve=>setTimeout(resolve,120))');
    const click=async selector=>{assert.equal(await evaluate(`!!document.querySelector(${JSON.stringify(selector)})`),true,selector);await evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);await wait();};
    const screenshot=async name=>{if(!process.env.CLAB_MULTI_SCREENSHOT_PREFIX)return;const result=await send('Page.captureScreenshot',{format:'png'},sessionId);fs.writeFileSync(process.env.CLAB_MULTI_SCREENSHOT_PREFIX+'-'+name+'.png',Buffer.from(result.data,'base64'));};
    const mode=key=>click(`[data-review-mode="${key}"]`);
    await evaluate(`(async()=>{
        const {state,createEmptyWorkspace,applyWorkspaceToState,syncStateToActiveWorkspace,getActiveWorkspace}=await import('/extensions/clab/components/ui_state.js');
        const {createWorkspaceView}=await import('/extensions/clab/components/workspace_modes/view_state.js');
        const {synchronizeMatrix}=await import('/extensions/clab/components/workspace_modes/xy_model.js');
        const {pushPreviewHistoryEntry}=await import('/extensions/clab/components/modules/media_types/media_utils.js');
        const {openWorkspacePreview}=await import('/extensions/clab/components/contextmenu/group_content.js');
        syncStateToActiveWorkspace();window.multisourceBackup={workspaces:[...state.workspaces],active:getActiveWorkspace()};
        const make=()=>{const ws=createEmptyWorkspace('来源甲',{id:'multi-a',view:createWorkspaceView({mode:'cards',xy:{initialized:true,x:{bindings:['110||steps'],values:[25,20,15]},y:{bindings:['110||sampler'],values:['Euler']},z:{enabled:true,bindings:['110||cfg'],values:[5,7]},outputNodeId:'111'}})});synchronizeMatrix(ws.cards,ws.view.xy,[]);for(const card of ws.cards)for(let i=0;i<2;i++)pushPreviewHistoryEntry(card.areas[0],'/view?filename=multi-'+i+'.png');return ws;};
        const a=make(),b=structuredClone(a);b.id='multi-b';b.name='来源乙';state.workspaces=[a,b];applyWorkspaceToState(a);document.dispatchEvent(new Event('clab_render_ui'));window.multiDemo={a,b};openWorkspacePreview();document.querySelector('[data-review-mode=xy]').click();
    })()`);await wait();
    try{
        await click('[data-preview-add-sources]');
        await evaluate(`const check=document.querySelector('.clab-preview-source-picker input[value="multi-b"]');check.checked=true;check.dispatchEvent(new Event('change',{bubbles:true}));document.querySelector('.clab-preview-source-picker').hidePopover();`);await wait();
        assert.equal(await evaluate(`document.querySelectorAll('.clab-review-matrix-group').length===2&&document.querySelectorAll('[data-review-workspaces] .is-preview-source').length===2`),true);
        await mode('browse');
        assert.equal(await evaluate(`document.querySelectorAll('.clab-preview-modal-left .clab-preview-source-workspace').length===2&&new Set([...document.querySelectorAll('[data-browse-card]')].map(element=>element.dataset.browseCard)).size===12`),true,'browse merged duplicated task IDs');
        await click('.clab-preview-modal-left .clab-preview-source-workspace:last-child .clab-filmstrip-thumb');
        assert.equal(await evaluate(`!!document.querySelector('.clab-preview-modal-main-image')`),true);
        await mode('compare');
        await click('.clab-preview-modal-left .clab-preview-source-workspace:first-child .clab-filmstrip-thumb');await click('.clab-preview-modal-left .clab-preview-source-workspace:last-child .clab-filmstrip-thumb');
        assert.equal(await evaluate(`document.querySelectorAll('.clab-compare-slot img').length===2||document.querySelectorAll('.clab-preview-modal-center img').length===2`),true,'cross-workspace A/B failed');
        await mode('detail');
        assert.equal(await evaluate(`document.querySelectorAll('.clab-detail-workspace-title').length===2&&document.querySelectorAll('.clab-detail-card').length===12`),true);
        await mode('table');
        assert.equal(await evaluate(`document.querySelectorAll('.clab-review-table-group').length===2&&document.querySelector('.clab-preview-modal-right .clab-multi-settings:not([hidden]) [data-table-size=width]')!==null`),true,'table groups or settings missing');
        assert.equal(await evaluate(`(()=>{const section=document.querySelector('.clab-preview-source-columns'),rows=section.querySelectorAll('section');return rows.length===2&&rows[0].getBoundingClientRect().top===rows[1].getBoundingClientRect().top&&rows[0].getBoundingClientRect().right<=rows[1].getBoundingClientRect().left;})()`),true,'task/field filters are not side by side');
        await evaluate(`(()=>{const input=document.querySelector('.clab-multi-settings:not([hidden]) [data-table-size=width]');input.value=210;input.dispatchEvent(new Event('change',{bubbles:true}));})()`);await wait();
        assert.equal(await evaluate(`multiDemo.a.view.table.sheets[0]?.columnWidth===210&&multiDemo.b.view.table.sheets[0]?.columnWidth===210`),true,'unselected table settings did not affect all groups');
        await click('.clab-review-table-group:last-child>.clab-review-workspace-title');
        await evaluate(`(()=>{const input=document.querySelector('.clab-multi-settings:not([hidden]) [data-table-size=width]');input.value=230;input.dispatchEvent(new Event('change',{bubbles:true}));})()`);await wait();
        assert.equal(await evaluate(`multiDemo.a.view.table.sheets[0]?.columnWidth===210&&multiDemo.b.view.table.sheets[0]?.columnWidth===230`),true,'selected table settings leaked into another workspace');
        await screenshot('table');
        await evaluate(`window.multiDownload=[];window.multiOriginalURL=URL.createObjectURL;URL.createObjectURL=blob=>{multiDownload.push(blob);return multiOriginalURL(blob);};document.querySelector('.clab-multi-settings:not([hidden]) [data-review-export=xlsx]').click();`);
        for(let n=0;n<30;n++){if(await evaluate(`document.querySelector('.clab-review-notice').textContent!=='正在整理资源并导出…'`))break;await wait();}
        const workbook=await evaluate(`(async()=>{URL.createObjectURL=multiOriginalURL;const blob=multiDownload.find(blob=>blob.type.includes('spreadsheetml'));if(!blob)return document.querySelector('.clab-review-notice').textContent;const sheet=await blob.text();return sheet.includes('mergeCells')&&sheet.includes('来源甲')&&sheet.includes('来源乙');})()`);
        assert.equal(workbook,true,'Excel did not include both workspace partitions and merged headings');
        const layout=await evaluate(`(async()=>{const {capturePreviewLayout}=await import('/extensions/clab/components/contextmenu/content/preview_layout_export.js');const source=document.querySelector('.clab-review-multi-grid'),layout=await capturePreviewLayout(source);return {groups:layout.outer.querySelectorAll('.clab-review-table-group').length,width:layout.width,content:source.firstElementChild.scrollWidth};})()`);
        assert.equal(layout.groups,2);assert.ok(Math.abs(layout.width-layout.content)<2,'PNG omitted workspace columns');
        await mode('xy');
        await click('.clab-review-matrix-group:last-child>.clab-review-workspace-title');
        await click('.clab-multi-settings:not([hidden]) [data-review-xy-tiles]');
        assert.equal(await evaluate(`document.querySelectorAll('.clab-review-matrix-group:last-child .clab-multi-z-summary').length===1&&multiDemo.b.view.xy.z.display==='all'&&multiDemo.a.view.xy.z.display==='single'`),true,'grouped tiling or public Z summary failed');
        await screenshot('xy');
        const matrixExport=await evaluate(`(async()=>{const {capturePreviewLayout,renderLayoutPNG}=await import('/extensions/clab/components/contextmenu/content/preview_layout_export.js');const source=document.querySelector('.clab-review-multi-grid'),layout=await capturePreviewLayout(source);return {groups:layout.outer.querySelectorAll('.clab-review-matrix-group').length,size:(await renderLayoutPNG(layout,1)).size};})()`);
        assert.equal(matrixExport.groups,2);assert.ok(matrixExport.size>1000,'matrix PNG missing grouped media');
        await click('.clab-preview-modal-close');
        await evaluate(`(()=>{const ws=multiDemo.a;ws.view.xy.x.values=[25,15];document.dispatchEvent(new Event('clab_render_ui'));})()`);await wait();
        // Re-entering the matrix reconciles old saved tasks as well as new edits.
        await evaluate(`(async()=>{const {setWorkspaceMode}=await import('/extensions/clab/components/workspace_modes/workspace_modes.js');const panel=document.querySelector('#clab-panel');setWorkspaceMode(panel,'cards');setWorkspaceMode(panel,'xy');})()`);await wait();
        assert.equal(await evaluate(`multiDemo.a.archivedTasks.length===2&&multiDemo.a.cards.length===4`),true,'removed combinations remained active');
        await click('#clab-config-dropdown-trigger');
        assert.equal(await evaluate(`!!document.querySelector('.clab-maintenance-panel:popover-open #clab-maint-clean-dead')&&!!document.querySelector('.clab-maintenance-panel:popover-open #clab-maint-resync')&&document.querySelectorAll('.clab-maint-list label').length===2&&!document.querySelector('#clab-config-dropdown-trigger').classList.contains('clab-tool-menu-button')`),true,'maintenance panel not unified or still shows triangle');
        await screenshot('maintenance');
        await click('[data-maint-all]');await click('[data-maint-restore]');
        assert.equal(await evaluate(`multiDemo.a.archivedTasks.length===0&&multiDemo.a.cards.length===6&&!!document.querySelector('.clab-maintenance-panel:popover-open')`),true,'archive restore lost tasks or closed panel');
        await click('[data-maint-close]');
        console.log('PASS multi-workspace browse/compare/detail, namespaced selections, combined table filters/settings/export, tiled matrix headings, and unified archive maintenance');
    }finally{
        await evaluate(`(async()=>{document.querySelector('.clab-preview-modal.visible .clab-preview-modal-close')?.click();const {state,applyWorkspaceToState}=await import('/extensions/clab/components/ui_state.js');state.workspaces=multisourceBackup.workspaces;applyWorkspaceToState(multisourceBackup.active);document.dispatchEvent(new Event('clab_render_ui'));})()`);
    }
}
