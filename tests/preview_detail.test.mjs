import test from 'node:test';
import assert from 'node:assert/strict';
import { buildDetailCards, detailInputs, detailFields, detailHistoryKey, detailFieldKey, detailStyle, detailFieldsHTML, setDetailStyle, transformDetailText, detailCardWidth, detailExportRange, detailInputGroups, setDetailInputVisible, detailOutputGroups, setDetailCover, detailCoverApplied, applyDetailOutput } from '../web/components/contextmenu/content/preview_detail_model.js';
import { modelResourcePaths } from '../web/components/modules/media_types/model_loader.js';
import { captureCardInputSnapshot, restoreCardInputsFromSnapshot } from '../web/components/modules/media_types/media_utils.js';

function fixture() {
    const input={id:'prompt',type:'edit',title:'提示词',value:'CURRENT SECRET'},steps={id:'steps',type:'edit',title:'步数',value:99};
    const snap=value=>[{sourceAreaId:'prompt',title:'提示词',value},{sourceAreaId:'steps',title:'步数',value:20,targetWidgets:['1||steps','2||steps']}];
    const a={id:'a',type:'preview',history:['/view?filename=a.png','/view?filename=b.png'],historyIndex:0,inputHistorySnapshots:[snap('第一条'),snap('第二条')],historyRuns:[{id:'r1'},{id:'r2'}]};
    const b={id:'b',type:'preview',history:['/view?filename=c.png'],historyIndex:0,inputHistorySnapshots:[snap('单独运行')],historyRuns:[{id:'solo'}]};
    const card={id:'task',title:'任务',areas:[input,steps,a,b]},config={tasks:new Set(['task']),outputs:new Map(),covers:new Map(),inputs:new Map(),histories:new Map(),styles:{},scope:'field',fieldNames:new Map([[detailFieldKey('task','prompt'),'提示词'],[detailFieldKey('task','steps'),'步数']])};
    return {card,input,steps,a,b,config};
}

test('detail creates one card per selected task and defaults to the first output with every input',()=>{
    const h=fixture(),cards=buildDetailCards([h.card],h.config);
    assert.equal(cards.length,1);assert.equal(cards[0].area,h.a);assert.equal(cards[0].fields.length,2);assert.equal(cards[0].fields[0].value,'第一条');
    assert.equal(cards[0].fields.filter(field=>field.title==='步数').length,1);
});
test('detail history changes use stable record identities and never mutate workspace values or selection',()=>{
    const h=fixture(),before=JSON.stringify(h.card),first=buildDetailCards([h.card],h.config)[0];
    h.config.histories.set(detailHistoryKey('task','a'),first.records[1].key);
    assert.equal(buildDetailCards([h.card],h.config)[0].fields[0].value,'第二条');assert.equal(JSON.stringify(h.card),before);
    h.a.history.unshift('/view?filename=earlier.png');h.a.historyRuns.unshift({id:'earlier'});h.a.inputHistorySnapshots.unshift(null);
    assert.equal(buildDetailCards([h.card],h.config)[0].record.key,first.records[1].key);
});
test('switching a task output uses that output history and snapshot even when it was run independently',()=>{
    const h=fixture();h.config.outputs.set('task','b');const item=buildDetailCards([h.card],h.config)[0];
    assert.equal(item.area,h.b);assert.equal(item.fields[0].value,'单独运行');assert.equal(item.record.runId,'solo');
});
test('missing snapshots never substitute live inputs; tasks without results explicitly use their current parameters',()=>{
    const h=fixture();h.a.inputHistorySnapshots[0]=null;
    assert.ok(buildDetailCards([h.card],h.config)[0].fields.every(field=>field.missing&&field.value==='参数未记录'));
    h.a.history=[];delete h.a.resultUrl;const item=buildDetailCards([h.card],h.config)[0];
    assert.equal(item.current,true);assert.equal(item.fields[0].value,'CURRENT SECRET');
});
test('detail source selections hide individual input fields without expanding a multi-bound input into rows',()=>{
    const h=fixture();h.config.inputs.set('task',new Set(['steps']));const fields=buildDetailCards([h.card],h.config)[0].fields;
    assert.equal(fields.length,1);assert.equal(fields[0].value,'20');assert.equal(fields[0].title,'步数');
});
test('deleted historical inputs remain available and renamed inputs use their historical title',()=>{
    const h=fixture();h.card.areas=h.card.areas.filter(area=>area!==h.steps);h.input.title='当前新标题';
    assert.ok(detailInputs(h.card).some(field=>field.id==='steps'&&field.historical));
    assert.equal(detailFields(h.card,buildDetailCards([h.card],h.config)[0].record,h.config)[0].title,'提示词');
});
test('style scopes distinguish instances and matching field names, with independent key/value styles',()=>{
    const h=fixture(),field={id:'prompt',title:'提示词'};
    setDetailStyle(h.config,'task',field,'key','color','#00ff00');
    assert.equal(detailStyle(h.config,'task',field).key.color,'#00ff00');assert.equal(detailStyle(h.config,'other',field).key.color,'#999999');
    h.config.scope='name';setDetailStyle(h.config,'task',field,'key','color','#ffffff');
    assert.equal(detailStyle(h.config,'task',field).key.color,'#ffffff');assert.equal(detailStyle(h.config,'other',field).key.color,'#ffffff');
    assert.equal(detailStyle(h.config,'task',field).value.color,'#999999');
    assert.equal(detailStyle(h.config,'task',{id:'steps',title:'步数'}).key.color,'#999999');
});
test('text presentation escapes markup and preserves raw values during casing and typography changes',()=>{
    const h=fixture();h.config.styles.all={row:{layout:'block',align:'justify'},value:{case:'upper',bold:true,underline:true,strike:true}};
    const record=buildDetailCards([h.card],h.config)[0].record;record.snapshot[0].value='<img onerror=alert(1)> mixed 中文';
    const fields=detailFields(h.card,record,h.config),html=detailFieldsHTML(fields);
    assert.ok(!html.includes('<img'));assert.ok(html.includes('&lt;IMG'));assert.match(html,/text-align-last:left/);assert.match(html,/underline line-through/);assert.match(html,/display:block/);
    assert.equal(fields[0].value,'<img onerror=alert(1)> mixed 中文');
    assert.equal(transformDetailText('hELLO wORLD 中文','capitalize'),'Hello World 中文');
});
test('model export discovers external buffers, images, OBJ materials and MTL textures while skipping embedded data',()=>{
    const json=new TextEncoder().encode(JSON.stringify({buffers:[{uri:'mesh.bin'}],images:[{uri:'textures/中文.png'},{uri:'data:image/png;base64,AA'}]}));
    assert.deepEqual(modelResourcePaths(json.buffer,'gltf'),['mesh.bin','textures/中文.png']);
    const obj=new TextEncoder().encode('mtllib test.mtl\nv 0 0 0\n');assert.deepEqual(modelResourcePaths(obj.buffer,'obj'),['test.mtl']);
    const mtl=new TextEncoder().encode('map_Kd texture.png\nmap_bump -bm 0.2 normal.png\n');assert.deepEqual(modelResourcePaths(mtl.buffer,'mtl'),['texture.png','normal.png']);
});

test('new history snapshots include unbound descriptive inputs and restore their own values',()=>{
    const h=fixture(),snapshots=captureCardInputSnapshot(h.card);
    assert.equal(snapshots.length,2);assert.equal(snapshots[0].value,'CURRENT SECRET');assert.equal(snapshots[0].sourceAreaId,'prompt');
    h.input.value='Changed after generation';restoreCardInputsFromSnapshot(h.card,snapshots);
    assert.equal(h.input.value,'CURRENT SECRET');assert.equal(h.input.targetWidget,null);
});

test('detail row width includes gaps and stays fixed while columns divide the remaining space',()=>{
    for(const columns of [1,2,3,8]){const config={rowWidth:960,columns};assert.ok(Math.abs(detailCardWidth(config)*columns+(columns-1)*16-960)<1e-8);}
});

test('detail spacing belongs to the following visible field and never adds a trailing gap',()=>{
    const h=fixture(),field={id:'prompt',title:'提示词'};
    setDetailStyle(h.config,'task',field,'row','lineHeight',2.1);setDetailStyle(h.config,'task',field,'row','gap',24);
    setDetailStyle(h.config,'task',{id:'steps',title:'步数'},'row','gap',80);
    const fields=buildDetailCards([h.card],h.config)[0].fields,html=detailFieldsHTML(fields);
    assert.match(html,/line-height:2.1;margin-bottom:24px/);assert.match(html,/data-detail-field="steps"[^>]*margin-bottom:0px/);
    h.config.inputs.set('task',new Set(['prompt']));
    assert.match(detailFieldsHTML(buildDetailCards([h.card],h.config)[0].fields),/line-height:2.1;margin-bottom:0px/);
    assert.equal(detailStyle(h.config,'task',field).row.gap,24);
});

test('Key/Value gaps render only in block layout and retain their setting when switching back to inline',()=>{
    const h=fixture(),field={id:'prompt',title:'提示词'};
    setDetailStyle(h.config,'task',field,'row','blockGap',18);
    const keyCSS=()=>detailFieldsHTML(buildDetailCards([h.card],h.config)[0].fields).match(/class="clab-detail-key" style="([^"]*)"/)[1];
    assert.match(keyCSS(),/display:inline;margin-bottom:0px/);
    setDetailStyle(h.config,'task',field,'row','layout','block');assert.match(keyCSS(),/display:block;margin-bottom:18px/);
    setDetailStyle(h.config,'task',field,'row','layout','inline');assert.match(keyCSS(),/display:inline;margin-bottom:0px/);
    assert.equal(detailStyle(h.config,'task',field).row.blockGap,18);
});

test('PNG ranges default to every visible card and normalize inclusive one-based positions',()=>{
    assert.deepEqual(detailExportRange({},5),{start:1,end:5});
    assert.deepEqual(detailExportRange({exportStart:2,exportEnd:4},5),{start:2,end:4});
    assert.deepEqual(detailExportRange({exportStart:3,exportEnd:null},8),{start:3,end:8});
    assert.deepEqual(detailExportRange({exportStart:-2,exportEnd:99},5),{start:1,end:5});
    assert.deepEqual(detailExportRange({exportStart:4,exportEnd:2},5),{start:4,end:2});
});

test('shared input visibility groups only matching names from checked task sources and preserves other fields and task data',()=>{
    const h=fixture(),other={id:'other',areas:[{id:'other-prompt',type:'edit',title:'提示词',value:'Other prompt'},{id:'other-steps',type:'edit',title:'步数',value:30}]},excluded={id:'excluded',areas:[{id:'excluded-prompt',type:'edit',title:'提示词',value:'Excluded'}]},cards=[h.card,other,excluded],before=JSON.stringify(cards);
    h.config.tasks.add('other');h.config.inputs.set('other',new Set(['other-steps']));
    let group=detailInputGroups(cards,h.config).get('提示词');
    assert.equal(group.shown,1);assert.deepEqual(group.matches.map(({card,field})=>[card.id,field.id]),[['task','prompt'],['other','other-prompt']]);
    for(const {card,field} of group.matches)setDetailInputVisible(h.config,card,field.id,true);
    assert.equal(detailInputGroups(cards,h.config).get('提示词').shown,2);
    group=detailInputGroups(cards,h.config).get('提示词');for(const {card,field} of group.matches)setDetailInputVisible(h.config,card,field.id,false);
    assert.equal(detailInputGroups(cards,h.config).get('提示词').shown,0);
    assert.equal(h.config.inputs.get('task').has('steps'),true);assert.equal(h.config.inputs.get('other').has('other-steps'),true);
    assert.equal(h.config.inputs.has('excluded'),false);assert.equal(JSON.stringify(cards),before);
});

test('shared input visibility includes duplicate names and retained historical fields using stable field IDs',()=>{
    const h=fixture();h.card.areas.push({id:'extra-prompt',type:'edit',title:'提示词',value:'Second prompt'});h.card.areas=h.card.areas.filter(area=>area!==h.steps);
    const groups=detailInputGroups([h.card],h.config),prompts=groups.get('提示词');assert.equal(prompts.matches.length,2);
    for(const {card,field} of prompts.matches)setDetailInputVisible(h.config,card,field.id,false);
    assert.equal(detailInputGroups([h.card],h.config).get('提示词').shown,0);
    setDetailInputVisible(h.config,h.card,'prompt',true);assert.equal(detailInputGroups([h.card],h.config).get('提示词').shown,1);
    const historical=groups.get('步数').matches[0];assert.equal(historical.field.historical,true);
    setDetailInputVisible(h.config,historical.card,historical.field.id,false);assert.equal(detailInputGroups([h.card],h.config).get('步数').shown,0);
    assert.equal(h.card.areas.some(area=>area.id==='steps'),false);
});

test('shared output switching matches names only in checked tasks and leaves missing outputs and workspace data untouched',()=>{
    const h=fixture();h.a.title='图片';h.b.title='视频';
    const other={id:'other',areas:[{id:'other-image',type:'preview',title:'图片'},{id:'other-video',type:'preview',title:'视频'}]},missing={id:'missing',areas:[{id:'model',type:'preview',title:'模型'}]},excluded={id:'excluded',areas:[{id:'excluded-video',type:'preview',title:'视频'}]},cards=[h.card,other,missing,excluded],before=JSON.stringify(cards);
    h.config.tasks.add('other');h.config.tasks.add('missing');
    const group=detailOutputGroups(cards,h.config).get('视频');assert.equal(group.shown,0);
    assert.deepEqual(group.matches.map(({card,area})=>[card.id,area.id]),[['task','b'],['other','other-video']]);
    for(const {card,area} of group.matches)h.config.outputs.set(card.id,area.id);
    assert.equal(detailOutputGroups(cards,h.config).get('视频').shown,2);
    assert.deepEqual(buildDetailCards(cards,h.config).map(item=>item.area.id),['b','other-video','model']);
    assert.equal(h.config.outputs.has('excluded'),false);assert.equal(h.config.outputs.has('missing'),false);assert.equal(JSON.stringify(cards),before);
});

test('shared output switching uses default output ordinals and retains an already selected duplicate title',()=>{
    const h=fixture();h.card.areas.push({...h.b,id:'duplicate',title:'视频'});h.b.title='视频';
    let group=detailOutputGroups([h.card],h.config).get('视频');assert.equal(group.matches.length,1);assert.equal(group.matches[0].area.id,'b');
    h.config.outputs.set('task','duplicate');group=detailOutputGroups([h.card],h.config).get('视频');
    assert.equal(group.matches[0].area.id,'duplicate');assert.equal(group.shown,1);
    assert.equal(detailOutputGroups([h.card],h.config).get('##1').matches[0].area.id,'a');
    delete h.b.title;assert.equal(detailOutputGroups([h.card],h.config).get('##2').matches[0].area.id,'b');
    h.config.outputs.set('task','deleted');assert.equal(detailOutputGroups([h.card],h.config).get('##1').shown,1);
});

test('switching shared output groups restores each output history and its own snapshot without changing workspace history',()=>{
    const h=fixture(),before=JSON.stringify(h.card),first=buildDetailCards([h.card],h.config)[0];
    h.config.histories.set(detailHistoryKey('task','a'),first.records[1].key);
    for(const title of ['##2','##1','##2']){
        for(const {card,area} of detailOutputGroups([h.card],h.config).get(title).matches)h.config.outputs.set(card.id,area.id);
        const item=buildDetailCards([h.card],h.config)[0];assert.equal(item.fields[0].value,title==='##1'?'第二条':'单独运行');
    }
    assert.equal(JSON.stringify(h.card),before);assert.equal(h.a.historyIndex,0);
});

test('cover selection is independent of output selection, history and historical parameter snapshots',()=>{
    const h=fixture(),before=JSON.stringify(h.card);setDetailCover(h.config,h.card,h.b);
    let item=buildDetailCards([h.card],h.config)[0];assert.equal(item.coverArea,h.b);assert.equal(item.coverRecord.runId,'solo');assert.equal(item.customCover,true);assert.equal(item.area,h.a);assert.equal(item.fields[0].value,'第一条');
    h.config.histories.set(detailHistoryKey('task','a'),item.records[1].key);item=buildDetailCards([h.card],h.config)[0];
    assert.equal(item.coverRecord.runId,'solo');assert.equal(item.fields[0].value,'第二条');assert.equal(JSON.stringify(h.card),before);
});

test('default covers follow the current preview; explicit covers pin a stable record from the same output',()=>{
    const h=fixture();let item=buildDetailCards([h.card],h.config)[0];assert.equal(item.coverRecord,item.record);assert.equal(item.customCover,false);
    setDetailCover(h.config,h.card,h.a,item.records[0]);h.config.histories.set(detailHistoryKey('task','a'),item.records[1].key);
    h.a.history.push('/view?filename=new.png');h.a.historyRuns.push({id:'new'});h.a.inputHistorySnapshots.push(null);
    item=buildDetailCards([h.card],h.config)[0];assert.equal(item.coverRecord.runId,'r1');assert.equal(item.record.runId,'r2');
    h.config.covers.delete('task');item=buildDetailCards([h.card],h.config)[0];assert.equal(item.coverRecord,item.record);
});

test('cover selection skips empty sources and recovers a usable cover when a record or output is removed',()=>{
    const h=fixture();assert.equal(setDetailCover(h.config,h.card,{id:'empty',type:'preview'}),false);assert.equal(h.config.covers.size,0);
    setDetailCover(h.config,h.card,h.a);h.a.history.pop();h.a.historyRuns.pop();
    assert.equal(buildDetailCards([h.card],h.config)[0].coverRecord.runId,'r1');
    h.card.areas=h.card.areas.filter(area=>area!==h.a);const item=buildDetailCards([h.card],h.config)[0];assert.equal(item.customCover,false);assert.equal(item.coverRecord,item.record);
});

test('batch cover application matches checked tasks by output name and uses their own latest records without changing content',()=>{
    const h=fixture();h.b.title='封面图';const other={id:'other',areas:[{...h.a,id:'other-output',title:'默认'},{...h.b,id:'other-cover',title:'封面图',history:['/view?filename=other.png'],historyRuns:[{id:'other-run'}]}]},excluded={id:'excluded',areas:[{...h.b,id:'excluded-cover',title:'封面图'}]},missing={id:'missing',areas:[{...h.a,id:'model',title:'其他'}]};
    const cards=[h.card,other,excluded,missing],before=JSON.stringify(cards);h.config.tasks.add('other');h.config.tasks.add('missing');applyDetailOutput(cards,h.config,'封面图','cover');
    const items=buildDetailCards(cards,h.config);assert.equal(items[0].coverRecord.runId,'solo');assert.equal(items[1].coverRecord.runId,'other-run');assert.equal(items[0].area,h.a);assert.equal(items[1].area.id,'other-output');assert.equal(items[2].customCover,false);assert.equal(h.config.covers.has('excluded'),false);assert.equal(JSON.stringify(cards),before);
});

test('batch output application preserves pinned covers and remembered histories, while new sources use their own latest record',()=>{
    const h=fixture();h.a.title='结果';h.b.title='另一结果';setDetailCover(h.config,h.card,h.b);applyDetailOutput([h.card],h.config,'结果','output');
    let item=buildDetailCards([h.card],h.config)[0];assert.equal(item.record.runId,'r2');assert.equal(item.coverRecord.runId,'solo');
    h.config.histories.set(detailHistoryKey('task','a'),item.records[0].key);applyDetailOutput([h.card],h.config,'结果','output');assert.equal(buildDetailCards([h.card],h.config)[0].record.runId,'r1');
});

test('batch cover cancellation clears only checked matching covers and leaves preview selections and histories intact',()=>{
    const h=fixture();h.b.title='封面';h.a.title='结果';
    const other={id:'other',areas:[{...h.a,id:'other-result'},{...h.b,id:'other-cover'}]},excluded={id:'excluded',areas:[{...h.b,id:'excluded-cover'}]},empty={id:'empty',areas:[{id:'empty-cover',type:'preview',title:'封面'}]},cards=[h.card,other,excluded,empty],before=JSON.stringify(cards);
    h.config.tasks.add('other');h.config.tasks.add('empty');setDetailCover(h.config,excluded,excluded.areas[0]);
    assert.equal(detailCoverApplied(cards,h.config,'封面'),false);
    applyDetailOutput(cards,h.config,'封面','cover');assert.equal(detailCoverApplied(cards,h.config,'封面'),true);
    setDetailCover(h.config,h.card,h.a);assert.equal(detailCoverApplied(cards,h.config,'封面'),false);
    const preview=buildDetailCards(cards,h.config).map(item=>[item.id,item.record?.key]),histories=[...h.config.histories];
    applyDetailOutput(cards,h.config,'封面','clear-cover');
    assert.equal(h.config.covers.get('task').areaId,'a');assert.equal(h.config.covers.has('other'),false);assert.equal(h.config.covers.get('excluded').areaId,'excluded-cover');
    assert.equal(detailCoverApplied(cards,h.config,'封面'),false);assert.equal(detailCoverApplied(cards,h.config,'missing'),false);
    assert.deepEqual(buildDetailCards(cards,h.config).map(item=>[item.id,item.record?.key]),preview);assert.deepEqual([...h.config.histories],histories);assert.equal(JSON.stringify(cards),before);
});

test('batch preview switching still selects every matching checked output when each task has another pinned cover',()=>{
    const h=fixture();h.a.title='预览';h.b.title='封面';
    const other={id:'other',areas:[{...h.a,id:'other-preview'},{...h.b,id:'other-cover'}]},cards=[h.card,other],before=JSON.stringify(cards);h.config.tasks.add('other');
    for(const card of cards){h.config.outputs.set(card.id,card.areas.find(area=>area.title==='封面').id);setDetailCover(h.config,card,card.areas.find(area=>area.title==='封面'));}
    applyDetailOutput(cards,h.config,'预览','output');
    assert.deepEqual(buildDetailCards(cards,h.config).map(item=>[item.area.id,item.coverArea.id]),[['a','b'],['other-preview','other-cover']]);assert.equal(JSON.stringify(cards),before);
});

test('batch actions select the clicked duplicate output in the source task while preserving other tasks selected duplicates',()=>{
    const h=fixture();h.a.title=h.b.title='结果';
    const other={id:'other',areas:[{...h.a,id:'other-first'},{...h.b,id:'other-second'}]},cards=[h.card,other],source={cardId:'task',areaId:'b'};
    h.config.tasks.add('other');h.config.outputs.set('other','other-second');setDetailCover(h.config,h.card,h.a);setDetailCover(h.config,other,other.areas[0]);
    assert.equal(detailCoverApplied(cards,h.config,'结果',source),false);
    applyDetailOutput(cards,h.config,'结果','output',source);
    assert.deepEqual(buildDetailCards(cards,h.config).map(item=>[item.area.id,item.coverArea.id]),[['b','a'],['other-second','other-first']]);
    applyDetailOutput(cards,h.config,'结果','cover',source);assert.equal(detailCoverApplied(cards,h.config,'结果',source),true);
    assert.equal(h.config.covers.get('task').areaId,'b');assert.equal(h.config.covers.get('other').areaId,'other-first');
    assert.equal(detailCoverApplied(cards,h.config,'结果',{cardId:'task',areaId:'a'}),false);
});
