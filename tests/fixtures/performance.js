const passed = [];
const errors = [];
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
        observe(target, options) { observed.set(target, (observed.get(target) || 0) + 1); super.observe(target, options); }
        unobserve(target) { observed.delete(target); super.unobserve(target); }
        disconnect() { super.disconnect(); }
    };
    const anchor = { type: 'CLab_SystemConfig', widgets: [{ name: 'scenes_data', value: '{}' }] };
    const node = { id: 1, title: 'Input', type: 'Text', widgets: [{ name: 'text', type: 'text', value: 'initial' }] };
    const uploadNode = { id: 4, type: 'LoadImage', widgets: [{ name: 'image', type: 'combo', value: 'input.png', options: { values: ['input.png', 'other.png'], image_upload: true } }] };
    window.testApp = {
        graph: { _nodes: [anchor, node, uploadNode], getNodeById: id => [node, uploadNode].find(item => item.id === Number(id)), clear() {}, serialize() { return { nodes: [{ widgets_values: [anchor.widgets[0].value] }] }; } },
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

    const uploadArea = { id: 'upload', type: 'edit', targetNodeId: '4', targetWidget: 'image', value: 'input.png', autoHeight: true };
    card.areas.push(uploadArea);
    document.dispatchEvent(new Event('clab_render_ui')); await delay(120);
    const uploadRoot = areaElement('upload');
    const uploadImage = uploadRoot.querySelector('img');
    const uploadSelect = uploadRoot.querySelector('.clab-custom-select');
    const zone = uploadRoot.querySelector('.clab-upload-zone');
    for (let i = 0; i < 5; i++) { surgicallyUpdateArea('upload'); togglePanel(); togglePanel(); }
    assert(areaElement('upload') === uploadRoot && uploadRoot.querySelector('img') === uploadImage && uploadRoot.querySelector('.clab-custom-select') === uploadSelect, 'upload plus file-list refresh rebuilt input media');
    assert(zone.style.aspectRatio === '150 / 300', 'reopening lost the upload media aspect ratio');
    uploadArea.autoHeight = false; surgicallyUpdateArea('upload');
    assert(zone.style.aspectRatio === '16 / 9', 'disabling auto height did not restore the fixed ratio');
    uploadArea.autoHeight = true; surgicallyUpdateArea('upload');
    assert(zone.style.aspectRatio === '150 / 300', 'enabling auto height did not restore the actual ratio');
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

    window.testResult = { passed, errors };
} catch (error) {
    window.testResult = { passed, errors, error: error.stack };
}
