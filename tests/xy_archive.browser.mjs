import assert from 'node:assert/strict';

export async function runXYArchiveChecks(send,sessionId){
    const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true},sessionId);assert.equal(r.exceptionDetails,undefined,JSON.stringify(r.exceptionDetails));return r.result.value;};
    const wait=()=>evaluate('new Promise(resolve=>setTimeout(resolve,100))');
    const key=async redo=>{await evaluate('document.activeElement?.blur()');await send('Input.dispatchKeyEvent',{type:'keyDown',key:'z',code:'KeyZ',windowsVirtualKeyCode:90,modifiers:redo?10:2},sessionId);await send('Input.dispatchKeyEvent',{type:'keyUp',key:'z',code:'KeyZ',windowsVirtualKeyCode:90},sessionId);await wait();};
    await evaluate(`(async()=>{
        const ui=await import('/extensions/clab/components/ui_state.js'),model=await import('/extensions/clab/components/workspace_modes/xy_model.js'),{createWorkspaceView}=await import('/extensions/clab/components/workspace_modes/view_state.js'),{editHistory}=await import('/extensions/clab/components/edit_history_runtime.js');
        ui.syncStateToActiveWorkspace();window.ar={ui,model,editHistory,original:ui.getActiveWorkspace(),workspaces:[...ui.state.workspaces],nodes:[]};
        for(const id of [401,402,403])ar.nodes.push({id,type:'Sampler',title:'采样器 '+id,widgets:[{name:'steps',type:'number',value:20},{name:'sampler',type:'combo',value:'A',options:{values:['A','B','C','D']}}]});
        ar.nodes.push({id:404,type:'SaveImage',title:'原输出',widgets:[]},{id:405,type:'SaveImage',title:'新输出',widgets:[]});window.testApp.graph._nodes.push(...ar.nodes);
        ar.ws=ui.createEmptyWorkspace('绑定与归档',{view:createWorkspaceView({mode:'xy',xy:{initialized:true,outputNodeId:'404',x:{bindings:['401||steps'],values:[10,20]},y:{bindings:['401||sampler'],values:['A','B','C'],inputText:'["A", "B", "C"]'}}})});
        model.synchronizeMatrix(ar.ws.cards,ar.ws.view.xy,[]);ar.generated=ar.ws.cards[0];ar.queued=ar.ws.cards[1];ar.generated.areas[0].history=['/view?filename=first.png'];ar.generated.areas[0].resultUrl=ar.generated.areas[0].history[0];ar.queued.historyRunSequence=1;
        ar.editHistory.withoutRecording(()=>{ui.state.workspaces.push(ar.ws);ui.applyWorkspaceToState(ar.ws);document.dispatchEvent(new Event('clab_render_ui'));});
        ar.popup=()=>document.querySelector('.clab-module-binding-popover:popover-open');
        ar.bind=(name,key)=>{const old=[...ar.ws.view.xy[name].bindings];document.querySelector('#clab-panel [data-xy-bind="'+name+'"]').click();for(const key of old)ar.popup().querySelector('[data-xy-parameter="'+key+'"]').click();ar.popup().querySelector('button[data-xy-node="'+key.split('||')[0]+'"]').click();ar.popup().querySelector('[data-xy-parameter="'+key+'"]').click();ar.popup().querySelector('.clab-xy-popup-close').click();};
    })()`);await wait();
    try{
        await evaluate(`ar.bind('y','402||sampler')`);await wait();
        assert.equal(await evaluate(`ar.ws.cards.length===6&&ar.ws.archivedTasks.includes(ar.generated)&&ar.ws.archivedTasks.includes(ar.queued)&&ar.ws.view.xy.y.inputText==='["A", "B", "C"]'&&ar.model.matrixCells(ar.ws.cards,ar.ws.view.xy).length===6&&ar.model.matrixOutput(ar.generated,ar.ws.view.xy).targetNodeId==='404'`),true);
        console.log('PASS real axis binding controls retain all values and exact text while archiving completed and queued originals');

        await evaluate(`ar.editHistory.reset();document.querySelector('#clab-panel .axis-y').click();const input=ar.popup().querySelector('[data-xy-values]');input.value='["A","B","C","D"]';input.dispatchEvent(new Event('change',{bubbles:true}));ar.popup().querySelector('.clab-xy-popup-close').click();`);await wait();
        await evaluate(`ar.added=ar.ws.cards.filter(card=>ar.model.matrixCells(ar.ws.cards,ar.ws.view.xy).some(cell=>cell.card===card&&cell.y===3));ar.added[0].areas[0].history=['/view?filename=first.png'];ar.added[1].historyRunSequence=1;`);
        await key(false);assert.equal(await evaluate(`ar.ws.cards.length===6&&ar.added.every(card=>ar.ws.archivedTasks.includes(card))&&document.querySelector('#clab-panel').dataset.workspaceMode==='xy'`),true);
        await key(true);assert.equal(await evaluate(`ar.ws.cards.length===8&&ar.added.every(card=>ar.ws.cards.includes(card))&&new Set(ar.ws.cards.map(card=>card.id)).size===8&&!ar.added.some(card=>ar.ws.archivedTasks.includes(card))`),true);
        console.log('PASS native XY undo archives newly generated combinations and redo restores them once in the same matrix');

        await evaluate(`(()=>{const tab=document.querySelector('#clab-workspace-bar .clab-workspace-tab.active');tab.dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,clientX:100,clientY:100}));document.querySelector('#clab-ctx-ws-duplicate').click();ar.copy=ar.ui.getActiveWorkspace();})()`);await wait();
        assert.equal(await evaluate(`ar.copy!==ar.ws&&[...ar.copy.cards,...ar.copy.archivedTasks].every(card=>!Object.hasOwn(card,'historyRunSequence'))&&!ar.copy.archivedTasks.some(card=>card.id===ar.queued.id)`),true);
        await evaluate(`ar.ws=ar.copy;ar.bind('x','403||steps');ar.bind('y','403||sampler');document.querySelector('#clab-panel [data-xy-bind="output"]').click();ar.popup().querySelector('button[data-xy-node="405"]').click();ar.popup().querySelector('.clab-xy-popup-close').click();`);await wait();
        assert.equal(await evaluate(`ar.copy.cards.length===8&&ar.copy.archivedTasks.every(card=>card.areas.some(area=>area.history?.length))&&ar.copy.cards.every(card=>ar.model.matrixOutput(card,ar.copy.view.xy).targetNodeId==='405')`),true);
        console.log('PASS actual workspace copying and rebinding to another workflow create no empty submission archives');
    }finally{
        await evaluate(`(()=>{ar.popup()?.querySelector('.clab-xy-popup-close')?.click();ar.editHistory.withoutRecording(()=>{ar.ui.state.workspaces=ar.workspaces;ar.ui.applyWorkspaceToState(ar.original);window.testApp.graph._nodes=window.testApp.graph._nodes.filter(node=>!ar.nodes.includes(node));document.dispatchEvent(new Event('clab_render_ui'));});})()`);
    }
    return 3;
}
