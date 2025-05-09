#version 300 es
precision highp float;
out vec4 color;

uniform vec3 iResolution;
uniform sampler2D tex0;
uniform sampler2D tex1;
uniform sampler2D tex2;
uniform float time;

const float k_size = 10. / 1024.;
const int k_resolution = 40;
const float sphericality = 1.;
const int nb_layers = 20;
const float anamorphism = 4.;

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
  vec2 xy = 2. * (uv - 0.5 * vec2(1.));
  float r = length(xy);
  float t = atan(xy.y, xy.x);

  color = vec4(vec3(0.), 1.);
  float depth = 1. - texture(tex2, uv).r;
  float focal_depth = 0.7 + 0.3 * sin(time * 0.5);
  float blur_radius = 1. * abs(1. / depth - 1. / focal_depth);

  for (int i_layer = 0; i_layer < nb_layers; i_layer++) {
    float layer_depth_max = 1. - float(i_layer) / float(nb_layers);
    float layer_depth_min = 1. - float(i_layer + 1) / float(nb_layers);
    if (layer_depth_min < depth && depth <= layer_depth_max) {
      for (float dxn = 0.; dxn <= 1.; dxn += 1. / float(k_resolution)) {
        for (float dyn = 0.; dyn <= 1.; dyn += 1. / float(k_resolution)) {
          vec2 k_uv = vec2(dxn, dyn);
          vec2 s_xy =
              xy + uv2xy(k_uv) * k_size * blur_radius * vec2(1., anamorphism);
          vec2 s_uv = xy2uv(s_xy);

          color += texture(tex1, k_uv) * log_to_linear(texture(tex0, s_uv)) *
                   k_weight;
        }
      }
    }
  }

  color = linear_to_log(color) * 1.;
  // color.r = depth;
}