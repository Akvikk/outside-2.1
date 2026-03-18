import re
import os

base_dir = os.path.dirname(os.path.abspath(__file__))
files = [
    os.path.join(base_dir, "js", "baccarat.js"),
    os.path.join(base_dir, "js", "dragontiger.js")
]

def remove_function(html_text, func_name, regex):
    # Regex to capture the function and its body including nested braces
    new_text, count = re.subn(regex, '', html_text, flags=re.MULTILINE|re.DOTALL)
    print(f"Removed {func_name} {count} times")
    return new_text

for filepath in files:
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # We can match functions like `    closeMenuOutside(e) { ... },`
    # Since regex for balanced curly braces is hard in Python, we'll use a hacky approach for known lengths,
    # OR better yet just replace known large strings.
    
    # Or I can just write a simple bracket matching parser.
    def extract_func(text, func_name_decl):
        idx = text.find(func_name_decl)
        if idx == -1: return text
        
        # Find the first {
        start_brace = text.find('{', idx)
        if start_brace == -1: return text
        
        open_braces = 0
        end_brace = -1
        for i in range(start_brace, len(text)):
            if text[i] == '{':
                open_braces += 1
            elif text[i] == '}':
                open_braces -= 1
                if open_braces == 0:
                    end_brace = i
                    break
                    
        if end_brace != -1:
            # Need to also remove the trailing comma and newline
            end_idx = end_brace + 1
            while end_idx < len(text) and text[end_idx] in ['\n', '\r', ' ', ',']:
                end_idx += 1
                if text[end_idx-1] == ',': break # only eat up to the comma
            
            return text[:idx] + text[end_idx:]
        return text

    content = extract_func(content, "    closeMenuOutside(e) {")
    content = extract_func(content, "    toggleSimConfig() {")
    content = extract_func(content, "    switchStatsTab(tabId) {")
    content = extract_func(content, "    toggleModal(id) {")
    content = extract_func(content, "    calculateProgression(isWin, isPush, currentBet, strategy, seqIndex) {")
    content = extract_func(content, "    drawTrendGraph(data, winCount, lossCount, containerId, colorPos, colorNeg, isSim = false, isGolden = false) {")
    
    # Also strip the trailing closure if we want to append Object.assign
    # We'll just do it purely in python
    if "Object.assign(app." not in content:
        # Before the final `};` we can't do Object.assign, it has to be after.
        content += f"\n\n// Mixin core routines\nObject.assign(app.{'baccarat' if 'baccarat' in filepath else 'dragontiger'}, GameEngineCore);\n"

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)

print("Extraction script complete.")
