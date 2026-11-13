import { paintWorkspaceHighlights } from '../../workspace_tab_highlight.js';
import { state } from '../../ui_state.js';
import { getWorkspaceLabel } from '../../comp_workspace.js';
import { escapeHtml as esc } from './shared.js';

export function createPreviewSourcePicker(root,getIds,change) {
    const button=root.querySelector('[data-preview-add-sources]');
    let popup,anchor='';
    function paint(){
        const ids=getIds(),tabs=[...root.querySelectorAll('[data-review-workspaces] [data-workspace-id]')];
        tabs.forEach((tab,index)=>{
            const selected=ids.size>1&&ids.has(tab.dataset.workspaceId);
            tab.classList.toggle('is-preview-source',selected);
            tab.classList.toggle('source-previous',selected&&ids.has(tabs[index-1]?.dataset.workspaceId));
            tab.classList.toggle('source-next',selected&&ids.has(tabs[index+1]?.dataset.workspaceId));
        });
        paintWorkspaceHighlights(root.querySelector('[data-review-workspaces]'),[...ids]);
        button.title=`增加预览来源 · 已选 ${ids.size} 个工作区（也可 Ctrl/Cmd 加选、Shift 连选标签）`;
        button.querySelector('span').textContent=ids.size>1?`预览来源 · ${ids.size}`:'增加预览来源';
    }
    function toggle(id,on){const ids=new Set(getIds());on?ids.add(id):ids.delete(id);if(!ids.size)return false;change([...ids]);paint();return true;}
    button.onclick=()=>{
        if(popup?.matches(':popover-open')){popup.hidePopover();return;}
        popup?.remove();popup=document.createElement('div');popup.className='clab-preview-source-picker';popup.setAttribute('popover','auto');
        popup.innerHTML=`<h3>增加预览来源</h3>${state.workspaces.map(workspace=>`<label><input type="checkbox" value="${esc(workspace.id)}"${getIds().has(workspace.id)?' checked':''}><span>${esc(getWorkspaceLabel(workspace))}</span></label>`).join('')}`;
        root.append(popup);popup.onchange=event=>{if(!toggle(event.target.value,event.target.checked))event.target.checked=true;};
        popup.showPopover();const rect=button.getBoundingClientRect();popup.style.left=`${Math.max(8,Math.min(rect.left,innerWidth-popup.offsetWidth-8))}px`;popup.style.top=`${Math.min(rect.bottom+6,innerHeight-popup.offsetHeight-8)}px`;
    };
    return {paint,close(){popup?.hidePopover();},select(event,id){
        if(!event.ctrlKey&&!event.metaKey&&!event.shiftKey){anchor=id;return false;}
        if(event.shiftKey){
            const start=state.workspaces.findIndex(workspace=>workspace.id===(anchor||state.activeWorkspaceId)),end=state.workspaces.findIndex(workspace=>workspace.id===id);
            const ids=new Set(getIds());state.workspaces.slice(Math.min(start,end),Math.max(start,end)+1).forEach(workspace=>ids.add(workspace.id));change([...ids]);paint();
        }else toggle(id,!getIds().has(id));
        anchor=id;return true;
    }};
}
