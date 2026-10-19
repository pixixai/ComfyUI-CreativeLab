import { buildDetailCards, detailInputs, detailInputGroups, setDetailInputVisible, detailOutputGroups, detailOutputRecords, setDetailCover, detailCoverApplied, applyDetailOutput, detailHistoryKey, detailFieldKey, detailStyle, detailFieldsHTML, setDetailStyle, detailExportRange, DETAIL_CSS } from './preview_detail_model.js';
import { detailMediaHTML, attachDetailMedia } from './preview_detail_media.js';
import { attachDetailCover } from './preview_detail_cover.js';
import { createDetailRecordPool, detailCoverIcon, detailOutputIcon, detailApplyIcon, DETAIL_POOL_CSS } from './preview_detail_pool.js';
import { moveModuleDOM } from '../../modules/module_lifecycle.js';
import { downloadPreviewBlob } from './preview_export.js';
import { escapeHtml as esc } from './shared.js';

const PREFERENCES = 'clab-detail-appearance-v1';
const typing = target => target?.closest?.('input,textarea,select,[contenteditable=true]');
const icon = content => `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true">${content}</svg>`;
const eyeShape='<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>';
const hiddenEye=eyeShape+'<path d="m3 3 18 18"/>';
const stackedEye=content=>icon(`<g transform="translate(0 -1) scale(.8)">${content}</g><path d="M8 18h11v-8M11 22h11V12"/>`);
const fieldActions=`<span class="clab-detail-field-actions"><button type="button" data-detail-hide="field" title="仅隐藏此字段" aria-label="仅隐藏此字段">${icon(hiddenEye)}</button><button type="button" data-detail-hide="name" title="隐藏所有同名字段（当前勾选任务）" aria-label="隐藏所有同名字段">${stackedEye(hiddenEye)}</button></span>`;
const caseIcon = text => icon(`<text x="12" y="17" text-anchor="middle" fill="currentColor" stroke="none" font-family="Arial,sans-serif" font-size="${text==='aa'?17:15}" font-weight="600">${text}</text>`);
const choices = (attribute, items, value) => `<div class="clab-detail-icon-buttons">${items.map(([key,title,svg,label])=>`<button ${attribute} data-value="${key}" ${label?'class="clab-detail-labelled-option"':''} title="${title}" aria-label="${title}" aria-pressed="${key===value}">${svg}${label?`<span>${label}</span>`:''}</button>`).join('')}</div>`;

export function createDetailView(root) {
    const left = root.querySelector('.clab-preview-modal-left'), center = root.querySelector('.clab-preview-modal-center'), right = root.querySelector('.clab-preview-modal-right');
    let preferences = {};
    try { preferences = JSON.parse(localStorage.getItem(PREFERENCES) || '{}'); } catch { /* Ignore unavailable storage or an invalid saved preference. */ }
    const columns = Math.max(1, Math.min(8, Number(preferences.columns) || 3));
    const config = { columns, rowWidth: Math.max(480,Math.min(2560,Number(preferences.rowWidth)||(preferences.width?Math.round((preferences.width*columns+(columns-1)*16)/10)*10:960))), styles: preferences.styles || {},
        tasks: new Set(), outputs: new Map(), covers:new Map(), inputs: new Map(), histories: new Map(), media: new Map(), scope: 'name', part: 'row', search: '', active: '', field: '', selectedFields: new Set(), anchor: '', includeHistory: true, exportScale: 3, exportStart:1, exportEnd:null, fieldNames: new Map() };
    const views = new Map();
    let cards = [], model = [], exporting = false;
    let applyMenu;
    const rememberHistories=()=>{for(const item of model)if(item.record)config.histories.set(detailHistoryKey(item.id,item.area.id),item.record.key);};
    const closeApplyMenu=()=>{applyMenu?.remove();applyMenu=null;left.querySelectorAll('[data-detail-output-switch]').forEach(button=>button.setAttribute('aria-expanded','false'));};
    const apply=(title,role,source)=>{rememberHistories();applyDetailOutput(cards,config,title,role,source);closeApplyMenu();syncSourceControls();renderBoard();renderSettings();};
    const pool=createDetailRecordPool(root,{
        onSelect(card,area,record,role){
            rememberHistories();
            if(role==='cover')setDetailCover(config,card,area,record);
            else{config.outputs.set(card.id,area.id);config.histories.set(detailHistoryKey(card.id,area.id),record.key);}
            syncSourceControls();renderBoard();renderSettings();
        },onApply:apply,coverApplied:(title,source)=>detailCoverApplied(cards,config,title,source),
    });
    left.addEventListener('scroll',closeApplyMenu);
    document.addEventListener('keydown',event=>{
        if(!applyMenu)return;
        if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();closeApplyMenu();}
        else if(['ArrowDown','ArrowUp','Tab'].includes(event.key)){
            event.preventDefault();event.stopImmediatePropagation();const buttons=[...applyMenu.querySelectorAll('button')],index=buttons.indexOf(document.activeElement),step=event.key==='ArrowUp'||event.key==='Tab'&&event.shiftKey?-1:1;buttons[(index+step+buttons.length)%buttons.length].focus();
        }
    },true);
    const save = () => { try { localStorage.setItem(PREFERENCES, JSON.stringify({ columns: config.columns, rowWidth: config.rowWidth, styles: config.styles })); } catch { /* Layout remains usable without browser storage. */ } };
    const selectedRows = () => model.flatMap(item=>item.fields.filter(field=>config.selectedFields.has(detailFieldKey(item.id,field.id))).map(field=>({item,field})));
    const selected = () => selectedRows().find(({item,field})=>item.id===config.active&&field.id===config.field)||selectedRows()[0]||{};
    const blank = target => center.contains(target)&&(target===center||target.matches('.clab-detail-board,.clab-detail-board-empty,.clab-detail-card,.clab-detail-data'));
    const syncSelection = () => {
        for(const [key,view] of views){view.element.classList.toggle('active',key===config.active);view.element.querySelectorAll('[data-detail-field]').forEach(field=>field.classList.toggle('selected',config.selectedFields.has(detailFieldKey(key,field.dataset.detailField))));}
        syncSourceSelection();
    };
    const activate = id => {
        const changed=config.active!==id;config.active=id;
        if(changed)config.field=model.find(item=>item.id===id)?.fields[0]?.id||'';
        syncSelection();
        if(changed)renderSettings();
    };
    function syncSourceSelection() {
        for(const group of left.querySelectorAll('[data-detail-source]')){
            group.querySelector('summary').classList.toggle('clab-detail-source-active',group.dataset.detailSource===config.active);
            for(const input of group.querySelectorAll('[data-detail-input]'))input.closest('.clab-detail-source-option').classList.toggle('clab-detail-source-current',config.selectedFields.has(detailFieldKey(group.dataset.detailSource,input.value)));
        }
    }
    function locateSource(cardId,fieldId='') {
        const find=()=>left.querySelector(`[data-detail-source="${CSS.escape(cardId)}"]`);
        let group=find();
        if(!group&&config.search){config.search='';renderSources();group=find();}
        if(!group)return;
        group.open=true;
        const target=fieldId?group.querySelector(`[data-detail-input][value="${CSS.escape(fieldId)}"]`)?.closest('.clab-detail-source-option'):group.querySelector('summary');
        if(!target||!left.clientHeight)return;
        const bounds=left.getBoundingClientRect(),rect=target.getBoundingClientRect(),top=bounds.top+left.clientTop+4,bottom=bounds.top+left.clientTop+left.clientHeight-4;
        if(rect.top<top||rect.bottom>bottom)left.scrollTop+=(rect.top+rect.bottom-top-bottom)/2;
    }
    function syncSourceEye(button,group,action) {
        const allShown=!!group&&group.shown===group.matches.length;
        button.disabled=!group;button.title=action;button.setAttribute('aria-label',action);button.setAttribute('aria-pressed',group?.shown&&!allShown?'mixed':String(allShown));
        button.innerHTML=stackedEye(allShown?eyeShape:hiddenEye);
    }
    function syncSourceControls() {
        const groups=detailInputGroups(cards,config),outputs=detailOutputGroups(cards,config);
        for(const input of left.querySelectorAll('[data-detail-input]')){
            input.checked=!config.inputs.has(input.dataset.detailInput)||config.inputs.get(input.dataset.detailInput).has(input.value);
            const button=input.closest('.clab-detail-source-option').querySelector('[data-detail-visibility]'),title=button.dataset.detailVisibility,group=groups.get(title),allShown=!!group&&group.shown===group.matches.length;
            const action=group?`在所有卡片中${allShown?'隐藏':'显示'}『${title}』`:'当前展示的卡片中没有同名字段';
            syncSourceEye(button,group,action);
        }
        const chosen=new Map(cards.map(card=>{const areas=card.areas.filter(area=>area.type==='preview');return [card.id,(areas.find(area=>area.id===config.outputs.get(card.id))||areas[0])?.id];}));
        for(const input of left.querySelectorAll('[data-detail-output]')){
            const selectedCover=config.covers.get(input.dataset.detailOutput)?.areaId===input.value;
            input.checked=input.value===chosen.get(input.dataset.detailOutput)||selectedCover;
            input.title=selectedCover?'封面模块，单击取消封面':'选择预览模块';
            const row=input.closest('.clab-detail-source-option'),button=row.querySelector('[data-detail-output-switch]'),title=button.dataset.detailOutputSwitch;
            button.disabled=!outputs.has(title);button.title=`批量应用『${title}』`;button.setAttribute('aria-label',button.title);button.setAttribute('aria-haspopup','menu');button.innerHTML=detailApplyIcon;
            const cover=row.querySelector('[data-detail-cover]'),selected=selectedCover;
            cover.setAttribute('aria-pressed',String(selected));cover.title=selected?'取消独立封面':'设为封面';cover.setAttribute('aria-label',cover.title);cover.classList.toggle('selected',selected);
        }
        for(const input of left.querySelectorAll('[data-detail-task]'))input.checked=config.tasks.has(input.dataset.detailTask);
        left.querySelector('[data-detail-count]').textContent=`${config.tasks.size} 个任务`;
        syncSourceSelection();
    }
    function renderSources() {
        if (!left.querySelector('[data-detail-search]')) left.innerHTML = `<div class="clab-browse-source-head">来源</div><label class="clab-review-field"><input type="search" data-detail-search placeholder="搜索任务或模块" aria-label="搜索明细表来源"></label><div class="clab-browse-source-actions"><button data-detail-select="all">全选</button><button data-detail-select="none">取消</button><small data-detail-count></small></div><div class="clab-browse-source-tree clab-detail-source-tree"></div>`;
        const tree = left.querySelector('.clab-detail-source-tree'), closed = new Set([...tree.querySelectorAll('details:not([open])')].map(el => el.dataset.detailSource));
        const scroll = left.scrollTop, query = config.search.trim().toLowerCase();
        left.querySelector('[data-detail-search]').value = config.search;
        tree.innerHTML = cards.map((card, index) => {
            const title = card.title || `#${index + 1}`, outputs = card.areas.filter(area => area.type === 'preview'), inputs = detailInputs(card);
            if (query && !`${title} ${outputs.map(area => area.title).join(' ')} ${inputs.map(field => field.title).join(' ')}`.toLowerCase().includes(query)) return '';
            return `<details data-detail-source="${esc(card.id)}" ${query || !closed.has(card.id) ? 'open' : ''}><summary><span data-browse-fold data-detail-fold title="展开或折叠任务"></span><input type="checkbox" data-detail-task="${esc(card.id)}" ${config.tasks.has(card.id) ? 'checked' : ''} aria-label="选择任务 ${esc(title)}"><button data-detail-task-name="${esc(card.id)}" class="clab-detail-source-name" title="${esc(title)}">${esc(title)}</button></summary>
                <div class="clab-detail-source-section">输出</div>${outputs.map((area, i) => `<div class="clab-browse-source-row clab-detail-source-option clab-detail-output-row"><button type="button" class="clab-detail-source-visibility clab-detail-source-cover" data-detail-cover="${esc(card.id)}" data-area-id="${esc(area.id)}" ${detailOutputRecords(card,area).length?'':'disabled'}>${detailCoverIcon}</button><label class="clab-detail-source-label"><input type="checkbox" data-detail-output="${esc(card.id)}" value="${esc(area.id)}"><span title="${esc(area.title || `##${i + 1}`)}">${esc(area.title || `##${i + 1}`)}</span><small>${area.history?.length || (area.resultUrl ? 1 : 0)}</small></label><button type="button" class="clab-detail-source-visibility" data-detail-output-switch="${esc(area.title || `##${i + 1}`)}" aria-expanded="false"></button></div>`).join('') || '<p class="clab-review-note">没有输出模块</p>'}
                <div class="clab-detail-source-section">输入 · 多选</div>${inputs.map(field => `<div class="clab-browse-source-row clab-detail-source-option"><label class="clab-detail-source-label"><input type="checkbox" data-detail-input="${esc(card.id)}" value="${esc(field.id)}"><span title="${esc(field.title)}">${esc(field.title)}${field.historical ? '（历史）' : ''}</span></label><button type="button" class="clab-detail-source-visibility" data-detail-visibility="${esc(field.title)}"></button></div>`).join('') || '<p class="clab-review-note">没有输入模块</p>'}</details>`;
        }).join('') || '<p class="clab-review-note">没有匹配的任务或模块</p>';
        syncSourceControls();left.scrollTop = scroll;
    }
    function renderBoard() {
        model = buildDetailCards(cards, config);
        for(const item of model)for(const field of item.fields)config.fieldNames.set(detailFieldKey(item.id,field.id),field.title);
        if (config.active!==null&&!model.some(item => item.id === config.active)) config.active = model[0]?.id || '';
        const active = model.find(item => item.id === config.active);
        if (!active?.fields.some(field => field.id === config.field)) config.field = active?.fields[0]?.id || '';
        const visible = new Set(model.flatMap(item=>item.fields.map(field=>detailFieldKey(item.id,field.id))));
        const hadSelection=config.selectedFields.size>0;
        config.selectedFields=new Set([...config.selectedFields].filter(key=>visible.has(key)));
        if(config.anchor!==null&&(hadSelection||!visible.has(config.anchor))&&!config.selectedFields.size&&config.field){const key=detailFieldKey(config.active,config.field);config.selectedFields.add(key);config.anchor=key;}
        let board = center.querySelector('.clab-detail-board');
        if (!board) { board = document.createElement('div'); board.className = 'clab-detail-board'; center.replaceChildren(board); }
        board.style.setProperty('--detail-columns', config.columns); board.style.setProperty('--detail-row-width', `${config.rowWidth}px`);
        for (const [id, view] of views) if (!model.some(item => item.id === id)) { view.cover?.release();view.cleanup?.(); view.element.remove(); views.delete(id); }
        board.querySelector('.clab-detail-board-empty')?.remove();
        if (!model.length) { const empty = document.createElement('div'); empty.className = 'clab-detail-empty clab-detail-board-empty'; empty.textContent = '请在左侧勾选要展示的任务'; board.append(empty); }
        model.forEach((item, index) => {
            let view = views.get(item.id);
            if (!view) {
                const element = document.createElement('article'); element.className = 'clab-detail-card'; element.tabIndex = 0; element.dataset.detailCard = item.id;
                element.innerHTML = `<header class="clab-detail-title"><strong></strong><span class="clab-detail-history"><button data-detail-pool="cover" aria-label="选择封面记录">${detailCoverIcon}<span></span></button><button data-detail-pool="output" aria-label="选择生成记录">${detailOutputIcon}<span></span></button></span></header><div class="clab-detail-media"></div><div class="clab-detail-data"></div><div class="clab-detail-note"></div>`;
                view = { element, key: null, cleanup: null }; views.set(item.id, view);
            }
            const element = view.element;
            if (board.children[index] !== element) moveModuleDOM(board, element, board.children[index] || null);
            const position = item.records.indexOf(item.record);
            const coverPosition=item.customCover?item.coverRecords.indexOf(item.coverRecord):-1;
            const title=element.querySelector('header strong'),coverButton=element.querySelector('[data-detail-pool="cover"]'),outputButton=element.querySelector('[data-detail-pool="output"]');
            title.textContent=item.title;title.title=item.title;
            coverButton.title=`封面记录 · ${item.customCover?item.coverArea.title||'封面模块':'未设置封面'}`;coverButton.disabled=!item.coverArea;
            coverButton.querySelector('span').textContent=coverPosition<0?'—':`${coverPosition+1}/${item.coverRecords.length}`;
            outputButton.title=`生成记录 · ${item.area?.title||'未选择'}`;outputButton.disabled=!item.area;
            outputButton.querySelector('span').textContent=position<0?'—':`${position+1}/${item.records.length}`;
            const key = item.record?.key || '';
            if (key !== view.key) {
                const mediaKey=detailHistoryKey(item.id,item.area?.id);
                if(!config.media.has(mediaKey))config.media.set(mediaKey,{syntax:!!item.area?.textSyntaxHighlight,markdown:!!item.area?.textPreviewMarkdown});
                const textOptions=config.media.get(mediaKey);
                view.cover?.release();view.cleanup?.(); const host = element.querySelector('.clab-detail-media'); host.innerHTML = detailMediaHTML(item.record,{textOptions});
                view.cleanup = attachDetailMedia(host, item.record, { textOptions, active: () => root.dataset.reviewMode === 'detail' && config.active === item.id&&!pool.isOpen() }); view.cover=attachDetailCover(host);view.key = key;
            }
            view.cover.update(item.coverRecord,item.customCover);
            const data = detailFieldsHTML(item.fields, new Set(item.fields.filter(field=>config.selectedFields.has(detailFieldKey(item.id,field.id))).map(field=>field.id)));
            if (view.data !== data) {
                const host=element.querySelector('.clab-detail-data');host.innerHTML=data;
                for(const field of host.querySelectorAll('[data-detail-field]'))field.insertAdjacentHTML('beforeend',fieldActions);
                view.data=data;
            }
            element.querySelector('.clab-detail-note').textContent = item.current ? '当前参数 · 尚无输出记录' : item.record.snapshot ? '' : '旧记录没有参数快照';
            element.classList.toggle('active', item.id === config.active);
        });
        syncSourceSelection();
    }
    function renderSettings() {
        const { item, field } = selected(), style = field ? detailStyle(config, item.id, field) : null;
        const text = style?.[config.part === 'row' ? 'value' : config.part];
        const spaced=selectedRows().find(({item,field})=>item.fields.at(-1)!==field),gap=spaced?detailStyle(config,spaced.item.id,spaced.field).row.gap:style?.row.gap;
        const block=selectedRows().find(({item,field})=>detailStyle(config,item.id,field).row.layout==='block'),blockGap=block?detailStyle(config,block.item.id,block.field).row.blockGap:style?.row.blockGap;
        const range=detailExportRange(config,model.length);
        right.innerHTML = `<section class="clab-detail-settings-group"><div class="clab-detail-settings-title">卡片布局</div>
            <label class="clab-review-field"><span class="clab-detail-setting-label">整行宽度 <output data-detail-rowWidth-value>${config.rowWidth}px</output></span><input type="range" min="480" max="2560" step="10" data-detail-setting="rowWidth" value="${config.rowWidth}"></label>
            <label class="clab-review-field"><span class="clab-detail-setting-label">卡片列数 <output data-detail-columns-value>${config.columns}</output></span><input type="range" min="1" max="8" step="1" data-detail-setting="columns" value="${config.columns}"></label></section>
            <section class="clab-detail-settings-group"><div class="clab-detail-settings-title">数据样式${field ? ` · ${config.selectedFields.size>1?`已选 ${config.selectedFields.size} 个字段`:esc(field.title)}` : ''}</div>
            ${style ? `<div class="clab-detail-scope">${[['field','仅当前字段'],['name','所有同名字段']].map(([key,label])=>`<label class="clab-review-check"><input type="checkbox" data-detail-setting="scope" value="${key}" ${config.scope===key?'checked':''}>${label}</label>`).join('')}</div>
            <div class="clab-detail-style-target">${[['row','整行'],['key','标题 Key'],['value','内容 Value']].map(([key,label])=>`<button data-detail-part="${key}" aria-pressed="${config.part === key}">${label}</button>`).join('')}</div>
            <div class="clab-detail-style-pair"><label class="clab-review-field">颜色<input type="color" data-detail-style="color" value="${text.color}"></label><label class="clab-review-field">字号<input type="number" min="8" max="48" data-detail-style="size" value="${text.size}"></label></div>
            <div class="clab-detail-style-pair"><label class="clab-review-field" title="文字行高，按字号倍数调整">行距<input type="number" min="0.8" max="4" step="0.1" data-detail-row="lineHeight" value="${style.row.lineHeight}"></label><label class="clab-review-field" title="${spaced?'与下一个字段之间的间距（px）':'最后一个字段没有后续间距'}">字段间距<input type="number" min="0" max="128" step="1" data-detail-row="gap" value="${gap}" ${spaced?'':'disabled'}></label></div>
            <div class="clab-detail-font-buttons">${[['bold','加粗','M7 4h6a4 4 0 0 1 0 8H7zm0 8h7a4 4 0 0 1 0 8H7z'],['italic','斜体','M10 4h8M6 20h8M14 4l-4 16'],['underline','下划线','M6 4v8a6 6 0 0 0 12 0V4M4 21h16'],['strike','删除线','M18 6c-1-2-3-2-5-2-7 0-7 8-1 8s7 8-1 8c-2 0-4 0-5-2M3 12h18']].map(([key,title,path])=>`<button data-detail-toggle="${key}" aria-label="${title}" title="${title}" aria-pressed="${!!text[key]}">${icon(`<path d="${path}"/>`)}</button>`).join('')}</div>
            <div class="clab-review-field"><span>大小写</span>${choices('data-detail-style="case"',[['','原始大小写',icon('<path d="M5 9a8 8 0 1 1-1 7M5 4v5h5"/>')],['upper','全大写',caseIcon('AA')],['lower','全小写',caseIcon('aa')],['capitalize','首字母大写',caseIcon('Aa')]],text.case||'')}</div>
            <div class="clab-review-field"><span>对齐</span>${choices('data-detail-row="align"',[['left','左对齐',icon('<path d="M4 5h16M4 10h10M4 15h16M4 20h10"/>')],['center','居中',icon('<path d="M4 5h16M7 10h10M4 15h16M7 20h10"/>')],['right','右对齐',icon('<path d="M4 5h16M10 10h10M4 15h16M10 20h10"/>')],['justify','双齐末左',icon('<path d="M4 5h16M4 10h16M4 15h16M4 20h10"/>')]],style.row.align)}</div>
            <div class="clab-review-field"><span>数据布局</span><div class="clab-detail-layout-controls">${choices('data-detail-row="layout"',[['inline','行内：Key：Value',icon('<rect x="4" y="7" width="6" height="10" rx="1"/><path d="M14 8h6M14 12h6M14 16h6"/>'),'行内'],['block','块级：Key / Value 分段',icon('<rect x="4" y="4" width="8" height="6" rx="1"/><path d="M4 15h16M4 20h16"/>'),'块级']],style.row.layout)}<label class="clab-review-field clab-detail-block-gap" title="块级布局中 Key 与 Value 之间的间距（px）">间距<input type="number" min="0" max="128" step="1" data-detail-row="blockGap" aria-label="Key 与 Value 间距" value="${blockGap}" ${block?'':'disabled'}></label></div></div>
            <button data-detail-reset>恢复该范围的默认样式</button>` : '<p class="clab-review-note">勾选输入模块后，点击卡片中的字段调整样式。</p>'}
            </section><section class="clab-detail-settings-group"><div class="clab-detail-settings-title">导出</div><div class="clab-review-field"><span>导出范围</span><div class="clab-detail-style-pair"><label class="clab-review-field">起始编号<input type="number" min="1" max="${Math.max(1,model.length)}" step="1" data-detail-setting="exportStart" value="${range.start}" ${model.length?'':'disabled'}></label><label class="clab-review-field">结束编号<input type="number" min="1" max="${Math.max(1,model.length)}" step="1" data-detail-setting="exportEnd" value="${range.end}" ${model.length?'':'disabled'}></label></div></div><p class="clab-review-note">PNG 按当前预览顺序编号，共 ${model.length} 张卡片，包含起止卡片。</p><label class="clab-review-field"><span>放大倍数</span><input type="number" min="1" max="10" step="1" data-detail-setting="exportScale" value="${config.exportScale}"></label>
            <div class="clab-detail-export-buttons"><button data-detail-export="copy" ${exporting||!model.length ? 'disabled' : ''}>复制 PNG</button><button data-detail-export="png" ${exporting||!model.length ? 'disabled' : ''}>下载 PNG</button></div>
            <label class="clab-review-check"><input type="checkbox" data-detail-setting="includeHistory" ${config.includeHistory ? 'checked' : ''}>HTML 包含所选输出的全部历史</label>
            <button data-detail-export="html" ${exporting ? 'disabled' : ''}>打包 HTML</button><p class="clab-review-note">Ctrl/Cmd 加选，Shift 连选字段；方向键切换当前卡片历史。PNG 按当前布局导出范围内的卡片为一张图，使用当前媒体画面。</p></section>`;
    }
    function render() { renderSources(); renderBoard(); renderSettings(); }
    function step(id, delta) {
        const item = model.find(item => item.id === id); if (!item?.records.length) return;
        const index = Math.max(0, Math.min(item.records.length - 1, item.records.indexOf(item.record) + delta));
        config.histories.set(detailHistoryKey(id, item.area.id), item.records[index].key); activate(id); renderBoard(); renderSettings();
    }
    function updateStyle(part, property, value) {
        for(const {item,field} of selectedRows()){
            if(property==='gap'&&item.fields.at(-1)===field)continue;
            if(property==='blockGap'&&detailStyle(config,item.id,field).row.layout!=='block')continue;
            for (const target of part === 'both' ? ['key','value'] : [part]) setDetailStyle(config,item.id,field,target,property,value);
        }
        renderBoard(); save();
    }
    async function exportBoard(kind) {
        if (exporting || !model.length) return;
        exporting = true; renderSettings(); const notice = root.querySelector('.clab-review-notice'); notice.textContent = '正在导出明细表…';
        const settings=structuredClone(config),items=model,board=center.querySelector('.clab-detail-board');
        try {
            const helpers=import('./preview_detail_export.js');
            if (kind === 'copy') {
                if (!navigator.clipboard?.write || !window.ClipboardItem) throw new Error('当前浏览器无法复制图片，可使用下载 PNG');
                const pending=helpers.then(({exportDetailPNG})=>exportDetailPNG(board,settings));
                await navigator.clipboard.write([new ClipboardItem({ 'image/png': pending.then(file=>file.blob) })]);
                notice.textContent=`已按 ${settings.exportScale} 倍复制完整 PNG。`;return;
            }
            const { exportDetailPNG, exportDetailHTML } = await helpers;
            if (kind === 'html') downloadPreviewBlob(await exportDetailHTML(items,settings),'明细表-HTML.zip');
            else {
                const file = await exportDetailPNG(board,settings);downloadPreviewBlob(file.blob,file.name);
                notice.textContent = `已按 ${settings.exportScale} 倍导出完整 PNG。`; return;
            }
            notice.textContent = 'HTML 打包完成。';
        } catch (error) { notice.textContent = `导出失败：${error.message}`; }
        finally { exporting = false; if (root.dataset.reviewMode === 'detail') renderSettings(); }
    }
    root.addEventListener('pointerdown', event => {
        if (root.dataset.reviewMode !== 'detail') return;
        if(applyMenu&&!applyMenu.contains(event.target)&&!event.target.closest('[data-detail-output-switch]'))closeApplyMenu();
        if(pool.isOpen())return;
        if(event.target.closest('[data-detail-hide]')){event.preventDefault();return;}
        if(blank(event.target))return;
        const card = event.target.closest('[data-detail-card]');
        if (card) {activate(card.dataset.detailCard);if(!event.target.closest('[data-detail-field],.clab-detail-title'))locateSource(card.dataset.detailCard);}
        if(event.target.closest('[data-detail-field]')&&(event.ctrlKey||event.metaKey||event.shiftKey)){event.preventDefault();window.getSelection()?.removeAllRanges();}
    }, true);
    root.addEventListener('click', event => {
        if (root.dataset.reviewMode !== 'detail') return;
        if(event.target.closest('.clab-detail-pool-popover'))return;
        if(blank(event.target)){
            config.active=null;config.field='';config.selectedFields.clear();config.anchor=null;syncSelection();renderSettings();window.getSelection()?.removeAllRanges();
            if(center.contains(document.activeElement))document.activeElement.blur();
            return;
        }
        const header=event.target.closest('.clab-detail-title');
        if(header&&!event.target.closest('.clab-detail-history')){
            config.active=header.closest('[data-detail-card]').dataset.detailCard;config.field='';config.selectedFields.clear();config.anchor=null;
            syncSelection();renderSettings();locateSource(config.active);return;
        }
        const target = event.target.closest('button,[data-detail-fold],[data-detail-field]'); if (!target) return;
        if (target.matches('[data-detail-fold]')) { const group=target.closest('details');group.open=!group.open;event.preventDefault();return; }
        if (target.matches('[data-detail-task-name]')) { const id=target.dataset.detailTaskName;config.tasks.has(id)?config.tasks.delete(id):config.tasks.add(id);render();return; }
        if (target.matches('[data-detail-select]')) { config.tasks=target.dataset.detailSelect==='all'?new Set(cards.map(card=>card.id)):new Set();render();return; }
        if(target.matches('[data-detail-visibility]')){
            const group=detailInputGroups(cards,config).get(target.dataset.detailVisibility);if(!group)return;
            const show=group.shown<group.matches.length;
            for(const {card,field} of group.matches)setDetailInputVisible(config,card,field.id,show);
            syncSourceControls();renderBoard();renderSettings();return;
        }
        if(target.matches('[data-detail-output-switch]')){
            const wasOpen=target.getAttribute('aria-expanded')==='true';closeApplyMenu();if(wasOpen)return;
            applyMenu=document.createElement('div');applyMenu.className='clab-detail-apply-menu';applyMenu.setAttribute('role','menu');applyMenu.dataset.title=target.dataset.detailOutputSwitch;
            applyMenu.dataset.cardId=target.closest('[data-detail-source]').dataset.detailSource;applyMenu.dataset.areaId=target.closest('.clab-detail-source-option').querySelector('[data-detail-output]').value;
            const covered=detailCoverApplied(cards,config,target.dataset.detailOutputSwitch,applyMenu.dataset);
            applyMenu.innerHTML=`<button role="menuitem" data-detail-apply-role="output">应用到所有任务</button><button role="menuitem" data-detail-apply-role="${covered?'clear-cover':'cover'}">${covered?'取消所有任务封面':'应用到所有任务封面'}</button>`;
            root.append(applyMenu);const rect=target.getBoundingClientRect();applyMenu.style.left=`${Math.max(8,Math.min(window.innerWidth-applyMenu.offsetWidth-8,rect.right))}px`;applyMenu.style.top=`${Math.max(8,Math.min(window.innerHeight-applyMenu.offsetHeight-8,rect.bottom))}px`;target.setAttribute('aria-expanded','true');applyMenu.firstElementChild.focus({preventScroll:true});return;
        }
        if(target.matches('[data-detail-apply-role]')){apply(applyMenu.dataset.title,target.dataset.detailApplyRole,{cardId:applyMenu.dataset.cardId,areaId:applyMenu.dataset.areaId});return;}
        if(target.matches('[data-detail-cover]')){
            const card=cards.find(card=>card.id===target.dataset.detailCover),area=card.areas.find(area=>area.id===target.dataset.areaId);
            if(config.covers.get(card.id)?.areaId===area.id)config.covers.delete(card.id);else setDetailCover(config,card,area);
            syncSourceControls();renderBoard();renderSettings();return;
        }
        const card = target.closest('[data-detail-card]');
        if(target.matches('[data-detail-pool]')){
            const item=model.find(item=>item.id===card.dataset.detailCard);closeApplyMenu();views.get(item.id)?.cover.pause();pool.open(item,target.dataset.detailPool,target);return;
        }
        if(target.matches('[data-detail-hide]')){
            const fieldId=target.closest('[data-detail-field]').dataset.detailField,item=model.find(item=>item.id===card.dataset.detailCard),field=detailInputs(item.card).find(field=>field.id===fieldId);
            const matches=target.dataset.detailHide==='name'?detailInputGroups(cards,config).get(field.title).matches:[{card:item.card,field}];
            for(const {card,field} of matches){
                setDetailInputVisible(config,card,field.id,false);
                const key=detailFieldKey(card.id,field.id);config.selectedFields.delete(key);
                if(config.anchor===key)config.anchor=null;
                if(config.active===card.id&&config.field===field.id)config.field='';
            }
            if(!config.selectedFields.size)config.anchor=null;
            syncSourceControls();renderBoard();renderSettings();locateSource(item.id,fieldId);return;
        }
        if (target.matches('[data-detail-field]')) {
            const key=detailFieldKey(card.dataset.detailCard,target.dataset.detailField),add=event.ctrlKey||event.metaKey;
            const ordered=model.flatMap(item=>item.fields.map(field=>detailFieldKey(item.id,field.id)));
            if(event.shiftKey&&ordered.includes(config.anchor)){
                const a=ordered.indexOf(config.anchor),b=ordered.indexOf(key),range=ordered.slice(Math.min(a,b),Math.max(a,b)+1);
                config.selectedFields=new Set(add?[...config.selectedFields,...range]:range);
            }else{
                if(add)config.selectedFields.has(key)?config.selectedFields.delete(key):config.selectedFields.add(key);
                else config.selectedFields=new Set([key]);
                config.anchor=key;
            }
            config.active=card.dataset.detailCard;config.field=target.dataset.detailField;syncSelection();renderSettings();locateSource(config.active,config.field);return;
        }
        if (target.matches('[data-detail-part]')) { config.part=target.dataset.detailPart;renderSettings();return; }
        if (target.matches('[data-detail-toggle]')) { const {item,field}=selected();const style=detailStyle(config,item.id,field);const part=config.part==='row'?'both':config.part;updateStyle(part,target.dataset.detailToggle,!style[config.part==='row'?'value':config.part][target.dataset.detailToggle]);renderSettings();return; }
        if (target.matches('button[data-detail-style],button[data-detail-row]')) {
            updateStyle(target.hasAttribute('data-detail-row')?'row':config.part==='row'?'both':config.part,target.dataset.detailRow||target.dataset.detailStyle,target.dataset.value);renderSettings();return;
        }
        if (target.matches('[data-detail-reset]')) {
            for(const {item,field} of selectedRows()){
                delete config.styles[config.scope==='name'?`name:${field.title}`:detailFieldKey(item.id,field.id)];
                if(config.scope==='name')for(const [key,title] of config.fieldNames)if(title===field.title)delete config.styles[key];
            }
            renderBoard();renderSettings();save();return;
        }
        if (target.matches('[data-detail-export]')) void exportBoard(target.dataset.detailExport);
    });
    root.addEventListener('input', event => {
        if (root.dataset.reviewMode !== 'detail') return; const target=event.target;
        if (target.matches('[data-detail-search]')) {config.search=target.value;renderSources();return;}
        if (target.matches('[data-detail-setting="columns"],[data-detail-setting="rowWidth"]')) {
            const key=target.dataset.detailSetting;config[key]=Number(target.value);renderBoard();right.querySelector(`[data-detail-${key}-value]`).textContent=`${config[key]}${key==='rowWidth'?'px':''}`;
        }
        if (target.matches('[data-detail-style="color"]')) updateStyle(config.part==='row'?'both':config.part,'color',target.value);
    });
    root.addEventListener('change', event => {
        if (root.dataset.reviewMode !== 'detail') return; const target=event.target;
        if (target.matches('[data-detail-task]')) target.checked?config.tasks.add(target.dataset.detailTask):config.tasks.delete(target.dataset.detailTask);
        else if (target.matches('[data-detail-output]')) {
            const id=target.dataset.detailOutput;
            if(config.covers.get(id)?.areaId===target.value)config.covers.delete(id);
            else{rememberHistories();config.outputs.set(id,target.value);config.tasks.add(id);}
            syncSourceControls();renderBoard();renderSettings();return;
        }
        else if (target.matches('[data-detail-input]')) {
            setDetailInputVisible(config,cards.find(card=>card.id===target.dataset.detailInput),target.value,target.checked);
            syncSourceControls();renderBoard();renderSettings();return;
        } else if (target.matches('[data-detail-setting]')) {
            const key=target.dataset.detailSetting;
            if(key==='includeHistory')config.includeHistory=target.checked;
            else if(key==='scope')config.scope=target.value;
            else if(key==='exportStart'||key==='exportEnd'){const value=Math.max(1,Math.min(model.length||1,Math.trunc(Number(target.value)||1)));config[key]=key==='exportEnd'&&value===model.length?null:value;}
            else {const limits={rowWidth:[480,2560,960],columns:[1,8,3],exportScale:[1,10,3]},[min,max,fallback]=limits[key];config[key]=Math.max(min,Math.min(max,Math.round(Number(target.value)||fallback)));}
            save();
        } else if (target.matches('[data-detail-style]')) { const key=target.dataset.detailStyle;updateStyle(config.part==='row'?'both':config.part,key,key==='size'?Math.max(8,Math.min(48,Number(target.value)||12)):target.value); }
        else if (target.matches('[data-detail-row]')) {
            const key=target.dataset.detailRow;
            updateStyle('row',key,key==='lineHeight'?Math.max(.8,Math.min(4,Number(target.value)||1.6)):['gap','blockGap'].includes(key)?Math.max(0,Math.min(128,Number(target.value)||0)):target.value);
        }
        else return;
        render();
    });
    document.addEventListener('keydown', event => {
        if (!root.classList.contains('visible') || root.dataset.reviewMode !== 'detail' || pool.isOpen()||typing(event.target) || typing(document.activeElement) || event.ctrlKey || event.metaKey || event.altKey || event.isComposing || event.defaultPrevented) return;
        if (event.key==='ArrowLeft'||event.key==='ArrowRight') {event.preventDefault();step(config.active,event.key==='ArrowLeft'?-1:1);}
    });
    return {
        open(nextCards) { cards=nextCards;pool.close();closeApplyMenu();config.tasks=new Set(cards.map(card=>card.id));config.outputs.clear();config.covers.clear();config.inputs.clear();config.histories.clear();config.media.clear();config.search='';config.active='';config.field='';config.selectedFields.clear();config.anchor='';config.scope='name';config.exportStart=1;config.exportEnd=null;config.fieldNames=new Map(cards.flatMap(card=>detailInputs(card).map(field=>[detailFieldKey(card.id,field.id),field.title]))); },
        render(nextCards) {cards=nextCards;render();},
        release() { pool.close();closeApplyMenu();for (const view of views.values()){view.cover?.release();view.cleanup?.();}views.clear();save(); },
    };
}

export function injectDetailStyles() {
    if (document.getElementById('clab-detail-styles')) return;
    const style=document.createElement('style');style.id='clab-detail-styles';style.textContent=DETAIL_CSS+DETAIL_POOL_CSS+`
        .clab-preview-modal[data-review-mode=detail] .clab-preview-modal-center{display:block;overflow:auto;padding:0;overscroll-behavior:contain}
        .clab-detail-source-section{margin:5px 0 0 18px;color:#777;font:10px/1.5 sans-serif}.clab-detail-source-name{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:left;border:0;background:transparent;color:#bbb;padding:0;cursor:pointer}
        .clab-detail-source-active{background:#242424;border-radius:3px}.clab-detail-source-current{background:#303030;border-radius:3px}
        .clab-detail-field{position:relative}.clab-detail-field-actions{position:absolute;top:0;right:0;z-index:1;display:flex;gap:2px;padding:1px;border-radius:3px;background:#202020;white-space:normal;opacity:0;pointer-events:none;transition:opacity .12s}
        .clab-detail-field:hover>.clab-detail-field-actions,.clab-detail-field:focus-visible>.clab-detail-field-actions,.clab-detail-field-actions:focus-within{opacity:1;pointer-events:auto}
        .clab-detail-field-actions button{display:flex;align-items:center;justify-content:center;width:22px;height:22px;margin:0;padding:0;border:0;border-radius:3px;background:transparent;color:#999;cursor:pointer}.clab-detail-field-actions button:hover{color:#fff;background:#303030}.clab-detail-field-actions button:focus-visible{outline:1px solid #888;outline-offset:-1px}.clab-detail-field-actions svg{width:16px;height:16px;pointer-events:none}
        .clab-detail-source-label{display:flex;align-items:center;gap:6px;flex:1;min-width:0;cursor:pointer}.clab-detail-source-label>span{min-width:0;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .clab-detail-output-row{margin-left:0!important;gap:4px}.clab-preview-modal-left .clab-detail-source-cover{width:16px;flex-basis:16px}.clab-preview-modal-left .clab-detail-source-cover.selected{opacity:1;pointer-events:auto;color:#ddd}
        .clab-detail-output-row input[data-detail-output]{appearance:none;display:grid;place-content:center;width:13px;height:13px;margin:0;flex:none;border:1px solid #777;border-radius:50%;background:transparent;cursor:pointer}.clab-detail-output-row input[data-detail-output]:checked{border-color:#9ab6c8}.clab-detail-output-row input[data-detail-output]:checked::after{content:'';width:7px;height:7px;border-radius:50%;background:#9ab6c8}.clab-detail-output-row input[data-detail-output]:focus-visible{outline:1px solid #aaa;outline-offset:2px}
        .clab-preview-modal-left .clab-detail-source-visibility{display:flex;align-items:center;justify-content:center;width:20px;height:20px;flex:0 0 20px;padding:0;border:0;border-radius:3px;background:transparent;color:#999;opacity:0;pointer-events:none;cursor:pointer;transition:opacity .12s,color .12s}.clab-detail-source-visibility svg{width:16px;height:16px;pointer-events:none}
        .clab-detail-source-option:hover .clab-detail-source-visibility,.clab-detail-source-option .clab-detail-source-visibility:focus-visible{opacity:1;pointer-events:auto}.clab-preview-modal-left .clab-detail-source-visibility:hover{background:#292929;color:#fff}.clab-detail-source-visibility:focus-visible{outline:1px solid #777;outline-offset:1px}.clab-preview-modal-left .clab-detail-source-visibility:disabled{cursor:default;opacity:0}.clab-detail-source-option:hover .clab-detail-source-visibility:disabled{opacity:.3}
        @media(hover:none){.clab-preview-modal-left .clab-detail-source-visibility,.clab-detail-field-actions{opacity:1;pointer-events:auto}.clab-preview-modal-left .clab-detail-source-visibility:disabled{opacity:.3}}
        .clab-detail-style-pair{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:12px}.clab-detail-settings-group .clab-detail-style-pair .clab-review-field{flex-direction:row;align-items:center;white-space:nowrap}.clab-detail-style-pair input{flex:1;width:0;min-width:0;height:30px;box-sizing:border-box}.clab-detail-style-pair input[type=color]{padding:2px;border:1px solid #444;background:#242424}.clab-detail-style-pair input:disabled{opacity:.35}
        .clab-preview-modal-right [data-detail-setting][type=range]{appearance:none;width:100%;height:14px;padding:0;margin:0;background:linear-gradient(#555,#555) center/100% 3px no-repeat;border:0;border-radius:2px;cursor:pointer}.clab-preview-modal-right [data-detail-setting][type=range]::-webkit-slider-thumb{appearance:none;width:10px;height:10px;background:#aaa;border-radius:50%}.clab-preview-modal-right [data-detail-setting][type=range]::-moz-range-thumb{width:10px;height:10px;background:#aaa;border:0;border-radius:50%}
        .clab-detail-font-buttons,.clab-detail-icon-buttons,.clab-detail-export-buttons{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.clab-detail-style-target{display:flex;align-items:center;align-self:flex-start;gap:14px}.clab-detail-style-target button{padding:0 0 6px;border:0;border-bottom:2px solid transparent;border-radius:0;background:transparent;color:#999;font-size:11px;font-weight:600;line-height:1.5;text-align:left;white-space:nowrap;cursor:pointer}.clab-detail-style-target button:hover{color:#fff}
        .clab-preview-modal-right :is([data-detail-export],[data-detail-reset],[data-detail-toggle],.clab-detail-icon-buttons button){border:1px solid #444;background:#292929;border-radius:4px;color:#bbb;padding:5px 8px;cursor:pointer}
        .clab-preview-modal-right [data-detail-export]{flex:1}.clab-detail-settings-group{display:flex;flex-direction:column;gap:12px}.clab-detail-settings-group+.clab-detail-settings-group{margin-top:20px;padding-top:20px;border-top:2px solid #111}.clab-detail-settings-title{color:#aaa;font-size:14px;font-weight:600}
        .clab-detail-settings-group :is(.clab-review-field,.clab-review-check,.clab-review-note,.clab-detail-style-target){margin:0}.clab-detail-settings-group .clab-review-field{gap:6px}
        .clab-detail-setting-label{display:flex;justify-content:space-between;align-items:center;gap:10px}.clab-detail-setting-label output{color:#aaa;font-variant-numeric:tabular-nums}
        .clab-detail-scope{display:flex;align-items:center;gap:12px}.clab-detail-scope label{white-space:nowrap;flex-shrink:0}
        .clab-preview-modal[data-review-mode=detail] .clab-preview-modal-right{font:11px/1.5 sans-serif}.clab-detail-settings-group :is(.clab-review-field,.clab-review-check,.clab-review-note,button,input,output){font-size:11px}
        .clab-preview-modal-right :is(.clab-detail-font-buttons,.clab-detail-icon-buttons) button{display:inline-flex;align-items:center;justify-content:center;flex:0 0 32px;width:32px;height:32px;padding:0;min-width:0;box-sizing:border-box}
        .clab-detail-font-buttons svg,.clab-detail-icon-buttons svg{width:20px;height:20px;flex-shrink:0}.clab-detail-font-buttons svg{stroke-width:2}.clab-preview-modal-right .clab-detail-icon-buttons button.clab-detail-labelled-option{flex:0 0 auto;width:auto;gap:6px;padding:0 10px}
        .clab-preview-modal-right :is(.clab-detail-font-buttons,.clab-detail-icon-buttons) button:hover{color:#fff}.clab-preview-modal-right :is([data-detail-toggle],.clab-detail-icon-buttons button)[aria-pressed=true]{background:#151515;color:#fff;border-color:#555}.clab-detail-style-target button[aria-pressed=true]{color:#fff;border-bottom-color:currentColor}
        .clab-detail-layout-controls{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.clab-detail-layout-controls .clab-detail-icon-buttons{gap:6px;flex-wrap:nowrap}.clab-preview-modal-right .clab-detail-layout-controls button.clab-detail-labelled-option{gap:4px;padding:0 4px}
        .clab-detail-settings-group .clab-detail-block-gap{flex-direction:row;align-items:center;gap:4px;white-space:nowrap}.clab-detail-block-gap input{width:42px;height:32px;padding:2px;box-sizing:border-box}.clab-detail-block-gap input:disabled{opacity:.35}
    `;document.head.append(style);
}
