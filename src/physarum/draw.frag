
precision highp float;
layout (location = 0) out vec4 fragColor;
void main() {
fragColor.xyz = vec3(.4);
fragColor.w = 1.;
}