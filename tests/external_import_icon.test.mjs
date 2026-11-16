import test from 'node:test';
import assert from 'node:assert/strict';
import { externalImportIcon,outputImportIcon } from '../web/components/modules/media_types/external_import_icon.js';
test('the import marker follows the actual selected record and disappears for generated or missing output',()=>{
    const area={history:['generated.png','reference.png'],historyRuns:[null,{externalImport:{id:'i'}}],historyIndex:1,resultUrl:'reference.png'};
    assert.ok(outputImportIcon(area).includes('外部导入'));assert.ok(outputImportIcon(area).includes('reference.png'));
    area.historyIndex=0;area.resultUrl='generated.png';assert.equal(outputImportIcon(area),'');
    delete area.historyIndex;assert.equal(outputImportIcon(area),'');area.resultUrl='reference.png';assert.ok(outputImportIcon(area));
    area.missingHistoryRun={id:'missing'};assert.equal(outputImportIcon(area),'');
});
test('standalone references show a lightweight tooltip without inserting untrusted filename markup',()=>{
    assert.equal(externalImportIcon('x.png',false),'');assert.equal(externalImportIcon('',true),'');
    const icon=externalImportIcon('/view?filename='+encodeURIComponent('中文" <img src=x>.png'),true);
    assert.ok(icon.includes('无生成参数快照'));assert.ok(icon.includes('&lt;img'));assert.ok(icon.includes('&quot;'));assert.ok(!icon.includes('<img'));
    assert.ok(icon.includes('width="14"'));assert.ok(!icon.includes('<button'));
    assert.ok(icon.includes('fill="currentColor"'));assert.ok(!icon.includes('stroke='));
});
