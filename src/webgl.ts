import vsSource from "./vertex.glsl?raw";
import fsSourceUnresolved from "./fragment.glsl?raw";
// @ts-expect-error
import { resolveLygia } from "resolve-lygia";

const fsSource = resolveLygia(fsSourceUnresolved);

document.body.style.margin = "0";
document.body.style.overflow = "hidden";
const canvas = document.createElement("canvas");
document.body.appendChild(canvas);

const gl = canvas.getContext("webgl2");
if (!gl) {
  throw new Error("WebGL 2 is not supported");
}

const onResize = () => {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  gl.viewport(0, 0, canvas.width, canvas.height);
};
window.addEventListener("resize", onResize);
onResize();

// Compile shader function
function compileShader(
  gl: WebGL2RenderingContext,
  source: string,
  type: number
): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) {
    throw new Error("Failed to create shader");
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(
      `Shader compilation failed: ${gl.getShaderInfoLog(shader)}`
    );
  }
  return shader;
}

// Create shader program
const vertexShader = compileShader(gl, vsSource, gl.VERTEX_SHADER);
const fragmentShader = compileShader(gl, fsSource, gl.FRAGMENT_SHADER);
const shaderProgram = gl.createProgram();
if (!shaderProgram) {
  throw new Error("Failed to create shader program");
}
gl.attachShader(shaderProgram, vertexShader);
gl.attachShader(shaderProgram, fragmentShader);
gl.linkProgram(shaderProgram);
if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
  throw new Error(
    `Program linking failed: ${gl.getProgramInfoLog(shaderProgram)}`
  );
}
gl.useProgram(shaderProgram);

// Set up vertex buffer
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
const positions = [
  -1.0,
  1.0, // Top-left
  1.0,
  1.0, // Top-right
  -1.0,
  -1.0, // Bottom-left
  1.0,
  -1.0, // Bottom-right
];
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

// Set up vertex attribute
const vertexPosition = gl.getAttribLocation(shaderProgram, "aVertexPosition");
gl.enableVertexAttribArray(vertexPosition);
gl.vertexAttribPointer(vertexPosition, 2, gl.FLOAT, false, 0, 0);

// Clear and draw
gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);

const uniforms = {
  iResolution: gl.getUniformLocation(shaderProgram, "iResolution"),
  tex0: gl.getUniformLocation(shaderProgram, "tex0"),
  tex1: gl.getUniformLocation(shaderProgram, "tex1"),
  time: gl.getUniformLocation(shaderProgram, "time"),
};

gl.uniform1i(uniforms.tex0, 0);
gl.uniform1i(uniforms.tex1, 1);

const createTexture = (gl: WebGL2RenderingContext, index: number) => {
  const texture = gl.createTexture()!;
  gl.activeTexture(gl.TEXTURE0 + index);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.bindTexture(gl.TEXTURE_2D, null);
  return texture;
};

const textures = ["/forest.webp", "/frange.jpeg", "/forest_depth.png"].map(
  (src, i) => {
    const img = document.createElement("img");
    img.src = src;
    img.addEventListener("load", () => {
      gl.activeTexture(gl.TEXTURE0 + i);
      gl.bindTexture(gl.TEXTURE_2D, textures[i]);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    });
    img.addEventListener("error", console.error);
    return createTexture(gl, i);
  }
);
gl.uniform1i(gl.getUniformLocation(shaderProgram, "tex1"), 1);
gl.uniform1i(gl.getUniformLocation(shaderProgram, "tex2"), 2);

const t0 = performance.now();
const render = () => {
  gl.uniform3f(uniforms.iResolution, canvas.width, canvas.height, 0);
  gl.uniform1f(uniforms.time, (performance.now() - t0) / 1000);

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  requestAnimationFrame(render);
};
render();

const stats = document.createElement("pre");
stats.style.position = "fixed";
stats.style.top = "0";
stats.style.margin = "0";
stats.style.background = "rgba(0,0,0,0.5)";
stats.style.color = "white";
stats.style.padding = "0.5em";
document.body.append(stats);

let fps = 0;
const loop = () => {
  fps++;
  requestAnimationFrame(loop);
};
loop();
setInterval(() => {
  stats.innerHTML = `${fps}fps`;
  fps = 0;
}, 1000);
