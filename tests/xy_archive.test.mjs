import test from 'node:test';
import assert from 'node:assert/strict';
import { createWorkspaceView } from '../web/components/workspace_modes/view_state.js';
import { synchronizeMatrix } from '../web/components/workspace_modes/xy_model.js';
import { reconcileMatrixArchive,restoreArchivedTasks } from '../web/components/workspace_modes/xy_archive.js';
import { parameterValue } from '../web/components/workspace_modes/task_model.js';
import { openTableSheet,materializeTable } from '../web/components/workspace_modes/table_sheet.js';
import { normalizeWorkspace } from '../web/components/ui_state.js';

function fixture(){const view=createWorkspaceView({mode:'xy',xy:{initialized:true,x:{bindings:['1||steps'],values:[25,20,15,10,5]},y:{bindings:['1||sampler'],values:['Euler']},outputNodeId:'2'}}),cards=[];synchronizeMatrix(cards,view.xy,[]);return {view,cards,archivedTasks:[]};}
test('removed matrix combinations archive generated/edited tasks, clean untouched empty tasks, and leave unrelated tasks alone',()=>{
    const ws=fixture(),twenty=ws.cards[1],ten=ws.cards[3];twenty.areas[0].history=['/old.png'];ten.title='手动任务';
    ws.cards.push({id:'manual',areas:[]});ws.view.xy.x.values=[25,15,5];
    assert.deepEqual(reconcileMatrixArchive(ws.cards,ws.view.xy,ws.archivedTasks),{archived:2,removed:0});
    assert.equal(ws.cards.length,4);assert.deepEqual(ws.archivedTasks.map(card=>parameterValue(card,'1||steps')).sort((a,b)=>a-b),[10,20]);
    ws.view.xy.x.values=[25];const result=reconcileMatrixArchive(ws.cards,ws.view.xy,ws.archivedTasks);assert.equal(result.removed,2);assert.equal(ws.cards.length,2);
});
test('adding a removed value recovers the same task, output and history without creating duplicate combinations',()=>{
    const ws=fixture(),card=ws.cards[1],output=card.areas[0];output.history=['/a.png','/b.png'];ws.view.xy.x.values=[25,15,5];
    reconcileMatrixArchive(ws.cards,ws.view.xy,ws.archivedTasks);ws.view.xy.x.values.push(20);
    reconcileMatrixArchive(ws.cards,ws.view.xy,ws.archivedTasks);synchronizeMatrix(ws.cards,ws.view.xy,[]);
    assert.equal(ws.cards.find(item=>item.id===card.id),card);assert.equal(card.areas[0],output);assert.equal(output.history.length,2);assert.equal(ws.cards.length,4);assert.equal(ws.archivedTasks.length,0);
});
test('explicit restoration expands axes only in matrix mode and never changes the archived parameter values',()=>{
    const ws=fixture(),card=ws.cards[1];card.areas[0].history=['/old.png'];ws.view.xy.x.values=[25];reconcileMatrixArchive(ws.cards,ws.view.xy,ws.archivedTasks);
    assert.equal(restoreArchivedTasks(ws,new Set([card.id])),1);assert.deepEqual(ws.view.xy.x.values,[25,20]);assert.equal(parameterValue(card,'1||steps'),20);
});

test('submitted or queued tasks remain archived until their late results arrive',()=>{
    const ws=fixture(),card=ws.cards[1];card.historyRunSequence=1;ws.view.xy.x.values=[25];
    reconcileMatrixArchive(ws.cards,ws.view.xy,ws.archivedTasks);assert.equal(ws.archivedTasks[0],card);
    card.areas[0].history=['/late.png'];assert.deepEqual(ws.archivedTasks[0].areas[0].history,['/late.png']);
});

test('archived table rows cannot recreate removed tasks and restore with the original task and history',()=>{
    const ws=fixture(),card=ws.cards[1],sheet=openTableSheet(ws.cards,ws.view.table,ws.cards[0]),row=sheet.rows.find(row=>row.cardId===card.id);
    card.areas[0].history=['/saved.png'];row.values[sheet.columns[1].id]=20;
    ws.view.xy.x.values=[25,15,5];reconcileMatrixArchive(ws.cards,ws.view.xy,ws.archivedTasks,ws.view.table);
    assert.ok(!sheet.rows.includes(row));materializeTable(sheet,ws.cards);assert.ok(!ws.cards.some(item=>parameterValue(item,'1||steps')===20));
    restoreArchivedTasks(ws,new Set([card.id]));assert.equal(sheet.rows.find(item=>item.cardId===card.id),row);
    assert.equal(ws.cards.find(item=>item.id===card.id),card);assert.deepEqual(card.areas[0].history,['/saved.png']);
    const saved=normalizeWorkspace(JSON.parse(JSON.stringify(ws)));assert.equal(saved.cards.length,4);
});

test('returning to an existing parameter sheet includes newly generated matrix combinations once',()=>{
    const ws=fixture(),sheet=openTableSheet(ws.cards,ws.view.table,ws.cards[0]);
    ws.view.xy.x.values.push(30);synchronizeMatrix(ws.cards,ws.view.xy,[]);
    assert.equal(openTableSheet(ws.cards,ws.view.table,ws.cards[0]),sheet);assert.equal(sheet.rows.length,6);
    openTableSheet(ws.cards,ws.view.table,ws.cards[0]);assert.equal(sheet.rows.length,6);
});
