import { attachToolbarDocking } from './toolbar_docking.js';
import { moreIcon, prepareToolbarItems } from './toolbar_items.js';
import { closeXYPopover } from './workspace_modes/xy_popover.js';

const layouts = new WeakMap();

function closeMenus(dock) {
    for (const menu of dock.querySelectorAll('.clab-toolbar-menu')) menu.style.display = 'none';
    const more = dock.querySelector('.clab-toolbar-overflow-menu');
    if (more.matches(':popover-open')) more.hidePopover();
}

function positionToolbarPopup(menu, anchor, dock) {
    const rect = anchor.getBoundingClientRect();
    const { width, height } = menu.getBoundingClientRect();
    const { clientWidth, clientHeight } = document.documentElement;
    const side = dock.dataset.dock;
    const above = side === 'bottom' || (rect.bottom + height + 4 > clientHeight && rect.top > height + 4);
    const y = above ? rect.top - height - 4 : rect.bottom + 4;
    const left = Math.round(Math.max(4, Math.min(rect.left, clientWidth - width - 4))) + 'px';
    const top = Math.round(Math.max(4, Math.min(y, clientHeight - height - 4))) + 'px';
    if (menu.style.left !== left) menu.style.left = left;
    if (menu.style.top !== top) menu.style.top = top;
}

export function restoreToolbarOverflow(toolbar) {
    const layout = layouts.get(toolbar);
    if (!layout || !layout.moved.length) return;
    closeMenus(layout.dock);
    for (const { node, placeholder, entry } of layout.moved) {
        placeholder.replaceWith(node);
        entry.remove();
    }
    layout.moved = [];
    layout.more.hidden = true;
}

export function scheduleToolbarLayout(toolbar) {
    const layout = layouts.get(toolbar);
    if (!layout || layout.frame) return;
    layout.frame = requestAnimationFrame(() => {
        layout.frame = 0;
        layout.fit();
    });
}

export function refreshToolbarItems(toolbar) {
    const layout = layouts.get(toolbar);
    if (!layout) return;
    layout.prepare();
    scheduleToolbarLayout(toolbar);
}

export function setupResponsiveToolbar(toolbar) {
    if (!toolbar || layouts.has(toolbar)) return;
    const dock = toolbar.closest('.clab-tool-dock');
    const panel = dock.closest('#clab-panel');
    toolbar.querySelector('#clab-preview-mode-switch').insertAdjacentHTML('beforebegin',
        '<div class="clab-toolbar-overflow" hidden>' +
        '<button type="button" class="clab-tool-button clab-tool-menu-button" id="clab-toolbar-more" aria-haspopup="menu" aria-expanded="false" title="更多工具" aria-label="更多工具"><span class="clab-tool-icon">' + moreIcon + '</span><span class="clab-tool-label">更多工具</span><span class="clab-tool-short-label" aria-hidden="true">更多</span></button>' +
        '<div class="clab-toolbar-overflow-menu" id="clab-toolbar-more-menu" popover="auto"></div></div>');
    const more = dock.querySelector('.clab-toolbar-overflow');
    const contextual = toolbar.querySelector('#clab-module-toolbar');
    const moreButton = more.querySelector('button');
    const moreMenu = more.querySelector('[popover]');
    moreButton.onclick = event => {
        event.stopPropagation();
        if (moreMenu.matches(':popover-open')) moreMenu.hidePopover();
        else {
            closeMenus(dock);
            moreMenu.showPopover();
            positionToolbarPopup(moreMenu, moreButton, dock);
        }
    };
    moreMenu.addEventListener('toggle', () => moreButton.setAttribute('aria-expanded', String(moreMenu.matches(':popover-open'))));
    moreMenu.addEventListener('mousedown', event => event.stopPropagation());
    new ResizeObserver(() => {
        if (moreMenu.matches(':popover-open')) positionToolbarPopup(moreMenu, moreButton, dock);
    }).observe(moreMenu);

    const legacyMenus = [...dock.querySelectorAll('.clab-toolbar-menu')];
    const updateMenus = () => {
        for (const menu of legacyMenus) {
            const open = menu.style.display === 'block' && !moreMenu.contains(menu) && menu.parentElement.getClientRects().length;
            if (open) {
                if (!menu.matches(':popover-open')) menu.showPopover();
                positionToolbarPopup(menu, menu.parentElement, dock);
            } else if (menu.matches(':popover-open')) menu.hidePopover();
        }
    };
    const menuObserver = new MutationObserver(updateMenus);
    for (const menu of legacyMenus) {
        menu.setAttribute('popover', 'manual');
        menuObserver.observe(menu, { attributes:true, attributeFilter:['style'] });
    }

    const layout = {
        dock, more, moved:[], frame:0,
        prepare: () => prepareToolbarItems(dock),
        fit() {
            restoreToolbarOverflow(toolbar);
            if (!dock.clientWidth) return;
            const items = this.prepare();
            const floating = dock.dataset.dock === 'float';
            const visible = () => items.filter(node => node.getClientRects().length &&
                !moreMenu.contains(node) && (!floating || !contextual.contains(node)));
            const fits = () => {
                docking.clamp();
                const bounds = dock.getBoundingClientRect();
                const style = getComputedStyle(dock);
                // The panel scales while opening, but computed CSS padding is unscaled.
                const scale = bounds.width / parseFloat(style.width);
                const limit = Math.min(bounds.right, panel.getBoundingClientRect().right) - Math.max(parseFloat(style.paddingRight), 2) * scale;
                const controls = [...visible()];
                if (!more.hidden) controls.push(more);
                return controls.every(node => node.getBoundingClientRect().right <= limit + 0.5);
            };
            dock.removeAttribute('data-dense');
            more.hidden = true;
            if (fits()) return;
            dock.setAttribute('data-dense', '');
            if (fits()) return;
            const candidates = visible().sort((a,b) => Number(a.dataset.toolbarPriority) - Number(b.dataset.toolbarPriority));
            more.hidden = false;
            for (const node of candidates) {
                const placeholder = document.createComment('toolbar item');
                const entry = document.createElement('div');
                entry.className = 'clab-toolbar-overflow-entry';
                node.replaceWith(placeholder);
                entry.append(node);
                moreMenu.append(entry);
                layout.moved.push({ node, placeholder, entry });
                if (fits()) break;
            }
            [...moreMenu.children].sort((a,b) => items.indexOf(a.firstElementChild) - items.indexOf(b.firstElementChild))
                .forEach(entry => moreMenu.append(entry));
        },
    };
    layouts.set(toolbar, layout);
    const schedule = () => scheduleToolbarLayout(toolbar);
    const docking = attachToolbarDocking(dock, panel, contextual, {
        closeMenus: () => { closeMenus(dock); closeXYPopover(); },
        fit: schedule,
    });
    new ResizeObserver(() => { docking.clamp(); schedule(); updateMenus(); }).observe(panel);
    new ResizeObserver(docking.clamp).observe(dock);
    new MutationObserver(records => {
        if (records.some(record => record.attributeName === 'data-workspace-mode')) {
            closeMenus(dock);
            schedule();
        } else if (!panel.classList.contains('visible')) {
            closeMenus(dock);
            if (panel.dataset.workspaceMode !== 'xy') closeXYPopover();
        }
    }).observe(panel, { attributes:true, attributeFilter:['data-workspace-mode','class'] });
    document.fonts.ready.then(schedule);
    schedule();
}
