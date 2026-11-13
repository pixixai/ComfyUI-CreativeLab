import assert from 'node:assert/strict';

export async function runToolbarVisualChecks(send,sessionId){
    const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true},sessionId);assert.equal(r.exceptionDetails,undefined,JSON.stringify(r.exceptionDetails));return r.result.value;};
    const wait=ms=>evaluate(`new Promise(resolve=>setTimeout(resolve,${ms}))`);
    const point=selector=>evaluate(`(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2};})()`);
    await evaluate(`(async()=>{
        const ui=await import('/extensions/clab/components/ui_state.js'),{paintWorkspaceHighlights:paint}=await import('/extensions/clab/components/workspace_tab_highlight.js'),{openWorkspacePreview:open}=await import('/extensions/clab/components/contextmenu/group_content.js'),{togglePanel:toggle}=await import('/extensions/clab/ui_panel.js');
        ui.syncStateToActiveWorkspace();window.vt={ui,paint,open,toggle,original:ui.getActiveWorkspace(),workspaces:[...ui.state.workspaces]};
        const make=i=>ui.createEmptyWorkspace('定位效果工作区 '+i,{id:'visual-ws-'+i,view:{mode:'cards'},cards:Array.from({length:8},(_,n)=>({id:'visual-task-'+i+'-'+n,title:'任务 '+n,areas:[{id:'visual-output-'+i+'-'+n,type:'preview',title:'图片',targetNodeId:'2',history:['/view?filename=first.png'],resultUrl:'/view?filename=first.png',historyIndex:0}]}))});
        const workspaces=Array.from({length:7},(_,i)=>make(i));ui.state.workspaces.push(...workspaces);ui.applyWorkspaceToState(workspaces.at(-1));ui.appState.selectedWorkspaceIds=[ui.state.activeWorkspaceId];document.dispatchEvent(new Event('clab_render_ui'));
        const panel=document.querySelector('#clab-panel'),tabs=document.querySelector('#clab-workspace-bar');vt.transform=panel.style.transform;vt.transition=panel.style.transition;
        panel.style.transition='none';panel.style.transform='scale(.9)';tabs.scrollLeft=tabs.scrollWidth-tabs.clientWidth;paint(tabs,[ui.state.activeWorkspaceId]);panel.style.transform='scale(1)';
    })()`);await wait(40);
    const aligned=()=>evaluate(`(()=>{const tab=document.querySelector('#clab-workspace-bar .clab-workspace-tab.active').getBoundingClientRect(),path=document.querySelector('#clab-workspace-bar .clab-workspace-highlight path').getBoundingClientRect();return {left:Math.abs(tab.left-path.left),right:Math.abs(tab.right-path.right)};})()`);
    try{
        let bounds=await aligned();assert.ok(bounds.left<1.6&&bounds.right<1.6,JSON.stringify(bounds));
        await evaluate(`(()=>{const panel=document.querySelector('#clab-panel');panel.style.transform=vt.transform;panel.style.transition=vt.transition;vt.toggle();vt.toggle();})()`);await wait(400);
        bounds=await aligned();assert.ok(bounds.left<1.6&&bounds.right<1.6,JSON.stringify(bounds));
        console.log('PASS rainbow tab geometry stays aligned through panel scaling and close/reopen with horizontally scrolled tabs');

        await evaluate('vt.open()');await wait(200);
        const button='.clab-preview-modal.visible .clab-source-ruler button:nth-child(5)';
        assert.equal(await evaluate(`[...document.querySelectorAll('.clab-preview-modal.visible .clab-source-ruler button')].every((button,index,buttons)=>!index||button.offsetTop-buttons[index-1].offsetTop===16)`),true);
        const before=await evaluate(`[...document.querySelectorAll('.clab-preview-modal.visible .clab-source-ruler button')].map(button=>getComputedStyle(button,'::before').backgroundColor)`);
        await send('Input.dispatchMouseEvent',{type:'mouseMoved',...await point(button)},sessionId);await wait(240);
        const wave=await evaluate(`[...document.querySelectorAll('.clab-preview-modal.visible .clab-source-ruler button')].map(button=>{const s=getComputedStyle(button,'::before');return {scale:new DOMMatrixReadOnly(s.transform).a,color:s.backgroundColor};})`);
        wave.forEach((item,index)=>{const d=Math.abs(index-4),scale=[3,2.3,1.6][d]||1;assert.ok(Math.abs(item.scale-scale)<.01,JSON.stringify({index,item,scale}));if(index!==4)assert.equal(item.color,before[index]);});
        await send('Input.dispatchMouseEvent',{type:'mouseMoved',...await point('.clab-preview-modal.visible .clab-preview-modal-center')},sessionId);await wait(200);
        assert.equal(await evaluate(`[...document.querySelectorAll('.clab-preview-modal.visible .clab-source-ruler button')].every(button=>Math.abs(new DOMMatrixReadOnly(getComputedStyle(button,'::before').transform).a-1)<.001)`),true);
        console.log('PASS ruler hover forms an exact 3/2.3/1.6 five-tick wave, leaves neighboring colors unchanged and restores lengths on exit');
    }finally{
        await evaluate(`document.querySelector('.clab-preview-modal.visible .clab-preview-modal-close')?.click();const panel=document.querySelector('#clab-panel');panel.style.transform=vt.transform;panel.style.transition=vt.transition;vt.ui.state.workspaces=vt.workspaces;vt.ui.applyWorkspaceToState(vt.original);document.dispatchEvent(new Event('clab_render_ui'));`);
    }
    return 2;
}
