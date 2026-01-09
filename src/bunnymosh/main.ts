import {
  ALL_FORMATS,
  BufferTarget,
  EncodedPacketSink,
  EncodedVideoPacketSource,
  Input,
  Mp4OutputFormat,
  Output,
  UrlSource,
} from "mediabunny";

const input = new Input({
  formats: ALL_FORMATS,
  source: new UrlSource("/pills_3s.mp4"),
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
for await (const pkt of sink.packets()) {
  await source.add(pkt, { decoderConfig });
}

await output.finalize();

const video = document.createElement("video");
video.src = URL.createObjectURL(new Blob([output.target.buffer!]));
document.body.append(video);
