import { state, appState } from '../ui_state.js';
import { updateSelectionUI } from '../ui_selection.js';
import { tableCellRange } from './table_model.js';
import { tableSelectionIds } from './table_sheet.js';
import { focusTableCell } from './table_editors.js';

export function tableLayoutSelection(rows, columns, selectedRows, selectedAreas, kind, activeArea, activeRow) {
    if (!selectedRows.length && !selectedAreas.length) {
        return {cells:[], rows:[], columns:[], scope:'table', allWidths:true, allHeights:true};
    }
    const rowSelection = new Set(selectedRows), areaSelection = new Set(selectedAreas);
    const cells = [], rowIds = new Set(), columnIds = new Set();
    for (const row of rows) for (const column of columns) {
        const areaId = row.areas[column.index].id;
        if (!rowSelection.has(row.id) && !areaSelection.has(areaId)) continue;
        cells.push({rowId:row.id, columnId:column.id, areaId});
        rowIds.add(row.id);
        columnIds.add(column.id);
    }
    const anchor = cells.find(cell => cell.areaId === activeArea) || cells.find(cell => cell.rowId === activeRow) || cells[0];
    return {cells, anchor, rows:[...rowIds], columns:[...columnIds],
        scope:!cells.length ? 'table' : selectedRows.length ? 'row' : kind === 'column' ? 'column' : 'cell',
        allWidths:!cells.length || columnIds.size === columns.length,
        allHeights:!cells.length || rowIds.size === rows.length};
}

export function attachTableSelection(panel,actions) {
    let rowAnchor='',cellAnchor='',columnAnchor='',kind='',pendingHeader,headerPress=false,range,ignoreClickUntil=0,selectAllStage=0;const selectedColumns=new Set();
    const stopRange=()=>{if(!range)return;const previous=range;range=null;previous.controller.abort();cancelAnimationFrame(previous.frame);if(previous.moved){document.body.style.userSelect=previous.userSelect;ignoreClickUntil=performance.now()+200;}};
    const apply=(type,ids,event)=>{
        const key=type==='row'?'selectedCardIds':'selectedAreaIds';
        const current=state[key];state[key]=event?.ctrlKey||event?.metaKey?[...current.filter(id=>!ids.includes(id)),...ids.filter(id=>!current.includes(id))]:ids;
        if(type==='row')state.selectedAreaIds=[];else state.selectedCardIds=[];
        if(kind==='column'){selectedColumns.clear();for(const column of actions.columns())if(actions.group().every(row=>state.selectedAreaIds.includes(row.areas[column.index].id)))selectedColumns.add(column.id);}
        updateSelectionUI();actions.paint();
    };
    const selectRow=(id,event={})=>{
        kind='row';selectedColumns.clear();
        const group=actions.group(),from=group.findIndex(card=>card.id===rowAnchor),to=group.findIndex(card=>card.id===id);
        const ids=event.shiftKey&&from>=0?group.slice(Math.min(from,to),Math.max(from,to)+1).map(card=>card.id):[id];
        if(!event.shiftKey)rowAnchor=id;state.activeCardId=id;appState.lastClickedAreaId=group[to]?.areas[0]?.id;apply('row',ids,event.shiftKey?{}:event);
    };
    const selectCell=(id,event={})=>{
        kind='cell';selectedColumns.clear();
        const group=actions.group(),ids=event.shiftKey&&cellAnchor?tableCellRange(group,actions.columns(),cellAnchor,id):[id];
        if(!event.shiftKey)cellAnchor=id;appState.lastClickedAreaId=id;state.activeCardId=group.find(card=>card.areas.some(area=>area.id===id))?.id;
        apply('cell',ids,event.shiftKey?{}:event);
    };
    const selectColumn=(index,event={})=>{
        kind='column';
        const columns=actions.columns(),column=columns.find(entry=>entry.index===index),from=columns.findIndex(entry=>entry.id===columnAnchor),to=columns.indexOf(column);
        if(!column)return;const selected=event.shiftKey&&from>=0?columns.slice(Math.min(from,to),Math.max(from,to)+1):[column];
        if(!event.shiftKey)columnAnchor=column.id;
        const group=actions.group();
        appState.lastClickedAreaId=(group.find(row=>row.id===state.activeCardId)||group[0])?.areas[column.index]?.id;
        apply('cell',group.flatMap(card=>selected.map(column=>card.areas[column.index].id)),event.shiftKey?{}:event);
    };
    const selectAll = (effectiveOnly = false) => {
        clear();
        let ids = tableSelectionIds(actions.group(), actions.columns(), effectiveOnly);
        if (effectiveOnly && !ids.length) {
            effectiveOnly = false;
            ids = tableSelectionIds(actions.group(), actions.columns(), false);
        }
        kind = effectiveOnly ? 'effective' : 'all';
        if (!ids.includes(appState.lastClickedAreaId)) appState.lastClickedAreaId = ids[0] ?? null;
        cellAnchor = appState.lastClickedAreaId || '';
        apply('cell', ids);
    };
    const deselect = () => {
        clear();
        state.activeCardId = null;
        appState.lastClickedAreaId = null;
        apply('cell', []);
    };
    const startRange=(event,cell)=>{
        if(event.target.closest('button,a,select,input[type=checkbox],input[type=range],.clab-custom-select,.clab-bool-label,.clab-upload-zone,.clab-history-grid,.clab-glb-viewer'))return;
        stopRange();const controller=new AbortController(),container=panel.querySelector('#clab-cards-container');
        range={controller,start:cellAnchor||cell.dataset.areaId,base:event.ctrlKey||event.metaKey?[...state.selectedAreaIds]:[],x:event.clientX,y:event.clientY,firstX:event.clientX,firstY:event.clientY,userSelect:document.body.style.userSelect,moved:false};
        const sample=()=>{
            if(!range)return;const b=container.getBoundingClientRect(),gutter=parseFloat(getComputedStyle(container.querySelector('.clab-cards-wrapper')).getPropertyValue('--clab-table-row-width'))||44;
            const x=Math.max(b.left+gutter+1,Math.min(b.right-29,range.x)),y=Math.max(b.top+41,Math.min(b.bottom-29,range.y)),target=document.elementFromPoint(x,y)?.closest('.clab-area,.clab-table-draft-cell');if(!target)return;
            const ids=[...new Set([...range.base,...tableCellRange(actions.group(),actions.columns(),range.start,target.dataset.areaId)])];
            if(ids.join()!==state.selectedAreaIds.join()){appState.lastClickedAreaId=target.dataset.areaId;state.selectedAreaIds=ids;state.selectedCardIds=[];updateSelectionUI();actions.paint();}
        };
        const scroll=()=>{if(!range?.moved)return;const b=container.getBoundingClientRect(),left=container.scrollLeft,top=container.scrollTop;container.scrollBy(range.x>b.right-24?14:range.x<b.left+54?-14:0,range.y>b.bottom-24?14:range.y<b.top+50?-14:0);if(left!==container.scrollLeft||top!==container.scrollTop)sample();range.frame=requestAnimationFrame(scroll);};
        window.addEventListener('pointermove',event=>{if(!range)return;range.x=event.clientX;range.y=event.clientY;if(!range.moved&&Math.hypot(range.x-range.firstX,range.y-range.firstY)<5)return;if(!range.moved){range.moved=true;document.body.style.userSelect='none';scroll();}event.preventDefault();document.getSelection()?.removeAllRanges();sample();},{signal:controller.signal,capture:true,passive:false});
        for(const type of ['pointerup','pointercancel'])window.addEventListener(type,stopRange,{signal:controller.signal,once:true,capture:true});
        window.addEventListener('blur',stopRange,{signal:controller.signal,once:true});
    };
    panel.addEventListener('pointerdown',event=>{
        if(!actions.active())return;
        selectAllStage=0;
        if(event.button!==0)return;
        pendingHeader=null;headerPress=false;ignoreClickUntil=0;
        const row=event.target.closest('[data-table-row-header]'),header=event.target.closest('.clab-table-column[data-table-column]'),cell=event.target.closest('.clab-area,.clab-table-draft-cell');
        const plain=!event.ctrlKey&&!event.metaKey&&!event.shiftKey;
        if(plain&&cell&&actions.editing.contains(event.target)&&actions.editing.textTarget(event.target))return;
        actions.editing.end();
        if(row){headerPress=true;const id=row.closest('[data-table-row]').dataset.tableRow;if(plain&&state.selectedCardIds.length>1&&state.selectedCardIds.includes(id))pendingHeader=()=>selectRow(id);else selectRow(id,event);return;}
        if (header && !event.target.closest('button,input,select,[data-table-resize]')) {
            headerPress = true;
            const index = Number(header.dataset.tableIndex);
            if (plain && selectedColumns.size > 1 && selectedColumns.has(header.dataset.tableColumn)) pendingHeader = () => selectColumn(index);
            else selectColumn(index, event);
            header.tabIndex = -1;
            header.focus({preventScroll:true});
            return;
        }
        if (cell) {
            selectCell(cell.dataset.areaId, event);
            startRange(event, cell);
            const text = actions.editing.textTarget(event.target);
            const control = event.target.closest('button,a,select,input,.clab-custom-select,.clab-upload-zone,.clab-glb-viewer');
            if (!plain || text || !control) focusTableCell(panel.querySelector(`[data-area-id="${CSS.escape(cell.dataset.areaId)}"]`));
            if (!plain || text) event.preventDefault();
        }
    },true);
    panel.addEventListener('dragstart',event=>{pendingHeader=null;if(range){event.preventDefault();event.stopImmediatePropagation();}},true);
    panel.addEventListener('click',event=>{
        if(!actions.active())return;
        if(performance.now()<ignoreClickUntil){event.preventDefault();event.stopImmediatePropagation();return;}
        if(pendingHeader){const select=pendingHeader;pendingHeader=null;select();}
        if(headerPress){headerPress=false;event.preventDefault();event.stopImmediatePropagation();return;}
        const cell=event.target.closest('.clab-area,.clab-table-draft-cell');if(cell&&(event.ctrlKey||event.metaKey||event.shiftKey)){event.preventDefault();event.stopImmediatePropagation();}
        const row=event.target.closest('[data-table-row-header]');if(row&&event.detail===0)selectRow(row.closest('[data-table-row]').dataset.tableRow,event);
        const gridBlank = event.target.closest('#clab-cards-container') && !event.target.closest('[role=cell],.clab-table-head,.clab-card-title-bar,.clab-table-fixed-controls');
        const toolbarBlank = event.target.matches('.clab-tool-dock,.clab-toolbar-left,.clab-toolbar-right');
        const workspaceBlank=event.target.matches('.clab-workspace-strip,.clab-workspace-shell,.clab-workspace-tabs');
        if ((gridBlank || toolbarBlank || workspaceBlank) && (kind || state.selectedAreaIds.length || state.selectedCardIds.length)) deselect();
    },true);
    const clear = () => {stopRange();pendingHeader=null;headerPress=false;rowAnchor=cellAnchor=columnAnchor=kind='';selectAllStage=0;selectedColumns.clear();};
    document.addEventListener('keydown', event => {
        const isSelectAll = (event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === 'a';
        if (!isSelectAll && !['Control','Meta','Shift','Alt'].includes(event.key)) selectAllStage = 0;
        if (!isSelectAll && event.key !== 'Escape') return;
        const target = event.target;
        if (!actions.active() || !panel.classList.contains('visible') || appState.isBindingMode || event.isComposing ||
            document.querySelector('.clab-preview-modal.visible,.clab-module-binding-popover:popover-open') ||
            (!panel.contains(target) && target !== document.body && target !== document.documentElement && !target.closest?.('.clab-context-menu:has([data-table-context-settings])')) ||
            target.closest?.('[popover],select,input:not([readonly]):not([type=checkbox]):not([type=range]),textarea:not([readonly]),[contenteditable=true]')) return;
        event.preventDefault();
        event.stopPropagation();
        if (event.repeat) return;
        if (event.key === 'Escape') {
            state.painterMode = false;
            state.painterSource = null;
            panel.classList.remove('clab-painter-active');
        }
        if (event.key === 'Escape' || event.shiftKey) deselect();
        else if (selectAllStage < 2) {
            const effectiveOnly = selectAllStage === 0;
            selectAll(effectiveOnly);
            selectAllStage = kind === 'effective' ? 1 : 2;
        }
    }, true);
    return {selectRow,selectColumn,selectCell,selectAll,deselect,kind:()=>kind,columnIndices:()=>kind==='column'?actions.columns().filter(column=>selectedColumns.has(column.id)).map(column=>column.index):[],sync(){
        if(kind==='column')state.selectedAreaIds=actions.group().flatMap(row=>actions.columns().filter(column=>selectedColumns.has(column.id)).map(column=>row.areas[column.index].id));
        if(kind==='all')state.selectedAreaIds=tableSelectionIds(actions.group(),actions.columns(),false);
    },clear};
}
