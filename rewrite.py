import re
import os

def process_file():
    # Navigate up one level to reach the root directory
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    input_file = os.path.join(base_dir, 'js', 'baccarat.js')
    
    if not os.path.exists(input_file):
        print("File not found, skipping rewrite.")
        return
        
    with open(input_file, 'r', encoding='utf-8') as f:
        code = f.read()

    # Domain / Variable renaming
    code = code.replace('window.app.baccarat = {', 'window.app.dragontiger = {')
    code = code.replace('baccarat-', 'dragontiger-')
    code = code.replace('.baccarat.', '.dragontiger.')
    
    # Placeholders for array identifiers
    code = re.sub(r"'P'", "'__D__'", code)
    code = re.sub(r"'B'", "'__T__'", code)
    code = re.sub(r"'T'", "'__X__'", code)
    code = code.replace("'__D__'", "'D'")
    code = code.replace("'__T__'", "'T'")
    code = code.replace("'__X__'", "'X'")
    
    code = re.sub(r'"P"', '"__D__"', code)
    code = re.sub(r'"B"', '"__T__"', code)
    code = re.sub(r'"T"', '"__X__"', code)
    code = code.replace('"__D__"', '"D"')
    code = code.replace('"__T__"', '"T"')
    code = code.replace('"__X__"', '"X"')

    # Replace classnames
    code = code.replace('bead-p', '__bead_d__')
    code = code.replace('bead-b', '__bead_t__')
    code = code.replace('bead-t', '__bead_x__')
    code = code.replace('__bead_d__', 'bead-d')
    code = code.replace('__bead_t__', 'bead-t')
    code = code.replace('__bead_x__', 'bead-x')

    code = code.replace('hollow-p', '__hollow_d__')
    code = code.replace('hollow-b', '__hollow_t__')
    code = code.replace('hollow-t', '__hollow_x__')
    code = code.replace('__hollow_d__', 'hollow-d')
    code = code.replace('__hollow_t__', 'hollow-t')
    code = code.replace('__hollow_x__', 'hollow-x')

    code = code.replace('Player', 'Dragon').replace('PLAYER', 'DRAGON').replace('player', 'dragon')
    code = code.replace('Banker', 'Tiger').replace('BANKER', 'TIGER').replace('banker', 'tiger')
    
    with open(os.path.join(base_dir, 'js', 'dragontiger.js'), 'w', encoding='utf-8') as f:
        f.write(code)

if __name__ == '__main__':
    process_file()