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
    // 【新增】：动态注入卡片左右半区拖拽高亮的 CSS 样式
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

    // 【新增】：监听包裹层（卡片间隙）的点击事件，实现点击空白处完美取消选中
    wrapper.addEventListener('click', (e) => {
        if (e.target === wrapper) {
            // 先关闭可能打开的下拉菜单
            const openDropdowns = document.querySelectorAll('.sl-custom-select.open');
            if (openDropdowns.length > 0) {
                openDropdowns.forEach(el => el.classList.remove('open'));
                return; 
            }
            
            let changed = false;
            if (state.painterMode) {
                state.painterMode = false;
                state.painterSource = null;
                changed = true;
            }
            if (state.selectedCardIds && state.selectedCardIds.length > 0) {
                state.selectedCardIds = [];
                state.activeCardId = null;
                changed = true;
            }
            if (state.selectedAreaIds && state.selectedAreaIds.length > 0) {
                state.selectedAreaIds = [];
                changed = true;
            }
            if (changed) saveAndRender();
        }
    });

    if (state.cards.length > 0) {
        state.cards.forEach((card, index) => {
            const cardEl = document.createElement("div");
            const isCardSelected = state.selectedCardIds && state.selectedCardIds.includes(card.id);
            cardEl.className = `sl-card ${isCardSelected ? 'active' : ''}`;
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

    container.querySelectorAll('.sl-card').forEach(cardEl => {
        if (cardEl.classList.contains('sl-add-card-inline')) return;

        cardEl.onclick = (e) => {
            if (['BUTTON', 'TEXTAREA', 'INPUT', 'SELECT'].includes(e.target.tagName) || e.target.closest('.sl-custom-select') || e.target.closest('.sl-edit-val-bool')) return;
            
            const cardId = cardEl.dataset.cardId;
            const card = state.cards.find(c => c.id === cardId);

            if (state.painterMode) {
                if (state.painterSource?.type === 'card') {
                    if (state.painterSource.data.id !== card.id) {
                        card.areas = JSON.parse(JSON.stringify(state.painterSource.data.areas));
                        card.areas.forEach(a => a.id = 'area_' + Date.now() + '_' + Math.floor(Math.random() * 1000));
                        saveAndRender();
                    }
                    return; 
                }

                if (state.painterSource?.type === 'area') {
                    let insertIndex = card.areas ? card.areas.length : 0;
                    const areaEls = cardEl.querySelectorAll('.sl-area');
                    for (let i = 0; i < areaEls.length; i++) {
                        const rect = areaEls[i].getBoundingClientRect();
                        if (e.clientY < rect.top + rect.height / 2) {
                            insertIndex = i;
                            break;
                        }
                    }
                    const newArea = JSON.parse(JSON.stringify(state.painterSource.data));
                    newArea.id = 'area_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
                    if (!card.areas) card.areas = [];
                    card.areas.splice(insertIndex, 0, newArea);
                    saveAndRender();
                    return;
                }
            }
            
            if (e.ctrlKey || e.metaKey) {
                if (state.selectedCardIds.includes(card.id)) state.selectedCardIds = state.selectedCardIds.filter(id => id !== card.id);
                else state.selectedCardIds.push(card.id);
                appState.lastClickedCardId = card.id;
            } else if (e.shiftKey && appState.lastClickedCardId) {
                const currentIndex = state.cards.findIndex(c => c.id === card.id);
                const lastIndex = state.cards.findIndex(c => c.id === appState.lastClickedCardId);
                const minIdx = Math.min(currentIndex, lastIndex);
                const maxIdx = Math.max(currentIndex, lastIndex);
                const rangeIds = state.cards.slice(minIdx, maxIdx + 1).map(c => c.id);
                state.selectedCardIds = Array.from(new Set([...state.selectedCardIds, ...rangeIds]));
                appState.lastClickedCardId = card.id;
            } else {
                state.selectedCardIds = [card.id];
                appState.lastClickedCardId = card.id;
            }
            
            state.activeCardId = state.selectedCardIds.length > 0 ? state.selectedCardIds[state.selectedCardIds.length - 1] : null;
            state.selectedAreaIds = []; 
            saveAndRender();
        };

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

        // 【修改】：拖拽结束时清理左右高亮边框类名
        cardEl.addEventListener('dragend', () => {
            cardEl.classList.remove('sl-dragging');
            document.querySelectorAll('.sl-drag-over-card-left, .sl-drag-over-card-right').forEach(el => {
                el.classList.remove('sl-drag-over-card-left', 'sl-drag-over-card-right');
            });
            dragState.type = null; dragState.cardId = null; dragState.areaId = null;
        });

        // 【核心修改】：精准的中线判定逻辑，判定鼠标悬停在卡片左半边还是右半边
        cardEl.addEventListener('dragover', (e) => {
            if (dragState.type === 'card' && cardEl.dataset.cardId !== dragState.cardId) {
                e.preventDefault();
                const rect = cardEl.getBoundingClientRect();
                const midX = rect.left + rect.width / 2; // 计算卡片中线的 X 坐标
                
                if (e.clientX < midX) {
                    // 悬停在左半区：亮起左绿线
                    cardEl.classList.add('sl-drag-over-card-left');
                    cardEl.classList.remove('sl-drag-over-card-right');
                    cardEl.dataset.dropPosition = 'left';
                } else {
                    // 悬停在右半区：亮起右绿线
                    cardEl.classList.add('sl-drag-over-card-right');
                    cardEl.classList.remove('sl-drag-over-card-left');
                    cardEl.dataset.dropPosition = 'right';
                }
            }
        });

        // 离开卡片范围时，清理高亮效果
        cardEl.addEventListener('dragleave', (e) => {
            // 防闪烁处理：确保是真的离开了卡片本身，而不是滑动到了卡片内的子元素上
            if (!cardEl.contains(e.relatedTarget)) {
                cardEl.classList.remove('sl-drag-over-card-left', 'sl-drag-over-card-right');
                delete cardEl.dataset.dropPosition;
            }
        });

        // 【核心修改】：落点时根据中线判定结果，进行前插或后插
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
                        // 1. 先把拖动的卡片从原数组中“抽”出来
                        const [moved] = state.cards.splice(sourceIdx, 1);
                        
                        // 2. 抽离后，目标卡片的索引可能发生偏移，必须重新查找！
                        let targetIdx = state.cards.findIndex(c => c.id === targetCardId);
                        
                        if (targetIdx !== -1) {
                            // 3. 根据左右落点决定插入位置
                            if (dropPos === 'right') {
                                targetIdx += 1; // 插入到目标卡片的后面
                            }
                            // 如果是 left，则保持 targetIdx 原样（即插入到目标卡片的前面）
                            
                            state.cards.splice(targetIdx, 0, moved);
                            saveAndRender();
                        } else {
                            // 兜底保护
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