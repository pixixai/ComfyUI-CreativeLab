export function injectReviewStyles() {
    if (document.getElementById('clab-preview-review-styles')) return;
    const style = document.createElement('style'); style.id = 'clab-preview-review-styles';
    style.textContent = `
        .clab-preview-modal-panel{color-scheme:dark}.clab-preview-modal-head{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(max-content,1fr);align-items:center;gap:8px}
        .clab-preview-modal-body{position:relative}.clab-preview-modal-left{padding-left:26px}
        .clab-source-ruler{position:absolute;left:2px;top:50%;transform:translateY(-50%);max-height:66.666%;width:40px;z-index:25;overflow-y:auto;scrollbar-width:none;overscroll-behavior:contain}.clab-source-ruler[hidden]{display:none}.clab-source-ruler::-webkit-scrollbar{display:none}
        .clab-preview-modal-panel .clab-source-ruler button{display:flex;align-items:center;justify-content:flex-start;box-sizing:border-box;height:11px;min-height:11px;width:40px;padding:0 0 0 3px;border:0;background:transparent;cursor:pointer;outline:0}.clab-source-ruler button::before{content:'';width:6px;height:2px;background:#888;transform:scaleX(var(--clab-ruler-scale,1));transform-origin:left center;transition:background .12s,transform .16s ease-out}.clab-source-ruler button.is-workspace::before{width:12px}.clab-source-ruler button:is(:hover,:focus-visible,.active)::before{background:#eee;height:3px}
        .clab-source-ruler-tooltip{position:fixed;z-index:1000;pointer-events:none;width:180px;box-sizing:border-box;padding:8px;background:#242424;border:1px solid #555;border-radius:3px;color:#ddd;font:11px/1.5 sans-serif;overflow-wrap:anywhere}.clab-source-ruler-tooltip[hidden]{display:none}.clab-source-ruler-tooltip>div{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}.clab-source-ruler-tooltip img{display:block;width:100%;height:110px;object-fit:contain;background:#191919;margin-top:6px}
        .clab-review-head-actions{display:flex;align-items:center;gap:8px;min-width:0}
        .clab-review-workspaces{order:0;z-index:1}.clab-review-workspaces .clab-workspace-shell{cursor:default}
        :root[data-clab-workspace-tabs=bottom] .clab-review-workspaces{order:2}
        .clab-review-head-actions{justify-self:end}
        :is(.clab-preview-modal-left,.clab-preview-modal-center,.clab-preview-modal-right){scrollbar-width:thin;scrollbar-color:#555 transparent}
        :is(.clab-preview-modal-left,.clab-preview-modal-center,.clab-preview-modal-right)::-webkit-scrollbar{width:5px;height:5px}
        :is(.clab-preview-modal-left,.clab-preview-modal-center,.clab-preview-modal-right)::-webkit-scrollbar-track,:is(.clab-preview-modal-left,.clab-preview-modal-center,.clab-preview-modal-right)::-webkit-scrollbar-corner{background:transparent}
        :is(.clab-preview-modal-left,.clab-preview-modal-center,.clab-preview-modal-right)::-webkit-scrollbar-thumb{background:#555;border-radius:3px}
        :is(.clab-preview-modal-left,.clab-preview-modal-center,.clab-preview-modal-right)::-webkit-scrollbar-thumb:hover{background:#777}
        :is(.clab-preview-modal-left,.clab-preview-modal-center,.clab-preview-modal-right)::-webkit-scrollbar-button{display:none}
        @supports selector(::-webkit-scrollbar){:is(.clab-preview-modal-left,.clab-preview-modal-center,.clab-preview-modal-right){scrollbar-width:auto;scrollbar-color:auto}}
        .clab-review-modes{display:flex;align-items:center;gap:2px;min-width:0;max-width:100%;overflow:auto;scrollbar-width:none}.clab-review-export{display:flex;flex-wrap:wrap;gap:6px}.clab-review-export[hidden]{display:none}
        .clab-preview-modal-panel :is(button,select,input):not(.clab-review-grid *, .clab-workspace-tab *, .clab-toolbar-type *, .clab-multi-z-summary *){font:12px sans-serif}
        .clab-review-modes button{border:0;border-radius:6px;background:transparent;color:#999;padding:5px 12px;cursor:pointer;white-space:nowrap}
        .clab-review-modes button:hover{color:#fff}.clab-review-modes [aria-pressed=true]{background:#ffffff16;color:#fff;font-weight:600}
        .clab-review-export button,.clab-review-selection button,.clab-compare button,.clab-review-column-move button{background:#292929;border:1px solid #444;border-radius:5px;color:#bbb;padding:5px 8px;cursor:pointer}
        .clab-preview-modal-panel button:disabled{opacity:.5;cursor:default}
        .clab-preview-modal-panel select,.clab-review-field input{min-width:0;background:#242424;color:#ccc;border:1px solid #444;border-radius:4px;padding:5px;max-width:100%}
        .clab-review-notice{font:12px/1.5 sans-serif;color:#c8b283;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .clab-review-field{display:flex;flex-direction:column;gap:5px;color:#aaa;font:12px/1.4 sans-serif;min-width:0;margin-bottom:8px}
        .clab-review-field select{width:100%}.clab-review-section{font:12px sans-serif;color:#ddd;border-bottom:1px solid #444;padding:8px 0}
        .clab-review-note{font:11px/1.6 sans-serif;color:#999;overflow-wrap:anywhere}.clab-review-selection{display:flex;flex-wrap:wrap;gap:5px;align-items:center;color:#999;font:11px sans-serif}
        .clab-review-record-row{display:flex;align-items:center;gap:5px;margin:6px 0}.clab-review-record-row>.clab-preview-modal-thumb{flex:1;min-width:0;width:100%}
        .clab-preview-modal-left details{min-width:0;flex-shrink:0}.clab-preview-modal-left summary{font:12px/1.6 sans-serif;color:#bbb;cursor:pointer;overflow-wrap:anywhere}.clab-preview-modal-left summary small{color:#888}
        .clab-preview-modal-left .clab-preview-modal-thumb-media{height:76px;min-height:0}.clab-preview-modal-thumb-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .clab-preview-modal[data-review-mode=compare] .clab-preview-modal-center{flex-direction:column;align-items:stretch;justify-content:flex-start;padding:0;gap:0;min-width:0;overflow:hidden}
        .clab-compare{display:flex;flex-direction:column;flex:1;min-height:0;min-width:0;width:100%;height:100%}
        .clab-compare-layout.clab-review-segment{display:flex;align-items:center;gap:2px;padding:2px;border:1px solid #444;border-radius:16px;background:#202020}
        .clab-compare-layout{position:absolute;z-index:4;left:50%;bottom:39px;transform:translateX(-50%);justify-content:center;min-height:0;white-space:nowrap}
        .clab-compare .clab-compare-layout button{border:0;background:transparent;border-radius:10px;padding:3px 9px;color:#aaa;font-size:11px;font-weight:400;line-height:14px;cursor:pointer}
        .clab-compare .clab-compare-layout button:hover{color:#eee}.clab-compare .clab-compare-layout button[aria-pressed=true]{background:#444;color:#fff;font-weight:700}
        .clab-compare-stage{--compare-line-color:#555;position:relative;min-height:120px;flex:1;display:grid;grid-template-columns:1fr 1fr;overflow:hidden;background:#141414;touch-action:none;user-select:none}
        .clab-compare-pane{position:relative;min-width:0;overflow:hidden}.clab-compare-transform{position:absolute;inset:0;transform-origin:center}
        .clab-compare-transform img,.clab-compare-transform video{width:100%;height:100%;display:block;object-fit:contain;pointer-events:none}
        .clab-compare-stage.split{display:block}.clab-compare-stage.split .clab-compare-pane{position:absolute;inset:0;border:0}.clab-compare-stage.split .layer-b{clip-path:inset(0 0 0 var(--compare-split,50%))}
        .clab-compare-divider{position:absolute;z-index:2;top:0;bottom:0;left:var(--compare-split,50%);width:1px;transform:translateX(-50%);background:var(--compare-line-color);mask-image:linear-gradient(#000 calc(50% - 11px),transparent calc(50% - 11px),transparent calc(50% + 11px),#000 calc(50% + 11px));pointer-events:none;box-shadow:none}
        .clab-compare-stage.split{--compare-line-color:#ddd}
        .clab-compare .clab-compare-label{position:absolute;z-index:4;top:8px;display:flex;align-items:center;max-width:calc(50% - 24px);min-width:0;gap:7px;padding:0;background:transparent;border:0;border-radius:0;color:#aaa;cursor:pointer;font:11px sans-serif}
        .clab-compare-label.label-a{left:8px}.clab-compare-label.label-b{right:8px;text-align:right}
        .clab-compare-label span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .clab-compare-label strong{display:flex;align-items:center;justify-content:center;flex-shrink:0;width:20px;height:20px;border-radius:3px;background:#252525b3;color:#999;font-size:11px;transition:background .15s,color .15s}
        .clab-compare-label-separator{display:block;width:1px;height:12px;flex-shrink:0;background:#8889}
        .clab-compare .clab-compare-label:hover{color:#fff}.clab-compare .clab-compare-label[aria-pressed=true] strong{background:#596973;color:#fff}
        .clab-compare .clab-compare-swap{position:absolute;z-index:5;left:var(--compare-split,50%);top:50%;transform:translate(-50%,-50%);display:flex;align-items:center;justify-content:center;width:28px;height:28px;padding:0;border:0;border-radius:50%;background:transparent;color:var(--compare-line-color);cursor:pointer}
        .clab-compare .clab-compare-swap{transition:color .16s}
        .clab-compare .clab-compare-swap circle[stroke="currentColor"]{transition:stroke-width .16s}
        .clab-compare .clab-compare-swap path{color:#aaa;transition:color .16s}
        .clab-compare .clab-compare-swap:is(:hover,:focus-visible){color:#fff;background:transparent}
        .clab-compare .clab-compare-swap:is(:hover,:focus-visible) path{color:#fff}
        .clab-compare .clab-compare-swap:is(:hover,:focus-visible) circle[stroke="currentColor"]{stroke-width:1.7}
        .clab-compare-status{position:absolute;z-index:3;left:8px;right:8px;bottom:11px;pointer-events:none;color:#aaa;font:11px/1.5 sans-serif}
        .clab-compare-status:empty{display:none}.clab-compare-stage:has(.clab-video-controls) .clab-compare-status{bottom:76px}
        .clab-compare-empty{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;color:#888;padding:40px 10px;font:12px/2 sans-serif}
        .clab-compare-stage :is(button,input,select,strong,span,svg),.clab-compare-layout,.clab-compare-status{box-shadow:none;text-shadow:none;filter:none}
        .clab-preview-video{touch-action:none;user-select:none}
        .clab-preview-pan{cursor:grab;touch-action:none;user-select:none}
        .clab-preview-pan.is-panning{cursor:grabbing}
        .clab-preview-pan.is-panning .clab-preview-modal-main-image{transition:none}
        .clab-preview-video-transform{position:absolute;inset:0;transform-origin:center}
        .clab-preview-video .clab-preview-modal-main-video{width:100%;height:100%;object-fit:contain;border-radius:0;box-shadow:none;pointer-events:none}
        .clab-preview-video .clab-video-controls,.clab-compare-stage>.clab-video-controls{z-index:3}
        .clab-preview-modal-panel .clab-video-controls .clab-media-opt-btn{padding:4px;border:0;background:transparent;color:#aaa;border-radius:4px}
        .clab-preview-modal-panel .clab-video-controls .clab-media-opt-btn:hover{color:#fff}
        .clab-preview-modal-panel .clab-video-controls [data-compare-audio]{font:11px/1 sans-serif;height:24px;padding:2px 3px;border:0;background:transparent;color:#aaa}
        .clab-preview-video-status{position:absolute;left:8px;right:8px;bottom:50px;color:#c8b283;font:12px/1.5 sans-serif;pointer-events:none}
        .clab-preview-video-status:empty{display:none}
        @media(prefers-reduced-motion:reduce){.clab-compare .clab-compare-swap,.clab-compare .clab-compare-swap path,.clab-compare .clab-compare-swap circle{transition:none}}
        .clab-compare-stage[data-drop-slot]::after{content:'放入 ' attr(data-drop-slot);position:absolute;z-index:3;top:0;bottom:0;left:0;width:var(--compare-split,50%);box-sizing:border-box;display:flex;align-items:center;justify-content:center;border:2px dashed #98bed7;background:#5c91b42b;color:#ddd;text-transform:uppercase;font:14px sans-serif;pointer-events:none}
        .clab-compare-stage[data-drop-slot=b]::after{left:var(--compare-split,50%);width:calc(100% - var(--compare-split,50%))}
        .clab-compare-parameters{border-collapse:collapse;table-layout:fixed;width:100%;font:11px/1.5 sans-serif;color:#aaa}.clab-compare-parameters th,.clab-compare-parameters td{border:1px solid #3c3c3c;padding:6px;overflow-wrap:anywhere;white-space:pre-wrap;text-align:left;font-weight:normal}
        .clab-compare-parameters .different{background:#303940;color:#ddd}

        .clab-preview-modal:is([data-review-mode=xy],[data-review-mode=table]) .clab-preview-modal-center{display:block;overflow:auto;min-width:0}
        .clab-review-sheet-settings{color:#aaa;font:12px/1.5 sans-serif}.clab-review-sheet-settings section{display:flex;flex-direction:column;gap:8px;padding:12px 0}
        .clab-review-sheet-settings section:first-child{padding-top:0}.clab-review-sheet-settings section+section{border-top:2px solid #161616}
        .clab-preview-modal-right .clab-review-downloads{display:flex;flex-direction:column;gap:8px;margin-top:10px;padding:12px 0 0;border-top:2px solid #161616;color:#aaa;font:12px/1.5 sans-serif}
        .clab-review-downloads h3{margin:0;color:#ddd;font-size:14px}.clab-review-downloads :is(.clab-review-note,.clab-review-field){margin:0}
        .clab-review-downloads .clab-review-download-format{display:flex;flex-direction:row;align-items:center;justify-content:space-between}
        .clab-review-json-kinds{display:flex;flex-wrap:wrap;gap:8px 12px}
        .clab-review-data-export .clab-review-downloads{margin-top:12px}
        .clab-review-downloads button:disabled{opacity:.45;cursor:default}
        .clab-result-record.is-download-selected{background:#233748;border-radius:3px;outline:1px solid #6289a7}
        .clab-review-sheet-settings h3{margin:0;color:#ddd;font-size:14px}.clab-review-sheet-settings .clab-review-field{margin:0}
        .clab-review-png-scale{flex-direction:row;align-items:center;justify-content:flex-start;gap:6px}.clab-review-png-scale input{width:64px;flex:none}
        .clab-review-layout-export{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}
        .clab-review-layout-export button{min-width:0;padding:6px 8px}
        .clab-review-layout-export :is([data-review-export=xlsx],[data-review-export=html]){grid-column:1/-1}
        .clab-review-sheet-settings .clab-review-note{margin:0}
        .clab-result-sheet{font:12px/1.5 sans-serif;color:#ccc;min-width:0}.clab-result-sheet h3{font-size:13px;font-weight:normal;margin:4px 0 8px;overflow-wrap:anywhere}
        .clab-result-table{border-collapse:collapse}.clab-result-table td,.clab-result-table th{border:1px solid #444;vertical-align:top;min-width:var(--review-media-width);max-width:var(--review-media-width);padding:10px;overflow-wrap:anywhere;white-space:pre-wrap;text-align:left}
        .clab-result-table th{background:#292929;font-weight:normal;position:sticky;top:-10px;z-index:1}
        .clab-result-table tfoot th{top:auto;bottom:-10px}.clab-result-record audio{width:100%}
        .clab-result-record{border-bottom:1px solid #333;padding:5px 0}.clab-result-record:last-child{border:0}.clab-result-record img,.clab-result-record video{width:var(--review-media-width);max-height:220px;object-fit:contain;display:block;background:#111}
        .clab-result-record pre{white-space:pre-wrap;max-height:180px;overflow:auto;margin:0}.clab-result-record a{color:#9dc9ff}.clab-result-record button{color:#999;border:0;background:transparent;padding:4px 0;cursor:pointer;text-align:left}
        .clab-review-check{display:flex;align-items:center;gap:5px;overflow-wrap:anywhere;font:11px/1.5 sans-serif;color:#aaa}.clab-review-check input{flex-shrink:0}.clab-review-column-move{display:flex;gap:3px;margin-left:auto}.clab-review-column-move button{padding:1px 4px}
        .clab-preview-modal[data-review-layout=workspace] .clab-preview-modal-body{grid-template-columns:var(--browse-source-width,220px) 6px minmax(0,1fr) 6px var(--browse-parameter-width,300px);grid-template-rows:minmax(0,1fr);position:relative;min-width:0}
        .clab-preview-modal[data-review-layout=workspace] .clab-preview-modal-left{grid-column:1;grid-row:1;min-width:0;padding:12px 12px 12px 26px;border:0}
        .clab-preview-modal[data-review-layout=workspace] .clab-preview-modal-center{grid-column:3;grid-row:1;min-width:0;min-height:0}
        .clab-preview-modal[data-review-layout=workspace] .clab-preview-modal-right{grid-column:5;grid-row:1;min-width:0;max-height:none;border:0}
        .clab-preview-modal[data-review-layout=workspace][data-source-collapsed=true] .clab-preview-modal-left,.clab-preview-modal[data-review-layout=workspace][data-parameter-collapsed=true] .clab-preview-modal-right{display:none}
        .clab-browse-side-resize{display:none}.clab-preview-modal[data-review-layout=workspace] .clab-browse-side-resize{display:block;grid-row:1;position:relative;cursor:ew-resize;touch-action:none;background:linear-gradient(to right,transparent 2px,#444 2px,#444 3px,transparent 3px)}
        .clab-browse-side-resize.sources{grid-column:2}.clab-browse-side-resize.parameters{grid-column:4}
        .clab-preview-modal[data-workspace-sheet] .clab-preview-modal-center{padding:0;overflow:hidden}
        .clab-review-grid,.clab-review-grid-stage{height:100%;min-height:0;min-width:0;box-sizing:border-box}
        .clab-review-grid-stage{outline:none;touch-action:none}
        .clab-review-grid[data-workspace-mode=table] .clab-review-grid-stage{touch-action:auto}
        .clab-review-grid .clab-card{user-select:none}
        .clab-review-grid .clab-table-column-top [data-table-row-title]{min-width:0;max-width:100%;text-align:left}
        .clab-review-grid :is(.clab-xy-axis,.clab-axis-label,.clab-xy-binding){cursor:grab}
        :is(.clab-review-grid-stage,.clab-xy-layer-axes)[data-hidden-axes~="x"] [data-xy-edit-values=x],
        :is(.clab-review-grid-stage,.clab-xy-layer-axes)[data-hidden-axes~="y"] [data-xy-edit-values=y],
        :is(.clab-review-grid-stage,.clab-xy-layer-axes)[data-hidden-axes~="z"] :is([data-xy-edit-values=z],.clab-z-tick),
        :is(.clab-review-grid-stage,.clab-xy-layer-axes)[data-hidden-bindings~="x"] [data-xy-part=x-binding],
        :is(.clab-review-grid-stage,.clab-xy-layer-axes)[data-hidden-bindings~="y"] [data-xy-part=y-binding],
        :is(.clab-review-grid-stage,.clab-xy-layer-axes)[data-hidden-bindings~="z"] .clab-xy-z-binding{visibility:hidden;pointer-events:none}
        .clab-review-xy-tiling-section{display:flex;flex-direction:column;gap:8px;margin:2px 0;padding:8px 0;border-top:1px solid #ffffff0d;border-bottom:1px solid #ffffff0d}
        .clab-xy-tiling-inline[hidden]{display:none!important}.clab-review-sheet-settings .clab-xy-tiling-inline .clab-xy-tiling-fields{padding:4px 0 9px}
        .clab-review-xy-visibility{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:5px 8px}
        .clab-review-xy-options{display:flex;gap:6px;flex-wrap:wrap}
        .clab-review-xy-options>button{color:#aaa;background:#282828;border:1px solid #444;border-radius:4px;padding:4px 7px;cursor:pointer}
        .clab-review-xy-options>button:hover:not(:disabled){color:#eee}
        .clab-review-grid-stage :is([data-xy-z-layer],[data-xy-toggle-layers],[data-xy-z-more]){cursor:pointer}
        .clab-review-xy-sources h3{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .clab-review-xy-source-value{min-width:0}.clab-review-xy-source-value input{flex:none}.clab-review-xy-source-value>span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .clab-review-xy-cell-info{margin:0;min-width:0;display:grid;gap:5px}.clab-review-xy-cell-info dt{color:#888;font-size:11px}.clab-review-xy-cell-info dd{margin:0 0 7px;white-space:pre-wrap;overflow-wrap:anywhere;color:#bbb;font-size:12px;line-height:1.6}
        .clab-review-xy-empty{position:absolute;inset:0;display:grid;place-items:center;margin:0;padding:20px;color:#888;font:12px/1.6 sans-serif;pointer-events:none;text-align:center}
        .clab-review-xy-records{position:absolute;box-sizing:border-box;padding:calc(8px * var(--xy-ui-scale));background:#181818cc;border:0;box-shadow:inset 0 0 0 calc(1px * var(--xy-ui-scale)) #ffffff20;color:#bbb;font:calc(12px * var(--xy-ui-scale))/1.5 sans-serif;overflow-wrap:anywhere;pointer-events:auto;z-index:5}
        .clab-review-xy-records>[role=row]{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr) minmax(0,1.4fr);gap:calc(8px * var(--xy-ui-scale));padding:calc(4px * var(--xy-ui-scale)) 0;border-bottom:0;box-shadow:inset 0 calc(-1px * var(--xy-ui-scale)) #ffffff12}.clab-review-xy-records>[role=row]:last-child{border-bottom:0}.clab-review-xy-records .clab-review-xy-records-head{color:#888}.clab-review-xy-records [role=cell]{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.clab-review-xy-records [data-record-value]{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;white-space:pre-wrap}
        .clab-review-xy-records.is-expanded>[role=row]{grid-template-columns:minmax(0,1fr) minmax(0,1fr) minmax(0,2fr)}.clab-review-xy-records.is-expanded [role=cell]{display:block;white-space:pre-wrap;overflow:visible;text-overflow:clip;-webkit-line-clamp:unset;overflow-wrap:anywhere}
        .clab-review-axis-settings{padding:6px 0;border-bottom:1px solid #444}.clab-review-axis-settings summary{cursor:pointer;color:#ccc;margin-bottom:5px}
        .clab-review-sheet-settings button[data-review-xy-fit]{padding:5px 7px;background:#232323;color:#aaa;border:1px solid #444;border-radius:5px;text-align:center;cursor:pointer;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .clab-review-cell-settings{padding:0!important;overflow:visible!important}.clab-review-cell-settings [data-table-settings-error]:empty{display:none}
        .clab-review-cell-settings .clab-table-size-stage{grid-template-columns:minmax(0,1fr)}
        @media(max-width:620px){
            .clab-preview-modal-head{grid-template-columns:minmax(0,.3fr) minmax(0,1fr) auto;gap:4px}
            .clab-review-modes{justify-self:center}
        }
        .clab-browse-side-resize::after{content:'';position:absolute;top:calc(50% - 20px);left:2px;width:2px;height:40px;border-radius:2px;background:#666}
        .clab-browse-side-resize:hover::after,.clab-browse-side-resize:focus-visible::after{background:#aaa}
        .clab-browse-side-resize[data-collapsed=true]::after{display:none}
        .clab-preview-modal-panel [data-browse-restore]{position:absolute;z-index:4;top:calc(50% - 16px);width:16px;height:32px;padding:0;border:1px solid #444;border-radius:0 4px 4px 0;background:#202020;color:#999;display:flex;align-items:center;justify-content:center;cursor:pointer;touch-action:manipulation}
        .clab-preview-modal-panel [data-browse-restore]:hover{color:#fff;background:#303030}
        .clab-preview-modal-panel [data-browse-restore][hidden]{display:none}
        .clab-browse-side-resize.sources [data-browse-restore]{left:0}
        .clab-browse-side-resize.parameters [data-browse-restore]{right:0;border-radius:4px 0 0 4px}
        [data-browse-restore=parameters] svg{transform:rotate(180deg)}
        .clab-sidebar-resizing{user-select:none;cursor:ew-resize}.clab-sidebar-resizing *{cursor:ew-resize!important}
        .clab-browse-source-head{color:#ccc;font:12px sans-serif}
        .clab-browse-source-actions button{border:1px solid #444;border-radius:4px;background:#242424;color:#aaa;padding:3px 7px;cursor:pointer;white-space:nowrap}
        .clab-browse-source-actions button:hover{color:#fff}
        .clab-browse-source-actions{display:flex;align-items:center;gap:5px;color:#888;font:11px sans-serif}.clab-browse-source-actions small{margin-left:auto}
        .clab-browse-source-tree details{margin-bottom:7px}.clab-browse-source-tree summary{display:flex;align-items:center;gap:5px;padding:5px 0;list-style:none;min-width:0;cursor:default}
        .clab-browse-source-tree summary::-webkit-details-marker{display:none}
        [data-browse-fold]{width:13px;align-self:stretch;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0}
        [data-browse-fold]::before{content:'▸';font-size:10px;color:#888}.clab-browse-source-tree details[open]>summary [data-browse-fold]::before{content:'▾'}
        .clab-browse-source-tree [data-browse-card-name]{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;text-align:left;background:transparent;border:0;padding:0;color:inherit;cursor:pointer}
        .clab-browse-source-tree [data-browse-card-name]:hover{color:#fff}
        .clab-browse-source-row>span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1}
        .clab-browse-source-tree small{margin-left:auto;flex-shrink:0;color:#888}.clab-browse-source-tree input{margin:0;accent-color:#8babc1;flex-shrink:0}
        .clab-browse-source-row{display:flex;align-items:center;gap:6px;margin-left:18px;padding:5px 0;color:#aaa;font:12px/1.5 sans-serif;cursor:pointer;min-width:0}
        .clab-browse-source-row:has(input:checked){color:#ddd}.clab-browse-source-row:has(input:disabled){opacity:.5;cursor:default}
        .clab-source-controls{position:sticky;top:-12px;z-index:4;display:flex;flex-direction:column;gap:8px;flex:none;margin:-12px -12px 0;padding:12px;background:#191919;border-bottom:1px solid #ffffff12}
        .clab-preview-modal:is([data-review-mode=browse],[data-review-mode=compare],[data-review-mode=detail]) .clab-preview-modal-left{scroll-padding-top:var(--browse-controls-height,200px);scroll-padding-bottom:12px}
        .clab-source-search{display:flex;align-items:center;min-width:0;border:1px solid #444;border-radius:4px;background:#242424;overflow:hidden}
        .clab-source-search:focus-within{border-color:#777}
        .clab-source-type{position:relative;flex-shrink:0;border-right:1px solid #444}
        .clab-source-type::after{content:'';position:absolute;right:7px;top:50%;margin-top:-2px;border-left:3px solid transparent;border-right:3px solid transparent;border-top:4px solid #999;pointer-events:none}
        .clab-source-search select{appearance:none;width:62px;border:0;border-radius:0;background:transparent;padding:6px 17px 6px 7px;cursor:pointer}
        .clab-source-search option{background:#242424;color:#ccc}
        .clab-source-search input{flex:1;width:0;min-width:0;max-width:100%;padding:6px 7px;border:0;border-radius:0;background:transparent;color:#ccc;outline:none;box-shadow:none}
        .clab-source-cover-frame [data-browse-reverse]{position:absolute;right:4px;bottom:4px;display:grid;place-items:center;width:24px;height:24px;padding:0;border:0;border-radius:3px;background:#191919b3;color:#bbb;opacity:0;cursor:pointer}
        .clab-source-cover-frame [data-browse-reverse]:disabled{opacity:0}
        .clab-source-module:hover [data-browse-reverse],.clab-source-cover-frame [data-browse-reverse]:focus-visible{opacity:1}
        .clab-source-module:hover [data-browse-reverse]:disabled{opacity:.35}
        .clab-source-cover-frame [data-browse-reverse]:hover{color:#fff;background:#303030e6}
        [data-browse-reverse][aria-pressed=true] svg{transform:scaleY(-1)}
        .clab-browse-thumb-size{display:flex;align-items:center;gap:8px}
        .clab-browse-thumb-size input[type=range]{appearance:none;flex:1;min-width:0;height:2px;background:#555;outline:none;padding:0;border:0;border-radius:2px;cursor:pointer}
        .clab-browse-thumb-size input[type=range]::-webkit-slider-thumb{appearance:none;width:8px;height:8px;border-radius:50%;background:#aaa}
        .clab-browse-thumb-size input[type=range]::-moz-range-thumb{width:8px;height:8px;border:0;border-radius:50%;background:#aaa}
        .clab-browse-thumb-size [data-browse-columns-reset]{display:flex;align-items:center;justify-content:center;padding:2px;background:transparent;color:#999;border:0;cursor:pointer}
        .clab-browse-thumb-size [data-browse-columns-reset]:hover{color:#fff}
        .clab-browse-thumb-size output{min-width:3em;color:#999;font:11px sans-serif;text-align:right}
        .clab-source-controls .clab-browse-source-actions{min-width:0}
        .clab-source-controls .clab-browse-source-actions button{flex-shrink:0}
        .clab-grid-source-actions{min-width:0}.clab-grid-source-actions button{flex-shrink:0}
        .clab-browse-status{display:block;flex:1;min-width:0;margin-left:auto;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:right;font:10px/1.4 sans-serif;color:#888}
        .clab-source-media-tree{flex:none;min-width:0}
        .clab-source-media-tree>details{position:relative;margin:0 0 14px;padding-bottom:4px}
        .clab-source-media-tree>details[open]:has(>.clab-source-module)::before{content:'';position:absolute;left:6px;top:27px;bottom:4px;border-left:1px dashed #ffffff30;pointer-events:none}
        .clab-source-media-tree>details>summary{position:relative;padding:6px 0;color:#ccc;font:12px/1.5 sans-serif}
        .clab-source-module{position:relative;display:grid;grid-template-columns:13px minmax(0,1fr);column-gap:5px;min-width:0;margin:6px 0 12px 18px}
        .clab-source-module-check{position:relative;grid-column:1;grid-row:1;align-self:start;display:grid;place-items:center;height:13px;background:#191919;cursor:pointer}
        .clab-source-cover-frame{position:relative;grid-column:2;grid-row:1;min-width:0}
        .clab-source-media-tree .clab-source-cover{display:flex;align-items:center;justify-content:center;width:100%;aspect-ratio:var(--source-media-ratio,1.6);box-sizing:border-box;overflow:hidden;padding:0;border:1px solid #ffffff19;border-radius:3px;background:#111}
        .clab-source-cover :is(img,video){width:100%;height:100%;object-fit:contain;display:block;pointer-events:none}
        .clab-source-module.is-unchecked .clab-source-cover{opacity:.4}
        .clab-source-cover:disabled{cursor:default}
        .clab-source-module-caption{position:absolute;left:0;right:0;bottom:0;display:flex;align-items:center;gap:4px;min-width:0;padding:14px 4px 4px 6px;border-radius:0 0 3px 3px;background:linear-gradient(transparent,#000a);color:#ddd;font:11px/1.5 sans-serif;pointer-events:none}
        .clab-source-module-caption>span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;cursor:pointer;pointer-events:auto}
        .clab-source-module-caption small{display:flex;align-items:center;justify-content:flex-end;flex:none;min-width:24px;height:24px;margin:0;white-space:nowrap;font:inherit;color:#ccc}
        .clab-source-module:hover .clab-source-module-caption small,.clab-source-cover-frame:has(>[data-browse-reverse]:focus-visible) .clab-source-module-caption small{visibility:hidden}
        .clab-source-module.is-unchecked .clab-source-module-caption{opacity:.6}
        .clab-source-history{grid-column:2;display:none;gap:7px;grid-template-columns:repeat(var(--browse-thumb-columns,2),minmax(0,1fr));min-width:0;padding:7px 0 0}
        .clab-source-module.is-expanded>.clab-source-history{display:grid}
        .clab-filmstrip-item{position:relative;min-width:0;aspect-ratio:var(--source-media-ratio,1.6)}
        .clab-source-history .clab-filmstrip-thumb{display:flex;width:100%;height:100%;box-sizing:border-box;min-width:0;min-height:0;overflow:hidden;padding:0;border:1px solid #ffffff21;border-radius:3px;background:#111;cursor:grab}
        .clab-filmstrip-thumb .clab-preview-modal-thumb-media{min-width:0;min-height:0;flex:1;height:100%;width:100%;aspect-ratio:auto;border-radius:2px;overflow:hidden;background:#111}
        .clab-filmstrip-thumb :is(img,video){display:block;width:100%;height:100%;object-fit:contain;pointer-events:none}
        .clab-source-history .clab-filmstrip-thumb.active{border-color:#97b7cc;background:#23313c;box-shadow:inset 0 0 0 1px #97b7cc}
        .clab-source-history .clab-filmstrip-thumb.selected{border-color:#7091a7}
        .clab-filmstrip-item [data-filmstrip-cover]{position:absolute;top:4px;left:4px;display:grid;place-items:center;width:22px;height:22px;padding:3px;border:0;border-radius:3px;background:#191919d9;color:#aaa;opacity:0;cursor:pointer}
        .clab-filmstrip-item:hover [data-filmstrip-cover],.clab-filmstrip-item [data-filmstrip-cover]:focus-visible,.clab-filmstrip-item [data-filmstrip-cover][aria-pressed=true]{opacity:1}
        .clab-filmstrip-item [data-filmstrip-cover]:hover,.clab-filmstrip-item [data-filmstrip-cover][aria-pressed=true]{color:#fff;background:#303030e6}
        .clab-filmstrip-item [data-filmstrip-cover] svg{width:16px;height:16px;pointer-events:none}
        .clab-filmstrip-assignment{position:absolute;top:4px;right:4px;display:flex;gap:3px;pointer-events:none}
        .clab-filmstrip-assignment[hidden]{display:none}
        .clab-filmstrip-assignment>span{display:grid;place-items:center;width:18px;height:18px;border-radius:3px;background:#243f52e6;color:#d5e9f6;font:10px/14px sans-serif;box-shadow:none;text-shadow:none}
        .clab-filmstrip-history{position:absolute;bottom:4px;right:4px;padding:1px 3px;border-radius:2px;background:#111b;color:#bbb;font:10px/14px sans-serif;pointer-events:none}
        .clab-source-empty{color:#777;font:11px/1.5 sans-serif}
        .clab-source-media-tree .drop-before::before,.clab-source-media-tree .drop-after::after{content:'';position:absolute;z-index:3;pointer-events:none;background:#a8cde6}
        .clab-source-history.drop-after::after{left:0;right:0;height:2px;bottom:-3px}
        .clab-filmstrip-thumb.drop-before::before{left:0;top:0;bottom:0;width:2px}
        .clab-filmstrip-cover-menu{position:fixed;inset:auto;margin:0;padding:4px;min-width:108px;background:#262626;border:1px solid #484848;border-radius:5px;color:#ddd}
        .clab-filmstrip-cover-menu button{display:block;width:100%;padding:6px 9px;border:0;border-radius:3px;background:transparent;color:inherit;text-align:left;white-space:nowrap;font:12px sans-serif;cursor:pointer}
        .clab-filmstrip-cover-menu button:hover,.clab-filmstrip-cover-menu button:focus-visible{background:#3b3b3b;color:#fff}
        @media(max-width:1100px){.clab-preview-modal-body{grid-template-columns:165px minmax(0,1fr) 220px}}
        @media(max-width:760px){.clab-preview-modal-body{grid-template-columns:125px minmax(0,1fr)}.clab-preview-modal-right{grid-column:1/-1;max-height:180px;border-top:1px solid #444}.clab-preview-modal-body{grid-template-rows:minmax(180px,1fr) auto}.clab-review-modes button{padding:4px 8px}}
    `;
    document.head.appendChild(style);
}
