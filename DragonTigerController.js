import DragonTigerState from './DragonTigerState.js';
import PatternScanner from './engine/PatternScanner.js';
import ConvergenceCalc from './engine/ConvergenceCalc.js';
import DragonTigerUI from './ui/DragonTigerUI.js';
import StorageService from '../shared/StorageService.js';
import AudioService from '../shared/AudioService.js';

export default class DragonTigerController {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.state = new DragonTigerState();
        this.ui = new DragonTigerUI(this, this.state);
        this.audio = new AudioService();
    }

    loadLocal() {
        const data = StorageService.load('dt_v4_session');
        if (!data) return;
        if (data.history) this.state.history = data.history;
        if (data.stats) this.state.stats = data.stats;
        if (data.patternStats) this.state.patternStats = data.patternStats;
        if (data.myBetsHistory) {
            this.state.myBetsHistory = data.myBetsHistory.map(bet =>
                (bet && bet.status === 'PUSH' && bet.result === 'X')
                    ? { ...bet, status: 'LOSS', net: -0.5 }
                    : bet
            );
        }
        if (data.goldenBetsHistory) {
            this.state.goldenBetsHistory = data.goldenBetsHistory.map(bet =>
                (bet && bet.status === 'PUSH' && bet.result === 'X')
                    ? { ...bet, status: 'LOSS', net: -0.5 }
                    : bet
            );
        }
        if (data.filters) this.state.filters = data.filters;
        if (data.simFilters) this.state.simFilters = data.simFilters;
        if (data.commissionExact !== undefined) this.state.commissionExact = data.commissionExact;
        
        const cToggle = document.getElementById('dt-comm-toggle');
        if(cToggle) cToggle.checked = this.state.commissionExact;
    }

    saveLocal() {
        StorageService.save('dt_v4_session', {
            history: this.state.history.slice(-2000), stats: this.state.stats, patternStats: this.state.patternStats,
            myBetsHistory: this.state.myBetsHistory.slice(-2000), goldenBetsHistory: this.state.goldenBetsHistory.slice(-2000),
            filters: this.state.filters, simFilters: this.state.simFilters, commissionExact: this.state.commissionExact
        });
    }

    input(result) {
        if (navigator.vibrate) navigator.vibrate(10);
        let patternsResolved = [], isGlobalWin = false, goldenBetData = null;

        if (this.state.currentPrediction?.candidates) {
            const gCand = this.state.currentPrediction.candidates.find(c => c.isGolden);
            if (gCand) {
                const isTie = result === 'X';
                const isWin = gCand.pred === result;
                goldenBetData = { handNum: this.state.history.length + 1, convergence: gCand.rawName, pred: gCand.pred, result: result, status: isWin ? 'WIN' : 'LOSS', net: isWin ? 1 : (isTie ? -0.5 : -1) };
                this.state.goldenBetsHistory.push(goldenBetData);
            }
        }

        const processSeq = (document.getElementById('dt-toggle-ignore-ties')?.checked) ? this.state.history.map((h, i) => ({ val: h.val, index: i })).filter(h => h.val !== 'X') : this.state.history.map((h, i) => ({ val: h.val, index: i }));
        if (processSeq.length >= 3) {
            const isTieResult = result === 'X';
            let cands = [...PatternScanner.scan(processSeq, "Vertical"), ...PatternScanner.scan(processSeq.filter(h => h.index % 6 === this.state.history.length % 6), "Horizontal")];
            const seen = new Set();
            cands.forEach(c => {
                if (!seen.has(`${c.pred}-${c.name}`)) {
                    seen.add(`${c.pred}-${c.name}`);
                    const isWin = c.pred === result;
                    if(!this.state.patternStats[c.rawName]) this.state.patternStats[c.rawName] = {w:0, l:0};
                    isWin ? this.state.patternStats[c.rawName].w++ : this.state.patternStats[c.rawName].l++;
                    patternsResolved.push({ name: c.rawName, win: isWin, pred: c.pred, tie: isTieResult });
                    if (isWin) isGlobalWin = true;
                }
            });
        }

        let myBetData = null;
        if (this.state.activeLockedBet) {
            const isTie = result === 'X', isWin = this.state.activeLockedBet.pred === result;
            myBetData = { handNum: this.state.history.length + 1, pattern: this.state.activeLockedBet.pattern, pred: this.state.activeLockedBet.pred, result: result, status: isWin ? 'WIN' : 'LOSS', net: isWin ? 1 : (isTie ? -0.5 : -1) };
            this.state.myBetsHistory.push(myBetData);
            this.state.activeLockedBet = null;
        }

        this.state.history.push({ val: result, isWin: isGlobalWin, patternList: patternsResolved, myBetResolved: !!myBetData, goldenBetResolved: !!goldenBetData });
        this.state.stats[result.toLowerCase()]++; this.state.stats.total++;

        requestAnimationFrame(() => {
            this.runEngine();
            this.ui.roads.renderBeadPlate(); this.ui.roads.renderBigRoad(); this.ui.updateShoeStats();
            this.saveLocal();
        });
    }

    runEngine() {
        const processSeq = (document.getElementById('dt-toggle-ignore-ties')?.checked) ? this.state.history.map((h, i) => ({ val: h.val, index: i })).filter(h => h.val !== 'X') : this.state.history.map((h, i) => ({ val: h.val, index: i }));
        if (processSeq.length < 3) { this.state.currentHighlightMap.clear(); this.state.currentPrediction = null; this.ui.dashboard.renderEmpty('Analyzing data...'); return; }

        let cands = [...PatternScanner.scan(processSeq, "Vertical"), ...PatternScanner.scan(processSeq.filter(h => h.index % 6 === this.state.history.length % 6), "Horizontal")];
        if (cands.length === 0) { this.state.currentHighlightMap.clear(); this.state.currentPrediction = null; this.ui.dashboard.renderEmpty('Scanning for patterns...'); return; }

        const unique = []; const seen = new Set();
        cands.forEach(c => { if (!seen.has(`${c.pred}-${c.name}`)) { seen.add(`${c.pred}-${c.name}`); unique.push(c); } });
        let active = unique.filter(c => this.state.filters[c.rawName] !== false);

        const oneshots = new Set(['FLOW', 'ZIG-ZAG']);
        active = active.filter(c => {
            if (!oneshots.has(c.rawName)) return true;
            const k = `${c.rawName}|${c.name.includes('Horizontal')?'H':'V'}`;
            if (this.state.firedSignals[k] && !(this.state.activeLockedBet && this.state.activeLockedBet.pattern === c.rawName)) return false;
            this.state.firedSignals[k] = true; return true;
        });

        active = ConvergenceCalc.calculate(active);
        active.sort((a,b) => { if(a.isGolden && !b.isGolden) return -1; if(!a.isGolden && b.isGolden) return 1; const wA=this.state.patternStats[a.rawName]||{w:0,l:0}; const wB=this.state.patternStats[b.rawName]||{w:0,l:0}; return (wB.w/(wB.w+wB.l||1)) - (wA.w/(wA.w+wA.l||1)); });

        this.state.currentPrediction = { candidates: active };
        this.state.currentHighlightMap.clear(); active.forEach(c => c.indices.forEach(idx => this.state.currentHighlightMap.set(idx, 'signal')));
        this.ui.dashboard.renderCards(active);
    }
}