const fs = require('fs');
try {
    const data = JSON.parse(fs.readFileSync('.astro/data-store.json', 'utf8'));
    const blogIndex = data.findIndex(x => Array.isArray(x) && x.includes('blog'));

    if (blogIndex === -1) { console.log('No blog'); process.exit(0); }

    const blogMap = data[blogIndex + 1];
    // Map format: ["Map", key1, val1, key2, val2, ...] OR if serialized differently: [key1, val1, key2, val2]
    // The previous dump showed it's an array.

    console.log('Blog Map Length:', blogMap.length);
    console.log('First Item:', blogMap[0]);

    // Heuristic: iterate and print potential keys (strings that look like IDs)
    for (let i = 0; i < blogMap.length; i++) {
        const item = blogMap[i];
        if (typeof item === 'string' && !item.includes('/') && !item.includes('{')) {
            console.log(`Potential Key [${i}]:`, item);
        }
    }
} catch (e) {
    console.log('Error:', e.message);
}
