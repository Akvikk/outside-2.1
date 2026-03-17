import re
import os

base_dir = os.path.dirname(os.path.abspath(__file__))
file_path = os.path.join(base_dir, "index.html")

with open(file_path, "r", encoding="utf-8") as f:
    html = f.read()

# Large Modal Container
html = re.sub(
    r'class="glass-panel glass-surface tool-container w-11/12 max-w-4xl max-h-\[90dvh\] rounded-3xl shadow-2xl flex flex-col anim-slide-up overflow-hidden border border-white/20"',
    r'class="glass-panel glass-surface modal-content-lg anim-slide-up"',
    html,
    flags=re.MULTILINE
)

# Small Modal Container
html = re.sub(
    r'class="glass-panel glass-surface w-\[90vw\] max-w-80 rounded-2xl shadow-2xl flex flex-col anim-slide-up overflow-hidden border border-white/20"',
    r'class="glass-panel glass-surface modal-content-sm anim-slide-up"',
    html,
    flags=re.MULTILINE
)

# Modal Header
html = re.sub(
    r'class="p-5 bg-white/5 border-b border-white/10 flex justify-between items-center shrink-0"',
    r'class="modal-header-lg"',
    html,
    flags=re.MULTILINE
)
html = re.sub(
    r'class="p-3 bg-white/5 border-b border-white/10 flex justify-between items-center shrink-0"',
    r'class="modal-header-sm"',
    html,
    flags=re.MULTILINE
)

# Close Buttons
html = re.sub(
    r'class="text-gray-500 hover:text-white text-2xl min-w-\[44px\] min-h-\[44px\] flex items-center justify-center rounded-lg"',
    r'class="btn-close-lg"',
    html,
    flags=re.MULTILINE
)
html = re.sub(
    r'class="text-gray-500 hover:text-white"',
    r'class="btn-close-sm"',
    html,
    flags=re.MULTILINE
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(html)

print("HTML refactored successfully.")
