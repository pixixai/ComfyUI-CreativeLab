const peakCache = new Map();

export async function getAudioWavePeaks(url, bars = 200) {
    const key = `${url}|${bars}`;
    if (peakCache.has(key)) return peakCache.get(key);
    const loader = (async () => {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) throw new Error('AudioContext unavailable');
        const context = new AudioContext();
        try {
            const buffer = await context.decodeAudioData(await response.arrayBuffer());
            const channels = Array.from({ length: buffer.numberOfChannels }, (_, i) => buffer.getChannelData(i));
            const peaks = Array.from({ length: bars }, (_, i) => {
                const start = Math.floor(i * buffer.length / bars), end = Math.floor((i + 1) * buffer.length / bars);
                let peak = 0;
                for (const channel of channels) {
                    for (let sample = start; sample < end; sample++) peak = Math.max(peak, Math.abs(channel[sample]));
                }
                return peak;
            });
            const max = Math.max(...peaks) || 1;
            return peaks.map(value => value / max);
        } finally {
            await context.close();
        }
    })();
    peakCache.set(key, loader);
    if (peakCache.size > 16) peakCache.delete(peakCache.keys().next().value);
    try { return await loader; }
    catch (error) { if (peakCache.get(key) === loader) peakCache.delete(key); throw error; }
}

export function drawAudioWave(canvas, peaks, progress = 0, played = '#ccc', remaining = '#666') {
    const width = canvas.clientWidth, height = canvas.clientHeight;
    if (!width || !height) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    const context = canvas.getContext('2d');
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!peaks?.length) return;
    const count = Math.min(peaks.length, Math.max(1, Math.floor(width / 4)));
    for (let i = 0; i < count; i++) {
        const start = Math.floor(i * peaks.length / count), end = Math.floor((i + 1) * peaks.length / count);
        const peak = Math.max(.03, ...peaks.slice(start, end));
        const barHeight = peak * height * .8;
        context.fillStyle = i / count < progress ? played : remaining;
        context.fillRect(i * width / count + 1, (height - barHeight) / 2, Math.max(1, width / count - 2), barHeight);
    }
}
