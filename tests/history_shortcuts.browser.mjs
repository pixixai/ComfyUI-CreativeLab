import assert from 'node:assert/strict';

export async function runHistoryShortcutChecks(send,sessionId){
    const evaluate=async expression=>{
        const result=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true},sessionId);
        assert.equal(result.exceptionDetails,undefined,JSON.stringify(result.exceptionDetails));return result.result.value;
    };
    const wait=()=>evaluate('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
    const key=async(redo=false,blur=true)=>{
        if(blur)await evaluate('document.activeElement?.blur()');
        for(const type of ['keyDown','keyUp'])await send('Input.dispatchKeyEvent',{type,key:'z',code:'KeyZ',windowsVirtualKeyCode:90,modifiers:redo?10:2},sessionId);
        await wait();
    };
    await evaluate(`(async()=>{
        const ui=await import('/extensions/clab/components/ui_state.js'),{editHistory:history}=await import('/extensions/clab/components/edit_history_runtime.js');
        ui.syncStateToActiveWorkspace();window.shortcutHistory={ui,history,workspaces:[...ui.state.workspaces],original:ui.getActiveWorkspace()};
        const a=ui.createEmptyWorkspace('快捷键检查1',{id:'shortcut-one',view:{mode:'cards'}});ui.state.workspaces.push(a);ui.applyWorkspaceToState(a);document.dispatchEvent(new Event('clab_render_ui'));history.reset();
        document.querySelector('#clab-global-add-card').click();document.querySelector('#clab-global-add-module').click();
        document.querySelector('#clab-workspace-add').click();shortcutHistory.second=ui.state.activeWorkspaceId;
        document.querySelector('#clab-global-add-card').click();document.querySelector('#clab-global-add-module').click();hostHistory.calls=hostHistory.scheduled=0;
    })()`);await wait();
    try{
        for(let n=0;n<5;n++)await key();
        assert.equal(await evaluate('hostHistory.calls'),0,'the host capture listener queued native workflow undo before plugin interception');
        assert.equal(await evaluate(`shortcutHistory.ui.state.activeWorkspaceId===shortcutHistory.second&&shortcutHistory.ui.state.workspaces.some(ws=>ws.id===shortcutHistory.second)&&shortcutHistory.ui.getActiveWorkspace().cards.length===0&&shortcutHistory.ui.state.workspaces.find(ws=>ws.id==='shortcut-one').cards[0].areas.length===1`),true);
        for(let n=0;n<5;n++)await key(true);
        assert.equal(await evaluate(`hostHistory.calls===0&&hostHistory.scheduled>=10&&shortcutHistory.ui.state.activeWorkspaceId===shortcutHistory.second&&shortcutHistory.ui.getActiveWorkspace().cards.length===1&&shortcutHistory.ui.getActiveWorkspace().cards[0].areas.length===1`),true);
        console.log('PASS the exact two-workspace add-task/add-module sequence exhausts undo/redo without deleting a workspace or executing queued ComfyUI history');

        await evaluate(`document.querySelector('#clab-panel .clab-area textarea.clab-edit-val').focus()`);
        await send('Input.insertText',{text:'native editor'},sessionId);await key(false,false);
        assert.equal(await evaluate(`hostHistory.calls===0&&document.querySelector('#clab-panel .clab-area textarea.clab-edit-val').value===''&&shortcutHistory.ui.getActiveWorkspace().cards[0].areas.length===1`),true);
        await key(true,false);assert.equal(await evaluate(`hostHistory.calls===0&&document.querySelector('#clab-panel .clab-area textarea.clab-edit-val').value==='native editor'`),true);
        console.log('PASS editable text keeps native undo while earlier queued workflow shortcuts remain blocked');

        await evaluate(`(async()=>{document.activeElement?.blur();(await import('/extensions/clab/ui_panel.js')).togglePanel()})()`);await key();
        assert.equal(await evaluate('hostHistory.calls'),1,'closed plugin panels must leave native workflow history available');
        await evaluate(`(async()=>{(await import('/extensions/clab/ui_panel.js')).togglePanel()})()`);
        await evaluate(`(()=>{const event=new KeyboardEvent('keydown',{key:'z',ctrlKey:true,bubbles:true,cancelable:true});window.dispatchEvent(event);document.querySelector('#clab-panel').classList.remove('visible');})()`);await wait();
        assert.equal(await evaluate('hostHistory.calls'),1,'a shortcut claimed while open must stay claimed if the panel closes before its queued frame');
        await evaluate(`document.querySelector('#clab-panel').classList.add('visible')`);
        console.log('PASS closed panels preserve ComfyUI undo, and previously claimed events cannot leak after the panel closes');
    }finally{
        await evaluate(`shortcutHistory.ui.state.workspaces=shortcutHistory.workspaces;shortcutHistory.ui.applyWorkspaceToState(shortcutHistory.original);document.querySelector('#clab-panel').classList.add('visible');document.dispatchEvent(new Event('clab_render_ui'));shortcutHistory.history.reset();`);
    }
    return 3;
}
