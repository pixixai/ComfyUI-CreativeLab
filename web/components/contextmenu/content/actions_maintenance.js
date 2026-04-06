/**
 * 文件名: actions_maintenance.js
 * 路径: web/components/contextmenu/content/actions_maintenance.js
 * 内容：清理失效记录、重新同步
 */
export function bindMaintenanceActions({
    menuEl,
    selectedAreaObjs,
    getHistoryArr,
    getMediaType,
    loadTextHistoryEntry,
    removePreviewHistoryIndex,
    syncTextContentWithSelection,
    loadSelectedTextContent,
    saveAndRender,
    loadAllTextHistory,
    probeMissingAndFallback,
    showAutoToast,
} = {}) {
    if (!menuEl) return;

    const cleanDeadEl = menuEl.querySelector("#clab-ctx-clean-dead");
    if (cleanDeadEl) {
        cleanDeadEl.onclick = async () => {
            menuEl.style.display = "none";
            showAutoToast("正在扫描失效记录，请稍候...", false);

            let totalChecked = 0;
            const checkPromises = [];

            (selectedAreaObjs || []).forEach((o) => {
                const arr = getHistoryArr(o.area);
                if (arr && arr.length > 0) {
                    arr.forEach((url, index) => {
                        if (!url) return;
                        totalChecked++;
                        if (getMediaType(url) === "text") {
                            const p = (async () => {
                                await loadTextHistoryEntry(o.area, index, { force: true, refresh: false });
                                return (o.area.textHistoryStatus?.[index] || "") === "missing"
                                    ? { area: o.area, url: url }
                                    : null;
                            })();
                            checkPromises.push(p);
                            return;
                        }
                        const p = fetch(url, { method: "HEAD", cache: "no-store" }).then((res) => {
                            if (!res.ok && res.status === 404) {
                                return { area: o.area, url: url };
                            }
                            return null;
                        }).catch(() => null);
                        checkPromises.push(p);
                    });
                }
            });

            if (totalChecked === 0) {
                showAutoToast("No valid generated records to clean in selected modules.");
                return;
            }

            const results = await Promise.all(checkPromises);
            const deadItems = results.filter((item) => item !== null);

            if (deadItems.length === 0) {
                showAutoToast("Scan completed: all selected local assets are healthy.");
            } else {
                deadItems.forEach((item) => {
                    const area = item.area;
                    const arr = getHistoryArr(area);
                    if (arr) {
                        const idx = arr.indexOf(item.url);
                        if (idx !== -1) {
                            removePreviewHistoryIndex(area, idx);
                            if (area.resultUrl === item.url) {
                                area.resultUrl = arr.length > 0 ? arr[0] : "";
                                if (area.historyIndex !== undefined) area.historyIndex = 0;
                                if (area.currentRecordIndex !== undefined) area.currentRecordIndex = 0;
                            }
                        }
                    }
                });

                (selectedAreaObjs || []).forEach((o) => {
                    syncTextContentWithSelection(o.area);
                    void loadSelectedTextContent(o.area, { refresh: false });
                    if (window._clabSurgicallyUpdateArea) window._clabSurgicallyUpdateArea(o.area.id);
                });
                if (window._clabJustSave) window._clabJustSave(); else saveAndRender();

                showAutoToast(`清理完成：已移除 ${deadItems.length} 条失效记录。`);
            }
        };
    }

    const resyncEl = menuEl.querySelector("#clab-ctx-resync");
    if (resyncEl) {
        resyncEl.onclick = async () => {
            menuEl.style.display = "none";
            showAutoToast("正在强制重新拉取选中模块的本地资源...", false);
            const now = Date.now();
            let syncCount = 0;
            const areaProbes = [];
            const textReloadTasks = [];

            (selectedAreaObjs || []).forEach((o) => {
                if (o.area.history && o.area.history.length > 0) {
                    o.area.history = o.area.history.map((url) => {
                        if (!url) return url;
                        try {
                            const urlObj = new URL(url, window.location.origin);
                            urlObj.searchParams.set("t", now);
                            syncCount++;
                            return urlObj.pathname + urlObj.search;
                        } catch (_) {
                            return url;
                        }
                    });
                }
                if (o.area.resultUrl) {
                    try {
                        const urlObj = new URL(o.area.resultUrl, window.location.origin);
                        urlObj.searchParams.set("t", now);
                        o.area.resultUrl = urlObj.pathname + urlObj.search;
                        areaProbes.push({ areaId: o.area.id, url: o.area.resultUrl });
                    } catch (_) { }
                }
                syncTextContentWithSelection(o.area);
                if (o.area.history?.some((url) => getMediaType(url) === "text")) {
                    textReloadTasks.push(loadAllTextHistory(o.area, { force: true, refresh: false }));
                }

                if (window._clabSurgicallyUpdateArea) window._clabSurgicallyUpdateArea(o.area.id);
            });

            if (syncCount === 0) {
                showAutoToast("No media records need re-sync in selected modules.");
                return;
            }

            if (textReloadTasks.length > 0) {
                await Promise.all(textReloadTasks);
            }
            if (window._clabJustSave) window._clabJustSave(); else saveAndRender();
            if (areaProbes.length > 0) {
                await probeMissingAndFallback(areaProbes);
            }
            showAutoToast("缓存已清理，选中输出模块已重新加载媒体。");
        };
    }
}

