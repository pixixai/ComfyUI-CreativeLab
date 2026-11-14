import assert from 'node:assert/strict';

export async function runContentPerformanceChecks(send,sessionId){
    const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true},sessionId);assert.equal(r.exceptionDetails,undefined,JSON.stringify(r.exceptionDetails));return r.result.value;};
    const wait=ms=>evaluate(`new Promise(resolve=>setTimeout(resolve,${ms}))`);
    await evaluate(`(async()=>{
        const ui=await import('/extensions/clab/components/ui_state.js'),{createWorkspaceView}=await import('/extensions/clab/components/workspace_modes/view_state.js'),{StateManager}=await import('/extensions/clab/state_manager.js'),{editHistory}=await import('/extensions/clab/components/edit_history_runtime.js');
        ui.syncStateToActiveWorkspace();window.cp={ui,createWorkspaceView,StateManager,editHistory,original:ui.getActiveWorkspace(),workspaces:[...ui.state.workspaces],sync:StateManager.syncToNode,record:editHistory.record,node:{id:611,type:'Text',widgets:Array.from({length:4},(_,i)=>({name:'value'+i,type:'text',value:'value'}))}};
        window.testApp.graph._nodes.push(cp.node);cp.syncs=0;cp.records=0;StateManager.syncToNode=function(...args){cp.syncs++;return cp.sync.apply(this,args);};editHistory.record=function(...args){cp.records++;return cp.record.apply(this,args);};
        cp.click=cell=>{const r=cell.getBoundingClientRect();for(const type of ['pointerdown','pointerup'])cell.dispatchEvent(new PointerEvent(type,{bubbles:true,button:0,buttons:type==='pointerdown'?1:0,pointerId:31,clientX:r.left+10,clientY:r.top+10}));};
    })()`);
    try{
        for(const count of [100,300]){
            await evaluate(`(()=>{
                cp.count=${count};const make=id=>cp.ui.createEmptyWorkspace('性能 '+id,{id:'perf-'+id+'-'+cp.count,view:cp.createWorkspaceView({mode:'table'}),cards:Array.from({length:${count}},(_,i)=>({id:'perf-card-'+i,title:'任务 '+(i+1),areas:Array.from({length:4},(_,j)=>({id:'perf-area-'+i+'-'+j,type:'edit',title:'参数 '+j,value:'original '+i,autoHeight:false,dataType:'string',targetNodeId:'611',targetWidget:'value'+j,targetWidgets:['611||value'+j]}))}))});
                cp.active=make('active');cp.other=make('other');cp.ui.state.workspaces=[...cp.workspaces,cp.active,cp.other];cp.ui.applyWorkspaceToState(cp.active);cp.editHistory.withoutRecording(()=>document.dispatchEvent(new Event('clab_render_ui')));
            })()`);await wait(450);
            const selection=await evaluate(`(()=>{
                cp.StateManager.flushPendingSave(window.testApp.graph);cp.syncs=cp.records=0;
                const root=document.querySelector('#clab-panel'),last=root.querySelector('[data-card-id="perf-card-'+(cp.count-1)+'"].clab-card');
                const observer=new MutationObserver(()=>{});observer.observe(last,{attributes:true,subtree:true,childList:true});const samples=[];
                for(let i=0;i<12;i++){const cell=root.querySelector('[data-area-id="perf-area-'+i+'-0"]');const start=performance.now();cp.click(cell);samples.push(performance.now()-start);}
                const mutations=observer.takeRecords().length;observer.disconnect();samples.sort((a,b)=>a-b);
                return {historyChecks:cp.records,synchronousSaves:cp.syncs,unrelatedMutations:mutations,medianMs:samples[6],selected:cp.ui.state.selectedAreaIds};
            })()`);
            assert.equal(selection.historyChecks,0);assert.equal(selection.synchronousSaves,0);assert.equal(selection.unrelatedMutations,0);assert.deepEqual(selection.selected,['perf-area-11-0']);
            await wait(300);
            const typing=await evaluate(`(()=>{
                cp.syncs=cp.records=0;const root=document.querySelector('#clab-panel'),cell=root.querySelector('[data-area-id="perf-area-0-0"]');cp.click(cell);cell.dispatchEvent(new MouseEvent('dblclick',{bubbles:true}));
                const input=cell.querySelector('textarea.clab-edit-val'),untouched=cp.active.cards.at(-1).areas.at(-1);cp.reads=0;cp.originalValue=untouched.value;
                Object.defineProperty(untouched,'value',{configurable:true,enumerable:true,get(){cp.reads++;return cp.originalValue;}});
                const samples=[];for(let i=0;i<16;i++){const start=performance.now();input.value='typing '+i;input.dispatchEvent(new Event('input',{bubbles:true}));samples.push(performance.now()-start);}
                samples.sort((a,b)=>a-b);const result={unrelatedReads:cp.reads,synchronousSaves:cp.syncs,medianMs:samples[8],value:cp.active.cards[0].areas[0].value};
                Object.defineProperty(untouched,'value',{configurable:true,enumerable:true,writable:true,value:cp.originalValue});return result;
            })()`);
            assert.equal(typing.unrelatedReads,0);assert.equal(typing.synchronousSaves,0);assert.equal(typing.value,'typing 15');
            const saved=await evaluate(`(()=>{
                cp.other.cards[0].areas[0].value='background workspace';window.CLab.scheduleSave({workspaceIds:[cp.other.id]});
                const data=JSON.parse(window.testApp.graph.serialize().nodes[0].widgets_values[0]);
                return {active:data.workspaces.find(ws=>ws.id===cp.active.id).cards[0].areas[0].value,other:data.workspaces.find(ws=>ws.id===cp.other.id).cards[0].areas[0].value,saves:cp.syncs};
            })()`);
            assert.equal(saved.active,'typing 15');assert.equal(saved.other,'background workspace');assert.equal(saved.saves,1);
            console.log('PASS '+count+' tasks: selection skips content history and untouched rows; typing skips unrelated modules; immediate serialization flushes all dirty workspaces '+JSON.stringify({selectionMedianMs:selection.medianMs,inputMedianMs:typing.medianMs}));
        }
    }finally{
        await evaluate(`(()=>{cp.StateManager.flushPendingSave(window.testApp.graph);cp.StateManager.syncToNode=cp.sync;cp.editHistory.record=cp.record;cp.editHistory.withoutRecording(()=>{cp.ui.state.workspaces=cp.workspaces;cp.ui.applyWorkspaceToState(cp.original);window.testApp.graph._nodes=window.testApp.graph._nodes.filter(node=>node!==cp.node);document.dispatchEvent(new Event('clab_render_ui'));});})()`);
    }
    return 2;
}
