import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import { prepareConfigStorage } from '../web/config_storage.js';

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
    return { state, graph, widget, manager, timers, context, get builds() { return builds; } };
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

test('unchanged configuration does not write to the widget again', () => {
    const h = persistenceFixture();
    let value = '', writes = 0;
    Object.defineProperty(h.widget, 'value', { get: () => value, set(next) { value = next; writes++; } });
    h.manager.syncToNode(h.graph);
    h.manager.syncToNode(h.graph);
    assert.equal(writes, 1);
    h.state.value = 'changed';
    h.manager.syncToNode(h.graph);
    assert.equal(writes, 2);
});

test('wheel view saves debounce until idle and serialization flushes the latest camera', () => {
    const h = persistenceFixture();
    for (let i = 0; i < 30; i++) { h.state.value = `camera ${i}`; h.manager.scheduleViewSyncToNode(h.graph); }
    assert.equal(h.timers.size, 1);
    assert.equal(h.builds, 0);
    h.manager.flushPendingSave(h.graph);
    assert.equal(h.timers.size, 0);
    assert.equal(JSON.parse(h.widget.value).value, 'camera 29');
    assert.equal(h.builds, 1);
    h.manager.scheduleViewSyncToNode(h.graph);
    h.widget.value = '{"value":"undo"}';
    h.manager.scheduleLoadFromNode(h.graph);
    h.manager.syncToNode(h.graph);
    assert.equal(h.widget.value, '{"value":"undo"}');
    assert.equal(h.builds, 1);
});

test('config storage retains complete workflow JSON without putting it in a textarea', () => {
    const original = JSON.stringify({ text: '生成参数\n'.repeat(40000) });
    const element = { value: original };
    const widget = { name: 'scenes_data', element, options: {
        getValue: () => element.value, setValue: value => { element.value = value; },
    } };
    Object.defineProperty(widget, 'value', {
        get() { return this.options.getValue(); }, set(value) { this.options.setValue(value); },
    });
    const node = { widgets: [widget] };
    prepareConfigStorage(node);
    assert.equal(widget.value, original);
    assert.equal(element.value, '');
    assert.equal(element.readOnly, true);
    assert.equal(element.spellcheck, false);
    const restored = JSON.stringify({ text: '撤销恢复后的参数\n'.repeat(40000) });
    widget.value = restored;
    prepareConfigStorage(node);
    assert.equal(widget.value, restored);
    assert.equal(element.value, '');
    assert.equal(JSON.parse(JSON.stringify({ widgets_values: [widget.value] })).widgets_values[0], restored);
});

test('graph clear and node callbacks restore the completed graph once', () => {
    const h = persistenceFixture();
    const loaded = [];
    h.manager.loadFromNode = graph => loaded.push(graph._nodes.length);
    const nodes = h.graph._nodes;
    h.graph._nodes = [];
    h.manager.scheduleLoadFromNode(h.graph);
    assert.equal(loaded.length, 0);
    h.graph._nodes = nodes;
    h.manager.scheduleLoadFromNode(h.graph);
    h.manager.scheduleLoadFromNode(h.graph);
    assert.equal(h.timers.size, 1);
    [...h.timers.values()][0]();
    assert.deepEqual(loaded, [1]);
    assert.equal(h.manager._loadTimer, null);
});

test('undo cancels pending edits and cannot save stale UI state before restore', () => {
    const h = persistenceFixture();
    h.manager.scheduleSyncToNode(h.graph);
    h.widget.value = '{"value":"undo"}';
    h.manager.scheduleLoadFromNode(h.graph);
    h.manager.flushPendingSave(h.graph);
    h.manager.syncToNode(h.graph);
    assert.equal(h.builds, 0);
    assert.equal(h.widget.value, '{"value":"undo"}');
    assert.equal(h.timers.size, 1);
    h.manager.loadFromNode = () => {};
    [...h.timers.values()][0]();
    h.manager.syncToNode(h.graph);
    assert.equal(h.builds, 1);
});

test('creating a config anchor saves existing tasks instead of loading its empty default', () => {
    const h = persistenceFixture();
    h.graph._nodes = [];
    h.context.LiteGraph = { createNode: () => ({ type: 'CLab_SystemConfig', widgets: [h.widget] }) };
    h.graph.add = node => {
        h.graph._nodes.push(node);
        h.manager.scheduleLoadFromNode(h.graph);
    };
    h.manager.showToast = () => {};
    h.manager.createConfigNode(h.graph);
    assert.equal(h.timers.size, 0);
    assert.equal(h.manager._loadTimer, null);
    assert.equal(JSON.parse(h.widget.value).value, 'initial');
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
