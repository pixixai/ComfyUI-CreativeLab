import ast
import asyncio
import importlib.util
from pathlib import Path
from types import SimpleNamespace
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("clab_input_files", ROOT / "input_files.py")
files = importlib.util.module_from_spec(spec)
spec.loader.exec_module(files)


class InputFileTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="clab-input-tree-")
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name) / "input"
        self.root.mkdir()
        (self.root / "refs/deep").mkdir(parents=True)
        for name in ["root.png", "clip.mp4", "sound.wav", "readme.txt", "scene.fbx", "refs/图像.png", "refs/deep/same.png"]:
            (self.root / name).write_bytes(b"fixture")

    def test_reads_only_one_level_and_filters_media(self):
        entries = files.list_input_directory(str(self.root), kind="image")["entries"]
        self.assertEqual([entry["name"] for entry in entries], ["refs", "root.png"])
        nested = files.list_input_directory(str(self.root), "refs", "image")["entries"]
        self.assertEqual([entry["path"] for entry in nested], ["refs/deep", "refs/图像.png"])
        self.assertEqual(files.list_input_directory(str(self.root), "refs/deep", "image")["entries"][0]["path"], "refs/deep/same.png")

    def test_audio_video_models_and_text(self):
        for kind, expected in [("video", ["clip.mp4"]), ("audio", ["clip.mp4", "sound.wav"]), ("model", ["scene.fbx"]), ("text", ["readme.txt"])]:
            entries = files.list_input_directory(str(self.root), kind=kind)["entries"]
            self.assertEqual([entry["name"] for entry in entries if not entry["directory"]], expected)
        self.assertEqual(len(files.list_input_directory(str(self.root))["entries"]), 6)

    def test_rejects_traversal_absolute_paths_and_invalid_types(self):
        for directory in ["../", "refs/../../", str(self.root), "C:/Windows", "\\\\server\\share", "refs\0deep"]:
            with self.subTest(directory=directory), self.assertRaises(ValueError):
                files.list_input_directory(str(self.root), directory)
        with self.assertRaises(ValueError):
            files.list_input_directory(str(self.root), kind="checkpoint")
        with self.assertRaises(OSError):
            files.list_input_directory(str(self.root), "missing")

    def test_links_cannot_escape_input_directory(self):
        outside = Path(self.temp.name) / "outside"
        outside.mkdir()
        (outside / "secret.png").write_bytes(b"private")
        try:
            (self.root / "outside-link").symlink_to(outside, target_is_directory=True)
        except OSError as error:
            self.skipTest(str(error))
        self.assertFalse(any(entry["name"] == "outside-link" for entry in files.list_input_directory(str(self.root))["entries"]))
        with self.assertRaises(ValueError):
            files.list_input_directory(str(self.root), "outside-link")

    def test_internal_alias_has_a_stable_identity_for_recursive_selection(self):
        try:
            (self.root / "refs/deep/back").symlink_to(self.root / "refs", target_is_directory=True)
        except OSError as error:
            self.skipTest(str(error))
        entries = files.list_input_directory(str(self.root), "refs/deep")["entries"]
        alias = next(entry for entry in entries if entry["name"] == "back")
        self.assertEqual(alias["key"], "refs")

    def test_route_runs_real_listing_and_returns_errors_without_loading_comfyui(self):
        tree = ast.parse((ROOT / "api.py").read_text(encoding="utf-8"))
        route = next(node for node in tree.body if isinstance(node, ast.AsyncFunctionDef) and node.name == "clab_input_files")
        route.decorator_list = []
        namespace = {"asyncio": asyncio, "list_input_directory": files.list_input_directory, "folder_paths": SimpleNamespace(get_input_directory=lambda: str(self.root)), "web": SimpleNamespace(json_response=lambda data, status=200: (status, data))}
        exec(compile(ast.Module(body=[route], type_ignores=[]), "api.py", "exec"), namespace)
        call = lambda **query: asyncio.run(namespace["clab_input_files"](SimpleNamespace(query=query)))
        self.assertEqual(call(kind="image")[0], 200)
        self.assertEqual(call(directory="../")[0], 400)
        self.assertEqual(call(directory="missing")[0], 404)


if __name__ == "__main__":
    unittest.main()
