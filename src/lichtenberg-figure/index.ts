import { GUI } from "dat.gui";
import BaseWork from "../templates/BaseWork";

import vertexShader from "./basic.vert";
import initFrag from "./init.frag";
import diffusionFrag from "./diffusion.frag";
import displayFrag from "./display.frag";
import {
  DataTexture,
  GLSL3,
  LinearFilter,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  RGBAFormat,
  Scene,
  ShaderMaterial,
  UnsignedByteType,
  Vector3,
  WebGLRenderer,
  WebGLRenderTarget,
} from "three";
import { chase } from "./chase";

export default class Lichtenberg extends BaseWork {
  renderer: WebGLRenderer;
  scene: Scene;
  guiParam: any;
  camera: OrthographicCamera;
  uniforms: any;
  initMat: ShaderMaterial;
  diffusionMat: ShaderMaterial;
  displayMat: ShaderMaterial;
  mesh: Mesh;
  wrt: [WebGLRenderTarget, WebGLRenderTarget];
  gui: GUI;
  constructor(canvas: HTMLCanvasElement) {
    super(canvas);
    this.renderer = new WebGLRenderer({ canvas });
    this.scene = new Scene();
    this.guiParam = this.addGUI();
    this.camera = new OrthographicCamera(-0.5, 0.5, 0.5, -0.5, -10000, 10000);
    this.camera.position.z = 100;
    this.scene.add(this.camera);
    this.uniforms = {
      screenWidth: { type: "f", value: undefined },
      screenHeight: { type: "f", value: undefined },
      previous: { type: "t", value: undefined },
      time: { type: "f", value: 0 },
      strength: { type: "f", value: 1 },
      color: { type: "v3", value: new Vector3(1, 1, 1) },
      bgColor: { type: "v3", value: new Vector3(0, 0, 0) },
      random: { type: "f", value: 0 },
    };
    this.initMat = new ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader,
      fragmentShader: initFrag,
      glslVersion: GLSL3,
    });
    this.diffusionMat = new ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader,
      fragmentShader: diffusionFrag,
      glslVersion: GLSL3,
    });
    this.displayMat = new ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader,
      fragmentShader: displayFrag,
      glslVersion: GLSL3,
    });
    const plane = new PlaneGeometry(1.0, 1.0);
    this.mesh = new Mesh(plane, this.initMat);
    this.scene.add(this.mesh);

    this.resize(this.canvas.clientWidth, this.canvas.clientHeight);
  }
  static async build(canvas: HTMLCanvasElement) {
    return new Lichtenberg(canvas);
  }
  resize(width: number, height: number) {
    if (this.isSmartPhone()) {
      return;
    }
    this.resizeCanvas(width, height);
    this.renderer.setSize(width, height);

    this.wrt = [
      new WebGLRenderTarget(width, height, {
        minFilter: LinearFilter,
        magFilter: LinearFilter,
        format: RGBAFormat,
        type: UnsignedByteType,
      }),
      new WebGLRenderTarget(width, height, {
        minFilter: LinearFilter,
        magFilter: LinearFilter,
        format: RGBAFormat,
        type: UnsignedByteType,
      }),
    ];
    this.uniforms.screenWidth.value = width;
    this.uniforms.screenHeight.value = height;
    this.mesh.material = this.initMat;
    this.renderer.setRenderTarget(this.wrt[0]);
    this.renderer.clear();
    this.renderer.render(this.scene, this.camera);

    const maxloops = this.canvas.width * this.guiParam.loops * 0.005;
    this.mesh.material = this.diffusionMat;
    for (let i = 0; i < maxloops; i++) {
      this.uniforms.previous.value = this.wrt[0].texture;
      this.uniforms.random.value = Math.random();
      this.renderer.setRenderTarget(this.wrt[1]);
      this.renderer.clear();
      this.renderer.render(this.scene, this.camera);

      this.uniforms.previous.value = this.wrt[1].texture;
      this.uniforms.random.value = Math.random();
      this.renderer.setRenderTarget(this.wrt[0]);
      this.renderer.clear();
      this.renderer.render(this.scene, this.camera);
    }
    const pixels = new Uint8Array(this.canvas.width * this.canvas.height * 4);
    this.renderer.readRenderTargetPixels(
      this.wrt[0],
      0,
      0,
      this.canvas.width,
      this.canvas.height,
      pixels
    );
    const energyTex = new DataTexture(
      chase(pixels, width, height),
      this.canvas.width,
      this.canvas.height,
      RGBAFormat,
      UnsignedByteType
    );
    energyTex.needsUpdate = true;
    this.uniforms.previous.value = energyTex;
  }
  render(time: number) {
    if (this.isSmartPhone()) {
      return;
    }

    this.uniforms.color.value.x = this.guiParam.color[0] / 255;
    this.uniforms.color.value.y = this.guiParam.color[1] / 255;
    this.uniforms.color.value.z = this.guiParam.color[2] / 255;
    this.uniforms.bgColor.value.x = this.guiParam.bgColor[0] / 255;
    this.uniforms.bgColor.value.y = this.guiParam.bgColor[1] / 255;
    this.uniforms.bgColor.value.z = this.guiParam.bgColor[2] / 255;
    this.uniforms.strength.value = this.guiParam.strength;
    this.uniforms.time.value = time * 0.001;

    this.mesh.material = this.displayMat;
    this.renderer.setRenderTarget(null);
    this.renderer.clear();
    this.renderer.render(this.scene, this.camera);

    this.requestId = requestAnimationFrame((time) => this.render(time));
  }
  addGUI() {
    // GUIパラメータ
    const guiCtrl = {
      recalculation: () => {
        this.resize(this.canvas.width, this.canvas.height);
      },
      loops: 100,
      strength: 1,
      color: [0, 0, 255],
      bgColor: [0, 0, 0],
    };
    this.gui = new GUI();
    const CALCULATION = this.gui.addFolder("CALCULATION");
    CALCULATION.add(guiCtrl, "loops", 0, 100).name("Number of loops (%)");
    CALCULATION.add(guiCtrl, "recalculation").name(
      "recalculation (click here)"
    );
    const SHADING = this.gui.addFolder("SHADING");
    SHADING.add(guiCtrl, "strength", 0.1, 5);
    SHADING.addColor(guiCtrl, "color");
    SHADING.addColor(guiCtrl, "bgColor").name("background color");
    this.gui.open();
    return guiCtrl;
  }
  remove() {
    cancelAnimationFrame(this.requestId);
    if (this.gui) {
      this.gui.destroy();
    }
  }
}
