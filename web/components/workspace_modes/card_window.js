import { state, getActiveWorkspace } from '../ui_state.js';
import { generateSingleCardHTML,attachCardEvents } from '../comp_taskcard.js';
import { generateAreaHTML,generateDeferredAreaHTML,attachAreaEvents,updateAreaDOMIdentity } from '../comp_modulearea.js';
import { moveModuleDOM,releaseModuleTree } from '../modules/module_lifecycle.js';
import { workspacePreferences } from '../workspace_preferences.js';
import { workspaceViewport } from './viewport_components.js';
import { virtualizeTasks } from './viewport_geometry.js';
import { cardWindowRange } from './card_window_geometry.js';
import { createCardNavigation } from './card_navigation.js';
import { createCardCache } from './card_cache.js';
import { observeMediaDimensions } from './media_dimensions.js';
import { getAreaResultType } from '../modules/media_types/media_utils.js';

const controllers=new WeakMap();
export const hasCardWindow=container=>!!container?.querySelector('.clab-cards-wrapper[data-clab-card-window]');
export function cardWindow(container) {
    if(controllers.has(container))return controllers.get(container);
    const panel=container.closest('#clab-panel'),viewport=workspaceViewport(container),scrolls=new WeakMap();
    const pool=createCardCache(container,viewport);
    const navigation=createCardNavigation(container,{prepare:()=>prepareNavigation(),settle:()=>update()});
    let wrapper,owner,frame=0,busy=false,dragCard=null,edge=0,dragFrame=0,scrollKey='';
    if(!document.getElementById('clab-card-window-style')){
        const style=document.createElement('style');style.id='clab-card-window-style';style.textContent=`
        #clab-panel .clab-cards-wrapper[data-clab-card-window]{display:block!important;flex:none!important;overflow-anchor:none}
        #clab-panel .clab-cards-wrapper[data-clab-card-window]>.clab-card{position:absolute;top:0;bottom:0;box-sizing:border-box!important}
        `;document.head.append(style);
    }
    const active=()=>panel.classList.contains('visible')&&getActiveWorkspace()?.view?.mode==='cards'&&panel.dataset.workspaceMode!=='table'&&panel.dataset.workspaceMode!=='xy';
    const width=()=>parseFloat(getComputedStyle(panel).getPropertyValue('--clab-card-width'))||workspacePreferences.cardWidth;
    const windowRange=()=>cardWindowRange(state.cards.length,container.scrollLeft,container.clientWidth||window.innerWidth*.8,width(),workspacePreferences.cardGap,workspacePreferences.cardBuffer);
    const rangeKey=range=>[range.start,range.end,range.total,range.stride,container.clientWidth,workspacePreferences.cardBuffer].join(':');
    const pinned=root=>root===dragCard||root.contains(document.activeElement)||!!root.querySelector('.clab-custom-select.open,.clab-upload-status,[aria-expanded=true]');
    const forget=root=>{
        const card=(owner?.cards||state.cards).find(card=>card.id===root.dataset.cardId);
        if(card)scrolls.set(card,root.querySelector('.clab-card-body')?.scrollTop||0);
        if(pool.put(root,card))return;
        viewport.releaseCard(root);root.remove();releaseModuleTree(root);
    };
    const update=()=>{
        frame=0;if(busy||!active()||container.hasAttribute('data-clab-opening'))return;const next=container.querySelector('.clab-cards-wrapper');if(!next)return;
        busy=true;
        try{
            const workspace=getActiveWorkspace();
            if(navigation.destination?.workspace!==workspace&&navigation.destination)navigation.stop(false);
            if(next!==wrapper||workspace!==owner){pool.clear();if(next===wrapper)for(const root of wrapper.querySelectorAll(':scope>.clab-card')){viewport.releaseCard(root);root.remove();releaseModuleTree(root);}wrapper=next;owner=workspace;}
            pool.prune(state.cards);
            wrapper.dataset.clabCardWindow='';
            const size=width(),gap=workspacePreferences.cardGap,range=cardWindowRange(state.cards.length,container.scrollLeft,container.clientWidth||window.innerWidth*.8,size,gap,workspacePreferences.cardBuffer);
            const indices=new Map(state.cards.map((card,index)=>[card.id,index]));
            const roots=new Map([...wrapper.querySelectorAll(':scope>.clab-card')].map(root=>[root.dataset.cardId,root]));
            const wanted=new Set(state.cards.slice(range.start,range.end).map(card=>card.id));
            const target=navigation.destination,preload=new Set();
            if(target){const destination=cardWindowRange(state.cards.length,target.left,container.clientWidth,size,gap,workspacePreferences.cardBuffer);for(const card of state.cards.slice(destination.start,destination.end)){wanted.add(card.id);preload.add(card.id);}}
            for(const [id,root]of roots)if(indices.has(id)&&pinned(root))wanted.add(id);
            wrapper.style.width=range.total?`${range.total}px`:'100%';wrapper.style.flex=range.total?'none':'1';wrapper.style.margin=range.total<container.clientWidth-40?'0 auto':'0';
            const areas=new Map([...wrapper.querySelectorAll('.clab-area')].map(root=>[root.dataset.areaId,root])),created=[],selectedAreas=new Set(state.selectedAreaIds);
            for(const id of wanted){
                const index=indices.get(id),card=state.cards[index];let root=roots.get(id);
                const shell=!!target;
                if(!root){root=pool.take(card);if(!root){const temp=document.createElement('div');temp.innerHTML=generateSingleCardHTML(card,index,{defer:!!target||container.hasAttribute('data-clab-progressive'),shell});root=temp.firstElementChild;}created.push([root,card]);moveModuleDOM(wrapper,root);roots.set(id,root);}
                root.style.left=`${index*range.stride}px`;
                const selected=state.selectedCardIds.includes(id);root.classList.toggle('selected',selected);root.classList.toggle('active',selected);
                const title=root.querySelector('.clab-card-title-input'),label=card.title||`#${index+1}`;
                if(title&&document.activeElement!==title){title.value=label;title.size=Math.max(2,label.length);title.placeholder=title.dataset.default=`#${index+1}`;}
                const list=root.querySelector('.clab-area-list');let added=false;
                if(shell)continue;
                delete root.dataset.clabCardShell;
                for(const [position,area]of card.areas.entries()){
                    let element=list.querySelector(`:scope>[data-area-id="${CSS.escape(area.id)}"]`)||areas.get(area.id);
                    if(!element){const temp=document.createElement('div');temp.innerHTML=(target||container.hasAttribute('data-clab-progressive')||virtualizeTasks(state.cards)?generateDeferredAreaHTML:generateAreaHTML)(area,card);element=temp.firstElementChild;added=true;}
                    if(list.children[position]!==element)moveModuleDOM(list,element,list.children[position]||null);
                    if(element.dataset.cardId!==id)updateAreaDOMIdentity(area.id,id);
                    const chosen=selectedAreas.has(area.id);element.classList.toggle('active',chosen);element.classList.toggle('selected',chosen);const border=chosen?'var(--clab-theme-module, #2196F3)':'';if(element.style.borderColor!==border)element.style.borderColor=border;
                }
                const ids=new Set(card.areas.map(area=>area.id));for(const child of [...list.children])if(!ids.has(child.dataset.areaId))child.remove();
                if(added)attachAreaEvents(root);
            }
            for(const [id,root]of roots)if(!wanted.has(id)){if(target){if(root.hasAttribute('data-clab-card-shell'))root.remove();}else forget(root);}
            if(created.length){attachCardEvents(wrapper);for(const [root]of created)attachAreaEvents(root);}
            if(target)return;
            viewport.update('cards',{preload,focusCardId:target?.cardId});
            const running=new Map((window.CLab?.getRunningCardProgress?.(owner.id)||[]).map(task=>[task.cardId,task.progress]));
            for(const [root,card]of created){root.querySelector('.clab-card-body').scrollTop=scrolls.get(card)||0;const progress=running.get(card.id);if(progress!==undefined){const bar=root.querySelector('.clab-card-progress-container');bar.style.opacity='1';bar.firstElementChild.style.width=`${progress}%`;}}
            wrapper.dataset.cardWindowStart=range.start;wrapper.dataset.cardWindowEnd=range.end;
            scrollKey=rangeKey(range);
        }finally{busy=false;}
    };
    const schedule=()=>{if(active()&&!frame)frame=requestAnimationFrame(update);};
    const prepareNavigation=()=>{
        update();const target=navigation.destination;if(!target)return;
        const size=width(),range=cardWindowRange(state.cards.length,target.left,container.clientWidth,size,workspacePreferences.cardGap,0),releases=[];
        for(const card of state.cards.slice(range.start,range.end)){
            const area=card.areas.find(area=>area.type==='preview'&&area.resultUrl&&getAreaResultType(area)==='image');
            if(area)releases.push(observeMediaDimensions(area.resultUrl,false,()=>{}));
        }
        return ()=>releases.forEach(release=>release());
    };
    const reveal=(cardId,areaId)=>{
        if(!active())return null;const index=state.cards.findIndex(card=>card.id===cardId||card.areas.some(area=>area.id===areaId));if(index<0)return null;
        const size=width(),start=index*(size+workspacePreferences.cardGap),style=getComputedStyle(container),available=container.clientWidth-(parseFloat(style.paddingLeft)||0)-(parseFloat(style.paddingRight)||0);
        if(start<container.scrollLeft||size>available)container.scrollLeft=start;else if(start+size>container.scrollLeft+available)container.scrollLeft=start+size-available;
        update();const root=wrapper.querySelector(`:scope>[data-card-id="${CSS.escape(state.cards[index].id)}"]`);
        return areaId?root?.querySelector(`[data-area-id="${CSS.escape(areaId)}"]`):root;
    };
    const ensureArea=areaId=>{
        if(!active())return;const node=reveal(null,areaId);node?.dispatchEvent(new CustomEvent('clab_ensure_component',{bubbles:true}));return node;
    };
    const leave=()=>{
        navigation.stop(false);
        pool.clear();
        cancelAnimationFrame(frame);frame=0;
        scrollKey='';
        if(!wrapper?.hasAttribute('data-clab-card-window'))return;
        for(const root of wrapper.querySelectorAll('[data-clab-layout]')){root.replaceChildren();delete root.dataset.clabLayout;root.dataset.clabDeferred='';}
        delete wrapper.dataset.clabCardWindow;delete wrapper.dataset.cardWindowStart;delete wrapper.dataset.cardWindowEnd;
        for(const root of wrapper.querySelectorAll(':scope>.clab-card'))root.style.removeProperty('left');
    };
    // Component visibility has its own scroll listener. Reconcile card structure only
    // when scrolling crosses a window boundary; content/selection updates still force it.
    container.addEventListener('scroll',()=>{
        if(navigation.destination)return;
        if(active()&&(getActiveWorkspace()!==owner||wrapper!==container.querySelector('.clab-cards-wrapper')||rangeKey(windowRange())!==scrollKey))schedule();
    });
    container.addEventListener('focusout',schedule);container.addEventListener('clab_viewport_change',schedule);
    document.addEventListener('clab_card_buffer_change',schedule);
    container.addEventListener('dragstart',event=>{dragCard=event.target.closest('.clab-card');},true);
    const dragScroll=()=>{dragFrame=0;if(!dragCard||!edge||!active())return;container.scrollLeft+=edge;update();dragFrame=requestAnimationFrame(dragScroll);};
    container.addEventListener('dragover',event=>{if(!dragCard||!active())return;const box=container.getBoundingClientRect();edge=event.clientX<box.left+48?-16:event.clientX>box.right-48?16:0;if(edge){event.preventDefault();if(!dragFrame)dragFrame=requestAnimationFrame(dragScroll);}},{capture:true});
    const stop=()=>{dragCard=null;edge=0;cancelAnimationFrame(dragFrame);dragFrame=0;schedule();};
    window.addEventListener('dragend',stop,true);window.addEventListener('drop',stop,true);
    new ResizeObserver(schedule).observe(container);
    const api={update,schedule,reveal,ensureArea,leave,jump:navigation.jump};controllers.set(container,api);return api;
}
export function revealWorkspaceTarget(container,cardId,areaId){
    if(hasCardWindow(container))return cardWindow(container).reveal(cardId,areaId);
    return container?.querySelector(areaId?`[data-area-id="${CSS.escape(areaId)}"]`:`.clab-card[data-card-id="${CSS.escape(cardId||'')}"]`);
}
