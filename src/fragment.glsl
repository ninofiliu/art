#version 300 es
precision highp float;
out vec4 fragColor;

uniform vec3 iResolution;

void main() {
  float x = gl_FragCoord.x / iResolution.x;
  float y = gl_FragCoord.y / iResolution.y;
  fragColor = vec4(x, y, 0.0, 1.0);
}
