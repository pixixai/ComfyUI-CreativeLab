import { state, saveAndRender } from '../ui_state.js';
import { showBindingToast, hideBindingToast } from '../ui_utils.js';
import { getMediaType, loadAllTextHistory, loadSelectedTextContent, loadTextHistoryEntry, removePreviewHistoryIndex, syncTextContentWithSelection } from '../modules/media_types/media_utils.js';

function showMediaMissingFallback(areaId) {
    const areaEl = document.querySelector(`.clab-area[data-area-id="${areaId}"]`);
    if (!areaEl) return;

    const mediaEl = areaEl.querySelector(".clab-preview-img, .clab-media-target, video, audio, img");
    if (!mediaEl) return;

    mediaEl.style.display = "none";
    const parent = mediaEl.parentElement;
    if (parent && !parent.querySelector(".clab-media-dead-fallback")) {
        parent.insertAdjacentHTML("beforeend", `
            <div class="clab-media-dead-fallback" style="position:absolute; inset:0; display:flex; flex-direction:column; justify-content:center; align-items:center; background:#1e1e1e; color:#ff5555; z-index:10; pointer-events:none;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                <span style="font-size:10px; margin-top:4px; color:#ccc;">Media Missing</span>
            </div>
        `);
    }
}

async function probeMissingAndFallback(areaProbes) {
    const checks = areaProbes.map(async (item) => {
        if (!item || !item.url) return;
        try {
            const res = await fetch(item.url, { method: "HEAD", cache: "no-store" });
            if (!res.ok && res.status === 404) showMediaMissingFallback(item.areaId);
        } catch (_) {
            // ignore transient network errors here
        }
    });
    await Promise.all(checks);
}

export async function resyncRecords() {
    showBindingToast("🔄 正在强制重新拉取本地资产...", false);
    const now = Date.now();
    let syncCount = 0;
    const areaProbes = [];
    const textReloadTasks = [];
    state.cards.forEach(card => {
        card.areas?.filter(a => a.type === 'preview').forEach(area => {
            if (area.history && area.history.length > 0) {
                area.history = area.history.map(url => {
                    if (!url) return url;
                    try {
                        const urlObj = new URL(url, window.location.origin);
                        urlObj.searchParams.set('t', now);
                        syncCount++;
                        return urlObj.pathname + urlObj.search;
                    } catch(e) { return url; }
                });
            }
            if (area.resultUrl) {
                try {
                    const urlObj = new URL(area.resultUrl, window.location.origin);
                    urlObj.searchParams.set('t', now);
                    area.resultUrl = urlObj.pathname + urlObj.search;
                    areaProbes.push({ areaId: area.id, url: area.resultUrl });
                } catch(e) {}
            }
            syncTextContentWithSelection(area);
            if (area.history?.some(url => getMediaType(url) === "text")) {
                textReloadTasks.push(loadAllTextHistory(area, { force: true, refresh: false }));
            }
        });
    });
    if (syncCount === 0) {
        hideBindingToast();
        return alert("当前面板没有任何媒体记录需要同步。");
    }
    if (textReloadTasks.length > 0) {
        await Promise.all(textReloadTasks);
    }
    saveAndRender();
    if (areaProbes.length > 0) {
        // Proactively probe refreshed URLs so deleted videos immediately show missing state.
        await probeMissingAndFallback(areaProbes);
    }
    showBindingToast("✅ 缓存已清理，所有输出模块已重新加载媒体！");
    setTimeout(hideBindingToast, 2000);
}

export async function cleanDeadRecords() {
    showBindingToast("🔍 正在扫描失效记录，请稍候...", false);
    const areaMap = [];
    state.cards.forEach(card => {
        card.areas?.filter(a => a.type === 'preview').forEach(area => {
            if (area.history && area.history.length > 0) {
                area.history.forEach((url, index) => {
                    if (url) areaMap.push({ areaId: area.id, url: url, index });
                });
            }
        });
    });

    if (areaMap.length === 0) {
        hideBindingToast();
        return alert("当前面板没有任何有效的生成记录需要清理。");
    }
    const deadItems = [];
    const checkPromises = areaMap.map(async (item) => {
        try {
            const area = state.cards.flatMap(c => c.areas || []).find(a => a.id === item.areaId);
            if (!area) return;
            if (getMediaType(item.url) === "text") {
                await loadTextHistoryEntry(area, item.index, { force: true, refresh: false });
                if ((area.textHistoryStatus?.[item.index] || "") === "missing") deadItems.push(item);
                return;
            }
            const res = await fetch(item.url, { method: 'HEAD', cache: 'no-store' });
            if (!res.ok && res.status === 404) deadItems.push(item);
        } catch (e) {}
    });
    await Promise.all(checkPromises);
    if (deadItems.length === 0) {
        showBindingToast("✨ 扫描完毕：所有本地资产均完好无损！");
    } else {
        deadItems.forEach(item => {
            state.cards.forEach(c => {
                const area = c.areas?.find(a => a.id === item.areaId);
                if (area && area.history) {
                    const idx = area.history.indexOf(item.url);
                    if (idx !== -1) {
                        removePreviewHistoryIndex(area, idx);
                    }
                }
            });
        });

        // 【核心修复】：安全重算所有受影响模块的 index 和封面，并默认回退到最后一张
        const affectedAreaIds = [...new Set(deadItems.map(item => item.areaId))];
        state.cards.forEach(c => {
            c.areas?.forEach(area => {
                if (affectedAreaIds.includes(area.id) && area.history) {
                    let activeIdx = area.history.indexOf(area.resultUrl);
                    // 如果它当前显示的 URL 被删了，或者干脆找不到了，直接回退到最新的一张（末尾）
                    if (activeIdx === -1) {
                        activeIdx = Math.max(0, area.history.length - 1);
                        area.resultUrl = area.history.length > 0 ? area.history[activeIdx] : "";
                    }
                    area.historyIndex = activeIdx;
                    if (area.currentRecordIndex !== undefined) area.currentRecordIndex = activeIdx;
                    syncTextContentWithSelection(area);
                    void loadSelectedTextContent(area, { refresh: false });

                    // 触发局部更新
                    if (window._clabSurgicallyUpdateArea) window._clabSurgicallyUpdateArea(area.id);
                }
            });
        });

        // 进行状态保存
        if (window._clabJustSave) window._clabJustSave(); else saveAndRender();
        showBindingToast(`🧹 清理完成：已彻底剔除 ${deadItems.length} 条丢失记录。`);
    }
    setTimeout(hideBindingToast, 3000);
}
