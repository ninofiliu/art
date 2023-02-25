export {};

(async () => {
  const ac = new AudioContext();

  if (ac.state === "suspended") {
    const button = document.createElement("button");
    document.body.append(button);
    button.textContent = "start audio context";
    await new Promise((r) =>
      button.addEventListener("click", r, { once: true })
    );
    button.remove();
    await ac.resume();
  }

  const sine = ac.createOscillator();
  sine.type = "triangle";
  sine.start();

  const gain = ac.createGain();
  gain.gain.value = 0;

  {
    const bpm = 120;

    const programKick = (t0: number) => {
      gain.gain.cancelScheduledValues(t0);
      gain.gain.setValueAtTime(0, t0);
      gain.gain.linearRampToValueAtTime(1, t0 + 0.01);
      gain.gain.linearRampToValueAtTime(0, t0 + 0.1);
    };

    const barTab = "|x.xx|.xx.|x..x|..x.|"
      .split("")
      .filter((s) => s !== "|")
      .map((s) => s === "x");
    const atomDuration = 60 / bpm / 4;

    const every = 1;
    const margin = 0.2;
    let scheduledUntil = ac.currentTime;
    const schedule = () => {
      const willScheduleUntil = ac.currentTime + every + margin;
      console.log({ scheduledUntil, willScheduleUntil });
      if (willScheduleUntil > scheduledUntil) {
        for (
          let i = Math.floor(scheduledUntil / atomDuration);
          i < Math.floor(willScheduleUntil / atomDuration);
          i++
        ) {
          const barI = i % barTab.length;
          if (barTab[barI]) {
            programKick(i * atomDuration);
          }
          scheduledUntil = willScheduleUntil;
        }
      }
    };
    schedule();
    setInterval(schedule, every * 1000);
  }

  sine.connect(gain);
  gain.connect(ac.destination);
})();
