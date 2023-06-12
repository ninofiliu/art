/** For an image of dimensions (w,h) that has to fit in a container of dimensions (dw, dh), computes the cropped rectangle to be displayed and returns it as (sx, sy, sw, sh) */
export const objectFitCover = (
  w: number,
  h: number,
  dw: number,
  dh: number
) => {
  const [sw, sh] = w / h <= dw / dh ? [w, (w * dh) / dw] : [(h * dw) / dh, h];
  return [(w - sw) / 2, (h - sh) / 2, sw, sh] as const;
};

export const drawImage = (
  ctx: CanvasRenderingContext2D,
  source: HTMLImageElement,
  objectFit: "fill" | "cover"
) => {
  const w = source.width;
  const h = source.height;
  const dw = ctx.canvas.width;
  const dh = ctx.canvas.height;
  const s = {
    cover: objectFitCover(w, h, dw, dh),
    fill: [0 as number, 0 as number, w, h] as const,
  }[objectFit];
  ctx.drawImage(source, ...s, 0, 0, dw, dh);
};
