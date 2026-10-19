import assert from 'node:assert/strict';
import test from 'node:test';
import {getModelResourceURL} from '../web/components/modules/media_types/model_loader.js';

globalThis.window={location:{origin:'http://localhost:8188'}};
const model='/view?filename=scene.gltf&type=input&subfolder=3d/models';

test('model companion URLs preserve source type, subdirectories and encoded filenames',()=>{
    for(const [resource,filename,folder] of [
        ['geometry.bin','geometry.bin','3d/models'],
        ['textures/color%20map.png','color map.png','3d/models/textures'],
        ['../shared/color.png','color.png','3d/shared'],
        ['textures\\color.png','color.png','3d/models/textures'],
    ]) {
        const url=new URL(getModelResourceURL(model,resource),window.location.origin);
        assert.equal(url.pathname,'/view');assert.equal(url.searchParams.get('filename'),filename);
        assert.equal(url.searchParams.get('type'),'input');assert.equal(url.searchParams.get('subfolder'),folder);
    }
});

test('model resources never silently fetch external or executable URLs',()=>{
    for(const resource of ['https://example.com/image.png','//example.com/image.png','javascript:alert(1)','file:///C:/image.png']) assert.throws(()=>getModelResourceURL(model,resource));
    for(const resource of ['blob:http://localhost:8188/example','data:image/png;base64,AA==']) assert.equal(getModelResourceURL(model,resource),resource);
});
