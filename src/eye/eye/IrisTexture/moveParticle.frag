precision highp float;
in vec2 fragCoord;
layout (location = 0) out vec4 fragColor;
uniform sampler2D dataTex;
uniform sampler2D drawTex;
uniform float time;
uniform float resolution;
const float PI = 3.141592653;
const float PI2 = 6.283185307;

const float spmTheta = 0.78/PI*0.5;
const float spmDist = 2.1;
const float spmSpeed = 0.1;
const float dpmTheta = 0.2/PI*0.5;
const float dpmDist = 1.;
const float dpmSpeed = 0.5;
const float pupilRadius = 0.1;
const float dpmRadius = 0.07;
const float inwardForce = 0.5;
float random(float seed) {
    return fract(sin(dot(vec3(fragCoord, time+seed), vec3(12.9898,78.233,174.012)))* 43758.5453123);
}
// 新規データの作成
vec3 respown(){
    float angle = random(-200.24)*PI2;
    vec2 pos = vec2(sin(angle)*0.5 + 0.5, cos(angle)*0.5 + 0.5);
    return vec3(pos, atan(0.5 - pos.x, 0.5 - pos.y)/PI2);
}
// センサーの位置を取得
vec2 get_sense_pos(vec2 pos, float angle, float spmTheta, vec2 spmDist){
    angle = (angle+spmTheta)*PI2;
    return pos + vec2(sin(angle), cos(angle))*spmDist;
}
void main() {
    vec2 texel = vec2(1./resolution);
    vec3 data = texture(dataTex, fragCoord).xyz;
    vec2 pos = data.xy;
    float angle = data.z;

    float d = distance(vec2(0.5,0.5), pos);

    // spmとdpmのパラメータ遷移のための重みづけ
    float weight = smoothstep(pupilRadius+dpmRadius-0.05, pupilRadius+dpmRadius+0.05,d);
    vec2 t_d = texel * mix(spmDist, dpmDist, weight);
    float theta = mix(spmTheta, dpmTheta, weight);
    // センサー座標を取得
    vec2 r_pos = get_sense_pos(pos, angle, theta, t_d);
    vec2 f_pos = get_sense_pos(pos, angle, 0., t_d);
    vec2 l_pos = get_sense_pos(pos, angle, -theta, t_d);
    float r = texture(drawTex,r_pos).x;
    float f = texture(drawTex,f_pos).x;
    float l = texture(drawTex,l_pos).x;

    // 移動先の決定
    if(l > f && f < r){
        angle += (step(0.5, random(0.))-0.5)*2.*theta;
    }else if(l > f && l > r){
        angle += 1. - theta;
    }else if(l < r && f < r){
        angle += theta;
    }
    pos += vec2(sin(angle*PI2), cos(angle*PI2))*texel*mix(spmSpeed, dpmSpeed, weight);
    // spmのとき中央へ向かせる
    float x = mix(sin(angle*PI2), 0.5 - pos.x, inwardForce);
    float y = mix(cos(angle*PI2), 0.5 - pos.y, inwardForce);
    angle = mix(angle, atan(x, y)/PI2, step(pupilRadius+dpmRadius,d));
    // 0-1のデータに直す
    data = fract(vec3(pos,angle)+1.);
    // 一定の条件のもとリスポーンさせる
    vec3 re_data = respown();
    data = mix(re_data, data, step(pupilRadius, d));
    data = mix(data, re_data, 1.-step(d, 0.501));
    data = mix(data, re_data, step(0.9915, random(data.x)));

    fragColor.xyz = data;
    fragColor.w = 1.;
}