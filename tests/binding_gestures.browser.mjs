import assert from 'node:assert/strict';

export async function runBindingGestureChecks(send,sessionId){
    const evaluate=async expression=>{
        const result=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true},sessionId);
        assert.equal(result.exceptionDetails,undefined,JSON.stringify(result.exceptionDetails));return result.result.value;
    };
    const wait=ms=>evaluate(`new Promise(resolve=>setTimeout(resolve,${ms}))`);
    const mouse=(type,point,button='middle',buttons=button==='middle'?4:1)=>send('Input.dispatchMouseEvent',{type,button,buttons,clickCount:1,...point},sessionId);
    const center=selector=>evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e)throw Error('Missing binding: '+${JSON.stringify(selector)});const r=e.getBoundingClientRect();return{x:(r.left+r.right)/2,y:(r.top+r.bottom)/2};})()`);
    const click=async(selector,button='middle')=>{const point=await center(selector);await mouse('mouseMoved',point,button,0);await mouse('mousePressed',point,button);await mouse('mouseReleased',point,button,0);};
    const finish=async(nodeId,parameter='',button=0)=>{
        await wait(130);
        await evaluate(`(()=>{const node=document.createElement('div');node.className=${nodeId?'"lg-node"':'"pick-cancel"'};node.dataset.nodeId=${JSON.stringify(String(nodeId))};node.innerHTML='<div class="lg-node-widget"><label></label></div>';node.querySelector('label').textContent=${JSON.stringify(parameter)};document.body.append(node);const target=${parameter?'node.querySelector("label")':'node'};for(const type of ['pointerdown','pointerup'])target.dispatchEvent(new PointerEvent(type,{bubbles:true,button:${button},pointerId:71}));node.remove();})()`);await wait(230);
        assert.equal(await evaluate(`g.panel.classList.contains('visible')&&!g.ui.appState.isBindingMode`),true);
    };
    const pick=async(selector,nodeId,parameter='',button=0)=>{
        await click(selector);assert.equal(await evaluate(`g.ui.appState.isBindingMode&&!g.panel.classList.contains('visible')`),true,'middle click did not enter picking on '+selector);
        await finish(nodeId,parameter,button);
    };
    await evaluate(`(async()=>{
        const ui=await import('/extensions/clab/components/ui_state.js'),{createWorkspaceView}=await import('/extensions/clab/components/workspace_modes/view_state.js'),model=await import('/extensions/clab/components/workspace_modes/xy_model.js'),{editHistory}=await import('/extensions/clab/components/edit_history_runtime.js');
        ui.syncStateToActiveWorkspace();window.g={ui,createWorkspaceView,model,editHistory,original:ui.getActiveWorkspace(),workspaces:[...ui.state.workspaces],canvasGraph:window.testApp.canvas.graph,panel:document.querySelector('#clab-panel')};
        const numeric=id=>({id,title:'参数 '+id,widgets:[{name:'x',type:'number',value:1},{name:'y',type:'number',value:2},{name:'z',type:'number',value:3},{name:'cfg',type:'number',value:7}]});
        g.nodes=[numeric(951),numeric(952),{id:953,type:'SaveImage',title:'输出 A',widgets:[]},{id:954,type:'SaveImage',title:'输出 B',widgets:[]}];window.testApp.graph._nodes.push(...g.nodes);window.testApp.canvas.graph=window.testApp.graph;
        g.show=ws=>{if(!ui.state.workspaces.includes(ws))ui.state.workspaces.push(ws);ui.applyWorkspaceToState(ws);editHistory.withoutRecording(()=>document.dispatchEvent(new Event('clab_render_ui')));};
        g.table=ui.createEmptyWorkspace('中键表格',{cards:[0,1].map(i=>({id:'pick-card-'+i,areas:[{id:'pick-in-'+i,type:'edit',value:20+i,dataType:'number',targetNodeId:'951',targetWidget:'x',targetWidgets:['951||x']},{id:'pick-out-'+i,type:'preview',targetNodeId:'953',history:['/view?filename=first.png'],historyIndex:0,resultUrl:'/view?filename=first.png'}]}))});g.show(g.table);
    })()`);await wait(180);
    try{
        const colors=await evaluate(`(()=>{const bar=g.panel.querySelector('.clab-card-progress-bar');bar.style.width='40%';const normal=getComputedStyle(bar).backgroundImage;bar.classList.add('error');const error=getComputedStyle(bar);const result={normal,errorImage:error.backgroundImage,errorColor:error.backgroundColor};bar.classList.remove('error');return result;})()`);
        assert.ok(colors.normal.startsWith('linear-gradient(')&&colors.normal.includes('rgb(255, 83, 112)')&&colors.normal.includes('rgb(198, 120, 221)'));
        assert.equal(colors.errorImage,'none');assert.equal(colors.errorColor,'rgb(244, 67, 54)');
        console.log('PASS task progress uses the matrix rainbow palette while workflow errors remain solid red');

        await evaluate(`(async()=>{const {setWorkspaceMode}=await import('/extensions/clab/components/workspace_modes/workspace_modes.js');setWorkspaceMode(g.panel,'table');})()`);await wait(180);
        const input='.clab-table-column[data-table-index="0"] .clab-module-binding-summary',output='.clab-table-column[data-table-index="1"] .clab-module-binding-summary';
        await pick(input,952,'x');
        assert.equal(await evaluate(`g.table.cards.every(card=>card.areas[0].targetWidgets.join()==='952||x'&&card.areas[0].value===20+Number(card.id.slice(-1)))&&!document.querySelector('.clab-module-binding-popover:popover-open')`),true);
        await pick(input,951,'cfg',2);assert.equal(await evaluate(`g.table.cards.every(card=>card.areas[0].targetWidgets.join()==='952||x,951||cfg')`),true);
        await pick(output,954);assert.equal(await evaluate(`g.table.cards.every(card=>card.areas[1].targetNodeId==='954'&&card.areas[1].history.length===1)`),true);
        await pick(input,0);assert.equal(await evaluate(`g.table.cards.every(card=>card.areas[0].targetWidgets.join()==='952||x,951||cfg')`),true);
        await click(input,'left');await wait(40);await click('.clab-binding-start-pick','left');await finish(952,'y');
        assert.equal(await evaluate(`!!document.querySelector('.clab-module-binding-popover:popover-open')&&g.table.cards.every(card=>card.areas[0].targetWidgets.join()==='952||y')`),true);await click('.clab-xy-popup-close','left');
        console.log('PASS table header middle-pick replaces/appends whole-column bindings, preserves values and history, supports cancel, and the existing panel picker still reopens');

        await evaluate(`(()=>{g.xy=g.ui.createEmptyWorkspace('中键矩阵',{view:g.createWorkspaceView({mode:'xy',xy:{initialized:true,x:{bindings:['951||x'],values:[1,2]},y:{bindings:['951||y'],values:[2,3]},z:{enabled:true,bindings:['951||z'],values:[3,4]},outputNodeId:'953'}})});g.model.synchronizeMatrix(g.xy.cards,g.xy.view.xy,[]);g.show(g.xy);})()`);await wait(180);
        for(const key of ['x','y','z']){
            const before=await evaluate(`({x:g.xy.view.xy.panX,y:g.xy.view.xy.panY,zoom:g.xy.view.xy.zoom})`);
            await pick('[data-xy-bind="'+key+'"]',952,key);
            assert.deepEqual(await evaluate(`g.xy.view.xy[${JSON.stringify(key)}].bindings`),['952||'+key]);
            assert.deepEqual(await evaluate(`({x:g.xy.view.xy.panX,y:g.xy.view.xy.panY,zoom:g.xy.view.xy.zoom})`),before);
            assert.equal(await evaluate(`!!document.querySelector('.clab-module-binding-popover:popover-open')`),false);
        }
        await pick('[data-xy-bind="x"]',951,'cfg',2);assert.deepEqual(await evaluate(`g.xy.view.xy.x.bindings`),['952||x','951||cfg']);
        await pick('[data-xy-bind="output"]',954);assert.equal(await evaluate(`g.xy.view.xy.outputNodeId`),'954');
        await pick('[data-xy-bind="y"]',0);assert.deepEqual(await evaluate(`g.xy.view.xy.y.bindings`),['952||y']);
        await pick('[data-xy-bind="z"]',952);assert.equal(await evaluate(`document.querySelector('.clab-binding-panel-foot')?.textContent.includes('请选择参数')`),true);await click('[data-xy-parameter="952||z"]','left');await click('.clab-xy-popup-close','left');
        const pan=await evaluate(`({x:g.xy.view.xy.panX,y:g.xy.view.xy.panY})`),point=await center('.clab-card:not([hidden]) .clab-preview-bg');
        await mouse('mousePressed',point);await mouse('mouseMoved',{x:point.x+30,y:point.y+18});await mouse('mouseReleased',{x:point.x+30,y:point.y+18},'middle',0);
        assert.equal(await evaluate(`!g.ui.appState.isBindingMode&&(g.xy.view.xy.panX!==${pan.x}||g.xy.view.xy.panY!==${pan.y})`),true);
        console.log('PASS native middle clicks pick X/Y/Z and output bindings without panning, preserve append/cancel/node-only flows, and middle dragging grid cells still pans');
    }finally{
        await evaluate(`(()=>{window.testApp.canvas.graph=g.canvasGraph;window.testApp.graph._nodes=window.testApp.graph._nodes.filter(node=>!g.nodes.includes(node));g.editHistory.withoutRecording(()=>{g.ui.state.workspaces=g.workspaces;g.ui.applyWorkspaceToState(g.original);document.dispatchEvent(new Event('clab_render_ui'));});})()`);
    }
}
