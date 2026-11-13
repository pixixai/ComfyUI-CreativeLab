export const hasTaskResults=card=>card.historyRunSequence>0||card.areas.some(area=>area.type==='preview'&&(area.history?.length||area.resultUrl||area.textContent||area.textHistory?.some(text=>text!=null)));
export const hasTaskData=card=>!!card.title||hasTaskResults(card)||card.areas.some(area=>
    area.history?.length||area.resultUrl||area.textContent||area.targetNodeId!=null&&area.targetNodeId!==''||area.targetNodeIds?.length||area.targetWidgets?.length||area.value!==undefined&&area.value!==null&&area.value!=='');

export function detachTaskRows(card,table) {
    const entries=[];
    for(const sheet of table?.sheets||[]){
        sheet.rows.forEach((row,index)=>{if(row.cardId===card.id){
            const layout=Object.fromEntries(['heights','rowPaddings','rowAlignments'].filter(key=>Object.hasOwn(table[key]||{},row.id)).map(key=>[key,structuredClone(table[key][row.id])]));
            const cells=Object.fromEntries(Object.entries(sheet.cellAppearance||{}).filter(([key])=>JSON.parse(key)[0]===row.id));
            const order=Object.fromEntries(['padding','alignment'].filter(key=>Object.hasOwn(table.appearanceOrder?.[key]||{},`row:${row.id}`)).map(key=>[key,table.appearanceOrder[key][`row:${row.id}`]]));
            entries.push({sheetId:sheet.id,row,index,layout,cells,order});
        }});
        sheet.rows=sheet.rows.filter(row=>row.cardId!==card.id);
    }
    if(entries.length)card.xyTableRows=entries;
}
export function restoreTaskRows(card,table) {
    const cards=Array.isArray(card)?card:[card];
    for(const entry of cards.flatMap(card=>card.xyTableRows||[]).sort((a,b)=>a.index-b.index)){
        const sheet=table?.sheets.find(sheet=>sheet.id===entry.sheetId);if(!sheet)continue;
        if(!sheet.rows.some(row=>row.cardId===entry.row.cardId))sheet.rows.splice(Math.min(entry.index,sheet.rows.length),0,entry.row);
        for(const [key,value]of Object.entries(entry.layout||{}))(table[key]??={})[entry.row.id]=structuredClone(value);
        if(Object.keys(entry.cells||{}).length)Object.assign(sheet.cellAppearance??={},structuredClone(entry.cells));
        for(const [key,value]of Object.entries(entry.order||{})){
            table.appearanceOrder[key][`row:${entry.row.id}`]=value;
            table.appearanceOrder.sequence=Math.max(table.appearanceOrder.sequence,value);
        }
    }
    for(const card of cards)delete card.xyTableRows;
}
export function insertArchivedTask(cards,card) {
    if(!cards.some(item=>item.id===card.id))cards.splice(Number.isInteger(card.xyArchiveIndex)?Math.min(card.xyArchiveIndex,cards.length):cards.length,0,card);
    delete card.xyArchiveIndex;
    delete card.xyArchiveBindings;delete card.xyArchiveOutput;
}
export function archiveTaskCards(cards,ids,archived,table,keep=hasTaskData) {
    let count=0;
    const positions=new Map((table?.sheets||[]).map(sheet=>[sheet.id,new Map(sheet.rows.map((row,index)=>[row.id,index]))]));
    for(let index=cards.length-1;index>=0;index--){
        const card=cards[index];if(!ids.has(card.id))continue;
        card.xyArchiveIndex=index;detachTaskRows(card,table);cards.splice(index,1);
        for(const entry of card.xyTableRows||[])entry.index=positions.get(entry.sheetId).get(entry.row.id);
        if(keep(card)&&!archived.some(item=>item.id===card.id)){archived.unshift(card);count++;}
    }
    return count;
}
export function archiveTasks(workspace,ids) {
    const count=archiveTaskCards(workspace.cards,ids,workspace.archivedTasks,workspace.view.table);
    workspace.view.xy.taskIds=workspace.view.xy.taskIds.filter(id=>!ids.has(id));
    return count;
}
