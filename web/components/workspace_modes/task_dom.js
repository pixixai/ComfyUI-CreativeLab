import { generateSingleCardHTML, attachCardEvents } from '../comp_taskcard.js';
import { generateAreaHTML, generateDeferredAreaHTML, attachAreaEvents, surgicallyUpdateArea } from '../comp_modulearea.js';
import { moveModuleDOM } from '../modules/module_lifecycle.js';
import { state, getActiveWorkspace } from '../ui_state.js';
import { cardWindow } from './card_window.js';
import { virtualizeTasks } from './viewport_geometry.js';

export function appendWorkspaceTasks(container,cards) {
    if(container.closest('#clab-panel')&&getActiveWorkspace()?.view?.mode==='cards'){cardWindow(container).update();return;}
    const wrapper=container.querySelector('.clab-cards-wrapper');if(!wrapper)return;
    const elements=new Map([...wrapper.querySelectorAll(':scope > .clab-card')].map(element=>[element.dataset.cardId,element]));
    const ids=new Set(cards.map(card=>card.id));
    for(const [id,element]of elements)if(!ids.has(id))element.remove();
    let next=wrapper.querySelector(':scope > .clab-card');
    for(const [index,card]of cards.entries()){
        let element=elements.get(card.id);
        let changed=!element;
        if(!element){
            const temp=document.createElement('div');temp.innerHTML=generateSingleCardHTML(card,index);element=temp.firstElementChild;wrapper.append(element);attachCardEvents(element);
        }
        if(element!==next)moveModuleDOM(wrapper,element,next);
        next=element.nextElementSibling;while(next&&!next.matches('.clab-card'))next=next.nextElementSibling;
        const list=element.querySelector('.clab-area-list'),areas=new Map([...list.children].filter(area=>area.matches('.clab-area')).map(area=>[area.dataset.areaId,area]));
        const areaIds=new Set(card.areas.map(area=>area.id));
        for(const [id,area]of areas)if(!areaIds.has(id))area.remove();
        card.areas.forEach((area,index)=>{
            let element=areas.get(area.id);
            if(!element){changed=true;const temp=document.createElement('div');temp.innerHTML=(['xy','table'].includes(getActiveWorkspace()?.view?.mode)||virtualizeTasks(cards)?generateDeferredAreaHTML:generateAreaHTML)(area,card);element=temp.firstElementChild;}
            if(list.children[index]!==element)moveModuleDOM(list,element,list.children[index]||null);
        });
        if(changed)attachAreaEvents(element);
    }
}

export function hydrateWorkspaceAreas(container,include=()=>true) {
    if(container.closest('#clab-panel')&&(virtualizeTasks(state.cards)||container.closest('[data-clab-virtualized]')||container.closest('[data-clab-progressive]')))return;
    const pending=container.querySelectorAll('[data-clab-deferred],[data-clab-pending-refresh]');if(!pending.length)return;
    const cards=new Map(state.cards.map(card=>[card.id,card])),parents=new Set();
    for(const placeholder of pending){
        const card=cards.get(placeholder.dataset.cardId),area=card?.areas.find(area=>area.id===placeholder.dataset.areaId);
        if(!area||!include(card,area))continue;
        if(placeholder.hasAttribute('data-clab-pending-refresh')){delete placeholder.dataset.clabPendingRefresh;surgicallyUpdateArea(area.id);continue;}
        const temp=document.createElement('div');temp.innerHTML=generateAreaHTML(area,card);
        parents.add(placeholder.parentElement);placeholder.replaceWith(temp.firstElementChild);
    }
    parents.forEach(attachAreaEvents);
}
