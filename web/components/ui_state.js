/**
 * ui_state.js：全局状态管理器（存放数据和触发重绘的方法）。
 */

// 核心业务状态
export const state = {
    cards: [],
    activeCardId: null,
    selectedCardIds: [], 
    selectedAreaIds: [],
    painterMode: false, // 格式刷模式状态
    painterSource: null // 格式刷的源数据 { type: 'card'|'area', data: {...} }
};

// 拖拽操作的状态机
export const dragState = {
    type: null,
    cardId: null,
    areaId: null
};

// 应用级 UI 状态
export const appState = {
    isBindingMode: false,
    lastClickedCardId: null
};

/**
 * 核心调度方法：保存状态到画布，并触发全局 UI 重绘
 * 组件中修改完 state 后，直接调用此方法即可
 */
export function saveAndRender() {
    // 调用底层暴露的 saveState 方法存入节点
    if (window.ShellLink) window.ShellLink.saveState(state);
    
    // 派发自定义事件，通知 ui_panel.js 执行 performRender
    document.dispatchEvent(new CustomEvent("sl_render_ui"));
}