import { workspaceModeLabels } from './workspace_modes/mode_policy.js';

export function createWorkspaceMenu(strip,onCreate) {
    const menu=document.createElement('div');
    menu.className='clab-mode-menu clab-workspace-create-menu';menu.hidden=true;
    menu.setAttribute('role','menu');menu.setAttribute('aria-label','新建工作区');
    menu.innerHTML=Object.entries(workspaceModeLabels).map(([mode,label])=>`<button type="button" role="menuitem" data-create-workspace="${mode}">${label}</button>`).join('');
    strip.append(menu);
    let anchor,afterId;
    const close=()=>{menu.hidden=true;anchor?.setAttribute('aria-expanded','false');anchor=null;};
    const open=(target,insertAfterId=null)=>{
        if(anchor===target&&!menu.hidden){close();return;}
        close();anchor=target;afterId=insertAfterId;anchor.setAttribute('aria-expanded','true');menu.hidden=false;
        const rect=strip.getBoundingClientRect(),position=target.getBoundingClientRect();
        const left=(position.left-rect.left)*strip.offsetWidth/rect.width;
        menu.style.left=Math.max(4,Math.min(left,strip.clientWidth-menu.offsetWidth-4))+'px';
        menu.querySelector('button').focus({preventScroll:true});
    };
    menu.addEventListener('click',event=>{
        const button=event.target.closest('[data-create-workspace]');if(!button)return;
        const id=afterId;close();onCreate(button.dataset.createWorkspace,id);
    });
    const closeOutside=event=>{if(anchor&&!anchor.contains(event.target)&&!menu.contains(event.target))close();};
    for(const type of ['pointerdown','mousedown','click'])window.addEventListener(type,closeOutside,true);
    strip.querySelector('.clab-workspace-tabs').addEventListener('scroll',close);
    strip.addEventListener('keydown',event=>{
        if(!anchor)return;
        if(event.key==='Escape'){const target=anchor;close();target.focus({preventScroll:true});event.stopPropagation();}
        else if(menu.contains(event.target)&&['ArrowUp','ArrowDown'].includes(event.key)){
            event.preventDefault();const buttons=[...menu.querySelectorAll('button')],at=buttons.indexOf(document.activeElement),step=event.key==='ArrowUp'?-1:1;
            buttons[(at+step+buttons.length)%buttons.length].focus({preventScroll:true});
        }
    });
    return {open,close};
}
