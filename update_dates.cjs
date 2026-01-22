const fs = require('fs');
const path = require('path');

const dir = 'src/content/blog';
const files = fs.readdirSync(dir);

files.forEach(file => {
    if (file.endsWith('.md') || file.endsWith('.MD')) {
        const filePath = path.join(dir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const newContent = content.replace(/pubDate:\s*.*?\n/, "pubDate: 'Jan 15 2026'\n");
        if (content !== newContent) {
            fs.writeFileSync(filePath, newContent);
            console.log('Updated: ' + file);
        } else {
            console.log('No change: ' + file);
        }
    }
});
