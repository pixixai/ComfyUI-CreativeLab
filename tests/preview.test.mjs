import assert from 'node:assert/strict';
import test from 'node:test';
import { collectPreviewRecords, snapshotParameters, parameterFields, buildResultRows, absentOutputLabel, buildXYMatrix, valueKey } from '../web/components/contextmenu/content/preview_records.js';
import { buildTableModel } from '../web/components/contextmenu/content/preview_table.js';
import { buildStandaloneHTML } from '../web/components/contextmenu/content/preview_export.js';
import { workspacePreviewSources, initialPreviewSources, sourceRecordCount, sortBrowseRecords, moveBrowseRecords } from '../web/components/contextmenu/content/preview_browse.js';

globalThis.window={location:{origin:'http://localhost:8188'}};

const snapshot=(steps=20,sampler='Euler',cfg=5)=>[
    {sourceAreaId:'steps',title:'步数',value:steps,targetNodeId:'1',targetWidget:'steps'},
    {sourceAreaId:'sampler',title:'采样器',value:sampler,targetWidgets:['1||sampler_name']},
    {sourceAreaId:'cfg',title:'CFG',value:cfg,targetNodeId:'1',targetWidget:'cfg'},
];
const keys=['steps','sampler_name','cfg'].map(widget=>JSON.stringify(['1',widget]));
function fixture() {
    const a={id:'a',type:'preview',history:['/view?filename=a.png','/view?filename=same.png','/view?filename=same.png'],historyRuns:[{id:'r1',order:1,areaIds:['a','b']},{id:'r2',areaIds:['a']},{id:'r3',areaIds:['a','b']}],inputHistorySnapshots:[snapshot(),snapshot(30),snapshot(20,'DPM++',7)]};
    const b={id:'b',type:'preview',history:['/view?filename=b.png'],historyRuns:[{id:'r1',order:1,areaIds:['a','b']}],inputHistorySnapshots:[snapshot()]};
    const card={id:'card',title:'任务 1',areas:[a,b]};
    const sources=[{card,area:a},{card,area:b}];
    return {a,b,card,sources,records:collectPreviewRecords(sources)};
}

test('multi-module records retain source, run, original history index and their own snapshot',()=>{
    const h=fixture();assert.equal(h.records.length,4);
    assert.equal(h.records[2].index,2);assert.equal(h.records[2].parameters.get(keys[1]).value,'DPM++');
    assert.equal(h.records[3].areaId,'b');assert.equal(h.records[3].runId,'r1');
    assert.notEqual(h.records[1].key,h.records[2].key);
});
test('record identities distinguish identical URLs in different modules and preserve history holes',()=>{
    const h=fixture();h.a.history[0]=null;h.b.history[0]=h.a.history[1];
    const records=collectPreviewRecords(h.sources);assert.equal(records[0].index,1);
    assert.equal(new Set(records.map(r=>r.key)).size,records.length);
});
test('records keep identity when an earlier history record is removed',()=>{
    const h=fixture();const key=h.records[2].key;
    h.a.history.shift();h.a.historyRuns.shift();h.a.inputHistorySnapshots.shift();
    assert.equal(collectPreviewRecords(h.sources)[1].key,key);
});
test('result tables join runs rather than unequal history positions and keep partial or missing outputs distinct',()=>{
    const h=fixture(),rows=buildResultRows(h.records);
    assert.equal(rows.length,3);assert.equal(rows[0].outputs.size,2);
    assert.equal(absentOutputLabel(rows[1],h.sources[1]),'未参与本次运行');
    assert.equal(absentOutputLabel(rows[2],h.sources[1]),'无可用结果');
});
test('legacy records without snapshots never borrow current module values or invent run associations',()=>{
    const h=fixture();h.a.historyRuns=[];h.a.inputHistorySnapshots=[];h.a.value='current';
    const rows=buildResultRows(collectPreviewRecords(h.sources));assert.equal(rows.length,4);assert.equal(rows[0].parameters.size,0);
});
test('identical run IDs in different cards remain separate rows',()=>{
    const h=fixture(),other={...h.card,id:'other'};
    assert.equal(buildResultRows([...h.records,...collectPreviewRecords([{card:other,area:h.b}])]).length,4);
});
test('multi-binding snapshot parameters expose concrete node/widget axes',()=>{
    const map=snapshotParameters([{title:'同步步数',value:20,targetWidgets:['1||steps','2||steps']}]);
    assert.equal(map.size,2);assert.equal(map.get(JSON.stringify(['2','steps'])).value,20);
});
test('XY cells preserve duplicate results, missing combinations and typed parameter values',()=>{
    const h=fixture(),matrix=buildXYMatrix(h.records,{x:keys[0],y:keys[1],source:h.records[0].source});
    assert.equal(matrix.xs.length,2);assert.equal(matrix.ys.length,2);assert.equal(matrix.cells.size,3);
    const duplicate={...h.records[0],key:'duplicate'};
    const m=buildXYMatrix([...h.records,duplicate],{x:keys[0],y:keys[1]});
    assert.equal(m.cells.get(JSON.stringify([valueKey(20),valueKey('Euler')])).length,3);
    assert.notEqual(valueKey(20),valueKey('20'));
});
test('Z switches XY slices while retaining common axis ranges and filtering other parameters',()=>{
    const h=fixture(),matrix=buildXYMatrix(h.records,{x:keys[0],y:keys[1],z:keys[2],zValue:valueKey(7)});
    assert.equal(matrix.zs.length,2);assert.equal(matrix.xs.length,2);assert.equal(matrix.ys.length,2);assert.equal(matrix.cells.size,1);
    const filtered=buildXYMatrix(h.records,{x:keys[0],y:keys[1],filters:{[keys[2]]:valueKey(5)}});
    assert.equal(filtered.cells.size,2);
});
test('detail table honors parameter column order and preserves all same-run images',()=>{
    const h=fixture(),model=buildTableModel(h.records,h.sources,{layout:'detail',fields:[keys[1],keys[0]]});
    assert.equal(model.rows.length,3);assert.match(model.columns.at(-1),/steps/);
    assert.equal(model.rows[0].cells[1].records.length,1);
});
test('table and comparison data processing leaves cards and history selection unchanged',()=>{
    const h=fixture(),before=JSON.stringify(h.card);
    parameterFields(h.records);buildResultRows(h.records);buildXYMatrix(h.records,{x:keys[0],y:keys[1]});
    assert.equal(JSON.stringify(h.card),before);
});
test('standalone HTML escapes metadata and references packaged local media without runtime dependencies',()=>{
    const h=fixture();h.records[0].areaLabel='<script>alert(1)</script>';
    const model=buildTableModel(h.records,h.sources,{layout:'detail',fields:keys});
    const html=buildStandaloneHTML(model,new Map(h.records.map((r,i)=>[r.url,`media/${i}.png`])));
    assert.ok(!html.includes('<script>'));assert.ok(html.includes('&lt;script&gt;'));assert.match(html,/src="media\/0.png"/);
    assert.ok(!html.includes('/extensions/'));
});

test('workspace source trees include every task output, retain empty outputs and exclude inputs',()=>{
    const h=fixture(),empty={id:'empty',type:'preview'},input={id:'input',type:'edit'};h.card.areas.push(empty,input);
    const other={id:'other',title:'另一任务',areas:[{id:'c',type:'preview',resultUrl:'/view?filename=c.png'}]};
    const sources=workspacePreviewSources([h.card,other]);assert.equal(sources.length,4);assert.equal(sources[2].area,empty);
    assert.equal(sourceRecordCount(empty),0);assert.equal(sourceRecordCount(other.areas[0]),1);
});
test('module entry selects only its sources while card entry selects every output in each selected card',()=>{
    const h=fixture(),other={id:'other',areas:[{id:'c',type:'preview',resultUrl:'/view?filename=c.png'},{id:'empty',type:'preview'}]},cards=[h.card,other];
    assert.deepEqual(initialPreviewSources(cards,[h.sources[1]],['other'],h.card.id).map(source=>source.area.id),['b']);
    assert.deepEqual(initialPreviewSources(cards,[],[h.card.id,'other'],h.card.id).map(source=>source.area.id),['a','b','c']);
    assert.deepEqual(initialPreviewSources(cards,[],[],h.card.id).map(source=>source.area.id),['a','b']);
});
test('filmstrip sorting uses recorded run order and never reorders stored module history',()=>{
    const h=fixture(),before=JSON.stringify(h.card),records=h.records;
    assert.equal(sortBrowseRecords(records,'newest')[0].runId,'r3');
    assert.equal(sortBrowseRecords(records,'oldest')[0].runId,'r1');
    assert.equal(sortBrowseRecords(records,'source'),records);assert.equal(JSON.stringify(h.card),before);
});

test('source labels match custom titles and the actual # / ## default titles',()=>{
    const cards=[{id:'one',areas:[{id:'input',type:'edit'},{id:'a',type:'preview'},{id:'b',type:'preview',title:'视频'}]},{id:'two',title:'第二任务',areas:[{id:'c',type:'preview'}]}];
    const sources=workspacePreviewSources(cards);
    assert.deepEqual(sources.map(source=>[source.cardLabel,source.areaLabel]),[['#1','##1'],['#1','视频'],['第二任务','##1']]);
});

test('custom sorting keeps duplicate URL identities, appends new records and leaves histories intact',()=>{
    const h=fixture(),before=JSON.stringify(h.card),keys=h.records.map(record=>record.key);
    const moved=moveBrowseRecords(keys,[keys[0],keys[1]],keys[3]);
    assert.deepEqual(moved,[keys[2],keys[0],keys[1],keys[3]]);
    assert.deepEqual(sortBrowseRecords(h.records,'custom',moved).map(record=>record.key),moved);
    assert.equal(JSON.stringify(h.card),before);
    assert.deepEqual(sortBrowseRecords(h.records,'custom',[keys[2]]).map(record=>record.key),[keys[2],keys[0],keys[1],keys[3]]);
});

test('custom dragging supports end insertion, preserves selection order and ignores self drops',()=>{
    const keys=['a','b','c','d','e'];
    assert.deepEqual(moveBrowseRecords(keys,['d','b']),['a','c','e','b','d']);
    assert.equal(moveBrowseRecords(keys,['b','c'],'b'),keys);
    assert.equal(moveBrowseRecords(keys,['b'],'missing'),keys);
});
