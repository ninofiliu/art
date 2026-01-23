// WIP

export {};

const video = document.createElement("video");
video.src = "/factory.baseline.mp4";
video.muted = true;
video.loop = true;
document.body.append(video);
await new Promise((r) => video.addEventListener("canplaythrough", r));
const width = video.videoWidth;
const height = video.videoHeight;

const canvas = document.createElement("canvas");
canvas.width = width;
canvas.height = height;
document.body.append(canvas);
const ctx = canvas.getContext("2d")!;

const decoder = new VideoDecoder({
  error: console.error,
  output: (frame) => {
    ctx.drawImage(frame, 0, 0);
  },
});
decoder.configure({ codec: "vp8", codedWidth: width, codedHeight: height });

const encoder = new VideoEncoder({
  error: console.error,
  output: (chunk) => {
    decoder.decode(chunk);
  },
});
encoder.configure({ codec: "vp8", width, height });

const loop = () => {
  encoder.encode(new VideoFrame(video));
  requestAnimationFrame(loop);
};
video.play();
loop();
