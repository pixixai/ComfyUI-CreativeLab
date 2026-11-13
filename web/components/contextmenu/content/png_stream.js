const crcTable=Uint32Array.from({length:256},(_,n)=>{for(let i=0;i<8;i++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
function chunk(type,data=new Uint8Array()) {
    const bytes=new Uint8Array(data.length+12),view=new DataView(bytes.buffer);view.setUint32(0,data.length);
    bytes.set([...type].map(c=>c.charCodeAt(0)),4);bytes.set(data,8);
    let crc=0xffffffff;for(let i=4;i<bytes.length-4;i++)crc=crcTable[(crc^bytes[i])&255]^(crc>>>8);
    view.setUint32(bytes.length-4,(crc^0xffffffff)>>>0);return bytes;
}

// PNG scanlines share one zlib stream even when their IDAT chunks arrive separately.
export async function encodePNG(width,height,bands) {
    if(!Number.isInteger(width)||!Number.isInteger(height)||width<1||height<1||width>0x7fffffff||height>0x7fffffff)throw new Error('PNG 尺寸无效');
    const header=new Uint8Array(13),view=new DataView(header.buffer);view.setUint32(0,width);view.setUint32(4,height);header[8]=8;header[9]=6;
    const parts=[new Uint8Array([137,80,78,71,13,10,26,10]),chunk('IHDR',header)],iterator=bands[Symbol.asyncIterator]();let rows=0;
    const source=new ReadableStream({
        async pull(controller){
            const {done,value}=await iterator.next();
            if(done){if(rows!==height)throw new Error('PNG 图像行数不完整');controller.close();return;}
            const stride=width*4,count=value.length/stride;
            if(!Number.isInteger(count)||rows+count>height)throw new Error('PNG 图像数据不完整');
            const filtered=new Uint8Array(value.length+count);
            for(let row=0;row<count;row++){
                const src=row*stride,dst=row*(stride+1);filtered[dst]=1;
                for(let i=0;i<stride;i++)filtered[dst+i+1]=value[src+i]-(i>=4?value[src+i-4]:0);
            }
            rows+=count;controller.enqueue(filtered);
        },
        async cancel(){await iterator.return?.();},
    });
    const reader=source.pipeThrough(new CompressionStream('deflate')).getReader();
    try{for(;;){const {done,value}=await reader.read();if(done)break;parts.push(chunk('IDAT',value));}}
    finally{try{await reader.cancel();}finally{reader.releaseLock();await iterator.return?.();}}
    parts.push(chunk('IEND'));return new Blob(parts,{type:'image/png'});
}
