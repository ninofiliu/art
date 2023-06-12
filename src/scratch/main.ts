import { srcs } from "../srcs";
import { x } from "../shared/x";
import { drawImage } from "../shared/objectFitCover";
import { createSpiral } from "./lib";

(async () => {
  const WIDTH = 1500 / 2;
  const HEIGHT = 3000 / 2;
  const BATCH = 4000;

  document.body.style.background = "black";
  document.body.style.position = "relative";

  const canvas = document.createElement("canvas");
  canvas.style.position = "absolute";
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  document.body.append(canvas);
  const ctx = x(canvas.getContext("2d"));

  // const greens = srcs.filter((src) => src.startsWith("/project-329/"));
  // const src = greens[~~(Math.random() * greens.length)];
  const img = document.createElement("img");
  img.src = "/project-329/23561496_908121566029035_5699584282761857950_n.jpg";
  await img.decode();
  drawImage(ctx, img, "cover");
  const id = ctx.getImageData(0, 0, WIDTH, HEIGHT);

  for (const channel of [0, 1, 2] as const) {
    ctx.fillStyle = [
      `rgba(255,255,255,.15)`,
      `rgba(255,255,255,.30)`,
      `rgba(255,255,255,.40)`,
    ][channel];
    const spiral = createSpiral({
      ctx,
      id,
      channel,
      stopAt: 0.3,
      kind: "compressed",
      divider: 13,
      multiplier: 10,
      quality: 64,
    });
    const loop = () => {
      for (let i = 0; i < BATCH; i++) {
        ctx.fillRect(spiral.x, spiral.y, 1, 1);
        spiral.move();
        if (spiral.done) return;
      }
      requestAnimationFrame(loop);
    };
    loop();
  }
})();
