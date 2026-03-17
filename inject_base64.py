import base64
import re

with open('Tiger.jpg', 'rb') as f:
    tiger_b64 = base64.b64encode(f.read()).decode('utf-8')

with open('dragon.jpg', 'rb') as f:
    dragon_b64 = base64.b64encode(f.read()).decode('utf-8')

css_file = 'css/styles.css'
with open(css_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace Dragon Data URI
content = re.sub(
    r'/\*\s*Reliable(:? SVG)? Data URI for Dragon Head(:?(?:\s*\(White\)))?\s*\*/\n\s*background-image:\s*url\([^)]+\);',
    f'/* Reliable Data URI for Dragon Head */\n            background-image: url("data:image/jpeg;base64,{dragon_b64}");',
    content
)

# Replace Tiger Data URI
content = re.sub(
    r'/\*\s*Reliable(:? SVG)? Data URI for Tiger Head(:?(?:\s*\(White\)))?\s*\*/\n\s*background-image:\s*url\([^)]+\);',
    f'/* Reliable Data URI for Tiger Head */\n            background-image: url("data:image/jpeg;base64,{tiger_b64}");',
    content
)

# Let's fix the background sizing too
content = content.replace('background-size: 50%;', 'background-size: contain;')
content = content.replace('background-position: -20px center;', 'background-position: left center;')
content = content.replace('background-position: 110% center;', 'background-position: right center;')


with open(css_file, 'w', encoding='utf-8') as f:
    f.write(content)

print('Replaced inline images in CSS.')
