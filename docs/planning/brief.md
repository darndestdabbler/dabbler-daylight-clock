# Brief — Daylight Clock

Recorded from the person who started session 001 (2026-11-14), in their
words where possible.

## Purpose

Generalize the clock already built in `D:\quadi-dozenal-clock-v3.html` so
that users can choose how the day is broken down. The clock defaults to
**24 hours × 60 minutes × 60 seconds** and has a built-in option for
**48 × 48 × 48**, as the existing clock does now. The person calls the
48 × 48 × 48 system **"the 48 clock"**.

A second purpose: users should be prompted to **ponder why we don't use a
48 × 48 × 48 clock**.

## Users

People who would want to use the daylight clock **on a phone**, and perhaps
later **on an Android (Wear OS) watch**.

## Must do

- **Two presets for dividing the day**, chosen by the user:
  24 × 60 × 60 (the default) and 48 × 48 × 48 (the 48 clock). Only these
  two; no user-defined divisions.
- **A clock face of its own for 24 × 60 × 60.** It keeps 0, 1, 2, 3 as the
  main divisions' digits (the quarter days) and uses **2 and 4** as the
  minor divisions' digits, where the 48 clock uses 4 and 8.
- **A base-10, military-time (24-hour) digital readout** in 24 × 60 × 60
  mode. The 48 clock keeps its dozenal readout.
- **No Z on the hands.** The Z drawn on the zan (middle) hand is removed
  in both systems.
- **Show the other system's reading** beneath the digital display (the
  48 clock's reading while in 24 × 60 × 60 mode, and the 24 × 60 × 60
  reading while in the 48 clock).
- **An About page** the user can pull up that explains the 48 clock, and
  explains what is displayed with the daylight hours (the gold wedge) and
  the green sections (the longest day), along with the shortest-day
  markers.
- **Installable web app**: usable from a phone's home screen and offline.
- Everything the existing clock already does continues to work: the daylight
  (sunrise/sunset) wedges, timezone choice, the solstice/equinox date
  override, and light/dark themes.

## Out of scope

- User-defined (custom) divisions of the day.
- A native Wear OS watch face, for now: deferred to a later plan.
- Any server, API or database. The clock runs entirely in the browser.

## Success

- A phone user can install the clock, open it offline, and switch between
  24 × 60 × 60 and the 48 clock, each with its own face, hands without a Z,
  and correct digital readout.
- Either way, the other system's reading is visible beneath the digital
  display, so the user is invited to compare the two.
- The About page lets a user understand the 48 clock and what the gold,
  green and shortest-day markings on the face mean.

## Existing material

- `D:\quadi-dozenal-clock-v3.html` — the current single-page clock (SVG
  face, three hands: dour, zan, mec; dozenal digital readout; 12-hour
  regular time beneath it; solar wedges; timezone, date-override and theme
  controls). It is the starting point to import; no other plan or notes
  exist.
