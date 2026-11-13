import { taskCoordinates, axisTuple, parameterValue, valueKey } from './task_model.js';

const settings=['type','title','value','targetWidgets','targetNodeId','targetWidget','autoHeight','ratio','width','height','matchMedia','fillMode','dataType'];
export const matrixInputSignature = card => JSON.stringify([card.title,card.areas.map(area=>settings.map(key=>area[key]))]);
const matches = (card,xy) => Object.values(taskCoordinates(card,xy)).every(index=>index>=0);
function detachRows(card,table){
    const entries=[];
    for(const sheet of table?.sheets||[]){
        sheet.rows.forEach((row,index)=>{if(row.cardId===card.id)entries.push({sheetId:sheet.id,row,index});});
        sheet.rows=sheet.rows.filter(row=>row.cardId!==card.id);
    }
    if(entries.length)card.xyTableRows=entries;
}
function restoreRows(card,table){
    for(const entry of card.xyTableRows||[]){
        const sheet=table?.sheets.find(sheet=>sheet.id===entry.sheetId);
        if(sheet&&!sheet.rows.some(row=>row.cardId===card.id))sheet.rows.splice(Math.min(entry.index,sheet.rows.length),0,entry.row);
    }
    delete card.xyTableRows;
}
function insertTask(cards,card){
    if(!cards.some(item=>item.id===card.id))cards.splice(Number.isInteger(card.xyArchiveIndex)?Math.min(card.xyArchiveIndex,cards.length):cards.length,0,card);
    delete card.xyArchiveIndex;
}

// Only tasks owned by this matrix can leave the active workspace.
export function reconcileMatrixArchive(cards,xy,archived,table) {
    if(!xy.initialized||!xy.x.bindings.length||!xy.y.bindings.length)return {archived:0,removed:0};
    const ids=new Set(xy.taskIds),counts={archived:0,removed:0};
    for(let index=cards.length-1;index>=0;index--){
        const card=cards[index];if(!ids.has(card.id)||matches(card,xy))continue;
        cards.splice(index,1);card.xyArchiveIndex=index;detachRows(card,table);
        const history=card.areas.some(area=>area.type==='preview'&&(area.history?.length||area.resultUrl||area.textContent));
        if(history||card.historyRunSequence>0||card.xyInitialInput!==matrixInputSignature(card)){
            if(!archived.some(item=>item.id===card.id))archived.unshift(card);
            counts.archived++;
        }else{ids.delete(card.id);counts.removed++;}
    }
    for(let index=archived.length-1;index>=0;index--){
        const card=archived[index];if(!ids.has(card.id)||!matches(card,xy))continue;
        insertTask(cards,card);restoreRows(card,table);
        archived.splice(index,1);
    }
    xy.taskIds=xy.taskIds.filter(id=>ids.has(id));
    return counts;
}

export function restoreArchivedTasks(workspace,ids) {
    const restored=workspace.archivedTasks.filter(card=>ids.has(card.id));
    for(const card of restored){
        if(workspace.view.mode==='xy')for(const name of ['x','y',...(workspace.view.xy.z.enabled?['z']:[])]){
            const axis=workspace.view.xy[name],tuple=axis.bindings.map(key=>parameterValue(card,key));
            if(tuple.some(value=>value===undefined)||!tuple.length)continue;
            const value=tuple.length===1?tuple[0]:tuple;
            if(!axis.values.some(entry=>valueKey(axisTuple(axis,entry))===valueKey(tuple)))axis.values.push(value);
            delete axis.inputText;
        }
        insertTask(workspace.cards,card);restoreRows(card,workspace.view.table);
    }
    if(workspace.view.mode!=='xy')workspace.view.xy.taskIds=workspace.view.xy.taskIds.filter(id=>!ids.has(id));
    workspace.archivedTasks=workspace.archivedTasks.filter(card=>!ids.has(card.id));
    return restored.length;
}
