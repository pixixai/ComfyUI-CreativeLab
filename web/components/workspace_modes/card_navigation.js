import { state,getActiveWorkspace } from '../ui_state.js';
import { workspacePreferences } from '../workspace_preferences.js';
import { cardNavigationPlan } from './card_navigation_plan.js';

export function createCardNavigation(container,{prepare,settle}){
    const panel=container.closest('#clab-panel');let frame=0,prepareFrame=0,destination=null,release;
    const stop=(refresh=true)=>{
        const moving=!!destination;cancelAnimationFrame(frame);cancelAnimationFrame(prepareFrame);frame=prepareFrame=0;
        destination=null;delete container.dataset.clabCardJump;delete container.dataset.clabCardJumpStage;release?.();release=null;
        if(moving&&refresh&&panel.classList.contains('visible')&&getActiveWorkspace()?.view.mode==='cards')settle();
    };
    const jump=cardId=>{
        stop(false);container.dispatchEvent(new Event('clab_scroll_jump'));
        const index=state.cards.findIndex(card=>card.id===cardId);if(index<0)return;
        const width=parseFloat(getComputedStyle(panel).getPropertyValue('--clab-card-width'))||workspacePreferences.cardWidth,stride=width+workspacePreferences.cardGap;
        const left=Math.max(0,Math.min(container.scrollWidth-container.clientWidth,index*stride-(container.clientWidth-width)/2+(parseFloat(getComputedStyle(container).paddingLeft)||0)));
        const plan=cardNavigationPlan(container.scrollLeft,left,stride,container.clientWidth);
        const target=destination={cardId,index,left,workspace:getActiveWorkspace(),plan};
        container.dataset.clabCardJump=cardId;container.dataset.clabCardJumpStage=plan.kind==='near'?'near':'out';
        container.dispatchEvent(new Event('clab_navigation_start'));
        let segment=0,elapsed=0,last=0,prepared=false;
        const tick=now=>{
            frame=0;if(destination!==target)return;
            if(!panel.classList.contains('visible')||target.workspace!==getActiveWorkspace()||target.workspace.view.mode!=='cards'){stop(false);return;}
            if(state.cards[target.index]?.id!==target.cardId){stop();return;}
            elapsed+=last?Math.max(1,Math.min(32,now-last)):16;last=now;
            const part=plan.segments[segment],fraction=part.duration?Math.min(1,elapsed/part.duration):1,eased=fraction*fraction*(3-2*fraction);
            container.scrollLeft=part.from+(part.to-part.from)*eased;
            if(!prepared){prepared=true;prepareFrame=requestAnimationFrame(()=>{prepareFrame=0;if(destination===target)release=prepare();});}
            if(fraction===1){
                if(++segment<plan.segments.length){elapsed=last=0;container.dataset.clabCardJumpStage='arrival';container.scrollLeft=plan.segments[segment].from;}
                else{container.dataset.clabCardJumpStage='settle';frame=requestAnimationFrame(()=>{if(destination===target){const completedPrefetch=release;release=null;stop(false);settle();setTimeout(()=>completedPrefetch?.(),1000);}});return;}
            }
            frame=requestAnimationFrame(tick);
        };
        frame=requestAnimationFrame(tick);
    };
    container.addEventListener('wheel',()=>stop(),{capture:true,passive:true});
    container.addEventListener('pointerdown',()=>stop(),true);
    container.addEventListener('clab_scroll_jump',()=>stop());
    container.addEventListener('clab_panel_closed',()=>stop(false));
    return {jump,stop,get destination(){return destination;}};
}
