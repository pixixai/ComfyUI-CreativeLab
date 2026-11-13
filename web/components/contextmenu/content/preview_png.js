import { encodePNG } from './png_stream.js';

export async function renderPreviewPNG(content,width,height,scale) {
    if(!Number.isFinite(scale)||scale<1||scale>10)throw new Error('放大倍数须在 1～10 之间');
    const pixelWidth=Math.ceil(width*scale),pixelHeight=Math.ceil(height*scale);
    if(!Number.isSafeInteger(pixelWidth*pixelHeight)||pixelWidth<1||pixelHeight<1)throw new Error('导出尺寸无效');
    const body=encodeURIComponent(`<foreignObject width="${width}" height="${height}">${content}</foreignObject></svg>`);
    const image=new Image(),canvas=document.createElement('canvas');
    const load=async(w,h,x=0,y=0)=>{
        image.src=`data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="${x/scale} ${y/scale} ${w/scale} ${h/scale}">`)}${body}`;
        await image.decode();
    };
    try{
        if(pixelWidth<=16384&&pixelHeight<=16384&&pixelWidth*pixelHeight<=16777216){
            await load(pixelWidth,pixelHeight);canvas.width=pixelWidth;canvas.height=pixelHeight;canvas.getContext('2d').drawImage(image,0,0);
            return await new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('PNG 生成失败')),'image/png'));
        }
        const bandHeight=Math.max(1,Math.min(512,Math.floor(16777216/(pixelWidth*4))));
        async function* bands(){
            for(let y=0;y<pixelHeight;y+=bandHeight){
                const h=Math.min(bandHeight,pixelHeight-y),band=new Uint8Array(pixelWidth*h*4);
                for(let x=0;x<pixelWidth;x+=4096){
                    const w=Math.min(4096,pixelWidth-x);await load(w,h,x,y);canvas.width=w;canvas.height=h;
                    const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);
                    const pixels=ctx.getImageData(0,0,w,h).data;
                    for(let row=0;row<h;row++)band.set(pixels.subarray(row*w*4,(row+1)*w*4),(row*pixelWidth+x)*4);
                }
                yield band;await new Promise(resolve=>setTimeout(resolve,0));
            }
        }
        return await encodePNG(pixelWidth,pixelHeight,bands());
    }finally{canvas.width=canvas.height=0;image.removeAttribute('src');}
}
