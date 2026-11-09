import { state } from '../ui_state.js';
import { parseTableClipboard } from './table_model.js';

export function attachTableGestures(container,actions) {
    let drag,resize,canDrag=true;
    const clear=()=>{drag=null;container.querySelectorAll('.is-drop-target,.is-reordering').forEach(node=>node.classList.remove('is-drop-target','is-reordering'));};
    const dropTarget=event=>drag.type==='column'?event.target.closest('.clab-table-column[data-table-column]')||container.querySelector(`.clab-table-column[data-table-index="${event.target.closest('[data-table-index]')?.dataset.tableIndex}"]`):event.target.closest('[data-table-row]');
    const stop=()=>{if(!resize)return;const previous=resize;resize=null;previous.controller.abort();document.body.style.userSelect=previous.select;if(previous.changed)actions.finish();};
    container.addEventListener('pointerdown',event=>{
        if(!actions.active())return;
        canDrag=!!event.target.closest('[data-table-row-header]')||!!event.target.closest('.clab-table-column[data-table-column]')&&!event.target.closest('button,input,select,[data-table-resize]');
        const handle=event.target.closest('[data-table-resize],[data-table-row-resize]');if(event.button!==0||!handle)return;
        event.preventDefault();event.stopPropagation();stop();const row=handle.closest('[data-table-row]'),column=handle.closest('[data-table-column]'),key=row?'height':'width',element=row||column,initial=row?element.getBoundingClientRect().height:element.getBoundingClientRect().width,start=row?event.clientY:event.clientX,controller=new AbortController();
        resize={controller,select:document.body.style.userSelect,changed:false};document.body.style.userSelect='none';
        window.addEventListener('pointermove',event=>{if(!resize)return;const delta=(row?event.clientY:event.clientX)-start;if(Math.abs(delta)<1)return;resize.changed=true;actions.resize(column?Number(column.dataset.tableIndex):0,key,initial+delta,true,row?.dataset.tableRow);},{signal:controller.signal});
        for(const type of ['pointerup','pointercancel','blur'])window.addEventListener(type,stop,{once:true,signal:controller.signal});
    },true);
    container.addEventListener('dragstart',event=>{
        if(!actions.active())return;const handle=event.target.closest('.clab-table-column[data-table-column],[data-table-row-header]');if(!handle)return;
        if(!canDrag){event.preventDefault();return;}event.stopPropagation();const column=handle.closest('[data-table-column]'),type=column?'column':'row',id=column?.dataset.tableColumn||handle.closest('[data-table-row]').dataset.tableRow;drag={type,ids:actions.dragItems(type,id)};event.dataTransfer.effectAllowed='move';event.dataTransfer.setData('text/plain',JSON.stringify(drag));
        for(const id of drag.ids)container.querySelector(type==='column'?`.clab-table-column[data-table-column="${CSS.escape(id)}"]`:`[data-table-row="${CSS.escape(id)}"] [data-table-row-header]`)?.classList.add('is-reordering');
    },true);
    container.addEventListener('dragover',event=>{if(!actions.active()||!drag)return;event.preventDefault();event.stopPropagation();const target=dropTarget(event);if(!target)return;event.dataTransfer.dropEffect='move';container.querySelectorAll('.is-drop-target').forEach(node=>node.classList.remove('is-drop-target'));target.classList.add('is-drop-target');},true);
    container.addEventListener('drop',event=>{
        if(!actions.active()||!drag)return;event.preventDefault();event.stopPropagation();const target=dropTarget(event);if(target){const r=target.getBoundingClientRect(),after=drag.type==='column'?event.clientX>(r.left+r.right)/2:event.clientY>(r.top+r.bottom)/2;actions.move(drag.type,drag.ids,drag.type==='column'?target.dataset.tableColumn:target.dataset.tableRow,after);}clear();
    },true);
    container.addEventListener('dragend',clear,true);
    container.addEventListener('paste', event => {
        if (!actions.active() || (actions.editing.contains(event.target) && actions.editing.textTarget(event.target))) return;
        const cell = event.target.closest('.clab-area,.clab-table-draft-cell');
        if (!cell && !event.target.closest('.clab-table-head,[data-table-row-header]')) return;
        const clipboard = event.clipboardData;
        if (!Array.from(clipboard?.types || []).includes('text/plain')) return;
        const text = clipboard.getData('text/plain');
        const html = clipboard.getData('text/html');
        event.preventDefault();
        event.stopPropagation();
        try {
            const values = /[\t\r\n]/.test(text) || /<table\b/i.test(html) ? parseTableClipboard(text) : [[text]];
            actions.paste(cell?.dataset.areaId, values);
        } catch (error) {
            actions.notice(error.message, true);
        }
    }, true);
    container.addEventListener('keydown',event=>{
        if(!actions.active()||!['Enter','Tab'].includes(event.key)||event.shiftKey&&event.key==='Enter'||event.ctrlKey||event.metaKey)return;
        const cell=event.target.closest('[role=cell]');if(!cell||event.target!==cell&&!event.target.closest('.clab-table-number,textarea.clab-edit-val,.clab-table-draft-value,.clab-table-choice,.clab-edit-val-bool,.clab-custom-select'))return;
        const group=actions.group(),count=actions.columns().length,row=group.findIndex(row=>row.id===cell.dataset.cardId),column=Number(cell.dataset.tableIndex);let nextRow=row,nextColumn=column;
        if(event.key==='Enter')nextRow++;else{nextColumn+=event.shiftKey?-1:1;if(nextColumn>=count){nextColumn=0;nextRow++;}else if(nextColumn<0){nextColumn=count-1;nextRow--;}}
        if(nextRow<0)return;event.preventDefault();event.stopPropagation();event.target.blur();actions.navigate(nextRow,nextColumn);
    });
    document.addEventListener('keydown',event=>{if(!actions.active()||!container.closest('#clab-panel.visible')||event.key!=='Delete'||actions.editing.contains(event.target)||event.target.closest('select,[contenteditable=true],[role=dialog]')||event.target.closest('input,textarea')&&!event.target.closest('[role=cell]'))return;if(state.selectedAreaIds.length){event.preventDefault();event.stopImmediatePropagation();actions.clear(state.selectedAreaIds);}},true);
    return ()=>{clear();stop();};
}
