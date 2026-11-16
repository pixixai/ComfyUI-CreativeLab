import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync(new URL('../web/components/contextmenu/content/output_menu.js',import.meta.url),'utf8').replace(/^import .*$/gm,'').replaceAll('export function','function');
const renderOutputMenu=vm.runInNewContext(source+';renderOutputMenu;');
const ids=html=>[...html.matchAll(/id="clab-ctx-([^"]+)"/g)].map(match=>match[1]);
test('card output menus follow the requested order and omit removed entry points',()=>{
    assert.deepEqual(ids(renderOutputMenu({modules:true,node:true})),['select-same','del-same','remove','clear','remove-external','clean-dead','resync','toggle-node-bypass','open-explorer','download','download-all']);
});
test('table and matrix outputs share media actions without card structure commands',()=>{
    assert.deepEqual(ids(renderOutputMenu({node:true})),['remove','clear','remove-external','clean-dead','resync','toggle-node-bypass','open-explorer','download','download-all']);
    assert.deepEqual(ids(renderOutputMenu({downloads:false})),['remove','clear','remove-external','clean-dead','resync','open-explorer']);
});
