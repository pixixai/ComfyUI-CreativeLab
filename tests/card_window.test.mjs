import test from 'node:test';
import assert from 'node:assert/strict';
import { cardWindowRange } from '../web/components/workspace_modes/card_window_geometry.js';
import { workspacePreferences } from '../web/components/workspace_preferences.js';

test('card window includes five neighbors by default without allocating far task positions',()=>{
    assert.equal(workspacePreferences.cardBuffer,5);
    assert.deepEqual(cardWindowRange(100,0,960,320,20),{start:0,end:8,total:33980,stride:340});
    assert.deepEqual(cardWindowRange(100,17000,960,320,20),{start:45,end:58,total:33980,stride:340});
});
test('card window handles direct jumps, zero buffer and empty or shorter lists',()=>{
    assert.deepEqual(cardWindowRange(100,33020,960,320,20),{start:92,end:100,total:33980,stride:340});
    assert.deepEqual(cardWindowRange(100,17000,960,320,20,0),{start:50,end:53,total:33980,stride:340});
    assert.equal(cardWindowRange(0,0,960,320,20).total,0);
    assert.equal(cardWindowRange(2,0,960,320,20).end,2);
    assert.deepEqual(cardWindowRange(2,30000,960,320,20),{start:0,end:2,total:660,stride:340});
});
