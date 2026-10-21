const prepared = new WeakSet();

// Keep workflow data in the widget value without laying out a large JSON textarea.
export function prepareConfigStorage(node) {
    const widget = node.widgets?.find(widget => widget.name === 'scenes_data');
    const element = widget?.element || widget?.inputEl;
    if (!element || !widget.options?.getValue || !widget.options?.setValue || prepared.has(widget)) return;

    let value = widget.value;
    widget.options.getValue = () => value;
    widget.options.setValue = next => { value = next; };
    element.value = '';
    element.readOnly = true;
    element.spellcheck = false;
    element.placeholder = 'CreativeLab 配置数据由插件管理。\n请在 CLab 面板中编辑任务；配置随工作流一起保存。';
    prepared.add(widget);
}
