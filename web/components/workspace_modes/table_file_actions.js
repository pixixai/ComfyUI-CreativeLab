import { state } from '../ui_state.js';
import { editHistory } from '../edit_history_runtime.js';
import { projectTableSheet, boundColumn } from './table_sheet.js';
import { tableParameter } from './table_model.js';
import { getMediaType, isModelFile } from '../modules/media_types/media_utils.js';

const fileKind=value=>isModelFile(value)?'model':getMediaType(value);
const binding=area=>JSON.stringify([area.type,area.targetNodeId,area.targetWidget,area.targetWidgets,area.targetNodeIds]);
export function attachTableFileActions(container,actions){
    const context=()=>{
        const rows=actions.rows(),parameters=actions.parameters(),selectedAreas=new Set(state.selectedAreaIds),selectedRows=new Set(state.selectedCardIds);
        const kinds=actions.sheet().columns.map(column=>tableParameter(column,parameters).uploadType);
        const cells=rows.flatMap(row=>row.areas.map((area,index)=>({rowId:row.id,columnId:area.tableColumnId,area,kind:kinds[index]})));
        const selected=cells.filter(({rowId,area})=>selectedRows.has(rowId)||selectedAreas.has(area.id));
        return {byId:new Map(cells.map(cell=>[cell.area.id,cell])),selected,selectedIds:new Set(selected.map(cell=>cell.area.id)),cache:new Map()};
    };
    const scope=(element,action,data)=>{
        const cell=element.closest('[data-area-id]'),sheet=actions.sheet();
        if(!actions.active()||!sheet||!cell)return null;
        data??=context();
        const source=data.byId.get(cell.dataset.areaId),sourceKind=source?.kind;
        if(!sourceKind)return null;
        const key=action+':'+(data.selectedIds.has(source.area.id)?sourceKind:source.area.id);
        if(data.cache.has(key))return data.cache.get(key);
        const all=data.selectedIds.has(source.area.id)?data.selected:[source];
        const targets=all.filter(({area,kind})=>{
            if(area.type!=='edit'||!boundColumn(area)||!kind)return false;
            if(action==='preview')return ['image','video','audio','model'].includes(kind==='file'?fileKind(area.value):kind);
            return action==='clear'||kind==='file'||sourceKind==='file'||kind===sourceKind;
        }).map(target=>({...target,binding:binding(target.area)}));
        const skipped=all.length-targets.length,values=new Set(targets.map(target=>target.area.value||'')),workspaceId=state.activeWorkspaceId;
        const label=`应用到 ${targets.length} 个单元格${skipped?`，跳过 ${skipped} 格`:''}`;
        const result={label,mixed:values.size>1,targets,skipped,apply(value){
            if(!actions.active()||state.activeWorkspaceId!==workspaceId||actions.sheet()!==sheet)return;
            const current=projectTableSheet(sheet,state.cards),changes=[],parameters=actions.parameters();
            const rowsById=new Map(current.map((row,index)=>[row.id,{row,index}]));
            const columnsById=new Map(sheet.columns.map((column,index)=>[column.id,{index,kind:tableParameter(column,parameters).uploadType}]));
            for(const target of targets){
                const entry=rowsById.get(target.rowId),column=columnsById.get(target.columnId),area=entry?.row.areas[column?.index];
                if(!area||binding(area)!==target.binding)continue;
                const kind=column.kind;
                if(!kind||!boundColumn(area)||action==='file'&&kind!=='file'&&kind!==(sourceKind==='file'?fileKind(value):sourceKind))continue;
                changes.push({...entry,column:column.index,area});
            }
            if(!changes.length){actions.notice('没有可应用的文件输入格。');return;}
            const apply=()=>{
                const actual=new Set(state.cards.flatMap(card=>card.areas));
                for(const {row,index,column,area}of changes){
                    if(action==='preview'){
                        area.showUploadPreview=value;
                        if(!actual.has(area)){row.sheetRow.uploadPreviews??={};row.sheetRow.uploadPreviews[area.tableColumnId]=value;}
                        actions.dirty(area.id);
                    }else actions.write(index,column,[[value]]);
                }
                actions.commit();
            };
            if(action==='preview')editHistory.withoutRecording(apply);
            else{editHistory.record();apply();editHistory.record();}
            if(all.length>1)actions.notice(`已应用到 ${changes.length} 个单元格${all.length>changes.length?`，跳过 ${all.length-changes.length} 格`:''}`);
        }};data.cache.set(key,result);return result;
    };
    const paint=(root=container)=>{
        if(!actions.active()||!actions.sheet())return;
        const zones=root.querySelectorAll('.clab-upload-zone');if(!zones.length)return;
        const data=context();
        for(const zone of zones){
            const files=scope(zone,'file',data);if(!files)continue;
            const field=zone.querySelector('.clab-upload-filename'),select=zone.querySelector('.clab-file-select'),preview=zone.closest('[data-area-id]').querySelector('.clab-upload-preview-toggle');
            const multiple=files.targets.length+files.skipped>1;
            if(field&&document.activeElement!==field){field.value=files.mixed?'':files.targets[0]?.area.value||'';field.placeholder=files.mixed?'多个不同文件':'选择或输入名称筛选…';}
            if(field)field.title=multiple?files.label:field.value||'选择 input 文件夹中的文件';
            let badge=select.querySelector('.clab-file-selection-scope');
            if(multiple){if(!badge){badge=document.createElement('span');badge.className='clab-file-selection-scope';select.insertBefore(badge,select.lastElementChild);}badge.textContent=`应用到 ${files.targets.length} 格`;badge.title=files.label;}else badge?.remove();
            if(preview){
                const group=scope(zone,'preview',data),checked=group.targets.filter(target=>target.area.showUploadPreview===true).length;
                preview.checked=checked>0&&checked===group.targets.length;preview.indeterminate=checked>0&&checked<group.targets.length;
                preview.closest('label').title=multiple?group.label:'开启后加载预览，关闭后释放预览资源';
            }
            const clear=zone.querySelector('.clab-upload-clear-btn'),clears=scope(zone,'clear',data);
            clear.disabled=!clears.targets.some(target=>!!target.area.value);clear.title=multiple?`清除选择 · ${clears.label}`:'清除选择';
            zone.querySelector('.clab-upload-trigger-btn').title=multiple?`上传一次并应用 · ${files.label}`:'上传文件';
        }
    };
    container.addEventListener('clab_input_file_action',event=>{event.detail.scope=scope(event.target,event.detail.action);});
    return {paint};
}
