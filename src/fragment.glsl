#version 300 es
precision highp float;
out vec4 fragColor;

uniform vec3 iResolution;
uniform sampler2D tex0;
uniform sampler2D tex1;

void main() {
  vec2 uv = gl_FragCoord.xy / iResolution.xy;
  uv.y = 1. - uv.y;
  float x = gl_FragCoord.x / iResolution.x;
  float y = gl_FragCoord.y / iResolution.y;
  // fragColor = vec4(x, y, 0.0, 1.0);
  fragColor = texture(tex1, uv);
}
