import test from 'node:test';
import assert from 'node:assert/strict';
import { createWorkspaceView } from '../web/components/workspace_modes/view_state.js';
import { synchronizeMatrix, matrixCells, visibleMatrixCells, matrixOutput } from '../web/components/workspace_modes/xy_model.js';
import { taskCoordinates } from '../web/components/workspace_modes/task_model.js';
import { projectPreviewXY, previewXYCellInfo, xyRecordRows } from '../web/components/contextmenu/content/preview_xy_sources.js';

const prompt='a forest <script>alert("test")</script>\nsoft light, wide shot';
const parameters=[{key:'1||steps',name:'steps',displayName:'步数',type:'number',value:0},
    {key:'1||enabled',name:'enabled',displayName:'开关',type:'boolean',value:false},
    {key:'2||text',name:'text',displayName:'提示词',type:'string',value:prompt},
    {key:'1||cfg',name:'cfg',type:'number',value:5}];
function fixture(){
    const xy=createWorkspaceView({mode:'xy',xy:{initialized:true,outputNodeId:'3',
        x:{bindings:['1||steps','1||enabled'],values:[[0,false],[20,true],[30,false]]},
        y:{bindings:['2||text'],values:[prompt,'city','ocean']},
        z:{enabled:true,bindings:['1||cfg'],values:[5,7],current:0,display:'single'}}}).xy;
    const cards=[];synchronizeMatrix(cards,xy,parameters);return {xy,cards};
}

test('preview X/Y filtering compacts coordinates while preserving original bindings, values, tasks and Z layers',()=>{
    const {xy,cards}=fixture(),before=JSON.stringify({xy,cards});
    const projected=projectPreviewXY(xy,{x:new Set([0,2]),y:new Set([1,2])});
    assert.deepEqual(projected.x.values,[[0,false],[30,false]]);
    assert.deepEqual(projected.y.values,['city','ocean']);
    assert.equal(projected.z,xy.z);assert.equal(projected.x.bindings,xy.x.bindings);
    const items=matrixCells(cards,projected);
    assert.equal(items.length,8);assert.equal(visibleMatrixCells(cards,projected).length,4);
    for(const {card,x,y} of items){
        const original=taskCoordinates(card,xy);
        assert.equal(x,[0,2].indexOf(original.x));assert.equal(y,[1,2].indexOf(original.y));
        assert.equal(matrixOutput(card,projected),matrixOutput(card,xy));
    }
    projected.z={...projected.z,display:'all'};
    assert.equal(visibleMatrixCells(cards,projected).length,8);
    assert.equal(JSON.stringify({xy,cards}),before);
});

test('empty X or Y selection produces no tasks without changing the workspace',()=>{
    const {xy,cards}=fixture(),before=JSON.stringify({xy,cards});
    for(const name of ['x','y']){
        const shown={x:new Set([0,1,2]),y:new Set([0,1,2])};shown[name].clear();
        assert.equal(matrixCells(cards,projectPreviewXY(xy,shown)).length,0);
    }
    assert.equal(JSON.stringify({xy,cards}),before);
});

test('cell information keeps full original XYZ values, escapes markup, and follows the displayed history',()=>{
    const {xy,cards}=fixture(),card=cards[0],output=matrixOutput(card,xy);
    card.title='Task <one>';output.title='Output & media';output.history=['/first.png','/second.png'];output.historyIndex=1;
    const html=previewXYCellInfo(card,output,xy,parameters,2);
    assert.match(html,/Task &lt;one&gt;/);assert.match(html,/Output &amp; media/);
    assert.match(html,/2\/2/);assert.match(html,/已选 2 个格子/);
    assert.match(html,/步数：0\n开关：false/);assert.match(html,/soft light, wide shot/);
    assert.match(html,/&lt;script&gt;/);assert.doesNotMatch(html,/<script>/);
    assert.match(html,/Z 轴 · cfg/);assert.match(html,/<dd>5<\/dd>/);
    assert.match(previewXYCellInfo(card,{...output,historyIndex:0},xy,parameters),/1\/2/);
    assert.match(previewXYCellInfo(null,null,xy,parameters),/选择画布中的格子/);
});

test('checked extra parameters show their recorded value for the displayed history without falling back to live workflow values',()=>{
    const {xy,cards}=fixture(),card=cards[0],output=matrixOutput(card,xy),key='1||cfg';
    xy.records=[{id:'record',key}];output.history=['/first.png','/second.png'];output.historyIndex=0;
    output.historyRuns=[{recordParameters:[{key,label:'历史 CFG',value:0}]},{recordParameters:[{key,label:'历史 CFG',value:9}]}];
    const info=()=>previewXYCellInfo(card,output,xy,parameters,1,new Set([key]));
    assert.match(info(),/附加记录 · 历史 CFG<\/dt><dd>0<\/dd>/);
    output.historyIndex=1;assert.match(info(),/历史 CFG<\/dt><dd>9<\/dd>/);
    output.historyRuns[1]={};assert.match(info(),/当前历史未记录该参数/);
    assert.doesNotMatch(previewXYCellInfo(card,output,xy,parameters),/附加记录 ·/);
});

test('record table deduplicates equal snapshot values, retains distinct typed values and reports missing history',()=>{
    const key='1||steps',configured=[{id:'record',key}],shown=new Set([key]);
    const output=value=>({history:['/a.png'],historyIndex:0,historyRuns:[{recordParameters:[{key,label:'步数',value}]}]});
    const outputs=[output(0),output(0)],before=JSON.stringify(outputs);
    assert.deepEqual(xyRecordRows(outputs,configured,shown,parameters),[{key,nodeName:'节点 1',parameterName:'步数',value:'0',mixed:false}]);
    assert.equal(JSON.stringify(outputs),before);
    const rows=xyRecordRows([...outputs,output(false),{history:[]}],configured,shown,parameters);
    assert.equal(rows[0].value,'0\nfalse\n部分历史未记录该参数');assert.equal(rows[0].mixed,true);
    assert.deepEqual(xyRecordRows(outputs,configured,new Set(),parameters),[]);
    assert.deepEqual(xyRecordRows([],configured,shown,parameters),[]);
});

test('preview record selections survive saved view normalization and discard removed or duplicate keys',()=>{
    const view=createWorkspaceView({xy:{records:[{id:'a',key:'1||steps'},{id:'b',key:'1||cfg'}],previewRecords:['1||steps','missing','1||steps',17],previewRecordsExpanded:true}});
    assert.deepEqual(view.xy.previewRecords,['1||steps']);
    assert.equal(createWorkspaceView(JSON.parse(JSON.stringify(view))).xy.previewRecordsExpanded,true);
    assert.equal(createWorkspaceView().xy.previewRecordsExpanded,false);
    assert.deepEqual(createWorkspaceView(JSON.parse(JSON.stringify(view))).xy.previewRecords,['1||steps']);
    view.xy.records=[];assert.deepEqual(createWorkspaceView(view).xy.previewRecords,[]);
});

test('record columns keep current node and parameter names separate and retain labels when a node is unavailable',()=>{
    const key='1||steps',output={historyIndex:0,historyRuns:[{recordParameters:[{key,label:'旧节点 · 旧参数',value:20}]}]};
    const fields=[{key,nodeName:'节点 · 自定义',displayName:'步数 · 参数',name:'steps'}];
    const current=xyRecordRows([output],[{key}],new Set([key]),fields)[0];
    assert.equal(current.nodeName,'节点 · 自定义');assert.equal(current.parameterName,'步数 · 参数');
    const saved=xyRecordRows([output],[{key}],new Set([key]),[])[0];
    assert.equal(saved.nodeName,'旧节点');assert.equal(saved.parameterName,'旧参数');
});
