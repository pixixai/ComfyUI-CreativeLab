import { collectPreviewRecords, sourceKey } from './preview_records.js';
import { remapPreviewHistory } from '../../modules/media_types/media_utils.js';

export function reorderSourceHistories(sources,groups) {
    const before=collectPreviewRecords(sources),permutations=new Map(),changed=[];
    for(const {card,area} of sources) {
        const source=sourceKey(card,area),indices=(area.history||[]).map((_,index)=>index);
        for(const group of groups) {
            const records=group.records.filter(record=>record.source===source&&record.index>=0);
            const slots=records.map(record=>record.index).sort((a,b)=>a-b);
            records.forEach((record,index)=>{indices[slots[index]]=record.index;});
        }
        if(indices.every((index,position)=>index===position))continue;
        const missing=area.missingHistoryRun,selected=area.historyIndex;
        const active=remapPreviewHistory(area,indices);
        area.historyIndex=active>=0?active:indices.indexOf(selected);
        if(missing===undefined)delete area.missingHistoryRun;
        else area.missingHistoryRun=missing;
        if(Array.isArray(area.selectedThumbIndices))area.selectedThumbIndices=area.selectedThumbIndices.map(index=>indices.indexOf(index)).filter(index=>index>=0);
        permutations.set(source,new Map(indices.map((oldIndex,newIndex)=>[oldIndex,newIndex])));
        changed.push(area.id);
    }
    const after=collectPreviewRecords(sources),bySource=new Map();
    for(const record of after) {
        if(!bySource.has(record.source))bySource.set(record.source,new Map());
        bySource.get(record.source).set(record.index,record.key);
    }
    const keys=new Map(before.map(record=>[record.key,bySource.get(record.source).get(permutations.get(record.source)?.get(record.index)??record.index)]));
    return {changed,keys};
}
