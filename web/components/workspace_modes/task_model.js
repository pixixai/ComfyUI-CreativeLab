let sequence=0;
const id=prefix=>`${prefix}_view_${Date.now()}_${++sequence}`;
const copy=value=>structuredClone(value);
export const bindingsOf=area=>area.targetWidgets?.length?[...area.targetWidgets]:area.targetNodeId!=null&&area.targetWidget?[`${area.targetNodeId}||${area.targetWidget}`]:[];
export const parameterKey=(node,widget)=>`${node}||${widget}`;
export const valueKey=value=>JSON.stringify(value);

export function taskSignature(card) {
    return JSON.stringify((card?.areas||[]).map(area=>[area.type,area.title||'',area.type==='preview'?String(area.targetNodeId??''):bindingsOf(area).sort(),area.type==='edit'?area.dataType||'string':'']));
}
export const matchingTasks=(cards,template)=>cards.filter(card=>taskSignature(card)===taskSignature(template));
export function cloneTask(template) {
    const card=copy(template);card.id=id('card');delete card.historyRunSequence;delete card.recordParameters;
    card.areas.forEach(area=>{
        area.id=id('area');
        if(area.type!=='preview')return;
        for(const key of ['history','historyRuns','inputHistorySnapshots','textHistory','textHistoryStatus','selectedThumbIndices'])area[key]=[];
        for(const key of ['resultUrl','textContent','textLoadState','resultKind','missingHistoryRun','_clabOutputState'])delete area[key];
        area.historyIndex=-1;
    });
    return card;
}

export function parameterValue(card,binding) {
    return card?.areas?.find(area=>area.type==='edit'&&bindingsOf(area).includes(binding))?.value;
}

export function setParameterValue(card,binding,value,label='') {
    const areas=card.areas.filter(area=>area.type==='edit'&&bindingsOf(area).includes(binding));
    const single=areas.filter(area=>bindingsOf(area).length===1);
    for(const area of areas)if(bindingsOf(area).length>1){
        area.targetWidgets=bindingsOf(area).filter(key=>key!==binding);area.targetNodeIds=[...new Set(area.targetWidgets.map(key=>key.split('||')[0]))];
        [area.targetNodeId,area.targetWidget]=area.targetWidgets[0].split('||');
    }
    if(single.length){single.forEach(area=>{area.value=copy(value);});return single[0];}
    const [nodeId,widget]=binding.split('||');
    const area={...(areas[0]?copy(areas[0]):{}),id:id('area'),type:'edit',title:label||widget,value:copy(value),dataType:typeof value==='boolean'?'boolean':typeof value==='number'?'number':'string',autoHeight:true,
        targetNodeId:nodeId,targetWidget:widget,targetNodeIds:[nodeId],targetWidgets:[binding]};
    card.areas.push(area);return area;
}

export function axisTuple(axis,value) {
    if(axis.bindings.length===1)return [value];
    if(!Array.isArray(value)||value.length!==axis.bindings.length)throw new Error('组合值的数量必须与该轴绑定的参数数量相同。');
    return value;
}

export function taskCoordinates(card,xy) {
    const at=axis=>{
        const values=axis.bindings.map(binding=>parameterValue(card,binding));
        if(!values.length||values.some(value=>value===undefined))return -1;
        return axis.values.findIndex(value=>valueKey(axisTuple(axis,value))===valueKey(values));
    };
    return {x:at(xy.x),y:at(xy.y),...(xy.z?.enabled?{z:at(xy.z)}:{})};
}

export function importTaskRows(template,rows) {
    if(!Array.isArray(rows)||rows.some(row=>!row||typeof row!=='object'||Array.isArray(row)))throw new Error('请使用 JSON 对象数组，每个对象对应一张任务。');
    const fields=template.areas.filter(area=>area.type==='edit');
    for(const row of rows)for(const name of Object.keys(row))if(fields.filter(area=>area.title===name||area.id===name).length!==1)throw new Error(`字段“${name}”不存在或名称重复，请使用明确的字段名称或模块 ID。`);
    return rows.map(row=>{const card=cloneTask(template);for(const [name,value] of Object.entries(row)){const index=template.areas.findIndex(area=>area.type==='edit'&&(area.title===name||area.id===name));card.areas[index].value=copy(value);}return card;});
}
