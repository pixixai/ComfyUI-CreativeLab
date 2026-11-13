import { showBindingToast } from '../ui_utils.js';
import { reconcileMatrixArchive } from './xy_archive.js';
import { state, getActiveWorkspace } from '../ui_state.js';
import { workflowParameters } from './parameters.js';
import { adoptMatrix, synchronizeMatrix, matrixCards, matrixCells, matrixOutput, matrixReady, materializeMatrixRecords, visibleMatrixCells, currentZLayer } from './xy_model.js';
import { taskCoordinates } from './task_model.js';
import { appendWorkspaceTasks } from './task_dom.js';
import { xyToolbar, xyRunLabel, xyOriginLabels, xyRunAxisLabels } from './xy_settings.js';
import { showXYMode, xyMediaRatio } from './mode_xy.js';
import { attachXYCanvas, fitXYCanvas } from './xy_canvas.js';
import { openXYBinding } from './xy_binding.js';
import { openXYValues } from './xy_values.js';
import { closeXYPopover } from './xy_popover.js';
import { openXYToolbarChoice, openZLayerOptions } from './xy_options.js';
import { openXYAxisPanel } from './xy_axis_panel.js';
import { openXYTiling } from './xy_tiling.js';
import { openXYRecords } from './xy_records.js';
import { swapMatrixAxes } from './xy_axis_swap.js';
import { ensureXYHistory, attachXYHistoryKeys } from './xy_history.js';
import { attachXYSelection } from './xy_selection.js';
import { syncAxisLabelSettings } from './xy_axes.js';
import { refreshXYActivity } from './xy_activity.js';
import { matrixRunCards } from './xy_layers.js';
import { updateSelectionUI } from '../ui_selection.js';
import { synchronizeModeMedia } from './mode_media.js';

export function createXYController(container,getView,save,saveView) {
    let visibleIds=new Set(),controlsHTML='',recordSequence=0,mediaFrame=0,mediaRatio=1;
    const panel=container.closest('#clab-panel'),controls=panel.querySelector('.clab-xy-toolbar');
    const runButton=panel.querySelector('#clab-btn-run'),runMenu=panel.querySelector('#clab-run-dropdown-menu');
    const getXY=()=>getView().xy,active=()=>panel.dataset.workspaceMode==='xy';
    const reconcile=()=>{
        const result=reconcileMatrixArchive(state.cards,getXY(),(getActiveWorkspace().archivedTasks??=[]),getView().table);
        if(result.archived)showBindingToast(`已归档 ${result.archived} 个任务，可在“数据维护”中查看。`);
        const cards=new Set(state.cards.map(card=>card.id)),areas=new Set(state.cards.flatMap(card=>card.areas.map(area=>area.id)));
        state.selectedCardIds=state.selectedCardIds.filter(id=>cards.has(id));state.selectedAreaIds=state.selectedAreaIds.filter(id=>areas.has(id));if(!cards.has(state.activeCardId))state.activeCardId=null;
    };
    const selected=()=>matrixCards(state.cards,getXY()).filter(card=>visibleIds.has(card.id)&&(state.selectedCardIds.includes(card.id)||card.areas.some(area=>state.selectedAreaIds.includes(area.id))));
    const selectedInLayer=xy=>selected().filter(card=>!xy.z.enabled||taskCoordinates(card,xy).z===currentZLayer(xy));
    const setRunLabel=label=>{
        for(const span of runButton.querySelectorAll('.clab-tool-label,.clab-tool-short-label'))span.textContent=label;
        runButton.setAttribute('aria-label',label);
    };
    const refreshRunLabel=()=>{
        const xy=getXY();
        setRunLabel(xyRunLabel(xy,selectedInLayer(xy).length));
        runButton.title='运行当前 Z 层（选中格子时仅运行当前层的选中项）';
    };
    const notice=message=>{let node=controls?.querySelector('[role=status]');if(!node&&controls){node=document.createElement('p');node.className='clab-mode-error';node.setAttribute('role','status');controls.append(node);}if(node)node.textContent=message;};
    const render=(enter=false,source)=>{
        cancelAnimationFrame(mediaFrame);mediaFrame=0;
        const xy=getXY(),parameters=workflowParameters(),wrapper=container.querySelector('.clab-cards-wrapper');
        if(enter){adoptMatrix(state.cards,source,xy);reconcile();synchronizeMatrix(state.cards,xy,parameters);appendWorkspaceTasks(container,state.cards);}
        ensureXYHistory(state.cards,xy);
        const html=xyToolbar(xy);
        if(html!==controlsHTML){controls.innerHTML=html;controlsHTML=html;}
        const tileToggle=controls.querySelector('[data-xy-toggle-layers]');tileToggle.setAttribute('aria-pressed',String(xy.z.display==='all'));tileToggle.disabled=!xy.z.enabled||!xy.z.values.length;controls.querySelector('[data-xy-tile-settings]').hidden=xy.z.display!=='all';tileToggle.parentElement.classList.toggle('is-active',xy.z.display==='all');
        visibleIds=new Set(showXYMode(wrapper,state.cards,xy,parameters));
        mediaRatio=xyMediaRatio(wrapper,matrixCells(state.cards,xy),xy);
        refreshXYActivity(container,state.activeWorkspaceId);
        refreshRunLabel();
        synchronizeModeMedia(wrapper);
        if(!xy.cameraReady){fitXYCanvas(container,xy);xy.cameraReady=true;saveView();}
    };
    const commit=(fit=false,persist=save)=>{
        reconcile();
        synchronizeMatrix(state.cards,getXY(),workflowParameters());appendWorkspaceTasks(container,state.cards);render();if(fit)fitXYCanvas(container,getXY());persist();
    };
    const bind=(key,trigger)=>openXYBinding(container,key,getXY,()=>commit(),'',trigger);
    const swap=(first,second)=>{
        const xy=getXY(),reference=selected()[0]||visibleMatrixCells(state.cards,xy)[0]?.card;
        if(!swapMatrixAxes(xy,first,second))return;
        if(xy.z.enabled&&reference)xy.z.current=Math.max(0,taskCoordinates(reference,xy).z);
        commit(true);updateSelectionUI();
    };
    const recordActions={bind,add(){const entry={id:`record_${Date.now()}_${++recordSequence}`,key:''};getXY().records.push(entry);save();bind(`record:${entry.id}`);},remove(id){getXY().records=getXY().records.filter(entry=>entry.id!==id);commit();}};
    const clearSelection=()=>{state.selectedCardIds=[];state.selectedAreaIds=[];state.activeCardId=null;};
    const showLayer=index=>{getXY().z.current=Number(index);clearSelection();render();updateSelectionUI();saveView();};
    const run=(scope='auto')=>{
        try{
            const xy=getXY();if(!matrixReady(xy))throw new Error(`请分别绑定 ${xy.z.enabled?'X、Y、Z':'X、Y'} 轴参数并填写取值。`);
            if(!xy.outputNodeId)throw new Error('请先通过矩阵右上角的绑定摘要选择输出节点。');
            commit();const group=matrixRunCards(state.cards,xy,visibleIds,scope==='layer'?selectedInLayer(xy):selected(),scope);
            const tasks=group.filter(card=>Object.values(taskCoordinates(card,xy)).every(value=>value>=0)).map(card=>({cardId:card.id,previewAreaIds:[matrixOutput(card,xy).id]}));
            if(!tasks.length)throw new Error('请先选中需要运行的图像占位符。');
            if(!window.CLab?.executeTasks)throw new Error('运行服务尚未准备好。');
            document.dispatchEvent(new CustomEvent('clab_execution_start',{detail:{tasks}}));Promise.resolve(window.CLab.executeTasks(tasks)).catch(error=>notice(error.message));
        }catch(error){notice(error.message);}
    };
    const handleClick=event=>{
        if(!active())return;const target=event.target.closest('button');if(!target)return;
        if(target.matches('[data-xy-bind]')){bind(target.dataset.xyBind,target);return;}
        if(target.matches('[data-xy-z-layer]')){showLayer(target.dataset.xyZLayer);return;}
        if(target.matches('[data-xy-z-more]')){openZLayerOptions(container,getXY(),showLayer);return;}
        if(target.matches('[data-xy-toggle-layers]')){target.blur();closeXYPopover();getXY().z.display=getXY().z.display==='all'?'single':'all';clearSelection();render();saveView();updateSelectionUI();return;}
        if(target.matches('[data-xy-edit-values]')){openXYValues(container,target.dataset.xyEditValues,getXY,fit=>commit(!!fit),bind,target,()=>syncAxisLabelSettings(container.querySelector('.clab-xy-overlay'),getXY()),()=>{render();save();});return;}
        if(target.matches('[data-xy-origin-options]')){
            openXYToolbarChoice(controls,'origin',xyOriginLabels,getXY().origin,origin=>{
                const xy=getXY();if(xy.origin===origin)return;
                xy.origin=origin;render();fitXYCanvas(container,xy);saveView();
            });
            return;
        }
        if(target.matches('[data-xy-run-axis-options]')){
            openXYToolbarChoice(controls,'run-axis',xyRunAxisLabels,getXY().runAxis,axis=>{
                const xy=getXY();if(xy.runAxis===axis)return;
                xy.runAxis=axis;render();saveView();
            });
            return;
        }
        if(target.matches('[data-xy-tile-settings]')){openXYTiling(controls,getXY,()=>{render();saveView();});return;}
        if(target.matches('[data-xy-reassign]')){openXYAxisPanel(controls,getXY,swap);return;}
        if(target.matches('[data-xy-records]')){openXYRecords(controls,getXY,recordActions);return;}
        if(target.matches('[data-xy-reset]')){fitXYCanvas(container,getXY());saveView();return;}
    };
    container.addEventListener('click',handleClick);
    controls.addEventListener('click',handleClick);
    panel.addEventListener('click',event=>{
        if(!active())return;
        const target=event.target.closest('#clab-btn-run,#clab-btn-run-all');
        if(!target)return;
        event.preventDefault();
        event.stopImmediatePropagation();
        runMenu.style.display='none';
        run(target===runButton?'layer':'all');
    },true);
    const releaseButtonFocus=event=>{
        if(!active()||event.button!==0||!event.target.closest('button')?.closest('.clab-xy-overlay,.clab-xy-toolbar'))return;
        event.preventDefault();
        const focused=document.activeElement;
        if(focused?.matches('button')&&(container.contains(focused)||controls.contains(focused)))focused.blur();
    };
    container.addEventListener('pointerdown',releaseButtonFocus);
    controls.addEventListener('pointerdown',releaseButtonFocus);
    for(const type of ['keydown','keyup'])controls.addEventListener(type,event=>{if(active()&&['Space','Enter'].includes(event.code)&&event.target.closest('[data-xy-toggle-layers]'))event.preventDefault();});
    for(const type of ['mousedown','click'])container.addEventListener(type,()=>{if(active())requestAnimationFrame(()=>{if(active())refreshRunLabel();});});
    const scheduleMediaLayout=event=>{
        if(!active()||mediaFrame||!event.target.matches('.clab-output-area .clab-preview-bg img,.clab-output-area .clab-preview-bg video'))return;
        mediaFrame=requestAnimationFrame(()=>{
            mediaFrame=0;if(!active())return;
            const xy=getXY(),wrapper=container.querySelector('.clab-cards-wrapper');
            if(xyMediaRatio(wrapper,matrixCells(state.cards,xy),xy)!==mediaRatio)render();
        });
    };
    container.addEventListener('load',scheduleMediaLayout,true);
    container.addEventListener('loadedmetadata',scheduleMediaLayout,true);
    const canvas=attachXYCanvas(container,getView,saveView,run,()=>window.CLab?.scheduleViewSave());
    attachXYSelection(container,getXY);attachXYHistoryKeys(container,getXY,selected,render);
    document.addEventListener('clab_task_activity',event=>{if(active()&&event.detail.workspaceId===state.activeWorkspaceId)refreshXYActivity(container,state.activeWorkspaceId);});
    return {render,exportRecords(){ensureXYHistory(state.cards,getXY());materializeMatrixRecords(state.cards,getXY(),workflowParameters());appendWorkspaceTasks(container,state.cards);},leave(){setRunLabel('运行');runButton.title='按规则运行选中任务（局部）';cancelAnimationFrame(mediaFrame);mediaFrame=0;canvas.stop();closeXYPopover();container.querySelector('.clab-xy-overlay')?.remove();}};
}
