const icon=path=>`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
export const cellSettingsIcon=icon('<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 8h8v8H8zM12 3v3m0 12v3M3 12h3m12 0h3"/>');
export const tableSelectAllIcon = icon('<rect x="4" y="4" width="16" height="16" rx="2"/><path d="m8 12 3 3 5-6"/>');
export const tableResetIcon=icon('<path d="M4 10a8 8 0 1 1 2 8M4 4v6h6"/>');
export function cellAlignmentHTML(value=0) {
    return `<div class="clab-xy-label-anchor" role="group" aria-label="单元格内容对齐">${['左上','上中','右上','左中','中心','右中','左下','下中','右下'].map((name,index)=>`<button type="button" data-table-align="${index}" title="${name}" aria-label="${name}" aria-pressed="${index===value}"></button>`).join('')}</div>`;
}
