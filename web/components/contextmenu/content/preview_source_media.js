import { groupPreviewSources } from './preview_workspace_ui.js';
import { escapeHtml as esc } from './shared.js';
import { collectPreviewRecords, sourceKey } from './preview_records.js';
import { browseGroupCover, sourceBrowseGroups } from './preview_browse.js';
import { detailCoverIcon } from './preview_detail_pool.js';
import { createSourceRatios } from './preview_source_ratios.js';
import { sourceMediaHTML,sourceMediaTypes,createSourceMediaObserver } from './preview_source_media_html.js';

export function createSourceMedia(left,settings,{onReorder}) {
    let cards=[],sources=[],sourceRecords=[],checked=new Set(),groups=[],entries=[],activeKey='',comparison=null,filter='';
    let signature='',selected=new Set(),anchor='',dragged=[],hoverPoint,drop,suppressClick=false;
    const closedTasks=new Set();
    const ratios=createSourceRatios(left),media=createSourceMediaObserver(left);
    const groupId=element=>element?.closest('[data-filmstrip-section]')?.dataset.filmstripSection;
    const recordFor=element=>entries[Number(element?.dataset.index)];
    const enabled=group=>checked.has(group.source);
    const activeGroup=()=>groups.find(group=>group.records.some(record=>record.key===activeKey));
    const cover=group=>group.records.length?browseGroupCover(group,settings.session.covers):null;

    function header() {
        if (left.querySelector('.clab-source-controls [data-browse-search]')) return;
        left.innerHTML=`<div class="clab-source-controls"><div class="clab-browse-source-head">来源与媒体</div>
            <div class="clab-source-search" role="search"><span class="clab-source-type"><select data-review-type aria-label="浏览媒体类型" title="选择媒体类型"></select></span><input type="search" data-browse-search placeholder="搜索任务或模块" aria-label="搜索任务或模块"></div>
            <label class="clab-browse-thumb-size"><button type="button" data-browse-columns-reset title="恢复默认两列" aria-label="恢复默认两列"><svg viewBox="0 0 20 16" width="16" height="14" aria-hidden="true"><path d="M1 1h8v6H1Zm10 0h8v6h-8ZM1 9h8v6H1Zm10 0h8v6h-8Z" fill="none" stroke="currentColor"/></svg></button><input type="range" min="1" max="6" step="1" data-browse-columns aria-label="缩略图列数"><output data-browse-columns-label></output></label>
            <div class="clab-browse-source-actions"><button data-browse-select="all">全选</button><button data-browse-select="none">取消</button><span class="clab-browse-status" role="status"></span></div></div><div class="clab-browse-source-tree clab-source-media-tree"></div>`;
        signature='';
    }

    function historyHTML(group,indices) {
        return group.records.map(record=>{
            const index=indices.get(record.key),title=`${record.cardLabel} / ${record.areaLabel}\n${record.name}\n历史 ${record.index+1}`;
            return `<div class="clab-filmstrip-item"><button type="button" draggable="true" class="clab-preview-modal-thumb clab-filmstrip-thumb" data-index="${index}" title="${esc(title)}"><div class="clab-preview-modal-thumb-media">${sourceMediaHTML(record)}</div><span class="clab-filmstrip-assignment" hidden></span><span class="clab-filmstrip-history">${record.index<0?'当前':record.index+1}</span></button>
                <button type="button" data-filmstrip-cover="${index}" title="设为封面" aria-label="设为封面" aria-pressed="false">${detailCoverIcon}</button></div>`;
        }).join('')||'<span class="clab-source-empty">没有符合筛选的记录</span>';
    }

    function observeMedia() {media.observe(left.querySelector('.clab-source-media-tree'));}

    function paint() {
        if (!left.querySelector('.clab-source-controls [data-browse-search]')) return;
        let coverChanged=false;
        for (const section of left.querySelectorAll('[data-filmstrip-section]')) {
            const group=groups.find(item=>item.id===groupId(section));
            if (!group) continue;
            section.classList.toggle('is-expanded',enabled(group));
            const currentCover=cover(group),button=section.querySelector('.clab-source-cover');
            const coverKey=currentCover?.key||'';
            if (button.dataset.coverKey!==coverKey) {
                button.dataset.coverKey=coverKey;button.innerHTML=sourceMediaHTML(currentCover);
                button.title=currentCover?`封面 · ${currentCover.name}`:'暂无记录';
                coverChanged=true;
            }
            const index=entries.findIndex(record=>record.key===coverKey);
            button.disabled=!enabled(group)||index<0;
            button.dataset.index=String(index);
            button.setAttribute('aria-current',String(coverKey===activeKey));
            const reverse=section.querySelector('[data-browse-reverse]'),reversed=settings.session.reversedSources?.has(group.source)||false;
            reverse.disabled=!enabled(group)||group.records.filter(record=>record.source===group.source).length<2;
            reverse.setAttribute('aria-pressed',String(reversed));
            reverse.setAttribute('aria-label',reversed?'历史倒序，点击切换正序并同步到工作区':'历史正序，点击切换倒序并同步到工作区');
            for (const item of section.querySelectorAll('.clab-filmstrip-item')) {
                const thumb=item.querySelector('[data-index]'),record=recordFor(thumb),mark=item.querySelector('[data-filmstrip-cover]');
                const isCover=record?.key===coverKey;
                mark.setAttribute('aria-pressed',String(isCover));
                mark.title=isCover?'恢复最新记录为封面':'设为封面';mark.setAttribute('aria-label',mark.title);
                thumb.classList.toggle('active',record?.key===activeKey);thumb.classList.toggle('selected',selected.has(record?.key));
                const slots=comparison?['a','b'].filter(slot=>comparison[slot]===record?.key):[],badge=thumb.querySelector('.clab-filmstrip-assignment');
                badge.innerHTML=slots.map(slot=>`<span>${slot.toUpperCase()}</span>`).join('');badge.hidden=!slots.length;
            }
        }
        if (coverChanged) observeMedia();
        const status=left.querySelector('.clab-browse-status');
        const count=groups.filter(enabled).reduce((sum,group)=>sum+group.records.length,0);
        status.textContent=`${checked.size} 个模块 · ${count} 条记录${selected.size>1?` · 已选 ${selected.size} 条`:''}${comparison?` · 待替换 ${comparison.slot.toUpperCase()}`:''}`;
        status.title=status.textContent;
    }

    function toggleCover(key) {
        const group=groups.find(item=>item.records.some(record=>record.key===key));
        if (!group) return;
        if (cover(group)?.key===key) settings.session.covers.delete(group.id);
        else settings.session.covers.set(group.id,key);
        paint();
    }

    function render(nextGroups,nextEntries,nextActiveIndex,typeFilter,nextComparison=null) {
        header();entries=nextEntries;comparison=nextComparison;filter=typeFilter;
        const previous=activeKey;activeKey=entries[nextActiveIndex]?.key||'';
        const eligible=sourceRecords.filter(record=>(!filter||record.type===filter)&&(!comparison||['image','video'].includes(record.type)));
        const full=sourceBrowseGroups(eligible,settings.sort,settings.session.customGroups),byId=new Map(full.map(group=>[group.id,group]));
        for (const group of nextGroups) byId.set(group.id,group);
        groups=sources.map(source=>{
            const id=`source:${sourceKey(source.card,source.area)}`;
            return byId.get(id)||{id,source:sourceKey(source.card,source.area),records:[],label:`${source.cardLabel} · ${source.areaLabel}`};
        });
        const current=activeGroup();
        if (current) {
            settings.session.positions.set(current.id,activeKey);
        }
        if (previous!==activeKey) selected=new Set(activeKey?[activeKey]:[]);
        selected=new Set([...selected].filter(key=>entries.some(record=>record.key===key)));
        const types=comparison?sourceMediaTypes.filter(([type])=>!type||['image','video'].includes(type)):sourceMediaTypes;
        const select=left.querySelector('[data-review-type]');
        const options=types.map(([value,label])=>`<option value="${value}">${label}</option>`).join('');
        if (select.innerHTML!==options) select.innerHTML=options;
        select.value=filter;
        left.querySelector('[data-browse-columns]').value=settings.thumbColumns;left.querySelector('[data-browse-search]').value=settings.search;
        left.querySelector('[data-browse-columns-label]').textContent=`${settings.thumbColumns} 列`;
        const indices=new Map(entries.map((record,index)=>[record.key,index]));
        const state=JSON.stringify([settings.sort,full.map(group=>group.id),settings.search,comparison?'compare':'browse',cards.map(card=>[card.id,card.title]),sources.map(source=>[source.area.id,source.areaLabel]),[...checked],groups.map(group=>[group.id,group.records.map(record=>[record.key,indices.get(record.key)])])]);
        if (state!==signature) {
            const scroll=left.scrollTop,query=settings.search.trim().toLowerCase();
            left.querySelectorAll('[data-browse-card]').forEach(task=>{if(task.open)closedTasks.delete(task.dataset.browseCard);else closedTasks.add(task.dataset.browseCard);});
            const tree=left.querySelector('.clab-source-media-tree');
            tree.innerHTML=cards.map(card=>{
                const index=cards.indexOf(card);
                const title=card.title||`#${index+1}`,outputs=sources.filter(source=>source.card===card);
                const matches=outputs.filter(source=>`${title} ${source.areaLabel}`.toLowerCase().includes(query));
                if (query&&!matches.length) return '';
                const available=outputs.filter(source=>source.area.history?.some(Boolean)||source.area.resultUrl);
                const on=available.filter(source=>checked.has(sourceKey(card,source.area))).length;
                return `<details data-browse-card="${esc(card.id)}" ${!closedTasks.has(card.id)?'open':''}><summary><span data-browse-fold title="展开或折叠任务"></span><input type="checkbox" data-browse-card-check="${esc(card.id)}" ${available.length&&on===available.length?'checked':''} ${available.length?'':'disabled'} aria-label="选择任务 ${esc(title)}"><button type="button" data-browse-card-name ${available.length?'':'disabled'} title="${esc(title)}">${esc(title)}</button></summary>
                    ${matches.map(source=>{
                        const key=sourceKey(card,source.area),group=groups.find(item=>item.source===key),on=checked.has(key),count=source.area.history?.filter(Boolean).length||(source.area.resultUrl?1:0);
                        const displayedCount=settings.sort==='custom'?group.records.length:count;
                        return `<section class="clab-source-module${on?'':' is-unchecked'}" data-filmstrip-section="${esc(group.id)}">
                            <label class="clab-source-module-check"><input type="checkbox" data-browse-source="${esc(key)}" ${on?'checked':''} ${count?'':'disabled'} aria-label="选择输出模块 ${esc(source.areaLabel)}"></label>
                            <div class="clab-source-cover-frame"><button type="button" draggable="true" class="clab-preview-modal-thumb clab-source-cover" data-index="-1" disabled></button>
                                <div class="clab-source-module-caption"><span title="${esc(source.areaLabel)}">${esc(source.areaLabel)}</span><small>${displayedCount} 条</small></div>
                                <button type="button" data-browse-reverse="${esc(key)}" aria-pressed="false" title="反转此模块的历史顺序，同步到工作区"><svg viewBox="0 0 20 20" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M6 3v14m-3-3 3 3 3-3M11 5h6m-6 5h4m-4 5h2"/></svg></button></div>
                            <div class="clab-source-history" role="list" aria-label="${esc(source.areaLabel)} 的生成记录">${on?historyHTML(group,indices):''}</div></section>`;
                    }).join('')||'<p class="clab-review-note">没有输出模块</p>'}</details>`;
            }).join('')||'<p class="clab-review-note">没有匹配的任务或模块</p>';
            groupPreviewSources(tree,cards,'data-browse-card');
            for (const input of tree.querySelectorAll('[data-browse-card-check]')) {
                const available=sources.filter(source=>source.card.id===input.dataset.browseCardCheck&&(source.area.history?.some(Boolean)||source.area.resultUrl));
                const on=available.filter(source=>checked.has(sourceKey(source.card,source.area))).length;
                input.indeterminate=on>0&&on<available.length;
            }
            signature=state;left.scrollTop=scroll;observeMedia();
            const histories=new Map();
            for(const record of sourceRecords) {
                if(!histories.has(record.source))histories.set(record.source,[]);
                histories.get(record.source).push(record);
            }
            ratios.observe(new Map([...tree.querySelectorAll('[data-filmstrip-section]')].map(section=>{
                const group=groups.find(item=>item.id===groupId(section));
                return [section,histories.get(group.source)||[]];
            })));
        }
        paint();
        left.style.setProperty('--browse-controls-height',`${left.querySelector('.clab-source-controls').offsetHeight}px`);
        if (previous!==activeKey) {
            const thumb=left.querySelector('.clab-filmstrip-thumb.active');
            if (thumb?.closest('.is-expanded')&&thumb.closest('[data-browse-card]')?.open) thumb.scrollIntoView({block:'nearest'});
        }
    }

    function handleClick(event) {
        if (suppressClick) return true;
        if (event.target.closest('[data-browse-reverse]'))return false;
        if (event.target.closest('[data-browse-columns-reset]')) {
            settings.thumbColumns=2;left.querySelector('[data-browse-columns]').value=2;
            rootVariable();return true;
        }
        const mark=event.target.closest('[data-filmstrip-cover]');
        if (mark) {toggleCover(entries[Number(mark.dataset.filmstripCover)]?.key);return true;}
        const thumb=event.target.closest('.clab-filmstrip-thumb,.clab-source-cover')||event.target.closest('.clab-source-cover-frame')?.querySelector('.clab-source-cover');
        if (!thumb) return false;
        const record=recordFor(thumb);if(!record)return true;
        const records=groups.filter(enabled).flatMap(group=>group.records),key=record.key;
        if (event.shiftKey&&anchor) {
            const first=records.findIndex(record=>record.key===anchor),last=records.findIndex(record=>record.key===key);
            if(first>=0)selected=new Set(records.slice(Math.min(first,last),Math.max(first,last)+1).map(record=>record.key));
        } else if (event.ctrlKey||event.metaKey) {selected.has(key)?selected.delete(key):selected.add(key);anchor=key;}
        else {selected=new Set([key]);anchor=key;return false;}
        paint();return true;
    }
    function rootVariable() {
        left.closest('.clab-preview-modal').style.setProperty('--browse-thumb-columns',settings.thumbColumns);
        left.querySelector('[data-browse-columns-label]').textContent=`${settings.thumbColumns} 列`;
    }

    function clearDrag() {
        dragged=[];drop=null;hoverPoint=null;
        left.querySelectorAll('.drop-before,.drop-after').forEach(element=>element.classList.remove('drop-before','drop-after'));
        paint();
    }
    left.addEventListener('dragstart',event=>{
        const thumb=event.target.closest('.clab-filmstrip-thumb,.clab-source-cover');
        if (!thumb) return;
        const group=groups.find(item=>item.id===groupId(event.target));
        if (!group||!enabled(group)) {event.preventDefault();return;}
        const record=recordFor(thumb);if(!record)return;if(!selected.has(record.key))selected=new Set([record.key]);event.dataTransfer.setData('application/x-clab-preview-record',record.key);
        dragged=groups.filter(enabled).flatMap(group=>group.records).filter(record=>selected.has(record.key)).map(record=>record.key);
        event.dataTransfer.effectAllowed='copyMove';event.dataTransfer.setData('text/plain','CreativeLab preview records');paint();
    });
    left.addEventListener('dragover',event=>{
        const section=event.target.closest('[data-filmstrip-section]'),group=groups.find(item=>item.id===groupId(section));
        if (!dragged.length||!group||!enabled(group)) return;
        event.preventDefault();event.dataTransfer.dropEffect='move';
        const bounds=left.getBoundingClientRect(),scroll=left.scrollTop;if(event.clientY<bounds.top+35)left.scrollTop-=16;else if(event.clientY>bounds.bottom-35)left.scrollTop+=16;
        if(drop&&hoverPoint?.x===event.clientX&&hoverPoint.y===event.clientY&&left.scrollTop===scroll)return;
        hoverPoint={x:event.clientX,y:event.clientY};
        left.querySelectorAll('.drop-before,.drop-after').forEach(element=>element.classList.remove('drop-before','drop-after'));
        const next=[...section.querySelectorAll('.clab-filmstrip-thumb')].find(button=>{
            const rect=button.getBoundingClientRect();
            return event.clientY<rect.top||event.clientY<=rect.bottom&&event.clientX<(rect.left+rect.right)/2;
        });
        (next||section.querySelector('.clab-source-history'))?.classList.add(next?'drop-before':'drop-after');
        drop={targetId:group.id,beforeKey:next?recordFor(next)?.key:undefined};
    });
    left.addEventListener('drop',event=>{
        if (!drop||!dragged.length) return;
        event.preventDefault();const change={...drop,keys:dragged};clearDrag();suppressClick=true;
        onReorder(change);setTimeout(()=>{suppressClick=false;},0);
    });
    left.addEventListener('dragend',clearDrag);

    return {
        setSources(nextCards,nextSources,selectedSources) {
            cards=nextCards;
            if (sources!==nextSources) sourceRecords=collectPreviewRecords(nextSources);
            sources=nextSources;checked=new Set(selectedSources.map(source=>sourceKey(source.card,source.area)));header();
        },
        render,handleClick,toggleCover,
        release() {
            ratios.release();
            media.release();
            cards=[];sources=[];sourceRecords=[];groups=[];entries=[];activeKey='';signature='';anchor='';
            selected.clear();dragged=[];hoverPoint=null;drop=null;suppressClick=false;
        },
    };
}
