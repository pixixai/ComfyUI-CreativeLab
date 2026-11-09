let sequence = 0;

export function createProgressOutline(ringClass, pathClass) {
    const gradient = `clab-progress-rainbow-${++sequence}`;
    const ring = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    ring.classList.add(ringClass);
    ring.setAttribute('aria-hidden', 'true');
    ring.innerHTML = `<defs><linearGradient id="${gradient}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff5370"/><stop offset=".16" stop-color="#ff9f43"/><stop offset=".33" stop-color="#ffe66d"/><stop offset=".5" stop-color="#6be585"/><stop offset=".66" stop-color="#48dbfb"/><stop offset=".83" stop-color="#668cff"/><stop offset="1" stop-color="#c678dd"/></linearGradient></defs><rect class="${pathClass}" x="1" y="1" fill="none" stroke="url(#${gradient})" stroke-width="2" pathLength="100"/>`;
    return ring;
}

export function sizeProgressOutline(ring, width, height) {
    const path = ring.querySelector('rect');
    ring.setAttribute('viewBox', `0 0 ${width} ${height}`);
    path.setAttribute('width', Math.max(0, width - 2));
    path.setAttribute('height', Math.max(0, height - 2));
}

export function updateProgressOutline(ring, progress) {
    ring.querySelector('rect').setAttribute('stroke-dasharray', `${progress} 100`);
    ring.dataset.progress = progress;
}
