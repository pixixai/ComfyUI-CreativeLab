import { onModuleRemoved } from '../module_lifecycle.js';

const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const viewers = new Map();
const visible = new WeakSet();
let observer;
let library;
let panelObserver;

export function renderGLBViewer(url) {
    return `<div class="clab-glb-viewer" data-model-url="${escapeHTML(url)}">
        <div class="clab-model-canvas" aria-label="3D 模型：左键旋转，滚轮缩放，右键平移"></div>
        <div class="clab-model-status">正在读取 GLB…</div>
        <button type="button" class="clab-model-reset">重置视角</button>
    </div>`;
}

export function renderModel(area, url) {
    const resolved = new URL(url, window.location.origin);
    const filename = resolved.searchParams.get('filename') || decodeURIComponent(resolved.pathname.split('/').pop()) || 'GLB 模型';
    return `<div class="clab-model-placeholder"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="m12 2 9 5v10l-9 5-9-5V7Zm0 10 9-5M12 12 3 7m9 5v10"/></svg>
        <span class="clab-file-name" title="${escapeHTML(filename)}">${escapeHTML(filename)}</span>
        <div class="clab-model-actions"><button type="button" class="clab-model-open" data-area="${escapeHTML(area.id)}">查看 3D</button>
        <a class="clab-file-download" href="${escapeHTML(url)}" download="${escapeHTML(filename)}">下载模型</a></div></div>`;
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
        object.skeleton?.dispose();
    });
    for (const resource of resources) { resource.image?.close?.(); resource.dispose(); }
}

function mountViewer(stage, url) {
    const controller = new AbortController();
    const host = stage.querySelector('.clab-model-canvas'), status = stage.querySelector('.clab-model-status');
    let renderer, controls, scene, model, environment, resize, frame = 0, disposed = false;
    status.hidden = false;
    status.textContent = '正在读取 GLB…';
    const render = () => {
        if (!frame && !disposed && renderer) frame = requestAnimationFrame(() => {
            frame = 0;
            if (!disposed) renderer.render(scene, controls.object);
        });
    };
    const resetButton = stage.querySelector('.clab-model-reset');
    const cleanup = () => {
        if (disposed) return;
        disposed = true; controller.abort(); cancelAnimationFrame(frame);
        resize?.disconnect(); controls?.dispose(); disposeObject(model);
        environment?.dispose();
        renderer?.dispose(); renderer?.forceContextLoss(); host.replaceChildren();
        resetButton.onclick = null;
        delete stage.dataset.modelLoaded;
    };
    (async () => {
        const THREE = await (library ||= import('../../../vendor/three-glb.js'));
        if (disposed) return;
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error(`读取文件失败（HTTP ${response.status}）`);
        const bytes = await response.arrayBuffer();
        if (disposed) return;
        const header = new DataView(bytes);
        if (bytes.byteLength < 20 || header.getUint32(0, true) !== 0x46546c67 || header.getUint32(4, true) !== 2) throw new Error('文件不是有效的 GLB 2.0 模型');
        const jsonLength = header.getUint32(12, true);
        const json = JSON.parse(new TextDecoder().decode(new Uint8Array(bytes, 20, jsonLength)));
        if ([...(json.buffers || []), ...(json.images || [])].some(item => item.uri && !item.uri.startsWith('data:'))) throw new Error('基础版需要内嵌贴图与资源的 GLB 文件');
        if (json.extensionsRequired?.some(name => ['KHR_draco_mesh_compression', 'EXT_meshopt_compression', 'KHR_texture_basisu'].includes(name))) throw new Error('该模型需要额外的压缩解码器，请使用未压缩的 GLB 文件');
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        host.replaceChildren(renderer.domElement);
        scene = new THREE.Scene(); scene.background = new THREE.Color('#191919');
        const room = new THREE.RoomEnvironment();
        const generator = new THREE.PMREMGenerator(renderer);
        environment = generator.fromScene(room);
        room.dispose(); generator.dispose(); scene.environment = environment.texture;
        scene.add(new THREE.HemisphereLight(0xffffff, 0x555555, 2));
        const light = new THREE.DirectionalLight(0xffffff, 3); light.position.set(3, 5, 4); scene.add(light);
        const camera = new THREE.PerspectiveCamera(45, 1, .01, 1000);
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.addEventListener('change', render);
        const gltf = await new THREE.GLTFLoader().parseAsync(bytes, new URL('.', new URL(url, window.location.origin)).href);
        if (disposed) { disposeObject(gltf.scene); return; }
        model = gltf.scene; scene.add(model);
        const box = new THREE.Box3().setFromObject(model), center = box.getCenter(new THREE.Vector3()), size = box.getSize(new THREE.Vector3());
        const fit = () => {
            const width = Math.max(1, host.clientWidth), height = Math.max(1, host.clientHeight);
            const radius = Math.max(size.x, size.y, size.z, .001);
            const distance = radius / (2 * Math.tan(camera.fov * Math.PI / 360)) * Math.max(1, height / width) * 1.5;
            camera.near = Math.max(radius / 1000, .00001); camera.far = distance + radius * 100;
            camera.position.copy(center).add(new THREE.Vector3(.8, .5, 1).normalize().multiplyScalar(distance));
            controls.target.copy(center); controls.update(); camera.updateProjectionMatrix(); render();
        };
        const setSize = () => {
            const width = host.clientWidth, height = host.clientHeight;
            if (!width || !height) return;
            renderer.setSize(width, height, false); camera.aspect = width / height; camera.updateProjectionMatrix(); render();
        };
        resize = new ResizeObserver(setSize); resize.observe(host); setSize(); fit();
        resetButton.onclick = event => { event.stopPropagation(); fit(); };
        status.hidden = true; stage.dataset.modelLoaded = '1';
    })().catch(error => {
        if (disposed) return;
        cleanup(); status.hidden = false;
        status.textContent = `无法预览：${error.message}`;
    });
    return cleanup;
}

function syncViewer(stage) {
    const entry = viewers.get(stage);
    if (!entry) return;
    const modal = stage.closest('.clab-preview-modal');
    const shown = !document.hidden && visible.has(stage) && (modal ? modal.classList.contains('visible') : !!stage.closest('#clab-panel.visible'));
    if (shown && !entry.stop) entry.stop = mountViewer(stage, stage.dataset.modelUrl);
    else if (!shown && entry.stop) { entry.stop(); entry.stop = null; }
}

export function attachModelEvents(container) {
    if (!observer) {
        observer = new IntersectionObserver(entries => entries.forEach(({ target, isIntersecting }) => {
            if (isIntersecting) visible.add(target); else visible.delete(target);
            syncViewer(target);
        }));
        const sync = () => viewers.forEach((_, stage) => syncViewer(stage));
        document.addEventListener('visibilitychange', sync);
    }
    const panel = document.getElementById('clab-panel');
    if (panel && !panelObserver) {
        panelObserver = new MutationObserver(() => viewers.forEach((_, stage) => syncViewer(stage)));
        panelObserver.observe(panel, { attributes: true, attributeFilter: ['class'] });
    }
    container.querySelectorAll('.clab-glb-viewer').forEach(stage => {
        if (viewers.has(stage)) return;
        const entry = { stop: null };
        viewers.set(stage, entry); observer.observe(stage);
        for (const type of ['pointerdown', 'mousedown', 'auxclick', 'contextmenu', 'dragstart']) {
            stage.addEventListener(type, event => { event.stopPropagation(); if (type === 'contextmenu' || type === 'dragstart') event.preventDefault(); });
        }
        onModuleRemoved(stage, () => releaseModelViewer(stage));
    });
    container.querySelectorAll('.clab-model-open').forEach(button => {
        button.onclick = event => {
            event.stopPropagation();
            document.dispatchEvent(new CustomEvent('clab_open_model_preview', { detail: { areaId: button.dataset.area } }));
        };
    });
}

export function releaseModelViewer(stage) {
    viewers.get(stage)?.stop?.(); viewers.delete(stage); observer?.unobserve(stage); visible.delete(stage);
}
