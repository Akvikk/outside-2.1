import os

with open("css/styles.css", "r", encoding="utf-8-sig") as f:
    css_content = f.read()

def extract_css_blocks(css):
    blocks = []
    current_block = ""
    brace_level = 0
    in_comment = False
    in_string = False
    string_char = ''
    
    i = 0
    while i < len(css):
        c = css[i]
        
        # Handle comments
        if not in_string and c == '/' and i + 1 < len(css) and css[i+1] == '*':
            in_comment = True
            current_block += c
            css_next = css[i+1]
            current_block += css_next
            i += 2
            continue
        elif in_comment and c == '*' and i + 1 < len(css) and css[i+1] == '/':
            in_comment = False
            current_block += c
            css_next = css[i+1]
            current_block += css_next
            i += 2
            continue
            
        if in_comment:
            current_block += c
            i += 1
            continue
            
        # Handle strings
        if c in ("'", '"') and not in_string:
            in_string = True
            string_char = c
        elif c == string_char and in_string and (i == 0 or css[i-1] != '\\'):
            in_string = False
            
        current_block += c
        
        if not in_string:
            if c == '{':
                brace_level += 1
            elif c == '}':
                brace_level -= 1
                if brace_level == 0:
                    blocks.append(current_block)
                    current_block = ""
                    
        i += 1
        
    if current_block.strip():
        blocks.append(current_block)
        
    return blocks

blocks = extract_css_blocks(css_content)

categorized = {
    "variables.css": [],
    "base.css": [],
    "animations.css": [],
    "themes.css": [],
    "tables.css": [],
    "layout.css": [],
    "components.css": []
}

def determine_category(block):
    lower_block = block.lower()
    
    if ":root" in lower_block: return "variables.css"
    if "@keyframes" in lower_block: return "animations.css"
    
    if "body.theme-" in lower_block or ".style-" in lower_block or ".cat-" in lower_block or ".pred-card-dragon::after" in lower_block or ".pred-card-tiger::after" in lower_block or "#cinematic-overlay .glow" in lower_block:
        return "themes.css"
        
    if "@media" in lower_block or ".glass-surface" in lower_block or ".grid-item" in lower_block or ".modal-" in lower_block or ".chart-" in lower_block or ".road-" in lower_block or "#big-road" in lower_block or "#dt-big-road" in lower_block or "#bead-plate" in lower_block or "stats-modal" in lower_block:
        return "layout.css"
        
    if ".data-" in lower_block or ".header-cell" in lower_block or "#th-" in lower_block or "table-fixed" in lower_block or "border-separate" in lower_block or "body[data-layout" in lower_block:
        return "tables.css"
        
    if "body.app-bg" in lower_block or "::-webkit-scrollbar" in lower_block or ".digital-font" in lower_block or "html {" in lower_block or "html," in lower_block:
        return "base.css"

    if ".blob" in lower_block or ".cinematic" in lower_block or "sig-" in lower_block or "reassemble" in lower_block or "power-on" in lower_block or ".anim-" in lower_block:
        return "animations.css"

    return "components.css" # Default fallback

for b in blocks:
    if b.strip():
        cat = determine_category(b)
        categorized[cat].append(b)

for cat, content_blocks in categorized.items():
    with open(f"css/{cat}", "w", encoding="utf-8") as f:
        f.write("".join(content_blocks))

import_statements = "\n".join([f'@import url("{cat}");' for cat in categorized.keys()])

with open("css/styles.css", "w", encoding="utf-8") as f:
    f.write(import_statements + "\n")
    
print("CSS Refactored successfully.")
