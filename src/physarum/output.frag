in vec2 fragCoord;
precision highp float;
layout (location = 0) out vec4 fragColor;
uniform sampler2D diffuseTex;
void main() {
    fragColor.xyz = 1.-vec3(texture(diffuseTex, fragCoord).w);
    fragColor.w = 1.;
}