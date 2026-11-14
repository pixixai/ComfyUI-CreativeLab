import test from 'node:test';
import assert from 'node:assert/strict';
import { measureInputText } from '../web/components/modules/input_measure.js';

test('text height measurements reuse equal content/typography and invalidate changed values, widths and fonts',()=>{
    const saved={document:globalThis.document,style:globalThis.getComputedStyle};let reads=0;
    const ghost={style:{}};Object.defineProperty(ghost,'scrollHeight',{get(){reads++;return 100;}});
    globalThis.document={getElementById:()=>ghost};globalThis.getComputedStyle=input=>input.computed;
    const make=()=>({style:{resize:'none'},isConnected:true,getClientRects:()=>[{}],value:'cached height test',computed:{width:'320px',fontFamily:'sans-serif',fontSize:'12px',lineHeight:'18px',borderTopWidth:'1',borderBottomWidth:'1'}});
    try{
        const input=make();measureInputText(input);assert.equal(reads,1);assert.equal(input.style.height,'110px');
        measureInputText(input);measureInputText(make());assert.equal(reads,1);
        input.value='changed text';measureInputText(input);assert.equal(reads,2);
        input.computed.width='400px';measureInputText(input);assert.equal(reads,3);
        input.computed.fontSize='14px';measureInputText(input);assert.equal(reads,4);
        input.style.resize='vertical';measureInputText(input);assert.equal(reads,4);
    }finally{globalThis.document=saved.document;globalThis.getComputedStyle=saved.style;}
});
