# Solution plan — Daylight Clock

Source: `docs/planning/brief.md` (session 001, 2026-11-14).

## Objective

Turn the existing single-page quadi-dozenal clock
(`D:\quadi-dozenal-clock-v3.html`) into the **Daylight Clock**: an
installable, offline web app for phones that shows the time of day on a
24-hour dial with the day's daylight drawn on it, in whichever of two
divisions of the day the user picks:

| System | Divisions | Hands | Digital readout | Face labels |
|---|---|---|---|---|
| **24 × 60 × 60** | hour / minute / second | hour (one turn a day), minute (one turn an hour), second (one turn a minute) | base 10, 24-hour `HH:MM:SS` | majors 0 6 12 18 at the quarter days; minors 3 9 15 21 between them; an hour tick in the hour hand's rose at each of the 24 hours, at the face's edge; 60 minute ticks, a major every 5, so the minute and second hands land on a tick |
| **48 × 48 × 48** ("the 48 clock") (default) | dour / zan / mec (30 min / 37.5 s / 0.78125 s) | dour (one turn a day), zan (one turn a dour), mec (one turn a zan) | dozenal `DD:ZZ:MM` with X and E, as today | majors 0 1 2 3 at the quarter days; minors 4 and 8, as today |

In both systems the dial is the whole day, so the quarter-day majors, the
sunrise/sunset wedges and the shortest-day markers sit in the same places;
only the ticks, the minor labels, the hands' motion and the readout change.
A major tick falls every 2 hours in both (every 4 dours in the 48 clock,
every 2 hours on the 24-hour face), on the labelled positions.

Done means:

- the user switches between the two systems from a control, and the choice
  is remembered on the device;
- no hand carries a Z, in either system;
- beneath the digital readout, the **other** system's reading is shown (the
  48 clock's reading in 24 × 60 × 60 mode, the 24-hour reading in the 48
  clock), replacing today's 12-hour line;
- an **About** page, reachable from the clock, explains the 48 clock, asks
  why we don't use it, and explains the gold daylight wedge (today), the
  green wedge (the longest day) and the blue shortest-day markers;
- everything the v3 page does keeps working: daylight wedges, timezone
  choice, solstice/equinox date override, light/dark/auto theme;
- the app installs to a phone's home screen and opens offline.

## Production split

**One part runs in production: a static web app, entirely in the
browser.** There is no API tier, no server code and no database: the person
chose this, because the clock reads only the device's clock, its timezone
and (optionally) its location, and computes everything else itself. Nothing
in the solution may call a server of its own; the only network access is the
browser's own geolocation and the static files' first download.

Service workers and installation need HTTPS (or `localhost`), so the app is
served from a static host; opening the files from disk still shows the
clock, without install or offline support.

## Handoff artifacts

| Part | Handed over as | Standard command |
|---|---|---|
| The web app | **A static site folder** — `web/` as it stands: `index.html`, `about.html`, `clock-core.js`, `manifest.webmanifest`, `sw.js`, `icons/` — copied as-is to any static host (GitHub Pages, Azure Static Web Apps, any web server). No build step. | A gzipped tarball of `web/` written into `{output}`: `tar -czf {output}/daylight-clock.tar.gz -C web .` — an invocation both GNU tar (Git Bash) and bsdtar (Windows, macOS) accept, unlike `tar -a` zip, which only bsdtar writes. The packaging session fixes the exact argv and rehearses it with `dabbler packaging --rehearse`. |

There is no database, so there is no migration script. The easiest form to
test is the folder itself, served on `localhost` by any static server.

## Modules

**One module: the web app (`web/`).** One deployable, one folder, no
project or build file — there is no .NET or Maven project to list. Inside
it, the code is cut into two files so the arithmetic can be tested without a
browser:

### `web/clock-core.js` — time systems and solar calculation (pure)

- **Responsible for:** the two time systems and everything computable
  without a page: the wall-clock seconds of day in a timezone, the
  reading of a time of day in a system, hand angles,
  readout strings, the face layout (ticks and labels) for a system, and the
  sunrise/sunset → dial-angle calculations moved over from v3
  (`getSunTimes`, `getTimezoneOffset`, `getSolarAngles`, `describeArc`,
  `spanDegrees`).
- **Contract:**
  - *In:* a system id (`"24x60x60"` or `"48x48x48"`), seconds since local
    midnight in `[0, 86400)`, and for the solar functions a date, a
    latitude/longitude and an IANA timezone.
  - *Out:* `secondsOfDay(date, tz)` gives the wall-clock seconds since
    midnight in `tz` at the instant `date`, in `[0, 86400)` (on a DST
    change day it follows the wall clock, as v3 does);
    `reading(sec, system)` gives three integers, each in
    `[0, division)`; `handAngles(sec, system)` gives three angles in
    `[0, 360)` (the first and second hands sweep, the third steps one unit
    at a time, as in v3); `formatReading` gives `HH:MM:SS` in base 10 for
    24 × 60 × 60 and two dozenal digits per unit (X = 10, E = 11) for the
    48 clock; `faceLayout(system)` gives the tick list (angle, major/minor),
    label list (angle, text, major/minor) and `hourTicks` list (angle; empty
    for the 48 clock). Same input, same output: no clock reads,
    no randomness.
  - *Failure:* an unknown system id or a time outside `[0, 86400)` throws a
    `RangeError`; a polar day or night (no sunrise/sunset) returns `null`,
    as v3 does, and the page draws no wedge.
  - It touches no `document`, `window` or `localStorage`, and loads both as
    a classic `<script>` (exposing `ClockCore`) and under Node's
    `require` — so it also works when the page is opened from disk, where
    ES modules don't load.
- **Tests:** `tests/clock-core.test.js`, run with Node's built-in runner
  (`node --test`): no dependencies to install.

### `web/index.html` (+ `about.html`, `manifest.webmanifest`, `sw.js`) — the page

- **Responsible for:** drawing the SVG face, hands and readouts from what
  `clock-core.js` returns; the controls (system, daylight, timezone, date
  override, theme); remembering the system and theme choice in
  `localStorage`; geolocation; the About page; installability and the
  offline cache.
- **Contract:** given `ClockCore` loaded first, it renders the selected
  system each animation frame. Storage, geolocation or the service worker
  being unavailable degrades, never breaks: the default system and theme
  are used, the timezone city's location stands in, and the app still runs
  online.

**Dependency direction:** the page depends on `clock-core.js`; the core
depends on nothing (no DOM, no libraries). The service worker caches the
page's files and depends on neither.

**Reason for the cut:** the arithmetic — divisions, dozenal digits, angles,
sunrise and sunset — is where a mistake would be silent, and the only part
worth testing mechanically; separating it from the DOM is the one cut that
pays for itself. Everything else is presentation and is checked by looking
at it.

## Deferred cuts

- **Native Wear OS watch face** — a separate project (Kotlin / Watch Face
  Format) with its own toolchain. Deferred to a later plan; when it comes,
  `clock-core.js`'s contract is the specification it reproduces.
- **User-defined divisions** (e.g. 10 × 100 × 100) — out of scope by the
  person's choice. The system id parameter leaves room for it, but no
  general face generator is built now.
- **Separate projects or packages per concern** (a core library, a UI
  package) — not warranted for one static page; revisit only if the watch
  face or another consumer needs the core as a package.
- **A build step, bundler or framework** — the page stays plain HTML, CSS
  and JavaScript.

## Phases

Each phase is a few focused sessions; Session 2 breaks them into numbered
sessions.

1. **Import and skeleton** (1–2 sessions)
   - Copy v3 into `web/index.html` unchanged in behaviour.
   - Move the pure functions into `web/clock-core.js`, with
     `tests/clock-core.test.js` covering today's 48-clock reading, hand
     angles, dozenal formatting and the solar functions.
   - Declare the Node test suite (`node --test`, with a time limit) in
     `dabbler.yaml`.
2. **Two time systems** (2–3 sessions)
   - `reading`, `handAngles`, `formatReading` and `faceLayout` for both
     systems, with their tests.
   - The 24 × 60 × 60 face (24 ticks, majors 0–3, minors 2 and 4), its
     base-10 24-hour readout, and the system selector (remembered; the
     48 clock is the default).
   - The Z removed from the zan hand; the line under the readout shows the
     other system's reading.
3. **About page** (1 session)
   - `web/about.html`, linked from the clock, in the clock's theme: what
     the 48 clock is (dour, zan, mec and their lengths; 48 = 2⁴ × 3 and its
     many even divisions), why we might — or might not — use it, and what
     the gold, green and blue markings on the face mean.
4. **Installable app** (1–2 sessions)
   - `manifest.webmanifest`, icons, and a service worker `sw.js` that
     caches the site for offline use; phone-width layout checked.
   - The packaging session (the `packaging:` block that zips `web/`), then
     the first release, version **1.0.0** proposed, for the person to
     approve with the session list.

## Rationale (session 002 challenge)

Session 002 challenged each cut before breaking the plan into sessions.

### Should each module exist?

- **`web/clock-core.js` — yes.** Everything that can be silently wrong is
  arithmetic: the divisions, the dozenal digits, the hand angles, sunrise
  and sunset. That code needs a test that runs without a browser, and only
  a file that touches no DOM can have one. It is one file and not a package,
  because only the page uses it.
- **The page (`index.html`, `about.html`, `manifest.webmanifest`, `sw.js`)
  — yes, as one module.** These files are deployed together and none is
  used without the others. Splitting the service worker or the About page
  into modules of their own would add boundaries without adding any
  promise to test.
- **No third module.** A "systems" module apart from the core would split
  one table across two files. Both systems belong in one `SYSTEMS` table
  inside the core.

### Can a test prove each contract?

- **Core — yes, in `tests/clock-core.test.js`.** Each promise has an
  exact expected value. For example, 06:00:00 is the reading
  `[6, 0, 0]`, formatted `06:00:00`, in 24 × 60 × 60, and the reading
  `[12, 0, 0]`, formatted `10:00:00` (dour 12 in dozenal), in the 48 clock. Each third hand
  steps whole units. `faceLayout("24x60x60")` has 60 ticks, a major every
  5, labels 0 6 12 18 (major) and 3 9 15 21 (minor), and an hour tick at
  each of the 24 hours.
  An unknown system id or `86400` throws `RangeError`. A polar date returns
  `null`. The v3 solar output for a fixed date and city must be reproduced
  exactly.
- **The page's "no server of its own" rule, and the core's "no DOM" rule —
  yes, in `tests/architecture.test.js`.** It reads the files as text and
  checks two things. First, `clock-core.js` names no `document`, `window`,
  `localStorage` or `navigator`. Second, no file under `web/` calls
  `fetch`, `XMLHttpRequest`, `WebSocket` or `EventSource`, except `sw.js`,
  which may `fetch` only to fill its own cache. This is the one
  architecture rule the plan requires, so it stands in for "only the API
  tier reaches the database", which does not apply here.
- **The page's rendering — no, and not claimed.** The page is checked by
  looking at it. Its one mechanical promise is that every file `sw.js`
  precaches exists under `web/`. The installable-app session tests that.
- **Degrades, never breaks** (storage, geolocation or service worker
  unavailable) can't be proved without a browser either. It stays a
  reviewed promise: every `localStorage` access is in `try/catch`, as v3
  already does.

### Does the dependency direction hide the decisions most likely to change?

The page depends on the core, and the core depends on nothing. These are
the decisions most likely to change:

- **The face labels and tick spacing:** data in `faceLayout`, in the core.
- **Whether a hand steps or sweeps:** `handAngles`, in the core.
- **Which systems exist:** the `SYSTEMS` table, in the core.
- **The solar algorithm:** in the core.

A test reaches all four. Glyph shapes, sizes, colours and layout belong to
the page, which is correct, because they change by looking at them.

**One decision was hidden, and this challenge moves it.** v3 turns "now in
timezone X" into a time of day inside the page, with
`new Date(now.toLocaleString(...))`, and nothing tests it. That conversion
is where daylight-saving and timezone bugs live. The core now owns it, as
`secondsOfDay(date, tz)`, and `Intl` works in Node too. The tests pin a
DST-change instant in `America/New_York`.

### Deferred cuts, decided

- **Native Wear OS watch face — stays deferred.** The brief puts it out of
  scope "for now". It needs a different toolchain, and nothing here would
  consume it yet. When it comes, the core's contract and tests are its
  specification.
- **User-defined divisions — stays out of scope.** That was the person's
  choice. The `SYSTEMS` table leaves room for them, but no general face
  generator is built.
- **Separate projects or packages per concern — closed: no.** There is
  only one consumer. A Wear OS face would reimplement the core in Kotlin
  rather than import it, so packaging the core would not help that either.
- **A build step, bundler or framework — closed: no.** Plain files run
  from disk and from any static host, and with no build there is nothing
  to keep in sync.

### Handoff command, corrected

The plan first named `tar -a -c -f …zip`. Only bsdtar (Windows'
`System32\tar.exe`, macOS) writes a zip that way. GNU tar is the `tar` in
Git Bash, and it can't, so the command would depend on which `tar` comes
first on PATH. `tar -czf {output}/daylight-clock.tar.gz -C web .` works the
same under both. The packaging session uses it.

**Open for the person: where a release goes.** A release pushes the
artifact to a feed. Here that is a folder on disk, which needs no
credential. The packaging session asks the person which folder to use.
