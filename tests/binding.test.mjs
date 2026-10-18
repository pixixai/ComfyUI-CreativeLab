import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const source = readFileSync(new URL('../web/components/actions/action_binding.js', import.meta.url), 'utf8')
    .replace(/import\s+[\s\S]*?\s+from\s+["'][^"']+["'];?/g, '')
    .replace(/export\s+(?=function)/g, '');
const plain = value => JSON.parse(JSON.stringify(value));
const moduleSource = readFileSync(new URL('../web/components/modules/module_binding.js', import.meta.url), 'utf8')
    .replace(/import\s+[\s\S]*?\s+from\s+["'][^"']+["'];?/g, '')
    .replace(/export\s+(?=function)/g, '');
const mainSource = readFileSync(new URL('../web/main.js', import.meta.url), 'utf8')
    .replace(/import\s+[\s\S]*?\s+from\s+["'][^"']+["'];?/g, '');
const globalSource = readFileSync(new URL('../web/components/events/event_global.js', import.meta.url), 'utf8')
    .replace(/import\s+[\s\S]*?\s+from\s+["'][^"']+["'];?/g, '')
    .replace(/export\s+(?=function)/g, '');

function createHarness() {
    const listeners = new Map();
    const documentListeners = new Map();
    const completions = [];
    const timers = [];
    const moduleElements = new Map();
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
    const state = { selectedAreaIds: ['edit'], cards: [{ id: 'card', areas: [area, preview] }] };
    const appState = {};
    const visible = new Set(['panel', 'backdrop']);
    const container = key => ({ querySelectorAll() { return []; }, classList: {
        add() { visible.add(key); }, remove() { visible.delete(key); }, contains() { return visible.has(key); },
    } });
    const app = { registerExtension() {}, graph, canvas: {
        graph, canvas: canvasElement, selected_nodes: {}, graph_mouse: [999, 999],
        deselectAllNodes() { this.selected_nodes = {}; }, processContextMenu() {},
        convertEventToCanvasOffset(e) { return [(e.clientX - 10) / 2, (e.clientY - 20) / 2]; },
    } };
    let saves = 0;
    let toggles = 0;
    const context = vm.createContext({
        app, state, appState,
        updateSelectionUI() { saves++; },
        StateManager: { state: {}, syncToNode() { saves++; } },
        CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options?.detail; } },
        document: {
            querySelector() { return null; },
            addEventListener(type, fn) {
                if (!documentListeners.has(type)) documentListeners.set(type, new Set());
                documentListeners.get(type).add(fn);
            },
            dispatchEvent(e) {
                if (e.type === 'clab_binding_finished') completions.push({ widgets: [...(area.targetWidgets || [])], visible: visible.size, saves });
                if (documentListeners.has(e.type)) for (const fn of documentListeners.get(e.type)) fn(e);
                else if (e.type === 'clab_enter_binding_mode') context.enterBindingModeForSelected(e.detail, container('panel'), container('backdrop'));
            },
        },
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
    vm.runInContext(moduleSource, context);
    context.window.CLab = { updateSelectionUI: context.updateSelectionUI };
    vm.runInContext(mainSource, context);
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
        area, preview, state, nodes, graph, app, appState, visible, listeners, emit, flush, completions,
        get saves() { return saves; },
        summary(selected = area) { return context.generateModuleBindingHTML(selected); },
        updateBindings(ids, widgets, selected = area) { context.setBindings(selected, ids, widgets); },
        get globalSelectionUpdater() { return context.window.CLab.updateSelectionUI; },
        get toggles() { return toggles; },
        enableShortcuts(shortcut = 'P') {
            context.window._clabPickShortcutRaw = shortcut;
            vm.runInContext(globalSource, context);
            context.setupGlobalEvents(container('panel'), container('backdrop'), () => toggles++, () => {});
        },
        pressKey(key = 'p', options = {}) {
            const target = options.target || { closest() { return null; } };
            const e = { key, target, ctrlKey: false, shiftKey: false, altKey: false, metaKey: false,
                ...options, preventDefault() { this.defaultPrevented = true; },
                stopImmediatePropagation() { this.stopped = true; },
            };
            for (const fn of listeners.get('keydown') || []) fn(e);
            if (!e.stopped) for (const fn of documentListeners.get('keydown') || []) fn(e);
            flush();
            return e;
        },
        moduleEvent(type, button = 1, id = 'edit', cardId = 'card') {
            if (!moduleElements.has(id)) moduleElements.set(id, {
                dataset: { areaId: id, cardId }, listeners: new Map(),
                addEventListener(eventType, fn, capture) {
                    assert.equal(capture, true);
                    if (!this.listeners.has(eventType)) this.listeners.set(eventType, []);
                    this.listeners.get(eventType).push(fn);
                },
            });
            const areaEl = moduleElements.get(id);
            context.attachModulePickEvents({ querySelectorAll() { return [areaEl]; } });
            const event = { button, preventDefault() { this.defaultPrevented = true; }, stopPropagation() { this.stopped = true; } };
            for (const fn of areaEl.listeners.get(type) || []) fn(event);
            flush();
            return event;
        },
        clickModulePicker(id = 'edit', cardId = 'card') {
            for (const type of ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'auxclick']) this.moduleEvent(type, 1, id, cardId);
        },
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

test('module summary supports legacy bindings and escapes node titles and parameter names', () => {
    const h = createHarness();
    h.area.targetNodeId = '1'; h.area.targetWidget = 'steps';
    assert.match(h.summary(), /clab-module-binding-label">1 节点 · 1 参数<\/span>/);
    h.nodes[0].title = '<img src=x onerror=alert(1)>';
    h.area.targetWidget = '"<text>';
    const html = h.summary();
    assert.ok(html.includes('&lt;img'));
    assert.ok(html.includes('&quot;&lt;text&gt;'));
    assert.ok(!html.includes('<img'));
});

test('module binding keeps primary node and parameter consistent after removing the first node', () => {
    const h = createHarness();
    h.updateBindings(['1', '2'], ['1||steps', '2||sampler']);
    h.updateBindings(['2'], ['2||sampler']);
    assert.equal(h.area.targetNodeId, '2');
    assert.equal(h.area.targetWidget, 'sampler');
    assert.equal(h.area.value, 'euler');
    assert.equal(h.area.dataType, 'string');
});

test('removing secondary module bindings preserves the edited primary combo value', () => {
    const h = createHarness();
    h.updateBindings(['1', '2'], ['1||sampler', '2||steps']);
    h.area.value = 'custom sampler';
    h.updateBindings(['1'], ['1||sampler']);
    assert.equal(h.area.value, 'custom sampler');
});

test('clearing parameters keeps node-only binding and clearing nodes restores the unbound summary', () => {
    const h = createHarness();
    h.updateBindings(['1'], ['1||steps']);
    h.updateBindings(['1'], []);
    assert.equal(h.area.targetNodeId, '1');
    assert.equal(h.area.targetWidget, null);
    assert.match(h.summary(), /clab-module-binding-label">1 节点 · 0 参数<\/span>/);
    assert.match(h.summary(), /未绑定参数/);
    h.updateBindings([], []);
    assert.equal(h.area.targetNodeId, null);
    assert.match(h.summary(), />未绑定<\/span>/);
});

test('module multi-binding summary deduplicates nodes and parameters without listing long names', () => {
    const h = createHarness();
    h.updateBindings(['1', '2', '1'], ['1||steps', '2||steps', '1||steps']);
    assert.deepEqual(plain(h.area.targetNodeIds), ['1', '2']);
    assert.deepEqual(plain(h.area.targetWidgets), ['1||steps', '2||steps']);
    assert.match(h.summary(), /2 节点 · 2 参数/);
});

test('output binding badge shows only its current output node even after an input type switch', () => {
    const h = createHarness();
    Object.assign(h.preview, { targetNodeId: '2', targetNodeIds: ['1'], targetWidgets: ['1||steps'] });
    const html = h.summary(h.preview);
    assert.match(html, /clab-output-binding/);
    assert.match(html, /clab-module-binding-label">\[2\]<\/span>/);
    assert.ok(!html.includes('1||steps'));
    assert.ok(!html.includes('未绑定参数'));
});

test('output badge escapes node titles and displays missing or cleared bindings', () => {
    const h = createHarness();
    h.preview.targetNodeId = '1';
    h.nodes[0].title = '<img src=x onerror=alert(1)>';
    assert.ok(h.summary(h.preview).includes('&lt;img'));
    assert.ok(!h.summary(h.preview).includes('<img'));
    h.preview.targetNodeId = 'missing';
    assert.match(h.summary(h.preview), /节点已失效/);
    h.preview.targetNodeId = null;
    assert.match(h.summary(h.preview), /clab-module-binding-label">未绑定<\/span>/);
});

test('output panel changes one node without modifying input values or media history', () => {
    const h = createHarness();
    Object.assign(h.preview, { value: 'keep', history: ['result.png'], historyIndex: 0 });
    h.updateBindings(['2', '1'], ['2||steps'], h.preview);
    assert.equal(h.preview.targetNodeId, '2');
    assert.equal(h.preview.targetWidget, undefined);
    assert.equal(h.preview.value, 'keep');
    assert.deepEqual(h.preview.history, ['result.png']);
    h.updateBindings([], [], h.preview);
    assert.equal(h.preview.targetNodeId, null);
    assert.equal(h.preview.historyIndex, 0);
});

test('module picker still opens binding mode after the real main entry replaces window.CLab', () => {
    const h = createHarness();
    assert.equal(h.globalSelectionUpdater, undefined);
    h.clickModulePicker();
    assert.equal(h.appState.isBindingMode, true);
    assert.equal(h.visible.size, 0);
    h.pick(110, 35);
    assert.equal(h.visible.size, 2);
    assert.equal(h.appState.isBindingMode, false);
    assert.deepEqual(plain(h.area.targetWidgets), ['1||steps']);
});

test('pick completion notifies binding panels after saving the new bindings and restoring the plugin', () => {
    const h = createHarness();
    h.start();
    assert.equal(h.completions.length, 0);
    h.pick(110, 35);
    assert.deepEqual(plain(h.completions), [{ widgets: ['1||steps'], visible: 2, saves: 1 }]);
    assert.equal(h.appState.isBindingMode, false);
});

test('cancelled picking notifies binding panels without saving or changing existing bindings', () => {
    const h = createHarness();
    h.updateBindings(['1'], ['1||steps']);
    h.start();
    h.pick(999, 999);
    assert.deepEqual(plain(h.completions), [{ widgets: ['1||steps'], visible: 2, saves: 0 }]);
    assert.equal(h.appState.isBindingMode, false);
});

test('module picker preserves multi-selection and applies left replacement and right append across cards', () => {
    const h = createHarness();
    const another = { id: 'another', type: 'edit', targetNodeId: '2', targetWidget: 'text', value: 'keep input' };
    h.state.cards.push({ id: 'card2', areas: [another] });
    h.state.selectedAreaIds = ['edit', 'another', 'preview'];
    h.clickModulePicker('another', 'card2');
    assert.deepEqual(h.state.selectedAreaIds, ['edit', 'another', 'preview']);
    h.pick(110, 35);
    for (const area of [h.area, another]) assert.deepEqual(plain(area.targetWidgets), ['1||steps']);
    assert.equal(another.value, 'keep input');
    assert.equal(h.preview.targetNodeId, 'old');
    h.clickModulePicker();
    h.pick(210, 95, undefined, 2);
    for (const area of [h.area, another]) assert.deepEqual(plain(area.targetWidgets), ['1||steps', '2||text']);
    assert.equal(another.value, 'keep input');
});

test('middle button suppresses auto scrolling and waits for a complete click before picking', () => {
    const h = createHarness();
    for (const type of ['pointerdown', 'mousedown', 'pointerup', 'mouseup']) {
        const event = h.moduleEvent(type);
        assert.equal(event.defaultPrevented, true);
        assert.equal(event.stopped, true);
        assert.equal(h.appState.isBindingMode, undefined);
    }
    h.moduleEvent('auxclick');
    assert.equal(h.appState.isBindingMode, true);
});

test('module pick handlers preserve left and right button behavior', () => {
    const h = createHarness();
    for (const button of [0, 2]) for (const type of ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'auxclick']) {
        const event = h.moduleEvent(type, button);
        assert.equal(event.defaultPrevented, undefined);
        assert.equal(event.stopped, undefined);
    }
    assert.equal(h.appState.isBindingMode, undefined);
});

test('middle clicking an unselected module replaces the previous module selection', () => {
    const h = createHarness();
    h.state.selectedAreaIds = ['preview'];
    h.clickModulePicker();
    assert.deepEqual(plain(h.state.selectedAreaIds), ['edit']);
    h.pick(110, 35);
    assert.deepEqual(plain(h.area.targetWidgets), ['1||steps']);
    assert.equal(h.preview.targetNodeId, 'old');
});

test('middle clicking output modules picks only nodes for the selected output group', () => {
    const h = createHarness();
    const another = { id: 'another', type: 'preview', targetNodeId: 'old' };
    h.state.cards.push({ id: 'card2', areas: [another] });
    h.state.selectedAreaIds = ['edit', 'preview', 'another'];
    h.clickModulePicker('another', 'card2');
    h.pick(110, 35);
    for (const area of [h.preview, another]) {
        assert.equal(area.targetNodeId, '1');
        assert.equal(area.targetWidget, undefined);
    }
    assert.equal(h.area.targetNodeId, 'old');
});

test('module pick events bind once and use the current module type after a type change', () => {
    const h = createHarness();
    h.moduleEvent('pointerdown', 0);
    h.area.type = 'preview';
    h.clickModulePicker();
    assert.equal(h.saves, 1);
    h.pick(110, 35);
    assert.equal(h.area.targetNodeId, '1');
    assert.equal(h.area.targetWidget, 'old');
});

test('module summary has no permanent pick icon and describes the middle-click gesture', () => {
    const h = createHarness();
    assert.ok(!h.summary().includes('clab-module-node-pick'));
    assert.match(h.summary(), /中键（按下滚轮）/);
});

test('P shortcut starts picking for selected modules with the same hide and restore flow', () => {
    const h = createHarness();
    h.enableShortcuts();
    const e = h.pressKey();
    assert.equal(e.defaultPrevented, true);
    assert.equal(e.stopped, true);
    assert.equal(h.appState.isBindingMode, true);
    assert.equal(h.visible.size, 0);
    h.pick(110, 35);
    assert.equal(h.visible.size, 2);
    assert.deepEqual(plain(h.area.targetWidgets), ['1||steps']);
});

for (const kind of ['input', 'select', 'contenteditable', 'composing', 'repeat', 'hidden', 'unselected', 'disabled']) {
    test(`pick shortcut ignores ${kind} context`, () => {
        const h = createHarness();
        h.enableShortcuts(kind === 'disabled' ? '' : 'P');
        if (kind === 'hidden') h.visible.delete('panel');
        if (kind === 'unselected') h.state.selectedAreaIds = [];
        const options = kind === 'input' || kind === 'select' ? { target: { closest() { return {}; } } }
            : kind === 'contenteditable' ? { target: { isContentEditable: true } }
                : kind === 'composing' ? { isComposing: true } : kind === 'repeat' ? { repeat: true } : {};
        const e = h.pressKey('p', options);
        assert.equal(h.appState.isBindingMode, undefined);
        assert.ok(!e.defaultPrevented);
    });
}

test('custom pick shortcut compares modifiers exactly and panel shortcut still works', () => {
    const h = createHarness();
    h.enableShortcuts('Shift+P');
    h.pressKey('p');
    assert.equal(h.appState.isBindingMode, undefined);
    h.pressKey('c');
    assert.equal(h.toggles, 1);
    h.pressKey('P', { shiftKey: true });
    assert.equal(h.appState.isBindingMode, true);
});

test('pick shortcut supports selected output modules without binding their parameters', () => {
    const h = createHarness();
    h.state.selectedAreaIds = ['preview'];
    h.enableShortcuts();
    h.pressKey();
    h.pick(110, 35);
    assert.equal(h.preview.targetNodeId, '1');
    assert.equal(h.preview.targetWidget, undefined);
});
