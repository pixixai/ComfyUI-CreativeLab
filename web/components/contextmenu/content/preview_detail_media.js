import { renderVideoControls } from '../../modules/media_types/media_video.js';
import { renderAudio, attachAudioEvents, loadAudioWaveform, updateAudioProgress } from '../../modules/media_types/media_audio.js';
import { renderText, attachTextEvents, getRenderedTextHtml } from '../../modules/media_types/media_text.js';
import { renderModelViewer, attachModelEvents } from '../../modules/media_types/media_model.js';
import { releaseModuleTree } from '../../modules/module_lifecycle.js';
import { attachPreviewVideo } from './preview_video.js';
import { escapeHtml as esc, sanitizeHref } from './shared.js';

let audioId = 0;

export function detailMediaHTML(record, { textOptions } = {}) {
    if (!record) return '<div class="clab-detail-empty">尚无输出记录</div>';
    const url = esc(record.url);
    if (record.type === 'image') return `<img loading="lazy" draggable="false" src="${url}" alt="${esc(record.name)}">`;
    if (record.type === 'video') return `<div class="clab-preview-video clab-video-player clab-video-paused"><div class="clab-preview-video-transform"><video src="${url}" preload="metadata" muted playsinline></video></div>${renderVideoControls()}<div class="clab-preview-video-status" role="status"></div></div>`;
    if (record.type === 'audio') return renderAudio({ id: `detail-audio-${++audioId}` }, url, '');
    if (record.type === 'model') return renderModelViewer(record.url);
    if (record.type === 'text') return renderText(detailTextArea(record,textOptions));
    return `<div class="clab-detail-empty"><a href="${esc(sanitizeHref(record.url))}" target="_blank" rel="noopener noreferrer">${esc(record.name || '打开文件')}</a></div>`;
}

function detailTextArea(record,options={}) {
    return { id: 'detail-text', type: 'preview', resultUrl: record.url, history: [record.url], historyIndex: 0, textHistory: [record.text || ''], textContent: record.text || '', textSyntaxHighlight: !!options.syntax, textPreviewMarkdown: !!options.markdown };
}

export function attachDetailMedia(host, record, { active = () => true, resources, textOptions = {} } = {}) {
    const controller = new AbortController(), { signal } = controller;
    host.style.removeProperty('--detail-media-ratio');
    const image=host.querySelector(':scope>img'), movie=host.querySelector('video');
    const fit = () => { const width=image?.naturalWidth||movie?.videoWidth,height=image?.naturalHeight||movie?.videoHeight;if(width&&height)host.style.setProperty('--detail-media-ratio',width/height); };
    image?.addEventListener('load',fit,{signal});movie?.addEventListener('loadedmetadata',fit,{signal});fit();
    let releaseVideo, frame = 0, audioVisible = false;
    const video = host.querySelector('.clab-preview-video');
    if (video) releaseVideo = attachPreviewVideo(video, { active, status: video.querySelector('.clab-preview-video-status') });
    const audioPlayer = host.querySelector('.clab-audio-player'), audio = host.querySelector('audio');
    const tick = () => { frame = 0; if (audioVisible && !audio.paused && !document.hidden) { updateAudioProgress([audioPlayer]); frame = requestAnimationFrame(tick); } };
    const syncAudio = () => {
        if (!audio) return;
        updateAudioProgress([audioPlayer]);
        if (audio.paused || document.hidden || !audioVisible) { cancelAnimationFrame(frame); frame = 0; }
        else if (!frame) frame = requestAnimationFrame(tick);
    };
    if (audio) {
        attachAudioEvents(host);
        for (const type of ['play', 'pause', 'timeupdate', 'volumechange', 'ratechange', 'loadedmetadata']) audio.addEventListener(type, syncAudio, { signal });
        document.addEventListener('visibilitychange', syncAudio, { signal });
    }
    const observer = audio || video ? new IntersectionObserver(entries => {
        for (const { isIntersecting } of entries) {
            audioVisible = isIntersecting;
            if (audio) { loadAudioWaveform(audioPlayer, isIntersecting); if (!isIntersecting) audio.pause(); syncAudio(); }
            if (video && !isIntersecting) video.querySelector('video').pause();
        }
    }) : null;
    observer?.observe(host);
    if (record?.type === 'model') attachModelEvents(host, resources);
    if (record?.type === 'text') {
        const area = detailTextArea(record,textOptions);
        const refreshArea = () => {
            textOptions.syntax=area.textSyntaxHighlight;textOptions.markdown=area.textPreviewMarkdown;
            host.querySelector('.clab-text-body-content').innerHTML = getRenderedTextHtml(area);
            attachTextEvents(host, { resolveArea: () => area, refreshArea });
        };
        attachTextEvents(host, { resolveArea: () => area, refreshArea });
        if (!record.text) (resources?.read || fetch)(record.url, { signal }).then(response => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response.text();
        }).then(text => { if (!signal.aborted) { area.textContent = text; area.textHistory[0] = text; refreshArea(); } }).catch(error => {
            if (!signal.aborted) host.querySelector('.clab-text-body-content').textContent = `文本读取失败：${error.message}`;
        });
    }
    return () => {
        controller.abort(); observer?.disconnect(); cancelAnimationFrame(frame); releaseVideo?.();
        host.querySelectorAll('video,audio').forEach(media => { clearTimeout(media._scrubTimer); media.pause(); media.removeAttribute('src'); media.load(); });
        const children = [...host.children]; host.replaceChildren(); children.forEach(releaseModuleTree);
    };
}
