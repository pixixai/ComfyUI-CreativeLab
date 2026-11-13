import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorkspaceView} from '../web/components/workspace_modes/view_state.js';
import {archiveTasks} from '../web/components/workspace_modes/task_archive.js';
import {restoreArchivedTasks} from '../web/components/workspace_modes/xy_archive.js';
import {removeTableTracks} from '../web/components/workspace_modes/table_structure.js';
import {openTableSheet} from '../web/components/workspace_modes/table_sheet.js';
import {createEditHistory} from '../web/components/edit_history.js';

const fixture=()=>({id:'ws',name:'表格',view:createWorkspaceView({mode:'table'}),archivedTasks:[],cards:[0,1].map(i=>({id:'c'+i,areas:[{id:'i'+i,type:'edit',value:i,targetNodeId:'1',targetWidgets:['1||steps']},{id:'o'+i,type:'preview',targetNodeId:'2',history:['result.png'],resultUrl:'result.png'}]}))});
test('deleted table tasks archive their original row, values, binding, history, dimensions and appearance',()=>{
    const ws=fixture(),card=ws.cards[0],sheet=openTableSheet(ws.cards,ws.view.table,card),row=sheet.rows[0],id=row.id;
    ws.view.table.heights[id]=222;ws.view.table.rowPaddings[id]={top:4,bottom:5,left:6,right:7};ws.view.table.appearanceOrder.padding['row:'+id]=4;ws.view.table.appearanceOrder.sequence=4;sheet.cellAppearance={[JSON.stringify([id,sheet.columns[0].id])]:{alignment:{value:8,order:3}}};
    removeTableTracks(sheet,ws.cards,ws.view,'row',0,1,ws.archivedTasks);assert.equal(ws.archivedTasks[0],card);assert.equal(ws.cards.length,1);assert.equal(ws.view.table.heights[id],undefined);
    restoreArchivedTasks(ws,new Set([card.id]));assert.equal(ws.cards[0],card);assert.equal(sheet.rows[0],row);assert.equal(ws.view.table.heights[id],222);assert.equal(ws.view.table.rowPaddings[id].left,6);assert.equal(sheet.cellAppearance[JSON.stringify([id,sheet.columns[0].id])].alignment.value,8);assert.deepEqual(card.areas[1].history,['result.png']);
});
test('blank cards and drafts do not accumulate in the archive; false/zero and bindings are preserved',()=>{
    const ws=fixture();ws.cards.push({id:'empty',areas:[]},{id:'bool',areas:[{id:'b',type:'edit',value:false}]});archiveTasks(ws,new Set(ws.cards.map(card=>card.id)));assert.deepEqual(ws.archivedTasks.map(card=>card.id),['c0','c1','bool']);assert.equal(ws.cards.length,0);
});
test('table deletion can undo/redo the archive move without duplicating tasks or losing outputs',()=>{
    const ws=fixture(),state={workspaces:[ws]},sheet=openTableSheet(ws.cards,ws.view.table,ws.cards[0]),card=ws.cards[0],history=createEditHistory();history.clear(state);
    sheet.rows.push({id:'blank',values:{}});history.rebase(state);
    removeTableTracks(sheet,ws.cards,ws.view,'row',0,1,ws.archivedTasks);history.record(state);card.areas[1].history.push('late.png');history.undo(state);assert.equal(ws.cards[0],card);assert.equal(ws.archivedTasks.length,0);assert.equal(sheet.rows.length,3);assert.deepEqual(card.areas[1].history,['result.png','late.png']);history.redo(state);assert.equal(ws.cards.length,1);assert.equal(ws.archivedTasks[0],card);
    restoreArchivedTasks(ws,new Set([card.id]));assert.equal(sheet.rows[0].cardId,card.id);
});
test('batch archiving retains row order even when sheet rows differ from card order',()=>{
    const ws=fixture();for(const i of [2,3])ws.cards.push({id:'c'+i,areas:[{id:'i'+i,type:'edit',value:i},{id:'o'+i,type:'preview'}]});
    const sheet=openTableSheet(ws.cards,ws.view.table,ws.cards[0]);sheet.rows.reverse();const ids=sheet.rows.map(row=>row.id);
    archiveTasks(ws,new Set(['c1','c2']));restoreArchivedTasks(ws,new Set(['c1','c2']));
    assert.deepEqual(ws.cards.map(card=>card.id),['c0','c1','c2','c3']);assert.deepEqual(sheet.rows.map(row=>row.id),ids);
});
