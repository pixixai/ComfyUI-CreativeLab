import assert from 'node:assert/strict';

export async function runWorkspaceTypeChecks(send,sessionId){
    const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true},sessionId);assert.ok(!r.exceptionDetails,JSON.stringify(r.exceptionDetails));return r.result.value;};
    const settle=()=>evaluate('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
    const click=async selector=>{
        const point=await evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});e.scrollIntoView({block:'nearest',inline:'nearest'});const r=e.getBoundingClientRect();return{x:(r.left+r.right)/2,y:(r.top+r.bottom)/2};})()`);
        await settle();await send('Input.dispatchMouseEvent',{type:'mouseMoved',...point},sessionId);
        for(const type of ['mousePressed','mouseReleased'])await send('Input.dispatchMouseEvent',{type,...point,button:'left',buttons:type==='mousePressed'?1:0,clickCount:1},sessionId);
        await settle();
    };
    const check=async(expression,message)=>assert.equal(await evaluate(expression),true,message);
    const panel='#clab-panel',menu=panel+' .clab-workspace-create-menu',modeMenu='#clab-workspace-mode-menu';
    const mode=async name=>{await click(panel+' .clab-workspace-tab.active [data-mode-toggle]');await click(modeMenu+` [data-workspace-mode=${name}]`);};
    await evaluate(`(async()=>{
        const ui=await import('/extensions/clab/components/ui_state.js');ui.syncStateToActiveWorkspace();
        window.wt={ui,workspaces:[...ui.state.workspaces],active:ui.getActiveWorkspace(),position:document.documentElement.dataset.clabWorkspaceTabs};
        if(!document.querySelector('#clab-panel.visible'))(await import('/extensions/clab/ui_panel.js')).togglePanel();
    })()`);await settle();await settle();
    try{
        for(const [type,label]of [['cards','任务卡片'],['table','参数表'],['xy','XY 矩阵']]){
            const before=await evaluate('wt.ui.state.workspaces.length');
            await click('#clab-workspace-add');await check(`!document.querySelector('${menu}').hidden`,'plus did not open creation choices');
            assert.equal(await evaluate('wt.ui.state.workspaces.length'),before,'opening the menu created a workspace prematurely');
            await click('#clab-workspace-add');await check(`document.querySelector('${menu}').hidden`,'second plus click did not close creation choices');
            await click('#clab-workspace-add');
            await click(menu+` [data-create-workspace=${type}]`);
            await check(`(()=>{const ws=wt.ui.getActiveWorkspace();wt.last=ws;return ws.view.mode==='${type}'&&ws.view.creationMode==='${type}'&&ws.name.startsWith('${label}·')&&!ws.name.includes('工作区')&&document.querySelector('#clab-panel').dataset.workspaceMode==='${type}';})()`,'new workspace type or fixed compact name is incorrect');
            if(type==='cards'){
                for(const next of ['table','cards','xy','cards','table']){
                    await mode(next);await check(`wt.last.view.mode==='${next}'&&wt.last.view.creationMode==='cards'&&document.querySelector('#clab-panel .clab-workspace-tab.active .clab-workspace-tab-name').textContent===wt.last.name`,'card origin or fixed label changed during conversion');
                    if(next==='table'){
                        await click(panel+' .clab-workspace-tab.active [data-mode-toggle]');
                        await check(`document.querySelector('${modeMenu} [data-workspace-mode=xy]').disabled`,'structured conversion did not require card transit');
                        await click(panel+' .clab-workspace-tab.active [data-mode-toggle]');
                    }
                }
            }else{
                await mode('cards');await click(panel+' .clab-workspace-tab.active [data-mode-toggle]');
                const other=type==='table'?'xy':'table';
                await check(`document.querySelector('${modeMenu} [data-workspace-mode=${other}]').disabled&&!document.querySelector('${modeMenu} [data-workspace-mode=${type}]').disabled`,'card view unlocked an incompatible creation type');
                await click(modeMenu+` [data-workspace-mode=${type}]`);await mode('cards');
                await evaluate(`document.querySelector('#clab-panel .clab-workspace-tab.active').dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,clientX:400,clientY:150}))`);
                await click('#clab-ctx-ws-duplicate');
                await check(`wt.ui.getActiveWorkspace().view.creationMode==='${type}'&&wt.ui.getActiveWorkspace().name===wt.last.name+' 副本'`,'copy did not retain creation type');
            }
        }
        await mode('xy');
        for(const selector of ['#clab-cards-container','.clab-xy-empty','.axis-x','[data-xy-bind=output]']){
            await click(panel+' .clab-workspace-tab.active [data-mode-toggle]');
            await check(`!document.querySelector('${modeMenu}').hidden`,'mode choices did not open before XY canvas dismissal check');
            await click(panel+' '+selector);
            await check(`document.querySelector('${modeMenu}').hidden&&document.querySelector('#clab-panel .clab-workspace-tab.active [data-mode-toggle]').getAttribute('aria-expanded')==='false'`,'XY canvas click did not dismiss mode choices: '+selector);
            await evaluate(`document.querySelector('.clab-module-binding-popover:popover-open .clab-xy-popup-close')?.click()`);await settle();
        }
        await click('#clab-workspace-add');await click('#clab-cards-container');
        await check(`document.querySelector('${menu}').hidden`,'XY canvas click did not dismiss creation choices');
        await click('#clab-workspace-add');
        for(const type of ['keyDown','keyUp'])await send('Input.dispatchKeyEvent',{type,key:'Escape',code:'Escape',windowsVirtualKeyCode:27},sessionId);
        await check(`document.querySelector('${menu}').hidden&&document.activeElement.id==='clab-workspace-add'`,'Escape did not close creation menu and restore focus');
        await click('#clab-workspace-add');
        await evaluate(`document.querySelector('#clab-panel .clab-toolbar').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}))`);
        await check(`document.querySelector('${menu}').hidden`,'outside click did not close creation menu');
        await evaluate(`wt.after=wt.ui.state.activeWorkspaceId;document.querySelector('#clab-panel .clab-workspace-tab.active').dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,clientX:400,clientY:150}))`);
        await click('#clab-ctx-ws-add');await click(menu+' [data-create-workspace=table]');
        await check(`wt.ui.getActiveWorkspace().view.creationMode==='table'&&wt.ui.state.workspaces.findIndex(ws=>ws.id===wt.ui.state.activeWorkspaceId)===wt.ui.state.workspaces.findIndex(ws=>ws.id===wt.after)+1`,'context creation did not choose a type and insert after its tab');
        await evaluate(`document.documentElement.dataset.clabWorkspaceTabs='bottom'`);await settle();
        await click('#clab-workspace-add');
        await check(`(()=>{const a=document.querySelector('${menu}').getBoundingClientRect(),b=document.querySelector('#clab-panel .clab-workspace-strip').getBoundingClientRect();return a.bottom<=b.top&&a.top>=0;})()`,'bottom creation menu did not open upward');
        await click('#clab-workspace-add');
        await evaluate(`document.documentElement.dataset.clabWorkspaceTabs='top'`);
        await click('#clab-btn-preview');await click('#clab-preview-workspace-add');
        await click('.clab-preview-modal.visible [data-create-workspace=xy]');
        await check(`wt.ui.getActiveWorkspace().view.creationMode==='xy'&&wt.ui.getActiveWorkspace().view.mode==='xy'&&document.querySelector('.clab-preview-modal.visible [data-review-workspaces] .clab-workspace-tab.active .clab-workspace-tab-name').textContent===wt.ui.getActiveWorkspace().name`,'preview plus did not share workspace creation and fixed naming');
        console.log('PASS workspace creation choices, fixed origin/names, card transit restrictions, copies, menu dismissal and preview creation');
    }finally{
        await evaluate(`document.querySelector('.clab-preview-modal.visible .clab-preview-modal-close')?.click();wt.ui.state.workspaces=wt.workspaces;wt.ui.applyWorkspaceToState(wt.active);wt.ui.appState.selectedWorkspaceIds=[wt.active.id];document.documentElement.dataset.clabWorkspaceTabs=wt.position;document.dispatchEvent(new Event('clab_render_ui'));delete window.wt;`);
    }
}
