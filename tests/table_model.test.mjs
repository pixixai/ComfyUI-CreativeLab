import assert from 'node:assert/strict';
import test from 'node:test';
import { cloneTask } from '../web/components/workspace_modes/task_model.js';
import { parseTableClipboard, tableCellRange, tableCellValue, reorderTableItems, tablePasteTarget } from '../web/components/workspace_modes/table_model.js';
import { parseTableValues, formatTableOrder } from '../web/components/workspace_modes/table_fill.js';
import { tableColumnWidth, tableRowHeight, resizeTableCells, tablePadding, parseTablePadding, tableRatios, tableRatioPosition, tablePresetSize } from '../web/components/workspace_modes/table_layout.js';
import { selectAllValues, clearChoiceValues } from '../web/components/workspace_modes/value_choices.js';
import { createWorkspaceView } from '../web/components/workspace_modes/view_state.js';
import { tableAppearance, setTableAppearance, setTableCellAppearance } from '../web/components/workspace_modes/table_appearance.js';
import { openTableSheet, addSheetColumn, addSheetRow, projectTableSheet, materializeTable, writeSheetCells, synchronizeSheet, sheetRunRows, orderSheetTasks, resetTableColumn, tableSelectionIds } from '../web/components/workspace_modes/table_sheet.js';
const parameters=[{key:'1||steps',type:'number',choices:[]},{key:'1||sampler',type:'string',choices:['Euler','DPM']},{key:'1||enabled',type:'boolean',choices:[true,false]}];
const fixture=()=>{const source={id:'a',title:'A',areas:[{id:'steps',type:'edit',title:'步数',targetNodeId:'1',targetWidget:'steps',targetWidgets:['1||steps'],dataType:'number',value:20},{id:'out',type:'preview',targetNodeId:'2',history:['/a.png'],historyIndex:0}]},other=cloneTask(source);other.id='b';other.areas[0].value=30;other.areas[1].history=['/b.png'];const cards=[source,other],view=createWorkspaceView().table,sheet=openTableSheet(cards,view,source);return {source,other,cards,view,sheet};};
const bind=(column,key,type='number')=>Object.assign(column,{targetNodeId:key.split('||')[0],targetWidget:key.split('||')[1],targetWidgets:[key],dataType:type});

test('background grid drafts do not allocate cards or modules until a bound input contains a value',()=>{
    const cards=[],view=createWorkspaceView().table,sheet=openTableSheet(cards,view),input=addSheetColumn(sheet),output=addSheetColumn(sheet);output.type='preview';output.targetNodeId='2';addSheetRow(sheet);
    writeSheetCells(sheet,cards,0,0,[['20']],parameters);materializeTable(sheet,cards,parameters);assert.equal(cards.length,0);
    bind(input,'1||steps');materializeTable(sheet,cards,parameters);assert.equal(cards.length,1);assert.equal(cards[0].areas[0].value,20);assert.equal(cards[0].areas.length,2);assert.deepEqual(cards[0].areas[1].history,[]);
    const unused=addSheetColumn(sheet);materializeTable(sheet,cards);assert.equal(cards[0].areas.length,2);assert.equal(projectTableSheet(sheet,cards)[0].areas[2].tableColumnId,unused.id);
});

test('zero and false form valid tasks; invalid pre-binding input stays a draft and cannot run',()=>{
    const cards=[],view=createWorkspaceView().table,sheet=openTableSheet(cards,view),column=addSheetColumn(sheet),output=addSheetColumn(sheet);output.type='preview';output.targetNodeId='2';
    writeSheetCells(sheet,cards,0,0,[['bad']],parameters);bind(column,'1||steps');materializeTable(sheet,cards,parameters);assert.equal(cards.length,0);assert.deepEqual(sheetRunRows(sheet,cards,parameters),[]);
    writeSheetCells(sheet,cards,0,0,[[0]],parameters);materializeTable(sheet,cards,parameters);assert.equal(cards.length,1);assert.equal(sheetRunRows(sheet,cards,parameters).length,1);
    bind(column,'1||enabled','boolean');writeSheetCells(sheet,cards,1,0,[[false]],parameters);materializeTable(sheet,cards,parameters);assert.equal(cards.length,2);assert.equal(cards[1].areas[0].value,false);
});

test('clearing or unbinding a row stops execution while preserving real task identities and histories',()=>{
    const {cards,sheet,source}=fixture(),area=source.areas[1],history=area.history;
    writeSheetCells(sheet,cards,0,0,[['']],parameters);materializeTable(sheet,cards,parameters);assert.equal(cards.length,2);assert.equal(source.areas[1],area);assert.equal(area.history,history);assert.deepEqual(sheetRunRows(sheet,cards,parameters).map(task=>task.cardId),['b']);
    sheet.columns[0].targetWidgets=[];sheet.columns[0].targetWidget=null;materializeTable(sheet,cards);assert.deepEqual(sheetRunRows(sheet,cards),[]);assert.equal(area.history,history);
});

test('native binding edits synchronize a column once without reverting to unchanged rows or copying values',()=>{
    const {cards,sheet,source,other}=fixture(),id=other.areas[0].id;
    bind(source.areas[0],'1||enabled','boolean');source.areas[0].title='新标题';synchronizeSheet(sheet,cards);materializeTable(sheet,cards);
    assert.equal(sheet.columns[0].title,'新标题');assert.equal(other.areas[0].id,id);assert.deepEqual(other.areas[0].targetWidgets,['1||enabled']);assert.equal(other.areas[0].value,30);assert.deepEqual(other.areas[1].history,['/b.png']);
});

test('inserted rows and columns keep existing cells attached to their identities and never duplicate history',()=>{
    const {cards,sheet,source}=fixture(),original=source.areas[0],output=source.areas[1],newColumn=addSheetColumn(sheet,1),newRow=addSheetRow(sheet,1);
    writeSheetCells(sheet,cards,1,1,[['draft']],parameters);materializeTable(sheet,cards,parameters);assert.equal(cards.length,2);assert.equal(source.areas[0],original);assert.equal(source.areas[1],output);assert.equal(newRow.cardId,undefined);
    writeSheetCells(sheet,cards,1,0,[[40]],parameters);materializeTable(sheet,cards,parameters);orderSheetTasks(sheet,cards);assert.deepEqual(cards.map(card=>card.id),['a',newRow.id,'b']);assert.equal(cards[1].areas.length,2);assert.deepEqual(cards[1].areas[1].history,[]);assert.equal(projectTableSheet(sheet,cards)[1].areas[1].value,'draft');assert.equal(newColumn.id,projectTableSheet(sheet,cards)[1].areas[1].tableColumnId);
});

test('grid caches different task structures and duplicate cloned columns get distinct identities',()=>{
    const {cards,sheet,view,source}=fixture();const unrelated={id:'other',areas:[]};cards.push(unrelated);const next=openTableSheet(cards,view,unrelated);assert.notEqual(next.id,sheet.id);assert.equal(openTableSheet(cards,view,source),sheet);
    source.areas.push({...source.areas[0],id:'clone'});synchronizeSheet(sheet,cards);assert.notEqual(source.areas[0].tableColumnId,source.areas[2].tableColumnId);assert.equal(new Set(sheet.columns.map(column=>column.id)).size,3);
});

test('rectangular pastes validate all cells before any writes or new draft rows',()=>{
    const {cards,sheet}=fixture(),before=structuredClone({cards,sheet});assert.throws(()=>writeSheetCells(sheet,cards,1,0,[['25'],['invalid']],parameters),/有效数字/);assert.deepEqual({cards,sheet},before);
    assert.throws(()=>writeSheetCells(sheet,cards,0,1,[['overwrite']],parameters),/只读/);assert.deepEqual({cards,sheet},before);
    assert.deepEqual(parseTableClipboard('"a\tb"\t20\r\n"line 1\nline 2"\t30\r\n'),[['a\tb','20'],['line 1\nline 2','30']]);assert.throws(()=>parseTableClipboard('"unfinished'),/引号/);
});

test('Shift selection follows a rectangle including draft cells and different module types',()=>{
    const {cards,sheet}=fixture();addSheetColumn(sheet);addSheetRow(sheet);const rows=projectTableSheet(sheet,cards),columns=sheet.columns.map((area,index)=>({id:area.id,area,index}));
    assert.deepEqual(tableCellRange(rows,columns,rows[0].areas[0].id,rows[2].areas[0].id),rows.map(row=>row.areas[0].id));assert.equal(tableCellRange(rows,columns,rows[0].areas[0].id,rows[1].areas[2].id).length,6);
});

test('effective-area selection includes bound columns and rows with a bound input value, including zero and false',()=>{
    const {cards,sheet}=fixture();
    addSheetColumn(sheet);
    const draft=addSheetRow(sheet);
    draft.values[sheet.columns[2].id]='unbound draft';
    cards[0].areas[0].value=0;
    cards[1].areas[0].value=false;
    const rows=projectTableSheet(sheet,cards),columns=sheet.columns.map((area,index)=>({area,index}));
    assert.deepEqual(tableSelectionIds(rows,columns,true),rows.slice(0,2).flatMap(row=>row.areas.slice(0,2).map(area=>area.id)));
    assert.deepEqual(tableSelectionIds(rows,columns,false),rows.flatMap(row=>row.areas.map(area=>area.id)));
});

test('fixed dimensions distinguish individual and all-axis updates within the current sheet',()=>{
    const {cards,sheet,view,source}=fixture(),rows=projectTableSheet(sheet,cards),output=source.areas[1];
    resizeTableCells(view,sheet,'height',220,['a']);
    assert.equal(tableRowHeight(view,rows[0]),220);
    assert.equal(tableRowHeight(view,rows[1]),144);
    resizeTableCells(view,sheet,'width',360,sheet.columns.map(column=>column.id));
    assert.deepEqual(sheet.columns.map(column=>tableColumnWidth(column,view)),[360,360]);
    view.widths.other=400;
    resizeTableCells(view,sheet,'width',280);
    resizeTableCells(view,sheet,'height',170);
    const dimensions={...view,...{columnWidth:sheet.columnWidth,rowHeight:sheet.rowHeight}};
    assert.equal(tableColumnWidth(addSheetColumn(sheet),dimensions),280);
    assert.equal(tableRowHeight(dimensions,rows[0]),170);
    assert.deepEqual(view.widths,{other:400});
    assert.equal(output.width,undefined);
    assert.deepEqual(output.history,['/a.png']);
    assert.equal(resizeTableCells(view,sheet,'height',-1),false);
});

test('ratio presets change one dimension while custom dimensions interpolate between adjacent presets',()=>{
    assert.deepEqual(tableRatios.map(ratio=>ratio.join(':')),['9:21','1:2','6:11','9:16','2:3','3:4','4:5','5:6','1:1','6:5','5:4','4:3','3:2','16:9','2:1','21:9']);
    assert.equal(tablePresetSize('width',3,256,144),81);
    assert.equal(tablePresetSize('height',3,81,144),144);
    assert.equal(tableRatioPosition(81,144,'width'),3);
    assert.equal(tableRatioPosition(81,144,'height'),3);
    assert.ok(tableRatioPosition(126,144,'width')>7 && tableRatioPosition(126,144,'width')<8);
    assert.equal(tablePresetSize('height',0,6000,144),2000);
});

test('grid draft values and sheet, row and column appearances survive persistence without history copies',()=>{
    const {cards,sheet,view}=fixture();
    addSheetColumn(sheet);
    const row=addSheetRow(sheet), id=sheet.columns[0].id;
    row.values[sheet.columns[2].id]='draft';
    view.heights[row.id]=240;
    view.widths[id]=256;
    view.alignments[id]=8;
    view.rowAlignments[row.id]=0;
    view.rowPaddings[row.id]=parseTablePadding('0');
    view.columnPaddings[id]=parseTablePadding('10、20');
    sheet.padding={top:4,bottom:8,left:12,right:16};
    sheet.alignment=4;
    view.configured[id]=true;
    const next=createWorkspaceView({mode:'table',table:JSON.parse(JSON.stringify(view))}).table;
    assert.deepEqual(next,view);
    assert.equal(JSON.stringify(next.sheets).includes('/a.png'),false);
    assert.equal(projectTableSheet(next.sheets[0],cards).at(-1).areas[2].value,'draft');
});

test('appearance updates resolve per property by latest scope and survive reload',()=>{
    const {sheet,view}=fixture(), row=sheet.rows[0].id, col=sheet.columns[0].id;
    view.rowAlignments[row]=0;
    view.alignments[col]=8;
    const resolved = (key, layout=view, table=sheet) => tableAppearance({...layout, ...table, sheetId:table.id},key,row,col);
    assert.equal(resolved('alignment'),0,'legacy order should remain when no edit history exists');
    setTableAppearance(view,sheet,'column',col,'alignment',8);
    setTableAppearance(view,sheet,'row',row,'padding',parseTablePadding('9'));
    assert.equal(resolved('alignment'),8);
    assert.deepEqual(resolved('padding'),parseTablePadding('9'));
    setTableAppearance(view,sheet,'table',undefined,'alignment',4);
    assert.equal(resolved('alignment'),4);
    setTableAppearance(view,sheet,'row',row,'alignment',0);
    setTableCellAppearance(view,sheet,[{rowId:row,columnId:col}],'padding',parseTablePadding('2'));
    assert.deepEqual(resolved('padding'),parseTablePadding('2'));
    setTableAppearance(view,sheet,'row',row,'padding',parseTablePadding('3'));
    assert.deepEqual(resolved('padding'),parseTablePadding('3'));
    const restored=createWorkspaceView({table:JSON.parse(JSON.stringify(view))}).table;
    const restoredSheet=restored.sheets[0];
    assert.equal(resolved('alignment',restored,restoredSheet),0);
    setTableAppearance(restored,restoredSheet,'row',row);
    assert.equal(resolved('alignment',restored,restoredSheet),4);
    assert.deepEqual(resolved('padding',restored,restoredSheet),parseTablePadding('2'));
});

test('typed batch input keeps numeric formatting and permits empty JSON placeholders',()=>{
    assert.deepEqual(parseTableValues('1, 2\n3','number'),[1,2,3]);assert.deepEqual(parseTableValues('forest, cabin\nsea, light','string'),['forest, cabin','sea, light']);assert.deepEqual(parseTableValues('[1,"",null,0]','number'),[1,'','',0]);assert.deepEqual(formatTableOrder([3,1,2],'number',{text:'1,2,3',format:'auto'}),{text:'3,1,2',format:'auto'});
    assert.throws(()=>tableCellValue({type:'edit',dataType:'number'},'bad',[]),/有效数字/);
});

test('select all and cancel selection retain paired types and preserve other fields',()=>{
    const fields=[{name:'enabled',type:'boolean',choices:[true,false]}];assert.deepEqual(selectAllValues([false],fields,0),[false,true]);assert.deepEqual(clearChoiceValues([true,false],fields,0),[]);
    const pair=[{name:'steps',type:'number',choices:[]},{name:'sampler',choices:['Euler','DPM']}];assert.deepEqual(selectAllValues([[30,'DPM']],pair,1),[[30,'DPM'],[30,'Euler']]);assert.deepEqual(clearChoiceValues([[30,'DPM']],pair,1),[]);
});

test('single-column drops swap stable column identities and batch moves retain relative order without inserting items',()=>{
    const {sheet,cards}=fixture();addSheetColumn(sheet);addSheetColumn(sheet);const ids=sheet.columns.map(column=>column.id),count=sheet.columns.length;
    assert.equal(reorderTableItems(sheet.columns,[ids[0]],ids[3],false,true),true);assert.deepEqual(sheet.columns.map(column=>column.id),[ids[3],ids[1],ids[2],ids[0]]);assert.equal(sheet.columns.length,count);
    reorderTableItems(sheet.columns,[ids[3],ids[2]],ids[0],true,true);assert.deepEqual(sheet.columns.map(column=>column.id),[ids[1],ids[0],ids[3],ids[2]]);assert.equal(reorderTableItems(sheet.columns,[ids[0],ids[1]],ids[1]),false);
    materializeTable(sheet,cards,parameters);assert.equal(cards[0].areas.find(area=>area.id==='out').history[0],'/a.png');assert.deepEqual(new Set(projectTableSheet(sheet,cards)[0].areas.map(area=>area.tableColumnId)),new Set(ids));
});

test('row groups reorder together while canonical cards and history identities survive',()=>{
    const {sheet,cards}=fixture(),a=sheet.rows[0],b=sheet.rows[1],c=addSheetRow(sheet),d=addSheetRow(sheet);reorderTableItems(sheet.rows,[a.id,b.id],d.id,true);assert.deepEqual(sheet.rows,[c,d,a,b]);orderSheetTasks(sheet,cards);assert.deepEqual(cards.map(card=>card.id),['a','b']);assert.deepEqual(cards[1].areas[1].history,['/b.png']);
});

test('four independent padding sides default to ten and migrate saved uniform values',()=>{
    assert.deepEqual(createWorkspaceView().table.padding,{top:10,bottom:10,left:10,right:10});assert.deepEqual(tablePadding(8),{top:8,bottom:8,left:8,right:8});assert.deepEqual(tablePadding({top:0,bottom:12,left:4,right:100}),{top:0,bottom:12,left:4,right:64});
    assert.deepEqual(parseTablePadding('10、6'),{top:10,bottom:6,left:0,right:0});
    assert.deepEqual(parseTablePadding('10，6 4,2'),{top:10,bottom:6,left:4,right:2});
    assert.throws(()=>parseTablePadding('10, -2'),/整数/);
});

test('column reset clears bindings and values, restores settings, and retains row/column identity and histories',()=>{
    const {sheet,cards,view}=fixture(),id=sheet.columns[1].id,before=cards.map(c=>c.areas.map(a=>a.id));view.widths[id]=500;view.columnPaddings[id]=parseTablePadding('7');view.configured[id]=true;view.alignments[id]=8;view.drafts[id]={text:'old'};view.heights.a=200;view.rowHeight=180;const draft=addSheetRow(sheet);draft.values[id]='draft';
    const changed=resetTableColumn(sheet,cards,view,id);assert.equal(changed.length,2);assert.deepEqual(cards.map(c=>c.areas.map(a=>a.id)),before);assert.deepEqual(cards.map(c=>c.areas[1].history),[['/a.png'],['/b.png']]);assert.deepEqual(cards.map(c=>c.areas[1].value),['','']);assert.deepEqual(cards.map(c=>c.areas[1].targetWidgets),[[],[]]);assert.equal(sheet.columns[1].type,'edit');assert.equal(sheet.rowHeight,undefined);assert.deepEqual(view.heights,{a:200});
    for(const key of ['configured','drafts'])assert.equal(view[key][id],undefined);assert.equal(view.widths[id],500);assert.deepEqual(view.columnPaddings[id],parseTablePadding('7'));assert.equal(view.alignments[id],8);assert.equal(draft.values[id],undefined);materializeTable(sheet,cards,parameters);assert.equal(sheet.columns[1].targetNodeId,null);assert.equal(cards[0].areas[0].value,20);
});

test('matrix paste uses the selected anchor and returns the rectangular selection bounds independently of source dimensions',()=>{
    const {cards,sheet}=fixture();addSheetColumn(sheet);addSheetRow(sheet);const rows=projectTableSheet(sheet,cards),columns=sheet.columns.map((area,index)=>({area,index})),id=(r,c)=>rows[r].areas[c].id;
    assert.deepEqual(tablePasteTarget(rows,columns,[id(1,1)],id(0,0),[['a','b'],['c','d']]),{row:1,column:1});
    assert.deepEqual(tablePasteTarget(rows,columns,[id(1,1),id(0,0),id(1,0),id(0,1)],id(1,1),[['a','b'],['c','d']]),{row:0,column:0,height:2,width:2});
    assert.throws(()=>tablePasteTarget(rows,columns,[id(0,0),id(1,1)],id(1,1),[['a','b']]),/连续的矩形/);
    assert.deepEqual(tablePasteTarget(rows,columns,[id(0,0),id(0,1)],id(0,1),[['a'],['b']]),{row:0,column:0,height:1,width:2});
    assert.throws(()=>tablePasteTarget(rows,columns,[id(0,0)],id(0,0),[['a'],['b','c']]),/完整的矩形/);
});

test('single-anchor paste expands draft columns and rows only after all values validate',()=>{
    const {sheet,cards}=fixture(),before=JSON.stringify({sheet,cards});assert.throws(()=>writeSheetCells(sheet,cards,0,0,[[20,'output read-only','new draft']],parameters,true),/第 1 行、第 2 列/);assert.equal(JSON.stringify({sheet,cards}),before);
    writeSheetCells(sheet,cards,2,2,[['a','b'],['c','d']],parameters,true);assert.equal(sheet.columns.length,4);assert.equal(sheet.rows.length,4);assert.equal(cards.length,2);assert.deepEqual(projectTableSheet(sheet,cards).slice(2).map(row=>row.areas.slice(2).map(area=>area.value)),[['a','b'],['c','d']]);
});

test('Excel TSV preserves empty cells, quoted tabs, multiline values and escaped quotes',()=>{
    assert.deepEqual(parseTableClipboard('"line 1\nline 2"\t"a\tb"\r\n"say ""hi"""\t\r\n'),[['line 1\nline 2','a\tb'],['say "hi"','']]);assert.deepEqual(parseTableClipboard('\t\r\n\t\r\n'),[['',''],['','']]);
});
