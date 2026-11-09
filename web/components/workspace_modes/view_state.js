import { tablePadding } from './table_layout.js';
import { createTableAppearanceOrder } from './table_appearance.js';
import { axisLabelState } from './axis_label_layout.js';

export function createWorkspaceView(seed = {}) {
    const xy=seed.xy||{};
    const axis=value=>({bindings:value?.bindings||[],values:value?.values||[],...axisLabelState(value),...(typeof value?.inputText==='string'?{inputText:value.inputText}:{}),gap:Number.isFinite(value?.gap)?Math.max(0,value.gap):4,margin:Number.isFinite(value?.margin)?Math.max(0,value.margin):10});
    return {
        mode:['cards','table','xy'].includes(seed.mode)?seed.mode:'cards',templateId:seed.templateId||'',
        table:{widths:Object.fromEntries(Object.entries(seed.table?.widths||{}).filter(([,value])=>Number.isFinite(value)).map(([id,value])=>[id,Math.max(64,Math.min(6000,value))])),rowHeight:Math.max(48,Math.min(2000,Number(seed.table?.rowHeight)||144)),drafts:Object.fromEntries(Object.entries(seed.table?.drafts||{}).filter(([,draft])=>draft&&typeof draft.text==='string').map(([id,draft])=>[id,{text:draft.text,format:['lines','comma','json'].includes(draft.format)?draft.format:'auto',...(Number.isFinite(draft.appliedCount)?{appliedCount:Math.max(0,Math.floor(draft.appliedCount))}:{})}])),heights:seed.table?.heights||{},alignments:seed.table?.alignments||{},rowAlignments:seed.table?.rowAlignments||{},columnPaddings:seed.table?.columnPaddings||{},rowPaddings:seed.table?.rowPaddings||{},appearanceOrder:createTableAppearanceOrder(seed.table?.appearanceOrder),configured:seed.table?.configured||{},padding:tablePadding(seed.table?.padding),sheets:Array.isArray(seed.table?.sheets)?seed.table.sheets:[],sheetId:seed.table?.sheetId||'',empty:!!seed.table?.empty,schema:Array.isArray(seed.table?.schema)?seed.table.schema:[]},
        xy:{x:axis(xy.x),y:axis(xy.y),z:{...axis(xy.z),enabled:!!xy.z?.enabled,current:Math.max(0,Number(xy.z?.current)||0),display:xy.z?.display==='all'?'all':'single'},origin:xy.origin==='top'?'top':'bottom',
            records:(Array.isArray(xy.records)?xy.records:[]).map((entry,index)=>typeof entry==='string'?{id:`record_${index}`,key:entry}:entry),
            taskIds:Array.isArray(xy.taskIds)?xy.taskIds:[],outputNodeId:xy.outputNodeId??'',outputIndex:Number(xy.outputIndex)||0,initialized:!!xy.initialized,
            zoom:Number.isFinite(xy.zoom)?xy.zoom:1,panX:Number.isFinite(xy.panX)?xy.panX:290,panY:Number.isFinite(xy.panY)?xy.panY:70,cameraReady:!!xy.cameraReady},
    };
}
