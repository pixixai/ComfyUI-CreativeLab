import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const source = readFileSync(new URL('../web/components/actions/action_binding.js', import.meta.url), 'utf8')
    .replace(/import\s+[\s\S]*?\s+from\s+["'][^"']+["'];?/g, '')
    .replace(/export\s+(?=function)/g, '');
const plain = value => JSON.parse(JSON.stringify(value));

function createHarness() {
    const listeners = new Map();
    const timers = [];
    const canvasElement = { closest() { return null; } };
    const nodes = [1, 2].map(id => ({
        id, type: 'TestNode', flags: {},
        widgets: [
            { name: 'steps', type: 'number', value: 20 },
            { name: 'sampler', type: 'combo', value: 'euler' },
            { name: 'enabled', type: 'toggle', value: false },
            { name: 'text', type: 'text', value: 'node text' },
            { name: 'upload', type: 'button' },
        ],
        getWidgetOnPos(x, y) { return y >= 30 ? this.widgets[Math.floor((y - 30) / 20)] : undefined; },
    }));
    const graph = {
        _nodes: nodes, links: {},
        getNodeById(id) { return nodes.find(n => String(n.id) === String(id)); },
        getNodeOnPos(x, y) { return y >= 0 && y < 160 ? nodes.find(n => x >= n.id * 100 && x < n.id * 100 + 80) : undefined; },
    };
    const area = { id: 'edit', type: 'edit', targetNodeId: 'old', targetWidget: 'old', value: '' };
    const preview = { id: 'preview', type: 'preview', targetNodeId: 'old' };
    const state = { selectedAreaIds: ['edit'], cards: [{ areas: [area, preview] }] };
    const appState = {};
    const visible = new Set(['panel', 'backdrop']);
    const container = key => ({ classList: {
        add() { visible.add(key); }, remove() { visible.delete(key); },
    } });
    const app = { graph, canvas: {
        graph, canvas: canvasElement, selected_nodes: {}, graph_mouse: [999, 999],
        deselectAllNodes() { this.selected_nodes = {}; }, processContextMenu() {},
        convertEventToCanvasOffset(e) { return [(e.clientX - 10) / 2, (e.clientY - 20) / 2]; },
    } };
    let saves = 0;
    const context = vm.createContext({
        app, state, appState,
        saveAndRender() { saves++; }, showBindingToast() {}, hideBindingToast() {},
        getWidgetDef(id, name) { return graph.getNodeById(id)?.widgets.find(w => w.name === name); },
        setTimeout(fn) { timers.push(fn); },
        window: {
            addEventListener(type, fn) {
                if (!listeners.has(type)) listeners.set(type, new Set());
                listeners.get(type).add(fn);
            },
            removeEventListener(type, fn) { listeners.get(type)?.delete(fn); },
        },
    });
    vm.runInContext(source, context);
    const flush = () => { while (timers.length) timers.shift()(); };
    const emit = (type, x, y, target = canvasElement, button = 0) => {
        const event = {
            type, target, button, pointerId: 1, clientX: x * 2 + 10, clientY: y * 2 + 20,
            preventDefault() { this.defaultPrevented = true; },
            stopImmediatePropagation() { this.stopped = true; },
        };
        for (const fn of listeners.get(type) || []) fn(event);
        return event;
    };
    return {
        area, preview, state, nodes, graph, app, appState, visible, listeners, emit, flush,
        get saves() { return saves; },
        start(type = 'edit') {
            context.enterBindingModeForSelected(type, container('panel'), container('backdrop'));
            flush();
        },
        pick(x, y, target = canvasElement, button = 0) {
            const down = emit('pointerdown', x, y, target, button);
            const up = emit('pointerup', x, y, target, button);
            const click = emit('click', x, y, target, button);
            flush();
            return { down, up, click };
        },
    };
}

test('node body replaces bindings using event coordinates, ignoring stale selection and cursor', () => {
    const h = createHarness();
    h.start();
    h.app.canvas.selected_nodes = { 2: h.nodes[1] };
    h.pick(110, 10);
    assert.deepEqual(plain(h.area.targetNodeIds), ['1']);
    assert.deepEqual(plain(h.area.targetWidgets), []);
    assert.equal(h.area.targetWidget, null);
});

for (const [name, y, value, dataType] of [
    ['steps', 35, 20, 'number'], ['sampler', 55, 'euler', 'string'],
    ['enabled', 75, false, 'boolean'], ['text', 95, 'node text', 'string'],
]) test(`picking ${name} binds its node and parameter and initializes the module`, () => {
    const h = createHarness();
    h.start();
    h.pick(110, y);
    assert.deepEqual(plain(h.area.targetNodeIds), ['1']);
    assert.deepEqual(plain(h.area.targetWidgets), [`1||${name}`]);
    assert.equal(h.area.targetNodeId, '1');
    assert.equal(h.area.targetWidget, name);
    assert.equal(h.area.value, value);
    assert.equal(h.area.dataType, dataType);
});

test('manual text and number values survive a rebind', () => {
    for (const y of [35, 95]) {
        const h = createHarness();
        h.area.value = 'my input';
        h.start(); h.pick(110, y);
        assert.equal(h.area.value, 'my input');
    }
});

test('right click appends distinct parameters without duplicating nodes or parameters', () => {
    const h = createHarness();
    h.start(); h.pick(110, 35);
    for (const [x, y] of [[110, 95], [210, 55], [110, 35]]) {
        h.start(); h.pick(x, y, undefined, 2);
    }
    assert.deepEqual(plain(h.area.targetNodeIds), ['1', '2']);
    assert.deepEqual(plain(h.area.targetWidgets), ['1||steps', '1||text', '2||sampler']);
});

test('DOM widget descendants resolve to their owner instead of the node under the coordinates', () => {
    const h = createHarness();
    const target = { closest() { return null; } };
    h.nodes[1].widgets[3].element = { contains(el) { return el === target; } };
    h.start(); h.pick(110, 35, target);
    assert.equal(h.area.targetNodeId, '2');
    assert.equal(h.area.targetWidget, 'text');
});

test('Vue widget rows resolve by parameter name or display label', () => {
    for (const byLabel of [false, true]) {
        const h = createHarness();
        h.nodes[1].widgets[3].label = '提示词';
        const row = {
            querySelectorAll() { return byLabel ? [] : [{ getAttribute() { return 'text'; } }]; },
            querySelector() { return byLabel ? { textContent: ' 提示词 ' } : null; },
        };
        const target = { closest(selector) { return selector.includes('data-node-id') ? { dataset: { nodeId: '2' } } : row; } };
        h.start(); h.pick(110, 35, target);
        assert.equal(h.area.targetNodeId, '2');
        assert.equal(h.area.targetWidget, 'text');
    }
});

test('action buttons and collapsed nodes bind only the node', () => {
    for (const collapsed of [false, true]) {
        const h = createHarness();
        h.nodes[0].flags.collapsed = collapsed;
        h.start(); h.pick(110, collapsed ? 35 : 115);
        assert.equal(h.area.targetNodeId, '1');
        assert.deepEqual(plain(h.area.targetWidgets), []);
    }
});

test('blank space cancels without saving and restores the panel and event handlers', () => {
    const h = createHarness();
    h.start();
    assert.equal(h.visible.size, 0);
    h.pick(10, 10);
    assert.equal(h.area.targetNodeId, 'old');
    assert.equal(h.saves, 0);
    assert.equal(h.appState.isBindingMode, false);
    assert.equal(h.visible.size, 2);
    assert.ok([...h.listeners.values()].every(set => set.size === 0));
});

test('the picking gesture is consumed before widgets can edit their values or open menus', () => {
    const h = createHarness();
    h.start();
    assert.equal(h.emit('contextmenu', 110, 75).defaultPrevented, true);
    const events = h.pick(110, 75);
    assert.ok(Object.values(events).every(e => e.defaultPrevented && e.stopped));
    assert.equal(h.nodes[0].widgets[2].value, false);
});

test('output modules keep node-only binding even when a parameter is picked', () => {
    const h = createHarness();
    h.state.selectedAreaIds = ['edit', 'preview'];
    h.start('preview'); h.pick(110, 35);
    assert.equal(h.preview.targetNodeId, '1');
    assert.equal(h.preview.targetWidget, undefined);
    assert.equal(h.area.targetNodeId, 'old');
});

test('PrimitiveNode still resolves its connected input parameters', () => {
    const h = createHarness();
    Object.assign(h.nodes[0], { type: 'PrimitiveNode', outputs: [{ links: [10] }] });
    h.nodes[1].inputs = [{ name: 'steps' }];
    h.graph.links[10] = { target_id: 2, target_slot: 0 };
    h.start(); h.pick(110, 35);
    assert.deepEqual(plain(h.area.targetWidgets), ['2||steps']);
});
