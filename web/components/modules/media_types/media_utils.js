/**
 * 文件名: media_utils.js
 * 职责: 提供多媒体组件共用的纯函数 (时间格式化、类型探测等)
 */

export function formatTime(seconds) {
    if (isNaN(seconds) || !isFinite(seconds)) return "00:00";
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

export function formatTimeWithFrames(seconds, fps = 30) {
    if (isNaN(seconds) || !isFinite(seconds)) return "00:00:00";
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    const f = Math.floor((seconds % 1) * fps).toString().padStart(2, '0');
    return `${m}:${s}:${f}`;
}

export function getMediaType(url) {
    if (!url) return 'none';
    const cleanUrl = url.split('?')[0].toLowerCase();
    
    try {
        const u = new URL(url, window.location.origin);
        const filename = u.searchParams.get('filename') || '';
        const ext = filename.split('.').pop().toLowerCase();
        if (['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(ext)) return 'video';
        if (['mp3', 'wav', 'ogg', 'flac', 'aac'].includes(ext)) return 'audio';
        if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp'].includes(ext)) return 'image';
        if (filename !== '') return 'file';
    } catch(e) {}

    if (cleanUrl.match(/\.(mp4|webm|mov|avi|mkv)$/)) return 'video';
    if (cleanUrl.match(/\.(mp3|wav|ogg|flac|aac)$/)) return 'audio';
    if (cleanUrl.match(/\.(png|jpg|jpeg|webp|gif|bmp)$/)) return 'image';
    return 'file';
}