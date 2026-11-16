import assert from 'node:assert/strict';

export async function runExternalOutputChecks(send,sessionId){
    const evaluate=async expression=>{const result=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true},sessionId);assert.equal(result.exceptionDetails,undefined,JSON.stringify(result.exceptionDetails));return result.result.value;};
    const wait=()=>evaluate('new Promise(resolve=>setTimeout(resolve,100))');
    const click=async(selector,modifiers={})=>{await evaluate(`document.querySelector(${JSON.stringify(selector)}).dispatchEvent(new MouseEvent('click',{bubbles:true,...${JSON.stringify(modifiers)}}))`);await wait();};
    await evaluate(`(async()=>{
        const ui=await import('/extensions/clab/components/ui_state.js'),{openWorkspacePreview:open}=await import('/extensions/clab/components/contextmenu/group_content.js'),{addExternalMedia}=await import('/extensions/clab/components/contextmenu/content/preview_external_records.js'),{editHistory}=await import('/extensions/clab/components/edit_history_runtime.js');
        ui.syncStateToActiveWorkspace();window.io={ui,open,original:ui.getActiveWorkspace(),workspaces:[...ui.state.workspaces],fetch:window.fetch,confirm:window.confirm,uploads:0};
        io.ws=ui.createEmptyWorkspace('导入输出测试',{cards:[1,2].map(n=>({id:'io-task-'+n,title:'任务 '+n,areas:[{id:'io-out-'+n,type:'preview',title:'输出',targetNodeId:'3',history:['/view?filename=first.png','/view?filename=second.png'],historyIndex:0,resultUrl:'/view?filename=first.png'},{id:'io-x-'+n,type:'edit',title:'X',value:n,targetNodeId:'1',targetWidget:'steps',targetWidgets:['1||steps']},{id:'io-y-'+n,type:'edit',title:'Y',value:1,targetNodeId:'1',targetWidget:'cfg',targetWidgets:['1||cfg']}]}))});
        addExternalMedia(io.ws,['refs/input.png']);ui.state.workspaces.push(io.ws);ui.applyWorkspaceToState(io.ws);document.dispatchEvent(new Event('clab_render_ui'));open();editHistory.reset();
        io.root=()=>document.querySelector('.clab-preview-modal.visible');io.area=n=>io.ws.cards[n-1].areas[0];
        io.drop=selector=>{const data=new DataTransfer(),key=io.root().querySelector('[data-external-key]').dataset.externalKey;data.setData('application/x-clab-external-images',JSON.stringify([key]));document.querySelector(selector).dispatchEvent(new DragEvent('drop',{bubbles:true,cancelable:true,dataTransfer:data}));};
        io.key=shift=>{document.activeElement?.blur();io.root().dispatchEvent(new KeyboardEvent('keydown',{bubbles:true,key:'z',code:'KeyZ',ctrlKey:true,shiftKey:shift}));};
        window.fetch=(url,options)=>url==='/upload/image'?Promise.resolve(new Response(JSON.stringify({name:'io-'+(++io.uploads)+'.png',subfolder:'clab_references',type:'input'}))):io.fetch.call(window,url,options);
    })()`);await wait();
    try{
        await click('[data-review-mode=detail]');
        await evaluate(`io.drop('[data-detail-card="io-task-1"] .clab-detail-media')`);await wait();
        assert.equal(await evaluate(`io.area(1).history.length===3&&io.area(1).historyIndex===2&&io.area(1).resultUrl.includes('input.png')&&io.ws.cards[0].areas[1].value===1&&io.root().querySelector('[data-detail-card="io-task-1"] img')?.src.includes('input.png')`),true,'detail import did not append, select or render the external output');
        assert.equal(await evaluate(`!!io.root().querySelector('[data-detail-card="io-task-1"] [data-detail-pool="output"] .clab-external-import-icon')`),true,'detail content entry did not mark its imported record');
        await evaluate('io.key(false)');await wait();assert.equal(await evaluate('io.area(1).history.length===2'),true,'detail import was not one undoable step');
        await evaluate('io.key(true)');await wait();assert.equal(await evaluate('io.area(1).history.length===3'),true,'detail import redo lost its record');
        await evaluate(`(()=>{const el=io.root().querySelector('[data-detail-card="io-task-1"] .clab-detail-media');el.dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true,clientX:400,clientY:250}));const button=document.querySelector('[data-external-cover]');if(!button)throw new Error('missing cover action: '+io.root().dataset.reviewMode+' '+document.querySelector('.clab-external-menu').innerHTML);button.click();})()`);await wait();
        assert.equal(await evaluate(`io.ws.view.previewDetail.covers.length===1`),true,'imported detail content could not be used as a cover');
        assert.equal(await evaluate(`!!io.root().querySelector('[data-detail-card="io-task-1"] [data-detail-pool="cover"] .clab-external-import-icon')`),true,'independent imported cover did not show its marker');
        console.log('PASS detail imports append persistent external records, retain inputs, undo/redo and support independent covers');

        await click('[data-review-mode=browse]');await click('.clab-preview-modal.visible [data-external-key]');
        assert.equal(await evaluate(`!!io.root().querySelector('.clab-browse-import-note .clab-external-import-icon')`),true,'browse did not mark its standalone external reference');
        await click('[data-review-mode=compare]');await click('.clab-preview-modal.visible [data-external-key]');
        assert.equal(await evaluate(`!!io.root().querySelector('.clab-compare-heading .clab-external-import-icon')`),true,'comparison heading did not mark its external reference');

        await click('[data-review-mode=table]');
        await click('[data-review-cell="io-out-1"]');await click('[data-review-cell="io-out-2"]',{ctrlKey:true});
        await evaluate(`(()=>{document.activeElement.blur();const data=new DataTransfer();data.items.add(new File(['image'],'paste.png',{type:'image/png'}));io.root().dispatchEvent(new ClipboardEvent('paste',{bubbles:true,cancelable:true,clipboardData:data}));})()`);await wait();
        assert.equal(await evaluate(`io.uploads===1&&io.area(1).history.length===4&&io.area(2).history.length===3&&io.area(1).resultUrl===io.area(2).resultUrl&&io.root().querySelector('[data-review-cell="io-out-2"] img')?.src.includes('io-1.png')`),true,'selected output cells did not share one upload');
        assert.equal(await evaluate(`!!io.root().querySelector('[data-review-cell="io-out-2"] .clab-external-import-icon')`),true,'preview table did not mark its imported media');
        await evaluate('io.key(false)');await wait();assert.equal(await evaluate('io.area(1).history.length===3&&io.area(2).history.length===2'),true,'batch import did not undo once');
        await evaluate('io.key(true)');await wait();assert.equal(await evaluate('io.area(1).history.length===4&&io.area(2).history.length===3'),true);
        await evaluate(`io.tableMedia=io.root().querySelector('[data-review-cell="io-out-2"] img');io.root().querySelector('[data-review-cell="io-out-1"]').dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true,clientX:400,clientY:250}));document.querySelector('[data-external-server]').click();`);await wait();
        await evaluate(`document.querySelector('.clab-external-picker [data-input-file="input.png"] input').click();document.querySelector('.clab-external-picker [data-external-confirm]').click();`);await wait();
        assert.equal(await evaluate(`io.area(1).history.length===5&&io.area(2).history.length===3&&io.root().querySelector('[data-review-cell="io-out-2"] img')===io.tableMedia&&io.uploads===1`),true,'server import rebuilt unrelated table media or uploaded an existing file');
        await evaluate('io.key(false)');await wait();assert.equal(await evaluate('io.area(1).history.length===4&&io.area(2).history.length===3'),true);
        await click('[data-review-cell="io-out-1"]');await click('[data-review-cell="io-out-2"]',{ctrlKey:true});
        await evaluate(`io.root().querySelector('[data-external-key]').dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true,clientX:160,clientY:600}));document.querySelector('[data-external-apply]').click();`);await wait();
        assert.equal(await evaluate('io.area(1).history.length===5&&io.area(2).history.length===4&&io.uploads===1'),true,'source menu did not apply one existing image to selected outputs');
        await evaluate('io.key(false)');await wait();assert.equal(await evaluate('io.area(1).history.length===4&&io.area(2).history.length===3'),true);
        await click('[data-review-cell="io-out-1"]');
        await evaluate(`const cell=io.root().querySelector('[data-review-cell="io-out-1"]');for(const key of ['ArrowLeft','ArrowRight'])cell.dispatchEvent(new KeyboardEvent('keydown',{bubbles:true,key}));`);await wait();
        assert.equal(await evaluate('io.area(1).historyIndex===3&&io.area(1).resultUrl.includes("io-1.png")'),true,'preview history navigation did not sync the workspace selection');
        await click('.clab-preview-modal.visible .clab-preview-modal-close');
        assert.equal(await evaluate(`io.area(1).resultUrl.includes('io-1.png')&&io.ui.buildPersistedState().workspaces.find(ws=>ws.id===io.ws.id).cards[0].areas[0].externalImports.length===2`),true,'workspace/persisted outputs did not retain the imported record: '+JSON.stringify(await evaluate('({url:io.area(1).resultUrl,imports:io.area(1).externalImports,persisted:io.ui.buildPersistedState().workspaces.find(ws=>ws.id===io.ws.id).cards[0].areas[0].externalImports})')));
        console.log('PASS parameter table multi-selection uploads once, shares its path, preserves records across workspace return and undoes as one step');

        await evaluate(`(()=>{const xy=io.ws.view.xy;io.ws.view.mode='xy';xy.x.bindings=['1||steps'];xy.x.values=[1,2];xy.y.bindings=['1||cfg'];xy.y.values=[1];xy.outputNodeId='3';xy.taskIds=io.ws.cards.map(card=>card.id);io.ws.cards.forEach(card=>card.xyOutputId=card.areas[0].id);document.dispatchEvent(new Event('clab_render_ui'));io.open();})()`);await wait();
        assert.equal(await evaluate(`io.root().dataset.reviewMode==='xy'&&!!io.root().querySelector('.clab-card[data-card-id="io-task-2"]')`),true,'XY import fixture was not visible');
        await evaluate(`io.drop('.clab-preview-modal.visible .clab-card[data-card-id="io-task-2"]')`);await wait();
        assert.equal(await evaluate(`io.area(2).history.length===4&&io.area(2).resultUrl.includes('input.png')&&io.ws.view.xy.x.values.join(',')==='1,2'`),true,'XY drop did not preserve coordinates and append the external output');
        assert.equal(await evaluate(`!!io.root().querySelector('.clab-card[data-card-id="io-task-2"] > .clab-xy-history .clab-external-import-icon')`),true,'preview XY did not mark its imported media');
        // Cleanup only the selected asset in this workspace; cancel must be inert.
        await evaluate(`io.context=()=>{io.root().querySelector('[data-external-key]').dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true,clientX:150,clientY:600}));};window.confirm=()=>false;io.context();document.querySelector('[data-external-purge]').click();`);await wait();
        assert.equal(await evaluate('io.area(1).history.length===4&&io.area(2).history.length===4'),true);
        await evaluate(`window.confirm=message=>(io.confirmText=message,true);io.context();document.querySelector('[data-external-purge]').click();`);await wait();
        assert.equal(await evaluate(`io.area(1).history.length===3&&io.area(2).history.length===3&&io.confirmText.includes('2 条')&&io.ws.view.previewDetail.covers.length===0&&io.ws.view.previewExternal.images.length===1`),true,'confirmed cleanup did not remove the matching imports and cover');
        await evaluate('io.key(false)');await wait();assert.equal(await evaluate('io.area(1).history.length===4&&io.area(2).history.length===4&&io.ws.view.previewDetail.covers.length===1&&io.ws.view.previewExternal.images.length===2'),true,'cleanup did not undo all records and references together');
        console.log('PASS XY drops retain axis values; scoped cleanup confirms counts, respects cancel, clears covers and restores all references in one undo');
        await click('.clab-preview-modal.visible .clab-preview-modal-close');
        await evaluate(`(()=>{io.other=structuredClone(io.ws);io.other.id='io-other';io.other.name='相同任务编号的副本';io.ui.state.workspaces.push(io.other);io.open();})()`);await wait();
        await click('[data-preview-add-sources]');
        await evaluate(`(()=>{const input=document.querySelector('.clab-preview-source-picker input[value="io-other"]');input.checked=true;input.dispatchEvent(new Event('change',{bubbles:true}));document.querySelector('.clab-preview-source-picker').hidePopover();})()`);await wait();
        await evaluate(`(()=>{const target=io.root().querySelector('[data-preview-grid-workspace="io-other"] .clab-card'),thumb=io.root().querySelector('[data-external-workspace="'+io.ws.id+'"] [data-external-key]'),data=new DataTransfer();data.setData('application/x-clab-external-images',JSON.stringify([thumb.dataset.externalKey]));io.oldOther=io.other.cards[0].areas[0].history.length;io.oldOriginal=io.area(1).history.length;target.dispatchEvent(new DragEvent('drop',{bubbles:true,cancelable:true,dataTransfer:data}));})()`);await wait();
        assert.equal(await evaluate(`io.other.cards[0].areas[0].history.length===io.oldOther+1&&io.area(1).history.length===io.oldOriginal&&io.root().dataset.editWorkspaceId==='io-other'`),true,'combined preview wrote to the wrong workspace or failed to focus its undo history');
        await evaluate('io.key(false)');await wait();assert.equal(await evaluate('io.other.cards[0].areas[0].history.length===io.oldOther&&io.area(1).history.length===io.oldOriginal'),true,'combined import undo affected the original workspace');
        console.log('PASS combined previews map duplicate task IDs to the correct workspace and isolate import undo');
        await evaluate(`(()=>{const thumb=io.root().querySelector('[data-external-key]');thumb.dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true,clientX:150,clientY:600}));document.querySelector('[data-external-remove]').click();})()`);await wait();
        assert.equal(await evaluate('io.area(1).history.length===io.oldOriginal&&io.other.cards[0].areas[0].history.length===io.oldOther'),true,'ordinary reference removal also deleted output records');
        assert.deepEqual(await evaluate('window.testProgress.errors'),[]);
    }finally{
        await evaluate(`document.querySelector('.clab-preview-modal.visible .clab-preview-modal-close')?.click();window.fetch=io.fetch;window.confirm=io.confirm;io.ui.state.workspaces=io.workspaces;io.ui.applyWorkspaceToState(io.original);document.dispatchEvent(new Event('clab_render_ui'));`);
    }
}
