import { state } from '../ui_state.js';
import { workflowParameters } from './parameters.js';
import { adoptMatrix, synchronizeMatrix, matrixCards, matrixCells, matrixOutput, matrixReady, materializeMatrixRecords, visibleMatrixCells } from './xy_model.js';
import { taskCoordinates } from './task_model.js';
import { appendWorkspaceTasks } from './task_dom.js';
import { xyToolbar, xyRunLabel } from './xy_settings.js';
import { showXYMode, xyMediaRatio } from './mode_xy.js';
import { attachXYCanvas, fitXYCanvas } from './xy_canvas.js';
import { openXYBinding } from './xy_binding.js';
import { openXYValues } from './xy_values.js';
import { closeXYPopover } from './xy_popover.js';
import { openXYRunOptions, openZLayerOptions } from './xy_options.js';
import { openXYAxisPanel } from './xy_axis_panel.js';
import { openXYRecords } from './xy_records.js';
import { swapMatrixAxes } from './xy_axis_swap.js';
import { ensureXYHistory, attachXYHistoryKeys } from './xy_history.js';
import { attachXYSelection } from './xy_selection.js';
import { refreshXYActivity } from './xy_activity.js';
import { matrixRunCards } from './xy_layers.js';
import { updateSelectionUI } from '../ui_selection.js';
import { synchronizeModeMedia } from './mode_media.js';

export function createXYController(container,getView,save) {
    let controls,visibleIds=new Set(),controlsHTML='',recordSequence=0,mediaFrame=0,mediaRatio=1;
    const getXY=()=>getView().xy,active=()=>container.closest('#clab-panel').dataset.workspaceMode==='xy';
    const selected=()=>matrixCards(state.cards,getXY()).filter(card=>visibleIds.has(card.id)&&(state.selectedCardIds.includes(card.id)||card.areas.some(area=>state.selectedAreaIds.includes(area.id))));
    const notice=message=>{let node=controls?.querySelector('[role=status]');if(!node&&controls){node=document.createElement('p');node.className='clab-mode-error';node.setAttribute('role','status');controls.append(node);}if(node)node.textContent=message;};
    const render=(enter=false,source)=>{
        cancelAnimationFrame(mediaFrame);mediaFrame=0;
        const xy=getXY(),parameters=workflowParameters(),wrapper=container.querySelector('.clab-cards-wrapper');
        if(enter){adoptMatrix(state.cards,source,xy);synchronizeMatrix(state.cards,xy,parameters);appendWorkspaceTasks(container,state.cards);}
        ensureXYHistory(state.cards,xy);
        if(!controls?.isConnected){controls=document.createElement('div');controls.className='clab-xy-toolbar';controls.setAttribute('role','toolbar');controls.setAttribute('aria-label','矩阵工具栏');container.append(controls);controlsHTML='';}
        const html=xyToolbar(xy,0);
        if(html!==controlsHTML){controls.innerHTML=html;controlsHTML=html;}
        visibleIds=new Set(showXYMode(wrapper,state.cards,xy,parameters));
        mediaRatio=xyMediaRatio(wrapper,matrixCells(state.cards,xy),xy);
        refreshXYActivity(container,state.activeWorkspaceId);
        const button=controls.querySelector('[data-xy-run]');if(button)button.textContent=xyRunLabel(xy,selected().length);
        synchronizeModeMedia(wrapper);
        if(!xy.cameraReady){fitXYCanvas(container,xy);xy.cameraReady=true;save();}
    };
    const commit=(fit=false)=>{
        synchronizeMatrix(state.cards,getXY(),workflowParameters());appendWorkspaceTasks(container,state.cards);render();if(fit)fitXYCanvas(container,getXY());save();
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
    const showLayer=index=>{getXY().z.current=Number(index);clearSelection();render();updateSelectionUI();save();};
    const run=(scope='auto')=>{
        try{
            const xy=getXY();if(!matrixReady(xy))throw new Error(`请分别绑定 ${xy.z.enabled?'X、Y、Z':'X、Y'} 轴参数并填写取值。`);
            if(!xy.outputNodeId)throw new Error('请先通过矩阵右上角的绑定摘要选择输出节点。');
            commit();const group=matrixRunCards(state.cards,xy,visibleIds,selected(),scope);
            const tasks=group.filter(card=>Object.values(taskCoordinates(card,xy)).every(value=>value>=0)).map(card=>({cardId:card.id,previewAreaIds:[matrixOutput(card,xy).id]}));
            if(!tasks.length)throw new Error('请先选中需要运行的图像占位符。');
            if(!window.CLab?.executeTasks)throw new Error('运行服务尚未准备好。');
            document.dispatchEvent(new CustomEvent('clab_execution_start',{detail:{tasks}}));Promise.resolve(window.CLab.executeTasks(tasks)).catch(error=>notice(error.message));
        }catch(error){notice(error.message);}
    };
    container.addEventListener('click',event=>{
        if(!active())return;const target=event.target.closest('button');if(!target)return;
        if(target.matches('[data-xy-bind]')){bind(target.dataset.xyBind,target);return;}
        if(target.matches('[data-xy-z-layer]')){showLayer(target.dataset.xyZLayer);return;}
        if(target.matches('[data-xy-z-more]')){openZLayerOptions(container,getXY(),showLayer);return;}
        if(target.matches('[data-xy-toggle-layers]')){closeXYPopover();getXY().z.display=getXY().z.display==='all'?'single':'all';clearSelection();commit(true);updateSelectionUI();return;}
        if(target.matches('[data-xy-run-options]')){openXYRunOptions(container,run);return;}
        if(target.matches('[data-xy-edit-values]')){openXYValues(container,target.dataset.xyEditValues,getXY,fit=>commit(!!fit),bind,target);return;}
        if(target.matches('[data-xy-origin]')){const origin=target.dataset.xyOrigin;if(getXY().origin===origin)return;getXY().origin=origin;closeXYPopover();render();fitXYCanvas(container,getXY());save();controls.querySelector(`[data-xy-origin=${origin}]`).focus({preventScroll:true});return;}
        if(target.matches('[data-xy-reassign]')){openXYAxisPanel(container,getXY,swap);return;}
        if(target.matches('[data-xy-records]')){openXYRecords(container,getXY,recordActions);return;}
        if(target.matches('[data-xy-run]')){run();return;}
        if(target.matches('[data-xy-reset]')){fitXYCanvas(container,getXY());save();return;}
    });
    for(const type of ['mousedown','click'])container.addEventListener(type,()=>{if(active())requestAnimationFrame(()=>{const button=controls?.querySelector('[data-xy-run]');if(button)button.textContent=xyRunLabel(getXY(),selected().length);});});
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
    const canvas=attachXYCanvas(container,getView,save,run,()=>window.CLab?.scheduleViewSave());
    attachXYSelection(container,getXY);attachXYHistoryKeys(container,getXY,selected,render);
    document.addEventListener('clab_task_activity',event=>{if(active()&&event.detail.workspaceId===state.activeWorkspaceId)refreshXYActivity(container,state.activeWorkspaceId);});
    return {render,exportRecords(){ensureXYHistory(state.cards,getXY());materializeMatrixRecords(state.cards,getXY(),workflowParameters());appendWorkspaceTasks(container,state.cards);},leave(){cancelAnimationFrame(mediaFrame);mediaFrame=0;canvas.stop();closeXYPopover();controls?.remove();container.querySelector('.clab-xy-overlay')?.remove();controls=null;}};
}
