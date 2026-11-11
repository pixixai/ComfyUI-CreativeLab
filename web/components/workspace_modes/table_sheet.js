import { bindingsOf, matchingTasks } from './task_model.js';
import { tableCellValue } from './table_model.js';

let sequence=0;
const id=kind=>`table_${kind}_${Date.now()}_${++sequence}`;
export const columnKeys=['type','title','targetNodeId','targetWidget','targetNodeIds','targetWidgets','dataType','runtimeNodeBypassed','runtimeNodeDisabled'];
const config=area=>Object.fromEntries(columnKeys.filter(key=>area[key]!==undefined).map(key=>[key,structuredClone(area[key])]));
const copyConfig=(target,source)=>{for(const key of columnKeys)if(source[key]===undefined)delete target[key];else target[key]=structuredClone(source[key]);};
export const boundColumn=area=>area.type==='preview'?area.targetNodeId!==undefined&&area.targetNodeId!==null&&area.targetNodeId!=='':bindingsOf(area).length>0;
export const hasCellValue=value=>value!==undefined&&value!==null&&value!=='';
export const effectiveTableRow = row => row.areas.some(area => area.type === 'edit' && boundColumn(area) && hasCellValue(area.value));
export function tableSelectionIds(rows, columns, effectiveOnly) {
    const includedColumns = effectiveOnly ? columns.filter(column => boundColumn(column.area)) : columns;
    const includedRows = effectiveOnly ? rows.filter(effectiveTableRow) : rows;
    return includedRows.flatMap(row => includedColumns.map(column => row.areas[column.index].id));
}
export const draftAreaId=(row,column)=>`${row.id}__${column.id}`;
export function selectedTableColumns(sheet, cards, selectedIds) {
    if (!sheet || !selectedIds.size) return [];
    const rows = new Set(sheet.rows.map(row => row.cardId).filter(Boolean));
    const ids = new Set();
    for (const card of cards) {
        if (!rows.has(card.id)) continue;
        for (const area of card.areas) if (selectedIds.has(area.id)) ids.add(area.tableColumnId);
    }
    return sheet.columns.filter(column => ids.has(column.id) ||
        sheet.rows.some(row => selectedIds.has(draftAreaId(row, column))));
}

export function addSheetColumn(sheet,at=sheet.columns.length) {
    const key=id('column'),column={id:key,tableColumnId:key,type:'edit',title:'',value:'',dataType:'string'};sheet.columns.splice(at,0,column);return column;
}
export function addSheetRow(sheet,at=sheet.rows.length) {
    const row={id:id('row'),values:{}};sheet.rows.splice(at,0,row);return row;
}

export function resetTableColumn(sheet,cards,view,id) {
    const column=sheet.columns.find(column=>column.id===id);if(!column)return [];
    for(const key of columnKeys)delete column[key];Object.assign(column,{type:'edit',title:'',value:'',dataType:'string',targetNodeId:null,targetWidget:null,targetNodeIds:[],targetWidgets:[]});
    delete view.configured[id];
    delete view.drafts[id];
    const changed=[];
    for(const row of sheet.rows){delete row.values[id];const area=cards.find(card=>card.id===row.cardId)?.areas.find(area=>area.tableColumnId===id);if(area){copyConfig(area,column);area.value='';changed.push(area.id);}}
    return changed;
}

export function openTableSheet(cards,view,source) {
    view.sheets??=[];
    let sheet=source?view.sheets.find(sheet=>sheet.rows.some(row=>row.cardId===source.id)):view.sheets.find(sheet=>sheet.id===view.sheetId);
    if(!sheet){
        sheet={id:id('sheet'),columns:[],rows:[]};view.sheets.push(sheet);
        const members=source?matchingTasks(cards,source):[];
        const used=new Set();for(const [index,area]of (source?.areas||view.schema||[]).entries()){
            const key=area.tableColumnId&&!used.has(area.tableColumnId)?area.tableColumnId:area.id;used.add(key);sheet.columns.push({...config(area),id:key,tableColumnId:key,value:''});
            for(const card of members)card.areas[index].tableColumnId=key;
        }
        sheet.rows=members.map(card=>({id:card.id,cardId:card.id,values:{}}));
    }
    view.sheetId=sheet.id;return sheet;
}

export function synchronizeSheet(sheet,cards) {
    const areas=[];
    for(const row of sheet.rows){
        const card=cards.find(card=>card.id===row.cardId);if(!card)continue;
        const used=new Set();for(const area of card.areas){
            const key=area.tableColumnId&&!used.has(area.tableColumnId)?area.tableColumnId:area.id;used.add(key);area.tableColumnId=key;
            areas.push(area);let column=sheet.columns.find(column=>column.id===key);
            if(!column){column={...config(area),id:key,tableColumnId:key,value:''};sheet.columns.push(column);}
        }
    }
    for(const column of sheet.columns){const changed=areas.find(area=>area.tableColumnId===column.id&&JSON.stringify(config(area))!==JSON.stringify(config(column)));if(changed)copyConfig(column,changed);}
}

export function projectTableSheet(sheet,cards) {
    const actual=new Map(cards.map(card=>[card.id,card]));
    return sheet.rows.map(row=>{
        const card=actual.get(row.cardId),areas=new Map((card?.areas||[]).map(area=>[area.tableColumnId,area]));
        return {id:row.id,title:(card ? card.title : row.title)||'',sheetRow:row,areas:sheet.columns.map(column=>areas.get(column.id)||{...column,id:draftAreaId(row,column),value:row.values[column.id]??'',tableColumnId:column.id})};
    });
}

export function validSheetRow(sheet,row,parameters=[]) {
    let filled=false;
    for(const [index,column]of sheet.columns.entries())if(column.type==='edit'&&boundColumn(column)&&hasCellValue(row.areas[index].value)){
        try{tableCellValue(column,row.areas[index].value,parameters);filled=true;}catch{return false;}
    }
    return filled;
}

export function materializeTable(sheet,cards,parameters=[]) {
    const projected=projectTableSheet(sheet,cards),active=sheet.columns.filter(boundColumn),changed=[];
    for(const row of projected){
        const entry=row.sheetRow,valid=validSheetRow(sheet,row,parameters);let card=cards.find(card=>card.id===entry.cardId);
        if(!card&&valid&&active.length){card={id:entry.id,title:entry.title||'',areas:[]};cards.push(card);entry.cardId=card.id;}
        if(!card)continue;
        for(const column of sheet.columns){
            let area=card.areas.find(area=>area.tableColumnId===column.id);
            if(!area&&boundColumn(column)&&valid){
                area={id:draftAreaId(entry,column),tableColumnId:column.id,autoHeight:true,matchMedia:true,ratio:'16:9',fillMode:'显示全部',value:entry.values[column.id]??''};card.areas.push(area);changed.push(area.id);
            }
            if(!area)continue;
            if(JSON.stringify(config(area))!==JSON.stringify(config(column)))changed.push(area.id);
            copyConfig(area,column);
            if(column.type==='preview'){area.history??=[];area.historyIndex??=-1;}
            if(Object.hasOwn(entry.values,column.id)){area.value=entry.values[column.id];delete entry.values[column.id];changed.push(area.id);}
            if(valid&&column.type==='edit'&&boundColumn(column)&&hasCellValue(area.value))area.value=tableCellValue(column,area.value,parameters);
        }
        card.areas.sort((a,b)=>sheet.columns.findIndex(column=>column.id===a.tableColumnId)-sheet.columns.findIndex(column=>column.id===b.tableColumnId));
    }
    return [...new Set(changed)];
}

export function writeSheetCells(sheet,cards,startRow,startColumn,values,parameters,expand=false) {
    const typed=values.map((row,offset)=>row.map((value,index)=>{
        const column=sheet.columns[startColumn+index]||(expand?{type:'edit',dataType:'string'}:null);if(!column)throw new Error('粘贴内容超出现有列，请先添加列。');
        try{return tableCellValue(column,value,parameters);}catch(error){throw new Error(`第 ${startRow+offset+1} 行、第 ${startColumn+index+1} 列：${error.message}`);}
    }));
    if(expand)while(sheet.columns.length<startColumn+Math.max(...typed.map(row=>row.length)))addSheetColumn(sheet);
    while(sheet.rows.length<startRow+typed.length)addSheetRow(sheet);
    typed.forEach((values,offset)=>values.forEach((value,index)=>{
        const row=sheet.rows[startRow+offset],column=sheet.columns[startColumn+index],area=cards.find(card=>card.id===row.cardId)?.areas.find(area=>area.tableColumnId===column.id);
        if(area)area.value=value;else row.values[column.id]=value;
    }));
}

export function sheetRunRows(sheet,cards,parameters=[]) {
    return projectTableSheet(sheet,cards).filter(row=>row.sheetRow.cardId&&validSheetRow(sheet,row,parameters)).map(row=>({cardId:row.id,previewAreaIds:row.areas.filter(area=>area.type==='preview'&&boundColumn(area)).map(area=>area.id)})).filter(task=>task.previewAreaIds.length);
}

export function orderSheetTasks(sheet,cards) {
    const owned=new Set(sheet.rows.map(row=>row.cardId).filter(Boolean)),ordered=sheet.rows.map(row=>cards.find(card=>card.id===row.cardId)).filter(Boolean);let index=0;
    for(let at=0;at<cards.length;at++)if(owned.has(cards[at].id))cards[at]=ordered[index++];
}
