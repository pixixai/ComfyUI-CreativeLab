import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const requests = [];
const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    res.setHeader('Content-Type', 'text/javascript; charset=utf-8');
    if (url.pathname === '/') {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.end('<!doctype html><meta charset="utf-8"><script type="module" src="/checks.js"></script>');
    } else if (url.pathname === '/checks.js') {
        res.end(fs.readFileSync(path.join(repo, 'tests/fixtures/performance.js')));
    } else if (url.pathname === '/scripts/app.js') {
        res.end('export const app = window.testApp;');
    } else if (url.pathname === '/scripts/api.js') {
        res.end('export const api = window.testApi;');
    } else if (url.pathname === '/scripts/ui/components/buttonGroup.js') {
        res.end('export class ComfyButtonGroup { constructor(button) { this.element = button; } }');
    } else if (url.pathname === '/view') {
        requests.push(url.searchParams.get('filename'));
        res.setHeader('Content-Type', 'image/svg+xml');
        const [width, height] = url.searchParams.get('type') === 'input' ? [150, 300] : [320, 180];
        res.end(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="#456"/></svg>`);
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
    socket.onmessage = ({ data }) => {
        const response = JSON.parse(data);
        if (!response.id) return;
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
        expression: 'new Promise((resolve,reject)=>{const timer=setInterval(()=>{if(window.testResult){clearInterval(timer);resolve(window.testResult);}},50);setTimeout(()=>{clearInterval(timer);reject(new Error("browser checks timed out"));},30000);})',
        awaitPromise: true, returnByValue: true,
    }, sessionId);
    assert.equal(result.exceptionDetails, undefined, JSON.stringify(result.exceptionDetails));
    const report = result.result.value;
    for (const name of report.passed) console.log(`PASS ${name}`);
    assert.equal(report.error, undefined, report.error);
    assert.deepEqual(report.errors, []);
    console.log(`${report.passed.length} browser checks passed; ${requests.length} image requests`);
} finally {
    socket?.close();
    browser.kill();
    await new Promise(resolve => server.close(resolve));
    // Chrome may retain profile files briefly on Windows; leave the OS temp folder to its normal cleanup.
}
