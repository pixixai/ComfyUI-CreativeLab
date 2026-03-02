/**
 * 文件名: action_run_executor.js
 * 路径: web/components/actions/action_run_executor.js
 * 职责: 负责任务队列编译算法、运行按钮交互分发
 */
import { state } from "../ui_state.js";
import { app } from "../../../../scripts/app.js";

// 【核心任务编译器】：根据用户的严格规则，将任意选中状态编译为单卡片执行队列
export function buildTasksQueue(isRunAll = false) {
    const tasks = [];

    if (isRunAll) {
        state.cards.forEach(card => {
            const previewAreaIds = card.areas?.filter(a => a.type === 'preview').map(a => a.id) || [];
            if (previewAreaIds.length > 0) tasks.push({ cardId: card.id, previewAreaIds });
        });
        return tasks;
    }

    const selectedPreviewAreaIds = state.selectedAreaIds.filter(id => {
        for (let c of state.cards) if (c.areas?.some(a => a.id === id && a.type === 'preview')) return true;
        return false;
    });

    if (selectedPreviewAreaIds.length > 0) {
        state.cards.forEach(card => {
            const pIds = card.areas?.filter(a => selectedPreviewAreaIds.includes(a.id)).map(a => a.id) || [];
            if (pIds.length > 0) tasks.push({ cardId: card.id, previewAreaIds: pIds });
        });
        return tasks;
    }

    let cardsToRun = new Set();
    const selectedInputAreaIds = state.selectedAreaIds.filter(id => {
        for (let c of state.cards) if (c.areas?.some(a => a.id === id && a.type === 'edit')) return true;
        return false;
    });

    if (selectedInputAreaIds.length > 0) {
        state.cards.forEach(card => {
            if (card.areas?.some(a => selectedInputAreaIds.includes(a.id))) cardsToRun.add(card.id);
        });
    }

    if (state.selectedCardIds && state.selectedCardIds.length > 0) {
        state.selectedCardIds.forEach(id => cardsToRun.add(id));
    }

    if (cardsToRun.size === 0 && state.activeCardId) {
        cardsToRun.add(state.activeCardId);
    }

    cardsToRun.forEach(cardId => {
        const card = state.cards.find(c => c.id === cardId);
        if (card) {
            const previewAreaIds = card.areas?.filter(a => a.type === 'preview').map(a => a.id) || [];
            if (previewAreaIds.length > 0) tasks.push({ cardId: card.id, previewAreaIds });
        }
    });

    return tasks;
}

export function attachRunEvents(panelContainer) {
    const runWrapper = panelContainer.querySelector("#sl-run-btn-wrapper");
    if (runWrapper) {
        const toggleBtn = runWrapper.querySelector("#sl-run-dropdown-toggle");
        const dropdown = runWrapper.querySelector("#sl-run-dropdown-menu");

        toggleBtn.onclick = (e) => {
            e.stopPropagation();
            const isVisible = dropdown.style.display === 'block';
            document.querySelectorAll('.sl-custom-select-dropdown').forEach(d => d.style.display = 'none');
            dropdown.style.display = isVisible ? 'none' : 'block';
        };
    }

    panelContainer.querySelector("#sl-btn-run").onclick = () => {
        const tasksToRunQueue = buildTasksQueue(false);

        if (tasksToRunQueue.length === 0) {
            return alert("当前选中项没有可执行的输出模块！请检查是否添加了输出模块。");
        }
        
        console.log("[ShellLink] 局部运行 - 已成功编译执行队列:", tasksToRunQueue);
        document.dispatchEvent(new CustomEvent('sl_execution_start', { detail: { tasks: tasksToRunQueue } }));

        if (window.ShellLink && window.ShellLink.executeTasks) {
            window.ShellLink.executeTasks(tasksToRunQueue);
        } else if (app.queuePrompt) {
            app.queuePrompt(0, 1);
        }
    };

    panelContainer.querySelector("#sl-btn-run-all").onclick = (e) => {
        e.stopPropagation();
        const dropdown = panelContainer.querySelector("#sl-run-dropdown-menu");
        if (dropdown) dropdown.style.display = 'none';

        if (!state.cards || state.cards.length === 0) return alert("面板中没有任何任务卡片！");

        const tasksToRunQueue = buildTasksQueue(true);
        if (tasksToRunQueue.length === 0) return alert("所有卡片均无输出模块，无法执行。");
        
        console.log("[ShellLink] 运行全部 - 已成功编译执行队列:", tasksToRunQueue);
        document.dispatchEvent(new CustomEvent('sl_execution_start', { detail: { tasks: tasksToRunQueue } }));

        if (window.ShellLink && window.ShellLink.executeTasks) {
            window.ShellLink.executeTasks(tasksToRunQueue);
        } else {
            alert("API 拦截器尚未加载完毕，请稍后再试！");
        }
    };
}