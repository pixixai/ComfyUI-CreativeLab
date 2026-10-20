export function axisValueDescription(value,fields=[]) {
    if(!Array.isArray(value))return String(value);
    return value.map((entry,index)=>`${fields[index]?.displayName||fields[index]?.name||index+1}：${String(entry)}`).join('\n');
}
export function axisValueLabel(axis,index) {
    const value=axis.values[index];
    return (Array.isArray(value)?value.join(' × '):String(value)).replace(/\s+/g,' ').trim();
}
