/*
 * clock-core.js — the clock's pure arithmetic: time of day and the
 * sunrise/sunset geometry. It touches no DOM, so it runs under Node's test
 * runner as well as in the page, where it loads as a classic <script>
 * (so the page still works when opened from disk) and exposes ClockCore.
 */
(function (root) {
    'use strict';

    /**
     * Wall-clock seconds since midnight in `tz` at the instant `date`,
     * in [0, 86400). On a DST change day it follows the wall clock.
     */
    function secondsOfDay(date, tz) {
        var parts = new Intl.DateTimeFormat('en-US', {
            timeZone: tz, hourCycle: 'h23',
            hour: 'numeric', minute: 'numeric', second: 'numeric'
        }).formatToParts(date);
        var f = {};
        parts.forEach(function (p) { f[p.type] = Number(p.value); });
        return f.hour * 3600 + f.minute * 60 + f.second + date.getUTCMilliseconds() / 1000;
    }

    // ===========================================
    // SOLAR (moved unchanged from v3)
    // ===========================================

    /**
     * Corrected sunrise/sunset calculation.
     * Returns {rise, set} in UTC minutes from midnight UTC.
     */
    function getSunTimes(date, lat, lng) {
        var rad = Math.PI / 180;

        var start = new Date(date.getFullYear(), 0, 0);
        var diff = date - start;
        var dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

        var B = rad * (360 / 365) * (dayOfYear - 81);
        var declination = 23.45 * Math.sin(B);
        var eot = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);

        var cosLat = Math.cos(lat * rad);
        var cosDec = Math.cos(declination * rad);
        var sinLat = Math.sin(lat * rad);
        var sinDec = Math.sin(declination * rad);

        var cosHA = (Math.cos(90.833 * rad) - sinLat * sinDec) / (cosLat * cosDec);

        if (cosHA < -1 || cosHA > 1) return null;

        var ha = Math.acos(cosHA) / rad;
        var solarNoon = 720 - 4 * lng - eot;

        return { rise: solarNoon - ha * 4, set: solarNoon + ha * 4 };
    }

    /**
     * SVG arc/wedge path.
     * 0°=top (midnight), 90°=right (6AM), 180°=bottom (noon), 270°=left (6PM).
     */
    function describeArc(x, y, radius, startAngle, endAngle) {
        var startRad = (startAngle - 90) * Math.PI / 180.0;
        var endRad = (endAngle - 90) * Math.PI / 180.0;
        var x1 = x + radius * Math.cos(startRad);
        var y1 = y + radius * Math.sin(startRad);
        var x2 = x + radius * Math.cos(endRad);
        var y2 = y + radius * Math.sin(endRad);

        var sweep = endAngle - startAngle;
        if (sweep < 0) sweep += 360;
        var largeArc = sweep > 180 ? "1" : "0";

        return "M " + x + " " + y +
               " L " + x1 + " " + y1 +
               " A " + radius + " " + radius + " 0 " + largeArc + " 1 " + x2 + " " + y2 +
               " Z";
    }

    /**
     * Get the UTC offset (in minutes) for a timezone on a given date.
     */
    function getTimezoneOffset(tz, refDate) {
        var utcStr = refDate.toLocaleString('en-US', { timeZone: 'UTC' });
        var localStr = refDate.toLocaleString('en-US', { timeZone: tz });
        return (new Date(localStr) - new Date(utcStr)) / 60000;
    }

    /**
     * Convert UTC minutes to a clock angle (degrees).
     */
    function utcMinutesToClockAngle(utcMinutes, offsetMinutes) {
        var localMinutes = utcMinutes + offsetMinutes;
        localMinutes = ((localMinutes % 1440) + 1440) % 1440;
        return (localMinutes / 1440) * 360;
    }

    /**
     * Get clock angles for sunrise and sunset.
     */
    function getSolarAngles(targetDate, lat, lng, tz) {
        var times = getSunTimes(targetDate, lat, lng);
        if (!times) return null;

        var offset = getTimezoneOffset(tz, targetDate);
        var riseAngle = utcMinutesToClockAngle(times.rise, offset);
        var setAngle  = utcMinutesToClockAngle(times.set, offset);

        return { riseAngle: riseAngle, setAngle: setAngle, offset: offset };
    }

    /** Clockwise angular span from a to b, in degrees (0..360). */
    function spanDegrees(a, b) {
        var d = b - a;
        if (d < 0) d += 360;
        return d;
    }

    var ClockCore = {
        secondsOfDay: secondsOfDay,
        getSunTimes: getSunTimes,
        getTimezoneOffset: getTimezoneOffset,
        utcMinutesToClockAngle: utcMinutesToClockAngle,
        getSolarAngles: getSolarAngles,
        describeArc: describeArc,
        spanDegrees: spanDegrees
    };

    root.ClockCore = ClockCore;
    if (typeof module !== 'undefined' && module.exports) module.exports = ClockCore;
})(globalThis);
