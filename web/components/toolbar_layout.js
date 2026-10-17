const layouts = new WeakMap();

export function restoreToolbarOverflow(toolbar) {
    const layout = layouts.get(toolbar);
    if (!layout) return;
    if (layout.menu.matches(':popover-open')) layout.menu.hidePopover();
    for (const { node, placeholder, entry } of layout.moved) {
        node.querySelectorAll('.clab-custom-select.open').forEach((select) => select.classList.remove('open'));
        node.querySelectorAll('.clab-custom-select-dropdown').forEach((dropdown) => {
            if (dropdown.parentElement.classList.contains('clab-custom-select')) dropdown.style.removeProperty('display');
            else dropdown.style.display = 'none';
        });
        placeholder.replaceWith(node);
        entry.remove();
    }
    layout.moved = [];
    layout.wrapper.hidden = true;
}

export function scheduleToolbarLayout(toolbar) {
    const layout = layouts.get(toolbar);
    if (!layout || layout.frame) return;
    layout.frame = requestAnimationFrame(() => {
        layout.frame = 0;
        layout.fit();
    });
}

export function setupResponsiveToolbar(toolbar) {
    if (!toolbar || layouts.has(toolbar)) return;
    const left = toolbar.querySelector('.clab-toolbar-left');
    const right = toolbar.querySelector('.clab-toolbar-right');
    const wrapper = document.createElement('div');
    wrapper.className = 'clab-toolbar-overflow';
    wrapper.hidden = true;
    wrapper.innerHTML = `
        <button type="button" class="clab-btn" id="clab-toolbar-more" aria-expanded="false" aria-controls="clab-toolbar-more-menu" title="更多工具">更多 ▾</button>
        <div id="clab-toolbar-more-menu" class="clab-toolbar-overflow-menu" popover="auto" aria-label="更多工具"></div>
    `;
    right.appendChild(wrapper);
    const button = wrapper.querySelector('button');
    const menu = wrapper.querySelector('[popover]');
    const staticItems = [
        ['clab-config-btn-wrapper', '配置与维护', 1],
        ['clab-import-json-wrapper', '导入', 2],
        ['clab-export-json-wrapper', '导出与下载', 2],
        ['clab-global-add-card', '新建任务', 6],
        ['clab-global-add-module', '新建模块', 6],
    ];
    for (const [id, label, priority] of staticItems) {
        const node = toolbar.querySelector(`#${id}`);
        if (!node) continue;
        node.dataset.clabOverflowLabel = label;
        node.dataset.clabOverflowPriority = priority;
    }

    const positionMenu = () => {
        const rect = button.getBoundingClientRect();
        const bounds = menu.getBoundingClientRect();
        const viewport = document.documentElement;
        menu.style.left = `${Math.max(8, Math.min(rect.right - bounds.width, viewport.clientWidth - bounds.width - 8))}px`;
        menu.style.top = `${Math.max(8, Math.min(rect.bottom + 6, viewport.clientHeight - bounds.height - 8))}px`;
    };
    button.onclick = (event) => {
        event.stopPropagation();
        if (menu.matches(':popover-open')) menu.hidePopover();
        else {
            menu.showPopover();
            positionMenu();
        }
    };
    menu.addEventListener('toggle', () => button.setAttribute('aria-expanded', String(menu.matches(':popover-open'))));
    menu.addEventListener('mousedown', (event) => event.stopPropagation());
    menu.addEventListener('click', (event) => event.stopPropagation());
    const menuObserver = new ResizeObserver(() => {
        if (menu.matches(':popover-open')) positionMenu();
    });
    menuObserver.observe(menu);

    const layout = {
        wrapper, menu, moved: [], frame: 0,
        fit() {
            if (toolbar.clientWidth === 0) return;
            restoreToolbarOverflow(toolbar);
            const fits = () => left.scrollWidth <= left.clientWidth + 1 && right.scrollWidth <= right.clientWidth + 1;
            for (const density of ['normal', 'compact', 'dense']) {
                toolbar.dataset.density = density;
                if (fits()) return;
            }
            const candidates = [...toolbar.querySelectorAll('[data-clab-overflow-priority]')]
                .filter((node) => node.getClientRects().length > 0)
                .sort((a, b) => Number(a.dataset.clabOverflowPriority) - Number(b.dataset.clabOverflowPriority));
            wrapper.hidden = false;
            for (const node of candidates) {
                const placeholder = document.createComment('toolbar item');
                const entry = document.createElement('div');
                entry.className = 'clab-toolbar-overflow-entry';
                const label = document.createElement('div');
                label.className = 'clab-toolbar-overflow-label';
                label.textContent = node.dataset.clabOverflowLabel;
                node.replaceWith(placeholder);
                entry.append(label, node);
                menu.appendChild(entry);
                layout.moved.push({ node, placeholder, entry });
                if (fits()) break;
            }
        },
    };
    layouts.set(toolbar, layout);
    let lastWidth = -1;
    const observer = new ResizeObserver(([entry]) => {
        if (entry.contentRect.width === lastWidth) return;
        lastWidth = entry.contentRect.width;
        scheduleToolbarLayout(toolbar);
    });
    observer.observe(toolbar);
    document.fonts.ready.then(() => scheduleToolbarLayout(toolbar));
    scheduleToolbarLayout(toolbar);
}
