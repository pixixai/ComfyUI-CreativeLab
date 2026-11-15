import assert from 'node:assert/strict';

export async function runTableUploadChecks(send,sessionId){
    const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true},sessionId);assert.equal(r.exceptionDetails,undefined,JSON.stringify(r.exceptionDetails));return r.result.value;};
    const wait=ms=>evaluate(`new Promise(resolve=>setTimeout(resolve,${ms}))`);
    const until=condition=>evaluate(`new Promise((resolve,reject)=>{const end=performance.now()+3000;const check=()=>{if(${condition})resolve();else if(performance.now()>end)reject(new Error('upload cell did not become ready'));else setTimeout(check,16);};check();})`);
    await evaluate(`(async()=>{
        const ui=await import('/extensions/clab/components/ui_state.js'),{editHistory}=await import('/extensions/clab/components/edit_history_runtime.js'),{setWorkspaceMode}=await import('/extensions/clab/components/workspace_modes/workspace_modes.js');
        ui.syncStateToActiveWorkspace();window.tu={ui,editHistory,setWorkspaceMode,original:ui.getActiveWorkspace(),workspaces:[...ui.state.workspaces],panel:document.querySelector('#clab-panel')};tu.container=tu.panel.querySelector('#clab-cards-container');
        tu.ws=ui.createEmptyWorkspace('首次绑定文件',{view:{mode:'table'}});ui.state.workspaces.push(tu.ws);ui.applyWorkspaceToState(tu.ws);editHistory.withoutRecording(()=>document.dispatchEvent(new Event('clab_render_ui')));
        tu.cell=(row=0,column=0)=>tu.container.querySelectorAll('[data-table-row]')[row].querySelector('[data-table-index="'+column+'"]');
    })()`);await until(`tu.container.querySelector('.clab-table-column[data-table-index="0"]')`);
    try{
        for(const [index,node,widget]of [[0,4,'image'],[1,6,'video'],[2,5,'audio'],[3,7,'model_file']]){
            await evaluate(`tu.container.querySelector('.clab-table-column[data-table-index="${index}"] .clab-module-binding-summary').click()`);
            await evaluate(`document.querySelector('[data-focus-node="${node}"]').click();document.querySelector('input[data-widget="${node}||${widget}"]').click()`);
            await evaluate(`document.querySelector('.clab-module-binding-popover .clab-xy-popup-close').click()`);await wait(45);
        }
        await until(`tu.cell(0,3)?.querySelector('.clab-upload-trigger-btn')`);
        assert.equal(await evaluate(`tu.ws.cards.length===0&&[...tu.container.querySelectorAll('.clab-table-draft-cell')].filter(cell=>cell.getBoundingClientRect().top<tu.container.getBoundingClientRect().bottom&&Number(cell.dataset.tableIndex)<4).every(cell=>['.clab-file-select','.clab-upload-trigger-btn','.clab-upload-clear-btn','.clab-upload-preview-toggle'].every(selector=>cell.querySelector(selector)))`),true,'freshly bound draft cells do not expose the full upload component');
        const layout=await evaluate(`Array.from({length:4},(_,i)=>{const cell=tu.cell(0,i),file=cell.querySelector('.clab-file-select').getBoundingClientRect(),toggle=cell.querySelector('.clab-upload-preview-option').getBoundingClientRect(),upload=cell.querySelector('.clab-upload-trigger-btn').getBoundingClientRect(),clear=cell.querySelector('.clab-upload-clear-btn').getBoundingClientRect();return toggle.bottom<=file.top+1&&Math.abs(toggle.right-file.right)<2&&upload.top>=file.bottom-1&&Math.abs(upload.top-clear.top)<1&&Math.abs((upload.left+clear.right)/2-(file.left+file.right)/2)<2;})`);
        assert.deepEqual(layout,[true,true,true,true]);
        await evaluate(`tu.metrics=()=>['.clab-file-select','.clab-upload-trigger-btn','.clab-upload-clear-btn','.clab-upload-preview-option'].map(selector=>{const node=tu.cell().querySelector(selector),box=node.getBoundingClientRect();return {width:box.width,height:box.height,font:getComputedStyle(node).fontSize};});tu.closedMetrics=tu.metrics();tu.emptyFont=getComputedStyle(tu.cell().querySelector('.clab-upload-filename')).fontSize;tu.emptyPlaceholderFont=getComputedStyle(tu.cell().querySelector('.clab-upload-filename'),'::placeholder').fontSize;`);
        assert.equal(await evaluate(`tu.emptyFont==='12px'&&tu.emptyPlaceholderFont===tu.emptyFont`),true,'empty file captions inherit a larger placeholder font');
        console.log('PASS first GUI binding creates complete upload controls for every visible empty row without materializing tasks; file/toggle/actions use the requested three-row layout');

        await evaluate(`tu.rowId=tu.cell().dataset.cardId;tu.areaId=tu.cell().dataset.areaId;tu.cell().querySelector('.clab-upload-preview-toggle').click()`);await wait(70);
        assert.equal(await evaluate(`tu.ws.cards.length===0&&tu.cell().querySelector('.clab-upload-preview-toggle').checked&&!tu.cell().querySelector('.clab-upload-preview').hidden`),true,'preview toggling created a phantom task or failed on a draft row');
        assert.equal(await evaluate(`tu.metrics().every((value,index)=>Math.abs(value.width-tu.closedMetrics[index].width)<1&&Math.abs(value.height-tu.closedMetrics[index].height)<1&&value.font===tu.closedMetrics[index].font)`),true,'opening preview rescaled the file field, buttons or view toggle');
        assert.equal(await evaluate(`(()=>{const cell=tu.cell(),preview=cell.querySelector('.clab-upload-preview'),box=preview.getBoundingClientRect(),toggle=preview.querySelector('.clab-upload-preview-option').getBoundingClientRect(),file=cell.querySelector('.clab-file-select').getBoundingClientRect();return box.height>0&&box.bottom<=file.top&&toggle.top>=box.top&&toggle.right<=box.right&&toggle.top-box.top<7&&box.right-toggle.right<7;})()`),true,'view toggle is not overlaid inside the media corner');
        await evaluate(`document.dispatchEvent(new Event('clab_render_ui'))`);await wait(70);
        assert.equal(await evaluate(`tu.cell().querySelector('.clab-upload-preview-toggle').checked`),true);
        await evaluate(`(()=>{tu.clicks=0;const input=tu.cell().querySelector('.clab-file-input');input.click=()=>tu.clicks++;tu.cell().querySelector('.clab-upload-trigger-btn').click();const data=new DataTransfer();data.items.add(new File(['fixture'],'fresh.png',{type:'image/png'}));tu.cell().querySelector('.clab-upload-zone').dispatchEvent(new DragEvent('drop',{bubbles:true,cancelable:true,dataTransfer:data}));})()`);
        await until(`tu.ws.cards.some(card=>card.id===tu.rowId&&card.areas.some(area=>area.id===tu.areaId&&String(area.value).startsWith('uploaded')))`);
        assert.equal(await evaluate(`tu.clicks===1&&tu.ws.cards.length===1&&tu.ws.cards[0].areas.find(area=>area.id===tu.areaId).showUploadPreview===true&&!!tu.cell().querySelector('img')`),true,'draft upload did not create exactly one task and preserve the preview setting');
        assert.equal(await evaluate(`getComputedStyle(tu.cell().querySelector('.clab-upload-filename')).fontSize===tu.emptyFont&&tu.metrics().every((value,index)=>Math.abs(value.height-tu.closedMetrics[index].height)<1)`),true,'materializing a selected file changed caption typography or control sizes');
        await evaluate(`tu.cell().querySelector('.clab-upload-clear-btn').click()`);await wait(65);
        assert.equal(await evaluate(`tu.ws.cards.length===1&&tu.ws.cards[0].areas.find(area=>area.id===tu.areaId).value===''&&tu.cell().querySelector('.clab-upload-clear-btn').disabled`),true);
        assert.equal(await evaluate(`!!tu.cell().querySelector('.clab-upload-preview>.clab-upload-preview-option input:checked')`),true,'refreshing media content removed the overlaid view toggle');
        console.log('PASS draft preview changes persist without creating tasks; upload, drag-and-drop and clearing share the existing behavior and preserve settings when the row becomes real');

        await evaluate(`(()=>{const sheet=tu.ws.view.table.sheets[0];tu.ws.view.table.widths=Object.fromEntries(sheet.columns.map(column=>[column.id,64]));sheet.rowHeight=48;document.dispatchEvent(new Event('clab_workspace_view_change'));})()`);await wait(80);
        await evaluate(`for(let i=0;i<4;i++){const toggle=tu.cell(0,i).querySelector('.clab-upload-preview-toggle');if(!toggle.checked)toggle.click();}`);await wait(80);
        const bounds=await evaluate(`Array.from({length:4},(_,i)=>{const cell=tu.cell(0,i),r=cell.getBoundingClientRect();return [...cell.querySelectorAll('.clab-upload-preview,.clab-upload-preview-option,.clab-file-select,.clab-upload-trigger-btn,.clab-upload-clear-btn')].filter(element=>!element.hidden).every(element=>{const b=element.getBoundingClientRect();return b.width>0&&b.height>0&&b.left>=r.left-1&&b.right<=r.right+1&&b.top>=r.top-1&&b.bottom<=r.bottom+1;});})`);
        assert.deepEqual(bounds,[true,true,true,true],JSON.stringify(bounds));
        await evaluate(`tu.setWorkspaceMode(tu.panel,'cards')`);await wait(90);
        assert.equal(await evaluate(`tu.container.querySelector('[data-area-id="'+tu.areaId+'"] .clab-input-header>.clab-upload-preview-option')!==null&&!tu.container.querySelector(':is(.clab-upload-file-row,.clab-upload-preview)>.clab-upload-preview-option')`),true,'table-specific arrangement leaked into card mode');
        console.log('PASS small cells contain every upload control and preview; leaving table mode restores the original card header placement');
    }finally{
        await evaluate(`(()=>{tu.editHistory.withoutRecording(()=>{tu.ui.state.workspaces=tu.workspaces;tu.ui.applyWorkspaceToState(tu.original);document.dispatchEvent(new Event('clab_render_ui'));});})()`);
    }
}
