/*
  RainDrop class
  This class represents one falling raindrop.


*/

class RainDrop {
  constructor() {
    this.reset(true);
  }

  reset(randomY = false) {
    // random() is used to create different raindrop depth, length, weight and speed.
    // This follows the team's Perlin/randomness mechanic plan.
    this.x = random(-width * 0.15, width * 1.15);
    this.y = randomY ? random(-height, height) : random(-height * 0.2, -10);

    this.depth = random(0.25, 1.0);
    this.length = map(this.depth, 0.25, 1.0, 8, 32);
    this.weight = map(this.depth, 0.25, 1.0, 0.6, 2.2);
    this.baseSpeed = map(this.depth, 0.25, 1.0, 3.2, 11.5);
    this.alpha = map(this.depth, 0.25, 1.0, 45, 190);
    this.splashLife = 0;
  }

  update(globalWind, speedMultiplier) {
    // globalWind is a smooth value created from audio + Perlin noise.
    // Faster foreground drops respond more strongly to wind.
    this.x += globalWind * this.depth;
    this.y += this.baseSpeed * speedMultiplier;

    if (this.y > height + this.length || this.x < -width * 0.25 || this.x > width * 1.25) {
      this.reset(false);
    }
  }

  hitsUmbrella(umbrella) {
    // Simple collision test: treat the umbrella as an ellipse / shallow bowl.
    // If a drop endpoint falls inside this ellipse, the drop is blocked.
    let dx = (this.x - umbrella.x) / (umbrella.w * 0.5);
    let dy = (this.y - umbrella.y) / (umbrella.h * 0.65);
    return dx * dx + dy * dy < 1 && this.y < umbrella.y + umbrella.h * 0.5;
  }

  makeSplash(umbrella) {
    this.splashLife = 10;
    this.splashX = constrain(this.x, umbrella.x - umbrella.w * 0.45, umbrella.x + umbrella.w * 0.45);
    this.splashY = umbrella.y;
    rainState.blockedDrops++;
    this.reset(false);
  }

  display(angle) {
    push();
    noStroke();

    // Pixel-style rain: each drop is drawn as several small blocks along its fall path.
    // This keeps the rain readable but makes it fit the mosaic city style.
    let x2 = this.x + sin(angle) * this.length * 1.8;
    let y2 = this.y + cos(angle) * this.length;
    let steps = max(2, floor(this.length / 9));
    let blockSize = max(1.5, this.weight * 1.45);

    fill(205, 225, 255, this.alpha);
    for (let i = 0; i < steps; i++) {
      let t = i / steps;
      let px = lerp(this.x, x2, t);
      let py = lerp(this.y, y2, t);
      rect(round(px / 2) * 2, round(py / 2) * 2, blockSize, blockSize * 2.8, 1);
    }
    pop();

    if (this.splashLife > 0) {
      this.displaySplash();
      this.splashLife--;
    }
  }

  displaySplash() {
    push();
    noStroke();
    fill(210, 230, 255, this.splashLife * 17);
    let spread = 18 - this.splashLife;
    rect(this.splashX - spread * 0.5, this.splashY, 4, 3, 1);
    rect(this.splashX + spread * 0.5, this.splashY, 4, 3, 1);
    rect(this.splashX, this.splashY + 2, 3, 3, 1);
    pop();
  }
}
