# Tides & daylight

An interactive shoreline planner for NOAA tide stations. It puts tide predictions and sunrise/sunset times on one shared timeline, so you can see when the water is low and when it is light. It starts at Jekyll Island Marina, Georgia; choose another station from the location button or a URL.

The scene shows the water at the predicted tide height and the sky following the real sun. Below it, a chart shows the day's tide curve, daylight, and beach windows, along with a list of events for the day.

## Getting started

The app is a single HTML file, `index.html`, with CSS, JavaScript, and the font embedded. Open it directly in a browser, or serve the folder with any static server:

```sh
python3 -m http.server 8000
```

Then visit <http://localhost:8000>. The app fetches live data, so it needs an internet connection. There is no API key and no build step needed to use it.

## Rebuilding

Edit `src/index.html`, then regenerate the single-file app:

```sh
node build.mjs
```

`build.mjs` embeds `src/archivo.woff2`, the helpers in `src/locations.js`, the location controls in `src/location-ui.js`, and chart label placement in `src/label-layout.js`, then writes `index.html`. Edit those source files and `src/index.html`, then rebuild. The project has no npm dependencies and no `package.json`.

## Using the planner

- **Scene:** drag sideways to move through the day.
- **Chart:** click or drag to set the time.
- **Days:** the previous and next arrows move the whole window by its length. Day chips select one day within it. The window is seven days by default.
- **Events:** tap an event to jump to its time. The beach window list does the same.
- **Location:** search NOAA tide stations by name, state, or station ID. The picker shows whether a station provides a full curve or only highs and lows. A failed or cancelled switch keeps the current view and URL.
- **Nearby beach:** expand “Sunlight at a nearby beach” to set a display name, a latitude/longitude pair, or a timezone. Tides still come from the selected station. “Use station location” clears these overrides; choosing another station clears them too.
- **Units:** switch between feet (ft) and meters (m).
- **Refresh schedules:** request the data again.
- **Copy link to this view:** copies a URL that includes the date window, station, units, and any custom location settings.
- **Download this HTML:** saves the page as a file.

### Keyboard

| Key | Action |
| --- | --- |
| `Space` | Play or pause the day |
| `←` / `→` | Step back or forward 6 minutes |
| `Shift` + `←` / `→` | Step back or forward 1 hour |
| `Home` / `End` | Jump to the start or end of the day (with the chart focused) |
| `[` or `PageUp` | Previous day |
| `]` or `PageDown` | Next day |
| `n` | Jump to the next event |

Space and the arrow keys do nothing while a button, link, or select has focus, so they do not conflict with keyboard navigation of the controls. Arrow keys still work when the chart has focus.

In station search, use the arrow keys to move through results and Enter to select. Escape clears the search, then closes the sheet. Closing it cancels a pending location change.

## URL parameters

The app keeps the date window, station, and units in the URL, so a link opens the same view.

| Parameter | Values | Default |
| --- | --- | --- |
| `date` | `YYYY-MM-DD` | Current date in the location's timezone |
| `start` | `YYYY-MM-DD` | The date shown |
| `days` | `1` to `14` | `7` |
| `station` | A supported seven-digit NOAA tide station ID | `8677832` (Jekyll Island Marina) |
| `unit` | `ft` or `m` | `ft` |
| `lat`, `lng` | Latitude −90 to 90, longitude −180 to 180; supply both | Tide station coordinates |
| `tz` | A timezone name, such as `America/Los_Angeles` | Detected from the sunlight coordinates |
| `label` | Display name, up to 60 characters | Tide station name |

San Francisco: `index.html?station=9414290&days=3&unit=m`

Sunlight at a nearby beach, with tides from San Francisco: `index.html?station=9414290&lat=37.77&lng=-122.51&label=Ocean%20Beach`

A station alone is enough: metadata supplies its name, coordinates, and prediction type, and the sunlight service resolves the local timezone. Invalid sunlight overrides are discarded with a notice. An invalid or unavailable station shows an error and a location picker; it never silently switches to Jekyll.

## Data sources

- **Jekyll Island Marina, NOAA station 8677832** (in Jekyll Creek). Official high and low predictions come from NOAA. The curve between them is an estimate using half-cosine interpolation, and the app labels it that way.
- **St. Simons Island, NOAA station 8677344.** A nearby reference station with six-minute predictions. Its curve is interpolated linearly from those samples.
- **Sunrise-Sunset.org (v2)** supplies sunrise, sunset, civil twilight, and the local timezone for the selected sunlight coordinates.
- **NOAA's metadata API** supplies station details and a searchable tide-prediction catalog. Harmonic stations provide six-minute curves; subordinate stations provide only high and low predictions.

Everything is displayed in the selected location's timezone, including on days with daylight saving time changes. The timezone appears beside the clock. Day boundaries account for short, long, and midnight-transition days.

Results are cached in memory and in local storage, when the browser allows it. A cached copy up to six hours old is reused. Refresh requests the data again. If the request fails, the app keeps the last saved copy and labels it. If there is no saved copy, it shows a retry message instead of a made-up schedule.

Sunlight caches include coordinates and timezone, so changing locations cannot reuse another place's schedule. The station catalog and recent stations are also kept locally. Days with no sunrise or sunset are shown explicitly; missing events are not assigned invented times.

## Limitations

- Tide heights are relative to MLLW (mean lower low water). They are not the depth of the water on the beach.
- The Marina curve between high and low tides is estimated, not measured. The real shape can differ.
- The St. Simons curve is a reference station, not a measurement at Jekyll Island.
- NOAA supplies no current speeds here. The wave and speck motion is a visual cue only.
- The moon's position in the sky and the beach slope are illustrative. The moon phase is calculated from the lunar cycle.
- Beach windows are two-hour spans centered on a predicted low tide, trimmed to daylight. They are a planning aid, not a safety assessment.
- Predictions do not include weather, wind, or surf conditions.

## Publishing

`bun publish.mjs` publishes `index.html` to a hosted page through a service configured in `~/.config/publish/config.toml`, using the `publishing_url` and `publishing_token` fields. Credentials stay outside the repository. The script writes a local `publication.json` (ignored by Git) with the document ID and URL, and reuses it to update the same page on later runs.

## Verification

Verification notes, including what was not checked, are in [`qa/verification.txt`](qa/verification.txt).

Run the location, date-handling and chart-layout tests with `node --test test/*.test.js`.
