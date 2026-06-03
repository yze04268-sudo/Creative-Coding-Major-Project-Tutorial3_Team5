/*
  Mechanic: User input
  Responsible: Yue Zhao

  Course connection:
  This file uses mouse position, easing through lerp(), transformations,
  and collision logic. It develops the mouse movement tutorial into a rain-blocking
  umbrella prop.

  Update note:
  The previous blue arc umbrella has been replaced with a pink pixel-art umbrella.
  Three pixel aliens are added near the bottom of the screen. They move horizontally
  with the umbrella while staying close to the bottom, so the user still freely controls
  the umbrella position.
*/

// As for AI usage, drawing the umbrella and aliens was the hardest part. We have already designed their appearances and used ChatGPT to accurately refine our designs.
// create umbrella
class InputUmbrellaMechanic {
  constructor() {
    //umbrella
    this.x = 0;
    this.y = 0;
    //mouse
    this.targetX = 0;
    this.targetY = 0;
    this.w = 180;
    this.h = 55;
    //make the movement smoother
    this.easing = 0.12;

    // Aliens follow the umbrella horizontally, but remain grounded at the bottom.
    this.aliensX = 0;
  }
// core frame update function
  update() {
    this.targetX = mouseX || width / 2;
    this.targetY = mouseY || height * 0.68;

    // Smooth mouse following using lerp(), related to the easing tutorial.
    this.x = lerp(this.x || this.targetX, this.targetX, this.easing);
    this.y = lerp(this.y || this.targetY, this.targetY, this.easing);

    // Make the prop responsive to screen size.
    let minDimension = min(width, height);
    this.w = constrain(minDimension * 0.27, 130, 250);
    this.h = this.w * 0.38;

    // The alien group follows the umbrella on the x-axis only.
    this.aliensX = lerp(this.aliensX || this.x, this.x, 0.10);

    rainState.umbrellaX = this.x;
    rainState.umbrellaY = this.y;
    rainState.umbrellaWidth = this.w;
    rainState.umbrellaHeight = this.h;
  }
// I referenced video by Youtuber Patt Vira, who used the collide() function to create an effect of catching falling letter rain https://www.youtube.com/watch?v=vVXizarOnrU&t=948s
  getCollisionShape() {
    return {
      x: this.x,
      y: this.y,
      w: this.w,
      h: this.h
    };
  }

  display() {
    this.displayAliens();
    this.displayPixelUmbrella();
  }

  displayPixelUmbrella() {
    push();
    translate(this.x, this.y);

    // Draw the umbrella as a low-resolution pixel sprite.
    // The grid keeps the shape close to the pink pixel-art reference.
    let s = this.w / 30;
    rectMode(CORNER);
    noStroke();

    const P = [246, 64, 190, 245];     // main pink
    const L = [255, 150, 226, 245];    // highlight
    const D = [168, 28, 132, 245];     // shadow
    const O = [10, 12, 22, 245];       // dark pixel outline
    const H = [255, 210, 244, 230];    // small shine
// I used ChatGPT to help me draw the umbrella.
    const rows = [
      ".............OOO..............",
      "..........OOOPPPOOO...........",
      "........OOPPPPPPPPOO..........",
      "......OOPPPPPPPPPPPPOO........",
      ".....OPPPPLLLPPPPPPPPPO.......",
      "....OPPPLLLLPPPPPPPPPPPO......",
      "...OPPPLLLLPPPPPPPPPPPPPO.....",
      "..OPPPPLLLPPPPPPPPPPPPPPPO....",
      ".OPPPPPPPPPPPPPPPPPPPPPPPPO...",
      "OPPPPPPPPPPPPPPPPPPPPPPPPPOO..",
      "ODDDPPPPPPPPDDDDPPPPPPPPDDO...",
      "O....ODDDDO......ODDDDO....O..",
      "......ODDO........ODDO........"
    ];

    let startX = -rows[0].length * s * 0.5;
    let startY = -this.h * 0.72;

    for (let r = 0; r < rows.length; r++) {
      for (let c = 0; c < rows[r].length; c++) {
        let ch = rows[r][c];
        if (ch === ".") continue;

        if (ch === "P") fill(P);
        if (ch === "L") fill(L);
        if (ch === "D") fill(D);
        if (ch === "O") fill(O);
        if (ch === "H") fill(H);

        rect(startX + c * s, startY + r * s, s * 1.04, s * 1.04);
      }
    }

    // Central shaft and curved handle.
    let handleX = 0;
    let topY = startY + rows.length * s - s * 0.2;
    let handleBottom = this.h * 0.96;

    fill(O);
    rect(handleX - s * 0.95, topY, s * 1.9, handleBottom - topY);
    fill(D);
    rect(handleX - s * 0.38, topY, s * 0.76, handleBottom - topY);

    // Pixel hook.
    fill(O);
    rect(handleX - s * 0.95, handleBottom, s * 1.9, s);
    rect(handleX - s * 2.85, handleBottom + s, s * 1.9, s);
    rect(handleX - s * 3.8, handleBottom - s, s, s * 2.0);
    rect(handleX - s * 2.85, handleBottom + s * 2, s * 2.9, s);

    fill(L);
    rect(startX + s * 6, startY + s * 4, s * 1.2, s * 2.8);
    rect(startX + s * 8, startY + s * 3, s * 1.2, s * 2.0);
    rect(startX + s * 10, startY + s * 2, s * 1.2, s * 1.4);

    pop();
  }
// I used ChatGPT to help me draw those three aliens, which represents the three of us.
  displayAliens() {
    push();

    let groupX = constrain(this.aliensX, 120, width - 120);
    let groundY = height - min(height * 0.055, 42);
    let alienScale = constrain(min(width, height) / 520, 0.72, 1.12);

    // A faint dark platform makes the characters readable over the city lights.
    noStroke();
    fill(2, 4, 10, 130);
    rect(groupX - 120 * alienScale, groundY - 94 * alienScale, 240 * alienScale, 102 * alienScale, 18);

    this.drawPixelAlien(groupX - 66 * alienScale, groundY, alienScale, [70, 198, 255], [16, 118, 172]);
    this.drawPixelAlien(groupX, groundY, alienScale, [226, 110, 255], [156, 53, 210]);
    this.drawPixelAlien(groupX + 66 * alienScale, groundY, alienScale, [160, 230, 105], [84, 150, 65]);

    pop();
  }

  drawPixelAlien(x, y, scaleFactor, mainCol, darkCol) {
    push();
    translate(x, y);
    scale(scaleFactor);

    let s = 5.2;
    rectMode(CORNER);
    noStroke();

    const rows = [
      "....MMMM....",
      "..MMMMMMMM..",
      ".MMMMMMMMMM.",
      ".MHHMMMMHMM.",
      "MMMMMMMMMMMM",
      "MMDDMMMDDMMM",
      "MMDDMMMDDMMM",
      "MMMMMMMMMMMM",
      "...MDDDDM...",
      "....MMMM....",
      "...MMMMMM...",
      "..MMMMMMMM..",
      ".MM.MMMM.MM.",
      "MM..MMMM..MM",
      "M...MMMM...M",
      "....M..M....",
      "...MM..MM..."
    ];

    let startX = -rows[0].length * s * 0.5;
    let startY = -rows.length * s;

    for (let r = 0; r < rows.length; r++) {
      for (let c = 0; c < rows[r].length; c++) {
        let ch = rows[r][c];
        if (ch === ".") continue;
        if (ch === "M") fill(mainCol[0], mainCol[1], mainCol[2], 245);
        if (ch === "D") fill(darkCol[0], darkCol[1], darkCol[2], 245);
        if (ch === "H") fill(235, 250, 255, 235);
        rect(startX + c * s, startY + r * s, s * 1.04, s * 1.04);
      }
    }

    pop();
  }
}
