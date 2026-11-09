import { bindingsOf } from './task_model.js';

export function reorderTableItems(items,ids,targetId,after=false,swap=false) {
    const selected=new Set(ids),from=items.filter(item=>selected.has(item.id)),target=items.find(item=>item.id===targetId);
    if(!from.length||!target||selected.has(targetId))return false;
    if(swap&&from.length===1){const a=items.indexOf(from[0]),b=items.indexOf(target);[items[a],items[b]]=[items[b],items[a]];}
    else{const rest=items.filter(item=>!selected.has(item.id)),at=rest.indexOf(target)+(after?1:0);rest.splice(at,0,...from);items.splice(0,items.length,...rest);}
    return true;
}

export function tableCellRange(group,columns,first,last) {
    const locate=id=>{for(let row=0;row<group.length;row++){const column=columns.findIndex(entry=>group[row].areas[entry.index]?.id===id);if(column>=0)return {row,column};}return null;};
    const a=locate(first),b=locate(last);if(!a||!b)return [last];const ids=[];
    for(let row=Math.min(a.row,b.row);row<=Math.max(a.row,b.row);row++)for(let column=Math.min(a.column,b.column);column<=Math.max(a.column,b.column);column++)ids.push(group[row].areas[columns[column].index].id);
    return ids;
}

export function tablePasteTarget(group, columns, selectedIds, anchorId, values) {
    const height = values.length;
    const width = values[0]?.length || 0;
    if (!height || !width || values.some(row => row.length !== width)) {
        throw new Error('复制的数据不是完整的矩形表格。');
    }
    const positions = new Map();
    group.forEach((row, r) => columns.forEach((column, c) => {
        positions.set(row.areas[column.index].id, { row: r, column: c });
    }));
    const selected = [...new Set(selectedIds)].map(id => positions.get(id)).filter(Boolean);
    if (selected.length <= 1) {
        const start = selected[0] || positions.get(anchorId);
        if (!start) throw new Error('请先选中粘贴的起始单元格。');
        return start;
    }
    const selectedRows = selected.map(cell => cell.row);
    const selectedColumns = selected.map(cell => cell.column);
    const top = Math.min(...selectedRows);
    const left = Math.min(...selectedColumns);
    const rows = Math.max(...selectedRows) - top + 1;
    const cols = Math.max(...selectedColumns) - left + 1;
    if (selected.length !== rows * cols) throw new Error('请选中连续的矩形区域后粘贴。');
    return { row: top, column: left, height: rows, width: cols };
}

export function tableParameter(area,parameters) {
    return parameters.find(parameter=>parameter.key===bindingsOf(area)[0])||{type:area.dataType||'string',choices:[]};
}

export function tableCellValue(area,value,parameters) {
    if(area.type!=='edit')throw new Error('输出列只读，请从输入列开始粘贴。');
    if(value==='')return '';
    const parameter=tableParameter(area,parameters);
    if(parameter.type==='number'){
        if(String(value).trim()===''||!Number.isFinite(Number(value)))throw new Error(`“${area.title||'数字参数'}”需要有效数字。`);
        value=Number(value);
    }else if(parameter.type==='boolean'){
        if(value===true||value==='true'||value==='True'||value==='1')value=true;
        else if(value===false||value==='false'||value==='False'||value==='0')value=false;
        else throw new Error(`“${area.title||'布尔参数'}”请填写 true 或 false。`);
    }else value=String(value);
    if(!parameter.uploadType&&parameter.choices?.length&&!parameter.choices.includes(value))throw new Error(`“${area.title||'选项参数'}”不包含选项“${value}”。`);
    return value;
}

export function parseTableClipboard(text) {
    const rows=[],row=[];let field='',quoted=false;
    text=String(text).replace(/\r\n?/g,'\n');
    for(let i=0;i<text.length;i++){
        const char=text[i];
        if(char==='"'&&(quoted||field==='')){
            if(quoted&&text[i+1]==='"'){field+='"';i++;}else quoted=!quoted;
        }else if(!quoted&&(char==='\t'||char==='\n')){
            row.push(field);field='';if(char==='\n'){rows.push([...row]);row.length=0;}
        }else field+=char;
    }
    if(quoted)throw new Error('粘贴内容的引号未闭合。');
    if(field!==''||row.length||!rows.length){row.push(field);rows.push(row);}
    return rows;
}
