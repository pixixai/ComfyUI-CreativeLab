import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import { createWorkspaceView } from '../web/components/workspace_modes/view_state.js';
import { synchronizeMatrix, matrixOutput, materializeMatrixRecords } from '../web/components/workspace_modes/xy_model.js';
import { createEditHistory } from '../web/components/edit_history.js';
import { prepareWorkspaceCopy } from '../web/components/workspace_copy.js';
import { createExecutionQueue,readExecutionStates,interruptExecutionPrompts } from '../web/components/actions/execution_queue.js';

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
    const backend=new Map(),history=new Map(),events=[],interrupts=[],documentListeners=new Map(),executionPreferences={waiting:options.waiting??4};
    let submissions = 0;
    let apiCalls = 0;
    let harness;
    const document = {
        addEventListener(type,fn){if(!documentListeners.has(type))documentListeners.set(type,[]);documentListeners.get(type).push(fn);},
        dispatchEvent(event){events.push(event.type);for(const fn of documentListeners.get(event.type)||[])fn(event);},
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
            if(url==='/interrupt'){
                const {prompt_id}=JSON.parse(request.body);assert.ok(prompt_id);interrupts.push(prompt_id);
                if(options.interrupt)return options.interrupt(harness,prompt_id);
                if(backend.get(prompt_id)?.state==='running')await harness.emit('execution_interrupted',{prompt_id});
                return {ok:true};
            }
            if(url.startsWith('/history/')){const id=decodeURIComponent(url.slice(9));return {ok:true,json:async()=>history.has(id)?{[id]:history.get(id)}:{}};}
            assert.equal(url, '/queue');
            if(request?.method==='POST'){
                const edit=JSON.parse(request.body);queueDeletes.push(...(edit.delete||[]));
                if(options.editQueue)await options.editQueue(harness,edit);
                for(const [id,job]of backend)if(job.state!=='running'&&(edit.clear||edit.delete?.includes(id)))backend.delete(id);
                return {ok:true};
            }
            return {ok:true,json:async()=>({queue_running:[...backend].filter(([,job])=>job.state==='running').map(([id])=>[0,id]),queue_pending:[...backend].filter(([,job])=>job.state!=='running').map(([id])=>[0,id])})};
        },
        async queuePrompt(number, data) {
            requests.push(plain(data));
            const index = ++apiCalls;
            const result=options.submit?await options.submit(harness,index):{prompt_id:`p${index}`,node_errors:{}};
            if(result?.prompt_id&&!history.has(result.prompt_id)&&!backend.has(result.prompt_id))backend.set(result.prompt_id,{state:'waiting',outputs:{}});
            return result;
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
        window, document, api, app, URL, URLSearchParams, structuredClone,createExecutionQueue,readExecutionStates,interruptExecutionPrompts,executionPreferences,
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
    for (const file of ['components/modules/media_types/media_utils.js', 'components/actions/task_records.js', 'components/ui_state.js', 'state_manager.js']) {
        vm.runInContext(source(file), context, { filename: file });
    }
    const state = vm.runInContext('state', context);
    const input = { id: 'input', type: 'edit', value: 'before', dataType: 'string', targetNodeId: '1', targetWidget: 'text' };
    const output = { id: 'output', type: 'preview', targetNodeId: '2', matchMedia: false, history: [] };
    const card = { id: 'card', areas: [input, output] };
    state.cards.push(card);
    const workspace = state.workspaces[0];
    harness = {
        state, input, output, card, workspace, app, window, requests, files, queueDeletes, refreshes,api,backend,history,events,interrupts,executionPreferences,
        changeWaiting(value){executionPreferences.waiting=value;document.dispatchEvent({type:'clab_execution_window_change'});},
        run: (tasks = [{ cardId: card.id, previewAreaIds: [output.id] }]) => window.CLab.executeTasks(tasks),
        get submissions() { return submissions; },
        persisted: () => JSON.parse(anchor.widgets[0].value),
        async emit(type, detail) {
            const id=detail?.prompt_id;
            if(id&&type==='execution_start'){const job=backend.get(id)||{outputs:{}};job.state='running';backend.set(id,job);}
            if(id&&type==='executed'){const job=backend.get(id)||{state:'running',outputs:{}};job.outputs[detail.node]=detail.output;backend.set(id,job);}
            if(id&&(['execution_success','execution_error','execution_interrupted'].includes(type)||type==='executing'&&detail.node==null)){
                history.set(id,{outputs:backend.get(id)?.outputs||{},status:{completed:type!=='execution_error'&&type!=='execution_interrupted',status_str:type==='execution_error'?'error':'success'}});backend.delete(id);
            }
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

test('undoing a queued task keeps its real late result in the archive and redo restores it',async()=>{
    const h=createHarness(),history=createEditHistory();h.workspace.view=createWorkspaceView();history.clear(h.state);
    const task=structuredClone(h.card);task.id='new-task';task.areas.forEach(area=>area.id='new-'+area.id);h.state.cards.push(task);history.record(h.state);
    await h.run([{cardId:task.id,previewAreaIds:['new-output']}]);history.undo(h.state);
    assert.ok(!h.workspace.cards.includes(task)&&h.workspace.archivedTasks.includes(task));
    await h.emit('executed',imageResult());await h.emit('execution_success',{prompt_id:'p1'});
    const output=task.areas.find(area=>area.type==='preview');assert.equal(output.history.length,1);assert.equal(h.persisted().workspaces[0].archivedTasks.length,1);
    history.redo(h.state);assert.ok(h.workspace.cards.includes(task));assert.equal(h.workspace.archivedTasks.length,0);assert.equal(output.history.length,1);
});

test('copying a submitted workspace removes the copied submission while its result still belongs to the original',async()=>{
    const h=createHarness();await h.run();const copy=prepareWorkspaceCopy(h.switchWorkspace());
    assert.equal(copy.cards[0].historyRunSequence,undefined);assert.equal(h.card.historyRunSequence,1);
    await h.emit('executed',imageResult());await h.emit('execution_success',{prompt_id:'p1'});
    assert.equal(h.output.history.length,1);assert.equal(copy.cards[0].areas.find(area=>area.type==='preview').history.length,0);
});

test('repeated selected XY runs append real output histories and preserve the same output when converting to cards',async()=>{
    const h=createHarness(),xy=createWorkspaceView({mode:'xy'}).xy;
    xy.x={bindings:['1||text'],values:['before','after']};xy.y={bindings:['1||steps'],values:[20,30]};xy.outputNodeId='2';
    h.state.cards.splice(0);synchronizeMatrix(h.state.cards,xy,[]);const card=h.state.cards[0],area=matrixOutput(card,xy),tasks=[{cardId:card.id,previewAreaIds:[area.id]}];
    for(let run=1;run<=3;run++){
        await h.run(tasks);await h.emit('executed',imageResult(`p${run}`,[`source-${run}.png`]));await h.emit('execution_success',{prompt_id:`p${run}`});
    }
    assert.equal(h.requests.length,3);assert.equal(area.history.length,3);assert.deepEqual(plain(area.historyRuns).map(run=>run.id),['p1','p2','p3']);assert.equal(area.historyIndex,2);
    assert.equal(h.state.cards.filter(card=>matrixOutput(card,xy).history.length).length,1);
    materializeMatrixRecords(h.state.cards,xy,[]);assert.equal(card.areas[0],area);assert.equal(area.history.length,3);assert.equal(area.inputHistorySnapshots.length,3);
    assert.equal(h.persisted().workspaces[0].cards[0].areas.find(output=>output.id===area.id).history.length,3);
});

test('additional record parameters are frozen into output history without injecting them into the execution prompt',async()=>{
    const h=createHarness(),cfg={name:'cfg',value:7};
    h.app.graph.getNodeById=id=>String(id)==='1'?{widgets:[cfg]}:null;
    h.card.recordParameters=[{key:'1||cfg',label:'CFG'},{key:'1||text',label:'文本'}];
    await h.run();cfg.value=99;h.input.value='edited after submission';
    assert.equal(h.requests[0].output[1].inputs.cfg,undefined);
    await h.emit('executed',imageResult());
    assert.deepEqual(plain(h.output.historyRuns[0].recordParameters).map(record=>record.value),[7,'before']);
    assert.equal(h.output.inputHistorySnapshots[0].length,1);
});

test('running-card activity starts with execution and stops on success, interruption, error or the final executing event',async()=>{
    for(const type of ['execution_success','execution_interrupted','execution_error','executing']){
        const h=createHarness();await h.run();const running=()=>plain(h.window.CLab.getRunningCardIds(h.workspace.id));
        assert.deepEqual(running(),[]);await h.emit('execution_start',{prompt_id:'p1'});assert.deepEqual(running(),['card']);
        assert.deepEqual(plain(h.window.CLab.getRunningCardIds('another-workspace')),[]);
        await h.emit(type,{prompt_id:'p1',node:null});assert.deepEqual(running(),[]);
    }
});

test('overlapping runs retain their activity until every running job ends and early starts survive HTTP response ordering',async()=>{
    const h=createHarness();await h.run([{cardId:'card',previewAreaIds:['output']},{cardId:'card',previewAreaIds:['output']}]);
    await h.emit('execution_start',{prompt_id:'p1'});await h.emit('execution_start',{prompt_id:'p2'});
    assert.deepEqual(plain(h.window.CLab.getRunningCardIds(h.workspace.id)),['card']);await h.emit('execution_success',{prompt_id:'p1'});assert.deepEqual(plain(h.window.CLab.getRunningCardIds(h.workspace.id)),['card']);
    await h.emit('execution_interrupted',{prompt_id:'p2'});assert.deepEqual(plain(h.window.CLab.getRunningCardIds(h.workspace.id)),[]);
    const early=createHarness({async submit(h){await h.emit('execution_start',{prompt_id:'fast'});assert.deepEqual(plain(h.window.CLab.getRunningCardIds(h.workspace.id)),['card']);return {prompt_id:'fast',node_errors:{}};}});
    await early.run();await early.emit('execution_success',{prompt_id:'fast'});assert.deepEqual(plain(early.window.CLab.getRunningCardIds(early.workspace.id)),[]);
});

test('running-card progress follows the same backend percentages as the progress bar and remains still without new progress',async()=>{
    const h=createHarness();await h.run();await h.emit('execution_start',{prompt_id:'p1'});
    const progress=()=>plain(h.window.CLab.getRunningCardProgress(h.workspace.id));
    await h.emit('progress_state',{prompt_id:'p1',nodes:{a:{value:5,max:20},b:{value:5,max:20}}});
    assert.deepEqual(progress(),[{cardId:'card',progress:25}]);assert.equal(h.window._clabCardProgress.card.percentage,25);
    assert.deepEqual(progress(),[{cardId:'card',progress:25}]);await h.emit('progress',{prompt_id:'p1',value:3,max:4});
    assert.deepEqual(progress(),[{cardId:'card',progress:75}]);assert.equal(h.window._clabCardProgress.card.percentage,75);
    await h.emit('progress',{prompt_id:'unrelated',value:1,max:2});assert.equal(progress()[0].progress,75);
    await h.emit('execution_success',{prompt_id:'p1'});assert.deepEqual(progress(),[]);
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


test('XY output capture uses the shared video, audio, 3D and text history pipeline',async()=>{
    for(const [kind,output]of [
        ['video',{videos:[{filename:'clip.webm',type:'temp',subfolder:''}]}],
        ['audio',{audio:[{filename:'sound.wav',type:'temp',subfolder:''}]}],
        ['model',{'3d':[{filename:'scene.glb',type:'output',subfolder:'models'}]}],
        ['text',{text:['generated text']}],
    ]){
        const h=createHarness(),xy=createWorkspaceView({mode:'xy',xy:{outputNodeId:'2',x:{bindings:['1||text'],values:['before']},y:{bindings:['1||steps'],values:[20]}}}).xy;
        h.state.cards.splice(0);synchronizeMatrix(h.state.cards,xy,[]);h.workspace.view={mode:'xy',xy};
        const card=h.state.cards[0],area=matrixOutput(card,xy);await h.run([{cardId:card.id,previewAreaIds:[area.id]}]);
        await h.emit('executed',{prompt_id:'p1',node:'2',output});
        assert.equal(area.resultKind,kind);assert.equal(area.history.length,1);assert.equal(area.historyIndex,0);assert.equal(area.resultUrl,area.history[0]);
        assert.equal(area.historyRuns[0].id,'p1');assert.equal(area.inputHistorySnapshots.length,1);assert.equal(h.refreshes.includes(area.id),true);
        assert.equal(h.persisted().workspaces[0].cards[0].areas.find(a=>a.id===area.id).resultKind,kind);
        if(kind==='text')assert.equal(area.textContent,'generated text');
    }
});
const repeated=(length)=>Array.from({length},()=>({cardId:'card',previewAreaIds:['output']}));
const settled=()=>new Promise(resolve=>setImmediate(resolve));

test('100-task run submits five prompts initially, refills one per completion and freezes all input values',async()=>{
    const h=createHarness(),tasks=[];
    for(let i=0;i<100;i++){
        const card=structuredClone(h.card);card.id='task-'+i;card.areas[0].value='value-'+i;h.state.cards.push(card);tasks.push({cardId:card.id,previewAreaIds:['output']});
    }
    await h.run(tasks);assert.equal(h.requests.length,5);assert.equal(h.window._clabExecQueue.length,95);
    assert.ok(h.window.CLab.hasExecutionWork(h.workspace.id));assert.equal(h.window.CLab.hasExecutionWork('another'),false);
    h.state.cards.forEach(card=>card.areas[0].value='changed');
    for(let i=1;i<=100;i++){
        await h.emit('execution_start',{prompt_id:'p'+i});
        await h.emit('execution_success',{prompt_id:'p'+i});
        assert.equal(h.requests.length,Math.min(100,i+5));assert.ok(h.backend.size<=5);assert.ok(Object.keys(h.window._clabTaskMap).length<=5);
    }
    assert.deepEqual(h.requests.map(request=>request.output[1].inputs.text),Array.from({length:100},(_,i)=>'value-'+i));
    assert.equal(h.window.CLab.hasExecutionWork(),false);assert.equal(h.events.filter(event=>event==='clab_execution_idle').length,1);
});

test('fast cached completions before submission responses keep the window bounded and finish without deadlock',async()=>{
    const h=createHarness({async submit(h,index){
        await h.emit('execution_start',{prompt_id:'p'+index});await h.emit('execution_success',{prompt_id:'p'+index});
        return {prompt_id:'p'+index,node_errors:{}};
    }});
    await h.run(repeated(100));assert.equal(h.requests.length,100);assert.equal(h.window.CLab.hasExecutionWork(),false);assert.deepEqual(Object.keys(h.window._clabTaskMap),[]);
});

test('waiting limit changes affect subsequent refill without deleting accepted jobs',async()=>{
    const h=createHarness();await h.run(repeated(20));h.changeWaiting(1);await settled();
    assert.equal(h.requests.length,5);assert.equal(h.queueDeletes.length,0);
    for(let i=1;i<=3;i++){await h.emit('execution_success',{prompt_id:'p'+i});assert.equal(h.requests.length,5);}
    await h.emit('execution_success',{prompt_id:'p4'});assert.equal(h.requests.length,6);assert.equal(h.backend.size,2);
    h.changeWaiting(6);await settled();assert.equal(h.requests.length,11);assert.equal(h.backend.size,7);
});

test('a runtime failure cancels both local backlog and waiting prompts but preserves a different workspace batch',async()=>{
    const h=createHarness();await h.run(repeated(20));const other=h.switchWorkspace();await h.run(repeated(4));
    await h.emit('execution_start',{prompt_id:'p1'});await h.emit('execution_error',{prompt_id:'p1'});await settled();
    assert.equal(h.requests.length,9);assert.deepEqual(h.queueDeletes,['p2','p3','p4','p5']);
    assert.equal(h.window._clabExecQueue.length,0);assert.equal(h.window.CLab.hasExecutionWork(h.workspace.id),false);assert.equal(h.window.CLab.hasExecutionWork(other.id),true);
    for(const task of Object.values(h.window._clabTaskMap))assert.equal(task.workspaceId,other.id);
});

test('with halt disabled a runtime failure frees a slot and continues the same batch',async()=>{
    const h=createHarness({haltOnError:false});await h.run(repeated(20));await h.emit('execution_error',{prompt_id:'p1'});
    assert.equal(h.requests.length,6);assert.equal(h.queueDeletes.length,0);assert.equal(h.window._clabExecQueue.length,14);
});

test('native queue clear stops the local backlog and retains the running result',async()=>{
    const h=createHarness();await h.run(repeated(100));await h.emit('execution_start',{prompt_id:'p1'});
    await h.api.fetchApi('/queue',{method:'POST',body:JSON.stringify({clear:true})});await settled();
    assert.equal(h.requests.length,5);assert.equal(h.window._clabExecQueue.length,0);assert.deepEqual([...h.backend.keys()],['p1']);assert.equal(h.window.CLab.hasExecutionWork(),true);
    await h.emit('executed',imageResult());await h.emit('execution_success',{prompt_id:'p1'});
    assert.equal(h.output.history.length,1);assert.equal(h.window.CLab.hasExecutionWork(),false);assert.equal(h.requests.length,5);
});

test('a prompt accepted while native queue clear is in flight is deleted without refilling',async()=>{
    const h=createHarness({async submit(h,index){
        if(index===2)await h.api.fetchApi('/queue',{method:'POST',body:JSON.stringify({clear:true})});
        return {prompt_id:'p'+index,node_errors:{}};
    }});
    await h.run(repeated(100));await settled();assert.equal(h.requests.length,2);assert.ok(h.queueDeletes.includes('p2'));assert.equal(h.backend.size,0);assert.equal(h.window.CLab.hasExecutionWork(),false);
});

test('deleting a waiting prompt replenishes its slot; deleting a running prompt does not free it',async()=>{
    const h=createHarness();await h.run(repeated(20));await h.emit('execution_start',{prompt_id:'p1'});
    await h.api.fetchApi('/queue',{method:'POST',body:JSON.stringify({delete:['p2']})});await settled();
    assert.equal(h.requests.length,6);assert.equal(h.backend.size,5);
    await h.api.fetchApi('/queue',{method:'POST',body:JSON.stringify({delete:['p1']})});await settled();
    assert.equal(h.requests.length,6);assert.equal(h.window.CLab.getRunningCardIds(h.workspace.id).length,1);
});

test('reconnection recovers missed outputs once, retains queued jobs and refills the missing completion',async()=>{
    const h=createHarness();await h.run(repeated(20));h.backend.delete('p1');
    h.history.set('p1',{outputs:{2:imageResult().output},status:{completed:true,status_str:'success'}});
    await h.emit('reconnected');await settled();assert.equal(h.output.history.length,1);assert.equal(h.requests.length,6);
    await h.emit('reconnected');await settled();assert.equal(h.output.history.length,1);assert.equal(h.requests.length,6);
    assert.equal(h.output.inputHistorySnapshots[0][0].value,'before');
});

test('reconnection after an external queue clear cancels unsent work instead of rebuilding the queue',async()=>{
    const h=createHarness();await h.run(repeated(100));h.backend.clear();await h.emit('reconnected');await settled();
    assert.equal(h.requests.length,5);assert.equal(h.window._clabExecQueue.length,0);assert.equal(h.window.CLab.hasExecutionWork(),false);
});

test('reconnection to a failed run preserves halt behavior and cancels the rest of the batch',async()=>{
    const h=createHarness();await h.run(repeated(20));h.backend.delete('p1');h.history.set('p1',{outputs:{},status:{completed:false,status_str:'error'}});
    await h.emit('reconnected');await settled();assert.equal(h.requests.length,5);assert.equal(h.window._clabExecQueue.length,0);assert.equal(h.window.CLab.hasExecutionWork(),false);
});

test('engine completion replenishes the waiting window while archive copying is still pending',async()=>{
    let release,started;const copying=new Promise(resolve=>started=resolve),gate=new Promise(resolve=>release=resolve);
    const h=createHarness({async beforeArchive(){started();await gate;}});await h.run(repeated(20));
    const output=h.emit('executed',imageResult());await copying;await h.emit('execution_success',{prompt_id:'p1'});
    assert.equal(h.requests.length,6);assert.equal(h.window._clabTaskMap.p1.pendingResults,1);
    release();await output;assert.equal(h.window._clabTaskMap.p1,undefined);assert.equal(h.output.history.length,1);
});

test('a late cancelled prompt which has already started retains its result mapping until real completion',async()=>{
    const h=createHarness({async submit(h,index){
        if(index===2){await h.api.fetchApi('/queue',{method:'POST',body:JSON.stringify({clear:true})});await h.emit('execution_start',{prompt_id:'p2'});}
        return {prompt_id:'p'+index,node_errors:{}};
    }});
    await h.run(repeated(20));assert.equal(h.requests.length,2);assert.ok(h.window._clabTaskMap.p2);assert.ok(h.window.CLab.hasExecutionWork());
    await h.emit('executed',imageResult('p2'));await h.emit('execution_success',{prompt_id:'p2'});
    assert.equal(h.output.history.length,1);assert.equal(h.window.CLab.hasExecutionWork(),false);
});

test('an empty backend status between jobs does not complete locally pending progress or stop refill',async()=>{
    const h=createHarness();await h.run(repeated(20));await h.emit('status',{exec_info:{queue_remaining:0}});
    assert.equal(h.window._clabCardProgress.card.percentage,5);assert.equal(h.events.includes('clab_execution_idle'),false);
    await h.emit('execution_success',{prompt_id:'p1'});assert.equal(h.requests.length,6);assert.equal(h.window.CLab.hasExecutionWork(),true);
});

test('interrupt cancels running and waiting plugin jobs plus the entire unsent backlog',async()=>{
    const h=createHarness();await h.run(repeated(100));await h.emit('execution_start',{prompt_id:'p1'});
    assert.equal(h.window.CLab.getExecutionState().busy,true);await h.window.CLab.interruptExecution();await settled();
    assert.equal(h.requests.length,5);assert.equal(h.window._clabExecQueue.length,0);assert.equal(h.backend.size,0);
    assert.deepEqual(h.interrupts,['p1','p2','p3','p4','p5']);assert.equal(h.window.CLab.getExecutionState().busy,false);assert.equal(h.window.CLab.getExecutionState().stopping,false);
    await h.emit('status',{exec_info:{queue_remaining:0}});await settled();assert.equal(h.requests.length,5);
    await h.run();assert.equal(h.requests.length,6);assert.equal(h.window.CLab.hasExecutionWork(),true);
});

test('interrupt cancels every plugin workspace batch without deleting or interrupting native jobs',async()=>{
    const h=createHarness();await h.run(repeated(20));h.switchWorkspace();await h.run(repeated(20));
    h.backend.set('native-job',{state:'running',outputs:{}});await h.window.CLab.interruptExecution();await settled();
    assert.deepEqual([...h.backend.keys()],['native-job']);assert.equal(h.window._clabExecQueue.length,0);
    assert.ok(!h.queueDeletes.includes('native-job')&&!h.interrupts.includes('native-job'));assert.equal(h.window.CLab.hasExecutionWork(),false);
});

test('interrupt while prompt compilation is pending does not submit the compiled prompt',async()=>{
    let stop;
    const h=createHarness({async beforeBuild(h){stop=h.window.CLab.interruptExecution();await stop;}});
    await h.run(repeated(20));assert.equal(h.requests.length,0);assert.equal(h.submissions,1);assert.equal(h.window.CLab.hasExecutionWork(),false);
});

test('a prompt accepted after interrupt is also removed and a prompt already started is interrupted by id',async()=>{
    for(const start of [false,true]){
        const h=createHarness({async submit(h,index){
            if(index===2){await h.window.CLab.interruptExecution();if(start)await h.emit('execution_start',{prompt_id:'p2'});}
            return {prompt_id:'p'+index,node_errors:{}};
        }});
        await h.run(repeated(100));await settled();assert.equal(h.requests.length,2);assert.equal(h.backend.size,0);assert.equal(h.window.CLab.hasExecutionWork(),false);
        assert.ok(h.queueDeletes.includes('p2')&&h.interrupts.includes('p2'));
    }
});

test('interrupt is idempotent while a request is pending and prevents starting a new batch until acknowledged',async()=>{
    let release;const gate=new Promise(resolve=>release=resolve);
    const h=createHarness({async interrupt(h,id){await gate;if(h.backend.get(id)?.state==='running')await h.emit('execution_interrupted',{prompt_id:id});return {ok:true};}});
    await h.run(repeated(20));await h.emit('execution_start',{prompt_id:'p1'});
    const first=h.window.CLab.interruptExecution();assert.equal(h.window.CLab.interruptExecution(),first);
    assert.equal(h.window.CLab.getExecutionState().stopping,true);await assert.rejects(h.run(),/正在打断/);
    release();await first;assert.equal(h.interrupts.length,5);assert.equal(h.window.CLab.hasExecutionWork(),false);
});

test('an interrupted batch retains completed results and results already being archived',async()=>{
    let release,started;const gate=new Promise(resolve=>release=resolve),began=new Promise(resolve=>started=resolve);
    const h=createHarness({async beforeArchive(){started();await gate;}});await h.run(repeated(20));await h.emit('execution_start',{prompt_id:'p1'});
    const archiving=h.emit('executed',imageResult());await began;await h.window.CLab.interruptExecution();
    assert.equal(h.window._clabTaskMap.p1.pendingResults,1);release();await archiving;
    assert.equal(h.output.history.length,1);assert.equal(h.output.inputHistorySnapshots[0][0].value,'before');assert.equal(h.window._clabTaskMap.p1,undefined);assert.equal(h.requests.length,5);
});

test('interrupt failures preserve running task mappings and permit retry without reviving the backlog',async()=>{
    let fail=true;
    const h=createHarness({async interrupt(h,id){if(fail)return {ok:false};if(h.backend.get(id)?.state==='running')await h.emit('execution_interrupted',{prompt_id:id});return {ok:true};}});
    await h.run(repeated(20));await h.emit('execution_start',{prompt_id:'p1'});
    await assert.rejects(h.window.CLab.interruptExecution(),/未能完全打断/);assert.ok(h.window._clabTaskMap.p1);assert.equal(h.window._clabExecQueue.length,0);assert.equal(h.window.CLab.getExecutionState().stopping,false);
    fail=false;await h.window.CLab.interruptExecution();assert.equal(h.window.CLab.hasExecutionWork(),false);assert.equal(h.requests.length,5);
});

test('a deliberate interrupt recovered from history does not mark the task as a workflow failure',async()=>{
    const h=createHarness({async interrupt(){return {ok:true};}});await h.run(repeated(20));await h.emit('execution_start',{prompt_id:'p1'});
    await h.window.CLab.interruptExecution();h.backend.delete('p1');h.history.set('p1',{outputs:{},status:{completed:false,status_str:'error'}});
    await h.emit('reconnected');await settled();assert.equal(h.window.CLab.hasExecutionWork(),false);assert.notEqual(h.window._clabCardProgress.card?.isError,true);assert.equal(h.requests.length,5);
});

test('pending history recovery and file copying cannot delay sending an interrupt to the running prompt',async()=>{
    let release,started;const gate=new Promise(resolve=>release=resolve),began=new Promise(resolve=>started=resolve);
    const h=createHarness({async beforeArchive(){started();await gate;}});await h.run(repeated(20));
    h.backend.delete('p1');h.history.set('p1',{outputs:{2:imageResult().output},status:{completed:true,status_str:'success'}});await h.emit('execution_start',{prompt_id:'p2'});
    const reconnect=h.emit('reconnected');await began;const stopping=h.window.CLab.interruptExecution();await settled();
    assert.ok(h.interrupts.includes('p2'),'interrupt was blocked by archive copying');assert.ok(!h.backend.has('p2'));
    release();await Promise.all([reconnect,stopping]);assert.equal(h.output.history.length,1);assert.equal(h.window.CLab.hasExecutionWork(),false);assert.equal(h.requests.length,5);
});
