import { openXYPopover } from './xy_popover.js';
import { attachTableValues } from './table_fill.js';
import { tableResetIcon } from './table_icons.js';

export function openTableColumnSettings(trigger, column, actions, boundary) {
    const panel = openXYPopover(() => trigger, '列设置', '<div class="clab-table-column-body"></div>',
        'clab-xy-values clab-table-column-panel', '', boundary);
    const {popup} = panel;
    const head = popup.querySelector('.clab-binding-panel-head');
    const body = popup.querySelector('.clab-table-column-body');
    head.querySelector('span').outerHTML = `<input type="text" class="clab-table-title-input" data-table-title="column" aria-label="列标题">
        <div class="clab-table-type-switch" role="group" aria-label="模块类型">
            <button type="button" data-table-type="edit">输入</button><button type="button" data-table-type="preview">输出</button>
        </div>
        <button type="button" data-table-reset title="重置列标题、类型、绑定和取值（保留历史）" aria-label="重置此列">${tableResetIcon}</button>`;
    const input = head.querySelector('[data-table-title]');
    input.placeholder = `列 ${column.index + 1}`;
    input.onchange = () => {
        input.value = input.value.trim();
        if (input.value !== (column.area.title || '')) actions.change(area => { area.title = input.value; });
    };
    input.onkeydown = event => {
        if (event.key === 'Enter' && !event.isComposing) {
            event.preventDefault();
            input.blur();
        }
    };
    const render = () => {
        input.value = column.area.title || '';
        for (const button of head.querySelectorAll('[data-table-type]')) {
            button.setAttribute('aria-pressed', String(button.dataset.tableType === column.area.type));
        }
        body.hidden = column.area.type !== 'edit';
        body.replaceChildren();
        if (!body.hidden) {
            const values = document.createElement('div');
            values.className = 'clab-table-values-editor';
            body.append(values);
            attachTableValues(values, column, actions.group(), actions.parameters, actions.view, actions.fill, actions.save, panel.position);
        }
        panel.position();
    };
    head.addEventListener('click', event => {
        const type = event.target.closest('[data-table-type]')?.dataset.tableType;
        if (event.target.closest('[data-table-reset]')) actions.reset();
        else if (type && type !== column.area.type) actions.change(area => { area.type = type; });
        else return;
        render();
    });
    render();
    return panel;
}
