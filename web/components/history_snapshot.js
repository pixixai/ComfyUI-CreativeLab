// Keep results on the live objects; content undo must not copy or rewind generated media.
const runtime=new Set(['history','historyRuns','inputHistorySnapshots','textHistory','textHistoryStatus','textContent','textLoadState','historyIndex','resultUrl','resultKind','mediaSize','missingHistoryRun','historyRunSequence','isManageMode','selectedThumbIndices','selectedCardIds','selectedAreaIds','activeCardId','painterMode','painterSource','scrollLeft','scrollTop']);
export function editableField(path,key) {
    if(path.includes('value')||path.includes('values'))return true;
    if(['workspaces','cards','archivedTasks','areas'].includes(path.at(-2))&&runtime.has(key))return false;
    if(path.at(-1)==='view'&&['mode','structuredMode'].includes(key))return false;
    if(path.at(-1)==='previewDetail'&&!['styles','columns','rowWidth','covers','outputs'].includes(key))return false;
    if(path.at(-1)==='xy'&&['zoom','panX','panY','cameraReady','previewRecords','previewRecordsExpanded'].includes(key))return false;
    if(path.at(-1)==='z'&&['current','display'].includes(key))return false;
    return true;
}
export const entityArray=value=>Array.isArray(value)&&value.every(item=>item&&typeof item==='object'&&!Array.isArray(item)&&typeof item.id==='string')&&new Set(value.map(item=>item.id)).size===value.length;

export function captureHistory(value,previous,origins,path=[]) {
    if(!value||typeof value!=='object')return value;
    const array=Array.isArray(value),copy=array?[]:{},keys=Object.keys(value).filter(key=>array||editableField(path,key));
    let same=!!previous&&Array.isArray(previous)===array&&Object.keys(previous).length===keys.length;
    for(const key of keys){copy[key]=captureHistory(value[key],previous?.[key],origins,[...path,key]);same&&=Object.hasOwn(previous,key)&&copy[key]===previous[key];}
    const snapshot=same?previous:copy;origins.set(snapshot,value);return snapshot;
}
export function historyDiff(before,after,path=[],changes=[]) {
    if(before===after)return changes;
    if(Array.isArray(before)&&Array.isArray(after)&&entityArray(before)&&entityArray(after)){
        const old=new Map(before.map((item,index)=>[item.id,{item,index}])),next=new Map(after.map((item,index)=>[item.id,{item,index}]));
        for(const [id,{item,index}]of old)if(!next.has(id))changes.push({kind:'remove',path,id,value:item,index});
        for(const [id,{item,index}]of next)if(!old.has(id))changes.push({kind:'add',path,id,value:item,index});else historyDiff(old.get(id).item,item,[...path,{id}],changes);
        const a=before.map(item=>item.id),b=after.map(item=>item.id);
        if(a.join('\0')!==b.join('\0'))changes.push({kind:'order',path,before:a,after:b});
    }else if(before&&after&&typeof before==='object'&&typeof after==='object'&&!Array.isArray(before)&&!Array.isArray(after)){
        for(const key of new Set([...Object.keys(before),...Object.keys(after)])){
            if(!Object.hasOwn(before,key)||!Object.hasOwn(after,key))changes.push({kind:'set',path:[...path,key],before:before[key],after:after[key],hadBefore:Object.hasOwn(before,key),hadAfter:Object.hasOwn(after,key)});
            else historyDiff(before[key],after[key],[...path,key],changes);
        }
    }else changes.push({kind:'set',path,before,after,hadBefore:true,hadAfter:true});
    return changes;
}
function rebuild(snapshot,reference,origins,path) {
    if(!snapshot||typeof snapshot!=='object')return snapshot;
    const target=reference&&typeof reference==='object'&&Array.isArray(reference)===Array.isArray(snapshot)?reference:origins.get(snapshot)||(Array.isArray(snapshot)?[]:{});
    if(Array.isArray(snapshot)){
        const keyed=entityArray(snapshot)&&entityArray(target),existing=keyed?new Map(target.map(item=>[item.id,item])):null;
        const values=snapshot.map((item,index)=>rebuild(item,keyed?existing.get(item.id):target[index],origins,[...path,index]));target.splice(0,target.length,...values);
    }else{
        for(const key of Object.keys(target))if(editableField(path,key)&&!Object.hasOwn(snapshot,key))delete target[key];
        for(const key of Object.keys(snapshot))target[key]=rebuild(snapshot[key],target[key],origins,[...path,key]);
    }
    return target;
}
const at=(root,path)=>path.reduce((value,key)=>typeof key==='object'?value?.find(item=>item.id===key.id):value?.[key],root);
export function applyHistory(root,changes,backward,origins) {
    for(const change of backward?[...changes].reverse():changes){
        if(change.kind==='set'){
            const parent=at(root,change.path.slice(0,-1)),key=change.path.at(-1);if(!parent)continue;
            if(backward?change.hadBefore:change.hadAfter)parent[key]=rebuild(backward?change.before:change.after,parent[key],origins,change.path);else delete parent[key];
        }else{
            const array=at(root,change.path);if(!array)continue;
            if(change.kind==='order'){
                const ids=backward?change.before:change.after,positions=new Map(ids.map((id,index)=>[id,index]));
                array.sort((a,b)=>(positions.get(a.id)??ids.length)-(positions.get(b.id)??ids.length));
            }else if((change.kind==='add')!==backward){
                if(!array.some(item=>item.id===change.id))array.splice(Math.min(change.index,array.length),0,rebuild(change.value,undefined,origins,[...change.path,{id:change.id}]));
            }else{const index=array.findIndex(item=>item.id===change.id);if(index>=0)array.splice(index,1);}
        }
    }
}
