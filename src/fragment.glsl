#version 300 es
precision highp float;
out vec4 fragColor;
void main() {
  float x = gl_FragCoord.x / 1024.0; // Normalized x coordinate
  float y = gl_FragCoord.y / 1024.0; // Normalized y coordinate
  fragColor = vec4(x, y, 0.0, 1.0); // Set color based on normalized coordinates
}
