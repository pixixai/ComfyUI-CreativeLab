import { state } from '../ui_state.js';
import { generateModuleBindingHTML, refreshModuleBindingSummary } from '../modules/module_binding.js';
import { moveModuleDOM } from '../modules/module_lifecycle.js';
import { tableParameter } from './table_model.js';
import { applyTableLayout, tablePadding } from './table_layout.js';
import { tableAppearance } from './table_appearance.js';
import { renderDraftRows } from './table_drafts.js';
import { boundColumn, effectiveTableRow } from './table_sheet.js';
import { tableSelectAllIcon } from './table_icons.js';
import { updateTableEditor, restoreTableEditors } from './table_editors.js';

export function renderTableGrid(wrapper,cards,rows,columns,view,parameters,save,ready) {
    wrapper.setAttribute('role','table');wrapper.setAttribute('aria-label','任务参数表');
    let head=wrapper.querySelector('.clab-table-head');
    if(!head){head=document.createElement('div');head.className='clab-table-head';head.setAttribute('role','row');head.innerHTML=`<div class="clab-table-corner" role="columnheader"><button type="button" data-table-select-all>${tableSelectAllIcon}</button></div>`;wrapper.prepend(head);}
    const selectedAreas = new Set(state.selectedAreaIds);
    const allSelected = rows.length * columns.length > 0 && rows.every(row => row.areas.every(area => selectedAreas.has(area.id)));
    const selectAll = head.querySelector('[data-table-select-all]');
    selectAll.setAttribute('aria-pressed', String(allSelected));
    selectAll.title = allSelected ? '取消全选' : '全选';
    selectAll.setAttribute('aria-label', selectAll.title);
    for(const element of head.querySelectorAll('[data-table-column]'))if(!columns.some(column=>column.id===element.dataset.tableColumn))element.remove();
    for(const column of columns){
        let element=head.querySelector(`[data-table-column="${CSS.escape(column.id)}"]`);
        if(!element){element=document.createElement('div');element.className='clab-table-column';element.dataset.tableColumn=column.id;element.setAttribute('role','columnheader');element.draggable=true;element.innerHTML=`<div class="clab-table-column-top"><button type="button" data-table-settings aria-haspopup="dialog"></button>${generateModuleBindingHTML(column.area)}</div><span class="clab-table-resize" data-table-resize role="separator" aria-label="调整列宽"></span>`;}
        const bound=column.area.targetNodeId!=null&&column.area.targetNodeId!==''||column.area.targetNodeIds?.length>0;
        if(bound)view.configured[column.id]=true;
        element.dataset.tableIndex=column.index;element.classList.toggle('clab-table-bound',!!bound);
        element.classList.toggle('has-controls',!!bound||!!column.area.title||!!view.configured[column.id]||view.widths[column.id]!==undefined||view.alignments[column.id]!==undefined||view.columnPaddings[column.id]!==undefined);
        element.classList.toggle('is-selected',wrapper.dataset.tableSelection==='column'&&rows.length>0&&rows.every(row=>selectedAreas.has(row.areas[column.index].id)));
        const settings = element.querySelector('[data-table-settings]');
        const label = column.area.title || `列 ${column.index + 1}`;
        if (settings.textContent !== label) settings.textContent = label;
        settings.title = label;
        settings.setAttribute('aria-label', `列设置 · ${label}`);
        refreshModuleBindingSummary(element,column.area);
        const next=column.index?head.querySelector(`[data-table-column="${CSS.escape(columns[column.index-1].id)}"]`).nextSibling:head.firstElementChild.nextSibling;
        if(element!==next)head.insertBefore(element,next);
    }
    const members=new Set(rows.map(row=>row.id));for(const element of wrapper.querySelectorAll(':scope>.clab-card'))element.hidden=!members.has(element.dataset.cardId);
    renderDraftRows(wrapper,rows,columns,parameters,selectedAreas);
    let cursor=head.nextSibling;
    for(const row of rows){
        const element=wrapper.querySelector(`:scope>[data-card-id="${CSS.escape(row.id)}"]`);element.dataset.tableRow=row.id;element.setAttribute('role','row');element.classList.toggle('selected',state.selectedCardIds.includes(row.id));
        if(element!==cursor){if(element.classList.contains('clab-card'))moveModuleDOM(wrapper,element,cursor);else wrapper.insertBefore(element,cursor);}cursor=element.nextSibling;
        const title=element.querySelector('.clab-card-title-bar');title.setAttribute('role','rowheader');title.style.gridColumn='1';
        if(!title.querySelector('[data-table-row-header]'))title.insertAdjacentHTML('afterbegin','<button class="clab-table-row-header" draggable="true" data-table-row-header></button><span data-table-row-resize role="separator" aria-label="调整行高"></span>');
        const button=title.querySelector('[data-table-row-header]'),rowLabel=row.title||String(rows.indexOf(row)+1);
        if(button.textContent!==rowLabel)button.textContent=rowLabel;
        button.title=`${rowLabel} · 双击改名`;button.setAttribute('aria-pressed',String(state.selectedCardIds.includes(row.id)));element.draggable=false;
        const cardTitle = title.querySelector('.clab-card-title-input');
        if (cardTitle && cardTitle.value !== (row.title || cardTitle.dataset.default)) {
            cardTitle.value = row.title || cardTitle.dataset.default;
            cardTitle.size = Math.max(cardTitle.value.length, 2);
        }
        const actual=new Map([...element.querySelectorAll('.clab-area')].map(cell=>[cell.dataset.areaId,cell]));
        const effective=effectiveTableRow(row);
        for(const column of columns){
            const area=row.areas[column.index],cell=actual.get(area.id)||element.querySelector(`.clab-table-draft-cell[data-table-column="${CSS.escape(column.id)}"]`);if(!cell)continue;
            cell.dataset.tableColumn=column.id;cell.dataset.tableIndex=column.index;cell.setAttribute('role','cell');cell.style.gridColumn=column.index+2;cell.draggable=false;
            const alignment=tableAppearance(view,'alignment',row.id,column.id);
            const anchor=alignment??0;
            cell.style.setProperty('--table-horizontal',['flex-start','center','flex-end'][anchor%3]);cell.style.setProperty('--table-vertical',['flex-start','center','flex-end'][Math.floor(anchor/3)]);cell.style.setProperty('--table-text',['left','center','right'][anchor%3]);
            cell.style.setProperty('--table-media-position', alignment == null ? 'center' : `${['left','center','right'][anchor%3]} ${['top','center','bottom'][Math.floor(anchor/3)]}`);
            const padding=tablePadding(tableAppearance(view,'padding',row.id,column.id));
            cell.style.setProperty('--clab-table-padding', `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`);
            cell.style.setProperty('--clab-table-padding-right', `${padding.right}px`);
            cell.classList.toggle('is-effective',effective&&boundColumn(column.area));
            if(cell.classList.contains('clab-area'))updateTableEditor(cell,area,tableParameter(area,parameters));else cell.classList.toggle('clab-table-text-cell',cell.dataset.editor==='text');
            cell.toggleAttribute('data-clab-table-media-ready',ready.has(area.id));
        }
    }
    const labels=['',...rows.map(row=>row.title||String(rows.indexOf(row)+1))],key=JSON.stringify(labels);
    if(wrapper.dataset.tableRowLabels!==key){const canvas=document.createElement('canvas').getContext('2d');canvas.font='12px sans-serif';wrapper.style.setProperty('--clab-table-row-width',`${Math.max(44,Math.ceil(Math.max(...labels.map(label=>canvas.measureText(label).width)))+18)}px`);wrapper.dataset.tableRowLabels=key;}
    applyTableLayout(wrapper,columns,view);
}

export function editTableRowTitle(button, title, save) {
    if (button.hidden) return;
    const input = document.createElement('input');
    input.type = 'text';
    input.dataset.tableRowTitle = '';
    input.setAttribute('aria-label', '行标题');
    input.value = title;
    input.placeholder = button.textContent;
    button.hidden = true;
    button.after(input);
    const finish = (commit, focus = false) => {
        if (!input.isConnected) return;
        input.onblur = null;
        input.remove();
        button.hidden = false;
        if (commit) save(input.value.trim());
        if (focus) button.focus({preventScroll:true});
    };
    input.onblur = () => finish(true);
    input.onkeydown = event => {
        if (event.isComposing || !['Enter','Escape'].includes(event.key)) return;
        event.preventDefault();
        event.stopPropagation();
        finish(event.key === 'Enter', true);
    };
    input.focus({preventScroll:true});
    input.select();
}

export function leaveTableGrid(wrapper) {
    restoreTableEditors(wrapper);
    wrapper.querySelectorAll('.clab-table-head,.clab-table-draft-row,.clab-table-draft-cell,[data-table-row-header],[data-table-row-resize],[data-table-row-title],.clab-table-number,.clab-table-choice').forEach(element=>element.remove());
    wrapper.removeAttribute('role');wrapper.removeAttribute('aria-label');for(const key of ['--clab-table-columns','--clab-table-row-width','--clab-table-height'])wrapper.style.removeProperty(key);delete wrapper.dataset.tableRowLabels;delete wrapper.dataset.tableSelection;
    wrapper.querySelectorAll('[data-table-column],[data-table-row],[role=rowheader]').forEach(element=>{delete element.dataset.tableColumn;delete element.dataset.tableIndex;delete element.dataset.tableRow;delete element.dataset.clabTableMediaReady;element.removeAttribute('role');element.style.removeProperty('grid-column');for(const key of ['--clab-table-height','--table-horizontal','--table-vertical','--table-text','--table-media-position','--clab-table-padding','--clab-table-padding-right','--clab-table-media-padding','--clab-table-media-zoom'])element.style.removeProperty(key);element.classList.remove('clab-table-has-number','clab-table-has-choice','clab-table-text-cell','is-effective');});
    for(const card of state.cards){const element=wrapper.querySelector(`:scope>.clab-card[data-card-id="${CSS.escape(card.id)}"]`);if(element)moveModuleDOM(wrapper,element,null);}
}
