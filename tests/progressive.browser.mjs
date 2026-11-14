import assert from 'node:assert/strict';

export async function runProgressiveChecks(send,sessionId){
    const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true},sessionId);assert.equal(r.exceptionDetails,undefined,JSON.stringify(r.exceptionDetails));return r.result.value;};
    const wait=ms=>evaluate(`new Promise(resolve=>setTimeout(resolve,${ms}))`);
    await evaluate(`(async()=>{
        const ui=await import('/extensions/clab/components/ui_state.js'),{togglePanel}=await import('/extensions/clab/ui_panel.js'),{editHistory}=await import('/extensions/clab/components/edit_history_runtime.js');
        ui.syncStateToActiveWorkspace();window.pg={ui,togglePanel,editHistory,original:ui.getActiveWorkspace(),workspaces:[...ui.state.workspaces],panel:document.querySelector('#clab-panel')};pg.container=pg.panel.querySelector('#clab-cards-container');
        if(pg.panel.classList.contains('visible'))togglePanel();
        pg.ws=ui.createEmptyWorkspace('分批打开',{cards:Array.from({length:100},(_,i)=>({id:'pg-card-'+i,areas:Array.from({length:8},(_,j)=>({id:'pg-input-'+i+'-'+j,type:'edit',title:'参数 '+j,value:'task '+i+' value '+j,autoHeight:true,dataType:'string',targetNodeId:'1',targetWidget:'text',targetWidgets:['1||text']}))}))});
        ui.state.workspaces.push(pg.ws);ui.applyWorkspaceToState(pg.ws);
        pg.count=()=>pg.container.querySelectorAll('[data-area-id^="pg-input-"] textarea').length;pg.root=id=>pg.container.querySelector('[data-area-id="'+id+'"]');
    })()`);
    try{
        const opening=await evaluate(`(async()=>{const start=performance.now();pg.togglePanel();const elapsed=performance.now()-start,visible=pg.panel.classList.contains('visible'),immediate=pg.count();const firstPaint=await new Promise(resolve=>requestAnimationFrame(()=>resolve({count:pg.count(),opening:pg.container.hasAttribute('data-clab-opening')})));return {elapsed,visible,immediate,firstPaint};})()`);
        console.log('PROGRESSIVE panel opening '+JSON.stringify(opening));
        assert.equal(opening.visible,true);assert.equal(opening.immediate,0);assert.equal(opening.firstPaint.count,0);assert.equal(opening.firstPaint.opening,true);assert.ok(opening.elapsed<50);
        await wait(500);
        assert.equal(await evaluate(`!!pg.root('pg-input-0-0')?.querySelector('textarea')&&pg.count()>0&&pg.count()<80&&!pg.panel.hasAttribute('aria-busy')`),true);
        await evaluate(`pg.field=pg.root('pg-input-0-0').querySelector('textarea');pg.field.focus();pg.field.setSelectionRange(2,4);pg.togglePanel();pg.ws.cards[0].areas[0].value='changed while closed';pg.togglePanel();`);await wait(400);
        assert.equal(await evaluate(`pg.root('pg-input-0-0').querySelector('textarea')===pg.field&&document.activeElement===pg.field&&pg.field.selectionStart===2&&pg.field.selectionEnd===4`),true);
        await evaluate(`pg.field.blur();pg.togglePanel();pg.togglePanel();`);await wait(400);
        assert.equal(await evaluate(`pg.root('pg-input-0-0').querySelector('textarea').value==='changed while closed'`),true);
        console.log('PASS opening paints before task content, mounts only nearby controls and reuses input DOM and caret across reopen cycles');

        await evaluate(`pg.togglePanel();pg.togglePanel();pg.togglePanel();pg.nodes=[...pg.container.querySelectorAll('textarea')];`);await wait(180);
        assert.equal(await evaluate(`!pg.panel.classList.contains('visible')&&!pg.panel.hasAttribute('aria-busy')&&!pg.container.hasAttribute('data-clab-progressive')&&pg.nodes.length===pg.container.querySelectorAll('textarea').length&&pg.nodes.every(node=>pg.container.contains(node))`),true);
        await evaluate(`pg.togglePanel();pg.other=pg.ui.createEmptyWorkspace('替换加载',{cards:[{id:'pg-other-card',areas:[{id:'pg-other-area',type:'edit',value:'new workspace',dataType:'string'}]}]});pg.ui.state.workspaces.push(pg.other);pg.ui.applyWorkspaceToState(pg.other);pg.editHistory.withoutRecording(()=>document.dispatchEvent(new Event('clab_render_ui')));`);await wait(350);
        assert.equal(await evaluate(`!!pg.root('pg-other-area')?.querySelector('textarea')&&!pg.root('pg-input-0-0')&&!pg.panel.hasAttribute('aria-busy')`),true);
        console.log('PASS rapid close and workspace replacement cancel pending opening batches without stale content or hidden loading');
    }finally{
        await evaluate(`(()=>{if(!pg.panel.classList.contains('visible'))pg.togglePanel();pg.editHistory.withoutRecording(()=>{pg.ui.state.workspaces=pg.workspaces;pg.ui.applyWorkspaceToState(pg.original);document.dispatchEvent(new Event('clab_render_ui'));});})()`);
    }
    return 2;
}
