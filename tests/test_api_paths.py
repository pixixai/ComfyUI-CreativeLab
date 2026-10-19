import ast
import asyncio
import json
import os
from pathlib import Path
import shutil
import struct
import tempfile
from types import SimpleNamespace
import unittest


def load_endpoints(folder_paths):
    # Load the actual route functions without importing ComfyUI, Torch or starting a server.
    tree = ast.parse((Path(__file__).resolve().parents[1] / "api.py").read_text(encoding="utf-8"))
    functions = [node for node in tree.body if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef))]
    for node in functions:
        node.decorator_list = []
    namespace = {
        "os": os,
        "shutil": shutil,
        "json": json,
        "folder_paths": folder_paths,
        "web": SimpleNamespace(json_response=lambda data: data),
        "print": lambda *args, **kwargs: None,
    }
    exec(compile(ast.Module(body=functions, type_ignores=[]), "api.py", "exec"), namespace)
    return namespace


class Request:
    def __init__(self, data):
        self.data = data

    async def json(self):
        return self.data


class AssetPathTests(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory(prefix="clab-path-tests-")
        self.root = Path(self.temp_dir.name).resolve()
        self.addCleanup(self.temp_dir.cleanup)
        self.output = self.root / "output"
        self.input = self.root / "input"
        self.temp = self.root / "temp"
        for directory in (self.output, self.input, self.temp):
            directory.mkdir()
        self.source = self.temp / "source.png"
        self.source.write_bytes(b"source image")
        folders = SimpleNamespace(
            get_output_directory=lambda: str(self.output),
            get_input_directory=lambda: str(self.input),
            get_temp_directory=lambda: str(self.temp),
        )
        self.api = load_endpoints(folders)

    def call(self, name, data):
        return asyncio.run(self.api[name](Request(data)))

    def organize(self, **changes):
        item = {
            "id": "area", "filename": "source.png", "type": "temp",
            "target_subfolder": "CLab/project", "target_filename": "result",
        }
        item.update(changes)
        return self.call("clab_organize_files", {"action": "copy", "files": [item]})

    def archive(self, **changes):
        data = {"filename": "source.png", "source_type": "temp", "asset_type": "image"}
        data.update(changes)
        return self.call("clab_copy_temp_asset", data)

    def test_organize_copy_preserves_source_and_avoids_collisions(self):
        self.assertEqual(self.organize()["status"], "success")
        result = self.organize()
        self.assertEqual(result["status"], "success")
        self.assertEqual(result["results"][0]["new_filename"], "result_1.png")
        self.assertEqual((self.output / "CLab/project/result.png").read_bytes(), b"source image")
        self.assertEqual((self.output / "CLab/project/result_1.png").read_bytes(), b"source image")
        self.assertTrue(self.source.exists())

    def test_gltf_archive_keeps_external_buffers_and_textures_in_an_isolated_package(self):
        (self.temp / 'models').mkdir()
        (self.temp / 'textures').mkdir()
        (self.temp / 'models/mesh.bin').write_bytes(b'geometry')
        (self.temp / 'textures/color.png').write_bytes(b'pixels')
        model = self.temp / 'models/scene.gltf'
        model.write_text(json.dumps({'buffers':[{'uri':'mesh.bin'}], 'images':[{'uri':'../textures/color.png'}]}))
        result = self.archive(filename='scene.gltf',subfolder='models',asset_type='file',delete_temp=True)
        self.assertEqual(result['status'],'success')
        archived = self.output / result['new_subfolder'] / result['new_filename']
        self.assertEqual(json.loads(archived.read_text())['buffers'][0]['uri'],'mesh.bin')
        self.assertEqual((archived.parent / 'mesh.bin').read_bytes(),b'geometry')
        self.assertEqual((archived.parent.parent / 'textures/color.png').read_bytes(),b'pixels')
        self.assertFalse(model.exists())
        self.assertTrue((self.temp / 'models/mesh.bin').exists())

    def test_obj_archive_follows_mtl_and_its_relative_texture(self):
        for name in ('models','models/materials','models/textures'):
            (self.input / name).mkdir(exist_ok=True)
        (self.input / 'models/model.obj').write_text('mtllib materials/surface.mtl\nv 0 0 0\n')
        (self.input / 'models/materials/surface.mtl').write_text('newmtl surface\nmap_Kd -s 1 1 1 -o 0 0 0 -clamp on ../textures/color.png\n')
        (self.input / 'models/textures/color.png').write_bytes(b'pixels')
        result = self.archive(filename='model.obj',subfolder='models',asset_type='file',source_type='input')
        self.assertEqual(result['status'],'success')
        folder = self.output / result['new_subfolder']
        self.assertTrue((folder / 'materials/surface.mtl').is_file())
        self.assertEqual((folder / 'textures/color.png').read_bytes(),b'pixels')

    def test_model_resources_cannot_escape_the_source_directory(self):
        outside = self.root / 'secret.bin'
        outside.write_bytes(b'private')
        (self.temp / 'scene.gltf').write_text(json.dumps({'buffers':[{'uri':'../secret.bin'}]}))
        result = self.archive(filename='scene.gltf',asset_type='file')
        self.assertEqual(result['status'],'error')
        self.assertEqual(outside.read_bytes(),b'private')
        self.assertFalse(list(self.output.rglob('secret.bin')))

    def test_binary_fbx_archive_preserves_declared_external_textures(self):
        (self.input / '3d/textures').mkdir(parents=True)
        (self.input / '3d/textures/color.png').write_bytes(b'pixels')
        header = b'Kaydara FBX Binary  \x00\x1a\x00' + struct.pack('<I', 7400)
        name = b'RelativeFilename'
        reference = b'textures\\color.png'
        prop = b'S' + struct.pack('<I', len(reference)) + reference
        end = len(header) + 13 + len(name) + len(prop) + 13
        node = struct.pack('<IIIB', end, 1, len(prop), len(name)) + name + prop + bytes(13)
        (self.input / '3d/model.fbx').write_bytes(header + node)
        result = self.archive(filename='model.fbx',subfolder='3d',source_type='input',asset_type='file')
        self.assertEqual(result['status'],'success')
        folder = self.output / result['new_subfolder']
        self.assertEqual((folder / 'textures/color.png').read_bytes(),b'pixels')

    def test_organize_move_stays_in_output(self):
        result = self.call("clab_organize_files", {"action": "move", "files": [{
            "filename": "source.png", "type": "temp", "target_subfolder": "CLab", "target_filename": "moved",
        }]})
        self.assertEqual(result["status"], "success")
        self.assertFalse(self.source.exists())
        self.assertEqual((self.output / "CLab/moved.png").read_bytes(), b"source image")

    def test_target_filename_cannot_contain_paths_or_windows_streams(self):
        for name in ("../../escaped", "..\\..\\escaped", "/escaped", "C:\\escaped", "C:escaped", "name:stream", ".", ".."):
            with self.subTest(name=name):
                self.assertEqual(self.organize(target_filename=name)["status"], "error")
        self.assertEqual(list(self.output.iterdir()), [])
        self.assertTrue(self.source.exists())

    def test_target_folder_cannot_escape_or_use_a_sibling_prefix(self):
        for folder in ("../../escaped", "../output-sibling", str(self.root / "escaped")):
            with self.subTest(folder=folder):
                self.assertEqual(self.organize(target_subfolder=folder)["status"], "error")
        self.assertFalse((self.root / "escaped").exists())

    def test_source_path_cannot_escape(self):
        (self.root / "secret.png").write_bytes(b"outside")
        self.assertEqual(self.organize(filename="../secret.png")["status"], "error")
        self.assertEqual(self.archive(filename="../secret.png")["status"], "error")
        self.assertEqual(list(self.output.iterdir()), [])

    def test_archive_asset_type_is_an_allowlist(self):
        for kind in ("../../escaped", "..\\..\\escaped", "/escaped", "C:\\escaped", "unknown"):
            with self.subTest(kind=kind):
                self.assertEqual(self.archive(asset_type=kind)["status"], "error")
        self.assertEqual(list(self.output.iterdir()), [])

    def test_archive_directory_dot_dot_is_rejected(self):
        for kind in ("image", "video", "audio", "file"):
            with self.subTest(kind=kind):
                self.assertEqual(self.archive(archive_dir="..", asset_type=kind)["status"], "error")
        self.assertEqual(list(self.output.iterdir()), [])

    def test_archive_keeps_supported_layout_prefix_and_collision_handling(self):
        for kind in ("image", "video", "audio", "file"):
            with self.subTest(kind=kind):
                result = self.archive(asset_type=kind, archive_dir="My Lab", file_prefix="test")
                folder = "My Lab" if kind == "image" else f"My Lab/{kind}"
                self.assertEqual(result["status"], "success")
                self.assertEqual(result["new_subfolder"], folder)
                self.assertEqual((self.output / folder / "test_01.png").read_bytes(), b"source image")
        result = self.archive(archive_dir="My Lab", file_prefix="test")
        self.assertEqual(result["new_filename"], "test_02.png")

    def test_delete_temp_moves_only_the_requested_source(self):
        result = self.archive(delete_temp=True)
        self.assertEqual(result["status"], "success")
        self.assertFalse(self.source.exists())
        self.assertEqual((self.output / "CLab/pix_01.png").read_bytes(), b"source image")

    def test_input_glb_is_archived_without_removing_the_input_file(self):
        (self.input / "3d").mkdir()
        model = self.input / "3d/model.glb"
        model.write_bytes(b"glTF fixture")
        result = self.archive(filename="model.glb", subfolder="3d", source_type="input", asset_type="file", delete_temp=True)
        self.assertEqual(result["status"], "success")
        self.assertEqual((self.output / "CLab/file/pix_01.glb").read_bytes(), model.read_bytes())
        self.assertTrue(model.exists())

    def test_unknown_archive_source_type_is_rejected(self):
        self.assertEqual(self.archive(source_type="../input")["status"], "error")

    def test_symlink_target_cannot_bypass_containment(self):
        outside = self.root / "outside"
        outside.mkdir()
        link = self.output / "linked"
        try:
            link.symlink_to(outside, target_is_directory=True)
        except OSError as error:
            self.skipTest(f"Symlink creation unavailable: {error}")
        self.assertEqual(self.organize(target_subfolder="linked")["status"], "error")
        self.assertEqual(self.archive(archive_dir="linked")["status"], "error")
        self.assertEqual(list(outside.iterdir()), [])


if __name__ == "__main__":
    unittest.main()
