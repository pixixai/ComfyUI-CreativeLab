Three.js 0.180.0 (MIT), bundled locally for the GLB viewer. See `three-LICENSE.txt`.

`three-entry.js` lists the bundled exports. Build with esbuild 0.25.10 and Three.js
0.180.0 installed in a temporary directory, with that directory's `node_modules`
on `NODE_PATH`:

```text
esbuild web/vendor/three-entry.js --bundle --minify --format=esm --legal-comments=eof --outfile=web/vendor/three-glb.js
```

The viewer loads this local bundle only when opened. It does not use a CDN or
external decoder service. The initial scope is GLB 2.0 with embedded resources;
Draco and other optional compression decoders are not included.
