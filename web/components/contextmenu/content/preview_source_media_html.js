import { escapeHtml as esc } from './shared.js';

export const sourceMediaTypes=[['','全部'],['image','图片'],['video','视频'],['audio','音频'],['text','文本'],['model','3D'],['file','文件']];

export function sourceMediaHTML(record) {
    if(!record)return '<span class="clab-source-empty">暂无记录</span>';
    if(record.type==='image')return `<img loading="lazy" draggable="false" src="${esc(record.url)}" alt="${esc(record.name)}">`;
    if(record.type==='video')return `<video data-source-video="${esc(record.url.split('#')[0])}#t=0.01" muted playsinline preload="metadata"></video>`;
    return `<span class="clab-preview-modal-thumb-badge">${({audio:'音频',text:'文本',model:'3D',file:'文件'})[record.type]||record.type}</span>`;
}

export function createSourceMediaObserver(left) {
    let videos=new Set();
    const unload=video=>{video.pause();video.removeAttribute('src');video.load();};
    const observer=new IntersectionObserver(items=>items.forEach(({target,isIntersecting})=>{
        if(isIntersecting){target.src=target.dataset.sourceVideo;observer.unobserve(target);}
    }),{root:left,rootMargin:'100px 0px'});
    return {
        observe(container) {
            observer.disconnect();
            for(const video of videos)if(!container.contains(video))unload(video);
            videos=new Set(container.querySelectorAll('video[data-source-video]'));
            for(const video of videos)if(!video.getAttribute('src'))observer.observe(video);
        },
        release(){observer.disconnect();videos.forEach(unload);videos.clear();},
    };
}
