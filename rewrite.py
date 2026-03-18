import re
import os

def process_file():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    with open(os.path.join(base_dir, 'js', 'baccarat.js'), 'r', encoding='utf-8') as f:
        code = f.read()

    # Domain / Variable renaming
    code = code.replace('window.app.baccarat = {', 'window.app.dragontiger = {')
    code = code.replace('baccarat-', 'dragontiger-')
    code = code.replace('.baccarat.', '.dragontiger.')
    
    # We must be careful mapping:
    # Baccarat P (Player) -> DragonTiger D (Dragon)
    # Baccarat B (Banker) -> DragonTiger T (Tiger)
    # Baccarat T (Tie)    -> DragonTiger X (Tie)
    
    # Let's replace the string literals first using regex word boundaries to avoid affecting variable names like "Tie" or CSS classes, unless intended.
    # Actually, the internal logic for the JS arrays uses: 'P', 'B', 'T'
    # We will do a safe token replacement:
    
    # Function to replace exact matches in quotes
    code = re.sub(r"'P'", "'D'", code)
    code = re.sub(r"'B'", "'T'", code)
    code = re.sub(r"'T'", "'X'", code)  # Wait, wait, if I replace 'B' -> 'T' first, then 'T' -> 'X', Tiger becomes Tie!
    
    # Let's use placeholders!
    code = re.sub(r"'P'", "'__D__'", code)
    code = re.sub(r"'B'", "'__T__'", code)
    code = re.sub(r"'T'", "'__X__'", code)
    code = code.replace("'__D__'", "'D'")
    code = code.replace("'__T__'", "'T'")
    code = code.replace("'__X__'", "'X'")
    
    # Same for double quotes if any
    code = re.sub(r'"P"', '"__D__"', code)
    code = re.sub(r'"B"', '"__T__"', code)
    code = re.sub(r'"T"', '"__X__"', code)
    code = code.replace('"__D__"', '"D"')
    code = code.replace('"__T__"', '"T"')
    code = code.replace('"__X__"', '"X"')

    # Replace classnames: "bead-p" -> "bead-d" etc.
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

    # Replace English words
    code = code.replace('Player', 'Dragon').replace('PLAYER', 'DRAGON').replace('player', 'dragon')
    code = code.replace('Banker', 'Tiger').replace('BANKER', 'TIGER').replace('banker', 'tiger')
    # Tie remains Tie

    # Replace Hex colors
    # Baccarat Player  = #0A84FF (Blue) -> Dragon = #FF453A (Red)
    # Baccarat Banker  = #FF453A (Red)  -> Tiger = #FFD60A (Yellow)
    # Baccarat Tie     = #30D158 (Green) -> Tie = #30D158 (Green)
    
    code = code.replace('#0A84FF', '__DRAGON_RED__')
    code = code.replace('#FF453A', '__TIGER_YELLOW__')
    code = code.replace('__DRAGON_RED__', '#FF453A')
    code = code.replace('__TIGER_YELLOW__', '#FFD60A')
    
    # Wait, the payout logic:
    # Dragon tiger payouts are 1:1, 1:1, Tie is 8:1 but Returns 50% bet on Dragon/Tiger.
    # We will manually adjust the `calculateProfits` function after this script runs, but let's try to patch it here if possible.
    # In Baccarat `calculateProfits`:
    # if (h.val === 'T') {
    #     if (h.bet === 'T') profit += h.amount * 8; // Tie bet won
    #     // P/B bets usually push on Tie, so profit doesn't change
    # } else if (h.bet === 'P' && h.val === 'P') profit += h.amount;
    # else if (h.bet === 'B' && h.val === 'B') profit += h.amount * 0.95;
    
    # Let's write the modified file
    with open(os.path.join(base_dir, 'js', 'dragontiger.js'), 'w', encoding='utf-8') as f:
        f.write(code)
    
    print("Done generating dragontiger.js")

if __name__ == '__main__':
    process_file()
