import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { createWorkspaceView } from '../web/components/workspace_modes/view_state.js';
import { taskSignature, matchingTasks, cloneTask, parameterValue, taskCoordinates, importTaskRows } from '../web/components/workspace_modes/task_model.js';
import { adoptMatrix, synchronizeMatrix, matrixCards, matrixCells, matrixOutput, materializeMatrixRecords, changeAxisBindings, rebindMatrixAxis } from '../web/components/workspace_modes/xy_model.js';
import { parseValues, toggleChoiceValue, validateChoiceValues } from '../web/components/workspace_modes/value_parser.js';
import { captureTaskRecords } from '../web/components/actions/task_records.js';
import { captureCardInputSnapshot } from '../web/components/modules/media_types/media_utils.js';
import { createEmptyWorkspace, buildPersistedState, hydrateStateFromPersisted, state } from '../web/components/ui_state.js';
import { captureTableStructure, synchronizeTableStructure } from '../web/components/workspace_modes/table_structure.js';
import { medianMediaRatio, selectXYCells } from '../web/components/workspace_modes/xy_layout.js';
import { ensureXYHistory } from '../web/components/workspace_modes/xy_history.js';

const input=(id,widget,value)=>({id,type:'edit',title:widget,targetNodeId:'1',targetWidget:widget,targetWidgets:[`1||${widget}`],dataType:typeof value==='number'?'number':'string',value});
const parameters=[{key:'1||steps',name:'步数',type:'number',value:20},{key:'1||sampler',name:'采样器',type:'string',value:'Euler'},{key:'1||cfg',name:'CFG',type:'number',value:7},{key:'3||width',name:'宽度',type:'number',value:512},{key:'3||height',name:'高度',type:'number',value:768}];
function fixture(){
    const card={id:'template',title:'模板',areas:[input('steps','steps',20),input('sampler','sampler','Euler'),{id:'output',type:'preview',targetNodeId:'2',history:['/a.png'],historyRuns:[{id:'run'}],inputHistorySnapshots:[[{sourceAreaId:'steps',value:20}]],resultUrl:'/a.png',historyIndex:0}]};
    const view=createWorkspaceView();Object.assign(view.xy,{initialized:true,outputNodeId:'2',x:{bindings:['1||steps'],values:[20,30]},y:{bindings:['1||sampler'],values:['Euler','DPM']}});
    return {card,view};
}
test('empty XY workspaces create real combination tasks without a card template',()=>{
    const {view}=fixture(),cards=[],created=synchronizeMatrix(cards,view.xy,parameters);
    assert.equal(created.length,4);assert.equal(cards.length,4);
    assert.deepEqual(cards.map(card=>[parameterValue(card,'1||steps'),parameterValue(card,'1||sampler')]),[[20,'Euler'],[30,'Euler'],[20,'DPM'],[30,'DPM']]);
    assert.ok(cards.every(card=>card.areas[0].type==='preview'&&matrixOutput(card,view.xy).targetNodeId==='2'));
    assert.equal(synchronizeMatrix(cards,view.xy,parameters).length,0);
    assert.equal(new Set(cards.flatMap(card=>[card.id,...card.areas.map(area=>area.id)])).size,cards.reduce((sum,card)=>sum+1+card.areas.length,0));
});
test('card conversion adopts existing combinations and histories, fills only missing cells and keeps unrelated tasks',()=>{
    const {card,view}=fixture();view.xy.initialized=false;const unrelated={id:'unrelated',areas:[]},cards=[card,unrelated];
    adoptMatrix(cards,card,view.xy);const history=card.areas[2].history;synchronizeMatrix(cards,view.xy,parameters);
    assert.equal(cards.length,5);assert.equal(matrixCards(cards,view.xy).length,4);assert.equal(matrixOutput(card,view.xy).history,history);
    assert.equal(matrixOutput(card,view.xy).resultUrl,'/a.png');assert.deepEqual(unrelated,{id:'unrelated',areas:[]});
});
test('paired parameters stay paired within an axis and cross with the other axis',()=>{
    const {view}=fixture();view.xy.x={bindings:['3||width','3||height'],values:[[512,768],[768,1024]]};const cards=[];
    synchronizeMatrix(cards,view.xy,parameters);
    assert.deepEqual(cards.map(card=>[parameterValue(card,'3||width'),parameterValue(card,'3||height')]),[[512,768],[768,1024],[512,768],[768,1024]]);
    assert.deepEqual(taskCoordinates(cards[3],view.xy),{x:1,y:1});
    changeAxisBindings(view.xy.x,['3||height','3||width','1||cfg'],parameters);assert.deepEqual(view.xy.x.values,[[768,512,7],[1024,768,7]]);
    changeAxisBindings(view.xy.x,['3||width'],parameters);assert.deepEqual(view.xy.x.values,[512,768]);
});
test('removed display dimensions never inject generation sizes; axis width/height combinations remain ordinary inputs',()=>{
    const {view}=fixture(),cards=[];view.xy.size={width:1024,height:768,widthBinding:'3||width',heightBinding:'3||height'};
    synchronizeMatrix(cards,view.xy,parameters);assert.equal(parameterValue(cards[0],'3||width'),undefined);assert.equal(parameterValue(cards[0],'3||height'),undefined);
    rebindMatrixAxis(cards,view.xy,'x',['3||width','3||height'],parameters);synchronizeMatrix(cards,view.xy,parameters);
    assert.equal(parameterValue(cards[0],'3||width'),512);assert.equal(parameterValue(cards[0],'3||height'),768);
});
test('record rows read workflow values without injection in XY and become ordinary bound inputs in card/table views',()=>{
    const {view}=fixture(),cards=[];view.xy.records=[{id:'cfg-record',key:'1||cfg'}];synchronizeMatrix(cards,view.xy,parameters);
    const card=cards[0],record=card.areas.find(area=>area.xyRecordKey);record.value=100;
    assert.equal(captureCardInputSnapshot(card).some(area=>area.targetWidget==='cfg'),false);
    const graph={getNodeById:()=>({widgets:[{name:'cfg',value:9}]})};assert.equal(captureTaskRecords(card,graph)[0].value,9);
    materializeMatrixRecords(cards,view.xy,parameters);assert.equal(record.value,7);assert.equal(record.recordOnly,false);
    assert.equal(captureCardInputSnapshot(card).find(area=>area.targetWidget==='cfg').value,7);
    synchronizeMatrix(cards,view.xy,parameters);assert.equal(record.recordOnly,true);
    view.xy.records=[];synchronizeMatrix(cards,view.xy,parameters);assert.ok(!card.areas.some(area=>area.xyRecordKey));
});
test('adding and removing an axis parameter updates existing cells without duplicating their tasks or history',()=>{
    const {view}=fixture(),cards=[];synchronizeMatrix(cards,view.xy,parameters);const ids=cards.map(card=>card.id),output=matrixOutput(cards[0],view.xy);output.history=['/own.png'];
    rebindMatrixAxis(cards,view.xy,'x',['1||steps','1||cfg'],parameters);synchronizeMatrix(cards,view.xy,parameters);
    assert.deepEqual(cards.map(card=>card.id),ids);assert.equal(parameterValue(cards[0],'1||cfg'),7);
    rebindMatrixAxis(cards,view.xy,'x',['1||steps'],parameters);synchronizeMatrix(cards,view.xy,parameters);
    assert.deepEqual(cards.map(card=>card.id),ids);assert.deepEqual(output.history,['/own.png']);assert.equal(parameterValue(cards[0],'1||cfg'),undefined);
});
test('legacy dimension inputs retain their values and binding after display size controls are removed',()=>{
    const {view}=fixture(),cards=[];synchronizeMatrix(cards,view.xy,parameters);
    const area={id:'legacy-width',type:'edit',value:1024,targetNodeId:'3',targetWidget:'width',targetWidgets:['3||width'],xyDimension:'width'};cards[0].areas.push(area);
    synchronizeMatrix(cards,view.xy,parameters);
    assert.equal(captureCardInputSnapshot(cards[0]).find(area=>area.targetWidget==='width').value,1024);
    assert.equal(area.xyDimension,undefined);assert.equal(parameterValue(cards[0],'3||width'),1024);
});
test('returning from cards adopts newly cloned compatible tasks and collapsing paired values keeps both original tasks',()=>{
    const {view}=fixture(),cards=[];view.xy.x={bindings:['3||width','3||height'],values:[[512,768],[512,1024]]};synchronizeMatrix(cards,view.xy,parameters);
    const duplicate=cloneTask(cards[0]);cards.push(duplicate);adoptMatrix(cards,cards[0],view.xy);assert.ok(view.xy.taskIds.includes(duplicate.id));assert.notEqual(duplicate.xyOutputId,cards[0].xyOutputId);
    const ids=cards.map(card=>card.id);rebindMatrixAxis(cards,view.xy,'x',['3||width'],parameters);synchronizeMatrix(cards,view.xy,parameters);
    assert.deepEqual(view.xy.x.values,[512]);assert.deepEqual(cards.map(card=>card.id),ids);assert.ok(cards.every(card=>parameterValue(card,'3||width')===512));
});

test('each XY coordinate has one visible cell, preferring existing results while preserving all duplicate tasks and records',()=>{
    const {view}=fixture(),cards=[];synchronizeMatrix(cards,view.xy,parameters);
    const duplicate=cloneTask(cards[0]);matrixOutput(duplicate,view.xy).history=['/existing.png'];cards.push(duplicate);adoptMatrix(cards,cards[0],view.xy);
    const before=structuredClone(cards),cells=matrixCells(cards,view.xy);
    assert.equal(cells.length,4);assert.equal(cells.find(cell=>cell.x===0&&cell.y===0).card,duplicate);assert.deepEqual(cards,before);
    assert.equal(matrixCards(cards,view.xy).length,5);assert.equal(synchronizeMatrix(cards,view.xy,parameters).length,0);
    matrixOutput(cards[0],view.xy).history=['/original.png'];assert.equal(matrixCells(cards,view.xy).find(cell=>cell.x===0&&cell.y===0).card,cards[0]);
});
test('matrix membership survives module renaming, reordering and added fields; changed axis ranges retain old cards and outputs',()=>{
    const {view}=fixture(),cards=[];synchronizeMatrix(cards,view.xy,parameters);const first=cards[0],output=matrixOutput(first,view.xy);
    output.history=['/own.png'];first.areas.reverse();first.areas[0].title='改名';first.areas.push(input('extra','extra',5));
    assert.equal(matrixCards(cards,view.xy).length,4);assert.equal(synchronizeMatrix(cards,view.xy,parameters).length,0);
    view.xy.x.values=[30,40];synchronizeMatrix(cards,view.xy,parameters);assert.equal(cards.length,6);assert.deepEqual(output.history,['/own.png']);
    view.xy.outputNodeId='8';synchronizeMatrix(cards,view.xy,parameters);assert.ok(matrixCards(cards,view.xy).every(card=>matrixOutput(card,view.xy).targetNodeId==='8'));
});
test('task grouping ignores values and histories but respects structures and bindings; clones clear output records',()=>{
    const {card}=fixture(),other=cloneTask(card);other.areas[0].value=99;
    assert.equal(taskSignature(card),taskSignature(other));assert.equal(matchingTasks([card,other],card).length,2);assert.deepEqual(other.areas.at(-1).history,[]);assert.ok(!other.areas.at(-1).resultUrl);
    other.areas[0].targetWidgets=['9||steps'];assert.equal(matchingTasks([card,other],card).length,1);
});
test('table shared structure changes preserve each task values, identities and records',()=>{
    const {card}=fixture(),other=cloneTask(card);other.areas[0].value=99;other.areas.at(-1).history=['/own.png'];
    const cards=[card,other],ids=other.areas.map(area=>area.id);let before=captureTableStructure(cards,card);
    card.areas[0].title='新标题';card.areas[0].targetWidgets=['8||steps'];card.areas[0].targetNodeId='8';
    assert.equal(synchronizeTableStructure(cards,before),true);assert.equal(other.areas[0].value,99);assert.equal(other.areas[0].title,'新标题');assert.equal(other.areas[0].id,ids[0]);
    before=captureTableStructure(cards,card);card.areas.splice(1,0,input('added','cfg',7));synchronizeTableStructure(cards,before);assert.equal(other.areas[1].value,7);assert.equal(other.areas[2].id,ids[1]);
    before=captureTableStructure(cards,card);card.areas.splice(0,1);synchronizeTableStructure(cards,before);assert.equal(other.areas.length,card.areas.length);assert.deepEqual(other.areas.at(-1).history,['/own.png']);
});
test('value imports preserve quoted commas, multiline text, typed values and paired rows',()=>{
    assert.deepEqual(parseValues('20,30，40',['number']),[20,30,40]);assert.deepEqual(parseValues('a, b\nc, d',['string']),['a, b','c, d']);assert.deepEqual(parseValues('"a,b",c'),['a,b','c']);
    assert.deepEqual(parseValues('[true,false]',['boolean']),[true,false]);assert.deepEqual(parseValues('512,768\n768,1024',['number','number']),[[512,768],[768,1024]]);
    assert.throws(()=>parseValues('[[512]]',['number','number']),/每组需要/);assert.throws(()=>parseValues('NaN',['number']),/有效数字/);
});
test('JSON object rows create independent tasks and preserve omitted values and source records',()=>{
    const {card}=fixture(),before=structuredClone(card),created=importTaskRows(card,[{steps:10,sampler:'A'},{steps:40}]);
    assert.equal(created[0].areas[0].value,10);assert.equal(created[1].areas[1].value,'Euler');assert.deepEqual(card,before);assert.throws(()=>importTaskRows(card,[{unknown:10}]),/不存在/);
});
test('workspace axes, tuples, dimensions, record rows, output binding and camera survive persistence',()=>{
    const {card,view}=fixture();view.mode='xy';view.xy.panX=-500;view.xy.origin='bottom';view.xy.records=[{id:'cfg',key:'1||cfg'}];
    const a=createEmptyWorkspace('A',{cards:[card],view}),b=createEmptyWorkspace('B');state.workspaces=[a,b];state.activeWorkspaceId=a.id;state.cards=a.cards;state.channels=a.channels;state.activeChannelId=a.activeChannelId;
    const persisted=buildPersistedState();hydrateStateFromPersisted(persisted);assert.deepEqual(state.workspaces[0].view,view);assert.equal(state.workspaces[1].view.mode,'cards');
    assert.equal(createWorkspaceView().xy.origin,'bottom');assert.equal(createWorkspaceView().xy.size,undefined);assert.equal(createWorkspaceView().xy.x.gap,4);assert.equal(createWorkspaceView().xy.y.margin,10);
});

test('median preview ratios select the middle real ratio and default to square until media loads',()=>{
    const sizes=ratios=>ratios.map(([width,height])=>({width,height}));
    assert.equal(medianMediaRatio(sizes([[9,21],[9,16],[2,3],[3,4],[1,1],[4,3],[3,2],[16,9],[21,9]])),1);
    assert.equal(medianMediaRatio(sizes([[1,1],[4,3],[3,2],[16,9],[21,9]])),1.5);
    assert.equal(medianMediaRatio([]),1);assert.equal(medianMediaRatio([{width:0,height:10}]),1);
    assert.equal(medianMediaRatio(sizes([[1,1],[4,3],[3,2],[16,9]])),4/3);
});

test('XY cell Ctrl/Cmd toggles, Shift selects only its coordinate rectangle, and plain click replaces selection',()=>{
    const cells=Array.from({length:9},(_,i)=>({card:{id:String(i)},x:i%3,y:Math.floor(i/3)}));
    assert.deepEqual(selectXYCells(cells,['0'],'4','0',{ctrlKey:true}),['0','4']);assert.deepEqual(selectXYCells(cells,['0','4'],'0','4',{metaKey:true}),['4']);
    assert.deepEqual(selectXYCells(cells,['8'],'4','0',{shiftKey:true}),['0','1','3','4']);
    assert.deepEqual(selectXYCells(cells,['8'],'4','0',{shiftKey:true,ctrlKey:true}),['8','0','1','3','4']);assert.deepEqual(selectXYCells(cells,['8'],'4','0',{}),['4']);
});

test('XY Shift ranges match the first/last grid-cell rectangle in either direction and shrink from the same anchor',()=>{
    const cells=Array.from({length:9},(_,i)=>({card:{id:String(i+1)},x:i%3,y:Math.floor(i/3)}));
    for(const [last,expected]of [['3',['1','2','3']],['7',['1','4','7']],['6',['1','2','3','4','5','6']],['8',['1','2','4','5','7','8']],['1',['1']]]){
        assert.deepEqual(selectXYCells(cells,['1'],'1',last,{shiftKey:true}),expected);
        assert.deepEqual(selectXYCells(cells,['1','2','3','4','5','6','7','8','9'],last,'1',{shiftKey:true}),expected);
    }
});

test('XY conversion archives a visible legacy result once and preserves every existing run and snapshot',()=>{
    const previous=globalThis.window;globalThis.window={};
    try{
    const {view}=fixture(),cards=[];synchronizeMatrix(cards,view.xy,parameters);const area=matrixOutput(cards[0],view.xy);
    area.resultUrl='/view?filename=legacy.png';ensureXYHistory(cards,view.xy);ensureXYHistory(cards,view.xy);assert.deepEqual(area.history,[area.resultUrl]);
    area.historyRuns[0]={id:'run1',order:1};area.inputHistorySnapshots[0]=captureCardInputSnapshot(cards[0]);const history=structuredClone(area);
    area.resultUrl='';area.historyIndex=-1;ensureXYHistory(cards,view.xy);assert.equal(area.resultUrl,history.resultUrl);assert.equal(area.historyIndex,0);
    materializeMatrixRecords(cards,view.xy,parameters);ensureXYHistory(cards,view.xy);assert.equal(matrixOutput(cards[0],view.xy),area);assert.deepEqual(area,history);
    }finally{if(previous===undefined)delete globalThis.window;else globalThis.window=previous;}
});

test('axis gaps and margins persist independently and reject negative saved dimensions',()=>{
    const view=createWorkspaceView({mode:'xy',xy:{x:{gap:28,margin:36},y:{gap:18,margin:32}}});
    assert.deepEqual([view.xy.x.gap,view.xy.x.margin,view.xy.y.gap,view.xy.y.margin],[28,36,18,32]);
    assert.deepEqual(createWorkspaceView(JSON.parse(JSON.stringify(view))),view);assert.equal(createWorkspaceView({xy:{x:{gap:-5}}}).xy.x.gap,0);
});
test('parameter choices exclude virtual primitives and internal config widgets while preserving typed values',()=>{
    const source=readFileSync(new URL('../web/components/workspace_modes/parameters.js',import.meta.url),'utf8').replace(/^import .*;\r?\n/gm,'').replaceAll('export function','function');
    const app={graph:{_nodes:[{id:1,type:'KSampler',widgets:[{name:'steps',type:'number',value:'20'}]},{id:2,type:'PrimitiveNode',widgets:[{name:'value',value:20}]},{id:3,type:'CLab_SystemConfig',widgets:[{name:'scenes_data',value:'{}'}]}]}};
    const context=vm.createContext({app});vm.runInContext(source,context);assert.deepEqual(JSON.parse(JSON.stringify(vm.runInContext('workflowParameters()',context))).map(parameter=>[parameter.key,parameter.type]),[['1||steps','number']]);
});

test('axis choices preserve booleans and numbers and add explicit paired rows instead of crossing existing tuples',()=>{
    const boolean=[{key:'1||enabled',type:'boolean',value:false,choices:[true,false]}];
    assert.deepEqual(toggleChoiceValue([false],boolean,0,true,true),[false,true]);assert.deepEqual(toggleChoiceValue([false,true],boolean,0,false,false),[true]);
    const number=[{key:'1||choice',type:'number',value:1,choices:[1,2]}];assert.deepEqual(validateChoiceValues([1,2],number),[1,2]);assert.throws(()=>validateChoiceValues(['1'],number),/当前选项/);
    const fields=[{key:'1||steps',type:'number',value:20},{key:'1||sampler',name:'采样器',type:'string',value:'Euler',choices:['Euler','DPM']}],rows=[[20,'Euler'],[30,'Euler']];
    assert.deepEqual(toggleChoiceValue(rows,fields,1,'DPM',true),[[20,'Euler'],[30,'Euler'],[30,'DPM']]);assert.deepEqual(rows,[[20,'Euler'],[30,'Euler']]);
    assert.deepEqual(toggleChoiceValue([[20,'Euler'],[30,'DPM']],fields,1,'Euler',false),[[30,'DPM']]);assert.deepEqual(toggleChoiceValue([],fields,1,'DPM',true),[[20,'DPM']]);
});

test('workflow options match widget arrays, options.values/options.options, schema choices and boolean widgets',()=>{
    const source=readFileSync(new URL('../web/components/workspace_modes/parameters.js',import.meta.url),'utf8').replace(/^import .*;\r?\n/gm,'').replaceAll('export function','function');
    const app={graph:{_nodes:[{id:1,type:'Choices',constructor:{nodeData:{input:{required:{schema:[['new','other']],schemaBool:['BOOLEAN',{}]}}}},widgets:[{name:'enabled',type:'toggle',value:false},{name:'array',type:['a','b'],value:'a'},{name:'values',type:'combo',value:1,options:{values:[1,2]}},{name:'options',type:'combo',value:'x',options:{options:['x','y']}},{name:'schema',type:'combo',value:'new',options:{values:['stale']}},{name:'schemaBool'}]}]}};
    const context=vm.createContext({app});vm.runInContext(source,context);const result=JSON.parse(JSON.stringify(vm.runInContext('workflowParameters()',context)));
    assert.deepEqual(result.map(parameter=>parameter.choices),[[true,false],['a','b'],[1,2],['x','y'],['new','other'],[true,false]]);assert.equal(result[2].type,'number');assert.equal(result[5].type,'boolean');
});

test('parameter display names follow ComfyUI labels without changing binding keys or typed values',()=>{
    const source=readFileSync(new URL('../web/components/workspace_modes/parameters.js',import.meta.url),'utf8').replace(/^import .*;\r?\n/gm,'').replaceAll('export function','function');
    const node={id:1,title:'采样器',widgets:[{name:'steps',label:'步数',type:'number',value:20}]},app={graph:{_nodes:[node]}};
    const context=vm.createContext({app});vm.runInContext(source,context);
    const read=()=>JSON.parse(JSON.stringify(vm.runInContext('workflowParameters()[0]',context)));
    assert.equal(read().label,'采样器 · 步数');assert.equal(read().key,'1||steps');assert.equal(read().name,'steps');assert.equal(read().value,20);
    node.title='KSampler';node.widgets[0].label='steps';assert.equal(read().label,'KSampler · steps');
});
