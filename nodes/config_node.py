# 文件名: nodes/config_node.py
# 职责: 在 ComfyUI 后端注册 "ShellLinkSystemConfig" 节点
# 作用: 作为一个无连线的“数据仓库”，专用于将前端 ShellLink 面板的 JSON 数据保存在工作流 (.json) 中

import json
import os
import shutil
from aiohttp import web
import folder_paths
from server import PromptServer

# =========================================================================
# 【新增】：注册 ShellLink 专用的后端 API，用于物理移动/复制并重命名图像文件
# =========================================================================
@PromptServer.instance.routes.post("/shell_link/organize_files")
async def shell_link_organize_files(request):
    try:
        data = await request.json()
        action = data.get("action", "copy") # 支持 "move" 或 "copy"
        files = data.get("files", [])
        
        output_dir = folder_paths.get_output_directory()
        results = []
        
        for f in files:
            orig_filename = f.get("filename")
            orig_subfolder = f.get("subfolder", "")
            target_subfolder = f.get("target_subfolder", "")
            target_filename = f.get("target_filename")
            
            if not orig_filename or not target_filename:
                continue
                
            src_path = os.path.join(output_dir, orig_subfolder, orig_filename)
            
            # 安全校验：确保文件存在，且没有越权访问 output 以外的目录
            if not os.path.exists(src_path) or not os.path.abspath(src_path).startswith(os.path.abspath(output_dir)):
                continue
                
            dest_dir = os.path.join(output_dir, target_subfolder)
            os.makedirs(dest_dir, exist_ok=True)
            
            # 自动补全正确的扩展名 (例如 .png 或 .mp4)
            ext = os.path.splitext(orig_filename)[1]
            if not ext:
                ext = ".png" # 兜底扩展名
            if not target_filename.endswith(ext):
                target_filename += ext
                
            dest_path = os.path.join(dest_dir, target_filename)
            
            # 执行文件操作
            if action == "move":
                shutil.move(src_path, dest_path)
            else:
                shutil.copy(src_path, dest_path)
                
            results.append({
                "old_id": f.get("id"),
                "new_filename": target_filename,
                "new_subfolder": target_subfolder
            })
            
        return web.json_response({"status": "success", "results": results})
    except Exception as e:
        return web.json_response({"status": "error", "error": str(e)}, status=500)


class ShellLinkSystemConfig:
    """
    ComfyUI-ShellLink 全局配置节点
    
    作用：
    作为一个隐式/显式的锚点节点，不参与任何连线。
    利用 ComfyUI 原生的序列化机制，将侧边栏（Shell）的所有卡片配置、绑定关系
    以 JSON 字符串的形式保存在 `scenes_data` 中，随工作流一同保存和加载。
    """
    
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                # 存储侧边栏所有状态的 JSON 字符串
                # multiline=True 让它在节点上以多行文本框显示（如果你不想完全隐藏它的话）
                "scenes_data": ("STRING", {
                    "default": "{}", 
                    "multiline": True,
                    "dynamicPrompts": False  # 必须添加：防止 JSON 里的 {} 被 ComfyUI 引擎当作动态提示词错误解析！
                }),
            },
        }

    # 不输出任何内容，完全与物理执行流解耦
    RETURN_TYPES = ()
    RETURN_NAMES = ()
    
    # 必须添加：告诉引擎即使没有输出连线，这也是个合法的终端节点，不要在执行时把它剔除
    OUTPUT_NODE = True
    
    # ComfyUI 的 CATEGORY 决定了它在右键菜单里的位置
    CATEGORY = "ShellLink"
    
    # 【修复点】：节点执行函数名！如果没有这个，ComfyUI 后端会拒绝加载该节点
    FUNCTION = "execute"

    def execute(self, scenes_data):
        # 作为一个纯粹的数据仓库，它在后端不需要执行任何图像或数据处理。
        # 只是为了满足 ComfyUI 的节点执行规范，返回空元组即可。
        # 实际的参数注入逻辑在前端 JS 拦截 queuePrompt 时就已完成了。
        return ()

# 必须导出的映射字典，以便 __init__.py 能够动态加载并注册到 ComfyUI 中
NODE_CLASS_MAPPINGS = {
    "ShellLinkSystemConfig": ShellLinkSystemConfig
}

# 自定义节点在 ComfyUI 右键菜单中的显示名称
NODE_DISPLAY_NAME_MAPPINGS = {
    "ShellLinkSystemConfig": "⚓ ShellLink 配置中心"
}