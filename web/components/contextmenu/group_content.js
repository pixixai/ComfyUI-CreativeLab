/**
 * 文件名: group_content.js
 * 路径: web/components/contextmenu/group_content.js
 * 职责: 内容分组菜单渲染 + 事件绑定协调（业务逻辑已拆分至 content/* 子模块）
 */
import { state, saveAndRender, getActiveWorkspace } from "../ui_state.js";
import { workspacePreviewMode } from '../workspace_modes/mode_policy.js';
import { ensureTextAreaState } from "../modules/media_types/media_utils.js";
import { createPreviewModalApi } from "./content/preview_modal.js";
import { workspacePreviewSources } from "./content/preview_browse.js";
import { createEditorLogic } from "./content/editor_logic.js";
import { parseApiResponse,showAutoToast } from "./content/runtime_services.js";
import { setupAudioWaveform } from './content/audio_waveform.js';
import { renderOutputMenu,bindOutputActions } from './content/output_menu.js';

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

export function renderContentGroup(showContentGroup,options) {
    return showContentGroup?renderOutputMenu(options):'';
}
export function bindContentGroup(args) { bindOutputActions({...args,previewModalApi}); }
