export function axisLabelState(axis) {
    return {
        ...(Number.isInteger(axis?.labelAnchor)&&axis.labelAnchor>=0&&axis.labelAnchor<=8?{labelAnchor:axis.labelAnchor}:{}),
        ...(Number.isFinite(axis?.labelAngle)?{labelAngle:Math.max(0,Math.min(360,axis.labelAngle))}:{}),
    };
}

export function axisLabelConfig(axis,name,origin) {
    const saved=axisLabelState(axis),anchor=saved.labelAnchor??(name==='x'?(origin==='top'?7:1):5);
    return {anchor,angle:saved.labelAngle??0,x:(anchor%3)/2,y:Math.floor(anchor/3)/2};
}

export function axisLabelTransform(config) {
    return {transform:`translate(${-100*config.x}%,${-100*config.y}%) rotate(${config.angle}deg)`,origin:`${100*config.x}% ${100*config.y}%`};
}

export function axisLabelBounds(point,width,height,config) {
    const radians=config.angle*Math.PI/180,c=Math.cos(radians),s=Math.sin(radians);
    const corners=[[0,0],[width,0],[0,height],[width,height]].map(([x,y])=>{
        x-=width*config.x;y-=height*config.y;return {x:point.x+x*c-y*s,y:point.y+x*s+y*c};
    });
    return {left:Math.min(...corners.map(p=>p.x)),top:Math.min(...corners.map(p=>p.y)),right:Math.max(...corners.map(p=>p.x)),bottom:Math.max(...corners.map(p=>p.y))};
}
