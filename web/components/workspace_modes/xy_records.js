import { escapeHtml as esc } from '../contextmenu/content/shared.js';
import { workflowParameters } from './parameters.js';
import { bindingButton } from './xy_settings.js';
import { openXYPopover, closeXYPopover } from './xy_popover.js';

export function openXYRecords(container,getXY,{bind,add,remove}) {
    const anchor=()=>container.querySelector('[data-xy-records]');
    if(anchor()?.getAttribute('aria-expanded')==='true'&&document.querySelector('.clab-xy-record-panel:popover-open')){closeXYPopover();return;}
    const panel=openXYPopover(anchor,'附加记录参数','<div class="clab-xy-record-panel-body"></div>','clab-xy-record-panel','top',container.closest('#clab-panel'));
    const body=panel.popup.querySelector('.clab-xy-record-panel-body');
    const render=()=>{
        const parameters=workflowParameters();
        body.innerHTML=`<div class="clab-xy-records">${getXY().records.map(entry=>`<div class="clab-xy-record">${bindingButton(`record:${entry.id}`,[entry.key],parameters)}<button type="button" data-xy-remove-record="${esc(entry.id)}" title="移除记录参数">×</button></div>`).join('')}<button type="button" data-xy-add-record title="添加附加记录参数">＋ 添加记录参数</button></div><p>只记录运行时的工作流值，不修改生成参数。</p>`;
        panel.position();
    };
    body.addEventListener('click',event=>{
        const target=event.target.closest('button');if(!target)return;
        if(target.hasAttribute('data-xy-add-record')){add();return;}
        if(target.hasAttribute('data-xy-remove-record')){remove(target.dataset.xyRemoveRecord);render();body.querySelector('[data-xy-add-record]').focus({preventScroll:true});return;}
        if(target.hasAttribute('data-xy-bind'))bind(target.dataset.xyBind,target);
    });
    render();body.querySelector('button').focus({preventScroll:true});
}
