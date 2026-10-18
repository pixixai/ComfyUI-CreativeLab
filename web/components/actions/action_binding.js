/**
 * 文件名: action_binding.js
 * 职责: 负责“进入绑定模式”后，拦截画布交互，抓取并解析用户点击的目标节点，并完成参数映射
 */
import { app } from "../../../../scripts/app.js";
import { state, appState, saveAndRender } from "../ui_state.js";
import { showBindingToast, hideBindingToast, getWidgetDef } from "../ui_utils.js";

function getBindingTarget(e) {
    const canvas = app.canvas;
    const graph = canvas?.graph;
    if (!graph) return {};

    for (const node of graph._nodes) {
        const widget = node.widgets?.find(w => (w.element || w.inputEl)?.contains(e.target));
        if (widget) return { node, widget };
    }

    const nodeElement = e.target.closest?.('.lg-node[data-node-id]');
    if (nodeElement) {
        const node = graph.getNodeById(nodeElement.dataset.nodeId);
        const row = e.target.closest('.lg-node-widget');
        let widget;
        if (node && row) {
            const names = Array.from(row.querySelectorAll('[aria-label]'), el => el.getAttribute('aria-label'));
            const label = row.querySelector('label, [data-testid="widget-layout-field-label"]');
            if (label) names.push(label.textContent.trim());
            widget = node.widgets?.find(w => names.includes(w.name))
                || node.widgets?.find(w => w.label && names.includes(w.label));
        }
        return { node, widget };
    }

    if (e.target !== canvas.canvas) return {};
    const [x, y] = canvas.convertEventToCanvasOffset(e);
    const node = graph.getNodeOnPos(x, y);
    return { node, widget: node?.flags.collapsed ? undefined : node?.getWidgetOnPos(x, y, true) };
}

export function resolveBindingTargets(node, widgetName = null) {
    const targets = [];
    if (node.type === 'PrimitiveNode') {
        for (const linkId of node.outputs?.[0]?.links || []) {
            const link = app.graph.links[linkId];
            const targetNode = link && app.graph.getNodeById(link.target_id);
            const input = targetNode?.inputs?.[link.target_slot];
            if (input) targets.push({ nodeIdStr: String(targetNode.id), widgetName: input.name });
        }
    }
    return targets.length ? targets : [{ nodeIdStr: String(node.id), widgetName }];
}

export function enterBindingModeForSelected(targetType, panelContainer, backdropContainer) {
    if (!state.selectedAreaIds || state.selectedAreaIds.length === 0) return;
    if (appState.isBindingMode) return;

    appState.isBindingMode = true;
    panelContainer?.querySelectorAll('[popover]:popover-open').forEach(menu => menu.hidePopover());
    if (panelContainer) panelContainer.classList.remove('visible');
    if (backdropContainer) backdropContainer.classList.remove('visible');
    
    showBindingToast(targetType === 'edit'
        ? "🖱️ 点击节点绑定节点，点击参数同时绑定参数 (左键=替换，右键=追加，空白处取消)"
        : "🖱️ 请在工作流中点击节点 (左键=替换，右键=追加，点击空白处取消)...");
    
    if (app.canvas) app.canvas.deselectAllNodes();

    let pickedTarget;
    let finishing = false;
    const shieldEvents = ['mousedown', 'mouseup', 'click', 'dblclick', 'contextmenu'];
    const shieldEvent = (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();
    };
    const onPointerDown = (e) => {
        if (e.button !== 0 && e.button !== 2) return;
        shieldEvent(e);
        if (pickedTarget || finishing) return;
        pickedTarget = { ...getBindingTarget(e), button: e.button, pointerId: e.pointerId };
    };
    const onPointerUp = (e) => {
        if (!pickedTarget || e.pointerId !== pickedTarget.pointerId || e.button !== pickedTarget.button) return;
        shieldEvent(e);
        if (finishing) return;
        finishing = true;

        const isAppend = (pickedTarget.button === 2);
        const { node: targetNode, widget: targetWidget } = pickedTarget;

        setTimeout(() => {
            window.removeEventListener('pointerdown', onPointerDown, true);
            window.removeEventListener('pointerup', onPointerUp, true);
            shieldEvents.forEach(type => window.removeEventListener(type, shieldEvent, true));
            hideBindingToast();
            appState.isBindingMode = false;
            if (panelContainer) panelContainer.classList.add('visible');
            if (backdropContainer) backdropContainer.classList.add('visible');

            if (targetNode) {
                const resolvedTargets = resolveBindingTargets(targetNode,
                    targetWidget && targetWidget.type !== 'button' ? targetWidget.name : null);

                state.selectedAreaIds.forEach(id => {
                    state.cards.forEach(c => {
                        const a = c.areas?.find(x => x.id === id);
                        if (a && a.type === targetType) {
                            if (targetType === 'edit') {
                                
                                let ids = Array.isArray(a.targetNodeIds) ? [...a.targetNodeIds] : (a.targetNodeId ? [String(a.targetNodeId)] : []);
                                let widgets = Array.isArray(a.targetWidgets) ? [...a.targetWidgets] : (a.targetWidget && a.targetNodeId ? [`${a.targetNodeId}||${a.targetWidget}`] : []);
                                
                                if (!isAppend) {
                                    ids = [];
                                    widgets = [];
                                }

                                let firstValidWidgetDef = null;

                                resolvedTargets.forEach(rt => {
                                    if (!ids.includes(rt.nodeIdStr)) {
                                        ids.push(rt.nodeIdStr);
                                    }
                                    if (rt.widgetName) {
                                        const wVal = `${rt.nodeIdStr}||${rt.widgetName}`;
                                        if (!widgets.includes(wVal)) {
                                            widgets.push(wVal);
                                        }
                                        if (!firstValidWidgetDef) {
                                            firstValidWidgetDef = getWidgetDef(rt.nodeIdStr, rt.widgetName);
                                        }
                                    }
                                });

                                a.targetNodeIds = ids;
                                a.targetNodeId = ids.length > 0 ? ids[0] : null;
                                
                                a.targetWidgets = widgets;
                                a.targetWidget = widgets.length > 0 ? widgets[0].split('||')[1] : null;

                                if (firstValidWidgetDef) {
                                    let isManual = true;
                                    if (Array.isArray(firstValidWidgetDef.type) || firstValidWidgetDef.type === "combo" || Array.isArray(firstValidWidgetDef.options?.values)) isManual = false;
                                    if (firstValidWidgetDef.type === "toggle" || typeof firstValidWidgetDef.value === "boolean") isManual = false;
                                    
                                    const hasVal = (a.value !== undefined && a.value !== null && a.value !== '');
                                    
                                    if (!isManual || !hasVal) {
                                        a.value = firstValidWidgetDef.value;
                                    }

                                    if (firstValidWidgetDef.type === "toggle" || typeof firstValidWidgetDef.value === "boolean") {
                                        a.dataType = 'boolean';
                                    } else if (typeof firstValidWidgetDef.value === "number") {
                                        a.dataType = 'number';
                                    } else {
                                        a.dataType = 'string';
                                    }
                                }
                            } else {
                                a.targetNodeId = resolvedTargets[0].nodeIdStr;
                            }
                        }
                    });
                });
                saveAndRender();
            }
            document.dispatchEvent(new CustomEvent('clab_binding_finished'));
        }, 150);
    };
    
    setTimeout(() => {
        window.addEventListener('pointerdown', onPointerDown, true);
        window.addEventListener("pointerup", onPointerUp, true);
        shieldEvents.forEach(type => window.addEventListener(type, shieldEvent, true));
    }, 100);
}
