export function ensureInputFileStyles(){
    if(document.getElementById('clab-input-files-style'))return;
    const style=document.createElement('style');style.id='clab-input-files-style';style.textContent=`
    .clab-custom-select.clab-file-select{cursor:pointer;min-width:0;box-sizing:border-box;display:flex;align-items:center;gap:6px;padding:0 9px!important;height:28px;min-height:28px;font:12px/18px sans-serif;color:#bbb}
    .clab-file-select .clab-upload-filename{cursor:text;flex:1;min-width:0;width:0!important;text-overflow:ellipsis;padding:0!important;outline:0}
    .clab-file-select .clab-upload-filename::placeholder{font:inherit;color:inherit;opacity:.65}
    .clab-file-selection-scope{flex:none;max-width:90px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font:10px/16px sans-serif;color:#888}
    .clab-file-select .clab-custom-select-icon{position:static!important;flex:none;padding:0!important;margin:0!important;pointer-events:auto;font-size:10px}
    .clab-input-files{width:350px;box-sizing:border-box;font:12px/1.5 sans-serif;display:flex;flex-direction:column;gap:8px}
    .clab-input-files>.clab-binding-panel-head{justify-content:flex-start}
    .clab-input-files>.clab-binding-panel-head>span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .clab-input-files .clab-xy-popup-close{margin-left:auto;flex:none}
    .clab-input-files [data-file-refresh]{flex:none;border:0;border-radius:3px;background:transparent;color:#aaa;width:24px;height:24px;padding:0;cursor:pointer;font:16px sans-serif}
    .clab-input-files [data-file-refresh]:hover{background:#ffffff0a;color:#fff}
    .clab-input-files-tree{overflow:auto;max-height:300px;min-height:60px;scrollbar-width:thin;scrollbar-color:#444 transparent}
    .clab-input-file-folder>summary{list-style:none;cursor:pointer;display:flex;align-items:center;gap:6px;padding:4px;min-width:0;border-radius:3px;color:#aaa}
    .clab-input-file-folder>summary::-webkit-details-marker{display:none}
    .clab-input-file-folder>summary:before{content:'';width:7px;height:7px;flex:none;background:currentColor;clip-path:polygon(15% 0,100% 50%,15% 100%);transition:transform .12s}
    .clab-input-file-folder[open]>summary:before{transform:rotate(90deg)}
    .clab-input-file-children{margin-left:7px;padding-left:5px;border-left:1px dashed #ffffff23}
    .clab-input-file-folder>summary span,.clab-input-file-item span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}
    .clab-input-file-item{display:flex!important;align-items:center;gap:6px;width:100%;min-width:0;box-sizing:border-box;padding:4px!important;border:0;border-radius:3px;text-align:left;color:#aaa;background:transparent;cursor:pointer;font:inherit}
    button.clab-input-file-item:before{content:'';width:11px;height:11px;box-sizing:border-box;flex:none;border:1px solid #888;border-radius:50%;margin-left:1px}
    button.clab-input-file-item[aria-checked=true]:before{border-color:#ddd;background:radial-gradient(circle,#ddd 0 42%,transparent 48%)}
    .clab-input-file-item:is(:hover,[aria-selected=true]),.clab-input-file-folder>summary:hover{background:#161616;color:#eee}
    .clab-input-file-note{color:#888;padding:4px;font-size:11px}
    .clab-input-files-tree input[type=checkbox]{flex:none;width:13px;height:13px;margin:0;accent-color:#aaa}
    .clab-input-files-tree [hidden]{display:none!important}
    .clab-value-file-controls{display:flex;gap:6px;margin:5px 0}.clab-value-file-controls input{min-width:0;flex:1;background:#1b1b1b;border:1px solid #ffffff15;color:#bbb;padding:4px 6px;font:12px sans-serif;outline:0}
    .clab-value-file-controls button{border:0;background:#1b1b1b;color:#aaa;cursor:pointer}
    `;document.head.append(style);
}
