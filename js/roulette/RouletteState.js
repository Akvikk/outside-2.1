import { PATTERN_CONFIG } from './config.js';
import BankrollManager from './engine/BankrollManager.js';

export default class RouletteState {
    constructor() {
        this.history = [];
        this.pendingBets = [];
        this.backgroundBets = [];
        this.confirmedBetLog = [];
        
        this.perimeterLimit = 14;

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

    getPerimeterStats() {
        const subset = this.history.slice(-this.perimeterLimit);
        const stats = {};

        subset.forEach(spin => {
            if (!spin.bets) return;
            spin.bets.forEach(bet => {
                const isWin = BankrollManager.isBetWin(spin, bet.category, bet.target);
                if (!stats[bet.pattern]) {
                    stats[bet.pattern] = { w: 0, l: 0, rate: 0 };
                }
                if (isWin) {
                    stats[bet.pattern].w++;
                } else {
                    stats[bet.pattern].l++;
                }
            });
        });
        for (const pattern in stats) {
            const total = stats[pattern].w + stats[pattern].l;
            stats[pattern].rate = total > 0 ? Math.round((stats[pattern].w / total) * 100) : 0;
        }
        return stats;
    }
}