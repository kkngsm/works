in vec2 fragCoord;
layout (location = 0) out vec4 fragColor;
uniform float screenWidth;
uniform float screenHeight;
uniform sampler2D previous;
uniform float random;
// Noise func Reference: https://www.shadertoy.com/view/4dS3Wd
float hash(vec2 p) {vec3 p3 = fract(vec3(p.xyx) * 0.13); p3 += dot(p3, p3.yzx + 3.333); return fract((p3.x + p3.y) * p3.z); }
#define NUM_NOISE_OCTAVES 5
float noise(vec2 x) {
    vec2 i = floor(x);
    vec2 f = fract(x);
    // Four corners in 2D of a tile
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    // Simple 2D lerp using smoothstep envelope between the values.
    // return vec3(mix(mix(a, b, smoothstep(0.0, 1.0, f.x)),
    //			mix(c, d, smoothstep(0.0, 1.0, f.x)),
    //			smoothstep(0.0, 1.0, f.y)));
    // Same code, with the clamps in smoothstep and common subexpressions
    // optimized away.
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}
float fbm(vec2 x) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100);
    // Rotate to reduce axial bias
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
    for (int i = 0; i < NUM_NOISE_OCTAVES; ++i) {
            v += a * noise(x);
        x = rot * x * 2.0 + shift;
        a *= 0.5;
    }
    return v;
}
#define UP (0.00784313)/*2*/
#define HERE (0.00392156)/*1*/
#define DOWN (0) /*0*/
// #define UP 1
// #define HERE 0.5
// #define DOWN 0
void main() {
    vec2 resolution = vec2(screenWidth, screenHeight);
    vec2 pixelSize = 1./resolution;
    vec2 pSX = vec2(pixelSize.x, 0);
    vec2 pSY = vec2(0, pixelSize.y);
    /*
      u
    l   r
      d
    */
    float potentialU = texture(previous, fragCoord - pSY).x;
    float potentialR = texture(previous, fragCoord + pSX).x;
    float potentialL = texture(previous, fragCoord - pSX).x;
    float potentialD = texture(previous, fragCoord + pSY).x;
    /* 上にあったら */
    /* potentialU?vec3(1, HERE, DOWN):vec3(0) */
    vec3 p_from = mix(vec3(0), vec3(1, HERE, DOWN), potentialU);
    /* 右にあったら */
    /* potentialR?vec3(1, UP, HERE):p_from */
    p_from = mix(p_from, vec3(1, UP , HERE), potentialR);
    /* 左にあったら */
    /* potentialL?vec3(1, DOWN, HERE):p_from */
    p_from = mix(p_from, vec3(1, DOWN, HERE), potentialL);
    /* 下にあったら */
    /* potentialD?vec3(1, HERE, UP):p_from */
    p_from = mix(p_from, vec3(1, HERE, UP), potentialD);
    /* 確率 */
    p_from = mix(vec3(0), p_from, step(hash((fragCoord+random)*resolution), fbm(fragCoord*resolution*0.03)));
    /* すでに計算してたら */
    /* texture(previous, fragCoord).x?texture(previous, fragCoord).yz:p_from */
    p_from = mix(p_from, texture(previous, fragCoord).xyz, texture(previous, fragCoord).x);
    /* 縁じゃなかったら */
    vec2 p1 = step(pixelSize,fragCoord);
    vec2 p2 = step(pixelSize,1.0 - fragCoord);
    float c1 = p1.x * p1.y;
    float c2 = p2.x * p2.y;
    p_from = mix(vec3(0), p_from, c1 * c2);
    fragColor.xyz = p_from;
    fragColor.w = 1.;
}