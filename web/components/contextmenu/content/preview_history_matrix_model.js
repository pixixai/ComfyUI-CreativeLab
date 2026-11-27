import { createWorkspaceView } from '../../workspace_modes/view_state.js';
import { parameterFields, valueKey, sourceKey } from './preview_records.js';

export function historyMatrixFields(records,sources,config) {
    const fields=parameterFields(records);
    if(!fields.some(field=>field.key===config.x))config.x=fields[0]?.key||'';
    if(!fields.some(field=>field.key===config.y)||config.y===config.x)config.y=fields.find(field=>field.key!==config.x)?.key||'';
    if(!fields.some(field=>field.key===config.z)||[config.x,config.y].includes(config.z))config.z='';
    if(config.source&&!sources.some(source=>sourceKey(source.card,source.area)===config.source))config.source='';
    for(const key of Object.keys(config.filters))if(!fields.some(field=>field.key===key))delete config.filters[key];
    return fields;
}

// These tasks exist only in the preview. Their history entries retain their original record identities.
export function projectHistoryMatrix(records,sources,config,previous={}) {
    const fields=historyMatrixFields(records,sources,config),binding=key=>JSON.parse(key).join('||');
    const names=['x','y',...(config.z?['z']:[])];
    const eligible=config.x&&config.y?records.filter(record=>(!config.source||record.source===config.source)&&names.every(name=>record.parameters.has(config[name]))&&Object.entries(config.filters).every(([key,value])=>value===''||valueKey(record.parameters.get(key)?.value)===value)):[];
    const values=name=>[...new Map(eligible.map(record=>{const value=record.parameters.get(config[name]).value;return [valueKey(value),value];})).values()];
    const xy=createWorkspaceView({xy:previous}).xy;
    xy.hiddenAxes=[...(previous.hiddenAxes||[])];xy.hiddenBindings=[...(previous.hiddenBindings||[])];
    xy.hideHistoryLabels=!!previous.hideHistoryLabels;
    for(const name of ['x','y','z']){
        xy[name].bindings=config[name]?[binding(config[name])]:[];
        xy[name].values=config[name]?values(name):[];
    }
    xy.z.enabled=!!config.z;
    xy.z.current=Math.max(0,xy.z.values.findIndex(value=>valueKey(value)===config.zValue));
    config.zValue=xy.z.enabled?valueKey(xy.z.values[xy.z.current]):'';
    const groups=new Map();
    for(const record of eligible){
        const key=JSON.stringify(names.map(name=>record.parameters.get(config[name]).value));
        if(!groups.has(key))groups.set(key,[]);
        groups.get(key).push(record);
    }
    const coordinates=Object.fromEntries(names.map(name=>[name,new Map(xy[name].values.map((value,index)=>[valueKey(value),index]))]));
    const cells=new Map(),cards=[...groups.values()].map(history=>{
        const first=history[0],current=history.at(-1),id=`history:${encodeURIComponent(JSON.stringify([config.source,...names.map(name=>config[name]),...names.map(name=>coordinates[name].get(valueKey(first.parameters.get(config[name]).value)))]))}`,areaId=id+':output';
        const source=sources.find(source=>sourceKey(source.card,source.area)===first.source);
        const area={id:areaId,type:'preview',title:history.every(record=>record.areaLabel===first.areaLabel)?first.areaLabel:'组合结果',targetNodeId:source?.area.targetNodeId,history:history.map(record=>record.url),historyIndex:history.length-1,resultUrl:current.url,
            historyRuns:history.map(record=>record.imported?{externalImport:record.imported}:record.run),inputHistorySnapshots:history.map(record=>record.snapshot),textHistory:history.map(record=>record.text),textContent:current.text};
        cells.set(areaId,history);
        return {id,title:history.every(record=>record.cardLabel===first.cardLabel)?first.cardLabel:'多任务组合',xyOutputId:areaId,areas:[area,...names.map(name=>({id:id+':'+name,type:'edit',title:fields.find(field=>field.key===config[name])?.label||name,targetWidgets:[binding(config[name])],value:first.parameters.get(config[name]).value}))]};
    });
    xy.outputNodeId=sources.find(source=>sourceKey(source.card,source.area)===config.source)?.area.targetNodeId||sources[0]?.area.targetNodeId||'';
    xy.taskIds=cards.map(card=>card.id);xy.initialized=true;xy.records=[];xy.previewRecords=[];
    const parameters=fields.map(field=>{const [node,name]=JSON.parse(field.key);return {key:binding(field.key),name,displayName:field.label,label:field.label,nodeName:`节点 ${node}`,type:'string'};});
    return {xy,cards,cells,fields,parameters,missing:records.length-eligible.length};
}
