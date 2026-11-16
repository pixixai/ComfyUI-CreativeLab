import assert from 'node:assert/strict';

export async function runXYHistoryToolChecks(send,sessionId){
    const evaluate=async expression=>{new Function(expression);const result=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true},sessionId);assert.equal(result.exceptionDetails,undefined,JSON.stringify(result.exceptionDetails));return result.result.value;};
    const wait=()=>evaluate('new Promise(resolve=>setTimeout(resolve,150))');
    const waitFor=expression=>evaluate(`new Promise((resolve,reject)=>{let n=0;const check=()=>{if(${expression})resolve();else if(++n>120)reject(Error('XY history UI did not settle'));else requestAnimationFrame(check);};check();})`);
    const click=async(selector,modifiers=0)=>{const point=await evaluate(`(()=>{const node=document.querySelector(${JSON.stringify(selector)});if(!node)throw Error('missing '+${JSON.stringify(selector)});const r=node.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2};})()`);for(const type of ['mousePressed','mouseReleased'])await send('Input.dispatchMouseEvent',{type,button:'left',buttons:type==='mousePressed'?1:0,clickCount:1,modifiers,...point},sessionId);await wait();};
    const clickGrid=async(index,modifiers=0)=>{const point=await evaluate(`(()=>{const node=hx.area(${index}).querySelector('.clab-history-grid'),r=node.getBoundingClientRect(),x=r.left+3,y=r.top+3;if(document.elementFromPoint(x,y)!==node)throw Error('managed-grid padding is covered');return{x,y};})()`);for(const type of ['mousePressed','mouseReleased'])await send('Input.dispatchMouseEvent',{type,button:'left',buttons:type==='mousePressed'?1:0,clickCount:1,modifiers,...point},sessionId);await wait();};
    const moveRecords=async(from,to,side)=>{assert.equal(await evaluate(`(()=>{const data=new DataTransfer(),source=hx.area(0).querySelector('.clab-history-thumb[data-index="${from}"]'),target=hx.area(0).querySelector('.clab-history-thumb[data-index="${to}"]'),r=target.getBoundingClientRect(),start=new DragEvent('dragstart',{bubbles:true,cancelable:true,dataTransfer:data});source.dispatchEvent(start);if(start.defaultPrevented)return false;for(const type of ['dragover','drop'])target.dispatchEvent(new DragEvent(type,{bubbles:true,cancelable:true,dataTransfer:data,clientX:${JSON.stringify(side)}==='left'?r.left+2:r.right-2,clientY:r.top+r.height/2}));source.dispatchEvent(new DragEvent('dragend',{bubbles:true,cancelable:true,dataTransfer:data}));return true;})()`),true,'canvas blocked a selected record group drag');await wait();};
    const checkBadge=async selector=>assert.equal(await evaluate(`(async()=>{
        const {projectXYCanvas}=await import('/extensions/clab/components/workspace_modes/xy_axes.js'),stage=document.querySelector(${JSON.stringify(selector)}),wrapper=stage.querySelector('.clab-cards-wrapper'),matrix=new DOMMatrixReadOnly(getComputedStyle(wrapper).transform),camera={zoom:matrix.a,panX:matrix.e,panY:matrix.f},card=[...wrapper.querySelectorAll('.clab-card:not([hidden])')].find(card=>card.querySelector('.clab-external-import-icon')),source=card.querySelector(':scope > .clab-xy-history'),media=card.querySelector('img');
        let valid=true;
        for(const zoom of [1,3,6]){
            projectXYCanvas(stage,{...camera,zoom});
            const label=[...stage.querySelectorAll('.clab-xy-overlay > .clab-xy-history')].find(label=>label.xyCard===card),icon=label.querySelector('svg'),r=label.getBoundingClientRect(),c=card.getBoundingClientRect(),m=new DOMMatrixReadOnly(getComputedStyle(label.parentElement).transform);
            valid&&=label.textContent===source.textContent&&parseFloat(getComputedStyle(label).fontSize)===12*zoom&&Math.abs(icon.getBoundingClientRect().width-14*zoom)<.1&&Math.abs(r.right-(c.right-7*zoom))<.1&&Math.abs(r.top-(c.top+7*zoom))<.1&&m.a===1&&m.d===1&&!label.closest('.clab-cards-wrapper')&&getComputedStyle(source.querySelector('.clab-external-import-icon')).pointerEvents==='auto'&&getComputedStyle(label.querySelector('.clab-external-import-icon')).pointerEvents==='none'&&media===card.querySelector('img');
        }
        projectXYCanvas(stage,camera);
        const {updateXYHistoryLabel}=await import('/extensions/clab/components/workspace_modes/xy_history_label.js'),area=hx.model.matrixOutput(hx.ws.cards.find(item=>item.id===card.dataset.cardId),hx.ws.view.xy),badge=source.xyDisplay;
        updateXYHistoryLabel(card,{...area,history:[]});
        valid&&=!badge.isConnected&&!card.querySelector(':scope > .clab-xy-history');
        updateXYHistoryLabel(card,area);projectXYCanvas(stage,camera);return valid;
    })()`),true,'XY history badges were raster-scaled, misplaced, lost their tooltip target or recreated media');
    await evaluate(`(async()=>{
        const ui=await import('/extensions/clab/components/ui_state.js'),model=await import('/extensions/clab/components/workspace_modes/xy_model.js'),{setWorkspaceMode}=await import('/extensions/clab/components/workspace_modes/workspace_modes.js'),{createWorkspaceView}=await import('/extensions/clab/components/workspace_modes/view_state.js'),{workflowParameters}=await import('/extensions/clab/components/workspace_modes/parameters.js'),{addExternalMedia}=await import('/extensions/clab/components/contextmenu/content/preview_external_records.js'),{openWorkspacePreview}=await import('/extensions/clab/components/contextmenu/group_content.js'),{workspaceViewport}=await import('/extensions/clab/components/workspace_modes/viewport_components.js');
        ui.syncStateToActiveWorkspace();window.hx={ui,model,setMode:setWorkspaceMode,open:openWorkspacePreview,add:addExternalMedia,viewport:workspaceViewport,original:ui.getActiveWorkspace(),workspaces:[...ui.state.workspaces]};
        hx.nodes=[{id:981,type:'Sampler',widgets:[{name:'steps',type:'number',value:1},{name:'cfg',type:'number',value:1}]},{id:982,type:'SaveImage',widgets:[]}];window.testApp.graph._nodes.push(...hx.nodes);
        hx.ws=ui.createEmptyWorkspace('矩阵记录管理',{view:createWorkspaceView({mode:'xy',xy:{initialized:true,x:{bindings:['981||steps'],values:[1,2]},y:{bindings:['981||cfg'],values:[1]},outputNodeId:'982'}})});
        model.synchronizeMatrix(hx.ws.cards,hx.ws.view.xy,workflowParameters());hx.outputs=()=>hx.ws.cards.map(card=>model.matrixOutput(card,hx.ws.view.xy));
        hx.outputs().forEach((area,n)=>Object.assign(area,{history:['first','second','third'].map(name=>'/view?filename='+name+n+'.png'),historyRuns:[0,1,2].map(i=>({id:'generated-'+n+'-'+i})),historyIndex:0,resultUrl:'/view?filename=first'+n+'.png'}));
        addExternalMedia(hx.ws,['refs/input.png']);ui.state.workspaces.push(hx.ws);ui.applyWorkspaceToState(hx.ws);document.dispatchEvent(new Event('clab_render_ui'));
        hx.panel=document.querySelector('#clab-panel');hx.canvas=hx.panel.querySelector('#clab-cards-container');hx.area=n=>hx.canvas.querySelector('[data-area-id="'+hx.outputs()[n].id+'"]');hx.card=n=>hx.area(n)?.closest('.clab-card');
    })()`);await waitFor(`!!hx.area(0)?.querySelector('img')&&!!hx.area(1)?.querySelector('img')`);
    try{
        assert.equal(await evaluate(`hx.panel.querySelector('[data-xy-manage-history]').hidden`),true);
        await evaluate(`hx.untouched=hx.area(1).querySelector('img');hx.viewport(hx.canvas).parkCard(hx.card(0));hx.open();`);await wait();
        await evaluate(`(()=>{const root=document.querySelector('.clab-preview-modal.visible'),data=new DataTransfer();data.setData('application/x-clab-external-images',JSON.stringify([root.querySelector('[data-external-key]').dataset.externalKey]));root.querySelector('.clab-card').dispatchEvent(new DragEvent('drop',{bubbles:true,cancelable:true,dataTransfer:data}));})()`);await wait();
        assert.equal(await evaluate(`hx.outputs()[0].resultUrl.includes('input.png')&&hx.outputs()[0].historyIndex===3`),true,'import did not update the selected XY history: '+JSON.stringify(await evaluate(`({outputs:hx.outputs().map(area=>({url:area.resultUrl,index:area.historyIndex})),mode:document.querySelector('.clab-preview-modal.visible').dataset.reviewMode,cards:[...document.querySelectorAll('.clab-preview-modal.visible .clab-card')].map(card=>card.dataset.cardId)})`)));
        await checkBadge('.clab-preview-modal.visible .clab-review-grid-stage');
        await click('.clab-preview-modal.visible .clab-preview-modal-close');
        await waitFor(`hx.area(0)?.querySelector('.clab-preview-bg img')?.getAttribute('src')===hx.outputs()[0].resultUrl`);
        assert.equal(await evaluate(`hx.outputs()[0].historyIndex===3&&hx.area(1).querySelector('img')===hx.untouched`),true,'workspace return needed history keys or recreated unrelated media');
        await checkBadge('#clab-cards-container');
        console.log('PASS workspace and preview XY badges repaint SVG and history text at display resolution through 6x zoom without rebuilding media');
        console.log('PASS external XY import refreshes a cached workspace preview immediately on return without history navigation');
        await evaluate(`hx.viewport(hx.canvas).parkCard(hx.card(0));hx.add(hx.ws,['other.png']);hx.open();hx.panel.classList.remove('visible');`);await wait();
        await evaluate(`(()=>{const root=document.querySelector('.clab-preview-modal.visible'),data=new DataTransfer();data.setData('application/x-clab-external-images',JSON.stringify([root.querySelector('[data-external-key][title="other.png"]').dataset.externalKey]));root.querySelector('.clab-card').dispatchEvent(new DragEvent('drop',{bubbles:true,cancelable:true,dataTransfer:data}));})()`);await wait();
        await evaluate(`(async()=>{const surface=await import('/extensions/clab/components/panel_surface.js');surface.togglePanelSurface();surface.returnToWorkspace();})()`);
        await waitFor(`hx.area(0)?.querySelector('.clab-preview-bg img')?.getAttribute('src')===hx.outputs()[0].resultUrl`);
        assert.equal(await evaluate(`hx.outputs()[0].resultUrl.includes('other.png')&&hx.outputs()[0].historyIndex===4`),true,'shortcut return restored a stale cached image');

        await evaluate(`hx.card(0).dispatchEvent(new MouseEvent('click',{bubbles:true,button:0}));hx.card(1).dispatchEvent(new MouseEvent('click',{bubbles:true,button:0,ctrlKey:true}));`);await wait();
        assert.equal(await evaluate(`!hx.panel.querySelector('[data-xy-manage-history]').hidden&&hx.ui.state.selectedAreaIds.length===2&&!!(hx.panel.querySelector('[data-xy-manage-history]').compareDocumentPosition(hx.panel.querySelector('.clab-xy-tiling'))&Node.DOCUMENT_POSITION_FOLLOWING)`),true);
        await click('[data-xy-manage-history]');await waitFor(`hx.canvas.querySelectorAll('.clab-history-grid').length===2`);
        assert.equal(await evaluate(`hx.outputs().every(area=>area.isManageMode)&&hx.panel.querySelector('[data-xy-manage-history]').getAttribute('aria-pressed')==='true'&&[hx.card(0),hx.card(1)].every(card=>card.querySelector('.clab-history-grid').getBoundingClientRect().bottom<=card.getBoundingClientRect().bottom+1)`),true,'selected managers did not fit inside their matrix cells');
        assert.equal(await evaluate(`!hx.area(0).querySelector('.clab-output-manage-head,.clab-manage-remove-btn,.clab-output-controls')&&!!hx.canvas.querySelector('[data-xy-bind="output"]')`),true,'XY record management retained its title bar or lost axis output binding');
        assert.equal(await evaluate(`[...hx.canvas.querySelectorAll('.clab-xy-overlay > .clab-xy-history')].every(label=>label.hidden)`),true,'projected badges covered the history manager');
        const first=await evaluate(`hx.outputs()[0].id`),source=`#clab-panel [data-area-id="${first}"] .clab-history-thumb[data-index="0"]`;
        await evaluate(`hx.canvas.click()`);await click(source);
        await evaluate(`hx.thumbSelection=hx.outputs().map(area=>[...(area.selectedThumbIndices||[])]);`);
        await clickGrid(1,2);assert.equal(await evaluate(`hx.ui.state.selectedAreaIds.length===2`),true,'Ctrl click on managed-grid padding did not add the outer matrix cell');
        await clickGrid(1,2);assert.deepEqual(await evaluate(`hx.ui.state.selectedAreaIds`),[first],'Ctrl click did not deselect the managed outer matrix cell');
        await clickGrid(0,8);assert.equal(await evaluate(`hx.ui.state.selectedAreaIds.length===2&&JSON.stringify(hx.thumbSelection)===JSON.stringify(hx.outputs().map(area=>area.selectedThumbIndices||[]))`),true,'Shift selection did not span managed matrix cells or changed inner record selection');
        assert.equal(await evaluate(`!hx.canvas.querySelector('.clab-history-drag')`),true,'XY history thumbnails retained the sorting handle');
        await click(source);
        await evaluate(`hx.outerSelection=[...hx.ui.state.selectedAreaIds];`);
        const third=`#clab-panel [data-area-id="${first}"] .clab-history-thumb[data-index="2"]`,next=`#clab-panel [data-area-id="${first}"] .clab-history-thumb[data-index="1"]`;
        await click(third,2);assert.deepEqual(await evaluate(`hx.outputs()[0].selectedThumbIndices`),[0,2],'Ctrl click did not add the history record');
        await click(third,2);assert.deepEqual(await evaluate(`hx.outputs()[0].selectedThumbIndices`),[0],'Ctrl click did not deselect the history record');
        await click(source);await click(next,8);
        assert.equal(await evaluate(`JSON.stringify(hx.outputs()[0].selectedThumbIndices)==='[0,1]'&&JSON.stringify(hx.ui.state.selectedAreaIds)===JSON.stringify(hx.outerSelection)&&JSON.stringify(hx.outputs()[1].selectedThumbIndices||[])===JSON.stringify(hx.thumbSelection[1])`),true,'Shift record selection changed the outer matrix selection or peer records');
        await evaluate(`hx.batchHistory=[...hx.outputs()[0].history];hx.batchRuns=hx.outputs()[0].historyRuns.map(run=>run?.id);hx.batchCamera=[hx.ws.view.xy.panX,hx.ws.view.xy.panY,hx.ws.view.xy.zoom];`);
        await moveRecords(0,4,'right');
        assert.equal(await evaluate(`JSON.stringify(hx.outputs()[0].history)===JSON.stringify([2,3,4,0,1].map(i=>hx.batchHistory[i]))&&JSON.stringify(hx.outputs()[0].historyRuns.map(run=>run?.id))===JSON.stringify([2,3,4,0,1].map(i=>hx.batchRuns[i]))&&JSON.stringify(hx.outputs()[0].selectedThumbIndices)==='[3,4]'&&JSON.stringify(hx.ui.state.selectedAreaIds)===JSON.stringify(hx.outerSelection)&&JSON.stringify(hx.batchCamera)===JSON.stringify([hx.ws.view.xy.panX,hx.ws.view.xy.panY,hx.ws.view.xy.zoom])`),true,'group dragging moved only one record or changed provenance, camera or outer selection');
        await moveRecords(3,0,'left');assert.deepEqual(await evaluate(`hx.outputs()[0].history`),await evaluate(`hx.batchHistory`));
        console.log('PASS managed XY history Ctrl/Shift multi-selection and group reordering coexist with independent outer matrix selection');
        await click(source);
        await evaluate(`hx.gestureHistory=hx.outputs().map(area=>[...area.history]);hx.gestureThumbs=[...(hx.outputs()[0].selectedThumbIndices||[])];hx.gestureSelection=[...hx.ui.state.selectedAreaIds];`);
        for(const button of ['left','middle']){
            const start=await evaluate(`(()=>{const node=${JSON.stringify(button)}==='left'?hx.area(0).querySelector('.clab-history-grid'):document.querySelector(${JSON.stringify(source)}),r=node.getBoundingClientRect(),x=${JSON.stringify(button)}==='left'?r.left+2:r.left+r.width/2,y=${JSON.stringify(button)}==='left'?r.top+2:r.top+r.height/2,hit=document.elementFromPoint(x,y);return{x,y,hit:node.contains(hit),target:hit?.className};})()`),before=await evaluate(`hx.canvas.querySelector('.clab-cards-wrapper').style.transform`);
            assert.equal(start.hit,true,button+' gesture missed the managed grid: '+JSON.stringify(start));
            await send('Input.dispatchMouseEvent',{type:'mousePressed',button,buttons:button==='left'?1:4,clickCount:1,...start},sessionId);
            for(let i=1;i<=4;i++)await send('Input.dispatchMouseEvent',{type:'mouseMoved',button,buttons:button==='left'?1:4,x:start.x+8*i,y:start.y+4*i},sessionId);
            await send('Input.dispatchMouseEvent',{type:'mouseReleased',button,buttons:0,clickCount:1,x:start.x+32,y:start.y+16},sessionId);await wait();
            assert.notEqual(await evaluate(`hx.canvas.querySelector('.clab-cards-wrapper').style.transform`),before,button+' drag in the managed grid did not pan');
        }
        const wheel=await evaluate(`(()=>{const r=document.querySelector(${JSON.stringify(source)}).getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2};})()`),oldZoom=await evaluate(`hx.ws.view.xy.zoom`);
        await send('Input.dispatchMouseEvent',{type:'mouseWheel',deltaX:0,deltaY:-80,...wheel},sessionId);await wait();
        assert.notEqual(await evaluate(`hx.ws.view.xy.zoom`),oldZoom,'wheel on a managed thumbnail did not zoom');
        assert.equal(await evaluate(`JSON.stringify(hx.gestureHistory)===JSON.stringify(hx.outputs().map(area=>area.history))&&JSON.stringify(hx.gestureThumbs)===JSON.stringify(hx.outputs()[0].selectedThumbIndices||[])&&JSON.stringify(hx.gestureSelection)===JSON.stringify(hx.ui.state.selectedAreaIds)`),true,'canvas gestures reordered history or changed selection');
        await evaluate(`hx.grid=hx.area(0).querySelector('.clab-history-grid');hx.gridStyle=hx.grid.style.cssText;hx.grid.style.setProperty('max-height','50px','important');hx.scrollZoom=hx.ws.view.xy.zoom;`);
        const scrollPoint=await evaluate(`(()=>{const r=hx.grid.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+5};})()`);
        await send('Input.dispatchMouseEvent',{type:'mouseWheel',deltaX:0,deltaY:60,modifiers:8,...scrollPoint},sessionId);await wait();
        assert.equal(await evaluate(`hx.grid.scrollTop>0&&hx.ws.view.xy.zoom===hx.scrollZoom`),true,'Shift wheel did not scroll history independently');
        await evaluate(`hx.grid.style.cssText=hx.gridStyle;hx.grid.scrollTop=0`);
        console.log('PASS managed XY grids retain Ctrl/Shift outer selection, wheel zoom, blank-area left pan, middle pan and Shift-wheel history scrolling');
        await evaluate(`hx.before=[...hx.outputs()[0].history];hx.camera=[hx.ws.view.xy.panX,hx.ws.view.xy.panY,hx.ws.view.xy.zoom];hx.peer=[...hx.outputs()[1].history];`);
        const point=await evaluate(`(()=>{const r=document.querySelector(${JSON.stringify(source)}).getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2};})()`);
        await send('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',buttons:1,clickCount:1,...point},sessionId);
        assert.equal(await evaluate(`(()=>{const data=new DataTransfer(),source=hx.area(0).querySelector('[data-index="0"].clab-history-thumb'),target=hx.area(0).querySelector('[data-index="'+(hx.before.length-1)+'"].clab-history-thumb'),r=target.getBoundingClientRect(),start=new DragEvent('dragstart',{bubbles:true,cancelable:true,dataTransfer:data});source.dispatchEvent(start);if(start.defaultPrevented)return false;for(const type of ['dragover','drop'])target.dispatchEvent(new DragEvent(type,{bubbles:true,cancelable:true,dataTransfer:data,clientX:r.right-2,clientY:r.top+r.height/2}));source.dispatchEvent(new DragEvent('dragend',{bubbles:true,cancelable:true,dataTransfer:data}));return true;})()`),true,'canvas panning blocked direct history thumbnail dragging');
        await send('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',buttons:0,clickCount:1,...point},sessionId);await wait();
        assert.equal(await evaluate(`JSON.stringify(hx.outputs()[0].history)===JSON.stringify([...hx.before.slice(1),hx.before[0]])&&JSON.stringify(hx.outputs()[1].history)===JSON.stringify(hx.peer)&&hx.outputs()[0].externalImports[0].position===2&&hx.ui.state.selectedAreaIds.length===2&&JSON.stringify(hx.camera)===JSON.stringify([hx.ws.view.xy.panX,hx.ws.view.xy.panY,hx.ws.view.xy.zoom])`),true,'history reorder changed the matrix selection, camera, peer history or import provenance');
        await evaluate(`hx.area(0).querySelector('.clab-thumb-delete[data-index="1"]').click();`);await wait();
        assert.equal(await evaluate(`hx.outputs()[0].history.length===hx.before.length-1&&hx.outputs()[1].history.length===3&&hx.ws.view.previewExternal.images.length===2`),true);
        await evaluate(`hx.canvas.click()`);await wait();assert.equal(await evaluate(`hx.panel.querySelector('[data-xy-manage-history]').hidden`),true);
        await click(source);assert.equal(await evaluate(`hx.ui.state.selectedAreaIds.length===1&&hx.ui.state.selectedAreaIds[0]===hx.outputs()[0].id&&!hx.panel.querySelector('[data-xy-manage-history]').hidden&&hx.panel.querySelector('[data-xy-manage-history]').getAttribute('aria-pressed')==='true'`),true,'a managed grid could not be selected again after deselection');
        await clickGrid(0,2);assert.equal(await evaluate(`hx.ui.state.selectedAreaIds.length===0&&hx.panel.querySelector('[data-xy-manage-history]').hidden`),true,'Ctrl click on grid padding did not toggle the managed outer cell off');
        await click(source);
        await click('[data-xy-manage-history]');await waitFor(`!hx.area(0).querySelector('.clab-history-grid')`);
        const second=await evaluate(`hx.outputs()[1].id`);await click(`#clab-panel [data-area-id="${second}"] .clab-history-thumb[data-index="0"]`);
        await click('[data-xy-manage-history]');await waitFor(`!hx.canvas.querySelector('.clab-history-grid')`);
        await evaluate(`hx.setMode(hx.panel,'cards')`);await wait();
        await click(`#clab-panel [data-area-id="${first}"] .clab-preview-bg`);await click('#tb-manage-history');
        assert.equal(await evaluate(`!!hx.area(0).querySelector('.clab-output-manage-head .clab-manage-remove-btn')&&!!hx.area(0).querySelector('.clab-output-manage-head .clab-output-controls')`),true,'the task-card record manager lost its existing title bar');
        assert.deepEqual(await evaluate('window.testProgress.errors'),[]);
        console.log('PASS XY record managers reselect after deselection, retain thumbnail gestures without a title bar, and preserve task-card manager controls');
    }finally{
        await evaluate(`document.querySelector('.clab-preview-modal.visible .clab-preview-modal-close')?.click();hx.ui.state.workspaces=hx.workspaces;hx.ui.applyWorkspaceToState(hx.original);window.testApp.graph._nodes=window.testApp.graph._nodes.filter(node=>!hx.nodes.includes(node));document.dispatchEvent(new Event('clab_render_ui'));`);
    }
}
