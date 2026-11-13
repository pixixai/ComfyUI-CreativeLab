/**
 * 文件名: group_content.js
 * 路径: web/components/contextmenu/group_content.js
 * 职责: 内容分组菜单渲染 + 事件绑定协调（业务逻辑已拆分至 content/* 子模块）
 */
import { state, saveAndRender, getActiveWorkspace } from "../ui_state.js";
import { workspacePreviewMode } from '../workspace_modes/mode_policy.js';
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
import { workspacePreviewSources } from "./content/preview_browse.js";
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
});

function openSourcesPreview(sources, fallbackCard, opener, mode) {
    const main=sources.find(source=>source.area.resultUrl||source.area.history?.length)||sources[0];
    previewModalApi.openPreviewModal(main?.card||fallbackCard,main?.area,main?.area.resultUrl,main?.area.historyIndex,sources,opener,mode);
}

export function openCardPreview(cards) {
    openSourcesPreview(workspacePreviewSources(cards), cards[0]);
}

export function openWorkspacePreview(opener) {
    const sources = workspacePreviewSources(state.cards);
    const mode = workspacePreviewMode(getActiveWorkspace());
    const areaIds = new Set(state.selectedAreaIds);
    const selected = sources.filter(({ area }) => areaIds.has(area.id));
    if (selected.length) {
        openSourcesPreview(selected, state.cards[0], opener, mode);
    } else if (state.selectedCardIds.length) {
        const cardIds = new Set(state.selectedCardIds);
        const card = state.cards.find(item => cardIds.has(item.id));
        openSourcesPreview(sources.filter(({ card }) => cardIds.has(card.id)), card, opener, mode);
    } else {
        openSourcesPreview(sources, state.cards[0], opener, mode);
    }
}

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
        selectedAreaObjs,
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
