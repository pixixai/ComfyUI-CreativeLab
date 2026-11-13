import assert from 'node:assert/strict';

export async function runWorkspaceHistoryChecks(send,sessionId){
    const evaluate=async expression=>{
        const result=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true},sessionId);
        assert.equal(result.exceptionDetails,undefined,JSON.stringify(result.exceptionDetails));return result.result.value;
    };
    const wait=()=>evaluate('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
    const key=async(redo=false)=>{
        await evaluate('document.activeElement?.blur()');
        for(const type of ['keyDown','keyUp'])await send('Input.dispatchKeyEvent',{type,key:'z',code:'KeyZ',windowsVirtualKeyCode:90,modifiers:redo?10:2},sessionId);
        await wait();
    };
    const show=async name=>{await evaluate(`wh.ui.syncStateToActiveWorkspace();wh.ui.applyWorkspaceToState(wh.${name});document.dispatchEvent(new Event('clab_render_ui'));`);await wait();};
    const edit=async text=>{await evaluate(`(()=>{const input=document.querySelector('[data-area-id=wh-input] textarea');input.value=${JSON.stringify(text)};input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));})()`);await wait();};
    const title=async(text,group='')=>{await evaluate(`(()=>{const header=document.querySelector('.clab-preview-modal ${group} [data-review-column-name]');header.dispatchEvent(new MouseEvent('pointerdown',{bubbles:true}));header.dispatchEvent(new MouseEvent('dblclick',{bubbles:true}));const input=header.parentElement.querySelector('input');input.value=${JSON.stringify(text)};input.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));})()`);await wait();};
    await evaluate(`(async()=>{
        const ui=await import('/extensions/clab/components/ui_state.js'),{editHistory:history}=await import('/extensions/clab/components/edit_history_runtime.js'),{openWorkspacePreview:open}=await import('/extensions/clab/components/contextmenu/group_content.js');
        ui.syncStateToActiveWorkspace();window.wh={ui,history,open,workspaces:[...ui.state.workspaces],original:ui.getActiveWorkspace()};
        const card={id:'wh-card',title:'任务',areas:[{id:'wh-input',type:'edit',title:'文本',value:'原值',targetNodeId:'1',targetWidget:'text',targetWidgets:['1||text'],dataType:'string'},
            {id:'wh-output',type:'preview',title:'图片',targetNodeId:'2',history:['/view?filename=first.png','/view?filename=second.png'],historyIndex:0,resultUrl:'/view?filename=first.png'}]};
        wh.a=ui.createEmptyWorkspace('工作区一',{id:'wh-a',cards:[card],view:{mode:'table'}});wh.b=ui.createEmptyWorkspace('工作区二',{id:'wh-b',cards:[structuredClone(card)],view:{mode:'table'}});ui.state.workspaces.push(wh.a,wh.b);
    })()`);
    try{
        await show('a');await show('b');await show('a');await evaluate('wh.history.reset()');await edit('一号编辑');await show('b');await edit('二号编辑');
        await show('a');await key();assert.deepEqual(await evaluate('[wh.a.cards[0].areas[0].value,wh.b.cards[0].areas[0].value]'),['原值','二号编辑']);
        await show('b');await key();await key(true);await show('a');await key(true);
        assert.deepEqual(await evaluate('[wh.a.cards[0].areas[0].value,wh.b.cards[0].areas[0].value]'),['一号编辑','二号编辑']);
        console.log('PASS real table Ctrl+Z and redo remain independent across workspaces with identical task/module IDs');

        await evaluate('wh.history.reset();wh.open()');await wait();
        await evaluate(`(()=>{const input=[...document.querySelectorAll('[data-grid-filter=column]')].at(-1);input.checked=false;input.dispatchEvent(new Event('change',{bubbles:true}));})()`);await title('预览列名');await key();
        assert.deepEqual(await evaluate(`({title:wh.a.cards[0].areas[0].title,hidden:![...document.querySelectorAll('[data-grid-filter=column]')].at(-1).checked})`),{title:'文本',hidden:true});
        await key(true);await evaluate(`document.querySelector('.clab-preview-modal-close').click()`);await key();assert.equal(await evaluate('wh.a.cards[0].areas[0].title'),'文本');
        await edit('工作区新值');await evaluate('wh.open()');await wait();await key();assert.equal(await evaluate('wh.a.cards[0].areas[0].value'),'一号编辑');
        console.log('PASS preview and workspace edits share one workspace history, preserve source filters and support undo in either interface');

        await evaluate(`document.querySelector('[data-preview-add-sources]').click();const check=document.querySelector('.clab-preview-source-picker input[value=wh-b]');check.checked=true;check.dispatchEvent(new Event('change',{bubbles:true}));document.querySelector('.clab-preview-source-picker').hidePopover();wh.history.reset();`);await wait();
        await title('二号预览列名','[data-preview-grid-workspace=wh-b]');
        assert.equal(await evaluate(`document.querySelector('.clab-preview-modal').dataset.editWorkspaceId`),'wh-b');await key();
        assert.deepEqual(await evaluate('[wh.a.cards[0].areas[0].title,wh.b.cards[0].areas[0].title]'),['文本','文本']);
        await key(true);assert.equal(await evaluate('wh.b.cards[0].areas[0].title'),'二号预览列名');
        console.log('PASS multi-source preview undo follows the workspace containing the selected table instead of affecting its neighbor');

        await evaluate(`(()=>{document.querySelector('.clab-review-multi-grid').click();wh.history.reset();const input=document.querySelector('.clab-multi-settings:not([hidden]) [data-table-size=width]');input.dispatchEvent(new MouseEvent('pointerdown',{bubbles:true}));input.value='320';input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));})()`);await wait();await key();
        assert.equal(await evaluate(`wh.a.view.table.sheets[0].columnWidth!==320&&wh.b.view.table.sheets[0].columnWidth===320`),true,'undo of a batch preview setting must change only its workspace');
        await evaluate(`document.querySelector('[data-preview-grid-workspace=wh-b] .clab-review-workspace-title').dispatchEvent(new MouseEvent('pointerdown',{bubbles:true}));`);await key();
        assert.equal(await evaluate(`wh.b.view.table.sheets[0].columnWidth!==320`),true);
        console.log('PASS settings applied to multiple preview workspaces can be undone independently in each workspace');

        await evaluate(`document.querySelector('.clab-preview-modal-close').click();wh.open();document.querySelector('[data-review-mode=detail]').click();wh.history.reset();`);await wait();
        const columns=await evaluate(`Number(document.querySelector('[data-detail-setting=columns]').value)`);
        await evaluate(`(()=>{const input=document.querySelector('[data-detail-setting=columns]');input.value=${columns===4?5:4};input.dispatchEvent(new Event('input',{bubbles:true}));const search=document.querySelector('[data-detail-search]');search.value='任务';search.dispatchEvent(new Event('input',{bubbles:true}));})()`);await key();
        assert.deepEqual(await evaluate(`({columns:Number(document.querySelector('[data-detail-setting=columns]').value),search:document.querySelector('[data-detail-search]').value})`),{columns,search:'任务'});
        console.log('PASS detail layout changes undo while the current source search remains unchanged');
        await evaluate(`document.querySelector('.clab-preview-modal-close').click()`);await show('a');await evaluate('wh.history.reset()');await edit('可重做编辑');await key();
        await evaluate(`(async()=>{const {captureCardInputSnapshot}=await import('/extensions/clab/components/modules/media_types/media_utils.js'),{selectOutputHistory}=await import('/extensions/clab/components/modules/module_history.js');const card=wh.a.cards[0],input=card.areas[0],output=card.areas[1],snapshot=captureCardInputSnapshot(card);snapshot[0].value='历史取值';output.inputHistorySnapshots=[snapshot,snapshot];selectOutputHistory(card,output,1);})()`);await wait();
        assert.equal(await evaluate(`wh.history.canRedo&&wh.a.cards[0].areas[0].value==='历史取值'&&!wh.history.canUndo`),true,'history browsing must preserve redo without adding an input-refill edit');
        await key(true);assert.equal(await evaluate('wh.a.cards[0].areas[0].value'),'可重做编辑');
        console.log('PASS history browsing and automatic input restoration do not add undo steps or clear existing redo');
    }finally{
        await evaluate(`document.querySelector('.clab-preview-modal.visible .clab-preview-modal-close')?.click();wh.ui.state.workspaces=wh.workspaces;wh.ui.applyWorkspaceToState(wh.original);document.dispatchEvent(new Event('clab_render_ui'));wh.history.reset();`);
    }
    return 6;
}
