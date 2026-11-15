import assert from 'node:assert/strict';
import fs from 'node:fs';

export async function runPreviewGalleryChecks(send,sessionId,dragRecord){
    const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true},sessionId);assert.equal(r.exceptionDetails,undefined,JSON.stringify(r.exceptionDetails));return r.result.value;};
    const wait=()=>evaluate('new Promise(resolve=>setTimeout(resolve,100))');
    const until=condition=>evaluate(`new Promise((resolve,reject)=>{const end=performance.now()+4000;const tick=()=>{if(${condition})resolve();else if(performance.now()>end)reject(new Error('gallery did not settle'));else setTimeout(tick,20);};tick();})`);
    const click=async(selector,modifiers={})=>{await evaluate(`document.querySelector(${JSON.stringify(selector)}).dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,...${JSON.stringify(modifiers)}}))`);await wait();};
    const drag=async(start,end)=>{
        await send('Input.dispatchMouseEvent',{type:'mouseMoved',...start},sessionId);
        await send('Input.dispatchMouseEvent',{type:'mousePressed',...start,button:'left',buttons:1,clickCount:1},sessionId);
        await send('Input.dispatchMouseEvent',{type:'mouseMoved',...end,button:'left',buttons:1},sessionId);
        await send('Input.dispatchMouseEvent',{type:'mouseReleased',...end,button:'left',buttons:0,clickCount:1},sessionId);await wait();
    };
    const wheel=async(point,modifiers=0)=>{await send('Input.dispatchMouseEvent',{type:'mouseWheel',...point,deltaX:0,deltaY:-120,modifiers},sessionId);await wait();};
    await evaluate(`(async()=>{
        const ui=await import('/extensions/clab/components/ui_state.js'),{openWorkspacePreview:open}=await import('/extensions/clab/components/contextmenu/group_content.js');
        ui.syncStateToActiveWorkspace();window.ga={ui,open,original:ui.getActiveWorkspace(),workspaces:[...ui.state.workspaces],fetch:window.fetch,uploads:0};
        ga.ws=ui.createEmptyWorkspace('媒体区域检查',{cards:Array.from({length:30},(_,i)=>({id:'gallery-task-'+i,title:'任务 '+i,areas:[{id:'gallery-out-'+i,type:'preview',history:['/view?filename=first.png','/view?filename=second.png'],historyIndex:0,resultUrl:'/view?filename=first.png'}]}))});
        ui.state.workspaces.push(ga.ws);ui.applyWorkspaceToState(ga.ws);document.dispatchEvent(new Event('clab_render_ui'));open();
        ga.root=()=>document.querySelector('.clab-preview-modal.visible');ga.dock=()=>ga.root().querySelector('.clab-external-dock');
        ga.gallery=()=>ga.dock().querySelector('.clab-external-scroll');ga.count=()=>ga.ws.view.previewExternal?.images.length||0;
        ga.thumb=index=>ga.dock().querySelectorAll('[data-external-key]')[index];
        ga.drop=count=>{const data=new DataTransfer();for(let i=0;i<count;i++)data.items.add(new File(['image'],'image-'+i+'.png',{type:'image/png'}));ga.dock().dispatchEvent(new DragEvent('drop',{bubbles:true,cancelable:true,dataTransfer:data}));};
        window.fetch=(url,options)=>url==='/upload/image'?Promise.resolve(new Response(JSON.stringify({name:'dock-'+(++ga.uploads)+'.png',subfolder:'clab_references',type:'input'}))):ga.fetch.call(window,url,options);
    })()`);await wait();
    try{
        assert.equal(await evaluate('Math.round(ga.dock().getBoundingClientRect().height)===44&&!ga.root().querySelector("[data-external-add]")&&ga.dock().querySelector(".clab-external-columns").hidden&&ga.dock().querySelector("[data-external-columns]").value==="4"'),true);
        await evaluate('ga.drop(1)');await until('ga.count()===1');await wait();
        await evaluate('ga.oneHeight=ga.dock().getBoundingClientRect().height;ga.drop(31)');await until('ga.count()===32');await wait();
        assert.equal(await evaluate(`(()=>{const d=ga.dock().getBoundingClientRect(),left=ga.root().querySelector('.clab-preview-modal-left').getBoundingClientRect();return Math.abs(d.height-ga.oneHeight)<1&&d.height>44&&Math.abs(d.left-left.left)<1&&Math.abs(d.width-left.width)<1&&left.bottom<=d.top+1;})()`),true,'gallery grew with file count, remained indented, or overlapped the task scroll region');
        assert.equal(await evaluate(`(()=>{const footer=ga.dock().querySelector('.clab-external-columns'),r=footer.getBoundingClientRect(),d=ga.dock().getBoundingClientRect();return !footer.hidden&&getComputedStyle(footer).position==='absolute'&&Math.abs(d.bottom-r.bottom-8)<1&&getComputedStyle(ga.dock().querySelector('.clab-external-grid')).gridTemplateColumns.split(' ').length===4;})()`),true,'reference columns control is not floating at the dock bottom with four columns');
        await evaluate(`(()=>{const slider=ga.dock().querySelector('[data-external-columns]');slider.value='5';slider.dispatchEvent(new Event('input',{bubbles:true}));slider.dispatchEvent(new Event('change',{bubbles:true}));const task=ga.root().querySelector('[data-browse-columns]');task.value='3';task.dispatchEvent(new Event('input',{bubbles:true}));})()`);
        assert.equal(await evaluate(`ga.ws.view.previewExternal.columns===5&&ga.root().querySelector('[data-browse-columns]').value==='3'&&getComputedStyle(ga.dock().querySelector('.clab-external-grid')).gridTemplateColumns.split(' ').length===5`),true,'reference columns follow the task slider instead of their own setting');
        await click('.clab-preview-modal.visible .clab-preview-modal-close');await evaluate('ga.open()');await wait();
        assert.equal(await evaluate(`ga.dock().querySelector('[data-external-columns]').value==='5'&&ga.ui.buildPersistedState().workspaces.find(workspace=>workspace.id===ga.ws.id).view.previewExternal.columns===5`),true,'reference column preference was lost on reopen/serialization');
        await click('[data-external-columns-reset]');
        assert.equal(await evaluate('ga.ws.view.previewExternal.columns===4&&ga.dock().querySelector("[data-external-columns]").value==="4"'),true,'reference grid icon did not reset its saved column count');
        await evaluate(`(()=>{const task=ga.root().querySelector('[data-browse-columns]');task.value='2';task.dispatchEvent(new Event('input',{bubbles:true}));})()`);
        await evaluate(`ga.left=ga.root().querySelector('.clab-preview-modal-left');ga.left.scrollTop=100;ga.gallery().scrollTop=90;ga.position=ga.dock().getBoundingClientRect().top;`);
        assert.equal(await evaluate('ga.left.scrollTop===100&&ga.gallery().scrollTop===90'),true);
        await evaluate('ga.left.scrollTop=300');
        assert.equal(await evaluate('ga.gallery().scrollTop===90&&Math.abs(ga.dock().getBoundingClientRect().top-ga.position)<1'),true,'task scrolling moved the gallery');
        await evaluate('ga.gallery().scrollTop=180');
        assert.equal(await evaluate('ga.left.scrollTop===300'),true,'gallery scrolling moved tasks');
        const handle=await evaluate(`(()=>{const b=ga.dock().querySelector('.clab-external-resize').getBoundingClientRect();return {x:b.left+b.width/2,y:b.top+4};})()`);
        await drag(handle,{x:handle.x,y:handle.y-60});
        assert.equal(await evaluate('Math.abs(ga.dock().getBoundingClientRect().height-ga.oneHeight-60)<2&&ga.ws.view.previewExternal.height>ga.oneHeight'),true,'divider dragging did not resize and save the independent media area');
        await evaluate('ga.expandedHeight=ga.dock().getBoundingClientRect().height');
        await click('[data-external-visible]');
        assert.equal(await evaluate('Math.round(ga.dock().getBoundingClientRect().height)===44&&ga.gallery().hidden&&ga.dock().querySelector(".clab-external-columns").hidden'),true,'unchecking the reference title did not collapse the dock and hide the column slider');
        await click('[data-external-visible]');
        assert.equal(await evaluate('Math.abs(ga.dock().getBoundingClientRect().height-ga.expandedHeight)<1&&!ga.gallery().hidden&&!ga.dock().querySelector(".clab-external-columns").hidden'),true,'rechecking the title did not restore the dock height and slider');
        await evaluate('ga.gallery().scrollTop=0;ga.thumb(0).click()');await wait();
        await evaluate('ga.thumb(2).dispatchEvent(new MouseEvent("click",{bubbles:true,shiftKey:true}));ga.thumb(5).dispatchEvent(new MouseEvent("click",{bubbles:true,ctrlKey:true}));');
        assert.equal(await evaluate('ga.dock().querySelectorAll(".clab-external-thumb.selected").length===4'),true);
        await evaluate('ga.dock().querySelectorAll("[data-external-delete]")[1].click()');await wait();
        assert.equal(await evaluate('ga.count()===28&&ga.ws.cards.every(card=>card.areas[0].history.length===2)'),true,'multi-delete changed the wrong reference count or generated histories');
        console.log('PASS the full-width reference dock starts as one row, opens a fixed thumbnail row, scrolls independently, resizes and supports Shift/Ctrl batch removal');

        await click('[data-review-mode=compare]');
        await click('.clab-source-media-tree .clab-filmstrip-thumb[data-index="0"]');await click('.clab-source-media-tree .clab-filmstrip-thumb[data-index="1"]');
        const reference=await evaluate(`(()=>{ga.gallery().scrollTop=0;const thumb=ga.thumb(0),b=thumb.getBoundingClientRect(),stage=ga.root().querySelector('.clab-compare-stage').getBoundingClientRect();ga.draggedPath=ga.ws.view.previewExternal.images[0].path;return{x:b.left+b.width/2,y:b.top+Math.min(45,b.height/2),toX:stage.left+stage.width*.75,toY:stage.top+stage.height*.6};})()`);
        const payload=await dragRecord(reference);await wait();
        assert.ok(payload.items.some(item=>item.mimeType==='application/x-clab-preview-record'),'native reference drag did not carry a preview record');
        assert.equal(await evaluate(`decodeURIComponent(ga.root().querySelector('.layer-b img').src).includes(ga.draggedPath.split('/').at(-1))`),true,'native reference drag did not replace B');
        await click('[data-compare-layout=split]');
        const splitReference=await evaluate(`(()=>{const thumb=ga.thumb(1),b=thumb.getBoundingClientRect(),stage=ga.root().querySelector('.clab-compare-stage'),r=stage.getBoundingClientRect(),split=parseFloat(stage.style.getPropertyValue('--compare-split'))/100;ga.splitPath=ga.ws.view.previewExternal.images[1].path;return{x:b.left+b.width/2,y:b.top+40,toX:r.left+r.width*split/2,toY:r.top+r.height*.6};})()`);
        await dragRecord(splitReference);await wait();
        assert.equal(await evaluate(`decodeURIComponent(ga.root().querySelector('.layer-a img').src).includes(ga.splitPath.split('/').at(-1))`),true,'native reference drag did not replace A in split view');
        await click('[data-compare-layout=side]');
        await evaluate(`(()=>{const stage=ga.root().querySelector('.clab-compare-stage'),r=stage.getBoundingClientRect(),data=new DataTransfer();data.setData('text/plain',ga.thumb(0).dataset.externalKey);delete stage.dataset.dropSlot;stage.dispatchEvent(new DragEvent('drop',{bubbles:true,cancelable:true,dataTransfer:data,clientX:r.left+r.width*.75,clientY:r.top+100}));})()`);await wait();
        assert.equal(await evaluate(`decodeURIComponent(ga.root().querySelector('.layer-b img').src).includes(ga.draggedPath.split('/').at(-1))`),true,'reference drop required prior dragover metadata');
        assert.equal(await evaluate(`(()=>{const r=ga.root(),a=r.querySelector('[data-compare-lock=a]').getBoundingClientRect(),ar=r.querySelector('[data-compare-reset=a]').getBoundingClientRect(),az=r.querySelector('[data-compare-zoom=a]').getBoundingClientRect(),b=r.querySelector('[data-compare-lock=b]').getBoundingClientRect(),br=r.querySelector('[data-compare-reset=b]').getBoundingClientRect(),bz=r.querySelector('[data-compare-zoom=b]').getBoundingClientRect(),stage=r.querySelector('.clab-compare-stage').getBoundingClientRect();return !r.querySelector('.clab-compare-heading [data-compare-lock]')&&a.left<az.left&&az.left<ar.left&&br.left<bz.left&&bz.left<b.left&&stage.bottom-a.bottom<14&&stage.bottom-b.bottom<14;})()`),true,'A/B camera controls are not mirrored at the bottom corners');
        await click('[data-compare-lock=a]');
        const point=await evaluate(`(()=>{const stage=ga.root().querySelector('.clab-compare-stage'),b=stage.getBoundingClientRect();ga.cameraA=stage.querySelector('.layer-a .clab-compare-transform').style.transform;ga.cameraB=stage.querySelector('.layer-b .clab-compare-transform').style.transform;return{x:b.left+b.width*.75,y:b.top+b.height*.55};})()`);
        await wheel(point);await drag(point,{x:point.x+24,y:point.y+18});
        assert.equal(await evaluate(`ga.root().querySelector('.layer-a .clab-compare-transform').style.transform===ga.cameraA&&ga.root().querySelector('.layer-b .clab-compare-transform').style.transform!==ga.cameraB`),true,'locked image pane moved with its neighbor');
        assert.equal(await evaluate(`ga.root().querySelector('[data-compare-zoom=a]').textContent==='100%'&&ga.root().querySelector('[data-compare-zoom=b]').textContent!=='100%'`),true,'camera scale labels did not track independent zoom');
        await click('[data-compare-lock=a]');
        assert.equal(await evaluate(`ga.root().querySelector('.layer-a .clab-compare-transform').style.transform===ga.cameraA`),true,'unlocking snapped the camera');
        await wheel(point);assert.equal(await evaluate(`ga.root().querySelector('.layer-a .clab-compare-transform').style.transform!==ga.cameraA`),true);
        await evaluate(`ga.beforeAlignA=ga.root().querySelector('.layer-a .clab-compare-transform');ga.beforeAlignB=ga.root().querySelector('.layer-b .clab-compare-transform')`);
        await click('[data-compare-reset=a]');
        assert.equal(await evaluate(`ga.root().querySelector('[data-compare-zoom=a]').textContent===ga.root().querySelector('[data-compare-zoom=b]').textContent&&ga.root().querySelector('.layer-a .clab-compare-transform').style.transform===ga.root().querySelector('.layer-b .clab-compare-transform').style.transform&&ga.root().querySelector('.layer-a .clab-compare-transform')===ga.beforeAlignA&&ga.root().querySelector('.layer-b .clab-compare-transform')===ga.beforeAlignB`),true,'aligning zoom and pan failed or rebuilt the selected media');
        await click('[data-compare-remove=a]');
        assert.equal(await evaluate(`ga.root().querySelector('.layer-a .clab-compare-empty').textContent.includes(' 与 ')`),true);
        assert.equal(await evaluate(`[...ga.root().querySelectorAll('[data-external-pick]')].every(button=>{const rgb=getComputedStyle(button).color.match(/[0-9]+/g).map(Number);return rgb[2]>rgb[0];})`),true,'computer/server links are not blue');
        assert.equal(await evaluate(`!ga.root().querySelector('.layer-a img')&&ga.ws.cards[0].areas[0].history.length===2&&ga.count()===28`),true);
        await click('.layer-a .clab-compare-empty');
        assert.equal(await evaluate(`!document.querySelector('.clab-external-menu:popover-open')`),true);
        await click('.layer-a [data-external-pick=server]');await until('document.querySelector(".clab-external-picker [data-input-file]")');
        assert.equal(await evaluate(`!document.querySelector('.clab-external-picker input[type=checkbox]')&&!!document.querySelector('.clab-external-picker [role=radio]')&&!document.querySelector('.clab-external-picker [data-external-confirm]')`),true,'A/B server picker is not single-choice');
        await click('.clab-external-picker [data-input-file="input.png"]');
        assert.equal(await evaluate(`!document.querySelector('.clab-external-picker')&&ga.root().querySelector('.layer-a img').src.includes('filename=input.png')`),true,'single-choice server image did not immediately fill A');
        await click('[data-compare-remove=a]');
        await click('.clab-external-head [data-external-pick=server]');await until('document.querySelector(".clab-external-picker [data-input-file]")');
        assert.equal(await evaluate(`!!document.querySelector('.clab-external-picker input[type=checkbox]')&&!!document.querySelector('.clab-external-picker [data-external-confirm]')`),true,'source gallery server picker should remain multi-choice');
        await click('.clab-external-picker .clab-xy-popup-close');
        await evaluate('ga.chooser=0;ga.root().querySelector("input[type=file]").click=()=>ga.chooser++');
        await click('.layer-a [data-external-pick=computer]');assert.equal(await evaluate('ga.chooser===1&&!document.querySelector(".clab-external-menu:popover-open")'),true);
        console.log('PASS A/B cameras freeze independently without unlock jumps; removing a pane retains sources and its inline computer/server links open directly');
        if(process.env.CLAB_GALLERY_SCREENSHOT){const shot=await send('Page.captureScreenshot',{format:'png'},sessionId);fs.writeFileSync(process.env.CLAB_GALLERY_SCREENSHOT,Buffer.from(shot.data,'base64'));}

        await evaluate('window.openReviewVideo("compare")');await wait();
        await click('[data-compare-lock=a]');
        const videoPoint=await evaluate(`(()=>{const stage=ga.root().querySelector('.clab-compare-stage'),b=stage.getBoundingClientRect();ga.videoA=stage.querySelector('.layer-a .clab-compare-transform').style.transform;ga.videoB=stage.querySelector('.layer-b .clab-compare-transform').style.transform;return{x:b.left+b.width*.75,y:b.top+b.height*.5};})()`);
        await wheel(videoPoint,2);await drag(videoPoint,{x:videoPoint.x+22,y:videoPoint.y+16});
        assert.equal(await evaluate(`ga.root().querySelector('.layer-a .clab-compare-transform').style.transform===ga.videoA&&ga.root().querySelector('.layer-b .clab-compare-transform').style.transform!==ga.videoB`),true,'locked video pane did not retain its camera during Ctrl-wheel and panning');
        await evaluate('ga.videoNodes=[...ga.root().querySelectorAll("video")]');
        await click('[data-compare-reset=a]');
        assert.equal(await evaluate(`ga.root().querySelector('[data-compare-zoom=a]').textContent===ga.root().querySelector('[data-compare-zoom=b]').textContent&&ga.root().querySelector('.layer-a .clab-compare-transform').style.transform===ga.root().querySelector('.layer-b .clab-compare-transform').style.transform&&ga.videoNodes.every((video,index)=>video===ga.root().querySelectorAll('video')[index])&&ga.root().querySelector('[data-compare-lock=a]').getAttribute('aria-pressed')==='true'`),true,'video view alignment failed, reset the players or changed the lock');
        await evaluate('window.closeReviewVideo()');
        console.log('PASS video comparisons preserve the locked camera during Ctrl-wheel zoom and drag while retaining shared playback');
        assert.deepEqual(await evaluate('window.testProgress.errors'),[]);
    }finally{
        await evaluate(`document.querySelector('.clab-preview-modal.visible .clab-preview-modal-close')?.click();window.fetch=ga.fetch;ga.ui.state.workspaces=ga.workspaces;ga.ui.applyWorkspaceToState(ga.original);document.dispatchEvent(new Event('clab_render_ui'));`);
    }
}
