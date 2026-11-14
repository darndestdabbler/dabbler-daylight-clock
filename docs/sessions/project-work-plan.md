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

### Session 1 — Author or import the solution plan

**Releasable: no.**

Record the person's brief in docs/planning/brief.md and write docs/planning/solution-plan.md for the Daylight Clock: a generalization of the existing single-page quadi-dozenal clock (D:\quadi-dozenal-clock-v3.html) that lets the user choose how the day is divided -- 24x60x60 by default, with a built-in 48x48x48 option (the "48 clock") -- delivered as an installable, offline-capable static web app for phones. The plan states the objective, the production split (one static web app, no server tier, no database), the handoff artifact (the static site folder), the module(s) with their contracts and the cuts deferred (including a native Wear OS watch face), and the phases with their key deliverables: importing the existing page, the two-system time model and faces (Z removed from the zan hand; 24x60x60 face with 0-3 quarter-day majors and 2/4 minors, base-10 24-hour digital readout), showing the other system's reading under the digital display, an About page explaining the 48 clock and the daylight/longest-day/shortest-day markings, and PWA installability.

### Session 2 — Challenge the plan, then break it into numbered sessions

**Releasable: no.**

Challenge the cuts in docs/planning/solution-plan.md and record the answers in a new Rationale section of that plan: whether each module (web/clock-core.js, the page files) should exist, whether each contract is a promise a test can prove, and whether the page -> core dependency direction keeps the decisions most likely to change (the systems table, face layout, hand motion, the solar algorithm, and the device-time-to-seconds-of-day conversion across timezones and DST) where a test reaches them; decide each deferred cut (Wear OS face and user-defined divisions stay deferred with reasons; separate packages and a build step are closed as 'no'); and correct the handoff command, since `tar -a` zip output works only with Windows' bsdtar and not with Git Bash's GNU tar. Then append numbered sessions 3 onward to docs/sessions/session-plan.md: the skeleton session (import v3 into web/index.html, web/clock-core.js with its tests, the node --test suite with a hang limit in dabbler.yaml and the architecture test), the two-time-systems core, the 24x60x60 face with selector, Z-less hands and the other system's reading, the About page, the installable app, one packaging session, and a stepless release session proposing version 1.0.0 for the person to approve.
