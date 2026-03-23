import os

html = open('index.html', encoding='utf-8').read()

def extract_tag(html_str, tag_id):
    start = html_str.find(f'id="{tag_id}"')
    if start == -1: return html_str, ''
    start_tag = html_str.rfind('<div', 0, start)
    if start_tag == -1: return html_str, ''
    count = 0
    i = start_tag
    while i < len(html_str):
        if html_str.startswith('<div', i):
            count += 1
        elif html_str.startswith('</div', i):
            count -= 1
            if count == 0:
                end_tag = html_str.find('>', i) + 1
                ext = html_str[start_tag:end_tag]
                new_h = html_str[:start_tag] + html_str[end_tag:]
                return new_h, ext
        i += 1
    return html_str, ''

h = html
h, rv = extract_tag(h, 'roulette-view')
h, bv = extract_tag(h, 'baccarat-view')
h, dtv = extract_tag(h, 'dragontiger-view')

# Extract large modals
modals = ''
modal_ids = [
    'resetModal', 'switchModeModal', 'analyticsModal', 'betsModal', 
    'filters-modal', 'patternLogModal', 'dt-filters-modal', 'dt-vault-modal', 
    'dt-stats-modal', 'stats-modal', 'vault-modal'
]
for m in modal_ids:
    h, ext = extract_tag(h, m)
    modals += ext + '\n'

os.makedirs('components', exist_ok=True)
with open('components/roulette.html', 'w', encoding='utf-8') as f:
    f.write(rv)
with open('components/baccarat.html', 'w', encoding='utf-8') as f:
    f.write(bv)
with open('components/dragontiger.html', 'w', encoding='utf-8') as f:
    f.write(dtv)
with open('components/modals.html', 'w', encoding='utf-8') as f:
    f.write(modals)

# Remove the old extraction markers if any and add injection points
inj = '''
    <!-- DYNAMIC COMPONENTS INJECTED HERE -->
    <div id="roulette-container"></div>
    <div id="baccarat-container"></div>
    <div id="dragontiger-container"></div>
    <div id="modals-container"></div>
'''

# We inject before </body>
idx = h.rfind('</body>')
if idx != -1:
    h = h[:idx] + inj + h[idx:]

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(h)

print('Extraction complete. Components saved to components/ folder.')
