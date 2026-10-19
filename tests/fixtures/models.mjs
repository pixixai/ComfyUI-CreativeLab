import { crc32, deflateSync } from 'node:zlib';

// Small self-contained model fixtures; no downloaded assets or renderer mocks.
export function createModelFixtures(baseJSON, geometry) {
    const files = new Map();
    const makeGLB = (json, binary) => {
        const text = Buffer.from(JSON.stringify(json)), length = Math.ceil(text.length/4)*4;
        const data = Buffer.alloc(28+length+binary.length,0x20);
        data.writeUInt32LE(0x46546c67,0); data.writeUInt32LE(2,4); data.writeUInt32LE(data.length,8);
        data.writeUInt32LE(length,12); data.writeUInt32LE(0x4e4f534a,16); text.copy(data,20);
        data.writeUInt32LE(binary.length,20+length); data.writeUInt32LE(0x004e4942,24+length); binary.copy(data,28+length);
        return data;
    };
    const animation = structuredClone(baseJSON), binary = Buffer.alloc(216);
    geometry.copy(binary);
    [0,1,2, 0,0,0, .8,0,0, 0,0,0].forEach((value,index)=>binary.writeFloatLE(value,168+index*4));
    animation.buffers[0].byteLength=216;
    animation.bufferViews.push({buffer:0,byteOffset:168,byteLength:12},{buffer:0,byteOffset:180,byteLength:36});
    animation.accessors.push({bufferView:2,componentType:5126,count:3,type:'SCALAR',min:[0],max:[2]},{bufferView:3,componentType:5126,count:3,type:'VEC3'});
    const clip = name=>({name,samplers:[{input:2,output:3,interpolation:'LINEAR'}],channels:[{sampler:0,target:{node:0,path:'translation'}}]});
    animation.animations=[clip('移动'),clip('第二片段')];
    files.set('animated.glb',makeGLB(animation,binary));
    const gltf=structuredClone(animation);
    gltf.buffers[0].uri='geometry.bin';
    gltf.images=[{uri:'textures/pixel.png'}]; gltf.textures=[{source:0}];
    gltf.materials[0].pbrMetallicRoughness.baseColorTexture={index:0};
    files.set('scene.gltf',Buffer.from(JSON.stringify(gltf))); files.set('geometry.bin',binary);
    const chunk = (type,data) => {
        const body=Buffer.concat([Buffer.from(type),data]), result=Buffer.alloc(data.length+12);
        result.writeUInt32BE(data.length,0);body.copy(result,4);result.writeUInt32BE(crc32(body),result.length-4);return result;
    };
    const pngHeader=Buffer.alloc(13);pngHeader.writeUInt32BE(1,0);pngHeader.writeUInt32BE(1,4);pngHeader[8]=8;pngHeader[9]=6;
    files.set('pixel.png',Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',pngHeader),chunk('IDAT',deflateSync(Buffer.from([0,255,255,255,255]))),chunk('IEND',Buffer.alloc(0))]));
    files.set('mesh.obj',Buffer.from('mtllib materials/sample.mtl\nv -1 -1 0\nv 1 -1 0\nv 0 1 0\nvt 0 0\nvt 1 0\nvt .5 1\nusemtl surface\nf 1/1 2/2 3/3\n'));
    files.set('sample.mtl',Buffer.from('newmtl surface\nKd .7 .4 .2\nmap_Kd textures/pixel.png\n'));
    files.set('mesh.stl',Buffer.from('solid triangle\nfacet normal 0 0 1\nouter loop\nvertex -1 -1 0\nvertex 1 -1 0\nvertex 0 1 0\nendloop\nendfacet\nendsolid triangle\n'));
    const ply='ply\nformat ascii 1.0\nelement vertex 3\nproperty float x\nproperty float y\nproperty float z\n';
    files.set('mesh.ply',Buffer.from(ply+'element face 1\nproperty list uchar int vertex_indices\nend_header\n-1 -1 0\n1 -1 0\n0 1 0\n3 0 1 2\n'));
    files.set('cloud.ply',Buffer.from(ply+'end_header\n-1 -1 0\n1 -1 0\n0 1 0\n'));
    files.set('splat.ply',Buffer.from(ply+'property float f_dc_0\nend_header\n0 0 0 1\n'));
    files.set('motion.bvh',Buffer.from(`HIERARCHY
ROOT Hips
{
 OFFSET 0 0 0
 CHANNELS 6 Xposition Yposition Zposition Zrotation Xrotation Yrotation
 JOINT Chest
 {
  OFFSET 0 40 0
  CHANNELS 3 Zrotation Xrotation Yrotation
  End Site
  {
   OFFSET 0 30 0
  }
 }
}
MOTION
Frames: 3
Frame Time: 1
0 0 0 0 0 0 0 0 0
10 0 0 20 0 0 40 0 0
0 0 0 0 0 0 0 0 0
`));
    files.set('animated.fbx',Buffer.from(`; FBX 7.4.0 project file
FBXHeaderExtension:  {
\tFBXVersion: 7400
}
Objects:  {
\tGeometry: 1, "Geometry::Triangle", "Mesh" {
\t\tVertices: *9 {
\t\t\ta: -1,-1,0,1,-1,0,0,1,0
\t\t}
\t\tPolygonVertexIndex: *3 {
\t\t\ta: 0,1,-3
\t\t}
\t}
\tModel: 2, "Model::Triangle", "Mesh" {
\t\tVersion: 232
\t\tProperties70:  {
\t\t\tP: "Lcl Translation", "Lcl Translation", "", "A",0,0,0
\t\t\tP: "Lcl Rotation", "Lcl Rotation", "", "A",0,0,0
\t\t\tP: "Lcl Scaling", "Lcl Scaling", "", "A",1,1,1
\t\t}
\t}
\tAnimationCurveNode: 3, "AnimCurveNode::T", "" {
\t}
\tAnimationCurve: 4, "AnimCurve::X", "" {
\t\tKeyTime: *3 {
\t\t\ta: 0,46186158000,92372316000
\t\t}
\t\tKeyValueFloat: *3 {
\t\t\ta: 0,0.8,0
\t\t}
\t}
\tAnimationLayer: 5, "AnimLayer::BaseLayer", "" {
\t}
\tAnimationStack: 6, "AnimStack::Walk", "" {
\t}
\tVideo: 7, "Video::Color", "Clip" {
\t\tRelativeFilename: "textures\\pixel.png"
\t}
\tTexture: 8, "Texture::Color", "" {
\t\tFileName: "textures\\pixel.png"
\t}
\tMaterial: 9, "Material::Surface", "" {
\t\tShadingModel: "phong"
\t\tProperties70:  {
\t\t\tP: "DiffuseColor", "Color", "", "A",1,1,1
\t\t}
\t}
}
Connections:  {
\tC: "OO",1,2
\tC: "OP",3,2,"Lcl Translation"
\tC: "OP",4,3,"d|X"
\tC: "OO",3,5
\tC: "OO",5,6
\tC: "OO",7,8
\tC: "OP",8,9,"DiffuseColor"
\tC: "OO",9,2
}
`));
    return files;
}
