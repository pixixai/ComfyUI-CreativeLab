/**
 * comp_modulearea.js：【路由器与外壳】负责分发 Input/Output 渲染，管理外壳拖拽。
 */
import { state, dragState, saveAndRender } from "./ui_state.js";
import { injectDnDCSS, bindComboSelectEvents } from "./ui_utils.js";
import { generateInputHTML, attachInputEvents } from "./modules/module_input.js";
import { generateOutputHTML, attachOutputEvents } from "./modules/module_output.js";

export function generateAreaHTML(area, card) {
    if (area.type === 'edit') return generateInputHTML(area, card);
    if (area.type === 'preview') return generateOutputHTML(area, card);
    return '';
}

export function attachAreaEvents(container) {
    injectDnDCSS();
    attachInputEvents(container);
    attachOutputEvents(container);
    bindComboSelectEvents(container, state, saveAndRender);

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

    // 🚨 所有的 click/mousedown 全盘铲除，彻绝冲突
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
                        if (dropPos === 'bottom') targetIdx += 1;
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