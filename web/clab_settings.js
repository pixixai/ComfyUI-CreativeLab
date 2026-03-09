/**
 * 文件名: clab_settings.js
 * 职责: 注册与管理 CLab 插件在 ComfyUI 原生设置面板中的各项配置
 * 注意: ComfyUI 的设置项渲染逻辑是先进后出 (LIFO)，即在数组中越靠前，显示越靠下。
 */
import { app } from "../../scripts/app.js";

// --- 全局配置默认值与解析引擎 ---
function parseShortcut(shortcutStr) {
    if (!shortcutStr) return { key: 'c', ctrl: false, shift: false, alt: false, meta: false };
    const parts = shortcutStr.toLowerCase().split('+').map(s => s.trim());
    const parsed = { ctrl: false, shift: false, alt: false, meta: false, key: '' };
    
    parts.forEach(part => {
        if (part === 'ctrl' || part === 'control') parsed.ctrl = true;
        else if (part === 'shift') parsed.shift = true;
        else if (part === 'alt' || part === 'option') parsed.alt = true;
        else if (part === 'meta' || part === 'cmd' || part === 'win' || part === 'windows') parsed.meta = true;
        else parsed.key = part; 
    });
    return parsed;
}

// 内存中缓存全局变量，供各个 JS 模块极速读取
window._clabShortcutRaw = 'C'; 
window._clabShortcutParsed = parseShortcut('C');
window._clabBgBlur = true;
window._clabBgOpacity = 45;
window._clabMaxHistory = 50;
window._clabVideoAutoplay = true;
window._clabVideoMuted = true;
window._clabThumbPerfMode = false;
window._clabArchiveDir = 'CLab'; 
window._clabDeleteTemp = false; // 内部变量仍叫 DeleteTemp，受外部 KeepTemp 控制
window._clabFilePrefix = 'pix';
window._clabHaltOnError = true; 

// =========================================================================
// 全新主题专属变量 
// =========================================================================
window._clabThemeCardColor = '4caf50';
window._clabThemeCardBorder = 2;
window._clabThemeCardFill = 8;
window._clabThemeCardGlow = 15;

window._clabThemeModuleColor = '2196f3';
window._clabThemeModuleBorder = 1;
window._clabThemeModuleFill = 5;
window._clabThemeModuleGlow = 10;

// 【核心】：动态主题注入引擎 (支持透明度自动运算)
window._clabApplyTheme = function() {
    const root = document.documentElement;

    let cHex = (window._clabThemeCardColor || '4caf50').replace('#', '');
    if (cHex.length !== 6) cHex = '4caf50';
    let mHex = (window._clabThemeModuleColor || '2196f3').replace('#', '');
    if (mHex.length !== 6) mHex = '2196f3';

    // 辅助运算：将 0~100 的百分比转换为 00~FF 的 16 进制 Alpha 通道
    const toHexAlpha = (percent) => {
        let val = Math.round((percent / 100) * 255);
        if (val < 0) val = 0; if (val > 255) val = 255;
        return val.toString(16).padStart(2, '0').toUpperCase();
    };

    // 1. 卡片主题 (固定发光透明度，动态计算内部填充透明度)
    root.style.setProperty('--clab-theme-card', `#${cHex}`);
    root.style.setProperty('--clab-theme-card-alpha', `#${cHex}4D`); // 30% 阴影
    root.style.setProperty('--clab-theme-card-bg', `#${cHex}${toHexAlpha(window._clabThemeCardFill)}`); 
    root.style.setProperty('--clab-theme-card-hover', `#${cHex}1A`); // 10% 悬停
    
    // 2. 模块主题
    root.style.setProperty('--clab-theme-module', `#${mHex}`);
    root.style.setProperty('--clab-theme-module-alpha', `#${mHex}66`); // 40% 阴影
    root.style.setProperty('--clab-theme-module-bg', `#${mHex}${toHexAlpha(window._clabThemeModuleFill)}`);

    // 3. 描边与发光强度映射
    root.style.setProperty('--clab-theme-card-border', `${window._clabThemeCardBorder}px`);
    root.style.setProperty('--clab-theme-card-glow', `${window._clabThemeCardGlow}px`);
    root.style.setProperty('--clab-theme-module-border', `${window._clabThemeModuleBorder}px`);
    root.style.setProperty('--clab-theme-module-glow', `${window._clabThemeModuleGlow}px`);
};

// LIFO 倒序数组：代码越靠前，UI 越靠下
const clabSettings = [
    
    // =========================================================================
    // 6. 模块选中态外观 (Module Appearance) - 最底部
    // =========================================================================
    {
        id: "CLab.ModuleApp.Glow",
        name: "发光强度 (Module Neon Glow)",
        type: "slider",
        defaultValue: 10,
        attrs: { min: 0, max: 30, step: 1 },
        category: ["Creative Lab", "模块选中态外观", "Glow"],
        tooltip: "模块被选中时的外发光模糊半径，设为 0 关闭发光。",
        onChange: (newVal) => {
            window._clabThemeModuleGlow = newVal;
            if (window._clabApplyTheme) window._clabApplyTheme();
        }
    },
    {
        id: "CLab.ModuleApp.Fill",
        name: "填充透明度 (Module Fill Opacity %)",
        type: "slider",
        defaultValue: 5,
        attrs: { min: 0, max: 100, step: 1 },
        category: ["Creative Lab", "模块选中态外观", "Fill"],
        tooltip: "模块被选中时内部高亮底色的浓度 (0 为完全透明)。",
        onChange: (newVal) => {
            window._clabThemeModuleFill = newVal;
            if (window._clabApplyTheme) window._clabApplyTheme();
        }
    },
    {
        id: "CLab.ModuleApp.Border",
        name: "描边粗细 (Module Border Width px)",
        type: "slider",
        defaultValue: 1,
        attrs: { min: 1, max: 4, step: 1 },
        category: ["Creative Lab", "模块选中态外观", "Border"],
        tooltip: "模块被选中时边界的线框厚度。",
        onChange: (newVal) => {
            window._clabThemeModuleBorder = newVal;
            if (window._clabApplyTheme) window._clabApplyTheme();
        }
    },
    {
        id: "CLab.ModuleApp.Color",
        name: "高亮主题色 (Module Highlight Color)",
        type: "color",
        defaultValue: "2196f3",
        category: ["Creative Lab", "模块选中态外观", "Color"],
        tooltip: "模块（输入/输出区）被点击选中时的主要区分色。默认: #2196F3 (亮蓝)",
        onChange: (newVal) => {
            window._clabThemeModuleColor = newVal;
            if (window._clabApplyTheme) window._clabApplyTheme();
        }
    },

    // =========================================================================
    // 5. 任务卡片选中态外观 (Card Appearance)
    // =========================================================================
    {
        id: "CLab.CardApp.Glow",
        name: "发光强度 (Card Neon Glow)",
        type: "slider",
        defaultValue: 15,
        attrs: { min: 0, max: 50, step: 1 },
        category: ["Creative Lab", "任务卡片选中态外观", "Glow"],
        tooltip: "任务卡片被选中时的外围光晕半径，拉满呈现赛博朋克风。",
        onChange: (newVal) => {
            window._clabThemeCardGlow = newVal;
            if (window._clabApplyTheme) window._clabApplyTheme();
        }
    },
    {
        id: "CLab.CardApp.Fill",
        name: "填充透明度 (Card Fill Opacity %)",
        type: "slider",
        defaultValue: 8,
        attrs: { min: 0, max: 100, step: 1 },
        category: ["Creative Lab", "任务卡片选中态外观", "Fill"],
        tooltip: "任务卡片被选中时内部高亮底色的浓度。",
        onChange: (newVal) => {
            window._clabThemeCardFill = newVal;
            if (window._clabApplyTheme) window._clabApplyTheme();
        }
    },
    {
        id: "CLab.CardApp.Border",
        name: "描边粗细 (Card Border Width px)",
        type: "slider",
        defaultValue: 2,
        attrs: { min: 1, max: 6, step: 1 },
        category: ["Creative Lab", "任务卡片选中态外观", "Border"],
        tooltip: "任务卡片处于选中激活状态时的边框厚度。",
        onChange: (newVal) => {
            window._clabThemeCardBorder = newVal;
            if (window._clabApplyTheme) window._clabApplyTheme();
        }
    },
    {
        id: "CLab.CardApp.Color",
        name: "高亮主题色 (Card Highlight Color)",
        type: "color",
        defaultValue: "4caf50",
        category: ["Creative Lab", "任务卡片选中态外观", "Color"],
        tooltip: "任务卡片被点击选中时的主题色及底部运行进度条颜色。默认: #4CAF50 (护眼绿)",
        onChange: (newVal) => {
            window._clabThemeCardColor = newVal;
            if (window._clabApplyTheme) window._clabApplyTheme();
        }
    },

    // =========================================================================
    // 4. 自动化行为 (Automation)
    // =========================================================================
    {
        id: "CLab.Auto.HaltOnError",
        name: "连续运行异常阻断 (Halt Batch on Error)",
        type: "boolean",
        defaultValue: true,
        category: ["Creative Lab", "自动化行为", "Halt"],
        tooltip: "开启时，任一任务报错将立即清空所有排队任务。关闭后，系统会跳过错误任务继续执行后续生成。",
        onChange: (newVal) => { window._clabHaltOnError = newVal; }
    },

    // =========================================================================
    // 3. 文件与数据流转 (File & Data I/O)
    // =========================================================================
    {
        id: "CLab.File.Prefix",
        name: "生成文件名前缀 (Filename Prefix)",
        type: "text",
        defaultValue: "pix",
        category: ["Creative Lab", "文件与数据流转", "Prefix"],
        tooltip: "自定义截胡保存时的文件名前缀，默认是 pix (例如 pix_01.png)。",
        onChange: (newVal) => {
            window._clabFilePrefix = (newVal || "").replace(/[\\/:"*?<>| ]/g, "").trim() || "pix";
        }
    },
    {
        id: "CLab.File.KeepTemp",
        name: "截胡时是否保留原临时文件 (Keep Original Temp Files)",
        type: "boolean",
        defaultValue: true,
        category: ["Creative Lab", "文件与数据流转", "KeepTemp"],
        tooltip: "关闭此项后，在把临时文件转移进专属归档目录的同时，会彻底删除原临时文件以节省硬盘空间。",
        onChange: (newVal) => { 
            window._clabDeleteTemp = !newVal; // 选中为保留，未选中则删除
        }
    },
    {
        id: "CLab.File.ArchiveDir",
        name: "归档文件夹名称 (Archive Folder Name)",
        type: "text",
        defaultValue: "CLab",
        category: ["Creative Lab", "文件与数据流转", "ArchiveDir"],
        tooltip: "面板自动截胡媒体和整理文件的归档根目录。请不要包含斜杠等非法路径字符。",
        onChange: (newVal) => {
            window._clabArchiveDir = (newVal || "").replace(/[\\/:"*?<>|]/g, "").trim() || "CLab";
        }
    },

    // =========================================================================
    // 2. 性能与媒体播放 (Performance & Media)
    // =========================================================================
    {
        id: "CLab.Media.ThumbMode",
        name: "高性能缩略图模式 (Thumb Performance Mode)",
        type: "boolean",
        defaultValue: false,
        category: ["Creative Lab", "性能与媒体播放", "ThumbMode"],
        tooltip: "开启时，网格历史记录中的视频仅加载首帧，极大节省内存。关闭后，网格中的所有视频都会自动静音循环播放 (适合高配机器)。",
        onChange: (newVal) => { window._clabThumbPerfMode = newVal; }
    },
    {
        id: "CLab.Media.Muted",
        name: "视频默认静音 (Video Default Muted)",
        type: "boolean",
        defaultValue: true,
        category: ["Creative Lab", "性能与媒体播放", "Muted"],
        tooltip: "开启后，所有主视频加载时默认静音。注意：如果关闭静音且同时开启自动播放，部分浏览器由于安全政策可能会拦截播放。",
        onChange: (newVal) => { window._clabVideoMuted = newVal; }
    },
    {
        id: "CLab.Media.Autoplay",
        name: "自动播放视频 (Video Autoplay)",
        type: "boolean",
        defaultValue: true,
        category: ["Creative Lab", "性能与媒体播放", "Autoplay"],
        tooltip: "关闭时，主视频生成后仅显示首帧，点击画面才开始播放（可大幅节省多卡片并行生成时的 GPU 解码压力）。",
        onChange: (newVal) => { window._clabVideoAutoplay = newVal; }
    },
    {
        id: "CLab.Media.MaxHistory",
        name: "历史记录容量上限 (Max History Records)",
        type: "number",
        defaultValue: 50,
        attrs: { showButtons: true, min: 1, max: 1000, step: 1 },
        category: ["Creative Lab", "性能与媒体播放", "MaxHistory"],
        tooltip: "限制单个输出模块最多保存多少条生成记录，超出后会自动剔除最旧的记录以防止内存溢出。",
        onChange: (newVal) => { window._clabMaxHistory = newVal || 50; }
    },

    // =========================================================================
    // 1. 常规 (General) - 最顶部
    // =========================================================================
    {
        id: "CLab.General.BgOpacity",
        name: "面板背景不透明度 (Panel Opacity %)",
        type: "slider",
        defaultValue: 45,
        attrs: { min: 0, max: 100, step: 5 },
        category: ["Creative Lab", "常规", "BgOpacity"],
        tooltip: "调节主面板背景的通透度 (0 = 全透，100 = 纯色)。",
        onChange: (newVal) => {
            window._clabBgOpacity = newVal;
            const panel = document.getElementById('clab-panel');
            if (panel) panel.style.background = `rgba(30, 30, 30, ${newVal / 100})`;
        }
    },
    {
        id: "CLab.General.BackdropBlur",
        name: "启用背景毛玻璃效果 (Backdrop Blur)",
        type: "boolean",
        defaultValue: true,
        category: ["Creative Lab", "常规", "BackdropBlur"],
        tooltip: "开启后增加高级感，但在低端显卡上可能会导致面板拖动掉帧。",
        onChange: (newVal) => {
            window._clabBgBlur = newVal;
            const panel = document.getElementById('clab-panel');
            if (panel) {
                panel.style.backdropFilter = newVal ? 'blur(15px)' : 'none';
                panel.style.webkitBackdropFilter = newVal ? 'blur(15px)' : 'none';
            }
        }
    },
    {
        id: "CLab.General.Shortcut",
        name: "快捷键 (Panel Shortcut)",
        type: "text",
        defaultValue: "C",
        category: ["Creative Lab", "常规", "Shortcut"],
        tooltip: "支持组合键，例如: C, Shift+C, Ctrl+M, Alt+X (不区分大小写)",
        attrs: { placeholder: "例如: Shift+C" },
        onChange: (newVal) => {
            const raw = newVal ? newVal.trim() : 'C';
            window._clabShortcutRaw = raw;
            window._clabShortcutParsed = parseShortcut(raw);
            const tabBtn = document.querySelector('[title*="打开 CLab 主面板"]');
            if (tabBtn) tabBtn.title = `打开 CLab 主面板 (快捷键 ${raw.toUpperCase()})`;
        }
    }
];

// 核心重置按钮引擎 (置于数组末尾，在 UI 中显示于最顶端)
const resetSetting = {
    id: "CLab.General.ResetAll",
    name: "恢复全部默认设置 (Restore All Defaults)",
    type: "boolean",
    defaultValue: false,
    category: ["Creative Lab", "常规", "ResetAll"], 
    tooltip: "⚠️ 警告：点击此开关将立即重置 CLab 的所有设置为出厂默认状态。",
    onChange: async (newVal) => {
        if (newVal === true) {
            const confirmed = confirm("您确定要将 Creative Lab 的所有设置恢复为默认值吗？此操作不可撤销。");

            if (confirmed) {
                // 遍历内部数组，将除了自身之外的所有设置恢复为 default
                for (const setting of clabSettings) {
                    try {
                        if (setting.id && setting.defaultValue !== undefined) {
                            await app.extensionManager.setting.set(setting.id, setting.defaultValue);
                        }
                    } catch (e) {
                        console.error(`[CLab] 恢复默认设置失败: ${setting.id}`, e);
                    }
                }
            }

            // 执行完毕后，自动把复选框拨回 false 状态
            setTimeout(() => {
                app.extensionManager.setting.set("CLab.General.ResetAll", false);
            }, 100);
        }
    }
};

app.registerExtension({
    name: "ComfyUI.CLab.Settings",
    settings: [...clabSettings, resetSetting],
    
    setup() {
        setTimeout(() => {
            try {
                const getSet = (id, defaultVal) => {
                    const val = app.extensionManager.setting.get(id);
                    return val !== undefined && val !== null ? val : defaultVal;
                };

                // 读取设置并应用至全局变量
                const shortcut = getSet("CLab.General.Shortcut", "C");
                window._clabShortcutRaw = shortcut.trim();
                window._clabShortcutParsed = parseShortcut(window._clabShortcutRaw);

                window._clabBgOpacity = getSet("CLab.General.BgOpacity", 45);
                window._clabBgBlur = getSet("CLab.General.BackdropBlur", true);
                
                window._clabMaxHistory = getSet("CLab.Media.MaxHistory", 50);
                window._clabVideoAutoplay = getSet("CLab.Media.Autoplay", true);
                window._clabVideoMuted = getSet("CLab.Media.Muted", true);
                window._clabThumbPerfMode = getSet("CLab.Media.ThumbMode", false);
                
                window._clabArchiveDir = getSet("CLab.File.ArchiveDir", "CLab").replace(/[\\/:"*?<>|]/g, "").trim() || "CLab";
                window._clabDeleteTemp = !getSet("CLab.File.KeepTemp", true); // 反转 Keep 的逻辑供核心模块使用
                window._clabFilePrefix = getSet("CLab.File.Prefix", "pix").replace(/[\\/:"*?<>| ]/g, "").trim() || "pix";
                
                window._clabHaltOnError = getSet("CLab.Auto.HaltOnError", true);

                window._clabThemeCardColor = getSet("CLab.CardApp.Color", "4caf50");
                window._clabThemeCardBorder = getSet("CLab.CardApp.Border", 2);
                window._clabThemeCardFill = getSet("CLab.CardApp.Fill", 8);
                window._clabThemeCardGlow = getSet("CLab.CardApp.Glow", 15);

                window._clabThemeModuleColor = getSet("CLab.ModuleApp.Color", "2196f3");
                window._clabThemeModuleBorder = getSet("CLab.ModuleApp.Border", 1);
                window._clabThemeModuleFill = getSet("CLab.ModuleApp.Fill", 5);
                window._clabThemeModuleGlow = getSet("CLab.ModuleApp.Glow", 10);

                // 初始化时执行一次全量主题注入
                if (window._clabApplyTheme) window._clabApplyTheme();

            } catch (e) {
                console.warn("[CLab] 读取设置失败，回退到默认值", e);
            }
        }, 500);
    }
});