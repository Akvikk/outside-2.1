import DragonTigerState from './state.js';
import DragonTigerEngine from './engine.js';
import DragonTigerUI from './ui.js';
import StorageManager from '../core/storage.js';
import EventBus from '../core/events.js';

export default class DragonTigerController {
    constructor() {
        this.eventBus = new EventBus();
        this.state = new DragonTigerState();
        this.engine = new DragonTigerEngine(this.state);
        this.ui = new DragonTigerUI(this.eventBus, this.state);

        this.init();
    }

    init() {
        const savedData = StorageManager.load('dt_v4_session');
        if (savedData) {
            // Handle backward compatibility for Tie net logic
            if (savedData.myBetsHistory) {
                savedData.myBetsHistory = savedData.myBetsHistory.map(bet =>
                    (bet && bet.status === 'PUSH' && bet.result === 'X') ? { ...bet, status: 'LOSS', net: -0.5 } : bet
                );
            }
            if (savedData.goldenBetsHistory) {
                savedData.goldenBetsHistory = savedData.goldenBetsHistory.map(bet =>
                    (bet && bet.status === 'PUSH' && bet.result === 'X') ? { ...bet, status: 'LOSS', net: -0.5 } : bet
                );
            }
            Object.assign(this.state, savedData);
            
            const ignoreTiesEl = document.getElementById('dt-toggle-ignore-ties');
            if (ignoreTiesEl) ignoreTiesEl.checked = true;
        }
        this.engine.runPredictionScan(true); 
        this.ui.renderAll();
    }

    input(result) {
        if (navigator.vibrate) navigator.vibrate(10);

        const ignoreTies = document.getElementById('dt-toggle-ignore-ties')?.checked || false;
        
        this.engine.processHand(result, ignoreTies);
        this.engine.runPredictionScan(ignoreTies);
        
        requestAnimationFrame(() => {
            this.ui.renderAll();
            // Modals and stat updates can hook in here via EventBus or direct call
        });

        StorageManager.save('dt_v4_session', this.state);
    }
    
    undo() { this.engine.undo(); this.engine.runPredictionScan(true); this.ui.renderAll(); StorageManager.save('dt_v4_session', this.state); }
}