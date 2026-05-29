/*
  Mechanic: Perlin noise and randomness
  Responsible: CHUCHU TANG

  Course connection:
  This file adapts the Perlin noise tutorial idea: random() gives individual variation,
  while noise() creates smooth continuous change instead of harsh jitter.

  External / AI acknowledgement:
  This file was written with the help of ChatGPT. It uses p5.js noise() and random()
  to create natural rain drift and fog movement for the final project.
*/

class PerlinRainMechanic {
  constructor() {
    this.noiseLocation = random(1000);
    this.fogNoiseLocation = random(2000);
    this.windStrength = 0;
  }

  update() {
    // 1D Perlin noise for wind drift.
    // The output of noise() is 0..1, so map it to a negative/positive range.
    let n = noise(this.noiseLocation);
    this.windStrength = map(n, 0, 1, -2.6, 2.6);
    this.noiseLocation += 0.006;

    // A second noise sample moves the fog slowly.
    let fogN = noise(this.fogNoiseLocation);
    rainState.fogShift = map(fogN, 0, 1, -width * 0.12, width * 0.12);
    this.fogNoiseLocation += 0.0025;

    rainState.perlinWind = this.windStrength;
  }

  displayFog() {
    // Draw layered translucent fog bands. This uses noise() for organic movement.
    push();
    noStroke();
    for (let i = 0; i < 9; i++) {
      let y = map(i, 0, 8, height * 0.1, height * 0.95);
      let localNoise = noise(this.fogNoiseLocation + i * 0.22);
      let x = rainState.fogShift + map(localNoise, 0, 1, -90, 90);
      let fogW = width * map(localNoise, 0, 1, 0.62, 1.18);
      let fogH = height * 0.09;

      fill(205, 220, 255, 9);
      ellipse(width / 2 + x, y, fogW, fogH);
    }
    pop();
  }
}
