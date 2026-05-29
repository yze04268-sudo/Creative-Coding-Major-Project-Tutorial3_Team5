/*
  Digital Rain Room
  Shared state file.

  This object lets the four separate mechanics communicate without putting all logic
  into sketch.js. The values are updated by audio, time, Perlin/randomness, and user input.
*/

const rainState = {
  // Audio mechanic outputs
  thunderLevel: 0,
  windLevel: 0,
  windPan: 0,

  // Time-based mechanic outputs
  weatherStage: "light rain",
  stageProgress: 0,
  lightningAlpha: 0,
  timeRainBoost: 1,

  // Perlin mechanic outputs
  perlinWind: 0,
  fogShift: 0,
  fogDensity: 0.8,

  // User input mechanic outputs
  umbrellaX: 0,
  umbrellaY: 0,
  umbrellaWidth: 180,
  umbrellaHeight: 55,
  blockedDrops: 0,

  // Combined values used by the rain system
  rainAngle: 0,
  rainDensity: 1,
  rainSpeed: 1
};
