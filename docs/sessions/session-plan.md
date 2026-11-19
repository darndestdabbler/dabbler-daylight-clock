# Session plan

> **Purpose:** the numbered sessions this repository runs, in order. The
> first two set the project up; everything after them is the work.
> **Workflow:** Full

---

## Sessions

### Session 1: Author or import the solution plan

1. Register.
2. The brief is the prompt this session was started with, or
   `docs/planning/brief.md`: what the solution is — its purpose, who uses
   it, what it must do and what is out of scope, what success looks like,
   and whether a plan or notes already exist. With neither, ask the person
   who started the session for it and write their answer to that path
   before any work. The plan's substance is theirs: do not search
   neighbouring directories for one, and do not draft one from the folder
   name. Before any module is proposed, ask them how production is split:
   what runs separately in production, and which part may talk to the
   database? Offer the default -- an application tier that calls an API
   tier, and only the API tier talks to the database. Then create — or
   import — `docs/planning/solution-plan.md`: the
   objective a reader can act on; the *Production split* they answered;
   the *Handoff artifacts*, what each separately running part is handed
   over as, with the standard command for its form -- for .NET an IIS site
   package (`dotnet publish`) or a Windows Service (a Worker Service
   published for a service host), for Java a runnable jar or a war (`mvn
   package` writing into `{output}`, which `packaging.pack` requires --
   say through a property the POM's jar or war plugin takes as its
   output directory, `-Dhandoff.dir={output}`) or an image (Spring
   Boot's `build-image`), for the database a
   SQL migration script (`dotnet ef migrations script --idempotent`); the
   real form is produced later, and a tutorial produces the easiest one to
   test; the modules, with what each is
   responsible for, the contract each exposes (what must be true going
   in, what is guaranteed coming out, how it fails), the dependency
   direction, the reason for each cut and the cuts deferred — one module
   is a fine answer, and most small solutions are one; and the phases or
   feature areas with their key deliverables, each scoped to a handful of
   focused AI sessions. A repository that already has
   `docs/planning/project-plan.md` amends that file instead.
3. Where the plan has several modules, say in it how each is a project:
   a `.csproj` listed in the root solution file for .NET, or a Maven module
   listed in the parent `pom.xml`, each reaching a sibling by project
   reference -- a `<ProjectReference>`, or a dependency at
   `${project.version}`. The first numbered session, the skeleton, writes
   the projects.

The framework then verifies the work cross-provider, runs the suites as
the run of record and closes the session. These are the framework's,
not steps to plan.

This session writes the plan and nothing else: it creates, edits or
deletes no code, project, build file, test, `dabbler.yaml` suite or
packaging.

**Creates:** `docs/planning/solution-plan.md`. A later revision is just
another plan session that amends the same file.

### Session 2: Challenge the plan, then break it into numbered sessions

1. Register.
2. Read `docs/planning/solution-plan.md` (or `docs/planning/project-plan.md`
   where that is the file this repository keeps its plan in) and challenge
   its cuts: for each
   module, whether it should exist, whether its contract is a promise
   something can prove, and whether the dependency direction hides the
   decisions most likely to change; decide each deferred cut or say why it
   stays deferred. Record the answers in the plan's rationale.
3. Break the plan into numbered sessions appended to this file. Each
   session is a focused unit of
   work one AI coding session can complete: one
   `### Session <N>: <title>` heading, and its steps as a top-level
   ordered list. Step 1 registers the session and the rest are the
   work: cross-provider verification, the run of record and the close
   are the framework's, never steps to plan. Never
   write a step that says "run the tests" without saying which run it
   means. Order sessions so earlier ones unblock later ones — a module
   before the modules that depend on it — and keep at most ~3 work steps
   per session.

   The first numbered session is the skeleton. For .NET it writes the
   solution file and every project the plan names, with their
   references; for Maven or Gradle, the parent build and every module.
   Either way it declares the test suite in `dabbler.yaml` under
   `testing.suites`, even before any tests exist, with `expensive: true`
   where its run is the run of record and a hang limit in its command --
   `dotnet test --blame-hang-timeout 5m`, or Surefire's
   `forkedProcessTimeoutInSeconds` -- so every later run inherits it,
   and adds the architecture test the plan requires -- where only the
   API tier may reach the database, that rule. Later sessions fill the
   modules in and never re-create what the skeleton made.

   Packaging and releases are sessions of their own. Where the plan
   names *Handoff artifacts*, plan one packaging session -- early, with
   project files only, or later -- that writes the `packaging:` block in
   `dabbler.yaml` and does nothing else; its check is `dabbler packaging
   --rehearse`, which runs the pack and pushes nothing. A release is a
   session with no steps, headed `### Session <N>: Release <version> (release:
   <version>)`; propose its version -- patch, minor or major by what the
   sessions it releases change -- for the person to approve with the plan.

The framework then verifies the work cross-provider, runs the suites as
the run of record and closes the session. These are the framework's,
not steps to plan.

This session writes the plan and nothing else: it creates, edits or
deletes no code, project, build file, test, `dabbler.yaml` suite or
packaging.

**Creates:** the numbered session list the rest of this repository runs,
starting with the skeleton session.

> Do NOT hand-author `sessions.json`. The first `session start`
> bootstraps it from this plan — state files are the writers' job.

### Session 3: Skeleton — import v3, the pure core and the test suite

1. Register.
2. Copy `D:\quadi-dozenal-clock-v3.html` into `web/index.html` byte for
   byte, so the import changes no behaviour.
3. Create `web/clock-core.js` as a classic script that exposes `ClockCore`
   on `globalThis` and as `module.exports` under Node. It holds
   `secondsOfDay(date, tz)` and the v3 solar functions, moved out of the
   page unchanged in behaviour: `getSunTimes`, `getTimezoneOffset`,
   `utcMinutesToClockAngle`, `getSolarAngles`, `describeArc` and
   `spanDegrees`. `web/index.html` loads it before its own script and
   calls these through `ClockCore`; its 48-clock arithmetic stays inline
   for now. `tests/clock-core.test.js` pins each function to v3's output
   for a fixed date and city, checks the polar-night `null`, and checks
   `secondsOfDay` at a DST-change instant in `America/New_York`.
4. Declare the suite in `dabbler.yaml` under `testing.suites`: name
   `node`, command `node --test --test-timeout=60000 "tests/**/*.test.js"`
   (the timeout is the hang limit), `expensive: true` because its run is
   the run of record, `covers: [web, tests]`, `test_roots: [tests]` and
   `test_glob: "*.test.js"`. Add `tests/architecture.test.js`, which
   enforces the plan's two rules. First, `web/clock-core.js` names no
   `document`, `window`, `localStorage` or `navigator`. Second, no file
   under `web/` calls `fetch`, `XMLHttpRequest`, `WebSocket` or
   `EventSource`, except `sw.js`, which may only fill its own cache.

### Session 4: The two time systems in the core

1. Register.
2. Add these to `web/clock-core.js`: the `SYSTEMS` table (`"24x60x60"`,
   `"48x48x48"`), plus `reading`, `handAngles`, `formatReading` and
   `faceLayout` for both systems, as the solution plan's contract states.
   An unknown system id, or a time outside `[0, 86400)`, throws
   `RangeError`. Extend `tests/clock-core.test.js` with the cases the
   plan's rationale names:
   - 06:00:00 in both systems;
   - a third hand that steps whole units;
   - the 24 × 60 × 60 face's 24 ticks, with majors every 2 hours, labels
     0 1 2 3 and minors 2 and 4;
   - the 48-clock face's 48 ticks and labels, exactly as v3 draws them;
   - the `RangeError`s.
3. Make `web/index.html` draw the 48 clock through these functions
   instead of the inline arithmetic in `generateTicks`, `drawAnalogFace`
   and `updateClock`, with no change to the 48 clock's look or readout.
   Name the step's test run: `node --test` over
   `tests/clock-core.test.js` and `tests/architecture.test.js`.

### Session 5: The 24 × 60 × 60 face, the system selector and the other system's reading

1. Register.
2. Add a system selector to the controls in `web/index.html`. The default
   is 24 × 60 × 60, and the choice is remembered in `localStorage` inside
   `try/catch`, as the theme is. Switching redraws the ticks, labels and
   hands from `faceLayout` and `handAngles`, and the digital readout from
   `formatReading`: base 10 (24-hour) in 24 × 60 × 60, dozenal in the 48
   clock.
3. Remove the Z from the zan hand's path in `web/index.html`, so that no
   hand carries a Z in either system.
4. Replace the 12-hour line under the readout with the other system's
   reading, from `formatReading` of the system not shown. Draw it with the
   readout's own glyphs, so the 48 clock's X and E appear as the turned 2
   and 3.

### Session 6: Daylight shown from the start

1. Register.
2. In `web/index.html`, show the daylight wedges, the sun and the
   shortest-day markers as soon as the page opens, through the same path
   the sun button takes today: with Local Time selected the browser asks
   for location at once, and where location is refused or unavailable the
   page falls back to the timezone's city, as the button already does.
3. The button stays, as "Hide Daylight Time" while daylight shows. Hiding
   is remembered in `localStorage` inside `try/catch`, as the theme and
   the system are, and a later visit opens with daylight hidden until it
   is shown again. With nothing saved, daylight shows.

### Session 7: The About page

1. Register.
2. Write `web/about.html`. It follows the clock's theme by reading the
   saved theme the same way `index.html` does. It covers:
   - what the 48 clock is: dour, zan and mec, and their lengths (30 min,
     37.5 s, 0.78125 s);
   - why 48 (= 2⁴ × 3) divides evenly so many ways;
   - the question of why we don't use it, with the case for and against;
   - what the face's markings mean: the gold wedge (today's daylight), the
     green wedge (the longest day's daylight) and the blue markers (the
     shortest day's sunrise and sunset).
3. Link the About page from the clock's controls in `web/index.html`, and
   link back to the clock from `web/about.html`.

### Session 8: The installable app

1. Register.
2. Add `web/manifest.webmanifest` and `web/icons/`: an `icon.svg` source
   and PNGs at 192 and 512 px, including a maskable 512. Link the manifest
   from `index.html` and `about.html`. Keep `start_url` and `scope`
   relative, so the site installs from any folder of a static host.
3. Add `web/sw.js`. It precaches every site file under a versioned cache
   name, serves cache-first and deletes older caches when it activates.
   `index.html` registers it only where `navigator.serviceWorker` exists
   and the page is not opened from `file:`. Add `tests/sw.test.js`, which
   checks that every path `sw.js` precaches exists under `web/`.
4. Lay out `web/index.html` and `web/about.html` for phone width: at
   360 px wide, the face, readouts and controls fit without horizontal
   scrolling.

### Session 9: Packaging

1. Register.
2. Ask the person which folder on disk releases go to. Then write the
   `packaging:` block in `dabbler.yaml`, and nothing else:
   - `pack.argv` is
     `["tar", "-czf", "{output}/daylight-clock.tar.gz", "-C", "web", "."]`;
   - `push` copies `{artifact}` into that folder, its `feed`, without a
     shell (for example `node -e` with `fs.copyFileSync`), and has no
     `secret`.
   The step's check is `dabbler packaging --rehearse`.

### Session 10: Release 1.0.0 (release: 1.0.0)

### Session 11: Host on GitHub Pages at clock.darndestdabbler.org

1. Register.
2. Add `.github/workflows/pages.yml`, and nothing else: run by hand
   (`workflow_dispatch`) only, it uploads `web/` as it stands on the trunk
   with `actions/upload-pages-artifact` and deploys it with
   `actions/deploy-pages`. It has no build step and touches no file under
   `web/`. The step's check proves the workflow file exists and names
   `web` as the uploaded path.
3. The person does the rest, outside the repository: a DNS `CNAME`
   record from `clock` to `darndestdabbler.github.io`; in the repository's
   Pages settings, source *GitHub Actions* and custom domain
   `clock.darndestdabbler.org` with HTTPS enforced; then a run of the
   workflow after each release.

### Session 12: Location that never answers falls back

1. Register.
2. On an iPhone (Chrome) the button stays on "Requesting Location..." and
   the debug panel shows only "Requesting geolocation..." — the browser
   never calls back, and each tap stacks another request. In
   `web/index.html`'s `toggleSolar`:
   - pass `getCurrentPosition` the options `{ timeout: 10000,
     maximumAge: 600000 }`, so a request nobody answers ends in the error
     callback and the timezone fallback, as a refusal already does;
   - while a request is pending, a tap on the button starts no second one;
   - the error line in the debug panel carries the error's `code` as well
     as its `message`.
   Bump `CACHE` in `web/sw.js` to `daylight-clock-v2`. The step's check
   proves `index.html` passes a `timeout` to `getCurrentPosition`.

### Session 13: The 24 × 60 × 60 face read by numbers, dots and minute ticks

1. Register.
2. Change `faceLayout("24x60x60")` in `web/clock-core.js`, and leave the
   48 clock's face as it is:
   - 60 ticks, one per minute (6° apart), a major every 5, so the minute
     and second hands land on a tick;
   - labels `0`, `6`, `12` and `18` at the quarter days, all major, and no
     other labels;
   - a new `dots` list: one `{ angle }` for each of the other 20 hours, at
     the hour's angle (15° per hour), five between each pair of numbers.
     The 48 clock's `faceLayout` returns `dots: []`.
   Update the 24 × 60 × 60 `faceLayout` test in `tests/clock-core.test.js`
   to these, and add `dots: []` to the 48 clock's. Amend the 24 × 60 × 60
   face row and the matching contract lines in
   `docs/planning/solution-plan.md` to the new face.
3. In `web/index.html`, `drawAnalogFace` draws each dot as a circle in the
   hour hand's rose (`#cc79a7`) with a black stroke, at the labels' radius
   (`CONFIG.radiusMajor`), inside `#analog-numbers`, so dots and numbers
   both sit above the hands, as if printed on glass over them. The
   numbers draw at the major label scale. Bump `CACHE` in `web/sw.js` to
   `daylight-clock-v3`.

### Session 14: Release 1.1.0 (release: 1.1.0)

### Session 15: Hour ticks at the edge, minor numbers, level turned digits, and the 48 clock by default

1. Register.
2. Change `faceLayout("24x60x60")` in `web/clock-core.js`, and leave the
   48 clock's ticks and labels as they are:
   - the 60 minute ticks stay as they are, a major every 5;
   - labels `0`, `6`, `12` and `18` stay major, and `3`, `9`, `15` and
     `21` join them as minor labels (`major: false`) at their hours'
     angles (15° per hour) — eight labels, and no others;
   - `dots` goes, from both systems' layouts. In its place is `hourTicks`:
     one `{ angle }` for each of the 24 hours, the labelled ones included,
     at 15° per hour. The 48 clock's `faceLayout` returns `hourTicks: []`.
   Update both `faceLayout` tests in `tests/clock-core.test.js` to these,
   and the comment above `faceLayout`. Amend the 24 × 60 × 60 face row and
   the matching contract lines in `docs/planning/solution-plan.md`.
3. In `web/index.html`, `drawAnalogFace` no longer draws dots. Each hour
   tick is drawn as a small rectangle in the hour hand's rose (`#cc79a7`)
   with no stroke, pointing at the centre, in the band between the minute
   ticks' outer ends (radius 90) and the face's edge (radius 98), touching
   neither. They are drawn solid, not cut into the face plate's mask as
   the minute ticks are, so they stay rose over night, longest-day and
   today's daylight alike; and beneath the hands. Switching systems clears
   them, as it redraws the minute ticks. The minor labels draw at
   `CONFIG.radiusMinor` and `CONFIG.scaleMinor`, as the 48 clock's do.
4. The turned 2 and 3 (the 48 clock's X and E) sit off the line of the
   digits beside them: `renderNumber` turns the glyph 180° about its
   text origin, which is not the middle of the digit's ink. Turn it about
   the middle of the digit's ink instead, so a turned digit's top and
   bottom are level with its neighbours' — in the readout and in the other
   system's reading under it, in both systems and at every scale
   `renderNumber` is called with.
5. Make the 48 clock the default. In `web/index.html` the system drawn
   when nothing is saved, and the fallback for a saved value that names no
   system, become `48x48x48`; a saved choice is still honoured. Move the
   `(default)` mark in `docs/planning/solution-plan.md` to the 48 clock's
   row, and amend any line there that names the default. Bump `CACHE` in
   `web/sw.js` to `daylight-clock-v4`.

### Session 16: Release 1.2.0 (release: 1.2.0)

### Session 17: Turned digits level at every scale, and a new version takes over on reload

1. Register.
2. Session 15's turned 2 and 3 (the 48 clock's X and E) now sit about two
   glyph units too high: `inkMiddle` in `web/index.html` measures the ink
   from canvas's `'middle'` baseline, which is not SVG's `central` baseline
   (in Arial bold at 14 the two are about a unit apart). Before session 15
   the turn about the text origin left the turned digit about 0.4 units
   low — unseen in the readout, seen in the small reading under it. Turn
   it about the middle of its ink measured against the baseline the
   glyphs are drawn on: canvas's `'alphabetic'` baseline for the ink, and
   the offset from SVG's `central` to its `alphabetic` baseline measured
   from the SVG itself (the difference of two hidden probe texts'
   `getBBox().y`), once per turned glyph. A turned digit's top and bottom
   are level with its neighbours' — within a tenth of a glyph unit when
   rendered — in the readout and in the other system's reading, in both
   systems.
3. In `web/sw.js` a new version takes over without waiting for every
   tab and app window to close: `install` calls `self.skipWaiting()` and
   `activate` calls `self.clients.claim()`, so a reload after a deploy
   shows it. The cache stays cache-first. Bump `CACHE` to
   `daylight-clock-v5`.
4. The 48 clock stays the default only where nothing is saved; a saved
   choice is still honoured, and no storage key changes.

### Session 18: Release 1.2.1 (release: 1.2.1)

### Session 19: The About page condensed, with dek and el, the dozenal societies and the clock in twelves

1. Register.
2. Rewrite `web/about.html` to the draft the person approved,
   `docs/planning/about-draft.html`: the page becomes that file, word for
   word and rule for rule. What the draft changes, and nothing else on the
   page changes:
   - the sections run in this order: About the clock, The 48 clock, What
     the face shows, Why 48?, So why don't we use it?, The dozenal
     societies, A clock in twelves;
   - the existing sections are condensed to the draft's wording; the
     separate "case for" paragraph and the list of 48's divisors go;
   - ten and eleven are no longer written X and E. They are dek and el, a
     `2` and a `3` in a `.turned` span turned 180° as the clock face turns
     them, so no font has to carry ↊ and ↋. The class is exactly
     `display: inline-block; transform-origin: center center;
     transform: translateY(0.04em) rotate(180deg);`, with no font of its
     own; each span keeps the draft's `role="img"` and `aria-label`;
   - **The dozenal societies** is new: the Dozenal Society of America
     (founded 1944) and the Dozenal Society of Great Britain (founded
     1959), Isaac Pitman's turned digits, and a link to
     `https://dozenal.org/`;
   - **A clock in twelves** is new: the day divided by twelve five times
     over (dwell 2 h, breather 10 min, trice 50 s, lull 4⅙ s, twinkling
     about 0.35 s), a division that goes back to the American society's
     founders in 1945, Paul Rapoport's iPhone clocks, a link to
     `https://dozenal.org/dozenal-jottings.html` (the newsletter's index,
     not the 86 MB PDF of the issue), and how the two clocks compare (a
     dwell is exactly four dours).
   The two links are plain `<a href>`s: the page still calls no server,
   and `tests/architecture.test.js` stays as it is.
3. Delete `docs/planning/about-draft.html`: the page is now the one copy.
   Amend the two lines of `docs/planning/solution-plan.md` that say what
   the About page covers (the **About** bullet and the *About page* item)
   to name the dozenal societies and the clock in twelves as well. The
   core's own `X` and `E` characters, and every line that names them,
   stay as they are: only the About page's wording changes.
4. Bump `CACHE` in `web/sw.js` to `daylight-clock-v6`, so the cached
   About page is replaced, and update its test in `tests/sw.test.js`.
5. The `0.04em` nudge is tuned by eye for Segoe UI, which only Windows
   has. The person looks at the turned digits on a phone after the
   release; a different nudge there is a later session's, not this one's.
   Nothing under `web/` other than `about.html` and `sw.js` changes.

### Session 20: Release 1.3.0 (release: 1.3.0)

### Session 21: The system toggle, 24 × 60 × 60 by default again, two far cities and a latitude control

1. Register.
2. In `web/index.html` the time-system dropdown (`#system-select`) goes.
   In its place is a two-button toggle, `24 × 60 × 60` beside
   `48 × 48 × 48`, so both systems are seen at once. It sits on a row of
   its own directly under the clock card: the first thing in `.controls`,
   above the Daylight Time button, the two buttons side by side and never
   wrapping onto two lines, at 360 px wide as well. The system in use is
   the highlighted button and carries `aria-pressed="true"`; the other
   carries `aria-pressed="false"`. A click on either calls
   `setSystem(<id>, true)`, and `setSystem` sets the two buttons' pressed
   state where it set the dropdown's value. The toggle follows the theme
   through the existing colour tokens, in light and dark.
3. Make 24 × 60 × 60 the default again. In `web/index.html` the system
   drawn when nothing is saved, and the fallback for a saved value that
   names no system, become `24x60x60` (the `let system` initial value,
   `setSystem`'s fallback, both values in `initSystem`, and the section
   comment). A saved choice is still honoured, and no storage key changes.
   Move the `(default)` mark in `docs/planning/solution-plan.md` back to
   the 24 × 60 × 60 row, and amend the lines there that name the default
   or call the control a selector.
4. Add two cities to the timezone list and to `TZ_LOCATIONS`, after
   Tokyo: **Cape Town** (`Africa/Johannesburg`, lat −33.9249,
   lng 18.4241) and **Fairbanks** (`America/Anchorage`, lat 64.8378,
   lng −147.7164). They behave as the other cities do: the clock reads
   that zone's time and the daylight is drawn for that place.
5. In `web/clock-core.js`, beside the solar functions and exported on
   `ClockCore`, with `getSunTimes` and `describeArc` left exactly as they
   are:
   - `polarState(date, lat)` says why a date has no sunrise or sunset:
     `'day'` when the sun does not set, `'night'` when it does not rise,
     and `null` when it does both. It uses `getSunTimes`'s own day of
     year, declination and 90.833° zenith, and compares without dividing
     — with `n = cos(90.833°) − sin(lat)·sin(dec)` and
     `d = cos(lat)·cos(dec)`, `'day'` when `n < −d` and `'night'` when
     `n > d` — so the poles themselves, where `d` is zero, answer too;
   - `describeDisc(x, y, radius)` returns the path of a whole circle
     (`describeArc` cannot draw one: a 360° sweep starts and ends on the
     same point).
   `tests/clock-core.test.js` gains: `polarState` at 90° N is `'day'` on
   21 June and `'night'` on 21 December, and the reverse at 90° S; it is
   `'night'` at 80° N on 21 December, where `getSunTimes` is `null`; it
   is `null` at 60° N on 21 June and at the equator on both solstices;
   and `describeDisc` returns a closed path whose arcs go all the way
   round. Add both functions' contract lines to
   `docs/planning/solution-plan.md`.
6. In `web/index.html` a latitude dropdown, `#latitude-select`, follows
   the timezone dropdown. Its options, in this order:
   - `current`, selected at the start: the latitude the daylight is drawn
     for when nothing else is chosen — the device's under Local Time (or
     its fallback city's), or the chosen city's. Its label is that
     latitude rounded to a whole degree with `(current)` beside it —
     `41° N (current)`, `34° S (current)`, `0° (current)` — and it is
     rewritten whenever that place changes: a location answer, a
     fallback, a change of timezone. Until a place is known it reads
     `Latitude (current)`;
   - `90° N`, `60° N`, `30° N`, `0° (Equator)`, `30° S`, `60° S`,
     `90° S`.
   Choosing a fixed latitude replaces only the latitude the daylight is
   drawn with — in `updateSolarGeometry` and in `updateClock`'s today
   wedge — and redraws at once; the longitude, the timezone and the
   clock's time stay as the timezone dropdown sets them. Choosing
   `current` goes back to the place's own. The choice holds across a
   change of timezone or date, and is not remembered across visits.
7. Draw the days that have no sunrise or sunset, which 90° N and 90° S
   always are, and which no place offered before was. Wherever the page
   gets `null` from `getSolarAngles`, it asks `polarState`:
   - today's daylight (gold) is the whole disc (`describeDisc` at
     `WEDGE_RADIUS`) on a polar day and is cleared on a polar night — it
     no longer keeps the last place's wedge;
   - the longest day is still picked by length, a polar day counting as
     the whole day and a polar night as none; its daylight (green) is
     the whole disc when it is a polar day;
   - the shortest day's markers (blue) are drawn only when that day has a
     sunrise and a sunset, and are cleared otherwise.
   The Date override applies as it does now. At 60° and below, and for
   every city, the face draws exactly as before.
8. Bump `CACHE` in `web/sw.js` to `daylight-clock-v7`, and update its
   test in `tests/sw.test.js`. `web/about.html` does not change, and
   `tests/architecture.test.js` stays as it is: the core gains no DOM and
   the page calls no server.

### Session 22: Release 1.4.0 (release: 1.4.0)
