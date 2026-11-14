import assert from 'node:assert/strict';

export async function runViewportChecks(send,sessionId){
    const evaluate=async expression=>{new Function(expression);const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true},sessionId);assert.equal(r.exceptionDetails,undefined,JSON.stringify(r.exceptionDetails));return r.result.value;};
    const wait=ms=>evaluate(`new Promise(resolve=>setTimeout(resolve,${ms}))`);
    const waitFor=expression=>evaluate(`new Promise((resolve,reject)=>{const end=performance.now()+2500;const check=()=>{if(${expression})resolve();else if(performance.now()>end)reject(new Error('visible component did not finish loading'));else requestAnimationFrame(check);};check();})`);
    await evaluate(`(async()=>{
        const ui=await import('/extensions/clab/components/ui_state.js'),{createWorkspaceView}=await import('/extensions/clab/components/workspace_modes/view_state.js'),{setWorkspaceMode}=await import('/extensions/clab/components/workspace_modes/workspace_modes.js'),{editHistory}=await import('/extensions/clab/components/edit_history_runtime.js'),{workspaceViewport}=await import('/extensions/clab/components/workspace_modes/viewport_components.js');
        ui.syncStateToActiveWorkspace();window.vp={ui,createWorkspaceView,setWorkspaceMode,editHistory,workspaceViewport,original:ui.getActiveWorkspace(),workspaces:[...ui.state.workspaces],execute:window.CLab.executeTasks};
        vp.panel=document.querySelector('#clab-panel');vp.container=vp.panel.querySelector('#clab-cards-container');const {attachCardWheel}=await import('/extensions/clab/components/events/card_wheel.js');const {workspacePreferences}=await import('/extensions/clab/components/workspace_preferences.js');vp.wheelController=attachCardWheel(vp.panel,vp.container);vp.node={id:711,type:'Sampler',widgets:[{name:'x',type:'number',value:0},{name:'y',type:'number',value:0}]};window.testApp.graph._nodes.push(vp.node);
        vp.ws=ui.createEmptyWorkspace('视口测试',{view:createWorkspaceView(),cards:Array.from({length:100},(_,i)=>({id:'vp-card-'+i,title:'任务 '+i,areas:[...['x','y'].map((name,j)=>({id:'vp-input-'+i+'-'+j,type:'edit',title:name,value:i,autoHeight:false,dataType:'number',targetNodeId:'711',targetWidget:name,targetWidgets:['711||'+name]})),{id:'vp-out-'+i,type:'preview',title:'图片',targetNodeId:'2',history:['/view?filename=first.png'],resultUrl:'/view?filename=first.png',historyIndex:0,mediaSize:{url:'/view?filename=first.png',width:160,height:90}}]}))});
        Object.assign(vp.ws.cards[1].areas[2],{resultKind:'audio',resultUrl:'/view?filename=sample.wav',history:['/view?filename=sample.wav']});ui.state.workspaces.push(vp.ws);ui.applyWorkspaceToState(vp.ws);editHistory.withoutRecording(()=>document.dispatchEvent(new Event('clab_render_ui')));
        vp.wrapper=()=>vp.container.querySelector('.clab-cards-wrapper');vp.root=id=>vp.wrapper().querySelector('[data-area-id="'+id+'"]');vp.wheel=(target,delta=100,deltaMode=0)=>target.dispatchEvent(new WheelEvent('wheel',{bubbles:true,cancelable:true,deltaY:delta,deltaMode}));
    })()`);await wait(150);
    try{
        assert.equal(await evaluate(`vp.container.hasAttribute('data-clab-virtualized')&&vp.wrapper().querySelectorAll('textarea').length<50&&vp.ws.cards.length===100&&!vp.root('vp-input-99-0')`),true);
        await evaluate(`vp.firstImage=vp.root('vp-out-0').querySelector('img');vp.audio=vp.root('vp-out-1').querySelector('audio');vp.audio.currentTime=.375;vp.audio.volume=.4;vp.audio.playbackRate=1.5;`);
        await evaluate(`(async()=>{const {workspacePreferences}=await import('/extensions/clab/components/workspace_preferences.js');vp.step=vp.wrapper().querySelector('.clab-card').offsetWidth+workspacePreferences.cardGap;vp.wheel(vp.wrapper().querySelector('.clab-card-title-bar'));await new Promise(resolve=>requestAnimationFrame(()=>{vp.firstMotion=vp.container.scrollLeft;resolve();}));})()`);
        assert.equal(await evaluate('vp.firstMotion>0&&vp.firstMotion<100'),true,JSON.stringify(await evaluate('({firstMotion:vp.firstMotion})')));await wait(350);
        assert.ok(Math.abs(await evaluate('vp.container.scrollLeft')-100)<1,JSON.stringify(await evaluate('({left:vp.container.scrollLeft,step:vp.step})')));
        await evaluate(`vp.before=vp.container.scrollLeft;vp.wheel(vp.wrapper().querySelector('.clab-card-title-bar'));`);await wait(40);
        await evaluate(`vp.body=[...vp.wrapper().querySelectorAll('.clab-card-body')].find(body=>{const b=body.getBoundingClientRect(),v=vp.container.getBoundingClientRect();return b.left<v.right&&b.right>v.left&&body.scrollHeight>body.clientHeight+5;});if(!vp.body){vp.body=vp.wrapper().querySelectorAll('.clab-card-body')[2];vp.body.style.maxHeight='200px';}vp.bodyBefore=vp.body.scrollTop;vp.wheel(vp.body);`);await wait(350);
        assert.equal(await evaluate('vp.body.scrollTop===vp.bodyBefore&&Math.abs(vp.container.scrollLeft-vp.before-200)<1'),true);
        await evaluate('vp.wheel(vp.body)');await wait(50);assert.equal(await evaluate('vp.body.scrollTop>vp.bodyBefore'),true);await wait(300);
        await evaluate(`vp.before=vp.container.scrollLeft;vp.wheel(vp.wrapper().querySelector('.clab-card-title-bar'),25);`);await wait(350);
        assert.ok(Math.abs(await evaluate('vp.container.scrollLeft-vp.before')-25)<1);
        await evaluate(`vp.before=vp.container.scrollLeft;vp.wheel(vp.wrapper().querySelector('.clab-card-title-bar'),3,1);`);await wait(350);
        assert.ok(Math.abs(await evaluate('vp.container.scrollLeft-vp.before')-54)<1);
        await evaluate(`vp.before=vp.container.scrollLeft;vp.wheel(vp.wrapper().querySelector('.clab-card-title-bar'),100);`);await wait(30);
        await evaluate(`vp.reversedAt=vp.container.scrollLeft;vp.wheel(vp.wrapper().querySelector('.clab-card-title-bar'),-20);`);await wait(350);
        assert.ok(Math.abs(await evaluate('vp.container.scrollLeft-vp.reversedAt')+20)<1);
        console.log('PASS wheel distance stays proportional to pixel/line input, eases between frames, reverses promptly and locks outer scrolling until idle');

        await evaluate(`vp.container.scrollLeft=vp.container.scrollWidth;`);await wait(300);
        assert.equal(await evaluate(`!vp.root('vp-input-0-0')&&!!vp.root('vp-input-99-0').querySelector('textarea')`),true);
        await evaluate(`(async()=>{vp.ws.cards[0].areas[0].value=777;const {surgicallyUpdateArea}=await import('/extensions/clab/components/comp_modulearea.js');surgicallyUpdateArea('vp-input-0-0');vp.container.scrollLeft=0;})()`);await wait(300);assert.equal(await evaluate(`!!vp.root('vp-out-0').querySelector('img')&&vp.root('vp-input-0-0').querySelector('textarea').value==='777'&&Math.abs(vp.root('vp-out-1').querySelector('audio').currentTime-.375)<.01`),true);
        for(let i=10;i<100;i+=10){await evaluate(`vp.container.scrollLeft=vp.step*${i}`);await wait(35);}
        await evaluate('vp.container.scrollLeft=0');await waitFor(`(()=>{const audio=vp.root('vp-out-1')?.querySelector('audio');return audio&&Math.abs(audio.currentTime-.375)<.01&&Math.abs(audio.volume-.4)<.01&&audio.playbackRate===1.5;})()`);assert.equal(await evaluate(`(()=>{const audio=vp.root('vp-out-1').querySelector('audio');return audio!==vp.audio&&audio.paused;})()`),true);
        await evaluate(`vp.setWorkspaceMode(vp.panel,'table')`);await wait(150);
        assert.equal(await evaluate(`vp.wrapper().querySelectorAll('textarea').length<50&&vp.root('vp-input-99-0').matches('[data-clab-virtual],[data-clab-deferred]')`),true);
        await evaluate('vp.container.scrollTop=vp.container.scrollHeight');await waitFor(`!!vp.root('vp-input-99-0').querySelector('textarea')`);
        assert.equal(await evaluate(`!!vp.root('vp-input-99-0').querySelector('textarea')&&!vp.root('vp-input-0-0').querySelector('textarea')`),true,JSON.stringify(await evaluate(`({last:vp.root('vp-input-99-0').outerHTML.slice(0,500),first:vp.root('vp-input-0-0').outerHTML.slice(0,500),left:vp.container.scrollLeft,top:vp.container.scrollTop,ready:vp.wrapper().querySelectorAll('textarea').length,lastBox:vp.root('vp-input-99-0').getBoundingClientRect().toJSON(),container:vp.container.getBoundingClientRect().toJSON(),height:vp.container.scrollHeight})`)));
        await evaluate(`(async()=>{vp.ui.state.selectedAreaIds=vp.ws.cards.flatMap(card=>card.areas.map(area=>area.id));vp.ui.state.selectedCardIds=[];const {updateSelectionUI}=await import('/extensions/clab/components/ui_selection.js');updateSelectionUI();window.CLab.executeTasks=tasks=>vp.queue=tasks;vp.panel.querySelector('#clab-btn-run').click();})()`);await wait(80);
        assert.equal(await evaluate('vp.queue.length===100&&vp.wrapper().querySelectorAll("textarea").length<50'),true);
        await evaluate(`vp.setWorkspaceMode(vp.panel,'cards')`);await wait(300);assert.equal(await evaluate(`!!vp.root('vp-input-0-0').querySelector('textarea')&&!vp.root('vp-input-0-0').querySelector('.clab-table-number')&&!vp.root('vp-input-0-0').querySelector('textarea').readOnly`),true);
        console.log('PASS 100-task card/table views mount only nearby controls, preserve recycled media state and run selected tasks outside the viewport');

        await evaluate(`(async()=>{const area=vp.ws.cards[99].areas[0],node=window.testApp.graph._nodes.find(node=>node.type==='LoadImage');Object.assign(area,{targetNodeId:String(node.id),targetWidget:'image',targetWidgets:[node.id+'||image'],dataType:'combo'});const {surgicallyUpdateArea}=await import('/extensions/clab/components/comp_modulearea.js');surgicallyUpdateArea(area.id);vp.ui.state.selectedAreaIds=[area.id];document.activeElement?.blur();const files=new DataTransfer();files.items.add(new File(['sample'],'viewport.png',{type:'image/png'}));document.dispatchEvent(new ClipboardEvent('paste',{bubbles:true,cancelable:true,clipboardData:files}));})()`);await wait(150);assert.equal(await evaluate(`String(vp.ws.cards[99].areas[0].value).startsWith('uploaded')`),true);

        await evaluate(`(async()=>{
            const model=await import('/extensions/clab/components/workspace_modes/xy_model.js'),{projectXYCanvas}=await import('/extensions/clab/components/workspace_modes/xy_axes.js');vp.project=projectXYCanvas;
            const xy={initialized:true,outputNodeId:'2',x:{bindings:['711||x'],values:Array.from({length:10},(_,i)=>i)},y:{bindings:['711||y'],values:Array.from({length:10},(_,i)=>i)}};vp.matrix=vp.ui.createEmptyWorkspace('矩阵视口',{view:vp.createWorkspaceView({mode:'xy',xy})});vp.model=model;
            model.synchronizeMatrix(vp.matrix.cards,vp.matrix.view.xy,[{key:'711||x',name:'x',value:0},{key:'711||y',name:'y',value:0}]);
            vp.matrix.cards.forEach(card=>{const area=model.matrixOutput(card,vp.matrix.view.xy);area.history=['/view?filename=first.png'];area.resultUrl=area.history[0];area.historyIndex=0;area.mediaSize={url:area.resultUrl,width:160,height:90};});
            vp.ui.state.workspaces.push(vp.matrix);vp.ui.applyWorkspaceToState(vp.matrix);vp.editHistory.withoutRecording(()=>document.dispatchEvent(new Event('clab_render_ui')));
        })()`);await wait(150);
        assert.equal(await evaluate(`vp.wrapper().querySelectorAll('.clab-virtual-summary').length>50&&vp.wrapper().querySelectorAll('.clab-output-settings-trigger').length<5`),true,JSON.stringify(await evaluate(`({summaries:vp.wrapper().querySelectorAll('.clab-virtual-summary').length,full:vp.wrapper().querySelectorAll('.clab-output-settings-trigger').length,cards:vp.matrix.cards.length,zoom:vp.matrix.view.xy.zoom,box:vp.wrapper().querySelector('.clab-card')?.getBoundingClientRect().toJSON()})`)));
        await evaluate(`const cell=vp.wrapper().querySelector('.clab-card');cell.dispatchEvent(new MouseEvent('click',{bubbles:true,button:0}));`);await wait(80);
        assert.equal(await evaluate(`vp.ui.state.selectedAreaIds.length===1&&!!vp.root(vp.ui.state.selectedAreaIds[0]).querySelector('.clab-output-settings-trigger')`),true);
        await evaluate(`Object.assign(vp.matrix.view.xy,{zoom:1,panX:-120,panY:-40});vp.project(vp.container,vp.matrix.view.xy);`);await wait(300);
        assert.equal(await evaluate(`vp.wrapper().querySelectorAll('.clab-output-settings-trigger').length<40&&vp.wrapper().querySelectorAll('img').length<40&&vp.matrix.cards.length===100&&vp.matrix.cards.every(card=>vp.model.matrixOutput(card,vp.matrix.view.xy).history.length===1)`),true,JSON.stringify(await evaluate(`({full:vp.wrapper().querySelectorAll('.clab-output-settings-trigger').length,images:vp.wrapper().querySelectorAll('img').length,cards:vp.matrix.cards.length,histories:vp.matrix.cards.map(card=>vp.model.matrixOutput(card,vp.matrix.view.xy).history.length),zoom:vp.matrix.view.xy.zoom})`)));
        assert.equal(await evaluate(`vp.panel.querySelector('[data-clab-viewport-cache]').children.length<=64`),true);
        console.log('PASS XY overview uses lightweight summaries and zoom/pan activates only nearby full previews while retaining all 100 output histories');
    }finally{
        await evaluate(`(()=>{window.CLab.executeTasks=vp.execute;vp.editHistory.withoutRecording(()=>{vp.ui.state.workspaces=vp.workspaces;vp.ui.applyWorkspaceToState(vp.original);window.testApp.graph._nodes=window.testApp.graph._nodes.filter(node=>node!==vp.node);document.dispatchEvent(new Event('clab_render_ui'));});})()`);
    }
    return 3;
}
