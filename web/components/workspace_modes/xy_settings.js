import { app } from '../../../../scripts/app.js';
import { escapeHtml as esc } from '../contextmenu/content/shared.js';
import { nodeName } from './parameters.js';

export function bindingButton(key,bindings,parameters,label='') {
    const keys=bindings.filter(Boolean),output=key==='output';
    const names=keys.map(key=>output?nodeName(app.graph?.getNodeById(key)):parameters.find(parameter=>parameter.key===key)?.label||`${nodeName(app.graph?.getNodeById(key.split('||')[0]))} · ${key.split('||')[1]}`);
    const summary=names.join('；')||(output?'未绑定输出':'未绑定');
    const title=keys.map((key,index)=>`[${key.split('||')[0]}] ${names[index]}`).join('\n');
    return `<button type="button" class="clab-xy-binding" data-xy-bind="${esc(key)}" aria-haspopup="dialog" aria-expanded="false" title="${esc(title||'点击设置绑定')}">${label?`<b>${label}</b> `:''}<span>${esc(summary)}</span><span>▾</span></button>`;
}

export function xyRunLabel(xy,selected) {
    if(selected)return `▶ 运行选中 · ${selected} 项`;
    const count=xy.x.values.length*xy.y.values.length*(xy.z?.enabled&&!xy.z.values.length?0:1);
    return `▶ 运行 · ${count} 项`;
}
export function xyToolbar(xy,selected) {
    const icon=path=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
    return `<div class="clab-xy-origin-switch" role="group" aria-label="坐标轴类型"><button type="button" data-xy-origin="bottom" title="Y 轴向上" aria-label="Y 轴向上" aria-pressed="${xy.origin==='bottom'}">${icon('<path d="M5 21V5m0 14h16M2 8l3-3 3 3m10 8 3 3-3 3"/>')}</button><button type="button" data-xy-origin="top" title="Y 轴向下" aria-label="Y 轴向下" aria-pressed="${xy.origin==='top'}">${icon('<path d="M5 3v16m0-14h16M2 16l3 3 3-3M18 2l3 3-3 3"/>')}</button></div>
        <button type="button" data-xy-reassign title="交换 XYZ 轴参数" aria-label="交换 XYZ 轴参数" aria-haspopup="dialog" aria-expanded="false">${icon('<path d="M3 7h18m-4-4 4 4-4 4M21 17H3m4-4-4 4 4 4"/>')}</button>
        <button type="button" data-xy-records title="附加记录参数" aria-label="附加记录参数" aria-haspopup="dialog" aria-expanded="false">${icon('<rect x="5" y="5" width="14" height="16" rx="2"/><path d="M9 3h6v4H9zM9 12h6m-6 4h6"/>')}</button>
        <button type="button" data-xy-reset title="恢复视角" aria-label="恢复视角">${icon('<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/><rect x="8" y="8" width="8" height="8" rx="1"/>')}</button>
        <div class="clab-xy-run-group"><button type="button" data-xy-run class="clab-xy-run">${xyRunLabel(xy,selected)}</button>${xy.z.enabled?`<button type="button" data-xy-run-options class="clab-xy-run" title="更多运行选项" aria-label="更多运行选项" aria-haspopup="menu" aria-expanded="false">${icon('<path d="m6 14 6-6 6 6"/>')}</button>`:''}</div>`;
}
