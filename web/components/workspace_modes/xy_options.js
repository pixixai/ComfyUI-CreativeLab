import { escapeHtml as esc } from '../contextmenu/content/shared.js';
import { openXYPopover, closeXYPopover } from './xy_popover.js';
import { axisValueLabel, axisValueDescription } from './axis_labels.js';
import { currentZLayer } from './xy_model.js';

function openOptions(container,selector,title,items,choose,side='end') {
    const anchor=()=>container.querySelector(selector);
    if(anchor()?.getAttribute('aria-expanded')==='true'){closeXYPopover();return;}
    const panel=openXYPopover(anchor,title,items.map(item=>`<button type="button" role="${item.selected===undefined?'menuitem':'menuitemradio'}" ${item.selected===undefined?'':`aria-checked="${item.selected}"`} data-xy-option="${esc(item.value)}" title="${esc(item.title||item.text)}">${esc(item.text)}</button>`).join(''),'clab-xy-options',side,container.closest('#clab-panel'));
    panel.popup.setAttribute('role','menu');
    panel.popup.addEventListener('click',event=>{const button=event.target.closest('[data-xy-option]');if(button){panel.close();choose(button.dataset.xyOption);anchor()?.focus({preventScroll:true});}});
    panel.popup.addEventListener('keydown',event=>{
        if(!['ArrowDown','ArrowUp','Home','End'].includes(event.key))return;
        event.preventDefault();const buttons=[...panel.popup.querySelectorAll('[data-xy-option]')],index=buttons.indexOf(document.activeElement);
        buttons[event.key==='Home'?0:event.key==='End'?buttons.length-1:(index+(event.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length]?.focus();
    });
    (panel.popup.querySelector('[aria-checked=true]')||panel.popup.querySelector('[data-xy-option]'))?.focus({preventScroll:true});
}

export function openXYRunOptions(container,run) {
    openOptions(container,'[data-xy-run-options]','更多运行选项',[{value:'all',text:'运行全部层'}],run,'top');
}
export function openXYConfigOptions(container,choose) {
    openOptions(container,'[data-xy-config-options]','数据维护',[{value:'clean',text:'清理失效记录 (404)'},{value:'resync',text:'重新同步记录 (强制刷新)'}],choose,'top');
}
export function openZLayerOptions(container,xy,choose) {
    openOptions(container,'.clab-z-more','切换 Z 层',xy.z.values.map((value,index)=>({value:index,text:axisValueLabel(xy.z,index),title:axisValueDescription(value),selected:index===currentZLayer(xy)})),choose);
}
