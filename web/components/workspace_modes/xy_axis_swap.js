export function swapMatrixAxes(xy,first,second) {
    const names=['x','y','z'];
    if(!names.includes(first)||!names.includes(second)||first===second)return false;
    const {bindings,values}=xy[first];
    xy[first].bindings=xy[second].bindings;xy[first].values=xy[second].values;
    xy[second].bindings=bindings;xy[second].values=values;
    if(first==='z'||second==='z'){xy.z.enabled=xy.z.bindings.length>0;xy.z.current=0;}
    return true;
}
