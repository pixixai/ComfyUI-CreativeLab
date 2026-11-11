import { projectTableSheet } from '../../workspace_modes/table_sheet.js';
import { matchingTasks } from '../../workspace_modes/task_model.js';

export function workspaceTableSource(cards, sheet, template) {
    return {
        columns: sheet.columns.map((area,index)=>({id:area.id,area,index})),
        rows: template ? matchingTasks(cards,template) : projectTableSheet(sheet,cards),
    };
}

export function workspaceMatrixAvailable(xy) {
    return !!(xy?.x?.values?.length && xy.y?.values?.length);
}

export const xySourceSetting = config => `<label class="clab-review-field">矩阵来源<select data-sheet-option="matrixSource">
    <option value="workspace"${config.matrixSource === 'workspace' ? ' selected' : ''}>工作区矩阵</option>
    <option value="history"${config.matrixSource === 'history' ? ' selected' : ''}>按历史参数重排</option>
    </select></label>`;
