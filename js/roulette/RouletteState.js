import { PATTERN_CONFIG } from './config.js';

export default class RouletteState {
    constructor() {
        this.history = [];
        this.pendingBets = [];
        this.backgroundBets = [];
        this.confirmedBetLog = [];

        this.activeFilters = { color: true, hl: true, oe: true, doz: true, col: true };
        PATTERN_CONFIG.forEach(p => { this.activeFilters[p.key] = p.default !== false; });

        this.engineChases = { Dozens: null, Columns: null };
        this.bgEngineChases = { Dozens: null, Columns: null };

        this.engineStatsMaster = this.createStatObject();
        this.engineStats1to1 = this.createStatObject();
        this.engineStats2to1 = this.createStatObject();

        this.userStats = { totalWins: 0, totalLosses: 0, netUnits: 0, currentStreak: 0, totalBets: 0, bankrollHistory: [0] };
        
        this.soundSettings = { predictions: false, wins: false, losses: false };
        this.gridSettings = { hl: true, oe: true, doz: true, col: true };
        this.showTrendIcons = true;
        this.ghostMode = true;
        this.ignoreZero = true;
        this.curvedLayout = true;
        this.bankrollTargets = { enabled: false, profit: 50, loss: 20 };
        this.currentBetsTab = 'trend';
        this.userHeatmapMode = 'PATTERNS';
        this.heatmapMode = 'PATTERNS';
        this.heatmapMetric = 'SHARE';
        this.currentAnalyticsTab = 'master';

        this.simState = {
            mode: 'analytics',
            progression: 'flat',
            filters: { 'Color': true, 'High/Low': true, 'Odd/Even': true, 'Dozens': true, 'Columns': true },
            stats: { net: 0, wins: 0, losses: 0, count: 0, drawdown: 0, history: [0] }
        };
    }

    createStatObject() {
        return { 
            totalWins: 0, totalLosses: 0, netUnits: 0, currentStreak: 0, 
            patternStats: {}, targetStats: {}, categoryStats: {}, bankrollHistory: [0] 
        };
    }

    getRecentHistory(count = 50) { return this.history.length > count ? this.history.slice(-count) : this.history; }
}
