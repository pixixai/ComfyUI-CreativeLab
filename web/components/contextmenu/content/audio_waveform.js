/**
 * 文件名: audio_waveform.js
 * 路径: web/components/contextmenu/content/audio_waveform.js
 * 职责: 计算、渲染预览区域的音频波形进度，并处理拖动进度和鼠标滚轮快进等交互。
 */
import { previewModalStore } from "./state.js";
import { clampValue } from "./shared.js";
import { getAudioWavePeaks, drawAudioWave } from "../../modules/media_types/audio_waveform.js";

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
