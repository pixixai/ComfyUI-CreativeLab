import { app } from '../../../../scripts/app.js';
import { escapeHtml as esc } from '../contextmenu/content/shared.js';
import { xyTilingControls } from './xy_tiling.js';
import { nodeName } from './parameters.js';

export function bindingButton(key,bindings,parameters,label='') {
    const keys=bindings.filter(Boolean),output=key==='output';
    const names=keys.map(key=>output?nodeName(app.graph?.getNodeById(key)):parameters.find(parameter=>parameter.key===key)?.label||`${nodeName(app.graph?.getNodeById(key.split('||')[0]))} · ${key.split('||')[1]}`);
    const summary=names.join('；')||(output?'未绑定输出':'未绑定');
    const title=keys.map((key,index)=>`[${key.split('||')[0]}] ${names[index]}`).join('\n');
    return `<button type="button" class="clab-xy-binding" data-xy-bind="${esc(key)}" aria-haspopup="dialog" aria-expanded="false" title="${esc((title||'点击设置绑定')+'\n左键：设置绑定；中键（按下滚轮）：拾取节点或参数')}">${label?`<b>${label}</b> `:''}<span>${esc(summary)}</span><span>▾</span></button>`;
}

export const xyOriginLabels = { bottom: 'Y 轴向上', top: 'Y 轴向下' };
export const xyRunAxisLabels = { x: 'X 轴优先', y: 'Y 轴优先' };

export function xyRunLabel(xy, selected) {
    if (selected) return `运行选中 · ${selected} 项`;
    const count = xy.x.values.length * xy.y.values.length * (xy.z?.enabled && !xy.z.values.length ? 0 : 1);
    return `运行 · ${count} 项`;
}

export function xyToolbar(xy) {
    const button = (key, label, title, path, menu = 'dialog', textOnly = false) => {
        const graphic = path ? `<span class="clab-tool-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg></span>` : '';
        return `<button type="button" class="clab-tool-button${menu ? ' clab-tool-menu-button' : ''}${textOnly ? ' clab-xy-choice' : ''}" data-xy-${key} title="${title}" aria-label="${title}" ${menu ? `aria-haspopup="${menu}" aria-expanded="false"` : ''}>${graphic}<span class="clab-tool-label">${label}</span></button>`;
    };
    return `<div class="clab-xy-toolbar-start">${button('reset', '恢复视角', '恢复视角', '<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13 0h5v-5"/><rect x="8" y="8" width="8" height="8" rx="1"/>', '')}</div><div class="clab-xy-toolbar-center">`+[
        button('origin-options', xyOriginLabels[xy.origin], xyOriginLabels[xy.origin], '', 'menu', true),
        button('run-axis-options', xyRunAxisLabels[xy.runAxis], xyRunAxisLabels[xy.runAxis], '', 'menu', true),
        button('reassign', '交换轴', '交换 XYZ 轴参数', '<path d="M9 15V3m0 12 12-1M9 15l-6 7M7 5l2-2 2 2m8 7 2 2-2 2M3 19v3h3"/><g stroke-width="1.2"><path d="m18 4 3 4m0-4-3 4M3 4l2 2 2-2M5 6v3M13 19h4l-4 4h4"/></g>'),
        button('records', '附加参数', '附加记录参数', '<rect x="5" y="5" width="14" height="16" rx="2"/><path d="M9 3h6v4H9zM9 12h6m-6 4h6"/>'),
        xyTilingControls(xy),
    ].join('')+'</div>';
}
