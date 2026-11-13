import { state,appState,getActiveWorkspace,syncStateToActiveWorkspace,resetTransientState } from './ui_state.js';
import { createEditHistory } from './edit_history.js';
import { createWorkspaceView } from './workspace_modes/view_state.js';
import { currentHistoryContext,historyDestination,historyFocus } from './history_context.js';

const history=createEditHistory();let paused=0,installed=false,group='',lastInput=0,sequence=0,gesture=0;const inputs=new WeakMap();
const claimedKeys=new WeakSet();
const panelHistoryKey=event=>(event.ctrlKey||event.metaKey)&&!event.altKey&&['z','y'].includes(event.key.toLowerCase())&&
    !appState.isBindingMode&&!!document.querySelector('#clab-panel.visible,.clab-preview-modal.visible');
function guardWorkflowHistory(){
    const tracker=window.comfyAPI?.changeTracker?.ChangeTracker?.prototype,original=tracker?.undoRedo;
    if(!original)return;
    // ComfyUI's earlier capture listener queues this call before we can stop propagation.
    tracker.undoRedo=async function(event,...args){
        if(claimedKeys.has(event)||panelHistoryKey(event))return true;
        return original.call(this,event,...args);
    };
}
const record=()=>{if(!paused){syncStateToActiveWorkspace();history.record(state,{group:Date.now()-lastInput<750?group:'',context:currentHistoryContext()});}};
export const editHistory={
    record,
    reset(){history.clear(state);},
    withoutRecording(action){paused++;try{return action();}finally{if(!--paused){syncStateToActiveWorkspace();history.rebase(state);}}},
    get canUndo(){return history.canUndo;},get canRedo(){return history.canRedo;},
};
export function setupEditHistory({persist,flush}) {
    if(installed)return;installed=true;editHistory.reset();guardWorkflowHistory();
    window.addEventListener('pointerdown',()=>{group='';lastInput=0;gesture++;},true);
    window.addEventListener('input',event=>{
        const target=event.target;
        if(!target.closest?.('#clab-panel,.clab-preview-modal,.clab-module-binding-popover,.clab-maintenance-panel'))return;
        if(!inputs.has(target))inputs.set(target,++sequence);group=`input:${gesture}:${inputs.get(target)}`;lastInput=Date.now();
    },true);
    window.addEventListener('keydown',event=>{
        if(!panelHistoryKey(event))return;
        claimedKeys.add(event);
        const key=event.key.toLowerCase();
        const editor=event.target.closest?.('textarea,input:not([type=checkbox]):not([type=radio]):not([type=range]):not([type=button]):not([type=file]):not([type=color])');
        if(event.isComposing||editor&&!editor.readOnly&&!editor.disabled||event.target.closest?.('[contenteditable=true],.cm-editor,.monaco-editor'))return;
        event.preventDefault();event.stopImmediatePropagation();
        if(paused)return;
        document.dispatchEvent(new Event('clab_before_edit_history'));
        flush();record();
        let navigation;
        paused++;
        try{
            const redo=key==='y'||event.shiftKey;
            const workspaceId=document.querySelector('.clab-preview-modal.visible')?.dataset.editWorkspaceId||state.activeWorkspaceId;
            if(!(redo?history.canRedoFor(workspaceId):history.canUndoFor(workspaceId)))return;
            const entry=history.peek(workspaceId,redo),current=currentHistoryContext();
            navigation={workspaceId,destination:historyDestination(entry,current),focus:historyFocus(entry,workspaceId)};
            if(current.mode==='table'&&entry.context?.mode==='cards'&&navigation.focus.cardId){
                const root=document.querySelector(current.surface==='preview'?'.clab-preview-modal.visible':'#clab-panel'),prefix=root.dataset.editWorkspaceId&&root.querySelector('.clab-review-table-group')?`preview:${encodeURIComponent(workspaceId)}:`:'';
                const cardId=prefix?prefix+encodeURIComponent(navigation.focus.cardId):navigation.focus.cardId;
                const card=root.querySelector(current.surface==='preview'?`[data-grid-filter="row"][value="${CSS.escape(cardId)}"]`:`.clab-card[data-card-id="${CSS.escape(cardId)}"]`);
                if(!card||card.hidden)navigation.destination={surface:entry.context.surface,mode:entry.context.mode};
            }
            document.dispatchEvent(new CustomEvent('clab_edit_history_restoring',{detail:navigation}));
            const changes=redo?history.redo(state,workspaceId):history.undo(state,workspaceId);
            for(const workspace of state.workspaces)workspace.view=createWorkspaceView(workspace.view);
            const owner=state.workspaces.find(workspace=>workspace.id===workspaceId),sheet=owner.view.table.sheets.find(sheet=>sheet.id===navigation.destination.sheetId);
            if(sheet){owner.view.table.sheetId=sheet.id;owner.view.templateId=sheet.rows.find(row=>row.cardId===navigation.focus.cardId)?.cardId||sheet.rows.find(row=>row.cardId)?.cardId||'';}
            if(navigation.destination.surface==='workspace'){
                state.activeWorkspaceId=workspaceId;
                state.workspaces.find(workspace=>workspace.id===workspaceId).view.mode=navigation.destination.mode;
            }
            if(!state.workspaces.some(workspace=>workspace.id===state.activeWorkspaceId))state.activeWorkspaceId=state.workspaces[0]?.id;
            const workspace=getActiveWorkspace();if(workspace)state.cards=workspace.cards;
            resetTransientState();appState.selectedWorkspaceIds=workspace?[workspace.id]:[];
            const areaIds=[...new Set(changes.flatMap(change=>change.path.flatMap((key,index)=>key==='areas'&&typeof change.path[index+1]==='object'?[change.path[index+1].id]:[])))];
            document.dispatchEvent(new CustomEvent('clab_edit_history_restored',{detail:{areaIds,...navigation}}));
            persist();
        }finally{paused--;syncStateToActiveWorkspace();history.rebase(state);document.dispatchEvent(new CustomEvent('clab_after_edit_history',{detail:navigation}));}
    },true);
}
