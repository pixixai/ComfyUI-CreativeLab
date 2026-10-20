import { bindingsOf, matchingTasks, axisTuple, parameterValue, taskCoordinates, setParameterValue, valueKey } from './task_model.js';

let sequence=0;
const id=kind=>`${kind}_xy_${Date.now()}_${++sequence}`;
export const matrixCards=(cards,xy)=>{const ids=new Set(xy.taskIds);return cards.filter(card=>ids.has(card.id));};
export const matrixOutput=(card,xy)=>card.areas.find(area=>area.id===card.xyOutputId)||card.areas.filter(area=>area.type==='preview')[xy.outputIndex]||card.areas.find(area=>area.type==='preview');
export const matrixAxisNames=xy=>xy.z?.enabled?['x','y','z']:['x','y'];
export const currentZLayer=xy=>Math.max(0,Math.min(xy.z?.values.length-1||0,xy.z?.current||0));
export function matrixCells(cards,xy) {
    const cells=new Map(),names=matrixAxisNames(xy);
    const current=!xy.z?.enabled&&xy.z?.bindings.length&&xy.z.values.length?valueKey(axisTuple(xy.z,xy.z.values[currentZLayer(xy)])):null;
    const isCurrent=card=>current!==null&&valueKey(xy.z.bindings.map(key=>parameterValue(card,key)))===current;
    for(const card of matrixCards(cards,xy)){
        const at=taskCoordinates(card,xy);if(Object.values(at).some(value=>value<0))continue;
        const key=names.map(name=>at[name]).join(','),previous=cells.get(key),output=matrixOutput(card,xy),oldOutput=previous&&matrixOutput(previous.card,xy);
        if(!previous||isCurrent(card)>isCurrent(previous.card)||(isCurrent(card)===isCurrent(previous.card)&&!(oldOutput?.history?.length||oldOutput?.resultUrl)&&(output?.history?.length||output?.resultUrl)))cells.set(key,{card,...at});
    }
    return [...cells.values()];
}
export const visibleMatrixCells=(cards,xy)=>matrixCells(cards,xy).filter(cell=>!xy.z?.enabled||xy.z.display==='all'||cell.z===currentZLayer(xy));
const title=(parameters,key)=>parameters.find(parameter=>parameter.key===key)?.name||key.split('||')[1];
export const matrixReady=xy=>matrixAxisNames(xy).every(name=>xy[name].bindings.length&&xy[name].values.length);

export function adoptMatrix(cards,source,xy) {
    if(xy.initialized){
        if(!xy.taskIds.length&&!xy.x.bindings.length&&!xy.y.bindings.length&&source?.areas.some(area=>area.type==='edit'))xy.initialized=false;
        else{
            const ids=new Set(xy.taskIds);
            if(matrixReady(xy)&&xy.outputNodeId)for(const card of cards){
                const at=taskCoordinates(card,xy),output=card.areas.find(area=>area.type==='preview'&&String(area.targetNodeId)===xy.outputNodeId);
                if(!ids.has(card.id)&&Object.values(at).every(value=>value>=0)&&output){xy.taskIds.push(card.id);ids.add(card.id);card.xyOutputId=output.id;}
            }
            return;
        }
    }
    xy.initialized=true;
    if(!source)return;
    xy.outputNodeId=String(matrixOutput(source,xy)?.targetNodeId??'');
    const group=matchingTasks(cards,source),inputs=source.areas.filter(area=>area.type==='edit'&&bindingsOf(area).length);
    if(!xy.x.bindings.length&&!xy.y.bindings.length)for(const [index,name]of ['x','y'].entries()){
        const bindings=bindingsOf(inputs[index]||{}).filter(key=>name==='x'||!xy.x.bindings.includes(key));if(!bindings.length)continue;
        xy[name].bindings=bindings;
        xy[name].values=[...new Map(group.map(card=>{const tuple=bindings.map(key=>parameterValue(card,key)),value=tuple.length===1?tuple[0]:tuple;return [valueKey(value),value];})).values()];
    }
    const used=new Set([...matrixAxisNames(xy).flatMap(name=>xy[name].bindings),...xy.records.map(entry=>entry.key)]);
    for(const input of inputs.slice(2))for(const key of bindingsOf(input))if(!used.has(key)){xy.records.push({id:id('record'),key});used.add(key);}
    xy.taskIds=[...new Set([...xy.taskIds,...group.map(card=>card.id)])];
    for(const card of group)if(matrixOutput(card,xy))card.xyOutputId=matrixOutput(card,xy).id;
}

export function synchronizeMatrix(cards,xy,parameters) {
    const group=matrixCards(cards,xy),created=[];
    const names=matrixAxisNames(xy),occupied=new Set(group.map(card=>{const at=taskCoordinates(card,xy);return names.map(name=>at[name]).join(',');}));
    if(matrixReady(xy))(xy.z?.enabled?xy.z.values:[null]).forEach((zv,z)=>xy.y.values.forEach((yv,y)=>xy.x.values.forEach((xv,x)=>{
        const coordinate=[x,y,...(xy.z?.enabled?[z]:[])].join(',');if(occupied.has(coordinate))return;
        const output={id:id('area'),type:'preview',title:'输出',targetNodeId:xy.outputNodeId||null,history:[],historyIndex:-1};
        const card={id:id('card'),title:`任务 ${x+1} · ${y+1}${xy.z?.enabled?` · ${z+1}`:''}`,areas:[output],xyOutputId:output.id};
        for(const [axis,value]of [[xy.x,xv],[xy.y,yv],...(xy.z?.enabled?[[xy.z,zv]]:[])])axisTuple(axis,value).forEach((entry,index)=>setParameterValue(card,axis.bindings[index],entry,title(parameters,axis.bindings[index])));
        group.push(card);created.push(card);xy.taskIds.push(card.id);occupied.add(coordinate);
    })));
    for(const card of group){
        let output=matrixOutput(card,xy);
        if(!output){output={id:id('area'),type:'preview',title:'输出',history:[],historyIndex:-1};card.areas.unshift(output);}
        card.xyOutputId=output.id;output.targetNodeId=xy.outputNodeId||null;
        const axes=names.flatMap(name=>xy[name].bindings);
        const controlled=axes;
        for(const area of card.areas)if(area.xyDimension){delete area.xyDimension;area.recordOnly=false;}
        for(const area of card.areas)if(controlled.some(key=>bindingsOf(area).includes(key)))area.recordOnly=false;
        const keys=xy.records.map(entry=>entry.key).filter(Boolean);
        card.areas=card.areas.filter(area=>!area.xyRecordKey||keys.includes(area.xyRecordKey)||controlled.includes(area.xyRecordKey));
        for(const key of keys)if(!controlled.includes(key)){
            const existing=card.areas.find(area=>area.type==='edit'&&bindingsOf(area).includes(key));
            const area=existing||setParameterValue(card,key,parameters.find(parameter=>parameter.key===key)?.value??'',title(parameters,key));
            area.xyRecordKey=key;area.recordOnly=true;area.value=structuredClone(parameters.find(parameter=>parameter.key===key)?.value??area.value);
        }
        card.recordParameters=keys.map(key=>({key,label:parameters.find(parameter=>parameter.key===key)?.label||key}));
    }
    cards.push(...created);return created;
}

export function materializeMatrixRecords(cards,xy,parameters) {
    for(const card of matrixCards(cards,xy)){
        for(const area of card.areas)if(area.xyRecordKey){
            area.recordOnly=false;
            const parameter=parameters.find(parameter=>parameter.key===area.xyRecordKey);if(parameter)area.value=structuredClone(parameter.value);
        }
        const output=matrixOutput(card,xy);if(output)card.areas=[output,...card.areas.filter(area=>area!==output)];
    }
}

export function changeAxisBindings(axis,bindings,parameters) {
    const values=axis.values.map(value=>{const previous=axisTuple(axis,value),tuple=bindings.map(key=>axis.bindings.includes(key)?previous[axis.bindings.indexOf(key)]:parameters.find(parameter=>parameter.key===key)?.value??'');return bindings.length===1?tuple[0]:tuple;});
    axis.bindings=bindings;axis.values=bindings.length?[...new Map(values.map(value=>[valueKey(value),value])).values()]:[];
}

export function rebindMatrixAxis(cards,xy,name,bindings,parameters) {
    const previous=[...xy[name].bindings],items=matrixCards(cards,xy).map(card=>{const at=taskCoordinates(card,xy)[name];return {card,tuple:!previous.length?[]:at<0||at===undefined?null:axisTuple(xy[name],xy[name].values[at])};});
    changeAxisBindings(xy[name],bindings,parameters);
    const initialZ=name==='z'&&!previous.length&&bindings.length,workflowValue=key=>parameters.find(parameter=>parameter.key===key)?.value??'';
    if(initialZ){
        const workflow=bindings.map(workflowValue),tuples=items.length?items.map(({card})=>bindings.map(key=>parameterValue(card,key)??workflowValue(key))):[workflow];
        xy.z.values=[...new Map(tuples.map(tuple=>{const value=bindings.length===1?tuple[0]:tuple;return [valueKey(value),value];})).values()];
        xy.z.current=Math.max(0,xy.z.values.findIndex(value=>valueKey(axisTuple(xy.z,value))===valueKey(workflow)));
    }
    const retained=[...matrixAxisNames(xy).flatMap(axis=>xy[axis].bindings),...xy.records.map(entry=>entry.key)];
    for(const {card,tuple:old}of items){
        if(!old||!bindings.length)continue;
        const tuple=bindings.map(key=>previous.includes(key)?old[previous.indexOf(key)]:initialZ?parameterValue(card,key)??workflowValue(key):workflowValue(key));
        bindings.forEach((key,index)=>{setParameterValue(card,key,tuple[index],title(parameters,key)).recordOnly=false;});
        card.areas=card.areas.filter(area=>!(area.type==='edit'&&bindingsOf(area).length===1&&previous.includes(bindingsOf(area)[0])&&!retained.includes(bindingsOf(area)[0])));
    }
}
