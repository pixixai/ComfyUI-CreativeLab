import { detailInputs,detailOutputRecords,detailHistoryKey } from './preview_detail_model.js';

export function pruneDetailSession(cards,config) {
    const byId=new Map(cards.map(card=>[card.id,card])),histories=new Map();
    for(const card of cards)for(const area of card.areas.filter(area=>area.type==='preview'))histories.set(detailHistoryKey(card.id,area.id),new Set(detailOutputRecords(card,area).map(record=>record.key)));
    config.tasks=new Set([...config.tasks].filter(id=>byId.has(id)));
    for(const [id,areaId] of config.outputs)if(!byId.get(id)?.areas.some(area=>area.id===areaId&&area.type==='preview'))config.outputs.delete(id);
    for(const [id,cover] of config.covers)if(!histories.get(detailHistoryKey(id,cover.areaId))?.has(cover.recordKey))config.covers.delete(id);
    for(const [key,recordKey] of config.histories)if(!histories.get(key)?.has(recordKey))config.histories.delete(key);
    for(const [key] of config.media)if(!histories.has(key))config.media.delete(key);
    for(const [id,selected] of config.inputs){
        const card=byId.get(id);if(!card){config.inputs.delete(id);continue;}
        const valid=new Set(detailInputs(card).map(field=>field.id));config.inputs.set(id,new Set([...selected].filter(field=>valid.has(field))));
    }
}

export function restoreDetailSession(cards,config,saved,defaults) {
    const known=new Set(saved?.cardIds||[]),checked=new Set(saved?.tasks||[]);
    config.tasks=new Set(cards.filter(card=>!known.has(card.id)||checked.has(card.id)).map(card=>card.id));
    for(const key of ['outputs','covers','histories','media'])config[key]=new Map(saved?.[key]||[]);
    config.inputs=new Map((saved?.inputs||[]).map(([id,fields])=>[id,new Set(fields)]));
    for(const key of ['columns','rowWidth','sourceColumns'])config[key]=saved?.[key]??defaults[key];
    config.styles=structuredClone(saved?.styles||defaults.styles);
    config.search=saved?.search||'';config.typeFilter=saved?.typeFilter||'';
    pruneDetailSession(cards,config);
}

export function serializeDetailSession(cards,config) {
    pruneDetailSession(cards,config);
    return {cardIds:cards.map(card=>card.id),tasks:[...config.tasks],outputs:[...config.outputs],covers:[...config.covers],histories:[...config.histories],media:[...config.media],inputs:[...config.inputs].map(([id,fields])=>[id,[...fields]]),
        columns:config.columns,rowWidth:config.rowWidth,sourceColumns:config.sourceColumns,styles:structuredClone(config.styles),search:config.search,typeFilter:config.typeFilter};
}
