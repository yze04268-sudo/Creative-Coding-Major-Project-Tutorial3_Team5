/*
  Main sketch file
  This file brings all separate mechanics together.

  Digital Rain Room:
  - Audio controls thunder intensity and wind direction.
  - Time controls the 60-second weather loop and lightning.
  - Perlin noise/randomness create organic rain and particle fog.
  - Mouse input controls a rain-blocking umbrella/bowl prop.

  Update note:
  The earlier central oval has been changed into a pulsing moon form.
  A mosaic city layer has been added behind the rain, and the horizontal
  scan-line background has been removed so the vertical rain movement stays dominant.
*/

let audioMechanic;
let timeMechanic;
let perlinMechanic;
let inputMechanic;

let raindrops = [];
let maxDrops = 520;

// Mosaic city data is generated once and reused each frame.
let cityBuildings = [];
let cityLights = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  colorMode(RGB, 255, 255, 255, 255);
  angleMode(RADIANS);

  audioMechanic = new AudioWeatherMechanic();
  timeMechanic = new TimeWeatherMechanic();
  perlinMechanic = new PerlinRainMechanic();
  inputMechanic = new InputUmbrellaMechanic();

  audioMechanic.setupButton();

  rebuildRainSystem();
  rebuildCitySystem();
}

function draw() {
  drawAtmosphericBackground();

  // Update each mechanic independently before drawing the atmospheric layers.
  audioMechanic.update();
  timeMechanic.update();
  perlinMechanic.update();
  inputMechanic.update();

  // Combine mechanic outputs into rain behaviour.
  combineMechanics();

  drawMosaicCity();

  // Pixel fog is now visible between the city and the rain/moon layers.
  perlinMechanic.displayFog();
  drawMoon();

  // Draw rain.
  let activeDropCount = floor(maxDrops * rainState.rainDensity);
  let umbrella = inputMechanic.getCollisionShape();

  for (let i = 0; i < activeDropCount && i < raindrops.length; i++) {
    let drop = raindrops[i];
    drop.update(rainState.rainAngle * 10, rainState.rainSpeed);

    if (drop.hitsUmbrella(umbrella)) {
      drop.makeSplash(umbrella);
    }

    drop.display(rainState.rainAngle);
  }

  inputMechanic.display();
  timeMechanic.displayLightning();
  drawThunderPixelFlash();
  drawInterfaceText();
}

function combineMechanics() {
  // Rain density is driven by both time stage and thunder level.
  rainState.rainDensity = constrain(
    rainState.timeRainBoost + rainState.thunderLevel * 0.9,
    0.35,
    2.25
  );

  // Rain speed increases during thunder/storm stages.
  rainState.rainSpeed = constrain(
    0.78 + rainState.timeRainBoost * 0.25 + rainState.thunderLevel * 0.85,
    0.7,
    2.35
  );

  // Wind comes from audio pan, audio level, and Perlin flow.
  let audioWind = rainState.windPan * rainState.windLevel * 8.0;
  let organicWind = rainState.perlinWind;
  let combinedWind = audioWind + organicWind;

  // The angle is kept moderate so rain stays readable.
  rainState.rainAngle = lerp(rainState.rainAngle, constrain(combinedWind * 0.12, -0.62, 0.62), 0.04);
}

function drawAtmosphericBackground() {
  // Dark base colour. The horizontal scan-line gradient has been removed.
  background(4, 8, 18);

  // Subtle vertical pixel weather shafts. These keep the rain-room atmosphere
  // while matching the mosaic city rather than creating horizontal stripes.
  push();
  noStroke();
  let grid = 10;
  for (let i = 0; i < 42; i++) {
    let x = map(i, 0, 41, 0, width);
    let n = noise(i * 0.13, frameCount * 0.003);
    let alpha = map(n, 0, 1, 4, 18);
    let blue = map(n, 0, 1, 36, 78);

    for (let y = 0; y < height; y += grid * 2) {
      let local = noise(i * 0.3, y * 0.006, frameCount * 0.004);
      if (local > 0.58) {
        fill(30, 52, blue, alpha * local);
        rect(round((x + rainState.rainAngle * y * 0.04) / grid) * grid, y, grid * 0.65, grid * 1.5);
      }
    }
  }
  pop();
}

function drawMoon() {
  // The old central ellipse now works as a pixel-style moon/light source.
  // Its form slowly moves between a round moon and a crescent.
  push();
  noStroke();

  let moonX = width * 0.58;
  let moonY = height * 0.31;
  let moonSize = min(width, height) * 0.34;

  // Brightness breathes slowly and also reacts to thunder/lightning.
  let breathing = map(sin(frameCount * 0.018), -1, 1, 0.52, 1.0);
  let thunderFlash = map(rainState.thunderLevel, 0, 1, 0, 0.65);
  let moonAlpha = 24 + breathing * 46 + thunderFlash * 42;

  let phase = map(sin(frameCount * 0.006), -1, 1, 0.04, 0.68);

  // Outer pixel glow: squares instead of smooth ellipses.
  let grid = max(8, floor(moonSize / 28));
  for (let gx = -moonSize; gx <= moonSize; gx += grid) {
    for (let gy = -moonSize * 0.72; gy <= moonSize * 0.72; gy += grid) {
      let nx = gx / (moonSize * 0.95);
      let ny = gy / (moonSize * 0.58);
      let d = nx * nx + ny * ny;
      if (d < 1.0) {
        let fade = map(d, 0, 1, 1, 0);
        fill(95, 125, 185, moonAlpha * 0.10 * fade);
        rect(moonX + gx, moonY + gy, grid * 1.05, grid * 1.05, 1);
      }
    }
  }

  // Main moon body with pixel-grid squares.
  let moonGrid = max(7, floor(moonSize / 32));
  for (let gx = -moonSize * 0.5; gx <= moonSize * 0.5; gx += moonGrid) {
    for (let gy = -moonSize * 0.5; gy <= moonSize * 0.5; gy += moonGrid) {
      let inMain = gx * gx + gy * gy < sq(moonSize * 0.5);
      let coverX = gx - moonSize * phase;
      let inCover = coverX * coverX + sq(gy + moonSize * 0.02) < sq(moonSize * 0.48);

      if (inMain && !inCover) {
        let edge = dist(gx, gy, 0, 0) / (moonSize * 0.5);
        let local = noise(gx * 0.02, gy * 0.02, frameCount * 0.01);
        let a = moonAlpha * map(edge, 0, 1, 1.0, 0.56) * map(local, 0, 1, 0.72, 1.12);
        fill(95, 125, 185, a);
        rect(moonX + gx, moonY + gy, moonGrid * 1.08, moonGrid * 1.08, 1);
      }
    }
  }
  pop();
}

function rebuildCitySystem() {
  cityBuildings = [];
  cityLights = [];

  let baseY = height * 0.92;
  let x = -30;
  let palette = [
    [45, 145, 255],    // brighter electric blue
    [80, 205, 255],    // cyan
    [255, 246, 185],   // warm white
    [255, 176, 75],    // brighter orange
    [255, 92, 82],     // neon red
    [210, 115, 255],   // violet
    [255, 120, 205],   // pink
    [165, 235, 115],   // green
    [245, 250, 255]    // white
  ];

  while (x < width + 80) {
    let buildingW = random(42, 110);
    let buildingH = random(height * 0.22, height * 0.68);
    let building = {
      x: x,
      y: baseY - buildingH,
      w: buildingW,
      h: buildingH,
      alpha: random(135, 205)
    };
    cityBuildings.push(building);

    // Dot-matrix windows. This creates the pixelated/mosaic city feeling.
    let step = random(11, 15);
    let dotSize = step * random(0.48, 0.68);
    for (let gx = building.x + step * 0.8; gx < building.x + building.w - step * 0.4; gx += step) {
      for (let gy = building.y + step; gy < building.y + building.h - step * 0.3; gy += step) {
        let verticalBias = map(gy, building.y, building.y + building.h, 0.72, 0.32);
        if (random() < verticalBias) {
          cityLights.push({
            x: gx + random(-1.2, 1.2),
            y: gy + random(-1.2, 1.2),
            size: dotSize * random(0.8, 1.35),
            colour: random(palette),
            phase: random(TWO_PI),
            speed: random(0.012, 0.042),
            baseAlpha: random(70, 240)
          });
        }
      }
    }

    x += buildingW * random(0.62, 0.95);
  }
}

function drawMosaicCity() {
  push();
  noStroke();

  // Distant building silhouettes.
  for (let building of cityBuildings) {
    fill(6, 12, 28, building.alpha);
    rect(building.x, building.y, building.w, building.h, 2);
  }

  // Coloured lights flicker independently, like a distant digital city.
  for (let light of cityLights) {
    let flicker = map(sin(frameCount * light.speed + light.phase), -1, 1, 0.18, 1.0);
    let weatherFade = map(rainState.rainDensity, 0.35, 2.25, 1.08, 0.78);
    let alpha = light.baseAlpha * flicker * weatherFade;
    fill(light.colour[0], light.colour[1], light.colour[2], alpha);
    circle(light.x, light.y, light.size);
  }

  // A darker ground band anchors the city behind the interactive umbrella.
  fill(2, 4, 10, 125);
  rect(0, height * 0.88, width, height * 0.12);
  pop();
}

function drawThunderPixelFlash() {
  // A brief blocky flash helps the procedural thunder feel visible as well as audible.
  let flash = rainState.thunderLevel;
  if (flash < 0.42) return;

  push();
  noStroke();
  let grid = 18;
  let alpha = map(flash, 0.42, 1, 0, 34);
  for (let x = 0; x < width; x += grid) {
    let local = noise(x * 0.02, frameCount * 0.09);
    if (local > 0.62) {
      fill(210, 225, 255, alpha * local);
      rect(x, 0, grid, height);
    }
  }
  pop();
}


function drawInterfaceText() {
  push();
  noStroke();
  fill(230, 238, 255, 210);
  textSize(13);
  textAlign(LEFT, TOP);

  let soundStatus = audioMechanic.started ? "sound on / press button to pause" : "click Play / Pause Sound to start audio";
  let lines = [
    "Digital Rain Room",
    "Weather: " + rainState.weatherStage,
    "Thunder level: " + nf(rainState.thunderLevel, 1, 2),
    "Wind level: " + nf(rainState.windLevel, 1, 2),
    "Blocked drops: " + rainState.blockedDrops,
    soundStatus
  ];

  let boxW = 285;
  let boxH = 118;
  fill(2, 5, 12, 140);
  rect(16, height - boxH - 18, boxW, boxH, 14);

  fill(230, 238, 255, 220);
  for (let i = 0; i < lines.length; i++) {
    text(lines[i], 30, height - boxH + 2 + i * 17);
  }
  pop();
}

function rebuildRainSystem() {
  raindrops = [];
  // Keep enough drops for the heaviest storm. activeDropCount controls how many are drawn.
  let count = floor(max(420, min(760, (windowWidth * windowHeight) / 1800)));
  maxDrops = count;
  for (let i = 0; i < maxDrops; i++) {
    raindrops.push(new RainDrop());
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  rebuildRainSystem();
  rebuildCitySystem();

  if (audioMechanic && audioMechanic.button) {
    audioMechanic.button.position(18, 18);
  }
}
