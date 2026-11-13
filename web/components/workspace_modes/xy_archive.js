import { taskCoordinates, axisTuple, parameterValue, valueKey } from './task_model.js';
import { detachTaskRows,restoreTaskRows,insertArchivedTask,hasTaskResults } from './task_archive.js';

const settings=['type','title','value','targetWidgets','targetNodeId','targetWidget','autoHeight','ratio','width','height','matchMedia','fillMode','dataType'];
export const matrixInputSignature = card => JSON.stringify([card.title,card.areas.map(area=>settings.map(key=>area[key]))]);
export const matrixBindings=xy=>JSON.stringify(['x','y',...(xy.z.enabled?['z']:[])].flatMap(name=>xy[name].bindings).sort());
const bindingMatches=(card,xy)=>(!card.xyArchiveBindings||card.xyArchiveBindings===matrixBindings(xy))&&(!Object.hasOwn(card,'xyArchiveOutput')||card.xyArchiveOutput===String(xy.outputNodeId||''))&&(!xy.outputNodeId||card.areas.some(area=>area.type==='preview'&&String(area.targetNodeId)===xy.outputNodeId));
const matches = (card,xy) => bindingMatches(card,xy)&&Object.values(taskCoordinates(card,xy)).every(index=>index>=0);

// Only tasks owned by this matrix can leave the active workspace.
export function reconcileMatrixArchive(cards,xy,archived,table) {
    if(!xy.initialized||!xy.x.bindings.length||!xy.y.bindings.length)return {archived:0,removed:0};
    const ids=new Set(xy.taskIds),counts={archived:0,removed:0};
    for(let index=cards.length-1;index>=0;index--){
        const card=cards[index];if(!ids.has(card.id)||matches(card,xy))continue;
        cards.splice(index,1);card.xyArchiveIndex=index;detachTaskRows(card,table);
        if(hasTaskResults(card)||card.xyInitialInput!==matrixInputSignature(card)){
            if(!archived.some(item=>item.id===card.id))archived.unshift(card);
            counts.archived++;
        }else{ids.delete(card.id);counts.removed++;}
    }
    const restored=[];
    for(let index=archived.length-1;index>=0;index--){
        const card=archived[index];if(!ids.has(card.id)||!matches(card,xy))continue;
        const coordinate=JSON.stringify(taskCoordinates(card,xy));
        const occupied=cards.filter(other=>ids.has(other.id)&&matches(other,xy)&&JSON.stringify(taskCoordinates(other,xy))===coordinate);
        if(occupied.some(other=>hasTaskResults(other)||other.xyInitialInput!==matrixInputSignature(other)))continue;
        for(const empty of occupied){cards.splice(cards.indexOf(empty),1);detachTaskRows(empty,table);ids.delete(empty.id);}
        insertArchivedTask(cards,card);restored.push(card);
        archived.splice(index,1);
    }
    restoreTaskRows(restored,table);
    xy.taskIds=xy.taskIds.filter(id=>ids.has(id));
    return counts;
}

export function restoreArchivedTasks(workspace,ids) {
    const restored=workspace.archivedTasks.filter(card=>ids.has(card.id)).sort((a,b)=>(a.xyArchiveIndex??Infinity)-(b.xyArchiveIndex??Infinity));
    if(workspace.view.mode==='xy'&&restored.some(card=>!bindingMatches(card,workspace.view.xy)))throw new Error('归档任务的绑定与当前矩阵不同，请切换到任务卡片模式后恢复。');
    for(const card of restored){
        if(workspace.view.mode==='xy'&&!workspace.view.xy.taskIds.includes(card.id))workspace.view.xy.taskIds.push(card.id);
        if(workspace.view.mode==='xy')for(const name of ['x','y',...(workspace.view.xy.z.enabled?['z']:[])]){
            const axis=workspace.view.xy[name],tuple=axis.bindings.map(key=>parameterValue(card,key));
            if(tuple.some(value=>value===undefined)||!tuple.length)continue;
            const value=tuple.length===1?tuple[0]:tuple;
            if(!axis.values.some(entry=>valueKey(axisTuple(axis,entry))===valueKey(tuple)))axis.values.push(value);
            delete axis.inputText;
        }
        insertArchivedTask(workspace.cards,card);
    }
    restoreTaskRows(restored,workspace.view.table);
    if(workspace.view.mode!=='xy')workspace.view.xy.taskIds=workspace.view.xy.taskIds.filter(id=>!ids.has(id));
    workspace.archivedTasks=workspace.archivedTasks.filter(card=>!ids.has(card.id));
    return restored.length;
}
