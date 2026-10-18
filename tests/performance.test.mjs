import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const source = file => readFileSync(new URL(`../web/${file}`, import.meta.url), 'utf8')
    .replace(/import\s+[\s\S]*?\s+from\s+["'][^"']+["'];?/g, '')
    .replace(/export\s+(?=(?:async\s+)?function|const |class )/g, '');

function persistenceFixture() {
    const timers = new Map();
    let sequence = 0;
    let builds = 0;
    const state = { value: 'initial' };
    const widget = { name: 'scenes_data', value: '' };
    const graph = { _nodes: [{ type: 'CLab_SystemConfig', widgets: [widget] }] };
    const context = vm.createContext({
        state, window: {},
        setTimeout(fn) { const id = ++sequence; timers.set(id, fn); return id; },
        clearTimeout(id) { timers.delete(id); }, setInterval() { return 1; },
        buildPersistedState() { builds++; return { value: state.value }; },
    });
    vm.runInContext(source('state_manager.js'), context);
    const manager = vm.runInContext('StateManager', context);
    return { state, graph, widget, manager, timers, get builds() { return builds; } };
}

test('continuous edits coalesce and a forced save flushes the latest value once', () => {
    const h = persistenceFixture();
    for (let i = 0; i < 20; i++) { h.state.value = `edit ${i}`; h.manager.scheduleSyncToNode(h.graph); }
    assert.equal(h.timers.size, 1);
    assert.equal(h.builds, 0);
    h.manager.flushPendingSave(h.graph);
    assert.equal(h.timers.size, 0);
    assert.equal(h.builds, 1);
    assert.equal(JSON.parse(h.widget.value).value, 'edit 19');
    h.manager.flushPendingSave(h.graph);
    assert.equal(h.builds, 1);
});

test('scheduled saves persist after the interval and immediate saves cancel stale callbacks', () => {
    const h = persistenceFixture();
    h.manager.scheduleSyncToNode(h.graph);
    h.state.value = 'latest';
    [...h.timers.values()][0]();
    assert.equal(h.builds, 1);
    assert.equal(h.timers.size, 0);
    h.manager.scheduleSyncToNode(h.graph);
    h.manager.syncToNode(h.graph);
    assert.equal(h.timers.size, 0);
    assert.equal(h.builds, 2);
});

test('removed module resources are released once while moves keep their resources', () => {
    const context = vm.createContext({});
    vm.runInContext(source('components/modules/module_lifecycle.js'), context);
    const { onModuleRemoved, releaseModuleTree } = vm.runInContext('({ onModuleRemoved, releaseModuleTree })', context);
    let releases = 0;
    const control = { isConnected: true, querySelectorAll() { return []; } };
    onModuleRemoved(control, () => releases++);
    releaseModuleTree(control);
    assert.equal(releases, 0);
    control.isConnected = false;
    releaseModuleTree(control);
    releaseModuleTree(control);
    assert.equal(releases, 1);
});

test('module updates in one frame deduplicate only the changed ids', () => {
    const frames = [];
    const queries = [];
    const context = vm.createContext({
        window: {}, state: { cards: [] },
        document: { querySelector(selector) { queries.push(selector); return null; } },
        requestAnimationFrame(fn) { frames.push(fn); return frames.length; },
    });
    vm.runInContext(source('components/comp_modulearea.js'), context);
    const schedule = vm.runInContext('scheduleAreaUpdate', context);
    for (let i = 0; i < 10; i++) { schedule('first'); schedule('second'); }
    assert.equal(frames.length, 1);
    frames[0]();
    assert.equal(queries.length, 2);
    assert.match(queries[0], /first/);
    assert.match(queries[1], /second/);
});
