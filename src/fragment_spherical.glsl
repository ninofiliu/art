#version 300 es
precision highp float;
out vec4 color;

uniform vec3 iResolution;
uniform sampler2D tex0;
uniform sampler2D tex1;
uniform float time;

const float k_size = 40. / 1024.;
const int k_resolution = 100;
const float sphericality = 1.;

const float k_weight = 1. / float(k_resolution * k_resolution);

const float gamma = 5.;

vec4 linear_to_log(vec4 col) {
  return vec4(pow(col.rgb, vec3(1. / gamma)), col.a);
}

vec4 log_to_linear(vec4 col) { return vec4(pow(col.rgb, vec3(gamma)), col.a); }

vec2 xy2uv(vec2 xy) { return xy / 2. + 0.5; }
vec2 uv2xy(vec2 uv) { return (uv - 0.5) * 2.; }

void main() {
  vec2 uv = gl_FragCoord.xy / iResolution.xy;
  uv.y = 1. - uv.y;
  vec2 xy = uv2xy(uv);
  float r = length(xy);
  float t = atan(xy.y, xy.x);

  color = vec4(vec3(0.), 1.);

  for (float dxn = 0.; dxn <= 1.; dxn += 1. / float(k_resolution)) {
    for (float dyn = 0.; dyn <= 1.; dyn += 1. / float(k_resolution)) {
      vec2 k_uv = vec2(dxn, dyn);
      vec2 s_xy = xy + uv2xy(k_uv) * k_size * vec2(1., 1.);
      float s_xy_r = length(s_xy);
      float s_xy_t = atan(s_xy.y, s_xy.x);
      s_xy_t = t + sphericality * (s_xy_t - t);
      // s_xy_r = r + 1. / (0.8 + 3. * pow(r, 5.)) * (s_xy_r - r);
      s_xy = vec2(s_xy_r * cos(s_xy_t), s_xy_r * sin(s_xy_t));
      s_xy /= 3.;
      vec2 s_uv = xy2uv(s_xy);

      color +=
          texture(tex1, k_uv) * log_to_linear(texture(tex0, s_uv)) * k_weight;
    }
  }

  color = linear_to_log(color) * 1.;
}