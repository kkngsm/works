in vec2 fragCoord;
layout (location = 0) out vec4 fragColor;
uniform sampler2D previous;
uniform float strength;
uniform vec3 color;
uniform vec3 bgColor;
void main() {
    vec4 num = texture(previous, fragCoord);
    fragColor.xyz = vec3(mix(bgColor, color, min(1., (num.x+num.x+num.z+num.w)/strength)));
    fragColor.w = 1.;
}