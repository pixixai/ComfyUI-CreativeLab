import { captureHistory,historyDiff,applyHistory } from './history_snapshot.js';
import { preserveHistoryTasks } from './history_tasks.js';
import { matrixBindings } from './workspace_modes/xy_archive.js';

function createContentHistory({limit=100,budget=16777216}={}) {
    let baseline,origins=new WeakMap(),undo=[],redo=[],bytes=0;
    const snapshot=(state,entry)=>captureHistory({workspaces:state.workspaces},baseline,origins,[],entry?.cardsOnly&&entry.cardIds?.length?{cardsOnly:true,cardIds:new Set(entry.cardIds),areaIds:entry.areaIds?new Set(entry.areaIds):null}:null);
    const rebase=state=>{baseline=snapshot(state);};
    const clear=state=>{origins=new WeakMap();baseline=undefined;undo=[];redo=[];bytes=0;rebase(state);};
    const record=(state,entry={})=>{
        const {group='',time=Date.now(),context}=entry;
        const next=snapshot(state,entry);if(!baseline){baseline=next;return false;}
        const changes=historyDiff(baseline,next);baseline=next;if(!changes.length)return false;
        redo=[];
        const last=undo.at(-1),merge=group&&last?.group===group&&time-last.time<750&&last.context?.surface===context?.surface&&last.context?.mode===context?.mode&&changes.every(change=>change.kind==='set')&&JSON.stringify(last.changes.map(change=>change.path))===JSON.stringify(changes.map(change=>change.path));
        if(merge){bytes-=last.bytes;last.changes.forEach((change,index)=>{change.after=changes[index].after;change.hadAfter=changes[index].hadAfter;});last.time=time;last.bytes=JSON.stringify(last.changes).length*2;bytes+=last.bytes;}
        else{const entry={changes,group,time,context,bytes:JSON.stringify(changes).length*2};undo.push(entry);bytes+=entry.bytes;}
        while(undo.length>limit||bytes>budget&&undo.length>1)bytes-=undo.shift().bytes;
        return true;
    };
    const step=(state,backward)=>{
        const source=backward?undo:redo,destination=backward?redo:undo,entry=source.pop();if(!entry)return null;
        const previous=state.workspaces.map(workspace=>({workspace,cards:[...workspace.cards],matrixIds:[...(workspace.view?.xy?.taskIds||[])],bindings:workspace.view?.xy?matrixBindings(workspace.view.xy):''}));
        applyHistory(state,entry.changes,backward,origins);
        for(const {workspace,cards,matrixIds,bindings}of previous)preserveHistoryTasks(workspace,cards,matrixIds,bindings);
        destination.push(entry);bytes+=(backward?-1:1)*entry.bytes;rebase(state);return entry.changes;
    };
    return {record,rebase,clear,undo:state=>step(state,true),redo:state=>step(state,false),peek:(forward=false)=>(forward?redo:undo).at(-1)||null,get canUndo(){return !!undo.length;},get canRedo(){return !!redo.length;},get size(){return undo.length+redo.length;}};
}

export function createEditHistory(options) {
    const histories=new Map();let current;
    const scope=workspace=>({workspaces:[workspace]});
    const visit=(state,action,workspaceIds)=>{
        current=state;let changed=false;
        const ids=new Set(state.workspaces.map(workspace=>workspace.id));
        for(const id of histories.keys())if(!ids.has(id))histories.delete(id);
        const selected=workspaceIds?new Set(workspaceIds):null;
        for(const workspace of state.workspaces){
            let history=histories.get(workspace.id);
            if(!history){history=createContentHistory(options);history.clear(scope(workspace));histories.set(workspace.id,history);}
            else if(!selected||selected.has(workspace.id))changed=action(history,scope(workspace))||changed;
        }
        return changed;
    };
    const active=()=>current?.activeWorkspaceId||current?.workspaces[0]?.id;
    const step=(state,id,method)=>{
        current=state;const workspace=state.workspaces.find(workspace=>workspace.id===(id||active()));
        return workspace?histories.get(workspace.id)?.[method](scope(workspace))||null:null;
    };
    return {
        clear(state){histories.clear();visit(state,()=>{});},
        rebase(state,entry){visit(state,(history,scoped)=>history.rebase(scoped),entry?.workspaceIds);},
        record(state,entry){return visit(state,(history,scoped)=>{
            const sheetId=scoped.workspaces[0].view?.table?.sheetId;
            return history.record(scoped,entry?.context?.mode==='table'&&sheetId?{...entry,context:{...entry.context,sheetId}}:entry);
        },entry?.workspaceIds);},
        undo:(state,id)=>step(state,id,'undo'),redo:(state,id)=>step(state,id,'redo'),
        peek:(id=active(),forward=false)=>histories.get(id)?.peek(forward)||null,
        canUndoFor:id=>histories.get(id)?.canUndo||false,canRedoFor:id=>histories.get(id)?.canRedo||false,
        get canUndo(){return histories.get(active())?.canUndo||false;},
        get canRedo(){return histories.get(active())?.canRedo||false;},
        get size(){return [...histories.values()].reduce((sum,history)=>sum+history.size,0);},
    };
}
