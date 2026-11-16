import assert from 'node:assert/strict';

export async function runTableTextSyncChecks(send,sessionId) {
    const evaluate=async expression=>{const result=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true},sessionId);assert.ok(!result.exceptionDetails,JSON.stringify(result.exceptionDetails));return result.result.value;};
    const wait=()=>evaluate('new Promise(resolve=>setTimeout(resolve,160))');
    await evaluate(`(async()=>{
        const ui=await import('/extensions/clab/components/ui_state.js');ui.syncStateToActiveWorkspace();
        window.ts={ui,original:ui.getActiveWorkspace(),workspaces:[...ui.state.workspaces],selected:[...ui.appState.selectedWorkspaceIds]};
        const {createWorkspaceView}=await import('/extensions/clab/components/workspace_modes/view_state.js');
        ts.ws=ui.createEmptyWorkspace('文字状态同步',{view:createWorkspaceView({table:{expandText:false}}),cards:Array.from({length:2},(_,i)=>({id:'sync-row-'+i,areas:[
            {id:'sync-text-'+i,type:'edit',title:'文字',dataType:'string',value:'long text\\n'.repeat(20),targetNodeId:'1',targetWidget:'text',targetWidgets:['1||text']},
            {id:'sync-image-'+i,type:'preview',title:'图片',targetNodeId:'2',resultUrl:'/view?filename=first.png',history:['/view?filename=first.png'],historyIndex:0}
        ]}))});ui.state.workspaces.push(ts.ws);ui.applyWorkspaceToState(ts.ws);ui.appState.selectedWorkspaceIds=[ts.ws.id];document.dispatchEvent(new Event('clab_render_ui'));
        const {setWorkspaceMode}=await import('/extensions/clab/components/workspace_modes/workspace_modes.js');ts.panel=document.querySelector('#clab-panel');setWorkspaceMode(ts.panel,'table');
    })()`);await wait();
    try {
        await evaluate(`(async()=>{
            const {closeXYPopover}=await import('/extensions/clab/components/workspace_modes/xy_popover.js');closeXYPopover();
            ts.ui.state.selectedCardIds=[];ts.ui.state.selectedAreaIds=ts.ws.cards.flatMap(card=>card.areas.map(area=>area.id));
            (await import('/extensions/clab/components/ui_selection.js')).updateSelectionUI();ts.panel.querySelector('#tb-table-cell-settings').click();
            document.querySelector('.clab-table-cell-panel [data-table-expand-text]').click();closeXYPopover();
            (await import('/extensions/clab/components/contextmenu/group_content.js')).openWorkspacePreview();
            document.querySelector('.clab-preview-modal.visible [data-review-mode=table]').click();
            ts.preview=()=>document.querySelector('.clab-preview-modal.visible');ts.toggle=()=>ts.preview().querySelector('.clab-preview-modal-right .clab-multi-settings:not([hidden]) [data-table-expand-text]')||ts.preview().querySelector('.clab-preview-modal-right [data-table-expand-text]');
            ts.textCell=()=>ts.preview().querySelector('[data-review-cell]');
        })()`);await wait();
        assert.equal(await evaluate(`ts.toggle().checked&&!ts.toggle().indeterminate&&ts.textCell().offsetHeight>350`),true,'preview checkbox must reflect effective cell expansion rather than the disabled table default');
        await evaluate('ts.toggle().click()');await wait();
        assert.equal(await evaluate(`!ts.toggle().checked&&!ts.toggle().indeterminate&&ts.textCell().offsetHeight===144`),true,'one click must collapse expanded cells');
        await evaluate(`ts.preview().querySelector('.clab-preview-modal-close').click()`);await wait();
        assert.equal(await evaluate(`ts.panel.querySelector('[data-area-id="sync-text-0"]').offsetHeight===144`),true,'preview collapse must return to the original workspace with correct precedence');
        await evaluate(`(async()=>{
            ts.ui.state.selectedAreaIds=[];ts.ui.state.selectedCardIds=[];
            (await import('/extensions/clab/components/ui_selection.js')).updateSelectionUI();ts.panel.querySelector('#tb-table-cell-settings').click();
            ts.workToggle=document.querySelector('.clab-table-cell-panel [data-table-expand-text]');
        })()`);await wait();
        assert.equal(await evaluate('!ts.workToggle.checked&&!ts.workToggle.indeterminate'),true,'workspace checkbox must match the collapsed preview');
        await evaluate(`(async()=>{
            ts.workToggle.click();(await import('/extensions/clab/components/workspace_modes/xy_popover.js')).closeXYPopover();
            (await import('/extensions/clab/components/contextmenu/group_content.js')).openWorkspacePreview();
            document.querySelector('.clab-preview-modal.visible [data-review-mode=table]').click();
        })()`);await wait();
        assert.equal(await evaluate(`ts.toggle().checked&&!ts.toggle().indeterminate&&ts.textCell().offsetHeight>350`),true,'reopening preview must preserve the latest table setting over older cell overrides');
        assert.deepEqual(await evaluate('window.testProgress.errors'),[]);
        console.log('PASS workspace selection expansion, preview checkbox, single-click collapse and reopened state stay synchronized');
    } finally {
        await evaluate(`(async()=>{document.querySelector('.clab-preview-modal.visible .clab-preview-modal-close')?.click();(await import('/extensions/clab/components/workspace_modes/xy_popover.js')).closeXYPopover();ts.ui.state.workspaces=ts.workspaces;ts.ui.applyWorkspaceToState(ts.original);ts.ui.appState.selectedWorkspaceIds=ts.selected;document.dispatchEvent(new Event('clab_render_ui'));})()`);
    }
}
