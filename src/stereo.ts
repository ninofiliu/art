export {};

const load = async (src: string) => {
  const img = document.createElement("img");
  img.src = src;
  await new Promise((r) => img.addEventListener("load", r, { once: true }));
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0);
  return ctx.getImageData(0, 0, img.width, img.height);
};

const findBoxNearest = (ad: ImageData, bd: ImageData, size: number) => {
  const w = ad.width;
  const h = ad.height;
  return Array.from({ length: w }, (_, xa) =>
    Array.from({ length: h }, (_, ya) => {
      let dmin = Infinity;
      let xmin = xa;
      let ymin = ya;
      const ra = ad.data[4 * (w * ya + xa) + 0];
      const ba = ad.data[4 * (w * ya + xa) + 1];
      const ga = ad.data[4 * (w * ya + xa) + 2];
      for (
        let xb = Math.max(0, xa - size);
        xb < Math.min(w, xa + size + 1);
        xb++
      ) {
        for (
          let yb = Math.max(0, ya - size);
          yb < Math.min(h, ya + size + 1);
          yb++
        ) {
          const rb = bd.data[4 * (w * yb + xb) + 0];
          const gb = bd.data[4 * (w * yb + xb) + 1];
          const bb = bd.data[4 * (w * yb + xb) + 2];
          const d = (ra - rb) ** 2 + (ga - gb) ** 2 + (ba - bb) ** 2;
          if (d < dmin) {
            dmin = d;
            xmin = xb;
            ymin = yb;
          }
        }
      }
      return { x: xmin, y: ymin, d: dmin };
    })
  );
};

// @ts-expect-error
const visualizeOffsets = (
  ad: ImageData,
  bd: ImageData,
  nearests: ReturnType<typeof findBoxNearest>
) => {
  const lcanvas = document.createElement("canvas");
  document.body.append(lcanvas);
  lcanvas.width = ad.width;
  lcanvas.height = ad.height;
  const lctx = lcanvas.getContext("2d")!;
  lctx.putImageData(ad, 0, 0);

  const rdiv = document.createElement("div");
  document.body.append(rdiv);
  rdiv.style.position = "relative";

  const rcanvas = document.createElement("canvas");
  rdiv.append(rcanvas);
  rcanvas.width = bd.width;
  rcanvas.height = bd.height;
  const rctx = rcanvas.getContext("2d")!;
  rctx.putImageData(bd, 0, 0);

  const pointer = document.createElement("span");
  rdiv.append(pointer);
  pointer.style.position = "absolute";
  pointer.style.width = "10px";
  pointer.style.height = "10px";
  pointer.style.background = "red";

  lcanvas.addEventListener("mousemove", ({ x, y }) => {
    pointer.style.left = `${nearests[x][y].x}px`;
    pointer.style.top = `${nearests[y][y].y}px`;
  });
};

(async () => {
  const ld = await load("/stereo/lsmall.jpg");
  const rd = await load("/stereo/rsmall.jpg");
  // @ts-expect-error
  const nearests = findBoxNearest(ld, rd, 10);
})();
