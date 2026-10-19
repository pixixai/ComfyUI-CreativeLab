import { escapeHtml as esc } from './shared.js';
import { formatTime } from '../../modules/media_types/media_utils.js';

export function comparisonHTML(a, b, config) {
    const pair=JSON.stringify([a?.key,b?.key]);
    if(config.pair!==pair) { config.pair=pair;config.playback={time:0,speed:1,audio:'mute',playing:false}; }
    const slot = (record, name) => `<button class="clab-compare-slot" data-compare-slot="${name}" aria-pressed="${config.slot === name}"><strong>${name.toUpperCase()}</strong> ${record ? esc(`${record.cardLabel} / ${record.areaLabel} · 历史 ${record.index + 1}`) : '点击后从左侧选择记录'}</button>`;
    const valid = a && b && a.type === b.type && ['image', 'video'].includes(a.type);
    return `<div class="clab-compare"><div class="clab-compare-slots">${slot(a, 'a')}${slot(b, 'b')}<button data-compare-swap title="交换 A/B">⇄</button></div>
        ${valid ? `<div class="clab-compare-stage ${config.layout === 'split' ? 'split' : 'side'}">${[a, b].map((record, i) => `<div class="clab-compare-pane ${i ? 'layer-b' : 'layer-a'}"><div class="clab-compare-transform">${record.type === 'image' ? `<img draggable="false" src="${esc(record.url)}" alt="${i ? 'B' : 'A'}">` : `<video src="${esc(record.url)}" preload="metadata" muted playsinline></video>`}</div><span class="clab-compare-badge">${i ? 'B' : 'A'}</span></div>`).join('')}${config.layout === 'split' ? '<div class="clab-compare-divider"></div>' : ''}</div>
        ${a.type === 'video' ? `<div class="clab-compare-playback"><button data-compare-play>播放</button><span data-compare-time>00:00 / 00:00</span><select data-compare-speed aria-label="比较视频播放速度">${[.5, 1, 1.5, 2].map(speed => `<option value="${speed}" ${speed === 1 ? 'selected' : ''}>${speed}×</option>`).join('')}</select><select data-compare-audio aria-label="比较视频声音"><option value="mute">静音</option><option value="a">A 声音</option><option value="b">B 声音</option></select><input data-compare-seek type="range" min="0" max="1" value="0" step="0.001" aria-label="同步播放进度"></div>` : ''}
        <div class="clab-compare-status clab-review-note" role="status">${a.type === 'image' ? '滚轮同步缩放；中键或空格＋左键同步平移。' : '两路视频共用进度，滚轮同步调节；以共同有效时长为范围。'}</div>` : `<div class="clab-preview-modal-empty">${a && b ? '请选择两张图片或两个视频进行对比。' : '点击上方 A 或 B，再从左侧历史记录中选择。'}</div>`}</div>`;
}

export function attachComparison(container, config) {
    const stage = container.querySelector('.clab-compare-stage');
    if (!stage) return () => {};
    const controller = new AbortController(), { signal } = controller;
    const transforms = [...stage.querySelectorAll('.clab-compare-transform')], videos = [...stage.querySelectorAll('video')];
    const status = container.querySelector('.clab-compare-status');
    let frame = 0, disposed = false, drag, space = false, timer, resume = false, buffering = false;
    const view = config.view;
    const updateView = () => {
        transforms.forEach(el => { el.style.transform = `translate(${view.x}px,${view.y}px) scale(${view.zoom})`; });
        stage.style.setProperty('--compare-split', `${view.split * 100}%`);
    };
    updateView();
    stage.addEventListener('pointerdown', event => {
        if (event.button === 1 || event.button === 0 && space) {
            event.preventDefault(); stage.setPointerCapture(event.pointerId); drag = { x: event.clientX, y: event.clientY, ox: view.x, oy: view.y };
        }
    }, { signal });
    stage.addEventListener('pointermove', event => {
        if (drag) { view.x = drag.ox + event.clientX - drag.x; view.y = drag.oy + event.clientY - drag.y; updateView(); }
        else if (config.layout === 'split') { const rect = stage.getBoundingClientRect(); view.split = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)); updateView(); }
    }, { signal });
    const stopDrag = () => { drag = null; };
    stage.addEventListener('pointerup', stopDrag, { signal }); stage.addEventListener('pointercancel', stopDrag, { signal });
    stage.addEventListener('auxclick', event => { if (event.button === 1) event.preventDefault(); }, { signal });
    document.addEventListener('keydown', event => { if (event.code === 'Space' && !event.target.closest('input,textarea,select,button,[contenteditable=true]')) { event.preventDefault(); space = true; } }, { signal });
    document.addEventListener('keyup', event => { if (event.code === 'Space') space = false; }, { signal });
    window.addEventListener('blur', () => { space = false; stopDrag(); }, { signal });
    if (!videos.length) {
        stage.addEventListener('wheel', event => { event.preventDefault(); view.zoom = Math.max(.2, Math.min(8, view.zoom * (event.deltaY < 0 ? 1.12 : .9))); updateView(); }, { passive: false, signal });
        stage.querySelectorAll('img').forEach(image => image.addEventListener('error', () => { status.textContent = '图片无法读取，请检查历史文件是否仍然存在。'; }, { signal }));
    } else {
        const play = container.querySelector('[data-compare-play]'), seek = container.querySelector('[data-compare-seek]'), time = container.querySelector('[data-compare-time]');
        let seeking = false, initialized=false;
        const saved=config.playback;
        const duration = () => videos.every(video => Number.isFinite(video.duration)) ? Math.min(...videos.map(video => video.duration)) : 0;
        const update = () => {
            const length = duration(); seek.max = length || 1; seek.disabled = !length;
            seek.value = Math.min(videos[0].currentTime, length);
            time.textContent = `${formatTime(videos[0].currentTime)} / ${formatTime(length)}`;
            play.textContent = videos[0].paused ? '播放' : '暂停';
        };
        const pause = () => { videos.forEach(video => video.pause()); cancelAnimationFrame(frame); frame = 0; update(); };
        const setTime = value => { const t = Math.max(0, Math.min(duration(), value)); videos.forEach(video => { if (video.readyState) video.currentTime = t; }); update(); };
        const tick = () => {
            frame = 0;
            if (disposed || videos[0].paused || document.hidden) return;
            if (videos[0].currentTime >= duration() - .03) { pause(); setTime(duration()); return; }
            if (Math.abs(videos[1].currentTime - videos[0].currentTime) > .08) videos[1].currentTime = videos[0].currentTime;
            update(); frame = requestAnimationFrame(tick);
        };
        const start = async () => {
            if (!duration() || disposed) return;
            if (videos[0].currentTime >= duration() - .03) setTime(0);
            try { await Promise.all(videos.map(video => video.play())); if (disposed) { pause(); return; } update(); if (!frame) frame = requestAnimationFrame(tick); }
            catch { if (!disposed) { pause(); status.textContent = '视频无法播放，请检查格式或文件是否有效。'; } }
        };
        const toggle = () => { resume = false; buffering = false; clearTimeout(timer); seeking = false; videos[0].paused ? void start() : pause(); };
        play.addEventListener('click', toggle, { signal });
        stage.addEventListener('click', event => { if (!space && event.button === 0) toggle(); }, { signal });
        const beginSeek = () => { if (!seeking) { resume = !videos[0].paused; pause(); seeking = true; } clearTimeout(timer); };
        const finishSeek = () => { if (!seeking) return; seeking = false; if (resume) void start(); resume = false; };
        seek.addEventListener('pointerdown', beginSeek, { signal });
        seek.addEventListener('input', () => { const value=Number(seek.value);if (!seeking) beginSeek(); setTime(value); }, { signal });
        seek.addEventListener('change', finishSeek, { signal });
        window.addEventListener('pointerup', finishSeek, { signal }); window.addEventListener('pointercancel', finishSeek, { signal });
        stage.addEventListener('wheel', event => { if (!duration()) return; event.preventDefault(); beginSeek(); setTime(videos[0].currentTime + (event.deltaY || event.deltaX) * .002); timer = setTimeout(finishSeek, 400); }, { passive: false, signal });
        container.querySelector('[data-compare-speed]').addEventListener('change', event => videos.forEach(video => { video.playbackRate = Number(event.target.value); }), { signal });
        container.querySelector('[data-compare-audio]').addEventListener('change', event => videos.forEach((video, index) => { video.muted = event.target.value !== (index ? 'b' : 'a'); }), { signal });
        const restore=()=>{
            update();if(initialized||!duration())return;initialized=true;
            videos.forEach((video,index)=>{video.playbackRate=saved.speed;video.muted=saved.audio!==(index?'b':'a');});
            container.querySelector('[data-compare-speed]').value=saved.speed;
            container.querySelector('[data-compare-audio]').value=saved.audio;
            setTime(saved.time);
            if(saved.playing||window._clabIsVideoAutoplayEnabled?.())void start();
        };
        for (const video of videos) {
            video.addEventListener('loadedmetadata', restore, { signal });
            video.addEventListener('durationchange', restore, { signal });
            video.addEventListener('timeupdate', update, { signal });
            video.addEventListener('error', () => { pause(); status.textContent = '视频无法读取或浏览器不支持此格式。'; }, { signal });
            video.addEventListener('waiting', () => { if (!seeking && !videos[0].paused) { buffering = true; pause(); } }, { signal });
            video.addEventListener('canplay', () => { if (buffering && videos.every(item => item.readyState >= 3)) { buffering = false; void start(); } }, { signal });
        }
        document.addEventListener('visibilitychange', () => { if (document.hidden) { resume = false; pause(); } }, { signal });
        update();
    }
    return () => {
        if(videos.length)config.playback={time:videos[0].currentTime,speed:videos[0].playbackRate,audio:container.querySelector('[data-compare-audio]').value,playing:!videos[0].paused||resume||buffering};
        disposed = true; controller.abort(); clearTimeout(timer); cancelAnimationFrame(frame); videos.forEach(video => { video.pause(); video.removeAttribute('src'); video.load(); });
    };
}
