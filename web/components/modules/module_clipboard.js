import { hasCardWindow,cardWindow } from '../workspace_modes/card_window.js';
import { state, appState } from '../ui_state.js';
import { showBindingToast } from '../ui_utils.js';
import { isModelFile } from './media_types/media_utils.js';

const extensions = {
    image: /\.(png|jpe?g|webp|gif|bmp|tiff?|svg|avif)$/i,
    video: /\.(mp4|webm|mov|avi|mkv|m4v)$/i,
    audio: /\.(mp3|wav|ogg|flac|aac|m4a|opus)$/i,
};

function mediaType(file) {
    const mimeType = file.type?.split('/')[0];
    if (Object.hasOwn(extensions, mimeType)) return mimeType;
    if (isModelFile(file.name)) return 'model';
    return Object.keys(extensions).find(type => extensions[type].test(file.name));
}

export function isUploadTypeMatch(file, uploadType) {
    return !!file && (uploadType === 'file' || mediaType(file) === uploadType || extensions[uploadType]?.test(file.name));
}

function clipboardMedia(text, html) {
    const urls = [];
    if (html) {
        const template = document.createElement('template');
        template.innerHTML = html;
        for (const media of template.content.querySelectorAll('img[src],video[src],audio[src],video source[src],audio source[src]')) {
            const tag = (media.closest('video,audio') || media).localName;
            urls.push([media.getAttribute('src'), tag === 'img' ? 'image' : tag]);
        }
    }
    if (text && !/\s/.test(text)) urls.push([text, null]);
    return urls.flatMap(([source, hint]) => {
        let url;
        try { url = new URL(source); } catch { return []; }
        const inlineType = /^data:(image|video|audio)\//i.exec(url.href)?.[1].toLowerCase();
        if (!inlineType && !['http:', 'https:'].includes(url.protocol)) return [];
        const basename = inlineType ? '' : url.pathname.split('/').at(-1);
        let name = basename;
        try { name = decodeURIComponent(basename); } catch {}
        name = name.replace(/[\\/:*?"<>|]/g, '_');
        const type = inlineType || hint || mediaType({name});
        return type ? [{url, name, type}] : [];
    });
}

async function readMedia({url, name, type}) {
    const response = await fetch(url, {credentials:'omit', referrerPolicy:'no-referrer'});
    if (!response.ok) throw new Error('媒体链接无法下载。');
    const blob = await response.blob();
    const mime = blob.type.split(';')[0];
    const suffix = {'image/jpeg':'jpg','image/svg+xml':'svg','audio/mpeg':'mp3','audio/mp4':'m4a','video/quicktime':'mov','model/gltf-binary':'glb','model/gltf+json':'gltf'}[mime] || mime.split('/')[1];
    if (mime && mime !== 'application/octet-stream' && !mime.startsWith(`${type}/`)) {
        throw new Error('链接未返回对应的媒体文件。');
    }
    if (!mediaType({name})) {
        const ext = /^[a-z0-9]+$/i.test(suffix) ? suffix : null;
        if (!ext) throw new Error('无法识别媒体文件格式。');
        name = `clipboard-${Date.now()}.${ext}`;
    }
    return new File([blob], name, {type:mime});
}

let clipboardBound = false;
export function bindMediaClipboard() {
    if (clipboardBound) return;
    clipboardBound = true;
    document.addEventListener('paste', event => {
        const panel = document.getElementById('clab-panel');
        const clipboard = event.clipboardData;
        if (!panel?.classList.contains('visible') || event.defaultPrevented || !clipboard) return;
        const active = document.activeElement;
        if (active?.isContentEditable || active?.matches('textarea:not([readonly]),input:not([readonly]):not([type=checkbox]):not([type=range]):not([type=file])')) return;
        const html = clipboard.getData('text/html');
        const text = clipboard.getData('text/plain').trim();
        if (panel.dataset.workspaceMode === 'table' && (/<table\b/i.test(html) || /[\t\r\n]/.test(text))) return;

        const ids = state.selectedAreaIds || [];
        const focused = active?.closest('.clab-area')?.dataset.areaId;
        const preferred = [focused, appState.lastClickedAreaId].filter(id => ids.includes(id));
        const files = [...clipboard.files, ...Array.from(clipboard.items).filter(item => item.kind === 'file').map(item => item.getAsFile())].filter(Boolean);
        const sources = clipboardMedia(text, html);
        if (!files.length && !sources.length) return;
        let foundTarget = false;
        function* selectedUploads() {
            for (const id of new Set([...preferred, ...ids])) {
                let cell = panel.querySelector(`.clab-cards-wrapper [data-area-id="${CSS.escape(id)}"]`);
                if(!cell&&hasCardWindow(panel.querySelector('#clab-cards-container')))cell=cardWindow(panel.querySelector('#clab-cards-container')).ensureArea(id);
                cell?.dispatchEvent(new CustomEvent('clab_ensure_component', {bubbles:true}));
                const entry = window._clabUploadHandlers?.get(id);
                if (entry?.zone.isConnected && panel.contains(entry.zone) && !entry.zone.closest('[hidden]')) { foundTarget = true; yield entry; }
            }
        }
        for (const entry of selectedUploads()) {
            const file = files.find(file => isUploadTypeMatch(file, entry.uploadType));
            if (!file) continue;
            event.preventDefault();
            event.stopPropagation();
            entry.upload(file);
            return;
        }
        for (const entry of selectedUploads()) {
            const source = sources.find(source => entry.uploadType === 'file' || entry.uploadType === source.type);
            if (!source) continue;
            event.preventDefault();
            event.stopPropagation();
            readMedia(source).then(file => {
                if (entry.zone.isConnected && window._clabUploadHandlers.get(entry.zone.dataset.area) === entry) return entry.upload(file);
            }).catch(error => showBindingToast(error instanceof TypeError ? '网页媒体无法直接读取。请保存文件后上传。' : error.message, true));
            return;
        }
        if (foundTarget && (files.length || sources.length)) {
            event.preventDefault();
            event.stopPropagation();
            showBindingToast('剪贴板中的媒体与所选输入类型不匹配。', true);
        }
    }, true);
}
