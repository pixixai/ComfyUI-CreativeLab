import { state, appState,getActiveWorkspace } from '../ui_state.js';
import { renderTableGrid, leaveTableGrid, editTableRowTitle, paintTableSelection } from './table_view.js';
import { openTableColumnSettings } from './table_column_panel.js';
import { openTableCellSettings } from './table_cell_panel.js';
import { tableRowHeight, tableColumnWidth, resizeTableCells, applyTableLayout, tablePadding, tableSizes, fitTableMedia } from './table_layout.js';
import { tableAppearance, setTableAppearance, setTableCellAppearance } from './table_appearance.js';
import { openTableSheet, addSheetColumn, addSheetRow, synchronizeSheet, projectTableSheet, materializeTable, writeSheetCells, sheetRunRows, orderSheetTasks, resetTableColumn, selectedTableColumns } from './table_sheet.js';
import { duplicateTableRow, duplicateTableColumn, removeTableTracks } from './table_structure.js';
import { promoteDraftRows,renderDraftValue } from './table_drafts.js';
import { workspaceViewport } from './viewport_components.js';
import { updateTableEditor } from './table_editors.js';
import { virtualizeTasks } from './viewport_geometry.js';
import { openTableBinding } from './table_binding.js';
import { attachTableGestures } from './table_gestures.js';
import { attachTableSelection, tableLayoutSelection } from './table_selection.js';
import { workflowParameters } from './parameters.js';
import { tableParameter, reorderTableItems, tablePasteTarget } from './table_model.js';
import { appendWorkspaceTasks, hydrateWorkspaceAreas } from './task_dom.js';
import { synchronizeModeMedia } from './mode_media.js';
import { updateSelectionUI } from '../ui_selection.js';
import { closeXYPopover } from './xy_popover.js';
import { getAreaResultType } from '../modules/media_types/media_utils.js';
import { showBindingToast } from '../ui_utils.js';
import { focusTableCell } from './table_editors.js';
import { attachTableEditing } from './table_editing.js';
import { createTableActivity } from './table_activity.js';

export function createTableController(container,getView,save) {
    const panel=container.closest('#clab-panel'),active=()=>panel.dataset.workspaceMode==='table',view=()=>getView().table,wrapper=()=>container.querySelector('.clab-cards-wrapper');
    const activity = createTableActivity(container);
    document.addEventListener('clab_task_activity', event => {
        const {workspaceId, cardId, completed} = event.detail;
        if (active() && sheet && workspaceId === state.activeWorkspaceId) activity.refresh(workspaceId, cardId, completed);
    });
    let sheet,rows=[],columns=[],settings,controls,frame=0,pending=false,schemaChanged=false;const ready=new Set(),dirty=new Set();let observed=new WeakSet();
    const layoutView = () => ({...view(), columnWidth:sheet.columnWidth ?? view().columnWidth, rowHeight:sheet.rowHeight ?? view().rowHeight,
        padding:sheet.padding ?? view().padding, alignment:sheet.alignment, cellAppearance:sheet.cellAppearance});
    const notice=(message,error=false)=>showBindingToast(message,error),group=()=>rows;
    const mediaObserver=new IntersectionObserver(entries=>{if(!active()||!sheet||virtualizeTasks(state.cards)||rows.length*columns.length>=160)return;let changed=false;for(const entry of entries)if(entry.isIntersecting){ready.add(entry.target.dataset.areaId);mediaObserver.unobserve(entry.target);changed=true;}if(changed)render();},{root:container,rootMargin:'120px'});
    const layout=()=>{
        if(!sheet||!wrapper())return;rows=projectTableSheet(sheet,state.cards);
        columns=sheet.columns.map((area,index)=>({id:area.id,index,area}));
        applyTableLayout(wrapper(),columns,layoutView());
    };
    const ensureGrid=()=>{
        layout();const sizes=layoutView();let total=columns.reduce((sum,column)=>sum+tableColumnWidth(column,sizes),44);
        while(sheet.columns.length<4||total<container.clientWidth){addSheetColumn(sheet);total+=tableColumnWidth(null,sizes);}
        let height=sheet.rows.reduce((sum,row)=>sum+tableRowHeight(sizes,row),40);
        while(sheet.rows.length<4||height<container.clientHeight){const row=addSheetRow(sheet);height+=tableRowHeight(sizes,row);}
        layout();
    };
    const render=requested=>{
        if(!wrapper())return;if(!sheet)sheet=openTableSheet(state.cards,view(),requested);
        synchronizeSheet(sheet,state.cards);const changed=materializeTable(sheet,state.cards,workflowParameters());orderSheetTasks(sheet,state.cards);promoteDraftRows(wrapper(),state.cards);
        if(changed.length){appendWorkspaceTasks(container,state.cards);for(const id of changed)window._clabSurgicallyUpdateArea?.(id);}
        ensureGrid();selection.sync();wrapper().dataset.tableSelection=selection.kind();
        for(const id of ready)wrapper().querySelector(`.clab-area[data-area-id="${CSS.escape(id)}"]`)?.setAttribute('data-clab-table-media-ready','');
        const members=new Set(rows.map(row=>row.id));hydrateWorkspaceAreas(wrapper(),(card,area)=>members.has(card.id)&&(area.type!=='preview'||area.isManageMode||ready.has(area.id)||!['video','audio','model'].includes(getAreaResultType(area))));
        renderTableGrid(wrapper(),state.cards,rows,columns,layoutView(),workflowParameters(),save,ready);editing.sync();
        activity.refresh(state.activeWorkspaceId);
        for(const cell of wrapper().querySelectorAll('.clab-card:not([hidden]) [data-clab-deferred],.clab-card:not([hidden]) [data-clab-pending-refresh]'))if(!observed.has(cell)){observed.add(cell);mediaObserver.observe(cell);}
        if(!controls?.isConnected){controls=document.createElement('div');controls.className='clab-table-fixed-controls';controls.innerHTML='<button data-table-add="columns" title="新增列（在所选项后插入）" aria-label="新增列">＋</button><button data-table-add="rows" title="新增行（在所选项后插入）" aria-label="新增行">＋</button>';wrapper().prepend(controls);}
        controls.style.width=`${container.clientWidth}px`;controls.style.setProperty('--table-viewport-height',`${container.clientHeight}px`);controls.style.setProperty('--clab-table-row-width',wrapper().style.getPropertyValue('--clab-table-row-width'));synchronizeModeMedia(wrapper());
        const parameters=workflowParameters();
        workspaceViewport(container).update('table',{cards:rows,count:rows.length*columns.length,
            mount(cell,card,area){if(!cell.classList.contains('clab-table-draft-cell'))return false;renderDraftValue(cell,area,tableParameter(columns[Number(cell.dataset.tableIndex)].area,parameters));return true;},
            mounted(cell,card,area){cell.dataset.clabTableMediaReady='';if(cell.classList.contains('clab-area'))updateTableEditor(cell,area,tableParameter(area,parameters));fitTableMedia(cell,tableColumnWidth(columns[Number(cell.dataset.tableIndex)],layoutView()),tableRowHeight(layoutView(),{id:cell.dataset.cardId}));editing.syncCell(cell);}
        });
    };
    const commit=()=>{
        cancelAnimationFrame(frame);frame=0;pending=false;if(!sheet)return;
        const focused=document.activeElement,cell=focused?.closest('[data-area-id]'),focusId=cell?.dataset.areaId,start=focused?.selectionStart,end=focused?.selectionEnd;
        if(!schemaChanged)synchronizeSheet(sheet,state.cards);schemaChanged=false;const changed=materializeTable(sheet,state.cards,workflowParameters());orderSheetTasks(sheet,state.cards);promoteDraftRows(wrapper(),state.cards);appendWorkspaceTasks(container,state.cards);
        for(const id of new Set([...changed,...dirty]))window._clabSurgicallyUpdateArea?.(id);dirty.clear();render();updateSelectionUI();
        if(focusId&&!focused.isConnected){const target=focusTableCell(container.querySelector(`[data-area-id="${CSS.escape(focusId)}"]`),editing.contains(focused));if(target?.setSelectionRange&&start!=null)try{target.setSelectionRange(start,end);}catch{}}
        save();
    };
    const queue=(flush=false)=>{pending||=flush;if(frame)return;frame=requestAnimationFrame(()=>{frame=0;if(!active())return;if(pending)commit();else layout();});};
    const selectedRows=()=>state.selectedCardIds.filter(id=>rows.some(row=>row.id===id));
    const selectedColumns=index=>{const indices=selection.columnIndices();return indices.includes(index)?indices:[index];};
    const markColumn=index=>{if(columns[index])view().configured[columns[index].id]=true;};
    const resize = (key, value, ids, defer) => {
        if (!resizeTableCells(view(), sheet, key, value, ids)) return;
        if (key === 'width') for (const id of ids) view().configured[id] = true;
        if (defer) { applyTableLayout(wrapper(), columns, layoutView()); activity.refresh(state.activeWorkspaceId); }
        else { render(); save(); }
    };
    const write=(row,index,values,expand=false)=>{writeSheetCells(sheet,state.cards,row,index,values,workflowParameters(),expand);for(const item of rows.slice(row,row+values.length))for(const area of item.areas.slice(index,index+(values[0]?.length||0)))dirty.add(area.id);};
    const fill=(index,values,previous)=>{write(0,index,[...values,...Array(Math.max(0,previous-values.length)).fill('')].map(value=>[value]));commit();};
    const configure=(index,updater)=>{markColumn(index);updater(sheet.columns[index]);schemaChanged=true;commit();};
    const resetColumns = targets => {
        if (!targets.length) return;
        for (const column of targets) for (const id of resetTableColumn(sheet,state.cards,view(),column.id)) dirty.add(id);
        schemaChanged=true;
        commit();
    };
    const openColumnSettings = (trigger, index) => {
        if (!selection.columnIndices().includes(index)) selection.selectColumn(index);
        const column = columns[index];
        settings = openTableColumnSettings(trigger, column, {
            group, view:view(), parameters:workflowParameters(), save,
            fill:(values,previous)=>fill(index,values,previous),
            change:updater=>configure(index,updater),
            reset:()=>resetColumns([column.area])
        }, panel);
    };
    const openCellSettings = (trigger, point) => {
        const target = tableLayoutSelection(rows, columns, selectedRows(), state.selectedAreaIds, selection.kind(), appState.lastClickedAreaId, state.activeCardId);
        const {scope, cells, anchor, rows:rowIds, columns:columnIds, allWidths, allHeights} = target;
        const setAppearance = (key, value) => {
            if (scope === 'cell') setTableCellAppearance(view(), sheet, cells, key, value);
            else {
                const ids = scope === 'row' ? rowIds : scope === 'column' ? columnIds : [undefined];
                for (const id of ids) setTableAppearance(view(), sheet, scope, id, key, value);
            }
        };
        const currentAppearance = () => {
            const layout = layoutView();
            if (scope === 'table') return {padding:tablePadding(layout.padding), alignment:layout.alignment ?? 0};
            const padding = tablePadding(tableAppearance(layout, 'padding', anchor.rowId, anchor.columnId));
            const alignment = tableAppearance(layout, 'alignment', anchor.rowId, anchor.columnId) ?? 0;
            const samePadding = cells.every(({rowId,columnId}) => {
                const value = tablePadding(tableAppearance(layout, 'padding', rowId, columnId));
                return Object.keys(padding).every(side => padding[side] === value[side]);
            });
            const sameAlignment = cells.every(({rowId,columnId}) => (tableAppearance(layout, 'alignment', rowId, columnId) ?? 0) === alignment);
            return {padding:samePadding ? padding : null, alignment:sameAlignment ? alignment : null};
        };
        settings = openTableCellSettings(() => trigger?.isConnected ? trigger : panel.querySelector('#tb-table-cell-settings'), target, {
            sizes: () => {
                const layout = layoutView();
                const width = tableColumnWidth({id:anchor?.columnId}, layout), height = tableRowHeight(layout, {id:anchor?.rowId});
                return {width, height,
                    mixedWidth:columnIds.some(id => tableColumnWidth({id},layout) !== width),
                    mixedHeight:rowIds.some(id => tableRowHeight(layout,{id}) !== height)};
            },
            resize: (key, value, defer) => resize(key, value, key === 'width' ? (allWidths ? [] : columnIds) : (allHeights ? [] : rowIds), defer),
            appearance: currentAppearance,
            setAppearance: (key, value) => { setAppearance(key, value); render(); save(); },
            reset: () => {
                if (scope === 'table') {
                    resizeTableCells(view(), sheet, 'width', tableSizes.width.default);
                    resizeTableCells(view(), sheet, 'height', tableSizes.height.default);
                } else {
                    for (const id of columnIds) delete view().widths[id];
                    for (const id of rowIds) delete view().heights[id];
                }
                const layout = layoutView();
                setAppearance('padding', tablePadding(scope === 'table' ? undefined : layout.padding));
                setAppearance('alignment', scope === 'table' ? null : layout.alignment ?? null);
                render();
                save();
            }
        }, panel, point);
    };
    const add=kind=>{
        let index;
        if(kind==='columns'){
            const selected=selection.columnIndices(),cells=columns.filter(column=>rows.some(row=>state.selectedAreaIds.includes(row.areas[column.index].id))).map(column=>column.index),indices=selected.length?selected:cells;index=indices.length?Math.max(...indices)+1:sheet.columns.length;addSheetColumn(sheet,index);
        }else{const indices=rows.map((row,index)=>state.selectedCardIds.includes(row.id)||row.areas.some(area=>state.selectedAreaIds.includes(area.id))?index:-1).filter(index=>index>=0);index=indices.length?Math.max(...indices)+1:sheet.rows.length;addSheetRow(sheet,index);}
        commit();requestAnimationFrame(()=>{const element=kind==='columns'?container.querySelector(`.clab-table-column[data-table-index="${index}"]`):container.querySelector(`[data-table-row="${sheet.rows[index].id}"] [data-table-row-header]`);element?.scrollIntoView({block:'nearest',inline:'nearest'});});
    };
    const run=(all=false)=>{
        commit();const selected=new Set(rows.filter(row=>state.selectedCardIds.includes(row.id)||row.areas.some(area=>state.selectedAreaIds.includes(area.id))).map(row=>row.id)),base=sheetRunRows(sheet,state.cards,workflowParameters()).filter(task=>all||!selected.size||selected.has(task.cardId));
        if(!base.length)throw Error('请先绑定参数、填写取值并绑定输出节点；草稿网格不会运行。');
        const count=Math.max(1,Math.min(999,Number(panel.querySelector('#clab-run-batch-count')?.value)||1)),tasks=Array.from({length:count},()=>base.map(task=>({...task}))).flat();document.dispatchEvent(new CustomEvent('clab_execution_start',{detail:{tasks}}));Promise.resolve(window.CLab.executeTasks(tasks)).catch(error=>notice(error.message,true));
    };
    container.addEventListener('click',event=>{
        if(!active())return;const button=event.target.closest('button');if(!button)return;
        try{const header=button.closest('.clab-table-column[data-table-index]'),index=Number(header?.dataset.tableIndex);
            if(button.matches('[data-table-settings]'))openColumnSettings(button,index);
            else if(button.matches('.clab-module-binding-summary')&&header)settings=openTableBinding(container,columns[index],()=>{markColumn(index);schemaChanged=true;commit();});
            else if(button.matches('[data-table-add]'))add(button.dataset.tableAdd);
            else if(button.matches('[data-table-select-all]')) {
                if (button.getAttribute('aria-pressed') === 'true') selection.deselect();
                else selection.selectAll();
            }
        }catch(error){notice(error.message,true);}
    });
    function changeTracks(axis, id, action, menuSheet) {
        if (!active() || sheet !== menuSheet) return;
        const tracks = axis === 'row' ? sheet.rows : sheet.columns;
        const index = tracks.findIndex(track => track.id === id);
        if (index < 0) return;
        editing.end();
        selection.clear();
        state.selectedCardIds = [];
        state.selectedAreaIds = [];
        state.activeCardId = appState.lastClickedAreaId = null;
        let inserted;
        if (action === 'before' || action === 'after') {
            inserted = (axis === 'row' ? addSheetRow : addSheetColumn)(sheet, index + Number(action === 'after'));
        } else if (action === 'copy') {
            inserted = (axis === 'row' ? duplicateTableRow : duplicateTableColumn)(sheet,state.cards,getView(),index);
        } else {
            const start = action === 'delete-before' ? 0 : index + Number(action === 'delete-after');
            const count = action === 'delete-before' ? index : action === 'delete-after' ? tracks.length - start : 1;
            removeTableTracks(sheet,state.cards,getView(),axis,start,count,getActiveWorkspace().archivedTasks);
            const retained = new Set(state.cards.flatMap(card => card.areas.map(area => area.id)));
            for (const cell of wrapper().querySelectorAll('.clab-area[data-area-id]')) {
                if (retained.has(cell.dataset.areaId)) continue;
                mediaObserver.unobserve(cell);
                ready.delete(cell.dataset.areaId);
            }
        }
        commit();
        if (inserted) {
            if (axis === 'row') selection.selectRow(inserted.id);
            else selection.selectColumn(sheet.columns.indexOf(inserted));
        }
    }

    panel.addEventListener('clab_table_menu', event => {
        if (!active() || !sheet) return;
        const {areaId, rowId, columnId, show, point} = event.detail;
        const cell = areaId && container.querySelector(`[role=cell][data-area-id="${CSS.escape(areaId)}"]`);
        const row = rows.find(item => item.id === (rowId || cell?.dataset.cardId));
        const column = columns.find(item => columnId ? item.id === columnId : item.index === Number(cell?.dataset.tableIndex));
        if (!row && !column) return;
        if (cell && !state.selectedAreaIds.includes(areaId) && !state.selectedCardIds.includes(row?.id)) selection.selectCell(areaId);
        else if (rowId && !state.selectedCardIds.includes(rowId)) selection.selectRow(rowId);
        else if (columnId && !selection.columnIndices().includes(column.index)) selection.selectColumn(column.index);

        const menuSheet = sheet;
        const menuItem = (axis, id, action, label, disabled = false) => ({
            action:`${action}-${axis}`, label, disabled,
            invoke:() => { try { changeTracks(axis,id,action,menuSheet); } catch (error) { notice(error.message,true); } },
        });
        const groups = [[{action:'settings',label:'单元格设置',invoke:() => {
            if (active() && sheet === menuSheet) openCellSettings(panel.querySelector('#tb-table-cell-settings'), point);
        }}]];
        if (row) {
            const items = [
                menuItem('row',row.id,'before','上方增加行'),
                menuItem('row',row.id,'after','下方增加行'),
                menuItem('row',row.id,'delete','删除行'),
            ];
            if (rowId) {
                const index = rows.indexOf(row);
                items.splice(2,0,menuItem('row',row.id,'copy','复制行'));
                items.push(menuItem('row',row.id,'delete-before','删除上方行',index === 0),
                    menuItem('row',row.id,'delete-after','删除下方行',index === rows.length-1));
            }
            groups.push(items);
        }
        if (column) {
            const items = [
                menuItem('column',column.id,'before','左边增加列'),
                menuItem('column',column.id,'after','右边增加列'),
                menuItem('column',column.id,'delete','删除列'),
            ];
            if (columnId) {
                items.splice(2,0,menuItem('column',column.id,'copy','复制列'));
                items.push(menuItem('column',column.id,'delete-before','删除左侧列',column.index === 0),
                    menuItem('column',column.id,'delete-after','删除右侧列',column.index === columns.length-1));
            }
            groups.push(items);
        }
        show(groups);
    });
    panel.addEventListener('click', event => {
        const type = event.target.closest('.clab-tool-dock .clab-type-btn')?.dataset.type;
        if (!active() || !sheet || !['edit','preview'].includes(type)) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        const selected = new Set(state.selectedAreaIds);
        const targets = selectedTableColumns(sheet,state.cards,selected).filter(column => column.type !== type);
        if (!targets.length) return;
        for (const column of targets) {
            view().configured[column.id] = true;
            column.type = type;
        }
        schemaChanged = true;
        commit();
    }, true);
    container.addEventListener('dblclick', event => {
        const header = event.target.closest('[data-table-row-header]');
        if (!active() || !header || event.ctrlKey || event.metaKey || event.shiftKey) return;
        const row = rows.find(row => row.id === header.closest('[data-table-row]').dataset.tableRow);
        if (!row) return;
        const currentSheet = sheet;
        editTableRowTitle(header, row.title, title => {
            if (!active() || sheet !== currentSheet || title === row.title) return;
            row.sheetRow.title = title;
            const card = state.cards.find(card => card.id === row.sheetRow.cardId);
            if (card) card.title = title;
            render();
            save();
        });
    });
    container.addEventListener('input',event=>{
        if(!active()||!sheet)return;const input=event.target.closest('.clab-table-draft-value');
        if(input){const cell=input.closest('[data-area-id]'),index=Number(cell.dataset.tableIndex),row=rows.findIndex(row=>row.id===cell.dataset.cardId),parameter=tableParameter(columns[index].area,workflowParameters());if(input.validity?.badInput)return;const value=input.matches('[data-draft-choice]')?(input.value===''?'':parameter.choices[Number(input.value)]):input.type==='checkbox'?input.checked:input.value;try{write(row,index,[[value]]);}catch(error){notice(error.message,true);}window.CLab?.scheduleSave();}
        if (event.target.matches('.clab-upload-preview-toggle')) queue();
    });
    container.addEventListener('change',event=>{if(active()&&event.target.matches('.clab-table-draft-value'))queue(true);});
    panel.addEventListener('mousedown',event=>{if(active()&&event.target.closest('.clab-table-head,[data-table-row-header]'))event.stopPropagation();},true);
    panel.addEventListener('click',event=>{if(!active())return;const target=event.target.closest('#clab-global-add-card,#clab-global-add-module,#clab-btn-run,#clab-btn-run-all,#tb-table-cell-settings,#tb-reset-table-columns');if(!target)return;event.preventDefault();event.stopImmediatePropagation();try{if(target.id==='tb-table-cell-settings')openCellSettings(target);else if(target.id==='tb-reset-table-columns')resetColumns(selectedTableColumns(sheet,state.cards,new Set(state.selectedAreaIds)));else if(target.id.includes('run')){panel.querySelector('#clab-run-dropdown-menu').style.display='none';run(target.id==='clab-btn-run-all');}else add(target.id==='clab-global-add-card'?'rows':'columns');}catch(error){notice(error.message,true);}},true);
    const editing=attachTableEditing(container,{active,select:id=>selection.selectCell(id)});
    const selection=attachTableSelection(panel,{active,group,columns:()=>columns,paint:()=>{if(sheet&&wrapper())paintTableSelection(wrapper(),rows,columns,selection.kind());},editing});
    const navigate=(row,index)=>{
        if(row<0||index<0)return;editing.end();while(sheet.rows.length<=row)addSheetRow(sheet);commit();const area=rows[row]?.areas[index];if(!area)return;
        selection.selectCell(area.id);const cell=container.querySelector(`[data-area-id="${CSS.escape(area.id)}"]`);cell?.scrollIntoView({block:'nearest',inline:'nearest'});
        focusTableCell(cell);
    };
    container.addEventListener('pointerover',event=>{if(!active())return;const index=event.target.closest('[data-table-index]')?.dataset.tableIndex;for(const header of container.querySelectorAll('.clab-table-column'))header.classList.toggle('is-column-hover',header.dataset.tableIndex===index);});
    container.addEventListener('pointerleave',()=>container.querySelectorAll('.is-column-hover').forEach(header=>header.classList.remove('is-column-hover')));
    const leaveGestures=attachTableGestures(container,{active,group,columns:()=>columns,resize:(index,key,value,defer,rowId) => resize(key,value,
        key === 'width' ? selectedColumns(index).map(at => columns[at].id) : selectedRows().includes(rowId) ? selectedRows() : [rowId],defer),finish:commit,notice,navigate,editing,
        paste: (anchor, values) => {
            const selectedRows = rows.filter(row => state.selectedCardIds.includes(row.id));
            const ids = [...state.selectedAreaIds, ...selectedRows.flatMap(row => row.areas.map(area => area.id))];
            const target = tablePasteTarget(rows, columns, ids, anchor, values);
            const pasted = values.slice(0, target.height).map(row => row.slice(0, target.width));
            write(target.row, target.column, pasted, target.height === undefined);
            commit();
            if (target.height !== undefined && (target.height !== values.length || target.width !== values[0].length)) {
                notice(`复制区域为 ${values.length}×${values[0].length}，选区为 ${target.height}×${target.width}。已从左上角粘贴 ${pasted.length}×${pasted[0].length}。`);
            }
        },
        clear:ids=>{for(const [at,row]of rows.entries())for(const column of columns)if(column.area.type==='edit'&&ids.includes(row.areas[column.index].id))write(at,column.index,[['']]);commit();},
        dragItems:(kind,id)=>{const ids=kind==='column'?selection.columnIndices().map(index=>columns[index].id):selectedRows();return ids.includes(id)?ids:[id];},
        move:(kind,ids,target,after)=>{if(reorderTableItems(kind==='column'?sheet.columns:sheet.rows,ids,target,after,kind==='column'))commit();}
    });
    const sizeObserver=new ResizeObserver(()=>{if(active()&&sheet)queue(true);});sizeObserver.observe(container);
    return {render,flush(){if(active()&&pending)commit();},leave(){workspaceViewport(container).restoreCached();cancelAnimationFrame(frame);frame=0;pending=false;editing.restore();mediaObserver.disconnect();activity.clear();observed=new WeakSet();leaveGestures();selection.clear();settings?.close();closeXYPopover();controls?.remove();controls=null;sheet=null;rows=[];columns=[];ready.clear();dirty.clear();const node=wrapper();if(node)leaveTableGrid(node);state.selectedCardIds=state.selectedCardIds.filter(id=>state.cards.some(card=>card.id===id));state.selectedAreaIds=state.selectedAreaIds.filter(id=>state.cards.some(card=>card.areas.some(area=>area.id===id)));}};
}
