import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { workspacePreferences } from '../web/components/workspace_preferences.js';
import { tableSizes } from '../web/components/workspace_modes/table_layout.js';

test('cache limits register localized settings, load saved values and clamp updates including zero',()=>{
    const limits={cards:8,components:64,media:2,models:1},events=[],stored=new Map([['CLab.2-PerformanceMedia.Cache_models',0],['CLab.2-PerformanceMedia.WaitingTasks',6]]);let extension;
    const app={registerExtension(value){extension=value;},extensionManager:{setting:{get:id=>stored.get(id)}}};
    const executionPreferences={waiting:4};
    const context=vm.createContext({app,executionPreferences,cacheLimits:limits,workspacePreferences:{...workspacePreferences},tableSizes,window:{},document:{documentElement:{style:{setProperty(){}}},dispatchEvent:event=>events.push(event.type)},Event:class{constructor(type){this.type=type;}},setTimeout(){},console});
    const source=readFileSync(new URL('../web/clab_settings.js',import.meta.url),'utf8').replace(/import\s+[\s\S]*?\s+from\s+["'][^"']+["'];?/g,'');
    vm.runInContext(source,context);extension.setup();assert.equal(limits.models,0);assert.equal(executionPreferences.waiting,6);
    const locale=JSON.parse(readFileSync(new URL('../locales/zh/settings.json',import.meta.url),'utf8'));
    for(const key of Object.keys(limits)){
        const setting=extension.settings.find(setting=>setting.id===`CLab.2-PerformanceMedia.Cache_${key}`);assert.ok(setting);assert.ok(locale[setting.id.replaceAll('.','_')]);
        setting.onChange(0);assert.equal(limits[key],0);setting.onChange(1e6);assert.equal(limits[key],setting.attrs.max);setting.onChange(-2);assert.equal(limits[key],0);
    }
    assert.ok(events.filter(event=>event==='clab_cache_limits_change').length>=12);
    const queue=extension.settings.find(setting=>setting.id==='CLab.2-PerformanceMedia.WaitingTasks');
    assert.equal(queue.defaultValue,4);assert.ok(locale[queue.id.replaceAll('.','_')]);
    queue.onChange(99);assert.equal(executionPreferences.waiting,10);queue.onChange(-1);assert.equal(executionPreferences.waiting,1);
    assert.equal(events.at(-1),'clab_execution_window_change');
});
