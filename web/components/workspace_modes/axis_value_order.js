import { escapeHtml as esc } from '../contextmenu/content/shared.js';
import { axisValueLabel, axisValueDescription } from './axis_labels.js';
import { reorderAxisValues } from './value_parser.js';

let sequence=0;
export function axisValueTabsHTML(input) {
    const id=`clab-axis-values-${++sequence}`;
    return `<div class="clab-axis-value-tabs" role="tablist" aria-label="取值编辑方式"><button type="button" role="tab" data-xy-value-tab="input" id="${id}-input-tab" aria-controls="${id}-input" aria-selected="true">设置取值</button><button type="button" role="tab" data-xy-value-tab="order" id="${id}-order-tab" aria-controls="${id}-order" aria-selected="false" tabindex="-1">取值排序 · <span data-xy-value-count>0</span></button></div><div class="clab-axis-value-page" role="tabpanel" data-xy-value-page="input" id="${id}-input" aria-labelledby="${id}-input-tab">${input}</div><div class="clab-axis-value-page" role="tabpanel" data-xy-value-page="order" id="${id}-order" aria-labelledby="${id}-order-tab" hidden><div class="clab-axis-value-order-list" role="list" aria-label="取值顺序"></div><p>拖动左侧把手调整顺序；组合值整组移动。</p></div>`;
}

function attachSort(list,getValues,reorder) {
    let drag,frame;
    const clear=()=>{cancelAnimationFrame(frame);list.classList.remove('is-dragging');list.querySelectorAll('.is-drag-source,.insert-before,.insert-after').forEach(row=>row.classList.remove('is-drag-source','insert-before','insert-after'));};
    const stop=(apply=false)=>{
        if(!drag)return;const previous=drag;drag=null;clear();if(list.hasPointerCapture(previous.id))list.releasePointerCapture(previous.id);
        if(apply&&previous.moved&&previous.before!==previous.from&&previous.before!==previous.from+1){reorder(reorderAxisValues(getValues(),previous.from,previous.before));list.querySelector(`[data-xy-order-index="${previous.before-(previous.before>previous.from?1:0)}"] button`)?.focus({preventScroll:true});}
    };
    const place=()=>{
        cancelAnimationFrame(frame);if(!drag?.moved)return;if(!list.isConnected){stop();return;}
        const bounds=list.getBoundingClientRect(),old=list.scrollTop,step=drag.y<bounds.top+24?-10:drag.y>bounds.bottom-24?10:0;list.scrollTop+=step;
        const rows=[...list.querySelectorAll('[data-xy-order-index]')],index=rows.findIndex(row=>{const r=row.getBoundingClientRect();return drag.y<(r.top+r.bottom)/2;});drag.before=index<0?rows.length:index;
        rows.forEach((row,i)=>{row.classList.toggle('insert-before',i===drag.before);row.classList.toggle('insert-after',i===rows.length-1&&drag.before===rows.length);});
        if(list.scrollTop!==old)frame=requestAnimationFrame(place);
    };
    list.addEventListener('pointerdown',event=>{
        const handle=event.target.closest('[data-xy-order-handle]');if(event.button!==0||!handle||getValues().length<2)return;
        event.preventDefault();handle.focus({preventScroll:true});const row=handle.closest('[data-xy-order-index]'),from=Number(row.dataset.xyOrderIndex);drag={id:event.pointerId,from,before:from,start:event.clientY,y:event.clientY,moved:false};list.setPointerCapture(event.pointerId);row.classList.add('is-drag-source');list.classList.add('is-dragging');
    });
    list.addEventListener('pointermove',event=>{if(!drag||event.pointerId!==drag.id)return;if(!event.buttons){stop();return;}event.preventDefault();drag.y=event.clientY;drag.moved||=Math.abs(drag.y-drag.start)>4;place();});
    list.addEventListener('pointerup',event=>{if(drag&&event.pointerId===drag.id){event.preventDefault();stop(true);}});
    for(const type of ['pointercancel','lostpointercapture'])list.addEventListener(type,()=>stop());
    list.closest('[role=dialog]').addEventListener('keydown',event=>{if(event.key==='Escape')stop();});
}

export function attachAxisValueTabs(popup,fields,getValues,apply,reorder,position) {
    const tabs=[...popup.querySelectorAll('[data-xy-value-tab]')],pages=[...popup.querySelectorAll('[data-xy-value-page]')],count=popup.querySelector('[data-xy-value-count]'),list=popup.querySelector('.clab-axis-value-order-list');
    let active='input',values=getValues();
    const render=()=>{
        list.innerHTML=values.length?values.map((value,index)=>`<div class="clab-axis-value-order-row" role="listitem" data-xy-order-index="${index}" title="${esc(axisValueDescription(value,fields))}"><button type="button" data-xy-order-handle aria-label="拖动调整取值顺序" title="拖动调整顺序"><svg viewBox="0 0 12 16" fill="currentColor" aria-hidden="true"><circle cx="3" cy="3" r="1.2"/><circle cx="9" cy="3" r="1.2"/><circle cx="3" cy="8" r="1.2"/><circle cx="9" cy="8" r="1.2"/><circle cx="3" cy="13" r="1.2"/><circle cx="9" cy="13" r="1.2"/></svg></button><span>${esc(axisValueLabel({values},index))}</span></div>`).join(''):'<div class="clab-axis-value-order-empty">暂无取值，请先设置取值。</div>';
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
    attachSort(list,()=>values,reorder);preview(values);return {preview};
}
