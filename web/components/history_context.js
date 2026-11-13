export function historyFocus(entry,workspaceId){
    if(entry.changes.every(change=>['name','autoName'].includes(change.path[2])))return {};
    const focus={...entry.context?.focus},prefix=`preview:${encodeURIComponent(workspaceId)}:`;
    for(const key of Object.keys(focus))if(focus[key]?.startsWith('preview:')){
        if(focus[key].startsWith(prefix))focus[key]=decodeURIComponent(focus[key].slice(prefix.length));else delete focus[key];
    }
    const affected={cardId:new Set(),areaId:new Set()};
    for(const change of entry.changes){
        const path=change.path;
        for(const [field,key]of [['cards','cardId'],['areas','areaId']]){
            const at=path.indexOf(field);if(at<0)continue;
            const id=path[at+1]?.id||(path.at(-1)===field?change.id:null);if(id)affected[key].add(id);
        }
    }
    for(const key of Object.keys(affected))if(affected[key].size&&!affected[key].has(focus[key]))focus[key]=affected[key].values().next().value;
    if(affected.cardId.size&&!affected.areaId.size)delete focus.areaId;
    return focus;
}

export function historyDestination(entry,current){
    const kinds=new Set();let table=false,archive=false;
    for(const {path}of entry.changes){
        const root=path[2];
        if(root==='view'){
            if(path[3]==='previewDetail')kinds.add('detail');
            if(path[3]==='xy')kinds.add('xy');
            if(path[3]==='table'){
                table=true;
                if(['widths','heights','padding','columnWidth','rowHeight','alignments','rowAlignments','columnPaddings','rowPaddings','appearanceOrder'].includes(path[4])||['columnWidth','rowHeight','padding','alignment','cellAppearance'].includes(path.at(-1)))kinds.add('table');
            }
        }else if(root==='cards'){
            const area=path.indexOf('areas');
            if(area>=0&&['ratio','width','height','fillMode','autoHeight','matchMedia'].includes(path[area+2]))kinds.add('moduleAppearance');
            else kinds.add(path.length===5&&path[4]==='title'?'title':'content');
        }else if(root==='archivedTasks')archive=true;
    }
    if(!kinds.size&&table)kinds.add('table');
    if(!kinds.size&&archive)return {...current,panel:'maintenance'};
    const supports=view=>[...kinds].every(kind=>kind==='detail'?view.surface==='preview'&&view.mode==='detail':
        kind==='xy'?view.mode==='xy':kind==='table'?view.mode==='table':kind==='moduleAppearance'?view.surface==='workspace'&&view.mode==='cards':
        kind==='content'?view.mode==='table'||view.surface==='workspace'&&view.mode==='cards':true);
    const origin=entry.context;
    if(supports(current))return {...current,...(kinds.size&&current.mode==='table'&&origin?.sheetId?{sheetId:origin.sheetId}:{})};
    if(origin)return {surface:origin.surface,mode:origin.mode,...(origin.sheetId?{sheetId:origin.sheetId}:{})};
    if(kinds.has('detail'))return {surface:'preview',mode:'detail'};
    if(kinds.has('xy'))return {surface:'workspace',mode:'xy'};
    if(kinds.has('table'))return {surface:'preview',mode:'table'};
    return {surface:'workspace',mode:'cards'};
}

export function currentHistoryContext(){
    const preview=document.querySelector('.clab-preview-modal.visible'),panel=document.querySelector('#clab-panel');
    const root=preview||panel;
    const field=preview?.querySelector('.clab-detail-card.active .clab-detail-field.selected');
    const cell=field||root?.querySelector('.clab-area.active,[data-review-cell].active,[data-review-cell].selected');
    const card=cell?.closest('[data-detail-card],[data-card-id],[data-review-row]');
    const focus={};
    if(card)focus.cardId=card.dataset.detailCard||card.dataset.cardId||card.dataset.reviewRow;
    if(cell)focus.areaId=cell.dataset.detailField||cell.dataset.areaId||cell.dataset.reviewCell;
    return {surface:preview?'preview':'workspace',mode:preview?.dataset.reviewMode||panel?.dataset.workspaceMode||'cards',focus};
}
