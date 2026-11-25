export function injectExternalStyles(){
    if(document.getElementById('clab-external-style'))return;
    const style=document.createElement('style');style.id='clab-external-style';style.textContent=`
    .clab-preview-modal[data-external-dock] .clab-preview-modal-left{height:calc(100% - var(--clab-external-height,44px));box-sizing:border-box;align-self:start}
    .clab-preview-modal[data-external-dock] .clab-source-ruler{top:var(--clab-external-ruler-center);max-height:var(--clab-external-ruler-height)}
    .clab-external-dock{position:absolute;left:0;bottom:0;width:var(--browse-source-width,320px);height:var(--clab-external-height,44px);box-sizing:border-box;display:flex;flex-direction:column;min-height:44px;padding:0 12px 0;background:rgba(12,12,12,.35);z-index:5}
    .clab-external-dock[hidden],.clab-preview-modal[data-source-collapsed=true] .clab-external-dock{display:none}
    .clab-external-resize{height:8px;flex:none;position:relative;cursor:ns-resize;touch-action:none;outline:0;background:linear-gradient(transparent 3px,#383838 3px,#383838 4px,transparent 4px)}
    .clab-external-resize i{position:absolute;top:2px;left:calc(50% - 15px);width:30px;height:3px;border-radius:2px;background:#666}
    .clab-external-resize:hover i,.clab-external-resize:focus-visible i{background:#aaa}
    .clab-external-head{height:36px;flex:none;display:flex;align-items:center;gap:5px;white-space:nowrap;font:12px sans-serif;color:#999;overflow:hidden}
    .clab-external-head input{flex:none;margin:0 2px 0 0;width:12px;height:12px;accent-color:#aaa}
    .clab-external-add-icon{display:flex;align-items:center;flex:none;color:#777;margin-right:1px}
    .clab-preview-modal-panel [data-external-pick]{border:0;background:transparent;color:#80b7ed;font:inherit;padding:2px 0;cursor:pointer;white-space:nowrap}
    .clab-preview-modal-panel [data-external-pick]:hover{color:#b6d8ff;text-decoration:underline;text-underline-offset:3px}
    .clab-external-scroll{flex:1;min-height:0;overflow:auto;overscroll-behavior:contain;scrollbar-width:thin;scrollbar-color:#444 transparent;padding:0 0 44px}
    .clab-external-columns{position:absolute;left:50%;bottom:8px;transform:translateX(-50%);z-index:3;width:180px;max-width:calc(100% - 24px);box-sizing:border-box;padding:0;border:0;border-radius:0;background:transparent;box-shadow:none}
    .clab-external-columns[hidden]{display:none}.clab-external-columns>button,.clab-external-columns>output{flex:none}
    .clab-external-scroll::-webkit-scrollbar{width:4px;height:4px}.clab-external-scroll::-webkit-scrollbar-track,.clab-external-scroll::-webkit-scrollbar-corner{background:transparent}.clab-external-scroll::-webkit-scrollbar-thumb{background:#444;border-radius:3px}.clab-external-scroll::-webkit-scrollbar-button{display:none}
    .clab-external-group{margin:0;padding-bottom:8px;min-width:0}
    .clab-external-workspace{display:flex;align-items:center;gap:6px;color:#999;font:11px/18px sans-serif;margin:0 0 5px}.clab-external-workspace span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .clab-external-grid{display:grid;grid-template-columns:repeat(var(--clab-external-columns,4),minmax(0,1fr));gap:8px}
    .clab-external-item{position:relative;min-width:0}.clab-external-thumb{width:100%;display:flex!important;flex-direction:column;gap:4px;background:transparent;border:0;padding:0!important;color:#999;cursor:pointer}
    .clab-external-thumb img{display:block;width:100%;aspect-ratio:1;object-fit:contain;background:#191919;border:1px solid transparent;box-sizing:border-box}
    .clab-external-thumb:is(.active,.selected) img{border-color:#68a5cc}.clab-external-thumb.selected img{background:#23323f}.clab-external-thumb>span{display:block;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font:11px/16px sans-serif}
    [data-external-delete]{position:absolute;top:4px;right:4px;width:20px;height:20px;border:0;border-radius:3px;background:#19191999;color:#bbb;font:16px/20px sans-serif;padding:0;opacity:0;pointer-events:none;cursor:pointer}
    .clab-external-item:hover [data-external-delete],.clab-external-item:has(:focus-visible) [data-external-delete]{opacity:1;pointer-events:auto}[data-external-delete]:hover{background:#191919;color:#fff}
    .clab-external-thumb-media{position:relative;width:100%;min-width:0}
    .clab-external-thumb:is(.active,.selected) .clab-external-thumb-media{outline:1px solid #68a5cc;outline-offset:-1px}
    .clab-external-thumb-media{aspect-ratio:1;display:flex;align-items:center;justify-content:center}
    .clab-external-thumb-media :is(img,video){width:100%;height:100%;object-fit:contain;pointer-events:none}
    .clab-external-thumb-media .clab-filmstrip-assignment{top:auto;right:auto;bottom:4px;left:4px}
    .clab-external-menu{position:fixed;inset:auto;margin:0;padding:4px;min-width:160px}.clab-external-menu button{display:block;width:100%;text-align:left;padding:7px 10px;border:0;background:transparent;color:#aaa;font:12px sans-serif;cursor:pointer}
    .clab-external-menu button:hover{background:#161616;color:#fff}.clab-external-picker{display:flex;flex-direction:column;gap:8px}
    .clab-external-picker>input{background:#191919;color:#bbb;border:1px solid #444;padding:6px;font:12px sans-serif}
    .clab-external-picker-footer{display:flex;justify-content:space-between;align-items:center;gap:8px}
    .clab-external-picker-footer button{background:#202020;border:1px solid #444;color:#bbb;padding:5px 8px;cursor:pointer}
    .clab-external-picker-footer button:disabled{opacity:.4;cursor:default}
    [data-external-drop]{box-shadow:inset 0 0 0 2px #7299bd}
    .clab-compare-empty{gap:2px}.clab-compare-empty>div{pointer-events:auto}
    .clab-compare-heading{position:absolute;top:8px;z-index:4;display:flex;align-items:center;gap:5px;max-width:calc(50% - 32px);min-width:0}
    .clab-compare-heading.label-a{left:8px}.clab-compare-heading.label-b{right:8px}
    .clab-compare .clab-compare-heading>.clab-compare-label{position:relative;top:auto;flex:1;max-width:none;min-width:0}
    .clab-compare-slot-tools{display:flex;align-items:center;gap:2px;flex:none}
    .clab-compare-heading.label-b .clab-compare-slot-tools{flex-direction:row-reverse}
    .clab-compare-slot-tools button{display:flex;align-items:center;justify-content:center;width:22px;height:22px;padding:3px;border:0;border-radius:3px;background:transparent;color:#888;cursor:pointer}
    .clab-compare-slot-tools button:hover{color:#eee;background:#19191966}.clab-compare-slot-tools button[aria-pressed=true]{color:#b8d5eb;background:#263642aa}
    .clab-compare-slot-tools button:disabled{opacity:.3;cursor:default}
    .clab-compare-camera{position:absolute;z-index:4;bottom:10px;gap:5px;color:#aaa;font:11px/16px sans-serif}
    .clab-compare-camera.camera-a{left:8px}.clab-compare-camera.camera-b{right:8px;flex-direction:row-reverse}
    .clab-compare-camera output{min-width:36px;text-align:center;white-space:nowrap;font-variant-numeric:tabular-nums}
    .clab-compare-stage:has(.clab-video-controls) .clab-compare-camera{bottom:76px}
    `;document.head.append(style);
}
