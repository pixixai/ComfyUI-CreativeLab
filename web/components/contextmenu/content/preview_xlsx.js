import { zipSync, strToU8 } from '../../../vendor/zip.js';
import { tableAppearance } from '../../workspace_modes/table_appearance.js';
import { escapeHtml as esc } from './shared.js';
import { getCurrentUrl } from './history_helpers.js';
import { canvasBlob } from './preview_layout_export.js';

const spreadsheet = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main';
const relationship = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
const drawing = 'http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing';
const emu = value=>Math.round(value*9525);
const xml = content=>'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+content;
const relationships = entries=>xml(`<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${entries.map(([kind,target],index)=>
    `<Relationship Id="rId${index+1}" Type="${relationship}/${kind}" Target="${target}"/>`).join('')}</Relationships>`);
const clean = value=>esc(String(value).replace(/[^\u0009\u000a\u000d\u0020-\uD7FF\uE000-\uFFFD\u{10000}-\u{10FFFF}]/gu,'').slice(0,32767));
const columnId = index=>{
    let name='';
    for(let n=index+1;n;n=Math.floor((n-1)/26))name=String.fromCharCode(65+(n-1)%26)+name;
    return name;
};
const xlsxWidth = pixels=>Math.min(255,Math.max(1,Math.round(pixels*256/7)/256));
const xlsxHeight = pixels=>Math.min(409.5,Math.max(1,pixels*.75));

function cellXML(value,row,column,style) {
    const prefix=`<c r="${columnId(column)}${row+1}" s="${style}"`;
    if(value===undefined||value===null||value==='')return prefix+'/>';
    if(typeof value==='boolean')return `${prefix} t="b"><v>${Number(value)}</v></c>`;
    if(typeof value==='number'&&Number.isFinite(value))return `${prefix}><v>${value}</v></c>`;
    return `${prefix} t="inlineStr"><is><t xml:space="preserve">${clean(typeof value==='object'?JSON.stringify(value):value)}</t></is></c>`;
}

function stylesXML() {
    const normal='<xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>';
    const styles=[['left','center',3],...['top','center','bottom'].flatMap(vertical=>
        ['left','center','right'].map(horizontal=>[horizontal,vertical,2])),['center','center',3]];
    return xml(`<styleSheet xmlns="${spreadsheet}">
      <fonts count="2"><font><sz val="11"/><name val="Calibri"/><color rgb="FFBBBBBB"/></font><font><sz val="9"/><name val="Calibri"/><color rgb="FFBBBBBB"/></font></fonts>
      <fills count="4"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill>
      <fill><patternFill patternType="solid"><fgColor rgb="FF232323"/><bgColor indexed="64"/></patternFill></fill>
      <fill><patternFill patternType="solid"><fgColor rgb="FF1D1D1D"/><bgColor indexed="64"/></patternFill></fill></fills>
      <borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border><border><left/><right style="thin"><color rgb="FF3C3C3C"/></right><top/><bottom style="thin"><color rgb="FF3C3C3C"/></bottom><diagonal/></border></borders>
      <cellStyleXfs count="1">${normal}</cellStyleXfs>
      <cellXfs count="${styles.length+1}">${normal}${styles.map(([horizontal,vertical,fill])=>`<xf numFmtId="0" fontId="1" fillId="${fill}" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="${horizontal}" vertical="${vertical}" wrapText="1"/></xf>`).join('')}</cellXfs>
      <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
    </styleSheet>`);
}

function pictureXML({row,column,x,y,width,height},index) {
    const id=index+1,cx=emu(width),cy=emu(height);
    return `<xdr:oneCellAnchor><xdr:from><xdr:col>${column}</xdr:col><xdr:colOff>${emu(x)}</xdr:colOff><xdr:row>${row}</xdr:row><xdr:rowOff>${emu(y)}</xdr:rowOff></xdr:from>
      <xdr:ext cx="${cx}" cy="${cy}"/><xdr:pic><xdr:nvPicPr><xdr:cNvPr id="${id}" name="Picture ${id}"/><xdr:cNvPicPr><a:picLocks noChangeAspect="1"/></xdr:cNvPicPr></xdr:nvPicPr>
      <xdr:blipFill><a:blip r:embed="rId${id}"/><a:stretch><a:fillRect/></a:stretch></xdr:blipFill>
      <xdr:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></xdr:spPr></xdr:pic><xdr:clientData/></xdr:oneCellAnchor>`;
}

export function buildWorkbook({widths,heights,rows,pictures}) {
    if(widths.length>16384||rows.length>1048576)throw new Error('数据超出 Excel 工作表的行列上限');
    const sheetRows=rows.map((row,index)=>`<row r="${index+1}" ht="${xlsxHeight(heights[index])}" customHeight="1">${row.map((cell,column)=>cellXML(cell.value,index,column,cell.style)).join('')}</row>`).join('');
    const fileTypes=[
        ['/xl/workbook.xml','spreadsheetml.sheet.main+xml'],
        ['/xl/worksheets/sheet1.xml','spreadsheetml.worksheet+xml'],
        ['/xl/styles.xml','spreadsheetml.styles+xml'],
        ...(pictures.length?[['/xl/drawings/drawing1.xml','drawing+xml']]:[]),
    ];
    const files={
        '[Content_Types].xml':xml(`<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
            <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
            <Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/>
            ${fileTypes.map(([part,type])=>`<Override PartName="${part}" ContentType="application/vnd.openxmlformats-officedocument.${type}"/>`).join('')}</Types>`),
        '_rels/.rels':relationships([['officeDocument','xl/workbook.xml']]),
        'xl/workbook.xml':xml(`<workbook xmlns="${spreadsheet}" xmlns:r="${relationship}"><bookViews><workbookView/></bookViews><sheets><sheet name="参数表" sheetId="1" r:id="rId1"/></sheets></workbook>`),
        'xl/_rels/workbook.xml.rels':relationships([['worksheet','worksheets/sheet1.xml'],['styles','styles.xml']]),
        'xl/styles.xml':stylesXML(),
        'xl/worksheets/sheet1.xml':xml(`<worksheet xmlns="${spreadsheet}" xmlns:r="${relationship}"><sheetViews><sheetView showGridLines="0" workbookViewId="0"/></sheetViews>
            <cols>${widths.map((width,index)=>`<col min="${index+1}" max="${index+1}" width="${xlsxWidth(width)}" customWidth="1"/>`).join('')}</cols><sheetData>${sheetRows}</sheetData>
            ${pictures.length?'<drawing r:id="rId1"/>':''}</worksheet>`),
    };
    if(pictures.length){
        files['xl/worksheets/_rels/sheet1.xml.rels']=relationships([['drawing','../drawings/drawing1.xml']]);
        files['xl/drawings/drawing1.xml']=xml(`<xdr:wsDr xmlns:xdr="${drawing}" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="${relationship}">${pictures.map(pictureXML).join('')}</xdr:wsDr>`);
        files['xl/drawings/_rels/drawing1.xml.rels']=relationships(pictures.map((_,index)=>['image',`../media/image${index+1}.png`]));
        pictures.forEach(({bytes},index)=>{files[`xl/media/image${index+1}.png`]=bytes;});
    }
    const parts=Object.fromEntries(Object.entries(files).map(([name,content])=>[name,typeof content==='string'?strToU8(content):content]));
    return new Blob([zipSync(parts,{level:0})],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
}

function fraction(value) {
    if(value.endsWith('%'))return Number(value.slice(0,-1))/100;
    return ({left:0,top:0,center:.5,right:1,bottom:1})[value]??.5;
}

function picturePosition(image,cell,row,column){
    const url=image.currentSrc||image.src;
    if(!url||!image.offsetWidth||!image.offsetHeight)return null;
    const rect=image.getBoundingClientRect(),bounds=cell.getBoundingClientRect(),style=getComputedStyle(image);
    const x=Math.max(0,rect.left-bounds.left),y=Math.max(0,rect.top-bounds.top);
    const width=Math.min(rect.width,xlsxWidth(bounds.width)*7-x),height=Math.min(rect.height,xlsxHeight(bounds.height)/.75-y);
    if(width<1||height<1)return null;
    return {row,column,url,x,y,width,height,rect,fit:style.objectFit,position:style.objectPosition};
}

async function embedPicture(picture, cache) {
    const {row,column,url,x,y,width,height,rect,fit,position}=picture;
    if(!cache.has(url))cache.set(url,fetch(url).then(response=>{
        if(!response.ok)throw new Error(`图片读取失败（HTTP ${response.status}）`);
        return response.blob();
    }));
    const source=new Image(),asset=URL.createObjectURL(await cache.get(url)),canvas=document.createElement('canvas');
    try{
        source.src=asset;await source.decode();
        canvas.width=Math.round(width);canvas.height=Math.round(height);
        const ratios=[rect.width/source.naturalWidth,rect.height/source.naturalHeight];
        const scale=fit==='cover'?Math.max(...ratios):fit==='none'?1:Math.min(...ratios,fit==='scale-down'?1:Infinity);
        const w=fit==='fill'?rect.width:source.naturalWidth*scale,h=fit==='fill'?rect.height:source.naturalHeight*scale;
        const [horizontal,vertical='50%']=position.split(' ');
        canvas.getContext('2d').drawImage(source,(rect.width-w)*fraction(horizontal),(rect.height-h)*fraction(vertical),w,h);
        return {row,column,x,y,width,height,bytes:new Uint8Array(await (await canvasBlob(canvas)).arrayBuffer())};
    }finally{URL.revokeObjectURL(asset);canvas.width=canvas.height=0;}
}

export async function exportParameterWorkbook(stage, {rows,fields,layout}) {
    const header=stage.querySelector('.clab-table-head');
    const widths=[...header.children].map(column=>column.offsetWidth);
    const heights=[header.offsetHeight],jobs=[],cache=new Map();
    const cells=[['任务',...fields.map(field=>field.label)].map(value=>({value,style:1}))];
    for(const [index,row] of rows.entries()){
        const rendered=stage.querySelector(`[data-review-row="${CSS.escape(row.id)}"]`);
        heights.push(rendered.offsetHeight);
        const label=rendered.querySelector('[data-review-row-name]').textContent;
        const current=[{value:label,style:11}];
        for(const [column,field] of fields.entries()){
            const area=row.areas[field.index],element=rendered.querySelector(`[data-review-column-index="${field.index}"]`);
            const image=element.querySelector('.clab-preview-bg img[src],.clab-upload-preview:not([hidden]) img[src]');
            const picture=image?picturePosition(image,element,index+1,column+1):null;
            const cell={value:area.type==='edit'?area.value:area.missingHistoryRun?'':getCurrentUrl(area)||'',style:2+(tableAppearance(layout,'alignment',row.id,field.key)??0)};
            if(picture)jobs.push({picture,cell,output:area.type==='preview'});
            current.push(cell);
        }
        cells.push(current);
    }
    const pictures=[];
    for(const {picture,cell,output} of jobs){
        try{
            pictures.push(await embedPicture(picture,cache));
            if(output)cell.value='';
        }catch{if(!cell.value)cell.value=picture.url;}
    }
    return buildWorkbook({widths,heights,rows:cells,pictures});
}
