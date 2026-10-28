"use strict";
window.initBustuchinAudio = ({ soundButton, ambientPicker }) => {
  let audioContext;
  let ambientNodes = [];
  let ambientTimers = [];
  let radioAudio = null;
  let activeSoundMode = null;
  const soundModeNames = {
    nature: "Natura Bustuchinului",
    relax: "Radio relaxare"
  };
  const ambientStatus = ambientPicker.querySelector(".ambient-picker__status");
  const soundStopButton = ambientPicker.querySelector("[data-sound-stop]");
  const updateSoundInterface = mode => {
    activeSoundMode = mode;
    const isPlaying = Boolean(mode);
    soundButton.classList.toggle("is-active", isPlaying);
    soundButton.dataset.mode = mode || "";
    soundButton.setAttribute("aria-pressed", String(isPlaying));
    soundButton.setAttribute("aria-label", isPlaying ? `Ambianță activă: ${soundModeNames[mode] || "sunet"}. Alege alt sunet sau oprește.` : "Alege ambianța sonoră");
    const icon = soundButton.querySelector("i");
    icon?.classList.toggle("fa-volume-high", isPlaying);
    icon?.classList.toggle("fa-volume-xmark", !isPlaying);
    ambientPicker.querySelectorAll("[data-sound-mode]").forEach(choice => {
      const selected = choice.dataset.soundMode === mode;
      choice.classList.toggle("is-selected", selected);
      if (choice.tagName === "BUTTON") choice.setAttribute("aria-pressed", String(selected));
    });
    soundStopButton.disabled = !isPlaying;
  };
  const stopAmbient = () => {
    ambientTimers.forEach(timer => clearTimeout(timer));
    ambientTimers = [];
    ambientNodes.forEach(node => {
      try { node.stop?.(); } catch (_) {}
      try { node.disconnect?.(); } catch (_) {}
    });
    ambientNodes = [];
    audioContext?.close();
    audioContext = null;
  };
  const startAmbient = () => {
    const AudioEngine = window.AudioContext || window.webkitAudioContext;
    if (!AudioEngine) return;
    audioContext = new AudioEngine();
    const master = audioContext.createGain();
    master.gain.value = .125;
    master.connect(audioContext.destination);

    const createNoiseBuffer = seconds => {
      const buffer = audioContext.createBuffer(1, audioContext.sampleRate * seconds, audioContext.sampleRate);
      const channel = buffer.getChannelData(0);
      let previous = 0;
      for (let index = 0; index < channel.length; index += 1) {
        const white = Math.random() * 2 - 1;
        previous = previous * .985 + white * .015;
        channel[index] = previous * 3.2;
      }
      return buffer;
    };

    /* Foșnetul pădurii — zgomot filtrat, modulat foarte lent. */
    const breeze = audioContext.createBufferSource();
    const windFilter = audioContext.createBiquadFilter();
    const breezeGain = audioContext.createGain();
    const windLfo = audioContext.createOscillator();
    const windDepth = audioContext.createGain();
    breeze.buffer = createNoiseBuffer(4);
    breeze.loop = true;
    windFilter.type = "lowpass";
    windFilter.frequency.value = 780;
    breezeGain.gain.value = .42;
    windLfo.frequency.value = .09;
    windDepth.gain.value = .16;
    windLfo.connect(windDepth).connect(breezeGain.gain);
    breeze.connect(windFilter).connect(breezeGain).connect(master);
    breeze.start();
    windLfo.start();

    /* Apa — un strat mai luminos și continuu, asemenea unui pârâu îndepărtat. */
    const water = audioContext.createBufferSource();
    const waterFilter = audioContext.createBiquadFilter();
    const waterGain = audioContext.createGain();
    const waterLfo = audioContext.createOscillator();
    const waterDepth = audioContext.createGain();
    water.buffer = createNoiseBuffer(3);
    water.loop = true;
    waterFilter.type = "bandpass";
    waterFilter.frequency.value = 1450;
    waterFilter.Q.value = .7;
    waterGain.gain.value = .22;
    waterLfo.frequency.value = .21;
    waterDepth.gain.value = .07;
    waterLfo.connect(waterDepth).connect(waterGain.gain);
    water.connect(waterFilter).connect(waterGain).connect(master);
    water.start();
    waterLfo.start();

    /* Frunziș apropiat — adaugă profunzime pădurii fără a acoperi celelalte sunete. */
    const leaves = audioContext.createBufferSource();
    const leavesFilter = audioContext.createBiquadFilter();
    const leavesGain = audioContext.createGain();
    leaves.buffer = createNoiseBuffer(2);
    leaves.loop = true;
    leavesFilter.type = "highpass";
    leavesFilter.frequency.value = 2600;
    leavesGain.gain.value = .055;
    leaves.connect(leavesFilter).connect(leavesGain).connect(master);
    leaves.start();

    /* Picături neregulate, pentru senzația unui fir de apă aflat în apropiere. */
    const waterDrop = () => {
      if (!audioContext) return;
      const now = audioContext.currentTime;
      const drop = audioContext.createOscillator();
      const dropGain = audioContext.createGain();
      drop.type = "sine";
      drop.frequency.setValueAtTime(720 + Math.random() * 420, now);
      drop.frequency.exponentialRampToValueAtTime(310 + Math.random() * 100, now + .12);
      dropGain.gain.setValueAtTime(.09, now);
      dropGain.gain.exponentialRampToValueAtTime(.001, now + .16);
      drop.connect(dropGain).connect(master);
      drop.start(now);
      drop.stop(now + .17);
      ambientTimers.push(setTimeout(waterDrop, 700 + Math.random() * 1900));
    };
    ambientTimers.push(setTimeout(waterDrop, 500));

    /* Păsări cu triluri diferite: mierlă, pitulice și cuc, distribuite în spațiul stereo. */
    const birdCall = () => {
      if (!audioContext) return;
      const now = audioContext.currentTime;
      const callGain = audioContext.createGain();
      const panner = audioContext.createStereoPanner?.();
      const profiles = [
        { notes: 4, spacing: .17, duration: .18, base: 1550, spread: 700, wave: "sine", rise: 1.55, fall: .9 },
        { notes: 6, spacing: .105, duration: .12, base: 2350, spread: 850, wave: "sine", rise: 1.28, fall: .82 },
        { notes: 2, spacing: .34, duration: .3, base: 720, spread: 100, wave: "triangle", rise: .82, fall: .72 }
      ];
      const profile = profiles[Math.floor(Math.random() * profiles.length)];
      callGain.gain.setValueAtTime(0, now);
      if (panner) {
        panner.pan.value = Math.random() * 1.7 - .85;
        callGain.connect(panner).connect(master);
      } else {
        callGain.connect(master);
      }

      for (let index = 0; index < profile.notes; index += 1) {
        const start = now + index * profile.spacing;
        const oscillator = audioContext.createOscillator();
        const noteGain = audioContext.createGain();
        const base = profile.base + Math.random() * profile.spread;
        oscillator.type = profile.wave;
        oscillator.frequency.setValueAtTime(base, start);
        oscillator.frequency.exponentialRampToValueAtTime(base * profile.rise, start + profile.duration * .38);
        oscillator.frequency.exponentialRampToValueAtTime(base * profile.fall, start + profile.duration);
        noteGain.gain.setValueAtTime(0, start);
        noteGain.gain.linearRampToValueAtTime(.25, start + .018);
        noteGain.gain.exponentialRampToValueAtTime(.001, start + profile.duration);
        oscillator.connect(noteGain).connect(callGain);
        oscillator.start(start);
        oscillator.stop(start + profile.duration + .01);
      }
      callGain.gain.setValueAtTime(.7, now);
      callGain.gain.exponentialRampToValueAtTime(.001, now + profile.notes * profile.spacing + .3);
      const nextBird = setTimeout(birdCall, 2300 + Math.random() * 4700);
      ambientTimers.push(nextBird);
    };

    /* Ciocănitoare îndepărtată — serii scurte și rare, pentru un fundal mai viu. */
    const woodpecker = () => {
      if (!audioContext) return;
      const now = audioContext.currentTime;
      const panner = audioContext.createStereoPanner?.();
      const output = audioContext.createGain();
      output.gain.value = .22;
      if (panner) {
        panner.pan.value = Math.random() * 1.6 - .8;
        output.connect(panner).connect(master);
      } else output.connect(master);
      const taps = 5 + Math.floor(Math.random() * 5);
      for (let index = 0; index < taps; index += 1) {
        const start = now + index * .075;
        const tap = audioContext.createOscillator();
        const tapGain = audioContext.createGain();
        tap.type = "square";
        tap.frequency.value = 1050 + Math.random() * 280;
        tapGain.gain.setValueAtTime(.12, start);
        tapGain.gain.exponentialRampToValueAtTime(.001, start + .026);
        tap.connect(tapGain).connect(output);
        tap.start(start);
        tap.stop(start + .03);
      }
      ambientTimers.push(setTimeout(woodpecker, 9000 + Math.random() * 12000));
    };

    ambientTimers.push(setTimeout(birdCall, 650 + Math.random() * 1000));
    ambientTimers.push(setTimeout(woodpecker, 5000 + Math.random() * 5000));
    ambientNodes.push(
      breeze, windFilter, breezeGain, windLfo, windDepth,
      water, waterFilter, waterGain, waterLfo, waterDepth,
      leaves, leavesFilter, leavesGain, master
    );
    updateSoundInterface("nature");
  };
  const stopRadio = () => {
    if (!radioAudio) return;
    radioAudio.pause();
    radioAudio.removeAttribute("src");
    radioAudio.load();
    radioAudio = null;
  };
  const stopAllSound = () => {
    stopAmbient();
    stopRadio();
    updateSoundInterface(null);
    ambientStatus.textContent = "Sunet oprit.";
  };
  const startNature = () => {
    stopRadio();
    if (!audioContext) startAmbient();
    else if (audioContext.state === "suspended") audioContext.resume();
    updateSoundInterface("nature");
    ambientStatus.textContent = "Se aude Natura Bustuchinului.";
  };
  const startRelaxRadio = async () => {
    stopAmbient();
    stopRadio();
    radioAudio = new Audio("https://relax.stream.publicradio.org/relax.mp3");
    radioAudio.preload = "none";
    radioAudio.volume = .46;
    radioAudio.addEventListener("error", () => {
      if (activeSoundMode !== "relax") return;
      stopRadio();
      updateSoundInterface(null);
      ambientStatus.textContent = "Radio-ul nu poate fi redat acum. Încearcă din nou puțin mai târziu.";
    }, { once: true });
    try {
      await radioAudio.play();
      updateSoundInterface("relax");
      ambientStatus.textContent = "Se aude radio de relaxare.";
    } catch (_) {
      stopRadio();
      updateSoundInterface(null);
      ambientStatus.textContent = "Redarea a fost blocată. Apasă din nou pe opțiunea radio.";
    }
  };
  const closeAmbientPicker = () => {
    ambientPicker.hidden = true;
    soundButton.setAttribute("aria-expanded", "false");
  };
  const openAmbientPicker = () => {
    ambientPicker.hidden = false;
    soundButton.setAttribute("aria-expanded", "true");
  };
  soundButton.setAttribute("aria-expanded", "false");
  soundButton.addEventListener("click", () => {
    if (ambientPicker.hidden) openAmbientPicker();
    else closeAmbientPicker();
  });
  ambientPicker.addEventListener("click", event => {
    if (event.target.closest("[data-ambient-close]")) closeAmbientPicker();
    if (event.target.closest("[data-sound-stop]")) stopAllSound();
    if (event.target.closest('[data-sound-mode="nature"]')) startNature();
    if (event.target.closest('[data-sound-mode="relax"]')) startRelaxRadio();
  });
  document.addEventListener("click", event => {
    if (!ambientPicker.hidden && !ambientPicker.contains(event.target) && !soundButton.contains(event.target)) closeAmbientPicker();
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !ambientPicker.hidden) closeAmbientPicker();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && (audioContext || radioAudio)) stopAllSound();
  });
};
