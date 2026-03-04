/**
 * comp_modulearea.js：【路由器与外壳】负责分发 Input/Output 渲染，管理外壳拖拽。
 */
import { state, dragState, saveAndRender } from "./ui_state.js";
import { injectDnDCSS, bindComboSelectEvents } from "./ui_utils.js";
import { renderDynamicToolbar, attachDynamicToolbarEvents } from "./actions/action_module_config.js";

// 引入拆分后的模块专员
import { generateInputHTML, attachInputEvents } from "./modules/module_input.js";
import { generateOutputHTML, attachOutputEvents } from "./modules/module_output.js";

export function generateAreaHTML(area, card) {
    if (area.type === 'edit') return generateInputHTML(area, card);
    if (area.type === 'preview') return generateOutputHTML(area, card);
    return '';
}

export function attachAreaEvents(container) {
    // 1. 注入拖拽所需的全局 CSS
    injectDnDCSS();

    // 2. 分发子组件的专有事件
    attachInputEvents(container);
    attachOutputEvents(container);
    
    // 3. 挂载通用下拉菜单逻辑 (Input用到了它)
    bindComboSelectEvents(container, state, saveAndRender);

    // =====================================================================================
    // 4. 以下全都是外壳 (Shell) 级别的通用事件绑定 (删除、标题编辑、格式刷点击、模块上下拖拽)
    // =====================================================================================
    container.querySelectorAll('.sl-del-area-btn').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            const { card: cardId, area: areaId } = e.target.dataset;
            const card = state.cards.find(c => c.id === cardId);
            if(card) {
                card.areas = card.areas.filter(a => a.id !== areaId);
                state.selectedAreaIds = state.selectedAreaIds.filter(id => id !== areaId);
                saveAndRender();
            }
        };
    });

    container.querySelectorAll('.sl-area-title-input').forEach(input => {
        input.addEventListener('input', function() {
            this.size = Math.max(this.value.length, 2); 
        });

        input.onchange = (e) => {
            const { card: cardId, area: areaId } = e.target.dataset;
            const card = state.cards.find(c => c.id === cardId);
            const area = card?.areas.find(a => a.id === areaId);
            if (area) {
                const currentVal = e.target.value.trim();
                const defaultTitle = e.target.placeholder;
                area.title = (currentVal === defaultTitle || currentVal === '') ? '' : currentVal;
                saveAndRender();
            }
        };
    });

    container.querySelectorAll('.sl-area').forEach(areaEl => {
        
        areaEl.addEventListener('contextmenu', (e) => {
            const areaId = areaEl.dataset.areaId;
            const cardId = areaEl.dataset.cardId;
            const card = state.cards.find(c => c.id === cardId);
            const area = card?.areas.find(a => a.id === areaId);
            
            if (area && area.type === 'preview' && area.resultUrl) {
                if (e.target.closest('.sl-preview-bg') || e.target.closest('.sl-history-thumb')) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (window.ShellLink && window.ShellLink.showPreviewContextMenu) {
                        let targetUrl = area.resultUrl;
                        if (e.target.closest('.sl-history-thumb')) {
                            const thumbIdx = parseInt(e.target.closest('.sl-history-thumb').dataset.index, 10);
                            targetUrl = area.history[thumbIdx];
                        }
                        window.ShellLink.showPreviewContextMenu(e.clientX, e.clientY, cardId, areaId, targetUrl);
                    }
                }
            }
        });

        areaEl.addEventListener('mousedown', (e) => {
            if (state.painterMode) return; 
            if (e.target.closest('.sl-del-area-btn')) return; 
            if (e.button === 2) return;

            e.stopPropagation();

            const areaId = areaEl.dataset.areaId;
            const isAlreadyOnlySelected = state.selectedAreaIds.length === 1 && state.selectedAreaIds[0] === areaId && state.selectedCardIds.length === 0;

            if (isAlreadyOnlySelected && !e.ctrlKey && !e.metaKey) return;

            if (e.ctrlKey || e.metaKey) {
                if (state.selectedAreaIds.includes(areaId)) {
                    state.selectedAreaIds = state.selectedAreaIds.filter(id => id !== areaId);
                } else {
                    state.selectedAreaIds.push(areaId);
                }
            } else {
                state.selectedAreaIds = [areaId];
            }
            state.selectedCardIds = [];

            if (window.ShellLink) window.ShellLink.saveState(state);

            document.querySelectorAll('.sl-card').forEach(el => el.classList.remove('active'));
            document.querySelectorAll('.sl-area').forEach(el => {
                if (state.selectedAreaIds.includes(el.dataset.areaId)) el.classList.add('active');
                else el.classList.remove('active');
            });

            const tbContainer = document.getElementById('sl-toolbar-handle');
            if (tbContainer) {
                renderDynamicToolbar(tbContainer);
                attachDynamicToolbarEvents(tbContainer);
            }
        });

        areaEl.onclick = (e) => {
            e.stopPropagation();
            const areaId = areaEl.dataset.areaId;

            if (state.painterMode) {
                if (['BUTTON', 'TEXTAREA', 'INPUT', 'SELECT'].includes(e.target.tagName) || e.target.closest('.sl-custom-select') || e.target.closest('.sl-bool-label') || e.target.closest('.sl-upload-zone')) return;
                
                if (state.painterSource?.type === 'card') {
                    const targetCardId = areaEl.dataset.cardId;
                    if (state.painterSource.data.id !== targetCardId) {
                        const targetCard = state.cards.find(c => c.id === targetCardId);
                        targetCard.areas = JSON.parse(JSON.stringify(state.painterSource.data.areas));
                        targetCard.areas.forEach(a => a.id = 'area_' + Date.now() + '_' + Math.floor(Math.random() * 1000));
                        saveAndRender();
                    }
                    return;
                }

                if (state.painterSource?.type === 'area' && state.painterSource.data.id !== areaId) {
                    const src = state.painterSource.data;
                    const card = state.cards.find(c => c.id === areaEl.dataset.cardId);
                    const area = card?.areas.find(a => a.id === areaId);
                    if (area) {
                        area.type = src.type;
                        area.targetNodeId = src.targetNodeId;
                        area.targetWidget = src.targetWidget;
                        area.targetNodeIds = Array.isArray(src.targetNodeIds) ? [...src.targetNodeIds] : [];
                        area.targetWidgets = Array.isArray(src.targetWidgets) ? [...src.targetWidgets] : [];
                        area.dataType = src.dataType;
                        area.autoHeight = src.autoHeight;
                        area.ratio = src.ratio;
                        area.width = src.width;
                        area.height = src.height;
                        area.matchMedia = src.matchMedia;
                        area.fillMode = src.fillMode;
                        if (area.type !== src.type) area.value = ''; 
                        saveAndRender();
                    }
                }
                return;
            }
        };

        areaEl.addEventListener('dragstart', (e) => {
            if (['INPUT', 'TEXTAREA', 'BUTTON'].includes(e.target.tagName) || e.target.closest('.sl-custom-select') || e.target.closest('.sl-bool-label') || e.target.closest('.sl-upload-zone') || e.target.closest('.sl-history-thumb')) return;
            
            e.stopPropagation(); 
            dragState.type = 'area';
            dragState.cardId = areaEl.dataset.cardId;
            dragState.areaId = areaEl.dataset.areaId;
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', 'area');
            setTimeout(() => areaEl.classList.add('sl-dragging'), 0);
        });

        areaEl.addEventListener('dragend', (e) => {
            e.stopPropagation();
            areaEl.classList.remove('sl-dragging');
            document.querySelectorAll('.sl-drag-over-area-top, .sl-drag-over-area-bottom').forEach(el => {
                el.classList.remove('sl-drag-over-area-top', 'sl-drag-over-area-bottom');
            });
            document.querySelectorAll('.sl-drag-over-list').forEach(el => el.classList.remove('sl-drag-over-list'));
            dragState.type = null; dragState.cardId = null; dragState.areaId = null;
        });

        areaEl.addEventListener('dragover', (e) => {
            if (e.dataTransfer.types.includes('Files')) return;

            if (dragState.type === 'area' && dragState.areaId !== areaEl.dataset.areaId) {
                e.preventDefault(); e.stopPropagation();
                
                const rect = areaEl.getBoundingClientRect();
                const midY = rect.top + rect.height / 2;
                
                if (e.clientY < midY) {
                    areaEl.classList.add('sl-drag-over-area-top');
                    areaEl.classList.remove('sl-drag-over-area-bottom');
                    areaEl.dataset.dropPosition = 'top';
                } else {
                    areaEl.classList.add('sl-drag-over-area-bottom');
                    areaEl.classList.remove('sl-drag-over-area-top');
                    areaEl.dataset.dropPosition = 'bottom';
                }
            }
        });

        areaEl.addEventListener('dragleave', (e) => {
            if (e.dataTransfer.types.includes('Files')) return;
            e.stopPropagation();
            if (!areaEl.contains(e.relatedTarget)) {
                areaEl.classList.remove('sl-drag-over-area-top', 'sl-drag-over-area-bottom');
                delete areaEl.dataset.dropPosition;
            }
        });

        areaEl.addEventListener('drop', (e) => {
            if (e.dataTransfer.types.includes('Files')) return;

            if (dragState.type === 'area') {
                e.preventDefault(); e.stopPropagation();
                
                const dropPos = areaEl.dataset.dropPosition;
                areaEl.classList.remove('sl-drag-over-area-top', 'sl-drag-over-area-bottom');
                delete areaEl.dataset.dropPosition;
                
                const targetCardId = areaEl.dataset.cardId;
                const targetAreaId = areaEl.dataset.areaId;
                if (dragState.areaId === targetAreaId) return;

                const sourceCard = state.cards.find(c => c.id === dragState.cardId);
                const targetCard = state.cards.find(c => c.id === targetCardId);
                if (!targetCard.areas) targetCard.areas = [];
                
                const sourceIdx = sourceCard.areas.findIndex(a => a.id === dragState.areaId);
                
                if (sourceIdx !== -1) {
                    const [moved] = sourceCard.areas.splice(sourceIdx, 1);
                    let targetIdx = targetCard.areas.findIndex(a => a.id === targetAreaId);
                    
                    if (targetIdx !== -1) {
                        if (dropPos === 'bottom') {
                            targetIdx += 1;
                        }
                        targetCard.areas.splice(targetIdx, 0, moved);
                        saveAndRender();
                    } else {
                        targetCard.areas.push(moved);
                        saveAndRender();
                    }
                }
            }
        });
    });
}