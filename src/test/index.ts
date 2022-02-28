import { GUI } from "dat.gui";
import {
  GLSL3,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Uniform,
  Vector2,
  WebGLRenderer,
} from "three";
import BaseWork from "../templates/BaseWork";
import fs from "./glsl/test.frag";
import vs from "./glsl/test.vert";

export default class Test extends BaseWork {
  renderer: WebGLRenderer;

  scene: Scene;

  camera: OrthographicCamera;

  mesh: Mesh;

  requestId: number;

  gui: GUI;

  constructor(canvas: HTMLCanvasElement) {
    super(canvas);
    this.renderer = new WebGLRenderer({ canvas });
    this.scene = new Scene();
    this.camera = new OrthographicCamera(-0.5, 0.5, 0.5, -0.5, -10000, 10000);
    this.camera.position.z = 100;
    const plane = new PlaneGeometry(1.0, 1.0);
    this.mesh = new Mesh(
      plane,
      new ShaderMaterial({
        uniforms: {
          resolution: new Uniform(
            new Vector2(this.canvas.clientWidth, this.canvas.clientHeight)
          ),
        },
        vertexShader: vs,
        fragmentShader: fs,
        glslVersion: GLSL3,
      })
    );

    this.scene.add(this.mesh);
    this.resize(this.canvas.clientWidth, this.canvas.clientHeight);
    this.addGUI();
  }
  public static async build(canvas: HTMLCanvasElement): Promise<Test> {
    return new Test(canvas);
  }

  resize(width: number, height: number): void {
    this.resizeCanvas(width, height);
    this.renderer.setSize(width, height);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  render(time = 0) {
    this.renderer.render(this.scene, this.camera);
    this.requestId = requestAnimationFrame((t) => this.render(t));
  }

  addGUI() {
    const guiObj = {
      Box_width: 0.1,
      Box_height: 2,
      Box_space: 0.06,
      Twist: 4.2,
    };
    this.gui = new GUI();
    const main = this.gui.addFolder(`main`);
    main.add(guiObj, `Box_width`, 0.001, 0.499);
    main.add(guiObj, `Box_height`, 0.001, 1.999);
    main.add(guiObj, `Box_space`, 0.001, 0.999);
    main.add(guiObj, `Twist`, 0.001, 4.999);
    this.gui.open();
    return guiObj;
  }

  remove() {
    cancelAnimationFrame(this.requestId);
    this.gui.destroy();
  }
}
