import test from 'node:test';
import assert from 'node:assert/strict';
import { collectPreviewRecords,sourceKey } from '../web/components/contextmenu/content/preview_records.js';
import { projectHistoryMatrix } from '../web/components/contextmenu/content/preview_history_matrix_model.js';
import { matrixCells } from '../web/components/workspace_modes/xy_model.js';

const key=name=>JSON.stringify(['1',name]);
function fixture(){
    const card=(id,values)=>({id,areas:[{id:id+'-out',type:'preview',targetNodeId:'2',title:'结果',history:values.map((_,i)=>'/view?filename='+id+'-'+i+'.png'),historyIndex:0,inputHistorySnapshots:values.map(([steps,sampler,cfg])=>['steps','sampler','cfg'].map((name,i)=>({title:name,targetNodeId:'1',targetWidget:name,value:[steps,sampler,cfg][i]})))}]});
    const cards=[card('a',[[20,'Euler',5],[30,'Euler',5]]),card('b',[[20,'DPM',5],[20,'DPM',7]]),card('c',[[20,'Euler',5]])];
    const sources=cards.map(card=>({card,area:card.areas[0]}));
    return {cards,sources,records:collectPreviewRecords(sources),config:{x:key('steps'),y:key('sampler'),z:key('cfg'),source:'',zValue:'5',filters:{}}};
}
test('history matrices project all selected task snapshots into real XYZ cells without mutating tasks',()=>{
    const h=fixture(),before=JSON.stringify(h.cards),model=projectHistoryMatrix(h.records,h.sources,h.config);
    assert.deepEqual(model.xy.x.values,[20,30]);assert.deepEqual(model.xy.y.values,['Euler','DPM']);assert.deepEqual(model.xy.z.values,[5,7]);
    assert.equal(model.cards.length,4);assert.equal(matrixCells(model.cards,model.xy).length,4);
    const group=[...model.cells.values()].find(records=>records.length===2);
    assert.deepEqual(group.map(record=>[record.cardId,record.index]),[['a',0],['c',0]]);
    assert.equal(JSON.stringify(h.cards),before);assert.ok(model.cards.every(card=>!h.cards.includes(card)));
});
test('history source and typed parameter filters exclude missing snapshots without inventing axes or records',()=>{
    const h=fixture();h.config.source=sourceKey(h.cards[1],h.cards[1].areas[0]);h.config.filters[key('cfg')]='7';
    let model=projectHistoryMatrix(h.records,h.sources,h.config);assert.equal(model.cards.length,1);assert.equal([...model.cells.values()][0][0].index,1);
    h.config.source='';h.config.filters={};
    model=projectHistoryMatrix(h.records.map(record=>({...record,parameters:new Map()})),h.sources,h.config);
    assert.equal(model.cards.length,0);assert.equal(model.xy.x.values.length,0);assert.equal(h.config.x,'');
});
test('projection retains matrix appearance and camera while deriving bindings and coordinates from history',()=>{
    const h=fixture(),model=projectHistoryMatrix(h.records,h.sources,h.config,{origin:'top',zoom:.6,panX:12,panY:34,cameraReady:true,x:{gap:20,labelAngle:45},z:{display:'all'}});
    assert.equal(model.xy.origin,'top');assert.equal(model.xy.x.gap,20);assert.equal(model.xy.x.labelAngle,45);assert.equal(model.xy.z.display,'all');
    assert.deepEqual([model.xy.zoom,model.xy.panX,model.xy.panY],[.6,12,34]);assert.deepEqual(model.xy.x.bindings,['1||steps']);
});

test('long prompt coordinates stay intact without being duplicated into unsafe HTML element identities',()=>{
    const h=fixture(),prompt='a "quoted" prompt '.repeat(2000);
    for(const record of h.records)record.parameters.set(key('steps'),{value:prompt});
    const model=projectHistoryMatrix(h.records,h.sources,h.config);
    assert.equal(model.xy.x.values[0],prompt);
    assert.ok(model.cards.every(card=>card.id.length<1000&&!card.id.includes('"')&&!card.xyOutputId.includes('"')));
});
