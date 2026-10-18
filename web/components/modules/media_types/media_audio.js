import { formatTime, formatTimeWithFrames } from './media_utils.js';
import { getAudioWavePeaks, drawAudioWave } from './audio_waveform.js';
import { onModuleRemoved } from '../module_lifecycle.js';

const waveforms = new WeakMap();

export function renderAudio(area, url, errCall) {
    return `<div class="clab-audio-player" data-area-id="${area.id}">
        <audio id="clab-img-${area.id}" class="clab-preview-img clab-media-target" src="${url}" loop preload="metadata" style="display:none;" onerror="${errCall}"></audio>
        <button type="button" class="clab-audio-wave clab-video-controls-interactive" title="单击波形播放 / 暂停" aria-label="播放音频" aria-pressed="false">
            <canvas class="clab-audio-wave-base" aria-hidden="true"></canvas><canvas class="clab-audio-wave-played" aria-hidden="true"></canvas><span class="clab-audio-wave-status">波形加载中…</span>
        </button>
        <div class="clab-audio-progress-container clab-video-controls-interactive"><div class="clab-audio-progress-bar"></div><input class="clab-audio-seek" type="range" min="0" max="1000" value="0" aria-label="音频播放进度"></div>
        <div class="clab-audio-controls-row">
            <span class="clab-audio-time"><span class="clab-timecode-current">00:00</span> / <span class="clab-timecode-total">00:00</span></span>
            <div class="clab-audio-tools-right">
                <div class="clab-volume-wrap clab-video-controls-interactive">
                    <div class="clab-volume-slider-container clab-aud-vol-slider" title="调节音量"><div class="clab-volume-slider-track"><div class="clab-volume-slider-fill"></div><div class="clab-volume-slider-thumb"></div></div></div>
                    <button type="button" class="clab-media-opt-btn clab-opt-mute" title="静音 / 取消静音" aria-label="静音 / 取消静音">
                        <svg class="clab-vol-icon-high" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                        <svg class="clab-vol-icon-muted" style="display:none;" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19"/><path d="m17 9 6 6m0-6-6 6"/></svg>
                    </button>
                </div>
                <div class="clab-media-opt-wrapper clab-video-controls-interactive">
                    <button type="button" class="clab-media-opt-btn clab-audio-speed-toggle" title="播放速度" aria-label="播放速度" aria-expanded="false"><span class="clab-audio-speed-val">1×</span></button>
                    <div class="clab-media-dropdown clab-audio-speed-dropdown">${[.5, 1, 1.5, 2].map(speed => `<div class="clab-media-dropdown-item clab-audio-preset" data-spd="${speed}">${speed}×</div>`).join('')}</div>
                </div>
            </div>
        </div>
    </div>`;
}

export function loadAudioWaveform(player, visible = false) {
    const audio = player.querySelector('audio'), base = player.querySelector('.clab-audio-wave-base'), played = player.querySelector('.clab-audio-wave-played');
    if (!audio || !base) return;
    let wave = waveforms.get(player);
    if (!wave) {
        wave = { url: '', peaks: null, requested: false, disposed: false };
        wave.redraw = () => { drawAudioWave(base, wave.peaks); drawAudioWave(played, wave.peaks, 1); };
        const observer = new ResizeObserver(wave.redraw);
        observer.observe(base);
        waveforms.set(player, wave);
        onModuleRemoved(player, () => { wave.disposed = true; observer.unobserve(base); waveforms.delete(player); });
    }
    const url = audio.getAttribute('src'), status = player.querySelector('.clab-audio-wave-status');
    if (url !== wave.url) {
        Object.assign(wave, { url, peaks: null, requested: false });
        status.textContent = '波形加载中…'; status.hidden = false;
        player.style.setProperty('--clab-audio-progress', '0%'); wave.redraw();
    }
    if (!visible || !url || wave.requested) return;
    wave.requested = true;
    getAudioWavePeaks(url).then(peaks => {
        if (wave.disposed || wave.url !== url) return;
        wave.peaks = peaks; status.hidden = true; wave.redraw();
    }).catch(() => { if (!wave.disposed && wave.url === url) status.textContent = '波形不可用'; });
}

export function updateAudioProgress(players = document.querySelectorAll('.clab-audio-player')) {
    players.forEach(player => {
        const audio = player.querySelector('audio');
        if (!audio) return;
        const muted = audio.muted || audio.volume === 0;
        player.querySelector('.clab-vol-icon-high').style.display = muted ? 'none' : 'block';
        player.querySelector('.clab-vol-icon-muted').style.display = muted ? 'block' : 'none';
        player.querySelector('.clab-volume-slider-fill').style.width = `${muted ? 0 : audio.volume * 100}%`;
        player.querySelector('.clab-volume-slider-thumb').style.right = `${muted ? 0 : audio.volume * 100}%`;
        const wave = player.querySelector('.clab-audio-wave');
        wave.setAttribute('aria-label', audio.paused ? '播放音频' : '暂停音频');
        wave.setAttribute('aria-pressed', String(!audio.paused));
        player.querySelector('.clab-audio-speed-val').textContent = `${audio.playbackRate}×`;
        const progress = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.currentTime / audio.duration : 0;
        player.style.setProperty('--clab-audio-progress', `${progress * 100}%`);
        player.querySelector('.clab-audio-progress-bar').style.width = `${progress * 100}%`;
        player.querySelector('.clab-audio-seek').value = progress * 1000;
        const current = player.querySelector('.clab-timecode-current');
        current.textContent = audio.dataset.isScrubbing === 'true' ? formatTimeWithFrames(audio.currentTime, 30) : formatTime(audio.currentTime);
        current.style.color = audio.dataset.isScrubbing === 'true' ? '#4caf50' : '';
        player.querySelector('.clab-timecode-total').textContent = formatTime(audio.duration);
    });
}

export function attachAudioEvents(container) {
    container.querySelectorAll('.clab-audio-player').forEach(player => {
        loadAudioWaveform(player);
        if (player.dataset.binded) return;
        player.dataset.binded = '1';
        const audio = player.querySelector('audio'), dropdown = player.querySelector('.clab-audio-speed-dropdown'), speedToggle = player.querySelector('.clab-audio-speed-toggle');
        let releaseDrag = null;
        onModuleRemoved(player, () => { releaseDrag?.(); dropdown.remove(); });
        player.querySelector('.clab-audio-wave').onclick = event => {
            event.stopPropagation();
            clearTimeout(audio._scrubTimer); audio.dataset.isScrubbing = 'false'; audio.dataset.wasPlayingBeforeScrub = 'false';
            if (audio.paused) audio.play().catch(() => {}); else audio.pause();
        };
        player.addEventListener('wheel', event => {
            if (!Number.isFinite(audio.duration) || audio.duration <= 0 || event.target.closest('.clab-volume-wrap, .clab-media-opt-wrapper, .clab-audio-progress-container')) return;
            const delta = event.deltaY || event.deltaX;
            if (!delta) return;
            event.preventDefault(); event.stopPropagation();
            if (!audio.paused) { audio.dataset.wasPlayingBeforeScrub = 'true'; audio.pause(); }
            audio.dataset.isScrubbing = 'true';
            audio.currentTime = Math.max(0, Math.min(audio.duration, audio.currentTime + delta * .002));
            updateAudioProgress([player]);
            clearTimeout(audio._scrubTimer);
            audio._scrubTimer = setTimeout(() => {
                audio.dataset.isScrubbing = 'false'; updateAudioProgress([player]);
                const resume = audio.dataset.wasPlayingBeforeScrub === 'true'; audio.dataset.wasPlayingBeforeScrub = 'false';
                if (resume && audio.isConnected) audio.play().catch(() => {});
            }, 400);
        }, { passive: false });
        player.querySelector('.clab-opt-mute').onclick = event => {
            event.stopPropagation();
            if (audio.muted || audio.volume === 0) { audio.muted = false; audio.volume = .8; } else audio.muted = true;
            updateAudioProgress([player]);
        };
        const seek = ratio => {
            if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;
            audio.currentTime = Math.max(0, Math.min(1, ratio)) * audio.duration;
            updateAudioProgress([player]);
        };
        player.querySelector('.clab-audio-seek').oninput = event => seek(Number(event.target.value) / 1000);
        const bindDrag = (target, update, pausePlayback = false) => {
            target.addEventListener('mousedown', event => {
                if (event.button !== 0) return;
                event.preventDefault(); event.stopPropagation(); releaseDrag?.();
                const resume = pausePlayback && !audio.paused;
                if (pausePlayback) audio.pause();
                const move = event => update(event.clientX);
                const up = () => {
                    window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); releaseDrag = null;
                    if (resume && audio.isConnected) audio.play().catch(() => {});
                };
                releaseDrag = up; update(event.clientX);
                window.addEventListener('mousemove', move); window.addEventListener('mouseup', up);
            });
        };
        const progress = player.querySelector('.clab-audio-progress-container');
        bindDrag(progress, clientX => { const rect = progress.getBoundingClientRect(); if (rect.width) seek((clientX - rect.left) / rect.width); }, true);
        const volume = player.querySelector('.clab-aud-vol-slider');
        bindDrag(volume, clientX => {
            const rect = volume.getBoundingClientRect(); if (!rect.width) return;
            audio.muted = false; audio.volume = Math.max(0, Math.min(1, 1 - (clientX - rect.left) / rect.width));
            updateAudioProgress([player]);
        });
        speedToggle.onclick = event => {
            event.stopPropagation(); const open = dropdown.classList.contains('show');
            document.querySelectorAll('.clab-media-dropdown.show').forEach(menu => { menu.classList.remove('show'); if (menu._originalParent) menu._originalParent.appendChild(menu); });
            if (open) { speedToggle.setAttribute('aria-expanded', 'false'); return; }
            dropdown._originalParent ||= dropdown.parentElement; document.body.append(dropdown);
            const rect = speedToggle.getBoundingClientRect();
            dropdown.style.bottom = `${window.innerHeight - rect.top + 6}px`;
            dropdown.style.left = `${Math.max(4, Math.min(rect.right - 84, window.innerWidth - 88))}px`;
            dropdown.classList.add('show'); speedToggle.setAttribute('aria-expanded', 'true');
        };
        dropdown.querySelectorAll('.clab-audio-preset').forEach(option => {
            option.onclick = event => {
                event.stopPropagation(); audio.playbackRate = Number(option.dataset.spd);
                dropdown.classList.remove('show'); dropdown._originalParent.append(dropdown);
                speedToggle.setAttribute('aria-expanded', 'false'); updateAudioProgress([player]);
            };
        });
    });
}
