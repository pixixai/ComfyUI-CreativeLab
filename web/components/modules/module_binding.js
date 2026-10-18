import { app } from "../../../../scripts/app.js";
import { state, appState } from "../ui_state.js";
import { getWidgetDef } from "../ui_utils.js";
import { resolveBindingTargets } from "../actions/action_binding.js";
import { updateSelectionUI } from "../ui_selection.js";

let openPanel = null;
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function getBindings(area) {
    if (area.type === 'preview') return { ids: area.targetNodeId == null || area.targetNodeId === '' ? [] : [String(area.targetNodeId)], widgets: [] };
    const widgets = Array.isArray(area.targetWidgets) ? [...area.targetWidgets]
        : area.targetNodeId && area.targetWidget ? [`${area.targetNodeId}||${area.targetWidget}`] : [];
    const ids = Array.isArray(area.targetNodeIds) ? area.targetNodeIds.map(String)
        : area.targetNodeId ? [String(area.targetNodeId)] : [];
    return { ids: [...new Set([...ids, ...widgets.map(w => w.split('||')[0])])], widgets: [...new Set(widgets)] };
}

function bindingSummary(area) {
    const { ids, widgets } = getBindings(area);
    if (area.type === 'preview') {
        const node = ids.length ? app.graph?.getNodeById(ids[0]) : null;
        const title = ids.length ? `[${ids[0]}] ${node ? node.title || node.type : '节点已失效'}` : '未绑定输出节点';
        return { label: ids.length ? `[${ids[0]}]` : '未绑定', title: `${title}\n左键：输出绑定；模块任意位置中键（按下滚轮）：拾取节点` };
    }
    const label = ids.length === 0 ? '未绑定' : `${ids.length} 节点 · ${widgets.length} 参数`;
    const title = ids.map(id => {
        const node = app.graph?.getNodeById(id);
        const names = widgets.filter(w => w.startsWith(`${id}||`)).map(w => w.split('||')[1]);
        return `[${id}] ${node ? node.title || node.type : '节点已失效'}: ${names.join(', ') || '未绑定参数'}`;
    }).join('\n') || '管理节点和绑定参数';
    return { label, title: `${title}\n左键：绑定设置；模块任意位置中键（按下滚轮）：拾取节点或参数` };
}

export function generateModuleBindingHTML(area) {
    const { label, title } = bindingSummary(area);
    return `<div class="clab-module-binding${area.type === 'preview' ? ' clab-output-binding' : ''}">
        <button type="button" class="clab-module-binding-summary" title="${escapeHTML(title)}" aria-label="${area.type === 'preview' ? '管理输出绑定' : '管理节点和绑定参数'}" aria-haspopup="dialog" aria-expanded="false">
            <span class="clab-module-binding-label">${escapeHTML(label)}</span><span aria-hidden="true">▾</span>
        </button>
    </div>`;
}

export function refreshModuleBindingSummary(areaEl, area) {
    const button = areaEl.querySelector('.clab-module-binding-summary');
    if (!button) return;
    const summary = bindingSummary(area);
    button.querySelector('.clab-module-binding-label').textContent = summary.label;
    button.title = summary.title;
}

function setBindings(area, ids, widgets) {
    if (area.type === 'preview') { area.targetNodeId = ids[0] || null; return; }
    const previous = getBindings(area).widgets[0];
    area.targetNodeIds = [...new Set(ids)];
    area.targetWidgets = [...new Set(widgets)];
    const first = area.targetWidgets[0];
    const [nodeId, widgetName] = first ? first.split('||') : [];
    area.targetNodeId = nodeId || area.targetNodeIds[0] || null;
    area.targetWidget = widgetName || null;
    if (!first || first === previous) return;
    const widget = getWidgetDef(nodeId, widgetName);
    if (!widget) return;
    const isBoolean = widget.type === 'toggle' || typeof widget.value === 'boolean';
    const isCombo = Array.isArray(widget.type) || widget.type === 'combo' || Array.isArray(widget.options?.values);
    if (isBoolean || isCombo || area.value === undefined || area.value === null || area.value === '') area.value = widget.value;
    area.dataType = isBoolean ? 'boolean' : typeof widget.value === 'number' ? 'number' : 'string';
}

function selectModule(areaEl) {
    if (!state.selectedAreaIds.includes(areaEl.dataset.areaId)) state.selectedAreaIds = [areaEl.dataset.areaId];
    state.selectedCardIds = [];
    state.activeCardId = areaEl.dataset.cardId;
    appState.lastClickedAreaId = areaEl.dataset.areaId;
    updateSelectionUI();
}

function startModulePick(areaEl, restorePanel = false) {
    if (appState.isBindingMode) return;
    const area = state.cards.find(c => c.id === areaEl.dataset.cardId)?.areas?.find(a => a.id === areaEl.dataset.areaId);
    if (!area) return;
    if (restorePanel) {
        const { areaId, cardId } = areaEl.dataset;
        document.addEventListener('clab_binding_finished', () => requestAnimationFrame(() => {
            const currentArea = [...document.querySelectorAll('.clab-area')]
                .find(el => el.dataset.areaId === areaId && el.dataset.cardId === cardId);
            if (currentArea && document.getElementById('clab-panel')?.classList.contains('visible')) showBindingPanel(currentArea);
        }), { once: true });
    }
    openPanel?.close();
    selectModule(areaEl);
    document.dispatchEvent(new CustomEvent('clab_enter_binding_mode', { detail: area.type }));
}

function showBindingPanel(areaEl) {
    const areaId = areaEl.dataset.areaId;
    if (openPanel?.areaId === areaId) { openPanel.close(); return; }
    openPanel?.close();
    const area = state.cards.flatMap(c => c.areas || []).find(a => a.id === areaId);
    if (!area) return;
    const isOutput = area.type === 'preview';
    selectModule(areaEl);
    const selectedAreas = state.cards.flatMap(c => c.areas || [])
        .filter(a => a.type === area.type && state.selectedAreaIds.includes(a.id));
    const panelBindings = () => {
        const bindings = selectedAreas.map(getBindings);
        return { ids: [...new Set(bindings.flatMap(b => b.ids))], widgets: [...new Set(bindings.flatMap(b => b.widgets))] };
    };
    const trigger = areaEl.querySelector('.clab-module-binding-summary');
    const popup = document.createElement('div');
    popup.className = `clab-module-binding-popover${isOutput ? ' clab-output-binding-popover' : ''}`;
    popup.setAttribute('popover', 'auto');
    popup.setAttribute('role', 'dialog');
    popup.setAttribute('aria-label', isOutput ? '管理输出绑定' : '管理节点和绑定参数');
    popup.innerHTML = `<div class="clab-binding-panel-head"><span>${isOutput ? '输出绑定' : '绑定设置'}</span><button type="button" class="clab-binding-start-pick" title="拾取节点或参数">
        <svg width="12" height="12" viewBox="0 0 9.11 9.11" fill="currentColor" aria-hidden="true"><path d="M.37.02C.24-.04.08.03.02.17,0,.23,0,.31.02.37l1.62,3.94,1.87,4.54c.09.21.33.31.54.23.1-.04.18-.12.22-.21l1.41-3.13s.03-.04.05-.05l3.13-1.41c.21-.09.3-.34.21-.55-.04-.1-.12-.17-.22-.21L.37.02h0Z"/></svg>拾取节点</button></div>
        <div class="clab-binding-columns"><section class="clab-binding-nodes"><input type="search" class="clab-binding-search" placeholder="搜索节点 ID / 名称" aria-label="搜索节点"><div class="clab-binding-node-list"></div></section>
        ${isOutput ? '' : '<section class="clab-binding-params" aria-label="节点参数"></section>'}</div>
        <div class="clab-binding-panel-foot">点击节点行联动高亮 · 勾选绑定或解绑</div>`;
    document.body.appendChild(popup);
    const nodeList = popup.querySelector('.clab-binding-node-list');
    const paramList = popup.querySelector('.clab-binding-params');
    const search = popup.querySelector('.clab-binding-search');
    popup.querySelector('.clab-binding-panel-foot').textContent = selectedAreas.length > 1
        ? `应用到 ${selectedAreas.length} 个已选输入模块 · 勾选绑定或解绑`
        : '点击节点行联动高亮 · 勾选绑定或解绑';
    let focusedId = getBindings(area).ids[0] || String(app.graph?._nodes[0]?.id ?? '');
    let frame = 0;
    const controller = new AbortController();
    const close = () => {
        controller.abort();
        observer.disconnect();
        cancelAnimationFrame(frame);
        trigger.setAttribute('aria-expanded', 'false');
        popup.remove();
        if (openPanel?.element === popup) openPanel = null;
    };
    const pickButton = popup.querySelector('.clab-binding-start-pick');
    const shortcut = window._clabPickShortcutRaw ?? 'P';
    pickButton.title = `拾取节点${isOutput ? '' : '或参数'}${shortcut ? `（快捷键：${shortcut}）` : ''}；也可在模块任意位置中键单击`;
    pickButton.onclick = () => startModulePick(areaEl, true);
    const position = () => {
        if (!trigger.isConnected) { close(); return; }
        const rect = trigger.getBoundingClientRect(), bounds = popup.getBoundingClientRect();
        const width = document.documentElement.clientWidth, height = document.documentElement.clientHeight;
        popup.style.left = `${Math.max(8, Math.min(rect.right - bounds.width, width - bounds.width - 8))}px`;
        const top = rect.bottom + bounds.height + 4 <= height - 8 ? rect.bottom + 4 : rect.top - bounds.height - 4;
        popup.style.top = `${Math.max(8, Math.min(top, height - bounds.height - 8))}px`;
    };
    const schedulePosition = () => {
        if (!frame) frame = requestAnimationFrame(() => { frame = 0; position(); });
    };
    const renderNodes = () => {
        const scrollTop = nodeList.scrollTop;
        const { ids } = panelBindings();
        const bindings = selectedAreas.map(getBindings);
        const nodes = [...(app.graph?._nodes || [])];
        for (const id of ids) if (!nodes.some(n => String(n.id) === id)) nodes.push({ id, title: '节点已失效', widgets: [] });
        if (!isOutput) nodes.sort((a, b) => Number(ids.includes(String(b.id))) - Number(ids.includes(String(a.id))));
        const query = search.value.trim().toLowerCase();
        if (isOutput) {
            const mixed = new Set(selectedAreas.map(a => String(a.targetNodeId ?? ''))).size > 1;
            popup.querySelector('.clab-binding-panel-foot').textContent = selectedAreas.length > 1
                ? `应用到 ${selectedAreas.length} 个已选输出模块 · ${mixed ? '当前绑定不同 · ' : ''}再次点击已选节点取消`
                : '单选节点绑定 · 再次点击已选节点取消';
            nodeList.innerHTML = nodes.filter(n => `${n.id} ${n.title || n.type}`.toLowerCase().includes(query)).map(n => {
                const id = String(n.id);
                const checked = selectedAreas.every(a => String(a.targetNodeId ?? '') === id);
                return `<div class="clab-binding-node-row ${checked ? 'is-current' : ''}">
                    <input type="radio" name="clab-output-node" data-node="${escapeHTML(id)}" ${checked ? 'checked' : ''} aria-label="${checked ? '取消绑定节点' : '绑定节点'} ${escapeHTML(id)}">
                    <button type="button" data-focus-node="${escapeHTML(id)}" aria-pressed="${checked}" title="${escapeHTML(`[${id}] ${n.title || n.type}`)}"><span>[${escapeHTML(id)}]</span><span>${escapeHTML(n.title || n.type)}</span></button></div>`;
            }).join('') || '<div class="clab-binding-empty">没有匹配节点</div>';
            nodeList.scrollTop = scrollTop;
            return;
        }
        nodeList.innerHTML = nodes.filter(n => `${n.id} ${n.title || n.type}`.toLowerCase().includes(query)).map(n => {
            const id = String(n.id);
            const targets = resolveBindingTargets(n);
            const matches = bindings.flatMap(b => targets.map(t => b.ids.includes(t.nodeIdStr)));
            const checked = matches.every(Boolean), mixed = !checked && matches.some(Boolean);
            return `<div class="clab-binding-node-row ${id === focusedId ? 'is-current' : ''}">
                <input type="checkbox" data-node="${escapeHTML(id)}" ${checked ? 'checked' : ''} ${mixed ? 'data-mixed="true"' : ''} aria-label="绑定节点 ${escapeHTML(id)}">
                <button type="button" data-focus-node="${escapeHTML(id)}" aria-pressed="${id === focusedId}" title="[${escapeHTML(id)}] ${escapeHTML(n.title || n.type)}"><span>[${escapeHTML(id)}]</span><span>${escapeHTML(n.title || n.type)}</span></button></div>`;
        }).join('') || '<div class="clab-binding-empty">没有匹配节点</div>';
        nodeList.querySelectorAll('[data-mixed]').forEach(input => input.indeterminate = true);
        nodeList.scrollTop = scrollTop;
    };
    const renderParams = () => {
        if (isOutput) return;
        const scrollTop = paramList.scrollTop;
        const { ids, widgets } = panelBindings();
        const bindings = selectedAreas.map(getBindings);
        const shownIds = [...new Set([...ids, focusedId].filter(Boolean))];
        paramList.innerHTML = shownIds.map(id => {
            const node = app.graph?.getNodeById(id);
            const names = [...new Set([...(node?.widgets || []).filter(w => w.type !== 'button').map(w => w.name),
                ...widgets.filter(w => w.startsWith(`${id}||`)).map(w => w.split('||')[1])])];
            return `<div class="clab-binding-param-group ${id === focusedId ? 'is-current' : ''}" data-param-node="${escapeHTML(id)}">
                <div class="clab-binding-group-title" title="${escapeHTML(node?.title || node?.type || '节点已失效')}"><span>[${escapeHTML(id)}] ${escapeHTML(node?.title || node?.type || '节点已失效')}</span>${id === focusedId ? '<span>当前</span>' : ''}</div>
                ${names.map(name => {
                    const key = `${id}||${name}`;
                    const targets = resolveBindingTargets(node || { id }, name);
                    const matches = bindings.flatMap(b => targets.map(t => b.widgets.includes(`${t.nodeIdStr}||${t.widgetName}`)));
                    const checked = matches.every(Boolean), mixed = !checked && matches.some(Boolean);
                    return `<label class="clab-binding-param" title="${escapeHTML(name)}"><input type="checkbox" data-widget="${escapeHTML(key)}" ${checked ? 'checked' : ''} ${mixed ? 'data-mixed="true"' : ''}><span>${escapeHTML(name)}</span></label>`;
                }).join('') || '<div class="clab-binding-empty">没有可绑定参数</div>'}</div>`;
        }).join('') || '<div class="clab-binding-empty">选择节点查看参数</div>';
        paramList.querySelectorAll('[data-mixed]').forEach(input => input.indeterminate = true);
        paramList.scrollTop = scrollTop;
    };
    const refresh = () => { renderNodes(); renderParams(); schedulePosition(); };
    const apply = (targets, checked, removeNode) => {
        for (const selected of selectedAreas) {
            if (isOutput) {
                setBindings(selected, targets.map(t => t.nodeIdStr), []);
                const selectedEl = document.querySelector(`.clab-area[data-area-id="${selected.id}"]`);
                if (selectedEl) {
                    refreshModuleBindingSummary(selectedEl, selected);
                    const placeholder = selectedEl.querySelector('.clab-preview-placeholder');
                    if (placeholder) placeholder.textContent = selected.targetNodeId ? `等待节点 [${selected.targetNodeId}] 输出...` : '未关联节点';
                }
                continue;
            }
            let { ids, widgets } = getBindings(selected);
            for (const target of targets) {
                const key = `${target.nodeIdStr}||${target.widgetName}`;
                if (checked) {
                    ids.push(target.nodeIdStr);
                    if (target.widgetName) widgets.push(key);
                } else if (removeNode) {
                    ids = ids.filter(id => id !== target.nodeIdStr);
                    widgets = widgets.filter(w => !w.startsWith(`${target.nodeIdStr}||`));
                } else widgets = widgets.filter(w => w !== key);
            }
            setBindings(selected, ids, widgets);
            window._clabRefreshAreaForContext(selected.id);
        }
        updateSelectionUI();
        refresh();
    };
    const bindOutputNode = id => {
        const focusInput = document.activeElement?.matches('input[data-node]');
        const node = app.graph?.getNodeById(id);
        const selected = selectedAreas.every(a => String(a.targetNodeId ?? '') === id);
        const targets = selected ? [] : resolveBindingTargets(node || { id }).slice(0, 1);
        apply(targets, true, false);
        const selectedId = targets[0]?.nodeIdStr || id;
        for (const next of popup.querySelectorAll(focusInput ? 'input[data-node]' : '[data-focus-node]')) {
            if ((focusInput ? next.dataset.node : next.dataset.focusNode) === selectedId) next.focus({ preventScroll: true });
        }
    };
    for (const type of ['pointerdown', 'mousedown', 'mouseup', 'click', 'contextmenu', 'dragstart']) popup.addEventListener(type, e => e.stopPropagation());
    popup.addEventListener('keydown', e => {
        e.stopPropagation();
        if (isOutput && e.key === ' ' && e.target.matches('input[data-node]')) {
            e.preventDefault();
            if (!e.repeat) bindOutputNode(e.target.dataset.node);
        }
        if (e.key === 'Escape') { e.preventDefault(); close(); trigger.focus({ preventScroll: true }); }
    });
    popup.addEventListener('click', e => {
        const button = e.target.closest('[data-focus-node]');
        const input = e.target.closest('input[data-node]');
        if (isOutput && (button || input)) {
            e.preventDefault();
            bindOutputNode(button ? button.dataset.focusNode : input.dataset.node);
            return;
        }
        if (!button) return;
        focusedId = button.dataset.focusNode;
        refresh();
        for (const row of nodeList.querySelectorAll('[data-focus-node]')) if (row.dataset.focusNode === focusedId) row.focus({ preventScroll: true });
        for (const group of paramList.children) if (group.dataset.paramNode === focusedId) group.scrollIntoView({ block: 'nearest' });
    });
    popup.addEventListener('change', e => {
        const input = e.target;
        if (isOutput) {
            if (input.dataset.node !== undefined) bindOutputNode(input.dataset.node);
            return;
        }
        let targets;
        if (input.dataset.node !== undefined) {
            focusedId = input.dataset.node;
            const node = app.graph?.getNodeById(focusedId) || { id: focusedId };
            targets = resolveBindingTargets(node);
        } else if (input.dataset.widget !== undefined) {
            const key = input.dataset.widget;
            focusedId = key.split('||')[0];
            const node = app.graph?.getNodeById(focusedId) || { id: focusedId };
            targets = resolveBindingTargets(node, key.split('||')[1]);
        } else return;
        apply(targets, input.checked, input.dataset.node !== undefined);
        const attribute = input.dataset.node !== undefined ? 'node' : 'widget';
        for (const next of popup.querySelectorAll(`input[data-${attribute}]`)) if (next.dataset[attribute] === input.dataset[attribute]) next.focus({ preventScroll: true });
    });
    search.addEventListener('input', () => { nodeList.scrollTop = 0; renderNodes(); });
    popup.addEventListener('toggle', e => { if (e.newState === 'closed') close(); });
    document.addEventListener('clab_render_ui', close, { signal: controller.signal });
    document.addEventListener('clab_enter_binding_mode', close, { signal: controller.signal });
    window.addEventListener('resize', schedulePosition, { signal: controller.signal });
    window.addEventListener('scroll', schedulePosition, { signal: controller.signal, capture: true });
    const observer = new ResizeObserver(schedulePosition);
    observer.observe(popup);
    openPanel = { areaId, element: popup, close };
    refresh();
    popup.showPopover({ source: trigger });
    trigger.setAttribute('aria-expanded', 'true');
    position();
    search.focus({ preventScroll: true });
    if (isOutput) {
        const current = [...nodeList.querySelectorAll('input[data-node]')]
            .find(input => input.dataset.node === String(area.targetNodeId ?? ''));
        const row = current?.closest('.clab-binding-node-row');
        if (row) nodeList.scrollTop += row.getBoundingClientRect().top - nodeList.getBoundingClientRect().top
            - (nodeList.clientHeight - row.offsetHeight) / 2;
    }
}

export function attachModulePickEvents(container) {
    container.querySelectorAll('.clab-area').forEach(areaEl => {
        if (areaEl.dataset.clabPickBound) return;
        areaEl.dataset.clabPickBound = '1';
        for (const type of ['pointerdown', 'pointerup', 'mousedown', 'mouseup']) areaEl.addEventListener(type, e => {
            if (e.button !== 1) return;
            e.preventDefault();
            e.stopPropagation();
        }, true);
        areaEl.addEventListener('auxclick', e => {
            if (e.button !== 1) return;
            e.preventDefault();
            e.stopPropagation();
            startModulePick(areaEl);
        }, true);
    });
}

export function attachModuleBindingEvents(container) {
    container.querySelectorAll('.clab-module-binding').forEach(controls => {
        controls.onpointerdown = controls.onmousedown = controls.onmouseup = e => e.stopPropagation();
        controls.ondragstart = e => { e.preventDefault(); e.stopPropagation(); };
        const summary = controls.querySelector('.clab-module-binding-summary');
        summary.onclick = e => {
            e.stopPropagation();
            showBindingPanel(controls.closest('.clab-area'));
        };
    });
}
