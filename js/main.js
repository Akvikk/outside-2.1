import EventBus from './shared/EventBus.js';
import RouletteController from './roulette/RouletteController.js';
import BaccaratController from './baccarat/BaccaratController.js';
import DragonTigerController from './dragontiger/DragonTigerController.js';
import TrendGraph from './roulette/ui/components/TrendGraph.js';

class AppOrchestrator {
    constructor() {
        this.eventBus = new EventBus();
        this.roulette = new RouletteController(this.eventBus);
        this.baccarat = new BaccaratController(this.eventBus);
        this.dragontiger = new DragonTigerController(this.eventBus);

        this.swState = { running: false, startTime: null, elapsed: 0 };
        this._swTickInterval = null;
        this.pendingSwitchMode = null;
        
        this.utils = {
            showToast: this.showToast.bind(this),
            sanitizeString: (str) => String(str).replace(/[^\w\s-]/gi, ''),
            drawAdvancedGraph: (historyArray, winCount, lossCount, containerId, lineColor) => {
                TrendGraph.drawAdvancedGraph(historyArray, winCount, lossCount, containerId, lineColor);
            }
        };
    }

    init() {
        this.loadGlobalState();

        // Setup common UI helpers expected by inline HTML handlers
        const injectHelpers = (controller) => {
            controller.toggleModal = (id) => {
                const el = document.getElementById(id);
                if (!el) return;
                if (el.classList.contains('hidden') || el.style.display === 'none' || el.style.display === '') {
                    el.classList.remove('hidden');
                    el.style.display = 'flex';
                } else {
                    el.classList.add('hidden');
                    el.style.display = 'none';
                }
            };
            controller.toggleMenu = (e) => {
                if (e) e.stopPropagation();
                const menu = document.getElementById('mainMenuDropdown');
                const overlay = document.getElementById('menuOverlay');
                if (menu) menu.classList.toggle('hidden');
                if (overlay) overlay.classList.toggle('hidden');
            };
        };

        injectHelpers(this.roulette);
        injectHelpers(this.baccarat);
        injectHelpers(this.dragontiger);

        // Load saved data for each domain
        this.roulette.loadLocal();
        this.baccarat.loadLocal();
        this.dragontiger.loadLocal();

        this.bindEvents();
    }

    bindEvents() {
        document.addEventListener('click', (e) => {
            const isDropdownButton = e.target.closest('#menuBtn') || e.target.closest('#filterBtn');
            if (!isDropdownButton) {
                const mainMenu = document.getElementById('mainMenuDropdown');
                const filterMenu = document.getElementById('filterDropdown');
                const overlay = document.getElementById('menuOverlay');
                
                if (mainMenu && !mainMenu.classList.contains('hidden') && !mainMenu.contains(e.target)) {
                    mainMenu.classList.add('hidden');
                    if (overlay && (!filterMenu || filterMenu.classList.contains('hidden'))) overlay.classList.add('hidden');
                }
                if (filterMenu && !filterMenu.classList.contains('hidden') && !filterMenu.contains(e.target)) {
                    filterMenu.classList.add('hidden');
                    if (overlay && (!mainMenu || mainMenu.classList.contains('hidden'))) overlay.classList.add('hidden');
                }
            }
        });
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('toastNotification');
        const toastIcon = document.getElementById('toastIcon');
        const toastMsg = document.getElementById('toastMsg');
        if (!toast) return;

        toast.className = 'fixed bottom-5 left-1/2 transform -translate-x-1/2 px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 text-sm font-bold z-50 transition-all duration-300 translate-y-20 opacity-0 pointer-events-none';
        
        if (type === 'success') { toast.classList.add('bg-green-600', 'text-white'); toastIcon.className = 'fas fa-check-circle'; } 
        else if (type === 'error') { toast.classList.add('bg-red-600', 'text-white'); toastIcon.className = 'fas fa-exclamation-circle'; } 
        else if (type === 'warning') { toast.classList.add('bg-yellow-500', 'text-black'); toastIcon.className = 'fas fa-exclamation-triangle'; } 
        else { toast.classList.add('bg-gray-800', 'text-white'); toastIcon.className = 'fas fa-info-circle text-blue-400'; }

        toastMsg.textContent = message;
        toast.classList.remove('translate-y-20', 'opacity-0');
        toast.classList.add('translate-y-0', 'opacity-100');

        if (this._toastTimeout) clearTimeout(this._toastTimeout);
        this._toastTimeout = setTimeout(() => {
            toast.classList.remove('translate-y-0', 'opacity-100');
            toast.classList.add('translate-y-20', 'opacity-0');
        }, 3000);
    }

    switchMode(mode) {
        this.pendingSwitchMode = mode;
        const tScreen = document.getElementById('transitionScreen');
        if (tScreen) tScreen.classList.remove('hidden');

        setTimeout(() => {
            ['roulette-view', 'baccarat-view', 'dragontiger-view'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.style.display = 'none';
            });

            const gameTitle = document.getElementById('gameTitle');
            if (mode === 'roulette') {
                const view = document.getElementById('roulette-view');
                if (view) view.style.display = 'block';
                if (gameTitle) gameTitle.innerText = 'ROULETTE';
                if (this.roulette.ui && this.roulette.ui.grid) this.roulette.ui.grid.syncCompactGridHeaders();
            } else if (mode === 'baccarat') {
                const view = document.getElementById('baccarat-view');
                if (view) view.style.display = 'block';
                if (gameTitle) gameTitle.innerText = 'BACCARAT';
                if (this.baccarat.ui && this.baccarat.ui.roads) { this.baccarat.ui.roads.renderBeadPlate(); this.baccarat.ui.roads.renderBigRoad(); }
            } else if (mode === 'dragontiger') {
                const view = document.getElementById('dragontiger-view');
                if (view) view.style.display = 'block';
                if (gameTitle) gameTitle.innerText = 'DRAGON TIGER';
                if (this.dragontiger.ui && this.dragontiger.ui.roads) { this.dragontiger.ui.roads.renderBeadPlate(); this.dragontiger.ui.roads.renderBigRoad(); }
            }

            ['mainMenuDropdown', 'filterDropdown', 'menuOverlay'].forEach(id => { const el = document.getElementById(id); if (el) el.classList.add('hidden'); });
            if (tScreen) tScreen.classList.add('hidden');
        }, 600);
    }

    toggleStopwatchState() {
        if (this.swState.running) { this.swState.elapsed += (Date.now() - this.swState.startTime); this.swState.startTime = null; this.swState.running = false; } 
        else { this.swState.startTime = Date.now(); this.swState.running = true; }
        this.updateStopwatchUIState(); this.saveGlobalState();
    }
    resetStopwatch() { this.swState = { running: false, startTime: null, elapsed: 0 }; this.updateStopwatchUIState(); const display = document.getElementById('menuStopwatchDisplay'); if (display) display.textContent = '00:00:00'; this.saveGlobalState(); }
    _tickStopwatch() {
        const display = document.getElementById('menuStopwatchDisplay'); if (!display) return;
        if (!this.swState.running && this._swTickInterval) { clearInterval(this._swTickInterval); this._swTickInterval = null; }
        let totalMs = this.swState.elapsed; if (this.swState.running && this.swState.startTime) totalMs += (Date.now() - this.swState.startTime);
        const totalSec = Math.floor(totalMs / 1000);
        display.textContent = `${String(Math.floor(totalSec / 3600)).padStart(2, '0')}:${String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0')}:${String(totalSec % 60).padStart(2, '0')}`;
    }
    updateStopwatchUIState() {
        const btn = document.getElementById('btn-sw-toggle'); if (!btn) return;
        if (this.swState.running) { btn.innerHTML = '<i class="fas fa-pause"></i> STOP'; btn.className = "flex-1 h-8 bg-[#FF9F0A] hover:bg-[#e08b09] text-white text-xs font-bold rounded-lg shadow transition-colors flex items-center justify-center gap-2"; if (this._swTickInterval) clearInterval(this._swTickInterval); this._tickStopwatch(); this._swTickInterval = setInterval(() => this._tickStopwatch(), 1000); } 
        else { btn.innerHTML = '<i class="fas fa-play"></i> START'; btn.className = "flex-1 h-8 bg-[#30D158] hover:bg-[#28c04d] text-white text-xs font-bold rounded-lg shadow transition-colors flex items-center justify-center gap-2"; if (this._swTickInterval) { clearInterval(this._swTickInterval); this._swTickInterval = null; } this._tickStopwatch(); }
    }
    saveGlobalState() { try { localStorage.setItem('fon_outside_app_state', JSON.stringify({ swState: this.swState })); } catch (e) {} }
    loadGlobalState() { try { const data = localStorage.getItem('fon_outside_app_state'); if (data) { const parsed = JSON.parse(data); if (parsed.swState) { this.swState = parsed.swState; if (this.swState.running && !this.swState.startTime) { this.swState.running = false; } } } } catch (e) {} this.updateStopwatchUIState(); }
}

window.app = new AppOrchestrator();
window.toggleStopwatchState = () => window.app.toggleStopwatchState();
window.resetStopwatch = () => window.app.resetStopwatch();

document.addEventListener('DOMContentLoaded', () => {
    window.app.init();
    const splash = document.getElementById('splashScreen');
    if (splash && !splash.classList.contains('hidden')) { setTimeout(() => { splash.classList.add('opacity-0'); setTimeout(() => splash.classList.add('hidden'), 500); }, 1000); }
});