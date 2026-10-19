import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createModelFixtures } from './fixtures/models.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const requests = [];
let uploads = 0;
const audioFixture = Buffer.alloc(44 + 16000 * 2);
audioFixture.write('RIFF', 0); audioFixture.writeUInt32LE(audioFixture.length - 8, 4); audioFixture.write('WAVEfmt ', 8);
audioFixture.writeUInt32LE(16, 16); audioFixture.writeUInt16LE(1, 20); audioFixture.writeUInt16LE(1, 22);
audioFixture.writeUInt32LE(8000, 24); audioFixture.writeUInt32LE(16000, 28); audioFixture.writeUInt16LE(2, 32); audioFixture.writeUInt16LE(16, 34);
audioFixture.write('data', 36); audioFixture.writeUInt32LE(32000, 40);
for (let i = 0; i < 16000; i++) audioFixture.writeInt16LE(Math.round(Math.sin(i * Math.PI * 2 * 440 / 8000) * (4000 + 10000 * i / 16000)), 44 + i * 2);
const positions = [-1,-1,-1, 1,-1,-1, 1,1,-1, -1,1,-1, -1,-1,1, 1,-1,1, 1,1,1, -1,1,1];
const indices = [0,1,2,0,2,3, 4,6,5,4,7,6, 0,4,5,0,5,1, 3,2,6,3,6,7, 0,3,7,0,7,4, 1,5,6,1,6,2];
const geometry = Buffer.alloc(168);
positions.forEach((v,i) => geometry.writeFloatLE(v,i*4)); indices.forEach((v,i) => geometry.writeUInt16LE(v,96+i*2));
const modelJSON = Buffer.from(JSON.stringify({ asset:{version:'2.0'}, scene:0, scenes:[{nodes:[0]}], nodes:[{mesh:0}],
    meshes:[{primitives:[{attributes:{POSITION:0},indices:1,material:0}]}], materials:[{doubleSided:true,pbrMetallicRoughness:{baseColorFactor:[.7,.4,.2,1],metallicFactor:0,roughnessFactor:.8}}],
    buffers:[{byteLength:168}], bufferViews:[{buffer:0,byteOffset:0,byteLength:96,target:34962},{buffer:0,byteOffset:96,byteLength:72,target:34963}],
    accessors:[{bufferView:0,componentType:5126,count:8,type:'VEC3',min:[-1,-1,-1],max:[1,1,1]},{bufferView:1,componentType:5123,count:36,type:'SCALAR'}] }));
const jsonLength = Math.ceil(modelJSON.length/4)*4;
const glbFixture = Buffer.alloc(12+8+jsonLength+8+geometry.length,0x20);
glbFixture.writeUInt32LE(0x46546c67,0);glbFixture.writeUInt32LE(2,4);glbFixture.writeUInt32LE(glbFixture.length,8);
glbFixture.writeUInt32LE(jsonLength,12);glbFixture.writeUInt32LE(0x4e4f534a,16);modelJSON.copy(glbFixture,20);
glbFixture.writeUInt32LE(geometry.length,20+jsonLength);glbFixture.writeUInt32LE(0x004e4942,24+jsonLength);geometry.copy(glbFixture,28+jsonLength);
const modelFixtures=createModelFixtures(JSON.parse(modelJSON.toString()),geometry);
const localFBX=path.resolve(repo,'../../input/3d/texture_v128_768_moved.fbx');
const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    res.setHeader('Content-Type', 'text/javascript; charset=utf-8');
    if (url.pathname === '/') {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.end('<!doctype html><meta charset="utf-8"><script type="module" src="/checks.js"></script>');
    } else if (url.pathname === '/checks.js') {
        res.end(fs.readFileSync(path.join(repo, 'tests/fixtures/performance.js')));
    } else if (url.pathname === '/review-checks.js') {
        res.end(fs.readFileSync(path.join(repo, 'tests/fixtures/preview_review.js')));
    } else if (url.pathname === '/scripts/app.js') {
        res.end('export const app = window.testApp;');
    } else if (url.pathname === '/scripts/api.js') {
        res.end('export const api = window.testApi;');
    } else if (url.pathname === '/scripts/ui/components/buttonGroup.js') {
        res.end('export class ComfyButtonGroup { constructor(button) { this.element = button; } }');
    } else if (url.pathname === '/view') {
        requests.push(url.searchParams.get('filename'));
        // ComfyUI strips directories from filename; nested files require subfolder.
        if (/[/\\]/.test(url.searchParams.get('filename') || '')) { res.writeHead(404).end(); return; }
        const fixture=modelFixtures.get(url.searchParams.get('filename'));
        if(fixture) {
            res.setHeader('Content-Type',url.searchParams.get('filename').endsWith('.png') ? 'image/png' : 'application/octet-stream');
            res.end(fixture); return;
        }
        if(url.searchParams.get('filename')==='local-character.fbx' && fs.existsSync(localFBX)) {
            res.setHeader('Content-Type','application/octet-stream'); fs.createReadStream(localFBX).pipe(res); return;
        }
        if (url.searchParams.get('filename')?.endsWith('.glb')) {
            res.setHeader('Content-Type', 'model/gltf-binary'); res.end(url.searchParams.get('filename')==='broken.glb' ? Buffer.from('not a GLB file') : glbFixture); return;
        }
        if (url.searchParams.get('filename')?.endsWith('.wav')) {
            res.setHeader('Content-Type', 'audio/wav');
            res.setHeader('Accept-Ranges', 'bytes');
            const range = req.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
            if (range) {
                const start = Number(range[1]), end = range[2] ? Math.min(Number(range[2]), audioFixture.length - 1) : audioFixture.length - 1;
                res.statusCode = 206;
                res.setHeader('Content-Range', `bytes ${start}-${end}/${audioFixture.length}`);
                res.end(audioFixture.subarray(start, end + 1));
            } else res.end(audioFixture);
            return;
        }
        res.setHeader('Content-Type', 'image/svg+xml');
        const [width, height] = url.searchParams.get('type') === 'input' ? [150, 300] : [320, 180];
        const color=url.searchParams.get('filename')?.startsWith('review-')?(url.searchParams.get('filename').includes('-b')?'#566f9c':'#bb8c65'):'#456';
        res.end(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="${color}"/><circle cx="${width*.5}" cy="${height*.5}" r="${height*.28}" fill="#ddd"/></svg>`);
    } else if (url.pathname === '/upload/image' && req.method === 'POST') {
        req.resume();
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({name:`uploaded${++uploads}.png`,type:'input'}));
    } else if (url.pathname === '/clab/test-model-info') {
        res.setHeader('Content-Type','application/json');res.end(JSON.stringify({localFBX:fs.existsSync(localFBX)}));
    } else if (url.pathname === '/clab/get_local_history') {
        res.setHeader('Content-Type', 'application/json');
        res.end('{"status":"success","history":[]}');
    } else if (url.pathname.startsWith('/extensions/clab/')) {
        const file = path.resolve(repo, 'web', url.pathname.slice('/extensions/clab/'.length));
        if (!file.startsWith(path.join(repo, 'web') + path.sep)) { res.writeHead(403).end(); return; }
        try { res.end(fs.readFileSync(file)); } catch { res.writeHead(404).end(); }
    } else res.writeHead(404).end();
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'clab-performance-'));
const chrome = process.env.CHROME_PATH || (process.platform === 'win32' ? 'C:/Program Files/Google/Chrome/Application/chrome.exe' : 'chromium');
const browser = spawn(chrome, ['--headless=new', '--no-first-run', '--disable-background-networking', '--autoplay-policy=no-user-gesture-required', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'] });
let socket;
try {
    const endpoint = await new Promise((resolve, reject) => {
        let output = '';
        const timeout = setTimeout(() => reject(new Error('Chrome launch timed out; set CHROME_PATH if needed')), 15000);
        browser.on('error', error => { clearTimeout(timeout); reject(error); });
        browser.stderr.on('data', chunk => {
            output += chunk;
            const match = output.match(/DevTools listening on (ws:\/\/[^\s]+)/);
            if (match) { clearTimeout(timeout); resolve(match[1]); }
        });
    });
    socket = new WebSocket(endpoint);
    await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
    let sequence = 0;
    const pending = new Map();
    let onDragIntercepted;
    socket.onmessage = ({ data }) => {
        const response = JSON.parse(data);
        if (!response.id) {
            if(response.method==='Input.dragIntercepted')onDragIntercepted?.(response.params.data);
            return;
        }
        const { resolve, reject } = pending.get(response.id);
        pending.delete(response.id);
        if (response.error) reject(new Error(JSON.stringify(response.error)));
        else resolve(response.result);
    };
    const send = (method, params = {}, sessionId) => new Promise((resolve, reject) => {
        const id = ++sequence;
        pending.set(id, { resolve, reject });
        socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
    });
    const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
    await send('Emulation.setDeviceMetricsOverride', { width: 1366, height: 1000, deviceScaleFactor: 1, mobile: false }, sessionId);
    await send('Page.navigate', { url: `http://127.0.0.1:${server.address().port}/` }, sessionId);
    const result = await send('Runtime.evaluate', {
        expression: 'new Promise((resolve,reject)=>{const timer=setInterval(()=>{if(window.testResult){clearInterval(timer);resolve(window.testResult);}},50);setTimeout(()=>{clearInterval(timer);reject(new Error("browser checks timed out"));},60000);})',
        awaitPromise: true, returnByValue: true,
    }, sessionId);
    if (result.exceptionDetails) {
        const progress = await send('Runtime.evaluate', {expression:'window.testProgress',returnByValue:true},sessionId);
        console.log(JSON.stringify(progress.result.value));
    }
    assert.equal(result.exceptionDetails, undefined, JSON.stringify(result.exceptionDetails));
    const report = result.result.value;
    for (const name of report.passed) console.log(`PASS ${name}`);
    assert.equal(report.error, undefined, report.error);
    assert.deepEqual(report.errors, []);
    const position = await send('Runtime.evaluate', {
        expression:`(()=>{const canvas=document.querySelector('[data-area-id="upload-model"] .clab-glb-viewer[data-model-loaded="1"] canvas');canvas.scrollIntoView({block:'center'});const r=canvas.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height,scale:1};})()`,returnByValue:true,
    },sessionId);
    const clip = position.result.value;
    const x = clip.x + clip.width/2, y = clip.y + clip.height/2;
    await send('Input.dispatchMouseEvent', {type:'mouseMoved',x,y},sessionId);
    await new Promise(resolve=>setTimeout(resolve,100));
    const captureModel = async () => (await send('Page.captureScreenshot',{format:'png',clip},sessionId)).data;
    const beforeRotate = await captureModel();
    await send('Input.dispatchMouseEvent', {type:'mousePressed',button:'left',buttons:1,clickCount:1,x,y},sessionId);
    await send('Input.dispatchMouseEvent', {type:'mouseMoved',button:'left',buttons:1,x:x+60,y:y+20},sessionId);
    await send('Input.dispatchMouseEvent', {type:'mouseReleased',button:'left',buttons:0,clickCount:1,x:x+60,y:y+20},sessionId);
    await new Promise(resolve=>setTimeout(resolve,100));
    const afterRotate = await captureModel();
    assert.notEqual(afterRotate,beforeRotate,'native left dragging did not rotate the GLB model');
    await send('Input.dispatchMouseEvent',{type:'mouseWheel',x,y,deltaX:0,deltaY:100},sessionId);
    await new Promise(resolve=>setTimeout(resolve,100));
    assert.notEqual(await captureModel(),afterRotate,'native wheel did not zoom the GLB model');
    const panelState = await send('Runtime.evaluate',{expression:'document.querySelector("#clab-panel").classList.contains("visible")',returnByValue:true},sessionId);
    assert.equal(panelState.result.value,true,'model interaction activated the node picker');
    console.log('PASS native mouse dragging rotates GLB pixels and the wheel zooms without picking nodes');
    await send('Runtime.evaluate',{
        expression:`(async()=>{const {state}=await import('/extensions/clab/components/ui_state.js');const area=state.cards[0].areas.find(a=>a.id==='upload-model');area.value='animated.glb';window._clabSurgicallyUpdateArea(area.id);const stage=document.querySelector('[data-area-id="upload-model"] .clab-glb-viewer');stage.scrollIntoView({block:'center'});for(let i=0;i<120&&!stage.dataset.modelLoaded;i++)await new Promise(r=>setTimeout(r,30));return stage.dataset.modelLoaded;})()`,awaitPromise:true,returnByValue:true,
    },sessionId);
    const animationPosition=await send('Runtime.evaluate',{expression:`(()=>{const r=document.querySelector('[data-area-id="upload-model"] .clab-glb-viewer canvas').getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height,scale:1};})()`,returnByValue:true},sessionId);
    const animationClip=animationPosition.result.value;
    const animationPixels=async()=>(await send('Page.captureScreenshot',{format:'png',clip:animationClip},sessionId)).data;
    await new Promise(resolve=>setTimeout(resolve,100));const firstFrame=await animationPixels();
    await send('Runtime.evaluate',{expression:`(()=>{const seek=document.querySelector('[data-area-id="upload-model"] .clab-model-seek');seek.value=1;seek.dispatchEvent(new Event('input'));})()`},sessionId);
    await new Promise(resolve=>setTimeout(resolve,80));assert.notEqual(await animationPixels(),firstFrame,'seeking changed the UI but did not move actual model pixels');
    const animationX=animationClip.x+animationClip.width/2,animationY=animationClip.y+animationClip.height/2;
    await send('Input.dispatchMouseEvent',{type:'mouseWheel',x:animationX,y:animationY,deltaX:0,deltaY:100,modifiers:8},sessionId);
    await new Promise(resolve=>setTimeout(resolve,100));
    const seekTime=await send('Runtime.evaluate',{expression:`Number(document.querySelector('[data-area-id="upload-model"] .clab-model-seek').value)`,returnByValue:true},sessionId);
    assert.ok(Math.abs(seekTime.result.value-1.2)<.01,'native Shift+wheel did not seek the animation');
    const beforeZoom=await animationPixels();
    await send('Input.dispatchMouseEvent',{type:'mouseWheel',x:animationX,y:animationY,deltaX:0,deltaY:100},sessionId);
    await new Promise(resolve=>setTimeout(resolve,100));assert.notEqual(await animationPixels(),beforeZoom,'wheel did not zoom the animated model');
    const afterZoomTime=await send('Runtime.evaluate',{expression:`Number(document.querySelector('[data-area-id="upload-model"] .clab-model-seek').value)`,returnByValue:true},sessionId);
    assert.ok(Math.abs(afterZoomTime.result.value-1.2)<.01,'wheel also changed the animation time');
    console.log('PASS animation seeking changes real model pixels; native Shift+wheel seeks and wheel zooms independently');
    const outputPosition=await send('Runtime.evaluate',{
        expression:`(async()=>{const area=document.querySelector('[data-area-id="model"]'),stage=area.querySelector('.clab-glb-viewer');stage.scrollIntoView({block:'center'});for(let i=0;i<120&&!stage.dataset.modelLoaded;i++)await new Promise(r=>setTimeout(r,30));window.testModelDrags=0;window.testModelMenus=0;area.addEventListener('dragstart',()=>window.testModelDrags++);const show=window.CLab.showPreviewContextMenu;window.CLab.showPreviewContextMenu=(...args)=>{window.testModelMenus++;show(...args);};const r=stage.querySelector('canvas').getBoundingClientRect(),bg=area.querySelector('.clab-preview-bg').getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height,scale:1,bottom:bg.bottom};})()`,awaitPromise:true,returnByValue:true,
    },sessionId);
    const {bottom,...outputClip}=outputPosition.result.value;
    assert.ok(outputClip.y+outputClip.height<=bottom+1,'inline 3D canvas overflows its module preview');
    const outputX=outputClip.x+outputClip.width/2,outputY=outputClip.y+outputClip.height/2;
    const outputPixels=async()=>(await send('Page.captureScreenshot',{format:'png',clip:outputClip},sessionId)).data;
    for(const [button,buttons] of [['left',1],['left',1],['left',1],['middle',4],['right',2]]) {
        await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:outputX,y:outputY},sessionId);
        await new Promise(resolve=>setTimeout(resolve,80));const before=await outputPixels();
        await send('Input.dispatchMouseEvent',{type:'mousePressed',button,buttons,clickCount:1,x:outputX,y:outputY},sessionId);
        for(let step=1;step<=8;step++) {
            await send('Input.dispatchMouseEvent',{type:'mouseMoved',button,buttons,x:outputX+step*5,y:outputY+step*2},sessionId);
            await new Promise(resolve=>setTimeout(resolve,20));
        }
        await send('Input.dispatchMouseEvent',{type:'mouseReleased',button,buttons:0,clickCount:1,x:outputX+40,y:outputY+16},sessionId);
        await new Promise(resolve=>setTimeout(resolve,80));
        assert.ok(await outputPixels()!==before,`output 3D ${button} dragging did not change the model view`);
    }
    const gestures=await send('Runtime.evaluate',{expression:'({drags:window.testModelDrags,menus:window.testModelMenus,panel:document.querySelector("#clab-panel").classList.contains("visible")})',returnByValue:true},sessionId);
    assert.deepEqual(gestures.result.value,{drags:0,menus:0,panel:true},'3D gestures triggered module dragging, a context menu or node picking');
    await send('Input.dispatchMouseEvent',{type:'mousePressed',button:'right',buttons:2,clickCount:1,x:outputX,y:outputY},sessionId);
    await send('Input.dispatchMouseEvent',{type:'mouseReleased',button:'right',buttons:0,clickCount:1,x:outputX,y:outputY},sessionId);
    const menu=await send('Runtime.evaluate',{expression:'({count:window.testModelMenus,visible:document.querySelector(".clab-context-menu").style.display})',returnByValue:true},sessionId);
    assert.deepEqual(menu.result.value,{count:1,visible:'block'},'right clicking after panning did not restore the module menu');
    const header=await send('Runtime.evaluate',{expression:`(()=>{const r=document.querySelector('[data-area-id="model"] .clab-output-head').getBoundingClientRect();return{x:r.x+4,y:r.y+r.height/2};})()`,returnByValue:true},sessionId);
    const h=header.result.value;
    await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:h.x,y:h.y},sessionId);
    await send('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',buttons:1,clickCount:1,x:h.x,y:h.y},sessionId);
    for(let step=1;step<=8;step++) {
        await send('Input.dispatchMouseEvent',{type:'mouseMoved',button:'left',buttons:1,x:h.x+step*5,y:h.y+step*2},sessionId);
        await new Promise(resolve=>setTimeout(resolve,20));
    }
    await new Promise(resolve=>setTimeout(resolve,80));
    const outsideDrag=await send('Runtime.evaluate',{expression:'window.testModelDrags',returnByValue:true},sessionId);
    await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27},sessionId);
    await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27},sessionId);
    await send('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',buttons:0,clickCount:1,x:h.x+40,y:h.y+20},sessionId);
    assert.ok(outsideDrag.result.value>0,'dragging outside the 3D viewport no longer drags the module');
    console.log('PASS inline output gestures rotate/pan without dragging modules or opening menus; right click and dragging outside the viewport remain available');
    await send('Emulation.setDeviceMetricsOverride',{width:1024,height:768,deviceScaleFactor:1,mobile:false},sessionId);
    const browseBounds=await send('Runtime.evaluate',{
        expression:`(()=>{window.showReviewDemo('browse');const root=document.querySelector('.clab-preview-modal.visible'),panel=root.querySelector('.clab-preview-modal-panel').getBoundingClientRect(),center=root.querySelector('.clab-preview-modal-center').getBoundingClientRect(),footer=root.querySelector('.clab-browse-footer').getBoundingClientRect(),handle=root.querySelector('[data-filmstrip-resize]').getBoundingClientRect();window.nativeBrowseImage=root.querySelector('.clab-preview-modal-main-image');return{panelBottom:panel.bottom,footerBottom:footer.bottom,footerWidth:footer.width,panelWidth:panel.width,centerHeight:center.height,height:footer.height,x:handle.x+handle.width/2,y:handle.y+handle.height/2};})()`,returnByValue:true,
    },sessionId);
    const bounds=browseBounds.result.value;
    assert.ok(bounds.centerHeight>200&&Math.abs(bounds.footerWidth-bounds.panelWidth)<3&&bounds.footerBottom<=bounds.panelBottom+1,'laptop browse layout overflowed or lost its full-width filmstrip');
    for(const side of ['sources','parameters']) {
        const handle=await send('Runtime.evaluate',{expression:`(()=>{const root=document.querySelector('.clab-preview-modal.visible'),handle=root.querySelector('[data-browse-resize="${side}"]').getBoundingClientRect(),pane=root.querySelector('${side==='sources'?'.clab-preview-modal-left':'.clab-preview-modal-right'}').getBoundingClientRect();return{x:handle.x+handle.width/2,y:handle.y+handle.height/2,width:pane.width};})()`,returnByValue:true},sessionId);
        const p=handle.result.value,dx=side==='sources'?28:-28;
        await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:p.x,y:p.y},sessionId);
        await send('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',buttons:1,clickCount:1,x:p.x,y:p.y},sessionId);
        await send('Input.dispatchMouseEvent',{type:'mouseMoved',button:'left',buttons:1,x:p.x+dx,y:p.y},sessionId);
        await send('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',buttons:0,clickCount:1,x:p.x+dx,y:p.y},sessionId);
        const pane=await send('Runtime.evaluate',{expression:`(()=>{const root=document.querySelector('.clab-preview-modal.visible');return{width:root.querySelector('${side==='sources'?'.clab-preview-modal-left':'.clab-preview-modal-right'}').getBoundingClientRect().width,same:root.querySelector('.clab-preview-modal-main-image')===window.nativeBrowseImage};})()`,returnByValue:true},sessionId);
        assert.ok(pane.result.value.width>p.width+20&&pane.result.value.same,`native ${side} resize failed or replaced the preview`);
    }
    await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:bounds.x,y:bounds.y},sessionId);
    await send('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',buttons:1,clickCount:1,x:bounds.x,y:bounds.y},sessionId);
    await send('Input.dispatchMouseEvent',{type:'mouseMoved',button:'left',buttons:1,x:bounds.x,y:bounds.y-36},sessionId);
    await send('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',buttons:0,clickCount:1,x:bounds.x,y:bounds.y-36},sessionId);
    const resized=await send('Runtime.evaluate',{expression:`(()=>{const root=document.querySelector('.clab-preview-modal.visible'),size=root.querySelector('[data-browse-size]');size.value=176;size.dispatchEvent(new Event('input',{bubbles:true}));const strip=root.querySelector('.clab-browse-filmstrip'),r=strip.getBoundingClientRect();strip.scrollLeft=0;return{height:root.querySelector('.clab-browse-footer').getBoundingClientRect().height,same:root.querySelector('.clab-preview-modal-main-image')===window.nativeBrowseImage,x:r.x+r.width/2,y:r.y+r.height/2};})()`,returnByValue:true},sessionId);
    assert.ok(resized.result.value.height>bounds.height&&resized.result.value.same,'native filmstrip resizing rebuilt the active preview');
    await send('Runtime.evaluate',{expression:'document.querySelector("[data-browse-sort]").value="source";document.querySelector("[data-browse-sort]").dispatchEvent(new Event("change",{bubbles:true}));document.querySelector(".clab-browse-filmstrip").scrollLeft=0'},sessionId);
    const dragPoints=await send('Runtime.evaluate',{expression:`(()=>{const thumbs=document.querySelectorAll('.clab-browse-filmstrip .clab-filmstrip-thumb'),a=thumbs[0].getBoundingClientRect(),b=thumbs[2].getBoundingClientRect();return{x:a.x+a.width/2,y:a.y+a.height/2,targetX:b.right-2,targetY:b.y+b.height/2};})()`,returnByValue:true},sessionId);
    const points=dragPoints.result.value;
    await send('Input.setInterceptDrags',{enabled:true},sessionId);
    const intercepted=new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('native thumbnail drag was not initiated')),5000);onDragIntercepted=data=>{clearTimeout(timer);onDragIntercepted=null;resolve(data);};});
    await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:points.x,y:points.y},sessionId);
    await send('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',buttons:1,clickCount:1,x:points.x,y:points.y},sessionId);
    for(let step=1;step<=5;step++)await send('Input.dispatchMouseEvent',{type:'mouseMoved',button:'left',buttons:1,x:points.x+step*6,y:points.y},sessionId);
    const dragData=await intercepted;
    for(const type of ['dragEnter','dragOver','drop'])await send('Input.dispatchDragEvent',{type,x:points.targetX,y:points.targetY,data:dragData},sessionId);
    await send('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',buttons:0,clickCount:1,x:points.targetX,y:points.targetY},sessionId);
    await send('Input.setInterceptDrags',{enabled:false},sessionId);
    const draggedOrder=await send('Runtime.evaluate',{expression:`({order:[...document.querySelectorAll('.clab-browse-filmstrip [data-index]')].map(button=>Number(button.dataset.index)),sort:document.querySelector('[data-browse-sort]').value,same:document.querySelector('.clab-preview-modal-main-image')===window.nativeBrowseImage})`,returnByValue:true},sessionId);
    assert.deepEqual(draggedOrder.result.value.order.slice(0,3),[1,2,0],'native dragging did not insert the thumbnail at the target seam');
    assert.ok(draggedOrder.result.value.sort==='custom'&&draggedOrder.result.value.same,'native sorting replaced the preview or did not enter custom mode');
    await send('Input.dispatchMouseEvent',{type:'mouseWheel',x:resized.result.value.x,y:resized.result.value.y,deltaX:0,deltaY:400},sessionId);
    await new Promise(resolve=>setTimeout(resolve,100));
    const scroll=await send('Runtime.evaluate',{expression:'document.querySelector(".clab-browse-filmstrip").scrollLeft',returnByValue:true},sessionId);
    assert.ok(scroll.result.value>0,'the filmstrip did not scroll horizontally on a laptop viewport');
    for(const side of ['sources','parameters','filmstrip']) {
        const collapse=await send('Runtime.evaluate',{expression:`(()=>{const root=document.querySelector('.clab-preview-modal.visible'),side='${side}',handle=root.querySelector(side==='filmstrip'?'[data-filmstrip-resize]':'[data-browse-resize="'+side+'"]'),rect=handle.getBoundingClientRect(),pane=root.querySelector(side==='sources'?'.clab-preview-modal-left':side==='parameters'?'.clab-preview-modal-right':'.clab-browse-footer').getBoundingClientRect();return{x:rect.x+rect.width/2,y:rect.y+rect.height/2,size:side==='filmstrip'?pane.height:pane.width};})()`,returnByValue:true},sessionId);
        const p=collapse.result.value;
        const target=side==='filmstrip'?{x:p.x,y:p.y+p.size-50}:{x:p.x+(p.size-60)*(side==='sources'?-1:1),y:p.y};
        await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:p.x,y:p.y},sessionId);
        await send('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',buttons:1,clickCount:1,x:p.x,y:p.y},sessionId);
        await send('Input.dispatchMouseEvent',{type:'mouseMoved',button:'left',buttons:1,...target},sessionId);
        await send('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',buttons:0,clickCount:1,...target},sessionId);
        const collapsed=await send('Runtime.evaluate',{expression:`(()=>{const root=document.querySelector('.clab-preview-modal.visible'),button=root.querySelector('[data-browse-restore="${side}"]'),r=button.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2;return{collapsed:root.dataset.${side==='sources'?'sourceCollapsed':side==='parameters'?'parameterCollapsed':'filmCollapsed'},same:root.querySelector('.clab-preview-modal-main-image')===window.nativeBrowseImage,visible:!button.hidden&&r.width>0,hit:document.elementFromPoint(x,y)?.closest('[data-browse-restore]')===button,x,y};})()`,returnByValue:true},sessionId);
        const arrow=collapsed.result.value;
        assert.ok(arrow.collapsed==='true'&&arrow.same&&arrow.visible&&arrow.hit,`native ${side} collapsing failed or its restore triangle cannot be clicked`);
        await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:arrow.x,y:arrow.y},sessionId);
        await send('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',buttons:1,clickCount:1,x:arrow.x,y:arrow.y},sessionId);
        await send('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',buttons:0,clickCount:1,x:arrow.x,y:arrow.y},sessionId);
        const restored=await send('Runtime.evaluate',{expression:`(()=>{const root=document.querySelector('.clab-preview-modal.visible');return{size:parseFloat(root.style.getPropertyValue('${side==='sources'?'--browse-source-width':side==='parameters'?'--browse-parameter-width':'--browse-film-height'}')),hidden:root.querySelector('[data-browse-restore="${side}"]').hidden,same:root.querySelector('.clab-preview-modal-main-image')===window.nativeBrowseImage};})()`,returnByValue:true},sessionId);
        assert.equal(restored.result.value.size,side==='sources'?180:side==='parameters'?240:164,`native ${side} arrow did not restore the default size`);
        assert.ok(restored.result.value.hidden&&restored.result.value.same,`native ${side} restore lost the preview or left its triangle visible`);
    }
    if(process.env.CLAB_REVIEW_SCREENSHOT_PREFIX){const screenshot=await send('Page.captureScreenshot',{format:'png'},sessionId);fs.writeFileSync(`${process.env.CLAB_REVIEW_SCREENSHOT_PREFIX}-laptop.png`,Buffer.from(screenshot.data,'base64'));}
    await send('Runtime.evaluate',{expression:'document.querySelector(".clab-preview-modal-close").click()'},sessionId);
    await send('Emulation.setDeviceMetricsOverride',{width:1366,height:1000,deviceScaleFactor:1,mobile:false},sessionId);
    console.log('PASS laptop browse keeps its preview during native resizing, seam dragging, plain-wheel scrolling and collapsing/restoring all three panes');
    await send('Runtime.evaluate',{expression:"window.showReviewDemo('compare')"},sessionId);
    for(const [layout,index,slot] of [['side',2,'a'],['split',6,'b']]) {
        const target=await send('Runtime.evaluate',{expression:`(()=>{const root=document.querySelector('.clab-preview-modal.visible');root.querySelector('[data-compare-layout="${layout}"]').click();const thumb=root.querySelector('.clab-filmstrip-thumb[data-index="${index}"]');thumb.scrollIntoView({inline:'center',block:'nearest'});const from=thumb.getBoundingClientRect(),stage=root.querySelector('.clab-compare-stage'),to=stage.getBoundingClientRect(),split=parseFloat(stage.style.getPropertyValue('--compare-split'))/100;return{x:from.x+from.width/2,y:from.y+from.height/2,toX:to.x+to.width*(${slot==='a'?'split/2':'(1+split)/2'}),toY:to.y+to.height*.65};})()`,returnByValue:true},sessionId);
        const p=target.result.value;
        await send('Input.setInterceptDrags',{enabled:true},sessionId);
        const data=new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('native comparison thumbnail drag did not start')),5000);onDragIntercepted=value=>{clearTimeout(timer);onDragIntercepted=null;resolve(value);};});
        await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:p.x,y:p.y},sessionId);
        await send('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',buttons:1,clickCount:1,x:p.x,y:p.y},sessionId);
        for(let step=1;step<=5;step++)await send('Input.dispatchMouseEvent',{type:'mouseMoved',button:'left',buttons:1,x:p.x+step*6,y:p.y},sessionId);
        const payload=await data;
        for(const type of ['dragEnter','dragOver','drop'])await send('Input.dispatchDragEvent',{type,x:p.toX,y:p.toY,data:payload},sessionId);
        await send('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',buttons:0,clickCount:1,x:p.toX,y:p.toY},sessionId);
        await send('Input.setInterceptDrags',{enabled:false},sessionId);
        const dropped=await send('Runtime.evaluate',{expression:`(()=>{const root=document.querySelector('.clab-preview-modal.visible');return{badge:root.querySelector('.clab-filmstrip-thumb[data-index="${index}"] .clab-filmstrip-assignment').textContent,next:root.querySelector('[data-compare-slot="${slot==='a'?'b':'a'}"]').getAttribute('aria-pressed')};})()`,returnByValue:true},sessionId);
        assert.equal(dropped.result.value.badge,slot.toUpperCase(),`native ${layout} drop assigned the wrong comparison slot`);
        assert.equal(dropped.result.value.next,'true','comparison drop did not arm the other slot');
        const swap=await send('Runtime.evaluate',{expression:`(()=>{const root=document.querySelector('.clab-preview-modal.visible'),stage=root.querySelector('.clab-compare-stage'),r=stage.getBoundingClientRect();stage.dispatchEvent(new PointerEvent('pointermove',{bubbles:true,clientX:r.x+r.width*.7,clientY:r.y+r.height*.3}));const button=root.querySelector('[data-compare-swap]').getBoundingClientRect();return{x:button.x+button.width/2,y:button.y+button.height/2,expected:r.x+r.width*${layout==='side'?'.5':'.7'},a:root.querySelector('.label-a').title,b:root.querySelector('.label-b').title};})()`,returnByValue:true},sessionId);
        const button=swap.result.value;assert.ok(Math.abs(button.x-button.expected)<2,`${layout} exchange button is not centered on its divider`);
        await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:button.x,y:button.y},sessionId);
        await new Promise(resolve=>setTimeout(resolve,180));
        const hover=await send('Runtime.evaluate',{expression:`(()=>{const button=document.querySelector('.clab-preview-modal.visible [data-compare-swap]');return{color:getComputedStyle(button.querySelector('path')).color,stroke:parseFloat(getComputedStyle(button.querySelector('circle[stroke="currentColor"]')).strokeWidth),size:button.getBoundingClientRect().width};})()`,returnByValue:true},sessionId);
        assert.ok(hover.result.value.color==='rgb(255, 255, 255)'&&hover.result.value.stroke>1.6&&hover.result.value.size===28,'swap hover did not brighten and thicken its circle without resizing');

        await send('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',buttons:1,clickCount:1,x:button.x,y:button.y},sessionId);
        await send('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',buttons:0,clickCount:1,x:button.x,y:button.y},sessionId);
        const exchanged=await send('Runtime.evaluate',{expression:"(()=>{const root=document.querySelector('.clab-preview-modal.visible');return{a:root.querySelector('.label-a').title,b:root.querySelector('.label-b').title};})()",returnByValue:true},sessionId);
        assert.deepEqual(exchanged.result.value,{a:button.b,b:button.a},`native ${layout} divider click failed to exchange A/B`);
    }
    await send('Runtime.evaluate',{expression:'document.querySelector(".clab-preview-modal-close").click()'},sessionId);
    console.log('PASS native thumbnail drops target A/B in side and split layouts, and their divider buttons exchange media');
    for(const mode of ['browse','compare']) {
        const position=await send('Runtime.evaluate',{expression:`window.openReviewVideo('${mode}')`,awaitPromise:true,returnByValue:true},sessionId);
        const p=position.result.value;
        await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:p.x,y:p.y},sessionId);
        await send('Input.dispatchMouseEvent',{type:'mouseWheel',x:p.x,y:p.y,deltaX:0,deltaY:-100,modifiers:2},sessionId);
        await new Promise(resolve=>setTimeout(resolve,100));
        const zoom=await send('Runtime.evaluate',{expression:`(()=>{const r=window.nativePreviewTransform.getBoundingClientRect();return{width:r.width,x:r.x,y:r.y,times:window.nativePreviewVideos.map(v=>v.currentTime),scale:window.visualViewport.scale};})()`,returnByValue:true},sessionId);
        assert.ok(zoom.result.value.width>p.width&&Math.abs((p.x-zoom.result.value.x)/zoom.result.value.width-.7)<.002&&zoom.result.value.times.every(t=>Math.abs(t-.25)<.03)&&zoom.result.value.scale===1,`native ${mode} Ctrl+wheel changed playback or failed to zoom about the pointer`);
        for(const type of ['keyDown','keyUp'])await send('Input.dispatchKeyEvent',{type,key:' ',code:'Space',windowsVirtualKeyCode:32},sessionId);
        await new Promise(resolve=>setTimeout(resolve,80));
        const playing=await send('Runtime.evaluate',{expression:'window.nativePreviewVideos.every(v=>!v.paused)',returnByValue:true},sessionId);
        assert.equal(playing.result.value,true,`native ${mode} Space did not start playback`);
        for(const type of ['keyDown','keyUp'])await send('Input.dispatchKeyEvent',{type,key:' ',code:'Space',windowsVirtualKeyCode:32},sessionId);
        const before=await send('Runtime.evaluate',{expression:'window.nativePreviewVideos[0].currentTime',returnByValue:true},sessionId);
        await send('Input.dispatchMouseEvent',{type:'mouseWheel',x:p.x,y:p.y,deltaX:0,deltaY:100},sessionId);
        await new Promise(resolve=>setTimeout(resolve,100));
        const after=await send('Runtime.evaluate',{expression:'window.nativePreviewVideos.map(v=>({time:v.currentTime,paused:v.paused}))',returnByValue:true},sessionId);
        assert.ok(after.result.value.every(v=>v.paused&&Math.abs(v.time-before.result.value-.2)<.04),`native ${mode} wheel did not seek while preserving pause state`);
        if(process.env.CLAB_REVIEW_SCREENSHOT_PREFIX){const screenshot=await send('Page.captureScreenshot',{format:'png'},sessionId);fs.writeFileSync(`${process.env.CLAB_REVIEW_SCREENSHOT_PREFIX}-video-${mode}.png`,Buffer.from(screenshot.data,'base64'));}
        await send('Runtime.evaluate',{expression:'window.closeReviewVideo()'},sessionId);
    }
    console.log('PASS native browse/compare video Ctrl+wheel zooms at the pointer, Space plays/pauses and plain wheel seeks');
    if (process.env.CLAB_BROWSER_SCREENSHOT) {
        await send('Runtime.evaluate', { expression: 'document.dispatchEvent(new Event("clab_render_ui")); document.querySelector(".clab-card-body").scrollTop = 0;' }, sessionId);
        await new Promise(resolve => setTimeout(resolve, 200));
        const screenshot = await send('Page.captureScreenshot', { format: 'png' }, sessionId);
        fs.writeFileSync(process.env.CLAB_BROWSER_SCREENSHOT, Buffer.from(screenshot.data, 'base64'));
    }
    if(process.env.CLAB_REVIEW_SCREENSHOT_PREFIX)for(const mode of ['browse','compare','table','xy']) {
        await send('Runtime.evaluate',{expression:`window.showReviewDemo('${mode}')`},sessionId);
        await new Promise(resolve=>setTimeout(resolve,200));
        const screenshot=await send('Page.captureScreenshot',{format:'png'},sessionId);
        fs.writeFileSync(`${process.env.CLAB_REVIEW_SCREENSHOT_PREFIX}-${mode}.png`,Buffer.from(screenshot.data,'base64'));
    }
    if(process.env.CLAB_REVIEW_SCREENSHOT_PREFIX) {
        const exported=await send('Runtime.evaluate',{expression:'window.exportReviewDemoPNG()',awaitPromise:true,returnByValue:true},sessionId);
        fs.writeFileSync(`${process.env.CLAB_REVIEW_SCREENSHOT_PREFIX}-export.png`,Buffer.from(exported.result.value.split(',')[1],'base64'));
    }
    console.log(`${report.passed.length+6} browser checks passed; ${requests.length} media requests`);
} finally {
    socket?.close();
    browser.kill();
    await new Promise(resolve => server.close(resolve));
    // Chrome may retain profile files briefly on Windows; leave the OS temp folder to its normal cleanup.
}
