/**
 * 文件名: event_execution.js
 * 职责: 监听 ComfyUI 执行状态并更新卡片进度条。
 */
import { api } from "../../../../scripts/api.js";

// =====================================================================================
// 🎯 核心 UI 进度条引擎
// =====================================================================================
const setUIProgress = (cardId, percentage, isHide = false, isError = false) => {
    const progContainer = document.querySelector(`.clab-card-progress-container[data-card-prog-id="${cardId}"]`);
    if (!progContainer) return;
    const bar = progContainer.querySelector('.clab-card-progress-bar');
    if (!bar) return;

    if (isError) {
        progContainer.style.opacity = '1';
        bar.classList.add('error');
        bar.style.setProperty('transition', 'none', 'important'); 
        bar.style.setProperty('width', '100%', 'important');
    } else if (isHide) {
        if (!bar.classList.contains('error')) {
            progContainer.style.opacity = '0';
            setTimeout(() => {
                if (!bar.classList.contains('error')) {
                    bar.style.setProperty('transition', 'none', 'important');
                    bar.style.setProperty('width', '0%', 'important');
                }
            }, 300);
        }
    } else {
        progContainer.style.opacity = '1';
        if (!bar.classList.contains('error')) {
            bar.style.setProperty('transition', 'width 0.3s ease-out', 'important');
            bar.style.setProperty('width', `${percentage}%`, 'important');
        }
    }
};

const bumpUIProgress = (cardId) => {
    const bar = document.querySelector(`.clab-card-progress-container[data-card-prog-id="${cardId}"] .clab-card-progress-bar`);
    if (bar && !bar.classList.contains('error')) {
        let currentW = parseFloat(bar.style.width) || 5;
        if (currentW < 90) {
            bar.style.setProperty('transition', 'width 0.3s ease-out', 'important');
            bar.style.setProperty('width', `${currentW + (100 - currentW) * 0.15}%`, 'important');
        }
    }
};

// =====================================================================================
// 🚥 原生事件流水线监听器
// =====================================================================================
export function setupExecutionEvents() {
    let currentExecutingCardId = null;

    document.addEventListener('clab_execution_start', (e) => {
        const tasks = e.detail.tasks || [];
        tasks.forEach(task => {
            const bar = document.querySelector(`.clab-card-progress-container[data-card-prog-id="${task.cardId}"] .clab-card-progress-bar`);
            if (bar) bar.classList.remove('error'); 
            setUIProgress(task.cardId, 5);
        });
    });

    api.addEventListener("execution_start", (e) => {
        const pid = e.detail?.prompt_id;
        if (pid && window.CLab && window._clabLastGeneratedTask && !window._clabTaskMap[pid]) {
            window._clabTaskMap[pid] = window._clabLastGeneratedTask;
            window._clabLastGeneratedTask = null;
        }
        const task = window._clabTaskMap[pid];
        if (task) {
            currentExecutingCardId = task.cardId;
            setUIProgress(task.cardId, 5);
        }
    });

    api.addEventListener("progress_state", (e) => {
        const pid = e.detail?.prompt_id;
        const task = window._clabTaskMap[pid];
        const cardId = task ? task.cardId : currentExecutingCardId;
        if (cardId && e.detail.nodes) {
            let total = 0, done = 0;
            for (const nid in e.detail.nodes) {
                total += e.detail.nodes[nid].max || 0;
                done += e.detail.nodes[nid].value || 0;
            }
            if (total > 0) setUIProgress(cardId, Math.max(5, (done / total) * 100));
        }
    });

    api.addEventListener("progress", (e) => {
        if (currentExecutingCardId) {
            const { value, max } = e.detail;
            if (max > 0) setUIProgress(currentExecutingCardId, Math.max(5, (value / max) * 100));
        }
    });

    api.addEventListener("executing", (e) => {
        const pid = e.detail?.prompt_id;
        const task = window._clabTaskMap[pid];
        const cardId = task ? task.cardId : currentExecutingCardId;
        
        if (cardId) {
            if (e.detail.node) {
                bumpUIProgress(cardId);
            } else {
                setUIProgress(cardId, 100);
                setTimeout(() => setUIProgress(cardId, 0, true), 500);
                if (currentExecutingCardId === cardId) currentExecutingCardId = null;
            }
        }
    });

    const handleCached = (e) => {
        const pid = e.detail?.prompt_id;
        if (pid && !window._clabTaskMap[pid] && window._clabLastGeneratedTask) {
            window._clabTaskMap[pid] = window._clabLastGeneratedTask;
            window._clabLastGeneratedTask = null;
        }
        const task = window._clabTaskMap[pid];
        const cardId = task ? task.cardId : currentExecutingCardId;
        if (cardId) {
            setUIProgress(cardId, 100);
            setTimeout(() => setUIProgress(cardId, 0, true), 500);
        }
    };
    
    api.addEventListener("execution_cached", handleCached);
    api.addEventListener("cached", handleCached);

    api.addEventListener("status", (e) => {
        if (e.detail?.exec_info?.queue_remaining === 0) {
            setTimeout(() => {
                document.querySelectorAll('.clab-card-progress-container').forEach(container => {
                    const bar = container.querySelector('.clab-card-progress-bar');
                    if (bar && !bar.classList.contains('error')) {
                        container.style.opacity = '0';
                        setTimeout(() => {
                            bar.style.setProperty('transition', 'none', 'important');
                            bar.style.setProperty('width', '0%', 'important');
                        }, 300);
                    }
                });
            }, 500);
        }
    });
}
