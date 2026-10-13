# Jekyll Island tides & daylight

A shoreline you can drag through. The water sits at the predicted tide height, the sky follows the real sun, and a deck below holds the day's curve, events, and beach windows. Drag the scene or the chart to move through the day. Space plays the day. Arrow keys step 6 minutes (Shift for an hour). `[` and `]` change day. `n` jumps to the next event.

`index.html` is the complete app with CSS, JavaScript, and font embedded. Edit `src/index.html`, then run `node build.mjs` to embed `src/archivo.woff2` and write `index.html`. Open it directly or serve it from any static host. There is no API key.

The URL keeps the date, window start and length, station, and height units. The app opens on the current date by default.

## Data

- NOAA station 8677832, Jekyll Island Marina, in Jekyll Creek. NOAA supplies official high/low predictions. The curve between them uses half-cosine interpolation and is labeled estimated.
- NOAA station 8677344, St. Simons Island, a nearby reference station with six-minute predictions and separate high/low events.
- Sunrise-Sunset.org v2: sunrise, sunset, and civil twilight at 31.07 N, 81.41 W.

All instants are UTC timestamps displayed in America/New_York. Day boundaries are computed in that zone, so daylight-saving days have 23 or 25 hours. Tide heights are relative to MLLW, not beach depth.

Moon phase is calculated from the lunar cycle. The moon's sky position, the beach slope, and the wave and speck motion are illustrative. NOAA supplies no current speeds here.

Loaded results stay in memory and in local storage where the browser allows it. Refresh tries a new request and keeps loaded data as a labeled fallback.

## Publish

`bun publish.mjs` publishes through a service configured in `~/.config/publish/config.toml`, with `publishing_url` and `publishing_token` fields. Credentials stay outside the repository. The script creates a local, Git-ignored `publication.json` with the document ID and URL, and uses it to update the same page on later runs.

Verification notes are in `qa/verification.txt`.
