/*
  Mechanic: Perlin noise and randomness
  Responsible: CHUCHU TANG

  Course connection:
  This file adapts the Perlin noise tutorial idea: random() gives individual variation,
  while noise() creates smooth continuous change instead of harsh jitter.

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

    // More particles than the previous version so the fog is visible against the city.
    // They are stored in normalised positions so they scale with the browser window.
    let count = 520;
    for (let i = 0; i < count; i++) {
      this.fogParticles.push({
        x: random(0.02, 0.98),
        y: random(0.16, 0.82),
        size: random(3, 13),
        seed: random(10000),
        layer: random(0.25, 1.0),
        baseAlpha: random(10, 46)
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
    rainState.fogShift = map(fogN, 0, 1, -width * 0.12, width * 0.12);

    // Stronger density range: the fog now visibly becomes thick and thin.
    rainState.fogDensity = map(noise(this.fogNoiseLocation + 88), 0, 1, 0.18, 1.65);
    this.fogNoiseLocation += 0.0025;

    rainState.perlinWind = this.windStrength;
  }

  displayFog() {
    // Pixel-particle fog. This replaces smooth long ellipses with square/dot particles.
    // It is intentionally drawn as clusters so it matches the mosaic city.
    push();
    noStroke();

    for (let p of this.fogParticles) {
      let densityPulse = rainState.fogDensity || 0.8;
      let localNoise = noise(p.seed, this.fogNoiseLocation * 1.3);
      let driftNoise = noise(p.seed + 220, this.fogNoiseLocation * 0.9);
      let visibilityNoise = noise(p.seed + 500, this.fogNoiseLocation * 0.55);

      // Only draw some particles at low density, and many particles at high density.
      let visibilityThreshold = map(densityPulse, 0.18, 1.65, 0.72, 0.22);
      if (visibilityNoise < visibilityThreshold) continue;

      let x =
        p.x * width +
        rainState.fogShift * p.layer +
        map(driftNoise, 0, 1, -55, 55);

      let y =
        p.y * height +
        map(localNoise, 0, 1, -26, 26);

      // Pixel grid snapping: this keeps the fog from looking too smooth.
      let grid = 6;
      x = round(x / grid) * grid;
      y = round(y / grid) * grid;

      let particleSize = round((p.size * map(localNoise, 0, 1, 0.75, 1.9)) / 2) * 2;
      let alpha = p.baseAlpha * densityPulse * map(localNoise, 0, 1, 0.35, 1.35);

      // Slight colour variation avoids a black/white-only look.
      let cool = noise(p.seed + 900, this.fogNoiseLocation);
      if (cool > 0.58) {
        fill(135, 165, 230, alpha);
      } else {
        fill(185, 210, 255, alpha);
      }

      // Use square pixels instead of smooth ellipses.
      rect(x, y, particleSize, particleSize, 1);
    }
    pop();
  }
}
