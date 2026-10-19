/**
 * 文件名: media_video.js
 * 职责: 视频组件的专属渲染与事件处理 (高精度滚轮寻道 + 点击跳转模式)
 */
import { formatTime, formatTimeWithFrames } from "./media_utils.js";
import { onModuleRemoved } from "../module_lifecycle.js";

export function renderVideo(area, objectFit, url, errCall) {
    const autoplayEnabled = (() => {
        const raw = window._clabVideoAutoplay;
        if (typeof raw === 'string') {
            const normalized = raw.trim().toLowerCase();
            if (normalized === 'false' || normalized === '0' || normalized === 'off') return false;
            if (normalized === 'true' || normalized === '1' || normalized === 'on') return true;
        }
        return raw !== false;
    })();
    const autoplayAttr = autoplayEnabled ? 'autoplay' : '';
    const mutedAttr = window._clabVideoMuted !== false ? 'muted' : '';

    return `
        <div class="clab-video-player clab-video-paused" data-area-id="${area.id}">
            <video id="clab-img-${area.id}" class="clab-preview-img clab-media-target" src="${url}" draggable="false" style="object-fit: ${objectFit}; width: 100%; height: 100%; display: block;" ${autoplayAttr} loop ${mutedAttr} playsinline onerror="${errCall}"></video>
            ${renderVideoControls()}
        </div>
    `;
}

export function renderVideoControls(extraTools = '') {
    const muted = window._clabVideoMuted !== false;
    const displayHigh = muted ? 'none' : 'block', displayMuted = muted ? 'block' : 'none';
    return `
            <div class="clab-video-controls">
                <div class="clab-video-toolbar">
                    <span class="clab-timecode">00:00 / 00:00</span>
                    <div class="clab-video-tools-right">
                        ${extraTools}

                        <!-- 极简音量滑杆 -->
                        <div class="clab-volume-wrap clab-video-controls-interactive" style="background: transparent !important;">
                            <div class="clab-volume-slider-container clab-vid-vol-slider" title="调节音量">
                                <div class="clab-volume-slider-track">
                                    <div class="clab-volume-slider-fill"></div>
                                    <div class="clab-volume-slider-thumb"></div>
                                </div>
                            </div>
                            <button class="clab-media-opt-btn clab-opt-mute" title="静音/取消静音" style="padding: 4px 6px; background: transparent !important; color: #aaa; transition: color 0.2s;" onmouseover="if(this.style.pointerEvents !== 'none') this.style.color='#fff'" onmouseout="if(this.style.pointerEvents !== 'none') this.style.color='#aaa'">
                                <svg class="clab-vol-icon-high" style="display:${displayHigh};" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                                <svg class="clab-vol-icon-muted" style="display:${displayMuted};" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
                                <svg class="clab-vol-icon-none" style="display:none;" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon></svg>
                            </button>
                        </div>

                        <div class="clab-media-opt-wrapper clab-video-controls-interactive">
                            <button type="button" class="clab-media-opt-btn clab-more-toggle" title="播放速度、画中画与全屏" aria-label="播放速度、画中画与全屏" aria-expanded="false"><span class="clab-video-speed-val">1×</span></button>
                            <div class="clab-media-dropdown clab-more-dropdown" style="text-align: left;">
                                <div style="padding: 6px 12px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.1);">
                                    <span style="font-size: 11px; color: #aaa; font-family: sans-serif !important;">播放速度</span>
                                    <div style="display: flex; align-items: center; background: rgba(0,0,0,0.5); border: 1px solid #555; border-radius: 4px; padding: 0 4px;">
                                        <input type="number" class="clab-media-speed-input" value="1.0" step="0.1" min="0.1" max="5.0" style="width: 28px; background: transparent; border: none; color: #eee; font-size: 11px; text-align: center; outline: none; -moz-appearance: textfield;">
                                        <span style="font-size: 10px; color: #aaa; pointer-events: none;">x</span>
                                    </div>
                                </div>
                                <div style="display: flex; justify-content: space-between; padding: 6px 12px; border-bottom: 1px solid rgba(255,255,255,0.1);">
                                    <span class="clab-vid-speed-opt" data-spd="0.5" style="cursor: pointer; font-size: 10px; color: #eee; padding: 2px 6px; border-radius: 4px; background: rgba(255,255,255,0.1); transition: background 0.2s;">0.5</span>
                                    <span class="clab-vid-speed-opt" data-spd="1.0" style="cursor: pointer; font-size: 10px; color: #eee; padding: 2px 6px; border-radius: 4px; background: rgba(255,255,255,0.1); transition: background 0.2s;">1.0</span>
                                    <span class="clab-vid-speed-opt" data-spd="1.5" style="cursor: pointer; font-size: 10px; color: #eee; padding: 2px 6px; border-radius: 4px; background: rgba(255,255,255,0.1); transition: background 0.2s;">1.5</span>
                                    <span class="clab-vid-speed-opt" data-spd="2.0" style="cursor: pointer; font-size: 10px; color: #eee; padding: 2px 6px; border-radius: 4px; background: rgba(255,255,255,0.1); transition: background 0.2s;">2.0</span>
                                </div>
                                <div class="clab-media-dropdown-item clab-opt-pip" style="margin-top: 4px;">画中画</div>
                                <div class="clab-media-dropdown-item clab-opt-fullscreen">全屏</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="clab-video-progress-container clab-video-controls-interactive">
                    <div class="clab-video-progress-bar"></div>
                </div>
            </div>
    `;
}

export function updateVideoProgress(players = document.querySelectorAll('.clab-video-player')) {
    players.forEach(player => updateVideoControls(player));
}

export function updateVideoControls(player, videos = [player.querySelector('video')]) {
    const vid = videos[0];
    if (!vid) return;
    const audio = videos.find(video => !video.muted) || vid;
    const duration = videos.every(video => Number.isFinite(video.duration)) ? Math.min(...videos.map(video => video.duration)) : 0;
    player.classList.toggle('clab-video-paused', vid.paused);
    player.querySelector('.clab-video-speed-val').textContent = `${vid.playbackRate}×`;

    // 音量与静音状态更新
    const muteOpt = player.querySelector('.clab-opt-mute');
    if (muteOpt) {
        let noAudio = false;
        if (audio.audioTracks && audio.audioTracks.length === 0) noAudio = true;
        else if (audio.mozHasAudio === false) noAudio = true;
        else if (vid.currentTime > 0.1 && audio.webkitAudioDecodedByteCount === 0) noAudio = true;

        const iconHigh = muteOpt.querySelector('.clab-vol-icon-high');
        const iconMuted = muteOpt.querySelector('.clab-vol-icon-muted');
        const iconNone = muteOpt.querySelector('.clab-vol-icon-none');
        const slider = player.querySelector('.clab-vid-vol-slider');

        if (noAudio) {
            muteOpt.style.color = '#888'; muteOpt.style.pointerEvents = 'none';
            if (iconHigh) iconHigh.style.display = 'none';
            if (iconMuted) iconMuted.style.display = 'none';
            if (iconNone) iconNone.style.display = 'block';
            if (slider) slider.style.display = 'none';
        } else {
            muteOpt.style.pointerEvents = 'auto';
            if (audio.muted || audio.volume === 0) {
                if (iconHigh) iconHigh.style.display = 'none';
                if (iconMuted) iconMuted.style.display = 'block';
            } else {
                if (iconHigh) iconHigh.style.display = 'block';
                if (iconMuted) iconMuted.style.display = 'none';
            }
            if (iconNone) iconNone.style.display = 'none';
            if (slider) slider.style.display = 'block';
        }
    }

    const level = audio.muted ? 0 : audio.volume;
    const fill = player.querySelector('.clab-volume-slider-fill'), thumb = player.querySelector('.clab-volume-slider-thumb');
    if (fill) fill.style.width = `${level * 100}%`;
    if (thumb) thumb.style.right = `${level * 100}%`;

    // 当因为滚轮或拖拽正在 scrubbing 时，不执行默认的时间码更新逻辑
    if (vid.dataset.isScrubbing === 'true') return;

    const bar = player.querySelector('.clab-video-progress-bar');
    const tc = player.querySelector('.clab-timecode');
    if (bar && tc && duration) {
        player.querySelector('.clab-video-progress-container')?.setAttribute('aria-valuenow', String(vid.currentTime));
        player.querySelector('.clab-video-progress-container')?.setAttribute('aria-valuemax', String(duration));
        bar.style.width = `${(vid.currentTime / duration) * 100}%`;
        // 正常播放时显示标准格式
        const label = `${formatTime(vid.currentTime)} / ${formatTime(duration)}`;
        if (tc.textContent !== label) tc.textContent = label;
    }
}

export function attachVideoEvents(container) {
    container.querySelectorAll('.clab-video-player').forEach(player => {
        if (player.dataset.binded) return;
        player.dataset.binded = "1";

        const vid = player.querySelector('video');
        if (!vid) return;

        // =========================================================================
        // 【核心修改 1】：高精度滚轮调节，彻底杜绝穿透冒泡，并加入防抖续播逻辑
        // =========================================================================
        player.addEventListener('wheel', (e) => {
            // 只有当视频加载了时长且鼠标没在底部的交互控件上时才响应
            if (!vid.duration || e.target.closest('.clab-video-controls-interactive')) return;

            // 强力拦截：阻止面板滚动条和外层容器滚动条的默认行为，并切断冒泡！
            e.preventDefault();
            e.stopPropagation();

            // 如果视频正在播放，先暂停它，并标记正在 scrubbing
            if (!vid.paused) {
                vid.dataset.wasPlayingBeforeScrub = 'true';
                vid.pause();
            }
            vid.dataset.isScrubbing = 'true';

            // 精度微调：大幅降低倍率 (滚轮卡顿1格通常等于100，100 * 0.002 = 0.2秒)
            const delta = e.deltaY || e.deltaX;
            const step = delta * 0.002;

            let newTime = vid.currentTime + step;
            vid.currentTime = Math.max(0, Math.min(vid.duration, newTime));

            // 视觉反馈：即时更新时间码（显示帧格式，并变绿提示正在调节）
            const tc = player.querySelector('.clab-timecode');
            const bar = player.querySelector('.clab-video-progress-bar');

            if (bar) {
                 bar.style.width = `${(vid.currentTime / vid.duration) * 100}%`;
            }

            if (tc) {
                // 滚动时显示 分:秒:帧 格式
                tc.textContent = formatTimeWithFrames(vid.currentTime, 30);
                tc.style.color = '#4CAF50';
            }

            // 防抖逻辑：判断是否连续滚动。
            // 每次滚动都清除上一次的定时器。
            clearTimeout(vid._scrubTimer);

            // 设置新的定时器。如果超过 400ms 没有新的滚动事件，认为滚动结束
            vid._scrubTimer = setTimeout(() => {
                vid.dataset.isScrubbing = 'false';
                if (tc) tc.style.color = ''; // 恢复颜色

                // 如果滚动前是在播放状态，则恢复播放
                if (vid.dataset.wasPlayingBeforeScrub === 'true') {
                    vid.play().catch(()=>{});
                    vid.dataset.wasPlayingBeforeScrub = 'false';
                }
            }, 400); // 400ms 的防抖时间，可以根据手感微调

        }, { passive: false });

        // 【右键处理】：彻底移除进度调节，仅保留呼出菜单
        player.addEventListener('contextmenu', (e) => {
            if (e.target.closest('.clab-video-controls-interactive')) return;
            e.preventDefault();
            e.stopPropagation();
            if (window.CLab && window.CLab.showPreviewContextMenu) {
                const areaId = player.dataset.areaId;
                const cardEl = player.closest('.clab-card');
                const cardId = cardEl ? cardEl.dataset.cardId : null;
                window.CLab.showPreviewContextMenu(e.clientX, e.clientY, cardId, areaId, vid.src);
            }
        }, true);

        // 单击播放/暂停
        player.addEventListener('click', (e) => {
            if (e.target.closest('.clab-video-controls-interactive')) return;
            if (e.button === 0 && e.target.tagName === 'VIDEO') {
                if (vid.paused) vid.play().catch(()=>{});
                else vid.pause();
            }
        });

        onModuleRemoved(player, attachVideoControls(player));
    });
}

export function attachVideoControls(player, videos = [player.querySelector('video')]) {
    const controller = new AbortController(), { signal } = controller;
    const media = videos[0];
    const dropdown = player.querySelector('.clab-more-dropdown'), toggle = player.querySelector('.clab-more-toggle');
    const duration = () => videos.every(video => Number.isFinite(video.duration)) ? Math.min(...videos.map(video => video.duration)) : 0;
    const refresh = () => updateVideoControls(player, videos);
    let menuController, volumeController;
    const closeMenu = () => {
        menuController?.abort();
        dropdown.classList.remove('show'); toggle.setAttribute('aria-expanded', 'false');
        dropdown._originalParent?.appendChild(dropdown);
    };
    const setRate = value => { videos.forEach(video => { video.playbackRate = value; }); refresh(); };
    const progress = player.querySelector('.clab-video-progress-container');
    progress.addEventListener('mousedown', event => {
        if (event.button !== 0) return;
        event.preventDefault(); event.stopPropagation();
        const rect = progress.getBoundingClientRect();
        if (!duration() || !rect.width) return;
        const time = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)) * duration();
        videos.forEach(video => { video.currentTime = time; }); refresh();
    }, { signal });
    progress.setAttribute('role', 'slider'); progress.tabIndex = 0;
    progress.setAttribute('aria-label', '视频播放进度');
    progress.addEventListener('keydown', event => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault(); event.stopPropagation();
        const time = event.key === 'Home' ? 0 : event.key === 'End' ? duration() : Math.max(0, Math.min(duration(), media.currentTime + (event.key === 'ArrowLeft' ? -1 : 1)));
        videos.forEach(video => { if (video.readyState) video.currentTime = time; }); refresh();
    }, { signal });
    const audio = () => videos.find(video => !video.muted) || media;
    const setVolume = value => { const video = audio(); video.muted = false; video.volume = value; refresh(); };
    const volume = player.querySelector('.clab-vid-vol-slider');
    const dragVolume = x => {
        const rect = volume.getBoundingClientRect();
        if (!rect.width) return;
        const value = Math.max(0, Math.min(1, 1 - (x - rect.left) / rect.width));
        setVolume(value);
    };
    volume.addEventListener('mousedown', event => {
        if (event.button !== 0) return;
        event.preventDefault(); event.stopPropagation();
        volume.classList.add('is-dragging'); dragVolume(event.clientX);
        volumeController?.abort(); volumeController = new AbortController();
        window.addEventListener('mousemove', event => dragVolume(event.clientX), { signal: volumeController.signal });
        window.addEventListener('mouseup', stopVolume, { signal: volumeController.signal });
        window.addEventListener('blur', stopVolume, { signal: volumeController.signal });
    }, { signal });
    const stopVolume = () => { volume.classList.remove('is-dragging'); volumeController?.abort(); };
    player.querySelector('.clab-opt-mute').addEventListener('click', event => {
        event.stopPropagation();
        const video = audio();
        if (video.muted || !video.volume) setVolume(.8);
        else { videos.forEach(item => { item.muted = true; }); refresh(); }
    }, { signal });
    toggle.addEventListener('click', event => {
        event.stopPropagation();
        const open = dropdown.classList.contains('show');
        document.querySelectorAll('.clab-media-dropdown.show').forEach(menu => {
            menu.classList.remove('show');
            menu._originalParent?.querySelector('[aria-expanded]')?.setAttribute('aria-expanded', 'false');
            menu._originalParent?.appendChild(menu);
        });
        if (open) return;
        dropdown._originalParent ||= dropdown.parentElement;
        (document.fullscreenElement || document.body).append(dropdown); dropdown.classList.add('show'); toggle.setAttribute('aria-expanded', 'true');
        const rect = toggle.getBoundingClientRect();
        dropdown.style.bottom = `${window.innerHeight - rect.top + 6}px`;
        dropdown.style.left = `${Math.max(4, Math.min(rect.right - dropdown.offsetWidth, window.innerWidth - dropdown.offsetWidth - 4))}px`;
        menuController?.abort(); menuController = new AbortController();
        const closeOutside = event => { if (!toggle.contains(event.target) && !dropdown.contains(event.target)) closeMenu(); };
        window.addEventListener('mousedown', closeOutside, { capture: true, signal: menuController.signal });
        window.addEventListener('wheel', closeOutside, { capture: true, passive: true, signal: menuController.signal });
    }, { signal });
    const speedInput = dropdown.querySelector('.clab-media-speed-input');
    speedInput.addEventListener('change', () => { setRate(Math.max(.1, Math.min(5, Number(speedInput.value) || 1))); speedInput.value = media.playbackRate; }, { signal });
    dropdown.querySelectorAll('.clab-vid-speed-opt').forEach(item => item.addEventListener('click', event => {
        event.stopPropagation(); setRate(Number(item.dataset.spd)); speedInput.value = media.playbackRate; closeMenu();
    }, { signal }));
    dropdown.querySelector('.clab-opt-fullscreen').addEventListener('click', event => {
        event.stopPropagation(); player.requestFullscreen?.().catch(() => {}); closeMenu();
    }, { signal });
    dropdown.querySelector('.clab-opt-pip').addEventListener('click', event => {
        event.stopPropagation();
        if (document.pictureInPictureElement === media) document.exitPictureInPicture().catch(() => {});
        else media.requestPictureInPicture?.().catch(() => {});
        closeMenu();
    }, { signal });
    refresh();
    return () => { controller.abort(); stopVolume(); closeMenu(); dropdown.remove(); };
}
