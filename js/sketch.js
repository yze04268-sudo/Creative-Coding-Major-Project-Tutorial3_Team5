/*
  Main sketch file
  This file brings all separate mechanics together.

  Digital Rain Room:
  - Audio controls thunder intensity and wind direction.
  - Time controls the 60-second weather loop and lightning.
  - Perlin noise/randomness create organic rain and fog.
  - Mouse input controls a rain-blocking umbrella/bowl prop.
*/

let audioMechanic;
let timeMechanic;
let perlinMechanic;
let inputMechanic;

let raindrops = [];
let maxDrops = 520;

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
}

function draw() {
  drawAtmosphericBackground();

  // Update each mechanic independently.
  audioMechanic.update();
  timeMechanic.update();
  perlinMechanic.update();
  inputMechanic.update();

  // Combine mechanic outputs into rain behaviour.
  combineMechanics();

  // Background fog should appear behind rainfall.
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
  // Vertical gradient-style background, drawn manually for compatibility.
  for (let y = 0; y < height; y += 4) {
    let t = y / height;
    let r = lerp(4, 14, t);
    let g = lerp(7, 20, t);
    let b = lerp(16, 34, t);
    stroke(r, g, b);
    line(0, y, width, y);
  }

  // Subtle distant glow.
  noStroke();
  fill(95, 125, 185, 18);
  ellipse(width * 0.55, height * 0.35, width * 0.85, height * 0.55);
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
  fill(2, 5, 12, 125);
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

  if (audioMechanic && audioMechanic.button) {
    audioMechanic.button.position(18, 18);
  }
}
