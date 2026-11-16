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

const H24 = '24x60x60';
const D48 = '48x48x48';

test('SYSTEMS holds exactly the two systems', () => {
    assert.deepEqual(Object.keys(ClockCore.SYSTEMS), [H24, D48]);
});

test('reading of 06:00:00 in both systems', () => {
    assert.deepEqual(ClockCore.reading(21600, H24), [6, 0, 0]);
    assert.deepEqual(ClockCore.reading(21600, D48), [12, 0, 0]);
});

test('reading of the last instant of the day in both systems', () => {
    assert.deepEqual(ClockCore.reading(86399.999, H24), [23, 59, 59]);
    assert.deepEqual(ClockCore.reading(86399.999, D48), [47, 47, 47]);
});

test('formatReading of 06:00:00 in both systems', () => {
    assert.equal(ClockCore.formatReading(21600, H24), '06:00:00');
    assert.equal(ClockCore.formatReading(21600, D48), '10:00:00');
});

test('formatReading writes the 48 clock in dozenal with X and E', () => {
    assert.equal(ClockCore.formatReading(22 * 1800, D48), '1X:00:00');
    assert.equal(ClockCore.formatReading(86399.999, D48), '3E:3E:3E');
    assert.equal(ClockCore.formatReading(86399.999, H24), '23:59:59');
});

test('handAngles of 06:00:00 in both systems', () => {
    assert.deepEqual(ClockCore.handAngles(21600, H24), [90, 0, 0]);
    assert.deepEqual(ClockCore.handAngles(21600, D48), [90, 0, 0]);
});

test('handAngles: the second hand sweeps, the third steps whole units', () => {
    // 24 x 60 x 60: the second hand stays on 12 s until 13 s.
    assert.equal(ClockCore.handAngles(12, H24)[2], 72);
    assert.equal(ClockCore.handAngles(12.9, H24)[2], 72);
    assert.equal(ClockCore.handAngles(13, H24)[2], 78);
    assert.equal(ClockCore.handAngles(90, H24)[1], 9);
    // 48 clock: a mec is 0.78125 s, and the mec hand moves 7.5 degrees a mec.
    assert.equal(ClockCore.handAngles(0.78, D48)[2], 0);
    assert.equal(ClockCore.handAngles(0.78125, D48)[2], 7.5);
    assert.equal(ClockCore.handAngles(1.5, D48)[2], 7.5);
    assert.equal(ClockCore.handAngles(1800 + 18.75, D48)[1], 3.75);
});

test('handAngles stay in [0, 360)', () => {
    for (const system of [H24, D48]) {
        for (const angle of ClockCore.handAngles(86399.999, system)) {
            assert.ok(angle >= 0 && angle < 360, system + ' ' + angle);
        }
    }
});

test('faceLayout of 24 x 60 x 60: 60 minute ticks, labels 0 6 12 18 and a dot at each other hour', () => {
    const face = ClockCore.faceLayout(H24);
    assert.equal(face.ticks.length, 60);
    face.ticks.forEach((t, i) => assert.deepEqual(t, { angle: i * 6, major: i % 5 === 0 }));
    assert.deepEqual(face.labels, [0, 6, 12, 18].map((h) => ({ angle: h * 15, text: String(h), major: true })));
    const others = [];
    for (let h = 0; h < 24; h++) if (h % 6 !== 0) others.push({ angle: h * 15 });
    assert.equal(others.length, 20);
    assert.deepEqual(face.dots, others);
});

test('faceLayout of the 48 clock: 48 ticks and the labels v3 draws', () => {
    const face = ClockCore.faceLayout(D48);
    assert.equal(face.ticks.length, 48);
    face.ticks.forEach((t, i) => assert.deepEqual(t, { angle: i * 7.5, major: i % 4 === 0 }));
    // v3's drawAnalogFace points, at dour v, angle v / 48 of a turn.
    const v3 = [
        { v: 0, l: '0', maj: true }, { v: 4, l: '4', maj: false }, { v: 8, l: '8', maj: false },
        { v: 12, l: '1', maj: true }, { v: 16, l: '4', maj: false }, { v: 20, l: '8', maj: false },
        { v: 24, l: '2', maj: true }, { v: 28, l: '4', maj: false }, { v: 32, l: '8', maj: false },
        { v: 36, l: '3', maj: true }, { v: 40, l: '4', maj: false }, { v: 44, l: '8', maj: false }
    ];
    assert.deepEqual(face.labels, v3.map((p) => ({ angle: p.v * 7.5, text: p.l, major: p.maj })));
    assert.deepEqual(face.dots, []);
});

test('an unknown system id throws RangeError', () => {
    for (const fn of ['reading', 'handAngles', 'formatReading']) {
        assert.throws(() => ClockCore[fn](0, '10x100x100'), RangeError, fn);
    }
    assert.throws(() => ClockCore.faceLayout('10x100x100'), RangeError);
    assert.throws(() => ClockCore.faceLayout('toString'), RangeError);
});

test('a time outside [0, 86400) throws RangeError', () => {
    for (const fn of ['reading', 'handAngles', 'formatReading']) {
        for (const sec of [86400, -1, NaN, '0']) {
            assert.throws(() => ClockCore[fn](sec, H24), RangeError, fn + ' ' + sec);
        }
    }
});
