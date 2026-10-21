export async function checkXYPerformance() {
    const assert=(condition,message)=>{if(!condition)throw new Error(message);},delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
    const {state,createEmptyWorkspace,getActiveWorkspace,syncStateToActiveWorkspace,applyWorkspaceToState,buildPersistedState}=await import('/extensions/clab/components/ui_state.js');
    const {synchronizeMatrix,matrixCells,matrixOutput}=await import('/extensions/clab/components/workspace_modes/xy_model.js');
    const {StateManager}=await import('/extensions/clab/state_manager.js');
    const {createWorkspaceView}=await import('/extensions/clab/components/workspace_modes/view_state.js');
    syncStateToActiveWorkspace();const original=getActiveWorkspace(),workspaces=[...state.workspaces],passed=[],panel=document.querySelector('#clab-panel'),container=panel.querySelector('#clab-cards-container'),q=selector=>panel.querySelector(selector);
    const node={id:210,title:'性能参数',widgets:[{name:'x',type:'number',value:1},{name:'y',type:'number',value:1},{name:'z',type:'number',value:1}]},parameters=node.widgets.map(w=>({key:`210||${w.name}`,name:w.name,type:'number',value:1}));
    window.testApp.graph._nodes.push(node);
    let blobURL,builds=0,originalSync=StateManager.syncToNode;
    const make=(name,x,y,z)=>{
        const view=createWorkspaceView({mode:'xy',xy:{initialized:true,x:{bindings:['210||x'],values:x},y:{bindings:['210||y'],values:y},z:{enabled:true,bindings:['210||z'],values:z},outputNodeId:'211'}}),cards=[];
        synchronizeMatrix(cards,view.xy,parameters);return createEmptyWorkspace(name,{cards,view});
    };
    const show=w=>{if(!state.workspaces.includes(w))state.workspaces.push(w);applyWorkspaceToState(w);document.dispatchEvent(new Event('clab_render_ui'));};
    const selectLayer=index=>q(`[data-xy-z-layer="${index}"]`).click();
    const entries=()=>performance.getEntriesByType('resource').map(entry=>entry.name);
    const areaNode=area=>q(`.clab-area[data-area-id="${area.id}"]`);
    const grid=make('45格按需加载',[1,2,3],[1,2,3],[1,2,3,4,5]);let xy=grid.view.xy;
    for(const cell of matrixCells(grid.cards,xy)){
        const area=matrixOutput(cell.card,xy);area.resultUrl=`/view?filename=xy-perf-layer-${cell.z}-${cell.x}-${cell.y}.png`;area.history=[area.resultUrl];area.historyIndex=0;
        area.mediaSize={url:area.resultUrl,width:320,height:180};
    }
    window.xyPerf={grid,cleanup(){StateManager.syncToNode=originalSync;state.workspaces=workspaces;applyWorkspaceToState(original);document.dispatchEvent(new Event('clab_render_ui'));const index=window.testApp.graph._nodes.indexOf(node);if(index>=0)window.testApp.graph._nodes.splice(index,1);if(blobURL)URL.revokeObjectURL(blobURL);}};
    show(grid);xy=grid.view.xy;await delay(140);
    const visible=[...q('.clab-cards-wrapper').querySelectorAll('.clab-card:not([hidden])')];
    assert(visible.length===9&&q('.clab-cards-wrapper').querySelectorAll('img').length===9,'initial XY view initialized hidden-layer images or input controls');
    assert(!entries().some(url=>/xy-perf-layer-[1-4]-/.test(url)),'hidden Z images were requested before their first display');
    const deferred=q('.clab-cards-wrapper').querySelectorAll('[data-clab-deferred]').length;
    assert(deferred===171,`unexpected number of deferred output/input modules: ${deferred}; ${state.cards.length} tasks / ${state.cards.reduce((sum,c)=>sum+c.areas.length,0)} areas`);
    passed.push('45-cell XYZ starts with only nine media elements and requests, while all tasks and histories remain stored');

    const first=matrixCells(grid.cards,xy).find(cell=>cell.x===0&&cell.y===0&&cell.z===0),firstArea=matrixOutput(first.card,xy),image=areaNode(firstArea).querySelector('img');
    selectLayer(1);await delay(100);assert(!entries().some(url=>/xy-perf-layer-[2-4]-/.test(url)),'visiting one Z layer loaded unrelated layers');
    firstArea.resultUrl='/view?filename=xy-perf-pending.png';firstArea.history.push(firstArea.resultUrl);firstArea.historyIndex=1;window._clabSurgicallyUpdateArea(firstArea.id);await delay(80);
    assert(areaNode(firstArea).hasAttribute('data-clab-pending-refresh')&&!entries().some(url=>url.includes('xy-perf-pending.png')),'new output on a hidden visited layer loaded immediately');
    selectLayer(0);await delay(100);assert(areaNode(firstArea).querySelector('img')===image&&image.getAttribute('src')===firstArea.resultUrl,'returning to a visited layer replaced its image instead of applying the pending result');
    passed.push('Z switching loads only the requested layer and applies hidden results on return without replacing the existing image');

    const axis=q('.axis-x'),tick=q('[data-xy-edit-values=x][data-xy-tick="0"]'),zTick=q('[data-xy-z-layer="0"]');
    let axisChanges=0;const observer=new MutationObserver(records=>{axisChanges+=records.length;});observer.observe(axis,{attributes:true,attributeFilter:['style']});
    const before=axis.getBoundingClientRect(),left=axis.style.left;xy.panX+=25;xy.panY+=15;
    const {projectXYCanvas}=await import('/extensions/clab/components/workspace_modes/xy_axes.js');projectXYCanvas(container,xy);await delay(0);
    const after=axis.getBoundingClientRect();assert(axis.style.left===left&&axisChanges===0&&Math.abs(after.left-before.left-25)<.01&&Math.abs(after.top-before.top-15)<.01,'panning changed each axis position or failed to move the complete overlay');observer.disconnect();
    const overlay=q('.clab-xy-overlay'),oldScale=xy.zoom;xy.zoom*=1.1;projectXYCanvas(container,xy);
    assert(Math.abs(parseFloat(getComputedStyle(tick).fontSize)/xy.zoom-12)<.01&&!overlay.style.transform.includes('scale'),'zoom raster-scaled axis text instead of drawing at its display size');xy.zoom=oldScale;projectXYCanvas(container,xy);
    passed.push('pan moves the complete overlay without per-label style mutations; zoom preserves sharp text and matching coordinates');

    let scaleWrites=0;const layoutObserver=new MutationObserver(records=>{scaleWrites+=records.length;});layoutObserver.observe(tick,{attributes:true,attributeFilter:['style']});
    const images=[...container.querySelectorAll('img')];for(let i=0;i<20;i++)for(const img of images)img.dispatchEvent(new Event('load'));
    await delay(80);assert(scaleWrites===0&&q('[data-xy-edit-values=x][data-xy-tick="0"]')===tick&&q('[data-xy-z-layer="0"]')===zTick,'unchanged media dimensions rebuilt axes or scheduled full layout updates');
    passed.push('bursts of unchanged image loads retain axis/tick identities and skip matrix layout');
    for(const cell of matrixCells(grid.cards,xy)){const area=matrixOutput(cell.card,xy);area.mediaSize={url:area.resultUrl,width:320,height:320};}
    for(let i=0;i<20;i++)for(const img of images)img.dispatchEvent(new Event('load'));
    await delay(80);const ratioHeight=parseFloat(q('.clab-cards-wrapper').style.getPropertyValue('--xy-media-height'));
    assert(scaleWrites>0&&scaleWrites<=3&&q('[data-xy-edit-values=x][data-xy-tick="0"]')===tick&&Math.abs(ratioHeight-320)<.01,`changed media sizes did not coalesce into one layout with reused axis ticks: ${scaleWrites} overlay writes, height ${ratioHeight}`);
    layoutObserver.disconnect();passed.push('changed image proportions coalesce into one layout pass and retain axis/tick elements');

    StateManager.syncToNode=function(...args){builds++;return originalSync.apply(this,args);};
    const r=container.getBoundingClientRect(),cx=r.left+r.width*.6,cy=r.top+r.height*.5;
    const burstStart=xy.zoom;for(let i=0;i<20;i++)container.dispatchEvent(new WheelEvent('wheel',{bubbles:true,cancelable:true,clientX:cx,clientY:cy,deltaY:-1}));
    assert(xy.zoom>burstStart&&builds===0,'wheel input failed to update state immediately or serialized the workflow per event');
    let projectionWrites=0;const projectionObserver=new MutationObserver(records=>{projectionWrites+=records.length;});projectionObserver.observe(overlay,{attributes:true,attributeFilter:['style']});
    await new Promise(requestAnimationFrame);await delay(0);projectionObserver.disconnect();assert(projectionWrites<=2,'a burst of wheel events projected the overlay more than once per frame');
    const saved=JSON.parse(window.testApp.graph.serialize().nodes[0].widgets_values[0]);
    assert(saved.workspaces.find(w=>w.id===grid.id).view.xy.zoom===xy.zoom&&builds===1,'workflow serialization did not flush the final camera');await delay(240);assert(builds===1,'a stale view save ran after serialization');
    for(let i=0;i<20;i++)container.dispatchEvent(new WheelEvent('wheel',{bubbles:true,cancelable:true,clientX:cx,clientY:cy,deltaY:1}));
    await delay(240);assert(builds===2,'an idle wheel gesture did not produce exactly one saved configuration');StateManager.syncToNode=originalSync;
    passed.push('wheel bursts update state immediately, save once after idle and flush exactly once before workflow serialization');

    const canvas=document.createElement('canvas');canvas.width=160;canvas.height=90;const context=canvas.getContext('2d');context.fillStyle='#658';context.fillRect(0,0,160,90);
    const stream=canvas.captureStream(10),recorder=new MediaRecorder(stream,{mimeType:'video/webm'}),chunks=[];recorder.ondataavailable=e=>chunks.push(e.data);const ended=new Promise(resolve=>{recorder.onstop=resolve;});recorder.start();const drawing=setInterval(()=>{context.fillStyle=`hsl(${performance.now()%360},50%,50%)`;context.fillRect(0,0,160,90);},70);await delay(700);recorder.stop();await ended;clearInterval(drawing);stream.getTracks().forEach(track=>track.stop());blobURL=URL.createObjectURL(new Blob(chunks,{type:'video/webm'}));
    const mixed=make('混合媒体按需加载',[1,2,3,4],[1],[1,2,3,4,5]),types=['image','video','audio','model'];
    for(const cell of matrixCells(mixed.cards,mixed.view.xy)){
        const area=matrixOutput(cell.card,mixed.view.xy),ext=['png','webm','wav','glb'][cell.x];area.resultKind=types[cell.x];area.resultUrl=ext==='webm'?`${blobURL}#layer-${cell.z}.webm`:`/view?filename=xy-perf-mixed-${cell.z}.${ext}`;area.history=[area.resultUrl];area.historyIndex=0;
    }
    show(mixed);for(let i=0;i<80&&!q('.clab-glb-viewer canvas');i++)await delay(30);
    const video=q('video.clab-media-target'),audio=q('audio.clab-media-target'),model=q('.clab-glb-viewer'),modelCanvas=model.querySelector('canvas');
    for(let i=0;i<60&&video.readyState<2;i++)await delay(30);video.currentTime=.2;video.pause();audio.currentTime=.2;audio.pause();
    assert(!entries().some(url=>/xy-perf-mixed-[12]\.(glb|wav|png)/.test(url)),'hidden models/audio/images initialized before display');
    selectLayer(1);await delay(80);selectLayer(0);await delay(80);
    assert(q('video.clab-media-target')===video&&Math.abs(video.currentTime-.2)<.08&&video.paused&&q('audio.clab-media-target')===audio&&q('.clab-glb-viewer')===model&&model.querySelector('canvas')===modelCanvas,'layer switches reset paused media or rebuilt the 3D viewer');
    passed.push('hidden images/audio/models defer initialization and revisiting a layer preserves player times and the same 3D canvas');
    q('[data-workspace-mode=cards]').click();await delay(80);assert(!q('[data-clab-deferred]')&&q('video.clab-media-target')===video&&q('.clab-glb-viewer')===model,'card conversion failed to materialize deferred modules or replaced existing players');
    const persisted=buildPersistedState().workspaces.find(w=>w.id===mixed.id);assert(persisted.cards.length===20&&persisted.cards.every(c=>matrixOutput(c,mixed.view.xy).history.length===1),'media deferral removed task data or history');
    passed.push('card conversion materializes deferred inputs/outputs while retaining existing media, tasks and histories');
    window.xyPerf.prepareModels=async()=>{
        mixed.view.mode='xy';mixed.view.xy.z.current=0;show(mixed);
        for(let i=0;i<100&&!q('.clab-glb-viewer[data-model-loaded="1"]');i++)await delay(30);
        const stage=q('.clab-glb-viewer[data-model-loaded="1"]'),canvas=stage?.querySelector('canvas');assert(canvas,'initial model did not load');window.xyPerf.cachedStage=stage;window.xyPerf.cachedCanvas=canvas;
        const r=canvas.getBoundingClientRect();return{x:r.left+r.width*.5,y:r.top+r.height*.5};
    };
    window.xyPerf.captureModel=async()=>{
        const {captureModelPreview}=await import('/extensions/clab/components/modules/media_types/media_model.js');return captureModelPreview(window.xyPerf.cachedStage);
    };
    window.xyPerf.evictModel=async()=>{
        for(let z=1;z<5;z++){
            selectLayer(z);for(let i=0;i<100&&!q(`.clab-card:not([hidden]) .clab-glb-viewer[data-model-loaded="1"]`);i++)await delay(30);await delay(40);
            assert(container.querySelectorAll('.clab-card[hidden] .clab-glb-viewer canvas').length<=3,'hidden 3D cache exceeded its GPU-context budget');
        }
        assert(!window.xyPerf.cachedStage.querySelector('canvas'),'oldest hidden 3D renderer was not released');
        selectLayer(0);for(let i=0;i<100&&!window.xyPerf.cachedStage.dataset.modelLoaded;i++)await delay(30);await delay(80);
        return window.xyPerf.cachedStage.querySelector('canvas')!==window.xyPerf.cachedCanvas;
    };
    show(grid);q('[data-xy-reset]').click();window.xyPerf.passed=passed;return passed;
}
