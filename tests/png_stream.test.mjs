import {test} from 'node:test';
import assert from 'node:assert/strict';
import {inflateSync} from 'node:zlib';
import {encodePNG} from '../web/components/contextmenu/content/png_stream.js';

test('streamed PNG preserves RGBA rows across separate bands and has valid chunks',async()=>{
    const width=7,height=5,pixels=Uint8Array.from({length:width*height*4},(_,i)=>(i*39)%256);
    async function* bands(){yield pixels.slice(0,width*8);yield pixels.slice(width*8);}
    const bytes=new Uint8Array(await(await encodePNG(width,height,bands())).arrayBuffer()),view=new DataView(bytes.buffer),chunks=[];
    assert.deepEqual([...bytes.slice(0,8)],[137,80,78,71,13,10,26,10]);
    for(let offset=8;offset<bytes.length;){const size=view.getUint32(offset),type=String.fromCharCode(...bytes.slice(offset+4,offset+8)),data=bytes.slice(offset+8,offset+8+size);let crc=0xffffffff;
        for(const byte of bytes.slice(offset+4,offset+8+size)){crc^=byte;for(let i=0;i<8;i++)crc=crc&1?0xedb88320^(crc>>>1):crc>>>1;}
        assert.equal(view.getUint32(offset+8+size),(crc^0xffffffff)>>>0);
        if(type==='IHDR'){assert.equal(new DataView(data.buffer).getUint32(0),width);assert.equal(new DataView(data.buffer).getUint32(4),height);assert.equal(data[9],6);}
        if(type==='IDAT')chunks.push(data);offset+=size+12;
    }
    const raw=inflateSync(Buffer.concat(chunks));assert.equal(raw.length,height*(width*4+1));
    const decoded=new Uint8Array(pixels.length);
    for(let row=0;row<height;row++){assert.equal(raw[row*(width*4+1)],1);for(let i=0;i<width*4;i++)decoded[row*width*4+i]=(raw[row*(width*4+1)+i+1]+(i>=4?decoded[row*width*4+i-4]:0))&255;}
    assert.deepEqual(decoded,pixels);
});
test('streamed PNG rejects incomplete rows and closes its source on failure',async()=>{
    let closed=false;
    async function* bands(){try{yield new Uint8Array(3);}finally{closed=true;}}
    await assert.rejects(encodePNG(1,1,bands()),/不完整/);assert.equal(closed,true);
    async function* missing(){yield new Uint8Array(4);}
    await assert.rejects(encodePNG(1,2,missing()),/行数不完整/);
});
