import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const source = file => readFileSync(new URL(`../web/${file}`, import.meta.url), 'utf8')
    .replace(/import\s+[\s\S]*?\s+from\s+["'][^"']+["'];?/g, '')
    .replace(/export\s+(?=(?:async\s+)?function|const |class )/g, '');
const plain = value => JSON.parse(JSON.stringify(value));

function fixture() {
    const window = { location: { origin: 'http://localhost:8188' } };
    const context = vm.createContext({ window, URL, structuredClone });
    vm.runInContext(source('components/modules/media_types/media_utils.js'), context);
    const api = vm.runInContext('({ pushPreviewHistoryEntry, selectPreviewHistory, getHistoryIndexForUrl, getSteppedHistoryIndex, remapPreviewHistory, removePreviewHistoryIndex, clearPreviewHistory, captureCardInputSnapshot, remapHistoryModuleIds })', context);
    const input = { id: 'input', type: 'edit', targetNodeId: '1', targetWidget: 'text', value: 'initial' };
    const a = { id: 'a', type: 'preview', history: [] };
    const b = { id: 'b', type: 'preview', history: [] };
    const c = { id: 'c', type: 'preview', history: [] };
    const card = { id: 'card', areas: [input, a, b, c] };
    const add = (order, participants = [a, b, c], counts = {}, outputs = participants) => {
        input.value = `parameters ${order}`;
        const inputSnapshot = api.captureCardInputSnapshot(card);
        const run = { id: `run${order}`, order, areaIds: participants.map(area => area.id) };
        for (const area of outputs) for (let i = 0; i < (counts[area.id] || 1); i++) {
            const text = area === c;
            api.pushPreviewHistoryEntry(area, `/view?filename=${area.id}_${order}_${i}.${text ? 'txt' : 'png'}`, {
                kind: text ? 'text' : 'image', text: `text ${order}`, inputSnapshot, run,
            });
        }
        return run;
    };
    return { ...api, window, input, a, b, c, card, add };
}

test('joint and single-module runs link by execution identity despite unequal history lengths', () => {
    const h = fixture(); h.add(1); h.add(2, [h.a]); h.add(3);
    h.selectPreviewHistory(h.card, h.b, 0);
    assert.deepEqual([h.a.historyIndex, h.b.historyIndex, h.c.historyIndex], [0, 0, 0]);
    h.selectPreviewHistory(h.card, h.b, 1);
    assert.deepEqual([h.a.historyIndex, h.b.historyIndex, h.c.historyIndex], [2, 1, 1]);
    assert.equal(h.c.textContent, 'text 3');
    assert.equal(h.input.value, 'parameters 3');
});

test('selecting a single-module run leaves all nonparticipants unchanged', () => {
    const h = fixture(); h.add(1); h.add(2, [h.a]); h.add(3);
    const before = plain([h.b, h.c]);
    h.selectPreviewHistory(h.card, h.a, 1);
    assert.deepEqual(plain([h.b, h.c]), before);
    assert.equal(h.input.value, 'parameters 2');
});

test('a partial run links only its participating modules', () => {
    const h = fixture(); h.add(1); h.add(2, [h.b, h.c]); h.add(3);
    h.selectPreviewHistory(h.card, h.b, 1);
    assert.equal(h.a.historyIndex, 1);
    assert.equal(h.b.historyIndex, 1);
    assert.equal(h.c.historyIndex, 1);
    assert.equal(h.a.historyRuns[h.a.historyIndex].id, 'run3');
    assert.equal(h.c.historyRuns[h.c.historyIndex].id, 'run2');
});

test('independent selection changes only its output and still follows the input-restore preference', () => {
    const h = fixture(); h.add(1); h.add(2);
    h.window._clabSyncHistoryParams = false;
    const before = plain([h.b, h.c]);
    h.selectPreviewHistory(h.card, h.a, 0, { linked: false });
    assert.deepEqual(plain([h.b, h.c]), before);
    assert.equal(h.input.value, 'parameters 2');
    h.window._clabSyncHistoryParams = true;
    h.selectPreviewHistory(h.card, h.a, 0, { linked: false });
    assert.equal(h.input.value, 'parameters 1');
});

test('linked selection stays within its card even when another card has copied run ids', () => {
    const h = fixture(); h.add(1); h.add(2);
    const other = structuredClone(h.card);
    const before = plain(other);
    h.selectPreviewHistory(h.card, h.a, 0);
    assert.deepEqual(plain(other), before);
});

test('multiple images in one run preserve an already selected peer image', () => {
    const h = fixture(); h.add(1, undefined, { a: 3, b: 2 }); h.add(2);
    h.selectPreviewHistory(h.card, h.b, 1, { linked: false });
    h.selectPreviewHistory(h.card, h.a, 0);
    assert.equal(h.b.historyIndex, 1);
    h.selectPreviewHistory(h.card, h.a, 2);
    assert.equal(h.b.historyIndex, 1);
    assert.equal(h.c.historyIndex, 0);
});

test('missing participating outputs show no unrelated result and can navigate to surrounding runs', () => {
    const h = fixture(); h.add(1); h.add(2, undefined, {}, [h.a]); h.add(3);
    h.selectPreviewHistory(h.card, h.a, 1);
    for (const area of [h.b, h.c]) {
        assert.equal(area.resultUrl, '');
        assert.equal(area.historyIndex, -1);
        assert.equal(area.missingHistoryRun.id, 'run2');
        assert.equal(h.getSteppedHistoryIndex(area, -1), 0);
        assert.equal(h.getSteppedHistoryIndex(area, 1), 1);
    }
    h.selectPreviewHistory(h.card, h.b, 1);
    assert.equal(h.a.historyIndex, 2);
    assert.equal(h.b.missingHistoryRun, null);
    assert.equal(h.c.textContent, 'text 3');
});

test('deleting or reordering records preserves run and parameter associations', () => {
    const h = fixture(); h.add(1); h.add(2); h.add(3);
    h.remapPreviewHistory(h.b, [2, 0, 1]);
    h.removePreviewHistoryIndex(h.c, 0);
    h.selectPreviewHistory(h.card, h.b, 2);
    assert.equal(h.a.historyIndex, 1);
    assert.equal(h.c.historyIndex, 0);
    assert.equal(h.c.textContent, 'text 2');
    assert.equal(h.input.value, 'parameters 2');
});

test('a removed peer result is unavailable without discarding its remaining history', () => {
    const h = fixture(); h.add(1); h.add(2); h.removePreviewHistoryIndex(h.b, 0);
    h.selectPreviewHistory(h.card, h.a, 0);
    assert.equal(h.b.missingHistoryRun.id, 'run1');
    assert.equal(h.b.history.length, 1);
    assert.match(h.b.history[0], /b_2/);
});

test('old history without execution metadata remains independently browsable', () => {
    const h = fixture(); h.add(1);
    h.pushPreviewHistoryEntry(h.a, '/old.png');
    const before = plain([h.b, h.c]);
    h.selectPreviewHistory(h.card, h.a, 1);
    assert.deepEqual(plain([h.b, h.c]), before);
});

test('retention trims execution metadata alongside records and clearing removes all metadata', () => {
    const h = fixture(); h.window._clabMaxHistory = 2;
    h.add(1); h.add(2); h.add(3);
    assert.deepEqual(plain(h.a.historyRuns.map(run => run.id)), ['run2', 'run3']);
    assert.equal(h.a.inputHistorySnapshots.length, 2);
    h.clearPreviewHistory(h.a);
    assert.deepEqual(plain(h.a.historyRuns), []);
    assert.equal(h.a.missingHistoryRun, null);
});

test('the same asset URL from different executions keeps separate records', () => {
    const h = fixture();
    for (const order of [1, 2]) h.pushPreviewHistoryEntry(h.a, '/same.png', { run: { id: `run${order}`, order, areaIds: ['a'] } });
    assert.equal(h.a.history.length, 2);
    assert.equal(h.getHistoryIndexForUrl(h.a, '/same.png'), 1);
    h.pushPreviewHistoryEntry(h.a, '/same.png', { run: { id: 'run2', order: 2, areaIds: ['a'] } });
    assert.equal(h.a.history.length, 2);
    h.remapPreviewHistory(h.a, [1, 0]);
    assert.deepEqual(plain(h.a.historyRuns.map(run => run.id)), ['run2', 'run1']);
});

test('saved execution metadata survives JSON reload and cloned module ids can be remapped', () => {
    const h = fixture(); h.add(1); h.add(2, undefined, {}, [h.a]);
    const copy = JSON.parse(JSON.stringify(h.card));
    const idMap = new Map(copy.areas.map(area => [area.id, `${area.id}_copy`]));
    copy.areas.forEach(area => { area.id = idMap.get(area.id); });
    h.remapHistoryModuleIds(copy.areas, idMap);
    h.selectPreviewHistory(copy, copy.areas[1], 1);
    assert.equal(copy.areas[2].missingHistoryRun.id, 'run2');
    assert.equal(copy.areas[3].missingHistoryRun.id, 'run2');
    assert.equal(h.b.missingHistoryRun, null);
});

test('cloned output groups in the same card keep their own participant scope', () => {
    const h = fixture(); h.add(1); h.add(2);
    const copies = structuredClone([h.a, h.b, h.c]);
    const ids = new Map(copies.map(area => [area.id, `${area.id}_copy`]));
    copies.forEach(area => { area.id = ids.get(area.id); });
    h.remapHistoryModuleIds(copies, ids);
    h.card.areas.push(...copies);
    h.selectPreviewHistory(h.card, copies[0], 0);
    assert.deepEqual([h.a.historyIndex, h.b.historyIndex, h.c.historyIndex], [1, 1, 1]);
    assert.deepEqual(copies.map(area => area.historyIndex), [0, 0, 0]);
});
