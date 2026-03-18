export const WHEEL_DATA = {
    0: { color: 'G', hl: 'Z', oe: 'Z', doz: 'Z', col: 'Z', section: 'VOISINS' },
    1: { color: 'R', hl: 'L', oe: 'Odd', doz: 'D1', col: 'C1', section: 'ORPHELINS' },
    2: { color: 'B', hl: 'L', oe: 'Even', doz: 'D1', col: 'C2', section: 'VOISINS' },
    3: { color: 'R', hl: 'L', oe: 'Odd', doz: 'D1', col: 'C3', section: 'VOISINS' },
    4: { color: 'B', hl: 'L', oe: 'Even', doz: 'D1', col: 'C1', section: 'VOISINS' },
    5: { color: 'R', hl: 'L', oe: 'Odd', doz: 'D1', col: 'C2', section: 'TIER' },
    6: { color: 'B', hl: 'L', oe: 'Even', doz: 'D1', col: 'C3', section: 'ORPHELINS' },
    7: { color: 'R', hl: 'L', oe: 'Odd', doz: 'D1', col: 'C1', section: 'VOISINS' },
    8: { color: 'B', hl: 'L', oe: 'Even', doz: 'D1', col: 'C2', section: 'TIER' },
    9: { color: 'R', hl: 'L', oe: 'Odd', doz: 'D1', col: 'C3', section: 'ORPHELINS' },
    10: { color: 'B', hl: 'L', oe: 'Even', doz: 'D1', col: 'C1', section: 'TIER' },
    11: { color: 'B', hl: 'L', oe: 'Odd', doz: 'D1', col: 'C2', section: 'TIER' },
    12: { color: 'R', hl: 'L', oe: 'Even', doz: 'D1', col: 'C3', section: 'VOISINS' },
    13: { color: 'B', hl: 'L', oe: 'Odd', doz: 'D2', col: 'C1', section: 'TIER' },
    14: { color: 'R', hl: 'L', oe: 'Even', doz: 'D2', col: 'C2', section: 'ORPHELINS' },
    15: { color: 'B', hl: 'L', oe: 'Odd', doz: 'D2', col: 'C3', section: 'VOISINS' },
    16: { color: 'R', hl: 'L', oe: 'Even', doz: 'D2', col: 'C1', section: 'TIER' },
    17: { color: 'B', hl: 'L', oe: 'Odd', doz: 'D2', col: 'C2', section: 'ORPHELINS' },
    18: { color: 'R', hl: 'L', oe: 'Even', doz: 'D2', col: 'C3', section: 'VOISINS' },
    19: { color: 'R', hl: 'H', oe: 'Odd', doz: 'D2', col: 'C1', section: 'VOISINS' },
    20: { color: 'B', hl: 'H', oe: 'Even', doz: 'D2', col: 'C2', section: 'ORPHELINS' },
    21: { color: 'R', hl: 'H', oe: 'Odd', doz: 'D2', col: 'C3', section: 'VOISINS' },
    22: { color: 'B', hl: 'H', oe: 'Even', doz: 'D2', col: 'C1', section: 'VOISINS' },
    23: { color: 'R', hl: 'H', oe: 'Odd', doz: 'D2', col: 'C2', section: 'TIER' },
    24: { color: 'B', hl: 'H', oe: 'Even', doz: 'D2', col: 'C3', section: 'TIER' },
    25: { color: 'R', hl: 'H', oe: 'Odd', doz: 'D3', col: 'C1', section: 'VOISINS' },
    26: { color: 'B', hl: 'H', oe: 'Even', doz: 'D3', col: 'C2', section: 'VOISINS' },
    27: { color: 'R', hl: 'H', oe: 'Odd', doz: 'D3', col: 'C3', section: 'TIER' },
    28: { color: 'B', hl: 'H', oe: 'Even', doz: 'D3', col: 'C1', section: 'VOISINS' },
    29: { color: 'B', hl: 'H', oe: 'Odd', doz: 'D3', col: 'C2', section: 'VOISINS' },
    30: { color: 'R', hl: 'H', oe: 'Even', doz: 'D3', col: 'C3', section: 'TIER' },
    31: { color: 'B', hl: 'H', oe: 'Odd', doz: 'D3', col: 'C1', section: 'ORPHELINS' },
    32: { color: 'R', hl: 'H', oe: 'Even', doz: 'D3', col: 'C2', section: 'VOISINS' },
    33: { color: 'B', hl: 'H', oe: 'Odd', doz: 'D3', col: 'C3', section: 'TIER' },
    34: { color: 'R', hl: 'H', oe: 'Even', doz: 'D3', col: 'C1', section: 'ORPHELINS' },
    35: { color: 'B', hl: 'H', oe: 'Odd', doz: 'D3', col: 'C2', section: 'VOISINS' },
    36: { color: 'R', hl: 'H', oe: 'Even', doz: 'D3', col: 'C3', section: 'TIER' }
};

export const PATTERN_CONFIG = [
    { key: 'FLOW', label: 'Flow' },
    { key: 'ZIG-ZAG', label: 'Zig-Zag' },
    { key: 'FALSE BREAK', label: 'False Break' },
    { key: '1-2-3 BUILD', label: '1-2-3 Build' },
    { key: '3-2-1 MIRROR', label: 'Mirror' },
    { key: '1-1-3 BURST', label: '1-1-3 Build' },
    { key: '3-1-1 DOWN', label: '3-1-1 Down' },
    { key: '1-1-2 BUILD', label: '1-1-2 Build', default: false },
    { key: 'GP 2x2', label: 'Group March 2x2', category: 'Block Completion' },
    { key: 'GP 3x3', label: 'Group March 3x3', category: 'Block Completion' },
    { key: 'GP 4x4', label: 'Group March 4x4', category: 'Block Completion' }
];

export const MUTUAL_EXCLUSIONS = {
    'FLOW': 'ZIG-ZAG',
    'ZIG-ZAG': 'FLOW'
};