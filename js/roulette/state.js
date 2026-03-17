export const WHEEL_DATA = {
    0: { color: 'green', highLow: null, oddEven: null, dozen: null, column: null },
    1: { color: 'red', highLow: 'low', oddEven: 'odd', dozen: 'd1', column: 'c1' },
    2: { color: 'black', highLow: 'low', oddEven: 'even', dozen: 'd1', column: 'c2' },
    3: { color: 'red', highLow: 'low', oddEven: 'odd', dozen: 'd1', column: 'c3' },
    4: { color: 'black', highLow: 'low', oddEven: 'even', dozen: 'd1', column: 'c1' },
    5: { color: 'red', highLow: 'low', oddEven: 'odd', dozen: 'd1', column: 'c2' },
    6: { color: 'black', highLow: 'low', oddEven: 'even', dozen: 'd1', column: 'c3' },
    7: { color: 'red', highLow: 'low', oddEven: 'odd', dozen: 'd1', column: 'c1' },
    8: { color: 'black', highLow: 'low', oddEven: 'even', dozen: 'd1', column: 'c2' },
    9: { color: 'red', highLow: 'low', oddEven: 'odd', dozen: 'd1', column: 'c3' },
    10: { color: 'black', highLow: 'low', oddEven: 'even', dozen: 'd1', column: 'c1' },
    11: { color: 'black', highLow: 'low', oddEven: 'odd', dozen: 'd1', column: 'c2' },
    12: { color: 'red', highLow: 'low', oddEven: 'even', dozen: 'd1', column: 'c3' },
    13: { color: 'black', highLow: 'low', oddEven: 'odd', dozen: 'd2', column: 'c1' },
    14: { color: 'red', highLow: 'low', oddEven: 'even', dozen: 'd2', column: 'c2' },
    15: { color: 'black', highLow: 'low', oddEven: 'odd', dozen: 'd2', column: 'c3' },
    16: { color: 'red', highLow: 'low', oddEven: 'even', dozen: 'd2', column: 'c1' },
    17: { color: 'black', highLow: 'low', oddEven: 'odd', dozen: 'd2', column: 'c2' },
    18: { color: 'red', highLow: 'low', oddEven: 'even', dozen: 'd2', column: 'c3' },
    19: { color: 'red', highLow: 'high', oddEven: 'odd', dozen: 'd2', column: 'c1' },
    20: { color: 'black', highLow: 'high', oddEven: 'even', dozen: 'd2', column: 'c2' },
    21: { color: 'red', highLow: 'high', oddEven: 'odd', dozen: 'd2', column: 'c3' },
    22: { color: 'black', highLow: 'high', oddEven: 'even', dozen: 'd3', column: 'c1' },
    23: { color: 'red', highLow: 'high', oddEven: 'odd', dozen: 'd3', column: 'c2' },
    24: { color: 'black', highLow: 'high', oddEven: 'even', dozen: 'd3', column: 'c3' },
    25: { color: 'red', highLow: 'high', oddEven: 'odd', dozen: 'd3', column: 'c1' },
    26: { color: 'black', highLow: 'high', oddEven: 'even', dozen: 'd3', column: 'c2' },
    27: { color: 'red', highLow: 'high', oddEven: 'odd', dozen: 'd3', column: 'c3' },
    28: { color: 'black', highLow: 'high', oddEven: 'even', dozen: 'd3', column: 'c1' },
    29: { color: 'black', highLow: 'high', oddEven: 'odd', dozen: 'd3', column: 'c2' },
    30: { color: 'red', highLow: 'high', oddEven: 'even', dozen: 'd3', column: 'c3' },
    31: { color: 'black', highLow: 'high', oddEven: 'odd', dozen: 'd3', column: 'c1' },
    32: { color: 'red', highLow: 'high', oddEven: 'even', dozen: 'd3', column: 'c2' },
    33: { color: 'black', highLow: 'high', oddEven: 'odd', dozen: 'd3', column: 'c3' },
    34: { color: 'red', highLow: 'high', oddEven: 'even', dozen: 'd3', column: 'c1' },
    35: { color: 'black', highLow: 'high', oddEven: 'odd', dozen: 'd3', column: 'c2' },
    36: { color: 'red', highLow: 'high', oddEven: 'even', dozen: 'd3', column: 'c3' },
};

export const PATTERN_CONFIG = [
    { key: 'FLOW', label: 'Flow' },
    { key: 'ZIG-ZAG', label: 'Zig-Zag' },
    { key: 'FALSE BREAK', label: 'False Break' },
    { key: '1-2-3 BUILD', label: '1-2-3 Build' },
    { key: '3-2-1 MIRROR', label: 'Mirror' },
    { key: '1-1-3 BURST', label: '1-1-3 Build' },
    { key: '3-1-1 DOWN', label: '3-1-1 Down' },
    { key: '1-1-2 BUILD', label: '1-1-2 Build' },
    { key: 'GP 2x2', label: 'GP 2x2' },
    { key: 'GP 3x3', label: 'GP 3x3' },
    { key: 'GP 4x4', label: 'GP 4x4' },
];

export default class RouletteState {
    constructor() {
        this.history = [];
        this.bankroll = 0;
        this.activeFilters = {};
        PATTERN_CONFIG.forEach(pattern => {
            this.activeFilters[pattern.key] = true;
        });
        this.stats = {
            totalWins: 0,
            totalLosses: 0,
            netUnits: 0,
        };

        this.loadState();
    }

    saveState() {
        const stateToSave = {
            history: this.history,
            bankroll: this.bankroll,
            activeFilters: this.activeFilters,
            stats: this.stats,
        };
        try {
            localStorage.setItem('outside2_roulette_state', JSON.stringify(stateToSave));
            console.log("State saved to localStorage");
        } catch (error) {
            console.error("Could not save state to localStorage:", error);
        }
    }

    loadState() {
        try {
            const savedStateJSON = localStorage.getItem('outside2_roulette_state');
            if (savedStateJSON) {
                const savedState = JSON.parse(savedStateJSON);

                this.history = savedState.history || [];
                this.bankroll = savedState.bankroll || 0;
                // Ensure all patterns from config are present, defaulting to true
                const loadedFilters = savedState.activeFilters || {};
                PATTERN_CONFIG.forEach(p => {
                    this.activeFilters[p.key] = loadedFilters.hasOwnProperty(p.key) ? loadedFilters[p.key] : true;
                });
                this.stats = savedState.stats || { totalWins: 0, totalLosses: 0, netUnits: 0 };

                console.log("State loaded from localStorage");
            }
        } catch (error) {
            console.error("Could not load state from localStorage:", error);
        }
    }
}
