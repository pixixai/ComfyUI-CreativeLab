import test from 'node:test';
import assert from 'node:assert/strict';
import {createEditHistory} from '../web/components/edit_history.js';
import {createWorkspaceView} from '../web/components/workspace_modes/view_state.js';

const fixture=()=>({workspaces:[{id:'ws',name:'任务',view:createWorkspaceView({mode:'xy'}),cards:[{id:'task',title:'',areas:[{id:'input',type:'edit',value:20},{id:'output',type:'preview',history:['a.png'],resultUrl:'a.png',historyIndex:0}]}],archivedTasks:[]}]});
test('undo/redo changes input values without rewinding new results, mode or camera',()=>{
    const state=fixture(),ws=state.workspaces[0],card=ws.cards[0],area=card.areas[0],output=card.areas[1],history=createEditHistory();history.clear(state);
    area.value=30;history.record(state);output.history.push('new.png');output.resultUrl='new.png';output.historyIndex=1;ws.view.mode='cards';ws.view.xy.panX=501;ws.view.xy.zoom=2;
    history.undo(state);assert.equal(area.value,20);assert.equal(ws.view.mode,'cards');assert.equal(ws.view.xy.panX,501);assert.equal(ws.view.xy.zoom,2);assert.deepEqual(output.history,['a.png','new.png']);assert.equal(output.resultUrl,'new.png');
    history.redo(state);assert.equal(area.value,30);assert.equal(ws.cards[0],card);assert.equal(card.areas[1],output);
});
test('structural undo retains removed entity identities and their current media references',()=>{
    const state=fixture(),ws=state.workspaces[0],card=ws.cards[0],output=card.areas[1],history=createEditHistory();history.clear(state);
    ws.cards.splice(0,1);history.record(state);output.history.push('late.png');history.undo(state);assert.equal(ws.cards[0],card);assert.equal(ws.cards[0].areas[1],output);assert.deepEqual(output.history,['a.png','late.png']);history.redo(state);assert.equal(ws.cards.length,0);
});
test('consecutive inputs merge while independent actions and redo branches stay separate',()=>{
    const state=fixture(),input=state.workspaces[0].cards[0].areas[0],history=createEditHistory();history.clear(state);
    input.value=21;history.record(state,{group:'typing',time:1});input.value=22;history.record(state,{group:'typing',time:2});assert.equal(history.size,1);history.undo(state);assert.equal(input.value,20);history.redo(state);assert.equal(input.value,22);
    input.value=25;history.record(state,{group:'other',time:3});assert.equal(history.size,2);history.undo(state);input.value=27;history.record(state);assert.equal(history.canRedo,false);
});
test('entity order and matrix task membership restore together, including inserted/removed rows',()=>{
    const state=fixture(),ws=state.workspaces[0],history=createEditHistory(),a=ws.cards[0],b={id:'b',areas:[]},c={id:'c',areas:[]};ws.cards.push(b);ws.view.xy.taskIds=['task','b'];history.clear(state);
    ws.cards.splice(0,2,b,c);ws.view.xy.taskIds=['b','c'];history.record(state);history.undo(state);assert.deepEqual(ws.cards,[a,b]);assert.deepEqual(ws.view.xy.taskIds,['task','b']);history.redo(state);assert.deepEqual(ws.cards,[b,c]);
});
test('JSON parameter keys named history or view are editable user values',()=>{
    const state=fixture(),input=state.workspaces[0].cards[0].areas[0],history=createEditHistory();input.value={history:'用户值',view:{mode:'a'}};history.clear(state);input.value.history='修改';input.value.view.mode='b';history.record(state);history.undo(state);assert.deepEqual(input.value,{history:'用户值',view:{mode:'a'}});
});
test('view-only rebasing preserves redo and history limits discard the oldest operations',()=>{
    const state=fixture(),input=state.workspaces[0].cards[0].areas[0],history=createEditHistory({limit:2});history.clear(state);
    for(const value of [21,22,23]){input.value=value;history.record(state);}assert.equal(history.size,2);history.undo(state);state.workspaces[0].view.xy.zoom=3;history.rebase(state);assert.equal(history.canRedo,true);history.redo(state);assert.equal(input.value,23);
});
test('each workspace owns undo and redo even when task and module IDs are shared',()=>{
    const state=fixture(),a=state.workspaces[0],b=structuredClone(a);b.id='second';state.workspaces.push(b);state.activeWorkspaceId=a.id;
    const history=createEditHistory();history.clear(state);a.cards[0].areas[0].value=30;history.record(state);
    state.activeWorkspaceId=b.id;b.cards[0].areas[0].value=40;history.record(state);state.activeWorkspaceId=a.id;
    history.undo(state);assert.equal(a.cards[0].areas[0].value,20);assert.equal(b.cards[0].areas[0].value,40);assert.equal(history.canRedo,true);
    state.activeWorkspaceId=b.id;b.cards[0].areas[0].value=50;history.record(state);state.activeWorkspaceId=a.id;assert.equal(history.canRedo,true);
    history.redo(state);assert.equal(a.cards[0].areas[0].value,30);assert.equal(b.cards[0].areas[0].value,50);
    state.activeWorkspaceId=b.id;history.undo(state);assert.equal(b.cards[0].areas[0].value,40);assert.equal(a.cards[0].areas[0].value,30);
});
test('multi-workspace edits create separate steps and navigation never consumes content history',()=>{
    const state=fixture(),a=state.workspaces[0],b=structuredClone(a);b.id='second';state.workspaces.push(b);state.activeWorkspaceId=a.id;
    const history=createEditHistory();history.clear(state);a.cards[0].areas[0].value=31;b.cards[0].areas[0].value=41;history.record(state);
    history.undo(state,a.id);assert.equal(a.cards[0].areas[0].value,20);assert.equal(b.cards[0].areas[0].value,41);
    a.view.xy.previewRecords=['steps'];a.view.xy.previewRecordsExpanded=true;a.view.xy.z.current=2;a.view.mode='cards';history.record(state);
    assert.equal(history.canRedoFor(a.id),true);assert.equal(history.canUndoFor(a.id),false);history.undo(state,b.id);assert.equal(b.cards[0].areas[0].value,20);
});
test('preview layout edits share workspace history while source/search/history filters survive undo',()=>{
    const state=fixture(),ws=state.workspaces[0],history=createEditHistory();
    ws.view.previewDetail={columns:3,rowWidth:960,styles:{all:{size:12}},covers:[],outputs:[],tasks:['task'],inputs:[],search:'',typeFilter:'',histories:[]};history.clear(state);
    ws.view.previewDetail.styles.all.size=16;history.record(state);
    ws.view.previewDetail.search='forest';ws.view.previewDetail.typeFilter='image';ws.view.previewDetail.tasks=[];ws.view.previewDetail.histories=[['task','second']];history.record(state);
    assert.equal(history.size,1);history.undo(state);assert.equal(ws.view.previewDetail.styles.all.size,12);assert.equal(ws.view.previewDetail.search,'forest');assert.deepEqual(ws.view.previewDetail.tasks,[]);assert.deepEqual(ws.view.previewDetail.histories,[['task','second']]);
});
test('new and removed workspaces cannot undo edits in a surviving workspace',()=>{
    const state=fixture(),first=state.workspaces[0],history=createEditHistory();history.clear(state);first.name='修改';history.record(state);
    const second=structuredClone(first);second.id='new';state.workspaces.push(second);state.activeWorkspaceId=second.id;history.record(state);assert.equal(history.canUndo,false);assert.equal(history.undo(state),null);
    second.name='新工作区';history.record(state);state.workspaces.pop();state.activeWorkspaceId=first.id;history.record(state);history.undo(state);assert.equal(first.name,'任务');assert.equal(state.workspaces.length,1);
});
