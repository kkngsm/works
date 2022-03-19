precision highp float;
in vec2 fragCoord;
layout (location = 0) out vec4 fragColor;
uniform sampler2D dataTex;
uniform sampler2D drawTex;
uniform sampler2D diffuseTex;
uniform float time;
uniform float screenWidth;
uniform float screenHeight;
uniform float theta;
uniform float dist;

const float PI2 = 6.283185307;

float random() {
    return fract(sin(dot(vec3(fragCoord, time), vec3(12.9898,78.233,174.012)))* 43758.5453123);
}

vec2 get_sense_pos(vec2 pos, float angle, float theta, vec2 dist){
    angle = (angle+theta)*PI2;
    return pos + vec2(sin(angle), cos(angle))*dist;
}

void main() {
    vec3 data = texture(dataTex, fragCoord).xyz;
    vec2 pos = data.xy;
    float angle = data.z;
    vec2 texel = 1./vec2(screenWidth, screenHeight);
    vec2 t_d = texel * dist;

    vec2 r_pos = get_sense_pos(pos, angle, theta, t_d);
    vec2 f_pos = get_sense_pos(pos, angle, 0., t_d);
    vec2 l_pos = get_sense_pos(pos, angle, -theta, t_d);

    float r = texture(diffuseTex, r_pos).x;
    float f = texture(diffuseTex, f_pos).x;
    float l = texture(diffuseTex, l_pos).x;

    if(l > f && f < r){
        angle += (step(0.5, random())-0.5)*2.*theta;
    }else if(l > f && l > r){
        angle += 1. - theta;
    }else if(l < r && f < r){
        angle += theta;
    }

    pos += vec2(sin(angle*PI2), cos(angle*PI2))*texel*2.;
    fragColor.xyz = fract(vec3(pos,angle)+1.);
    fragColor.w = 1.;
}