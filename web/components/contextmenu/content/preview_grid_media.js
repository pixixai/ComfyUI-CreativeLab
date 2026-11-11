import { getSteppedHistoryIndex, loadSelectedTextContent, syncTextContentWithSelection } from '../../modules/media_types/media_utils.js';
import { generateInputHTML } from '../../modules/module_input.js';
import { generateOutputHTML } from '../../modules/module_output.js';
import { attachVideoControls } from '../../modules/media_types/media_video.js';
import { attachAudioEvents, loadAudioWaveform, updateAudioProgress } from '../../modules/media_types/media_audio.js';
import { attachModelEvents } from '../../modules/media_types/media_model.js';
import { onModuleRemoved, releaseModuleTree } from '../../modules/module_lifecycle.js';

let audioObserver;

export function renderReviewArea(area, card) {
    const template = document.createElement('template');
    const generate = area.type === 'preview' ? generateOutputHTML : generateInputHTML;
    template.innerHTML = generate({...area,isManageMode:false},card);
    const cell = template.content.firstElementChild;
    for (const node of [cell,...cell.querySelectorAll('*')]) {
        node.removeAttribute('id');
        for (const attribute of node.getAttributeNames()) {
            if (attribute.startsWith('on')) node.removeAttribute(attribute);
        }
    }
    cell.classList.remove('active');
    cell.draggable = false;
    return cell;
}

export function attachReviewGridMedia(cell) {
    for (const player of cell.querySelectorAll('.clab-video-player')) {
        const video = player.querySelector('video');
        video.removeAttribute('autoplay');
        video.preload = 'metadata';
        onModuleRemoved(player,attachVideoControls(player));
    }
    attachAudioEvents(cell);
    for (const player of cell.querySelectorAll('.clab-audio-player')) {
        audioObserver ??= new IntersectionObserver(entries=>{
            for (const {target,isIntersecting} of entries) if (isIntersecting) loadAudioWaveform(target,true);
        });
        audioObserver.observe(player);
        const audio=player.querySelector('audio');
        for (const event of ['timeupdate','loadedmetadata','play','pause']) audio.addEventListener(event,()=>updateAudioProgress([player]));
        onModuleRemoved(player,()=>audioObserver.unobserve(player));
    }
    attachModelEvents(cell);
}

export function releaseReviewGridMedia(root) {
    if (!root) return;
    root.querySelectorAll('audio,video').forEach(media=>{media.pause();media.removeAttribute('src');media.load();});
    const children = [...root.children];
    root.replaceChildren();
    children.forEach(releaseModuleTree);
}

export function reviewHistoryDirection(event) {
    if (event.defaultPrevented||event.ctrlKey||event.metaKey||event.altKey||event.isComposing||
        event.target.closest('input,textarea,select,[contenteditable=true]')) return 0;
    if (event.key==='ArrowLeft'||event.key==='ArrowUp') return -1;
    return Number(event.key==='ArrowRight'||event.key==='ArrowDown');
}

export function stepReviewGridOutput(cell,card,area,direction) {
    let index=getSteppedHistoryIndex(area,direction);
    while (index>=0&&index<area.history.length&&!area.history[index]) index+=direction;
    if (index<0||!area.history?.[index]||index===area.historyIndex&&!area.missingHistoryRun) return null;
    const next={...area,historyIndex:index,resultUrl:area.history[index],missingHistoryRun:null,
        textHistory:area.textHistory?.slice(),textHistoryStatus:area.textHistoryStatus?.slice(),
        historyRuns:area.historyRuns?.slice(),inputHistorySnapshots:area.inputHistorySnapshots?.slice()};
    syncTextContentWithSelection(next);
    const render=()=>{
        const media=renderReviewArea(next,card);
        releaseReviewGridMedia(cell);
        cell.append(...media.children);
        attachReviewGridMedia(cell);
    };
    render();
    const output=cell.firstElementChild;
    void loadSelectedTextContent(next,{refresh:false}).then(changed=>{
        if (changed&&cell.isConnected&&cell.firstElementChild===output) render();
    });
    return next;
}
