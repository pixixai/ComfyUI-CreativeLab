import assert from 'node:assert/strict';
import fs from 'node:fs';

export async function runXYTitleChecks(send,sessionId,screenshotPrefix) {
    const evaluate=async expression=>{const result=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true},sessionId);assert.equal(result.exceptionDetails,undefined,JSON.stringify(result.exceptionDetails));return result.result.value;};
    const settle=()=>evaluate('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
    await evaluate(`(async()=>{
        window.showXYZDemo();
        const {state,getActiveWorkspace,createEmptyWorkspace,applyWorkspaceToState}=await import('/extensions/clab/components/ui_state.js');
        window.titlePreviousWorkspace=getActiveWorkspace();
        window.titleValues=['长提示词：山间小屋、树林、柔和光线与细致纹理，'.repeat(12),'https://example.test/'+ 'unbroken_long_prompt_'.repeat(35)];
        const workspace=createEmptyWorkspace('标题换行测试',{cards:[],view:{mode:'xy',xy:{outputNodeId:'111',x:{bindings:['110||steps'],values:[20]},y:{bindings:['110||sampler'],values:['Euler']},z:{enabled:true,bindings:['110||negative'],values:window.titleValues,current:0,display:'all'}}}});
        window.titleTestWorkspace=workspace;state.workspaces.push(workspace);applyWorkspaceToState(workspace);document.dispatchEvent(new Event('clab_render_ui'));
    })()`);await settle();
    try {
        for(const preview of [false,true]){
            if(preview){await evaluate(`document.querySelector('#clab-btn-preview').click()`);await settle();}
            const stage=preview?'.clab-review-grid-stage':'#clab-cards-container';
            for(const origin of ['bottom','top']){
                await evaluate(preview?`document.querySelector('[data-review-xy-orientation][value=${origin}]').click()`:`document.querySelector('#clab-panel [data-xy-origin-options]').click();document.querySelector('.clab-xy-options [data-xy-option=${origin}]').click()`);
                await evaluate(`document.querySelector('${preview?'[data-review-xy-fit]':'#clab-panel [data-xy-reset]'}').click()`);await settle();
                const layout=await evaluate(`(()=>{
                    const stage=document.querySelector('${stage}');
                    return [...stage.querySelectorAll('.clab-xy-layer-title')].map(title=>{
                        const layer=title.dataset.xyZLayer,rect=title.getBoundingClientRect(),group=title.closest('.clab-xy-layer-axes'),binding=group.querySelector('[data-xy-bind=y]').getBoundingClientRect();
                        const cells=[...stage.querySelectorAll('.clab-cards-wrapper > .clab-card:not([hidden])')].filter(cell=>cell.dataset.xyLayer===layer).map(cell=>cell.getBoundingClientRect());
                        const left=Math.min(...cells.map(cell=>cell.left)),right=Math.max(...cells.map(cell=>cell.right));
                        return {bounded:Math.abs(rect.left-left)<1&&Math.abs(rect.right-right)<1,centered:Math.abs(rect.left+rect.right-left-right)<1,
                            multiline:rect.height>parseFloat(getComputedStyle(title).fontSize)*2,above:rect.bottom<binding.top,unclipped:title.scrollWidth<=title.clientWidth+1&&title.scrollHeight<=title.clientHeight+1,complete:title.textContent.includes(window.titleValues[Number(layer)])};
                    });
                })()`);
                assert.equal(await evaluate(`(()=>{const stage=document.querySelector('${stage}'),header=stage.querySelector('.clab-xy-z-binding.is-public'),r=header.getBoundingClientRect(),titles=[...stage.querySelectorAll('.clab-xy-layer-title')].map(title=>title.getBoundingClientRect()),left=Math.min(...[...stage.querySelectorAll('.clab-cards-wrapper > .clab-card:not([hidden])')].map(cell=>cell.getBoundingClientRect().left));return stage.querySelectorAll('.clab-xy-z-binding').length===1&&Math.abs(r.left-left)<1&&r.bottom<Math.min(...titles.map(rect=>rect.top))&&header.textContent.startsWith('Z 轴');})()`),true,'public Z binding is not above all layer titles or aligned to the matrix left');
                assert.equal(layout.length,2);assert.ok(layout.every(item=>Object.values(item).every(Boolean)),JSON.stringify({preview,origin,layout}));
                if(screenshotPrefix){const {data}=await send('Page.captureScreenshot',{format:'png'},sessionId);fs.writeFileSync(`${screenshotPrefix}-titles-${preview?'preview':'workspace'}-${origin}.png`,Buffer.from(data,'base64'));}
            }
            if(preview){
                assert.equal(await evaluate(`(async()=>{
                    const {capturePreviewLayout}=await import('/extensions/clab/components/contextmenu/content/preview_layout_export.js');
                    const layout=await capturePreviewLayout(document.querySelector('.clab-review-grid-stage'));document.body.append(layout.outer);
                    try{const bounds=layout.outer.getBoundingClientRect();return [...layout.outer.querySelectorAll('.clab-xy-layer-title')].every(title=>{const r=title.getBoundingClientRect();return r.top>=bounds.top&&r.bottom<=bounds.bottom&&r.left>=bounds.left&&r.right<=bounds.right&&title.scrollHeight<=title.clientHeight+1;});}
                    finally{layout.outer.remove();}
                })()`),true,'export clips a multiline title');
                await evaluate(`document.querySelector('.clab-preview-modal-close').click()`);
            }
        }
    } finally {
        await evaluate(`(async()=>{document.querySelector('.clab-preview-modal.visible .clab-preview-modal-close')?.click();const {state,applyWorkspaceToState}=await import('/extensions/clab/components/ui_state.js');state.workspaces=state.workspaces.filter(workspace=>workspace!==window.titleTestWorkspace);applyWorkspaceToState(window.titlePreviousWorkspace);document.dispatchEvent(new Event('clab_render_ui'));delete window.titleTestWorkspace;delete window.titlePreviousWorkspace;})()`);
    }
    console.log('PASS workspace/preview Z titles wrap Chinese and unbroken text within each matrix, center above bindings in both orientations, and export without clipping');
    return 1;
}
