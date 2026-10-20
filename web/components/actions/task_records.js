export function captureTaskRecords(card,graph) {
    return (card.recordParameters||[]).map(({key,label})=>{
        const [nodeId,widgetName]=key.split('||');
        const inputs=card.areas.filter(area=>area.type==='edit'&&!area.recordOnly&&(area.targetWidgets?.length?area.targetWidgets.includes(key):String(area.targetNodeId)===nodeId&&area.targetWidget===widgetName));
        const widget=graph?.getNodeById(nodeId)?.widgets?.find(widget=>widget.name===widgetName);
        const value=inputs.length?inputs.at(-1).value:widget?.value;
        return {key,label,value:value===undefined?null:structuredClone(value),...(value===undefined?{missing:true}:{})};
    });
}

export function resolveTaskRecords(records,prompt) {
    return records.map(record=>{
        const [node,widget]=record.key.split('||'),inputs=prompt[node]?.inputs;
        return inputs&&Object.hasOwn(inputs,widget)?{key:record.key,label:record.label,value:structuredClone(inputs[widget])}:record;
    });
}
