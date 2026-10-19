import { escapeHtml as esc } from './shared.js';
import { renderVideoControls } from '../../modules/media_types/media_video.js';
import { attachPreviewVideo } from './preview_video.js';

export function comparisonHTML(a, b, config) {
    const pair=JSON.stringify([a?.key || '',b?.key || ''].sort());
    if(config.pair!==pair) { config.pair=pair;config.playback={time:0,speed:1,audio:'mute',playing:undefined}; }
    const slot = (record, name) => {
        const label = record ? `${record.cardLabel} · ${record.areaLabel} · ${record.index < 0 ? '当前结果' : `历史 ${record.index + 1}`}` : '待选择媒体';
        const number = `<strong>${name.toUpperCase()}</strong>`, info = `<span>${esc(label)}</span>`, separator = '<i class="clab-compare-label-separator" aria-hidden="true"></i>';
        return `<button class="clab-compare-label label-${name}" data-compare-slot="${name}" aria-pressed="${config.slot === name}" title="${esc(label)}${record ? ` · ${esc(record.name)}` : ''}；点击设为待替换区域">${name === 'a' ? number + separator + info : info + separator + number}</button>`;
    };
    const valid = a && b && a.type === b.type && ['image', 'video'].includes(a.type);
    return `<div class="clab-compare"><div class="clab-compare-stage ${valid && a.type === 'video' ? 'clab-video-player clab-video-paused' : ''} ${config.layout === 'split' ? 'split' : 'side'}">
        ${[a, b].map((record, i) => `<div class="clab-compare-pane ${i ? 'layer-b' : 'layer-a'}">${record ? `<div class="clab-compare-transform">${record.type === 'image' ? `<img draggable="false" src="${esc(record.url)}" alt="${i ? 'B' : 'A'}">` : `<video src="${esc(record.url)}" preload="metadata" muted playsinline></video>`}</div>` : `<div class="clab-compare-empty">将图片或视频拖到 ${i ? 'B' : 'A'} 区域<br>或点击底部缩略图添加</div>`}</div>`).join('')}
        <div class="clab-compare-divider"></div>
        ${slot(a, 'a')}${slot(b, 'b')}
        <button class="clab-compare-swap" data-compare-swap title="交换 A/B" aria-label="交换 A/B"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="11.5" stroke="#222" stroke-opacity=".65" stroke-width="2"/><circle cx="12" cy="12" r="11.5" stroke="currentColor" stroke-width="1"/><path fill="currentColor" stroke="#222" stroke-opacity=".65" stroke-width=".5" stroke-linejoin="round" paint-order="stroke" d="M5 8h8V4l6 6H5V8Zm14 8h-8v4l-6-6h14v2Z"/></svg></button>
        ${valid && a.type === 'video' ? renderVideoControls('<select class="clab-video-controls-interactive" data-compare-audio aria-label="比较视频声音"><option value="mute">静音</option><option value="a">A 声音</option><option value="b">B 声音</option></select>') : ''}
        <div class="clab-compare-status" role="status">${valid ? a.type === 'image' ? '滚轮同步缩放；中键或空格＋左键同步平移。' : '' : a && b ? '请选择两张图片或两个视频进行对比。' : '点击底部缩略图轮流添加 A/B，也可拖到指定区域。'}</div>
        <div class="clab-compare-layout clab-review-segment"><button data-compare-layout="side" aria-pressed="${config.layout === 'side'}">并排比较</button><button data-compare-layout="split" aria-pressed="${config.layout === 'split'}">分屏比较</button></div></div></div>`;
}

export function syncComparison(container, config) {
    const stage = container.querySelector('.clab-compare-stage');
    if (!stage) return;
    stage.classList.toggle('side', config.layout === 'side'); stage.classList.toggle('split', config.layout === 'split');
    stage.style.setProperty('--compare-split', `${(config.layout === 'split' ? config.view.split : .5) * 100}%`);
    container.querySelectorAll('[data-compare-slot]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.compareSlot === config.slot)));
    container.querySelectorAll('[data-compare-layout]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.compareLayout === config.layout)));
}

export function attachComparison(container, config) {
    const stage = container.querySelector('.clab-compare-stage');
    if (!stage) return () => {};
    const controller = new AbortController(), { signal } = controller;
    const transforms = [...stage.querySelectorAll('.clab-compare-transform')], videos = [...stage.querySelectorAll('video')];
    const status = container.querySelector('.clab-compare-status');
    let drag, space = false;
    const view = config.view;
    const updateView = () => {
        transforms.forEach(el => { el.style.transform = `translate(${view.x}px,${view.y}px) scale(${view.zoom})`; });
        stage.style.setProperty('--compare-split', `${(config.layout === 'split' ? view.split : .5) * 100}%`);
    };
    updateView();
    syncComparison(container, config);
    if (!videos.length) stage.addEventListener('pointerdown', event => {
        if (event.target.closest('button,input,select,.clab-video-controls-interactive')) return;
        if (event.button === 1 || event.button === 0 && space) {
            event.preventDefault(); stage.setPointerCapture(event.pointerId); drag = { x: event.clientX, y: event.clientY, ox: view.x, oy: view.y };
        }
    }, { signal });
    stage.addEventListener('pointermove', event => {
        if (drag) { view.x = drag.ox + event.clientX - drag.x; view.y = drag.oy + event.clientY - drag.y; updateView(); }
        else if (config.layout === 'split' && !event.target.closest('button,input,select,.clab-video-controls-interactive')) { const rect = stage.getBoundingClientRect(); view.split = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)); updateView(); }
    }, { signal });
    const stopDrag = () => { drag = null; };
    stage.addEventListener('pointerup', stopDrag, { signal }); stage.addEventListener('pointercancel', stopDrag, { signal });
    stage.addEventListener('auxclick', event => { if (event.button === 1) event.preventDefault(); }, { signal });
    if (!videos.length) document.addEventListener('keydown', event => { if (event.code === 'Space' && !event.target.closest('input,textarea,select,button,[contenteditable=true]')) { event.preventDefault(); space = true; } }, { signal });
    document.addEventListener('keyup', event => { if (event.code === 'Space') space = false; }, { signal });
    window.addEventListener('blur', () => { space = false; stopDrag(); }, { signal });
    if (!videos.length) {
        stage.addEventListener('wheel', event => { event.preventDefault(); view.zoom = Math.max(.2, Math.min(8, view.zoom * (event.deltaY < 0 ? 1.12 : .9))); updateView(); }, { passive: false, signal });
        stage.querySelectorAll('img').forEach(image => image.addEventListener('error', () => { status.textContent = '图片无法读取，请检查历史文件是否仍然存在。'; }, { signal }));
    }
    const releaseVideo = stage.classList.contains('clab-video-player') ? attachPreviewVideo(stage, { view, playback: config.playback, status }) : null;
    return () => {
        controller.abort(); releaseVideo?.();
        if (!releaseVideo) videos.forEach(video => { video.pause(); video.removeAttribute('src'); video.load(); });
    };
}
