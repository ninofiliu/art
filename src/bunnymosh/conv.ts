import {
  ALL_FORMATS,
  BufferTarget,
  EncodedPacket,
  EncodedPacketSink,
  EncodedVideoPacketSource,
  Input,
  Mp4OutputFormat,
  Output,
  UrlSource,
} from "mediabunny";

// ffmpeg.exe -i .\highway2_5s.mp4 -profile:v baseline .\highway2_5s.baseline.mp4
const input = new Input({
  formats: ALL_FORMATS,
  source: new UrlSource("/indian.baseline.mp4"),
});

const track = await input.getPrimaryVideoTrack();
if (!track) throw new Error("no track");

const decoderConfig = await track.getDecoderConfig();
if (!decoderConfig) throw new Error("can't decode");

const source = new EncodedVideoPacketSource(track.codec as "avc");

const output = new Output({
  format: new Mp4OutputFormat(),
  target: new BufferTarget(),
});
output.addVideoTrack(source);
await output.start();

const sink = new EncodedPacketSink(track);
const pkts = [] as EncodedPacket[];
for await (const pkt of sink.packets()) {
  pkts.push(pkt);
}
console.log(pkts.map((pkt) => pkt.sequenceNumber));
console.log(
  pkts
    .toSorted((a, b) => a.timestamp - b.timestamp)
    .map((pkt) => pkt.sequenceNumber)
);
const fps = 1 / pkts[0].duration;

console.log(pkts.length);
const repkts = [
  // ...Array(1)
  //   .fill(null)
  //   .flatMap(() => pkts.slice(0, 20)),
  ...pkts.slice(0, 100),
  ...Array(Math.floor((349 - 100) * 2))
    .fill(null)
    .map((_, i) => pkts[Math.floor(100 + i / 2)])
    .filter((pkt, i) => i == 0 || pkt.type == "delta"),
  // ...Array(100)
  //   .fill(null)
  //   .flatMap(() => pkts.slice(20, 21)),
].map((pkt, i) => new EncodedPacket(pkt.data, pkt.type, i / fps, pkt.duration));
console.log(repkts.length);

for (const pkt of repkts) {
  await source.add(pkt, { decoderConfig });
}

await output.finalize();

const video = document.createElement("video");
video.src = URL.createObjectURL(new Blob([output.target.buffer!]));
video.muted = true;
video.autoplay = true;
video.loop = true;
video.controls = true;
video.style.display = "block";
video.style.width = "100vw";
video.style.height = "100vh";
video.style.objectFit = "contain";
document.body.append(video);
