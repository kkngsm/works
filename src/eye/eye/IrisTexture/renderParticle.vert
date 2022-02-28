in float index;
uniform sampler2D dataTex;
uniform float resolution;
void main(){
    float frag = 1.0 / resolution;
    vec2 p = vec2(
        mod(index, resolution) / resolution,
        floor(index / resolution) / resolution
    );
    vec3 data = texture(dataTex, p).xyz;
    gl_PointSize = 2.0;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(data.xy-.5, 0, 1);
}