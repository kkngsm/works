import BaseWork from "../templates/BaseWork";
import {
  BufferGeometry,
  CanvasTexture,
  DataTexture,
  Float32BufferAttribute,
  FloatType,
  GLSL3,
  LinearFilter,
  Mesh,
  NearestFilter,
  OrthographicCamera,
  PlaneGeometry,
  Points,
  RepeatWrapping,
  RGBAFormat,
  Scene,
  ShaderMaterial,
  Vector2,
  WebGLRenderer,
  WebGLRenderTarget,
} from "three";

import drawFrag from "./draw.frag";
import drawVert from "./draw.vert";
import moveFrag from "./move.frag";
import moveVert from "./move.vert";
import diffuseVert from "./diffuse.vert";
import diffuseFrag from "./diffuse.frag";
import outputVert from "./output.vert";
import outputFrag from "./output.frag";

export default class Physarum extends BaseWork {
  renderer: WebGLRenderer;
  scene: Scene;
  camera: OrthographicCamera;
  uniforms: any;
  mesh: Mesh;
  DataTex: WebGLRenderTarget;
  DataTex2: WebGLRenderTarget;
  Particles: BufferGeometry;
  DrawScene: Scene;
  moveMat: ShaderMaterial;
  swap: boolean;
  diffuseMat: ShaderMaterial;
  texMat: ShaderMaterial;
  drawTex: WebGLRenderTarget;
  diffuseTex: WebGLRenderTarget;
  diffuseTex2: WebGLRenderTarget;
  constructor(canvas: HTMLCanvasElement) {
    super(canvas);
    this.renderer = new WebGLRenderer({ canvas });
    this.scene = new Scene();

    this.renderer.getContext().getExtension("EXT_color_buffer_float");
    this.camera = new OrthographicCamera(-0.5, 0.5, 0.5, -0.5, -10000, 10000);
    this.camera.position.z = 100;

    this.scene.add(this.camera);

    let PARTICLE_NUM_SQRT = 512;
    this.uniforms = {
      resolution: { type: "f", value: PARTICLE_NUM_SQRT },
      screenWidth: { type: "f", value: undefined },
      screenHeight: { type: "f", value: undefined },
      time: { type: "f", value: 0 },
      mouse: { type: "v2", value: new Vector2(-10, -10) },
      mousePress: { type: "f", value: 1 },

      dataTex: { type: "t", value: undefined },
      drawTex: { type: "t", value: undefined },
      diffuseTex: { type: "t", value: undefined },
      prevDiffuseTex: { type: "t", value: undefined },

      logoTex: { type: "t", value: new CanvasTexture(this.logoTex()) },

      theta: { type: "f", value: 0.1 },
      dist: { type: "f", value: 5 },
    };
    this.mouseMove(this.uniforms.mouse);
    this.mouseClick(this.uniforms.mousePress);

    const plane = new PlaneGeometry(1.0, 1.0);
    this.mesh = new Mesh(plane, undefined);
    this.scene.add(this.mesh);

    const PARTICLE_NUM = PARTICLE_NUM_SQRT * PARTICLE_NUM_SQRT;

    this.DataTex = new WebGLRenderTarget(PARTICLE_NUM_SQRT, PARTICLE_NUM_SQRT, {
      minFilter: NearestFilter,
      magFilter: NearestFilter,
      wrapS: RepeatWrapping,
      wrapT: RepeatWrapping,
      format: RGBAFormat,
      type: FloatType,
    });
    this.DataTex2 = new WebGLRenderTarget(
      PARTICLE_NUM_SQRT,
      PARTICLE_NUM_SQRT,
      {
        minFilter: NearestFilter,
        magFilter: NearestFilter,
        wrapS: RepeatWrapping,
        wrapT: RepeatWrapping,
        format: RGBAFormat,
        type: FloatType,
      }
    );
    const data = new Float32Array(PARTICLE_NUM * 4).map(() => Math.random());
    this.DataTex.texture = new DataTexture(
      data,
      PARTICLE_NUM_SQRT,
      PARTICLE_NUM_SQRT,
      RGBAFormat,
      FloatType
    );
    this.DataTex.texture.needsUpdate = true;
    {
      //パーティクル
      this.Particles = new BufferGeometry();
      const particles_pos = new Float32Array(PARTICLE_NUM * 3);
      const particles_indices = new Float32Array(PARTICLE_NUM).map(
        (val, i) => i
      );
      this.Particles.setAttribute(
        "position",
        new Float32BufferAttribute(particles_pos, 3)
      );
      this.Particles.setAttribute(
        "index",
        new Float32BufferAttribute(particles_indices, 1)
      );
    }
    {
      const Draw_M = new ShaderMaterial({
        uniforms: this.uniforms,
        vertexShader: drawVert,
        fragmentShader: drawFrag,
        glslVersion: GLSL3,
      });
      const points = new Points(this.Particles, Draw_M);
      this.DrawScene = new Scene();
      this.DrawScene.add(points);
    }
    {
      this.moveMat = new ShaderMaterial({
        uniforms: this.uniforms,
        vertexShader: moveVert,
        fragmentShader: moveFrag,
        glslVersion: GLSL3,
      });
      this.swap = true;
      this.uniforms.dataTex.value = this.DataTex.texture;
    }
    {
      this.diffuseMat = new ShaderMaterial({
        uniforms: this.uniforms,
        vertexShader: diffuseVert,
        fragmentShader: diffuseFrag,
        glslVersion: GLSL3,
      });
    }
    {
      this.texMat = new ShaderMaterial({
        uniforms: this.uniforms,
        vertexShader: outputVert,
        fragmentShader: outputFrag,
        glslVersion: GLSL3,
      });
    }

    this.resize(this.canvas.clientWidth, this.canvas.clientHeight);
  }
  static async build(canvas: HTMLCanvasElement) {
    return new Physarum(canvas);
  }
  render(time: number) {
    this.uniforms.time.value = time;

    this.renderDraw();
    this.renderMove();
    this.renderDiffuse();

    this.swap = !this.swap;

    this.mesh.material = this.texMat;
    this.renderer.setRenderTarget(null);
    this.renderer.clear();
    this.renderer.render(this.scene, this.camera);

    this.requestId = requestAnimationFrame((time) => this.render(time));
  }

  renderDraw() {
    this.renderer.setRenderTarget(this.drawTex);
    this.renderer.clear();
    this.renderer.render(this.DrawScene, this.camera);
    this.uniforms.drawTex.value = this.drawTex.texture;
  }

  renderMove() {
    this.mesh.material = this.moveMat;
    if (this.swap) {
      this.renderer.setRenderTarget(this.DataTex2);
      this.renderer.clear();
      this.renderer.render(this.scene, this.camera);
      this.uniforms.dataTex.value = this.DataTex2.texture;
    } else {
      this.renderer.setRenderTarget(this.DataTex);
      this.renderer.clear();
      this.renderer.render(this.scene, this.camera);
      this.uniforms.dataTex.value = this.DataTex.texture;
    }
  }

  renderDiffuse() {
    this.mesh.material = this.diffuseMat;
    if (this.swap) {
      this.renderer.setRenderTarget(this.diffuseTex);
      this.renderer.clear();
      this.renderer.render(this.scene, this.camera);
      this.uniforms.diffuseTex.value = this.diffuseTex.texture;
      this.uniforms.prevDiffuseTex.value = this.diffuseTex.texture;
    } else {
      this.renderer.setRenderTarget(this.diffuseTex2);
      this.renderer.clear();
      this.renderer.render(this.scene, this.camera);
      this.uniforms.diffuseTex.value = this.diffuseTex2.texture;
      this.uniforms.prevDiffuseTex.value = this.diffuseTex2.texture;
    }
  }

  resize(width: number, height: number) {
    this.resizeCanvas(width, height);
    this.renderer.setSize(width, height);

    this.drawTex = new WebGLRenderTarget(width, height, {
      minFilter: LinearFilter,
      magFilter: LinearFilter,
      wrapS: RepeatWrapping,
      wrapT: RepeatWrapping,
      format: RGBAFormat,
    });

    this.diffuseTex = new WebGLRenderTarget(width, height, {
      minFilter: LinearFilter,
      magFilter: LinearFilter,
      wrapS: RepeatWrapping,
      wrapT: RepeatWrapping,
      format: RGBAFormat,
    });

    this.diffuseTex2 = new WebGLRenderTarget(width, height, {
      minFilter: LinearFilter,
      magFilter: LinearFilter,
      wrapS: RepeatWrapping,
      wrapT: RepeatWrapping,
      format: RGBAFormat,
    });

    this.uniforms.screenWidth.value = width;
    this.uniforms.screenHeight.value = height;
  }
  remove() {
    cancelAnimationFrame(this.requestId);
  }

  logoTex() {
    const offscreen = document.createElement("canvas");
    offscreen.width = 256;
    offscreen.height = 256;
    const offscreenCtx = offscreen.getContext("2d") as CanvasRenderingContext2D;

    offscreenCtx.fillStyle = "#FFF";
    offscreenCtx.fillRect(0, 0, offscreen.width, offscreen.height);

    offscreenCtx.fillStyle = "#000";
    offscreenCtx.textAlign = "center";
    offscreenCtx.textBaseline = "middle";
    offscreenCtx.font = "900 55px 'Yu Gothic'";
    offscreenCtx.fillText(
      "KOKI.one",
      offscreen.width / 2,
      offscreen.height / 2
    );
    return offscreen;
  }
}
