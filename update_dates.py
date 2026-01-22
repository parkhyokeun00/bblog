import os
import re

dir_path = r'f:\abc\ASTRO\bblog\src\content\blog'
files = os.listdir(dir_path)

for filename in files:
    if filename.endswith('.md') or filename.endswith('.MD'):
        file_path = os.path.join(dir_path, filename)
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Replace pubDate
        new_content = re.sub(r'pubDate:\s*.*', "pubDate: 'Jan 15 2026'", content)
        
        if content != new_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f'Updated: {filename}')
        else:
            print(f'No change: {filename}')
