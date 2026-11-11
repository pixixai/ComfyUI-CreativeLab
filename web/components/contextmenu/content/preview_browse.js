import { createSourceMedia } from './preview_source_media.js';
import { escapeHtml as esc } from './shared.js';
import { sourceKey } from './preview_records.js';

export function workspacePreviewSources(cards) {
    return cards.flatMap((card, index) => (card.areas || []).filter(area => area.type === 'preview').map((area, outputIndex) => ({
        card, area, cardLabel: card.title || `#${index + 1}`, areaLabel: area.title || `##${outputIndex + 1}`,
    })));
}

export function initialPreviewSources(cards, selectedSources, selectedCardIds, fallbackCardId) {
    const all = workspacePreviewSources(cards).filter(source=>sourceRecordCount(source.area));
    if (selectedSources?.length) {
        const selected = new Set(selectedSources.map(source => sourceKey(source.card, source.area)));
        return all.filter(source => selected.has(sourceKey(source.card, source.area)));
    }
    const cardIds = new Set(selectedCardIds?.length ? selectedCardIds : [fallbackCardId]);
    return all.filter(source => cardIds.has(source.card.id));
}

export function sourceRecordCount(area) {
    return area.history?.length ? area.history.filter(Boolean).length : area.resultUrl ? 1 : 0;
}

const newestFirst = (a,b) => (b.run?.order ?? b.index + 1) - (a.run?.order ?? a.index + 1) || b.index - a.index;

export function groupBrowseRecords(records, order, customGroups = []) {
    if (order === 'newest' || order === 'oldest') {
        const sources = new Map(), groups = [];
        for (const record of records) {
            if (!sources.has(record.source)) sources.set(record.source, []);
            sources.get(record.source).push(record);
        }
        for (const history of sources.values()) {
            history.sort(newestFirst);
            history.forEach((record, rank) => {
                groups[rank] ??= {id:`rank:${rank}`,label:rank ? `各模块倒数第 ${rank + 1} 条` : '各模块最新', records:[]};
                groups[rank].records.push(record);
            });
        }
        return order === 'oldest' ? groups.reverse() : groups;
    }
    const byKey = new Map(records.map(record => [record.key,record]));
    const groups = order === 'custom' ? customGroups.map(group => ({
        ...group, records:group.keys.flatMap(key => {
            const record = byKey.get(key);
            byKey.delete(key);
            return record ? [record] : [];
        }),
    })) : [];
    const byId = new Map(groups.map(group => [group.id,group]));
    for (const record of byKey.values()) {
        const id = `source:${record.source}`;
        if (!byId.has(id)) {
            const group = {id,source:record.source,label:`${record.cardLabel} · ${record.areaLabel}`,records:[]};
            byId.set(id,group);groups.push(group);
        }
        byId.get(id).records.push(record);
    }
    return groups.filter(group => group.records.length);
}

export function snapshotBrowseGroups(groups) {
    return groups.map(({id,source,label,records})=>({id,source,label,keys:records.map(record=>record.key)}));
}

export function browseGroupCover(group, covers) {
    const pinned = group.records.find(record => record.key === covers.get(group.id));
    if (pinned) return pinned;
    return group.records.reduce((latest,record)=>newestFirst(record,latest)<0?record:latest,group.records[0]);
}

export function moveBrowseGroupRecords(groups, keys, targetId, beforeKey) {
    const target = groups.find(group=>group.id===targetId);
    if (!target) return groups;
    const selected = new Set(keys);
    if (selected.has(beforeKey)) return groups;
    const moved = groups.flatMap(group=>group.records.filter(record=>selected.has(record.key)));
    if (!moved.length) return groups;
    const next = groups.map(group=>({...group,records:group.records.filter(record=>!selected.has(record.key))}));
    const records = next[groups.indexOf(target)].records;
    const index = beforeKey ? records.findIndex(record=>record.key===beforeKey) : records.length;
    if (index < 0) return groups;
    records.splice(index,0,...moved);
    const changed = next.some((group,i)=>group.records.length!==groups[i].records.length ||
        group.records.some((record,j)=>record!==groups[i].records[j]));
    return changed ? next.filter(group=>group.records.length) : groups;
}


export function sourceBrowseGroups(records,order,customGroups=[]) {
    const groups=groupBrowseRecords(records,order==='custom'?'custom':'source',customGroups);
    const sources=new Map([...new Set(records.map(record=>record.source))].map((source,index)=>[source,index]));
    groups.sort((a,b)=>(sources.get(a.source)??Infinity)-(sources.get(b.source)??Infinity));
    if (order==='newest'||order==='oldest') for (const group of groups) {
        group.records.sort((a,b)=>(order==='newest'?1:-1)*newestFirst(a,b));
    }
    return groups;
}

export function createBrowseLayout(root, settings, callbacks) {
    const left=root.querySelector('.clab-preview-modal-left'),body=root.querySelector('.clab-preview-modal-body');
    const media=createSourceMedia(left,settings,callbacks);
    const restoreButton=side=>`<button type="button" data-browse-restore="${side}" hidden title="恢复${side==='sources'?'来源':'参数'}面板默认大小" aria-label="恢复面板默认大小"><svg width="12" height="12" viewBox="0 0 16 16" aria-hidden="true"><path d="M5 2 11 8 5 14Z" fill="currentColor"/></svg></button>`;
    for (const side of ['sources','parameters']) {
        const handle=document.createElement('div');
        handle.className=`clab-browse-side-resize ${side}`;handle.dataset.browseResize=side;
        handle.tabIndex=0;handle.setAttribute('role','separator');handle.setAttribute('aria-orientation','vertical');
        handle.setAttribute('aria-label',`调整${side==='sources'?'来源':'参数'}区域宽度`);handle.title='拖动调整区域宽度';
        handle.innerHTML=restoreButton(side);body.append(handle);
    }
    function applyLayout() {
        if (root.dataset.reviewLayout==='workspace'&&body.clientWidth>0) {
            const minimum=body.clientWidth<700?90:130,center=body.clientWidth<600?120:200;
            const sourceMinimum=settings.sourceWidth>0?minimum:0,parameterMinimum=settings.parameterWidth>0?minimum:0;
            settings.sourceWidth=Math.max(sourceMinimum,settings.sourceWidth);
            settings.parameterWidth=Math.max(parameterMinimum,settings.parameterWidth);
            const available=Math.max(sourceMinimum+parameterMinimum,body.clientWidth-center-12);
            const excess=settings.sourceWidth+settings.parameterWidth-available;
            const extra=settings.sourceWidth+settings.parameterWidth-sourceMinimum-parameterMinimum;
            if (excess>0&&extra>0) {
                const sourceExtra=settings.sourceWidth-sourceMinimum;
                settings.sourceWidth-=excess*sourceExtra/extra;settings.parameterWidth-=excess*(extra-sourceExtra)/extra;
            }
        }
        root.style.setProperty('--browse-source-width',`${settings.sourceWidth}px`);
        root.style.setProperty('--browse-parameter-width',`${settings.parameterWidth}px`);
        root.style.setProperty('--browse-thumb-columns',settings.thumbColumns);
        root.dataset.sourceCollapsed=String(settings.sourceWidth===0);root.dataset.parameterCollapsed=String(settings.parameterWidth===0);
        for (const handle of body.querySelectorAll('[data-browse-resize]')) {
            const width=settings[handle.dataset.browseResize==='sources'?'sourceWidth':'parameterWidth'];
            handle.dataset.collapsed=String(width===0);handle.firstElementChild.hidden=width!==0;
            handle.setAttribute('aria-valuenow',Math.round(width));
        }
    }
    function restorePanel(side) {
        settings[side==='sources'?'sourceWidth':'parameterWidth']=side==='sources'?(innerWidth<1100?280:320):(innerWidth<1100?240:300);
        applyLayout();
    }
    let resizeStart;
    const stopResize=()=>{resizeStart=null;root.classList.remove('clab-sidebar-resizing');};
    root.addEventListener('pointerdown',event=>{
        const handle=event.target.closest('[data-browse-resize]');
        if (!handle||event.button!==0||event.target.closest('[data-browse-restore]')) return;
        event.preventDefault();handle.setPointerCapture(event.pointerId);
        resizeStart={side:handle.dataset.browseResize,x:event.clientX,sourceWidth:settings.sourceWidth,parameterWidth:settings.parameterWidth};
        root.classList.add('clab-sidebar-resizing');
    });
    root.addEventListener('pointermove',event=>{
        if (!resizeStart) return;
        const side=resizeStart.side,key=side==='sources'?'sourceWidth':'parameterWidth',other=side==='sources'?'parameterWidth':'sourceWidth';
        const minimum=body.clientWidth<700?90:130,center=body.clientWidth<600?120:200;
        const width=resizeStart[key]+(event.clientX-resizeStart.x)*(side==='sources'?1:-1);
        settings[key]=width<minimum-36?0:Math.max(minimum,Math.min(body.clientWidth-settings[other]-center-12,width));
        applyLayout();
    });
    for (const type of ['pointerup','pointercancel','lostpointercapture'])root.addEventListener(type,stopResize);
    window.addEventListener('blur',stopResize);window.addEventListener('resize',applyLayout);
    root.addEventListener('keydown',event=>{
        const side=event.target.dataset.browseResize;
        if (!side||!['ArrowLeft','ArrowRight'].includes(event.key))return;
        event.preventDefault();event.stopPropagation();
        const key=side==='sources'?'sourceWidth':'parameterWidth',delta=(event.key==='ArrowRight'?16:-16)*(side==='sources'?1:-1);
        if (settings[key]===0) {if(delta>0)restorePanel(side);return;}
        settings[key]+=delta;if(settings[key]<(body.clientWidth<700?90:130))settings[key]=0;
        applyLayout();
    });
    left.addEventListener('click',event=>{
        const summary=event.target.closest('.clab-browse-source-tree summary');
        if (!summary||event.target.closest('[data-browse-fold],input'))return;
        event.preventDefault();
        if (event.target.closest('[data-browse-card-name]')) {
            const checkbox=summary.querySelector('[data-browse-card-check]');
            if(!checkbox.disabled)checkbox.click();
        }
    });
    function renderPlainSources(cards, allSources, selectedSources) {
        if (!left.querySelector('[data-browse-search]')||left.querySelector('.clab-source-controls')) left.innerHTML = `<div class="clab-browse-source-head">来源</div>
            <label class="clab-review-field"><input type="search" data-browse-search placeholder="搜索任务或模块" aria-label="搜索任务或模块" value="${esc(settings.search)}"></label>
            <div class="clab-browse-source-actions"><button data-browse-select="all">全选</button><button data-browse-select="none">取消</button><small data-browse-source-count></small></div><div class="clab-browse-source-tree"></div>`;
        const tree = left.querySelector('.clab-browse-source-tree');
        const search=left.querySelector('[data-browse-search]');
        if(search.value!==settings.search)search.value=settings.search;
        const closed = new Set([...tree.querySelectorAll('details:not([open])')].map(group => group.dataset.browseCard));
        const selected = new Set(selectedSources.map(source => sourceKey(source.card, source.area)));
        const query = settings.search.trim().toLowerCase();
        const scroll = left.scrollTop;
        tree.innerHTML = cards.map((card, index) => {
            const cardLabel = card.title || `#${index + 1}`, outputs = allSources.filter(source => source.card === card);
            const matches = outputs.filter(source => `${cardLabel} ${source.areaLabel}`.toLowerCase().includes(query));
            if (query && !matches.length && !cardLabel.toLowerCase().includes(query)) return '';
            const available = outputs.filter(source => sourceRecordCount(source.area));
            const checked = available.filter(source => selected.has(sourceKey(card, source.area))).length;
            return `<details data-browse-card="${esc(card.id)}" ${query || !closed.has(card.id) ? 'open' : ''}><summary><span data-browse-fold title="展开或折叠任务"></span><input type="checkbox" data-browse-card-check="${esc(card.id)}" aria-label="选择任务 ${esc(cardLabel)}" ${available.length && checked === available.length ? 'checked' : ''} ${available.length ? '' : 'disabled'}><button type="button" data-browse-card-name title="${esc(cardLabel)}" ${available.length ? '' : 'disabled'}>${esc(cardLabel)}</button><small>${outputs.reduce((sum, source) => sum + sourceRecordCount(source.area), 0)}</small></summary>
                ${matches.map(source => {
                    const key = sourceKey(card, source.area), count = sourceRecordCount(source.area);
                    return `<label class="clab-browse-source-row"><input type="checkbox" data-browse-source="${esc(key)}" aria-label="选择输出模块 ${esc(source.areaLabel)}" ${selected.has(key) ? 'checked' : ''} ${count ? '' : 'disabled'}><span title="${esc(source.areaLabel)}">${esc(source.areaLabel)}</span><small>${count}</small></label>`;
                }).join('') || '<p class="clab-review-note">没有输出模块</p>'}</details>`;
        }).join('') || '<p class="clab-review-note">没有匹配的任务或模块</p>';
        tree.querySelectorAll('[data-browse-card-check]').forEach(input => {
            const available = allSources.filter(source => source.card.id === input.dataset.browseCardCheck && sourceRecordCount(source.area));
            const count = available.filter(source => selected.has(sourceKey(source.card, source.area))).length;
            input.indeterminate = count > 0 && count < available.length;
        });
        left.querySelector('[data-browse-source-count]').textContent = `${selectedSources.length} 个模块`;
        left.scrollTop = scroll; applyLayout();
    }

    return {
        renderSources(cards,allSources,selectedSources) {
            if (['browse','compare'].includes(root.dataset.reviewMode)) media.setSources(cards,allSources,selectedSources);
            else renderPlainSources(cards,allSources,selectedSources);
        },
        renderMedia:media.render,applyLayout,toggleCover:media.toggleCover,
        handleClick(event) {
            const restore=event.target.closest('[data-browse-restore]');
            if (restore) {restorePanel(restore.dataset.browseRestore);return true;}
            return media.handleClick(event);
        },
        release() {media.release();stopResize();},
    };
}
