import { matrixInputSignature } from './workspace_modes/xy_archive.js';

export function prepareWorkspaceCopy(workspace) {
    const hasMedia=card=>card.areas.some(area=>area.type==='preview'&&(area.history?.length||area.resultUrl||area.textContent||area.textHistory?.some(text=>text!=null)));
    // A copied submission has no queue of its own and will never receive that result.
    const discarded=new Set((workspace.archivedTasks||[]).filter(card=>!hasMedia(card)&&card.historyRunSequence>0&&card.xyInitialInput===matrixInputSignature(card)).map(card=>card.id));
    workspace.archivedTasks=(workspace.archivedTasks||[]).filter(card=>!discarded.has(card.id));
    const xy=workspace.view?.xy,ids=new Set(xy?.taskIds||[]);
    if(xy)xy.taskIds=xy.taskIds.filter(id=>!discarded.has(id));
    for(const card of [...workspace.cards,...workspace.archivedTasks]){
        delete card.historyRunSequence;
        if(ids.has(card.id)&&!hasMedia(card))card.xyInitialInput=matrixInputSignature(card);
    }
    return workspace;
}
