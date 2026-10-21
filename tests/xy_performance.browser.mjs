import assert from 'node:assert/strict';

export async function runXYPerformanceChecks(send,sessionId) {
    const evaluate=async expression=>{
        const result=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true},sessionId);
        assert.equal(result.exceptionDetails,undefined,JSON.stringify(result.exceptionDetails));return result.result.value;
    };
    try{
        const passed=await evaluate(`import('/xy-performance-checks.js').then(m=>m.checkXYPerformance())`);
        passed.forEach(message=>console.log('PASS '+message));
        const before=await evaluate(`(()=>{const c=document.querySelector('#clab-cards-container'),r=c.getBoundingClientRect(),xy=window.xyPerf.grid.view.xy;return{x:r.left+r.width*.6,y:r.top+r.height*.5,zoom:xy.zoom,panX:xy.panX,panY:xy.panY};})()`);
        await send('Input.dispatchMouseEvent',{type:'mouseWheel',x:before.x,y:before.y,deltaX:0,deltaY:-60},sessionId);
        const after=await evaluate(`(async()=>{await new Promise(requestAnimationFrame);const {app}=await import('/scripts/app.js'),xy=window.xyPerf.grid.view.xy,saved=JSON.parse(app.graph.serialize().nodes[0].widgets_values[0]);return{zoom:xy.zoom,saved:saved.workspaces.find(w=>w.id===window.xyPerf.grid.id).view.xy.zoom};})()`);
        assert.ok(after.zoom>before.zoom);assert.equal(after.saved,after.zoom);
        console.log('PASS native wheel zoom remains interactive and workflow serialization includes the final camera');
        const model=await evaluate('window.xyPerf.prepareModels()');
        await evaluate('window.xyPerf.captureModel().then(value=>window.xyPerf.beforeRotation=value)');
        await send('Input.dispatchMouseEvent',{type:'mousePressed',x:model.x,y:model.y,button:'left',buttons:1,clickCount:1},sessionId);
        await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:model.x+40,y:model.y+12,button:'left',buttons:1},sessionId);
        await send('Input.dispatchMouseEvent',{type:'mouseReleased',x:model.x+40,y:model.y+12,button:'left',buttons:0,clickCount:1},sessionId);
        await evaluate('window.xyPerf.captureModel().then(value=>window.xyPerf.afterRotation=value)');
        assert.equal(await evaluate('window.xyPerf.afterRotation!==window.xyPerf.beforeRotation'),true,'native model drag did not rotate the cached model');
        assert.equal(await evaluate('window.xyPerf.evictModel()'),true);
        const error=await evaluate(`(async()=>{
            const restored=await window.xyPerf.captureModel(),decode=src=>new Promise(resolve=>{const i=new Image();i.onload=()=>resolve(i);i.src=src;});
            const [a,b]=await Promise.all([decode(window.xyPerf.afterRotation),decode(restored)]),canvas=document.createElement('canvas');canvas.width=a.width;canvas.height=a.height;
            if(a.width!==b.width||a.height!==b.height)return 255;
            const c=canvas.getContext('2d');c.drawImage(a,0,0);const x=c.getImageData(0,0,a.width,a.height).data;c.clearRect(0,0,a.width,a.height);c.drawImage(b,0,0);const y=c.getImageData(0,0,a.width,a.height).data;
            let sum=0;for(let i=0;i<x.length;i++)sum+=Math.abs(x[i]-y[i]);return sum/x.length;
        })()`);
        assert.ok(error<.5,`3D camera changed after cache eviction: mean pixel difference ${error}`);
        console.log('PASS hidden 3D cache stays within three renderers and restores the native rotated camera after GPU resources are released');
        return passed.length+2;
    }finally{await evaluate(`window.xyPerf?.cleanup();delete window.xyPerf;`);}
}
