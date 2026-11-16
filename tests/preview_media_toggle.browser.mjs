import assert from 'node:assert/strict';
export async function runMediaToggleChecks(send,sessionId){
    const evaluate=async expression=>{const result=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true},sessionId);assert.equal(result.exceptionDetails,undefined,JSON.stringify(result.exceptionDetails));return result.result.value;};
    const wait=()=>evaluate('new Promise(resolve=>setTimeout(resolve,150))');
    const click=async selector=>{await evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);await wait();};
    await evaluate(`(async()=>{
        const ui=await import('/extensions/clab/components/ui_state.js'),{openWorkspacePreview:open}=await import('/extensions/clab/components/contextmenu/group_content.js');
        ui.syncStateToActiveWorkspace();window.mt={ui,open,original:ui.getActiveWorkspace(),workspaces:[...ui.state.workspaces],fetch:window.fetch,uploads:[]};
        mt.ws=ui.createEmptyWorkspace('媒体与开关',{cards:[{id:'mt-task',areas:[{id:'mt-output',type:'preview',targetNodeId:'3',history:[],historyIndex:-1}]}]});
        ui.state.workspaces.push(mt.ws);ui.applyWorkspaceToState(mt.ws);document.dispatchEvent(new Event('clab_render_ui'));open();
        mt.root=()=>document.querySelector('.clab-preview-modal');mt.area=()=>mt.ws.cards[0].areas[0];
        mt.press=(options={})=>{document.activeElement?.blur();document.body.dispatchEvent(new KeyboardEvent('keydown',{bubbles:true,key:'c',code:'KeyC',...options}));};
        window.fetch=(url,options)=>url==='/upload/image'?Promise.resolve(new Response(JSON.stringify({name:(mt.uploads.push(options.body.get('image').name),options.body.get('image').name),subfolder:'clab_references',type:'input'}))):mt.fetch.call(window,url,options);
        mt.drop=(selector,files)=>{const data=new DataTransfer();for(const [name,type]of files)data.items.add(new File(['media'],name,{type}));document.querySelector(selector).dispatchEvent(new DragEvent('drop',{bubbles:true,cancelable:true,dataTransfer:data}));};
    })()`);await wait();
    try{
        await evaluate(`mt.drop('.clab-external-dock',[['outside.mp4','video/mp4'],['sample.wav','audio/wav'],['scene.glb','model/gltf-binary'],['note.txt','text/plain']]);`);await wait();
        assert.equal(await evaluate(`mt.uploads.length===4&&mt.ws.view.previewExternal.images.length===4&&mt.root().querySelector('.clab-external-thumb-media video')&&!mt.root().querySelector('.clab-external-thumb-media audio')&&!mt.root().querySelector('.clab-external-thumb-media .clab-glb-viewer')`),true,'mixed files were rejected or heavy gallery players were mounted');
        await click('.clab-external-head [data-external-pick=server]');
        assert.equal(await evaluate(`['sample.wav','clip.mp4','scene.glb','notes.txt'].every(name=>document.querySelector('.clab-external-picker [data-input-file="'+name+'"]'))`),true,'server picker omitted supported media types: '+JSON.stringify(await evaluate('[...document.querySelectorAll(".clab-external-picker [data-input-file]")].map(item=>item.dataset.inputFile)')));
        await click('.clab-external-picker .clab-xy-popup-close');
        await click('[data-review-mode=detail]');
        await evaluate(`mt.drop('[data-detail-card="mt-task"] .clab-detail-media',[['import.wav','audio/wav']])`);await wait();
        assert.equal(await evaluate(`mt.area().history.length===1&&mt.area().resultUrl.includes('import.wav')&&!!mt.root().querySelector('[data-detail-card="mt-task"] audio')&&mt.area().inputHistorySnapshots[0]===null`),true,'audio could not be imported into a detail output');
        await evaluate(`mt.press({repeat:true})`);assert.equal(await evaluate(`mt.root().classList.contains('visible')`),true,'key repeat toggled the panel');
        await evaluate(`mt.press()`);await wait();assert.equal(await evaluate(`!mt.root().classList.contains('visible')&&!document.querySelector('#clab-panel.visible')&&!mt.root().querySelector('.clab-preview-modal-center audio')`),true,'C did not close both surfaces and release preview players');
        await evaluate(`mt.press()`);await wait();assert.equal(await evaluate(`mt.root().classList.contains('visible')&&mt.root().dataset.reviewMode==='detail'&&!!mt.root().querySelector('[data-detail-card="mt-task"] audio')&&!document.querySelector('#clab-panel.visible')`),true,'C did not restore the detail preview');
        await click('[data-review-mode=compare]');
        await evaluate(`mt.press();mt.press()`);await wait();assert.equal(await evaluate(`mt.root().classList.contains('visible')&&mt.root().dataset.reviewMode==='compare'`),true,'C reset the compare tab');
        await click('.clab-compare-empty [data-external-pick=server]');
        assert.equal(await evaluate(`!!document.querySelector('.clab-external-picker [data-input-file="clip.mp4"]')&&!document.querySelector('.clab-external-picker [data-input-file="sample.wav"]')&&!document.querySelector('.clab-external-picker [data-input-file="scene.glb"]')`),true,'A/B server picker accepted unsupported comparison media');
        await click('.clab-external-picker .clab-xy-popup-close');
        await click('[data-review-mode=table]');await evaluate(`const row=mt.root().querySelector('[data-grid-filter="row"][value="mt-task"]');row.checked=true;row.dispatchEvent(new Event('change',{bubbles:true}));`);await wait();await click('[data-review-cell="mt-output"]');
        await evaluate('mt.press();mt.press()');await wait();assert.equal(await evaluate(`mt.root().dataset.reviewMode==='table'&&mt.root().querySelector('[data-review-cell="mt-output"]').classList.contains('active')`),true,'C lost parameter table selection');
        await click('.clab-preview-modal-close');assert.equal(await evaluate(`!!document.querySelector('#clab-panel.visible')`),true,'explicit return did not show the workspace');
        await evaluate('mt.press();mt.press()');await wait();assert.equal(await evaluate(`!!document.querySelector('#clab-panel.visible')&&!mt.root().classList.contains('visible')`),true,'workspace C incorrectly reopened the preview');
        await evaluate('mt.open()');await wait();
        await evaluate(`const search=mt.root().querySelector('[data-browse-search]');search.focus();search.dispatchEvent(new KeyboardEvent('keydown',{bubbles:true,key:'c',code:'KeyC'}));`);assert.equal(await evaluate(`mt.root().classList.contains('visible')`),true,'typing C in search closed the preview');
        await evaluate(`document.activeElement.blur();mt.press({ctrlKey:true})`);assert.equal(await evaluate(`mt.root().classList.contains('visible')`),true,'Ctrl+C closed the preview');
        await click('.clab-preview-modal-close');
        await evaluate(`(()=>{const card=mt.ws.cards[0],xy=mt.ws.view.xy;card.areas.push({id:'mt-x',type:'edit',targetNodeId:'1',targetWidget:'steps',targetWidgets:['1||steps'],value:1},{id:'mt-y',type:'edit',targetNodeId:'1',targetWidget:'cfg',targetWidgets:['1||cfg'],value:1});xy.x.bindings=['1||steps'];xy.x.values=[1];xy.y.bindings=['1||cfg'];xy.y.values=[1];xy.outputNodeId='3';xy.taskIds=[card.id];card.xyOutputId='mt-output';mt.ws.view.mode='xy';document.dispatchEvent(new Event('clab_render_ui'));mt.open();})()`);await wait();
        await click('.clab-preview-modal.visible .clab-card[data-card-id="mt-task"]');
        await evaluate('mt.press();mt.press()');await wait();assert.equal(await evaluate(`mt.root().dataset.reviewMode==='xy'&&mt.root().querySelector('.clab-card[data-card-id="mt-task"]').classList.contains('selected')`),true,'C lost XY grid selection');
        console.log('PASS external video/audio/3D/text upload and server selection share references; audio imports retain provenance and reuse the existing player');
        console.log('PASS C closes both surfaces, releases media and restores the same preview tab; workspace return, editing, modifiers and repeat retain their rules');
        assert.deepEqual(await evaluate('window.testProgress.errors'),[]);
    }finally{
        await evaluate(`document.querySelector('.clab-preview-modal.visible .clab-preview-modal-close')?.click();window.fetch=mt.fetch;mt.ui.state.workspaces=mt.workspaces;mt.ui.applyWorkspaceToState(mt.original);document.dispatchEvent(new Event('clab_render_ui'));`);
    }
}
