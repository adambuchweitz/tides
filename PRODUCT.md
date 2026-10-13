# Jekyll tides & daylight

<!-- impeccable:product-schema 1 -->

## Platform
web

## Stack
Static, independent, self-contained HTML/CSS/JavaScript. Can be served from any static host.

## Users
Visitors to Jekyll Island, Georgia, planning beach activities around tides and daylight.

## Product Purpose
Interactively compare real tide predictions with sunrise and sunset for selected dates, on a shared timeline, to plan vacation activities.

## Operating Context
Vacation planning on desktop or phone. All displayed times belong to America/New_York regardless of the viewer's timezone.

## Capabilities and Constraints
Date navigation, an interactive tide and daylight chart, and schedules fetched from public sources without credentials or a backend. Show the selected station and distinguish interpolated heights from official predictions. The app opens on the current date with a seven-day view; dates and window length can be changed through the URL.

## Evidence on Hand
NOAA CO-OPS data and metadata APIs; stations 8677832 (Jekyll Island Marina) and 8677344 (St. Simons Island). Sunrise-Sunset.org v2 supplies solar events for Jekyll coordinates.

## Product Principles
Keep tide and daylight aligned in time. Make dates, units, source location, and prediction limitations clear. Remain useful on a phone. Never substitute invented schedules for unavailable data.
