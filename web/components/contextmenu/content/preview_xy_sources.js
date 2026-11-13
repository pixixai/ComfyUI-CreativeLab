import { axisValueLabel,axisValueDescription } from '../../workspace_modes/axis_labels.js';
import { taskCoordinates } from '../../workspace_modes/task_model.js';
import { escapeHtml as esc } from './shared.js';
import { displayValue } from './preview_records.js';

export function projectPreviewXY(xy,shown) {
    return {...xy,...Object.fromEntries(['x','y'].map(name=>[name,{...xy[name],values:xy[name].values.filter((_,index)=>shown[name].has(index))}]))};
}

export function xyRecordRows(outputs,configured,shown,parameters) {
    if(!outputs.length)return [];
    return configured.filter(record=>shown.has(record.key)).map(record=>{
        const values=new Map();let missing=0,label;
        for(const output of outputs){
            const index=output?.historyIndex??(output?.history?.length||0)-1;
            const entry=!output?.missingHistoryRun&&output?.historyRuns?.[index]?.recordParameters?.find(entry=>entry.key===record.key);
            if(!entry){missing++;continue;}
            label||=entry.label;values.set(JSON.stringify(entry.value),displayValue(entry.value));
        }
        const text=[...values.values()];
        if(missing)text.push(values.size?'部分历史未记录该参数':'当前历史未记录该参数');
        const field=parameters.find(parameter=>parameter.key===record.key),savedLabel=label||'',split=savedLabel.lastIndexOf(' · ');
        const nodeName=field?.nodeName||(split>=0?savedLabel.slice(0,split):`节点 ${record.key.split('||')[0]}`);
        const parameterName=field?.displayName||field?.name||(split>=0?savedLabel.slice(split+3):savedLabel)||record.key.split('||')[1];
        return {key:record.key,nodeName,parameterName,value:text.join('\n'),mixed:values.size>1};
    });
}

export function previewXYCellInfo(card,output,xy,parameters,count=1,records=new Set()) {
    if(!card)return '<p class="clab-review-note">选择画布中的格子，查看任务、完整轴取值和历史位置。</p>';
    const at=taskCoordinates(card,xy),length=output?.history?.length||0,index=output?.missingHistoryRun?-1:output?.historyIndex??length-1;
    const rows=[['任务',card.title||'未命名任务'],['输出模块',output?.title||'输出'],['历史记录',length?`${index<0?'—':index+1}/${length}`:'暂无记录']];
    if(card.previewWorkspace)rows.unshift(['工作区',card.previewWorkspace.name]);
    for(const name of ['x','y',...(xy.z.enabled?['z']:[])]){
        const axis=xy[name],fields=axis.bindings.map(key=>parameters.find(parameter=>parameter.key===key));
        const label=fields.map((field,index)=>field?.displayName||field?.name||axis.bindings[index].split('||')[1]).join(' × ');
        const value=axis.values[at[name]];
        rows.push([`${name.toUpperCase()} 轴${label?` · ${label}`:''}`,at[name]<0?'未匹配':Array.isArray(value)?axisValueDescription(value,fields):displayValue(value)]);
    }
    const saved=output?.historyRuns?.[index]?.recordParameters||[];
    for(const record of xy.records.filter(record=>records.has(record.key))){
        const entry=saved.find(entry=>entry.key===record.key);
        const label=entry?.label||parameters.find(parameter=>parameter.key===record.key)?.label||record.key;
        rows.push([`附加记录 · ${label}`,entry?displayValue(entry.value):'当前历史未记录该参数']);
    }
    return `${count>1?`<p class="clab-review-note">已选 ${count} 个格子，显示最近选中的格子</p>`:''}<dl class="clab-review-xy-cell-info">${rows.map(([key,value])=>`<dt>${esc(key)}</dt><dd>${esc(value)}</dd>`).join('')}</dl>`;
}

export function createPreviewXYSources(left,xy,parameters,records,cellInfo) {
    const shown={x:new Set(xy.x.values.map((_,index)=>index)),y:new Set(xy.y.values.map((_,index)=>index))};
    const sync=()=>{
        for(const name of ['x','y']){
            left.querySelectorAll(`[data-review-xy-value="${name}"]`).forEach(input=>input.checked=shown[name].has(Number(input.value)));
            const count=left.querySelector(`[data-review-xy-count="${name}"]`);count.textContent=`${shown[name].size}/${xy[name].values.length} 项`;count.title=`已显示 ${shown[name].size} 项，共 ${xy[name].values.length} 项`;
        }
    };
    function mount() {
        left.innerHTML=`<div class="clab-review-sheet-settings clab-review-xy-sources">${cellInfo?'':'<section class="clab-review-xy-current" hidden><h3>当前格子</h3><div data-review-xy-cell-info></div></section>'}${['x','y'].map(name=>{
            const axis=xy[name],fields=axis.bindings.map(key=>parameters.find(parameter=>parameter.key===key));
            const title=`显示 ${name.toUpperCase()} 轴取值${fields.length?' · '+fields.map((field,index)=>field?.displayName||field?.name||axis.bindings[index].split('||')[1]).join(' × '):''}`;
            return `<section><h3 title="${esc(title)}">${esc(title)}</h3><div class="clab-browse-source-actions clab-grid-source-actions"><button type="button" data-review-xy-select="${name}" data-review-xy-action="all"${axis.values.length?'':' disabled'}>全选</button><button type="button" data-review-xy-select="${name}" data-review-xy-action="none"${axis.values.length?'':' disabled'}>取消</button><span class="clab-browse-status" data-review-xy-count="${name}" role="status"></span></div>${axis.values.map((value,index)=>`<label class="clab-review-check clab-review-xy-source-value"><input type="checkbox" data-review-xy-value="${name}" value="${index}"><span title="${esc(axisValueDescription(value,fields))}">${esc(axisValueLabel(axis,index)||'（空值）')}</span></label>`).join('')||'<p class="clab-review-note">该轴尚无取值。</p>'}</section>`;
        }).join('')}<section><h3>附加记录参数</h3><label class="clab-review-check"><input type="checkbox" data-review-xy-records-expanded${xy.previewRecordsExpanded?' checked':''}><span title="展开记录表中的全部内容，列宽固定并自动换行">显示全部内容</span></label>${xy.records.filter(entry=>entry.key).map(entry=>`<label class="clab-review-check clab-review-xy-source-value"><input type="checkbox" value="${esc(entry.key)}" data-review-xy-record${records.has(entry.key)?' checked':''}><span title="${esc(parameters.find(parameter=>parameter.key===entry.key)?.label||entry.key)}">${esc(parameters.find(parameter=>parameter.key===entry.key)?.label||entry.key)}</span></label>`).join('')||'<p class="clab-review-note">当前矩阵没有附加记录参数。</p>'}</section></div>`;
        sync();
    }
    return {
        mount,
        display:()=>projectPreviewXY(xy,shown),
        hasValues:()=>shown.x.size>0&&shown.y.size>0,
        change(name,index,on){on?shown[name].add(index):shown[name].delete(index);sync();},
        select(name,all){shown[name]=new Set(all?xy[name].values.map((_,index)=>index):[]);sync();},
        swap(pair){
            if(pair==='xy')[shown.x,shown.y]=[shown.y,shown.x];
            else for(const name of ['x','y'])if(pair.includes(name))shown[name]=new Set(xy[name].values.map((_,index)=>index));
            mount();
        },
        info(card,output,count){
            const html=card?previewXYCellInfo(card,output,xy,parameters,count,records):'';
            if(cellInfo){cellInfo(html,card);return;}
            const host=left.querySelector('[data-review-xy-cell-info]');host.parentElement.hidden=!card;if(host.innerHTML!==html)host.innerHTML=html;
        },
    };
}
