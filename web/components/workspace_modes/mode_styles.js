import { xyStyles } from './xy_styles.js';
import { tableStyles } from './table_styles.js';

export function injectWorkspaceModeStyles() {
    if(document.getElementById('clab-workspace-mode-styles'))return;
    const style=document.createElement('style');style.id='clab-workspace-mode-styles';style.textContent=`
        #clab-panel [hidden]{display:none!important}
        .clab-cards-wrapper[data-clab-virtualized=cards] .clab-area:is([data-clab-virtual],[data-clab-deferred]){box-sizing:border-box;height:var(--clab-virtual-height,148px);min-height:var(--clab-virtual-height,148px);flex-shrink:0}
        .clab-cards-wrapper[data-clab-virtualized=cards] .clab-card-body{overflow-anchor:none}
        .clab-cards-wrapper[data-clab-virtualized=xy] .clab-output-area:is([data-clab-virtual],[data-clab-deferred]){height:var(--xy-media-height,320px);min-height:0}
        .clab-virtual-summary{position:absolute;inset:0;overflow:hidden;display:grid;place-items:center;background:#202020;color:#888;font:12px sans-serif;pointer-events:none}
        .clab-virtual-summary img{width:100%;height:100%;object-fit:contain;display:block}.clab-virtual-summary span{max-width:90%;overflow:hidden;text-overflow:ellipsis;max-height:54px}
        .clab-workspace-tab[data-workspace-id]{display:grid;grid-template-columns:20px minmax(0,1fr) 20px;padding:0}
        .clab-workspace-tab.active[data-workspace-id]{display:flex;max-width:220px}
        .clab-workspace-tab > button{height:100%;border:0;background:transparent;color:inherit;font:inherit;cursor:pointer}
        .clab-workspace-tab-select{grid-column:2;display:flex;align-items:center;justify-content:center;min-width:0;padding:0}
        .clab-workspace-tab.active .clab-workspace-tab-select{padding:0 10px 0 14px}
        .clab-workspace-tab > [data-mode-toggle]{grid-column:3;display:grid;place-items:center;flex:none;width:20px;padding:0 5px 0 0;visibility:hidden}
        .clab-workspace-tab:is(.active,:hover,:focus-within) > [data-mode-toggle],.clab-workspace-tab > [data-mode-toggle][aria-expanded=true]{visibility:visible}
        .clab-workspace-tab > [data-mode-toggle]::before{content:"";width:7px;height:5px;background:currentColor;clip-path:polygon(0 0,100% 0,50% 100%)}
        .clab-workspace-tab-mode{display:none}
        .clab-workspace-tab.active > [data-mode-toggle]{position:relative;width:auto;height:calc(100% - 6px);margin-right:3px;padding:0 12px 0 10px;border-radius:3px;background:#131313;white-space:nowrap;color:#bbb}
        .clab-workspace-tab.active > [data-mode-toggle]::before{position:absolute;left:0;top:25%;width:1px;height:50%;background:#ffffff30;clip-path:none}
        .clab-workspace-tab.active > [data-mode-toggle]::after{content:"";position:absolute;right:2px;bottom:2px;width:4px;height:4px;background:currentColor;clip-path:polygon(100% 0,100% 100%,0 100%);pointer-events:none}
        .clab-workspace-tab.active > [data-mode-toggle]:is(:hover,[aria-expanded=true]){background:#0e0e0e;color:#fff}
        .clab-workspace-tab.active .clab-workspace-tab-mode{display:block}
        .clab-workspace-tab > [data-mode-toggle]:hover{color:#fff}
        .clab-workspace-tab > button:focus-visible{outline:1px solid #a0c9e8;outline-offset:-2px}
        .clab-workspace-strip:has(.clab-mode-menu:not([hidden])){z-index:71}
        .clab-mode-menu[hidden]{display:none}.clab-mode-menu{position:absolute;top:calc(100% + 6px);left:4px;width:142px;background:#242424;border:1px solid #444;border-radius:5px;padding:5px;display:flex;flex-direction:column;gap:2px}
        :root[data-clab-workspace-tabs=bottom] .clab-mode-menu{top:auto;bottom:calc(100% + 6px)}
        .clab-mode-menu button{border:0;background:transparent;color:#aaa;text-align:left;padding:8px 10px;cursor:pointer;border-radius:3px;font:12px sans-serif}
        .clab-mode-menu button[aria-checked=true],.clab-mode-menu button:hover{background:#151515;color:#fff}
        .clab-mode-menu button:disabled{opacity:.35;cursor:default;background:transparent;color:#888}
        #clab-panel[data-workspace-mode]:not([data-workspace-mode=cards]) .clab-card{min-width:0!important;max-width:none!important;height:auto!important;transition:none}
        #clab-panel[data-workspace-mode]:not([data-workspace-mode=cards]) .clab-card-body{height:auto;max-height:none;overflow:visible;flex:1}
        #clab-panel[data-workspace-mode]:not([data-workspace-mode=cards]) .clab-area-list{margin-bottom:0}
        .clab-mode-controls{color:#aaa;font:12px/1.5 sans-serif;display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin-bottom:16px;position:relative;z-index:35}
        .clab-mode-controls label{display:flex;align-items:center;gap:6px;min-width:0}
        .clab-mode-controls :is(button,select,input,textarea){font:12px/1.5 sans-serif;color:#bbb;background:#242424;border:1px solid #444;border-radius:4px;padding:5px 7px;box-sizing:border-box;max-width:100%}
        .clab-mode-controls button,.clab-mode-controls summary{cursor:pointer}.clab-mode-controls button:hover{color:#fff;background:#303030}
        .clab-mode-controls select{max-width:240px;min-width:80px}.clab-mode-controls input[type=number]{width:65px}
        .clab-mode-controls small,.clab-mode-hint{color:#888;font-size:11px}.clab-mode-controls input:disabled{opacity:.4}
        .clab-mode-controls textarea{display:block;min-height:70px;resize:vertical;width:100%;margin:8px 0}
        .clab-mode-controls .clab-mode-error{color:#eda58d;flex-basis:100%;white-space:pre-wrap;margin:0}
        .clab-mode-popover{position:relative}.clab-mode-popover>div{position:absolute;left:0;top:calc(100% + 8px);width:300px;max-width:70vw;padding:12px;border:1px solid #444;background:#242424;border-radius:5px;display:flex;flex-direction:column;gap:8px;z-index:40}
        ${xyStyles}
        ${tableStyles}
    `;document.head.append(style);
}
