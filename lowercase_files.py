import os

dir_path = r'f:\abc\ASTRO\bblog\src\content\blog'
files = os.listdir(dir_path)

for filename in files:
    if filename.endswith('.md') or filename.endswith('.MD'):
        lower_name = filename.lower()
        if filename != lower_name:
            src = os.path.join(dir_path, filename)
            dst = os.path.join(dir_path, lower_name)
            # Windows is case-insensitive but case-preserving. 
            # To rename strictly, usually need intermediate step or move.
            # But let's try direct rename first.
            try:
                os.rename(src, dst)
                print(f'Renamed: {filename} -> {lower_name}')
            except OSError:
                # Use temp name
                temp = os.path.join(dir_path, lower_name + ".tmp")
                os.rename(src, temp)
                os.rename(temp, dst)
                print(f'Renamed (via tmp): {filename} -> {lower_name}')
