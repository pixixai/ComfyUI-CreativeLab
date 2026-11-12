import assert from 'node:assert/strict';
import fs from 'node:fs';

export async function runPreviewWorkspaceChecks(send,sessionId,screenshotPrefix) {
    const evaluate=async expression=>{const result=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true},sessionId);assert.equal(result.exceptionDetails,undefined,JSON.stringify(result.exceptionDetails));return result.result.value;};
    const point=selector=>evaluate(`(async()=>{const el=document.querySelector(${JSON.stringify(selector)});el.scrollIntoView({block:'center',inline:'nearest'});await new Promise(r=>setTimeout(r,150));const r=el.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};})()`);
    const click=async selector=>{const p=await point(selector);await send('Input.dispatchMouseEvent',{type:'mouseMoved',...p},sessionId);await new Promise(r=>setTimeout(r,130));for(const type of ['mousePressed','mouseReleased'])await send('Input.dispatchMouseEvent',{type,...p,button:'left',clickCount:1},sessionId);};
    const tab=id=>`[data-review-workspaces] [data-workspace-id="${id}"]`,root='.clab-preview-modal';
    await evaluate(`(async()=>{
        document.querySelector('${root}.visible .clab-preview-modal-close')?.click();
        const {state,appState,createEmptyWorkspace,syncStateToActiveWorkspace,applyWorkspaceToState}=await import('/extensions/clab/components/ui_state.js');
        syncStateToActiveWorkspace();window.previewWorkspaceOriginal={workspaces:state.workspaces,active:state.activeWorkspaceId};
        const cards=window.getDetailDemoTasks().slice(0,2);
        const a=createEmptyWorkspace('预览A',{id:'preview-ws-a',cards:structuredClone(cards)}),b=createEmptyWorkspace('预览B',{id:'preview-ws-b',cards:structuredClone(cards)});
        state.workspaces=[a,b];applyWorkspaceToState(a);appState.selectedWorkspaceIds=[a.id];document.dispatchEvent(new Event('clab_render_ui'));
        window.openSavedDetail=()=>{const card=state.cards[0],area=card.areas.find(area=>area.type==='preview');window.CLab.showPreviewContextMenu(100,100,card.id,area.id,area.resultUrl);document.querySelector('#clab-ctx-preview-mode').click();document.querySelector('[data-review-mode="detail"]').click();};window.openSavedDetail();
    })()`);
    try {
        await evaluate(`(()=>{
            document.querySelector('[data-detail-output="detail-image"][value="detail-alt-out"]').click();
            document.querySelectorAll('[data-detail-cover="detail-image"][data-area-id="detail-image-cover-out"]')[1].click();
            document.querySelector('[data-detail-input="detail-image"][value="detail-image-secret"]').click();
            const slider=document.querySelector('[data-detail-columns]');slider.value=3;slider.dispatchEvent(new Event('input',{bubbles:true}));
            document.querySelector('${root} .clab-preview-modal-close').click();window.openSavedDetail();
        })()`);
        const restored=()=>evaluate(`(()=>{const pin=document.querySelectorAll('[data-detail-cover="detail-image"][data-area-id="detail-image-cover-out"]')[1];return document.querySelector('[data-detail-output="detail-image"][value="detail-alt-out"]').checked&&pin.getAttribute('aria-pressed')==='true'&&!document.querySelector('[data-detail-input="detail-image"][value="detail-image-secret"]').checked&&document.querySelector('[data-detail-columns]').value==='3';})()`);
        assert.equal(await restored(),true,'returning from workspace mode reset detail sources, cover, input fields or thumbnail columns');
        assert.equal(await evaluate(`(async()=>{const {getActiveWorkspace}=await import('/extensions/clab/components/ui_state.js');const {createWorkspaceView}=await import('/extensions/clab/components/workspace_modes/view_state.js');document.querySelector('${root} .clab-preview-modal-close').click();const ws=getActiveWorkspace();ws.view=createWorkspaceView(JSON.parse(JSON.stringify(ws.view)));window.openSavedDetail();return !!ws.view.previewDetail;})()`),true);assert.equal(await restored(),true,'serialized workflow view did not restore the detail session');
        await click(tab('preview-ws-b')+' .clab-workspace-tab-select');
        assert.equal(await evaluate(`!document.querySelector('[data-detail-cover][aria-pressed=true]')&&document.querySelector('[data-detail-output="detail-image"][value="detail-image-out"]').checked`),true,'a second workspace inherited the first workspace cover or output');
        await click(tab('preview-ws-a')+' .clab-workspace-tab-select');assert.equal(await restored(),true);
        console.log('PASS detail settings persist through workspace return, serialized view normalization and workspace switching without leaking selections');

        await evaluate(`document.querySelector('.clab-detail-board').click()`);
        const imageHistory='[data-detail-record="detail-image"][data-area-id="detail-image-out"]';
        await click(imageHistory);
        assert.equal(await evaluate(`document.querySelector('[data-detail-card="detail-image"]').classList.contains('active')`),true,'a source thumbnail did not activate its task after clearing the card selection');
        for(const type of ['keyDown','keyUp'])await send('Input.dispatchKeyEvent',{type,key:'ArrowRight',code:'ArrowRight',windowsVirtualKeyCode:39},sessionId);
        assert.equal(await evaluate(`document.querySelectorAll('${imageHistory}')[1].classList.contains('active')&&document.querySelector('[data-detail-card="detail-image"] [data-detail-pool="output"] span').textContent==='2/2'`),true,'Right after a source click did not advance that task history');
        const key=async(name,code)=>{for(const type of ['keyDown','keyUp'])await send('Input.dispatchKeyEvent',{type,key:name,code:name,windowsVirtualKeyCode:code},sessionId);};
        const activeArea=()=>evaluate(`document.querySelector('[data-detail-source="detail-image"] [data-detail-output]:checked').value`);
        await key('ArrowRight',39);assert.equal(await activeArea(),'detail-alt-out','Right at the last record did not enter the next output');
        await key('ArrowRight',39);assert.equal(await activeArea(),'detail-image-cover-out');
        await key('ArrowLeft',37);assert.equal(await activeArea(),'detail-alt-out');
        await key('ArrowLeft',37);assert.equal(await activeArea(),'detail-image-out');
        assert.equal(await evaluate(`document.querySelector('${imageHistory}').classList.contains('active')&&document.activeElement===document.querySelector('${imageHistory}')&&[...document.querySelectorAll('${imageHistory}')].every(button=>getComputedStyle(button).outlineStyle==='none')`),true,'previous-group navigation did not choose its first record or left an old native focus outline');
        await key('ArrowDown',40);assert.equal(await activeArea(),'detail-alt-out');await key('ArrowDown',40);assert.equal(await activeArea(),'detail-image-cover-out');
        await evaluate(`document.querySelector('[data-detail-source="detail-video"]').open=false`);
        await key('ArrowDown',40);
        assert.equal(await evaluate(`document.querySelector('[data-detail-card="detail-video"]').classList.contains('active')&&document.querySelector('[data-detail-source="detail-video"]').open&&document.querySelector('[data-detail-record="detail-video"][data-area-id="detail-video-out"]').classList.contains('active')`),true,'Down did not activate and reveal the next task output');
        await key('ArrowUp',38);assert.equal(await activeArea(),'detail-image-cover-out');
        await evaluate(`(()=>{const type=document.querySelector('[data-detail-type]');type.value='image';type.dispatchEvent(new Event('change',{bubbles:true}));})()`);
        await click(imageHistory);await key('ArrowRight',39);await key('ArrowRight',39);
        assert.equal(await activeArea(),'detail-image-cover-out','filtered keyboard navigation included a hidden video output');
        await evaluate(`(()=>{const type=document.querySelector('[data-detail-type]');type.value='';type.dispatchEvent(new Event('change',{bubbles:true}));})()`);
        console.log('PASS source arrows cross history boundaries to adjacent first records, Up/Down jump groups, filtered/empty groups are skipped and native focus follows the active thumbnail');
        const retainedImageRecord=await evaluate(`document.querySelector('[data-detail-record="detail-image"].active').dataset.recordKey`);
        const videoHistory='[data-detail-record="detail-video"][data-area-id="detail-video-out"]';
        await evaluate(`document.querySelectorAll('${videoHistory}')[1].click()`);
        await click(videoHistory);
        for(const type of ['keyDown','keyUp'])await send('Input.dispatchKeyEvent',{type,key:'ArrowRight',code:'ArrowRight',windowsVirtualKeyCode:39},sessionId);
        assert.equal(await evaluate(`document.querySelector('[data-detail-card="detail-video"]').classList.contains('active')&&document.querySelectorAll('${videoHistory}')[1].classList.contains('active')&&document.querySelector('[data-detail-record="detail-image"].active').dataset.recordKey===${JSON.stringify(retainedImageRecord)}`),true,'a second task thumbnail left keyboard history navigation on the previous task');
        for(const type of ['keyDown','keyUp'])await send('Input.dispatchKeyEvent',{type,key:'ArrowLeft',code:'ArrowLeft',windowsVirtualKeyCode:37},sessionId);
        assert.equal(await evaluate(`document.querySelector('${videoHistory}').classList.contains('active')`),true,'Left after a source click did not restore the previous history');
        await click('[data-detail-record="detail-image"][data-area-id="detail-alt-out"]');
        console.log('PASS native source thumbnail clicks activate their task and Left/Right switch its history after blank selection and across tasks');

        await evaluate(`(()=>{const row=document.querySelector('[data-detail-source-output="detail-alt-out"]'),thumb=row.querySelector('[data-detail-record]'),r=thumb.getBoundingClientRect();thumb.scrollIntoView({block:'center'});return true;})()`);
        const hover=await point('[data-detail-source-output="detail-alt-out"] [data-detail-record]');await send('Input.dispatchMouseEvent',{type:'mouseMoved',...hover},sessionId);await new Promise(r=>setTimeout(r,180));
        const hovered=await evaluate(`(()=>{const row=document.querySelector('[data-detail-source-output="detail-alt-out"]'),button=row.querySelector('[data-detail-output-switch]'),thumb=row.querySelector('[data-detail-record].active'),style=getComputedStyle(thumb);return {opacity:getComputedStyle(button).opacity,triangle:getComputedStyle(button,'::after').clipPath.includes('polygon'),button:getComputedStyle(button).backgroundColor,frame:style.boxShadow,border:style.borderTopColor};})()`);
        assert.deepEqual(hovered,{opacity:'1',triangle:true,button:'rgb(19, 19, 19)',frame:'rgb(255, 255, 255) 0px 0px 0px 2px',border:'rgba(0, 0, 0, 0)'},'hovering a history failed to reveal the dark batch button or active content lost its white matte');
        console.log('PASS the entire output module reveals its dark batch button and active content has an outer white matte');

        const inactive=tab('preview-ws-b')+' [data-mode-toggle]';
        assert.equal(await evaluate(`getComputedStyle(document.querySelector('${inactive}')).visibility`),'hidden');
        await send('Input.dispatchMouseEvent',{type:'mouseMoved',...await point(tab('preview-ws-b'))},sessionId);
        assert.equal(await evaluate(`getComputedStyle(document.querySelector('${inactive}')).visibility`),'visible');
        await click(inactive);await click('#clab-preview-workspace-mode-menu [data-workspace-mode=table]');
        assert.equal(await evaluate(`(async()=>{const {getActiveWorkspace}=await import('/extensions/clab/components/ui_state.js');return getActiveWorkspace().id==='preview-ws-b'&&getActiveWorkspace().view.mode==='table'&&document.querySelector('${root}').dataset.reviewMode==='table';})()`),true,'preview mode menu did not use the shared workspace-mode transition');
        await click(tab('preview-ws-b')+' [data-mode-toggle]');await click('#clab-preview-workspace-mode-menu [data-workspace-mode=cards]');
        await click(tab('preview-ws-a')+' .clab-workspace-tab-select');await click('[data-review-mode=detail]');assert.equal(await restored(),true);
        console.log('PASS inactive preview workspace arrows reveal on hover and their shared mode menus switch the targeted workspace and preview');

        const name=tab('preview-ws-a')+' .clab-workspace-tab-name',p=await point(name);
        for(const type of ['mousePressed','mouseReleased'])await send('Input.dispatchMouseEvent',{type,...p,button:'left',clickCount:2},sessionId);
        assert.equal(await evaluate(`document.querySelector('${name}').isContentEditable`),true,'native double click did not start preview workspace renaming');
        await send('Input.insertText',{text:'已重命名A'},sessionId);for(const type of ['keyDown','keyUp'])await send('Input.dispatchKeyEvent',{type,key:'Enter',code:'Enter',windowsVirtualKeyCode:13},sessionId);
        assert.equal(await evaluate(`document.querySelector('${name}').textContent`),'已重命名A');
        const right=await point(tab('preview-ws-b'));for(const type of ['mousePressed','mouseReleased'])await send('Input.dispatchMouseEvent',{type,...right,button:'right',clickCount:1},sessionId);
        assert.equal(await evaluate(`getComputedStyle(document.querySelector('#clab-ctx-ws-rename').parentElement).display`),'block','preview workspace context menu was unavailable');
        await click('#clab-ctx-ws-rename');
        assert.equal(await evaluate(`document.querySelector('${tab('preview-ws-b')} .clab-workspace-tab-name').isContentEditable&&document.activeElement.closest('[data-review-workspaces]')!==null`),true,'context rename edited the hidden workspace bar');
        for(const type of ['keyDown','keyUp'])await send('Input.dispatchKeyEvent',{type,key:'Escape',code:'Escape',windowsVirtualKeyCode:27},sessionId);
        assert.equal(await evaluate(`document.querySelector('${root}').classList.contains('visible')`),true,'Escape while renaming closed the preview');
        await evaluate(`(()=>{const source=document.querySelector('${tab('preview-ws-a')}'),target=document.querySelector('${tab('preview-ws-b')}'),r=target.getBoundingClientRect(),dataTransfer=new DataTransfer();source.dispatchEvent(new DragEvent('dragstart',{bubbles:true,dataTransfer}));target.dispatchEvent(new DragEvent('dragover',{bubbles:true,cancelable:true,dataTransfer,clientX:r.right-1}));target.dispatchEvent(new DragEvent('drop',{bubbles:true,cancelable:true,dataTransfer,clientX:r.right-1}));source.dispatchEvent(new DragEvent('dragend',{bubbles:true,dataTransfer}));})()`);
        assert.deepEqual(await evaluate(`[...document.querySelectorAll('[data-review-workspaces] [data-workspace-id]')].map(tab=>tab.dataset.workspaceId)`),['preview-ws-b','preview-ws-a']);
        assert.deepEqual(await evaluate(`[...document.querySelectorAll('#clab-workspace-bar [data-workspace-id]')].map(tab=>tab.dataset.workspaceId)`),['preview-ws-b','preview-ws-a']);
        console.log('PASS preview workspaces share double-click renaming, right-click actions and drag reordering with the workspace bar');

        await click(tab('preview-ws-a')+' .clab-workspace-tab-select');await click('[data-review-mode=detail]');
        await evaluate(`(async()=>{const {state}=await import('/extensions/clab/components/ui_state.js');document.querySelector('${root} .clab-preview-modal-close').click();const task=state.cards.find(card=>card.id==='detail-image');task.areas=task.areas.filter(area=>area.id!=='detail-alt-out');task.areas.find(area=>area.id==='detail-image-cover-out').history.pop();window.openSavedDetail();})()`);
        assert.equal(await evaluate(`(async()=>{const {getActiveWorkspace}=await import('/extensions/clab/components/ui_state.js'),saved=getActiveWorkspace().view.previewDetail;return saved.covers.length===0&&!saved.outputs.some(([id,area])=>area==='detail-alt-out')&&!saved.histories.some(([key])=>key.includes('detail-alt-out'))&&!document.querySelector('[data-detail-task-preview="detail-image"]').classList.contains('is-stacked');})()`),true,'deleted output/cover history left stale saved references');
        if(screenshotPrefix){const shot=await send('Page.captureScreenshot',{format:'png'},sessionId);fs.writeFileSync(screenshotPrefix+'-saved-detail.png',Buffer.from(shot.data,'base64'));}
        console.log('PASS deleted output modules and cover records clear saved references automatically');
        return 7;
    } finally {
        await evaluate(`(async()=>{document.querySelector('${root}.visible .clab-preview-modal-close')?.click();const {state,appState,applyWorkspaceToState}=await import('/extensions/clab/components/ui_state.js'),original=window.previewWorkspaceOriginal;state.workspaces=original.workspaces;const active=state.workspaces.find(ws=>ws.id===original.active);applyWorkspaceToState(active);appState.selectedWorkspaceIds=[active.id];document.dispatchEvent(new Event('clab_render_ui'));delete window.previewWorkspaceOriginal;delete window.openSavedDetail;})()`);
    }
}
