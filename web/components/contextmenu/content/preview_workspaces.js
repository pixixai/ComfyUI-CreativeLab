import { createWorkspaceView } from '../../workspace_modes/view_state.js';

const literalFields=new Set(['value','values','inputText','text','textContent','textHistory','title','name','label','nodeName','displayName','url','resultUrl','history','targetNodeId','targetNodeIds','targetWidget','targetWidgets','bindings','key','xyInitialInput']);
const identityFields=new Set(['id','cardId','areaId','sourceAreaId','targetAreaId','moduleId','rowId','columnId','tableColumnId','xyOutputId','templateId','sheetId','recordKey','active','field','anchor']);
function rewrite(value,ids,field='') {
    if(field==='values'&&value&&typeof value==='object'&&!Array.isArray(value))return Object.fromEntries(Object.entries(value).map(([key,entry])=>[ids.get(key)||key,structuredClone(entry)]));
    if(literalFields.has(field))return structuredClone(value);
    if(typeof value==='string'){
        if(field&&!identityFields.has(field))return value;
        if(ids.has(value))return ids.get(value);
        // Source, field and record keys encode task/module IDs as JSON.
        if(value.startsWith('[')){
            const suffix=value.lastIndexOf(']:');
            try{return JSON.stringify(rewrite(JSON.parse(suffix<0?value:value.slice(0,suffix+1)),ids))+(suffix<0?'':value.slice(suffix+1));}catch{}
        }
        return value;
    }
    if(Array.isArray(value))return value.map(entry=>rewrite(entry,ids));
    if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([key,entry])=>[rewrite(key,ids),rewrite(entry,ids,key)]));
    return value;
}
function patch(target,before,after) {
    for(const key of new Set([...Object.keys(before),...Object.keys(after)])){
        if(JSON.stringify(before[key])===JSON.stringify(after[key]))continue;
        if(!(key in after)){delete target[key];continue;}
        if(Array.isArray(after[key])&&['cards','areas'].includes(key)){
            const current=new Map((target[key]||[]).map(item=>[item.id,item])),previous=new Map((before[key]||[]).map(item=>[item.id,item]));
            target[key]=after[key].map(item=>{const original=current.get(item.id);if(!original)return structuredClone(item);patch(original,previous.get(item.id)||{},item);return original;});
        }else if(after[key]&&typeof after[key]==='object'&&!Array.isArray(after[key])&&target[key]&&typeof target[key]==='object'&&!Array.isArray(target[key]))patch(target[key],before[key]||{},after[key]);
        else target[key]=structuredClone(after[key]);
    }
}

// Preview IDs are local to this session: copied workspaces may share stored IDs.
export function createPreviewWorkspaceBundle(workspaces,label,onCommit=()=>{}) {
    const groups=workspaces.map(workspace=>{
        workspace.view=createWorkspaceView(workspace.view);
        const ids=new Map();
        const collect=value=>{
            if(!value||typeof value!=='object')return;
            if(typeof value.id==='string')ids.set(value.id,`preview:${encodeURIComponent(workspace.id)}:${encodeURIComponent(value.id)}`);
            for(const [key,entry]of Object.entries(value)){
                if(literalFields.has(key))continue;
                if(Array.isArray(entry))entry.forEach(collect);else collect(entry);
            }
        };
        collect({cards:workspace.cards,table:workspace.view.table});
        const reverse=new Map([...ids].map(([key,value])=>[value,key]));
        const projected=rewrite({cards:workspace.cards,view:workspace.view},ids);
        let baseline=structuredClone({cards:workspace.cards,view:workspace.view});
        const group={id:workspace.id,name:label(workspace),workspace,projected,reverse,
            commit(){const next=rewrite(projected,reverse);patch(workspace,baseline,next);baseline=structuredClone(next);},
        };
        for(const card of projected.cards){Object.defineProperty(card,'previewWorkspace',{value:{id:workspace.id,name:group.name},enumerable:false});}
        return group;
    });
    const cards=groups.flatMap(group=>group.projected.cards);
    const saved={...groups[0]?.projected.view.previewDetail,styles:Object.assign({},...groups.map(group=>group.projected.view.previewDetail?.styles||{}))};
    for(const key of ['cardIds','tasks','outputs','covers','histories','media','inputs'])saved[key]=groups.flatMap(group=>group.projected.view.previewDetail?.[key]||[]);
    const detail={view:{previewDetail:saved}};
    return {groups,cards,detail,
        saveDetail(){
            const all=detail.view.previewDetail;
            for(const group of groups){
                const ids=new Set(group.projected.cards.map(card=>card.id)),previous=group.projected.view.previewDetail||{};
                group.projected.view.previewDetail={...previous,...all};
                group.projected.view.previewDetail.styles=Object.fromEntries(Object.entries(all.styles||{}).filter(([key])=>key==='all'||key.startsWith('name:')||(()=>{try{return ids.has(JSON.parse(key)[0]);}catch{return false;}})()));
                for(const key of ['cardIds','tasks'])group.projected.view.previewDetail[key]=(all[key]||[]).filter(id=>ids.has(id));
                for(const key of ['outputs','covers','histories','media','inputs'])group.projected.view.previewDetail[key]=(all[key]||[]).filter(([id])=>ids.has(id)||(()=>{try{return ids.has(JSON.parse(id)[0]);}catch{return false;}})());
            }
        },
        commit(){for(const group of groups)group.commit();onCommit();},
    };
}
