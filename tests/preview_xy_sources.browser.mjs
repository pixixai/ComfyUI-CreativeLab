import assert from 'node:assert/strict';

export async function runPreviewXYSourcesChecks(evaluate,click,shot) {
    const stage='.clab-review-grid-stage';
    assert.equal(await evaluate(`!!document.querySelector('[data-review-layer]')`),false);
    assert.equal(await evaluate(`document.querySelectorAll('[data-review-xy-value]:checked').length`),4);
    assert.match(await evaluate(`document.querySelector('[data-review-xy-cell-info]').textContent`),/历史记录.*2\/2/);
    await click('[data-review-xy-tiles]');
    await click('[data-review-xy-fit]');
    assert.equal(await evaluate(`document.querySelectorAll('${stage} .clab-xy-layer-axes').length`),2);
    const retained=await evaluate(`(async()=>{
        const {getActiveWorkspace,state}=await import('/extensions/clab/components/ui_state.js');
        const {matrixCells}=await import('/extensions/clab/components/workspace_modes/xy_model.js');
        const xy=structuredClone(getActiveWorkspace().view.xy);xy.z.display='all';
        const item=matrixCells(state.cards,xy).find(item=>item.x===1&&item.y===1);
        window.xySourcesBefore=JSON.stringify({xy:getActiveWorkspace().view.xy,cards:state.cards},(key,value)=>['zoom','panX','panY','cameraReady','previewRecords','previewRecordsExpanded','tiling','display'].includes(key)?undefined:value);
        window.xySourcesKept=document.querySelector('${stage} [data-card-id="'+item.card.id+'"] img');
        return {id:item.card.id,z:item.z};
    })()`);
    await click('[data-review-xy-value=x][value="0"]');
    await click('[data-review-xy-value=y][value="0"]');
    assert.equal(await evaluate(`(()=>{
        const cells=[...document.querySelectorAll('${stage} .clab-cards-wrapper > .clab-card')];
        return cells.length===1&&cells[0].dataset.cardId===${JSON.stringify(retained.id)}&&cells[0].querySelector('img')===window.xySourcesKept;
    })()`),true,'filter keeps original media identity and task mapping');
    assert.equal(await evaluate(`document.querySelectorAll('${stage} .clab-xy-layer-axes [data-xy-edit-values=x][data-xy-tick]').length`),2);
    assert.equal(await evaluate(`document.querySelector('[data-review-xy-count=x]').textContent`),'1/2 项');
    await click(`${stage} [data-card-id="${retained.id}"] .clab-preview-bg`);
    assert.equal(await evaluate(`document.querySelector('[data-review-xy-cell-info]').textContent.includes('历史记录')`),true);
    await shot('matrix-preview-filtered');
    await click('[data-review-xy-select=x][data-review-xy-action=none]');
    assert.equal(await evaluate(`document.querySelectorAll('${stage} .clab-card,${stage} .clab-xy-empty').length`),0);
    assert.equal(await evaluate(`!!document.querySelector('${stage} .clab-review-xy-empty')`),true);
    assert.equal(await evaluate(`document.querySelector('[data-review-export=png]').disabled`),true);
    assert.equal(await evaluate(`document.querySelectorAll('[data-review-xy-value=y]:checked').length`),1,'X cancellation preserves Y selection');
    await click('[data-review-xy-select=x][data-review-xy-action=all]');
    await click('[data-review-xy-select=y][data-review-xy-action=all]');
    assert.equal(await evaluate(`document.querySelectorAll('${stage} .clab-card').length`),4);
    await click(`${stage} [data-xy-z-layer="${retained.z}"]`);
    assert.equal(await evaluate(`document.querySelectorAll('${stage} .clab-xy-layer-axes').length`),1);
    assert.equal(await evaluate(`String(document.querySelector('[data-review-xy-tiles]').checked)`),'false');
    await click('[data-review-xy-show=bindings][value=z]');
    assert.equal(await evaluate(`getComputedStyle(document.querySelector('${stage} .clab-xy-z-binding .clab-xy-binding')).visibility`),'hidden');
    assert.equal(await evaluate(`getComputedStyle(document.querySelector('[data-review-xy-tiles]')).visibility`),'visible','hiding Z summary keeps layer control');
    await click('[data-review-xy-show=bindings][value=z]');
    await click(`${stage} [data-xy-z-layer="0"]`);
    assert.equal(await evaluate(`(async()=>{
        const {getActiveWorkspace,state}=await import('/extensions/clab/components/ui_state.js');
        return JSON.stringify({xy:getActiveWorkspace().view.xy,cards:state.cards},(key,value)=>['zoom','panX','panY','cameraReady','previewRecords','previewRecordsExpanded','tiling','display'].includes(key)?undefined:value)===window.xySourcesBefore;
    })()`),true,'preview filters, histories and Z controls preserve workspace axis and task data');
    await evaluate(`(async()=>{
        const {getActiveWorkspace,state}=await import('/extensions/clab/components/ui_state.js');
        const {createPreviewXYGrid}=await import('/extensions/clab/components/contextmenu/content/preview_xy_grid.js');
        const xy=structuredClone(getActiveWorkspace().view.xy);xy.z.values.push('Third','Fourth','Fifth','Sixth','Seventh');
        const panel=document.createElement('div');panel.id='clab-test-xy-root';panel.className='clab-preview-modal-panel';
        panel.style.cssText='position:fixed;inset:10px;width:auto;height:auto;z-index:100001;display:flex;background:#202020;';
        panel.innerHTML='<aside style="width:180px;overflow:auto"></aside><main style="flex:1;min-width:0;position:relative"></main><aside style="width:250px;overflow:auto"></aside>';
        document.body.append(panel);const [left,center,right]=panel.children;
        window.xySourcesController=createPreviewXYGrid(center,left,right,()=>{},'');
        right.addEventListener('change',event=>window.xySourcesController.change(event.target,{matrixSource:'workspace'}));
        window.xySourcesController.open(xy,state.cards);window.xySourcesController.mount({matrixSource:'workspace'});window.xySourcesController.fit();
    })()`);
    await evaluate('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
    try {
        await click('#clab-test-xy-root [data-xy-z-more]');
        assert.equal(await evaluate(`document.querySelectorAll('.clab-xy-options [data-xy-option]').length`),7);
        assert.equal(await evaluate(`(()=>{const p=document.querySelector('.clab-xy-options').getBoundingClientRect(),b=document.querySelector('#clab-test-xy-root').getBoundingClientRect();return p.left>=b.left&&p.right<=b.right&&p.top>=b.top&&p.bottom<=b.bottom;})()`),true);
        await click('.clab-xy-options [data-xy-option="3"]');
        assert.match(await evaluate(`document.querySelector('#clab-test-xy-root .clab-xy-layer-title').textContent`),/Z 4\/7 · Fourth/);
        await click('#clab-test-xy-root [data-review-xy-tiles]');
        assert.equal(await evaluate(`document.querySelectorAll('#clab-test-xy-root .clab-xy-layer-axes').length`),7);
        assert.equal(await evaluate(`window.xySourcesController.downloadRecords(false,false).length`),4);
        assert.equal(await evaluate(`window.xySourcesController.jsonCards().length`),4);
        await evaluate(`window.xySourcesController.selectRange('x',false)`);
        assert.equal(await evaluate(`window.xySourcesController.downloadRecords(false,true).length+window.xySourcesController.jsonCards().length`),0);
    } finally { await evaluate(`window.xySourcesController.release();document.querySelector('#clab-test-xy-root').remove();delete window.xySourcesController;`); }
    console.log('PASS XY preview sources compact X/Y ranges, retain media and original values, clear empty exports, and switch layers on canvas');
}
