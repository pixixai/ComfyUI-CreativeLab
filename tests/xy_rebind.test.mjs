import test from 'node:test';
import assert from 'node:assert/strict';
import { createWorkspaceView } from '../web/components/workspace_modes/view_state.js';
import { synchronizeMatrix, rebindMatrixAxis, changeAxisBindings, rebindMatrixOutput, validateMatrixValues } from '../web/components/workspace_modes/xy_model.js';
import { reconcileMatrixArchive, restoreArchivedTasks } from '../web/components/workspace_modes/xy_archive.js';
import { parameterValue } from '../web/components/workspace_modes/task_model.js';
import { prepareWorkspaceCopy } from '../web/components/workspace_copy.js';
import { createEditHistory } from '../web/components/edit_history.js';

const parameters=[{key:'1||steps',type:'number',value:20},{key:'1||sampler',type:'string',value:'A',choices:['A','B','C']},{key:'3||sampler',type:'string',value:'C',choices:['A','B','C']}];
function fixture(){
    const ws={id:'ws',cards:[],archivedTasks:[],view:createWorkspaceView({mode:'xy',xy:{initialized:true,x:{bindings:['1||steps'],values:[10,20]},y:{bindings:['1||sampler'],values:['A','B','C'],inputText:'["A", "B", "C"]'},outputNodeId:'2'}})};
    synchronizeMatrix(ws.cards,ws.view.xy,parameters);return ws;
}
const commit=ws=>{reconcileMatrixArchive(ws.cards,ws.view.xy,ws.archivedTasks,ws.view.table);synchronizeMatrix(ws.cards,ws.view.xy,parameters);};
const bind=(ws,name,keys)=>rebindMatrixAxis(ws.cards,ws.view.xy,name,keys,parameters,ws.archivedTasks,ws.view.table);

test('same-type replacement preserves every value, order and exact input syntax without empty archives',()=>{
    const ws=fixture(),ids=ws.cards.map(card=>card.id),text=ws.view.xy.y.inputText;
    bind(ws,'y',['3||sampler']);commit(ws);
    assert.deepEqual(ws.view.xy.y.values,['A','B','C']);assert.equal(ws.view.xy.y.inputText,text);
    assert.deepEqual(ws.cards.map(card=>card.id),ids);assert.deepEqual(ws.cards.map(card=>parameterValue(card,'3||sampler')),['A','A','B','B','C','C']);
    assert.equal(ws.archivedTasks.length,0);ws.view.xy.y.values=['A'];commit(ws);assert.equal(ws.archivedTasks.length,0);assert.equal(ws.cards.length,2);
});

test('unchecking before selecting a new binding retains the draft across saving and reopening',()=>{
    const ws=fixture(),text=ws.view.xy.y.inputText;
    bind(ws,'y',[]);commit(ws);ws.view=createWorkspaceView(JSON.parse(JSON.stringify(ws.view)));
    assert.deepEqual(ws.view.xy.y.values,['A','B','C']);assert.equal(ws.view.xy.y.inputText,text);
    bind(ws,'y',['3||sampler']);commit(ws);
    assert.deepEqual(ws.view.xy.y.values,['A','B','C']);assert.equal(ws.cards.length,6);assert.equal(ws.archivedTasks.length,0);
});

test('invalid destination choices stay visible as values and prevent execution until corrected',()=>{
    const ws=fixture(),limited=parameters.map(p=>p.key==='3||sampler'?{...p,choices:['A']}:p);
    rebindMatrixAxis(ws.cards,ws.view.xy,'y',['3||sampler'],limited,ws.archivedTasks);
    assert.deepEqual(ws.view.xy.y.values,['A','B','C']);assert.throws(()=>validateMatrixValues(ws.view.xy,limited),/当前选项/);
    ws.view.xy.y.values=['A'];assert.doesNotThrow(()=>validateMatrixValues(ws.view.xy,limited));
    const axis={bindings:['old'],values:[1,2],inputText:'1,2'};changeAxisBindings(axis,['new'],[{key:'new',type:'number',value:9}]);assert.equal(axis.inputText,'1,2');assert.deepEqual(axis.values,[1,2]);
});

test('rebinding archives completed and queued tasks before changing their inputs or output provenance',()=>{
    const ws=fixture(),generated=ws.cards[0],queued=ws.cards[1],output=generated.areas[0];
    output.history=['/old.png'];output.inputHistorySnapshots=[[{targetNodeId:'1',value:'A'}]];queued.historyRunSequence=1;
    const original=JSON.stringify(generated.areas);bind(ws,'y',['3||sampler']);commit(ws);
    assert.equal(ws.cards.length,6);assert.equal(ws.archivedTasks.length,2);assert.equal(JSON.stringify(generated.areas),original);
    assert.ok(!ws.cards.includes(generated)&&ws.archivedTasks.includes(queued));queued.areas[0].history=['/late.png'];
    bind(ws,'y',['1||sampler']);commit(ws);
    assert.equal(ws.cards.length,6);assert.equal(ws.archivedTasks.length,0);assert.equal(ws.cards.find(c=>c.id===generated.id),generated);
    assert.equal(generated.areas[0],output);assert.deepEqual(queued.areas[0].history,['/late.png']);
});

test('output replacement archives old results and restoring incompatible bindings is explicit',()=>{
    const ws=fixture(),card=ws.cards[0];card.areas[0].history=['/old.png'];
    rebindMatrixOutput(ws.cards,ws.view.xy,'4',ws.archivedTasks,ws.view.table);commit(ws);
    assert.ok(ws.archivedTasks.includes(card));assert.equal(card.areas[0].targetNodeId,'2');assert.equal(ws.cards.length,6);
    assert.throws(()=>restoreArchivedTasks(ws,new Set([card.id])),/绑定与当前矩阵不同/);
    rebindMatrixOutput(ws.cards,ws.view.xy,'2',ws.archivedTasks,ws.view.table);commit(ws);
    assert.equal(ws.cards.length,6);assert.ok(ws.cards.includes(card));assert.equal(ws.archivedTasks.length,0);
});

test('clearing the output keeps old media archived until the original output is chosen again',()=>{
    const ws=fixture(),card=ws.cards[0];card.areas[0].history=['/original.png'];
    rebindMatrixOutput(ws.cards,ws.view.xy,'',ws.archivedTasks,ws.view.table);commit(ws);
    assert.ok(ws.archivedTasks.includes(card));assert.equal(card.areas[0].targetNodeId,'2');
    rebindMatrixOutput(ws.cards,ws.view.xy,'2',ws.archivedTasks,ws.view.table);commit(ws);
    assert.ok(ws.cards.includes(card));assert.equal(ws.cards.length,6);assert.equal(ws.archivedTasks.length,0);
});

test('programmatic rebinding does not erase the evidence of a manually edited parameter task',()=>{
    const ws=fixture(),card=ws.cards[0];card.title='手动命名';
    bind(ws,'y',['3||sampler']);commit(ws);ws.view.xy.y.values=['B','C'];commit(ws);
    assert.ok(ws.archivedTasks.includes(card));assert.equal(card.title,'手动命名');
});

test('copying a running matrix keeps completed media but has no inherited submissions or empty queued archives',()=>{
    const source=fixture(),generated=source.cards[0],queued=source.cards[1];
    generated.areas[0].history=['/complete.png'];generated.areas[0].historyRuns=[{id:'finished',order:2}];generated.historyRunSequence=3;queued.historyRunSequence=1;
    source.view.xy.y.values=['B','C'];commit(source);assert.equal(source.archivedTasks.length,2);
    const copy=prepareWorkspaceCopy(structuredClone(source));copy.id='copy';
    assert.equal(copy.archivedTasks.length,1);assert.equal(copy.archivedTasks[0].id,generated.id);assert.deepEqual(copy.archivedTasks[0].areas[0].history,['/complete.png']);
    assert.ok([...copy.cards,...copy.archivedTasks].every(card=>!Object.hasOwn(card,'historyRunSequence')));
    bind(copy,'y',['3||sampler']);commit(copy);copy.view.xy.y.values=['B'];commit(copy);
    assert.equal(copy.archivedTasks.length,1);assert.equal(source.archivedTasks.length,2);assert.equal(queued.historyRunSequence,1);
});

test('undoing generated matrix combinations archives results and redo restores the same task once',()=>{
    const ws=fixture(),state={activeWorkspaceId:ws.id,workspaces:[ws]},history=createEditHistory();
    ws.view.xy.y.values=['A','B'];commit(ws);history.clear(state);
    ws.view.xy.y.values.push('C');commit(ws);history.record(state);
    const added=ws.cards.filter(card=>parameterValue(card,'1||sampler')==='C');added[0].areas[0].history=['/c.png'];added[1].historyRunSequence=1;
    history.undo(state);commit(ws);assert.equal(ws.cards.length,4);assert.equal(ws.archivedTasks.length,2);
    added[1].areas[0].history=['/late.png'];history.redo(state);commit(ws);
    assert.equal(ws.cards.length,6);assert.equal(ws.archivedTasks.length,0);assert.ok(added.every(card=>ws.cards.includes(card)));
    assert.deepEqual(added[1].areas[0].history,['/late.png']);
    history.undo(state);commit(ws);history.record(state);assert.equal(ws.archivedTasks.length,2);
    ws.view.xy.y.values.push('C');commit(ws);assert.equal(ws.cards.length,6);assert.equal(ws.archivedTasks.length,0);
});

test('undo discards untouched placeholders but retains results after a new branch and persistence',()=>{
    const ws=fixture(),state={activeWorkspaceId:ws.id,workspaces:[ws]},history=createEditHistory();
    ws.view.xy.y.values=['A','B'];commit(ws);history.clear(state);
    ws.view.xy.y.values.push('C');commit(ws);history.record(state);history.undo(state);commit(ws);
    assert.equal(ws.cards.length,4);assert.equal(ws.archivedTasks.length,0);
    history.redo(state);commit(ws);ws.cards.find(card=>parameterValue(card,'1||sampler')==='C').areas[0].history=['/saved.png'];
    history.undo(state);commit(ws);ws.cards[0].title='another branch';history.record(state);
    assert.equal(history.canRedo,false);const saved=JSON.parse(JSON.stringify(ws));assert.equal(saved.archivedTasks.length,1);assert.deepEqual(saved.archivedTasks[0].areas[0].history,['/saved.png']);
});
