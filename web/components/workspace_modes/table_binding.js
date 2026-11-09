import { app } from '../../../../scripts/app.js';
import { appState } from '../ui_state.js';
import { pickWorkflowTarget, resolveBindingTargets } from '../actions/action_binding.js';
import { bindingsOf } from './task_model.js';
import { workflowParameters, nodeName } from './parameters.js';
import { escapeHtml as esc } from '../contextmenu/content/shared.js';
import { openXYPopover } from './xy_popover.js';

export function openTableBinding(container,column,changed,focused='') {
    const area=column.area,output=area.type==='preview',anchor=()=>container.querySelector(`.clab-table-column[data-table-column="${CSS.escape(column.id)}"] .clab-module-binding-summary`);
    const panel=openXYPopover(anchor,output?'输出绑定':'绑定设置',`<div class="clab-binding-columns"><section class="clab-binding-nodes"><input type="search" class="clab-binding-search" placeholder="搜索节点 ID / 名称"><div class="clab-binding-node-list"></div></section>${output?'':'<section class="clab-binding-params"></section>'}</div><div class="clab-binding-panel-foot">绑定应用到整列；已有输入和历史保留。</div>`,output?'clab-output-binding-popover':'','',container.closest('#clab-panel'));
    const popup=panel.popup,list=popup.querySelector('.clab-binding-node-list'),params=popup.querySelector('.clab-binding-params'),search=popup.querySelector('input[type=search]');
    focused=focused||area.targetNodeId||String(app.graph?._nodes.find(node=>node.type!=='CLab_SystemConfig')?.id||'');
    const ids=()=>[...new Set([...(area.targetNodeIds||[]).map(String),...bindingsOf(area).map(key=>key.split('||')[0]),...(area.targetNodeId!=null&&area.targetNodeId!==''?[String(area.targetNodeId)]:[])])];
    const set=(nodes,keys)=>{
        area.targetNodeIds=[...new Set(nodes)];area.targetWidgets=[...new Set(keys)];
        const first=area.targetWidgets[0]?.split('||');area.targetNodeId=output?nodes[0]||null:first?.[0]||nodes[0]||null;area.targetWidget=first?.[1]||null;
        const parameter=workflowParameters().find(parameter=>parameter.key===keys[0]);if(parameter)area.dataType=parameter.type;
        changed();render();
    };
    const render=()=>{
        const keys=bindingsOf(area),selected=ids(),parameters=workflowParameters(),nodes=(app.graph?._nodes||[]).filter(node=>node.type!=='CLab_SystemConfig'),query=search.value.toLowerCase(),scroll=list.scrollTop;
        for(const id of selected)if(!nodes.some(node=>String(node.id)===id))nodes.push({id,title:'节点已失效'});
        list.innerHTML=nodes.filter(node=>`${node.id} ${nodeName(node)}`.toLowerCase().includes(query)).map(node=>`<div class="clab-binding-node-row ${String(node.id)===String(focused)?'is-current':''}"><input type="${output?'radio':'checkbox'}" name="table-node" data-node="${esc(node.id)}" ${resolveBindingTargets(node).every(target=>selected.includes(target.nodeIdStr))?'checked':''}><button data-focus-node="${esc(node.id)}"><span>[${esc(node.id)}]</span><span>${esc(nodeName(node))}</span></button></div>`).join('');list.scrollTop=scroll;
        if(params)params.innerHTML=[...new Set([...selected,String(focused)].filter(Boolean))].map(id=>`<div class="clab-binding-param-group ${id===String(focused)?'is-current':''}"><div class="clab-binding-group-title">[${esc(id)}] ${esc(nodeName(nodes.find(node=>String(node.id)===id)))}</div>${parameters.filter(parameter=>parameter.key.startsWith(id+'||')).map(parameter=>`<label class="clab-binding-param"><input type="checkbox" data-widget="${esc(parameter.key)}" ${keys.includes(parameter.key)?'checked':''}><span>${esc(parameter.displayName||parameter.name)}</span></label>`).join('')}</div>`).join('');
        panel.position();
    };
    popup.addEventListener('click',event=>{
        const node=event.target.closest('[data-focus-node],input[data-node]');if(!node)return;
        const id=node.dataset.focusNode||node.dataset.node;focused=id;
        if(output){event.preventDefault();const targets=resolveBindingTargets(nodesById(id));set(String(area.targetNodeId)===targets[0]?.nodeIdStr?[]:targets.slice(0,1).map(target=>target.nodeIdStr),[]);}
        else if(node.matches('button'))render();
    });
    popup.addEventListener('change',event=>{
        const input=event.target;if(output)return;
        if(input.matches('[data-node]')){const id=input.dataset.node;focused=id;const targets=resolveBindingTargets(nodesById(id)),names=targets.map(target=>target.nodeIdStr),keys=targets.filter(target=>target.widgetName).map(target=>`${target.nodeIdStr}||${target.widgetName}`);set(input.checked?[...ids(),...names]:ids().filter(key=>!names.includes(key)),input.checked?[...bindingsOf(area),...keys]:bindingsOf(area).filter(key=>!names.includes(key.split('||')[0])));}
        if(input.matches('[data-widget]')){const key=input.dataset.widget;set(input.checked?[...ids(),key.split('||')[0]]:ids(),input.checked?[...bindingsOf(area),key]:bindingsOf(area).filter(value=>value!==key));}
    });
    const nodesById=id=>app.graph?.getNodeById(id)||{id};
    const pick=document.createElement('button');pick.className='clab-binding-start-pick';pick.innerHTML='<svg width="12" height="12" viewBox="0 0 9.11 9.11" fill="currentColor" aria-hidden="true"><path d="M.37.02C.24-.04.08.03.02.17,0,.23,0,.31.02.37l1.62,3.94,1.87,4.54c.09.21.33.31.54.23.1-.04.18-.12.22-.21l1.41-3.13s.03-.04.05-.05l3.13-1.41c.21-.09.3-.34.21-.55-.04-.1-.12-.17-.22-.21L.37.02h0Z"/></svg>拾取节点';popup.querySelector('.clab-xy-popup-close').before(pick);
    pick.onclick=()=>{
        if(appState.isBindingMode)return;const root=container.closest('#clab-panel');
        document.addEventListener('clab_binding_finished',()=>requestAnimationFrame(()=>{if(root.classList.contains('visible')&&root.dataset.workspaceMode==='table')openTableBinding(container,column,changed,focused);}),{once:true});panel.close();
        pickWorkflowTarget(output?'preview':'edit',root,document.getElementById('clab-backdrop'),({targets,isAppend})=>{
            focused=targets[0]?.nodeIdStr||focused;const keys=targets.filter(target=>target.widgetName).map(target=>`${target.nodeIdStr}||${target.widgetName}`),nodes=targets.map(target=>target.nodeIdStr);
            if(output){area.targetNodeId=nodes[0]||null;area.targetNodeIds=nodes.slice(0,1);area.targetWidgets=[];changed();}
            else{area.targetNodeIds=isAppend?[...new Set([...ids(),...nodes])]:nodes;area.targetWidgets=isAppend?[...new Set([...bindingsOf(area),...keys])]:keys;const first=area.targetWidgets[0]?.split('||');area.targetNodeId=first?.[0]||nodes[0]||null;area.targetWidget=first?.[1]||null;const parameter=workflowParameters().find(parameter=>parameter.key===area.targetWidgets[0]);if(parameter)area.dataType=parameter.type;changed();}
        });
    };
    search.oninput=render;render();return panel;
}
