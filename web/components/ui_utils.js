﻿/**
 * 鏂囦欢鍚? ui_utils.js
 * 鑱岃矗: UI 娓叉煋杈呭姪宸ュ叿銆丆omfyUI 鍥捐氨瑙ｆ瀽銆丆SS 鏍峰紡搴?
 */
import { app } from "../../../scripts/app.js";
import { appState } from "./ui_state.js";

// =========================================================================
// --- DOM 杈呭姪鏋勫缓鏂规硶 ---
// =========================================================================

export function buildCustomSelect(id, width, valueText, itemsHtml, disabled = false, dataAttrs = '') {
    return `
        <div id="${id}" class="clab-custom-select clab-capsule ${disabled ? 'disabled' : ''}" style="width:${width};" ${dataAttrs}>
            <input type="text" class="clab-custom-select-value" title="${valueText}" value="${valueText}" ${disabled ? 'disabled' : ''} autocomplete="off" spellcheck="false" />
            <div class="clab-custom-select-icon">▼</div>
            <div class="clab-custom-select-dropdown">${itemsHtml}</div>
        </div>
    `;
}

export function getRatioCSS(area) {
    if (area.matchMedia || !area.ratio) return 'aspect-ratio: 16/9;';
    if (area.ratio === '自定义比例' && area.width && area.height) {
        return `aspect-ratio: ${area.width} / ${area.height};`;
    }
    const ratios = {
        '21:9': '21/9', '16:9': '16/9', '3:2': '3/2', '4:3': '4/3', '1:1': '1/1',
        '3:4': '3/4', '2:3': '2/3', '9:16': '9/16', '9:21': '9/21'
    };
    if (ratios[area.ratio]) return `aspect-ratio: ${ratios[area.ratio]};`;
    return 'aspect-ratio: 16/9;';
}

export function truncateString(str, maxLength) {
    return (str && str.length > maxLength) ? str.substring(0, maxLength) + '...' : (str || '');
}

// =========================================================================
// --- ComfyUI 搴曞眰鏁版嵁瑙ｆ瀽涓庤彍鍗曟瀯寤?---
// =========================================================================

export function getWidgetDef(nodeId, widgetName) {
    if (!nodeId || !widgetName || !app.graph) return null;
    const node = app.graph.getNodeById(Number(nodeId));
    if (!node || !node.widgets) return null;
    return node.widgets.find(w => w.name === widgetName);
}

export function getCustomNodeMenuHTML(selectedNodeId) {
    const tree = { name: "Root", children: {}, nodes: [] };
    if (app.graph && app.graph._nodes) {
        app.graph._nodes.forEach(node => {
            let groupPath = ["Ungrouped"];
            if (app.graph._groups) {
                for (let g of app.graph._groups) {
                    if (node.pos[0] >= g.pos[0] && node.pos[0] <= g.pos[0] + g.size[0] &&
                        node.pos[1] >= g.pos[1] && node.pos[1] <= g.pos[1] + g.size[1]) {
                        groupPath = (g.title || "未命名组").split(/[/|\\]/).map(s => s.trim()).filter(s => s);
                        break;
                    }
                }
            }

            let currentLevel = tree;
            if (groupPath[0] !== "Ungrouped") {
                groupPath.forEach(part => {
                    if (!currentLevel.children[part]) {
                        currentLevel.children[part] = { name: part, children: {}, nodes: [] };
                    }
                    currentLevel = currentLevel.children[part];
                });
            }
            currentLevel.nodes.push(node);
        });
    }

    function renderTree(nodeTree, depth = 0) {
        let html = '';
        const indent = depth * 12;
        nodeTree.nodes.forEach(n => {
            const isSel = n.id == selectedNodeId;
            html += `<div class="clab-custom-select-item ${isSel ? 'selected' : ''}" data-value="${n.id}" style="padding-left:${indent + 12}px;">[${n.id}] ${n.title || n.type}</div>`;
        });
        for (let childName in nodeTree.children) {
            html += `<div class="clab-custom-select-group-title" style="padding-left:${indent + 8}px;">${childName}</div>`;
            html += renderTree(nodeTree.children[childName], depth + 1);
        }
        return html;
    }

    let finalHtml = `<div class="clab-custom-select-item" data-value="" style="color:#aaa;">(清除关联)</div>`;
    if (tree.nodes.length > 0) {
        finalHtml += `<div class="clab-custom-select-group-title">Ungrouped</div>`;
        finalHtml += renderTree({ nodes: tree.nodes, children: {} }, 0);
    }
    for (let childName in tree.children) {
        finalHtml += `<div class="clab-custom-select-group-title">${childName}</div>`;
        finalHtml += renderTree(tree.children[childName], 1);
    }
    return finalHtml;
}

export function getCustomWidgetMenuHTML(nodeId, selectedWidget) {
    let html = `<div class="clab-custom-select-item" data-value="" style="color:#aaa;">(清除绑定)</div>`;
    if (nodeId && app.graph) {
        const node = app.graph.getNodeById(Number(nodeId));
        if (node && node.widgets) {
            node.widgets.forEach(w => {
                const isSel = w.name === selectedWidget;
                html += `<div class="clab-custom-select-item ${isSel ? 'selected' : ''}" data-value="${w.name}">${w.name}</div>`;
            });
        }
    }
    return html;
}

export function getMultiNodeMenuHTML(selectedIds) {
    if (!app.graph) return '';
    const nodes = app.graph._nodes || [];
    let html = '';

    const groups = {};
    nodes.forEach(n => {
        const cat = n.category || '未分类';
        if (!groups[cat]) groups[cat] = [];
        groups[cat].push(n);
    });

    for (const cat in groups) {
        html += `<div class="clab-custom-select-group-title">${cat}</div>`;
        groups[cat].forEach(n => {
            const isSelected = selectedIds.includes(String(n.id));
            html += `<div class="clab-custom-select-item ${isSelected ? 'selected' : ''}" data-value="${n.id}">[${n.id}] ${n.title || n.type}</div>`;
        });
    }
    return html;
}

export function getMultiWidgetMenuHTML(nodeIds, selectedWidgets) {
    if (!app.graph || !nodeIds || nodeIds.length === 0) return '<div class="clab-custom-select-item" data-value="">请先选择关联节点</div>';

    let html = '';
    nodeIds.forEach(nid => {
        const node = app.graph.getNodeById(Number(nid));
        if (!node) return;

        html += `<div class="clab-custom-select-group-title">[${node.id}] ${node.title || node.type}</div>`;

        let hasWidget = false;
        if (node.widgets && node.widgets.length > 0) {
            node.widgets.forEach(w => {
                if (w.type === 'button') return;
                hasWidget = true;
                const val = `${node.id}||${w.name}`;
                const isSelected = selectedWidgets.includes(val);
                html += `<div class="clab-custom-select-item ${isSelected ? 'selected' : ''}" data-value="${val}">${w.name} <span style="font-size:10px;color:#666;">(${w.type})</span></div>`;
            });
        }
        if (!hasWidget) {
            html += `<div class="clab-custom-select-item disabled" style="color:#666; pointer-events:none;">No available parameters</div>`;
        }
    });
    return html;
}

// =========================================================================
// --- 娌夋蹈寮忔彁绀?Toast ---
// =========================================================================

export function showBindingToast(msg, isError = false) {
    let toast = document.getElementById('clab-binding-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'clab-binding-toast';
        document.body.appendChild(toast);
    }

    const bgColor = isError ? "rgba(244, 67, 54, 0.95)" : "var(--clab-theme-card, rgba(76, 175, 80, 0.95))";

    toast.style.cssText = `
        position: fixed; top: 30px; left: 50%; transform: translateX(-50%);
        background: ${bgColor}; color: white; padding: 15px 30px;
        border-radius: 40px; z-index: 10000; font-size: 16px; font-weight: bold;
        box-shadow: 0 5px 20px rgba(0,0,0,0.6); pointer-events: none;
        backdrop-filter: blur(5px);
    `;
    toast.innerText = msg;
    toast.style.display = 'block';

    if (window._clabToastTimeout) clearTimeout(window._clabToastTimeout);
    window._clabToastTimeout = setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

export function hideBindingToast() {
    const toast = document.getElementById('clab-binding-toast');
    if (toast) toast.style.display = 'none';
}

// =========================================================================
// --- 閫氱敤浜や簰缁戝畾 ---
// =========================================================================

export function bindComboSelectEvents(container, stateObj, saveAndRenderCallback) {
    container.querySelectorAll('.clab-custom-select[data-type="module-combo"]').forEach(el => {
        if (el.dataset.clabComboBound === "1") return;
        el.dataset.clabComboBound = "1";
        if (el.classList.contains('disabled')) return;
        const input = el.querySelector('.clab-custom-select-value');
        const items = el.querySelectorAll('.clab-custom-select-item');

        el.addEventListener('mousedown', e => e.stopPropagation());

        const openDropdown = (e) => {
            e.stopPropagation();
            document.querySelectorAll('.clab-custom-select.open').forEach(other => {
                if (other !== el) {
                    other.classList.remove('open');
                    const dp = other.querySelector('.clab-custom-select-dropdown');
                    if (dp) { dp.style.top = ''; dp.style.bottom = ''; dp.style.transform = ''; }
                    const otherArea = other.closest('.clab-area');
                    if (otherArea) otherArea.style.zIndex = '';
                }
            });
            el.classList.add('open');

            const currentArea = el.closest('.clab-area');
            if (currentArea) currentArea.style.zIndex = '9999';

            const dropdown = el.querySelector('.clab-custom-select-dropdown');
            if (dropdown) {
                dropdown.style.top = '';
                dropdown.style.bottom = '';
                dropdown.style.transform = '';
                const dropdownRect = dropdown.getBoundingClientRect();
                const cardBody = el.closest('.clab-card-body');
                let overflowOffset = 0;
                if (cardBody) {
                    const cardRect = cardBody.getBoundingClientRect();
                    const diff = dropdownRect.bottom - (cardRect.bottom - 10);
                    if (diff > 0) overflowOffset = diff;
                } else {
                    const diff = dropdownRect.bottom - (window.innerHeight - 10);
                    if (diff > 0) overflowOffset = diff;
                }
                if (overflowOffset > 0) dropdown.style.transform = `translateY(-${overflowOffset}px)`;
            }
        };

        el.addEventListener('click', openDropdown);
        input.addEventListener('click', (e) => { openDropdown(e); input.select(); });

        input.addEventListener('input', (e) => {
            const keyword = e.target.value.toLowerCase().trim();
            el.classList.add('open');
            const groupTitles = el.querySelectorAll('.clab-custom-select-group-title');
            if (keyword !== '') groupTitles.forEach(title => title.style.display = 'none');
            else groupTitles.forEach(title => title.style.display = 'flex');
            items.forEach(item => {
                const text = item.textContent.toLowerCase();
                item.style.display = text.includes(keyword) ? 'block' : 'none';
            });
        });

        input.addEventListener('blur', () => {
            setTimeout(() => {
                el.classList.remove('open');
                const currentArea = el.closest('.clab-area');
                if (currentArea) currentArea.style.zIndex = '';
                const dp = el.querySelector('.clab-custom-select-dropdown');
                if (dp) { dp.style.top = ''; dp.style.bottom = ''; dp.style.transform = ''; }

                items.forEach(item => item.style.display = 'block');
                const groupTitles = el.querySelectorAll('.clab-custom-select-group-title');
                groupTitles.forEach(title => title.style.display = 'flex');

                const selected = el.querySelector('.clab-custom-select-item.selected');
                if (selected) input.value = selected.textContent;
                else input.value = input.getAttribute('title');
            }, 200);
        });

        items.forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const val = item.dataset.value;
                el.classList.remove('open');

                const currentArea = el.closest('.clab-area');
                if (currentArea) currentArea.style.zIndex = '';
                const dp = el.querySelector('.clab-custom-select-dropdown');
                if (dp) { dp.style.top = ''; dp.style.bottom = ''; dp.style.transform = ''; }

                const cardId = el.dataset.cardId;
                const areaId = el.dataset.areaId;
                const card = stateObj.cards.find(c => c.id === cardId);
                const area = card?.areas.find(a => a.id === areaId);

                if (area) {
                    area.value = val;
                    stateObj.selectedAreaIds = [areaId];
                    stateObj.selectedCardIds = [];
                    appState.lastClickedAreaId = areaId;

                    if (window._clabSurgicallyUpdateArea) {
                        window._clabSurgicallyUpdateArea(areaId);
                        if (window._clabJustSave) window._clabJustSave();
                    } else if (saveAndRenderCallback) {
                        saveAndRenderCallback();
                    }
                }
            });
        });
    });
}

// =========================================================================
// --- CSS 鍏ㄥ眬鏍峰紡娉ㄥ叆 ---
// =========================================================================

export function injectDnDCSS() {
    if (!document.getElementById('clab-area-dnd-styles')) {
        const style = document.createElement('style');
        style.id = 'clab-area-dnd-styles';
        // 銆愪富棰樺紩鎿庛€戯細鎷栨嫿鏍峰紡瀹炴椂鍏宠仈 CSS 鍙橀噺
        style.innerHTML = `
            .clab-drag-over-area-top { border-top: 3px solid var(--clab-theme-card, #4CAF50) !important; background: var(--clab-theme-card-hover, rgba(76, 175, 80, 0.1)) !important; }
            .clab-drag-over-area-bottom { border-bottom: 3px solid var(--clab-theme-card, #4CAF50) !important; background: var(--clab-theme-card-hover, rgba(76, 175, 80, 0.1)) !important; }
            .clab-drag-over-thumb-left { border-left: 3px solid var(--clab-theme-card, #4CAF50) !important; border-radius: 0 !important; }
            .clab-drag-over-thumb-right { border-right: 3px solid var(--clab-theme-card, #4CAF50) !important; border-radius: 0 !important; }
            .clab-history-thumb:hover .clab-thumb-delete { display: flex !important; }
            .clab-thumb-delete:hover { transform: scale(1.15); background: #ff5555 !important; color: #fff !important; }
            .clab-history-thumb:active { cursor: grabbing !important; opacity: 0.8; }
        `;
        document.head.appendChild(style);
    }
}

export function injectCSS() {
    const style = document.createElement("style");
    // 銆愪富棰樺紩鎿庛€戯細鍏ㄩ潰鎶涘純纭紪鐮侀鑹诧紝鍏ㄧ嚎鍚敤 CSS 鍙橀噺锛?
    style.innerHTML = `
        #clab-backdrop {
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0, 0, 0, 0.6); z-index: 9998; 
            opacity: 0; pointer-events: none; transition: opacity 0.25s ease;
        }
        #clab-backdrop.visible { opacity: 1; pointer-events: auto; }

        #clab-panel {
            position: fixed; top: 10vh; left: 10vw; width: 80vw; height: 80vh;
            background: rgba(30, 30, 30, 0.45); 
            backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px);
            color: var(--fg-color, #eee); font-family: sans-serif;
            border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2); z-index: 9999;
            display: flex; flex-direction: column; box-sizing: border-box; overflow: hidden;
            opacity: 0; pointer-events: none; transform: scale(0.95);
            transition: opacity 0.2s ease, transform 0.25s cubic-bezier(0.18, 0.89, 0.32, 1.28);
        }
        #clab-panel.visible { opacity: 1; pointer-events: auto; transform: scale(1); }

        #clab-panel.clab-painter-active, #clab-panel.clab-painter-active * {
            cursor: crosshair !important;
        }

        .clab-toolbar {
            padding: 15px 20px; background: rgba(0, 0, 0, 0.3); border-bottom: 1px solid rgb(8, 8, 8);
            display: flex; justify-content: space-between; align-items: center; gap: 10px;
            cursor: grab; user-select: none; flex-wrap: nowrap;
        }
        .clab-toolbar:active { cursor: grabbing; }
        .clab-toolbar button, .clab-toolbar input { cursor: pointer; }
        .clab-toolbar-left,
        .clab-toolbar-right {
            display: flex;
            align-items: center;
            gap: 10px;
            min-width: 0;
        }
        .clab-toolbar-left {
            flex: 1 1 auto;
        }
        .clab-toolbar-right {
            flex: 0 0 auto;
            margin-left: auto;
        }
        .clab-module-toolbar {
            display: flex;
            align-items: center;
            gap: 12px;
            min-width: 0;
        }

        .clab-btn {
            background: rgba(255, 255, 255, 0.1); color: #fff; border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 6px;
            padding: 8px 15px; font-size: 13px; transition: all 0.2s; white-space: nowrap; font-family: sans-serif;
            user-select: none; outline: none;
        }
        .clab-btn:hover { background: rgba(255, 255, 255, 0.2); }
        
        .clab-run-wrapper {
            background: rgba(33, 150, 243, 0.8); border: 1px solid rgba(33, 150, 243, 1); border-radius: 6px; 
            display: inline-flex; align-items: stretch; position: relative; transition: all 0.2s;
        }
        .clab-run-wrapper:hover { background: rgba(33, 150, 243, 1); box-shadow: 0 0 10px rgba(33, 150, 243, 0.5); }
        .clab-run-wrapper .clab-btn { background: transparent; border: none; font-weight: bold; margin: 0; display: flex; align-items: center; }
        .clab-run-wrapper .run-btn-main { border-top-right-radius: 0; border-bottom-right-radius: 0; padding-right: 12px; }
        .clab-run-wrapper .run-btn-toggle { border-top-left-radius: 0; border-bottom-left-radius: 0; padding-left: 10px; padding-right: 10px; justify-content: center; }
        .clab-run-wrapper .clab-btn:hover { background: rgba(255, 255, 255, 0.15); }
        
        .clab-btn[disabled] { opacity: 0.5; cursor: not-allowed; pointer-events: none; }
        
        .clab-cards-container { 
            flex: 1; overflow-x: auto; overflow-y: hidden; padding: 20px; 
            display: flex; flex-direction: row; gap: 20px; align-items: stretch;
        }
        .clab-panel-footer {
            display: flex;
            align-items: stretch;
            justify-content: flex-start;
            gap: 0;
            padding: 0;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            background: rgba(0, 0, 0, 0.4);
            flex: 0 0 auto;
            height: 27px;
            box-sizing: border-box;
            width: 100%;
            overflow: hidden;
        }
        #clab-card-width-ctrl {
            position: absolute;
            right: 20px;
            bottom: 44px;
            background: transparent;
            padding: 0;
            border: none;
            display: flex;
            align-items: center;
            gap: 8px;
            z-index: 100;
        }
        .clab-workspace-shell {
            display: flex;
            align-items: stretch;
            gap: 0;
            min-width: 0;
            flex: 1 1 auto;
            justify-content: flex-start;
            height: 100%;
        }
        .clab-workspace-tabs {
            display: flex;
            align-items: stretch;
            gap: 0;
            min-width: 0;
            overflow-x: auto;
            overflow-y: hidden;
            scrollbar-width: none;
            height: 100%;
        }
        .clab-workspace-tabs::-webkit-scrollbar { display: none; }
        .clab-workspace-tab {
            flex: 0 0 auto;
            height: 100%;
            box-sizing: border-box;
            border: none;
            border-right: 1px solid rgba(255,255,255,0.08);
            border-radius: 0;
            background: transparent;
            color: rgb(100, 100, 100);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0 16px;
            cursor: pointer;
            transition: all 0.1s ease;
            max-width: 180px;
            font-size: 11px;
            user-select: none;
            outline: none;
        }
        .clab-workspace-tab:hover { background: rgba(255,255,255,0.05); color: #ddd; }
        .clab-workspace-tab.active {
            background: rgb(24, 24, 24);
            color: #fff;
            box-shadow: inset 0 -2px 0 var(--clab-theme-card, #4CAF50);
        }
        .clab-workspace-tab.selected {
            background: rgb(24, 24, 24);
        }
        .clab-workspace-tab.active.selected {
            background: rgb(24, 24, 24);
        }
        .clab-workspace-tab.clab-workspace-add {
            flex: 0 0 auto;
            width: 27px;
            height: 100%;
            padding: 0;
            font-size: 16px;
            font-weight: normal;
            position: sticky;
            right: 0;
            background: #181818 !important; /* Unified solid background */
            border-left: 1px solid rgba(255,255,255,0.15);
            border-radius: 0;
            z-index: 15;
            justify-content: center;
            color: #888;
        }
        .clab-workspace-tab.clab-workspace-add:hover {
            color: #fff;
            background: rgba(255,255,255,0.05);
        }
        .clab-workspace-tab-index {
            display: none;
        }
        .clab-workspace-tab-name {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            outline: none;
        }
        .clab-workspace-tab-name[contenteditable="true"] {
            text-overflow: clip;
            cursor: text;
        }
        .clab-workspace-actions {
            display: flex;
            align-items: center;
            gap: 8px;
            flex: 0 0 auto;
        }
        .clab-workspace-action {
            padding: 6px 12px;
            height: 30px;
            border-radius: 15px;
        }
        .clab-workspace-action.clab-danger {
            border-color: rgba(255, 80, 80, 0.35);
            color: #ff9a9a;
        }
        .clab-workspace-action.clab-danger:hover {
            background: rgba(255, 80, 80, 0.22);
            color: #fff;
        }
        .clab-cards-container::-webkit-scrollbar, .clab-card-body::-webkit-scrollbar { height: 7px; width: 4px; }
        .clab-cards-container::-webkit-scrollbar-thumb, .clab-card-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 4px; }
        .clab-cards-container::-webkit-scrollbar-track, .clab-card-body::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); }
        
        .clab-card {
            background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; 
            padding: 8px 0 4px 0; transition: border-color 0.2s, border-width 0.2s, box-shadow 0.2s, background 0.2s;
            flex: 0 0 340px; display: flex; flex-direction: column;
            max-height: 100%; overflow: hidden; position: relative;
        }
        .clab-card.active { 
            border-color: var(--clab-theme-card, #4CAF50) !important;
            border-width: var(--clab-theme-card-border, 2px) !important;
            border-style: solid !important;
            box-shadow: 0 0 var(--clab-theme-card-glow, 15px) var(--clab-theme-card-alpha, rgba(76, 175, 80, 0.3)); 
            background: var(--clab-theme-card-bg, rgba(76, 175, 80, 0.08)); 
        }
        
        .clab-card-body {
            flex: 1; overflow-y: auto; overflow-y: overlay; overflow-x: hidden; 
            padding: 0 10px 10px 10px;
            display: flex; flex-direction: column;
            min-height: 50px; 
        }

        .clab-card-title-bar {
            margin-bottom: 8px; padding: 0 10px 4px 10px; border-bottom: 1px solid rgba(255, 255, 255, 0.15);
            display: flex; align-items: center;
        }
        .clab-card-title-input {
            background: transparent; border: none; color: #ddd; font-size: 16px;
            font-weight: bold; width: 85%; padding: 0; outline: none; transition: color 0.2s;
            font-family: sans-serif;
        }
        .clab-card-title-input:focus { color: #fff; }

        .clab-del-card-btn, .clab-del-area-btn {
            position: absolute; top: 6px; right: 6px; width: 22px; height: 22px; border-radius: 50%;
            background: rgba(255, 255, 255, 0.6); border: none; color: #333; 
            font-size: 12px; font-weight: bold; display: flex; justify-content: center; align-items: center;
            cursor: pointer; opacity: 0; transition: opacity 0.2s, transform 0.2s, background 0.2s, color 0.2s; z-index: 10;
        }
        .clab-del-card-btn:hover, .clab-del-area-btn:hover { transform: scale(1.15); background: #ff5555; color: #fff; }
        .clab-card:hover > .clab-del-card-btn { opacity: 1; }
        .clab-area:hover > .clab-del-area-btn { opacity: 1; }

        .clab-area-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 15px; min-height: 20px; transition: background 0.2s;}
        
        .clab-area { 
            background: rgba(255, 255, 255, 0.05); border: 1px dashed rgba(255, 255, 255, 0.2); 
            border-radius: 6px; font-size: 12px; position: relative; cursor: grab; transition: border-color 0.2s, border-width 0.2s, box-shadow 0.2s, background 0.2s;
            flex-shrink: 0; overflow: hidden;
        }
        .clab-area:active { cursor: grabbing; }
        .clab-area.active { 
            border-color: var(--clab-theme-module, #2196F3) !important;
            border-width: var(--clab-theme-module-border, 1px) !important;
            border-style: solid !important;
            box-shadow: 0 0 var(--clab-theme-module-glow, 10px) var(--clab-theme-module-alpha, rgba(33, 150, 243, 0.4)); 
            background: var(--clab-theme-module-bg, rgba(33, 150, 243, 0.05)); 
        }
        .clab-area.clab-node-bypassed {
            opacity: 0.45;
        }
        .clab-area.clab-node-bypassed::after {
            content: "";
            position: absolute;
            inset: 0;
            border-radius: inherit;
            background: rgba(255, 0, 0, 0.05);
            pointer-events: none;
            z-index: 2;
        }

        .clab-input { 
            width: 100%; background: rgba(0,0,0,0.5); color: #fff; border: 1px solid #555; 
            padding: 8px; border-radius: 4px; box-sizing: border-box; resize: vertical; 
            min-height: 32px; font-family: sans-serif;
        }
        .clab-input:disabled { opacity: 0.5; cursor: not-allowed; }
        
        .clab-capsule { 
            border-radius: 20px !important; padding-left: 12px !important; padding-right: 12px !important; 
            height: 30px !important; min-height: 30px !important; font-size: 12px !important; line-height: 28px !important;
        }
        .clab-custom-select {
            position: relative; display: inline-flex; align-items: center; justify-content: space-between;
            background: rgba(0,0,0,0.5); border: 1px solid #555;
            color: #fff; cursor: text; outline: none;
            box-sizing: border-box; font-family: sans-serif;
        }
        .clab-custom-select.disabled { opacity: 0.5; pointer-events: none; }
        
        .clab-custom-select-value {
            flex: 1; min-width: 0; background: transparent; border: none; color: inherit;
            font-family: inherit; font-size: inherit; font-weight: inherit; outline: none;
            padding: 0; margin: 0; cursor: text;
            text-overflow: ellipsis; white-space: nowrap; overflow: hidden;
        }
        
        .clab-custom-select-icon { font-size: 8px; color: #888; margin-left: 6px; flex-shrink: 0; cursor: pointer; }
        .clab-custom-select-dropdown {
            position: absolute; top: calc(100% + 4px); left: 0; min-width: 100%;
            background: #2a2a2a; border: 1px solid #555; border-radius: 6px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.5); z-index: 10001;
            display: none; max-height: 600px; overflow-y: auto; padding: 4px 0;
            cursor: default; text-align: left;
        }
        .clab-custom-select.open .clab-custom-select-dropdown { display: block; }
        .clab-custom-select-item {
            padding: 6px 12px; font-size: 12px; color: #eee; cursor: pointer;
            transition: background 0.1s; white-space: nowrap;
        }
        .clab-custom-select-item:hover { background: var(--clab-theme-card, #4CAF50); color: #fff; }
        .clab-custom-select-item.selected { color: var(--clab-theme-card, #4CAF50); font-weight: bold; }
        .clab-custom-select-group-title {
            padding: 4px 12px; font-size: 10px; color: #aaa; font-weight: bold;
            background: rgba(255,255,255,0.05); margin-top: 4px; pointer-events: none;
            display: flex; align-items: center; gap: 4px;
        }

        .clab-preview-bg {
            background: linear-gradient(135deg, #4a00e0, #8e2de2);
            width: 100%; border-radius: 4px; overflow: hidden;
            display: flex; justify-content: center; align-items: center;
            position: relative; transition: all 0.3s;
        }
        .clab-preview-img { width: 100%; height: 100%; display: none; }
        .clab-preview-placeholder { color: rgba(255,255,255,0.6); font-weight: bold; font-size: 14px; pointer-events: none; padding: 20px; text-align: center; }

        .clab-card-progress-bar.error {
            background-color: #f44336 !important;
            box-shadow: 0 0 10px #f44336;
            animation: error-pulse 1.5s infinite;
        }
        @keyframes error-pulse {
            0% { opacity: 0.7; }
            50% { opacity: 1; }
            100% { opacity: 0.7; }
        }

        .clab-dragging { opacity: 0.5; border-color: var(--clab-theme-card, #4CAF50) !important; }
        .clab-drag-over { border-top: 3px solid var(--clab-theme-card, #4CAF50) !important; background: var(--clab-theme-card-hover, rgba(76, 175, 80, 0.1)) !important;}
        .clab-drag-over-list { background: var(--clab-theme-card-hover, rgba(76, 175, 80, 0.1)) !important; border-radius: 8px; border: 2px dashed var(--clab-theme-card, #4CAF50) !important; box-sizing: border-box;}
        .clab-workspace-tab.clab-dragging {
            opacity: 0.4;
            background: rgba(255, 255, 255, 0.1);
        }
        .clab-drag-over-card { border-left: 3px solid var(--clab-theme-card, #4CAF50) !important; }
        .clab-drag-over-tab-left { border-left: 2px solid var(--clab-theme-card, #4CAF50) !important; background: var(--clab-theme-card-hover, rgba(76, 175, 80, 0.1)) !important; }
        .clab-drag-over-tab-right { border-right: 2px solid var(--clab-theme-card, #4CAF50) !important; background: var(--clab-theme-card-hover, rgba(76, 175, 80, 0.1)) !important; }

        /* ========================================================================= */
        /* --- 鍙抽敭鑿滃崟鏍峰紡 (Context Menu) --- */
        /* ========================================================================= */
        .clab-context-menu {
            position: fixed;
            background: rgba(35, 35, 35, 0.95);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            padding: 6px 0;
            min-width: 180px;
            z-index: 10005;
            display: none;
            font-family: sans-serif;
            font-size: 13px;
            color: #eee;
        }
        .clab-context-menu-title {
            padding: 4px 15px;
            font-size: 11px;
            color: #aaa;
            font-weight: bold;
            background: rgba(0,0,0,0.2);
            margin: 4px 0;
            pointer-events: none;
            letter-spacing: 1px;
        }
        .clab-context-menu-item {
            padding: 8px 15px;
            cursor: pointer;
            transition: background 0.1s;
            display: flex;
            align-items: center;
        }
        .clab-context-menu-item:hover { background: var(--clab-theme-module, #2196F3); color: #fff; }
        .clab-context-menu-item.clab-danger { color: #ff6b6b; }
        .clab-context-menu-item.clab-danger:hover { background: #f44336; color: #fff; }
        .clab-context-menu-divider {
            height: 1px;
            background: rgba(255, 255, 255, 0.1);
            margin: 4px 0;
        }

        .clab-preview-modal {
            position: fixed;
            inset: 0;
            z-index: 10020;
            display: none;
        }
        .clab-preview-modal.visible {
            display: block;
        }
        .clab-preview-modal-backdrop {
            position: absolute;
            inset: 0;
            background: rgba(0, 0, 0, 0.62);
            backdrop-filter: blur(6px);
        }
        .clab-preview-modal-panel {
            position: absolute;
            inset: 4vh 4vw;
            display: flex;
            flex-direction: column;
            border-radius: 14px;
            border: 1px solid rgba(255, 255, 255, 0.16);
            background: linear-gradient(180deg, rgba(28, 28, 28, 0.96), rgba(20, 20, 20, 0.96));
            box-shadow: 0 28px 60px rgba(0, 0, 0, 0.55);
            overflow: hidden;
        }
        .clab-preview-modal-head {
            flex: 0 0 auto;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 16px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            background: rgba(10, 10, 10, 0.35);
        }
        .clab-preview-modal-title {
            font-size: 15px;
            font-weight: 700;
            color: #f2f2f2;
            letter-spacing: 0.2px;
        }
        .clab-preview-modal-close {
            border: 1px solid rgba(255,255,255,0.18);
            background: rgba(255,255,255,0.08);
            color: #f0f0f0;
            border-radius: 8px;
            padding: 6px 12px;
            cursor: pointer;
            font-size: 12px;
        }
        .clab-preview-modal-close:hover {
            background: rgba(255,255,255,0.16);
        }
        .clab-preview-modal-body {
            flex: 1 1 auto;
            min-height: 0;
            display: grid;
            grid-template-columns: 240px minmax(320px, 1fr) 360px;
            gap: 0;
        }
        .clab-preview-modal-left,
        .clab-preview-modal-center,
        .clab-preview-modal-right {
            min-height: 0;
        }
        .clab-preview-modal-left {
            border-right: 1px solid rgba(255,255,255,0.08);
            background: rgba(12, 12, 12, 0.35);
            overflow-y: auto;
            padding: 10px;
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        .clab-preview-modal-center {
            background: rgba(0,0,0,0.25);
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            padding: 10px;
        }
        .clab-preview-modal-right {
            border-left: 1px solid rgba(255,255,255,0.08);
            background: rgba(16, 16, 16, 0.45);
            overflow-y: auto;
            padding: 12px;
            display: flex;
            flex-direction: column;
            gap: 10px;
            font-family: sans-serif;
        }
        .clab-preview-modal-thumb {
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 10px;
            background: rgba(255,255,255,0.04);
            color: #e8e8e8;
            cursor: pointer;
            text-align: left;
            padding: 6px;
            display: flex;
            flex-direction: column;
            gap: 6px;
        }
        .clab-preview-modal-thumb.active {
            border-color: var(--clab-theme-module, #2196F3);
            box-shadow: 0 0 0 1px rgba(33, 150, 243, 0.35) inset;
            background: rgba(33,150,243,0.14);
        }
        .clab-preview-modal-thumb:hover {
            background: rgba(255,255,255,0.11);
        }
        .clab-preview-modal-thumb-media {
            width: 100%;
            aspect-ratio: 16/10;
            border-radius: 8px;
            overflow: hidden;
            background: rgba(0,0,0,0.42);
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .clab-preview-modal-thumb-media img,
        .clab-preview-modal-thumb-media video {
            width: 100%;
            height: 100%;
            object-fit: cover;
            pointer-events: none;
        }
        .clab-preview-modal-thumb-badge {
            font-size: 12px;
            color: #ddd;
            letter-spacing: 0.6px;
        }
        .clab-preview-modal-thumb-name {
            font-size: 12px;
            color: #ddd;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .clab-preview-modal-image-stage {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            position: relative;
            cursor: zoom-in;
        }
        .clab-preview-modal-image-stage.hand-ready {
            cursor: grab;
        }
        .clab-preview-modal-image-stage.dragging {
            cursor: grabbing;
        }
        .clab-preview-modal-main-image,
        .clab-preview-modal-main-video {
            max-width: 100%;
            max-height: 100%;
            border-radius: 10px;
            box-shadow: 0 8px 26px rgba(0, 0, 0, 0.45);
            background: #000;
        }
        .clab-preview-modal-main-image {
            transform-origin: center center;
            transition: transform 0.04s linear;
            user-select: none;
            -webkit-user-select: none;
            pointer-events: none;
            will-change: transform;
        }
        .clab-preview-modal-main-video {
            width: 100%;
            max-width: 100%;
            height: auto;
        }
        .clab-preview-modal-main-audio {
            width: min(560px, 92%);
            margin-top: 16px;
        }
        .clab-preview-modal-audio-wrap,
        .clab-preview-modal-file-wrap {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 8px;
            color: #f3f3f3;
            text-align: center;
        }
        .clab-preview-modal-audio-wave-wrap {
            width: min(860px, 94%);
            height: 120px;
            border-radius: 0;
            border: none;
            background: transparent;
            box-shadow: none;
            padding: 0;
            box-sizing: border-box;
            display: flex;
            align-items: stretch;
        }
        .clab-preview-modal-audio-name {
            width: min(860px, 94%);
            text-align: left;
            font-family: sans-serif;
            font-size: 12px;
            color: rgba(240, 245, 250, 0.92);
            letter-spacing: 0.1px;
        }
        .clab-preview-modal-audio-wave {
            width: 100%;
            height: 100%;
            display: block;
            cursor: pointer;
        }
        .clab-preview-modal-file-link {
            color: #8ecbff;
            text-decoration: none;
            border-bottom: 1px solid rgba(142, 203, 255, 0.5);
        }
        .clab-preview-modal-file-link:hover {
            color: #b8ddff;
            border-bottom-color: #b8ddff;
        }
        .clab-preview-modal-main-text {
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 12px;
            overflow: auto;
            box-sizing: border-box;
            border-radius: 8px;
            border: 1px solid rgba(255,255,255,0.12);
            background: rgba(8,8,8,0.78);
            color: #f2f2f2;
            font-size: 12px;
            line-height: 1.6;
            white-space: pre-wrap;
            word-break: break-word;
        }
        .clab-preview-modal-text-editor {
            width: min(980px, 98%);
            height: 100%;
            display: flex;
            flex-direction: column;
            gap: 10px;
            color: #eef3f8;
            font-family: sans-serif;
        }
        .clab-preview-modal-text-toolbar {
            display: flex;
            align-items: center;
            gap: 12px;
            flex-wrap: wrap;
            font-family: sans-serif;
        }
        .clab-preview-modal-text-option {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            color: rgba(235, 242, 250, 0.9);
            font-size: 12px;
            font-family: sans-serif;
            user-select: none;
            cursor: pointer;
        }
        .clab-preview-modal-text-option input {
            width: 14px;
            height: 14px;
            margin: 0;
            cursor: pointer;
        }
        .clab-preview-modal-text-copy,
        .clab-preview-modal-text-save {
            border: 1px solid rgba(255,255,255,0.16);
            border-radius: 6px;
            background: rgba(255,255,255,0.08);
            color: #eef3f8;
            font: 12px/1 sans-serif;
            padding: 6px 10px;
            cursor: pointer;
            transition: background 0.15s ease, border-color 0.15s ease, opacity 0.15s ease;
        }
        .clab-preview-modal-text-copy:hover,
        .clab-preview-modal-text-save:hover {
            background: rgba(255,255,255,0.14);
            border-color: rgba(255,255,255,0.24);
        }
        .clab-preview-modal-text-copy:disabled,
        .clab-preview-modal-text-save:disabled {
            opacity: 0.72;
            cursor: default;
        }
        .clab-preview-modal-text-body {
            flex: 1 1 auto;
            min-height: 0;
            border: 1px solid rgba(255,255,255,0.12);
            border-radius: 8px;
            background: rgba(8,8,8,0.78);
            overflow: hidden;
            box-sizing: border-box;
        }
        .clab-preview-modal-text-editor-host {
            width: 100%;
            height: 100%;
            min-height: 0;
        }
        .clab-preview-modal-text-editor-host.hidden,
        .clab-preview-modal-text-editor-input.hidden {
            display: none;
        }
        .clab-preview-modal-text-editor-host .cm-editor {
            height: 100%;
            background: transparent;
        }
        .clab-preview-modal-text-editor-host .cm-scroller {
            font-family: sans-serif;
            font-size: 13px;
            line-height: 1.62;
        }
        .clab-preview-modal-text-editor-host .cm-content {
            caret-color: #f2f2f2;
        }
        .clab-preview-modal-text-editor-host .cm-gutters {
            background: rgba(255,255,255,0.03);
            border-right: 1px solid rgba(255,255,255,0.08);
        }
        .clab-preview-modal-text-editor-host .toastui-editor-defaultUI {
            border: none;
            background: transparent;
            height: 100%;
        }
        .clab-preview-modal-text-editor-host .toastui-editor-main-container {
            background: transparent;
        }
        .clab-preview-modal-text-editor-host .toastui-editor-contents {
            font-family: sans-serif;
            font-size: 13px;
            line-height: 1.62;
        }
        .clab-preview-modal-text-editor-input {
            width: 100%;
            height: 100%;
            border: none;
            outline: none;
            margin: 0;
            resize: none;
            box-sizing: border-box;
            background: transparent;
            color: #f2f2f2;
            font: 13px/1.62 sans-serif;
            padding: 12px 14px;
            white-space: pre-wrap;
            word-break: break-word;
            overflow: auto;
        }
        .clab-preview-modal-text-preview {
            width: 100%;
            height: 100%;
            box-sizing: border-box;
            overflow: auto;
            padding: 12px 14px;
            font-family: sans-serif;
            line-height: 1.6;
            color: #eef3f8;
        }
        .clab-preview-modal-text-preview .clab-text-plain,
        .clab-preview-modal-text-preview .clab-text-code-pre {
            margin: 0;
            white-space: pre-wrap;
            word-break: break-word;
            font-family: sans-serif;
            font-size: 13px;
            line-height: 1.62;
        }
        .clab-preview-modal-text-preview .clab-text-inline-code {
            padding: 0.12em 0.32em;
            border-radius: 4px;
            background: rgba(255,255,255,0.08);
        }
        .clab-preview-modal-text-preview .clab-text-token-string { color: #f7b267; }
        .clab-preview-modal-text-preview .clab-text-token-number { color: #7fd8be; }
        .clab-preview-modal-text-preview .clab-text-token-boolean { color: #ff7aa2; }
        .clab-preview-modal-text-preview .clab-text-token-keyword { color: #7cb7ff; font-weight: 600; }
        .clab-preview-modal-text-preview .clab-text-token-comment { color: #7f8da1; font-style: italic; }
        .clab-preview-modal-text-preview .clab-text-token-function { color: #e5c07b; }
        .clab-preview-modal-text-preview .clab-text-token-operator { color: #d39df8; }
        .clab-preview-modal-text-preview .clab-text-token-bracket { color: #9bd8ff; }
        .clab-preview-modal-text-preview .clab-text-token-punctuation { color: #9fb3c8; }
        .clab-preview-modal-param {
            border: 1px solid rgba(255,255,255,0.1);
            background: rgba(255,255,255,0.03);
            border-radius: 10px;
            padding: 10px;
            display: flex;
            flex-direction: column;
            gap: 6px;
            font-family: sans-serif;
        }
        .clab-preview-modal-param-key {
            font-size: 12px;
            font-weight: 700;
            color: #f1f1f1;
        }
        .clab-preview-modal-param-meta {
            font-size: 11px;
            color: #9fa6ad;
        }
        .clab-preview-modal-param-value {
            margin: 0;
            font-size: 12px;
            color: #ececec;
            background: rgba(0,0,0,0.35);
            border-radius: 8px;
            border: 1px solid rgba(255,255,255,0.08);
            padding: 8px;
            white-space: pre-wrap;
            word-break: break-word;
            max-height: 200px;
            overflow: auto;
            font-family: sans-serif;
        }
        .clab-preview-modal-empty,
        .clab-preview-modal-loading,
        .clab-preview-modal-error {
            color: #cfd6dd;
            font-size: 13px;
            text-align: center;
            margin: auto;
        }
        @media (max-width: 1200px) {
            .clab-preview-modal-body {
                grid-template-columns: 200px minmax(260px, 1fr) 300px;
            }
        }
        @media (max-width: 900px) {
            .clab-preview-modal-panel {
                inset: 2vh 2vw;
            }
            .clab-preview-modal-body {
                grid-template-columns: 1fr;
                grid-template-rows: 180px minmax(260px, 1fr) 220px;
            }
            .clab-preview-modal-left,
            .clab-preview-modal-right {
                border: none;
            }
            .clab-preview-modal-left {
                border-bottom: 1px solid rgba(255,255,255,0.08);
            }
            .clab-preview-modal-right {
                border-top: 1px solid rgba(255,255,255,0.08);
            }
        }
    `;
    document.head.appendChild(style);
}
