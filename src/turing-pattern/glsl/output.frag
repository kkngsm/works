precision highp float;
precision highp int;
in vec2 fragCoord;
layout (location = 0) out vec4 fragColor;
uniform sampler2D uTex;
uniform sampler2D vTex;
uniform vec3 color1;
uniform vec3 color2;
float low2high(sampler2D _Tex, vec2 coord) {
        vec4 lowValue = texture(_Tex, coord);
    float fromlow = 256. / 255.;
    return (lowValue.r * fromlow
            + lowValue.g * fromlow / 255.
            + lowValue.b * fromlow / 65025.
            + lowValue.a * fromlow / 16581375.);
}

vec3 ranpUnit( vec3 col1, vec3 col2,
    float start, float end,
    float x){
    return mix(col1, col2, (clamp(x, start, end)-start)/(end-start));
}

vec3 ramp(vec3 first, vec3 a, vec3 b, vec3 final,
    float a_edge,
    float b_edge, 
    float f){
    vec3 col;
    col = ranpUnit(first, a, 0., a_edge, f);
    col = ranpUnit(col, b, a_edge, b_edge, f);
    col = ranpUnit(col, final, b_edge, 1., f);
    return col;
}

void main() {
    float f = low2high(vTex, fragCoord);
    fragColor.xyz = ramp(
        vec3(0), color1, color2, vec3(1),
                0.125,              0.25,
        f);
    fragColor.w = 1.;
}