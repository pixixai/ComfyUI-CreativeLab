import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const source = (file) => readFileSync(new URL(`../web/${file}`, import.meta.url), 'utf8')
    .replace(/import\s+[\s\S]*?\s+from\s+["'][^"']+["'];?/g, '')
    .replace(/export\s+(?=(?:async\s+)?function|const |class )/g, '');
const plain = (value) => JSON.parse(JSON.stringify(value));

// Run the actual extension modules with a browser/API substitute; no server or GPU is used.
function createHarness(options = {}) {
    const listeners = new Map();
    const requests = [];
    const files = [];
    const queueDeletes = [];
    const refreshes = [];
    let submissions = 0;
    let apiCalls = 0;
    let harness;
    const document = {
        addEventListener() {}, dispatchEvent() {},
        querySelector() { return null; }, querySelectorAll() { return []; },
    };
    const window = {
        location: { origin: 'http://localhost:8188' },
        _clabHaltOnError: options.haltOnError ?? true,
        _clabSurgicallyUpdateArea(id) { refreshes.push(id); },
    };
    const api = {
        addEventListener(type, fn) {
            if (!listeners.has(type)) listeners.set(type, []);
            listeners.get(type).push(fn);
        },
        apiURL: (url) => url,
        async fetchApi(url, request) {
            assert.equal(url, '/queue');
            queueDeletes.push(...JSON.parse(request.body).delete);
            return {};
        },
        async queuePrompt(number, data) {
            requests.push(plain(data));
            const index = ++apiCalls;
            if (options.submit) return options.submit(harness, index);
            return { prompt_id: `p${index}`, node_errors: {} };
        },
    };
    const anchor = { type: 'CLab_SystemConfig', widgets: [{ name: 'scenes_data', value: '{}' }] };
    const app = {
        processingQueue: false,
        graph: { _nodes: [anchor], getNodeById() { return null; } },
        async graphToPrompt() {
            await options.beforeBuild?.(harness, submissions);
            return { output: {
                1: { class_type: 'Text', inputs: { text: 'native' } },
                2: { class_type: 'SaveImage', inputs: { images: ['1', 0] } },
                3: { class_type: 'UnrelatedOutput', inputs: {} },
            }, workflow: {} };
        },
        // ComfyApp catches submission errors internally and may return false.
        async queuePrompt() {
            submissions++;
            if (options.rejectBeforeBuild) return false;
            this.processingQueue = true;
            try {
                await api.queuePrompt(0, await this.graphToPrompt());
                return true;
            } catch {
                return false;
            } finally {
                this.processingQueue = false;
            }
        },
    };
    const context = vm.createContext({
        window, document, api, app, URL, URLSearchParams, structuredClone,
        console: { log() {}, warn() {}, error() {} },
        setInterval() { return 1; },
        setTimeout(fn, ms) { return ms === 50 ? setTimeout(fn, 1) : 1; },
        clearTimeout() {}, showBindingToast() {}, hideBindingToast() {},
        CustomEvent: class { constructor(type, { detail } = {}) { this.type = type; this.detail = detail; } },
        async fetch(url, request) {
            const body = JSON.parse(request.body);
            files.push({ url, body });
            const index = files.length;
            await options.beforeArchive?.(harness);
            return { json: async () => ({
                status: 'success', new_filename: `archived_${index}.${url.endsWith('save_text') ? 'txt' : body.filename.split('.').pop()}`,
                new_subfolder: 'CLab', new_type: 'output',
            }) };
        },
    });
    for (const file of ['components/modules/media_types/media_utils.js', 'components/ui_state.js', 'state_manager.js']) {
        vm.runInContext(source(file), context, { filename: file });
    }
    const state = vm.runInContext('state', context);
    const input = { id: 'input', type: 'edit', value: 'before', dataType: 'string', targetNodeId: '1', targetWidget: 'text' };
    const output = { id: 'output', type: 'preview', targetNodeId: '2', matchMedia: false, history: [] };
    const card = { id: 'card', areas: [input, output] };
    state.cards.push(card);
    const workspace = state.workspaces[0];
    harness = {
        state, input, output, card, workspace, app, window, requests, files, queueDeletes, refreshes,
        run: (tasks = [{ cardId: card.id, previewAreaIds: [output.id] }]) => window.CLab.executeTasks(tasks),
        get submissions() { return submissions; },
        persisted: () => JSON.parse(anchor.widgets[0].value),
        async emit(type, detail) {
            await Promise.all((listeners.get(type) || []).map((fn) => fn({ detail })));
        },
        switchWorkspace() {
            vm.runInContext('syncStateToActiveWorkspace()', context);
            const other = vm.runInContext('createEmptyWorkspace("Other")', context);
            // Workspace copies deliberately retain card/area ids.
            other.cards = [structuredClone(card)];
            state.workspaces.push(other);
            context.nextWorkspace = other;
            vm.runInContext('applyWorkspaceToState(nextWorkspace)', context);
            return other;
        },
    };
    vm.runInContext(source('components/events/event_execution.js'), context);
    vm.runInContext('setupExecutionEvents()', context);
    vm.runInContext(source('api_injector.js'), context);
    vm.runInContext('setupAPIInjector(app)', context);
    return harness;
}

const imageResult = (prompt_id = 'p1', filenames = ['source.png']) => ({
    prompt_id, node: '2', output: { images: filenames.map((filename) => ({ filename, type: 'temp', subfolder: '' })) },
});

test('3D viewport dimensions and model filenames are not archived as text output', async () => {
    for (const width of [1024, '1024']) {
        const h = createHarness();
        h.app.graph.getNodeById = id => Number(id) === 2 ? { type: 'Preview3DAdvanced', widgets: [
            { name: 'width', value: width }, { name: 'height', value: 1024 },
            { name: 'model_file', value: 'input/3d/model.glb' },
            { name: 'filename_prefix', value: '3d/ComfyUI' },
        ] } : null;
        await h.run();
        await h.emit('executed', { prompt_id: 'p1', node: '2', output: { result: [null, {}, []] } });
        assert.equal(h.files.length, 0);
        assert.equal(h.output.history.length, 0);
    }
});

test('named and read-only text preview widgets still support output fallback', async () => {
    for (const widget of [
        { name: 'preview_markdown', value: '# Generated text' },
        { name: 'text', value: 'Generated text' },
        { name: 'display', value: 'Generated text', options: { read_only: true } },
    ]) {
        const h = createHarness();
        h.app.graph.getNodeById = id => Number(id) === 2 ? { widgets: [{ name: 'width', value: 1024 }, widget] } : null;
        await h.run();
        await h.emit('executed', { prompt_id: 'p1', node: '2', output: {} });
        assert.equal(h.output.textContent, widget.value);
        assert.equal(h.files[0].url, '/clab/save_text');
    }
});

test('explicit numeric text output is preserved independently of widget fallback', async () => {
    const h = createHarness();
    await h.run();
    await h.emit('executed', { prompt_id: 'p1', node: '2', output: { text: [1024] } });
    assert.equal(h.output.textContent, '1024');
});

test('GLB outputs archive models from saved and legacy preview structures with run metadata', async () => {
    for (const [output, sourceType, subfolder] of [
        [{ '3d': [{ filename: 'model.glb', subfolder: 'models', type: 'output' }], result: ['models/model.glb', {}, []] }, 'output', 'models'],
        [{ result: ['model.glb [temp]', {}, []] }, 'temp', ''],
        [{ result: ['input/3d/model.glb', {}, null] }, 'input', '3d'],
        [{ result: ['models/model.glb [output]', {}, []] }, 'output', 'models'],
    ]) {
        const h = createHarness();
        await h.run();
        await h.emit('executed', { prompt_id: 'p1', node: '2', output });
        assert.equal(h.output.resultKind, 'model');
        assert.equal(h.output.history.length, 1);
        assert.match(h.output.resultUrl, /archived_1.glb/);
        assert.equal(h.output.historyRuns[0].id, 'p1');
        assert.equal(h.files[0].body.asset_type, 'file');
        assert.equal(h.files[0].body.source_type, sourceType);
        assert.equal(h.files[0].body.subfolder, subfolder);
    }
});

test('legacy GLB paths cannot request an absolute or escaping file', async () => {
    for (const path of ['../model.glb', 'C:/model.glb', '/model.glb', 'https://example.com/model.glb']) {
        const h = createHarness(); await h.run();
        await h.emit('executed', { prompt_id: 'p1', node: '2', output: { result: [path, {}, []] } });
        assert.equal(h.files.length, 0);
        assert.equal(h.output.history.length, 0);
    }
});

test('SaveGLB and Preview3D preserve all supported model formats and their execution metadata', async () => {
    for (const [output, sourceType, subfolder, extension] of [
        [{'3d':[{filename:'ComfyUI_00001_.fbx',subfolder:'3d',type:'output'}]}, 'output', '3d', 'fbx'],
        [{result:['input/3d/texture.fbx',null,null]}, 'input', '3d', 'fbx'],
        [{result:['preview.fbx [temp]',{},[]]}, 'temp', '', 'fbx'],
        [{result:['models/model.obj [output]',{},[]]}, 'output', 'models', 'obj'],
        [{result:['motion.bvh [temp]',{},[]]}, 'temp', '', 'bvh'],
        [{'3d':[{filename:'scene.gltf',subfolder:'3d',type:'output'}]}, 'output', '3d', 'gltf'],
        [{'3d':[{filename:'mesh.stl',subfolder:'3d',type:'output'}]}, 'output', '3d', 'stl'],
        [{'3d':[{filename:'mesh.ply',subfolder:'3d',type:'output'}]}, 'output', '3d', 'ply'],
    ]) {
        const h=createHarness(); await h.run();
        await h.emit('executed',{prompt_id:'p1',node:'2',output});
        assert.equal(h.output.resultKind,'model');
        assert.equal(h.output.history.length,1);
        assert.equal(h.output.historyRuns[0].id,'p1');
        assert.ok(h.output.resultUrl.includes(`archived_1.${extension}`));
        assert.equal(h.files[0].url,'/clab/copy_temp_asset');
        assert.equal(h.files[0].body.asset_type,'file');
        assert.equal(h.files[0].body.source_type,sourceType);
        assert.equal(h.files[0].body.subfolder,subfolder);
        assert.ok(!h.output.textContent);
    }
});

test('execution records persist the prompt id and the frozen set of participating outputs', async () => {
    const h = createHarness();
    const second = { id: 'second', type: 'preview', targetNodeId: '3', matchMedia: false, history: [] };
    h.card.areas.push(second);
    await h.run([{ cardId: h.card.id, previewAreaIds: ['output', 'second'] }]);
    await h.run();
    await h.run([{ cardId: h.card.id, previewAreaIds: ['output', 'second'] }]);
    for (const prompt_id of ['p1', 'p2', 'p3']) {
        await h.emit('executed', imageResult(prompt_id));
        if (prompt_id !== 'p2') await h.emit('executed', { ...imageResult(prompt_id), node: '3' });
    }
    assert.deepEqual(plain(h.output.historyRuns.map(run => run.id)), ['p1', 'p2', 'p3']);
    assert.deepEqual(plain(second.historyRuns.map(run => run.id)), ['p1', 'p3']);
    assert.deepEqual(plain(h.output.historyRuns[1].areaIds), ['output']);
    assert.deepEqual(plain(h.output.historyRuns[2].areaIds), ['output', 'second']);
    assert.deepEqual(plain(h.output.historyRuns.map(run => run.order)), [1, 2, 3]);
    const saved = h.persisted().workspaces.find(item => item.id === h.workspace.id);
    assert.deepEqual(saved.cards[0].areas[1].historyRuns[2], plain(h.output.historyRuns[2]));
});

test('text and image outputs from one execution receive the same history association', async () => {
    const h = createHarness();
    const text = { id: 'text', type: 'preview', targetNodeId: '3', matchMedia: false, history: [] };
    h.card.areas.push(text);
    await h.run([{ cardId: h.card.id, previewAreaIds: ['output', 'text'] }]);
    await h.emit('executed', imageResult());
    await h.emit('executed', { prompt_id: 'p1', node: '3', output: { text: ['result'] } });
    assert.deepEqual(plain(text.historyRuns[0]), plain(h.output.historyRuns[0]));
});

test('successful task injects values, prunes unrelated outputs and leaves native graph values intact', async () => {
    const h = createHarness();
    await h.run();
    assert.deepEqual(Object.keys(h.requests[0].output), ['1', '2']);
    assert.equal(h.requests[0].output[1].inputs.text, 'before');
    assert.equal((await h.app.graphToPrompt()).output[1].inputs.text, 'native');
});

for (const [name, options] of [
    ['thrown validation error', { submit() { throw new Error('rejected'); } }],
    ['returned validation error', { submit() { return { node_errors: { 2: {} } }; } }],
    ['false return before prompt generation', { rejectBeforeBuild: true }],
]) {
    test(`halt stops the batch after ${name}, even when ComfyApp swallows exceptions`, async () => {
        const h = createHarness(options);
        await h.run(Array.from({ length: 3 }, () => ({ cardId: 'card', previewAreaIds: ['output'] })));
        assert.equal(h.submissions, 1);
        assert.ok(h.requests.length <= 1);
    });
}

test('disabling halt skips the rejected task and injects the next task normally', async () => {
    const h = createHarness({ haltOnError: false, submit(_h, index) {
        if (index === 1) throw new Error('rejected');
        return { prompt_id: 'p2', node_errors: {} };
    } });
    await h.run(Array.from({ length: 2 }, () => ({ cardId: 'card', previewAreaIds: ['output'] })));
    assert.equal(h.requests.length, 2);
    assert.deepEqual(Object.keys(h.requests[1].output), ['1', '2']);
    assert.equal(h.requests[1].output[1].inputs.text, 'before');
});

test('runtime error cancels pending dispatch and already submitted jobs in the same batch', async () => {
    const h = createHarness({ async beforeBuild(h, index) {
        if (index === 3) await h.emit('execution_error', { prompt_id: 'p1' });
    } });
    await h.run(Array.from({ length: 4 }, () => ({ cardId: 'card', previewAreaIds: ['output'] })));
    assert.equal(h.requests.length, 2);
    assert.deepEqual(h.queueDeletes, ['p2']);
});

test('a prompt accepted during cancellation is also removed from the backend queue', async () => {
    const h = createHarness({ async submit(h, index) {
        if (index === 2) await h.emit('execution_error', { prompt_id: 'p1' });
        return { prompt_id: `p${index}`, node_errors: {} };
    } });
    await h.run(Array.from({ length: 3 }, () => ({ cardId: 'card', previewAreaIds: ['output'] })));
    assert.equal(h.requests.length, 2);
    assert.deepEqual(h.queueDeletes, ['p2']);
});

test('result and input snapshot are saved to the originating inactive workspace, including persistence', async () => {
    const h = createHarness();
    await h.run();
    const other = h.switchWorkspace();
    await h.emit('executed', imageResult());
    assert.equal(h.output.history.length, 1);
    assert.match(h.output.resultUrl, /archived_1/);
    assert.equal(h.output.inputHistorySnapshots[0][0].value, 'before');
    assert.equal(other.cards[0].areas[1].history.length, 0);
    assert.equal(h.refreshes.length, 0);
    const saved = h.persisted().workspaces.find((item) => item.id === h.workspace.id);
    assert.equal(saved.cards[0].areas[1].history.length, 1);
});

test('workspace switch while compiling still submits the originating task', async () => {
    const h = createHarness({ beforeBuild(h) {
        h.switchWorkspace();
        h.state.cards[0].areas[0].value = 'other workspace';
    } });
    await h.run();
    assert.equal(h.requests[0].output[1].inputs.text, 'before');
    await h.emit('executed', imageResult());
    assert.equal(h.output.history.length, 1);
});

test('changing values and channel bindings while compiling cannot change the frozen payload or capture target', async () => {
    const h = createHarness({ beforeBuild(h) {
        h.input.value = 'after';
        h.input.targetNodeId = '3';
        h.output.targetNodeId = '3';
    } });
    await h.run();
    assert.equal(h.requests[0].output[1].inputs.text, 'before');
    assert.deepEqual(Object.keys(h.requests[0].output), ['1', '2']);
    await h.emit('executed', imageResult());
    assert.equal(h.output.history.length, 1);
    assert.equal(h.output.inputHistorySnapshots[0][0].value, 'before');
    assert.equal(h.output.inputHistorySnapshots[0][0].targetNodeId, '1');
});

test('all batch parameters are frozen at click time and preserve interleaved card order', async () => {
    const h = createHarness({ submit(h, index) {
        h.input.value = 'edited while submitting';
        h.state.cards[1].areas[0].value = 'also edited';
        return { prompt_id: `p${index}`, node_errors: {} };
    } });
    const second = structuredClone(h.card);
    second.id = 'second';
    second.areas[0].value = 'second value';
    h.state.cards.push(second);
    await h.run(['card', 'second', 'card', 'second'].map((cardId) => ({ cardId, previewAreaIds: ['output'] })));
    assert.deepEqual(h.requests.map((request) => request.output[1].inputs.text), ['before', 'second value', 'before', 'second value']);
});

test('text results are archived and persisted while their workspace is inactive', async () => {
    const h = createHarness();
    await h.run();
    h.switchWorkspace();
    await h.emit('executed', { prompt_id: 'p1', node: '2', output: { text: ['generated text'] } });
    assert.equal(h.files[0].url, '/clab/save_text');
    assert.equal(h.output.textContent, 'generated text');
    assert.equal(h.output.inputHistorySnapshots[0][0].value, 'before');
    assert.equal(h.persisted().workspaces[0].cards[0].areas[1].history.length, 1);
});

test('deleted or replaced workspaces never receive a late result', async () => {
    const h = createHarness();
    await h.run();
    h.state.workspaces = [structuredClone(h.workspace)];
    await h.emit('executed', imageResult());
    assert.equal(h.files.length, 0);
    assert.equal(h.output.history.length, 0);
});

test('multiple output modules share one archive operation and do not mutate the native result', async () => {
    const h = createHarness();
    const second = { ...h.output, id: 'second-output', history: [] };
    h.card.areas.push(second);
    await h.run([{ cardId: 'card', previewAreaIds: ['output', 'second-output'] }]);
    const result = imageResult();
    await h.emit('executed', result);
    assert.equal(h.files.length, 1);
    assert.equal(result.output.images[0].filename, 'source.png');
    assert.equal(h.output.resultUrl, second.resultUrl);
});

test('multi-image output keeps the cover and selected history index consistent', async () => {
    const h = createHarness();
    await h.run();
    await h.emit('executed', imageResult('p1', ['first.png', 'second.png']));
    assert.equal(h.output.history.length, 2);
    assert.equal(h.output.history[h.output.historyIndex], h.output.resultUrl);
    assert.equal(h.output.inputHistorySnapshots.length, 2);
});

test('an unbound output fails without submitting the full graph', async () => {
    const h = createHarness();
    h.output.targetNodeId = null;
    await h.run();
    assert.equal(h.requests.length, 0);
});

test('a busy native queue and unrelated serialization cannot consume a pending CLab task', async () => {
    const h = createHarness();
    h.app.processingQueue = true;
    const running = h.run();
    assert.equal((await h.app.graphToPrompt()).output[1].inputs.text, 'native');
    h.input.value = 'edited while waiting';
    h.app.processingQueue = false;
    await running;
    assert.equal(h.requests.length, 1);
    assert.equal(h.requests[0].output[1].inputs.text, 'before');
});

test('failure in one batch does not cancel another batch queued during submission', async () => {
    let submittedAnother = false;
    const h = createHarness({ async beforeBuild(h) {
        if (!submittedAnother) {
            submittedAnother = true;
            h.input.value = 'next batch';
            await h.run();
        }
    }, submit(_h, index) {
        if (index === 1) throw new Error('first batch rejected');
        return { prompt_id: `p${index}`, node_errors: {} };
    } });
    await h.run(Array.from({ length: 2 }, () => ({ cardId: 'card', previewAreaIds: ['output'] })));
    assert.equal(h.requests.length, 2);
    assert.equal(h.requests[1].output[1].inputs.text, 'next batch');
});

test('fast results arriving before the HTTP response still reach the originating workspace', async () => {
    const h = createHarness({ async submit(h) {
        h.switchWorkspace();
        await h.emit('execution_start', { prompt_id: 'p1' });
        await h.emit('executed', imageResult());
        return { prompt_id: 'p1', node_errors: {} };
    } });
    await h.run();
    assert.equal(h.output.history.length, 1);
    assert.equal(h.output.inputHistorySnapshots[0][0].value, 'before');
});

test('switching workspace during asset copying preserves the result and avoids repainting its copy', async () => {
    const h = createHarness({ beforeArchive(h) { h.switchWorkspace(); } });
    await h.run();
    await h.emit('executed', imageResult());
    assert.equal(h.output.history.length, 1);
    assert.equal(h.state.cards[0].areas[1].history.length, 0);
    assert.equal(h.refreshes.length, 0);
    assert.equal(h.persisted().workspaces[0].cards[0].areas[1].history.length, 1);
});

test('completed runs release their task snapshots without removing output history', async () => {
    const h = createHarness();
    for (let i = 1; i <= 5; i++) {
        await h.run();
        await h.emit('executed', imageResult(`p${i}`));
        await h.emit('executing', { prompt_id: `p${i}`, node: null });
    }
    assert.equal(Object.keys(h.window._clabTaskMap).length, 0);
    assert.equal(h.output.history.length, 5);
    assert.equal(h.output.inputHistorySnapshots[4][0].value, 'before');
});

test('completion waits for asset copying and releases only after persistence', async () => {
    let releaseCopy;
    const copyGate = new Promise(resolve => { releaseCopy = resolve; });
    let copying;
    const copyStarted = new Promise(resolve => { copying = resolve; });
    const h = createHarness({ async beforeArchive() { copying(); await copyGate; } });
    await h.run();
    const result = h.emit('executed', imageResult());
    await copyStarted;
    await h.emit('execution_success', { prompt_id: 'p1' });
    assert.equal(h.window._clabTaskMap.p1.pendingResults, 1);
    releaseCopy();
    await result;
    assert.equal(h.window._clabTaskMap.p1, undefined);
    assert.equal(h.persisted().workspaces[0].cards[0].areas[1].history.length, 1);
});

test('early completion before the HTTP response does not reinsert a completed task', async () => {
    const h = createHarness({ async submit(h) {
        await h.emit('execution_start', { prompt_id: 'p1' });
        await h.emit('executed', imageResult());
        await h.emit('executing', { prompt_id: 'p1', node: null });
        return { prompt_id: 'p1', node_errors: {} };
    } });
    await h.run();
    assert.equal(h.output.history.length, 1);
    assert.equal(Object.keys(h.window._clabTaskMap).length, 0);
});

test('one result shared by multiple modules is persisted once and schedules each changed module', async () => {
    const h = createHarness();
    h.card.areas.push({ ...h.output, id: 'second', history: [] });
    const updated = [];
    h.window._clabScheduleAreaUpdate = id => updated.push(id);
    await h.run([{ cardId: 'card', previewAreaIds: ['output', 'second'] }]);
    const writes = [];
    Object.defineProperty(h.app.graph._nodes[0].widgets[0], 'value', {
        set(value) { writes.push(value); }, get() { return writes.at(-1); }, configurable: true,
    });
    await h.emit('executed', imageResult());
    assert.equal(writes.length, 1);
    assert.deepEqual(updated, ['output', 'second']);
});

test('interrupted runs release their task registry entries', async () => {
    const h = createHarness();
    await h.run();
    await h.emit('execution_interrupted', { prompt_id: 'p1' });
    assert.equal(Object.keys(h.window._clabTaskMap).length, 0);
});
