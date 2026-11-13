import assert from 'node:assert/strict';

export async function runEditHistoryChecks(send,sessionId) {
    const evaluate=async expression=>{
        const result=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true},sessionId);
        assert.equal(result.exceptionDetails,undefined,JSON.stringify(result.exceptionDetails));return result.result.value;
    };
    const wait=()=>evaluate('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
    const undo=async(redo=false)=>{
        await evaluate('document.activeElement?.blur();');
        for(const type of ['keyDown','keyUp'])await send('Input.dispatchKeyEvent',{type,key:'z',code:'KeyZ',windowsVirtualKeyCode:90,modifiers:redo?10:2},sessionId);
        await wait();
    };
    await evaluate(`(async()=>{
        const ui=await import('/extensions/clab/components/ui_state.js');
        window.undoUI=ui;ui.syncStateToActiveWorkspace();window.undoOriginal=ui.getActiveWorkspace();
        window.undoHistory=(await import('/extensions/clab/components/edit_history_runtime.js')).editHistory;
        const cards=Array.from({length:2},(_,i)=>({id:'undo-row-'+i,title:'任务 '+i,areas:[
            {id:'undo-input-'+i,type:'edit',title:'文本',value:'before '+i,targetNodeId:'1',targetWidget:'text',targetWidgets:['1||text'],dataType:'string'},
            {id:'undo-output-'+i,type:'preview',title:'图片',targetNodeId:'2',history:['/view?filename=first.png'],historyIndex:0,resultUrl:'/view?filename=first.png'},
        ]}));
        window.undoTable=ui.createEmptyWorkspace('撤销检查',{cards,view:{mode:'table'}});
        ui.state.workspaces.push(undoTable);ui.applyWorkspaceToState(undoTable);document.dispatchEvent(new Event('clab_render_ui'));
        undoHistory.reset();window.undoImage=document.querySelector('[data-area-id=undo-output-0] img');
        window.undoModes=[];window.undoObserver=new MutationObserver(records=>records.forEach(record=>{if(record.attributeName==='data-workspace-mode')undoModes.push(record.oldValue);}));
        undoObserver.observe(document.querySelector('#clab-panel'),{attributes:true,attributeOldValue:true,attributeFilter:['data-workspace-mode']});
        const input=document.querySelector('[data-area-id=undo-input-0] textarea');input.value='after';input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));
    })()`);
    await wait();
    assert.equal(await evaluate('undoTable.cards[0].areas[0].value'),'after');
    await undo();
    assert.equal(await evaluate(`undoTable.cards[0].areas[0].value==='before 0'&&document.querySelector('[data-area-id=undo-input-0] textarea').value==='before 0'&&document.querySelector('#clab-panel').dataset.workspaceMode==='table'&&document.querySelector('[data-area-id=undo-output-0] img')===undoImage&&!undoModes.includes('cards')`),true,'table undo must restore its input without card-mode fallback or replacing media');
    await undo(true);assert.equal(await evaluate('undoTable.cards[0].areas[0].value'),'after');
    assert.deepEqual(await evaluate(`(()=>{const input=document.querySelector('[data-area-id=undo-input-0] textarea');input.readOnly=false;const native=new KeyboardEvent('keydown',{key:'z',ctrlKey:true,bubbles:true,cancelable:true});input.dispatchEvent(native);input.readOnly=true;return {native:!native.defaultPrevented};})()`),{native:true});
    console.log('PASS local table undo/redo updates the cell in place without switching modes or reloading output images');

    await evaluate(`(()=>{
        undoHistory.reset();document.querySelector('[data-table-row="undo-row-0"] [data-table-row-header]').dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true,clientX:350,clientY:250}));
        document.querySelector('[data-table-action=delete-row]').click();
    })()`);await wait();
    assert.equal(await evaluate(`undoTable.cards.length===1&&undoTable.archivedTasks.length===1&&undoTable.archivedTasks[0].id==='undo-row-0'`),true,'deleting a table row must archive the task');
    await evaluate(`undoTable.archivedTasks[0].areas[1].history.push('/view?filename=second.png')`);
    await undo();assert.equal(await evaluate(`undoTable.cards.length===2&&undoTable.archivedTasks.length===0&&undoTable.cards[0].areas[1].history.length===2&&undoTable.view.table.sheets[0].rows[0].cardId==='undo-row-0'`),true);
    await undo(true);assert.equal(await evaluate('undoTable.cards.length===1&&undoTable.archivedTasks.length===1'),true);
    await evaluate(`(()=>{document.querySelector('#clab-config-dropdown-trigger').click();const panel=document.querySelector('.clab-maintenance-panel'),check=panel.querySelector('input[value="undo-row-0"]');check.checked=true;check.dispatchEvent(new Event('change',{bubbles:true}));panel.querySelector('[data-maint-restore]').click();})()`);await wait();
    assert.deepEqual(await evaluate(`({cards:undoTable.cards.map(card=>card.id),archived:undoTable.archivedTasks.map(card=>card.id),row:undoTable.view.table.sheets[0].rows[0].cardId})`),{cards:['undo-row-0','undo-row-1'],archived:[],row:'undo-row-0'},'maintenance must restore archived table rows');
    await undo();assert.equal(await evaluate('undoTable.archivedTasks.length===1&&!document.querySelector(\'.clab-maintenance-panel:popover-open\')'),true);
    await undo();
    console.log('PASS row deletion archives complete tasks; undo/redo preserves late generated results and the original row position');

    await evaluate(`(async()=>{
        (await import('/extensions/clab/components/contextmenu/group_content.js')).openWorkspacePreview();
        undoHistory.reset();const title=document.querySelector('.clab-preview-modal [data-review-column-name]');
        title.dispatchEvent(new MouseEvent('dblclick',{bubbles:true}));const input=title.parentElement.querySelector('input');input.value='新列名';input.dispatchEvent(new Event('change',{bubbles:true}));input.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));
    })()`);await wait();
    assert.equal(await evaluate('undoTable.view.table.sheets[0].columns[0].title'),'新列名');
    await undo();assert.equal(await evaluate(`undoTable.view.table.sheets[0].columns[0].title==='文本'&&document.querySelector('.clab-preview-modal [data-review-column-name]').textContent==='文本'`),true,'preview undo must rebuild from restored data, not commit its old projection');
    await undo(true);assert.equal(await evaluate(`document.querySelector('.clab-preview-modal [data-review-column-name]').textContent`),'新列名');
    await evaluate(`document.querySelector('.clab-preview-modal-close').click();`);
    console.log('PASS preview-table edits share local undo/redo and synchronize restored column titles');

    await evaluate(`(()=>{window.showWorkspaceModeDemo('xy');undoHistory.reset();window.undoXY=undoUI.getActiveWorkspace();window.undoAxis=[...undoXY.view.xy.x.values];window.undoCards=[...undoXY.cards];undoXY.view.xy.zoom=.65;undoXY.view.xy.panX=-75;undoXY.view.xy.panY=130;document.dispatchEvent(new Event('clab_render_ui'));document.querySelector('.axis-x').click();const input=document.querySelector('[data-xy-values=x]');input.value='20,30,40';input.dispatchEvent(new Event('change',{bubbles:true}));document.querySelector('.clab-xy-popup-close').click();})()`);await wait();
    assert.deepEqual(await evaluate('undoXY.view.xy.x.values'),[20,30,40]);
    const camera=await evaluate('window.undoCamera=[undoXY.view.xy.zoom,undoXY.view.xy.panX,undoXY.view.xy.panY]');
    await undo();assert.deepEqual(await evaluate(`({values:undoXY.view.xy.x.values,mode:undoXY.view.mode,camera:[undoXY.view.xy.zoom,undoXY.view.xy.panX,undoXY.view.xy.panY],sameTasks:undoCards.every(card=>undoXY.cards.includes(card))})`),{values:await evaluate('undoAxis'),mode:'xy',camera,sameTasks:true},'XY undo must preserve the camera, mode and surviving tasks');
    await undo(true);assert.deepEqual(await evaluate('undoXY.view.xy.x.values'),[20,30,40]);
    await evaluate(`undoHistory.reset();undoXY.view.xy.panX+=20;window.CLab.scheduleViewSave(undoUI.state);`);await undo();
    assert.equal(await evaluate('undoXY.view.mode===\'xy\'&&undoXY.view.xy.panX===undoCamera[1]+20'),true,'panning alone must not enter content undo or fall through to workflow undo');
    await evaluate(`(async()=>{
        window.undoSecond=structuredClone(undoXY);undoSecond.id='undo-second-xy';undoSecond.name='第二个矩阵';undoUI.state.workspaces.push(undoSecond);
        (await import('/extensions/clab/components/contextmenu/group_content.js')).openWorkspacePreview();document.querySelector('[data-preview-add-sources]').click();const check=document.querySelector('.clab-preview-source-picker input[value="undo-second-xy"]');check.checked=true;check.dispatchEvent(new Event('change',{bubbles:true}));document.querySelector('.clab-preview-source-picker').hidePopover();
    })()`);await wait();
    await evaluate(`(()=>{const stage=document.querySelector('.clab-review-multi-grid'),r=stage.getBoundingClientRect();stage.dispatchEvent(new WheelEvent('wheel',{bubbles:true,cancelable:true,clientX:r.left+200,clientY:r.top+200,deltaY:-120}));})()`);await wait();
    const transform=await evaluate(`document.querySelector('.clab-review-matrix-scene').style.transform`);
    await evaluate(`undoHistory.reset();window.undoMatrixName=undoXY.name;undoXY.name='修改矩阵名称';window.CLab.saveState(undoUI.state);`);await undo();
    assert.equal(await evaluate('undoXY.name===undoMatrixName'),true);
    assert.equal(await evaluate(`document.querySelector('.clab-review-matrix-scene').style.transform`),transform,'multi-workspace preview undo must retain its independent overview camera');
    await evaluate(`undoHistory.reset();window.undoScene=document.querySelector('.clab-review-matrix-scene');`);await undo();
    assert.equal(await evaluate(`document.querySelector('.clab-review-matrix-scene')===undoScene`),true,'an empty local history must not remount preview media');
    await evaluate(`document.querySelector('.clab-preview-modal-close').click();undoUI.state.workspaces=undoUI.state.workspaces.filter(ws=>ws!==undoSecond);`);
    await evaluate(`undoObserver.disconnect();undoUI.applyWorkspaceToState(undoOriginal);document.dispatchEvent(new Event('clab_render_ui'));undoHistory.reset();`);
    console.log('PASS XY value undo/redo preserves camera and task results; camera-only Ctrl+Z stays local and returns immediately');
    console.log('PASS multi-workspace preview undo rebuilds source projections without resetting the overview camera');
    return 5;
}
