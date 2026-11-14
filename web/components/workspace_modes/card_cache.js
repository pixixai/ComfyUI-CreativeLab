import { cacheLimits } from '../cache_preferences.js';
import { moveModuleDOM,releaseModuleTree } from '../modules/module_lifecycle.js';
import { app } from '../../../../scripts/app.js';

function bindingContext(card){
    const ids=new Set();for(const area of card.areas){if(area.targetNodeId!=null)ids.add(String(area.targetNodeId));for(const id of area.targetNodeIds||[])ids.add(String(id));for(const key of area.targetWidgets||[])ids.add(key.split('||')[0]);}
    const key=[];for(const id of ids){const node=app.graph.getNodeById(id);key.push(node,node?.title,node?.constructor?.nodeData);for(const widget of node?.widgets||[])key.push(widget,widget.name,widget.type,widget.options?.values,widget.options?.values?.length);}
    return key;
}

export function createCardCache(container,viewport){
    const host=document.createElement('div');host.hidden=true;host.dataset.clabCardCache='';container.closest('#clab-panel').append(host);
    const cards=new Map();
    const discard=entry=>{cards.delete(entry.card.id);viewport.releaseCard(entry.root);entry.root.remove();releaseModuleTree(entry.root);};
    const trim=()=>{while(cards.size>cacheLimits.cards)discard(cards.values().next().value);};
    document.addEventListener('clab_cache_limits_change',trim);
    return {
        put(root,card){
            if(!cacheLimits.cards||!card||root.hasAttribute('data-clab-card-shell')||!viewport.parkCard(root))return false;
            root.hidden=true;moveModuleDOM(host,root);cards.set(card.id,{root,card,structure:card.areas.map(area=>area.id).join('|'),context:bindingContext(card)});trim();return true;
        },
        take(card){const entry=cards.get(card.id);if(!entry)return null;cards.delete(card.id);if(entry.card!==card){discard(entry);return null;}const next=bindingContext(card);if(entry.structure!==card.areas.map(area=>area.id).join('|')||next.length!==entry.context.length||next.some((value,index)=>value!==entry.context[index]))for(const area of entry.root.querySelectorAll('.clab-area'))area.dataset.clabPendingRefresh='';entry.root.hidden=false;return entry.root;},
        clear(){for(const entry of [...cards.values()])discard(entry);},
        prune(live){const ids=new Set(live.map(card=>card.id));for(const [id,entry]of cards)if(!ids.has(id))discard(entry);}
    };
}
