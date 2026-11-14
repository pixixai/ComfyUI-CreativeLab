import assert from 'node:assert/strict';
import fs from 'node:fs';

export async function runRunControlsChecks(send,sessionId){
    const evaluate=async expression=>{
        const result=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true},sessionId);
        assert.equal(result.exceptionDetails,undefined,JSON.stringify(result.exceptionDetails));return result.result.value;
    };
    const wait=()=>evaluate('new Promise(resolve=>setTimeout(resolve,220))');
    await evaluate(`(async()=>{
        const ui=await import('/extensions/clab/components/ui_state.js'),{createWorkspaceView}=await import('/extensions/clab/components/workspace_modes/view_state.js'),model=await import('/extensions/clab/components/workspace_modes/xy_model.js'),{editHistory}=await import('/extensions/clab/components/edit_history_runtime.js');
        ui.syncStateToActiveWorkspace();window.rc={ui,createWorkspaceView,model,editHistory,original:ui.getActiveWorkspace(),workspaces:[...ui.state.workspaces],execute:window.CLab.executeTasks,interrupt:window.CLab.interruptExecution,status:window.CLab.getExecutionState,queue:[],busy:false,stopping:false};
        rc.panel=document.querySelector('#clab-panel');rc.dock=rc.panel.querySelector('.clab-tool-dock');rc.dockMode=rc.dock.dataset.dock;
        rc.show=ws=>{if(!ui.state.workspaces.includes(ws))ui.state.workspaces.push(ws);ui.applyWorkspaceToState(ws);editHistory.withoutRecording(()=>document.dispatchEvent(new Event('clab_render_ui')));};
        rc.clear=()=>{ui.state.selectedCardIds=[];ui.state.selectedAreaIds=[];ui.state.activeCardId=null;};
        rc.cards=ui.createEmptyWorkspace('运行检查',{cards:Array.from({length:3},(_,i)=>({id:'run-card-'+i,title:'Run '+i,areas:[{id:'run-in-'+i,type:'edit',value:'value-'+i,targetNodeId:'1',targetWidget:'text',targetWidgets:['1||text'],dataType:'string'},{id:'run-out-'+i,type:'preview',targetNodeId:'2',history:[]}]}))});
        window.CLab.executeTasks=tasks=>{rc.queue=structuredClone(tasks);};rc.show(rc.cards);rc.clear();
    })()`);await wait();
    try{
        await evaluate(`rc.ui.state.activeCardId='run-card-1';document.querySelector('#clab-btn-run').click();`);
        assert.deepEqual(await evaluate(`rc.queue.map(task=>task.cardId)`),['run-card-0','run-card-1','run-card-2']);
        await evaluate(`rc.ui.state.selectedAreaIds=['run-out-1'];document.querySelector('#clab-btn-run').click();`);
        assert.deepEqual(await evaluate(`rc.queue.map(task=>task.cardId)`),['run-card-1']);
        await evaluate(`(async()=>{rc.clear();const {setWorkspaceMode}=await import('/extensions/clab/components/workspace_modes/workspace_modes.js');setWorkspaceMode(rc.panel,'table');})()`);await wait();
        await evaluate(`rc.clear();document.querySelector('#clab-btn-run').click();`);
        assert.deepEqual(await evaluate(`rc.queue.map(task=>task.cardId)`),['run-card-0','run-card-1','run-card-2']);
        await evaluate(`rc.ui.state.selectedCardIds=['run-card-2'];document.querySelector('#clab-btn-run').click();`);
        assert.deepEqual(await evaluate(`rc.queue.map(task=>task.cardId)`),['run-card-2']);
        console.log('PASS card and table Run default to all valid tasks with no selection and preserve selected-only execution');

        await evaluate(`(()=>{
            rc.node={id:922,title:'Run axes',widgets:[{name:'x',type:'number',value:1},{name:'y',type:'number',value:1},{name:'z',type:'number',value:1}]};window.testApp.graph._nodes.push(rc.node);
            rc.xy=rc.ui.createEmptyWorkspace('运行矩阵',{view:rc.createWorkspaceView({mode:'xy',xy:{initialized:true,x:{bindings:['922||x'],values:[1,2]},y:{bindings:['922||y'],values:[1,2]},z:{enabled:true,bindings:['922||z'],values:[1,2],current:1},outputNodeId:'2'}})});
            rc.model.synchronizeMatrix(rc.xy.cards,rc.xy.view.xy,[]);rc.show(rc.xy);rc.clear();
        })()`);await wait();
        await evaluate(`document.querySelector('#clab-btn-run').click();`);
        assert.equal(await evaluate(`rc.queue.length===4&&rc.queue.every(task=>rc.model.matrixCells(rc.xy.cards,rc.xy.view.xy).find(cell=>cell.card.id===task.cardId).z===1)`),true);
        await evaluate(`document.querySelector('#clab-btn-run-all').click();`);assert.equal(await evaluate(`rc.queue.length`),8);
        await evaluate(`rc.chosen=rc.model.matrixCells(rc.xy.cards,rc.xy.view.xy).filter(cell=>cell.z===1).slice(0,2);rc.ui.state.selectedAreaIds=rc.chosen.map(cell=>rc.model.matrixOutput(cell.card,rc.xy.view.xy).id);document.querySelector('#clab-run-batch-count').value=2;document.querySelector('#clab-btn-run').click();`);
        assert.deepEqual(await evaluate(`rc.queue.map(task=>task.cardId)`),await evaluate(`[...rc.chosen,...rc.chosen].map(cell=>cell.card.id)`));
        console.log('PASS XY Run defaults to the current Z layer, Run All includes every layer, and the shared count repeats selected tasks in order');

        await evaluate(`window.CLab.getExecutionState=()=>({busy:rc.busy,stopping:rc.stopping});window.CLab.interruptExecution=()=>{rc.stopClicks=(rc.stopClicks||0)+1;rc.busy=false;document.dispatchEvent(new Event('clab_execution_state'));};rc.update=()=>document.dispatchEvent(new Event('clab_execution_state'));rc.update();`);
        assert.equal(await evaluate(`document.querySelector('#clab-btn-interrupt').disabled`),true);
        await evaluate(`rc.busy=true;rc.update();`);await wait();
        assert.equal(await evaluate(`(()=>{const b=document.querySelector('#clab-btn-interrupt');return !b.disabled&&getComputedStyle(b).backgroundColor==='rgb(196, 43, 55)';})()`),true,JSON.stringify(await evaluate(`(()=>{const b=document.querySelector('#clab-btn-interrupt');return {disabled:b.disabled,color:getComputedStyle(b).backgroundColor,classes:b.className};})()`)));
        for(const side of ['top','bottom','float']){
            await evaluate(`rc.dock.dataset.dock=${JSON.stringify(side)};`);await wait();
            const geometry=await evaluate(`(()=>{const q=s=>document.querySelector(s),ids=['#clab-run-count-control','#clab-btn-run','#clab-run-dropdown-toggle','#clab-btn-interrupt'],boxes=ids.map(id=>{const b=q(id).getBoundingClientRect();return {x:b.x,y:b.y,right:b.right,bottom:b.bottom,width:b.width,height:b.height};});return {boxes,blue:getComputedStyle(q('#clab-run-btn-wrapper')).backgroundColor};})()`);
            for(let i=0;i<3;i++)assert.ok(geometry.boxes[i].right<=geometry.boxes[i+1].x+.5,side+' run control order/overlap');
            assert.ok(geometry.boxes.every(box=>box.width>0&&Math.abs(box.y-geometry.boxes[0].y)<.5&&Math.abs(box.height-geometry.boxes[0].height)<.5),side+' run control alignment');
            assert.notEqual(geometry.blue,'rgba(0, 0, 0, 0)');
        }
        if(process.env.CLAB_RUN_SCREENSHOT){const shot=await send('Page.captureScreenshot',{format:'png'},sessionId);fs.writeFileSync(process.env.CLAB_RUN_SCREENSHOT,Buffer.from(shot.data,'base64'));}
        await evaluate(`document.querySelector('#clab-btn-interrupt').click();`);assert.equal(await evaluate(`rc.stopClicks===1&&document.querySelector('#clab-btn-interrupt').disabled&&!document.querySelector('#clab-btn-interrupt').classList.contains('running')`),true);
        await evaluate(`rc.busy=true;rc.stopping=true;rc.update();`);assert.equal(await evaluate(`document.querySelector('#clab-btn-run').disabled&&document.querySelector('#clab-btn-interrupt').disabled`),true);
        console.log('PASS shared run controls align count, run/menu and interrupt in every dock, turn red while busy, and disable during interrupt');
    }finally{
        await evaluate(`(()=>{document.querySelector('#clab-run-batch-count').value=1;rc.dock.dataset.dock=rc.dockMode;window.CLab.executeTasks=rc.execute;window.CLab.interruptExecution=rc.interrupt;window.CLab.getExecutionState=rc.status;window.testApp.graph._nodes=window.testApp.graph._nodes.filter(node=>node!==rc.node);rc.editHistory.withoutRecording(()=>{rc.ui.state.workspaces=rc.workspaces;rc.ui.applyWorkspaceToState(rc.original);document.dispatchEvent(new Event('clab_render_ui'));});document.dispatchEvent(new Event('clab_execution_state'));})()`);
    }
}
