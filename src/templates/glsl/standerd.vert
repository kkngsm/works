uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
in vec2 uv;
in vec3 position;
out vec2 fragCoord;
void main(){
    fragCoord = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}