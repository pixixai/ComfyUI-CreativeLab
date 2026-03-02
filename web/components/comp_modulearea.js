/**
 * comp_modulearea.js：【组件】负责卡片内部的“模块”渲染与交互。
 */
import { state, dragState, saveAndRender } from "./ui_state.js";
import { buildCustomSelect, getWidgetDef, getRatioCSS } from "./ui_utils.js";
import { renderDynamicToolbar, attachDynamicToolbarEvents } from "./actions/action_module_config.js";

export function generateAreaHTML(area, card) {
    const isAreaSelected = state.selectedAreaIds.includes(area.id);
    
    if (area.type === 'edit') {
        const editAreas = card.areas.filter(a => a.type === 'edit');
        const editIndex = editAreas.findIndex(a => a.id === area.id) + 1;
        const defaultTitle = `##${editIndex}`;
        const displayTitle = area.title ? area.title : defaultTitle;

        const truncateW = (str) => (str && str.length > 8) ? str.substring(0, 8) + '...' : (str || '');
        const truncateN = (str) => (str && str.length > 4) ? str.substring(0, 4) + '...' : (str || '');

        let hintText = '未绑定参数';
        let fullHintText = '未绑定参数'; 
        let primaryNodeId = area.targetNodeId;
        let primaryWidget = area.targetWidget;
        
        let targets = [];
        if (Array.isArray(area.targetWidgets) && area.targetWidgets.length > 0) {
            targets = area.targetWidgets.map(tw => {
                const [nId, wName] = tw.split('||');
                return { nodeId: nId, widget: wName };
            });
        } else if (area.targetNodeId && area.targetWidget) {
            targets = [{ nodeId: area.targetNodeId, widget: area.targetWidget }];
        }

        if (targets.length === 1) {
            const t = targets[0];
            primaryNodeId = t.nodeId;
            primaryWidget = t.widget;
            const node = app.graph ? app.graph.getNodeById(Number(t.nodeId)) : null;
            const nodeName = node ? (node.title || node.type) : `Node:${t.nodeId}`;
            hintText = `${truncateW(t.widget)} (${truncateN(nodeName)})`;
            fullHintText = `节点ID: ${t.nodeId}\n节点名称: ${nodeName}\n绑定参数: ${t.widget}`;
        } else if (targets.length > 1) {
            const firstT = targets[0];
            primaryNodeId = firstT.nodeId;
            primaryWidget = firstT.widget;
            
            const nodeIdsStr = targets.map(t => `[${t.nodeId}]`).join('');
            hintText = `${truncateW(firstT.widget)}${nodeIdsStr}`;
            
            fullHintText = `批量绑定了 ${targets.length} 个参数:\n` + targets.map(t => {
                const n = app.graph ? app.graph.getNodeById(Number(t.nodeId)) : null;
                return `[${t.nodeId}] ${n ? (n.title || n.type) : '未知节点'} : ${t.widget}`;
            }).join('\n');
        } else if (area.targetNodeId) {
            const node = app.graph ? app.graph.getNodeById(Number(area.targetNodeId)) : null;
            const nodeName = node ? (node.title || node.type) : `Node:${area.targetNodeId}`;
            hintText = `未绑定参数 (${truncateN(nodeName)})`;
            fullHintText = `未绑定参数 (${nodeName})`;
        } else if (area.targetWidget) {
            hintText = truncateW(area.targetWidget);
            fullHintText = area.targetWidget;
        }

        const widgetDef = getWidgetDef(primaryNodeId, primaryWidget); 
        
        let inputHtml = '';
        let isUpload = false;
        let uploadType = 'file';
        let comboValues = [];
        
        if (widgetDef) {
            let opts = widgetDef.options || {};
            const isComboWidget = widgetDef.type === "combo" || Array.isArray(widgetDef.type) || Array.isArray(opts.values);
            
            const node = app.graph ? app.graph.getNodeById(Number(primaryNodeId)) : null;
            if (node && node.constructor && node.constructor.nodeData) {
                const nodeData = node.constructor.nodeData;
                const inputs = { ...(nodeData.input?.required || {}), ...(nodeData.input?.optional || {}) };
                
                if (inputs[primaryWidget] && Array.isArray(inputs[primaryWidget]) && inputs[primaryWidget].length > 1) {
                    const pyDict = inputs[primaryWidget][1]; 
                    if (pyDict && typeof pyDict === 'object') {
                        opts = { ...opts, ...pyDict }; 
                    }
                }
            }

            if (opts.image_upload || opts.upload === 'image_upload' || opts.upload === 'image') { isUpload = true; uploadType = 'image'; }
            else if (opts.video_upload || opts.upload === 'video_upload' || opts.upload === 'video') { isUpload = true; uploadType = 'video'; }
            else if (opts.audio_upload || opts.upload === 'audio_upload' || opts.upload === 'audio') { isUpload = true; uploadType = 'audio'; }
            else if (opts.file_upload || opts.upload === 'file_upload' || opts.upload === 'model' || opts.upload === true) { isUpload = true; uploadType = 'file'; }
            
            else if (node && isComboWidget) {
                if (primaryWidget === 'image' && node.type === 'LoadImage') { isUpload = true; uploadType = 'image'; }
                else if (primaryWidget === 'video' && node.type === 'VHS_LoadVideo') { isUpload = true; uploadType = 'video'; }
            }

            if (Array.isArray(widgetDef.type)) {
                comboValues = widgetDef.type;
            } else if (isComboWidget) {
                comboValues = opts.values || [];
            }
        }

        if (isUpload) {
            let iconSvg = '';
            if (uploadType === 'image') {
                iconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>`;
            } else if (uploadType === 'video') {
                iconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="2" y1="7" x2="7" y2="7"></line><line x1="2" y1="17" x2="7" y2="17"></line><line x1="17" y1="17" x2="22" y2="17"></line><line x1="17" y1="7" x2="22" y2="7"></line></svg>`;
            } else {
                iconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>`;
            }

            let acceptType = "*/*";
            if (uploadType === 'image') acceptType = "image/*";
            else if (uploadType === 'video') acceptType = "video/*";
            else if (uploadType === 'audio') acceptType = "audio/*";

            const isMedia = (uploadType === 'image' || uploadType === 'video');
            const ratioStyle = isMedia ? 'aspect-ratio: 16 / 9;' : '';

            if (area.value) {
                let previewHtml = '';
                const fileUrl = `/view?filename=${encodeURIComponent(area.value)}&type=input`;
                
                if (uploadType === 'image') {
                    previewHtml = `<img src="${fileUrl}" draggable="false" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: contain; display: block;" onerror="this.style.display='none';" />`;
                } else if (uploadType === 'video') {
                    previewHtml = `<video src="${fileUrl}" draggable="false" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: contain; display: block;" autoplay loop muted onerror="this.style.display='none';"></video>`;
                } else if (uploadType === 'audio') {
                    previewHtml = `<audio src="${fileUrl}" controls style="position: relative; z-index: 1; width: 90%; height: 40px; margin: 20px 5%;" onerror="this.style.display='none';"></audio>`;
                } else {
                    previewHtml = `<div style="font-size: 24px; color: #666; padding: 30px 0; position: relative; z-index: 1;">📄</div>`;
                }

                const minHeightStyle = isMedia ? '' : 'min-height: 80px;';

                inputHtml = `
                    <div class="sl-upload-zone has-file" data-card="${card.id}" data-area="${area.id}" 
                         style="border: 1px solid #444; border-radius: 6px; padding: 0; position: relative; text-align: center; cursor: pointer; background: rgba(0,0,0,0.3); transition: border-color 0.2s; ${minHeightStyle} ${ratioStyle} display: flex; align-items: center; justify-content: center; overflow: hidden;">
                        <input type="file" class="sl-file-input" accept="${acceptType}" style="display:none;" />
                        ${previewHtml}
                    </div>
                `;
            } else {
                const emptyPadding = isMedia ? '' : 'padding: 16px 10px;';
                const emptyFlex = isMedia ? 'display: flex; flex-direction: column; justify-content: center; align-items: center;' : '';

                inputHtml = `
                    <div class="sl-upload-zone" data-card="${card.id}" data-area="${area.id}" style="border: 1px dashed #666; border-radius: 6px; text-align: center; cursor: pointer; color: #999; background: rgba(0,0,0,0.1); transition: all 0.2s; box-sizing: border-box; ${emptyPadding} ${emptyFlex} ${ratioStyle}">
                        <input type="file" class="sl-file-input" accept="${acceptType}" style="display:none;" />
                        <div style="margin-bottom: 8px; color: #666;">${iconSvg}</div>
                        <div style="font-size: 12px; font-weight: bold; margin-bottom: 4px; color: #ccc;">上传${uploadType === 'image' ? '图片' : uploadType === 'video' ? '视频' : uploadType === 'audio' ? '音频' : '文件'}</div>
                        <div style="font-size: 10px; color: #666;">点击或拖拽至此处上传服务器</div>
                    </div>
                `;
            }

            if (comboValues.length > 0) {
                let itemsHtml = comboValues.map(opt => `<div class="sl-custom-select-item ${area.value === opt ? 'selected' : ''}" data-value="${opt}">${opt}</div>`).join('');
                let currentVal = area.value || comboValues[0] || '或选择服务器已有文件...';
                const comboHtml = buildCustomSelect(`area-select-${area.id}`, '100%', currentVal, itemsHtml, false, `data-card-id="${card.id}" data-area-id="${area.id}" data-type="module-combo"`);
                inputHtml += `<div style="margin-top: 6px; position:relative;">${comboHtml}</div>`;
            }

        } else if (comboValues.length > 0) {
            let itemsHtml = comboValues.map(opt => `<div class="sl-custom-select-item ${area.value === opt ? 'selected' : ''}" data-value="${opt}">${opt}</div>`).join('');
            let currentVal = area.value || comboValues[0] || '选择...';
            inputHtml = buildCustomSelect(`area-select-${area.id}`, '100%', currentVal, itemsHtml, false, `data-card-id="${card.id}" data-area-id="${area.id}" data-type="module-combo"`);
        } else if (widgetDef && (widgetDef.type === "toggle" || typeof widgetDef.value === "boolean")) {
            let isChecked = (area.value === true || area.value === 'true');
            inputHtml = `
                <label class="sl-bool-label" style="display:flex; align-items:center; gap:8px; color:#fff; cursor:pointer; font-size:13px; background:rgba(0,0,0,0.5); padding:8px; border-radius:4px; border:1px solid #555; width: 100%; box-sizing: border-box; margin:0;">
                    <input type="checkbox" class="sl-edit-val-bool" data-card="${card.id}" data-area="${area.id}" ${isChecked ? 'checked' : ''} style="width:16px; height:16px; margin:0; cursor:pointer;"> 
                    <span>${isChecked ? 'True' : 'False'}</span>
                </label>
            `;
        } else {
            inputHtml = `<textarea class="sl-input sl-edit-val" data-card="${card.id}" data-area="${area.id}" placeholder="输入参数值..." style="display:block; margin:0; box-sizing:border-box; ${area.autoHeight ? 'height: auto; resize: none; overflow: hidden;' : ''}">${area.value || ''}</textarea>`;
        }

        return `
            <div class="sl-area ${isAreaSelected ? 'active' : ''}" draggable="true" data-card-id="${card.id}" data-area-id="${area.id}" style="overflow: visible;">
                <button class="sl-del-area-btn" data-card="${card.id}" data-area="${area.id}" title="删除输入">✖</button>
                
                <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:4px; padding: 8px 8px 0 8px;">
                    <input class="sl-area-title-input" data-card="${card.id}" data-area="${area.id}" type="text" value="${displayTitle}" placeholder="${defaultTitle}" size="${Math.max(displayTitle.length, 2)}" style="max-width:150px; min-width:15px; background:transparent; border:none; color:#ddd; font-weight:normal; font-size:12px; outline:none; font-family:sans-serif; padding:0; margin:0;" />
                    
                    <div style="font-size:10px; color:#888; font-weight:normal; text-align:right; white-space:nowrap; pointer-events:none;" title="${fullHintText}">
                        ${hintText}
                    </div>
                </div>

                <div style="padding: 0 8px 8px 8px;">
                    ${inputHtml}
                </div>
            </div>
        `;
    } else if (area.type === 'preview') {
        // 管理模式渲染分支
        if (area.isManageMode && area.history && area.history.length > 0) {
            let gridHtml = `<div class="sl-history-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; padding: 10px; width: 100%; box-sizing: border-box; max-height: 400px; overflow-y: auto;">`;
            
            const selectedThumbs = area.selectedThumbIndices || [];

            area.history.forEach((hUrl, idx) => {
                const isCurrent = idx === (area.historyIndex !== undefined ? area.historyIndex : area.history.length - 1);
                const isSelected = selectedThumbs.includes(idx);

                let border = '2px solid rgba(255,255,255,0.1)';
                if (isCurrent) border = '2px solid #4CAF50';
                else if (isSelected) border = '2px solid #2196F3';

                const urlLower = hUrl.toLowerCase();
                const isVid = urlLower.includes('.mp4') || urlLower.includes('.webm') || urlLower.includes('.mov');
                const media = isVid 
                    ? `<video src="${hUrl}" style="width:100%; height:100%; object-fit:cover; pointer-events:none;" muted></video>` 
                    : `<img src="${hUrl}" style="width:100%; height:100%; object-fit:cover; pointer-events:none;" />`;

                const overlay = isSelected ? `<div style="position:absolute;inset:0;background:rgba(33,150,243,0.3);pointer-events:none;"></div>` : '';
                
                // 【修改】：更新悬浮删除按钮的样式，与卡片模块的删除按钮保持一致（较小尺寸）
                const delBtn = `<div class="sl-thumb-delete" data-card="${card.id}" data-area="${area.id}" data-index="${idx}" style="position:absolute; top:3px; right:3px; width:18px; height:18px; background:rgba(255, 255, 255, 0.6); color:#333; font-weight:bold; border-radius:50%; font-size:10px; display:none; align-items:center; justify-content:center; cursor:pointer; z-index:10; box-shadow: 0 1px 3px rgba(0,0,0,0.3); transition: all 0.2s;" title="删除此记录">✖</div>`;

                gridHtml += `
                    <div class="sl-history-thumb" draggable="true" data-card="${card.id}" data-area="${area.id}" data-index="${idx}" style="aspect-ratio: 1/1; border: ${border}; border-radius: 4px; cursor: grab; overflow: hidden; position: relative; background: #000; transition: border-color 0.2s;">
                        ${media}
                        ${overlay}
                        ${delBtn}
                    </div>
                `;
            });
            gridHtml += `</div>`;

            return `
                <div class="sl-area ${isAreaSelected ? 'active' : ''}" draggable="true" data-card-id="${card.id}" data-area-id="${area.id}" style="padding:0; overflow:hidden; position:relative; background: rgba(0,0,0,0.4); min-height: 100px;">
                    <button class="sl-del-area-btn" data-card="${card.id}" data-area="${area.id}" title="删除输出模块" style="z-index: 30;">✖</button>
                    <div style="padding: 8px 10px; font-size: 12px; font-weight: bold; color: #ccc; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; background: rgba(0,0,0,0.3);">
                        <span>生成记录管理 (${area.history.length})</span>
                        <span style="font-weight: normal; font-size: 10px; color: #888;">(拖拽排序 / 点击设为当前)</span>
                    </div>
                    ${gridHtml}
                </div>
            `;
        }

        // 常规单图预览模式
        let finalRatioCSS = getRatioCSS(area);
        if (area.matchMedia && area.width && area.height) {
            finalRatioCSS = `aspect-ratio: ${area.width} / ${area.height};`;
        }

        let objectFit = 'contain'; 
        if (area.fillMode === '填充') objectFit = 'cover';
        if (area.fillMode === '拉伸') objectFit = 'fill';

        let historyHtml = '';
        if (area.history && area.history.length > 1) {
            const currIdx = area.historyIndex !== undefined ? area.historyIndex + 1 : area.history.length;
            historyHtml = `<div style="position:absolute; top: 8px; left: 10px; color: rgba(255,255,255,0.9); font-size: 12px; font-weight: bold; font-family: sans-serif; letter-spacing: -0.5px; z-index: 20; pointer-events: none;">${currIdx} / ${area.history.length}</div>`;
        }

        let mediaHtml = '';
        if (area.resultUrl) {
            const urlLower = area.resultUrl.toLowerCase();
            const errCall = `if(window.ShellLink && window.ShellLink.handleMediaError) window.ShellLink.handleMediaError('${card.id}', '${area.id}', '${area.resultUrl}');`;
            
            if (urlLower.includes('.mp4') || urlLower.includes('.webm') || urlLower.includes('.mov')) {
                mediaHtml = `<video id="sl-img-${area.id}" class="sl-preview-img" src="${area.resultUrl}" draggable="false" style="object-fit: ${objectFit}; width: 100%; height: 100%; display: block;" autoplay loop muted controls onerror="${errCall}"></video>`;
            } else {
                mediaHtml = `<img id="sl-img-${area.id}" class="sl-preview-img" src="${area.resultUrl}" draggable="false" style="object-fit: ${objectFit}; width: 100%; height: 100%; display: block;" onerror="${errCall}" />`;
            }
        } else {
            mediaHtml = `<img id="sl-img-${area.id}" class="sl-preview-img" src="" draggable="false" style="display:none;" />`;
        }

        return `
            <div class="sl-area ${isAreaSelected ? 'active' : ''}" draggable="true" data-card-id="${card.id}" data-area-id="${area.id}" style="padding:0; overflow:hidden; position:relative;">
                <button class="sl-del-area-btn" data-card="${card.id}" data-area="${area.id}" title="删除输出模块" style="z-index: 30;">✖</button>
                ${historyHtml}
                <div class="sl-preview-bg" style="${finalRatioCSS} position: relative;">
                    ${mediaHtml}
                    <span class="sl-preview-placeholder" style="display:${area.resultUrl ? 'none' : 'block'}; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 100%; text-align: center;">${area.targetNodeId ? `等待节点 [${area.targetNodeId}] 输出...` : '未关联节点'}</span>
                </div>
            </div>
        `;
    }
    return '';
}

export function attachAreaEvents(container) {
    if (!document.getElementById('sl-area-dnd-styles')) {
        const style = document.createElement('style');
        style.id = 'sl-area-dnd-styles';
        style.innerHTML = `
            .sl-drag-over-area-top { border-top: 3px solid #4CAF50 !important; background: rgba(76, 175, 80, 0.1) !important; }
            .sl-drag-over-area-bottom { border-bottom: 3px solid #4CAF50 !important; background: rgba(76, 175, 80, 0.1) !important; }
            .sl-drag-over-thumb-left { border-left: 3px solid #4CAF50 !important; border-radius: 0 !important; }
            .sl-drag-over-thumb-right { border-right: 3px solid #4CAF50 !important; border-radius: 0 !important; }
            .sl-history-thumb:hover .sl-thumb-delete { display: flex !important; }
            .sl-thumb-delete:hover { transform: scale(1.15); background: #ff5555 !important; color: #fff !important; }
            .sl-history-thumb:active { cursor: grabbing !important; opacity: 0.8; }
        `;
        document.head.appendChild(style);
    }

    container.querySelectorAll('.sl-thumb-delete').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            const cardId = btn.dataset.card;
            const areaId = btn.dataset.area;
            const idx = parseInt(btn.dataset.index, 10);
            const card = state.cards.find(c => c.id === cardId);
            const area = card?.areas.find(a => a.id === areaId);

            if (area && area.history) {
                let toDelete = [idx];
                if (area.selectedThumbIndices && area.selectedThumbIndices.includes(idx)) {
                    toDelete = [...area.selectedThumbIndices];
                }

                const activeUrl = area.resultUrl;
                area.history = area.history.filter((_, i) => !toDelete.includes(i));
                
                if (area.history.length === 0) {
                    area.resultUrl = '';
                    area.historyIndex = 0;
                    area.selectedThumbIndices = [];
                } else {
                    let newActiveIdx = area.history.indexOf(activeUrl);
                    if (newActiveIdx === -1) newActiveIdx = Math.max(0, area.history.length - 1);
                    area.historyIndex = newActiveIdx;
                    area.resultUrl = area.history[newActiveIdx];
                    area.selectedThumbIndices = [];
                }
                saveAndRender();
            }
        }
    });

    container.querySelectorAll('.sl-history-thumb').forEach(thumb => {
        thumb.onclick = (e) => {
            e.stopPropagation();
            if (e.target.closest('.sl-thumb-delete')) return;
            
            const cardId = thumb.dataset.card;
            const areaId = thumb.dataset.area;
            const idx = parseInt(thumb.dataset.index, 10);
            const card = state.cards.find(c => c.id === cardId);
            const area = card?.areas.find(a => a.id === areaId);
            
            if (area && area.history) {
                if (!area.selectedThumbIndices) area.selectedThumbIndices = [];
                
                if (e.ctrlKey || e.metaKey) {
                    if (area.selectedThumbIndices.includes(idx)) {
                        area.selectedThumbIndices = area.selectedThumbIndices.filter(i => i !== idx);
                    } else {
                        area.selectedThumbIndices.push(idx);
                    }
                    area.lastClickedThumbIdx = idx;
                } else if (e.shiftKey && area.lastClickedThumbIdx !== undefined) {
                    const start = Math.min(area.lastClickedThumbIdx, idx);
                    const end = Math.max(area.lastClickedThumbIdx, idx);
                    const range = [];
                    for(let i = start; i <= end; i++) range.push(i);
                    area.selectedThumbIndices = Array.from(new Set([...area.selectedThumbIndices, ...range]));
                } else {
                    area.historyIndex = idx;
                    area.resultUrl = area.history[idx];
                    area.selectedThumbIndices = [idx];
                    area.lastClickedThumbIdx = idx;
                }
                saveAndRender();
            }
        };

        thumb.addEventListener('dragstart', (e) => {
            e.stopPropagation(); 
            if (e.target.closest('.sl-thumb-delete')) { e.preventDefault(); return; }

            const idx = parseInt(thumb.dataset.index, 10);
            const card = state.cards.find(c => c.id === thumb.dataset.card);
            const area = card?.areas.find(a => a.id === thumb.dataset.area);

            let dragIndices = [idx];
            if (area && area.selectedThumbIndices && area.selectedThumbIndices.includes(idx)) {
                dragIndices = [...area.selectedThumbIndices].sort((a,b) => a-b);
            }

            dragState.type = 'thumb';
            dragState.cardId = thumb.dataset.card;
            dragState.areaId = thumb.dataset.area;
            dragState.thumbIndices = dragIndices; 

            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', 'thumb');
            setTimeout(() => thumb.style.opacity = '0.5', 0);
        });

        thumb.addEventListener('dragend', (e) => {
            e.stopPropagation();
            thumb.style.opacity = '1';
            document.querySelectorAll('.sl-drag-over-thumb-left, .sl-drag-over-thumb-right').forEach(el => {
                el.classList.remove('sl-drag-over-thumb-left', 'sl-drag-over-thumb-right');
            });
            dragState.type = null; dragState.cardId = null; dragState.areaId = null; dragState.thumbIndices = null;
        });

        thumb.addEventListener('dragover', (e) => {
            const idx = parseInt(thumb.dataset.index, 10);
            if (dragState.type === 'thumb' && dragState.areaId === thumb.dataset.area && (!dragState.thumbIndices || !dragState.thumbIndices.includes(idx))) {
                e.preventDefault(); e.stopPropagation();
                const rect = thumb.getBoundingClientRect();
                const midX = rect.left + rect.width / 2;
                
                if (e.clientX < midX) {
                    thumb.classList.add('sl-drag-over-thumb-left');
                    thumb.classList.remove('sl-drag-over-thumb-right');
                    thumb.dataset.dropPosition = 'left';
                } else {
                    thumb.classList.add('sl-drag-over-thumb-right');
                    thumb.classList.remove('sl-drag-over-thumb-left');
                    thumb.dataset.dropPosition = 'right';
                }
            }
        });

        thumb.addEventListener('dragleave', (e) => {
            e.stopPropagation();
            if (!thumb.contains(e.relatedTarget)) {
                thumb.classList.remove('sl-drag-over-thumb-left', 'sl-drag-over-thumb-right');
                delete thumb.dataset.dropPosition;
            }
        });

        thumb.addEventListener('drop', (e) => {
            if (dragState.type === 'thumb') {
                e.preventDefault(); e.stopPropagation();
                const dropPos = thumb.dataset.dropPosition;
                thumb.classList.remove('sl-drag-over-thumb-left', 'sl-drag-over-thumb-right');
                delete thumb.dataset.dropPosition;

                const targetIdx = parseInt(thumb.dataset.index, 10);
                const draggedIndices = dragState.thumbIndices;
                
                if (!draggedIndices || draggedIndices.includes(targetIdx)) return;

                const card = state.cards.find(c => c.id === dragState.cardId);
                const area = card?.areas.find(a => a.id === dragState.areaId);
                
                if (area && area.history) {
                    const activeUrl = area.resultUrl;
                    const targetUrl = area.history[targetIdx];

                    const movedItems = draggedIndices.map(i => area.history[i]);
                    let newHistory = area.history.filter((_, i) => !draggedIndices.includes(i));
                    
                    let newTargetIdx = newHistory.indexOf(targetUrl);
                    if (newTargetIdx === -1) newTargetIdx = newHistory.length; 
                    if (dropPos === 'right') newTargetIdx += 1;
                    
                    newHistory.splice(newTargetIdx, 0, ...movedItems);
                    area.history = newHistory;
                    
                    const newActiveIdx = area.history.indexOf(activeUrl);
                    if (newActiveIdx !== -1) area.historyIndex = newActiveIdx;

                    area.selectedThumbIndices = [];
                    for(let i=0; i<movedItems.length; i++) {
                        area.selectedThumbIndices.push(newTargetIdx + i);
                    }
                    
                    saveAndRender();
                }
            }
        });
    });

    container.querySelectorAll('.sl-del-area-btn').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            const { card: cardId, area: areaId } = e.target.dataset;
            const card = state.cards.find(c => c.id === cardId);
            if(card) {
                card.areas = card.areas.filter(a => a.id !== areaId);
                state.selectedAreaIds = state.selectedAreaIds.filter(id => id !== areaId);
                saveAndRender();
            }
        };
    });

    container.querySelectorAll('.sl-area-title-input').forEach(input => {
        input.addEventListener('input', function() {
            this.size = Math.max(this.value.length, 2); 
        });

        input.onchange = (e) => {
            const { card: cardId, area: areaId } = e.target.dataset;
            const card = state.cards.find(c => c.id === cardId);
            const area = card?.areas.find(a => a.id === areaId);
            if (area) {
                const currentVal = e.target.value.trim();
                const defaultTitle = e.target.placeholder;
                if (currentVal === defaultTitle || currentVal === '') {
                    area.title = '';
                } else {
                    area.title = currentVal;
                }
                saveAndRender();
            }
        };
    });

    container.querySelectorAll('.sl-upload-zone').forEach(zone => {
        const fileInput = zone.querySelector('.sl-file-input');
        if (!fileInput) return;

        zone.onclick = (e) => {
            if(e.target.closest('.sl-custom-select')) return; 
            e.stopPropagation();
            fileInput.click();
        };

        const handleUpload = async (file) => {
            if(!file) return;
            const cardId = zone.dataset.card;
            const areaId = zone.dataset.area;
            
            zone.style.pointerEvents = 'none';
            zone.innerHTML = `
                <style>@keyframes sl-spin { 100% { transform: rotate(360deg); } }</style>
                <div style="padding: 16px 10px; text-align: center; color: #fff; font-size: 12px; display: flex; align-items: center; justify-content: center; height: 100%; width: 100%;">
                    <svg style="animation: sl-spin 1s linear infinite; margin-right: 6px; width:16px; height:16px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line>
                        <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                        <line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line>
                        <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                    </svg>
                    正在加密上传至服务器...
                </div>
            `;

            try {
                const formData = new FormData();
                formData.append('image', file);
                
                const resp = await fetch('/upload/image', {
                    method: 'POST',
                    body: formData
                });
                
                if(!resp.ok) throw new Error(resp.statusText);
                const data = await resp.json();
                
                if (data.name) {
                    const card = state.cards.find(c => c.id === cardId);
                    const area = card?.areas.find(a => a.id === areaId);
                    if (area) {
                        area.value = data.name;
                        state.selectedAreaIds = [areaId];
                        state.selectedCardIds = [];
                        saveAndRender();
                    }
                } else {
                    throw new Error(data.error || '上传失败，未返回文件名');
                }
            } catch(err) {
                alert('本地文件上传失败: ' + err.message);
                saveAndRender(); 
            }
        };

        fileInput.onchange = (e) => {
            const file = e.target.files[0];
            handleUpload(file);
            e.target.value = ''; 
        };

        zone.addEventListener('dragover', (e) => {
            if(e.dataTransfer.types.includes('Files')) {
                e.preventDefault(); e.stopPropagation();
                zone.style.borderColor = '#fff';
                zone.style.background = 'rgba(255,255,255,0.15)';
            }
        });

        zone.addEventListener('dragleave', (e) => {
            if(e.dataTransfer.types.includes('Files')) {
                e.preventDefault(); e.stopPropagation();
                zone.style.borderColor = zone.classList.contains('has-file') ? '#444' : '#666';
                zone.style.background = zone.classList.contains('has-file') ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.1)';
            }
        });

        zone.addEventListener('drop', (e) => {
            if(e.dataTransfer.types.includes('Files')) {
                e.preventDefault(); e.stopPropagation();
                const file = e.dataTransfer.files[0];
                handleUpload(file);
            }
        });
    });

    container.querySelectorAll('.sl-custom-select[data-type="module-combo"]').forEach(el => {
        if (el.classList.contains('disabled')) return;
        const input = el.querySelector('.sl-custom-select-value');
        const items = el.querySelectorAll('.sl-custom-select-item');

        el.addEventListener('mousedown', e => e.stopPropagation());
        
        const openDropdown = (e) => {
            e.stopPropagation();
            
            document.querySelectorAll('.sl-custom-select.open').forEach(other => {
                if (other !== el) {
                    other.classList.remove('open');
                    const dp = other.querySelector('.sl-custom-select-dropdown');
                    if (dp) { dp.style.top = ''; dp.style.bottom = ''; dp.style.transform = ''; }
                    
                    const otherArea = other.closest('.sl-area');
                    if (otherArea) otherArea.style.zIndex = '';
                }
            });
            el.classList.add('open');

            const currentArea = el.closest('.sl-area');
            if (currentArea) {
                currentArea.style.zIndex = '9999';
            }

            const dropdown = el.querySelector('.sl-custom-select-dropdown');
            if (dropdown) {
                dropdown.style.top = '';
                dropdown.style.bottom = '';
                dropdown.style.transform = '';
                
                const dropdownRect = dropdown.getBoundingClientRect();
                const cardBody = el.closest('.sl-card-body');
                
                let overflowOffset = 0;
                
                if (cardBody) {
                    const cardRect = cardBody.getBoundingClientRect();
                    const diff = dropdownRect.bottom - (cardRect.bottom - 10);
                    if (diff > 0) overflowOffset = diff;
                } else {
                    const diff = dropdownRect.bottom - (window.innerHeight - 10);
                    if (diff > 0) overflowOffset = diff;
                }
                
                if (overflowOffset > 0) {
                    dropdown.style.transform = `translateY(-${overflowOffset}px)`;
                }
            }
        };

        el.addEventListener('click', openDropdown);
        input.addEventListener('click', (e) => { openDropdown(e); input.select(); });

        input.addEventListener('input', (e) => {
            const keyword = e.target.value.toLowerCase().trim();
            el.classList.add('open');
            const groupTitles = el.querySelectorAll('.sl-custom-select-group-title');
            if (keyword !== '') groupTitles.forEach(title => title.style.display = 'none');
            else groupTitles.forEach(title => title.style.display = 'flex');

            items.forEach(item => {
                const text = item.textContent.toLowerCase();
                item.style.display = text.includes(keyword) ? 'block' : 'none';
            });
        });

        input.addEventListener('blur', () => {
            setTimeout(() => {
                el.classList.remove('open');
                
                const currentArea = el.closest('.sl-area');
                if (currentArea) currentArea.style.zIndex = '';
                
                const dp = el.querySelector('.sl-custom-select-dropdown');
                if (dp) { dp.style.top = ''; dp.style.bottom = ''; dp.style.transform = ''; }
                
                items.forEach(item => item.style.display = 'block');
                const groupTitles = el.querySelectorAll('.sl-custom-select-group-title');
                groupTitles.forEach(title => title.style.display = 'flex');

                const selected = el.querySelector('.sl-custom-select-item.selected');
                if (selected) input.value = selected.textContent;
                else input.value = input.getAttribute('title');
            }, 200);
        });

        items.forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const val = item.dataset.value;
                el.classList.remove('open');
                
                const currentArea = el.closest('.sl-area');
                if (currentArea) currentArea.style.zIndex = '';
                
                const dp = el.querySelector('.sl-custom-select-dropdown');
                if (dp) { dp.style.top = ''; dp.style.bottom = ''; dp.style.transform = ''; }
                
                const cardId = el.dataset.cardId;
                const areaId = el.dataset.areaId;
                const card = state.cards.find(c => c.id === cardId);
                const area = card.areas.find(a => a.id === areaId);
                
                if (area) {
                    area.value = val;
                    state.selectedAreaIds = [areaId];
                    state.selectedCardIds = [];
                    saveAndRender(); 
                }
            });
        });
    });

    container.querySelectorAll('.sl-edit-val-bool').forEach(cb => {
        cb.onchange = (e) => {
            const { card: cardId, area: areaId } = e.target.dataset;
            const card = state.cards.find(c => c.id === cardId);
            const area = card.areas.find(a => a.id === areaId);
            if(area) {
                area.value = e.target.checked;
                state.selectedAreaIds = [areaId];
                state.selectedCardIds = [];
                saveAndRender(); 
            }
        };
    });

    container.querySelectorAll('.sl-edit-val').forEach(ta => {
        if (ta.style.height === 'auto') ta.style.height = (ta.scrollHeight) + 'px';
        ta.oninput = (e) => {
            if (ta.style.height === 'auto' || ta.style.resize === 'none') {
                ta.style.height = 'auto';
                ta.style.height = (ta.scrollHeight) + 'px';
            }
            const { card: cardId, area: areaId } = e.target.dataset;
            const card = state.cards.find(c => c.id === cardId);
            const area = card.areas.find(a => a.id === areaId);
            if(area) area.value = e.target.value;
            if (window.ShellLink) window.ShellLink.saveState(state);
        };
    });

    container.querySelectorAll('.sl-area').forEach(areaEl => {
        
        areaEl.addEventListener('contextmenu', (e) => {
            const areaId = areaEl.dataset.areaId;
            const cardId = areaEl.dataset.cardId;
            const card = state.cards.find(c => c.id === cardId);
            const area = card?.areas.find(a => a.id === areaId);
            
            if (area && area.type === 'preview' && area.resultUrl) {
                if (e.target.closest('.sl-preview-bg') || e.target.closest('.sl-history-thumb')) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (window.ShellLink && window.ShellLink.showPreviewContextMenu) {
                        let targetUrl = area.resultUrl;
                        if (e.target.closest('.sl-history-thumb')) {
                            const thumbIdx = parseInt(e.target.closest('.sl-history-thumb').dataset.index, 10);
                            targetUrl = area.history[thumbIdx];
                        }
                        window.ShellLink.showPreviewContextMenu(e.clientX, e.clientY, cardId, areaId, targetUrl);
                    }
                }
            }
        });

        areaEl.addEventListener('mousedown', (e) => {
            if (state.painterMode) return; 
            if (e.target.closest('.sl-del-area-btn')) return; 

            if (e.button === 2) return;

            e.stopPropagation();

            const areaId = areaEl.dataset.areaId;
            const isAlreadyOnlySelected = state.selectedAreaIds.length === 1 && state.selectedAreaIds[0] === areaId && state.selectedCardIds.length === 0;

            if (isAlreadyOnlySelected && !e.ctrlKey && !e.metaKey) {
                return;
            }

            if (e.ctrlKey || e.metaKey) {
                if (state.selectedAreaIds.includes(areaId)) {
                    state.selectedAreaIds = state.selectedAreaIds.filter(id => id !== areaId);
                } else {
                    state.selectedAreaIds.push(areaId);
                }
            } else {
                state.selectedAreaIds = [areaId];
            }
            state.selectedCardIds = [];

            if (window.ShellLink) window.ShellLink.saveState(state);

            document.querySelectorAll('.sl-card').forEach(el => el.classList.remove('active'));
            document.querySelectorAll('.sl-area').forEach(el => {
                if (state.selectedAreaIds.includes(el.dataset.areaId)) {
                    el.classList.add('active');
                } else {
                    el.classList.remove('active');
                }
            });

            const tbContainer = document.getElementById('sl-toolbar-handle');
            if (tbContainer) {
                renderDynamicToolbar(tbContainer);
                attachDynamicToolbarEvents(tbContainer);
            }
        });

        areaEl.onclick = (e) => {
            e.stopPropagation();
            const areaId = areaEl.dataset.areaId;

            if (state.painterMode) {
                if (['BUTTON', 'TEXTAREA', 'INPUT', 'SELECT'].includes(e.target.tagName) || e.target.closest('.sl-custom-select') || e.target.closest('.sl-bool-label') || e.target.closest('.sl-upload-zone')) return;
                
                if (state.painterSource?.type === 'card') {
                    const targetCardId = areaEl.dataset.cardId;
                    if (state.painterSource.data.id !== targetCardId) {
                        const targetCard = state.cards.find(c => c.id === targetCardId);
                        targetCard.areas = JSON.parse(JSON.stringify(state.painterSource.data.areas));
                        targetCard.areas.forEach(a => a.id = 'area_' + Date.now() + '_' + Math.floor(Math.random() * 1000));
                        saveAndRender();
                    }
                    return;
                }

                if (state.painterSource?.type === 'area' && state.painterSource.data.id !== areaId) {
                    const src = state.painterSource.data;
                    const card = state.cards.find(c => c.id === areaEl.dataset.cardId);
                    const area = card?.areas.find(a => a.id === areaId);
                    if (area) {
                        area.type = src.type;
                        area.targetNodeId = src.targetNodeId;
                        area.targetWidget = src.targetWidget;
                        area.targetNodeIds = Array.isArray(src.targetNodeIds) ? [...src.targetNodeIds] : [];
                        area.targetWidgets = Array.isArray(src.targetWidgets) ? [...src.targetWidgets] : [];
                        area.dataType = src.dataType;
                        area.autoHeight = src.autoHeight;
                        area.ratio = src.ratio;
                        area.width = src.width;
                        area.height = src.height;
                        area.matchMedia = src.matchMedia;
                        area.fillMode = src.fillMode;
                        if (area.type !== src.type) area.value = ''; 
                        saveAndRender();
                    }
                }
                return;
            }
        };

        areaEl.addEventListener('dragstart', (e) => {
            if (['INPUT', 'TEXTAREA', 'BUTTON'].includes(e.target.tagName) || e.target.closest('.sl-custom-select') || e.target.closest('.sl-bool-label') || e.target.closest('.sl-upload-zone') || e.target.closest('.sl-history-thumb')) {
                return;
            }
            e.stopPropagation(); 
            dragState.type = 'area';
            dragState.cardId = areaEl.dataset.cardId;
            dragState.areaId = areaEl.dataset.areaId;
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', 'area');
            setTimeout(() => areaEl.classList.add('sl-dragging'), 0);
        });

        areaEl.addEventListener('dragend', (e) => {
            e.stopPropagation();
            areaEl.classList.remove('sl-dragging');
            document.querySelectorAll('.sl-drag-over-area-top, .sl-drag-over-area-bottom').forEach(el => {
                el.classList.remove('sl-drag-over-area-top', 'sl-drag-over-area-bottom');
            });
            document.querySelectorAll('.sl-drag-over-list').forEach(el => el.classList.remove('sl-drag-over-list'));
            dragState.type = null; dragState.cardId = null; dragState.areaId = null;
        });

        areaEl.addEventListener('dragover', (e) => {
            if (e.dataTransfer.types.includes('Files')) return;

            if (dragState.type === 'area' && dragState.areaId !== areaEl.dataset.areaId) {
                e.preventDefault(); e.stopPropagation();
                
                const rect = areaEl.getBoundingClientRect();
                const midY = rect.top + rect.height / 2;
                
                if (e.clientY < midY) {
                    areaEl.classList.add('sl-drag-over-area-top');
                    areaEl.classList.remove('sl-drag-over-area-bottom');
                    areaEl.dataset.dropPosition = 'top';
                } else {
                    areaEl.classList.add('sl-drag-over-area-bottom');
                    areaEl.classList.remove('sl-drag-over-area-top');
                    areaEl.dataset.dropPosition = 'bottom';
                }
            }
        });

        areaEl.addEventListener('dragleave', (e) => {
            if (e.dataTransfer.types.includes('Files')) return;
            e.stopPropagation();
            if (!areaEl.contains(e.relatedTarget)) {
                areaEl.classList.remove('sl-drag-over-area-top', 'sl-drag-over-area-bottom');
                delete areaEl.dataset.dropPosition;
            }
        });

        areaEl.addEventListener('drop', (e) => {
            if (e.dataTransfer.types.includes('Files')) return;

            if (dragState.type === 'area') {
                e.preventDefault(); e.stopPropagation();
                
                const dropPos = areaEl.dataset.dropPosition;
                areaEl.classList.remove('sl-drag-over-area-top', 'sl-drag-over-area-bottom');
                delete areaEl.dataset.dropPosition;
                
                const targetCardId = areaEl.dataset.cardId;
                const targetAreaId = areaEl.dataset.areaId;
                if (dragState.areaId === targetAreaId) return;

                const sourceCard = state.cards.find(c => c.id === dragState.cardId);
                const targetCard = state.cards.find(c => c.id === targetCardId);
                if (!targetCard.areas) targetCard.areas = [];
                
                const sourceIdx = sourceCard.areas.findIndex(a => a.id === dragState.areaId);
                
                if (sourceIdx !== -1) {
                    const [moved] = sourceCard.areas.splice(sourceIdx, 1);
                    let targetIdx = targetCard.areas.findIndex(a => a.id === targetAreaId);
                    
                    if (targetIdx !== -1) {
                        if (dropPos === 'bottom') {
                            targetIdx += 1;
                        }
                        targetCard.areas.splice(targetIdx, 0, moved);
                        saveAndRender();
                    } else {
                        targetCard.areas.push(moved);
                        saveAndRender();
                    }
                }
            }
        });
    });
}