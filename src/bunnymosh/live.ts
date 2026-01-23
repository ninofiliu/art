import {
  ALL_FORMATS,
  EncodedPacket,
  EncodedPacketSink,
  Input,
  UrlSource,
} from "mediabunny";

const input = new Input({
  formats: ALL_FORMATS,
  source: new UrlSource("/memlena0.baseline.mp4"),
});

const track = await input.getPrimaryVideoTrack();
if (!track) throw new Error("no track");

const decoderConfig = await track.getDecoderConfig();
if (!decoderConfig) throw new Error("can't decode");

// Collect all packets first
const sink = new EncodedPacketSink(track);
const pkts: EncodedPacket[] = [];
for await (const pkt of sink.packets()) {
  pkts.push(pkt);
}
console.log(`Collected ${pkts.length} packets`);

// Create canvas for output
const canvas = document.createElement("canvas");
canvas.width = decoderConfig.codedWidth!;
canvas.height = decoderConfig.codedHeight!;
document.body.append(canvas);
const ctx = canvas.getContext("2d")!;

// Decode packets and render to canvas in real-time
const decoder = new VideoDecoder({
  output: (frame) => {
    ctx.drawImage(frame, 0, 0);
    frame.close();
  },
  error: console.error,
});

decoder.configure(decoderConfig);

const presses = {} as Record<string, boolean>;
window.addEventListener("keydown", (evt) => {
  presses[evt.key] = true;
});
window.addEventListener("keyup", (evt) => {
  presses[evt.key] = false;
});

let i = 0;
while (true) {
  const pkt = pkts[~~i % pkts.length];
  const chunk = new EncodedVideoChunk({
    type: pkt.type,
    timestamp: pkt.timestamp * 1_000_000,
    duration: pkt.duration * 1_000_000,
    data: pkt.data,
  });
  decoder.decode(chunk);
  await new Promise((r) => setTimeout(r, pkt.duration * 1000));

  if (presses["p"]) {
    i += 0.5;
  } else {
    i++;
  }
  if (presses["i"]) i = 0;
}
