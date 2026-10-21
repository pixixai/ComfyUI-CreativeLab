import { axisLabelConfig } from './axis_label_layout.js';

const names=['左上','上中','右上','左中','中心','右中','左下','下中','右下'];
export function axisLabelControlsHTML() {
    return `<div class="clab-xy-label-controls"><div class="clab-xy-label-alignment"><span>对齐原点</span><div class="clab-xy-label-anchor" role="group" aria-label="文本对齐原点">${names.map((name,index)=>`<button type="button" data-xy-label-anchor="${index}" title="${name}与轴数据原点对齐" aria-label="${name}" aria-pressed="false"></button>`).join('')}</div></div><div class="clab-xy-label-angle"><span>角度</span><button type="button" data-xy-label-dial role="slider" aria-label="拖动调整文本角度" aria-valuemin="0" aria-valuemax="360" aria-valuenow="0" title="拖动圆盘调整角度；方向键微调，Shift 每次 15°"><svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="16" cy="16" r="13"/><g><path d="M16 16h12"/></g></svg></button><label><input type="number" data-xy-label-angle aria-label="文本角度" min="0" max="360" step="1"><span>°</span></label></div></div>`;
}

export function attachAxisLabelControls(popup,name,getXY,preview,commit) {
    const dial=popup.querySelector('[data-xy-label-dial]'),input=popup.querySelector('[data-xy-label-angle]'),hand=dial.querySelector('g'),buttons=[...popup.querySelectorAll('[data-xy-label-anchor]')];
    let drag,frame=0;
    const sync=()=>{
        const config=axisLabelConfig(getXY()[name],name,getXY().origin);
        input.value=config.angle;hand.setAttribute('transform',`rotate(${config.angle} 16 16)`);dial.setAttribute('aria-valuenow',String(config.angle));dial.setAttribute('aria-valuetext',`${config.angle}°`);
        buttons.forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.xyLabelAnchor)===config.anchor)));
    };
    const paint=()=>{frame=0;if(popup.isConnected)preview();};
    const schedule=()=>{if(!frame)frame=requestAnimationFrame(paint);};
    const flush=()=>{cancelAnimationFrame(frame);paint();commit();};
    const setAngle=angle=>{getXY()[name].labelAngle=angle;sync();schedule();};
    buttons.forEach(button=>button.addEventListener('click',()=>{getXY()[name].labelAnchor=Number(button.dataset.xyLabelAnchor);sync();flush();}));
    input.addEventListener('input',()=>{const angle=input.valueAsNumber;if(Number.isFinite(angle)&&angle>=0&&angle<=360)setAngle(angle);});
    input.addEventListener('change',()=>{const angle=input.valueAsNumber;if(!Number.isFinite(angle)||angle<0||angle>360){input.reportValidity();sync();return;}setAngle(angle);flush();});
    const rotate=event=>{
        const r=dial.getBoundingClientRect(),x=event.clientX-(r.left+r.width/2),y=event.clientY-(r.top+r.height/2);
        if(Math.hypot(x,y)<2)return;setAngle(Math.round((Math.atan2(y,x)*180/Math.PI+360)%360));
    };
    const stop=()=>{if(drag==null)return;const id=drag;drag=null;dial.classList.remove('is-dragging');if(dial.hasPointerCapture(id))dial.releasePointerCapture(id);if(popup.isConnected)flush();};
    dial.addEventListener('pointerdown',event=>{if(event.button!==0)return;event.preventDefault();popup.ownerDocument.activeElement?.blur();drag=event.pointerId;dial.setPointerCapture(drag);dial.classList.add('is-dragging');rotate(event);});
    dial.addEventListener('pointermove',event=>{if(event.pointerId!==drag)return;if(!event.buttons){stop();return;}event.preventDefault();rotate(event);});
    dial.addEventListener('pointerup',event=>{if(event.pointerId===drag){event.preventDefault();rotate(event);stop();}});
    for(const type of ['pointercancel','lostpointercapture'])dial.addEventListener(type,stop);
    dial.addEventListener('keydown',event=>{
        if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key))return;
        event.preventDefault();const angle=axisLabelConfig(getXY()[name],name,getXY().origin).angle,delta=(event.shiftKey?15:1)*(['ArrowLeft','ArrowDown'].includes(event.key)?-1:1);
        setAngle(event.key==='Home'?0:event.key==='End'?360:(angle+delta+360)%360);flush();
    });
    popup.addEventListener('toggle',event=>{if(event.newState==='closed'){cancelAnimationFrame(frame);stop();}});
    sync();
}
