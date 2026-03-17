import RouletteState from './state.js';
import RouletteEngine from './engine.js';
import RouletteUI from './ui.js';
import AudioController from '../core/audio.js';
import StorageManager from '../core/storage.js';
import EventBus from '../core/events.js';

export default class RouletteController {
    constructor() {
        this.eventBus = new EventBus();
        this.state = new RouletteState();
        this.engine = new RouletteEngine(this.state);
        this.ui = new RouletteUI(this.eventBus);
        this.audio = new AudioController();

        this.init();
    }

    init() {
        // 1. Load saved state from Phase 1
        const savedData = StorageManager.load('roulette_session');
        if (savedData) {
            Object.assign(this.state, savedData);
            // Paint the historical UI
            this.state.history.forEach(spin => {
                this.ui.renderRow(spin, this.state.activeFilters, this.state.gridSettings);
            });
        }

        // 2. Wire up the event listeners
        this.bindEvents();
        this.ui.renderDashboard(this.state.pendingBets, this.state.engineStatsMaster, this.state.activeFilters, this.state.ghostMode, this.state.showTrendIcons);
    }

    bindEvents() {
        const spinInput = document.getElementById('spinInput');
        if (spinInput) {
            spinInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.handleSpin(parseInt(spinInput.value));
                }
            });
        }
    }

    handleSpin(val) {
        if (isNaN(val) || val < 0 || val > 36) return;
        
        // The Engine handles the pure math and returns the results
        const result = this.engine.processSpin(val);
        
        // Instruct UI to update the screen with the new data
        this.ui.renderRow(result.spinObj, this.state.activeFilters, this.state.gridSettings);
        this.ui.renderDashboard(this.state.pendingBets, this.state.engineStatsMaster, this.state.activeFilters, this.state.ghostMode, this.state.showTrendIcons);
        
        // Instruct Audio to play based on outcome
        if (result.userResults.wins > 0) this.audio.playWin(this.state.soundSettings?.wins);
        else if (result.userResults.losses > 0) this.audio.playLoss(this.state.soundSettings?.losses);
        else if (this.state.pendingBets.length > 0) this.audio.playPrediction(this.state.soundSettings?.predictions);

        // Persist data safely
        StorageManager.save('roulette_session', this.state);
    }
}