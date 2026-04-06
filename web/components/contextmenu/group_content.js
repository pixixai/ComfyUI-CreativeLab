/**
 * 文件名: group_content.js
 * 路径: web/components/contextmenu/group_content.js
 * 职责: 内容分组菜单渲染 + 事件绑定协调（业务逻辑已拆分至 content/* 子模块）
 */
import { state, saveAndRender } from "../ui_state.js";
import {
    clearPreviewHistory,
    ensureTextAreaState,
    getMediaType,
    loadAllTextHistory,
    loadSelectedTextContent,
    loadTextHistoryEntry,
    removePreviewHistoryIndex,
    syncTextContentWithSelection,
} from "../modules/media_types/media_utils.js";
import { ensureUniqueDownloadName } from "./content/shared.js";
import { createPreviewModalApi } from "./content/preview_modal.js";
import { createEditorLogic } from "./content/editor_logic.js";
import { bindOpenActions } from "./content/actions_open.js";
import { bindDownloadActions } from "./content/actions_download.js";
import { bindHistoryActions } from "./content/actions_history.js";
import { bindMaintenanceActions } from "./content/actions_maintenance.js";
import {
    getHistoryArr,
    getHistoryIdx,
    getCurrentUrl,
    getHistoryIndexForUrl,
} from "./content/history_helpers.js";
import {
    showAutoToast,
    probeMissingAndFallback,
    buildDownloadFilename,
    downloadFile,
    parseApiResponse,
    openAssetWithSystem,
} from "./content/runtime_services.js";
import { setupAudioWaveform } from "./content/audio_waveform.js";

const {
    bindPreviewTextEditor,
    getPreviewTextState,
    renderPreviewTextHtml,
} = createEditorLogic({
    state,
    saveAndRender,
    ensureTextAreaState,
    parseApiResponse,
    showAutoToast,
});

const previewModalApi = createPreviewModalApi({
    setupAudioWaveform,
    bindPreviewTextEditor,
    getPreviewTextState,
    renderPreviewTextHtml,
});

export function renderContentGroup(showContentGroup) {
    if (!showContentGroup) return "";
    return `
        <div class="clab-context-menu-title">内容分组</div>
        <div class="clab-context-menu-item" id="clab-ctx-preview-mode">预览模式</div>
        <div class="clab-context-menu-item" id="clab-ctx-open-default">使用默认软件打开</div>
        <div class="clab-context-menu-item" id="clab-ctx-open-explorer">在资源管理器查看</div>
        <div class="clab-context-menu-divider"></div>
        <div class="clab-context-menu-item" id="clab-ctx-download">下载</div>
        <div class="clab-context-menu-item" id="clab-ctx-download-all">打包下载所有历史</div>
        <div class="clab-context-menu-divider"></div>
        <div class="clab-context-menu-item" id="clab-ctx-remove">移除当前记录</div>
        <div class="clab-context-menu-item" id="clab-ctx-clear">清空所有历史记录</div>
        <div class="clab-context-menu-divider"></div>
        <div class="clab-context-menu-item" id="clab-ctx-clean-dead">清理失效记录(404)</div>
        <div class="clab-context-menu-item" id="clab-ctx-resync">重新同步</div>
    `;
}

export function bindContentGroup({ menuEl, selectedAreaObjs, mainObj }) {
    if (!menuEl || !mainObj || mainObj.area?.type !== "preview") return;

    const mainCurrentUrl = getCurrentUrl(mainObj.area);
    const mainHistoryIdx = getHistoryIndexForUrl(
        mainObj.area,
        mainCurrentUrl,
        getHistoryIdx(mainObj.area),
    );

    bindDownloadActions({
        menuEl,
        selectedAreaObjs,
        getCurrentUrl,
        getHistoryArr,
        getHistoryIdx,
        getHistoryIndexForUrl,
        buildDownloadFilename,
        ensureUniqueDownloadName,
        downloadFile,
    });

    bindOpenActions({
        menuEl,
        mainObj,
        mainCurrentUrl,
        mainHistoryIdx,
        previewModalApi,
        openAssetWithSystem,
        showAutoToast,
    });

    bindHistoryActions({
        menuEl,
        selectedAreaObjs,
        getHistoryArr,
        getHistoryIdx,
        removePreviewHistoryIndex,
        loadSelectedTextContent,
        clearPreviewHistory,
        saveAndRender,
    });

    bindMaintenanceActions({
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
    });
}
