import { buildPreviewJSON } from '../web/components/contextmenu/content/preview_records.js';
import assert from 'node:assert/strict';
import test from 'node:test';
import { collectPreviewRecords, snapshotParameters, parameterFields, buildResultRows, absentOutputLabel, buildXYMatrix, valueKey } from '../web/components/contextmenu/content/preview_records.js';
import { buildTableModel } from '../web/components/contextmenu/content/preview_table.js';
import { buildStandaloneHTML } from '../web/components/contextmenu/content/preview_export.js';
import { workspaceTableSource } from '../web/components/contextmenu/content/preview_workspace_sheets.js';
import { buildWorkbook } from '../web/components/contextmenu/content/preview_xlsx.js';
import { filmstripDownloadRecords, mediaDownloadFiles, outputDownloadRecords } from '../web/components/contextmenu/content/preview_downloads.js';
import { workspacePreviewSources, initialPreviewSources, sourceRecordCount, groupBrowseRecords, sourceBrowseGroups, snapshotBrowseGroups, moveBrowseGroupRecords, browseGroupCover } from '../web/components/contextmenu/content/preview_browse.js';
import { comparisonHTML } from '../web/components/contextmenu/content/preview_compare.js';
import { reorderSourceHistories } from '../web/components/contextmenu/content/preview_history_order.js';

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
test('XY table preserves multiple results in a parameter cell',()=>{
    const h=fixture(),model=buildTableModel(h.records,h.sources,{x:keys[0],y:keys[1],filters:{}});
    assert.equal(model.rows.length,2);assert.equal(model.rows[0].cells[1].records.length,2);
});

test('table and comparison data processing leaves cards and history selection unchanged',()=>{
    const h=fixture(),before=JSON.stringify(h.card);
    parameterFields(h.records);buildResultRows(h.records);buildXYMatrix(h.records,{x:keys[0],y:keys[1]});
    assert.equal(JSON.stringify(h.card),before);
});
test('standalone HTML escapes metadata and references packaged local media without runtime dependencies',()=>{
    const h=fixture();h.records[0].areaLabel='<script>alert(1)</script>';
    const model=buildTableModel(h.records,h.sources,{x:keys[0],y:keys[1],filters:{}});
    const html=buildStandaloneHTML(model,new Map(h.records.map((r,i)=>[r.url,`media/${i}.png`])));
    assert.ok(!html.includes('<script>'));assert.ok(html.includes('&lt;script&gt;'));assert.match(html,/src="media\/0.png"/);
    assert.ok(!html.includes('/extensions/'));
});

test('parameter preview reads existing sheet order and draft values without mutating workspace cards',()=>{
    const {card,a}=fixture();
    a.tableColumnId='output';a.historyIndex=2;a.resultUrl=a.history[2];
    const sheet={id:'sheet',columns:[{id:'draft',type:'edit',title:'草稿'},{id:'output',type:'preview',title:'结果'}],rows:[
        {id:'row',cardId:card.id,values:{}},{id:'draft-row',values:{draft:false}},{id:'empty',values:{}},
    ]};
    const before=JSON.stringify({sheet,card});
    const {rows,columns}=workspaceTableSource([card],sheet);
    assert.deepEqual(columns.map(({id})=>id),['draft','output']);
    assert.equal(rows.length,3);
    assert.equal(rows[0].areas[1].historyIndex,2);
    assert.equal(rows[1].areas[0].value,false);
    assert.equal(JSON.stringify({sheet,card}),before);
});

test('XLSX stores numeric and boolean values as typed cells, and preserves text as literal strings',async()=>{
    const rows=[[{value:'任务',style:1},{value:'步数',style:1},{value:'开关',style:1}],[{value:'=文字 & <标签>',style:1},{value:0,style:2},{value:false,style:2}]];
    const file=buildWorkbook({widths:[52,180,256],heights:[40,144],rows,pictures:[]});
    const bytes=new Uint8Array(await file.arrayBuffer()),view=new DataView(bytes.buffer),decoder=new TextDecoder();
    const parts=new Map();
    for(let at=0;view.getUint32(at,true)===0x04034b50;){
        const size=view.getUint32(at+18,true),length=view.getUint16(at+26,true),extra=view.getUint16(at+28,true);
        const offset=at+30+length+extra;
        parts.set(decoder.decode(bytes.slice(at+30,at+30+length)),decoder.decode(bytes.slice(offset,offset+size)));
        at=offset+size;
    }
    const sheet=parts.get('xl/worksheets/sheet1.xml');
    assert.match(sheet,/<c r="B2" s="2"><v>0<\/v>/);
    assert.match(sheet,/<c r="C2" s="2" t="b"><v>0<\/v>/);
    assert.match(sheet,/=文字 &amp; &lt;标签&gt;/);
    assert.match(sheet,/ht="108"/);
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
test('filmstrip ranks each module independently, reverses groups and retains stored history order',()=>{
    const h=fixture();
    h.a.historyRuns[0].order=9;
    h.a.historyRuns[2].order=4;
    const before=JSON.stringify(h.card),records=collectPreviewRecords(h.sources);
    const read = order => groupBrowseRecords(records,order).map(group=>group.records.map(({areaId,runId})=>`${areaId}:${runId}`));
    assert.deepEqual(read('newest'),[['a:r1','b:r1'],['a:r3'],['a:r2']]);
    assert.deepEqual(read('oldest'),[['a:r2'],['a:r3'],['a:r1','b:r1']]);
    assert.deepEqual(read('source'),[['a:r1','a:r2','a:r3'],['b:r1']]);
    assert.equal(JSON.stringify(h.card),before);
});

test('unified media histories keep source groups while sorting records within each module',()=>{
    const h=fixture(),original=JSON.stringify(h.card);
    const read=order=>sourceBrowseGroups(h.records,order).map(group=>group.records.map(record=>record.index));
    assert.deepEqual(read('newest'),[[2,1,0],[0]]);
    assert.deepEqual(read('oldest'),[[0,1,2],[0]]);
    assert.equal(JSON.stringify(h.card),original);
});

test('source labels match custom titles and the actual # / ## default titles',()=>{
    const cards=[{id:'one',areas:[{id:'input',type:'edit'},{id:'a',type:'preview'},{id:'b',type:'preview',title:'视频'}]},{id:'two',title:'第二任务',areas:[{id:'c',type:'preview'}]}];
    const sources=workspacePreviewSources(cards);
    assert.deepEqual(sources.map(source=>[source.cardLabel,source.areaLabel]),[['#1','##1'],['#1','视频'],['第二任务','##1']]);
});

test('cross-group dragging keeps duplicate URL identities and custom membership without changing histories',()=>{
    const h=fixture(),before=JSON.stringify(h.card),keys=h.records.map(record=>record.key);
    const groups=groupBrowseRecords(h.records,'source');
    const moved=moveBrowseGroupRecords(groups,[keys[1],keys[0]],groups[1].id,keys[3]);
    const order=snapshotBrowseGroups(moved);
    assert.deepEqual(order.map(group=>group.keys),[[keys[2]],[keys[0],keys[1],keys[3]]]);
    assert.deepEqual(snapshotBrowseGroups(groupBrowseRecords(h.records,'source')),snapshotBrowseGroups(groups));
    assert.deepEqual(snapshotBrowseGroups(groupBrowseRecords(h.records,'custom',order)),order);
    assert.deepEqual(snapshotBrowseGroups(groupBrowseRecords(h.records.slice(1),'custom',order)).map(group=>group.keys),[[keys[2]],[keys[1],keys[3]]]);
    const newRecord={...h.records[2],key:'new'};
    assert.deepEqual(snapshotBrowseGroups(groupBrowseRecords([...h.records,newRecord],'custom',order)).map(group=>group.keys),[[keys[2],'new'],[keys[0],keys[1],keys[3]]]);
    assert.equal(JSON.stringify(h.card),before);
});

test('custom dragging supports end insertion and ignores self drops',()=>{
    const h=fixture(),groups=groupBrowseRecords(h.records,'source');
    const [a,b,c,d]=h.records.map(record=>record.key),[first,second]=groups;
    const keys=result=>snapshotBrowseGroups(result).map(group=>group.keys);
    assert.deepEqual(keys(moveBrowseGroupRecords(groups,[a],first.id)),[[b,c,a],[d]]);
    assert.equal(moveBrowseGroupRecords(groups,[b,c],first.id,b),groups);
    assert.equal(moveBrowseGroupRecords(groups,[b],first.id,'missing'),groups);
});

test('history reordering preserves duplicate identity, holes, active records, text and parameter/run associations',()=>{
    const h=fixture();h.a.historyRuns[2]=h.a.historyRuns[1];h.a.historyIndex=2;h.a.resultUrl=h.a.history[2];
    h.a.textHistory=['first','second','third'];h.a.textHistoryStatus=['ready','error','ready'];h.a.selectedThumbIndices=[2];
    const records=collectPreviewRecords(h.sources),groups=sourceBrowseGroups(records,'source');
    groups[0].records.reverse();
    const result=reorderSourceHistories(h.sources,groups),next=collectPreviewRecords(h.sources);
    assert.deepEqual(result.changed,['a']);assert.equal(h.a.historyIndex,0);assert.equal(h.a.resultUrl,h.a.history[0]);
    assert.deepEqual(h.a.textHistory,['third','second','first']);assert.equal(h.a.inputHistorySnapshots[0][0].value,20);
    assert.deepEqual(h.a.selectedThumbIndices,[0]);assert.equal(result.keys.get(records[2].key),next[0].key);
    assert.equal(result.keys.get(records[1].key),next[1].key);assert.equal(next[0].runId,'r2');
    h.a.history[1]=null;
    const remaining=sourceBrowseGroups(collectPreviewRecords(h.sources),'source');remaining[0].records.reverse();
    reorderSourceHistories(h.sources,remaining);assert.equal(h.a.history[1],null);
});

test('preview grouping keeps source order and internal sorting never transfers histories between modules',()=>{
    const h=fixture(),groups=sourceBrowseGroups(h.records,'source'),original=h.b.history.slice();
    const moved=moveBrowseGroupRecords(groups,[h.records[0].key],groups[1].id);
    moved[0].records.reverse();reorderSourceHistories(h.sources,moved);
    assert.deepEqual(h.b.history,original);assert.equal(h.a.history.length,3);
    const custom=snapshotBrowseGroups(moved).reverse();
    assert.deepEqual(sourceBrowseGroups(collectPreviewRecords(h.sources),'custom',custom).map(group=>group.source),groups.map(group=>group.source));
});

test('filmstrip covers default to the newest module record and fall back after filtering a pinned cover',()=>{
    const h=fixture(),[group]=groupBrowseRecords(h.records,'source');
    const [first,,latest]=group.records, covers=new Map();
    assert.equal(browseGroupCover(group,covers),latest);
    covers.set(group.id,first.key);
    assert.equal(browseGroupCover(group,covers),first);
    assert.equal(browseGroupCover({...group,records:group.records.slice(1)},covers),latest);
    const [rank]=groupBrowseRecords(h.records,'newest');
    assert.equal(browseGroupCover(rank,covers),rank.records[0]);
    assert.equal(browseGroupCover({id:'mixed',records:[h.records[3],latest,first]},new Map()),latest);
});

test('filmstrip downloads use group covers by default and expand only groups containing selected records',()=>{
    const h=fixture(),groups=groupBrowseRecords(h.records,'source');
    const [a,b,c,d]=h.records,covers=new Map([[groups[0].id,b.key]]),keys=new Set([a.key]);
    const records=(selected,history)=>filmstripDownloadRecords(groups,covers,keys,selected,history);
    assert.deepEqual(records(false,false),[b,d]);
    assert.deepEqual(records(true,false),[a]);
    assert.deepEqual(records(true,true),[a,b,c]);
    assert.deepEqual(records(false,true),[a,b,c,d]);
    keys.clear();
    assert.deepEqual(records(true,true),[]);
});

test('media export preserves actual history positions, including duplicate URLs and sparse histories',()=>{
    const h=fixture();
    const area={...h.a,history:[h.a.history[0],'',h.a.history[0]],historyIndex:2,resultUrl:h.a.history[0]};
    assert.equal(outputDownloadRecords(h.card,area,false)[0].index,2);
    const records=outputDownloadRecords(h.card,area,true);
    const files=mediaDownloadFiles([h.card],[...records,...records]);
    assert.deepEqual(files.map(file=>[file.base,file.extension]),[['001-001-001','png'],['001-001-003','png']]);
    assert.deepEqual(outputDownloadRecords(h.card,{...area,missingHistoryRun:{}},false),[]);
    assert.deepEqual(outputDownloadRecords(h.card,{...area,missingHistoryRun:{}},true),records);
});

test('preview JSON exports visible fields, typed falsy inputs, selected records and ComfyUI subfolders',()=>{
    const cards=[{id:'one',areas:[
        {id:'steps',type:'edit',title:'步数',value:0},{id:'bool',type:'edit',title:'开关',value:false},
        {id:'hidden',type:'edit',title:'隐藏字段',value:99},{id:'output',type:'preview',title:'图像'},
    ]}];
    const projected=[{...cards[0],areas:cards[0].areas.filter(area=>area.id!=='hidden')}];
    const records=[{cardId:'one',areaId:'output',url:'/view?filename=a.png&subfolder=folder%5Cchild',index:0}];
    assert.deepEqual(buildPreviewJSON(projected,records,'all',false,cards),[{'步数':0,'开关':false,'图像':'folder/child/a.png'}]);
    assert.deepEqual(buildPreviewJSON(projected,records,'input',true,cards),[{'步数':0,'开关':false}]);
    assert.deepEqual(buildPreviewJSON(projected,records,'output',true,cards),[{'图像':['folder/child/a.png']}]);
    assert.deepEqual(buildPreviewJSON(projected,[],'output',false,cards),[{'图像':''}]);
    assert.deepEqual(buildPreviewJSON([],records,'all',true,cards),[]);
});

test('combined JSON retains same-name input/output fields and skips existing numbered titles',()=>{
    const cards=[{id:'one',areas:[
        {id:'a',title:'参数',type:'edit',value:0},{id:'b',title:'参数 (2)',type:'edit',value:false},
        {id:'c',title:'参数',type:'preview'},
    ]}];
    const records=[{cardId:'one',areaId:'c',url:'/view?filename=test.png'}];
    assert.deepEqual(buildPreviewJSON(cards,records,'all',false),[{'参数':0,'参数 (2)':false,'参数 (3)':'test.png'}]);
});

test('comparison offers both drop regions before selecting media and escapes overlay labels',()=>{
    const config={layout:'side',slot:'a'},empty=comparisonHTML(null,null,config);
    assert.match(empty,/clab-compare-stage/);assert.match(empty,/拖到 A/);assert.match(empty,/拖到 B/);
    const h=fixture();h.records[0].cardLabel='<script>bad</script>';
    const html=comparisonHTML(h.records[0],h.records[1],config);
    assert.ok(!html.includes('<script>'));assert.match(html,/&lt;script&gt;/);
    assert.ok(html.indexOf('clab-compare-layout')>html.indexOf('clab-compare-status'));
});

test('exchanging A/B preserves saved video progress while choosing a new pair resets it',()=>{
    const h=fixture(),config={layout:'side',slot:'a'};
    comparisonHTML(h.records[0],h.records[1],config);
    config.playback={time:12,speed:1.5,audio:'a',playing:false};
    comparisonHTML(h.records[1],h.records[0],config);
    assert.equal(config.playback.time,12);assert.equal(config.playback.speed,1.5);
    comparisonHTML(h.records[1],h.records[2],config);assert.equal(config.playback.time,0);
});

test('mixed media pairs keep replacement controls available without creating shared video playback',()=>{
    const h=fixture(),html=comparisonHTML(h.records[0],{...h.records[1],type:'video'},{layout:'split',slot:'b'});
    assert.match(html,/请选择两张图片或两个视频/);assert.match(html,/data-compare-slot="b"/);
    assert.ok(!html.includes('data-compare-play>'));
});
