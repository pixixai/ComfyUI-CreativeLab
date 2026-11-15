"""Read one level of the input tree without following paths outside its root."""

import mimetypes
import os


KINDS = {"image", "video", "audio", "model", "text", "file"}
MODEL_EXTENSIONS = {"glb", "gltf", "fbx", "obj", "stl", "ply", "bvh", "3mf", "usdz", "splat", "spz", "ksplat"}
TEXT_EXTENSIONS = {"txt", "md", "markdown", "json", "yaml", "yml", "xml", "csv", "tsv", "log"}


def accepts_file(name, kind):
    extension = name.rsplit(".", 1)[-1].lower()
    if kind == "file":
        return True
    if kind == "model":
        return extension in MODEL_EXTENSIONS
    if kind == "text":
        return extension in TEXT_EXTENSIONS
    mime = (mimetypes.guess_type(name, strict=False)[0] or "").split("/")[0]
    return mime == kind or kind == "audio" and mime == "video"


def list_input_directory(root, directory="", kind="file"):
    if kind not in KINDS:
        raise ValueError("不支持的文件类型")
    directory = directory.replace("\\", "/")
    if os.path.isabs(directory) or ":" in directory or "\0" in directory or ".." in directory.split("/"):
        raise ValueError("非法目录")
    root = os.path.realpath(root)
    target = os.path.realpath(os.path.join(root, directory))
    if os.path.commonpath([root, target]) != root:
        raise ValueError("目录超出 input 范围")
    entries = []
    with os.scandir(target) as children:
        for child in children:
            try:
                resolved = os.path.realpath(child.path)
                if os.path.commonpath([root, resolved]) != root:
                    continue
                folder = child.is_dir()
                if not folder and (not child.is_file() or not accepts_file(child.name, kind)):
                    continue
            except (OSError, ValueError):
                continue
            identity = os.path.normcase(os.path.relpath(resolved, root)).replace("\\", "/")
            entries.append({"name": child.name, "path": "/".join(filter(None, [directory.strip("/"), child.name])), "directory": folder, "key": "" if identity == "." else identity})
    entries.sort(key=lambda entry: (not entry["directory"], entry["name"].casefold()))
    return {"directory": directory.strip("/"), "kind": kind, "entries": entries}
