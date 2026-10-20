function csv(text) {
    const values=[];let value='',quoted=false;
    for(let i=0;i<text.length;i++){
        const char=text[i];
        if(char==='"'){if(quoted&&text[i+1]==='"'){value+='"';i++;}else quoted=!quoted;}
        else if(!quoted&&(char===','||char==='，')){values.push(value.trim());value='';}
        else value+=char;
    }
    if(quoted)throw new Error('引号尚未闭合。');
    values.push(value.trim());return values;
}
export function coerceValue(value,type) {
    if(type==='number'){
        if(value===''||value===null||!Number.isFinite(Number(value)))throw new Error(`“${value}”不是有效数字。`);
        return Number(value);
    }
    if(type==='boolean'){
        if(value===true||value==='true'||value===1||value==='1')return true;
        if(value===false||value==='false'||value===0||value==='0')return false;
        throw new Error('布尔参数请填写 true 或 false。');
    }
    return typeof value==='object'?JSON.stringify(value):String(value??'');
}
export function parseValues(text,types=['string']) {
    const source=text.trim();if(!source)return [];
    let rows;
    if(source.startsWith('[')){try{rows=JSON.parse(source);}catch{throw new Error('JSON 数组格式不正确。');}}
    else {const lines=source.split(/\r?\n/);rows=types.length>1?lines.map(csv):lines.length>1?lines:csv(source);}
    if(!Array.isArray(rows))throw new Error('请填写数组。');
    return rows.map(row=>{
        if(types.length===1)return coerceValue(row,types[0]);
        if(!Array.isArray(row)||row.length!==types.length)throw new Error(`每组需要 ${types.length} 个值，例如 [[512,768],[768,1024]]。`);
        return row.map((value,index)=>coerceValue(value,types[index]));
    });
}

export function parseAxisValues(text,types=['string']) {
    const source=text.trim();if(!source)return [];
    if(source.startsWith('['))return parseValues(source,types);
    const lines=source.split(/\r\n|[\r\n]/).filter(line=>line.trim());
    if(types.length>1)return parseValues(lines.join('\n'),types);
    const values=types[0]==='string'?lines:lines.flatMap(csv).filter(value=>value!=='');
    return values.map(value=>coerceValue(value,types[0]));
}

export function formatAxisValues(values,types) {
    if(!values.length)return '';
    if(types.length>1||values.some(value=>typeof value==='string'&&(/[\r\n]/.test(value)||value.trim()!==value||!value||value.startsWith('['))))return JSON.stringify(values,null,2);
    return values.map(String).join('\n');
}

export function reorderAxisValues(values,from,before) {
    const next=[...values],value=next.splice(from,1)[0];next.splice(before-(before>from?1:0),0,value);return next;
}

export function formatAxisOrder(values,types,source) {
    if(source.trim().startsWith('['))return JSON.stringify(values,null,/[\r\n]/.test(source)?2:undefined);
    const candidate=types.length>1?values.map(tuple=>tuple.join(',')).join('\n'):types[0]==='number'&&!/[\r\n]/.test(source)?values.join(source.includes('，')?'，':','):values.join('\n');
    try{if(JSON.stringify(parseAxisValues(candidate,types))===JSON.stringify(values))return candidate;}catch{}
    return JSON.stringify(values,null,2);
}

export function toggleChoiceValue(values,parameters,index,choice,checked) {
    const tuple=value=>parameters.length===1?[value]:value;
    if(!checked)return values.filter(value=>JSON.stringify(tuple(value)[index])!==JSON.stringify(choice));
    if(values.some(value=>JSON.stringify(tuple(value)[index])===JSON.stringify(choice)))return values;
    if(parameters.length===1)return [...values,choice];
    const next=values.length?[...values.at(-1)]:parameters.map(parameter=>parameter.value??parameter.choices?.[0]??(parameter.type==='number'?0:parameter.type==='boolean'?false:''));
    next[index]=choice;return [...values,next];
}

export function validateChoiceValues(values,parameters) {
    for(const value of values){
        const tuple=parameters.length===1?[value]:value;
        parameters.forEach((parameter,index)=>{if(parameter.choices?.length&&!parameter.choices.some(choice=>JSON.stringify(choice)===JSON.stringify(tuple[index])))throw new Error(`“${tuple[index]}”不在 ${parameter.name||parameter.key} 的当前选项中。`);});
    }
    return values;
}
