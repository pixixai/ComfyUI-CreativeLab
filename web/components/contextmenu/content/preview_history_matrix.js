import { createPreviewXYGrid } from './preview_xy_grid.js';
import { projectHistoryMatrix,historyMatrixFields } from './preview_history_matrix_model.js';
import { sourceKey,valueKey,displayValue } from './preview_records.js';
import { xySourceSetting } from './preview_workspace_sheets.js';
import { escapeHtml as esc } from './shared.js';

const options=(items,current,empty='')=>(empty?`<option value="">${empty}</option>`:'')+items.map(([key,label])=>`<option value="${esc(key)}"${key===current?' selected':''}>${esc(label)}</option>`).join('');

export function createHistoryMatrix(center,left,right,changed,exportControls) {
    let model,config,records=[],sources=[],signature='',mounted=false,grid,viewConfig;
    const values=document.createElement('div'),controls=document.createElement('div'),settings=document.createElement('div');
    const stateKey=()=>JSON.stringify([config.x,config.y,config.z,config.source,config.filters,records.map(record=>[record.key,record.index,record.text,[...record.parameters]])]);
    controls.className='clab-review-sheet-settings';controls.style.marginBottom='20px';
    function selectedRecords(selected,all){
        if(!mounted)return [];
        return grid.downloadRecords(selected,all).flatMap(record=>model.cells.get(record.areaId)?.[record.index]||[]);
    }
    function notify(){
        if(mounted&&model){
            const view=grid.matrixView();
            config.zValue=view.z.enabled?valueKey(view.z.values[view.z.current]):'';
            const select=controls.querySelector('[data-table-option=zValue]');if(select)select.value=config.zValue;
            signature=stateKey();
        }
        changed();
    }
    grid=createPreviewXYGrid(center,values,settings,notify,exportControls,()=>{},()=>{},()=>{},{parameters:()=>model.parameters,sourceSettings:()=>''});
    function paintControls(){
        const fields=historyMatrixFields(records,sources,config);
        const fieldOptions=omit=>fields.filter(field=>!omit.includes(field.key)).map(field=>[field.key,field.label]);
        const distinct=key=>[...new Map(records.filter(record=>record.parameters.has(key)).map(record=>{const value=record.parameters.get(key).value;return [valueKey(value),displayValue(value)];})).entries()];
        const zValues=model.xy.z.values.map(value=>[valueKey(value),displayValue(value)]);
        controls.innerHTML=`<section><h3>历史参数矩阵</h3>${xySourceSetting(viewConfig)}
            <label class="clab-review-field">输出模块<select data-table-option="source">${options(sources.map(source=>[sourceKey(source.card,source.area),`${source.cardLabel||source.card.title} / ${source.areaLabel||source.area.title}`]),config.source,'全部已选输出')}</select></label>
            ${['x','y','z'].map(name=>`<label class="clab-review-field">${name.toUpperCase()} ${name==='z'?'分组':'轴'}<select data-table-option="${name}">${options(fieldOptions(name==='x'?[]:name==='y'?[config.x]:[config.x,config.y]),config[name],name==='z'?'不分组':'选择参数')}</select></label>`).join('')}
            ${config.z?`<label class="clab-review-field">当前 Z 层<select data-table-option="zValue">${options(zValues,config.zValue)}</select></label>`:''}
            ${!config.x||!config.y?'<p class="clab-review-note">至少需要两个不同的历史参数，才能排列 X、Y 轴。</p>':model.missing?`<p class="clab-review-note">${model.missing} 条记录因输出模块、参数缺失或筛选条件未显示。</p>`:''}</section>
            ${fields.some(field=>![config.x,config.y,config.z].includes(field.key))?`<section><h3>其他参数筛选</h3>${fields.filter(field=>![config.x,config.y,config.z].includes(field.key)).map(field=>`<label class="clab-review-field">${esc(field.label)}<select data-table-filter="${esc(field.key)}">${options(distinct(field.key),config.filters[field.key],'全部')}</select></label>`).join('')}</section>`:''}`;
    }
    function refresh(nextRecords,nextSources,nextConfig,nextView){
        records=nextRecords;sources=nextSources;config=nextConfig;viewConfig=nextView;
        historyMatrixFields(records,sources,config);
        const key=stateKey();
        if(signature!==key||!mounted){
            const previous=mounted?grid.matrixView():{};
            const saved=mounted?grid.getViewState():null;
            if(mounted)grid.release();
            model=projectHistoryMatrix(records,sources,config,previous);signature=key;
            paintControls();right.replaceChildren(controls,settings);if(!values.isConnected)left.append(values);
            grid.open(model.xy,model.cards);mounted=true;grid.mount(viewConfig);
            if(saved&&['x','y','z'].every(name=>JSON.stringify([previous[name].bindings,previous[name].values])===JSON.stringify([model.xy[name].bindings,model.xy[name].values])))grid.restoreViewState(saved);
        }else{
            if(!values.isConnected)left.append(values);
            if(!controls.isConnected)right.replaceChildren(controls,settings);
            const current=grid.matrixView();
            const layer=model.xy.z.values.findIndex(value=>valueKey(value)===config.zValue);
            if(current.z.enabled&&layer>=0&&layer!==current.z.current)grid.setLayer(String(layer));
        }
    }
    return {
        refresh,
        change(input,view){return grid.change(input,view);},
        swap(pair,view){
            const [a,b]=pair;[config[a],config[b]]=[config[b],config[a]];
            delete config.filters[config[a]];delete config.filters[config[b]];
            refresh(records,sources,config,view);grid.fit();
        },
        selectRange:(...args)=>grid.selectRange(...args),fit:()=>grid.fit(),
        clearSelection:()=>grid.clearSelection(),
        getViewState:()=>grid.getViewState(),restoreViewState:saved=>grid.restoreViewState(saved),
        revealHistory(focus){
            const cell=[...model.cells].find(([,items])=>items.some(record=>record.cardId===focus.cardId&&(!focus.areaId||record.areaId===focus.areaId)));
            if(cell)grid.revealHistory({areaId:cell[0]});
        },
        // Historical coordinates are a derived view, not a new output destination.
        externalTargets:()=>[],refreshExternal(){signature='';refresh(records,sources,config,viewConfig);},
        downloadRecords:selectedRecords,
        jsonCards(){
            const selected=selectedRecords(false,false),byCard=new Map();
            for(const record of selected){
                const source=sources.find(source=>source.card.id===record.cardId&&source.area.id===record.areaId);if(!source)continue;
                if(!byCard.has(record.cardId))byCard.set(record.cardId,{...source.card,areas:source.card.areas.filter(area=>area.type==='edit').map(area=>{const field=record.snapshot?.find(field=>field.sourceAreaId?String(field.sourceAreaId)===String(area.id):field.title===area.title);return {...area,value:field?field.value:area.value};})});
                const card=byCard.get(record.cardId);if(!card.areas.some(area=>area.id===source.area.id))card.areas.push(source.area);
            }
            return [...byCard.values()];
        },
        hasExportData:()=>mounted&&grid.hasExportData(),
        release(){if(mounted)grid.release();mounted=false;signature='';values.remove();},
    };
}
