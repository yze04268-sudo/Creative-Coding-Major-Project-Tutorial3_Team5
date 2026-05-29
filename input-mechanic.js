/*
  Mechanic: User input
  Responsible: Yue Zhao

  Course connection:
  This file uses mouse position, easing through lerp(), transformations,
  and collision logic. It develops the mouse movement tutorial into a rain-blocking
  umbrella / bowl-shaped prop.

  External / AI acknowledgement:
  This file was written with the help of ChatGPT to translate mouse interaction
  into an umbrella object that blocks raindrops and creates small splash feedback.
*/

class InputUmbrellaMechanic {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.targetX = 0;
    this.targetY = 0;
    this.w = 180;
    this.h = 55;
    this.easing = 0.12;
  }

  update() {
    this.targetX = mouseX || width / 2;
    this.targetY = mouseY || height * 0.68;

    // Smooth mouse following using lerp(), related to the easing tutorial.
    this.x = lerp(this.x || this.targetX, this.targetX, this.easing);
    this.y = lerp(this.y || this.targetY, this.targetY, this.easing);

    // Make the prop responsive to screen size.
    let minDimension = min(width, height);
    this.w = constrain(minDimension * 0.26, 125, 240);
    this.h = this.w * 0.31;

    rainState.umbrellaX = this.x;
    rainState.umbrellaY = this.y;
    rainState.umbrellaWidth = this.w;
    rainState.umbrellaHeight = this.h;
  }

  getCollisionShape() {
    return {
      x: this.x,
      y: this.y,
      w: this.w,
      h: this.h
    };
  }

  display() {
    push();
    translate(this.x, this.y);

    // Bowl / umbrella surface.
    noFill();
    stroke(215, 230, 255, 220);
    strokeWeight(3);
    arc(0, 0, this.w, this.h, PI, TWO_PI);

    // Slight inner glow.
    stroke(120, 170, 255, 70);
    strokeWeight(9);
    arc(0, 1, this.w * 0.94, this.h * 0.72, PI, TWO_PI);

    // Handle / marker showing user control.
    stroke(210, 225, 255, 160);
    strokeWeight(2);
    line(0, 0, 0, this.h * 0.55);
    noStroke();
    fill(210, 225, 255, 180);
    circle(0, this.h * 0.62, 5);

    pop();
  }
}
