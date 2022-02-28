
precision lowp float;
in vec2 fragCoord;
layout (location = 0) out vec4 fragColor;
void main() {
    fragColor.xyz = vec3(fragCoord, 0.);
    fragColor.w = 1.;
}