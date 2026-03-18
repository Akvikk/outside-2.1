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
            bankrollTargets: this.state.bankrollTargets, gridSettings: this.state.gridSettings, soundSettings: this.state.soundSettings
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
                this.state.ghostMode = true; // enforced
                if (data.curvedLayout !== undefined) this.state.curvedLayout = data.curvedLayout;
                if (data.gridSettings) this.state.gridSettings = data.gridSettings;
                if (data.bankrollTargets) Object.assign(this.state.bankrollTargets, data.bankrollTargets);

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

            const userResults = BankrollManager.resolveUserBets(this.state, spinObj, this.eventBus);
            BankrollManager.resolveBackgroundBets(this.state, spinObj);

            this.mutateChaseSet(this.state.engineChases, spinObj);
            this.mutateChaseSet(this.state.bgEngineChases, spinObj);

            this.state.history.push(spinObj);
            this.ui.renderRow(spinObj);
            this.checkNewChases();

            const alerts = this.scanner.scanPatterns(false, this.state.engineChases).filter(a => this.state.activeFilters[a.patternName] !== false);
            this.state.pendingBets = alerts.map((alert, index) => ({
                id: index, triggerSpin: spinObj.spinNumber, pattern: alert.patternName,
                category: alert.category, target: alert.targetToken, betName: alert.msg,
                sub: alert.sub, style: alert.style, confirmed: false
            }));

            if (userResults.wins > 0) this.audio.playWin(this.state.soundSettings.wins);
            else if (userResults.losses > 0) this.audio.playLoss(this.state.soundSettings.losses);
            else if (this.state.pendingBets.length > 0) this.audio.playPrediction(this.state.soundSettings.predictions);

            const bgAlerts = this.scanner.scanPatterns(true, this.state.bgEngineChases);
            this.state.backgroundBets = bgAlerts.map(alert => ({ pattern: alert.patternName, category: alert.category, target: alert.targetToken, betName: alert.msg, style: alert.style, sub: alert.sub }));

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
        if (chasesObj['Dozens']) {
            if (currentSpin.doz === chasesObj['Dozens'].target) chasesObj['Dozens'] = null;
            else { chasesObj['Dozens'].attemptsLeft--; if (chasesObj['Dozens'].attemptsLeft <= 0) chasesObj['Dozens'] = null; }
        }
        if (chasesObj['Columns']) {
            if (currentSpin.col === chasesObj['Columns'].target) chasesObj['Columns'] = null;
            else { chasesObj['Columns'].attemptsLeft--; if (chasesObj['Columns'].attemptsLeft <= 0) chasesObj['Columns'] = null; }
        }
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

    toggleBetConfirmation(index) {
        if (this.state.pendingBets[index]) {
            this.state.pendingBets[index].confirmed = !this.state.pendingBets[index].confirmed;
            this.ui.renderDashboard();
            this.saveLocal();
        }
    }

    reRenderHistory() {
        const tbody = document.getElementById('historyBody');
        if (tbody) tbody.innerHTML = '';
        this.state.history.forEach(spin => this.ui.renderRow(spin));
    }

    recalculateAllStats() {
        this.state.engineStatsMaster = this.state.createStatObject();
        this.state.engineStats1to1 = this.state.createStatObject();
        this.state.engineStats2to1 = this.state.createStatObject();
        this.state.history.forEach(spin => {
            if (!spin.bets) return;
            spin.bets.forEach(bet => {
                const isWin = BankrollManager.isBetWin(spin, bet.category, bet.target);
                const result = isWin ? 'WIN' : 'LOSS';
                BankrollManager.updateStatObj(this.state.engineStatsMaster, bet, result);
                if (['Color', 'High/Low', 'Odd/Even'].includes(bet.category)) BankrollManager.updateStatObj(this.state.engineStats1to1, bet, result);
                else if (['Dozens', 'Columns'].includes(bet.category)) BankrollManager.updateStatObj(this.state.engineStats2to1, bet, result);
            });
        });
    }
}