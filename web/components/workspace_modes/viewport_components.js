import { layoutSignature,sameLayout,deferredLayoutHTML,activateLayoutMedia,measureCardLayout,preloadCardMediaSize,applyCardMediaSize } from './card_layout.js';
import { state, getActiveWorkspace } from '../ui_state.js';
import { generateAreaHTML,attachAreaEvents,surgicallyUpdateArea,updateAreaDOMIdentity } from '../comp_modulearea.js';
import { moveModuleDOM,releaseModuleTree } from '../modules/module_lifecycle.js';
import { captureModelState,restoreModelState,refreshModelVisibility } from '../modules/media_types/media_model.js';
import { getAreaResultType } from '../modules/media_types/media_utils.js';
import { virtualizeTasks,intersectsViewport,xyDetailLevel,estimatedModuleHeight } from './viewport_geometry.js';
import { createFrameWork } from '../frame_work.js';
import { cacheLimits } from '../cache_preferences.js';

const controllers=new WeakMap();
export function workspaceViewport(container){
    if(controllers.has(container))return controllers.get(container);
    const panel=container.closest('#clab-panel'),cache=document.createElement('div');cache.hidden=true;cache.dataset.clabRetainModel='';cache.dataset.clabViewportCache='';panel.append(cache);
    const entries=new Map(),parked=new Map(),saved=new WeakMap(),dimensions=new WeakMap(),imageSizes=new WeakMap(),positions=new Map(),pendingMedia=new WeakMap();let mode,config={},wrapper,workspace,enabled=false,frame=0,dragging=false;
    const work=createFrameWork(()=>panel.classList.contains('visible')&&!dragging&&workspace===getActiveWorkspace()&&wrapper===container.querySelector('.clab-cards-wrapper'));
    const remember=entry=>{if(mode!=='cards'||entry.root.matches('[data-clab-deferred],[data-clab-virtual]'))return;const height=entry.root.offsetHeight;if(height){entry.height=height;dimensions.set(entry.area,{key:layoutSignature(entry.area,entry.root.offsetWidth),height});}};
    const snapshot=entry=>({height:entry.root.offsetHeight||entry.height,media:[...entry.root.querySelectorAll('video,audio')].map(media=>pendingMedia.get(media)||({url:media.getAttribute('src'),time:media.currentTime,playing:!media.paused,muted:media.muted,volume:media.volume,rate:media.playbackRate})),models:[...entry.root.querySelectorAll('.clab-glb-viewer')].map(captureModelState),textareas:[...entry.root.querySelectorAll('textarea')].map(element=>({height:element.style.height,manual:element.style.resize!=='none'})),scroll:[...entry.root.querySelectorAll('textarea,.clab-text-body-scroll')].map(element=>element.scrollTop)});
    const restoreTextLayout=entry=>{const previous=saved.get(entry.area)?.textareas;entry.root.querySelectorAll('textarea').forEach((element,index)=>{if(previous?.[index]?.manual&&element.style.resize!=='none'&&previous[index].height)element.style.height=previous[index].height;});};
    const restore=entry=>{
        restoreTextLayout(entry);
        const data=saved.get(entry.area);if(!data)return;
        entry.root.querySelectorAll('video,audio').forEach((media,index)=>{const previous=data.media[index];if(!previous||previous.url!==media.getAttribute('src'))return;const apply=()=>{pendingMedia.delete(media);if(media.getAttribute('src')!==previous.url)return;media.currentTime=previous.time;media.muted=previous.muted;media.volume=previous.volume;media.playbackRate=previous.rate;if(previous.playing&&panel.classList.contains('visible')&&wrapper.contains(entry.root)&&!entry.root.matches('[data-clab-virtual]')&&!entry.root.closest('.clab-card[hidden],.clab-area[hidden]'))media.play().catch(()=>{});};if(media.readyState)apply();else{pendingMedia.set(media,previous);media.addEventListener('loadedmetadata',apply,{once:true});}});
        entry.root.querySelectorAll('.clab-glb-viewer').forEach((stage,index)=>restoreModelState(stage,data.models[index]));
        entry.root.querySelectorAll('textarea,.clab-text-body-scroll').forEach((element,index)=>element.scrollTop=data.scroll[index]||0);
    };
    const discard=entry=>{clearTimeout(entry.expiry);if(entry.holder){entry.holder.querySelectorAll('video,audio').forEach(media=>{pendingMedia.delete(media);media.pause();media.removeAttribute('src');media.load();});entry.holder.remove();releaseModuleTree(entry.holder);entry.holder=null;}parked.delete(entry.root);};
    const trimCaches=()=>{
        for(const kind of ['components','media','models']){const group=[...parked.values()].filter(entry=>entry.kind===kind);for(const entry of group.slice(0,Math.max(0,group.length-cacheLimits[kind])))discard(entry);}
    };
    const park=(entry,clearSummary=true)=>{
        if(clearSummary&&entry.root.hasAttribute('data-clab-summary')){entry.root.querySelector('.clab-virtual-summary')?.remove();delete entry.root.dataset.clabSummary;}
        if(entry.root.hasAttribute('data-clab-deferred')||entry.root.hasAttribute('data-clab-virtual'))return;
        if(entry.root.hasAttribute('data-clab-layout')){remember(entry);entry.root.replaceChildren();delete entry.root.dataset.clabLayout;entry.root.dataset.clabVirtual='';entry.root.style.setProperty('--clab-virtual-height',`${entry.height}px`);return;}
        remember(entry);saved.set(entry.area,snapshot(entry));
        entry.kind=entry.root.querySelector('.clab-glb-viewer')?'models':entry.root.querySelector('video,audio')?'media':'components';
        entry.root.querySelectorAll('video,audio').forEach(media=>media.pause());
        const holder=document.createElement('div');cache.append(holder);while(entry.root.firstChild)moveModuleDOM(holder,entry.root.firstChild);
        entry.holder=holder;parked.set(entry.root,entry);entry.root.dataset.clabVirtual='';entry.root.style.setProperty('--clab-virtual-height',`${entry.height}px`);
        if(entry.kind!=='components')entry.expiry=setTimeout(()=>{if(entry.holder)discard(entry);},30000);
        trimCaches();
    };
    const prepare=entry=>{
        const root=entry.root;if(!root.hasAttribute('data-clab-deferred'))return false;
        const temp=document.createElement('div');temp.innerHTML=deferredLayoutHTML(generateAreaHTML(entry.area,entry.card));const full=temp.firstElementChild;
        for(const name of full.classList)root.classList.add(name);for(const property of full.style)root.style.setProperty(property,full.style.getPropertyValue(property));
        root.replaceChildren(...full.childNodes);delete root.dataset.clabDeferred;root.dataset.clabLayout='';preloadCardMediaSize(root,entry.area,imageSizes,()=>{remember(entry);schedule();});restoreTextLayout(entry);measureCardLayout(root);remember(entry);return true;
    };
    const mount=entry=>{
        const root=entry.root;
        if(!root.hasAttribute('data-clab-deferred')&&!root.hasAttribute('data-clab-virtual')&&!root.hasAttribute('data-clab-summary')&&!root.hasAttribute('data-clab-layout'))return false;
        root.querySelector('.clab-virtual-summary')?.remove();delete root.dataset.clabSummary;
        if(root.hasAttribute('data-clab-layout')){delete root.dataset.clabLayout;activateLayoutMedia(root);attachAreaEvents(root);}
        else if(entry.holder){while(entry.holder.firstChild)moveModuleDOM(root,entry.holder.firstChild);discard(entry);}
        else if(!config.mount?.(root,entry.card,entry.area)){
            const temp=document.createElement('div');temp.innerHTML=generateAreaHTML(entry.area,entry.card);const full=temp.firstElementChild;
            for(const name of full.classList)root.classList.add(name);for(const property of full.style)if(!root.style.getPropertyValue(property))root.style.setProperty(property,full.style.getPropertyValue(property));
            root.replaceChildren(...full.childNodes);attachAreaEvents(root);
        }
        delete root.dataset.clabDeferred;delete root.dataset.clabVirtual;updateAreaDOMIdentity(entry.area.id,entry.card.id);
        if(mode!=='cards')root.draggable=false;
        config.mounted?.(root,entry.card,entry.area);if(mode==='cards'){applyCardMediaSize(root,entry.area,imageSizes);measureCardLayout(root);}restore(entry);remember(entry);
        if(root.hasAttribute('data-clab-pending-refresh')){delete root.dataset.clabPendingRefresh;surgicallyUpdateArea(entry.area.id,{notify:(entry.area.type==='preview')!==root.classList.contains('clab-output-area')});if(mode==='cards'){const current=root.isConnected?root:wrapper.querySelector(`[data-area-id="${CSS.escape(entry.area.id)}"]`);if(current)measureCardLayout(current);remember(entry);}if(!root.isConnected)document.dispatchEvent(new CustomEvent('clab_workspace_view_change'));}
        return true;
    };
    const summary=entry=>{
        park(entry,false);const root=entry.root;root.dataset.clabVirtual='';root.dataset.clabSummary='';
        let body=root.querySelector('.clab-virtual-summary');if(!body){body=document.createElement('div');body.className='clab-virtual-summary';root.append(body);}
        const url=entry.area.resultUrl||'',kind=getAreaResultType(entry.area),key=kind+':'+url+':'+String(entry.area.textContent||'').slice(0,128);
        if(body.dataset.key===key)return;body.dataset.key=key;body.replaceChildren();
        if(kind==='image'&&url){const image=new Image();image.loading='lazy';image.decoding='async';image.draggable=false;image.src=url;body.append(image);}
        else{const label=document.createElement('span');label.textContent=kind==='text'?String(entry.area.textContent||'文本').slice(0,80):({video:'视频',audio:'音频',model:'3D'})[kind]||'';body.append(label);}
    };
    const pinned=entry=>entry.root.contains(document.activeElement)||entry.root.matches('.clab-dragging')||!!entry.root.querySelector('.clab-custom-select.open,.clab-history-grid,.clab-upload-status');
    const paint=()=>{
        frame=0;if(!enabled||!panel.classList.contains('visible')||dragging||container.hasAttribute('data-clab-opening')||container.hasAttribute('data-clab-card-jump'))return;
        if(mode==='cards')for(const [body,anchor]of positions){if(!body.isConnected||!anchor.root.isConnected){positions.delete(body);continue;}const delta=anchor.root.offsetTop-anchor.offset;if(Math.abs(delta)>.5)body.scrollTop+=delta;}
        const viewport=container.getBoundingClientRect(),cardBounds=new Map(),anchors=new Map(),plan=[];
        for(const entry of entries.values()){
            const root=entry.root,card=root.closest('.clab-card,.clab-table-draft-row');if(!root.isConnected){sizes.unobserve(root);discard(entry);entries.delete(root);continue;}
            if(!wrapper.contains(root))continue;
            if(!card||card.hidden||root.hidden){plan.push([entry,'park']);continue;}
            let box=cardBounds.get(card);if(!box){box=card.getBoundingClientRect();cardBounds.set(card,box);}
            const selected=mode==='xy'&&state.activeCardId===entry.card.id;
            if(pinned(entry)){plan.push([entry,'full']);continue;}
            if(mode!=='cards'&&!intersectsViewport(box,viewport)){if(!root.hasAttribute('data-clab-virtual'))entry.height=root.offsetHeight||entry.height;plan.push([entry,'park']);continue;}
            const areaBox=mode==='xy'?box:root.getBoundingClientRect();
            const scroller=mode==='cards'?card.querySelector('.clab-card-body'):null,body=scroller?scroller.getBoundingClientRect():viewport;
            if(scroller&&!anchors.has(scroller)&&areaBox.bottom>body.top&&areaBox.top<body.bottom)anchors.set(scroller,{root,top:areaBox.top});
            if(!root.matches('[data-clab-virtual],[data-clab-deferred]'))entry.height=root.offsetHeight||entry.height;
            if(mode==='cards'&&!intersectsViewport(areaBox,viewport)&&areaBox.bottom>=body.top-160&&areaBox.top<=body.bottom+160){plan.push([entry,'layout']);continue;}
            plan.push([entry,!intersectsViewport(areaBox,viewport)||!intersectsViewport(areaBox,body)?'park':mode==='xy'&&xyDetailLevel(box.width,1,selected)==='summary'?'summary':'full']);
        }
        // Reattach cache hits before parking the previous view. Otherwise a small
        // media budget can evict the very player/viewer we are about to revisit.
        let restoredModels=false;
        for(const [entry,action]of plan)if(action==='full'&&entry.holder&&!entry.root.hasAttribute('data-clab-pending-refresh')){restoredModels||=!!entry.holder.querySelector('.clab-glb-viewer');mount(entry);}
        if(restoredModels)refreshModelVisibility(wrapper);
        const pending=[];
        for(const [entry,action]of plan){
            if(action==='park')park(entry);
            else if(action==='summary')summary(entry);
            else if(action==='layout'){
                if(entry.root.hasAttribute('data-clab-deferred'))pending.push([entry,action]);
                else if(!entry.root.hasAttribute('data-clab-layout'))park(entry);
            }else if(entry.root.matches('[data-clab-deferred],[data-clab-virtual],[data-clab-summary],[data-clab-layout]'))pending.push([entry,action]);
        }
        const owner=workspace,node=wrapper,currentMode=mode;
        const focus=wrapper.querySelector(`.clab-card[data-card-id="${CSS.escape(config.focusCardId||'')}"]`),focusLeft=focus?parseFloat(focus.style.left):container.scrollLeft+container.clientWidth/2;
        const priority=(entry,action)=>(action==='full'?0:2)+(entry.area.type==='preview'?1:0);
        const distance=entry=>Math.abs((parseFloat(entry.root.closest('.clab-card')?.style.left)||0)-focusLeft);
        pending.sort(([a,actionA],[b,actionB])=>priority(a,actionA)-priority(b,actionB)||distance(a)-distance(b));
        work.replace(pending.map(([entry,action])=>()=>{
            if(owner!==workspace||node!==wrapper||currentMode!==mode||entries.get(entry.root)!==entry||!entry.root.isConnected||!node.contains(entry.root))return;
            const changed=action==='layout'?prepare(entry):mount(entry);
            if(changed){config.settled?.();schedule();}
        }));
        for(const [scroller,anchor]of anchors)if(anchor.root.isConnected){const delta=anchor.root.getBoundingClientRect().top-anchor.top;if(Math.abs(delta)>.5)scroller.scrollTop+=delta;}
        if(mode==='cards'){positions.clear();for(const [body,anchor]of anchors)if(anchor.root.isConnected)positions.set(body,{root:anchor.root,offset:anchor.root.offsetTop});}
        refreshModelVisibility(cache);
    };
    const schedule=()=>{if(enabled&&!frame&&panel.classList.contains('visible')&&!container.hasAttribute('data-clab-card-jump'))frame=requestAnimationFrame(paint);};
    const sizes=new ResizeObserver(records=>{let changed=false;for(const {target}of records){const entry=entries.get(target);if(entry&&mode==='cards'){remember(entry);changed=true;}}if(changed)schedule();});
    const update=(nextMode,options={})=>{
        mode=nextMode;config=options;if(mode!=='cards'){sizes.disconnect();positions.clear();}const next=container.querySelector('.clab-cards-wrapper'),owner=getActiveWorkspace();
        if(next!==wrapper||owner!==workspace){work.clear();for(const entry of entries.values()){sizes.unobserve(entry.root);discard(entry);}entries.clear();positions.clear();wrapper=next;workspace=owner;}
        const wasVirtual=container.hasAttribute('data-clab-virtualized');enabled=!!wrapper&&(container.hasAttribute('data-clab-progressive')||container.hasAttribute('data-clab-card-jump')||virtualizeTasks(state.cards)||(options.count||0)>=160);container.toggleAttribute('data-clab-virtualized',enabled);if(!wrapper)return;
        if(enabled)wrapper.dataset.clabVirtualized=mode;
        const data=new Map((options.cards||state.cards).flatMap(card=>card.areas.map(area=>[area.id,{card,area}])));
        for(const root of wrapper.querySelectorAll('.clab-area,.clab-table-draft-cell')){
            const item=data.get(root.dataset.areaId);if(!item)continue;let entry=entries.get(root);
            if(!entry||entry.area!==item.area){if(entry)discard(entry);entry={root,...item,height:estimatedModuleHeight(item.area,root.offsetWidth||320)};entries.set(root,entry);if(enabled&&mode==='cards')sizes.observe(root);}
            if(entry.card!==item.card)root.dataset.clabPendingRefresh='';entry.card=item.card;
            if(mode==='cards'){const width=root.offsetWidth,measured=dimensions.get(item.area),valid=sameLayout(measured?.key,layoutSignature(item.area,width));if(valid)entry.height=measured.height;else if(root.matches('[data-clab-deferred],[data-clab-virtual]')){entry.height=estimatedModuleHeight(item.area,width);if(entry.holder){discard(entry);delete root.dataset.clabVirtual;root.dataset.clabDeferred='';}}}
            if(root.hasAttribute('data-clab-deferred'))root.style.setProperty('--clab-virtual-height',`${entry.height}px`);
        }
        if(!enabled){
            work.clear();
            let changed=false;
            for(const entry of entries.values()){
                if(entry.root.matches('[data-clab-virtual],[data-clab-layout]')&&entry.root.isConnected&&!entry.root.hidden&&!entry.root.closest('.clab-card[hidden]'))changed=mount(entry)||changed;
                else{discard(entry);if(entry.root.hasAttribute('data-clab-layout')){entry.root.replaceChildren();delete entry.root.dataset.clabLayout;entry.root.dataset.clabDeferred='';}if(entry.root.hasAttribute('data-clab-virtual')){delete entry.root.dataset.clabVirtual;entry.root.dataset.clabDeferred='';}}
            }
            if(changed)config.settled?.();sizes.disconnect();positions.clear();entries.clear();delete wrapper.dataset.clabVirtualized;
            if(wasVirtual)document.dispatchEvent(new CustomEvent('clab_workspace_view_change'));return;
        }
        paint();
    };
    container.addEventListener('scroll',schedule,true);container.addEventListener('clab_viewport_change',schedule);
    container.addEventListener('clab_panel_closed',()=>{work.clear();cancelAnimationFrame(frame);frame=0;});
    container.addEventListener('clab_navigation_start',()=>{work.clear();cancelAnimationFrame(frame);frame=0;});
    document.addEventListener('clab_cache_limits_change',()=>{trimCaches();refreshModelVisibility(cache);});
    container.addEventListener('clab_ensure_component',event=>{if(enabled){const entry=entries.get(event.target.closest('.clab-area,.clab-table-draft-cell'));if(entry&&mount(entry))config.settled?.();schedule();}},true);
    container.addEventListener('pointerdown',event=>{if(!enabled)return;const root=event.target.closest('[data-clab-deferred],[data-clab-virtual]');if(root&&!root.hasAttribute('data-clab-summary')){const entry=entries.get(root);if(entry&&mount(entry))config.settled?.();schedule();}},true);
    container.addEventListener('focusin',event=>{if(!enabled)return;const entry=entries.get(event.target.closest('.clab-area,.clab-table-draft-cell'));if(entry)mount(entry);schedule();},true);
    container.addEventListener('pointerup',schedule,true);container.addEventListener('dragstart',()=>dragging=true,true);window.addEventListener('dragend',()=>{dragging=false;schedule();},true);
    new ResizeObserver(schedule).observe(container);
    const api={update,schedule,parkCard(card){let reusable=false;for(const root of card.querySelectorAll('.clab-area')){const entry=entries.get(root);if(!entry)continue;reusable||=!!entry.holder||!root.matches('[data-clab-deferred],[data-clab-virtual],[data-clab-layout],[data-clab-summary]');park(entry);}refreshModelVisibility(cache);return reusable;},releaseCard(card){for(const root of card.querySelectorAll('.clab-area,.clab-table-draft-cell')){const entry=entries.get(root);if(!entry)continue;if(!root.matches('[data-clab-virtual],[data-clab-deferred],[data-clab-layout]')){remember(entry);saved.set(entry.area,snapshot(entry));}else remember(entry);root.querySelectorAll('video,audio').forEach(media=>media.pause());sizes.unobserve(root);discard(entry);entries.delete(root);}},restoreCached(){if(mode!=='table')return;for(const entry of [...parked.values()]){entry.root.querySelector('.clab-virtual-summary')?.remove();while(entry.holder?.firstChild)moveModuleDOM(entry.root,entry.holder.firstChild);discard(entry);delete entry.root.dataset.clabVirtual;delete entry.root.dataset.clabSummary;}},ensure:root=>{const entry=entries.get(root);return entry&&mount(entry);}};controllers.set(container,api);return api;
}
