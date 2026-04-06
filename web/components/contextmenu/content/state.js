/**
 * 文件名: state.js
 * 路径: web/components/contextmenu/content/state.js
 * 职责: 内容分组逻辑内部特有的状态映射，用于独立管理比如预览弹框内的活跃变量等（避免过多污染向父级状态抛出）。
 * previewModalStore 这类共享状态，避免循环依赖
 */

export const previewModalStore = {
    root: null,
    entries: [],
    snapshots: [],
    activeIndex: 0,
    textCache: new Map(),
    textEditorState: new Map(),
    audioWaveCache: new Map(),
    activeAreaId: "",
    activeCardId: "",
    imageZoom: 1,
    imagePanX: 0,
    imagePanY: 0,
    imageDragging: false,
    imageDragStartX: 0,
    imageDragStartY: 0,
    imageDragOriginX: 0,
    imageDragOriginY: 0,
    imageSpacePressed: false,
    activeAudioCleanup: null,
    activeTextCleanup: null,
};

export const externalEditorStore = {
    codeMirrorPromise: null,
    toastPromise: null,
};

