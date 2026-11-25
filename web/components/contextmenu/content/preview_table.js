import { parameterFields, buildXYMatrix, displayValue } from './preview_records.js';

export function buildTableModel(records, sources, config) {
    const fields = parameterFields(records);
    if (!config.x || !config.y) return { title: 'XY 矩阵', columns: [], rows: [], note: '至少需要两个不同的历史参数，请在右侧选择 X、Y 轴。' };
    const matrix = buildXYMatrix(records, config);
    config.zValue = matrix.activeZ;
    const fieldLabel = key => fields.find(field => field.key === key)?.label || '';
    return { title: `XY 矩阵 · X：${fieldLabel(config.x)} · Y：${fieldLabel(config.y)}${config.z ? ` · ${fieldLabel(config.z)}＝${displayValue(matrix.zs.find(([key]) => key === matrix.activeZ)?.[1])}` : ''}`,
        columns: [fieldLabel(config.y), ...matrix.xs.map(([, value]) => displayValue(value))],
        rows: matrix.ys.map(([yk, y]) => ({ label: displayValue(y), cells: [{ text: displayValue(y), records: [] }, ...matrix.xs.map(([xk]) => ({ text: '', records: matrix.cells.get(JSON.stringify([xk, yk])) || [] }))] })),
        emptyCellLabel: '无结果',
        note: `缺失组合保留空格；同一组合的多条记录全部保留。${matrix.missing ? ` ${matrix.missing} 条记录不符合输出模块、轴或筛选条件。` : ''}`,
        zs: matrix.zs, activeZ: matrix.activeZ };
}
