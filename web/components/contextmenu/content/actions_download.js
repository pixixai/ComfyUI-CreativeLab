/**
 * 文件名: actions_download.js
 * 路径: web/components/contextmenu/content/actions_download.js
 * 内容：下载、打包下载所有历史
 */
export function bindDownloadActions({
    menuEl,
    selectedAreaObjs,
    getCurrentUrl,
    getHistoryArr,
    getHistoryIdx,
    getHistoryIndexForUrl,
    buildDownloadFilename,
    ensureUniqueDownloadName,
    downloadFile,
} = {}) {
    if (!menuEl) return;

    const downloadEl = menuEl.querySelector("#clab-ctx-download");
    if (downloadEl) {
        downloadEl.onclick = () => {
            menuEl.style.display = "none";
            const usedNames = new Set();
            (selectedAreaObjs || []).forEach((o) => {
                const url = getCurrentUrl(o.area);
                if (!url) return;
                const guessedIdx = getHistoryIdx(o.area);
                const historyIdx = getHistoryIndexForUrl(o.area, url, guessedIdx);
                const baseName = buildDownloadFilename({
                    card: o.card,
                    area: o.area,
                    historyIndex: historyIdx,
                    url,
                });
                const finalName = ensureUniqueDownloadName(baseName, usedNames);
                downloadFile(url, finalName);
            });
        };
    }

    const downloadAllEl = menuEl.querySelector("#clab-ctx-download-all");
    if (downloadAllEl) {
        downloadAllEl.onclick = () => {
            menuEl.style.display = "none";
            const usedNames = new Set();
            (selectedAreaObjs || []).forEach((o) => {
                const arr = getHistoryArr(o.area);
                if (arr.length > 0) {
                    arr.forEach((url, idx) => {
                        if (!url) return;
                        const baseName = buildDownloadFilename({
                            card: o.card,
                            area: o.area,
                            historyIndex: idx,
                            url,
                        });
                        const finalName = ensureUniqueDownloadName(baseName, usedNames);
                        downloadFile(url, finalName);
                    });
                } else if (o.area.resultUrl) {
                    const historyIdx = getHistoryIndexForUrl(o.area, o.area.resultUrl, getHistoryIdx(o.area));
                    const baseName = buildDownloadFilename({
                        card: o.card,
                        area: o.area,
                        historyIndex: historyIdx,
                        url: o.area.resultUrl,
                    });
                    const finalName = ensureUniqueDownloadName(baseName, usedNames);
                    downloadFile(o.area.resultUrl, finalName);
                }
            });
        };
    }
}

