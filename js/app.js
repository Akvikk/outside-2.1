﻿export default class AppController {
    constructor() {
        this.state = { mode: 'roulette', instance: null };
        this.swState = { running: false, startTime: null, elapsed: 0 };
        this._swTickInterval = null;
        this.pendingSwitchMode = null;

        // Proxies ensure app.roulette.something() routes correctly
        this.roulette = this._createProxy('roulette');
        this.baccarat = this._createProxy('baccarat');
        this.dragontiger = this._createProxy('dragontiger');
    }

    async init() {
        this.loadGlobalState();
        await this.switchGameMode(this.state.mode, true);

        // Bind global enter key for roulette
        const spinInput = document.getElementById('spinInput');
        if (spinInput && !spinInput.dataset.enterBound) {
            spinInput.dataset.enterBound = 'true';
            spinInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') { e.preventDefault(); this.handleSpin(); }
            });
        }
        document.addEventListener('keydown', (e) => this.handleKeydown(e));
    }

    _createProxy(mode) {
        return new Proxy({}, {
            get: (target, prop) => {
                if (this.state.mode === mode && this.state.instance) {
                    if (typeof this.state.instance[prop] === 'function') {
                        return (...args) => this.state.instance[prop](...args);
                    }
                    return this.state.instance[prop];
                }
                return () => { console.warn(`[App Router] Ignored call to ${mode}.${prop}() - missing or inactive`); };
            }
        });
    }

    async switchGameMode(mode, isInitial = false) {
        if (this.state.mode === mode && !isInitial) return;
        if (!isInitial) {
            this.pendingSwitchMode = mode;
            const modal = document.getElementById('switchModeModal');
            const nameEl = document.getElementById('targetModeName');
            if (nameEl) nameEl.innerText = mode.toUpperCase();
            if (modal) modal.style.display = 'flex';
            document.getElementById('mainMenuDropdown')?.classList.add('hidden');
            document.getElementById('menuOverlay')?.classList.add('hidden');
            return;
        }
        await this._finalizeSwitch(mode, isInitial);
    }

    closeSwitchModeModal() {
        const modal = document.getElementById('switchModeModal');
        if (modal) modal.style.display = 'none';
        this.pendingSwitchMode = null;
    }

    async executeSwitchMode() {
        if (this.pendingSwitchMode) {
            await this._finalizeSwitch(this.pendingSwitchMode, false);
            this.closeSwitchModeModal();
        }
    }

    async _finalizeSwitch(mode, isInitial) {
        this.state.mode = mode;

        const uiGroups = {
            roulette: ['roulette-view', 'roulette-controls', 'roulette-dashboard', 'roulette-menu-items', 'roulette-bets-btn'],
            baccarat: ['baccarat-view', 'baccarat-controls', 'baccarat-dashboard', 'baccarat-menu-items', 'baccarat-modals-container', 'btn-baccarat-undo']
        };

        Object.keys(uiGroups).forEach(m => {
            uiGroups[m].forEach(id => document.getElementById(id)?.classList.toggle('hidden', m !== mode));
        });

        const btnRoulette = document.getElementById('btn-mode-roulette');
        const btnBaccarat = document.getElementById('btn-mode-baccarat');
        const activeClass = "flex-1 py-1.5 text-xs font-bold rounded-md transition-all bg-[#007AFF] text-white shadow-lg";
        const inactiveClass = "flex-1 py-1.5 text-xs font-bold rounded-md transition-all text-gray-400 hover:text-white hover:bg-white/5";
        
        if (btnRoulette) btnRoulette.className = mode === 'roulette' ? activeClass : inactiveClass;
        if (btnBaccarat) btnBaccarat.className = mode === 'baccarat' ? activeClass : inactiveClass;

        // Dynamic lazy-loading of the game controllers
        if (mode === 'roulette') {
            const { default: Controller } = await import(`./roulette/controller.js`);
            this.state.instance = new Controller();
        } else if (mode === 'baccarat') {
            const { default: Controller } = await import(`./baccarat/controller.js`);
            this.state.instance = new Controller();
        }

        if (!isInitial) this.closeAllMenus({ target: document.body });
    }

    // --- SHARED GLOBAL UI ROUTING ---
    handleSpin(val = null) {
        if (this.state.mode === 'roulette') {
            const inputField = document.getElementById('spinInput');
            let spinVal = val !== null ? val : parseInt(inputField?.value);
            this.state.instance?.handleSpin?.(spinVal);
            if (inputField) { inputField.value = ''; inputField.focus(); }
        }
    }

    undo() { this.state.instance?.undo?.(); }
    toggleAnalytics() { this.state.instance?.toggleAnalytics?.(); }
    toggleFilterMenu(e) { this.state.instance?.toggleFilterMenu?.(e); }
    toggleBetsModal() { this.state.instance?.toggleBetsModal?.(); }
    
    toggleMainMenu(e) {
        if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
        document.getElementById('filterDropdown')?.classList.add('hidden');
        document.getElementById('mainMenuDropdown')?.classList.toggle('hidden');
        document.getElementById('menuOverlay')?.classList.toggle('hidden');
    }

    closeAllMenus(e) {
        const evt = e || { target: document.body };
        const menu = document.getElementById('mainMenuDropdown');
        const overlay = document.getElementById('menuOverlay');
        const filterMenu = document.getElementById('filterDropdown');

        if (filterMenu && !filterMenu.classList.contains('hidden') && !filterMenu.contains(evt.target)) {
            filterMenu.classList.add('hidden');
        }
        if (menu && !menu.classList.contains('hidden') && !menu.contains(evt.target)) {
            menu.classList.add('hidden');
            overlay?.classList.add('hidden');
        }
    }

    handleKeydown(e) {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); this.undo(); return; }
        if (this.state.mode === 'baccarat') {
            if (e.key.toLowerCase() === 'p') this.baccarat.input('P');
            if (e.key.toLowerCase() === 'b') this.baccarat.input('B');
            if (e.key.toLowerCase() === 't') this.baccarat.input('T');
        }
    }

    // --- GLOBAL STOPWATCH LOGIC ---
    toggleStopwatchState() {
        this.swState.running ? (this.swState.elapsed += (Date.now() - this.swState.startTime), this.swState.startTime = null, this.swState.running = false) : (this.swState.startTime = Date.now(), this.swState.running = true);
        this.updateStopwatchUIState();
        this.saveGlobalState();
    }

    resetStopwatch() {
        this.swState = { running: false, startTime: null, elapsed: 0 };
        this.updateStopwatchUIState();
        const display = document.getElementById('menuStopwatchDisplay');
        if (display) display.textContent = '00:00:00';
        this.saveGlobalState();
    }

    _tickStopwatch() {
        const display = document.getElementById('menuStopwatchDisplay');
        if (!display) return;
        if (!this.swState.running && this._swTickInterval) { clearInterval(this._swTickInterval); this._swTickInterval = null; }
        let totalMs = this.swState.elapsed;
        if (this.swState.running && this.swState.startTime) { totalMs += (Date.now() - this.swState.startTime); }
        const t = Math.floor(totalMs / 1000);
        display.textContent = `${String(Math.floor(t / 3600)).padStart(2, '0')}:${String(Math.floor((t % 3600) / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
    }

    updateStopwatchUIState() {
        const btn = document.getElementById('btn-sw-toggle');
        if (!btn) return;
        if (this.swState.running) {
            btn.innerHTML = '<i class="fas fa-pause"></i> STOP';
            btn.className = "flex-1 h-8 bg-[#FF9F0A] hover:bg-[#e08b09] text-white text-xs font-bold rounded-lg shadow transition-colors flex items-center justify-center gap-2";
            if (this._swTickInterval) clearInterval(this._swTickInterval);
            this._tickStopwatch();
            this._swTickInterval = setInterval(() => this._tickStopwatch(), 1000);
        } else {
            btn.innerHTML = '<i class="fas fa-play"></i> START';
            btn.className = "flex-1 h-8 bg-[#30D158] hover:bg-[#28c04d] text-white text-xs font-bold rounded-lg shadow transition-colors flex items-center justify-center gap-2";
            if (this._swTickInterval) { clearInterval(this._swTickInterval); this._swTickInterval = null; }
            this._tickStopwatch();
        }
    }

    saveGlobalState() { try { localStorage.setItem('fon_outside_app_state', JSON.stringify({ swState: this.swState })); } catch (e) { } }
    loadGlobalState() {
        try {
            const data = localStorage.getItem('fon_outside_app_state');
            if (data) {
                const parsed = JSON.parse(data);
                if (parsed.swState) {
                    this.swState = parsed.swState;
                    if (this.swState.running && !this.swState.startTime) this.swState.running = false;
                }
            }
        } catch (e) { }
        this.updateStopwatchUIState();
    }
}