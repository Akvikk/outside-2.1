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
        this.currentMode = 'roulette';
        
        this._globalParticles = [];
        this._isAnimatingParticles = false;
        
        this.utils = {
            showToast: this.showToast.bind(this),
            sanitizeString: (str) => String(str).replace(/[^\w\s-]/gi, ''),
            drawAdvancedGraph: (historyArray, winCount, lossCount, containerId, lineColor) => {
                TrendGraph.drawAdvancedGraph(historyArray, winCount, lossCount, containerId, lineColor);
            }
        };
    }

    init() {
        try { this.loadGlobalState(); } catch (e) { console.error(e); }

        // Load saved data safely (prevents corrupted old data from crashing the app)
        try { this.roulette.loadLocal(); } catch (e) { console.error('Roulette load error:', e); }
        try { this.baccarat.loadLocal(); } catch (e) { console.error('Baccarat load error:', e); }
        try { this.dragontiger.loadLocal(); } catch (e) { console.error('DragonTiger load error:', e); }

        // Allow Enter in spin input
        const spinInput = document.getElementById('spinInput');
        if (spinInput && !spinInput.dataset.enterBound) {
            spinInput.dataset.enterBound = 'true';
            spinInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') { e.preventDefault(); this.handleSpin(); }
            });
        }

        try { this.initParallax(); } catch (e) {}
        
        try {
            this.switchGameMode(this.currentMode, true);
        } catch (e) {
            console.error('Failed to switch game mode during init:', e);
        }
        try { this.bindEvents(); } catch (e) {}
    }

    bindEvents() {
        document.addEventListener('keydown', (e) => this.handleKeydown(e));
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

    handleKeydown(e) {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
            e.preventDefault();
            this.undo();
            return;
        }
        if (this.currentMode === 'baccarat') {
            if (e.key.toLowerCase() === 'p') this.baccarat.input('P');
            if (e.key.toLowerCase() === 'b') this.baccarat.input('B');
            if (e.key.toLowerCase() === 't') this.baccarat.input('T');
        } else if (this.currentMode === 'dragontiger') {
            if (e.key.toLowerCase() === 'd') this.dragontiger.input('D');
            if (e.key.toLowerCase() === 't') this.dragontiger.input('T');
            if (e.key.toLowerCase() === 'x') this.dragontiger.input('X');
        }
    }

    initParallax() {
        const container = document.getElementById('ambient-blobs');
        if (!container) return;
        let targetX = 0, targetY = 0, currentX = 0, currentY = 0;
        document.addEventListener('mousemove', (e) => {
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

    closeSwitchModeModal() {
        document.getElementById('switchModeModal').style.display = 'none';
        this.pendingSwitchMode = null;
    }

    executeSwitchMode() {
        if (this.pendingSwitchMode) {
            this._finalizeSwitch(this.pendingSwitchMode, false);
            this.closeSwitchModeModal();
        }
    }

    switchGameMode(mode, isInitial = false) {
        if (this.currentMode === mode && !isInitial) return;

        if (!isInitial) {
            this.pendingSwitchMode = mode;
            const modal = document.getElementById('switchModeModal');
            const panel = document.getElementById('switchModePanel');
            const icon = document.getElementById('switchModeIcon');
            const nameEl = document.getElementById('targetModeName');
            const confirmBtn = document.getElementById('switchModeConfirmBtn');

            const themes = {
                roulette: { icon: '🎰', name: 'ROULETTE', nameColor: 'text-green-400', border: 'border-green-500/30', btnClass: 'bg-[#30D158] hover:bg-[#28b84c]' },
                baccarat: { icon: '🏦', name: 'BACCARAT', nameColor: 'text-blue-400', border: 'border-blue-500/30', btnClass: 'bg-[#0A84FF] hover:bg-[#0070e0]' },
                dragontiger: { icon: '🐉🐅', name: 'DRAGON TIGER', nameColor: 'text-amber-400', border: 'border-red-500/30', btnClass: 'bg-gradient-to-r from-[#FF453A] to-[#FFD60A] hover:from-[#e63e34] hover:to-[#e6c009]' }
            };

            const t = themes[mode];
            if(icon) icon.textContent = t.icon;
            if(nameEl) { nameEl.textContent = t.name; nameEl.className = `${t.nameColor} font-black`; }
            if(panel) panel.className = `glass-panel glass-surface w-11/12 max-w-md rounded-3xl shadow-2xl flex flex-col anim-slide-up p-6 text-center border ${t.border}`;
            if(confirmBtn) confirmBtn.className = `px-5 py-2.5 ${t.btnClass} text-white font-bold rounded-xl shadow-lg transition-colors w-full btn-pulse`;

            if(modal) modal.style.display = 'flex';
            ['mainMenuDropdown', 'menuOverlay'].forEach(id => { const el = document.getElementById(id); if (el) el.classList.add('hidden'); });
            return;
        }
        this._finalizeSwitch(mode, isInitial);
    }

    _spawnParticles(color, type = 'burst') {
        const canvas = document.getElementById('cinematic-particles');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth; canvas.height = window.innerHeight;
        canvas.classList.add('active');

        const cx = canvas.width / 2, cy = canvas.height / 2;
        for (let i = 0; i < 180; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * 300;
            this._globalParticles.push({
                type: 'warp',
                x: cx + Math.cos(angle) * dist, y: cy + Math.sin(angle) * dist,
                vx: Math.cos(angle) * (40 + Math.random() * 60), vy: Math.sin(angle) * (40 + Math.random() * 60),
                r: 0.5 + Math.random() * 1.5,
                alpha: 0, targetAlpha: 0.8 + Math.random() * 0.2, decay: 0.02,
                color: color, life: 0
            });
        }

        if (!this._isAnimatingParticles) this._startParticleLoop(ctx, canvas);
    }

    _startParticleLoop(ctx, canvas) {
        this._isAnimatingParticles = true;
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            let alive = false;
            for (let i = this._globalParticles.length - 1; i >= 0; i--) {
                const p = this._globalParticles[i];
                p.life++;
                if (p.life < 10) p.alpha += (p.targetAlpha - p.alpha) * 0.2;
                else p.alpha -= p.decay;
                p.x += p.vx; p.y += p.vy;
                p.vx *= 1.08; p.vy *= 1.08;

                if (p.alpha <= 0 && p.life > 10) { this._globalParticles.splice(i, 1); continue; }
                alive = true;
                ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = p.color; ctx.globalAlpha = Math.max(0, p.alpha);
                ctx.shadowColor = p.color; ctx.shadowBlur = 8; ctx.fill();
            }
            ctx.globalAlpha = 1; ctx.shadowBlur = 0;
            if (alive) requestAnimationFrame(animate);
            else { this._isAnimatingParticles = false; ctx.clearRect(0, 0, canvas.width, canvas.height); canvas.classList.remove('active'); }
        };
        requestAnimationFrame(animate);
    }

    _finalizeSwitch(mode, isInitial) {
        const oldMode = this.currentMode;
        this.currentMode = mode;

        const uiGroups = {
            roulette: ['roulette-view', 'roulette-controls', 'roulette-dashboard', 'roulette-menu-items', 'roulette-bets-btn', 'sw-container'],
            baccarat: ['baccarat-view', 'baccarat-controls', 'baccarat-dashboard', 'baccarat-menu-items', 'btn-baccarat-undo', 'sw-container'],
            dragontiger: ['dragontiger-view', 'dragontiger-controls', 'dragontiger-dashboard', 'dragontiger-menu-items', 'btn-dragontiger-undo', 'sw-container']
        };

        const setVisible = (ids, show) => ids.forEach(id => { const el = document.getElementById(id); if (el) el.classList.toggle('hidden', !show); });

        const btnR = document.getElementById('btn-mode-roulette'), btnB = document.getElementById('btn-mode-baccarat'), btnD = document.getElementById('btn-mode-dragontiger');
        const inAct = "flex-1 w-full py-2 text-xs font-bold rounded-md transition-all text-gray-400 hover:text-white hover:bg-white/5";
        if (btnR) btnR.className = mode === 'roulette' ? "flex-1 w-full py-2 text-xs font-bold rounded-md transition-all bg-[#30D158] text-white shadow-lg shadow-[#30D158]/20" : inAct;
        if (btnB) btnB.className = mode === 'baccarat' ? "flex-1 w-full py-2 text-xs font-bold rounded-md transition-all bg-[#0A84FF] text-white shadow-lg shadow-[#0A84FF]/20" : inAct;
        if (btnD) btnD.className = mode === 'dragontiger' ? "flex-1 w-full py-2 text-xs font-bold rounded-md transition-all bg-gradient-to-r from-[#FF453A] to-[#FFD60A] text-white shadow-lg" : inAct;

        if (isInitial || oldMode === mode) {
            const allIds = [...new Set([...uiGroups.roulette, ...uiGroups.baccarat, ...uiGroups.dragontiger])];
            setVisible(allIds, false);
            setVisible(uiGroups[mode], true);
            if (mode === 'roulette') { this.roulette.reRenderHistory(); this.roulette.ui.renderDashboard(); this.roulette.ui.updateFilterEfficiencies(); }
            else if (mode === 'baccarat') { this.baccarat.render(); this.baccarat.runEngine(); }
            else if (mode === 'dragontiger') { this.dragontiger.render(); this.dragontiger.runEngine(); }
            document.body.classList.remove('theme-roulette', 'theme-baccarat', 'theme-dragontiger'); document.body.classList.add(`theme-${mode}`);
            return;
        }

        const overlay = document.getElementById('cinematic-overlay'), shutter = document.getElementById('cinematic-shutter'), title = document.getElementById('cinematic-title');
        const oldView = document.getElementById(`${oldMode}-view`), newView = document.getElementById(`${mode}-view`);
        const modeColors = { roulette: 'rgba(48, 209, 88, 0.8)', baccarat: 'rgba(10, 132, 255, 0.8)', dragontiger: 'rgba(255, 69, 58, 0.8)' };

        document.body.classList.add('cinematic-locked'); window.scrollTo(0, 0);
        if (oldView) oldView.classList.add('pro-exit');
        this._spawnParticles(modeColors[mode], 'warp');

        setTimeout(() => {
            if(shutter) shutter.classList.add('flash');
            setVisible(uiGroups[oldMode], false);
            if (oldView) oldView.classList.remove('pro-exit');
            setVisible(uiGroups[mode], true);

            if(overlay) { overlay.style.transition = 'none'; overlay.style.opacity = '1'; overlay.classList.add('active'); }
            const glow = overlay?.querySelector(`.glow-${mode}`), sig = overlay?.querySelector(`.sig-${mode}`);
            if (glow) glow.classList.add('visible'); if (sig) sig.classList.add('visible');
            if (title) { title.textContent = mode.toUpperCase(); title.classList.add('visible'); }

            if (mode === 'roulette') { this.roulette.reRenderHistory(); this.roulette.ui.renderDashboard(); this.roulette.ui.updateFilterEfficiencies(); }
            else if (mode === 'baccarat') { this.baccarat.render(); this.baccarat.runEngine(); }
            else if (mode === 'dragontiger') { this.dragontiger.render(); this.dragontiger.runEngine(); }
            
            document.body.classList.remove('theme-roulette', 'theme-baccarat', 'theme-dragontiger'); document.body.classList.add(`theme-${mode}`);
            if (newView) { newView.classList.add('pro-enter'); }
        }, 400);

        setTimeout(() => {
            if(shutter) shutter.classList.remove('flash');
            if(overlay) { overlay.style.transition = 'opacity 400ms ease-out'; overlay.style.opacity = '0'; }
        }, 450);

        setTimeout(() => {
            if(overlay) {
                overlay.classList.remove('active'); overlay.style.transition = 'none'; overlay.style.opacity = '0';
                overlay.querySelectorAll('.glow, .void-signature').forEach(g => g.classList.remove('visible'));
            }
            if (title) title.classList.remove('visible');
            document.querySelectorAll('.pro-exit, .pro-enter').forEach(el => { el.classList.remove('pro-exit', 'pro-enter'); });
            document.body.classList.remove('cinematic-locked');
        }, 1050);
    }

    handleSpin(manualVal = null, suppressRender = false) {
        if (this.currentMode === 'roulette') this.roulette.handleSpin(manualVal, suppressRender);
    }

    undo() {
        if (this.currentMode === 'roulette') this.roulette.undoSpin();
        else if (this.currentMode === 'baccarat') this.baccarat.undo();
        else if (this.currentMode === 'dragontiger') this.dragontiger.undo();
    }

    toggleAnalytics() {
        if (this.currentMode === 'roulette') this.roulette.toggleAnalytics();
        else if (this.currentMode === 'baccarat') { this.baccarat.toggleModal('stats-modal'); this.baccarat.renderStats(); }
        else if (this.currentMode === 'dragontiger') { this.dragontiger.toggleModal('dt-stats-modal'); this.dragontiger.renderStats(); }
    }

    toggleFilterMenu(e) {
        const anchorEl = (e && (e.currentTarget || e.target)) || document.getElementById('filterBtn');
        if (this.currentMode === 'roulette') {
            if (e) e.stopPropagation(); 
            const menu = document.getElementById('filterDropdown'); 
            const overlay = document.getElementById('menuOverlay'); 
            if (menu) menu.classList.toggle('hidden'); 
            if (overlay) overlay.classList.toggle('hidden'); 
        }
        else if (this.currentMode === 'baccarat') {
            const opening = document.getElementById('filters-modal')?.classList.contains('hidden');
            this.baccarat.toggleModal('filters-modal');
            if (opening) requestAnimationFrame(() => { this.positionCompactPopover('filters-modal-content', anchorEl); this.baccarat.renderFilters(); });
        } else if (this.currentMode === 'dragontiger') {
            const opening = document.getElementById('dt-filters-modal')?.classList.contains('hidden');
            this.dragontiger.toggleModal('dt-filters-modal');
            if (opening) requestAnimationFrame(() => { this.positionCompactPopover('dt-filters-modal-content', anchorEl); this.dragontiger.renderFilters(); });
        }
    }

    positionCompactPopover(contentId, anchorEl) {
        const panel = document.getElementById(contentId), anchor = anchorEl || document.getElementById('filterBtn');
        if (!panel || !anchor) return;
        const anchorRect = anchor.getBoundingClientRect(), panelRect = panel.getBoundingClientRect();
        let left = Math.max(8, Math.min(anchorRect.right - panelRect.width, window.innerWidth - panelRect.width - 8));
        let top = anchorRect.bottom + 8;
        if (top > window.innerHeight - panelRect.height - 8) top = Math.max(8, anchorRect.top - panelRect.height - 8);
        panel.style.left = `${Math.round(left)}px`; panel.style.top = `${Math.round(top)}px`;
    }

    toggleBetsModal() {
        if (this.currentMode === 'roulette') this.roulette.toggleBetsModal();
        else if (this.currentMode === 'baccarat') { this.baccarat.toggleModal('vault-modal'); this.baccarat.renderVault(); }
        else if (this.currentMode === 'dragontiger') { this.dragontiger.toggleModal('dt-vault-modal'); this.dragontiger.renderVault(); }
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
// Expose global methods for inline HTML event handlers
window.toggleStopwatchState = () => window.app.toggleStopwatchState();
window.resetStopwatch = () => window.app.resetStopwatch();
window.toggleFilterMenu = (e) => window.app.toggleFilterMenu(e);
window.toggleAnalytics = () => window.app.toggleAnalytics();
window.toggleBetsModal = () => window.app.toggleBetsModal();
window.closeAllMenus = (e) => window.app.roulette.closeAllMenus(e);
window.toggleMainMenu = (e) => window.app.roulette.toggleMainMenu(e);
window.toggleAccordion = (id) => window.app.roulette.toggleAccordion(id);
window.toggleGridColumn = (key) => window.app.roulette.toggleGridColumn(key);
window.updateBankrollSettings = () => window.app.roulette.updateBankrollSettings();
window.exportSpins = () => window.app.roulette.exportSpins();
window.importSpins = (files) => window.app.roulette.importSpins(files);
window.toggleTrendIcons = () => window.app.roulette.toggleTrendIcons();
window.toggleCurvedLayout = () => window.app.roulette.toggleCurvedLayout();
window.toggleSound = (key) => window.app.roulette.toggleSound(key);
window.showResetModal = () => window.app.roulette.showResetModal();
window.toggleHeatmapMetric = () => window.app.roulette.toggleHeatmapMetric();
window.switchAnalyticsMode = (mode) => window.app.roulette.switchAnalyticsMode(mode);
window.changeSimProgression = (val) => window.app.roulette.changeSimProgression(val);
window.toggleSimFilter = (type, key) => window.app.roulette.toggleSimFilter(type, key);
window.toggleCategorySelection = (checked) => window.app.roulette.toggleCategorySelection(checked);
window.togglePatternSelection = (checked) => window.app.roulette.togglePatternSelection(checked);
window.handleFilterChange = (key, checked) => window.app.roulette.handleFilterChange(key, checked);
window.closePatternLog = () => window.app.roulette.closePatternLog();

window.createRipple = function(event) {
    const button = event.currentTarget;
    const circle = document.createElement("span");
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;
    circle.style.width = circle.style.height = `${diameter}px`;
    const rect = button.getBoundingClientRect();
    circle.style.left = `${event.clientX - rect.left - radius}px`;
    circle.style.top = `${event.clientY - rect.top - radius}px`;
    circle.classList.add("ripple-span");
    const existing = button.querySelector(".ripple-span");
    if (existing) existing.remove();
    button.appendChild(circle);
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.app.init());
} else {
    window.app.init();
}