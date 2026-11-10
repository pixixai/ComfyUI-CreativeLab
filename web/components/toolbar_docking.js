const sides = ['top', 'bottom', 'left', 'right'];
const isSide = side => side === 'left' || side === 'right';
const clampValue = (value, max, min = 0) => Math.min(Math.max(min, max), Math.max(min, value));
const layoutKey = 'clab-toolbar-dock-v1';
const minDockWidth = 66;
const defaultDockWidth = 76;

export function attachToolbarDocking(dock, panel, contextual, { fit, closeMenus }) {
    const resize = dock.querySelector('.clab-tool-resize');
    const layout = { side:'top', x:0, y:0, width:defaultDockWidth };
    try {
        const { side, x, y, width } = JSON.parse(localStorage.getItem(layoutKey)) || {};
        if ([...sides, 'float'].includes(side)) layout.side = side;
        layout.x = Number(x) || 0;
        layout.y = Number(y) || 0;
        layout.width = Number(width) || defaultDockWidth;
    } catch {}
    let gesture, suppressClick = false;

    const clamp = () => {
        if (!panel.clientWidth) return;
        const width = clampValue(layout.width, Math.min(260, panel.clientWidth - 100), minDockWidth);
        panel.style.setProperty('--clab-dock-width', width + 'px');
        if (layout.side !== 'float') return;
        const x = clampValue(Number(layout.x) || 0, panel.clientWidth - dock.offsetWidth);
        const y = clampValue(Number(layout.y) || 0, panel.clientHeight - dock.offsetHeight);
        dock.style.left = x + 'px';
        dock.style.top = y + 'px';
        if (!contextual.getClientRects().length) return;

        const gap = 8;
        contextual.style.maxWidth = Math.max(0, panel.clientWidth - gap * 2) + 'px';
        contextual.style.maxHeight = Math.max(0, panel.clientHeight - gap * 2) + 'px';
        const { offsetWidth:w, offsetHeight:h } = contextual;
        const above = y - h - gap;
        const contextX = x + (dock.offsetWidth - w) / 2;
        const contextY = above >= 0 || y > panel.clientHeight - y - dock.offsetHeight ? above : y + dock.offsetHeight + gap;
        contextual.style.left = clampValue(contextX, panel.clientWidth - w) - x - dock.clientLeft + 'px';
        contextual.style.top = clampValue(contextY, panel.clientHeight - h) - y - dock.clientTop + 'px';
    };
    const setSide = side => {
        layout.side = side;
        const vertical = isSide(side);
        dock.dataset.dock = side;
        dock.toggleAttribute('data-vertical', vertical);
        dock.setAttribute('aria-orientation', vertical ? 'vertical' : 'horizontal');
        if (vertical) panel.dataset.toolbarSide = side;
        else delete panel.dataset.toolbarSide;
        if (side !== 'float') {
            dock.style.removeProperty('top');
            dock.style.removeProperty('left');
            for (const property of ['top','left','max-width','max-height']) contextual.style.removeProperty(property);
        }
        clamp();
        fit();
    };
    const save = () => localStorage.setItem(layoutKey, JSON.stringify(layout));
    const snap = (x, y) => {
        const rect = panel.getBoundingClientRect();
        const bottom = rect.top + panel.clientHeight;
        if (x < rect.left - 20 || x > rect.right + 20 || y < rect.top - 20 || y > bottom + 30) return;
        const distances = [Math.abs(y - rect.top), Math.abs(y - bottom), Math.abs(x - rect.left), Math.abs(x - rect.right)];
        const closest = Math.min(...distances);
        if (closest <= 23) return sides[distances.indexOf(closest)];
    };
    dock.addEventListener('pointerdown', event => {
        if (event.button !== 0 || gesture) return;
        const target = event.target;
        const floatingContext = layout.side === 'float' && target === contextual;
        const moving = target === dock || floatingContext || target.matches('.clab-toolbar-left,.clab-toolbar-right');
        const resizing = target === resize;
        if (!moving && !resizing) return;
        const captureTarget = resizing || floatingContext ? target : dock;
        event.preventDefault();
        captureTarget.setPointerCapture(event.pointerId);
        const rect = dock.getBoundingClientRect();
        gesture = {
            id:event.pointerId, x:event.clientX, y:event.clientY,
            offsetX:event.clientX-rect.left, offsetY:event.clientY-rect.top,
            width:rect.width, moving, captureTarget, started:false,
            previous:{...layout},
        };
    });
    window.addEventListener('pointermove', event => {
        if (gesture?.id !== event.pointerId) return;
        const dx = event.clientX - gesture.x;
        const dy = event.clientY - gesture.y;
        if (!gesture.started) {
            if (Math.hypot(dx, dy) < 5) return;
            gesture.started = true;
            closeMenus();
        }
        event.preventDefault();
        if (gesture.moving) {
            if (layout.side !== 'float') {
                setSide('float');
                const floating = dock.getBoundingClientRect();
                gesture.offsetX = floating.width / 2;
                gesture.offsetY = floating.height / 2;
            }
            const bounds = panel.getBoundingClientRect();
            layout.x = event.clientX - bounds.left - panel.clientLeft - gesture.offsetX;
            layout.y = event.clientY - bounds.top - panel.clientTop - gesture.offsetY;
            clamp();
            gesture.snap = snap(event.clientX,event.clientY);
            if (gesture.snap) panel.dataset.toolbarSnap = gesture.snap;
            else delete panel.dataset.toolbarSnap;
        } else {
            layout.width = clampValue(gesture.width + dx * (layout.side === 'right' ? -1 : 1), Math.min(260, panel.clientWidth - 100), minDockWidth);
            clamp();
            fit();
        }
    });
    const finish = event => {
        if (gesture?.id !== event.pointerId) return;
        const ended = gesture;
        gesture = null;
        if (!ended.started) return;
        delete panel.dataset.toolbarSnap;
        if (event.type === 'pointerup') {
            suppressClick = true;
            setTimeout(() => { suppressClick = false; }, 0);
            if (ended.moving) {
                if (ended.snap) setSide(ended.snap);
                else {
                    layout.x = dock.offsetLeft;
                    layout.y = dock.offsetTop;
                }
            }
            save();
        } else {
            Object.assign(layout, ended.previous);
            setSide(layout.side);
        }
        if (ended.captureTarget.hasPointerCapture(event.pointerId)) ended.captureTarget.releasePointerCapture(event.pointerId);
    };
    window.addEventListener('pointerup', finish);
    window.addEventListener('pointercancel', finish);
    dock.addEventListener('lostpointercapture', finish);
    window.addEventListener('click', event => {
        if (!suppressClick || event.detail === 0) return;
        event.preventDefault();
        event.stopImmediatePropagation();
    }, true);
    dock.addEventListener('dragstart', event => event.preventDefault());
    dock.addEventListener('dblclick', event => {
        if (layout.side !== 'float' || event.target !== dock) return;
        closeMenus();
        setSide('top');
        save();
    });
    setSide(layout.side);
    return { clamp };
}
