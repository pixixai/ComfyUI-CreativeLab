import assert from 'node:assert/strict';

export async function runRulerJumpChecks(send,sessionId){
    const evaluate=async expression=>{new Function(expression);const r=await send('Runtime.evaluate',{expression:'(0,eval)('+JSON.stringify(expression)+')',awaitPromise:true,returnByValue:true},sessionId);assert.equal(r.exceptionDetails,undefined,JSON.stringify(r.exceptionDetails));return r.result.value;};
    const wait=ms=>evaluate(`new Promise(resolve=>setTimeout(resolve,${ms}))`);
    await evaluate(`(async()=>{
        const ui=await import('/extensions/clab/components/ui_state.js'),{editHistory}=await import('/extensions/clab/components/edit_history_runtime.js');ui.syncStateToActiveWorkspace();window.rj={ui,editHistory,original:ui.getActiveWorkspace(),workspaces:[...ui.state.workspaces]};
        rj.node={id:931,type:'Text',widgets:Array.from({length:6},(_,i)=>({name:'v'+i,type:'text',value:''}))};window.testApp.graph._nodes.push(rj.node);
        rj.ws=ui.createEmptyWorkspace('刻度跳转性能',{cards:Array.from({length:100},(_,i)=>({id:'rj-card-'+i,title:'任务 '+(i+1),areas:[...Array.from({length:6},(_,j)=>({id:'rj-input-'+i+'-'+j,type:'edit',title:'参数 '+j,autoHeight:true,dataType:'string',targetNodeId:'931',targetWidget:'v'+j,targetWidgets:['931||v'+j],value:'multi-line value '+i+' / '+j+String.fromCharCode(10)+'test text '.repeat(60)})),...Array.from({length:2},(_,j)=>({id:'rj-output-'+i+'-'+j,type:'preview',targetNodeId:'2',matchMedia:true,width:320,height:180,history:['/view?filename=rj-'+i+'-'+j+'.png'],historyIndex:0,resultUrl:'/view?filename=rj-'+i+'-'+j+'.png'}))]}))});
        ui.state.workspaces.push(rj.ws);ui.applyWorkspaceToState(rj.ws);editHistory.withoutRecording(()=>document.dispatchEvent(new Event('clab_render_ui')));rj.panel=document.querySelector('#clab-panel');rj.container=rj.panel.querySelector('#clab-cards-container');rj.wrapper=()=>rj.container.querySelector('.clab-cards-wrapper');rj.button=i=>rj.panel.querySelector('.clab-task-ruler [data-task-ruler="rj-card-'+i+'"]');
        rj.jump=index=>new Promise(resolve=>{
            const created=new Set(),positions=[],stages=[];let largest=0,preparedWhileMoving=false;const observer=new MutationObserver(records=>{for(const record of records)for(const node of record.addedNodes)if(node.nodeType===1&&node.matches('.clab-card'))created.add(node.dataset.cardId);});observer.observe(rj.wrapper(),{childList:true});
            const start=performance.now();rj.button(index).click();const afterClick=performance.now(),immediate=!!rj.wrapper().querySelector('[data-card-id="rj-card-'+index+'"]');let stable=0,last=-1;
            const check=()=>{const current=rj.container.scrollLeft;positions.push(current);stages.push(rj.container.dataset.clabCardJumpStage||'done');largest=Math.max(largest,rj.wrapper().querySelectorAll('.clab-card').length);if(rj.container.hasAttribute('data-clab-card-jump')&&rj.wrapper().querySelector('[data-card-id="rj-card-'+index+'"] textarea'))preparedWhileMoving=true;if(Math.abs(current-last)<1)stable++;else stable=0;last=current;const root=rj.wrapper().querySelector('[data-card-id="rj-card-'+index+'"]');if(root&&stable>=3&&!rj.container.hasAttribute('data-clab-card-jump')&&root.querySelector('textarea')){observer.disconnect();resolve({ms:performance.now()-start,handlerMs:afterClick-start,created:[...created],immediate,positions,stages,largest,preparedWhileMoving,count:rj.wrapper().querySelectorAll('.clab-card').length});}else if(performance.now()-start>10000){observer.disconnect();resolve({timeout:true,ms:performance.now()-start,created:[...created]});}else requestAnimationFrame(check);};requestAnimationFrame(check);
        });
    })()`);await wait(150);
    try{
        const result=await evaluate('rj.jump(49)');console.log('PROGRESSIVE ruler jump 1→50 '+JSON.stringify(result));assert.equal(result.timeout,undefined);
        assert.equal(result.immediate,false);assert.ok(result.handlerMs<50);assert.ok(result.positions.length>3);assert.ok(result.positions.some(left=>left>0&&left<result.positions.at(-1)));
        assert.equal(result.preparedWhileMoving,false);assert.ok(result.positions[0]>0&&result.positions[0]<340);assert.ok(result.stages.includes('out')&&result.stages.includes('arrival'));assert.equal(result.positions.filter((left,i)=>i&&Math.abs(left-result.positions[i-1])>1000).length,1);assert.ok(result.largest<=35);assert.ok(result.count<20);
        const nearby=await evaluate('rj.jump(50)');assert.ok(nearby.stages.includes('near')&&!nearby.stages.includes('out'));assert.ok(nearby.positions.every((left,i)=>!i||Math.abs(left-nearby.positions[i-1])<340));
        const repeat=await evaluate('rj.jump(0)');assert.equal(repeat.timeout,undefined);assert.ok(repeat.count<20);
        await evaluate(`rj.button(70).click()`);await wait(65);await evaluate(`rj.button(10).click()`);await wait(700);
        assert.equal(await evaluate(`!!rj.wrapper().querySelector('[data-card-id="rj-card-10"] textarea')&&!rj.wrapper().querySelector('[data-card-id="rj-card-70"]')&&!rj.container.hasAttribute('data-clab-card-jump')`),true);
        await evaluate(`rj.button(80).click()`);await wait(50);await evaluate(`rj.container.dispatchEvent(new WheelEvent('wheel',{bubbles:true,cancelable:true,deltaY:-30}));rj.stopped=rj.container.scrollLeft;`);await wait(450);
        assert.equal(await evaluate(`!rj.container.hasAttribute('data-clab-card-jump')&&rj.container.scrollLeft<rj.stopped+1`),true);
        await evaluate(`rj.button(90).click()`);await wait(50);
        await evaluate(`rj.ui.state.cards.splice(90,1);rj.editHistory.withoutRecording(()=>document.dispatchEvent(new Event('clab_render_ui')));`);await wait(150);
        assert.equal(await evaluate(`!rj.container.hasAttribute('data-clab-card-jump')&&!rj.wrapper().querySelector('[data-card-id="rj-card-90"]')`),true);
        console.log('PASS ruler motion starts without synchronous content creation, keeps controls out of animation frames and skips the distant middle section and cancels obsolete destinations or wheel-interrupted jumps');
    }finally{await evaluate(`(()=>{rj.editHistory.withoutRecording(()=>{rj.ui.state.workspaces=rj.workspaces;rj.ui.applyWorkspaceToState(rj.original);window.testApp.graph._nodes=window.testApp.graph._nodes.filter(node=>node!==rj.node);document.dispatchEvent(new Event('clab_render_ui'));});})()`);}
    return 1;
}
