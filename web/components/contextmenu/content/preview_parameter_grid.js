import { state } from '../../ui_state.js';
import { generateModuleBindingHTML } from '../../modules/module_binding.js';
import { editTableRowTitle, styleTableCell } from '../../workspace_modes/table_view.js';
import { mountTableCellSettings } from '../../workspace_modes/table_cell_panel.js';
import { tableAppearance, setTableAppearance, setTableCellAppearance } from '../../workspace_modes/table_appearance.js';
import { applyTableLayout, resizeTableCells, tableColumnWidth, tableRowHeight, tablePadding, tableSizes } from '../../workspace_modes/table_layout.js';
import { boundColumn, effectiveTableRow, openTableSheet, orderSheetTasks } from '../../workspace_modes/table_sheet.js';
import { reorderTableItems, tableCellRange, tableParameter } from '../../workspace_modes/table_model.js';
import { tableLayoutSelection } from '../../workspace_modes/table_selection.js';
import { tableSelectAllIcon } from '../../workspace_modes/table_icons.js';
import { updateTableEditor } from '../../workspace_modes/table_editors.js';
import { workflowParameters } from '../../workspace_modes/parameters.js';
import { escapeHtml as esc } from './shared.js';
import { renderReviewArea, attachReviewGridMedia, releaseReviewGridMedia, reviewHistoryDirection, stepReviewGridOutput } from './preview_grid_media.js';
import { workspaceTableSource } from './preview_workspace_sheets.js';
import { outputDownloadRecords } from './preview_downloads.js';

export function createPreviewParameterGrid(center, left, right, changed, exportControls) {
    let view, cards, sheet, template, rows, columns, visibleRows, visibleColumns;
    let shownRows, shownColumns, wrapper, settings, selected, kind, anchor, headerAnchor, drag, reorder, params, dirty=false;
    const save = () => {
        dirty=true;
        window.CLab?.saveState?.(state);
        document.dispatchEvent(new Event('clab_workspace_view_change'));
    };
    const layoutView = () => ({
        ...view, sheetId: sheet.id, columnWidth: sheet.columnWidth ?? view.columnWidth, rowHeight: sheet.rowHeight ?? view.rowHeight,
        padding: sheet.padding ?? view.padding, alignment: sheet.alignment, cellAppearance: sheet.cellAppearance,
    });
    const ensureSheet = () => {
        if (view.sheets.includes(sheet)) return sheet;
        sheet = openTableSheet(cards, view, template);
        return sheet;
    };
    const read = () => {
        ({columns,rows} = workspaceTableSource(cards,sheet,sheet===fallback?template:null));
        visibleRows = rows.filter(row => shownRows.has(row.id));
        visibleColumns = columns.filter(column => shownColumns.has(column.id));
    };
    let fallback;
    const histories=new Map();
    const areaFor=(row,column)=>histories.get(row.areas[column.index].id)||row.areas[column.index];
    const outputCells=selectedOnly=>visibleRows.flatMap(row=>visibleColumns.flatMap(column=>{
        const area=areaFor(row,column);
        return area.type==='preview'&&(!selectedOnly||selected.has(kind==='row'?row.id:area.id))?[{row,area}]:[];
    }));
    const choose = (ids, type, event = {}) => {
        if (event.ctrlKey || event.metaKey) {
            for (const id of ids) selected.has(id) ? selected.delete(id) : selected.add(id);
        } else selected = new Set(ids);
        kind = type;
        paint();
        mountSettings();
        changed();
    };
    const scope = () => {
        const selectedRows = kind === 'row' ? [...selected] : [];
        const selectedCells = kind === 'row' ? [] : [...selected];
        const target = tableLayoutSelection(visibleRows,visibleColumns,selectedRows,selectedCells,kind,anchor);
        if (target.scope !== 'table') {
            target.allWidths = target.columns.length === columns.length;
            target.allHeights = target.rows.length === rows.length;
        }
        return target;
    };
    const paint = () => {
        if (!wrapper) return;
        const layout = layoutView();
        wrapper.dataset.tableSelection = kind || '';
        const selectAll=wrapper.querySelector('[data-review-select-all]');
        const allSelected=kind!=='row'&&visibleRows.length*visibleColumns.length>0&&selected.size===visibleRows.length*visibleColumns.length;
        selectAll.setAttribute('aria-pressed',String(allSelected));
        selectAll.title=allSelected?'取消全选':'全选';
        selectAll.setAttribute('aria-label',selectAll.title);
        for (const element of wrapper.querySelectorAll('[data-review-row]')) {
            const row = visibleRows.find(item => item.id === element.dataset.reviewRow);
            const rowSelected = kind === 'row' && selected.has(row.id);
            element.classList.toggle('selected',rowSelected);
            element.querySelector('[data-review-row-name]').setAttribute('aria-pressed',String(rowSelected));
            for (const cell of element.querySelectorAll('[data-review-cell]')) {
                const column = columns[Number(cell.dataset.reviewColumnIndex)];
                styleTableCell(cell,layout,row.id,column,effectiveTableRow(row));
                cell.classList.toggle('active',kind !== 'row' && selected.has(cell.dataset.reviewCell));
            }
        }
        for (const column of wrapper.querySelectorAll('[data-review-column]')) {
            const id = column.dataset.reviewColumn;
            column.classList.toggle('is-selected',kind === 'column' && visibleRows.length > 0 &&
                visibleRows.every(row => selected.has(row.areas[columns.find(item=>item.id===id).index].id)));
        }
        applyTableLayout(wrapper,visibleColumns,layout);
    };
    function mountSettings() {
        if (!settings?.isConnected) return;
        const body = settings.cloneNode(false);
        settings.replaceWith(body);
        settings = body;
        const target = scope(), {cells, anchor:cell, rows:rowIds, columns:columnIds, allWidths, allHeights} = target;
        const changeAppearance = (key,value) => {
            const data = ensureSheet();
            if (target.scope === 'cell') setTableCellAppearance(view,data,cells,key,value);
            else {
                const ids = target.scope === 'row' ? rowIds : target.scope === 'column' ? columnIds : [undefined];
                for (const id of ids) setTableAppearance(view,data,target.scope,id,key,value);
            }
        };
        const commit = defer => { paint(); if (!defer) { save(); changed(); } };
        mountTableCellSettings(body,target,{
            sizes() {
                const layout = layoutView();
                const width = tableColumnWidth({id:cell?.columnId},layout), height = tableRowHeight(layout,{id:cell?.rowId});
                return {width,height,mixedWidth:columnIds.some(id=>tableColumnWidth({id},layout)!==width),
                    mixedHeight:rowIds.some(id=>tableRowHeight(layout,{id})!==height)};
            },
            resize(key,value,defer) {
                const ids = key === 'width' ? (allWidths ? [] : columnIds) : (allHeights ? [] : rowIds);
                if (resizeTableCells(view,ensureSheet(),key,value,ids)) {
                    if (key==='width') for (const id of ids) view.configured[id] = true;
                    commit(defer);
                }
            },
            appearance() {
                const layout = layoutView();
                if (!cell) return {padding:tablePadding(layout.padding),alignment:layout.alignment ?? 0};
                const padding = ({rowId,columnId})=>tablePadding(tableAppearance(layout,'padding',rowId,columnId));
                const align = ({rowId,columnId})=>tableAppearance(layout,'alignment',rowId,columnId) ?? 0;
                const current = padding(cell);
                return {padding:cells.every(item=>JSON.stringify(padding(item))===JSON.stringify(current))?current:null,
                    alignment:cells.every(item=>align(item)===align(cell))?align(cell):null};
            },
            setAppearance(key,value) { changeAppearance(key,value); commit(); },
            reset() {
                const data = ensureSheet(),layout = layoutView();
                if (target.scope === 'table') {
                    resizeTableCells(view,data,'width',tableSizes.width.default);
                    resizeTableCells(view,data,'height',tableSizes.height.default);
                } else {
                    for (const id of columnIds) delete view.widths[id];
                    for (const id of rowIds) delete view.heights[id];
                }
                changeAppearance('padding',tablePadding(target.scope==='table'?undefined:layout.padding));
                changeAppearance('alignment',target.scope==='table'?null:layout.alignment ?? null);
                commit();
            },
        });
    }
    const check = (type,id,label,on) => `<label class="clab-review-check"><input type="checkbox" data-grid-filter="${type}" value="${esc(id)}"${on?' checked':''}><span title="${esc(label)}">${esc(label)}</span></label>`;
    const columnLabel = column => column.area.title || `列 ${column.index + 1}`;
    const rowLabel = row => row.title || String(rows.indexOf(row) + 1);
    function render() {
        read();
        const stage = center.querySelector('.clab-review-grid-stage');
        wrapper = stage.querySelector('.clab-cards-wrapper');
        releaseReviewGridMedia(wrapper);
        wrapper.innerHTML = `<div class="clab-table-head" role="row"><div class="clab-table-corner"><button type="button" data-review-select-all title="全选" aria-label="全选">${tableSelectAllIcon}</button></div>
            ${visibleColumns.map(column=>`<div class="clab-table-column has-controls${boundColumn(column.area)?' clab-table-bound':''}" data-review-column="${esc(column.id)}" draggable="true" role="columnheader"><div class="clab-table-column-top">
                <button type="button" data-table-settings data-review-column-name title="双击更改列名称">${esc(columnLabel(column))}</button>${generateModuleBindingHTML(column.area)}</div>
                <span class="clab-table-resize" data-review-resize="width" title="调整列宽"></span></div>`).join('')}</div>`;
        wrapper.querySelectorAll('.clab-module-binding').forEach(element=>element.inert=true);
        for (const row of visibleRows) {
            const element = document.createElement('div');
            element.className='clab-card';element.dataset.reviewRow=row.id;element.dataset.tableRow=row.id;element.setAttribute('role','row');
            element.innerHTML=`<div class="clab-card-title-bar" role="rowheader"><button type="button" class="clab-table-row-header" data-review-row-name draggable="true" title="双击更改任务名称">${esc(rowLabel(row))}</button>
                <span data-table-row-resize data-review-resize="height" title="调整行高"></span></div>`;
            for (const [index,column] of visibleColumns.entries()) {
                const area = {...areaFor(row,column),isManageMode:false};
                const preview = area.type === 'preview';
                const cell = renderReviewArea(area,row);
                element.append(cell);
                cell.dataset.reviewCell = area.id;cell.dataset.reviewColumnIndex = column.index;cell.dataset.tableIndex = index;
                cell.setAttribute('role','cell');cell.draggable=false;cell.style.gridColumn=index+2;
                if (!preview) {
                    updateTableEditor(cell,area,tableParameter(area,params));
                    cell.querySelectorAll('.clab-input-body,.clab-input-header').forEach(part=>part.inert=true);
                }
            }
            wrapper.append(element);
        }
        attachReviewGridMedia(wrapper);
        const context=document.createElement('canvas').getContext('2d');
        context.font='12px sans-serif';
        const rowWidth=visibleRows.reduce((width,row)=>Math.max(width,Math.ceil(context.measureText(rowLabel(row)).width)+18),44);
        wrapper.style.setProperty('--clab-table-row-width',`${rowWidth}px`);
        left.innerHTML=`<div class="clab-review-sheet-settings"><section><h3>显示任务</h3>${rows.map(row=>check('row',row.id,rowLabel(row),shownRows.has(row.id))).join('')||'<p>没有任务</p>'}</section>
            <section><h3>显示字段</h3>${columns.map(column=>check('column',column.id,columnLabel(column),shownColumns.has(column.id))).join('')||'<p>没有字段</p>'}</section></div>`;
        paint();
        changed();
    }
    function mount() {
        center.innerHTML='<div class="clab-review-grid" data-workspace-mode="table"><div class="clab-review-grid-stage"><div class="clab-cards-wrapper" role="table" aria-label="任务参数表"></div></div></div>';
        right.innerHTML=`<div class="clab-review-sheet-settings"><section><h3>单元格设置</h3><div class="clab-table-column-body clab-review-cell-settings"></div></section>${exportControls}</div>`;
        settings=right.querySelector('.clab-review-cell-settings');
        const stage=center.querySelector('.clab-review-grid-stage');
        stage.tabIndex=0;
        stage.addEventListener('click',event=>{
            if (event.target.closest('input,[data-table-row-title]')) return;
            const cell=event.target.closest('[data-review-cell]'),row=event.target.closest('[data-review-row-name]')?.closest('[data-review-row]'),
                column=event.target.closest('[data-review-column]');
            if (drag?.moved || event.target.closest('[data-review-resize]')) return;
            if (!event.target.closest('button,a')) stage.focus({preventScroll:true});
            if (event.target.closest('[data-review-select-all]')) {
                const all=visibleRows.flatMap(row=>visibleColumns.map(column=>row.areas[column.index].id));
                choose(all.length===selected.size?[]:all,'cell');
            } else if (cell) {
                const id=cell.dataset.reviewCell;
                choose(event.shiftKey && anchor ? tableCellRange(visibleRows,visibleColumns,anchor,id) : [id],'cell',event.shiftKey?{}:event);
                if (!event.shiftKey) anchor=id;
            } else if (row) {
                const id=row.dataset.reviewRow;
                const start=kind==='row'?visibleRows.findIndex(item=>item.id===headerAnchor):-1,end=visibleRows.findIndex(item=>item.id===id);
                const ids=event.shiftKey&&start>=0?visibleRows.slice(Math.min(start,end),Math.max(start,end)+1).map(item=>item.id):[id];
                choose(ids,'row',event);
                if(!event.shiftKey)headerAnchor=id;
            }
            else if (column) {
                const id=column.dataset.reviewColumn;
                const start=kind==='column'?visibleColumns.findIndex(item=>item.id===headerAnchor):-1,end=visibleColumns.findIndex(item=>item.id===id);
                const group=event.shiftKey&&start>=0?visibleColumns.slice(Math.min(start,end),Math.max(start,end)+1):[visibleColumns[end]];
                choose(visibleRows.flatMap(row=>group.map(item=>row.areas[item.index].id)),'column',event);
                if(!event.shiftKey)headerAnchor=id;
            } else choose([],null);
        });
        stage.addEventListener('dblclick',event=>{
            const columnName=event.target.closest('[data-review-column-name]'),rowName=event.target.closest('[data-review-row-name]');
            if (columnName) {
                const id=columnName.closest('[data-review-column]').dataset.reviewColumn;
                const current=columns.find(item=>item.id===id);
                editTableRowTitle(columnName,current.area.title||'',name=>{
                    const data=ensureSheet(),column=data.columns.find(item=>item.id===id);
                    if (!column) return;
                    column.title=name;view.configured[id]=true;
                    for (const row of data.rows) {
                        const area=cards.find(card=>card.id===row.cardId)?.areas.find(item=>item.tableColumnId===id);
                        if (area) area.title=name;
                    }
                    render(); save();
                },'列名称');
            } else if (rowName) {
                const id=rowName.closest('[data-review-row]').dataset.reviewRow;
                const current=rows.find(item=>item.id===id);
                editTableRowTitle(rowName,current.title||'',name=>{
                    const row=ensureSheet().rows.find(item=>item.id===id);
                    const card=cards.find(item=>item.id===row?.cardId);
                    if (card) card.title=name;
                    else if (row) row.title=name;
                    render(); save();
                });
            }
        });
        bindGestures(stage);
        render();
        mountSettings();
    }
    function bindGestures(stage) {
        stage.addEventListener('pointerdown',event=>{
            if (event.button!==0) return;
            const resize=event.target.closest('[data-review-resize]');
            const cell=event.target.closest('[data-review-cell]');
            if (resize) {
                event.preventDefault();
                const key=resize.dataset.reviewResize,id=key==='width'?resize.closest('[data-review-column]').dataset.reviewColumn:resize.closest('[data-review-row]').dataset.reviewRow;
                const target=scope(),group=key==='width'?target.columns:target.rows,ids=group.includes(id)?group:[id];
                const layout=layoutView(),size=key==='width'?tableColumnWidth({id},layout):tableRowHeight(layout,{id});
                drag={key,ids,size,start:key==='width'?event.clientX:event.clientY,pointer:event.pointerId,moved:false};
                stage.setPointerCapture(event.pointerId);
            } else if (cell && !event.target.closest('button,a,video,audio')) {
                drag={id:cell.dataset.reviewCell,x:event.clientX,y:event.clientY,pointer:event.pointerId,moved:false,base:event.ctrlKey||event.metaKey?[...selected]:[]};
            }
        });
        stage.addEventListener('pointermove',event=>{
            if (!drag || drag.pointer!==event.pointerId || !event.buttons) return;
            if (drag.key) {
                const delta=(drag.key==='width'?event.clientX:event.clientY)-drag.start;
                if (delta && resizeTableCells(view,ensureSheet(),drag.key,drag.size+delta,drag.ids)) { drag.moved=true;paint(); }
            } else if (Math.hypot(event.clientX-drag.x,event.clientY-drag.y)>4) {
                const cell=document.elementFromPoint(event.clientX,event.clientY)?.closest('[data-review-cell]');
                if (cell && stage.contains(cell)) {
                    drag.moved=true;kind='cell';
                    selected=new Set([...drag.base,...tableCellRange(visibleRows,visibleColumns,drag.id,cell.dataset.reviewCell)]);
                    paint();
                }
            }
        });
        const finish=()=>{
            if (!drag) return;
            const previous=drag;
            if (previous.moved) {
                if (previous.key) { save(); changed(); }
                else anchor=previous.id;
                mountSettings();changed();
            }
            setTimeout(()=>{if(drag===previous)drag=null;},0);
        };
        stage.addEventListener('pointerup',finish);
        stage.addEventListener('pointercancel',finish);
        stage.addEventListener('dragstart',event=>{
            const row=event.target.closest('[data-review-row-name]')?.closest('[data-review-row]'),column=event.target.closest('[data-review-column]');
            if (!row&&!column) return;
            reorder={kind:row?'row':'column',id:row?.dataset.reviewRow??column.dataset.reviewColumn};
            event.dataTransfer.setData('text/plain',reorder.id);
            event.dataTransfer.effectAllowed='move';
        });
        stage.addEventListener('dragover',event=>{if(reorder)event.preventDefault();});
        stage.addEventListener('drop',event=>{
            if (!reorder) return;
            event.preventDefault();
            const row=event.target.closest('[data-review-row]'),column=event.target.closest('[data-review-column]');
            const id=reorder.kind==='row'?row?.dataset.reviewRow:column?.dataset.reviewColumn;
            if (!id || id===reorder.id) return;
            const data=ensureSheet(),items=reorder.kind==='row'?data.rows:data.columns;
            const target=scope(),group=reorder.kind==='row'?target.rows:target.columns;
            const ids=kind===reorder.kind&&group.includes(reorder.id)?group:[reorder.id];
            const rect=(reorder.kind==='row'?row:column).getBoundingClientRect();
            const after=reorder.kind==='row'?event.clientY>(rect.top+rect.bottom)/2:event.clientX>(rect.left+rect.right)/2;
            if (reorderTableItems(items,ids,id,after,reorder.kind==='column')) {
                orderSheetTasks(data,cards);selected.clear();render();mountSettings();save();
            }
        });
        stage.addEventListener('dragend',()=>{reorder=null;});
        stage.addEventListener('keydown',event=>{
            if (event.target.matches('input,textarea,select')) return;
            const direction=reviewHistoryDirection(event),outputs=direction?outputCells(true):[];
            if (outputs.length) {
                event.preventDefault();event.stopPropagation();
                for (const {row,area} of outputs) {
                    const cell=wrapper.querySelector('[data-review-cell="'+CSS.escape(area.id)+'"]');
                    const next=stepReviewGridOutput(cell,row,area,direction);
                    if (next) histories.set(area.id,next);
                }
                changed();return;
            }
            if (event.key==='Escape') { event.stopPropagation();choose([],null); }
            if ((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='a') {
                event.preventDefault();choose(visibleRows.flatMap(row=>visibleColumns.map(column=>row.areas[column.index].id)),'cell');
            }
        });
    }
    return {
        open(workspace) {
            histories.clear();
            params=workflowParameters();
            view=workspace.view.table;cards=state.cards;
            template=cards.find(card=>card.id===workspace.view.templateId)||cards[0];
            if(view.empty)template=null;
            fallback={id:'',columns:(template?.areas||[]).map(area=>({...area,id:area.tableColumnId||area.id})),rows:[]};
            sheet=view.sheets.find(item=>item.id===view.sheetId)||fallback;
            shownRows=new Set();shownColumns=new Set();selected=new Set();kind=null;anchor=null;headerAnchor=null;
            read();
            for (const row of rows) if(effectiveTableRow(row)) shownRows.add(row.id);
            for (const column of columns) if(boundColumn(column.area)) shownColumns.add(column.id);
        },
        mount,
        release() { releaseReviewGridMedia(wrapper);wrapper=null;settings=null;drag=null;reorder=null; },
        flush() {
            if (!dirty) return;
            dirty=false;
            document.dispatchEvent(new Event('clab_render_ui'));
        },
        filter(input) {
            const shown=input.dataset.gridFilter==='row'?shownRows:shownColumns;
            if(input.checked)shown.add(input.value);else shown.delete(input.value);
            selected.clear();render();mountSettings();
        },
        downloadRecords(selectedOnly,includeHistory) {
            return outputCells(selectedOnly).flatMap(({row,area})=>outputDownloadRecords({id:row.sheetRow?.cardId||row.id},area,includeHistory));
        },
        jsonCards() {
            return visibleRows.map(row=>({id:row.sheetRow?.cardId||row.id,title:row.title,
                areas:visibleColumns.map(column=>areaFor(row,column))}));
        },
        exportSource() {
            const outputRows=histories.size?visibleRows.map(row=>({...row,areas:row.areas.map(area=>histories.get(area.id)||area)})):visibleRows;
            return {rows:outputRows,fields:visibleColumns.map(column=>({key:column.id,label:columnLabel(column),index:column.index})),layout:layoutView()};
        },
        hasExportData() { return visibleRows.length>0&&visibleColumns.length>0; },
    };
}
