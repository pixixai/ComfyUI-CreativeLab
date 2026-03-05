/**
 * 文件名: event_global.js
 * 职责: 处理全局级别的生命周期事件、快捷键、以及组件间自定义事件的广播
 */
import { state, appState, saveAndRender } from "../ui_state.js";
import { updateSelectionUI } from "../ui_selection.js";
import { enterBindingModeForSelected } from "../actions/action_binding.js";

export function setupGlobalEvents(panelContainer, backdropContainer, togglePanelFunc, performRenderFunc) {
    
    window.addEventListener('contextmenu', (e) => {
        if (appState.isBindingMode) {
            e.preventDefault(); 
            e.stopPropagation();
            return;
        }

        if (state.painterMode) {
            e.preventDefault(); e.stopPropagation();
            state.painterMode = false;
            state.painterSource = null;
            updateSelectionUI();
        }
    });

    document.addEventListener("keydown", (e) => {
        if (appState.isBindingMode) return; 
        
        if (e.key === 'Escape') {
            if (state.painterMode) {
                state.painterMode = false;
                state.painterSource = null;
            }
            // ESC 键清空所有选中，局部刷新！
            state.selectedCardIds = [];
            state.activeCardId = null;
            state.selectedAreaIds = [];
            updateSelectionUI();
            return;
        }

        // 历史记录键盘导航逻辑 (左与右)
        if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && state.selectedAreaIds.length === 1) {
            // 防误触：如果你正在输入框里打字，绝对不要切换图片！
            if (document.activeElement && ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
            
            const areaId = state.selectedAreaIds[0];
            let targetArea = null;
            for (const c of state.cards) {
                const a = c.areas?.find(x => x.id === areaId);
                if (a) { targetArea = a; break; }
            }
            
            // 执行丝滑切换
            if (targetArea && targetArea.type === 'preview' && targetArea.history && targetArea.history.length > 1) {
                e.preventDefault(); // 阻止页面可能发生的滚动
                let idx = targetArea.historyIndex !== undefined ? targetArea.historyIndex : targetArea.history.length - 1;
                
                if (e.key === 'ArrowLeft') {
                    idx = Math.max(0, idx - 1);
                } else {
                    idx = Math.min(targetArea.history.length - 1, idx + 1);
                }
                
                if (targetArea.historyIndex !== idx) {
                    targetArea.historyIndex = idx;
                    targetArea.resultUrl = targetArea.history[idx];
                    saveAndRender();
                }
                return;
            }
        }

        const tag = e.target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) return;
        
        if (e.key.toLowerCase() === 's' && !e.ctrlKey && !e.metaKey && !e.altKey) {
            e.preventDefault();
            togglePanelFunc();
        }
    });

    document.addEventListener("shell_link_update_preview", (e) => {
        const { cardId, areaId, url } = e.detail;
        const areaEl = document.querySelector(`.sl-area[data-area-id="${areaId}"]`);
        if (areaEl) {
            const mediaEl = areaEl.querySelector('.sl-preview-img');
            if (!mediaEl) {
                document.dispatchEvent(new CustomEvent("sl_render_ui"));
                return;
            }
            const placeholder = areaEl.querySelector('.sl-preview-placeholder');
            const isVideo = url.toLowerCase().match(/\.(mp4|webm|mov|avi|mkv)$/);
            const isAudio = url.toLowerCase().match(/\.(mp3|wav|ogg|flac|aac|m4a)$/);
            
            const tagName = mediaEl.tagName.toLowerCase();
            const isImgTag = tagName === 'img';
            const isVidTag = tagName === 'video';
            const isAudTag = tagName === 'audio';
            
            if ((isVideo && !isVidTag) || (isAudio && !isAudTag) || (!isVideo && !isAudio && !isImgTag)) {
                document.dispatchEvent(new CustomEvent("sl_render_ui"));
                return;
            }

            mediaEl.src = url;
            mediaEl.style.display = "block";
            if (placeholder) placeholder.style.display = "none";
        }
    });

    document.addEventListener("shell_link_state_loaded", (e) => {
        const loadedState = e.detail || { cards: [], activeCardId: null, selectedCardIds: [], selectedAreaIds: [] };
        Object.assign(state, loadedState);
        if (!state.selectedCardIds) state.selectedCardIds = state.activeCardId ? [state.activeCardId] : [];
        if (!state.selectedAreaIds) state.selectedAreaIds = [];
        state.painterMode = false;
        state.painterSource = null;
        
        state.cards.forEach(card => {
            if (!card.areas) {
                card.areas = [];
                if (card.previewAreas) { card.areas.push(...card.previewAreas.map(a => ({...a, type: 'preview', matchMedia: false, ratio: '16:9'}))); delete card.previewAreas; }
                if (card.editAreas) { card.areas.push(...card.editAreas.map(a => ({...a, type: 'edit', dataType: 'string', autoHeight: true}))); delete card.editAreas; }
            }
        });

        if (panelContainer && panelContainer.classList.contains('visible')) performRenderFunc();
    });

    document.addEventListener("shell_link_state_cleared", () => {
        Object.assign(state, { cards: [], activeCardId: null, selectedCardIds: [], selectedAreaIds: [], painterMode: false, painterSource: null });
        if (panelContainer && panelContainer.classList.contains('visible')) performRenderFunc();
    });

    document.addEventListener('sl_enter_binding_mode', (e) => {
        enterBindingModeForSelected(e.detail, panelContainer, backdropContainer);
    });
}