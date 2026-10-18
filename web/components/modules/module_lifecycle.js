const cleanups = new WeakMap();
let observer = null;

export function onModuleRemoved(element, cleanup) {
    const callbacks = cleanups.get(element) || [];
    callbacks.push(cleanup);
    cleanups.set(element, callbacks);
}

export function releaseModuleTree(root) {
    if (root.isConnected) return;
    for (const element of [root, ...(root.querySelectorAll?.('*') || [])]) {
        const callbacks = cleanups.get(element);
        if (!callbacks) continue;
        cleanups.delete(element);
        callbacks.forEach(cleanup => cleanup());
    }
}

export function observeModuleRemoval(panel) {
    if (observer) return;
    observer = new MutationObserver(records => {
        for (const record of records) record.removedNodes.forEach(releaseModuleTree);
    });
    observer.observe(panel, { childList: true, subtree: true });
}

export function moveModuleDOM(parent, element, before = null) {
    if (element.parentNode === parent && element.nextSibling === before) return;
    if (parent.moveBefore && element.isConnected && parent.isConnected) {
        parent.moveBefore(element, before);
        return;
    }
    const playing = [...element.querySelectorAll('video, audio')].filter(media => !media.paused);
    parent.insertBefore(element, before);
    playing.forEach(media => { if (media.paused) media.play().catch(() => {}); });
}
