/*
  Mechanic: Audio-driven atmosphere
  Responsible: Zhendong Song

  Course connection:
  This file uses p5.sound, p5.Amplitude, p5.FFT, getLevel(), getEnergy(),
  pan(), setVolume(), and a Play/Pause button. These connect directly to the
  uploaded volume and FFT tutorial material.

  External / AI acknowledgement:
  This file was written with the help of ChatGPT. Because no external audio files
  are included in this generated project, it creates procedural wind and thunder
  sounds with p5.Noise and p5.Oscillator, then analyses them with p5.sound.
  If the team later adds real thunder/wind audio files, they can replace this
  procedural section with loadSound() in preload().
*/

class AudioWeatherMechanic {
  constructor() {
    this.started = false;

    this.windNoise = null;
    this.thunderOsc = null;
    this.thunderFilter = null;

    this.amp = null;
    this.fft = null;

    this.windLevel = 0;
    this.thunderLevel = 0;
    this.windPan = 0;

    this.windNoisePosition = random(3000);
    this.nextThunderAt = 0;
    this.thunderEnvelope = 0;

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

    // Wind: filtered noise creates a soft environmental wind bed.
    this.windNoise = new p5.Noise("brown");
    this.windNoise.amp(0);
    this.windNoise.start();

    // Thunder: low oscillator pulse.
    this.thunderOsc = new p5.Oscillator("sine");
    this.thunderOsc.freq(58);
    this.thunderOsc.amp(0);
    this.thunderOsc.start();

    // Analyse final output. This follows the p5.sound tutorial pattern.
    this.amp = new p5.Amplitude(0.85);
    this.fft = new p5.FFT(0.8, 64);

    this.started = true;
    this.nextThunderAt = millis() + 1200;
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
      rainState.thunderLevel = 0.08;
      rainState.windLevel = 0.2;
      rainState.windPan = 0;
      return;
    }

    // Wind intensity changes smoothly using noise().
    let windN = noise(this.windNoisePosition);
    this.windLevel = map(windN, 0, 1, 0.05, 0.48);
    this.windPan = map(noise(this.windNoisePosition + 50), 0, 1, -0.75, 0.75);
    this.windNoisePosition += 0.004;

    this.windNoise.amp(this.windLevel, 0.25);
    this.windNoise.pan(this.windPan);

    // Create thunder events at changing intervals.
    if (millis() > this.nextThunderAt) {
      this.thunderEnvelope = random(0.45, 0.95);
      this.thunderOsc.freq(random(42, 78));
      this.nextThunderAt = millis() + random(4200, 8500);
    }

    // Thunder fades down after each pulse.
    this.thunderEnvelope *= 0.91;
    this.thunderOsc.amp(this.thunderEnvelope * 0.62, 0.08);

    // Analyse the sound. Use both measured amplitude and the procedural envelope.
    let measuredLevel = this.amp ? this.amp.getLevel() : 0;
    let lowEnergy = this.fft ? this.fft.getEnergy("bass") / 255 : 0;

    this.thunderLevel = constrain(max(this.thunderEnvelope, measuredLevel * 3, lowEnergy * 0.7), 0, 1);

    rainState.thunderLevel = this.thunderLevel;
    rainState.windLevel = this.windLevel;
    rainState.windPan = this.windPan;
  }
}
