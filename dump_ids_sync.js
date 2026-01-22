const fs = require('fs');
try {
    const c = fs.readFileSync('.astro/data-store.json', 'utf8');
    fs.writeFileSync('DUMP_SUCCESS.txt', 'Read file success\n');
    const d = JSON.parse(c);
    const idx = d.findIndex(x => Array.isArray(x) && x.includes('blog'));
    if (idx === -1) {
        fs.writeFileSync('DUMP_ERROR.txt', 'Blog collection not found');
    } else {
        const map = d[idx + 1];
        fs.writeFileSync('ALL_IDS.json', JSON.stringify(map, null, 2));
    }
} catch (e) {
    fs.writeFileSync('DUMP_ERROR.txt', e.message);
}
