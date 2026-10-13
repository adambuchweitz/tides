---
name: Jekyll Island · Tides & daylight
description: A shoreline you can drag through. The water is the predicted tide, the sky is the real sun, and a lamp-room deck holds the day's timeline.
colors:
  ink: "#04101e"
  foam: "#f1fbfa"
  text: "#e9f6f7"
  muted: "#9bbdc7"
  glass: "#62e3d3"
  lamp: "#ffb935"
  sand: "#ecd29e"
  problem: "#ff9a7a"
  panel-day: "#0d3056"
  panel-night: "#050b18"
typography:
  display:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(70px, 12.5vw, 148px)"
    fontWeight: 830
    fontStretch: "68%"
  label:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "11-12px"
    fontWeight: 700
    fontStretch: "112%"
    letterSpacing: "0.08em"
  body:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "15.5px"
    fontWeight: 400
---

# Design system

## Idea

The page is a cross-section of the shore at the moment you are looking at. Dragging sideways moves time. The water surface sits at the predicted tide height, the sun and sky follow the real sunrise, sunset and civil twilight, and the deck below holds the day's curve as a second handle on the same time.

The reference world is a lighthouse lamp room: dark navy, brass-amber lamp light, sea glass.

## Color

- **Sea glass** (`#62e3d3`) is tide. Highs, lows, the curve, the gauge.
- **Lamp** (`#ffb935`) is the sun. Sunrise, sunset, the play button.
- **Sand** (`#ecd29e`) is beach time.
- **Foam** (`#f1fbfa`) is the active state: selected day, current event, active segment, playhead.
- The deck color is the sky's top color mixed toward `#020a16`, so the page shifts from deep blue at noon to near black at night. White text on the sky holds at every phase because the top of the sky never goes pale.
- The scene palette interpolates between five stops (night, blue hour, horizon, golden, day), with separate dawn and dusk variants.

## Type

Archivo, one variable font with width and weight axes, embedded in the file.

- Numbers are squeezed (`wdth` 68-90) and heavy. The clock uses rolling digit reels.
- Labels are stretched wide (`wdth` 108-115) and capitalized.
- The gauge number widens as the water rises (`wdth` 62 to 117).

## Motion

- Water level, flow, and wet sand follow the data with exponential smoothing.
- Waves and drifting specks move toward the beach while the tide rises and away while it falls. Speed follows the rate of change, so slack water is calm.
- Dragging snaps to events with a 10px magnet and a haptic tick where supported.
- First load sweeps the day from midnight to now.
- Everything honors `prefers-reduced-motion`: no loops, no tweens.

## Components

- **Stage.** Full-bleed canvas. Tide pole, gauge tag riding the waterline, flags planted where the next high and low reach the sand.
- **Deck.** Rounded sheet. Day chips with a sliding indicator, the tide and daylight chart as a slider, an event strip with a play button.
- **Segments and icon buttons.** Pills on a dark scrim. Active state is foam with ink text.
- **Sheet.** Beach windows, moon and range, how to read the scene, sources.

## Honesty rules

- The Marina curve is dashed and the gauge shows `est.` because NOAA publishes only highs and lows there.
- The beach slope is drawn, not surveyed. The moon's place in the sky is illustrative. Moon phase is calculated.
- No schedule is invented when a source fails. The scene shows a message and a retry button.
