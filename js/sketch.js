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
  drawMosaicCity();
  drawMoon();

  // Update each mechanic independently.
  audioMechanic.update();
  timeMechanic.update();
  perlinMechanic.update();
  inputMechanic.update();

  // Combine mechanic outputs into rain behaviour.
  combineMechanics();

  // Particle fog should appear behind rainfall but above the city.
  perlinMechanic.displayFog();

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

  // Subtle vertical weather shafts. These keep the code visually connected to rainfall,
  // but avoid the dense horizontal stripe texture from the earlier version.
  push();
  for (let i = 0; i < 34; i++) {
    let x = map(i, 0, 33, 0, width);
    let n = noise(i * 0.13, frameCount * 0.003);
    let alpha = map(n, 0, 1, 6, 22);
    let blue = map(n, 0, 1, 45, 85);
    stroke(35, 58, blue, alpha);
    strokeWeight(map(n, 0, 1, 1, 3));
    line(x, 0, x + rainState.rainAngle * 80, height);
  }
  pop();
}

function drawMoon() {
  // The old central ellipse now works as a moon/light source.
  // Its form slowly moves between a near-full circle and a crescent.
  push();
  noStroke();

  let moonX = width * 0.58;
  let moonY = height * 0.31;
  let moonSize = min(width, height) * 0.34;

  // Brightness breathes slowly and also reacts slightly to lightning.
  let breathing = map(sin(frameCount * 0.018), -1, 1, 0.55, 1.0);
  let stormFlash = map(rainState.lightningAlpha, 0, 255, 0, 0.45);
  let moonAlpha = 22 + breathing * 42 + stormFlash * 38;

  // Phase controls the offset of the dark overlay.
  // Low value = rounder moon, high value = stronger crescent.
  let phase = map(sin(frameCount * 0.006), -1, 1, 0.04, 0.68);

  // Soft outer glow, keeping the previous blue colour direction.
  fill(95, 125, 185, moonAlpha * 0.28);
  ellipse(moonX, moonY, moonSize * 1.9, moonSize * 1.18);

  fill(95, 125, 185, moonAlpha);
  ellipse(moonX, moonY, moonSize, moonSize);

  // Dark overlay creates the crescent without changing the moon colour palette.
  fill(4, 8, 18, 180);
  ellipse(moonX + moonSize * phase, moonY - moonSize * 0.02, moonSize * 0.96, moonSize * 1.02);

  // A second faint glow keeps the moon atmospheric rather than graphic-flat.
  fill(95, 125, 185, moonAlpha * 0.14);
  ellipse(moonX, moonY, moonSize * 1.25, moonSize * 1.25);
  pop();
}

function rebuildCitySystem() {
  cityBuildings = [];
  cityLights = [];

  let baseY = height * 0.92;
  let x = -30;
  let palette = [
    [38, 115, 220],   // electric blue
    [120, 160, 220],  // cold blue
    [255, 238, 180],  // warm white
    [255, 150, 70],   // orange
    [210, 72, 58],    // red
    [180, 105, 190],  // muted violet
    [235, 245, 255]   // white
  ];

  while (x < width + 80) {
    let buildingW = random(42, 110);
    let buildingH = random(height * 0.22, height * 0.68);
    let building = {
      x: x,
      y: baseY - buildingH,
      w: buildingW,
      h: buildingH,
      alpha: random(115, 175)
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
            baseAlpha: random(35, 170)
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
    fill(3, 6, 14, building.alpha);
    rect(building.x, building.y, building.w, building.h, 2);
  }

  // Coloured lights flicker independently, like a distant digital city.
  for (let light of cityLights) {
    let flicker = map(sin(frameCount * light.speed + light.phase), -1, 1, 0.18, 1.0);
    let weatherFade = map(rainState.rainDensity, 0.35, 2.25, 1.0, 0.58);
    let alpha = light.baseAlpha * flicker * weatherFade;
    fill(light.colour[0], light.colour[1], light.colour[2], alpha);
    circle(light.x, light.y, light.size);
  }

  // A darker ground band anchors the city behind the interactive umbrella.
  fill(2, 4, 10, 160);
  rect(0, height * 0.88, width, height * 0.12);
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
