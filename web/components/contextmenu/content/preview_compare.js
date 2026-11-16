import { externalImportIcon } from '../../modules/media_types/external_import_icon.js';
import { escapeHtml as esc } from './shared.js';
import { renderVideoControls } from '../../modules/media_types/media_video.js';
import { attachPreviewVideo } from './preview_video.js';
import { attachPreviewPan } from './preview_pan.js';
import { comparisonViews,panComparison,zoomComparison } from './preview_compare_view.js';

export function comparisonHTML(a, b, config) {
    comparisonViews(config);
    const pair=JSON.stringify([a?.key || '',b?.key || ''].sort());
    if(config.pair!==pair) { config.pair=pair;config.playback={time:0,speed:1,audio:'mute',playing:undefined}; }
    const camera=(record,name)=>`<div class="clab-compare-camera camera-${name} clab-compare-slot-tools"><button type="button" data-compare-lock="${name}" aria-pressed="${!!config.locks[name]}" ${record?'':'disabled'} title="锁定此区域的缩放和平移" aria-label="锁定 ${name.toUpperCase()} 区缩放和平移"><svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="9" width="12" height="9" rx="2"/><path d="M6 9V6a4 4 0 0 1 8 0v3M10 12v3"/></svg></button><output data-compare-zoom="${name}" aria-label="${name.toUpperCase()} 区缩放比例">${Math.round(config.views[name].zoom*100)}%</output><button type="button" data-compare-reset="${name}" ${record?'':'disabled'} aria-label="对齐 ${name.toUpperCase()} 区缩放和位置"><svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 7a6 6 0 1 1 0 6M4 3v4h4"/></svg></button></div>`;
    const slot = (record, name) => {
        const label = record ? record.externalWorkspaceId?`${record.cardLabel} · ${record.name}`:`${record.cardLabel} · ${record.areaLabel} · ${record.index < 0 ? '当前结果' : `历史 ${record.index + 1}`}` : '待选择媒体';
        const number = `<strong>${name.toUpperCase()}</strong>`, info = `<span>${esc(label)}</span>`, separator = '<i class="clab-compare-label-separator" aria-hidden="true"></i>';
        const title=`<button class="clab-compare-label" data-compare-slot="${name}" aria-pressed="${config.slot === name}" title="${esc(label)}${record ? ` · ${esc(record.name)}` : ''}；点击设为待替换区域">${name === 'a' ? number + separator + info : info + separator + number}</button>`;
        const tools=`<span class="clab-compare-slot-tools"><button type="button" data-compare-remove="${name}" ${record?'':'disabled'} title="移除此区域的媒体，保留来源" aria-label="移除 ${name.toUpperCase()} 区媒体"><svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5"><path d="m5 5 10 10M15 5 5 15"/></svg></button></span>`;
        return `<div class="clab-compare-heading label-${name}">${name==='a'?title+externalImportIcon(record?.url,record?.imported||record?.externalWorkspaceId)+tools:tools+externalImportIcon(record?.url,record?.imported||record?.externalWorkspaceId)+title}</div>`;
    };
    const valid = a && b && a.type === b.type && ['image', 'video'].includes(a.type);
    return `<div class="clab-compare"><div class="clab-compare-stage ${valid && a.type === 'video' ? 'clab-video-player clab-video-paused' : ''} ${config.layout === 'split' ? 'split' : 'side'}">
        ${[a, b].map((record, i) => `<div class="clab-compare-pane ${i ? 'layer-b' : 'layer-a'}" data-compare-pane="${i?'b':'a'}">${record ? `<div class="clab-compare-transform">${record.type === 'image' ? `<img draggable="false" src="${esc(record.url)}" alt="${i ? 'B' : 'A'}">` : `<video src="${esc(record.url)}" preload="metadata" muted playsinline></video>`}</div>` : `<div class="clab-compare-empty"><div>从左侧「来源」添加图像或视频</div><div>或从 <button type="button" data-external-pick="computer" data-external-target="${i?'b':'a'}">计算机</button> 与 <button type="button" data-external-pick="server" data-external-target="${i?'b':'a'}">服务器▾</button> 选择</div></div>`}</div>`).join('')}
        <div class="clab-compare-divider"></div>
        ${slot(a, 'a')}${slot(b, 'b')}
        <button class="clab-compare-swap" data-compare-swap title="交换 A/B" aria-label="交换 A/B"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path fill="currentColor" d="M5 8h8V4l6 6H5V8Zm14 8h-8v4l-6-6h14v2Z"/></svg></button>
        ${camera(a,'a')}${camera(b,'b')}
        ${valid && a.type === 'video' ? renderVideoControls('<select class="clab-video-controls-interactive" data-compare-audio aria-label="比较视频声音"><option value="mute">静音</option><option value="a">A 声音</option><option value="b">B 声音</option></select>') : ''}
        <div class="clab-compare-status" role="status">${!valid&&a&&b?'请选择两张图片或两个视频进行对比。':''}</div>
        <div class="clab-compare-layout clab-review-segment"><button data-compare-layout="side" aria-pressed="${config.layout === 'side'}">并排比较</button><button data-compare-layout="split" aria-pressed="${config.layout === 'split'}">分屏比较</button></div></div></div>`;
}

function paintComparisonViews(container,config){
    const views=comparisonViews(config);
    for(const element of container.querySelectorAll('.clab-compare-transform')){const view=views[element.closest('[data-compare-pane]').dataset.comparePane];element.style.transform=`translate(${view.x}px,${view.y}px) scale(${view.zoom})`;}
    for(const output of container.querySelectorAll('[data-compare-zoom]'))output.textContent=Math.round(views[output.dataset.compareZoom].zoom*100)+'%';
    for(const button of container.querySelectorAll('[data-compare-reset]')){const other=button.dataset.compareReset==='a'?'b':'a';button.title=config[other]?`与 ${other.toUpperCase()} 区视图对齐（${Math.round(views[other].zoom*100)}%）`:'恢复 100% 缩放并居中';}
}

export function syncComparison(container, config) {
    const stage = container.querySelector('.clab-compare-stage');
    if (!stage) return;
    stage.classList.toggle('side', config.layout === 'side'); stage.classList.toggle('split', config.layout === 'split');
    stage.style.setProperty('--compare-split', `${(config.layout === 'split' ? config.view.split : .5) * 100}%`);
    container.querySelectorAll('[data-compare-slot]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.compareSlot === config.slot)));
    container.querySelectorAll('[data-compare-layout]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.compareLayout === config.layout)));
    for(const button of container.querySelectorAll('[data-compare-lock]')){const locked=!!config.locks?.[button.dataset.compareLock];button.setAttribute('aria-pressed',String(locked));button.title=locked?'解除锁定，恢复缩放和平移':'锁定此区域的缩放和平移';}
    paintComparisonViews(container,config);
}

export function attachComparison(container, config) {
    const stage = container.querySelector('.clab-compare-stage');
    if (!stage) return () => {};
    const controller = new AbortController(), { signal } = controller;
    const videos = [...stage.querySelectorAll('video')];
    const status = container.querySelector('.clab-compare-status');
    const isVideoPlayer = stage.classList.contains('clab-video-player');
    const canPan = target => !target.closest('button,input,select,.clab-video-controls-interactive');
    const view = config.view;
    comparisonViews(config);let gestureSlot='a';
    const slotAt=event=>{const rect=stage.getBoundingClientRect();return (event.clientX-rect.left)/rect.width<(config.layout==='split'?view.split:.5)?'a':'b';};
    const updateView = () => {
        paintComparisonViews(stage,config);
        stage.style.setProperty('--compare-split', `${(config.layout === 'split' ? view.split : .5) * 100}%`);
    };
    updateView();
    syncComparison(container, config);
    stage.addEventListener('pointerdown',event=>{gestureSlot=slotAt(event);},{capture:true,signal});
    const pan=(x,y)=>{panComparison(config,gestureSlot,x,y);updateView();};
    const zoom=event=>{
        const slot=slotAt(event),panes=Object.fromEntries([...stage.querySelectorAll('[data-compare-pane]')].map(pane=>[pane.dataset.comparePane,pane.getBoundingClientRect()]));
        const rect=panes[slot];zoomComparison(config,slot,event.deltaY<0?1.12:.9,{x:(event.clientX-rect.left)/rect.width-.5,y:(event.clientY-rect.top)/rect.height-.5},panes);updateView();
    };
    const releasePan = isVideoPlayer ? null : attachPreviewPan(stage,pan,{canStart:target=>canPan(target)&&!config.locks[gestureSlot]});
    stage.addEventListener('pointermove', event => {
        if (config.layout !== 'split' || stage.classList.contains('is-panning') || !canPan(event.target)) return;
        const rect = stage.getBoundingClientRect();
        view.split = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
        updateView();
    }, {signal});
    if (!videos.length) {
        stage.addEventListener('wheel', event => {if(!canPan(event.target))return;event.preventDefault();zoom(event);}, { passive: false, signal });
        stage.querySelectorAll('img').forEach(image => image.addEventListener('error', () => { status.textContent = '图片无法读取，请检查历史文件是否仍然存在。'; }, { signal }));
    }
    const releaseVideo = isVideoPlayer ? attachPreviewVideo(stage, { view, playback: config.playback, status, primaryPan:true,camera:{apply:updateView,pan,zoom,canPan:()=>!config.locks[gestureSlot]} }) : null;
    return () => {
        controller.abort(); releasePan?.(); releaseVideo?.();
        if (!releaseVideo) videos.forEach(video => { video.pause(); video.removeAttribute('src'); video.load(); });
    };
}
