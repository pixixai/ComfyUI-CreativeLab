Three.js 0.180.0 (MIT), bundled locally for the model/animation viewer. See `three-LICENSE.txt`.

`three-entry.js` lists the bundled exports. Build with esbuild 0.25.10 and Three.js
0.180.0 installed in a temporary directory, with that directory's `node_modules`
on `NODE_PATH`:

```text
esbuild web/vendor/three-entry.js --bundle --minify --format=esm --legal-comments=eof --outfile=web/vendor/three-glb.js
```

The viewer loads this local bundle only when opened. It does not use a CDN or
external decoder service. Included loaders: GLTF, FBX, OBJ/MTL, STL, PLY, BVH and
TGA textures. AnimationMixer provides playback for glTF/FBX clips and BVH bones.
FBX decompression includes fflate 0.8.2 (MIT); see `fflate-LICENSE.txt`.
Draco, Meshopt, KTX2 and Gaussian splat renderers are not included.

`zip-entry.js` bundles the same fflate 0.8.2 implementation shipped with Three.js
into `zip.js` for offline result-table exports (MIT; `fflate-LICENSE.txt`). Build
with the command above, replacing the entry and output names with `zip-entry.js`
and `zip.js`. The ZIP bundle is loaded only when an export needs it.
