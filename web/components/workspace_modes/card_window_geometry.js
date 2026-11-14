export function cardWindowRange(count,left,viewport,width,gap,buffer=5) {
    const stride=Math.max(1,width+gap),total=Math.max(0,count*stride-gap);
    const offset=Math.max(0,Math.min(left,Math.max(0,total-viewport)));
    const start=Math.max(0,Math.floor(offset/stride)-buffer),end=Math.min(count,Math.ceil((offset+viewport)/stride)+buffer);
    return {start:Math.min(count,start),end,total,stride};
}
