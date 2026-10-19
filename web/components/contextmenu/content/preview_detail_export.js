import { DETAIL_CSS, detailFields, detailHistoryKey, detailCardWidth, detailExportRange } from './preview_detail_model.js';
import { captureModelPreview } from '../../modules/media_types/media_model.js';
import { getAudioWavePeaks, drawAudioWave } from '../../modules/media_types/audio_waveform.js';
import { getModelResourceURL, modelResourcePaths } from '../../modules/media_types/model_loader.js';

const blobDataURL = blob => new Promise((resolve,reject) => { const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(new Error('读取媒体数据失败'));reader.readAsDataURL(blob); });
const extensionOf = url => { const value=new URL(url,window.location.href);return ((value.searchParams.get('filename')||value.pathname).match(/\.([a-z0-9]+)$/i)?.[1]||'bin').toLowerCase(); };

async function imageData(url) {
    const response=await fetch(url);if(!response.ok)throw new Error(`媒体读取失败（HTTP ${response.status}）`);
    return blobDataURL(await response.blob());
}

async function freezeMedia(source, target, width, fixedHeight) {
    const video=source.querySelector('video'), audio=source.querySelector('audio'), model=source.querySelector('.clab-glb-viewer');
    const still=source.querySelector(':scope>img');
    if(!still||fixedHeight!==undefined)target.style.height=`${fixedHeight??source.getBoundingClientRect().height}px`;
    let poster;
    if (model) poster=await captureModelPreview(model,{width,height:Math.round(width*.625)});
    else if (video?.readyState>=2) { const canvas=document.createElement('canvas');canvas.width=video.videoWidth;canvas.height=video.videoHeight;canvas.getContext('2d').drawImage(video,0,0);poster=canvas.toDataURL('image/png'); }
    else if (audio) {
        const canvas=document.createElement('canvas');canvas.style.cssText=`position:fixed;left:-100000px;top:0;width:${width}px;height:${Math.round(width*.625)}px`;document.body.append(canvas);
        try{drawAudioWave(canvas,await getAudioWavePeaks(audio.getAttribute('src')),1);poster=canvas.toDataURL('image/png');}finally{canvas.remove();}
    } else if (source.querySelector('img')) poster=await imageData(source.querySelector('img').currentSrc || source.querySelector('img').src);
    else if(source.classList.contains('clab-detail-cover')&&source.querySelector('canvas'))poster=source.querySelector('canvas').toDataURL('image/png');
    if (poster) {
        const image=document.createElement('img');image.src=poster;image.style.cssText='display:block;width:100%;height:100%;object-fit:contain';target.replaceChildren(image);
        await image.decode();if(still&&fixedHeight===undefined)target.style.setProperty('--detail-media-ratio',image.naturalWidth/image.naturalHeight);
    } else if (source.querySelector('.clab-text-body-content')) {
        const original=source.querySelector('.clab-text-body-content'), clone=original.cloneNode(true);
        const originals=[original,...original.querySelectorAll('*')],copies=[clone,...clone.querySelectorAll('*')];
        originals.forEach((element,i)=>{const css=getComputedStyle(element);for(const property of ['color','font-family','font-size','font-weight','font-style','line-height','white-space','text-decoration','background-color','padding','margin','display'])copies[i].style.setProperty(property,css.getPropertyValue(property));});
        clone.style.padding='10px';target.replaceChildren(clone);
    } else if(source.classList.contains('clab-detail-cover')){target.replaceChildren(source.cloneNode(true));target.firstElementChild.hidden=false;target.firstElementChild.style.cssText='position:absolute;inset:0;overflow:hidden;pointer-events:none;background:#141414;color:#bbb;font:12px/1.6 monospace';}
    else target.innerHTML='<div class="clab-detail-empty">当前媒体预览不可用</div>';
}

export async function exportDetailPNG(board, config) {
    if(!board)throw new Error('没有可导出的明细表');
    await document.fonts.ready;
    const originalCards=[...board.querySelectorAll('.clab-detail-card')];if(!originalCards.length)throw new Error('没有可导出的卡片');
    const {start,end}=detailExportRange(config,originalCards.length);if(start>end)throw new Error('起始编号不能大于结束编号');
    const clone=board.cloneNode(false),sourceCards=originalCards.slice(start-1,end);
    for(const source of sourceCards){
        const target=source.cloneNode(true);clone.append(target);
        const host=source.querySelector('.clab-detail-media'),cover=host.querySelector(':scope>.clab-detail-cover');
        if(cover)await cover._detailPrepareCover();
        await freezeMedia(cover||host,target.querySelector('.clab-detail-media'),detailCardWidth(config)-2,cover?host.getBoundingClientRect().height:undefined);
    }
    clone.querySelectorAll('.selected,.active').forEach(element=>element.classList.remove('selected','active'));
    clone.querySelectorAll('.clab-detail-field-actions').forEach(element=>element.remove());
    clone.querySelectorAll('.clab-detail-history [data-detail-step]').forEach(element=>{element.style.visibility='hidden';});
    const host=document.createElement('div'),style=document.createElement('style');style.textContent=DETAIL_CSS;
    host.style.cssText='position:fixed;left:-100000px;top:0;pointer-events:none';host.append(style,clone);document.body.append(host);
    try {
        const width=Math.ceil(config.rowWidth+32),scale=Number(config.exportScale)||3;
        if(scale<1||scale>10)throw new Error('放大倍数须在 1～10 之间');
        clone.style.setProperty('--detail-columns',config.columns);clone.style.setProperty('--detail-row-width',`${config.rowWidth}px`);clone.style.width=`${width}px`;
        await Promise.all([...clone.querySelectorAll('img')].map(image=>image.decode()));
        const height=Math.ceil(clone.getBoundingClientRect().height),pixelWidth=Math.ceil(width*scale),pixelHeight=Math.ceil(height*scale);
        if(pixelWidth>32767||pixelHeight>32767||pixelWidth*pixelHeight>67108864)throw new Error('整图尺寸过大，请降低放大倍数或缩小导出范围');
        const wrapper=document.createElement('div');wrapper.style.cssText=`width:${width}px;height:${height}px;background:#171717`;wrapper.append(style.cloneNode(true),clone.cloneNode(true));
        const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><foreignObject width="100%" height="100%">${new XMLSerializer().serializeToString(wrapper)}</foreignObject></svg>`;
        const image=new Image();image.src=`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;await image.decode();
        const canvas=document.createElement('canvas');
        try {
            canvas.width=pixelWidth;canvas.height=pixelHeight;canvas.getContext('2d').drawImage(image,0,0,pixelWidth,pixelHeight);
            const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw new Error('PNG 生成失败');
            return {name:start===1&&end===originalCards.length?'明细表.png':`明细表-${start}-${end}.png`,blob};
        } finally {canvas.width=canvas.height=0;}
    } finally {host.remove();}
}

function assetKey(value) {
    const url=new URL(value,window.location.href);
    if(url.pathname.endsWith('/view')) {if(!url.searchParams.has('type'))url.searchParams.set('type','output');if(!url.searchParams.has('subfolder'))url.searchParams.set('subfolder','');}
    url.searchParams.sort();return `${url.pathname}${url.search}`;
}

export async function exportDetailHTML(model,config) {
    const {zipSync,strToU8}=await import('../../../vendor/zip.js');
    const assets=new Map(),files={},warnings=[];
    async function collect(url, modelResource=false, optional=false) {
        const key=assetKey(url);if(assets.has(key))return key;
        const response=await fetch(url);
        if(!response.ok){if(optional){warnings.push(`配套资源不可用：${url}`);return key;}throw new Error(`媒体读取失败（HTTP ${response.status}）`);}
        const blob=await response.blob(),data=await blobDataURL(blob),name=new URL(url,window.location.href).searchParams.get('filename') || url.split('/').pop();
        const asset={name,data};assets.set(key,asset);
        if(modelResource) {
            const bytes=await blob.arrayBuffer();
            for(const resource of modelResourcePaths(bytes,extensionOf(url))) {
                try {await collect(getModelResourceURL(url,resource),true,true);}catch(error){warnings.push(`配套资源未打包：${resource}（${error.message}）`);}
            }
        }
        return key;
    }
    const cards=[];
    for(const item of model) {
        const selected=config.includeHistory?item.records:item.record?[item.record]:[],records=[];
        for(const record of selected) {
            const key=await collect(record.url,record.type==='model');
            const text=record.type==='text'?(record.text||await (await fetch(record.url)).text()):record.text;
            records.push({key:record.key,url:key,name:record.name,type:record.type,text,fields:detailFields(item.card,record,config)});
        }
        let cover;
        if(item.customCover){
            const record=item.coverRecord,key=await collect(record.url,record.type==='model');
            cover={key:record.key,url:key,name:record.name,type:record.type,text:record.type==='text'?(record.text||await (await fetch(record.url)).text()):record.text};
        }
        cards.push({id:item.id,title:item.title,index:Math.max(0,selected.findIndex(record=>record.key===item.record?.key)),records,cover,fields:item.fields,current:item.current,textOptions:config.media.get(detailHistoryKey(item.id,item.area?.id))});
    }
    let i=0;const assetScripts=[];
    for(const [key,asset] of assets){const path=`assets/media-${++i}.js`;files[path]=strToU8(`window.clabDetailAssets[${JSON.stringify(key).replace(/</g,'\\u003c')}]=${JSON.stringify(asset).replace(/</g,'\\u003c')};`);assetScripts.push(path);}
    const bundle=new URL('../../../vendor/detail-viewer.js',import.meta.url);
    const runtime=await fetch(bundle);if(!runtime.ok)throw new Error('离线查看器文件缺失');files['assets/viewer.js']=new Uint8Array(await runtime.arrayBuffer());
    for(const license of ['three-LICENSE.txt','fflate-LICENSE.txt']) {const response=await fetch(new URL(`../../../vendor/${license}`,import.meta.url));if(!response.ok)throw new Error('离线查看器许可文件缺失');files[`assets/${license}`]=new Uint8Array(await response.arrayBuffer());}
    const payload=JSON.stringify({columns:config.columns,rowWidth:config.rowWidth,cards,warnings}).replace(/</g,'\\u003c');
    files['index.html']=strToU8(`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>明细表</title><style>body{margin:0;background:#171717;color:#ddd;font-family:Arial,'Microsoft YaHei',sans-serif}header.clab-offline-head{display:flex;align-items:center;gap:12px;padding:12px 16px;font-size:12px;border-bottom:1px solid #333}header.clab-offline-head input{width:70px}header.clab-offline-head label{display:flex;align-items:center;gap:6px}.clab-offline-scroll{overflow:auto}.clab-offline-notice:empty{display:none}.clab-offline-notice{color:#c8b283;font:12px/1.6 sans-serif;padding:0 16px;white-space:pre-wrap}</style><header class="clab-offline-head"><strong>明细表</strong><label>整行宽度<input data-offline-rowWidth type="range" min="480" max="2560" step="10" value="${config.rowWidth}"><output data-offline-rowWidth-value>${config.rowWidth}px</output></label><label>卡片列数<input data-offline-columns type="range" min="1" max="8" value="${config.columns}"><output data-offline-columns-value>${config.columns}</output></label><span>点击卡片后，用 ← / → 切换历史；空格播放视频</span></header><p class="clab-offline-notice"></p><main class="clab-preview-modal visible clab-offline-scroll" data-review-mode="detail"><div class="clab-detail-board"></div></main><script id="clab-detail-data" type="application/json">${payload}</script><script>window.clabDetailAssets={};</script>${assetScripts.map(path=>`<script src="${path}"></script>`).join('')}<script src="assets/viewer.js"></script></html>`);
    return new Blob([zipSync(files,{level:0})],{type:'application/zip'});
}
