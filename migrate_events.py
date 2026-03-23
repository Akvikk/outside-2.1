import os
import re

files_to_process = [
    'index.html',
    'components/roulette.html',
    'components/baccarat.html',
    'components/dragontiger.html',
    'components/modals.html'
]

events_js = "// Auto-generated Event Bindings\n// This file maps stripped inline handlers to their elements\n\nexport default function bindExtractedEvents() {\n"
counter = 1

for filepath in files_to_process:
    if not os.path.exists(filepath): continue
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # We will search for onclick="..." and onchange="..." using regex.
    # We must be careful about nested quotes.
    # Pattern: \s(on[a-z]+)="([^"]*)"
    
    def replacer(match):
        global counter, events_js
        full_match = match.group(0)
        attr = match.group(1) # onclick, onchange, etc.
        code = match.group(2) # the JS code
        
        # We need to see if this element has an ID.
        # This regex replace acts on the attribute. We can't easily see the whole tag,
        # but we can just inject a unique class or ID if we regex the whole tag.
        return full_match

    # A better approach: Regex to find all tags with on* attributes
    # <tag ... onxxx="..." ...>
    # Since HTML parsing with regex is hard, we look for:
    # (<[a-zA-Z0-9-]+[^>]*?)\s+(on[a-z]+)="([^"]*)"([^>]*>)
    # This might match partially. Let's do it safely:
    
    # Let's find all occurrences of : on[a-z]+="[^"]*"
    # and replace them with `data-auto-id="..."` and add to events_js
    
    # To properly modify the tags, we iterate over matches of `\son[a-z]+="[^"]*"`
    # Wait, we need to inject an ID. If we just add an ID attribute right where the on* attribute was:
    
    import uuid
    
    def attribute_replacer(match):
        global counter, events_js
        event_type = match.group(1)[2:] # remove "on", e.g. "click"
        code = match.group(2)
        
        auto_id = f"evt-bind-{uuid.uuid4().hex[:8]}"
        
        # Instead of replacing the ID of the element, we just inject our generated ID
        # Wait, what if it already has an ID? Generating a second ID is invalid HTML!
        # It's safer to use a data attribute for binding!
        
        # We replace `onclick="xyz"` with `data-evt-bind="evt-bind-123"`
        
        events_js += f"""
    document.querySelectorAll('[data-evt-bind="{auto_id}"]').forEach(el => {{
        el.addEventListener('{event_type}', function(event) {{
            {code}
        }});
    }});
"""
        return f' data-evt-bind="{auto_id}"'

    new_content = re.sub(r'\s(on[a-z]+)="([^"]*)"', attribute_replacer, content)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)

events_js += "}\n"

with open('js/events.js', 'w', encoding='utf-8') as f:
    f.write(events_js)

print('Event extraction complete. Handlers extracted implicitly to js/events.js')
