import test from 'node:test';
import assert from 'node:assert/strict';
import { createPreviewWorkspaceBundle } from '../web/components/contextmenu/content/preview_workspaces.js';
import { collectPreviewRecords } from '../web/components/contextmenu/content/preview_records.js';
import { createWorkspaceView } from '../web/components/workspace_modes/view_state.js';
import { detailStyle } from '../web/components/contextmenu/content/preview_detail_model.js';
import { createEditHistory } from '../web/components/edit_history.js';

const workspace=id=>({id,name:id,cards:[{id:'task',title:'task',areas:[{id:'input',type:'edit',title:'提示词',value:'task',targetNodeId:'12',targetWidgets:['12||text']},{id:'out',type:'preview',history:['/view?filename=a.png'],historyIndex:0}]}],view:createWorkspaceView({xy:{taskIds:['task']},table:{widths:{out:320}}})});

test('multi-workspace previews namespace duplicated task/module IDs while preserving user values and bindings',()=>{
    const a=workspace('a'),b=workspace('b'),bundle=createPreviewWorkspaceBundle([a,b],ws=>ws.name);
    assert.equal(new Set(bundle.cards.map(card=>card.id)).size,2);
    assert.equal(new Set(collectPreviewRecords(bundle.cards.map(card=>({card,area:card.areas[1]}))).map(record=>record.key)).size,2);
    assert.equal(bundle.cards[0].areas[0].value,'task');assert.deepEqual(bundle.cards[0].areas[0].targetWidgets,['12||text']);
    assert.deepEqual(bundle.groups[0].projected.view.xy.taskIds,[bundle.cards[0].id]);
    assert.equal(bundle.groups[0].projected.view.table.widths[bundle.cards[0].areas[1].id],320);
    bundle.commit();assert.equal(a.cards[0].id,'task');assert.equal(a.cards[0].areas[0].value,'task');
});

test('preview changes commit to their source workspace and preserve concurrent results in untouched fields',()=>{
    const a=workspace('a'),b=workspace('b'),original=a.cards[0].areas[1],bundle=createPreviewWorkspaceBundle([a,b],ws=>ws.name);
    bundle.cards[0].areas[0].title='新标题';bundle.groups[0].projected.view.table.widths.out=400;
    original.history.push('/view?filename=new.png');bundle.commit();
    assert.equal(a.cards[0].areas[0].title,'新标题');assert.equal(b.cards[0].areas[0].title,'提示词');
    assert.equal(a.cards[0].areas[1],original);assert.equal(original.history.length,2);
    assert.ok(!JSON.stringify(a).includes('preview:a:'));
});

test('detail cover, source and field preferences split back into their own workspace with original IDs',()=>{
    const a=workspace('a'),b=workspace('b'),bundle=createPreviewWorkspaceBundle([a,b],ws=>ws.name),card=bundle.cards[1];
    const record=collectPreviewRecords([{card,area:card.areas[1]}])[0];
    bundle.detail.view.previewDetail={cardIds:bundle.cards.map(card=>card.id),tasks:[card.id],outputs:[[card.id,card.areas[1].id]],covers:[[card.id,{areaId:card.areas[1].id,recordKey:record.key}]],histories:[],media:[],inputs:[],styles:{}};
    bundle.saveDetail();bundle.commit();
    assert.deepEqual(a.view.previewDetail.tasks,[]);assert.deepEqual(b.view.previewDetail.tasks,['task']);
    assert.equal(b.view.previewDetail.covers[0][1].areaId,'out');
    assert.equal(b.view.previewDetail.covers[0][1].recordKey,collectPreviewRecords([{card:b.cards[0],area:b.cards[0].areas[1]}])[0].key);
});

test('draft table values follow namespaced column keys without rewriting text that resembles an ID',()=>{
    const ws=workspace('a');ws.view.table.sheets=[{id:'sheet',columns:[{id:'input',type:'edit'}],rows:[{id:'row',values:{input:'task'}}]}];
    const bundle=createPreviewWorkspaceBundle([ws],workspace=>workspace.name),sheet=bundle.groups[0].projected.view.table.sheets[0];
    assert.equal(sheet.rows[0].values[sheet.columns[0].id],'task');
    bundle.commit();assert.deepEqual(ws.view.table.sheets[0].rows[0].values,{input:'task'});
});
test('multi-source detail rendering retains distinct workspace styles and layout without writing one over another',()=>{
    const a=workspace('a'),b=workspace('b');
    a.view.previewDetail={columns:2,rowWidth:800,styles:{'name:提示词':{value:{size:14}}}};
    b.view.previewDetail={columns:4,rowWidth:1200,styles:{'name:提示词':{value:{size:20}}}};
    const bundle=createPreviewWorkspaceBundle([a,b],ws=>ws.name),config=bundle.detail.view.previewDetail;
    assert.equal(detailStyle(config,bundle.cards[0].id,{title:'提示词',id:bundle.cards[0].areas[0].id}).value.size,14);
    assert.equal(detailStyle(config,bundle.cards[1].id,{title:'提示词',id:bundle.cards[1].areas[0].id}).value.size,20);
    bundle.saveDetail();bundle.commit();assert.equal(a.view.previewDetail.styles['name:提示词'].value.size,14);assert.equal(b.view.previewDetail.rowWidth,1200);
    assert.ok(!JSON.stringify(a).includes('preview:'));assert.ok(!JSON.stringify(b).includes('preview:'));
});
test('a detail style batch edit can undo one workspace and render both sources without reapplying the edit',()=>{
    const a=workspace('a'),b=workspace('b'),state={workspaces:[a,b],activeWorkspaceId:'a'},history=createEditHistory();
    for(const ws of [a,b])ws.view.previewDetail={styles:{'name:提示词':{value:{size:12}}}};history.clear(state);
    const bundle=createPreviewWorkspaceBundle([a,b],ws=>ws.name);bundle.detail.view.previewDetail.styles['name:提示词']={value:{size:18}};
    bundle.saveDetail();bundle.commit();history.record(state);history.undo(state,'b');
    const reopened=createPreviewWorkspaceBundle([a,b],ws=>ws.name);reopened.saveDetail();reopened.commit();
    assert.equal(a.view.previewDetail.styles['name:提示词'].value.size,18);assert.equal(b.view.previewDetail.styles['name:提示词'].value.size,12);
    const card=reopened.cards[1];assert.equal(detailStyle(reopened.detail.view.previewDetail,card.id,{id:card.areas[0].id,title:'提示词'}).value.size,12);
});
