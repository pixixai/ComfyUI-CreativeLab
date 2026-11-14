import { api } from '../../../../scripts/api.js';
import { state,getActiveWorkspace } from '../ui_state.js';
import { cardWindow } from './card_window.js';
import { workspaceViewport } from './viewport_components.js';
import { revealDelta } from './viewport_geometry.js';

export function attachWorkspaceFollow(container,xyController){
    const panel=container.closest('#clab-panel'),sessions=new Map();let finishTimer;
    const visible=()=>panel.classList.contains('visible');
    const remember=()=>{
        const workspace=getActiveWorkspace(),xy=workspace.view.xy;if(workspace.view.mode!=='xy'||sessions.has(workspace))return;
        sessions.set(workspace,{xy,current:xy.z.current,display:xy.z.display,panX:xy.panX,panY:xy.panY,zoom:xy.zoom});
    };
    document.addEventListener('clab_execution_start',event=>{if(visible()&&event.detail.tasks?.some(task=>state.cards.some(card=>card.id===task.cardId)))remember();});
    document.addEventListener('clab_task_activity',event=>{
        if(!visible()||event.detail.workspaceId!==state.activeWorkspaceId)return;
        const running=window.CLab?.getRunningCardProgress?.(state.activeWorkspaceId)||[],id=running.find(task=>task.cardId===event.detail.cardId)?.cardId;if(!id)return;
        const workspace=getActiveWorkspace();
        if(workspace.view.mode==='cards'){cardWindow(container).reveal(id);return;}
        if(workspace.view.mode==='xy'){remember();xyController.follow(id);return;}
        const row=container.querySelector(`.clab-card[data-table-row="${CSS.escape(id)}"]:not([hidden])`);if(!row)return;
        const view=container.getBoundingClientRect(),box=row.getBoundingClientRect(),head=container.querySelector('.clab-table-head')?.getBoundingClientRect();
        container.scrollTop-=revealDelta(box.top,box.bottom,Math.max(view.top,head?.bottom||view.top)+4,view.bottom-8);workspaceViewport(container).schedule();
    });
    const finish=()=>{
        finishTimer=null;
        for(const [workspace,saved]of sessions){
            if(window.CLab?.hasExecutionWork?.(workspace.id)||(window.CLab?.getRunningCardProgress?.(workspace.id)||[]).length)continue;
            sessions.delete(workspace);if(!state.workspaces.includes(workspace)||workspace.view.xy!==saved.xy)continue;
            Object.assign(saved.xy,{panX:saved.panX,panY:saved.panY,zoom:saved.zoom});saved.xy.z.current=Math.max(0,Math.min(saved.current,Math.max(0,saved.xy.z.values.length-1)));saved.xy.z.display=saved.display;
            if(workspace.id===state.activeWorkspaceId&&workspace.view.mode==='xy')xyController.render();
            window.CLab?.scheduleViewSave({workspaceIds:[workspace.id]});
        }
    };
    document.addEventListener('clab_execution_idle',finish);
    api.addEventListener('status',event=>{if(event.detail?.exec_info?.queue_remaining===0){clearTimeout(finishTimer);finishTimer=setTimeout(finish,200);}else if(event.detail?.exec_info?.queue_remaining>0){clearTimeout(finishTimer);finishTimer=null;}});
}
