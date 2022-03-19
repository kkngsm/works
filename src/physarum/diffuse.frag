in vec2 fragCoord;
precision highp float;
layout (location = 0) out vec4 fragColor;
uniform sampler2D drawTex;
uniform float screenWidth;
uniform float screenHeight;
uniform sampler2D logoTex;
uniform sampler2D prevDiffuseTex;

uniform vec2 mouse;
void main() {
    vec2 uv = vec2(screenWidth, screenHeight);
    vec2 texel = 1./uv;
    float r = (texture(drawTex, fragCoord).x +
    texture(drawTex, fragCoord + vec2(texel.x, 0)).x +
    texture(drawTex, fragCoord + vec2(0, texel.y)).x +
    texture(drawTex, fragCoord - vec2(texel.x, 0)).x +
    texture(drawTex, fragCoord - vec2(0, texel.y)).x)*0.2;

    r = (r + texture(prevDiffuseTex, fragCoord).w)*0.5;

    vec2 p = (fragCoord-0.5) * uv/ min(screenWidth, screenHeight);
    float g = texture(logoTex, p+0.5).x;

    vec2 m = (mouse-0.5) * uv/ min(screenWidth, screenHeight);
    float b = smoothstep(0.2, 0.1, distance(m, p));
    fragColor = vec4(r+b+1.-g,g,b,r);
}