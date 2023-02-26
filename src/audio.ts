import getAudioContext from "./shared/getAudioContext";

(async () => {
  const ac = await getAudioContext();

  const createKicker = () => {
    const osc = ac.createOscillator();
    osc.frequency.value = 100;
    osc.start();
    const gain = ac.createGain();
    gain.gain.value = 0;

    osc.connect(gain);
    gain.connect(ac.destination);

    const program = (t: number) => {
      gain.gain.cancelScheduledValues(t);
      gain.gain.setValueAtTime(1, t);
      gain.gain.linearRampToValueAtTime(0, t + 0.4);

      osc.frequency.cancelScheduledValues(t);
      osc.frequency.setValueAtTime(800, t);
      osc.frequency.linearRampToValueAtTime(100, t + 0.05);
    };

    return { program };
  };

  const sine = ac.createOscillator();
  sine.type = "triangle";
  sine.start();

  const gain = ac.createGain();
  gain.gain.value = 0;

  {
    const bpm = 120;

    const kicker = createKicker();

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
      if (willScheduleUntil > scheduledUntil) {
        for (
          let i = Math.floor(scheduledUntil / atomDuration);
          i < Math.floor(willScheduleUntil / atomDuration);
          i++
        ) {
          const barI = i % barTab.length;
          if (barTab[barI]) {
            kicker.program(i * atomDuration);
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
