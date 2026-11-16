import assert from 'node:assert/strict';
export async function runOutputMenuChecks(send,sessionId){
    const evaluate=async expression=>{const result=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true},sessionId);assert.equal(result.exceptionDetails,undefined,JSON.stringify(result.exceptionDetails));return result.result.value;};
    const wait=()=>evaluate('new Promise(resolve=>setTimeout(resolve,130))');
    const click=async selector=>{assert.equal(await evaluate(`!!document.querySelector(${JSON.stringify(selector)})`),true,selector);await evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);await wait();};
    await evaluate(`(async()=>{
        const ui=await import('/extensions/clab/components/ui_state.js'),{openWorkspacePreview:open}=await import('/extensions/clab/components/contextmenu/group_content.js'),{appendExternalHistory}=await import('/extensions/clab/components/modules/media_types/external_history.js'),{addExternalMedia}=await import('/extensions/clab/components/contextmenu/content/preview_external_records.js');
        ui.syncStateToActiveWorkspace();window.om={ui,open,append:appendExternalHistory,original:ui.getActiveWorkspace(),workspaces:[...ui.state.workspaces],fetch:window.fetch,uploads:0,reveals:[]};
        om.ws=ui.createEmptyWorkspace('输出菜单',{cards:[1,2].map(n=>({id:'om-task-'+n,areas:[{id:'om-out-'+n,type:'preview',title:'输出',targetNodeId:'3',history:['/view?filename=one.png','/view?filename=two.png'],historyIndex:0,resultUrl:'/view?filename=one.png'},{id:'om-x-'+n,type:'edit',value:n,targetNodeId:'1',targetWidget:'steps',targetWidgets:['1||steps']},{id:'om-y-'+n,type:'edit',value:1,targetNodeId:'1',targetWidget:'cfg',targetWidgets:['1||cfg']}]}))});
        ui.state.workspaces.push(om.ws);ui.applyWorkspaceToState(om.ws);document.dispatchEvent(new Event('clab_render_ui'));addExternalMedia(om.ws,['ref.png']);
        const xy=om.ws.view.xy;xy.initialized=true;xy.x.bindings=['1||steps'];xy.x.values=[1,2];xy.y.bindings=['1||cfg'];xy.y.values=[1];xy.outputNodeId='3';xy.taskIds=om.ws.cards.map(card=>card.id);om.ws.cards.forEach(card=>card.xyOutputId=card.areas[0].id);
        om.area=n=>om.ws.cards[n-1].areas[0];om.reset=()=>{for(const n of [1,2]){const area=om.area(n);Object.assign(area,{history:['/view?filename=one.png','/view?filename=two.png'],historyRuns:[null,null],inputHistorySnapshots:[null,null],externalImports:[],historyIndex:0,resultUrl:'/view?filename=one.png'});om.append(area,[{id:om.ws.view.previewExternal.images[0].id,url:'/view?filename=ref.png&type=input'}],om.ws.id);area.historyIndex=0;area.resultUrl=area.history[0];}};om.reset();
        om.root=()=>document.querySelector('.clab-preview-modal.visible');om.context=selector=>document.querySelector(selector).dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true,button:2,clientX:500,clientY:300}));
        om.native=()=>window.CLab.showPreviewContextMenu(500,300,om.ws.cards[0].id,om.area(1).id,om.area(1).resultUrl);
        window.fetch=(url,options)=>url==='/upload/image'?Promise.resolve(new Response(JSON.stringify({name:'menu-upload-'+(++om.uploads)+'.png',type:'input',subfolder:'clab_references'}))):url==='/clab/open_asset'?(om.reveals.push(JSON.parse(options.body)),Promise.resolve(new Response(JSON.stringify({status:'success'})))):options?.method==='HEAD'&&String(url).includes('dead.png')?Promise.resolve(new Response('',{status:404})):om.fetch.call(window,url,options);
        om.seed=structuredClone(om.ws);om.fresh=mode=>{const references=structuredClone(om.ws.view.previewExternal);om.ws=ui.createEmptyWorkspace('输出菜单 '+mode,{cards:structuredClone(om.seed.cards),view:{...structuredClone(om.seed.view),mode,previewExternal:references}});ui.state.workspaces.push(om.ws);ui.applyWorkspaceToState(om.ws);om.reset();document.dispatchEvent(new Event('clab_render_ui'));};
        om.open();
    })()`);await wait();
    try{
        for(const mode of ['browse','compare','detail','table','xy']){
            await click('[data-review-mode='+mode+']');
            await evaluate(`(()=>{const input=om.root().querySelector('input[type=file]'),data=new DataTransfer();data.items.add(new File(['image'],'new.png',{type:'image/png'}));input.click=()=>{};om.root().querySelector('.clab-external-head [data-external-pick=computer]').click();input.files=data.files;input.dispatchEvent(new Event('change',{bubbles:true}));})()`);
            await wait();
            assert.equal(await evaluate(`!!om.root().querySelector('[data-external-key][title="clab_references/menu-upload-'+om.uploads+'.png"]')`),true,'new source media did not appear immediately in '+mode);
        }
        await evaluate(`om.savedFetch=window.fetch;window.fetch=(url,options)=>url==='/upload/image'?new Promise(resolve=>om.finishUpload=()=>resolve(new Response(JSON.stringify({name:'late.png',type:'input',subfolder:'clab_references'})))):om.savedFetch(url,options);const input=om.root().querySelector('input[type=file]'),data=new DataTransfer();data.items.add(new File(['image'],'late.png',{type:'image/png'}));input.click=()=>{};om.root().querySelector('.clab-external-head [data-external-pick=computer]').click();input.files=data.files;input.dispatchEvent(new Event('change',{bubbles:true}));`);
        await click('[data-review-mode=detail]');await evaluate('om.finishUpload()');await wait();
        assert.equal(await evaluate(`om.root().dataset.reviewMode==='detail'&&!!om.root().querySelector('[data-external-key][title="clab_references/late.png"]')`),true,'a pending upload did not refresh the newly selected view of the same workspace');
        await evaluate('window.fetch=om.savedFetch;om.referenceCount=om.ws.view.previewExternal.images.length');
        console.log('PASS new external references appear immediately in every preview mode without switching tabs');
        await click('.clab-preview-modal.visible .clab-preview-modal-close');
        for(const mode of ['cards','table','xy']){
            await evaluate(`om.fresh(${JSON.stringify(mode)});`);await wait();
            await evaluate(`om.area(1).historyIndex=2;om.area(1).resultUrl=om.area(1).history[2];document.dispatchEvent(new Event('clab_render_ui'));`);await wait();
            const marker=mode==='xy'?'#clab-panel .clab-card[data-card-id="om-task-1"] > .clab-xy-history .clab-external-import-icon':'#clab-panel [data-area-id="om-out-1"] .clab-external-import-icon';
            assert.equal(await evaluate(`document.querySelector(${JSON.stringify(marker)})?.title.includes('ref.png')&&document.querySelector(${JSON.stringify(marker)})?.title.includes('无生成参数快照')`),true,'missing imported-history marker in '+mode);
            await evaluate(`om.area(1).historyIndex=0;om.area(1).resultUrl=om.area(1).history[0];document.dispatchEvent(new Event('clab_render_ui'));`);await wait();
            assert.equal(await evaluate(`!!document.querySelector(${JSON.stringify(marker)})`),false,'import marker remained on a generated record in '+mode);
            if(mode==='xy'){
                await evaluate('om.native()');
                await evaluate(`document.querySelector('.clab-context-menu #clab-ctx-clear').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,cancelable:true,button:0}));`);
                assert.equal(await evaluate(`document.querySelector('.clab-context-menu').style.display==='block'`),true,'inside pointerdown closed the output menu');
                await evaluate(`document.querySelector('#clab-cards-container').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,cancelable:true,button:0,clientX:450,clientY:350}));`);
                assert.equal(await evaluate(`document.querySelector('.clab-context-menu').style.display==='none'`),true,'XY blank canvas pointerdown did not close the output menu');
                await evaluate(`document.querySelector('#clab-cards-container').dispatchEvent(new PointerEvent('pointerup',{bubbles:true,cancelable:true,button:0}));om.native();document.querySelector('#clab-cards-container').click();`);
                assert.equal(await evaluate(`document.querySelector('.clab-context-menu').style.display==='none'`),true,'XY blank canvas click did not close the output menu');
            }
            await evaluate('om.native()');
            const menu=await evaluate(`[...document.querySelector('.clab-context-menu').querySelectorAll('[id^="clab-ctx-"]')].map(item=>item.id)`);
            assert.ok(menu.includes('clab-ctx-remove-external')&&menu.includes('clab-ctx-clean-dead')&&menu.includes('clab-ctx-open-explorer'));
            assert.ok(!menu.includes('clab-ctx-preview-mode')&&!menu.includes('clab-ctx-open-default')&&!menu.includes('clab-ctx-move-back'));
            assert.equal(menu.includes('clab-ctx-select-same'),mode==='cards');
            await click('.clab-context-menu #clab-ctx-remove-external');assert.equal(await evaluate('om.area(1).history.length===2&&om.area(2).history.length===3&&om.ws.view.previewExternal.images.length===om.referenceCount'),true,'external-only cleanup affected other records or source references in '+mode);
            await evaluate('om.native()');await click('.clab-context-menu #clab-ctx-remove');assert.equal(await evaluate('om.area(1).history.length===1&&om.area(1).history[0].includes("two.png")'),true);
            await evaluate('om.native()');await click('.clab-context-menu #clab-ctx-open-explorer');assert.equal(await evaluate('om.reveals.at(-1).action==="reveal"&&om.reveals.at(-1).filename==="two.png"'),true);
            await evaluate('om.native()');await click('.clab-context-menu #clab-ctx-clear');assert.equal(await evaluate('om.area(1).history.length===0&&!om.area(1).resultUrl'),true);
        }
        console.log('PASS all three workspaces share output record maintenance and reveal actions; card module commands follow the requested order');
        for(const mode of ['table','xy']){
            await evaluate(`om.fresh(${JSON.stringify(mode)});om.area(2).historyIndex=1;om.area(2).resultUrl=om.area(2).history[1];om.open();`);await wait();
            const target=mode==='table'?'.clab-preview-modal.visible [data-review-cell="om-out-1"]':'.clab-preview-modal.visible .clab-card[data-card-id="om-task-1"]';
            await evaluate(`om.context(${JSON.stringify(target)})`);await click('.clab-external-menu #clab-ctx-remove-external');
            assert.equal(await evaluate('om.area(1).history.length===2&&om.area(2).history.length===3'),true,'preview external cleanup affected an unselected output');
            const second=mode==='table'?'.clab-preview-modal.visible [data-review-cell="om-out-2"]':'.clab-preview-modal.visible .clab-card[data-card-id="om-task-2"]';
            await evaluate(`document.querySelector(${JSON.stringify(target)}).dispatchEvent(new MouseEvent('click',{bubbles:true}));document.querySelector(${JSON.stringify(second)}).dispatchEvent(new MouseEvent('click',{bubbles:true,ctrlKey:true}));om.context(${JSON.stringify(second)});`);
            await click('.clab-external-menu #clab-ctx-open-explorer');assert.equal(await evaluate('om.reveals.at(-1).filename==="two.png"'),true,'preview reveal used the first selected output instead of the right-clicked output');
            await evaluate(`om.context(${JSON.stringify(second)})`);await click('.clab-external-menu #clab-ctx-remove-external');assert.equal(await evaluate('om.area(1).history.length===2&&om.area(2).history.length===2'),true,'selected preview outputs did not share cleanup scope');
            await evaluate(`om.context(${JSON.stringify(target)})`);await click('.clab-external-menu #clab-ctx-resync');assert.equal(await evaluate('om.area(1).history.every(url=>new URL(url,location.origin).searchParams.has("t"))'),true);
            await evaluate(`om.area(1).history.push('/view?filename=dead.png');om.context(${JSON.stringify(target)})`);await click('.clab-external-menu #clab-ctx-clean-dead');
            assert.equal(await evaluate('om.area(1).history.length===2'),true,'preview 404 cleanup failed');
            await evaluate(`om.context(${JSON.stringify(target)})`);await click('.clab-external-menu #clab-ctx-remove');assert.equal(await evaluate('om.area(1).history.length===1'),true);
            await evaluate(`om.context(${JSON.stringify(target)})`);await click('.clab-external-menu #clab-ctx-clear');assert.equal(await evaluate('om.area(1).history.length===0'),true);
            await click('.clab-preview-modal.visible .clab-preview-modal-close');
        }
        console.log('PASS preview table/XY context menus persist current-record removal, clear, imported-only cleanup, resync and 404 cleanup');
        assert.deepEqual(await evaluate('window.testProgress.errors'),[]);
    }finally{
        await evaluate(`document.querySelector('.clab-preview-modal.visible .clab-preview-modal-close')?.click();window.fetch=om.fetch;om.ui.state.workspaces=om.workspaces;om.ui.applyWorkspaceToState(om.original);document.dispatchEvent(new Event('clab_render_ui'));`);
    }
}
