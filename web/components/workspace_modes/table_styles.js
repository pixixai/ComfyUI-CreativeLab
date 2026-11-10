export const tableStyles=`
    #clab-panel[data-workspace-mode=table] #clab-cards-container{display:block;overflow:auto;padding:0;scrollbar-width:thin;scrollbar-color:#444 transparent;position:relative}
    #clab-panel[data-workspace-mode=table] #clab-cards-container::-webkit-scrollbar{width:6px;height:6px}
    #clab-panel[data-workspace-mode=table] #clab-cards-container::-webkit-scrollbar-track,#clab-panel[data-workspace-mode=table] #clab-cards-container::-webkit-scrollbar-corner{background:transparent}
    #clab-panel[data-workspace-mode=table] #clab-cards-container::-webkit-scrollbar-thumb{background:#444;border-radius:4px}
    #clab-panel[data-workspace-mode=table] #clab-cards-container::-webkit-scrollbar-thumb:hover{background:#666}
    #clab-panel[data-workspace-mode=table] #clab-cards-container::-webkit-scrollbar-button{display:none;width:0;height:0}
    @supports selector(::-webkit-scrollbar){#clab-panel[data-workspace-mode=table] #clab-cards-container{scrollbar-width:auto;scrollbar-color:auto}}
    #clab-panel[data-workspace-mode=table] :is(.clab-card[hidden],.clab-area[hidden],#clab-card-width-ctrl){display:none!important}
    #clab-panel[data-workspace-mode=table] .clab-cards-wrapper{display:block!important;height:auto!important;width:max-content!important;min-width:100%!important;margin:0!important;flex:none!important;padding-bottom:28px;background:transparent}
    .clab-table-head,#clab-panel[data-workspace-mode=table] :is(.clab-card,.clab-table-draft-row){display:grid!important;grid-template-columns:var(--clab-table-columns);align-items:stretch;gap:0}
    #clab-panel[data-workspace-mode=table] :is(.clab-table-column,.clab-area,.clab-table-draft-cell),#clab-panel[data-workspace-mode=table] :is(.clab-table-column,.clab-area,.clab-table-draft-cell) :is(button,input,textarea,select){scroll-margin-left:var(--clab-table-row-width,44px);scroll-margin-top:40px;scroll-margin-right:28px;scroll-margin-bottom:28px}
    .clab-table-head{position:sticky;top:0;z-index:36;background:transparent;color:#bbb;isolation:isolate}
    .clab-table-corner,.clab-table-column{box-sizing:border-box;min-width:0;position:relative;border:0;border-right:1px solid #ffffff0c;border-bottom:1px solid #ffffff0c;padding:6px;background:#1d1d1d}
    .clab-table-corner{position:sticky;left:0;z-index:2;display:flex;align-items:center;justify-content:center}
    .clab-table-column-top{display:flex;align-items:center;justify-content:space-between;gap:5px;min-width:0;height:28px;opacity:0;visibility:hidden;pointer-events:none}
    .clab-table-column:is(.has-controls,.is-column-hover,:hover):not(.is-reordering)>.clab-table-column-top,.clab-table-column:has([aria-expanded=true],:focus-visible)>.clab-table-column-top{opacity:1;visibility:visible;pointer-events:auto}
    .clab-table-column button,.clab-table-corner button{border:0;background:transparent;color:#454545;cursor:pointer;padding:3px;display:inline-flex;align-items:center;justify-content:center;border-radius:3px}
    .clab-table-corner button{color:#888}.clab-table-column.clab-table-bound button,.clab-table-column.has-controls [data-table-settings]{color:#aaa}.clab-table-column button:hover,.clab-table-corner button:hover{color:#eee;background:#ffffff08}
    .clab-table-column-top>[data-table-settings]{display:block;min-width:0;flex:0 1 auto;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:left;font:12px/1.5 sans-serif}
    .clab-table-column .clab-module-binding{position:static;opacity:1;visibility:visible;transform:none;margin:0;max-width:min(62%,125px);width:auto;min-width:0;flex:0 0 auto;overflow:hidden}
    .clab-table-column .clab-module-binding-summary{width:100%;justify-content:flex-end;gap:5px;max-width:100%;font:11px/1.5 sans-serif;background:#ffffff02;border:1px solid #ffffff06;border-radius:3px;padding:3px 5px}.clab-table-bound .clab-module-binding-summary{border-color:#ffffff12}
    .clab-table-column .clab-module-binding-label{min-width:0;max-width:24ch;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:right}.clab-table-column .clab-module-binding-summary>span:last-child{flex:none}
    .clab-table-resize{position:absolute;top:0;bottom:0;right:-3px;width:6px;z-index:3;cursor:col-resize;touch-action:none}.clab-table-resize:hover,[data-table-row-resize]:hover{background:#5aa9e955}
    .clab-table-column{cursor:grab}.clab-table-column.is-selected{box-shadow:inset 0 0 0 1px #5aa9e9}.clab-table-column.is-drop-target{box-shadow:inset 0 0 0 2px #5aa9e9}:is(.clab-table-column,.clab-table-row-header).is-reordering{opacity:.45}
    #clab-panel[data-workspace-mode=table] :is(.clab-card,.clab-table-draft-row){position:relative!important;width:100%!important;min-width:0!important;max-width:none!important;height:var(--clab-table-height)!important;max-height:var(--clab-table-height)!important;min-height:0!important;margin:0!important;padding:0!important;border:0!important;border-radius:0!important;box-shadow:none!important;transform:none!important;background:transparent;overflow:visible;transition:none}
    #clab-panel[data-workspace-mode=table] .clab-card-body,#clab-panel[data-workspace-mode=table] .clab-area-list{display:contents!important}
    #clab-panel[data-workspace-mode=table] .clab-card-title-bar{grid-row:1;position:sticky!important;left:0;z-index:15;align-self:stretch;display:flex;align-items:stretch;padding:0!important;margin:0!important;min-width:0;min-height:0;box-sizing:border-box;border:0;border-right:1px solid #ffffff0c;border-bottom:1px solid #ffffff0c;background:#1d1d1d;border-radius:0}
    #clab-panel[data-workspace-mode=table] .clab-card-title-input{display:none!important}
    .clab-table-row-header{border:0;border-radius:0;background:transparent;color:#777;padding:6px 8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0;font:12px/1.5 sans-serif;cursor:grab;width:100%;text-align:center}.clab-table-row-header:hover{background:#ffffff08;color:#bbb}.clab-table-row-header[aria-pressed=true]{background:#26394b;color:#eee}
    [data-table-row-title]{min-width:0;width:100%;box-sizing:border-box;border:1px solid #5886a8;background:#26394b;color:#eee;padding:6px 3px;text-align:center;font:12px/1.5 sans-serif;outline:0}
    [data-table-row-resize]{position:absolute;bottom:-3px;left:0;right:0;height:6px;cursor:row-resize;z-index:3;touch-action:none}
    #clab-panel[data-workspace-mode=table] :is(.clab-card,.clab-table-draft-row).is-drop-target>.clab-card-title-bar{box-shadow:inset 0 2px #65aff0}
    #clab-panel[data-workspace-mode=table] :is(.clab-area,.clab-table-draft-cell){grid-row:1;position:relative;display:flex;flex-direction:column;min-width:0!important;max-width:none!important;width:100%!important;min-height:0!important;height:var(--clab-table-height)!important;max-height:var(--clab-table-height)!important;margin:0!important;padding:0!important;box-sizing:border-box;border:0!important;border-right:1px solid #ffffff0c!important;border-bottom:1px solid #ffffff0c!important;border-radius:0!important;background:#202020!important;box-shadow:none!important;transform:none!important;overflow:hidden;transition:none}
    #clab-panel[data-workspace-mode=table] .is-effective{background:#232323!important;border-right-color:#ffffff18!important;border-bottom-color:#ffffff18!important}
    #clab-panel[data-workspace-mode=table] .clab-card-progress-container{display:none!important}
    .clab-card:has(>.clab-table-progress-ring){isolation:isolate}
    .clab-table-progress-ring{position:absolute;top:0;height:100%;z-index:51;pointer-events:none}
    .clab-table-progress-path{transition:stroke-dasharray .15s linear}
    @media(prefers-reduced-motion:reduce){.clab-table-progress-path{transition:none}}
    #clab-panel[data-workspace-mode=table] :is(.clab-area,.clab-table-draft-cell).active{box-shadow:inset 0 0 0 1px #5aa9e9!important}
    #clab-panel[data-workspace-mode=table] :is(.clab-area,.clab-table-draft-cell).active:after,#clab-panel[data-workspace-mode=table] .selected :is(.clab-area,.clab-table-draft-cell):after{content:'';position:absolute;inset:0;z-index:50;pointer-events:none;background:transparent;box-shadow:inset 0 0 0 1px #5aa9e9}
    #clab-panel[data-workspace-mode=table] .clab-cards-wrapper[data-table-selection=column] :is(.clab-area,.clab-table-draft-cell).active:after,#clab-panel[data-workspace-mode=table] .selected :is(.clab-area,.clab-table-draft-cell):after{background:#2196f326}
    #clab-panel[data-workspace-mode=table] :is(.clab-del-card-btn,.clab-del-area-btn,.clab-output-head,.clab-output-footer,.clab-preview-placeholder,.clab-input-header .clab-area-title-input,.clab-input-header .clab-module-binding){display:none!important}
    #clab-panel[data-workspace-mode=table] .clab-input-header:not(:has(.clab-upload-preview-toggle)){display:none!important}
    #clab-panel[data-workspace-mode=table] .clab-input-header{padding:4px 8px 0!important;margin:0!important;min-height:0}
    #clab-panel[data-workspace-mode=table] .clab-input-body{display:flex;flex-direction:column;justify-content:var(--table-vertical,flex-start);align-items:var(--table-horizontal,flex-start);padding:var(--clab-table-padding,10px)!important;flex:1;min-height:0;overflow:auto;box-sizing:border-box}
    #clab-panel[data-workspace-mode=table] :is(textarea.clab-edit-val,textarea.clab-table-draft-value){field-sizing:content;width:100%!important;min-height:18px!important;max-height:100%!important;height:auto!important;line-height:18px!important;overflow:auto!important;resize:none!important;background:transparent;border:0;border-radius:0;font:12px/18px sans-serif;color:#bbb;padding:0;text-align:var(--table-text,left);overflow-wrap:anywhere;box-sizing:border-box}
    #clab-panel[data-workspace-mode=table] .clab-area.clab-table-has-number .clab-input-body>textarea,#clab-panel[data-workspace-mode=table] .clab-table-has-choice .clab-input-body textarea.clab-edit-val,#clab-panel[data-workspace-mode=table] .clab-table-has-choice .clab-custom-select[data-type=module-combo]{display:none!important}
    #clab-panel[data-workspace-mode=table] [role=cell]:not([data-table-editing]) :is(textarea,.clab-table-number,input.clab-table-draft-value:not([type=checkbox])){cursor:cell;caret-color:transparent;user-select:none}
    #clab-panel[data-workspace-mode=table] [role=cell][data-table-editing] :is(textarea,input){cursor:text;caret-color:auto;user-select:text}
    #clab-panel[data-workspace-mode=table] .clab-table-text-cell .clab-input-body{padding-right:min(2px,var(--clab-table-padding-right,10px))!important;overflow:hidden}
    #clab-panel[data-workspace-mode=table] .clab-table-text-cell textarea{padding-right:max(0px,calc(var(--clab-table-padding-right,10px) - 2px));align-self:flex-start}
    #clab-panel[data-workspace-mode=table] :is(.clab-input-body,textarea){scrollbar-width:thin;scrollbar-color:#444 transparent}
    #clab-panel[data-workspace-mode=table] :is(.clab-input-body,textarea)::-webkit-scrollbar{width:4px;height:4px}
    #clab-panel[data-workspace-mode=table] :is(.clab-input-body,textarea)::-webkit-scrollbar-track,#clab-panel[data-workspace-mode=table] :is(.clab-input-body,textarea)::-webkit-scrollbar-corner{background:transparent}
    #clab-panel[data-workspace-mode=table] :is(.clab-input-body,textarea)::-webkit-scrollbar-thumb{background:#444;border-radius:3px}
    #clab-panel[data-workspace-mode=table] :is(.clab-input-body,textarea)::-webkit-scrollbar-thumb:hover{background:#666}
    #clab-panel[data-workspace-mode=table] :is(.clab-input-body,textarea)::-webkit-scrollbar-button{display:none;width:0;height:0}
    @supports selector(::-webkit-scrollbar){#clab-panel[data-workspace-mode=table] :is(.clab-input-body,textarea){scrollbar-width:auto;scrollbar-color:auto}}
    .clab-table-number,input.clab-table-draft-value:not([type=checkbox]){width:100%;box-sizing:border-box;min-height:24px;background:transparent;color:#bbb;border:0;padding:0;font:12px/18px sans-serif;text-align:var(--table-text,left)}
    .clab-table-choice,.clab-table-draft-cell select{color-scheme:dark;min-height:24px;flex:none;max-width:100%;width:100%;background:#202020;color:#999;border:0;font:12px/18px sans-serif;text-align:var(--table-text,left)}
    #clab-panel[data-workspace-mode=table] :is(.clab-area,.clab-table-draft-cell) :is(textarea,input,select):is(:focus,:focus-visible){outline:none!important;box-shadow:none!important}
    #clab-panel[data-workspace-mode=table] :is(.clab-area,.clab-table-draft-cell):is(:focus,:focus-visible){outline:none!important}
    #clab-panel[data-workspace-mode=table] .clab-bool-label{padding:0!important;background:transparent!important;border:0!important;font-size:12px!important;width:auto}
    #clab-panel[data-workspace-mode=table] .clab-custom-select{max-width:100%;width:100%;text-align:var(--table-text,left)}
    #clab-panel[data-workspace-mode=table] .clab-output-area{padding:var(--clab-table-padding,10px)!important}
    #clab-panel[data-workspace-mode=table] .clab-output-area>.clab-preview-bg{flex:1;width:100%!important;height:100%!important;min-height:0!important;max-height:none!important;aspect-ratio:auto!important;margin:0!important;border:0!important;border-radius:0!important;overflow:hidden;box-sizing:border-box}
    #clab-panel[data-workspace-mode=table] :is(.clab-preview-bg,.clab-upload-preview) :is(img,video).clab-media-target{object-fit:contain!important;object-position:var(--table-media-position,center)}
    #clab-panel[data-workspace-mode=table] .clab-output-area::before{display:none!important}
    #clab-panel[data-workspace-mode=table] :is(.clab-text-preview-shell,.clab-glb-viewer){min-height:0!important;height:100%!important;max-height:100%!important}
    #clab-panel[data-workspace-mode=table] .clab-text-body-scroll{display:flex;flex-direction:column;justify-content:safe var(--table-vertical,flex-start);flex:1;min-height:0;height:auto!important;max-height:none!important;overflow-y:auto!important}
    #clab-panel[data-workspace-mode=table] .clab-text-body-content{flex:none;padding:0;text-align:var(--table-text,left)}
    #clab-panel[data-workspace-mode=table] .clab-area:has(.clab-history-grid){overflow:auto}
    .clab-table-fixed-controls{position:sticky;top:0;left:0;height:0;z-index:60;pointer-events:none}.clab-table-fixed-controls>button{position:absolute;pointer-events:auto;border:1px solid #303030;background:#1a1a1a;color:#888;font:18px sans-serif;cursor:pointer;padding:0}.clab-table-fixed-controls>button:hover{color:#eee;background:#292929}.clab-table-fixed-controls>[data-table-add=columns]{right:0;top:0;width:28px;height:40px}.clab-table-fixed-controls>[data-table-add=rows]{left:0;top:calc(var(--table-viewport-height) - 28px);width:var(--clab-table-row-width,44px);height:28px}
    .clab-table-type-switch{display:flex;align-items:center;gap:2px;padding:2px;border:1px dashed #ffffff4d;border-radius:20px;background:transparent}.clab-table-type-switch>button{font:12px sans-serif;padding:3px 10px!important;min-height:24px;border:0;border-radius:16px;background:transparent;color:#aaa;cursor:pointer;transition:background .15s,color .15s}.clab-table-type-switch>[aria-pressed=true]{background:#ffffff33;color:#fff!important;font-weight:bold}
    .clab-table-column-panel>.clab-binding-panel-head{justify-content:flex-start;gap:8px}.clab-table-column-panel>.clab-binding-panel-head>.clab-table-type-switch{flex:none;margin-right:0}.clab-table-column-panel>.clab-binding-panel-head>.clab-xy-popup-close{margin-left:auto}
    .clab-table-title-input{box-sizing:border-box;field-sizing:content;min-width:0;flex:0 1 auto;border:1px solid transparent;border-radius:4px;background:transparent;color:#ddd;padding:4px 6px;font:600 13px sans-serif;text-overflow:ellipsis}
    .clab-table-title-input:is(:hover,:focus){border-color:#444;outline:0}
    .clab-table-column-panel [data-table-reset]{display:flex;align-items:center;justify-content:center;flex:none;width:26px;height:26px;padding:4px;border:0;border-radius:4px;background:transparent;color:#999;cursor:pointer}.clab-table-column-panel [data-table-reset]:hover{background:#ffffff0d;color:#fff}
    .clab-table-alignment{display:flex;align-items:center;gap:6px;white-space:nowrap}
    .clab-table-value-tools{display:flex;align-items:center;gap:8px;min-width:0}.clab-table-value-tools .clab-value-choice-head{flex:none;gap:6px}.clab-table-value-tools select{max-width:140px}
    .clab-table-column-panel{width:380px}.clab-table-column-body{display:flex;flex-direction:column;gap:10px;padding:10px;color:#aaa;font:12px/1.5 sans-serif;overflow:auto;scrollbar-width:thin}.clab-table-column-body button{border:0;background:transparent;color:#aaa;cursor:pointer}.clab-table-column-body button:not(:disabled):hover{color:#fff}.clab-table-column-body button:disabled{opacity:.4;cursor:default}
    .clab-table-setting-line{display:flex;align-items:center;gap:10px}.clab-table-setting-line>label{display:flex;align-items:center;gap:6px;white-space:nowrap}.clab-table-size-field input,.clab-table-setting-line input[data-table-padding]{box-sizing:border-box;width:64px;min-width:0;padding:4px 6px;border:1px solid #444;border-radius:3px;background:#202020;color:#ccc;font:12px sans-serif}.clab-table-setting-line .clab-xy-label-anchor{margin-left:0}
    .clab-table-toolbar-settings{display:inline-flex;align-items:center;justify-content:center;gap:5px;white-space:nowrap}
    .clab-table-column-body[hidden]{display:none}
    .clab-table-selection-summary{color:#aaa;font-size:12px}
    .clab-table-size-controls{display:grid;grid-template-columns:max-content minmax(0,1fr);grid-template-areas:"width preview" "height preview" "slider slider";align-items:center;column-gap:10px;row-gap:5px}
    .clab-table-size-stage{grid-area:preview;position:relative;display:grid;place-items:center;box-sizing:border-box;height:96px;padding:6px;min-width:0}
    .clab-table-size-outline{position:relative;max-width:100%;min-width:1px;min-height:1px}
    .clab-table-size-stage output{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:2;background:#272727;padding:0 4px;border-radius:2px;color:#ddd;font:12px/1.35 sans-serif;font-variant-numeric:tabular-nums;white-space:nowrap;pointer-events:none}
    .clab-table-size-outline .clab-table-size-edge{position:absolute;padding:0;border:0;background:transparent;color:#505050}
    .clab-table-size-outline .clab-table-size-edge:is(:hover,[aria-pressed=true]){color:#bcbcbc}
    .clab-table-size-edge::after{content:'';position:absolute;background:currentColor;pointer-events:none}
    .clab-table-size-edge:is([data-table-edge=top],[data-table-edge=bottom]){left:0;right:0;height:10px}
    .clab-table-size-edge[data-table-edge=top]{top:-5px}.clab-table-size-edge[data-table-edge=bottom]{bottom:-5px}
    .clab-table-size-edge:is([data-table-edge=top],[data-table-edge=bottom])::after{left:0;right:0;top:50%;height:1px}
    .clab-table-size-edge:is([data-table-edge=left],[data-table-edge=right]){top:0;bottom:0;width:10px}
    .clab-table-size-edge[data-table-edge=left]{left:-5px}.clab-table-size-edge[data-table-edge=right]{right:-5px}
    .clab-table-size-edge:is([data-table-edge=left],[data-table-edge=right])::after{top:0;bottom:0;left:50%;width:1px}
    .clab-table-size-field{display:flex;align-items:center;justify-content:space-between;gap:5px}
    .clab-table-size-field[data-table-size-field=width]{grid-area:width;align-self:end}
    .clab-table-size-field[data-table-size-field=height]{grid-area:height;align-self:start}
    .clab-table-size-field [data-table-dimension]{padding:3px 4px;white-space:nowrap;font:12px sans-serif}
    .clab-table-size-field [aria-pressed=true]{color:#eee;background:#ffffff0c}
    .clab-table-ratio-control{grid-area:slider;display:flex;flex-direction:column;gap:2px;min-width:0;margin:3px 0 5px}
    .clab-table-corner button[aria-pressed=true]{color:#eee;background:#26394b}
    .clab-table-ratio-control input[type=range]{appearance:none;width:100%;height:18px;margin:0;padding:0;border:0;border-radius:0;background:linear-gradient(#5b5b5b,#5b5b5b) center/100% 1px no-repeat;cursor:pointer;touch-action:none}
    .clab-table-ratio-control input[type=range]::-webkit-slider-thumb{appearance:none;width:10px;height:10px;border:0;border-radius:50%;background:#ccc}
    .clab-table-ratio-control input[type=range]::-moz-range-thumb{width:10px;height:10px;border:0;border-radius:50%;background:#ccc}
    .clab-table-appearance{flex-wrap:wrap}.clab-table-setting-line input[data-table-padding]{width:110px}.clab-table-column-panel [data-table-settings-error]:empty{display:none}
    .clab-table-values-editor{display:flex;flex-direction:column;gap:8px;min-height:0}.clab-table-values-editor .clab-xy-popup-error:empty{display:none}.clab-table-value-format{min-width:0;background:#202020;color:#bbb;border:1px solid #444;border-radius:3px;padding:3px 5px;font:12px sans-serif}
    #clab-panel[data-workspace-mode=table] .clab-area:has(.clab-upload-zone){justify-content:center;padding:var(--clab-table-media-padding,0)!important}
    #clab-panel[data-workspace-mode=table] .clab-area:has(.clab-upload-zone) > :is(.clab-input-header,.clab-input-body){
        zoom:var(--clab-table-media-zoom,1);
        box-sizing:border-box;
        min-width:0;
        overflow:hidden;
    }
    #clab-panel[data-workspace-mode=table] .clab-area:has(.clab-upload-zone) > .clab-input-header{
        flex:none;
        justify-content:center!important;
        padding:0!important;
    }
    #clab-panel[data-workspace-mode=table] .clab-area:has(.clab-upload-zone) > .clab-input-body{
        align-items:stretch;
        justify-content:center;
        padding:0!important;
    }
    #clab-panel[data-workspace-mode=table] .clab-area:has(.clab-upload-preview[hidden]) > .clab-input-body{flex:none}
    #clab-panel[data-workspace-mode=table] .clab-upload-zone{
        display:flex;
        flex-direction:column;
        flex:1;
        min-height:0;
        width:100%;
    }
    #clab-panel[data-workspace-mode=table] .clab-upload-preview:not([hidden]){
        flex:1;
        min-height:0;
        height:auto!important;
        aspect-ratio:auto!important;
        margin-bottom:4px;
    }
    #clab-panel[data-workspace-mode=table] .clab-upload-file-row{flex:none}
`;
