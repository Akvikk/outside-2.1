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
        try {
            const data = StorageService.load('dt_v4_session');
            if (!data) return;
            if (Array.isArray(data.history)) this.state.history = data.history;
            if (data.stats) this.state.stats = data.stats;
            if (data.patternStats) this.state.patternStats = data.patternStats;
            if (Array.isArray(data.myBetsHistory)) {
                this.state.myBetsHistory = data.myBetsHistory.map(bet =>
                    (bet && bet.status === 'PUSH' && bet.result === 'X')
                        ? { ...bet, status: 'LOSS', net: -0.5 }
                        : bet
                );
            }
            if (Array.isArray(data.goldenBetsHistory)) {
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
        } catch (e) {
            console.error("DragonTiger state corrupted, starting fresh", e);
        }
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
                let netPayout = -1;
                if (isWin) {
                    netPayout = gCand.pred === 'X' ? 8 : 1;
                } else if (isTie) {
                    netPayout = -0.5;
                }
                goldenBetData = { handNum: this.state.history.length + 1, convergence: gCand.rawName, pred: gCand.pred, result: result, status: isWin ? 'WIN' : 'LOSS', net: netPayout };
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
            let netPayout = -1;
            if (isWin) {
                netPayout = this.state.activeLockedBet.pred === 'X' ? 8 : 1;
            } else if (isTie) {
                netPayout = -0.5;
            }
            myBetData = { handNum: this.state.history.length + 1, pattern: this.state.activeLockedBet.pattern, pred: this.state.activeLockedBet.pred, result: result, status: isWin ? 'WIN' : 'LOSS', net: netPayout };
            this.state.myBetsHistory.push(myBetData);
            this.state.activeLockedBet = null;
        }

        this.state.history.push({ val: result, isWin: isGlobalWin, patternList: patternsResolved, myBetResolved: !!myBetData, goldenBetResolved: !!goldenBetData });
        
        if (result === 'D') this.state.stats.p++;
        else if (result === 'T') this.state.stats.b++;
        else if (result === 'X') this.state.stats.t++;
        this.state.stats.total++;

        requestAnimationFrame(() => {
            this.runEngine();
            this.render();
            if (!document.getElementById('dt-stats-modal')?.classList.contains('hidden')) this.renderStats();
            if (!document.getElementById('dt-filters-modal')?.classList.contains('hidden')) this.renderFilters();
            if (!document.getElementById('dt-sim-modal')?.classList.contains('hidden')) this.updateSim();
            if (!document.getElementById('dt-vault-modal')?.classList.contains('hidden')) this.renderVault();
            if (!document.getElementById('dt-log-modal')?.classList.contains('hidden')) this.renderLogs();
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

    // UI Event Handlers
    render() {
        this.ui.roads.renderBeadPlate();
        this.ui.roads.renderBigRoad();
        this.ui.updateShoeStats();
    }
    
    undo() {
        if (this.state.history.length === 0) return;
        const last = this.state.history.pop();
        if (last.val === 'D') this.state.stats.p--;
        if (last.val === 'T') this.state.stats.b--;
        if (last.val === 'X') this.state.stats.t--;
        this.state.stats.total--;
        if (last.patternList) {
            last.patternList.forEach(p => {
                if(this.state.patternStats[p.name]) {
                    if (p.win) this.state.patternStats[p.name].w--; 
                    else this.state.patternStats[p.name].l--;
                }
            });
        }
        if (last.myBetResolved) this.state.myBetsHistory.pop();
        if (last.goldenBetResolved) this.state.goldenBetsHistory.pop();

        this.state.activeLockedBet = null;
        this.state.lastSpokenId = null;

        this.render();
        this.runEngine();
        if (!document.getElementById('dt-stats-modal')?.classList.contains('hidden')) this.renderStats();
        if (!document.getElementById('dt-filters-modal')?.classList.contains('hidden')) this.renderFilters();
        if (!document.getElementById('dt-sim-modal')?.classList.contains('hidden')) this.updateSim();
        if (!document.getElementById('dt-vault-modal')?.classList.contains('hidden')) this.renderVault();
        if (!document.getElementById('dt-log-modal')?.classList.contains('hidden')) this.renderLogs();
        this.saveLocal();
    }

    reset() {
        this.toggleModal('reset-modal-dragontiger');
    }

    executeReset() {
        this.state.history = [];
        this.state.stats = { p: 0, b: 0, t: 0, wins: 0, total: 0 };
        this.state.patternStats = {};
        this.state.myBetsHistory = [];
        this.state.goldenBetsHistory = [];
        this.state.currentPrediction = null;
        this.state.activeLockedBet = null;
        this.state.lastSpokenId = null;

        this.render();
        this.runEngine();

        document.getElementById('dt-stats-modal')?.classList.add('hidden');
        document.getElementById('dt-filters-modal')?.classList.add('hidden');
        document.getElementById('dt-sim-modal')?.classList.add('hidden');
        document.getElementById('dt-vault-modal')?.classList.add('hidden');
        document.getElementById('dt-log-modal')?.classList.add('hidden');
        this.toggleModal('reset-modal-dragontiger'); 

        this.saveLocal();
    }

    toggleModal(id) {
        const el = document.getElementById(id);
        if(el) el.classList.toggle('hidden');
        if (el && !el.classList.contains('hidden')) {
            if (id === 'dt-stats-modal') this.renderStats();
            if (id === 'dt-filters-modal') this.renderFilters();
            if (id === 'dt-sim-modal') this.updateSim();
            if (id === 'dt-vault-modal') this.renderVault();
            if (id === 'dt-log-modal') this.renderLogs();
        }
    }

    handleCardClick(rawName, pred) {
        const now = new Date().getTime();
        if (now - this.state.lastCardTap < 400) {
            if (this.state.activeLockedBet && this.state.activeLockedBet.pattern === rawName && this.state.activeLockedBet.pred === pred) {
                this.state.activeLockedBet = null;
            } else {
                this.state.activeLockedBet = { pattern: rawName, pred: pred };
            }
            this.runEngine(); 
        }
        this.state.lastCardTap = now;
    }

    toggleAllPatternFilters(isChecked) {
        Object.keys(this.state.filters).forEach(k => this.state.filters[k] = isChecked);
        this.renderFilters();
        this.runEngine();
        this.saveLocal();
    }

    togglePatternFilter(name, isChecked) {
        this.state.filters[name] = isChecked;
        this.runEngine();
        this.saveLocal();
    }

    toggleSimConfig() {
        const panel = document.getElementById('dt-sim-config-panel');
        if(panel) {
            if (panel.classList.contains('hidden')) {
                panel.classList.remove('hidden');
                panel.classList.add('flex');
            } else {
                panel.classList.add('hidden');
                panel.classList.remove('flex');
            }
        }
    }

    toggleSimFilter(name, isChecked) {
        this.state.simFilters[name] = isChecked;
        this.updateSim();
        this.saveLocal();
    }

    switchStatsTab(tabId) {
        document.querySelectorAll('.dt-stat-tab').forEach(t => {
            t.classList.remove('active');
            t.setAttribute('data-active', 'false');
        });
        const activeTab = document.getElementById(`dt-tab-${tabId}`);
        if(activeTab) {
            activeTab.classList.add('active');
            activeTab.setAttribute('data-active', 'true');
        }

        ['kpis', 'trend', 'heatmap', 'golden'].forEach(id => {
            const el = document.getElementById(`dt-sec-${id}`);
            if(el) {
                if (id === tabId) { el.classList.remove('hidden'); el.classList.add('flex'); }
                else { el.classList.add('hidden'); el.classList.remove('flex'); }
            }
        });
        if (tabId === 'trend' || tabId === 'golden') this.renderStats();
    }

    renderFilters() { this.ui.modals.renderFilters(); }
    updateSim() { this.ui.modals.updateSim(); }
    renderVault() { this.ui.modals.renderVault(); }
    renderLogs() { this.ui.modals.renderLogs(); }
    renderStats() { this.ui.modals.renderStats(); }
    closePatternLog() { document.getElementById('dt-patternLogModal').style.display = 'none'; }
}