/**
 * 文件名: comp_taskcard.js
 * 职责: 【组件】负责“任务卡片”列表的 HTML 生成、中线判定拖拽排序与事件交互
 */
import { state, dragState, appState, saveAndRender } from "./ui_state.js";
import { generateAreaHTML } from "./comp_modulearea.js";

// 底部兜底的全局添加任务
function addNewCard() {
    const newCard = { id: 'card_' + Date.now(), title: ``, areas: [] };
    state.cards.push(newCard);
    state.selectedCardIds = [newCard.id];
    state.activeCardId = newCard.id;
    state.selectedAreaIds = []; 
    appState.lastClickedCardId = newCard.id;
    saveAndRender();
    
    setTimeout(() => {
        const container = document.querySelector("#sl-cards-container");
        if (container) container.scrollTo({ left: container.scrollWidth, behavior: 'smooth' });
    }, 50);
}

export function renderCardsList(container) {
    if (!document.getElementById('sl-card-dnd-styles')) {
        const style = document.createElement('style');
        style.id = 'sl-card-dnd-styles';
        style.innerHTML = `
            .sl-drag-over-card-left { border-left: 3px solid #4CAF50 !important; }
            .sl-drag-over-card-right { border-right: 3px solid #4CAF50 !important; }
        `;
        document.head.appendChild(style);
    }

    container.innerHTML = "";
    
    const panelContainer = container.closest('#shell-link-panel');
    if (panelContainer) {
        if (state.painterMode) panelContainer.classList.add('sl-painter-active');
        else panelContainer.classList.remove('sl-painter-active');
    }

    const wrapper = document.createElement("div");
    wrapper.className = "sl-cards-wrapper";
    
    const containerWidth = container.clientWidth > 0 ? container.clientWidth : window.innerWidth * 0.8;
    const innerWidth = containerWidth - 40; 
    const cardsWidth = state.cards.length * 360 - 20; 
    const isOverflowing = cardsWidth >= innerWidth;

    wrapper.style.cssText = `
        display: flex; gap: 20px; position: relative;
        margin-left: ${isOverflowing ? '0' : 'auto'};
        margin-right: ${isOverflowing ? '0' : 'auto'};
        height: 100%; align-items: stretch;
    `;

    if (state.cards.length > 0) {
        state.cards.forEach((card, index) => {
            const cardEl = document.createElement("div");
            const isCardSelected = state.selectedCardIds && state.selectedCardIds.includes(card.id);
            // 修复：生成 HTML 时赋予 active 类名，适配 CSS
            cardEl.className = `sl-card ${isCardSelected ? 'active selected' : ''}`;
            if (isCardSelected) cardEl.style.borderColor = '#4CAF50';
            cardEl.dataset.cardId = card.id;
            cardEl.setAttribute('draggable', 'true');
            
            let areasHtml = (card.areas || []).map(area => generateAreaHTML(area, card)).join('');
            const defaultTitle = `#${index + 1}`;
            const displayTitle = card.title ? card.title : defaultTitle;

            cardEl.innerHTML = `
                <div class="sl-card-title-bar" style="cursor: grab; position: relative;">
                    <input class="sl-card-title-input" type="text" data-id="${card.id}" data-default="${defaultTitle}" value="${displayTitle}" placeholder="${defaultTitle}" size="${Math.max(displayTitle.length, 2)}" style="width: unset; max-width: 240px; min-width: 30px;" />
                    
                    <div class="sl-card-progress-container" data-card-prog-id="${card.id}" style="position: absolute; bottom: -1px; left: 0; right: 0; height: 2px; opacity: 0; transition: opacity 0.3s ease; z-index: 5;">
                        <div class="sl-card-progress-bar" style="height: 100%; width: 0%; background: #4CAF50; transition: width 0.1s ease-out, background-color 0.2s; box-shadow: 0 0 5px rgba(76,175,80,0.5);"></div>
                    </div>
                </div>
                <button class="sl-del-card-btn" data-id="${card.id}" title="删除此任务(若多选则批量删除)">✖</button>
                <div class="sl-card-body" data-card-id="${card.id}">
                    <div class="sl-area-list" data-card-id="${card.id}">${areasHtml}</div>
                </div>
            `;
            wrapper.appendChild(cardEl);
        });
    }

    const inlineAddBtn = document.createElement("div");
    inlineAddBtn.className = "sl-card sl-add-card-inline";
    inlineAddBtn.innerHTML = `<span style="font-size: 32px; color: #ccc; margin-bottom: 15px; font-weight: 300;">+</span><span style="font-size: 16px; color: #ccc;">新建任务</span>`;
    
    if (state.cards.length === 0) {
        inlineAddBtn.style.cssText = `
            display: flex; flex-direction: column; justify-content: center; align-items: center; 
            background: rgba(255,255,255,0.02); border: 2px dashed rgba(255,255,255,0.1); 
            cursor: pointer; flex: 0 0 340px; width: 340px; height: 100%; box-sizing: border-box; 
            opacity: 0.7; transition: all 0.2s; margin: auto;
        `;
        wrapper.appendChild(inlineAddBtn);
    } else {
        inlineAddBtn.style.cssText = `
            display: flex; flex-direction: column; justify-content: center; align-items: center; 
            background: rgba(255,255,255,0.02); border: 2px dashed rgba(255,255,255,0.1); 
            cursor: pointer; flex: 0 0 340px; width: 340px; box-sizing: border-box; 
            opacity: 0.7; transition: all 0.2s;
            position: absolute; left: 100%; top: 0; bottom: 0; margin-left: 20px;
            box-shadow: 20px 0 0 transparent;
        `;
        wrapper.appendChild(inlineAddBtn);
    }
    
    inlineAddBtn.onmouseover = () => {
        inlineAddBtn.style.opacity = '1';
        inlineAddBtn.style.background = 'rgba(255,255,255,0.06)';
        inlineAddBtn.style.borderColor = 'rgba(255,255,255,0.3)';
    };
    inlineAddBtn.onmouseout = () => {
        inlineAddBtn.style.opacity = '0.7';
        inlineAddBtn.style.background = 'rgba(255,255,255,0.02)';
        inlineAddBtn.style.borderColor = 'rgba(255,255,255,0.1)';
    };
    inlineAddBtn.onclick = addNewCard;
    
    container.appendChild(wrapper);
}

export function attachCardEvents(container) {
    container.querySelectorAll('.sl-card-title-input').forEach(input => {
        input.addEventListener('input', function() {
            this.size = Math.max(this.value.length, 2); 
        });

        input.onchange = (e) => {
            const card = state.cards.find(c => c.id === e.target.dataset.id);
            if(card) { 
                const defaultTitle = e.target.dataset.default;
                const currentVal = e.target.value.trim();
                if (currentVal === defaultTitle || currentVal === '') card.title = '';
                else card.title = currentVal; 
                saveAndRender(); 
            }
        };
    });

    container.querySelectorAll('.sl-del-card-btn').forEach(btn => {
        btn.onclick = (e) => {
            const id = e.target.dataset.id;
            let idsToDelete = [id];
            if (state.selectedCardIds && state.selectedCardIds.includes(id) && state.selectedCardIds.length > 1) {
                idsToDelete = [...state.selectedCardIds];
            }
            state.cards = state.cards.filter(c => !idsToDelete.includes(c.id));
            if (state.selectedCardIds) state.selectedCardIds = state.selectedCardIds.filter(selId => !idsToDelete.includes(selId));
            state.activeCardId = (state.selectedCardIds && state.selectedCardIds.length > 0) ? state.selectedCardIds[state.selectedCardIds.length - 1] : null;
            saveAndRender();
        };
    });

    // 🚨 所有的 click/mousedown 全盘铲除，彻底绝后患
    container.querySelectorAll('.sl-card').forEach(cardEl => {
        if (cardEl.classList.contains('sl-add-card-inline')) return;

        cardEl.addEventListener('dragstart', (e) => {
            if (['INPUT', 'TEXTAREA', 'BUTTON'].includes(e.target.tagName) || e.target.closest('.sl-custom-select') || e.target.closest('.sl-edit-val-bool')) {
                e.preventDefault(); return;
            }
            if (e.target.closest('.sl-area')) return; 

            dragState.type = 'card';
            dragState.cardId = cardEl.dataset.cardId;
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', 'card');
            setTimeout(() => cardEl.classList.add('sl-dragging'), 0);
        });

        cardEl.addEventListener('dragend', () => {
            cardEl.classList.remove('sl-dragging');
            document.querySelectorAll('.sl-drag-over-card-left, .sl-drag-over-card-right').forEach(el => {
                el.classList.remove('sl-drag-over-card-left', 'sl-drag-over-card-right');
            });
            dragState.type = null; dragState.cardId = null; dragState.areaId = null;
        });

        cardEl.addEventListener('dragover', (e) => {
            if (dragState.type === 'card' && cardEl.dataset.cardId !== dragState.cardId) {
                e.preventDefault();
                const rect = cardEl.getBoundingClientRect();
                const midX = rect.left + rect.width / 2; 
                
                if (e.clientX < midX) {
                    cardEl.classList.add('sl-drag-over-card-left');
                    cardEl.classList.remove('sl-drag-over-card-right');
                    cardEl.dataset.dropPosition = 'left';
                } else {
                    cardEl.classList.add('sl-drag-over-card-right');
                    cardEl.classList.remove('sl-drag-over-card-left');
                    cardEl.dataset.dropPosition = 'right';
                }
            }
        });

        cardEl.addEventListener('dragleave', (e) => {
            if (!cardEl.contains(e.relatedTarget)) {
                cardEl.classList.remove('sl-drag-over-card-left', 'sl-drag-over-card-right');
                delete cardEl.dataset.dropPosition;
            }
        });

        cardEl.addEventListener('drop', (e) => {
            if (dragState.type === 'card') {
                e.preventDefault(); e.stopPropagation();
                
                const dropPos = cardEl.dataset.dropPosition;
                cardEl.classList.remove('sl-drag-over-card-left', 'sl-drag-over-card-right');
                delete cardEl.dataset.dropPosition;
                
                const targetCardId = cardEl.dataset.cardId;
                if (targetCardId && targetCardId !== dragState.cardId) {
                    const sourceIdx = state.cards.findIndex(c => c.id === dragState.cardId);
                    
                    if (sourceIdx !== -1) {
                        const [moved] = state.cards.splice(sourceIdx, 1);
                        let targetIdx = state.cards.findIndex(c => c.id === targetCardId);
                        
                        if (targetIdx !== -1) {
                            if (dropPos === 'right') targetIdx += 1; 
                            state.cards.splice(targetIdx, 0, moved);
                            saveAndRender();
                        } else {
                            state.cards.push(moved);
                            saveAndRender();
                        }
                    }
                }
            }
        });
    });

    container.querySelectorAll('.sl-card-body').forEach(bodyEl => {
        bodyEl.addEventListener('dragover', (e) => {
            if (dragState.type === 'area') {
                e.preventDefault();
                if (!e.target.closest('.sl-area')) {
                    bodyEl.classList.add('sl-drag-over-list');
                } else {
                    bodyEl.classList.remove('sl-drag-over-list');
                }
            }
        });

        bodyEl.addEventListener('dragleave', (e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) {
                bodyEl.classList.remove('sl-drag-over-list');
            }
        });

        bodyEl.addEventListener('drop', (e) => {
            if (dragState.type === 'area') {
                e.preventDefault(); e.stopPropagation();
                bodyEl.classList.remove('sl-drag-over-list');
                
                if (!e.target.closest('.sl-area')) {
                    const targetCardId = bodyEl.dataset.cardId;
                    if (!targetCardId) return;
                    
                    const sourceCard = state.cards.find(c => c.id === dragState.cardId);
                    const targetCard = state.cards.find(c => c.id === targetCardId);
                    if (!targetCard.areas) targetCard.areas = [];
                    
                    const sourceIdx = sourceCard.areas.findIndex(a => a.id === dragState.areaId);
                    if (sourceIdx !== -1) {
                        const [moved] = sourceCard.areas.splice(sourceIdx, 1);
                        targetCard.areas.push(moved); 
                        saveAndRender();
                    }
                }
            }
        });
    });
}