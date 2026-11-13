import assert from 'node:assert/strict';

export async function runPreviewPNGChecks(send,sessionId){
    const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true},sessionId);assert.ok(!r.exceptionDetails,JSON.stringify(r.exceptionDetails));return r.result.value;};
    const result=await evaluate(`(async()=>{
        const {renderPreviewPNG}=await import('/extensions/clab/components/contextmenu/content/preview_png.js');
        const element=document.createElement('div');element.style.cssText='position:relative;width:4000px;height:2000px;background:#ff0000';element.innerHTML='<div style="position:absolute;left:1400px;top:200px;width:2600px;height:1800px;background:#00ff00"></div>';
        const blob=await renderPreviewPNG(new XMLSerializer().serializeToString(element),4000,2000,3),head=new DataView(await blob.slice(0,33).arrayBuffer());
        const sample=async(x,y,w=1,h=1)=>{const image=await createImageBitmap(blob,x,y,w,h),canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const ctx=canvas.getContext('2d');ctx.drawImage(image,0,0);image.close();return [...ctx.getImageData(0,0,w,h).data];};
        const seam=await sample(4094,347,4,4),last=await sample(11999,5999);
        const wide=document.createElement('div');wide.style.cssText='width:40000px;height:2px;background:#123456';
        const wideBlob=await renderPreviewPNG(new XMLSerializer().serializeToString(wide),40000,2,1),wideHeader=new DataView(await wideBlob.slice(0,33).arrayBuffer());
        const scaled=await renderPreviewPNG(new XMLSerializer().serializeToString(wide),4000,2,10),scaledHeader=new DataView(await scaled.slice(0,33).arrayBuffer());
        return {width:head.getUint32(16),height:head.getUint32(20),size:blob.size,seam,last,wideWidth:wideHeader.getUint32(16),scaledWidth:scaledHeader.getUint32(16),scaledHeight:scaledHeader.getUint32(20)};
    })()`);
    assert.equal(result.width,12000);assert.equal(result.height,6000);assert.ok(result.size>1000);assert.deepEqual(result.last,[0,255,0,255]);
    assert.deepEqual(result.seam,Array.from({length:16},()=>[255,0,0,255]).flat(),'tile seams have missing or shifted pixels');
    assert.equal(result.wideWidth,40000);assert.equal(result.scaledWidth,40000);assert.equal(result.scaledHeight,20);
    console.log('PASS single PNG exports exceed the former 67-megapixel and 32767px limits, preserve tile seams/final pixels, and retain exact 3x/10x dimensions');
}
