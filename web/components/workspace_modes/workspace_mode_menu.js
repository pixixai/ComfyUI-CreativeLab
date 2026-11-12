import { state } from '../ui_state.js';

export function attachWorkspaceModeMenu(strip,onSelect) {
    const menu=strip.querySelector('.clab-mode-menu'),buttons=[...menu.querySelectorAll('[data-workspace-mode]')];
    let anchor;
    const close=()=>{menu.hidden=true;anchor?.setAttribute('aria-expanded','false');anchor=null;};
    strip.addEventListener('click',event=>{
        const target=event.target.closest('button');if(!target)return;
        if(target.matches('[data-mode-toggle]')){
            if(anchor===target){close();return;}close();
            const workspace=state.workspaces.find(item=>item.id===target.closest('[data-workspace-id]').dataset.workspaceId);if(!workspace)return;
            const checked=buttons.find(button=>button.dataset.workspaceMode===workspace.view?.mode)||buttons[0];
            buttons.forEach(button=>button.setAttribute('aria-checked',String(button===checked)));
            anchor=target;anchor.setAttribute('aria-expanded','true');menu.hidden=false;
            const rect=strip.getBoundingClientRect(),left=(target.getBoundingClientRect().left-rect.left)*strip.offsetWidth/rect.width;
            menu.style.left=Math.max(4,Math.min(left,strip.clientWidth-menu.offsetWidth-4))+'px';checked.focus({preventScroll:true});return;
        }
        if(anchor&&menu.contains(target)){
            const trigger=anchor,id=trigger.closest('[data-workspace-id]').dataset.workspaceId;close();onSelect(target.dataset.workspaceMode,id);
            if(trigger.isConnected)trigger.focus({preventScroll:true});
        }
    });
    document.addEventListener('pointerdown',event=>{if(anchor&&!anchor.contains(event.target)&&!menu.contains(event.target))close();},true);
    strip.querySelector('.clab-workspace-tabs').addEventListener('scroll',close);
    strip.addEventListener('keydown',event=>{
        if(!anchor)return;
        if(event.key==='Escape'){const trigger=anchor;close();trigger.focus({preventScroll:true});event.stopPropagation();}
        else if(menu.contains(event.target)&&['ArrowUp','ArrowDown'].includes(event.key)){
            event.preventDefault();const at=buttons.indexOf(document.activeElement),step=event.key==='ArrowUp'?-1:1;buttons[(at+step+buttons.length)%buttons.length].focus({preventScroll:true});
        }
    });
    return {close};
}
