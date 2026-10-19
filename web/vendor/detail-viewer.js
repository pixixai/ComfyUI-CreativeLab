(()=>{var Fd=Object.defineProperty;var kd=(e,t)=>()=>(e&&(t=e(e=0)),t);var Bd=(e,t)=>{for(var i in t)Fd(e,i,{get:t[i],enumerable:!0})};var od={};Bd(od,{ACESFilmicToneMapping:()=>Xh,AnimationMixer:()=>zm,BVHLoader:()=>fb,Box3:()=>Ci,Color:()=>_e,DirectionalLight:()=>Bl,FBXLoader:()=>jy,GLTFLoader:()=>Tx,Group:()=>mi,HemisphereLight:()=>bm,LoadingManager:()=>ku,LoopOnce:()=>iu,MOUSE:()=>Tr,MTLLoader:()=>cb,Mesh:()=>pt,MeshStandardMaterial:()=>gn,OBJLoader:()=>lb,OrbitControls:()=>ly,PLYLoader:()=>db,PMREMGenerator:()=>vl,PerspectiveCamera:()=>Dt,Points:()=>Bn,PointsMaterial:()=>Er,RoomEnvironment:()=>by,SRGBColorSpace:()=>je,STLLoader:()=>ub,Scene:()=>yu,SkeletonHelper:()=>Hm,TGALoader:()=>mb,Vector3:()=>P,WebGLRenderer:()=>Ex});function gi(){let e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,i=Math.random()*4294967295|0,r=Math.random()*4294967295|0;return(Lt[e&255]+Lt[e>>8&255]+Lt[e>>16&255]+Lt[e>>24&255]+"-"+Lt[t&255]+Lt[t>>8&255]+"-"+Lt[t>>16&15|64]+Lt[t>>24&255]+"-"+Lt[i&63|128]+Lt[i>>8&255]+"-"+Lt[i>>16&255]+Lt[i>>24&255]+Lt[r&255]+Lt[r>>8&255]+Lt[r>>16&255]+Lt[r>>24&255]).toLowerCase()}function ze(e,t,i){return Math.max(t,Math.min(i,e))}function Il(e,t){return(e%t+t)%t}function jp(e,t,i,r,n){return r+(e-t)*(n-r)/(i-t)}function Xp(e,t,i){return e!==t?(i-e)/(t-e):0}function kn(e,t,i){return(1-i)*e+i*t}function qp(e,t,i,r){return kn(e,t,1-Math.exp(-i*r))}function Yp(e,t=1){return t-Math.abs(Il(e,t*2)-t)}function $p(e,t,i){return e<=t?0:e>=i?1:(e=(e-t)/(i-t),e*e*(3-2*e))}function Kp(e,t,i){return e<=t?0:e>=i?1:(e=(e-t)/(i-t),e*e*e*(e*(e*6-15)+10))}function Zp(e,t){return e+Math.floor(Math.random()*(t-e+1))}function Jp(e,t){return e+Math.random()*(t-e)}function Qp(e){return e*(.5-Math.random())}function ef(e){e!==void 0&&(wc=e);let t=wc+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}function tf(e){return e*Fn}function rf(e){return e*pn}function nf(e){return(e&e-1)===0&&e!==0}function af(e){return Math.pow(2,Math.ceil(Math.log(e)/Math.LN2))}function sf(e){return Math.pow(2,Math.floor(Math.log(e)/Math.LN2))}function of(e,t,i,r,n){let a=Math.cos,s=Math.sin,o=a(i/2),l=s(i/2),c=a((t+r)/2),h=s((t+r)/2),u=a((t-r)/2),d=s((t-r)/2),p=a((r-t)/2),v=s((r-t)/2);switch(n){case"XYX":e.set(o*h,l*u,l*d,o*c);break;case"YZY":e.set(l*d,o*h,l*u,o*c);break;case"ZXZ":e.set(l*u,l*d,o*h,o*c);break;case"XZX":e.set(o*h,l*v,l*p,o*c);break;case"YXY":e.set(l*p,o*h,l*v,o*c);break;case"ZYZ":e.set(l*v,l*p,o*h,o*c);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+n)}}function di(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return e/4294967295;case Uint16Array:return e/65535;case Uint8Array:return e/255;case Int32Array:return Math.max(e/2147483647,-1);case Int16Array:return Math.max(e/32767,-1);case Int8Array:return Math.max(e/127,-1);default:throw new Error("Invalid component type.")}}function et(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return Math.round(e*4294967295);case Uint16Array:return Math.round(e*65535);case Uint8Array:return Math.round(e*255);case Int32Array:return Math.round(e*2147483647);case Int16Array:return Math.round(e*32767);case Int8Array:return Math.round(e*127);default:throw new Error("Invalid component type.")}}function lu(e){for(let t=e.length-1;t>=0;--t)if(e[t]>=65535)return!0;return!1}function qn(e){return document.createElementNS("http://www.w3.org/1999/xhtml",e)}function lf(){let e=qn("canvas");return e.style.display="block",e}function Yn(e){e in Sc||(Sc[e]=!0,console.warn(e))}function cf(e,t,i){return new Promise(function(r,n){function a(){switch(e.clientWaitSync(t,e.SYNC_FLUSH_COMMANDS_BIT,0)){case e.WAIT_FAILED:n();break;case e.TIMEOUT_EXPIRED:setTimeout(a,i);break;default:r()}}setTimeout(a,i)})}function hf(){let e={enabled:!0,workingColorSpace:zt,spaces:{},convert:function(n,a,s){return this.enabled===!1||a===s||!a||!s||(this.spaces[a].transfer===nt&&(n.r=Gi(n.r),n.g=Gi(n.g),n.b=Gi(n.b)),this.spaces[a].primaries!==this.spaces[s].primaries&&(n.applyMatrix3(this.spaces[a].toXYZ),n.applyMatrix3(this.spaces[s].fromXYZ)),this.spaces[s].transfer===nt&&(n.r=ln(n.r),n.g=ln(n.g),n.b=ln(n.b))),n},workingToColorSpace:function(n,a){return this.convert(n,this.workingColorSpace,a)},colorSpaceToWorking:function(n,a){return this.convert(n,a,this.workingColorSpace)},getPrimaries:function(n){return this.spaces[n].primaries},getTransfer:function(n){return n===nr?ns:this.spaces[n].transfer},getToneMappingMode:function(n){return this.spaces[n].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(n,a=this.workingColorSpace){return n.fromArray(this.spaces[a].luminanceCoefficients)},define:function(n){Object.assign(this.spaces,n)},_getMatrix:function(n,a,s){return n.copy(this.spaces[a].toXYZ).multiply(this.spaces[s].fromXYZ)},_getDrawingBufferColorSpace:function(n){return this.spaces[n].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(n=this.workingColorSpace){return this.spaces[n].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(n,a){return Yn("THREE.ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),e.workingToColorSpace(n,a)},toWorkingColorSpace:function(n,a){return Yn("THREE.ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),e.colorSpaceToWorking(n,a)}},t=[.64,.33,.3,.6,.15,.06],i=[.2126,.7152,.0722],r=[.3127,.329];return e.define({[zt]:{primaries:t,whitePoint:r,transfer:ns,toXYZ:Ec,fromXYZ:Tc,luminanceCoefficients:i,workingColorSpaceConfig:{unpackColorSpace:je},outputColorSpaceConfig:{drawingBufferColorSpace:je}},[je]:{primaries:t,whitePoint:r,transfer:nt,toXYZ:Ec,fromXYZ:Tc,luminanceCoefficients:i,outputColorSpaceConfig:{drawingBufferColorSpace:je}}}),e}function Gi(e){return e<.04045?e*.0773993808:Math.pow(e*.9478672986+.0521327014,2.4)}function ln(e){return e<.0031308?e*12.92:1.055*Math.pow(e,.41666)-.055}function Fs(e){return typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap?uf.getDataURL(e):e.data?{data:Array.from(e.data),width:e.width,height:e.height,type:e.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}function Bs(e,t,i,r,n){for(let a=0,s=e.length-3;a<=s;a+=3){mr.fromArray(e,a);let o=n.x*Math.abs(mr.x)+n.y*Math.abs(mr.y)+n.z*Math.abs(mr.z),l=t.dot(mr),c=i.dot(mr),h=r.dot(mr);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>o)return!1}return!0}function Js(e,t,i){return i<0&&(i+=1),i>1&&(i-=1),i<1/6?e+(t-e)*6*i:i<1/2?t:i<2/3?e+(t-e)*6*(2/3-i):e}function Tf(e,t,i,r,n,a,s,o){let l;if(t.side===kt?l=r.intersectTriangle(s,a,n,!0,o):l=r.intersectTriangle(n,a,s,t.side===Ai,o),l===null)return null;Ra.copy(o),Ra.applyMatrix4(e.matrixWorld);let c=i.ray.origin.distanceTo(Ra);return c<i.near||c>i.far?null:{distance:c,point:Ra.clone(),object:e}}function Ca(e,t,i,r,n,a,s,o,l,c){e.getVertexPosition(o,Sa),e.getVertexPosition(l,Ea),e.getVertexPosition(c,Ta);let h=Tf(e,t,i,r,Sa,Ea,Ta,Fc);if(h){let u=new P;An.getBarycoord(Fc,Sa,Ea,Ta,u),n&&(h.uv=An.getInterpolatedAttribute(n,o,l,c,u,new De)),a&&(h.uv1=An.getInterpolatedAttribute(a,o,l,c,u,new De)),s&&(h.normal=An.getInterpolatedAttribute(s,o,l,c,u,new P),h.normal.dot(r.direction)>0&&h.normal.multiplyScalar(-1));let d={a:o,b:l,c,normal:new P,materialIndex:0};An.getNormal(Sa,Ea,Ta,d.normal),h.face=d,h.barycoord=u}return h}function fn(e){let t={};for(let i in e){t[i]={};for(let r in e[i]){let n=e[i][r];n&&(n.isColor||n.isMatrix3||n.isMatrix4||n.isVector2||n.isVector3||n.isVector4||n.isTexture||n.isQuaternion)?n.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[i][r]=null):t[i][r]=n.clone():Array.isArray(n)?t[i][r]=n.slice():t[i][r]=n}}return t}function Ot(e){let t={};for(let i=0;i<e.length;i++){let r=fn(e[i]);for(let n in r)t[n]=r[n]}return t}function Af(e){let t=[];for(let i=0;i<e.length;i++)t.push(e[i].clone());return t}function vu(e){let t=e.getRenderTarget();return t===null?e.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:ke.workingColorSpace}function Na(e,t,i,r,n,a,s){let o=e.geometry.attributes.position;if(ss.fromBufferAttribute(o,n),os.fromBufferAttribute(o,a),i.distanceSqToSegment(ss,os,ao,$c)>r)return;ao.applyMatrix4(e.matrixWorld);let l=t.ray.origin.distanceTo(ao);if(!(l<t.near||l>t.far))return{distance:l,point:$c.clone().applyMatrix4(e.matrixWorld),index:s,face:null,faceIndex:null,barycoord:null,object:e}}function Qc(e,t,i,r,n,a,s){let o=fl.distanceSqToPoint(e);if(o<i){let l=new P;fl.closestPointToPoint(e,l),l.applyMatrix4(r);let c=n.ray.origin.distanceTo(l);if(c<n.near||c>n.far)return;a.push({distance:c,distanceToRay:Math.sqrt(o),point:l,index:t,face:null,faceIndex:null,barycoord:null,object:s})}}function Gf(e,t,i=2){let r=t&&t.length,n=r?t[0]*i:e.length,a=Au(e,0,n,i,!0),s=[];if(!a||a.next===a.prev)return s;let o,l,c;if(r&&(a=$f(e,t,a,i)),e.length>80*i){o=1/0,l=1/0;let h=-1/0,u=-1/0;for(let d=i;d<n;d+=i){let p=e[d],v=e[d+1];p<o&&(o=p),v<l&&(l=v),p>h&&(h=p),v>u&&(u=v)}c=Math.max(h-o,u-l),c=c!==0?32767/c:0}return Kn(a,s,i,o,l,c,0),s}function Au(e,t,i,r,n){let a;if(n===sm(e,t,i,r)>0)for(let s=t;s<i;s+=r)a=eh(s/r|0,e[s],e[s+1],a);else for(let s=i-r;s>=t;s-=r)a=eh(s/r|0,e[s],e[s+1],a);return a&&mn(a,a.next)&&(Jn(a),a=a.next),a}function Lr(e,t){if(!e)return e;t||(t=e);let i=e,r;do if(r=!1,!i.steiner&&(mn(i,i.next)||vt(i.prev,i,i.next)===0)){if(Jn(i),i=t=i.prev,i===i.next)break;r=!0}else i=i.next;while(r||i!==t);return t}function Kn(e,t,i,r,n,a,s){if(!e)return;!s&&a&&em(e,r,n,a);let o=e;for(;e.prev!==e.next;){let l=e.prev,c=e.next;if(a?Xf(e,r,n,a):jf(e)){t.push(l.i,e.i,c.i),Jn(e),e=c.next,o=c.next;continue}if(e=c,e===o){s?s===1?(e=qf(Lr(e),t),Kn(e,t,i,r,n,a,2)):s===2&&Yf(e,t,i,r,n,a):Kn(Lr(e),t,i,r,n,a,1);break}}}function jf(e){let t=e.prev,i=e,r=e.next;if(vt(t,i,r)>=0)return!1;let n=t.x,a=i.x,s=r.x,o=t.y,l=i.y,c=r.y,h=Math.min(n,a,s),u=Math.min(o,l,c),d=Math.max(n,a,s),p=Math.max(o,l,c),v=r.next;for(;v!==t;){if(v.x>=h&&v.x<=d&&v.y>=u&&v.y<=p&&Un(n,o,a,l,s,c,v.x,v.y)&&vt(v.prev,v,v.next)>=0)return!1;v=v.next}return!0}function Xf(e,t,i,r){let n=e.prev,a=e,s=e.next;if(vt(n,a,s)>=0)return!1;let o=n.x,l=a.x,c=s.x,h=n.y,u=a.y,d=s.y,p=Math.min(o,l,c),v=Math.min(h,u,d),f=Math.max(o,l,c),g=Math.max(h,u,d),m=ml(p,v,t,i,r),y=ml(f,g,t,i,r),x=e.prevZ,_=e.nextZ;for(;x&&x.z>=m&&_&&_.z<=y;){if(x.x>=p&&x.x<=f&&x.y>=v&&x.y<=g&&x!==n&&x!==s&&Un(o,h,l,u,c,d,x.x,x.y)&&vt(x.prev,x,x.next)>=0||(x=x.prevZ,_.x>=p&&_.x<=f&&_.y>=v&&_.y<=g&&_!==n&&_!==s&&Un(o,h,l,u,c,d,_.x,_.y)&&vt(_.prev,_,_.next)>=0))return!1;_=_.nextZ}for(;x&&x.z>=m;){if(x.x>=p&&x.x<=f&&x.y>=v&&x.y<=g&&x!==n&&x!==s&&Un(o,h,l,u,c,d,x.x,x.y)&&vt(x.prev,x,x.next)>=0)return!1;x=x.prevZ}for(;_&&_.z<=y;){if(_.x>=p&&_.x<=f&&_.y>=v&&_.y<=g&&_!==n&&_!==s&&Un(o,h,l,u,c,d,_.x,_.y)&&vt(_.prev,_,_.next)>=0)return!1;_=_.nextZ}return!0}function qf(e,t){let i=e;do{let r=i.prev,n=i.next.next;!mn(r,n)&&Cu(r,i,i.next,n)&&Zn(r,n)&&Zn(n,r)&&(t.push(r.i,i.i,n.i),Jn(i),Jn(i.next),i=e=n),i=i.next}while(i!==e);return Lr(i)}function Yf(e,t,i,r,n,a){let s=e;do{let o=s.next.next;for(;o!==s.prev;){if(s.i!==o.i&&rm(s,o)){let l=Iu(s,o);s=Lr(s,s.next),l=Lr(l,l.next),Kn(s,t,i,r,n,a,0),Kn(l,t,i,r,n,a,0);return}o=o.next}s=s.next}while(s!==e)}function $f(e,t,i,r){let n=[];for(let a=0,s=t.length;a<s;a++){let o=t[a]*r,l=a<s-1?t[a+1]*r:e.length,c=Au(e,o,l,r,!1);c===c.next&&(c.steiner=!0),n.push(im(c))}n.sort(Kf);for(let a=0;a<n.length;a++)i=Zf(n[a],i);return i}function Kf(e,t){let i=e.x-t.x;if(i===0&&(i=e.y-t.y,i===0)){let r=(e.next.y-e.y)/(e.next.x-e.x),n=(t.next.y-t.y)/(t.next.x-t.x);i=r-n}return i}function Zf(e,t){let i=Jf(e,t);if(!i)return t;let r=Iu(i,e);return Lr(r,r.next),Lr(i,i.next)}function Jf(e,t){let i=t,r=e.x,n=e.y,a=-1/0,s;if(mn(e,i))return i;do{if(mn(e,i.next))return i.next;if(n<=i.y&&n>=i.next.y&&i.next.y!==i.y){let u=i.x+(n-i.y)*(i.next.x-i.x)/(i.next.y-i.y);if(u<=r&&u>a&&(a=u,s=i.x<i.next.x?i:i.next,u===r))return s}i=i.next}while(i!==t);if(!s)return null;let o=s,l=s.x,c=s.y,h=1/0;i=s;do{if(r>=i.x&&i.x>=l&&r!==i.x&&Ru(n<c?r:a,n,l,c,n<c?a:r,n,i.x,i.y)){let u=Math.abs(n-i.y)/(r-i.x);Zn(i,e)&&(u<h||u===h&&(i.x>s.x||i.x===s.x&&Qf(s,i)))&&(s=i,h=u)}i=i.next}while(i!==o);return s}function Qf(e,t){return vt(e.prev,e,t.prev)<0&&vt(t.next,e,e.next)<0}function em(e,t,i,r){let n=e;do n.z===0&&(n.z=ml(n.x,n.y,t,i,r)),n.prevZ=n.prev,n.nextZ=n.next,n=n.next;while(n!==e);n.prevZ.nextZ=null,n.prevZ=null,tm(n)}function tm(e){let t,i=1;do{let r=e,n;e=null;let a=null;for(t=0;r;){t++;let s=r,o=0;for(let c=0;c<i&&(o++,s=s.nextZ,!!s);c++);let l=i;for(;o>0||l>0&&s;)o!==0&&(l===0||!s||r.z<=s.z)?(n=r,r=r.nextZ,o--):(n=s,s=s.nextZ,l--),a?a.nextZ=n:e=n,n.prevZ=a,a=n;r=s}a.nextZ=null,i*=2}while(t>1);return e}function ml(e,t,i,r,n){return e=(e-i)*n|0,t=(t-r)*n|0,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,t=(t|t<<8)&16711935,t=(t|t<<4)&252645135,t=(t|t<<2)&858993459,t=(t|t<<1)&1431655765,e|t<<1}function im(e){let t=e,i=e;do(t.x<i.x||t.x===i.x&&t.y<i.y)&&(i=t),t=t.next;while(t!==e);return i}function Ru(e,t,i,r,n,a,s,o){return(n-s)*(t-o)>=(e-s)*(a-o)&&(e-s)*(r-o)>=(i-s)*(t-o)&&(i-s)*(a-o)>=(n-s)*(r-o)}function Un(e,t,i,r,n,a,s,o){return!(e===s&&t===o)&&Ru(e,t,i,r,n,a,s,o)}function rm(e,t){return e.next.i!==t.i&&e.prev.i!==t.i&&!nm(e,t)&&(Zn(e,t)&&Zn(t,e)&&am(e,t)&&(vt(e.prev,e,t.prev)||vt(e,t.prev,t))||mn(e,t)&&vt(e.prev,e,e.next)>0&&vt(t.prev,t,t.next)>0)}function vt(e,t,i){return(t.y-e.y)*(i.x-t.x)-(t.x-e.x)*(i.y-t.y)}function mn(e,t){return e.x===t.x&&e.y===t.y}function Cu(e,t,i,r){let n=ka(vt(e,t,i)),a=ka(vt(e,t,r)),s=ka(vt(i,r,e)),o=ka(vt(i,r,t));return!!(n!==a&&s!==o||n===0&&Fa(e,i,t)||a===0&&Fa(e,r,t)||s===0&&Fa(i,e,r)||o===0&&Fa(i,t,r))}function Fa(e,t,i){return t.x<=Math.max(e.x,i.x)&&t.x>=Math.min(e.x,i.x)&&t.y<=Math.max(e.y,i.y)&&t.y>=Math.min(e.y,i.y)}function ka(e){return e>0?1:e<0?-1:0}function nm(e,t){let i=e;do{if(i.i!==e.i&&i.next.i!==e.i&&i.i!==t.i&&i.next.i!==t.i&&Cu(i,i.next,e,t))return!0;i=i.next}while(i!==e);return!1}function Zn(e,t){return vt(e.prev,e,e.next)<0?vt(e,t,e.next)>=0&&vt(e,e.prev,t)>=0:vt(e,t,e.prev)<0||vt(e,e.next,t)<0}function am(e,t){let i=e,r=!1,n=(e.x+t.x)/2,a=(e.y+t.y)/2;do i.y>a!=i.next.y>a&&i.next.y!==i.y&&n<(i.next.x-i.x)*(a-i.y)/(i.next.y-i.y)+i.x&&(r=!r),i=i.next;while(i!==e);return r}function Iu(e,t){let i=gl(e.i,e.x,e.y),r=gl(t.i,t.x,t.y),n=e.next,a=t.prev;return e.next=t,t.prev=e,i.next=n,n.prev=i,r.next=i,i.prev=r,a.next=r,r.prev=a,r}function eh(e,t,i,r){let n=gl(e,t,i);return r?(n.next=r.next,n.prev=r,r.next.prev=n,r.next=n):(n.prev=n,n.next=n),n}function Jn(e){e.next.prev=e.prev,e.prev.next=e.next,e.prevZ&&(e.prevZ.nextZ=e.nextZ),e.nextZ&&(e.nextZ.prevZ=e.prevZ)}function gl(e,t,i){return{i:e,x:t,y:i,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function sm(e,t,i,r){let n=0;for(let a=t,s=i-r;a<i;a+=r)n+=(e[s]-e[a])*(e[a+1]+e[s+1]),s=a;return n}function th(e){let t=e.length;t>2&&e[t-1].equals(e[0])&&e.pop()}function ih(e,t){for(let i=0;i<t.length;i++)e.push(t[i].x),e.push(t[i].y)}function Ba(e,t){return!e||e.constructor===t?e:typeof t.BYTES_PER_ELEMENT=="number"?new t(e):Array.prototype.slice.call(e)}function um(e){return ArrayBuffer.isView(e)&&!(e instanceof DataView)}function dm(e){function t(n,a){return e[n]-e[a]}let i=e.length,r=new Array(i);for(let n=0;n!==i;++n)r[n]=n;return r.sort(t),r}function rh(e,t,i){let r=e.length,n=new e.constructor(r);for(let a=0,s=0;s!==r;++a){let o=i[a]*t;for(let l=0;l!==t;++l)n[s++]=e[o+l]}return n}function Uu(e,t,i,r){let n=1,a=e[0];for(;a!==void 0&&a[r]===void 0;)a=e[n++];if(a===void 0)return;let s=a[r];if(s!==void 0)if(Array.isArray(s))do s=a[r],s!==void 0&&(t.push(a.time),i.push(...s)),a=e[n++];while(a!==void 0);else if(s.toArray!==void 0)do s=a[r],s!==void 0&&(t.push(a.time),s.toArray(i,i.length)),a=e[n++];while(a!==void 0);else do s=a[r],s!==void 0&&(t.push(a.time),i.push(s)),a=e[n++];while(a!==void 0)}function gm(e){switch(e.toLowerCase()){case"scalar":case"double":case"float":case"number":case"integer":return Pr;case"vector":case"vector2":case"vector3":case"vector4":return lr;case"color":return Fu;case"quaternion":return Xi;case"bool":case"boolean":return vn;case"string":return _n}throw new Error("THREE.KeyframeTrack: Unsupported typeName: "+e)}function vm(e){if(e.type===void 0)throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");let t=gm(e.type);if(e.times===void 0){let i=[],r=[];Uu(e.keys,i,r,"value"),e.times=i,e.values=r}return t.parse!==void 0?t.parse(e):new t(e.name,e.times,e.values,e.interpolation)}function Hu(e){let t=[];e.isBone===!0&&t.push(e);for(let i=0;i<e.children.length;i++)t.push(...Hu(e.children[i]));return t}function lh(e,t,i,r){let n=Wm(r);switch(i){case Qh:return e*t;case El:return e*t/n.components*n.byteLength;case Tl:return e*t/n.components*n.byteLength;case tu:return e*t*2/n.components*n.byteLength;case Al:return e*t*2/n.components*n.byteLength;case eu:return e*t*3/n.components*n.byteLength;case ii:return e*t*4/n.components*n.byteLength;case Rl:return e*t*4/n.components*n.byteLength;case Ya:case $a:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case Ka:case Za:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case Fo:case Bo:return Math.max(e,16)*Math.max(t,8)/4;case Oo:case ko:return Math.max(e,8)*Math.max(t,8)/2;case zo:case Ho:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case Vo:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case Wo:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case Go:return Math.floor((e+4)/5)*Math.floor((t+3)/4)*16;case jo:return Math.floor((e+4)/5)*Math.floor((t+4)/5)*16;case Xo:return Math.floor((e+5)/6)*Math.floor((t+4)/5)*16;case qo:return Math.floor((e+5)/6)*Math.floor((t+5)/6)*16;case Yo:return Math.floor((e+7)/8)*Math.floor((t+4)/5)*16;case $o:return Math.floor((e+7)/8)*Math.floor((t+5)/6)*16;case Ko:return Math.floor((e+7)/8)*Math.floor((t+7)/8)*16;case Zo:return Math.floor((e+9)/10)*Math.floor((t+4)/5)*16;case Jo:return Math.floor((e+9)/10)*Math.floor((t+5)/6)*16;case Qo:return Math.floor((e+9)/10)*Math.floor((t+7)/8)*16;case el:return Math.floor((e+9)/10)*Math.floor((t+9)/10)*16;case tl:return Math.floor((e+11)/12)*Math.floor((t+9)/10)*16;case il:return Math.floor((e+11)/12)*Math.floor((t+11)/12)*16;case rl:case nl:case al:return Math.ceil(e/4)*Math.ceil(t/4)*16;case sl:case ol:return Math.ceil(e/4)*Math.ceil(t/4)*8;case ll:case cl:return Math.ceil(e/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${i} format.`)}function Wm(e){switch(e){case Ri:case $h:return{byteLength:1,components:1};case Hn:case Kh:case ta:return{byteLength:2,components:1};case Ml:case Sl:return{byteLength:2,components:4};case Cr:case wl:case fi:return{byteLength:4,components:1};case Zh:case Jh:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${e}.`)}function Vu(){let e=null,t=!1,i=null,r=null;function n(a,s){i(a,s),r=e.requestAnimationFrame(n)}return{start:function(){t!==!0&&i!==null&&(r=e.requestAnimationFrame(n),t=!0)},stop:function(){e.cancelAnimationFrame(r),t=!1},setAnimationLoop:function(a){i=a},setContext:function(a){e=a}}}function Gm(e){let t=new WeakMap;function i(o,l){let c=o.array,h=o.usage,u=c.byteLength,d=e.createBuffer();e.bindBuffer(l,d),e.bufferData(l,c,h),o.onUploadCallback();let p;if(c instanceof Float32Array)p=e.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)p=e.HALF_FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?p=e.HALF_FLOAT:p=e.UNSIGNED_SHORT;else if(c instanceof Int16Array)p=e.SHORT;else if(c instanceof Uint32Array)p=e.UNSIGNED_INT;else if(c instanceof Int32Array)p=e.INT;else if(c instanceof Int8Array)p=e.BYTE;else if(c instanceof Uint8Array)p=e.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)p=e.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:d,type:p,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:u}}function r(o,l,c){let h=l.array,u=l.updateRanges;if(e.bindBuffer(c,o),u.length===0)e.bufferSubData(c,0,h);else{u.sort((p,v)=>p.start-v.start);let d=0;for(let p=1;p<u.length;p++){let v=u[d],f=u[p];f.start<=v.start+v.count+1?v.count=Math.max(v.count,f.start+f.count-v.start):(++d,u[d]=f)}u.length=d+1;for(let p=0,v=u.length;p<v;p++){let f=u[p];e.bufferSubData(c,f.start*h.BYTES_PER_ELEMENT,h,f.start,f.count)}l.clearUpdateRanges()}l.onUploadCallback()}function n(o){return o.isInterleavedBufferAttribute&&(o=o.data),t.get(o)}function a(o){o.isInterleavedBufferAttribute&&(o=o.data);let l=t.get(o);l&&(e.deleteBuffer(l.buffer),t.delete(o))}function s(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){let h=t.get(o);(!h||h.version<o.version)&&t.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}let c=t.get(o);if(c===void 0)t.set(o,i(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");r(c.buffer,o,l),c.version=o.version}}return{get:n,remove:a,update:s}}function E0(e,t,i,r,n,a,s){let o=new _e(0),l=a===!0?0:1,c,h,u=null,d=0,p=null;function v(x){let _=x.isScene===!0?x.background:null;return _&&_.isTexture&&(_=(x.backgroundBlurriness>0?i:t).get(_)),_}function f(x){let _=!1,S=v(x);S===null?m(o,l):S&&S.isColor&&(m(S,1),_=!0);let E=e.xr.getEnvironmentBlendMode();E==="additive"?r.buffers.color.setClear(0,0,0,1,s):E==="alpha-blend"&&r.buffers.color.setClear(0,0,0,0,s),(e.autoClear||_)&&(r.buffers.depth.setTest(!0),r.buffers.depth.setMask(!0),r.buffers.color.setMask(!0),e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil))}function g(x,_){let S=v(_);S&&(S.isCubeTexture||S.mapping===us)?(h===void 0&&(h=new pt(new ps(1,1,1),new or({name:"BackgroundCubeMaterial",uniforms:fn(Si.backgroundCube.uniforms),vertexShader:Si.backgroundCube.vertexShader,fragmentShader:Si.backgroundCube.fragmentShader,side:kt,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(E,A,C){this.matrixWorld.copyPosition(C.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),n.update(h)),_r.copy(_.backgroundRotation),_r.x*=-1,_r.y*=-1,_r.z*=-1,S.isCubeTexture&&S.isRenderTargetTexture===!1&&(_r.y*=-1,_r.z*=-1),h.material.uniforms.envMap.value=S,h.material.uniforms.flipEnvMap.value=S.isCubeTexture&&S.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=_.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=_.backgroundIntensity,h.material.uniforms.backgroundRotation.value.setFromMatrix4(S0.makeRotationFromEuler(_r)),h.material.toneMapped=ke.getTransfer(S.colorSpace)!==nt,(u!==S||d!==S.version||p!==e.toneMapping)&&(h.material.needsUpdate=!0,u=S,d=S.version,p=e.toneMapping),h.layers.enableAll(),x.unshift(h,h.geometry,h.material,0,0,null)):S&&S.isTexture&&(c===void 0&&(c=new pt(new Pu(2,2),new or({name:"BackgroundMaterial",uniforms:fn(Si.background.uniforms),vertexShader:Si.background.vertexShader,fragmentShader:Si.background.fragmentShader,side:Ai,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),n.update(c)),c.material.uniforms.t2D.value=S,c.material.uniforms.backgroundIntensity.value=_.backgroundIntensity,c.material.toneMapped=ke.getTransfer(S.colorSpace)!==nt,S.matrixAutoUpdate===!0&&S.updateMatrix(),c.material.uniforms.uvTransform.value.copy(S.matrix),(u!==S||d!==S.version||p!==e.toneMapping)&&(c.material.needsUpdate=!0,u=S,d=S.version,p=e.toneMapping),c.layers.enableAll(),x.unshift(c,c.geometry,c.material,0,0,null))}function m(x,_){x.getRGB(Ha,vu(e)),r.buffers.color.setClear(Ha.r,Ha.g,Ha.b,_,s)}function y(){h!==void 0&&(h.geometry.dispose(),h.material.dispose(),h=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return o},setClearColor:function(x,_=1){o.set(x),l=_,m(o,l)},getClearAlpha:function(){return l},setClearAlpha:function(x){l=x,m(o,l)},render:f,addToRenderList:g,dispose:y}}function T0(e,t){let i=e.getParameter(e.MAX_VERTEX_ATTRIBS),r={},n=d(null),a=n,s=!1;function o(w,R,G,V,W){let O=!1,z=u(V,G,R);a!==z&&(a=z,c(a.object)),O=p(w,V,G,W),O&&v(w,V,G,W),W!==null&&t.update(W,e.ELEMENT_ARRAY_BUFFER),(O||s)&&(s=!1,_(w,R,G,V),W!==null&&e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,t.get(W).buffer))}function l(){return e.createVertexArray()}function c(w){return e.bindVertexArray(w)}function h(w){return e.deleteVertexArray(w)}function u(w,R,G){let V=G.wireframe===!0,W=r[w.id];W===void 0&&(W={},r[w.id]=W);let O=W[R.id];O===void 0&&(O={},W[R.id]=O);let z=O[V];return z===void 0&&(z=d(l()),O[V]=z),z}function d(w){let R=[],G=[],V=[];for(let W=0;W<i;W++)R[W]=0,G[W]=0,V[W]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:R,enabledAttributes:G,attributeDivisors:V,object:w,attributes:{},index:null}}function p(w,R,G,V){let W=a.attributes,O=R.attributes,z=0,j=G.getAttributes();for(let H in j)if(j[H].location>=0){let $=W[H],U=O[H];if(U===void 0&&(H==="instanceMatrix"&&w.instanceMatrix&&(U=w.instanceMatrix),H==="instanceColor"&&w.instanceColor&&(U=w.instanceColor)),$===void 0||$.attribute!==U||U&&$.data!==U.data)return!0;z++}return a.attributesNum!==z||a.index!==V}function v(w,R,G,V){let W={},O=R.attributes,z=0,j=G.getAttributes();for(let H in j)if(j[H].location>=0){let $=O[H];$===void 0&&(H==="instanceMatrix"&&w.instanceMatrix&&($=w.instanceMatrix),H==="instanceColor"&&w.instanceColor&&($=w.instanceColor));let U={};U.attribute=$,$&&$.data&&(U.data=$.data),W[H]=U,z++}a.attributes=W,a.attributesNum=z,a.index=V}function f(){let w=a.newAttributes;for(let R=0,G=w.length;R<G;R++)w[R]=0}function g(w){m(w,0)}function m(w,R){let G=a.newAttributes,V=a.enabledAttributes,W=a.attributeDivisors;G[w]=1,V[w]===0&&(e.enableVertexAttribArray(w),V[w]=1),W[w]!==R&&(e.vertexAttribDivisor(w,R),W[w]=R)}function y(){let w=a.newAttributes,R=a.enabledAttributes;for(let G=0,V=R.length;G<V;G++)R[G]!==w[G]&&(e.disableVertexAttribArray(G),R[G]=0)}function x(w,R,G,V,W,O,z){z===!0?e.vertexAttribIPointer(w,R,G,W,O):e.vertexAttribPointer(w,R,G,V,W,O)}function _(w,R,G,V){f();let W=V.attributes,O=G.getAttributes(),z=R.defaultAttributeValues;for(let j in O){let H=O[j];if(H.location>=0){let $=W[j];if($===void 0&&(j==="instanceMatrix"&&w.instanceMatrix&&($=w.instanceMatrix),j==="instanceColor"&&w.instanceColor&&($=w.instanceColor)),$!==void 0){let U=$.normalized,se=$.itemSize,ie=t.get($);if(ie===void 0)continue;let le=ie.buffer,ae=ie.type,N=ie.bytesPerElement,Y=ae===e.INT||ae===e.UNSIGNED_INT||$.gpuType===wl;if($.isInterleavedBufferAttribute){let J=$.data,de=J.stride,te=$.offset;if(J.isInstancedInterleavedBuffer){for(let pe=0;pe<H.locationSize;pe++)m(H.location+pe,J.meshPerAttribute);w.isInstancedMesh!==!0&&V._maxInstanceCount===void 0&&(V._maxInstanceCount=J.meshPerAttribute*J.count)}else for(let pe=0;pe<H.locationSize;pe++)g(H.location+pe);e.bindBuffer(e.ARRAY_BUFFER,le);for(let pe=0;pe<H.locationSize;pe++)x(H.location+pe,se/H.locationSize,ae,U,de*N,(te+se/H.locationSize*pe)*N,Y)}else{if($.isInstancedBufferAttribute){for(let J=0;J<H.locationSize;J++)m(H.location+J,$.meshPerAttribute);w.isInstancedMesh!==!0&&V._maxInstanceCount===void 0&&(V._maxInstanceCount=$.meshPerAttribute*$.count)}else for(let J=0;J<H.locationSize;J++)g(H.location+J);e.bindBuffer(e.ARRAY_BUFFER,le);for(let J=0;J<H.locationSize;J++)x(H.location+J,se/H.locationSize,ae,U,se*N,se/H.locationSize*J*N,Y)}}else if(z!==void 0){let U=z[j];if(U!==void 0)switch(U.length){case 2:e.vertexAttrib2fv(H.location,U);break;case 3:e.vertexAttrib3fv(H.location,U);break;case 4:e.vertexAttrib4fv(H.location,U);break;default:e.vertexAttrib1fv(H.location,U)}}}}y()}function S(){C();for(let w in r){let R=r[w];for(let G in R){let V=R[G];for(let W in V)h(V[W].object),delete V[W];delete R[G]}delete r[w]}}function E(w){if(r[w.id]===void 0)return;let R=r[w.id];for(let G in R){let V=R[G];for(let W in V)h(V[W].object),delete V[W];delete R[G]}delete r[w.id]}function A(w){for(let R in r){let G=r[R];if(G[w.id]===void 0)continue;let V=G[w.id];for(let W in V)h(V[W].object),delete V[W];delete G[w.id]}}function C(){b(),s=!0,a!==n&&(a=n,c(a.object))}function b(){n.geometry=null,n.program=null,n.wireframe=!1}return{setup:o,reset:C,resetDefaultState:b,dispose:S,releaseStatesOfGeometry:E,releaseStatesOfProgram:A,initAttributes:f,enableAttribute:g,disableUnusedAttributes:y}}function A0(e,t,i){let r;function n(c){r=c}function a(c,h){e.drawArrays(r,c,h),i.update(h,r,1)}function s(c,h,u){u!==0&&(e.drawArraysInstanced(r,c,h,u),i.update(h,r,u))}function o(c,h,u){if(u===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(r,c,0,h,0,u);let d=0;for(let p=0;p<u;p++)d+=h[p];i.update(d,r,1)}function l(c,h,u,d){if(u===0)return;let p=t.get("WEBGL_multi_draw");if(p===null)for(let v=0;v<c.length;v++)s(c[v],h[v],d[v]);else{p.multiDrawArraysInstancedWEBGL(r,c,0,h,0,d,0,u);let v=0;for(let f=0;f<u;f++)v+=h[f]*d[f];i.update(v,r,1)}}this.setMode=n,this.render=a,this.renderInstances=s,this.renderMultiDraw=o,this.renderMultiDrawInstances=l}function R0(e,t,i,r){let n;function a(){if(n!==void 0)return n;if(t.has("EXT_texture_filter_anisotropic")===!0){let A=t.get("EXT_texture_filter_anisotropic");n=e.getParameter(A.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else n=0;return n}function s(A){return!(A!==ii&&r.convert(A)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(A){let C=A===ta&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(A!==Ri&&r.convert(A)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_TYPE)&&A!==fi&&!C)}function l(A){if(A==="highp"){if(e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.HIGH_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.HIGH_FLOAT).precision>0)return"highp";A="mediump"}return A==="mediump"&&e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.MEDIUM_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=i.precision!==void 0?i.precision:"highp",h=l(c);h!==c&&(console.warn("THREE.WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);let u=i.logarithmicDepthBuffer===!0,d=i.reversedDepthBuffer===!0&&t.has("EXT_clip_control"),p=e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS),v=e.getParameter(e.MAX_VERTEX_TEXTURE_IMAGE_UNITS),f=e.getParameter(e.MAX_TEXTURE_SIZE),g=e.getParameter(e.MAX_CUBE_MAP_TEXTURE_SIZE),m=e.getParameter(e.MAX_VERTEX_ATTRIBS),y=e.getParameter(e.MAX_VERTEX_UNIFORM_VECTORS),x=e.getParameter(e.MAX_VARYING_VECTORS),_=e.getParameter(e.MAX_FRAGMENT_UNIFORM_VECTORS),S=v>0,E=e.getParameter(e.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:a,getMaxPrecision:l,textureFormatReadable:s,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:u,reversedDepthBuffer:d,maxTextures:p,maxVertexTextures:v,maxTextureSize:f,maxCubemapSize:g,maxAttributes:m,maxVertexUniforms:y,maxVaryings:x,maxFragmentUniforms:_,vertexTextures:S,maxSamples:E}}function C0(e){let t=this,i=null,r=0,n=!1,a=!1,s=new rr,o=new Ve,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(u,d){let p=u.length!==0||d||r!==0||n;return n=d,r=u.length,p},this.beginShadows=function(){a=!0,h(null)},this.endShadows=function(){a=!1},this.setGlobalState=function(u,d){i=h(u,d,0)},this.setState=function(u,d,p){let v=u.clippingPlanes,f=u.clipIntersection,g=u.clipShadows,m=e.get(u);if(!n||v===null||v.length===0||a&&!g)a?h(null):c();else{let y=a?0:r,x=y*4,_=m.clippingState||null;l.value=_,_=h(v,d,x,p);for(let S=0;S!==x;++S)_[S]=i[S];m.clippingState=_,this.numIntersection=f?this.numPlanes:0,this.numPlanes+=y}};function c(){l.value!==i&&(l.value=i,l.needsUpdate=r>0),t.numPlanes=r,t.numIntersection=0}function h(u,d,p,v){let f=u!==null?u.length:0,g=null;if(f!==0){if(g=l.value,v!==!0||g===null){let m=p+f*4,y=d.matrixWorldInverse;o.getNormalMatrix(y),(g===null||g.length<m)&&(g=new Float32Array(m));for(let x=0,_=p;x!==f;++x,_+=4)s.copy(u[x]).applyMatrix4(y,o),s.normal.toArray(g,_),g[_+3]=s.constant}l.value=g,l.needsUpdate=!0}return t.numPlanes=f,t.numIntersection=0,g}}function I0(e){let t=new WeakMap;function i(s,o){return o===ts?s.mapping=un:o===Uo&&(s.mapping=dn),s}function r(s){if(s&&s.isTexture){let o=s.mapping;if(o===ts||o===Uo)if(t.has(s)){let l=t.get(s).texture;return i(l,s.mapping)}else{let l=s.image;if(l&&l.height>0){let c=new Pf(l.height);return c.fromEquirectangularTexture(e,s),t.set(s,c),s.addEventListener("dispose",n),i(c.texture,s.mapping)}else return null}}return s}function n(s){let o=s.target;o.removeEventListener("dispose",n);let l=t.get(o);l!==void 0&&(t.delete(o),l.dispose())}function a(){t=new WeakMap}return{get:r,dispose:a}}function P0(e){let t=[],i=[],r=[],n=e,a=e-an+1+ch.length;for(let s=0;s<a;s++){let o=Math.pow(2,n);i.push(o);let l=1/o;s>e-an?l=ch[s-e+an-1]:s===0&&(l=0),r.push(l);let c=1/(o-2),h=-c,u=1+c,d=[h,h,u,h,u,u,h,h,u,u,h,u],p=6,v=6,f=3,g=2,m=1,y=new Float32Array(f*v*p),x=new Float32Array(g*v*p),_=new Float32Array(m*v*p);for(let E=0;E<p;E++){let A=E%3*2/3-1,C=E>2?0:-1,b=[A,C,0,A+2/3,C,0,A+2/3,C+1,0,A,C,0,A+2/3,C+1,0,A,C+1,0];y.set(b,f*v*E),x.set(d,g*v*E);let w=[E,E,E,E,E,E];_.set(w,m*v*E)}let S=new It;S.setAttribute("position",new Et(y,f)),S.setAttribute("uv",new Et(x,g)),S.setAttribute("faceIndex",new Et(_,m)),t.push(S),n>an&&n--}return{lodPlanes:t,sizeLods:i,sigmas:r}}function dh(e,t,i){let r=new Ir(e,t,i);return r.texture.mapping=us,r.texture.name="PMREM.cubeUv",r.scissorTest=!0,r}function Va(e,t,i,r,n){e.viewport.set(t,i,r,n),e.scissor.set(t,i,r,n)}function D0(e,t,i){let r=new Float32Array(Mr),n=new P(0,1,0);return new or({name:"SphericalGaussianBlur",defines:{n:Mr,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/i,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:r},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:n}},vertexShader:Vl(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:ar,depthTest:!1,depthWrite:!1})}function ph(){return new or({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Vl(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:ar,depthTest:!1,depthWrite:!1})}function fh(){return new or({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Vl(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:ar,depthTest:!1,depthWrite:!1})}function Vl(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function N0(e){let t=new WeakMap,i=null;function r(o){if(o&&o.isTexture){let l=o.mapping,c=l===ts||l===Uo,h=l===un||l===dn;if(c||h){let u=t.get(o),d=u!==void 0?u.texture.pmremVersion:0;if(o.isRenderTargetTexture&&o.pmremVersion!==d)return i===null&&(i=new vl(e)),u=c?i.fromEquirectangular(o,u):i.fromCubemap(o,u),u.texture.pmremVersion=o.pmremVersion,t.set(o,u),u.texture;if(u!==void 0)return u.texture;{let p=o.image;return c&&p&&p.height>0||h&&p&&n(p)?(i===null&&(i=new vl(e)),u=c?i.fromEquirectangular(o):i.fromCubemap(o),u.texture.pmremVersion=o.pmremVersion,t.set(o,u),o.addEventListener("dispose",a),u.texture):null}}}return o}function n(o){let l=0,c=6;for(let h=0;h<c;h++)o[h]!==void 0&&l++;return l===c}function a(o){let l=o.target;l.removeEventListener("dispose",a);let c=t.get(l);c!==void 0&&(t.delete(l),c.dispose())}function s(){t=new WeakMap,i!==null&&(i.dispose(),i=null)}return{get:r,dispose:s}}function U0(e){let t={};function i(r){if(t[r]!==void 0)return t[r];let n;switch(r){case"WEBGL_depth_texture":n=e.getExtension("WEBGL_depth_texture")||e.getExtension("MOZ_WEBGL_depth_texture")||e.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":n=e.getExtension("EXT_texture_filter_anisotropic")||e.getExtension("MOZ_EXT_texture_filter_anisotropic")||e.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":n=e.getExtension("WEBGL_compressed_texture_s3tc")||e.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||e.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":n=e.getExtension("WEBGL_compressed_texture_pvrtc")||e.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:n=e.getExtension(r)}return t[r]=n,n}return{has:function(r){return i(r)!==null},init:function(){i("EXT_color_buffer_float"),i("WEBGL_clip_cull_distance"),i("OES_texture_float_linear"),i("EXT_color_buffer_half_float"),i("WEBGL_multisampled_render_to_texture"),i("WEBGL_render_shared_exponent")},get:function(r){let n=i(r);return n===null&&Yn("THREE.WebGLRenderer: "+r+" extension not supported."),n}}}function O0(e,t,i,r){let n={},a=new WeakMap;function s(u){let d=u.target;d.index!==null&&t.remove(d.index);for(let v in d.attributes)t.remove(d.attributes[v]);d.removeEventListener("dispose",s),delete n[d.id];let p=a.get(d);p&&(t.remove(p),a.delete(d)),r.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0&&delete d._maxInstanceCount,i.memory.geometries--}function o(u,d){return n[d.id]===!0||(d.addEventListener("dispose",s),n[d.id]=!0,i.memory.geometries++),d}function l(u){let d=u.attributes;for(let p in d)t.update(d[p],e.ARRAY_BUFFER)}function c(u){let d=[],p=u.index,v=u.attributes.position,f=0;if(p!==null){let y=p.array;f=p.version;for(let x=0,_=y.length;x<_;x+=3){let S=y[x+0],E=y[x+1],A=y[x+2];d.push(S,E,E,A,A,S)}}else if(v!==void 0){let y=v.array;f=v.version;for(let x=0,_=y.length/3-1;x<_;x+=3){let S=x+0,E=x+1,A=x+2;d.push(S,E,E,A,A,S)}}else return;let g=new(lu(d)?fu:Pl)(d,1);g.version=f;let m=a.get(u);m&&t.remove(m),a.set(u,g)}function h(u){let d=a.get(u);if(d){let p=u.index;p!==null&&d.version<p.version&&c(u)}else c(u);return a.get(u)}return{get:o,update:l,getWireframeAttribute:h}}function F0(e,t,i){let r;function n(d){r=d}let a,s;function o(d){a=d.type,s=d.bytesPerElement}function l(d,p){e.drawElements(r,p,a,d*s),i.update(p,r,1)}function c(d,p,v){v!==0&&(e.drawElementsInstanced(r,p,a,d*s,v),i.update(p,r,v))}function h(d,p,v){if(v===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(r,p,0,a,d,0,v);let f=0;for(let g=0;g<v;g++)f+=p[g];i.update(f,r,1)}function u(d,p,v,f){if(v===0)return;let g=t.get("WEBGL_multi_draw");if(g===null)for(let m=0;m<d.length;m++)c(d[m]/s,p[m],f[m]);else{g.multiDrawElementsInstancedWEBGL(r,p,0,a,d,0,f,0,v);let m=0;for(let y=0;y<v;y++)m+=p[y]*f[y];i.update(m,r,1)}}this.setMode=n,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=h,this.renderMultiDrawInstances=u}function k0(e){let t={geometries:0,textures:0},i={frame:0,calls:0,triangles:0,points:0,lines:0};function r(a,s,o){switch(i.calls++,s){case e.TRIANGLES:i.triangles+=o*(a/3);break;case e.LINES:i.lines+=o*(a/2);break;case e.LINE_STRIP:i.lines+=o*(a-1);break;case e.LINE_LOOP:i.lines+=o*a;break;case e.POINTS:i.points+=o*a;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",s);break}}function n(){i.calls=0,i.triangles=0,i.points=0,i.lines=0}return{memory:t,render:i,programs:null,autoReset:!0,reset:n,update:r}}function B0(e,t,i){let r=new WeakMap,n=new Ye;function a(s,o,l){let c=s.morphTargetInfluences,h=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,u=h!==void 0?h.length:0,d=r.get(o);if(d===void 0||d.count!==u){let p=function(){C.dispose(),r.delete(o),o.removeEventListener("dispose",p)};d!==void 0&&d.texture.dispose();let v=o.morphAttributes.position!==void 0,f=o.morphAttributes.normal!==void 0,g=o.morphAttributes.color!==void 0,m=o.morphAttributes.position||[],y=o.morphAttributes.normal||[],x=o.morphAttributes.color||[],_=0;v===!0&&(_=1),f===!0&&(_=2),g===!0&&(_=3);let S=o.attributes.position.count*_,E=1;S>t.maxTextureSize&&(E=Math.ceil(S/t.maxTextureSize),S=t.maxTextureSize);let A=new Float32Array(S*E*4*u),C=new hu(A,S,E,u);C.type=fi,C.needsUpdate=!0;let b=_*4;for(let w=0;w<u;w++){let R=m[w],G=y[w],V=x[w],W=S*E*4*w;for(let O=0;O<R.count;O++){let z=O*b;v===!0&&(n.fromBufferAttribute(R,O),A[W+z+0]=n.x,A[W+z+1]=n.y,A[W+z+2]=n.z,A[W+z+3]=0),f===!0&&(n.fromBufferAttribute(G,O),A[W+z+4]=n.x,A[W+z+5]=n.y,A[W+z+6]=n.z,A[W+z+7]=0),g===!0&&(n.fromBufferAttribute(V,O),A[W+z+8]=n.x,A[W+z+9]=n.y,A[W+z+10]=n.z,A[W+z+11]=V.itemSize===4?n.w:1)}}d={count:u,texture:C,size:new De(S,E)},r.set(o,d),o.addEventListener("dispose",p)}if(s.isInstancedMesh===!0&&s.morphTexture!==null)l.getUniforms().setValue(e,"morphTexture",s.morphTexture,i);else{let p=0;for(let f=0;f<c.length;f++)p+=c[f];let v=o.morphTargetsRelative?1:1-p;l.getUniforms().setValue(e,"morphTargetBaseInfluence",v),l.getUniforms().setValue(e,"morphTargetInfluences",c)}l.getUniforms().setValue(e,"morphTargetsTexture",d.texture,i),l.getUniforms().setValue(e,"morphTargetsTextureSize",d.size)}return{update:a}}function z0(e,t,i,r){let n=new WeakMap;function a(l){let c=r.render.frame,h=l.geometry,u=t.get(l,h);if(n.get(u)!==c&&(t.update(u),n.set(u,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",o)===!1&&l.addEventListener("dispose",o),n.get(l)!==c&&(i.update(l.instanceMatrix,e.ARRAY_BUFFER),l.instanceColor!==null&&i.update(l.instanceColor,e.ARRAY_BUFFER),n.set(l,c))),l.isSkinnedMesh){let d=l.skeleton;n.get(d)!==c&&(d.update(),n.set(d,c))}return u}function s(){n=new WeakMap}function o(l){let c=l.target;c.removeEventListener("dispose",o),i.remove(c.instanceMatrix),c.instanceColor!==null&&i.remove(c.instanceColor)}return{update:a,dispose:s}}function xn(e,t,i){let r=e[0];if(r<=0||r>0)return e;let n=t*i,a=gh[n];if(a===void 0&&(a=new Float32Array(n),gh[n]=a),t!==0){r.toArray(a,0);for(let s=1,o=0;s!==t;++s)o+=i,e[s].toArray(a,o)}return a}function wt(e,t){if(e.length!==t.length)return!1;for(let i=0,r=e.length;i<r;i++)if(e[i]!==t[i])return!1;return!0}function Mt(e,t){for(let i=0,r=t.length;i<r;i++)e[i]=t[i]}function ms(e,t){let i=vh[t];i===void 0&&(i=new Int32Array(t),vh[t]=i);for(let r=0;r!==t;++r)i[r]=e.allocateTextureUnit();return i}function H0(e,t){let i=this.cache;i[0]!==t&&(e.uniform1f(this.addr,t),i[0]=t)}function V0(e,t){let i=this.cache;if(t.x!==void 0)(i[0]!==t.x||i[1]!==t.y)&&(e.uniform2f(this.addr,t.x,t.y),i[0]=t.x,i[1]=t.y);else{if(wt(i,t))return;e.uniform2fv(this.addr,t),Mt(i,t)}}function W0(e,t){let i=this.cache;if(t.x!==void 0)(i[0]!==t.x||i[1]!==t.y||i[2]!==t.z)&&(e.uniform3f(this.addr,t.x,t.y,t.z),i[0]=t.x,i[1]=t.y,i[2]=t.z);else if(t.r!==void 0)(i[0]!==t.r||i[1]!==t.g||i[2]!==t.b)&&(e.uniform3f(this.addr,t.r,t.g,t.b),i[0]=t.r,i[1]=t.g,i[2]=t.b);else{if(wt(i,t))return;e.uniform3fv(this.addr,t),Mt(i,t)}}function G0(e,t){let i=this.cache;if(t.x!==void 0)(i[0]!==t.x||i[1]!==t.y||i[2]!==t.z||i[3]!==t.w)&&(e.uniform4f(this.addr,t.x,t.y,t.z,t.w),i[0]=t.x,i[1]=t.y,i[2]=t.z,i[3]=t.w);else{if(wt(i,t))return;e.uniform4fv(this.addr,t),Mt(i,t)}}function j0(e,t){let i=this.cache,r=t.elements;if(r===void 0){if(wt(i,t))return;e.uniformMatrix2fv(this.addr,!1,t),Mt(i,t)}else{if(wt(i,r))return;yh.set(r),e.uniformMatrix2fv(this.addr,!1,yh),Mt(i,r)}}function X0(e,t){let i=this.cache,r=t.elements;if(r===void 0){if(wt(i,t))return;e.uniformMatrix3fv(this.addr,!1,t),Mt(i,t)}else{if(wt(i,r))return;xh.set(r),e.uniformMatrix3fv(this.addr,!1,xh),Mt(i,r)}}function q0(e,t){let i=this.cache,r=t.elements;if(r===void 0){if(wt(i,t))return;e.uniformMatrix4fv(this.addr,!1,t),Mt(i,t)}else{if(wt(i,r))return;_h.set(r),e.uniformMatrix4fv(this.addr,!1,_h),Mt(i,r)}}function Y0(e,t){let i=this.cache;i[0]!==t&&(e.uniform1i(this.addr,t),i[0]=t)}function $0(e,t){let i=this.cache;if(t.x!==void 0)(i[0]!==t.x||i[1]!==t.y)&&(e.uniform2i(this.addr,t.x,t.y),i[0]=t.x,i[1]=t.y);else{if(wt(i,t))return;e.uniform2iv(this.addr,t),Mt(i,t)}}function K0(e,t){let i=this.cache;if(t.x!==void 0)(i[0]!==t.x||i[1]!==t.y||i[2]!==t.z)&&(e.uniform3i(this.addr,t.x,t.y,t.z),i[0]=t.x,i[1]=t.y,i[2]=t.z);else{if(wt(i,t))return;e.uniform3iv(this.addr,t),Mt(i,t)}}function Z0(e,t){let i=this.cache;if(t.x!==void 0)(i[0]!==t.x||i[1]!==t.y||i[2]!==t.z||i[3]!==t.w)&&(e.uniform4i(this.addr,t.x,t.y,t.z,t.w),i[0]=t.x,i[1]=t.y,i[2]=t.z,i[3]=t.w);else{if(wt(i,t))return;e.uniform4iv(this.addr,t),Mt(i,t)}}function J0(e,t){let i=this.cache;i[0]!==t&&(e.uniform1ui(this.addr,t),i[0]=t)}function Q0(e,t){let i=this.cache;if(t.x!==void 0)(i[0]!==t.x||i[1]!==t.y)&&(e.uniform2ui(this.addr,t.x,t.y),i[0]=t.x,i[1]=t.y);else{if(wt(i,t))return;e.uniform2uiv(this.addr,t),Mt(i,t)}}function e_(e,t){let i=this.cache;if(t.x!==void 0)(i[0]!==t.x||i[1]!==t.y||i[2]!==t.z)&&(e.uniform3ui(this.addr,t.x,t.y,t.z),i[0]=t.x,i[1]=t.y,i[2]=t.z);else{if(wt(i,t))return;e.uniform3uiv(this.addr,t),Mt(i,t)}}function t_(e,t){let i=this.cache;if(t.x!==void 0)(i[0]!==t.x||i[1]!==t.y||i[2]!==t.z||i[3]!==t.w)&&(e.uniform4ui(this.addr,t.x,t.y,t.z,t.w),i[0]=t.x,i[1]=t.y,i[2]=t.z,i[3]=t.w);else{if(wt(i,t))return;e.uniform4uiv(this.addr,t),Mt(i,t)}}function i_(e,t,i){let r=this.cache,n=i.allocateTextureUnit();r[0]!==n&&(e.uniform1i(this.addr,n),r[0]=n);let a;this.type===e.SAMPLER_2D_SHADOW?(mh.compareFunction=nu,a=mh):a=Wu,i.setTexture2D(t||a,n)}function r_(e,t,i){let r=this.cache,n=i.allocateTextureUnit();r[0]!==n&&(e.uniform1i(this.addr,n),r[0]=n),i.setTexture3D(t||ju,n)}function n_(e,t,i){let r=this.cache,n=i.allocateTextureUnit();r[0]!==n&&(e.uniform1i(this.addr,n),r[0]=n),i.setTextureCube(t||Xu,n)}function a_(e,t,i){let r=this.cache,n=i.allocateTextureUnit();r[0]!==n&&(e.uniform1i(this.addr,n),r[0]=n),i.setTexture2DArray(t||Gu,n)}function s_(e){switch(e){case 5126:return H0;case 35664:return V0;case 35665:return W0;case 35666:return G0;case 35674:return j0;case 35675:return X0;case 35676:return q0;case 5124:case 35670:return Y0;case 35667:case 35671:return $0;case 35668:case 35672:return K0;case 35669:case 35673:return Z0;case 5125:return J0;case 36294:return Q0;case 36295:return e_;case 36296:return t_;case 35678:case 36198:case 36298:case 36306:case 35682:return i_;case 35679:case 36299:case 36307:return r_;case 35680:case 36300:case 36308:case 36293:return n_;case 36289:case 36303:case 36311:case 36292:return a_}}function o_(e,t){e.uniform1fv(this.addr,t)}function l_(e,t){let i=xn(t,this.size,2);e.uniform2fv(this.addr,i)}function c_(e,t){let i=xn(t,this.size,3);e.uniform3fv(this.addr,i)}function h_(e,t){let i=xn(t,this.size,4);e.uniform4fv(this.addr,i)}function u_(e,t){let i=xn(t,this.size,4);e.uniformMatrix2fv(this.addr,!1,i)}function d_(e,t){let i=xn(t,this.size,9);e.uniformMatrix3fv(this.addr,!1,i)}function p_(e,t){let i=xn(t,this.size,16);e.uniformMatrix4fv(this.addr,!1,i)}function f_(e,t){e.uniform1iv(this.addr,t)}function m_(e,t){e.uniform2iv(this.addr,t)}function g_(e,t){e.uniform3iv(this.addr,t)}function v_(e,t){e.uniform4iv(this.addr,t)}function __(e,t){e.uniform1uiv(this.addr,t)}function x_(e,t){e.uniform2uiv(this.addr,t)}function y_(e,t){e.uniform3uiv(this.addr,t)}function b_(e,t){e.uniform4uiv(this.addr,t)}function w_(e,t,i){let r=this.cache,n=t.length,a=ms(i,n);wt(r,a)||(e.uniform1iv(this.addr,a),Mt(r,a));for(let s=0;s!==n;++s)i.setTexture2D(t[s]||Wu,a[s])}function M_(e,t,i){let r=this.cache,n=t.length,a=ms(i,n);wt(r,a)||(e.uniform1iv(this.addr,a),Mt(r,a));for(let s=0;s!==n;++s)i.setTexture3D(t[s]||ju,a[s])}function S_(e,t,i){let r=this.cache,n=t.length,a=ms(i,n);wt(r,a)||(e.uniform1iv(this.addr,a),Mt(r,a));for(let s=0;s!==n;++s)i.setTextureCube(t[s]||Xu,a[s])}function E_(e,t,i){let r=this.cache,n=t.length,a=ms(i,n);wt(r,a)||(e.uniform1iv(this.addr,a),Mt(r,a));for(let s=0;s!==n;++s)i.setTexture2DArray(t[s]||Gu,a[s])}function T_(e){switch(e){case 5126:return o_;case 35664:return l_;case 35665:return c_;case 35666:return h_;case 35674:return u_;case 35675:return d_;case 35676:return p_;case 5124:case 35670:return f_;case 35667:case 35671:return m_;case 35668:case 35672:return g_;case 35669:case 35673:return v_;case 5125:return __;case 36294:return x_;case 36295:return y_;case 36296:return b_;case 35678:case 36198:case 36298:case 36306:case 35682:return w_;case 35679:case 36299:case 36307:return M_;case 35680:case 36300:case 36308:case 36293:return S_;case 36289:case 36303:case 36311:case 36292:return E_}}function bh(e,t){e.seq.push(t),e.map[t.id]=t}function I_(e,t,i){let r=e.name,n=r.length;for(go.lastIndex=0;;){let a=go.exec(r),s=go.lastIndex,o=a[1],l=a[2]==="]",c=a[3];if(l&&(o=o|0),c===void 0||c==="["&&s+2===n){bh(i,c===void 0?new A_(o,e,t):new R_(o,e,t));break}else{let h=i.map[o];h===void 0&&(h=new C_(o),bh(i,h)),i=h}}}function wh(e,t,i){let r=e.createShader(t);return e.shaderSource(r,i),e.compileShader(r),r}function D_(e,t){let i=e.split(`
`),r=[],n=Math.max(t-6,0),a=Math.min(t+6,i.length);for(let s=n;s<a;s++){let o=s+1;r.push(`${o===t?">":" "} ${o}: ${i[s]}`)}return r.join(`
`)}function N_(e){ke._getMatrix(Mh,ke.workingColorSpace,e);let t=`mat3( ${Mh.elements.map(i=>i.toFixed(4))} )`;switch(ke.getTransfer(e)){case ns:return[t,"LinearTransferOETF"];case nt:return[t,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",e),[t,"LinearTransferOETF"]}}function Sh(e,t,i){let r=e.getShaderParameter(t,e.COMPILE_STATUS),n=(e.getShaderInfoLog(t)||"").trim();if(r&&n==="")return"";let a=/ERROR: 0:(\d+)/.exec(n);if(a){let s=parseInt(a[1]);return i.toUpperCase()+`

`+n+`

`+D_(e.getShaderSource(t),s)}else return n}function U_(e,t){let i=N_(t);return[`vec4 ${e}( vec4 value ) {`,`	return ${i[1]}( vec4( value.rgb * ${i[0]}, value.a ) );`,"}"].join(`
`)}function O_(e,t){let i;switch(t){case Sp:i="Linear";break;case Ep:i="Reinhard";break;case Tp:i="Cineon";break;case Xh:i="ACESFilmic";break;case Rp:i="AgX";break;case Cp:i="Neutral";break;case Ap:i="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",t),i="Linear"}return"vec3 "+e+"( vec3 color ) { return "+i+"ToneMapping( color ); }"}function F_(){ke.getLuminanceCoefficients(Wa);let e=Wa.x.toFixed(4),t=Wa.y.toFixed(4),i=Wa.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${e}, ${t}, ${i} );`,"	return dot( weights, rgb );","}"].join(`
`)}function k_(e){return[e.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",e.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(On).join(`
`)}function B_(e){let t=[];for(let i in e){let r=e[i];r!==!1&&t.push("#define "+i+" "+r)}return t.join(`
`)}function z_(e,t){let i={},r=e.getProgramParameter(t,e.ACTIVE_ATTRIBUTES);for(let n=0;n<r;n++){let a=e.getActiveAttrib(t,n),s=a.name,o=1;a.type===e.FLOAT_MAT2&&(o=2),a.type===e.FLOAT_MAT3&&(o=3),a.type===e.FLOAT_MAT4&&(o=4),i[s]={type:a.type,location:e.getAttribLocation(t,s),locationSize:o}}return i}function On(e){return e!==""}function Eh(e,t){let i=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return e.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,i).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function Th(e,t){return e.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}function _l(e){return e.replace(H_,W_)}function W_(e,t){let i=He[t];if(i===void 0){let r=V_.get(t);if(r!==void 0)i=He[r],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,r);else throw new Error("Can not resolve #include <"+t+">")}return _l(i)}function Ah(e){return e.replace(G_,j_)}function j_(e,t,i,r){let n="";for(let a=parseInt(t);a<parseInt(i);a++)n+=r.replace(/\[\s*i\s*\]/g,"[ "+a+" ]").replace(/UNROLLED_LOOP_INDEX/g,a);return n}function Rh(e){let t=`precision ${e.precision} float;
	precision ${e.precision} int;
	precision ${e.precision} sampler2D;
	precision ${e.precision} samplerCube;
	precision ${e.precision} sampler3D;
	precision ${e.precision} sampler2DArray;
	precision ${e.precision} sampler2DShadow;
	precision ${e.precision} samplerCubeShadow;
	precision ${e.precision} sampler2DArrayShadow;
	precision ${e.precision} isampler2D;
	precision ${e.precision} isampler3D;
	precision ${e.precision} isamplerCube;
	precision ${e.precision} isampler2DArray;
	precision ${e.precision} usampler2D;
	precision ${e.precision} usampler3D;
	precision ${e.precision} usamplerCube;
	precision ${e.precision} usampler2DArray;
	`;return e.precision==="highp"?t+=`
#define HIGH_PRECISION`:e.precision==="mediump"?t+=`
#define MEDIUM_PRECISION`:e.precision==="lowp"&&(t+=`
#define LOW_PRECISION`),t}function X_(e){let t="SHADOWMAP_TYPE_BASIC";return e.shadowMapType===jh?t="SHADOWMAP_TYPE_PCF":e.shadowMapType===rp?t="SHADOWMAP_TYPE_PCF_SOFT":e.shadowMapType===Vi&&(t="SHADOWMAP_TYPE_VSM"),t}function q_(e){let t="ENVMAP_TYPE_CUBE";if(e.envMap)switch(e.envMapMode){case un:case dn:t="ENVMAP_TYPE_CUBE";break;case us:t="ENVMAP_TYPE_CUBE_UV";break}return t}function Y_(e){let t="ENVMAP_MODE_REFLECTION";if(e.envMap)switch(e.envMapMode){case dn:t="ENVMAP_MODE_REFRACTION";break}return t}function $_(e){let t="ENVMAP_BLENDING_NONE";if(e.envMap)switch(e.combine){case hs:t="ENVMAP_BLENDING_MULTIPLY";break;case wp:t="ENVMAP_BLENDING_MIX";break;case Mp:t="ENVMAP_BLENDING_ADD";break}return t}function K_(e){let t=e.envMapCubeUVHeight;if(t===null)return null;let i=Math.log2(t)-2,r=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,i),112)),texelHeight:r,maxMip:i}}function Z_(e,t,i,r){let n=e.getContext(),a=i.defines,s=i.vertexShader,o=i.fragmentShader,l=X_(i),c=q_(i),h=Y_(i),u=$_(i),d=K_(i),p=k_(i),v=B_(a),f=n.createProgram(),g,m,y=i.glslVersion?"#version "+i.glslVersion+`
`:"";i.isRawShaderMaterial?(g=["#define SHADER_TYPE "+i.shaderType,"#define SHADER_NAME "+i.shaderName,v].filter(On).join(`
`),g.length>0&&(g+=`
`),m=["#define SHADER_TYPE "+i.shaderType,"#define SHADER_NAME "+i.shaderName,v].filter(On).join(`
`),m.length>0&&(m+=`
`)):(g=[Rh(i),"#define SHADER_TYPE "+i.shaderType,"#define SHADER_NAME "+i.shaderName,v,i.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",i.batching?"#define USE_BATCHING":"",i.batchingColor?"#define USE_BATCHING_COLOR":"",i.instancing?"#define USE_INSTANCING":"",i.instancingColor?"#define USE_INSTANCING_COLOR":"",i.instancingMorph?"#define USE_INSTANCING_MORPH":"",i.useFog&&i.fog?"#define USE_FOG":"",i.useFog&&i.fogExp2?"#define FOG_EXP2":"",i.map?"#define USE_MAP":"",i.envMap?"#define USE_ENVMAP":"",i.envMap?"#define "+h:"",i.lightMap?"#define USE_LIGHTMAP":"",i.aoMap?"#define USE_AOMAP":"",i.bumpMap?"#define USE_BUMPMAP":"",i.normalMap?"#define USE_NORMALMAP":"",i.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",i.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",i.displacementMap?"#define USE_DISPLACEMENTMAP":"",i.emissiveMap?"#define USE_EMISSIVEMAP":"",i.anisotropy?"#define USE_ANISOTROPY":"",i.anisotropyMap?"#define USE_ANISOTROPYMAP":"",i.clearcoatMap?"#define USE_CLEARCOATMAP":"",i.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",i.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",i.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",i.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",i.specularMap?"#define USE_SPECULARMAP":"",i.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",i.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",i.roughnessMap?"#define USE_ROUGHNESSMAP":"",i.metalnessMap?"#define USE_METALNESSMAP":"",i.alphaMap?"#define USE_ALPHAMAP":"",i.alphaHash?"#define USE_ALPHAHASH":"",i.transmission?"#define USE_TRANSMISSION":"",i.transmissionMap?"#define USE_TRANSMISSIONMAP":"",i.thicknessMap?"#define USE_THICKNESSMAP":"",i.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",i.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",i.mapUv?"#define MAP_UV "+i.mapUv:"",i.alphaMapUv?"#define ALPHAMAP_UV "+i.alphaMapUv:"",i.lightMapUv?"#define LIGHTMAP_UV "+i.lightMapUv:"",i.aoMapUv?"#define AOMAP_UV "+i.aoMapUv:"",i.emissiveMapUv?"#define EMISSIVEMAP_UV "+i.emissiveMapUv:"",i.bumpMapUv?"#define BUMPMAP_UV "+i.bumpMapUv:"",i.normalMapUv?"#define NORMALMAP_UV "+i.normalMapUv:"",i.displacementMapUv?"#define DISPLACEMENTMAP_UV "+i.displacementMapUv:"",i.metalnessMapUv?"#define METALNESSMAP_UV "+i.metalnessMapUv:"",i.roughnessMapUv?"#define ROUGHNESSMAP_UV "+i.roughnessMapUv:"",i.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+i.anisotropyMapUv:"",i.clearcoatMapUv?"#define CLEARCOATMAP_UV "+i.clearcoatMapUv:"",i.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+i.clearcoatNormalMapUv:"",i.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+i.clearcoatRoughnessMapUv:"",i.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+i.iridescenceMapUv:"",i.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+i.iridescenceThicknessMapUv:"",i.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+i.sheenColorMapUv:"",i.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+i.sheenRoughnessMapUv:"",i.specularMapUv?"#define SPECULARMAP_UV "+i.specularMapUv:"",i.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+i.specularColorMapUv:"",i.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+i.specularIntensityMapUv:"",i.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+i.transmissionMapUv:"",i.thicknessMapUv?"#define THICKNESSMAP_UV "+i.thicknessMapUv:"",i.vertexTangents&&i.flatShading===!1?"#define USE_TANGENT":"",i.vertexColors?"#define USE_COLOR":"",i.vertexAlphas?"#define USE_COLOR_ALPHA":"",i.vertexUv1s?"#define USE_UV1":"",i.vertexUv2s?"#define USE_UV2":"",i.vertexUv3s?"#define USE_UV3":"",i.pointsUvs?"#define USE_POINTS_UV":"",i.flatShading?"#define FLAT_SHADED":"",i.skinning?"#define USE_SKINNING":"",i.morphTargets?"#define USE_MORPHTARGETS":"",i.morphNormals&&i.flatShading===!1?"#define USE_MORPHNORMALS":"",i.morphColors?"#define USE_MORPHCOLORS":"",i.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+i.morphTextureStride:"",i.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+i.morphTargetsCount:"",i.doubleSided?"#define DOUBLE_SIDED":"",i.flipSided?"#define FLIP_SIDED":"",i.shadowMapEnabled?"#define USE_SHADOWMAP":"",i.shadowMapEnabled?"#define "+l:"",i.sizeAttenuation?"#define USE_SIZEATTENUATION":"",i.numLightProbes>0?"#define USE_LIGHT_PROBES":"",i.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",i.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(On).join(`
`),m=[Rh(i),"#define SHADER_TYPE "+i.shaderType,"#define SHADER_NAME "+i.shaderName,v,i.useFog&&i.fog?"#define USE_FOG":"",i.useFog&&i.fogExp2?"#define FOG_EXP2":"",i.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",i.map?"#define USE_MAP":"",i.matcap?"#define USE_MATCAP":"",i.envMap?"#define USE_ENVMAP":"",i.envMap?"#define "+c:"",i.envMap?"#define "+h:"",i.envMap?"#define "+u:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",i.lightMap?"#define USE_LIGHTMAP":"",i.aoMap?"#define USE_AOMAP":"",i.bumpMap?"#define USE_BUMPMAP":"",i.normalMap?"#define USE_NORMALMAP":"",i.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",i.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",i.emissiveMap?"#define USE_EMISSIVEMAP":"",i.anisotropy?"#define USE_ANISOTROPY":"",i.anisotropyMap?"#define USE_ANISOTROPYMAP":"",i.clearcoat?"#define USE_CLEARCOAT":"",i.clearcoatMap?"#define USE_CLEARCOATMAP":"",i.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",i.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",i.dispersion?"#define USE_DISPERSION":"",i.iridescence?"#define USE_IRIDESCENCE":"",i.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",i.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",i.specularMap?"#define USE_SPECULARMAP":"",i.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",i.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",i.roughnessMap?"#define USE_ROUGHNESSMAP":"",i.metalnessMap?"#define USE_METALNESSMAP":"",i.alphaMap?"#define USE_ALPHAMAP":"",i.alphaTest?"#define USE_ALPHATEST":"",i.alphaHash?"#define USE_ALPHAHASH":"",i.sheen?"#define USE_SHEEN":"",i.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",i.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",i.transmission?"#define USE_TRANSMISSION":"",i.transmissionMap?"#define USE_TRANSMISSIONMAP":"",i.thicknessMap?"#define USE_THICKNESSMAP":"",i.vertexTangents&&i.flatShading===!1?"#define USE_TANGENT":"",i.vertexColors||i.instancingColor||i.batchingColor?"#define USE_COLOR":"",i.vertexAlphas?"#define USE_COLOR_ALPHA":"",i.vertexUv1s?"#define USE_UV1":"",i.vertexUv2s?"#define USE_UV2":"",i.vertexUv3s?"#define USE_UV3":"",i.pointsUvs?"#define USE_POINTS_UV":"",i.gradientMap?"#define USE_GRADIENTMAP":"",i.flatShading?"#define FLAT_SHADED":"",i.doubleSided?"#define DOUBLE_SIDED":"",i.flipSided?"#define FLIP_SIDED":"",i.shadowMapEnabled?"#define USE_SHADOWMAP":"",i.shadowMapEnabled?"#define "+l:"",i.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",i.numLightProbes>0?"#define USE_LIGHT_PROBES":"",i.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",i.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",i.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",i.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",i.toneMapping!==sr?"#define TONE_MAPPING":"",i.toneMapping!==sr?He.tonemapping_pars_fragment:"",i.toneMapping!==sr?O_("toneMapping",i.toneMapping):"",i.dithering?"#define DITHERING":"",i.opaque?"#define OPAQUE":"",He.colorspace_pars_fragment,U_("linearToOutputTexel",i.outputColorSpace),F_(),i.useDepthPacking?"#define DEPTH_PACKING "+i.depthPacking:"",`
`].filter(On).join(`
`)),s=_l(s),s=Eh(s,i),s=Th(s,i),o=_l(o),o=Eh(o,i),o=Th(o,i),s=Ah(s),o=Ah(o),i.isRawShaderMaterial!==!0&&(y=`#version 300 es
`,g=[p,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+g,m=["#define varying in",i.glslVersion===bc?"":"layout(location = 0) out highp vec4 pc_fragColor;",i.glslVersion===bc?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+m);let x=y+g+s,_=y+m+o,S=wh(n,n.VERTEX_SHADER,x),E=wh(n,n.FRAGMENT_SHADER,_);n.attachShader(f,S),n.attachShader(f,E),i.index0AttributeName!==void 0?n.bindAttribLocation(f,0,i.index0AttributeName):i.morphTargets===!0&&n.bindAttribLocation(f,0,"position"),n.linkProgram(f);function A(R){if(e.debug.checkShaderErrors){let G=n.getProgramInfoLog(f)||"",V=n.getShaderInfoLog(S)||"",W=n.getShaderInfoLog(E)||"",O=G.trim(),z=V.trim(),j=W.trim(),H=!0,$=!0;if(n.getProgramParameter(f,n.LINK_STATUS)===!1)if(H=!1,typeof e.debug.onShaderError=="function")e.debug.onShaderError(n,f,S,E);else{let U=Sh(n,S,"vertex"),se=Sh(n,E,"fragment");console.error("THREE.WebGLProgram: Shader Error "+n.getError()+" - VALIDATE_STATUS "+n.getProgramParameter(f,n.VALIDATE_STATUS)+`

Material Name: `+R.name+`
Material Type: `+R.type+`

Program Info Log: `+O+`
`+U+`
`+se)}else O!==""?console.warn("THREE.WebGLProgram: Program Info Log:",O):(z===""||j==="")&&($=!1);$&&(R.diagnostics={runnable:H,programLog:O,vertexShader:{log:z,prefix:g},fragmentShader:{log:j,prefix:m}})}n.deleteShader(S),n.deleteShader(E),C=new es(n,f),b=z_(n,f)}let C;this.getUniforms=function(){return C===void 0&&A(this),C};let b;this.getAttributes=function(){return b===void 0&&A(this),b};let w=i.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return w===!1&&(w=n.getProgramParameter(f,L_)),w},this.destroy=function(){r.releaseStatesOfProgram(this),n.deleteProgram(f),this.program=void 0},this.type=i.shaderType,this.name=i.shaderName,this.id=P_++,this.cacheKey=t,this.usedTimes=1,this.program=f,this.vertexShader=S,this.fragmentShader=E,this}function tx(e,t,i,r,n,a,s){let o=new du,l=new Q_,c=new Set,h=[],u=n.logarithmicDepthBuffer,d=n.vertexTextures,p=n.precision,v={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function f(b){return c.add(b),b===0?"uv":`uv${b}`}function g(b,w,R,G,V){let W=G.fog,O=V.geometry,z=b.isMeshStandardMaterial?G.environment:null,j=(b.isMeshStandardMaterial?i:t).get(b.envMap||z),H=j&&j.mapping===us?j.image.height:null,$=v[b.type];b.precision!==null&&(p=n.getMaxPrecision(b.precision),p!==b.precision&&console.warn("THREE.WebGLProgram.getParameters:",b.precision,"not supported, using",p,"instead."));let U=O.morphAttributes.position||O.morphAttributes.normal||O.morphAttributes.color,se=U!==void 0?U.length:0,ie=0;O.morphAttributes.position!==void 0&&(ie=1),O.morphAttributes.normal!==void 0&&(ie=2),O.morphAttributes.color!==void 0&&(ie=3);let le,ae,N,Y;if($){let rt=Si[$];le=rt.vertexShader,ae=rt.fragmentShader}else le=b.vertexShader,ae=b.fragmentShader,l.update(b),N=l.getVertexShaderID(b),Y=l.getFragmentShaderID(b);let J=e.getRenderTarget(),de=e.state.buffers.depth.getReversed(),te=V.isInstancedMesh===!0,pe=V.isBatchedMesh===!0,$e=!!b.map,L=!!b.matcap,We=!!j,Be=!!b.aoMap,Qe=!!b.lightMap,Ee=!!b.bumpMap,tt=!!b.normalMap,Re=!!b.displacementMap,Le=!!b.emissiveMap,ot=!!b.metalnessMap,lt=!!b.roughnessMap,it=b.anisotropy>0,I=b.clearcoat>0,M=b.dispersion>0,B=b.iridescence>0,Z=b.sheen>0,ee=b.transmission>0,K=it&&!!b.anisotropyMap,be=I&&!!b.clearcoatMap,ce=I&&!!b.clearcoatNormalMap,Te=I&&!!b.clearcoatRoughnessMap,Ce=B&&!!b.iridescenceMap,oe=B&&!!b.iridescenceThicknessMap,fe=Z&&!!b.sheenColorMap,Ne=Z&&!!b.sheenRoughnessMap,Ie=!!b.specularMap,ge=!!b.specularColorMap,Xe=!!b.specularIntensityMap,D=ee&&!!b.transmissionMap,me=ee&&!!b.thicknessMap,he=!!b.gradientMap,Se=!!b.alphaMap,ne=b.alphaTest>0,Q=!!b.alphaHash,Me=!!b.extensions,Pe=sr;b.toneMapped&&(J===null||J.isXRRenderTarget===!0)&&(Pe=e.toneMapping);let xt={shaderID:$,shaderType:b.type,shaderName:b.name,vertexShader:le,fragmentShader:ae,defines:b.defines,customVertexShaderID:N,customFragmentShaderID:Y,isRawShaderMaterial:b.isRawShaderMaterial===!0,glslVersion:b.glslVersion,precision:p,batching:pe,batchingColor:pe&&V._colorsTexture!==null,instancing:te,instancingColor:te&&V.instanceColor!==null,instancingMorph:te&&V.morphTexture!==null,supportsVertexTextures:d,outputColorSpace:J===null?e.outputColorSpace:J.isXRRenderTarget===!0?J.texture.colorSpace:zt,alphaToCoverage:!!b.alphaToCoverage,map:$e,matcap:L,envMap:We,envMapMode:We&&j.mapping,envMapCubeUVHeight:H,aoMap:Be,lightMap:Qe,bumpMap:Ee,normalMap:tt,displacementMap:d&&Re,emissiveMap:Le,normalMapObjectSpace:tt&&b.normalMapType===Fp,normalMapTangentSpace:tt&&b.normalMapType===ds,metalnessMap:ot,roughnessMap:lt,anisotropy:it,anisotropyMap:K,clearcoat:I,clearcoatMap:be,clearcoatNormalMap:ce,clearcoatRoughnessMap:Te,dispersion:M,iridescence:B,iridescenceMap:Ce,iridescenceThicknessMap:oe,sheen:Z,sheenColorMap:fe,sheenRoughnessMap:Ne,specularMap:Ie,specularColorMap:ge,specularIntensityMap:Xe,transmission:ee,transmissionMap:D,thicknessMap:me,gradientMap:he,opaque:b.transparent===!1&&b.blending===on&&b.alphaToCoverage===!1,alphaMap:Se,alphaTest:ne,alphaHash:Q,combine:b.combine,mapUv:$e&&f(b.map.channel),aoMapUv:Be&&f(b.aoMap.channel),lightMapUv:Qe&&f(b.lightMap.channel),bumpMapUv:Ee&&f(b.bumpMap.channel),normalMapUv:tt&&f(b.normalMap.channel),displacementMapUv:Re&&f(b.displacementMap.channel),emissiveMapUv:Le&&f(b.emissiveMap.channel),metalnessMapUv:ot&&f(b.metalnessMap.channel),roughnessMapUv:lt&&f(b.roughnessMap.channel),anisotropyMapUv:K&&f(b.anisotropyMap.channel),clearcoatMapUv:be&&f(b.clearcoatMap.channel),clearcoatNormalMapUv:ce&&f(b.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Te&&f(b.clearcoatRoughnessMap.channel),iridescenceMapUv:Ce&&f(b.iridescenceMap.channel),iridescenceThicknessMapUv:oe&&f(b.iridescenceThicknessMap.channel),sheenColorMapUv:fe&&f(b.sheenColorMap.channel),sheenRoughnessMapUv:Ne&&f(b.sheenRoughnessMap.channel),specularMapUv:Ie&&f(b.specularMap.channel),specularColorMapUv:ge&&f(b.specularColorMap.channel),specularIntensityMapUv:Xe&&f(b.specularIntensityMap.channel),transmissionMapUv:D&&f(b.transmissionMap.channel),thicknessMapUv:me&&f(b.thicknessMap.channel),alphaMapUv:Se&&f(b.alphaMap.channel),vertexTangents:!!O.attributes.tangent&&(tt||it),vertexColors:b.vertexColors,vertexAlphas:b.vertexColors===!0&&!!O.attributes.color&&O.attributes.color.itemSize===4,pointsUvs:V.isPoints===!0&&!!O.attributes.uv&&($e||Se),fog:!!W,useFog:b.fog===!0,fogExp2:!!W&&W.isFogExp2,flatShading:b.flatShading===!0&&b.wireframe===!1,sizeAttenuation:b.sizeAttenuation===!0,logarithmicDepthBuffer:u,reversedDepthBuffer:de,skinning:V.isSkinnedMesh===!0,morphTargets:O.morphAttributes.position!==void 0,morphNormals:O.morphAttributes.normal!==void 0,morphColors:O.morphAttributes.color!==void 0,morphTargetsCount:se,morphTextureStride:ie,numDirLights:w.directional.length,numPointLights:w.point.length,numSpotLights:w.spot.length,numSpotLightMaps:w.spotLightMap.length,numRectAreaLights:w.rectArea.length,numHemiLights:w.hemi.length,numDirLightShadows:w.directionalShadowMap.length,numPointLightShadows:w.pointShadowMap.length,numSpotLightShadows:w.spotShadowMap.length,numSpotLightShadowsWithMaps:w.numSpotLightShadowsWithMaps,numLightProbes:w.numLightProbes,numClippingPlanes:s.numPlanes,numClipIntersection:s.numIntersection,dithering:b.dithering,shadowMapEnabled:e.shadowMap.enabled&&R.length>0,shadowMapType:e.shadowMap.type,toneMapping:Pe,decodeVideoTexture:$e&&b.map.isVideoTexture===!0&&ke.getTransfer(b.map.colorSpace)===nt,decodeVideoTextureEmissive:Le&&b.emissiveMap.isVideoTexture===!0&&ke.getTransfer(b.emissiveMap.colorSpace)===nt,premultipliedAlpha:b.premultipliedAlpha,doubleSided:b.side===Ei,flipSided:b.side===kt,useDepthPacking:b.depthPacking>=0,depthPacking:b.depthPacking||0,index0AttributeName:b.index0AttributeName,extensionClipCullDistance:Me&&b.extensions.clipCullDistance===!0&&r.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Me&&b.extensions.multiDraw===!0||pe)&&r.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:r.has("KHR_parallel_shader_compile"),customProgramCacheKey:b.customProgramCacheKey()};return xt.vertexUv1s=c.has(1),xt.vertexUv2s=c.has(2),xt.vertexUv3s=c.has(3),c.clear(),xt}function m(b){let w=[];if(b.shaderID?w.push(b.shaderID):(w.push(b.customVertexShaderID),w.push(b.customFragmentShaderID)),b.defines!==void 0)for(let R in b.defines)w.push(R),w.push(b.defines[R]);return b.isRawShaderMaterial===!1&&(y(w,b),x(w,b),w.push(e.outputColorSpace)),w.push(b.customProgramCacheKey),w.join()}function y(b,w){b.push(w.precision),b.push(w.outputColorSpace),b.push(w.envMapMode),b.push(w.envMapCubeUVHeight),b.push(w.mapUv),b.push(w.alphaMapUv),b.push(w.lightMapUv),b.push(w.aoMapUv),b.push(w.bumpMapUv),b.push(w.normalMapUv),b.push(w.displacementMapUv),b.push(w.emissiveMapUv),b.push(w.metalnessMapUv),b.push(w.roughnessMapUv),b.push(w.anisotropyMapUv),b.push(w.clearcoatMapUv),b.push(w.clearcoatNormalMapUv),b.push(w.clearcoatRoughnessMapUv),b.push(w.iridescenceMapUv),b.push(w.iridescenceThicknessMapUv),b.push(w.sheenColorMapUv),b.push(w.sheenRoughnessMapUv),b.push(w.specularMapUv),b.push(w.specularColorMapUv),b.push(w.specularIntensityMapUv),b.push(w.transmissionMapUv),b.push(w.thicknessMapUv),b.push(w.combine),b.push(w.fogExp2),b.push(w.sizeAttenuation),b.push(w.morphTargetsCount),b.push(w.morphAttributeCount),b.push(w.numDirLights),b.push(w.numPointLights),b.push(w.numSpotLights),b.push(w.numSpotLightMaps),b.push(w.numHemiLights),b.push(w.numRectAreaLights),b.push(w.numDirLightShadows),b.push(w.numPointLightShadows),b.push(w.numSpotLightShadows),b.push(w.numSpotLightShadowsWithMaps),b.push(w.numLightProbes),b.push(w.shadowMapType),b.push(w.toneMapping),b.push(w.numClippingPlanes),b.push(w.numClipIntersection),b.push(w.depthPacking)}function x(b,w){o.disableAll(),w.supportsVertexTextures&&o.enable(0),w.instancing&&o.enable(1),w.instancingColor&&o.enable(2),w.instancingMorph&&o.enable(3),w.matcap&&o.enable(4),w.envMap&&o.enable(5),w.normalMapObjectSpace&&o.enable(6),w.normalMapTangentSpace&&o.enable(7),w.clearcoat&&o.enable(8),w.iridescence&&o.enable(9),w.alphaTest&&o.enable(10),w.vertexColors&&o.enable(11),w.vertexAlphas&&o.enable(12),w.vertexUv1s&&o.enable(13),w.vertexUv2s&&o.enable(14),w.vertexUv3s&&o.enable(15),w.vertexTangents&&o.enable(16),w.anisotropy&&o.enable(17),w.alphaHash&&o.enable(18),w.batching&&o.enable(19),w.dispersion&&o.enable(20),w.batchingColor&&o.enable(21),w.gradientMap&&o.enable(22),b.push(o.mask),o.disableAll(),w.fog&&o.enable(0),w.useFog&&o.enable(1),w.flatShading&&o.enable(2),w.logarithmicDepthBuffer&&o.enable(3),w.reversedDepthBuffer&&o.enable(4),w.skinning&&o.enable(5),w.morphTargets&&o.enable(6),w.morphNormals&&o.enable(7),w.morphColors&&o.enable(8),w.premultipliedAlpha&&o.enable(9),w.shadowMapEnabled&&o.enable(10),w.doubleSided&&o.enable(11),w.flipSided&&o.enable(12),w.useDepthPacking&&o.enable(13),w.dithering&&o.enable(14),w.transmission&&o.enable(15),w.sheen&&o.enable(16),w.opaque&&o.enable(17),w.pointsUvs&&o.enable(18),w.decodeVideoTexture&&o.enable(19),w.decodeVideoTextureEmissive&&o.enable(20),w.alphaToCoverage&&o.enable(21),b.push(o.mask)}function _(b){let w=v[b.type],R;if(w){let G=Si[w];R=Rf.clone(G.uniforms)}else R=b.uniforms;return R}function S(b,w){let R;for(let G=0,V=h.length;G<V;G++){let W=h[G];if(W.cacheKey===w){R=W,++R.usedTimes;break}}return R===void 0&&(R=new Z_(e,w,b,a),h.push(R)),R}function E(b){if(--b.usedTimes===0){let w=h.indexOf(b);h[w]=h[h.length-1],h.pop(),b.destroy()}}function A(b){l.remove(b)}function C(){l.dispose()}return{getParameters:g,getProgramCacheKey:m,getUniforms:_,acquireProgram:S,releaseProgram:E,releaseShaderCache:A,programs:h,dispose:C}}function ix(){let e=new WeakMap;function t(s){return e.has(s)}function i(s){let o=e.get(s);return o===void 0&&(o={},e.set(s,o)),o}function r(s){e.delete(s)}function n(s,o,l){e.get(s)[o]=l}function a(){e=new WeakMap}return{has:t,get:i,remove:r,update:n,dispose:a}}function rx(e,t){return e.groupOrder!==t.groupOrder?e.groupOrder-t.groupOrder:e.renderOrder!==t.renderOrder?e.renderOrder-t.renderOrder:e.material.id!==t.material.id?e.material.id-t.material.id:e.z!==t.z?e.z-t.z:e.id-t.id}function Ch(e,t){return e.groupOrder!==t.groupOrder?e.groupOrder-t.groupOrder:e.renderOrder!==t.renderOrder?e.renderOrder-t.renderOrder:e.z!==t.z?t.z-e.z:e.id-t.id}function Ih(){let e=[],t=0,i=[],r=[],n=[];function a(){t=0,i.length=0,r.length=0,n.length=0}function s(u,d,p,v,f,g){let m=e[t];return m===void 0?(m={id:u.id,object:u,geometry:d,material:p,groupOrder:v,renderOrder:u.renderOrder,z:f,group:g},e[t]=m):(m.id=u.id,m.object=u,m.geometry=d,m.material=p,m.groupOrder=v,m.renderOrder=u.renderOrder,m.z=f,m.group=g),t++,m}function o(u,d,p,v,f,g){let m=s(u,d,p,v,f,g);p.transmission>0?r.push(m):p.transparent===!0?n.push(m):i.push(m)}function l(u,d,p,v,f,g){let m=s(u,d,p,v,f,g);p.transmission>0?r.unshift(m):p.transparent===!0?n.unshift(m):i.unshift(m)}function c(u,d){i.length>1&&i.sort(u||rx),r.length>1&&r.sort(d||Ch),n.length>1&&n.sort(d||Ch)}function h(){for(let u=t,d=e.length;u<d;u++){let p=e[u];if(p.id===null)break;p.id=null,p.object=null,p.geometry=null,p.material=null,p.group=null}}return{opaque:i,transmissive:r,transparent:n,init:a,push:o,unshift:l,finish:h,sort:c}}function nx(){let e=new WeakMap;function t(r,n){let a=e.get(r),s;return a===void 0?(s=new Ih,e.set(r,[s])):n>=a.length?(s=new Ih,a.push(s)):s=a[n],s}function i(){e=new WeakMap}return{get:t,dispose:i}}function ax(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let i;switch(t.type){case"DirectionalLight":i={direction:new P,color:new _e};break;case"SpotLight":i={position:new P,direction:new P,color:new _e,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":i={position:new P,color:new _e,distance:0,decay:0};break;case"HemisphereLight":i={direction:new P,skyColor:new _e,groundColor:new _e};break;case"RectAreaLight":i={color:new _e,position:new P,halfWidth:new P,halfHeight:new P};break}return e[t.id]=i,i}}}function sx(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let i;switch(t.type){case"DirectionalLight":i={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new De};break;case"SpotLight":i={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new De};break;case"PointLight":i={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new De,shadowCameraNear:1,shadowCameraFar:1e3};break}return e[t.id]=i,i}}}function lx(e,t){return(t.castShadow?2:0)-(e.castShadow?2:0)+(t.map?1:0)-(e.map?1:0)}function cx(e){let t=new ax,i=sx(),r={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)r.probe.push(new P);let n=new P,a=new we,s=new we;function o(c){let h=0,u=0,d=0;for(let b=0;b<9;b++)r.probe[b].set(0,0,0);let p=0,v=0,f=0,g=0,m=0,y=0,x=0,_=0,S=0,E=0,A=0;c.sort(lx);for(let b=0,w=c.length;b<w;b++){let R=c[b],G=R.color,V=R.intensity,W=R.distance,O=R.shadow&&R.shadow.map?R.shadow.map.texture:null;if(R.isAmbientLight)h+=G.r*V,u+=G.g*V,d+=G.b*V;else if(R.isLightProbe){for(let z=0;z<9;z++)r.probe[z].addScaledVector(R.sh.coefficients[z],V);A++}else if(R.isDirectionalLight){let z=t.get(R);if(z.color.copy(R.color).multiplyScalar(R.intensity),R.castShadow){let j=R.shadow,H=i.get(R);H.shadowIntensity=j.intensity,H.shadowBias=j.bias,H.shadowNormalBias=j.normalBias,H.shadowRadius=j.radius,H.shadowMapSize=j.mapSize,r.directionalShadow[p]=H,r.directionalShadowMap[p]=O,r.directionalShadowMatrix[p]=R.shadow.matrix,y++}r.directional[p]=z,p++}else if(R.isSpotLight){let z=t.get(R);z.position.setFromMatrixPosition(R.matrixWorld),z.color.copy(G).multiplyScalar(V),z.distance=W,z.coneCos=Math.cos(R.angle),z.penumbraCos=Math.cos(R.angle*(1-R.penumbra)),z.decay=R.decay,r.spot[f]=z;let j=R.shadow;if(R.map&&(r.spotLightMap[S]=R.map,S++,j.updateMatrices(R),R.castShadow&&E++),r.spotLightMatrix[f]=j.matrix,R.castShadow){let H=i.get(R);H.shadowIntensity=j.intensity,H.shadowBias=j.bias,H.shadowNormalBias=j.normalBias,H.shadowRadius=j.radius,H.shadowMapSize=j.mapSize,r.spotShadow[f]=H,r.spotShadowMap[f]=O,_++}f++}else if(R.isRectAreaLight){let z=t.get(R);z.color.copy(G).multiplyScalar(V),z.halfWidth.set(R.width*.5,0,0),z.halfHeight.set(0,R.height*.5,0),r.rectArea[g]=z,g++}else if(R.isPointLight){let z=t.get(R);if(z.color.copy(R.color).multiplyScalar(R.intensity),z.distance=R.distance,z.decay=R.decay,R.castShadow){let j=R.shadow,H=i.get(R);H.shadowIntensity=j.intensity,H.shadowBias=j.bias,H.shadowNormalBias=j.normalBias,H.shadowRadius=j.radius,H.shadowMapSize=j.mapSize,H.shadowCameraNear=j.camera.near,H.shadowCameraFar=j.camera.far,r.pointShadow[v]=H,r.pointShadowMap[v]=O,r.pointShadowMatrix[v]=R.shadow.matrix,x++}r.point[v]=z,v++}else if(R.isHemisphereLight){let z=t.get(R);z.skyColor.copy(R.color).multiplyScalar(V),z.groundColor.copy(R.groundColor).multiplyScalar(V),r.hemi[m]=z,m++}}g>0&&(e.has("OES_texture_float_linear")===!0?(r.rectAreaLTC1=ue.LTC_FLOAT_1,r.rectAreaLTC2=ue.LTC_FLOAT_2):(r.rectAreaLTC1=ue.LTC_HALF_1,r.rectAreaLTC2=ue.LTC_HALF_2)),r.ambient[0]=h,r.ambient[1]=u,r.ambient[2]=d;let C=r.hash;(C.directionalLength!==p||C.pointLength!==v||C.spotLength!==f||C.rectAreaLength!==g||C.hemiLength!==m||C.numDirectionalShadows!==y||C.numPointShadows!==x||C.numSpotShadows!==_||C.numSpotMaps!==S||C.numLightProbes!==A)&&(r.directional.length=p,r.spot.length=f,r.rectArea.length=g,r.point.length=v,r.hemi.length=m,r.directionalShadow.length=y,r.directionalShadowMap.length=y,r.pointShadow.length=x,r.pointShadowMap.length=x,r.spotShadow.length=_,r.spotShadowMap.length=_,r.directionalShadowMatrix.length=y,r.pointShadowMatrix.length=x,r.spotLightMatrix.length=_+S-E,r.spotLightMap.length=S,r.numSpotLightShadowsWithMaps=E,r.numLightProbes=A,C.directionalLength=p,C.pointLength=v,C.spotLength=f,C.rectAreaLength=g,C.hemiLength=m,C.numDirectionalShadows=y,C.numPointShadows=x,C.numSpotShadows=_,C.numSpotMaps=S,C.numLightProbes=A,r.version=ox++)}function l(c,h){let u=0,d=0,p=0,v=0,f=0,g=h.matrixWorldInverse;for(let m=0,y=c.length;m<y;m++){let x=c[m];if(x.isDirectionalLight){let _=r.directional[u];_.direction.setFromMatrixPosition(x.matrixWorld),n.setFromMatrixPosition(x.target.matrixWorld),_.direction.sub(n),_.direction.transformDirection(g),u++}else if(x.isSpotLight){let _=r.spot[p];_.position.setFromMatrixPosition(x.matrixWorld),_.position.applyMatrix4(g),_.direction.setFromMatrixPosition(x.matrixWorld),n.setFromMatrixPosition(x.target.matrixWorld),_.direction.sub(n),_.direction.transformDirection(g),p++}else if(x.isRectAreaLight){let _=r.rectArea[v];_.position.setFromMatrixPosition(x.matrixWorld),_.position.applyMatrix4(g),s.identity(),a.copy(x.matrixWorld),a.premultiply(g),s.extractRotation(a),_.halfWidth.set(x.width*.5,0,0),_.halfHeight.set(0,x.height*.5,0),_.halfWidth.applyMatrix4(s),_.halfHeight.applyMatrix4(s),v++}else if(x.isPointLight){let _=r.point[d];_.position.setFromMatrixPosition(x.matrixWorld),_.position.applyMatrix4(g),d++}else if(x.isHemisphereLight){let _=r.hemi[f];_.direction.setFromMatrixPosition(x.matrixWorld),_.direction.transformDirection(g),f++}}}return{setup:o,setupView:l,state:r}}function Lh(e){let t=new cx(e),i=[],r=[];function n(h){c.camera=h,i.length=0,r.length=0}function a(h){i.push(h)}function s(h){r.push(h)}function o(){t.setup(i)}function l(h){t.setupView(i,h)}let c={lightsArray:i,shadowsArray:r,camera:null,lights:t,transmissionRenderTarget:{}};return{init:n,state:c,setupLights:o,setupLightsView:l,pushLight:a,pushShadow:s}}function hx(e){let t=new WeakMap;function i(n,a=0){let s=t.get(n),o;return s===void 0?(o=new Lh(e),t.set(n,[o])):a>=s.length?(o=new Lh(e),s.push(o)):o=s[a],o}function r(){t=new WeakMap}return{get:i,dispose:r}}function px(e,t,i){let r=new Ul,n=new De,a=new De,s=new Ye,o=new cm({depthPacking:Op}),l=new hm,c={},h=i.maxTextureSize,u={[Ai]:kt,[kt]:Ai,[Ei]:Ei},d=new or({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new De},radius:{value:4}},vertexShader:ux,fragmentShader:dx}),p=d.clone();p.defines.HORIZONTAL_PASS=1;let v=new It;v.setAttribute("position",new Et(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let f=new pt(v,d),g=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=jh;let m=this.type;this.render=function(E,A,C){if(g.enabled===!1||g.autoUpdate===!1&&g.needsUpdate===!1||E.length===0)return;let b=e.getRenderTarget(),w=e.getActiveCubeFace(),R=e.getActiveMipmapLevel(),G=e.state;G.setBlending(ar),G.buffers.depth.getReversed()===!0?G.buffers.color.setClear(0,0,0,0):G.buffers.color.setClear(1,1,1,1),G.buffers.depth.setTest(!0),G.setScissorTest(!1);let V=m!==Vi&&this.type===Vi,W=m===Vi&&this.type!==Vi;for(let O=0,z=E.length;O<z;O++){let j=E[O],H=j.shadow;if(H===void 0){console.warn("THREE.WebGLShadowMap:",j,"has no shadow.");continue}if(H.autoUpdate===!1&&H.needsUpdate===!1)continue;n.copy(H.mapSize);let $=H.getFrameExtents();if(n.multiply($),a.copy(H.mapSize),(n.x>h||n.y>h)&&(n.x>h&&(a.x=Math.floor(h/$.x),n.x=a.x*$.x,H.mapSize.x=a.x),n.y>h&&(a.y=Math.floor(h/$.y),n.y=a.y*$.y,H.mapSize.y=a.y)),H.map===null||V===!0||W===!0){let se=this.type!==Vi?{minFilter:Bt,magFilter:Bt}:{};H.map!==null&&H.map.dispose(),H.map=new Ir(n.x,n.y,se),H.map.texture.name=j.name+".shadowMap",H.camera.updateProjectionMatrix()}e.setRenderTarget(H.map),e.clear();let U=H.getViewportCount();for(let se=0;se<U;se++){let ie=H.getViewport(se);s.set(a.x*ie.x,a.y*ie.y,a.x*ie.z,a.y*ie.w),G.viewport(s),H.updateMatrices(j,se),r=H.getFrustum(),_(A,C,H.camera,j,this.type)}H.isPointLightShadow!==!0&&this.type===Vi&&y(H,C),H.needsUpdate=!1}m=this.type,g.needsUpdate=!1,e.setRenderTarget(b,w,R)};function y(E,A){let C=t.update(f);d.defines.VSM_SAMPLES!==E.blurSamples&&(d.defines.VSM_SAMPLES=E.blurSamples,p.defines.VSM_SAMPLES=E.blurSamples,d.needsUpdate=!0,p.needsUpdate=!0),E.mapPass===null&&(E.mapPass=new Ir(n.x,n.y)),d.uniforms.shadow_pass.value=E.map.texture,d.uniforms.resolution.value=E.mapSize,d.uniforms.radius.value=E.radius,e.setRenderTarget(E.mapPass),e.clear(),e.renderBufferDirect(A,null,C,d,f,null),p.uniforms.shadow_pass.value=E.mapPass.texture,p.uniforms.resolution.value=E.mapSize,p.uniforms.radius.value=E.radius,e.setRenderTarget(E.map),e.clear(),e.renderBufferDirect(A,null,C,p,f,null)}function x(E,A,C,b){let w=null,R=C.isPointLight===!0?E.customDistanceMaterial:E.customDepthMaterial;if(R!==void 0)w=R;else if(w=C.isPointLight===!0?l:o,e.localClippingEnabled&&A.clipShadows===!0&&Array.isArray(A.clippingPlanes)&&A.clippingPlanes.length!==0||A.displacementMap&&A.displacementScale!==0||A.alphaMap&&A.alphaTest>0||A.map&&A.alphaTest>0||A.alphaToCoverage===!0){let G=w.uuid,V=A.uuid,W=c[G];W===void 0&&(W={},c[G]=W);let O=W[V];O===void 0&&(O=w.clone(),W[V]=O,A.addEventListener("dispose",S)),w=O}if(w.visible=A.visible,w.wireframe=A.wireframe,b===Vi?w.side=A.shadowSide!==null?A.shadowSide:A.side:w.side=A.shadowSide!==null?A.shadowSide:u[A.side],w.alphaMap=A.alphaMap,w.alphaTest=A.alphaToCoverage===!0?.5:A.alphaTest,w.map=A.map,w.clipShadows=A.clipShadows,w.clippingPlanes=A.clippingPlanes,w.clipIntersection=A.clipIntersection,w.displacementMap=A.displacementMap,w.displacementScale=A.displacementScale,w.displacementBias=A.displacementBias,w.wireframeLinewidth=A.wireframeLinewidth,w.linewidth=A.linewidth,C.isPointLight===!0&&w.isMeshDistanceMaterial===!0){let G=e.properties.get(w);G.light=C}return w}function _(E,A,C,b,w){if(E.visible===!1)return;if(E.layers.test(A.layers)&&(E.isMesh||E.isLine||E.isPoints)&&(E.castShadow||E.receiveShadow&&w===Vi)&&(!E.frustumCulled||r.intersectsObject(E))){E.modelViewMatrix.multiplyMatrices(C.matrixWorldInverse,E.matrixWorld);let G=t.update(E),V=E.material;if(Array.isArray(V)){let W=G.groups;for(let O=0,z=W.length;O<z;O++){let j=W[O],H=V[j.materialIndex];if(H&&H.visible){let $=x(E,H,b,w);E.onBeforeShadow(e,E,A,C,G,$,j),e.renderBufferDirect(C,null,G,$,E,j),E.onAfterShadow(e,E,A,C,G,$,j)}}}else if(V.visible){let W=x(E,V,b,w);E.onBeforeShadow(e,E,A,C,G,W,null),e.renderBufferDirect(C,null,G,W,E,null),E.onAfterShadow(e,E,A,C,G,W,null)}}let R=E.children;for(let G=0,V=R.length;G<V;G++)_(R[G],A,C,b,w)}function S(E){E.target.removeEventListener("dispose",S);for(let A in c){let C=c[A],b=E.target.uuid;b in C&&(C[b].dispose(),delete C[b])}}}function mx(e,t){function i(){let D=!1,me=new Ye,he=null,Se=new Ye(0,0,0,0);return{setMask:function(ne){he!==ne&&!D&&(e.colorMask(ne,ne,ne,ne),he=ne)},setLocked:function(ne){D=ne},setClear:function(ne,Q,Me,Pe,xt){xt===!0&&(ne*=Pe,Q*=Pe,Me*=Pe),me.set(ne,Q,Me,Pe),Se.equals(me)===!1&&(e.clearColor(ne,Q,Me,Pe),Se.copy(me))},reset:function(){D=!1,he=null,Se.set(-1,0,0,0)}}}function r(){let D=!1,me=!1,he=null,Se=null,ne=null;return{setReversed:function(Q){if(me!==Q){let Me=t.get("EXT_clip_control");Q?Me.clipControlEXT(Me.LOWER_LEFT_EXT,Me.ZERO_TO_ONE_EXT):Me.clipControlEXT(Me.LOWER_LEFT_EXT,Me.NEGATIVE_ONE_TO_ONE_EXT),me=Q;let Pe=ne;ne=null,this.setClear(Pe)}},getReversed:function(){return me},setTest:function(Q){Q?J(e.DEPTH_TEST):de(e.DEPTH_TEST)},setMask:function(Q){he!==Q&&!D&&(e.depthMask(Q),he=Q)},setFunc:function(Q){if(me&&(Q=fx[Q]),Se!==Q){switch(Q){case Ro:e.depthFunc(e.NEVER);break;case Co:e.depthFunc(e.ALWAYS);break;case Io:e.depthFunc(e.LESS);break;case hn:e.depthFunc(e.LEQUAL);break;case Lo:e.depthFunc(e.EQUAL);break;case Po:e.depthFunc(e.GEQUAL);break;case Do:e.depthFunc(e.GREATER);break;case No:e.depthFunc(e.NOTEQUAL);break;default:e.depthFunc(e.LEQUAL)}Se=Q}},setLocked:function(Q){D=Q},setClear:function(Q){ne!==Q&&(me&&(Q=1-Q),e.clearDepth(Q),ne=Q)},reset:function(){D=!1,he=null,Se=null,ne=null,me=!1}}}function n(){let D=!1,me=null,he=null,Se=null,ne=null,Q=null,Me=null,Pe=null,xt=null;return{setTest:function(rt){D||(rt?J(e.STENCIL_TEST):de(e.STENCIL_TEST))},setMask:function(rt){me!==rt&&!D&&(e.stencilMask(rt),me=rt)},setFunc:function(rt,xi,yi){(he!==rt||Se!==xi||ne!==yi)&&(e.stencilFunc(rt,xi,yi),he=rt,Se=xi,ne=yi)},setOp:function(rt,xi,yi){(Q!==rt||Me!==xi||Pe!==yi)&&(e.stencilOp(rt,xi,yi),Q=rt,Me=xi,Pe=yi)},setLocked:function(rt){D=rt},setClear:function(rt){xt!==rt&&(e.clearStencil(rt),xt=rt)},reset:function(){D=!1,me=null,he=null,Se=null,ne=null,Q=null,Me=null,Pe=null,xt=null}}}let a=new i,s=new r,o=new n,l=new WeakMap,c=new WeakMap,h={},u={},d=new WeakMap,p=[],v=null,f=!1,g=null,m=null,y=null,x=null,_=null,S=null,E=null,A=new _e(0,0,0),C=0,b=!1,w=null,R=null,G=null,V=null,W=null,O=e.getParameter(e.MAX_COMBINED_TEXTURE_IMAGE_UNITS),z=!1,j=0,H=e.getParameter(e.VERSION);H.indexOf("WebGL")!==-1?(j=parseFloat(/^WebGL (\d)/.exec(H)[1]),z=j>=1):H.indexOf("OpenGL ES")!==-1&&(j=parseFloat(/^OpenGL ES (\d)/.exec(H)[1]),z=j>=2);let $=null,U={},se=e.getParameter(e.SCISSOR_BOX),ie=e.getParameter(e.VIEWPORT),le=new Ye().fromArray(se),ae=new Ye().fromArray(ie);function N(D,me,he,Se){let ne=new Uint8Array(4),Q=e.createTexture();e.bindTexture(D,Q),e.texParameteri(D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(D,e.TEXTURE_MAG_FILTER,e.NEAREST);for(let Me=0;Me<he;Me++)D===e.TEXTURE_3D||D===e.TEXTURE_2D_ARRAY?e.texImage3D(me,0,e.RGBA,1,1,Se,0,e.RGBA,e.UNSIGNED_BYTE,ne):e.texImage2D(me+Me,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,ne);return Q}let Y={};Y[e.TEXTURE_2D]=N(e.TEXTURE_2D,e.TEXTURE_2D,1),Y[e.TEXTURE_CUBE_MAP]=N(e.TEXTURE_CUBE_MAP,e.TEXTURE_CUBE_MAP_POSITIVE_X,6),Y[e.TEXTURE_2D_ARRAY]=N(e.TEXTURE_2D_ARRAY,e.TEXTURE_2D_ARRAY,1,1),Y[e.TEXTURE_3D]=N(e.TEXTURE_3D,e.TEXTURE_3D,1,1),a.setClear(0,0,0,1),s.setClear(1),o.setClear(0),J(e.DEPTH_TEST),s.setFunc(hn),Ee(!1),tt(mc),J(e.CULL_FACE),Be(ar);function J(D){h[D]!==!0&&(e.enable(D),h[D]=!0)}function de(D){h[D]!==!1&&(e.disable(D),h[D]=!1)}function te(D,me){return u[D]!==me?(e.bindFramebuffer(D,me),u[D]=me,D===e.DRAW_FRAMEBUFFER&&(u[e.FRAMEBUFFER]=me),D===e.FRAMEBUFFER&&(u[e.DRAW_FRAMEBUFFER]=me),!0):!1}function pe(D,me){let he=p,Se=!1;if(D){he=d.get(me),he===void 0&&(he=[],d.set(me,he));let ne=D.textures;if(he.length!==ne.length||he[0]!==e.COLOR_ATTACHMENT0){for(let Q=0,Me=ne.length;Q<Me;Q++)he[Q]=e.COLOR_ATTACHMENT0+Q;he.length=ne.length,Se=!0}}else he[0]!==e.BACK&&(he[0]=e.BACK,Se=!0);Se&&e.drawBuffers(he)}function $e(D){return v!==D?(e.useProgram(D),v=D,!0):!1}let L={[wr]:e.FUNC_ADD,[ap]:e.FUNC_SUBTRACT,[sp]:e.FUNC_REVERSE_SUBTRACT};L[op]=e.MIN,L[lp]=e.MAX;let We={[cp]:e.ZERO,[hp]:e.ONE,[up]:e.SRC_COLOR,[To]:e.SRC_ALPHA,[vp]:e.SRC_ALPHA_SATURATE,[mp]:e.DST_COLOR,[pp]:e.DST_ALPHA,[dp]:e.ONE_MINUS_SRC_COLOR,[Ao]:e.ONE_MINUS_SRC_ALPHA,[gp]:e.ONE_MINUS_DST_COLOR,[fp]:e.ONE_MINUS_DST_ALPHA,[_p]:e.CONSTANT_COLOR,[xp]:e.ONE_MINUS_CONSTANT_COLOR,[yp]:e.CONSTANT_ALPHA,[bp]:e.ONE_MINUS_CONSTANT_ALPHA};function Be(D,me,he,Se,ne,Q,Me,Pe,xt,rt){if(D===ar){f===!0&&(de(e.BLEND),f=!1);return}if(f===!1&&(J(e.BLEND),f=!0),D!==np){if(D!==g||rt!==b){if((m!==wr||_!==wr)&&(e.blendEquation(e.FUNC_ADD),m=wr,_=wr),rt)switch(D){case on:e.blendFuncSeparate(e.ONE,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case gc:e.blendFunc(e.ONE,e.ONE);break;case vc:e.blendFuncSeparate(e.ZERO,e.ONE_MINUS_SRC_COLOR,e.ZERO,e.ONE);break;case _c:e.blendFuncSeparate(e.DST_COLOR,e.ONE_MINUS_SRC_ALPHA,e.ZERO,e.ONE);break;default:console.error("THREE.WebGLState: Invalid blending: ",D);break}else switch(D){case on:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case gc:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE,e.ONE,e.ONE);break;case vc:console.error("THREE.WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case _c:console.error("THREE.WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:console.error("THREE.WebGLState: Invalid blending: ",D);break}y=null,x=null,S=null,E=null,A.set(0,0,0),C=0,g=D,b=rt}return}ne=ne||me,Q=Q||he,Me=Me||Se,(me!==m||ne!==_)&&(e.blendEquationSeparate(L[me],L[ne]),m=me,_=ne),(he!==y||Se!==x||Q!==S||Me!==E)&&(e.blendFuncSeparate(We[he],We[Se],We[Q],We[Me]),y=he,x=Se,S=Q,E=Me),(Pe.equals(A)===!1||xt!==C)&&(e.blendColor(Pe.r,Pe.g,Pe.b,xt),A.copy(Pe),C=xt),g=D,b=!1}function Qe(D,me){D.side===Ei?de(e.CULL_FACE):J(e.CULL_FACE);let he=D.side===kt;me&&(he=!he),Ee(he),D.blending===on&&D.transparent===!1?Be(ar):Be(D.blending,D.blendEquation,D.blendSrc,D.blendDst,D.blendEquationAlpha,D.blendSrcAlpha,D.blendDstAlpha,D.blendColor,D.blendAlpha,D.premultipliedAlpha),s.setFunc(D.depthFunc),s.setTest(D.depthTest),s.setMask(D.depthWrite),a.setMask(D.colorWrite);let Se=D.stencilWrite;o.setTest(Se),Se&&(o.setMask(D.stencilWriteMask),o.setFunc(D.stencilFunc,D.stencilRef,D.stencilFuncMask),o.setOp(D.stencilFail,D.stencilZFail,D.stencilZPass)),Le(D.polygonOffset,D.polygonOffsetFactor,D.polygonOffsetUnits),D.alphaToCoverage===!0?J(e.SAMPLE_ALPHA_TO_COVERAGE):de(e.SAMPLE_ALPHA_TO_COVERAGE)}function Ee(D){w!==D&&(D?e.frontFace(e.CW):e.frontFace(e.CCW),w=D)}function tt(D){D!==tp?(J(e.CULL_FACE),D!==R&&(D===mc?e.cullFace(e.BACK):D===ip?e.cullFace(e.FRONT):e.cullFace(e.FRONT_AND_BACK))):de(e.CULL_FACE),R=D}function Re(D){D!==G&&(z&&e.lineWidth(D),G=D)}function Le(D,me,he){D?(J(e.POLYGON_OFFSET_FILL),(V!==me||W!==he)&&(e.polygonOffset(me,he),V=me,W=he)):de(e.POLYGON_OFFSET_FILL)}function ot(D){D?J(e.SCISSOR_TEST):de(e.SCISSOR_TEST)}function lt(D){D===void 0&&(D=e.TEXTURE0+O-1),$!==D&&(e.activeTexture(D),$=D)}function it(D,me,he){he===void 0&&($===null?he=e.TEXTURE0+O-1:he=$);let Se=U[he];Se===void 0&&(Se={type:void 0,texture:void 0},U[he]=Se),(Se.type!==D||Se.texture!==me)&&($!==he&&(e.activeTexture(he),$=he),e.bindTexture(D,me||Y[D]),Se.type=D,Se.texture=me)}function I(){let D=U[$];D!==void 0&&D.type!==void 0&&(e.bindTexture(D.type,null),D.type=void 0,D.texture=void 0)}function M(){try{e.compressedTexImage2D(...arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function B(){try{e.compressedTexImage3D(...arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function Z(){try{e.texSubImage2D(...arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function ee(){try{e.texSubImage3D(...arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function K(){try{e.compressedTexSubImage2D(...arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function be(){try{e.compressedTexSubImage3D(...arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function ce(){try{e.texStorage2D(...arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function Te(){try{e.texStorage3D(...arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function Ce(){try{e.texImage2D(...arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function oe(){try{e.texImage3D(...arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function fe(D){le.equals(D)===!1&&(e.scissor(D.x,D.y,D.z,D.w),le.copy(D))}function Ne(D){ae.equals(D)===!1&&(e.viewport(D.x,D.y,D.z,D.w),ae.copy(D))}function Ie(D,me){let he=c.get(me);he===void 0&&(he=new WeakMap,c.set(me,he));let Se=he.get(D);Se===void 0&&(Se=e.getUniformBlockIndex(me,D.name),he.set(D,Se))}function ge(D,me){let he=c.get(me).get(D);l.get(me)!==he&&(e.uniformBlockBinding(me,he,D.__bindingPointIndex),l.set(me,he))}function Xe(){e.disable(e.BLEND),e.disable(e.CULL_FACE),e.disable(e.DEPTH_TEST),e.disable(e.POLYGON_OFFSET_FILL),e.disable(e.SCISSOR_TEST),e.disable(e.STENCIL_TEST),e.disable(e.SAMPLE_ALPHA_TO_COVERAGE),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ZERO),e.blendFuncSeparate(e.ONE,e.ZERO,e.ONE,e.ZERO),e.blendColor(0,0,0,0),e.colorMask(!0,!0,!0,!0),e.clearColor(0,0,0,0),e.depthMask(!0),e.depthFunc(e.LESS),s.setReversed(!1),e.clearDepth(1),e.stencilMask(4294967295),e.stencilFunc(e.ALWAYS,0,4294967295),e.stencilOp(e.KEEP,e.KEEP,e.KEEP),e.clearStencil(0),e.cullFace(e.BACK),e.frontFace(e.CCW),e.polygonOffset(0,0),e.activeTexture(e.TEXTURE0),e.bindFramebuffer(e.FRAMEBUFFER,null),e.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),e.bindFramebuffer(e.READ_FRAMEBUFFER,null),e.useProgram(null),e.lineWidth(1),e.scissor(0,0,e.canvas.width,e.canvas.height),e.viewport(0,0,e.canvas.width,e.canvas.height),h={},$=null,U={},u={},d=new WeakMap,p=[],v=null,f=!1,g=null,m=null,y=null,x=null,_=null,S=null,E=null,A=new _e(0,0,0),C=0,b=!1,w=null,R=null,G=null,V=null,W=null,le.set(0,0,e.canvas.width,e.canvas.height),ae.set(0,0,e.canvas.width,e.canvas.height),a.reset(),s.reset(),o.reset()}return{buffers:{color:a,depth:s,stencil:o},enable:J,disable:de,bindFramebuffer:te,drawBuffers:pe,useProgram:$e,setBlending:Be,setMaterial:Qe,setFlipSided:Ee,setCullFace:tt,setLineWidth:Re,setPolygonOffset:Le,setScissorTest:ot,activeTexture:lt,bindTexture:it,unbindTexture:I,compressedTexImage2D:M,compressedTexImage3D:B,texImage2D:Ce,texImage3D:oe,updateUBOMapping:Ie,uniformBlockBinding:ge,texStorage2D:ce,texStorage3D:Te,texSubImage2D:Z,texSubImage3D:ee,compressedTexSubImage2D:K,compressedTexSubImage3D:be,scissor:fe,viewport:Ne,reset:Xe}}function gx(e,t,i,r,n,a,s){let o=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new De,h=new WeakMap,u,d=new WeakMap,p=!1;try{p=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function v(I,M){return p?new OffscreenCanvas(I,M):qn("canvas")}function f(I,M,B){let Z=1,ee=it(I);if((ee.width>B||ee.height>B)&&(Z=B/Math.max(ee.width,ee.height)),Z<1)if(typeof HTMLImageElement<"u"&&I instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&I instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&I instanceof ImageBitmap||typeof VideoFrame<"u"&&I instanceof VideoFrame){let K=Math.floor(Z*ee.width),be=Math.floor(Z*ee.height);u===void 0&&(u=v(K,be));let ce=M?v(K,be):u;return ce.width=K,ce.height=be,ce.getContext("2d").drawImage(I,0,0,K,be),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+ee.width+"x"+ee.height+") to ("+K+"x"+be+")."),ce}else return"data"in I&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+ee.width+"x"+ee.height+")."),I;return I}function g(I){return I.generateMipmaps}function m(I){e.generateMipmap(I)}function y(I){return I.isWebGLCubeRenderTarget?e.TEXTURE_CUBE_MAP:I.isWebGL3DRenderTarget?e.TEXTURE_3D:I.isWebGLArrayRenderTarget||I.isCompressedArrayTexture?e.TEXTURE_2D_ARRAY:e.TEXTURE_2D}function x(I,M,B,Z,ee=!1){if(I!==null){if(e[I]!==void 0)return e[I];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+I+"'")}let K=M;if(M===e.RED&&(B===e.FLOAT&&(K=e.R32F),B===e.HALF_FLOAT&&(K=e.R16F),B===e.UNSIGNED_BYTE&&(K=e.R8)),M===e.RED_INTEGER&&(B===e.UNSIGNED_BYTE&&(K=e.R8UI),B===e.UNSIGNED_SHORT&&(K=e.R16UI),B===e.UNSIGNED_INT&&(K=e.R32UI),B===e.BYTE&&(K=e.R8I),B===e.SHORT&&(K=e.R16I),B===e.INT&&(K=e.R32I)),M===e.RG&&(B===e.FLOAT&&(K=e.RG32F),B===e.HALF_FLOAT&&(K=e.RG16F),B===e.UNSIGNED_BYTE&&(K=e.RG8)),M===e.RG_INTEGER&&(B===e.UNSIGNED_BYTE&&(K=e.RG8UI),B===e.UNSIGNED_SHORT&&(K=e.RG16UI),B===e.UNSIGNED_INT&&(K=e.RG32UI),B===e.BYTE&&(K=e.RG8I),B===e.SHORT&&(K=e.RG16I),B===e.INT&&(K=e.RG32I)),M===e.RGB_INTEGER&&(B===e.UNSIGNED_BYTE&&(K=e.RGB8UI),B===e.UNSIGNED_SHORT&&(K=e.RGB16UI),B===e.UNSIGNED_INT&&(K=e.RGB32UI),B===e.BYTE&&(K=e.RGB8I),B===e.SHORT&&(K=e.RGB16I),B===e.INT&&(K=e.RGB32I)),M===e.RGBA_INTEGER&&(B===e.UNSIGNED_BYTE&&(K=e.RGBA8UI),B===e.UNSIGNED_SHORT&&(K=e.RGBA16UI),B===e.UNSIGNED_INT&&(K=e.RGBA32UI),B===e.BYTE&&(K=e.RGBA8I),B===e.SHORT&&(K=e.RGBA16I),B===e.INT&&(K=e.RGBA32I)),M===e.RGB&&(B===e.UNSIGNED_INT_5_9_9_9_REV&&(K=e.RGB9_E5),B===e.UNSIGNED_INT_10F_11F_11F_REV&&(K=e.R11F_G11F_B10F)),M===e.RGBA){let be=ee?ns:ke.getTransfer(Z);B===e.FLOAT&&(K=e.RGBA32F),B===e.HALF_FLOAT&&(K=e.RGBA16F),B===e.UNSIGNED_BYTE&&(K=be===nt?e.SRGB8_ALPHA8:e.RGBA8),B===e.UNSIGNED_SHORT_4_4_4_4&&(K=e.RGBA4),B===e.UNSIGNED_SHORT_5_5_5_1&&(K=e.RGB5_A1)}return(K===e.R16F||K===e.R32F||K===e.RG16F||K===e.RG32F||K===e.RGBA16F||K===e.RGBA32F)&&t.get("EXT_color_buffer_float"),K}function _(I,M){let B;return I?M===null||M===Cr||M===Vn?B=e.DEPTH24_STENCIL8:M===fi?B=e.DEPTH32F_STENCIL8:M===Hn&&(B=e.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):M===null||M===Cr||M===Vn?B=e.DEPTH_COMPONENT24:M===fi?B=e.DEPTH_COMPONENT32F:M===Hn&&(B=e.DEPTH_COMPONENT16),B}function S(I,M){return g(I)===!0||I.isFramebufferTexture&&I.minFilter!==Bt&&I.minFilter!==Nt?Math.log2(Math.max(M.width,M.height))+1:I.mipmaps!==void 0&&I.mipmaps.length>0?I.mipmaps.length:I.isCompressedTexture&&Array.isArray(I.image)?M.mipmaps.length:1}function E(I){let M=I.target;M.removeEventListener("dispose",E),C(M),M.isVideoTexture&&h.delete(M)}function A(I){let M=I.target;M.removeEventListener("dispose",A),w(M)}function C(I){let M=r.get(I);if(M.__webglInit===void 0)return;let B=I.source,Z=d.get(B);if(Z){let ee=Z[M.__cacheKey];ee.usedTimes--,ee.usedTimes===0&&b(I),Object.keys(Z).length===0&&d.delete(B)}r.remove(I)}function b(I){let M=r.get(I);e.deleteTexture(M.__webglTexture);let B=I.source,Z=d.get(B);delete Z[M.__cacheKey],s.memory.textures--}function w(I){let M=r.get(I);if(I.depthTexture&&(I.depthTexture.dispose(),r.remove(I.depthTexture)),I.isWebGLCubeRenderTarget)for(let Z=0;Z<6;Z++){if(Array.isArray(M.__webglFramebuffer[Z]))for(let ee=0;ee<M.__webglFramebuffer[Z].length;ee++)e.deleteFramebuffer(M.__webglFramebuffer[Z][ee]);else e.deleteFramebuffer(M.__webglFramebuffer[Z]);M.__webglDepthbuffer&&e.deleteRenderbuffer(M.__webglDepthbuffer[Z])}else{if(Array.isArray(M.__webglFramebuffer))for(let Z=0;Z<M.__webglFramebuffer.length;Z++)e.deleteFramebuffer(M.__webglFramebuffer[Z]);else e.deleteFramebuffer(M.__webglFramebuffer);if(M.__webglDepthbuffer&&e.deleteRenderbuffer(M.__webglDepthbuffer),M.__webglMultisampledFramebuffer&&e.deleteFramebuffer(M.__webglMultisampledFramebuffer),M.__webglColorRenderbuffer)for(let Z=0;Z<M.__webglColorRenderbuffer.length;Z++)M.__webglColorRenderbuffer[Z]&&e.deleteRenderbuffer(M.__webglColorRenderbuffer[Z]);M.__webglDepthRenderbuffer&&e.deleteRenderbuffer(M.__webglDepthRenderbuffer)}let B=I.textures;for(let Z=0,ee=B.length;Z<ee;Z++){let K=r.get(B[Z]);K.__webglTexture&&(e.deleteTexture(K.__webglTexture),s.memory.textures--),r.remove(B[Z])}r.remove(I)}let R=0;function G(){R=0}function V(){let I=R;return I>=n.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+I+" texture units while this GPU supports only "+n.maxTextures),R+=1,I}function W(I){let M=[];return M.push(I.wrapS),M.push(I.wrapT),M.push(I.wrapR||0),M.push(I.magFilter),M.push(I.minFilter),M.push(I.anisotropy),M.push(I.internalFormat),M.push(I.format),M.push(I.type),M.push(I.generateMipmaps),M.push(I.premultiplyAlpha),M.push(I.flipY),M.push(I.unpackAlignment),M.push(I.colorSpace),M.join()}function O(I,M){let B=r.get(I);if(I.isVideoTexture&&ot(I),I.isRenderTargetTexture===!1&&I.isExternalTexture!==!0&&I.version>0&&B.__version!==I.version){let Z=I.image;if(Z===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(Z.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{Y(B,I,M);return}}else I.isExternalTexture&&(B.__webglTexture=I.sourceTexture?I.sourceTexture:null);i.bindTexture(e.TEXTURE_2D,B.__webglTexture,e.TEXTURE0+M)}function z(I,M){let B=r.get(I);if(I.isRenderTargetTexture===!1&&I.version>0&&B.__version!==I.version){Y(B,I,M);return}i.bindTexture(e.TEXTURE_2D_ARRAY,B.__webglTexture,e.TEXTURE0+M)}function j(I,M){let B=r.get(I);if(I.isRenderTargetTexture===!1&&I.version>0&&B.__version!==I.version){Y(B,I,M);return}i.bindTexture(e.TEXTURE_3D,B.__webglTexture,e.TEXTURE0+M)}function H(I,M){let B=r.get(I);if(I.version>0&&B.__version!==I.version){J(B,I,M);return}i.bindTexture(e.TEXTURE_CUBE_MAP,B.__webglTexture,e.TEXTURE0+M)}let $={[ji]:e.REPEAT,[ti]:e.CLAMP_TO_EDGE,[is]:e.MIRRORED_REPEAT},U={[Bt]:e.NEAREST,[Yh]:e.NEAREST_MIPMAP_NEAREST,[Nn]:e.NEAREST_MIPMAP_LINEAR,[Nt]:e.LINEAR,[qa]:e.LINEAR_MIPMAP_NEAREST,[pi]:e.LINEAR_MIPMAP_LINEAR},se={[kp]:e.NEVER,[Gp]:e.ALWAYS,[Bp]:e.LESS,[nu]:e.LEQUAL,[zp]:e.EQUAL,[Wp]:e.GEQUAL,[Hp]:e.GREATER,[Vp]:e.NOTEQUAL};function ie(I,M){if(M.type===fi&&t.has("OES_texture_float_linear")===!1&&(M.magFilter===Nt||M.magFilter===qa||M.magFilter===Nn||M.magFilter===pi||M.minFilter===Nt||M.minFilter===qa||M.minFilter===Nn||M.minFilter===pi)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),e.texParameteri(I,e.TEXTURE_WRAP_S,$[M.wrapS]),e.texParameteri(I,e.TEXTURE_WRAP_T,$[M.wrapT]),(I===e.TEXTURE_3D||I===e.TEXTURE_2D_ARRAY)&&e.texParameteri(I,e.TEXTURE_WRAP_R,$[M.wrapR]),e.texParameteri(I,e.TEXTURE_MAG_FILTER,U[M.magFilter]),e.texParameteri(I,e.TEXTURE_MIN_FILTER,U[M.minFilter]),M.compareFunction&&(e.texParameteri(I,e.TEXTURE_COMPARE_MODE,e.COMPARE_REF_TO_TEXTURE),e.texParameteri(I,e.TEXTURE_COMPARE_FUNC,se[M.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(M.magFilter===Bt||M.minFilter!==Nn&&M.minFilter!==pi||M.type===fi&&t.has("OES_texture_float_linear")===!1)return;if(M.anisotropy>1||r.get(M).__currentAnisotropy){let B=t.get("EXT_texture_filter_anisotropic");e.texParameterf(I,B.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(M.anisotropy,n.getMaxAnisotropy())),r.get(M).__currentAnisotropy=M.anisotropy}}}function le(I,M){let B=!1;I.__webglInit===void 0&&(I.__webglInit=!0,M.addEventListener("dispose",E));let Z=M.source,ee=d.get(Z);ee===void 0&&(ee={},d.set(Z,ee));let K=W(M);if(K!==I.__cacheKey){ee[K]===void 0&&(ee[K]={texture:e.createTexture(),usedTimes:0},s.memory.textures++,B=!0),ee[K].usedTimes++;let be=ee[I.__cacheKey];be!==void 0&&(ee[I.__cacheKey].usedTimes--,be.usedTimes===0&&b(M)),I.__cacheKey=K,I.__webglTexture=ee[K].texture}return B}function ae(I,M,B){return Math.floor(Math.floor(I/B)/M)}function N(I,M,B,Z){let ee=I.updateRanges;if(ee.length===0)i.texSubImage2D(e.TEXTURE_2D,0,0,0,M.width,M.height,B,Z,M.data);else{ee.sort((Ce,oe)=>Ce.start-oe.start);let K=0;for(let Ce=1;Ce<ee.length;Ce++){let oe=ee[K],fe=ee[Ce],Ne=oe.start+oe.count,Ie=ae(fe.start,M.width,4),ge=ae(oe.start,M.width,4);fe.start<=Ne+1&&Ie===ge&&ae(fe.start+fe.count-1,M.width,4)===Ie?oe.count=Math.max(oe.count,fe.start+fe.count-oe.start):(++K,ee[K]=fe)}ee.length=K+1;let be=e.getParameter(e.UNPACK_ROW_LENGTH),ce=e.getParameter(e.UNPACK_SKIP_PIXELS),Te=e.getParameter(e.UNPACK_SKIP_ROWS);e.pixelStorei(e.UNPACK_ROW_LENGTH,M.width);for(let Ce=0,oe=ee.length;Ce<oe;Ce++){let fe=ee[Ce],Ne=Math.floor(fe.start/4),Ie=Math.ceil(fe.count/4),ge=Ne%M.width,Xe=Math.floor(Ne/M.width),D=Ie;e.pixelStorei(e.UNPACK_SKIP_PIXELS,ge),e.pixelStorei(e.UNPACK_SKIP_ROWS,Xe),i.texSubImage2D(e.TEXTURE_2D,0,ge,Xe,D,1,B,Z,M.data)}I.clearUpdateRanges(),e.pixelStorei(e.UNPACK_ROW_LENGTH,be),e.pixelStorei(e.UNPACK_SKIP_PIXELS,ce),e.pixelStorei(e.UNPACK_SKIP_ROWS,Te)}}function Y(I,M,B){let Z=e.TEXTURE_2D;(M.isDataArrayTexture||M.isCompressedArrayTexture)&&(Z=e.TEXTURE_2D_ARRAY),M.isData3DTexture&&(Z=e.TEXTURE_3D);let ee=le(I,M),K=M.source;i.bindTexture(Z,I.__webglTexture,e.TEXTURE0+B);let be=r.get(K);if(K.version!==be.__version||ee===!0){i.activeTexture(e.TEXTURE0+B);let ce=ke.getPrimaries(ke.workingColorSpace),Te=M.colorSpace===nr?null:ke.getPrimaries(M.colorSpace),Ce=M.colorSpace===nr||ce===Te?e.NONE:e.BROWSER_DEFAULT_WEBGL;e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,M.flipY),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,M.premultiplyAlpha),e.pixelStorei(e.UNPACK_ALIGNMENT,M.unpackAlignment),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,Ce);let oe=f(M.image,!1,n.maxTextureSize);oe=lt(M,oe);let fe=a.convert(M.format,M.colorSpace),Ne=a.convert(M.type),Ie=x(M.internalFormat,fe,Ne,M.colorSpace,M.isVideoTexture);ie(Z,M);let ge,Xe=M.mipmaps,D=M.isVideoTexture!==!0,me=be.__version===void 0||ee===!0,he=K.dataReady,Se=S(M,oe);if(M.isDepthTexture)Ie=_(M.format===Gn,M.type),me&&(D?i.texStorage2D(e.TEXTURE_2D,1,Ie,oe.width,oe.height):i.texImage2D(e.TEXTURE_2D,0,Ie,oe.width,oe.height,0,fe,Ne,null));else if(M.isDataTexture)if(Xe.length>0){D&&me&&i.texStorage2D(e.TEXTURE_2D,Se,Ie,Xe[0].width,Xe[0].height);for(let ne=0,Q=Xe.length;ne<Q;ne++)ge=Xe[ne],D?he&&i.texSubImage2D(e.TEXTURE_2D,ne,0,0,ge.width,ge.height,fe,Ne,ge.data):i.texImage2D(e.TEXTURE_2D,ne,Ie,ge.width,ge.height,0,fe,Ne,ge.data);M.generateMipmaps=!1}else D?(me&&i.texStorage2D(e.TEXTURE_2D,Se,Ie,oe.width,oe.height),he&&N(M,oe,fe,Ne)):i.texImage2D(e.TEXTURE_2D,0,Ie,oe.width,oe.height,0,fe,Ne,oe.data);else if(M.isCompressedTexture)if(M.isCompressedArrayTexture){D&&me&&i.texStorage3D(e.TEXTURE_2D_ARRAY,Se,Ie,Xe[0].width,Xe[0].height,oe.depth);for(let ne=0,Q=Xe.length;ne<Q;ne++)if(ge=Xe[ne],M.format!==ii)if(fe!==null)if(D){if(he)if(M.layerUpdates.size>0){let Me=lh(ge.width,ge.height,M.format,M.type);for(let Pe of M.layerUpdates){let xt=ge.data.subarray(Pe*Me/ge.data.BYTES_PER_ELEMENT,(Pe+1)*Me/ge.data.BYTES_PER_ELEMENT);i.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,ne,0,0,Pe,ge.width,ge.height,1,fe,xt)}M.clearLayerUpdates()}else i.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,ne,0,0,0,ge.width,ge.height,oe.depth,fe,ge.data)}else i.compressedTexImage3D(e.TEXTURE_2D_ARRAY,ne,Ie,ge.width,ge.height,oe.depth,0,ge.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else D?he&&i.texSubImage3D(e.TEXTURE_2D_ARRAY,ne,0,0,0,ge.width,ge.height,oe.depth,fe,Ne,ge.data):i.texImage3D(e.TEXTURE_2D_ARRAY,ne,Ie,ge.width,ge.height,oe.depth,0,fe,Ne,ge.data)}else{D&&me&&i.texStorage2D(e.TEXTURE_2D,Se,Ie,Xe[0].width,Xe[0].height);for(let ne=0,Q=Xe.length;ne<Q;ne++)ge=Xe[ne],M.format!==ii?fe!==null?D?he&&i.compressedTexSubImage2D(e.TEXTURE_2D,ne,0,0,ge.width,ge.height,fe,ge.data):i.compressedTexImage2D(e.TEXTURE_2D,ne,Ie,ge.width,ge.height,0,ge.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):D?he&&i.texSubImage2D(e.TEXTURE_2D,ne,0,0,ge.width,ge.height,fe,Ne,ge.data):i.texImage2D(e.TEXTURE_2D,ne,Ie,ge.width,ge.height,0,fe,Ne,ge.data)}else if(M.isDataArrayTexture)if(D){if(me&&i.texStorage3D(e.TEXTURE_2D_ARRAY,Se,Ie,oe.width,oe.height,oe.depth),he)if(M.layerUpdates.size>0){let ne=lh(oe.width,oe.height,M.format,M.type);for(let Q of M.layerUpdates){let Me=oe.data.subarray(Q*ne/oe.data.BYTES_PER_ELEMENT,(Q+1)*ne/oe.data.BYTES_PER_ELEMENT);i.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,Q,oe.width,oe.height,1,fe,Ne,Me)}M.clearLayerUpdates()}else i.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,0,oe.width,oe.height,oe.depth,fe,Ne,oe.data)}else i.texImage3D(e.TEXTURE_2D_ARRAY,0,Ie,oe.width,oe.height,oe.depth,0,fe,Ne,oe.data);else if(M.isData3DTexture)D?(me&&i.texStorage3D(e.TEXTURE_3D,Se,Ie,oe.width,oe.height,oe.depth),he&&i.texSubImage3D(e.TEXTURE_3D,0,0,0,0,oe.width,oe.height,oe.depth,fe,Ne,oe.data)):i.texImage3D(e.TEXTURE_3D,0,Ie,oe.width,oe.height,oe.depth,0,fe,Ne,oe.data);else if(M.isFramebufferTexture){if(me)if(D)i.texStorage2D(e.TEXTURE_2D,Se,Ie,oe.width,oe.height);else{let ne=oe.width,Q=oe.height;for(let Me=0;Me<Se;Me++)i.texImage2D(e.TEXTURE_2D,Me,Ie,ne,Q,0,fe,Ne,null),ne>>=1,Q>>=1}}else if(Xe.length>0){if(D&&me){let ne=it(Xe[0]);i.texStorage2D(e.TEXTURE_2D,Se,Ie,ne.width,ne.height)}for(let ne=0,Q=Xe.length;ne<Q;ne++)ge=Xe[ne],D?he&&i.texSubImage2D(e.TEXTURE_2D,ne,0,0,fe,Ne,ge):i.texImage2D(e.TEXTURE_2D,ne,Ie,fe,Ne,ge);M.generateMipmaps=!1}else if(D){if(me){let ne=it(oe);i.texStorage2D(e.TEXTURE_2D,Se,Ie,ne.width,ne.height)}he&&i.texSubImage2D(e.TEXTURE_2D,0,0,0,fe,Ne,oe)}else i.texImage2D(e.TEXTURE_2D,0,Ie,fe,Ne,oe);g(M)&&m(Z),be.__version=K.version,M.onUpdate&&M.onUpdate(M)}I.__version=M.version}function J(I,M,B){if(M.image.length!==6)return;let Z=le(I,M),ee=M.source;i.bindTexture(e.TEXTURE_CUBE_MAP,I.__webglTexture,e.TEXTURE0+B);let K=r.get(ee);if(ee.version!==K.__version||Z===!0){i.activeTexture(e.TEXTURE0+B);let be=ke.getPrimaries(ke.workingColorSpace),ce=M.colorSpace===nr?null:ke.getPrimaries(M.colorSpace),Te=M.colorSpace===nr||be===ce?e.NONE:e.BROWSER_DEFAULT_WEBGL;e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,M.flipY),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,M.premultiplyAlpha),e.pixelStorei(e.UNPACK_ALIGNMENT,M.unpackAlignment),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,Te);let Ce=M.isCompressedTexture||M.image[0].isCompressedTexture,oe=M.image[0]&&M.image[0].isDataTexture,fe=[];for(let Q=0;Q<6;Q++)!Ce&&!oe?fe[Q]=f(M.image[Q],!0,n.maxCubemapSize):fe[Q]=oe?M.image[Q].image:M.image[Q],fe[Q]=lt(M,fe[Q]);let Ne=fe[0],Ie=a.convert(M.format,M.colorSpace),ge=a.convert(M.type),Xe=x(M.internalFormat,Ie,ge,M.colorSpace),D=M.isVideoTexture!==!0,me=K.__version===void 0||Z===!0,he=ee.dataReady,Se=S(M,Ne);ie(e.TEXTURE_CUBE_MAP,M);let ne;if(Ce){D&&me&&i.texStorage2D(e.TEXTURE_CUBE_MAP,Se,Xe,Ne.width,Ne.height);for(let Q=0;Q<6;Q++){ne=fe[Q].mipmaps;for(let Me=0;Me<ne.length;Me++){let Pe=ne[Me];M.format!==ii?Ie!==null?D?he&&i.compressedTexSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+Q,Me,0,0,Pe.width,Pe.height,Ie,Pe.data):i.compressedTexImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+Q,Me,Xe,Pe.width,Pe.height,0,Pe.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):D?he&&i.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+Q,Me,0,0,Pe.width,Pe.height,Ie,ge,Pe.data):i.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+Q,Me,Xe,Pe.width,Pe.height,0,Ie,ge,Pe.data)}}}else{if(ne=M.mipmaps,D&&me){ne.length>0&&Se++;let Q=it(fe[0]);i.texStorage2D(e.TEXTURE_CUBE_MAP,Se,Xe,Q.width,Q.height)}for(let Q=0;Q<6;Q++)if(oe){D?he&&i.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+Q,0,0,0,fe[Q].width,fe[Q].height,Ie,ge,fe[Q].data):i.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+Q,0,Xe,fe[Q].width,fe[Q].height,0,Ie,ge,fe[Q].data);for(let Me=0;Me<ne.length;Me++){let Pe=ne[Me].image[Q].image;D?he&&i.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+Q,Me+1,0,0,Pe.width,Pe.height,Ie,ge,Pe.data):i.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+Q,Me+1,Xe,Pe.width,Pe.height,0,Ie,ge,Pe.data)}}else{D?he&&i.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+Q,0,0,0,Ie,ge,fe[Q]):i.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+Q,0,Xe,Ie,ge,fe[Q]);for(let Me=0;Me<ne.length;Me++){let Pe=ne[Me];D?he&&i.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+Q,Me+1,0,0,Ie,ge,Pe.image[Q]):i.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+Q,Me+1,Xe,Ie,ge,Pe.image[Q])}}}g(M)&&m(e.TEXTURE_CUBE_MAP),K.__version=ee.version,M.onUpdate&&M.onUpdate(M)}I.__version=M.version}function de(I,M,B,Z,ee,K){let be=a.convert(B.format,B.colorSpace),ce=a.convert(B.type),Te=x(B.internalFormat,be,ce,B.colorSpace),Ce=r.get(M),oe=r.get(B);if(oe.__renderTarget=M,!Ce.__hasExternalTextures){let fe=Math.max(1,M.width>>K),Ne=Math.max(1,M.height>>K);ee===e.TEXTURE_3D||ee===e.TEXTURE_2D_ARRAY?i.texImage3D(ee,K,Te,fe,Ne,M.depth,0,be,ce,null):i.texImage2D(ee,K,Te,fe,Ne,0,be,ce,null)}i.bindFramebuffer(e.FRAMEBUFFER,I),Le(M)?o.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,Z,ee,oe.__webglTexture,0,Re(M)):(ee===e.TEXTURE_2D||ee>=e.TEXTURE_CUBE_MAP_POSITIVE_X&&ee<=e.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&e.framebufferTexture2D(e.FRAMEBUFFER,Z,ee,oe.__webglTexture,K),i.bindFramebuffer(e.FRAMEBUFFER,null)}function te(I,M,B){if(e.bindRenderbuffer(e.RENDERBUFFER,I),M.depthBuffer){let Z=M.depthTexture,ee=Z&&Z.isDepthTexture?Z.type:null,K=_(M.stencilBuffer,ee),be=M.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,ce=Re(M);Le(M)?o.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,ce,K,M.width,M.height):B?e.renderbufferStorageMultisample(e.RENDERBUFFER,ce,K,M.width,M.height):e.renderbufferStorage(e.RENDERBUFFER,K,M.width,M.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,be,e.RENDERBUFFER,I)}else{let Z=M.textures;for(let ee=0;ee<Z.length;ee++){let K=Z[ee],be=a.convert(K.format,K.colorSpace),ce=a.convert(K.type),Te=x(K.internalFormat,be,ce,K.colorSpace),Ce=Re(M);B&&Le(M)===!1?e.renderbufferStorageMultisample(e.RENDERBUFFER,Ce,Te,M.width,M.height):Le(M)?o.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,Ce,Te,M.width,M.height):e.renderbufferStorage(e.RENDERBUFFER,Te,M.width,M.height)}}e.bindRenderbuffer(e.RENDERBUFFER,null)}function pe(I,M){if(M&&M.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(i.bindFramebuffer(e.FRAMEBUFFER,I),!(M.depthTexture&&M.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");let B=r.get(M.depthTexture);B.__renderTarget=M,(!B.__webglTexture||M.depthTexture.image.width!==M.width||M.depthTexture.image.height!==M.height)&&(M.depthTexture.image.width=M.width,M.depthTexture.image.height=M.height,M.depthTexture.needsUpdate=!0),O(M.depthTexture,0);let Z=B.__webglTexture,ee=Re(M);if(M.depthTexture.format===Wn)Le(M)?o.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,e.DEPTH_ATTACHMENT,e.TEXTURE_2D,Z,0,ee):e.framebufferTexture2D(e.FRAMEBUFFER,e.DEPTH_ATTACHMENT,e.TEXTURE_2D,Z,0);else if(M.depthTexture.format===Gn)Le(M)?o.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,e.DEPTH_STENCIL_ATTACHMENT,e.TEXTURE_2D,Z,0,ee):e.framebufferTexture2D(e.FRAMEBUFFER,e.DEPTH_STENCIL_ATTACHMENT,e.TEXTURE_2D,Z,0);else throw new Error("Unknown depthTexture format")}function $e(I){let M=r.get(I),B=I.isWebGLCubeRenderTarget===!0;if(M.__boundDepthTexture!==I.depthTexture){let Z=I.depthTexture;if(M.__depthDisposeCallback&&M.__depthDisposeCallback(),Z){let ee=()=>{delete M.__boundDepthTexture,delete M.__depthDisposeCallback,Z.removeEventListener("dispose",ee)};Z.addEventListener("dispose",ee),M.__depthDisposeCallback=ee}M.__boundDepthTexture=Z}if(I.depthTexture&&!M.__autoAllocateDepthBuffer){if(B)throw new Error("target.depthTexture not supported in Cube render targets");let Z=I.texture.mipmaps;Z&&Z.length>0?pe(M.__webglFramebuffer[0],I):pe(M.__webglFramebuffer,I)}else if(B){M.__webglDepthbuffer=[];for(let Z=0;Z<6;Z++)if(i.bindFramebuffer(e.FRAMEBUFFER,M.__webglFramebuffer[Z]),M.__webglDepthbuffer[Z]===void 0)M.__webglDepthbuffer[Z]=e.createRenderbuffer(),te(M.__webglDepthbuffer[Z],I,!1);else{let ee=I.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,K=M.__webglDepthbuffer[Z];e.bindRenderbuffer(e.RENDERBUFFER,K),e.framebufferRenderbuffer(e.FRAMEBUFFER,ee,e.RENDERBUFFER,K)}}else{let Z=I.texture.mipmaps;if(Z&&Z.length>0?i.bindFramebuffer(e.FRAMEBUFFER,M.__webglFramebuffer[0]):i.bindFramebuffer(e.FRAMEBUFFER,M.__webglFramebuffer),M.__webglDepthbuffer===void 0)M.__webglDepthbuffer=e.createRenderbuffer(),te(M.__webglDepthbuffer,I,!1);else{let ee=I.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,K=M.__webglDepthbuffer;e.bindRenderbuffer(e.RENDERBUFFER,K),e.framebufferRenderbuffer(e.FRAMEBUFFER,ee,e.RENDERBUFFER,K)}}i.bindFramebuffer(e.FRAMEBUFFER,null)}function L(I,M,B){let Z=r.get(I);M!==void 0&&de(Z.__webglFramebuffer,I,I.texture,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,0),B!==void 0&&$e(I)}function We(I){let M=I.texture,B=r.get(I),Z=r.get(M);I.addEventListener("dispose",A);let ee=I.textures,K=I.isWebGLCubeRenderTarget===!0,be=ee.length>1;if(be||(Z.__webglTexture===void 0&&(Z.__webglTexture=e.createTexture()),Z.__version=M.version,s.memory.textures++),K){B.__webglFramebuffer=[];for(let ce=0;ce<6;ce++)if(M.mipmaps&&M.mipmaps.length>0){B.__webglFramebuffer[ce]=[];for(let Te=0;Te<M.mipmaps.length;Te++)B.__webglFramebuffer[ce][Te]=e.createFramebuffer()}else B.__webglFramebuffer[ce]=e.createFramebuffer()}else{if(M.mipmaps&&M.mipmaps.length>0){B.__webglFramebuffer=[];for(let ce=0;ce<M.mipmaps.length;ce++)B.__webglFramebuffer[ce]=e.createFramebuffer()}else B.__webglFramebuffer=e.createFramebuffer();if(be)for(let ce=0,Te=ee.length;ce<Te;ce++){let Ce=r.get(ee[ce]);Ce.__webglTexture===void 0&&(Ce.__webglTexture=e.createTexture(),s.memory.textures++)}if(I.samples>0&&Le(I)===!1){B.__webglMultisampledFramebuffer=e.createFramebuffer(),B.__webglColorRenderbuffer=[],i.bindFramebuffer(e.FRAMEBUFFER,B.__webglMultisampledFramebuffer);for(let ce=0;ce<ee.length;ce++){let Te=ee[ce];B.__webglColorRenderbuffer[ce]=e.createRenderbuffer(),e.bindRenderbuffer(e.RENDERBUFFER,B.__webglColorRenderbuffer[ce]);let Ce=a.convert(Te.format,Te.colorSpace),oe=a.convert(Te.type),fe=x(Te.internalFormat,Ce,oe,Te.colorSpace,I.isXRRenderTarget===!0),Ne=Re(I);e.renderbufferStorageMultisample(e.RENDERBUFFER,Ne,fe,I.width,I.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+ce,e.RENDERBUFFER,B.__webglColorRenderbuffer[ce])}e.bindRenderbuffer(e.RENDERBUFFER,null),I.depthBuffer&&(B.__webglDepthRenderbuffer=e.createRenderbuffer(),te(B.__webglDepthRenderbuffer,I,!0)),i.bindFramebuffer(e.FRAMEBUFFER,null)}}if(K){i.bindTexture(e.TEXTURE_CUBE_MAP,Z.__webglTexture),ie(e.TEXTURE_CUBE_MAP,M);for(let ce=0;ce<6;ce++)if(M.mipmaps&&M.mipmaps.length>0)for(let Te=0;Te<M.mipmaps.length;Te++)de(B.__webglFramebuffer[ce][Te],I,M,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+ce,Te);else de(B.__webglFramebuffer[ce],I,M,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+ce,0);g(M)&&m(e.TEXTURE_CUBE_MAP),i.unbindTexture()}else if(be){for(let ce=0,Te=ee.length;ce<Te;ce++){let Ce=ee[ce],oe=r.get(Ce),fe=e.TEXTURE_2D;(I.isWebGL3DRenderTarget||I.isWebGLArrayRenderTarget)&&(fe=I.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),i.bindTexture(fe,oe.__webglTexture),ie(fe,Ce),de(B.__webglFramebuffer,I,Ce,e.COLOR_ATTACHMENT0+ce,fe,0),g(Ce)&&m(fe)}i.unbindTexture()}else{let ce=e.TEXTURE_2D;if((I.isWebGL3DRenderTarget||I.isWebGLArrayRenderTarget)&&(ce=I.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),i.bindTexture(ce,Z.__webglTexture),ie(ce,M),M.mipmaps&&M.mipmaps.length>0)for(let Te=0;Te<M.mipmaps.length;Te++)de(B.__webglFramebuffer[Te],I,M,e.COLOR_ATTACHMENT0,ce,Te);else de(B.__webglFramebuffer,I,M,e.COLOR_ATTACHMENT0,ce,0);g(M)&&m(ce),i.unbindTexture()}I.depthBuffer&&$e(I)}function Be(I){let M=I.textures;for(let B=0,Z=M.length;B<Z;B++){let ee=M[B];if(g(ee)){let K=y(I),be=r.get(ee).__webglTexture;i.bindTexture(K,be),m(K),i.unbindTexture()}}}let Qe=[],Ee=[];function tt(I){if(I.samples>0){if(Le(I)===!1){let M=I.textures,B=I.width,Z=I.height,ee=e.COLOR_BUFFER_BIT,K=I.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,be=r.get(I),ce=M.length>1;if(ce)for(let Ce=0;Ce<M.length;Ce++)i.bindFramebuffer(e.FRAMEBUFFER,be.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+Ce,e.RENDERBUFFER,null),i.bindFramebuffer(e.FRAMEBUFFER,be.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+Ce,e.TEXTURE_2D,null,0);i.bindFramebuffer(e.READ_FRAMEBUFFER,be.__webglMultisampledFramebuffer);let Te=I.texture.mipmaps;Te&&Te.length>0?i.bindFramebuffer(e.DRAW_FRAMEBUFFER,be.__webglFramebuffer[0]):i.bindFramebuffer(e.DRAW_FRAMEBUFFER,be.__webglFramebuffer);for(let Ce=0;Ce<M.length;Ce++){if(I.resolveDepthBuffer&&(I.depthBuffer&&(ee|=e.DEPTH_BUFFER_BIT),I.stencilBuffer&&I.resolveStencilBuffer&&(ee|=e.STENCIL_BUFFER_BIT)),ce){e.framebufferRenderbuffer(e.READ_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.RENDERBUFFER,be.__webglColorRenderbuffer[Ce]);let oe=r.get(M[Ce]).__webglTexture;e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,oe,0)}e.blitFramebuffer(0,0,B,Z,0,0,B,Z,ee,e.NEAREST),l===!0&&(Qe.length=0,Ee.length=0,Qe.push(e.COLOR_ATTACHMENT0+Ce),I.depthBuffer&&I.resolveDepthBuffer===!1&&(Qe.push(K),Ee.push(K),e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,Ee)),e.invalidateFramebuffer(e.READ_FRAMEBUFFER,Qe))}if(i.bindFramebuffer(e.READ_FRAMEBUFFER,null),i.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),ce)for(let Ce=0;Ce<M.length;Ce++){i.bindFramebuffer(e.FRAMEBUFFER,be.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+Ce,e.RENDERBUFFER,be.__webglColorRenderbuffer[Ce]);let oe=r.get(M[Ce]).__webglTexture;i.bindFramebuffer(e.FRAMEBUFFER,be.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+Ce,e.TEXTURE_2D,oe,0)}i.bindFramebuffer(e.DRAW_FRAMEBUFFER,be.__webglMultisampledFramebuffer)}else if(I.depthBuffer&&I.resolveDepthBuffer===!1&&l){let M=I.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,[M])}}}function Re(I){return Math.min(n.maxSamples,I.samples)}function Le(I){let M=r.get(I);return I.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&M.__useRenderToTexture!==!1}function ot(I){let M=s.render.frame;h.get(I)!==M&&(h.set(I,M),I.update())}function lt(I,M){let B=I.colorSpace,Z=I.format,ee=I.type;return I.isCompressedTexture===!0||I.isVideoTexture===!0||B!==zt&&B!==nr&&(ke.getTransfer(B)===nt?(Z!==ii||ee!==Ri)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",B)),M}function it(I){return typeof HTMLImageElement<"u"&&I instanceof HTMLImageElement?(c.width=I.naturalWidth||I.width,c.height=I.naturalHeight||I.height):typeof VideoFrame<"u"&&I instanceof VideoFrame?(c.width=I.displayWidth,c.height=I.displayHeight):(c.width=I.width,c.height=I.height),c}this.allocateTextureUnit=V,this.resetTextureUnits=G,this.setTexture2D=O,this.setTexture2DArray=z,this.setTexture3D=j,this.setTextureCube=H,this.rebindTextures=L,this.setupRenderTarget=We,this.updateRenderTargetMipmap=Be,this.updateMultisampleRenderTarget=tt,this.setupDepthRenderbuffer=$e,this.setupFrameBufferTexture=de,this.useMultisampledRTT=Le}function vx(e,t){function i(r,n=nr){let a,s=ke.getTransfer(n);if(r===Ri)return e.UNSIGNED_BYTE;if(r===Ml)return e.UNSIGNED_SHORT_4_4_4_4;if(r===Sl)return e.UNSIGNED_SHORT_5_5_5_1;if(r===Zh)return e.UNSIGNED_INT_5_9_9_9_REV;if(r===Jh)return e.UNSIGNED_INT_10F_11F_11F_REV;if(r===$h)return e.BYTE;if(r===Kh)return e.SHORT;if(r===Hn)return e.UNSIGNED_SHORT;if(r===wl)return e.INT;if(r===Cr)return e.UNSIGNED_INT;if(r===fi)return e.FLOAT;if(r===ta)return e.HALF_FLOAT;if(r===Qh)return e.ALPHA;if(r===eu)return e.RGB;if(r===ii)return e.RGBA;if(r===Wn)return e.DEPTH_COMPONENT;if(r===Gn)return e.DEPTH_STENCIL;if(r===El)return e.RED;if(r===Tl)return e.RED_INTEGER;if(r===tu)return e.RG;if(r===Al)return e.RG_INTEGER;if(r===Rl)return e.RGBA_INTEGER;if(r===Ya||r===$a||r===Ka||r===Za)if(s===nt)if(a=t.get("WEBGL_compressed_texture_s3tc_srgb"),a!==null){if(r===Ya)return a.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(r===$a)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(r===Ka)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(r===Za)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(a=t.get("WEBGL_compressed_texture_s3tc"),a!==null){if(r===Ya)return a.COMPRESSED_RGB_S3TC_DXT1_EXT;if(r===$a)return a.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(r===Ka)return a.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(r===Za)return a.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(r===Oo||r===Fo||r===ko||r===Bo)if(a=t.get("WEBGL_compressed_texture_pvrtc"),a!==null){if(r===Oo)return a.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(r===Fo)return a.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(r===ko)return a.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(r===Bo)return a.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(r===zo||r===Ho||r===Vo)if(a=t.get("WEBGL_compressed_texture_etc"),a!==null){if(r===zo||r===Ho)return s===nt?a.COMPRESSED_SRGB8_ETC2:a.COMPRESSED_RGB8_ETC2;if(r===Vo)return s===nt?a.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:a.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(r===Wo||r===Go||r===jo||r===Xo||r===qo||r===Yo||r===$o||r===Ko||r===Zo||r===Jo||r===Qo||r===el||r===tl||r===il)if(a=t.get("WEBGL_compressed_texture_astc"),a!==null){if(r===Wo)return s===nt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:a.COMPRESSED_RGBA_ASTC_4x4_KHR;if(r===Go)return s===nt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:a.COMPRESSED_RGBA_ASTC_5x4_KHR;if(r===jo)return s===nt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:a.COMPRESSED_RGBA_ASTC_5x5_KHR;if(r===Xo)return s===nt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:a.COMPRESSED_RGBA_ASTC_6x5_KHR;if(r===qo)return s===nt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:a.COMPRESSED_RGBA_ASTC_6x6_KHR;if(r===Yo)return s===nt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:a.COMPRESSED_RGBA_ASTC_8x5_KHR;if(r===$o)return s===nt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:a.COMPRESSED_RGBA_ASTC_8x6_KHR;if(r===Ko)return s===nt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:a.COMPRESSED_RGBA_ASTC_8x8_KHR;if(r===Zo)return s===nt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:a.COMPRESSED_RGBA_ASTC_10x5_KHR;if(r===Jo)return s===nt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:a.COMPRESSED_RGBA_ASTC_10x6_KHR;if(r===Qo)return s===nt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:a.COMPRESSED_RGBA_ASTC_10x8_KHR;if(r===el)return s===nt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:a.COMPRESSED_RGBA_ASTC_10x10_KHR;if(r===tl)return s===nt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:a.COMPRESSED_RGBA_ASTC_12x10_KHR;if(r===il)return s===nt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:a.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(r===rl||r===nl||r===al)if(a=t.get("EXT_texture_compression_bptc"),a!==null){if(r===rl)return s===nt?a.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:a.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(r===nl)return a.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(r===al)return a.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(r===sl||r===ol||r===ll||r===cl)if(a=t.get("EXT_texture_compression_rgtc"),a!==null){if(r===sl)return a.COMPRESSED_RED_RGTC1_EXT;if(r===ol)return a.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(r===ll)return a.COMPRESSED_RED_GREEN_RGTC2_EXT;if(r===cl)return a.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return r===Vn?e.UNSIGNED_INT_24_8:e[r]!==void 0?e[r]:null}return{convert:i}}function Mx(e,t){function i(g,m){g.matrixAutoUpdate===!0&&g.updateMatrix(),m.value.copy(g.matrix)}function r(g,m){m.color.getRGB(g.fogColor.value,vu(e)),m.isFog?(g.fogNear.value=m.near,g.fogFar.value=m.far):m.isFogExp2&&(g.fogDensity.value=m.density)}function n(g,m,y,x,_){m.isMeshBasicMaterial||m.isMeshLambertMaterial?a(g,m):m.isMeshToonMaterial?(a(g,m),u(g,m)):m.isMeshPhongMaterial?(a(g,m),h(g,m)):m.isMeshStandardMaterial?(a(g,m),d(g,m),m.isMeshPhysicalMaterial&&p(g,m,_)):m.isMeshMatcapMaterial?(a(g,m),v(g,m)):m.isMeshDepthMaterial?a(g,m):m.isMeshDistanceMaterial?(a(g,m),f(g,m)):m.isMeshNormalMaterial?a(g,m):m.isLineBasicMaterial?(s(g,m),m.isLineDashedMaterial&&o(g,m)):m.isPointsMaterial?l(g,m,y,x):m.isSpriteMaterial?c(g,m):m.isShadowMaterial?(g.color.value.copy(m.color),g.opacity.value=m.opacity):m.isShaderMaterial&&(m.uniformsNeedUpdate=!1)}function a(g,m){g.opacity.value=m.opacity,m.color&&g.diffuse.value.copy(m.color),m.emissive&&g.emissive.value.copy(m.emissive).multiplyScalar(m.emissiveIntensity),m.map&&(g.map.value=m.map,i(m.map,g.mapTransform)),m.alphaMap&&(g.alphaMap.value=m.alphaMap,i(m.alphaMap,g.alphaMapTransform)),m.bumpMap&&(g.bumpMap.value=m.bumpMap,i(m.bumpMap,g.bumpMapTransform),g.bumpScale.value=m.bumpScale,m.side===kt&&(g.bumpScale.value*=-1)),m.normalMap&&(g.normalMap.value=m.normalMap,i(m.normalMap,g.normalMapTransform),g.normalScale.value.copy(m.normalScale),m.side===kt&&g.normalScale.value.negate()),m.displacementMap&&(g.displacementMap.value=m.displacementMap,i(m.displacementMap,g.displacementMapTransform),g.displacementScale.value=m.displacementScale,g.displacementBias.value=m.displacementBias),m.emissiveMap&&(g.emissiveMap.value=m.emissiveMap,i(m.emissiveMap,g.emissiveMapTransform)),m.specularMap&&(g.specularMap.value=m.specularMap,i(m.specularMap,g.specularMapTransform)),m.alphaTest>0&&(g.alphaTest.value=m.alphaTest);let y=t.get(m),x=y.envMap,_=y.envMapRotation;x&&(g.envMap.value=x,xr.copy(_),xr.x*=-1,xr.y*=-1,xr.z*=-1,x.isCubeTexture&&x.isRenderTargetTexture===!1&&(xr.y*=-1,xr.z*=-1),g.envMapRotation.value.setFromMatrix4(wx.makeRotationFromEuler(xr)),g.flipEnvMap.value=x.isCubeTexture&&x.isRenderTargetTexture===!1?-1:1,g.reflectivity.value=m.reflectivity,g.ior.value=m.ior,g.refractionRatio.value=m.refractionRatio),m.lightMap&&(g.lightMap.value=m.lightMap,g.lightMapIntensity.value=m.lightMapIntensity,i(m.lightMap,g.lightMapTransform)),m.aoMap&&(g.aoMap.value=m.aoMap,g.aoMapIntensity.value=m.aoMapIntensity,i(m.aoMap,g.aoMapTransform))}function s(g,m){g.diffuse.value.copy(m.color),g.opacity.value=m.opacity,m.map&&(g.map.value=m.map,i(m.map,g.mapTransform))}function o(g,m){g.dashSize.value=m.dashSize,g.totalSize.value=m.dashSize+m.gapSize,g.scale.value=m.scale}function l(g,m,y,x){g.diffuse.value.copy(m.color),g.opacity.value=m.opacity,g.size.value=m.size*y,g.scale.value=x*.5,m.map&&(g.map.value=m.map,i(m.map,g.uvTransform)),m.alphaMap&&(g.alphaMap.value=m.alphaMap,i(m.alphaMap,g.alphaMapTransform)),m.alphaTest>0&&(g.alphaTest.value=m.alphaTest)}function c(g,m){g.diffuse.value.copy(m.color),g.opacity.value=m.opacity,g.rotation.value=m.rotation,m.map&&(g.map.value=m.map,i(m.map,g.mapTransform)),m.alphaMap&&(g.alphaMap.value=m.alphaMap,i(m.alphaMap,g.alphaMapTransform)),m.alphaTest>0&&(g.alphaTest.value=m.alphaTest)}function h(g,m){g.specular.value.copy(m.specular),g.shininess.value=Math.max(m.shininess,1e-4)}function u(g,m){m.gradientMap&&(g.gradientMap.value=m.gradientMap)}function d(g,m){g.metalness.value=m.metalness,m.metalnessMap&&(g.metalnessMap.value=m.metalnessMap,i(m.metalnessMap,g.metalnessMapTransform)),g.roughness.value=m.roughness,m.roughnessMap&&(g.roughnessMap.value=m.roughnessMap,i(m.roughnessMap,g.roughnessMapTransform)),m.envMap&&(g.envMapIntensity.value=m.envMapIntensity)}function p(g,m,y){g.ior.value=m.ior,m.sheen>0&&(g.sheenColor.value.copy(m.sheenColor).multiplyScalar(m.sheen),g.sheenRoughness.value=m.sheenRoughness,m.sheenColorMap&&(g.sheenColorMap.value=m.sheenColorMap,i(m.sheenColorMap,g.sheenColorMapTransform)),m.sheenRoughnessMap&&(g.sheenRoughnessMap.value=m.sheenRoughnessMap,i(m.sheenRoughnessMap,g.sheenRoughnessMapTransform))),m.clearcoat>0&&(g.clearcoat.value=m.clearcoat,g.clearcoatRoughness.value=m.clearcoatRoughness,m.clearcoatMap&&(g.clearcoatMap.value=m.clearcoatMap,i(m.clearcoatMap,g.clearcoatMapTransform)),m.clearcoatRoughnessMap&&(g.clearcoatRoughnessMap.value=m.clearcoatRoughnessMap,i(m.clearcoatRoughnessMap,g.clearcoatRoughnessMapTransform)),m.clearcoatNormalMap&&(g.clearcoatNormalMap.value=m.clearcoatNormalMap,i(m.clearcoatNormalMap,g.clearcoatNormalMapTransform),g.clearcoatNormalScale.value.copy(m.clearcoatNormalScale),m.side===kt&&g.clearcoatNormalScale.value.negate())),m.dispersion>0&&(g.dispersion.value=m.dispersion),m.iridescence>0&&(g.iridescence.value=m.iridescence,g.iridescenceIOR.value=m.iridescenceIOR,g.iridescenceThicknessMinimum.value=m.iridescenceThicknessRange[0],g.iridescenceThicknessMaximum.value=m.iridescenceThicknessRange[1],m.iridescenceMap&&(g.iridescenceMap.value=m.iridescenceMap,i(m.iridescenceMap,g.iridescenceMapTransform)),m.iridescenceThicknessMap&&(g.iridescenceThicknessMap.value=m.iridescenceThicknessMap,i(m.iridescenceThicknessMap,g.iridescenceThicknessMapTransform))),m.transmission>0&&(g.transmission.value=m.transmission,g.transmissionSamplerMap.value=y.texture,g.transmissionSamplerSize.value.set(y.width,y.height),m.transmissionMap&&(g.transmissionMap.value=m.transmissionMap,i(m.transmissionMap,g.transmissionMapTransform)),g.thickness.value=m.thickness,m.thicknessMap&&(g.thicknessMap.value=m.thicknessMap,i(m.thicknessMap,g.thicknessMapTransform)),g.attenuationDistance.value=m.attenuationDistance,g.attenuationColor.value.copy(m.attenuationColor)),m.anisotropy>0&&(g.anisotropyVector.value.set(m.anisotropy*Math.cos(m.anisotropyRotation),m.anisotropy*Math.sin(m.anisotropyRotation)),m.anisotropyMap&&(g.anisotropyMap.value=m.anisotropyMap,i(m.anisotropyMap,g.anisotropyMapTransform))),g.specularIntensity.value=m.specularIntensity,g.specularColor.value.copy(m.specularColor),m.specularColorMap&&(g.specularColorMap.value=m.specularColorMap,i(m.specularColorMap,g.specularColorMapTransform)),m.specularIntensityMap&&(g.specularIntensityMap.value=m.specularIntensityMap,i(m.specularIntensityMap,g.specularIntensityMapTransform))}function v(g,m){m.matcap&&(g.matcap.value=m.matcap)}function f(g,m){let y=t.get(m).light;g.referencePosition.value.setFromMatrixPosition(y.matrixWorld),g.nearDistance.value=y.shadow.camera.near,g.farDistance.value=y.shadow.camera.far}return{refreshFogUniforms:r,refreshMaterialUniforms:n}}function Sx(e,t,i,r){let n={},a={},s=[],o=e.getParameter(e.MAX_UNIFORM_BUFFER_BINDINGS);function l(y,x){let _=x.program;r.uniformBlockBinding(y,_)}function c(y,x){let _=n[y.id];_===void 0&&(v(y),_=h(y),n[y.id]=_,y.addEventListener("dispose",g));let S=x.program;r.updateUBOMapping(y,S);let E=t.render.frame;a[y.id]!==E&&(d(y),a[y.id]=E)}function h(y){let x=u();y.__bindingPointIndex=x;let _=e.createBuffer(),S=y.__size,E=y.usage;return e.bindBuffer(e.UNIFORM_BUFFER,_),e.bufferData(e.UNIFORM_BUFFER,S,E),e.bindBuffer(e.UNIFORM_BUFFER,null),e.bindBufferBase(e.UNIFORM_BUFFER,x,_),_}function u(){for(let y=0;y<o;y++)if(s.indexOf(y)===-1)return s.push(y),y;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function d(y){let x=n[y.id],_=y.uniforms,S=y.__cache;e.bindBuffer(e.UNIFORM_BUFFER,x);for(let E=0,A=_.length;E<A;E++){let C=Array.isArray(_[E])?_[E]:[_[E]];for(let b=0,w=C.length;b<w;b++){let R=C[b];if(p(R,E,b,S)===!0){let G=R.__offset,V=Array.isArray(R.value)?R.value:[R.value],W=0;for(let O=0;O<V.length;O++){let z=V[O],j=f(z);typeof z=="number"||typeof z=="boolean"?(R.__data[0]=z,e.bufferSubData(e.UNIFORM_BUFFER,G+W,R.__data)):z.isMatrix3?(R.__data[0]=z.elements[0],R.__data[1]=z.elements[1],R.__data[2]=z.elements[2],R.__data[3]=0,R.__data[4]=z.elements[3],R.__data[5]=z.elements[4],R.__data[6]=z.elements[5],R.__data[7]=0,R.__data[8]=z.elements[6],R.__data[9]=z.elements[7],R.__data[10]=z.elements[8],R.__data[11]=0):(z.toArray(R.__data,W),W+=j.storage/Float32Array.BYTES_PER_ELEMENT)}e.bufferSubData(e.UNIFORM_BUFFER,G,R.__data)}}}e.bindBuffer(e.UNIFORM_BUFFER,null)}function p(y,x,_,S){let E=y.value,A=x+"_"+_;if(S[A]===void 0)return typeof E=="number"||typeof E=="boolean"?S[A]=E:S[A]=E.clone(),!0;{let C=S[A];if(typeof E=="number"||typeof E=="boolean"){if(C!==E)return S[A]=E,!0}else if(C.equals(E)===!1)return C.copy(E),!0}return!1}function v(y){let x=y.uniforms,_=0,S=16;for(let A=0,C=x.length;A<C;A++){let b=Array.isArray(x[A])?x[A]:[x[A]];for(let w=0,R=b.length;w<R;w++){let G=b[w],V=Array.isArray(G.value)?G.value:[G.value];for(let W=0,O=V.length;W<O;W++){let z=V[W],j=f(z),H=_%S,$=H%j.boundary,U=H+$;_+=$,U!==0&&S-U<j.storage&&(_+=S-U),G.__data=new Float32Array(j.storage/Float32Array.BYTES_PER_ELEMENT),G.__offset=_,_+=j.storage}}}let E=_%S;return E>0&&(_+=S-E),y.__size=_,y.__cache={},this}function f(y){let x={boundary:0,storage:0};return typeof y=="number"||typeof y=="boolean"?(x.boundary=4,x.storage=4):y.isVector2?(x.boundary=8,x.storage=8):y.isVector3||y.isColor?(x.boundary=16,x.storage=12):y.isVector4?(x.boundary=16,x.storage=16):y.isMatrix3?(x.boundary=48,x.storage=48):y.isMatrix4?(x.boundary=64,x.storage=64):y.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",y),x}function g(y){let x=y.target;x.removeEventListener("dispose",g);let _=s.indexOf(x.__bindingPointIndex);s.splice(_,1),e.deleteBuffer(n[x.id]),delete n[x.id],delete a[x.id]}function m(){for(let y in n)e.deleteBuffer(n[y]);s=[],n={},a={}}return{bind:l,update:c,dispose:m}}function Ph(e,t){if(t===Np)return console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles."),e;if(t===hl||t===ru){let i=e.getIndex();if(i===null){let s=[],o=e.getAttribute("position");if(o!==void 0){for(let l=0;l<o.count;l++)s.push(l);e.setIndex(s),i=e.getIndex()}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible."),e}let r=i.count-2,n=[];if(t===hl)for(let s=1;s<=r;s++)n.push(i.getX(0)),n.push(i.getX(s)),n.push(i.getX(s+1));else for(let s=0;s<r;s++)s%2===0?(n.push(i.getX(s)),n.push(i.getX(s+1)),n.push(i.getX(s+2))):(n.push(i.getX(s+2)),n.push(i.getX(s+1)),n.push(i.getX(s)));n.length/3!==r&&console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles.");let a=e.clone();return a.setIndex(n),a.clearGroups(),a}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:",t),e}function Ax(){let e={};return{get:function(t){return e[t]},add:function(t,i){e[t]=i},remove:function(t){delete e[t]},removeAll:function(){e={}}}}function Qx(e){return e.DefaultMaterial===void 0&&(e.DefaultMaterial=new gn({color:16777215,emissive:0,metalness:1,roughness:1,transparent:!1,depthTest:!0,side:Ai})),e.DefaultMaterial}function yr(e,t,i){for(let r in i.extensions)e[r]===void 0&&(t.userData.gltfExtensions=t.userData.gltfExtensions||{},t.userData.gltfExtensions[r]=i.extensions[r])}function Mi(e,t){t.extras!==void 0&&(typeof t.extras=="object"?Object.assign(e.userData,t.extras):console.warn("THREE.GLTFLoader: Ignoring primitive type .extras, "+t.extras))}function ey(e,t,i){let r=!1,n=!1,a=!1;for(let c=0,h=t.length;c<h;c++){let u=t[c];if(u.POSITION!==void 0&&(r=!0),u.NORMAL!==void 0&&(n=!0),u.COLOR_0!==void 0&&(a=!0),r&&n&&a)break}if(!r&&!n&&!a)return Promise.resolve(e);let s=[],o=[],l=[];for(let c=0,h=t.length;c<h;c++){let u=t[c];if(r){let d=u.POSITION!==void 0?i.getDependency("accessor",u.POSITION):e.attributes.position;s.push(d)}if(n){let d=u.NORMAL!==void 0?i.getDependency("accessor",u.NORMAL):e.attributes.normal;o.push(d)}if(a){let d=u.COLOR_0!==void 0?i.getDependency("accessor",u.COLOR_0):e.attributes.color;l.push(d)}}return Promise.all([Promise.all(s),Promise.all(o),Promise.all(l)]).then(function(c){let h=c[0],u=c[1],d=c[2];return r&&(e.morphAttributes.position=h),n&&(e.morphAttributes.normal=u),a&&(e.morphAttributes.color=d),e.morphTargetsRelative=!0,e})}function ty(e,t){if(e.updateMorphTargets(),t.weights!==void 0)for(let i=0,r=t.weights.length;i<r;i++)e.morphTargetInfluences[i]=t.weights[i];if(t.extras&&Array.isArray(t.extras.targetNames)){let i=t.extras.targetNames;if(e.morphTargetInfluences.length===i.length){e.morphTargetDictionary={};for(let r=0,n=i.length;r<n;r++)e.morphTargetDictionary[i[r]]=r}else console.warn("THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.")}}function iy(e){let t,i=e.extensions&&e.extensions[qe.KHR_DRACO_MESH_COMPRESSION];if(i?t="draco:"+i.bufferView+":"+i.indices+":"+xo(i.attributes):t=e.indices+":"+xo(e.attributes)+":"+e.mode,e.targets!==void 0)for(let r=0,n=e.targets.length;r<n;r++)t+=":"+xo(e.targets[r]);return t}function xo(e){let t="",i=Object.keys(e).sort();for(let r=0,n=i.length;r<n;r++)t+=i[r]+":"+e[i[r]]+";";return t}function yl(e){switch(e){case Int8Array:return 1/127;case Uint8Array:return 1/255;case Int16Array:return 1/32767;case Uint16Array:return 1/65535;default:throw new Error("THREE.GLTFLoader: Unsupported normalized accessor component type.")}}function ry(e){return e.search(/\.jpe?g($|\?)/i)>0||e.search(/^data\:image\/jpeg/)===0?"image/jpeg":e.search(/\.webp($|\?)/i)>0||e.search(/^data\:image\/webp/)===0?"image/webp":e.search(/\.ktx2($|\?)/i)>0||e.search(/^data\:image\/ktx2/)===0?"image/ktx2":"image/png"}function sy(e,t,i){let r=t.attributes,n=new Ci;if(r.POSITION!==void 0){let o=i.json.accessors[r.POSITION],l=o.min,c=o.max;if(l!==void 0&&c!==void 0){if(n.set(new P(l[0],l[1],l[2]),new P(c[0],c[1],c[2])),o.normalized){let h=yl(cn[o.componentType]);n.min.multiplyScalar(h),n.max.multiplyScalar(h)}}else{console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");return}}else return;let a=t.targets;if(a!==void 0){let o=new P,l=new P;for(let c=0,h=a.length;c<h;c++){let u=a[c];if(u.POSITION!==void 0){let d=i.json.accessors[u.POSITION],p=d.min,v=d.max;if(p!==void 0&&v!==void 0){if(l.setX(Math.max(Math.abs(p[0]),Math.abs(v[0]))),l.setY(Math.max(Math.abs(p[1]),Math.abs(v[1]))),l.setZ(Math.max(Math.abs(p[2]),Math.abs(v[2]))),d.normalized){let f=yl(cn[d.componentType]);l.multiplyScalar(f)}o.max(l)}else console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.")}}n.expandByVector(o)}e.boundingBox=n;let s=new Ii;n.getCenter(s.center),s.radius=n.min.distanceTo(n.max)/2,e.boundingSphere=s}function Oh(e,t,i){let r=t.attributes,n=[];function a(s,o){return i.getDependency("accessor",s).then(function(l){e.setAttribute(o,l)})}for(let s in r){let o=xl[s]||s.toLowerCase();o in e.attributes||n.push(a(r[s],o))}if(t.indices!==void 0&&!e.index){let s=i.getDependency("accessor",t.indices).then(function(o){e.setIndex(o)});n.push(s)}return ke.workingColorSpace!==zt&&"COLOR_0"in r&&console.warn(`THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${ke.workingColorSpace}" not supported.`),Mi(e,t),sy(e,t,i),Promise.all(n).then(function(){return t.targets!==void 0?ey(e,t.targets,i):e})}function cy(e){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(e.pointerId),this.domElement.addEventListener("pointermove",this._onPointerMove),this.domElement.addEventListener("pointerup",this._onPointerUp)),!this._isTrackingPointer(e)&&(this._addPointer(e),e.pointerType==="touch"?this._onTouchStart(e):this._onMouseDown(e)))}function hy(e){this.enabled!==!1&&(e.pointerType==="touch"?this._onTouchMove(e):this._onMouseMove(e))}function uy(e){switch(this._removePointer(e),this._pointers.length){case 0:this.domElement.releasePointerCapture(e.pointerId),this.domElement.removeEventListener("pointermove",this._onPointerMove),this.domElement.removeEventListener("pointerup",this._onPointerUp),this.dispatchEvent($u),this.state=st.NONE;break;case 1:let t=this._pointers[0],i=this._pointerPositions[t];this._onTouchStart({pointerId:t,pageX:i.x,pageY:i.y});break}}function dy(e){let t;switch(e.button){case 0:t=this.mouseButtons.LEFT;break;case 1:t=this.mouseButtons.MIDDLE;break;case 2:t=this.mouseButtons.RIGHT;break;default:t=-1}switch(t){case Tr.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(e),this.state=st.DOLLY;break;case Tr.ROTATE:if(e.ctrlKey||e.metaKey||e.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(e),this.state=st.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(e),this.state=st.ROTATE}break;case Tr.PAN:if(e.ctrlKey||e.metaKey||e.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(e),this.state=st.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(e),this.state=st.PAN}break;default:this.state=st.NONE}this.state!==st.NONE&&this.dispatchEvent(Wl)}function py(e){switch(this.state){case st.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(e);break;case st.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(e);break;case st.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(e);break}}function fy(e){this.enabled===!1||this.enableZoom===!1||this.state!==st.NONE||(e.preventDefault(),this.dispatchEvent(Wl),this._handleMouseWheel(this._customWheelEvent(e)),this.dispatchEvent($u))}function my(e){this.enabled!==!1&&this._handleKeyDown(e)}function gy(e){switch(this._trackPointer(e),this._pointers.length){case 1:switch(this.touches.ONE){case en.ROTATE:if(this.enableRotate===!1)return;this._handleTouchStartRotate(e),this.state=st.TOUCH_ROTATE;break;case en.PAN:if(this.enablePan===!1)return;this._handleTouchStartPan(e),this.state=st.TOUCH_PAN;break;default:this.state=st.NONE}break;case 2:switch(this.touches.TWO){case en.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(e),this.state=st.TOUCH_DOLLY_PAN;break;case en.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(e),this.state=st.TOUCH_DOLLY_ROTATE;break;default:this.state=st.NONE}break;default:this.state=st.NONE}this.state!==st.NONE&&this.dispatchEvent(Wl)}function vy(e){switch(this._trackPointer(e),this.state){case st.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(e),this.update();break;case st.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(e),this.update();break;case st.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(e),this.update();break;case st.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(e),this.update();break;default:this.state=st.NONE}}function _y(e){this.enabled!==!1&&e.preventDefault()}function xy(e){e.key==="Control"&&(this._controlActive=!0,this.domElement.getRootNode().addEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function yy(e){e.key==="Control"&&(this._controlActive=!1,this.domElement.getRootNode().removeEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function Kr(e){return new Nu({color:0,emissive:16777215,emissiveIntensity:e})}function Ny(e,t){return Ly(e.subarray(Dy(e,t&&t.dictionary),-4),{i:2},t&&t.out,t&&t.dictionary)}function rd(e,t,i){let r=i.length-e-1;if(t>=i[r])return r-1;if(t<=i[e])return e;let n=e,a=r,s=Math.floor((n+a)/2);for(;t<i[s]||t>=i[s+1];)t<i[s]?a=s:n=s,s=Math.floor((n+a)/2);return s}function Fy(e,t,i,r){let n=[],a=[],s=[];n[0]=1;for(let o=1;o<=i;++o){a[o]=t-r[e+1-o],s[o]=r[e+o]-t;let l=0;for(let c=0;c<o;++c){let h=s[c+1],u=a[o-c],d=n[c]/(h+u);n[c]=l+h*d,l=u*d}n[o]=l}return n}function ky(e,t,i,r){let n=rd(e,r,t),a=Fy(n,r,e,t),s=new Ye(0,0,0,0);for(let o=0;o<=e;++o){let l=i[n-e+o],c=a[o],h=l.w*c;s.x+=l.x*h,s.y+=l.y*h,s.z+=l.z*h,s.w+=l.w*c}return s}function By(e,t,i,r,n){let a=[];for(let u=0;u<=i;++u)a[u]=0;let s=[];for(let u=0;u<=r;++u)s[u]=a.slice(0);let o=[];for(let u=0;u<=i;++u)o[u]=a.slice(0);o[0][0]=1;let l=a.slice(0),c=a.slice(0);for(let u=1;u<=i;++u){l[u]=t-n[e+1-u],c[u]=n[e+u]-t;let d=0;for(let p=0;p<u;++p){let v=c[p+1],f=l[u-p];o[u][p]=v+f;let g=o[p][u-1]/o[u][p];o[p][u]=d+v*g,d=f*g}o[u][u]=d}for(let u=0;u<=i;++u)s[0][u]=o[u][i];for(let u=0;u<=i;++u){let d=0,p=1,v=[];for(let f=0;f<=i;++f)v[f]=a.slice(0);v[0][0]=1;for(let f=1;f<=r;++f){let g=0,m=u-f,y=i-f;u>=f&&(v[p][0]=v[d][0]/o[y+1][m],g=v[p][0]*o[m][y]);let x=m>=-1?1:-m,_=u-1<=y?f-1:i-u;for(let E=x;E<=_;++E)v[p][E]=(v[d][E]-v[d][E-1])/o[y+1][m+E],g+=v[p][E]*o[m+E][y];u<=y&&(v[p][f]=-v[d][f-1]/o[y+1][u],g+=v[p][f]*o[u][y]),s[f][u]=g;let S=d;d=p,p=S}}let h=i;for(let u=1;u<=r;++u){for(let d=0;d<=i;++d)s[u][d]*=h;h*=i-u}return s}function zy(e,t,i,r,n){let a=n<e?n:e,s=[],o=rd(e,r,t),l=By(o,r,e,a,t),c=[];for(let h=0;h<i.length;++h){let u=i[h].clone(),d=u.w;u.x*=d,u.y*=d,u.z*=d,c[h]=u}for(let h=0;h<=a;++h){let u=c[o-e].clone().multiplyScalar(l[h][0]);for(let d=1;d<=e;++d)u.add(c[o-e+d].clone().multiplyScalar(l[h][d]));s[h]=u}for(let h=a+1;h<=n+1;++h)s[h]=new Ye(0,0,0);return s}function Hy(e,t){let i=1;for(let n=2;n<=e;++n)i*=n;let r=1;for(let n=2;n<=t;++n)r*=n;for(let n=2;n<=e-t;++n)r*=n;return i/r}function Vy(e){let t=e.length,i=[],r=[];for(let a=0;a<t;++a){let s=e[a];i[a]=new P(s.x,s.y,s.z),r[a]=s.w}let n=[];for(let a=0;a<t;++a){let s=i[a].clone();for(let o=1;o<=a;++o)s.sub(n[a-o].clone().multiplyScalar(Hy(a,o)*r[o]));n[a]=s.divideScalar(r[0])}return n}function Wy(e,t,i,r,n){let a=zy(e,t,i,r,n);return Vy(a)}function Zy(e){let t="Kaydara FBX Binary  \0";return e.byteLength>=t.length&&t===sd(e,0,t.length)}function Jy(e){let t=["K","a","y","d","a","r","a","\\","F","B","X","\\","B","i","n","a","r","y","\\","\\"],i=0;function r(n){let a=e[n-1];return e=e.slice(i+n),i++,a}for(let n=0;n<t.length;++n)if(r(1)===t[n])return!1;return!0}function zh(e){let t=/FBXVersion: (\d+)/,i=e.match(t);if(i)return parseInt(i[1]);throw new Error("THREE.FBXLoader: Cannot find the version number for the file given.")}function Qy(e){return e/46186158e3}function ja(e,t,i,r){let n;switch(r.mappingType){case"ByPolygonVertex":n=e;break;case"ByPolygon":n=t;break;case"ByVertice":n=i;break;case"AllSame":n=r.indices[0];break;default:console.warn("THREE.FBXLoader: unknown attribute mapping type "+r.mappingType)}r.referenceType==="IndexToDirect"&&(n=r.indices[n]);let a=n*r.dataSize,s=a+r.dataSize;return ib(eb,r.buffer,a,s)}function ad(e){let t=new we,i=new we,r=new we,n=new we,a=new we,s=new we,o=new we,l=new we,c=new we,h=new we,u=new we,d=new we,p=e.inheritType?e.inheritType:0;e.translation&&t.setPosition(Zr.fromArray(e.translation));let v=ea(0);if(e.preRotation){let R=e.preRotation.map(Rt.degToRad);R.push(v),i.makeRotationFromEuler(Mo.fromArray(R))}if(e.rotation){let R=e.rotation.map(Rt.degToRad);R.push(e.eulerOrder||v),r.makeRotationFromEuler(Mo.fromArray(R))}if(e.postRotation){let R=e.postRotation.map(Rt.degToRad);R.push(v),n.makeRotationFromEuler(Mo.fromArray(R)),n.invert()}e.scale&&a.scale(Zr.fromArray(e.scale)),e.scalingOffset&&o.setPosition(Zr.fromArray(e.scalingOffset)),e.scalingPivot&&s.setPosition(Zr.fromArray(e.scalingPivot)),e.rotationOffset&&l.setPosition(Zr.fromArray(e.rotationOffset)),e.rotationPivot&&c.setPosition(Zr.fromArray(e.rotationPivot)),e.parentMatrixWorld&&(u.copy(e.parentMatrix),h.copy(e.parentMatrixWorld));let f=i.clone().multiply(r).multiply(n),g=new we;g.extractRotation(h);let m=new we;m.copyPosition(h);let y=m.clone().invert().multiply(h),x=g.clone().invert().multiply(y),_=a,S=new we;if(p===0)S.copy(g).multiply(f).multiply(x).multiply(_);else if(p===1)S.copy(g).multiply(x).multiply(f).multiply(_);else{let R=new we().scale(new P().setFromMatrixScale(u)).clone().invert(),G=x.clone().multiply(R);S.copy(g).multiply(f).multiply(G).multiply(_)}let E=c.clone().invert(),A=s.clone().invert(),C=t.clone().multiply(l).multiply(c).multiply(i).multiply(r).multiply(n).multiply(E).multiply(o).multiply(s).multiply(a).multiply(A),b=new we().copyPosition(C),w=h.clone().multiply(b);return d.copyPosition(w),C=d.clone().multiply(S),C.premultiply(h.invert()),C}function ea(e){e=e||0;let t=["ZYX","YZX","XZY","ZXY","YXZ","XYZ"];return e===6?(console.warn("THREE.FBXLoader: unsupported Euler Order: Spherical XYZ. Animations and rotations may be incorrect."),t[0]):t[e]}function So(e){return e.split(",").map(function(t){return parseFloat(t)})}function sd(e,t,i){return t===void 0&&(t=0),i===void 0&&(i=e.byteLength),new TextDecoder().decode(new Uint8Array(e,t,i))}function tb(e,t){for(let i=0,r=e.length,n=t.length;i<n;i++,r++)e[r]=t[i]}function ib(e,t,i,r){for(let n=i,a=0;n<r;n++,a++)e[a]=t[n];return e}function ob(){let e={objects:[],object:{},vertices:[],normals:[],colors:[],uvs:[],materials:{},materialLibraries:[],startObject:function(t,i){if(this.object&&this.object.fromDeclaration===!1){this.object.name=t,this.object.fromDeclaration=i!==!1;return}let r=this.object&&typeof this.object.currentMaterial=="function"?this.object.currentMaterial():void 0;if(this.object&&typeof this.object._finalize=="function"&&this.object._finalize(!0),this.object={name:t||"",fromDeclaration:i!==!1,geometry:{vertices:[],normals:[],colors:[],uvs:[],hasUVIndices:!1},materials:[],smooth:!0,startMaterial:function(n,a){let s=this._finalize(!1);s&&(s.inherited||s.groupCount<=0)&&this.materials.splice(s.index,1);let o={index:this.materials.length,name:n||"",mtllib:Array.isArray(a)&&a.length>0?a[a.length-1]:"",smooth:s!==void 0?s.smooth:this.smooth,groupStart:s!==void 0?s.groupEnd:0,groupEnd:-1,groupCount:-1,inherited:!1,clone:function(l){let c={index:typeof l=="number"?l:this.index,name:this.name,mtllib:this.mtllib,smooth:this.smooth,groupStart:0,groupEnd:-1,groupCount:-1,inherited:!1};return c.clone=this.clone.bind(c),c}};return this.materials.push(o),o},currentMaterial:function(){if(this.materials.length>0)return this.materials[this.materials.length-1]},_finalize:function(n){let a=this.currentMaterial();if(a&&a.groupEnd===-1&&(a.groupEnd=this.geometry.vertices.length/3,a.groupCount=a.groupEnd-a.groupStart,a.inherited=!1),n&&this.materials.length>1)for(let s=this.materials.length-1;s>=0;s--)this.materials[s].groupCount<=0&&this.materials.splice(s,1);return n&&this.materials.length===0&&this.materials.push({name:"",smooth:this.smooth}),a}},r&&r.name&&typeof r.clone=="function"){let n=r.clone(0);n.inherited=!0,this.object.materials.push(n)}this.objects.push(this.object)},finalize:function(){this.object&&typeof this.object._finalize=="function"&&this.object._finalize(!0)},parseVertexIndex:function(t,i){let r=parseInt(t,10);return(r>=0?r-1:r+i/3)*3},parseNormalIndex:function(t,i){let r=parseInt(t,10);return(r>=0?r-1:r+i/3)*3},parseUVIndex:function(t,i){let r=parseInt(t,10);return(r>=0?r-1:r+i/2)*2},addVertex:function(t,i,r){let n=this.vertices,a=this.object.geometry.vertices;a.push(n[t+0],n[t+1],n[t+2]),a.push(n[i+0],n[i+1],n[i+2]),a.push(n[r+0],n[r+1],n[r+2])},addVertexPoint:function(t){let i=this.vertices;this.object.geometry.vertices.push(i[t+0],i[t+1],i[t+2])},addVertexLine:function(t){let i=this.vertices;this.object.geometry.vertices.push(i[t+0],i[t+1],i[t+2])},addNormal:function(t,i,r){let n=this.normals,a=this.object.geometry.normals;a.push(n[t+0],n[t+1],n[t+2]),a.push(n[i+0],n[i+1],n[i+2]),a.push(n[r+0],n[r+1],n[r+2])},addFaceNormal:function(t,i,r){let n=this.vertices,a=this.object.geometry.normals;Vh.fromArray(n,t),Eo.fromArray(n,i),Wh.fromArray(n,r),Jt.subVectors(Wh,Eo),Gh.subVectors(Vh,Eo),Jt.cross(Gh),Jt.normalize(),a.push(Jt.x,Jt.y,Jt.z),a.push(Jt.x,Jt.y,Jt.z),a.push(Jt.x,Jt.y,Jt.z)},addColor:function(t,i,r){let n=this.colors,a=this.object.geometry.colors;n[t]!==void 0&&a.push(n[t+0],n[t+1],n[t+2]),n[i]!==void 0&&a.push(n[i+0],n[i+1],n[i+2]),n[r]!==void 0&&a.push(n[r+0],n[r+1],n[r+2])},addUV:function(t,i,r){let n=this.uvs,a=this.object.geometry.uvs;a.push(n[t+0],n[t+1]),a.push(n[i+0],n[i+1]),a.push(n[r+0],n[r+1])},addDefaultUV:function(){let t=this.object.geometry.uvs;t.push(0,0),t.push(0,0),t.push(0,0)},addUVLine:function(t){let i=this.uvs;this.object.geometry.uvs.push(i[t+0],i[t+1])},addFace:function(t,i,r,n,a,s,o,l,c){let h=this.vertices.length,u=this.parseVertexIndex(t,h),d=this.parseVertexIndex(i,h),p=this.parseVertexIndex(r,h);if(this.addVertex(u,d,p),this.addColor(u,d,p),o!==void 0&&o!==""){let v=this.normals.length;u=this.parseNormalIndex(o,v),d=this.parseNormalIndex(l,v),p=this.parseNormalIndex(c,v),this.addNormal(u,d,p)}else this.addFaceNormal(u,d,p);if(n!==void 0&&n!==""){let v=this.uvs.length;u=this.parseUVIndex(n,v),d=this.parseUVIndex(a,v),p=this.parseUVIndex(s,v),this.addUV(u,d,p),this.object.geometry.hasUVIndices=!0}else this.addDefaultUV()},addPointGeometry:function(t){this.object.geometry.type="Points";let i=this.vertices.length;for(let r=0,n=t.length;r<n;r++){let a=this.parseVertexIndex(t[r],i);this.addVertexPoint(a),this.addColor(a)}},addLineGeometry:function(t,i){this.object.geometry.type="Line";let r=this.vertices.length,n=this.uvs.length;for(let a=0,s=t.length;a<s;a++)this.addVertexLine(this.parseVertexIndex(t[a],r));for(let a=0,s=i.length;a<s;a++)this.addUVLine(this.parseUVIndex(i[a],n))}};return e.startObject("",!1),e}var Tr,en,tp,mc,ip,jh,rp,Vi,Ai,kt,Ei,ar,on,gc,vc,_c,np,wr,ap,sp,op,lp,cp,hp,up,dp,To,Ao,pp,fp,mp,gp,vp,_p,xp,yp,bp,Ro,Co,Io,hn,Lo,Po,Do,No,hs,wp,Mp,sr,Sp,Ep,Tp,Xh,Ap,Rp,Cp,xc,Ip,qh,un,dn,ts,Uo,us,ji,ti,is,Bt,Yh,Nn,Nt,qa,pi,Ri,$h,Kh,Hn,wl,Cr,fi,ta,Ml,Sl,Vn,Zh,Jh,Qh,eu,ii,Wn,Gn,El,Tl,tu,Al,Rl,Ya,$a,Ka,Za,Oo,Fo,ko,Bo,zo,Ho,Vo,Wo,Go,jo,Xo,qo,Yo,$o,Ko,Zo,Jo,Qo,el,tl,il,rl,nl,al,sl,ol,ll,cl,iu,Lp,Pp,jn,Xn,Ns,tn,rn,rs,Cl,Dp,Np,ru,hl,Up,Op,ds,Fp,nr,je,zt,ns,nt,Nr,yc,kp,Bp,zp,nu,Hp,Vp,Wp,Gp,ul,bc,Ti,as,cr,Lt,wc,Fn,pn,Rt,De,gt,P,Us,Mc,Ve,Os,Sc,Ec,Tc,ke,Ur,uf,df,Ll,pf,ks,Ht,Ye,ff,Ir,hu,mf,Ci,Ui,oi,fa,Or,Fr,kr,$i,Ki,fr,Sn,ma,ga,mr,gf,En,zs,Ii,Oi,Hs,va,Zi,Vs,_a,Ws,ia,we,Br,li,vf,_f,Ji,xa,qt,Ac,Rc,Ct,du,xf,Cc,zr,Fi,ya,Tn,yf,bf,Ic,Lc,Pc,Dc,wf,Hr,Gs,dt,ci,ki,js,Bi,Vr,Wr,Nc,Xs,qs,Ys,$s,Ks,Zs,An,pu,Qi,ba,_e,Pt,Mf,jt,Sr,yt,wa,Sf,Et,Pl,fu,Ze,Ef,Zt,Qs,Gr,Yt,Rn,St,It,Uc,gr,Ma,Oc,Sa,Ea,Ta,eo,Aa,Fc,Ra,pt,ps,Rf,Cf,If,or,_u,er,kc,Bc,Dt,jr,Xr,Lf,xu,Pf,mi,Df,to,yu,Nf,Ut,Uf,zc,Hc,Vc,Of,Wc,Ia,io,Gc,ro,wu,$n,Dl,jc,Ff,Nl,pl,qr,Xc,La,qc,kf,Cn,In,Su,no,Bf,zf,rr,vr,Hf,Pa,Ul,Ar,ss,os,Yc,Ln,Da,ao,$c,fs,Kc,Zc,ls,Vf,Er,Jc,fl,Ua,Oa,Bn,Eu,Tu,Wf,om,lm,Pu,gn,Li,nn,Nu,cm,hm,ra,pm,Ou,fm,vi,vn,Fu,Pr,mm,Xi,_n,lr,Qn,Wi,ku,Bu,Vt,zi,_m,qi,Yr,xm,ym,Ol,na,bm,so,nh,ah,Fl,wm,zu,sh,Pn,oo,Mm,cs,kl,Sm,Bl,Em,Rr,lo,Tm,Am,Rm,zl,Cm,Hl,Im,Lm,Pm,Dm,Nm,Um,Om,Fm,at,km,Bm,zm,oh,tr,za,co,Hm,Vm,jm,Xm,qm,Ym,$m,Km,Zm,Jm,Qm,eg,tg,ig,rg,ng,ag,sg,og,lg,cg,hg,ug,dg,pg,fg,mg,gg,vg,_g,xg,yg,bg,wg,Mg,Sg,Eg,Tg,Ag,Rg,Cg,Ig,Lg,Pg,Dg,Ng,Ug,Og,Fg,kg,Bg,zg,Hg,Vg,Wg,Gg,jg,Xg,qg,Yg,$g,Kg,Zg,Jg,Qg,ev,tv,iv,rv,nv,av,sv,ov,lv,cv,hv,uv,dv,pv,fv,mv,gv,vv,_v,xv,yv,bv,wv,Mv,Sv,Ev,Tv,Av,Rv,Cv,Iv,Lv,Pv,Dv,Nv,Uv,Ov,Fv,kv,Bv,zv,Hv,Vv,Wv,Gv,jv,Xv,qv,Yv,$v,Kv,Zv,Jv,Qv,e0,t0,i0,r0,n0,a0,s0,o0,l0,c0,h0,u0,d0,p0,f0,m0,g0,v0,_0,x0,y0,b0,w0,M0,He,ue,Si,Ha,_r,S0,an,ch,Mr,ho,hh,uo,po,fo,mo,br,$r,uh,L0,vl,Wu,mh,Gu,ju,Xu,gh,vh,_h,xh,yh,A_,R_,C_,go,es,L_,P_,Mh,Wa,H_,V_,G_,J_,Q_,ex,ox,ux,dx,fx,_x,xx,yx,bx,xr,wx,Ex,Tx,qe,Rx,Cx,Ix,Lx,Px,Dx,Nx,Ux,Ox,Fx,kx,Bx,zx,Hx,Vx,Wx,Gx,jx,qu,Dn,Dh,Xx,qx,Yx,$x,Yu,Kx,Zx,Qt,cn,Nh,Uh,vo,xl,ir,Jx,_o,ny,ay,Fh,Wl,$u,Ga,kh,oy,bt,Wt,st,yo,ly,by,ei,sn,wy,Ku,Zu,My,Ju,Qu,ed,Sy,td,Ey,jb,bl,Hi,Je,zn,aa,Je,Je,Je,Je,id,Je,Ty,Ay,bo,hi,wo,Ry,Cy,Iy,ui,Ly,Py,Dy,Uy,Oy,Gy,Ge,_t,Ft,jy,Xy,qy,Yy,$y,Ky,Bh,nd,eb,Mo,Zr,rb,nb,ab,sb,Hh,Vh,Eo,Wh,Gh,Jt,Xa,lb,cb,hb,ub,Gt,db,pb,fb,mb,ld=kd(()=>{Tr={LEFT:0,MIDDLE:1,RIGHT:2,ROTATE:0,DOLLY:1,PAN:2},en={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},tp=0,mc=1,ip=2,jh=1,rp=2,Vi=3,Ai=0,kt=1,Ei=2,ar=0,on=1,gc=2,vc=3,_c=4,np=5,wr=100,ap=101,sp=102,op=103,lp=104,cp=200,hp=201,up=202,dp=203,To=204,Ao=205,pp=206,fp=207,mp=208,gp=209,vp=210,_p=211,xp=212,yp=213,bp=214,Ro=0,Co=1,Io=2,hn=3,Lo=4,Po=5,Do=6,No=7,hs=0,wp=1,Mp=2,sr=0,Sp=1,Ep=2,Tp=3,Xh=4,Ap=5,Rp=6,Cp=7,xc="attached",Ip="detached",qh=300,un=301,dn=302,ts=303,Uo=304,us=306,ji=1e3,ti=1001,is=1002,Bt=1003,Yh=1004,Nn=1005,Nt=1006,qa=1007,pi=1008,Ri=1009,$h=1010,Kh=1011,Hn=1012,wl=1013,Cr=1014,fi=1015,ta=1016,Ml=1017,Sl=1018,Vn=1020,Zh=35902,Jh=35899,Qh=1021,eu=1022,ii=1023,Wn=1026,Gn=1027,El=1028,Tl=1029,tu=1030,Al=1031,Rl=1033,Ya=33776,$a=33777,Ka=33778,Za=33779,Oo=35840,Fo=35841,ko=35842,Bo=35843,zo=36196,Ho=37492,Vo=37496,Wo=37808,Go=37809,jo=37810,Xo=37811,qo=37812,Yo=37813,$o=37814,Ko=37815,Zo=37816,Jo=37817,Qo=37818,el=37819,tl=37820,il=37821,rl=36492,nl=36494,al=36495,sl=36283,ol=36284,ll=36285,cl=36286,iu=2200,Lp=2201,Pp=2202,jn=2300,Xn=2301,Ns=2302,tn=2400,rn=2401,rs=2402,Cl=2500,Dp=2501,Np=0,ru=1,hl=2,Up=3200,Op=3201,ds=0,Fp=1,nr="",je="srgb",zt="srgb-linear",ns="linear",nt="srgb",Nr=7680,yc=519,kp=512,Bp=513,zp=514,nu=515,Hp=516,Vp=517,Wp=518,Gp=519,ul=35044,bc="300 es",Ti=2e3,as=2001,cr=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let i=this._listeners;i[e]===void 0&&(i[e]=[]),i[e].indexOf(t)===-1&&i[e].push(t)}hasEventListener(e,t){let i=this._listeners;return i===void 0?!1:i[e]!==void 0&&i[e].indexOf(t)!==-1}removeEventListener(e,t){let i=this._listeners;if(i===void 0)return;let r=i[e];if(r!==void 0){let n=r.indexOf(t);n!==-1&&r.splice(n,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let i=t[e.type];if(i!==void 0){e.target=this;let r=i.slice(0);for(let n=0,a=r.length;n<a;n++)r[n].call(this,e);e.target=null}}},Lt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],wc=1234567,Fn=Math.PI/180,pn=180/Math.PI;Rt={DEG2RAD:Fn,RAD2DEG:pn,generateUUID:gi,clamp:ze,euclideanModulo:Il,mapLinear:jp,inverseLerp:Xp,lerp:kn,damp:qp,pingpong:Yp,smoothstep:$p,smootherstep:Kp,randInt:Zp,randFloat:Jp,randFloatSpread:Qp,seededRandom:ef,degToRad:tf,radToDeg:rf,isPowerOfTwo:nf,ceilPowerOfTwo:af,floorPowerOfTwo:sf,setQuaternionFromProperEuler:of,normalize:et,denormalize:di},De=class au{constructor(t=0,i=0){au.prototype.isVector2=!0,this.x=t,this.y=i}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,i){return this.x=t,this.y=i,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,i){switch(t){case 0:this.x=i;break;case 1:this.y=i;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,i){return this.x=t.x+i.x,this.y=t.y+i.y,this}addScaledVector(t,i){return this.x+=t.x*i,this.y+=t.y*i,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,i){return this.x=t.x-i.x,this.y=t.y-i.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){let i=this.x,r=this.y,n=t.elements;return this.x=n[0]*i+n[3]*r+n[6],this.y=n[1]*i+n[4]*r+n[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,i){return this.x=ze(this.x,t.x,i.x),this.y=ze(this.y,t.y,i.y),this}clampScalar(t,i){return this.x=ze(this.x,t,i),this.y=ze(this.y,t,i),this}clampLength(t,i){let r=this.length();return this.divideScalar(r||1).multiplyScalar(ze(r,t,i))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){let i=Math.sqrt(this.lengthSq()*t.lengthSq());if(i===0)return Math.PI/2;let r=this.dot(t)/i;return Math.acos(ze(r,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let i=this.x-t.x,r=this.y-t.y;return i*i+r*r}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,i){return this.x+=(t.x-this.x)*i,this.y+=(t.y-this.y)*i,this}lerpVectors(t,i,r){return this.x=t.x+(i.x-t.x)*r,this.y=t.y+(i.y-t.y)*r,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,i=0){return this.x=t[i],this.y=t[i+1],this}toArray(t=[],i=0){return t[i]=this.x,t[i+1]=this.y,t}fromBufferAttribute(t,i){return this.x=t.getX(i),this.y=t.getY(i),this}rotateAround(t,i){let r=Math.cos(i),n=Math.sin(i),a=this.x-t.x,s=this.y-t.y;return this.x=a*r-s*n+t.x,this.y=a*n+s*r+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},gt=class{constructor(e=0,t=0,i=0,r=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=i,this._w=r}static slerpFlat(e,t,i,r,n,a,s){let o=i[r+0],l=i[r+1],c=i[r+2],h=i[r+3],u=n[a+0],d=n[a+1],p=n[a+2],v=n[a+3];if(s===0){e[t+0]=o,e[t+1]=l,e[t+2]=c,e[t+3]=h;return}if(s===1){e[t+0]=u,e[t+1]=d,e[t+2]=p,e[t+3]=v;return}if(h!==v||o!==u||l!==d||c!==p){let f=1-s,g=o*u+l*d+c*p+h*v,m=g>=0?1:-1,y=1-g*g;if(y>Number.EPSILON){let _=Math.sqrt(y),S=Math.atan2(_,g*m);f=Math.sin(f*S)/_,s=Math.sin(s*S)/_}let x=s*m;if(o=o*f+u*x,l=l*f+d*x,c=c*f+p*x,h=h*f+v*x,f===1-s){let _=1/Math.sqrt(o*o+l*l+c*c+h*h);o*=_,l*=_,c*=_,h*=_}}e[t]=o,e[t+1]=l,e[t+2]=c,e[t+3]=h}static multiplyQuaternionsFlat(e,t,i,r,n,a){let s=i[r],o=i[r+1],l=i[r+2],c=i[r+3],h=n[a],u=n[a+1],d=n[a+2],p=n[a+3];return e[t]=s*p+c*h+o*d-l*u,e[t+1]=o*p+c*u+l*h-s*d,e[t+2]=l*p+c*d+s*u-o*h,e[t+3]=c*p-s*h-o*u-l*d,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,i,r){return this._x=e,this._y=t,this._z=i,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let i=e._x,r=e._y,n=e._z,a=e._order,s=Math.cos,o=Math.sin,l=s(i/2),c=s(r/2),h=s(n/2),u=o(i/2),d=o(r/2),p=o(n/2);switch(a){case"XYZ":this._x=u*c*h+l*d*p,this._y=l*d*h-u*c*p,this._z=l*c*p+u*d*h,this._w=l*c*h-u*d*p;break;case"YXZ":this._x=u*c*h+l*d*p,this._y=l*d*h-u*c*p,this._z=l*c*p-u*d*h,this._w=l*c*h+u*d*p;break;case"ZXY":this._x=u*c*h-l*d*p,this._y=l*d*h+u*c*p,this._z=l*c*p+u*d*h,this._w=l*c*h-u*d*p;break;case"ZYX":this._x=u*c*h-l*d*p,this._y=l*d*h+u*c*p,this._z=l*c*p-u*d*h,this._w=l*c*h+u*d*p;break;case"YZX":this._x=u*c*h+l*d*p,this._y=l*d*h+u*c*p,this._z=l*c*p-u*d*h,this._w=l*c*h-u*d*p;break;case"XZY":this._x=u*c*h-l*d*p,this._y=l*d*h-u*c*p,this._z=l*c*p+u*d*h,this._w=l*c*h+u*d*p;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let i=t/2,r=Math.sin(i);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,i=t[0],r=t[4],n=t[8],a=t[1],s=t[5],o=t[9],l=t[2],c=t[6],h=t[10],u=i+s+h;if(u>0){let d=.5/Math.sqrt(u+1);this._w=.25/d,this._x=(c-o)*d,this._y=(n-l)*d,this._z=(a-r)*d}else if(i>s&&i>h){let d=2*Math.sqrt(1+i-s-h);this._w=(c-o)/d,this._x=.25*d,this._y=(r+a)/d,this._z=(n+l)/d}else if(s>h){let d=2*Math.sqrt(1+s-i-h);this._w=(n-l)/d,this._x=(r+a)/d,this._y=.25*d,this._z=(o+c)/d}else{let d=2*Math.sqrt(1+h-i-s);this._w=(a-r)/d,this._x=(n+l)/d,this._y=(o+c)/d,this._z=.25*d}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let i=e.dot(t)+1;return i<1e-8?(i=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=i):(this._x=0,this._y=-e.z,this._z=e.y,this._w=i)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=i),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(ze(this.dot(e),-1,1)))}rotateTowards(e,t){let i=this.angleTo(e);if(i===0)return this;let r=Math.min(1,t/i);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let i=e._x,r=e._y,n=e._z,a=e._w,s=t._x,o=t._y,l=t._z,c=t._w;return this._x=i*c+a*s+r*l-n*o,this._y=r*c+a*o+n*s-i*l,this._z=n*c+a*l+i*o-r*s,this._w=a*c-i*s-r*o-n*l,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);let i=this._x,r=this._y,n=this._z,a=this._w,s=a*e._w+i*e._x+r*e._y+n*e._z;if(s<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,s=-s):this.copy(e),s>=1)return this._w=a,this._x=i,this._y=r,this._z=n,this;let o=1-s*s;if(o<=Number.EPSILON){let d=1-t;return this._w=d*a+t*this._w,this._x=d*i+t*this._x,this._y=d*r+t*this._y,this._z=d*n+t*this._z,this.normalize(),this}let l=Math.sqrt(o),c=Math.atan2(l,s),h=Math.sin((1-t)*c)/l,u=Math.sin(t*c)/l;return this._w=a*h+this._w*u,this._x=i*h+this._x*u,this._y=r*h+this._y*u,this._z=n*h+this._z*u,this._onChangeCallback(),this}slerpQuaternions(e,t,i){return this.copy(e).slerp(t,i)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),i=Math.random(),r=Math.sqrt(1-i),n=Math.sqrt(i);return this.set(r*Math.sin(e),r*Math.cos(e),n*Math.sin(t),n*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},P=class su{constructor(t=0,i=0,r=0){su.prototype.isVector3=!0,this.x=t,this.y=i,this.z=r}set(t,i,r){return r===void 0&&(r=this.z),this.x=t,this.y=i,this.z=r,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,i){switch(t){case 0:this.x=i;break;case 1:this.y=i;break;case 2:this.z=i;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,i){return this.x=t.x+i.x,this.y=t.y+i.y,this.z=t.z+i.z,this}addScaledVector(t,i){return this.x+=t.x*i,this.y+=t.y*i,this.z+=t.z*i,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,i){return this.x=t.x-i.x,this.y=t.y-i.y,this.z=t.z-i.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,i){return this.x=t.x*i.x,this.y=t.y*i.y,this.z=t.z*i.z,this}applyEuler(t){return this.applyQuaternion(Mc.setFromEuler(t))}applyAxisAngle(t,i){return this.applyQuaternion(Mc.setFromAxisAngle(t,i))}applyMatrix3(t){let i=this.x,r=this.y,n=this.z,a=t.elements;return this.x=a[0]*i+a[3]*r+a[6]*n,this.y=a[1]*i+a[4]*r+a[7]*n,this.z=a[2]*i+a[5]*r+a[8]*n,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){let i=this.x,r=this.y,n=this.z,a=t.elements,s=1/(a[3]*i+a[7]*r+a[11]*n+a[15]);return this.x=(a[0]*i+a[4]*r+a[8]*n+a[12])*s,this.y=(a[1]*i+a[5]*r+a[9]*n+a[13])*s,this.z=(a[2]*i+a[6]*r+a[10]*n+a[14])*s,this}applyQuaternion(t){let i=this.x,r=this.y,n=this.z,a=t.x,s=t.y,o=t.z,l=t.w,c=2*(s*n-o*r),h=2*(o*i-a*n),u=2*(a*r-s*i);return this.x=i+l*c+s*u-o*h,this.y=r+l*h+o*c-a*u,this.z=n+l*u+a*h-s*c,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){let i=this.x,r=this.y,n=this.z,a=t.elements;return this.x=a[0]*i+a[4]*r+a[8]*n,this.y=a[1]*i+a[5]*r+a[9]*n,this.z=a[2]*i+a[6]*r+a[10]*n,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,i){return this.x=ze(this.x,t.x,i.x),this.y=ze(this.y,t.y,i.y),this.z=ze(this.z,t.z,i.z),this}clampScalar(t,i){return this.x=ze(this.x,t,i),this.y=ze(this.y,t,i),this.z=ze(this.z,t,i),this}clampLength(t,i){let r=this.length();return this.divideScalar(r||1).multiplyScalar(ze(r,t,i))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,i){return this.x+=(t.x-this.x)*i,this.y+=(t.y-this.y)*i,this.z+=(t.z-this.z)*i,this}lerpVectors(t,i,r){return this.x=t.x+(i.x-t.x)*r,this.y=t.y+(i.y-t.y)*r,this.z=t.z+(i.z-t.z)*r,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,i){let r=t.x,n=t.y,a=t.z,s=i.x,o=i.y,l=i.z;return this.x=n*l-a*o,this.y=a*s-r*l,this.z=r*o-n*s,this}projectOnVector(t){let i=t.lengthSq();if(i===0)return this.set(0,0,0);let r=t.dot(this)/i;return this.copy(t).multiplyScalar(r)}projectOnPlane(t){return Us.copy(this).projectOnVector(t),this.sub(Us)}reflect(t){return this.sub(Us.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){let i=Math.sqrt(this.lengthSq()*t.lengthSq());if(i===0)return Math.PI/2;let r=this.dot(t)/i;return Math.acos(ze(r,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let i=this.x-t.x,r=this.y-t.y,n=this.z-t.z;return i*i+r*r+n*n}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,i,r){let n=Math.sin(i)*t;return this.x=n*Math.sin(r),this.y=Math.cos(i)*t,this.z=n*Math.cos(r),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,i,r){return this.x=t*Math.sin(i),this.y=r,this.z=t*Math.cos(i),this}setFromMatrixPosition(t){let i=t.elements;return this.x=i[12],this.y=i[13],this.z=i[14],this}setFromMatrixScale(t){let i=this.setFromMatrixColumn(t,0).length(),r=this.setFromMatrixColumn(t,1).length(),n=this.setFromMatrixColumn(t,2).length();return this.x=i,this.y=r,this.z=n,this}setFromMatrixColumn(t,i){return this.fromArray(t.elements,i*4)}setFromMatrix3Column(t,i){return this.fromArray(t.elements,i*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,i=0){return this.x=t[i],this.y=t[i+1],this.z=t[i+2],this}toArray(t=[],i=0){return t[i]=this.x,t[i+1]=this.y,t[i+2]=this.z,t}fromBufferAttribute(t,i){return this.x=t.getX(i),this.y=t.getY(i),this.z=t.getZ(i),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let t=Math.random()*Math.PI*2,i=Math.random()*2-1,r=Math.sqrt(1-i*i);return this.x=r*Math.cos(t),this.y=i,this.z=r*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},Us=new P,Mc=new gt,Ve=class ou{constructor(t,i,r,n,a,s,o,l,c){ou.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,i,r,n,a,s,o,l,c)}set(t,i,r,n,a,s,o,l,c){let h=this.elements;return h[0]=t,h[1]=n,h[2]=o,h[3]=i,h[4]=a,h[5]=l,h[6]=r,h[7]=s,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){let i=this.elements,r=t.elements;return i[0]=r[0],i[1]=r[1],i[2]=r[2],i[3]=r[3],i[4]=r[4],i[5]=r[5],i[6]=r[6],i[7]=r[7],i[8]=r[8],this}extractBasis(t,i,r){return t.setFromMatrix3Column(this,0),i.setFromMatrix3Column(this,1),r.setFromMatrix3Column(this,2),this}setFromMatrix4(t){let i=t.elements;return this.set(i[0],i[4],i[8],i[1],i[5],i[9],i[2],i[6],i[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,i){let r=t.elements,n=i.elements,a=this.elements,s=r[0],o=r[3],l=r[6],c=r[1],h=r[4],u=r[7],d=r[2],p=r[5],v=r[8],f=n[0],g=n[3],m=n[6],y=n[1],x=n[4],_=n[7],S=n[2],E=n[5],A=n[8];return a[0]=s*f+o*y+l*S,a[3]=s*g+o*x+l*E,a[6]=s*m+o*_+l*A,a[1]=c*f+h*y+u*S,a[4]=c*g+h*x+u*E,a[7]=c*m+h*_+u*A,a[2]=d*f+p*y+v*S,a[5]=d*g+p*x+v*E,a[8]=d*m+p*_+v*A,this}multiplyScalar(t){let i=this.elements;return i[0]*=t,i[3]*=t,i[6]*=t,i[1]*=t,i[4]*=t,i[7]*=t,i[2]*=t,i[5]*=t,i[8]*=t,this}determinant(){let t=this.elements,i=t[0],r=t[1],n=t[2],a=t[3],s=t[4],o=t[5],l=t[6],c=t[7],h=t[8];return i*s*h-i*o*c-r*a*h+r*o*l+n*a*c-n*s*l}invert(){let t=this.elements,i=t[0],r=t[1],n=t[2],a=t[3],s=t[4],o=t[5],l=t[6],c=t[7],h=t[8],u=h*s-o*c,d=o*l-h*a,p=c*a-s*l,v=i*u+r*d+n*p;if(v===0)return this.set(0,0,0,0,0,0,0,0,0);let f=1/v;return t[0]=u*f,t[1]=(n*c-h*r)*f,t[2]=(o*r-n*s)*f,t[3]=d*f,t[4]=(h*i-n*l)*f,t[5]=(n*a-o*i)*f,t[6]=p*f,t[7]=(r*l-c*i)*f,t[8]=(s*i-r*a)*f,this}transpose(){let t,i=this.elements;return t=i[1],i[1]=i[3],i[3]=t,t=i[2],i[2]=i[6],i[6]=t,t=i[5],i[5]=i[7],i[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){let i=this.elements;return t[0]=i[0],t[1]=i[3],t[2]=i[6],t[3]=i[1],t[4]=i[4],t[5]=i[7],t[6]=i[2],t[7]=i[5],t[8]=i[8],this}setUvTransform(t,i,r,n,a,s,o){let l=Math.cos(a),c=Math.sin(a);return this.set(r*l,r*c,-r*(l*s+c*o)+s+t,-n*c,n*l,-n*(-c*s+l*o)+o+i,0,0,1),this}scale(t,i){return this.premultiply(Os.makeScale(t,i)),this}rotate(t){return this.premultiply(Os.makeRotation(-t)),this}translate(t,i){return this.premultiply(Os.makeTranslation(t,i)),this}makeTranslation(t,i){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,i,0,0,1),this}makeRotation(t){let i=Math.cos(t),r=Math.sin(t);return this.set(i,-r,0,r,i,0,0,0,1),this}makeScale(t,i){return this.set(t,0,0,0,i,0,0,0,1),this}equals(t){let i=this.elements,r=t.elements;for(let n=0;n<9;n++)if(i[n]!==r[n])return!1;return!0}fromArray(t,i=0){for(let r=0;r<9;r++)this.elements[r]=t[r+i];return this}toArray(t=[],i=0){let r=this.elements;return t[i]=r[0],t[i+1]=r[1],t[i+2]=r[2],t[i+3]=r[3],t[i+4]=r[4],t[i+5]=r[5],t[i+6]=r[6],t[i+7]=r[7],t[i+8]=r[8],t}clone(){return new this.constructor().fromArray(this.elements)}},Os=new Ve;Sc={};Ec=new Ve().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Tc=new Ve().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);ke=hf();uf=class{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let i;if(e instanceof HTMLCanvasElement)i=e;else{Ur===void 0&&(Ur=qn("canvas")),Ur.width=e.width,Ur.height=e.height;let r=Ur.getContext("2d");e instanceof ImageData?r.putImageData(e,0,0):r.drawImage(e,0,0,e.width,e.height),i=Ur}return i.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=qn("canvas");t.width=e.width,t.height=e.height;let i=t.getContext("2d");i.drawImage(e,0,0,e.width,e.height);let r=i.getImageData(0,0,e.width,e.height),n=r.data;for(let a=0;a<n.length;a++)n[a]=Gi(n[a]/255)*255;return i.putImageData(r,0,0),t}else if(e.data){let t=e.data.slice(0);for(let i=0;i<t.length;i++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[i]=Math.floor(Gi(t[i]/255)*255):t[i]=Gi(t[i]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},df=0,Ll=class{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:df++}),this.uuid=gi(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):t instanceof VideoFrame?e.set(t.displayHeight,t.displayWidth,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let i={uuid:this.uuid,url:""},r=this.data;if(r!==null){let n;if(Array.isArray(r)){n=[];for(let a=0,s=r.length;a<s;a++)r[a].isDataTexture?n.push(Fs(r[a].image)):n.push(Fs(r[a]))}else n=Fs(r);i.url=n}return t||(e.images[this.uuid]=i),i}};pf=0,ks=new P,Ht=class Ja extends cr{constructor(t=Ja.DEFAULT_IMAGE,i=Ja.DEFAULT_MAPPING,r=ti,n=ti,a=Nt,s=pi,o=ii,l=Ri,c=Ja.DEFAULT_ANISOTROPY,h=nr){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:pf++}),this.uuid=gi(),this.name="",this.source=new Ll(t),this.mipmaps=[],this.mapping=i,this.channel=0,this.wrapS=r,this.wrapT=n,this.magFilter=a,this.minFilter=s,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new De(0,0),this.repeat=new De(1,1),this.center=new De(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Ve,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0}get width(){return this.source.getSize(ks).x}get height(){return this.source.getSize(ks).y}get depth(){return this.source.getSize(ks).z}get image(){return this.source.data}set image(t=null){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(t,i){this.updateRanges.push({start:t,count:i})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.renderTarget=t.renderTarget,this.isRenderTargetTexture=t.isRenderTargetTexture,this.isArrayTexture=t.isArrayTexture,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}setValues(t){for(let i in t){let r=t[i];if(r===void 0){console.warn(`THREE.Texture.setValues(): parameter '${i}' has value of undefined.`);continue}let n=this[i];if(n===void 0){console.warn(`THREE.Texture.setValues(): property '${i}' does not exist.`);continue}n&&r&&n.isVector2&&r.isVector2||n&&r&&n.isVector3&&r.isVector3||n&&r&&n.isMatrix3&&r.isMatrix3?n.copy(r):this[i]=r}}toJSON(t){let i=t===void 0||typeof t=="string";if(!i&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];let r={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(r.userData=this.userData),i||(t.textures[this.uuid]=r),r}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==qh)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case ji:t.x=t.x-Math.floor(t.x);break;case ti:t.x=t.x<0?0:1;break;case is:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case ji:t.y=t.y-Math.floor(t.y);break;case ti:t.y=t.y<0?0:1;break;case is:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}};Ht.DEFAULT_IMAGE=null;Ht.DEFAULT_MAPPING=qh;Ht.DEFAULT_ANISOTROPY=1;Ye=class cu{constructor(t=0,i=0,r=0,n=1){cu.prototype.isVector4=!0,this.x=t,this.y=i,this.z=r,this.w=n}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,i,r,n){return this.x=t,this.y=i,this.z=r,this.w=n,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,i){switch(t){case 0:this.x=i;break;case 1:this.y=i;break;case 2:this.z=i;break;case 3:this.w=i;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,i){return this.x=t.x+i.x,this.y=t.y+i.y,this.z=t.z+i.z,this.w=t.w+i.w,this}addScaledVector(t,i){return this.x+=t.x*i,this.y+=t.y*i,this.z+=t.z*i,this.w+=t.w*i,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,i){return this.x=t.x-i.x,this.y=t.y-i.y,this.z=t.z-i.z,this.w=t.w-i.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){let i=this.x,r=this.y,n=this.z,a=this.w,s=t.elements;return this.x=s[0]*i+s[4]*r+s[8]*n+s[12]*a,this.y=s[1]*i+s[5]*r+s[9]*n+s[13]*a,this.z=s[2]*i+s[6]*r+s[10]*n+s[14]*a,this.w=s[3]*i+s[7]*r+s[11]*n+s[15]*a,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);let i=Math.sqrt(1-t.w*t.w);return i<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/i,this.y=t.y/i,this.z=t.z/i),this}setAxisAngleFromRotationMatrix(t){let i,r,n,a,s=t.elements,o=s[0],l=s[4],c=s[8],h=s[1],u=s[5],d=s[9],p=s[2],v=s[6],f=s[10];if(Math.abs(l-h)<.01&&Math.abs(c-p)<.01&&Math.abs(d-v)<.01){if(Math.abs(l+h)<.1&&Math.abs(c+p)<.1&&Math.abs(d+v)<.1&&Math.abs(o+u+f-3)<.1)return this.set(1,0,0,0),this;i=Math.PI;let m=(o+1)/2,y=(u+1)/2,x=(f+1)/2,_=(l+h)/4,S=(c+p)/4,E=(d+v)/4;return m>y&&m>x?m<.01?(r=0,n=.707106781,a=.707106781):(r=Math.sqrt(m),n=_/r,a=S/r):y>x?y<.01?(r=.707106781,n=0,a=.707106781):(n=Math.sqrt(y),r=_/n,a=E/n):x<.01?(r=.707106781,n=.707106781,a=0):(a=Math.sqrt(x),r=S/a,n=E/a),this.set(r,n,a,i),this}let g=Math.sqrt((v-d)*(v-d)+(c-p)*(c-p)+(h-l)*(h-l));return Math.abs(g)<.001&&(g=1),this.x=(v-d)/g,this.y=(c-p)/g,this.z=(h-l)/g,this.w=Math.acos((o+u+f-1)/2),this}setFromMatrixPosition(t){let i=t.elements;return this.x=i[12],this.y=i[13],this.z=i[14],this.w=i[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,i){return this.x=ze(this.x,t.x,i.x),this.y=ze(this.y,t.y,i.y),this.z=ze(this.z,t.z,i.z),this.w=ze(this.w,t.w,i.w),this}clampScalar(t,i){return this.x=ze(this.x,t,i),this.y=ze(this.y,t,i),this.z=ze(this.z,t,i),this.w=ze(this.w,t,i),this}clampLength(t,i){let r=this.length();return this.divideScalar(r||1).multiplyScalar(ze(r,t,i))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,i){return this.x+=(t.x-this.x)*i,this.y+=(t.y-this.y)*i,this.z+=(t.z-this.z)*i,this.w+=(t.w-this.w)*i,this}lerpVectors(t,i,r){return this.x=t.x+(i.x-t.x)*r,this.y=t.y+(i.y-t.y)*r,this.z=t.z+(i.z-t.z)*r,this.w=t.w+(i.w-t.w)*r,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,i=0){return this.x=t[i],this.y=t[i+1],this.z=t[i+2],this.w=t[i+3],this}toArray(t=[],i=0){return t[i]=this.x,t[i+1]=this.y,t[i+2]=this.z,t[i+3]=this.w,t}fromBufferAttribute(t,i){return this.x=t.getX(i),this.y=t.getY(i),this.z=t.getZ(i),this.w=t.getW(i),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},ff=class extends cr{constructor(e=1,t=1,i={}){super(),i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Nt,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1},i),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=i.depth,this.scissor=new Ye(0,0,e,t),this.scissorTest=!1,this.viewport=new Ye(0,0,e,t);let r={width:e,height:t,depth:i.depth},n=new Ht(r);this.textures=[];let a=i.count;for(let s=0;s<a;s++)this.textures[s]=n.clone(),this.textures[s].isRenderTargetTexture=!0,this.textures[s].renderTarget=this;this._setTextureOptions(i),this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=i.depthTexture,this.samples=i.samples,this.multiview=i.multiview}_setTextureOptions(e={}){let t={minFilter:Nt,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let i=0;i<this.textures.length;i++)this.textures[i].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,i=1){if(this.width!==e||this.height!==t||this.depth!==i){this.width=e,this.height=t,this.depth=i;for(let r=0,n=this.textures.length;r<n;r++)this.textures[r].image.width=e,this.textures[r].image.height=t,this.textures[r].image.depth=i,this.textures[r].isArrayTexture=this.textures[r].image.depth>1;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,i=e.textures.length;t<i;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let r=Object.assign({},e.textures[t].image);this.textures[t].source=new Ll(r)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}},Ir=class extends ff{constructor(e=1,t=1,i={}){super(e,t,i),this.isWebGLRenderTarget=!0}},hu=class extends Ht{constructor(e=null,t=1,i=1,r=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:i,depth:r},this.magFilter=Bt,this.minFilter=Bt,this.wrapR=ti,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}},mf=class extends Ht{constructor(e=null,t=1,i=1,r=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:i,depth:r},this.magFilter=Bt,this.minFilter=Bt,this.wrapR=ti,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},Ci=class{constructor(e=new P(1/0,1/0,1/0),t=new P(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t+=3)this.expandByPoint(oi.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,i=e.count;t<i;t++)this.expandByPoint(oi.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let i=oi.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(i),this.max.copy(e).add(i),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let i=e.geometry;if(i!==void 0){let n=i.getAttribute("position");if(t===!0&&n!==void 0&&e.isInstancedMesh!==!0)for(let a=0,s=n.count;a<s;a++)e.isMesh===!0?e.getVertexPosition(a,oi):oi.fromBufferAttribute(n,a),oi.applyMatrix4(e.matrixWorld),this.expandByPoint(oi);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),fa.copy(e.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),fa.copy(i.boundingBox)),fa.applyMatrix4(e.matrixWorld),this.union(fa)}let r=e.children;for(let n=0,a=r.length;n<a;n++)this.expandByObject(r[n],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,oi),oi.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,i;return e.normal.x>0?(t=e.normal.x*this.min.x,i=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,i=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,i+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,i+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,i+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,i+=e.normal.z*this.min.z),t<=-e.constant&&i>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Sn),ma.subVectors(this.max,Sn),Or.subVectors(e.a,Sn),Fr.subVectors(e.b,Sn),kr.subVectors(e.c,Sn),$i.subVectors(Fr,Or),Ki.subVectors(kr,Fr),fr.subVectors(Or,kr);let t=[0,-$i.z,$i.y,0,-Ki.z,Ki.y,0,-fr.z,fr.y,$i.z,0,-$i.x,Ki.z,0,-Ki.x,fr.z,0,-fr.x,-$i.y,$i.x,0,-Ki.y,Ki.x,0,-fr.y,fr.x,0];return!Bs(t,Or,Fr,kr,ma)||(t=[1,0,0,0,1,0,0,0,1],!Bs(t,Or,Fr,kr,ma))?!1:(ga.crossVectors($i,Ki),t=[ga.x,ga.y,ga.z],Bs(t,Or,Fr,kr,ma))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,oi).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(oi).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Ui[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Ui[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Ui[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Ui[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Ui[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Ui[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Ui[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Ui[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Ui),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},Ui=[new P,new P,new P,new P,new P,new P,new P,new P],oi=new P,fa=new Ci,Or=new P,Fr=new P,kr=new P,$i=new P,Ki=new P,fr=new P,Sn=new P,ma=new P,ga=new P,mr=new P;gf=new Ci,En=new P,zs=new P,Ii=class{constructor(e=new P,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let i=this.center;t!==void 0?i.copy(t):gf.setFromPoints(e).getCenter(i);let r=0;for(let n=0,a=e.length;n<a;n++)r=Math.max(r,i.distanceToSquared(e[n]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let i=this.center.distanceToSquared(e);return t.copy(e),i>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;En.subVectors(e,this.center);let t=En.lengthSq();if(t>this.radius*this.radius){let i=Math.sqrt(t),r=(i-this.radius)*.5;this.center.addScaledVector(En,r/i),this.radius+=r}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(zs.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(En.copy(e.center).add(zs)),this.expandByPoint(En.copy(e.center).sub(zs))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},Oi=new P,Hs=new P,va=new P,Zi=new P,Vs=new P,_a=new P,Ws=new P,ia=class{constructor(e=new P,t=new P(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Oi)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let i=t.dot(this.direction);return i<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=Oi.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Oi.copy(this.origin).addScaledVector(this.direction,t),Oi.distanceToSquared(e))}distanceSqToSegment(e,t,i,r){Hs.copy(e).add(t).multiplyScalar(.5),va.copy(t).sub(e).normalize(),Zi.copy(this.origin).sub(Hs);let n=e.distanceTo(t)*.5,a=-this.direction.dot(va),s=Zi.dot(this.direction),o=-Zi.dot(va),l=Zi.lengthSq(),c=Math.abs(1-a*a),h,u,d,p;if(c>0)if(h=a*o-s,u=a*s-o,p=n*c,h>=0)if(u>=-p)if(u<=p){let v=1/c;h*=v,u*=v,d=h*(h+a*u+2*s)+u*(a*h+u+2*o)+l}else u=n,h=Math.max(0,-(a*u+s)),d=-h*h+u*(u+2*o)+l;else u=-n,h=Math.max(0,-(a*u+s)),d=-h*h+u*(u+2*o)+l;else u<=-p?(h=Math.max(0,-(-a*n+s)),u=h>0?-n:Math.min(Math.max(-n,-o),n),d=-h*h+u*(u+2*o)+l):u<=p?(h=0,u=Math.min(Math.max(-n,-o),n),d=u*(u+2*o)+l):(h=Math.max(0,-(a*n+s)),u=h>0?n:Math.min(Math.max(-n,-o),n),d=-h*h+u*(u+2*o)+l);else u=a>0?-n:n,h=Math.max(0,-(a*u+s)),d=-h*h+u*(u+2*o)+l;return i&&i.copy(this.origin).addScaledVector(this.direction,h),r&&r.copy(Hs).addScaledVector(va,u),d}intersectSphere(e,t){Oi.subVectors(e.center,this.origin);let i=Oi.dot(this.direction),r=Oi.dot(Oi)-i*i,n=e.radius*e.radius;if(r>n)return null;let a=Math.sqrt(n-r),s=i-a,o=i+a;return o<0?null:s<0?this.at(o,t):this.at(s,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let i=-(this.origin.dot(e.normal)+e.constant)/t;return i>=0?i:null}intersectPlane(e,t){let i=this.distanceToPlane(e);return i===null?null:this.at(i,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let i,r,n,a,s,o,l=1/this.direction.x,c=1/this.direction.y,h=1/this.direction.z,u=this.origin;return l>=0?(i=(e.min.x-u.x)*l,r=(e.max.x-u.x)*l):(i=(e.max.x-u.x)*l,r=(e.min.x-u.x)*l),c>=0?(n=(e.min.y-u.y)*c,a=(e.max.y-u.y)*c):(n=(e.max.y-u.y)*c,a=(e.min.y-u.y)*c),i>a||n>r||((n>i||isNaN(i))&&(i=n),(a<r||isNaN(r))&&(r=a),h>=0?(s=(e.min.z-u.z)*h,o=(e.max.z-u.z)*h):(s=(e.max.z-u.z)*h,o=(e.min.z-u.z)*h),i>o||s>r)||((s>i||i!==i)&&(i=s),(o<r||r!==r)&&(r=o),r<0)?null:this.at(i>=0?i:r,t)}intersectsBox(e){return this.intersectBox(e,Oi)!==null}intersectTriangle(e,t,i,r,n){Vs.subVectors(t,e),_a.subVectors(i,e),Ws.crossVectors(Vs,_a);let a=this.direction.dot(Ws),s;if(a>0){if(r)return null;s=1}else if(a<0)s=-1,a=-a;else return null;Zi.subVectors(this.origin,e);let o=s*this.direction.dot(_a.crossVectors(Zi,_a));if(o<0)return null;let l=s*this.direction.dot(Vs.cross(Zi));if(l<0||o+l>a)return null;let c=-s*Zi.dot(Ws);return c<0?null:this.at(c/a,n)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},we=class dl{constructor(t,i,r,n,a,s,o,l,c,h,u,d,p,v,f,g){dl.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,i,r,n,a,s,o,l,c,h,u,d,p,v,f,g)}set(t,i,r,n,a,s,o,l,c,h,u,d,p,v,f,g){let m=this.elements;return m[0]=t,m[4]=i,m[8]=r,m[12]=n,m[1]=a,m[5]=s,m[9]=o,m[13]=l,m[2]=c,m[6]=h,m[10]=u,m[14]=d,m[3]=p,m[7]=v,m[11]=f,m[15]=g,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new dl().fromArray(this.elements)}copy(t){let i=this.elements,r=t.elements;return i[0]=r[0],i[1]=r[1],i[2]=r[2],i[3]=r[3],i[4]=r[4],i[5]=r[5],i[6]=r[6],i[7]=r[7],i[8]=r[8],i[9]=r[9],i[10]=r[10],i[11]=r[11],i[12]=r[12],i[13]=r[13],i[14]=r[14],i[15]=r[15],this}copyPosition(t){let i=this.elements,r=t.elements;return i[12]=r[12],i[13]=r[13],i[14]=r[14],this}setFromMatrix3(t){let i=t.elements;return this.set(i[0],i[3],i[6],0,i[1],i[4],i[7],0,i[2],i[5],i[8],0,0,0,0,1),this}extractBasis(t,i,r){return t.setFromMatrixColumn(this,0),i.setFromMatrixColumn(this,1),r.setFromMatrixColumn(this,2),this}makeBasis(t,i,r){return this.set(t.x,i.x,r.x,0,t.y,i.y,r.y,0,t.z,i.z,r.z,0,0,0,0,1),this}extractRotation(t){let i=this.elements,r=t.elements,n=1/Br.setFromMatrixColumn(t,0).length(),a=1/Br.setFromMatrixColumn(t,1).length(),s=1/Br.setFromMatrixColumn(t,2).length();return i[0]=r[0]*n,i[1]=r[1]*n,i[2]=r[2]*n,i[3]=0,i[4]=r[4]*a,i[5]=r[5]*a,i[6]=r[6]*a,i[7]=0,i[8]=r[8]*s,i[9]=r[9]*s,i[10]=r[10]*s,i[11]=0,i[12]=0,i[13]=0,i[14]=0,i[15]=1,this}makeRotationFromEuler(t){let i=this.elements,r=t.x,n=t.y,a=t.z,s=Math.cos(r),o=Math.sin(r),l=Math.cos(n),c=Math.sin(n),h=Math.cos(a),u=Math.sin(a);if(t.order==="XYZ"){let d=s*h,p=s*u,v=o*h,f=o*u;i[0]=l*h,i[4]=-l*u,i[8]=c,i[1]=p+v*c,i[5]=d-f*c,i[9]=-o*l,i[2]=f-d*c,i[6]=v+p*c,i[10]=s*l}else if(t.order==="YXZ"){let d=l*h,p=l*u,v=c*h,f=c*u;i[0]=d+f*o,i[4]=v*o-p,i[8]=s*c,i[1]=s*u,i[5]=s*h,i[9]=-o,i[2]=p*o-v,i[6]=f+d*o,i[10]=s*l}else if(t.order==="ZXY"){let d=l*h,p=l*u,v=c*h,f=c*u;i[0]=d-f*o,i[4]=-s*u,i[8]=v+p*o,i[1]=p+v*o,i[5]=s*h,i[9]=f-d*o,i[2]=-s*c,i[6]=o,i[10]=s*l}else if(t.order==="ZYX"){let d=s*h,p=s*u,v=o*h,f=o*u;i[0]=l*h,i[4]=v*c-p,i[8]=d*c+f,i[1]=l*u,i[5]=f*c+d,i[9]=p*c-v,i[2]=-c,i[6]=o*l,i[10]=s*l}else if(t.order==="YZX"){let d=s*l,p=s*c,v=o*l,f=o*c;i[0]=l*h,i[4]=f-d*u,i[8]=v*u+p,i[1]=u,i[5]=s*h,i[9]=-o*h,i[2]=-c*h,i[6]=p*u+v,i[10]=d-f*u}else if(t.order==="XZY"){let d=s*l,p=s*c,v=o*l,f=o*c;i[0]=l*h,i[4]=-u,i[8]=c*h,i[1]=d*u+f,i[5]=s*h,i[9]=p*u-v,i[2]=v*u-p,i[6]=o*h,i[10]=f*u+d}return i[3]=0,i[7]=0,i[11]=0,i[12]=0,i[13]=0,i[14]=0,i[15]=1,this}makeRotationFromQuaternion(t){return this.compose(vf,t,_f)}lookAt(t,i,r){let n=this.elements;return qt.subVectors(t,i),qt.lengthSq()===0&&(qt.z=1),qt.normalize(),Ji.crossVectors(r,qt),Ji.lengthSq()===0&&(Math.abs(r.z)===1?qt.x+=1e-4:qt.z+=1e-4,qt.normalize(),Ji.crossVectors(r,qt)),Ji.normalize(),xa.crossVectors(qt,Ji),n[0]=Ji.x,n[4]=xa.x,n[8]=qt.x,n[1]=Ji.y,n[5]=xa.y,n[9]=qt.y,n[2]=Ji.z,n[6]=xa.z,n[10]=qt.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,i){let r=t.elements,n=i.elements,a=this.elements,s=r[0],o=r[4],l=r[8],c=r[12],h=r[1],u=r[5],d=r[9],p=r[13],v=r[2],f=r[6],g=r[10],m=r[14],y=r[3],x=r[7],_=r[11],S=r[15],E=n[0],A=n[4],C=n[8],b=n[12],w=n[1],R=n[5],G=n[9],V=n[13],W=n[2],O=n[6],z=n[10],j=n[14],H=n[3],$=n[7],U=n[11],se=n[15];return a[0]=s*E+o*w+l*W+c*H,a[4]=s*A+o*R+l*O+c*$,a[8]=s*C+o*G+l*z+c*U,a[12]=s*b+o*V+l*j+c*se,a[1]=h*E+u*w+d*W+p*H,a[5]=h*A+u*R+d*O+p*$,a[9]=h*C+u*G+d*z+p*U,a[13]=h*b+u*V+d*j+p*se,a[2]=v*E+f*w+g*W+m*H,a[6]=v*A+f*R+g*O+m*$,a[10]=v*C+f*G+g*z+m*U,a[14]=v*b+f*V+g*j+m*se,a[3]=y*E+x*w+_*W+S*H,a[7]=y*A+x*R+_*O+S*$,a[11]=y*C+x*G+_*z+S*U,a[15]=y*b+x*V+_*j+S*se,this}multiplyScalar(t){let i=this.elements;return i[0]*=t,i[4]*=t,i[8]*=t,i[12]*=t,i[1]*=t,i[5]*=t,i[9]*=t,i[13]*=t,i[2]*=t,i[6]*=t,i[10]*=t,i[14]*=t,i[3]*=t,i[7]*=t,i[11]*=t,i[15]*=t,this}determinant(){let t=this.elements,i=t[0],r=t[4],n=t[8],a=t[12],s=t[1],o=t[5],l=t[9],c=t[13],h=t[2],u=t[6],d=t[10],p=t[14],v=t[3],f=t[7],g=t[11],m=t[15];return v*(+a*l*u-n*c*u-a*o*d+r*c*d+n*o*p-r*l*p)+f*(+i*l*p-i*c*d+a*s*d-n*s*p+n*c*h-a*l*h)+g*(+i*c*u-i*o*p-a*s*u+r*s*p+a*o*h-r*c*h)+m*(-n*o*h-i*l*u+i*o*d+n*s*u-r*s*d+r*l*h)}transpose(){let t=this.elements,i;return i=t[1],t[1]=t[4],t[4]=i,i=t[2],t[2]=t[8],t[8]=i,i=t[6],t[6]=t[9],t[9]=i,i=t[3],t[3]=t[12],t[12]=i,i=t[7],t[7]=t[13],t[13]=i,i=t[11],t[11]=t[14],t[14]=i,this}setPosition(t,i,r){let n=this.elements;return t.isVector3?(n[12]=t.x,n[13]=t.y,n[14]=t.z):(n[12]=t,n[13]=i,n[14]=r),this}invert(){let t=this.elements,i=t[0],r=t[1],n=t[2],a=t[3],s=t[4],o=t[5],l=t[6],c=t[7],h=t[8],u=t[9],d=t[10],p=t[11],v=t[12],f=t[13],g=t[14],m=t[15],y=u*g*c-f*d*c+f*l*p-o*g*p-u*l*m+o*d*m,x=v*d*c-h*g*c-v*l*p+s*g*p+h*l*m-s*d*m,_=h*f*c-v*u*c+v*o*p-s*f*p-h*o*m+s*u*m,S=v*u*l-h*f*l-v*o*d+s*f*d+h*o*g-s*u*g,E=i*y+r*x+n*_+a*S;if(E===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let A=1/E;return t[0]=y*A,t[1]=(f*d*a-u*g*a-f*n*p+r*g*p+u*n*m-r*d*m)*A,t[2]=(o*g*a-f*l*a+f*n*c-r*g*c-o*n*m+r*l*m)*A,t[3]=(u*l*a-o*d*a-u*n*c+r*d*c+o*n*p-r*l*p)*A,t[4]=x*A,t[5]=(h*g*a-v*d*a+v*n*p-i*g*p-h*n*m+i*d*m)*A,t[6]=(v*l*a-s*g*a-v*n*c+i*g*c+s*n*m-i*l*m)*A,t[7]=(s*d*a-h*l*a+h*n*c-i*d*c-s*n*p+i*l*p)*A,t[8]=_*A,t[9]=(v*u*a-h*f*a-v*r*p+i*f*p+h*r*m-i*u*m)*A,t[10]=(s*f*a-v*o*a+v*r*c-i*f*c-s*r*m+i*o*m)*A,t[11]=(h*o*a-s*u*a-h*r*c+i*u*c+s*r*p-i*o*p)*A,t[12]=S*A,t[13]=(h*f*n-v*u*n+v*r*d-i*f*d-h*r*g+i*u*g)*A,t[14]=(v*o*n-s*f*n-v*r*l+i*f*l+s*r*g-i*o*g)*A,t[15]=(s*u*n-h*o*n+h*r*l-i*u*l-s*r*d+i*o*d)*A,this}scale(t){let i=this.elements,r=t.x,n=t.y,a=t.z;return i[0]*=r,i[4]*=n,i[8]*=a,i[1]*=r,i[5]*=n,i[9]*=a,i[2]*=r,i[6]*=n,i[10]*=a,i[3]*=r,i[7]*=n,i[11]*=a,this}getMaxScaleOnAxis(){let t=this.elements,i=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],r=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],n=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(i,r,n))}makeTranslation(t,i,r){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,i,0,0,1,r,0,0,0,1),this}makeRotationX(t){let i=Math.cos(t),r=Math.sin(t);return this.set(1,0,0,0,0,i,-r,0,0,r,i,0,0,0,0,1),this}makeRotationY(t){let i=Math.cos(t),r=Math.sin(t);return this.set(i,0,r,0,0,1,0,0,-r,0,i,0,0,0,0,1),this}makeRotationZ(t){let i=Math.cos(t),r=Math.sin(t);return this.set(i,-r,0,0,r,i,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,i){let r=Math.cos(i),n=Math.sin(i),a=1-r,s=t.x,o=t.y,l=t.z,c=a*s,h=a*o;return this.set(c*s+r,c*o-n*l,c*l+n*o,0,c*o+n*l,h*o+r,h*l-n*s,0,c*l-n*o,h*l+n*s,a*l*l+r,0,0,0,0,1),this}makeScale(t,i,r){return this.set(t,0,0,0,0,i,0,0,0,0,r,0,0,0,0,1),this}makeShear(t,i,r,n,a,s){return this.set(1,r,a,0,t,1,s,0,i,n,1,0,0,0,0,1),this}compose(t,i,r){let n=this.elements,a=i._x,s=i._y,o=i._z,l=i._w,c=a+a,h=s+s,u=o+o,d=a*c,p=a*h,v=a*u,f=s*h,g=s*u,m=o*u,y=l*c,x=l*h,_=l*u,S=r.x,E=r.y,A=r.z;return n[0]=(1-(f+m))*S,n[1]=(p+_)*S,n[2]=(v-x)*S,n[3]=0,n[4]=(p-_)*E,n[5]=(1-(d+m))*E,n[6]=(g+y)*E,n[7]=0,n[8]=(v+x)*A,n[9]=(g-y)*A,n[10]=(1-(d+f))*A,n[11]=0,n[12]=t.x,n[13]=t.y,n[14]=t.z,n[15]=1,this}decompose(t,i,r){let n=this.elements,a=Br.set(n[0],n[1],n[2]).length(),s=Br.set(n[4],n[5],n[6]).length(),o=Br.set(n[8],n[9],n[10]).length();this.determinant()<0&&(a=-a),t.x=n[12],t.y=n[13],t.z=n[14],li.copy(this);let l=1/a,c=1/s,h=1/o;return li.elements[0]*=l,li.elements[1]*=l,li.elements[2]*=l,li.elements[4]*=c,li.elements[5]*=c,li.elements[6]*=c,li.elements[8]*=h,li.elements[9]*=h,li.elements[10]*=h,i.setFromRotationMatrix(li),r.x=a,r.y=s,r.z=o,this}makePerspective(t,i,r,n,a,s,o=Ti,l=!1){let c=this.elements,h=2*a/(i-t),u=2*a/(r-n),d=(i+t)/(i-t),p=(r+n)/(r-n),v,f;if(l)v=a/(s-a),f=s*a/(s-a);else if(o===Ti)v=-(s+a)/(s-a),f=-2*s*a/(s-a);else if(o===as)v=-s/(s-a),f=-s*a/(s-a);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return c[0]=h,c[4]=0,c[8]=d,c[12]=0,c[1]=0,c[5]=u,c[9]=p,c[13]=0,c[2]=0,c[6]=0,c[10]=v,c[14]=f,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(t,i,r,n,a,s,o=Ti,l=!1){let c=this.elements,h=2/(i-t),u=2/(r-n),d=-(i+t)/(i-t),p=-(r+n)/(r-n),v,f;if(l)v=1/(s-a),f=s/(s-a);else if(o===Ti)v=-2/(s-a),f=-(s+a)/(s-a);else if(o===as)v=-1/(s-a),f=-a/(s-a);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return c[0]=h,c[4]=0,c[8]=0,c[12]=d,c[1]=0,c[5]=u,c[9]=0,c[13]=p,c[2]=0,c[6]=0,c[10]=v,c[14]=f,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(t){let i=this.elements,r=t.elements;for(let n=0;n<16;n++)if(i[n]!==r[n])return!1;return!0}fromArray(t,i=0){for(let r=0;r<16;r++)this.elements[r]=t[r+i];return this}toArray(t=[],i=0){let r=this.elements;return t[i]=r[0],t[i+1]=r[1],t[i+2]=r[2],t[i+3]=r[3],t[i+4]=r[4],t[i+5]=r[5],t[i+6]=r[6],t[i+7]=r[7],t[i+8]=r[8],t[i+9]=r[9],t[i+10]=r[10],t[i+11]=r[11],t[i+12]=r[12],t[i+13]=r[13],t[i+14]=r[14],t[i+15]=r[15],t}},Br=new P,li=new we,vf=new P(0,0,0),_f=new P(1,1,1),Ji=new P,xa=new P,qt=new P,Ac=new we,Rc=new gt,Ct=class uu{constructor(t=0,i=0,r=0,n=uu.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=i,this._z=r,this._order=n}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,i,r,n=this._order){return this._x=t,this._y=i,this._z=r,this._order=n,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,i=this._order,r=!0){let n=t.elements,a=n[0],s=n[4],o=n[8],l=n[1],c=n[5],h=n[9],u=n[2],d=n[6],p=n[10];switch(i){case"XYZ":this._y=Math.asin(ze(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-h,p),this._z=Math.atan2(-s,a)):(this._x=Math.atan2(d,c),this._z=0);break;case"YXZ":this._x=Math.asin(-ze(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(o,p),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-u,a),this._z=0);break;case"ZXY":this._x=Math.asin(ze(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,p),this._z=Math.atan2(-s,c)):(this._y=0,this._z=Math.atan2(l,a));break;case"ZYX":this._y=Math.asin(-ze(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,p),this._z=Math.atan2(l,a)):(this._x=0,this._z=Math.atan2(-s,c));break;case"YZX":this._z=Math.asin(ze(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-u,a)):(this._x=0,this._y=Math.atan2(o,p));break;case"XZY":this._z=Math.asin(-ze(s,-1,1)),Math.abs(s)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(o,a)):(this._x=Math.atan2(-h,p),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+i)}return this._order=i,r===!0&&this._onChangeCallback(),this}setFromQuaternion(t,i,r){return Ac.makeRotationFromQuaternion(t),this.setFromRotationMatrix(Ac,i,r)}setFromVector3(t,i=this._order){return this.set(t.x,t.y,t.z,i)}reorder(t){return Rc.setFromEuler(this),this.setFromQuaternion(Rc,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],i=0){return t[i]=this._x,t[i+1]=this._y,t[i+2]=this._z,t[i+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Ct.DEFAULT_ORDER="XYZ";du=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},xf=0,Cc=new P,zr=new gt,Fi=new we,ya=new P,Tn=new P,yf=new P,bf=new gt,Ic=new P(1,0,0),Lc=new P(0,1,0),Pc=new P(0,0,1),Dc={type:"added"},wf={type:"removed"},Hr={type:"childadded",child:null},Gs={type:"childremoved",child:null},dt=class Qa extends cr{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:xf++}),this.uuid=gi(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=Qa.DEFAULT_UP.clone();let t=new P,i=new Ct,r=new gt,n=new P(1,1,1);function a(){r.setFromEuler(i,!1)}function s(){i.setFromQuaternion(r,void 0,!1)}i._onChange(a),r._onChange(s),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:i},quaternion:{configurable:!0,enumerable:!0,value:r},scale:{configurable:!0,enumerable:!0,value:n},modelViewMatrix:{value:new we},normalMatrix:{value:new Ve}}),this.matrix=new we,this.matrixWorld=new we,this.matrixAutoUpdate=Qa.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=Qa.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new du,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,i){this.quaternion.setFromAxisAngle(t,i)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,i){return zr.setFromAxisAngle(t,i),this.quaternion.multiply(zr),this}rotateOnWorldAxis(t,i){return zr.setFromAxisAngle(t,i),this.quaternion.premultiply(zr),this}rotateX(t){return this.rotateOnAxis(Ic,t)}rotateY(t){return this.rotateOnAxis(Lc,t)}rotateZ(t){return this.rotateOnAxis(Pc,t)}translateOnAxis(t,i){return Cc.copy(t).applyQuaternion(this.quaternion),this.position.add(Cc.multiplyScalar(i)),this}translateX(t){return this.translateOnAxis(Ic,t)}translateY(t){return this.translateOnAxis(Lc,t)}translateZ(t){return this.translateOnAxis(Pc,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(Fi.copy(this.matrixWorld).invert())}lookAt(t,i,r){t.isVector3?ya.copy(t):ya.set(t,i,r);let n=this.parent;this.updateWorldMatrix(!0,!1),Tn.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Fi.lookAt(Tn,ya,this.up):Fi.lookAt(ya,Tn,this.up),this.quaternion.setFromRotationMatrix(Fi),n&&(Fi.extractRotation(n.matrixWorld),zr.setFromRotationMatrix(Fi),this.quaternion.premultiply(zr.invert()))}add(t){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.add(arguments[i]);return this}return t===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(Dc),Hr.child=t,this.dispatchEvent(Hr),Hr.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let r=0;r<arguments.length;r++)this.remove(arguments[r]);return this}let i=this.children.indexOf(t);return i!==-1&&(t.parent=null,this.children.splice(i,1),t.dispatchEvent(wf),Gs.child=t,this.dispatchEvent(Gs),Gs.child=null),this}removeFromParent(){let t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),Fi.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),Fi.multiply(t.parent.matrixWorld)),t.applyMatrix4(Fi),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(Dc),Hr.child=t,this.dispatchEvent(Hr),Hr.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,i){if(this[t]===i)return this;for(let r=0,n=this.children.length;r<n;r++){let a=this.children[r].getObjectByProperty(t,i);if(a!==void 0)return a}}getObjectsByProperty(t,i,r=[]){this[t]===i&&r.push(this);let n=this.children;for(let a=0,s=n.length;a<s;a++)n[a].getObjectsByProperty(t,i,r);return r}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Tn,t,yf),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Tn,bf,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);let i=this.matrixWorld.elements;return t.set(i[8],i[9],i[10]).normalize()}raycast(){}traverse(t){t(this);let i=this.children;for(let r=0,n=i.length;r<n;r++)i[r].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);let i=this.children;for(let r=0,n=i.length;r<n;r++)i[r].traverseVisible(t)}traverseAncestors(t){let i=this.parent;i!==null&&(t(i),i.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);let i=this.children;for(let r=0,n=i.length;r<n;r++)i[r].updateMatrixWorld(t)}updateWorldMatrix(t,i){let r=this.parent;if(t===!0&&r!==null&&r.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),i===!0){let n=this.children;for(let a=0,s=n.length;a<s;a++)n[a].updateWorldMatrix(!1,!0)}}toJSON(t){let i=t===void 0||typeof t=="string",r={};i&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},r.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let n={};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.castShadow===!0&&(n.castShadow=!0),this.receiveShadow===!0&&(n.receiveShadow=!0),this.visible===!1&&(n.visible=!1),this.frustumCulled===!1&&(n.frustumCulled=!1),this.renderOrder!==0&&(n.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(n.userData=this.userData),n.layers=this.layers.mask,n.matrix=this.matrix.toArray(),n.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(n.matrixAutoUpdate=!1),this.isInstancedMesh&&(n.type="InstancedMesh",n.count=this.count,n.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(n.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(n.type="BatchedMesh",n.perObjectFrustumCulled=this.perObjectFrustumCulled,n.sortObjects=this.sortObjects,n.drawRanges=this._drawRanges,n.reservedRanges=this._reservedRanges,n.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),n.instanceInfo=this._instanceInfo.map(o=>({...o})),n.availableInstanceIds=this._availableInstanceIds.slice(),n.availableGeometryIds=this._availableGeometryIds.slice(),n.nextIndexStart=this._nextIndexStart,n.nextVertexStart=this._nextVertexStart,n.geometryCount=this._geometryCount,n.maxInstanceCount=this._maxInstanceCount,n.maxVertexCount=this._maxVertexCount,n.maxIndexCount=this._maxIndexCount,n.geometryInitialized=this._geometryInitialized,n.matricesTexture=this._matricesTexture.toJSON(t),n.indirectTexture=this._indirectTexture.toJSON(t),this._colorsTexture!==null&&(n.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(n.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(n.boundingBox=this.boundingBox.toJSON()));function a(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(t)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?n.background=this.background.toJSON():this.background.isTexture&&(n.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(n.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){n.geometry=a(t.geometries,this.geometry);let o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){let l=o.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){let u=l[c];a(t.shapes,u)}else a(t.shapes,l)}}if(this.isSkinnedMesh&&(n.bindMode=this.bindMode,n.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(a(t.skeletons,this.skeleton),n.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(a(t.materials,this.material[l]));n.material=o}else n.material=a(t.materials,this.material);if(this.children.length>0){n.children=[];for(let o=0;o<this.children.length;o++)n.children.push(this.children[o].toJSON(t).object)}if(this.animations.length>0){n.animations=[];for(let o=0;o<this.animations.length;o++){let l=this.animations[o];n.animations.push(a(t.animations,l))}}if(i){let o=s(t.geometries),l=s(t.materials),c=s(t.textures),h=s(t.images),u=s(t.shapes),d=s(t.skeletons),p=s(t.animations),v=s(t.nodes);o.length>0&&(r.geometries=o),l.length>0&&(r.materials=l),c.length>0&&(r.textures=c),h.length>0&&(r.images=h),u.length>0&&(r.shapes=u),d.length>0&&(r.skeletons=d),p.length>0&&(r.animations=p),v.length>0&&(r.nodes=v)}return r.object=n,r;function s(o){let l=[];for(let c in o){let h=o[c];delete h.metadata,l.push(h)}return l}}clone(t){return new this.constructor().copy(this,t)}copy(t,i=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),i===!0)for(let r=0;r<t.children.length;r++){let n=t.children[r];this.add(n.clone())}return this}};dt.DEFAULT_UP=new P(0,1,0);dt.DEFAULT_MATRIX_AUTO_UPDATE=!0;dt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;ci=new P,ki=new P,js=new P,Bi=new P,Vr=new P,Wr=new P,Nc=new P,Xs=new P,qs=new P,Ys=new P,$s=new Ye,Ks=new Ye,Zs=new Ye,An=class Jr{constructor(t=new P,i=new P,r=new P){this.a=t,this.b=i,this.c=r}static getNormal(t,i,r,n){n.subVectors(r,i),ci.subVectors(t,i),n.cross(ci);let a=n.lengthSq();return a>0?n.multiplyScalar(1/Math.sqrt(a)):n.set(0,0,0)}static getBarycoord(t,i,r,n,a){ci.subVectors(n,i),ki.subVectors(r,i),js.subVectors(t,i);let s=ci.dot(ci),o=ci.dot(ki),l=ci.dot(js),c=ki.dot(ki),h=ki.dot(js),u=s*c-o*o;if(u===0)return a.set(0,0,0),null;let d=1/u,p=(c*l-o*h)*d,v=(s*h-o*l)*d;return a.set(1-p-v,v,p)}static containsPoint(t,i,r,n){return this.getBarycoord(t,i,r,n,Bi)===null?!1:Bi.x>=0&&Bi.y>=0&&Bi.x+Bi.y<=1}static getInterpolation(t,i,r,n,a,s,o,l){return this.getBarycoord(t,i,r,n,Bi)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(a,Bi.x),l.addScaledVector(s,Bi.y),l.addScaledVector(o,Bi.z),l)}static getInterpolatedAttribute(t,i,r,n,a,s){return $s.setScalar(0),Ks.setScalar(0),Zs.setScalar(0),$s.fromBufferAttribute(t,i),Ks.fromBufferAttribute(t,r),Zs.fromBufferAttribute(t,n),s.setScalar(0),s.addScaledVector($s,a.x),s.addScaledVector(Ks,a.y),s.addScaledVector(Zs,a.z),s}static isFrontFacing(t,i,r,n){return ci.subVectors(r,i),ki.subVectors(t,i),ci.cross(ki).dot(n)<0}set(t,i,r){return this.a.copy(t),this.b.copy(i),this.c.copy(r),this}setFromPointsAndIndices(t,i,r,n){return this.a.copy(t[i]),this.b.copy(t[r]),this.c.copy(t[n]),this}setFromAttributeAndIndices(t,i,r,n){return this.a.fromBufferAttribute(t,i),this.b.fromBufferAttribute(t,r),this.c.fromBufferAttribute(t,n),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return ci.subVectors(this.c,this.b),ki.subVectors(this.a,this.b),ci.cross(ki).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return Jr.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,i){return Jr.getBarycoord(t,this.a,this.b,this.c,i)}getInterpolation(t,i,r,n,a){return Jr.getInterpolation(t,this.a,this.b,this.c,i,r,n,a)}containsPoint(t){return Jr.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return Jr.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,i){let r=this.a,n=this.b,a=this.c,s,o;Vr.subVectors(n,r),Wr.subVectors(a,r),Xs.subVectors(t,r);let l=Vr.dot(Xs),c=Wr.dot(Xs);if(l<=0&&c<=0)return i.copy(r);qs.subVectors(t,n);let h=Vr.dot(qs),u=Wr.dot(qs);if(h>=0&&u<=h)return i.copy(n);let d=l*u-h*c;if(d<=0&&l>=0&&h<=0)return s=l/(l-h),i.copy(r).addScaledVector(Vr,s);Ys.subVectors(t,a);let p=Vr.dot(Ys),v=Wr.dot(Ys);if(v>=0&&p<=v)return i.copy(a);let f=p*c-l*v;if(f<=0&&c>=0&&v<=0)return o=c/(c-v),i.copy(r).addScaledVector(Wr,o);let g=h*v-p*u;if(g<=0&&u-h>=0&&p-v>=0)return Nc.subVectors(a,n),o=(u-h)/(u-h+(p-v)),i.copy(n).addScaledVector(Nc,o);let m=1/(g+f+d);return s=f*m,o=d*m,i.copy(r).addScaledVector(Vr,s).addScaledVector(Wr,o)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}},pu={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Qi={h:0,s:0,l:0},ba={h:0,s:0,l:0};_e=class{constructor(e,t,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,i)}set(e,t,i){if(t===void 0&&i===void 0){let r=e;r&&r.isColor?this.copy(r):typeof r=="number"?this.setHex(r):typeof r=="string"&&this.setStyle(r)}else this.setRGB(e,t,i);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=je){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,ke.colorSpaceToWorking(this,t),this}setRGB(e,t,i,r=ke.workingColorSpace){return this.r=e,this.g=t,this.b=i,ke.colorSpaceToWorking(this,r),this}setHSL(e,t,i,r=ke.workingColorSpace){if(e=Il(e,1),t=ze(t,0,1),i=ze(i,0,1),t===0)this.r=this.g=this.b=i;else{let n=i<=.5?i*(1+t):i+t-i*t,a=2*i-n;this.r=Js(a,n,e+1/3),this.g=Js(a,n,e),this.b=Js(a,n,e-1/3)}return ke.colorSpaceToWorking(this,r),this}setStyle(e,t=je){function i(n){n!==void 0&&parseFloat(n)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let n,a=r[1],s=r[2];switch(a){case"rgb":case"rgba":if(n=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(s))return i(n[4]),this.setRGB(Math.min(255,parseInt(n[1],10))/255,Math.min(255,parseInt(n[2],10))/255,Math.min(255,parseInt(n[3],10))/255,t);if(n=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(s))return i(n[4]),this.setRGB(Math.min(100,parseInt(n[1],10))/100,Math.min(100,parseInt(n[2],10))/100,Math.min(100,parseInt(n[3],10))/100,t);break;case"hsl":case"hsla":if(n=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(s))return i(n[4]),this.setHSL(parseFloat(n[1])/360,parseFloat(n[2])/100,parseFloat(n[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){let n=r[1],a=n.length;if(a===3)return this.setRGB(parseInt(n.charAt(0),16)/15,parseInt(n.charAt(1),16)/15,parseInt(n.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(n,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=je){let i=pu[e.toLowerCase()];return i!==void 0?this.setHex(i,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Gi(e.r),this.g=Gi(e.g),this.b=Gi(e.b),this}copyLinearToSRGB(e){return this.r=ln(e.r),this.g=ln(e.g),this.b=ln(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=je){return ke.workingToColorSpace(Pt.copy(this),e),Math.round(ze(Pt.r*255,0,255))*65536+Math.round(ze(Pt.g*255,0,255))*256+Math.round(ze(Pt.b*255,0,255))}getHexString(e=je){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=ke.workingColorSpace){ke.workingToColorSpace(Pt.copy(this),t);let i=Pt.r,r=Pt.g,n=Pt.b,a=Math.max(i,r,n),s=Math.min(i,r,n),o,l,c=(s+a)/2;if(s===a)o=0,l=0;else{let h=a-s;switch(l=c<=.5?h/(a+s):h/(2-a-s),a){case i:o=(r-n)/h+(r<n?6:0);break;case r:o=(n-i)/h+2;break;case n:o=(i-r)/h+4;break}o/=6}return e.h=o,e.s=l,e.l=c,e}getRGB(e,t=ke.workingColorSpace){return ke.workingToColorSpace(Pt.copy(this),t),e.r=Pt.r,e.g=Pt.g,e.b=Pt.b,e}getStyle(e=je){ke.workingToColorSpace(Pt.copy(this),e);let t=Pt.r,i=Pt.g,r=Pt.b;return e!==je?`color(${e} ${t.toFixed(3)} ${i.toFixed(3)} ${r.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(i*255)},${Math.round(r*255)})`}offsetHSL(e,t,i){return this.getHSL(Qi),this.setHSL(Qi.h+e,Qi.s+t,Qi.l+i)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,i){return this.r=e.r+(t.r-e.r)*i,this.g=e.g+(t.g-e.g)*i,this.b=e.b+(t.b-e.b)*i,this}lerpHSL(e,t){this.getHSL(Qi),e.getHSL(ba);let i=kn(Qi.h,ba.h,t),r=kn(Qi.s,ba.s,t),n=kn(Qi.l,ba.l,t);return this.setHSL(i,r,n),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,i=this.g,r=this.b,n=e.elements;return this.r=n[0]*t+n[3]*i+n[6]*r,this.g=n[1]*t+n[4]*i+n[7]*r,this.b=n[2]*t+n[5]*i+n[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Pt=new _e;_e.NAMES=pu;Mf=0,jt=class extends cr{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Mf++}),this.uuid=gi(),this.name="",this.type="Material",this.blending=on,this.side=Ai,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=To,this.blendDst=Ao,this.blendEquation=wr,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new _e(0,0,0),this.blendAlpha=0,this.depthFunc=hn,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=yc,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Nr,this.stencilZFail=Nr,this.stencilZPass=Nr,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let i=e[t];if(i===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}let r=this[t];if(r===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}r&&r.isColor?r.set(i):r&&r.isVector3&&i&&i.isVector3?r.copy(i):this[t]=i}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let i={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(i.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(i.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(e).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(e).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(e).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(e).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(e).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.shadowSide!==null&&(i.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),this.blending!==on&&(i.blending=this.blending),this.side!==Ai&&(i.side=this.side),this.vertexColors===!0&&(i.vertexColors=!0),this.opacity<1&&(i.opacity=this.opacity),this.transparent===!0&&(i.transparent=!0),this.blendSrc!==To&&(i.blendSrc=this.blendSrc),this.blendDst!==Ao&&(i.blendDst=this.blendDst),this.blendEquation!==wr&&(i.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(i.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(i.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(i.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(i.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(i.blendAlpha=this.blendAlpha),this.depthFunc!==hn&&(i.depthFunc=this.depthFunc),this.depthTest===!1&&(i.depthTest=this.depthTest),this.depthWrite===!1&&(i.depthWrite=this.depthWrite),this.colorWrite===!1&&(i.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(i.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==yc&&(i.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(i.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(i.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Nr&&(i.stencilFail=this.stencilFail),this.stencilZFail!==Nr&&(i.stencilZFail=this.stencilZFail),this.stencilZPass!==Nr&&(i.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(i.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(i.rotation=this.rotation),this.polygonOffset===!0&&(i.polygonOffset=!0),this.polygonOffsetFactor!==0&&(i.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(i.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(i.linewidth=this.linewidth),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.dithering===!0&&(i.dithering=!0),this.alphaTest>0&&(i.alphaTest=this.alphaTest),this.alphaHash===!0&&(i.alphaHash=!0),this.alphaToCoverage===!0&&(i.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(i.premultipliedAlpha=!0),this.forceSinglePass===!0&&(i.forceSinglePass=!0),this.wireframe===!0&&(i.wireframe=!0),this.wireframeLinewidth>1&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(i.flatShading=!0),this.visible===!1&&(i.visible=!1),this.toneMapped===!1&&(i.toneMapped=!1),this.fog===!1&&(i.fog=!1),Object.keys(this.userData).length>0&&(i.userData=this.userData);function r(n){let a=[];for(let s in n){let o=n[s];delete o.metadata,a.push(o)}return a}if(t){let n=r(e.textures),a=r(e.images);n.length>0&&(i.textures=n),a.length>0&&(i.images=a)}return i}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,i=null;if(t!==null){let r=t.length;i=new Array(r);for(let n=0;n!==r;++n)i[n]=t[n].clone()}return this.clippingPlanes=i,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}},Sr=class extends jt{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new _e(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Ct,this.combine=hs,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},yt=new P,wa=new De,Sf=0,Et=class{constructor(e,t,i=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Sf++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=i,this.usage=ul,this.updateRanges=[],this.gpuType=fi,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,i){e*=this.itemSize,i*=t.itemSize;for(let r=0,n=this.itemSize;r<n;r++)this.array[e+r]=t.array[i+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,i=this.count;t<i;t++)wa.fromBufferAttribute(this,t),wa.applyMatrix3(e),this.setXY(t,wa.x,wa.y);else if(this.itemSize===3)for(let t=0,i=this.count;t<i;t++)yt.fromBufferAttribute(this,t),yt.applyMatrix3(e),this.setXYZ(t,yt.x,yt.y,yt.z);return this}applyMatrix4(e){for(let t=0,i=this.count;t<i;t++)yt.fromBufferAttribute(this,t),yt.applyMatrix4(e),this.setXYZ(t,yt.x,yt.y,yt.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)yt.fromBufferAttribute(this,t),yt.applyNormalMatrix(e),this.setXYZ(t,yt.x,yt.y,yt.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)yt.fromBufferAttribute(this,t),yt.transformDirection(e),this.setXYZ(t,yt.x,yt.y,yt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let i=this.array[e*this.itemSize+t];return this.normalized&&(i=di(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=et(i,this.array)),this.array[e*this.itemSize+t]=i,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=di(t,this.array)),t}setX(e,t){return this.normalized&&(t=et(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=di(t,this.array)),t}setY(e,t){return this.normalized&&(t=et(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=di(t,this.array)),t}setZ(e,t){return this.normalized&&(t=et(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=di(t,this.array)),t}setW(e,t){return this.normalized&&(t=et(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,i){return e*=this.itemSize,this.normalized&&(t=et(t,this.array),i=et(i,this.array)),this.array[e+0]=t,this.array[e+1]=i,this}setXYZ(e,t,i,r){return e*=this.itemSize,this.normalized&&(t=et(t,this.array),i=et(i,this.array),r=et(r,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=r,this}setXYZW(e,t,i,r,n){return e*=this.itemSize,this.normalized&&(t=et(t,this.array),i=et(i,this.array),r=et(r,this.array),n=et(n,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=r,this.array[e+3]=n,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==ul&&(e.usage=this.usage),e}},Pl=class extends Et{constructor(e,t,i){super(new Uint16Array(e),t,i)}},fu=class extends Et{constructor(e,t,i){super(new Uint32Array(e),t,i)}},Ze=class extends Et{constructor(e,t,i){super(new Float32Array(e),t,i)}},Ef=0,Zt=new we,Qs=new dt,Gr=new P,Yt=new Ci,Rn=new Ci,St=new P,It=class mu extends cr{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Ef++}),this.uuid=gi(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(lu(t)?fu:Pl)(t,1):this.index=t,this}setIndirect(t){return this.indirect=t,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,i){return this.attributes[t]=i,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,i,r=0){this.groups.push({start:t,count:i,materialIndex:r})}clearGroups(){this.groups=[]}setDrawRange(t,i){this.drawRange.start=t,this.drawRange.count=i}applyMatrix4(t){let i=this.attributes.position;i!==void 0&&(i.applyMatrix4(t),i.needsUpdate=!0);let r=this.attributes.normal;if(r!==void 0){let a=new Ve().getNormalMatrix(t);r.applyNormalMatrix(a),r.needsUpdate=!0}let n=this.attributes.tangent;return n!==void 0&&(n.transformDirection(t),n.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(t){return Zt.makeRotationFromQuaternion(t),this.applyMatrix4(Zt),this}rotateX(t){return Zt.makeRotationX(t),this.applyMatrix4(Zt),this}rotateY(t){return Zt.makeRotationY(t),this.applyMatrix4(Zt),this}rotateZ(t){return Zt.makeRotationZ(t),this.applyMatrix4(Zt),this}translate(t,i,r){return Zt.makeTranslation(t,i,r),this.applyMatrix4(Zt),this}scale(t,i,r){return Zt.makeScale(t,i,r),this.applyMatrix4(Zt),this}lookAt(t){return Qs.lookAt(t),Qs.updateMatrix(),this.applyMatrix4(Qs.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Gr).negate(),this.translate(Gr.x,Gr.y,Gr.z),this}setFromPoints(t){let i=this.getAttribute("position");if(i===void 0){let r=[];for(let n=0,a=t.length;n<a;n++){let s=t[n];r.push(s.x,s.y,s.z||0)}this.setAttribute("position",new Ze(r,3))}else{let r=Math.min(t.length,i.count);for(let n=0;n<r;n++){let a=t[n];i.setXYZ(n,a.x,a.y,a.z||0)}t.length>i.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),i.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Ci);let t=this.attributes.position,i=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new P(-1/0,-1/0,-1/0),new P(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),i)for(let r=0,n=i.length;r<n;r++){let a=i[r];Yt.setFromBufferAttribute(a),this.morphTargetsRelative?(St.addVectors(this.boundingBox.min,Yt.min),this.boundingBox.expandByPoint(St),St.addVectors(this.boundingBox.max,Yt.max),this.boundingBox.expandByPoint(St)):(this.boundingBox.expandByPoint(Yt.min),this.boundingBox.expandByPoint(Yt.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Ii);let t=this.attributes.position,i=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new P,1/0);return}if(t){let r=this.boundingSphere.center;if(Yt.setFromBufferAttribute(t),i)for(let a=0,s=i.length;a<s;a++){let o=i[a];Rn.setFromBufferAttribute(o),this.morphTargetsRelative?(St.addVectors(Yt.min,Rn.min),Yt.expandByPoint(St),St.addVectors(Yt.max,Rn.max),Yt.expandByPoint(St)):(Yt.expandByPoint(Rn.min),Yt.expandByPoint(Rn.max))}Yt.getCenter(r);let n=0;for(let a=0,s=t.count;a<s;a++)St.fromBufferAttribute(t,a),n=Math.max(n,r.distanceToSquared(St));if(i)for(let a=0,s=i.length;a<s;a++){let o=i[a],l=this.morphTargetsRelative;for(let c=0,h=o.count;c<h;c++)St.fromBufferAttribute(o,c),l&&(Gr.fromBufferAttribute(t,c),St.add(Gr)),n=Math.max(n,r.distanceToSquared(St))}this.boundingSphere.radius=Math.sqrt(n),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let t=this.index,i=this.attributes;if(t===null||i.position===void 0||i.normal===void 0||i.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let r=i.position,n=i.normal,a=i.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Et(new Float32Array(4*r.count),4));let s=this.getAttribute("tangent"),o=[],l=[];for(let C=0;C<r.count;C++)o[C]=new P,l[C]=new P;let c=new P,h=new P,u=new P,d=new De,p=new De,v=new De,f=new P,g=new P;function m(C,b,w){c.fromBufferAttribute(r,C),h.fromBufferAttribute(r,b),u.fromBufferAttribute(r,w),d.fromBufferAttribute(a,C),p.fromBufferAttribute(a,b),v.fromBufferAttribute(a,w),h.sub(c),u.sub(c),p.sub(d),v.sub(d);let R=1/(p.x*v.y-v.x*p.y);isFinite(R)&&(f.copy(h).multiplyScalar(v.y).addScaledVector(u,-p.y).multiplyScalar(R),g.copy(u).multiplyScalar(p.x).addScaledVector(h,-v.x).multiplyScalar(R),o[C].add(f),o[b].add(f),o[w].add(f),l[C].add(g),l[b].add(g),l[w].add(g))}let y=this.groups;y.length===0&&(y=[{start:0,count:t.count}]);for(let C=0,b=y.length;C<b;++C){let w=y[C],R=w.start,G=w.count;for(let V=R,W=R+G;V<W;V+=3)m(t.getX(V+0),t.getX(V+1),t.getX(V+2))}let x=new P,_=new P,S=new P,E=new P;function A(C){S.fromBufferAttribute(n,C),E.copy(S);let b=o[C];x.copy(b),x.sub(S.multiplyScalar(S.dot(b))).normalize(),_.crossVectors(E,b);let w=_.dot(l[C])<0?-1:1;s.setXYZW(C,x.x,x.y,x.z,w)}for(let C=0,b=y.length;C<b;++C){let w=y[C],R=w.start,G=w.count;for(let V=R,W=R+G;V<W;V+=3)A(t.getX(V+0)),A(t.getX(V+1)),A(t.getX(V+2))}}computeVertexNormals(){let t=this.index,i=this.getAttribute("position");if(i!==void 0){let r=this.getAttribute("normal");if(r===void 0)r=new Et(new Float32Array(i.count*3),3),this.setAttribute("normal",r);else for(let d=0,p=r.count;d<p;d++)r.setXYZ(d,0,0,0);let n=new P,a=new P,s=new P,o=new P,l=new P,c=new P,h=new P,u=new P;if(t)for(let d=0,p=t.count;d<p;d+=3){let v=t.getX(d+0),f=t.getX(d+1),g=t.getX(d+2);n.fromBufferAttribute(i,v),a.fromBufferAttribute(i,f),s.fromBufferAttribute(i,g),h.subVectors(s,a),u.subVectors(n,a),h.cross(u),o.fromBufferAttribute(r,v),l.fromBufferAttribute(r,f),c.fromBufferAttribute(r,g),o.add(h),l.add(h),c.add(h),r.setXYZ(v,o.x,o.y,o.z),r.setXYZ(f,l.x,l.y,l.z),r.setXYZ(g,c.x,c.y,c.z)}else for(let d=0,p=i.count;d<p;d+=3)n.fromBufferAttribute(i,d+0),a.fromBufferAttribute(i,d+1),s.fromBufferAttribute(i,d+2),h.subVectors(s,a),u.subVectors(n,a),h.cross(u),r.setXYZ(d+0,h.x,h.y,h.z),r.setXYZ(d+1,h.x,h.y,h.z),r.setXYZ(d+2,h.x,h.y,h.z);this.normalizeNormals(),r.needsUpdate=!0}}normalizeNormals(){let t=this.attributes.normal;for(let i=0,r=t.count;i<r;i++)St.fromBufferAttribute(t,i),St.normalize(),t.setXYZ(i,St.x,St.y,St.z)}toNonIndexed(){function t(o,l){let c=o.array,h=o.itemSize,u=o.normalized,d=new c.constructor(l.length*h),p=0,v=0;for(let f=0,g=l.length;f<g;f++){o.isInterleavedBufferAttribute?p=l[f]*o.data.stride+o.offset:p=l[f]*h;for(let m=0;m<h;m++)d[v++]=c[p++]}return new Et(d,h,u)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let i=new mu,r=this.index.array,n=this.attributes;for(let o in n){let l=n[o],c=t(l,r);i.setAttribute(o,c)}let a=this.morphAttributes;for(let o in a){let l=[],c=a[o];for(let h=0,u=c.length;h<u;h++){let d=c[h],p=t(d,r);l.push(p)}i.morphAttributes[o]=l}i.morphTargetsRelative=this.morphTargetsRelative;let s=this.groups;for(let o=0,l=s.length;o<l;o++){let c=s[o];i.addGroup(c.start,c.count,c.materialIndex)}return i}toJSON(){let t={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.type,this.name!==""&&(t.name=this.name),Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(t[c]=l[c]);return t}t.data={attributes:{}};let i=this.index;i!==null&&(t.data.index={type:i.array.constructor.name,array:Array.prototype.slice.call(i.array)});let r=this.attributes;for(let l in r){let c=r[l];t.data.attributes[l]=c.toJSON(t.data)}let n={},a=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],h=[];for(let u=0,d=c.length;u<d;u++){let p=c[u];h.push(p.toJSON(t.data))}h.length>0&&(n[l]=h,a=!0)}a&&(t.data.morphAttributes=n,t.data.morphTargetsRelative=this.morphTargetsRelative);let s=this.groups;s.length>0&&(t.data.groups=JSON.parse(JSON.stringify(s)));let o=this.boundingSphere;return o!==null&&(t.data.boundingSphere=o.toJSON()),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let i={};this.name=t.name;let r=t.index;r!==null&&this.setIndex(r.clone());let n=t.attributes;for(let c in n){let h=n[c];this.setAttribute(c,h.clone(i))}let a=t.morphAttributes;for(let c in a){let h=[],u=a[c];for(let d=0,p=u.length;d<p;d++)h.push(u[d].clone(i));this.morphAttributes[c]=h}this.morphTargetsRelative=t.morphTargetsRelative;let s=t.groups;for(let c=0,h=s.length;c<h;c++){let u=s[c];this.addGroup(u.start,u.count,u.materialIndex)}let o=t.boundingBox;o!==null&&(this.boundingBox=o.clone());let l=t.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}},Uc=new we,gr=new ia,Ma=new Ii,Oc=new P,Sa=new P,Ea=new P,Ta=new P,eo=new P,Aa=new P,Fc=new P,Ra=new P,pt=class extends dt{constructor(e=new It,t=new Sr){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let i=e[t[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,n=i.length;r<n;r++){let a=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(e,t){let i=this.geometry,r=i.attributes.position,n=i.morphAttributes.position,a=i.morphTargetsRelative;t.fromBufferAttribute(r,e);let s=this.morphTargetInfluences;if(n&&s){Aa.set(0,0,0);for(let o=0,l=n.length;o<l;o++){let c=s[o],h=n[o];c!==0&&(eo.fromBufferAttribute(h,e),a?Aa.addScaledVector(eo,c):Aa.addScaledVector(eo.sub(t),c))}t.add(Aa)}return t}raycast(e,t){let i=this.geometry,r=this.material,n=this.matrixWorld;r!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),Ma.copy(i.boundingSphere),Ma.applyMatrix4(n),gr.copy(e.ray).recast(e.near),!(Ma.containsPoint(gr.origin)===!1&&(gr.intersectSphere(Ma,Oc)===null||gr.origin.distanceToSquared(Oc)>(e.far-e.near)**2))&&(Uc.copy(n).invert(),gr.copy(e.ray).applyMatrix4(Uc),!(i.boundingBox!==null&&gr.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(e,t,gr)))}_computeIntersections(e,t,i){let r,n=this.geometry,a=this.material,s=n.index,o=n.attributes.position,l=n.attributes.uv,c=n.attributes.uv1,h=n.attributes.normal,u=n.groups,d=n.drawRange;if(s!==null)if(Array.isArray(a))for(let p=0,v=u.length;p<v;p++){let f=u[p],g=a[f.materialIndex],m=Math.max(f.start,d.start),y=Math.min(s.count,Math.min(f.start+f.count,d.start+d.count));for(let x=m,_=y;x<_;x+=3){let S=s.getX(x),E=s.getX(x+1),A=s.getX(x+2);r=Ca(this,g,e,i,l,c,h,S,E,A),r&&(r.faceIndex=Math.floor(x/3),r.face.materialIndex=f.materialIndex,t.push(r))}}else{let p=Math.max(0,d.start),v=Math.min(s.count,d.start+d.count);for(let f=p,g=v;f<g;f+=3){let m=s.getX(f),y=s.getX(f+1),x=s.getX(f+2);r=Ca(this,a,e,i,l,c,h,m,y,x),r&&(r.faceIndex=Math.floor(f/3),t.push(r))}}else if(o!==void 0)if(Array.isArray(a))for(let p=0,v=u.length;p<v;p++){let f=u[p],g=a[f.materialIndex],m=Math.max(f.start,d.start),y=Math.min(o.count,Math.min(f.start+f.count,d.start+d.count));for(let x=m,_=y;x<_;x+=3){let S=x,E=x+1,A=x+2;r=Ca(this,g,e,i,l,c,h,S,E,A),r&&(r.faceIndex=Math.floor(x/3),r.face.materialIndex=f.materialIndex,t.push(r))}}else{let p=Math.max(0,d.start),v=Math.min(o.count,d.start+d.count);for(let f=p,g=v;f<g;f+=3){let m=f,y=f+1,x=f+2;r=Ca(this,a,e,i,l,c,h,m,y,x),r&&(r.faceIndex=Math.floor(f/3),t.push(r))}}}};ps=class gu extends It{constructor(t=1,i=1,r=1,n=1,a=1,s=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:i,depth:r,widthSegments:n,heightSegments:a,depthSegments:s};let o=this;n=Math.floor(n),a=Math.floor(a),s=Math.floor(s);let l=[],c=[],h=[],u=[],d=0,p=0;v("z","y","x",-1,-1,r,i,t,s,a,0),v("z","y","x",1,-1,r,i,-t,s,a,1),v("x","z","y",1,1,t,r,i,n,s,2),v("x","z","y",1,-1,t,r,-i,n,s,3),v("x","y","z",1,-1,t,i,r,n,a,4),v("x","y","z",-1,-1,t,i,-r,n,a,5),this.setIndex(l),this.setAttribute("position",new Ze(c,3)),this.setAttribute("normal",new Ze(h,3)),this.setAttribute("uv",new Ze(u,2));function v(f,g,m,y,x,_,S,E,A,C,b){let w=_/A,R=S/C,G=_/2,V=S/2,W=E/2,O=A+1,z=C+1,j=0,H=0,$=new P;for(let U=0;U<z;U++){let se=U*R-V;for(let ie=0;ie<O;ie++){let le=ie*w-G;$[f]=le*y,$[g]=se*x,$[m]=W,c.push($.x,$.y,$.z),$[f]=0,$[g]=0,$[m]=E>0?1:-1,h.push($.x,$.y,$.z),u.push(ie/A),u.push(1-U/C),j+=1}}for(let U=0;U<C;U++)for(let se=0;se<A;se++){let ie=d+se+O*U,le=d+se+O*(U+1),ae=d+(se+1)+O*(U+1),N=d+(se+1)+O*U;l.push(ie,le,N),l.push(le,ae,N),H+=6}o.addGroup(p,H,b),p+=H,d+=j}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new gu(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}};Rf={clone:fn,merge:Ot},Cf=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,If=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,or=class extends jt{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Cf,this.fragmentShader=If,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=fn(e.uniforms),this.uniformsGroups=Af(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let r in this.uniforms){let n=this.uniforms[r].value;n&&n.isTexture?t.uniforms[r]={type:"t",value:n.toJSON(e).uuid}:n&&n.isColor?t.uniforms[r]={type:"c",value:n.getHex()}:n&&n.isVector2?t.uniforms[r]={type:"v2",value:n.toArray()}:n&&n.isVector3?t.uniforms[r]={type:"v3",value:n.toArray()}:n&&n.isVector4?t.uniforms[r]={type:"v4",value:n.toArray()}:n&&n.isMatrix3?t.uniforms[r]={type:"m3",value:n.toArray()}:n&&n.isMatrix4?t.uniforms[r]={type:"m4",value:n.toArray()}:t.uniforms[r]={value:n}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let i={};for(let r in this.extensions)this.extensions[r]===!0&&(i[r]=!0);return Object.keys(i).length>0&&(t.extensions=i),t}},_u=class extends dt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new we,this.projectionMatrix=new we,this.projectionMatrixInverse=new we,this.coordinateSystem=Ti,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}},er=new P,kc=new De,Bc=new De,Dt=class extends _u{constructor(e=50,t=1,i=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=i,this.far=r,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=pn*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(Fn*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return pn*2*Math.atan(Math.tan(Fn*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,i){er.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(er.x,er.y).multiplyScalar(-e/er.z),er.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(er.x,er.y).multiplyScalar(-e/er.z)}getViewSize(e,t){return this.getViewBounds(e,kc,Bc),t.subVectors(Bc,kc)}setViewOffset(e,t,i,r,n,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=r,this.view.width=n,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(Fn*.5*this.fov)/this.zoom,i=2*t,r=this.aspect*i,n=-.5*r,a=this.view;if(this.view!==null&&this.view.enabled){let o=a.fullWidth,l=a.fullHeight;n+=a.offsetX*r/o,t-=a.offsetY*i/l,r*=a.width/o,i*=a.height/l}let s=this.filmOffset;s!==0&&(n+=e*s/this.getFilmWidth()),this.projectionMatrix.makePerspective(n,n+r,t,t-i,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},jr=-90,Xr=1,Lf=class extends dt{constructor(e,t,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;let r=new Dt(jr,Xr,e,t);r.layers=this.layers,this.add(r);let n=new Dt(jr,Xr,e,t);n.layers=this.layers,this.add(n);let a=new Dt(jr,Xr,e,t);a.layers=this.layers,this.add(a);let s=new Dt(jr,Xr,e,t);s.layers=this.layers,this.add(s);let o=new Dt(jr,Xr,e,t);o.layers=this.layers,this.add(o);let l=new Dt(jr,Xr,e,t);l.layers=this.layers,this.add(l)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[i,r,n,a,s,o]=t;for(let l of t)this.remove(l);if(e===Ti)i.up.set(0,1,0),i.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),n.up.set(0,0,-1),n.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),s.up.set(0,1,0),s.lookAt(0,0,1),o.up.set(0,1,0),o.lookAt(0,0,-1);else if(e===as)i.up.set(0,-1,0),i.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),n.up.set(0,0,1),n.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),s.up.set(0,-1,0),s.lookAt(0,0,1),o.up.set(0,-1,0),o.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let l of t)this.add(l),l.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:i,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[n,a,s,o,l,c]=this.children,h=e.getRenderTarget(),u=e.getActiveCubeFace(),d=e.getActiveMipmapLevel(),p=e.xr.enabled;e.xr.enabled=!1;let v=i.texture.generateMipmaps;i.texture.generateMipmaps=!1,e.setRenderTarget(i,0,r),e.render(t,n),e.setRenderTarget(i,1,r),e.render(t,a),e.setRenderTarget(i,2,r),e.render(t,s),e.setRenderTarget(i,3,r),e.render(t,o),e.setRenderTarget(i,4,r),e.render(t,l),i.texture.generateMipmaps=v,e.setRenderTarget(i,5,r),e.render(t,c),e.setRenderTarget(h,u,d),e.xr.enabled=p,i.texture.needsPMREMUpdate=!0}},xu=class extends Ht{constructor(e=[],t=un,i,r,n,a,s,o,l,c){super(e,t,i,r,n,a,s,o,l,c),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},Pf=class extends Ir{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let i={width:e,height:e,depth:1},r=[i,i,i,i,i,i];this.texture=new xu(r),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let i={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},r=new ps(5,5,5),n=new or({name:"CubemapFromEquirect",uniforms:fn(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:kt,blending:ar});n.uniforms.tEquirect.value=t;let a=new pt(r,n),s=t.minFilter;return t.minFilter===pi&&(t.minFilter=Nt),new Lf(1,10,this).update(e,a),t.minFilter=s,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,i=!0,r=!0){let n=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,i,r);e.setRenderTarget(n)}},mi=class extends dt{constructor(){super(),this.isGroup=!0,this.type="Group"}},Df={type:"move"},to=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new mi,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new mi,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new P,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new P),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new mi,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new P,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new P),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let i of e.hand.values())this._getHandJoint(t,i)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,i){let r=null,n=null,a=null,s=this._targetRay,o=this._grip,l=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(l&&e.hand){a=!0;for(let v of e.hand.values()){let f=t.getJointPose(v,i),g=this._getHandJoint(l,v);f!==null&&(g.matrix.fromArray(f.transform.matrix),g.matrix.decompose(g.position,g.rotation,g.scale),g.matrixWorldNeedsUpdate=!0,g.jointRadius=f.radius),g.visible=f!==null}let c=l.joints["index-finger-tip"],h=l.joints["thumb-tip"],u=c.position.distanceTo(h.position),d=.02,p=.005;l.inputState.pinching&&u>d+p?(l.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!l.inputState.pinching&&u<=d-p&&(l.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else o!==null&&e.gripSpace&&(n=t.getPose(e.gripSpace,i),n!==null&&(o.matrix.fromArray(n.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,n.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(n.linearVelocity)):o.hasLinearVelocity=!1,n.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(n.angularVelocity)):o.hasAngularVelocity=!1));s!==null&&(r=t.getPose(e.targetRaySpace,i),r===null&&n!==null&&(r=n),r!==null&&(s.matrix.fromArray(r.transform.matrix),s.matrix.decompose(s.position,s.rotation,s.scale),s.matrixWorldNeedsUpdate=!0,r.linearVelocity?(s.hasLinearVelocity=!0,s.linearVelocity.copy(r.linearVelocity)):s.hasLinearVelocity=!1,r.angularVelocity?(s.hasAngularVelocity=!0,s.angularVelocity.copy(r.angularVelocity)):s.hasAngularVelocity=!1,this.dispatchEvent(Df)))}return s!==null&&(s.visible=r!==null),o!==null&&(o.visible=n!==null),l!==null&&(l.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let i=new mi;i.matrixAutoUpdate=!1,i.visible=!1,e.joints[t.jointName]=i,e.add(i)}return e.joints[t.jointName]}},yu=class extends dt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Ct,this.environmentIntensity=1,this.environmentRotation=new Ct,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}},Nf=class{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=ul,this.updateRanges=[],this.version=0,this.uuid=gi()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,i){e*=this.stride,i*=t.stride;for(let r=0,n=this.stride;r<n;r++)this.array[e+r]=t.array[i+r];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=gi()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);let t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),i=new this.constructor(t,this.stride);return i.setUsage(this.usage),i}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=gi()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}},Ut=new P,Uf=class bu{constructor(t,i,r,n=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=t,this.itemSize=i,this.offset=r,this.normalized=n}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(t){this.data.needsUpdate=t}applyMatrix4(t){for(let i=0,r=this.data.count;i<r;i++)Ut.fromBufferAttribute(this,i),Ut.applyMatrix4(t),this.setXYZ(i,Ut.x,Ut.y,Ut.z);return this}applyNormalMatrix(t){for(let i=0,r=this.count;i<r;i++)Ut.fromBufferAttribute(this,i),Ut.applyNormalMatrix(t),this.setXYZ(i,Ut.x,Ut.y,Ut.z);return this}transformDirection(t){for(let i=0,r=this.count;i<r;i++)Ut.fromBufferAttribute(this,i),Ut.transformDirection(t),this.setXYZ(i,Ut.x,Ut.y,Ut.z);return this}getComponent(t,i){let r=this.array[t*this.data.stride+this.offset+i];return this.normalized&&(r=di(r,this.array)),r}setComponent(t,i,r){return this.normalized&&(r=et(r,this.array)),this.data.array[t*this.data.stride+this.offset+i]=r,this}setX(t,i){return this.normalized&&(i=et(i,this.array)),this.data.array[t*this.data.stride+this.offset]=i,this}setY(t,i){return this.normalized&&(i=et(i,this.array)),this.data.array[t*this.data.stride+this.offset+1]=i,this}setZ(t,i){return this.normalized&&(i=et(i,this.array)),this.data.array[t*this.data.stride+this.offset+2]=i,this}setW(t,i){return this.normalized&&(i=et(i,this.array)),this.data.array[t*this.data.stride+this.offset+3]=i,this}getX(t){let i=this.data.array[t*this.data.stride+this.offset];return this.normalized&&(i=di(i,this.array)),i}getY(t){let i=this.data.array[t*this.data.stride+this.offset+1];return this.normalized&&(i=di(i,this.array)),i}getZ(t){let i=this.data.array[t*this.data.stride+this.offset+2];return this.normalized&&(i=di(i,this.array)),i}getW(t){let i=this.data.array[t*this.data.stride+this.offset+3];return this.normalized&&(i=di(i,this.array)),i}setXY(t,i,r){return t=t*this.data.stride+this.offset,this.normalized&&(i=et(i,this.array),r=et(r,this.array)),this.data.array[t+0]=i,this.data.array[t+1]=r,this}setXYZ(t,i,r,n){return t=t*this.data.stride+this.offset,this.normalized&&(i=et(i,this.array),r=et(r,this.array),n=et(n,this.array)),this.data.array[t+0]=i,this.data.array[t+1]=r,this.data.array[t+2]=n,this}setXYZW(t,i,r,n,a){return t=t*this.data.stride+this.offset,this.normalized&&(i=et(i,this.array),r=et(r,this.array),n=et(n,this.array),a=et(a,this.array)),this.data.array[t+0]=i,this.data.array[t+1]=r,this.data.array[t+2]=n,this.data.array[t+3]=a,this}clone(t){if(t===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let i=[];for(let r=0;r<this.count;r++){let n=r*this.data.stride+this.offset;for(let a=0;a<this.itemSize;a++)i.push(this.data.array[n+a])}return new Et(new this.array.constructor(i),this.itemSize,this.normalized)}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.clone(t)),new bu(t.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(t){if(t===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let i=[];for(let r=0;r<this.count;r++){let n=r*this.data.stride+this.offset;for(let a=0;a<this.itemSize;a++)i.push(this.data.array[n+a])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:i,normalized:this.normalized}}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.toJSON(t)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}},zc=new P,Hc=new Ye,Vc=new Ye,Of=new P,Wc=new we,Ia=new P,io=new Ii,Gc=new we,ro=new ia,wu=class extends pt{constructor(e,t){super(e,t),this.isSkinnedMesh=!0,this.type="SkinnedMesh",this.bindMode=xc,this.bindMatrix=new we,this.bindMatrixInverse=new we,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){let e=this.geometry;this.boundingBox===null&&(this.boundingBox=new Ci),this.boundingBox.makeEmpty();let t=e.getAttribute("position");for(let i=0;i<t.count;i++)this.getVertexPosition(i,Ia),this.boundingBox.expandByPoint(Ia)}computeBoundingSphere(){let e=this.geometry;this.boundingSphere===null&&(this.boundingSphere=new Ii),this.boundingSphere.makeEmpty();let t=e.getAttribute("position");for(let i=0;i<t.count;i++)this.getVertexPosition(i,Ia),this.boundingSphere.expandByPoint(Ia)}copy(e,t){return super.copy(e,t),this.bindMode=e.bindMode,this.bindMatrix.copy(e.bindMatrix),this.bindMatrixInverse.copy(e.bindMatrixInverse),this.skeleton=e.skeleton,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}raycast(e,t){let i=this.material,r=this.matrixWorld;i!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),io.copy(this.boundingSphere),io.applyMatrix4(r),e.ray.intersectsSphere(io)!==!1&&(Gc.copy(r).invert(),ro.copy(e.ray).applyMatrix4(Gc),!(this.boundingBox!==null&&ro.intersectsBox(this.boundingBox)===!1)&&this._computeIntersections(e,t,ro)))}getVertexPosition(e,t){return super.getVertexPosition(e,t),this.applyBoneTransform(e,t),t}bind(e,t){this.skeleton=e,t===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),t=this.matrixWorld),this.bindMatrix.copy(t),this.bindMatrixInverse.copy(t).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){let e=new Ye,t=this.geometry.attributes.skinWeight;for(let i=0,r=t.count;i<r;i++){e.fromBufferAttribute(t,i);let n=1/e.manhattanLength();n!==1/0?e.multiplyScalar(n):e.set(1,0,0,0),t.setXYZW(i,e.x,e.y,e.z,e.w)}}updateMatrixWorld(e){super.updateMatrixWorld(e),this.bindMode===xc?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode===Ip?this.bindMatrixInverse.copy(this.bindMatrix).invert():console.warn("THREE.SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}applyBoneTransform(e,t){let i=this.skeleton,r=this.geometry;Hc.fromBufferAttribute(r.attributes.skinIndex,e),Vc.fromBufferAttribute(r.attributes.skinWeight,e),zc.copy(t).applyMatrix4(this.bindMatrix),t.set(0,0,0);for(let n=0;n<4;n++){let a=Vc.getComponent(n);if(a!==0){let s=Hc.getComponent(n);Wc.multiplyMatrices(i.bones[s].matrixWorld,i.boneInverses[s]),t.addScaledVector(Of.copy(zc).applyMatrix4(Wc),a)}}return t.applyMatrix4(this.bindMatrixInverse)}},$n=class extends dt{constructor(){super(),this.isBone=!0,this.type="Bone"}},Dl=class extends Ht{constructor(e=null,t=1,i=1,r,n,a,s,o,l=Bt,c=Bt,h,u){super(null,a,s,o,l,c,r,n,h,u),this.isDataTexture=!0,this.image={data:e,width:t,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},jc=new we,Ff=new we,Nl=class Mu{constructor(t=[],i=[]){this.uuid=gi(),this.bones=t.slice(0),this.boneInverses=i,this.boneMatrices=null,this.boneTexture=null,this.init()}init(){let t=this.bones,i=this.boneInverses;if(this.boneMatrices=new Float32Array(t.length*16),i.length===0)this.calculateInverses();else if(t.length!==i.length){console.warn("THREE.Skeleton: Number of inverse bone matrices does not match amount of bones."),this.boneInverses=[];for(let r=0,n=this.bones.length;r<n;r++)this.boneInverses.push(new we)}}calculateInverses(){this.boneInverses.length=0;for(let t=0,i=this.bones.length;t<i;t++){let r=new we;this.bones[t]&&r.copy(this.bones[t].matrixWorld).invert(),this.boneInverses.push(r)}}pose(){for(let t=0,i=this.bones.length;t<i;t++){let r=this.bones[t];r&&r.matrixWorld.copy(this.boneInverses[t]).invert()}for(let t=0,i=this.bones.length;t<i;t++){let r=this.bones[t];r&&(r.parent&&r.parent.isBone?(r.matrix.copy(r.parent.matrixWorld).invert(),r.matrix.multiply(r.matrixWorld)):r.matrix.copy(r.matrixWorld),r.matrix.decompose(r.position,r.quaternion,r.scale))}}update(){let t=this.bones,i=this.boneInverses,r=this.boneMatrices,n=this.boneTexture;for(let a=0,s=t.length;a<s;a++){let o=t[a]?t[a].matrixWorld:Ff;jc.multiplyMatrices(o,i[a]),jc.toArray(r,a*16)}n!==null&&(n.needsUpdate=!0)}clone(){return new Mu(this.bones,this.boneInverses)}computeBoneTexture(){let t=Math.sqrt(this.bones.length*4);t=Math.ceil(t/4)*4,t=Math.max(t,4);let i=new Float32Array(t*t*4);i.set(this.boneMatrices);let r=new Dl(i,t,t,ii,fi);return r.needsUpdate=!0,this.boneMatrices=i,this.boneTexture=r,this}getBoneByName(t){for(let i=0,r=this.bones.length;i<r;i++){let n=this.bones[i];if(n.name===t)return n}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null)}fromJSON(t,i){this.uuid=t.uuid;for(let r=0,n=t.bones.length;r<n;r++){let a=t.bones[r],s=i[a];s===void 0&&(console.warn("THREE.Skeleton: No bone found with UUID:",a),s=new $n),this.bones.push(s),this.boneInverses.push(new we().fromArray(t.boneInverses[r]))}return this.init(),this}toJSON(){let t={metadata:{version:4.7,type:"Skeleton",generator:"Skeleton.toJSON"},bones:[],boneInverses:[]};t.uuid=this.uuid;let i=this.bones,r=this.boneInverses;for(let n=0,a=i.length;n<a;n++){let s=i[n];t.bones.push(s.uuid);let o=r[n];t.boneInverses.push(o.toArray())}return t}},pl=class extends Et{constructor(e,t,i,r=1){super(e,t,i),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=r}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},qr=new we,Xc=new we,La=[],qc=new Ci,kf=new we,Cn=new pt,In=new Ii,Su=class extends pt{constructor(e,t,i){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new pl(new Float32Array(i*16),16),this.instanceColor=null,this.morphTexture=null,this.count=i,this.boundingBox=null,this.boundingSphere=null;for(let r=0;r<i;r++)this.setMatrixAt(r,kf)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new Ci),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let i=0;i<t;i++)this.getMatrixAt(i,qr),qc.copy(e.boundingBox).applyMatrix4(qr),this.boundingBox.union(qc)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new Ii),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let i=0;i<t;i++)this.getMatrixAt(i,qr),In.copy(e.boundingSphere).applyMatrix4(qr),this.boundingSphere.union(In)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){let i=t.morphTargetInfluences,r=this.morphTexture.source.data.data,n=i.length+1,a=e*n+1;for(let s=0;s<i.length;s++)i[s]=r[a+s]}raycast(e,t){let i=this.matrixWorld,r=this.count;if(Cn.geometry=this.geometry,Cn.material=this.material,Cn.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),In.copy(this.boundingSphere),In.applyMatrix4(i),e.ray.intersectsSphere(In)!==!1))for(let n=0;n<r;n++){this.getMatrixAt(n,qr),Xc.multiplyMatrices(i,qr),Cn.matrixWorld=Xc,Cn.raycast(e,La);for(let a=0,s=La.length;a<s;a++){let o=La[a];o.instanceId=n,o.object=this,t.push(o)}La.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new pl(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}setMorphAt(e,t){let i=t.morphTargetInfluences,r=i.length+1;this.morphTexture===null&&(this.morphTexture=new Dl(new Float32Array(r*this.count),r,this.count,El,fi));let n=this.morphTexture.source.data.data,a=0;for(let l=0;l<i.length;l++)a+=i[l];let s=this.geometry.morphTargetsRelative?1:1-a,o=r*e;n[o]=s,n.set(i,o+1)}updateMorphTargets(){}dispose(){this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},no=new P,Bf=new P,zf=new Ve,rr=class{constructor(e=new P(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,i,r){return this.normal.set(e,t,i),this.constant=r,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,i){let r=no.subVectors(i,t).cross(Bf.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){let i=e.delta(no),r=this.normal.dot(i);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let n=-(e.start.dot(this.normal)+this.constant)/r;return n<0||n>1?null:t.copy(e.start).addScaledVector(i,n)}intersectsLine(e){let t=this.distanceToPoint(e.start),i=this.distanceToPoint(e.end);return t<0&&i>0||i<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let i=t||zf.getNormalMatrix(e),r=this.coplanarPoint(no).applyMatrix4(e),n=this.normal.applyMatrix3(i).normalize();return this.constant=-r.dot(n),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}},vr=new Ii,Hf=new De(.5,.5),Pa=new P,Ul=class{constructor(e=new rr,t=new rr,i=new rr,r=new rr,n=new rr,a=new rr){this.planes=[e,t,i,r,n,a]}set(e,t,i,r,n,a){let s=this.planes;return s[0].copy(e),s[1].copy(t),s[2].copy(i),s[3].copy(r),s[4].copy(n),s[5].copy(a),this}copy(e){let t=this.planes;for(let i=0;i<6;i++)t[i].copy(e.planes[i]);return this}setFromProjectionMatrix(e,t=Ti,i=!1){let r=this.planes,n=e.elements,a=n[0],s=n[1],o=n[2],l=n[3],c=n[4],h=n[5],u=n[6],d=n[7],p=n[8],v=n[9],f=n[10],g=n[11],m=n[12],y=n[13],x=n[14],_=n[15];if(r[0].setComponents(l-a,d-c,g-p,_-m).normalize(),r[1].setComponents(l+a,d+c,g+p,_+m).normalize(),r[2].setComponents(l+s,d+h,g+v,_+y).normalize(),r[3].setComponents(l-s,d-h,g-v,_-y).normalize(),i)r[4].setComponents(o,u,f,x).normalize(),r[5].setComponents(l-o,d-u,g-f,_-x).normalize();else if(r[4].setComponents(l-o,d-u,g-f,_-x).normalize(),t===Ti)r[5].setComponents(l+o,d+u,g+f,_+x).normalize();else if(t===as)r[5].setComponents(o,u,f,x).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),vr.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),vr.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(vr)}intersectsSprite(e){vr.center.set(0,0,0);let t=Hf.distanceTo(e.center);return vr.radius=.7071067811865476+t,vr.applyMatrix4(e.matrixWorld),this.intersectsSphere(vr)}intersectsSphere(e){let t=this.planes,i=e.center,r=-e.radius;for(let n=0;n<6;n++)if(t[n].distanceToPoint(i)<r)return!1;return!0}intersectsBox(e){let t=this.planes;for(let i=0;i<6;i++){let r=t[i];if(Pa.x=r.normal.x>0?e.max.x:e.min.x,Pa.y=r.normal.y>0?e.max.y:e.min.y,Pa.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(Pa)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let i=0;i<6;i++)if(t[i].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}},Ar=class extends jt{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new _e(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}},ss=new P,os=new P,Yc=new we,Ln=new ia,Da=new Ii,ao=new P,$c=new P,fs=class extends dt{constructor(e=new It,t=new Ar){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,i=[0];for(let r=1,n=t.count;r<n;r++)ss.fromBufferAttribute(t,r-1),os.fromBufferAttribute(t,r),i[r]=i[r-1],i[r]+=ss.distanceTo(os);e.setAttribute("lineDistance",new Ze(i,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){let i=this.geometry,r=this.matrixWorld,n=e.params.Line.threshold,a=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),Da.copy(i.boundingSphere),Da.applyMatrix4(r),Da.radius+=n,e.ray.intersectsSphere(Da)===!1)return;Yc.copy(r).invert(),Ln.copy(e.ray).applyMatrix4(Yc);let s=n/((this.scale.x+this.scale.y+this.scale.z)/3),o=s*s,l=this.isLineSegments?2:1,c=i.index,h=i.attributes.position;if(c!==null){let u=Math.max(0,a.start),d=Math.min(c.count,a.start+a.count);for(let p=u,v=d-1;p<v;p+=l){let f=c.getX(p),g=c.getX(p+1),m=Na(this,e,Ln,o,f,g,p);m&&t.push(m)}if(this.isLineLoop){let p=c.getX(d-1),v=c.getX(u),f=Na(this,e,Ln,o,p,v,d-1);f&&t.push(f)}}else{let u=Math.max(0,a.start),d=Math.min(h.count,a.start+a.count);for(let p=u,v=d-1;p<v;p+=l){let f=Na(this,e,Ln,o,p,p+1,p);f&&t.push(f)}if(this.isLineLoop){let p=Na(this,e,Ln,o,d-1,u,d-1);p&&t.push(p)}}}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let i=e[t[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,n=i.length;r<n;r++){let a=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}};Kc=new P,Zc=new P,ls=class extends fs{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,i=[];for(let r=0,n=t.count;r<n;r+=2)Kc.fromBufferAttribute(t,r),Zc.fromBufferAttribute(t,r+1),i[r]=r===0?0:i[r-1],i[r+1]=i[r]+Kc.distanceTo(Zc);e.setAttribute("lineDistance",new Ze(i,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}},Vf=class extends fs{constructor(e,t){super(e,t),this.isLineLoop=!0,this.type="LineLoop"}},Er=class extends jt{constructor(e){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new _e(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},Jc=new we,fl=new ia,Ua=new Ii,Oa=new P,Bn=class extends dt{constructor(e=new It,t=new Er){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}raycast(e,t){let i=this.geometry,r=this.matrixWorld,n=e.params.Points.threshold,a=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),Ua.copy(i.boundingSphere),Ua.applyMatrix4(r),Ua.radius+=n,e.ray.intersectsSphere(Ua)===!1)return;Jc.copy(r).invert(),fl.copy(e.ray).applyMatrix4(Jc);let s=n/((this.scale.x+this.scale.y+this.scale.z)/3),o=s*s,l=i.index,c=i.attributes.position;if(l!==null){let h=Math.max(0,a.start),u=Math.min(l.count,a.start+a.count);for(let d=h,p=u;d<p;d++){let v=l.getX(d);Oa.fromBufferAttribute(c,v),Qc(Oa,v,o,r,e,t,this)}}else{let h=Math.max(0,a.start),u=Math.min(c.count,a.start+a.count);for(let d=h,p=u;d<p;d++)Oa.fromBufferAttribute(c,d),Qc(Oa,d,o,r,e,t,this)}}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let i=e[t[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,n=i.length;r<n;r++){let a=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}};Eu=class extends Ht{constructor(e,t,i=Cr,r,n,a,s=Bt,o=Bt,l,c=Wn,h=1){if(c!==Wn&&c!==Gn)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let u={width:e,height:t,depth:h};super(u,r,n,a,s,o,c,i,l),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Ll(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}},Tu=class extends Ht{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},Wf=class{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){console.warn("THREE.Curve: .getPoint() not implemented.")}getPointAt(e,t){let i=this.getUtoTmapping(e);return this.getPoint(i,t)}getPoints(e=5){let t=[];for(let i=0;i<=e;i++)t.push(this.getPoint(i/e));return t}getSpacedPoints(e=5){let t=[];for(let i=0;i<=e;i++)t.push(this.getPointAt(i/e));return t}getLength(){let e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let t=[],i,r=this.getPoint(0),n=0;t.push(0);for(let a=1;a<=e;a++)i=this.getPoint(a/e),n+=i.distanceTo(r),t.push(n),r=i;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t=null){let i=this.getLengths(),r=0,n=i.length,a;t?a=t:a=e*i[n-1];let s=0,o=n-1,l;for(;s<=o;)if(r=Math.floor(s+(o-s)/2),l=i[r]-a,l<0)s=r+1;else if(l>0)o=r-1;else{o=r;break}if(r=o,i[r]===a)return r/(n-1);let c=i[r],h=i[r+1]-c,u=(a-c)/h;return(r+u)/(n-1)}getTangent(e,t){let i=e-1e-4,r=e+1e-4;i<0&&(i=0),r>1&&(r=1);let n=this.getPoint(i),a=this.getPoint(r),s=t||(n.isVector2?new De:new P);return s.copy(a).sub(n).normalize(),s}getTangentAt(e,t){let i=this.getUtoTmapping(e);return this.getTangent(i,t)}computeFrenetFrames(e,t=!1){let i=new P,r=[],n=[],a=[],s=new P,o=new we;for(let d=0;d<=e;d++){let p=d/e;r[d]=this.getTangentAt(p,new P)}n[0]=new P,a[0]=new P;let l=Number.MAX_VALUE,c=Math.abs(r[0].x),h=Math.abs(r[0].y),u=Math.abs(r[0].z);c<=l&&(l=c,i.set(1,0,0)),h<=l&&(l=h,i.set(0,1,0)),u<=l&&i.set(0,0,1),s.crossVectors(r[0],i).normalize(),n[0].crossVectors(r[0],s),a[0].crossVectors(r[0],n[0]);for(let d=1;d<=e;d++){if(n[d]=n[d-1].clone(),a[d]=a[d-1].clone(),s.crossVectors(r[d-1],r[d]),s.length()>Number.EPSILON){s.normalize();let p=Math.acos(ze(r[d-1].dot(r[d]),-1,1));n[d].applyMatrix4(o.makeRotationAxis(s,p))}a[d].crossVectors(r[d],n[d])}if(t===!0){let d=Math.acos(ze(n[0].dot(n[e]),-1,1));d/=e,r[0].dot(s.crossVectors(n[0],n[e]))>0&&(d=-d);for(let p=1;p<=e;p++)n[p].applyMatrix4(o.makeRotationAxis(r[p],d*p)),a[p].crossVectors(r[p],n[p])}return{tangents:r,normals:n,binormals:a}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){let e={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}};om=class{static triangulate(e,t,i=2){return Gf(e,t,i)}},lm=class Lu{static area(t){let i=t.length,r=0;for(let n=i-1,a=0;a<i;n=a++)r+=t[n].x*t[a].y-t[a].x*t[n].y;return r*.5}static isClockWise(t){return Lu.area(t)<0}static triangulateShape(t,i){let r=[],n=[],a=[];th(t),ih(r,t);let s=t.length;i.forEach(th);for(let l=0;l<i.length;l++)n.push(s),s+=i[l].length,ih(r,i[l]);let o=om.triangulate(r,n);for(let l=0;l<o.length;l+=3)a.push(o.slice(l,l+3));return a}};Pu=class Du extends It{constructor(t=1,i=1,r=1,n=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:i,widthSegments:r,heightSegments:n};let a=t/2,s=i/2,o=Math.floor(r),l=Math.floor(n),c=o+1,h=l+1,u=t/o,d=i/l,p=[],v=[],f=[],g=[];for(let m=0;m<h;m++){let y=m*d-s;for(let x=0;x<c;x++){let _=x*u-a;v.push(_,-y,0),f.push(0,0,1),g.push(x/o),g.push(1-m/l)}}for(let m=0;m<l;m++)for(let y=0;y<o;y++){let x=y+c*m,_=y+c*(m+1),S=y+1+c*(m+1),E=y+1+c*m;p.push(x,_,E),p.push(_,S,E)}this.setIndex(p),this.setAttribute("position",new Ze(v,3)),this.setAttribute("normal",new Ze(f,3)),this.setAttribute("uv",new Ze(g,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Du(t.width,t.height,t.widthSegments,t.heightSegments)}},gn=class extends jt{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new _e(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new _e(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=ds,this.normalScale=new De(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Ct,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},Li=class extends gn{constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new De(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return ze(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new _e(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new _e(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new _e(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}},nn=class extends jt{constructor(e){super(),this.isMeshPhongMaterial=!0,this.type="MeshPhongMaterial",this.color=new _e(16777215),this.specular=new _e(1118481),this.shininess=30,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new _e(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=ds,this.normalScale=new De(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Ct,this.combine=hs,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.specular.copy(e.specular),this.shininess=e.shininess,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},Nu=class extends jt{constructor(e){super(),this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new _e(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new _e(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=ds,this.normalScale=new De(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Ct,this.combine=hs,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},cm=class extends jt{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Up,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},hm=class extends jt{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};ra=class{constructor(e,t,i,r){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=r!==void 0?r:new t.constructor(i),this.sampleValues=t,this.valueSize=i,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,i=this._cachedIndex,r=t[i],n=t[i-1];e:{t:{let a;i:{r:if(!(e<r)){for(let s=i+2;;){if(r===void 0){if(e<n)break r;return i=t.length,this._cachedIndex=i,this.copySampleValue_(i-1)}if(i===s)break;if(n=r,r=t[++i],e<r)break t}a=t.length;break i}if(!(e>=n)){let s=t[1];e<s&&(i=2,n=s);for(let o=i-2;;){if(n===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===o)break;if(r=n,n=t[--i-1],e>=n)break t}a=i,i=0;break i}break e}for(;i<a;){let s=i+a>>>1;e<t[s]?a=s:i=s+1}if(r=t[i],n=t[i-1],n===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(r===void 0)return i=t.length,this._cachedIndex=i,this.copySampleValue_(i-1)}this._cachedIndex=i,this.intervalChanged_(i,n,r)}return this.interpolate_(i,n,e,r)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,i=this.sampleValues,r=this.valueSize,n=e*r;for(let a=0;a!==r;++a)t[a]=i[n+a];return t}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}},pm=class extends ra{constructor(e,t,i,r){super(e,t,i,r),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:tn,endingEnd:tn}}intervalChanged_(e,t,i){let r=this.parameterPositions,n=e-2,a=e+1,s=r[n],o=r[a];if(s===void 0)switch(this.getSettings_().endingStart){case rn:n=e,s=2*t-i;break;case rs:n=r.length-2,s=t+r[n]-r[n+1];break;default:n=e,s=i}if(o===void 0)switch(this.getSettings_().endingEnd){case rn:a=e,o=2*i-t;break;case rs:a=1,o=i+r[1]-r[0];break;default:a=e-1,o=t}let l=(i-t)*.5,c=this.valueSize;this._weightPrev=l/(t-s),this._weightNext=l/(o-i),this._offsetPrev=n*c,this._offsetNext=a*c}interpolate_(e,t,i,r){let n=this.resultBuffer,a=this.sampleValues,s=this.valueSize,o=e*s,l=o-s,c=this._offsetPrev,h=this._offsetNext,u=this._weightPrev,d=this._weightNext,p=(i-t)/(r-t),v=p*p,f=v*p,g=-u*f+2*u*v-u*p,m=(1+u)*f+(-1.5-2*u)*v+(-.5+u)*p+1,y=(-1-d)*f+(1.5+d)*v+.5*p,x=d*f-d*v;for(let _=0;_!==s;++_)n[_]=g*a[c+_]+m*a[l+_]+y*a[o+_]+x*a[h+_];return n}},Ou=class extends ra{constructor(e,t,i,r){super(e,t,i,r)}interpolate_(e,t,i,r){let n=this.resultBuffer,a=this.sampleValues,s=this.valueSize,o=e*s,l=o-s,c=(i-t)/(r-t),h=1-c;for(let u=0;u!==s;++u)n[u]=a[l+u]*h+a[o+u]*c;return n}},fm=class extends ra{constructor(e,t,i,r){super(e,t,i,r)}interpolate_(e){return this.copySampleValue_(e-1)}},vi=class{constructor(e,t,i,r){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=Ba(t,this.TimeBufferType),this.values=Ba(i,this.ValueBufferType),this.setInterpolation(r||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,i;if(t.toJSON!==this.toJSON)i=t.toJSON(e);else{i={name:e.name,times:Ba(e.times,Array),values:Ba(e.values,Array)};let r=e.getInterpolation();r!==e.DefaultInterpolation&&(i.interpolation=r)}return i.type=e.ValueTypeName,i}InterpolantFactoryMethodDiscrete(e){return new fm(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new Ou(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new pm(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case jn:t=this.InterpolantFactoryMethodDiscrete;break;case Xn:t=this.InterpolantFactoryMethodLinear;break;case Ns:t=this.InterpolantFactoryMethodSmooth;break}if(t===void 0){let i="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(i);return console.warn("THREE.KeyframeTrack:",i),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return jn;case this.InterpolantFactoryMethodLinear:return Xn;case this.InterpolantFactoryMethodSmooth:return Ns}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let i=0,r=t.length;i!==r;++i)t[i]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let i=0,r=t.length;i!==r;++i)t[i]*=e}return this}trim(e,t){let i=this.times,r=i.length,n=0,a=r-1;for(;n!==r&&i[n]<e;)++n;for(;a!==-1&&i[a]>t;)--a;if(++a,n!==0||a!==r){n>=a&&(a=Math.max(a,1),n=a-1);let s=this.getValueSize();this.times=i.slice(n,a),this.values=this.values.slice(n*s,a*s)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),e=!1);let i=this.times,r=this.values,n=i.length;n===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),e=!1);let a=null;for(let s=0;s!==n;s++){let o=i[s];if(typeof o=="number"&&isNaN(o)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,s,o),e=!1;break}if(a!==null&&a>o){console.error("THREE.KeyframeTrack: Out of order keys.",this,s,o,a),e=!1;break}a=o}if(r!==void 0&&um(r))for(let s=0,o=r.length;s!==o;++s){let l=r[s];if(isNaN(l)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,s,l),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),i=this.getValueSize(),r=this.getInterpolation()===Ns,n=e.length-1,a=1;for(let s=1;s<n;++s){let o=!1,l=e[s],c=e[s+1];if(l!==c&&(s!==1||l!==e[0]))if(r)o=!0;else{let h=s*i,u=h-i,d=h+i;for(let p=0;p!==i;++p){let v=t[h+p];if(v!==t[u+p]||v!==t[d+p]){o=!0;break}}}if(o){if(s!==a){e[a]=e[s];let h=s*i,u=a*i;for(let d=0;d!==i;++d)t[u+d]=t[h+d]}++a}}if(n>0){e[a]=e[n];for(let s=n*i,o=a*i,l=0;l!==i;++l)t[o+l]=t[s+l];++a}return a!==e.length?(this.times=e.slice(0,a),this.values=t.slice(0,a*i)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),i=this.constructor,r=new i(this.name,e,t);return r.createInterpolant=this.createInterpolant,r}};vi.prototype.ValueTypeName="";vi.prototype.TimeBufferType=Float32Array;vi.prototype.ValueBufferType=Float32Array;vi.prototype.DefaultInterpolation=Xn;vn=class extends vi{constructor(e,t,i){super(e,t,i)}};vn.prototype.ValueTypeName="bool";vn.prototype.ValueBufferType=Array;vn.prototype.DefaultInterpolation=jn;vn.prototype.InterpolantFactoryMethodLinear=void 0;vn.prototype.InterpolantFactoryMethodSmooth=void 0;Fu=class extends vi{constructor(e,t,i,r){super(e,t,i,r)}};Fu.prototype.ValueTypeName="color";Pr=class extends vi{constructor(e,t,i,r){super(e,t,i,r)}};Pr.prototype.ValueTypeName="number";mm=class extends ra{constructor(e,t,i,r){super(e,t,i,r)}interpolate_(e,t,i,r){let n=this.resultBuffer,a=this.sampleValues,s=this.valueSize,o=(i-t)/(r-t),l=e*s;for(let c=l+s;l!==c;l+=4)gt.slerpFlat(n,0,a,l-s,a,l,o);return n}},Xi=class extends vi{constructor(e,t,i,r){super(e,t,i,r)}InterpolantFactoryMethodLinear(e){return new mm(this.times,this.values,this.getValueSize(),e)}};Xi.prototype.ValueTypeName="quaternion";Xi.prototype.InterpolantFactoryMethodSmooth=void 0;_n=class extends vi{constructor(e,t,i){super(e,t,i)}};_n.prototype.ValueTypeName="string";_n.prototype.ValueBufferType=Array;_n.prototype.DefaultInterpolation=jn;_n.prototype.InterpolantFactoryMethodLinear=void 0;_n.prototype.InterpolantFactoryMethodSmooth=void 0;lr=class extends vi{constructor(e,t,i,r){super(e,t,i,r)}};lr.prototype.ValueTypeName="vector";Qn=class{constructor(e="",t=-1,i=[],r=Cl){this.name=e,this.tracks=i,this.duration=t,this.blendMode=r,this.uuid=gi(),this.userData={},this.duration<0&&this.resetDuration()}static parse(e){let t=[],i=e.tracks,r=1/(e.fps||1);for(let a=0,s=i.length;a!==s;++a)t.push(vm(i[a]).scale(r));let n=new this(e.name,e.duration,t,e.blendMode);return n.uuid=e.uuid,n.userData=JSON.parse(e.userData||"{}"),n}static toJSON(e){let t=[],i=e.tracks,r={name:e.name,duration:e.duration,tracks:t,uuid:e.uuid,blendMode:e.blendMode,userData:JSON.stringify(e.userData)};for(let n=0,a=i.length;n!==a;++n)t.push(vi.toJSON(i[n]));return r}static CreateFromMorphTargetSequence(e,t,i,r){let n=t.length,a=[];for(let s=0;s<n;s++){let o=[],l=[];o.push((s+n-1)%n,s,(s+1)%n),l.push(0,1,0);let c=dm(o);o=rh(o,1,c),l=rh(l,1,c),!r&&o[0]===0&&(o.push(n),l.push(l[0])),a.push(new Pr(".morphTargetInfluences["+t[s].name+"]",o,l).scale(1/i))}return new this(e,-1,a)}static findByName(e,t){let i=e;if(!Array.isArray(e)){let r=e;i=r.geometry&&r.geometry.animations||r.animations}for(let r=0;r<i.length;r++)if(i[r].name===t)return i[r];return null}static CreateClipsFromMorphTargetSequences(e,t,i){let r={},n=/^([\w-]*?)([\d]+)$/;for(let s=0,o=e.length;s<o;s++){let l=e[s],c=l.name.match(n);if(c&&c.length>1){let h=c[1],u=r[h];u||(r[h]=u=[]),u.push(l)}}let a=[];for(let s in r)a.push(this.CreateFromMorphTargetSequence(s,r[s],t,i));return a}static parseAnimation(e,t){if(console.warn("THREE.AnimationClip: parseAnimation() is deprecated and will be removed with r185"),!e)return console.error("THREE.AnimationClip: No animation in JSONLoader data."),null;let i=function(c,h,u,d,p){if(u.length!==0){let v=[],f=[];Uu(u,v,f,d),v.length!==0&&p.push(new c(h,v,f))}},r=[],n=e.name||"default",a=e.fps||30,s=e.blendMode,o=e.length||-1,l=e.hierarchy||[];for(let c=0;c<l.length;c++){let h=l[c].keys;if(!(!h||h.length===0))if(h[0].morphTargets){let u={},d;for(d=0;d<h.length;d++)if(h[d].morphTargets)for(let p=0;p<h[d].morphTargets.length;p++)u[h[d].morphTargets[p]]=-1;for(let p in u){let v=[],f=[];for(let g=0;g!==h[d].morphTargets.length;++g){let m=h[d];v.push(m.time),f.push(m.morphTarget===p?1:0)}r.push(new Pr(".morphTargetInfluence["+p+"]",v,f))}o=u.length*a}else{let u=".bones["+t[c].name+"]";i(lr,u+".position",h,"pos",r),i(Xi,u+".quaternion",h,"rot",r),i(lr,u+".scale",h,"scl",r)}}return r.length===0?null:new this(n,o,r,s)}resetDuration(){let e=this.tracks,t=0;for(let i=0,r=e.length;i!==r;++i){let n=this.tracks[i];t=Math.max(t,n.times[n.times.length-1])}return this.duration=t,this}trim(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].trim(0,this.duration);return this}validate(){let e=!0;for(let t=0;t<this.tracks.length;t++)e=e&&this.tracks[t].validate();return e}optimize(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].optimize();return this}clone(){let e=[];for(let i=0;i<this.tracks.length;i++)e.push(this.tracks[i].clone());let t=new this.constructor(this.name,this.duration,e,this.blendMode);return t.userData=JSON.parse(JSON.stringify(this.userData)),t}toJSON(){return this.constructor.toJSON(this)}};Wi={enabled:!1,files:{},add:function(e,t){this.enabled!==!1&&(this.files[e]=t)},get:function(e){if(this.enabled!==!1)return this.files[e]},remove:function(e){delete this.files[e]},clear:function(){this.files={}}},ku=class{constructor(e,t,i){let r=this,n=!1,a=0,s=0,o,l=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=i,this.abortController=new AbortController,this.itemStart=function(c){s++,n===!1&&r.onStart!==void 0&&r.onStart(c,a,s),n=!0},this.itemEnd=function(c){a++,r.onProgress!==void 0&&r.onProgress(c,a,s),a===s&&(n=!1,r.onLoad!==void 0&&r.onLoad())},this.itemError=function(c){r.onError!==void 0&&r.onError(c)},this.resolveURL=function(c){return o?o(c):c},this.setURLModifier=function(c){return o=c,this},this.addHandler=function(c,h){return l.push(c,h),this},this.removeHandler=function(c){let h=l.indexOf(c);return h!==-1&&l.splice(h,2),this},this.getHandler=function(c){for(let h=0,u=l.length;h<u;h+=2){let d=l[h],p=l[h+1];if(d.global&&(d.lastIndex=0),d.test(c))return p}return null},this.abort=function(){return this.abortController.abort(),this.abortController=new AbortController,this}}},Bu=new ku,Vt=class{constructor(e){this.manager=e!==void 0?e:Bu,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){let i=this;return new Promise(function(r,n){i.load(e,r,t,n)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}};Vt.DEFAULT_MATERIAL_NAME="__DEFAULT";zi={},_m=class extends Error{constructor(e,t){super(e),this.response=t}},qi=class extends Vt{constructor(e){super(e),this.mimeType="",this.responseType="",this._abortController=new AbortController}load(e,t,i,r){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let n=Wi.get(`file:${e}`);if(n!==void 0)return this.manager.itemStart(e),setTimeout(()=>{t&&t(n),this.manager.itemEnd(e)},0),n;if(zi[e]!==void 0){zi[e].push({onLoad:t,onProgress:i,onError:r});return}zi[e]=[],zi[e].push({onLoad:t,onProgress:i,onError:r});let a=new Request(e,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin",signal:typeof AbortSignal.any=="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal}),s=this.mimeType,o=this.responseType;fetch(a).then(l=>{if(l.status===200||l.status===0){if(l.status===0&&console.warn("THREE.FileLoader: HTTP Status 0 received."),typeof ReadableStream>"u"||l.body===void 0||l.body.getReader===void 0)return l;let c=zi[e],h=l.body.getReader(),u=l.headers.get("X-File-Size")||l.headers.get("Content-Length"),d=u?parseInt(u):0,p=d!==0,v=0,f=new ReadableStream({start(g){m();function m(){h.read().then(({done:y,value:x})=>{if(y)g.close();else{v+=x.byteLength;let _=new ProgressEvent("progress",{lengthComputable:p,loaded:v,total:d});for(let S=0,E=c.length;S<E;S++){let A=c[S];A.onProgress&&A.onProgress(_)}g.enqueue(x),m()}},y=>{g.error(y)})}}});return new Response(f)}else throw new _m(`fetch for "${l.url}" responded with ${l.status}: ${l.statusText}`,l)}).then(l=>{switch(o){case"arraybuffer":return l.arrayBuffer();case"blob":return l.blob();case"document":return l.text().then(c=>new DOMParser().parseFromString(c,s));case"json":return l.json();default:if(s==="")return l.text();{let c=/charset="?([^;"\s]*)"?/i.exec(s),h=c&&c[1]?c[1].toLowerCase():void 0,u=new TextDecoder(h);return l.arrayBuffer().then(d=>u.decode(d))}}}).then(l=>{Wi.add(`file:${e}`,l);let c=zi[e];delete zi[e];for(let h=0,u=c.length;h<u;h++){let d=c[h];d.onLoad&&d.onLoad(l)}}).catch(l=>{let c=zi[e];if(c===void 0)throw this.manager.itemError(e),l;delete zi[e];for(let h=0,u=c.length;h<u;h++){let d=c[h];d.onError&&d.onError(l)}this.manager.itemError(e)}).finally(()=>{this.manager.itemEnd(e)}),this.manager.itemStart(e)}setResponseType(e){return this.responseType=e,this}setMimeType(e){return this.mimeType=e,this}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}},Yr=new WeakMap,xm=class extends Vt{constructor(e){super(e)}load(e,t,i,r){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let n=this,a=Wi.get(`image:${e}`);if(a!==void 0){if(a.complete===!0)n.manager.itemStart(e),setTimeout(function(){t&&t(a),n.manager.itemEnd(e)},0);else{let h=Yr.get(a);h===void 0&&(h=[],Yr.set(a,h)),h.push({onLoad:t,onError:r})}return a}let s=qn("img");function o(){c(),t&&t(this);let h=Yr.get(this)||[];for(let u=0;u<h.length;u++){let d=h[u];d.onLoad&&d.onLoad(this)}Yr.delete(this),n.manager.itemEnd(e)}function l(h){c(),r&&r(h),Wi.remove(`image:${e}`);let u=Yr.get(this)||[];for(let d=0;d<u.length;d++){let p=u[d];p.onError&&p.onError(h)}Yr.delete(this),n.manager.itemError(e),n.manager.itemEnd(e)}function c(){s.removeEventListener("load",o,!1),s.removeEventListener("error",l,!1)}return s.addEventListener("load",o,!1),s.addEventListener("error",l,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(s.crossOrigin=this.crossOrigin),Wi.add(`image:${e}`,s),n.manager.itemStart(e),s.src=e,s}},ym=class extends Vt{constructor(e){super(e)}load(e,t,i,r){let n=this,a=new Dl,s=new qi(this.manager);return s.setResponseType("arraybuffer"),s.setRequestHeader(this.requestHeader),s.setPath(this.path),s.setWithCredentials(n.withCredentials),s.load(e,function(o){let l;try{l=n.parse(o)}catch(c){if(r!==void 0)r(c);else{console.error(c);return}}l.image!==void 0?a.image=l.image:l.data!==void 0&&(a.image.width=l.width,a.image.height=l.height,a.image.data=l.data),a.wrapS=l.wrapS!==void 0?l.wrapS:ti,a.wrapT=l.wrapT!==void 0?l.wrapT:ti,a.magFilter=l.magFilter!==void 0?l.magFilter:Nt,a.minFilter=l.minFilter!==void 0?l.minFilter:Nt,a.anisotropy=l.anisotropy!==void 0?l.anisotropy:1,l.colorSpace!==void 0&&(a.colorSpace=l.colorSpace),l.flipY!==void 0&&(a.flipY=l.flipY),l.format!==void 0&&(a.format=l.format),l.type!==void 0&&(a.type=l.type),l.mipmaps!==void 0&&(a.mipmaps=l.mipmaps,a.minFilter=pi),l.mipmapCount===1&&(a.minFilter=Nt),l.generateMipmaps!==void 0&&(a.generateMipmaps=l.generateMipmaps),a.needsUpdate=!0,t&&t(a,l)},i,r),a}},Ol=class extends Vt{constructor(e){super(e)}load(e,t,i,r){let n=new Ht,a=new xm(this.manager);return a.setCrossOrigin(this.crossOrigin),a.setPath(this.path),a.load(e,function(s){n.image=s,n.needsUpdate=!0,t!==void 0&&t(n)},i,r),n}},na=class extends dt{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new _e(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}},bm=class extends na{constructor(e,t,i){super(e,i),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(dt.DEFAULT_UP),this.updateMatrix(),this.groundColor=new _e(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}},so=new we,nh=new P,ah=new P,Fl=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new De(512,512),this.mapType=Ri,this.map=null,this.mapPass=null,this.matrix=new we,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Ul,this._frameExtents=new De(1,1),this._viewportCount=1,this._viewports=[new Ye(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera,i=this.matrix;nh.setFromMatrixPosition(e.matrixWorld),t.position.copy(nh),ah.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(ah),t.updateMatrixWorld(),so.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(so,t.coordinateSystem,t.reversedDepth),t.reversedDepth?i.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):i.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),i.multiply(so)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},wm=class extends Fl{constructor(){super(new Dt(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1,this.aspect=1}updateMatrices(e){let t=this.camera,i=pn*2*e.angle*this.focus,r=this.mapSize.width/this.mapSize.height*this.aspect,n=e.distance||t.far;(i!==t.fov||r!==t.aspect||n!==t.far)&&(t.fov=i,t.aspect=r,t.far=n,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this}},zu=class extends na{constructor(e,t,i=0,r=Math.PI/3,n=0,a=2){super(e,t),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(dt.DEFAULT_UP),this.updateMatrix(),this.target=new dt,this.distance=i,this.angle=r,this.penumbra=n,this.decay=a,this.map=null,this.shadow=new wm}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}},sh=new we,Pn=new P,oo=new P,Mm=class extends Fl{constructor(){super(new Dt(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new De(4,2),this._viewportCount=6,this._viewports=[new Ye(2,1,1,1),new Ye(0,1,1,1),new Ye(3,1,1,1),new Ye(1,1,1,1),new Ye(3,0,1,1),new Ye(1,0,1,1)],this._cubeDirections=[new P(1,0,0),new P(-1,0,0),new P(0,0,1),new P(0,0,-1),new P(0,1,0),new P(0,-1,0)],this._cubeUps=[new P(0,1,0),new P(0,1,0),new P(0,1,0),new P(0,1,0),new P(0,0,1),new P(0,0,-1)]}updateMatrices(e,t=0){let i=this.camera,r=this.matrix,n=e.distance||i.far;n!==i.far&&(i.far=n,i.updateProjectionMatrix()),Pn.setFromMatrixPosition(e.matrixWorld),i.position.copy(Pn),oo.copy(i.position),oo.add(this._cubeDirections[t]),i.up.copy(this._cubeUps[t]),i.lookAt(oo),i.updateMatrixWorld(),r.makeTranslation(-Pn.x,-Pn.y,-Pn.z),sh.multiplyMatrices(i.projectionMatrix,i.matrixWorldInverse),this._frustum.setFromProjectionMatrix(sh,i.coordinateSystem,i.reversedDepth)}},cs=class extends na{constructor(e,t,i=0,r=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=i,this.decay=r,this.shadow=new Mm}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}},kl=class extends _u{constructor(e=-1,t=1,i=1,r=-1,n=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=i,this.bottom=r,this.near=n,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,i,r,n,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=r,this.view.width=n,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,r=(this.top+this.bottom)/2,n=i-e,a=i+e,s=r+t,o=r-t;if(this.view!==null&&this.view.enabled){let l=(this.right-this.left)/this.view.fullWidth/this.zoom,c=(this.top-this.bottom)/this.view.fullHeight/this.zoom;n+=l*this.view.offsetX,a=n+l*this.view.width,s-=c*this.view.offsetY,o=s-c*this.view.height}this.projectionMatrix.makeOrthographic(n,a,s,o,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},Sm=class extends Fl{constructor(){super(new kl(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Bl=class extends na{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(dt.DEFAULT_UP),this.updateMatrix(),this.target=new dt,this.shadow=new Sm}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}},Em=class extends na{constructor(e,t){super(e,t),this.isAmbientLight=!0,this.type="AmbientLight"}},Rr=class{static extractUrlBase(e){let t=e.lastIndexOf("/");return t===-1?"./":e.slice(0,t+1)}static resolveURL(e,t){return typeof e!="string"||e===""?"":(/^https?:\/\//i.test(t)&&/^\//.test(e)&&(t=t.replace(/(^https?:\/\/[^\/]+).*/i,"$1")),/^(https?:)?\/\//i.test(e)||/^data:.*,.*$/i.test(e)||/^blob:.*$/i.test(e)?e:t+e)}},lo=new WeakMap,Tm=class extends Vt{constructor(e){super(e),this.isImageBitmapLoader=!0,typeof createImageBitmap>"u"&&console.warn("THREE.ImageBitmapLoader: createImageBitmap() not supported."),typeof fetch>"u"&&console.warn("THREE.ImageBitmapLoader: fetch() not supported."),this.options={premultiplyAlpha:"none"},this._abortController=new AbortController}setOptions(e){return this.options=e,this}load(e,t,i,r){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let n=this,a=Wi.get(`image-bitmap:${e}`);if(a!==void 0){if(n.manager.itemStart(e),a.then){a.then(l=>{if(lo.has(a)===!0)r&&r(lo.get(a)),n.manager.itemError(e),n.manager.itemEnd(e);else return t&&t(l),n.manager.itemEnd(e),l});return}return setTimeout(function(){t&&t(a),n.manager.itemEnd(e)},0),a}let s={};s.credentials=this.crossOrigin==="anonymous"?"same-origin":"include",s.headers=this.requestHeader,s.signal=typeof AbortSignal.any=="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal;let o=fetch(e,s).then(function(l){return l.blob()}).then(function(l){return createImageBitmap(l,Object.assign(n.options,{colorSpaceConversion:"none"}))}).then(function(l){return Wi.add(`image-bitmap:${e}`,l),t&&t(l),n.manager.itemEnd(e),l}).catch(function(l){r&&r(l),lo.set(o,l),Wi.remove(`image-bitmap:${e}`),n.manager.itemError(e),n.manager.itemEnd(e)});Wi.add(`image-bitmap:${e}`,o),n.manager.itemStart(e)}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}},Am=class extends Dt{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}},Rm=class{constructor(e,t,i){this.binding=e,this.valueSize=i;let r,n,a;switch(t){case"quaternion":r=this._slerp,n=this._slerpAdditive,a=this._setAdditiveIdentityQuaternion,this.buffer=new Float64Array(i*6),this._workIndex=5;break;case"string":case"bool":r=this._select,n=this._select,a=this._setAdditiveIdentityOther,this.buffer=new Array(i*5);break;default:r=this._lerp,n=this._lerpAdditive,a=this._setAdditiveIdentityNumeric,this.buffer=new Float64Array(i*5)}this._mixBufferRegion=r,this._mixBufferRegionAdditive=n,this._setIdentity=a,this._origIndex=3,this._addIndex=4,this.cumulativeWeight=0,this.cumulativeWeightAdditive=0,this.useCount=0,this.referenceCount=0}accumulate(e,t){let i=this.buffer,r=this.valueSize,n=e*r+r,a=this.cumulativeWeight;if(a===0){for(let s=0;s!==r;++s)i[n+s]=i[s];a=t}else{a+=t;let s=t/a;this._mixBufferRegion(i,n,0,s,r)}this.cumulativeWeight=a}accumulateAdditive(e){let t=this.buffer,i=this.valueSize,r=i*this._addIndex;this.cumulativeWeightAdditive===0&&this._setIdentity(),this._mixBufferRegionAdditive(t,r,0,e,i),this.cumulativeWeightAdditive+=e}apply(e){let t=this.valueSize,i=this.buffer,r=e*t+t,n=this.cumulativeWeight,a=this.cumulativeWeightAdditive,s=this.binding;if(this.cumulativeWeight=0,this.cumulativeWeightAdditive=0,n<1){let o=t*this._origIndex;this._mixBufferRegion(i,r,o,1-n,t)}a>0&&this._mixBufferRegionAdditive(i,r,this._addIndex*t,1,t);for(let o=t,l=t+t;o!==l;++o)if(i[o]!==i[o+t]){s.setValue(i,r);break}}saveOriginalState(){let e=this.binding,t=this.buffer,i=this.valueSize,r=i*this._origIndex;e.getValue(t,r);for(let n=i,a=r;n!==a;++n)t[n]=t[r+n%i];this._setIdentity(),this.cumulativeWeight=0,this.cumulativeWeightAdditive=0}restoreOriginalState(){let e=this.valueSize*3;this.binding.setValue(this.buffer,e)}_setAdditiveIdentityNumeric(){let e=this._addIndex*this.valueSize,t=e+this.valueSize;for(let i=e;i<t;i++)this.buffer[i]=0}_setAdditiveIdentityQuaternion(){this._setAdditiveIdentityNumeric(),this.buffer[this._addIndex*this.valueSize+3]=1}_setAdditiveIdentityOther(){let e=this._origIndex*this.valueSize,t=this._addIndex*this.valueSize;for(let i=0;i<this.valueSize;i++)this.buffer[t+i]=this.buffer[e+i]}_select(e,t,i,r,n){if(r>=.5)for(let a=0;a!==n;++a)e[t+a]=e[i+a]}_slerp(e,t,i,r){gt.slerpFlat(e,t,e,t,e,i,r)}_slerpAdditive(e,t,i,r,n){let a=this._workIndex*n;gt.multiplyQuaternionsFlat(e,a,e,t,e,i),gt.slerpFlat(e,t,e,t,e,a,r)}_lerp(e,t,i,r,n){let a=1-r;for(let s=0;s!==n;++s){let o=t+s;e[o]=e[o]*a+e[i+s]*r}}_lerpAdditive(e,t,i,r,n){for(let a=0;a!==n;++a){let s=t+a;e[s]=e[s]+e[i+a]*r}}},zl="\\[\\]\\.:\\/",Cm=new RegExp("["+zl+"]","g"),Hl="[^"+zl+"]",Im="[^"+zl.replace("\\.","")+"]",Lm=/((?:WC+[\/:])*)/.source.replace("WC",Hl),Pm=/(WCOD+)?/.source.replace("WCOD",Im),Dm=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Hl),Nm=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Hl),Um=new RegExp("^"+Lm+Pm+Dm+Nm+"$"),Om=["material","materials","bones","map"],Fm=class{constructor(e,t,i){let r=i||at.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,r)}getValue(e,t){this.bind();let i=this._targetGroup.nCachedObjects_,r=this._bindings[i];r!==void 0&&r.getValue(e,t)}setValue(e,t){let i=this._bindings;for(let r=this._targetGroup.nCachedObjects_,n=i.length;r!==n;++r)i[r].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,i=e.length;t!==i;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,i=e.length;t!==i;++t)e[t].unbind()}},at=class Qr{constructor(t,i,r){this.path=i,this.parsedPath=r||Qr.parseTrackName(i),this.node=Qr.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,i,r){return t&&t.isAnimationObjectGroup?new Qr.Composite(t,i,r):new Qr(t,i,r)}static sanitizeNodeName(t){return t.replace(/\s/g,"_").replace(Cm,"")}static parseTrackName(t){let i=Um.exec(t);if(i===null)throw new Error("PropertyBinding: Cannot parse trackName: "+t);let r={nodeName:i[2],objectName:i[3],objectIndex:i[4],propertyName:i[5],propertyIndex:i[6]},n=r.nodeName&&r.nodeName.lastIndexOf(".");if(n!==void 0&&n!==-1){let a=r.nodeName.substring(n+1);Om.indexOf(a)!==-1&&(r.nodeName=r.nodeName.substring(0,n),r.objectName=a)}if(r.propertyName===null||r.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+t);return r}static findNode(t,i){if(i===void 0||i===""||i==="."||i===-1||i===t.name||i===t.uuid)return t;if(t.skeleton){let r=t.skeleton.getBoneByName(i);if(r!==void 0)return r}if(t.children){let r=function(a){for(let s=0;s<a.length;s++){let o=a[s];if(o.name===i||o.uuid===i)return o;let l=r(o.children);if(l)return l}return null},n=r(t.children);if(n)return n}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(t,i){t[i]=this.targetObject[this.propertyName]}_getValue_array(t,i){let r=this.resolvedProperty;for(let n=0,a=r.length;n!==a;++n)t[i++]=r[n]}_getValue_arrayElement(t,i){t[i]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(t,i){this.resolvedProperty.toArray(t,i)}_setValue_direct(t,i){this.targetObject[this.propertyName]=t[i]}_setValue_direct_setNeedsUpdate(t,i){this.targetObject[this.propertyName]=t[i],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(t,i){this.targetObject[this.propertyName]=t[i],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(t,i){let r=this.resolvedProperty;for(let n=0,a=r.length;n!==a;++n)r[n]=t[i++]}_setValue_array_setNeedsUpdate(t,i){let r=this.resolvedProperty;for(let n=0,a=r.length;n!==a;++n)r[n]=t[i++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(t,i){let r=this.resolvedProperty;for(let n=0,a=r.length;n!==a;++n)r[n]=t[i++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(t,i){this.resolvedProperty[this.propertyIndex]=t[i]}_setValue_arrayElement_setNeedsUpdate(t,i){this.resolvedProperty[this.propertyIndex]=t[i],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(t,i){this.resolvedProperty[this.propertyIndex]=t[i],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(t,i){this.resolvedProperty.fromArray(t,i)}_setValue_fromArray_setNeedsUpdate(t,i){this.resolvedProperty.fromArray(t,i),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(t,i){this.resolvedProperty.fromArray(t,i),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(t,i){this.bind(),this.getValue(t,i)}_setValue_unbound(t,i){this.bind(),this.setValue(t,i)}bind(){let t=this.node,i=this.parsedPath,r=i.objectName,n=i.propertyName,a=i.propertyIndex;if(t||(t=Qr.findNode(this.rootNode,i.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");return}if(r){let c=i.objectIndex;switch(r){case"materials":if(!t.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.materials){console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}t=t.material.materials;break;case"bones":if(!t.skeleton){console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}t=t.skeleton.bones;for(let h=0;h<t.length;h++)if(t[h].name===c){c=h;break}break;case"map":if("map"in t){t=t.map;break}if(!t.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.map){console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}t=t.material.map;break;default:if(t[r]===void 0){console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);return}t=t[r]}if(c!==void 0){if(t[c]===void 0){console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,t);return}t=t[c]}}let s=t[n];if(s===void 0){let c=i.nodeName;console.error("THREE.PropertyBinding: Trying to update property for track: "+c+"."+n+" but it wasn't found.",t);return}let o=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?o=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(a!==void 0){if(n==="morphTargetInfluences"){if(!t.geometry){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!t.geometry.morphAttributes){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}t.morphTargetDictionary[a]!==void 0&&(a=t.morphTargetDictionary[a])}l=this.BindingType.ArrayElement,this.resolvedProperty=s,this.propertyIndex=a}else s.fromArray!==void 0&&s.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=s):Array.isArray(s)?(l=this.BindingType.EntireArray,this.resolvedProperty=s):this.propertyName=n;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};at.Composite=Fm;at.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};at.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};at.prototype.GetterByBindingType=[at.prototype._getValue_direct,at.prototype._getValue_array,at.prototype._getValue_arrayElement,at.prototype._getValue_toArray];at.prototype.SetterByBindingTypeAndVersioning=[[at.prototype._setValue_direct,at.prototype._setValue_direct_setNeedsUpdate,at.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[at.prototype._setValue_array,at.prototype._setValue_array_setNeedsUpdate,at.prototype._setValue_array_setMatrixWorldNeedsUpdate],[at.prototype._setValue_arrayElement,at.prototype._setValue_arrayElement_setNeedsUpdate,at.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[at.prototype._setValue_fromArray,at.prototype._setValue_fromArray_setNeedsUpdate,at.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];km=class{constructor(e,t,i=null,r=t.blendMode){this._mixer=e,this._clip=t,this._localRoot=i,this.blendMode=r;let n=t.tracks,a=n.length,s=new Array(a),o={endingStart:tn,endingEnd:tn};for(let l=0;l!==a;++l){let c=n[l].createInterpolant(null);s[l]=c,c.settings=o}this._interpolantSettings=o,this._interpolants=s,this._propertyBindings=new Array(a),this._cacheIndex=null,this._byClipCacheIndex=null,this._timeScaleInterpolant=null,this._weightInterpolant=null,this.loop=Lp,this._loopCount=-1,this._startTime=null,this.time=0,this.timeScale=1,this._effectiveTimeScale=1,this.weight=1,this._effectiveWeight=1,this.repetitions=1/0,this.paused=!1,this.enabled=!0,this.clampWhenFinished=!1,this.zeroSlopeAtStart=!0,this.zeroSlopeAtEnd=!0}play(){return this._mixer._activateAction(this),this}stop(){return this._mixer._deactivateAction(this),this.reset()}reset(){return this.paused=!1,this.enabled=!0,this.time=0,this._loopCount=-1,this._startTime=null,this.stopFading().stopWarping()}isRunning(){return this.enabled&&!this.paused&&this.timeScale!==0&&this._startTime===null&&this._mixer._isActiveAction(this)}isScheduled(){return this._mixer._isActiveAction(this)}startAt(e){return this._startTime=e,this}setLoop(e,t){return this.loop=e,this.repetitions=t,this}setEffectiveWeight(e){return this.weight=e,this._effectiveWeight=this.enabled?e:0,this.stopFading()}getEffectiveWeight(){return this._effectiveWeight}fadeIn(e){return this._scheduleFading(e,0,1)}fadeOut(e){return this._scheduleFading(e,1,0)}crossFadeFrom(e,t,i=!1){if(e.fadeOut(t),this.fadeIn(t),i===!0){let r=this._clip.duration,n=e._clip.duration,a=n/r,s=r/n;e.warp(1,a,t),this.warp(s,1,t)}return this}crossFadeTo(e,t,i=!1){return e.crossFadeFrom(this,t,i)}stopFading(){let e=this._weightInterpolant;return e!==null&&(this._weightInterpolant=null,this._mixer._takeBackControlInterpolant(e)),this}setEffectiveTimeScale(e){return this.timeScale=e,this._effectiveTimeScale=this.paused?0:e,this.stopWarping()}getEffectiveTimeScale(){return this._effectiveTimeScale}setDuration(e){return this.timeScale=this._clip.duration/e,this.stopWarping()}syncWith(e){return this.time=e.time,this.timeScale=e.timeScale,this.stopWarping()}halt(e){return this.warp(this._effectiveTimeScale,0,e)}warp(e,t,i){let r=this._mixer,n=r.time,a=this.timeScale,s=this._timeScaleInterpolant;s===null&&(s=r._lendControlInterpolant(),this._timeScaleInterpolant=s);let o=s.parameterPositions,l=s.sampleValues;return o[0]=n,o[1]=n+i,l[0]=e/a,l[1]=t/a,this}stopWarping(){let e=this._timeScaleInterpolant;return e!==null&&(this._timeScaleInterpolant=null,this._mixer._takeBackControlInterpolant(e)),this}getMixer(){return this._mixer}getClip(){return this._clip}getRoot(){return this._localRoot||this._mixer._root}_update(e,t,i,r){if(!this.enabled){this._updateWeight(e);return}let n=this._startTime;if(n!==null){let o=(e-n)*i;o<0||i===0?t=0:(this._startTime=null,t=i*o)}t*=this._updateTimeScale(e);let a=this._updateTime(t),s=this._updateWeight(e);if(s>0){let o=this._interpolants,l=this._propertyBindings;switch(this.blendMode){case Dp:for(let c=0,h=o.length;c!==h;++c)o[c].evaluate(a),l[c].accumulateAdditive(s);break;case Cl:default:for(let c=0,h=o.length;c!==h;++c)o[c].evaluate(a),l[c].accumulate(r,s)}}}_updateWeight(e){let t=0;if(this.enabled){t=this.weight;let i=this._weightInterpolant;if(i!==null){let r=i.evaluate(e)[0];t*=r,e>i.parameterPositions[1]&&(this.stopFading(),r===0&&(this.enabled=!1))}}return this._effectiveWeight=t,t}_updateTimeScale(e){let t=0;if(!this.paused){t=this.timeScale;let i=this._timeScaleInterpolant;if(i!==null){let r=i.evaluate(e)[0];t*=r,e>i.parameterPositions[1]&&(this.stopWarping(),t===0?this.paused=!0:this.timeScale=t)}}return this._effectiveTimeScale=t,t}_updateTime(e){let t=this._clip.duration,i=this.loop,r=this.time+e,n=this._loopCount,a=i===Pp;if(e===0)return n===-1?r:a&&(n&1)===1?t-r:r;if(i===iu){n===-1&&(this._loopCount=0,this._setEndings(!0,!0,!1));e:{if(r>=t)r=t;else if(r<0)r=0;else{this.time=r;break e}this.clampWhenFinished?this.paused=!0:this.enabled=!1,this.time=r,this._mixer.dispatchEvent({type:"finished",action:this,direction:e<0?-1:1})}}else{if(n===-1&&(e>=0?(n=0,this._setEndings(!0,this.repetitions===0,a)):this._setEndings(this.repetitions===0,!0,a)),r>=t||r<0){let s=Math.floor(r/t);r-=t*s,n+=Math.abs(s);let o=this.repetitions-n;if(o<=0)this.clampWhenFinished?this.paused=!0:this.enabled=!1,r=e>0?t:0,this.time=r,this._mixer.dispatchEvent({type:"finished",action:this,direction:e>0?1:-1});else{if(o===1){let l=e<0;this._setEndings(l,!l,a)}else this._setEndings(!1,!1,a);this._loopCount=n,this.time=r,this._mixer.dispatchEvent({type:"loop",action:this,loopDelta:s})}}else this.time=r;if(a&&(n&1)===1)return t-r}return r}_setEndings(e,t,i){let r=this._interpolantSettings;i?(r.endingStart=rn,r.endingEnd=rn):(e?r.endingStart=this.zeroSlopeAtStart?rn:tn:r.endingStart=rs,t?r.endingEnd=this.zeroSlopeAtEnd?rn:tn:r.endingEnd=rs)}_scheduleFading(e,t,i){let r=this._mixer,n=r.time,a=this._weightInterpolant;a===null&&(a=r._lendControlInterpolant(),this._weightInterpolant=a);let s=a.parameterPositions,o=a.sampleValues;return s[0]=n,o[0]=t,s[1]=n+e,o[1]=i,this}},Bm=new Float32Array(1),zm=class extends cr{constructor(e){super(),this._root=e,this._initMemoryManager(),this._accuIndex=0,this.time=0,this.timeScale=1}_bindAction(e,t){let i=e._localRoot||this._root,r=e._clip.tracks,n=r.length,a=e._propertyBindings,s=e._interpolants,o=i.uuid,l=this._bindingsByRootAndName,c=l[o];c===void 0&&(c={},l[o]=c);for(let h=0;h!==n;++h){let u=r[h],d=u.name,p=c[d];if(p!==void 0)++p.referenceCount,a[h]=p;else{if(p=a[h],p!==void 0){p._cacheIndex===null&&(++p.referenceCount,this._addInactiveBinding(p,o,d));continue}let v=t&&t._propertyBindings[h].binding.parsedPath;p=new Rm(at.create(i,d,v),u.ValueTypeName,u.getValueSize()),++p.referenceCount,this._addInactiveBinding(p,o,d),a[h]=p}s[h].resultBuffer=p.buffer}}_activateAction(e){if(!this._isActiveAction(e)){if(e._cacheIndex===null){let i=(e._localRoot||this._root).uuid,r=e._clip.uuid,n=this._actionsByClip[r];this._bindAction(e,n&&n.knownActions[0]),this._addInactiveAction(e,r,i)}let t=e._propertyBindings;for(let i=0,r=t.length;i!==r;++i){let n=t[i];n.useCount++===0&&(this._lendBinding(n),n.saveOriginalState())}this._lendAction(e)}}_deactivateAction(e){if(this._isActiveAction(e)){let t=e._propertyBindings;for(let i=0,r=t.length;i!==r;++i){let n=t[i];--n.useCount===0&&(n.restoreOriginalState(),this._takeBackBinding(n))}this._takeBackAction(e)}}_initMemoryManager(){this._actions=[],this._nActiveActions=0,this._actionsByClip={},this._bindings=[],this._nActiveBindings=0,this._bindingsByRootAndName={},this._controlInterpolants=[],this._nActiveControlInterpolants=0;let e=this;this.stats={actions:{get total(){return e._actions.length},get inUse(){return e._nActiveActions}},bindings:{get total(){return e._bindings.length},get inUse(){return e._nActiveBindings}},controlInterpolants:{get total(){return e._controlInterpolants.length},get inUse(){return e._nActiveControlInterpolants}}}}_isActiveAction(e){let t=e._cacheIndex;return t!==null&&t<this._nActiveActions}_addInactiveAction(e,t,i){let r=this._actions,n=this._actionsByClip,a=n[t];if(a===void 0)a={knownActions:[e],actionByRoot:{}},e._byClipCacheIndex=0,n[t]=a;else{let s=a.knownActions;e._byClipCacheIndex=s.length,s.push(e)}e._cacheIndex=r.length,r.push(e),a.actionByRoot[i]=e}_removeInactiveAction(e){let t=this._actions,i=t[t.length-1],r=e._cacheIndex;i._cacheIndex=r,t[r]=i,t.pop(),e._cacheIndex=null;let n=e._clip.uuid,a=this._actionsByClip,s=a[n],o=s.knownActions,l=o[o.length-1],c=e._byClipCacheIndex;l._byClipCacheIndex=c,o[c]=l,o.pop(),e._byClipCacheIndex=null;let h=s.actionByRoot,u=(e._localRoot||this._root).uuid;delete h[u],o.length===0&&delete a[n],this._removeInactiveBindingsForAction(e)}_removeInactiveBindingsForAction(e){let t=e._propertyBindings;for(let i=0,r=t.length;i!==r;++i){let n=t[i];--n.referenceCount===0&&this._removeInactiveBinding(n)}}_lendAction(e){let t=this._actions,i=e._cacheIndex,r=this._nActiveActions++,n=t[r];e._cacheIndex=r,t[r]=e,n._cacheIndex=i,t[i]=n}_takeBackAction(e){let t=this._actions,i=e._cacheIndex,r=--this._nActiveActions,n=t[r];e._cacheIndex=r,t[r]=e,n._cacheIndex=i,t[i]=n}_addInactiveBinding(e,t,i){let r=this._bindingsByRootAndName,n=this._bindings,a=r[t];a===void 0&&(a={},r[t]=a),a[i]=e,e._cacheIndex=n.length,n.push(e)}_removeInactiveBinding(e){let t=this._bindings,i=e.binding,r=i.rootNode.uuid,n=i.path,a=this._bindingsByRootAndName,s=a[r],o=t[t.length-1],l=e._cacheIndex;o._cacheIndex=l,t[l]=o,t.pop(),delete s[n],Object.keys(s).length===0&&delete a[r]}_lendBinding(e){let t=this._bindings,i=e._cacheIndex,r=this._nActiveBindings++,n=t[r];e._cacheIndex=r,t[r]=e,n._cacheIndex=i,t[i]=n}_takeBackBinding(e){let t=this._bindings,i=e._cacheIndex,r=--this._nActiveBindings,n=t[r];e._cacheIndex=r,t[r]=e,n._cacheIndex=i,t[i]=n}_lendControlInterpolant(){let e=this._controlInterpolants,t=this._nActiveControlInterpolants++,i=e[t];return i===void 0&&(i=new Ou(new Float32Array(2),new Float32Array(2),1,Bm),i.__cacheIndex=t,e[t]=i),i}_takeBackControlInterpolant(e){let t=this._controlInterpolants,i=e.__cacheIndex,r=--this._nActiveControlInterpolants,n=t[r];e.__cacheIndex=r,t[r]=e,n.__cacheIndex=i,t[i]=n}clipAction(e,t,i){let r=t||this._root,n=r.uuid,a=typeof e=="string"?Qn.findByName(r,e):e,s=a!==null?a.uuid:e,o=this._actionsByClip[s],l=null;if(i===void 0&&(a!==null?i=a.blendMode:i=Cl),o!==void 0){let h=o.actionByRoot[n];if(h!==void 0&&h.blendMode===i)return h;l=o.knownActions[0],a===null&&(a=l._clip)}if(a===null)return null;let c=new km(this,a,t,i);return this._bindAction(c,l),this._addInactiveAction(c,s,n),c}existingAction(e,t){let i=t||this._root,r=i.uuid,n=typeof e=="string"?Qn.findByName(i,e):e,a=n?n.uuid:e,s=this._actionsByClip[a];return s!==void 0&&s.actionByRoot[r]||null}stopAllAction(){let e=this._actions,t=this._nActiveActions;for(let i=t-1;i>=0;--i)e[i].stop();return this}update(e){e*=this.timeScale;let t=this._actions,i=this._nActiveActions,r=this.time+=e,n=Math.sign(e),a=this._accuIndex^=1;for(let l=0;l!==i;++l)t[l]._update(r,e,n,a);let s=this._bindings,o=this._nActiveBindings;for(let l=0;l!==o;++l)s[l].apply(a);return this}setTime(e){this.time=0;for(let t=0;t<this._actions.length;t++)this._actions[t].time=0;return this.update(e)}getRoot(){return this._root}uncacheClip(e){let t=this._actions,i=e.uuid,r=this._actionsByClip,n=r[i];if(n!==void 0){let a=n.knownActions;for(let s=0,o=a.length;s!==o;++s){let l=a[s];this._deactivateAction(l);let c=l._cacheIndex,h=t[t.length-1];l._cacheIndex=null,l._byClipCacheIndex=null,h._cacheIndex=c,t[c]=h,t.pop(),this._removeInactiveBindingsForAction(l)}delete r[i]}}uncacheRoot(e){let t=e.uuid,i=this._actionsByClip;for(let a in i){let s=i[a].actionByRoot,o=s[t];o!==void 0&&(this._deactivateAction(o),this._removeInactiveAction(o))}let r=this._bindingsByRootAndName,n=r[t];if(n!==void 0)for(let a in n){let s=n[a];s.restoreOriginalState(),this._removeInactiveBinding(s)}}uncacheAction(e,t){let i=this.existingAction(e,t);i!==null&&(this._deactivateAction(i),this._removeInactiveAction(i))}},oh=class{constructor(e=1,t=0,i=0){this.radius=e,this.phi=t,this.theta=i}set(e,t,i){return this.radius=e,this.phi=t,this.theta=i,this}copy(e){return this.radius=e.radius,this.phi=e.phi,this.theta=e.theta,this}makeSafe(){return this.phi=ze(this.phi,1e-6,Math.PI-1e-6),this}setFromVector3(e){return this.setFromCartesianCoords(e.x,e.y,e.z)}setFromCartesianCoords(e,t,i){return this.radius=Math.sqrt(e*e+t*t+i*i),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(e,i),this.phi=Math.acos(ze(t/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}},tr=new P,za=new we,co=new we,Hm=class extends ls{constructor(e){let t=Hu(e),i=new It,r=[],n=[];for(let l=0;l<t.length;l++){let c=t[l];c.parent&&c.parent.isBone&&(r.push(0,0,0),r.push(0,0,0),n.push(0,0,0),n.push(0,0,0))}i.setAttribute("position",new Ze(r,3)),i.setAttribute("color",new Ze(n,3));let a=new Ar({vertexColors:!0,depthTest:!1,depthWrite:!1,toneMapped:!1,transparent:!0});super(i,a),this.isSkeletonHelper=!0,this.type="SkeletonHelper",this.root=e,this.bones=t,this.matrix=e.matrixWorld,this.matrixAutoUpdate=!1;let s=new _e(255),o=new _e(65280);this.setColors(s,o)}updateMatrixWorld(e){let t=this.bones,i=this.geometry,r=i.getAttribute("position");co.copy(this.root.matrixWorld).invert();for(let n=0,a=0;n<t.length;n++){let s=t[n];s.parent&&s.parent.isBone&&(za.multiplyMatrices(co,s.matrixWorld),tr.setFromMatrixPosition(za),r.setXYZ(a,tr.x,tr.y,tr.z),za.multiplyMatrices(co,s.parent.matrixWorld),tr.setFromMatrixPosition(za),r.setXYZ(a+1,tr.x,tr.y,tr.z),a+=2)}i.getAttribute("position").needsUpdate=!0,super.updateMatrixWorld(e)}setColors(e,t){let i=this.geometry.getAttribute("color");for(let r=0;r<i.count;r+=2)i.setXYZ(r,e.r,e.g,e.b),i.setXYZ(r+1,t.r,t.g,t.b);return i.needsUpdate=!0,this}dispose(){this.geometry.dispose(),this.material.dispose()}};Vm=class extends cr{constructor(e,t=null){super(),this.object=e,this.domElement=t,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(e){if(e===void 0){console.warn("THREE.Controls: connect() now requires an element.");return}this.domElement!==null&&this.disconnect(),this.domElement=e}disconnect(){}dispose(){}update(){}};typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"180"}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="180");jm=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Xm=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,qm=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Ym=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,$m=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Km=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Zm=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT )
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN )
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,Jm=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Qm=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,eg=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,tg=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,ig=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,rg=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,ng=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,ag=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,sg=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,og=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,lg=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,cg=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,hg=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,ug=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,dg=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,pg=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,fg=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,mg=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,gg=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,vg=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,_g=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,xg=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,yg=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,bg="gl_FragColor = linearToOutputTexel( gl_FragColor );",wg=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Mg=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,Sg=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif

#endif`,Eg=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,Tg=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS

		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Ag=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,Rg=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Cg=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Ig=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Lg=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Pg=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,Dg=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Ng=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Ug=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Og=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,Fg=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,kg=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Bg=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,zg=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Hg=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Vg=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,Wg=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,Gg=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,jg=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,Xg=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,qg=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Yg=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,$g=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Kg=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Zg=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Jg=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Qg=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,ev=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,tv=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,iv=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,rv=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,nv=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,av=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,sv=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,ov=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,lv=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,cv=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,hv=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,uv=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,dv=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,pv=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,fv=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,mv=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,gv=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,vv=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,_v=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,xv=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,yv=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,bv=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,wv=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Mv=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Sv=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Ev=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Tv=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		float depth = unpackRGBAToDepth( texture2D( depths, uv ) );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			return step( depth, compare );
		#else
			return step( compare, depth );
		#endif
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow( sampler2D shadow, vec2 uv, float compare ) {
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			float hard_shadow = step( distribution.x, compare );
		#else
			float hard_shadow = step( compare, distribution.x );
		#endif
		if ( hard_shadow != 1.0 ) {
			float distance = compare - distribution.x;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;

		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,Av=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,Rv=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,Cv=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,Iv=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Lv=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,Pv=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Dv=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,Nv=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Uv=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Ov=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Fv=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,kv=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,Bv=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,zv=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Hv=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Vv=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,Wv=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,Gv=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,jv=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Xv=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,qv=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Yv=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,$v=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Kv=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,Zv=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,Jv=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,Qv=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,e0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,t0=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,i0=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,r0=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,n0=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,a0=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,s0=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,o0=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,l0=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,c0=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,h0=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,u0=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,d0=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,p0=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,f0=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,m0=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,g0=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,v0=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,_0=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,x0=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,y0=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,b0=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,w0=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,M0=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,He={alphahash_fragment:jm,alphahash_pars_fragment:Xm,alphamap_fragment:qm,alphamap_pars_fragment:Ym,alphatest_fragment:$m,alphatest_pars_fragment:Km,aomap_fragment:Zm,aomap_pars_fragment:Jm,batching_pars_vertex:Qm,batching_vertex:eg,begin_vertex:tg,beginnormal_vertex:ig,bsdfs:rg,iridescence_fragment:ng,bumpmap_pars_fragment:ag,clipping_planes_fragment:sg,clipping_planes_pars_fragment:og,clipping_planes_pars_vertex:lg,clipping_planes_vertex:cg,color_fragment:hg,color_pars_fragment:ug,color_pars_vertex:dg,color_vertex:pg,common:fg,cube_uv_reflection_fragment:mg,defaultnormal_vertex:gg,displacementmap_pars_vertex:vg,displacementmap_vertex:_g,emissivemap_fragment:xg,emissivemap_pars_fragment:yg,colorspace_fragment:bg,colorspace_pars_fragment:wg,envmap_fragment:Mg,envmap_common_pars_fragment:Sg,envmap_pars_fragment:Eg,envmap_pars_vertex:Tg,envmap_physical_pars_fragment:Fg,envmap_vertex:Ag,fog_vertex:Rg,fog_pars_vertex:Cg,fog_fragment:Ig,fog_pars_fragment:Lg,gradientmap_pars_fragment:Pg,lightmap_pars_fragment:Dg,lights_lambert_fragment:Ng,lights_lambert_pars_fragment:Ug,lights_pars_begin:Og,lights_toon_fragment:kg,lights_toon_pars_fragment:Bg,lights_phong_fragment:zg,lights_phong_pars_fragment:Hg,lights_physical_fragment:Vg,lights_physical_pars_fragment:Wg,lights_fragment_begin:Gg,lights_fragment_maps:jg,lights_fragment_end:Xg,logdepthbuf_fragment:qg,logdepthbuf_pars_fragment:Yg,logdepthbuf_pars_vertex:$g,logdepthbuf_vertex:Kg,map_fragment:Zg,map_pars_fragment:Jg,map_particle_fragment:Qg,map_particle_pars_fragment:ev,metalnessmap_fragment:tv,metalnessmap_pars_fragment:iv,morphinstance_vertex:rv,morphcolor_vertex:nv,morphnormal_vertex:av,morphtarget_pars_vertex:sv,morphtarget_vertex:ov,normal_fragment_begin:lv,normal_fragment_maps:cv,normal_pars_fragment:hv,normal_pars_vertex:uv,normal_vertex:dv,normalmap_pars_fragment:pv,clearcoat_normal_fragment_begin:fv,clearcoat_normal_fragment_maps:mv,clearcoat_pars_fragment:gv,iridescence_pars_fragment:vv,opaque_fragment:_v,packing:xv,premultiplied_alpha_fragment:yv,project_vertex:bv,dithering_fragment:wv,dithering_pars_fragment:Mv,roughnessmap_fragment:Sv,roughnessmap_pars_fragment:Ev,shadowmap_pars_fragment:Tv,shadowmap_pars_vertex:Av,shadowmap_vertex:Rv,shadowmask_pars_fragment:Cv,skinbase_vertex:Iv,skinning_pars_vertex:Lv,skinning_vertex:Pv,skinnormal_vertex:Dv,specularmap_fragment:Nv,specularmap_pars_fragment:Uv,tonemapping_fragment:Ov,tonemapping_pars_fragment:Fv,transmission_fragment:kv,transmission_pars_fragment:Bv,uv_pars_fragment:zv,uv_pars_vertex:Hv,uv_vertex:Vv,worldpos_vertex:Wv,background_vert:Gv,background_frag:jv,backgroundCube_vert:Xv,backgroundCube_frag:qv,cube_vert:Yv,cube_frag:$v,depth_vert:Kv,depth_frag:Zv,distanceRGBA_vert:Jv,distanceRGBA_frag:Qv,equirect_vert:e0,equirect_frag:t0,linedashed_vert:i0,linedashed_frag:r0,meshbasic_vert:n0,meshbasic_frag:a0,meshlambert_vert:s0,meshlambert_frag:o0,meshmatcap_vert:l0,meshmatcap_frag:c0,meshnormal_vert:h0,meshnormal_frag:u0,meshphong_vert:d0,meshphong_frag:p0,meshphysical_vert:f0,meshphysical_frag:m0,meshtoon_vert:g0,meshtoon_frag:v0,points_vert:_0,points_frag:x0,shadow_vert:y0,shadow_frag:b0,sprite_vert:w0,sprite_frag:M0},ue={common:{diffuse:{value:new _e(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Ve},alphaMap:{value:null},alphaMapTransform:{value:new Ve},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Ve}},envmap:{envMap:{value:null},envMapRotation:{value:new Ve},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Ve}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Ve}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Ve},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Ve},normalScale:{value:new De(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Ve},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Ve}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Ve}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Ve}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new _e(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new _e(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Ve},alphaTest:{value:0},uvTransform:{value:new Ve}},sprite:{diffuse:{value:new _e(16777215)},opacity:{value:1},center:{value:new De(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Ve},alphaMap:{value:null},alphaMapTransform:{value:new Ve},alphaTest:{value:0}}},Si={basic:{uniforms:Ot([ue.common,ue.specularmap,ue.envmap,ue.aomap,ue.lightmap,ue.fog]),vertexShader:He.meshbasic_vert,fragmentShader:He.meshbasic_frag},lambert:{uniforms:Ot([ue.common,ue.specularmap,ue.envmap,ue.aomap,ue.lightmap,ue.emissivemap,ue.bumpmap,ue.normalmap,ue.displacementmap,ue.fog,ue.lights,{emissive:{value:new _e(0)}}]),vertexShader:He.meshlambert_vert,fragmentShader:He.meshlambert_frag},phong:{uniforms:Ot([ue.common,ue.specularmap,ue.envmap,ue.aomap,ue.lightmap,ue.emissivemap,ue.bumpmap,ue.normalmap,ue.displacementmap,ue.fog,ue.lights,{emissive:{value:new _e(0)},specular:{value:new _e(1118481)},shininess:{value:30}}]),vertexShader:He.meshphong_vert,fragmentShader:He.meshphong_frag},standard:{uniforms:Ot([ue.common,ue.envmap,ue.aomap,ue.lightmap,ue.emissivemap,ue.bumpmap,ue.normalmap,ue.displacementmap,ue.roughnessmap,ue.metalnessmap,ue.fog,ue.lights,{emissive:{value:new _e(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:He.meshphysical_vert,fragmentShader:He.meshphysical_frag},toon:{uniforms:Ot([ue.common,ue.aomap,ue.lightmap,ue.emissivemap,ue.bumpmap,ue.normalmap,ue.displacementmap,ue.gradientmap,ue.fog,ue.lights,{emissive:{value:new _e(0)}}]),vertexShader:He.meshtoon_vert,fragmentShader:He.meshtoon_frag},matcap:{uniforms:Ot([ue.common,ue.bumpmap,ue.normalmap,ue.displacementmap,ue.fog,{matcap:{value:null}}]),vertexShader:He.meshmatcap_vert,fragmentShader:He.meshmatcap_frag},points:{uniforms:Ot([ue.points,ue.fog]),vertexShader:He.points_vert,fragmentShader:He.points_frag},dashed:{uniforms:Ot([ue.common,ue.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:He.linedashed_vert,fragmentShader:He.linedashed_frag},depth:{uniforms:Ot([ue.common,ue.displacementmap]),vertexShader:He.depth_vert,fragmentShader:He.depth_frag},normal:{uniforms:Ot([ue.common,ue.bumpmap,ue.normalmap,ue.displacementmap,{opacity:{value:1}}]),vertexShader:He.meshnormal_vert,fragmentShader:He.meshnormal_frag},sprite:{uniforms:Ot([ue.sprite,ue.fog]),vertexShader:He.sprite_vert,fragmentShader:He.sprite_frag},background:{uniforms:{uvTransform:{value:new Ve},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:He.background_vert,fragmentShader:He.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Ve}},vertexShader:He.backgroundCube_vert,fragmentShader:He.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:He.cube_vert,fragmentShader:He.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:He.equirect_vert,fragmentShader:He.equirect_frag},distanceRGBA:{uniforms:Ot([ue.common,ue.displacementmap,{referencePosition:{value:new P},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:He.distanceRGBA_vert,fragmentShader:He.distanceRGBA_frag},shadow:{uniforms:Ot([ue.lights,ue.fog,{color:{value:new _e(0)},opacity:{value:1}}]),vertexShader:He.shadow_vert,fragmentShader:He.shadow_frag}};Si.physical={uniforms:Ot([Si.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Ve},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Ve},clearcoatNormalScale:{value:new De(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Ve},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Ve},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Ve},sheen:{value:0},sheenColor:{value:new _e(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Ve},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Ve},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Ve},transmissionSamplerSize:{value:new De},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Ve},attenuationDistance:{value:0},attenuationColor:{value:new _e(0)},specularColor:{value:new _e(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Ve},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Ve},anisotropyVector:{value:new De},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Ve}}]),vertexShader:He.meshphysical_vert,fragmentShader:He.meshphysical_frag};Ha={r:0,b:0,g:0},_r=new Ct,S0=new we;an=4,ch=[.125,.215,.35,.446,.526,.582],Mr=20,ho=new kl,hh=new _e,uo=null,po=0,fo=0,mo=!1,br=(1+Math.sqrt(5))/2,$r=1/br,uh=[new P(-br,$r,0),new P(br,$r,0),new P(-$r,0,br),new P($r,0,br),new P(0,br,-$r),new P(0,br,$r),new P(-1,1,-1),new P(1,1,-1),new P(-1,1,1),new P(1,1,1)],L0=new P,vl=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,i=.1,r=100,n={}){let{size:a=256,position:s=L0}=n;uo=this._renderer.getRenderTarget(),po=this._renderer.getActiveCubeFace(),fo=this._renderer.getActiveMipmapLevel(),mo=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);let o=this._allocateTargets();return o.depthBuffer=!0,this._sceneToCubeUV(e,i,r,o,s),t>0&&this._blur(o,0,0,t),this._applyPMREM(o),this._cleanup(o),o}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=fh(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=ph(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(uo,po,fo),this._renderer.xr.enabled=mo,e.scissorTest=!1,Va(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===un||e.mapping===dn?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),uo=this._renderer.getRenderTarget(),po=this._renderer.getActiveCubeFace(),fo=this._renderer.getActiveMipmapLevel(),mo=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let i=t||this._allocateTargets();return this._textureToCubeUV(e,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,i={magFilter:Nt,minFilter:Nt,generateMipmaps:!1,type:ta,format:ii,colorSpace:zt,depthBuffer:!1},r=dh(e,t,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=dh(e,t,i);let{_lodMax:n}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=P0(n)),this._blurMaterial=D0(n,e,t)}return r}_compileMaterial(e){let t=new pt(this._lodPlanes[0],e);this._renderer.compile(t,ho)}_sceneToCubeUV(e,t,i,r,n){let a=new Dt(90,1,t,i),s=[1,-1,1,1,1,1],o=[1,1,1,-1,-1,-1],l=this._renderer,c=l.autoClear,h=l.toneMapping;l.getClearColor(hh),l.toneMapping=sr,l.autoClear=!1,l.state.buffers.depth.getReversed()&&(l.setRenderTarget(r),l.clearDepth(),l.setRenderTarget(null));let u=new Sr({name:"PMREM.Background",side:kt,depthWrite:!1,depthTest:!1}),d=new pt(new ps,u),p=!1,v=e.background;v?v.isColor&&(u.color.copy(v),e.background=null,p=!0):(u.color.copy(hh),p=!0);for(let f=0;f<6;f++){let g=f%3;g===0?(a.up.set(0,s[f],0),a.position.set(n.x,n.y,n.z),a.lookAt(n.x+o[f],n.y,n.z)):g===1?(a.up.set(0,0,s[f]),a.position.set(n.x,n.y,n.z),a.lookAt(n.x,n.y+o[f],n.z)):(a.up.set(0,s[f],0),a.position.set(n.x,n.y,n.z),a.lookAt(n.x,n.y,n.z+o[f]));let m=this._cubeSize;Va(r,g*m,f>2?m:0,m,m),l.setRenderTarget(r),p&&l.render(d,a),l.render(e,a)}d.geometry.dispose(),d.material.dispose(),l.toneMapping=h,l.autoClear=c,e.background=v}_textureToCubeUV(e,t){let i=this._renderer,r=e.mapping===un||e.mapping===dn;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=fh()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=ph());let n=r?this._cubemapMaterial:this._equirectMaterial,a=new pt(this._lodPlanes[0],n),s=n.uniforms;s.envMap.value=e;let o=this._cubeSize;Va(t,0,0,3*o,2*o),i.setRenderTarget(t),i.render(a,ho)}_applyPMREM(e){let t=this._renderer,i=t.autoClear;t.autoClear=!1;let r=this._lodPlanes.length;for(let n=1;n<r;n++){let a=Math.sqrt(this._sigmas[n]*this._sigmas[n]-this._sigmas[n-1]*this._sigmas[n-1]),s=uh[(r-n-1)%uh.length];this._blur(e,n-1,n,a,s)}t.autoClear=i}_blur(e,t,i,r,n){let a=this._pingPongRenderTarget;this._halfBlur(e,a,t,i,r,"latitudinal",n),this._halfBlur(a,e,i,i,r,"longitudinal",n)}_halfBlur(e,t,i,r,n,a,s){let o=this._renderer,l=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");let c=3,h=new pt(this._lodPlanes[r],l),u=l.uniforms,d=this._sizeLods[i]-1,p=isFinite(n)?Math.PI/(2*d):2*Math.PI/(2*Mr-1),v=n/p,f=isFinite(n)?1+Math.floor(c*v):Mr;f>Mr&&console.warn(`sigmaRadians, ${n}, is too large and will clip, as it requested ${f} samples when the maximum is set to ${Mr}`);let g=[],m=0;for(let E=0;E<Mr;++E){let A=E/v,C=Math.exp(-A*A/2);g.push(C),E===0?m+=C:E<f&&(m+=2*C)}for(let E=0;E<g.length;E++)g[E]=g[E]/m;u.envMap.value=e.texture,u.samples.value=f,u.weights.value=g,u.latitudinal.value=a==="latitudinal",s&&(u.poleAxis.value=s);let{_lodMax:y}=this;u.dTheta.value=p,u.mipInt.value=y-i;let x=this._sizeLods[r],_=3*x*(r>y-an?r-y+an:0),S=4*(this._cubeSize-x);Va(t,_,S,3*x,2*x),o.setRenderTarget(t),o.render(h,ho)}};Wu=new Ht,mh=new Eu(1,1),Gu=new hu,ju=new mf,Xu=new xu,gh=[],vh=[],_h=new Float32Array(16),xh=new Float32Array(9),yh=new Float32Array(4);A_=class{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.setValue=s_(t.type)}},R_=class{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=T_(t.type)}},C_=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,i){let r=this.seq;for(let n=0,a=r.length;n!==a;++n){let s=r[n];s.setValue(e,t[s.id],i)}}},go=/(\w+)(\])?(\[|\.)?/g;es=class{constructor(e,t){this.seq=[],this.map={};let i=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let r=0;r<i;++r){let n=e.getActiveUniform(t,r),a=e.getUniformLocation(t,n.name);I_(n,a,this)}}setValue(e,t,i,r){let n=this.map[t];n!==void 0&&n.setValue(e,i,r)}setOptional(e,t,i){let r=t[i];r!==void 0&&this.setValue(e,i,r)}static upload(e,t,i,r){for(let n=0,a=t.length;n!==a;++n){let s=t[n],o=i[s.id];o.needsUpdate!==!1&&s.setValue(e,o.value,r)}}static seqWithValue(e,t){let i=[];for(let r=0,n=e.length;r!==n;++r){let a=e[r];a.id in t&&i.push(a)}return i}};L_=37297,P_=0;Mh=new Ve;Wa=new P;H_=/^[ \t]*#include +<([\w\d./]+)>/gm;V_=new Map;G_=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;J_=0,Q_=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){let t=e.vertexShader,i=e.fragmentShader,r=this._getShaderStage(t),n=this._getShaderStage(i),a=this._getShaderCacheForMaterial(e);return a.has(r)===!1&&(a.add(r),r.usedTimes++),a.has(n)===!1&&(a.add(n),n.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let i of t)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,i=t.get(e);return i===void 0&&(i=new Set,t.set(e,i)),i}_getShaderStage(e){let t=this.shaderCache,i=t.get(e);return i===void 0&&(i=new ex(e),t.set(e,i)),i}},ex=class{constructor(e){this.id=J_++,this.code=e,this.usedTimes=0}};ox=0;ux=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,dx=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;fx={[Ro]:Co,[Io]:Do,[Lo]:No,[hn]:Po,[Co]:Ro,[Do]:Io,[No]:Lo,[Po]:hn};_x=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,xx=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,yx=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let i=new Tu(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=i}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,i=new or({vertexShader:_x,fragmentShader:xx,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new pt(new Pu(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},bx=class extends cr{constructor(e,t){super();let i=this,r=null,n=1,a=null,s="local-floor",o=1,l=null,c=null,h=null,u=null,d=null,p=null,v=typeof XRWebGLBinding<"u",f=new yx,g={},m=t.getContextAttributes(),y=null,x=null,_=[],S=[],E=new De,A=null,C=new Dt;C.viewport=new Ye;let b=new Dt;b.viewport=new Ye;let w=[C,b],R=new Am,G=null,V=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(N){let Y=_[N];return Y===void 0&&(Y=new to,_[N]=Y),Y.getTargetRaySpace()},this.getControllerGrip=function(N){let Y=_[N];return Y===void 0&&(Y=new to,_[N]=Y),Y.getGripSpace()},this.getHand=function(N){let Y=_[N];return Y===void 0&&(Y=new to,_[N]=Y),Y.getHandSpace()};function W(N){let Y=S.indexOf(N.inputSource);if(Y===-1)return;let J=_[Y];J!==void 0&&(J.update(N.inputSource,N.frame,l||a),J.dispatchEvent({type:N.type,data:N.inputSource}))}function O(){r.removeEventListener("select",W),r.removeEventListener("selectstart",W),r.removeEventListener("selectend",W),r.removeEventListener("squeeze",W),r.removeEventListener("squeezestart",W),r.removeEventListener("squeezeend",W),r.removeEventListener("end",O),r.removeEventListener("inputsourceschange",z);for(let N=0;N<_.length;N++){let Y=S[N];Y!==null&&(S[N]=null,_[N].disconnect(Y))}G=null,V=null,f.reset();for(let N in g)delete g[N];e.setRenderTarget(y),d=null,u=null,h=null,r=null,x=null,ae.stop(),i.isPresenting=!1,e.setPixelRatio(A),e.setSize(E.width,E.height,!1),i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(N){n=N,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(N){s=N,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return l||a},this.setReferenceSpace=function(N){l=N},this.getBaseLayer=function(){return u!==null?u:d},this.getBinding=function(){return h===null&&v&&(h=new XRWebGLBinding(r,t)),h},this.getFrame=function(){return p},this.getSession=function(){return r},this.setSession=async function(N){if(r=N,r!==null){if(y=e.getRenderTarget(),r.addEventListener("select",W),r.addEventListener("selectstart",W),r.addEventListener("selectend",W),r.addEventListener("squeeze",W),r.addEventListener("squeezestart",W),r.addEventListener("squeezeend",W),r.addEventListener("end",O),r.addEventListener("inputsourceschange",z),m.xrCompatible!==!0&&await t.makeXRCompatible(),A=e.getPixelRatio(),e.getSize(E),v&&"createProjectionLayer"in XRWebGLBinding.prototype){let Y=null,J=null,de=null;m.depth&&(de=m.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,Y=m.stencil?Gn:Wn,J=m.stencil?Vn:Cr);let te={colorFormat:t.RGBA8,depthFormat:de,scaleFactor:n};h=this.getBinding(),u=h.createProjectionLayer(te),r.updateRenderState({layers:[u]}),e.setPixelRatio(1),e.setSize(u.textureWidth,u.textureHeight,!1),x=new Ir(u.textureWidth,u.textureHeight,{format:ii,type:Ri,depthTexture:new Eu(u.textureWidth,u.textureHeight,J,void 0,void 0,void 0,void 0,void 0,void 0,Y),stencilBuffer:m.stencil,colorSpace:e.outputColorSpace,samples:m.antialias?4:0,resolveDepthBuffer:u.ignoreDepthValues===!1,resolveStencilBuffer:u.ignoreDepthValues===!1})}else{let Y={antialias:m.antialias,alpha:!0,depth:m.depth,stencil:m.stencil,framebufferScaleFactor:n};d=new XRWebGLLayer(r,t,Y),r.updateRenderState({baseLayer:d}),e.setPixelRatio(1),e.setSize(d.framebufferWidth,d.framebufferHeight,!1),x=new Ir(d.framebufferWidth,d.framebufferHeight,{format:ii,type:Ri,colorSpace:e.outputColorSpace,stencilBuffer:m.stencil,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1})}x.isXRRenderTarget=!0,this.setFoveation(o),l=null,a=await r.requestReferenceSpace(s),ae.setContext(r),ae.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return f.getDepthTexture()};function z(N){for(let Y=0;Y<N.removed.length;Y++){let J=N.removed[Y],de=S.indexOf(J);de>=0&&(S[de]=null,_[de].disconnect(J))}for(let Y=0;Y<N.added.length;Y++){let J=N.added[Y],de=S.indexOf(J);if(de===-1){for(let pe=0;pe<_.length;pe++)if(pe>=S.length){S.push(J),de=pe;break}else if(S[pe]===null){S[pe]=J,de=pe;break}if(de===-1)break}let te=_[de];te&&te.connect(J)}}let j=new P,H=new P;function $(N,Y,J){j.setFromMatrixPosition(Y.matrixWorld),H.setFromMatrixPosition(J.matrixWorld);let de=j.distanceTo(H),te=Y.projectionMatrix.elements,pe=J.projectionMatrix.elements,$e=te[14]/(te[10]-1),L=te[14]/(te[10]+1),We=(te[9]+1)/te[5],Be=(te[9]-1)/te[5],Qe=(te[8]-1)/te[0],Ee=(pe[8]+1)/pe[0],tt=$e*Qe,Re=$e*Ee,Le=de/(-Qe+Ee),ot=Le*-Qe;if(Y.matrixWorld.decompose(N.position,N.quaternion,N.scale),N.translateX(ot),N.translateZ(Le),N.matrixWorld.compose(N.position,N.quaternion,N.scale),N.matrixWorldInverse.copy(N.matrixWorld).invert(),te[10]===-1)N.projectionMatrix.copy(Y.projectionMatrix),N.projectionMatrixInverse.copy(Y.projectionMatrixInverse);else{let lt=$e+Le,it=L+Le,I=tt-ot,M=Re+(de-ot),B=We*L/it*lt,Z=Be*L/it*lt;N.projectionMatrix.makePerspective(I,M,B,Z,lt,it),N.projectionMatrixInverse.copy(N.projectionMatrix).invert()}}function U(N,Y){Y===null?N.matrixWorld.copy(N.matrix):N.matrixWorld.multiplyMatrices(Y.matrixWorld,N.matrix),N.matrixWorldInverse.copy(N.matrixWorld).invert()}this.updateCamera=function(N){if(r===null)return;let Y=N.near,J=N.far;f.texture!==null&&(f.depthNear>0&&(Y=f.depthNear),f.depthFar>0&&(J=f.depthFar)),R.near=b.near=C.near=Y,R.far=b.far=C.far=J,(G!==R.near||V!==R.far)&&(r.updateRenderState({depthNear:R.near,depthFar:R.far}),G=R.near,V=R.far),R.layers.mask=N.layers.mask|6,C.layers.mask=R.layers.mask&3,b.layers.mask=R.layers.mask&5;let de=N.parent,te=R.cameras;U(R,de);for(let pe=0;pe<te.length;pe++)U(te[pe],de);te.length===2?$(R,C,b):R.projectionMatrix.copy(C.projectionMatrix),se(N,R,de)};function se(N,Y,J){J===null?N.matrix.copy(Y.matrixWorld):(N.matrix.copy(J.matrixWorld),N.matrix.invert(),N.matrix.multiply(Y.matrixWorld)),N.matrix.decompose(N.position,N.quaternion,N.scale),N.updateMatrixWorld(!0),N.projectionMatrix.copy(Y.projectionMatrix),N.projectionMatrixInverse.copy(Y.projectionMatrixInverse),N.isPerspectiveCamera&&(N.fov=pn*2*Math.atan(1/N.projectionMatrix.elements[5]),N.zoom=1)}this.getCamera=function(){return R},this.getFoveation=function(){if(!(u===null&&d===null))return o},this.setFoveation=function(N){o=N,u!==null&&(u.fixedFoveation=N),d!==null&&d.fixedFoveation!==void 0&&(d.fixedFoveation=N)},this.hasDepthSensing=function(){return f.texture!==null},this.getDepthSensingMesh=function(){return f.getMesh(R)},this.getCameraTexture=function(N){return g[N]};let ie=null;function le(N,Y){if(c=Y.getViewerPose(l||a),p=Y,c!==null){let J=c.views;d!==null&&(e.setRenderTargetFramebuffer(x,d.framebuffer),e.setRenderTarget(x));let de=!1;J.length!==R.cameras.length&&(R.cameras.length=0,de=!0);for(let pe=0;pe<J.length;pe++){let $e=J[pe],L=null;if(d!==null)L=d.getViewport($e);else{let Be=h.getViewSubImage(u,$e);L=Be.viewport,pe===0&&(e.setRenderTargetTextures(x,Be.colorTexture,Be.depthStencilTexture),e.setRenderTarget(x))}let We=w[pe];We===void 0&&(We=new Dt,We.layers.enable(pe),We.viewport=new Ye,w[pe]=We),We.matrix.fromArray($e.transform.matrix),We.matrix.decompose(We.position,We.quaternion,We.scale),We.projectionMatrix.fromArray($e.projectionMatrix),We.projectionMatrixInverse.copy(We.projectionMatrix).invert(),We.viewport.set(L.x,L.y,L.width,L.height),pe===0&&(R.matrix.copy(We.matrix),R.matrix.decompose(R.position,R.quaternion,R.scale)),de===!0&&R.cameras.push(We)}let te=r.enabledFeatures;if(te&&te.includes("depth-sensing")&&r.depthUsage=="gpu-optimized"&&v){h=i.getBinding();let pe=h.getDepthInformation(J[0]);pe&&pe.isValid&&pe.texture&&f.init(pe,r.renderState)}if(te&&te.includes("camera-access")&&v){e.state.unbindTexture(),h=i.getBinding();for(let pe=0;pe<J.length;pe++){let $e=J[pe].camera;if($e){let L=g[$e];L||(L=new Tu,g[$e]=L);let We=h.getCameraImage($e);L.sourceTexture=We}}}}for(let J=0;J<_.length;J++){let de=S[J],te=_[J];de!==null&&te!==void 0&&te.update(de,Y,l||a)}ie&&ie(N,Y),Y.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:Y}),p=null}let ae=new Vu;ae.setAnimationLoop(le),this.setAnimationLoop=function(N){ie=N},this.dispose=function(){}}},xr=new Ct,wx=new we;Ex=class{constructor(e={}){let{canvas:t=lf(),context:i=null,depth:r=!0,stencil:n=!1,alpha:a=!1,antialias:s=!1,premultipliedAlpha:o=!0,preserveDrawingBuffer:l=!1,powerPreference:c="default",failIfMajorPerformanceCaveat:h=!1,reversedDepthBuffer:u=!1}=e;this.isWebGLRenderer=!0;let d;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");d=i.getContextAttributes().alpha}else d=a;let p=new Uint32Array(4),v=new Int32Array(4),f=null,g=null,m=[],y=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=sr,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let x=this,_=!1;this._outputColorSpace=je;let S=0,E=0,A=null,C=-1,b=null,w=new Ye,R=new Ye,G=null,V=new _e(0),W=0,O=t.width,z=t.height,j=1,H=null,$=null,U=new Ye(0,0,O,z),se=new Ye(0,0,O,z),ie=!1,le=new Ul,ae=!1,N=!1,Y=new we,J=new P,de=new Ye,te={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},pe=!1;function $e(){return A===null?j:1}let L=i;function We(T,k){return t.getContext(T,k)}try{let T={alpha:!0,depth:r,stencil:n,antialias:s,premultipliedAlpha:o,preserveDrawingBuffer:l,powerPreference:c,failIfMajorPerformanceCaveat:h};if("setAttribute"in t&&t.setAttribute("data-engine","three.js r180"),t.addEventListener("webglcontextlost",me,!1),t.addEventListener("webglcontextrestored",he,!1),t.addEventListener("webglcontextcreationerror",Se,!1),L===null){let k="webgl2";if(L=We(k,T),L===null)throw We(k)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(T){throw console.error("THREE.WebGLRenderer: "+T.message),T}let Be,Qe,Ee,tt,Re,Le,ot,lt,it,I,M,B,Z,ee,K,be,ce,Te,Ce,oe,fe,Ne,Ie,ge;function Xe(){Be=new U0(L),Be.init(),Ne=new vx(L,Be),Qe=new R0(L,Be,e,Ne),Ee=new mx(L,Be),Qe.reversedDepthBuffer&&u&&Ee.buffers.depth.setReversed(!0),tt=new k0(L),Re=new ix,Le=new gx(L,Be,Ee,Re,Qe,Ne,tt),ot=new I0(x),lt=new N0(x),it=new Gm(L),Ie=new T0(L,it),I=new O0(L,it,tt,Ie),M=new z0(L,I,it,tt),Ce=new B0(L,Qe,Le),be=new C0(Re),B=new tx(x,ot,lt,Be,Qe,Ie,be),Z=new Mx(x,Re),ee=new nx,K=new hx(Be),Te=new E0(x,ot,lt,Ee,M,d,o),ce=new px(x,M,Qe),ge=new Sx(L,tt,Qe,Ee),oe=new A0(L,Be,tt),fe=new F0(L,Be,tt),tt.programs=B.programs,x.capabilities=Qe,x.extensions=Be,x.properties=Re,x.renderLists=ee,x.shadowMap=ce,x.state=Ee,x.info=tt}Xe();let D=new bx(x,L);this.xr=D,this.getContext=function(){return L},this.getContextAttributes=function(){return L.getContextAttributes()},this.forceContextLoss=function(){let T=Be.get("WEBGL_lose_context");T&&T.loseContext()},this.forceContextRestore=function(){let T=Be.get("WEBGL_lose_context");T&&T.restoreContext()},this.getPixelRatio=function(){return j},this.setPixelRatio=function(T){T!==void 0&&(j=T,this.setSize(O,z,!1))},this.getSize=function(T){return T.set(O,z)},this.setSize=function(T,k,X=!0){if(D.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}O=T,z=k,t.width=Math.floor(T*j),t.height=Math.floor(k*j),X===!0&&(t.style.width=T+"px",t.style.height=k+"px"),this.setViewport(0,0,T,k)},this.getDrawingBufferSize=function(T){return T.set(O*j,z*j).floor()},this.setDrawingBufferSize=function(T,k,X){O=T,z=k,j=X,t.width=Math.floor(T*X),t.height=Math.floor(k*X),this.setViewport(0,0,T,k)},this.getCurrentViewport=function(T){return T.copy(w)},this.getViewport=function(T){return T.copy(U)},this.setViewport=function(T,k,X,q){T.isVector4?U.set(T.x,T.y,T.z,T.w):U.set(T,k,X,q),Ee.viewport(w.copy(U).multiplyScalar(j).round())},this.getScissor=function(T){return T.copy(se)},this.setScissor=function(T,k,X,q){T.isVector4?se.set(T.x,T.y,T.z,T.w):se.set(T,k,X,q),Ee.scissor(R.copy(se).multiplyScalar(j).round())},this.getScissorTest=function(){return ie},this.setScissorTest=function(T){Ee.setScissorTest(ie=T)},this.setOpaqueSort=function(T){H=T},this.setTransparentSort=function(T){$=T},this.getClearColor=function(T){return T.copy(Te.getClearColor())},this.setClearColor=function(){Te.setClearColor(...arguments)},this.getClearAlpha=function(){return Te.getClearAlpha()},this.setClearAlpha=function(){Te.setClearAlpha(...arguments)},this.clear=function(T=!0,k=!0,X=!0){let q=0;if(T){let F=!1;if(A!==null){let re=A.texture.format;F=re===Rl||re===Al||re===Tl}if(F){let re=A.texture.type,ve=re===Ri||re===Cr||re===Hn||re===Vn||re===Ml||re===Sl,xe=Te.getClearColor(),ye=Te.getClearAlpha(),Ue=xe.r,Fe=xe.g,Oe=xe.b;ve?(p[0]=Ue,p[1]=Fe,p[2]=Oe,p[3]=ye,L.clearBufferuiv(L.COLOR,0,p)):(v[0]=Ue,v[1]=Fe,v[2]=Oe,v[3]=ye,L.clearBufferiv(L.COLOR,0,v))}else q|=L.COLOR_BUFFER_BIT}k&&(q|=L.DEPTH_BUFFER_BIT),X&&(q|=L.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),L.clear(q)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",me,!1),t.removeEventListener("webglcontextrestored",he,!1),t.removeEventListener("webglcontextcreationerror",Se,!1),Te.dispose(),ee.dispose(),K.dispose(),Re.dispose(),ot.dispose(),lt.dispose(),M.dispose(),Ie.dispose(),ge.dispose(),B.dispose(),D.dispose(),D.removeEventListener("sessionstart",xi),D.removeEventListener("sessionend",yi),ur.stop()};function me(T){T.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),_=!0}function he(){console.log("THREE.WebGLRenderer: Context Restored."),_=!1;let T=tt.autoReset,k=ce.enabled,X=ce.autoUpdate,q=ce.needsUpdate,F=ce.type;Xe(),tt.autoReset=T,ce.enabled=k,ce.autoUpdate=X,ce.needsUpdate=q,ce.type=F}function Se(T){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",T.statusMessage)}function ne(T){let k=T.target;k.removeEventListener("dispose",ne),Q(k)}function Q(T){Me(T),Re.remove(T)}function Me(T){let k=Re.get(T).programs;k!==void 0&&(k.forEach(function(X){B.releaseProgram(X)}),T.isShaderMaterial&&B.releaseShaderCache(T))}this.renderBufferDirect=function(T,k,X,q,F,re){k===null&&(k=te);let ve=F.isMesh&&F.matrixWorld.determinant()<0,xe=Ld(T,k,X,q,F);Ee.setMaterial(q,ve);let ye=X.index,Ue=1;if(q.wireframe===!0){if(ye=I.getWireframeAttribute(X),ye===void 0)return;Ue=2}let Fe=X.drawRange,Oe=X.attributes.position,Ke=Fe.start*Ue,ct=(Fe.start+Fe.count)*Ue;re!==null&&(Ke=Math.max(Ke,re.start*Ue),ct=Math.min(ct,(re.start+re.count)*Ue)),ye!==null?(Ke=Math.max(Ke,0),ct=Math.min(ct,ye.count)):Oe!=null&&(Ke=Math.max(Ke,0),ct=Math.min(ct,Oe.count));let ut=ct-Ke;if(ut<0||ut===1/0)return;Ie.setup(F,q,xe,X,ye);let ft,ht=oe;if(ye!==null&&(ft=it.get(ye),ht=fe,ht.setIndex(ft)),F.isMesh)q.wireframe===!0?(Ee.setLineWidth(q.wireframeLinewidth*$e()),ht.setMode(L.LINES)):ht.setMode(L.TRIANGLES);else if(F.isLine){let Ae=q.linewidth;Ae===void 0&&(Ae=1),Ee.setLineWidth(Ae*$e()),F.isLineSegments?ht.setMode(L.LINES):F.isLineLoop?ht.setMode(L.LINE_LOOP):ht.setMode(L.LINE_STRIP)}else F.isPoints?ht.setMode(L.POINTS):F.isSprite&&ht.setMode(L.TRIANGLES);if(F.isBatchedMesh)if(F._multiDrawInstances!==null)Yn("THREE.WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."),ht.renderMultiDrawInstances(F._multiDrawStarts,F._multiDrawCounts,F._multiDrawCount,F._multiDrawInstances);else if(Be.get("WEBGL_multi_draw"))ht.renderMultiDraw(F._multiDrawStarts,F._multiDrawCounts,F._multiDrawCount);else{let Ae=F._multiDrawStarts,Tt=F._multiDrawCounts,Pi=F._multiDrawCount,ni=ye?it.get(ye).bytesPerElement:1,Dr=Re.get(q).currentProgram.getUniforms();for(let Xt=0;Xt<Pi;Xt++)Dr.setValue(L,"_gl_DrawID",Xt),ht.render(Ae[Xt]/ni,Tt[Xt])}else if(F.isInstancedMesh)ht.renderInstances(Ke,ut,F.count);else if(X.isInstancedBufferGeometry){let Ae=X._maxInstanceCount!==void 0?X._maxInstanceCount:1/0,Tt=Math.min(X.instanceCount,Ae);ht.renderInstances(Ke,ut,Tt)}else ht.render(Ke,ut)};function Pe(T,k,X){T.transparent===!0&&T.side===Ei&&T.forceSinglePass===!1?(T.side=kt,T.needsUpdate=!0,oa(T,k,X),T.side=Ai,T.needsUpdate=!0,oa(T,k,X),T.side=Ei):oa(T,k,X)}this.compile=function(T,k,X=null){X===null&&(X=T),g=K.get(X),g.init(k),y.push(g),X.traverseVisible(function(F){F.isLight&&F.layers.test(k.layers)&&(g.pushLight(F),F.castShadow&&g.pushShadow(F))}),T!==X&&T.traverseVisible(function(F){F.isLight&&F.layers.test(k.layers)&&(g.pushLight(F),F.castShadow&&g.pushShadow(F))}),g.setupLights();let q=new Set;return T.traverse(function(F){if(!(F.isMesh||F.isPoints||F.isLine||F.isSprite))return;let re=F.material;if(re)if(Array.isArray(re))for(let ve=0;ve<re.length;ve++){let xe=re[ve];Pe(xe,X,F),q.add(xe)}else Pe(re,X,F),q.add(re)}),g=y.pop(),q},this.compileAsync=function(T,k,X=null){let q=this.compile(T,k,X);return new Promise(F=>{function re(){if(q.forEach(function(ve){Re.get(ve).currentProgram.isReady()&&q.delete(ve)}),q.size===0){F(T);return}setTimeout(re,10)}Be.get("KHR_parallel_shader_compile")!==null?re():setTimeout(re,10)})};let xt=null;function rt(T){xt&&xt(T)}function xi(){ur.stop()}function yi(){ur.start()}let ur=new Vu;ur.setAnimationLoop(rt),typeof self<"u"&&ur.setContext(self),this.setAnimationLoop=function(T){xt=T,D.setAnimationLoop(T),T===null?ur.stop():ur.start()},D.addEventListener("sessionstart",xi),D.addEventListener("sessionend",yi),this.render=function(T,k){if(k!==void 0&&k.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(_===!0)return;if(T.matrixWorldAutoUpdate===!0&&T.updateMatrixWorld(),k.parent===null&&k.matrixWorldAutoUpdate===!0&&k.updateMatrixWorld(),D.enabled===!0&&D.isPresenting===!0&&(D.cameraAutoUpdate===!0&&D.updateCamera(k),k=D.getCamera()),T.isScene===!0&&T.onBeforeRender(x,T,k,A),g=K.get(T,y.length),g.init(k),y.push(g),Y.multiplyMatrices(k.projectionMatrix,k.matrixWorldInverse),le.setFromProjectionMatrix(Y,Ti,k.reversedDepth),N=this.localClippingEnabled,ae=be.init(this.clippingPlanes,N),f=ee.get(T,m.length),f.init(),m.push(f),D.enabled===!0&&D.isPresenting===!0){let re=x.xr.getDepthSensingMesh();re!==null&&ws(re,k,-1/0,x.sortObjects)}ws(T,k,0,x.sortObjects),f.finish(),x.sortObjects===!0&&f.sort(H,$),pe=D.enabled===!1||D.isPresenting===!1||D.hasDepthSensing()===!1,pe&&Te.addToRenderList(f,T),this.info.render.frame++,ae===!0&&be.beginShadows();let X=g.state.shadowsArray;ce.render(X,T,k),ae===!0&&be.endShadows(),this.info.autoReset===!0&&this.info.reset();let q=f.opaque,F=f.transmissive;if(g.setupLights(),k.isArrayCamera){let re=k.cameras;if(F.length>0)for(let ve=0,xe=re.length;ve<xe;ve++){let ye=re[ve];Jl(q,F,T,ye)}pe&&Te.render(T);for(let ve=0,xe=re.length;ve<xe;ve++){let ye=re[ve];Zl(f,T,ye,ye.viewport)}}else F.length>0&&Jl(q,F,T,k),pe&&Te.render(T),Zl(f,T,k);A!==null&&E===0&&(Le.updateMultisampleRenderTarget(A),Le.updateRenderTargetMipmap(A)),T.isScene===!0&&T.onAfterRender(x,T,k),Ie.resetDefaultState(),C=-1,b=null,y.pop(),y.length>0?(g=y[y.length-1],ae===!0&&be.setGlobalState(x.clippingPlanes,g.state.camera)):g=null,m.pop(),m.length>0?f=m[m.length-1]:f=null};function ws(T,k,X,q){if(T.visible===!1)return;if(T.layers.test(k.layers)){if(T.isGroup)X=T.renderOrder;else if(T.isLOD)T.autoUpdate===!0&&T.update(k);else if(T.isLight)g.pushLight(T),T.castShadow&&g.pushShadow(T);else if(T.isSprite){if(!T.frustumCulled||le.intersectsSprite(T)){q&&de.setFromMatrixPosition(T.matrixWorld).applyMatrix4(Y);let re=M.update(T),ve=T.material;ve.visible&&f.push(T,re,ve,X,de.z,null)}}else if((T.isMesh||T.isLine||T.isPoints)&&(!T.frustumCulled||le.intersectsObject(T))){let re=M.update(T),ve=T.material;if(q&&(T.boundingSphere!==void 0?(T.boundingSphere===null&&T.computeBoundingSphere(),de.copy(T.boundingSphere.center)):(re.boundingSphere===null&&re.computeBoundingSphere(),de.copy(re.boundingSphere.center)),de.applyMatrix4(T.matrixWorld).applyMatrix4(Y)),Array.isArray(ve)){let xe=re.groups;for(let ye=0,Ue=xe.length;ye<Ue;ye++){let Fe=xe[ye],Oe=ve[Fe.materialIndex];Oe&&Oe.visible&&f.push(T,re,Oe,X,de.z,Fe)}}else ve.visible&&f.push(T,re,ve,X,de.z,null)}}let F=T.children;for(let re=0,ve=F.length;re<ve;re++)ws(F[re],k,X,q)}function Zl(T,k,X,q){let F=T.opaque,re=T.transmissive,ve=T.transparent;g.setupLightsView(X),ae===!0&&be.setGlobalState(x.clippingPlanes,X),q&&Ee.viewport(w.copy(q)),F.length>0&&sa(F,k,X),re.length>0&&sa(re,k,X),ve.length>0&&sa(ve,k,X),Ee.buffers.depth.setTest(!0),Ee.buffers.depth.setMask(!0),Ee.buffers.color.setMask(!0),Ee.setPolygonOffset(!1)}function Jl(T,k,X,q){if((X.isScene===!0?X.overrideMaterial:null)!==null)return;g.state.transmissionRenderTarget[q.id]===void 0&&(g.state.transmissionRenderTarget[q.id]=new Ir(1,1,{generateMipmaps:!0,type:Be.has("EXT_color_buffer_half_float")||Be.has("EXT_color_buffer_float")?ta:Ri,minFilter:pi,samples:4,stencilBuffer:n,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:ke.workingColorSpace}));let F=g.state.transmissionRenderTarget[q.id],re=q.viewport||w;F.setSize(re.z*x.transmissionResolutionScale,re.w*x.transmissionResolutionScale);let ve=x.getRenderTarget(),xe=x.getActiveCubeFace(),ye=x.getActiveMipmapLevel();x.setRenderTarget(F),x.getClearColor(V),W=x.getClearAlpha(),W<1&&x.setClearColor(16777215,.5),x.clear(),pe&&Te.render(X);let Ue=x.toneMapping;x.toneMapping=sr;let Fe=q.viewport;if(q.viewport!==void 0&&(q.viewport=void 0),g.setupLightsView(q),ae===!0&&be.setGlobalState(x.clippingPlanes,q),sa(T,X,q),Le.updateMultisampleRenderTarget(F),Le.updateRenderTargetMipmap(F),Be.has("WEBGL_multisampled_render_to_texture")===!1){let Oe=!1;for(let Ke=0,ct=k.length;Ke<ct;Ke++){let ut=k[Ke],ft=ut.object,ht=ut.geometry,Ae=ut.material,Tt=ut.group;if(Ae.side===Ei&&ft.layers.test(q.layers)){let Pi=Ae.side;Ae.side=kt,Ae.needsUpdate=!0,Ql(ft,X,q,ht,Ae,Tt),Ae.side=Pi,Ae.needsUpdate=!0,Oe=!0}}Oe===!0&&(Le.updateMultisampleRenderTarget(F),Le.updateRenderTargetMipmap(F))}x.setRenderTarget(ve,xe,ye),x.setClearColor(V,W),Fe!==void 0&&(q.viewport=Fe),x.toneMapping=Ue}function sa(T,k,X){let q=k.isScene===!0?k.overrideMaterial:null;for(let F=0,re=T.length;F<re;F++){let ve=T[F],xe=ve.object,ye=ve.geometry,Ue=ve.group,Fe=ve.material;Fe.allowOverride===!0&&q!==null&&(Fe=q),xe.layers.test(X.layers)&&Ql(xe,k,X,ye,Fe,Ue)}}function Ql(T,k,X,q,F,re){T.onBeforeRender(x,k,X,q,F,re),T.modelViewMatrix.multiplyMatrices(X.matrixWorldInverse,T.matrixWorld),T.normalMatrix.getNormalMatrix(T.modelViewMatrix),F.onBeforeRender(x,k,X,q,T,re),F.transparent===!0&&F.side===Ei&&F.forceSinglePass===!1?(F.side=kt,F.needsUpdate=!0,x.renderBufferDirect(X,k,q,F,T,re),F.side=Ai,F.needsUpdate=!0,x.renderBufferDirect(X,k,q,F,T,re),F.side=Ei):x.renderBufferDirect(X,k,q,F,T,re),T.onAfterRender(x,k,X,q,F,re)}function oa(T,k,X){k.isScene!==!0&&(k=te);let q=Re.get(T),F=g.state.lights,re=g.state.shadowsArray,ve=F.state.version,xe=B.getParameters(T,F.state,re,k,X),ye=B.getProgramCacheKey(xe),Ue=q.programs;q.environment=T.isMeshStandardMaterial?k.environment:null,q.fog=k.fog,q.envMap=(T.isMeshStandardMaterial?lt:ot).get(T.envMap||q.environment),q.envMapRotation=q.environment!==null&&T.envMap===null?k.environmentRotation:T.envMapRotation,Ue===void 0&&(T.addEventListener("dispose",ne),Ue=new Map,q.programs=Ue);let Fe=Ue.get(ye);if(Fe!==void 0){if(q.currentProgram===Fe&&q.lightsStateVersion===ve)return tc(T,xe),Fe}else xe.uniforms=B.getUniforms(T),T.onBeforeCompile(xe,x),Fe=B.acquireProgram(xe,ye),Ue.set(ye,Fe),q.uniforms=xe.uniforms;let Oe=q.uniforms;return(!T.isShaderMaterial&&!T.isRawShaderMaterial||T.clipping===!0)&&(Oe.clippingPlanes=be.uniform),tc(T,xe),q.needsLights=Dd(T),q.lightsStateVersion=ve,q.needsLights&&(Oe.ambientLightColor.value=F.state.ambient,Oe.lightProbe.value=F.state.probe,Oe.directionalLights.value=F.state.directional,Oe.directionalLightShadows.value=F.state.directionalShadow,Oe.spotLights.value=F.state.spot,Oe.spotLightShadows.value=F.state.spotShadow,Oe.rectAreaLights.value=F.state.rectArea,Oe.ltc_1.value=F.state.rectAreaLTC1,Oe.ltc_2.value=F.state.rectAreaLTC2,Oe.pointLights.value=F.state.point,Oe.pointLightShadows.value=F.state.pointShadow,Oe.hemisphereLights.value=F.state.hemi,Oe.directionalShadowMap.value=F.state.directionalShadowMap,Oe.directionalShadowMatrix.value=F.state.directionalShadowMatrix,Oe.spotShadowMap.value=F.state.spotShadowMap,Oe.spotLightMatrix.value=F.state.spotLightMatrix,Oe.spotLightMap.value=F.state.spotLightMap,Oe.pointShadowMap.value=F.state.pointShadowMap,Oe.pointShadowMatrix.value=F.state.pointShadowMatrix),q.currentProgram=Fe,q.uniformsList=null,Fe}function ec(T){if(T.uniformsList===null){let k=T.currentProgram.getUniforms();T.uniformsList=es.seqWithValue(k.seq,T.uniforms)}return T.uniformsList}function tc(T,k){let X=Re.get(T);X.outputColorSpace=k.outputColorSpace,X.batching=k.batching,X.batchingColor=k.batchingColor,X.instancing=k.instancing,X.instancingColor=k.instancingColor,X.instancingMorph=k.instancingMorph,X.skinning=k.skinning,X.morphTargets=k.morphTargets,X.morphNormals=k.morphNormals,X.morphColors=k.morphColors,X.morphTargetsCount=k.morphTargetsCount,X.numClippingPlanes=k.numClippingPlanes,X.numIntersection=k.numClipIntersection,X.vertexAlphas=k.vertexAlphas,X.vertexTangents=k.vertexTangents,X.toneMapping=k.toneMapping}function Ld(T,k,X,q,F){k.isScene!==!0&&(k=te),Le.resetTextureUnits();let re=k.fog,ve=q.isMeshStandardMaterial?k.environment:null,xe=A===null?x.outputColorSpace:A.isXRRenderTarget===!0?A.texture.colorSpace:zt,ye=(q.isMeshStandardMaterial?lt:ot).get(q.envMap||ve),Ue=q.vertexColors===!0&&!!X.attributes.color&&X.attributes.color.itemSize===4,Fe=!!X.attributes.tangent&&(!!q.normalMap||q.anisotropy>0),Oe=!!X.morphAttributes.position,Ke=!!X.morphAttributes.normal,ct=!!X.morphAttributes.color,ut=sr;q.toneMapped&&(A===null||A.isXRRenderTarget===!0)&&(ut=x.toneMapping);let ft=X.morphAttributes.position||X.morphAttributes.normal||X.morphAttributes.color,ht=ft!==void 0?ft.length:0,Ae=Re.get(q),Tt=g.state.lights;if(ae===!0&&(N===!0||T!==b)){let At=T===b&&q.id===C;be.setState(q,T,At)}let Pi=!1;q.version===Ae.__version?(Ae.needsLights&&Ae.lightsStateVersion!==Tt.state.version||Ae.outputColorSpace!==xe||F.isBatchedMesh&&Ae.batching===!1||!F.isBatchedMesh&&Ae.batching===!0||F.isBatchedMesh&&Ae.batchingColor===!0&&F.colorTexture===null||F.isBatchedMesh&&Ae.batchingColor===!1&&F.colorTexture!==null||F.isInstancedMesh&&Ae.instancing===!1||!F.isInstancedMesh&&Ae.instancing===!0||F.isSkinnedMesh&&Ae.skinning===!1||!F.isSkinnedMesh&&Ae.skinning===!0||F.isInstancedMesh&&Ae.instancingColor===!0&&F.instanceColor===null||F.isInstancedMesh&&Ae.instancingColor===!1&&F.instanceColor!==null||F.isInstancedMesh&&Ae.instancingMorph===!0&&F.morphTexture===null||F.isInstancedMesh&&Ae.instancingMorph===!1&&F.morphTexture!==null||Ae.envMap!==ye||q.fog===!0&&Ae.fog!==re||Ae.numClippingPlanes!==void 0&&(Ae.numClippingPlanes!==be.numPlanes||Ae.numIntersection!==be.numIntersection)||Ae.vertexAlphas!==Ue||Ae.vertexTangents!==Fe||Ae.morphTargets!==Oe||Ae.morphNormals!==Ke||Ae.morphColors!==ct||Ae.toneMapping!==ut||Ae.morphTargetsCount!==ht)&&(Pi=!0):(Pi=!0,Ae.__version=q.version);let ni=Ae.currentProgram;Pi===!0&&(ni=oa(q,k,F));let Dr=!1,Xt=!1,bn=!1,mt=ni.getUniforms(),$t=Ae.uniforms;if(Ee.useProgram(ni.program)&&(Dr=!0,Xt=!0,bn=!0),q.id!==C&&(C=q.id,Xt=!0),Dr||b!==T){Ee.buffers.depth.getReversed()&&T.reversedDepth!==!0&&(T._reversedDepth=!0,T.updateProjectionMatrix()),mt.setValue(L,"projectionMatrix",T.projectionMatrix),mt.setValue(L,"viewMatrix",T.matrixWorldInverse);let At=mt.map.cameraPosition;At!==void 0&&At.setValue(L,J.setFromMatrixPosition(T.matrixWorld)),Qe.logarithmicDepthBuffer&&mt.setValue(L,"logDepthBufFC",2/(Math.log(T.far+1)/Math.LN2)),(q.isMeshPhongMaterial||q.isMeshToonMaterial||q.isMeshLambertMaterial||q.isMeshBasicMaterial||q.isMeshStandardMaterial||q.isShaderMaterial)&&mt.setValue(L,"isOrthographic",T.isOrthographicCamera===!0),b!==T&&(b=T,Xt=!0,bn=!0)}if(F.isSkinnedMesh){mt.setOptional(L,F,"bindMatrix"),mt.setOptional(L,F,"bindMatrixInverse");let At=F.skeleton;At&&(At.boneTexture===null&&At.computeBoneTexture(),mt.setValue(L,"boneTexture",At.boneTexture,Le))}F.isBatchedMesh&&(mt.setOptional(L,F,"batchingTexture"),mt.setValue(L,"batchingTexture",F._matricesTexture,Le),mt.setOptional(L,F,"batchingIdTexture"),mt.setValue(L,"batchingIdTexture",F._indirectTexture,Le),mt.setOptional(L,F,"batchingColorTexture"),F._colorsTexture!==null&&mt.setValue(L,"batchingColorTexture",F._colorsTexture,Le));let Kt=X.morphAttributes;if((Kt.position!==void 0||Kt.normal!==void 0||Kt.color!==void 0)&&Ce.update(F,X,ni),(Xt||Ae.receiveShadow!==F.receiveShadow)&&(Ae.receiveShadow=F.receiveShadow,mt.setValue(L,"receiveShadow",F.receiveShadow)),q.isMeshGouraudMaterial&&q.envMap!==null&&($t.envMap.value=ye,$t.flipEnvMap.value=ye.isCubeTexture&&ye.isRenderTargetTexture===!1?-1:1),q.isMeshStandardMaterial&&q.envMap===null&&k.environment!==null&&($t.envMapIntensity.value=k.environmentIntensity),Xt&&(mt.setValue(L,"toneMappingExposure",x.toneMappingExposure),Ae.needsLights&&Pd($t,bn),re&&q.fog===!0&&Z.refreshFogUniforms($t,re),Z.refreshMaterialUniforms($t,q,j,z,g.state.transmissionRenderTarget[T.id]),es.upload(L,ec(Ae),$t,Le)),q.isShaderMaterial&&q.uniformsNeedUpdate===!0&&(es.upload(L,ec(Ae),$t,Le),q.uniformsNeedUpdate=!1),q.isSpriteMaterial&&mt.setValue(L,"center",F.center),mt.setValue(L,"modelViewMatrix",F.modelViewMatrix),mt.setValue(L,"normalMatrix",F.normalMatrix),mt.setValue(L,"modelMatrix",F.matrixWorld),q.isShaderMaterial||q.isRawShaderMaterial){let At=q.uniformsGroups;for(let ai=0,Ms=At.length;ai<Ms;ai++){let dr=At[ai];ge.update(dr,ni),ge.bind(dr,ni)}}return ni}function Pd(T,k){T.ambientLightColor.needsUpdate=k,T.lightProbe.needsUpdate=k,T.directionalLights.needsUpdate=k,T.directionalLightShadows.needsUpdate=k,T.pointLights.needsUpdate=k,T.pointLightShadows.needsUpdate=k,T.spotLights.needsUpdate=k,T.spotLightShadows.needsUpdate=k,T.rectAreaLights.needsUpdate=k,T.hemisphereLights.needsUpdate=k}function Dd(T){return T.isMeshLambertMaterial||T.isMeshToonMaterial||T.isMeshPhongMaterial||T.isMeshStandardMaterial||T.isShadowMaterial||T.isShaderMaterial&&T.lights===!0}this.getActiveCubeFace=function(){return S},this.getActiveMipmapLevel=function(){return E},this.getRenderTarget=function(){return A},this.setRenderTargetTextures=function(T,k,X){let q=Re.get(T);q.__autoAllocateDepthBuffer=T.resolveDepthBuffer===!1,q.__autoAllocateDepthBuffer===!1&&(q.__useRenderToTexture=!1),Re.get(T.texture).__webglTexture=k,Re.get(T.depthTexture).__webglTexture=q.__autoAllocateDepthBuffer?void 0:X,q.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(T,k){let X=Re.get(T);X.__webglFramebuffer=k,X.__useDefaultFramebuffer=k===void 0};let Nd=L.createFramebuffer();this.setRenderTarget=function(T,k=0,X=0){A=T,S=k,E=X;let q=!0,F=null,re=!1,ve=!1;if(T){let xe=Re.get(T);if(xe.__useDefaultFramebuffer!==void 0)Ee.bindFramebuffer(L.FRAMEBUFFER,null),q=!1;else if(xe.__webglFramebuffer===void 0)Le.setupRenderTarget(T);else if(xe.__hasExternalTextures)Le.rebindTextures(T,Re.get(T.texture).__webglTexture,Re.get(T.depthTexture).__webglTexture);else if(T.depthBuffer){let Fe=T.depthTexture;if(xe.__boundDepthTexture!==Fe){if(Fe!==null&&Re.has(Fe)&&(T.width!==Fe.image.width||T.height!==Fe.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");Le.setupDepthRenderbuffer(T)}}let ye=T.texture;(ye.isData3DTexture||ye.isDataArrayTexture||ye.isCompressedArrayTexture)&&(ve=!0);let Ue=Re.get(T).__webglFramebuffer;T.isWebGLCubeRenderTarget?(Array.isArray(Ue[k])?F=Ue[k][X]:F=Ue[k],re=!0):T.samples>0&&Le.useMultisampledRTT(T)===!1?F=Re.get(T).__webglMultisampledFramebuffer:Array.isArray(Ue)?F=Ue[X]:F=Ue,w.copy(T.viewport),R.copy(T.scissor),G=T.scissorTest}else w.copy(U).multiplyScalar(j).floor(),R.copy(se).multiplyScalar(j).floor(),G=ie;if(X!==0&&(F=Nd),Ee.bindFramebuffer(L.FRAMEBUFFER,F)&&q&&Ee.drawBuffers(T,F),Ee.viewport(w),Ee.scissor(R),Ee.setScissorTest(G),re){let xe=Re.get(T.texture);L.framebufferTexture2D(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_CUBE_MAP_POSITIVE_X+k,xe.__webglTexture,X)}else if(ve){let xe=k;for(let ye=0;ye<T.textures.length;ye++){let Ue=Re.get(T.textures[ye]);L.framebufferTextureLayer(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0+ye,Ue.__webglTexture,X,xe)}}else if(T!==null&&X!==0){let xe=Re.get(T.texture);L.framebufferTexture2D(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,xe.__webglTexture,X)}C=-1},this.readRenderTargetPixels=function(T,k,X,q,F,re,ve,xe=0){if(!(T&&T.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let ye=Re.get(T).__webglFramebuffer;if(T.isWebGLCubeRenderTarget&&ve!==void 0&&(ye=ye[ve]),ye){Ee.bindFramebuffer(L.FRAMEBUFFER,ye);try{let Ue=T.textures[xe],Fe=Ue.format,Oe=Ue.type;if(!Qe.textureFormatReadable(Fe)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!Qe.textureTypeReadable(Oe)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}k>=0&&k<=T.width-q&&X>=0&&X<=T.height-F&&(T.textures.length>1&&L.readBuffer(L.COLOR_ATTACHMENT0+xe),L.readPixels(k,X,q,F,Ne.convert(Fe),Ne.convert(Oe),re))}finally{let Ue=A!==null?Re.get(A).__webglFramebuffer:null;Ee.bindFramebuffer(L.FRAMEBUFFER,Ue)}}},this.readRenderTargetPixelsAsync=async function(T,k,X,q,F,re,ve,xe=0){if(!(T&&T.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let ye=Re.get(T).__webglFramebuffer;if(T.isWebGLCubeRenderTarget&&ve!==void 0&&(ye=ye[ve]),ye)if(k>=0&&k<=T.width-q&&X>=0&&X<=T.height-F){Ee.bindFramebuffer(L.FRAMEBUFFER,ye);let Ue=T.textures[xe],Fe=Ue.format,Oe=Ue.type;if(!Qe.textureFormatReadable(Fe))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!Qe.textureTypeReadable(Oe))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let Ke=L.createBuffer();L.bindBuffer(L.PIXEL_PACK_BUFFER,Ke),L.bufferData(L.PIXEL_PACK_BUFFER,re.byteLength,L.STREAM_READ),T.textures.length>1&&L.readBuffer(L.COLOR_ATTACHMENT0+xe),L.readPixels(k,X,q,F,Ne.convert(Fe),Ne.convert(Oe),0);let ct=A!==null?Re.get(A).__webglFramebuffer:null;Ee.bindFramebuffer(L.FRAMEBUFFER,ct);let ut=L.fenceSync(L.SYNC_GPU_COMMANDS_COMPLETE,0);return L.flush(),await cf(L,ut,4),L.bindBuffer(L.PIXEL_PACK_BUFFER,Ke),L.getBufferSubData(L.PIXEL_PACK_BUFFER,0,re),L.deleteBuffer(Ke),L.deleteSync(ut),re}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(T,k=null,X=0){let q=Math.pow(2,-X),F=Math.floor(T.image.width*q),re=Math.floor(T.image.height*q),ve=k!==null?k.x:0,xe=k!==null?k.y:0;Le.setTexture2D(T,0),L.copyTexSubImage2D(L.TEXTURE_2D,X,0,0,ve,xe,F,re),Ee.unbindTexture()};let Ud=L.createFramebuffer(),Od=L.createFramebuffer();this.copyTextureToTexture=function(T,k,X=null,q=null,F=0,re=null){re===null&&(F!==0?(Yn("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."),re=F,F=0):re=0);let ve,xe,ye,Ue,Fe,Oe,Ke,ct,ut,ft=T.isCompressedTexture?T.mipmaps[re]:T.image;if(X!==null)ve=X.max.x-X.min.x,xe=X.max.y-X.min.y,ye=X.isBox3?X.max.z-X.min.z:1,Ue=X.min.x,Fe=X.min.y,Oe=X.isBox3?X.min.z:0;else{let Kt=Math.pow(2,-F);ve=Math.floor(ft.width*Kt),xe=Math.floor(ft.height*Kt),T.isDataArrayTexture?ye=ft.depth:T.isData3DTexture?ye=Math.floor(ft.depth*Kt):ye=1,Ue=0,Fe=0,Oe=0}q!==null?(Ke=q.x,ct=q.y,ut=q.z):(Ke=0,ct=0,ut=0);let ht=Ne.convert(k.format),Ae=Ne.convert(k.type),Tt;k.isData3DTexture?(Le.setTexture3D(k,0),Tt=L.TEXTURE_3D):k.isDataArrayTexture||k.isCompressedArrayTexture?(Le.setTexture2DArray(k,0),Tt=L.TEXTURE_2D_ARRAY):(Le.setTexture2D(k,0),Tt=L.TEXTURE_2D),L.pixelStorei(L.UNPACK_FLIP_Y_WEBGL,k.flipY),L.pixelStorei(L.UNPACK_PREMULTIPLY_ALPHA_WEBGL,k.premultiplyAlpha),L.pixelStorei(L.UNPACK_ALIGNMENT,k.unpackAlignment);let Pi=L.getParameter(L.UNPACK_ROW_LENGTH),ni=L.getParameter(L.UNPACK_IMAGE_HEIGHT),Dr=L.getParameter(L.UNPACK_SKIP_PIXELS),Xt=L.getParameter(L.UNPACK_SKIP_ROWS),bn=L.getParameter(L.UNPACK_SKIP_IMAGES);L.pixelStorei(L.UNPACK_ROW_LENGTH,ft.width),L.pixelStorei(L.UNPACK_IMAGE_HEIGHT,ft.height),L.pixelStorei(L.UNPACK_SKIP_PIXELS,Ue),L.pixelStorei(L.UNPACK_SKIP_ROWS,Fe),L.pixelStorei(L.UNPACK_SKIP_IMAGES,Oe);let mt=T.isDataArrayTexture||T.isData3DTexture,$t=k.isDataArrayTexture||k.isData3DTexture;if(T.isDepthTexture){let Kt=Re.get(T),At=Re.get(k),ai=Re.get(Kt.__renderTarget),Ms=Re.get(At.__renderTarget);Ee.bindFramebuffer(L.READ_FRAMEBUFFER,ai.__webglFramebuffer),Ee.bindFramebuffer(L.DRAW_FRAMEBUFFER,Ms.__webglFramebuffer);for(let dr=0;dr<ye;dr++)mt&&(L.framebufferTextureLayer(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,Re.get(T).__webglTexture,F,Oe+dr),L.framebufferTextureLayer(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,Re.get(k).__webglTexture,re,ut+dr)),L.blitFramebuffer(Ue,Fe,ve,xe,Ke,ct,ve,xe,L.DEPTH_BUFFER_BIT,L.NEAREST);Ee.bindFramebuffer(L.READ_FRAMEBUFFER,null),Ee.bindFramebuffer(L.DRAW_FRAMEBUFFER,null)}else if(F!==0||T.isRenderTargetTexture||Re.has(T)){let Kt=Re.get(T),At=Re.get(k);Ee.bindFramebuffer(L.READ_FRAMEBUFFER,Ud),Ee.bindFramebuffer(L.DRAW_FRAMEBUFFER,Od);for(let ai=0;ai<ye;ai++)mt?L.framebufferTextureLayer(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,Kt.__webglTexture,F,Oe+ai):L.framebufferTexture2D(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,Kt.__webglTexture,F),$t?L.framebufferTextureLayer(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,At.__webglTexture,re,ut+ai):L.framebufferTexture2D(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,At.__webglTexture,re),F!==0?L.blitFramebuffer(Ue,Fe,ve,xe,Ke,ct,ve,xe,L.COLOR_BUFFER_BIT,L.NEAREST):$t?L.copyTexSubImage3D(Tt,re,Ke,ct,ut+ai,Ue,Fe,ve,xe):L.copyTexSubImage2D(Tt,re,Ke,ct,Ue,Fe,ve,xe);Ee.bindFramebuffer(L.READ_FRAMEBUFFER,null),Ee.bindFramebuffer(L.DRAW_FRAMEBUFFER,null)}else $t?T.isDataTexture||T.isData3DTexture?L.texSubImage3D(Tt,re,Ke,ct,ut,ve,xe,ye,ht,Ae,ft.data):k.isCompressedArrayTexture?L.compressedTexSubImage3D(Tt,re,Ke,ct,ut,ve,xe,ye,ht,ft.data):L.texSubImage3D(Tt,re,Ke,ct,ut,ve,xe,ye,ht,Ae,ft):T.isDataTexture?L.texSubImage2D(L.TEXTURE_2D,re,Ke,ct,ve,xe,ht,Ae,ft.data):T.isCompressedTexture?L.compressedTexSubImage2D(L.TEXTURE_2D,re,Ke,ct,ft.width,ft.height,ht,ft.data):L.texSubImage2D(L.TEXTURE_2D,re,Ke,ct,ve,xe,ht,Ae,ft);L.pixelStorei(L.UNPACK_ROW_LENGTH,Pi),L.pixelStorei(L.UNPACK_IMAGE_HEIGHT,ni),L.pixelStorei(L.UNPACK_SKIP_PIXELS,Dr),L.pixelStorei(L.UNPACK_SKIP_ROWS,Xt),L.pixelStorei(L.UNPACK_SKIP_IMAGES,bn),re===0&&k.generateMipmaps&&L.generateMipmap(Tt),Ee.unbindTexture()},this.initRenderTarget=function(T){Re.get(T).__webglFramebuffer===void 0&&Le.setupRenderTarget(T)},this.initTexture=function(T){T.isCubeTexture?Le.setTextureCube(T,0):T.isData3DTexture?Le.setTexture3D(T,0):T.isDataArrayTexture||T.isCompressedArrayTexture?Le.setTexture2DArray(T,0):Le.setTexture2D(T,0),Ee.unbindTexture()},this.resetState=function(){S=0,E=0,A=null,Ee.reset(),Ie.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Ti}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=ke._getDrawingBufferColorSpace(e),t.unpackColorSpace=ke._getUnpackColorSpace()}};Tx=class extends Vt{constructor(e){super(e),this.dracoLoader=null,this.ktx2Loader=null,this.meshoptDecoder=null,this.pluginCallbacks=[],this.register(function(t){return new Lx(t)}),this.register(function(t){return new Px(t)}),this.register(function(t){return new Hx(t)}),this.register(function(t){return new Vx(t)}),this.register(function(t){return new Wx(t)}),this.register(function(t){return new Nx(t)}),this.register(function(t){return new Ux(t)}),this.register(function(t){return new Ox(t)}),this.register(function(t){return new Fx(t)}),this.register(function(t){return new Ix(t)}),this.register(function(t){return new kx(t)}),this.register(function(t){return new Dx(t)}),this.register(function(t){return new zx(t)}),this.register(function(t){return new Bx(t)}),this.register(function(t){return new Rx(t)}),this.register(function(t){return new Gx(t)}),this.register(function(t){return new jx(t)})}load(e,t,i,r){let n=this,a;if(this.resourcePath!=="")a=this.resourcePath;else if(this.path!==""){let l=Rr.extractUrlBase(e);a=Rr.resolveURL(l,this.path)}else a=Rr.extractUrlBase(e);this.manager.itemStart(e);let s=function(l){r?r(l):console.error(l),n.manager.itemError(e),n.manager.itemEnd(e)},o=new qi(this.manager);o.setPath(this.path),o.setResponseType("arraybuffer"),o.setRequestHeader(this.requestHeader),o.setWithCredentials(this.withCredentials),o.load(e,function(l){try{n.parse(l,a,function(c){t(c),n.manager.itemEnd(e)},s)}catch(c){s(c)}},i,s)}setDRACOLoader(e){return this.dracoLoader=e,this}setKTX2Loader(e){return this.ktx2Loader=e,this}setMeshoptDecoder(e){return this.meshoptDecoder=e,this}register(e){return this.pluginCallbacks.indexOf(e)===-1&&this.pluginCallbacks.push(e),this}unregister(e){return this.pluginCallbacks.indexOf(e)!==-1&&this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e),1),this}parse(e,t,i,r){let n,a={},s={},o=new TextDecoder;if(typeof e=="string")n=JSON.parse(e);else if(e instanceof ArrayBuffer)if(o.decode(new Uint8Array(e,0,4))===qu){try{a[qe.KHR_BINARY_GLTF]=new Xx(e)}catch(c){r&&r(c);return}n=JSON.parse(a[qe.KHR_BINARY_GLTF].content)}else n=JSON.parse(o.decode(e));else n=e;if(n.asset===void 0||n.asset.version[0]<2){r&&r(new Error("THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported."));return}let l=new ay(n,{path:t||this.resourcePath||"",crossOrigin:this.crossOrigin,requestHeader:this.requestHeader,manager:this.manager,ktx2Loader:this.ktx2Loader,meshoptDecoder:this.meshoptDecoder});l.fileLoader.setRequestHeader(this.requestHeader);for(let c=0;c<this.pluginCallbacks.length;c++){let h=this.pluginCallbacks[c](l);h.name||console.error("THREE.GLTFLoader: Invalid plugin found: missing name"),s[h.name]=h,a[h.name]=!0}if(n.extensionsUsed)for(let c=0;c<n.extensionsUsed.length;++c){let h=n.extensionsUsed[c],u=n.extensionsRequired||[];switch(h){case qe.KHR_MATERIALS_UNLIT:a[h]=new Cx;break;case qe.KHR_DRACO_MESH_COMPRESSION:a[h]=new qx(n,this.dracoLoader);break;case qe.KHR_TEXTURE_TRANSFORM:a[h]=new Yx;break;case qe.KHR_MESH_QUANTIZATION:a[h]=new $x;break;default:u.indexOf(h)>=0&&s[h]===void 0&&console.warn('THREE.GLTFLoader: Unknown extension "'+h+'".')}}l.setExtensions(a),l.setPlugins(s),l.parse(i,r)}parseAsync(e,t){let i=this;return new Promise(function(r,n){i.parse(e,t,r,n)})}};qe={KHR_BINARY_GLTF:"KHR_binary_glTF",KHR_DRACO_MESH_COMPRESSION:"KHR_draco_mesh_compression",KHR_LIGHTS_PUNCTUAL:"KHR_lights_punctual",KHR_MATERIALS_CLEARCOAT:"KHR_materials_clearcoat",KHR_MATERIALS_DISPERSION:"KHR_materials_dispersion",KHR_MATERIALS_IOR:"KHR_materials_ior",KHR_MATERIALS_SHEEN:"KHR_materials_sheen",KHR_MATERIALS_SPECULAR:"KHR_materials_specular",KHR_MATERIALS_TRANSMISSION:"KHR_materials_transmission",KHR_MATERIALS_IRIDESCENCE:"KHR_materials_iridescence",KHR_MATERIALS_ANISOTROPY:"KHR_materials_anisotropy",KHR_MATERIALS_UNLIT:"KHR_materials_unlit",KHR_MATERIALS_VOLUME:"KHR_materials_volume",KHR_TEXTURE_BASISU:"KHR_texture_basisu",KHR_TEXTURE_TRANSFORM:"KHR_texture_transform",KHR_MESH_QUANTIZATION:"KHR_mesh_quantization",KHR_MATERIALS_EMISSIVE_STRENGTH:"KHR_materials_emissive_strength",EXT_MATERIALS_BUMP:"EXT_materials_bump",EXT_TEXTURE_WEBP:"EXT_texture_webp",EXT_TEXTURE_AVIF:"EXT_texture_avif",EXT_MESHOPT_COMPRESSION:"EXT_meshopt_compression",EXT_MESH_GPU_INSTANCING:"EXT_mesh_gpu_instancing"},Rx=class{constructor(e){this.parser=e,this.name=qe.KHR_LIGHTS_PUNCTUAL,this.cache={refs:{},uses:{}}}_markDefs(){let e=this.parser,t=this.parser.json.nodes||[];for(let i=0,r=t.length;i<r;i++){let n=t[i];n.extensions&&n.extensions[this.name]&&n.extensions[this.name].light!==void 0&&e._addNodeRef(this.cache,n.extensions[this.name].light)}}_loadLight(e){let t=this.parser,i="light:"+e,r=t.cache.get(i);if(r)return r;let n=t.json,a=((n.extensions&&n.extensions[this.name]||{}).lights||[])[e],s,o=new _e(16777215);a.color!==void 0&&o.setRGB(a.color[0],a.color[1],a.color[2],zt);let l=a.range!==void 0?a.range:0;switch(a.type){case"directional":s=new Bl(o),s.target.position.set(0,0,-1),s.add(s.target);break;case"point":s=new cs(o),s.distance=l;break;case"spot":s=new zu(o),s.distance=l,a.spot=a.spot||{},a.spot.innerConeAngle=a.spot.innerConeAngle!==void 0?a.spot.innerConeAngle:0,a.spot.outerConeAngle=a.spot.outerConeAngle!==void 0?a.spot.outerConeAngle:Math.PI/4,s.angle=a.spot.outerConeAngle,s.penumbra=1-a.spot.innerConeAngle/a.spot.outerConeAngle,s.target.position.set(0,0,-1),s.add(s.target);break;default:throw new Error("THREE.GLTFLoader: Unexpected light type: "+a.type)}return s.position.set(0,0,0),Mi(s,a),a.intensity!==void 0&&(s.intensity=a.intensity),s.name=t.createUniqueName(a.name||"light_"+e),r=Promise.resolve(s),t.cache.add(i,r),r}getDependency(e,t){if(e==="light")return this._loadLight(t)}createNodeAttachment(e){let t=this,i=this.parser,r=i.json.nodes[e],n=(r.extensions&&r.extensions[this.name]||{}).light;return n===void 0?null:this._loadLight(n).then(function(a){return i._getNodeRef(t.cache,n,a)})}},Cx=class{constructor(){this.name=qe.KHR_MATERIALS_UNLIT}getMaterialType(){return Sr}extendParams(e,t,i){let r=[];e.color=new _e(1,1,1),e.opacity=1;let n=t.pbrMetallicRoughness;if(n){if(Array.isArray(n.baseColorFactor)){let a=n.baseColorFactor;e.color.setRGB(a[0],a[1],a[2],zt),e.opacity=a[3]}n.baseColorTexture!==void 0&&r.push(i.assignTexture(e,"map",n.baseColorTexture,je))}return Promise.all(r)}},Ix=class{constructor(e){this.parser=e,this.name=qe.KHR_MATERIALS_EMISSIVE_STRENGTH}extendMaterialParams(e,t){let i=this.parser.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();let r=i.extensions[this.name].emissiveStrength;return r!==void 0&&(t.emissiveIntensity=r),Promise.resolve()}},Lx=class{constructor(e){this.parser=e,this.name=qe.KHR_MATERIALS_CLEARCOAT}getMaterialType(e){let t=this.parser.json.materials[e];return!t.extensions||!t.extensions[this.name]?null:Li}extendMaterialParams(e,t){let i=this.parser,r=i.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();let n=[],a=r.extensions[this.name];if(a.clearcoatFactor!==void 0&&(t.clearcoat=a.clearcoatFactor),a.clearcoatTexture!==void 0&&n.push(i.assignTexture(t,"clearcoatMap",a.clearcoatTexture)),a.clearcoatRoughnessFactor!==void 0&&(t.clearcoatRoughness=a.clearcoatRoughnessFactor),a.clearcoatRoughnessTexture!==void 0&&n.push(i.assignTexture(t,"clearcoatRoughnessMap",a.clearcoatRoughnessTexture)),a.clearcoatNormalTexture!==void 0&&(n.push(i.assignTexture(t,"clearcoatNormalMap",a.clearcoatNormalTexture)),a.clearcoatNormalTexture.scale!==void 0)){let s=a.clearcoatNormalTexture.scale;t.clearcoatNormalScale=new De(s,s)}return Promise.all(n)}},Px=class{constructor(e){this.parser=e,this.name=qe.KHR_MATERIALS_DISPERSION}getMaterialType(e){let t=this.parser.json.materials[e];return!t.extensions||!t.extensions[this.name]?null:Li}extendMaterialParams(e,t){let i=this.parser.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();let r=i.extensions[this.name];return t.dispersion=r.dispersion!==void 0?r.dispersion:0,Promise.resolve()}},Dx=class{constructor(e){this.parser=e,this.name=qe.KHR_MATERIALS_IRIDESCENCE}getMaterialType(e){let t=this.parser.json.materials[e];return!t.extensions||!t.extensions[this.name]?null:Li}extendMaterialParams(e,t){let i=this.parser,r=i.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();let n=[],a=r.extensions[this.name];return a.iridescenceFactor!==void 0&&(t.iridescence=a.iridescenceFactor),a.iridescenceTexture!==void 0&&n.push(i.assignTexture(t,"iridescenceMap",a.iridescenceTexture)),a.iridescenceIor!==void 0&&(t.iridescenceIOR=a.iridescenceIor),t.iridescenceThicknessRange===void 0&&(t.iridescenceThicknessRange=[100,400]),a.iridescenceThicknessMinimum!==void 0&&(t.iridescenceThicknessRange[0]=a.iridescenceThicknessMinimum),a.iridescenceThicknessMaximum!==void 0&&(t.iridescenceThicknessRange[1]=a.iridescenceThicknessMaximum),a.iridescenceThicknessTexture!==void 0&&n.push(i.assignTexture(t,"iridescenceThicknessMap",a.iridescenceThicknessTexture)),Promise.all(n)}},Nx=class{constructor(e){this.parser=e,this.name=qe.KHR_MATERIALS_SHEEN}getMaterialType(e){let t=this.parser.json.materials[e];return!t.extensions||!t.extensions[this.name]?null:Li}extendMaterialParams(e,t){let i=this.parser,r=i.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();let n=[];t.sheenColor=new _e(0,0,0),t.sheenRoughness=0,t.sheen=1;let a=r.extensions[this.name];if(a.sheenColorFactor!==void 0){let s=a.sheenColorFactor;t.sheenColor.setRGB(s[0],s[1],s[2],zt)}return a.sheenRoughnessFactor!==void 0&&(t.sheenRoughness=a.sheenRoughnessFactor),a.sheenColorTexture!==void 0&&n.push(i.assignTexture(t,"sheenColorMap",a.sheenColorTexture,je)),a.sheenRoughnessTexture!==void 0&&n.push(i.assignTexture(t,"sheenRoughnessMap",a.sheenRoughnessTexture)),Promise.all(n)}},Ux=class{constructor(e){this.parser=e,this.name=qe.KHR_MATERIALS_TRANSMISSION}getMaterialType(e){let t=this.parser.json.materials[e];return!t.extensions||!t.extensions[this.name]?null:Li}extendMaterialParams(e,t){let i=this.parser,r=i.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();let n=[],a=r.extensions[this.name];return a.transmissionFactor!==void 0&&(t.transmission=a.transmissionFactor),a.transmissionTexture!==void 0&&n.push(i.assignTexture(t,"transmissionMap",a.transmissionTexture)),Promise.all(n)}},Ox=class{constructor(e){this.parser=e,this.name=qe.KHR_MATERIALS_VOLUME}getMaterialType(e){let t=this.parser.json.materials[e];return!t.extensions||!t.extensions[this.name]?null:Li}extendMaterialParams(e,t){let i=this.parser,r=i.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();let n=[],a=r.extensions[this.name];t.thickness=a.thicknessFactor!==void 0?a.thicknessFactor:0,a.thicknessTexture!==void 0&&n.push(i.assignTexture(t,"thicknessMap",a.thicknessTexture)),t.attenuationDistance=a.attenuationDistance||1/0;let s=a.attenuationColor||[1,1,1];return t.attenuationColor=new _e().setRGB(s[0],s[1],s[2],zt),Promise.all(n)}},Fx=class{constructor(e){this.parser=e,this.name=qe.KHR_MATERIALS_IOR}getMaterialType(e){let t=this.parser.json.materials[e];return!t.extensions||!t.extensions[this.name]?null:Li}extendMaterialParams(e,t){let i=this.parser.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();let r=i.extensions[this.name];return t.ior=r.ior!==void 0?r.ior:1.5,Promise.resolve()}},kx=class{constructor(e){this.parser=e,this.name=qe.KHR_MATERIALS_SPECULAR}getMaterialType(e){let t=this.parser.json.materials[e];return!t.extensions||!t.extensions[this.name]?null:Li}extendMaterialParams(e,t){let i=this.parser,r=i.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();let n=[],a=r.extensions[this.name];t.specularIntensity=a.specularFactor!==void 0?a.specularFactor:1,a.specularTexture!==void 0&&n.push(i.assignTexture(t,"specularIntensityMap",a.specularTexture));let s=a.specularColorFactor||[1,1,1];return t.specularColor=new _e().setRGB(s[0],s[1],s[2],zt),a.specularColorTexture!==void 0&&n.push(i.assignTexture(t,"specularColorMap",a.specularColorTexture,je)),Promise.all(n)}},Bx=class{constructor(e){this.parser=e,this.name=qe.EXT_MATERIALS_BUMP}getMaterialType(e){let t=this.parser.json.materials[e];return!t.extensions||!t.extensions[this.name]?null:Li}extendMaterialParams(e,t){let i=this.parser,r=i.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();let n=[],a=r.extensions[this.name];return t.bumpScale=a.bumpFactor!==void 0?a.bumpFactor:1,a.bumpTexture!==void 0&&n.push(i.assignTexture(t,"bumpMap",a.bumpTexture)),Promise.all(n)}},zx=class{constructor(e){this.parser=e,this.name=qe.KHR_MATERIALS_ANISOTROPY}getMaterialType(e){let t=this.parser.json.materials[e];return!t.extensions||!t.extensions[this.name]?null:Li}extendMaterialParams(e,t){let i=this.parser,r=i.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();let n=[],a=r.extensions[this.name];return a.anisotropyStrength!==void 0&&(t.anisotropy=a.anisotropyStrength),a.anisotropyRotation!==void 0&&(t.anisotropyRotation=a.anisotropyRotation),a.anisotropyTexture!==void 0&&n.push(i.assignTexture(t,"anisotropyMap",a.anisotropyTexture)),Promise.all(n)}},Hx=class{constructor(e){this.parser=e,this.name=qe.KHR_TEXTURE_BASISU}loadTexture(e){let t=this.parser,i=t.json,r=i.textures[e];if(!r.extensions||!r.extensions[this.name])return null;let n=r.extensions[this.name],a=t.options.ktx2Loader;if(!a){if(i.extensionsRequired&&i.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures");return null}return t.loadTextureImage(e,n.source,a)}},Vx=class{constructor(e){this.parser=e,this.name=qe.EXT_TEXTURE_WEBP}loadTexture(e){let t=this.name,i=this.parser,r=i.json,n=r.textures[e];if(!n.extensions||!n.extensions[t])return null;let a=n.extensions[t],s=r.images[a.source],o=i.textureLoader;if(s.uri){let l=i.options.manager.getHandler(s.uri);l!==null&&(o=l)}return i.loadTextureImage(e,a.source,o)}},Wx=class{constructor(e){this.parser=e,this.name=qe.EXT_TEXTURE_AVIF}loadTexture(e){let t=this.name,i=this.parser,r=i.json,n=r.textures[e];if(!n.extensions||!n.extensions[t])return null;let a=n.extensions[t],s=r.images[a.source],o=i.textureLoader;if(s.uri){let l=i.options.manager.getHandler(s.uri);l!==null&&(o=l)}return i.loadTextureImage(e,a.source,o)}},Gx=class{constructor(e){this.name=qe.EXT_MESHOPT_COMPRESSION,this.parser=e}loadBufferView(e){let t=this.parser.json,i=t.bufferViews[e];if(i.extensions&&i.extensions[this.name]){let r=i.extensions[this.name],n=this.parser.getDependency("buffer",r.buffer),a=this.parser.options.meshoptDecoder;if(!a||!a.supported){if(t.extensionsRequired&&t.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files");return null}return n.then(function(s){let o=r.byteOffset||0,l=r.byteLength||0,c=r.count,h=r.byteStride,u=new Uint8Array(s,o,l);return a.decodeGltfBufferAsync?a.decodeGltfBufferAsync(c,h,u,r.mode,r.filter).then(function(d){return d.buffer}):a.ready.then(function(){let d=new ArrayBuffer(c*h);return a.decodeGltfBuffer(new Uint8Array(d),c,h,u,r.mode,r.filter),d})})}else return null}},jx=class{constructor(e){this.name=qe.EXT_MESH_GPU_INSTANCING,this.parser=e}createNodeMesh(e){let t=this.parser.json,i=t.nodes[e];if(!i.extensions||!i.extensions[this.name]||i.mesh===void 0)return null;let r=t.meshes[i.mesh];for(let o of r.primitives)if(o.mode!==Qt.TRIANGLES&&o.mode!==Qt.TRIANGLE_STRIP&&o.mode!==Qt.TRIANGLE_FAN&&o.mode!==void 0)return null;let n=i.extensions[this.name].attributes,a=[],s={};for(let o in n)a.push(this.parser.getDependency("accessor",n[o]).then(l=>(s[o]=l,s[o])));return a.length<1?null:(a.push(this.parser.createNodeMesh(e)),Promise.all(a).then(o=>{let l=o.pop(),c=l.isGroup?l.children:[l],h=o[0].count,u=[];for(let d of c){let p=new we,v=new P,f=new gt,g=new P(1,1,1),m=new Su(d.geometry,d.material,h);for(let y=0;y<h;y++)s.TRANSLATION&&v.fromBufferAttribute(s.TRANSLATION,y),s.ROTATION&&f.fromBufferAttribute(s.ROTATION,y),s.SCALE&&g.fromBufferAttribute(s.SCALE,y),m.setMatrixAt(y,p.compose(v,f,g));for(let y in s)if(y==="_COLOR_0"){let x=s[y];m.instanceColor=new pl(x.array,x.itemSize,x.normalized)}else y!=="TRANSLATION"&&y!=="ROTATION"&&y!=="SCALE"&&d.geometry.setAttribute(y,s[y]);dt.prototype.copy.call(m,d),this.parser.assignFinalMaterial(m),u.push(m)}return l.isGroup?(l.clear(),l.add(...u),l):u[0]}))}},qu="glTF",Dn=12,Dh={JSON:1313821514,BIN:5130562},Xx=class{constructor(e){this.name=qe.KHR_BINARY_GLTF,this.content=null,this.body=null;let t=new DataView(e,0,Dn),i=new TextDecoder;if(this.header={magic:i.decode(new Uint8Array(e.slice(0,4))),version:t.getUint32(4,!0),length:t.getUint32(8,!0)},this.header.magic!==qu)throw new Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");if(this.header.version<2)throw new Error("THREE.GLTFLoader: Legacy binary file detected.");let r=this.header.length-Dn,n=new DataView(e,Dn),a=0;for(;a<r;){let s=n.getUint32(a,!0);a+=4;let o=n.getUint32(a,!0);if(a+=4,o===Dh.JSON){let l=new Uint8Array(e,Dn+a,s);this.content=i.decode(l)}else if(o===Dh.BIN){let l=Dn+a;this.body=e.slice(l,l+s)}a+=s}if(this.content===null)throw new Error("THREE.GLTFLoader: JSON content not found.")}},qx=class{constructor(e,t){if(!t)throw new Error("THREE.GLTFLoader: No DRACOLoader instance provided.");this.name=qe.KHR_DRACO_MESH_COMPRESSION,this.json=e,this.dracoLoader=t,this.dracoLoader.preload()}decodePrimitive(e,t){let i=this.json,r=this.dracoLoader,n=e.extensions[this.name].bufferView,a=e.extensions[this.name].attributes,s={},o={},l={};for(let c in a){let h=xl[c]||c.toLowerCase();s[h]=a[c]}for(let c in e.attributes){let h=xl[c]||c.toLowerCase();if(a[c]!==void 0){let u=i.accessors[e.attributes[c]],d=cn[u.componentType];l[h]=d.name,o[h]=u.normalized===!0}}return t.getDependency("bufferView",n).then(function(c){return new Promise(function(h,u){r.decodeDracoFile(c,function(d){for(let p in d.attributes){let v=d.attributes[p],f=o[p];f!==void 0&&(v.normalized=f)}h(d)},s,l,zt,u)})})}},Yx=class{constructor(){this.name=qe.KHR_TEXTURE_TRANSFORM}extendTexture(e,t){return(t.texCoord===void 0||t.texCoord===e.channel)&&t.offset===void 0&&t.rotation===void 0&&t.scale===void 0||(e=e.clone(),t.texCoord!==void 0&&(e.channel=t.texCoord),t.offset!==void 0&&e.offset.fromArray(t.offset),t.rotation!==void 0&&(e.rotation=t.rotation),t.scale!==void 0&&e.repeat.fromArray(t.scale),e.needsUpdate=!0),e}},$x=class{constructor(){this.name=qe.KHR_MESH_QUANTIZATION}},Yu=class extends ra{constructor(e,t,i,r){super(e,t,i,r)}copySampleValue_(e){let t=this.resultBuffer,i=this.sampleValues,r=this.valueSize,n=e*r*3+r;for(let a=0;a!==r;a++)t[a]=i[n+a];return t}interpolate_(e,t,i,r){let n=this.resultBuffer,a=this.sampleValues,s=this.valueSize,o=s*2,l=s*3,c=r-t,h=(i-t)/c,u=h*h,d=u*h,p=e*l,v=p-l,f=-2*d+3*u,g=d-u,m=1-f,y=g-u+h;for(let x=0;x!==s;x++){let _=a[v+x+s],S=a[v+x+o]*c,E=a[p+x+s],A=a[p+x]*c;n[x]=m*_+y*S+f*E+g*A}return n}},Kx=new gt,Zx=class extends Yu{interpolate_(e,t,i,r){let n=super.interpolate_(e,t,i,r);return Kx.fromArray(n).normalize().toArray(n),n}},Qt={FLOAT:5126,FLOAT_MAT3:35675,FLOAT_MAT4:35676,FLOAT_VEC2:35664,FLOAT_VEC3:35665,FLOAT_VEC4:35666,LINEAR:9729,REPEAT:10497,SAMPLER_2D:35678,POINTS:0,LINES:1,LINE_LOOP:2,LINE_STRIP:3,TRIANGLES:4,TRIANGLE_STRIP:5,TRIANGLE_FAN:6,UNSIGNED_BYTE:5121,UNSIGNED_SHORT:5123},cn={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array},Nh={9728:Bt,9729:Nt,9984:Yh,9985:qa,9986:Nn,9987:pi},Uh={33071:ti,33648:is,10497:ji},vo={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16},xl={POSITION:"position",NORMAL:"normal",TANGENT:"tangent",TEXCOORD_0:"uv",TEXCOORD_1:"uv1",TEXCOORD_2:"uv2",TEXCOORD_3:"uv3",COLOR_0:"color",WEIGHTS_0:"skinWeight",JOINTS_0:"skinIndex"},ir={scale:"scale",translation:"position",rotation:"quaternion",weights:"morphTargetInfluences"},Jx={CUBICSPLINE:void 0,LINEAR:Xn,STEP:jn},_o={OPAQUE:"OPAQUE",MASK:"MASK",BLEND:"BLEND"};ny=new we,ay=class{constructor(e={},t={}){this.json=e,this.extensions={},this.plugins={},this.options=t,this.cache=new Ax,this.associations=new Map,this.primitiveCache={},this.nodeCache={},this.meshCache={refs:{},uses:{}},this.cameraCache={refs:{},uses:{}},this.lightCache={refs:{},uses:{}},this.sourceCache={},this.textureCache={},this.nodeNamesUsed={};let i=!1,r=-1,n=!1,a=-1;if(typeof navigator<"u"){let s=navigator.userAgent;i=/^((?!chrome|android).)*safari/i.test(s)===!0;let o=s.match(/Version\/(\d+)/);r=i&&o?parseInt(o[1],10):-1,n=s.indexOf("Firefox")>-1,a=n?s.match(/Firefox\/([0-9]+)\./)[1]:-1}typeof createImageBitmap>"u"||i&&r<17||n&&a<98?this.textureLoader=new Ol(this.options.manager):this.textureLoader=new Tm(this.options.manager),this.textureLoader.setCrossOrigin(this.options.crossOrigin),this.textureLoader.setRequestHeader(this.options.requestHeader),this.fileLoader=new qi(this.options.manager),this.fileLoader.setResponseType("arraybuffer"),this.options.crossOrigin==="use-credentials"&&this.fileLoader.setWithCredentials(!0)}setExtensions(e){this.extensions=e}setPlugins(e){this.plugins=e}parse(e,t){let i=this,r=this.json,n=this.extensions;this.cache.removeAll(),this.nodeCache={},this._invokeAll(function(a){return a._markDefs&&a._markDefs()}),Promise.all(this._invokeAll(function(a){return a.beforeRoot&&a.beforeRoot()})).then(function(){return Promise.all([i.getDependencies("scene"),i.getDependencies("animation"),i.getDependencies("camera")])}).then(function(a){let s={scene:a[0][r.scene||0],scenes:a[0],animations:a[1],cameras:a[2],asset:r.asset,parser:i,userData:{}};return yr(n,s,r),Mi(s,r),Promise.all(i._invokeAll(function(o){return o.afterRoot&&o.afterRoot(s)})).then(function(){for(let o of s.scenes)o.updateMatrixWorld();e(s)})}).catch(t)}_markDefs(){let e=this.json.nodes||[],t=this.json.skins||[],i=this.json.meshes||[];for(let r=0,n=t.length;r<n;r++){let a=t[r].joints;for(let s=0,o=a.length;s<o;s++)e[a[s]].isBone=!0}for(let r=0,n=e.length;r<n;r++){let a=e[r];a.mesh!==void 0&&(this._addNodeRef(this.meshCache,a.mesh),a.skin!==void 0&&(i[a.mesh].isSkinnedMesh=!0)),a.camera!==void 0&&this._addNodeRef(this.cameraCache,a.camera)}}_addNodeRef(e,t){t!==void 0&&(e.refs[t]===void 0&&(e.refs[t]=e.uses[t]=0),e.refs[t]++)}_getNodeRef(e,t,i){if(e.refs[t]<=1)return i;let r=i.clone(),n=(a,s)=>{let o=this.associations.get(a);o!=null&&this.associations.set(s,o);for(let[l,c]of a.children.entries())n(c,s.children[l])};return n(i,r),r.name+="_instance_"+e.uses[t]++,r}_invokeOne(e){let t=Object.values(this.plugins);t.push(this);for(let i=0;i<t.length;i++){let r=e(t[i]);if(r)return r}return null}_invokeAll(e){let t=Object.values(this.plugins);t.unshift(this);let i=[];for(let r=0;r<t.length;r++){let n=e(t[r]);n&&i.push(n)}return i}getDependency(e,t){let i=e+":"+t,r=this.cache.get(i);if(!r){switch(e){case"scene":r=this.loadScene(t);break;case"node":r=this._invokeOne(function(n){return n.loadNode&&n.loadNode(t)});break;case"mesh":r=this._invokeOne(function(n){return n.loadMesh&&n.loadMesh(t)});break;case"accessor":r=this.loadAccessor(t);break;case"bufferView":r=this._invokeOne(function(n){return n.loadBufferView&&n.loadBufferView(t)});break;case"buffer":r=this.loadBuffer(t);break;case"material":r=this._invokeOne(function(n){return n.loadMaterial&&n.loadMaterial(t)});break;case"texture":r=this._invokeOne(function(n){return n.loadTexture&&n.loadTexture(t)});break;case"skin":r=this.loadSkin(t);break;case"animation":r=this._invokeOne(function(n){return n.loadAnimation&&n.loadAnimation(t)});break;case"camera":r=this.loadCamera(t);break;default:if(r=this._invokeOne(function(n){return n!=this&&n.getDependency&&n.getDependency(e,t)}),!r)throw new Error("Unknown type: "+e);break}this.cache.add(i,r)}return r}getDependencies(e){let t=this.cache.get(e);if(!t){let i=this,r=this.json[e+(e==="mesh"?"es":"s")]||[];t=Promise.all(r.map(function(n,a){return i.getDependency(e,a)})),this.cache.add(e,t)}return t}loadBuffer(e){let t=this.json.buffers[e],i=this.fileLoader;if(t.type&&t.type!=="arraybuffer")throw new Error("THREE.GLTFLoader: "+t.type+" buffer type is not supported.");if(t.uri===void 0&&e===0)return Promise.resolve(this.extensions[qe.KHR_BINARY_GLTF].body);let r=this.options;return new Promise(function(n,a){i.load(Rr.resolveURL(t.uri,r.path),n,void 0,function(){a(new Error('THREE.GLTFLoader: Failed to load buffer "'+t.uri+'".'))})})}loadBufferView(e){let t=this.json.bufferViews[e];return this.getDependency("buffer",t.buffer).then(function(i){let r=t.byteLength||0,n=t.byteOffset||0;return i.slice(n,n+r)})}loadAccessor(e){let t=this,i=this.json,r=this.json.accessors[e];if(r.bufferView===void 0&&r.sparse===void 0){let a=vo[r.type],s=cn[r.componentType],o=r.normalized===!0,l=new s(r.count*a);return Promise.resolve(new Et(l,a,o))}let n=[];return r.bufferView!==void 0?n.push(this.getDependency("bufferView",r.bufferView)):n.push(null),r.sparse!==void 0&&(n.push(this.getDependency("bufferView",r.sparse.indices.bufferView)),n.push(this.getDependency("bufferView",r.sparse.values.bufferView))),Promise.all(n).then(function(a){let s=a[0],o=vo[r.type],l=cn[r.componentType],c=l.BYTES_PER_ELEMENT,h=c*o,u=r.byteOffset||0,d=r.bufferView!==void 0?i.bufferViews[r.bufferView].byteStride:void 0,p=r.normalized===!0,v,f;if(d&&d!==h){let g=Math.floor(u/d),m="InterleavedBuffer:"+r.bufferView+":"+r.componentType+":"+g+":"+r.count,y=t.cache.get(m);y||(v=new l(s,g*d,r.count*d/c),y=new Nf(v,d/c),t.cache.add(m,y)),f=new Uf(y,o,u%d/c,p)}else s===null?v=new l(r.count*o):v=new l(s,u,r.count*o),f=new Et(v,o,p);if(r.sparse!==void 0){let g=vo.SCALAR,m=cn[r.sparse.indices.componentType],y=r.sparse.indices.byteOffset||0,x=r.sparse.values.byteOffset||0,_=new m(a[1],y,r.sparse.count*g),S=new l(a[2],x,r.sparse.count*o);s!==null&&(f=new Et(f.array.slice(),f.itemSize,f.normalized)),f.normalized=!1;for(let E=0,A=_.length;E<A;E++){let C=_[E];if(f.setX(C,S[E*o]),o>=2&&f.setY(C,S[E*o+1]),o>=3&&f.setZ(C,S[E*o+2]),o>=4&&f.setW(C,S[E*o+3]),o>=5)throw new Error("THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.")}f.normalized=p}return f})}loadTexture(e){let t=this.json,i=this.options,r=t.textures[e].source,n=t.images[r],a=this.textureLoader;if(n.uri){let s=i.manager.getHandler(n.uri);s!==null&&(a=s)}return this.loadTextureImage(e,r,a)}loadTextureImage(e,t,i){let r=this,n=this.json,a=n.textures[e],s=n.images[t],o=(s.uri||s.bufferView)+":"+a.sampler;if(this.textureCache[o])return this.textureCache[o];let l=this.loadImageSource(t,i).then(function(c){c.flipY=!1,c.name=a.name||s.name||"",c.name===""&&typeof s.uri=="string"&&s.uri.startsWith("data:image/")===!1&&(c.name=s.uri);let h=(n.samplers||{})[a.sampler]||{};return c.magFilter=Nh[h.magFilter]||Nt,c.minFilter=Nh[h.minFilter]||pi,c.wrapS=Uh[h.wrapS]||ji,c.wrapT=Uh[h.wrapT]||ji,c.generateMipmaps=!c.isCompressedTexture&&c.minFilter!==Bt&&c.minFilter!==Nt,r.associations.set(c,{textures:e}),c}).catch(function(){return null});return this.textureCache[o]=l,l}loadImageSource(e,t){let i=this,r=this.json,n=this.options;if(this.sourceCache[e]!==void 0)return this.sourceCache[e].then(h=>h.clone());let a=r.images[e],s=self.URL||self.webkitURL,o=a.uri||"",l=!1;if(a.bufferView!==void 0)o=i.getDependency("bufferView",a.bufferView).then(function(h){l=!0;let u=new Blob([h],{type:a.mimeType});return o=s.createObjectURL(u),o});else if(a.uri===void 0)throw new Error("THREE.GLTFLoader: Image "+e+" is missing URI and bufferView");let c=Promise.resolve(o).then(function(h){return new Promise(function(u,d){let p=u;t.isImageBitmapLoader===!0&&(p=function(v){let f=new Ht(v);f.needsUpdate=!0,u(f)}),t.load(Rr.resolveURL(h,n.path),p,void 0,d)})}).then(function(h){return l===!0&&s.revokeObjectURL(o),Mi(h,a),h.userData.mimeType=a.mimeType||ry(a.uri),h}).catch(function(h){throw console.error("THREE.GLTFLoader: Couldn't load texture",o),h});return this.sourceCache[e]=c,c}assignTexture(e,t,i,r){let n=this;return this.getDependency("texture",i.index).then(function(a){if(!a)return null;if(i.texCoord!==void 0&&i.texCoord>0&&(a=a.clone(),a.channel=i.texCoord),n.extensions[qe.KHR_TEXTURE_TRANSFORM]){let s=i.extensions!==void 0?i.extensions[qe.KHR_TEXTURE_TRANSFORM]:void 0;if(s){let o=n.associations.get(a);a=n.extensions[qe.KHR_TEXTURE_TRANSFORM].extendTexture(a,s),n.associations.set(a,o)}}return r!==void 0&&(a.colorSpace=r),e[t]=a,a})}assignFinalMaterial(e){let t=e.geometry,i=e.material,r=t.attributes.tangent===void 0,n=t.attributes.color!==void 0,a=t.attributes.normal===void 0;if(e.isPoints){let s="PointsMaterial:"+i.uuid,o=this.cache.get(s);o||(o=new Er,jt.prototype.copy.call(o,i),o.color.copy(i.color),o.map=i.map,o.sizeAttenuation=!1,this.cache.add(s,o)),i=o}else if(e.isLine){let s="LineBasicMaterial:"+i.uuid,o=this.cache.get(s);o||(o=new Ar,jt.prototype.copy.call(o,i),o.color.copy(i.color),o.map=i.map,this.cache.add(s,o)),i=o}if(r||n||a){let s="ClonedMaterial:"+i.uuid+":";r&&(s+="derivative-tangents:"),n&&(s+="vertex-colors:"),a&&(s+="flat-shading:");let o=this.cache.get(s);o||(o=i.clone(),n&&(o.vertexColors=!0),a&&(o.flatShading=!0),r&&(o.normalScale&&(o.normalScale.y*=-1),o.clearcoatNormalScale&&(o.clearcoatNormalScale.y*=-1)),this.cache.add(s,o),this.associations.set(o,this.associations.get(i))),i=o}e.material=i}getMaterialType(){return gn}loadMaterial(e){let t=this,i=this.json,r=this.extensions,n=i.materials[e],a,s={},o=n.extensions||{},l=[];if(o[qe.KHR_MATERIALS_UNLIT]){let h=r[qe.KHR_MATERIALS_UNLIT];a=h.getMaterialType(),l.push(h.extendParams(s,n,t))}else{let h=n.pbrMetallicRoughness||{};if(s.color=new _e(1,1,1),s.opacity=1,Array.isArray(h.baseColorFactor)){let u=h.baseColorFactor;s.color.setRGB(u[0],u[1],u[2],zt),s.opacity=u[3]}h.baseColorTexture!==void 0&&l.push(t.assignTexture(s,"map",h.baseColorTexture,je)),s.metalness=h.metallicFactor!==void 0?h.metallicFactor:1,s.roughness=h.roughnessFactor!==void 0?h.roughnessFactor:1,h.metallicRoughnessTexture!==void 0&&(l.push(t.assignTexture(s,"metalnessMap",h.metallicRoughnessTexture)),l.push(t.assignTexture(s,"roughnessMap",h.metallicRoughnessTexture))),a=this._invokeOne(function(u){return u.getMaterialType&&u.getMaterialType(e)}),l.push(Promise.all(this._invokeAll(function(u){return u.extendMaterialParams&&u.extendMaterialParams(e,s)})))}n.doubleSided===!0&&(s.side=Ei);let c=n.alphaMode||_o.OPAQUE;if(c===_o.BLEND?(s.transparent=!0,s.depthWrite=!1):(s.transparent=!1,c===_o.MASK&&(s.alphaTest=n.alphaCutoff!==void 0?n.alphaCutoff:.5)),n.normalTexture!==void 0&&a!==Sr&&(l.push(t.assignTexture(s,"normalMap",n.normalTexture)),s.normalScale=new De(1,1),n.normalTexture.scale!==void 0)){let h=n.normalTexture.scale;s.normalScale.set(h,h)}if(n.occlusionTexture!==void 0&&a!==Sr&&(l.push(t.assignTexture(s,"aoMap",n.occlusionTexture)),n.occlusionTexture.strength!==void 0&&(s.aoMapIntensity=n.occlusionTexture.strength)),n.emissiveFactor!==void 0&&a!==Sr){let h=n.emissiveFactor;s.emissive=new _e().setRGB(h[0],h[1],h[2],zt)}return n.emissiveTexture!==void 0&&a!==Sr&&l.push(t.assignTexture(s,"emissiveMap",n.emissiveTexture,je)),Promise.all(l).then(function(){let h=new a(s);return n.name&&(h.name=n.name),Mi(h,n),t.associations.set(h,{materials:e}),n.extensions&&yr(r,h,n),h})}createUniqueName(e){let t=at.sanitizeNodeName(e||"");return t in this.nodeNamesUsed?t+"_"+ ++this.nodeNamesUsed[t]:(this.nodeNamesUsed[t]=0,t)}loadGeometries(e){let t=this,i=this.extensions,r=this.primitiveCache;function n(s){return i[qe.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(s,t).then(function(o){return Oh(o,s,t)})}let a=[];for(let s=0,o=e.length;s<o;s++){let l=e[s],c=iy(l),h=r[c];if(h)a.push(h.promise);else{let u;l.extensions&&l.extensions[qe.KHR_DRACO_MESH_COMPRESSION]?u=n(l):u=Oh(new It,l,t),r[c]={primitive:l,promise:u},a.push(u)}}return Promise.all(a)}loadMesh(e){let t=this,i=this.json,r=this.extensions,n=i.meshes[e],a=n.primitives,s=[];for(let o=0,l=a.length;o<l;o++){let c=a[o].material===void 0?Qx(this.cache):this.getDependency("material",a[o].material);s.push(c)}return s.push(t.loadGeometries(a)),Promise.all(s).then(function(o){let l=o.slice(0,o.length-1),c=o[o.length-1],h=[];for(let d=0,p=c.length;d<p;d++){let v=c[d],f=a[d],g,m=l[d];if(f.mode===Qt.TRIANGLES||f.mode===Qt.TRIANGLE_STRIP||f.mode===Qt.TRIANGLE_FAN||f.mode===void 0)g=n.isSkinnedMesh===!0?new wu(v,m):new pt(v,m),g.isSkinnedMesh===!0&&g.normalizeSkinWeights(),f.mode===Qt.TRIANGLE_STRIP?g.geometry=Ph(g.geometry,ru):f.mode===Qt.TRIANGLE_FAN&&(g.geometry=Ph(g.geometry,hl));else if(f.mode===Qt.LINES)g=new ls(v,m);else if(f.mode===Qt.LINE_STRIP)g=new fs(v,m);else if(f.mode===Qt.LINE_LOOP)g=new Vf(v,m);else if(f.mode===Qt.POINTS)g=new Bn(v,m);else throw new Error("THREE.GLTFLoader: Primitive mode unsupported: "+f.mode);Object.keys(g.geometry.morphAttributes).length>0&&ty(g,n),g.name=t.createUniqueName(n.name||"mesh_"+e),Mi(g,n),f.extensions&&yr(r,g,f),t.assignFinalMaterial(g),h.push(g)}for(let d=0,p=h.length;d<p;d++)t.associations.set(h[d],{meshes:e,primitives:d});if(h.length===1)return n.extensions&&yr(r,h[0],n),h[0];let u=new mi;n.extensions&&yr(r,u,n),t.associations.set(u,{meshes:e});for(let d=0,p=h.length;d<p;d++)u.add(h[d]);return u})}loadCamera(e){let t,i=this.json.cameras[e],r=i[i.type];if(!r){console.warn("THREE.GLTFLoader: Missing camera parameters.");return}return i.type==="perspective"?t=new Dt(Rt.radToDeg(r.yfov),r.aspectRatio||1,r.znear||1,r.zfar||2e6):i.type==="orthographic"&&(t=new kl(-r.xmag,r.xmag,r.ymag,-r.ymag,r.znear,r.zfar)),i.name&&(t.name=this.createUniqueName(i.name)),Mi(t,i),Promise.resolve(t)}loadSkin(e){let t=this.json.skins[e],i=[];for(let r=0,n=t.joints.length;r<n;r++)i.push(this._loadNodeShallow(t.joints[r]));return t.inverseBindMatrices!==void 0?i.push(this.getDependency("accessor",t.inverseBindMatrices)):i.push(null),Promise.all(i).then(function(r){let n=r.pop(),a=r,s=[],o=[];for(let l=0,c=a.length;l<c;l++){let h=a[l];if(h){s.push(h);let u=new we;n!==null&&u.fromArray(n.array,l*16),o.push(u)}else console.warn('THREE.GLTFLoader: Joint "%s" could not be found.',t.joints[l])}return new Nl(s,o)})}loadAnimation(e){let t=this.json,i=this,r=t.animations[e],n=r.name?r.name:"animation_"+e,a=[],s=[],o=[],l=[],c=[];for(let h=0,u=r.channels.length;h<u;h++){let d=r.channels[h],p=r.samplers[d.sampler],v=d.target,f=v.node,g=r.parameters!==void 0?r.parameters[p.input]:p.input,m=r.parameters!==void 0?r.parameters[p.output]:p.output;v.node!==void 0&&(a.push(this.getDependency("node",f)),s.push(this.getDependency("accessor",g)),o.push(this.getDependency("accessor",m)),l.push(p),c.push(v))}return Promise.all([Promise.all(a),Promise.all(s),Promise.all(o),Promise.all(l),Promise.all(c)]).then(function(h){let u=h[0],d=h[1],p=h[2],v=h[3],f=h[4],g=[];for(let y=0,x=u.length;y<x;y++){let _=u[y],S=d[y],E=p[y],A=v[y],C=f[y];if(_===void 0)continue;_.updateMatrix&&_.updateMatrix();let b=i._createAnimationTracks(_,S,E,A,C);if(b)for(let w=0;w<b.length;w++)g.push(b[w])}let m=new Qn(n,void 0,g);return Mi(m,r),m})}createNodeMesh(e){let t=this.json,i=this,r=t.nodes[e];return r.mesh===void 0?null:i.getDependency("mesh",r.mesh).then(function(n){let a=i._getNodeRef(i.meshCache,r.mesh,n);return r.weights!==void 0&&a.traverse(function(s){if(s.isMesh)for(let o=0,l=r.weights.length;o<l;o++)s.morphTargetInfluences[o]=r.weights[o]}),a})}loadNode(e){let t=this.json,i=this,r=t.nodes[e],n=i._loadNodeShallow(e),a=[],s=r.children||[];for(let l=0,c=s.length;l<c;l++)a.push(i.getDependency("node",s[l]));let o=r.skin===void 0?Promise.resolve(null):i.getDependency("skin",r.skin);return Promise.all([n,Promise.all(a),o]).then(function(l){let c=l[0],h=l[1],u=l[2];u!==null&&c.traverse(function(d){d.isSkinnedMesh&&d.bind(u,ny)});for(let d=0,p=h.length;d<p;d++)c.add(h[d]);return c})}_loadNodeShallow(e){let t=this.json,i=this.extensions,r=this;if(this.nodeCache[e]!==void 0)return this.nodeCache[e];let n=t.nodes[e],a=n.name?r.createUniqueName(n.name):"",s=[],o=r._invokeOne(function(l){return l.createNodeMesh&&l.createNodeMesh(e)});return o&&s.push(o),n.camera!==void 0&&s.push(r.getDependency("camera",n.camera).then(function(l){return r._getNodeRef(r.cameraCache,n.camera,l)})),r._invokeAll(function(l){return l.createNodeAttachment&&l.createNodeAttachment(e)}).forEach(function(l){s.push(l)}),this.nodeCache[e]=Promise.all(s).then(function(l){let c;if(n.isBone===!0?c=new $n:l.length>1?c=new mi:l.length===1?c=l[0]:c=new dt,c!==l[0])for(let h=0,u=l.length;h<u;h++)c.add(l[h]);if(n.name&&(c.userData.name=n.name,c.name=a),Mi(c,n),n.extensions&&yr(i,c,n),n.matrix!==void 0){let h=new we;h.fromArray(n.matrix),c.applyMatrix4(h)}else n.translation!==void 0&&c.position.fromArray(n.translation),n.rotation!==void 0&&c.quaternion.fromArray(n.rotation),n.scale!==void 0&&c.scale.fromArray(n.scale);if(!r.associations.has(c))r.associations.set(c,{});else if(n.mesh!==void 0&&r.meshCache.refs[n.mesh]>1){let h=r.associations.get(c);r.associations.set(c,{...h})}return r.associations.get(c).nodes=e,c}),this.nodeCache[e]}loadScene(e){let t=this.extensions,i=this.json.scenes[e],r=this,n=new mi;i.name&&(n.name=r.createUniqueName(i.name)),Mi(n,i),i.extensions&&yr(t,n,i);let a=i.nodes||[],s=[];for(let o=0,l=a.length;o<l;o++)s.push(r.getDependency("node",a[o]));return Promise.all(s).then(function(o){for(let c=0,h=o.length;c<h;c++)n.add(o[c]);let l=c=>{let h=new Map;for(let[u,d]of r.associations)(u instanceof jt||u instanceof Ht)&&h.set(u,d);return c.traverse(u=>{let d=r.associations.get(u);d!=null&&h.set(u,d)}),h};return r.associations=l(n),n})}_createAnimationTracks(e,t,i,r,n){let a=[],s=e.name?e.name:e.uuid,o=[];ir[n.path]===ir.weights?e.traverse(function(u){u.morphTargetInfluences&&o.push(u.name?u.name:u.uuid)}):o.push(s);let l;switch(ir[n.path]){case ir.weights:l=Pr;break;case ir.rotation:l=Xi;break;case ir.translation:case ir.scale:l=lr;break;default:switch(i.itemSize){case 1:l=Pr;break;case 2:case 3:default:l=lr;break}break}let c=r.interpolation!==void 0?Jx[r.interpolation]:Xn,h=this._getArrayFromAccessor(i);for(let u=0,d=o.length;u<d;u++){let p=new l(o[u]+"."+ir[n.path],t.array,h,c);r.interpolation==="CUBICSPLINE"&&this._createCubicSplineTrackInterpolant(p),a.push(p)}return a}_getArrayFromAccessor(e){let t=e.array;if(e.normalized){let i=yl(t.constructor),r=new Float32Array(t.length);for(let n=0,a=t.length;n<a;n++)r[n]=t[n]*i;t=r}return t}_createCubicSplineTrackInterpolant(e){e.createInterpolant=function(t){let i=this instanceof Xi?Zx:Yu;return new i(this.times,this.values,this.getValueSize()/3,t)},e.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline=!0}};Fh={type:"change"},Wl={type:"start"},$u={type:"end"},Ga=new ia,kh=new rr,oy=Math.cos(70*Rt.DEG2RAD),bt=new P,Wt=2*Math.PI,st={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},yo=1e-6,ly=class extends Vm{constructor(e,t=null){super(e,t),this.state=st.NONE,this.target=new P,this.cursor=new P,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.keyRotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:Tr.ROTATE,MIDDLE:Tr.DOLLY,RIGHT:Tr.PAN},this.touches={ONE:en.ROTATE,TWO:en.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._domElementKeyEvents=null,this._lastPosition=new P,this._lastQuaternion=new gt,this._lastTargetPosition=new P,this._quat=new gt().setFromUnitVectors(e.up,new P(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new oh,this._sphericalDelta=new oh,this._scale=1,this._panOffset=new P,this._rotateStart=new De,this._rotateEnd=new De,this._rotateDelta=new De,this._panStart=new De,this._panEnd=new De,this._panDelta=new De,this._dollyStart=new De,this._dollyEnd=new De,this._dollyDelta=new De,this._dollyDirection=new P,this._mouse=new De,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=hy.bind(this),this._onPointerDown=cy.bind(this),this._onPointerUp=uy.bind(this),this._onContextMenu=_y.bind(this),this._onMouseWheel=fy.bind(this),this._onKeyDown=my.bind(this),this._onTouchStart=gy.bind(this),this._onTouchMove=vy.bind(this),this._onMouseDown=dy.bind(this),this._onMouseMove=py.bind(this),this._interceptControlDown=xy.bind(this),this._interceptControlUp=yy.bind(this),this.domElement!==null&&this.connect(this.domElement),this.update()}connect(e){super.connect(e),this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointercancel",this._onPointerUp),this.domElement.addEventListener("contextmenu",this._onContextMenu),this.domElement.addEventListener("wheel",this._onMouseWheel,{passive:!1}),this.domElement.getRootNode().addEventListener("keydown",this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction="none"}disconnect(){this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.removeEventListener("pointermove",this._onPointerMove),this.domElement.removeEventListener("pointerup",this._onPointerUp),this.domElement.removeEventListener("pointercancel",this._onPointerUp),this.domElement.removeEventListener("wheel",this._onMouseWheel),this.domElement.removeEventListener("contextmenu",this._onContextMenu),this.stopListenToKeyEvents(),this.domElement.getRootNode().removeEventListener("keydown",this._interceptControlDown,{capture:!0}),this.domElement.style.touchAction="auto"}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(e){e.addEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=e}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(Fh),this.update(),this.state=st.NONE}update(e=null){let t=this.object.position;bt.copy(t).sub(this.target),bt.applyQuaternion(this._quat),this._spherical.setFromVector3(bt),this.autoRotate&&this.state===st.NONE&&this._rotateLeft(this._getAutoRotationAngle(e)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let i=this.minAzimuthAngle,r=this.maxAzimuthAngle;isFinite(i)&&isFinite(r)&&(i<-Math.PI?i+=Wt:i>Math.PI&&(i-=Wt),r<-Math.PI?r+=Wt:r>Math.PI&&(r-=Wt),i<=r?this._spherical.theta=Math.max(i,Math.min(r,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(i+r)/2?Math.max(i,this._spherical.theta):Math.min(r,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let n=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{let a=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),n=a!=this._spherical.radius}if(bt.setFromSpherical(this._spherical),bt.applyQuaternion(this._quatInverse),t.copy(this.target).add(bt),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let a=null;if(this.object.isPerspectiveCamera){let s=bt.length();a=this._clampDistance(s*this._scale);let o=s-a;this.object.position.addScaledVector(this._dollyDirection,o),this.object.updateMatrixWorld(),n=!!o}else if(this.object.isOrthographicCamera){let s=new P(this._mouse.x,this._mouse.y,0);s.unproject(this.object);let o=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),n=o!==this.object.zoom;let l=new P(this._mouse.x,this._mouse.y,0);l.unproject(this.object),this.object.position.sub(l).add(s),this.object.updateMatrixWorld(),a=bt.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),this.zoomToCursor=!1;a!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(a).add(this.object.position):(Ga.origin.copy(this.object.position),Ga.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(Ga.direction))<oy?this.object.lookAt(this.target):(kh.setFromNormalAndCoplanarPoint(this.object.up,this.target),Ga.intersectPlane(kh,this.target))))}else if(this.object.isOrthographicCamera){let a=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),a!==this.object.zoom&&(this.object.updateProjectionMatrix(),n=!0)}return this._scale=1,this._performCursorZoom=!1,n||this._lastPosition.distanceToSquared(this.object.position)>yo||8*(1-this._lastQuaternion.dot(this.object.quaternion))>yo||this._lastTargetPosition.distanceToSquared(this.target)>yo?(this.dispatchEvent(Fh),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(e){return e!==null?Wt/60*this.autoRotateSpeed*e:Wt/60/60*this.autoRotateSpeed}_getZoomScale(e){let t=Math.abs(e*.01);return Math.pow(.95,this.zoomSpeed*t)}_rotateLeft(e){this._sphericalDelta.theta-=e}_rotateUp(e){this._sphericalDelta.phi-=e}_panLeft(e,t){bt.setFromMatrixColumn(t,0),bt.multiplyScalar(-e),this._panOffset.add(bt)}_panUp(e,t){this.screenSpacePanning===!0?bt.setFromMatrixColumn(t,1):(bt.setFromMatrixColumn(t,0),bt.crossVectors(this.object.up,bt)),bt.multiplyScalar(e),this._panOffset.add(bt)}_pan(e,t){let i=this.domElement;if(this.object.isPerspectiveCamera){let r=this.object.position;bt.copy(r).sub(this.target);let n=bt.length();n*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*e*n/i.clientHeight,this.object.matrix),this._panUp(2*t*n/i.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(e*(this.object.right-this.object.left)/this.object.zoom/i.clientWidth,this.object.matrix),this._panUp(t*(this.object.top-this.object.bottom)/this.object.zoom/i.clientHeight,this.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),this.enablePan=!1)}_dollyOut(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_dollyIn(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_updateZoomParameters(e,t){if(!this.zoomToCursor)return;this._performCursorZoom=!0;let i=this.domElement.getBoundingClientRect(),r=e-i.left,n=t-i.top,a=i.width,s=i.height;this._mouse.x=r/a*2-1,this._mouse.y=-(n/s)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(e){return Math.max(this.minDistance,Math.min(this.maxDistance,e))}_handleMouseDownRotate(e){this._rotateStart.set(e.clientX,e.clientY)}_handleMouseDownDolly(e){this._updateZoomParameters(e.clientX,e.clientX),this._dollyStart.set(e.clientX,e.clientY)}_handleMouseDownPan(e){this._panStart.set(e.clientX,e.clientY)}_handleMouseMoveRotate(e){this._rotateEnd.set(e.clientX,e.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let t=this.domElement;this._rotateLeft(Wt*this._rotateDelta.x/t.clientHeight),this._rotateUp(Wt*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(e){this._dollyEnd.set(e.clientX,e.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.update()}_handleMouseMovePan(e){this._panEnd.set(e.clientX,e.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(e){this._updateZoomParameters(e.clientX,e.clientY),e.deltaY<0?this._dollyIn(this._getZoomScale(e.deltaY)):e.deltaY>0&&this._dollyOut(this._getZoomScale(e.deltaY)),this.update()}_handleKeyDown(e){let t=!1;switch(e.code){case this.keys.UP:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(Wt*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,this.keyPanSpeed),t=!0;break;case this.keys.BOTTOM:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(-Wt*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,-this.keyPanSpeed),t=!0;break;case this.keys.LEFT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(Wt*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(this.keyPanSpeed,0),t=!0;break;case this.keys.RIGHT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(-Wt*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(-this.keyPanSpeed,0),t=!0;break}t&&(e.preventDefault(),this.update())}_handleTouchStartRotate(e){if(this._pointers.length===1)this._rotateStart.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),i=.5*(e.pageX+t.x),r=.5*(e.pageY+t.y);this._rotateStart.set(i,r)}}_handleTouchStartPan(e){if(this._pointers.length===1)this._panStart.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),i=.5*(e.pageX+t.x),r=.5*(e.pageY+t.y);this._panStart.set(i,r)}}_handleTouchStartDolly(e){let t=this._getSecondPointerPosition(e),i=e.pageX-t.x,r=e.pageY-t.y,n=Math.sqrt(i*i+r*r);this._dollyStart.set(0,n)}_handleTouchStartDollyPan(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enablePan&&this._handleTouchStartPan(e)}_handleTouchStartDollyRotate(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enableRotate&&this._handleTouchStartRotate(e)}_handleTouchMoveRotate(e){if(this._pointers.length==1)this._rotateEnd.set(e.pageX,e.pageY);else{let i=this._getSecondPointerPosition(e),r=.5*(e.pageX+i.x),n=.5*(e.pageY+i.y);this._rotateEnd.set(r,n)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let t=this.domElement;this._rotateLeft(Wt*this._rotateDelta.x/t.clientHeight),this._rotateUp(Wt*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(e){if(this._pointers.length===1)this._panEnd.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),i=.5*(e.pageX+t.x),r=.5*(e.pageY+t.y);this._panEnd.set(i,r)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(e){let t=this._getSecondPointerPosition(e),i=e.pageX-t.x,r=e.pageY-t.y,n=Math.sqrt(i*i+r*r);this._dollyEnd.set(0,n),this._dollyDelta.set(0,Math.pow(this._dollyEnd.y/this._dollyStart.y,this.zoomSpeed)),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);let a=(e.pageX+t.x)*.5,s=(e.pageY+t.y)*.5;this._updateZoomParameters(a,s)}_handleTouchMoveDollyPan(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enablePan&&this._handleTouchMovePan(e)}_handleTouchMoveDollyRotate(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enableRotate&&this._handleTouchMoveRotate(e)}_addPointer(e){this._pointers.push(e.pointerId)}_removePointer(e){delete this._pointerPositions[e.pointerId];for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId){this._pointers.splice(t,1);return}}_isTrackingPointer(e){for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId)return!0;return!1}_trackPointer(e){let t=this._pointerPositions[e.pointerId];t===void 0&&(t=new De,this._pointerPositions[e.pointerId]=t),t.set(e.pageX,e.pageY)}_getSecondPointerPosition(e){let t=e.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[t]}_customWheelEvent(e){let t=e.deltaMode,i={clientX:e.clientX,clientY:e.clientY,deltaY:e.deltaY};switch(t){case 1:i.deltaY*=16;break;case 2:i.deltaY*=100;break}return e.ctrlKey&&!this._controlActive&&(i.deltaY*=10),i}};by=class extends yu{constructor(){super();let e=new ps;e.deleteAttribute("uv");let t=new gn({side:kt}),i=new gn,r=new cs(16777215,900,28,2);r.position.set(.418,16.199,.3),this.add(r);let n=new pt(e,t);n.position.set(-.757,13.219,.717),n.scale.set(31.713,28.305,28.591),this.add(n);let a=new Su(e,i,6),s=new dt;s.position.set(-10.906,2.009,1.846),s.rotation.set(0,-.195,0),s.scale.set(2.328,7.905,4.651),s.updateMatrix(),a.setMatrixAt(0,s.matrix),s.position.set(-5.607,-.754,-.758),s.rotation.set(0,.994,0),s.scale.set(1.97,1.534,3.955),s.updateMatrix(),a.setMatrixAt(1,s.matrix),s.position.set(6.167,.857,7.803),s.rotation.set(0,.561,0),s.scale.set(3.927,6.285,3.687),s.updateMatrix(),a.setMatrixAt(2,s.matrix),s.position.set(-2.017,.018,6.124),s.rotation.set(0,.333,0),s.scale.set(2.002,4.566,2.064),s.updateMatrix(),a.setMatrixAt(3,s.matrix),s.position.set(2.291,-.756,-2.621),s.rotation.set(0,-.286,0),s.scale.set(1.546,1.552,1.496),s.updateMatrix(),a.setMatrixAt(4,s.matrix),s.position.set(-2.193,-.369,-5.547),s.rotation.set(0,.516,0),s.scale.set(3.875,3.487,2.986),s.updateMatrix(),a.setMatrixAt(5,s.matrix),this.add(a);let o=new pt(e,Kr(50));o.position.set(-16.116,14.37,8.208),o.scale.set(.1,2.428,2.739),this.add(o);let l=new pt(e,Kr(50));l.position.set(-16.109,18.021,-8.207),l.scale.set(.1,2.425,2.751),this.add(l);let c=new pt(e,Kr(17));c.position.set(14.904,12.198,-1.832),c.scale.set(.15,4.265,6.331),this.add(c);let h=new pt(e,Kr(43));h.position.set(-.462,8.89,14.52),h.scale.set(4.38,5.441,.088),this.add(h);let u=new pt(e,Kr(20));u.position.set(3.235,11.486,-12.541),u.scale.set(2.5,2,.1),this.add(u);let d=new pt(e,Kr(100));d.position.set(0,20,0),d.scale.set(1,.1,1),this.add(d)}dispose(){let e=new Set;this.traverse(t=>{t.isMesh&&(e.add(t.geometry),e.add(t.material))});for(let t of e)t.dispose()}};ei=Uint8Array,sn=Uint16Array,wy=Int32Array,Ku=new ei([0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,0,0,0]),Zu=new ei([0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13,0,0]),My=new ei([16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15]),Ju=function(e,t){for(var i=new sn(31),r=0;r<31;++r)i[r]=t+=1<<e[r-1];for(var n=new wy(i[30]),r=1;r<30;++r)for(var a=i[r];a<i[r+1];++a)n[a]=a-i[r]<<5|r;return{b:i,r:n}},Qu=Ju(Ku,2),ed=Qu.b,Sy=Qu.r;ed[28]=258,Sy[258]=28;td=Ju(Zu,0),Ey=td.b,jb=td.r,bl=new sn(32768);for(Je=0;Je<32768;++Je)Hi=(Je&43690)>>1|(Je&21845)<<1,Hi=(Hi&52428)>>2|(Hi&13107)<<2,Hi=(Hi&61680)>>4|(Hi&3855)<<4,bl[Je]=((Hi&65280)>>8|(Hi&255)<<8)>>1;zn=(function(e,t,i){for(var r=e.length,n=0,a=new sn(t);n<r;++n)e[n]&&++a[e[n]-1];var s=new sn(t);for(n=1;n<t;++n)s[n]=s[n-1]+a[n-1]<<1;var o;if(i){o=new sn(1<<t);var l=15-t;for(n=0;n<r;++n)if(e[n])for(var c=n<<4|e[n],h=t-e[n],u=s[e[n]-1]++<<h,d=u|(1<<h)-1;u<=d;++u)o[bl[u]>>l]=c}else for(o=new sn(r),n=0;n<r;++n)e[n]&&(o[n]=bl[s[e[n]-1]++]>>15-e[n]);return o}),aa=new ei(288);for(Je=0;Je<144;++Je)aa[Je]=8;for(Je=144;Je<256;++Je)aa[Je]=9;for(Je=256;Je<280;++Je)aa[Je]=7;for(Je=280;Je<288;++Je)aa[Je]=8;id=new ei(32);for(Je=0;Je<32;++Je)id[Je]=5;Ty=zn(aa,9,1),Ay=zn(id,5,1),bo=function(e){for(var t=e[0],i=1;i<e.length;++i)e[i]>t&&(t=e[i]);return t},hi=function(e,t,i){var r=t/8|0;return(e[r]|e[r+1]<<8)>>(t&7)&i},wo=function(e,t){var i=t/8|0;return(e[i]|e[i+1]<<8|e[i+2]<<16)>>(t&7)},Ry=function(e){return(e+7)/8|0},Cy=function(e,t,i){return(t==null||t<0)&&(t=0),(i==null||i>e.length)&&(i=e.length),new ei(e.subarray(t,i))},Iy=["unexpected EOF","invalid block type","invalid length/literal","invalid distance","stream finished","no stream handler",,"no callback","invalid UTF-8 data","extra field too long","date not in range 1980-2099","filename too long","stream finishing","invalid zip data"],ui=function(e,t,i){var r=new Error(t||Iy[e]);if(r.code=e,Error.captureStackTrace&&Error.captureStackTrace(r,ui),!i)throw r;return r},Ly=function(e,t,i,r){var n=e.length,a=r?r.length:0;if(!n||t.f&&!t.l)return i||new ei(0);var s=!i,o=s||t.i!=2,l=t.i;s&&(i=new ei(n*3));var c=function($e){var L=i.length;if($e>L){var We=new ei(Math.max(L*2,$e));We.set(i),i=We}},h=t.f||0,u=t.p||0,d=t.b||0,p=t.l,v=t.d,f=t.m,g=t.n,m=n*8;do{if(!p){h=hi(e,u,1);var y=hi(e,u+1,3);if(u+=3,y)if(y==1)p=Ty,v=Ay,f=9,g=5;else if(y==2){var x=hi(e,u,31)+257,_=hi(e,u+10,15)+4,S=x+hi(e,u+5,31)+1;u+=14;for(var E=new ei(S),A=new ei(19),C=0;C<_;++C)A[My[C]]=hi(e,u+C*3,7);u+=_*3;for(var b=bo(A),w=(1<<b)-1,R=zn(A,b,1),C=0;C<S;){var G=R[hi(e,u,w)];u+=G&15;var V=G>>4;if(V<16)E[C++]=V;else{var W=0,O=0;for(V==16?(O=3+hi(e,u,3),u+=2,W=E[C-1]):V==17?(O=3+hi(e,u,7),u+=3):V==18&&(O=11+hi(e,u,127),u+=7);O--;)E[C++]=W}}var z=E.subarray(0,x),j=E.subarray(x);f=bo(z),g=bo(j),p=zn(z,f,1),v=zn(j,g,1)}else ui(1);else{var V=Ry(u)+4,H=e[V-4]|e[V-3]<<8,$=V+H;if($>n){l&&ui(0);break}o&&c(d+H),i.set(e.subarray(V,$),d),t.b=d+=H,t.p=u=$*8,t.f=h;continue}if(u>m){l&&ui(0);break}}o&&c(d+131072);for(var U=(1<<f)-1,se=(1<<g)-1,ie=u;;ie=u){var W=p[wo(e,u)&U],le=W>>4;if(u+=W&15,u>m){l&&ui(0);break}if(W||ui(2),le<256)i[d++]=le;else if(le==256){ie=u,p=null;break}else{var ae=le-254;if(le>264){var C=le-257,N=Ku[C];ae=hi(e,u,(1<<N)-1)+ed[C],u+=N}var Y=v[wo(e,u)&se],J=Y>>4;Y||ui(3),u+=Y&15;var j=Ey[J];if(J>3){var N=Zu[J];j+=wo(e,u)&(1<<N)-1,u+=N}if(u>m){l&&ui(0);break}o&&c(d+131072);var de=d+ae;if(d<j){var te=a-j,pe=Math.min(j,de);for(te+d<0&&ui(3);d<pe;++d)i[d]=r[te+d]}for(;d<de;++d)i[d]=i[d-j]}}t.l=p,t.p=ie,t.b=d,t.f=h,p&&(h=1,t.m=f,t.d=v,t.n=g)}while(!h);return d!=i.length&&s?Cy(i,0,d):i.subarray(0,d)},Py=new ei(0),Dy=function(e,t){return((e[0]&15)!=8||e[0]>>4>7||(e[0]<<8|e[1])%31)&&ui(6,"invalid zlib data"),(e[1]>>5&1)==+!t&&ui(6,"invalid zlib data: "+(e[1]&32?"need":"unexpected")+" dictionary"),(e[1]>>3&4)+2};Uy=typeof TextDecoder<"u"&&new TextDecoder,Oy=0;try{Uy.decode(Py,{stream:!0}),Oy=1}catch{}Gy=class extends Wf{constructor(e,t,i,r,n){super();let a=t?t.length-1:0,s=i?i.length:0;this.degree=e,this.knots=t,this.controlPoints=[],this.startKnot=r||0,this.endKnot=n||a;for(let o=0;o<s;++o){let l=i[o];this.controlPoints[o]=new Ye(l.x,l.y,l.z,l.w)}}getPoint(e,t=new P){let i=t,r=this.knots[this.startKnot]+e*(this.knots[this.endKnot]-this.knots[this.startKnot]),n=ky(this.degree,this.knots,this.controlPoints,r);return n.w!==1&&n.divideScalar(n.w),i.set(n.x,n.y,n.z)}getTangent(e,t=new P){let i=t,r=this.knots[0]+e*(this.knots[this.knots.length-1]-this.knots[0]),n=Wy(this.degree,this.knots,this.controlPoints,r,1);return i.copy(n[1]).normalize(),i}toJSON(){let e=super.toJSON();return e.degree=this.degree,e.knots=[...this.knots],e.controlPoints=this.controlPoints.map(t=>t.toArray()),e.startKnot=this.startKnot,e.endKnot=this.endKnot,e}fromJSON(e){return super.fromJSON(e),this.degree=e.degree,this.knots=[...e.knots],this.controlPoints=e.controlPoints.map(t=>new Ye(t[0],t[1],t[2],t[3])),this.startKnot=e.startKnot,this.endKnot=e.endKnot,this}},jy=class extends Vt{constructor(e){super(e)}load(e,t,i,r){let n=this,a=n.path===""?Rr.extractUrlBase(e):n.path,s=new qi(this.manager);s.setPath(n.path),s.setResponseType("arraybuffer"),s.setRequestHeader(n.requestHeader),s.setWithCredentials(n.withCredentials),s.load(e,function(o){try{t(n.parse(o,a))}catch(l){r?r(l):console.error(l),n.manager.itemError(e)}},i,r)}parse(e,t){if(Zy(e))Ge=new Ky().parse(e);else{let r=sd(e);if(!Jy(r))throw new Error("THREE.FBXLoader: Unknown format.");if(zh(r)<7e3)throw new Error("THREE.FBXLoader: FBX version not supported, FileVersion: "+zh(r));Ge=new $y().parse(r)}let i=new Ol(this.manager).setPath(this.resourcePath||t).setCrossOrigin(this.crossOrigin);return new Xy(i,this.manager).parse(Ge)}},Xy=class{constructor(e,t){this.textureLoader=e,this.manager=t}parse(){_t=this.parseConnections();let e=this.parseImages(),t=this.parseTextures(e),i=this.parseMaterials(t),r=this.parseDeformers(),n=new qy().parse(r);return this.parseScene(r,n,i),Ft}parseConnections(){let e=new Map;return"Connections"in Ge&&Ge.Connections.connections.forEach(function(t){let i=t[0],r=t[1],n=t[2];e.has(i)||e.set(i,{parents:[],children:[]});let a={ID:r,relationship:n};e.get(i).parents.push(a),e.has(r)||e.set(r,{parents:[],children:[]});let s={ID:i,relationship:n};e.get(r).children.push(s)}),e}parseImages(){let e={},t={};if("Video"in Ge.Objects){let i=Ge.Objects.Video;for(let r in i){let n=i[r],a=parseInt(r);if(e[a]=n.RelativeFilename||n.Filename,"Content"in n){let s=n.Content instanceof ArrayBuffer&&n.Content.byteLength>0,o=typeof n.Content=="string"&&n.Content!=="";if(s||o){let l=this.parseImage(i[r]);t[n.RelativeFilename||n.Filename]=l}}}}for(let i in e){let r=e[i];t[r]!==void 0?e[i]=t[r]:e[i]=e[i].split("\\").pop()}return e}parseImage(e){let t=e.Content,i=e.RelativeFilename||e.Filename,r=i.slice(i.lastIndexOf(".")+1).toLowerCase(),n;switch(r){case"bmp":n="image/bmp";break;case"jpg":case"jpeg":n="image/jpeg";break;case"png":n="image/png";break;case"tif":n="image/tiff";break;case"tga":this.manager.getHandler(".tga")===null&&console.warn("FBXLoader: TGA loader not found, skipping ",i),n="image/tga";break;case"webp":n="image/webp";break;default:console.warn('FBXLoader: Image type "'+r+'" is not supported.');return}if(typeof t=="string")return"data:"+n+";base64,"+t;{let a=new Uint8Array(t);return window.URL.createObjectURL(new Blob([a],{type:n}))}}parseTextures(e){let t=new Map;if("Texture"in Ge.Objects){let i=Ge.Objects.Texture;for(let r in i){let n=this.parseTexture(i[r],e);t.set(parseInt(r),n)}}return t}parseTexture(e,t){let i=this.loadTexture(e,t);i.ID=e.id,i.name=e.attrName;let r=e.WrapModeU,n=e.WrapModeV,a=r!==void 0?r.value:0,s=n!==void 0?n.value:0;if(i.wrapS=a===0?ji:ti,i.wrapT=s===0?ji:ti,"Scaling"in e){let o=e.Scaling.value;i.repeat.x=o[0],i.repeat.y=o[1]}if("Translation"in e){let o=e.Translation.value;i.offset.x=o[0],i.offset.y=o[1]}return i}loadTexture(e,t){let i=e.FileName.split(".").pop().toLowerCase(),r=this.manager.getHandler(`.${i}`);r===null&&(r=this.textureLoader);let n=r.path;n||r.setPath(this.textureLoader.path);let a=_t.get(e.id).children,s;if(a!==void 0&&a.length>0&&t[a[0].ID]!==void 0&&(s=t[a[0].ID],(s.indexOf("blob:")===0||s.indexOf("data:")===0)&&r.setPath(void 0)),s===void 0)return console.warn("FBXLoader: Undefined filename, creating placeholder texture."),new Ht;let o=r.load(s);return r.setPath(n),o}parseMaterials(e){let t=new Map;if("Material"in Ge.Objects){let i=Ge.Objects.Material;for(let r in i){let n=this.parseMaterial(i[r],e);n!==null&&t.set(parseInt(r),n)}}return t}parseMaterial(e,t){let i=e.id,r=e.attrName,n=e.ShadingModel;if(typeof n=="object"&&(n=n.value),!_t.has(i))return null;let a=this.parseParameters(e,t,i),s;switch(n.toLowerCase()){case"phong":s=new nn;break;case"lambert":s=new Nu;break;default:console.warn('THREE.FBXLoader: unknown material type "%s". Defaulting to MeshPhongMaterial.',n),s=new nn;break}return s.setValues(a),s.name=r,s}parseParameters(e,t,i){let r={};e.BumpFactor&&(r.bumpScale=e.BumpFactor.value),e.Diffuse?r.color=ke.colorSpaceToWorking(new _e().fromArray(e.Diffuse.value),je):e.DiffuseColor&&(e.DiffuseColor.type==="Color"||e.DiffuseColor.type==="ColorRGB")&&(r.color=ke.colorSpaceToWorking(new _e().fromArray(e.DiffuseColor.value),je)),e.DisplacementFactor&&(r.displacementScale=e.DisplacementFactor.value),e.Emissive?r.emissive=ke.colorSpaceToWorking(new _e().fromArray(e.Emissive.value),je):e.EmissiveColor&&(e.EmissiveColor.type==="Color"||e.EmissiveColor.type==="ColorRGB")&&(r.emissive=ke.colorSpaceToWorking(new _e().fromArray(e.EmissiveColor.value),je)),e.EmissiveFactor&&(r.emissiveIntensity=parseFloat(e.EmissiveFactor.value)),r.opacity=1-(e.TransparencyFactor?parseFloat(e.TransparencyFactor.value):0),(r.opacity===1||r.opacity===0)&&(r.opacity=e.Opacity?parseFloat(e.Opacity.value):null,r.opacity===null&&(r.opacity=1-(e.TransparentColor?parseFloat(e.TransparentColor.value[0]):0))),r.opacity<1&&(r.transparent=!0),e.ReflectionFactor&&(r.reflectivity=e.ReflectionFactor.value),e.Shininess&&(r.shininess=e.Shininess.value),e.Specular?r.specular=ke.colorSpaceToWorking(new _e().fromArray(e.Specular.value),je):e.SpecularColor&&e.SpecularColor.type==="Color"&&(r.specular=ke.colorSpaceToWorking(new _e().fromArray(e.SpecularColor.value),je));let n=this;return _t.get(i).children.forEach(function(a){let s=a.relationship;switch(s){case"Bump":r.bumpMap=n.getTexture(t,a.ID);break;case"Maya|TEX_ao_map":r.aoMap=n.getTexture(t,a.ID);break;case"DiffuseColor":case"Maya|TEX_color_map":r.map=n.getTexture(t,a.ID),r.map!==void 0&&(r.map.colorSpace=je);break;case"DisplacementColor":r.displacementMap=n.getTexture(t,a.ID);break;case"EmissiveColor":r.emissiveMap=n.getTexture(t,a.ID),r.emissiveMap!==void 0&&(r.emissiveMap.colorSpace=je);break;case"NormalMap":case"Maya|TEX_normal_map":r.normalMap=n.getTexture(t,a.ID);break;case"ReflectionColor":r.envMap=n.getTexture(t,a.ID),r.envMap!==void 0&&(r.envMap.mapping=ts,r.envMap.colorSpace=je);break;case"SpecularColor":r.specularMap=n.getTexture(t,a.ID),r.specularMap!==void 0&&(r.specularMap.colorSpace=je);break;case"TransparentColor":case"TransparencyFactor":r.alphaMap=n.getTexture(t,a.ID),r.transparent=!0;break;case"AmbientColor":case"ShininessExponent":case"SpecularFactor":case"VectorDisplacementColor":default:console.warn("THREE.FBXLoader: %s map is not supported in three.js, skipping texture.",s);break}}),r}getTexture(e,t){return"LayeredTexture"in Ge.Objects&&t in Ge.Objects.LayeredTexture&&(console.warn("THREE.FBXLoader: layered textures are not supported in three.js. Discarding all but first layer."),t=_t.get(t).children[0].ID),e.get(t)}parseDeformers(){let e={},t={};if("Deformer"in Ge.Objects){let i=Ge.Objects.Deformer;for(let r in i){let n=i[r],a=_t.get(parseInt(r));if(n.attrType==="Skin"){let s=this.parseSkeleton(a,i);s.ID=r,a.parents.length>1&&console.warn("THREE.FBXLoader: skeleton attached to more than one geometry is not supported."),s.geometryID=a.parents[0].ID,e[r]=s}else if(n.attrType==="BlendShape"){let s={id:r};s.rawTargets=this.parseMorphTargets(a,i),s.id=r,a.parents.length>1&&console.warn("THREE.FBXLoader: morph target attached to more than one geometry is not supported."),t[r]=s}}}return{skeletons:e,morphTargets:t}}parseSkeleton(e,t){let i=[];return e.children.forEach(function(r){let n=t[r.ID];if(n.attrType!=="Cluster")return;let a={ID:r.ID,indices:[],weights:[],transformLink:new we().fromArray(n.TransformLink.a)};"Indexes"in n&&(a.indices=n.Indexes.a,a.weights=n.Weights.a),i.push(a)}),{rawBones:i,bones:[]}}parseMorphTargets(e,t){let i=[];for(let r=0;r<e.children.length;r++){let n=e.children[r],a=t[n.ID],s={name:a.attrName,initialWeight:a.DeformPercent,id:a.id,fullWeights:a.FullWeights.a};if(a.attrType!=="BlendShapeChannel")return;s.geoID=_t.get(parseInt(n.ID)).children.filter(function(o){return o.relationship===void 0})[0].ID,i.push(s)}return i}parseScene(e,t,i){Ft=new mi;let r=this.parseModels(e.skeletons,t,i),n=Ge.Objects.Model,a=this;r.forEach(function(o){let l=n[o.ID];a.setLookAtProperties(o,l),_t.get(o.ID).parents.forEach(function(c){let h=r.get(c.ID);h!==void 0&&h.add(o)}),o.parent===null&&Ft.add(o)}),this.bindSkeleton(e.skeletons,t,r),this.addGlobalSceneSettings(),Ft.traverse(function(o){if(o.userData.transformData){o.parent&&(o.userData.transformData.parentMatrix=o.parent.matrix,o.userData.transformData.parentMatrixWorld=o.parent.matrixWorld);let l=ad(o.userData.transformData);o.applyMatrix4(l),o.updateWorldMatrix()}});let s=new Yy().parse();Ft.children.length===1&&Ft.children[0].isGroup&&(Ft.children[0].animations=s,Ft=Ft.children[0]),Ft.animations=s}parseModels(e,t,i){let r=new Map,n=Ge.Objects.Model;for(let a in n){let s=parseInt(a),o=n[a],l=_t.get(s),c=this.buildSkeleton(l,e,s,o.attrName);if(!c){switch(o.attrType){case"Camera":c=this.createCamera(l);break;case"Light":c=this.createLight(l);break;case"Mesh":c=this.createMesh(l,t,i);break;case"NurbsCurve":c=this.createCurve(l,t);break;case"LimbNode":case"Root":c=new $n;break;case"Null":default:c=new mi;break}c.name=o.attrName?at.sanitizeNodeName(o.attrName):"",c.userData.originalName=o.attrName,c.ID=s}this.getTransformData(c,o),r.set(s,c)}return r}buildSkeleton(e,t,i,r){let n=null;return e.parents.forEach(function(a){for(let s in t){let o=t[s];o.rawBones.forEach(function(l,c){if(l.ID===a.ID){let h=n;n=new $n,n.matrixWorld.copy(l.transformLink),n.name=r?at.sanitizeNodeName(r):"",n.userData.originalName=r,n.ID=i,o.bones[c]=n,h!==null&&n.add(h)}})}}),n}createCamera(e){let t,i;if(e.children.forEach(function(r){let n=Ge.Objects.NodeAttribute[r.ID];n!==void 0&&(i=n)}),i===void 0)t=new dt;else{let r=0;i.CameraProjectionType!==void 0&&i.CameraProjectionType.value===1&&(r=1);let n=1;i.NearPlane!==void 0&&(n=i.NearPlane.value/1e3);let a=1e3;i.FarPlane!==void 0&&(a=i.FarPlane.value/1e3);let s=window.innerWidth,o=window.innerHeight;i.AspectWidth!==void 0&&i.AspectHeight!==void 0&&(s=i.AspectWidth.value,o=i.AspectHeight.value);let l=s/o,c=45;i.FieldOfView!==void 0&&(c=i.FieldOfView.value);let h=i.FocalLength?i.FocalLength.value:null;switch(r){case 0:t=new Dt(c,l,n,a),h!==null&&t.setFocalLength(h);break;case 1:console.warn("THREE.FBXLoader: Orthographic cameras not supported yet."),t=new dt;break;default:console.warn("THREE.FBXLoader: Unknown camera type "+r+"."),t=new dt;break}}return t}createLight(e){let t,i;if(e.children.forEach(function(r){let n=Ge.Objects.NodeAttribute[r.ID];n!==void 0&&(i=n)}),i===void 0)t=new dt;else{let r;i.LightType===void 0?r=0:r=i.LightType.value;let n=16777215;i.Color!==void 0&&(n=ke.colorSpaceToWorking(new _e().fromArray(i.Color.value),je));let a=i.Intensity===void 0?1:i.Intensity.value/100;i.CastLightOnObject!==void 0&&i.CastLightOnObject.value===0&&(a=0);let s=0;i.FarAttenuationEnd!==void 0&&(i.EnableFarAttenuation!==void 0&&i.EnableFarAttenuation.value===0?s=0:s=i.FarAttenuationEnd.value);let o=1;switch(r){case 0:t=new cs(n,a,s,o);break;case 1:t=new Bl(n,a);break;case 2:let l=Math.PI/3;i.InnerAngle!==void 0&&(l=Rt.degToRad(i.InnerAngle.value));let c=0;i.OuterAngle!==void 0&&(c=Rt.degToRad(i.OuterAngle.value),c=Math.max(c,1)),t=new zu(n,a,s,l,c,o);break;default:console.warn("THREE.FBXLoader: Unknown light type "+i.LightType.value+", defaulting to a PointLight."),t=new cs(n,a);break}i.CastShadows!==void 0&&i.CastShadows.value===1&&(t.castShadow=!0)}return t}createMesh(e,t,i){let r,n=null,a=null,s=[];if(e.children.forEach(function(o){t.has(o.ID)&&(n=t.get(o.ID)),i.has(o.ID)&&s.push(i.get(o.ID))}),s.length>1?a=s:s.length>0?a=s[0]:(a=new nn({name:Vt.DEFAULT_MATERIAL_NAME,color:13421772}),s.push(a)),"color"in n.attributes&&s.forEach(function(o){o.vertexColors=!0}),n.groups.length>0){let o=!1;for(let l=0,c=n.groups.length;l<c;l++){let h=n.groups[l];(h.materialIndex<0||h.materialIndex>=s.length)&&(h.materialIndex=s.length,o=!0)}if(o){let l=new nn;s.push(l)}}return n.FBX_Deformer?(r=new wu(n,a),r.normalizeSkinWeights()):r=new pt(n,a),r}createCurve(e,t){let i=e.children.reduce(function(n,a){return t.has(a.ID)&&(n=t.get(a.ID)),n},null),r=new Ar({name:Vt.DEFAULT_MATERIAL_NAME,color:3342591,linewidth:1});return new fs(i,r)}getTransformData(e,t){let i={};"InheritType"in t&&(i.inheritType=parseInt(t.InheritType.value)),"RotationOrder"in t?i.eulerOrder=ea(t.RotationOrder.value):i.eulerOrder=ea(0),"Lcl_Translation"in t&&(i.translation=t.Lcl_Translation.value),"PreRotation"in t&&(i.preRotation=t.PreRotation.value),"Lcl_Rotation"in t&&(i.rotation=t.Lcl_Rotation.value),"PostRotation"in t&&(i.postRotation=t.PostRotation.value),"Lcl_Scaling"in t&&(i.scale=t.Lcl_Scaling.value),"ScalingOffset"in t&&(i.scalingOffset=t.ScalingOffset.value),"ScalingPivot"in t&&(i.scalingPivot=t.ScalingPivot.value),"RotationOffset"in t&&(i.rotationOffset=t.RotationOffset.value),"RotationPivot"in t&&(i.rotationPivot=t.RotationPivot.value),e.userData.transformData=i}setLookAtProperties(e,t){"LookAtProperty"in t&&_t.get(e.ID).children.forEach(function(i){if(i.relationship==="LookAtProperty"){let r=Ge.Objects.Model[i.ID];if("Lcl_Translation"in r){let n=r.Lcl_Translation.value;e.target!==void 0?(e.target.position.fromArray(n),Ft.add(e.target)):e.lookAt(new P().fromArray(n))}}})}bindSkeleton(e,t,i){let r=this.parsePoseNodes();for(let n in e){let a=e[n];_t.get(parseInt(a.ID)).parents.forEach(function(s){if(t.has(s.ID)){let o=s.ID;_t.get(o).parents.forEach(function(l){i.has(l.ID)&&i.get(l.ID).bind(new Nl(a.bones),r[l.ID])})}})}}parsePoseNodes(){let e={};if("Pose"in Ge.Objects){let t=Ge.Objects.Pose;for(let i in t)if(t[i].attrType==="BindPose"&&t[i].NbPoseNodes>0){let r=t[i].PoseNode;Array.isArray(r)?r.forEach(function(n){e[n.Node]=new we().fromArray(n.Matrix.a)}):e[r.Node]=new we().fromArray(r.Matrix.a)}}return e}addGlobalSceneSettings(){if("GlobalSettings"in Ge){if("AmbientColor"in Ge.GlobalSettings){let e=Ge.GlobalSettings.AmbientColor.value,t=e[0],i=e[1],r=e[2];if(t!==0||i!==0||r!==0){let n=new _e().setRGB(t,i,r,je);Ft.add(new Em(n,1))}}"UnitScaleFactor"in Ge.GlobalSettings&&(Ft.userData.unitScaleFactor=Ge.GlobalSettings.UnitScaleFactor.value)}}},qy=class{constructor(){this.negativeMaterialIndices=!1}parse(e){let t=new Map;if("Geometry"in Ge.Objects){let i=Ge.Objects.Geometry;for(let r in i){let n=_t.get(parseInt(r)),a=this.parseGeometry(n,i[r],e);t.set(parseInt(r),a)}}return this.negativeMaterialIndices===!0&&console.warn("THREE.FBXLoader: The FBX file contains invalid (negative) material indices. The asset might not render as expected."),t}parseGeometry(e,t,i){switch(t.attrType){case"Mesh":return this.parseMeshGeometry(e,t,i);case"NurbsCurve":return this.parseNurbsGeometry(t)}}parseMeshGeometry(e,t,i){let r=i.skeletons,n=[],a=e.parents.map(function(h){return Ge.Objects.Model[h.ID]});if(a.length===0)return;let s=e.children.reduce(function(h,u){return r[u.ID]!==void 0&&(h=r[u.ID]),h},null);e.children.forEach(function(h){i.morphTargets[h.ID]!==void 0&&n.push(i.morphTargets[h.ID])});let o=a[0],l={};"RotationOrder"in o&&(l.eulerOrder=ea(o.RotationOrder.value)),"InheritType"in o&&(l.inheritType=parseInt(o.InheritType.value)),"GeometricTranslation"in o&&(l.translation=o.GeometricTranslation.value),"GeometricRotation"in o&&(l.rotation=o.GeometricRotation.value),"GeometricScaling"in o&&(l.scale=o.GeometricScaling.value);let c=ad(l);return this.genGeometry(t,s,n,c)}genGeometry(e,t,i,r){let n=new It;e.attrName&&(n.name=e.attrName);let a=this.parseGeoNode(e,t),s=this.genBuffers(a),o=new Ze(s.vertex,3);if(o.applyMatrix4(r),n.setAttribute("position",o),s.colors.length>0&&n.setAttribute("color",new Ze(s.colors,3)),t&&(n.setAttribute("skinIndex",new Pl(s.weightsIndices,4)),n.setAttribute("skinWeight",new Ze(s.vertexWeights,4)),n.FBX_Deformer=t),s.normal.length>0){let l=new Ve().getNormalMatrix(r),c=new Ze(s.normal,3);c.applyNormalMatrix(l),n.setAttribute("normal",c)}if(s.uvs.forEach(function(l,c){let h=c===0?"uv":`uv${c}`;n.setAttribute(h,new Ze(s.uvs[c],2))}),a.material&&a.material.mappingType!=="AllSame"){let l=s.materialIndex[0],c=0;if(s.materialIndex.forEach(function(h,u){h!==l&&(n.addGroup(c,u-c,l),l=h,c=u)}),n.groups.length>0){let h=n.groups[n.groups.length-1],u=h.start+h.count;u!==s.materialIndex.length&&n.addGroup(u,s.materialIndex.length-u,l)}n.groups.length===0&&n.addGroup(0,s.materialIndex.length,s.materialIndex[0])}return this.addMorphTargets(n,e,i,r),n}parseGeoNode(e,t){let i={};if(i.vertexPositions=e.Vertices!==void 0?e.Vertices.a:[],i.vertexIndices=e.PolygonVertexIndex!==void 0?e.PolygonVertexIndex.a:[],e.LayerElementColor&&e.LayerElementColor[0].Colors&&(i.color=this.parseVertexColors(e.LayerElementColor[0])),e.LayerElementMaterial&&(i.material=this.parseMaterialIndices(e.LayerElementMaterial[0])),e.LayerElementNormal&&(i.normal=this.parseNormals(e.LayerElementNormal[0])),e.LayerElementUV){i.uv=[];let r=0;for(;e.LayerElementUV[r];)e.LayerElementUV[r].UV&&i.uv.push(this.parseUVs(e.LayerElementUV[r])),r++}return i.weightTable={},t!==null&&(i.skeleton=t,t.rawBones.forEach(function(r,n){r.indices.forEach(function(a,s){i.weightTable[a]===void 0&&(i.weightTable[a]=[]),i.weightTable[a].push({id:n,weight:r.weights[s]})})})),i}genBuffers(e){let t={vertex:[],normal:[],colors:[],uvs:[],materialIndex:[],vertexWeights:[],weightsIndices:[]},i=0,r=0,n=!1,a=[],s=[],o=[],l=[],c=[],h=[],u=this;return e.vertexIndices.forEach(function(d,p){let v,f=!1;d<0&&(d=d^-1,f=!0);let g=[],m=[];if(a.push(d*3,d*3+1,d*3+2),e.color){let y=ja(p,i,d,e.color);o.push(y[0],y[1],y[2])}if(e.skeleton){if(e.weightTable[d]!==void 0&&e.weightTable[d].forEach(function(y){m.push(y.weight),g.push(y.id)}),m.length>4){n||(console.warn("THREE.FBXLoader: Vertex has more than 4 skinning weights assigned to vertex. Deleting additional weights."),n=!0);let y=[0,0,0,0],x=[0,0,0,0];m.forEach(function(_,S){let E=_,A=g[S];x.forEach(function(C,b,w){if(E>C){w[b]=E,E=C;let R=y[b];y[b]=A,A=R}})}),g=y,m=x}for(;m.length<4;)m.push(0),g.push(0);for(let y=0;y<4;++y)c.push(m[y]),h.push(g[y])}if(e.normal){let y=ja(p,i,d,e.normal);s.push(y[0],y[1],y[2])}e.material&&e.material.mappingType!=="AllSame"&&(v=ja(p,i,d,e.material)[0],v<0&&(u.negativeMaterialIndices=!0,v=0)),e.uv&&e.uv.forEach(function(y,x){let _=ja(p,i,d,y);l[x]===void 0&&(l[x]=[]),l[x].push(_[0]),l[x].push(_[1])}),r++,f&&(u.genFace(t,e,a,v,s,o,l,c,h,r),i++,r=0,a=[],s=[],o=[],l=[],c=[],h=[])}),t}getNormalNewell(e){let t=new P(0,0,0);for(let i=0;i<e.length;i++){let r=e[i],n=e[(i+1)%e.length];t.x+=(r.y-n.y)*(r.z+n.z),t.y+=(r.z-n.z)*(r.x+n.x),t.z+=(r.x-n.x)*(r.y+n.y)}return t.normalize(),t}getNormalTangentAndBitangent(e){let t=this.getNormalNewell(e),i=(Math.abs(t.z)>.5?new P(0,1,0):new P(0,0,1)).cross(t).normalize(),r=t.clone().cross(i).normalize();return{normal:t,tangent:i,bitangent:r}}flattenVertex(e,t,i){return new De(e.dot(t),e.dot(i))}genFace(e,t,i,r,n,a,s,o,l,c){let h;if(c>3){let u=[],d=t.baseVertexPositions||t.vertexPositions;for(let g=0;g<i.length;g+=3)u.push(new P(d[i[g]],d[i[g+1]],d[i[g+2]]));let{tangent:p,bitangent:v}=this.getNormalTangentAndBitangent(u),f=[];for(let g of u)f.push(this.flattenVertex(g,p,v));h=lm.triangulateShape(f,[])}else h=[[0,1,2]];for(let[u,d,p]of h)e.vertex.push(t.vertexPositions[i[u*3]]),e.vertex.push(t.vertexPositions[i[u*3+1]]),e.vertex.push(t.vertexPositions[i[u*3+2]]),e.vertex.push(t.vertexPositions[i[d*3]]),e.vertex.push(t.vertexPositions[i[d*3+1]]),e.vertex.push(t.vertexPositions[i[d*3+2]]),e.vertex.push(t.vertexPositions[i[p*3]]),e.vertex.push(t.vertexPositions[i[p*3+1]]),e.vertex.push(t.vertexPositions[i[p*3+2]]),t.skeleton&&(e.vertexWeights.push(o[u*4]),e.vertexWeights.push(o[u*4+1]),e.vertexWeights.push(o[u*4+2]),e.vertexWeights.push(o[u*4+3]),e.vertexWeights.push(o[d*4]),e.vertexWeights.push(o[d*4+1]),e.vertexWeights.push(o[d*4+2]),e.vertexWeights.push(o[d*4+3]),e.vertexWeights.push(o[p*4]),e.vertexWeights.push(o[p*4+1]),e.vertexWeights.push(o[p*4+2]),e.vertexWeights.push(o[p*4+3]),e.weightsIndices.push(l[u*4]),e.weightsIndices.push(l[u*4+1]),e.weightsIndices.push(l[u*4+2]),e.weightsIndices.push(l[u*4+3]),e.weightsIndices.push(l[d*4]),e.weightsIndices.push(l[d*4+1]),e.weightsIndices.push(l[d*4+2]),e.weightsIndices.push(l[d*4+3]),e.weightsIndices.push(l[p*4]),e.weightsIndices.push(l[p*4+1]),e.weightsIndices.push(l[p*4+2]),e.weightsIndices.push(l[p*4+3])),t.color&&(e.colors.push(a[u*3]),e.colors.push(a[u*3+1]),e.colors.push(a[u*3+2]),e.colors.push(a[d*3]),e.colors.push(a[d*3+1]),e.colors.push(a[d*3+2]),e.colors.push(a[p*3]),e.colors.push(a[p*3+1]),e.colors.push(a[p*3+2])),t.material&&t.material.mappingType!=="AllSame"&&(e.materialIndex.push(r),e.materialIndex.push(r),e.materialIndex.push(r)),t.normal&&(e.normal.push(n[u*3]),e.normal.push(n[u*3+1]),e.normal.push(n[u*3+2]),e.normal.push(n[d*3]),e.normal.push(n[d*3+1]),e.normal.push(n[d*3+2]),e.normal.push(n[p*3]),e.normal.push(n[p*3+1]),e.normal.push(n[p*3+2])),t.uv&&t.uv.forEach(function(v,f){e.uvs[f]===void 0&&(e.uvs[f]=[]),e.uvs[f].push(s[f][u*2]),e.uvs[f].push(s[f][u*2+1]),e.uvs[f].push(s[f][d*2]),e.uvs[f].push(s[f][d*2+1]),e.uvs[f].push(s[f][p*2]),e.uvs[f].push(s[f][p*2+1])})}addMorphTargets(e,t,i,r){if(i.length===0)return;e.morphTargetsRelative=!0,e.morphAttributes.position=[];let n=this;i.forEach(function(a){a.rawTargets.forEach(function(s){let o=Ge.Objects.Geometry[s.geoID];o!==void 0&&n.genMorphGeometry(e,t,o,r,s.name)})})}genMorphGeometry(e,t,i,r,n){let a=t.Vertices!==void 0?t.Vertices.a:[],s=t.PolygonVertexIndex!==void 0?t.PolygonVertexIndex.a:[],o=i.Vertices!==void 0?i.Vertices.a:[],l=i.Indexes!==void 0?i.Indexes.a:[],c=e.attributes.position.count*3,h=new Float32Array(c);for(let v=0;v<l.length;v++){let f=l[v]*3;h[f]=o[v*3],h[f+1]=o[v*3+1],h[f+2]=o[v*3+2]}let u={vertexIndices:s,vertexPositions:h,baseVertexPositions:a},d=this.genBuffers(u),p=new Ze(d.vertex,3);p.name=n||i.attrName,p.applyMatrix4(r),e.morphAttributes.position.push(p)}parseNormals(e){let t=e.MappingInformationType,i=e.ReferenceInformationType,r=e.Normals.a,n=[];return i==="IndexToDirect"&&("NormalIndex"in e?n=e.NormalIndex.a:"NormalsIndex"in e&&(n=e.NormalsIndex.a)),{dataSize:3,buffer:r,indices:n,mappingType:t,referenceType:i}}parseUVs(e){let t=e.MappingInformationType,i=e.ReferenceInformationType,r=e.UV.a,n=[];return i==="IndexToDirect"&&(n=e.UVIndex.a),{dataSize:2,buffer:r,indices:n,mappingType:t,referenceType:i}}parseVertexColors(e){let t=e.MappingInformationType,i=e.ReferenceInformationType,r=e.Colors.a,n=[];i==="IndexToDirect"&&(n=e.ColorIndex.a);for(let a=0,s=new _e;a<r.length;a+=4)s.fromArray(r,a),ke.colorSpaceToWorking(s,je),s.toArray(r,a);return{dataSize:4,buffer:r,indices:n,mappingType:t,referenceType:i}}parseMaterialIndices(e){let t=e.MappingInformationType,i=e.ReferenceInformationType;if(t==="NoMappingInformation")return{dataSize:1,buffer:[0],indices:[0],mappingType:"AllSame",referenceType:i};let r=e.Materials.a,n=[];for(let a=0;a<r.length;++a)n.push(a);return{dataSize:1,buffer:r,indices:n,mappingType:t,referenceType:i}}parseNurbsGeometry(e){let t=parseInt(e.Order);if(isNaN(t))return console.error("THREE.FBXLoader: Invalid Order %s given for geometry ID: %s",e.Order,e.id),new It;let i=t-1,r=e.KnotVector.a,n=[],a=e.Points.a;for(let c=0,h=a.length;c<h;c+=4)n.push(new Ye().fromArray(a,c));let s,o;if(e.Form==="Closed")n.push(n[0]);else if(e.Form==="Periodic"){s=i,o=r.length-1-s;for(let c=0;c<i;++c)n.push(n[c])}let l=new Gy(i,r,n,s,o).getPoints(n.length*12);return new It().setFromPoints(l)}},Yy=class{parse(){let e=[],t=this.parseClips();if(t!==void 0)for(let i in t){let r=t[i],n=this.addClip(r);e.push(n)}return e}parseClips(){if(Ge.Objects.AnimationCurve===void 0)return;let e=this.parseAnimationCurveNodes();this.parseAnimationCurves(e);let t=this.parseAnimationLayers(e);return this.parseAnimStacks(t)}parseAnimationCurveNodes(){let e=Ge.Objects.AnimationCurveNode,t=new Map;for(let i in e){let r=e[i];if(r.attrName.match(/S|R|T|DeformPercent/)!==null){let n={id:r.id,attr:r.attrName,curves:{}};t.set(n.id,n)}}return t}parseAnimationCurves(e){let t=Ge.Objects.AnimationCurve;for(let i in t){let r={id:t[i].id,times:t[i].KeyTime.a.map(Qy),values:t[i].KeyValueFloat.a},n=_t.get(r.id);if(n!==void 0){let a=n.parents[0].ID,s=n.parents[0].relationship;s.match(/X/)?e.get(a).curves.x=r:s.match(/Y/)?e.get(a).curves.y=r:s.match(/Z/)?e.get(a).curves.z=r:s.match(/DeformPercent/)&&e.has(a)&&(e.get(a).curves.morph=r)}}}parseAnimationLayers(e){let t=Ge.Objects.AnimationLayer,i=new Map;for(let r in t){let n=[],a=_t.get(parseInt(r));a!==void 0&&(a.children.forEach(function(s,o){if(e.has(s.ID)){let l=e.get(s.ID);if(l.curves.x!==void 0||l.curves.y!==void 0||l.curves.z!==void 0){if(n[o]===void 0){let c=_t.get(s.ID).parents.filter(function(h){return h.relationship!==void 0})[0].ID;if(c!==void 0){let h=Ge.Objects.Model[c.toString()];if(h===void 0){console.warn("THREE.FBXLoader: Encountered a unused curve.",s);return}let u={modelName:h.attrName?at.sanitizeNodeName(h.attrName):"",ID:h.id,initialPosition:[0,0,0],initialRotation:[0,0,0],initialScale:[1,1,1]};Ft.traverse(function(d){d.ID===h.id&&(u.transform=d.matrix,d.userData.transformData&&(u.eulerOrder=d.userData.transformData.eulerOrder))}),u.transform||(u.transform=new we),"PreRotation"in h&&(u.preRotation=h.PreRotation.value),"PostRotation"in h&&(u.postRotation=h.PostRotation.value),n[o]=u}}n[o]&&(n[o][l.attr]=l)}else if(l.curves.morph!==void 0){if(n[o]===void 0){let c=_t.get(s.ID).parents.filter(function(f){return f.relationship!==void 0})[0].ID,h=_t.get(c).parents[0].ID,u=_t.get(h).parents[0].ID,d=_t.get(u).parents[0].ID,p=Ge.Objects.Model[d],v={modelName:p.attrName?at.sanitizeNodeName(p.attrName):"",morphName:Ge.Objects.Deformer[c].attrName};n[o]=v}n[o][l.attr]=l}}}),i.set(parseInt(r),n))}return i}parseAnimStacks(e){let t=Ge.Objects.AnimationStack,i={};for(let r in t){let n=_t.get(parseInt(r)).children;n.length>1&&console.warn("THREE.FBXLoader: Encountered an animation stack with multiple layers, this is currently not supported. Ignoring subsequent layers.");let a=e.get(n[0].ID);i[r]={name:t[r].attrName,layer:a}}return i}addClip(e){let t=[],i=this;return e.layer.forEach(function(r){t=t.concat(i.generateTracks(r))}),new Qn(e.name,-1,t)}generateTracks(e){let t=[],i=new P,r=new P;if(e.transform&&e.transform.decompose(i,new gt,r),i=i.toArray(),r=r.toArray(),e.T!==void 0&&Object.keys(e.T.curves).length>0){let n=this.generateVectorTrack(e.modelName,e.T.curves,i,"position");n!==void 0&&t.push(n)}if(e.R!==void 0&&Object.keys(e.R.curves).length>0){let n=this.generateRotationTrack(e.modelName,e.R.curves,e.preRotation,e.postRotation,e.eulerOrder);n!==void 0&&t.push(n)}if(e.S!==void 0&&Object.keys(e.S.curves).length>0){let n=this.generateVectorTrack(e.modelName,e.S.curves,r,"scale");n!==void 0&&t.push(n)}if(e.DeformPercent!==void 0){let n=this.generateMorphTrack(e);n!==void 0&&t.push(n)}return t}generateVectorTrack(e,t,i,r){let n=this.getTimesForAllAxes(t),a=this.getKeyframeTrackValues(n,t,i);return new lr(e+"."+r,n,a)}generateRotationTrack(e,t,i,r,n){let a,s;if(t.x!==void 0&&t.y!==void 0&&t.z!==void 0){let u=this.interpolateRotations(t.x,t.y,t.z,n);a=u[0],s=u[1]}let o=ea(0);i!==void 0&&(i=i.map(Rt.degToRad),i.push(o),i=new Ct().fromArray(i),i=new gt().setFromEuler(i)),r!==void 0&&(r=r.map(Rt.degToRad),r.push(o),r=new Ct().fromArray(r),r=new gt().setFromEuler(r).invert());let l=new gt,c=new Ct,h=[];if(!s||!a)return new Xi(e+".quaternion",[0],[0]);for(let u=0;u<s.length;u+=3)c.set(s[u],s[u+1],s[u+2],n),l.setFromEuler(c),i!==void 0&&l.premultiply(i),r!==void 0&&l.multiply(r),u>2&&new gt().fromArray(h,(u-3)/3*4).dot(l)<0&&l.set(-l.x,-l.y,-l.z,-l.w),l.toArray(h,u/3*4);return new Xi(e+".quaternion",a,h)}generateMorphTrack(e){let t=e.DeformPercent.curves.morph,i=t.values.map(function(n){return n/100}),r=Ft.getObjectByName(e.modelName).morphTargetDictionary[e.morphName];return new Pr(e.modelName+".morphTargetInfluences["+r+"]",t.times,i)}getTimesForAllAxes(e){let t=[];if(e.x!==void 0&&(t=t.concat(e.x.times)),e.y!==void 0&&(t=t.concat(e.y.times)),e.z!==void 0&&(t=t.concat(e.z.times)),t=t.sort(function(i,r){return i-r}),t.length>1){let i=1,r=t[0];for(let n=1;n<t.length;n++){let a=t[n];a!==r&&(t[i]=a,r=a,i++)}t=t.slice(0,i)}return t}getKeyframeTrackValues(e,t,i){let r=i,n=[],a=-1,s=-1,o=-1;return e.forEach(function(l){if(t.x&&(a=t.x.times.indexOf(l)),t.y&&(s=t.y.times.indexOf(l)),t.z&&(o=t.z.times.indexOf(l)),a!==-1){let c=t.x.values[a];n.push(c),r[0]=c}else n.push(r[0]);if(s!==-1){let c=t.y.values[s];n.push(c),r[1]=c}else n.push(r[1]);if(o!==-1){let c=t.z.values[o];n.push(c),r[2]=c}else n.push(r[2])}),n}interpolateRotations(e,t,i,r){let n=[],a=[];n.push(e.times[0]),a.push(Rt.degToRad(e.values[0])),a.push(Rt.degToRad(t.values[0])),a.push(Rt.degToRad(i.values[0]));for(let s=1;s<e.values.length;s++){let o=[e.values[s-1],t.values[s-1],i.values[s-1]];if(isNaN(o[0])||isNaN(o[1])||isNaN(o[2]))continue;let l=o.map(Rt.degToRad),c=[e.values[s],t.values[s],i.values[s]];if(isNaN(c[0])||isNaN(c[1])||isNaN(c[2]))continue;let h=c.map(Rt.degToRad),u=[c[0]-o[0],c[1]-o[1],c[2]-o[2]],d=[Math.abs(u[0]),Math.abs(u[1]),Math.abs(u[2])];if(d[0]>=180||d[1]>=180||d[2]>=180){let p=Math.max(...d)/180,v=new Ct(...l,r),f=new Ct(...h,r),g=new gt().setFromEuler(v),m=new gt().setFromEuler(f);g.dot(m)&&m.set(-m.x,-m.y,-m.z,-m.w);let y=e.times[s-1],x=e.times[s]-y,_=new gt,S=new Ct;for(let E=0;E<1;E+=1/p)_.copy(g.clone().slerp(m.clone(),E)),n.push(y+E*x),S.setFromQuaternion(_,r),a.push(S.x),a.push(S.y),a.push(S.z)}else n.push(e.times[s]),a.push(Rt.degToRad(e.values[s])),a.push(Rt.degToRad(t.values[s])),a.push(Rt.degToRad(i.values[s]))}return[n,a]}},$y=class{getPrevNode(){return this.nodeStack[this.currentIndent-2]}getCurrentNode(){return this.nodeStack[this.currentIndent-1]}getCurrentProp(){return this.currentProp}pushStack(e){this.nodeStack.push(e),this.currentIndent+=1}popStack(){this.nodeStack.pop(),this.currentIndent-=1}setCurrentProp(e,t){this.currentProp=e,this.currentPropName=t}parse(e){this.currentIndent=0,this.allNodes=new nd,this.nodeStack=[],this.currentProp=[],this.currentPropName="";let t=this,i=e.split(/[\r\n]+/);return i.forEach(function(r,n){let a=r.match(/^[\s\t]*;/),s=r.match(/^[\s\t]*$/);if(a||s)return;let o=r.match("^\\t{"+t.currentIndent+"}(\\w+):(.*){",""),l=r.match("^\\t{"+t.currentIndent+"}(\\w+):[\\s\\t\\r\\n](.*)"),c=r.match("^\\t{"+(t.currentIndent-1)+"}}");o?t.parseNodeBegin(r,o):l?t.parseNodeProperty(r,l,i[++n]):c?t.popStack():r.match(/^[^\s\t}]/)&&t.parseNodePropertyContinued(r)}),this.allNodes}parseNodeBegin(e,t){let i=t[1].trim().replace(/^"/,"").replace(/"$/,""),r=t[2].split(",").map(function(o){return o.trim().replace(/^"/,"").replace(/"$/,"")}),n={name:i},a=this.parseNodeAttr(r),s=this.getCurrentNode();this.currentIndent===0?this.allNodes.add(i,n):i in s?(i==="PoseNode"?s.PoseNode.push(n):s[i].id!==void 0&&(s[i]={},s[i][s[i].id]=s[i]),a.id!==""&&(s[i][a.id]=n)):typeof a.id=="number"?(s[i]={},s[i][a.id]=n):i!=="Properties70"&&(i==="PoseNode"?s[i]=[n]:s[i]=n),typeof a.id=="number"&&(n.id=a.id),a.name!==""&&(n.attrName=a.name),a.type!==""&&(n.attrType=a.type),this.pushStack(n)}parseNodeAttr(e){let t=e[0];e[0]!==""&&(t=parseInt(e[0]),isNaN(t)&&(t=e[0]));let i="",r="";return e.length>1&&(i=e[1].replace(/^(\w+)::/,""),r=e[2]),{id:t,name:i,type:r}}parseNodeProperty(e,t,i){let r=t[1].replace(/^"/,"").replace(/"$/,"").trim(),n=t[2].replace(/^"/,"").replace(/"$/,"").trim();r==="Content"&&n===","&&(n=i.replace(/"/g,"").replace(/,$/,"").trim());let a=this.getCurrentNode();if(a.name==="Properties70"){this.parseNodeSpecialProperty(e,r,n);return}if(r==="C"){let s=n.split(",").slice(1),o=parseInt(s[0]),l=parseInt(s[1]),c=n.split(",").slice(3);c=c.map(function(h){return h.trim().replace(/^"/,"")}),r="connections",n=[o,l],tb(n,c),a[r]===void 0&&(a[r]=[])}r==="Node"&&(a.id=n),r in a&&Array.isArray(a[r])?a[r].push(n):r!=="a"?a[r]=n:a.a=n,this.setCurrentProp(a,r),r==="a"&&n.slice(-1)!==","&&(a.a=So(n))}parseNodePropertyContinued(e){let t=this.getCurrentNode();t.a+=e,e.slice(-1)!==","&&(t.a=So(t.a))}parseNodeSpecialProperty(e,t,i){let r=i.split('",').map(function(c){return c.trim().replace(/^\"/,"").replace(/\s/,"_")}),n=r[0],a=r[1],s=r[2],o=r[3],l=r[4];switch(a){case"int":case"enum":case"bool":case"ULongLong":case"double":case"Number":case"FieldOfView":l=parseFloat(l);break;case"Color":case"ColorRGB":case"Vector3D":case"Lcl_Translation":case"Lcl_Rotation":case"Lcl_Scaling":l=So(l);break}this.getPrevNode()[n]={type:a,type2:s,flag:o,value:l},this.setCurrentProp(this.getPrevNode(),n)}},Ky=class{parse(e){let t=new Bh(e);t.skip(23);let i=t.getUint32();if(i<6400)throw new Error("THREE.FBXLoader: FBX version not supported, FileVersion: "+i);let r=new nd;for(;!this.endOfContent(t);){let n=this.parseNode(t,i);n!==null&&r.add(n.name,n)}return r}endOfContent(e){return e.size()%16===0?(e.getOffset()+160+16&-16)>=e.size():e.getOffset()+160+16>=e.size()}parseNode(e,t){let i={},r=t>=7500?e.getUint64():e.getUint32(),n=t>=7500?e.getUint64():e.getUint32();t>=7500?e.getUint64():e.getUint32();let a=e.getUint8(),s=e.getString(a);if(r===0)return null;let o=[];for(let u=0;u<n;u++)o.push(this.parseProperty(e));let l=o.length>0?o[0]:"",c=o.length>1?o[1]:"",h=o.length>2?o[2]:"";for(i.singleProperty=n===1&&e.getOffset()===r;r>e.getOffset();){let u=this.parseNode(e,t);u!==null&&this.parseSubNode(s,i,u)}return i.propertyList=o,typeof l=="number"&&(i.id=l),c!==""&&(i.attrName=c),h!==""&&(i.attrType=h),s!==""&&(i.name=s),i}parseSubNode(e,t,i){if(i.singleProperty===!0){let r=i.propertyList[0];Array.isArray(r)?(t[i.name]=i,i.a=r):t[i.name]=r}else if(e==="Connections"&&i.name==="C"){let r=[];i.propertyList.forEach(function(n,a){a!==0&&r.push(n)}),t.connections===void 0&&(t.connections=[]),t.connections.push(r)}else if(i.name==="Properties70")Object.keys(i).forEach(function(r){t[r]=i[r]});else if(e==="Properties70"&&i.name==="P"){let r=i.propertyList[0],n=i.propertyList[1],a=i.propertyList[2],s=i.propertyList[3],o;r.indexOf("Lcl ")===0&&(r=r.replace("Lcl ","Lcl_")),n.indexOf("Lcl ")===0&&(n=n.replace("Lcl ","Lcl_")),n==="Color"||n==="ColorRGB"||n==="Vector"||n==="Vector3D"||n.indexOf("Lcl_")===0?o=[i.propertyList[4],i.propertyList[5],i.propertyList[6]]:o=i.propertyList[4],t[r]={type:n,type2:a,flag:s,value:o}}else t[i.name]===void 0?typeof i.id=="number"?(t[i.name]={},t[i.name][i.id]=i):t[i.name]=i:i.name==="PoseNode"?(Array.isArray(t[i.name])||(t[i.name]=[t[i.name]]),t[i.name].push(i)):t[i.name][i.id]===void 0&&(t[i.name][i.id]=i)}parseProperty(e){let t=e.getString(1),i;switch(t){case"C":return e.getBoolean();case"D":return e.getFloat64();case"F":return e.getFloat32();case"I":return e.getInt32();case"L":return e.getInt64();case"R":return i=e.getUint32(),e.getArrayBuffer(i);case"S":return i=e.getUint32(),e.getString(i);case"Y":return e.getInt16();case"b":case"c":case"d":case"f":case"i":case"l":let r=e.getUint32(),n=e.getUint32(),a=e.getUint32();if(n===0)switch(t){case"b":case"c":return e.getBooleanArray(r);case"d":return e.getFloat64Array(r);case"f":return e.getFloat32Array(r);case"i":return e.getInt32Array(r);case"l":return e.getInt64Array(r)}let s=Ny(new Uint8Array(e.getArrayBuffer(a))),o=new Bh(s.buffer);switch(t){case"b":case"c":return o.getBooleanArray(r);case"d":return o.getFloat64Array(r);case"f":return o.getFloat32Array(r);case"i":return o.getInt32Array(r);case"l":return o.getInt64Array(r)}break;default:throw new Error("THREE.FBXLoader: Unknown property type "+t)}}},Bh=class{constructor(e,t){this.dv=new DataView(e),this.offset=0,this.littleEndian=t!==void 0?t:!0,this._textDecoder=new TextDecoder}getOffset(){return this.offset}size(){return this.dv.buffer.byteLength}skip(e){this.offset+=e}getBoolean(){return(this.getUint8()&1)===1}getBooleanArray(e){let t=[];for(let i=0;i<e;i++)t.push(this.getBoolean());return t}getUint8(){let e=this.dv.getUint8(this.offset);return this.offset+=1,e}getInt16(){let e=this.dv.getInt16(this.offset,this.littleEndian);return this.offset+=2,e}getInt32(){let e=this.dv.getInt32(this.offset,this.littleEndian);return this.offset+=4,e}getInt32Array(e){let t=[];for(let i=0;i<e;i++)t.push(this.getInt32());return t}getUint32(){let e=this.dv.getUint32(this.offset,this.littleEndian);return this.offset+=4,e}getInt64(){let e,t;return this.littleEndian?(e=this.getUint32(),t=this.getUint32()):(t=this.getUint32(),e=this.getUint32()),t&2147483648?(t=~t&4294967295,e=~e&4294967295,e===4294967295&&(t=t+1&4294967295),e=e+1&4294967295,-(t*4294967296+e)):t*4294967296+e}getInt64Array(e){let t=[];for(let i=0;i<e;i++)t.push(this.getInt64());return t}getUint64(){let e,t;return this.littleEndian?(e=this.getUint32(),t=this.getUint32()):(t=this.getUint32(),e=this.getUint32()),t*4294967296+e}getFloat32(){let e=this.dv.getFloat32(this.offset,this.littleEndian);return this.offset+=4,e}getFloat32Array(e){let t=[];for(let i=0;i<e;i++)t.push(this.getFloat32());return t}getFloat64(){let e=this.dv.getFloat64(this.offset,this.littleEndian);return this.offset+=8,e}getFloat64Array(e){let t=[];for(let i=0;i<e;i++)t.push(this.getFloat64());return t}getArrayBuffer(e){let t=this.dv.buffer.slice(this.offset,this.offset+e);return this.offset+=e,t}getString(e){let t=this.offset,i=new Uint8Array(this.dv.buffer,t,e);this.skip(e);let r=i.indexOf(0);return r>=0&&(i=new Uint8Array(this.dv.buffer,t,r)),this._textDecoder.decode(i)}},nd=class{add(e,t){this[e]=t}};eb=[];Mo=new Ct,Zr=new P;rb=/^[og]\s*(.+)?/,nb=/^mtllib /,ab=/^usemtl /,sb=/^usemap /,Hh=/\s+/,Vh=new P,Eo=new P,Wh=new P,Gh=new P,Jt=new P,Xa=new _e;lb=class extends Vt{constructor(e){super(e),this.materials=null}load(e,t,i,r){let n=this,a=new qi(this.manager);a.setPath(this.path),a.setRequestHeader(this.requestHeader),a.setWithCredentials(this.withCredentials),a.load(e,function(s){try{t(n.parse(s))}catch(o){r?r(o):console.error(o),n.manager.itemError(e)}},i,r)}setMaterials(e){return this.materials=e,this}parse(e){let t=new ob;e.indexOf(`\r
`)!==-1&&(e=e.replace(/\r\n/g,`
`)),e.indexOf(`\\
`)!==-1&&(e=e.replace(/\\\n/g,""));let i=e.split(`
`),r=[];for(let a=0,s=i.length;a<s;a++){let o=i[a].trimStart();if(o.length===0)continue;let l=o.charAt(0);if(l!=="#")if(l==="v"){let c=o.split(Hh);switch(c[0]){case"v":t.vertices.push(parseFloat(c[1]),parseFloat(c[2]),parseFloat(c[3])),c.length>=7?(Xa.setRGB(parseFloat(c[4]),parseFloat(c[5]),parseFloat(c[6]),je),t.colors.push(Xa.r,Xa.g,Xa.b)):t.colors.push(void 0,void 0,void 0);break;case"vn":t.normals.push(parseFloat(c[1]),parseFloat(c[2]),parseFloat(c[3]));break;case"vt":t.uvs.push(parseFloat(c[1]),parseFloat(c[2]));break}}else if(l==="f"){let c=o.slice(1).trim().split(Hh),h=[];for(let d=0,p=c.length;d<p;d++){let v=c[d];if(v.length>0){let f=v.split("/");h.push(f)}}let u=h[0];for(let d=1,p=h.length-1;d<p;d++){let v=h[d],f=h[d+1];t.addFace(u[0],v[0],f[0],u[1],v[1],f[1],u[2],v[2],f[2])}}else if(l==="l"){let c=o.substring(1).trim().split(" "),h=[],u=[];if(o.indexOf("/")===-1)h=c;else for(let d=0,p=c.length;d<p;d++){let v=c[d].split("/");v[0]!==""&&h.push(v[0]),v[1]!==""&&u.push(v[1])}t.addLineGeometry(h,u)}else if(l==="p"){let c=o.slice(1).trim().split(" ");t.addPointGeometry(c)}else if((r=rb.exec(o))!==null){let c=(" "+r[0].slice(1).trim()).slice(1);t.startObject(c)}else if(ab.test(o))t.object.startMaterial(o.substring(7).trim(),t.materialLibraries);else if(nb.test(o))t.materialLibraries.push(o.substring(7).trim());else if(sb.test(o))console.warn('THREE.OBJLoader: Rendering identifier "usemap" not supported. Textures must be defined in MTL files.');else if(l==="s"){if(r=o.split(" "),r.length>1){let h=r[1].trim().toLowerCase();t.object.smooth=h!=="0"&&h!=="off"}else t.object.smooth=!0;let c=t.object.currentMaterial();c&&(c.smooth=t.object.smooth)}else{if(o==="\0")continue;console.warn('THREE.OBJLoader: Unexpected line: "'+o+'"')}}t.finalize();let n=new mi;if(n.materialLibraries=[].concat(t.materialLibraries),!(t.objects.length===1&&t.objects[0].geometry.vertices.length===0))for(let a=0,s=t.objects.length;a<s;a++){let o=t.objects[a],l=o.geometry,c=o.materials,h=l.type==="Line",u=l.type==="Points",d=!1;if(l.vertices.length===0)continue;let p=new It;p.setAttribute("position",new Ze(l.vertices,3)),l.normals.length>0&&p.setAttribute("normal",new Ze(l.normals,3)),l.colors.length>0&&(d=!0,p.setAttribute("color",new Ze(l.colors,3))),l.hasUVIndices===!0&&p.setAttribute("uv",new Ze(l.uvs,2));let v=[];for(let g=0,m=c.length;g<m;g++){let y=c[g],x=y.name+"_"+y.smooth+"_"+d,_=t.materials[x];if(this.materials!==null){if(_=this.materials.create(y.name),h&&_&&!(_ instanceof Ar)){let S=new Ar;jt.prototype.copy.call(S,_),S.color.copy(_.color),_=S}else if(u&&_&&!(_ instanceof Er)){let S=new Er({size:10,sizeAttenuation:!1});jt.prototype.copy.call(S,_),S.color.copy(_.color),S.map=_.map,_=S}}_===void 0&&(h?_=new Ar:u?_=new Er({size:1,sizeAttenuation:!1}):_=new nn,_.name=y.name,_.flatShading=!y.smooth,_.vertexColors=d,t.materials[x]=_),v.push(_)}let f;if(v.length>1){for(let g=0,m=c.length;g<m;g++){let y=c[g];p.addGroup(y.groupStart,y.groupCount,g)}h?f=new ls(p,v):u?f=new Bn(p,v):f=new pt(p,v)}else h?f=new ls(p,v[0]):u?f=new Bn(p,v[0]):f=new pt(p,v[0]);f.name=o.name,n.add(f)}else if(t.vertices.length>0){let a=new Er({size:1,sizeAttenuation:!1}),s=new It;s.setAttribute("position",new Ze(t.vertices,3)),t.colors.length>0&&t.colors[0]!==void 0&&(s.setAttribute("color",new Ze(t.colors,3)),a.vertexColors=!0);let o=new Bn(s,a);n.add(o)}return n}},cb=class extends Vt{constructor(e){super(e)}load(e,t,i,r){let n=this,a=this.path===""?Rr.extractUrlBase(e):this.path,s=new qi(this.manager);s.setPath(this.path),s.setRequestHeader(this.requestHeader),s.setWithCredentials(this.withCredentials),s.load(e,function(o){try{t(n.parse(o,a))}catch(l){r?r(l):console.error(l),n.manager.itemError(e)}},i,r)}setMaterialOptions(e){return this.materialOptions=e,this}parse(e,t){let i=e.split(`
`),r={},n=/\s+/,a={};for(let o=0;o<i.length;o++){let l=i[o];if(l=l.trim(),l.length===0||l.charAt(0)==="#")continue;let c=l.indexOf(" "),h=c>=0?l.substring(0,c):l;h=h.toLowerCase();let u=c>=0?l.substring(c+1):"";if(u=u.trim(),h==="newmtl")r={name:u},a[u]=r;else if(h==="ka"||h==="kd"||h==="ks"||h==="ke"){let d=u.split(n,3);r[h]=[parseFloat(d[0]),parseFloat(d[1]),parseFloat(d[2])]}else r[h]=u}let s=new hb(this.resourcePath||t,this.materialOptions);return s.setCrossOrigin(this.crossOrigin),s.setManager(this.manager),s.setMaterials(a),s}},hb=class{constructor(e="",t={}){this.baseUrl=e,this.options=t,this.materialsInfo={},this.materials={},this.materialsArray=[],this.nameLookup={},this.crossOrigin="anonymous",this.side=this.options.side!==void 0?this.options.side:Ai,this.wrap=this.options.wrap!==void 0?this.options.wrap:ji}setCrossOrigin(e){return this.crossOrigin=e,this}setManager(e){this.manager=e}setMaterials(e){this.materialsInfo=this.convert(e),this.materials={},this.materialsArray=[],this.nameLookup={}}convert(e){if(!this.options)return e;let t={};for(let i in e){let r=e[i],n={};t[i]=n;for(let a in r){let s=!0,o=r[a],l=a.toLowerCase();switch(l){case"kd":case"ka":case"ks":this.options&&this.options.normalizeRGB&&(o=[o[0]/255,o[1]/255,o[2]/255]),this.options&&this.options.ignoreZeroRGBs&&o[0]===0&&o[1]===0&&o[2]===0&&(s=!1);break;default:break}s&&(n[l]=o)}}return t}preload(){for(let e in this.materialsInfo)this.create(e)}getIndex(e){return this.nameLookup[e]}getAsArray(){let e=0;for(let t in this.materialsInfo)this.materialsArray[e]=this.create(t),this.nameLookup[t]=e,e++;return this.materialsArray}create(e){return this.materials[e]===void 0&&this.createMaterial_(e),this.materials[e]}createMaterial_(e){let t=this,i=this.materialsInfo[e],r={name:e,side:this.side};function n(s,o){return typeof o!="string"||o===""?"":/^https?:\/\//i.test(o)?o:s+o}function a(s,o){if(r[s])return;let l=t.getTextureParams(o,r),c=t.loadTexture(n(t.baseUrl,l.url));c.repeat.copy(l.scale),c.offset.copy(l.offset),c.wrapS=t.wrap,c.wrapT=t.wrap,(s==="map"||s==="emissiveMap")&&(c.colorSpace=je),r[s]=c}for(let s in i){let o=i[s],l;if(o!=="")switch(s.toLowerCase()){case"kd":r.color=ke.colorSpaceToWorking(new _e().fromArray(o),je);break;case"ks":r.specular=ke.colorSpaceToWorking(new _e().fromArray(o),je);break;case"ke":r.emissive=ke.colorSpaceToWorking(new _e().fromArray(o),je);break;case"map_kd":a("map",o);break;case"map_ks":a("specularMap",o);break;case"map_ke":a("emissiveMap",o);break;case"norm":a("normalMap",o);break;case"map_bump":case"bump":a("bumpMap",o);break;case"disp":a("displacementMap",o);break;case"map_d":a("alphaMap",o),r.transparent=!0;break;case"ns":r.shininess=parseFloat(o);break;case"d":l=parseFloat(o),l<1&&(r.opacity=l,r.transparent=!0);break;case"tr":l=parseFloat(o),this.options&&this.options.invertTrProperty&&(l=1-l),l>0&&(r.opacity=1-l,r.transparent=!0);break;default:break}}return this.materials[e]=new nn(r),this.materials[e]}getTextureParams(e,t){let i={scale:new De(1,1),offset:new De(0,0)},r=e.split(/\s+/),n;return n=r.indexOf("-bm"),n>=0&&(t.bumpScale=parseFloat(r[n+1]),r.splice(n,2)),n=r.indexOf("-mm"),n>=0&&(t.displacementBias=parseFloat(r[n+1]),t.displacementScale=parseFloat(r[n+2]),r.splice(n,3)),n=r.indexOf("-s"),n>=0&&(i.scale.set(parseFloat(r[n+1]),parseFloat(r[n+2])),r.splice(n,4)),n=r.indexOf("-o"),n>=0&&(i.offset.set(parseFloat(r[n+1]),parseFloat(r[n+2])),r.splice(n,4)),i.url=r.join(" ").trim(),i}loadTexture(e,t,i,r,n){let a=this.manager!==void 0?this.manager:Bu,s=a.getHandler(e);s===null&&(s=new Ol(a)),s.setCrossOrigin&&s.setCrossOrigin(this.crossOrigin);let o=s.load(e,i,r,n);return t!==void 0&&(o.mapping=t),o}},ub=class extends Vt{constructor(e){super(e)}load(e,t,i,r){let n=this,a=new qi(this.manager);a.setPath(this.path),a.setResponseType("arraybuffer"),a.setRequestHeader(this.requestHeader),a.setWithCredentials(this.withCredentials),a.load(e,function(s){try{t(n.parse(s))}catch(o){r?r(o):console.error(o),n.manager.itemError(e)}},i,r)}parse(e){function t(l){let c=new DataView(l),h=32/8*3+32/8*3*3+16/8,u=c.getUint32(80,!0);if(80+32/8+u*h===c.byteLength)return!0;let d=[115,111,108,105,100];for(let p=0;p<5;p++)if(i(d,c,p))return!1;return!0}function i(l,c,h){for(let u=0,d=l.length;u<d;u++)if(l[u]!==c.getUint8(h+u))return!1;return!0}function r(l){let c=new DataView(l),h=c.getUint32(80,!0),u,d,p,v=!1,f,g,m,y,x;for(let w=0;w<70;w++)c.getUint32(w,!1)==1129270351&&c.getUint8(w+4)==82&&c.getUint8(w+5)==61&&(v=!0,f=new Float32Array(h*3*3),g=c.getUint8(w+6)/255,m=c.getUint8(w+7)/255,y=c.getUint8(w+8)/255,x=c.getUint8(w+9)/255);let _=84,S=50,E=new It,A=new Float32Array(h*3*3),C=new Float32Array(h*3*3),b=new _e;for(let w=0;w<h;w++){let R=_+w*S,G=c.getFloat32(R,!0),V=c.getFloat32(R+4,!0),W=c.getFloat32(R+8,!0);if(v){let O=c.getUint16(R+48,!0);(O&32768)===0?(u=(O&31)/31,d=(O>>5&31)/31,p=(O>>10&31)/31):(u=g,d=m,p=y)}for(let O=1;O<=3;O++){let z=R+O*12,j=w*3*3+(O-1)*3;A[j]=c.getFloat32(z,!0),A[j+1]=c.getFloat32(z+4,!0),A[j+2]=c.getFloat32(z+8,!0),C[j]=G,C[j+1]=V,C[j+2]=W,v&&(b.setRGB(u,d,p,je),f[j]=b.r,f[j+1]=b.g,f[j+2]=b.b)}}return E.setAttribute("position",new Et(A,3)),E.setAttribute("normal",new Et(C,3)),v&&(E.setAttribute("color",new Et(f,3)),E.hasColors=!0,E.alpha=x),E}function n(l){let c=new It,h=/solid([\s\S]*?)endsolid/g,u=/facet([\s\S]*?)endfacet/g,d=/solid\s(.+)/,p=0,v=/[\s]+([+-]?(?:\d*)(?:\.\d*)?(?:[eE][+-]?\d+)?)/.source,f=new RegExp("vertex"+v+v+v,"g"),g=new RegExp("normal"+v+v+v,"g"),m=[],y=[],x=[],_=new P,S,E=0,A=0,C=0;for(;(S=h.exec(l))!==null;){A=C;let b=S[0],w=(S=d.exec(b))!==null?S[1]:"";for(x.push(w);(S=u.exec(b))!==null;){let V=0,W=0,O=S[0];for(;(S=g.exec(O))!==null;)_.x=parseFloat(S[1]),_.y=parseFloat(S[2]),_.z=parseFloat(S[3]),W++;for(;(S=f.exec(O))!==null;)m.push(parseFloat(S[1]),parseFloat(S[2]),parseFloat(S[3])),y.push(_.x,_.y,_.z),V++,C++;W!==1&&console.error("THREE.STLLoader: Something isn't right with the normal of face number "+p),V!==3&&console.error("THREE.STLLoader: Something isn't right with the vertices of face number "+p),p++}let R=A,G=C-A;c.userData.groupNames=x,c.addGroup(R,G,E),E++}return c.setAttribute("position",new Ze(m,3)),c.setAttribute("normal",new Ze(y,3)),c}function a(l){return typeof l!="string"?new TextDecoder().decode(l):l}function s(l){if(typeof l=="string"){let c=new Uint8Array(l.length);for(let h=0;h<l.length;h++)c[h]=l.charCodeAt(h)&255;return c.buffer||c}else return l}let o=s(e);return t(o)?r(o):n(a(e))}},Gt=new _e,db=class extends Vt{constructor(e){super(e),this.propertyNameMapping={},this.customPropertyMapping={}}load(e,t,i,r){let n=this,a=new qi(this.manager);a.setPath(this.path),a.setResponseType("arraybuffer"),a.setRequestHeader(this.requestHeader),a.setWithCredentials(this.withCredentials),a.load(e,function(s){try{t(n.parse(s))}catch(o){r?r(o):console.error(o),n.manager.itemError(e)}},i,r)}setPropertyNameMapping(e){this.propertyNameMapping=e}setCustomPropertyNameMapping(e){this.customPropertyMapping=e}parse(e){function t(f,g=0){let m=/^ply([\s\S]*)end_header(\r\n|\r|\n)/,y="",x=m.exec(f);x!==null&&(y=x[1]);let _={comments:[],elements:[],headerLength:g,objInfo:""},S=y.split(/\r\n|\r|\n/),E;function A(C,b){let w={type:C[0]};return w.type==="list"?(w.name=C[3],w.countType=C[1],w.itemType=C[2]):w.name=C[1],w.name in b&&(w.name=b[w.name]),w}for(let C=0;C<S.length;C++){let b=S[C];if(b=b.trim(),b==="")continue;let w=b.split(/\s+/),R=w.shift();switch(b=w.join(" "),R){case"format":_.format=w[0],_.version=w[1];break;case"comment":_.comments.push(b);break;case"element":E!==void 0&&_.elements.push(E),E={},E.name=w[0],E.count=parseInt(w[1]),E.properties=[];break;case"property":E.properties.push(A(w,v.propertyNameMapping));break;case"obj_info":_.objInfo=b;break;default:console.log("unhandled",R,w)}}return E!==void 0&&_.elements.push(E),_}function i(f,g){switch(g){case"char":case"uchar":case"short":case"ushort":case"int":case"uint":case"int8":case"uint8":case"int16":case"uint16":case"int32":case"uint32":return parseInt(f);case"float":case"double":case"float32":case"float64":return parseFloat(f)}}function r(f,g){let m={};for(let y=0;y<f.length;y++){if(g.empty())return null;if(f[y].type==="list"){let x=[],_=i(g.next(),f[y].countType);for(let S=0;S<_;S++){if(g.empty())return null;x.push(i(g.next(),f[y].itemType))}m[f[y].name]=x}else m[f[y].name]=i(g.next(),f[y].type)}return m}function n(){let f={indices:[],vertices:[],normals:[],uvs:[],faceVertexUvs:[],colors:[],faceVertexColors:[]};for(let g of Object.keys(v.customPropertyMapping))f[g]=[];return f}function a(f){let g=f.map(y=>y.name);function m(y){for(let x=0,_=y.length;x<_;x++){let S=y[x];if(g.includes(S))return S}return null}return{attrX:m(["x","px","posx"])||"x",attrY:m(["y","py","posy"])||"y",attrZ:m(["z","pz","posz"])||"z",attrNX:m(["nx","normalx"]),attrNY:m(["ny","normaly"]),attrNZ:m(["nz","normalz"]),attrS:m(["s","u","texture_u","tx"]),attrT:m(["t","v","texture_v","ty"]),attrR:m(["red","diffuse_red","r","diffuse_r"]),attrG:m(["green","diffuse_green","g","diffuse_g"]),attrB:m(["blue","diffuse_blue","b","diffuse_b"])}}function s(f,g){let m=n(),y=/end_header\s+(\S[\s\S]*\S|\S)\s*$/,x,_;(_=y.exec(f))!==null?x=_[1].split(/\s+/):x=[];let S=new pb(x);e:for(let E=0;E<g.elements.length;E++){let A=g.elements[E],C=a(A.properties);for(let b=0;b<A.count;b++){let w=r(A.properties,S);if(!w)break e;l(m,A.name,w,C)}}return o(m)}function o(f){let g=new It;f.indices.length>0&&g.setIndex(f.indices),g.setAttribute("position",new Ze(f.vertices,3)),f.normals.length>0&&g.setAttribute("normal",new Ze(f.normals,3)),f.uvs.length>0&&g.setAttribute("uv",new Ze(f.uvs,2)),f.colors.length>0&&g.setAttribute("color",new Ze(f.colors,3)),(f.faceVertexUvs.length>0||f.faceVertexColors.length>0)&&(g=g.toNonIndexed(),f.faceVertexUvs.length>0&&g.setAttribute("uv",new Ze(f.faceVertexUvs,2)),f.faceVertexColors.length>0&&g.setAttribute("color",new Ze(f.faceVertexColors,3)));for(let m of Object.keys(v.customPropertyMapping))f[m].length>0&&g.setAttribute(m,new Ze(f[m],v.customPropertyMapping[m].length));return g.computeBoundingSphere(),g}function l(f,g,m,y){if(g==="vertex"){f.vertices.push(m[y.attrX],m[y.attrY],m[y.attrZ]),y.attrNX!==null&&y.attrNY!==null&&y.attrNZ!==null&&f.normals.push(m[y.attrNX],m[y.attrNY],m[y.attrNZ]),y.attrS!==null&&y.attrT!==null&&f.uvs.push(m[y.attrS],m[y.attrT]),y.attrR!==null&&y.attrG!==null&&y.attrB!==null&&(Gt.setRGB(m[y.attrR]/255,m[y.attrG]/255,m[y.attrB]/255,je),f.colors.push(Gt.r,Gt.g,Gt.b));for(let x of Object.keys(v.customPropertyMapping))for(let _ of v.customPropertyMapping[x])f[x].push(m[_])}else if(g==="face"){let x=m.vertex_indices||m.vertex_index,_=m.texcoord;x.length===3?(f.indices.push(x[0],x[1],x[2]),_&&_.length===6&&(f.faceVertexUvs.push(_[0],_[1]),f.faceVertexUvs.push(_[2],_[3]),f.faceVertexUvs.push(_[4],_[5]))):x.length===4&&(f.indices.push(x[0],x[1],x[3]),f.indices.push(x[1],x[2],x[3])),y.attrR!==null&&y.attrG!==null&&y.attrB!==null&&(Gt.setRGB(m[y.attrR]/255,m[y.attrG]/255,m[y.attrB]/255,je),f.faceVertexColors.push(Gt.r,Gt.g,Gt.b),f.faceVertexColors.push(Gt.r,Gt.g,Gt.b),f.faceVertexColors.push(Gt.r,Gt.g,Gt.b))}}function c(f,g){let m={},y=0;for(let x=0;x<g.length;x++){let _=g[x],S=_.valueReader;if(_.type==="list"){let E=[],A=_.countReader.read(f+y);y+=_.countReader.size;for(let C=0;C<A;C++)E.push(S.read(f+y)),y+=S.size;m[_.name]=E}else m[_.name]=S.read(f+y),y+=S.size}return[m,y]}function h(f,g,m){function y(x,_,S){switch(_){case"int8":case"char":return{read:E=>x.getInt8(E),size:1};case"uint8":case"uchar":return{read:E=>x.getUint8(E),size:1};case"int16":case"short":return{read:E=>x.getInt16(E,S),size:2};case"uint16":case"ushort":return{read:E=>x.getUint16(E,S),size:2};case"int32":case"int":return{read:E=>x.getInt32(E,S),size:4};case"uint32":case"uint":return{read:E=>x.getUint32(E,S),size:4};case"float32":case"float":return{read:E=>x.getFloat32(E,S),size:4};case"float64":case"double":return{read:E=>x.getFloat64(E,S),size:8}}}for(let x=0,_=f.length;x<_;x++){let S=f[x];S.type==="list"?(S.countReader=y(g,S.countType,m),S.valueReader=y(g,S.itemType,m)):S.valueReader=y(g,S.type,m)}}function u(f,g){let m=n(),y=g.format==="binary_little_endian",x=new DataView(f,g.headerLength),_,S=0;for(let E=0;E<g.elements.length;E++){let A=g.elements[E],C=A.properties,b=a(C);h(C,x,y);for(let w=0;w<A.count;w++){_=c(S,C),S+=_[1];let R=_[0];l(m,A.name,R,b)}}return o(m)}function d(f){let g=0,m=!0,y="",x=[],_=new TextDecoder().decode(f.subarray(0,5)),S=/^ply\r\n/.test(_);do{let E=String.fromCharCode(f[g++]);E!==`
`&&E!=="\r"?y+=E:(y==="end_header"&&(m=!1),y!==""&&(x.push(y),y=""))}while(m&&g<f.length);return S===!0&&g++,{headerText:x.join("\r")+"\r",headerLength:g}}let p,v=this;if(e instanceof ArrayBuffer){let f=new Uint8Array(e),{headerText:g,headerLength:m}=d(f),y=t(g,m);if(y.format==="ascii"){let x=new TextDecoder().decode(f);p=s(x,y)}else p=u(e,y)}else p=s(e,t(e));return p}},pb=class{constructor(e){this.arr=e,this.i=0}empty(){return this.i>=this.arr.length}next(){return this.arr[this.i++]}},fb=class extends Vt{constructor(e){super(e),this.animateBonePositions=!0,this.animateBoneRotations=!0}load(e,t,i,r){let n=this,a=new qi(n.manager);a.setPath(n.path),a.setRequestHeader(n.requestHeader),a.setWithCredentials(n.withCredentials),a.load(e,function(s){try{t(n.parse(s))}catch(o){r?r(o):console.error(o),n.manager.itemError(e)}},i,r)}parse(e){function t(d){s(d)!=="HIERARCHY"&&console.error("THREE.BVHLoader: HIERARCHY expected.");let p=[],v=r(d,s(d),p);s(d)!=="MOTION"&&console.error("THREE.BVHLoader: MOTION expected.");let f=s(d).split(/[\s]+/),g=parseInt(f[1]);isNaN(g)&&console.error("THREE.BVHLoader: Failed to read number of frames."),f=s(d).split(/[\s]+/);let m=parseFloat(f[2]);isNaN(m)&&console.error("THREE.BVHLoader: Failed to read frame time.");for(let y=0;y<g;y++)f=s(d).split(/[\s]+/),i(f,y*m,v);return p}function i(d,p,v){if(v.type==="ENDSITE")return;let f={time:p,position:new P,rotation:new gt};v.frames.push(f);let g=new gt,m=new P(1,0,0),y=new P(0,1,0),x=new P(0,0,1);for(let _=0;_<v.channels.length;_++)switch(v.channels[_]){case"Xposition":f.position.x=parseFloat(d.shift().trim());break;case"Yposition":f.position.y=parseFloat(d.shift().trim());break;case"Zposition":f.position.z=parseFloat(d.shift().trim());break;case"Xrotation":g.setFromAxisAngle(m,parseFloat(d.shift().trim())*Math.PI/180),f.rotation.multiply(g);break;case"Yrotation":g.setFromAxisAngle(y,parseFloat(d.shift().trim())*Math.PI/180),f.rotation.multiply(g);break;case"Zrotation":g.setFromAxisAngle(x,parseFloat(d.shift().trim())*Math.PI/180),f.rotation.multiply(g);break;default:console.warn("THREE.BVHLoader: Invalid channel type.")}for(let _=0;_<v.children.length;_++)i(d,p,v.children[_])}function r(d,p,v){let f={name:"",type:"",frames:[]};v.push(f);let g=p.split(/[\s]+/);g[0].toUpperCase()==="END"&&g[1].toUpperCase()==="SITE"?(f.type="ENDSITE",f.name="ENDSITE"):(f.name=g[1],f.type=g[0].toUpperCase()),s(d)!=="{"&&console.error("THREE.BVHLoader: Expected opening { after type & name"),g=s(d).split(/[\s]+/),g[0]!=="OFFSET"&&console.error("THREE.BVHLoader: Expected OFFSET but got: "+g[0]),g.length!==4&&console.error("THREE.BVHLoader: Invalid number of values for OFFSET.");let m=new P(parseFloat(g[1]),parseFloat(g[2]),parseFloat(g[3]));if((isNaN(m.x)||isNaN(m.y)||isNaN(m.z))&&console.error("THREE.BVHLoader: Invalid values of OFFSET."),f.offset=m,f.type!=="ENDSITE"){g=s(d).split(/[\s]+/),g[0]!=="CHANNELS"&&console.error("THREE.BVHLoader: Expected CHANNELS definition.");let y=parseInt(g[1]);f.channels=g.splice(2,y),f.children=[]}for(;;){let y=s(d);if(y==="}")return f;f.children.push(r(d,y,v))}}function n(d,p){let v=new $n;if(p.push(v),v.position.add(d.offset),v.name=d.name,d.type!=="ENDSITE")for(let f=0;f<d.children.length;f++)v.add(n(d.children[f],p));return v}function a(d){let p=[];for(let v=0;v<d.length;v++){let f=d[v];if(f.type==="ENDSITE")continue;let g=[],m=[],y=[];for(let x=0;x<f.frames.length;x++){let _=f.frames[x];g.push(_.time),m.push(_.position.x+f.offset.x),m.push(_.position.y+f.offset.y),m.push(_.position.z+f.offset.z),y.push(_.rotation.x),y.push(_.rotation.y),y.push(_.rotation.z),y.push(_.rotation.w)}o.animateBonePositions&&p.push(new lr(f.name+".position",g,m)),o.animateBoneRotations&&p.push(new Xi(f.name+".quaternion",g,y))}return new Qn("animation",-1,p)}function s(d){let p;for(;(p=d.shift().trim()).length===0;);return p}let o=this,l=e.split(/[\r\n]+/g),c=t(l),h=[];n(c[0],h);let u=a(c);return{skeleton:new Nl(h),clip:u}}},mb=class extends ym{constructor(e){super(e)}parse(e){function t(O){switch(O.image_type){case u:case v:if(O.colormap_length>256||O.colormap_size!==24||O.colormap_type!==1)throw new Error("THREE.TGALoader: Invalid type colormap data for indexed type.");break;case d:case p:case f:case g:if(O.colormap_type)throw new Error("THREE.TGALoader: Invalid type colormap data for colormap type.");break;case h:throw new Error("THREE.TGALoader: No data.");default:throw new Error("THREE.TGALoader: Invalid type "+O.image_type)}if(O.width<=0||O.height<=0)throw new Error("THREE.TGALoader: Invalid image size.");if(O.pixel_size!==8&&O.pixel_size!==16&&O.pixel_size!==24&&O.pixel_size!==32)throw new Error("THREE.TGALoader: Invalid pixel size "+O.pixel_size)}function i(O,z,j,H,$){let U,se,ie=j.pixel_size>>3,le=j.width*j.height*ie;if(z&&(se=$.subarray(H,H+=j.colormap_length*(j.colormap_size>>3))),O){U=new Uint8Array(le);let ae,N,Y,J=0,de=new Uint8Array(ie);for(;J<le;)if(ae=$[H++],N=(ae&127)+1,ae&128){for(Y=0;Y<ie;++Y)de[Y]=$[H++];for(Y=0;Y<N;++Y)U.set(de,J+Y*ie);J+=ie*N}else{for(N*=ie,Y=0;Y<N;++Y)U[J+Y]=$[H++];J+=N}}else U=$.subarray(H,H+=z?j.width*j.height:le);return{pixel_data:U,palettes:se}}function r(O,z,j,H,$,U,se,ie,le){let ae=le,N,Y=0,J,de,te=b.width;for(de=z;de!==H;de+=j)for(J=$;J!==se;J+=U,Y++)N=ie[Y],O[(J+te*de)*4+3]=255,O[(J+te*de)*4+2]=ae[N*3+0],O[(J+te*de)*4+1]=ae[N*3+1],O[(J+te*de)*4+0]=ae[N*3+2];return O}function n(O,z,j,H,$,U,se,ie){let le,ae=0,N,Y,J=b.width;for(Y=z;Y!==H;Y+=j)for(N=$;N!==se;N+=U,ae+=2)le=ie[ae+0]+(ie[ae+1]<<8),O[(N+J*Y)*4+0]=(le&31744)>>7,O[(N+J*Y)*4+1]=(le&992)>>2,O[(N+J*Y)*4+2]=(le&31)<<3,O[(N+J*Y)*4+3]=le&32768?0:255;return O}function a(O,z,j,H,$,U,se,ie){let le=0,ae,N,Y=b.width;for(N=z;N!==H;N+=j)for(ae=$;ae!==se;ae+=U,le+=3)O[(ae+Y*N)*4+3]=255,O[(ae+Y*N)*4+2]=ie[le+0],O[(ae+Y*N)*4+1]=ie[le+1],O[(ae+Y*N)*4+0]=ie[le+2];return O}function s(O,z,j,H,$,U,se,ie){let le=0,ae,N,Y=b.width;for(N=z;N!==H;N+=j)for(ae=$;ae!==se;ae+=U,le+=4)O[(ae+Y*N)*4+2]=ie[le+0],O[(ae+Y*N)*4+1]=ie[le+1],O[(ae+Y*N)*4+0]=ie[le+2],O[(ae+Y*N)*4+3]=ie[le+3];return O}function o(O,z,j,H,$,U,se,ie){let le,ae=0,N,Y,J=b.width;for(Y=z;Y!==H;Y+=j)for(N=$;N!==se;N+=U,ae++)le=ie[ae],O[(N+J*Y)*4+0]=le,O[(N+J*Y)*4+1]=le,O[(N+J*Y)*4+2]=le,O[(N+J*Y)*4+3]=255;return O}function l(O,z,j,H,$,U,se,ie){let le=0,ae,N,Y=b.width;for(N=z;N!==H;N+=j)for(ae=$;ae!==se;ae+=U,le+=2)O[(ae+Y*N)*4+0]=ie[le+0],O[(ae+Y*N)*4+1]=ie[le+0],O[(ae+Y*N)*4+2]=ie[le+0],O[(ae+Y*N)*4+3]=ie[le+1];return O}function c(O,z,j,H,$){let U,se,ie,le,ae,N;switch((b.flags&m)>>y){default:case S:U=0,ie=1,ae=z,se=0,le=1,N=j;break;case x:U=0,ie=1,ae=z,se=j-1,le=-1,N=-1;break;case E:U=z-1,ie=-1,ae=-1,se=0,le=1,N=j;break;case _:U=z-1,ie=-1,ae=-1,se=j-1,le=-1,N=-1;break}if(G)switch(b.pixel_size){case 8:o(O,se,le,N,U,ie,ae,H);break;case 16:l(O,se,le,N,U,ie,ae,H);break;default:throw new Error("THREE.TGALoader: Format not supported.")}else switch(b.pixel_size){case 8:r(O,se,le,N,U,ie,ae,H,$);break;case 16:n(O,se,le,N,U,ie,ae,H);break;case 24:a(O,se,le,N,U,ie,ae,H);break;case 32:s(O,se,le,N,U,ie,ae,H);break;default:throw new Error("THREE.TGALoader: Format not supported.")}return O}let h=0,u=1,d=2,p=3,v=9,f=10,g=11,m=48,y=4,x=0,_=1,S=2,E=3;if(e.length<19)throw new Error("THREE.TGALoader: Not enough data to contain header.");let A=0,C=new Uint8Array(e),b={id_length:C[A++],colormap_type:C[A++],image_type:C[A++],colormap_index:C[A++]|C[A++]<<8,colormap_length:C[A++]|C[A++]<<8,colormap_size:C[A++],origin:[C[A++]|C[A++]<<8,C[A++]|C[A++]<<8],width:C[A++]|C[A++]<<8,height:C[A++]|C[A++]<<8,pixel_size:C[A++],flags:C[A++]};if(t(b),b.id_length+A>e.length)throw new Error("THREE.TGALoader: No data.");A+=b.id_length;let w=!1,R=!1,G=!1;switch(b.image_type){case v:w=!0,R=!0;break;case u:R=!0;break;case f:w=!0;break;case d:break;case g:w=!0,G=!0;break;case p:G=!0;break}let V=new Uint8Array(b.width*b.height*4),W=i(w,R,b,A,C);return c(V,b.width,b.height,W.pixel_data,W.palettes),{data:V,width:b.width,height:b.height,flipY:!0,generateMipmaps:!0,minFilter:pi}}};});var la=new WeakMap;function Di(e,t){let i=la.get(e)||[];i.push(t),la.set(e,i)}function ic(e){if(!e.isConnected)for(let t of[e,...e.querySelectorAll?.("*")||[]]){let i=la.get(t);i&&(la.delete(t),i.forEach(r=>r()))}}function ca(e,t,i){for(;e.length<t;)e.push(i);e.length>t&&(e.length=t)}function zd(e){!e||typeof e!="object"||(Array.isArray(e.history)||(e.history=[]),Array.isArray(e.inputHistorySnapshots)||(e.inputHistorySnapshots=[]),ca(e.inputHistorySnapshots,e.history.length,null),Array.isArray(e.historyRuns)||(e.historyRuns=[]),ca(e.historyRuns,e.history.length,null))}function Ni(e){if(isNaN(e)||!isFinite(e))return"00:00";let t=Math.floor(e/60).toString().padStart(2,"0"),i=Math.floor(e%60).toString().padStart(2,"0");return`${t}:${i}`}function pr(e,t=30){if(isNaN(e)||!isFinite(e))return"00:00:00";let i=Math.floor(e/60).toString().padStart(2,"0"),r=Math.floor(e%60).toString().padStart(2,"0"),n=Math.floor(e%1*t).toString().padStart(2,"0");return`${i}:${r}:${n}`}function wn(e){!e||typeof e!="object"||(Array.isArray(e.history)||(e.history=[]),zd(e),Array.isArray(e.textHistory)||(e.textHistory=[]),Array.isArray(e.textHistoryStatus)||(e.textHistoryStatus=[]),ca(e.textHistory,e.history.length,""),ca(e.textHistoryStatus,e.history.length,"idle"),typeof e.textContent!="string"&&(e.textContent=e.textContent==null?"":String(e.textContent)),typeof e.textLoadState!="string"&&(e.textLoadState="idle"),typeof e.textPreviewMarkdown!="boolean"&&(e.textPreviewMarkdown=!1),typeof e.textSyntaxHighlight!="boolean"&&(e.textSyntaxHighlight=!1))}function rc(e=""){let t=window._clabVideoMuted!==!1;return`
            <div class="clab-video-controls">
                <div class="clab-video-toolbar">
                    <span class="clab-timecode">00:00 / 00:00</span>
                    <div class="clab-video-tools-right">
                        ${e}

                        <!-- \u6781\u7B80\u97F3\u91CF\u6ED1\u6746 -->
                        <div class="clab-volume-wrap clab-video-controls-interactive" style="background: transparent !important;">
                            <div class="clab-volume-slider-container clab-vid-vol-slider" title="\u8C03\u8282\u97F3\u91CF">
                                <div class="clab-volume-slider-track">
                                    <div class="clab-volume-slider-fill"></div>
                                    <div class="clab-volume-slider-thumb"></div>
                                </div>
                            </div>
                            <button class="clab-media-opt-btn clab-opt-mute" title="\u9759\u97F3/\u53D6\u6D88\u9759\u97F3" style="padding: 4px 6px; background: transparent !important; color: #aaa; transition: color 0.2s;" onmouseover="if(this.style.pointerEvents !== 'none') this.style.color='#fff'" onmouseout="if(this.style.pointerEvents !== 'none') this.style.color='#aaa'">
                                <svg class="clab-vol-icon-high" style="display:${t?"none":"block"};" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                                <svg class="clab-vol-icon-muted" style="display:${t?"block":"none"};" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
                                <svg class="clab-vol-icon-none" style="display:none;" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon></svg>
                            </button>
                        </div>

                        <div class="clab-media-opt-wrapper clab-video-controls-interactive">
                            <button type="button" class="clab-media-opt-btn clab-more-toggle" title="\u64AD\u653E\u901F\u5EA6\u3001\u753B\u4E2D\u753B\u4E0E\u5168\u5C4F" aria-label="\u64AD\u653E\u901F\u5EA6\u3001\u753B\u4E2D\u753B\u4E0E\u5168\u5C4F" aria-expanded="false"><span class="clab-video-speed-val">1\xD7</span></button>
                            <div class="clab-media-dropdown clab-more-dropdown" style="text-align: left;">
                                <div style="padding: 6px 12px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.1);">
                                    <span style="font-size: 11px; color: #aaa; font-family: sans-serif !important;">\u64AD\u653E\u901F\u5EA6</span>
                                    <div style="display: flex; align-items: center; background: rgba(0,0,0,0.5); border: 1px solid #555; border-radius: 4px; padding: 0 4px;">
                                        <input type="number" class="clab-media-speed-input" value="1.0" step="0.1" min="0.1" max="5.0" style="width: 28px; background: transparent; border: none; color: #eee; font-size: 11px; text-align: center; outline: none; -moz-appearance: textfield;">
                                        <span style="font-size: 10px; color: #aaa; pointer-events: none;">x</span>
                                    </div>
                                </div>
                                <div style="display: flex; justify-content: space-between; padding: 6px 12px; border-bottom: 1px solid rgba(255,255,255,0.1);">
                                    <span class="clab-vid-speed-opt" data-spd="0.5" style="cursor: pointer; font-size: 10px; color: #eee; padding: 2px 6px; border-radius: 4px; background: rgba(255,255,255,0.1); transition: background 0.2s;">0.5</span>
                                    <span class="clab-vid-speed-opt" data-spd="1.0" style="cursor: pointer; font-size: 10px; color: #eee; padding: 2px 6px; border-radius: 4px; background: rgba(255,255,255,0.1); transition: background 0.2s;">1.0</span>
                                    <span class="clab-vid-speed-opt" data-spd="1.5" style="cursor: pointer; font-size: 10px; color: #eee; padding: 2px 6px; border-radius: 4px; background: rgba(255,255,255,0.1); transition: background 0.2s;">1.5</span>
                                    <span class="clab-vid-speed-opt" data-spd="2.0" style="cursor: pointer; font-size: 10px; color: #eee; padding: 2px 6px; border-radius: 4px; background: rgba(255,255,255,0.1); transition: background 0.2s;">2.0</span>
                                </div>
                                <div class="clab-media-dropdown-item clab-opt-pip" style="margin-top: 4px;">\u753B\u4E2D\u753B</div>
                                <div class="clab-media-dropdown-item clab-opt-fullscreen">\u5168\u5C4F</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="clab-video-progress-container clab-video-controls-interactive">
                    <div class="clab-video-progress-bar"></div>
                </div>
            </div>
    `}function Ss(e,t=[e.querySelector("video")]){let i=t[0];if(!i)return;let r=t.find(u=>!u.muted)||i,n=t.every(u=>Number.isFinite(u.duration))?Math.min(...t.map(u=>u.duration)):0;e.classList.toggle("clab-video-paused",i.paused),e.querySelector(".clab-video-speed-val").textContent=`${i.playbackRate}\xD7`;let a=e.querySelector(".clab-opt-mute");if(a){let u=!1;(r.audioTracks&&r.audioTracks.length===0||r.mozHasAudio===!1||i.currentTime>.1&&r.webkitAudioDecodedByteCount===0)&&(u=!0);let d=a.querySelector(".clab-vol-icon-high"),p=a.querySelector(".clab-vol-icon-muted"),v=a.querySelector(".clab-vol-icon-none"),f=e.querySelector(".clab-vid-vol-slider");u?(a.style.color="#888",a.style.pointerEvents="none",d&&(d.style.display="none"),p&&(p.style.display="none"),v&&(v.style.display="block"),f&&(f.style.display="none")):(a.style.pointerEvents="auto",r.muted||r.volume===0?(d&&(d.style.display="none"),p&&(p.style.display="block")):(d&&(d.style.display="block"),p&&(p.style.display="none")),v&&(v.style.display="none"),f&&(f.style.display="block"))}let s=r.muted?0:r.volume,o=e.querySelector(".clab-volume-slider-fill"),l=e.querySelector(".clab-volume-slider-thumb");if(o&&(o.style.width=`${s*100}%`),l&&(l.style.right=`${s*100}%`),i.dataset.isScrubbing==="true")return;let c=e.querySelector(".clab-video-progress-bar"),h=e.querySelector(".clab-timecode");if(c&&h&&n){e.querySelector(".clab-video-progress-container")?.setAttribute("aria-valuenow",String(i.currentTime)),e.querySelector(".clab-video-progress-container")?.setAttribute("aria-valuemax",String(n)),c.style.width=`${i.currentTime/n*100}%`;let u=`${Ni(i.currentTime)} / ${Ni(n)}`;h.textContent!==u&&(h.textContent=u)}}function nc(e,t=[e.querySelector("video")]){let i=new AbortController,{signal:r}=i,n=t[0],a=e.querySelector(".clab-more-dropdown"),s=e.querySelector(".clab-more-toggle"),o=()=>t.every(_=>Number.isFinite(_.duration))?Math.min(...t.map(_=>_.duration)):0,l=()=>Ss(e,t),c,h,u=()=>{c?.abort(),a.classList.remove("show"),s.setAttribute("aria-expanded","false"),a._originalParent?.appendChild(a)},d=_=>{t.forEach(S=>{S.playbackRate=_}),l()},p=e.querySelector(".clab-video-progress-container");p.addEventListener("mousedown",_=>{if(_.button!==0)return;_.preventDefault(),_.stopPropagation();let S=p.getBoundingClientRect();if(!o()||!S.width)return;let E=Math.max(0,Math.min(1,(_.clientX-S.left)/S.width))*o();t.forEach(A=>{A.currentTime=E}),l()},{signal:r}),p.setAttribute("role","slider"),p.tabIndex=0,p.setAttribute("aria-label","\u89C6\u9891\u64AD\u653E\u8FDB\u5EA6"),p.addEventListener("keydown",_=>{if(!["ArrowLeft","ArrowRight","Home","End"].includes(_.key))return;_.preventDefault(),_.stopPropagation();let S=_.key==="Home"?0:_.key==="End"?o():Math.max(0,Math.min(o(),n.currentTime+(_.key==="ArrowLeft"?-1:1)));t.forEach(E=>{E.readyState&&(E.currentTime=S)}),l()},{signal:r});let v=()=>t.find(_=>!_.muted)||n,f=_=>{let S=v();S.muted=!1,S.volume=_,l()},g=e.querySelector(".clab-vid-vol-slider"),m=_=>{let S=g.getBoundingClientRect();if(!S.width)return;let E=Math.max(0,Math.min(1,1-(_-S.left)/S.width));f(E)};g.addEventListener("mousedown",_=>{_.button===0&&(_.preventDefault(),_.stopPropagation(),g.classList.add("is-dragging"),m(_.clientX),h?.abort(),h=new AbortController,window.addEventListener("mousemove",S=>m(S.clientX),{signal:h.signal}),window.addEventListener("mouseup",y,{signal:h.signal}),window.addEventListener("blur",y,{signal:h.signal}))},{signal:r});let y=()=>{g.classList.remove("is-dragging"),h?.abort()};e.querySelector(".clab-opt-mute").addEventListener("click",_=>{_.stopPropagation();let S=v();S.muted||!S.volume?f(.8):(t.forEach(E=>{E.muted=!0}),l())},{signal:r}),s.addEventListener("click",_=>{_.stopPropagation();let S=a.classList.contains("show");if(document.querySelectorAll(".clab-media-dropdown.show").forEach(C=>{C.classList.remove("show"),C._originalParent?.querySelector("[aria-expanded]")?.setAttribute("aria-expanded","false"),C._originalParent?.appendChild(C)}),S)return;a._originalParent||=a.parentElement,(document.fullscreenElement||document.body).append(a),a.classList.add("show"),s.setAttribute("aria-expanded","true");let E=s.getBoundingClientRect();a.style.bottom=`${window.innerHeight-E.top+6}px`,a.style.left=`${Math.max(4,Math.min(E.right-a.offsetWidth,window.innerWidth-a.offsetWidth-4))}px`,c?.abort(),c=new AbortController;let A=C=>{!s.contains(C.target)&&!a.contains(C.target)&&u()};window.addEventListener("mousedown",A,{capture:!0,signal:c.signal}),window.addEventListener("wheel",A,{capture:!0,passive:!0,signal:c.signal})},{signal:r});let x=a.querySelector(".clab-media-speed-input");return x.addEventListener("change",()=>{d(Math.max(.1,Math.min(5,Number(x.value)||1))),x.value=n.playbackRate},{signal:r}),a.querySelectorAll(".clab-vid-speed-opt").forEach(_=>_.addEventListener("click",S=>{S.stopPropagation(),d(Number(_.dataset.spd)),x.value=n.playbackRate,u()},{signal:r})),a.querySelector(".clab-opt-fullscreen").addEventListener("click",_=>{_.stopPropagation(),e.requestFullscreen?.().catch(()=>{}),u()},{signal:r}),a.querySelector(".clab-opt-pip").addEventListener("click",_=>{_.stopPropagation(),document.pictureInPictureElement===n?document.exitPictureInPicture().catch(()=>{}):n.requestPictureInPicture?.().catch(()=>{}),u()},{signal:r}),l(),()=>{i.abort(),y(),u(),a.remove()}}var Yi=new Map;async function ha(e,t=200){let i=`${e}|${t}`;if(Yi.has(i))return Yi.get(i);let r=(async()=>{let n=await fetch(e);if(!n.ok)throw new Error(`HTTP ${n.status}`);let a=window.AudioContext||window.webkitAudioContext;if(!a)throw new Error("AudioContext unavailable");let s=new a;try{let o=await s.decodeAudioData(await n.arrayBuffer()),l=Array.from({length:o.numberOfChannels},(u,d)=>o.getChannelData(d)),c=Array.from({length:t},(u,d)=>{let p=Math.floor(d*o.length/t),v=Math.floor((d+1)*o.length/t),f=0;for(let g of l)for(let m=p;m<v;m++)f=Math.max(f,Math.abs(g[m]));return f}),h=Math.max(...c)||1;return c.map(u=>u/h)}finally{await s.close()}})();Yi.set(i,r),Yi.size>16&&Yi.delete(Yi.keys().next().value);try{return await r}catch(n){throw Yi.get(i)===r&&Yi.delete(i),n}}function Mn(e,t,i=0,r="#ccc",n="#666"){let a=e.clientWidth,s=e.clientHeight;if(!a||!s)return;let o=Math.min(window.devicePixelRatio||1,2);e.width=Math.round(a*o),e.height=Math.round(s*o);let l=e.getContext("2d");if(l.setTransform(o,0,0,o,0,0),!t?.length)return;let c=Math.min(t.length,Math.max(1,Math.floor(a/4)));for(let h=0;h<c;h++){let u=Math.floor(h*t.length/c),d=Math.floor((h+1)*t.length/c),v=Math.max(.03,...t.slice(u,d))*s*.8;l.fillStyle=h/c<i?r:n,l.fillRect(h*a/c+1,(s-v)/2,Math.max(1,a/c-2),v)}}var Es=new WeakMap;function Ts(e,t,i){return`<div class="clab-audio-player" data-area-id="${e.id}">
        <audio id="clab-img-${e.id}" class="clab-preview-img clab-media-target" src="${t}" loop preload="metadata" style="display:none;" onerror="${i}"></audio>
        <button type="button" class="clab-audio-wave clab-video-controls-interactive" title="\u5355\u51FB\u6CE2\u5F62\u64AD\u653E / \u6682\u505C" aria-label="\u64AD\u653E\u97F3\u9891" aria-pressed="false">
            <canvas class="clab-audio-wave-base" aria-hidden="true"></canvas><canvas class="clab-audio-wave-played" aria-hidden="true"></canvas><span class="clab-audio-wave-status">\u6CE2\u5F62\u52A0\u8F7D\u4E2D\u2026</span>
        </button>
        <div class="clab-audio-progress-container clab-video-controls-interactive"><div class="clab-audio-progress-bar"></div><input class="clab-audio-seek" type="range" min="0" max="1000" value="0" aria-label="\u97F3\u9891\u64AD\u653E\u8FDB\u5EA6"></div>
        <div class="clab-audio-controls-row">
            <span class="clab-audio-time"><span class="clab-timecode-current">00:00</span> / <span class="clab-timecode-total">00:00</span></span>
            <div class="clab-audio-tools-right">
                <div class="clab-volume-wrap clab-video-controls-interactive">
                    <div class="clab-volume-slider-container clab-aud-vol-slider" title="\u8C03\u8282\u97F3\u91CF"><div class="clab-volume-slider-track"><div class="clab-volume-slider-fill"></div><div class="clab-volume-slider-thumb"></div></div></div>
                    <button type="button" class="clab-media-opt-btn clab-opt-mute" title="\u9759\u97F3 / \u53D6\u6D88\u9759\u97F3" aria-label="\u9759\u97F3 / \u53D6\u6D88\u9759\u97F3">
                        <svg class="clab-vol-icon-high" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                        <svg class="clab-vol-icon-muted" style="display:none;" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19"/><path d="m17 9 6 6m0-6-6 6"/></svg>
                    </button>
                </div>
                <div class="clab-media-opt-wrapper clab-video-controls-interactive">
                    <button type="button" class="clab-media-opt-btn clab-audio-speed-toggle" title="\u64AD\u653E\u901F\u5EA6" aria-label="\u64AD\u653E\u901F\u5EA6" aria-expanded="false"><span class="clab-audio-speed-val">1\xD7</span></button>
                    <div class="clab-media-dropdown clab-audio-speed-dropdown">${[.5,1,1.5,2].map(r=>`<div class="clab-media-dropdown-item clab-audio-preset" data-spd="${r}">${r}\xD7</div>`).join("")}</div>
                </div>
            </div>
        </div>
    </div>`}function ua(e,t=!1){let i=e.querySelector("audio"),r=e.querySelector(".clab-audio-wave-base"),n=e.querySelector(".clab-audio-wave-played");if(!i||!r)return;let a=Es.get(e);if(!a){a={url:"",peaks:null,requested:!1,disposed:!1},a.redraw=()=>{Mn(r,a.peaks),Mn(n,a.peaks,1)};let l=new ResizeObserver(a.redraw);l.observe(r),Es.set(e,a),Di(e,()=>{a.disposed=!0,l.unobserve(r),Es.delete(e)})}let s=i.getAttribute("src"),o=e.querySelector(".clab-audio-wave-status");s!==a.url&&(Object.assign(a,{url:s,peaks:null,requested:!1}),o.textContent="\u6CE2\u5F62\u52A0\u8F7D\u4E2D\u2026",o.hidden=!1,e.style.setProperty("--clab-audio-progress","0%"),a.redraw()),!(!t||!s||a.requested)&&(a.requested=!0,ha(s).then(l=>{a.disposed||a.url!==s||(a.peaks=l,o.hidden=!0,a.redraw())}).catch(()=>{!a.disposed&&a.url===s&&(o.textContent="\u6CE2\u5F62\u4E0D\u53EF\u7528")}))}function bi(e=document.querySelectorAll(".clab-audio-player")){e.forEach(t=>{let i=t.querySelector("audio");if(!i)return;let r=i.muted||i.volume===0;t.querySelector(".clab-vol-icon-high").style.display=r?"none":"block",t.querySelector(".clab-vol-icon-muted").style.display=r?"block":"none",t.querySelector(".clab-volume-slider-fill").style.width=`${r?0:i.volume*100}%`,t.querySelector(".clab-volume-slider-thumb").style.right=`${r?0:i.volume*100}%`;let n=t.querySelector(".clab-audio-wave");n.setAttribute("aria-label",i.paused?"\u64AD\u653E\u97F3\u9891":"\u6682\u505C\u97F3\u9891"),n.setAttribute("aria-pressed",String(!i.paused)),t.querySelector(".clab-audio-speed-val").textContent=`${i.playbackRate}\xD7`;let a=Number.isFinite(i.duration)&&i.duration>0?i.currentTime/i.duration:0;t.style.setProperty("--clab-audio-progress",`${a*100}%`),t.querySelector(".clab-audio-progress-bar").style.width=`${a*100}%`,t.querySelector(".clab-audio-seek").value=a*1e3;let s=t.querySelector(".clab-timecode-current");s.textContent=i.dataset.isScrubbing==="true"?pr(i.currentTime,30):Ni(i.currentTime),s.style.color=i.dataset.isScrubbing==="true"?"#4caf50":"",t.querySelector(".clab-timecode-total").textContent=Ni(i.duration)})}function As(e){e.querySelectorAll(".clab-audio-player").forEach(t=>{if(ua(t),t.dataset.binded)return;t.dataset.binded="1";let i=t.querySelector("audio"),r=t.querySelector(".clab-audio-speed-dropdown"),n=t.querySelector(".clab-audio-speed-toggle"),a=null;Di(t,()=>{a?.(),r.remove()}),t.querySelector(".clab-audio-wave").onclick=h=>{h.stopPropagation(),clearTimeout(i._scrubTimer),i.dataset.isScrubbing="false",i.dataset.wasPlayingBeforeScrub="false",i.paused?i.play().catch(()=>{}):i.pause()},t.addEventListener("wheel",h=>{if(!Number.isFinite(i.duration)||i.duration<=0||h.target.closest(".clab-volume-wrap, .clab-media-opt-wrapper, .clab-audio-progress-container"))return;let u=h.deltaY||h.deltaX;u&&(h.preventDefault(),h.stopPropagation(),i.paused||(i.dataset.wasPlayingBeforeScrub="true",i.pause()),i.dataset.isScrubbing="true",i.currentTime=Math.max(0,Math.min(i.duration,i.currentTime+u*.002)),bi([t]),clearTimeout(i._scrubTimer),i._scrubTimer=setTimeout(()=>{i.dataset.isScrubbing="false",bi([t]);let d=i.dataset.wasPlayingBeforeScrub==="true";i.dataset.wasPlayingBeforeScrub="false",d&&i.isConnected&&i.play().catch(()=>{})},400))},{passive:!1}),t.querySelector(".clab-opt-mute").onclick=h=>{h.stopPropagation(),i.muted||i.volume===0?(i.muted=!1,i.volume=.8):i.muted=!0,bi([t])};let s=h=>{!Number.isFinite(i.duration)||i.duration<=0||(i.currentTime=Math.max(0,Math.min(1,h))*i.duration,bi([t]))};t.querySelector(".clab-audio-seek").oninput=h=>s(Number(h.target.value)/1e3);let o=(h,u,d=!1)=>{h.addEventListener("mousedown",p=>{if(p.button!==0)return;p.preventDefault(),p.stopPropagation(),a?.();let v=d&&!i.paused;d&&i.pause();let f=m=>u(m.clientX),g=()=>{window.removeEventListener("mousemove",f),window.removeEventListener("mouseup",g),a=null,v&&i.isConnected&&i.play().catch(()=>{})};a=g,u(p.clientX),window.addEventListener("mousemove",f),window.addEventListener("mouseup",g)})},l=t.querySelector(".clab-audio-progress-container");o(l,h=>{let u=l.getBoundingClientRect();u.width&&s((h-u.left)/u.width)},!0);let c=t.querySelector(".clab-aud-vol-slider");o(c,h=>{let u=c.getBoundingClientRect();u.width&&(i.muted=!1,i.volume=Math.max(0,Math.min(1,1-(h-u.left)/u.width)),bi([t]))}),n.onclick=h=>{h.stopPropagation();let u=r.classList.contains("show");if(document.querySelectorAll(".clab-media-dropdown.show").forEach(p=>{p.classList.remove("show"),p._originalParent&&p._originalParent.appendChild(p)}),u){n.setAttribute("aria-expanded","false");return}r._originalParent||=r.parentElement,document.body.append(r);let d=n.getBoundingClientRect();r.style.bottom=`${window.innerHeight-d.top+6}px`,r.style.left=`${Math.max(4,Math.min(d.right-84,window.innerWidth-88))}px`,r.classList.add("show"),n.setAttribute("aria-expanded","true")},r.querySelectorAll(".clab-audio-preset").forEach(h=>{h.onclick=u=>{u.stopPropagation(),i.playbackRate=Number(h.dataset.spd),r.classList.remove("show"),r._originalParent.append(r),n.setAttribute("aria-expanded","false"),bi([t])}})})}var ac="\u5DE5\u4F5C\u533A 1",Rs="\u901A\u9053 1";var Hd=["targetNodeId","targetWidget","targetNodeIds","targetWidgets","runtimeNodeBypassed","runtimeNodeDisabled","dataType","autoHeight","ratio","width","height","matchMedia","fillMode"];function sc(e){return`${e}_${Date.now()}_${Math.floor(Math.random()*1e3)}`}function da(e){if(typeof structuredClone=="function")try{return structuredClone(e)}catch{}return JSON.parse(JSON.stringify(e))}function oc(e){return!e||typeof e!="object"||Array.isArray(e)?{}:da(e)}function Vd(e){let t={};return!e||typeof e!="object"||Hd.forEach(i=>{if(e[i]!==void 0){if(Array.isArray(e[i])){t[i]=[...e[i]];return}if(e[i]&&typeof e[i]=="object"){t[i]=da(e[i]);return}t[i]=e[i]}}),t}function Wd(e){let t={};return Array.isArray(e)&&e.forEach(i=>{i?.areas?.forEach(r=>{r?.id&&(t[r.id]=Vd(r))})}),t}function lc(e=Rs,t={}){return{id:t.id||sc("channel"),name:t.name||e,bindings:oc(t.bindings),toolbarState:t.toolbarState&&typeof t.toolbarState=="object"&&!Array.isArray(t.toolbarState)?da(t.toolbarState):{}}}function Gd(e,t=0){let i=`${Rs} ${t+1}`,r=lc(e?.name||i,e||{});return r.bindings=oc(e?.bindings),r.toolbarState=e?.toolbarState&&typeof e.toolbarState=="object"&&!Array.isArray(e.toolbarState)?da(e.toolbarState):{},r}function jd(e=ac,t={}){let i=Array.isArray(t.cards)?t.cards:[],r=Array.isArray(t.channels)&&t.channels.length>0?t.channels.map((a,s)=>Gd(a,s)):[lc(Rs,{bindings:Wd(i)})],n=t.activeChannelId&&r.some(a=>a.id===t.activeChannelId)?t.activeChannelId:r[0].id;return{id:t.id||sc("workspace"),name:t.name||e,cards:i,activeCardId:t.activeCardId||null,selectedCardIds:Array.isArray(t.selectedCardIds)?t.selectedCardIds:[],selectedAreaIds:Array.isArray(t.selectedAreaIds)?t.selectedAreaIds:[],painterMode:!!t.painterMode,painterSource:t.painterSource||null,scrollLeft:Number.isFinite(t.scrollLeft)?t.scrollLeft:0,activeChannelId:n,channels:r}}var si=jd(ac),Xd=si.channels[0],Cs={schemaVersion:3,activeWorkspaceId:si.id,workspaces:[si],cards:si.cards,activeCardId:si.activeCardId,selectedCardIds:si.selectedCardIds,selectedAreaIds:si.selectedAreaIds,painterMode:si.painterMode,painterSource:si.painterSource,activeChannelId:si.activeChannelId,channels:si.channels,toolbarState:Xd?.toolbarState||{}};function wi(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function uc(e){return wi(e).replace(/"/g,"&quot;")}function qd(e){try{let t=new URL(e,window.location.origin);if(["http:","https:","mailto:"].includes(t.protocol))return t.href}catch{}return""}function Ls(e){let t=String(e??""),i=/("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|(\/\*[\s\S]*?(?:\*\/|$)|#[^\n]*|\/\/[^\n]*)|\b(true|false|null|undefined|True|False|None)\b|\b(\d+(?:\.\d+)?)\b|\b(function|return|const|let|var|if|else|for|while|class|import|export|from|async|await|try|catch|def|lambda)\b/g,r="",n=0;for(let a of t.matchAll(i)){let s=a[1]?"string":a[2]?"comment":a[3]?"boolean":a[4]?"number":"keyword";r+=wi(t.slice(n,a.index)),r+=`<span class="clab-text-token-${s}">${wi(a[0])}</span>`,n=a.index+a[0].length}return r+wi(t.slice(n))}function Is(e,t=!1){let i=[],a=String(e??"").replace(/`([^`]+)`/g,(s,o)=>{let l=t?Ls(o):wi(o);return i.push(`<code class="clab-text-inline-code">${l}</code>`),`\0${i.length-1}\0`}).split(/(\[[^\]]+\]\([^)]+\))/g).map((s,o)=>{if(o%2){let[,l,c]=s.match(/^\[([^\]]+)\]\(([^)]+)\)$/),h=qd(c),u=wi(l);return h?`<a class="clab-text-link" href="${uc(h)}" target="_blank" rel="noopener noreferrer">${u}</a>`:u}return wi(s).replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>").replace(/\*([^*]+)\*/g,"<em>$1</em>").replace(/~~([^~]+)~~/g,"<del>$1</del>")}).join("");return a=a.replace(/\u0000(\d+)\u0000/g,(s,o)=>i[Number(o)]||""),a}function cc(e,t=!1){return String(e??"").split(`
`).map(i=>Is(i,t)).join("<br>")}function Yd(e,t=!1){let i=String(e??"").replace(/\r\n?/g,`
`).split(`
`),r=[],n=s=>/^\s*(?:`{3,}|#{1,6}\s|>\s?|[-*+]\s+|\d+\.\s+)/.test(s),a=0;for(;a<i.length;){let s=i[a++];if(!s.trim())continue;let o=s.match(/^\s*(`{3,})([^`]*)$/);if(o){let u=[],d=new RegExp("^\\s*`{"+o[1].length+",}\\s*$");for(;a<i.length&&!d.test(i[a]);)u.push(i[a++]);let p=u.join(`
`)+(u.length&&a<i.length?`
`:"");a<i.length&&a++;let v=t?Ls(p):wi(p),f=o[2].trim(),g=f?`<div class="clab-text-code-lang">${wi(f)}</div>`:"";r.push(`<div class="clab-text-code-block">${g}<pre class="clab-text-code-pre"><code>${v}</code></pre></div>`);continue}let l=s.match(/^\s*(#{1,6})\s+(.*)$/);if(l){let u=l[1].length;r.push(`<h${u} class="clab-text-heading h${u}">${Is(l[2],t)}</h${u}>`);continue}if(/^\s*>/.test(s)){let u=[s.replace(/^\s*>\s?/,"")];for(;a<i.length&&/^\s*>/.test(i[a]);)u.push(i[a++].replace(/^\s*>\s?/,""));r.push(`<blockquote class="clab-text-quote">${cc(u.join(`
`),t)}</blockquote>`);continue}let c=/^\s*\d+\.\s+/.test(s)?/^\s*\d+\.\s+/:/^\s*[-*+]\s+/;if(c.test(s)){let u=/^\s*\d/.test(s)?"ol":"ul",d=[s.replace(c,"")];for(;a<i.length&&c.test(i[a]);)d.push(i[a++].replace(c,""));r.push(`<${u} class="clab-text-list">${d.map(p=>`<li>${Is(p,t)}</li>`).join("")}</${u}>`);continue}let h=[s];for(;a<i.length&&i[a].trim()&&!n(i[a]);)h.push(i[a++]);r.push(`<p class="clab-text-paragraph">${cc(h.join(`
`),t)}</p>`)}return r.join("")}function $d(e,t=!1){return`<pre class="clab-text-plain"><code>${t?Ls(e):wi(e)}</code></pre>`}var hc=new WeakMap;function Ps(e){if(wn(e),e.missingHistoryRun)return'<div class="clab-text-state">\u8BE5\u6B21\u8FD0\u884C\u65E0\u53EF\u7528\u8BB0\u5F55</div>';if(e.textLoadState==="missing")return'<div class="clab-text-state clab-text-state-missing">\u5A92\u4F53\u4E22\u5931</div>';if((e.textLoadState==="loading"||e.textLoadState==="idle")&&e.resultUrl&&!e.textContent)return'<div class="clab-text-state">\u6B63\u5728\u8BFB\u53D6\u6587\u5B57...</div>';let t=e.textContent||"",i=hc.get(e);if(i&&i.source===t&&i.markdown===e.textPreviewMarkdown&&i.syntax===e.textSyntaxHighlight)return i.html;let r=e.textPreviewMarkdown?Yd(t,e.textSyntaxHighlight):$d(t,e.textSyntaxHighlight);return hc.set(e,{source:t,markdown:e.textPreviewMarkdown,syntax:e.textSyntaxHighlight,html:r}),r}function dc(e){for(let t of Cs.cards){let i=t?.areas?.find(r=>r.id===e);if(i)return i}return null}function Kd(e){if(window._clabSurgicallyUpdateArea){window._clabSurgicallyUpdateArea(e),window._clabJustSave&&window._clabJustSave();return}window.CLab&&typeof window.CLab.saveState=="function"&&window.CLab.saveState(Cs)}async function Zd(e,t){let i=dc(e);if(!i)return;wn(i);let r=String(i.textContent||"");if(!r)return;let n=t?.innerHTML,a=c=>{t.innerHTML=c==="\u5DF2\u590D\u5236"?'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>':'<span aria-hidden="true">!</span>',t.title=c,t.setAttribute("aria-label",c)},s=()=>{t.innerHTML=n,t.title="\u590D\u5236\u5168\u6587",t.setAttribute("aria-label","\u590D\u5236\u5168\u6587")},o=()=>{t&&(a("\u5DF2\u590D\u5236"),t.disabled=!0,setTimeout(()=>{s(),t.disabled=!1},1200))},l=()=>{t&&(a("\u590D\u5236\u5931\u8D25"),setTimeout(()=>{t.title==="\u590D\u5236\u5931\u8D25"&&s()},1200))};try{await navigator.clipboard.writeText(r),o()}catch{let h=document.createElement("textarea");h.value=r,h.setAttribute("readonly","true"),h.style.position="fixed",h.style.left="-9999px";try{document.body.appendChild(h),h.select(),document.execCommand("copy")?o():l()}catch{l()}finally{h.remove()}}}function pc(e){if(!e||e._clabLayoutFrame)return;let t=e.querySelector(".clab-text-body-scroll"),i=e.querySelector(".clab-text-body-content");if(!t||!i)return;let r=Math.max(160,Math.floor(e.clientWidth||0));if(!r)return;let n=r;e._clabLayoutFrame=requestAnimationFrame(()=>{if(e._clabLayoutFrame=0,!e.isConnected)return;t.style.maxHeight=`${n}px`;let a=Math.ceil(i.scrollHeight||0);!a||a<=n?(t.style.height=`${Math.max(a,32)}px`,t.style.overflowY="hidden"):(t.style.height=`${n}px`,t.style.overflowY="auto")})}function Jd(e,t=dc,i=Kd){if(!e||e.dataset.clabTextBound==="1")return;e.dataset.clabTextBound="1";let r=e.dataset.area,n=e.querySelector(".clab-text-body-scroll");n&&(n.setAttribute("draggable","false"),n.addEventListener("dragstart",a=>{a.preventDefault()}),n.addEventListener("mousedown",a=>{a.stopPropagation()}),n.addEventListener("click",a=>{a.stopPropagation()})),e.querySelectorAll(".clab-text-option input[type='checkbox']").forEach(a=>{a.addEventListener("change",s=>{let o=t(r);o&&(wn(o),s.target.dataset.option==="syntax"&&(o.textSyntaxHighlight=!!s.target.checked),s.target.dataset.option==="markdown"&&(o.textPreviewMarkdown=!!s.target.checked),i(r))})}),window._clabTextPreviewResizeObserver||(window._clabTextPreviewResizeObserver=new ResizeObserver(a=>{a.forEach(({target:s,contentRect:o})=>{s._clabLayoutWidth!==o.width&&(s._clabLayoutWidth=o.width,pc(s))})})),window._clabTextPreviewResizeObserver.observe(e),Di(e,()=>{window._clabTextPreviewResizeObserver.unobserve(e),cancelAnimationFrame(e._clabLayoutFrame),delete e.dataset.clabTextBound})}function Ds(e){wn(e);let t=e.missingHistoryRun?"\u2014":e.historyIndex>=0?e.historyIndex+1:e.history.length;return`
        <div class="clab-text-preview-shell" data-area="${e.id}" data-history-url="${uc(e.resultUrl||"")}">
            <div class="clab-text-body-scroll">
                <div class="clab-text-body-content">${Ps(e)}</div>
            </div>
            <div class="clab-text-toolbar">
                <label class="clab-text-option" title="\u8BED\u6CD5\u9AD8\u4EAE">
                    <input type="checkbox" data-option="syntax" ${e.textSyntaxHighlight?"checked":""}>
                    <span>\u8BED\u6CD5\u9AD8\u4EAE</span>
                </label>
                <label class="clab-text-option" title="\u9884\u89C8Markdown">
                    <input type="checkbox" data-option="markdown" ${e.textPreviewMarkdown?"checked":""}>
                    <span>\u9884\u89C8Markdown</span>
                </label>
                ${e.history.length>1?`<span class="clab-text-history-position" title="\u5386\u53F2\u8BB0\u5F55\uFF1A${t} / ${e.history.length}\uFF1B\u2190 / \u2192 \u5173\u8054\u5207\u6362\uFF1BShift + \u2190 / \u2192 \u4EC5\u5207\u6362\u5F53\u524D\u8F93\u51FA\u6A21\u5757">${t} / ${e.history.length}</span>`:""}
            </div>
        </div>
    `}function pa(e,{resolveArea:t,refreshArea:i}={}){e.querySelectorAll(".clab-text-preview-shell").forEach(r=>{Jd(r,t,i),pc(r)}),e.querySelectorAll(".clab-text-copy-btn").forEach(r=>{r.dataset.clabTextCopyBound!=="1"&&(r.dataset.clabTextCopyBound="1",r.addEventListener("click",n=>{n.preventDefault(),n.stopPropagation(),Zd(r.dataset.area,r)}))})}function Qd(e,t){if(/^(data:|blob:)/i.test(t))return t;let i=new URL(e,window.location.origin);if(i.origin!==window.location.origin)throw new Error("\u4EC5\u652F\u6301\u672C\u5730\u6A21\u578B\u8D44\u6E90");let r=String(t).replace(/\\/g,"/");if(/^(?:[a-z]+:|\/\/)/i.test(r))throw new Error("\u4E0D\u52A0\u8F7D\u6A21\u578B\u4E2D\u7684\u5916\u90E8\u7F51\u7EDC\u8D44\u6E90");if(i.pathname.endsWith("/view")){let a=i.searchParams.get("subfolder")||"",s=new URL(r,`https://model.invalid/${a.replace(/^\/+/,"")}/`),o=decodeURIComponent(s.pathname).slice(1).split("/"),l=o.pop();return`${i.pathname}?${new URLSearchParams({filename:l,type:i.searchParams.get("type")||"output",subfolder:o.join("/")})}`}let n=new URL(r,i);if(n.origin!==i.origin)throw new Error("\u4EC5\u652F\u6301\u672C\u5730\u6A21\u578B\u8D44\u6E90");return n.href}function ep(e){let t=new TextDecoder,i=new DataView(e),r=new Map,n=c=>{c=c.replace(/\\/g,"/");let h=c.split("/").pop();/^(?:[a-z]+:|\/)/i.test(c)||r.set(h,c)};if(!t.decode(e.slice(0,21)).startsWith("Kaydara FBX Binary")){for(let c of t.decode(e).matchAll(/(?:RelativeFilename|FileName|Filename):\s*"([^"]+)"/g))n(c[1]);return r}let a=i.getUint32(23,!0)>=7500,s=a?25:13,o=c=>a?Number(i.getBigUint64(c,!0)):i.getUint32(c,!0),l=[[27,e.byteLength]];for(;l.length;){let[c,h]=l.pop();for(;c+s<=h;){let u=o(c),d=o(c+(a?16:8)),p=i.getUint8(c+s-1);if(!u||u<=c||u>h)break;let v=t.decode(e.slice(c+s,c+s+p)),f=c+s+p;if(["RelativeFilename","FileName","Filename"].includes(v)&&d>=5&&i.getUint8(f)===83){let g=i.getUint32(f+1,!0);g<=d-5&&n(t.decode(e.slice(f+5,f+5+g)))}f+d+s<=u&&l.push([f+d,u]),c=u}}return r}async function fc(e,t,i,r,n={read:(a,s)=>fetch(a,s),resolve:Qd}){let a=await n.read(t,{signal:i});if(!a.ok)throw new Error(`\u8BFB\u53D6\u6587\u4EF6\u5931\u8D25\uFF08HTTP ${a.status}\uFF09`);let s=await a.arrayBuffer();i.throwIfAborted();let o=new URL(t,window.location.origin==="null"?"https://offline.invalid":window.location.origin),c=(o.searchParams.get("filename")||o.pathname).split(".").pop().toLowerCase(),h=new e.LoadingManager,u=[h],d=new Set,p=c==="fbx"?ep(s):new Map,v=!1;h.setURLModifier(S=>(S.startsWith("blob:")&&d.add(S),n.resolve(t,p.get(S)||S))),h.addHandler(/\.tga$/i,new e.TGALoader(h)),h.onError=()=>{v=!0,r("\u90E8\u5206\u8D34\u56FE\u672A\u80FD\u52A0\u8F7D\uFF0C\u8BF7\u68C0\u67E5\u914D\u5957\u6587\u4EF6")};let f=()=>{d.forEach(S=>URL.revokeObjectURL(S)),d.clear()};h.onLoad=()=>{f(),r(v?"\u90E8\u5206\u8D34\u56FE\u672A\u80FD\u52A0\u8F7D\uFF0C\u8BF7\u68C0\u67E5\u914D\u5957\u6587\u4EF6":"")};let g=()=>{u.forEach(S=>S.abort?.()),f(),i.removeEventListener("abort",g)};i.addEventListener("abort",g,{once:!0});let m=()=>new TextDecoder().decode(s),y,x=[],_;try{if(c==="glb"||c==="gltf"){let S;if(c==="glb"){let A=new DataView(s);if(s.byteLength<20||A.getUint32(0,!0)!==1179937895||A.getUint32(4,!0)!==2)throw new Error("\u6587\u4EF6\u4E0D\u662F\u6709\u6548\u7684 GLB 2.0 \u6A21\u578B");S=JSON.parse(new TextDecoder().decode(new Uint8Array(s,20,A.getUint32(12,!0))))}else S=JSON.parse(m());if(S.extensionsRequired?.some(A=>["KHR_draco_mesh_compression","EXT_meshopt_compression","KHR_meshopt_compression","KHR_texture_basisu"].includes(A)))throw new Error("\u8BE5\u6A21\u578B\u9700\u8981\u989D\u5916\u7684\u538B\u7F29\u89E3\u7801\u5668\uFF0C\u8BF7\u4F7F\u7528\u672A\u538B\u7F29\u7684\u6A21\u578B\u6587\u4EF6");let E=await new e.GLTFLoader(h).parseAsync(c==="glb"?s:m(),"");y=E.scene,x=E.animations}else if(c==="fbx")y=new e.FBXLoader(h).parse(s,""),x=y.animations||[];else if(c==="obj"){let S=new e.OBJLoader(h),E=m(),A=[...E.matchAll(/^mtllib\s+(.+)$/gm)].map(C=>C[1].trim());if(A.length){let C={};for(let b of A)try{let w=n.resolve(t,b),R=await n.read(w,{signal:i});if(!R.ok)throw new Error(`HTTP ${R.status}`);let G=new e.LoadingManager;u.push(G),G.setURLModifier(W=>n.resolve(w,W)),G.onLoad=h.onLoad,G.onError=h.onError;let V=new e.MTLLoader(G).parse(await R.text(),"");V.preload(),Object.assign(C,V.materials)}catch{i.throwIfAborted(),h.onError(b)}S.setMaterials({create:b=>C[b]||new e.MeshStandardMaterial({color:12041413,roughness:.8})})}y=S.parse(E)}else if(c==="stl"||c==="ply"){if(c==="ply"&&/property\s+float\s+(?:f_dc_0|scale_0|opacity)\b/.test(new TextDecoder().decode(s.slice(0,16384))))throw new Error("\u8FD9\u662F\u9AD8\u65AF\u6CFC\u6E85 PLY\uFF0C\u5F53\u524D\u4EC5\u652F\u6301\u666E\u901A\u7F51\u683C\u548C\u70B9\u4E91 PLY");let S=c==="stl"?new e.STLLoader().parse(s):new e.PLYLoader().parse(s),E=!!S.getAttribute("color");c==="ply"&&!S.index?(S.computeBoundingSphere(),y=new e.Points(S,new e.PointsMaterial({color:E?16777215:12041413,vertexColors:E,size:Math.max(S.boundingSphere.radius*.006,.001)}))):(S.getAttribute("normal")||S.computeVertexNormals(),y=new e.Mesh(S,new e.MeshStandardMaterial({color:E?16777215:12041413,vertexColors:E,roughness:.8})))}else if(c==="bvh"){let S=new e.BVHLoader().parse(m());y=new e.Group,y.add(S.skeleton.bones[0]),y.skeleton=S.skeleton;let E=new e.SkeletonHelper(S.skeleton.bones[0]);E.material.depthTest=!1,E.material.toneMapped=!1,y.add(E),x=[S.clip],y.updateMatrixWorld(!0),_=new e.Box3,S.skeleton.bones.forEach(A=>_.expandByPoint(A.getWorldPosition(new e.Vector3)))}else throw new Error(`\u6682\u4E0D\u652F\u6301 ${c.toUpperCase()} \u9884\u89C8`);return{object:y,clips:x.filter(S=>S.duration>0&&S.tracks.length),bounds:_,release:g}}catch(S){throw g(),S}}var hd=e=>String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t]),ri=new Map,vs=new WeakSet,gs,gb,Gl;function yn(e){return`<div class="clab-glb-viewer" data-model-url="${hd(e)}">
        <div class="clab-model-toolbar">
            <span class="clab-model-warning" hidden></span>
            <button type="button" class="clab-model-reset">\u91CD\u7F6E\u89C6\u89D2</button>
        </div>
        <div class="clab-model-canvas" aria-label="3D \u6A21\u578B\uFF1A\u5DE6\u952E\u62D6\u52A8\u65CB\u8F6C\uFF0C\u4E2D\u952E\u6216\u53F3\u952E\u62D6\u52A8\u5E73\u79FB\uFF0C\u6EDA\u8F6E\u7F29\u653E\uFF0CShift\uFF0B\u6EDA\u8F6E\u8C03\u8282\u52A8\u753B\u8FDB\u5EA6"></div>
        <div class="clab-model-status" role="status">\u6B63\u5728\u8BFB\u53D6\u6A21\u578B\u2026</div>
        <div class="clab-model-animation" hidden>
            <div class="clab-model-playback-row">
                <button type="button" class="clab-model-play" aria-label="\u64AD\u653E\u52A8\u753B" aria-pressed="false">\u25B6</button>
                <span class="clab-model-time">00:00 / 00:00</span>
                <select class="clab-model-clips" aria-label="\u52A8\u753B\u7247\u6BB5"></select>
                <select class="clab-model-speed" aria-label="\u64AD\u653E\u901F\u5EA6">${[.25,.5,1,1.5,2].map(t=>`<option value="${t}" ${t===1?"selected":""}>${t}\xD7</option>`).join("")}</select>
            </div>
            <input type="range" class="clab-model-seek" min="0" max="1" step="0.001" value="0" aria-label="\u52A8\u753B\u64AD\u653E\u8FDB\u5EA6" title="Shift\uFF0B\u6EDA\u8F6E\u8C03\u8282\u8FDB\u5EA6\uFF1B\u6EDA\u8F6E\u7F29\u653E\u89C6\u56FE">
        </div>
    </div>`}function cd(e){let t=new Set;e?.traverse(i=>{i.geometry&&t.add(i.geometry);for(let r of Array.isArray(i.material)?i.material:[i.material])if(r){t.add(r);for(let n of Object.values(r))n?.isTexture&&t.add(n)}i.skeleton&&t.add(i.skeleton)});for(let i of t)i.image?.close?.(),i.dispose()}function ud(e,t,i){let r=new AbortController,n=e.querySelector(".clab-model-canvas"),a=e.querySelector(".clab-model-status"),s=e.querySelector(".clab-model-animation"),o=e.querySelector(".clab-model-play"),l=e.querySelector(".clab-model-seek"),c=e.querySelector(".clab-model-time"),h=e.querySelector(".clab-model-clips"),u=e.querySelector(".clab-model-speed"),d=e.querySelector(".clab-model-reset"),p=e.querySelector(".clab-model-warning"),v,f,g,m,y,x,_,S,E,A=[],C=0,b=0,w=!1,R=0,G,V=!1,W=!1,O;a.hidden=!1,a.textContent="\u6B63\u5728\u8BFB\u53D6\u6A21\u578B\u2026",p.hidden=!0,s.hidden=!0;let z=()=>{l.value=t.time,c.textContent=`${V?pr(t.time,30):Ni(t.time)} / ${Ni(R)}`,c.classList.toggle("scrubbing",V),o.textContent=t.playing?"\u2161":"\u25B6",o.setAttribute("aria-label",t.playing?"\u6682\u505C\u52A8\u753B":"\u64AD\u653E\u52A8\u753B"),o.setAttribute("aria-pressed",String(t.playing))},j=()=>{S&&(S.paused=!1,S.enabled=!0,_.setTime(t.time))},H=te=>{C=0,!(w||!v)&&(t.playing&&R>0&&(t.time=(t.time+Math.min((te-b)/1e3,.1)*t.speed)%R,j(),z()),b=te,v.render(g,f.object),t.playing&&R>0&&(C=requestAnimationFrame(H)))},$=()=>{!C&&!w&&v&&(C=requestAnimationFrame(H))},U=()=>{clearTimeout(G),V=!1,W=!1},se=()=>{U(),t.playing=!t.playing,b=performance.now(),z(),$()},ie=()=>{V&&(V=!1,t.playing=W,W=!1,b=performance.now(),z(),$())},le=()=>{V||(W=t.playing,t.playing=!1,V=!0),clearTimeout(G)},ae=te=>{t.time=Math.max(0,Math.min(R,te)),j(),z(),$()},N=te=>{if(!R||!te.shiftKey||te.target.closest("select,button"))return;let pe=te.deltaY||te.deltaX;pe&&(te.preventDefault(),te.stopImmediatePropagation(),le(),ae(t.time+pe*.002),G=setTimeout(ie,400))};e.addEventListener("wheel",N,{capture:!0,passive:!1});let Y=te=>{te.button===0&&te.target.tagName==="CANVAS"&&(O=[te.clientX,te.clientY])},J=te=>{O&&R&&te.button===0&&Math.hypot(te.clientX-O[0],te.clientY-O[1])<4&&se(),O=null};e.addEventListener("pointerdown",Y),e.addEventListener("pointerup",J),l.onpointerdown=()=>le(),l.oninput=()=>ae(Number(l.value)),window.addEventListener("pointerup",ie),window.addEventListener("pointercancel",ie),window.addEventListener("blur",ie),o.onclick=te=>{te.stopPropagation(),se()},u.value=t.speed,u.onchange=()=>{t.speed=Number(u.value)};let de=()=>{if(w)return;V&&(t.playing=W),w=!0,r.abort(),E?.(),cancelAnimationFrame(C),clearTimeout(G),window.removeEventListener("pointerup",ie),window.removeEventListener("pointercancel",ie),window.removeEventListener("blur",ie),e.removeEventListener("wheel",N,!0),e.removeEventListener("pointerdown",Y),e.removeEventListener("pointerup",J),x?.disconnect(),f?.dispose(),_?.stopAllAction(),m&&_?.uncacheRoot(m),cd(m),y?.dispose(),v?.dispose(),v?.forceContextLoss(),n.replaceChildren(),s.hidden=!0,d.onclick=o.onclick=l.oninput=l.onpointerdown=u.onchange=h.onchange=null;let te=ri.get(e);te&&(te.capture=null),delete e.dataset.modelLoaded};return(async()=>{let te=await(gb||=Promise.resolve().then(()=>(ld(),od)));if(w)return;let pe=await fc(te,e.dataset.modelUrl,r.signal,ot=>{w||(p.textContent=ot,p.hidden=!ot,$())},i);if(w){pe.release(),cd(pe.object);return}m=pe.object,A=pe.clips,E=pe.release,v=new te.WebGLRenderer({antialias:!0}),v.setPixelRatio(Math.min(window.devicePixelRatio||1,2)),v.outputColorSpace=te.SRGBColorSpace,v.toneMapping=te.ACESFilmicToneMapping,n.replaceChildren(v.domElement),ri.get(e).capture=()=>(v.render(g,f.object),v.domElement.toDataURL("image/png")),g=new te.Scene,g.background=new te.Color("#191919");let $e=new te.RoomEnvironment,L=new te.PMREMGenerator(v);y=L.fromScene($e),$e.dispose(),L.dispose(),g.environment=y.texture,g.add(new te.HemisphereLight(16777215,5592405,2));let We=new te.DirectionalLight(16777215,3);We.position.set(3,5,4),g.add(We,m);let Be=new te.PerspectiveCamera(45,1,.01,1e3);if(f=new te.OrbitControls(Be,v.domElement),f.mouseButtons.MIDDLE=te.MOUSE.PAN,f.addEventListener("change",$),A.length){s.hidden=!1,_=new te.AnimationMixer(m),h.innerHTML=A.map((lt,it)=>`<option value="${it}">${hd(lt.name||`\u52A8\u753B ${it+1}`)}</option>`).join(""),h.hidden=A.length<2;let ot=lt=>{_.stopAllAction(),S=_.clipAction(A[lt]),S.reset().setLoop(te.LoopOnce,1).play(),S.clampWhenFinished=!0,R=A[lt].duration,l.max=R,t.clip=lt,t.time=Math.min(t.time,R),h.value=lt,j(),z(),b=performance.now(),$()};ot(Math.min(t.clip,A.length-1)),h.onchange=()=>{U(),t.time=0,ot(Number(h.value))}}else t.playing=!1;m.updateMatrixWorld(!0);let Qe=pe.bounds||new te.Box3().setFromObject(m),Ee=Qe.getCenter(new te.Vector3),tt=Qe.getSize(new te.Vector3),Re=()=>{let ot=Math.max(1,n.clientWidth),lt=Math.max(1,n.clientHeight),it=Math.max(tt.x,tt.y,tt.z,.001),I=it/(2*Math.tan(Be.fov*Math.PI/360))*Math.max(1,lt/ot)*1.5;Be.near=Math.max(it/1e3,1e-5),Be.far=I+it*100,Be.position.copy(Ee).add(new te.Vector3(.8,.5,1).normalize().multiplyScalar(I)),f.target.copy(Ee),f.update(),Be.updateProjectionMatrix(),$()},Le=()=>{!n.clientWidth||!n.clientHeight||(v.setSize(n.clientWidth,n.clientHeight,!1),Be.aspect=n.clientWidth/n.clientHeight,Be.updateProjectionMatrix(),$())};x=new ResizeObserver(Le),x.observe(n),Le(),Re(),d.onclick=ot=>{ot.stopPropagation(),Re()},a.hidden=!0,e.dataset.modelLoaded="1"})().catch(te=>{w||(de(),a.hidden=!1,a.textContent=`\u65E0\u6CD5\u9884\u89C8\uFF1A${te.message}`)}),de}function jl(e){let t=ri.get(e);if(!t)return;let i=e.closest(".clab-preview-modal"),r=!document.hidden&&vs.has(e)&&(i?i.classList.contains("visible"):!!e.closest("#clab-panel.visible"));r&&!t.stop?t.stop=ud(e,t.state,t.resources):!r&&t.stop&&(t.stop(),t.stop=null)}function Xl(e,t){gs||(gs=new IntersectionObserver(r=>r.forEach(({target:n,isIntersecting:a})=>{a?vs.add(n):vs.delete(n),jl(n)})),document.addEventListener("visibilitychange",()=>ri.forEach((r,n)=>jl(n))));let i=document.getElementById("clab-panel");i&&!Gl&&(Gl=new MutationObserver(()=>ri.forEach((r,n)=>jl(n))),Gl.observe(i,{attributes:!0,attributeFilter:["class"]})),e.querySelectorAll(".clab-glb-viewer").forEach(r=>{if(ri.has(r))return;ri.set(r,{stop:null,resources:t,state:{time:0,playing:!1,speed:1,clip:0}}),gs.observe(r);let n,a=!1;r.addEventListener("pointerdown",s=>{s.button===2&&(n=[s.clientX,s.clientY],a=!1)}),r.addEventListener("pointermove",s=>{n&&s.buttons&2&&Math.hypot(s.clientX-n[0],s.clientY-n[1])>=4&&(a=!0)}),r.addEventListener("contextmenu",s=>{s.preventDefault(),a&&s.stopPropagation()});for(let s of["pointerdown","mousedown","auxclick","dragstart"])r.addEventListener(s,o=>{o.stopPropagation(),(s==="dragstart"||s==="mousedown"&&o.target.tagName==="CANVAS")&&o.preventDefault()});Di(r,()=>vb(r))})}function vb(e){ri.get(e)?.stop?.(),ri.delete(e),gs?.unobserve(e),vs.delete(e)}async function dd(e,{width:t=300,height:i=200,resources:r,signal:n}={}){n?.throwIfAborted();let a=ri.get(e);if(a?.capture)return a.capture();let s=document.createElement("div");s.className="clab-preview-modal visible",s.style.cssText=`position:fixed;inset:auto;left:-100000px;top:0;width:${t}px;height:${i}px;opacity:0;pointer-events:none`,s.innerHTML=yn(e.dataset.modelUrl),document.body.append(s);let o=s.firstElementChild,l={state:{time:a?.state.time||0,clip:a?.state.clip||0,speed:1,playing:!1},resources:a?.resources||r};ri.set(o,l);let c,h,u,d=new Promise((v,f)=>{let g=()=>{o.dataset.modelLoaded?v():o.querySelector(".clab-model-status").textContent.startsWith("\u65E0\u6CD5\u9884\u89C8")&&f(new Error(o.querySelector(".clab-model-status").textContent))};c=new MutationObserver(g),c.observe(o,{childList:!0,subtree:!0,attributes:!0}),h=setTimeout(()=>f(new Error("3D \u9884\u89C8\u622A\u56FE\u8D85\u65F6")),15e3),u=()=>f(new DOMException("\u5DF2\u53D6\u6D88\u5C01\u9762\u622A\u56FE","AbortError")),n?.addEventListener("abort",u,{once:!0})}),p=ud(o,l.state,l.resources);try{return await d,l.capture()}finally{clearTimeout(h),c.disconnect(),n?.removeEventListener("abort",u),p(),ri.delete(o),s.remove()}}function pd(){if(document.getElementById("clab-media-styles"))return;let e=document.createElement("style");e.id="clab-media-styles",e.innerHTML=`
        /* --- \u89C6\u9891\u7EC4\u4EF6\u6837\u5F0F --- */
        .clab-video-player { position: relative; width: 100%; height: 100%; overflow: hidden; background: #000; cursor: pointer; }
        .clab-video-controls {
            position: absolute; inset: 0; opacity: 0; transition: opacity 0.3s;
            background: linear-gradient(transparent 70%, rgba(0,0,0,0.8) 100%);
            pointer-events: none; display: flex; flex-direction: column; justify-content: flex-end;
        }
        .clab-video-player:hover .clab-video-controls, .clab-video-player:focus-within .clab-video-controls, .clab-video-paused .clab-video-controls { opacity: 1; }

        .clab-video-toolbar {
            display: flex; justify-content: space-between; align-items: center;
            gap:6px; padding: 0 8px 9px; width: 100%; box-sizing: border-box; pointer-events: none;
        }

        .clab-timecode { display:flex; align-items:center; height:24px; color:#ddd; font:11px/1 sans-serif; font-variant-numeric:tabular-nums; white-space:nowrap; pointer-events:none; }
        .clab-video-speed-val { display:block; font:11px/1 sans-serif; }

        .clab-video-tools-right { display:flex; align-items:center; gap:8px; height:24px; margin-left:auto; pointer-events:auto; }
        .clab-video-tools-right .clab-media-opt-btn { box-sizing:border-box; height:24px; min-height:24px; font:11px/1 sans-serif; }
        .clab-video-tools-right svg { display:block; flex-shrink:0; }
        .clab-video-controls-interactive { pointer-events: auto; }

        /* --- \u5168\u65B0\u7684\u81EA\u5B9A\u4E49\u97F3\u91CF\u6ED1\u6746\u60AC\u6D6E\u6548\u679C --- */
        .clab-volume-wrap {
            display: flex; align-items: center; justify-content: flex-end; overflow: visible;
            border-radius: 12px; background: transparent; transition: background 0.2s;
        }
        .clab-volume-wrap:not(.no-audio):hover, .clab-volume-wrap.is-active { background: rgba(0,0,0,0.6); }

        .clab-volume-slider-container {
            width: 0; opacity: 0; margin: 0; transition: width 0.2s ease, opacity 0.2s ease, margin 0.2s ease;
            cursor: pointer; height: 24px; display: block; position: relative;
        }
        .clab-volume-wrap:not(.no-audio):hover .clab-volume-slider-container,
        .clab-volume-slider-container.is-dragging {
            width: 50px; opacity: 1; margin-left: 8px; margin-right: 2px;
        }

        .clab-volume-slider-track {
            width: 100%; height: 3px; background: rgba(255,255,255,0.3); border-radius: 2px; position: absolute; top: 50%; transform: translateY(-50%); pointer-events: none;
        }
        .clab-volume-slider-fill {
            position: absolute; right: 0; top: 0; height: 100%; background: #fff; border-radius: 2px;
        }
        .clab-volume-slider-thumb {
            position: absolute; right: 0; top: 50%; transform: translate(50%, -50%); width: 8px; height: 8px; border-radius: 50%; background: #fff;
        }

        .clab-media-opt-wrapper { position: relative; }
        .clab-media-opt-btn { background: transparent; border: none; color: #aaa; cursor: pointer; padding: 4px; border-radius: 4px; transition: color 0.15s; display: flex; align-items: center; justify-content: center; }
        .clab-media-opt-btn:hover { color:#fff; }

        /* \u7A81\u7834\u88C1\u5207\u7684\u5168\u5C40\u83DC\u5355\u6837\u5F0F */
        .clab-media-dropdown {
            position: fixed;
            background: var(--comfy-menu-bg, #292929); border: 1px solid #505050;
            border-radius: 7px; box-shadow: 0 8px 28px rgba(0,0,0,0.45);
            display: none; flex-direction: column; min-width: 150px; z-index: 100000; padding: 4px 0;
        }
        .clab-media-dropdown.show { display: flex; }
        .clab-media-dropdown-item { padding: 6px 10px; font-size: 12px; color: #ddd; cursor: pointer; white-space: nowrap; transition: background 0.1s; font-family: sans-serif; }
        .clab-media-dropdown-item:hover { background: rgba(255,255,255,0.1); color: #fff; }
        .clab-more-dropdown .clab-media-dropdown-item { text-align: left; }

        .clab-vid-speed-opt:hover { background: rgba(255,255,255,0.2) !important; color: #fff !important; }

        .clab-video-progress-container { position: absolute; bottom: 0; left: 0; width: 100%; height: 4px; background: rgba(255,255,255,0.3); cursor: pointer; pointer-events: auto; }
        .clab-video-progress-container:hover { height: 6px; }
        .clab-video-progress-bar { height: 100%; width: 0%; background: #ccc; pointer-events: none; }

        /* --- \u97F3\u9891\u7EC4\u4EF6\u6837\u5F0F --- */
        .clab-audio-player { display:flex; flex-direction:column; height:100%; padding:8px 12px 6px; box-sizing:border-box; width:100%; min-width:0; background:#1d1d1d; border-radius:4px; }
        .clab-audio-wave { display:block; width:100%; flex:1 0 72px; height:72px; min-height:72px; margin:0; padding:0; border:0; border-radius:0; background:transparent; position:relative; cursor:pointer; }
        .clab-audio-wave:focus-visible { outline:1px solid #aaa; outline-offset:2px; }
        .clab-audio-wave canvas { position:absolute; inset:0; display:block; width:100%; height:100%; pointer-events:none; }
        .clab-audio-wave-played { clip-path:inset(0 calc(100% - var(--clab-audio-progress, 0%)) 0 0); }
        .clab-audio-wave-status { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; color:#888; font:11px sans-serif; pointer-events:none; }
        .clab-audio-wave-status[hidden] { display:none; }
        .clab-audio-progress-container { width:100%; height:3px; background:rgba(255,255,255,0.2); border-radius:2px; margin:4px 0 8px; cursor:pointer; position:relative; }
        .clab-audio-progress-bar { height:100%; width:0%; background:#ccc; border-radius:inherit; pointer-events:none; }
        .clab-audio-seek { position:absolute; left:0; top:-5px; width:100%; height:13px; padding:0; margin:0; opacity:0; cursor:pointer; }
        .clab-audio-progress-container:focus-within { outline:1px solid #aaa; outline-offset:3px; }
        .clab-audio-controls-row { display:flex; align-items:center; gap:6px; min-width:0; padding-top:5px; border-top:1px solid rgba(255,255,255,.09); }
        .clab-audio-time { font:11px sans-serif; font-variant-numeric:tabular-nums; white-space:nowrap; color:#aaa; }
        .clab-audio-tools-right { display:flex; align-items:center; gap:5px; margin-left:auto; }
        .clab-audio-tools-right .clab-volume-wrap { position:relative; }
        .clab-audio-tools-right .clab-volume-slider-container { position:absolute; right:25px; background:#252525; border-radius:4px; z-index:3; }
        .clab-audio-speed-toggle { min-width:25px; font:11px sans-serif; }
        .clab-audio-speed-dropdown { min-width:84px; }

        .clab-media-speed-wrap {
            display: flex; align-items: center; background: rgba(0,0,0,0.5);
            border: 1px solid #555; border-radius: 4px; padding: 2px 4px; position: relative;
        }
        .clab-media-speed-input {
            width: 30px; background: transparent; border: none; color: #eee;
            font-size: 11px; outline: none; text-align: center; font-family: sans-serif;
        }
        .clab-media-speed-input::-webkit-outer-spin-button, .clab-media-speed-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }

        /* --- \u6587\u4EF6\u7EC4\u4EF6\u6837\u5F0F --- */
        .clab-file-display { border-radius:4px; text-align:center; color:#999; background:#191919; display:flex; gap:10px; flex-direction:column; justify-content:center; align-items:center; padding:18px; width:100%; height:100%; min-height:120px; box-sizing:border-box; }
        .clab-file-name { width:100%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font:12px sans-serif; color:#aaa; }
        .clab-file-preview-note { font:11px/1.5 sans-serif; color:#888; overflow-wrap:anywhere; }
        .clab-file-download { color:#aaa; border:1px solid #444; border-radius:5px; padding:4px 10px; text-decoration:none; font:12px sans-serif; transition:color .15s, border-color .15s; }
        .clab-file-download:hover { color:#fff; border-color:#777; }
        .clab-model-reset { border:1px solid #444; border-radius:5px; background:#242424; color:#aaa; padding:4px 9px; font:11px sans-serif; cursor:pointer; transition:color .15s,border-color .15s; }
        .clab-model-reset:hover { color:#fff; border-color:#777; }
        .clab-output-area > .clab-preview-bg-model { width:calc(100% - 16px); margin:0 8px; box-sizing:border-box; border:1px solid #444; border-radius:5px; }
        .clab-glb-viewer { display:flex; flex-direction:column; width:100%; height:100%; min-height:0; min-width:0; position:relative; background:#191919; cursor:default; }
        .clab-model-toolbar { display:flex; align-items:flex-start; flex-shrink:0; gap:8px; padding:6px 8px; min-width:0; }
        .clab-model-canvas { position:relative; flex:1; min-height:0; min-width:0; overflow:hidden; cursor:grab; }
        .clab-model-canvas:active { cursor:grabbing; }
        .clab-model-canvas canvas { display:block; width:100%; height:100%; touch-action:none; }
        .clab-model-status { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; padding:14px; box-sizing:border-box; color:#aaa; text-align:center; font:12px/1.5 sans-serif; pointer-events:none; }
        .clab-model-status[hidden] { display:none; }
        .clab-model-reset { flex-shrink:0; margin-left:auto; white-space:nowrap; }
        .clab-model-warning { min-width:0; overflow-wrap:anywhere; color:#b9a77c; font:10px/1.4 sans-serif; pointer-events:none; }
        .clab-model-animation { flex-shrink:0; padding:5px 8px 4px; border-top:1px solid #333; background:#202020; min-width:0; }
        .clab-model-animation[hidden], .clab-model-clips[hidden], .clab-model-warning[hidden] { display:none; }
        .clab-model-playback-row { display:flex; align-items:center; gap:6px; min-height:20px; min-width:0; color:#aaa; font:10px sans-serif; }
        .clab-model-play { display:flex; align-items:center; justify-content:center; width:20px; height:20px; flex-shrink:0; border:0; padding:0; background:transparent; color:#aaa; cursor:pointer; }
        .clab-model-play:hover { color:#fff; }
        .clab-model-time { white-space:nowrap; font-variant-numeric:tabular-nums; }
        .clab-model-time.scrubbing { color:#4caf50; }
        .clab-model-clips, .clab-model-speed { min-width:0; height:20px; max-width:100px; border:0; background:#292929; color:#aaa; font:10px sans-serif; padding:0; }
        .clab-model-clips { flex:1; }
        .clab-model-speed { margin-left:auto; width:43px; flex-shrink:0; }
        .clab-model-seek { display:block; width:100%; height:10px; margin:3px 0 0; accent-color:#aaa; cursor:pointer; }

        .clab-text-preview-shell {
            width: 100%;
            min-width: 0;
            display: flex;
            flex-direction: column;
            box-sizing: border-box;
            color: #ddd;
        }
        .clab-text-toolbar {
            display: flex;
            align-items: center;
            gap: 8px;
            min-width: 0;
            box-sizing: border-box;
            min-height: 34px;
            padding: 8px 14px;
            border-top: 1px solid rgba(255,255,255,0.08);
        }
        .clab-text-option {
            display: inline-flex;
            margin: 0;
            padding: 0;
            flex: 0 1 auto;
            min-width: 20px;
            align-items: center;
            gap: 6px;
            color: #aaa;
            font-size: 11px;
            font-family: sans-serif;
            line-height: 16px;
            min-height: 16px;
            cursor: pointer;
            accent-color: #aaa;
            user-select: none;
        }
        .clab-text-option > span {
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .clab-text-option input {
            flex-shrink: 0;
            width: 14px;
            height: 14px;
            margin: 0;
            cursor: pointer;
        }
        .clab-text-history-position {
            flex-shrink: 0;
            margin-left: auto;
            color: #999;
            font: 11px/16px sans-serif;
            font-variant-numeric: tabular-nums;
            white-space: nowrap;
        }
        .clab-text-body-scroll {
            width: 100%;
            overflow-x: hidden;
            border: 0;
            box-sizing: border-box;
            scrollbar-width: thin;
            scrollbar-color: rgba(255,255,255,0.28) transparent;
            cursor: text;
        }
        .clab-text-body-scroll::-webkit-scrollbar {
            width: 5px;
            height: 5px;
        }
        .clab-text-body-scroll::-webkit-scrollbar-track {
            background: transparent;
        }
        .clab-text-body-scroll::-webkit-scrollbar-thumb {
            background: rgba(255,255,255,0.28);
            border-radius: 999px;
        }
        .clab-text-body-scroll::-webkit-scrollbar-thumb:hover {
            background: rgba(255,255,255,0.4);
        }
        .clab-text-body-content {
            padding: 12px 14px;
            font-family: "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
            line-height: 1.55;
            color: #ddd;
            word-break: break-word;
            user-select: text;
            -webkit-user-select: text;
            cursor: text;
        }
        .clab-text-body-content > :last-child { margin-bottom: 0; }
        .clab-text-state {
            min-height: 56px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: rgba(238, 243, 248, 0.72);
            font-family: "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
            font-size: 12px;
            text-align: center;
        }
        .clab-text-state-missing {
            color: #ff8f8f;
        }
        .clab-text-plain,
        .clab-text-code-pre {
            margin: 0;
            white-space: pre-wrap;
            word-break: break-word;
            font-family: "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
            font-size: 12px;
            line-height: 1.6;
            user-select: text;
            -webkit-user-select: text;
            cursor: text;
        }
        .clab-text-plain code,
        .clab-text-code-pre code {
            font-family: inherit;
            font-size: inherit;
        }
        .clab-text-inline-code {
            padding: 0.15em 0.35em;
            border-radius: 4px;
            background: rgba(255,255,255,0.08);
            font-family: "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
            font-size: 0.95em;
        }
        .clab-text-code-block {
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 8px;
            background: rgba(0,0,0,0.26);
            overflow: hidden;
            margin: 0 0 10px 0;
        }
        .clab-text-code-lang {
            padding: 6px 10px;
            background: rgba(255,255,255,0.06);
            color: rgba(255,255,255,0.68);
            font-size: 10px;
            font-family: sans-serif;
            letter-spacing: 0.04em;
            text-transform: uppercase;
        }
        .clab-text-code-pre {
            padding: 10px 12px;
            overflow-x: auto;
        }
        .clab-text-heading {
            margin: 0 0 10px 0;
            line-height: 1.3;
            font-family: sans-serif;
        }
        .clab-text-heading.h1 { font-size: 22px; }
        .clab-text-heading.h2 { font-size: 19px; }
        .clab-text-heading.h3 { font-size: 16px; }
        .clab-text-heading.h4, .clab-text-heading.h5, .clab-text-heading.h6 { font-size: 14px; }
        .clab-text-paragraph {
            margin: 0 0 10px 0;
            font-size: 12px;
        }
        .clab-text-list {
            margin: 0 0 10px 18px;
            padding: 0;
            font-size: 12px;
        }
        .clab-text-quote {
            margin: 0 0 10px 0;
            padding: 8px 12px;
            border-left: 3px solid rgba(110, 193, 255, 0.7);
            background: rgba(110, 193, 255, 0.08);
            color: rgba(238, 243, 248, 0.9);
        }
        .clab-text-link {
            color: #7fc8ff;
            text-decoration: none;
            cursor: pointer;
        }
        .clab-text-link:hover {
            text-decoration: underline;
        }
        .clab-text-token-string { color: #f7b267; }
        .clab-text-token-number { color: #7fd8be; }
        .clab-text-token-boolean { color: #ff7aa2; }
        .clab-text-token-keyword { color: #7cb7ff; font-weight: 600; }
        .clab-text-token-comment { color: #7f8da1; font-style: italic; }
    `,document.head.appendChild(e)}function _i(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function fd(e){try{let t=new URL(e,window.location.origin);if(["http:","https:","mailto:"].includes(t.protocol))return t.href}catch{}return""}function md(e,t){let i=String(e??"");return t==="upper"?i.toUpperCase():t==="lower"?i.toLowerCase():t==="capitalize"?i.replace(/\p{L}[\p{L}\p{M}'’]*/gu,r=>r[0].toUpperCase()+r.slice(1).toLowerCase()):i}function gd(e){return`color:${/^#[0-9a-f]{6}$/i.test(e.color||"")?e.color:"#999999"};font-size:${Math.max(8,Math.min(48,Number(e.size)||12))}px;font-weight:${e.bold?700:400};font-style:${e.italic?"italic":"normal"};text-decoration:${[e.underline&&"underline",e.strike&&"line-through"].filter(Boolean).join(" ")||"none"}`}function vd(e,t=new Set){return e.map((i,r)=>{let n=i.style,a=["left","center","right","justify"].includes(n.row.align)?n.row.align:"left",s=Math.max(.8,Math.min(4,Number(n.row.lineHeight)||1.6)),o=r<e.length-1?Math.max(0,Math.min(128,Number(n.row.gap)||0)):0,l=n.row.layout==="block"?Math.max(0,Math.min(128,Number(n.row.blockGap)||0)):0;return`<div class="clab-detail-field ${t.has(i.id)?"selected":""}" data-detail-field="${_i(i.id)}" tabindex="0" style="font-size:${Math.max(8,Math.min(48,Number(n.value.size)||12))}px;line-height:${s};margin-bottom:${o}px;text-align:${a};text-align-last:${a==="justify"?"left":"auto"}"><span class="clab-detail-key" style="${gd(n.key)};display:${n.row.layout==="block"?"block":"inline"};margin-bottom:${l}px">${_i(md(i.title,n.key.case))}${n.row.layout==="block"?"":"\uFF1A"}</span><span class="clab-detail-value" style="${gd(n.value)}">${_i(md(i.value,n.value.case))}</span></div>`}).join("")}var _d=`
.clab-detail-board{display:grid;grid-template-columns:repeat(var(--detail-columns,3),minmax(0,1fr));gap:16px;align-items:stretch;align-content:start;width:calc(var(--detail-row-width,960px) + 32px);margin-inline:auto;padding:16px;box-sizing:border-box;background:#171717;color:#ddd;font-family:Arial,'Microsoft YaHei',sans-serif}
.clab-detail-card{display:flex;flex-direction:column;min-width:0;border:1px solid #3b3b3b;border-radius:7px;background:#202020;overflow:hidden;box-sizing:border-box;outline:none}
.clab-detail-card.active{border-color:#8199aa}.clab-detail-title{display:flex;align-items:center;gap:8px;padding:8px 10px;color:#bbb;font:12px/1.4 Arial,'Microsoft YaHei',sans-serif;min-width:0}
.clab-detail-title strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:500;flex:1}.clab-detail-history{display:flex;align-items:center;gap:5px;color:#888;font-size:10px;white-space:nowrap}
.clab-detail-card .clab-detail-history button{border:0;background:transparent;padding:1px 3px;color:#aaa;cursor:pointer;font:12px sans-serif}.clab-detail-history button:disabled{opacity:.3}
.clab-detail-history button[data-detail-pool]{display:inline-flex;align-items:center;justify-content:center;gap:4px;height:18px;padding:0 2px;color:#999;font-size:10px;line-height:14px}.clab-detail-history button[data-detail-pool]>span{display:block;line-height:14px}.clab-detail-history button[data-detail-pool]:hover{color:#fff}.clab-detail-history svg{display:block;width:14px;height:14px;flex:none}.clab-detail-history:has([data-detail-pool]){gap:10px}
.clab-detail-media{position:relative;flex:none;width:100%;aspect-ratio:var(--detail-media-ratio,1.6);min-height:120px;overflow:hidden;background:#141414}
.clab-detail-media>img,.clab-detail-media>video{position:absolute;inset:0;width:100%;height:100%;display:block;object-fit:contain}.clab-detail-media>.clab-preview-video{position:absolute;inset:0}.clab-detail-media .clab-preview-video-transform{position:absolute;inset:0;transform-origin:center}.clab-detail-media .clab-preview-video-transform video{width:100%;height:100%;object-fit:contain;pointer-events:none}
.clab-detail-media .clab-audio-player{border-radius:0}.clab-detail-media .clab-glb-viewer{height:100%}.clab-detail-media .clab-text-preview-shell{height:100%;min-height:0;display:flex;flex-direction:column;box-sizing:border-box}.clab-detail-media .clab-text-body-scroll{flex:1;min-height:0;overflow:auto!important;max-height:none!important}
.clab-detail-data{padding:10px 12px;min-width:0}.clab-detail-field{padding:0;border-radius:3px;white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.6;outline:none;cursor:text;min-width:0}.clab-detail-field.selected{outline:1px dashed #6e8493;outline-offset:2px}.clab-detail-key,.clab-detail-value{white-space:pre-wrap;overflow-wrap:anywhere}
.clab-detail-note{margin-top:auto;padding:0 12px 9px;color:#888;font:10px/1.5 Arial,'Microsoft YaHei',sans-serif}.clab-detail-note:empty{display:none}.clab-detail-empty{display:flex;align-items:center;justify-content:center;height:100%;padding:12px;box-sizing:border-box;color:#888;font:12px/1.6 sans-serif;text-align:center}
`;function xd(e,{view:t={x:0,y:0,zoom:1},playback:i={},status:r,active:n=()=>!0}={}){let a=[...e.querySelectorAll("video")],s=a[0],o=[...e.querySelectorAll(".clab-preview-video-transform, .clab-compare-transform")],l=new AbortController,{signal:c}=l,h=nc(e,a),u=e.querySelector("[data-compare-audio]"),d=0,p=0,v=!1,f=!1,g=!1,m=!1,y=!1,x=!1,_,S=!1,E=()=>a.every(U=>Number.isFinite(U.duration))?Math.min(...a.map(U=>U.duration)):0,A=()=>Ss(e,a),C=()=>o.forEach(U=>{U.style.transform=`translate(${t.x}px,${t.y}px) scale(${t.zoom})`});C();let b=()=>{x=!1,a.forEach(U=>U.pause()),cancelAnimationFrame(d),d=0,A()},w=U=>{let se=Math.max(0,Math.min(E(),U));a.forEach(ie=>{ie.readyState&&(ie.currentTime=se)}),A()},R=()=>{if(d=0,!(v||s.paused||document.hidden)){E()&&s.currentTime>=E()-.03&&w(0);for(let U of a.slice(1))Math.abs(U.currentTime-s.currentTime)>.08&&(U.currentTime=s.currentTime);A(),d=requestAnimationFrame(R)}};s.addEventListener("play",()=>{d||(d=requestAnimationFrame(R))},{signal:c});let G=async()=>{if(!(a.some(U=>!U.readyState)||v)){x=!0,E()&&s.currentTime>=E()-.03&&w(0);try{if(await Promise.all(a.map(U=>U.play())),v){b();return}A(),d||(d=requestAnimationFrame(R))}catch(U){!v&&U.name!=="AbortError"&&(b(),r&&(r.textContent="\u89C6\u9891\u65E0\u6CD5\u64AD\u653E\uFF0C\u8BF7\u68C0\u67E5\u683C\u5F0F\u6216\u6587\u4EF6\u662F\u5426\u6709\u6548\u3002"))}}},V=()=>{let U=!s.paused||g||m;g=!1,m=!1,f=!1,clearTimeout(p),a.forEach(se=>{se.dataset.isScrubbing="false"}),e.querySelector(".clab-timecode").style.color="",U?b():G()},W=U=>U.closest("button,input,select,[role=slider],.clab-video-controls-interactive,.clab-media-dropdown");e.addEventListener("click",U=>{U.button===0&&!W(U.target)&&!S&&V(),S=!1},{signal:c}),document.addEventListener("keydown",U=>{n()&&(U.code!=="Space"||U.ctrlKey||U.metaKey||U.altKey||U.isComposing||U.target.closest?.("input,textarea,select,[contenteditable=true]")||(U.preventDefault(),U.repeat||V()))},{signal:c});let O=()=>{f&&(f=!1,a.forEach(U=>{U.dataset.isScrubbing="false"}),e.querySelector(".clab-timecode").style.color="",A(),g&&G(),g=!1)};e.addEventListener("wheel",U=>{if(W(U.target)){U.ctrlKey&&U.preventDefault();return}if(U.preventDefault(),U.stopPropagation(),U.ctrlKey){let le=(U.target.closest(".clab-compare-pane")||e).getBoundingClientRect(),ae=t.zoom;t.zoom=Math.max(.2,Math.min(8,ae*(U.deltaY<0?1.12:.9)));let N=t.zoom/ae,Y=U.clientX-le.left-le.width/2,J=U.clientY-le.top-le.height/2;t.x=Y-(Y-t.x)*N,t.y=J-(J-t.y)*N,C();return}if(!E())return;f||(g=!s.paused,b(),f=!0),clearTimeout(p),w(s.currentTime+(U.deltaY||U.deltaX)*.002),a.forEach(ie=>{ie.dataset.isScrubbing="true"});let se=e.querySelector(".clab-timecode");se.textContent=pr(s.currentTime,30),se.style.color="#4CAF50",p=setTimeout(O,400)},{passive:!1,signal:c}),e.addEventListener("pointerdown",U=>{W(U.target)||U.button!==1||(U.preventDefault(),e.setPointerCapture(U.pointerId),_={x:U.clientX,y:U.clientY,ox:t.x,oy:t.y},S=!1)},{signal:c}),e.addEventListener("pointermove",U=>{if(!_)return;let se=U.clientX-_.x,ie=U.clientY-_.y;Math.abs(se)+Math.abs(ie)>3&&(S=!0),t.x=_.ox+se,t.y=_.oy+ie,C()},{signal:c});let z=()=>{_=null};e.addEventListener("pointerup",z,{signal:c}),e.addEventListener("pointercancel",z,{signal:c}),e.addEventListener("auxclick",U=>{U.button===1&&U.preventDefault()},{signal:c}),window.addEventListener("blur",z,{signal:c});let j=()=>{let U=u?.value==="b"?1:u?.value==="a"?0:-1;a.forEach((se,ie)=>{se.muted=ie!==U}),A()};u?.addEventListener("change",j,{signal:c});let H=()=>{u&&(u.value=a[1]&&!a[1].muted?"b":s.muted?"mute":"a")},$=()=>{A(),!(y||a.some(U=>!U.readyState))&&(y=!0,a.forEach(U=>{U.playbackRate=i.speed||1,U.volume=i.volume??1}),u?(u.value=i.audio||"mute",j()):s.muted=i.muted??window._clabVideoMuted!==!1,e.querySelector(".clab-media-speed-input").value=s.playbackRate,w(i.time||0),(i.playing??window._clabIsVideoAutoplayEnabled?.())&&G())};for(let U of a){for(let se of["timeupdate","play","pause","volumechange","ratechange"])U.addEventListener(se,A,{signal:c});U.addEventListener("loadedmetadata",$,{signal:c}),U.addEventListener("durationchange",$,{signal:c}),U.addEventListener("volumechange",H,{signal:c}),U.addEventListener("error",()=>{b(),r&&(r.textContent="\u89C6\u9891\u65E0\u6CD5\u8BFB\u53D6\u6216\u6D4F\u89C8\u5668\u4E0D\u652F\u6301\u6B64\u683C\u5F0F\u3002")},{signal:c}),U.addEventListener("waiting",()=>{a.length>1&&!f&&!s.paused&&(m=!0,b())},{signal:c}),U.addEventListener("canplay",()=>{m&&a.every(se=>se.readyState>=3)&&(m=!1,G())},{signal:c}),U.addEventListener("ended",()=>{x&&(w(0),G())},{signal:c})}return document.addEventListener("visibilitychange",()=>{document.hidden&&(g=!1,b())},{signal:c}),$(),()=>{Object.assign(i,{time:s.currentTime,speed:s.playbackRate,volume:(a.find(U=>!U.muted)||s).volume,audio:u?.value,muted:s.muted,playing:!s.paused||g||m}),v=!0,l.abort(),clearTimeout(p),cancelAnimationFrame(d),h(),a.forEach(U=>{U.pause(),U.removeAttribute("src"),U.load()})}}var xb=0;function yd(e,{textOptions:t}={}){if(!e)return'<div class="clab-detail-empty">\u5C1A\u65E0\u8F93\u51FA\u8BB0\u5F55</div>';let i=_i(e.url);return e.type==="image"?`<img loading="lazy" draggable="false" src="${i}" alt="${_i(e.name)}">`:e.type==="video"?`<div class="clab-preview-video clab-video-player clab-video-paused"><div class="clab-preview-video-transform"><video src="${i}" preload="metadata" muted playsinline></video></div>${rc()}<div class="clab-preview-video-status" role="status"></div></div>`:e.type==="audio"?Ts({id:`detail-audio-${++xb}`},i,""):e.type==="model"?yn(e.url):e.type==="text"?Ds(bd(e,t)):`<div class="clab-detail-empty"><a href="${_i(fd(e.url))}" target="_blank" rel="noopener noreferrer">${_i(e.name||"\u6253\u5F00\u6587\u4EF6")}</a></div>`}function bd(e,t={}){return{id:"detail-text",type:"preview",resultUrl:e.url,history:[e.url],historyIndex:0,textHistory:[e.text||""],textContent:e.text||"",textSyntaxHighlight:!!t.syntax,textPreviewMarkdown:!!t.markdown}}function wd(e,t,{active:i=()=>!0,resources:r,textOptions:n={}}={}){let a=new AbortController,{signal:s}=a;e.style.removeProperty("--detail-media-ratio");let o=e.querySelector(":scope>img"),l=e.querySelector("video"),c=()=>{let x=o?.naturalWidth||l?.videoWidth,_=o?.naturalHeight||l?.videoHeight;x&&_&&e.style.setProperty("--detail-media-ratio",x/_)};o?.addEventListener("load",c,{signal:s}),l?.addEventListener("loadedmetadata",c,{signal:s}),c();let h,u=0,d=!1,p=e.querySelector(".clab-preview-video");p&&(h=xd(p,{active:i,status:p.querySelector(".clab-preview-video-status")}));let v=e.querySelector(".clab-audio-player"),f=e.querySelector("audio"),g=()=>{u=0,d&&!f.paused&&!document.hidden&&(bi([v]),u=requestAnimationFrame(g))},m=()=>{f&&(bi([v]),f.paused||document.hidden||!d?(cancelAnimationFrame(u),u=0):u||(u=requestAnimationFrame(g)))};if(f){As(e);for(let x of["play","pause","timeupdate","volumechange","ratechange","loadedmetadata"])f.addEventListener(x,m,{signal:s});document.addEventListener("visibilitychange",m,{signal:s})}let y=f||p?new IntersectionObserver(x=>{for(let{isIntersecting:_}of x)d=_,f&&(ua(v,_),_||f.pause(),m()),p&&!_&&p.querySelector("video").pause()}):null;if(y?.observe(e),t?.type==="model"&&Xl(e,r),t?.type==="text"){let x=bd(t,n),_=()=>{n.syntax=x.textSyntaxHighlight,n.markdown=x.textPreviewMarkdown,e.querySelector(".clab-text-body-content").innerHTML=Ps(x),pa(e,{resolveArea:()=>x,refreshArea:_})};pa(e,{resolveArea:()=>x,refreshArea:_}),t.text||(r?.read||fetch)(t.url,{signal:s}).then(S=>{if(!S.ok)throw new Error(`HTTP ${S.status}`);return S.text()}).then(S=>{s.aborted||(x.textContent=S,x.textHistory[0]=S,_())}).catch(S=>{s.aborted||(e.querySelector(".clab-text-body-content").textContent=`\u6587\u672C\u8BFB\u53D6\u5931\u8D25\uFF1A${S.message}`)})}return()=>{a.abort(),y?.disconnect(),cancelAnimationFrame(u),h?.(),e.querySelectorAll("video,audio").forEach(_=>{clearTimeout(_._scrubTimer),_.pause(),_.removeAttribute("src"),_.load()});let x=[...e.children];e.replaceChildren(),x.forEach(ic)}}var Md=Promise.resolve();function Sd(e,{resources:t}={}){if(!document.getElementById("clab-detail-cover-styles")){let _=document.createElement("style");_.id="clab-detail-cover-styles",_.textContent=".clab-detail-cover{position:absolute;inset:0;z-index:4;background:#141414;pointer-events:none;overflow:hidden;display:flex;align-items:center;justify-content:center}.clab-detail-cover[hidden]{display:none}.clab-detail-cover>img,.clab-detail-cover>video,.clab-detail-cover>canvas{display:block;width:100%;height:100%;object-fit:contain}.clab-detail-cover>pre{margin:0;padding:12px;box-sizing:border-box;width:100%;height:100%;white-space:pre-wrap;overflow-wrap:anywhere;overflow:hidden;font:12px/1.6 monospace;color:#bbb}.clab-detail-cover>span{color:#999;font:12px/1.5 sans-serif}",document.head.append(_)}let i=new AbortController,{signal:r}=i,n=e.querySelector("video,audio"),a=e.querySelector(".clab-glb-viewer"),s,o,l,c,h=!1,u=!1,d=!1,p=!1,v=_=>{let S=a?.querySelector(".clab-model-play");S&&!a.querySelector(".clab-model-animation").hidden&&S.getAttribute("aria-pressed")!==String(_)&&S.click()},f=()=>{u=!0,h=!1,n?.pause(),v(!1),s&&(s.hidden=!1)},g=()=>{d||document.hidden||(h=!0,u=!1,s&&(s.hidden=!0),n?.play().catch(()=>{}),v(!0))};e.addEventListener("pointerenter",g,{signal:r}),e.addEventListener("pointerleave",f,{signal:r}),n?.addEventListener("play",()=>{d||u||document.hidden?n.pause():s&&(s.hidden=!0)},{signal:r}),document.addEventListener("visibilitychange",()=>{document.hidden&&f()},{signal:r});let m=new IntersectionObserver(_=>{for(let S of _)p=S.isIntersecting,p?s?._detailPrepareCover():f()});m.observe(e);let y=a?new MutationObserver(()=>{v(!!h)}):null;a&&y.observe(a,{attributes:!0,attributeFilter:["data-model-loaded"]});async function x(_,S,E){let A=()=>{E.aborted||(S.dataset.ready="1")};try{if(_.type==="image"||_.type==="video"){let C=document.createElement(_.type==="image"?"img":"video");C.src=_.url,S.append(C),_.type==="video"&&(C.muted=!0,C.playsInline=!0,C.preload="metadata"),await new Promise(b=>{let w=_.type==="image"?"load":"loadeddata";C.addEventListener(w,b,{once:!0,signal:E}),C.addEventListener("error",b,{once:!0,signal:E}),E.addEventListener("abort",b,{once:!0}),(_.type==="image"&&C.complete||_.type==="video"&&C.readyState>=2)&&b()})}else if(_.type==="model"){let C=document.createElement("div");C.innerHTML=yn(_.url);let b=Md.then(()=>dd(C.firstElementChild,{resources:t,signal:E}));Md=b.then(()=>{},()=>{});let w=await b;if(!E.aborted){let R=new Image;R.src=w,await R.decode(),S.replaceChildren(R)}}else if(_.type==="audio"){let C=await ha(_.url);if(E.aborted)return;let b=document.createElement("canvas");S.append(b);let w=()=>{let R=S.hidden;S.hidden=!1,Mn(b,C,0),S.hidden=R};c=new ResizeObserver(w),c.observe(S),w()}else{let C=document.createElement(_.type==="text"?"pre":"span");C.textContent=_.type==="text"?_.text||await(t?.read||fetch)(_.url,{signal:E}).then(b=>{if(!b.ok)throw new Error("\u5C01\u9762\u8BFB\u53D6\u5931\u8D25");return b.text()}):_.name,E.aborted||S.append(C)}}catch(C){if(!E.aborted){let b=document.createElement("span");b.textContent=`\u5C01\u9762\u65E0\u6CD5\u9884\u89C8\uFF1A${C.message}`,S.replaceChildren(b)}}finally{A()}}return{update(_,S){let E=S?_?.key:"";if(o===E||(o=E,l?.abort(),c?.disconnect(),s?.querySelectorAll("video").forEach(b=>{b.removeAttribute("src"),b.load()}),s?.remove(),s=null,!S||!_))return;s=document.createElement("div"),s.className="clab-detail-cover",s.dataset.recordKey=_.key,s.hidden=h||!!n&&!n.paused,e.append(s),l=new AbortController;let A=s,C=l.signal;s._detailPrepareCover=()=>A._detailCoverReady||=x(_,A,C),p&&s._detailPrepareCover()},pause:f,release(){d=!0,i.abort(),m.disconnect(),y?.disconnect(),l?.abort(),c?.disconnect(),s?.querySelectorAll("video").forEach(_=>{_.removeAttribute("src"),_.load()}),s?.remove()}}}var hr=JSON.parse(document.getElementById("clab-detail-data").textContent),yb=window.clabDetailAssets,$l=document.querySelector("main"),Yl=$l.querySelector(".clab-detail-board"),_s=new Map,Kl=new Map,xs=new Map,ys=hr.cards[0]?.id;pd();var Td=document.createElement("style");Td.textContent=_d;document.head.append(Td);function ql(e){let t=new URL(Kl.get(e)||e,"https://offline.invalid");return t.pathname.endsWith("/view")&&(t.searchParams.has("type")||t.searchParams.set("type","output"),t.searchParams.has("subfolder")||t.searchParams.set("subfolder","")),t.searchParams.sort(),`${t.pathname}${t.search}`}function bs(e){if(_s.has(e))return _s.get(e);let t=yb[e];if(!t)throw new Error(`\u7F3A\u5C11\u914D\u5957\u8D44\u6E90\uFF1A${e}`);let[i,r]=t.data.split(","),n=Uint8Array.from(atob(r),s=>s.charCodeAt(0)),a=URL.createObjectURL(new Blob([n],{type:i.match(/^data:([^;]+)/)?.[1]||"application/octet-stream"}));return _s.set(e,a),Kl.set(a,e),a}var Ed={read(e,t){let i=/^(data:|blob:)/.test(e)?e:bs(ql(e));return fetch(i,t)},resolve(e,t){if(/^(data:|blob:)/.test(t))return t;let i=new URL(Kl.get(e)||e,"https://offline.invalid"),r=t.replace(/\\/g,"/"),n;if(i.pathname.endsWith("/view")){let a=new URL(r,`https://offline.invalid/${i.searchParams.get("subfolder")||""}/`),s=decodeURIComponent(a.pathname).slice(1).split("/"),o=s.pop();n=ql(`/view?${new URLSearchParams({filename:o,type:i.searchParams.get("type")||"output",subfolder:s.join("/")})}`)}else n=ql(new URL(r,i).href);return bs(n)}};function Ad(e){ys=e;for(let[t,i]of xs)i.element.classList.toggle("active",t===e)}function Rd(e){let t=xs.get(e.id);if(!t){let o=document.createElement("article");o.className="clab-detail-card",o.dataset.detailCard=e.id,o.tabIndex=0,o.innerHTML='<header class="clab-detail-title"></header><div class="clab-detail-media"></div><div class="clab-detail-data"></div><div class="clab-detail-note"></div>',Yl.append(o),t={element:o,cleanup:null},xs.set(e.id,t)}let i=e.records[e.index],r=t.element;r.querySelector("header").innerHTML=`<strong>${_i(e.title)}</strong><span class="clab-detail-history"><button data-step="-1" ${!e.records.length||e.index<=0?"disabled":""}>\u2039</button><span>${i?`${e.index+1} / ${e.records.length}`:"\u2014"}</span><button data-step="1" ${!e.records.length||e.index>=e.records.length-1?"disabled":""}>\u203A</button></span>`,t.cover?.release(),t.cleanup?.();let n=r.querySelector(".clab-detail-media"),a=i?{...i,url:i.type==="model"?`https://offline.invalid${i.url}`:bs(i.url)}:null;e.textOptions||={},n.innerHTML=yd(a,{textOptions:e.textOptions}),t.cleanup=wd(n,a,{textOptions:e.textOptions,active:()=>ys===e.id,resources:Ed});let s=e.cover?{...e.cover,url:e.cover.type==="model"?`https://offline.invalid${e.cover.url}`:bs(e.cover.url)}:null;t.cover=Sd(n,{resources:Ed}),t.cover.update(s,!!s),r.querySelector(".clab-detail-data").innerHTML=vd(i?.fields||e.fields),r.querySelector(".clab-detail-note").textContent=e.current?"\u5F53\u524D\u53C2\u6570 \xB7 \u5C1A\u65E0\u8F93\u51FA\u8BB0\u5F55":"",Ad(ys)}function Cd(e,t){let i=hr.cards.find(n=>n.id===e);if(!i?.records.length)return;let r=Math.max(0,Math.min(i.records.length-1,i.index+t));r!==i.index&&(i.index=r,Rd(i))}function Id(){Yl.style.setProperty("--detail-columns",hr.columns),Yl.style.setProperty("--detail-row-width",`${hr.rowWidth}px`)}Id();hr.cards.forEach(Rd);document.querySelector(".clab-offline-notice").textContent=(hr.warnings||[]).join(`
`);$l.addEventListener("pointerdown",e=>{let t=e.target.closest("[data-detail-card]");t&&Ad(t.dataset.detailCard)},!0);$l.addEventListener("click",e=>{let t=e.target.closest("[data-step]");t&&Cd(t.closest("[data-detail-card]").dataset.detailCard,Number(t.dataset.step))});document.addEventListener("keydown",e=>{e.defaultPrevented||e.target.closest("input,textarea,select,[contenteditable=true]")||e.ctrlKey||e.metaKey||e.altKey||["ArrowLeft","ArrowRight"].includes(e.key)&&(e.preventDefault(),Cd(ys,e.key==="ArrowLeft"?-1:1))});for(let e of["columns","rowWidth"])document.querySelector(`[data-offline-${e}]`).addEventListener("input",t=>{hr[e]=Number(t.target.value),document.querySelector(`[data-offline-${e}-value]`).textContent=`${hr[e]}${e==="rowWidth"?"px":""}`,Id()});window.addEventListener("mousedown",e=>{e.target.closest(".clab-media-opt-wrapper,.clab-media-dropdown")||document.querySelectorAll(".clab-media-dropdown.show").forEach(t=>{t.classList.remove("show"),t._originalParent?.append(t)})},!0);window.addEventListener("pagehide",()=>{for(let e of xs.values())e.cover?.release(),e.cleanup?.();for(let e of _s.values())URL.revokeObjectURL(e)});})();
/*! Bundled license information:

three/build/three.core.js:
three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2025 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)

three/examples/jsm/libs/fflate.module.js:
  (*!
  fflate - fast JavaScript compression/decompression
  <https://101arrowz.github.io/fflate>
  Licensed under MIT. https://github.com/101arrowz/fflate/blob/master/LICENSE
  version 0.8.2
  *)
*/
