import { axisValueLabel } from '../../workspace_modes/axis_labels.js';
import { axisLabelControlsHTML, attachAxisLabelControls } from '../../workspace_modes/axis_label_controls.js';
import { swapMatrixAxes } from '../../workspace_modes/xy_axis_swap.js';
import { fitXYCanvas } from '../../workspace_modes/xy_canvas.js';
import { projectXYCanvas } from '../../workspace_modes/xy_axes.js';
import { showXYMode, xyMediaRatio } from '../../workspace_modes/mode_xy.js';
import { matrixOutput, currentZLayer, matrixCells, visibleMatrixCells } from '../../workspace_modes/xy_model.js';
import { workflowParameters } from '../../workspace_modes/parameters.js';
import { renderReviewArea, attachReviewGridMedia, releaseReviewGridMedia, reviewHistoryDirection, stepReviewGridOutput } from './preview_grid_media.js';
import { escapeHtml as esc } from './shared.js';
import { displayValue } from './preview_records.js';
import { workspaceMatrixAvailable, xySourceSetting } from './preview_workspace_sheets.js';
import { outputDownloadRecords } from './preview_downloads.js';
import { updateXYHistoryLabel } from '../../workspace_modes/xy_history.js';

export function createPreviewXYGrid(center,left,right,changed,exportControls) {
    let xy,cards,orientation,showAxes,showBindings,records,parameters,stage,wrapper,frame=0,ratio;
    let camera, drag, fitFrame=0;
    const selected=new Set(),histories=new Map();
    const outputFor=(card,display)=>{
        const output=matrixOutput(card,display);
        return histories.get(output?.id)||output;
    };
    function paintSelection() {
        for (const cell of wrapper.querySelectorAll(':scope > .clab-card')) cell.classList.toggle('selected',selected.has(cell.dataset.cardId));
    }

    const displayXY = () => ({...xy,...camera,origin:orientation});
    const updateCamera = () => projectXYCanvas(stage,displayXY());
    const fit = () => {
        cancelAnimationFrame(fitFrame);
        fitFrame=requestAnimationFrame(()=>{
            if (!stage?.isConnected || !wrapper.offsetWidth) return;
            render();
            const next=displayXY();fitXYCanvas(stage,next);
            camera={zoom:next.zoom,panX:next.panX,panY:next.panY};
        });
    };
    const showLayer = value => {
        if (!xy.z.enabled) return;
        if (value === 'all') xy.z.display='all';
        else { xy.z.current=Number(value);xy.z.display='single'; }
        selected.clear();renderLayers();render();
        fit();
    };
    const renderLayers = () => {
        const active=xy.z.display==='all'?'all':String(currentZLayer(xy));
        const layers=xy.z.enabled?xy.z.values:[];
        left.innerHTML=`<div class="clab-review-sheet-settings"><section><h3>Z 轴数据</h3>${layers.length?
            `<button type="button" data-review-layer="all" aria-pressed="${active==='all'}">平铺全部层</button>${layers.map((_,index)=>
                `<button type="button" data-review-layer="${index}" aria-pressed="${active===String(index)}" title="${esc(axisValueLabel(xy.z,index))}">${esc(axisValueLabel(xy.z,index))}</button>`).join('')}`
            :'<p class="clab-review-note">当前矩阵没有 Z 轴分层。</p>'}</section></div>`;
    };
    const render = () => {
        if (!stage?.isConnected) return;
        const display=displayXY(),items=visibleMatrixCells(cards,display);
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
            cell.querySelector('.clab-review-xy-records')?.remove();
            const values=output.historyRuns?.[output.historyIndex]?.recordParameters?.filter(entry=>records.has(entry.key));
            if (values?.length) cell.insertAdjacentHTML('beforeend',`<div class="clab-review-xy-records">${values.map(entry=>
                `<div>${esc(entry.label||entry.key)} · ${esc(displayValue(entry.value))}</div>`).join('')}</div>`);
        }
        for (const stale of existing.values()) { releaseReviewGridMedia(stale);stale.remove(); }
        showXYMode(wrapper,cards,display,parameters,{preview:true});
        for (const cell of wrapper.querySelectorAll(':scope > .clab-card')) {
            const history=histories.get(cell.querySelector('.clab-output-area')?.dataset.areaId);
            if (history) updateXYHistoryLabel(cell,history);
        }
        paintSelection();
        stage.dataset.hiddenAxes=['x','y','z'].filter(name=>!showAxes.has(name)).join(' ');
        stage.dataset.hiddenBindings=['x','y','z'].filter(name=>!showBindings.has(name)).join(' ');
        for (const element of stage.querySelectorAll('[data-xy-bind],[data-xy-edit-values],[data-xy-toggle-layers],[data-xy-z-more]')) element.tabIndex=-1;
        ratio=xyMediaRatio(wrapper,matrixCells(cards,display),display);
        changed();
    };
    const renderSettings = config => {
        const names=xy.z.enabled?['x','y','z']:['x','y'];
        const configured=workspaceMatrixAvailable(xy);
        right.innerHTML=`<div class="clab-review-sheet-settings">
            <section><h3>矩阵显示</h3>${xySourceSetting(config)}
            <div class="clab-review-xy-visibility"><span>坐标轴</span><span>绑定摘要</span>${['x','y','z'].map(name=>
                `<label class="clab-review-check"><input type="checkbox" data-review-xy-show="axes" value="${name}"${showAxes.has(name)?' checked':''}>显示 ${name.toUpperCase()} 轴</label>
                <label class="clab-review-check"><input type="checkbox" data-review-xy-show="bindings" value="${name}"${showBindings.has(name)?' checked':''}>显示 ${name.toUpperCase()} 轴摘要</label>`).join('')}</div>
            <div class="clab-review-xy-options" role="group" aria-label="轴向">${[['bottom','Y 轴向上'],['top','Y 轴向下']].map(([value,label])=>
                `<label class="clab-review-check"><input type="radio" name="clab-review-xy-orientation" data-review-xy-orientation value="${value}"${value===orientation?' checked':''}>${label}</label>`).join('')}</div>
            <div class="clab-review-xy-options" role="group" aria-label="交换坐标轴">${['xy','xz','yz'].map(pair=>
                `<button type="button" data-review-xy-swap="${pair}"${pair.includes('z')&&!xy.z.enabled?' disabled':''}>${[...pair.toUpperCase()].join(' ↔ ')}</button>`).join('')}</div>
            <button type="button" data-review-xy-fit>适配视图</button></section>
            <section><h3>轴设置</h3>${names.map(name=>`<details class="clab-review-axis-settings" data-review-axis="${name}"${name==='x'?' open':''}><summary>${name.toUpperCase()} 轴</summary>
                ${name==='z'?'':`<div class="clab-xy-axis-spacing">${[['gap','间距'],['margin','边距']].map(([key,label])=>
                    `<label>${label}<input type="number" min="0" step="1" value="${xy[name][key]}" data-review-xy-spacing="${key}" aria-label="${name.toUpperCase()}轴${label}"></label>`).join('')}</div>`}
                ${axisLabelControlsHTML()}</details>`).join('')}</section>
            <section><h3>附加记录参数</h3>${xy.records.filter(entry=>entry.key).map(entry=>`<label class="clab-review-check"><input type="checkbox" value="${esc(entry.key)}" data-review-xy-record${records.has(entry.key)?' checked':''}><span>${esc(parameters.find(parameter=>parameter.key===entry.key)?.label||entry.key)}</span></label>`).join('')||'<p class="clab-review-note">当前矩阵没有附加记录参数。</p>'}</section>
            ${configured?exportControls:''}</div>`;
        for (const section of right.querySelectorAll('[data-review-axis]')) {
            const name=section.dataset.reviewAxis;
            attachAxisLabelControls(section,name,displayXY,render,()=>{});
        }
    };
    const attachCanvas = () => {
        stage.addEventListener('wheel',event=>{
            event.preventDefault();
            const rect=stage.getBoundingClientRect(),x=event.clientX-rect.left,y=event.clientY-rect.top;
            const old=camera.zoom,next=Math.max(.025,Math.min(4,old*Math.exp(-event.deltaY*.0015)));
            camera.panX=x-(x-camera.panX)*next/old;camera.panY=y-(y-camera.panY)*next/old;camera.zoom=next;
            updateCamera();
        },{passive:false,capture:true});
        stage.addEventListener('pointerdown',event=>{
            if(event.button!==0||event.target.closest('.clab-glb-viewer,.clab-video-controls-interactive'))return;
            drag={id:event.pointerId,x:event.clientX,y:event.clientY};
        });
        stage.addEventListener('pointermove',event=>{
            if(drag?.id!==event.pointerId||!event.buttons)return;
            const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
            if(!stage.hasPointerCapture(event.pointerId)){if(Math.hypot(dx,dy)<4)return;stage.setPointerCapture(event.pointerId);}
            camera.panX+=dx;camera.panY+=dy;drag.x=event.clientX;drag.y=event.clientY;
            stage.classList.add('clab-xy-grabbing');updateCamera();
        });
        let suppressClick=false;
        for (const event of ['pointerup','pointercancel','lostpointercapture']) stage.addEventListener(event,()=>{
            if (stage.classList.contains('clab-xy-grabbing')) {
                suppressClick=true;setTimeout(()=>{suppressClick=false;},0);
            }
            drag=null;stage.classList.remove('clab-xy-grabbing');
        });
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
            if (suppressClick) return;
            const cell=event.target.closest('.clab-card[data-card-id]');
            if (layer&&!cell) { showLayer(layer.dataset.xyZLayer);return; }
            if (event.target.closest('button,a,input,select,textarea')) return;
            if (!event.ctrlKey&&!event.metaKey) selected.clear();
            if (cell) {
                const id=cell.dataset.cardId;
                if (selected.has(id)) selected.delete(id); else selected.add(id);
                stage.focus({preventScroll:true});
            }
            paintSelection();changed();
        });
        stage.addEventListener('keydown',event=>{
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
            xy=structuredClone(view);cards=nextCards;selected.clear();histories.clear();
            orientation=xy.origin;showAxes=new Set(['x','y','z']);showBindings=new Set(showAxes);parameters=workflowParameters();records=new Set();
            camera={zoom:xy.zoom||1,panX:xy.panX||0,panY:xy.panY||0};
        },
        mount(config) {
            center.innerHTML='<div class="clab-review-grid" data-workspace-mode="xy"><div class="clab-review-grid-stage"><div class="clab-cards-wrapper"></div></div></div>';
            stage=center.querySelector('.clab-review-grid-stage');wrapper=stage.querySelector('.clab-cards-wrapper');
            stage.tabIndex=0;
            attachCanvas();renderLayers();renderSettings(config);render();fit();
        },
        showLayer,
        change(input,config) {
            if(input.matches('[data-review-xy-show]')) {
                const set=input.dataset.reviewXyShow==='axes'?showAxes:showBindings;
                if(input.checked)set.add(input.value);else set.delete(input.value);
            } else if(input.matches('[data-review-xy-orientation]')) {
                orientation=input.value;renderSettings(config);
                right.querySelector('[data-review-xy-orientation]:checked')?.focus({preventScroll:true});
            } else if(input.matches('[data-review-xy-spacing]')) {
                if(!Number.isFinite(input.valueAsNumber)||input.valueAsNumber<0){input.reportValidity();return;}
                xy[input.closest('[data-review-axis]').dataset.reviewAxis][input.dataset.reviewXySpacing]=input.valueAsNumber;
            } else if(input.matches('[data-review-xy-record]')) {
                if(input.checked)records.add(input.value);else records.delete(input.value);
            } else return false;
            render();return true;
        },
        swap(pair,config) {
            if(!swapMatrixAxes(xy,...pair))return;
            renderLayers();renderSettings(config);render();fit();
            right.querySelector(`[data-review-xy-swap="${pair}"]`)?.focus({preventScroll:true});
        },
        fit,
        release() { cancelAnimationFrame(frame);cancelAnimationFrame(fitFrame);frame=0;releaseReviewGridMedia(wrapper);stage=null;wrapper=null; },
        downloadRecords(selectedOnly,includeHistory) {
            const display=displayXY();
            return visibleMatrixCells(cards,display).flatMap(({card})=>{
                const area=outputFor(card,display);
                return area&&(!selectedOnly||selected.has(card.id))?outputDownloadRecords(card,area,includeHistory):[];
            });
        },
        jsonCards() {
            const display=displayXY();
            return visibleMatrixCells(cards,display).map(({card})=>({...card,
                areas:card.areas.filter(area=>area.type==='edit').concat(outputFor(card,display)||[])}));
        },
        hasExportData() { return workspaceMatrixAvailable(xy); },
    };
}
