const button = document.createElement("button");
button.innerHTML = "capture";
document.body.append(button);
button.addEventListener("click", async () => {
  const stream = await navigator.mediaDevices.getDisplayMedia();
  const recoder = new MediaRecorder(stream);
  recoder.start();

  const [video] = stream.getVideoTracks();
  video.addEventListener("ended", () => {
    recoder.stop();
  });

  recoder.addEventListener("dataavailable", (evt) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(evt.data);
    a.download = "capture.webm";
    a.click();
  });
});
