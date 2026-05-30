# Digital Rain Room

## Project overview

**Digital Rain Room** is an original interactive visual artwork made with p5.js.  
The project is inspired by the immersive atmosphere of *Rain Room*, but instead of physically stopping rain from touching the viewer, it turns the idea into a digital ASMR-style weather environment.

The scene runs as a looping rain simulation with changing rain density, thunder, wind, fog, lightning, and mouse-controlled rain blocking.

## Interaction instructions

1. Open `index.html` in a local server or p5-compatible environment.
2. Click **Play / Pause Sound** to start the procedural wind and thunder sound.
3. Move the mouse across the canvas to control the umbrella / bowl-shaped prop.
4. Use the prop to block falling raindrops and create splash feedback.
5. Watch how the weather changes over the 60-second loop.

> Sound in browsers usually cannot autoplay. The button is required to start the p5.sound audio context.

## Mechanic ownership

| Team member | Mechanic | File | Description |
|---|---|---|---|
| Zhendong Song | Audio | `js/audio-mechanic.js` | Uses p5.sound, amplitude, FFT, procedural wind, thunder pulse, volume and pan logic to affect rain density and direction. |
| Yue Zhao | Time-based | `js/time-mechanic.js` | Creates a 60-second weather loop: light rain, storm building, heavy storm, and calming down. Also controls lightning events. |
| Yue Zhao | User input | `js/input-mechanic.js` | Uses mouse position and easing to control an umbrella / bowl-shaped prop that blocks raindrops. |
| CHUCHU TANG | Perlin noise and randomness | `js/perlin-mechanic.js`, `js/rain-particle.js` | Uses `random()` for varied raindrop depth, speed, weight and length, and `noise()` for smooth wind/fog movement. |

> Note: If the tutor requires each person to officially own only one mechanic, keep Yue Zhao as the owner of **Time-based** or **User input**, then list the other file as team integration support.

## p5.js techniques used

- `createCanvas(windowWidth, windowHeight)` and `windowResized()` for responsive scaling.
- Arrays and classes for managing large numbers of raindrops.
- `random()` for raindrop variation and parallax depth.
- `noise()` for smooth organic wind and fog movement.
- `millis()` and stage progress for time-based scene changes.
- `frame`-style continuous animation inside `draw()`.
- `lerp()` for easing transitions, including mouse-following and weather changes.
- `p5.sound` with `p5.Noise`, `p5.Oscillator`, `p5.Amplitude`, and `p5.FFT`.
- Simple collision detection between raindrops and the umbrella prop.
- `push()` and `pop()` to isolate drawing styles and transformations.

## File structure

```text
digital-rain-room-p5/
├── index.html
├── README.md
└── js/
    ├── global-state.js
    ├── rain-particle.js
    ├── perlin-mechanic.js
    ├── time-mechanic.js
    ├── audio-mechanic.js
    ├── input-mechanic.js
    └── sketch.js
```

## AI acknowledgement

ChatGPT was used to help generate and organise the final project code structure. It was used for:

- turning the team concept into a modular p5.js project;
- separating each mechanic into its own script file;
- writing comments explaining how the generated code works;
- combining audio, time, Perlin/randomness and mouse input into one interactive rain simulation.

AI-generated sections are also acknowledged in the relevant code comments.

## External references

The project was influenced by:

- p5.js reference: https://p5js.org/reference/
- p5.sound reference: https://p5js.org/reference/#/libraries/p5.sound
- p5.js `noise()` reference: https://p5js.org/reference/#/p5/noise
- p5.js `random()` reference: https://p5js.org/reference/#/p5/random
- p5.js `lerp()` reference: https://p5js.org/reference/#/p5/lerp
- The Coding Train, *Purple Rain* coding challenge: https://thecodingtrain.com/challenges/4-purple-rain
- The Coding Train, Perlin noise / flow field examples: https://thecodingtrain.com/tracks/the-nature-of-code-2/noc/perlin-noise
- Random International, *Rain Room*, as conceptual atmosphere inspiration.