import assert from 'node:assert/strict';

export async function runPreviewExternalChecks(send,sessionId){
    const evaluate=async expression=>{const result=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true},sessionId);assert.equal(result.exceptionDetails,undefined,JSON.stringify(result.exceptionDetails));return result.result.value;};
    const wait=()=>evaluate('new Promise(resolve=>setTimeout(resolve,100))');
    const until=condition=>evaluate(`new Promise((resolve,reject)=>{const end=performance.now()+4000;const sample=()=>{if(${condition})resolve();else if(performance.now()>end)reject(new Error('external image UI did not settle: '+JSON.stringify({picker:ex.picker()?.textContent,errors:window.testProgress?.errors.slice(-3)})));else setTimeout(sample,20);};sample();})`);
    const click=async selector=>{await evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);await wait();};
    await evaluate(`(async()=>{
        const ui=await import('/extensions/clab/components/ui_state.js'),{openWorkspacePreview:open}=await import('/extensions/clab/components/contextmenu/group_content.js'),{previewModalStore:store}=await import('/extensions/clab/components/contextmenu/content/state.js');
        ui.syncStateToActiveWorkspace();window.ex={ui,open,store,original:ui.getActiveWorkspace(),workspaces:[...ui.state.workspaces],fetch:window.fetch,uploads:[]};
        ex.ws=ui.createEmptyWorkspace('参考图测试',{cards:[{id:'ex-task',areas:[{id:'ex-output',type:'preview',history:['/view?filename=first.png','/view?filename=second.png'],historyIndex:1,resultUrl:'/view?filename=second.png'}]}]});
        ui.state.workspaces.push(ex.ws);ui.applyWorkspaceToState(ex.ws);document.dispatchEvent(new Event('clab_render_ui'));open();
        ex.root=()=>document.querySelector('.clab-preview-modal.visible');ex.images=()=>ex.ws.view.previewExternal?.images||[];
        ex.active=()=>store.entries[store.activeIndex];ex.picker=()=>document.querySelector('.clab-external-picker');
        window.fetch=(url,options)=>{if(url==='/upload/image'){const file=options.body.get('image'),subfolder=options.body.get('subfolder');ex.uploads.push({name:file.name,subfolder});return Promise.resolve(new Response(JSON.stringify({name:'external-'+ex.uploads.length+'.png',subfolder,type:'input'})));}return ex.fetch.call(window,url,options);};
    })()`);await wait();
    try{
        await click('.clab-external-head [data-external-pick=server]');
        await until(`ex.picker()?.querySelector('[data-input-file="input.png"]')`);
        await evaluate(`ex.picker().querySelector('[data-input-file="input.png"] input').click();ex.picker().querySelector('[data-directory="refs"]>summary').click()`);
        await until(`ex.picker()?.querySelector('[data-directory="refs/deep"]')`);
        await evaluate(`ex.picker().querySelector('[data-directory="refs/deep"]>summary').click()`);await until(`ex.picker()?.querySelector('[data-input-file="refs/deep/same.png"]')`);
        await evaluate(`ex.picker().querySelector('[data-input-file="refs/deep/same.png"] input').click();ex.picker().querySelector('[data-external-confirm]').click()`);await wait();
        assert.equal(await evaluate(`ex.images().length===2&&ex.uploads.length===0&&ex.ws.cards.length===1&&ex.ws.cards[0].areas[0].history.length===2&&ex.active().externalWorkspaceId===ex.ws.id`),true);
        assert.equal(await evaluate(`ex.root().querySelectorAll('[data-external-key]').length===2&&ex.root().querySelector('.clab-preview-modal-main-image').src.includes('filename=input.png')`),true);
        console.log('PASS server picker adds nested image references directly, previews the first and leaves tasks/history unchanged');

        await click('[data-review-mode=compare]');
        await evaluate(`(()=>{const thumb=ex.root().querySelector('[data-external-key]'),stage=ex.root().querySelector('.clab-compare-stage'),r=stage.getBoundingClientRect(),data=new DataTransfer();data.setData('application/x-clab-preview-record',thumb.dataset.externalKey);stage.dispatchEvent(new DragEvent('dragover',{bubbles:true,cancelable:true,clientX:r.right-20,clientY:r.top+100,dataTransfer:data}));stage.dispatchEvent(new DragEvent('drop',{bubbles:true,cancelable:true,clientX:r.right-20,clientY:r.top+100,dataTransfer:data}));})()`);await wait();
        assert.equal(await evaluate(`ex.root().querySelector('.layer-b img')?.src.includes('filename=input.png')`),true);
        await click('.clab-preview-modal.visible [data-external-key]');await click('[data-compare-layout=split]');await click('[data-compare-swap]');
        assert.equal(await evaluate(`ex.root().querySelectorAll('.clab-compare-stage img').length===2&&ex.root().querySelector('.clab-compare-stage').classList.contains('split')`),true);
        console.log('PASS external thumbnails use the existing A/B drop, click assignment, split comparison and swap interactions');

        await click('[data-review-mode=browse]');
        await evaluate(`(()=>{const data=new DataTransfer();data.items.add(new File(['image'],'local.png',{type:'image/png'}));data.items.add(new File(['image'],'second.png',{type:'image/png'}));ex.root().querySelector('.clab-preview-modal-center').dispatchEvent(new DragEvent('drop',{bubbles:true,cancelable:true,dataTransfer:data}));})()`);
        await until(`ex.images().length===4`);
        assert.equal(await evaluate(`ex.uploads.length===2&&ex.uploads.every(upload=>upload.subfolder==='clab_references')&&ex.active().externalPath==='clab_references/external-1.png'`),true);
        await click('[data-review-mode=compare]');
        await evaluate(`(()=>{document.activeElement.blur();const data=new DataTransfer();data.items.add(new File(['image'],'screenshot.png',{type:'image/png'}));document.body.dispatchEvent(new ClipboardEvent('paste',{bubbles:true,cancelable:true,clipboardData:data}));})()`);await until(`ex.images().length===5`);
        assert.equal(await evaluate(`[...ex.root().querySelectorAll('.clab-compare-stage img')].some(image=>image.src.includes('external-3.png'))`),true);
        await evaluate(`(()=>{const search=ex.root().querySelector('[data-browse-search]');search.focus();const data=new DataTransfer();data.items.add(new File(['image'],'typing.png',{type:'image/png'}));search.dispatchEvent(new ClipboardEvent('paste',{bubbles:true,cancelable:true,clipboardData:data}));search.blur();})()`);await wait();
        assert.equal(await evaluate('ex.images().length===5&&ex.uploads.length===3'),true);
        console.log('PASS local multi-file drop uploads to the reference subfolder once per image; screenshot paste targets A/B and respects text editing');

        await click('[data-review-mode=detail]');assert.equal(await evaluate(`ex.root().querySelector('.clab-external-dock').hidden`),false);
        await click('[data-review-mode=table]');assert.equal(await evaluate(`ex.root().querySelector('.clab-external-dock').hidden`),false);
        await click('[data-review-mode=browse]');
        await click('[data-external-visible]');assert.equal(await evaluate(`!ex.store.entries.some(record=>record.externalWorkspaceId)`),true);
        await click('.clab-preview-modal.visible .clab-preview-modal-close');await evaluate('ex.open()');await wait();
        assert.equal(await evaluate(`ex.images().length===5&&!ex.root().querySelector('[data-external-visible]').checked&&!ex.store.entries.some(record=>record.externalWorkspaceId)`),true);
        await click('[data-external-visible]');
        assert.equal(await evaluate(`ex.ui.buildPersistedState().workspaces.find(workspace=>workspace.id===ex.ws.id).view.previewExternal.images.length===5`),true);
        await evaluate(`(()=>{const thumb=ex.root().querySelector('[data-external-key]');ex.removed=thumb.dataset.externalKey;thumb.dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true,clientX:100,clientY:150}));document.querySelector('[data-external-remove]').click();})()`);await wait();
        assert.equal(await evaluate(`ex.images().length===4&&!ex.store.entries.some(record=>record.key===ex.removed)&&ex.ws.cards[0].areas[0].history.length===2`),true);
        console.log('PASS references and visibility survive closing/reopening and workflow serialization; detail/table retain the media dock and removal only deletes a reference');
        await evaluate(`document.activeElement.blur();ex.root().dispatchEvent(new KeyboardEvent('keydown',{key:'z',code:'KeyZ',ctrlKey:true,bubbles:true}));`);await wait();
        assert.equal(await evaluate('ex.images().length===5&&ex.store.entries.some(record=>record.key===ex.removed)'),true,'undo did not restore the removed reference in the preview');
        await evaluate(`ex.root().dispatchEvent(new KeyboardEvent('keydown',{key:'z',code:'KeyZ',ctrlKey:true,shiftKey:true,bubbles:true}));`);await wait();
        assert.equal(await evaluate('ex.images().length===4'),true);
        console.log('PASS reference removal supports one-step preview undo/redo without modifying generated outputs');

        await evaluate(`ex.chooser=0;ex.fileInput=ex.root().querySelector('input[type=file]');ex.fileInput.click=()=>ex.chooser++;ex.uploadFetch=window.fetch;window.fetch=(url,options)=>url==='/upload/image'?new Promise(resolve=>ex.finish=()=>resolve(new Response(JSON.stringify({name:'late.png',subfolder:'clab_references',type:'input'})))):ex.uploadFetch(url,options);`);
        await click('.clab-external-head [data-external-pick=computer]');
        await evaluate(`(()=>{const data=new DataTransfer();data.items.add(new File(['image'],'late.png',{type:'image/png'}));ex.fileInput.files=data.files;ex.fileInput.dispatchEvent(new Event('change',{bubbles:true}));ex.other=ex.ui.createEmptyWorkspace('另一工作区');ex.ui.state.workspaces.push(ex.other);ex.ui.applyWorkspaceToState(ex.other);document.dispatchEvent(new Event('clab_render_ui'));ex.open();ex.finish();})()`);await wait();
        assert.equal(await evaluate(`ex.chooser===1&&ex.images().length===5&&!(ex.other.view.previewExternal?.images.length)&&!ex.root().querySelector('[data-external-key]')&&ex.ui.state.activeWorkspaceId===ex.other.id`),true,'a pending upload changed the newly opened workspace or stole its preview');
        console.log('PASS native upload keeps its original workspace owner and never steals the preview after a workspace switch');
        assert.deepEqual(await evaluate('window.testProgress.errors'),[]);
    }finally{
        await evaluate(`document.querySelector('.clab-preview-modal.visible .clab-preview-modal-close')?.click();window.fetch=ex.fetch;ex.ui.state.workspaces=ex.workspaces;ex.ui.applyWorkspaceToState(ex.original);document.dispatchEvent(new Event('clab_render_ui'));`);
    }
}
