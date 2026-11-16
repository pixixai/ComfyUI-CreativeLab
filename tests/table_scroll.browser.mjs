import assert from 'node:assert/strict';

export async function runTableScrollChecks(send,sessionId){
    const evaluate=async expression=>{const result=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true},sessionId);assert.equal(result.exceptionDetails,undefined,JSON.stringify(result.exceptionDetails));return result.result.value;};
    const wait=ms=>evaluate(`new Promise(resolve=>setTimeout(resolve,${ms}))`);
    const point=await evaluate(`(()=>{const box=tw.container.getBoundingClientRect();return {x:box.left+160,y:box.top+130};})()`);
    await send('Emulation.setCPUThrottlingRate',{rate:4},sessionId);
    try{
        await evaluate(`tw.scrollProbe={frames:0,missing:[],hidden:[],empty:[],maxRows:0};tw.watching=true;tw.watchFrame=()=>{
            if(!tw.watching)return;const p=tw.scrollProbe,b=tw.container.getBoundingClientRect(),gutter=parseFloat(tw.container.querySelector('.clab-cards-wrapper').style.getPropertyValue('--clab-table-row-width'))||44;
            p.frames++;p.maxRows=Math.max(p.maxRows,tw.container.querySelectorAll('[data-table-row]').length);
            for(const dy of [70,b.height/2,b.height-70]){
                const cell=document.elementFromPoint(b.left+gutter+80,b.top+dy)?.closest('[role=cell]');
                if(!cell){if(p.missing.length<10)p.missing.push({top:tw.container.scrollTop,left:tw.container.scrollLeft,dy});continue;}
                if(getComputedStyle(cell).visibility!=='visible'){if(p.hidden.length<10)p.hidden.push(cell.dataset.areaId);continue;}
                const area=tw.ws.cards.find(card=>card.id===cell.dataset.cardId)?.areas.find(area=>area.id===cell.dataset.areaId);if(area?.type!=='edit')continue;
                const preview=cell.querySelector('.clab-table-placeholder'),input=[...cell.querySelectorAll('.clab-table-number,.clab-table-draft-value,textarea.clab-edit-val')].find(field=>field.getClientRects().length&&getComputedStyle(field).visibility==='visible');
                const value=preview&&getComputedStyle(preview).visibility==='visible'?preview.textContent:input&&getComputedStyle(input).visibility==='visible'?input.value:null;
                if(value!==String(area.value)&&p.empty.length<10)p.empty.push({id:area.id,value,expected:area.value});
            }
            requestAnimationFrame(tw.watchFrame);
        };requestAnimationFrame(tw.watchFrame);`);
        for(const deltaY of [...Array(12).fill(600),...Array(8).fill(-600)]){
            await send('Input.dispatchMouseEvent',{type:'mouseWheel',deltaX:0,deltaY,...point},sessionId);await wait(22);
        }
        for(let i=0;i<8;i++){
            await send('Input.dispatchMouseEvent',{type:'mouseWheel',deltaX:600,deltaY:0,...point},sessionId);await wait(22);
        }
        await wait(160);
        const report=await evaluate(`tw.watching=false;({...tw.scrollProbe,top:tw.container.scrollTop,left:tw.container.scrollLeft})`);
        assert.ok(report.frames>10&&report.top>0&&report.left>0,JSON.stringify(report));
        assert.deepEqual(report.missing,[],'native fast scrolling exposed gaps between table rows: '+JSON.stringify(report));
        assert.deepEqual(report.hidden,[],'native fast scrolling hid complete table cell borders: '+JSON.stringify(report));
        assert.deepEqual(report.empty,[],'visible values waited for the editor batch: '+JSON.stringify(report));
        assert.ok(report.maxRows<25,JSON.stringify(report));
        console.log('PASS CPU-throttled native wheel scrolling keeps table borders and model values visible in both directions: '+JSON.stringify(report));
    }finally{
        await evaluate(`tw.watching=false;document.activeElement?.blur();tw.container.scrollLeft=tw.container.scrollTop=0;`);
        await send('Emulation.setCPUThrottlingRate',{rate:1},sessionId);await wait(200);
    }
}
