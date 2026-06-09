import os
base = os.path.join(os.path.dirname(__file__), '..', 'src', 'assets', 'tech')

for fname in ['Arduino.svg', 'ESP32.svg']:
    path = os.path.join(base, fname)
    with open(path, 'r') as f:
        content = f.read()
    content = content.replace('<svg fill=', '<svg width="128" height="128" fill=')
    with open(path, 'w') as f:
        f.write(content)
    print(f"Fixed {fname}")
