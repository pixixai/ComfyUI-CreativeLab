/**
 * 文件名: comp_contextmenu.js
 * 路径: web/components/comp_contextmenu.js
 * 职责: 拦截模块（输入/输出）的右键事件，生成动态菜单，并支持多选批量操作与全局资产清理
 */
import { state, saveAndRender } from "./ui_state.js";
import { showBindingToast, hideBindingToast } from "./ui_utils.js";
import { execSelectSameModules, execDeleteSameModules, execMoveBackward, execMoveForward } from "./actions/action_batch_sync.js";

// 辅助方法：触发定时消失的提示
function showAutoToast(msg, isError = false) {
    if (window.ShellLink && window.ShellLink.showAutoToast) {
        window.ShellLink.showAutoToast(msg, isError);
    } else {
        showBindingToast(msg, isError);
        setTimeout(hideBindingToast, 3000); 
    }
}

// 辅助方法：触发浏览器下载
function downloadFile(url) {
    if (!url) return;
    try {
        const urlObj = new URL(url, window.location.origin);
        const filename = urlObj.searchParams.get('filename') || `image_${Date.now()}.png`;
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    } catch (e) { console.error("下载失败", e); }
}

// =========================================================================
// 核心：初始化与挂载右键菜单
// =========================================================================
export function setupContextMenu(panelContainer) {
    const menuEl = document.createElement('div');
    menuEl.className = 'sl-context-menu';
    document.body.appendChild(menuEl);

    const closeMenuGlobally = (e) => {
        if (menuEl.style.display === 'block' && !menuEl.contains(e.target)) {
            menuEl.style.display = 'none';
        }
    };
    window.addEventListener('mousedown', closeMenuGlobally, true);
    window.addEventListener('contextmenu', (e) => {
        if (menuEl.style.display === 'block' && !menuEl.contains(e.target)) {
            menuEl.style.display = 'none';
        }
    }, true);

    const showMenu = (clientX, clientY, clickedAreaId) => {
        const selectedAreaObjs = [];
        state.cards.forEach(c => {
            c.areas?.forEach(a => {
                if (state.selectedAreaIds.includes(a.id)) {
                    selectedAreaObjs.push({ card: c, area: a });
                }
            });
        });

        const mainObj = selectedAreaObjs.find(o => o.area.id === clickedAreaId);
        if (!mainObj) return;

        const showContentGroup = mainObj.area.type === 'preview';
        let menuHTML = ``;

        if (showContentGroup) {
            menuHTML += `
                <div class="sl-context-menu-title">内容</div>
                <div class="sl-context-menu-item" id="sl-ctx-download">下载</div>
                <div class="sl-context-menu-item" id="sl-ctx-download-all">下载全部生成记录</div>
                <div class="sl-context-menu-divider"></div>
                <div class="sl-context-menu-item" id="sl-ctx-remove">移除</div>
                <div class="sl-context-menu-item" id="sl-ctx-clear">清除所有生成记录</div>
            `;
        }

        menuHTML += `
            <div class="sl-context-menu-title">模块</div>
            <div class="sl-context-menu-item" id="sl-ctx-select-same">选择相同模块</div>
            <div class="sl-context-menu-item sl-danger" id="sl-ctx-del-same">删除相同模块</div>
            <div class="sl-context-menu-divider"></div>
            <div class="sl-context-menu-item" id="sl-ctx-move-back">批量向后移动</div>
            <div class="sl-context-menu-item" id="sl-ctx-move-fwd">批量向前移动</div>
        `;

        menuEl.innerHTML = menuHTML;
        menuEl.style.display = 'block';
        
        let left = clientX;
        let top = clientY;
        const menuRect = menuEl.getBoundingClientRect();
        if (left + menuRect.width > window.innerWidth) left -= menuRect.width;
        if (top + menuRect.height > window.innerHeight) top -= menuRect.height;
        menuEl.style.left = `${left}px`;
        menuEl.style.top = `${top}px`;

        const getHistoryArr = (area) => area.history || area.historyUrls || area.results || [];
        const getHistoryIdx = (area) => area.historyIndex !== undefined ? area.historyIndex : (area.currentRecordIndex || 0);
        const getCurrentUrl = (area) => {
            const arr = getHistoryArr(area);
            const idx = getHistoryIdx(area);
            return area.resultUrl || (arr.length > 0 ? arr[idx] : null);
        };

        if (showContentGroup) {
            menuEl.querySelector('#sl-ctx-download').onclick = () => {
                menuEl.style.display = 'none';
                selectedAreaObjs.forEach(o => {
                    const url = getCurrentUrl(o.area);
                    if (url) downloadFile(url);
                });
            };

            menuEl.querySelector('#sl-ctx-download-all').onclick = () => {
                menuEl.style.display = 'none';
                selectedAreaObjs.forEach(o => {
                    const arr = getHistoryArr(o.area);
                    if (arr.length > 0) arr.forEach(url => downloadFile(url));
                    else if (o.area.resultUrl) downloadFile(o.area.resultUrl);
                });
            };

            // 【功能1】：仅移除当前记录（不影响本地文件，不波及其他模块）
            menuEl.querySelector('#sl-ctx-remove').onclick = () => {
                menuEl.style.display = 'none';
                selectedAreaObjs.forEach(o => {
                    const arr = getHistoryArr(o.area);
                    if (arr.length > 0) {
                        const idx = getHistoryIdx(o.area);
                        arr.splice(idx, 1);
                        const newIdx = Math.max(0, arr.length - 1);
                        if (o.area.historyIndex !== undefined) o.area.historyIndex = newIdx;
                        else if (o.area.currentRecordIndex !== undefined) o.area.currentRecordIndex = newIdx;
                        o.area.resultUrl = arr.length > 0 ? arr[newIdx] : null;
                    } else {
                        o.area.resultUrl = null;
                    }
                    if (o.area.selectedThumbIndices) o.area.selectedThumbIndices = []; 
                });
                saveAndRender(); 
            };

            // 【功能2】：仅清除当前模块所有记录（不影响本地文件，不波及其他模块）
            menuEl.querySelector('#sl-ctx-clear').onclick = () => {
                menuEl.style.display = 'none';
                selectedAreaObjs.forEach(o => {
                    o.area.resultUrl = null;
                    if (o.area.history) o.area.history = [];
                    if (o.area.historyUrls) o.area.historyUrls = [];
                    if (o.area.results) o.area.results = [];
                    if (o.area.historyIndex !== undefined) o.area.historyIndex = 0;
                    if (o.area.currentRecordIndex !== undefined) o.area.currentRecordIndex = 0;
                    if (o.area.selectedThumbIndices) o.area.selectedThumbIndices = [];
                });
                saveAndRender(); 
            };
        }

        // --- 模块区事件 ---
        menuEl.querySelector('#sl-ctx-select-same').onclick = () => { 
            menuEl.style.display = 'none'; 
            execSelectSameModules(selectedAreaObjs); 
        };
        menuEl.querySelector('#sl-ctx-del-same').onclick = () => { 
            menuEl.style.display = 'none'; 
            selectedAreaObjs.forEach(o => execDeleteSameModules(o.area, o.card));
        };
        menuEl.querySelector('#sl-ctx-move-back').onclick = () => { 
            menuEl.style.display = 'none'; 
            execMoveBackward(state.selectedAreaIds); 
        };
        menuEl.querySelector('#sl-ctx-move-fwd').onclick = () => { 
            menuEl.style.display = 'none'; 
            execMoveForward(state.selectedAreaIds); 
        };
    };

    window.ShellLink.showPreviewContextMenu = (x, y, cardId, areaId, url) => {
        if (state.painterMode) {
            state.painterMode = false;
            state.painterSource = null;
            saveAndRender();
            return;
        }

        if (!state.selectedAreaIds.includes(areaId)) {
            state.selectedAreaIds = [areaId];
            saveAndRender();
        }
        showMenu(x, y, areaId);
    };

    panelContainer.addEventListener('contextmenu', (e) => {
        if (state.painterMode) {
            e.preventDefault();
            e.stopPropagation();
            state.painterMode = false;
            state.painterSource = null;
            saveAndRender();
            return;
        }

        const areaEl = e.target.closest('.sl-area');
        if (!areaEl) return;

        const areaId = areaEl.dataset.areaId;
        
        if (!state.selectedAreaIds.includes(areaId)) {
            state.selectedAreaIds = [areaId];
            saveAndRender();
        }

        e.preventDefault(); 
        e.stopPropagation();
        showMenu(e.clientX, e.clientY, areaId);
    });
}