import getAudioContext from "./shared/getAudioContext";

export default async () => {
  const ac = await getAudioContext();
  await ac.resume();

  const resp = await fetch("/music/2021.mp3");
  const arrayBuffer = await resp.arrayBuffer();
  const audioBuffer = await ac.decodeAudioData(arrayBuffer);
  const source = ac.createBufferSource();
  source.buffer = audioBuffer;

  source.connect(ac.destination);
  source.loop = true;
  source.start();
};
