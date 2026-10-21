import test from 'node:test';
import assert from 'node:assert/strict';
import { createWorkspaceView } from '../web/components/workspace_modes/view_state.js';
import { synchronizeMatrix, matrixCells, visibleMatrixCells, matrixReady, matrixOutput, rebindMatrixAxis, materializeMatrixRecords, changeAxisBindings } from '../web/components/workspace_modes/xy_model.js';
import { parameterValue, taskCoordinates } from '../web/components/workspace_modes/task_model.js';
import { matrixLayers, matrixRunCards } from '../web/components/workspace_modes/xy_layers.js';
import { axisValueLabel, axisValueDescription } from '../web/components/workspace_modes/axis_labels.js';
import { parseAxisValues, axisInputText, formatAxisValues, formatAxisOrder, reorderAxisValues } from '../web/components/workspace_modes/value_parser.js';
import { selectXYCells } from '../web/components/workspace_modes/xy_layout.js';
import { captureCardInputSnapshot } from '../web/components/modules/media_types/media_utils.js';
import { swapMatrixAxes } from '../web/components/workspace_modes/xy_axis_swap.js';

const parameters=[{key:'1||steps',name:'steps',type:'number',value:20},{key:'1||sampler',name:'sampler',type:'string',value:'Euler'},
    {key:'1||cfg',name:'cfg',type:'number',value:7},{key:'2||text',name:'text',type:'string',value:'a forest, soft light\nwide shot'}];
function fixture(enabled=true){
    const xy=createWorkspaceView({mode:'xy',xy:{initialized:true,outputNodeId:'3',x:{bindings:['1||steps'],values:[20,30]},y:{bindings:['1||sampler'],values:['Euler','DPM']},z:{enabled,bindings:enabled?['1||cfg']:[],values:enabled?[5,7,9]:[]}}}).xy;
    const cards=[];synchronizeMatrix(cards,xy,parameters);return {xy,cards};
}

test('swapping axes moves complete parameter groups and values, leaving spacing with the destination axis',()=>{
    const {xy}=fixture(),cfg=xy.z.values;
    xy.x.bindings.push('2||text');xy.x.values=[[20,'forest\nsoft light'],[30,'city, rain']];xy.x.gap=12;xy.z.margin=22;xy.z.current=2;
    const tuples=xy.x.values;assert.equal(swapMatrixAxes(xy,'x','z'),true);
    assert.deepEqual(xy.x.bindings,['1||cfg']);assert.equal(xy.x.values,cfg);
    assert.deepEqual(xy.z.bindings,['1||steps','2||text']);assert.equal(xy.z.values,tuples);
    assert.equal(xy.x.gap,12);assert.equal(xy.z.margin,22);assert.equal(xy.z.enabled,true);assert.equal(xy.z.current,0);
    const unchanged=JSON.stringify(xy);assert.equal(swapMatrixAxes(xy,'x','x'),false);assert.equal(swapMatrixAxes(xy,'x','bad'),false);assert.equal(JSON.stringify(xy),unchanged);
});

test('all axis permutations preserve existing tasks, parameters, output identity, snapshots and histories',()=>{
    const {xy,cards}=fixture();
    const before=cards.map(card=>{const output=matrixOutput(card,xy);output.history=[`/${card.id}.png`];output.inputHistorySnapshots=[captureCardInputSnapshot(card)];return {card,output,json:JSON.stringify(card),at:taskCoordinates(card,xy)};});
    for(const [a,b]of [['x','y'],['y','z'],['x','z'],['z','y'],['x','y'],['z','x']]){
        swapMatrixAxes(xy,a,b);synchronizeMatrix(cards,xy,parameters);assert.equal(cards.length,before.length);assert.equal(matrixCells(cards,xy).length,12);
        for(const {card,output,json}of before){assert.ok(cards.includes(card));assert.equal(matrixOutput(card,xy),output);assert.equal(JSON.stringify(card),json);}
        const saved=createWorkspaceView({mode:'xy',xy}).xy;assert.deepEqual(saved.x.bindings,xy.x.bindings);assert.deepEqual(saved.z.values,xy.z.values);
    }
});

test('axis swap with an empty Z keeps existing tasks until the empty axis is configured',()=>{
    const {xy,cards}=fixture(false),before=JSON.stringify(cards);
    swapMatrixAxes(xy,'y','z');assert.equal(xy.z.enabled,true);assert.equal(matrixReady(xy),false);synchronizeMatrix(cards,xy,parameters);assert.equal(JSON.stringify(cards),before);
    swapMatrixAxes(xy,'y','z');synchronizeMatrix(cards,xy,parameters);assert.equal(xy.z.enabled,false);assert.equal(matrixReady(xy),true);assert.equal(JSON.stringify(cards),before);
});

test('XYZ creates every combination once and keeps each layer in its own output and history',()=>{
    const {xy,cards}=fixture();assert.equal(cards.length,12);assert.equal(matrixCells(cards,xy).length,12);
    assert.equal(new Set(cards.map(card=>JSON.stringify(taskCoordinates(card,xy)))).size,12);
    const ids=cards.map(card=>card.id);synchronizeMatrix(cards,xy,parameters);assert.deepEqual(cards.map(card=>card.id),ids);
    const outputs=cards.map(card=>matrixOutput(card,xy));assert.equal(new Set(outputs.map(area=>area.id)).size,12);
    outputs[0].history.push('/layer-0.png');assert.equal(outputs[4].history.length,0);
    assert.deepEqual(taskCoordinates(cards[4],xy),{x:0,y:0,z:1});
    assert.equal(visibleMatrixCells(cards,xy).length,4);xy.z.current=1;
    assert.ok(visibleMatrixCells(cards,xy).every(cell=>parameterValue(cell.card,'1||cfg')===7));
    xy.z.display='all';assert.equal(visibleMatrixCells(cards,xy).length,12);
});

test('enabling Z adopts current workflow values on existing XY tasks without discarding results',()=>{
    const {xy,cards}=fixture(false),original=cards.map(card=>card.id),output=matrixOutput(cards[0],xy);output.history=['/previous.png'];output.resultUrl='/previous.png';
    xy.z.enabled=true;rebindMatrixAxis(cards,xy,'z',['1||cfg'],parameters);
    assert.deepEqual(xy.z.values,[7]);assert.ok(cards.every(card=>parameterValue(card,'1||cfg')===7));
    xy.z.values=[5,7,9];synchronizeMatrix(cards,xy,parameters);
    assert.equal(cards.length,12);assert.ok(original.every(id=>cards.some(card=>card.id===id)));
    assert.deepEqual(output.history,['/previous.png']);assert.equal(taskCoordinates(cards[0],xy).z,1);
});

test('disabling Z shows its current layer as XY and re-enabling restores all original tasks and records',()=>{
    const {xy,cards}=fixture(),ids=cards.map(card=>card.id);xy.z.current=2;matrixOutput(cards[8],xy).history=['/z9.png'];
    xy.z.enabled=false;assert.equal(matrixCells(cards,xy).length,4);
    assert.ok(matrixCells(cards,xy).every(cell=>parameterValue(cell.card,'1||cfg')===9));
    synchronizeMatrix(cards,xy,parameters);assert.deepEqual(cards.map(card=>card.id),ids);
    xy.z.enabled=true;assert.equal(matrixCells(cards,xy).length,12);assert.deepEqual(matrixOutput(cards[8],xy).history,['/z9.png']);
});

test('clearing and rebinding Z preserves each existing layer value, output ID and history',()=>{
    const {xy,cards}=fixture(),ids=cards.map(card=>card.id),values=cards.map(card=>parameterValue(card,'1||cfg'));
    const output=matrixOutput(cards[0],xy);output.history=['/z5.png'];
    xy.z.enabled=false;rebindMatrixAxis(cards,xy,'z',[],parameters);synchronizeMatrix(cards,xy,parameters);
    xy.z.enabled=true;rebindMatrixAxis(cards,xy,'z',['1||cfg'],parameters);synchronizeMatrix(cards,xy,parameters);
    assert.deepEqual(xy.z.values,[5,7,9]);assert.equal(xy.z.current,1);assert.deepEqual(cards.map(card=>card.id),ids);
    assert.deepEqual(cards.map(card=>parameterValue(card,'1||cfg')),values);assert.equal(matrixOutput(cards[0],xy),output);assert.deepEqual(output.history,['/z5.png']);
});

test('XYZ run scopes distinguish all layers, current layer and selected cells without hidden selections leaking',()=>{
    const {xy,cards}=fixture();xy.z.current=1;const visible=new Set(visibleMatrixCells(cards,xy).map(cell=>cell.card.id));
    const layer=matrixRunCards(cards,xy,visible,[]);assert.equal(layer.length,4);assert.ok(layer.every(card=>parameterValue(card,'1||cfg')===7));
    xy.z.display='all';assert.deepEqual(matrixRunCards(cards,xy,new Set(cards.map(card=>card.id)),[]),layer);
    assert.deepEqual(matrixRunCards(cards,xy,visible,[layer[1]]),[layer[1]]);
    assert.equal(matrixRunCards(cards,xy,visible,[layer[1]],'all').length,12);
    assert.deepEqual(matrixRunCards(cards,xy,visible,[],'selected'),[]);
});

test('Z paired values, full prompts and history snapshots survive conversion to ordinary task cards',()=>{
    const {xy,cards}=fixture(false),prompt='portrait, cinematic lighting\nkeep commas, and newlines';
    xy.z.enabled=true;xy.z.bindings=['1||cfg','2||text'];xy.z.values=[[5,prompt],[9,'another, full prompt']];
    synchronizeMatrix(cards,xy,parameters);const cells=matrixCells(cards,xy);assert.equal(cells.length,8);
    const card=cells.find(cell=>cell.z===0).card;assert.equal(parameterValue(card,'2||text'),prompt);
    materializeMatrixRecords(cards,xy,parameters);assert.equal(card.areas[0].type,'preview');
    const snapshot=captureCardInputSnapshot(card);assert.equal(snapshot.find(area=>area.targetWidget==='text').value,prompt);
    xy.z.values.reverse();assert.equal(taskCoordinates(card,xy).z,1);assert.equal(matrixOutput(card,xy),card.areas[0]);
});

test('Z must have bindings and values before tasks are ready, and unmatched values preserve archived tasks',()=>{
    const {xy,cards}=fixture(false);xy.z.enabled=true;assert.equal(matrixReady(xy),false);
    const count=cards.length;synchronizeMatrix(cards,xy,parameters);assert.equal(cards.length,count);
    rebindMatrixAxis(cards,xy,'z',['1||cfg'],parameters);assert.equal(matrixReady(xy),true);
    xy.z.values=[5];synchronizeMatrix(cards,xy,parameters);assert.equal(cards.length,8);assert.equal(matrixCells(cards,xy).length,4);
    xy.z.values=[7,5];synchronizeMatrix(cards,xy,parameters);assert.equal(cards.length,8);assert.equal(matrixCells(cards,xy).length,8);
});

test('axis labels show actual contents without aliases or identifiers and preserve full values',()=>{
    const prompt='a forest, with a cabin and a lake\nkeep all original punctuation';
    const axis={values:[prompt,7,true,['forest, rain',5]],labels:{[JSON.stringify(prompt)]:'森林'}};
    assert.equal(axisValueLabel(axis,0),prompt.replace(/\s+/g,' '));
    assert.equal(axisValueLabel(axis,1),'7');assert.equal(axisValueLabel(axis,2),'true');assert.equal(axisValueLabel(axis,3),'forest, rain × 5');
    assert.equal(axisValueDescription(prompt),prompt);assert.equal(axis.values[0],prompt);
    assert.equal(axisValueDescription([prompt,5],[{name:'text'},{name:'cfg'}]),`text：${prompt}\ncfg：5`);
});

test('binding changes preserve grouped values and saved views discard removed display names',()=>{
    const axis={bindings:['1||cfg','2||text'],values:[[7,'forest, rain']]};
    changeAxisBindings(axis,['2||text','1||cfg'],parameters);assert.deepEqual(axis.values,[['forest, rain',7]]);
    const {xy}=fixture();Object.assign(xy.z,{current:2,display:'all',labels:{'9':'高 CFG'}});
    const saved=createWorkspaceView(JSON.parse(JSON.stringify({mode:'xy',xy})));
    assert.equal(saved.xy.z.enabled,true);assert.equal(saved.xy.z.current,2);assert.equal(saved.xy.z.display,'all');assert.equal('labels' in saved.xy.z,false);assert.deepEqual(saved.xy.z.values,xy.z.values);
});

test('axis text batches split nonempty lines while preserving commas and JSON multiline values',()=>{
    assert.deepEqual(parseAxisValues('forest, soft light\n\ncity，rain\r\nsea, sunset',['string']),['forest, soft light','city，rain','sea, sunset']);
    assert.deepEqual(parseAxisValues('one, complete prompt',['string']),['one, complete prompt']);
    const values=['forest, soft light\nwide shot','  spaces stay  ','','[literal text]'];
    assert.deepEqual(parseAxisValues(JSON.stringify(values),['string']),values);
    assert.deepEqual(parseAxisValues(formatAxisValues(values,['string']),['string']),values);
    assert.equal(formatAxisValues(['forest, cabin','city, rain'],['string']),'forest, cabin\ncity, rain');
    assert.throws(()=>parseAxisValues('["unfinished"',['string']),/JSON/);
});

test('axis numeric batches mix commas, newlines and JSON without altering typed groups',()=>{
    assert.deepEqual(parseAxisValues('20,30\n40，50\n\n0,-2.5',['number']),[20,30,40,50,0,-2.5]);
    assert.deepEqual(parseAxisValues('[20,30.5]',['number']),[20,30.5]);
    assert.deepEqual(parseAxisValues('512,768\n\n768,1024',['number','number']),[[512,768],[768,1024]]);
    const tuples=[['forest, rain\nfull prompt',7,true],['city, night',9,false]],types=['string','number','boolean'];
    assert.deepEqual(parseAxisValues(formatAxisValues(tuples,types),types),tuples);
    assert.deepEqual(parseAxisValues('[true,false]',['boolean']),[true,false]);
    assert.throws(()=>parseAxisValues('20,invalid\n40',['number']),/有效数字/);
    assert.throws(()=>parseAxisValues('[[512]]',['number','number']),/每组需要/);
});

test('flat layer layouts do not overlap and Shift ranges remain within their own Z layer',()=>{
    const {xy,cards}=fixture();xy.z.display='all';const layers=matrixLayers(xy,{width:320,height:240});
    assert.equal(layers.length,3);assert.ok(layers[1].dx>=640);assert.ok(layers[2].dy>=480);
    const cells=matrixCells(cards,xy),start=cells.find(cell=>cell.x===0&&cell.y===0&&cell.z===1),end=cells.find(cell=>cell.x===1&&cell.y===1&&cell.z===1);
    const selected=selectXYCells(cells,[],end.card.id,start.card.id,{shiftKey:true});assert.equal(selected.length,4);assert.ok(selected.every(id=>cells.find(cell=>cell.card.id===id).z===1));
    assert.deepEqual(selectXYCells(cells,[],cells[0].card.id,start.card.id,{shiftKey:true}),[cells[0].card.id]);
});

test('axis ordering moves whole typed values at seams without mutating the input array',()=>{
    const values=[['forest, rain',7,true],['city\nnight',9,false],['sea',5,true]];
    const lastFirst=reorderAxisValues(values,2,0);assert.deepEqual(lastFirst,[values[2],values[0],values[1]]);assert.equal(lastFirst[0],values[2]);
    assert.deepEqual(reorderAxisValues(values,0,3),[values[1],values[2],values[0]]);
    assert.deepEqual(reorderAxisValues(values,1,1),values);assert.deepEqual(reorderAxisValues(values,1,2),values);
    assert.equal(values[0][0],'forest, rain');assert.equal(values[2][0],'sea');
});

test('drag writeback preserves numeric separators and JSON while protecting ambiguous text/groups',()=>{
    assert.equal(formatAxisOrder([40,20,30],['number'],'20,30,40'),'40,20,30');
    assert.equal(formatAxisOrder([40,20,30],['number'],'20，30，40'),'40，20，30');
    assert.equal(formatAxisOrder([40,20,30],['number'],'20\n30\n40'),'40\n20\n30');
    assert.equal(formatAxisOrder([true,false],['boolean'],'[false,true]'),'[true,false]');
    const tuples=[['city, night\nfull text',9],['forest',7]],types=['string','number'];
    assert.deepEqual(parseAxisValues(formatAxisOrder(tuples,types,'forest,7\ncity,9'),types),tuples);
    assert.deepEqual(parseAxisValues(formatAxisOrder(['','[literal text]'],['string'],'a\nb'),['string']),['','[literal text]']);
});

test('reordering all three axes preserves task IDs, input snapshots and output histories',()=>{
    const {xy,cards}=fixture(),before=cards.map(card=>({card,output:matrixOutput(card,xy),at:taskCoordinates(card,xy),snapshot:captureCardInputSnapshot(card)}));
    before.forEach(({output,at,snapshot})=>{output.history=[`/${at.x}-${at.y}-${at.z}.png`];output.inputHistorySnapshots=[snapshot];});
    for(const name of ['x','y','z'])xy[name].values=reorderAxisValues(xy[name].values,0,xy[name].values.length);
    synchronizeMatrix(cards,xy,parameters);assert.equal(cards.length,before.length);
    before.forEach(({card,output,at,snapshot},index)=>{
        assert.equal(cards[index],card);assert.equal(matrixOutput(card,xy),output);assert.deepEqual(output.history,[`/${at.x}-${at.y}-${at.z}.png`]);assert.equal(output.inputHistorySnapshots[0],snapshot);
        assert.deepEqual(taskCoordinates(card,xy),{x:1-at.x,y:1-at.y,z:(at.z+2)%3});
    });
});


test('axis input formatting survives reopen and workflow normalization without changing parsed values',()=>{
    for(const text of ['1, 2,3','1，2，3','1,2\n3','[1, 2, 3]','  1,2,3  ','1,1,2,3']){
        const xy=createWorkspaceView({xy:{x:{bindings:['1||steps'],values:[1,2,3],inputText:text}}}).xy;
        assert.equal(axisInputText(xy.x,['number']),text);
        const restored=createWorkspaceView(JSON.parse(JSON.stringify({xy}))).xy;
        assert.equal(axisInputText(restored.x,['number']),text);assert.deepEqual(restored.x.values,[1,2,3]);
    }
    const axis={values:[2,3],inputText:'1,2,3'};assert.equal(axisInputText(axis,['number']),'2\n3');
    axis.inputText='2,invalid';assert.equal(axisInputText(axis,['number']),'2\n3');
});

test('axis swapping carries original input syntax and rebinding discards stale input syntax',()=>{
    const {xy}=fixture();xy.x.inputText='20,30';xy.z.inputText='[5, 7, 9]';
    swapMatrixAxes(xy,'x','z');assert.equal(axisInputText(xy.x,['number']),'[5, 7, 9]');assert.equal(axisInputText(xy.z,['number']),'20,30');
    swapMatrixAxes(xy,'x','y');assert.equal('inputText' in xy.x,false);assert.equal(xy.y.inputText,'[5, 7, 9]');
    changeAxisBindings(xy.y,['2||text'],parameters);assert.equal('inputText' in xy.y,false);
});
