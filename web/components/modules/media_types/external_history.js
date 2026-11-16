// Imported records have editable identities; generated results remain runtime data.
let sequence=0;
const fields=['history','historyRuns','inputHistorySnapshots','textHistory','textHistoryStatus'];
const empty={history:'',historyRuns:null,inputHistorySnapshots:null,textHistory:'',textHistoryStatus:'idle'};
export const importedHistory = (area,index) => area.historyRuns?.[index]?.externalImport || null;
function prepare(area){
    if(!area.history?.length&&area.resultUrl)area.history=[area.resultUrl];
    area.history??=[];
    for(const key of fields.slice(1)){area[key]??=[];while(area[key].length<area.history.length)area[key].push(empty[key]);}
}
function select(area,index){
    area.historyIndex=Math.max(0,index);area.resultUrl=area.history[index]||'';area.missingHistoryRun=null;area.selectedThumbIndices=[];
    area.textContent=area.textHistory[index]||'';area.textLoadState=area.textHistoryStatus[index]||'idle';
}
export function appendExternalHistory(area,assets,workspaceId){
    prepare(area);const first=area.history.length;
    for(const asset of assets){
        const record={id:`import_${Date.now()}_${++sequence}`,assetId:asset.id,workspaceId,url:asset.url,position:area.history.length};
        (area.externalImports??=[]).push(record);
        area.history.push(asset.url);area.historyRuns.push({externalImport:{id:record.id,assetId:asset.id,workspaceId}});
        area.inputHistorySnapshots.push(null);area.textHistory.push('');area.textHistoryStatus.push('idle');
    }
    if(assets.length)select(area,first);
}
export function reconcileExternalHistory(area){
    if(!area.externalImports?.length&&!area.historyRuns?.some(run=>run?.externalImport))return;
    prepare(area);
    const records=area.externalImports||[],known=new Set(records.map(record=>record.id)),active=area.historyIndex??area.history.length-1;
    const activeImport=importedHistory(area,active)?.id,activeUrl=area.history[active];
    const keep=area.history.map((_,index)=>index).filter(index=>!importedHistory(area,index)||known.has(importedHistory(area,index).id));
    const oldActive=keep.indexOf(active);
    for(const key of fields)area[key]=keep.map(index=>area[key][index]);
    let next=oldActive,firstRestored=-1;
    const present=new Set(area.historyRuns.flatMap(run=>run?.externalImport?[run.externalImport.id]:[]));
    for(const record of [...records].sort((a,b)=>a.position-b.position))if(!present.has(record.id)){
        const index=Math.min(record.position,area.history.length);
        for(const key of fields)area[key].splice(index,0,key==='history'?record.url:key==='historyRuns'?{externalImport:{id:record.id,assetId:record.assetId,workspaceId:record.workspaceId}}:empty[key]);
        if(next>=index)next++;
        if(firstRestored<0)firstRestored=index;
        present.add(record.id);
    }
    if(firstRestored>=0&&next<firstRestored)next=firstRestored;
    else if(activeImport&&known.has(activeImport))next=area.historyRuns.findIndex(run=>run?.externalImport?.id===activeImport);
    else if(next<0||area.history[next]!==activeUrl)next=Math.min(Math.max(0,active),area.history.length-1);
    select(area,next);
}
export function removeExternalImports(workspace,references,remove=false){
    const keys=new Set(references.map(reference=>reference.assetId)),areas=[];let count=0,covers=0;
    for(const card of [...workspace.cards,...workspace.archivedTasks||[]])for(const area of card.areas){
        const matching=(area.externalImports||[]).filter(record=>keys.has(record.assetId));
        if(!matching.length)continue;count+=matching.length;
        const ids=new Set(matching.map(record=>record.id)),cover=workspace.view.previewDetail?.covers?.find(([id])=>id===card.id)?.[1];
        // Imported record keys include their identity, so clearing never depends on a filename.
        if(cover?.areaId===area.id&&matching.some(record=>cover.recordKey.includes(JSON.stringify(record.id)))){
            covers++;if(remove)workspace.view.previewDetail.covers=workspace.view.previewDetail.covers.filter(([id])=>id!==card.id);
        }
        if(remove){area.externalImports=area.externalImports.filter(record=>!ids.has(record.id));reconcileExternalHistory(area);areas.push(area.id);}
    }
    return {count,covers,areas};
}
