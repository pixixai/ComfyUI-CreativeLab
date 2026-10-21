import { escapeHtml as esc } from '../contextmenu/content/shared.js';
import { axisValueLabel, axisValueDescription } from './axis_labels.js';
import { axisOrderHandleHTML, attachAxisValueSort } from './axis_drag.js';

let sequence=0;
export function axisValueTabsHTML(input) {
    const id=`clab-axis-values-${++sequence}`;
    return `<div class="clab-axis-value-tabs" role="tablist" aria-label="取值编辑方式"><button type="button" role="tab" data-xy-value-tab="input" id="${id}-input-tab" aria-controls="${id}-input" aria-selected="true">设置取值</button><button type="button" role="tab" data-xy-value-tab="order" id="${id}-order-tab" aria-controls="${id}-order" aria-selected="false" tabindex="-1">取值排序 · <span data-xy-value-count>0</span></button></div><div class="clab-axis-value-page" role="tabpanel" data-xy-value-page="input" id="${id}-input" aria-labelledby="${id}-input-tab">${input}</div><div class="clab-axis-value-page" role="tabpanel" data-xy-value-page="order" id="${id}-order" aria-labelledby="${id}-order-tab" hidden><div class="clab-axis-value-order-list" role="list" aria-label="取值顺序"></div><p>拖动左侧把手调整顺序；组合值整组移动。</p></div>`;
}

export function attachAxisValueTabs(popup,fields,getValues,apply,reorder,position) {
    const tabs=[...popup.querySelectorAll('[data-xy-value-tab]')],pages=[...popup.querySelectorAll('[data-xy-value-page]')],count=popup.querySelector('[data-xy-value-count]'),list=popup.querySelector('.clab-axis-value-order-list');
    let active='input',values=getValues();
    const render=()=>{
        list.innerHTML=values.length?values.map((value,index)=>`<div class="clab-axis-value-order-row" role="listitem" data-xy-order-index="${index}" title="${esc(axisValueDescription(value,fields))}">${axisOrderHandleHTML()}<span>${esc(axisValueLabel({values},index))}</span><button type="button" data-xy-order-remove="${index}" title="移除此取值" aria-label="移除第 ${index+1} 条取值">×</button></div>`).join(''):'<div class="clab-axis-value-order-empty">暂无取值，请先设置取值。</div>';
    };
    const preview=next=>{if(next){const changed=JSON.stringify(values)!==JSON.stringify(next);values=next;count.textContent=values.length;if(active==='order'&&changed)render();}else count.textContent='—';};
    const show=name=>{
        if(name===active)return true;if(name==='order'&&!apply()){popup.querySelector('[data-xy-values]')?.focus({preventScroll:true});return false;}
        active=name;tabs.forEach(tab=>{const current=tab.dataset.xyValueTab===name;tab.setAttribute('aria-selected',String(current));tab.tabIndex=current?0:-1;});pages.forEach(page=>{page.hidden=page.dataset.xyValuePage!==name;});
        if(name==='order'){values=getValues();render();}position();return true;
    };
    popup.querySelector('[role=tablist]').addEventListener('pointerdown',event=>{if(event.button===0&&event.target.closest('[data-xy-value-tab]'))event.preventDefault();});
    popup.querySelector('[role=tablist]').addEventListener('click',event=>{const tab=event.target.closest('[data-xy-value-tab]');if(tab&&show(tab.dataset.xyValueTab))tab.focus({preventScroll:true});});
    popup.querySelector('[role=tablist]').addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const index=tabs.indexOf(document.activeElement),next=event.key==='Home'?0:event.key==='End'?1:(index+1)%2;if(show(tabs[next].dataset.xyValueTab))tabs[next].focus();});
    list.addEventListener('click',event=>{const button=event.target.closest('[data-xy-order-remove]');if(!button)return;const index=Number(button.dataset.xyOrderRemove);reorder(values.filter((_,i)=>i!==index));list.querySelector(`[data-xy-order-remove="${Math.min(index,values.length-1)}"]`)?.focus({preventScroll:true});position();});
    attachAxisValueSort(list,()=>values,reorder);preview(values);return {preview};
}
