const icon = path => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + path + '</svg>';
const play = '<path d="m8 5 12 7-12 7z" fill="currentColor" stroke="none"/>';

export const moreIcon = icon('<path d="M5 12h.01m7 0h.01m7 0h.01" stroke-width="3"/>');

const shortLabels = {
    新建任务:'新任务', 新建模块:'新模块', 单元格设置:'单元格',
    同步参数:'同步', 高度适配:'适配', 管理记录:'历史', 数据维护:'维护',
};

const toolbarDefinitions = [
    ['#clab-global-add-card', '新建任务', 8, '<rect x="3" y="4" width="18" height="16"/><path d="M8 12h8m-4-4v8"/>'],
    ['#clab-global-add-module', '新建模块', 8, '<path d="M3 5h18v5H3zM3 15h8m-4-4v8"/>'],
    ['#clab-import-json-wrapper', '导入', 3, '<path d="M4 15v5h16v-5M12 3v12m-4-4 4 4 4-4"/>'],
    ['.clab-toolbar-type:not(#clab-preview-mode-switch)', '模块类型', 7],
    ['#tb-clone-btn', '克隆', 4],
    ['#tb-format-painter', '格式刷', 4],
    ['#tb-table-cell-settings', '单元格设置', 7],
    ['#tb-reset-module', '重置', 3],
    ['#tb-reset-table-columns', '重置', 4],
    ['#tb-btn-sync-params', '同步参数', 3],
    ['.clab-auto-height', '高度适配', 3, '<path d="M4 3h16M4 21h16M12 5v14m-3-11 3-3 3 3m-6 8 3 3 3-3"/>'],
    ['#tb-manage-history', '管理记录', 4],
    ['#clab-run-group', '运行', 100, play],
    ['#clab-config-btn-wrapper', '数据维护', 4, '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>'],
    ['#clab-preview-mode-switch', '预览', 90],
];

function styleButton(button, label, path) {
    if (button.classList.contains('clab-tool-button')) return;
    button.classList.add('clab-tool-button');
    if (label) {
        const text = button.querySelector('span') || document.createElement('span');
        text.classList.add('clab-tool-label');
        text.textContent = label;
        for (const node of [...button.childNodes]) {
            if (node.nodeType === Node.TEXT_NODE) node.remove();
        }
        if (path) {
            const oldIcon = button.querySelector('svg');
            if (oldIcon) oldIcon.remove();
            button.insertAdjacentHTML('afterbegin', icon(path));
        }
        const graphic = button.querySelector('svg');
        if (graphic) {
            const face = document.createElement('span');
            face.className = 'clab-tool-icon';
            graphic.replaceWith(face);
            face.append(graphic);
        }
        button.append(text);
        const short = document.createElement('span');
        short.className = 'clab-tool-short-label';
        short.setAttribute('aria-hidden', 'true');
        short.textContent = shortLabels[label] || label;
        button.append(short);
        if (!button.hasAttribute('aria-label')) button.setAttribute('aria-label', label);
    } else {
        button.querySelector('svg')?.remove();
        if (!button.hasAttribute('aria-label')) button.setAttribute('aria-label', button.title || '更多选项');
    }
}

export function prepareToolbarItems(dock) {
    const items = [];
    for (const [key, label, priority, path] of toolbarDefinitions) {
        const item = dock.querySelector(key);
        if (!item) continue;
        items.push(item);
        item.dataset.toolbarItem = key;
        item.dataset.toolbarPriority = priority;
        if (item.matches('.clab-toolbar-type')) continue;
        const controls = item.id === 'clab-run-group' ? item.querySelector('#clab-run-btn-wrapper') : item;
        const buttons = controls.matches('button,label') ? [controls] : controls.querySelectorAll(':scope > button');
        [...buttons].forEach((button, index) => styleButton(button, index === 0 ? label : '', index === 0 ? path : null));
        const menu = controls.querySelector(':scope > .clab-toolbar-menu');
        if (menu) {
            const trigger = buttons[buttons.length - 1];
            buttons[0].classList.add('clab-tool-menu-button');
            trigger.setAttribute('aria-haspopup', 'menu');
        }
    }
    return items;
}
