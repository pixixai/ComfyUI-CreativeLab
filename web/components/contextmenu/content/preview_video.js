import { attachVideoControls, updateVideoControls } from '../../modules/media_types/media_video.js';
import { formatTimeWithFrames } from '../../modules/media_types/media_utils.js';

export function attachPreviewVideo(player, { view = { x: 0, y: 0, zoom: 1 }, playback = {}, status, active = () => true } = {}) {
    const videos = [...player.querySelectorAll('video')], first = videos[0];
    const transforms = [...player.querySelectorAll('.clab-preview-video-transform, .clab-compare-transform')];
    const controller = new AbortController(), { signal } = controller;
    const releaseControls = attachVideoControls(player, videos);
    const audioSelect = player.querySelector('[data-compare-audio]');
    let frame = 0, timer = 0, disposed = false, seeking = false, resume = false, buffering = false, initialized = false, playing = false, drag, dragged = false;
    const duration = () => videos.every(video => Number.isFinite(video.duration)) ? Math.min(...videos.map(video => video.duration)) : 0;
    const update = () => updateVideoControls(player, videos);
    const applyView = () => transforms.forEach(element => { element.style.transform = `translate(${view.x}px,${view.y}px) scale(${view.zoom})`; });
    applyView();
    const pause = () => { playing = false; videos.forEach(video => video.pause()); cancelAnimationFrame(frame); frame = 0; update(); };
    const setTime = value => {
        const time = Math.max(0, Math.min(duration(), value));
        videos.forEach(video => { if (video.readyState) video.currentTime = time; }); update();
    };
    const tick = () => {
        frame = 0;
        if (disposed || first.paused || document.hidden) return;
        if (duration() && first.currentTime >= duration() - .03) { setTime(0); }
        for (const video of videos.slice(1)) if (Math.abs(video.currentTime - first.currentTime) > .08) video.currentTime = first.currentTime;
        update(); frame = requestAnimationFrame(tick);
    };
    first.addEventListener('play',()=>{if(!frame)frame=requestAnimationFrame(tick);},{signal});
    const start = async () => {
        if (videos.some(video => !video.readyState) || disposed) return;
        playing = true;
        if (duration() && first.currentTime >= duration() - .03) setTime(0);
        try {
            await Promise.all(videos.map(video => video.play()));
            if (disposed) { pause(); return; }
            update(); if (!frame) frame = requestAnimationFrame(tick);
        } catch (error) { if (!disposed && error.name !== 'AbortError') { pause(); if (status) status.textContent = '视频无法播放，请检查格式或文件是否有效。'; } }
    };
    const toggle = () => {
        const playing = !first.paused || resume || buffering;
        resume = false; buffering = false; seeking = false; clearTimeout(timer);
        videos.forEach(video => { video.dataset.isScrubbing = 'false'; });
        player.querySelector('.clab-timecode').style.color = '';
        playing ? pause() : void start();
    };
    const interactive = target => target.closest('button,input,select,[role=slider],.clab-video-controls-interactive,.clab-media-dropdown');
    player.addEventListener('click', event => {
        if (event.button === 0 && !interactive(event.target) && !dragged) toggle();
        dragged = false;
    }, { signal });
    document.addEventListener('keydown', event => {
        if (!active()) return;
        if (event.code !== 'Space' || event.ctrlKey || event.metaKey || event.altKey || event.isComposing || event.target.closest?.('input,textarea,select,[contenteditable=true]')) return;
        event.preventDefault();
        if (!event.repeat) toggle();
    }, { signal });
    const finishSeek = () => {
        if (!seeking) return;
        seeking = false;
        videos.forEach(video => { video.dataset.isScrubbing = 'false'; });
        player.querySelector('.clab-timecode').style.color = ''; update();
        if (resume) void start(); resume = false;
    };
    player.addEventListener('wheel', event => {
        if (interactive(event.target)) { if (event.ctrlKey) event.preventDefault(); return; }
        event.preventDefault(); event.stopPropagation();
        if (event.ctrlKey) {
            const pane = event.target.closest('.clab-compare-pane') || player;
            const rect = pane.getBoundingClientRect(), oldZoom = view.zoom;
            view.zoom = Math.max(.2, Math.min(8, oldZoom * (event.deltaY < 0 ? 1.12 : .9)));
            const ratio = view.zoom / oldZoom, x = event.clientX - rect.left - rect.width / 2, y = event.clientY - rect.top - rect.height / 2;
            view.x = x - (x - view.x) * ratio; view.y = y - (y - view.y) * ratio;
            applyView(); return;
        }
        if (!duration()) return;
        if (!seeking) { resume = !first.paused; pause(); seeking = true; }
        clearTimeout(timer);
        setTime(first.currentTime + (event.deltaY || event.deltaX) * .002);
        videos.forEach(video => { video.dataset.isScrubbing = 'true'; });
        const time = player.querySelector('.clab-timecode');
        time.textContent = formatTimeWithFrames(first.currentTime, 30); time.style.color = '#4CAF50';
        timer = setTimeout(finishSeek, 400);
    }, { passive: false, signal });
    player.addEventListener('pointerdown', event => {
        if (interactive(event.target) || event.button !== 1) return;
        event.preventDefault(); player.setPointerCapture(event.pointerId);
        drag = { x: event.clientX, y: event.clientY, ox: view.x, oy: view.y }; dragged = false;
    }, { signal });
    player.addEventListener('pointermove', event => {
        if (!drag) return;
        const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
        if (Math.abs(dx) + Math.abs(dy) > 3) dragged = true;
        view.x = drag.ox + dx; view.y = drag.oy + dy; applyView();
    }, { signal });
    const stopDrag = () => { drag = null; };
    player.addEventListener('pointerup', stopDrag, { signal }); player.addEventListener('pointercancel', stopDrag, { signal });
    player.addEventListener('auxclick', event => { if (event.button === 1) event.preventDefault(); }, { signal });
    window.addEventListener('blur', stopDrag, { signal });
    const chooseAudio = () => {
        const index = audioSelect?.value === 'b' ? 1 : audioSelect?.value === 'a' ? 0 : -1;
        videos.forEach((video, i) => { video.muted = i !== index; }); update();
    };
    audioSelect?.addEventListener('change', chooseAudio, { signal });
    const syncAudioSelect = () => {
        if (audioSelect) audioSelect.value = videos[1] && !videos[1].muted ? 'b' : !first.muted ? 'a' : 'mute';
    };
    const restore = () => {
        update(); if (initialized || videos.some(video => !video.readyState)) return; initialized = true;
        videos.forEach(video => { video.playbackRate = playback.speed || 1; video.volume = playback.volume ?? 1; });
        if (audioSelect) { audioSelect.value = playback.audio || 'mute'; chooseAudio(); }
        else first.muted = playback.muted ?? window._clabVideoMuted !== false;
        player.querySelector('.clab-media-speed-input').value = first.playbackRate;
        setTime(playback.time || 0);
        if (playback.playing ?? window._clabIsVideoAutoplayEnabled?.()) void start();
    };
    for (const video of videos) {
        for (const type of ['timeupdate', 'play', 'pause', 'volumechange', 'ratechange']) video.addEventListener(type, update, { signal });
        video.addEventListener('loadedmetadata', restore, { signal }); video.addEventListener('durationchange', restore, { signal });
        video.addEventListener('volumechange', syncAudioSelect, { signal });
        video.addEventListener('error', () => { pause(); if (status) status.textContent = '视频无法读取或浏览器不支持此格式。'; }, { signal });
        video.addEventListener('waiting', () => { if (videos.length > 1 && !seeking && !first.paused) { buffering = true; pause(); } }, { signal });
        video.addEventListener('canplay', () => { if (buffering && videos.every(item => item.readyState >= 3)) { buffering = false; void start(); } }, { signal });
        video.addEventListener('ended', () => { if (playing) { setTime(0); void start(); } }, { signal });
    }
    document.addEventListener('visibilitychange', () => { if (document.hidden) { resume = false; pause(); } }, { signal });
    restore();
    return () => {
        Object.assign(playback, { time: first.currentTime, speed: first.playbackRate, volume: (videos.find(video => !video.muted) || first).volume, audio: audioSelect?.value, muted: first.muted, playing: !first.paused || resume || buffering });
        disposed = true; controller.abort(); clearTimeout(timer); cancelAnimationFrame(frame); releaseControls();
        videos.forEach(video => { video.pause(); video.removeAttribute('src'); video.load(); });
    };
}
