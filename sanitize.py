import os
import re

dir_path = r'f:\abc\ASTRO\bblog\src\content\blog'
files = os.listdir(dir_path)

for filename in files:
    if filename.endswith('.md') or filename.endswith('.MD'):
        file_path = os.path.join(dir_path, filename)
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Remove trailing spaces on frontmatter markers
        new_content = re.sub(r'---\s*\n', '---\n', content)
        
        if content != new_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f'Sanitized: {filename}')
        else:
            print(f'Already Clean: {filename}')
