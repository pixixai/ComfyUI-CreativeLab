import { axisTuple, parameterValue, setParameterValue, bindingsOf, valueKey } from './task_model.js';
import { archiveTaskCards, hasTaskResults } from './task_archive.js';
import { matrixInputSignature, matrixBindings } from './xy_archive.js';
import { validateChoiceValues } from './value_parser.js';

const unique=values=>[...new Map(values.map(value=>[valueKey(value),value])).values()];
const fits=(value,parameter)=>parameter?.type==='number'?typeof value==='number':parameter?.type==='boolean'?typeof value==='boolean':typeof value==='string';

export function changeAxisBindings(axis,bindings,parameters) {
    const previous=axis.bindings.length?axis.bindings:axis.valueBindings||[];
    if(!bindings.length){axis.valueBindings=[...previous];axis.bindings=[];return;}
    const removed=previous.filter(key=>!bindings.includes(key)),added=bindings.filter(key=>!previous.includes(key));
    const values=axis.values.map(value=>{
        const old=previous.length===1?[value]:value;
        const tuple=bindings.map(key=>{
            const from=previous.includes(key)?key:removed[added.indexOf(key)],parameter=parameters.find(parameter=>parameter.key===key);
            const entry=from?old[previous.indexOf(from)]:undefined;
            return entry!==undefined&&(previous.includes(key)||fits(entry,parameter))?entry:parameter?.value??'';
        });
        return bindings.length===1?tuple[0]:tuple;
    });
    const next=unique(values);
    if(valueKey(next)!==valueKey(axis.values))delete axis.inputText;
    axis.bindings=[...bindings];axis.values=next;delete axis.valueBindings;
}

export function rebindMatrixAxis(cards,xy,name,bindings,parameters,archived=[],table) {
    const axis=xy[name],previous=[...(axis.bindings.length?axis.bindings:axis.valueBindings||[])];
    const items=cards.filter(card=>xy.taskIds.includes(card.id)).map(card=>{
        const tuple=previous.map(key=>parameterValue(card,key));
        return {card,tuple:tuple.some(value=>value===undefined)?null:tuple};
    });
    const replacement=previous.some(key=>!bindings.includes(key))&&bindings.some(key=>!previous.includes(key));
    if(replacement){
        const ids=new Set(items.filter(({card})=>hasTaskResults(card)).map(({card})=>card.id));
        for(const {card} of items)if(ids.has(card.id)){
            card.xyArchiveBindings=matrixBindings({...xy,[name]:{...axis,bindings:previous}});
            card.xyArchiveOutput=String(xy.outputNodeId||'');
        }
        archiveTaskCards(cards,ids,archived,table);
    }
    changeAxisBindings(axis,bindings,parameters);
    if(!bindings.length)return;
    const initialZ=name==='z'&&!previous.length,workflowValue=key=>parameters.find(parameter=>parameter.key===key)?.value??'';
    if(initialZ){
        const workflow=bindings.map(workflowValue),tuples=items.length?items.map(({card})=>bindings.map(key=>parameterValue(card,key)??workflowValue(key))):[workflow];
        axis.values=unique(tuples.map(tuple=>bindings.length===1?tuple[0]:tuple));
        axis.current=Math.max(0,axis.values.findIndex(value=>valueKey(axisTuple(axis,value))===valueKey(workflow)));
    }
    const retained=[...['x','y',...(xy.z.enabled?['z']:[])].flatMap(axis=>xy[axis].bindings),...xy.records.map(entry=>entry.key)];
    for(const {card,tuple:old}of items){
        if(!cards.includes(card)||!old)continue;
        const untouched=card.xyInitialInput===matrixInputSignature(card);
        // Reuse the old coordinate's row after mapping, including numeric/text defaults.
        const before=previous.length===1?old[0]:old;
        const mapped={bindings:[...previous],values:previous.length?[before]:[]};
        changeAxisBindings(mapped,bindings,parameters);
        const tuple=initialZ?bindings.map(key=>parameterValue(card,key)??workflowValue(key)):mapped.values.length?axisTuple(mapped,mapped.values[0]):bindings.map(workflowValue);
        bindings.forEach((key,index)=>{setParameterValue(card,key,tuple[index],parameters.find(parameter=>parameter.key===key)?.name||key.split('||')[1]).recordOnly=false;});
        card.areas=card.areas.filter(area=>!(area.type==='edit'&&bindingsOf(area).length===1&&previous.includes(bindingsOf(area)[0])&&!retained.includes(bindingsOf(area)[0])));
        if(untouched&&!hasTaskResults(card))card.xyInitialInput=matrixInputSignature(card);
    }
}

export function rebindMatrixOutput(cards,xy,nodeId,archived,table) {
    const ids=new Set(cards.filter(card=>xy.taskIds.includes(card.id)&&hasTaskResults(card)&&card.areas.some(area=>area.type==='preview'&&area.targetNodeId&&String(area.targetNodeId)!==nodeId)).map(card=>card.id));
    for(const card of cards)if(ids.has(card.id)){card.xyArchiveBindings=matrixBindings(xy);card.xyArchiveOutput=String(xy.outputNodeId||'');}
    archiveTaskCards(cards,ids,archived,table);xy.outputNodeId=nodeId;
    for(const card of cards)if(xy.taskIds.includes(card.id)&&!hasTaskResults(card)){
        const untouched=card.xyInitialInput===matrixInputSignature(card);
        const output=card.areas.find(area=>area.id===card.xyOutputId)||card.areas.find(area=>area.type==='preview');
        if(output)output.targetNodeId=nodeId||null;
        if(untouched)card.xyInitialInput=matrixInputSignature(card);
    }
}

export function validateMatrixValues(xy,parameters) {
    for(const name of ['x','y',...(xy.z.enabled?['z']:[])]){
        const fields=xy[name].bindings.map(key=>parameters.find(parameter=>parameter.key===key));
        if(fields.some(field=>!field))throw new Error(`${name.toUpperCase()} 轴存在已失效的绑定参数，请重新绑定。`);
        validateChoiceValues(xy[name].values,fields);
    }
}
