import { PATTERN_CONFIG } from './config.js';

export default class DragonTigerState {
    constructor() {
        this.history = [];
        // Using p (Dragon), b (Tiger), t (Tie) to maintain compatibility with existing UI bindings
        this.stats = { p: 0, b: 0, t: 0, wins: 0, total: 0 }; 
        this.patternStats = {};
        
        this.currentPrediction = null;
        this.currentHighlightMap = new Map();
        
        // Rule Settings
        this.commissionExact = true;
        
        // Vault (My Bets) State
        this.myBetsHistory = [];
        this.activeLockedBet = null;
        this.lastCardTap = 0;
        
        // Golden Bets State
        this.goldenBetsHistory = [];
        
        // Engine Tracking (One-Shot Pattern Suppression)
        this.firedSignals = {};
        
        // Dynamic UI Filters
        this.filters = {};
        this.simFilters = {};

        // Initialize pattern filters as ON by default
        PATTERN_CONFIG.forEach(p => {
            this.filters[p.key] = true;
            this.simFilters[p.key] = true;
        });
    }

    getRecentHistory(count = 50) {
        return this.history.length > count ? this.history.slice(-count) : this.history;
    }
}