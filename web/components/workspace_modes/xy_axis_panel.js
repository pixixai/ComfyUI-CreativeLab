import { escapeHtml as esc } from '../contextmenu/content/shared.js';
import { workflowParameters } from './parameters.js';
import { openXYPopover, closeXYPopover } from './xy_popover.js';
import { axisOrderHandleHTML, attachAxisValueSort } from './axis_drag.js';

export function openXYAxisPanel(container,getXY,swap) {
    const anchor=()=>container.querySelector('[data-xy-reassign]');
    if(anchor()?.getAttribute('aria-expanded')==='true'&&document.querySelector('.clab-xy-axis-panel:popover-open')){closeXYPopover();return;}
    const panel=openXYPopover(anchor,'交换 XYZ 轴参数','<div class="clab-xy-axis-panel-body"></div>','clab-xy-axis-panel','top',container.closest('#clab-panel'));
    const body=panel.popup.querySelector('.clab-xy-axis-panel-body');
    const render=()=>{
        const xy=getXY(),parameters=workflowParameters();
        const options=['x','y','z'].map(name=>({name,text:xy[name].bindings.map(key=>parameters.find(parameter=>parameter.key===key)?.label||key).join('；')||'未绑定'}));
        body.innerHTML=`<div class="clab-xy-axis-assignments" role="list" aria-label="XYZ 轴参数">${options.map((option,index)=>`<div class="clab-xy-axis-assignment"><b>${option.name.toUpperCase()}</b><div class="clab-axis-value-order-row" role="listitem" data-xy-order-index="${index}" data-xy-axis-source="${option.name}" title="${esc(option.text)}">${axisOrderHandleHTML()}<span>${esc(option.text)}</span></div></div>`).join('')}</div><p>拖动把手到目标选项上，交换两轴的绑定参数和完整取值，其余轴保持不变。</p>`;
        attachAxisValueSort(body.querySelector('.clab-xy-axis-assignments'),()=>['x','y','z'],next=>{
            const names=['x','y','z'],index=names.findIndex((name,i)=>name!==next[i]);if(index<0)return;
            swap(names[index],next[index]);return render();
        },true);
        panel.position();return body.querySelector('.clab-xy-axis-assignments');
    };
    render();body.querySelector('[data-xy-order-handle]').focus({preventScroll:true});
}
