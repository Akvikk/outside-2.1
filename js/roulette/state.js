export default class RouletteState {
    constructor() {
        // Static Configuration
        this.wheelData = {
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

        this.PATTERN_CONFIG = [
            { key: 'FLOW', label: 'Flow' },
            { key: 'ZIG-ZAG', label: 'Zig-Zag' },
            { key: 'FALSE BREAK', label: 'False Break' },
            { key: '1-2-3 BUILD', label: '1-2-3 Build' },
            { key: '3-2-1 MIRROR', label: 'Mirror' },
            { key: '1-1-3 BURST', label: '1-1-3 Build' },
            { key: '3-1-1 DOWN', label: '3-1-1 Down' },
            { key: '1-1-2 BUILD', label: '1-1-2 Build', default: false }
        ];

        this.MUTUAL_EXCLUSIONS = {
            '1-1-2 BUILD': '1-1-3 BURST',
            '1-1-3 BURST': '1-1-2 BUILD'
        };

        // Live State
        this.history = [];
        this.pendingBets = [];
        this.backgroundBets = [];
        this.confirmedBetLog = [];
        this.engineChases = { Dozens: null, Columns: null };
        this.bgEngineChases = { Dozens: null, Columns: null };

        // Tracking
        this.engineStatsMaster = this.createStatObject();
        this.engineStats1to1 = this.createStatObject();
        this.engineStats2to1 = this.createStatObject();
        this.userStats = { totalWins: 0, totalLosses: 0, netUnits: 0, currentStreak: 0, totalBets: 0, bankrollHistory: [0] };

        // Toggles & Settings
        this.activeFilters = { color: true, hl: true, oe: true, doz: true, col: true };
        this.ignoreZero = true;
        this.ghostMode = true; // Hardcoded on
    }

    createStatObject() {
        return { totalWins: 0, totalLosses: 0, netUnits: 0, currentStreak: 0, patternStats: {}, targetStats: {}, categoryStats: {}, bankrollHistory: [0] };
    }

    getRecentHistory(count = 50) {
        return this.history.length > count ? this.history.slice(-count) : this.history;
    }
}