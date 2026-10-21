import { generateSingleCardHTML, attachCardEvents } from '../comp_taskcard.js';
import { generateAreaHTML, generateDeferredAreaHTML, attachAreaEvents, surgicallyUpdateArea } from '../comp_modulearea.js';
import { moveModuleDOM } from '../modules/module_lifecycle.js';
import { state, getActiveWorkspace } from '../ui_state.js';

export function appendWorkspaceTasks(container,cards) {
    const wrapper=container.querySelector('.clab-cards-wrapper');if(!wrapper)return;
    const elements=new Map([...wrapper.querySelectorAll(':scope > .clab-card')].map(element=>[element.dataset.cardId,element]));
    for(const [index,card]of cards.entries()){
        let element=elements.get(card.id);
        if(!element){
            const temp=document.createElement('div');temp.innerHTML=generateSingleCardHTML(card,index);element=temp.firstElementChild;wrapper.append(element);attachCardEvents(element);
        }
        const list=element.querySelector('.clab-area-list'),areas=new Map([...list.children].map(area=>[area.dataset.areaId,area]));
        for(const [id,area]of areas)if(!card.areas.some(item=>item.id===id))area.remove();
        card.areas.forEach((area,index)=>{
            let element=areas.get(area.id);
            if(!element){const temp=document.createElement('div');temp.innerHTML=(getActiveWorkspace()?.view?.mode==='xy'?generateDeferredAreaHTML:generateAreaHTML)(area,card);element=temp.firstElementChild;}
            if(list.children[index]!==element)moveModuleDOM(list,element,list.children[index]||null);
        });
        attachAreaEvents(element);
    }
}

export function hydrateWorkspaceAreas(container,include=()=>true) {
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
