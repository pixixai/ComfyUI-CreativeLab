import assert from 'node:assert/strict';

export async function runXYEditingChecks(send,sessionId) {
    const evaluate=async expression=>{const result=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true},sessionId);assert.equal(result.exceptionDetails,undefined,JSON.stringify(result.exceptionDetails));return result.result.value;};
    const click=async selector=>{
        const p=await evaluate(`(async()=>{const element=document.querySelector(${JSON.stringify(selector)});element.scrollIntoView({block:'nearest',inline:'nearest'});await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));const r=element.getBoundingClientRect(),x=(r.left+r.right)/2,y=(r.top+r.bottom)/2;return{x,y,hit:element.contains(document.elementFromPoint(x,y)),target:document.elementFromPoint(x,y)?.outerHTML,rect:{left:r.left,right:r.right,top:r.top,bottom:r.bottom}};})()`);
        assert.equal(p.hit,true,`native editor click missed ${selector}: ${JSON.stringify(p)}`);
        await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:p.x,y:p.y},sessionId);
        for(const type of ['mousePressed','mouseReleased'])await send('Input.dispatchMouseEvent',{type,x:p.x,y:p.y,button:'left',clickCount:1},sessionId);
    };
    const type=async(selector,text)=>{await click(selector);for(const type of ['keyDown','keyUp'])await send('Input.dispatchKeyEvent',{type,key:'a',code:'KeyA',windowsVirtualKeyCode:65,modifiers:2},sessionId);await send('Input.insertText',{text},sessionId);};
    await evaluate(`window.showXYZDemo();document.querySelector('[data-xy-reset]').click();window.editHistoryBefore=window.xyzModeDemo.cards.map(card=>({card,output:card.areas.find(area=>area.id===card.xyOutputId),history:JSON.stringify(card.areas.find(area=>area.id===card.xyOutputId).history)}));`);
    await click('.axis-x');await type('[data-xy-values=x]','20, 30');await click('.clab-xy-values h4');await click('.clab-xy-popup-close');await click('.axis-x');
    assert.equal(await evaluate(`(async()=>{const {buildPersistedState}=await import('/extensions/clab/components/ui_state.js'),{createWorkspaceView}=await import('/extensions/clab/components/workspace_modes/view_state.js');const saved=buildPersistedState().workspaces.find(workspace=>workspace.id===window.xyzModeDemo.id);return document.querySelector('[data-xy-values=x]').value==='20, 30'&&saved.view.xy.x.inputText==='20, 30'&&createWorkspaceView(saved.view).xy.x.inputText==='20, 30';})()`),true);
    await type('[data-xy-values=x]','20，30');await click('.clab-xy-values h4');await click('.clab-xy-popup-close');await click('.axis-x');assert.equal(await evaluate(`document.querySelector('[data-xy-values=x]').value`),'20，30');
    console.log('PASS numeric syntax and formatting-only edits survive panel reopen and workflow persistence');
    await click('[data-xy-value-tab=order]');await click('[data-xy-order-remove="0"]');
    assert.equal(await evaluate(`document.querySelectorAll('[data-xy-order-index]').length===1&&window.xyzModeDemo.view.xy.x.values.join(',')==='30'&&document.querySelector('[data-xy-values=x]').value==='30'`),true);
    await click('[data-xy-order-remove="0"]');assert.equal(await evaluate(`window.xyzModeDemo.view.xy.x.values.length===0&&document.querySelector('[data-xy-values=x]').value===''&&document.querySelector('[data-xy-value-count]').textContent==='0'&&!document.querySelector('[data-xy-order-index]')&&window.editHistoryBefore.every(({card,output,history})=>window.xyzModeDemo.cards.includes(card)&&card.areas.includes(output)&&JSON.stringify(output.history)===history)`),true);
    await click('[data-xy-value-tab=input]');await type('[data-xy-values=x]','20,30');await click('.clab-xy-popup-close');
    console.log('PASS removing values including the final entry writes back to input without deleting archived tasks or histories');
    await click('.axis-y');await click('[data-xy-value-tab=order]');
    const removed=await evaluate(`window.xyzModeDemo.view.xy.y.values[0]`);await click('[data-xy-order-remove="0"]');await click('[data-xy-value-tab=input]');
    assert.equal(await evaluate(`(()=>{const input=[...document.querySelectorAll('[data-xy-choice]')].find(input=>input.closest('label').textContent.includes(${JSON.stringify(removed)}));return input&&!input.checked&&document.querySelectorAll('[data-xy-choice]').length===2;})()`),true);await click('.clab-xy-popup-close');
    await evaluate(`window.xyzModeDemo.view.xy.y.bindings=['110||enabled'];window.xyzModeDemo.view.xy.y.values=[true,false];delete window.xyzModeDemo.view.xy.y.inputText;window.showXYZDemo();document.querySelector('[data-xy-reset]').click();`);
    await click('.axis-y');await click('[data-xy-value-tab=order]');await click('[data-xy-order-remove="1"]');await click('[data-xy-value-tab=input]');
    assert.equal(await evaluate(`window.xyzModeDemo.view.xy.y.values.length===1&&window.xyzModeDemo.view.xy.y.values[0]===true&&document.querySelector('[data-xy-choice="0:0"]').checked&&!document.querySelector('[data-xy-choice="0:1"]').checked`),true);await click('[data-xy-choice="0:1"]');await click('.clab-xy-popup-close');
    console.log('PASS removing fixed choices and booleans unchecks available options and allows adding them back');
    await evaluate(`window.showXYZPromptDemo();document.querySelector('[data-xy-reset]').click();window.editTupleBefore=window.xyzPromptDemo.view.xy.x.values;`);
    await click('.axis-x');await click('[data-xy-value-tab=order]');await click('[data-xy-order-remove="1"]');
    assert.equal(await evaluate(`JSON.stringify(window.xyzPromptDemo.view.xy.x.values)===JSON.stringify([window.editTupleBefore[0]])&&JSON.stringify(JSON.parse(document.querySelector('[data-xy-values=x]').value))===JSON.stringify([window.editTupleBefore[0]])`),true);await click('.clab-xy-popup-close');
    console.log('PASS grouped multiline text removal preserves the remaining full typed tuple in both editor modes');
    await evaluate(`window.showXYZDemo();document.querySelector('[data-xy-reset]').click();window.editLayerBefore=window.xyzModeDemo.view.xy.z.display;`);
    await click('[data-xy-toggle-layers]');const display=await evaluate(`window.xyzModeDemo.view.xy.z.display`);
    assert.equal(await evaluate(`document.activeElement!==document.querySelector('[data-xy-toggle-layers]')`),true);
    for(const [key,code,windowsVirtualKeyCode]of [[' ','Space',32],['Enter','Enter',13]]){
        await evaluate(`document.querySelector('[data-xy-toggle-layers]').focus()`);
        for(const type of ['keyDown','keyUp'])await send('Input.dispatchKeyEvent',{type,key,code,windowsVirtualKeyCode},sessionId);
        assert.equal(await evaluate(`window.xyzModeDemo.view.xy.z.display`),display);
    }
    await click('[data-xy-toggle-layers]');assert.equal(await evaluate(`window.xyzModeDemo.view.xy.z.display===window.editLayerBefore`),true);
    console.log('PASS flat-layer toggle releases mouse focus and ignores native Space/Enter activation');
    await evaluate(`window.editCreateNode=window.CLab.createNode;window.editCreateCount=0;window.CLab.createNode=()=>{window.editCreateCount++;window.editCreateNode();};`);
    await click('[data-xy-config]');assert.equal(await evaluate(`window.editCreateCount===1&&window.testApp.graph._nodes.filter(node=>node.type==='CLab_SystemConfig').length===1`),true);await evaluate(`window.CLab.createNode=window.editCreateNode`);
    await click('[data-xy-config-options]');assert.equal(await evaluate(`(()=>{const p=document.querySelector('.clab-xy-options:popover-open'),a=document.querySelector('[data-xy-config-options]').getBoundingClientRect();return p.querySelectorAll('[data-xy-option]').length===2&&p.getBoundingClientRect().bottom<a.top;})()`),true);
    await evaluate(`(()=>{const output=window.xyzModeDemo.cards[0].areas.find(area=>area.id===window.xyzModeDemo.cards[0].xyOutputId);window.editMaintOutput=output;window.editMaintHistory=[...output.history];output.history.push('/view?filename=missing/nested.png');output.historyRuns??=[];output.historyRuns.push({id:'missing'});output.inputHistorySnapshots??=[];output.inputHistorySnapshots.push(null);})()`);
    await click('.clab-xy-options [data-xy-option=clean]');
    assert.equal(await evaluate(`new Promise(resolve=>{let attempts=0;const check=()=>{if(!window.editMaintOutput.history.some(url=>url.includes('missing/')))resolve(true);else if(++attempts>150)resolve(false);else setTimeout(check,20);};check();})`),true);
    assert.equal(await evaluate(`JSON.stringify(window.editMaintOutput.history)===JSON.stringify(window.editMaintHistory)&&window.editMaintOutput.historyRuns.length===window.editMaintOutput.history.length&&window.editMaintOutput.inputHistorySnapshots.length===window.editMaintOutput.history.length`),true);
    await click('[data-xy-config-options]');await click('.clab-xy-options [data-xy-option=resync]');
    assert.equal(await evaluate(`new Promise(resolve=>{let attempts=0;const check=()=>{if(window.editMaintOutput.history.length&&window.editMaintOutput.history.every(url=>new URL(url,location.origin).searchParams.has('t')))resolve(true);else if(++attempts>150)resolve(false);else setTimeout(check,20);};check();})`),true);
    await evaluate(`window.xyzModeDemo.view.xy.y.bindings=['110||sampler'];window.xyzModeDemo.view.xy.y.values=['Euler','DPM'];delete window.xyzModeDemo.view.xy.y.inputText;window.showXYZDemo();document.querySelector('[data-xy-reset]').click();`);
    console.log('PASS XY anchor uses the existing creation action and its upward menu runs shared cleanup/resync with aligned histories');
    return 6;
}
