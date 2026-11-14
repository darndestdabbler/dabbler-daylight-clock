# Project work plan — sessions

**Written by `dabbler` as a fold of `activity-log.json`.**
Hand edits are overwritten by the next append. The record is the log;
this page is one view of it.

---

## Sessions

The numbered sessions are declared from `session-plan.md`; each one's task is what its own plan step declared.

| # | Session | Releasable | Declared |
| ---: | --- | --- | --- |
| 1 | Author or import the solution plan | no | 2026-11-14 |
| 2 | Challenge the plan, then break it into numbered sessions | no | 2026-11-14 |
| 3 | Skeleton — import v3, the pure core and the test suite | no | 2026-11-14 |
| 4 | The two time systems in the core | no | 2026-11-14 |
| 5 | The 24 × 60 × 60 face, the system selector and the other system's reading | no | 2026-11-14 |
| 6 | Daylight shown from the start | no | 2026-11-14 |
| 7 | The About page | no | 2026-11-14 |
| 8 | The installable app | no | 2026-11-14 |
| 9 | Packaging | no | 2026-11-14 |
| 10 | Release 1.0.0 (release: 1.0.0) | yes | 2026-11-14 |

### Session 1 — Author or import the solution plan

**Releasable: no.**

Record the person's brief in docs/planning/brief.md and write docs/planning/solution-plan.md for the Daylight Clock: a generalization of the existing single-page quadi-dozenal clock (D:\quadi-dozenal-clock-v3.html) that lets the user choose how the day is divided -- 24x60x60 by default, with a built-in 48x48x48 option (the "48 clock") -- delivered as an installable, offline-capable static web app for phones. The plan states the objective, the production split (one static web app, no server tier, no database), the handoff artifact (the static site folder), the module(s) with their contracts and the cuts deferred (including a native Wear OS watch face), and the phases with their key deliverables: importing the existing page, the two-system time model and faces (Z removed from the zan hand; 24x60x60 face with 0-3 quarter-day majors and 2/4 minors, base-10 24-hour digital readout), showing the other system's reading under the digital display, an About page explaining the 48 clock and the daylight/longest-day/shortest-day markings, and PWA installability.

### Session 2 — Challenge the plan, then break it into numbered sessions

**Releasable: no.**

Challenge the cuts in docs/planning/solution-plan.md and record the answers in a new Rationale section of that plan: whether each module (web/clock-core.js, the page files) should exist, whether each contract is a promise a test can prove, and whether the page -> core dependency direction keeps the decisions most likely to change (the systems table, face layout, hand motion, the solar algorithm, and the device-time-to-seconds-of-day conversion across timezones and DST) where a test reaches them; decide each deferred cut (Wear OS face and user-defined divisions stay deferred with reasons; separate packages and a build step are closed as 'no'); and correct the handoff command, since `tar -a` zip output works only with Windows' bsdtar and not with Git Bash's GNU tar. Then append numbered sessions 3 onward to docs/sessions/session-plan.md: the skeleton session (import v3 into web/index.html, web/clock-core.js with its tests, the node --test suite with a hang limit in dabbler.yaml and the architecture test), the two-time-systems core, the 24x60x60 face with selector, Z-less hands and the other system's reading, the About page, the installable app, one packaging session, and a stepless release session proposing version 1.0.0 for the person to approve.

### Session 3 — Skeleton — import v3, the pure core and the test suite

**Releasable: no.**

Lay the skeleton of the daylight clock: import D:\quadi-dozenal-clock-v3.html byte for byte as web/index.html; move secondsOfDay(date, tz) (new) and the v3 solar functions getSunTimes, getTimezoneOffset, utcMinutesToClockAngle, getSolarAngles, describeArc and spanDegrees, unchanged in behaviour, into a DOM-free classic script web/clock-core.js that exposes ClockCore on globalThis and as module.exports under Node, and make index.html load it first and call those functions through ClockCore while its 48-clock arithmetic stays inline; pin the core with tests/clock-core.test.js (v3's outputs for a fixed date and city, the polar-night null, secondsOfDay at a DST change in America/New_York); and declare the node suite in dabbler.yaml under testing.suites with tests/architecture.test.js enforcing the plan's two rules (no DOM globals in clock-core.js; no network calls under web/ except sw.js filling its own cache).

### Session 4 — The two time systems in the core

**Releasable: no.**

Add the two time systems to the pure core and draw the 48 clock through them. In web/clock-core.js, add a SYSTEMS table for "24x60x60" and "48x48x48" (three divisions, a digit base, and face-label data each) and four functions over it: reading(sec, system) gives three integers each in [0, division); handAngles(sec, system) gives three angles in [0, 360) where the first two hands sweep and the third steps whole units; formatReading(sec, system) gives base-10 HH:MM:SS for 24x60x60 and two dozenal digits per unit (X = 10, E = 11) for the 48 clock; faceLayout(system) gives the tick list (angle, major) and the label list (angle, text, major). An unknown system id or a time outside [0, 86400) throws RangeError. tests/clock-core.test.js gains the cases the plan's rationale names: 06:00:00 in both systems, a third hand that steps whole units, the 24x60x60 face's 24 ticks with majors every 2 hours and labels 0 1 2 3 / 2 4, the 48 clock's 48 ticks and labels exactly as v3 draws them, and the RangeErrors. Then web/index.html's generateTicks, drawAnalogFace and updateClock use faceLayout, handAngles and formatReading for "48x48x48" in place of their inline arithmetic, with the 48 clock's look and readout unchanged.

### Session 5 — The 24 × 60 × 60 face, the system selector and the other system's reading

**Releasable: no.**

Put both time systems on the page. web/index.html gains a system selector in its controls (24 x 60 x 60, the default, and the 48 clock), remembered in localStorage inside try/catch the way the theme is; choosing a system clears and redraws the mask ticks and the face labels from faceLayout, and from then on updateClock turns the hands by handAngles and writes the digital readout by formatReading of the chosen system (base-10 24-hour HH:MM:SS, or the 48 clock's dozenal). The Z subpath is removed from the zan hand's path so no hand carries a Z in either system. The italic 12-hour civil line under the readout is replaced by the other system's reading, formatReading of the system not shown, drawn with the readout's own glyphs through renderNumber so the 48 clock's X and E appear as the turned 2 and 3.

### Session 6 — Daylight shown from the start

**Releasable: no.**

Show daylight from the moment web/index.html opens. At start-up the page turns daylight on through the same path the sun button takes today (toggleSolar): with Local Time selected the browser is asked for location at once, and where location is refused or unavailable the page falls back to the timezone's city exactly as the button already does. The button stays and reads "Hide Daylight Time" while daylight shows. Hiding is remembered under its own localStorage key inside try/catch, as the theme and the system are: a click that hides daylight saves that, a click that shows it again clears it, and a later visit opens with daylight hidden only when hiding was the last choice saved; with nothing saved (or storage unavailable), daylight shows.

### Session 7 — The About page

**Releasable: no.**

Add an About page, web/about.html: a plain, self-contained page that follows the clock's theme by reading the saved theme from localStorage under the same key ('quadi-dozenal-theme'), inside try/catch, and setting data-theme on the root exactly as index.html does, with the same light/dark colour tokens (Auto follows the phone's setting). It explains what the 48 clock is (dour, zan and mec, each a 48th of the one above, and their lengths: 30 min, 37.5 s, 0.78125 s); why 48 (= 2⁴ × 3) divides evenly so many ways; why we don't use it, with the case for and against; and what the face's markings mean: the gold wedge (today's daylight), the green wedge (the longest day's daylight) and the blue markers (the shortest day's sunrise and sunset). The clock's controls in web/index.html gain a link to about.html, and about.html links back to index.html.

### Session 8 — The installable app

**Releasable: no.**

Make the clock an installable, offline web app that fits a phone. Add web/manifest.webmanifest with relative start_url and scope, and web/icons/ holding an icon.svg source with PNGs rasterized from it at 192 and 512 px plus a maskable 512 px; link the manifest from index.html and about.html. Add web/sw.js, which precaches every site file under a versioned cache name, serves cache-first and deletes older caches on activate; index.html registers it only where navigator.serviceWorker exists and the page is not opened from file:. Add tests/sw.test.js, which reads the precache list out of sw.js and checks that every path in it exists under web/ (and that every file under web/ is in it). Finally lay out index.html and about.html so that at 360 px wide the face, readouts and controls fit without horizontal scrolling.

### Session 9 — Packaging

**Releasable: no.**

Declare how this repository is packaged and published by adding a `packaging:` block to dabbler.yaml, and nothing else. The pack step tars the web/ folder into {output}/daylight-clock.tar.gz with `tar -czf ... -C web .`; the push step copies {artifact} into the feed folder D:\Releases\daylight-clock (the folder the person chose) with `node -e` and fs.copyFileSync, run without a shell and with no secret. The block is proven by `dabbler packaging --rehearse`.

### Session 10 — Release 1.0.0 (release: 1.0.0)

**Releasable: yes.**

Release 1.0.0: the framework packs and publishes what is on the trunk.
