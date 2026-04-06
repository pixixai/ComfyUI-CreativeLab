/**
 * 文件名: audio_waveform.js
 * 路径: web/components/contextmenu/content/audio_waveform.js
 * 职责: 计算、渲染预览区域的音频波形进度，并处理拖动进度和鼠标滚轮快进等交互。
 */
import { previewModalStore } from "./state.js";
import { clampValue, normalizeHistoryUrl } from "./shared.js";

async function getAudioWavePeaks(url, bars = 200) {
    const key = normalizeHistoryUrl(url || "");
    if (!key) return null;

    const cached = previewModalStore.audioWaveCache.get(key);
    if (Array.isArray(cached)) return cached;
    if (cached && typeof cached.then === "function") return cached;

    const loader = (async () => {
        const response = await fetch(url, { cache: "no-store" });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const arrayBuffer = await response.arrayBuffer();
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) throw new Error("AudioContext unavailable");
        const ctx = new AudioCtx();
        try {
            const audioBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0));
            const channels = [];
            for (let i = 0; i < audioBuffer.numberOfChannels; i += 1) {
                channels.push(audioBuffer.getChannelData(i));
            }
            const length = audioBuffer.length;
            const block = Math.max(1, Math.floor(length / bars));
            const peaks = [];

            for (let i = 0; i < bars; i += 1) {
                const start = i * block;
                const end = Math.min(length, start + block);
                let peak = 0;
                for (let c = 0; c < channels.length; c += 1) {
                    const data = channels[c];
                    for (let s = start; s < end; s += 1) {
                        const val = Math.abs(data[s] || 0);
                        if (val > peak) peak = val;
                    }
                }
                peaks.push(peak);
            }

            const maxPeak = peaks.reduce((max, val) => Math.max(max, val), 0) || 1;
            return peaks.map((val) => val / maxPeak);
        } finally {
            try { await ctx.close(); } catch (_) { }
        }
    })();

    previewModalStore.audioWaveCache.set(key, loader);
    try {
        const peaks = await loader;
        previewModalStore.audioWaveCache.set(key, peaks);
        return peaks;
    } catch (error) {
        previewModalStore.audioWaveCache.delete(key);
        throw error;
    }
}

function drawAudioWave(canvas, peaks, progress = 0) {
    if (!canvas || !Array.isArray(peaks) || peaks.length === 0) return;
    const width = Math.max(1, canvas.clientWidth);
    const height = Math.max(1, canvas.clientHeight);
    const dpr = window.devicePixelRatio || 1;

    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.clearRect(0, 0, width, height);
    const centerY = height / 2;
    const barWidth = width / peaks.length;
    const progressedBars = Math.floor(clampValue(progress, 0, 1) * peaks.length);

    for (let i = 0; i < peaks.length; i += 1) {
        const peak = clampValue(peaks[i], 0.03, 1);
        const barH = peak * (height * 0.86);
        const x = i * barWidth;
        const y = centerY - barH / 2;
        ctx.fillStyle = i <= progressedBars ? "rgba(90, 190, 255, 0.95)" : "rgba(255, 255, 255, 0.28)";
        ctx.fillRect(x + 0.4, y, Math.max(1, barWidth - 0.8), barH);
    }
}

export function setupAudioWaveform(center, entry) {
    const audio = center.querySelector(".clab-preview-modal-main-audio");
    const canvas = center.querySelector(".clab-preview-modal-audio-wave");
    if (!audio || !canvas || !entry?.url) return;

    let peaks = null;
    let disposed = false;
    let resizeObserver = null;

    const redraw = () => {
        if (disposed || !peaks) return;
        const progress = (audio.duration && Number.isFinite(audio.duration) && audio.duration > 0)
            ? (audio.currentTime / audio.duration)
            : 0;
        drawAudioWave(canvas, peaks, progress);
    };

    const handleTime = () => redraw();
    audio.addEventListener("timeupdate", handleTime);
    audio.addEventListener("seeked", handleTime);
    audio.addEventListener("loadedmetadata", handleTime);
    audio.addEventListener("ended", handleTime);

    const seekByRatio = (ratio) => {
        if (!audio.duration || !Number.isFinite(audio.duration) || audio.duration <= 0) return;
        const next = clampValue(ratio, 0, 1) * audio.duration;
        audio.currentTime = next;
        redraw();
    };

    const handleCanvasClick = (event) => {
        const rect = canvas.getBoundingClientRect();
        if (!rect.width) return;
        const ratio = (event.clientX - rect.left) / rect.width;
        seekByRatio(ratio);
    };

    const handleCanvasWheel = (event) => {
        if (!audio.duration || !Number.isFinite(audio.duration) || audio.duration <= 0) return;
        event.preventDefault();
        event.stopPropagation();

        const delta = event.deltaY || event.deltaX;
        if (!delta) return;
        const baseStep = delta * 0.002;
        const step = event.shiftKey
            ? (Math.sign(baseStep || 0) || 1) * (1 / 30)
            : baseStep;
        const next = clampValue(audio.currentTime + step, 0, audio.duration);
        audio.currentTime = next;
        redraw();
    };

    canvas.addEventListener("click", handleCanvasClick);
    canvas.addEventListener("wheel", handleCanvasWheel, { passive: false });

    if (typeof ResizeObserver !== "undefined") {
        resizeObserver = new ResizeObserver(() => redraw());
        resizeObserver.observe(canvas);
    }

    previewModalStore.activeAudioCleanup = () => {
        disposed = true;
        audio.removeEventListener("timeupdate", handleTime);
        audio.removeEventListener("seeked", handleTime);
        audio.removeEventListener("loadedmetadata", handleTime);
        audio.removeEventListener("ended", handleTime);
        canvas.removeEventListener("click", handleCanvasClick);
        canvas.removeEventListener("wheel", handleCanvasWheel);
        if (resizeObserver) resizeObserver.disconnect();
    };

    getAudioWavePeaks(entry.url).then((result) => {
        if (disposed) return;
        peaks = result;
        redraw();
    }).catch(() => {
        // Keep silent fallback: audio can still play without waveform.
    });
}
