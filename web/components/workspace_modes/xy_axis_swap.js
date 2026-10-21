export function swapMatrixAxes(xy,first,second) {
    const names=['x','y','z'];
    if(!names.includes(first)||!names.includes(second)||first===second)return false;
    for(const key of ['bindings','values','inputText']){
        const value=xy[first][key];
        if(xy[second][key]===undefined)delete xy[first][key];else xy[first][key]=xy[second][key];
        if(value===undefined)delete xy[second][key];else xy[second][key]=value;
    }
    if(first==='z'||second==='z'){xy.z.enabled=xy.z.bindings.length>0;xy.z.current=0;}
    return true;
}
