// The plan's two architecture rules, checked by reading the files as text:
// the core touches no browser globals, and the site talks to no server.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const WEB = path.join(__dirname, '..', 'web');

function textFiles(dir) {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) return textFiles(p);
        return /\.(html|js|webmanifest|json)$/.test(e.name) ? [p] : [];
    });
}

test('clock-core.js names no document, window, localStorage or navigator', () => {
    const src = fs.readFileSync(path.join(WEB, 'clock-core.js'), 'utf8');
    const found = src.match(/\b(document|window|localStorage|navigator)\b/g);
    assert.equal(found, null, 'clock-core.js names ' + found);
});

test('no file under web/ calls a server, except sw.js filling its own cache', () => {
    for (const file of textFiles(WEB)) {
        const src = fs.readFileSync(file, 'utf8');
        const name = path.relative(WEB, file).split(path.sep).join('/');
        if (name === 'sw.js') {
            // The service worker may fetch, but only its own site's files:
            // no other network API and no absolute URL.
            assert.doesNotMatch(src, /\b(XMLHttpRequest|WebSocket|EventSource)\b/, name);
            assert.doesNotMatch(src, /\bhttps?:\/\//, name + ' names an absolute URL');
        } else {
            assert.doesNotMatch(src, /\b(fetch|XMLHttpRequest|WebSocket|EventSource)\s*\(/, name);
        }
    }
});
