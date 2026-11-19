// sw.js's mechanical promises, read out of sw.js as text: the list it
// precaches is the site under web/, a new version takes over on reload,
// and the cache answers first.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const WEB = path.join(__dirname, '..', 'web');

function precached() {
    const src = fs.readFileSync(path.join(WEB, 'sw.js'), 'utf8');
    const list = src.match(/const FILES = \[([\s\S]*?)\];/);
    assert.ok(list, 'sw.js has no FILES list');
    return [...list[1].matchAll(/'([^']*)'/g)].map((m) => m[1]);
}

function siteFiles(dir) {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
        const p = path.join(dir, e.name);
        return e.isDirectory() ? siteFiles(p) : [path.relative(WEB, p).split(path.sep).join('/')];
    });
}

test('every path sw.js precaches exists under web/', () => {
    for (const file of precached()) {
        assert.ok(fs.existsSync(path.join(WEB, file)), file + ' is precached but missing');
    }
});

test('every file under web/ is precached, except sw.js itself', () => {
    const files = precached();
    for (const file of siteFiles(WEB)) {
        if (file !== 'sw.js') assert.ok(files.includes(file), file + ' is not precached');
    }
});

function handler(name) {
    const src = fs.readFileSync(path.join(WEB, 'sw.js'), 'utf8');
    const body = src.match(new RegExp("addEventListener\\('" + name + "', \\(event\\) => \\{([\\s\\S]*?)\\n\\}\\);"));
    assert.ok(body, 'sw.js has no ' + name + ' handler');
    return body[1];
}

test('install skips waiting', () => {
    assert.match(handler('install'), /self\.skipWaiting\(\)/);
});

test('activate claims its clients', () => {
    assert.match(handler('activate'), /self\.clients\.claim\(\)/);
});

test('fetch answers from the cache first', () => {
    assert.match(handler('fetch'), /caches\.match\(event\.request\)\.then\(\(hit\) => hit \|\| fetch\(event\.request\)\)/);
});

test('CACHE is daylight-clock-v7', () => {
    const src = fs.readFileSync(path.join(WEB, 'sw.js'), 'utf8');
    assert.match(src, /const CACHE = 'daylight-clock-v7';/);
});
