import { xyStyles } from './xy_styles.js';

export function injectWorkspaceModeStyles() {
    if(document.getElementById('clab-workspace-mode-styles'))return;
    const style=document.createElement('style');style.id='clab-workspace-mode-styles';style.textContent=`
        #clab-panel [hidden]{display:none!important}
        .clab-mode-switch{position:relative;flex:none;display:flex;align-items:stretch;border-right:1px solid #333;z-index:50}
        .clab-mode-switch>button{padding:0 14px;border:0;background:transparent;color:#bbb;font:12px sans-serif;cursor:pointer;white-space:nowrap}
        .clab-mode-menu{position:absolute;bottom:calc(100% + 6px);left:4px;width:142px;background:#242424;border:1px solid #444;border-radius:5px;padding:5px;display:flex;flex-direction:column;gap:2px}
        .clab-mode-menu button{border:0;background:transparent;color:#aaa;text-align:left;padding:8px 10px;cursor:pointer;border-radius:3px;font:12px sans-serif}
        .clab-mode-menu button[aria-checked=true],.clab-mode-menu button:hover{background:#151515;color:#fff}
        #clab-panel[data-workspace-mode=table] #clab-cards-container{display:block;overflow:auto;padding:16px}
        #clab-panel[data-workspace-mode=table] .clab-cards-wrapper{display:grid!important;grid-template-columns:repeat(var(--mode-columns,3),minmax(260px,1fr));gap:16px!important;height:auto!important;width:100%!important;min-width:0!important;margin:0!important;align-items:stretch!important}
        #clab-panel[data-workspace-mode]:not([data-workspace-mode=cards]) .clab-card{min-width:0!important;max-width:none!important;height:auto!important;transition:none}
        #clab-panel[data-workspace-mode=table] .clab-card{width:auto!important}
        #clab-panel[data-workspace-mode]:not([data-workspace-mode=cards]) .clab-card-body{height:auto;max-height:none;overflow:visible;flex:1}
        #clab-panel[data-workspace-mode]:not([data-workspace-mode=cards]) .clab-area-list{margin-bottom:0}
        #clab-panel[data-workspace-mode=table] .clab-area{margin:0;border-radius:0;border-left:0;border-right:0}
        #clab-panel[data-workspace-mode=table] .clab-output-area{border:0}
        #clab-panel[data-workspace-mode=table] .clab-card-body{padding:0}
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
    `;document.head.append(style);
}
