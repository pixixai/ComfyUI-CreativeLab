import { matchingTasks, taskSignature, cloneTask } from './task_model.js';

const fields=['type','title','targetNodeId','targetWidget','targetNodeIds','targetWidgets','runtimeNodeBypassed','runtimeNodeDisabled','dataType','autoHeight','ratio','width','height','matchMedia','fillMode'];
export function captureTableStructure(cards,template) {
    return {signature:taskSignature(template),members:matchingTasks(cards,template).map(card=>({id:card.id,areaIds:card.areas.map(area=>area.id)}))};
}
export function synchronizeTableStructure(cards,baseline) {
    if(!baseline)return false;
    const sourceEntry=baseline.members.find(entry=>{const card=cards.find(card=>card.id===entry.id);return card&&taskSignature(card)!==baseline.signature;});
    if(!sourceEntry)return false;
    const source=cards.find(card=>card.id===sourceEntry.id);let changed=false;
    for(const entry of baseline.members){
        const target=cards.find(card=>card.id===entry.id);if(!target||target===source||taskSignature(target)!==baseline.signature)continue;
        const original=new Map(target.areas.map(area=>[area.id,area]));
        target.areas=source.areas.map(area=>{
            const index=sourceEntry.areaIds.indexOf(area.id),existing=original.get(entry.areaIds[index]);
            if(!existing)return cloneTask({areas:[area]}).areas[0];
            for(const field of fields){if(area[field]===undefined)delete existing[field];else existing[field]=structuredClone(area[field]);}
            return existing;
        });changed=true;
    }
    return changed;
}
