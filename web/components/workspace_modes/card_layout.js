import { onModuleRemoved } from '../modules/module_lifecycle.js';
import { measureInputText } from '../modules/input_measure.js';
import { observeMediaDimensions } from './media_dimensions.js';

export const layoutSignature=(area,width)=>[width,area.type,area.title,area.value,area.autoHeight,area.dataType,area.targetNodeId,area.targetWidget,(area.targetWidgets||[]).join('|'),(area.targetNodeIds||[]).join('|'),area.resultUrl,area.textContent,area.matchMedia,area.width,area.height,area.ratio,area.fillMode,area.showUploadPreview,area.isManageMode,area.textSyntaxHighlight,area.textMarkdownPreview,area.mediaSize?.width,area.mediaSize?.height];
export const sameLayout=(a,b)=>!!a&&a.length===b.length&&a.every((value,index)=>value===b[index]);
export const deferredLayoutHTML=html=>html.replace(/\s(src|srcset|poster)=/g,' data-clab-layout-$1=');
export function activateLayoutMedia(root){
    for(const node of root.querySelectorAll('[data-clab-layout-src],[data-clab-layout-srcset],[data-clab-layout-poster]'))for(const key of ['src','srcset','poster']){
        const attr='data-clab-layout-'+key;if(node.hasAttribute(attr)){node.setAttribute(key,node.getAttribute(attr));node.removeAttribute(attr);}
    }
}
export function measureCardLayout(root){root.querySelectorAll('textarea.clab-edit-val').forEach(measureInputText);}

function layoutMedia(root,area){
    if(area.type==='preview')return area.matchMedia?root.querySelector('.clab-preview-bg img.clab-preview-img,.clab-preview-bg video.clab-preview-img'):null;
    return area.autoHeight!==false&&area.showUploadPreview?root.querySelector('.clab-upload-preview img,.clab-upload-preview video'):null;
}
export function applyCardMediaSize(root,area,cache){
    const image=layoutMedia(root,area),saved=cache.get(area);if(!image||!saved)return;
    const url=image.getAttribute('data-clab-layout-src')||image.getAttribute('src');if(saved.url!==url)return;
    const box=image.closest('.clab-preview-bg,.clab-upload-preview');if(!box)return;
    box.style.aspectRatio=`${saved.width} / ${saved.height}`;if(box.classList.contains('clab-upload-preview'))box.style.height='auto';
}
export function preloadCardMediaSize(root,area,cache,changed){
    const image=layoutMedia(root,area),url=image?.getAttribute('data-clab-layout-src');if(!url)return;
    if(cache.get(area)?.url===url){applyCardMediaSize(root,area,cache);return;}
    const dispose=observeMediaDimensions(url,image.tagName==='VIDEO',({width,height})=>{
        cache.set(area,{url,width,height});if(root.isConnected){applyCardMediaSize(root,area,cache);changed();}
    });
    onModuleRemoved(root,dispose);
}
