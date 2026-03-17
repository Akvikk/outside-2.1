﻿// =========================================================
// FON OUTSIDE - Roulette Engine
// =========================================================

app.roulette = {
    // --- PROPERTIES ---
    wheelData: {
        0: { color: 'G', hl: 'Z', oe: 'Z', doz: 'Z', col: 'Z', section: 'VOISINS' },
        1: { color: 'R', hl: 'L', oe: 'Odd', doz: 'D1', col: 'C1', section: 'ORPHELINS' },
        2: { color: 'B', hl: 'L', oe: 'Even', doz: 'D1', col: 'C2', section: 'VOISINS' },
        3: { color: 'R', hl: 'L', oe: 'Odd', doz: 'D1', col: 'C3', section: 'VOISINS' },
        4: { color: 'B', hl: 'L', oe: 'Even', doz: 'D1', col: 'C1', section: 'VOISINS' },
        5: { color: 'R', hl: 'L', oe: 'Odd', doz: 'D1', col: 'C2', section: 'TIER' },
        6: { color: 'B', hl: 'L', oe: 'Even', doz: 'D1', col: 'C3', section: 'ORPHELINS' },
        7: { color: 'R', hl: 'L', oe: 'Odd', doz: 'D1', col: 'C1', section: 'VOISINS' },
        8: { color: 'B', hl: 'L', oe: 'Even', doz: 'D1', col: 'C2', section: 'TIER' },
        9: { color: 'R', hl: 'L', oe: 'Odd', doz: 'D1', col: 'C3', section: 'ORPHELINS' },
        10: { color: 'B', hl: 'L', oe: 'Even', doz: 'D1', col: 'C1', section: 'TIER' },
        11: { color: 'B', hl: 'L', oe: 'Odd', doz: 'D1', col: 'C2', section: 'TIER' },
        12: { color: 'R', hl: 'L', oe: 'Even', doz: 'D1', col: 'C3', section: 'VOISINS' },
        13: { color: 'B', hl: 'L', oe: 'Odd', doz: 'D2', col: 'C1', section: 'TIER' },
        14: { color: 'R', hl: 'L', oe: 'Even', doz: 'D2', col: 'C2', section: 'ORPHELINS' },
        15: { color: 'B', hl: 'L', oe: 'Odd', doz: 'D2', col: 'C3', section: 'VOISINS' },
        16: { color: 'R', hl: 'L', oe: 'Even', doz: 'D2', col: 'C1', section: 'TIER' },
        17: { color: 'B', hl: 'L', oe: 'Odd', doz: 'D2', col: 'C2', section: 'ORPHELINS' },
        18: { color: 'R', hl: 'L', oe: 'Even', doz: 'D2', col: 'C3', section: 'VOISINS' },
        19: { color: 'R', hl: 'H', oe: 'Odd', doz: 'D2', col: 'C1', section: 'VOISINS' },
        20: { color: 'B', hl: 'H', oe: 'Even', doz: 'D2', col: 'C2', section: 'ORPHELINS' },
        21: { color: 'R', hl: 'H', oe: 'Odd', doz: 'D2', col: 'C3', section: 'VOISINS' },
        22: { color: 'B', hl: 'H', oe: 'Even', doz: 'D2', col: 'C1', section: 'VOISINS' },
        23: { color: 'R', hl: 'H', oe: 'Odd', doz: 'D2', col: 'C2', section: 'TIER' },
        24: { color: 'B', hl: 'H', oe: 'Even', doz: 'D2', col: 'C3', section: 'TIER' },
        25: { color: 'R', hl: 'H', oe: 'Odd', doz: 'D3', col: 'C1', section: 'VOISINS' },
        26: { color: 'B', hl: 'H', oe: 'Even', doz: 'D3', col: 'C2', section: 'VOISINS' },
        27: { color: 'R', hl: 'H', oe: 'Odd', doz: 'D3', col: 'C3', section: 'TIER' },
        28: { color: 'B', hl: 'H', oe: 'Even', doz: 'D3', col: 'C1', section: 'VOISINS' },
        29: { color: 'B', hl: 'H', oe: 'Odd', doz: 'D3', col: 'C2', section: 'VOISINS' },
        30: { color: 'R', hl: 'H', oe: 'Even', doz: 'D3', col: 'C3', section: 'TIER' },
        31: { color: 'B', hl: 'H', oe: 'Odd', doz: 'D3', col: 'C1', section: 'ORPHELINS' },
        32: { color: 'R', hl: 'H', oe: 'Even', doz: 'D3', col: 'C2', section: 'VOISINS' },
        33: { color: 'B', hl: 'H', oe: 'Odd', doz: 'D3', col: 'C3', section: 'TIER' },
        34: { color: 'R', hl: 'H', oe: 'Even', doz: 'D3', col: 'C1', section: 'ORPHELINS' },
        35: { color: 'B', hl: 'H', oe: 'Odd', doz: 'D3', col: 'C2', section: 'VOISINS' },
        36: { color: 'R', hl: 'H', oe: 'Even', doz: 'D3', col: 'C3', section: 'TIER' }
    },

    // --- STATE ---
    history: [],
    pendingBets: [],
    backgroundBets: [],
    confirmedBetLog: [],

    // --- HELPER FUNCTIONS ---
    isBetWin(spin, category, target) {
        if (category === 'Color') return spin.color === target;
        if (category === 'High/Low') return spin.hl === target;
        if (category === 'Odd/Even') {
            const type = spin.oe === 'Odd' ? 'O' : (spin.oe === 'Even' ? 'E' : 'Z');
            return type === target;
        }
        if (category === 'Dozens') return spin.doz === target;
        if (category === 'Columns') return spin.col === target;
        return false;
    },

    // --- MASTER CONFIGURATION ---
    PATTERN_CONFIG: [
        { key: 'FLOW', label: 'Flow' },
        { key: 'ZIG-ZAG', label: 'Zig-Zag' },
        { key: 'FALSE BREAK', label: 'False Break' },
        { key: '1-2-3 BUILD', label: '1-2-3 Build' },
        { key: '3-2-1 MIRROR', label: 'Mirror' },
        { key: '1-1-3 BURST', label: '1-1-3 Build' },
        { key: '3-1-1 DOWN', label: '3-1-1 Down' },
        { key: '1-1-2 BUILD', label: '1-1-2 Build', default: false } // Default false
    ],

    MUTUAL_EXCLUSIONS: {
        '1-1-2 BUILD': '1-1-3 BURST',
        '1-1-3 BURST': '1-1-2 BUILD'
    },

    activeFilters: {
        // Categories
        color: true, hl: true, oe: true, doz: true, col: true,
        // Patterns
    },

    engineChases: { Dozens: null, Columns: null },
    bgEngineChases: { Dozens: null, Columns: null },

    createStatObject: () => ({ totalWins: 0, totalLosses: 0, netUnits: 0, currentStreak: 0, patternStats: {}, targetStats: {}, categoryStats: {}, bankrollHistory: [0] }),

    engineStatsMaster: { totalWins: 0, totalLosses: 0, netUnits: 0, currentStreak: 0, patternStats: {}, targetStats: {}, categoryStats: {}, bankrollHistory: [0] },
    engineStats1to1: { totalWins: 0, totalLosses: 0, netUnits: 0, currentStreak: 0, patternStats: {}, targetStats: {}, categoryStats: {}, bankrollHistory: [0] },
    engineStats2to1: { totalWins: 0, totalLosses: 0, netUnits: 0, currentStreak: 0, patternStats: {}, targetStats: {}, categoryStats: {}, bankrollHistory: [0] },

    userStats: { totalWins: 0, totalLosses: 0, netUnits: 0, currentStreak: 0, totalBets: 0, bankrollHistory: [0] },
    soundSettings: { predictions: false, wins: false, losses: false },
    gridSettings: { hl: true, oe: true, doz: true, col: true },
    showTrendIcons: true,
    ghostMode: true,
    ignoreZero: true,
    curvedLayout: true,
    bankrollTargets: { enabled: false, profit: 50, loss: 20 },
    currentBetsTab: 'trend',
    userHeatmapMode: 'PATTERNS', // For the new tab
    heatmapMode: 'PATTERNS',
    heatmapMetric: 'SHARE',

    // --- SIMULATION STATE ---
    simState: {
        mode: 'analytics', // 'analytics' or 'simulation'
        progression: 'flat',
        filters: {
            // Categories
            'Color': true, 'High/Low': true, 'Odd/Even': true,
            'Dozens': true, 'Columns': true,
            // Patterns
        },
        stats: { net: 0, wins: 0, losses: 0, count: 0, drawdown: 0, history: [0] }
    },

    currentAnalyticsTab: 'master',

    // --- UNIVERSAL STYLING ---
    getStyle(t) {
        if (t === 'R' || t === 'C1') return 'card-style style-red';
        if (t === 'B' || t === 'C2') return 'card-style style-black';
        if (t === 'H') return 'card-style style-orange';
        if (t === 'L') return 'card-style style-blue';
        if (t === 'O') return 'card-style style-purple';
        if (t === 'E') return 'card-style style-pink';
        if (t === 'D1') return 'card-style style-cyan';
        if (t === 'D2') return 'card-style style-gray';
        if (t === 'D3' || t === 'C3') return 'card-style style-yellow';
        return 'card-style style-gray';
    },

    isCompactMobileView() {
        return !!(window.matchMedia && window.matchMedia('(max-width: 640px)').matches);
    },

    compactTokenLabel(value) {
        const raw = String(value || '').trim();
        if (!raw) return raw;
        const map = { RED: 'R', BLACK: 'B', HIGH: 'H', LOW: 'L', ODD: 'O', EVEN: 'E' };
        let compact = raw.toUpperCase();
        Object.entries(map).forEach(([full, short]) => {
            compact = compact.replace(new RegExp(`\\b${full}\\b`, 'g'), short);
        });
        return compact;
    },

    compactCategoryLabel(category) {
        const map = { 'Color': 'CLR', 'High/Low': 'H/L', 'Odd/Even': 'O/E', 'Dozens': 'DOZ', 'Columns': 'COL' };
        return map[category] || category;
    },

    compactPatternLabel(pattern) {
        const map = {
            'FLOW': 'FLOW',
            'ZIG-ZAG': 'ZZ',
            'FALSE BREAK': 'FB',
            '1-2-3 BUILD': '123',
            '3-2-1 MIRROR': '321',
            '1-1-3 BURST': '113',
            '3-1-1 DOWN': '311',
            '1-1-2 BUILD': '112'
        };
        return map[pattern] || pattern;
    },

    syncCompactGridHeaders() {
        const isCompactMobile = this.isCompactMobileView();
        const thHL = document.getElementById('th-hl');
        const thOE = document.getElementById('th-oe');
        const thDoz = document.getElementById('th-doz');
        const thCol = document.getElementById('th-col');
        if (thHL) thHL.textContent = 'H/L';
        if (thOE) thOE.textContent = 'O/E';
        if (thDoz) thDoz.textContent = isCompactMobile ? 'D' : 'DOZ';
        if (thCol) thCol.textContent = isCompactMobile ? 'C' : 'COL';
    },

    _viewportSyncTimer: null,
    _viewportSyncBound: false,

    bindViewportSync() {
        if (this._viewportSyncBound) return;
        const onViewportChange = () => {
            clearTimeout(this._viewportSyncTimer);
            this._viewportSyncTimer = setTimeout(() => {
                this.syncCompactGridHeaders();
                this.reRenderHistory();
                this.renderDashboard();
            }, 120);
        };
        window.addEventListener('resize', onViewportChange, { passive: true });
        window.addEventListener('orientationchange', onViewportChange, { passive: true });
        this._viewportSyncBound = true;
    },

    // --- AUDIO SYSTEM ---
    audioCtx: (() => {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return null;
        try { return new AudioCtx(); } catch { return null; }
    })(),

    playTone(freq, type, duration, startTime = 0) {
        const audioCtx = this.audioCtx;
        if (!audioCtx) return;
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + startTime);
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime + startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + startTime + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(audioCtx.currentTime + startTime);
        osc.stop(audioCtx.currentTime + startTime + duration);
    },

    soundEffects: {
        prediction: () => {
            if (!app.roulette.soundSettings.predictions) return;
            // Futuristic "Ping"
            app.roulette.playTone(880, 'sine', 0.1);
            app.roulette.playTone(1760, 'sine', 0.1, 0.05);
        },
        win: () => {
            if (!app.roulette.soundSettings.wins) return;
            // Happy Major Arpeggio
            app.roulette.playTone(523.25, 'sine', 0.2, 0);
            app.roulette.playTone(659.25, 'sine', 0.2, 0.1);
            app.roulette.playTone(783.99, 'sine', 0.4, 0.2);
            app.roulette.playTone(1046.50, 'sine', 0.6, 0.3);
        },
        loss: () => {
            if (!app.roulette.soundSettings.losses) return;
            // Low descending buzz
            app.roulette.playTone(150, 'sawtooth', 0.4);
            app.roulette.playTone(100, 'sawtooth', 0.4, 0.1);
        }
    },

    // --- DATA PERSISTENCE ENGINE ---
    // Debounce utility to prevent freezing on high-frequency updates
    debounce(func, wait) {
        let timeout;
        return function (...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    performSave: null,

    _performSaveLogic() {
        try {
            const data = {
                history: this.history.length > 2000 ? this.history.slice(-2000) : this.history, pendingBets: this.pendingBets, backgroundBets: this.backgroundBets, confirmedBetLog: this.confirmedBetLog.length > 2000 ? this.confirmedBetLog.slice(-2000) : this.confirmedBetLog,
                activeFilters: this.activeFilters, simState: this.simState, engineChases: this.engineChases, bgEngineChases: this.bgEngineChases,
                engineStatsMaster: this.engineStatsMaster, engineStats1to1: this.engineStats1to1, engineStats2to1: this.engineStats2to1, userStats: this.userStats, showTrendIcons: this.showTrendIcons, ghostMode: this.ghostMode, ignoreZero: this.ignoreZero, curvedLayout: this.curvedLayout, swState: this.swState, bankrollTargets: this.bankrollTargets, gridSettings: this.gridSettings,
                soundSettings: this.soundSettings
            };
            app.utils.saveLocal('roulette_session', data);
        } catch (e) {
            console.error('Save failed:', e);

            this.showToast("Failed to save session data", "error");
        }
    },

    saveLocal() {
        if (!this.performSave) {
            this.performSave = this.debounce(this._performSaveLogic.bind(this), 1000);
        }
        this.performSave();
    },

    loadLocal() {
        const data = app.utils.loadLocal('roulette_session');
        if (data) {
            try {
                this.history = data.history || [];
                this.pendingBets = data.pendingBets || [];
                this.backgroundBets = data.backgroundBets || [];
                this.confirmedBetLog = data.confirmedBetLog || [];

                if (data.activeFilters) Object.assign(this.activeFilters, data.activeFilters);
                if (data.simState) Object.assign(this.simState, data.simState);
                if (data.engineChases) Object.assign(this.engineChases, data.engineChases);
                if (data.bgEngineChases) Object.assign(this.bgEngineChases, data.bgEngineChases);

                // Recalculate stats from history to ensure mathematical consistency
                this.recalculateAllStats();

                if (data.userStats) Object.assign(this.userStats, data.userStats);
                if (data.soundSettings) Object.assign(this.soundSettings, data.soundSettings);
                if (data.showTrendIcons !== undefined) this.showTrendIcons = data.showTrendIcons;
                if (data.ignoreZero !== undefined) this.ignoreZero = data.ignoreZero;
                // Ghost Mode is mandatory and always ON.
                this.ghostMode = true;
                if (data.curvedLayout !== undefined) this.curvedLayout = data.curvedLayout;
                if (data.gridSettings) {
                    this.gridSettings = data.gridSettings;
                    document.getElementById('grid-hl').checked = this.gridSettings.hl;
                    document.getElementById('grid-oe').checked = this.gridSettings.oe;
                    document.getElementById('grid-doz').checked = this.gridSettings.doz;
                    document.getElementById('grid-col').checked = this.gridSettings.col;
                    this.updateGridVisibility();
                }
                if (data.bankrollTargets) Object.assign(this.bankrollTargets, data.bankrollTargets);
                if (data.swState) {
                    this.swState = data.swState;
                    // If it was running, we need to adjust start time or keep it running? 
                    // For simplicity in a web app, we usually pause on reload or resume. Let's resume if it was running.
                }

                // Sync UI checkboxes to match loaded state (Categories & Patterns)
                Object.keys(this.activeFilters).forEach(key => {
                    // Find input with matching handleFilterChange call
                    const el = document.querySelector(`input.filter-checkbox[onchange*="'${key}'"]`);
                    if (el) el.checked = this.activeFilters[key];
                });
                this.updateSelectAllCheckboxes();

                document.getElementById('br-enabled').checked = this.bankrollTargets.enabled;
                document.getElementById('br-profit').value = this.bankrollTargets.profit;
                document.getElementById('br-loss').value = this.bankrollTargets.loss;

                // Sync Sound Checkboxes
                document.getElementById('sound-pred').checked = this.soundSettings.predictions;
                document.getElementById('sound-wins').checked = this.soundSettings.wins;
                document.getElementById('sound-loss').checked = this.soundSettings.losses;
                document.getElementById('setting-trend-icons').checked = this.showTrendIcons;
                const gmEl = document.getElementById('setting-ghost-mode');
                if (gmEl) {
                    gmEl.checked = true;
                }
                const izEl = document.getElementById('setting-ignore-zero');
                if (izEl) izEl.checked = this.ignoreZero;
                if (app && typeof app.updateStopwatchUIState === 'function') app.updateStopwatchUIState();

                const progSelect = document.getElementById('simProgressionSelect');
                if (progSelect && this.simState.progression) progSelect.value = this.simState.progression;

                Object.keys(this.simState.filters).forEach(key => {
                    const el = document.getElementById('sim-cat-' + key) || document.getElementById('sim-pat-' + key);
                    if (el) el.checked = this.simState.filters[key];
                });

                this.syncCompactGridHeaders();
                this.reRenderHistory();
                this.renderDashboard();
                if (document.getElementById('analyticsModal').style.display === 'flex') this.updateAnalyticsUI();
                if (document.getElementById('betsModal').style.display === 'flex') this.updateActualBetsUI();
            } catch (e) {
                console.error('Load failed:', e);
            }
        }

        // Enforce Ghost Mode globally, regardless of saved session state.
        this.ghostMode = true;
        const gmEl = document.getElementById('setting-ghost-mode');
        if (gmEl) {
            gmEl.checked = true;
        }
        const izEl = document.getElementById('setting-ignore-zero');
        if (izEl) izEl.checked = this.ignoreZero;

        // Dark mode only — no theme switching
        document.documentElement.removeAttribute('data-theme');

        // Enforce C Layout Default State (or Loaded State)
        document.getElementById('setting-c-layout').checked = this.curvedLayout;
        this.applyLayout();
        this.syncCompactGridHeaders();
        this.bindViewportSync();
    },

    // --- UI INTERACTIONS ---
    closeAllMenus(e) {
        this.closeFilterMenu(e);
        this.closeMainMenu(e);
        // Data menu is now part of main menu, no separate close logic needed
    },

    closeFilterMenu(e) {
        const evt = e || { target: document.body };
        const menu = document.getElementById('filterDropdown');
        const btn = document.getElementById('filterBtn');
        const overlay = document.getElementById('menuOverlay');
        if (menu && !menu.classList.contains('hidden') && !menu.contains(evt.target) && !btn.contains(evt.target)) {
            menu.classList.add('hidden');
            // Only hide overlay if Main Menu is also hidden (shared overlay)
            const mainMenu = document.getElementById('mainMenuDropdown');
            if (!mainMenu || mainMenu.classList.contains('hidden')) {
                overlay.classList.add('hidden');
            }
        }
    },

    toggleFilterMenu(e) {
        if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
        const menu = document.getElementById('filterDropdown');
        const btn = document.getElementById('filterBtn');
        const overlay = document.getElementById('menuOverlay');
        const mainMenu = document.getElementById('mainMenuDropdown');

        // Close Main Menu if open to prevent overlap
        if (mainMenu && !mainMenu.classList.contains('hidden')) {
            mainMenu.classList.add('hidden');
        }

        if (menu.classList.contains('hidden')) {
            const rect = btn.getBoundingClientRect();
            menu.style.top = (rect.bottom + 8) + 'px';
            menu.style.left = rect.left + 'px';

            // Smart Positioning: Align right if menu would overflow screen (w-80 is 320px)
            if (rect.left + 320 > window.innerWidth) {
                menu.style.left = (rect.right - 320) + 'px';
            } else {
                menu.style.left = rect.left + 'px';
            }
        }

        menu.classList.toggle('hidden');

        if (menu.classList.contains('hidden')) {
            overlay.classList.add('hidden');
        } else {
            overlay.classList.remove('hidden');
        }
    },

    closeMainMenu(e) {
        const evt = e || { target: document.body };
        const menu = document.getElementById('mainMenuDropdown');
        const overlay = document.getElementById('menuOverlay');
        const btn = document.getElementById('menuBtn');

        // If click is on overlay, or outside menu/btn
        if (menu && !menu.classList.contains('hidden') && (!menu.contains(evt.target) && !btn.contains(evt.target))) {
            menu.classList.add('opacity-0');
            menu.classList.add('scale-95');
            setTimeout(() => menu.classList.add('hidden'), 200);
            overlay.classList.add('hidden');
        }
    },

    toggleMainMenu(e) {
        if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
        const menu = document.getElementById('mainMenuDropdown');
        const overlay = document.getElementById('menuOverlay');
        const filterMenu = document.getElementById('filterDropdown');
        const btn = document.getElementById('menuBtn');

        // Close Filter Menu if open
        if (filterMenu && !filterMenu.classList.contains('hidden')) {
            filterMenu.classList.add('hidden');
        }

        if (menu.classList.contains('hidden')) {
            menu.classList.remove('hidden');
            // Small delay to allow display:block before opacity transition
            setTimeout(() => {
                menu.classList.remove('opacity-0');
                menu.classList.remove('scale-95');
            }, 10);
            overlay.classList.remove('hidden');
        } else {
            menu.classList.add('opacity-0');
            menu.classList.add('scale-95');
            setTimeout(() => menu.classList.add('hidden'), 200);
            overlay.classList.add('hidden');
        }
    },

    toggleAccordion(id) {
        const content = document.getElementById(id);
        const icon = document.getElementById('icon-' + id);

        // Exclusive Accordion Logic
        ['acc-engine', 'acc-data', 'acc-sound', 'acc-cards', 'acc-bankroll', 'acc-grid'].forEach(otherId => {
            if (otherId !== id) {
                document.getElementById(otherId).classList.add('hidden');
                const otherIcon = document.getElementById('icon-' + otherId);
                if (otherIcon) otherIcon.style.transform = 'rotate(0deg)';
            }
        });

        const isHidden = content.classList.contains('hidden');
        if (isHidden) { content.classList.remove('hidden'); icon.style.transform = 'rotate(180deg)'; }
        else { content.classList.add('hidden'); icon.style.transform = 'rotate(0deg)'; }
    },

    toggleSound(key) {
        this.soundSettings[key] = !this.soundSettings[key];
        this.saveLocal();
    },

    toggleTrendIcons() {
        this.showTrendIcons = !this.showTrendIcons;
        this.renderDashboard();
        this.saveLocal();
    },

    toggleGhostMode() {
        // Enforced: Ghost Mode cannot be turned off.
        this.ghostMode = true;
        const gmEl = document.getElementById('setting-ghost-mode');
        if (gmEl) gmEl.checked = true;
        this.saveLocal();
    },

    toggleIgnoreZero() {
        this.ignoreZero = !this.ignoreZero;
        const izEl = document.getElementById('setting-ignore-zero');
        if (izEl) izEl.checked = this.ignoreZero;

        this.engineChases = { Dozens: null, Columns: null };
        this.bgEngineChases = { Dozens: null, Columns: null };
        this.checkNewChases();
        this.recalculateDashboard();

        const bgAlerts = this.scanPatterns(true, this.bgEngineChases);
        this.backgroundBets = bgAlerts.map(alert => ({
            pattern: alert.patternName,
            category: alert.category,
            target: alert.targetToken,
            betName: alert.msg,
            style: alert.style,
            sub: alert.sub
        }));

        this.renderDashboard();
        this.saveLocal();
    },

    toggleCurvedLayout() {
        this.curvedLayout = !this.curvedLayout;
        this.applyLayout();
        this.saveLocal();
    },

    applyLayout() {
        if (this.curvedLayout) document.body.removeAttribute('data-layout');
        else document.body.setAttribute('data-layout', 'square');
    },

    toggleGridColumn(key) {
        this.gridSettings[key] = !this.gridSettings[key];
        this.updateGridVisibility();
        this.saveLocal();
    },

    updateGridVisibility() {
        const setDisplay = (id, visible) => { const el = document.getElementById(id); if (el) el.style.display = visible ? 'table-cell' : 'none'; };
        setDisplay('th-hl', this.gridSettings.hl);
        setDisplay('th-oe', this.gridSettings.oe);
        setDisplay('th-doz', this.gridSettings.doz);
        setDisplay('th-col', this.gridSettings.col);
        this.syncCompactGridHeaders();
        this.reRenderHistory();
    },

    handleFilterChange(filterKey, isChecked) {
        this.activeFilters[filterKey] = isChecked;

        // Dynamic Mutual Exclusion
        if (isChecked && this.MUTUAL_EXCLUSIONS[filterKey]) {
            const conflictKey = this.MUTUAL_EXCLUSIONS[filterKey];
            this.activeFilters[conflictKey] = false;
            const el = document.querySelector(`input.filter-checkbox[onchange*="'${conflictKey}'"]`);
            if (el) el.checked = false;
        }

        this.updateSelectAllCheckboxes();
        this.recalculateDashboard();
        this.reRenderHistory();
        this.saveLocal();
    },

    togglePatternSelection(isChecked) {
        const patKeys = this.PATTERN_CONFIG.map(p => p.key);

        patKeys.forEach(key => {
            let val = isChecked;
            // Enforce exclusion on Select All: If checking, disable any pattern that is a "conflict target"
            // Strategy: Prioritize the one that is NOT the 'default: false' one, or just hardcode preference
            if (isChecked && key === '1-1-2 BUILD') val = false; // Keep preference for 1-1-3 BURST

            this.activeFilters[key] = val;
            const el = document.querySelector(`input.filter-checkbox[onchange*="'${key}'"]`);
            if (el) el.checked = val;
        });
        this.recalculateDashboard();
        this.reRenderHistory();
        this.saveLocal();
    },

    toggleCategorySelection(isChecked) {
        const catKeys = ['color', 'hl', 'oe', 'doz', 'col'];
        catKeys.forEach(key => {
            this.activeFilters[key] = isChecked;
            const el = document.querySelector(`input.filter-checkbox[onchange*="'${key}'"]`);
            if (el) el.checked = isChecked;
        });
        this.recalculateDashboard();
        this.reRenderHistory();
        this.saveLocal();
    },

    updateSelectAllCheckboxes() {
        const catKeys = ['color', 'hl', 'oe', 'doz', 'col'];
        // Filter out keys that are currently forced off by mutual exclusion from the "All Checked" logic
        // For simplicity, we check if all *non-excluded* patterns are checked.
        const patKeys = this.PATTERN_CONFIG.map(p => p.key).filter(k => k !== '1-1-2 BUILD');

        const allCats = catKeys.every(k => this.activeFilters[k]);
        const elCat = document.getElementById('selectAllCategories');
        if (elCat) elCat.checked = allCats;

        const allPats = patKeys.every(k => this.activeFilters[k]);
        const elPat = document.getElementById('selectAllPatterns');
        if (elPat) elPat.checked = allPats;
    },

    updateBankrollSettings() {
        this.bankrollTargets.enabled = document.getElementById('br-enabled').checked;
        this.bankrollTargets.profit = parseInt(document.getElementById('br-profit').value) || 50;
        this.bankrollTargets.loss = parseInt(document.getElementById('br-loss').value) || 20;
        this.saveLocal();
    },

    // --- DATA SESSION MANAGER FUNCTIONS ---
    exportSpins() {
        if (this.history.length === 0) { this.showToast("No spins to export!", "error"); return; }
        const spins = this.history.map(s => s.val);
        const data = {
            timestamp: Date.now(),
            spins: spins
        };
        const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const date = new Date().toISOString().split('T')[0];
        a.href = url;
        a.download = `Roulette_Spins_${date}.json`;
        a.click();
        URL.revokeObjectURL(url);
        this.showToast("Spins exported successfully", "success");
    },

    importSpins(files) {
        if (files.length === 0) return;
        const reader = new FileReader(); // Use arrow function to preserve 'this'
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (!data.spins || !Array.isArray(data.spins)) throw new Error("Invalid format");

                const safeSpins = data.spins.map(num => typeof num === 'string' ? app.utils.sanitizeString(num) : num);

                // Reset data silently
                this.resetDataSilently();

                // Replay spins
                safeSpins.forEach(num => {
                    this.handleSpin(num, true);
                });

                this.renderDashboard();
                const inputField = document.getElementById('spinInput');
                inputField.value = '';
                inputField.focus();
                this.saveLocal();
                this.showToast(`Successfully imported ${data.spins.length} spins`, "success");
            } catch (err) {

                this.showToast("Import failed: Invalid JSON file", "error");
            }
        };
        reader.readAsText(files[0]);
    },

    resetDataSilently() {
        this.history = [];
        this.pendingBets = [];
        this.backgroundBets = [];
        this.confirmedBetLog = [];
        this.engineChases = { Dozens: null, Columns: null };
        this.bgEngineChases = { Dozens: null, Columns: null };
        this.engineStatsMaster = this.createStatObject();
        this.engineStats1to1 = this.createStatObject();
        this.engineStats2to1 = this.createStatObject();
        this.userStats = { totalWins: 0, totalLosses: 0, netUnits: 0, currentStreak: 0, totalBets: 0, bankrollHistory: [0] };
        this.simState.stats = { net: 0, wins: 0, losses: 0, count: 0, drawdown: 0, history: [0] };

        // sessionStartTime = Date.now(); // Not used elsewhere?
        // Optional: Reset stopwatch on session wipe? User said "Session Stopwatch", so yes.
        if (app && app.resetStopwatch) app.resetStopwatch();
        document.getElementById('historyBody').innerHTML = '';
        this.renderDashboard();
    },

    showResetModal() {
        document.getElementById('resetModal').style.display = 'flex';
        document.getElementById('mainMenuDropdown').classList.add('hidden'); // Close menu when showing modal
        document.getElementById('menuOverlay').classList.add('hidden');
    },

    closeResetModal() {
        document.getElementById('resetModal').style.display = 'none';
    },

    executeReset() {
        localStorage.removeItem('roulette_session');
        this.resetDataSilently();
        this.updateAnalyticsUI();
        this.updateActualBetsUI();
        this.closeResetModal();
        this.saveLocal();
    },

    clearAllBets() {
        if (confirm("Clear all current predictions? History will remain.")) {
            this.pendingBets = [];
            this.engineChases = { Dozens: null, Columns: null };
            this.renderDashboard();
            this.saveLocal();
        }
    },

    clearUserHistory() {
        if (confirm("Clear all confirmed bets history?")) {
            this.confirmedBetLog = [];
            this.userStats = { totalWins: 0, totalLosses: 0, netUnits: 0, currentStreak: 0, totalBets: 0, bankrollHistory: [0] };
            this.updateActualBetsUI();
            this.drawUserGraph();
            this.renderUserHeatmap();
            this.saveLocal();
        }
    },

    recalculateDashboard() {
        if (this.history.length === 0) {
            this.renderDashboard();
            return;
        }
        const currentSpin = this.history[this.history.length - 1];
        const newAlerts = this.scanPatterns(false, this.engineChases).filter(a => this.activeFilters[a.patternName] !== false);
        const oldConfirmedSignatures = this.pendingBets.filter(b => b.confirmed).map(b => b.betName + b.pattern);

        this.pendingBets = newAlerts.map((alert, index) => {
            const signature = alert.msg + alert.patternName;
            return {
                id: index, triggerSpin: currentSpin.spinNumber, pattern: alert.patternName,
                category: alert.category, target: alert.targetToken, betName: alert.msg,
                sub: alert.sub, style: alert.style, confirmed: oldConfirmedSignatures.includes(signature)
            };
        });
        this.renderDashboard();
    },

    reRenderHistory() {
        const tbody = document.getElementById('historyBody');
        tbody.innerHTML = '';
        this.history.forEach(spin => this.renderRow(spin));
    },

    switchAnalyticsTab(tabId) {
        this.currentAnalyticsTab = tabId;
        const activeClass = "px-4 py-2 bg-[#007AFF] text-white rounded-lg font-semibold text-xs uppercase tracking-wider transition-colors shadow-lg";
        const inactiveClass = "px-4 py-2 bg-white/10 text-gray-400 hover:text-white rounded-lg font-semibold text-xs uppercase tracking-wider transition-colors border border-white/10 hover:border-white/20";
        document.getElementById('tab-master').className = tabId === 'master' ? activeClass : inactiveClass;
        document.getElementById('tab-1to1').className = tabId === '1to1' ? activeClass : inactiveClass;
        document.getElementById('tab-2to1').className = tabId === '2to1' ? activeClass : inactiveClass;
        this.updateAnalyticsUI();
    },

    // (Removed duplicate switchBetsTab)

    toggleUserHeatmapMode(mode) {
        this.userHeatmapMode = mode;
        const btnPat = document.getElementById('uhm-btn-pat');
        const btnCat = document.getElementById('uhm-btn-cat');
        const activeClass = "px-3 py-1 text-[10px] font-bold rounded-md transition-all bg-[#007AFF] text-white shadow-lg";
        const inactiveClass = "px-3 py-1 text-[10px] font-bold rounded-md transition-all text-gray-400 hover:text-white hover:bg-white/5";

        if (mode === 'PATTERNS') { btnPat.className = activeClass; btnCat.className = inactiveClass; }
        else { btnPat.className = inactiveClass; btnCat.className = activeClass; }

        this.renderUserHeatmap();
    },

    renderUserHeatmap() {
        const tbody = document.getElementById('userHeatmapBody');
        if (!tbody) return;

        // Clear existing content first
        tbody.innerHTML = '';

        const stats = {};
        let hasData = false;

        this.confirmedBetLog.forEach(log => {
            // Fallback for old logs without category
            // Robust key generation with fallback
            let key = 'Unknown';
            if (this.userHeatmapMode === 'CATEGORIES') {
                key = log.category || 'Unknown';
            } else {
                key = log.pattern || 'Manual/Unknown';
            }

            if (!stats[key]) stats[key] = { w: 0, l: 0 };
            if (log.outcome === 'WIN') stats[key].w++;
            else stats[key].l++;
            hasData = true;
        });

        if (!hasData) {
            tbody.innerHTML = '<tr><td colspan="4" class="p-8 text-center text-gray-600 italic">No bets placed yet.</td></tr>';
            return;
        }

        const items = Object.entries(stats).map(([name, s]) => {
            const total = s.w + s.l;
            const rate = total === 0 ? 0 : Math.round((s.w / total) * 100);
            return { name, total, w: s.w, l: s.l, rate };
        });

        // Sort by Win Rate (Desc), then Total Bets (Desc)
        items.sort((a, b) => {
            if (b.rate !== a.rate) return b.rate - a.rate;
            return b.total - a.total;
        });

        if (items.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="p-8 text-center text-gray-600 italic">No bets placed yet.</td></tr>';
            return;
        }

        let html = '';
        items.forEach(item => {
            const barColor = item.rate >= 50 ? 'bg-[#30D158]' : 'bg-[#FF453A]';
            const textColor = item.rate >= 50 ? 'text-[#30D158]' : 'text-[#FF453A]';
            const barWidth = item.rate + '%';

            html += `
                <tr class="border-b border-white/10 hover:bg-white/5 transition-colors">
                    <td class="p-3 font-bold text-gray-300">${item.name}</td>
                    <td class="p-3 text-right text-white font-bold">${item.total}</td>
                    <td class="p-3 text-right text-sm">
                        <span class="text-[#30D158] font-bold">${item.w}</span> <span class="text-gray-600">/</span> <span class="text-[#FF453A] font-bold">${item.l}</span>
                    </td>
                    <td class="p-3 text-right font-bold w-32 relative">
                        <div class="absolute inset-0 top-3 bottom-3 bg-gray-700 rounded overflow-hidden mx-2 opacity-30">
                            <div class="h-full ${barColor}" style="width: ${barWidth}"></div>
                        </div>
                        <span class="relative z-10 ${textColor}">${item.rate}%</span>
                    </td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
    },

    // --- SIMULATION LOGIC ---
    switchAnalyticsMode(mode) {
        this.simState.mode = mode;
        const analView = document.getElementById('analyticsView');
        const simView = document.getElementById('simulationView');
        const hAnal = document.getElementById('head-analytics');
        const hSim = document.getElementById('head-simulation');

        if (mode === 'analytics') {
            analView.classList.remove('hidden'); analView.classList.add('flex');
            simView.classList.add('hidden'); simView.classList.remove('flex');
            hAnal.className = "text-xl font-bold cursor-pointer transition-colors active-tab flex items-center gap-2";
            hSim.className = "text-xl font-bold cursor-pointer transition-colors inactive-tab flex items-center gap-2 hover:text-gray-300";
            this.updateAnalyticsUI();
        } else {
            simView.classList.remove('hidden'); simView.classList.add('flex');
            analView.classList.add('hidden'); analView.classList.remove('flex');
            hSim.className = "text-xl font-bold cursor-pointer transition-colors active-sim-tab flex items-center gap-2";
            hAnal.className = "text-xl font-bold cursor-pointer transition-colors inactive-tab flex items-center gap-2 hover:text-gray-300";
            this.runSimulation();
        }
    },

    toggleSimConfig() {
        const dropdown = document.getElementById('simConfigDropdown');
        dropdown.classList.toggle('hidden');
    },

    toggleSimFilter(type, key) {
        this.simState.filters[key] = !this.simState.filters[key];

        // Dynamic Mutual Exclusion for Simulation
        if (this.simState.filters[key] && this.MUTUAL_EXCLUSIONS[key]) {
            const conflictKey = this.MUTUAL_EXCLUSIONS[key];
            this.simState.filters[conflictKey] = false;
            const el = document.getElementById('sim-pat-' + conflictKey);
            if (el) el.checked = false;
        }

        this.runSimulation();
        this.saveLocal();
    },

    changeSimProgression(val) {
        this.simState.progression = val;
        this.runSimulation();
        this.saveLocal();
    },

    runSimulation() {
        let net = 0, wins = 0, losses = 0, count = 0;
        let bankroll = [0];
        let maxDraw = 0, peak = 0;

        let currentUnit = 1;
        let paroliStreak = 0;
        let fibIndex = 0;
        const fibSeq = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987, 1597];
        const strategy = this.simState.progression || 'flat';

        this.history.forEach(spin => {
            if (!spin.bets) return;

            const validBets = spin.bets.filter(bet => {
                const catOk = this.simState.filters[bet.category];
                const patOk = this.simState.filters[bet.pattern];
                return catOk && patOk;
            });

            if (validBets.length === 0) {
                bankroll.push(net);
                return;
            }

            let spinNet = 0;
            validBets.forEach(bet => {
                count++;
                let isWin = false;
                if (bet.category === 'Color') isWin = (spin.color === bet.target);
                else if (bet.category === 'High/Low') isWin = (spin.hl === bet.target);
                else if (bet.category === 'Odd/Even') {
                    const type = spin.oe === 'Odd' ? 'O' : (spin.oe === 'Even' ? 'E' : 'Z');
                    isWin = (type === bet.target);
                }
                else if (bet.category === 'Dozens') isWin = (spin.doz === bet.target);
                else if (bet.category === 'Columns') isWin = (spin.col === bet.target);

                const reward = (bet.category === 'Dozens' || bet.category === 'Columns') ? 2 : 1;

                if (isWin) { wins++; spinNet += reward; }
                else { losses++; spinNet -= 1; }
            });

            // Apply Progression Multiplier to the Spin's Net Result
            // If spinNet is positive, we won 'spinNet' units * currentUnit multiplier
            // If spinNet is negative, we lost 'spinNet' units * currentUnit multiplier

            const actualProfit = spinNet * currentUnit;
            net += actualProfit;
            bankroll.push(net);

            if (net > peak) peak = net;
            const dd = net - peak;
            if (dd < maxDraw) maxDraw = dd;

            // Update Progression for NEXT spin
            if (strategy === 'martingale') {
                if (spinNet < 0) {
                    currentUnit *= 2;
                    if (currentUnit > 500) currentUnit = 500;
                } else if (spinNet > 0) {
                    currentUnit = 1;
                }
            } else if (strategy === 'paroli') {
                if (spinNet > 0) {
                    paroliStreak++;
                    if (paroliStreak >= 3) { currentUnit = 1; paroliStreak = 0; }
                    else { currentUnit *= 2; }
                } else if (spinNet < 0) {
                    currentUnit = 1; paroliStreak = 0;
                }
            } else if (strategy === 'fibonacci') {
                if (spinNet < 0) {
                    fibIndex++;
                    if (fibIndex >= fibSeq.length) fibIndex = fibSeq.length - 1;
                } else if (spinNet > 0) {
                    fibIndex -= 2;
                    if (fibIndex < 0) fibIndex = 0;
                }
                currentUnit = fibSeq[fibIndex];
            } else {
                currentUnit = 1;
            }
        });

        document.getElementById('simNet').innerText = (net > 0 ? '+' : '') + net;
        document.getElementById('simNet').className = `text-2xl font-black ${net > 0 ? 'text-green-400' : (net < 0 ? 'text-red-400' : 'text-white')}`;

        const rate = count === 0 ? 0 : Math.round((wins / count) * 100);
        document.getElementById('simRate').innerText = rate + '%';

        document.getElementById('simCount').innerText = count;
        document.getElementById('simDrawdown').innerText = maxDraw;

        const activeCats = ['Color', 'High/Low', 'Odd/Even', 'Dozens', 'Columns'].filter(k => this.simState.filters[k]).length;
        const activePats = Object.keys(this.simState.filters).length - 5 - Object.keys(this.simState.filters).filter(k => !this.simState.filters[k] && !['Color', 'High/Low', 'Odd/Even', 'Dozens', 'Columns'].includes(k)).length;
        document.getElementById('simFilterSummary').innerText = `Simulating: ${activeCats} Cats, ${activePats} Patterns`;

        this.drawSimGraph(bankroll, wins, losses);
    },

    // --- TOAST NOTIFICATION SYSTEM ---
    showToast(message, type = 'info') {
        app.utils.showToast(message, type);
    },

    drawSimGraph(data, w, l) {
        const container = document.getElementById('simGraphContainer');
        if (!container) return;
        this.drawAdvancedGraph(data, w, l, 'simGraphContainer');
    },

    // --- MAIN GAME LOOP ---
    handleSpin(manualVal = null, suppressRender = false) {
        const inputField = document.getElementById('spinInput');
        let val;

        // Haptic feedback for mobile interaction
        if (navigator.vibrate) navigator.vibrate(10);

        if (manualVal !== null) val = parseInt(manualVal);
        else val = parseInt(inputField.value);

        // --- FIX: VISUAL FEEDBACK FOR INVALID INPUT & AUTO-CLEAR ---
        if (isNaN(val) || val < 0 || val > 36) {
            if (manualVal === null) {
                inputField.classList.add('input-error');
                if (navigator.vibrate) navigator.vibrate([50, 50, 50]); // Error vibration pattern
                setTimeout(() => {
                    inputField.classList.remove('input-error');
                    inputField.value = ''; // Auto-clear to refresh state
                    inputField.focus();
                }, 300);
            }
            return;
        }

        try {
            const data = this.wheelData[val];
            const spinObj = { id: Date.now(), spinNumber: this.history.length + 1, val: val, ...data };

            spinObj.bets = [...this.backgroundBets];

            const userResults = this.resolveUserBets(spinObj);
            this.resolveBackgroundBets(spinObj);

            this.mutateChaseSet(this.engineChases, spinObj);
            this.mutateChaseSet(this.bgEngineChases, spinObj);

            this.history.push(spinObj);
            this.renderRow(spinObj);
            this.checkNewChases();

            const alerts = this.scanPatterns(false, this.engineChases).filter(a => this.activeFilters[a.patternName] !== false);
            this.pendingBets = alerts.map((alert, index) => ({
                id: index, triggerSpin: spinObj.spinNumber, pattern: alert.patternName,
                category: alert.category, target: alert.targetToken, betName: alert.msg,
                sub: alert.sub, style: alert.style, confirmed: false
            }));

            // --- SOUND TRIGGERS ---
            // 1. Win/Loss (Prioritized)
            if (userResults.wins > 0) this.soundEffects.win();
            else if (userResults.losses > 0) this.soundEffects.loss();
            // 2. New Predictions (If no win/loss sound to avoid clutter, or play anyway)
            else if (this.pendingBets.length > 0) this.soundEffects.prediction();

            const bgAlerts = this.scanPatterns(true, this.bgEngineChases);
            this.backgroundBets = bgAlerts.map(alert => ({
                pattern: alert.patternName,
                category: alert.category,
                target: alert.targetToken,
                betName: alert.msg,
                style: alert.style,
                sub: alert.sub
            }));

            if (!suppressRender) {
                this.renderDashboard();

                // --- FIX: ENSURE CLEAR & FOCUS ---
                inputField.value = '';
                inputField.focus();

                setTimeout(() => {
                    const anchor = document.getElementById('scrollAnchor');
                    if (anchor) anchor.scrollIntoView({ behavior: 'smooth' });
                }, 50);

                if (document.getElementById('analyticsModal').style.display === 'flex') {
                    if (this.simState.mode === 'analytics') this.updateAnalyticsUI();
                    else this.runSimulation();
                }
                if (document.getElementById('betsModal').style.display === 'flex') this.updateActualBetsUI();

                this.saveLocal();
            }

        } catch (e) {

            this.showToast("Engine Error: " + e.message, "error");
            const inputField = document.getElementById('spinInput');
            inputField.value = '';
            inputField.focus();
        }
    },

    // --- RESOLVERS & TRACKERS ---

    resolveUserBets(currentSpin) {
        let spinWins = 0;
        let spinLosses = 0;

        this.pendingBets.filter(b => b.confirmed).forEach(bet => {
            const isWin = this.isBetWin(currentSpin, bet.category, bet.target);

            if (isWin) spinWins++; else spinLosses++;

            const result = isWin ? 'WIN' : 'LOSS';
            this.updateUserStats(bet, result, currentSpin.val);
        });
        return { wins: spinWins, losses: spinLosses };
    },

    resolveBackgroundBets(currentSpin) {
        this.backgroundBets.forEach(bet => {
            const isWin = this.isBetWin(currentSpin, bet.category, bet.target);

            const result = isWin ? 'WIN' : 'LOSS';
            this.updateStatObj(this.engineStatsMaster, bet, result);
            if (['Color', 'High/Low', 'Odd/Even'].includes(bet.category)) this.updateStatObj(this.engineStats1to1, bet, result);
            else if (['Dozens', 'Columns'].includes(bet.category)) this.updateStatObj(this.engineStats2to1, bet, result);
        });
    },

    mutateChaseSet(chasesObj, currentSpin) {
        if (chasesObj['Dozens']) {
            if (currentSpin.doz === chasesObj['Dozens'].target) chasesObj['Dozens'] = null;
            else {
                chasesObj['Dozens'].attemptsLeft--;
                if (chasesObj['Dozens'].attemptsLeft <= 0) chasesObj['Dozens'] = null;
            }
        }
        if (chasesObj['Columns']) {
            if (currentSpin.col === chasesObj['Columns'].target) chasesObj['Columns'] = null;
            else {
                chasesObj['Columns'].attemptsLeft--;
                if (chasesObj['Columns'].attemptsLeft <= 0) chasesObj['Columns'] = null;
            }
        }
    },

    checkNewChases() {
        const subset = this.getRecentHistory(50);
        const ghostDoz = this.preparePatternSeq(subset.map(s => s.doz), 'Z');
        const ghostCol = this.preparePatternSeq(subset.map(s => s.col), 'Z');

        if (this.activeFilters.doz && this.activeFilters['FALSE BREAK'] !== false && !this.engineChases['Dozens']) {
            let fb = this.analyze2to1Sequence(ghostDoz, 'Dozens').find(a => a.patternName === 'FALSE BREAK');
            if (fb) this.engineChases['Dozens'] = { target: fb.targetToken, attemptsLeft: 3 };
        }
        if (this.activeFilters.col && this.activeFilters['FALSE BREAK'] !== false && !this.engineChases['Columns']) {
            let fb = this.analyze2to1Sequence(ghostCol, 'Columns').find(a => a.patternName === 'FALSE BREAK');
            if (fb) this.engineChases['Columns'] = { target: fb.targetToken, attemptsLeft: 3 };
        }

        if (!this.bgEngineChases['Dozens']) {
            let fb = this.analyze2to1Sequence(ghostDoz, 'Dozens').find(a => a.patternName === 'FALSE BREAK');
            if (fb) this.bgEngineChases['Dozens'] = { target: fb.targetToken, attemptsLeft: 3 };
        }
        if (!this.bgEngineChases['Columns']) {
            let fb = this.analyze2to1Sequence(ghostCol, 'Columns').find(a => a.patternName === 'FALSE BREAK');
            if (fb) this.bgEngineChases['Columns'] = { target: fb.targetToken, attemptsLeft: 3 };
        }
    },

    // --- PERFORMANCE OPTIMIZATION ---
    getRecentHistory(count = 50) {
        return this.history.length > count ? this.history.slice(-count) : this.history;
    },

    preparePatternSeq(rawSeq, zeroToken) {
        if (this.ignoreZero) {
            return rawSeq.filter(v => v !== zeroToken);
        }

        // "Ignore Zeros" OFF: reset sequence after the latest zero so patterns shatter.
        const lastZeroIdx = rawSeq.lastIndexOf(zeroToken);
        const sliced = lastZeroIdx === -1 ? rawSeq : rawSeq.slice(lastZeroIdx + 1);
        return sliced.filter(v => v !== zeroToken);
    },

    updateStatObj(stats, bet, result) {
        const isWin = result === 'WIN';
        const winReward = (bet.category === 'Dozens' || bet.category === 'Columns') ? 2 : 1;

        if (isWin) {
            stats.totalWins++; stats.netUnits += winReward;
            if (stats.currentStreak >= 0) stats.currentStreak++; else stats.currentStreak = 1;
        } else {
            stats.totalLosses++; stats.netUnits -= 1;
            if (stats.currentStreak <= 0) stats.currentStreak--; else stats.currentStreak = -1;
        }
        stats.bankrollHistory.push(stats.netUnits);
        if (!stats.patternStats[bet.pattern]) stats.patternStats[bet.pattern] = { w: 0, l: 0 };
        if (isWin) stats.patternStats[bet.pattern].w++; else stats.patternStats[bet.pattern].l++;

        // Target Stats (Variable Efficiency)
        if (!stats.targetStats) stats.targetStats = {};
        if (!stats.targetStats[bet.betName]) stats.targetStats[bet.betName] = { w: 0, l: 0 };
        if (isWin) stats.targetStats[bet.betName].w++; else stats.targetStats[bet.betName].l++;

        // Category Stats (Variable Efficiency)
        if (!stats.categoryStats) stats.categoryStats = {};
        if (!stats.categoryStats[bet.category]) stats.categoryStats[bet.category] = { w: 0, l: 0 };
        if (isWin) stats.categoryStats[bet.category].w++; else stats.categoryStats[bet.category].l++;
    },

    updateUserStats(bet, result, outcomeVal) {
        const isWin = result === 'WIN';
        const winReward = (bet.category === 'Dozens' || bet.category === 'Columns') ? 2 : 1;

        this.userStats.totalBets++;
        if (isWin) {
            this.userStats.totalWins++; this.userStats.netUnits += winReward;
            if (this.userStats.currentStreak >= 0) this.userStats.currentStreak++; else this.userStats.currentStreak = 1;
        } else {
            this.userStats.totalLosses++; this.userStats.netUnits -= 1;
            if (this.userStats.currentStreak <= 0) this.userStats.currentStreak--; else this.userStats.currentStreak = -1;
        }
        this.userStats.bankrollHistory.push(this.userStats.netUnits);

        const cat = bet.category || 'Unknown';

        this.confirmedBetLog.unshift({
            betNumber: this.userStats.totalBets, pattern: bet.pattern, category: cat, bet: bet.betName,
            resultSpin: outcomeVal, outcome: result
        });

        // Check Bankroll Targets
        if (this.bankrollTargets.enabled) {
            if (this.userStats.netUnits >= this.bankrollTargets.profit) {
                this.showToast(`🎉 Target Profit Hit! (+${this.userStats.netUnits})`, "success");
            } else if (this.userStats.netUnits <= -this.bankrollTargets.loss) {
                this.showToast(`⚠️ Stop Loss Reached! (${this.userStats.netUnits})`, "warning");
            }
        }
    },

    // --- PATTERN SCANNING ENGINE ---
    scanPatterns(ignoreFilters = false, chasesObj = this.engineChases) {
        let alerts = [];

        const subset = this.getRecentHistory(50);

        if (ignoreFilters || this.activeFilters.color) {
            const seq = this.preparePatternSeq(subset.map(s => s.color), 'G');
            alerts = alerts.concat(this.analyze1to1Sequence(seq, 'Color', 'R', 'B'));
        }
        if (ignoreFilters || this.activeFilters.hl) {
            const seq = this.preparePatternSeq(subset.map(s => s.hl), 'Z');
            alerts = alerts.concat(this.analyze1to1Sequence(seq, 'High/Low', 'H', 'L'));
        }
        if (ignoreFilters || this.activeFilters.oe) {
            const oeSeq = subset.map(s => s.oe === 'Odd' ? 'O' : (s.oe === 'Even' ? 'E' : 'Z'));
            const seq = this.preparePatternSeq(oeSeq, 'Z');
            alerts = alerts.concat(this.analyze1to1Sequence(seq, 'Odd/Even', 'O', 'E'));
        }

        if (ignoreFilters || this.activeFilters.doz) {
            if (chasesObj['Dozens']) {
                let c = chasesObj['Dozens'];
                alerts.push({ category: 'Dozens', patternName: 'FALSE BREAK', msg: `BET ${c.target}`, sub: `Chase Attempt ${4 - c.attemptsLeft}/3`, style: this.getStyle(c.target), targetToken: c.target });
            } else {
                const seq = this.preparePatternSeq(subset.map(s => s.doz), 'Z');
                alerts = alerts.concat(this.analyze2to1Sequence(seq, 'Dozens'));
            }
        }
        if (ignoreFilters || this.activeFilters.col) {
            if (chasesObj['Columns']) {
                let c = chasesObj['Columns'];
                alerts.push({ category: 'Columns', patternName: 'FALSE BREAK', msg: `BET ${c.target}`, sub: `Chase Attempt ${4 - c.attemptsLeft}/3`, style: this.getStyle(c.target), targetToken: c.target });
            } else {
                const seq = this.preparePatternSeq(subset.map(s => s.col), 'Z');
                alerts = alerts.concat(this.analyze2to1Sequence(seq, 'Columns'));
            }
        }
        return alerts;
    },

    analyze2to1Sequence(seq, categoryName) {
        let found = [];
        const n = seq.length;
        let zigZagFound = false;
        if (n < 4) return found;

        const last4 = seq.slice(-4);
        const last5 = n >= 5 ? seq.slice(-5) : [];
        const isPure4 = n > 4 ? seq[n - 5] !== seq[n - 4] : true;
        const isPure5 = n > 5 ? seq[n - 6] !== seq[n - 5] : true;

        if (!zigZagFound) {
            // 1. Strict Zig-Zag (A B A B) - Stronger
            if (isPure4 && last4[0] === last4[2] && last4[1] === last4[3] && last4[0] !== last4[1]) {
                // Only trigger if this is the START of the chop (prev != B)
                if (n === 4 || seq[n - 5] !== last4[1]) {
                    let target = last4[0]; // Back to A
                    found.push({ category: categoryName, patternName: 'ZIG-ZAG', msg: `BET ${target}`, sub: 'Strict Chop', style: this.getStyle(target), targetToken: target });
                    zigZagFound = true;
                }
            }
            // 2. Anchor Zig-Zag (A x A y) - Standard
            else if (isPure4 && last4[0] === last4[2] && last4[1] !== last4[0] && last4[3] !== last4[0]) {
                let anchor = last4[0];
                found.push({ category: categoryName, patternName: 'ZIG-ZAG', msg: `BET ${anchor}`, sub: 'Anchor Follow', style: this.getStyle(anchor), targetToken: anchor });
                zigZagFound = true;
            }
            if (zigZagFound) return found;
        }

        if (isPure4 && last4[0] === last4[2] && last4[2] === last4[3] && last4[1] !== last4[0]) {
            let target = last4[1];
            found.push({ category: categoryName, patternName: '1-2-3 BUILD', msg: `BET ${target}`, sub: 'Block Build (A)', style: this.getStyle(target), targetToken: target });
        }

        // 3-1-1 DOWN (A A A B -> Predict A)
        if (isPure4 && last4[0] === last4[1] && last4[1] === last4[2] && last4[2] !== last4[3]) {
            let target = last4[2]; // A
            found.push({ category: categoryName, patternName: '3-1-1 DOWN', msg: `BET ${target}`, sub: 'Streak Return', style: this.getStyle(target), targetToken: target });
        }

        if (n >= 5) {
            if (isPure5 && last5[0] === last5[4] && last5[1] === last5[2] && last5[2] === last5[3] && last5[0] !== last5[1]) {
                let target = last5[1];
                found.push({ category: categoryName, patternName: '1-1-3 BURST', msg: `BET ${target}`, sub: 'Burst Follow', style: this.getStyle(target), targetToken: target });
            }

            if (isPure5 && last5[0] === last5[1] && last5[1] === last5[2] && last5[2] === last5[3] && last5[4] !== last5[0]) {
                let target = last5[0];
                found.push({ category: categoryName, patternName: 'FALSE BREAK', msg: `BET ${target}`, sub: 'Return Trend', style: this.getStyle(target), targetToken: target });
            }
        }

        if (n >= 6) {
            const s0 = seq[n - 6];
            const s1 = seq[n - 5];
            const s2 = seq[n - 4];
            const s3 = seq[n - 3];
            const s4 = seq[n - 2];
            const s5 = seq[n - 1];

            // 3-2-1 MIRROR: B | A A A B B -> Predict A
            if (s0 === s4 && s4 === s5 && s1 === s2 && s2 === s3 && s1 !== s4) {
                let target = s1;
                found.push({ category: categoryName, patternName: '3-2-1 MIRROR', msg: `BET ${target}`, sub: 'Pyramid Tip', style: this.getStyle(target), targetToken: target });
            }
        }
        return found;
    },

    analyze1to1Sequence(seq, categoryName, typeA, typeB) {
        let found = [];
        const n = seq.length;
        let zigZagFound = false;
        if (n < 4) return found;

        const getName = (t) => {
            if (categoryName === 'Color') return t === 'R' ? 'RED' : 'BLACK';
            if (categoryName === 'High/Low') return t === 'H' ? 'HIGH' : 'LOW';
            if (categoryName === 'Odd/Even') return t === 'O' ? 'ODD' : 'EVEN';
            return t;
        };

        // Helper: Check if the value at index is the separator (or if index is out of bounds/start of game)
        const isSeparator = (idx, val) => {
            if (idx < 0) return true;
            return seq[idx] === val;
        };

        // --- 1. FALSE BREAK (Length 5+) ---
        // Streak of 5+ (Type X), broken by 1 (Type Y). Predict X.
        // Structure: ... X X X X X Y
        if (n >= 6) {
            const breaker = seq[n - 1];
            const streakType = breaker === typeA ? typeB : typeA;
            // Check previous 5 are streakType
            if (seq[n - 2] === streakType &&
                seq[n - 3] === streakType &&
                seq[n - 4] === streakType &&
                seq[n - 5] === streakType &&
                seq[n - 6] === streakType) {
                found.push({ category: categoryName, patternName: 'FALSE BREAK', msg: `BET ${getName(streakType)}`, sub: 'Trend Return', style: this.getStyle(streakType), targetToken: streakType });
            }
        }

        // --- 2. FLOW (Streak 4) ---
        // A A A A
        if (n >= 4) {
            const last4 = seq.slice(-4);
            if (last4.every(v => v === typeA) && (n === 4 || seq[n - 5] !== typeA))
                found.push({ category: categoryName, patternName: 'FLOW', msg: `BET ${getName(typeA)}`, sub: 'Streak Follow', style: this.getStyle(typeA), targetToken: typeA });
            else if (last4.every(v => v === typeB) && (n === 4 || seq[n - 5] !== typeB))
                found.push({ category: categoryName, patternName: 'FLOW', msg: `BET ${getName(typeB)}`, sub: 'Streak Follow', style: this.getStyle(typeB), targetToken: typeB });
        }

        // --- 3-1-1 DOWN (Wall | A A A B -> Predict A) ---
        if (n >= 5) {
            const s0 = seq[n - 5]; // Wall (B)
            const s1 = seq[n - 4]; // A
            const s2 = seq[n - 3]; // A
            const s3 = seq[n - 2]; // A
            const s4 = seq[n - 1]; // B

            if (s0 !== s1 && s1 === s2 && s2 === s3 && s3 !== s4) {
                const target = s1; // Predict A
                found.push({ category: categoryName, patternName: '3-1-1 DOWN', msg: `BET ${getName(target)}`, sub: 'Momentum Death', style: this.getStyle(target), targetToken: target });
            }
        }

        // --- 1-1-3 BURST (Wall | A B A A -> Predict A) ---
        if (n >= 5) {
            const s0 = seq[n - 5]; // Wall (B)
            const s1 = seq[n - 4]; // A
            const s2 = seq[n - 3]; // B
            const s3 = seq[n - 2]; // A
            const s4 = seq[n - 1]; // A

            if (s0 !== s1 && s1 !== s2 && s2 !== s3 && s3 === s4) {
                const target = s4; // Predict A
                found.push({ category: categoryName, patternName: '1-1-3 BURST', msg: `BET ${getName(target)}`, sub: 'Momentum Explosion', style: this.getStyle(target), targetToken: target });
            }
        }

        // --- 1-2-3 BUILD (Sep | B | A A | B B -> Predict B) ---
        if (n >= 6) {
            // Indices: n-6(Sep), n-5(B), n-4(A), n-3(A), n-2(B), n-1(B)
            const s0 = seq[n - 6]; // Sep
            const s1 = seq[n - 5]; // B (1)
            const s2 = seq[n - 4]; // A (2)
            const s3 = seq[n - 3]; // A (2)
            const s4 = seq[n - 2]; // B (2)
            const s5 = seq[n - 1]; // B (2)

            if (s0 !== s1 && s1 !== s2 && s2 === s3 && s3 !== s4 && s4 === s5) {
                const target = s5; // Predict B to make it 3
                found.push({ category: categoryName, patternName: '1-2-3 BUILD', msg: `BET ${getName(target)}`, sub: 'Staircase Build', style: this.getStyle(target), targetToken: target });
            }

            // 3-2-1 MIRROR: B | A A A B B -> Predict A
            if (s0 === s4 && s4 === s5 && s1 === s2 && s2 === s3 && s1 !== s4) {
                const target = s1;
                found.push({ category: categoryName, patternName: '3-2-1 MIRROR', msg: `BET ${getName(target)}`, sub: 'Pyramid Tip', style: this.getStyle(target), targetToken: target });
            }
        }

        // --- 3. ZIG-ZAG (Chop 4) ---
        // A B A B
        // --- 3. ZIG-ZAG (Chop) ---

        // 3b. STANDARD ZIG-ZAG (A B A B)
        if (n >= 4) {
            const s0 = seq[n - 4];
            const s1 = seq[n - 3];
            const s2 = seq[n - 2];
            const s3 = seq[n - 1];

            // Only trigger if this is the START of the chop (previous item breaks the pattern or doesn't exist)
            // Check against s1 (the 'B' in A B A B). If prev was B, it's a continuation.
            const isChopStart = n === 4 || seq[n - 5] !== s1;

            if (s0 !== s1 && s1 !== s2 && s2 !== s3 && isChopStart) {
                const prediction = s3 === typeA ? typeB : typeA;
                found.push({ category: categoryName, patternName: 'ZIG-ZAG', msg: `BET ${getName(prediction)}`, sub: 'Chop Start', style: this.getStyle(prediction), targetToken: prediction });
                return found;
            }
        }

        // 8. 1-1-2 BUILD (Structure: Wall + Alternating -> B B | A B A -> Bet A)
        if (n >= 5) {
            const s0 = seq[n - 5]; // Wall
            const s1 = seq[n - 4]; // Wall
            const s2 = seq[n - 3]; // A
            const s3 = seq[n - 2]; // B
            const s4 = seq[n - 1]; // A

            if (s0 === s1 && s1 !== s2 && s2 !== s3 && s3 !== s4) {
                const prediction = s4;
                found.push({ category: categoryName, patternName: '1-1-2 BUILD', msg: `BET ${getName(prediction)}`, sub: 'Structure Completion', style: this.getStyle(prediction), targetToken: prediction });
            }
        }

        return found;
    },


    // --- RATIO/NET BASED UI RENDERERS ---
    calculatePredictionResult(bets, currentSpin) {
        if (!bets || bets.length === 0) return { text: '-', style: '', tooltip: '' };

        const isCompactMobile = this.isCompactMobileView();
        let hits = 0;
        let details = [];
        let netProfit = 0;

        bets.forEach(bet => {
            let isWin = false;
            if (bet.category === 'Color') isWin = (currentSpin.color === bet.target);
            else if (bet.category === 'High/Low') isWin = (currentSpin.hl === bet.target);
            else if (bet.category === 'Odd/Even') {
                const type = currentSpin.oe === 'Odd' ? 'O' : (currentSpin.oe === 'Even' ? 'E' : 'Z');
                isWin = (type === bet.target);
            }
            else if (bet.category === 'Dozens') isWin = (currentSpin.doz === bet.target);
            else if (bet.category === 'Columns') isWin = (currentSpin.col === bet.target);

            if (isWin) {
                hits++;
                netProfit += (bet.category === 'Dozens' || bet.category === 'Columns') ? 2 : 1;
            } else {
                netProfit -= 1;
            }

            details.push(`${bet.betName} (${isWin ? 'WIN' : 'LOSS'})`);
        });

        details.push(`Net Units: ${netProfit > 0 ? '+' : ''}${netProfit}`);

        if (bets.length === 1) {
            const isWin = hits === 1;
            let text = bets[0].betName.replace('BET ', '');
            if (isCompactMobile) text = this.compactTokenLabel(text);
            return { text: text, style: isWin ? 'text-green-400' : 'text-gray-500', tooltip: details.join('\n') };
        }

        let style = 'text-gray-500';
        if (hits === bets.length) style = 'text-green-400 font-black';
        else if (netProfit > 0) style = 'text-yellow-400 font-bold';
        else if (hits > 0) style = 'text-orange-400 font-bold';

        const resultText = isCompactMobile ? `${hits}/${bets.length}` : `${hits}/${bets.length} HIT`;
        return { text: resultText, style: style, tooltip: details.join('\n') };
    },

    updateFilterEfficiencies() {
        const cats = { 'Color': { w: 0, t: 0 }, 'High/Low': { w: 0, t: 0 }, 'Odd/Even': { w: 0, t: 0 }, 'Dozens': { w: 0, t: 0 }, 'Columns': { w: 0, t: 0 } };
        const pats = {};
        const categoryFilterMap = { 'Color': 'color', 'High/Low': 'hl', 'Odd/Even': 'oe', 'Dozens': 'doz', 'Columns': 'col' };
        this.PATTERN_CONFIG.forEach(p => pats[p.key] = { w: 0, t: 0 });

        this.history.forEach(spin => {
            if (!spin.bets) return;
            spin.bets.forEach(bet => {
                let isWin = false;
                if (bet.category === 'Color') isWin = (spin.color === bet.target);
                else if (bet.category === 'High/Low') isWin = (spin.hl === bet.target);
                else if (bet.category === 'Odd/Even') { const type = spin.oe === 'Odd' ? 'O' : (spin.oe === 'Even' ? 'E' : 'Z'); isWin = (type === bet.target); }
                else if (bet.category === 'Dozens') isWin = (spin.doz === bet.target);
                else if (bet.category === 'Columns') isWin = (spin.col === bet.target);

                if (cats[bet.category]) {
                    cats[bet.category].t++;
                    if (isWin) cats[bet.category].w++;
                }
                const categoryFilterKey = categoryFilterMap[bet.category] || bet.category;
                const isCategoryActive = this.activeFilters[bet.category] === true || this.activeFilters[categoryFilterKey] === true;
                if (pats[bet.pattern] && isCategoryActive) {
                    pats[bet.pattern].t++;
                    if (isWin) pats[bet.pattern].w++;
                }
            });
        });

        const update = (key, id, source) => {
            const el = document.getElementById(id);
            if (!el) return;
            const d = source[key];
            const rate = d.t === 0 ? 0 : Math.round((d.w / d.t) * 100);
            el.innerText = ` [${rate}%]`;
            if (d.t === 0) el.className = "text-[10px] ml-1 text-gray-600";
            else if (rate >= 50) el.className = "text-[10px] ml-1 text-green-400 font-bold";
            else el.className = "text-[10px] ml-1 text-red-400 font-bold";
        };

        update('Color', 'lbl-filter-color', cats);
        update('High/Low', 'lbl-filter-hl', cats);
        update('Odd/Even', 'lbl-filter-oe', cats);
        update('Dozens', 'lbl-filter-doz', cats);
        update('Columns', 'lbl-filter-col', cats);

        this.PATTERN_CONFIG.forEach(p => {
            update(p.key, `lbl-filter-${p.key}`, pats);
        });
    },

    renderDashboard() {
        const dashboard = document.getElementById('roulette-dashboard');
        const isCompactMobile = this.isCompactMobileView();
        const categoryFilterMap = { 'Color': 'color', 'High/Low': 'hl', 'Odd/Even': 'oe', 'Dozens': 'doz', 'Columns': 'col' };
        dashboard.innerHTML = '';
        dashboard.classList.remove('mobile-overflow-hint');
        const anyFilterActive = Object.values(this.activeFilters).some(v => v === true);
        this.updateFilterEfficiencies();

        if (!anyFilterActive) {
            dashboard.innerHTML = `<div class="grid-item w-full flex flex-col items-center justify-center text-gray-500 py-2 border border-dashed border-white/10 rounded-xl"><span class="font-mono text-xs uppercase tracking-widest text-red-500"><i class="fas fa-filter-circle-xmark"></i> ALL FILTERS OFF</span></div>`;
            return;
        }
        if (this.pendingBets.length === 0) {
            const scanLabel = this.ghostMode ? 'Scanning Patterns (Ghost Mode Active)' : 'Scanning Patterns';
            dashboard.innerHTML = `<div class="grid-item w-full flex flex-col items-center justify-center text-gray-500 py-2 border border-dashed border-white/10 rounded-xl"><span class="font-mono text-xs uppercase tracking-widest text-gray-500">${scanLabel}</span></div>`;
            return;
        }

        dashboard.classList.toggle('mobile-overflow-hint', isCompactMobile && this.pendingBets.length > 1);
        dashboard.setAttribute('data-card-count', String(this.pendingBets.length));

        const patStats = {};
        this.history.forEach(spin => {
            if (!spin.bets) return;
            spin.bets.forEach(bet => {
                const categoryFilterKey = categoryFilterMap[bet.category] || bet.category;
                const isCategoryActive = this.activeFilters[bet.category] === true || this.activeFilters[categoryFilterKey] === true;
                if (!isCategoryActive) return;

                if (!patStats[bet.pattern]) patStats[bet.pattern] = { w: 0, l: 0 };
                if (this.isBetWin(spin, bet.category, bet.target)) patStats[bet.pattern].w++;
                else patStats[bet.pattern].l++;
            });
        });

        // Sort pendingBets by Category Efficiency (Descending)
        this.pendingBets.sort((a, b) => {
            const getRate = (bet) => {
                const cStat = this.engineStatsMaster.categoryStats ? this.engineStatsMaster.categoryStats[bet.category] : null;
                if (cStat && (cStat.w + cStat.l > 0)) {
                    return Math.round((cStat.w / (cStat.w + cStat.l)) * 100);
                }
                return 0;
            };
            const diff = getRate(b) - getRate(a);
            return diff !== 0 ? diff : (a.id - b.id);
        });

        let maxRate = -1; let minRate = 101;
        Object.keys(patStats).forEach(key => {
            const s = patStats[key]; const total = s.w + s.l;
            if (total > 0) {
                const rate = Math.round((s.w / total) * 100);
                if (rate > maxRate) maxRate = rate; if (rate < minRate) minRate = rate;
            }
        });

        const isDense = this.pendingBets.length > (isCompactMobile ? 3 : 4);

        const confidenceMap = {};
        this.pendingBets.forEach(b => {
            const k = b.category + b.target;
            confidenceMap[k] = (confidenceMap[k] || 0) + 1;
        });

        this.pendingBets.forEach((bet, index) => {
            const div = document.createElement('div');
            let efficiencyClass = ''; let badgeHtml = '';
            const pStat = patStats[bet.pattern];

            let patRate = 0;
            if (pStat && (pStat.w + pStat.l > 0)) {
                patRate = Math.round((pStat.w / (pStat.w + pStat.l)) * 100);
                if (maxRate !== minRate) {
                    if (patRate === maxRate) {
                        efficiencyClass = 'card-best';
                        badgeHtml = isCompactMobile ? '<span class="badge-hot">HOT</span>' : '<span class="badge-hot">🔥 HOT</span>';
                    } else if (patRate === minRate) {
                        efficiencyClass = 'card-worst';
                        badgeHtml = isCompactMobile ? '<span class="badge-cold">COLD</span>' : '<span class="badge-cold">❄️ COLD</span>';
                    }
                }
            }

            const cStat = this.engineStatsMaster.categoryStats ? this.engineStatsMaster.categoryStats[bet.category] : null;
            let catRate = 0;
            if (cStat && (cStat.w + cStat.l > 0)) {
                catRate = Math.round((cStat.w / (cStat.w + cStat.l)) * 100);
            }

            // Calculate Trend (Last 10 outcomes for this category)
            let trendHtml = '';
            if (this.showTrendIcons) {
                let recentWins = 0;
                let recentOps = 0;
                const trendLimit = 10;

                for (let i = this.history.length - 1; i >= 0; i--) {
                    if (recentOps >= trendLimit) break;
                    const hSpin = this.history[i];
                    if (!hSpin.bets) continue;
                    const catBets = hSpin.bets.filter(b => b.category === bet.category);
                    catBets.forEach(b => {
                        if (recentOps >= trendLimit) return;
                        let isWin = false;
                        if (b.category === 'Color') isWin = (hSpin.color === b.target);
                        else if (b.category === 'High/Low') isWin = (hSpin.hl === b.target);
                        else if (b.category === 'Odd/Even') { const type = hSpin.oe === 'Odd' ? 'O' : (hSpin.oe === 'Even' ? 'E' : 'Z'); isWin = (type === b.target); }
                        else if (b.category === 'Dozens') isWin = (hSpin.doz === b.target);
                        else if (b.category === 'Columns') isWin = (hSpin.col === b.target);
                        if (isWin) recentWins++;
                        recentOps++;
                    });
                }

                if (recentOps > 0) {
                    const recentRate = Math.round((recentWins / recentOps) * 100);
                    const diff = recentRate - catRate;

                    if (diff >= 5) {
                        trendHtml = `<span class="ml-1.5 inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-green-900/60 border border-green-500/50" title="Trending Up (+${diff}%)"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg></span>`;
                    } else if (diff <= -5) {
                        trendHtml = `<span class="ml-1.5 inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-red-900/60 border border-red-500/50" title="Trending Down (${diff}%)"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg></span>`;
                    } else {
                        trendHtml = `<span class="ml-1.5 inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-gray-800 border border-gray-600/50" title="Stable"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg></span>`;
                    }
                }
            }

            if (confidenceMap[bet.category + bet.target] > 1) {
                efficiencyClass = 'card-confidence';
                badgeHtml += isCompactMobile ? '<span class="badge-gold">CONF</span>' : '<span class="badge-gold">★ HIGH CONFIDENCE</span>';
            }

            const bgClass = bet.confirmed ? 'card-confirmed' : '';
            const baseClass = `grid-item p-2 pl-2.5 flex flex-col justify-between relative overflow-hidden select-none cursor-pointer`;
            div.className = `${baseClass} ${bgClass} ${bet.style} ${efficiencyClass}`;
            if (isCompactMobile) {
                div.style.flex = isDense ? "1 1 126px" : "1 1 142px";
                div.style.maxWidth = isDense ? "164px" : "182px";
            } else {
                div.style.flex = isDense ? "1 1 110px" : "1 1 160px";
                div.style.maxWidth = "280px";
            }
            div.setAttribute('ondblclick', `app.roulette.toggleBetConfirmation(${index})`);

            const titleSize = isCompactMobile ? (isDense ? 'text-base' : 'text-lg') : (isDense ? 'text-sm' : 'text-lg');
            const subSize = isCompactMobile ? 'text-[9px]' : (isDense ? 'text-[9px]' : 'text-[10px]');
            const tagSize = isCompactMobile ? 'text-[8px]' : (isDense ? 'text-[7px]' : 'text-[8px]');
            const patSize = isCompactMobile ? 'text-[8px]' : (isDense ? 'text-[8px]' : 'text-[9px]');
            const scaleBadge = !isCompactMobile && isDense ? 'transform: scale(0.85); transform-origin: left center;' : '';
            const scaleCheckbox = !isCompactMobile && isDense ? 'transform: scale(0.8); transform-origin: top right;' : '';

            const categoryLabel = isCompactMobile ? this.compactCategoryLabel(bet.category) : bet.category;
            const betLabel = isCompactMobile ? this.compactTokenLabel(bet.betName.replace('BET ', '')) : bet.betName;
            const patternLabel = isCompactMobile ? this.compactPatternLabel(bet.pattern) : bet.pattern;
            const trendMarkup = (isCompactMobile && isDense) ? '' : trendHtml;

            if (isCompactMobile) {
                div.innerHTML = `
                    <div class="w-full flex justify-between items-start relative z-10 gap-1">
                        <div class="flex flex-wrap items-center gap-1 flex-1 overflow-hidden opacity-90">
                            <span class="${tagSize} uppercase font-bold tracking-widest opacity-80 bg-black bg-opacity-40 px-1 rounded truncate max-w-full">${categoryLabel}</span>
                            ${badgeHtml}
                        </div>
                        <div class="z-20 shrink-0" title="Confirm Bet to Track">
                            <input type="checkbox" class="bet-checkbox" ${bet.confirmed ? 'checked' : ''} onclick="app.roulette.toggleBetConfirmation(${index})">
                        </div>
                    </div>
                    <div class="flex flex-col text-left mt-1 relative z-10 min-w-0">
                        <div class="flex items-center justify-between gap-1 min-w-0">
                            <span class="${titleSize} font-black leading-none truncate text-white drop-shadow-md">${betLabel}</span>
                            <span class="${subSize} shrink-0 font-bold text-yellow-300 opacity-90">${catRate}%${trendMarkup}</span>
                        </div>
                        <div class="flex items-center justify-between mt-0.5 min-w-0">
                            <span class="${patSize} font-bold text-blue-300 truncate">${patternLabel}</span>
                            <span class="${patSize} font-mono text-gray-300 shrink-0">${patRate}%</span>
                        </div>
                    </div>
                `;
            } else {
                div.innerHTML = `
                    <div class="w-full flex justify-between items-start relative z-10 gap-1">
                        <div class="flex flex-wrap items-center gap-1 flex-1 overflow-hidden opacity-90" style="${scaleBadge}">
                            <span class="${tagSize} uppercase font-bold tracking-widest opacity-80 bg-black bg-opacity-40 px-1 rounded truncate max-w-full">${categoryLabel}</span>
                            ${badgeHtml}
                        </div>
                        <div class="z-20 shrink-0" style="${scaleCheckbox}" title="Confirm Bet to Track">
                            <input type="checkbox" class="bet-checkbox" ${bet.confirmed ? 'checked' : ''} onclick="app.roulette.toggleBetConfirmation(${index})">
                        </div>
                    </div>
                    <div class="flex flex-col text-left mt-1 relative z-10">
                        <div class="flex items-baseline gap-1 overflow-hidden">
                            <span class="${titleSize} font-black leading-none truncate text-white drop-shadow-md">${betLabel}</span>
                            <span class="${subSize} font-bold text-yellow-400 opacity-90">(${catRate}%)${trendMarkup}</span>
                        </div>
                        <div class="flex items-center gap-1 mt-0.5 overflow-hidden">
                            <span class="${subSize} font-bold text-blue-300 truncate">${patternLabel}</span>
                            <span class="${subSize} font-mono text-gray-400">(${patRate}%)</span>
                        </div>
                    </div>
                `;
            }
            dashboard.appendChild(div);
        });
    },

    renderRow(spin) {
        const tbody = document.getElementById('historyBody');
        const tr = document.createElement('tr');
        const isCompactMobile = this.isCompactMobileView();
        const bgNum = spin.val === 0 ? 'bg-green-600 text-white' : (spin.color === 'R' ? 'bg-red-600 text-white' : 'bg-black text-white');
        const cHL = spin.hl === 'H' ? 'cat-hl-high' : (spin.hl === 'L' ? 'cat-hl-low' : '');
        const cOE = spin.oe === 'Odd' ? 'cat-oe-odd' : (spin.oe === 'Even' ? 'cat-oe-even' : '');
        const cDZ = spin.doz === 'D1' ? 'cat-doz-d1' : (spin.doz === 'D2' ? 'cat-doz-d2' : (spin.doz === 'D3' ? 'cat-doz-d3' : ''));
        const cCL = spin.col === 'C1' ? 'cat-col-c1' : (spin.col === 'C2' ? 'cat-col-c2' : (spin.col === 'C3' ? 'cat-col-c3' : ''));

        const visibleBets = (spin.bets || []).filter(bet => {
            // Ensure the specific pattern isn't filtered out by the user
            if (this.activeFilters[bet.pattern] === false) return false;

            if (bet.category === 'Color') return this.activeFilters.color;
            if (bet.category === 'High/Low') return this.activeFilters.hl;
            if (bet.category === 'Odd/Even') return this.activeFilters.oe;
            if (bet.category === 'Dozens') return this.activeFilters.doz;
            if (bet.category === 'Columns') return this.activeFilters.col;
            return true;
        });

        const pObj = this.calculatePredictionResult(visibleBets, spin);
        const zTxt = spin.val === 0 ? '<span style="color:var(--zero-green); font-weight:900">ZERO</span>' : '';
        const hlTxt = spin.hl === 'H' ? (isCompactMobile ? 'H' : 'High') : (isCompactMobile ? 'L' : 'Low');
        const oeTxt = spin.oe === 'Odd' ? (isCompactMobile ? 'O' : 'Odd') : (spin.oe === 'Even' ? (isCompactMobile ? 'E' : 'Even') : spin.oe);

        tr.innerHTML = `
            <td class="data-cell w-[8%] text-gray-400 border-white/10 text-xs font-mono">${spin.spinNumber}</td>
            <td class="data-cell w-[10%] ${bgNum} text-lg border-white/20">${spin.val}</td>
            ${this.gridSettings.hl ? `<td class="data-cell w-[18%] ${cHL}">${zTxt || hlTxt}</td>` : ''}
            ${this.gridSettings.oe ? `<td class="data-cell w-[18%] ${cOE}">${zTxt || oeTxt}</td>` : ''}
            ${this.gridSettings.doz ? `<td class="data-cell w-[12%] ${cDZ}">${zTxt || spin.doz}</td>` : ''}
            ${this.gridSettings.col ? `<td class="data-cell w-[12%] ${cCL}">${zTxt || spin.col}</td>` : ''}
            <td class="data-cell w-[22%] bg-black/40 border-l border-white/10 font-bold ${pObj.style}" title="${pObj.tooltip}">${pObj.text}</td>
        `;
        tbody.appendChild(tr);
    },

    toggleBetConfirmation(index) {
        if (this.pendingBets[index]) {
            this.pendingBets[index].confirmed = !this.pendingBets[index].confirmed;
            this.renderDashboard();
            this.saveLocal();
        }
    },

    undoSpin() {
        if (this.history.length === 0) return; this.history.pop();
        document.getElementById('historyBody').innerHTML = '';
        this.history.forEach(spin => this.renderRow(spin));
        this.engineChases = { Dozens: null, Columns: null };
        this.bgEngineChases = { Dozens: null, Columns: null };

        this.checkNewChases();

        this.recalculateAllStats();
        this.recalculateDashboard();

        const bgAlerts = this.scanPatterns(true, this.bgEngineChases);
        this.backgroundBets = bgAlerts.map(alert => ({
            pattern: alert.patternName,
            category: alert.category,
            target: alert.targetToken,
            betName: alert.msg,
            style: alert.style,
            sub: alert.sub
        }));

        this.saveLocal();
    },

    resetStats() {
        this.showResetModal();
    },

    recalculateAllStats() {
        this.engineStatsMaster = this.createStatObject();
        this.engineStats1to1 = this.createStatObject();
        this.engineStats2to1 = this.createStatObject();

        this.history.forEach(spin => {
            if (!spin.bets) return;
            spin.bets.forEach(bet => {
                let isWin = false;
                if (bet.category === 'Color') isWin = (spin.color === bet.target);
                else if (bet.category === 'High/Low') isWin = (spin.hl === bet.target);
                else if (bet.category === 'Odd/Even') { const type = spin.oe === 'Odd' ? 'O' : (spin.oe === 'Even' ? 'E' : 'Z'); isWin = (type === bet.target); }
                else if (bet.category === 'Dozens') isWin = (spin.doz === bet.target);
                else if (bet.category === 'Columns') isWin = (spin.col === bet.target);

                const result = isWin ? 'WIN' : 'LOSS';

                this.updateStatObj(this.engineStatsMaster, bet, result);
                if (['Color', 'High/Low', 'Odd/Even'].includes(bet.category)) this.updateStatObj(this.engineStats1to1, bet, result);
                else if (['Dozens', 'Columns'].includes(bet.category)) this.updateStatObj(this.engineStats2to1, bet, result);
            });
        });
    },

    toggleAnalytics() {
        const modal = document.getElementById('analyticsModal');
        const isHidden = modal.style.display === 'none' || modal.style.display === '';

        if (isHidden) {
            // Force data refresh to ensure stats are synced with history
            this.recalculateAllStats();
            modal.style.display = 'flex';
            // Use double rAF to ensure layout is calculated before drawing
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    // Force Tab Sync and Render
                    this.switchAnalyticsTab(this.currentAnalyticsTab);
                    if (this.simState.mode === 'simulation') this.runSimulation();
                });
            });
        } else {
            modal.style.display = 'none';
        }
    },

    toggleBetsModal() {
        const modal = document.getElementById('betsModal');
        const isHidden = modal.style.display === 'none' || modal.style.display === '';

        if (isHidden) {
            modal.style.display = 'flex';
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    this.updateActualBetsUI();
                });
            });
        } else {
            modal.style.display = 'none';
        }
    },

    switchBetsTab(tabId) {
        this.currentBetsTab = tabId;
        // Reset all buttons
        const inactiveBtnClass = "flex-1 py-1.5 text-xs font-bold rounded-md transition-all text-gray-400 hover:text-white hover:bg-white/5";
        document.getElementById('seg-trend').className = inactiveBtnClass;
        document.getElementById('seg-analytics').className = inactiveBtnClass;
        document.getElementById('seg-logs').className = inactiveBtnClass;

        // Set active button
        const activeBtn = document.getElementById(`seg-${tabId}`);
        if (activeBtn) {
            activeBtn.className = "flex-1 py-1.5 text-xs font-bold rounded-md transition-all bg-[#007AFF] text-white shadow-lg";
        }

        // Hide all tabs
        document.getElementById('tab-bets-trend').classList.add('hidden');
        document.getElementById('tab-bets-analytics').classList.add('hidden');
        document.getElementById('tab-bets-logs').classList.add('hidden');

        // Show selected tab
        const activeTab = document.getElementById(`tab-bets-${tabId}`);
        if (activeTab) {
            activeTab.classList.remove('hidden');
            // Re-render UI elements to ensure graphs/heatmaps draw correctly after being un-hidden
            if (tabId === 'trend' || tabId === 'analytics') {
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        this.updateActualBetsUI();
                    });
                });
            }
        }
    },

    toggleHeatmapMode(mode) {
        this.heatmapMode = mode;
        const btnPat = document.getElementById('hm-btn-pat');
        const btnCat = document.getElementById('hm-btn-cat');
        const activeClass = "px-3 py-1 text-[10px] font-bold rounded-md transition-all bg-[#007AFF] text-white shadow-lg";
        const inactiveClass = "px-3 py-1 text-[10px] font-bold rounded-md transition-all text-gray-400 hover:text-white hover:bg-white/5";

        if (mode === 'PATTERNS') {
            btnPat.className = activeClass;
            btnCat.className = inactiveClass;
        } else {
            btnPat.className = inactiveClass;
            btnCat.className = activeClass;
        }
        this.updateAnalyticsUI();
    },

    toggleHeatmapMetric() {
        this.heatmapMetric = this.heatmapMetric === 'SHARE' ? 'EFFICIENCY' : 'SHARE';
        this.updateAnalyticsUI();
    },

    updatePatternHeatmap(statsObj) {
        const pBody = document.getElementById('patternStatsBody');
        pBody.innerHTML = '';

        const headEl = document.getElementById('hm-header-metric');
        if (headEl) headEl.innerText = this.heatmapMetric === 'SHARE' ? 'Share %' : 'Eff %';

        const globalTotalSpins = Math.max(1, this.history.length);
        let items = [];
        let globalTotalWins = 0;

        // Unified Logic: Calculate from History on the fly for perfect filtering
        const calculatedStats = {};

        this.history.forEach(spin => {
            if (!spin.bets) return;
            spin.bets.forEach(bet => {
                // Filter based on Tab
                if (this.currentAnalyticsTab === '1to1' && !['Color', 'High/Low', 'Odd/Even'].includes(bet.category)) return;
                if (this.currentAnalyticsTab === '2to1' && !['Dozens', 'Columns'].includes(bet.category)) return;

                let isWin = false;
                if (bet.category === 'Color') isWin = (spin.color === bet.target);
                else if (bet.category === 'High/Low') isWin = (spin.hl === bet.target);
                else if (bet.category === 'Odd/Even') { const type = spin.oe === 'Odd' ? 'O' : (spin.oe === 'Even' ? 'E' : 'Z'); isWin = (type === bet.target); }
                else if (bet.category === 'Dozens') isWin = (spin.doz === bet.target);
                else if (bet.category === 'Columns') isWin = (spin.col === bet.target);

                // Determine Key (Category Name or Pattern Name)
                const key = this.heatmapMode === 'CATEGORIES' ? bet.category : bet.pattern;

                if (!calculatedStats[key]) calculatedStats[key] = { w: 0, l: 0 };

                if (isWin) calculatedStats[key].w++;
                else calculatedStats[key].l++;
            });
        });

        // Filter out 0 activity items
        const activeItems = Object.entries(calculatedStats).filter(([_, s]) => (s.w + s.l) > 0);

        activeItems.forEach(([_, s]) => globalTotalWins += s.w);

        items = activeItems.map(([name, s]) => {
            const total = s.w + s.l;
            const share = globalTotalWins === 0 ? 0 : (s.w / globalTotalWins) * 100;
            const eff = total === 0 ? 0 : (s.w / total) * 100;
            return { name, total, wins: s.w, losses: s.l, share, eff };
        });

        if (items.length === 0) {
            pBody.innerHTML = '<tr><td colspan="4" class="p-4 text-center text-gray-600 italic">No patterns tracked yet</td></tr>';
            return;
        }

        // Sort with Tie-Breakers
        if (this.heatmapMetric === 'SHARE') {
            items.sort((a, b) => {
                if (b.share !== a.share) return b.share - a.share; // Primary: Share Desc
                return b.eff - a.eff; // Secondary: Eff Desc
            });
        } else {
            items.sort((a, b) => {
                if (b.eff !== a.eff) return b.eff - a.eff; // Primary: Eff Desc
                return b.share - a.share; // Secondary: Share Desc (Wins)
            });
        }

        let htmlBuilder = '';
        items.forEach(p => {
            let barWidth, barColor, textVal, textColor;

            if (this.heatmapMetric === 'SHARE') {
                const val = Math.round(p.share);
                barWidth = Math.max(val, 0) + '%';
                barColor = 'bg-[#0A84FF]';
                textVal = val + '%';
                textColor = 'text-[#0A84FF]';
            } else {
                const val = Math.round(p.eff);
                barWidth = Math.max(val, 0) + '%';
                barColor = val >= 50 ? 'bg-[#30D158]' : 'bg-[#FF453A]';
                textVal = val + '%';
                textColor = val >= 50 ? 'text-[#30D158]' : 'text-[#FF453A]';
            }

            htmlBuilder += `
                <tr class="border-b border-white/10 hover:bg-white/5 transition-colors">
                    <td class="p-3">
                        <div class="flex items-center justify-between">
                            <span class="font-bold text-gray-300">${p.name}</span>
                            <button onclick="app.roulette.viewPatternLog('${p.name}')" class="ml-2 w-6 h-6 flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 rounded text-[10px] text-blue-400 transition-colors" title="View Log"><i class="fas fa-list-ul"></i></button>
                        </div>
                    </td>
                    <td class="p-3 text-right text-sm">
                        <span class="text-gray-500">${globalTotalSpins}</span> <span class="text-gray-600">/</span> <span class="text-white font-bold">${p.total}</span>
                    </td>
                    <td class="p-3 text-right text-sm">
                        <span class="text-[#30D158] font-bold">${p.wins}</span> <span class="text-gray-600">/</span> <span class="text-[#FF453A] font-bold">${p.losses}</span>
                    </td>
                    <td class="p-3 text-right font-bold w-32 relative">
                        <div class="absolute inset-0 top-3 bottom-3 bg-gray-700 rounded overflow-hidden mx-2 opacity-30">
                            <div class="h-full ${barColor}" style="width: ${barWidth}"></div>
                        </div>
                        <span class="relative z-10 ${textColor}">${textVal}</span>
                    </td>
                </tr>`;
        });
        pBody.innerHTML = htmlBuilder;
    },

    closePatternLog() {
        document.getElementById('patternLogModal').style.display = 'none';
    },

    viewPatternLog(name) {
        const modal = document.getElementById('patternLogModal');
        const title = document.getElementById('pl-title');
        const body = document.getElementById('pl-body');

        title.innerText = `${name} - Full History`;
        body.innerHTML = '';

        const logs = [];

        // Iterate backwards through history to find matches
        for (let i = this.history.length - 1; i >= 0; i--) {
            const spin = this.history[i];
            if (!spin.bets) continue;

            const relevantBets = spin.bets.filter(b => {
                // Filter based on current Analytics Tab to prevent cross-contamination
                if (this.currentAnalyticsTab === '1to1' && !['Color', 'High/Low', 'Odd/Even'].includes(b.category)) return false;
                if (this.currentAnalyticsTab === '2to1' && !['Dozens', 'Columns'].includes(b.category)) return false;

                if (this.heatmapMode === 'CATEGORIES') return b.category === name;
                return b.pattern === name;
            });

            relevantBets.forEach(bet => {
                let isWin = false;
                if (bet.category === 'Color') isWin = (spin.color === bet.target);
                else if (bet.category === 'High/Low') isWin = (spin.hl === bet.target);
                else if (bet.category === 'Odd/Even') { const type = spin.oe === 'Odd' ? 'O' : (spin.oe === 'Even' ? 'E' : 'Z'); isWin = (type === bet.target); }
                else if (bet.category === 'Dozens') isWin = (spin.doz === bet.target);
                else if (bet.category === 'Columns') isWin = (spin.col === bet.target);

                logs.push({ spinNum: spin.spinNumber, target: bet.target, betName: bet.betName, outcome: isWin ? 'WIN' : 'LOSS' });
            });
        }

        if (logs.length === 0) body.innerHTML = '<tr><td colspan="3" class="p-4 text-center text-gray-500 text-xs italic">No history found</td></tr>';
        else {
            let html = '';
            logs.forEach(log => {
                const color = log.outcome === 'WIN' ? 'text-green-400' : 'text-red-400';
                html += `<tr class="border-b border-white/10"><td class="p-2 text-gray-500 text-xs">#${log.spinNum}</td><td class="p-2 text-gray-300 font-bold text-xs">${log.target} <span class="text-[9px] text-gray-500 font-normal">(${log.betName})</span></td><td class="p-2 text-right font-bold text-xs ${color}">${log.outcome}</td></tr>`;
            });
            body.innerHTML = html;
        }

        modal.style.display = 'flex';
    },

    updateAnalyticsUI() {
        let stats;
        if (this.currentAnalyticsTab === 'master') stats = this.engineStatsMaster;
        else if (this.currentAnalyticsTab === '1to1') stats = this.engineStats1to1;
        else if (this.currentAnalyticsTab === '2to1') stats = this.engineStats2to1;

        const total = stats.totalWins + stats.totalLosses;
        const rate = total === 0 ? 0 : Math.round((stats.totalWins / total) * 100);

        document.getElementById('engHitRate').innerHTML = `${rate}%`;
        document.getElementById('engHitRate').className = `text-2xl font-black ${rate >= 50 ? 'text-green-400' : 'text-red-400'}`;

        document.getElementById('engNetUnits').innerHTML = `${stats.netUnits > 0 ? '+' : ''}${stats.netUnits}`;
        document.getElementById('engNetUnits').className = `text-2xl font-black ${stats.netUnits > 0 ? 'text-green-400' : (stats.netUnits < 0 ? 'text-red-400' : 'text-white')}`;

        document.getElementById('engTotalBets').innerText = total;
        const streakVal = stats.currentStreak;

        document.getElementById('engStreak').innerHTML = `${streakVal > 0 ? 'Won ' + streakVal : (streakVal < 0 ? 'Lost ' + Math.abs(streakVal) : '0')}`;
        document.getElementById('engStreak').className = `text-2xl font-black ${streakVal > 0 ? 'text-green-400' : (streakVal < 0 ? 'text-red-400' : 'text-white')}`;

        this.drawGraph(stats);
        this.updatePatternHeatmap(stats);
    },

    updateActualBetsUI() {
        const total = this.userStats.totalBets; const rate = total === 0 ? 0 : Math.round((this.userStats.totalWins / total) * 100);
        document.getElementById('userNetUnits').innerHTML = `${this.userStats.netUnits > 0 ? '+' : ''}${this.userStats.netUnits}`; document.getElementById('userNetUnits').className = `text-xl font-black ${this.userStats.netUnits > 0 ? 'text-green-400' : (this.userStats.netUnits < 0 ? 'text-red-400' : 'text-white')}`;
        document.getElementById('userHitRate').innerText = `${rate}%`; document.getElementById('userTotalBets').innerText = total;

        if (this.currentBetsTab === 'trend') this.drawUserGraph();
        if (this.currentBetsTab === 'analytics') this.renderUserHeatmap();

        const tbody = document.getElementById('actualBetsBody'); tbody.innerHTML = '';
        if (this.confirmedBetLog.length === 0) tbody.innerHTML = '<tr><td colspan="4" class="p-8 text-center text-gray-600 italic">No bets confirmed yet.</td></tr>';
        else this.confirmedBetLog.forEach(log => {
            const resColor = log.outcome === 'WIN' ? 'text-green-400' : 'text-red-400';
            tbody.innerHTML += `<tr class="hover:bg-white/5 transition-colors"><td class="p-4 border-b border-white/10 text-gray-500">#${log.betNumber}</td><td class="p-4 border-b border-white/10 text-gray-300"><div class="font-bold">${log.pattern}</div></td><td class="p-4 border-b border-white/10 font-bold text-white text-lg">${log.bet}</td><td class="p-4 border-b border-white/10 text-right"><div class="flex flex-col items-end"><span class="text-xs text-gray-500 mb-1">Spin ${log.resultSpin}</span><span class="font-black ${resColor}">${log.outcome}</span></div></td></tr>`;
        });
    },

    drawAdvancedGraph(historyArray, winCount, lossCount, containerId, lineColor = null) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';
        const width = container.clientWidth;
        const totalHeight = container.clientHeight;

        if (!historyArray || historyArray.length < 2 || width === 0) {
            container.innerHTML = `
                <div class="w-full h-full flex flex-col items-center justify-center text-gray-500 space-y-2 select-none">
                    <i class="fas fa-chart-line text-2xl opacity-50"></i>
                    <span class="text-[10px] font-bold uppercase tracking-widest opacity-70">Waiting for Data...</span>
                </div>
            `;
            return;
        }

        // Pre-calculate cumulative stats for scrubber optimization
        const cumWins = [0];
        const cumLoss = [0];
        for (let i = 1; i < historyArray.length; i++) {
            const isWin = historyArray[i] > historyArray[i - 1];
            const isLoss = historyArray[i] < historyArray[i - 1];
            cumWins.push(cumWins[i - 1] + (isWin ? 1 : 0));
            cumLoss.push(cumLoss[i - 1] + (isLoss ? 1 : 0));
        }

        const chartHeight = totalHeight * 0.8;
        const hudHeight = totalHeight * 0.2;
        const padding = 10;

        // Store data for scrubbing
        window.graphData[containerId] = {
            history: historyArray,
            cumWins: cumWins,
            cumLoss: cumLoss,
            totalWins: winCount,
            totalLosses: lossCount,
            totalSpins: historyArray.length - 1,
            lineColor: lineColor,
            padding: padding
        };

        // BACCARAT-STYLE VISUALS
        const isLight = false; // Force dark/neon style for consistency or check theme
        const gridColor = 'rgba(255,255,255,0.1)';
        const textColor = '#888';
        const strokeWidth = 4; // Thicker line like Baccarat

        const colorWin = '#30D158'; // Neon Green
        const colorLoss = '#FF453A'; // Neon Red

        let maxVal = Math.max(...historyArray);
        let minVal = Math.min(...historyArray);
        if (maxVal === minVal) { maxVal++; minVal--; }
        const range = maxVal - minVal;

        // Update stored data with ranges for performance
        window.graphData[containerId].min = minVal;
        window.graphData[containerId].range = range;

        const getX = (i) => (i / (historyArray.length - 1)) * (width - 2 * padding) + padding;
        const getY = (val) => chartHeight - padding - ((val - minVal) / range) * (chartHeight - 2 * padding);

        const showZeroLine = (minVal <= 0 && maxVal >= 0);

        // --- GRID LINES & LABELS ---
        let step = 1;
        if (range > 10) step = 5;
        if (range > 25) step = 10;
        if (range > 50) step = 20;
        if (range > 100) step = 50;
        if (range > 250) step = 100;
        // REMOVED GRID LOOP TO MATCH BACCARAT STYLE
        let gridSvg = '';

        for (let v = Math.ceil(minVal / step) * step; v <= maxVal; v += step) {
            if (v === 0 && showZeroLine) continue;
            const y = getY(v);
            if (y >= padding && y <= chartHeight - padding) {
                gridSvg += `<line x1="${padding}" y1="${y}" x2="${width - padding}" y2="${y}" stroke="${gridColor}" stroke-width="1" stroke-dasharray="2" />`;
                gridSvg += `<text x="${padding}" y="${y - 2}" fill="${textColor}" font-size="9" font-family="monospace">${v > 0 ? '+' : ''}${v}</text>`;
            }
        }

        let pathD = `M ${getX(0)} ${getY(historyArray[0])}`;
        for (let i = 1; i < historyArray.length; i++) {
            pathD += ` L ${getX(i)} ${getY(historyArray[i])}`;
        }

        // Area Path (Close at Zero or Bottom)
        const zeroY = getY(0);
        const clampedZeroY = Math.min(Math.max(zeroY, padding), chartHeight - padding);
        const areaPathD = pathD + ` L ${getX(historyArray.length - 1)} ${clampedZeroY} L ${getX(0)} ${clampedZeroY} Z`;

        const zeroPercent = Math.max(0, Math.min(100, (maxVal / range) * 100));

        const gradId = `grad_${containerId}_${Date.now()}`;
        const areaGradId = `area_${containerId}_${Date.now()}`;
        const glowFilterId = `glow_${containerId}_${Date.now()}`;

        let strokeUrl = `url(#${gradId})`;
        if (lineColor) strokeUrl = lineColor;

        // HUD IDs
        const hudWinsId = `hud_wins_${containerId}`;
        const hudLossesId = `hud_loss_${containerId}`;
        const hudSpinsId = `hud_spins_${containerId}`;
        const tooltipId = `tooltip_${containerId}`;

        // Cleanup existing tooltip from body to prevent duplicates
        const existingTt = document.getElementById(tooltipId);
        if (existingTt) existingTt.remove();

        // --- END MARKER ---
        const lastVal = historyArray[historyArray.length - 1];
        const lastX = getX(historyArray.length - 1);
        const lastY = getY(lastVal);

        // Baccarat Style End Marker (Simple Circle)
        const endMarker = `<circle cx="${lastX}" cy="${lastY}" r="6" fill="${lastVal >= 0 ? colorWin : colorLoss}" stroke="#000" stroke-width="2" />`;

        // Remove glow in light mode for sharper lines
        const filterAttr = isLight ? '' : `filter="url(#${glowFilterId})"`;

        const svg = `
            <svg width="100%" height="${chartHeight}px" style="display:block; overflow:visible; cursor:crosshair; touch-action: none;"
                onmousemove="scrubGraph(event, '${containerId}')"
                ontouchmove="scrubGraph(event, '${containerId}')"
                onmouseleave="resetGraph('${containerId}')"
                ontouchend="resetGraph('${containerId}')"
                ontouchcancel="resetGraph('${containerId}')"
                onpointerup="resetGraph('${containerId}')"
                onpointercancel="resetGraph('${containerId}')"
            >
                <defs>
                    <filter id="${glowFilterId}" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                    <linearGradient id="${gradId}" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="${colorWin}" />
                        <stop offset="${zeroPercent}%" stop-color="${colorWin}" />
                        <stop offset="${zeroPercent}%" stop-color="${colorLoss}" />
                        <stop offset="100%" stop-color="${colorLoss}" />
                    </linearGradient>
                    <linearGradient id="${areaGradId}" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="${colorWin}" stop-opacity="0.25" />
                        <stop offset="${zeroPercent}%" stop-color="${colorWin}" stop-opacity="0" />
                        <stop offset="${zeroPercent}%" stop-color="${colorLoss}" stop-opacity="0" />
                        <stop offset="100%" stop-color="${colorLoss}" stop-opacity="0.25" />
                    </linearGradient>
                </defs>
                
                <!-- Area Fill -->
                <path d="${areaPathD}" fill="url(#${areaGradId})" stroke="none" />
                
                <!-- Grid -->
                ${gridSvg}

                ${showZeroLine ? `<line x1="${padding}" y1="${zeroY}" x2="${width - padding}" y2="${zeroY}" stroke="${gridColor}" stroke-width="1" stroke-dasharray="4" />` : ''}
                ${showZeroLine ? `<line x1="${padding}" y1="${zeroY}" x2="${width - padding}" y2="${zeroY}" stroke="rgba(255,255,255,0.3)" stroke-width="2" stroke-dasharray="6 6" />` : ''}
                
                <!-- Main Line -->
                <path d="${pathD}" fill="none" stroke="${strokeUrl}" stroke-width="${strokeWidth}" stroke-linejoin="round" stroke-linecap="round" ${filterAttr} vector-effect="non-scaling-stroke" />
                <path d="${pathD}" fill="none" stroke="${strokeUrl}" stroke-width="${strokeWidth}" stroke-linejoin="round" stroke-linecap="round" style="filter: drop-shadow(0 4px 8px rgba(0,0,0,0.6));" vector-effect="non-scaling-stroke" />
                
                <!-- End Marker -->
                ${endMarker}
                
                <!-- Scrubber Elements -->
                <line id="scrubberLine_${containerId}" x1="0" y1="0" x2="0" y2="${chartHeight}" stroke="white" stroke-width="1" stroke-opacity="0.5" style="opacity:0; pointer-events:none;" vector-effect="non-scaling-stroke" />
                <circle id="scrubberDot_${containerId}" cx="0" cy="0" r="6" fill="white" stroke="url(#${gradId})" stroke-width="2" style="opacity:0; pointer-events:none;" />
                
                <!-- Invisible Overlay -->
                <rect x="0" y="0" width="100%" height="100%" fill="transparent" />
            </svg>
        `;

        const hud = `
            <div style="height:${hudHeight}px" class="w-full bg-black/20 border-t border-white/10 flex items-center justify-between px-4 rounded-b-xl">
                <div class="flex flex-col items-center leading-none">
                    <span class="text-[9px] uppercase font-bold text-gray-500 mb-0.5">Wins</span>
                    <span id="${hudWinsId}" class="text-sm font-black text-[#4ade80]">${winCount}</span>
                </div>
                <div class="flex flex-col items-center justify-center bg-white/5 rounded px-3 py-0.5 border border-white/10">
                    <span class="text-[8px] uppercase font-bold text-gray-500">Total Spins</span>
                    <span id="${hudSpinsId}" class="text-xs font-black text-white">${historyArray.length - 1}</span> 
                </div>
                <div class="flex flex-col items-center leading-none">
                    <span class="text-[9px] uppercase font-bold text-gray-500 mb-0.5">Losses</span>
                    <span id="${hudLossesId}" class="text-sm font-black text-[#f87171]">${lossCount}</span>
                </div>
            </div>
        `;

        container.innerHTML = svg + hud;

        // Create Global Tooltip
        const ttDiv = document.createElement('div');
        ttDiv.id = tooltipId;
        ttDiv.className = "fixed bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/10 text-[10px] rounded-xl p-2.5 pointer-events-none shadow-[0_8px_30px_rgba(0,0,0,0.5)] z-[9999] hidden flex flex-col gap-1.5 min-w-[100px] transition-all duration-75 ease-out";
        ttDiv.innerHTML = `
            <div class="flex justify-between items-center border-b border-white/10 pb-1.5 mb-0.5">
                <span class="text-gray-400 font-bold uppercase tracking-wider text-[9px]">HAND</span>
                <span id="tt_spin_${containerId}" class="text-white font-mono font-bold text-xs">0</span>
            </div>
            <div class="flex justify-between items-center">
                <span class="text-gray-400 font-bold uppercase tracking-wider text-[9px]">NET</span>
                <span id="tt_val_${containerId}" class="font-mono font-black text-sm">0</span>
            </div>
            <div id="tt_res_${containerId}" class="text-center font-bold uppercase tracking-widest text-[9px] mt-0.5 py-1 rounded bg-white/5 hidden"></div>
        `;
        document.body.appendChild(ttDiv);
    },

    drawGraph(statsObj) {
        this.drawAdvancedGraph(statsObj.bankrollHistory, statsObj.totalWins, statsObj.totalLosses, 'engineGraphContainer');
    },

    drawUserGraph() {
        this.drawAdvancedGraph(this.userStats.bankrollHistory, this.userStats.totalWins, this.userStats.totalLosses, 'userGraphContainer');
    },

    // --- SESSION TIMER ---

};
