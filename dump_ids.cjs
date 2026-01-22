const fs = require('fs');
try {
    const content = fs.readFileSync('.astro/data-store.json', 'utf8');
    const data = JSON.parse(content);

    // Find blog collection
    const blogIndex = data.findIndex(x => Array.isArray(x) && x.includes('blog'));
    if (blogIndex === -1) {
        console.log('Blog collection not found in data-store');
        process.exit(1);
    }

    // The map is likely at the next index
    const blogMap = data[blogIndex + 1];
    if (!Array.isArray(blogMap)) {
        console.log('Blog map invalid');
        process.exit(1);
    }

    console.log('--- BLOG IDs ---');
    // Map format in data-store is [key, value, key, value...]
    // But data-store.json structure is complex serialization.
    // It seems to be ["Map", key1, val1_ref, key2, val2_ref...] if serialized by devalue?
    // Let's inspect the first element.
    if (blogMap[0] === 'Map') {
        for (let i = 1; i < blogMap.length; i += 2) { // Skip "Map", then key, val, key, val... wait.
            // If ["Map", k1, v1, k2, v2], length is odd.
            // i=1 (k1), i=2 (v1). i=3 (k2).
            // Actually, check type.
            console.log(`Index ${i}:`, blogMap[i]);
        }
    } else {
        // Maybe simple array? 
        console.log('Not a Map representation? First item:', blogMap[0]);
    }

} catch (e) {
    console.error(e);
}
