const fs = require('fs');
try {
    const data = JSON.parse(fs.readFileSync('.astro/data-store.json', 'utf8'));
    const blogEntry = data.find(x => Array.isArray(x) && x.includes('blog'));
    if (blogEntry) {
        const blogMapIndex = data.indexOf(blogEntry) + 1;
        const blogMap = data[blogMapIndex];
        // Key is at index 0, 2, 4...
        const keys = [];
        for (let i = 0; i < blogMap.length; i++) {
            // Just dump everything to see structure
            keys.push(blogMap[i]);
        }
        fs.writeFileSync('keys.json', JSON.stringify(keys, null, 2));
    } else {
        fs.writeFileSync('keys.json', '["Blog entry not found"]');
    }
} catch (e) {
    fs.writeFileSync('keys.json', JSON.stringify({ error: e.message }));
}
