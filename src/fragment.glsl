#version 300 es
precision highp float;
out vec4 color;

uniform vec3 iResolution;
uniform sampler2D tex0;
uniform sampler2D tex1;
uniform sampler2D tex2;

void main() {
  vec2 uv = gl_FragCoord.xy / iResolution.xy;
  uv.y = 1. - uv.y;
  color = texture(tex0, uv);
}