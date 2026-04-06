/**
 * 文件名: history_helpers.js
 * 路径: web/components/contextmenu/content/history_helpers.js
 * 职责: 获取或比对资源文件当前索引、抽取历史记录列表的纯辅佐函数。
 */
import { normalizeHistoryUrl } from "./shared.js";

export function getHistoryArr(area) {
    return area?.history || area?.historyUrls || area?.results || [];
}

export function getHistoryIdx(area) {
    if (!area) return 0;
    return area.historyIndex !== undefined ? area.historyIndex : (area.currentRecordIndex || 0);
}

export function getCurrentUrl(area) {
    if (!area) return null;
    const arr = getHistoryArr(area);
    const idx = getHistoryIdx(area);
    return area.resultUrl || (arr.length > 0 ? arr[idx] : null);
}

export function getHistoryIndexForUrl(area, url, preferredIdx = -1) {
    const arr = getHistoryArr(area);
    if (!Array.isArray(arr) || arr.length === 0 || !url) return -1;
    if (preferredIdx >= 0 && preferredIdx < arr.length) return preferredIdx;
    const normalized = normalizeHistoryUrl(url);
    const foundIdx = arr.findIndex((item) => normalizeHistoryUrl(item) === normalized);
    return foundIdx >= 0 ? foundIdx : -1;
}
