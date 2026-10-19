import { injectMediaCSS } from '../../modules/module_media.js';
import { DETAIL_CSS, detailFieldsHTML } from './preview_detail_model.js';
import { detailMediaHTML, attachDetailMedia } from './preview_detail_media.js';
import { attachDetailCover } from './preview_detail_cover.js';
import { escapeHtml as esc } from './shared.js';

const data=JSON.parse(document.getElementById('clab-detail-data').textContent),assets=window.clabDetailAssets;
const root=document.querySelector('main'),board=root.querySelector('.clab-detail-board'),blobs=new Map(),reverse=new Map(),views=new Map();
let active=data.cards[0]?.id;
injectMediaCSS();
const style=document.createElement('style');style.textContent=DETAIL_CSS;document.head.append(style);
function canonical(value) {
    const url=new URL(reverse.get(value)||value,'https://offline.invalid');
    if(url.pathname.endsWith('/view')){if(!url.searchParams.has('type'))url.searchParams.set('type','output');if(!url.searchParams.has('subfolder'))url.searchParams.set('subfolder','');}
    url.searchParams.sort();return `${url.pathname}${url.search}`;
}
function assetURL(key) {
    if(blobs.has(key))return blobs.get(key);
    const asset=assets[key];if(!asset)throw new Error(`缺少配套资源：${key}`);
    const [header,encoded]=asset.data.split(','),bytes=Uint8Array.from(atob(encoded),character=>character.charCodeAt(0));
    const url=URL.createObjectURL(new Blob([bytes],{type:header.match(/^data:([^;]+)/)?.[1]||'application/octet-stream'}));
    blobs.set(key,url);reverse.set(url,key);return url;
}
const resources={
    read(value,options) { const url=/^(data:|blob:)/.test(value)?value:assetURL(canonical(value));return fetch(url,options); },
    resolve(base,resource) {
        if(/^(data:|blob:)/.test(resource))return resource;
        const model=new URL(reverse.get(base)||base,'https://offline.invalid'),path=resource.replace(/\\/g,'/');
        let key;
        if(model.pathname.endsWith('/view')){
            const resolved=new URL(path,`https://offline.invalid/${model.searchParams.get('subfolder')||''}/`),parts=decodeURIComponent(resolved.pathname).slice(1).split('/'),filename=parts.pop();
            key=canonical(`/view?${new URLSearchParams({filename,type:model.searchParams.get('type')||'output',subfolder:parts.join('/')})}`);
        } else key=canonical(new URL(path,model).href);
        return assetURL(key);
    },
};
function activate(id){active=id;for(const [key,view] of views)view.element.classList.toggle('active',key===id);}
function render(item){
    let view=views.get(item.id);
    if(!view){const element=document.createElement('article');element.className='clab-detail-card';element.dataset.detailCard=item.id;element.tabIndex=0;element.innerHTML='<header class="clab-detail-title"></header><div class="clab-detail-media"></div><div class="clab-detail-data"></div><div class="clab-detail-note"></div>';board.append(element);view={element,cleanup:null};views.set(item.id,view);}
    const record=item.records[item.index],element=view.element;
    element.querySelector('header').innerHTML=`<strong>${esc(item.title)}</strong><span class="clab-detail-history"><button data-step="-1" ${!item.records.length||item.index<=0?'disabled':''}>‹</button><span>${record?`${item.index+1} / ${item.records.length}`:'—'}</span><button data-step="1" ${!item.records.length||item.index>=item.records.length-1?'disabled':''}>›</button></span>`;
    view.cover?.release();view.cleanup?.();
    const host=element.querySelector('.clab-detail-media'),local=record?{...record,url:record.type==='model'?`https://offline.invalid${record.url}`:assetURL(record.url)}:null;
    item.textOptions||={};host.innerHTML=detailMediaHTML(local,{textOptions:item.textOptions});view.cleanup=attachDetailMedia(host,local,{textOptions:item.textOptions,active:()=>active===item.id,resources});
    const cover=item.cover?{...item.cover,url:item.cover.type==='model'?`https://offline.invalid${item.cover.url}`:assetURL(item.cover.url)}:null;
    view.cover=attachDetailCover(host,{resources});view.cover.update(cover,!!cover);
    element.querySelector('.clab-detail-data').innerHTML=detailFieldsHTML(record?.fields||item.fields);
    element.querySelector('.clab-detail-note').textContent=item.current?'当前参数 · 尚无输出记录':'';
    activate(active);
}
function step(id,delta){const item=data.cards.find(item=>item.id===id);if(!item?.records.length)return;const next=Math.max(0,Math.min(item.records.length-1,item.index+delta));if(next!==item.index){item.index=next;render(item);}}
function layout(){board.style.setProperty('--detail-columns',data.columns);board.style.setProperty('--detail-row-width',`${data.rowWidth}px`);}
layout();data.cards.forEach(render);
document.querySelector('.clab-offline-notice').textContent=(data.warnings||[]).join('\n');
root.addEventListener('pointerdown',event=>{const card=event.target.closest('[data-detail-card]');if(card)activate(card.dataset.detailCard);},true);
root.addEventListener('click',event=>{const button=event.target.closest('[data-step]');if(button)step(button.closest('[data-detail-card]').dataset.detailCard,Number(button.dataset.step));});
document.addEventListener('keydown',event=>{if(event.defaultPrevented||event.target.closest('input,textarea,select,[contenteditable=true]')||event.ctrlKey||event.metaKey||event.altKey)return;if(['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();step(active,event.key==='ArrowLeft'?-1:1);}});
for(const name of ['columns','rowWidth'])document.querySelector(`[data-offline-${name}]`).addEventListener('input',event=>{data[name]=Number(event.target.value);document.querySelector(`[data-offline-${name}-value]`).textContent=`${data[name]}${name==='rowWidth'?'px':''}`;layout();});
window.addEventListener('mousedown',event=>{if(!event.target.closest('.clab-media-opt-wrapper,.clab-media-dropdown'))document.querySelectorAll('.clab-media-dropdown.show').forEach(menu=>{menu.classList.remove('show');menu._originalParent?.append(menu);});},true);
window.addEventListener('pagehide',()=>{for(const view of views.values()){view.cover?.release();view.cleanup?.();}for(const url of blobs.values())URL.revokeObjectURL(url);});
