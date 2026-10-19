import { onModuleRemoved } from '../module_lifecycle.js';
import { formatTime, formatTimeWithFrames } from './media_utils.js';
import { loadModel } from './model_loader.js';

const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const viewers = new Map();
const visible = new WeakSet();
let observer, library, panelObserver;

export function renderModelViewer(url) {
    return `<div class="clab-glb-viewer" data-model-url="${escapeHTML(url)}">
        <div class="clab-model-toolbar">
            <span class="clab-model-warning" hidden></span>
            <button type="button" class="clab-model-reset">重置视角</button>
        </div>
        <div class="clab-model-canvas" aria-label="3D 模型：左键拖动旋转，中键或右键拖动平移，滚轮缩放，Shift＋滚轮调节动画进度"></div>
        <div class="clab-model-status" role="status">正在读取模型…</div>
        <div class="clab-model-animation" hidden>
            <div class="clab-model-playback-row">
                <button type="button" class="clab-model-play" aria-label="播放动画" aria-pressed="false">▶</button>
                <span class="clab-model-time">00:00 / 00:00</span>
                <select class="clab-model-clips" aria-label="动画片段"></select>
                <select class="clab-model-speed" aria-label="播放速度">${[.25,.5,1,1.5,2].map(speed=>`<option value="${speed}" ${speed===1?'selected':''}>${speed}×</option>`).join('')}</select>
            </div>
            <input type="range" class="clab-model-seek" min="0" max="1" step="0.001" value="0" aria-label="动画播放进度" title="Shift＋滚轮调节进度；滚轮缩放视图">
        </div>
    </div>`;
}

function disposeObject(root) {
    const resources = new Set();
    root?.traverse(object => {
        if (object.geometry) resources.add(object.geometry);
        for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
            if (!material) continue;
            resources.add(material);
            for (const value of Object.values(material)) if (value?.isTexture) resources.add(value);
        }
        if (object.skeleton) resources.add(object.skeleton);
    });
    for (const resource of resources) { resource.image?.close?.(); resource.dispose(); }
}

function mountViewer(stage, state) {
    const controller = new AbortController();
    const host = stage.querySelector('.clab-model-canvas'), status = stage.querySelector('.clab-model-status');
    const animation = stage.querySelector('.clab-model-animation'), play = stage.querySelector('.clab-model-play');
    const seek = stage.querySelector('.clab-model-seek'), time = stage.querySelector('.clab-model-time');
    const clipSelect = stage.querySelector('.clab-model-clips'), speed = stage.querySelector('.clab-model-speed');
    const reset = stage.querySelector('.clab-model-reset'), warning = stage.querySelector('.clab-model-warning');
    let renderer, controls, scene, model, environment, resize, mixer, action, releaseResources, clips = [], frame = 0, lastTime = 0;
    let disposed = false, duration = 0, scrubTimer, scrubbing = false, resumeAfterScrub = false, pointerStart;
    status.hidden = false; status.textContent = '正在读取模型…'; warning.hidden = true; animation.hidden = true;
    const updateUI = () => {
        seek.value = state.time;
        time.textContent = `${scrubbing ? formatTimeWithFrames(state.time,30) : formatTime(state.time)} / ${formatTime(duration)}`;
        time.classList.toggle('scrubbing',scrubbing);
        play.textContent = state.playing ? 'Ⅱ' : '▶';
        play.setAttribute('aria-label',state.playing ? '暂停动画' : '播放动画');
        play.setAttribute('aria-pressed',String(state.playing));
    };
    const applyTime = () => {
        if (action) { action.paused = false; action.enabled = true; mixer.setTime(state.time); }
    };
    const draw = now => {
        frame = 0;
        if (disposed || !renderer) return;
        if (state.playing && duration > 0) {
            state.time = (state.time + Math.min((now-lastTime)/1000,.1)*state.speed) % duration;
            applyTime(); updateUI();
        }
        lastTime = now;
        renderer.render(scene,controls.object);
        if (state.playing && duration > 0) frame = requestAnimationFrame(draw);
    };
    const render = () => { if (!frame && !disposed && renderer) frame = requestAnimationFrame(draw); };
    const cancelScrub = () => { clearTimeout(scrubTimer); scrubbing = false; resumeAfterScrub = false; };
    const togglePlayback = () => {
        cancelScrub(); state.playing = !state.playing; lastTime = performance.now(); updateUI(); render();
    };
    const finishScrub = () => {
        if (!scrubbing) return;
        scrubbing = false; state.playing = resumeAfterScrub; resumeAfterScrub = false;
        lastTime = performance.now(); updateUI(); render();
    };
    const startScrub = () => {
        if (!scrubbing) { resumeAfterScrub = state.playing; state.playing = false; scrubbing = true; }
        clearTimeout(scrubTimer);
    };
    const seekTo = value => { state.time = Math.max(0,Math.min(duration,value)); applyTime(); updateUI(); render(); };
    const wheel = event => {
        if (!duration || !event.shiftKey || event.target.closest('select,button')) return;
        const delta = event.deltaY || event.deltaX;
        if (!delta) return;
        event.preventDefault(); event.stopImmediatePropagation();
        startScrub(); seekTo(state.time+delta*.002);
        scrubTimer = setTimeout(finishScrub,400);
    };
    stage.addEventListener('wheel',wheel,{capture:true,passive:false});
    const pointerDown = event => { if (event.button===0 && event.target.tagName==='CANVAS') pointerStart=[event.clientX,event.clientY]; };
    const pointerUp = event => {
        if (pointerStart && duration && event.button===0 && Math.hypot(event.clientX-pointerStart[0],event.clientY-pointerStart[1])<4) togglePlayback();
        pointerStart = null;
    };
    stage.addEventListener('pointerdown',pointerDown); stage.addEventListener('pointerup',pointerUp);
    seek.onpointerdown = () => startScrub();
    seek.oninput = () => seekTo(Number(seek.value));
    window.addEventListener('pointerup',finishScrub);
    window.addEventListener('pointercancel',finishScrub);
    window.addEventListener('blur',finishScrub);
    play.onclick = event => { event.stopPropagation(); togglePlayback(); };
    speed.value = state.speed;
    speed.onchange = () => { state.speed = Number(speed.value); };
    const cleanup = () => {
        if (disposed) return;
        if (scrubbing) state.playing = resumeAfterScrub;
        disposed = true; controller.abort(); releaseResources?.(); cancelAnimationFrame(frame); clearTimeout(scrubTimer);
        window.removeEventListener('pointerup',finishScrub);
        window.removeEventListener('pointercancel',finishScrub);
        window.removeEventListener('blur',finishScrub);
        stage.removeEventListener('wheel',wheel,true); stage.removeEventListener('pointerdown',pointerDown); stage.removeEventListener('pointerup',pointerUp);
        resize?.disconnect(); controls?.dispose(); mixer?.stopAllAction(); if (model) mixer?.uncacheRoot(model);
        disposeObject(model); environment?.dispose(); renderer?.dispose(); renderer?.forceContextLoss(); host.replaceChildren();
        animation.hidden = true;
        reset.onclick = play.onclick = seek.oninput = seek.onpointerdown = speed.onchange = clipSelect.onchange = null;
        delete stage.dataset.modelLoaded;
    };
    (async () => {
        const THREE = await (library ||= import('../../../vendor/three-glb.js'));
        if (disposed) return;
        const loaded = await loadModel(THREE,stage.dataset.modelUrl,controller.signal,message => {
            if (disposed) return;
            warning.textContent = message; warning.hidden = !message; render();
        });
        if (disposed) { loaded.release(); disposeObject(loaded.object); return; }
        model = loaded.object; clips = loaded.clips; releaseResources=loaded.release;
        renderer = new THREE.WebGLRenderer({antialias:true}); renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1,2));
        renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping;
        host.replaceChildren(renderer.domElement);
        scene = new THREE.Scene(); scene.background = new THREE.Color('#191919');
        const room = new THREE.RoomEnvironment(), generator = new THREE.PMREMGenerator(renderer);
        environment = generator.fromScene(room); room.dispose(); generator.dispose(); scene.environment = environment.texture;
        scene.add(new THREE.HemisphereLight(0xffffff,0x555555,2));
        const light = new THREE.DirectionalLight(0xffffff,3); light.position.set(3,5,4); scene.add(light,model);
        const camera = new THREE.PerspectiveCamera(45,1,.01,1000);
        controls = new THREE.OrbitControls(camera,renderer.domElement);
        controls.mouseButtons.MIDDLE = THREE.MOUSE.PAN;
        controls.addEventListener('change',render);
        if (clips.length) {
            animation.hidden = false; mixer = new THREE.AnimationMixer(model);
            clipSelect.innerHTML = clips.map((clip,index)=>`<option value="${index}">${escapeHTML(clip.name || `动画 ${index+1}`)}</option>`).join('');
            clipSelect.hidden = clips.length<2;
            const selectClip = index => {
                mixer.stopAllAction(); action = mixer.clipAction(clips[index]); action.reset().setLoop(THREE.LoopOnce,1).play(); action.clampWhenFinished = true;
                duration = clips[index].duration; seek.max = duration; state.clip = index; state.time = Math.min(state.time,duration);
                clipSelect.value = index; applyTime(); updateUI(); lastTime = performance.now(); render();
            };
            selectClip(Math.min(state.clip,clips.length-1));
            clipSelect.onchange = () => { cancelScrub(); state.time=0; selectClip(Number(clipSelect.value)); };
        } else state.playing = false;
        model.updateMatrixWorld(true);
        const box = loaded.bounds || new THREE.Box3().setFromObject(model), center = box.getCenter(new THREE.Vector3()), size = box.getSize(new THREE.Vector3());
        const fit = () => {
            const width = Math.max(1,host.clientWidth), height = Math.max(1,host.clientHeight), radius = Math.max(size.x,size.y,size.z,.001);
            const distance = radius/(2*Math.tan(camera.fov*Math.PI/360))*Math.max(1,height/width)*1.5;
            camera.near = Math.max(radius/1000,.00001); camera.far = distance+radius*100;
            camera.position.copy(center).add(new THREE.Vector3(.8,.5,1).normalize().multiplyScalar(distance));
            controls.target.copy(center); controls.update(); camera.updateProjectionMatrix(); render();
        };
        const setSize = () => {
            if (!host.clientWidth || !host.clientHeight) return;
            renderer.setSize(host.clientWidth,host.clientHeight,false); camera.aspect=host.clientWidth/host.clientHeight; camera.updateProjectionMatrix(); render();
        };
        resize = new ResizeObserver(setSize); resize.observe(host); setSize(); fit();
        reset.onclick = event => { event.stopPropagation(); fit(); };
        status.hidden = true; stage.dataset.modelLoaded = '1';
    })().catch(error => {
        if (disposed) return;
        cleanup(); status.hidden = false; status.textContent = `无法预览：${error.message}`;
    });
    return cleanup;
}

function syncViewer(stage) {
    const entry = viewers.get(stage);
    if (!entry) return;
    const modal = stage.closest('.clab-preview-modal');
    const shown = !document.hidden && visible.has(stage) && (modal ? modal.classList.contains('visible') : !!stage.closest('#clab-panel.visible'));
    if (shown && !entry.stop) entry.stop = mountViewer(stage,entry.state);
    else if (!shown && entry.stop) { entry.stop(); entry.stop=null; }
}

export function attachModelEvents(container) {
    if (!observer) {
        observer = new IntersectionObserver(entries=>entries.forEach(({target,isIntersecting})=>{
            if (isIntersecting) visible.add(target); else visible.delete(target);
            syncViewer(target);
        }));
        document.addEventListener('visibilitychange',()=>viewers.forEach((_,stage)=>syncViewer(stage)));
    }
    const panel = document.getElementById('clab-panel');
    if (panel && !panelObserver) {
        panelObserver = new MutationObserver(()=>viewers.forEach((_,stage)=>syncViewer(stage)));
        panelObserver.observe(panel,{attributes:true,attributeFilter:['class']});
    }
    container.querySelectorAll('.clab-glb-viewer').forEach(stage=>{
        if (viewers.has(stage)) return;
        viewers.set(stage,{stop:null,state:{time:0,playing:false,speed:1,clip:0}}); observer.observe(stage);
        let rightStart, rightDragged = false;
        stage.addEventListener('pointerdown',event=>{
            if (event.button===2) { rightStart=[event.clientX,event.clientY]; rightDragged=false; }
        });
        stage.addEventListener('pointermove',event=>{
            if (rightStart && (event.buttons & 2) && Math.hypot(event.clientX-rightStart[0],event.clientY-rightStart[1])>=4) rightDragged=true;
        });
        stage.addEventListener('contextmenu',event=>{
            event.preventDefault();
            if (rightDragged) event.stopPropagation();
        });
        for (const type of ['pointerdown','mousedown','auxclick','dragstart']) stage.addEventListener(type,event=>{
            event.stopPropagation();
            // Cancel native dragging of the ancestor module; OrbitControls uses pointer events.
            if (type==='dragstart' || type==='mousedown' && event.target.tagName==='CANVAS') event.preventDefault();
        });
        onModuleRemoved(stage,()=>releaseModelViewer(stage));
    });
}

export function releaseModelViewer(stage) {
    viewers.get(stage)?.stop?.(); viewers.delete(stage); observer?.unobserve(stage); visible.delete(stage);
}
