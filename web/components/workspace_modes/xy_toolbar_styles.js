export const xyToolbarStyles=`
    .clab-xy-toolbar{display:contents}
    .clab-xy-toolbar-start{display:flex;align-items:center;grid-area:1 / 1;justify-self:start}
    .clab-xy-toolbar-center{display:flex;align-items:center;gap:var(--clab-tool-gap);grid-area:1 / 2;justify-self:center;min-width:0;max-width:100%;overflow:auto;scrollbar-width:none}
    .clab-xy-tiling{display:flex;align-items:center;flex:none;gap:8px;padding:0 8px;border:0;border-radius:6px;box-shadow:inset 0 0 0 1px #ffffff19}.clab-xy-tiling.is-active{background:#2e2e2e;box-shadow:inset 0 0 0 1px #626262}
    .clab-tool-dock .clab-xy-tiling>.clab-tool-button{flex:none;width:auto!important;min-width:0;padding:0!important;gap:8px;box-shadow:none!important;background:transparent!important}.clab-xy-tiling>.clab-xy-layer-toggle>.clab-tool-label{display:block!important;white-space:nowrap}.clab-xy-tiling>.clab-tool-button>svg{width:18px;height:18px;flex:none}.clab-tool-dock .clab-xy-tiling>.clab-xy-tile-settings{width:18px!important;min-width:18px}.clab-xy-tiling>[hidden]{display:none!important}
    .clab-xy-tiling-panel{width:300px;padding:0}.clab-xy-tiling-panel>.clab-binding-panel-head{padding:8px 10px}
    .clab-xy-tiling-fields{display:grid;gap:8px;padding:10px}.clab-xy-tiling-fields label{display:flex;align-items:center;gap:6px;min-width:0;font:12px/1.5 sans-serif;color:#bbb}.clab-xy-tiling-fields input{margin-left:auto;width:105px;box-sizing:border-box;padding:4px 6px;border:1px solid #444;background:#1d1d1d;color:#ccc;border-radius:3px}.clab-xy-tiling-spacing{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:12px}.clab-xy-tiling-spacing input{width:0;min-width:0;flex:1}
    .clab-xy-toolbar :is(.clab-xy-toolbar-start,.clab-xy-toolbar-center)>.clab-tool-button { flex:none; }
    .clab-tool-dock .clab-xy-toolbar .clab-xy-choice {
        position:relative; padding:0 10px !important;
    }
    .clab-xy-choice::after {
        content:''; position:absolute; right:2px; bottom:2px; width:4px; height:4px;
        background:currentColor; clip-path:polygon(100% 0,100% 100%,0 100%); pointer-events:none;
    }
    #clab-panel[data-workspace-mode=xy] .clab-tool-dock[data-dock=float] { padding:6px 18px; border-radius:30px; }
    .clab-tool-dock[data-dock=float] .clab-xy-toolbar { display:flex;align-items:center;gap:var(--clab-tool-gap);min-width:0;flex-wrap:wrap; justify-content:center; }
    .clab-tool-dock[data-dock=float] .clab-xy-toolbar :is(.clab-xy-toolbar-start,.clab-xy-toolbar-center)>.clab-tool-button {
        width:34px !important; height:34px !important;
    }
    .clab-tool-dock[data-dock=float] .clab-xy-toolbar .clab-xy-choice { width:auto !important; }
    .clab-tool-dock[data-dock=float] .clab-xy-choice>.clab-tool-label { display:block !important; }
    #clab-panel[data-workspace-mode=xy] .clab-tool-dock:not([data-dock=float]) { container:clab-xy-dock / inline-size; }
    @container clab-xy-dock (max-width:640px) {
        .clab-tool-dock :is(.clab-xy-toolbar,.clab-toolbar-right) { --clab-tool-gap:4px; }
        .clab-xy-toolbar .clab-tool-icon+.clab-tool-label, #clab-config-dropdown-trigger .clab-tool-label { display:none; }
    }
    @container clab-xy-dock (max-width:440px) {
        .clab-xy-toolbar-center { overflow:auto; scrollbar-width:none; }
    }
    .clab-xy-toolbar>.clab-mode-error{position:absolute;bottom:calc(100% + 8px);left:50%;transform:translateX(-50%);width:max-content;max-width:min(360px,calc(100vw - 40px));padding:8px 10px;margin:0;border:1px solid #555;border-radius:6px;background:#242424;color:#eda58d;white-space:pre-wrap}
    .clab-tool-dock[data-dock=top] .clab-xy-toolbar>.clab-mode-error{top:calc(100% + 8px);bottom:auto}
    .clab-xy-axis-panel,.clab-xy-record-panel{width:320px;padding:0}:is(.clab-xy-axis-panel,.clab-xy-record-panel)>.clab-binding-panel-head{padding:8px 10px}.clab-xy-axis-panel-body,.clab-xy-record-panel-body{display:flex;flex-direction:column;gap:10px;padding:10px;min-height:0;overflow:auto;scrollbar-width:thin;scrollbar-color:#555 transparent}
    .clab-xy-axis-assignments{display:flex;flex-direction:column;gap:6px}.clab-xy-axis-assignment{display:flex;align-items:center;gap:10px;color:#bbb;font:12px/1.5 sans-serif}.clab-xy-axis-assignment>b{flex:none;width:14px;font-weight:500}.clab-xy-axis-assignment>.clab-axis-value-order-row{flex:1;min-width:0}
    :is(.clab-xy-axis-panel-body,.clab-xy-record-panel-body) p{margin:0;color:#888;font:11px/1.5 sans-serif}
    .clab-xy-record-panel-body [data-xy-add-record]{padding:5px 7px;border:1px dashed #444;border-radius:4px;background:transparent;color:#aaa;font:12px/1.5 sans-serif;cursor:pointer}.clab-xy-record-panel-body [data-xy-add-record]:hover{color:#fff;border-color:#777}
    .clab-xy-record>.clab-xy-binding>span:first-child{min-width:0;overflow:hidden;text-overflow:ellipsis}.clab-xy-record>.clab-xy-binding>span:last-child{margin-left:auto;flex:none}.clab-xy-record>[data-xy-remove-record]{cursor:pointer}.clab-xy-record>[data-xy-remove-record]:hover{color:#fff}
`;
