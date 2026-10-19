// Model resources are resolved through ComfyUI's /view route, including siblings in subfolders.
export function getModelResourceURL(modelURL, resource) {
    if (/^(data:|blob:)/i.test(resource)) return resource;
    const model = new URL(modelURL, window.location.origin);
    if (model.origin !== window.location.origin) throw new Error('仅支持本地模型资源');
    const path = String(resource).replace(/\\/g, '/');
    if (/^(?:[a-z]+:|\/\/)/i.test(path)) throw new Error('不加载模型中的外部网络资源');
    if (model.pathname.endsWith('/view')) {
        const base = model.searchParams.get('subfolder') || '';
        const resolved = new URL(path, `https://model.invalid/${base.replace(/^\/+/, '')}/`);
        const parts = decodeURIComponent(resolved.pathname).slice(1).split('/');
        const filename = parts.pop();
        return `${model.pathname}?${new URLSearchParams({filename, type:model.searchParams.get('type') || 'output', subfolder:parts.join('/')})}`;
    }
    const result = new URL(path, model);
    if (result.origin !== model.origin) throw new Error('仅支持本地模型资源');
    return result.href;
}

function getFBXTexturePaths(bytes) {
    const decoder=new TextDecoder(), view=new DataView(bytes), paths=new Map();
    const remember=path=>{
        path=path.replace(/\\/g,'/');
        const basename=path.split('/').pop();
        if (!/^(?:[a-z]+:|\/)/i.test(path)) paths.set(basename,path);
    };
    if (!decoder.decode(bytes.slice(0,21)).startsWith('Kaydara FBX Binary')) {
        for (const match of decoder.decode(bytes).matchAll(/(?:RelativeFilename|FileName|Filename):\s*"([^"]+)"/g)) remember(match[1]);
        return paths;
    }
    const wide=view.getUint32(23,true)>=7500, header=wide?25:13;
    const integer=offset=>wide?Number(view.getBigUint64(offset,true)):view.getUint32(offset,true);
    const pending=[[27,bytes.byteLength]];
    while(pending.length) {
        let [cursor,limit]=pending.pop();
        while(cursor+header<=limit) {
            const end=integer(cursor), length=integer(cursor+(wide?16:8)), nameLength=view.getUint8(cursor+header-1);
            if(!end || end<=cursor || end>limit) break;
            const name=decoder.decode(bytes.slice(cursor+header,cursor+header+nameLength)), properties=cursor+header+nameLength;
            if(['RelativeFilename','FileName','Filename'].includes(name) && length>=5 && view.getUint8(properties)===83) {
                const size=view.getUint32(properties+1,true);
                if(size<=length-5) remember(decoder.decode(bytes.slice(properties+5,properties+5+size)));
            }
            if(properties+length+header<=end) pending.push([properties+length,end]);
            cursor=end;
        }
    }
    return paths;
}

export async function loadModel(THREE, url, signal, onResourceReady) {
    const response = await fetch(url, {signal});
    if (!response.ok) throw new Error(`读取文件失败（HTTP ${response.status}）`);
    const bytes = await response.arrayBuffer();
    signal.throwIfAborted();
    const resolved = new URL(url, window.location.origin);
    const name = resolved.searchParams.get('filename') || resolved.pathname;
    const extension = name.split('.').pop().toLowerCase();
    const manager = new THREE.LoadingManager();
    const managers=[manager], blobs=new Set();
    const texturePaths=extension==='fbx' ? getFBXTexturePaths(bytes) : new Map();
    let resourceErrors = false;
    manager.setURLModifier(resource => {
        if(resource.startsWith('blob:')) blobs.add(resource);
        return getModelResourceURL(url,texturePaths.get(resource) || resource);
    });
    manager.addHandler(/\.tga$/i,new THREE.TGALoader(manager));
    manager.onError = () => { resourceErrors = true; onResourceReady('部分贴图未能加载，请检查配套文件'); };
    const revokeBlobs=()=>{blobs.forEach(blob=>URL.revokeObjectURL(blob));blobs.clear();};
    manager.onLoad = () => {revokeBlobs();onResourceReady(resourceErrors ? '部分贴图未能加载，请检查配套文件' : '');};
    const release=()=>{
        managers.forEach(item=>item.abort?.()); revokeBlobs(); signal.removeEventListener('abort',release);
    };
    signal.addEventListener('abort',release,{once:true});
    const text = () => new TextDecoder().decode(bytes);
    let object, clips = [], bounds;
    try {
        if (extension === 'glb' || extension === 'gltf') {
            let json;
            if (extension === 'glb') {
                const header = new DataView(bytes);
                if (bytes.byteLength < 20 || header.getUint32(0,true) !== 0x46546c67 || header.getUint32(4,true) !== 2) throw new Error('文件不是有效的 GLB 2.0 模型');
                json = JSON.parse(new TextDecoder().decode(new Uint8Array(bytes,20,header.getUint32(12,true))));
            } else json = JSON.parse(text());
            if (json.extensionsRequired?.some(name => ['KHR_draco_mesh_compression','EXT_meshopt_compression','KHR_meshopt_compression','KHR_texture_basisu'].includes(name))) throw new Error('该模型需要额外的压缩解码器，请使用未压缩的模型文件');
            const result = await new THREE.GLTFLoader(manager).parseAsync(extension === 'glb' ? bytes : text(), '');
            object = result.scene; clips = result.animations;
        } else if (extension === 'fbx') {
            object = new THREE.FBXLoader(manager).parse(bytes, ''); clips = object.animations || [];
        } else if (extension === 'obj') {
            const loader = new THREE.OBJLoader(manager);
            const source = text();
            const libraries = [...source.matchAll(/^mtllib\s+(.+)$/gm)].map(match => match[1].trim());
            if (libraries.length) {
                const materials = {};
                for (const filename of libraries) {
                    try {
                        const materialURL = getModelResourceURL(url, filename);
                        const result = await fetch(materialURL, {signal});
                        if (!result.ok) throw new Error(`HTTP ${result.status}`);
                        const materialManager = new THREE.LoadingManager();
                        managers.push(materialManager);
                        materialManager.setURLModifier(resource => getModelResourceURL(materialURL, resource));
                        materialManager.onLoad = manager.onLoad; materialManager.onError = manager.onError;
                        const creator = new THREE.MTLLoader(materialManager).parse(await result.text(), '');
                        creator.preload(); Object.assign(materials,creator.materials);
                    } catch (error) {
                        signal.throwIfAborted(); manager.onError(filename);
                    }
                }
                loader.setMaterials({create: name => materials[name] || new THREE.MeshStandardMaterial({color:0xb7bcc5,roughness:.8})});
            }
            object = loader.parse(source);
        } else if (extension === 'stl' || extension === 'ply') {
            if (extension === 'ply' && /property\s+float\s+(?:f_dc_0|scale_0|opacity)\b/.test(new TextDecoder().decode(bytes.slice(0,16384)))) throw new Error('这是高斯泼溅 PLY，当前仅支持普通网格和点云 PLY');
            const geometry = extension === 'stl' ? new THREE.STLLoader().parse(bytes) : new THREE.PLYLoader().parse(bytes);
            const colors = !!geometry.getAttribute('color');
            if (extension === 'ply' && !geometry.index) {
                geometry.computeBoundingSphere();
                object = new THREE.Points(geometry,new THREE.PointsMaterial({color:colors ? 0xffffff : 0xb7bcc5,vertexColors:colors,size:Math.max(geometry.boundingSphere.radius*.006,.001)}));
            } else {
                if (!geometry.getAttribute('normal')) geometry.computeVertexNormals();
                object = new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color:colors ? 0xffffff : 0xb7bcc5,vertexColors:colors,roughness:.8}));
            }
        } else if (extension === 'bvh') {
            const result = new THREE.BVHLoader().parse(text());
            object = new THREE.Group(); object.add(result.skeleton.bones[0]);
            object.skeleton = result.skeleton;
            const helper = new THREE.SkeletonHelper(result.skeleton.bones[0]);
            helper.material.depthTest = false; helper.material.toneMapped = false;
            object.add(helper); clips = [result.clip];
            object.updateMatrixWorld(true);
            bounds = new THREE.Box3();
            result.skeleton.bones.forEach(bone => bounds.expandByPoint(bone.getWorldPosition(new THREE.Vector3())));
        } else throw new Error(`暂不支持 ${extension.toUpperCase()} 预览`);
        return {object, clips:clips.filter(clip=>clip.duration>0 && clip.tracks.length), bounds, release};
    } catch(error) {
        release(); throw error;
    }
}
