import test from 'node:test';
import assert from 'node:assert/strict';
import {historyDestination,historyFocus} from '../web/components/history_context.js';
import {createEditHistory} from '../web/components/edit_history.js';

const view=(surface,mode)=>({surface,mode});
const change=(...path)=>({kind:'set',path:['workspaces',{id:'ws'},...path]});
const entry=(context,...changes)=>({context,changes});
test('shared table names and values undo in the current table regardless of their source interface',()=>{
    const action=entry(view('workspace','table'),change('cards',{id:'task'},'areas',{id:'input'},'value'),change('view','table','drafts','input','text'));
    assert.deepEqual(historyDestination(action,view('preview','table')),view('preview','table'));
    action.context=view('preview','table');assert.deepEqual(historyDestination(action,view('workspace','table')),view('workspace','table'));
    assert.deepEqual(historyDestination(action,view('workspace','cards')),view('workspace','cards'));
});
test('preview-only detail formatting navigates to detail from the workspace or another preview page',()=>{
    const action=entry(view('preview','detail'),change('view','previewDetail','styles','name:Text','value','size'));
    for(const current of [view('workspace','cards'),view('preview','browse'),view('preview','table')])assert.deepEqual(historyDestination(action,current),view('preview','detail'));
    assert.deepEqual(historyDestination(action,view('preview','detail')),view('preview','detail'));
});
test('table sizing stays in either table but leaves card view when the result would be invisible',()=>{
    const action=entry(view('preview','table'),change('view','table','widths','input'));
    assert.deepEqual(historyDestination(action,view('workspace','table')),view('workspace','table'));
    assert.deepEqual(historyDestination(action,view('workspace','cards')),view('preview','table'));
    action.context.sheetId='original-sheet';assert.deepEqual(historyDestination(action,view('workspace','table')),{surface:'workspace',mode:'table',sheetId:'original-sheet'});
});
test('axis changes stay on a visible matrix, while parameter edits leave history-only previews',()=>{
    const axis=entry(view('workspace','xy'),change('view','xy','x','values'));
    assert.deepEqual(historyDestination(axis,view('preview','xy')),view('preview','xy'));
    assert.deepEqual(historyDestination(axis,view('preview','browse')),view('workspace','xy'));
    const input=entry(view('workspace','cards'),change('cards',{id:'t'},'areas',{id:'a'},'value'));
    assert.deepEqual(historyDestination(input,view('preview','detail')),view('workspace','cards'));
});
test('card names and workspace names remain visible in preview sources without jumping',()=>{
    for(const changed of [change('cards',{id:'t'},'title'),change('name')])assert.deepEqual(historyDestination(entry(view('workspace','cards'),changed),view('preview','browse')),view('preview','browse'));
    assert.deepEqual(historyDestination(entry({...view('preview','table'),sheetId:'old'},change('name')),view('workspace','table')),view('workspace','table'));
});
test('module display settings do not pretend to change fixed-size table cells',()=>{
    const action=entry(view('workspace','cards'),change('cards',{id:'t'},'areas',{id:'a'},'ratio'));
    assert.deepEqual(historyDestination(action,view('preview','table')),view('workspace','cards'));
});
test('focus IDs decode only the owning workspace and otherwise follow the changed entities',()=>{
    const action=entry({...view('preview','detail'),focus:{cardId:'preview:ws:t',areaId:'preview:ws:a'}},change('view','previewDetail','styles'));
    assert.deepEqual(historyFocus(action,'ws'),{cardId:'t',areaId:'a'});
    action.changes=[change('cards',{id:'own'},'areas',{id:'field'},'title')];assert.deepEqual(historyFocus(action,'other'),{cardId:'own',areaId:'field'});
    assert.deepEqual(historyFocus(entry(action.context,change('name')),'ws'),{});
    const cloned=entry({...view('workspace','cards'),focus:{cardId:'source',areaId:'source-input'}},{kind:'add',path:['workspaces',{id:'ws'},'cards'],id:'clone'});
    assert.deepEqual(historyFocus(cloned,'ws'),{cardId:'clone'});
});
test('history entries retain presentation metadata through undo/redo without storing it in workflow data',()=>{
    const ws={id:'ws',cards:[{id:'t',areas:[{id:'a',type:'edit',value:1}]}]},state={workspaces:[ws],activeWorkspaceId:'ws'},history=createEditHistory();history.clear(state);
    const context={...view('preview','table'),focus:{cardId:'t',areaId:'a'}};ws.cards[0].areas[0].value=2;history.record(state,{context});
    assert.deepEqual(history.peek('ws').context,context);history.undo(state);assert.deepEqual(history.peek('ws',true).context,context);history.redo(state);assert.equal(ws.cards[0].areas[0].value,2);assert.equal(JSON.stringify(ws).includes('context'),false);
});
