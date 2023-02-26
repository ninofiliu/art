export default async () => {
  const button = document.createElement("button");
  document.body.append(button);
  button.textContent = "start audio context";
  await new Promise((r) => button.addEventListener("click", r, { once: true }));
  const ac = new AudioContext();
  await ac.resume();
  return ac;
};
