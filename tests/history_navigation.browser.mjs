import assert from 'node:assert/strict';

export async function runHistoryNavigationChecks(send,sessionId){
    const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true},sessionId);assert.equal(r.exceptionDetails,undefined,JSON.stringify(r.exceptionDetails));return r.result.value;};
    const wait=()=>evaluate('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
    const key=async redo=>{await evaluate('document.activeElement?.blur()');for(const type of ['keyDown','keyUp'])await send('Input.dispatchKeyEvent',{type,key:'z',code:'KeyZ',windowsVirtualKeyCode:90,modifiers:redo?10:2},sessionId);await wait();};
    await evaluate(`(async()=>{
        const ui=await import('/extensions/clab/components/ui_state.js'),{editHistory:history}=await import('/extensions/clab/components/edit_history_runtime.js'),{openWorkspacePreview:open}=await import('/extensions/clab/components/contextmenu/group_content.js'),{setWorkspaceMode:mode}=await import('/extensions/clab/components/workspace_modes/workspace_modes.js');
        ui.syncStateToActiveWorkspace();window.hn={ui,history,open,mode,original:ui.getActiveWorkspace(),workspaces:[...ui.state.workspaces]};
        hn.ws=ui.createEmptyWorkspace('撤销定位',{id:'history-navigation',view:{mode:'table'},cards:[{id:'hn-task',title:'定位任务',areas:[{id:'hn-input',type:'edit',title:'输入文字',value:'原值',dataType:'string',targetNodeId:'1',targetWidget:'text',targetWidgets:['1||text']},{id:'hn-output',type:'preview',title:'图片',targetNodeId:'2',history:['/view?filename=first.png'],resultUrl:'/view?filename=first.png',historyIndex:0}]}]});
        ui.state.workspaces.push(hn.ws);ui.applyWorkspaceToState(hn.ws);document.dispatchEvent(new Event('clab_render_ui'));hn.history.reset();hn.open();
    })()`);await wait();
    try{
        await evaluate(`(()=>{const button=document.querySelector('.clab-preview-modal [data-review-column-name]');button.dispatchEvent(new MouseEvent('dblclick',{bubbles:true}));const input=button.parentElement.querySelector('input');input.value='共享列名';input.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));document.querySelector('.clab-preview-modal-close').click();})()`);await key();
        assert.equal(await evaluate(`!document.querySelector('.clab-preview-modal.visible')&&hn.ws.cards[0].areas[0].title==='输入文字'&&document.querySelector('#clab-panel').dataset.workspaceMode==='table'`),true);await key(true);
        console.log('PASS shared table edits undo in the current interface without reopening their original preview');

        await evaluate(`(()=>{hn.open();hn.history.reset();const input=document.querySelector('[data-table-size=width]');input.value='330';input.dispatchEvent(new Event('change',{bubbles:true}));document.querySelector('.clab-preview-modal-close').click();hn.mode(document.querySelector('#clab-panel'),'cards');})()`);await wait();await key();
        assert.equal(await evaluate(`document.querySelector('.clab-preview-modal.visible')?.dataset.reviewMode==='table'&&hn.ws.view.mode==='cards'&&hn.ws.view.table.sheets[0].columnWidth!==330`),true);await key(true);
        assert.equal(await evaluate(`hn.ws.view.table.sheets[0].columnWidth===330&&document.querySelector('.clab-preview-modal.visible').dataset.reviewMode==='table'`),true);
        console.log('PASS hidden table sizing opens the corresponding preview table once, preserves workspace type and supports redo in place');

        await evaluate(`(()=>{document.querySelector('[data-review-mode=detail]').click();hn.history.reset();window.hnColumns=Number(document.querySelector('[data-detail-setting=columns]').value);const input=document.querySelector('[data-detail-setting=columns]');input.value=hnColumns===4?5:4;input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));document.querySelector('.clab-preview-modal-close').click();})()`);await key();
        assert.equal(await evaluate(`document.querySelector('.clab-preview-modal.visible')?.dataset.reviewMode==='detail'&&Number(document.querySelector('[data-detail-setting=columns]').value)===hnColumns`),true);await key(true);
        console.log('PASS detail-only layout changes automatically return from workspace to detail on undo and redo');

        await evaluate(`(()=>{const field=document.querySelector('.clab-detail-field');field.dispatchEvent(new MouseEvent('click',{bubbles:true}));hn.history.reset();window.hnField=field.dataset.detailField;const input=document.querySelector('[data-detail-style=size]');window.hnSize=Number(input.value);input.value=24;input.dispatchEvent(new Event('change',{bubbles:true}));document.querySelector('[data-review-mode=browse]').click();})()`);await key();
        assert.equal(await evaluate(`document.querySelector('.clab-preview-modal.visible').dataset.reviewMode==='detail'&&document.querySelector('.clab-detail-field.selected')?.dataset.detailField===hnField&&Number(document.querySelector('[data-detail-style=size]').value)===hnSize`),true);
        console.log('PASS invisible field formatting returns to detail and reveals the affected field instead of silently consuming undo');

        await evaluate(`(()=>{document.querySelector('.clab-preview-modal-close').click();hn.history.reset();const input=document.querySelector('[data-area-id=hn-input] textarea');input.value='参数修改';input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));hn.open();document.querySelector('[data-review-mode=browse]').click();})()`);
        await evaluate(`(async()=>{(await import('/extensions/clab/ui_panel.js')).togglePanel()})()`);await key();
        assert.equal(await evaluate(`!document.querySelector('.clab-preview-modal.visible')&&hn.ws.cards[0].areas[0].value==='原值'&&document.querySelector('#clab-panel.visible').dataset.workspaceMode==='cards'&&hn.ui.state.activeWorkspaceId===hn.ws.id`),true);
        console.log('PASS current input edits leave history-only browsing for the original workspace without crossing workspace histories');
    }finally{await evaluate(`document.querySelector('.clab-preview-modal.visible .clab-preview-modal-close')?.click();hn.ui.state.workspaces=hn.workspaces;hn.ui.applyWorkspaceToState(hn.original);document.dispatchEvent(new Event('clab_render_ui'));hn.history.reset();`);}
    return 5;
}
