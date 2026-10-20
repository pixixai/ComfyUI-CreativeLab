export function showCardsMode(wrapper) {
    wrapper.style.removeProperty('transform');wrapper.style.removeProperty('grid-template-columns');wrapper.style.removeProperty('height');wrapper.style.removeProperty('width');
    wrapper.querySelectorAll('[data-xy-part],.clab-xy-ticks,.clab-xy-empty,.clab-xy-history,.clab-xy-progress-ring').forEach(element=>element.remove());
    wrapper.querySelectorAll(':scope > .clab-card').forEach(card=>{
        card.hidden=false;card.draggable=true;card.classList.remove('clab-xy-running');card.style.removeProperty('grid-column');card.style.removeProperty('grid-row');
        for(const key of ['left','top','width','height'])card.style.removeProperty(key);
        card.querySelectorAll('.clab-area').forEach(area=>{area.hidden=false;area.draggable=true;area.style.removeProperty('order');});
    });
}
