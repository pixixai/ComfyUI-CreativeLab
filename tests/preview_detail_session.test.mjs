import test from 'node:test';
import assert from 'node:assert/strict';
import { restoreDetailSession,serializeDetailSession } from '../web/components/contextmenu/content/preview_detail_session.js';
import { detailOutputRecords,detailHistoryKey } from '../web/components/contextmenu/content/preview_detail_model.js';
import { createWorkspaceView } from '../web/components/workspace_modes/view_state.js';

globalThis.window={location:{origin:'http://local'}};
const defaults={columns:3,rowWidth:960,sourceColumns:2,styles:{}};
const cards=()=>[{id:'task',areas:[{id:'prompt',type:'edit',title:'提示词'},{id:'a',type:'preview',history:['/view?filename=a.png','/view?filename=b.png']},{id:'b',type:'preview',history:['/view?filename=c.mp4']}]}];
const config=tasks=>{const value={};restoreDetailSession(tasks,value,null,defaults);return value;};

test('detail sessions round-trip as workflow data and survive workspace view normalization without mixing workspaces',()=>{
    const tasks=cards(),one=config(tasks),records=detailOutputRecords(tasks[0],tasks[0].areas[1]);
    one.outputs.set('task','b');one.covers.set('task',{areaId:'a',recordKey:records[1].key});one.histories.set(detailHistoryKey('task','a'),records[0].key);one.inputs.set('task',new Set());one.sourceColumns=4;one.rowWidth=1080;one.styles={'name:提示词':{value:{color:'#ff0000'}}};
    const saved=JSON.parse(JSON.stringify(serializeDetailSession(tasks,one))),view=createWorkspaceView({previewDetail:saved}),restored={};restoreDetailSession(tasks,restored,view.previewDetail,defaults);
    assert.equal(restored.outputs.get('task'),'b');assert.equal(restored.covers.get('task').recordKey,records[1].key);assert.equal(restored.histories.get(detailHistoryKey('task','a')),records[0].key);assert.equal(restored.inputs.get('task').size,0);assert.equal(restored.sourceColumns,4);assert.equal(restored.rowWidth,1080);assert.deepEqual(restored.styles,one.styles);
    const other=config(tasks);assert.equal(other.covers.size,0);assert.equal(other.outputs.size,0);restored.styles['name:提示词'].value.color='#00ff00';assert.equal(saved.styles['name:提示词'].value.color,'#ff0000');
});

test('removed histories, outputs, input fields and tasks clear only their stale session references',()=>{
    const tasks=cards(),value=config(tasks),records=detailOutputRecords(tasks[0],tasks[0].areas[1]);
    value.outputs.set('task','b');value.covers.set('task',{areaId:'a',recordKey:records[1].key});value.histories.set(detailHistoryKey('task','a'),records[1].key);value.media.set(detailHistoryKey('task','b'),{markdown:true});value.inputs.set('task',new Set(['prompt']));
    const saved=serializeDetailSession(tasks,value);tasks[0].areas=tasks[0].areas.filter(area=>area.id==='a');tasks[0].areas[0].history.pop();const restored={};restoreDetailSession(tasks,restored,saved,defaults);
    assert.equal(restored.covers.size,0);assert.equal(restored.outputs.size,0);assert.equal(restored.histories.size,0);assert.equal(restored.media.size,0);assert.equal(restored.inputs.get('task').size,0);assert.deepEqual([...restored.tasks],['task']);
    assert.deepEqual(serializeDetailSession([],restored).tasks,[]);assert.equal(restored.inputs.size,0);
});

test('new tasks default to checked while saved exclusions and an empty selection remain explicit',()=>{
    const tasks=cards(),value=config(tasks);value.tasks.clear();const saved=serializeDetailSession(tasks,value),next=[...tasks,{id:'new-task',areas:[]}],restored={};restoreDetailSession(next,restored,saved,defaults);assert.deepEqual([...restored.tasks],['new-task']);
});
