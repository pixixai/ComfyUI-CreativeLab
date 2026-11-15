import assert from 'node:assert/strict';

export async function runTableFileBatchChecks(send,sessionId){
    const evaluate=async expression=>{const result=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true},sessionId);assert.equal(result.exceptionDetails,undefined,JSON.stringify(result.exceptionDetails));return result.result.value;};
    const wait=()=>evaluate('new Promise(resolve=>setTimeout(resolve,100))');
    const click=async selector=>{
        const point=await evaluate(`(()=>{const node=document.querySelector(${JSON.stringify(selector)});node.scrollIntoView({block:'nearest',inline:'nearest'});const b=node.getBoundingClientRect();return {x:(b.left+b.right)/2,y:(b.top+b.bottom)/2};})()`);
        await send('Input.dispatchMouseEvent',{type:'mousePressed',...point,button:'left',buttons:1,clickCount:1},sessionId);
        await send('Input.dispatchMouseEvent',{type:'mouseReleased',...point,button:'left',buttons:0,clickCount:1},sessionId);
    };
    await evaluate(`(async()=>{
        const ui=await import('/extensions/clab/components/ui_state.js'),{editHistory}=await import('/extensions/clab/components/edit_history_runtime.js');
        ui.syncStateToActiveWorkspace();window.bf={ui,editHistory,original:ui.getActiveWorkspace(),workspaces:[...ui.state.workspaces],fetch:window.fetch};
        const ws=ui.createEmptyWorkspace('批量文件',{view:{mode:'table'}});ui.state.workspaces.push(ws);ui.applyWorkspaceToState(ws);document.dispatchEvent(new Event('clab_render_ui'));
        bf.ws=()=>ui.getActiveWorkspace();bf.sheet=()=>bf.ws().view.table.sheets[0];bf.container=document.querySelector('#clab-cards-container');
        bf.sheet().columns=[['img',4,'image'],['vid',6,'video'],['text',null,''],['img2',4,'image']].map(([id,node,widget])=>({id,tableColumnId:id,type:'edit',...(node?{targetNodeId:String(node),targetWidget:widget,targetWidgets:[node+'||'+widget]}:{})}));
        bf.sheet().rows=Array.from({length:50},(_,index)=>({id:'batch-file-row-'+index,values:{}}));
        document.dispatchEvent(new Event('clab_render_ui'));editHistory.reset();
        bf.cell=(row=0,col=0)=>bf.container.querySelector('[data-table-row="batch-file-row-'+row+'"] [data-table-index="'+col+'"]');
        bf.value=(row,col='img')=>{const entry=bf.sheet().rows[row];return bf.ws().cards.find(card=>card.id===entry.cardId)?.areas.find(area=>area.tableColumnId===col)?.value??entry.values[col]??'';};
        bf.preview=(row)=>{const entry=bf.sheet().rows[row];return bf.ws().cards.find(card=>card.id===entry.cardId)?.areas.find(area=>area.tableColumnId==='img')?.showUploadPreview??entry.uploadPreviews?.img??false;};
        bf.choose=(cells)=>{cells.forEach(([row,col],index)=>{const cell=bf.cell(row,col);cell.dispatchEvent(new MouseEvent('pointerdown',{bubbles:true,button:0,ctrlKey:index>0}));cell.dispatchEvent(new MouseEvent('click',{bubbles:true,ctrlKey:index>0}));});};
        bf.column=()=>{const head=bf.container.querySelector('.clab-table-column[data-table-index="0"]');head.dispatchEvent(new MouseEvent('pointerdown',{bubbles:true,button:0}));head.dispatchEvent(new MouseEvent('click',{bubbles:true}));};
    })()`);await wait();
    const toggle='[data-table-row="batch-file-row-0"] [data-table-index="0"] .clab-upload-preview-toggle';
    const field='[data-table-row="batch-file-row-0"] [data-table-index="0"] .clab-upload-filename';
    const clear='[data-table-row="batch-file-row-0"] [data-table-index="0"] .clab-upload-clear-btn';
    try{
        await evaluate('bf.column()');await click(toggle);await wait();
        assert.equal(await evaluate(`bf.ws().cards.length===0&&bf.sheet().rows.every((row,index)=>bf.preview(index))&&bf.ui.state.selectedAreaIds.length===50`),true,'whole-column preview missed offscreen drafts, created tasks or collapsed selection');
        await evaluate('bf.choose([[1,0]]);bf.cell(1).querySelector(".clab-upload-preview-toggle").click();bf.choose([[0,0],[1,0]])');await wait();
        assert.equal(await evaluate('bf.cell().querySelector(".clab-upload-preview-toggle").indeterminate'),true,'mixed preview does not show a partial check');
        await click(toggle);await wait();
        assert.equal(await evaluate('bf.preview(0)&&bf.preview(1)&&bf.ui.state.selectedAreaIds.length===2'),true,'partial preview click did not enable every selected cell');
        console.log('PASS whole-column preview includes virtual offscreen drafts without creating tasks; mixed checks unify on click and preserve selection');

        await evaluate(`bf.choose([[0,0],[1,0]]);bf.calls=0;window.fetch=(url,options)=>{if(url==='/upload/image'){bf.calls++;return new Promise(resolve=>bf.finishUpload=()=>resolve(new Response(JSON.stringify({name:'batch.png',subfolder:'batch-tests',type:'input'}))));}return bf.fetch(url,options);};bf.cell().querySelector('.clab-file-input').click=()=>{};`);
        await click('[data-table-row="batch-file-row-0"] [data-table-index="0"] .clab-upload-trigger-btn');
        await evaluate(`(()=>{bf.choose([[2,0]]);const input=bf.cell().querySelector('.clab-file-input'),files=new DataTransfer();files.items.add(new File(['fixture'],'batch.png',{type:'image/png'}));input.files=files.files;input.dispatchEvent(new Event('change',{bubbles:true}));})()`);await wait();
        await evaluate('bf.finishUpload()');await wait();
        assert.equal(await evaluate(`bf.calls===1&&bf.value(0)==='batch-tests/batch.png'&&bf.value(1)===bf.value(0)&&bf.value(2)===''&&bf.ws().cards.length===2`),true,'upload did not share one server file or used the selection after opening the file dialog');
        await evaluate(`document.activeElement.blur();document.querySelector('#clab-panel').dispatchEvent(new KeyboardEvent('keydown',{key:'z',code:'KeyZ',ctrlKey:true,bubbles:true}));`);await wait();
        assert.equal(await evaluate(`bf.value(0)===''&&bf.value(1)===''&&bf.ws().cards.length===0`),true,'a single undo did not restore the entire batch');
        await evaluate(`document.querySelector('#clab-panel').dispatchEvent(new KeyboardEvent('keydown',{key:'z',code:'KeyZ',ctrlKey:true,shiftKey:true,bubbles:true}));`);await wait();
        assert.equal(await evaluate(`bf.value(0)==='batch-tests/batch.png'&&bf.value(1)===bf.value(0)`),true);
        console.log('PASS one upload fills the original selected cells, creates only filled tasks and supports one-step undo/redo');

        await evaluate('bf.choose([[0,0],[1,1],[1,2],[1,3]])');await click(field);await wait();
        assert.equal(await evaluate(`document.querySelector('.clab-input-files .clab-binding-panel-head').textContent.includes('应用到 2 个单元格')`),true);
        await evaluate(`document.querySelector('.clab-input-files [data-input-file="other.png"]').click()`);await wait();
        assert.equal(await evaluate(`bf.value(0)==='other.png'&&bf.value(1,'img2')==='other.png'&&bf.value(1,'vid')===''&&bf.value(1,'text')===''&&bf.ui.state.selectedAreaIds.length===4`),true,'mixed types were overwritten or selection collapsed');
        await evaluate('bf.choose([[2,0],[0,0]])');
        assert.equal(await evaluate(`!bf.cell(2).querySelector('.clab-upload-clear-btn').disabled&&bf.cell(2).querySelector('.clab-upload-filename').placeholder==='多个不同文件'`),true,'an empty source cell disabled clearing other selected files or failed to show mixed values');
        await click('[data-table-row="batch-file-row-2"] [data-table-index="0"] .clab-upload-clear-btn');await wait();
        assert.equal(await evaluate(`bf.value(0)===''&&bf.value(2)===''&&bf.value(1)==='batch-tests/batch.png'&&bf.preview(0)&&bf.ui.state.selectedAreaIds.length===2`),true,'clear changed an unselected value, preview preference or selection');
        console.log('PASS file choices skip video/text cells, mixed values stay explicit and clearing from an empty selected cell preserves previews and other cells');

        await evaluate('bf.column()');await click(field);await wait();
        await evaluate(`document.querySelector('.clab-input-files [data-input-file="input.png"]').click()`);await wait();
        assert.equal(await evaluate(`bf.sheet().rows.every((row,index)=>bf.value(index)==='input.png')&&bf.ws().cards.length===50&&bf.ui.state.selectedAreaIds.length===50`),true,'whole-column file selection missed unmounted rows');
        await click(clear);await wait();
        assert.equal(await evaluate(`bf.sheet().rows.every((row,index)=>bf.value(index)==='')&&bf.ui.state.selectedAreaIds.length===50`),true);
        console.log('PASS whole-column choose/clear applies to every row without requiring the component to be mounted');

        await evaluate(`bf.choose([[0,0]]);bf.cell().querySelector('.clab-file-input').click=()=>{};`);
        await click('[data-table-row="batch-file-row-0"] [data-table-index="0"] .clab-upload-trigger-btn');
        await evaluate(`(()=>{const input=bf.cell().querySelector('.clab-file-input'),files=new DataTransfer();files.items.add(new File(['fixture'],'late.png',{type:'image/png'}));input.files=files.files;input.dispatchEvent(new Event('change',{bubbles:true}));bf.previous=bf.ws();bf.ui.applyWorkspaceToState(bf.original);document.dispatchEvent(new Event('clab_render_ui'));bf.finishUpload();})()`);await wait();
        assert.equal(await evaluate(`bf.previous.cards.every(card=>card.areas.filter(area=>area.tableColumnId==='img').every(area=>area.value===''))&&bf.ui.state.activeWorkspaceId===bf.original.id`),true,'a completed upload wrote into a different workspace');
        console.log('PASS switching workspace while an upload is pending cancels its cell update without altering either workspace');
    }finally{
        await evaluate(`bf.editHistory.withoutRecording(()=>{window.fetch=bf.fetch;bf.ui.state.workspaces=bf.workspaces;bf.ui.applyWorkspaceToState(bf.original);document.dispatchEvent(new Event('clab_render_ui'));});bf.editHistory.reset();`);
    }
}
