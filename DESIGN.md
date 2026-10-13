---
name: Tides & daylight
description: A shoreline you can drag through. The water is the predicted tide, the sky is the real sun, and a lamp-room deck holds the day's timeline. Any NOAA tide station can be the shore.
colors:
  ink: "#04101e"
  foam: "#f1fbfa"
  text: "#e9f6f7"
  muted: "#9bbdc7"
  glass: "#62e3d3"
  lamp: "#ffb935"
  sand: "#ecd29e"
  problem: "#ff9a7a"
  panel: "#0b2a4a"
  panel-2: "#12375c"
  panel-day: "#0d3056"
  panel-night: "#050b18"
  scrim: "rgba(3, 12, 26, 0.7)"
  backdrop: "rgba(2, 8, 24, 0.55)"
  line: "rgba(180, 230, 238, 0.17)"
typography:
  display:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(70px, 12.5vw, 148px)"
    fontWeight: 830
    fontStretch: "68%"
    lineHeight: 1
  headline:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "26px"
    fontWeight: 800
    fontStretch: "80%"
  title:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "16-22px"
    fontWeight: 700
    fontStretch: "90-112%"
    lineHeight: 1.2
  body:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "14-16px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "11-12px"
    fontWeight: 700
    fontStretch: "110-112%"
    letterSpacing: "0.07em"
rounded:
  chip: "6px"
  field: "12-14px"
  sheet: "20px"
  sheet-mobile: "24px 24px 0 0"
  pill: "999px"
  loc-button: "24px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "20px"
  mobile-gutter: "16px"
components:
  loc-button:
    backgroundColor: "{colors.scrim}"
    textColor: "#ffffff"
    rounded: "{rounded.loc-button}"
    padding: "0 12px 0 10px"
    height: "48px"
  loc-sheet:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.text}"
    rounded: "{rounded.sheet}"
    width: "480px"
  station-search:
    backgroundColor: "rgba(255, 255, 255, 0.07)"
    rounded: "{rounded.field}"
    height: "52px"
  station-row:
    textColor: "{colors.text}"
    rounded: "12px"
    height: "64px"
  station-kind:
    textColor: "{colors.glass}"
    rounded: "{rounded.chip}"
    padding: "5px 7px"
  station-kind-estimated:
    textColor: "{colors.muted}"
    rounded: "{rounded.chip}"
    padding: "5px 7px"
  button-primary:
    backgroundColor: "{colors.foam}"
    textColor: "{colors.ink}"
    rounded: "12px"
    height: "48px"
    padding: "0 16px"
  button-secondary:
    backgroundColor: "rgba(255, 255, 255, 0.07)"
    textColor: "{colors.text}"
    rounded: "12px"
    height: "48px"
    padding: "0 16px"
---

# Design System: Tides & daylight

## Overview

**Creative North Star: "The Lamp Room"**

The page is a cross-section of the shore at the moment you are looking at. Dragging sideways moves time. The water surface sits at the predicted tide height, the sun and sky follow the real sunrise, sunset and civil twilight, and the deck below holds the day's curve as a second handle on the same time. The reference world is a lighthouse lamp room: dark navy, brass-amber lamp light, sea glass.

The shore is no longer fixed to one place. Any NOAA tide station can be the shore, and the sunlight can optionally be read from a nearby beach. Choosing a place is a small, rare task, so it lives in one header control and one sheet; the scene stays the hero and nothing else on screen gains controls. This is a local extension of the original visual system, not a change to it: palette, Archivo, and the scene are inherited unchanged.

The data is honest about where it comes from. The location sheet identifies the prediction type, sunlight coordinates and clock zone. The dateline keeps the zone visible beside the time.

**Key Characteristics:**
- Full-bleed live scene with dark-scrim controls floating over it; light never sits on a pale panel.
- One variable font, width and weight carrying hierarchy.
- Color is semantic (tide, sun, beach time, active), not decorative.
- Solid versus dashed distinguishes official six-minute tide predictions from interpolation between official highs and lows.
- Place changes are transactional: the old view stays until the new one has loaded.

## Colors

A restrained night palette: deep navy ground, one cool accent (sea glass), one warm accent (lamp), with foam reserved for the active state.

### Primary
- **Sea Glass** (`#62e3d3`): tide. Highs, lows, the curve, the gauge, and in the location sheet the "full curve" chip and NOAA links.
- **Lamp** (`#ffb935`): the sun. Sunrise, sunset, the play button; the global keyboard focus ring; the header's custom-sunlight dot; the "tide times may not match" distance note.

### Secondary
- **Sand** (`#ecd29e`): beach time.

### Neutral
- **Foam** (`#f1fbfa`): the active state. Selected day, current event, active segment, playhead, the primary sheet button.
- **Ink** (`#04101e`): text on foam.
- **Text** (`#e9f6f7`) and **Muted** (`#9bbdc7`): body and secondary text on the navy panels. Muted carries meta lines, helper text, labels, and the estimated-data chip.
- **Problem** (`#ff9a7a`): errors only: sheet banners, invalid fields. Always paired with words.
- **Panel** (`#0b2a4a`): the location sheet surface. **Panel Day / Night** (`#0d3056` / `#050b18`) bracket the deck, which is the sky's top color mixed toward `#020a16`, so the page shifts from deep blue at noon to near black at night.
- **Scrim** (`rgba(3,12,26,.7)`): the dark backing for every control that floats over the scene. **Backdrop** (`rgba(2,8,24,.55)`) dims the scene behind the open sheet. **Line** (`rgba(180,230,238,.17)`) is the one hairline.

### Named Rules
**The Scrim Rule.** Any control floating over the scene sits on the dark scrim, never on a translucent white or the bare sky. The backing preserves contrast as the sky changes. Hover lifts the scrim to `rgba(255,255,255,.16)`.

**The Meaning-Not-Decoration Rule.** Sea glass is tide, lamp is sun, sand is beach time, foam is active. A new accent is not introduced for a new feature; the feature borrows the color of what it is about.

**The Words-Carry-It Rule.** Color never carries meaning alone. States are also stated in text, shape, or line style (see the prediction chips).

The scene palette interpolates between five stops (night, blue hour, horizon, golden, day) with separate dawn and dusk variants. The clock and date use a text shadow; the zone tag has its own dark backing so it remains readable over bright sky.

## Typography

**Display, Body and Label Font:** Archivo (variable, width and weight axes, embedded in the file) with `system-ui, sans-serif` fallback.

**Character:** One family doing all the work. Numbers are squeezed and heavy; labels are stretched wide; names sit between.

### Hierarchy
- **Display** (830, `clamp(70px, 12.5vw, 148px)`, 1, `wdth` 68): the rolling clock. Digits are reels.
- **Gauge** (`wdth` 62 to 117): the gauge number widens as the water rises.
- **Headline** (800, 26px, `wdth` 80): the sheet's "Location" title.
- **Title** (700-780, 16-22px, `wdth` 90-112): the header location name (16px, 14px on phones, `wdth` 112), the sheet's current-location name (22px, `wdth` 90), station names in rows (16px/700).
- **Body** (400-650, 14-16px, 1.5): helper text, detail values (14.5px), inputs. Inputs are 16px so iOS never zooms.
- **Label** (700, 11-12px, `wdth` 110-112): field labels, detail-list captions (uppercase, 0.07em tracking), chips, header meta line (11.5px, `wdth` 108, muted). Labels are the system's smallest text; they appear only as secondary captions, never as the sole carrier of an action or a warning.

### Named Rules
**The Squeeze-and-Stretch Rule.** Numbers are narrow and heavy; labels and names are wide. Hierarchy comes from width and weight on the one face, not from adding a second family.

**The Reel Rule.** Time is shown as rolling digit reels, not swapped text.

## Layout

The scene fills the viewport; the deck is a bottom sheet beneath it (`100dvh` app grid, scene row `1fr`, deck row `auto`). The header bar floats over the scene: `[location button] [status pill] … [ft | m]`, with `--bar-h` 64px (56px at ≤560px) and page gutters of `clamp(12px, 3vw, 40px)`. The readout (dateline: date, zone tag, clock) hangs below the bar.

The location sheet is a native `<dialog>` opened with `showModal()`, so focus is trapped, Esc closes, and the page is inert. On desktop it is an anchored panel under the header at the left gutter (`top: 72px`, width `min(480px, 100vw − 24px)`, max height `100dvh − 88px`). At ≤560px it becomes a full-width sheet rising from `max(10px, safe-area-top)` to the bottom with top radius 24px, so a sliver of scene stays visible above it; its height follows `--vvh` (set from `visualViewport`) so results stay above the on-screen keyboard.

Inside the sheet: a fixed top (title, search, error banner), a body that scrolls internally (`overscroll-behavior: contain`), and a footer that stays pinned. Strong fades mark content above and below the scroll viewport; override actions remain above the fades so their contrast stays intact. Reopening starts at the current-location card; a user opening the nearby-beach disclosure scrolls its fields into view. Padding is 20px on desktop, 16px on phones, the footer respects `safe-area-inset-bottom`. Principal controls have at least 44px targets (rows 64px, fields 48-52px, buttons 48px). Spacing rhythm in the sheet is 8 / 12 / 14 / 18-20px.

The time zone is part of layout: a zone tag (`EDT`) sits in the dateline beside the daylight text on every width, so a visitor whose device is in another zone always sees which clock this is.

## Elevation & Depth

Tonal layering over the live sky, with shadows only where something truly floats. The deck and sheet are opaque navy that tracks the sky; controls over the scene are scrims, not shadows.

### Shadow Vocabulary
- **Sheet lift** (`box-shadow: 0 24px 64px rgba(2,8,24,.55)`): the location sheet only.
- **Footer edge** (`box-shadow: 0 -12px 18px rgba(2,8,24,.38)` on a `rgba(2,8,24,.16)` ground): marks the pinned sheet footer as separate from the scrolling body.
- **Toast** (`0 10px 30px rgba(0,0,0,.4)`).

### Named Rules
**The Flat-On-Scrim Rule.** Controls over the scene have no shadow; the scrim is their depth.

## Shapes

Soft and rounded, nothing sharp. Pills (999px) for segments, icon buttons and the toast; a 24px capsule for the location button; 20px for the sheet (24px top corners on phones); 12-14px for fields, rows and sheet buttons; 6px for the small prediction chips. Separation inside the sheet is one `Line` hairline, not boxes within boxes. Chevrons are drawn SVG strokes (`#i-down`), as are all icons: 1.75 stroke, round caps, 22px (16px for chevrons), never glyph characters.

## Components

### Location button (`#locBtn`)
The single entry point for choosing a place. A 48px capsule on the scrim holding the drawn lighthouse (30px), a two-line label, an optional dot, and a drawn chevron. Line one is the beach label if set, otherwise the NOAA station name, truncated with an ellipsis (max width `min(46vw, 440px)`). Line two is muted: `NOAA <id> · <zone name>`, `Tides: <station> · <zone>` when a beach label is set, or `NOAA <id> · Custom sunlight`. A 7px **lamp dot** appears only while custom sunlight is active. On phones it is 44px, one line (name only), icon 24px. The accessible name is `Location: {name}. Change location`; it declares `aria-haspopup="dialog"`. Hover lifts the scrim.

### Location sheet
Native `<dialog>` on `Panel`. The search field opens cleared and focused; closing restores focus to the location button. The `Location` headline sits beside a 44px close button. Footer holds a full-width `Copy link` pill.

- **Search field.** Label `Find a tide station`; a 52px field with leading drawn magnifier, trailing clear button (visible only with text), 14px radius, faint-white ground. Wired as a combobox (`aria-activedescendant`, listbox results). Keyboard focus is the standard 3px lamp ring on the whole field (`:focus-within`). Search begins at 2 characters or on a full station ID; arrows move the active row, Enter picks, Esc clears the query first and closes second.
- **Mode switch.** Empty query shows the current-location card, the nearby-beach disclosure, and Recent. A typed query hides all of that and shows results.
- **Current-location card.** Name (22px) with an optional `Tides: {station}` subtitle, then a definition list of wide-caps captions: tide station (with NOAA link in sea glass), predictions, sunlight at, time zone. If the device zone differs, a muted line says everything here uses the location's zone.
- **Station rows and recents.** 64px rows, name over muted tabular meta (`id · state`), a prediction chip at the right, a faint wash on hover or keyboard focus, the words `Current station` on the current row. Search results cap at 8 rows with a "keep typing" line. Recents hold up to four previously viewed stations, or a "Start with" pair when there is no history.
- **Prediction chips.** Two variants, readable without color: `FULL CURVE` is a solid 1px sea-glass outline with glass text (official six-minute predictions); `HIGHS & LOWS` is a **dashed** muted outline with muted text (NOAA publishes only highs and lows; the curve is estimated). Dashed echoes the dashed estimated curve in the chart.
- **Nearby-beach override** (native `<details>`, closed unless overrides are active). Summary shows `Sunlight at a nearby beach` with a muted right-hand state (`Station location` / `Custom`), a rotating drawn chevron. The form holds an optional beach name, a latitude/longitude pair (decimal keypad, both-or-neither), and an optional time zone with a datalist. Fields are 48px, 12px radius, with `aria-invalid` plus a 13px `Problem` message beneath; Apply focuses the first invalid field. `Use this spot` is the foam primary; `Use station location` is the faint secondary, enabled only when there is something to reset. A non-blocking lamp-colored note appears when the spot is more than 50 km from the station.
- **Banner.** A `role="alert"` tint of `Problem` with message text, and a `Try again` link when retry applies. Sheet-level failures live here; the header never carries long error text.

### Switching behavior
Transactional and cancellable. Picking a station shows `Loading…` on that row while the old scene stays untouched; picking another supersedes the first; closing the sheet cancels the pending switch. Only a fully loaded place is committed (state, URL, title, focus, announcement). On failure the sheet stays open with a banner (`Couldn't load {name}. Still showing {current name}.`) and the URL does not change. Picking a station clears any override. A first-load failure with nothing to preserve uses the veil card with `Choose a location` and `Try again`, never a silent fallback to another place.

### Segments and icon buttons
Pills on the scrim. Active state is foam with ink text. Icon buttons are 44px circles on the scrim.

### Stage
Full-bleed canvas. Tide pole, gauge tag riding the waterline, flags planted where the next high and low reach the sand. The gauge shows an `est.` badge whenever the active station is highs-and-lows-only, or whenever detailed predictions failed and the page fell back to highs and lows.

### Deck
Rounded sheet tracking the sky. Day chips with a sliding indicator, the tide and daylight chart as a slider, an event strip with a play button, and a note under the chart naming the station and prediction type. Chart labels avoid sun markers, tide markers and the hour axis; crowded labels can be omitted while the event strip retains their times and heights. Scene flags avoid the clock, dateline, gauge and next-event pill.

### Sheet (info)
Beach windows, moon and range, how to read the scene, sources (names the station and sunlight coordinates in use, and the zone every time uses).

## Motion

- Water level, flow, and wet sand follow time changes with exponential smoothing. A committed place change initializes the scene from the new data.
- Waves and drifting specks move toward the beach while the tide rises and away while it falls. Speed follows the rate of change, so slack water is calm.
- Dragging snaps to events with a 10px magnet and a haptic tick where supported. First load sweeps the day from midnight to now.
- The location sheet enters with a 0.22s fade and 12px rise on the shared ease (`cubic-bezier(.16,1,.3,1)`); chevrons rotate on the same ease.
- Everything honors `prefers-reduced-motion`: no loops, no tweens, no sheet animation.

## Do's and Don'ts

### Do:
- **Do** put any new floating control on the scrim, and give it the standard 3px lamp focus ring.
- **Do** mark estimated data with dashed lines plus words (`est.`, `HIGHS & LOWS`), and official six-minute predictions with solid lines.
- **Do** keep the location zone visible in the dateline and state it in the location sheet and sources.
- **Do** use 44px minimum targets for new principal controls and 16px inputs; keep the sheet footer pinned and scroll the body internally.
- **Do** keep the old view until a new place has fully loaded, and let cancel leave it untouched.
- **Do** draw icons as 1.75-stroke SVG and reuse the bundled `#i-down`, `#i-search` and `#i-x` icons.

### Don't:
- **Don't** add a second typeface or a new accent color for a new feature.
- **Don't** invent a schedule when a source fails; show a message and a retry.
- **Don't** fall back to Jekyll Island (or any other place) when the requested place cannot load.
- **Don't** show `est.` only for one named station: it follows the data (any highs-and-lows-only station, including fallback), not the place.
- **Don't** use glyph characters (▾, ✕, ✓) for chevrons, close, or check marks.
- **Don't** let color alone distinguish full from estimated predictions, or valid from invalid fields.
- **Don't** render user-supplied labels or station names as HTML; text only.

## Honesty rules

- The curve is dashed and the gauge shows `est.` whenever NOAA publishes only highs and lows for the active station (or detailed predictions could not be loaded).
- The beach slope is drawn, not surveyed. The moon's place in the sky is illustrative. Moon phase is calculated.
- Sunlight can be read from a spot other than the tide station; when it is, the header says `Custom sunlight` and the sheet says how far the spot is from the station.
- All times use the selected location's zone, not the viewer's.

## Inherited, not canonized

Small caption text (11-12px labels and the 11.5px header meta line) and the white-on-translucent muted meta text come from the incumbent system and are recorded as it is built. They are secondary captions on the dark scrim or panel; new work should not use them for anything the user must act on, and should prefer 14px or larger for new body copy rather than extending the small-caption pattern. No contrast or size value here was chosen to satisfy an automated checker.
