import { openXYPopover, closeXYPopover } from './xy_popover.js';

export function xyTilingControls(xy,preview=false) {
    if(preview)return `<label class="clab-review-check"><input type="checkbox" data-review-xy-tiles${xy.z.display==='all'?' checked':''}><span>平铺所有 Z 层</span></label><div class="clab-xy-tiling-inline"${xy.z.display==='all'?'':' hidden'}>${xyTilingFields(xy)}</div>`;
    const toggle='<button type="button" class="clab-tool-button clab-xy-layer-toggle" data-xy-toggle-layers aria-pressed="false"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="2" y="2" width="6" height="6"/><rect x="12" y="2" width="6" height="6"/><rect x="2" y="12" width="6" height="6"/><rect x="12" y="12" width="6" height="6"/></svg><span class="clab-tool-label">平铺所有 Z 层</span></button>';
    return `<div class="clab-xy-tiling">${toggle}<button type="button" class="clab-tool-button clab-xy-tile-settings" data-xy-tile-settings hidden title="平铺设置" aria-label="平铺设置" aria-haspopup="dialog" aria-expanded="false"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m20.1 13.4 1.5 1.2-1.5 2.6-1.8-.7a8 8 0 0 1-2.4 1.4l-.3 1.9h-3l-.3-1.9a8 8 0 0 1-2.4-1.4l-1.8.7-1.5-2.6 1.5-1.2a8 8 0 0 1 0-2.8L6.6 9.4l1.5-2.6 1.8.7a8 8 0 0 1 2.4-1.4l.3-1.9h3l.3 1.9a8 8 0 0 1 2.4 1.4l1.8-.7 1.5 2.6-1.5 1.2a8 8 0 0 1 0 2.8ZM14.1 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" fill-rule="evenodd" transform="translate(-2)"/></svg></button></div>`;
}

export function openXYTiling(container,getXY,changed) {
    const anchor=()=>container.querySelector('[data-xy-tile-settings]');
    if(anchor()?.getAttribute('aria-expanded')==='true'){closeXYPopover();return;}
    const html=xyTilingFields(getXY());
    const panel=openXYPopover(anchor,'平铺设置',html,'clab-xy-tiling-panel','top',container.closest('#clab-panel,.clab-preview-modal-panel'));
    panel.popup.addEventListener('change',event=>{
        const input=event.target.closest('[data-xy-tiling]');if(!input)return;
        if(applyXYTiling(input,getXY())){changed();panel.position();}
    });
}

export function xyTilingFields(xy) {
    const tiling=xy.tiling||{columns:0,rowGap:240,columnGap:360};
    const fields=[['columns','列数',1,tiling.columns||''],['rowGap','行间距',0,tiling.rowGap],['columnGap','列间距',0,tiling.columnGap]];
    return `<div class="clab-xy-tiling-fields">${fields.map(([key,label,min,value],index)=>`${index===1?'<div class="clab-xy-tiling-spacing">':''}<label>${label}<input type="number" data-xy-tiling="${key}" aria-label="${label}" min="${min}" step="1" value="${value}"${key==='columns'?` placeholder="自动（${Math.ceil(Math.sqrt(Math.max(1,xy.z.values.length)))}）" title="留空时自动排列列数"`:''}></label>${index===2?'</div>':''}`).join('')}</div>`;
}

export function applyXYTiling(input,xy) {
    if(!input.checkValidity()){input.reportValidity();return false;}
    const key=input.dataset.xyTiling,value=key==='columns'&&input.value===''?0:input.valueAsNumber;
    if(!Number.isFinite(value)){input.reportValidity();return false;}
    xy.tiling={columns:0,rowGap:240,columnGap:360,...xy.tiling,[key]:value};return true;
}
