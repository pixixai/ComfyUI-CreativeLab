/**
 * 文件名: module_media.js
 * 职责: 通用媒体引擎 (Router)，负责根据媒体类型向下级子组件分发渲染与交互请求
 */
import { onModuleRemoved } from "./module_lifecycle.js";
import { getAreaResultType, getMediaType } from "./media_types/media_utils.js";
import { renderVideo, attachVideoEvents, updateVideoProgress } from "./media_types/media_video.js";
import { renderAudio, attachAudioEvents, updateAudioProgress, loadAudioWaveform } from "./media_types/media_audio.js";
import { renderFile } from "./media_types/media_file.js";
import { renderImage } from "./media_types/media_image.js";
import { renderText, attachTextEvents } from "./media_types/media_text.js";
import { renderModelViewer, attachModelEvents } from './media_types/media_model.js';

// =========================================================================
// 1. 动态注入媒体组件专用全局 CSS
// =========================================================================
export function injectMediaCSS() {
    if (document.getElementById('clab-media-styles')) return;
    const style = document.createElement('style');
    style.id = 'clab-media-styles';
    style.innerHTML = `
        /* --- 视频组件样式 --- */
        .clab-video-player { position: relative; width: 100%; height: 100%; overflow: hidden; background: #000; cursor: pointer; }
        .clab-video-controls { 
            position: absolute; inset: 0; opacity: 0; transition: opacity 0.3s; 
            background: linear-gradient(transparent 70%, rgba(0,0,0,0.8) 100%); 
            pointer-events: none; display: flex; flex-direction: column; justify-content: flex-end;
        }
        .clab-video-player:hover .clab-video-controls, .clab-video-player:focus-within .clab-video-controls, .clab-video-paused .clab-video-controls { opacity: 1; }
        
        .clab-video-toolbar {
            display: flex; justify-content: space-between; align-items: center;
            gap:6px; padding: 0 8px 9px; width: 100%; box-sizing: border-box; pointer-events: none;
        }
        
        .clab-timecode { display:flex; align-items:center; height:24px; color:#ddd; font:11px/1 sans-serif; font-variant-numeric:tabular-nums; white-space:nowrap; pointer-events:none; }
        .clab-video-speed-val { display:block; font:11px/1 sans-serif; }
        
        .clab-video-tools-right { display:flex; align-items:center; gap:8px; height:24px; margin-left:auto; pointer-events:auto; }
        .clab-video-tools-right .clab-media-opt-btn { box-sizing:border-box; height:24px; min-height:24px; font:11px/1 sans-serif; }
        .clab-video-tools-right svg { display:block; flex-shrink:0; }
        .clab-video-controls-interactive { pointer-events: auto; }
        
        /* --- 全新的自定义音量滑杆悬浮效果 --- */
        .clab-volume-wrap { 
            display: flex; align-items: center; justify-content: flex-end; overflow: visible; 
            border-radius: 12px; background: transparent; transition: background 0.2s; 
        }
        .clab-volume-wrap:not(.no-audio):hover, .clab-volume-wrap.is-active { background: rgba(0,0,0,0.6); }
        
        .clab-volume-slider-container { 
            width: 0; opacity: 0; margin: 0; transition: width 0.2s ease, opacity 0.2s ease, margin 0.2s ease; 
            cursor: pointer; height: 24px; display: block; position: relative;
        }
        .clab-volume-wrap:not(.no-audio):hover .clab-volume-slider-container,
        .clab-volume-slider-container.is-dragging { 
            width: 50px; opacity: 1; margin-left: 8px; margin-right: 2px; 
        }
        
        .clab-volume-slider-track {
            width: 100%; height: 3px; background: rgba(255,255,255,0.3); border-radius: 2px; position: absolute; top: 50%; transform: translateY(-50%); pointer-events: none;
        }
        .clab-volume-slider-fill {
            position: absolute; right: 0; top: 0; height: 100%; background: #fff; border-radius: 2px;
        }
        .clab-volume-slider-thumb {
            position: absolute; right: 0; top: 50%; transform: translate(50%, -50%); width: 8px; height: 8px; border-radius: 50%; background: #fff;
        }

        .clab-media-opt-wrapper { position: relative; }
        .clab-media-opt-btn { background: transparent; border: none; color: #aaa; cursor: pointer; padding: 4px; border-radius: 4px; transition: color 0.15s; display: flex; align-items: center; justify-content: center; }
        .clab-media-opt-btn:hover { color:#fff; }
        
        /* 突破裁切的全局菜单样式 */
        .clab-media-dropdown { 
            position: fixed; 
            background: var(--comfy-menu-bg, #292929); border: 1px solid #505050;
            border-radius: 7px; box-shadow: 0 8px 28px rgba(0,0,0,0.45);
            display: none; flex-direction: column; min-width: 150px; z-index: 100000; padding: 4px 0;
        }
        .clab-media-dropdown.show { display: flex; }
        .clab-media-dropdown-item { padding: 6px 10px; font-size: 12px; color: #ddd; cursor: pointer; white-space: nowrap; transition: background 0.1s; font-family: sans-serif; }
        .clab-media-dropdown-item:hover { background: rgba(255,255,255,0.1); color: #fff; }
        .clab-more-dropdown .clab-media-dropdown-item { text-align: left; }

        .clab-vid-speed-opt:hover { background: rgba(255,255,255,0.2) !important; color: #fff !important; }

        .clab-video-progress-container { position: absolute; bottom: 0; left: 0; width: 100%; height: 4px; background: rgba(255,255,255,0.3); cursor: pointer; pointer-events: auto; }
        .clab-video-progress-container:hover { height: 6px; }
        .clab-video-progress-bar { height: 100%; width: 0%; background: #ccc; pointer-events: none; }

        /* --- 音频组件样式 --- */
        .clab-audio-player { display:flex; flex-direction:column; height:100%; padding:8px 12px 6px; box-sizing:border-box; width:100%; min-width:0; background:#1d1d1d; border-radius:4px; }
        .clab-audio-wave { display:block; width:100%; flex:1 0 72px; height:72px; min-height:72px; margin:0; padding:0; border:0; border-radius:0; background:transparent; position:relative; cursor:pointer; }
        .clab-audio-wave:focus-visible { outline:1px solid #aaa; outline-offset:2px; }
        .clab-audio-wave canvas { position:absolute; inset:0; display:block; width:100%; height:100%; pointer-events:none; }
        .clab-audio-wave-played { clip-path:inset(0 calc(100% - var(--clab-audio-progress, 0%)) 0 0); }
        .clab-audio-wave-status { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; color:#888; font:11px sans-serif; pointer-events:none; }
        .clab-audio-wave-status[hidden] { display:none; }
        .clab-audio-progress-container { width:100%; height:3px; background:rgba(255,255,255,0.2); border-radius:2px; margin:4px 0 8px; cursor:pointer; position:relative; }
        .clab-audio-progress-bar { height:100%; width:0%; background:#ccc; border-radius:inherit; pointer-events:none; }
        .clab-audio-seek { position:absolute; left:0; top:-5px; width:100%; height:13px; padding:0; margin:0; opacity:0; cursor:pointer; }
        .clab-audio-progress-container:focus-within { outline:1px solid #aaa; outline-offset:3px; }
        .clab-audio-controls-row { display:flex; align-items:center; gap:6px; min-width:0; padding-top:5px; border-top:1px solid rgba(255,255,255,.09); }
        .clab-audio-time { font:11px sans-serif; font-variant-numeric:tabular-nums; white-space:nowrap; color:#aaa; }
        .clab-audio-tools-right { display:flex; align-items:center; gap:5px; margin-left:auto; }
        .clab-audio-tools-right .clab-volume-wrap { position:relative; }
        .clab-audio-tools-right .clab-volume-slider-container { position:absolute; right:25px; background:#252525; border-radius:4px; z-index:3; }
        .clab-audio-speed-toggle { min-width:25px; font:11px sans-serif; }
        .clab-audio-speed-dropdown { min-width:84px; }
        
        .clab-media-speed-wrap { 
            display: flex; align-items: center; background: rgba(0,0,0,0.5); 
            border: 1px solid #555; border-radius: 4px; padding: 2px 4px; position: relative;
        }
        .clab-media-speed-input { 
            width: 30px; background: transparent; border: none; color: #eee; 
            font-size: 11px; outline: none; text-align: center; font-family: sans-serif;
        }
        .clab-media-speed-input::-webkit-outer-spin-button, .clab-media-speed-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }

        /* --- 文件组件样式 --- */
        .clab-file-display { border-radius:4px; text-align:center; color:#999; background:#191919; display:flex; gap:10px; flex-direction:column; justify-content:center; align-items:center; padding:18px; width:100%; height:100%; min-height:120px; box-sizing:border-box; }
        .clab-file-name { width:100%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font:12px sans-serif; color:#aaa; }
        .clab-file-preview-note { font:11px/1.5 sans-serif; color:#888; overflow-wrap:anywhere; }
        .clab-file-download { color:#aaa; border:1px solid #444; border-radius:5px; padding:4px 10px; text-decoration:none; font:12px sans-serif; transition:color .15s, border-color .15s; }
        .clab-file-download:hover { color:#fff; border-color:#777; }
        .clab-model-reset { border:1px solid #444; border-radius:5px; background:#242424; color:#aaa; padding:4px 9px; font:11px sans-serif; cursor:pointer; transition:color .15s,border-color .15s; }
        .clab-model-reset:hover { color:#fff; border-color:#777; }
        .clab-output-area > .clab-preview-bg-model { width:calc(100% - 16px); margin:0 8px; box-sizing:border-box; border:1px solid #444; border-radius:5px; }
        .clab-glb-viewer { display:flex; flex-direction:column; width:100%; height:100%; min-height:0; min-width:0; position:relative; background:#191919; cursor:default; }
        .clab-model-toolbar { display:flex; align-items:flex-start; flex-shrink:0; gap:8px; padding:6px 8px; min-width:0; }
        .clab-model-canvas { position:relative; flex:1; min-height:0; min-width:0; overflow:hidden; cursor:grab; }
        .clab-model-canvas:active { cursor:grabbing; }
        .clab-model-canvas canvas { display:block; width:100%; height:100%; touch-action:none; }
        .clab-model-status { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; padding:14px; box-sizing:border-box; color:#aaa; text-align:center; font:12px/1.5 sans-serif; pointer-events:none; }
        .clab-model-status[hidden] { display:none; }
        .clab-model-reset { flex-shrink:0; margin-left:auto; white-space:nowrap; }
        .clab-model-warning { min-width:0; overflow-wrap:anywhere; color:#b9a77c; font:10px/1.4 sans-serif; pointer-events:none; }
        .clab-model-animation { flex-shrink:0; padding:5px 8px 4px; border-top:1px solid #333; background:#202020; min-width:0; }
        .clab-model-animation[hidden], .clab-model-clips[hidden], .clab-model-warning[hidden] { display:none; }
        .clab-model-playback-row { display:flex; align-items:center; gap:6px; min-height:20px; min-width:0; color:#aaa; font:10px sans-serif; }
        .clab-model-play { display:flex; align-items:center; justify-content:center; width:20px; height:20px; flex-shrink:0; border:0; padding:0; background:transparent; color:#aaa; cursor:pointer; }
        .clab-model-play:hover { color:#fff; }
        .clab-model-time { white-space:nowrap; font-variant-numeric:tabular-nums; }
        .clab-model-time.scrubbing { color:#4caf50; }
        .clab-model-clips, .clab-model-speed { min-width:0; height:20px; max-width:100px; border:0; background:#292929; color:#aaa; font:10px sans-serif; padding:0; }
        .clab-model-clips { flex:1; }
        .clab-model-speed { margin-left:auto; width:43px; flex-shrink:0; }
        .clab-model-seek { display:block; width:100%; height:10px; margin:3px 0 0; accent-color:#aaa; cursor:pointer; }

        .clab-text-preview-shell {
            width: 100%;
            min-width: 0;
            display: flex;
            flex-direction: column;
            box-sizing: border-box;
            color: #ddd;
        }
        .clab-text-toolbar {
            display: flex;
            align-items: center;
            gap: 8px;
            min-width: 0;
            box-sizing: border-box;
            min-height: 34px;
            padding: 8px 14px;
            border-top: 1px solid rgba(255,255,255,0.08);
        }
        .clab-text-option {
            display: inline-flex;
            margin: 0;
            padding: 0;
            flex: 0 1 auto;
            min-width: 20px;
            align-items: center;
            gap: 6px;
            color: #aaa;
            font-size: 11px;
            font-family: sans-serif;
            line-height: 16px;
            min-height: 16px;
            cursor: pointer;
            accent-color: #aaa;
            user-select: none;
        }
        .clab-text-option > span {
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .clab-text-option input {
            flex-shrink: 0;
            width: 14px;
            height: 14px;
            margin: 0;
            cursor: pointer;
        }
        .clab-text-history-position {
            flex-shrink: 0;
            margin-left: auto;
            color: #999;
            font: 11px/16px sans-serif;
            font-variant-numeric: tabular-nums;
            white-space: nowrap;
        }
        .clab-text-body-scroll {
            width: 100%;
            overflow-x: hidden;
            border: 0;
            box-sizing: border-box;
            scrollbar-width: thin;
            scrollbar-color: rgba(255,255,255,0.28) transparent;
            cursor: text;
        }
        .clab-text-body-scroll::-webkit-scrollbar {
            width: 5px;
            height: 5px;
        }
        .clab-text-body-scroll::-webkit-scrollbar-track {
            background: transparent;
        }
        .clab-text-body-scroll::-webkit-scrollbar-thumb {
            background: rgba(255,255,255,0.28);
            border-radius: 999px;
        }
        .clab-text-body-scroll::-webkit-scrollbar-thumb:hover {
            background: rgba(255,255,255,0.4);
        }
        .clab-text-body-content {
            padding: 12px 14px;
            font-family: "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
            line-height: 1.55;
            color: #ddd;
            word-break: break-word;
            user-select: text;
            -webkit-user-select: text;
            cursor: text;
        }
        .clab-text-body-content > :last-child { margin-bottom: 0; }
        .clab-text-state {
            min-height: 56px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: rgba(238, 243, 248, 0.72);
            font-family: "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
            font-size: 12px;
            text-align: center;
        }
        .clab-text-state-missing {
            color: #ff8f8f;
        }
        .clab-text-plain,
        .clab-text-code-pre {
            margin: 0;
            white-space: pre-wrap;
            word-break: break-word;
            font-family: "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
            font-size: 12px;
            line-height: 1.6;
            user-select: text;
            -webkit-user-select: text;
            cursor: text;
        }
        .clab-text-plain code,
        .clab-text-code-pre code {
            font-family: inherit;
            font-size: inherit;
        }
        .clab-text-inline-code {
            padding: 0.15em 0.35em;
            border-radius: 4px;
            background: rgba(255,255,255,0.08);
            font-family: "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
            font-size: 0.95em;
        }
        .clab-text-code-block {
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 8px;
            background: rgba(0,0,0,0.26);
            overflow: hidden;
            margin: 0 0 10px 0;
        }
        .clab-text-code-lang {
            padding: 6px 10px;
            background: rgba(255,255,255,0.06);
            color: rgba(255,255,255,0.68);
            font-size: 10px;
            font-family: sans-serif;
            letter-spacing: 0.04em;
            text-transform: uppercase;
        }
        .clab-text-code-pre {
            padding: 10px 12px;
            overflow-x: auto;
        }
        .clab-text-heading {
            margin: 0 0 10px 0;
            line-height: 1.3;
            font-family: sans-serif;
        }
        .clab-text-heading.h1 { font-size: 22px; }
        .clab-text-heading.h2 { font-size: 19px; }
        .clab-text-heading.h3 { font-size: 16px; }
        .clab-text-heading.h4, .clab-text-heading.h5, .clab-text-heading.h6 { font-size: 14px; }
        .clab-text-paragraph {
            margin: 0 0 10px 0;
            font-size: 12px;
        }
        .clab-text-list {
            margin: 0 0 10px 18px;
            padding: 0;
            font-size: 12px;
        }
        .clab-text-quote {
            margin: 0 0 10px 0;
            padding: 8px 12px;
            border-left: 3px solid rgba(110, 193, 255, 0.7);
            background: rgba(110, 193, 255, 0.08);
            color: rgba(238, 243, 248, 0.9);
        }
        .clab-text-link {
            color: #7fc8ff;
            text-decoration: none;
            cursor: pointer;
        }
        .clab-text-link:hover {
            text-decoration: underline;
        }
        .clab-text-token-string { color: #f7b267; }
        .clab-text-token-number { color: #7fd8be; }
        .clab-text-token-boolean { color: #ff7aa2; }
        .clab-text-token-keyword { color: #7cb7ff; font-weight: 600; }
        .clab-text-token-comment { color: #7f8da1; font-style: italic; }
    `;
    document.head.appendChild(style);
}

// =========================================================================
// 2. 主路由分发渲染 (返回 HTML 字符串)
// =========================================================================
export function renderMedia(area, objectFit) {
    injectMediaCSS();
    
    if (!area.resultUrl && getAreaResultType(area) !== 'text') {
        return `<img id="clab-img-${area.id}" class="clab-preview-img" src="" draggable="false" style="display:none;" />`;
    }

    const type = getAreaResultType(area) || getMediaType(area.resultUrl);
    const url = area.resultUrl;
    const errCall = `if(window.CLab && window.CLab.handleMediaError) window.CLab.handleMediaError('${area.cardId || ""}', '${area.id}', '${url}');`;

    // 根据文件类型，将活分发给专员
    if (type === 'video') return renderVideo(area, objectFit, url, errCall);
    if (type === 'audio') return renderAudio(area, url, errCall);
    if (type === 'text') return renderText(area);
    if (type === 'model') return renderModelViewer(url);
    if (type === 'file') return renderFile(area, url);
    return renderImage(area, objectFit, url, errCall);
}

const players = new Set();
const activePlayers = new Set();
const visiblePlayers = new WeakSet();
const thumbnails = new Set();
const visibleThumbnails = new WeakSet();
let mediaFrame = 0;
let visibilityObserver = null;
let thumbnailObserver = null;
let panelObserver = null;

function panelVisible(element) {
    return !document.hidden && !!element.closest('#clab-panel.visible');
}

function updatePlayer(player) {
    if (!panelVisible(player) || !visiblePlayers.has(player)) return;
    if (player.classList.contains('clab-video-player')) updateVideoProgress([player]);
    else updateAudioProgress([player]);
}

function scheduleMediaLoop() {
    if (mediaFrame || activePlayers.size === 0) return;
    mediaFrame = requestAnimationFrame(() => {
        mediaFrame = 0;
        activePlayers.forEach(updatePlayer);
        scheduleMediaLoop();
    });
}

function syncPlayer(player) {
    const media = player.querySelector('video, audio');
    if (player.classList.contains('clab-audio-player')) loadAudioWaveform(player, panelVisible(player) && visiblePlayers.has(player));
    if (media && !media.paused && !media.ended && panelVisible(player) && visiblePlayers.has(player)) activePlayers.add(player);
    else activePlayers.delete(player);
    updatePlayer(player);
    if (!activePlayers.size) { cancelAnimationFrame(mediaFrame); mediaFrame = 0; }
    else scheduleMediaLoop();
}

function syncThumbnail(media) {
    const visible = panelVisible(media) && visibleThumbnails.has(media);
    if (visible && media.dataset.clabSrc) {
        media.src = media.dataset.clabSrc;
        delete media.dataset.clabSrc;
    }
    if (media.tagName === 'VIDEO') {
        if (!visible) media.pause();
        else if (media.autoplay && media.getAttribute('src')) media.play().catch(() => {});
    }
}

function attachMediaVisibility(container) {
    if (!visibilityObserver) {
        visibilityObserver = new IntersectionObserver(entries => entries.forEach(({ target, isIntersecting }) => {
            if (isIntersecting) visiblePlayers.add(target);
            else visiblePlayers.delete(target);
            syncPlayer(target);
        }));
        thumbnailObserver = new IntersectionObserver(entries => entries.forEach(({ target, isIntersecting }) => {
            if (isIntersecting) visibleThumbnails.add(target);
            else visibleThumbnails.delete(target);
            syncThumbnail(target);
        }), { rootMargin: '160px' });
        const syncVisibility = () => {
            players.forEach(syncPlayer);
            thumbnails.forEach(syncThumbnail);
        };
        document.addEventListener('visibilitychange', syncVisibility);
        for (const type of ['play', 'pause', 'ended', 'timeupdate', 'seeked', 'volumechange', 'ratechange', 'loadeddata', 'durationchange', 'emptied']) {
            document.addEventListener(type, event => {
                const player = event.target.closest?.('.clab-video-player, .clab-audio-player');
                if (player && players.has(player)) syncPlayer(player);
            }, true);
        }
        const panel = container.closest('#clab-panel');
        if (panel) {
            panelObserver = new MutationObserver(syncVisibility);
            panelObserver.observe(panel, { attributes: true, attributeFilter: ['class', 'style'] });
        }
    }
    container.querySelectorAll('.clab-video-player, .clab-audio-player').forEach(player => {
        if (players.has(player)) return;
        players.add(player);
        visibilityObserver.observe(player);
        onModuleRemoved(player, () => {
            players.delete(player);
            activePlayers.delete(player);
            visibilityObserver.unobserve(player);
            const media = player.querySelector('video, audio');
            clearTimeout(media?._scrubTimer);
            media?.pause();
            if (!activePlayers.size) { cancelAnimationFrame(mediaFrame); mediaFrame = 0; }
        });
    });
    container.querySelectorAll('.clab-history-thumb [data-clab-src]').forEach(media => {
        if (thumbnails.has(media)) return;
        thumbnails.add(media);
        thumbnailObserver.observe(media);
        onModuleRemoved(media, () => {
            thumbnails.delete(media);
            thumbnailObserver.unobserve(media);
            if (media.tagName === 'VIDEO') { media.pause(); media.removeAttribute('src'); media.load(); }
        });
    });
}

// =========================================================================
// 4. 全局交互绑定路由
// =========================================================================
export function attachMediaEvents(container) {
    injectMediaCSS();
    // 全局清理器：点击任意地方，关闭被剥离到 Body 层的悬浮菜单，并送回原处
    if (!window._clabMediaGlobalEventsBound) {
        const closeDropdownsGlobally = (e) => {
            if (!e.target.closest('.clab-media-opt-wrapper') && !e.target.closest('.clab-media-dropdown')) {
                document.querySelectorAll('.clab-media-dropdown.show').forEach(m => {
                    m.classList.remove('show');
                    m._originalParent?.querySelector('[aria-expanded]')?.setAttribute('aria-expanded', 'false');
                    if (m._originalParent) m._originalParent.appendChild(m); 
                });
            }
        };
        window.addEventListener('mousedown', closeDropdownsGlobally, true);
        window.addEventListener('wheel', closeDropdownsGlobally, { capture: true, passive: true });
        window._clabMediaGlobalEventsBound = true;
    }

    // 分发到专员执行实际的事件绑定
    attachVideoEvents(container);
    attachAudioEvents(container);
    attachTextEvents(container);
    attachModelEvents(container);
    attachMediaVisibility(container);
}
