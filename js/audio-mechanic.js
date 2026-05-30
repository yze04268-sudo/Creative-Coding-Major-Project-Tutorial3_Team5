/*
  Mechanic: Audio-driven atmosphere
  Responsible: Zhendong Song

  Course connection:
  This file uses p5.sound, p5.Amplitude, p5.FFT, getLevel(), getEnergy(),
  pan(), setVolume(), and a Play/Pause button. These connect directly to the
  uploaded volume and FFT tutorial material.

*/

class AudioWeatherMechanic {
  constructor() {
    this.started = false;

    this.windNoise = null;

    // Thunder is built from a low rumble oscillator plus a short noise crack.
    this.thunderOsc = null;
    this.thunderNoise = null;

    this.amp = null;
    this.fft = null;

    this.windLevel = 0;
    this.thunderLevel = 0;
    this.windPan = 0;

    this.windNoisePosition = random(3000);
    this.nextThunderAt = 0;

    // Two envelopes make thunder more readable:
    // rumble = long low sound, crack = short bright impact.
    this.thunderRumbleEnvelope = 0;
    this.thunderCrackEnvelope = 0;

    this.button = null;
  }

  setupButton() {
    this.button = createButton("Play / Pause Sound");
    this.button.position(18, 18);
    this.button.mousePressed(() => this.toggleSound());
  }

  initialiseAudio() {
    // Start the audio context only after user interaction.
    userStartAudio();

    // Wind: brown noise creates a soft environmental wind bed.
    this.windNoise = new p5.Noise("brown");
    this.windNoise.amp(0);
    this.windNoise.start();

    // Low thunder rumble.
    this.thunderOsc = new p5.Oscillator("sine");
    this.thunderOsc.freq(48);
    this.thunderOsc.amp(0);
    this.thunderOsc.start();

    // Short noisy thunder crack. This makes the thunder perceptible,
    // because a pure low sine wave can sound too subtle on laptop speakers.
    this.thunderNoise = new p5.Noise("brown");
    this.thunderNoise.amp(0);
    this.thunderNoise.start();

    // Analyse final output. This follows the p5.sound tutorial pattern.
    this.amp = new p5.Amplitude(0.85);
    this.fft = new p5.FFT(0.8, 64);

    this.started = true;
    this.nextThunderAt = millis() + 900;
  }

  toggleSound() {
    if (!this.started) {
      this.initialiseAudio();
      return;
    }

    if (getAudioContext().state === "running") {
      getAudioContext().suspend();
    } else {
      getAudioContext().resume();
    }
  }

  update() {
    if (!this.started) {
      // Without sound started, use gentle fallback values so the visual still works.
      rainState.thunderLevel = 0.10;
      rainState.windLevel = 0.2;
      rainState.windPan = 0;
      return;
    }

    // Wind intensity changes smoothly using noise().
    let windN = noise(this.windNoisePosition);
    this.windLevel = map(windN, 0, 1, 0.05, 0.42);
    this.windPan = map(noise(this.windNoisePosition + 50), 0, 1, -0.75, 0.75);
    this.windNoisePosition += 0.004;

    this.windNoise.amp(this.windLevel * 0.42, 0.35);
    this.windNoise.pan(this.windPan);

    // Thunder events happen at changing intervals, with a stronger chance during storm stages.
    let stormFactor = constrain(rainState.timeRainBoost, 0.6, 1.7);
    if (millis() > this.nextThunderAt) {
      this.thunderRumbleEnvelope = random(0.62, 1.0);
      this.thunderCrackEnvelope = random(0.45, 0.88);
      this.thunderOsc.freq(random(34, 64));

      // Storm periods trigger thunder more often.
      this.nextThunderAt = millis() + random(2600, 7600) / stormFactor;
    }

    // Envelope decay. The crack fades quickly; the rumble fades slowly.
    this.thunderCrackEnvelope *= 0.76;
    this.thunderRumbleEnvelope *= 0.94;

    // Audible procedural thunder.
    this.thunderOsc.amp(this.thunderRumbleEnvelope * 0.55, 0.08);
    this.thunderNoise.amp(this.thunderCrackEnvelope * 0.38, 0.04);
    this.thunderNoise.pan(random(-0.18, 0.18));

    // Analyse the sound. Use measured amplitude and the procedural envelopes.
    let measuredLevel = this.amp ? this.amp.getLevel() : 0;
    let lowEnergy = this.fft ? this.fft.getEnergy("bass") / 255 : 0;

    this.thunderLevel = constrain(
      max(
        this.thunderRumbleEnvelope * 0.9,
        this.thunderCrackEnvelope,
        measuredLevel * 3.2,
        lowEnergy * 0.75
      ),
      0,
      1
    );

    rainState.thunderLevel = this.thunderLevel;
    rainState.windLevel = this.windLevel;
    rainState.windPan = this.windPan;
  }
}
