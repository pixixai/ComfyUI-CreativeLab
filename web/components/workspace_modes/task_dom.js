import { generateSingleCardHTML, attachCardEvents } from '../comp_taskcard.js';
import { generateAreaHTML, attachAreaEvents } from '../comp_modulearea.js';
import { moveModuleDOM } from '../modules/module_lifecycle.js';

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
            if(!element){const temp=document.createElement('div');temp.innerHTML=generateAreaHTML(area,card);element=temp.firstElementChild;}
            if(list.children[index]!==element)moveModuleDOM(list,element,list.children[index]||null);
        });
        attachAreaEvents(element);
    }
}
