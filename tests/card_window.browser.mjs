import assert from 'node:assert/strict';

export async function runCardWindowChecks(send,sessionId){
    const evaluate=async expression=>{new Function(expression);const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true},sessionId);assert.equal(r.exceptionDetails,undefined,JSON.stringify(r.exceptionDetails));return r.result.value;};
    const wait=ms=>evaluate(`new Promise(resolve=>setTimeout(resolve,${ms}))`);
    const until=expression=>evaluate(`new Promise((resolve,reject)=>{const end=performance.now()+2500;const check=()=>{if(${expression})resolve();else if(performance.now()>end)reject(new Error('moved module was not activated'));else setTimeout(check,16);};check();})`);
    await evaluate(`(async()=>{
        const ui=await import('/extensions/clab/components/ui_state.js'),{editHistory}=await import('/extensions/clab/components/edit_history_runtime.js'),{cardWindow}=await import('/extensions/clab/components/workspace_modes/card_window.js'),{workspacePreferences}=await import('/extensions/clab/components/workspace_preferences.js');
        ui.syncStateToActiveWorkspace();window.cw={ui,editHistory,cardWindow,workspacePreferences,original:ui.getActiveWorkspace(),workspaces:[...ui.state.workspaces],execute:window.CLab.executeTasks,buffer:workspacePreferences.cardBuffer};
        cw.node={id:811,type:'Text',widgets:Array.from({length:4},(_,i)=>({name:'v'+i,type:'text',value:'initial'}))};window.testApp.graph._nodes.push(cw.node);
        cw.ws=ui.createEmptyWorkspace('卡片窗口测试',{cards:Array.from({length:1000},(_,i)=>({id:'cw-card-'+i,title:'任务 '+i,areas:[...Array.from({length:4},(_,j)=>({id:'cw-area-'+i+'-'+j,type:'edit',title:'参数 '+j,value:i+' / '+j,autoHeight:false,dataType:'string',targetNodeId:'811',targetWidget:'v'+j,targetWidgets:['811||v'+j]})),{id:'cw-out-'+i,type:'preview',targetNodeId:'2',history:['/view?filename=first.png'],resultUrl:'/view?filename=first.png',historyIndex:0,mediaSize:{url:'/view?filename=first.png',width:160,height:90}}]}))});
        ui.state.workspaces.push(cw.ws);ui.applyWorkspaceToState(cw.ws);editHistory.withoutRecording(()=>document.dispatchEvent(new Event('clab_render_ui')));
        cw.panel=document.querySelector('#clab-panel');cw.container=cw.panel.querySelector('#clab-cards-container');cw.wrapper=()=>cw.container.querySelector('.clab-cards-wrapper');cw.root=id=>cw.wrapper().querySelector('[data-area-id="'+id+'"]');cw.card=id=>cw.wrapper().querySelector('.clab-card[data-card-id="'+id+'"]');cw.manager=cardWindow(cw.container);
        cw.select=(root,shift=false)=>root.dispatchEvent(new MouseEvent('mousedown',{bubbles:true,button:0,shiftKey:shift}));
    })()`);await wait(100);
    try{
        assert.equal(await evaluate(`cw.wrapper().querySelectorAll('.clab-card').length<15&&!cw.card('cw-card-99')&&cw.container.scrollWidth>300000&&cw.ws.cards.length===1000`),true);
        await evaluate(`(async()=>{const {cardWindowRange}=await import('/extensions/clab/components/workspace_modes/card_window_geometry.js');const width=parseFloat(getComputedStyle(cw.panel).getPropertyValue('--clab-card-width'))||cw.workspacePreferences.cardWidth;const range=left=>JSON.stringify(cardWindowRange(1000,left,cw.container.clientWidth,width,cw.workspacePreferences.cardGap,cw.workspacePreferences.cardBuffer));cw.stableLeft=Array.from({length:300},(_,i)=>i+20).find(left=>range(left)===range(left+30));cw.container.scrollLeft=cw.stableLeft;})()`);await wait(160);
        await evaluate(`cw.positionWrites=0;cw.observer=new MutationObserver(records=>{cw.positionWrites+=records.length;});cw.observer.observe(cw.wrapper(),{attributes:true,attributeFilter:['data-card-window-start','data-card-window-end']});cw.container.scrollLeft=cw.stableLeft+10;`);await wait(60);
        await evaluate(`cw.container.scrollLeft=cw.stableLeft+20;`);await wait(60);
        assert.equal(await evaluate(`cw.observer.disconnect();cw.positionWrites`),0,'scrolling inside the same window must not reconcile card positions');
        await evaluate(`cw.container.scrollLeft=0;`);await wait(60);
        await evaluate(`cw.select(cw.root('cw-area-0-0'));cw.manager.reveal('cw-card-99');`);await wait(80);
        assert.equal(await evaluate(`!cw.card('cw-card-0')&&!!cw.card('cw-card-99')`),true);
        await evaluate(`cw.select(cw.root('cw-area-99-3'),true)`);await wait(40);
        assert.equal(await evaluate(`cw.ui.state.selectedAreaIds.length===400&&cw.ui.state.selectedAreaIds.includes('cw-area-50-2')&&cw.wrapper().querySelectorAll('.clab-card').length<20`),true);
        await evaluate(`window.CLab.executeTasks=tasks=>cw.queue=tasks;cw.panel.querySelector('#clab-btn-run').click();`);
        assert.equal(await evaluate(`cw.queue.length===100&&cw.queue[0].cardId==='cw-card-0'&&cw.queue.at(-1).cardId==='cw-card-99'`),true);
        await evaluate(`cw.manager.reveal('cw-card-0')`);await wait(60);
        assert.equal(await evaluate(`cw.root('cw-area-0-0').classList.contains('selected')`),true);
        console.log('PASS 1000 stored tasks create only the card viewport and buffers; Shift selects 400 modules across 100 tasks and runs all selected tasks');

        await evaluate(`cw.manager.reveal('cw-card-500');cw.workspacePreferences.cardBuffer=0;document.dispatchEvent(new Event('clab_card_buffer_change'));`);await wait(60);
        const small=await evaluate(`cw.wrapper().querySelectorAll('.clab-card').length`);
        await evaluate(`cw.workspacePreferences.cardBuffer=8;document.dispatchEvent(new Event('clab_card_buffer_change'));`);await wait(60);
        const big=await evaluate(`cw.wrapper().querySelectorAll('.clab-card').length`);assert.equal(big-small,16);
        await evaluate(`cw.workspacePreferences.cardBuffer=5;document.dispatchEvent(new Event('clab_card_buffer_change'));cw.manager.reveal('cw-card-500');`);await wait(50);
        await evaluate(`cw.field=cw.root('cw-area-500-0').querySelector('textarea');cw.field.focus();cw.field.value='kept while offscreen';cw.field.dispatchEvent(new Event('input',{bubbles:true}));cw.manager.reveal('cw-card-900');`);await wait(70);
        assert.equal(await evaluate(`cw.field.isConnected&&document.activeElement===cw.field&&cw.wrapper().querySelectorAll('.clab-card').length<20`),true);
        await evaluate(`cw.field.blur();cw.manager.reveal('cw-card-500');`);await wait(60);
        assert.equal(await evaluate(`cw.root('cw-area-500-0').querySelector('textarea').value==='kept while offscreen'`),true);
        console.log('PASS buffer changes apply immediately, while active editing survives offscreen scrolling and values survive card recycling');

        await evaluate(`(async()=>{cw.ui.state.selectedAreaIds=[];cw.ui.state.selectedCardIds=['cw-card-0','cw-card-500'];cw.manager.reveal('cw-card-500');const {updateSelectionUI}=await import('/extensions/clab/components/ui_selection.js');updateSelectionUI();})()`);
        await evaluate(`(()=>{cw.dragSource=cw.card('cw-card-500');cw.transfer=new DataTransfer();cw.dragSource.querySelector('.clab-card-title-bar').dispatchEvent(new DragEvent('dragstart',{bubbles:true,cancelable:true,dataTransfer:cw.transfer}));cw.manager.reveal('cw-card-800');cw.dragBefore=cw.container.scrollLeft;const r=cw.container.getBoundingClientRect();cw.container.dispatchEvent(new DragEvent('dragover',{bubbles:true,cancelable:true,dataTransfer:cw.transfer,clientX:r.right-2,clientY:r.top+80}));})()`);await wait(100);
        assert.equal(await evaluate(`cw.container.scrollLeft>cw.dragBefore&&cw.dragSource.isConnected&&cw.wrapper().querySelectorAll('.clab-card').length<20`),true);
        await evaluate(`(()=>{const target=cw.card('cw-card-800'),r=target.getBoundingClientRect(),options={bubbles:true,cancelable:true,dataTransfer:cw.transfer,clientX:r.right-10,clientY:r.top+15};target.dispatchEvent(new DragEvent('dragover',options));target.dispatchEvent(new DragEvent('drop',options));cw.dragSource.dispatchEvent(new DragEvent('dragend',{bubbles:true}));})()`);await wait(70);
        assert.equal(await evaluate(`(()=>{const i=cw.ui.state.cards.findIndex(card=>card.id==='cw-card-800');return cw.ui.state.cards[i+1].id==='cw-card-0'&&cw.ui.state.cards[i+2].id==='cw-card-500';})()`),true);
        await evaluate(`(()=>{cw.ui.state.selectedCardIds=[];cw.ui.state.selectedAreaIds=['cw-area-50-0','cw-area-500-0'];cw.moduleSource=cw.root('cw-area-500-0');cw.transfer=new DataTransfer();cw.moduleSource.dispatchEvent(new DragEvent('dragstart',{bubbles:true,cancelable:true,dataTransfer:cw.transfer}));cw.manager.reveal('cw-card-900');const target=cw.root('cw-area-900-1'),r=target.getBoundingClientRect(),options={bubbles:true,cancelable:true,dataTransfer:cw.transfer,clientX:r.left+30,clientY:r.top+2};target.dispatchEvent(new DragEvent('dragover',options));target.dispatchEvent(new DragEvent('drop',options));cw.moduleSource.dispatchEvent(new DragEvent('dragend',{bubbles:true}));})()`);await wait(80);
        await until(`!!cw.root('cw-area-50-0')?.querySelector('textarea')`);
        assert.equal(await evaluate(`(()=>{const target=cw.ui.state.cards.find(card=>card.id==='cw-card-900');return target.areas.some(area=>area.id==='cw-area-50-0')&&target.areas.some(area=>area.id==='cw-area-500-0')&&!!cw.root('cw-area-50-0').querySelector('textarea')&&!cw.ui.state.cards.find(card=>card.id==='cw-card-50').areas.some(area=>area.id==='cw-area-50-0');})()`),true);
        console.log('PASS edge dragging loads new cards, reorders offscreen-selected tasks and moves offscreen-selected modules without losing their data');
        await evaluate(`(async()=>{cw.ui.state.selectedAreaIds=[];cw.ui.state.selectedCardIds=['cw-card-0','cw-card-500'];cw.manager.reveal('cw-card-500');const {updateSelectionUI}=await import('/extensions/clab/components/ui_selection.js');updateSelectionUI();})()`);
        await evaluate(`cw.panel.querySelector('#tb-clone-btn').click()`);await wait(120);
        assert.equal(await evaluate(`cw.ws.cards.length===1002&&cw.ui.state.selectedCardIds.length===2&&cw.ui.state.selectedCardIds.every(id=>!id.startsWith('cw-card-'))&&cw.wrapper().querySelectorAll('.clab-card').length<20`),true);
        await evaluate(`cw.panel.querySelector('#clab-global-add-card').click()`);await wait(100);
        assert.equal(await evaluate(`cw.ws.cards.length===1003&&!!cw.card(cw.ui.state.activeCardId)`),true);
        console.log('PASS cloning tasks outside the viewport and creating new tasks preserve bounded card counts and reveal the new selection');
        await evaluate(`(async()=>{cw.deleted=cw.ui.state.cards.slice(-200).map(card=>card.id);cw.ui.state.selectedCardIds=cw.deleted;cw.ui.state.selectedAreaIds=[];cw.manager.reveal(cw.deleted.at(-1));const {updateSelectionUI}=await import('/extensions/clab/components/ui_selection.js');updateSelectionUI();cw.card(cw.deleted.at(-1)).querySelector('.clab-del-card-btn').click();})()`);await wait(80);
        assert.equal(await evaluate(`cw.ui.state.cards.length===803&&cw.ws.archivedTasks.length>0&&cw.wrapper().querySelectorAll('.clab-card').length>0&&cw.wrapper().querySelectorAll('.clab-card').length<20`),true);
        for(const type of ['keyDown','keyUp'])await send('Input.dispatchKeyEvent',{type,key:'z',code:'KeyZ',windowsVirtualKeyCode:90,modifiers:2},sessionId);await wait(100);
        assert.equal(await evaluate(`cw.ui.state.cards.length===1003&&cw.ws.archivedTasks.length===0&&cw.wrapper().querySelectorAll('.clab-card').length<20`),true);
        console.log('PASS deleting 200 tasks near the list end retains a valid viewport and undo restores all tasks and histories');
    }finally{
        await evaluate(`(()=>{window.CLab.executeTasks=cw.execute;cw.workspacePreferences.cardBuffer=cw.buffer;cw.editHistory.withoutRecording(()=>{cw.ui.state.workspaces=cw.workspaces;cw.ui.applyWorkspaceToState(cw.original);window.testApp.graph._nodes=window.testApp.graph._nodes.filter(node=>node!==cw.node);document.dispatchEvent(new Event('clab_render_ui'));});})()`);
    }
    return 5;
}
