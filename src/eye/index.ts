import BaseWork from "../templates/BaseWork";

import {
  Camera,
  PerspectiveCamera,
  Scene as TScene,
  Vector3,
  WebGLRenderer,
} from "three";
import EyeModel from "./eye";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
export default class Eye extends BaseWork {
  private renderer: WebGLRenderer;
  private scene: TScene;
  private camera: Camera;

  private enemy: EyeModel;
  private contorler: OrbitControls;
  constructor(canvas: HTMLCanvasElement) {
    super(canvas);
    this.renderer = new WebGLRenderer({ canvas });
    this.scene = new TScene();

    const fov = 45;
    const cameraZ = 50;
    const aspect = canvas.clientWidth / canvas.clientHeight;
    this.camera = new PerspectiveCamera(fov, aspect, 1, 10000);
    this.camera.position.set(10, 0, cameraZ);
    this.camera.lookAt(new Vector3(0, 0, 0));
    this.contorler = new OrbitControls(this.camera, canvas as HTMLElement);
    this.resize(canvas.clientWidth, canvas.clientHeight);
  }
  public static async build(canvas: HTMLCanvasElement): Promise<Eye> {
    const eye = new Eye(canvas);
    await eye.set();
    return eye;
  }
  resize(width: number, height: number): void {
    this.resizeCanvas(width, height);
    this.renderer.setSize(width, height);
  }
  render(time: number): void {
    this.contorler.update();
    this.enemy.render(this.renderer);
    this.renderer.setRenderTarget(null);
    this.renderer.clear();
    this.renderer.render(this.scene, this.camera);
    this.requestId = requestAnimationFrame((t) => this.render(t));
  }
  private async set() {
    this.enemy = await EyeModel.build();
    this.scene.add(this.enemy.model);
  }
  remove(): void {
    cancelAnimationFrame(this.requestId);
  }
}
