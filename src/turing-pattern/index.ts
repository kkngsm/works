import { GUI } from "dat.gui";
import {
  GLSL3,
  Material,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  RawShaderMaterial,
  Scene,
  Uniform,
  Vector2,
  Vector3,
  WebGLMultipleRenderTargets,
  WebGLRenderer,
} from "three";
import BaseWork from "../templates/BaseWork";
import vs from "../templates/glsl/standerd.vert";
import grayScottFs from "./glsl/grayScott.frag";
import outputFs from "./glsl/output.frag";

type GuiParams = {
  dt: number;
  a: number;
  b: number;
  cu: number;
  cv: number;
  color1: number[];
  color2: number[];
};
type key =
  | "resolution"
  | "vTex"
  | "uTex"
  | "time"
  | "strength"
  | "color1"
  | "color2"
  | "dt"
  | "a"
  | "b"
  | "cu"
  | "cv"
  | "mouse"
  | "mousePress";
export default class TuringPattern extends BaseWork {
  renderer: WebGLRenderer;

  scene: Scene;

  camera: OrthographicCamera;

  mesh: Mesh;

  requestId: number;

  gui: GUI;

  guiParams: GuiParams;

  uniforms: { [uniform in key]: Uniform };

  output: Material;

  grayScott: Material;

  renderTargets: [WebGLMultipleRenderTargets, WebGLMultipleRenderTargets];

  constructor(canvas: HTMLCanvasElement) {
    super(canvas);

    this.guiParams = this.addGUI();
    this.camera = new OrthographicCamera(-0.5, 0.5, 0.5, -0.5, -10000, 10000);
    this.camera.position.z = 100;
    this.scene = new Scene();
    this.renderer = new WebGLRenderer({ canvas });
    this.uniforms = {
      resolution: new Uniform(new Vector2()),
      vTex: { type: `t`, value: undefined } as Uniform,
      uTex: { type: `t`, value: undefined } as Uniform,
      time: new Uniform(0),
      strength: new Uniform(1),
      color1: new Uniform(new Vector3(1, 1, 1)),
      color2: new Uniform(new Vector3(0, 0, 0)),
      dt: new Uniform(this.guiParams.dt),
      a: new Uniform(this.guiParams.a),
      b: new Uniform(this.guiParams.b),
      cu: new Uniform(this.guiParams.cu),
      cv: new Uniform(this.guiParams.cv),
      mouse: new Uniform(new Vector2(0.5, 0.5)),
      mousePress: new Uniform(1),
    };
    this.mouseMove(this.uniforms.mouse);
    this.mouseClick(this.uniforms.mousePress);

    this.grayScott = new RawShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: vs,
      fragmentShader: grayScottFs,
      glslVersion: GLSL3,
    });
    this.output = new RawShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: vs,
      fragmentShader: outputFs,
      glslVersion: GLSL3,
    });
    const plane = new PlaneGeometry(1.0, 1.0);
    this.mesh = new Mesh(plane, this.grayScott);
    this.scene.add(this.mesh);
    this.resize(canvas.clientWidth, canvas.clientHeight);

    this.uniforms.color1.value.x = (this.guiParams.color1[0] as number) / 255;
    this.uniforms.color1.value.y = (this.guiParams.color1[1] as number) / 255;
    this.uniforms.color1.value.z = (this.guiParams.color1[2] as number) / 255;

    this.uniforms.color2.value.x = (this.guiParams.color2[0] as number) / 255;
    this.uniforms.color2.value.y = (this.guiParams.color2[1] as number) / 255;
    this.uniforms.color2.value.z = (this.guiParams.color2[2] as number) / 255;
  }
  static async build(canvas: HTMLCanvasElement): Promise<TuringPattern> {
    return new TuringPattern(canvas);
  }

  resize(width: number, height: number): void {
    this.resizeCanvas(width, height);

    this.renderTargets = [
      new WebGLMultipleRenderTargets(width / 4, height / 4, 2),
      new WebGLMultipleRenderTargets(width / 4, height / 4, 2),
    ];

    [this.uniforms.uTex.value, this.uniforms.vTex.value] =
      this.renderTargets[0].texture;

    this.uniforms.resolution.value = new Vector2(width, height);
    this.renderer.setSize(width, height);
  }

  render(time: number): void {
    this.uniforms.time.value = time * 0.001;

    this.mesh.material = this.grayScott;
    for (let i = 0; i < 4; i += 1) {
      this.renderer.setRenderTarget(this.renderTargets[1]);
      this.renderer.clear();
      this.renderer.render(this.scene, this.camera);
      [this.uniforms.uTex.value, this.uniforms.vTex.value] =
        this.renderTargets[1].texture;

      this.renderer.setRenderTarget(null);

      this.renderer.setRenderTarget(this.renderTargets[0]);
      this.renderer.clear();
      this.renderer.render(this.scene, this.camera);
      [this.uniforms.uTex.value, this.uniforms.vTex.value] =
        this.renderTargets[0].texture;
    }

    this.mesh.material = this.output;
    this.renderer.setRenderTarget(null);
    this.renderer.clear();
    this.renderer.render(this.scene, this.camera);
    this.requestId = requestAnimationFrame((t) => this.render(t));
  }

  addGUI() {
    this.gui = new GUI();
    // GUIパラメータ
    const guiObj: GuiParams = {
      dt: 0.9,
      a: 0.024,
      b: 0.078,
      cu: 0.002,
      cv: 0.001,
      color1: [147, 175, 81],
      color2: [82, 95, 208],
    };
    this.gui.add(guiObj, `dt`, 0, 0.999).onChange((v: number) => {
      this.uniforms.dt.value = v;
    });
    this.gui.add(guiObj, `a`, 0, 0.1).onChange((v: number) => {
      this.uniforms.a.value = v;
    });
    this.gui.add(guiObj, `b`, 0, 0.1).onChange((v: number) => {
      this.uniforms.b.value = v;
    });
    this.gui.add(guiObj, `cu`, 0, 0.01).onChange((v: number) => {
      this.uniforms.cu.value = v;
    });
    this.gui.add(guiObj, `cv`, 0, 0.01).onChange((v: number) => {
      this.uniforms.cv.value = v;
    });
    this.gui
      .addColor(guiObj, `color1`)
      .onChange((v: [number, number, number]) => {
        this.uniforms.color1.value.x = v[0] / 255;
        this.uniforms.color1.value.y = v[1] / 255;
        this.uniforms.color1.value.z = v[2] / 255;
      });
    this.gui
      .addColor(guiObj, `color2`)
      .onChange((v: [number, number, number]) => {
        this.uniforms.color2.value.x = v[0] / 255;
        this.uniforms.color2.value.y = v[1] / 255;
        this.uniforms.color2.value.z = v[2] / 255;
      });
    this.gui.open();
    return guiObj;
  }

  remove() {
    cancelAnimationFrame(this.requestId);
    this.gui.destroy();
  }
}
