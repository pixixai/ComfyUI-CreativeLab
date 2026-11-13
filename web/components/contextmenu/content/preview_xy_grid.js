import { axisLabelControlsHTML, attachAxisLabelControls } from '../../workspace_modes/axis_label_controls.js';
import { swapMatrixAxes } from '../../workspace_modes/xy_axis_swap.js';
import { attachXYGestures } from '../../workspace_modes/xy_gestures.js';
import { selectXYCells } from '../../workspace_modes/xy_layout.js';
import { fitXYCanvas } from '../../workspace_modes/xy_canvas.js';
import { projectXYCanvas } from '../../workspace_modes/xy_axes.js';
import { showXYMode, xyMediaRatio } from '../../workspace_modes/mode_xy.js';
import { matrixOutput, currentZLayer, matrixCells, visibleMatrixCells } from '../../workspace_modes/xy_model.js';
import { workflowParameters } from '../../workspace_modes/parameters.js';
import { renderReviewArea, attachReviewGridMedia, releaseReviewGridMedia, reviewHistoryDirection, stepReviewGridOutput } from './preview_grid_media.js';
import { workspaceMatrixAvailable, xySourceSetting } from './preview_workspace_sheets.js';
import { outputDownloadRecords } from './preview_downloads.js';
import { xyTilingControls, applyXYTiling } from '../../workspace_modes/xy_tiling.js';
import { renderXYRecordTable } from './preview_xy_records.js';
import { createPreviewXYSources, xyRecordRows } from './preview_xy_sources.js';
import { openZLayerOptions } from '../../workspace_modes/xy_options.js';
import { closeXYPopover } from '../../workspace_modes/xy_popover.js';
import { updateXYHistoryLabel } from '../../workspace_modes/xy_history.js';

let previewXYSequence=0;
export function createPreviewXYGrid(center,left,right,changed,exportControls,cameraChanged=()=>{},recordsChanged=()=>{},tilesChanged=()=>{},options={}) {
    const instance=++previewXYSequence;
    let xy,cards,orientation,records,parameters,stage,wrapper,frame=0,ratio;
    let camera,viewport,fitFrame=0,sourcePanel,activeCardId='',anchorId='',recordRows=[],recordZoom;
    const selected=new Set(),histories=new Map(),selectedLayers=new Set(),layerViews=new Map();
    let selectionKind='',settingsView;
    const targetView=()=>layerViews.get([...selectedLayers][0])||xy;
    const layerView=(z,display)=>{
        const own=layerViews.get(z)||xy;
        return {...display,origin:own.origin,hiddenAxes:own.hiddenAxes,hiddenBindings:own.hiddenBindings,
            ...Object.fromEntries(['x','y'].map(name=>[name,{...display[name],...Object.fromEntries(['gap','margin','labelAngle','labelAnchor'].map(key=>[key,own[name][key]]))}]))};
    };
    const updateTargets=(change,global=false)=>{
        if(!selectedLayers.size||global){change(xy);for(const view of layerViews.values())change(view);orientation=xy.origin;}
        else for(const z of selectedLayers){let view=layerViews.get(z);if(!view){view={...xy,x:{...xy.x},y:{...xy.y},hiddenAxes:[...xy.hiddenAxes],hiddenBindings:[...xy.hiddenBindings]};layerViews.set(z,view);}change(view);}
    };
    const selectionChanged=event=>{options.selection?.({kind:selectionKind,event});renderSettings(currentConfig);changed();};
    let currentConfig;
    const applyAxisSettings=(name,values)=>{updateTargets(view=>Object.assign(view[name],values),name==='z');render();};
    const outputFor=(card,display)=>{
        const output=matrixOutput(card,display);
        return histories.get(output?.id)||output;
    };
    function paintSelection() {
        for (const cell of wrapper.querySelectorAll(':scope > .clab-card')) cell.classList.toggle('selected',selected.has(cell.dataset.cardId));
        for(const title of stage.querySelectorAll('.clab-xy-layer-title'))title.setAttribute('aria-pressed',String(selectedLayers.has(Number(title.dataset.xyZLayer))));
        const card=cards.find(card=>card.id===activeCardId);sourcePanel.info(card,card?outputFor(card,displayXY()):null,selected.size);
    }

    const displayXY = () => ({...sourcePanel.display(),...camera,origin:orientation});
    const layoutRecords = display => {const first=display.z.enabled&&display.z.display!=='all'?currentZLayer(display):0;renderXYRecordTable(stage,wrapper,{...display,origin:(layerViews.get(first)||xy).origin},recordRows);recordZoom=display.zoom;};
    const syncCamera = () => { xy.cameraReady=true;cameraChanged(camera); };
    const updateCamera = () => { cancelAnimationFrame(fitFrame);const display=displayXY();projectXYCanvas(stage,display);if(recordZoom!==display.zoom)layoutRecords(display);syncCamera(); };
    const fit = () => {
        cancelAnimationFrame(fitFrame);
        fitFrame=requestAnimationFrame(()=>{
            if (!stage?.isConnected || !wrapper.offsetWidth) return;
            render();
            const next=displayXY();fitXYCanvas(stage,next);
            camera={zoom:next.zoom,panX:next.panX,panY:next.panY};
            layoutRecords(displayXY());syncCamera();
        });
    };
    const saveTiling = () => tilesChanged({display:xy.z.display,tiling:{...xy.tiling}});
    const showLayer = value => {
        const previous=xy.z.display;
        if (value === 'all') xy.z.display='all';
        else { if(xy.z.enabled)xy.z.current=Number(value);xy.z.display='single'; }
        cancelAnimationFrame(fitFrame);selected.clear();selectedLayers.clear();selectionKind='';activeCardId=anchorId='';render();if(previous!==xy.z.display)saveTiling();
    };
    const render = () => {
        if (!stage?.isConnected) return;
        const tileToggle=right.querySelector('[data-review-xy-tiles]');if(tileToggle)tileToggle.checked=xy.z.display==='all';
        const tileFields=right.querySelector('.clab-xy-tiling-inline');if(tileFields)tileFields.hidden=xy.z.display!=='all';
        const display=displayXY(),items=sourcePanel.hasValues()?visibleMatrixCells(cards,display):[];
        const visible=new Set(items.map(item=>item.card.id));for(const id of selected)if(!visible.has(id))selected.delete(id);
        if(!selected.has(activeCardId))activeCardId=[...selected].at(-1)||'';
        const existing=new Map([...wrapper.querySelectorAll(':scope > .clab-card')].map(card=>[card.dataset.cardId,card]));
        for (const {card} of items) {
            const output=outputFor(card,display);
            if (!output) continue;
            let cell=existing.get(card.id);
            existing.delete(card.id);
            if (!cell) {
                cell=document.createElement('div');
                cell.className='clab-card';cell.dataset.cardId=card.id;
                const area=renderReviewArea(output,card);
                cell.append(area);wrapper.append(cell);attachReviewGridMedia(area);
            }

        }
        for (const stale of existing.values()) { releaseReviewGridMedia(stale);stale.remove(); }
        if(!sourcePanel.hasValues()){
            wrapper.querySelectorAll('.clab-xy-empty').forEach(element=>element.remove());stage.querySelector('.clab-xy-overlay')?.remove();
            wrapper.style.width=wrapper.style.height='0px';
            if(!stage.querySelector('.clab-review-xy-empty'))stage.insertAdjacentHTML('beforeend','<p class="clab-review-xy-empty">请在左侧勾选要显示的 X、Y 轴取值</p>');
            paintSelection();changed();return;
        }
        stage.querySelector('.clab-review-xy-empty')?.remove();
        showXYMode(wrapper,cards,display,parameters,{preview:true,layerViews:z=>layerView(z,display)});
        recordRows=xyRecordRows(items.map(({card})=>outputFor(card,display)),xy.records,records,parameters);layoutRecords(display);
        for (const cell of wrapper.querySelectorAll(':scope > .clab-card')) {
            const history=histories.get(cell.querySelector('.clab-output-area')?.dataset.areaId);
            if (history) updateXYHistoryLabel(cell,history);
        }
        paintSelection();
        stage.dataset.hiddenAxes=xy.hiddenAxes.includes('z')?'z':'';
        stage.dataset.hiddenBindings=xy.hiddenBindings.includes('z')?'z':'';
        for(const group of stage.querySelectorAll('.clab-xy-layer-axes')){
            const view=layerView(Number(group.dataset.xyLayer),display);
            group.dataset.hiddenAxes=view.hiddenAxes.filter(name=>name!=='z').join(' ');group.dataset.hiddenBindings=view.hiddenBindings.filter(name=>name!=='z').join(' ');
        }
        for (const element of stage.querySelectorAll('[data-xy-bind],[data-xy-edit-values]')) element.tabIndex=-1;
        ratio=xyMediaRatio(wrapper,matrixCells(cards,display),display);
        changed();
    };
    const renderSettings = config => {
        currentConfig=config;settingsView=structuredClone(targetView());
        const names=xy.z.enabled?['x','y','z']:['x','y'];
        const configured=workspaceMatrixAvailable(xy);
        right.innerHTML=`<div class="clab-review-sheet-settings">
            <section><h3>矩阵显示</h3>${options.grouped?'':xySourceSetting(config)}<div class="clab-review-xy-tiling-section">${xyTilingControls(xy,true)}</div>
            <div class="clab-review-xy-visibility"><span>坐标轴</span><span>绑定摘要</span>${['x','y','z'].map(name=>
                `<label class="clab-review-check"><input type="checkbox" data-review-xy-show="axes" value="${name}"${!settingsView.hiddenAxes.includes(name)?' checked':''}>显示 ${name.toUpperCase()} 轴</label>
                <label class="clab-review-check"><input type="checkbox" data-review-xy-show="bindings" value="${name}"${!settingsView.hiddenBindings.includes(name)?' checked':''}>显示 ${name.toUpperCase()} 轴摘要</label>`).join('')}</div>
            <div class="clab-review-xy-options" role="group" aria-label="轴向">${[['bottom','Y 轴向上'],['top','Y 轴向下']].map(([value,label])=>
                `<label class="clab-review-check"><input type="radio" name="clab-review-xy-orientation-${instance}" data-review-xy-orientation value="${value}"${value===settingsView.origin?' checked':''}>${label}</label>`).join('')}</div>
            <div class="clab-review-xy-options" role="group" aria-label="交换坐标轴">${['xy','xz','yz'].map(pair=>
                `<button type="button" data-review-xy-swap="${pair}"${pair.includes('z')&&!xy.z.enabled?' disabled':''}>${[...pair.toUpperCase()].join(' ↔ ')}</button>`).join('')}</div>
            <button type="button" data-review-xy-fit>适配视图</button></section>
            <section><h3>轴设置</h3>${names.map(name=>`<details class="clab-review-axis-settings" data-review-axis="${name}"${name==='x'?' open':''}><summary>${name.toUpperCase()} 轴</summary>
                ${name==='z'?'':`<div class="clab-xy-axis-spacing">${[['gap','间距'],['margin','边距']].map(([key,label])=>
                    `<label>${label}<input type="number" min="0" step="1" value="${settingsView[name][key]}" data-review-xy-spacing="${key}" aria-label="${name.toUpperCase()}轴${label}"></label>`).join('')}</div>`}
                ${axisLabelControlsHTML()}</details>`).join('')}</section>
            ${configured?exportControls:''}</div>`;
        for (const section of right.querySelectorAll('[data-review-axis]')) {
            const name=section.dataset.reviewAxis;
            attachAxisLabelControls(section,name,()=>settingsView,()=>{const values={labelAngle:settingsView[name].labelAngle,labelAnchor:settingsView[name].labelAnchor};applyAxisSettings(name,values);options.axisSetting?.(name,values);},()=>{});
        }
    };
    const attachCanvas = () => {
        if(!options.grouped)viewport=attachXYGestures(stage,()=>camera,updateCamera,()=>{},()=>{},()=>!!stage?.isConnected);
        const resizeMedia = event => {
            if (frame || !event.target.matches('img,video')) return;
            frame=requestAnimationFrame(()=>{
                frame=0;
                if(stage?.isConnected && xyMediaRatio(wrapper,matrixCells(cards,displayXY()),displayXY())!==ratio)render();
            });
        };
        stage.addEventListener('load',resizeMedia,true);
        stage.addEventListener('loadedmetadata',resizeMedia,true);
        stage.addEventListener('click',event=>{
            const layer=event.target.closest('[data-xy-z-layer]');
            const cell=event.target.closest('.clab-card[data-card-id]');
            if(layer&&!cell){
                if(!layer.classList.contains('clab-xy-layer-title')){showLayer(layer.dataset.xyZLayer);return;}
                const z=Number(layer.dataset.xyZLayer);selected.clear();activeCardId=anchorId='';
                if(!event.ctrlKey&&!event.metaKey)selectedLayers.clear();
                if((event.ctrlKey||event.metaKey)&&selectedLayers.has(z))selectedLayers.delete(z);else selectedLayers.add(z);
                selectionKind=selectedLayers.size?'layer':'';paintSelection();selectionChanged(event);return;
            }
            if(event.target.closest('[data-xy-z-more]')){openZLayerOptions(stage,xy,showLayer);return;}
            if (event.target.closest('button,a,input,select,textarea')) return;
            if (cell) {
                const id=cell.dataset.cardId,cells=visibleMatrixCells(cards,displayXY());
                const ids=selectXYCells(cells,[...selected],id,anchorId,event);
                const start=cells.find(item=>item.card.id===anchorId),target=cells.find(item=>item.card.id===id);
                if(!event.shiftKey||!start||start.z!==target?.z)anchorId=id;
                selected.clear();ids.forEach(id=>selected.add(id));
                stage.focus({preventScroll:true});
            } else {selected.clear();anchorId='';}
            selectedLayers.clear();for(const item of visibleMatrixCells(cards,displayXY()))if(selected.has(item.card.id))selectedLayers.add(item.z??0);selectionKind=selected.size?'cell':'';
            activeCardId=cell&&selected.has(cell.dataset.cardId)?cell.dataset.cardId:[...selected].at(-1)||'';paintSelection();selectionChanged(event);
        });
        stage.addEventListener('keydown',event=>{
            if(event.target.closest('[data-xy-z-layer],[data-xy-toggle-layers],[data-xy-z-more]'))return;
            const direction=reviewHistoryDirection(event);
            if (!direction||!selected.size) return;
            event.preventDefault();event.stopPropagation();
            const display=displayXY();
            for (const {card} of visibleMatrixCells(cards,display)) if (selected.has(card.id)) {
                const output=outputFor(card,display);
                const element=wrapper.querySelector('[data-card-id="'+CSS.escape(card.id)+'"] .clab-output-area');
                if (!output||!element) continue;
                const next=stepReviewGridOutput(element,card,output,direction);
                if (next) histories.set(next.id,next);
            }
            render();
        });
    };
    return {
        open(view,nextCards) {
            xy=structuredClone(view);xy.hiddenAxes=[];xy.hiddenBindings=[];cards=nextCards;selected.clear();selectedLayers.clear();layerViews.clear();selectionKind='';histories.clear();activeCardId=anchorId='';recordRows=[];recordZoom=undefined;
            orientation=xy.origin;parameters=workflowParameters();records=new Set((xy.previewRecords||[]).filter(key=>xy.records.some(record=>record.key===key)));
            camera={zoom:xy.zoom||1,panX:xy.panX||0,panY:xy.panY||0};
            sourcePanel=createPreviewXYSources(left,xy,parameters,records,options.cellInfo);
        },
        mount(config) {
            center.innerHTML='<div class="clab-review-grid" data-workspace-mode="xy"><div class="clab-review-grid-stage"><div class="clab-cards-wrapper"></div></div></div>';
            stage=center.querySelector('.clab-review-grid-stage');wrapper=stage.querySelector('.clab-cards-wrapper');
            stage.tabIndex=0;
            sourcePanel.mount();attachCanvas();renderSettings(config);render();if(!options.grouped&&!xy.cameraReady)fit();
        },
        change(input,config) {
            if(input.matches('[data-xy-tiling]')){if(applyXYTiling(input,xy)){render();saveTiling();}return true;}
            if(input.matches('[data-review-xy-tiles]')){showLayer(input.checked?'all':String(currentZLayer(xy)));return true;}
            if(input.matches('[data-review-xy-value]')){sourcePanel.change(input.dataset.reviewXyValue,Number(input.value),input.checked);render();fit();return true;}
            if(input.matches('[data-review-xy-show]')) {
                const key=input.dataset.reviewXyShow==='axes'?'hiddenAxes':'hiddenBindings';
                updateTargets(view=>{view[key]=input.checked?view[key].filter(name=>name!==input.value):[...new Set([...view[key],input.value])];},input.value==='z');
            } else if(input.matches('[data-review-xy-orientation]')) {
                updateTargets(view=>view.origin=input.value);renderSettings(config);
                right.querySelector('[data-review-xy-orientation]:checked')?.focus({preventScroll:true});
            } else if(input.matches('[data-review-xy-spacing]')) {
                if(!Number.isFinite(input.valueAsNumber)||input.valueAsNumber<0){input.reportValidity();return;}
                updateTargets(view=>view[input.closest('[data-review-axis]').dataset.reviewAxis][input.dataset.reviewXySpacing]=input.valueAsNumber);
            } else if(input.matches('[data-review-xy-records-expanded]')) {
                xy.previewRecordsExpanded=input.checked;recordsChanged([...records],xy.previewRecordsExpanded);
            } else if(input.matches('[data-review-xy-record]')) {
                if(input.checked)records.add(input.value);else records.delete(input.value);
                xy.previewRecords=[...records];recordsChanged(xy.previewRecords,xy.previewRecordsExpanded);
            } else return false;
            render();return true;
        },
        swap(pair,config) {
            if(!swapMatrixAxes(xy,...pair))return;
            sourcePanel.swap(pair);renderSettings(config);render();fit();
            right.querySelector(`[data-review-xy-swap="${pair}"]`)?.focus({preventScroll:true});
        },
        selectRange(name,all){sourcePanel.select(name,all);render();fit();},
        fit,
        applyAxisSettings,
        clearSelection(){selected.clear();selectedLayers.clear();selectionKind='';activeCardId=anchorId='';paintSelection();renderSettings(currentConfig);},
        selectWorkspace(){selected.clear();selectedLayers.clear();for(const item of visibleMatrixCells(cards,displayXY()))selectedLayers.add(item.z??0);selectionKind='workspace';activeCardId=anchorId='';paintSelection();renderSettings(currentConfig);},
        groupLayout(zoom=1) {
            if(!wrapper)return null;
            const minX=Number(wrapper.dataset.xyMinX)||0,minY=Number(wrapper.dataset.xyMinY)||0;
            camera={zoom,panX:(20-minX)*zoom,panY:(20-minY)*zoom};
            projectXYCanvas(stage,displayXY());if(recordZoom!==zoom)layoutRecords(displayXY());
            return {width:parseFloat(wrapper.style.width)-minX+40,height:parseFloat(wrapper.style.height)-minY+40,tiled:xy.z.enabled&&xy.z.display==='all'&&!xy.hiddenBindings.includes('z'),binding:stage.querySelector('.clab-xy-z-binding')};
        },
        release() { viewport?.release();closeXYPopover();cancelAnimationFrame(frame);cancelAnimationFrame(fitFrame);frame=0;releaseReviewGridMedia(wrapper);stage=null;wrapper=null; },
        downloadRecords(selectedOnly,includeHistory) {
            const display=displayXY();
            return (sourcePanel.hasValues()?visibleMatrixCells(cards,display):[]).flatMap(({card})=>{
                const area=outputFor(card,display);
                return area&&(!selectedOnly||(selected.size?selected.has(card.id):selectedLayers.has(visibleMatrixCells(cards,display).find(item=>item.card===card)?.z??0)))?outputDownloadRecords(card,area,includeHistory):[];
            });
        },
        jsonCards() {
            const display=displayXY();
            return (sourcePanel.hasValues()?visibleMatrixCells(cards,display):[]).map(({card})=>({...card,
                areas:card.areas.filter(area=>area.type==='edit').concat(outputFor(card,display)||[])}));
        },
        hasExportData() { return workspaceMatrixAvailable(xy)&&sourcePanel.hasValues(); },
    };
}
