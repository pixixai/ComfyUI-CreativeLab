import { state,getActiveWorkspace,syncStateToActiveWorkspace } from '../ui_state.js';
import { getWorkspaceLabel } from '../comp_workspace.js';
import { cleanDeadRecords,resyncRecords } from './action_record_maintenance.js';
import { restoreArchivedTasks } from '../workspace_modes/xy_archive.js';
import { matrixAxisNames } from '../workspace_modes/xy_model.js';
import { escapeHtml as esc } from '../contextmenu/content/shared.js';

export const maintenanceIcon='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0"/></svg>';
let maintenancePanel,opener,dismissOnClick;
// Native light-dismiss can close the popover before its opener's click is delivered.
window.addEventListener('pointerdown',event=>{dismissOnClick=maintenancePanel?.matches(':popover-open')&&opener?.contains(event.target)?opener:null;},true);
export const closeMaintenancePanel=()=>maintenancePanel?.hidePopover();
export function openMaintenancePanel(trigger,onChange=()=>{}) {
    if(dismissOnClick===trigger){dismissOnClick=null;maintenancePanel?.hidePopover();return;}
    if(maintenancePanel?.matches(':popover-open')&&opener===trigger){maintenancePanel.hidePopover();return;}
    const box=trigger.getBoundingClientRect();maintenancePanel?.remove();opener=trigger;
    const workspace=syncStateToActiveWorkspace()||getActiveWorkspace(),selected=new Set();
    const panel=document.createElement('div');maintenancePanel=panel;panel.className='clab-maintenance-panel';panel.setAttribute('popover','auto');panel.setAttribute('role','dialog');panel.setAttribute('aria-label','数据维护');
    panel.innerHTML=`<header><strong>数据维护</strong><button type="button" data-maint-close aria-label="关闭">×</button></header><p>${esc(getWorkspaceLabel(workspace))} · 当前工作区</p>
        <div class="clab-maint-actions"><button type="button" id="clab-maint-clean-dead" title="移除文件已不存在的记录，保留有效记录">清理失效记录</button><button type="button" id="clab-maint-resync" title="刷新已有记录的媒体缓存，重新加载内容">重新同步记录</button></div>
        <section><h3>已归档任务 · <span data-maint-count></span></h3><div class="clab-maint-list"></div><footer><button type="button" data-maint-all>全选</button><button type="button" data-maint-restore>恢复所选</button><button type="button" data-maint-delete>删除所选</button></footer></section><p role="status"></p>`;
    document.body.append(panel);
    const status=panel.querySelector('[role=status]');
    const render=()=>{
        panel.querySelector('[data-maint-count]').textContent=workspace.archivedTasks.length;
        panel.querySelector('.clab-maint-list').innerHTML=workspace.archivedTasks.map(card=>{
            const output=card.areas.find(area=>area.type==='preview'),url=output?.resultUrl||output?.history?.at(-1)||'';
            const values=card.areas.filter(area=>area.type==='edit').map(area=>`${area.title||area.targetWidget}：${typeof area.value==='object'?JSON.stringify(area.value):area.value}`).join(' · ');
            return `<label><input type="checkbox" value="${esc(card.id)}"${selected.has(card.id)?' checked':''}><span class="clab-maint-thumb">${url&&/\.(png|jpe?g|webp|gif|avif)(?:[?&#]|$)/i.test(url)?`<img loading="lazy" src="${esc(url)}">`:'记录'}</span><span><b>${esc(card.title||'未命名任务')}</b><small title="${esc(values)}">${esc(values)}</small><small>${card.areas.reduce((n,area)=>n+(area.type==='preview'?(area.history?.length||0):0),0)} 条生成记录</small></span></label>`;
        }).join('')||'<p>暂无归档任务</p>';
        panel.querySelectorAll('[data-maint-restore],[data-maint-delete]').forEach(button=>button.disabled=!selected.size);
        panel.querySelector('[data-maint-all]').disabled=!workspace.archivedTasks.length;
    };
    const persist=()=>{
        window.CLab?.saveState(state,{createAnchor:false});
        document.dispatchEvent(new Event('clab_render_ui'));onChange();render();
    };
    panel.onchange=event=>{if(event.target.matches('input[type=checkbox]')){event.target.checked?selected.add(event.target.value):selected.delete(event.target.value);render();}};
    panel.onclick=async event=>{
        const button=event.target.closest('button');if(!button)return;
        if(button.matches('[data-maint-close]')){panel.hidePopover();return;}
        if(button.matches('[data-maint-all]')){if(selected.size===workspace.archivedTasks.length)selected.clear();else workspace.archivedTasks.forEach(card=>selected.add(card.id));render();return;}
        if(button.matches('[data-maint-delete]')){
            if(!confirm(`删除所选 ${selected.size} 个归档任务及历史引用？磁盘上的媒体文件会保留。`))return;
            const removed=new Set(workspace.archivedTasks.filter(card=>selected.has(card.id)).map(card=>card.id));
            workspace.archivedTasks=workspace.archivedTasks.filter(card=>!removed.has(card.id));workspace.view.xy.taskIds=workspace.view.xy.taskIds.filter(id=>!removed.has(id));selected.clear();persist();return;
        }
        if(button.matches('[data-maint-restore]')){
            if(workspace.view.mode==='xy'){
                const clone=structuredClone(workspace);restoreArchivedTasks(clone,selected);
                const count=xy=>matrixAxisNames(xy).reduce((n,name)=>n*xy[name].values.length,1);
                const extra=count(clone.view.xy)-count(workspace.view.xy);
                if(extra>selected.size&&!confirm(`恢复会补回轴取值，矩阵将增加 ${extra} 个参数组合。是否继续？`))return;
            }
            restoreArchivedTasks(workspace,selected);selected.clear();persist();return;
        }
        if(button.id==='clab-maint-clean-dead'||button.id==='clab-maint-resync'){
            panel.querySelectorAll('.clab-maint-actions button').forEach(item=>item.disabled=true);status.textContent='正在处理…';
            try{await(button.id==='clab-maint-clean-dead'?cleanDeadRecords:resyncRecords)(workspace.cards);status.textContent='处理完成。';onChange();render();}
            catch(error){status.textContent=`处理失败：${error.message}`;}
            finally{panel.querySelectorAll('.clab-maint-actions button').forEach(item=>item.disabled=false);}
        }
    };
    if(!document.getElementById('clab-maintenance-style')){
        const style=document.createElement('style');style.id='clab-maintenance-style';style.textContent=`
        .clab-maintenance-panel{box-sizing:border-box;margin:0;padding:14px;width:420px;max-width:calc(100vw - 16px);max-height:calc(100vh - 16px);overflow:auto;background:#242424;color:#bbb;border:1px solid #444;font:12px/1.5 sans-serif;box-shadow:0 6px 22px #0005}
        .clab-maintenance-panel header,.clab-maintenance-panel footer,.clab-maint-actions{display:flex;align-items:center;gap:8px}.clab-maintenance-panel header{justify-content:space-between}.clab-maintenance-panel h3{font-size:13px}.clab-maintenance-panel section{margin-top:14px;padding-top:8px;border-top:1px solid #ffffff12}.clab-maintenance-panel button{background:#303030;color:#bbb;border:0;border-radius:3px;padding:7px 10px;cursor:pointer}.clab-maintenance-panel button:hover{background:#393939;color:#fff}.clab-maintenance-panel button:disabled{opacity:.35;cursor:default}.clab-maint-list{max-height:320px;overflow:auto;scrollbar-width:thin}.clab-maint-list label{display:flex;align-items:center;gap:8px;padding:8px 0;cursor:pointer}.clab-maint-list label>span:last-child{min-width:0;flex:1}.clab-maint-list small{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#999}.clab-maint-thumb{display:grid;place-items:center;width:48px;height:40px;flex:none;background:#191919}.clab-maint-thumb img{width:100%;height:100%;object-fit:contain}.clab-maintenance-panel footer{margin-top:10px}
        `;document.head.append(style);
    }
    panel.addEventListener('toggle',event=>{if(maintenancePanel===panel)trigger.setAttribute('aria-expanded',String(event.newState==='open'));});
    render();panel.showPopover({source:trigger});trigger.setAttribute('aria-expanded','true');
    panel.style.left=`${Math.max(8,Math.min(box.right-panel.offsetWidth,innerWidth-panel.offsetWidth-8))}px`;panel.style.top=`${Math.max(8,box.bottom+panel.offsetHeight+8>innerHeight?box.top-panel.offsetHeight-6:box.bottom+6)}px`;
}
