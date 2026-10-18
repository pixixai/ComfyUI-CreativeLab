const passed = [];
const errors = [];
window.testProgress = { passed, errors };
window.addEventListener('error', event => { if (event.message) errors.push(event.message); });
window.addEventListener('unhandledrejection', event => errors.push(String(event.reason)));
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const areaElement = id => document.querySelector(`.clab-area[data-area-id="${id}"]`);

try {
    let frames = 0;
    const raf = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = callback => raf(time => { frames++; callback(time); });
    const observed = new Map();
    const NativeResizeObserver = window.ResizeObserver;
    window.ResizeObserver = class extends NativeResizeObserver {
        constructor(...args) { super(...args); this.targets = new Set(); }
        observe(target, options) { this.targets.add(target); observed.set(target, (observed.get(target) || 0) + 1); super.observe(target, options); }
        unobserve(target) { this.targets.delete(target); observed.delete(target); super.unobserve(target); }
        disconnect() { this.targets.forEach(target => observed.delete(target)); this.targets.clear(); super.disconnect(); }
    };
    const anchor = { type: 'CLab_SystemConfig', widgets: [{ name: 'scenes_data', value: '{}' }] };
    const node = { id: 1, title: 'Input', type: 'Text', widgets: [{ name: 'text', type: 'text', value: 'initial' }] };
    const uploadNode = { id: 4, type: 'LoadImage', widgets: [{ name: 'image', type: 'combo', value: 'input.png', options: { values: ['input.png', 'other.png'], image_upload: true } }] };
    const audioNode = { id:5, type:'LoadAudio', widgets:[{name:'audio',type:'combo',value:'audio.wav',options:{values:['audio.wav'],audio_upload:true}}] };
    const videoNode = { id:6, type:'LoadVideo', widgets:[{name:'video',type:'combo',value:'video.webm',options:{values:['video.webm'],video_upload:true}}] };
    const modelNode = { id:7, type:'Load3D', widgets:[{name:'model_file',type:'combo',value:'model.glb',options:{values:['model.glb','other.glb'],upload:'model'}}] };
    const graphNodes = [anchor,node,uploadNode,audioNode,videoNode,modelNode];
    window.testApp = {
        graph: { _nodes: graphNodes, getNodeById: id => graphNodes.find(item => item.id === Number(id)), clear() {}, serialize() { return { nodes: [{ widgets_values: [anchor.widgets[0].value] }] }; } },
        canvas: { deselectAllNodes() {} },
        registerExtension(extension) { this.extension = extension; },
        async graphToPrompt() { return { output: { 1: { inputs: { text: 'initial' } }, 2: { inputs: { text: ['1', 0] } } } }; },
        async queuePrompt() {},
    };
    const listeners = new Map();
    window.testApi = {
        addEventListener(type, callback) { const list = listeners.get(type) || []; list.push(callback); listeners.set(type, list); },
        apiURL: url => url, async fetchApi() { return {}; }, async queuePrompt() { return { prompt_id: 'browser-run' }; },
    };
    await import('/extensions/clab/main.js');
    const { state } = await import('/extensions/clab/components/ui_state.js');
    const { StateManager } = await import('/extensions/clab/state_manager.js');
    const { togglePanel } = await import('/extensions/clab/ui_panel.js');
    const { attachAreaEvents, surgicallyUpdateArea, scheduleAreaUpdate } = await import('/extensions/clab/components/comp_modulearea.js');
    const { updateSelectionUI } = await import('/extensions/clab/components/ui_selection.js');
    const { onModuleRemoved, moveModuleDOM } = await import('/extensions/clab/components/modules/module_lifecycle.js');
    await testApp.extension.setup();
    togglePanel();
    document.querySelector('#clab-global-add-card').click();
    const firstCard = state.cards[0];
    const firstCardElement = document.querySelector(`.clab-card[data-card-id="${firstCard?.id}"]`);
    assert(firstCard && firstCardElement, 'first new task exists in state but is missing from the first-open DOM');
    assert(firstCardElement.getBoundingClientRect().width > 0, 'first new task is not visible');
    passed.push('first open with an empty workspace displays a new task immediately');
    document.querySelector('#clab-global-add-module').click();
    assert(firstCard.areas.length === 1 && areaElement(firstCard.areas[0].id), 'new task cannot display its first module');
    passed.push('the first new task accepts modules without reopening the panel');
    firstCardElement.querySelector('.clab-del-card-btn').click();
    assert(state.cards.length === 0, 'failed to delete the first task');
    const emptyWrapper = document.querySelector('.clab-cards-wrapper');
    document.querySelector('#clab-global-add-card').click();
    assert(document.querySelector('.clab-card') && document.querySelector('.clab-cards-wrapper') === emptyWrapper, 'recreating a task after deleting all tasks lost the existing list');
    document.querySelector('.clab-del-card-btn').click();
    togglePanel();
    passed.push('an initialized empty list is reused when recreating tasks');
    const input = { id: 'input', type: 'edit', value: 'initial', targetNodeId: '1', targetWidget: 'text', dataType: 'string', autoHeight: true };
    const text = { id: 'text', type: 'preview', resultKind: 'text', targetNodeId: '2', history: ['/view?filename=first.txt', '/view?filename=second.txt'], historyIndex: 0, resultUrl: '/view?filename=first.txt', textHistory: ['first text', 'second text'], textHistoryStatus: ['ready', 'ready'], textContent: 'first text', textLoadState: 'ready' };
    const image = { id: 'image', type: 'preview', resultKind: 'image', targetNodeId: '2', history: ['/view?filename=first.png'], historyIndex: 0, resultUrl: '/view?filename=first.png', ratio: '16:9' };
    const card = { id: 'card', areas: [input, text, image] };
    state.cards.push(card);
    togglePanel();
    await delay(200);
    assert(areaElement('input') && areaElement('text') && areaElement('image'), 'real module setup failed');
    assert(errors.length === 0, errors.join('\n'));
    passed.push('production ES modules initialize with the ComfyUI boundary stub');

    const original = [areaElement('input'), areaElement('text'), areaElement('image')];
    const textarea = original[0].querySelector('textarea');
    const textBody = original[1].querySelector('.clab-text-body-content');
    const img = original[2].querySelector('img');
    const originalCard = document.querySelector('.clab-card');
    textarea.focus(); textarea.setSelectionRange(2, 4);
    for (let i = 0; i < 20; i++) { togglePanel(); togglePanel(); }
    await delay(200);
    assert(original.every((element, index) => element === areaElement(card.areas[index].id)), 'reopening replaced module DOM');
    assert(originalCard === document.querySelector('.clab-card'), 'reopening replaced card DOM');
    assert(textBody === areaElement('text').querySelector('.clab-text-body-content') && img === areaElement('image').querySelector('img'), 'reopening replaced content');
    assert(document.activeElement === textarea && textarea.selectionStart === 2 && textarea.selectionEnd === 4, 'input focus or caret was lost');
    passed.push('twenty reopen cycles preserve card, module, text, image and input focus');

    for (let i = 0; i < 20; i++) attachAreaEvents(originalCard);
    assert(observed.get(textarea) === 1, `textarea observed ${observed.get(textarea)} times`);
    assert(observed.get(areaElement('text').querySelector('.clab-text-preview-shell')) === 1, 'text shell observed more than once');
    passed.push('repeated event binding keeps one observer per control');

    let saves = 0;
    const sync = StateManager.syncToNode;
    StateManager.syncToNode = function(...args) { saves++; return sync.apply(this, args); };
    for (let i = 0; i < 20; i++) { textarea.value = `edit ${i}`; textarea.dispatchEvent(new Event('input')); }
    assert(input.value === 'edit 19' && saves === 0, 'typing did not update immediately or serialized per character');
    const serialized = testApp.graph.serialize();
    assert(JSON.parse(serialized.nodes[0].widgets_values[0]).workspaces[0].cards[0].areas[0].value === 'edit 19', 'workflow save lost the latest edit');
    assert(saves === 1, 'workflow save did not coalesce pending input');
    await delay(300);
    assert(saves === 1, 'a stale save callback ran after flush');
    passed.push('continuous typing coalesces saves and workflow serialization flushes immediately');
    const beforeSelection = saves;
    for (let i = 0; i < 10; i++) updateSelectionUI();
    assert(saves === beforeSelection, 'selection saved synchronously');
    await delay(300);
    assert(saves === beforeSelection + 1, 'selection saves were not coalesced');
    passed.push('selection changes share one deferred save');

    const gear = original[2].querySelector('.clab-output-settings-trigger');
    const binding = original[2].querySelector('.clab-module-binding-summary');
    image.ratio = '1:1'; image.fillMode = '填充'; image.targetNodeId = '3';
    surgicallyUpdateArea(image.id);
    assert(areaElement('image') === original[2] && original[2].querySelector('img') === img, 'appearance change replaced the media');
    assert(original[2].querySelector('.clab-output-settings-trigger') === gear && original[2].querySelector('.clab-module-binding-summary') === binding, 'appearance change replaced toolbar controls');
    assert(img.style.objectFit === 'cover' && original[2].querySelector('.clab-preview-bg').style.aspectRatio.includes('1'), 'appearance was not updated');
    assert(binding.textContent.includes('[3]'), 'binding label was not updated');
    passed.push('dimensions, fit and binding changes patch existing output controls');
    image.resultUrl = '/view?filename=second.png';
    surgicallyUpdateArea(image.id);
    assert(original[2].querySelector('img') === img && img.src.includes('second.png'), 'history source change did not reuse the image');
    passed.push('image source changes preserve the output shell and image element');

    const shell = areaElement('text').querySelector('.clab-text-preview-shell');
    text.historyIndex = 1; text.resultUrl = text.history[1]; text.textContent = text.textHistory[1];
    surgicallyUpdateArea(text.id);
    assert(shell === areaElement('text').querySelector('.clab-text-preview-shell') && shell.textContent.includes('second text'), 'text history replaced the shell or failed to update');
    assert(shell.querySelector('.clab-text-history-position').textContent.trim() === '2 / 2', 'text position was not updated');
    const syntax = shell.querySelector('[data-option="syntax"]');
    syntax.checked = true; syntax.dispatchEvent(new Event('change'));
    assert(text.textSyntaxHighlight && syntax === areaElement('text').querySelector('[data-option="syntax"]'), 'text option stopped working');
    passed.push('text history and display options update inside the existing shell');

    text.textContent = 'long text\n'.repeat(300);
    surgicallyUpdateArea(text.id); await delay(80);
    const viewport = shell.querySelector('.clab-text-body-scroll');
    viewport.scrollTop = 70;
    togglePanel(); togglePanel(); await delay(80);
    assert(viewport.scrollTop === 70, 'reopening reset text scroll position');
    passed.push('reopening preserves the scroll position of long text');

    let replacements = 0;
    const observer = new MutationObserver(records => { replacements += records.reduce((sum, record) => sum + record.removedNodes.length, 0); });
    observer.observe(original[2].parentElement, { childList: true });
    for (let i = 0; i < 20; i++) scheduleAreaUpdate(image.id);
    await delay(80);
    observer.disconnect();
    assert(replacements === 0 && areaElement('image') === original[2], 'batched appearance update replaced modules');
    passed.push('batched output updates leave unrelated module DOM intact');

    const waiting = { id: 'waiting', type: 'preview', history: [], targetNodeId: '2' };
    card.areas.push(waiting);
    document.dispatchEvent(new Event('clab_render_ui'));
    const waitingRoot = areaElement('waiting');
    const waitingImage = waitingRoot.querySelector('img');
    waiting.resultUrl = '/view?filename=arrived.png'; waiting.resultKind = 'image';
    waiting.history.push(waiting.resultUrl);
    surgicallyUpdateArea(waiting.id);
    assert(waitingImage === waitingRoot.querySelector('.clab-media-target') && waitingImage.style.display !== 'none', 'initial output failed to promote its placeholder image');
    passed.push('first image output updates the existing placeholder and media identity');

    const uploadArea = { id: 'upload', type: 'edit', targetNodeId: '4', targetWidget: 'image', value: 'input.png', autoHeight: true, showUploadPreview: true };
    card.areas.push(uploadArea);
    document.dispatchEvent(new Event('clab_render_ui')); await delay(120);
    const uploadRoot = areaElement('upload');
    const uploadImage = uploadRoot.querySelector('img');
    const uploadSelect = uploadRoot.querySelector('.clab-custom-select');
    const zone = uploadRoot.querySelector('.clab-upload-zone');
    for (let i = 0; i < 5; i++) { surgicallyUpdateArea('upload'); togglePanel(); togglePanel(); }
    assert(areaElement('upload') === uploadRoot && uploadRoot.querySelector('img') === uploadImage && uploadRoot.querySelector('.clab-custom-select') === uploadSelect, 'upload plus file-list refresh rebuilt input media');
    assert(zone.querySelector('.clab-upload-preview').style.aspectRatio === '150 / 300', 'reopening lost the upload media aspect ratio');
    uploadArea.autoHeight = false; surgicallyUpdateArea('upload');
    assert(zone.querySelector('.clab-upload-preview').style.aspectRatio === '16 / 9', 'disabling auto height did not restore the fixed ratio');
    uploadArea.autoHeight = true; surgicallyUpdateArea('upload');
    assert(zone.querySelector('.clab-upload-preview').style.aspectRatio === '150 / 300', 'enabling auto height did not restore the actual ratio');
    uploadNode.widgets[0].options.values.push('third.png'); surgicallyUpdateArea('upload');
    assert(uploadSelect.textContent.includes('third.png'), 'server file-list changes were not patched');
    passed.push('upload previews and server file lists update independently without replacing the media');
    uploadArea.value = 'other.png'; surgicallyUpdateArea('upload');
    let uploadClicks = 0;
    uploadRoot.querySelector('.clab-file-input').click = () => uploadClicks++;
    uploadRoot.querySelector('.clab-upload-trigger-btn').click();
    assert(uploadClicks === 1, 'upload button kept the replaced file-input closure');
    uploadRoot.querySelector('.clab-upload-clear-btn').click();
    assert(uploadArea.value === '' && uploadRoot.querySelector('.clab-upload-clear-btn').disabled, 'clear upload did not update its button state');
    assert(window._clabUploadHandlers.has('upload'), 'upload handler was not registered');
    uploadRoot.remove(); await delay(20);
    assert(!window._clabUploadHandlers.has('upload'), 'deleted upload handler was retained');
    passed.push('upload controls follow replaced inputs and release handlers on deletion');

    // A real video stream exercises browser playback without downloading a media fixture.
    const canvas = document.createElement('canvas'); canvas.width = 64; canvas.height = 64;
    canvas.getContext('2d').fillRect(0, 0, 64, 64);
    const stream = canvas.captureStream(10);
    const videoArea = { id: 'video', type: 'preview', targetNodeId: '2', resultKind: 'video', resultUrl: '/view?filename=video.webm', history: ['/view?filename=video.webm'], historyIndex: 0, ratio: '16:9' };
    card.areas = [videoArea, input, text, image];
    document.dispatchEvent(new Event('clab_render_ui'));
    const videoRoot = areaElement('video');
    const video = videoRoot.querySelector('video');
    video.srcObject = stream;
    await video.play(); await delay(150);
    assert(!videoRoot.querySelector('.clab-video-play'), 'video still contains a separate play button');
    video.click(); await delay(30);
    assert(video.paused && videoRoot.querySelector('.clab-video-player').classList.contains('clab-video-paused'), 'clicking the video did not pause playback');
    video.click(); await delay(50);
    assert(!video.paused, 'clicking the video again did not resume playback');
    const centerY = element => { const rect = element.getBoundingClientRect(); return rect.top + rect.height / 2; };
    const videoTimeY = centerY(videoRoot.querySelector('.clab-timecode'));
    assert(Math.abs(videoTimeY - centerY(videoRoot.querySelector('.clab-opt-mute'))) < 1 && Math.abs(videoTimeY - centerY(videoRoot.querySelector('.clab-video-speed-val'))) < 1, 'video time, volume and speed are not vertically aligned');
    passed.push('video clicks toggle playback and its remaining controls share one horizontal centerline');
    video.pause(); const time = video.currentTime;
    for (let i = 0; i < 8; i++) { videoArea.fillMode = i % 2 ? '填充' : '显示全部'; surgicallyUpdateArea(videoArea.id); togglePanel(); togglePanel(); }
    assert(areaElement('video') === videoRoot && videoRoot.querySelector('video') === video, 'video DOM changed during appearance/reopen');
    assert(video.paused && Math.abs(video.currentTime - time) < 0.1, 'paused video resumed or rewound');
    passed.push('paused video preserves its element, playback position and paused state');
    await delay(250); let count = frames; await delay(120);
    assert(frames === count, `idle paused media kept scheduling frames: ${frames - count}`);
    passed.push('paused media does not run a background animation loop');
    await video.play(); await delay(150); count = frames; await delay(100);
    assert(frames > count, 'visible playing video did not update progress');
    const originalList = videoRoot.parentElement;
    const temporaryList = document.createElement('div');
    document.querySelector('#clab-panel').append(temporaryList);
    moveModuleDOM(temporaryList, videoRoot); await delay(30);
    assert(!video.paused, 'moving the video module paused playback');
    moveModuleDOM(originalList, videoRoot, originalList.firstElementChild); await delay(30);
    assert(!video.paused, 'moving the video back paused playback');
    Object.defineProperty(temporaryList, 'moveBefore', { value: undefined });
    moveModuleDOM(temporaryList, videoRoot); await delay(30);
    assert(!video.paused, 'fallback DOM move did not resume the previously playing media');
    moveModuleDOM(originalList, videoRoot, originalList.firstElementChild);
    temporaryList.remove();
    passed.push('native and fallback module moves preserve playing media');
    togglePanel(); await delay(100); count = frames; await delay(120);
    assert(frames === count, 'closed panel still scheduled playback UI frames');
    assert(!video.paused, 'hiding the panel changed video playback');
    togglePanel(); await delay(150);
    assert(videoRoot.querySelector('video') === video && !video.paused, 'reopening replaced or paused a playing video');
    video.pause();
    passed.push('hidden panel stops progress polling while preserving playback');
    const fallbackTime = video.currentTime;
    state.cards.push({ id: 'new-card', areas: [] });
    document.dispatchEvent(new Event('clab_render_ui')); await delay(100);
    assert(areaElement('video').querySelector('video') === video && video.paused && Math.abs(video.currentTime - fallbackTime) < 0.1, 'structural rebuild failed to restore the original paused media');
    state.cards.pop();
    stream.getTracks().forEach(track => track.stop());
    passed.push('structural rebuild keeps the media vault fallback and paused playback state');

    const history = Array.from({ length: 120 }, (_, index) => `/view?filename=thumb${index}.png`);
    image.history = history; image.historyIndex = 0; image.resultUrl = history[0]; image.isManageMode = true;
    card.areas = [image];
    document.dispatchEvent(new Event('clab_render_ui'));
    await delay(250);
    const grid = areaElement('image').querySelector('.clab-history-grid');
    const loaded = () => grid.querySelectorAll('img[src]').length;
    const firstLoaded = loaded();
    assert(firstLoaded > 0 && firstLoaded < history.length, `loaded ${firstLoaded} of ${history.length} thumbnails immediately`);
    const firstThumb = grid.querySelector('.clab-history-thumb');
    const firstImage = firstThumb.querySelector('img');
    image.selectedThumbIndices = [0]; surgicallyUpdateArea(image.id);
    assert(grid === areaElement('image').querySelector('.clab-history-grid') && grid.firstElementChild === firstThumb && firstThumb.querySelector('img') === firstImage, 'thumbnail selection reloaded the grid');
    assert(firstThumb.querySelector('.clab-thumb-selection'), 'thumbnail selection did not update');
    grid.scrollTop = grid.scrollHeight; await delay(250);
    assert(loaded() > firstLoaded && grid.lastElementChild.querySelector('img').getAttribute('src'), 'scrolling did not load the final thumbnails');
    passed.push('history thumbnails load near the viewport and selection preserves loaded elements');

    let released = 0;
    onModuleRemoved(firstThumb, () => released++);
    const parent = grid.parentElement; parent.appendChild(firstThumb); await delay(20);
    assert(released === 0, 'moving a module released live resources');
    firstThumb.remove(); await delay(20);
    assert(released === 1, 'removed resources were not released');
    passed.push('resource cleanup distinguishes DOM moves from deletion');
    assert(!observed.has(shell), 'removed text shell remained observed');
    passed.push('replaced text previews stop observing detached shells');

    let waveformRequests = 0;
    const originalFetch = window.fetch;
    window.fetch = (...args) => { if (String(args[0]).includes('.wav')) waveformRequests++; return originalFetch(...args); };
    const audio = { id: 'audio', title: '音频', type: 'preview', targetNodeId: '2', resultKind: 'audio', resultUrl: '/view?filename=audio.wav', history: ['/view?filename=audio.wav', '/view?filename=second.wav'], historyIndex: 0, ratio: '16:9', matchMedia: true };
    const model = { id: 'model', title: '模型', type: 'preview', targetNodeId: '2', resultKind: 'file', resultUrl: '/view?filename=model.glb', history: ['/view?filename=model.glb', '/view?filename=other.glb'], historyIndex: 0, ratio: '16:9' };
    Object.assign(image, { isManageMode: false, history: ['/view?filename=first.png', '/view?filename=second.png'], resultUrl: '/view?filename=first.png', historyIndex: 0, title: '图片' });
    Object.assign(text, { textContent: '# 文本预览\n真实组件的显示效果。', textPreviewMarkdown: true, title: '文本' });
    card.areas = [image, audio, text, model];
    togglePanel();
    document.dispatchEvent(new Event('clab_render_ui')); await delay(80);
    assert(waveformRequests === 0, 'hidden audio decoded a waveform');
    togglePanel(); await delay(180);
    const outputImage = areaElement('image'), footer = outputImage.querySelector('.clab-output-footer');
    assert(footer.querySelector('.clab-output-metadata').textContent === '320 × 180', 'image footer shows configured dimensions instead of actual media dimensions');
    assert(footer.getBoundingClientRect().top >= outputImage.querySelector('.clab-preview-bg').getBoundingClientRect().bottom - 1, 'footer overlays the image');
    const footerCounter = footer.querySelector('.clab-output-history-position');
    assert(footerCounter.textContent === '1 / 2' && footerCounter.getBoundingClientRect().right >= footer.getBoundingClientRect().right - 13, 'history counter is not bottom right');
    const retainedImage = outputImage.querySelector('img');
    image.history.pop(); surgicallyUpdateArea('image');
    assert(!footer.querySelector('.clab-output-history-position') && outputImage.querySelector('img') === retainedImage, 'single history did not hide its counter in place');
    image.history.push('/view?filename=second.png'); image.historyIndex = 1; image.resultUrl = image.history[1]; surgicallyUpdateArea('image');
    assert(footer.querySelector('.clab-output-history-position').textContent === '2 / 2' && outputImage.querySelector('img') === retainedImage, 'new history did not restore the counter in place');
    passed.push('actual media dimensions and bottom-right history update without replacing the image');

    image.missingHistoryRun = { promptId: 'missing' }; image.resultUrl = ''; surgicallyUpdateArea('image');
    assert(outputImage.querySelector('.clab-output-history-position').textContent === '— / 2', 'missing linked history has an incorrect counter');
    delete image.missingHistoryRun; image.resultUrl = image.history[0]; image.historyIndex = 0; surgicallyUpdateArea('image');
    text.missingHistoryRun = { promptId: 'missing' }; surgicallyUpdateArea('text');
    assert(areaElement('text').querySelector('.clab-text-history-position').textContent === '— / 2' && areaElement('text').querySelector('.clab-text-state'), 'missing text history lost its footer');
    delete text.missingHistoryRun; surgicallyUpdateArea('text');
    passed.push('missing linked image and text records keep their history position');

    const audioRoot = areaElement('audio'), audioPlayer = audioRoot.querySelector('.clab-audio-player'), audioElement = audioRoot.querySelector('audio');
    audioRoot.scrollIntoView({ block: 'center' });
    for (let i = 0; i < 40 && !audioRoot.querySelector('.clab-audio-wave-status').hidden; i++) await delay(50);
    assert(audioRoot.querySelector('.clab-audio-wave-status').hidden, 'real WAV waveform was not decoded');
    assert(audioRoot.querySelector('.clab-output-metadata').textContent === 'WAV · 00:02', 'audio footer did not load duration');
    const waveCanvas = audioRoot.querySelector('.clab-audio-wave-base');
    const pixels = waveCanvas.getContext('2d').getImageData(0, 0, waveCanvas.width, waveCanvas.height).data;
    assert(pixels.some((value, index) => index % 4 === 3 && value > 0), 'decoded audio produced an empty waveform');
    assert(audioRoot.querySelector('.clab-preview-bg').getBoundingClientRect().height < 160, 'audio preview still uses a large media frame');
    assert(waveformRequests === 1, `waveform was fetched ${waveformRequests} times`);
    const audioPosition = .5;
    audioElement.currentTime = audioPosition;
    for (let i = 0; i < 4; i++) { surgicallyUpdateArea('audio'); togglePanel(); togglePanel(); }
    assert(audioRoot.querySelector('audio') === audioElement && audioRoot.querySelector('.clab-audio-player') === audioPlayer && audioRoot.querySelector('canvas') === waveCanvas, 'reopening or restyling replaced the audio player');
    assert(audioElement.paused && Math.abs(audioElement.currentTime - audioPosition) < .1 && waveformRequests === 1, `audio state or waveform cache was lost: paused=${audioElement.paused}, time=${audioElement.currentTime}, requests=${waveformRequests}`);
    audio.matchMedia = false; audio.ratio = '1:1'; surgicallyUpdateArea('audio'); await delay(30);
    const audioFrame = audioRoot.querySelector('.clab-preview-bg');
    assert(audioFrame.style.aspectRatio.startsWith('1') && Math.abs(audioFrame.clientWidth - audioFrame.clientHeight) < 2 && audioRoot.querySelector('audio') === audioElement, 'explicit audio dimensions were ignored');
    audio.matchMedia = true; surgicallyUpdateArea('audio'); await delay(30);
    assert(audioFrame.clientHeight < 160, 'matching audio did not restore compact height');
    passed.push('visible WAV previews decode real peaks once and preserve audio playback state');

    const waveControl = audioRoot.querySelector('.clab-audio-wave');
    assert(!audioRoot.querySelector('.clab-audio-play'), 'audio still contains a separate play button');
    const waveBounds = waveControl.getBoundingClientRect();
    assert(Math.abs(audioRoot.querySelector('.clab-audio-time').getBoundingClientRect().left - waveBounds.left) < 1, 'audio time is not left aligned');
    const beforeWaveClick = audioElement.currentTime;
    waveControl.dispatchEvent(new MouseEvent('mousedown', { button: 0, bubbles: true, clientX: waveBounds.right - 4, clientY: waveBounds.top + 8 }));
    waveControl.click(); await delay(80);
    assert(!audioElement.paused && waveControl.getAttribute('aria-label') === '暂停音频', 'waveform click did not play audio');
    waveControl.click();
    assert(audioElement.paused && Math.abs(audioElement.currentTime - beforeWaveClick) < .25, 'waveform click changed the playback position or failed to pause');
    const audioSeek = audioRoot.querySelector('.clab-audio-seek'); audioSeek.value = 600; audioSeek.dispatchEvent(new Event('input'));
    assert(Math.abs(audioElement.currentTime - 1.2) < .1, 'audio seek control stopped working');
    audioRoot.querySelector('.clab-opt-mute').click(); assert(audioElement.muted, 'audio mute control stopped working');
    audioRoot.querySelector('.clab-audio-speed-toggle').click();
    document.querySelector('.clab-audio-speed-dropdown .clab-audio-preset[data-spd="1.5"]').click();
    assert(audioElement.playbackRate === 1.5 && audioRoot.querySelector('.clab-audio-speed-val').textContent === '1.5×', 'audio speed control stopped working');
    audio.historyIndex = 1; audio.resultUrl = audio.history[1]; surgicallyUpdateArea('audio');
    for (let i = 0; i < 40 && !audioRoot.querySelector('.clab-audio-wave-status').hidden; i++) await delay(50);
    assert(waveformRequests === 2 && audioRoot.querySelector('.clab-output-history-position').textContent === '2 / 2', 'audio history did not refresh its waveform and position');
    audio.historyIndex = 0; audio.resultUrl = audio.history[0]; surgicallyUpdateArea('audio'); await delay(80);
    assert(waveformRequests === 2 && audioRoot.querySelector('.clab-audio-wave-status').hidden, 'revisiting audio fetched the decoded waveform again');
    passed.push('audio play, seek, mute, speed and history remain functional');

    const copyButton = areaElement('text').querySelector('.clab-text-copy-btn');
    let copiedText = '';
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async value => { copiedText = value; } } });
    copyButton.click(); await delay(20);
    assert(copiedText === text.textContent && copyButton.querySelector('svg') && copyButton.getAttribute('aria-label') === '已复制', 'copy icon failed to copy raw Markdown or show feedback');
    await delay(1250);
    assert(copyButton.querySelector('svg') && !copyButton.disabled && copyButton.title === '复制全文', 'copy feedback did not restore the icon');
    passed.push('the compact copy icon copies raw Markdown and restores after feedback');

    for (const id of ['image', 'audio', 'text', 'model']) {
        const el = areaElement(id); el.style.width = '190px';
        assert(el.scrollWidth <= el.clientWidth + 6, `${id} output overflows a narrow module beyond the 5px delete control`);
    }
    const textToolbar = areaElement('text').querySelector('.clab-text-toolbar');
    assert(textToolbar.scrollWidth <= textToolbar.clientWidth + 1 && getComputedStyle(textToolbar.querySelector('.clab-text-option span')).textOverflow === 'ellipsis', 'narrow text options are not ellipsized');
    const toolbarStyle = getComputedStyle(textToolbar), toolbarBounds = textToolbar.getBoundingClientRect();
    assert(toolbarStyle.paddingTop === toolbarStyle.paddingBottom, 'text toolbar has unequal vertical padding');
    const toolbarCenter = (toolbarBounds.top + parseFloat(toolbarStyle.borderTopWidth) + parseFloat(toolbarStyle.paddingTop) + toolbarBounds.bottom - parseFloat(toolbarStyle.borderBottomWidth) - parseFloat(toolbarStyle.paddingBottom)) / 2;
    for (const label of textToolbar.querySelectorAll('.clab-text-option')) {
        assert(Math.abs(centerY(label) - toolbarCenter) < 1 && Math.abs(centerY(label.querySelector('input')) - centerY(label.querySelector('span'))) < 1, 'text option checkbox and label are not centered');
    }
    assert(areaElement('model').querySelector('.clab-model-open').textContent === '查看 3D', 'GLB output has no model preview action');
    for (const id of ['image', 'audio', 'text', 'model']) areaElement(id).style.width = '';
    passed.push('narrow output modules keep readable controls and GLB files offer a viewer');

    const wheel = (target, deltaY) => {
        const event = new WheelEvent('wheel', { deltaY, bubbles: true, cancelable: true });
        target.dispatchEvent(event); return event;
    };
    // Audio source updates may retain the player while replacing its media element.
    const wheelAudio = audioRoot.querySelector('audio'), wheelWave = audioRoot.querySelector('.clab-audio-wave');
    wheelAudio.currentTime = .5;
    assert(wheel(wheelWave, 100).defaultPrevented && Math.abs(wheelAudio.currentTime - .7) < .01, 'audio wheel did not seek by the same step as video');
    await delay(450);
    assert(wheelAudio.paused, 'wheel started previously paused audio');
    wheel(wheelWave, -10000); assert(wheelAudio.currentTime === 0, 'audio wheel did not clamp at the beginning');
    wheel(wheelWave, 10000); assert(wheelAudio.currentTime <= wheelAudio.duration, 'audio wheel exceeded the duration');
    wheelAudio.currentTime = .2; await wheelAudio.play();
    wheel(wheelWave, 100); assert(wheelAudio.paused, 'playing audio did not pause while seeking');
    await delay(470); assert(!wheelAudio.paused, 'playing audio did not resume after wheel seeking');
    wheelAudio.pause();
    const beforeVolumeWheel = wheelAudio.currentTime;
    assert(!wheel(audioRoot.querySelector('.clab-volume-wrap'), 100).defaultPrevented && wheelAudio.currentTime === beforeVolumeWheel, 'wheel over volume controls also sought audio');
    passed.push('audio wheel seeks, clamps, preserves pause state and resumes previously playing audio');

    const observedWave = audioRoot.querySelector('.clab-audio-wave-base');
    audioRoot.querySelector('.clab-audio-speed-toggle').click();
    const detachedMenu = document.querySelector('body > .clab-audio-speed-dropdown');
    audioRoot.remove(); await delay(30);
    assert(!observed.has(observedWave) && !detachedMenu.isConnected, 'removed audio retained its waveform observer or detached menu');
    window.fetch = originalFetch;
    surgicallyUpdateArea('image');
    passed.push('removed audio releases waveform observation and detached menus');

    const uploadAreas = [
        {id:'upload-image',node:4,widget:'image',value:'input.png',label:'图片'},
        {id:'upload-audio',node:5,widget:'audio',value:'audio.wav',label:'音频'},
        {id:'upload-video',node:6,widget:'video',value:'video.webm',label:'视频'},
        {id:'upload-model',node:7,widget:'model_file',value:'model.glb',label:'3D'},
    ].map(item => ({...item,type:'edit',targetNodeId:String(item.node),targetWidget:item.widget}));
    card.areas = [...uploadAreas, model];
    document.dispatchEvent(new Event('clab_render_ui')); await delay(60);
    for (const upload of uploadAreas) {
        const root = areaElement(upload.id), zone = root.querySelector('.clab-upload-zone');
        assert(!zone.querySelector('img,video,audio,canvas,.clab-glb-viewer') && zone.querySelector('.clab-upload-preview').hidden, `${upload.id} loaded a preview without permission`);
        assert(root.querySelector('.clab-upload-preview-option').textContent.trim() === `查看${upload.label}`, `${upload.id} has no matching preview switch`);
        assert(zone.querySelector('.clab-custom-select') && zone.querySelector('.clab-upload-trigger-btn') && zone.querySelector('.clab-upload-clear-btn'), `${upload.id} lost its collapsed file controls`);
    }
    passed.push('all four upload types default to a compact file row with an explicit preview switch');
    const playWithin = async media => Promise.race([media.play(), delay(2000).then(() => {throw new Error(`input ${media.tagName} playback timed out: ready=${media.readyState}, src=${media.src}`);})]);
    for (const upload of uploadAreas.slice(0,3)) {
        const root = areaElement(upload.id), zone = root.querySelector('.clab-upload-zone'), input = zone.querySelector('.clab-file-input'), select = zone.querySelector('.clab-custom-select');
        root.querySelector('.clab-upload-preview-toggle').click(); await delay(40);
        const media = zone.querySelector('img,video,audio');
        assert(media && upload.showUploadPreview && !zone.querySelector('.clab-upload-preview').hidden, `${upload.id} failed to open its preview`);
        if (media.tagName === 'AUDIO') { await playWithin(media); assert(!media.paused, 'input audio failed to play'); }
        if (media.tagName === 'VIDEO') {
            const live = canvas.captureStream(10); media.removeAttribute('src'); media.srcObject = live;
            canvas.getContext('2d').fillRect(0,0,30,30);
            await playWithin(media);
            assert(!media.paused, 'input video failed to play');
            media._testStream = live;
        }
        root.querySelector('.clab-upload-preview-toggle').click(); await delay(40);
        assert(!zone.querySelector('img,video,audio') && !upload.showUploadPreview && zone.querySelector('.clab-upload-preview').hidden, `${upload.id} failed to close its preview`);
        assert(zone === root.querySelector('.clab-upload-zone') && input === zone.querySelector('.clab-file-input') && select === zone.querySelector('.clab-custom-select'), `${upload.id} replaced the file controls when toggling`);
        if (media.tagName !== 'IMG') assert(media.paused, `${upload.id} continued playing after closing`);
        media._testStream?.getTracks().forEach(track => track.stop());
    }
    StateManager.flushPendingSave();
    const savedAreas = JSON.parse(anchor.widgets[0].value).workspaces[0].cards[0].areas;
    assert(uploadAreas.slice(0,3).every(upload => savedAreas.find(area => area.id === upload.id)?.showUploadPreview === false), 'upload switches were not saved in the workflow');
    passed.push('upload switches preserve the file controls, stop closed media and persist per module');

    const collapsedRoot = areaElement('upload-image'), collapsedZone = collapsedRoot.querySelector('.clab-upload-zone'), collapsedInput = collapsedZone.querySelector('.clab-file-input');
    let filePickerClicks = 0;
    collapsedInput.addEventListener('click', event=>{filePickerClicks++;event.preventDefault();});
    collapsedRoot.querySelector('.clab-upload-trigger-btn').click();
    assert(filePickerClicks===1,'collapsed upload button did not open the file input');
    const uploadFiles = () => {const files=new DataTransfer();files.items.add(new File(['test'],'local.png',{type:'image/png'}));return files;};
    const waitForUpload = async index => {
        for(let i=0;i<40 && uploadAreas[0].value!==`uploaded${index}.png`;i++) await delay(25);
        assert(uploadAreas[0].value===`uploaded${index}.png` && !collapsedZone.querySelector('img') && collapsedInput===collapsedZone.querySelector('.clab-file-input'),'collapsed upload failed or replaced the input');
    };
    collapsedInput.files=uploadFiles().files; collapsedInput.dispatchEvent(new Event('change')); await waitForUpload(1);
    collapsedZone.dispatchEvent(new DragEvent('drop',{bubbles:true,cancelable:true,dataTransfer:uploadFiles()})); await waitForUpload(2);
    state.selectedAreaIds=['upload-image']; document.activeElement?.blur();
    document.dispatchEvent(new ClipboardEvent('paste',{bubbles:true,cancelable:true,clipboardData:uploadFiles()})); await waitForUpload(3);
    collapsedRoot.querySelector('.clab-upload-clear-btn').click();
    assert(uploadAreas[0].value==='' && collapsedRoot.querySelector('.clab-upload-clear-btn').disabled,'collapsed clear did not clear the selected file');
    passed.push('collapsed upload controls retain file selection, drag-drop, paste and clear');

    const modelRoot = areaElement('upload-model'), modelInput = modelRoot.querySelector('.clab-file-input');
    modelRoot.scrollIntoView({block:'center'});
    modelRoot.querySelector('.clab-upload-preview-toggle').click();
    const modelStage = modelRoot.querySelector('.clab-glb-viewer');
    const waitForModel = async stage => {
        stage.scrollIntoView({block:'center'});
        for (let i=0;i<120 && !stage.dataset.modelLoaded;i++) {
            if (stage.querySelector('.clab-model-status').textContent.startsWith('无法预览')) break;
            await delay(50);
        }
        assert(stage.dataset.modelLoaded === '1' && stage.querySelector('canvas')?.width > 0, `real GLB did not render: ${stage.textContent}`);
    };
    await waitForModel(modelStage); await delay(150);
    let idleFrames = frames; await delay(150);
    assert(frames === idleFrames, 'static GLB kept a background animation loop running');
    modelStage.querySelector('.clab-model-reset').click(); await delay(60);
    assert(frames > idleFrames, 'GLB reset did not redraw the model');
    togglePanel(); await delay(50);
    assert(!modelStage.querySelector('canvas') && !observed.has(modelStage.querySelector('.clab-model-canvas')), 'hidden panel retained its GLB canvas or resize observer');
    togglePanel(); await waitForModel(modelStage);
    modelRoot.querySelector('.clab-upload-preview-toggle').click(); await delay(50);
    assert(!modelStage.querySelector('canvas') && modelInput === modelRoot.querySelector('.clab-file-input'), 'closing a GLB preview retained GPU resources or replaced its input');
    passed.push('real GLB input renders on demand, stays idle and releases resources when hidden or disabled');

    areaElement('model').querySelector('.clab-model-open').click();
    const modal = document.querySelector('.clab-preview-modal.visible');
    assert(modal, 'GLB output did not open the existing independent preview');
    const firstModelStage = modal.querySelector('.clab-glb-viewer'); await waitForModel(firstModelStage);
    modal.querySelector('.clab-preview-modal-thumb[data-index="1"]').click();
    const secondModelStage = modal.querySelector('.clab-glb-viewer'); await waitForModel(secondModelStage);
    assert(secondModelStage !== firstModelStage && secondModelStage.dataset.modelUrl.includes('other.glb') && model.historyIndex === 1 && !firstModelStage.querySelector('canvas'), 'GLB history did not switch its model or release the previous renderer');
    modal.querySelector('.clab-preview-modal-close').click(); await delay(50);
    assert(!modal.classList.contains('visible') && !secondModelStage.querySelector('canvas'), 'closing GLB preview retained its renderer');
    passed.push('GLB outputs use the existing preview and history switching with deterministic cleanup');

    uploadAreas[3].value='broken.glb'; surgicallyUpdateArea('upload-model');
    modelRoot.querySelector('.clab-upload-preview-toggle').click();
    const brokenStage = modelRoot.querySelector('.clab-glb-viewer'); brokenStage.scrollIntoView({block:'center'});
    for(let i=0;i<60 && !brokenStage.textContent.includes('无法预览');i++) await delay(30);
    assert(brokenStage.textContent.includes('文件不是有效的 GLB 2.0 模型') && !brokenStage.querySelector('canvas'),'invalid GLB did not show an actionable error or retained a renderer');
    uploadAreas[3].value='model.glb'; surgicallyUpdateArea('upload-model');
    await waitForModel(modelRoot.querySelector('.clab-glb-viewer'));
    passed.push('invalid GLB files show a local error and changing the file recovers the preview');

    window.testResult = { passed, errors };
} catch (error) {
    window.testResult = { passed, errors, error: error.stack };
}
