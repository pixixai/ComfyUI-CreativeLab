/**
 * 文件名: media_file.js
 * 职责: 普通文件下载占位符渲染
 */

export function renderFile(area, url) {
    let filename = "未知文件";
    try {
        const resolved = new URL(url, window.location.origin);
        filename = resolved.searchParams.get('filename') || decodeURIComponent(resolved.pathname.split('/').pop()) || filename;
    } catch(e) {}
    
    const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const model = /\.(glb|gltf|obj|stl|fbx|ply|3mf)$/i.test(filename);
    return `
        <div class="clab-file-display">
            ${model ? '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="m12 2 9 5v10l-9 5-9-5V7Zm0 10 9-5M12 12 3 7m9 5v10"/></svg><span>3D 模型</span>' : `
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 8px;">
                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                <polyline points="13 2 13 9 20 9"></polyline>
            </svg>`}
            <div class="clab-file-name" title="${escapeHTML(filename)}">${escapeHTML(filename)}</div>
            <a class="clab-file-download" href="${escapeHTML(url)}" download="${escapeHTML(filename)}">${model ? '下载模型' : '点击下载'}</a>
        </div>
    `;
}
