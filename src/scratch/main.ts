import { srcs } from "../srcs";
import { x } from "../shared/x";

(async () => {
  const WIDTH = 1500;
  const HEIGHT = 3000;

  document.body.style.background = "black";

  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  document.body.append(canvas);
  const ctx = x(canvas.getContext("2d"));

  const src = srcs[~~(Math.random() * srcs.length)];
  const img = document.createElement("img");
  img.src = src;
  await img.decode();
  ctx.drawImage(img, 0, 0, WIDTH, HEIGHT);
})();
