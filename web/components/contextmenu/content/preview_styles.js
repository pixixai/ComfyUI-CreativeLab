export function injectReviewStyles() {
    if (document.getElementById('clab-preview-review-styles')) return;
    const style = document.createElement('style'); style.id = 'clab-preview-review-styles';
    style.textContent = `
        .clab-preview-modal-panel{color-scheme:dark}.clab-preview-modal-head{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);gap:12px}.clab-preview-modal-title{min-width:0;font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.clab-review-head-actions{display:flex;justify-content:flex-end;gap:10px;min-width:0}
        .clab-review-modes{margin:auto}.clab-review-export{display:flex;gap:6px}.clab-review-export[hidden]{display:none}
        .clab-preview-modal-panel button,.clab-preview-modal-panel select,.clab-preview-modal-panel input{font:12px sans-serif}
        .clab-review-segment{display:flex;align-items:center;padding:2px;gap:2px;border:1px solid #444;border-radius:16px;background:#202020;flex-shrink:0}
        .clab-review-segment button{border:0;border-radius:12px;background:transparent;color:#999;padding:5px 12px;cursor:pointer;white-space:nowrap}
        .clab-review-segment button:hover{color:#fff}.clab-review-segment [aria-pressed=true]{background:#444;color:#fff}
        .clab-review-export button,.clab-review-selection button,.clab-compare button,.clab-review-column-move button{background:#292929;border:1px solid #444;border-radius:5px;color:#bbb;padding:5px 8px;cursor:pointer}
        .clab-preview-modal-panel button:disabled{opacity:.5;cursor:default}
        .clab-preview-modal-panel select,.clab-review-field input{min-width:0;background:#242424;color:#ccc;border:1px solid #444;border-radius:4px;padding:5px;max-width:100%}
        .clab-review-notice{font:12px/1.5 sans-serif;color:#c8b283;padding:0 14px}.clab-review-notice:empty{display:none}
        .clab-review-field{display:flex;flex-direction:column;gap:5px;color:#aaa;font:12px/1.4 sans-serif;min-width:0;margin-bottom:8px}
        .clab-review-field select{width:100%}.clab-review-section{font:12px sans-serif;color:#ddd;border-bottom:1px solid #444;padding:8px 0}
        .clab-review-note{font:11px/1.6 sans-serif;color:#999;overflow-wrap:anywhere}.clab-review-selection{display:flex;flex-wrap:wrap;gap:5px;align-items:center;color:#999;font:11px sans-serif}
        .clab-review-record-row{display:flex;align-items:center;gap:5px;margin:6px 0}.clab-review-record-row>.clab-preview-modal-thumb{flex:1;min-width:0;width:100%}
        .clab-preview-modal-left details{min-width:0;flex-shrink:0}.clab-preview-modal-left summary{font:12px/1.6 sans-serif;color:#bbb;cursor:pointer;overflow-wrap:anywhere}.clab-preview-modal-left summary small{color:#888}
        .clab-preview-modal-left .clab-preview-modal-thumb-media{height:76px;min-height:0}.clab-preview-modal-thumb-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .clab-preview-modal[data-review-mode=compare] .clab-preview-modal-center{flex-direction:column;align-items:stretch;gap:8px;min-width:0}
        .clab-compare-layout{align-self:center}.clab-compare{display:flex;flex-direction:column;flex:1;min-height:0;gap:8px;min-width:0}
        .clab-compare-slots{display:flex;gap:6px;min-width:0}.clab-compare-slots .clab-compare-slot{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0;text-align:left}
        .clab-compare-slots [aria-pressed=true]{border-color:#799db7;color:#eee}.clab-compare-stage{position:relative;min-height:120px;flex:1;display:grid;grid-template-columns:1fr 1fr;overflow:hidden;background:#141414;touch-action:none;user-select:none}
        .clab-compare-pane{position:relative;min-width:0;overflow:hidden;border:1px solid #383838}.clab-compare-transform{position:absolute;inset:0;transform-origin:center}
        .clab-compare-transform img,.clab-compare-transform video{width:100%;height:100%;display:block;object-fit:contain;pointer-events:none}
        .clab-compare-stage.split{display:block}.clab-compare-stage.split .clab-compare-pane{position:absolute;inset:0;border:0}.clab-compare-stage.split .layer-b{clip-path:inset(0 0 0 var(--compare-split,50%))}
        .clab-compare-divider{position:absolute;top:0;bottom:0;left:var(--compare-split,50%);width:1px;background:#eee;pointer-events:none;box-shadow:0 0 3px #000}
        .clab-compare-badge{position:absolute;top:8px;left:8px;background:#111b;color:#ddd;border:1px solid #555;border-radius:4px;padding:3px 6px;font:11px sans-serif;pointer-events:none}
        .layer-b .clab-compare-badge{left:auto;right:8px}.clab-compare-playback{display:flex;align-items:center;gap:7px;flex-wrap:wrap;color:#aaa;font:11px sans-serif}
        .clab-compare-playback input[type=range]{width:100%;accent-color:#aaa}.clab-compare-playback select{font-size:11px}
        .clab-compare-parameters{border-collapse:collapse;table-layout:fixed;width:100%;font:11px/1.5 sans-serif;color:#aaa}.clab-compare-parameters th,.clab-compare-parameters td{border:1px solid #3c3c3c;padding:6px;overflow-wrap:anywhere;white-space:pre-wrap;text-align:left;font-weight:normal}
        .clab-compare-parameters .different{background:#303940;color:#ddd}
        .clab-preview-modal[data-review-mode=table] .clab-preview-modal-body{grid-template-columns:200px minmax(0,1fr) 250px}
        .clab-preview-modal[data-review-mode=table] .clab-preview-modal-center{display:block;overflow:auto;min-width:0}
        .clab-result-sheet{font:12px/1.5 sans-serif;color:#ccc;min-width:0}.clab-result-sheet h3{font-size:13px;font-weight:normal;margin:4px 0 8px;overflow-wrap:anywhere}
        .clab-result-table{border-collapse:collapse}.clab-result-table td,.clab-result-table th{border:1px solid #444;vertical-align:top;min-width:var(--review-media-width);max-width:var(--review-media-width);padding:10px;overflow-wrap:anywhere;white-space:pre-wrap;text-align:left}
        .clab-result-table th{background:#292929;font-weight:normal;position:sticky;top:-10px;z-index:1}
        .clab-result-record{border-bottom:1px solid #333;padding:5px 0}.clab-result-record:last-child{border:0}.clab-result-record img,.clab-result-record video{width:var(--review-media-width);max-height:220px;object-fit:contain;display:block;background:#111}
        .clab-result-record pre{white-space:pre-wrap;max-height:180px;overflow:auto;margin:0}.clab-result-record a{color:#9dc9ff}.clab-result-record button{color:#999;border:0;background:transparent;padding:4px 0;cursor:pointer;text-align:left}
        .clab-review-check{display:flex;align-items:center;gap:5px;overflow-wrap:anywhere;font:11px/1.5 sans-serif;color:#aaa}.clab-review-check input{flex-shrink:0}.clab-review-column-move{display:flex;gap:3px;margin-left:auto}.clab-review-column-move button{padding:1px 4px}
        .clab-preview-modal[data-review-mode=browse] .clab-preview-modal-body{grid-template-columns:var(--browse-source-width,220px) 6px minmax(0,1fr) 6px var(--browse-parameter-width,300px);grid-template-rows:minmax(0,1fr);position:relative;min-width:0}
        .clab-preview-modal[data-review-mode=browse] .clab-preview-modal-left{grid-column:1;grid-row:1;min-width:0;padding:12px;border:0}
        .clab-preview-modal[data-review-mode=browse] .clab-preview-modal-center{grid-column:3;grid-row:1;min-width:0;min-height:0}
        .clab-preview-modal[data-review-mode=browse] .clab-preview-modal-right{grid-column:5;grid-row:1;min-width:0;max-height:none;border:0}
        .clab-preview-modal[data-review-mode=browse][data-source-collapsed=true] .clab-preview-modal-left,.clab-preview-modal[data-review-mode=browse][data-parameter-collapsed=true] .clab-preview-modal-right{display:none}
        .clab-browse-side-resize{display:none}.clab-preview-modal[data-review-mode=browse] .clab-browse-side-resize{display:block;grid-row:1;position:relative;cursor:ew-resize;touch-action:none;background:linear-gradient(to right,transparent 2px,#444 2px,#444 3px,transparent 3px)}
        .clab-browse-side-resize.sources{grid-column:2}.clab-browse-side-resize.parameters{grid-column:4}
        .clab-browse-side-resize::after{content:'';position:absolute;top:calc(50% - 20px);left:2px;width:2px;height:40px;border-radius:2px;background:#666}
        .clab-browse-side-resize:hover::after,.clab-browse-side-resize:focus-visible::after,.clab-filmstrip-resize:hover::after{background:#aaa}
        .clab-browse-side-resize[data-collapsed=true]::after,.clab-filmstrip-resize[data-collapsed=true]::after{display:none}
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
        .clab-browse-footer{height:var(--browse-film-height,164px);min-height:116px;flex-shrink:0;display:flex;flex-direction:column;border-top:1px solid #444;background:#181818;min-width:0}
        .clab-browse-footer[hidden]{display:none}.clab-filmstrip-resize{height:6px;flex-shrink:0;cursor:ns-resize;position:relative;touch-action:none}
        .clab-preview-modal[data-film-collapsed=true] .clab-browse-footer{height:6px;min-height:6px;overflow:visible}
        .clab-preview-modal[data-film-collapsed=true] .clab-browse-tools,.clab-preview-modal[data-film-collapsed=true] .clab-browse-filmstrip{display:none}
        .clab-filmstrip-resize [data-browse-restore=filmstrip]{top:auto;bottom:0;left:calc(50% - 16px);width:32px;height:16px;border-radius:4px 4px 0 0}
        [data-browse-restore=filmstrip] svg{transform:rotate(-90deg)}
        .clab-filmstrip-resize::after{content:'';position:absolute;left:calc(50% - 20px);top:2px;width:40px;height:2px;border-radius:2px;background:#666}
        .clab-filmstrip-resizing{user-select:none;cursor:ns-resize}.clab-filmstrip-resizing *{cursor:ns-resize!important}
        .clab-browse-tools{display:flex;align-items:center;gap:10px;min-height:29px;padding:0 10px 4px;flex-shrink:0;min-width:0}
        .clab-browse-tools label{display:flex;align-items:center;gap:5px;color:#999;font:11px sans-serif;white-space:nowrap;flex-shrink:0}
        .clab-browse-tools select{font-size:11px;max-width:150px;padding:3px}
        .clab-browse-tools .clab-browse-thumb-size{margin-left:auto}
        .clab-browse-thumb-size input[type=range]{appearance:none;-webkit-appearance:none;width:64px;height:2px;background:#555;outline:none;padding:0;border:0;border-radius:2px;cursor:pointer}
        .clab-browse-thumb-size input[type=range]::-webkit-slider-thumb{appearance:none;width:8px;height:8px;border-radius:50%;background:#aaa;transition:background .15s}
        .clab-browse-thumb-size input[type=range]::-moz-range-thumb{width:8px;height:8px;border:0;border-radius:50%;background:#aaa}
        .clab-browse-thumb-size input[type=range]:hover::-webkit-slider-thumb{background:#eee}
        .clab-browse-thumb-size [data-browse-size-reset]{display:flex;align-items:center;justify-content:center;padding:4px;background:transparent;color:#999;border:0;cursor:pointer}
        .clab-browse-thumb-size [data-browse-size-reset]:hover{color:#fff}
        .clab-browse-status{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font:11px sans-serif;color:#aaa;text-align:left}
        .clab-browse-filmstrip{display:flex;align-items:stretch;gap:9px;overflow-x:auto;overflow-y:hidden;min-width:0;min-height:0;flex:1;padding:2px 10px 8px;overscroll-behavior-x:contain}
        .clab-browse-filmstrip{scrollbar-width:thin;scrollbar-color:#555 transparent}
        .clab-browse-filmstrip::-webkit-scrollbar{height:6px}
        .clab-browse-filmstrip::-webkit-scrollbar-track{background:transparent}
        .clab-browse-filmstrip::-webkit-scrollbar-thumb{background:#555;border-radius:3px}
        .clab-browse-filmstrip::-webkit-scrollbar-thumb:hover{background:#777}
        .clab-browse-filmstrip::-webkit-scrollbar-button{display:none}
        @supports selector(::-webkit-scrollbar){.clab-browse-filmstrip{scrollbar-width:auto;scrollbar-color:auto}}
        .clab-filmstrip-group{flex:0 0 auto;display:flex;position:relative;min-height:0;padding:22px 9px 0 0;border-right:1px solid #3c3c3c}
        .clab-filmstrip-group:last-child{border-right:0}
        .clab-filmstrip-group>[data-filmstrip-group]{position:absolute;top:0;left:0;right:9px;height:20px;text-align:left;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font:10px sans-serif;color:#888;background:transparent;border:0;padding:0 4px;border-radius:3px;cursor:grab}
        .clab-filmstrip-group>[data-filmstrip-group]:hover{color:#ddd}
        .clab-filmstrip-group.selected>[data-filmstrip-group]{color:#cedeea;background:#2a343b}
        .clab-filmstrip-group-items{display:flex;align-items:stretch;gap:7px;min-height:0}
        .clab-browse-filmstrip .clab-filmstrip-thumb{position:relative;flex:0 0 var(--browse-thumb-width,120px);width:var(--browse-thumb-width,120px);min-width:0;min-height:0;border-radius:5px;padding:4px;overflow:visible;cursor:grab}
        .clab-filmstrip-thumb .clab-preview-modal-thumb-media{min-height:24px;flex:1;height:100%;width:100%;background:#111;border-radius:2px;overflow:hidden}
        .clab-filmstrip-thumb img,.clab-filmstrip-thumb video{width:100%;height:100%;object-fit:contain;display:block;pointer-events:none}
        .clab-browse-filmstrip .clab-filmstrip-thumb.selected{border-color:#61798a;background:#26323a}.clab-browse-filmstrip .clab-filmstrip-thumb.active{border-color:#93bdd9}
        .clab-filmstrip-history{position:absolute;bottom:5px;right:5px;padding:1px 4px;border-radius:3px;background:#111b;color:#bbb;font:10px/14px sans-serif;pointer-events:none}
        .clab-browse-filmstrip .drop-before::before,.clab-browse-filmstrip .drop-after::after{content:'';position:absolute;top:0;bottom:0;width:2px;background:#a8cde6;z-index:3;pointer-events:none}
        .clab-browse-filmstrip .drop-before::before{left:-5px}.clab-browse-filmstrip .drop-after::after{right:-5px}
        @media(max-width:1100px){.clab-preview-modal-body,.clab-preview-modal[data-review-mode=table] .clab-preview-modal-body{grid-template-columns:165px minmax(0,1fr) 220px}.clab-preview-modal-panel{inset:2vh 2vw}.clab-browse-tools{gap:7px}}
        @media(max-width:760px){.clab-preview-modal-body,.clab-preview-modal[data-review-mode=table] .clab-preview-modal-body{grid-template-columns:125px minmax(0,1fr)}.clab-preview-modal-right{grid-column:1/-1;max-height:180px;border-top:1px solid #444}.clab-preview-modal-body{grid-template-rows:minmax(180px,1fr) auto}.clab-preview-modal-head{padding:8px;grid-template-columns:minmax(0,1fr) auto}.clab-review-modes{grid-column:1/-1;grid-row:2}.clab-review-segment button{padding:4px 8px}.clab-browse-tools{gap:6px}}
    `;
    document.head.appendChild(style);
}
