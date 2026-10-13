# Tides & daylight

<!-- impeccable:product-schema 1 -->

## Platform
web

## Stack
Static, independent, self-contained HTML/CSS/JavaScript. Can be served from any static host.

## Users
Visitors to coastal locations served by NOAA tide predictions, planning beach activities around tides and daylight.

## Product Purpose
Interactively compare real tide predictions with sunrise and sunset for selected dates, on a shared timeline, to plan vacation activities.

## Operating Context
Beach planning on desktop or phone. All displayed times belong to the selected location's timezone regardless of the viewer's timezone.

## Capabilities and Constraints
Date navigation, an interactive tide and daylight chart, and schedules fetched from public sources without credentials or a backend. Show the selected station and distinguish interpolated heights from official predictions. The app opens on the current local date with a seven-day view. A searchable location sheet accepts NOAA tide stations and optional sunlight coordinates, timezone, and display name. URLs preserve the location, overrides, date window, and units. A station-only URL resolves its name, coordinates, prediction type, and local timezone. New locations are loaded before replacing the current view; failed and cancelled changes preserve it.

## Evidence on Hand
NOAA CO-OPS data and metadata APIs supply station records, prediction types, station search, and tide schedules. Stations 8677832 (Jekyll Island Marina) and 8677344 (St. Simons Island) are seeded defaults. Sunrise-Sunset.org v2 supplies solar events and timezone information at the station or custom coordinates.

## Product Principles
Keep tide and daylight aligned in time. Make dates, units, source location, and prediction limitations clear. Remain useful on a phone. Never substitute invented schedules for unavailable data.
