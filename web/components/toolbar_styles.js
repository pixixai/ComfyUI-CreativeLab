export const toolbarStyles = `
    #clab-panel[data-toolbar-side="left"]:not([data-workspace-mode="xy"]) { padding-left:var(--clab-dock-width); }
    #clab-panel[data-toolbar-side="right"]:not([data-workspace-mode="xy"]) { padding-right:var(--clab-dock-width); }
    #clab-panel[data-toolbar-side="right"] #clab-card-width-ctrl { margin-right:var(--clab-dock-width); }
    .clab-tool-dock {
        --clab-tool-size:24px;
        --clab-tool-glyph-size:16px;
        --clab-tool-button-height:var(--clab-tool-size);
        --clab-tool-button-radius:6px;
        --clab-tool-padding:5px;
        --clab-tool-gap:10px;
        position:relative; z-index:36; display:grid; align-items:center; flex:0 0 auto;
        grid-template-columns:minmax(max-content,1fr) max-content minmax(max-content,1fr);
        box-sizing:border-box; min-width:0; gap:var(--clab-tool-gap); padding:3px 30px; white-space:nowrap;
        border:1px solid #ffffff19; background:#0004; color:#aaa;
        font:11px/16px Inter, "Microsoft YaHei", sans-serif; user-select:none; cursor:default; touch-action:none;
    }
    .clab-tool-dock[data-dock="top"] { border-width:0 0 1px; }
    .clab-tool-dock[data-dock="bottom"] { order:1; border-width:1px 0 0; }
    .clab-tool-dock:is([data-dock="left"],[data-dock="right"]) {
        position:absolute; top:0; bottom:0; width:var(--clab-dock-width);
        padding:min(calc(var(--clab-dock-width) / 3),24px) 4px;
        grid-template-columns:minmax(0,1fr);
        grid-template-rows:minmax(max-content,1fr) max-content minmax(max-content,1fr);
    }
    .clab-tool-dock[data-dock="left"] { left:0; border-width:0 1px 0 0; }
    .clab-tool-dock[data-dock="right"] { right:0; border-width:0 0 0 1px; }
    .clab-tool-dock[data-dock="float"] {
        --clab-tool-size:32px;
        --clab-tool-glyph-size:22px;
        --clab-tool-button-height:52px;
        --clab-tool-button-radius:8px;
        --clab-tool-gap:12px;
        position:absolute; z-index:70; display:flex; width:max-content; max-width:100%; max-height:100%;
        padding:7px 34px; border:1px solid #454545; border-radius:999px; background:#242424f2; box-shadow:0 4px 14px #0005;
    }
    .clab-tool-dock[data-vertical] {
        --clab-tool-size:30px;
        --clab-tool-glyph-size:21px;
        --clab-tool-button-height:44px;
        --clab-tool-gap:12px;
    }
    .clab-tool-dock[data-dense] { --clab-tool-padding:3px; }
    .clab-tool-dock[data-vertical][data-dense] { --clab-tool-gap:10px; padding-block:8px; }
    .clab-tool-dock :is(.clab-toolbar,.clab-tool-pair),
    .clab-tool-dock[data-dock="float"] :is(.clab-toolbar-left,.clab-toolbar-right) { display:contents; }
    .clab-tool-dock :is(.clab-toolbar-left,.clab-toolbar-right,#clab-module-toolbar) {
        display:flex; align-items:center; gap:var(--clab-tool-gap); min-width:0;
    }
    .clab-toolbar-left { grid-area:1 / 1; }
    #clab-module-toolbar { grid-area:1 / 2; justify-self:center; }
    .clab-toolbar-right { grid-area:1 / 3; justify-content:flex-end; }
    .clab-tool-dock[data-vertical] :is(.clab-toolbar-left,.clab-toolbar-right,#clab-module-toolbar) { flex-direction:column; }
    .clab-tool-dock[data-vertical] :is(.clab-toolbar-left,.clab-toolbar-right) { align-items:stretch; align-self:stretch; }
    .clab-tool-dock[data-vertical] #clab-module-toolbar { grid-area:2 / 1; }
    .clab-tool-dock[data-vertical] .clab-toolbar-right { grid-area:3 / 1; }
    .clab-tool-dock[data-dock="float"] #clab-module-toolbar {
        --clab-tool-size:24px;
        --clab-tool-glyph-size:17px;
        --clab-tool-button-height:44px;
        position:absolute; z-index:1; width:max-content; box-sizing:border-box;
        flex-wrap:wrap; justify-content:center; gap:6px; padding:5px 12px;
        border:1px solid #454545; border-radius:16px; background:#242424f2; box-shadow:0 4px 14px #0005;
    }
    #clab-panel[data-workspace-mode="xy"] .clab-tool-dock { display:none; }
    #clab-panel:not([data-workspace-mode="xy"]):has(.clab-tool-dock[data-dock="bottom"]) #clab-card-width-ctrl { bottom:48px; }
    .clab-tool-dock [data-toolbar-item] { flex:none; min-width:0; box-sizing:border-box; position:relative; }
    .clab-tool-dock [data-toolbar-item]:not([hidden]) { display:inline-flex; align-items:center; }
    .clab-tool-dock[data-vertical] [data-toolbar-item] { align-self:center; }
    .clab-tool-dock .clab-tool-button,
    .clab-tool-dock .clab-toolbar-overflow .clab-tool-button {
        display:inline-flex !important; align-items:center; justify-content:center; gap:4px;
        box-sizing:border-box; width:auto !important; min-width:var(--clab-tool-size);
        height:var(--clab-tool-button-height) !important; min-height:0 !important;
        padding:0 var(--clab-tool-padding) 0 0 !important; margin:0 !important;
        border:0 !important; border-radius:var(--clab-tool-button-radius) !important; background:transparent !important;
        box-shadow:none; color:#aaa !important; font:inherit !important; white-space:nowrap;
        cursor:pointer; outline-offset:-2px; transition:background .12s, color .12s; user-select:none;
    }
    .clab-tool-dock .clab-tool-button:hover,
    .clab-tool-dock .clab-tool-button[aria-expanded="true"] { background:#ffffff16 !important; color:#fff !important; }
    .clab-tool-dock .clab-tool-button:is([aria-pressed="true"],:has(input:checked)) {
        background:#2e2e2e !important; box-shadow:inset 0 0 0 1px #626262; color:#fff !important;
    }
    .clab-tool-dock .clab-tool-button:focus-visible,
    .clab-tool-dock .clab-tool-button:has(input:focus-visible) { outline:1px solid #a0c9e8; }
    .clab-tool-icon {
        display:grid; place-items:center; position:relative; flex:none;
        width:var(--clab-tool-size); height:var(--clab-tool-size); pointer-events:none;
    }
    .clab-tool-icon > svg { width:var(--clab-tool-glyph-size); height:var(--clab-tool-glyph-size); }
    .clab-tool-menu-button > .clab-tool-icon::after {
        content:""; position:absolute; right:2px; bottom:2px; width:4px; height:4px;
        background:currentColor; clip-path:polygon(100% 0,100% 100%,0 100%);
    }
    .clab-tool-dock:is([data-dock="top"],[data-dock="bottom"]) .clab-tool-menu-button:not(#clab-btn-run,.clab-toolbar-overflow-menu *) {
        position:relative; padding-right:7px !important;
    }
    .clab-tool-dock:is([data-dock="top"],[data-dock="bottom"]) .clab-tool-menu-button:not(#clab-btn-run,.clab-toolbar-overflow-menu *) > .clab-tool-icon {
        position:static;
    }
    .clab-tool-short-label { display:none; }
    .clab-tool-dock:is([data-dock="float"],[data-vertical]) .clab-tool-button:has(> .clab-tool-icon):not(#clab-btn-run,.clab-toolbar-overflow-menu *) {
        flex:none; flex-direction:column; justify-content:center; gap:0;
        width:var(--clab-tool-button-height) !important; padding:0 4px !important;
    }
    .clab-tool-dock:is([data-dock="float"],[data-vertical]) .clab-tool-label:not(#clab-btn-run *, .clab-toolbar-overflow-menu *) { display:none; }
    .clab-tool-dock:is([data-dock="float"],[data-vertical]) .clab-tool-short-label:not(#clab-btn-run *, .clab-toolbar-overflow-menu *) {
        display:block; line-height:14px; font-size:10px;
    }
    .clab-tool-dock .clab-tool-button:is(.clab-auto-height:has(input:checked),#tb-manage-history[aria-pressed="true"]) {
        background:#ffffff20 !important; box-shadow:none;
    }
    .clab-tool-dock .clab-toolbar-type {
        gap:2px; padding:2px; border:1px dashed #ffffff4d; border-radius:999px;
    }
    .clab-tool-dock[data-vertical] .clab-toolbar-type { flex-direction:column; gap:5px; }
    .clab-toolbar-type > .clab-type-btn {
        display:grid; place-items:center; border:0; border-radius:999px; background:transparent;
        padding:2px 10px; font:inherit; color:#aaa; cursor:pointer;
    }
    .clab-tool-dock[data-dock="float"] .clab-type-btn { padding-block:5px; }
    .clab-tool-dock[data-vertical] .clab-type-btn {
        writing-mode:vertical-rl; text-orientation:upright; letter-spacing:2px; padding:5px 4px;
    }
    .clab-tool-dock[data-vertical] #clab-preview-mode-switch .clab-type-btn {
        writing-mode:horizontal-tb; letter-spacing:normal; padding:2px 7px;
    }
    .clab-toolbar-type > .clab-type-btn:hover { color:#fff; }
    .clab-toolbar-type > .clab-type-btn[aria-pressed="true"] { background:#ffffff33; color:#fff; font-weight:600; }
    .clab-toolbar-type > .clab-type-btn:focus-visible { outline:1px solid #a0c9e8; outline-offset:-1px; }
    .clab-tool-dock .clab-tool-resize {
        display:none; position:absolute; top:0; bottom:0; width:6px; z-index:2;
        cursor:ew-resize; touch-action:none;
    }
    .clab-tool-dock:is([data-dock="left"],[data-dock="right"]) .clab-tool-resize { display:block; }
    .clab-tool-dock:not([data-dock="right"]) .clab-tool-resize { right:-3px; }
    .clab-tool-dock[data-dock="right"] .clab-tool-resize { left:-3px; }
    .clab-tool-dock .clab-tool-resize:hover { background:#83b3d660; }
    .clab-tool-dock :is(.clab-run-wrapper,.clab-btn-group) {
        border:0 !important; border-radius:0 !important; height:auto !important; box-shadow:none;
    }
    .clab-tool-dock .clab-run-wrapper { background:none; display:flex; }
    .clab-tool-dock #clab-run-group {
        --clab-run-height:var(--clab-tool-size);
        align-items:stretch; border-radius:var(--clab-tool-button-radius); background:var(--primary-background,#0b8ce9);
    }
    .clab-tool-dock[data-dock="float"] #clab-run-group {
        --clab-run-height:44px;
    }
    .clab-tool-dock #clab-run-btn-wrapper:hover { box-shadow:none; background:transparent; }
    .clab-tool-dock #clab-run-group .clab-tool-button {
        height:var(--clab-run-height) !important; color:#fff !important; font-weight:600 !important;
        justify-content:center !important; border-radius:0 !important; gap:0;
    }
    .clab-tool-dock #clab-run-group .clab-tool-button:hover { background:var(--primary-background-hover,#31b9f4) !important; }
    .clab-tool-dock #clab-run-group #clab-btn-run {
        border-radius:var(--clab-tool-button-radius) 0 0 var(--clab-tool-button-radius) !important;
        padding:0 6px 0 8px !important; font-size:13px !important;
    }
    .clab-tool-dock #clab-run-group .clab-tool-icon { width:24px; height:24px; }
    .clab-tool-dock #clab-run-group .clab-tool-icon > svg { width:22px; height:22px; }
    .clab-tool-dock #clab-run-group .clab-tool-icon::after { content:none; }
    .clab-tool-dock #clab-run-group #clab-run-dropdown-toggle {
        min-width:18px; padding:0 5px !important;
    }
    .clab-tool-dock #clab-run-dropdown-toggle::after {
        content:""; width:5px; height:5px; border:solid currentColor; border-width:0 1px 1px 0;
        transform:translateY(-1px) rotate(45deg);
    }
    .clab-tool-dock #clab-run-count-control {
        display:flex; align-items:center; justify-content:center;
        min-height:var(--clab-run-height); padding:0 12px 0 1px; border-left:1px solid #fff5;
    }
    .clab-tool-dock[data-vertical] #clab-run-group {
        flex-direction:column; align-items:stretch;
        width:56px; max-width:100%;
    }
    .clab-tool-dock[data-vertical] #clab-run-btn-wrapper { flex-direction:column; }
    .clab-tool-dock[data-vertical] #clab-run-group #clab-btn-run {
        flex-direction:column; height:54px !important; padding:9px 0 4px !important;
        border-radius:var(--clab-tool-button-radius) var(--clab-tool-button-radius) 0 0 !important;
    }
    .clab-tool-dock[data-vertical] #clab-run-group #clab-run-dropdown-toggle { height:26px !important; }
    .clab-tool-dock[data-vertical] #clab-run-count-control::before {
        content:""; position:absolute; left:25%; top:0; width:50%; height:0;
        border:0; border-top:1px solid #fff5;
    }
    .clab-tool-dock[data-vertical] #clab-run-count-control {
        position:relative; box-sizing:border-box; border-left:0; padding:0 0 7px; min-height:37px;
    }
    .clab-tool-dock #clab-run-batch-count { font:inherit !important; }
    .clab-tool-dock[data-vertical] #clab-run-batch-count { width:20px !important; }
    .clab-tool-dock :is(#clab-run-count-up,#clab-run-count-down) { padding:0 3px !important; }
    .clab-tool-dock[data-vertical] :is(#clab-run-count-up,#clab-run-count-down) svg { width:10px; }
    .clab-tool-dock #tb-auto-height { width:1px; height:1px; position:absolute; opacity:0; }
    .clab-tool-dock .clab-tool-label { display:block; min-width:0; line-height:inherit; overflow:hidden; text-overflow:ellipsis; }
    .clab-tool-dock:is([data-dock="top"],[data-dock="bottom"]) #clab-toolbar-more .clab-tool-label { display:none; }
    .clab-tool-dock #tb-format-painter[aria-pressed="true"] { color:#ffbd65 !important; }
    #clab-panel[data-toolbar-snap]::after {
        content:""; position:absolute; z-index:71; background:#80c4f5; pointer-events:none;
    }
    #clab-panel:is([data-toolbar-snap="top"],[data-toolbar-snap="bottom"])::after { left:0; right:0; height:2px; }
    #clab-panel[data-toolbar-snap="top"]::after { top:0; }
    #clab-panel[data-toolbar-snap="bottom"]::after { bottom:0; }
    #clab-panel:is([data-toolbar-snap="left"],[data-toolbar-snap="right"])::after { top:0; bottom:0; width:2px; }
    #clab-panel[data-toolbar-snap="left"]::after { left:0; }
    #clab-panel[data-toolbar-snap="right"]::after { right:0; }
    .clab-tool-dock :is(.clab-toolbar-menu,.clab-toolbar-overflow-menu),
    .clab-tool-popup, .clab-tool-popup button { border-radius:0 !important; }
    .clab-tool-dock .clab-toolbar-menu[popover],.clab-toolbar-overflow-menu {
        position:fixed; inset:auto; margin:0; max-height:calc(100dvh - 16px); overflow:auto; box-sizing:border-box;
    }
    .clab-tool-dock .clab-toolbar-menu[popover] { right:auto !important; }
    .clab-tool-dock .clab-toolbar-overflow { order:10000; }
    .clab-tool-dock[data-vertical] .clab-toolbar-overflow { align-self:center; }
    .clab-toolbar-overflow-menu {
        width:max-content; max-width:calc(100vw - 16px); padding:5px; white-space:normal;
        background:#3b3b3b; border:1px solid #555; color:#eee; box-shadow:0 5px 18px #0007;
    }
    .clab-toolbar-overflow-menu:popover-open { display:flex; flex-direction:column; align-items:stretch; gap:2px; }
    .clab-tool-dock .clab-toolbar-overflow-menu [data-toolbar-item] { width:auto !important; justify-content:flex-start; }
    .clab-tool-dock .clab-toolbar-overflow-menu .clab-tool-label { display:inline; }
    .clab-tool-dock .clab-toolbar-overflow-menu .clab-toolbar-menu {
        position:static !important; margin:3px 0 0; min-width:0 !important; max-height:35vh;
    }
    .clab-toolbar-overflow-entry { display:flex; align-items:center; flex-wrap:wrap; }
    .clab-toolbar-overflow-entry:has(.clab-toolbar-menu[style*="block"]) [data-toolbar-item] { flex-wrap:wrap; }
`;
