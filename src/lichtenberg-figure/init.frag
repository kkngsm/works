in vec2 fragCoord;
layout (location = 0) out vec4 fragColor;
uniform float screenWidth;
uniform float screenHeight;
#define HERE (0.00392156)/*1*/

void main() {
    vec2 resolution = vec2(screenWidth, screenHeight);
    mediump float pixelSize = 1./min(resolution.x,resolution.y);
    vec2 temp = fragCoord * 2. - 1.;
    vec2 uv = vec2(temp.x * resolution.x,temp.y * resolution.y)/min(resolution.x,resolution.y);
    float col = step(length(uv), pixelSize*1.5);
    fragColor.xyz = vec3(col, HERE, HERE);
    fragColor.w = 0.;
}