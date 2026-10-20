import { escapeHtml as esc } from '../contextmenu/content/shared.js';
import { workflowParameters } from './parameters.js';
import { openXYPopover, closeXYPopover } from './xy_popover.js';

export function openXYAxisPanel(container,getXY,swap) {
    const anchor=()=>container.querySelector('[data-xy-reassign]');
    if(anchor()?.getAttribute('aria-expanded')==='true'&&document.querySelector('.clab-xy-axis-panel:popover-open')){closeXYPopover();return;}
    const panel=openXYPopover(anchor,'交换 XYZ 轴参数','<div class="clab-xy-axis-panel-body"></div>','clab-xy-axis-panel','top',container.closest('#clab-panel'));
    const body=panel.popup.querySelector('.clab-xy-axis-panel-body');
    const render=()=>{
        const xy=getXY(),parameters=workflowParameters();
        const options=['x','y','z'].map(name=>({name,text:xy[name].bindings.map(key=>parameters.find(parameter=>parameter.key===key)?.label||key).join('；')||'未绑定'}));
        body.innerHTML=`<div class="clab-xy-axis-assignments">${['x','y','z'].map(name=>`<label><b>${name.toUpperCase()} 轴</b><select data-xy-axis-source="${name}" aria-label="${name.toUpperCase()} 轴参数">${options.map(option=>`<option value="${option.name}" ${option.name===name?'selected':''}>${option.name.toUpperCase()} · ${esc(option.text)}</option>`).join('')}</select></label>`).join('')}</div><p>选择其他轴的参数，将连同取值互换。</p>`;
        panel.position();
    };
    body.addEventListener('change',event=>{const name=event.target.dataset.xyAxisSource;if(name){swap(name,event.target.value);render();body.querySelector(`[data-xy-axis-source=${name}]`).focus({preventScroll:true});}});
    render();body.querySelector('select').focus({preventScroll:true});
}
