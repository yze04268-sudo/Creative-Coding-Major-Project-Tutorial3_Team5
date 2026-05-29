/*
  RainDrop class
  This class represents one falling raindrop.

  External / AI acknowledgement:
  This class was written with the help of ChatGPT to combine course concepts
  including arrays, classes, random values, Perlin-driven motion, collision checks,
  and responsive canvas scaling. The logic is commented below.
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
    stroke(205, 225, 255, this.alpha);
    strokeWeight(this.weight);

    // The rain line is angled by wind. This uses a simple x offset rather than rotating
    // the whole canvas, so it stays easy to read and debug.
    let x2 = this.x + sin(angle) * this.length * 1.8;
    let y2 = this.y + cos(angle) * this.length;
    line(this.x, this.y, x2, y2);
    pop();

    if (this.splashLife > 0) {
      this.displaySplash();
      this.splashLife--;
    }
  }

  displaySplash() {
    push();
    noFill();
    stroke(210, 230, 255, this.splashLife * 18);
    strokeWeight(1);
    arc(this.splashX, this.splashY, 18 - this.splashLife, 8, PI, TWO_PI);
    pop();
  }
}
