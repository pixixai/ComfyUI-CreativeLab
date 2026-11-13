import assert from 'node:assert/strict';
import fs from 'node:fs';

export async function runPreviewScopeChecks(send,sessionId){
    const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true},sessionId);assert.ok(!r.exceptionDetails,JSON.stringify(r.exceptionDetails));return r.result.value;};
    const settle=()=>evaluate('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
    const click=async selector=>{await evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);await settle();};
    const input=async(selector,value)=>{await evaluate(`(()=>{const input=document.querySelector(${JSON.stringify(selector)});input.value=${JSON.stringify(String(value))};input.dispatchEvent(new Event('change',{bubbles:true}));})()`);await settle();};
    const root='.clab-preview-modal.visible',right=`${root} .clab-preview-modal-right`,group=index=>`.clab-review-matrix-group:nth-child(${index+1})`;
    const check=async(expression,message)=>assert.equal(await evaluate(expression),true,message);
    await evaluate(`(async()=>{
        const {state,getActiveWorkspace,syncStateToActiveWorkspace,createEmptyWorkspace,applyWorkspaceToState}=await import('/extensions/clab/components/ui_state.js');
        const {createWorkspaceView}=await import('/extensions/clab/components/workspace_modes/view_state.js');
        const {synchronizeMatrix}=await import('/extensions/clab/components/workspace_modes/xy_model.js');
        const {pushPreviewHistoryEntry}=await import('/extensions/clab/components/modules/media_types/media_utils.js');
        const {openWorkspacePreview}=await import('/extensions/clab/components/contextmenu/group_content.js');
        syncStateToActiveWorkspace();window.scopeBackup={active:getActiveWorkspace(),workspaces:[...state.workspaces]};
        const make=(id,name)=>{const workspace=createEmptyWorkspace(name,{id,view:createWorkspaceView({mode:'cards',xy:{initialized:true,x:{bindings:['110||steps'],values:[20,30]},y:{bindings:['110||sampler'],values:['Euler','DPM']},z:{enabled:true,bindings:['110||cfg'],values:[5,7,9]},records:[{id:'r',key:'110||steps'}],outputNodeId:'111'}})});synchronizeMatrix(workspace.cards,workspace.view.xy,[]);for(const card of workspace.cards){const area=card.areas[0];pushPreviewHistoryEntry(area,'/view?filename=scope.png',{run:{id:'run',recordParameters:[{key:'110||steps',value:20,label:'节点 · 步数'}]}});}return workspace;};
        const a=make('scope-a','工作区甲'),b=make('scope-b','工作区乙'),c=make('scope-c','工作区丙');b.view.xy.z.display=c.view.xy.z.display='all';state.workspaces=[a,b,c];applyWorkspaceToState(a);document.dispatchEvent(new Event('clab_render_ui'));window.scopeDemo={a,b,c};openWorkspacePreview();document.querySelector('[data-review-mode=xy]').click();
    })()`);await settle();
    try{
        await click(`${root} [data-review-xy-record]`);
        await click(`${right} [data-review-xy-tiles]`);
        await check(`document.querySelectorAll('${root} .clab-xy-layer-title[aria-pressed=true]').length===0`,'initial active Z layer was mistaken for a selection');
        const recordBefore=await evaluate(`document.querySelector('${root} .clab-review-xy-records').xyPosition.y`);
        await click(`${root} .clab-xy-layer-title[data-xy-z-layer="1"]`);
        await check(`document.querySelector('${right} [data-review-xy-tiles]').checked&&document.querySelectorAll('${root} .clab-xy-layer-title[aria-pressed=true]').length===1`,'title selection left tiled mode');
        await click(`${root} .clab-review-grid-stage .clab-card[data-xy-layer="2"]`);
        await check(`document.querySelector('${root} .clab-xy-layer-title[aria-pressed=true]').dataset.xyZLayer==='2'&&!document.querySelector('${root} .clab-review-xy-current').hidden`,'cell did not select its matrix and show current-cell information');
        await click(`${root} .clab-review-grid-stage`);
        await check(`document.querySelectorAll('${root} .clab-xy-layer-title[aria-pressed=true]').length===0&&document.querySelector('${root} .clab-review-xy-current').hidden`,'blank click did not clear layer/cell selection');
        for(const id of ['scope-b','scope-c']){
            await evaluate(`document.querySelector('[data-review-workspaces] [data-workspace-id="${id}"] .clab-workspace-tab-select').dispatchEvent(new MouseEvent('click',{bubbles:true,ctrlKey:true}));`);await settle();
        }
        await check(`document.querySelectorAll('.clab-review-matrix-group').length===3&&document.querySelectorAll('[data-review-workspaces] .clab-workspace-highlight path').length===1`,'adjacent source highlights did not join');
        const after=await evaluate(`document.querySelector('.clab-review-matrix-group .clab-review-xy-records').xyPosition.y`);assert.ok(Math.abs(after-recordBefore)<2,`record table moved when adding workspaces: ${recordBefore} → ${after}`);
        await check(`document.querySelectorAll('${root} .clab-review-xy-current').length===1&&document.querySelector('${root} .clab-preview-modal-left').firstElementChild.classList.contains('clab-review-xy-current')`,'current-cell information is duplicated or not at the top');
        await check(`getComputedStyle(document.querySelector('.clab-review-matrix-groups')).backgroundImage.includes('radial-gradient')&&getComputedStyle(document.querySelector('.clab-review-matrix-group')).backgroundColor==='rgb(29, 29, 29)'`,'grouped matrix backgrounds lost their dotted outer canvas');
        await check(`(()=>{const summary=document.querySelector('${root} .clab-preview-source-workspace>summary'),h3=document.querySelector('${root} .clab-preview-source-workspace h3');return getComputedStyle(summary).fontSize==='14px'&&getComputedStyle(h3).fontSize==='12px';})()`,'XY source title hierarchy is incorrect');
        const widths=()=>evaluate(`Array.from(document.querySelectorAll('.clab-review-matrix-group'),group=>[0,1,2].map(z=>{const xs=[...new Set([...group.querySelectorAll('.clab-card[data-xy-layer="'+z+'"]')].map(card=>parseFloat(card.style.left)))].sort((a,b)=>a-b);return Math.round(xs[1]-xs[0]);}))`);
        await input(`${right} .clab-multi-settings:not([hidden]) [data-review-xy-spacing=gap]`,13);
        assert.deepEqual(await widths(),[[333,333,333],[333,333,333],[333,333,333]],'no-selection changes did not affect all workspaces/layers');
        await click(`${group(2)} .clab-xy-layer-title[data-xy-z-layer="1"]`);
        await input(`${right} .clab-multi-settings:not([hidden]) [data-review-xy-spacing=gap]`,21);
        assert.deepEqual(await widths(),[[333,333,333],[333,333,333],[333,341,333]],'selected layer changes escaped their matrix');
        await click(`${group(2)}>.clab-review-workspace-title`);
        await check(`document.querySelectorAll('${group(2)} .clab-xy-layer-title[aria-pressed=true]').length===3&&document.querySelectorAll('.clab-review-matrix-group:not(:last-child) .clab-xy-layer-title[aria-pressed=true]').length===0`,'workspace title did not select exactly its own matrices');
        await click(`${root} .clab-review-multi-grid`);
        await input(`${right} .clab-multi-settings:not([hidden]) [data-review-xy-spacing=gap]`,5);
        assert.deepEqual(await widths(),[[325,325,325],[325,325,325],[325,325,325]],'clearing selection did not restore all-source scope');
        const sizes=()=>evaluate(`(()=>{const group=document.querySelector('.clab-review-matrix-group'),zoom=new DOMMatrixReadOnly(group.querySelector('.clab-cards-wrapper').style.transform).a;return {zoom,title:parseFloat(group.firstElementChild.style.fontSize),badge:parseFloat(getComputedStyle(group.querySelector('.clab-multi-z-summary .clab-xy-binding')).fontSize)};})()`);
        const before=await sizes(),point=await evaluate(`(()=>{const r=document.querySelector('${root} .clab-review-multi-grid').getBoundingClientRect();return{x:r.left+20,y:r.top+20};})()`);
        await send('Input.dispatchMouseEvent',{type:'mouseWheel',...point,deltaX:0,deltaY:-120},sessionId);await settle();const zoomed=await sizes();assert.ok(zoomed.zoom>before.zoom&&Math.abs(zoomed.title/before.title-zoomed.zoom/before.zoom)<.01&&Math.abs(zoomed.badge/before.badge-zoomed.zoom/before.zoom)<.01,'workspace/Z headings did not scale with the canvas: '+JSON.stringify({before,zoomed}));
        await evaluate(`document.querySelector('[data-review-workspaces] [data-workspace-id="scope-b"] .clab-workspace-tab-select').dispatchEvent(new MouseEvent('click',{bubbles:true,ctrlKey:true}));`);await settle();
        await check(`document.querySelectorAll('[data-review-workspaces] .clab-workspace-highlight path').length===2&&[...document.querySelectorAll('[data-review-workspaces] .clab-workspace-highlight path')].every(path=>path.getAttribute('stroke-width')==='1')`,'disjoint source highlights are not separate thin rainbow frames');
        await click(`${root} [data-review-mode=table]`);
        await click('.clab-review-table-group>.clab-review-workspace-title');
        await check(`(()=>{const group=document.querySelector('.clab-review-table-group'),cells=[...group.querySelectorAll('[data-review-cell]')],header=group.firstElementChild;return cells.length>0&&cells.every(cell=>cell.classList.contains('active'))&&group.querySelector('[data-review-select-all]').getAttribute('aria-pressed')==='true'&&Math.abs(header.getBoundingClientRect().width-[...group.querySelector('.clab-table-head').children].reduce((sum,col)=>sum+col.getBoundingClientRect().width,0))<1;})()`,'workspace table header does not match/select its complete table');
        await input(`${right} .clab-multi-settings:not([hidden]) [data-table-size=width]`,220);
        await check(`(()=>{const g=document.querySelector('.clab-review-table-group');return Math.abs(g.firstElementChild.getBoundingClientRect().width-g.querySelector('.clab-table-head').getBoundingClientRect().width)<1;})()`,'table title width lagged behind track resizing');
        for(const mode of ['detail','browse','compare']){
            await click(`${root} [data-review-mode=${mode}]`);
            await evaluate(`(()=>{const ws=document.querySelector('${root} .clab-preview-source-workspace');if(!ws.open)ws.querySelector('summary').click();})()`);await settle();
            await check(`(()=>{const ws=document.querySelector('${root} .clab-preview-source-workspace'),task=ws.querySelector('[data-detail-source],[data-browse-card]');return ws.open&&!!ws.querySelector(':scope>summary .clab-source-workspace-fold')&&getComputedStyle(ws.lastElementChild).borderLeftStyle==='dashed'&&getComputedStyle(task,'::before').borderLeftStyle==='dashed';})()`,`${mode} workspace/task fold guides are missing`);
            await click(`${root} .clab-preview-source-workspace>summary`);await check(`!document.querySelector('${root} .clab-preview-source-workspace').open`,`${mode} workspace did not collapse`);
        }
        if(process.env.CLAB_SCOPE_SCREENSHOT){const r=await send('Page.captureScreenshot',{format:'png'},sessionId);fs.writeFileSync(process.env.CLAB_SCOPE_SCREENSHOT,Buffer.from(r.data,'base64'));}
        console.log('PASS preview selection scopes, layer settings, shared cell info, scalable headings, stable records, table header sizing/selection, rainbow frames and nested source guides');
    }finally{
        await evaluate(`(async()=>{document.querySelector('${root} .clab-preview-modal-close')?.click();const {state,applyWorkspaceToState}=await import('/extensions/clab/components/ui_state.js');state.workspaces=scopeBackup.workspaces;applyWorkspaceToState(scopeBackup.active);document.dispatchEvent(new Event('clab_render_ui'));})()`);
    }
}
