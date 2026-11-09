import { openXYPopover } from './xy_popover.js';
import { parseTablePadding, tablePresetSize, tableRatioPosition, tableRatioPreset, tableRatios, tableSizes } from './table_layout.js';
import { cellAlignmentHTML } from './table_icons.js';

function sizeControls(captionFor) {
    const field = key => {
        const {min, max} = tableSizes[key], caption = captionFor(key);
        return `<div class="clab-table-size-field" data-table-size-field="${key}">
            <button type="button" data-table-dimension="${key}">${caption}</button>
            <input type="number" min="${min}" max="${max}" aria-label="${caption}" placeholder="混合" data-table-size="${key}">
        </div>`;
    };
    const edges = Object.entries({top:'width',bottom:'width',left:'height',right:'height'}).map(([edge,key]) =>
        `<button type="button" class="clab-table-size-edge" data-table-edge="${edge}" data-table-dimension="${key}" tabindex="-1" aria-label="调${captionFor(key)}"></button>`).join('');
    return `<div class="clab-table-size-controls">
        <div class="clab-table-size-stage"><div class="clab-table-size-outline">${edges}</div><output data-table-ratio-label></output></div>
        ${field('width')}${field('height')}
        <div class="clab-table-ratio-control">
            <input type="range" min="0" max="${tableRatios.length - 1}" step="any" data-table-ratio>
        </div>
    </div>`;
}

function ratioLabel(width, height) {
    let a = width, b = height;
    while (b) [a,b] = [b,a % b];
    return `${width / a}:${height / a}`;
}

export function openTableCellSettings(getTrigger, selection, actions, boundary, point) {
    const {scope, rows, columns, cells, allWidths, allHeights} = selection;
    const captionFor = key => key === 'width' ? (allWidths ? '全表列宽' : '列宽') : (allHeights ? '全表行高' : '行高');
    const summary = scope === 'table' ? '全表' : `已选 ${cells.length} 格 · 涉及 ${rows.length} 行、${columns.length} 列`;
    const panel = openXYPopover(getTrigger, '单元格设置',
        '<div class="clab-table-column-body"></div>', 'clab-xy-values clab-table-column-panel clab-table-cell-panel', '', boundary, point);
    const {popup} = panel;
    const body = popup.querySelector('.clab-table-column-body');
    body.innerHTML = `<div class="clab-table-selection-summary">${summary}</div>` + sizeControls(captionFor) + `
        <div class="clab-table-setting-line clab-table-appearance">
            <label>内边距<input type="text" data-table-padding placeholder="上, 下, 左, 右" title="上、下、左、右" aria-label="内边距（上、下、左、右）"></label>
            <div class="clab-table-alignment"><span>对齐</span>${cellAlignmentHTML()}</div>
            <button type="button" data-table-layout-reset>${scope === 'table' ? '恢复全表外观' : '恢复选区外观'}</button>
        </div><p class="clab-xy-popup-error" data-table-settings-error role="status"></p>`;
    let dimension = scope === 'row' ? 'height' : 'width';
    const refreshDirection = () => {
        for (const button of body.querySelectorAll('[data-table-dimension]')) {
            button.setAttribute('aria-pressed', String(button.dataset.tableDimension === dimension));
        }
        body.querySelector('[data-table-ratio]').setAttribute('aria-label', '按比例调整' + captionFor(dimension));
    };
    const refreshSizes = (preset, reference = dimension) => {
        const {width, height, mixedWidth, mixedHeight} = actions.sizes();
        body.querySelector('[data-table-size=width]').value = mixedWidth ? '' : width;
        body.querySelector('[data-table-size=height]').value = mixedHeight ? '' : height;
        const outline = body.querySelector('.clab-table-size-outline');
        outline.style.width = `${Math.min(176, 84 * width / height)}px`;
        outline.style.aspectRatio = `${width} / ${height}`;
        const slider = body.querySelector('[data-table-ratio]');
        slider.value = preset ?? tableRatioPosition(width, height, reference);
        const at = tableRatioPreset(width, height, reference);
        const label = at >= 0 ? tableRatios[at].join(':') : ratioLabel(width, height);
        slider.setAttribute('aria-valuetext', label);
        slider.title = label;
        body.querySelector('[data-table-ratio-label]').textContent = label;
    };
    const refreshAppearance = () => {
        const {padding, alignment} = actions.appearance();
        const field = body.querySelector('[data-table-padding]');
        field.placeholder = padding ? '上, 下, 左, 右' : '混合';
        field.value = field.defaultValue = padding ? Object.values(padding).join(', ') : '';
        for (const button of body.querySelectorAll('[data-table-align]')) button.setAttribute('aria-pressed', String(Number(button.dataset.tableAlign) === alignment));
    };

    const applyRatio = (at, defer) => {
        const {width, height} = actions.sizes();
        actions.resize(dimension, tablePresetSize(dimension, at, width, height), defer);
        refreshSizes(defer ? at : undefined);
    };
    let drag;
    const moveRatio = event => {
        const {slider} = drag;
        const {left, width} = slider.getBoundingClientRect();
        const fraction = Math.max(0, Math.min(1, (event.clientX - left - 5) / Math.max(1, width - 10)));
        const at = Math.round(fraction * (tableRatios.length - 1));
        if (at === drag.at) return;
        drag.at = at;
        applyRatio(at, true);
    };
    popup.addEventListener('pointerdown', event => {
        const slider = event.target.closest('[data-table-ratio]');
        if (!slider || event.button !== 0 || drag) return;
        event.preventDefault();
        slider.focus({preventScroll:true});
        slider.setPointerCapture(event.pointerId);
        drag = {slider, pointerId:event.pointerId, at:null};
        moveRatio(event);
    });
    popup.addEventListener('pointermove', event => {
        if (drag?.pointerId === event.pointerId) moveRatio(event);
    });
    const finishRatio = event => {
        if (drag?.pointerId !== event.pointerId) return;
        if (event.type === 'pointerup') moveRatio(event);
        const {at} = drag;
        drag = null;
        applyRatio(at, false);
    };
    for (const event of ['pointerup', 'pointercancel', 'lostpointercapture']) popup.addEventListener(event, finishRatio);
    popup.addEventListener('input', event => {
        if (event.target.matches('[data-table-ratio]')) applyRatio(Math.round(Number(event.target.value)), true);
    });
    const submitPadding = input => {
        const error = body.querySelector('[data-table-settings-error]');
        try {
            actions.setAppearance('padding', parseTablePadding(input.value));
            error.textContent = '';
            refreshAppearance();
        } catch (err) { error.textContent = err.message; }
    };
    popup.addEventListener('change', event => {
        const input = event.target;
        if (input.matches('[data-table-ratio]')) applyRatio(Math.round(Number(input.value)), false);
        if (input.matches('[data-table-size]')) {
            actions.resize(input.dataset.tableSize, input.value);
            refreshSizes(undefined, input.dataset.tableSize);
        }
        if (input.matches('[data-table-padding]')) submitPadding(input);
    });
    popup.addEventListener('keydown', event => {
        const input = event.target;
        if (event.key === 'Enter' && input.matches('[data-table-title],[data-table-padding],[data-table-size]')) {
            event.preventDefault();
            if (input.matches('[data-table-padding]') && input.value && input.value === input.defaultValue) submitPadding(input);
            input.blur();
        }
        if (!input.matches('[data-table-ratio]')) return;
        const at = Number(input.value), last = tableRatios.length - 1;
        const next = {ArrowLeft:Math.ceil(at) - 1, ArrowDown:Math.ceil(at) - 1, ArrowRight:Math.floor(at) + 1, ArrowUp:Math.floor(at) + 1, Home:0, End:last}[event.key];
        if (next === undefined) return;
        event.preventDefault();
        applyRatio(Math.max(0, Math.min(last, next)), false);
    });
    popup.addEventListener('click', event => {
        const align = event.target.closest('[data-table-align]');
        const edge = event.target.closest('[data-table-dimension]');
        if (edge) {
            dimension = edge.dataset.tableDimension;
            refreshDirection();
        } else if (align || event.target.closest('[data-table-layout-reset]')) {
            if (align) actions.setAppearance('alignment', Number(align.dataset.tableAlign));
            else { actions.reset(); refreshSizes(); }
            body.querySelector('[data-table-settings-error]').textContent = '';
            refreshAppearance();
        }
    });
    refreshSizes();
    refreshDirection();
    refreshAppearance();
    panel.position();
    return panel;
}
