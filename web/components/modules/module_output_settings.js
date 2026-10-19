import { state, appState } from "../ui_state.js";
import { getRatioCSS } from "../ui_utils.js";
import { updateSelectionUI } from "../ui_selection.js";
import { generateModuleBindingHTML } from "./module_binding.js";
import { getAreaResultType } from "./media_types/media_utils.js";

export const outputSettingsIcon = `<svg width="14" height="14" viewBox="0 0 1024 1024" fill="currentColor" aria-hidden="true"><path d="M919.6 405.6l-57.2-8c-12.7-1.8-23-10.4-28-22.1-11.3-26.7-25.7-51.7-42.9-74.5-7.7-10.2-10-23.5-5.2-35.3l21.7-53.5c6.7-16.4 0.2-35.3-15.2-44.1L669.1 96.6c-15.4-8.9-34.9-5.1-45.8 8.9l-35.4 45.3c-7.9 10.2-20.7 14.9-33.5 13.3-14-1.8-28.3-2.8-42.8-2.8-14.5 0-28.8 1-42.8 2.8-12.8 1.6-25.6-3.1-33.5-13.3l-35.4-45.3c-10.9-14-30.4-17.8-45.8-8.9L230.4 168c-15.4 8.9-21.8 27.7-15.2 44.1l21.7 53.5c4.8 11.9 2.5 25.1-5.2 35.3-17.2 22.8-31.7 47.8-42.9 74.5-5 11.8-15.3 20.4-28 22.1l-57.2 8C86 408 72.9 423 72.9 440.8v142.9c0 17.7 13.1 32.7 30.6 35.2l57.2 8c12.7 1.8 23 10.4 28 22.1 11.3 26.7 25.7 51.7 42.9 74.5 7.7 10.2 10 23.5 5.2 35.3l-21.7 53.5c-6.7 16.4-0.2 35.3 15.2 44.1L354 927.8c15.4 8.9 34.9 5.1 45.8-8.9l35.4-45.3c7.9-10.2 20.7-14.9 33.5-13.3 14 1.8 28.3 2.8 42.8 2.8 14.5 0 28.8-1 42.8-2.8 12.8-1.6 25.6 3.1 33.5 13.3l35.4 45.3c10.9 14 30.4 17.8 45.8 8.9l123.7-71.4c15.4-8.9 21.8-27.7 15.2-44.1l-21.7-53.5c-4.8-11.8-2.5-25.1 5.2-35.3 17.2-22.8 31.7-47.8 42.9-74.5 5-11.8 15.3-20.4 28-22.1l57.2-8c17.6-2.5 30.6-17.5 30.6-35.2V440.8c0.2-17.8-12.9-32.8-30.5-35.2z m-408 245.5c-76.7 0-138.9-62.2-138.9-138.9s62.2-138.9 138.9-138.9 138.9 62.2 138.9 138.9-62.2 138.9-138.9 138.9z"/></svg>`;

const ratios = ['21:9', '16:9', '3:2', '4:3', '1:1', '3:4', '2:3', '9:16', '9:21', '自定义比例'];
const fillModes = ['显示全部', '填充', '拉伸'];
let openPanel = null;

function dimensions(area) {
    const preset = ratios.includes(area.ratio) && area.ratio !== '自定义比例' ? area.ratio.split(':').map(Number) : [16, 9];
    return [area.width, area.height].map((value, i) => Number.isFinite(Number(value)) && Number(value) > 0 ? Number(value) : preset[i]);
}

function settings(area) {
    return { matchMedia: !!area.matchMedia, ratio: area.matchMedia ? '自定义比例' : ratios.includes(area.ratio) ? area.ratio : '16:9',
        width: dimensions(area)[0], height: dimensions(area)[1], fillMode: fillModes.includes(area.fillMode) ? area.fillMode : '显示全部' };
}

export function getOutputSettingsLabel(areas) {
    if (!areas.length) return '尺寸与显示';
    const values = areas.map(settings);
    const key = value => JSON.stringify([value.matchMedia, value.fillMode, ...(value.matchMedia ? [] : [value.ratio, ...(value.ratio === '自定义比例' ? [value.width, value.height] : [])])]);
    if (values.some(value => key(value) !== key(values[0]))) return '多种设置';
    const first = values[0];
    return first.matchMedia ? '媒体比例' : first.ratio === '自定义比例' ? `${first.width} × ${first.height}` : first.ratio;
}

export function generateOutputControlsHTML(area) {
    return `<div class="clab-output-controls">
        ${!area.missingHistoryRun && getAreaResultType(area) === 'text' ? `<button type="button" class="clab-text-copy-btn" data-area="${area.id}" title="复制全文" aria-label="复制全文"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4"/></svg></button>` : ''}
        <button type="button" class="clab-output-settings-trigger" title="尺寸与显示" aria-label="尺寸与显示" aria-haspopup="dialog" aria-expanded="false" aria-controls="clab-output-settings-popover">
            ${outputSettingsIcon}
        </button>${generateModuleBindingHTML(area)}</div>`;
}

function selectedOutputs() {
    return state.cards.flatMap(card => card.areas || []).filter(area => area.type === 'preview' && state.selectedAreaIds.includes(area.id));
}

function updateAppearance(area) {
    const areaEl = [...document.querySelectorAll('.clab-area')].find(el => el.dataset.areaId === area.id);
    if (!areaEl) return;
    const bg = areaEl.querySelector('.clab-preview-bg');
    const media = areaEl.querySelector('.clab-media-target');
    if (area.matchMedia && media) {
        const width = media.videoWidth || media.naturalWidth;
        const height = media.videoHeight || media.naturalHeight;
        if (width && height) { area.width = width; area.height = height; }
    }
    if (bg && !bg.classList.contains('clab-preview-bg-text')) {
        bg.style.aspectRatio = bg.classList.contains('clab-preview-bg-model') || bg.classList.contains('clab-preview-bg-audio') && area.matchMedia ? 'auto'
            : area.matchMedia && area.width && area.height ? `${area.width} / ${area.height}`
            : getRatioCSS(area).replace('aspect-ratio:', '').replace(';', '').trim();
    }
    if (media) media.style.objectFit = area.fillMode === '填充' ? 'cover' : area.fillMode === '拉伸' ? 'fill' : 'contain';
}

function showOutputSettings(trigger, areaEl) {
    if (openPanel?.trigger === trigger) { openPanel.close(); return; }
    openPanel?.close();
    if (areaEl) {
        const { areaId, cardId } = areaEl.dataset;
        if (!state.selectedAreaIds.includes(areaId)) state.selectedAreaIds = [areaId];
        state.selectedCardIds = [];
        state.activeCardId = cardId;
        appState.lastClickedAreaId = areaId;
        updateSelectionUI();
    }
    const areas = selectedOutputs();
    if (!areas.length) return;
    const popup = document.createElement('div');
    popup.id = 'clab-output-settings-popover';
    popup.className = 'clab-output-settings-popover';
    popup.setAttribute('popover', 'auto');
    popup.setAttribute('role', 'dialog');
    popup.setAttribute('aria-label', '尺寸与显示');
    popup.innerHTML = `<div class="clab-binding-panel-head">尺寸与显示</div>
        <div class="clab-output-settings-fields">
            <label class="clab-output-match"><input type="checkbox" data-setting="matchMedia">匹配媒体比例</label>
            <label class="clab-output-setting-row">比例<select data-setting="ratio" aria-label="比例">${ratios.map(ratio => `<option>${ratio}</option>`).join('')}</select></label>
            <div class="clab-output-dimensions"><label>宽度<input type="number" min="1" data-setting="width" aria-label="宽度"></label><label>高度<input type="number" min="1" data-setting="height" aria-label="高度"></label></div>
            <label class="clab-output-setting-row">显示方式<select data-setting="fillMode" aria-label="显示方式"><option value="" disabled>多种设置</option>${fillModes.map(mode => `<option>${mode}</option>`).join('')}</select></label>
        </div><div class="clab-binding-panel-foot"></div>`;
    document.body.appendChild(popup);
    const controls = Object.fromEntries([...popup.querySelectorAll('[data-setting]')].map(el => [el.dataset.setting, el]));
    const controller = new AbortController();
    let frame = 0;
    const close = () => {
        controller.abort();
        observer.disconnect();
        cancelAnimationFrame(frame);
        trigger.setAttribute('aria-expanded', 'false');
        popup.remove();
        if (openPanel?.element === popup) openPanel = null;
    };
    const position = () => {
        if (!trigger.isConnected || !trigger.getClientRects().length) { close(); return; }
        const rect = trigger.getBoundingClientRect(), bounds = popup.getBoundingClientRect();
        const width = document.documentElement.clientWidth, height = document.documentElement.clientHeight;
        popup.style.left = `${Math.max(8, Math.min(rect.right - bounds.width, width - bounds.width - 8))}px`;
        const top = rect.bottom + bounds.height + 4 <= height - 8 ? rect.bottom + 4 : rect.top - bounds.height - 4;
        popup.style.top = `${Math.max(8, Math.min(top, height - bounds.height - 8))}px`;
    };
    const schedulePosition = () => {
        if (!frame) frame = requestAnimationFrame(() => { frame = 0; position(); });
    };
    const refresh = () => {
        const values = areas.map(settings);
        const common = key => values.every(value => value[key] === values[0][key]) ? values[0][key] : '';
        controls.matchMedia.checked = values.every(value => value.matchMedia);
        controls.matchMedia.indeterminate = !controls.matchMedia.checked && values.some(value => value.matchMedia);
        for (const key of ['ratio', 'width', 'height', 'fillMode']) {
            controls[key].value = common(key);
            controls[key].disabled = key !== 'fillMode' && values.some(value => value.matchMedia);
            if (key === 'width' || key === 'height') controls[key].placeholder = common(key) === '' ? '多种' : '';
        }
        popup.querySelector('.clab-binding-panel-foot').textContent = areas.length > 1 ? `即时应用到 ${areas.length} 个已选输出模块` : '即时应用到当前输出模块';
        const label = document.querySelector('#tb-output-settings .clab-output-settings-label');
        if (label) label.textContent = getOutputSettingsLabel(selectedOutputs());
        schedulePosition();
    };
    const apply = updater => {
        areas.forEach(area => { updater(area); updateAppearance(area); });
        window._clabJustSave();
        refresh();
    };
    popup.addEventListener('change', e => {
        const key = e.target.dataset.setting;
        if (key === 'matchMedia') apply(area => {
            area.matchMedia = e.target.checked;
            if (area.matchMedia) area.ratio = '自定义比例';
        });
        else if (key === 'fillMode' && fillModes.includes(e.target.value)) apply(area => area.fillMode = e.target.value);
        else if (key === 'ratio' && ratios.includes(e.target.value)) {
            const ratio = e.target.value;
            apply(area => {
                const [width, height] = ratio === '自定义比例' ? dimensions(area) : ratio.split(':').map(Number);
                Object.assign(area, { ratio, width, height });
            });
        } else if (key === 'width' || key === 'height') {
            const value = Number(e.target.value);
            if (!Number.isFinite(value) || value <= 0) { refresh(); return; }
            apply(area => {
                const [width, height] = dimensions(area);
                Object.assign(area, { ratio: '自定义比例', width, height, [key]: value });
            });
        }
    });
    for (const type of ['pointerdown', 'mousedown', 'mouseup', 'click', 'contextmenu', 'dragstart']) popup.addEventListener(type, e => e.stopPropagation());
    popup.addEventListener('keydown', e => {
        e.stopPropagation();
        if (e.key === 'Enter' && e.target.matches('input[type="number"]')) { e.preventDefault(); e.target.blur(); }
        if (e.key === 'Escape') { e.preventDefault(); close(); trigger.focus({ preventScroll: true }); }
    });
    popup.addEventListener('toggle', e => { if (e.newState === 'closed') close(); });
    document.addEventListener('clab_render_ui', close, { signal: controller.signal });
    document.addEventListener('clab_enter_binding_mode', close, { signal: controller.signal });
    window.addEventListener('resize', schedulePosition, { signal: controller.signal });
    window.addEventListener('scroll', schedulePosition, { signal: controller.signal, capture: true });
    const observer = new ResizeObserver(schedulePosition);
    observer.observe(popup);
    observer.observe(trigger);
    openPanel = { trigger, element: popup, close };
    refresh();
    popup.showPopover({ source: trigger });
    trigger.setAttribute('aria-expanded', 'true');
    position();
    controls.matchMedia.focus({ preventScroll: true });
}

export function attachOutputSettingsEvents(container) {
    container.querySelectorAll('.clab-output-settings-trigger, #tb-output-settings').forEach(trigger => {
        trigger.onpointerdown = trigger.onmousedown = trigger.onmouseup = e => e.stopPropagation();
        trigger.ondragstart = e => { e.preventDefault(); e.stopPropagation(); };
        trigger.onclick = e => { e.stopPropagation(); showOutputSettings(trigger, trigger.closest('.clab-area')); };
    });
}
