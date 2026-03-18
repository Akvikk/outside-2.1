import HistoryGrid from './components/HistoryGrid.js';
import DashboardCards from './components/DashboardCards.js';
import TrendGraph from './components/TrendGraph.js';
import PerimeterRadar from './components/PerimeterRadar.js';

export default class RouletteUI {
    constructor(controller, state) {
        this.controller = controller;
        this.state = state;
        this.grid = new HistoryGrid(controller, state);
        this.dashboard = new DashboardCards(controller, state);
        this.perimeterRadar = new PerimeterRadar(controller, state);
        this._viewportSyncTimer = null;
        this.bindViewportSync();
    }

    showToast(message, type = 'info') {
        if (window.app && window.app.utils) window.app.utils.showToast(message, type);
    }

    bindViewportSync() {
        const onViewportChange = () => {
            clearTimeout(this._viewportSyncTimer);
            this._viewportSyncTimer = setTimeout(() => {
                this.grid.syncCompactGridHeaders();
                this.controller.reRenderHistory();
                this.renderDashboard();
            }, 120);
        };
        window.addEventListener('resize', onViewportChange, { passive: true });
        window.addEventListener('orientationchange', onViewportChange, { passive: true });
    }

    renderRow(spin) { this.grid.renderRow(spin); }
    
    renderDashboard() { this.dashboard.renderDashboard(); }
    
    updateFilterEfficiencies() { this.dashboard.updateFilterEfficiencies(); }

    updateAnalyticsUI() {
        let stats = this.state.currentAnalyticsTab === 'master' ? this.state.engineStatsMaster :
                    (this.state.currentAnalyticsTab === '1to1' ? this.state.engineStats1to1 : this.state.engineStats2to1);
        TrendGraph.drawAdvancedGraph(stats.bankrollHistory, stats.totalWins, stats.totalLosses, 'engineGraphContainer');
    }

    updateActualBetsUI() {
        if (this.state.currentBetsTab === 'trend') {
            TrendGraph.drawAdvancedGraph(this.state.userStats.bankrollHistory, this.state.userStats.totalWins, this.state.userStats.totalLosses, 'userGraphContainer');
        }
    }

    updateSimulationUI() {
        // Empty for now to prevent undefined function crash. 
        // Logic can be cleanly added in a Simulation UI component if needed.
    }

    updatePerimeterUI() {
        this.perimeterRadar.render();
    }
}