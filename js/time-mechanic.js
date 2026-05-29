/*
  Mechanic: Time-based weather system
  Responsible: Yue Zhao

  Course connection:
  This file uses frameCount, millis(), modulo logic, and lerp() for smooth transitions.
  These relate to the time-based and easing tutorial examples.

  External / AI acknowledgement:
  This file was written with the help of ChatGPT to create a looping 60-second rain scene
  with light rain, storm build-up, heavy storm, and calm-down stages.
*/

// I use ChatGPT to help me refine the coding logic and correct my mistakes. 
// The concept and the art style were developed through discussions among the three of us.

class TimeWeatherMechanic {
  constructor() {
    this.loopDuration = 60000; // 60-second atmospheric loop
    this.stage = "light rain";
    this.targetRainBoost = 1;
    this.currentRainBoost = 1;
    this.lightningAlpha = 0;
    this.nextLightningAt = 0;
  }

  update() {
    let loopTime = millis() % this.loopDuration;
    let progress = loopTime / this.loopDuration;
    rainState.stageProgress = progress;

    // Split the 60-second loop into four weather phases.
    if (progress < 0.25) {
      this.stage = "light rain";
      this.targetRainBoost = 0.75;
    } else if (progress < 0.5) {
      this.stage = "storm building";
      this.targetRainBoost = map(progress, 0.25, 0.5, 1.0, 1.55);
    } else if (progress < 0.78) {
      this.stage = "heavy storm";
      this.targetRainBoost = 1.85;
    } else {
      this.stage = "calming down";
      this.targetRainBoost = map(progress, 0.78, 1.0, 1.35, 0.8);
    }

    // lerp() creates smooth transition instead of sudden jumps.
    this.currentRainBoost = lerp(this.currentRainBoost, this.targetRainBoost, 0.025);

    // Lightning is more frequent during the heavy-storm section.
    if (millis() > this.nextLightningAt) {
      let stormChance = this.stage === "heavy storm" ? 0.75 : 0.22;
      if (random() < stormChance) {
        this.lightningAlpha = random(90, 210);
      }
      this.nextLightningAt = millis() + random(1800, 5200);
    }

    // Fade lightning down over time.
    this.lightningAlpha = max(0, this.lightningAlpha - 8);

    rainState.weatherStage = this.stage;
    rainState.timeRainBoost = this.currentRainBoost;
    rainState.lightningAlpha = this.lightningAlpha;
  }

  displayLightning() {
    if (this.lightningAlpha <= 0) return;

    push();
    noStroke();
    fill(210, 225, 255, this.lightningAlpha);
    rect(0, 0, width, height);

    // Draw a minimal branching lightning line.
    stroke(235, 240, 255, this.lightningAlpha);
    strokeWeight(2);
    let x = random(width * 0.25, width * 0.75);
    let y = 0;
    for (let i = 0; i < 8; i++) {
      let nx = x + random(-40, 40);
      let ny = y + random(30, 85);
      line(x, y, nx, ny);
      x = nx;
      y = ny;
    }
    pop();
  }
}
