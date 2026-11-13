import { captureModelPreview } from '../../modules/media_types/media_model.js';
import { escapeHtml as esc } from './shared.js';
import { renderPreviewPNG } from './preview_png.js';

const styleIds = ['clab-ui-styles','clab-media-styles','clab-workspace-mode-styles','clab-preview-review-styles','clab-preview-workspace-styles'];
const exportCSS = `
    .clab-export-content *{animation:none!important;transition:none!important}
    .clab-export-content .clab-review-grid-stage{overflow:hidden!important}
    .clab-export-content .clab-table-head,.clab-export-content .clab-table-corner,
    .clab-export-content .clab-card-title-bar,.clab-export-content .clab-result-table th{position:static!important}
    .clab-export-content .clab-cards-wrapper{padding-bottom:0!important}
    .clab-export-content .clab-review-grid .clab-table-column-top{visibility:visible!important;opacity:1!important}
    .clab-export-content [hidden]{display:none!important}
    .clab-export-content img{user-select:none}
`;

export function canvasBlob(canvas) {
    return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('PNG 生成失败')),'image/png'));
}

function blobDataURL(blob) {
    return new Promise((resolve,reject)=>{
        const reader=new FileReader();
        reader.onload=()=>resolve(reader.result);
        reader.onerror=()=>reject(new Error('无法读取媒体数据'));
        reader.readAsDataURL(blob);
    });
}

async function mediaDataURL(url, cache) {
    if(!url)return '';
    if(url.startsWith('data:'))return url;
    if(!cache.has(url))cache.set(url,fetch(url).then(response=>{
        if(!response.ok)throw new Error(`HTTP ${response.status}`);
        return response.blob();
    }).then(blobDataURL));
    return cache.get(url);
}

async function videoFrame(video,url) {
    const makeFrame = source=>{
        if(!source.videoWidth||!source.videoHeight)return '';
        const canvas=document.createElement('canvas');
        canvas.width=source.videoWidth;canvas.height=source.videoHeight;
        canvas.getContext('2d').drawImage(source,0,0);
        return canvas.toDataURL('image/png');
    };
    if(video.readyState>=2)return makeFrame(video);
    const reader=document.createElement('video');
    reader.muted=true;reader.preload='auto';
    try {
        await new Promise((resolve,reject)=>{
            const timer=setTimeout(()=>reject(new Error('视频帧读取超时')),10000);
            reader.onloadeddata=()=>{clearTimeout(timer);resolve();};
            reader.onerror=()=>{clearTimeout(timer);reject(new Error('视频帧不可用'));};
            reader.src=url;
        });
        return makeFrame(reader);
    } finally {reader.removeAttribute('src');reader.load();}
}

const mediaSelector='img,video,audio,canvas,.clab-glb-viewer';
function snapshotMedia(source) {
    return [...source.querySelectorAll(mediaSelector)].map(input=>({
        input,url:input.currentSrc||input.getAttribute('src'),hidden:!!input.closest('[hidden]'),
    }));
}

async function prepareMedia(source, clone, options) {
    const {cache, keepInteractive}=options;
    const copies=[...clone.querySelectorAll(mediaSelector)];
    const unavailable=node=>{
        const status=document.createElement('span');
        status.style.cssText='display:grid;place-items:center;width:100%;height:100%;color:#888;font:12px sans-serif';
        status.textContent='媒体预览不可用';node.replaceWith(status);
    };
    for(let index=0;index<source.length;index++){
        const {input,url,hidden}=source[index],output=copies[index];
        if(!output?.parentNode||input.closest('.clab-glb-viewer')!==null&&!input.matches('.clab-glb-viewer'))continue;
        if(hidden){output.removeAttribute('src');continue;}
        if(input instanceof HTMLImageElement){
            if(!url){output.remove();continue;}
            try {output.src=await mediaDataURL(url,cache);output.removeAttribute('loading');}
            catch {unavailable(output);}
            continue;
        }
        if(keepInteractive&&(input instanceof HTMLVideoElement||input instanceof HTMLAudioElement)){
            const asset=url&&await options.asset(url);
            if(asset){
                output.setAttribute('src',asset);output.setAttribute('controls','');output.removeAttribute('autoplay');
                output.style.display='block';output.style.maxWidth='100%';
            }else unavailable(output);
            continue;
        }
        if(input instanceof HTMLAudioElement){output.remove();continue;}
        let poster='';
        try {
            if(input instanceof HTMLVideoElement&&url)poster=await videoFrame(input,url);
            else if(input instanceof HTMLCanvasElement&&input.width&&input.height)poster=input.toDataURL('image/png');
            else if(input.matches('.clab-glb-viewer'))poster=await captureModelPreview(input,{width:320,height:200});
        }catch{}
        if(!poster){unavailable(output);continue;}
        const img=document.createElement('img');
        img.src=poster;img.className=output.className;img.style.cssText=output.style.cssText;
        if(input.matches('.clab-glb-viewer'))img.style.cssText='width:100%;height:100%;object-fit:contain';
        output.replaceWith(img);
    }
}

function cleanClone(source, clone) {
    const inputs=source.querySelectorAll('input,select,textarea');
    clone.querySelectorAll('input,select,textarea').forEach((field,index)=>{
        const original=inputs[index];
        if(field.matches('select'))[...field.options].forEach(option=>option.toggleAttribute('selected',option.index===original.selectedIndex));
        else if(field.matches('textarea'))field.textContent=original.value;
        else {field.setAttribute('value',original.value);field.toggleAttribute('checked',original.checked);}
        field.tabIndex=-1;
    });
    clone.querySelectorAll('.selected,.active,.is-selected').forEach(node=>node.classList.remove('selected','active','is-selected'));
    clone.querySelectorAll('.clab-table-column .clab-module-binding,[data-review-resize],[data-review-select-all],.clab-xy-progress-ring').forEach(node=>node.remove());
    for(const node of clone.querySelectorAll('*')){
        node.removeAttribute('id');node.removeAttribute('draggable');
        for(const name of node.getAttributeNames())if(name.startsWith('on'))node.removeAttribute(name);
    }
}

function staticGrid(source, clone, mode) {
    const original=source.querySelector('.clab-cards-wrapper'),world=clone.querySelector('.clab-cards-wrapper');
    if(mode==='table'){
        const columns=[...original.querySelector('.clab-table-head').children];
        const width=columns.reduce((sum,column)=>sum+column.offsetWidth,0);
        world.style.setProperty('--clab-table-columns',columns.map(column=>`${column.offsetWidth}px`).join(' '));
        return {width,height:original.querySelector('.clab-table-head').offsetHeight+
            [...original.querySelectorAll('[data-review-row]')].reduce((sum,row)=>sum+row.offsetHeight,0)};
    }
    world.style.transform='none';
    const overlay=clone.querySelector('.clab-xy-overlay');
    overlay.style.transform='none';overlay.style.setProperty('--xy-ui-scale',1);
    const positions=source.querySelectorAll('[data-xy-position]');
    clone.querySelectorAll('[data-xy-position]').forEach((node,index)=>{
        const {x,y,width,height}=positions[index].xyPosition;
        node.style.left=`${x}px`;node.style.top=`${y}px`;
        if(width!=null)node.style.width=`${width}px`;
        if(height!=null)node.style.height=`${height}px`;
    });
    return {width:original.offsetWidth,height:original.offsetHeight};
}

function matrixCrop(stage) {
    const rect=stage.getBoundingClientRect();
    const items=[...stage.querySelectorAll('.clab-card:not([hidden]),.clab-xy-empty,.clab-xy-axis,.clab-axis-label,.clab-xy-layer-title,.clab-xy-axis-binding,.clab-xy-output-binding,.clab-xy-z-binding,.clab-review-xy-records')];
    const bounds=items.filter(node=>getComputedStyle(node).visibility!=='hidden').map(node=>node.getBoundingClientRect());
    if(!bounds.length)return {x:0,y:0,width:rect.width,height:rect.height};
    const margin=18;
    const x=Math.floor(Math.min(...bounds.map(b=>b.left))-rect.left-margin),y=Math.floor(Math.min(...bounds.map(b=>b.top))-rect.top-margin);
    const right=Math.ceil(Math.max(...bounds.map(b=>b.right))-rect.left+margin),bottom=Math.ceil(Math.max(...bounds.map(b=>b.bottom))-rect.top+margin);
    return {x,y,width:right-x,height:bottom-y};
}

export async function capturePreviewLayout(source, options = {}) {
    if(!source)throw new Error('没有可导出的预览');
    const grouped=source.matches('.clab-review-multi-grid');
    const mode=grouped?undefined:source.closest('[data-workspace-mode]')?.dataset.workspaceMode;
    const media=snapshotMedia(source);
    const stage=source.cloneNode(true),outer=document.createElement('div'),viewport=document.createElement('div'),host=document.createElement('div');
    const styles=styleIds.map(id=>document.getElementById(id)?.textContent||'').join('\n')+exportCSS;
    outer.className='clab-export-content'+(mode?' clab-review-grid':'');
    if(mode)outer.dataset.workspaceMode=mode;
    outer.style.cssText='position:relative;overflow:hidden;background:#181818;color:#bbb;font:12px sans-serif;color-scheme:dark';
    viewport.style.cssText='position:absolute;left:0;top:0';
    viewport.append(stage);outer.append(viewport);
    host.style.cssText='position:fixed;left:-100000px;top:0;pointer-events:none';
    host.append(outer);
    let size=mode?staticGrid(source,stage,mode):{width:source.scrollWidth,height:source.scrollHeight};
    if(grouped){
        const scene=source.firstElementChild;size={width:scene.scrollWidth,height:scene.scrollHeight};stage.firstElementChild.style.transform='none';
        if(scene.matches('.clab-review-matrix-scene')){
            const originals=[...scene.children],copies=[...stage.firstElementChild.children];let width=48,height=0;
            for(const [index,group]of originals.entries()){
                const input=group.querySelector('.clab-review-grid-stage'),copy=copies[index],output=copy.querySelector('.clab-review-grid-stage'),wrapper=input.querySelector('.clab-cards-wrapper');
                if(!input.querySelector('.clab-xy-overlay'))continue;
                staticGrid(input,output,'xy');
                const minX=Number(wrapper.dataset.xyMinX)||0,minY=Number(wrapper.dataset.xyMinY)||0;
                const w=wrapper.offsetWidth-minX+40,h=wrapper.offsetHeight-minY+40;
                const translate=`translate(${20-minX}px,${20-minY}px)`;
                output.querySelector('.clab-cards-wrapper').style.transform=translate;output.querySelector('.clab-xy-overlay').style.transform=translate;
                copy.lastElementChild.style.width=`${w}px`;copy.lastElementChild.style.height=`${h}px`;
                copy.style.padding='16px';
                Object.assign(copy.firstElementChild.style,{fontSize:'18px',minHeight:'36px',marginBottom:'24px',gap:'14px',width:`${w}px`});copy.firstElementChild.style.setProperty('--xy-ui-scale',1);
                width+=w+32;height=Math.max(height,h+92);
            }
            Object.assign(stage.firstElementChild.style,{gap:'64px',padding:'24px'});
            size={width:width+Math.max(0,originals.length-1)*64,height:height+48};
        }
    }
    stage.style.width=`${size.width}px`;stage.style.height=`${size.height}px`;
    const background=getComputedStyle(source);
    if(mode==='xy')outer.style.background=background.background;
    cleanClone(source,stage);
    await document.fonts.ready;
    document.body.append(host);
    try {
        if(mode==='xy'){
            size=matrixCrop(stage);
            viewport.style.left=`${-size.x}px`;viewport.style.top=`${-size.y}px`;
            stage.style.overflow='visible';
            stage.style.setProperty('overflow','visible','important');
            stage.style.background='none';
        }
        const width=Math.ceil(size.width),height=Math.ceil(size.height);
        outer.style.width=`${width}px`;outer.style.height=`${height}px`;
        await prepareMedia(media,stage,{cache:new Map(),...options});
        if(options.keepInteractive)stage.querySelectorAll('.clab-video-controls,.clab-audio-wave,.clab-audio-progress-container,.clab-audio-controls-row').forEach(node=>node.remove());
        return {outer,styles,width,height};
    }finally{host.remove();}
}

export async function renderLayoutPNG(layout, scale) {
    const {outer,styles,width,height}=layout;
    const style=document.createElement('style');style.textContent=styles;
    outer.prepend(style);
    return renderPreviewPNG(new XMLSerializer().serializeToString(outer),width,height,scale);
}

export async function exportPreviewLayoutHTML(source, title) {
    const {zipSync,strToU8}=await import('../../../vendor/zip.js');
    const files={},media=new Map();
    const asset=async url=>{
        if(!media.has(url)){
            const response=await fetch(url);
            if(!response.ok)throw new Error(`媒体读取失败（HTTP ${response.status}）`);
            const parsed=new URL(url,window.location.href),name=parsed.searchParams.get('filename')||parsed.pathname;
            const path=`media/${media.size+1}.${name.match(/\.([a-z\d]{1,10})$/i)?.[1]||'bin'}`;
            files[path]=new Uint8Array(await response.arrayBuffer());media.set(url,path);
        }
        return media.get(url);
    };
    const {outer,styles}=await capturePreviewLayout(source,{keepInteractive:true,asset});
    files['index.html']=strToU8(`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(title)}</title><style>${styles}</style><body style="margin:12px;background:#181818">${outer.outerHTML}</body></html>`);
    return new Blob([zipSync(files,{level:0})],{type:'application/zip'});
}
