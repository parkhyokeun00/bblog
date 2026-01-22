import fs from 'fs';
import path from 'path';

const dir = 'src/content/blog';
const files = fs.readdirSync(dir);

console.log('Filename,Category,PubDate');

files.forEach(file => {
    if (file.endsWith('.md') || file.endsWith('.MD')) {
        const content = fs.readFileSync(path.join(dir, file), 'utf8');
        const catMatch = content.match(/category:\s*['"]?(.*?)['"]?\s*$/m);
        const dateMatch = content.match(/pubDate:\s*['"]?(.*?)['"]?\s*$/m);
        console.log(`${file},${catMatch ? catMatch[1] : 'NONE'},${dateMatch ? dateMatch[1] : 'NONE'}`);
    }
});
