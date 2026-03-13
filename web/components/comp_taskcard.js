/**
 * 文件名: comp_taskcard.js
 * 职责: 【组件】负责“任务卡片”列表的 HTML 生成、局部物理拖拽与单点重绘
 */
import { state, dragState, appState } from "./ui_state.js";
// 【注入】：引入 attachAreaEvents 以便克隆时对新生 DOM 原地施放事件绑定魔法
import { generateAreaHTML, syncAreaDOMOrder, justSave, attachAreaEvents } from "./comp_modulearea.js";
import { updateSelectionUI } from "./ui_selection.js";

// 【全新动态布局引擎】：同步精确计算纯卡片宽度，控制自适应居中与左对齐
export function updateCardsLayout() {
    const container = document.querySelector('#clab-cards-container');
    const wrapper = document.querySelector('.clab-cards-wrapper');
    if (!container || !wrapper) return;

    const cardEls = wrapper.querySelectorAll('.clab-card');
    const count = cardEls.length;
    
    // 【核心修复 1】：彻底抛弃 20ms 的 setTimeout 异步等待！
    // 刚插入的卡片就算没被浏览器绘制出 offsetWidth 也没关系，
    // 我们直接抓取面板配置的 CSS 绝对宽度，做到“未卜先知”的 0 延迟同步排版！
    let cardWidth = 340; 
    const panel = document.getElementById('clab-panel');
    if (panel) {
        const cssVal = parseInt(getComputedStyle(panel).getPropertyValue('--clab-card-width'));
        if (!isNaN(cssVal) && cssVal > 0) {
            cardWidth = cssVal;
        } else if (cardEls.length > 0 && cardEls[0].offsetWidth > 0) {
            cardWidth = cardEls[0].offsetWidth;
        }
    }

    const gap = 20;
    const totalWidth = count > 0 ? (count * cardWidth + (count - 1) * gap) : 0;

    // 核心排版：如果连卡片都没有，直接占满；如果有，严丝合缝地包裹
    if (totalWidth === 0) {
        wrapper.style.width = '100%';
        wrapper.style.flex = '1';
        wrapper.style.margin = '0';
        return;
    }

    wrapper.style.width = `${totalWidth}px`;
    wrapper.style.flex = 'none';

    const containerWidth = container.clientWidth > 0 ? container.clientWidth : window.innerWidth * 0.8;
    
    // 判断溢出时减去 40px 的安全内边距
    if (totalWidth >= containerWidth - 40) {
        wrapper.style.margin = '0'; // 溢出时靠左，允许滚动
    } else {
        wrapper.style.margin = '0 auto'; // 未溢出时完美纯净居中
    }
}
window._clabUpdateCardsLayout = updateCardsLayout;

export function generateSingleCardHTML(card, index) {
    const isCardSelected = state.selectedCardIds && state.selectedCardIds.includes(card.id);
    const borderStyle = isCardSelected ? 'border-color: var(--clab-theme-card, #4CAF50);' : '';
    const activeClass = isCardSelected ? 'active selected' : '';
    let areasHtml = (card.areas || []).map(area => generateAreaHTML(area, card)).join('');
    const defaultTitle = `#${index + 1}`;
    const displayTitle = card.title ? card.title : defaultTitle;

    // 【主题引擎支持】：进度条背景与发光色接入 CSS 变量
    return `
        <div class="clab-card ${activeClass}" style="${borderStyle}" data-card-id="${card.id}" draggable="true">
            <div class="clab-card-title-bar" style="cursor: grab; position: relative;">
                <input class="clab-card-title-input" type="text" data-id="${card.id}" data-default="${defaultTitle}" value="${displayTitle}" placeholder="${defaultTitle}" size="${Math.max(displayTitle.length, 2)}" style="width: unset; max-width: 240px; min-width: 30px;" />
                
                <div class="clab-card-progress-container" data-card-prog-id="${card.id}" style="position: absolute; bottom: -1px; left: 0; right: 0; height: 2px; opacity: 0; transition: opacity 0.3s ease; z-index: 5;">
                    <div class="clab-card-progress-bar" style="height: 100%; width: 0%; background: var(--clab-theme-card, #4CAF50); transition: width 0.1s ease-out, background-color 0.2s; box-shadow: 0 0 5px var(--clab-theme-card-alpha, rgba(76,175,80,0.5));"></div>
                </div>
            </div>
            <button class="clab-del-card-btn" data-id="${card.id}" title="删除此任务(若多选则批量删除)">✖</button>
            <div class="clab-card-body" data-card-id="${card.id}">
                <div class="clab-area-list" data-card-id="${card.id}">${areasHtml}</div>
            </div>
        </div>
    `;
}

export function renderCardsList(container) {
    if (!document.getElementById('clab-card-dnd-styles')) {
        const style = document.createElement('style');
        style.id = 'clab-card-dnd-styles';
        // 【主题引擎支持】：拖拽的边缘高亮也会随您的主题色变幻！
        style.innerHTML = `
            .clab-drag-over-card-left { border-left: 3px solid var(--clab-theme-card, #4CAF50) !important; }
            .clab-drag-over-card-right { border-right: 3px solid var(--clab-theme-card, #4CAF50) !important; }
        `;
        document.head.appendChild(style);
    }

    container.innerHTML = "";
    
    const panelContainer = container.closest('#clab-panel');
    if (panelContainer) {
        if (state.painterMode) panelContainer.classList.add('clab-painter-active');
        else panelContainer.classList.remove('clab-painter-active');
    }

    const wrapper = document.createElement("div");
    wrapper.className = "clab-cards-wrapper";
    
    wrapper.style.cssText = `
        display: flex; gap: 20px; position: relative;
        height: 100%; align-items: stretch;
    `;

    if (state.cards.length > 0) {
        state.cards.forEach((card, index) => {
            const temp = document.createElement('div');
            temp.innerHTML = generateSingleCardHTML(card, index);
            wrapper.appendChild(temp.firstElementChild);
        });
    }

    container.appendChild(wrapper);
    
    if (window._clabUpdateCardsLayout) window._clabUpdateCardsLayout();
}

export function attachCardEvents(container) {
    container.querySelectorAll('.clab-card-title-input').forEach(input => {
        if (input.dataset.clabEventsBound) return;
        input.dataset.clabEventsBound = "1";

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
                justSave(); 
            }
        };
    });

    container.querySelectorAll('.clab-del-card-btn').forEach(btn => {
        if (btn.dataset.clabEventsBound) return;
        btn.dataset.clabEventsBound = "1";

        btn.onclick = (e) => {
            const id = e.target.dataset.id;
            let idsToDelete = [id];
            if (state.selectedCardIds && state.selectedCardIds.includes(id) && state.selectedCardIds.length > 1) {
                idsToDelete = [...state.selectedCardIds];
            }
            state.cards = state.cards.filter(c => !idsToDelete.includes(c.id));
            if (state.selectedCardIds) state.selectedCardIds = state.selectedCardIds.filter(selId => !idsToDelete.includes(selId));
            state.activeCardId = (state.selectedCardIds && state.selectedCardIds.length > 0) ? state.selectedCardIds[state.selectedCardIds.length - 1] : null;
            
            idsToDelete.forEach(delId => {
                const el = document.querySelector(`.clab-card[data-card-id="${delId}"]`);
                if (el) el.remove();
            });
            justSave();
            updateSelectionUI();
            if (window._clabUpdateAllDefaultTitles) window._clabUpdateAllDefaultTitles(); 
            
            if (window._clabUpdateCardsLayout) window._clabUpdateCardsLayout();
        };
    });

    container.querySelectorAll('.clab-card').forEach(cardEl => {
        if (cardEl.dataset.clabEventsBound) return;
        cardEl.dataset.clabEventsBound = "1";

        cardEl.addEventListener('dragstart', (e) => {
            if (['INPUT', 'TEXTAREA', 'BUTTON'].includes(e.target.tagName) || e.target.closest('.clab-custom-select') || e.target.closest('.clab-edit-val-bool')) {
                e.preventDefault(); return;
            }
            if (e.target.closest('.clab-area')) return; 

            const currentCardId = cardEl.dataset.cardId;

            let draggedIds = [currentCardId];
            if (state.selectedCardIds && state.selectedCardIds.includes(currentCardId)) {
                draggedIds = [...state.selectedCardIds];
            }

            dragState.type = 'card';
            dragState.cardIds = draggedIds; 
            e.dataTransfer.effectAllowed = 'copyMove'; // 【修改】：允许拖拽呈现为复制
            e.dataTransfer.setData('text/plain', 'card');
            
            setTimeout(() => {
                draggedIds.forEach(id => {
                    const el = document.querySelector(`.clab-card[data-card-id="${id}"]`);
                    if (el) el.classList.add('clab-dragging');
                });
            }, 0);
        });

        cardEl.addEventListener('dragend', () => {
            document.querySelectorAll('.clab-dragging').forEach(el => el.classList.remove('clab-dragging'));
            document.querySelectorAll('.clab-drag-over-card-left, .clab-drag-over-card-right').forEach(el => {
                el.classList.remove('clab-drag-over-card-left', 'clab-drag-over-card-right');
            });
            dragState.type = null; dragState.cardIds = null; dragState.areaIds = null; dragState.isClone = false;
        });

        cardEl.addEventListener('dragover', (e) => {
            const isClone = e.altKey; // 【注入】：检测 Alt 键复制模式
            if (dragState.type === 'card' && dragState.cardIds && (!dragState.cardIds.includes(cardEl.dataset.cardId) || isClone)) {
                e.preventDefault();
                e.dataTransfer.dropEffect = isClone ? 'copy' : 'move'; // 【注入】：让光标变成克隆的加号

                const rect = cardEl.getBoundingClientRect();
                const midX = rect.left + rect.width / 2; 
                
                if (e.clientX < midX) {
                    cardEl.classList.add('clab-drag-over-card-left');
                    cardEl.classList.remove('clab-drag-over-card-right');
                    cardEl.dataset.dropPosition = 'left';
                } else {
                    cardEl.classList.add('clab-drag-over-card-right');
                    cardEl.classList.remove('clab-drag-over-card-left');
                    cardEl.dataset.dropPosition = 'right';
                }
            }
        });

        cardEl.addEventListener('dragleave', (e) => {
            if (!cardEl.contains(e.relatedTarget)) {
                cardEl.classList.remove('clab-drag-over-card-left', 'clab-drag-over-card-right');
                delete cardEl.dataset.dropPosition;
            }
        });

        cardEl.addEventListener('drop', (e) => {
            if (dragState.type === 'card' && dragState.cardIds) {
                e.preventDefault(); e.stopPropagation();
                
                const dropPos = cardEl.dataset.dropPosition;
                cardEl.classList.remove('clab-drag-over-card-left', 'clab-drag-over-card-right');
                delete cardEl.dataset.dropPosition;
                
                const targetCardId = cardEl.dataset.cardId;
                const isClone = e.altKey; // 【核心注入】：判断是否为克隆模式

                if (targetCardId && (!dragState.cardIds.includes(targetCardId) || isClone)) {
                    
                    const movedCards = [];
                    const remainingCards = [];

                    state.cards.forEach((c, cIdx) => {
                        if (dragState.cardIds.includes(c.id)) {
                            if (isClone) {
                                // 深度拷贝生成全新克隆体（无损保留所有原图与设置）
                                const cloned = JSON.parse(JSON.stringify(c));
                                cloned.id = 'card_clone_' + Date.now() + '_' + Math.floor(Math.random() * 10000) + '_' + cIdx;
                                if (cloned.areas) {
                                    cloned.areas.forEach((a, aIdx) => {
                                        a.id = 'area_clone_' + Date.now() + '_' + Math.floor(Math.random() * 10000) + '_' + cIdx + '_' + aIdx;
                                    });
                                }
                                movedCards.push(cloned);
                                remainingCards.push(c); // 原件不动！
                            } else {
                                movedCards.push(c);
                            }
                        } else {
                            remainingCards.push(c);
                        }
                    });
                    
                    if (!isClone) state.cards = remainingCards;
                    
                    let targetIdx = state.cards.findIndex(c => c.id === targetCardId);
                    const wrapper = cardEl.parentElement;

                    if (targetIdx !== -1) {
                        if (dropPos === 'right') targetIdx += 1; 
                        state.cards.splice(targetIdx, 0, ...movedCards);
                    } else {
                        state.cards.push(...movedCards);
                    }

                    // 【核心逻辑】：克隆时，提前为您原地生成全新的 DOM！
                    if (isClone) {
                        movedCards.forEach(c => {
                            const temp = document.createElement('div');
                            temp.innerHTML = generateSingleCardHTML(c, state.cards.indexOf(c));
                            wrapper.appendChild(temp.firstElementChild); // 先挂载到最后
                        });
                    }

                    // 基于最新的状态索引安全排序并追加 DOM
                    state.cards.forEach(c => {
                        const el = wrapper.querySelector(`.clab-card[data-card-id="${c.id}"]`);
                        if (el) wrapper.appendChild(el);
                    });

                    // 给克隆出的新生儿施加点击和交互魔法
                    if (isClone) {
                        attachCardEvents(wrapper);
                        movedCards.forEach(c => {
                            const el = wrapper.querySelector(`.clab-card[data-card-id="${c.id}"]`);
                            if (el) attachAreaEvents(el);
                        });
                        
                        // 【新增】：将选中状态与激活焦点转移到新克隆出的卡片上
                        state.selectedCardIds = movedCards.map(c => c.id);
                        if (state.selectedCardIds.length > 0) {
                            state.activeCardId = state.selectedCardIds[state.selectedCardIds.length - 1];
                        }
                        updateSelectionUI();
                    }
                    
                    justSave();
                    if (window._clabUpdateAllDefaultTitles) window._clabUpdateAllDefaultTitles();
                    
                    // 【居中偏移修正】：因为我们采用的是局部 DOM 注入，避开了全局刷新，
                    // 所以必须在此刻手动呼叫布局排版引擎，重新计算卡片总数以更新容器的居中宽度！
                    if (window._clabUpdateCardsLayout) window._clabUpdateCardsLayout();
                }
            }
        });
    });

    container.querySelectorAll('.clab-card-body').forEach(bodyEl => {
        if (bodyEl.dataset.clabEventsBound) return;
        bodyEl.dataset.clabEventsBound = "1";

        bodyEl.addEventListener('dragover', (e) => {
            if (dragState.type === 'area' && dragState.areaIds) {
                e.preventDefault();
                e.dataTransfer.dropEffect = e.altKey ? 'copy' : 'move'; // 【注入】：将外部悬浮的图标改成+号

                if (!e.target.closest('.clab-area')) {
                    bodyEl.classList.add('clab-drag-over-list');
                } else {
                    bodyEl.classList.remove('clab-drag-over-list');
                }
            }
        });

        bodyEl.addEventListener('dragleave', (e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) {
                bodyEl.classList.remove('clab-drag-over-list');
            }
        });

        bodyEl.addEventListener('drop', (e) => {
            if (dragState.type === 'area' && dragState.areaIds) {
                e.preventDefault(); e.stopPropagation();
                bodyEl.classList.remove('clab-drag-over-list');
                
                if (!e.target.closest('.clab-area')) {
                    const targetCardId = bodyEl.dataset.cardId;
                    if (!targetCardId) return;
                    
                    const isClone = e.altKey; // 【注入】：判断是否克隆
                    const movedAreas = [];

                    state.cards.forEach((c, cIdx) => {
                        if (!c.areas) return;
                        const remaining = [];
                        c.areas.forEach((a, aIdx) => {
                            if (dragState.areaIds.includes(a.id)) {
                                if (isClone) {
                                    const cloned = JSON.parse(JSON.stringify(a));
                                    cloned.id = 'area_clone_' + Date.now() + '_' + Math.floor(Math.random() * 10000) + '_' + cIdx + '_' + aIdx;
                                    movedAreas.push(cloned);
                                    remaining.push(a); // 原件不动！
                                } else {
                                    movedAreas.push(a);
                                }
                            } else {
                                remaining.push(a);
                            }
                        });
                        if (!isClone) c.areas = remaining;
                        if (!isClone) syncAreaDOMOrder(c.id, c.areas);
                    });
                    
                    const targetCard = state.cards.find(c => c.id === targetCardId);
                    if (!targetCard.areas) targetCard.areas = [];
                    targetCard.areas.push(...movedAreas); 

                    // 【注入】：克隆模块到空白卡片时生成全新的 DOM！
                    if (isClone) {
                        movedAreas.forEach(a => {
                            const temp = document.createElement('div');
                            temp.innerHTML = generateAreaHTML(a, targetCard);
                            bodyEl.querySelector('.clab-area-list').appendChild(temp.firstElementChild);
                        });
                        attachAreaEvents(bodyEl.querySelector('.clab-area-list'));
                        
                        // 【新增】：将选中状态转移到新克隆出的模块上
                        state.selectedAreaIds = movedAreas.map(a => a.id);
                        updateSelectionUI();
                    }

                    syncAreaDOMOrder(targetCardId, targetCard.areas);
                    
                    if (window._clabUpdateAreaDOMIdentity) movedAreas.forEach(a => window._clabUpdateAreaDOMIdentity(a.id, targetCardId));

                    justSave();
                    if (window._clabUpdateAllDefaultTitles) window._clabUpdateAllDefaultTitles(); 
                }
            }
        });
    });
}