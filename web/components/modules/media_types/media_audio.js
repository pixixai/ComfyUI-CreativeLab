/**
 * 文件名: media_audio.js
 * 职责: 音频组件的专属渲染与事件处理
 */
import { formatTime } from "./media_utils.js";

export function renderAudio(area, url, errCall) {
    return `
        <div class="sl-audio-player" data-area-id="${area.id}" style="aspect-ratio: ${area.matchMedia ? 'auto' : '16/9'}; min-height: 80px;">
            <audio id="sl-img-${area.id}" class="sl-preview-img sl-media-target" src="${url}" autoplay loop onerror="${errCall}"></audio>
            <div class="sl-audio-progress-container sl-video-controls-interactive">
                <div class="sl-audio-progress-bar"></div>
            </div>
            <div class="sl-audio-controls-row">
                <button class="sl-audio-btn sl-audio-play">⏸</button>
                <span class="sl-timecode" style="color:#aaa;">00:00 / 00:00</span>
                <div class="sl-audio-vol-wrap sl-video-controls-interactive">
                    <span style="font-size:12px;">🔊</span>
                    <div class="sl-audio-vol-slider-container sl-audio-vol-slider" title="调节音量">
                        <div class="sl-audio-vol-slider-track">
                            <div class="sl-audio-vol-slider-fill"></div>
                            <div class="sl-audio-vol-slider-thumb"></div>
                        </div>
                    </div>
                </div>
                <div class="sl-media-speed-wrap sl-video-controls-interactive">
                    <input type="number" class="sl-media-speed-input sl-audio-speed-input" value="1.0" step="0.1">
                    <span style="font-size:11px; color:#aaa; margin:0 2px;">x</span>
                    <button class="sl-media-opt-btn sl-audio-speed-toggle" style="padding: 0 4px; font-size:10px;">▲</button>
                    <div class="sl-media-dropdown sl-audio-speed-dropdown" style="min-width:60px;">
                        <div class="sl-media-dropdown-item sl-audio-preset" data-spd="0.5">0.5x</div>
                        <div class="sl-media-dropdown-item sl-audio-preset" data-spd="1.0">1.0x</div>
                        <div class="sl-media-dropdown-item sl-audio-preset" data-spd="1.5">1.5x</div>
                        <div class="sl-media-dropdown-item sl-audio-preset" data-spd="2.0">2.0x</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

export function updateAudioProgress() {
    document.querySelectorAll('.sl-audio-player').forEach(player => {
        const aud = player.querySelector('audio');
        if (!aud) return;
        if (aud.dataset.isScrubbing === 'true') return;

        const bar = player.querySelector('.sl-audio-progress-bar');
        const tc = player.querySelector('.sl-timecode');
        const btn = player.querySelector('.sl-audio-play');
        if (bar && tc && aud.duration) {
            bar.style.width = `${(aud.currentTime / aud.duration) * 100}%`;
            tc.textContent = `${formatTime(aud.currentTime)} / ${formatTime(aud.duration)}`;
            if (btn) btn.textContent = aud.paused ? '▶' : '⏸';
        }
    });
}

export function attachAudioEvents(container) {
    container.querySelectorAll('.sl-audio-player').forEach(player => {
        if (player.dataset.binded) return;
        player.dataset.binded = "1";

        const playBtn = player.querySelector('.sl-audio-play');
        if (playBtn) playBtn.onclick = (e) => { 
            e.stopPropagation(); 
            const aud = player.querySelector('audio');
            if (!aud) return;
            if(aud.paused) aud.play(); else aud.pause(); 
        };

        const audVolContainer = player.querySelector('.sl-audio-vol-slider');
        const audNode = player.querySelector('audio');
        
        if (audVolContainer && audNode) {
            const updateAudVolUI = (vol) => {
                const fill = audVolContainer.querySelector('.sl-audio-vol-slider-fill');
                const thumb = audVolContainer.querySelector('.sl-audio-vol-slider-thumb');
                if (fill) fill.style.width = `${vol * 100}%`;
                if (thumb) thumb.style.left = `${vol * 100}%`;
            };

            if (audNode.muted || audNode.volume === 0) updateAudVolUI(0);
            else updateAudVolUI(audNode.volume);

            audVolContainer.addEventListener('mousedown', (e) => {
                e.preventDefault(); 
                e.stopPropagation();
                if (e.button !== 0) return;
                
                const aud = player.querySelector('audio');
                if (!aud) return;

                let isDraggingVol = true;

                const updateVolume = (clientX) => {
                    const rect = audVolContainer.getBoundingClientRect();
                    const pos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
                    aud.muted = false; 
                    aud.volume = pos;
                    updateAudVolUI(pos);
                };

                updateVolume(e.clientX);

                const onMove = (ev) => {
                    if (!isDraggingVol) return;
                    updateVolume(ev.clientX);
                };

                const onUp = (ev) => {
                    if (ev.button !== 0) return;
                    isDraggingVol = false;
                    window.removeEventListener('mousemove', onMove);
                    window.removeEventListener('mouseup', onUp);
                };

                window.addEventListener('mousemove', onMove);
                window.addEventListener('mouseup', onUp);
            });
        }

        const progContainer = player.querySelector('.sl-audio-progress-container');
        if (progContainer) {
            progContainer.addEventListener('mousedown', (e) => {
                e.preventDefault(); 
                e.stopPropagation();
                if (e.button !== 0) return;
                
                const aud = player.querySelector('audio');
                if (!aud || !aud.duration) return;
                
                let isDraggingBar = true;
                const rect = progContainer.getBoundingClientRect();
                const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                aud.currentTime = pos * aud.duration;
                aud.dataset.isScrubbing = 'true';
                
                const updateProgress = (clientX) => {
                    const freshAud = player.querySelector('audio');
                    if (!freshAud) return;
                    const p = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
                    freshAud.currentTime = p * freshAud.duration;
                    const bar = player.querySelector('.sl-audio-progress-bar');
                    if(bar) bar.style.width = `${p*100}%`;
                };

                const onMove = (ev) => {
                    if (!isDraggingBar) return;
                    updateProgress(ev.clientX);
                };
                const onUp = (ev) => {
                    if (ev.button !== 0) return;
                    isDraggingBar = false;
                    const freshAud = player.querySelector('audio');
                    if (freshAud) freshAud.dataset.isScrubbing = 'false';
                    window.removeEventListener('mousemove', onMove);
                    window.removeEventListener('mouseup', onUp);
                };
                window.addEventListener('mousemove', onMove);
                window.addEventListener('mouseup', onUp);
            });
        }

        const speedInput = player.querySelector('.sl-audio-speed-input');
        const speedToggle = player.querySelector('.sl-audio-speed-toggle');
        const dropdown = player.querySelector('.sl-audio-speed-dropdown');
        
        if (speedInput && speedToggle && dropdown) {
            speedInput.onchange = (e) => {
                let v = parseFloat(e.target.value);
                if (isNaN(v) || v < 0.1) v = 1.0;
                if (v > 5.0) v = 5.0;
                e.target.value = v.toFixed(1);
                const aud = player.querySelector('audio');
                if (aud) aud.playbackRate = v;
            };

            speedToggle.onclick = (e) => {
                e.stopPropagation();
                const isShow = dropdown.classList.contains('show');
                document.querySelectorAll('.sl-media-dropdown.show').forEach(m => {
                    m.classList.remove('show');
                    if (m._originalParent) m._originalParent.appendChild(m);
                });
                
                if (!isShow) {
                    if (!dropdown._originalParent) dropdown._originalParent = dropdown.parentNode;
                    document.body.appendChild(dropdown);
                    
                    const rect = speedToggle.getBoundingClientRect();
                    dropdown.style.bottom = `${window.innerHeight - rect.top + 8}px`;
                    dropdown.style.left = `${rect.left}px`;
                    dropdown.style.right = 'auto';
                    dropdown.classList.add('show');
                }
            };

            const dropdownOpts = dropdown.querySelectorAll('.sl-audio-preset');
            if (dropdownOpts) {
                dropdownOpts.forEach(item => {
                    item.onclick = (e) => {
                        e.stopPropagation();
                        const spd = parseFloat(item.dataset.spd);
                        speedInput.value = spd.toFixed(1);
                        const aud = player.querySelector('audio');
                        if (aud) aud.playbackRate = spd;
                        dropdown.classList.remove('show');
                        if (dropdown._originalParent) dropdown._originalParent.appendChild(dropdown);
                    };
                });
            }
        }
    });
}