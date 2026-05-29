/*
  Mechanic: Perlin noise and randomness
  Responsible: CHUCHU TANG

  Course connection:
  This file adapts the Perlin noise tutorial idea: random() gives individual variation,
  while noise() creates smooth continuous change instead of harsh jitter.

  External / AI acknowledgement:
  This file was written with the help of ChatGPT. It uses p5.js noise() and random()
  to create natural rain drift and particle fog movement for the final project.
*/

class PerlinRainMechanic {
  constructor() {
    this.noiseLocation = random(1000);
    this.fogNoiseLocation = random(2000);
    this.windStrength = 0;
    this.fogParticles = [];
    this.rebuildFogParticles();
  }

  rebuildFogParticles() {
    this.fogParticles = [];
    let count = 220;
    for (let i = 0; i < count; i++) {
      this.fogParticles.push({
        // Store normalised positions so the fog still scales when the canvas changes.
        x: random(0.02, 0.98),
        y: random(0.08, 0.92),
        size: random(2, 9),
        seed: random(1000),
        drift: random(-0.015, 0.015),
        baseAlpha: random(6, 24)
      });
    }
  }

  update() {
    // 1D Perlin noise for wind drift.
    // The output of noise() is 0..1, so map it to a negative/positive range.
    let n = noise(this.noiseLocation);
    this.windStrength = map(n, 0, 1, -2.6, 2.6);
    this.noiseLocation += 0.006;

    // A second noise sample controls fog shift and density.
    let fogN = noise(this.fogNoiseLocation);
    rainState.fogShift = map(fogN, 0, 1, -width * 0.1, width * 0.1);
    rainState.fogDensity = map(noise(this.fogNoiseLocation + 88), 0, 1, 0.25, 1.25);
    this.fogNoiseLocation += 0.0025;

    rainState.perlinWind = this.windStrength;
  }

  displayFog() {
    // Particle fog, replacing the previous long ellipse bands.
    // Each particle fades in/out through noise so the fog becomes denser and lighter over time.
    push();
    noStroke();
    blendMode(BLEND);

    for (let p of this.fogParticles) {
      let densityPulse = rainState.fogDensity || 0.8;
      let localNoise = noise(p.seed, this.fogNoiseLocation * 0.8);
      let driftNoise = noise(p.seed + 200, this.fogNoiseLocation);

      let x = p.x * width + rainState.fogShift * p.drift * 12 + map(driftNoise, 0, 1, -35, 35);
      let y = p.y * height + map(localNoise, 0, 1, -18, 18);
      let particleSize = p.size * map(localNoise, 0, 1, 0.7, 1.8);
      let alpha = p.baseAlpha * densityPulse * map(localNoise, 0, 1, 0.25, 1.1);

      // Slightly bluish fog particles keep the rain-room colour palette.
      fill(185, 210, 255, alpha);
      circle(x, y, particleSize);
    }
    pop();
  }
}
