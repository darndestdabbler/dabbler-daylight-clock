// v3's getSunTimes reads the calendar day in the machine's local time zone,
// so the pinned values are computed with the local zone fixed.
process.env.TZ = 'America/New_York';

const test = require('node:test');
const assert = require('node:assert/strict');
const ClockCore = require('../web/clock-core.js');

// The fixed date and city every pinned value below comes from: v3's own
// functions, run on New York at 2025-06-21 12:00 UTC.
const DATE = new Date(Date.UTC(2025, 5, 21, 12));
const LAT = 40.7128;
const LNG = -74.0060;
const TZ = 'America/New_York';
const POLAR_NIGHT = new Date(Date.UTC(2025, 11, 21, 12));

test('secondsOfDay follows the wall clock across the spring-forward instant', () => {
    // 2025-03-09: New York clocks jump from 02:00 EST to 03:00 EDT at 07:00 UTC.
    assert.equal(ClockCore.secondsOfDay(new Date(Date.UTC(2025, 2, 9, 6, 59, 59)), TZ), 7199);
    assert.equal(ClockCore.secondsOfDay(new Date(Date.UTC(2025, 2, 9, 7, 0, 0)), TZ), 10800);
});

test('secondsOfDay keeps milliseconds and stays in [0, 86400)', () => {
    assert.equal(ClockCore.secondsOfDay(new Date(Date.UTC(2025, 5, 21, 0, 0, 0, 500)), 'UTC'), 0.5);
    assert.equal(ClockCore.secondsOfDay(new Date(Date.UTC(2025, 5, 21, 23, 59, 59, 999)), 'UTC'), 86399.999);
});

test('getSunTimes matches v3', () => {
    assert.deepEqual(ClockCore.getSunTimes(DATE, LAT, LNG), { rise: 564.6128892635332, set: 1470.329992123834 });
});

test('getSunTimes is null in polar night', () => {
    assert.equal(ClockCore.getSunTimes(POLAR_NIGHT, 80, 0), null);
});

test('getTimezoneOffset matches v3', () => {
    assert.equal(ClockCore.getTimezoneOffset(TZ, DATE), -240);
});

test('utcMinutesToClockAngle matches v3', () => {
    assert.equal(ClockCore.utcMinutesToClockAngle(564.6128892635332, -240), 81.15322231588334);
});

test('getSolarAngles matches v3', () => {
    assert.deepEqual(ClockCore.getSolarAngles(DATE, LAT, LNG, TZ),
        { riseAngle: 81.15322231588334, setAngle: 307.5824980309585, offset: -240 });
});

test('getSolarAngles is null in polar night', () => {
    assert.equal(ClockCore.getSolarAngles(POLAR_NIGHT, 80, 0, 'UTC'), null);
});

test('describeArc matches v3', () => {
    assert.equal(ClockCore.describeArc(0, 0, 103, 81.15322231588334, 307.5824980309585),
        'M 0 0 L 101.7746245229456 -15.840637714859838 A 103 103 0 1 1 -81.62502651595895 -62.820021062309415 Z');
});

test('spanDegrees matches v3', () => {
    assert.equal(ClockCore.spanDegrees(81.15322231588334, 307.5824980309585), 226.42927571507516);
    assert.equal(ClockCore.spanDegrees(300, 60), 120);
});
