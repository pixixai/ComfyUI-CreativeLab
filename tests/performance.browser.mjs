import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createModelFixtures } from './fixtures/models.mjs';
import { runXYZBrowserChecks } from './xyz.browser.mjs';
import { runXYEditingChecks } from './xy_editing.browser.mjs';
import { runUndoBrowserChecks } from './undo.browser.mjs';
import { runXYPerformanceChecks } from './xy_performance.browser.mjs';

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
    } else if (url.pathname === '/detail-checks.js') {
        res.end(fs.readFileSync(path.join(repo, 'tests/fixtures/preview_detail.js')));
    } else if (url.pathname === '/workspace-checks.js') {
        res.end(fs.readFileSync(path.join(repo, 'tests/fixtures/workspace_modes.js')));
    } else if (url.pathname === '/xyz-checks.js') {
        res.end(fs.readFileSync(path.join(repo, 'tests/fixtures/xyz_matrix.js')));
    } else if (url.pathname === '/xy-performance-checks.js') {
        res.end(fs.readFileSync(path.join(repo, 'tests/fixtures/xy_performance.js')));
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
        const [width, height] = url.searchParams.get('rw')&&url.searchParams.get('rh')?[Number(url.searchParams.get('rw')),Number(url.searchParams.get('rh'))]:url.searchParams.get('type') === 'input' ? [150, 300] : [320, 180];
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
    const exportedFiles=await send('Runtime.evaluate',{expression:`Object.fromEntries([...window.detailArchiveFiles].map(([name,bytes])=>{let text='';for(let i=0;i<bytes.length;i+=32768)text+=String.fromCharCode(...bytes.subarray(i,i+32768));return[name,btoa(text)];}))`,returnByValue:true},sessionId);
    const offlineFolder=fs.mkdtempSync(path.join(os.tmpdir(),'clab-detail-offline-'));
    for(const [name,base64] of Object.entries(exportedFiles.result.value)){const target=path.resolve(offlineFolder,name);assert.ok(target.startsWith(offlineFolder+path.sep),'offline archive path escapes its export folder');fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,Buffer.from(base64,'base64'));}
    const offlineTarget=await send('Target.createTarget',{url:'about:blank'}),offlineSession=(await send('Target.attachToTarget',{targetId:offlineTarget.targetId,flatten:true})).sessionId;
    await send('Emulation.setDeviceMetricsOverride',{width:1366,height:1000,deviceScaleFactor:1,mobile:false},offlineSession);
    await send('Network.enable',{},offlineSession);await send('Network.setBlockedURLs',{urls:['http://*','https://*']},offlineSession);
    await send('Page.navigate',{url:pathToFileURL(path.join(offlineFolder,'index.html')).href},offlineSession);
    const offline=await send('Runtime.evaluate',{expression:`new Promise((resolve,reject)=>{let tries=0;const timer=setInterval(()=>{const cards=document.querySelectorAll('.clab-detail-card'),model=document.querySelector('.clab-glb-viewer');if(cards.length===5&&model?.dataset.modelLoaded&&document.querySelector('video')?.readyState>=2&&document.querySelector('.clab-audio-wave-status')?.hidden){clearInterval(timer);resolve({count:cards.length,first:cards[0].textContent,model:!!model.querySelector('canvas'),markdown:!!document.querySelector('.clab-text-preview-shell'),wave:!document.querySelector('.clab-audio-wave-status').hidden?document.querySelector('.clab-audio-wave-status').textContent:'ready'});}else if(++tries>160){clearInterval(timer);reject(new Error('offline detail did not load: '+document.body.textContent.slice(-500)));}},50);})`,awaitPromise:true,returnByValue:true},offlineSession);
    assert.equal(offline.exceptionDetails,undefined,JSON.stringify(offline.exceptionDetails));assert.ok(offline.result.value.first.includes('SECOND')&&offline.result.value.model&&offline.result.value.markdown&&offline.result.value.wave==='ready','offline file page failed to restore Chinese text, media or its local 3D viewer: '+JSON.stringify(offline.result.value));
    const offlineCovers=await send('Runtime.evaluate',{expression:`Promise.all([...document.querySelectorAll('.clab-detail-cover')].map(layer=>layer._detailPrepareCover())).then(()=>({count:document.querySelectorAll('.clab-detail-cover[data-ready="1"]').length,model:!!document.querySelector('[data-detail-card="detail-model"] .clab-detail-cover img'),video:document.querySelector('[data-detail-card="detail-video"] .clab-detail-cover video').paused}))`,awaitPromise:true,returnByValue:true},offlineSession);
    assert.deepEqual(offlineCovers.result.value,{count:5,model:true,video:true},'offline covers failed with HTTP blocked: '+JSON.stringify(offlineCovers));
    const offlineLayout=await send('Runtime.evaluate',{expression:`(()=>{const board=document.querySelector('.clab-detail-board'),width=board.getBoundingClientRect().width,video=board.querySelector('video'),slider=document.querySelector('[data-offline-columns]');slider.value=3;slider.dispatchEvent(new Event('input'));const fixed=Math.abs(board.getBoundingClientRect().width-width)<1&&board.querySelector('video')===video;slider.value=2;slider.dispatchEvent(new Event('input'));return {fixed,rowWidth:document.querySelector('[data-offline-rowWidth-value]').textContent};})()`,returnByValue:true},offlineSession);
    assert.deepEqual(offlineLayout.result.value,{fixed:true,rowWidth:'540px'},'offline layout does not preserve row width or media across column changes');
    await send('Runtime.evaluate',{expression:`(()=>{const card=document.querySelector('.clab-detail-card');card.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));card.querySelector('[data-step="-1"]').click();})()`},offlineSession);
    const offlineHistory=await send('Runtime.evaluate',{expression:'document.querySelector(".clab-detail-card .clab-detail-data").textContent',returnByValue:true},offlineSession);
    assert.ok(offlineHistory.result.value.includes('FIRST')&&offlineHistory.result.value.includes('中文'),'offline history switching lost its selected-field snapshot');
    if(process.env.CLAB_REVIEW_SCREENSHOT_PREFIX){const screenshot=await send('Page.captureScreenshot',{format:'png'},offlineSession);fs.writeFileSync(`${process.env.CLAB_REVIEW_SCREENSHOT_PREFIX}-offline.png`,Buffer.from(screenshot.data,'base64'));}
    await send('Target.closeTarget',{targetId:offlineTarget.targetId});
    console.log('PASS exported detail HTML opens from file:// with HTTP blocked, renders real video/audio/3D and switches historical Chinese input snapshots');
    if (process.env.CLAB_BROWSER_SCREENSHOT) {
        await send('Runtime.evaluate', { expression: 'document.dispatchEvent(new Event("clab_render_ui")); document.querySelector(".clab-card-body").scrollTop = 0;' }, sessionId);
        await new Promise(resolve => setTimeout(resolve, 200));
        const screenshot = await send('Page.captureScreenshot', { format: 'png' }, sessionId);
        fs.writeFileSync(process.env.CLAB_BROWSER_SCREENSHOT, Buffer.from(screenshot.data, 'base64'));
    }
    if(process.env.CLAB_REVIEW_SCREENSHOT_PREFIX)for(const mode of ['browse','compare','detail','xy']) {
        await send('Runtime.evaluate',{expression:`window.showReviewDemo('${mode}')`},sessionId);
        await new Promise(resolve=>setTimeout(resolve,200));
        const screenshot=await send('Page.captureScreenshot',{format:'png'},sessionId);
        fs.writeFileSync(`${process.env.CLAB_REVIEW_SCREENSHOT_PREFIX}-${mode}.png`,Buffer.from(screenshot.data,'base64'));
    }
    if(process.env.CLAB_REVIEW_SCREENSHOT_PREFIX) {
        const exported=await send('Runtime.evaluate',{expression:'window.exportReviewDemoPNG()',awaitPromise:true,returnByValue:true},sessionId);
        fs.writeFileSync(`${process.env.CLAB_REVIEW_SCREENSHOT_PREFIX}-export.png`,Buffer.from(exported.result.value.split(',')[1],'base64'));
    }
    await send('Runtime.evaluate',{expression:'window.showDetailDemo()'},sessionId);await new Promise(resolve=>setTimeout(resolve,350));
    const sourceEye=await send('Runtime.evaluate',{expression:`(()=>{const eye=document.querySelector('[data-detail-visibility]:not(:disabled)'),label=eye.closest('.clab-detail-source-option').querySelector('label span'),a=eye.getBoundingClientRect(),b=label.getBoundingClientRect();return{x:a.x+a.width/2,y:a.y+a.height/2,labelX:b.x,labelWidth:b.width};})()`,returnByValue:true},sessionId);
    await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:sourceEye.result.value.x,y:sourceEye.result.value.y},sessionId);await new Promise(resolve=>setTimeout(resolve,180));
    const eyeHover=await send('Runtime.evaluate',{expression:`(()=>{const eye=document.querySelector('[data-detail-visibility]:not(:disabled)'),label=eye.closest('.clab-detail-source-option').querySelector('label span').getBoundingClientRect();return{opacity:getComputedStyle(eye).opacity,pointer:getComputedStyle(eye).pointerEvents,labelX:label.x,labelWidth:label.width};})()`,returnByValue:true},sessionId);
    assert.deepEqual(eyeHover.result.value,{opacity:'1',pointer:'auto',labelX:sourceEye.result.value.labelX,labelWidth:sourceEye.result.value.labelWidth},'source eye did not appear under the mouse or shifted its field label');
    for(const pressed of ['false','true']){
        await send('Input.dispatchMouseEvent',{type:'mousePressed',x:sourceEye.result.value.x,y:sourceEye.result.value.y,button:'left',clickCount:1},sessionId);
        await send('Input.dispatchMouseEvent',{type:'mouseReleased',x:sourceEye.result.value.x,y:sourceEye.result.value.y,button:'left',clickCount:1},sessionId);
        const status=await send('Runtime.evaluate',{expression:`document.querySelector('[data-detail-visibility]:not(:disabled)').getAttribute('aria-pressed')`,returnByValue:true},sessionId);assert.equal(status.result.value,pressed,'native eye click did not toggle matching fields independently of the row checkbox');
    }
    console.log('PASS native source-field hover reveals the shared eye without label movement, and real clicks hide and restore matching fields');
    const outputEye=await send('Runtime.evaluate',{expression:`(()=>{const eye=document.querySelector('[data-detail-output-switch="单独运行的视频"]');eye.scrollIntoView({block:'center'});window.nativeOutputEye=eye;const a=eye.getBoundingClientRect();return{x:a.x+a.width/2,y:a.y+a.height/2};})()`,returnByValue:true},sessionId);
    await send('Input.dispatchMouseEvent',{type:'mouseMoved',...outputEye.result.value},sessionId);await new Promise(resolve=>setTimeout(resolve,180));
    for(let i=0;i<2;i++){
        await send('Input.dispatchMouseEvent',{type:'mouseMoved',...outputEye.result.value},sessionId);await new Promise(resolve=>setTimeout(resolve,150));
        for(const type of ['mousePressed','mouseReleased'])await send('Input.dispatchMouseEvent',{type,...outputEye.result.value,button:'left',clickCount:1},sessionId);
        const option=await send('Runtime.evaluate',{expression:`(()=>{const button=document.querySelector('[data-detail-apply-role="output"]'),r=button.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};})()`,returnByValue:true},sessionId);
        for(const type of ['mousePressed','mouseReleased'])await send('Input.dispatchMouseEvent',{type,...option.result.value,button:'left',clickCount:1},sessionId);
        const status=await send('Runtime.evaluate',{expression:`(()=>{const eye=document.querySelector('[data-detail-output-switch="单独运行的视频"]');return{same:eye===window.nativeOutputEye,selected:eye.getAttribute('aria-expanded'),count:[...document.querySelectorAll('[data-detail-output]:checked')].filter(input=>input.value==='detail-alt-out'||input.value.endsWith('-alt-out')).length};})()`,returnByValue:true},sessionId);
        assert.deepEqual(status.result.value,{same:true,selected:'false',count:3},'native batch apply menu did not switch matching outputs or retain its source control');
    }
    await send('Runtime.evaluate',{expression:`document.querySelector('[data-detail-output-switch="预览结果"]').click();document.querySelector('[data-detail-apply-role="output"]').click()`},sessionId);
    console.log('PASS native output-source batch menu switches matching outputs and preserves its DOM on repeated applications');
    const fieldPoint=await send('Runtime.evaluate',{expression:`(()=>{const field=document.querySelector('[data-detail-field="detail-image-prompt"]');field.scrollIntoView({block:'center',inline:'nearest'});const r=field.getBoundingClientRect();window.nativeDetailVideo=document.querySelector('[data-detail-card="detail-video"] video');return{x:r.left+8,y:r.top+6};})()`,returnByValue:true},sessionId);
    await send('Input.dispatchMouseEvent',{type:'mouseMoved',...fieldPoint.result.value},sessionId);await new Promise(resolve=>setTimeout(resolve,180));
    for(const type of ['mousePressed','mouseReleased'])await send('Input.dispatchMouseEvent',{type,...fieldPoint.result.value,button:'left',clickCount:1},sessionId);
    const fieldHover=await send('Runtime.evaluate',{expression:`(()=>{const field=document.querySelector('[data-detail-field="detail-image-prompt"]'),tools=field.querySelector('.clab-detail-field-actions');return{opacity:getComputedStyle(tools).opacity,buttons:tools.querySelectorAll('button').length,selected:field.classList.contains('selected'),source:document.querySelector('[data-detail-input="detail-image"][value="detail-image-prompt"]').closest('.clab-detail-source-option').classList.contains('clab-detail-source-current')};})()`,returnByValue:true},sessionId);
    assert.deepEqual(fieldHover.result.value,{opacity:'1',buttons:2,selected:true,source:true},'native field selection did not reveal its controls and locate its source');
    if(process.env.CLAB_REVIEW_SCREENSHOT_PREFIX){const screenshot=await send('Page.captureScreenshot',{format:'png'},sessionId);fs.writeFileSync(`${process.env.CLAB_REVIEW_SCREENSHOT_PREFIX}-detail-field-actions.png`,Buffer.from(screenshot.data,'base64'));}
    for(const scope of ['field','name']){
        const button=await send('Runtime.evaluate',{expression:`(()=>{const b=document.querySelector('[data-detail-field="detail-image-prompt"] [data-detail-hide="${scope}"]'),r=b.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2};})()`,returnByValue:true},sessionId);
        await send('Input.dispatchMouseEvent',{type:'mouseMoved',...button.result.value},sessionId);
        for(const type of ['mousePressed','mouseReleased'])await send('Input.dispatchMouseEvent',{type,...button.result.value,button:'left',clickCount:1},sessionId);
        const status=await send('Runtime.evaluate',{expression:`({visible:document.querySelectorAll('[data-detail-field$="-prompt"]').length,video:document.querySelector('[data-detail-card="detail-video"] video')===window.nativeDetailVideo})`,returnByValue:true},sessionId);
        assert.deepEqual(status.result.value,{visible:scope==='field'?4:0,video:true},`native ${scope} field hide changed the wrong scope or rebuilt media`);
        await send('Runtime.evaluate',{expression:scope==='field'?`document.querySelector('[data-detail-input="detail-image"][value="detail-image-prompt"]').click()`:`document.querySelector('[data-detail-visibility="提示词"]').click()`},sessionId);
        await send('Input.dispatchMouseEvent',{type:'mouseMoved',...fieldPoint.result.value},sessionId);await new Promise(resolve=>setTimeout(resolve,150));
    }
    await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:1270,y:69},sessionId);await new Promise(resolve=>setTimeout(resolve,180));
    const fieldHidden=await send('Runtime.evaluate',{expression:`getComputedStyle(document.querySelector('[data-detail-field="detail-image-prompt"] .clab-detail-field-actions')).opacity`,returnByValue:true},sessionId);
    assert.equal(fieldHidden.result.value,'0','field actions remained visible after the pointer left');
    console.log('PASS native field hover reveals two hide icons, selection locates sources, local/shared clicks hide the correct fields and leaving the row hides its controls');
    const clickDetailElement=async(selector,modifiers=0)=>{
        const point=await send('Runtime.evaluate',{expression:`(()=>{const element=document.querySelector(${JSON.stringify(selector)});element.scrollIntoView({block:'nearest',inline:'nearest'});const r=element.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2};})()`,returnByValue:true},sessionId);
        await send('Input.dispatchMouseEvent',{type:'mouseMoved',...point.result.value},sessionId);await new Promise(resolve=>setTimeout(resolve,150));
        for(const type of ['mousePressed','mouseReleased'])await send('Input.dispatchMouseEvent',{type,...point.result.value,button:'left',clickCount:1,modifiers},sessionId);
    };
    const videoBatch=title=>`[data-detail-source="detail-video"] [data-detail-output-switch="${title}"]`;
    await clickDetailElement('[data-detail-cover="detail-video"][data-area-id="detail-video-out"]');
    await clickDetailElement(videoBatch('单独运行的视频'));await clickDetailElement('[data-detail-apply-role="output"]');
    const batchWithCover=await send('Runtime.evaluate',{expression:`(()=>{const row=id=>document.querySelector('[data-detail-source="'+id+'"]');return{alternate:['detail-image','detail-video','detail-audio'].every(id=>row(id).querySelector('[data-detail-output][value="'+(id==='detail-image'?'detail-alt-out':id+'-alt-out')+'"]').checked),actual:['detail-image','detail-video','detail-audio'].every(id=>document.querySelector('[data-detail-card="'+id+'"] [data-detail-pool="output"]').title==='生成记录 · 单独运行的视频'),cover:row('detail-video').querySelector('[data-detail-cover][data-area-id="detail-video-out"]').getAttribute('aria-pressed')};})()`,returnByValue:true},sessionId);
    assert.deepEqual(batchWithCover.result.value,{alternate:true,actual:true,cover:'true'},'native batch application did not switch source circles and actual previews with another cover selected');
    await clickDetailElement(videoBatch('预览结果'));await clickDetailElement('[data-detail-apply-role="output"]');
    await clickDetailElement(videoBatch('单独运行的视频'));await clickDetailElement('[data-detail-apply-role="cover"]');
    await clickDetailElement(videoBatch('单独运行的视频'));
    const cancelLabel=await send('Runtime.evaluate',{expression:`document.querySelector('[data-detail-apply-role="clear-cover"]').textContent`,returnByValue:true},sessionId);assert.equal(cancelLabel.result.value,'取消所有任务封面');
    await clickDetailElement('[data-detail-apply-role="clear-cover"]');
    const cancelledBatch=await send('Runtime.evaluate',{expression:`!document.querySelector('[data-detail-cover][aria-pressed="true"]')&&['detail-image','detail-video','detail-audio'].every(id=>document.querySelector('[data-detail-output="'+id+'"][value="'+id+'-out"]').checked)`,returnByValue:true},sessionId);assert.equal(cancelledBatch.result.value,true,'native cover cancellation did not clear the matching group or changed its preview sources');
    await clickDetailElement('[data-detail-cover="detail-video"][data-area-id="detail-video-out"]');
    await clickDetailElement('[data-detail-source="detail-video"] .clab-detail-output-row:has([value="detail-video-duplicate-out"]) [data-detail-output-switch]');await clickDetailElement('[data-detail-apply-role="output"]');
    const duplicateSelected=await send('Runtime.evaluate',{expression:`({checked:document.querySelector('[data-detail-output="detail-video"][value="detail-video-duplicate-out"]').checked,field:document.querySelector('[data-detail-field="detail-video-prompt"] .clab-detail-value').textContent.toLowerCase(),cover:document.querySelector('[data-detail-cover="detail-video"][data-area-id="detail-video-out"]').getAttribute('aria-pressed')})`,returnByValue:true},sessionId);assert.deepEqual(duplicateSelected.result.value,{checked:true,field:'duplicate result',cover:'true'},'native batch selection retained the previous output instead of the clicked same-name module');
    await clickDetailElement(videoBatch('预览结果'));await clickDetailElement('[data-detail-apply-role="output"]');
    await clickDetailElement('[data-detail-cover="detail-video"][data-area-id="detail-video-out"]');
    console.log('PASS native batch preview clicks update source circles with another cover selected, distinguish same-name output modules and cancel batch covers from the same menu');
    await clickDetailElement('[data-detail-card="detail-video"] [data-detail-pool="cover"]');
    const emptyPool=await send('Runtime.evaluate',{expression:`(()=>{const button=document.querySelector('[data-detail-card="detail-video"] [data-detail-pool="cover"]'),panel=document.querySelector('.clab-detail-pool-popover'),r=panel.getBoundingClientRect(),a=button.getBoundingClientRect();return{empty:!panel.querySelector('[data-detail-pool-record]'),near:Math.abs(r.top-a.bottom-6)<2||Math.abs(r.bottom-a.top+6)<2,small:r.width<=342&&r.height<=302,modal:panel.querySelector('[aria-modal=true]')!==null};})()`,returnByValue:true},sessionId);
    assert.deepEqual(emptyPool.result.value,{empty:true,near:true,small:true,modal:false},'unset cover pool was not an empty compact panel beside its entry');
    await clickDetailElement('[data-detail-card="detail-video"] header strong');
    const outsideClosed=await send('Runtime.evaluate',{expression:`!document.querySelector('.clab-detail-pool-popover')&&document.querySelector('.clab-preview-modal').classList.contains('visible')`,returnByValue:true},sessionId);assert.equal(outsideClosed.result.value,true,'outside click did not dismiss only the record pool');
    await clickDetailElement('[data-detail-cover="detail-video"][data-area-id="detail-video-out"]');
    await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:1270,y:69},sessionId);await new Promise(resolve=>setTimeout(resolve,150));
    const fixedCover=await send('Runtime.evaluate',{expression:`(()=>{const button=document.querySelector('[data-detail-cover="detail-video"][data-area-id="detail-video-out"]'),batch=button.closest('.clab-detail-source-option').querySelector('[data-detail-output-switch]');return{selected:button.getAttribute('aria-pressed'),opacity:getComputedStyle(button).opacity,output:document.querySelector('[data-detail-output="detail-video"][value="detail-video-out"]').checked,batchOpacity:getComputedStyle(batch).opacity,batchPointer:getComputedStyle(batch).pointerEvents,focused:document.activeElement===button};})()`,returnByValue:true},sessionId);
    assert.deepEqual(fixedCover.result.value,{selected:'true',opacity:'1',output:true,batchOpacity:'0',batchPointer:'none',focused:true},'native cover selection did not pin only its cover icon after the pointer left');
    for(const selected of ['true','false']){
        await clickDetailElement('[data-detail-cover="detail-video"][data-area-id="detail-video-alt-out"]');
        await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:1270,y:69},sessionId);await new Promise(resolve=>setTimeout(resolve,180));
        const visibility=await send('Runtime.evaluate',{expression:`(()=>{const cover=document.querySelector('[data-detail-cover="detail-video"][data-area-id="detail-video-alt-out"]'),batch=cover.closest('.clab-detail-source-option').querySelector('[data-detail-output-switch]');return{selected:cover.getAttribute('aria-pressed'),coverOpacity:getComputedStyle(cover).opacity,coverPointer:getComputedStyle(cover).pointerEvents,batchOpacity:getComputedStyle(batch).opacity,batchPointer:getComputedStyle(batch).pointerEvents,coverChecked:document.querySelector('[data-detail-output="detail-video"][value="detail-video-alt-out"]').checked,previewChecked:document.querySelector('[data-detail-output="detail-video"][value="detail-video-out"]').checked,focused:document.activeElement===cover};})()`,returnByValue:true},sessionId);
        assert.deepEqual(visibility.result.value,{selected,coverOpacity:selected==='true'?'1':'0',coverPointer:selected==='true'?'auto':'none',batchOpacity:'0',batchPointer:'none',coverChecked:selected==='true',previewChecked:true,focused:true},'mouse focus kept source icons visible after selecting or clearing the cover');
    }
    await send('Runtime.evaluate',{expression:`document.querySelector('[data-detail-output="detail-video"][value="detail-video-alt-out"]').focus({preventScroll:true})`},sessionId);
    for(const type of ['keyDown','keyUp'])await send('Input.dispatchKeyEvent',{type,key:'Tab',code:'Tab',windowsVirtualKeyCode:9},sessionId);
    await new Promise(resolve=>setTimeout(resolve,180));
    const keyboardIcon=await send('Runtime.evaluate',{expression:`(()=>{const cover=document.querySelector('[data-detail-cover="detail-video"][data-area-id="detail-video-alt-out"]'),batch=cover.closest('.clab-detail-source-option').querySelector('[data-detail-output-switch]');return{focused:document.activeElement===batch,visible:getComputedStyle(batch).opacity,coverOpacity:getComputedStyle(cover).opacity};})()`,returnByValue:true},sessionId);
    assert.deepEqual(keyboardIcon.result.value,{focused:true,visible:'1',coverOpacity:'0'},'keyboard focus did not reveal only its source control');
    console.log('PASS source icons hide after mouse selection and deselection without blurring, while keyboard focus reveals only its control');
    await clickDetailElement('[data-detail-cover="detail-video"][data-area-id="detail-video-out"]');
    await clickDetailElement('[data-detail-card="detail-video"] [data-detail-pool="cover"]');
    await clickDetailElement('.clab-detail-pool-sources summary');
    if(process.env.CLAB_REVIEW_SCREENSHOT_PREFIX){const screenshot=await send('Page.captureScreenshot',{format:'png'},sessionId);fs.writeFileSync(`${process.env.CLAB_REVIEW_SCREENSHOT_PREFIX}-detail-cover-pool.png`,Buffer.from(screenshot.data,'base64'));}
    await clickDetailElement('[data-detail-pool-source="detail-video-alt-out"]');
    await send('Runtime.evaluate',{expression:`window.nativeRecordPool=document.querySelector('.clab-detail-pool-popover');window.nativePoolEntry=document.querySelector('[data-detail-card="detail-video"] [data-detail-pool="cover"]')`},sessionId);
    for(const record of ['0','1']){
        await clickDetailElement(`[data-detail-pool-record="${record}"]`);
        const poolSelection=await send('Runtime.evaluate',{expression:`document.querySelector('.clab-detail-pool-popover')===window.nativeRecordPool&&document.querySelector('[data-detail-pool-record="${record}"]').getAttribute('aria-pressed')==='true'&&document.querySelector('[data-detail-card="detail-video"] [data-detail-pool="cover"]')===window.nativePoolEntry&&window.nativePoolEntry.querySelector('span').textContent==='${Number(record)+1}/2'`,returnByValue:true},sessionId);assert.equal(poolSelection.result.value,true,'native consecutive record selections closed the pool, replaced its entry or lost their selected mark');
    }
    await clickDetailElement('[data-detail-pool-close]');
    const poolClosed=await send('Runtime.evaluate',{expression:`!document.querySelector('.clab-detail-pool-popover')&&document.querySelector('.clab-preview-modal').classList.contains('visible')`,returnByValue:true},sessionId);
    assert.equal(poolClosed.result.value,true,'record pool close button did not dismiss only its panel');
    const bothSelected=await send('Runtime.evaluate',{expression:`document.querySelector('[data-detail-output="detail-video"][value="detail-video-out"]').checked&&document.querySelector('[data-detail-output="detail-video"][value="detail-video-alt-out"]').checked`,returnByValue:true},sessionId);assert.equal(bothSelected.result.value,true,'cover and preview source marks did not remain selected together');
    await clickDetailElement('[data-detail-output="detail-video"][value="detail-video-alt-out"]');
    const coverCleared=await send('Runtime.evaluate',{expression:`!document.querySelector('[data-detail-output="detail-video"][value="detail-video-alt-out"]').checked&&document.querySelector('[data-detail-output="detail-video"][value="detail-video-out"]').checked&&document.querySelector('[data-detail-cover="detail-video"][data-area-id="detail-video-alt-out"]').getAttribute('aria-pressed')==='false'`,returnByValue:true},sessionId);assert.equal(coverCleared.result.value,true,'native cover-row click changed the preview or retained the cover');
    await clickDetailElement('[data-detail-cover="detail-video"][data-area-id="detail-video-alt-out"]');
    const aligned=await send('Runtime.evaluate',{expression:`(()=>{const buttons=[...document.querySelectorAll('[data-detail-card="detail-video"] [data-detail-pool]')],a=buttons[0].getBoundingClientRect(),b=buttons[1].getBoundingClientRect();return buttons.every(button=>{const icon=button.querySelector('svg').getBoundingClientRect(),text=button.querySelector('span').getBoundingClientRect();return Math.abs((icon.top+icon.bottom-text.top-text.bottom)/2)<1;})&&b.left-a.right>=9;})()`,returnByValue:true},sessionId);assert.equal(aligned.result.value,true,'record-entry icons and labels were not centered or separated');
    await send('Runtime.evaluate',{expression:`(()=>{const center=document.querySelector('.clab-preview-modal-center'),button=document.querySelector('[data-detail-card="detail-text"] [data-detail-pool="cover"]');center.scrollTop+=button.getBoundingClientRect().bottom-center.getBoundingClientRect().bottom+12;})()`},sessionId);
    await clickDetailElement('[data-detail-card="detail-text"] [data-detail-pool="cover"]');
    const above=await send('Runtime.evaluate',{expression:`(()=>{const panel=document.querySelector('.clab-detail-pool-popover').getBoundingClientRect(),anchor=document.querySelector('[data-detail-card="detail-text"] [data-detail-pool="cover"]').getBoundingClientRect();return panel.bottom<=anchor.top-5&&panel.top>=0;})()`,returnByValue:true},sessionId);assert.equal(above.result.value,true,'record pool did not open above an entry near the lower edge');
    await clickDetailElement('[data-detail-pool-close]');
    console.log('PASS native record pools open compactly beside their entry, stay empty without a cover, close outside, flip at the lower edge and preserve independent source selections');
    const hoverPoint=await send('Runtime.evaluate',{expression:`(()=>{const host=document.querySelector('[data-detail-card="detail-video"] .clab-detail-media');host.scrollIntoView({block:'center'});window.nativeCoverPlayer=host.querySelector('.clab-preview-video video');const r=host.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2};})()`,returnByValue:true},sessionId);
    await send('Input.dispatchMouseEvent',{type:'mouseMoved',...hoverPoint.result.value},sessionId);await new Promise(resolve=>setTimeout(resolve,250));
    const hoverPlaying=await send('Runtime.evaluate',{expression:`window.nativeCoverPlayer.paused===false&&document.querySelector('[data-detail-card="detail-video"] .clab-detail-cover').hidden`,returnByValue:true},sessionId);assert.equal(hoverPlaying.result.value,true,'native hover did not reveal and play the selected content');
    await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:1270,y:69},sessionId);await new Promise(resolve=>setTimeout(resolve,150));
    const hoverStopped=await send('Runtime.evaluate',{expression:`window.nativeCoverPlayer.paused&&!document.querySelector('[data-detail-card="detail-video"] .clab-detail-cover').hidden&&document.querySelector('[data-detail-card="detail-video"] .clab-preview-video video')===window.nativeCoverPlayer&&!document.querySelector('.clab-detail-pool-popover')`,returnByValue:true},sessionId);assert.equal(hoverStopped.result.value,true,'native leave did not restore the cover and retain its content player');
    console.log('PASS native cover icons remain selected, record pools switch modules and records, and hover plays/pauses the same content player');
    if(process.env.CLAB_REVIEW_SCREENSHOT_PREFIX){
        const screenshot=await send('Page.captureScreenshot',{format:'png'},sessionId);fs.writeFileSync(`${process.env.CLAB_REVIEW_SCREENSHOT_PREFIX}-detail-media.png`,Buffer.from(screenshot.data,'base64'));
        const png=await send('Runtime.evaluate',{expression:`new Promise(resolve=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.readAsDataURL(window.detailPNG);})`,awaitPromise:true,returnByValue:true},sessionId);fs.writeFileSync(`${process.env.CLAB_REVIEW_SCREENSHOT_PREFIX}-detail-export.png`,Buffer.from(png.result.value.split(',')[1],'base64'));
    }
    await send('Runtime.evaluate',{expression:`document.querySelector('.clab-preview-modal-close').click();window.showWorkspaceModeDemo('cards');`},sessionId);
    for(const mode of ['table','cards','xy']){
        await clickDetailElement('[data-mode-toggle]');
        const visibleMenu=await send('Runtime.evaluate',{expression:`(()=>{const menu=document.querySelector('.clab-mode-menu'),button=menu.querySelector('[data-workspace-mode="${mode}"]'),r=button.getBoundingClientRect();return !menu.hidden&&button.contains(document.elementFromPoint(r.left+r.width/2,r.top+r.height/2));})()`,returnByValue:true},sessionId);
        assert.equal(visibleMenu.result.value,true,'workspace mode menu was clipped or covered after a native trigger click');
        await clickDetailElement(`button[data-workspace-mode="${mode}"]`);
        const switched=await send('Runtime.evaluate',{expression:`document.querySelector('#clab-panel').dataset.workspaceMode==='${mode}'&&document.querySelector('.clab-mode-menu').hidden&&document.querySelector('[data-mode-toggle]').getAttribute('aria-expanded')==='false'`,returnByValue:true},sessionId);
        assert.equal(switched.result.value,true,`native footer menu did not switch to ${mode}`);
    }
    console.log('PASS native footer mode menu opens above the workspace bar and switches between cards, table and XY');
    await send('Runtime.evaluate',{expression:`window.nativeRecordCount=window.workspaceModeDemo.view.xy.records.length;`},sessionId);
    await clickDetailElement('[data-xy-records]');await clickDetailElement('[data-xy-add-record]');
    const newRecord=await send('Runtime.evaluate',{expression:`window.workspaceModeDemo.view.xy.records.length===window.nativeRecordCount+1&&document.querySelector('.clab-module-binding-popover:popover-open')?.getAttribute('aria-label')==='附加记录参数'`,returnByValue:true},sessionId);assert.equal(newRecord.result.value,true,'focused add button deferred the new record row until a page reload');
    await clickDetailElement('.clab-module-binding-popover:popover-open .clab-xy-popup-close');
    await clickDetailElement('[data-xy-records]');await clickDetailElement('.clab-xy-record:last-of-type [data-xy-remove-record]');
    const removedRecord=await send('Runtime.evaluate',{expression:`window.workspaceModeDemo.view.xy.records.length===window.nativeRecordCount&&document.querySelectorAll('.clab-xy-record').length===window.nativeRecordCount`,returnByValue:true},sessionId);assert.equal(removedRecord.result.value,true,'focused remove button left a stale record row in the panel');await clickDetailElement('.clab-xy-popup-close');
    await send('Runtime.evaluate',{expression:`window.nativeAxisValues=[window.workspaceModeDemo.view.xy.x.values,window.workspaceModeDemo.view.xy.y.values];window.workspaceModeDemo.view.xy.x.values=[20,30];window.workspaceModeDemo.view.xy.y.values=[];document.dispatchEvent(new Event('clab_render_ui'));document.querySelector('[data-xy-reset]').click();`},sessionId);
    await clickDetailElement('.clab-xy-empty');
    const pickedPlaceholder=await send('Runtime.evaluate',{expression:`!!document.querySelector('.clab-xy-empty.is-selected')`,returnByValue:true},sessionId);assert.equal(pickedPlaceholder.result.value,true,'native placeholder click did not select the empty cell');
    await clickDetailElement('[data-xy-placeholder="1,0"]',2);
    const multiPlaceholder=await send('Runtime.evaluate',{expression:`document.querySelectorAll('.clab-xy-empty.is-selected').length`,returnByValue:true},sessionId);assert.equal(multiPlaceholder.result.value,2,'Ctrl selection did not include both unconfigured placeholders');
    const emptyBlank=await send('Runtime.evaluate',{expression:`(()=>{const r=document.querySelector('#clab-cards-container').getBoundingClientRect();return{x:r.right-18,y:r.top+20};})()`,returnByValue:true},sessionId);
    for(const type of ['mousePressed','mouseReleased'])await send('Input.dispatchMouseEvent',{type,...emptyBlank.result.value,button:'left',clickCount:1},sessionId);
    const clearedPlaceholder=await send('Runtime.evaluate',{expression:`!document.querySelector('.clab-xy-empty.is-selected')`,returnByValue:true},sessionId);assert.equal(clearedPlaceholder.result.value,true,'blank click did not deselect an unconfigured placeholder');
    await send('Runtime.evaluate',{expression:`[window.workspaceModeDemo.view.xy.x.values,window.workspaceModeDemo.view.xy.y.values]=window.nativeAxisValues;document.dispatchEvent(new Event('clab_render_ui'));`},sessionId);
    console.log('PASS native add/remove buttons immediately reconcile record rows, and blank canvas clicks deselect empty placeholders');
    await send('Runtime.evaluate',{expression:`document.querySelector('[data-xy-reset]').click();window.nativeXYExecute=window.CLab.executeTasks;window.CLab.executeTasks=tasks=>{window.nativeXYQueue=tasks;};`},sessionId);
    await clickDetailElement('#clab-panel .clab-card:not([hidden]) .clab-preview-bg');
    await clickDetailElement('[data-xy-run]');
    const selectedXY=await send('Runtime.evaluate',{expression:`window.nativeXYQueue?.length===1&&document.querySelector('[data-xy-run]').textContent.includes('运行选中')`,returnByValue:true},sessionId);assert.equal(selectedXY.result.value,true,'native cell selection did not scope the blue run button to one task');
    const blankXY=await send('Runtime.evaluate',{expression:`(()=>{const r=document.querySelector('#clab-cards-container').getBoundingClientRect();return{x:r.right-18,y:r.top+20};})()`,returnByValue:true},sessionId);
    for(const type of ['mousePressed','mouseReleased'])await send('Input.dispatchMouseEvent',{type,...blankXY.result.value,button:'left',clickCount:1},sessionId);
    await clickDetailElement('[data-xy-run]');
    const allXY=await send('Runtime.evaluate',{expression:`window.nativeXYQueue?.length===4&&document.querySelector('[data-xy-run]').textContent.includes('运行 · 4 项')`,returnByValue:true},sessionId);assert.equal(allXY.result.value,true,'native blank click did not clear selection and restore matrix-wide run');
    await send('Runtime.evaluate',{expression:`window.CLab.executeTasks=window.nativeXYExecute;`},sessionId);
    await clickDetailElement('.axis-x');
    const axisEditor=await send('Runtime.evaluate',{expression:`document.querySelector('.clab-xy-values:popover-open textarea').value`,returnByValue:true},sessionId);assert.equal(axisEditor.result.value,'20\n30','native axis click did not open its unified numeric batch editor');
    await clickDetailElement('.clab-module-binding-popover:popover-open .clab-xy-popup-close');
    await clickDetailElement('[data-xy-origin=top]');
    const topXY=await send('Runtime.evaluate',{expression:`window.workspaceModeDemo.view.xy.origin==='top'&&!document.querySelector('.axis-y').classList.contains('points-up')`,returnByValue:true},sessionId);assert.equal(topXY.result.value,true,'native orientation toggle did not reverse the Y axis');
    await clickDetailElement('[data-xy-origin=bottom]');
    console.log('PASS native XY cells run individually, blank clicks restore full-matrix run, axis lines edit values and toolbar direction capsule reverses Y');
    await send('Runtime.evaluate',{expression:`document.querySelector('[data-xy-reset]').click();window.nativeCanvasZoom=window.workspaceModeDemo.view.xy.zoom;window.nativeAxisConfig=JSON.stringify([window.workspaceModeDemo.view.xy.x,window.workspaceModeDemo.view.xy.y,window.workspaceModeDemo.view.xy.size]);window.nativeTaskValues=JSON.stringify(window.workspaceModeDemo.cards.map(card=>card.areas.filter(area=>area.type==='edit').map(area=>area.value)));`},sessionId);
    await clickDetailElement('[data-xy-bind="x"]');
    await clickDetailElement('.clab-module-binding-popover:popover-open button[data-xy-node="91"]');
    await clickDetailElement('.clab-module-binding-popover:popover-open [data-xy-parameter="91||cfg"]');
    const appendedParameter=await send('Runtime.evaluate',{expression:`window.workspaceModeDemo.view.xy.x.bindings`,returnByValue:true},sessionId);assert.deepEqual(appendedParameter.result.value,['91||steps','91||cfg'],'native axis panel did not append a second parameter');
    await clickDetailElement('.clab-module-binding-popover:popover-open [data-xy-parameter="91||cfg"]');
    const pickerSelection=await send('Runtime.evaluate',{expression:`window.workspaceModeDemo.view.xy.x.bindings`,returnByValue:true},sessionId);assert.deepEqual(pickerSelection.result.value,['91||steps'],'native axis binding panel did not add and remove a parameter independently');
    await clickDetailElement('.clab-module-binding-popover:popover-open .clab-xy-popup-close');
    console.log('PASS native axis summaries open two-column binding panels and toggle paired parameters while retaining the same matrix tasks');
    const ungeneratedCell=await send('Runtime.evaluate',{expression:`(()=>{const bg=document.querySelector('.clab-card:not([hidden]) .clab-preview-bg:has(img[src=""])'),r=bg.getBoundingClientRect();window.nativeEmptyCell=bg;return{x:Math.floor((r.left+r.right)/2),y:Math.floor((r.top+r.bottom)/2),zoom:window.workspaceModeDemo.view.xy.zoom};})()`,returnByValue:true},sessionId);assert.equal(ungeneratedCell.exceptionDetails,undefined,JSON.stringify(ungeneratedCell.exceptionDetails));
    await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:ungeneratedCell.result.value.x,y:ungeneratedCell.result.value.y},sessionId);
    await send('Input.dispatchMouseEvent',{type:'mouseWheel',x:ungeneratedCell.result.value.x,y:ungeneratedCell.result.value.y,deltaX:0,deltaY:-120},sessionId);await new Promise(resolve=>setTimeout(resolve,100));
    const emptyCellZoom=await send('Runtime.evaluate',{expression:`window.workspaceModeDemo.view.xy.zoom>${ungeneratedCell.result.value.zoom}&&window.nativeEmptyCell.isConnected&&window.nativeEmptyCell.querySelector('img').getAttribute('src')===''`,returnByValue:true},sessionId);assert.equal(emptyCellZoom.result.value,true,'wheel over an ungenerated output cell failed to zoom or rebuilt its preview');
    await send('Runtime.evaluate',{expression:`document.querySelector('[data-xy-reset]').click();`},sessionId);
    console.log('PASS native wheel zoom over an ungenerated grid cell preserves the existing preview');
    const canvasPoint=await send('Runtime.evaluate',{expression:`(()=>{const r=document.querySelector('#clab-cards-container').getBoundingClientRect();return{x:r.right-20,y:r.top+20};})()`,returnByValue:true},sessionId);
    await send('Input.dispatchMouseEvent',{type:'mouseWheel',...canvasPoint.result.value,deltaX:0,deltaY:-120},sessionId);await new Promise(resolve=>setTimeout(resolve,100));
    const zoomedCanvas=await send('Runtime.evaluate',{expression:`window.workspaceModeDemo.view.xy.zoom>window.nativeCanvasZoom&&JSON.stringify(window.workspaceModeDemo.cards.map(card=>card.areas.filter(area=>area.type==='edit').map(area=>area.value)))===window.nativeTaskValues`,returnByValue:true},sessionId);assert.equal(zoomedCanvas.result.value,true,'native canvas zoom changed generation values or failed to zoom');
    const panBefore=await send('Runtime.evaluate',{expression:`({x:window.workspaceModeDemo.view.xy.panX,y:window.workspaceModeDemo.view.xy.panY})`,returnByValue:true},sessionId);
    await send('Input.dispatchMouseEvent',{type:'mousePressed',...canvasPoint.result.value,button:'left',buttons:1,clickCount:1},sessionId);
    await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:canvasPoint.result.value.x-40,y:canvasPoint.result.value.y+30,button:'left',buttons:1},sessionId);
    await send('Input.dispatchMouseEvent',{type:'mouseReleased',x:canvasPoint.result.value.x-40,y:canvasPoint.result.value.y+30,button:'left',buttons:0,clickCount:1},sessionId);
    const panAfter=await send('Runtime.evaluate',{expression:`({x:window.workspaceModeDemo.view.xy.panX,y:window.workspaceModeDemo.view.xy.panY})`,returnByValue:true},sessionId);assert.ok(Math.abs(panAfter.result.value.x-panBefore.result.value.x+40)<1&&Math.abs(panAfter.result.value.y-panBefore.result.value.y-30)<1,'native background dragging failed to pan the XY canvas');
    await clickDetailElement('[data-mode-toggle]');await clickDetailElement('button[data-workspace-mode="cards"]');
    const cardsMode=await send('Runtime.evaluate',{expression:`document.querySelector('#clab-panel').dataset.workspaceMode==='cards'`,returnByValue:true},sessionId);assert.equal(cardsMode.result.value,true,'native footer menu did not leave XY mode');
    await clickDetailElement('[data-mode-toggle]');await clickDetailElement('button[data-workspace-mode="xy"]');
    const restoredAxes=await send('Runtime.evaluate',{expression:`document.querySelector('#clab-panel').dataset.workspaceMode==='xy'&&JSON.stringify([window.workspaceModeDemo.view.xy.x,window.workspaceModeDemo.view.xy.y,window.workspaceModeDemo.view.xy.size])===window.nativeAxisConfig&&window.workspaceModeDemo.view.xy.zoom>window.nativeCanvasZoom`,returnByValue:true},sessionId);assert.equal(restoredAxes.result.value,true,'native footer mode switching lost axis bindings or zoom');
    console.log('PASS native XY wheel zoom and background dragging preserve generation sizes, and footer mode switches restore the same axes and camera');
    const crispXY=await send('Runtime.evaluate',{expression:`(async()=>{const {projectXYCanvas}=await import('/extensions/clab/components/workspace_modes/xy_axes.js');const container=document.querySelector('#clab-cards-container'),xy=window.workspaceModeDemo.view.xy,old=xy.zoom,media=container.querySelector('.clab-card:not([hidden]) .clab-preview-bg');xy.zoom=3;projectXYCanvas(container,xy);const button=container.querySelector('[data-xy-bind=x]'),font=parseFloat(getComputedStyle(button).fontSize),tick=container.querySelector('.clab-axis-label'),unscaled=!button.closest('.clab-cards-wrapper')&&new DOMMatrixReadOnly(getComputedStyle(container.querySelector('.clab-xy-overlay')).transform).a===1&&new DOMMatrixReadOnly(getComputedStyle(container.querySelector('.clab-xy-overlay')).transform).d===1;xy.zoom=old;projectXYCanvas(container,xy);const matrix=new DOMMatrixReadOnly(getComputedStyle(tick).transform);return font===36&&unscaled&&media===container.querySelector('.clab-card:not([hidden]) .clab-preview-bg')&&matrix.a===1&&matrix.d===1;})()`,awaitPromise:true,returnByValue:true},sessionId);assert.equal(crispXY.result.value,true,'zoom magnified rasterized axis text instead of repainting display-size glyphs or rebuilt the media');
    console.log('PASS XY axes and binding summaries repaint at the zoomed font size outside the scaled media layer');
    await send('Runtime.evaluate',{expression:`document.querySelector('[data-xy-reset]').click();window.nativeXYIds=[...document.querySelectorAll('#clab-panel .clab-card:not([hidden])')].map(card=>card.dataset.cardId);window.nativeXYExecute=window.CLab.executeTasks;window.CLab.executeTasks=tasks=>{window.nativeXYQueue=tasks;};`},sessionId);
    const xyIds=await send('Runtime.evaluate',{expression:`window.nativeXYIds`,returnByValue:true},sessionId),xyCell=index=>`.clab-card[data-card-id="${xyIds.result.value[index]}"] .clab-preview-bg`;
    await clickDetailElement(xyCell(0));await clickDetailElement(xyCell(1),2);await clickDetailElement('[data-xy-run]');
    const ctrlXY=await send('Runtime.evaluate',{expression:`window.nativeXYQueue.map(task=>task.cardId)`,returnByValue:true},sessionId);assert.deepEqual(ctrlXY.result.value.sort(),xyIds.result.value.slice(0,2).sort(),'native Ctrl selection did not run exactly the selected two XY cells');
    await clickDetailElement(xyCell(0),2);await clickDetailElement('[data-xy-run]');
    const toggledXY=await send('Runtime.evaluate',{expression:`window.nativeXYQueue.map(task=>task.cardId)`,returnByValue:true},sessionId);assert.deepEqual(toggledXY.result.value,[xyIds.result.value[1]],'Ctrl click did not remove an already selected XY cell');
    await clickDetailElement(xyCell(0));await clickDetailElement(xyCell(3),2);await clickDetailElement(xyCell(0));await clickDetailElement(xyCell(1),8);await clickDetailElement('[data-xy-run]');
    const resetAnchorXY=await send('Runtime.evaluate',{expression:`window.nativeXYQueue.map(task=>task.cardId)`,returnByValue:true},sessionId);assert.deepEqual(resetAnchorXY.result.value.sort(),xyIds.result.value.slice(0,2).sort(),'clicking an already selected cell did not replace the old Ctrl-selection anchor before Shift selection');
    await clickDetailElement(xyCell(0));await clickDetailElement(xyCell(3),8);await clickDetailElement('[data-xy-run]');
    const shiftXY=await send('Runtime.evaluate',{expression:`window.nativeXYQueue.length`,returnByValue:true},sessionId);assert.equal(shiftXY.result.value,4,'Shift selection did not cover the XY coordinate rectangle');
    console.log('PASS native XY Ctrl toggles and Shift rectangular selection restrict execution to the chosen cells');
    await send('Runtime.evaluate',{expression:`(async()=>{window.CLab.executeTasks=window.nativeXYExecute;const {pushPreviewHistoryEntry,captureCardInputSnapshot}=await import('/extensions/clab/components/modules/media_types/media_utils.js');const {state}=await import('/extensions/clab/components/ui_state.js');window.nativeXYAreas=window.nativeXYIds.map(id=>{const card=state.cards.find(card=>card.id===id);return card.areas.find(area=>area.id===card.xyOutputId);});for(let i=0;i<2;i++){const card=state.cards.find(card=>card.id===window.nativeXYIds[i]),area=window.nativeXYAreas[i];for(let run=0;run<3;run++)pushPreviewHistoryEntry(area,'/view?filename=xy-history-'+i+'-'+run+'.png',{run:{id:'native-'+i+'-'+run,order:run+1,areaIds:[area.id]},inputSnapshot:captureCardInputSnapshot(card)});window._clabSurgicallyUpdateArea(area.id);}document.querySelector('[data-xy-reset]').click();})()`,awaitPromise:true},sessionId);
    await clickDetailElement(xyCell(0));await clickDetailElement(xyCell(1),2);
    for(const type of ['keyDown','keyUp'])await send('Input.dispatchKeyEvent',{type,key:'ArrowLeft',code:'ArrowLeft',windowsVirtualKeyCode:37},sessionId);
    const leftHistory=await send('Runtime.evaluate',{expression:`window.nativeXYAreas.slice(0,2).every(area=>area.historyIndex===area.history.length-2)&&window.nativeXYIds.slice(0,2).every((id,i)=>document.querySelector('.clab-card[data-card-id="'+id+'"]>.clab-xy-history').textContent===(window.nativeXYAreas[i].history.length-1)+'/'+window.nativeXYAreas[i].history.length)`,returnByValue:true},sessionId);assert.equal(leftHistory.result.value,true,'XY arrow keys or top-right history counters lost the selected records');
    for(const type of ['keyDown','keyUp'])await send('Input.dispatchKeyEvent',{type,key:'ArrowRight',code:'ArrowRight',windowsVirtualKeyCode:39},sessionId);
    await clickDetailElement('[data-mode-toggle]');await clickDetailElement('button[data-workspace-mode="cards"]');
    const cardHistory=await send('Runtime.evaluate',{expression:`window.nativeXYAreas.slice(0,2).every(area=>area.history.length>=3&&area.historyIndex===area.history.length-1&&document.querySelector('.clab-area[data-area-id="'+area.id+'"] .clab-output-history-position').textContent.trim()===(area.historyIndex+1)+' / '+area.history.length)&&!document.querySelector('.clab-xy-history')`,returnByValue:true},sessionId);assert.equal(cardHistory.result.value,true,'XY results or their selected history positions disappeared in card mode');
    await clickDetailElement('[data-mode-toggle]');await clickDetailElement('button[data-workspace-mode="xy"]');await send('Runtime.evaluate',{expression:`document.querySelector('[data-xy-reset]').click();`},sessionId);
    console.log('PASS XY history arrows update selected counters and all records remain in their original output modules after card-mode conversion');
    const setXYInput=async(selector,value)=>{
        await clickDetailElement(selector);for(const type of ['keyDown','keyUp'])await send('Input.dispatchKeyEvent',{type,key:'a',code:'KeyA',windowsVirtualKeyCode:65,modifiers:2},sessionId);
        await send('Input.insertText',{text:String(value)},sessionId);for(const type of ['keyDown','keyUp'])await send('Input.dispatchKeyEvent',{type,key:'Tab',code:'Tab',windowsVirtualKeyCode:9},sessionId);
    };
    await clickDetailElement('.axis-x');await setXYInput('[data-xy-axis-setting="gap"]',28);await setXYInput('[data-xy-axis-setting="margin"]',36);
    const xSettings=await send('Runtime.evaluate',{expression:`(()=>{const xy=window.workspaceModeDemo.view.xy,p=document.querySelector('.clab-xy-values:popover-open');return xy.x.gap===28&&xy.x.margin===36&&p.getAttribute('aria-label')==='X轴设置'&&!p.querySelector('[data-xy-save-values]')&&!document.querySelector('[data-xy-size]');})()`,returnByValue:true},sessionId);assert.equal(xSettings.result.value,true,'X settings did not automatically apply spacing/margins or retained removed dimension/apply controls');
    await setXYInput('[data-xy-values="x"]','invalid');
    const invalidValues=await send('Runtime.evaluate',{expression:`window.workspaceModeDemo.view.xy.x.values.join(',')==='20,30'&&document.querySelector('.clab-xy-popup-error').textContent.length>0`,returnByValue:true},sessionId);assert.equal(invalidValues.result.value,true,'invalid auto-applied values changed the matrix instead of keeping its previous valid values');
    await setXYInput('[data-xy-values="x"]','[20,30]');await clickDetailElement('.clab-xy-popup-close');await clickDetailElement('.axis-y');await setXYInput('[data-xy-axis-setting="gap"]',18);await setXYInput('[data-xy-axis-setting="margin"]',32);
    await clickDetailElement('[data-xy-choice="0:0"]');
    const choiceApplied=await send('Runtime.evaluate',{expression:`window.workspaceModeDemo.view.xy.y.values.length===1&&document.querySelectorAll('#clab-panel .clab-card:not([hidden])').length===2`,returnByValue:true},sessionId);assert.equal(choiceApplied.result.value,true,'axis option selection still required an Apply button');await clickDetailElement('[data-xy-choice="0:0"]');await clickDetailElement('.clab-xy-popup-close');
    const spacingXY=await send('Runtime.evaluate',{expression:`(()=>{const xy=window.workspaceModeDemo.view.xy,cells=[...document.querySelectorAll('#clab-panel .clab-card:not([hidden])')].map(card=>card.getBoundingClientRect()).sort((a,b)=>a.top-b.top||a.left-b.left),x=document.querySelector('.axis-x i').getBoundingClientRect(),y=document.querySelector('.axis-y i').getBoundingClientRect();return Math.abs((cells[1].left-cells[0].right)/xy.zoom-28)<2&&Math.abs((cells[2].top-cells[0].bottom)/xy.zoom-18)<2&&Math.abs((cells[0].left-y.left)/xy.zoom-36)<2&&Math.abs((x.top-cells[2].bottom)/xy.zoom-32)<2;})()`,returnByValue:true},sessionId);assert.equal(spacingXY.result.value,true,'X/Y spacing and margins were not applied to their corresponding axis directions');
    await clickDetailElement(xyCell(0));const hoverXY=await send('Runtime.evaluate',{expression:`(()=>{const card=document.querySelector('.clab-card[data-card-id="'+window.nativeXYIds[0]+'"]'),style=getComputedStyle(card,'::before');return style.backgroundImage==='none'&&style.borderTopColor==='rgb(33, 150, 243)'&&parseFloat(style.borderTopWidth)===1;})()`,returnByValue:true},sessionId);assert.equal(hoverXY.result.value,true,'selected XY cells did not retain their independent thin blue frame');
    console.log('PASS native XY settings auto-apply valid values, choices and directional spacing while hover lights the frame border');
    await send('Runtime.evaluate',{expression:`(async()=>{const {pushPreviewHistoryEntry}=await import('/extensions/clab/components/modules/media_types/media_utils.js');[[1,1],[4,3],[3,2],[21,9]].forEach(([w,h],i)=>{const area=window.nativeXYAreas[i];pushPreviewHistoryEntry(area,'/view?filename=xy-ratio-'+i+'.png&rw='+w*100+'&rh='+h*100);window._clabSurgicallyUpdateArea(area.id);const unrelated=document.createElement('img');unrelated.hidden=true;unrelated.dataset.xyRatioTrap='';unrelated.src='/view?filename=unrelated-input.png&rw=100&rh=500';document.querySelector('.clab-card[data-card-id="'+window.nativeXYIds[i]+'"]').prepend(unrelated);});})()`,awaitPromise:true},sessionId);
    await new Promise(resolve=>setTimeout(resolve,500));
    const medianXY=await send('Runtime.evaluate',{expression:`[...document.querySelectorAll('#clab-panel .clab-card:not([hidden]) .clab-preview-bg')].every(bg=>Math.abs(bg.offsetWidth/bg.offsetHeight-4/3)<.02)`,returnByValue:true},sessionId);assert.equal(medianXY.result.value,true,'mixed real image sizes did not adopt the middle actual media ratio');
    await send('Runtime.evaluate',{expression:`document.querySelectorAll('[data-xy-ratio-trap]').forEach(image=>image.remove());`},sessionId);
    console.log('PASS loaded mixed-ratio media adopt the median image ratio for every XY frame');
    const boundedPanels=await send('Runtime.evaluate',{expression:`(async()=>{const {projectXYCanvas}=await import('/extensions/clab/components/workspace_modes/xy_axes.js');const panel=document.querySelector('#clab-panel'),container=document.querySelector('#clab-cards-container'),xy=window.workspaceModeDemo.view.xy,original=xy.origin;let ok=true;for(const edge of ['left','right','top','bottom']){xy.origin=edge==='top'?'top':'bottom';document.dispatchEvent(new Event('clab_render_ui'));document.querySelector('[data-xy-reset]').click();const axis=document.querySelector(edge==='left'?'.axis-y':'.axis-x'),r=axis.getBoundingClientRect(),c=container.getBoundingClientRect(),x=edge==='left'?c.left+12:edge==='right'?c.right-12:c.left+c.width/2,y=edge==='top'?c.top+12:edge==='bottom'?c.bottom-12:c.top+c.height/2;xy.panX+=x-(r.left+r.right)/2;xy.panY+=y-(r.top+r.bottom)/2;projectXYCanvas(container,xy);axis.click();const popup=document.querySelector('.clab-xy-values:popover-open'),p=popup.getBoundingClientRect(),b=panel.getBoundingClientRect(),row=[...popup.querySelectorAll('.clab-xy-axis-spacing label')].map(label=>label.getBoundingClientRect());ok&&=p.left>=b.left+7&&p.right<=b.right-7&&p.top>=b.top+7&&p.bottom<=b.bottom-7&&Math.abs(row[0].top-row[1].top)<1&&Math.abs(p[edge]-(b[edge]+(['left','top'].includes(edge)?8:-8)))<2;popup.querySelector('.clab-xy-popup-close').click();}xy.origin=original;document.dispatchEvent(new Event('clab_render_ui'));document.querySelector('[data-xy-reset]').click();document.querySelector('.axis-x').click();window.nativeSettingsPanelStyle=panel.style.cssText;panel.style.width='560px';panel.style.height='400px';return ok;})()`,awaitPromise:true,returnByValue:true},sessionId);assert.equal(boundedPanels.result.value,true,'axis settings did not shift inward and align to each plugin edge');
    await new Promise(resolve=>setTimeout(resolve,180));
    const resizedSettings=await send('Runtime.evaluate',{expression:`(()=>{const p=document.querySelector('.clab-xy-values:popover-open').getBoundingClientRect(),panel=document.querySelector('#clab-panel'),b=panel.getBoundingClientRect(),ok=p.left>=b.left+7&&p.right<=b.right-7&&p.top>=b.top+7&&p.bottom<=b.bottom-7;document.querySelector('.clab-xy-popup-close').click();panel.style.cssText=window.nativeSettingsPanelStyle;document.querySelector('[data-xy-reset]').click();return ok;})()`,returnByValue:true},sessionId);assert.equal(resizedSettings.result.value,true,'open axis settings overflowed after the plugin panel was resized');
    console.log('PASS axis settings share one spacing row and stay inside all four plugin edges, including live panel resizing');
    await clickDetailElement(xyCell(0));
    const startedBorder=await send('Runtime.evaluate',{expression:`(async()=>{const {getActiveWorkspace}=await import('/extensions/clab/components/ui_state.js'),workspace=getActiveWorkspace(),id=window.nativeXYIds[0];window.nativeRunningImage=document.querySelector('.clab-card[data-card-id="'+id+'"] img');window._clabTaskMap['xy-border-test']={promptId:'xy-border-test',workspaceId:workspace.id,workspaceRef:new WeakRef(workspace),cardId:id,batch:{promptIds:['xy-border-test']},pendingResults:0,finished:false};await window.testApi.emit('execution_start',{prompt_id:'xy-border-test'});await window.testApi.emit('progress_state',{prompt_id:'xy-border-test',nodes:{a:{value:1,max:4}}});const card=document.querySelector('.clab-card[data-card-id="'+id+'"]'),ring=card.querySelector('.clab-xy-progress-ring');window.nativeProgressRing=ring;return {running:card.classList.contains('clab-xy-running'),count:document.querySelectorAll('.clab-xy-running').length,dash:ring?.querySelector('rect').getAttribute('stroke-dasharray'),colors:ring?.querySelectorAll('stop').length,base:getComputedStyle(card,'::before').display,stroke:ring?.querySelector('rect').getAttribute('stroke-width'),inset:ring?.querySelector('rect').getAttribute('x')};})()`,awaitPromise:true,returnByValue:true},sessionId);const borderState=startedBorder.result.value;assert.ok(borderState.running&&borderState.count===1&&borderState.dash==='25 100'&&borderState.colors===7&&borderState.base==='none'&&borderState.stroke==='2'&&borderState.inset==='1',`execution progress did not draw the matching rainbow frame: ${JSON.stringify(borderState)}`);
    await new Promise(resolve=>setTimeout(resolve,200));
    const movedBorder=await send('Runtime.evaluate',{expression:`(async()=>{const card=document.querySelector('.clab-card[data-card-id="'+window.nativeXYIds[0]+'"]'),ring=card.querySelector('.clab-xy-progress-ring');const stationary=ring.querySelector('rect').getAttribute('stroke-dasharray')==='25 100';await window.testApi.emit('progress',{prompt_id:'xy-border-test',value:3,max:4});return stationary&&ring===window.nativeProgressRing&&ring.querySelector('rect').getAttribute('stroke-dasharray')==='75 100'&&card.querySelector('img')===window.nativeRunningImage&&getComputedStyle(card.querySelector('.clab-xy-history')).backgroundColor==='rgba(0, 0, 0, 0)';})()`,awaitPromise:true,returnByValue:true},sessionId);assert.equal(movedBorder.result.value,true,'rainbow frame did not follow backend progress or replaced the existing media');
    await clickDetailElement('[data-mode-toggle]');await clickDetailElement('button[data-workspace-mode="cards"]');await clickDetailElement('[data-mode-toggle]');await clickDetailElement('button[data-workspace-mode="xy"]');
    const restoredBorder=await send('Runtime.evaluate',{expression:`document.querySelector('.clab-card[data-card-id="'+window.nativeXYIds[0]+'"]')?.classList.contains('clab-xy-running')`,returnByValue:true},sessionId);assert.equal(restoredBorder.result.value,true,'mode switching did not restore its running frame indicator');
    if(process.env.CLAB_WORKSPACE_SCREENSHOT_PREFIX){const screenshot=await send('Page.captureScreenshot',{format:'png'},sessionId);fs.writeFileSync(process.env.CLAB_WORKSPACE_SCREENSHOT_PREFIX+'-running.png',Buffer.from(screenshot.data,'base64'));}
    const stoppedBorder=await send('Runtime.evaluate',{expression:`(async()=>{await window.testApi.emit('execution_success',{prompt_id:'xy-border-test'});const card=document.querySelector('.clab-card[data-card-id="'+window.nativeXYIds[0]+'"]');return !card.classList.contains('clab-xy-running')&&!card.querySelector('.clab-xy-progress-ring')&&getComputedStyle(card,'::before').display!=='none'&&getComputedStyle(card,'::before').borderTopColor==='rgb(33, 150, 243)';})()`,awaitPromise:true,returnByValue:true},sessionId);assert.equal(stoppedBorder.result.value,true,'completed XY frames retained their running effect or lost their selection border');
    console.log('PASS rainbow border follows real 25/75 percent progress, stays still between updates and preserves selection and media');
    await send('Runtime.evaluate',{expression:`document.querySelector('[data-xy-reset]').click();`},sessionId);
    const yBlank=await send('Runtime.evaluate',{expression:`(()=>{const tick=document.querySelector('.clab-axis-label[data-xy-edit-values=y]'),r=tick.getBoundingClientRect(),points=[{x:r.left-30,y:(r.top+r.bottom)/2},{x:(r.left+r.right)/2,y:r.bottom+30}],hits=points.map(p=>!!document.elementFromPoint(p.x,p.y)?.closest('[data-xy-edit-values]'));return{points,hits};})()`,returnByValue:true},sessionId);assert.deepEqual(yBlank.result.value.hits,[false,false],'Y tick text retained a wide or full-row transparent click target');
    for(const p of yBlank.result.value.points)for(const type of ['mousePressed','mouseReleased'])await send('Input.dispatchMouseEvent',{type,...p,button:'left',clickCount:1},sessionId);
    const noYPopup=await send('Runtime.evaluate',{expression:`!document.querySelector('.clab-xy-values:popover-open')`,returnByValue:true},sessionId);assert.equal(noYPopup.result.value,true,'blank space near Y labels opened its axis settings');
    await clickDetailElement('.clab-axis-label[data-xy-edit-values=y]');
    const realYLabel=await send('Runtime.evaluate',{expression:`document.querySelector('.clab-xy-values:popover-open')?.getAttribute('aria-label')==='Y轴设置'`,returnByValue:true},sessionId);assert.equal(realYLabel.result.value,true,'narrowed Y tick labels no longer open their settings');await clickDetailElement('.clab-xy-popup-close');
    console.log('PASS Y label hit targets follow their text, leaving nearby blank canvas available for selection and panning');
    const handPoint=async selector=>(await send('Runtime.evaluate',{expression:`(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect(),xy=window.workspaceModeDemo.view.xy;return{x:(r.left+r.right)/2,y:(r.top+r.bottom)/2,panX:xy.panX,panY:xy.panY};})()`,returnByValue:true},sessionId)).result.value;
    for(const selector of ['.axis-y',xyCell(0)]){
        const p=await handPoint(selector);
        await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:p.x,y:p.y},sessionId);
        await send('Input.dispatchMouseEvent',{type:'mousePressed',x:p.x,y:p.y,button:'middle',buttons:4,clickCount:1},sessionId);
        await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:p.x+32,y:p.y+24,button:'middle',buttons:4},sessionId);
        await send('Input.dispatchMouseEvent',{type:'mouseReleased',x:p.x+32,y:p.y+24,button:'middle',buttons:0,clickCount:1},sessionId);
        const middlePan=await send('Runtime.evaluate',{expression:`(async()=>{const {appState}=await import('/extensions/clab/components/ui_state.js'),xy=window.workspaceModeDemo.view.xy;return Math.abs(xy.panX-${p.panX}-32)<1&&Math.abs(xy.panY-${p.panY}-24)<1&&!document.querySelector('.clab-xy-values:popover-open')&&!appState.isBindingMode&&document.querySelector('#clab-panel').classList.contains('visible');})()`,awaitPromise:true,returnByValue:true},sessionId);assert.equal(middlePan.result.value,true,`middle panning over ${selector} opened a menu/picker or failed to move the canvas`);
    }
    await send('Runtime.evaluate',{expression:`document.querySelector('[data-xy-reset]').click();`},sessionId);
    const p=await handPoint('.axis-x');await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:p.x,y:p.y},sessionId);await send('Input.dispatchKeyEvent',{type:'keyDown',key:' ',code:'Space',windowsVirtualKeyCode:32},sessionId);
    await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:p.x+30,y:p.y-20,buttons:0},sessionId);
    const spacePan=await send('Runtime.evaluate',{expression:`(()=>{const xy=window.workspaceModeDemo.view.xy;return Math.abs(xy.panX-${p.panX}-30)<1&&Math.abs(xy.panY-${p.panY}+20)<1&&document.querySelector('#clab-cards-container').classList.contains('clab-xy-grabbing')&&!document.querySelector('.clab-xy-values:popover-open');})()`,returnByValue:true},sessionId);assert.equal(spacePan.result.value,true,'holding Space over an axis did not follow mouse movement without a left button');
    await send('Input.dispatchKeyEvent',{type:'keyUp',key:' ',code:'Space',windowsVirtualKeyCode:32},sessionId);await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:p.x+40,y:p.y-15,buttons:0},sessionId);
    const releasedHand=await send('Runtime.evaluate',{expression:`(()=>{const xy=window.workspaceModeDemo.view.xy;return Math.abs(xy.panX-${p.panX}-30)<1&&Math.abs(xy.panY-${p.panY}+20)<1&&!document.querySelector('#clab-cards-container').classList.contains('clab-xy-grabbing');})()`,returnByValue:true},sessionId);assert.equal(releasedHand.result.value,true,'Space release did not stop the automatic hand tool');
    await clickDetailElement('.axis-x');await clickDetailElement('[data-xy-values=x]');const typing=await handPoint('.axis-y');await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:typing.x,y:typing.y},sessionId);
    for(const type of ['keyDown','keyUp'])await send('Input.dispatchKeyEvent',{type,key:' ',code:'Space',windowsVirtualKeyCode:32},sessionId);
    const editingHand=await send('Runtime.evaluate',{expression:`!document.querySelector('#clab-cards-container').classList.contains('clab-xy-grabbing')`,returnByValue:true},sessionId);assert.equal(editingHand.result.value,true,'typing Space in an axis value input entered the canvas hand tool');await clickDetailElement('.clab-xy-popup-close');
    const blurPoint=await handPoint('.axis-y');await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:blurPoint.x,y:blurPoint.y},sessionId);await send('Input.dispatchKeyEvent',{type:'keyDown',key:' ',code:'Space',windowsVirtualKeyCode:32},sessionId);
    const blurredHand=await send('Runtime.evaluate',{expression:`window.dispatchEvent(new Event('blur'));!document.querySelector('#clab-cards-container').classList.contains('clab-xy-grabbing')`,returnByValue:true},sessionId);assert.equal(blurredHand.result.value,true,'window blur left the automatic hand tool active');await send('Input.dispatchKeyEvent',{type:'keyUp',key:' ',code:'Space',windowsVirtualKeyCode:32},sessionId);
    await send('Runtime.evaluate',{expression:`document.querySelector('[data-xy-reset]').click();`},sessionId);
    console.log('PASS middle dragging pans over axes/media, Space follows the mouse without a button, and release/editing/blur stop the hand tool');
    await send('Runtime.evaluate',{expression:`window.nativeAxisWheelBlocker=event=>{if(event.target.closest('[data-xy-edit-values]'))event.stopImmediatePropagation();};document.addEventListener('wheel',window.nativeAxisWheelBlocker,true);`},sessionId);
    for(const selector of ['.axis-x','.axis-y','.clab-axis-label[data-xy-edit-values=x]','.clab-axis-label[data-xy-edit-values=y]','.clab-card:not([hidden]) .clab-preview-bg','.clab-card:not([hidden]) img']){
        await send('Runtime.evaluate',{expression:`document.querySelector('[data-xy-reset]').click();`},sessionId);
        const wheelPoint=await send('Runtime.evaluate',{expression:`(()=>{const element=document.querySelector(${JSON.stringify(selector)}),r=element.getBoundingClientRect(),c=document.querySelector('#clab-cards-container').getBoundingClientRect(),xy=window.workspaceModeDemo.view.xy,x=Math.floor((r.left+r.right)/2),y=Math.floor((r.top+r.bottom)/2);return{x,y,zoom:xy.zoom,worldX:(x-c.left-xy.panX)/xy.zoom,worldY:(y-c.top-xy.panY)/xy.zoom,hit:element.contains(document.elementFromPoint(x,y))};})()`,returnByValue:true},sessionId),p=wheelPoint.result.value;
        assert.equal(p.hit,true,`native wheel test missed ${selector}`);
        await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:p.x,y:p.y},sessionId);
        await send('Input.dispatchMouseEvent',{type:'mouseWheel',x:p.x,y:p.y,deltaX:0,deltaY:-120},sessionId);await new Promise(resolve=>setTimeout(resolve,100));
        const axisZoom=await send('Runtime.evaluate',{expression:`(()=>{const xy=window.workspaceModeDemo.view.xy,c=document.querySelector('#clab-cards-container').getBoundingClientRect();return xy.zoom>${p.zoom}&&Math.abs((${p.x}-c.left-xy.panX)/xy.zoom-${p.worldX})<.01&&Math.abs((${p.y}-c.top-xy.panY)/xy.zoom-${p.worldY})<.01&&!document.querySelector('.clab-xy-values:popover-open');})()`,returnByValue:true},sessionId);assert.equal(axisZoom.result.value,true,`wheel over ${selector} did not zoom around the pointer`);
    }
    await send('Runtime.evaluate',{expression:`document.removeEventListener('wheel',window.nativeAxisWheelBlocker,true);delete window.nativeAxisWheelBlocker;document.querySelector('[data-xy-reset]').click();`},sessionId);
    console.log('PASS native wheel zoom over axes, tick labels, grid cells and images stays centered on the pointer');
    const xyzChecks=await runXYZBrowserChecks(send,sessionId,process.env.CLAB_WORKSPACE_SCREENSHOT_PREFIX);
    const xyEditingChecks=await runXYEditingChecks(send,sessionId);
    const undoChecks=await runUndoBrowserChecks(send,sessionId);
    const xyPerformanceChecks=await runXYPerformanceChecks(send,sessionId);
    if(process.env.CLAB_WORKSPACE_SCREENSHOT_PREFIX)for(const mode of ['cards','table','xy']){
        await send('Runtime.evaluate',{expression:`window.showWorkspaceModeDemo('${mode}');if('${mode}'==='xy')document.querySelector('[data-xy-reset]').click();`},sessionId);await new Promise(resolve=>setTimeout(resolve,100));
        const screenshot=await send('Page.captureScreenshot',{format:'png'},sessionId);fs.writeFileSync(`${process.env.CLAB_WORKSPACE_SCREENSHOT_PREFIX}-${mode}.png`,Buffer.from(screenshot.data,'base64'));
    }
    await send('Runtime.evaluate',{expression:'window.releaseReviewAssets?.()'},sessionId);
    console.log(`${report.passed.length+31+xyzChecks+undoChecks+xyPerformanceChecks+xyEditingChecks} browser checks passed; ${requests.length} media requests`);
} finally {
    socket?.close();
    browser.kill();
    await new Promise(resolve => server.close(resolve));
    // Chrome may retain profile files briefly on Windows; leave the OS temp folder to its normal cleanup.
}
