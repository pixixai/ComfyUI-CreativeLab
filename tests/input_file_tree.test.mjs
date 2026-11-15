import test from 'node:test';
import assert from 'node:assert/strict';
import { inputDirectory,inputSubtree,invalidateInputFiles,mergeInputEntries } from '../web/components/modules/input_file_tree.js';

test('native nested paths merge with real directories without flattening or duplicating files',()=>{
    const roots=mergeInputEntries('',[{name:'refs',path:'refs',directory:true},{name:'root.png',path:'root.png',directory:false}],['root.png','refs/deep/a.png','refs/b.png','none']);
    assert.deepEqual(roots.map(entry=>entry.path),['refs','none','root.png']);
    const children=mergeInputEntries('refs',[],['refs/deep/a.png','refs/b.png','root.png','../escape.png']);
    assert.deepEqual(children.map(entry=>entry.path),['refs/deep','refs/b.png']);
    assert.equal(children[1].value,'refs/b.png');
    assert.equal(mergeInputEntries('refs/deep',[],['refs\\deep\\a.png'])[0].value,'refs\\deep\\a.png');
});
test('file names and annotated node choices are kept as literal text values',()=>{
    const value='folder/图像 " <img>.png [output]';
    assert.equal(mergeInputEntries('folder',[],[value])[0].value,value);
    assert.equal(mergeInputEntries('',[],[null,5,'/outside.png','../x.png']).length,0);
});
test('only requested folders are fetched and in-flight directory reads are shared',async()=>{
    const previous=globalThis.fetch;let requests=0,finish;
    invalidateInputFiles();globalThis.fetch=url=>{requests++;assert.equal(new URL(url,'http://local').searchParams.get('directory'),'refs/深层');return new Promise(resolve=>finish=()=>resolve({ok:true,json:async()=>({entries:[{name:'x.png',path:'refs/深层/x.png',directory:false}]})}));};
    try{const a=inputDirectory('image','refs/深层'),b=inputDirectory('image','refs/深层');assert.equal(requests,1);finish();assert.deepEqual(await a,await b);await inputDirectory('image','refs/深层');assert.equal(requests,1);}
    finally{globalThis.fetch=previous;invalidateInputFiles();}
});
test('refresh and upload invalidation discard cached listings, while failed reads can be retried',async()=>{
    const previous=globalThis.fetch;let requests=0;
    invalidateInputFiles();globalThis.fetch=async()=>({ok:++requests!==1,status:404,json:async()=>({entries:[]})});
    try{await assert.rejects(inputDirectory('audio'));await inputDirectory('audio');assert.equal(requests,2);await inputDirectory('audio');assert.equal(requests,2);invalidateInputFiles();await inputDirectory('audio');assert.equal(requests,3);await inputDirectory('video');assert.equal(requests,4);}
    finally{globalThis.fetch=previous;invalidateInputFiles();}
});
test('folder selection collects every nested file, deduplicates directory aliases and cancels stale reads',async()=>{
    const previous=globalThis.fetch,seen=[];let alive=true;
    const tree={refs:[{name:'deep',path:'refs/deep',directory:true,key:'refs/deep'},{name:'a.png',path:'refs/a.png',directory:false}],
        'refs/deep':[{name:'loop',path:'refs/deep/loop',directory:true,key:'refs'},{name:'b.png',path:'refs/deep/b.png',directory:false}]};
    invalidateInputFiles();globalThis.fetch=async url=>{const path=new URL(url,'http://local').searchParams.get('directory');seen.push(path);return {ok:true,json:async()=>({entries:tree[path]})};};
    try{assert.deepEqual(await inputSubtree('image','refs'),['refs/deep/b.png','refs/a.png']);assert.deepEqual(seen,['refs','refs/deep']);alive=false;assert.deepEqual(await inputSubtree('image','refs',[],()=>alive),[]);assert.equal(seen.length,2);}
    finally{globalThis.fetch=previous;invalidateInputFiles();}
});
