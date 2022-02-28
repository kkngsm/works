precision highp float;
precision highp int;
in vec3 vNormal;
in vec2 fragCoord;
layout (location = 0) out vec4 fragColor;
uniform sampler2D tex;
uniform vec3 cameraPos;

void main(){
  fragColor = texture(tex, fragCoord);
}
