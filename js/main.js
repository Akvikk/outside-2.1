import AppController from './app.js';

document.addEventListener('DOMContentLoaded', () => {
    const app = new AppController();
    window.app = app;

    // --- GLOBAL ANIMATION UTILS ---
    window.createRipple = function(event) {
        const btn = event.currentTarget;
        const rect = btn.getBoundingClientRect();
        const ripple = document.createElement('span');
        ripple.className = 'ripple-span';
        ripple.style.left = (event.clientX - rect.left) + 'px';
        ripple.style.top = (event.clientY - rect.top) + 'px';
        btn.appendChild(ripple);
        ripple.addEventListener('animationend', () => ripple.remove());
    };

    // --- LEGACY HTML BRIDGE ---
    window.handleSpin = (...args) => app.handleSpin(...args);
    window.undo = () => app.undo();
    window.toggleAnalytics = () => app.toggleAnalytics();
    window.toggleFilterMenu = (e) => app.toggleFilterMenu(e);
    window.toggleBetsModal = () => app.toggleBetsModal();
    window.toggleMainMenu = (e) => app.toggleMainMenu(e);
    window.closeAllMenus = (e) => app.closeAllMenus(e);
    window.toggleStopwatchState = () => app.toggleStopwatchState();
    window.resetStopwatch = () => app.resetStopwatch();

    // Route deep links back to Roulette/Baccarat proxies
    window.switchAnalyticsMode = (mode) => app.roulette.switchAnalyticsMode(mode);
    window.toggleHeatmapMetric = () => app.roulette.toggleHeatmapMetric();
    window.closePatternLog = () => app.roulette.closePatternLog();
    window.toggleAccordion = (id) => app.roulette.toggleAccordion(id);
    window.exportSpins = () => app.roulette.exportSpins();
    window.showResetModal = () => app.roulette.showResetModal();
    window.changeSimProgression = (val) => app.roulette.changeSimProgression(val);
    window.toggleSimFilter = (type, key) => app.roulette.toggleSimFilter(type, key);
    window.toggleCategorySelection = (checked) => app.roulette.toggleCategorySelection(checked);
    window.handleFilterChange = (key, val) => app.roulette.handleFilterChange(key, val);
    window.togglePatternSelection = (checked) => app.roulette.togglePatternSelection(checked);
    window.toggleGridColumn = (key) => app.roulette.toggleGridColumn(key);
    window.updateBankrollSettings = () => app.roulette.updateBankrollSettings();
    window.importSpins = (files) => app.roulette.importSpins(files);
    window.toggleTrendIcons = () => app.roulette.toggleTrendIcons();
    window.toggleCurvedLayout = () => app.roulette.toggleCurvedLayout();
    window.toggleSound = (key) => app.roulette.toggleSound(key);
    
    // Ensure App initialization executes
    app.init();
});
