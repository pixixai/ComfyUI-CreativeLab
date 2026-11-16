const escape=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
export function externalImportIcon(url,external){
    if(!external||!url)return '';
    let name=url;
    try{const value=new URL(url,'http://local/');name=value.searchParams.get('filename')||value.pathname.split('/').at(-1)||url;}catch{}
    return `<span class="clab-external-import-icon" title="${escape('外部导入 · '+name+'\n无生成参数快照')}" aria-label="外部导入" style="display:inline-flex;align-items:center;justify-content:center;width:14px;height:14px;flex:none;pointer-events:auto;color:#aaa;vertical-align:middle;margin-inline-end:3px"><svg viewBox="0 0 190 200" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M21.25,191.25c5.12,5.17,12.09,8.1,19.38,8.12,7.5,0,13.75-2.5,19.38-8.12l27.5-28.12c3.75-3.75,6.25-8.75,7.5-13.75.63-1.87.63-3.75.63-5.62s0-3.75-.63-5.62c-1.25-5-3.75-10.01-7.5-13.75l-28.12-28.14c-10.52-10.7-27.72-10.85-38.42-.33-.11.11-.22.22-.33.33-3.82,3.82-11.3,13.49-14.6,17.82-.31.4-.88.48-1.28.17-.23-.17-.36-.44-.36-.73v-63.85c0-14.25,11.66-25.92,25.92-25.92h107.53c14.25,0,25.92,11.66,25.92,25.92v124.42c0,14.25-11.66,25.92-25.92,25.92H30.92c-14.25,0-25.92-11.66-25.92-25.92,0-.51.41-.92.91-.92.29,0,.57.14.74.38,3.21,4.4,10.33,13.92,14.59,17.71h0Z"/><path d="M177.5,167.5V35c0-14.37-11.87-26.25-26.25-26.25H37.5C41.87,3.75,48.75,0,56.25,0h108.75c13.75,0,25,11.25,25,25v126.87c0,9.38-5,17.5-13.12,21.88.62-2.5.62-4.38.62-6.25Z"/><path d="M81.41,138.42l-32.82-27.83c-6.23-5.28-15.71-.21-14.76,7.91l1,8.62c.19,1.61-1.07,3.02-2.69,3.02H14.89c-7.8,0-14.51,5.99-14.88,13.78-.39,8.32,6.24,15.18,14.47,15.18h17.66c1.62,0,2.87,1.41,2.69,3.02l-1,8.62c-.95,8.11,8.53,13.19,14.76,7.91l32.82-27.83c3.82-3.24,3.82-9.14,0-12.38Z"/></svg></span>`;
}
export function outputImportIcon(area){
    if(!area?.resultUrl||area.missingHistoryRun)return '';
    const index=area.history?.[area.historyIndex]===area.resultUrl?area.historyIndex:area.history?.lastIndexOf(area.resultUrl);
    return externalImportIcon(area.resultUrl,area.historyRuns?.[index]?.externalImport);
}
