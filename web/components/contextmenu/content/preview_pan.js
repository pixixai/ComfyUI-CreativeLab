export function attachPreviewPan(surface, onPan, {
    primary = true, canStart = () => true, onStart = () => {},
} = {}) {
    const controller = new AbortController(), {signal} = controller;
    let pointer;
    surface.classList.toggle('clab-preview-pan', primary);

    const stop = () => {
        if (!pointer) return;
        const {id} = pointer;
        pointer = null;
        surface.classList.remove('is-panning');
        if (surface.hasPointerCapture(id)) surface.releasePointerCapture(id);
    };
    surface.addEventListener('pointerdown', event => {
        if (pointer || !(event.button === 1 || primary && event.button === 0) || !canStart(event.target)) return;
        if (event.button === 1) event.preventDefault();
        pointer = {id:event.pointerId,x:event.clientX,y:event.clientY,moved:false};
        surface.setPointerCapture(event.pointerId);
        surface.classList.add('is-panning');
        onStart();
    }, {signal});
    surface.addEventListener('pointermove', event => {
        if (pointer?.id !== event.pointerId) return;
        const x = event.clientX - pointer.x, y = event.clientY - pointer.y;
        if (!pointer.moved && Math.hypot(x,y) <= 3) return;
        Object.assign(pointer, {x:event.clientX,y:event.clientY,moved:true});
        onPan(x,y);
    }, {signal});
    for (const type of ['pointerup','pointercancel','lostpointercapture']) {
        surface.addEventListener(type, event => { if (pointer?.id === event.pointerId) stop(); }, {signal});
    }
    surface.addEventListener('auxclick', event => {
        if (event.button === 1 && canStart(event.target)) event.preventDefault();
    }, {signal});
    window.addEventListener('blur', stop, {signal});
    return () => { controller.abort(); stop(); };
}
