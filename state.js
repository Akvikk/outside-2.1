export default class DragonTigerState {
    constructor() {
        this.history = [];
        this.stats = { p: 0, b: 0, t: 0, wins: 0, total: 0 };
        this.patternStats = {};
        
        this.currentPrediction = null;
        this.currentHighlightIndices = [];
        this.currentHighlightMap = new Map();
        
        this.commissionExact = true;

        this.myBetsHistory = [];
        this.activeLockedBet = null;
        this.lastCardTap = 0;

        this.goldenBetsHistory = [];
        this.lastSpokenId = null;
        this.firedSignals = {};

        const defaultFilters = {
            'FLOW': true, 'ZIG-ZAG': true, 'FALSE BREAK': true,
            '1-2-3': true, '3-2-1': true, '1-1-3': true, '3-1-1 DOWN': true
        };
        this.filters = { ...defaultFilters };
        this.simFilters = { ...defaultFilters };
    }
}