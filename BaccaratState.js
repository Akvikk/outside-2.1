import { PATTERN_CONFIG } from './config.js';

/**
 * BaccaratState: The Single Source of Truth for Baccarat memory.
 * Handles history, road maps, Vault bets, and Golden convergence tracking.
 */
export default class BaccaratState {
    constructor() {
        this.history = [];
        this.stats = { p: 0, b: 0, t: 0, wins: 0, total: 0 };
        this.patternStats = {};
        
        this.currentPrediction = null;
        this.currentHighlightIndices = [];
        this.currentHighlightMap = new Map();
        
        // Rule Settings
        this.commissionExact = true;
        
        // "Vault" (My Bets) State
        this.myBetsHistory = [];
        this.activeLockedBet = null;
        this.lastCardTap = 0;
        
        // "Golden Bets" State
        this.goldenBetsHistory = [];
        
        // Hardware/OS State
        this.lastSpokenId = null;
        
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