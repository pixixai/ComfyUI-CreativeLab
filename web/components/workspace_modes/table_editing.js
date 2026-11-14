import { focusTableCell } from './table_editors.js';

const textSelector = 'textarea.clab-edit-val,.clab-table-number,textarea.clab-table-draft-value,input.clab-table-draft-value:not([type=checkbox])';
const cellOf = target => target?.closest('.clab-area,.clab-table-draft-cell');

export function attachTableEditing(container,actions) {
    let editingId = '';
    const findCell = id => container.querySelector(`[role=cell][data-area-id="${CSS.escape(id)}"]`);
    const syncCell = cell => {
        if(cell){
            const editing = cell.dataset.areaId === editingId;
            cell.toggleAttribute('data-table-editing', editing);
            for (const input of cell.querySelectorAll(textSelector)) {
                input.dataset.tableReadOnly ??= String(input.readOnly);
                const readOnly = !editing || input.dataset.tableReadOnly === 'true';
                if (input.readOnly !== readOnly) input.readOnly = readOnly;
            }
        }
    };
    const sync=()=>container.querySelectorAll('[role=cell]').forEach(syncCell);
    const setEditing=id=>{const previous=editingId;editingId=id;syncCell(findCell(previous));if(id!==previous)syncCell(findCell(id));};
    const end = () => {
        if (!editingId) return;
        const cell = findCell(editingId);
        setEditing('');
        if (cell?.contains(document.activeElement) && document.activeElement !== cell) document.activeElement.blur();
    };
    const begin = (cell, atEnd = false) => {
        cell.dispatchEvent(new CustomEvent('clab_ensure_component',{bubbles:true}));
        const input = [...cell.querySelectorAll(textSelector)].find(input =>
            input.getClientRects().length && !input.disabled && input.dataset.tableReadOnly !== 'true');
        if (!input) {
            const control = cell.querySelector('select.clab-table-choice,select.clab-table-draft-value,input[type=checkbox]');
            if (!control?.getClientRects().length || control.disabled) return false;
        }
        const id = cell.dataset.areaId;
        actions.select(id);
        if (input) {
            setEditing(id);
        }
        const field = focusTableCell(findCell(id), true);
        if (atEnd && field instanceof HTMLTextAreaElement) field.setSelectionRange(field.value.length, field.value.length);
        return true;
    };
    const contains = target => !!editingId && cellOf(target)?.dataset.areaId === editingId;
    container.addEventListener('dblclick', event => {
        if (!actions.active() || event.ctrlKey || event.metaKey || event.shiftKey ||
            event.target.closest('button,a,select,.clab-upload-zone,.clab-glb-viewer')) return;
        const cell = cellOf(event.target);
        if (cell && begin(cell)) event.stopPropagation();
    });
    container.addEventListener('keydown', event => {
        if (!actions.active()) return;
        const cell = cellOf(event.target);
        if (!cell) return;
        if (event.key === 'F2' && !event.ctrlKey && !event.metaKey && begin(cell, true)) {
            event.preventDefault();
            event.stopPropagation();
        }
        if (event.key === 'Escape' && contains(event.target)) {
            event.preventDefault();
            event.stopPropagation();
            end();
            focusTableCell(cell);
        }
    }, true);
    container.addEventListener('focusout', event => {
        if (contains(event.target) && !contains(event.relatedTarget)) {
            setEditing('');
        }
    });
    return {
        sync, syncCell, end, contains,
        textTarget: target => !!target?.matches(textSelector),
        restore() {
            end();
            for (const input of container.querySelectorAll('[data-table-read-only]')) {
                input.readOnly = input.dataset.tableReadOnly === 'true';
                delete input.dataset.tableReadOnly;
            }
            container.querySelectorAll('[data-table-editing]').forEach(cell => cell.removeAttribute('data-table-editing'));
        },
    };
}
