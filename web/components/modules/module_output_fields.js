const ratios=['21:9','16:9','3:2','4:3','1:1','3:4','2:3','9:16','9:21','自定义比例'];
const fillModes=['显示全部','填充','拉伸'];

function dimensions(area) {
    const preset=ratios.includes(area.ratio)&&area.ratio!=='自定义比例'?area.ratio.split(':').map(Number):[16,9];
    return [area.width,area.height].map((value,i)=>Number.isFinite(Number(value))&&Number(value)>0?Number(value):preset[i]);
}

export function outputSettingValues(area) {
    const [width,height]=dimensions(area);
    return {matchMedia:!!area.matchMedia,ratio:area.matchMedia?'自定义比例':ratios.includes(area.ratio)?area.ratio:'16:9',width,height,fillMode:fillModes.includes(area.fillMode)?area.fillMode:'显示全部'};
}

export function outputSettingFieldsHTML() {
    return `<div class="clab-output-settings-fields">
        <label class="clab-output-match"><input type="checkbox" data-setting="matchMedia">匹配媒体比例</label>
        <label class="clab-output-setting-row">比例<select data-setting="ratio" aria-label="比例">${ratios.map(ratio=>`<option>${ratio}</option>`).join('')}</select></label>
        <div class="clab-output-dimensions"><label>宽度<input type="number" min="1" data-setting="width" aria-label="宽度"></label><label>高度<input type="number" min="1" data-setting="height" aria-label="高度"></label></div>
        <label class="clab-output-setting-row">显示方式<select data-setting="fillMode" aria-label="显示方式"><option value="" disabled>多种设置</option>${fillModes.map(mode=>`<option>${mode}</option>`).join('')}</select></label></div>`;
}

export function refreshOutputSettingFields(container,areas) {
    const values=areas.map(outputSettingValues),common=key=>values.every(value=>value[key]===values[0][key])?values[0][key]:'';
    const controls=Object.fromEntries([...container.querySelectorAll('[data-setting]')].map(element=>[element.dataset.setting,element]));
    controls.matchMedia.checked=values.every(value=>value.matchMedia);
    controls.matchMedia.indeterminate=!controls.matchMedia.checked&&values.some(value=>value.matchMedia);
    for(const key of ['ratio','width','height','fillMode']){
        controls[key].value=common(key);controls[key].disabled=key!=='fillMode'&&values.some(value=>value.matchMedia);
        if(key==='width'||key==='height')controls[key].placeholder=common(key)===''?'多种':'';
    }
}

export function outputSettingChange(key,value) {
    if(key==='matchMedia')return area=>{area.matchMedia=!!value;if(area.matchMedia)area.ratio='自定义比例';};
    if(key==='fillMode'&&fillModes.includes(value))return area=>area.fillMode=value;
    if(key==='ratio'&&ratios.includes(value))return area=>{
        const [width,height]=value==='自定义比例'?dimensions(area):value.split(':').map(Number);
        Object.assign(area,{ratio:value,width,height});
    };
    if((key==='width'||key==='height')&&Number.isFinite(Number(value))&&Number(value)>0)return area=>{
        const [width,height]=dimensions(area);Object.assign(area,{ratio:'自定义比例',width,height,[key]:Number(value)});
    };
    return null;
}
