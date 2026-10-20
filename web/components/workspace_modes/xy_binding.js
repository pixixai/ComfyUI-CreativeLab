import { app } from '../../../../scripts/app.js';
import { escapeHtml as esc } from '../contextmenu/content/shared.js';
import { workflowParameters, nodeName } from './parameters.js';
import { rebindMatrixAxis } from './xy_model.js';
import { state, appState } from '../ui_state.js';
import { pickWorkflowTarget } from '../actions/action_binding.js';
import { openXYPopover } from './xy_popover.js';

export function openXYBinding(container,key,getXY,commit,focusedNode='',trigger) {
    const output=key==='output',multiple=['x','y','z'].includes(key),record=key.startsWith('record:'),recordId=key.slice(7),layer=trigger?.closest('[data-xy-layer]')?.dataset.xyLayer;
    const selected=()=>{const xy=getXY();return output?[xy.outputNodeId].filter(Boolean):multiple?xy[key].bindings:[xy.records.find(entry=>entry.id===recordId)?.key].filter(Boolean);};
    const title=output?'绑定输出节点':multiple?`${key.toUpperCase()} 轴绑定参数`:'附加记录参数';
    const getAnchor=()=>record?container.querySelector('[data-xy-records]'):[...container.querySelectorAll('[data-xy-bind]')].find(button=>button.dataset.xyBind===key&&(layer===undefined||button.closest('[data-xy-layer]')?.dataset.xyLayer===layer));
    const panel=openXYPopover(getAnchor,title,`<div class="clab-binding-columns"><section class="clab-binding-nodes"><input class="clab-binding-search" type="search" placeholder="搜索节点 ID / 名称"><div class="clab-binding-node-list"></div></section>${output?'':'<section class="clab-binding-params"></section>'}</div><div class="clab-binding-panel-foot"></div>`,output?'clab-output-binding-popover':'','',container.closest('#clab-panel'));
    const {popup}=panel,nodes=popup.querySelector('.clab-binding-node-list'),params=popup.querySelector('.clab-binding-params'),search=popup.querySelector('input[type=search]'),foot=popup.querySelector('.clab-binding-panel-foot');
    const pick=document.createElement('button');pick.type='button';pick.className='clab-binding-start-pick';pick.title=output?'拾取输出节点':'拾取节点或参数';
    pick.innerHTML='<svg width="12" height="12" viewBox="0 0 9.11 9.11" fill="currentColor" aria-hidden="true"><path d="M.37.02C.24-.04.08.03.02.17,0,.23,0,.31.02.37l1.62,3.94,1.87,4.54c.09.21.33.31.54.23.1-.04.18-.12.22-.21l1.41-3.13s.03-.04.05-.05l3.13-1.41c.21-.09.3-.34.21-.55-.04-.1-.12-.17-.22-.21L.37.02h0Z"/></svg>拾取节点';
    popup.querySelector('.clab-xy-popup-close').before(pick);
    let focused=focusedNode||selected()[0]?.split('||')[0]||String(app.graph?._nodes[0]?.id??'');
    const render=()=>{
        const keys=selected(),parameters=workflowParameters(),query=search.value.toLowerCase(),scroll=nodes.scrollTop,paramScroll=params?.scrollTop||0;
        const available=(app.graph?._nodes||[]).filter(node=>node.type!=='CLab_SystemConfig');
        for(const key of keys){const id=key.split('||')[0];if(!available.some(node=>String(node.id)===id))available.push({id,title:'节点已失效'});}
        nodes.innerHTML=available.filter(node=>`${node.id} ${nodeName(node)}`.toLowerCase().includes(query)).map(node=>{
            const id=String(node.id),checked=output?keys.includes(id):id===focused;
            return `<div class="clab-binding-node-row ${checked?'is-current':''}">${output?`<input type="radio" name="xy-output" data-xy-node="${esc(id)}" ${checked?'checked':''}>`:''}<button data-xy-node="${esc(id)}"><span>[${esc(id)}]</span><span>${esc(nodeName(node))}</span></button></div>`;
        }).join('')||'<div class="clab-binding-empty">没有匹配节点</div>';nodes.scrollTop=scroll;
        if(params){
            const ids=[...new Set([...keys.map(key=>key.split('||')[0]),focused].filter(Boolean))];
            params.innerHTML=ids.map(id=>{
                const node=available.find(node=>String(node.id)===id),choices=parameters.filter(parameter=>parameter.key.startsWith(`${id}||`));
                for(const key of keys.filter(key=>key.startsWith(`${id}||`)))if(!choices.some(parameter=>parameter.key===key))choices.push({key,name:`${key.split('||')[1]}（已失效）`});
                return `<div class="clab-binding-param-group ${id===focused?'is-current':''}" data-xy-group="${esc(id)}"><div class="clab-binding-group-title">[${esc(id)}] ${esc(nodeName(node))}</div>${choices.map(parameter=>`<label class="clab-binding-param"><input type="${multiple?'checkbox':'radio'}" name="xy-parameter" data-xy-parameter="${esc(parameter.key)}" ${keys.includes(parameter.key)?'checked':''}><span>${esc(parameter.displayName||parameter.name)}</span></label>`).join('')||'<div class="clab-binding-empty">没有可绑定参数</div>'}</div>`;
            }).join('');params.scrollTop=paramScroll;
        }
        foot.textContent=multiple?'按勾选顺序排列组合值 · 可跨节点选择多个参数':'再次点击已选项取消绑定';panel.position();
    };
    const update=keys=>{
        const xy=getXY(),parameters=workflowParameters();
        if(multiple){if(['x','y','z'].some(name=>name!==key&&(name!=='z'||xy.z.enabled)&&keys.some(binding=>xy[name].bindings.includes(binding))))throw new Error('同一个参数不能同时由多个坐标轴控制。');if(key==='z')xy.z.enabled=keys.length>0;rebindMatrixAxis(state.cards,xy,key,keys,parameters);}
        else if(output)xy.outputNodeId=keys[0]||'';
        else if(record)xy.records.find(entry=>entry.id===recordId).key=keys[0]||'';
        commit();
    };
    const apply=keys=>{try{update(keys);render();}catch(error){render();foot.textContent=error.message;}};
    pick.onclick=()=>{
        if(appState.isBindingMode)return;
        const root=container.closest('#clab-panel');let pickedNode='',message='';
        document.addEventListener('clab_binding_finished',()=>requestAnimationFrame(()=>{
            if(!root.isConnected||!root.classList.contains('visible')||root.dataset.workspaceMode!=='xy')return;
            const restored=openXYBinding(container,key,getXY,commit,pickedNode,getAnchor());
            if(message)restored.popup.querySelector('.clab-binding-panel-foot').textContent=message;
        }),{once:true});
        panel.close();
        pickWorkflowTarget(output?'preview':'edit',root,document.getElementById('clab-backdrop'),({node,targets,isAppend})=>{
            pickedNode=targets[0]?.nodeIdStr||String(node.id);
            const keys=output?[pickedNode]:targets.filter(target=>target.widgetName).map(target=>`${target.nodeIdStr}||${target.widgetName}`);
            try{update(multiple&&isAppend?[...new Set([...selected(),...keys])]:keys.slice(0,multiple?undefined:1));if(!output&&!keys.length)message=`已拾取节点 [${pickedNode}]，请选择参数。`;}
            catch(error){message=error.message;}
        });
    };
    search.oninput=render;
    popup.addEventListener('click',event=>{
        const node=event.target.closest('[data-xy-node]'),parameter=event.target.closest('[data-xy-parameter]');
        if(node){event.preventDefault();const id=node.dataset.xyNode;if(output)apply(selected().includes(id)?[]:[id]);else{focused=id;render();params.querySelector(`[data-xy-group="${CSS.escape(id)}"]`)?.scrollIntoView({block:'nearest'});}return;}
        if(parameter){event.preventDefault();const key=parameter.dataset.xyParameter,keys=selected();focused=key.split('||')[0];apply(keys.includes(key)?keys.filter(entry=>entry!==key):multiple?[...keys,key]:[key]);}
    });
    popup.addEventListener('keydown',event=>{if(event.key===' '&&event.target.matches('[data-xy-parameter],input[data-xy-node]')){event.preventDefault();if(!event.repeat)event.target.click();}});
    render();nodes.querySelector('.is-current')?.scrollIntoView({block:'nearest'});return panel;
}
