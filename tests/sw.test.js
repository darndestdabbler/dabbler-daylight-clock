// sw.js's one mechanical promise: the list it precaches is the site,
// read out of sw.js as text and compared with what is under web/.
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
