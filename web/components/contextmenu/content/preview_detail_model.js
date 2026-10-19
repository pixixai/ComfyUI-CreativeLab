import { collectPreviewRecords, displayValue } from './preview_records.js';
import { escapeHtml as esc } from './shared.js';

export const detailFieldKey = (cardId, fieldId) => JSON.stringify([cardId, fieldId]);
export const detailHistoryKey = (cardId, areaId) => JSON.stringify([cardId, areaId]);
export const DETAIL_DEFAULT_STYLE = { row: { align: 'left', layout: 'inline', lineHeight: 1.6, gap: 8, blockGap: 0 }, key: { color: '#999999', size: 12 }, value: { color: '#999999', size: 12 } };
export const detailCardWidth = config => (config.rowWidth - (config.columns - 1) * 16) / config.columns;
export function detailExportRange(config,count) {
    const total=Math.max(1,count);
    return { start:Math.max(1,Math.min(total,Math.trunc(Number(config.exportStart)||1))),end:Math.max(1,Math.min(total,Math.trunc(Number(config.exportEnd)||total))) };
}

export function detailInputs(card) {
    const inputs = (card.areas || []).filter(area => area.type === 'edit').map((area, index) => ({ id: String(area.id), title: area.title || `##${index + 1}`, area }));
    for (const output of (card.areas || []).filter(area => area.type === 'preview')) for (const snapshot of output.inputHistorySnapshots || []) for (const field of snapshot || []) {
        const id = String(field.sourceAreaId || `legacy:${field.title || ''}`);
        if (!inputs.some(input => input.id === id || !field.sourceAreaId && input.title === field.title)) inputs.push({ id, title: field.title || '历史输入模块', historical: true });
    }
    return inputs;
}

export function detailInputGroups(cards,config) {
    const groups=new Map();
    for(const card of cards)if(config.tasks.has(card.id))for(const field of detailInputs(card)){
        if(!groups.has(field.title))groups.set(field.title,{matches:[],shown:0});
        const group=groups.get(field.title);group.matches.push({card,field});
        if(!config.inputs.has(card.id)||config.inputs.get(card.id).has(field.id))group.shown++;
    }
    return groups;
}

export function setDetailInputVisible(config,card,fieldId,visible) {
    if(!config.inputs.has(card.id))config.inputs.set(card.id,new Set(detailInputs(card).map(field=>field.id)));
    const selected=config.inputs.get(card.id);
    if(visible)selected.add(fieldId);else selected.delete(fieldId);
}

export function detailOutputGroups(cards,config) {
    const groups=new Map();
    for(const card of cards)if(config.tasks.has(card.id)){
        const outputs=(card.areas||[]).filter(area=>area.type==='preview');
        const selected=outputs.find(area=>area.id===config.outputs.get(card.id))||outputs[0],matches=new Map();
        outputs.forEach((area,index)=>{
            const title=area.title||`##${index+1}`;
            if(!matches.has(title)||area===selected)matches.set(title,area);
        });
        for(const [title,area] of matches){
            if(!groups.has(title))groups.set(title,{matches:[],shown:0});
            const group=groups.get(title);group.matches.push({card,area});
            if(area===selected)group.shown++;
        }
    }
    return groups;
}

export function detailOutputRecords(card,area) {
    return area?collectPreviewRecords([{card,area}]):[];
}

export function setDetailCover(config,card,area,record=detailOutputRecords(card,area).at(-1)) {
    if(!record)return false;
    config.covers.set(card.id,{areaId:area.id,recordKey:record.key});return true;
}

export function detailCoverApplied(cards,config,title,source) {
    let count=0;
    for(const card of cards)if(config.tasks.has(card.id)){
        const outputs=(card.areas||[]).filter(area=>area.type==='preview');
        const matches=outputs.filter((area,index)=>(area.title||`##${index+1}`)===title);
        const selected=config.covers.get(card.id)?.areaId,area=matches.find(area=>card.id===source?.cardId&&area.id===source.areaId)||matches.find(area=>area.id===selected)||matches[0];
        if(!area||!detailOutputRecords(card,area).length)continue;
        if(area.id!==selected)return false;
        count++;
    }
    return count>0;
}

export function applyDetailOutput(cards,config,title,role,source) {
    for(const card of cards)if(config.tasks.has(card.id)){
        const outputs=(card.areas||[]).filter(area=>area.type==='preview');
        const matches=outputs.filter((area,index)=>(area.title||`##${index+1}`)===title);
        const selected=role==='output'?config.outputs.get(card.id):config.covers.get(card.id)?.areaId;
        if(role==='clear-cover'){if(matches.some(area=>area.id===selected))config.covers.delete(card.id);continue;}
        const area=matches.find(area=>card.id===source?.cardId&&area.id===source.areaId)||matches.find(area=>area.id===selected)||matches[0];if(!area)continue;
        if(role==='cover')setDetailCover(config,card,area);
        else {
            config.outputs.set(card.id,area.id);
            if(!config.histories.has(detailHistoryKey(card.id,area.id))){const latest=detailOutputRecords(card,area).at(-1);if(latest)config.histories.set(detailHistoryKey(card.id,area.id),latest.key);}
        }
    }
}

export function detailStyle(config, cardId, field) {
    const rules = [DETAIL_DEFAULT_STYLE, config.styles?.all, config.styles?.[`name:${field.title}`], config.styles?.[detailFieldKey(cardId, field.id)]];
    return Object.fromEntries(['row', 'key', 'value'].map(part => [part, Object.assign({}, ...rules.map(rule => rule?.[part]))]));
}

export function detailFields(card, record, config) {
    const selected = config.inputs.get(card.id);
    return detailInputs(card).filter(field => !selected || selected.has(field.id)).map(field => {
        const snapshot = record?.snapshot;
        const matches = snapshot?.filter(input => input.sourceAreaId ? String(input.sourceAreaId) === field.id : input.title === field.title) || [];
        const input = matches.length === 1 ? matches[0] : null;
        const missing = !!record && !input;
        return { id: field.id, title: input?.title || field.title, value: missing ? '参数未记录' : displayValue(input ? input.value : field.area?.value), missing,
            style: detailStyle(config, card.id, { ...field, title: input?.title || field.title }) };
    });
}

export function buildDetailCards(cards, config) {
    return cards.filter(card => config.tasks.has(card.id)).map(card => {
        const outputs = (card.areas || []).filter(area => area.type === 'preview');
        const area = outputs.find(area => area.id === config.outputs.get(card.id)) || outputs[0];
        const title = card.title || `#${cards.indexOf(card) + 1}`;
        const records = area ? collectPreviewRecords([{ card, area, cardLabel: title }]) : [];
        const chosen = config.histories.get(detailHistoryKey(card.id, area?.id));
        const record = records.find(record => record.key === chosen) || records.find(record => record.index === area?.historyIndex) || records.at(-1) || null;
        const cover=config.covers?.get(card.id),coverArea=outputs.find(area=>area.id===cover?.areaId);
        const coverRecords=coverArea?detailOutputRecords(card,coverArea):records;
        const coverRecord=coverArea?(coverRecords.find(record=>record.key===cover.recordKey)||coverRecords.at(-1)||record):record;
        return { id: card.id, title, card, area, records, record, coverArea:coverArea||area,coverRecords,coverRecord,customCover:!!coverArea&&!!coverRecord,fields: detailFields(card, record, config), current: !record };
    });
}

export function transformDetailText(value, transform) {
    const text = String(value ?? '');
    if (transform === 'upper') return text.toUpperCase();
    if (transform === 'lower') return text.toLowerCase();
    if (transform === 'capitalize') return text.replace(/\p{L}[\p{L}\p{M}'’]*/gu, word => word[0].toUpperCase() + word.slice(1).toLowerCase());
    return text;
}

export function detailTextCSS(style) {
    const color = /^#[0-9a-f]{6}$/i.test(style.color || '') ? style.color : '#999999';
    return `color:${color};font-size:${Math.max(8, Math.min(48, Number(style.size) || 12))}px;font-weight:${style.bold ? 700 : 400};font-style:${style.italic ? 'italic' : 'normal'};text-decoration:${[style.underline && 'underline', style.strike && 'line-through'].filter(Boolean).join(' ') || 'none'}`;
}

export function detailFieldsHTML(fields, selected = new Set()) {
    return fields.map((field,index) => {
        const style = field.style, align = ['left', 'center', 'right', 'justify'].includes(style.row.align) ? style.row.align : 'left';
        const lineHeight=Math.max(.8,Math.min(4,Number(style.row.lineHeight)||1.6)),gap=index<fields.length-1?Math.max(0,Math.min(128,Number(style.row.gap)||0)):0;
        const blockGap=style.row.layout==='block'?Math.max(0,Math.min(128,Number(style.row.blockGap)||0)):0;
        return `<div class="clab-detail-field ${selected.has(field.id) ? 'selected' : ''}" data-detail-field="${esc(field.id)}" tabindex="0" style="font-size:${Math.max(8,Math.min(48,Number(style.value.size)||12))}px;line-height:${lineHeight};margin-bottom:${gap}px;text-align:${align};text-align-last:${align === 'justify' ? 'left' : 'auto'}"><span class="clab-detail-key" style="${detailTextCSS(style.key)};display:${style.row.layout === 'block' ? 'block' : 'inline'};margin-bottom:${blockGap}px">${esc(transformDetailText(field.title, style.key.case))}${style.row.layout === 'block' ? '' : '：'}</span><span class="clab-detail-value" style="${detailTextCSS(style.value)}">${esc(transformDetailText(field.value, style.value.case))}</span></div>`;
    }).join('');
}

export function setDetailStyle(config, cardId, field, part, property, value) {
    const key = config.scope === 'name' ? `name:${field.title}` : detailFieldKey(cardId, field.id);
    config.styles[key] ||= {};
    config.styles[key][part] ||= {};
    config.styles[key][part][property] = value;
    if (config.scope === 'name') for (const other of Object.keys(config.styles)) {
        if (other === key || other === 'all' || other.startsWith('name:')) continue;
        if (config.fieldNames?.get(other) !== field.title) continue;
        if (config.styles[other]?.[part]) delete config.styles[other][part][property];
    }
}

export const DETAIL_CSS = `
.clab-detail-board{display:grid;grid-template-columns:repeat(var(--detail-columns,3),minmax(0,1fr));gap:16px;align-items:stretch;align-content:start;width:calc(var(--detail-row-width,960px) + 32px);margin-inline:auto;padding:16px;box-sizing:border-box;background:#171717;color:#ddd;font-family:Arial,'Microsoft YaHei',sans-serif}
.clab-detail-card{display:flex;flex-direction:column;min-width:0;border:1px solid #3b3b3b;border-radius:7px;background:#202020;overflow:hidden;box-sizing:border-box;outline:none}
.clab-detail-card.active{border-color:#8199aa}.clab-detail-title{display:flex;align-items:center;gap:8px;padding:8px 10px;color:#bbb;font:12px/1.4 Arial,'Microsoft YaHei',sans-serif;min-width:0}
.clab-detail-title strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:500;flex:1}.clab-detail-history{display:flex;align-items:center;gap:5px;color:#888;font-size:10px;white-space:nowrap}
.clab-detail-card .clab-detail-history button{border:0;background:transparent;padding:1px 3px;color:#aaa;cursor:pointer;font:12px sans-serif}.clab-detail-history button:disabled{opacity:.3}
.clab-detail-history button[data-detail-pool]{display:inline-flex;align-items:center;justify-content:center;gap:4px;height:18px;padding:0 2px;color:#999;font-size:10px;line-height:14px}.clab-detail-history button[data-detail-pool]>span{display:block;line-height:14px}.clab-detail-history button[data-detail-pool]:hover{color:#fff}.clab-detail-history svg{display:block;width:14px;height:14px;flex:none}.clab-detail-history:has([data-detail-pool]){gap:10px}
.clab-detail-media{position:relative;flex:none;width:100%;aspect-ratio:var(--detail-media-ratio,1.6);min-height:120px;overflow:hidden;background:#141414}
.clab-detail-media>img,.clab-detail-media>video{position:absolute;inset:0;width:100%;height:100%;display:block;object-fit:contain}.clab-detail-media>.clab-preview-video{position:absolute;inset:0}.clab-detail-media .clab-preview-video-transform{position:absolute;inset:0;transform-origin:center}.clab-detail-media .clab-preview-video-transform video{width:100%;height:100%;object-fit:contain;pointer-events:none}
.clab-detail-media .clab-audio-player{border-radius:0}.clab-detail-media .clab-glb-viewer{height:100%}.clab-detail-media .clab-text-preview-shell{height:100%;min-height:0;display:flex;flex-direction:column;box-sizing:border-box}.clab-detail-media .clab-text-body-scroll{flex:1;min-height:0;overflow:auto!important;max-height:none!important}
.clab-detail-data{padding:10px 12px;min-width:0}.clab-detail-field{padding:0;border-radius:3px;white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.6;outline:none;cursor:text;min-width:0}.clab-detail-field.selected{outline:1px dashed #6e8493;outline-offset:2px}.clab-detail-key,.clab-detail-value{white-space:pre-wrap;overflow-wrap:anywhere}
.clab-detail-note{margin-top:auto;padding:0 12px 9px;color:#888;font:10px/1.5 Arial,'Microsoft YaHei',sans-serif}.clab-detail-note:empty{display:none}.clab-detail-empty{display:flex;align-items:center;justify-content:center;height:100%;padding:12px;box-sizing:border-box;color:#888;font:12px/1.6 sans-serif;text-align:center}
`;
