import fs from 'node:fs';
import assert from 'node:assert/strict';

export async function runWorkspaceFollowChecks(send,sessionId){
    const evaluate=async expression=>{new Function(expression);const r=await send('Runtime.evaluate',{expression:'(0,eval)('+JSON.stringify(expression)+')',awaitPromise:true,returnByValue:true},sessionId);assert.equal(r.exceptionDetails,undefined,JSON.stringify(r.exceptionDetails));return r.result.value;};
    const wait=ms=>evaluate(`new Promise(resolve=>setTimeout(resolve,${ms}))`);
    await evaluate(`(async()=>{
        const ui=await import('/extensions/clab/components/ui_state.js'),{createWorkspaceView}=await import('/extensions/clab/components/workspace_modes/view_state.js'),{editHistory}=await import('/extensions/clab/components/edit_history_runtime.js'),{setWorkspaceMode}=await import('/extensions/clab/components/workspace_modes/workspace_modes.js'),{cardWindow}=await import('/extensions/clab/components/workspace_modes/card_window.js');
        ui.syncStateToActiveWorkspace();window.cf={ui,createWorkspaceView,editHistory,setWorkspaceMode,cardWindow,original:ui.getActiveWorkspace(),workspaces:[...ui.state.workspaces],runningProgress:window.CLab.getRunningCardProgress,running:new Map()};window.CLab.getRunningCardProgress=id=>cf.running.get(id)||[];
        cf.node={id:921,type:'Text',widgets:[{name:'x',type:'number',value:1},{name:'y',type:'number',value:1},{name:'z',type:'text',value:'one'},{name:'text',type:'text',value:''}]};window.testApp.graph._nodes.push(cf.node);
        cf.ws=ui.createEmptyWorkspace('运行跟随',{cards:Array.from({length:100},(_,i)=>({id:'cf-card-'+i,title:'任务 '+i,areas:[{id:'cf-text-'+i,type:'edit',title:'长文本',value:'这是自动换行的长文本。'.repeat(20),autoHeight:true,dataType:'string',targetNodeId:'921',targetWidget:'text',targetWidgets:['921||text']},{id:'cf-out-'+i,type:'preview',targetNodeId:'2',history:['/view?filename=first.png'],resultUrl:'/view?filename=first.png',historyIndex:0,matchMedia:true,width:320,height:180}]}))});
        cf.clip=await new Promise(resolve=>{const canvas=document.createElement('canvas');canvas.width=64;canvas.height=128;const context=canvas.getContext('2d'),stream=canvas.captureStream(10),recorder=new MediaRecorder(stream,{mimeType:'video/webm'}),chunks=[];recorder.ondataavailable=event=>chunks.push(event.data);recorder.onstop=()=>{stream.getTracks().forEach(track=>track.stop());resolve(URL.createObjectURL(new Blob(chunks,{type:'video/webm'}))+'#video.webm');};recorder.start();context.fillRect(0,0,64,128);setTimeout(()=>{context.fillStyle='red';context.fillRect(0,0,64,128);},80);setTimeout(()=>recorder.stop(),180);});
        Object.assign(cf.ws.cards[5].areas[1],{width:undefined,height:undefined,resultUrl:cf.clip,history:[cf.clip],resultKind:'video'});
        Object.assign(cf.ws.cards[8].areas[1],{width:undefined,height:undefined,resultUrl:'/view?filename=portrait.png&rw=100&rh=220',history:['/view?filename=portrait.png&rw=100&rh=220']});
        cf.originalWidth=document.querySelector('#clab-panel').style.getPropertyValue('--clab-card-width');document.querySelector('#clab-panel').style.setProperty('--clab-card-width','320px');
        ui.state.workspaces.push(cf.ws);ui.applyWorkspaceToState(cf.ws);editHistory.withoutRecording(()=>document.dispatchEvent(new Event('clab_render_ui')));
        cf.panel=document.querySelector('#clab-panel');cf.container=cf.panel.querySelector('#clab-cards-container');cf.manager=cardWindow(cf.container);cf.root=id=>cf.container.querySelector('[data-area-id="'+id+'"]');cf.activity=(workspace,id)=>{cf.running.set(workspace.id,[{cardId:id,progress:50}]);document.dispatchEvent(new CustomEvent('clab_task_activity',{detail:{workspaceId:workspace.id,cardId:id}}));};
    })()`);await wait(150);
    try{
        const prepared=await evaluate(`(()=>{const root=cf.root('cf-text-5'),video=cf.root('cf-out-5');cf.preparedHeight=root.offsetHeight;return {prepared:root.hasAttribute('data-clab-layout'),height:root.offsetHeight,text:root.querySelector('textarea').style.height,src:video.querySelector('video')?.getAttribute('src'),videoBound:video.querySelector('video')?.dataset.clabBound};})()`);
        assert.equal(prepared.prepared,true);assert.ok(prepared.height>84,JSON.stringify(prepared));assert.equal(prepared.src,null);assert.notEqual(prepared.text,'');
        const videoHeight=await evaluate(`cf.root('cf-out-5').offsetHeight`);
        const heights=await evaluate(`new Promise(resolve=>{cf.manager.reveal('cf-card-5');const samples=[];let n=0;const sample=()=>{samples.push(cf.root('cf-text-5').offsetHeight);if(++n<8)requestAnimationFrame(sample);else resolve(samples);};requestAnimationFrame(sample);})`);
        assert.ok(Math.max(...heights)-Math.min(...heights)<=1,JSON.stringify(heights));assert.ok(Math.abs(heights[0]-prepared.height)<=1);assert.ok(Math.abs(await evaluate(`cf.root('cf-out-5').offsetHeight`)-videoHeight)<=1);
        const portrait=await evaluate(`cf.root('cf-out-8').offsetHeight`);const portraitFrames=await evaluate(`new Promise(resolve=>{cf.manager.reveal('cf-card-8');const heights=[];let count=0;const sample=()=>{heights.push(cf.root('cf-out-8').offsetHeight);if(++count<8)requestAnimationFrame(sample);else resolve(heights);};requestAnimationFrame(sample);})`);assert.ok(Math.max(...portraitFrames)-Math.min(...portraitFrames)<=1,JSON.stringify(portraitFrames));assert.ok(Math.abs(portrait-portraitFrames[0])<=1);
        await evaluate(`cf.manager.reveal('cf-card-50');cf.panel.style.setProperty('--clab-card-width','500px');window._clabUpdateCardsLayout();cf.manager.reveal('cf-card-5');`);await wait(120);
        assert.ok(await evaluate(`cf.root('cf-text-5').offsetHeight<cf.preparedHeight`));
        await evaluate(`cf.ws.cards[5].areas[0].autoHeight=false;window._clabSurgicallyUpdateArea('cf-text-5');cf.root('cf-text-5').querySelector('textarea').style.height='243px';cf.manager.reveal('cf-card-60');cf.manager.reveal('cf-card-5');`);await wait(100);assert.equal(await evaluate(`cf.root('cf-text-5').querySelector('textarea').style.height`),'243px');
        console.log('PASS buffered cards measure long text before activation, defer video sources and keep height stable across fast scrolling and width changes');

        assert.equal(await evaluate(`(()=>{const r=cf.panel.querySelector('.clab-task-ruler'),c=cf.container.getBoundingClientRect(),b=r.getBoundingClientRect();return r.children.length===100&&b.width<=c.width*2/3+1&&b.bottom<=c.bottom&&b.top>c.top+c.height*.8;})()`),true);
        if(process.env.CLAB_RULER_SCREENSHOT){const shot=await send('Page.captureScreenshot',{format:'png'},sessionId);fs.writeFileSync(process.env.CLAB_RULER_SCREENSHOT,Buffer.from(shot.data,'base64'));}
        await evaluate(`cf.ruler=cf.panel.querySelector('.clab-task-ruler');cf.ruler.children[10].dispatchEvent(new PointerEvent('pointerenter'));`);
        assert.deepEqual(await evaluate(`[8,9,10,11,12].map(i=>cf.ruler.children[i].style.getPropertyValue('--clab-ruler-scale'))`),['1.6','2.3','3','2.3','1.6']);
        await evaluate(`cf.ui.state.selectedAreaIds=['cf-text-5'];cf.ruler.children[99].click();`);await wait(1800);
        assert.equal(await evaluate(`!!cf.root('cf-text-99')&&cf.ui.state.selectedAreaIds.join()==='cf-text-5'`),true,JSON.stringify(await evaluate(`({left:cf.container.scrollLeft,width:cf.container.scrollWidth,selected:cf.ui.state.selectedAreaIds,last:!!cf.root('cf-text-99')})`)));
        const selected=await evaluate(`cf.ui.state.selectedAreaIds`);
        await evaluate(`cf.activity(cf.ws,'cf-card-20')`);await wait(60);
        assert.equal(await evaluate(`(()=>{const b=cf.root('cf-text-20').closest('.clab-card').getBoundingClientRect(),v=cf.container.getBoundingClientRect();return b.left>=v.left-1&&b.right<=v.right+1;})()`),true);assert.deepEqual(await evaluate(`cf.ui.state.selectedAreaIds`),selected);
        await evaluate(`cf.activity(cf.ws,'cf-card-40')`);await wait(60);assert.equal(await evaluate(`(()=>{const b=cf.root('cf-text-40').closest('.clab-card').getBoundingClientRect(),v=cf.container.getBoundingClientRect();return b.left>=v.left&&b.right<=v.right;})()`),true);
        await evaluate(`cf.setWorkspaceMode(cf.panel,'table');cf.activity(cf.ws,'cf-card-90');`);await wait(150);
        assert.equal(await evaluate(`(()=>{const row=cf.container.querySelector('[data-table-row="cf-card-90"]'),b=row.getBoundingClientRect(),v=cf.container.getBoundingClientRect();return cf.container.scrollTop>0&&b.top>=v.top&&b.bottom<=v.bottom;})()`),true);
        console.log('PASS horizontal task ruler shares hover waves, locates unloaded tasks without changing selection, and card/table run following keeps the running task visible');

        await evaluate(`(async()=>{
            const model=await import('/extensions/clab/components/workspace_modes/xy_model.js');cf.model=model;
            const xy={initialized:true,outputNodeId:'2',cameraReady:true,zoom:.5,panX:100,panY:300,x:{bindings:['921||x'],values:[1,2]},y:{bindings:['921||y'],values:[1,2]},z:{enabled:true,bindings:['921||z'],values:['one','two','three'],current:1,display:'single'}};
            cf.matrix=cf.ui.createEmptyWorkspace('Z运行跟随',{view:cf.createWorkspaceView({mode:'xy',xy})});model.synchronizeMatrix(cf.matrix.cards,cf.matrix.view.xy,[{key:'921||x',value:1},{key:'921||y',value:1},{key:'921||z',value:'one'}]);
            cf.ui.state.workspaces.push(cf.matrix);cf.ui.applyWorkspaceToState(cf.matrix);cf.editHistory.withoutRecording(()=>document.dispatchEvent(new Event('clab_render_ui')));
            const cells=model.matrixCells(cf.matrix.cards,cf.matrix.view.xy);cf.target=cells.find(cell=>cell.z===2&&cell.x===1&&cell.y===1).card.id;cf.originalZ={current:cf.matrix.view.xy.z.current,panX:cf.matrix.view.xy.panX,panY:cf.matrix.view.xy.panY,zoom:cf.matrix.view.xy.zoom};
            cf.ui.state.selectedAreaIds=[model.matrixOutput(cells.find(cell=>cell.z===1).card,cf.matrix.view.xy).id];cf.beforeSelection=[...cf.ui.state.selectedAreaIds];
            document.dispatchEvent(new CustomEvent('clab_execution_start',{detail:{tasks:[{cardId:cf.target}]}}));cf.activity(cf.matrix,cf.target);
        })()`);await wait(100);
        assert.equal(await evaluate(`cf.matrix.view.xy.z.current===2&&cf.matrix.view.xy.zoom===cf.originalZ.zoom&&cf.container.querySelector('.clab-card[data-card-id="'+cf.target+'"]').hidden===false&&JSON.stringify(cf.ui.state.selectedAreaIds)===JSON.stringify(cf.beforeSelection)`),true);
        await evaluate(`cf.hasWork=window.CLab.hasExecutionWork;cf.pending=true;window.CLab.hasExecutionWork=id=>cf.pending&&(!id||id===cf.matrix.id)||cf.hasWork?.(id);cf.running.set(cf.matrix.id,[]);window.testApi.emit('status',{exec_info:{queue_remaining:0}})`);await wait(300);
        assert.equal(await evaluate(`cf.matrix.view.xy.z.current===2`),true,'a brief empty backend queue must not restore XY while local tasks remain');
        await evaluate(`cf.pending=false;document.dispatchEvent(new Event('clab_execution_idle'));`);await wait(100);
        assert.equal(await evaluate(`cf.matrix.view.xy.z.current===cf.originalZ.current&&cf.matrix.view.xy.panX===cf.originalZ.panX&&cf.matrix.view.xy.panY===cf.originalZ.panY&&cf.matrix.view.xy.z.display==='single'`),true);
        console.log('PASS XY run following changes the active Z layer without changing selection or zoom, then restores the original layer and camera after the queue ends');
    }finally{
        await evaluate(`(()=>{cf.running.clear();URL.revokeObjectURL(cf.clip.split('#')[0]);window.CLab.getRunningCardProgress=cf.runningProgress;if(cf.hasWork)window.CLab.hasExecutionWork=cf.hasWork;cf.panel.style.setProperty('--clab-card-width',cf.originalWidth);cf.editHistory.withoutRecording(()=>{cf.ui.state.workspaces=cf.workspaces;cf.ui.applyWorkspaceToState(cf.original);window.testApp.graph._nodes=window.testApp.graph._nodes.filter(node=>node!==cf.node);document.dispatchEvent(new Event('clab_render_ui'));});})()`);
    }
    return 3;
}
