#version 300 es
precision highp float;
out vec4 color;

uniform vec3 iResolution;
uniform sampler2D tex0;
uniform sampler2D tex1;

const float k_size = 5. / 1024.;
const int k_resolution = 21;
const float k_weight = 1. / float(k_resolution * k_resolution);

float kernel_square(vec2 uv) { return 1.; }

float kernel_horizontal_edge(vec2 uv) { return -1. + uv.x * 2.; }

void main() {
  vec2 uv = gl_FragCoord.xy / iResolution.xy;
  uv.y = 1. - uv.y;
  color = vec4(vec3(0.), 1.);

  for (float dxn = 0.; dxn <= 1.; dxn += 1. / float(k_resolution)) {
    for (float dyn = 0.; dyn <= 1.; dyn += 1. / float(k_resolution)) {
      vec2 uvk = vec2(dxn, dyn);
      vec2 uvd = uv + (vec2(-1., -1.) + 2. * uvk) * k_size;
      color += kernel_horizontal_edge(uvk) * texture(tex0, uvd) * k_weight;
    }
  }
}