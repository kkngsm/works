import { GUI } from "dat.gui";
import {
  GLSL3,
  LinearFilter,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  RGBAFormat,
  Scene,
  ShaderMaterial,
  UnsignedByteType,
  WebGLRenderer,
  WebGLRenderTarget,
} from "three";

import BaseWork from "../templates/BaseWork";
export default class IFS extends BaseWork {
  renderer: WebGLRenderer;
  scene: Scene;
  camera: OrthographicCamera;
  mesh: Mesh;
  requestId: number;
  gui: GUI;
  uniforms: any;
  RayMarchingMaterial: ShaderMaterial;
  ScreenMaterial: ShaderMaterial;
  guiParam: any;
  Tex: WebGLRenderTarget;
  constructor(canvas: HTMLCanvasElement) {
    super(canvas);
    this.renderer = new WebGLRenderer({ canvas });
    this.scene = new Scene();
    this.camera = new OrthographicCamera(-0.5, 0.5, 0.5, -0.5, -10000, 10000);
    this.camera.position.z = 100;
    this.scene.add(this.camera);
    this.uniforms = {
      screenWidth: { type: "f", value: undefined },
      screenHeight: { type: "f", value: undefined },
      previous: { type: "t", value: undefined },
      _Box_width: { type: "f", value: 0.5 },
      _Box_height: { type: "f", value: 0.5 },
      _Box_space: { type: "f", value: 0.5 },
      _Twist: { type: "f", value: 0.5 },
      time: { type: "f", value: 0 },
    };
    const VertexShader = `
out vec2 fragCoord;
void main()
{
    fragCoord = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;
    const FragmentShader = `
in vec2 fragCoord;
layout (location = 0) out vec4 fragColor;
uniform float screenWidth;
uniform float screenHeight;
uniform float time;

uniform float _Box_width;
uniform float _Box_height;
uniform float _Box_space;
uniform float _Twist;

float sdRoundBox( vec3 p, vec3 b, float r ){
        vec3 q = abs(p) - b;
    return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0) - r;
}

float sd4Box( vec3 p, vec3 b, float e ){
        p = abs(p)-b;
    vec3 q = abs(p+e)-e;
    return length(max(vec3(q.x,p.y,q.z),0.0))+min(max(q.x,max(p.y,q.z)),0.0);
}

float sdCylinder( vec3 p, vec3 c ){
        return length(p.xz-c.xy)-c.z;
}

mat2 rotate2D(float a){
        float c = cos(a), s = sin(a);
    return mat2(c,s,-s,c);
}

#define ITER 4
float ifs(vec3 p){
        mat2 rot = rotate2D(1.03);
    for(int i=0; i<ITER; i++){
            p = abs(p)-.075;
        p.xz *= rot;
        p.xy *= rot;
    }
    return sdRoundBox(p, vec3(.05), 0.004);
}

float dist_func(vec3 p){
    float d = ifs(p);

    vec3 q = p;
    q.xz *= rotate2D(-_Twist*p.y+time*0.3);
    q.y = p.y;

    d = min(d, sd4Box(q, vec3(_Box_space, _Box_height, _Box_space), _Box_space*_Box_width)-0.005);
    return min(d, sdCylinder( p, vec3(0,0,  _Box_space*0.3) ));
}

vec3 get_n(vec3 p){
    float ep = 0.0001;
    vec3 epx = vec3(ep, 0., 0.);
    vec3 epy = vec3(0., ep, 0.);
    vec3 epz = vec3(0., 0., ep);
    return normalize(vec3(
        dist_func(p+epx)-dist_func(p-epx),
        dist_func(p+epy)-dist_func(p-epy),
        dist_func(p+epz)-dist_func(p-epz)
    ));
}

#define MAX_MARCH 64
void main() {
    vec2 resolution = vec2(screenWidth, screenHeight);
    float t = time*0.1;
    vec2 uv = (fragCoord * 2. - 1.)*resolution/min(resolution.x,resolution.y);
    uv /= 1. + length(uv)*.1;

    // camera
    vec3 camera = vec3(0);
    vec3 ro = vec3(cos(t)*1.5, 0, sin(t)*1.5) + camera;

    vec3 lookat = vec3(0) + camera;
    float zoom = 1.5;
    vec3 lightdir = vec3(0,-1,1);

    vec3 f = normalize(lookat-ro);
    vec3 vertical = normalize(cross(vec3(0,1,0), f));
    vec3 horizontal = cross(f, vertical);
    vec3 i = ro + f*zoom + uv.x * vertical + uv.y * horizontal;
    // ray direction
    vec3 rdir = normalize(i - ro);

    vec3 ray = ro;
    vec3 col = vec3(1);

    float d;
    float dmin = 1.;
    int march;
    for(march = 0; march < MAX_MARCH; march++){
            d = dist_func(ray);
        dmin = min(dmin, d);
        if(d < 0.001){
                break;
        }
        ray += rdir * d*0.5;
    }

    if(d < 0.001){
            vec3 n = get_n(ray);
        col = vec3(dot(n, -rdir)*0.7+0.3);
    }

    float closeness = float(march) / float(MAX_MARCH);
    float ao = 1.0 - closeness;
    col *= ao;

    float glow = pow(dmin + 2., -1.5);
    col += glow;

    fragColor.xyz = col;
    fragColor.w = 1.;
}`;
    const FXAAShader = `
in vec2 fragCoord;
layout (location = 0) out vec4 fragColor;
uniform float screenWidth;
uniform float screenHeight;
uniform sampler2D previous;

vec4 chromaticAberration(sampler2D tex, vec2 fragCoord, float dist){
    vec2 uv = (fragCoord * 2.) -1.;
    float R = texture(tex, (uv * dist + 1.) * 0.5).x;
    float G = texture(tex, (uv / dist + 1.) * 0.5).y;
    vec2 BA = texture(tex, fragCoord).zw;
    return vec4(R, G, BA);
}

void main() {
    vec3 col = chromaticAberration(previous, fragCoord, 1.01).xyz;
    fragColor.xyz = col;
    fragColor.w = 1.;
}`;
    this.RayMarchingMaterial = new ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: VertexShader,
      fragmentShader: FragmentShader,
      glslVersion: GLSL3,
    });
    this.ScreenMaterial = new ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: VertexShader,
      fragmentShader: FXAAShader,
      glslVersion: GLSL3,
    });
    const plane = new PlaneGeometry(1.0, 1.0);
    this.mesh = new Mesh(plane, this.ScreenMaterial);
    this.scene.add(this.mesh);

    this.resize(this.canvas.clientWidth, this.canvas.clientHeight);
    this.guiParam = this.addGUI();
  }
  static async build(canvas: HTMLCanvasElement) {
    return new IFS(canvas);
  }
  resize(width: number, height: number) {
    this.resizeCanvas(width, height);
    this.renderer.setSize(width, height);

    this.Tex = new WebGLRenderTarget(width, height, {
      minFilter: LinearFilter,
      magFilter: LinearFilter,
      format: RGBAFormat,
      type: UnsignedByteType,
    });

    this.uniforms.screenWidth.value = width;
    this.uniforms.screenHeight.value = height;
  }
  render(time: number) {
    this.uniforms._Box_width.value = this.guiParam.Box_width;
    this.uniforms._Box_height.value = this.guiParam.Box_height;
    this.uniforms._Box_space.value = this.guiParam.Box_space;
    this.uniforms._Twist.value = this.guiParam.Twist;
    this.uniforms.time.value = time * 0.001;

    this.mesh.material = this.RayMarchingMaterial;
    this.renderer.setRenderTarget(this.Tex);
    this.renderer.clear();
    this.renderer.render(this.scene, this.camera);

    this.mesh.material = this.ScreenMaterial;
    this.uniforms.previous.value = this.Tex.texture;
    this.renderer.setRenderTarget(null);
    this.renderer.clear();
    this.renderer.render(this.scene, this.camera);

    this.requestId = requestAnimationFrame((time) => this.render(time));
  }
  addGUI() {
    // GUIパラメータ
    const guiObj = {
      Box_width: 0.1,
      Box_height: 2,
      Box_space: 0.06,
      Twist: 4.2,
    };

    this.gui = new GUI();
    this.gui.add(guiObj, "Box_width", 0.001, 0.499);
    this.gui.add(guiObj, "Box_height", 0.001, 1.999);
    this.gui.add(guiObj, "Box_space", 0.001, 0.999);
    this.gui.add(guiObj, "Twist", 0.001, 4.999);
    this.gui.open();
    return guiObj;
  }
  remove() {
    cancelAnimationFrame(this.requestId);
    this.gui.destroy();
  }
}
