export function medianMediaRatio(sizes) {
    const ratios=sizes.filter(size=>size?.width>0&&size?.height>0&&Number.isFinite(size.width/size.height)).map(size=>size.width/size.height).sort((a,b)=>a-b);
    return ratios.length?ratios[Math.floor((ratios.length-1)/2)]:1;
}

export function selectXYCells(cells,selected,targetId,anchorId,event) {
    const target=cells.find(cell=>cell.card.id===targetId),anchor=cells.find(cell=>cell.card.id===anchorId);
    if(!target)return [];
    if(event.shiftKey&&anchor&&anchor.z===target.z){
        const range=cells.filter(cell=>cell.z===target.z&&cell.x>=Math.min(target.x,anchor.x)&&cell.x<=Math.max(target.x,anchor.x)&&cell.y>=Math.min(target.y,anchor.y)&&cell.y<=Math.max(target.y,anchor.y)).map(cell=>cell.card.id);
        return event.ctrlKey||event.metaKey?[...new Set([...selected,...range])]:range;
    }
    if(event.ctrlKey||event.metaKey)return selected.includes(targetId)?selected.filter(id=>id!==targetId):[...selected,targetId];
    return [targetId];
}
