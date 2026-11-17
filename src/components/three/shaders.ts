/**
 * GLSL for the hero "data blob".
 * Vertex shader displaces an icosphere along its normals with layered
 * 3D simplex noise; fragment shader adds a fresnel rim glow.
 */

// 3D simplex noise — Ashima Arts / Stefan Gustavson (MIT)
const simplex = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);
  const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.0-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;
  vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;
  vec4 s1=floor(b1)*2.0+1.0;
  vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
  m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
`;

export const blobVertex = /* glsl */ `
uniform float uTime;
uniform float uIntensity;
uniform vec2 uMouse;
varying vec3 vNormal;
varying vec3 vViewPos;
varying float vDisp;
${simplex}
void main(){
  // Mouse nudges the noise field so the surface "leans" toward the cursor.
  vec3 p = normal * 1.3 + vec3(uMouse * 0.6, 0.0);
  float n = snoise(p + uTime * 0.25);
  n += 0.35 * snoise(normal * 3.2 - uTime * 0.18);
  float d = n * uIntensity;
  vDisp = d;
  vec3 pos = position + normal * d;
  vNormal = normalize(normalMatrix * normal);
  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  vViewPos = -mv.xyz;
  gl_Position = projectionMatrix * mv;
}
`;

export const blobFragment = /* glsl */ `
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uLight;
varying vec3 vNormal;
varying vec3 vViewPos;
varying float vDisp;
void main(){
  vec3 viewDir = normalize(vViewPos);
  float fres = pow(1.0 - max(dot(viewDir, normalize(vNormal)), 0.0), 2.2);
  vec3 base = mix(uColorA, uColorB, smoothstep(-0.25, 0.45, vDisp));
  // Dark core, glowing rim (light theme keeps the core brighter).
  vec3 col = mix(base * mix(0.18, 0.85, uLight), base, fres);
  col += fres * fres * uColorB * 0.8;
  gl_FragColor = vec4(col, 1.0);
}
`;
