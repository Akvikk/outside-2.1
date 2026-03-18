import RouletteState from './RouletteState.js';
import PatternScanner from './engine/PatternScanner.js';
import BankrollManager from './engine/BankrollManager.js';
import RouletteUI from './ui/RouletteUI.js';
import StorageService from '../shared/StorageService.js';
import AudioService from '../shared/AudioService.js';
import { WHEEL_DATA, PATTERN_CONFIG, MUTUAL_EXCLUSIONS } from './config.js';

export default class RouletteController {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.state = new RouletteState();
        this.scanner = new PatternScanner(this.state);
        this.ui = new RouletteUI(this, this.state);
        this.audio = new AudioService();
        this.performSave = null;
    }

    debounce(func, wait) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    }

    _performSaveLogic() {
        const data = {
            history: this.state.getRecentHistory(2000), pendingBets: this.state.pendingBets, backgroundBets: this.state.backgroundBets, 
            confirmedBetLog: this.state.confirmedBetLog.length > 2000 ? this.state.confirmedBetLog.slice(-2000) : this.state.confirmedBetLog,
            activeFilters: this.state.activeFilters, simState: this.state.simState, engineChases: this.state.engineChases, bgEngineChases: this.state.bgEngineChases,
            engineStatsMaster: this.state.engineStatsMaster, engineStats1to1: this.state.engineStats1to1, engineStats2to1: this.state.engineStats2to1, userStats: this.state.userStats, 
            showTrendIcons: this.state.showTrendIcons, ghostMode: this.state.ghostMode, ignoreZero: this.state.ignoreZero, curvedLayout: this.state.curvedLayout, 
            bankrollTargets: this.state.bankrollTargets, gridSettings: this.state.gridSettings, soundSettings: this.state.soundSettings,
            perimeterLimit: this.state.perimeterLimit
        };
        StorageService.save('roulette_session', data);
        const icon = document.getElementById('saveIndicator');
        if (icon) { icon.classList.remove('text-yellow-500'); icon.classList.add('save-flash'); setTimeout(() => icon.classList.remove('save-flash'), 500); }
    }

    saveLocal() {
        const icon = document.getElementById('saveIndicator');
        if (icon) { icon.classList.remove('save-flash'); icon.classList.add('text-yellow-500'); }
        if (!this.performSave) this.performSave = this.debounce(this._performSaveLogic.bind(this), 1000);
        this.performSave();
    }

    loadLocal() {
        const data = StorageService.load('roulette_session');
        if (data) {
            try {
                this.state.history = data.history || []; this.state.pendingBets = data.pendingBets || [];
                this.state.backgroundBets = data.backgroundBets || []; this.state.confirmedBetLog = data.confirmedBetLog || [];
                if (data.activeFilters) Object.assign(this.state.activeFilters, data.activeFilters);
                if (data.engineChases) Object.assign(this.state.engineChases, data.engineChases);
                if (data.bgEngineChases) Object.assign(this.state.bgEngineChases, data.bgEngineChases);
                this.recalculateAllStats();
                if (data.userStats) Object.assign(this.state.userStats, data.userStats);
                if (data.soundSettings) Object.assign(this.state.soundSettings, data.soundSettings);
                if (data.showTrendIcons !== undefined) this.state.showTrendIcons = data.showTrendIcons;
                if (data.ignoreZero !== undefined) this.state.ignoreZero = data.ignoreZero;
                this.state.ghostMode = true; // Enforced background running
                if (data.curvedLayout !== undefined) this.state.curvedLayout = data.curvedLayout;
                if (data.gridSettings) this.state.gridSettings = data.gridSettings;
                if (data.bankrollTargets) Object.assign(this.state.bankrollTargets, data.bankrollTargets);
                if (data.perimeterLimit !== undefined) {
                    this.state.perimeterLimit = data.perimeterLimit;
                    const slider = document.getElementById('perimeter-slider');
                    const numInput = document.getElementById('perimeter-input');
                    if (slider) slider.value = data.perimeterLimit;
                    if (numInput) numInput.value = data.perimeterLimit;
                }

                this.reRenderHistory();
                this.ui.renderDashboard();
            } catch (e) { console.error('Load failed:', e); }
        }
    }

    handleSpin(manualVal = null, suppressRender = false) {
        const inputField = document.getElementById('spinInput');
        let val = manualVal !== null ? parseInt(manualVal) : parseInt(inputField?.value);
        if (navigator.vibrate) navigator.vibrate(10);

        if (isNaN(val) || val < 0 || val > 36) {
            if (manualVal === null && inputField) {
                inputField.classList.add('input-error');
                if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
                setTimeout(() => { inputField.classList.remove('input-error'); inputField.value = ''; inputField.focus(); }, 300);
            }
            return;
        }

        try {
            const data = WHEEL_DATA[val];
            const spinObj = { id: Date.now(), spinNumber: this.state.history.length + 1, val: val, ...data };
            spinObj.bets = [...this.state.backgroundBets];

            const userResults = BankrollManager.resolveUserBets(this.state, spinObj);
            BankrollManager.resolveBackgroundBets(this.state, spinObj);

            this.mutateChaseSet(this.state.engineChases, spinObj);
            this.mutateChaseSet(this.state.bgEngineChases, spinObj);

            this.state.history.push(spinObj);
            this.ui.renderRow(spinObj);
            this.checkNewChases();

            const alerts = this.scanner.scanPatterns(false, this.state.engineChases).filter(a => this.state.activeFilters[a.patternName] !== false);
            this.state.pendingBets = alerts.map((alert, index) => ({
                id: index, triggerSpin: spinObj.spinNumber, pattern: alert.patternName, category: alert.category, target: alert.targetToken, sub: alert.sub, confirmed: false
            }));

            if (userResults.wins > 0) this.audio.playWin(this.state.soundSettings.wins);
            else if (userResults.losses > 0) this.audio.playLoss(this.state.soundSettings.losses);
            else if (this.state.pendingBets.length > 0) this.audio.playPrediction(this.state.soundSettings.predictions);

            const bgAlerts = this.scanner.scanPatterns(true, this.state.bgEngineChases);
            this.state.backgroundBets = bgAlerts.map(alert => ({ pattern: alert.patternName, category: alert.category, target: alert.targetToken, sub: alert.sub }));

            if (!suppressRender) {
                this.ui.renderDashboard();
                if (inputField) { inputField.value = ''; inputField.focus(); }
                setTimeout(() => { const anchor = document.getElementById('scrollAnchor'); if (anchor) anchor.scrollIntoView({ behavior: 'smooth' }); }, 50);
                if (document.getElementById('analyticsModal')?.style.display === 'flex') this.ui.updateAnalyticsUI();
                if (document.getElementById('betsModal')?.style.display === 'flex') this.ui.updateActualBetsUI();
                this.saveLocal();
            }
        } catch (e) {
            this.ui.showToast("Engine Error: " + e.message, "error");
        }
    }

    mutateChaseSet(chasesObj, currentSpin) {
        if (chasesObj['Dozens']) { if (currentSpin.doz === chasesObj['Dozens'].target) chasesObj['Dozens'] = null; else { chasesObj['Dozens'].attemptsLeft--; if (chasesObj['Dozens'].attemptsLeft <= 0) chasesObj['Dozens'] = null; } }
        if (chasesObj['Columns']) { if (currentSpin.col === chasesObj['Columns'].target) chasesObj['Columns'] = null; else { chasesObj['Columns'].attemptsLeft--; if (chasesObj['Columns'].attemptsLeft <= 0) chasesObj['Columns'] = null; } }
    }

    checkNewChases() {
        const subset = this.state.getRecentHistory(50);
        const ghostDoz = this.scanner.preparePatternSeq(subset.map(s => s.doz), 'Z');
        const ghostCol = this.scanner.preparePatternSeq(subset.map(s => s.col), 'Z');

        if (this.state.activeFilters.doz && this.state.activeFilters['FALSE BREAK'] !== false && !this.state.engineChases['Dozens']) {
            let fb = this.scanner.analyze2to1Sequence(ghostDoz, 'Dozens').find(a => a.patternName === 'FALSE BREAK');
            if (fb) this.state.engineChases['Dozens'] = { target: fb.targetToken, attemptsLeft: 3 };
        }
        if (this.state.activeFilters.col && this.state.activeFilters['FALSE BREAK'] !== false && !this.state.engineChases['Columns']) {
            let fb = this.scanner.analyze2to1Sequence(ghostCol, 'Columns').find(a => a.patternName === 'FALSE BREAK');
            if (fb) this.state.engineChases['Columns'] = { target: fb.targetToken, attemptsLeft: 3 };
        }
        if (!this.state.bgEngineChases['Dozens']) {
            let fb = this.scanner.analyze2to1Sequence(ghostDoz, 'Dozens').find(a => a.patternName === 'FALSE BREAK');
            if (fb) this.state.bgEngineChases['Dozens'] = { target: fb.targetToken, attemptsLeft: 3 };
        }
        if (!this.state.bgEngineChases['Columns']) {
            let fb = this.scanner.analyze2to1Sequence(ghostCol, 'Columns').find(a => a.patternName === 'FALSE BREAK');
            if (fb) this.state.bgEngineChases['Columns'] = { target: fb.targetToken, attemptsLeft: 3 };
        }
    }

    toggleBetConfirmation(index) { if (this.state.pendingBets[index]) { this.state.pendingBets[index].confirmed = !this.state.pendingBets[index].confirmed; this.ui.renderDashboard(); this.saveLocal(); } }
    reRenderHistory() { const tbody = document.getElementById('historyBody'); if (tbody) tbody.innerHTML = ''; this.state.history.forEach(spin => this.ui.renderRow(spin)); }
    recalculateAllStats() {
        this.state.engineStatsMaster = this.state.createStatObject(); this.state.engineStats1to1 = this.state.createStatObject(); this.state.engineStats2to1 = this.state.createStatObject();
        this.state.history.forEach(spin => { if (!spin.bets) return; spin.bets.forEach(bet => { const isWin = BankrollManager.isBetWin(spin, bet.category, bet.target); const result = isWin ? 'WIN' : 'LOSS'; BankrollManager.updateStatObj(this.state.engineStatsMaster, bet, result); if (['Color', 'High/Low', 'Odd/Even'].includes(bet.category)) BankrollManager.updateStatObj(this.state.engineStats1to1, bet, result); else if (['Dozens', 'Columns'].includes(bet.category)) BankrollManager.updateStatObj(this.state.engineStats2to1, bet, result); }); });
    }

    // ==========================================
    // UI BINDING METHODS (From Monolith)
    // ==========================================
    toggleGhostMode() { this.state.ghostMode = !this.state.ghostMode; this.saveLocal(); this.ui.renderDashboard(); }
    toggleIgnoreZero() { this.state.ignoreZero = !this.state.ignoreZero; this.saveLocal(); }
    toggleGridColumn(key) { this.state.gridSettings[key] = !this.state.gridSettings[key]; this.saveLocal(); this.reRenderHistory(); }
    updateBankrollSettings() { this.state.bankrollTargets.enabled = document.getElementById('br-enabled')?.checked || false; this.state.bankrollTargets.profit = parseInt(document.getElementById('br-profit')?.value) || 50; this.state.bankrollTargets.loss = parseInt(document.getElementById('br-loss')?.value) || 20; this.saveLocal(); }
    exportSpins() { const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.state.history.map(s => s.val))); const downloadAnchorNode = document.createElement('a'); downloadAnchorNode.setAttribute("href", dataStr); downloadAnchorNode.setAttribute("download", `roulette_spins_${new Date().getTime()}.json`); document.body.appendChild(downloadAnchorNode); downloadAnchorNode.click(); downloadAnchorNode.remove(); }
    importSpins(files) { if (files.length === 0) return; const reader = new FileReader(); reader.onload = (e) => { try { const imported = JSON.parse(e.target.result); if (Array.isArray(imported)) { imported.forEach(val => this.handleSpin(val, true)); this.ui.renderDashboard(); this.ui.showToast("Spins imported successfully", "success"); } } catch (err) { this.ui.showToast("Failed to parse import file", "error"); } }; reader.readAsText(files[0]); }
    toggleTrendIcons() { this.state.showTrendIcons = !this.state.showTrendIcons; this.saveLocal(); this.ui.renderDashboard(); }
    toggleCurvedLayout() { this.state.curvedLayout = !this.state.curvedLayout; this.saveLocal(); }
    toggleSound(key) { this.state.soundSettings[key] = !this.state.soundSettings[key]; this.saveLocal(); }
    showResetModal() { this.toggleModal('resetModal'); }
    closeResetModal() { document.getElementById('resetModal').style.display = 'none'; }
    executeReset() { this.state.history = []; this.state.pendingBets = []; this.state.backgroundBets = []; this.state.confirmedBetLog = []; this.recalculateAllStats(); this.state.userStats = { totalWins: 0, totalLosses: 0, netUnits: 0, currentStreak: 0, totalBets: 0, bankrollHistory: [0] }; this.saveLocal(); this.reRenderHistory(); this.ui.renderDashboard(); this.closeResetModal(); this.ui.showToast("Session reset", "success"); }
    toggleHeatmapMode(mode) { this.state.heatmapMode = mode; this.ui.updateAnalyticsUI(); }
    toggleUserHeatmapMode(mode) { this.state.userHeatmapMode = mode; this.ui.updateActualBetsUI(); }
    toggleHeatmapMetric() { this.state.heatmapMetric = this.state.heatmapMetric === 'SHARE' ? 'WINRATE' : 'SHARE'; this.ui.updateAnalyticsUI(); }
    switchBetsTab(tab) {
        this.state.currentBetsTab = tab;
        ['trend', 'analytics', 'logs'].forEach(t => { document.getElementById(`tab-bets-${t}`)?.classList.toggle('hidden', t !== tab); document.getElementById(`seg-${t}`)?.classList.toggle('bg-[#007AFF]', t === tab); document.getElementById(`seg-${t}`)?.classList.toggle('text-white', t === tab); document.getElementById(`seg-${t}`)?.classList.toggle('text-gray-400', t !== tab); });
        this.ui.updateActualBetsUI();
    }
    switchAnalyticsTab(tab) {
        this.state.currentAnalyticsTab = tab;
        ['master', '1to1', '2to1'].forEach(t => { document.getElementById(`tab-${t}`)?.classList.toggle('bg-[#007AFF]', t === tab); document.getElementById(`tab-${t}`)?.classList.toggle('text-white', t === tab); document.getElementById(`tab-${t}`)?.classList.toggle('bg-white/10', t !== tab); document.getElementById(`tab-${t}`)?.classList.toggle('text-gray-400', t !== tab); });
        this.ui.updateAnalyticsUI();
    }
    toggleSimConfig() { this.toggleModal('simConfigDropdown'); }
    changeSimProgression(val) { this.state.simState.progression = val; this.ui.updateSimulationUI(); }
    toggleSimFilter(type, key) { const el = document.getElementById(`sim-${type}-${key}`); if (el) this.state.simState.filters[key] = el.checked; this.ui.updateSimulationUI(); }
    toggleCategorySelection(checked) { ['color', 'hl', 'oe', 'doz', 'col'].forEach(k => { this.state.activeFilters[k] = checked; const el = document.getElementById(`filter-${k}`); if (el) el.checked = checked; }); this.ui.renderDashboard(); this.saveLocal(); }
    togglePatternSelection(checked) { PATTERN_CONFIG.forEach(p => { this.state.activeFilters[p.key] = checked; const el = document.getElementById(`filter-${p.key}`); if (el) el.checked = checked; }); this.ui.renderDashboard(); this.saveLocal(); }
    handleFilterChange(filterKey, isChecked) {
        this.state.activeFilters[filterKey] = isChecked;
        if (MUTUAL_EXCLUSIONS && MUTUAL_EXCLUSIONS[filterKey] && isChecked) { const ex = MUTUAL_EXCLUSIONS[filterKey]; this.state.activeFilters[ex] = false; const el = document.getElementById(`filter-${ex}`); if (el) el.checked = false; }
        this.ui.renderDashboard(); this.saveLocal();
    }
    closePatternLog() { document.getElementById('patternLogModal').style.display = 'none'; }
    undoSpin() { if (this.state.history.length === 0) return; this.state.history.pop(); this.recalculateAllStats(); this.saveLocal(); this.reRenderHistory(); this.ui.renderDashboard(); if (document.getElementById('analyticsModal')?.style.display === 'flex') this.ui.updateAnalyticsUI(); }
    resetStats() { this.executeReset(); }
    toggleAnalytics() { this.toggleModal('analyticsModal'); if(document.getElementById('analyticsModal').style.display==='flex'){ this.ui.updateAnalyticsUI(); } }
    switchAnalyticsMode(mode) {
        this.state.simState.mode = mode;
        document.getElementById('analyticsView').style.display = mode === 'analytics' ? 'flex' : 'none';
        document.getElementById('simulationView').style.display = mode === 'simulation' ? 'flex' : 'none';
        document.getElementById('head-analytics').className = mode === 'analytics' ? "text-xl font-bold cursor-pointer transition-colors active-tab flex items-center gap-2" : "text-xl font-bold cursor-pointer transition-colors inactive-tab flex items-center gap-2 hover:text-gray-300";
        document.getElementById('head-simulation').className = mode === 'simulation' ? "text-xl font-bold cursor-pointer transition-colors active-tab flex items-center gap-2" : "text-xl font-bold cursor-pointer transition-colors inactive-tab flex items-center gap-2 hover:text-gray-300";
        if (mode === 'simulation') this.ui.updateSimulationUI();
    }
    toggleBetsModal() { this.toggleModal('betsModal'); if(document.getElementById('betsModal').style.display==='flex'){ this.ui.updateActualBetsUI(); } }
    toggleModal(id) { const el = document.getElementById(id); if (!el) return; if (el.classList.contains('hidden') || el.style.display === 'none' || el.style.display === '') { el.classList.remove('hidden'); el.style.display = 'flex'; } else { el.classList.add('hidden'); el.style.display = 'none'; } }
    toggleAccordion(id) { const content = document.getElementById(id); const icon = document.getElementById('icon-' + id); if (!content || !icon) return; if (content.classList.contains('hidden')) { content.classList.remove('hidden'); icon.classList.replace('fa-chevron-down', 'fa-chevron-up'); } else { content.classList.add('hidden'); icon.classList.replace('fa-chevron-up', 'fa-chevron-down'); } }
    closeAllMenus(e) { if (e && (e.target.closest('.glass-panel') || e.target.closest('button'))) return; ['mainMenuDropdown', 'filterDropdown', 'menuOverlay'].forEach(id => { const el = document.getElementById(id); if (el) el.classList.add('hidden'); }); }
    toggleMainMenu(e) { if (e) e.stopPropagation(); const menu = document.getElementById('mainMenuDropdown'); const overlay = document.getElementById('menuOverlay'); if (menu) menu.classList.toggle('hidden'); if (overlay) overlay.classList.toggle('hidden'); }
    toggleFilterMenu(e) { if (e) e.stopPropagation(); const menu = document.getElementById('filterDropdown'); const overlay = document.getElementById('menuOverlay'); if (menu) menu.classList.toggle('hidden'); if (overlay) overlay.classList.toggle('hidden'); }
}