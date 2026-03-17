﻿// =========================================================
// FON OUTSIDE - App Controller
// =========================================================

Object.assign(app, {
    state: {
        mode: 'roulette', // 'roulette', 'baccarat', or 'dragontiger'
    },
    swState: { running: false, startTime: null, elapsed: 0 },
    _swTickInterval: null,
    pendingSwitchMode: null,

    init() {
        this.loadGlobalState();
        this.roulette.loadLocal();
        this.baccarat.loadLocal();
        if (typeof this.dragontiger !== 'undefined') this.dragontiger.loadLocal();

        // Allow pressing Enter in spin input to submit a roulette spin.
        const spinInput = document.getElementById('spinInput');
        if (spinInput && !spinInput.dataset.enterBound) {
            spinInput.dataset.enterBound = 'true';
            spinInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.handleSpin();
                }
            });
        }

        this.switchGameMode(this.state.mode, true); // Initial render without reset prompt
        this.initParallax();
    },

    initParallax() {
        const container = document.getElementById('ambient-blobs');
        if (!container) return;

        let targetX = 0, targetY = 0;
        let currentX = 0, currentY = 0;

        document.addEventListener('mousemove', (e) => {
            // Calculate offset from center (range: -30px to +30px)
            targetX = (e.clientX / window.innerWidth - 0.5) * 60;
            targetY = (e.clientY / window.innerHeight - 0.5) * 60;
        });

        const animate = () => {
            currentX += (targetX - currentX) * 0.03;
            currentY += (targetY - currentY) * 0.03;
            container.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
            requestAnimationFrame(animate);
        };
        animate();
    },

    closeSwitchModeModal() {
        document.getElementById('switchModeModal').style.display = 'none';
        this.pendingSwitchMode = null;
    },

    executeSwitchMode() {
        if (this.pendingSwitchMode) {
            this._finalizeSwitch(this.pendingSwitchMode, false);
            this.closeSwitchModeModal();
        }
    },

    switchGameMode(mode, isInitial = false) {
        if (this.state.mode === mode && !isInitial) return;

        if (!isInitial) {
            this.pendingSwitchMode = mode;
            const modal = document.getElementById('switchModeModal');
            const panel = document.getElementById('switchModePanel');
            const icon = document.getElementById('switchModeIcon');
            const nameEl = document.getElementById('targetModeName');
            const confirmBtn = document.getElementById('switchModeConfirmBtn');

            // Mode-specific theming
            const themes = {
                roulette: {
                    icon: '🎰',
                    name: 'ROULETTE',
                    nameColor: 'text-green-400',
                    border: 'border-green-500/30',
                    btnClass: 'bg-[#30D158] hover:bg-[#28b84c]'
                },
                baccarat: {
                    icon: '🏦',
                    name: 'BACCARAT',
                    nameColor: 'text-blue-400',
                    border: 'border-blue-500/30',
                    btnClass: 'bg-[#0A84FF] hover:bg-[#0070e0]'
                },
                dragontiger: {
                    icon: '🐉🐅',
                    name: 'DRAGON TIGER',
                    nameColor: 'text-amber-400',
                    border: 'border-red-500/30',
                    btnClass: 'bg-gradient-to-r from-[#FF453A] to-[#FFD60A] hover:from-[#e63e34] hover:to-[#e6c009]'
                }
            };

            const t = themes[mode];
            icon.textContent = t.icon;
            nameEl.textContent = t.name;
            nameEl.className = `${t.nameColor} font-black`;
            panel.className = `glass-panel glass-surface w-11/12 max-w-md rounded-3xl shadow-2xl flex flex-col anim-slide-up p-6 text-center border ${t.border}`;
            confirmBtn.className = `px-5 py-2.5 ${t.btnClass} text-white font-bold rounded-xl shadow-lg transition-colors w-full btn-pulse`;

            modal.style.display = 'flex';
            document.getElementById('mainMenuDropdown').classList.add('hidden');
            document.getElementById('menuOverlay').classList.add('hidden');
            return;
        }
        this._finalizeSwitch(mode, isInitial);
    },

    // ── Canvas Particle System ──
    _globalParticles: [],
    _isAnimatingParticles: false,

    _spawnParticles(color, type = 'burst') {
        const canvas = document.getElementById('cinematic-particles');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.classList.add('active');

        const cx = canvas.width / 2;
        const cy = canvas.height / 2;

        if (type === 'warp') {
            for (let i = 0; i < 180; i++) {
                const angle = Math.random() * Math.PI * 2;
                const dist = Math.random() * 300;
                this._globalParticles.push({
                    type: 'warp',
                    x: cx + Math.cos(angle) * dist,
                    y: cy + Math.sin(angle) * dist,
                    vx: Math.cos(angle) * (40 + Math.random() * 60),
                    vy: Math.sin(angle) * (40 + Math.random() * 60),
                    r: 0.5 + Math.random() * 1.5,
                    alpha: 0,
                    targetAlpha: 0.8 + Math.random() * 0.2,
                    decay: 0.02,
                    color: color,
                    life: 0
                });
            }
        } else {
            for (let i = 0; i < 45; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 2 + Math.random() * 5;
                this._globalParticles.push({
                    type: 'burst',
                    x: cx + (Math.random() - 0.5) * 60,
                    y: cy + (Math.random() - 0.5) * 60,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    r: 1.5 + Math.random() * 2.5,
                    alpha: 0.7 + Math.random() * 0.3,
                    decay: 0.015 + Math.random() * 0.01,
                    color: color
                });
            }
        }

        if (!this._isAnimatingParticles) {
            this._startParticleLoop(ctx, canvas);
        }
    },

    _startParticleLoop(ctx, canvas) {
        this._isAnimatingParticles = true;

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            let alive = false;

            for (let i = this._globalParticles.length - 1; i >= 0; i--) {
                const p = this._globalParticles[i];

                if (p.type === 'warp') {
                    p.life++;
                    if (p.life < 10) p.alpha += (p.targetAlpha - p.alpha) * 0.2;
                    else p.alpha -= p.decay;

                    p.x += p.vx;
                    p.y += p.vy;
                    p.vx *= 1.08;
                    p.vy *= 1.08;
                } else {
                    p.x += p.vx;
                    p.y += p.vy;
                    p.vx *= 0.98;
                    p.vy *= 0.98;
                    p.alpha -= p.decay;
                }

                if (p.alpha <= 0 && (p.type !== 'warp' || p.life > 10)) {
                    this._globalParticles.splice(i, 1);
                    continue;
                }

                alive = true;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = Math.max(0, p.alpha);
                ctx.shadowColor = p.color;
                ctx.shadowBlur = 8;
                ctx.fill();
            }

            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;

            if (alive) {
                requestAnimationFrame(animate);
            } else {
                this._isAnimatingParticles = false;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                canvas.classList.remove('active');
            }
        };
        requestAnimationFrame(animate);
    },

    _finalizeSwitch(mode, isInitial) {
        const oldMode = this.state.mode;
        this.state.mode = mode;

        // Stopwatch needs to be present in ALL ui groups so it is always toggled on when swapping
        const commonMenuItems = ['btn-sw-toggle', 'menuStopwatchDisplay'];

        const uiGroups = {
            roulette: [
                'roulette-view', 'roulette-controls', 'roulette-dashboard',
                'roulette-menu-items', 'roulette-bets-btn', 'sw-container'
            ],
            baccarat: [
                'baccarat-view', 'baccarat-controls', 'baccarat-dashboard',
                'baccarat-menu-items', 'btn-baccarat-undo', 'sw-container'
            ],
            dragontiger: [
                'dragontiger-view', 'dragontiger-controls', 'dragontiger-dashboard',
                'dragontiger-menu-items', 'btn-dragontiger-undo', 'sw-container'
            ]
        };

        const setVisible = (ids, show) => {
            ids.forEach(id => {
                const el = document.getElementById(id);
                if (el) el.classList.toggle('hidden', !show);
            });
        };

        const btnRoulette = document.getElementById('btn-mode-roulette');
        const btnBaccarat = document.getElementById('btn-mode-baccarat');
        const btnDragonTiger = document.getElementById('btn-mode-dragontiger');
        const inactiveClass = "flex-1 w-full py-2 text-xs font-bold rounded-md transition-all text-gray-400 hover:text-white hover:bg-white/5";
        const activeClasses = {
            roulette: "flex-1 w-full py-2 text-xs font-bold rounded-md transition-all bg-[#30D158] text-white shadow-lg shadow-[#30D158]/20",
            baccarat: "flex-1 w-full py-2 text-xs font-bold rounded-md transition-all bg-[#0A84FF] text-white shadow-lg shadow-[#0A84FF]/20",
            dragontiger: "flex-1 w-full py-2 text-xs font-bold rounded-md transition-all bg-gradient-to-r from-[#FF453A] to-[#FFD60A] text-white shadow-lg"
        };

        if (btnRoulette) { btnRoulette.className = mode === 'roulette' ? activeClasses.roulette : inactiveClass; btnRoulette.innerHTML = '🎰 ROULETTE'; }
        if (btnBaccarat) { btnBaccarat.className = mode === 'baccarat' ? activeClasses.baccarat : inactiveClass; btnBaccarat.innerHTML = '🏦 BACCARAT'; }
        if (btnDragonTiger) { btnDragonTiger.className = mode === 'dragontiger' ? activeClasses.dragontiger : inactiveClass; btnDragonTiger.innerHTML = '🐉 D·T 🐅'; }

        if (!isInitial) {
            this.roulette.closeAllMenus({ target: document.body });
        }

        // --- INSTANT SWAP for initial load ---
        if (isInitial || oldMode === mode) {
            setVisible(uiGroups.roulette, mode === 'roulette');
            setVisible(uiGroups.baccarat, mode === 'baccarat');
            setVisible(uiGroups.dragontiger, mode === 'dragontiger');

            if (mode === 'roulette') {
                this.roulette.reRenderHistory();
                this.roulette.renderDashboard();
                this.roulette.updateFilterEfficiencies();
            } else if (mode === 'baccarat') {
                this.baccarat.render();
                this.baccarat.runEngine();
            } else if (mode === 'dragontiger') {
                this.dragontiger.render();
                this.dragontiger.runEngine();
            }

            document.body.classList.remove('theme-roulette', 'theme-baccarat', 'theme-dragontiger');
            document.body.classList.add(`theme-${mode}`);
            return;
        }

        // =============================================
        //  PRO TRANSITION — "DEPTH & BLUR"
        //  Flow: Exit (Scale Down/Blur) -> Flash -> Enter (Scale Up/Focus)
        // =============================================

        const overlay = document.getElementById('cinematic-overlay');
        const shutter = document.getElementById('cinematic-shutter');
        const title = document.getElementById('cinematic-title');
        const oldView = document.getElementById(`${oldMode}-view`);
        const newView = document.getElementById(`${mode}-view`);

        const modeColors = {
            roulette: 'rgba(48, 209, 88, 0.8)',
            baccarat: 'rgba(10, 132, 255, 0.8)',
            dragontiger: 'rgba(255, 69, 58, 0.8)'
        };

        const modeNames = {
            roulette: 'ROULETTE',
            baccarat: 'BACCARAT',
            dragontiger: 'DRAGON TIGER'
        };

        // Phase 0: LOCK
        document.body.classList.add('cinematic-locked');
        window.scrollTo(0, 0);

        // Phase 1: EXIT (0–300ms)
        if (oldView) {
            oldView.classList.add('pro-exit');
        }

        // Trigger Warp Particles
        this._spawnParticles(modeColors[mode], 'warp');

        // Phase 2: FLASH & SWAP (300ms)
        setTimeout(() => {
            // Flash
            shutter.classList.add('flash');

            // Swap DOM
            setVisible(uiGroups[oldMode], false);
            if (oldView) oldView.classList.remove('pro-exit');
            setVisible(uiGroups[mode], true);

            overlay.style.transition = 'none';
            overlay.style.opacity = '1';
            overlay.classList.add('active');

            const glow = overlay.querySelector(`.glow-${mode}`);
            if (glow) glow.classList.add('visible');

            const sig = overlay.querySelector(`.sig-${mode}`);
            if (sig) sig.classList.add('visible');

            if (title) {
                title.textContent = modeNames[mode];
                title.classList.add('visible');
            }

            if (mode === 'roulette') {
                this.roulette.reRenderHistory();
                this.roulette.renderDashboard();
                this.roulette.updateFilterEfficiencies();
            } else if (mode === 'baccarat') {
                this.baccarat.render();
                this.baccarat.runEngine();
            } else if (mode === 'dragontiger') {
                this.dragontiger.render();
                this.dragontiger.runEngine();
            }

            document.body.classList.remove('theme-roulette', 'theme-baccarat', 'theme-dragontiger');
            document.body.classList.add(`theme-${mode}`);

            // Prepare New View for Entry
            if (newView) newView.classList.add('pro-enter');
            if (newView) {
                newView.classList.add('pro-enter');
                setTimeout(() => newView.classList.add('camera-shake'), 50); // Impact frame
            }

        }, 300);

        // Phase 3: ENTER & SETTLE (350ms+)
        setTimeout(() => {
            shutter.classList.remove('flash');

            const dashboard = document.getElementById(`${mode}-dashboard`);
            const mainView = document.getElementById(`${mode}-view`);
            const controls = document.getElementById(`${mode}-controls`);

            const stagger = [
                { el: dashboard, delay: 0, cls: 'reassemble-slide-down' },
                // Main view handled by pro-enter
                { el: controls, delay: 50, cls: 'reassemble-pop-up' },
            ];

            stagger.forEach(({ el, delay, cls }) => {
                if (!el) return;
                setTimeout(() => el.classList.add(cls), delay);
            });

            const extras = uiGroups[mode]
                .filter(id => !id.includes('-view') && !id.includes('-dashboard') && !id.includes('-controls'))
                .map(id => document.getElementById(id))
                .filter(Boolean);
            extras.forEach(el => {
                setTimeout(() => el.classList.add('reassemble-fade-in'), 120);
            });

            overlay.style.transition = 'opacity 400ms ease-out';
            overlay.style.opacity = '0';
        }, 350);

        // Phase 4: CLEANUP (850ms)
        setTimeout(() => {
            overlay.classList.remove('active');
            overlay.style.transition = 'none';
            overlay.style.opacity = '0';
            overlay.querySelectorAll('.glow').forEach(g => g.classList.remove('visible'));
            overlay.querySelectorAll('.void-signature').forEach(s => s.classList.remove('visible'));
            if (title) {
                title.classList.remove('visible');
                title.textContent = '';
            }

            const allAnimClasses = [
                'reassemble-slide-down', 'reassemble-scale-up',
                'reassemble-pop-up', 'reassemble-fade-in',
                'power-on-glow', 'pro-exit', 'pro-enter', 'camera-shake'
            ];
            document.querySelectorAll('[class*="reassemble-"], .power-on-glow, .cinematic-glitch, .cinematic-collapsing').forEach(el => {
                el.classList.remove(...allAnimClasses);
            });

            const dashboard = document.getElementById(`${mode}-dashboard`);
            const controls = document.getElementById(`${mode}-controls`);
            [newView, dashboard, controls].forEach(el => {
                if (el) el.classList.remove(...allAnimClasses);
            });

            document.body.classList.remove('cinematic-locked');
        }, 850);
    },

    handleSpin(manualVal = null, suppressRender = false) {
        if (this.state.mode === 'roulette') {
            this.roulette.handleSpin(manualVal, suppressRender);
        }
    },

    undo() {
        if (this.state.mode === 'roulette') {
            this.roulette.undoSpin();
        } else if (this.state.mode === 'baccarat') {
            this.baccarat.undo();
        } else if (this.state.mode === 'dragontiger') {
            this.dragontiger.undo();
        }
    },

    toggleAnalytics() {
        if (this.state.mode === 'roulette') {
            this.roulette.toggleAnalytics();
        } else if (this.state.mode === 'baccarat') {
            this.baccarat.toggleModal('stats-modal');
            this.baccarat.renderStats();
        } else if (this.state.mode === 'dragontiger') {
            this.dragontiger.toggleModal('dt-stats-modal');
            this.dragontiger.renderStats();
        }
    },

    toggleFilterMenu(e) {
        const anchorEl = (e && (e.currentTarget || e.target)) || document.getElementById('filterBtn');

        if (this.state.mode === 'roulette') {
            this.roulette.toggleFilterMenu(e);
        } else if (this.state.mode === 'baccarat') {
            const modal = document.getElementById('filters-modal');
            const opening = !!modal && modal.classList.contains('hidden');
            this.baccarat.toggleModal('filters-modal');
            if (opening) {
                requestAnimationFrame(() => {
                    this.positionCompactPopover('filters-modal-content', anchorEl);
                    this.baccarat.renderFilters();
                });
            }
        } else if (this.state.mode === 'dragontiger') {
            const modal = document.getElementById('dt-filters-modal');
            const opening = !!modal && modal.classList.contains('hidden');
            this.dragontiger.toggleModal('dt-filters-modal');
            if (opening) {
                requestAnimationFrame(() => {
                    this.positionCompactPopover('dt-filters-modal-content', anchorEl);
                    this.dragontiger.renderFilters();
                });
            }
        }
    },

    positionCompactPopover(contentId, anchorEl) {
        const panel = document.getElementById(contentId);
        const anchor = anchorEl || document.getElementById('filterBtn');
        if (!panel || !anchor) return;

        const margin = 8;
        const edge = 8;
        const anchorRect = anchor.getBoundingClientRect();
        const panelRect = panel.getBoundingClientRect();

        let left = anchorRect.right - panelRect.width;
        left = Math.max(edge, Math.min(left, window.innerWidth - panelRect.width - edge));

        let top = anchorRect.bottom + margin;
        const maxTop = window.innerHeight - panelRect.height - edge;
        if (top > maxTop) {
            top = Math.max(edge, anchorRect.top - panelRect.height - margin);
        }

        panel.style.left = `${Math.round(left)}px`;
        panel.style.top = `${Math.round(top)}px`;
    },

    toggleBetsModal() {
        if (this.state.mode === 'roulette') {
            this.roulette.toggleBetsModal();
        } else if (this.state.mode === 'baccarat') {
            this.baccarat.toggleModal('vault-modal');
            this.baccarat.renderVault();
        } else if (this.state.mode === 'dragontiger') {
            this.dragontiger.toggleModal('dt-vault-modal');
            this.dragontiger.renderVault();
        }
    },

    // Keyboard shortcuts
    handleKeydown(e) {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
            e.preventDefault();
            this.undo();
            return;
        }

        if (this.state.mode === 'roulette') {
            // Roulette specific shortcuts
        } else if (this.state.mode === 'baccarat') {
            if (e.key.toLowerCase() === 'p') this.baccarat.input('P');
            if (e.key.toLowerCase() === 'b') this.baccarat.input('B');
            if (e.key.toLowerCase() === 't') this.baccarat.input('T');
        } else if (this.state.mode === 'dragontiger') {
            if (e.key.toLowerCase() === 'd') this.dragontiger.input('D');
            if (e.key.toLowerCase() === 't') this.dragontiger.input('T');
            if (e.key.toLowerCase() === 'x') this.dragontiger.input('X');
        }
    },

    // --- GLOBAL STOPWATCH LOGIC ---

    toggleStopwatchState() {
        if (this.swState.running) {
            // Pause
            this.swState.elapsed += (Date.now() - this.swState.startTime);
            this.swState.startTime = null;
            this.swState.running = false;
        } else {
            // Start
            this.swState.startTime = Date.now();
            this.swState.running = true;
        }
        this.updateStopwatchUIState();
        this.saveGlobalState();
    },

    resetStopwatch() {
        this.swState = { running: false, startTime: null, elapsed: 0 };
        this.updateStopwatchUIState();
        const display = document.getElementById('menuStopwatchDisplay');
        if (display) display.textContent = '00:00:00';
        this.saveGlobalState();
    },

    _tickStopwatch() {
        const display = document.getElementById('menuStopwatchDisplay');
        if (!display) return;
        if (!this.swState.running && this._swTickInterval) {
            clearInterval(this._swTickInterval);
            this._swTickInterval = null;
        }
        let totalMs = this.swState.elapsed;
        if (this.swState.running && this.swState.startTime) {
            totalMs += (Date.now() - this.swState.startTime);
        }
        const totalSec = Math.floor(totalMs / 1000);
        const h = String(Math.floor(totalSec / 3600)).padStart(2, '0');
        const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
        const s = String(totalSec % 60).padStart(2, '0');
        display.textContent = `${h}:${m}:${s}`;
    },

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
            if (this._swTickInterval) {
                clearInterval(this._swTickInterval);
                this._swTickInterval = null;
            }
            this._tickStopwatch();
        }
    },

    saveGlobalState() {
        try {
            localStorage.setItem('fon_outside_app_state', JSON.stringify({
                swState: this.swState
            }));
        } catch (e) { console.warn("Failed to save global state", e); }
    },

    loadGlobalState() {
        try {
            const data = localStorage.getItem('fon_outside_app_state');
            if (data) {
                const parsed = JSON.parse(data);
                if (parsed.swState) {
                    this.swState = parsed.swState;
                    if (this.swState.running && !this.swState.startTime) {
                        this.swState.running = false;
                    }
                }
            }
        } catch (e) { console.warn("Failed to load global state", e); }
        this.updateStopwatchUIState();
    }

});

// Initialize App on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});

// Legacy global handler bridge for inline HTML attributes.
window.closeAllMenus = (e) => app.roulette.closeAllMenus(e);
window.toggleFilterMenu = (e) => app.toggleFilterMenu(e);
window.toggleMainMenu = (e) => app.roulette.toggleMainMenu(e);
window.toggleAnalytics = () => app.toggleAnalytics();
window.toggleBetsModal = () => app.toggleBetsModal();
window.switchAnalyticsMode = (mode) => app.roulette.switchAnalyticsMode(mode);
window.toggleHeatmapMetric = () => app.roulette.toggleHeatmapMetric();
window.closePatternLog = () => app.roulette.closePatternLog();
window.toggleStopwatchState = () => app.toggleStopwatchState();
window.resetStopwatch = () => app.resetStopwatch();
window.toggleAccordion = (id) => app.roulette.toggleAccordion(id);
window.exportSpins = () => app.roulette.exportSpins();
window.showResetModal = () => app.roulette.showResetModal();
window.changeSimProgression = (val) => app.roulette.changeSimProgression(val);
window.toggleSimFilter = (type, key) => app.roulette.toggleSimFilter(type, key);
window.toggleCategorySelection = (checked) => app.roulette.toggleCategorySelection(checked);
window.handleFilterChange = (filterKey, isChecked) => app.roulette.handleFilterChange(filterKey, isChecked);
window.togglePatternSelection = (checked) => app.roulette.togglePatternSelection(checked);
window.toggleGridColumn = (key) => app.roulette.toggleGridColumn(key);
window.updateBankrollSettings = () => app.roulette.updateBankrollSettings();
window.importSpins = (files) => app.roulette.importSpins(files);
window.toggleTheme = () => app.roulette.toggleTheme();
window.toggleTrendIcons = () => app.roulette.toggleTrendIcons();
window.toggleCurvedLayout = () => app.roulette.toggleCurvedLayout();
window.toggleSound = (key) => app.roulette.toggleSound(key);


// Global keyboard shortcuts
document.addEventListener('keydown', (e) => app.handleKeydown(e));
