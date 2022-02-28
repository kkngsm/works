import {
  GLSL3,
  Group,
  Mesh,
  MeshBasicMaterial,
  RawShaderMaterial,
  Uniform,
  WebGLRenderer,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import IrisTexture from "./IrisTexture";
import vs from "./standerd.vert";
import fs from "./gltf.frag";
import eyeModel from "./eye.glb";

export default class Eye {
  radius: number;
  texture: IrisTexture;
  uniforms: { [unifoms: string]: Uniform };
  model: Group;
  constructor() {
    this.texture = new IrisTexture();
    this.uniforms = { tex: new Uniform(this.texture.drew) };
  }
  public static async build() {
    const eye = new Eye();
    await eye.set();
    return eye;
  }

  update(time: number) {
    this.model.position.set(20, Math.sin(time * 0.001) * 10, 0);
  }
  render(renderer: WebGLRenderer) {
    this.texture.render(renderer);
  }
  private async set() {
    const loader = new GLTFLoader();
    const model = await (() => {
      return new Promise<Group>((resolve) => {
        loader.load(
          eyeModel,
          (gltf) => {
            resolve(gltf.scene);
          },
          (xhr) => {
            console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
          },
          (err) => {
            console.error("Player gltf Model loading Error:", err);
          }
        );
      });
    })();
    if ((model.children[0] as Mesh).isMesh) {
      (model.children[0] as Mesh).material = new MeshBasicMaterial();
    }
    if ((model.children[1] as Mesh).isMesh) {
      (model.children[1] as Mesh).material = new RawShaderMaterial({
        uniforms: this.uniforms,
        vertexShader: vs,
        fragmentShader: fs,
        glslVersion: GLSL3,
      });
    }
    this.model = model;
    this.model.scale.set(3, 3, 3);
  }
}
