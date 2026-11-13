import { hasTaskResults, detachTaskRows } from './workspace_modes/task_archive.js';

// A content step can remove a task created before its asynchronous result arrived.
export function preserveHistoryTasks(workspace,cards,matrixIds,bindings) {
    const active=new Set(workspace.cards.map(card=>card.id));
    workspace.archivedTasks=(workspace.archivedTasks||[]).filter(card=>!active.has(card.id));
    const archived=new Set(workspace.archivedTasks.map(card=>card.id));
    for(const card of workspace.cards){delete card.xyArchiveBindings;delete card.xyArchiveOutput;}
    cards.forEach((card,index)=>{
        if(active.has(card.id)||archived.has(card.id)||!hasTaskResults(card))return;
        card.xyArchiveIndex=index;detachTaskRows(card,workspace.view?.table);
        workspace.archivedTasks.push(card);archived.add(card.id);
        if(matrixIds.includes(card.id)){
            card.xyArchiveBindings=bindings;
            card.xyArchiveOutput=String((card.areas.find(area=>area.id===card.xyOutputId)||card.areas.find(area=>area.type==='preview'))?.targetNodeId||'');
            if(!workspace.view.xy.taskIds.includes(card.id))workspace.view.xy.taskIds.push(card.id);
        }
    });
}
