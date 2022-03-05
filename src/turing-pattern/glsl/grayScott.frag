precision highp float;
precision highp int;
in vec2 fragCoord;
layout (location = 0) out vec4 uOut;
layout (location = 1) out vec4 vOut;
uniform vec2 mouse;
uniform float mousePress;
uniform vec2 resolution;
uniform sampler2D uTex;
uniform sampler2D vTex;

uniform float dt;
uniform float a;
uniform float b;
uniform float cu;
uniform float cv;

uniform float time;
float h2 = 0.01;

vec2 norCoord(vec2 coord, vec2 resolution){
    vec2 temp = coord * 2. - 1.;
    return vec2(temp.x * resolution.x,temp.y * resolution.y)/min(resolution.x,resolution.y);
}

vec4 high2low(float highValue) {
    vec4 lowValue = vec4(1., 255., 65025., 16581375.) * max(min(highValue, 0.9999), 0.);
    lowValue = fract(lowValue);
    lowValue -= lowValue.yzww * vec4(1./255.,1./255.,1./255.,0.);
    return lowValue;
}

float low2high(sampler2D Tex, vec2 coord) {
    vec4 lowValue = texture(Tex, coord);
    return dot( lowValue, vec4(1., 1./255., 1./65025., 1./16581375.) );
}

void main() {
    vec2 pixelSize = 1./resolution;
    vec2 pX = vec2(pixelSize.x, 0);
    vec2 pY = vec2(0, pixelSize.y);

    float uij = low2high(uTex, fragCoord);
    float vij = low2high(vTex, fragCoord);
    float Du = (low2high(uTex, fragCoord + pX) +
                low2high(uTex, fragCoord - pX) +
                low2high(uTex, fragCoord + pY) +
                low2high(uTex, fragCoord - pY) -
                4.*uij)/0.01;
    float Dv = (low2high(vTex, fragCoord + pX) +
                low2high(vTex, fragCoord - pX) +
                low2high(vTex, fragCoord + pY) +
                low2high(vTex, fragCoord - pY) -
                4.*vij)/0.01;

    float f = -uij*vij*vij + a*(1.-uij);
    float g = uij*vij*vij - b*vij;

    vec2 uv = norCoord(fragCoord, resolution);
    vec2 mouse_nor = norCoord(mouse, resolution);
    float mcol = smoothstep(0.05, 0.0, length(uv - mouse_nor));

    uOut = high2low(mix(uij + (cu * Du + f)*dt, 0.6, mousePress*mcol));
    vOut = high2low(mix(vij + (cv * Dv + g)*dt, 0.2, mousePress*mcol));
}