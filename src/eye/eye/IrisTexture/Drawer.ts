import {
  BufferGeometry,
  Float32BufferAttribute,
  GLSL3,
  LinearFilter,
  OrthographicCamera,
  Points,
  RepeatWrapping,
  RGBAFormat,
  Scene as TScene,
  ShaderMaterial,
  Texture,
  Uniform,
  WebGLRenderer,
  WebGLRenderTarget,
} from "three";
import renderParticleVs from "./renderParticle.vert";
import renderParticleFs from "./renderParticle.frag";
export class Drawer {
  camera: OrthographicCamera;
  scene: TScene;
  result: WebGLRenderTarget;
  uniforms: {
    resolution: Uniform;
    dataTex: Uniform;
    drawTex: Uniform;
  };
  constructor() {
    const particleNumSqrt = 512;
    const particleNum = particleNumSqrt * particleNumSqrt;
    this.camera = new OrthographicCamera(-0.5, 0.5, 0.5, -0.5, -10000, 10000);
    this.camera.position.z = 100;
    this.result = new WebGLRenderTarget(512, 512, {
      minFilter: LinearFilter,
      magFilter: LinearFilter,
      wrapS: RepeatWrapping,
      wrapT: RepeatWrapping,
      format: RGBAFormat,
    });

    // パーティクルの設定
    const particlesPos = new Float32Array(particleNum * 3);
    const particlesIndices = new Float32Array(particleNum).map((_, i) => i);
    const particles = new BufferGeometry();
    particles.setAttribute(
      "position",
      new Float32BufferAttribute(particlesPos, 3)
    );
    particles.setAttribute(
      "index",
      new Float32BufferAttribute(particlesIndices, 1)
    );

    this.uniforms = {
      resolution: new Uniform(particleNumSqrt),
      dataTex: { type: "t", value: undefined } as Uniform,
      drawTex: { type: "t", value: undefined } as Uniform,
    };
    const mat = new ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: renderParticleVs,
      fragmentShader: renderParticleFs,
      glslVersion: GLSL3,
      transparent: true,
    });

    const points = new Points(particles, mat);
    this.scene = new TScene();
    this.scene.add(points);
  }
  render(renderer: WebGLRenderer, moved: Texture): Texture {
    this.uniforms.dataTex.value = moved;
    renderer.setRenderTarget(this.result);
    renderer.clear();
    renderer.render(this.scene, this.camera);
    return this.result.texture;
  }
}
