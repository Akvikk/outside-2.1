import HistoryGrid from './components/HistoryGrid.js';
import DashboardCards from './components/DashboardCards.js';
import TrendGraph from './components/TrendGraph.js';
import BankrollManager from '../engine/BankrollManager.js';

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
        const body = document.getElementById('perimeterRadarBody');
        if (!body) return;

        const pStats = BankrollManager.calculatePerimeterStats(this.state);
        const patterns = Object.keys(pStats).sort((a, b) => pStats[b].rate - pStats[a].rate);

        if (patterns.length === 0) {
            body.innerHTML = `<tr><td colspan="3" class="p-8 text-center text-gray-600 italic">No patterns detected in the current perimeter.</td></tr>`;
            return;
        }

        body.innerHTML = patterns.map(p => {
            const stat = pStats[p];
            const isHot = stat.rate > 0;
            return `
                <tr class="hover:bg-white/5 transition-colors">
                    <td class="p-3 font-medium text-gray-300 flex items-center gap-2">
                        ${isHot ? '<span class="text-emerald-500"><i class="fas fa-fire"></i></span>' : '<span class="text-gray-600"><i class="fas fa-snowflake"></i></span>'}
                        ${p}
                    </td>
                    <td class="p-3 text-center text-gray-400">
                        <span class="text-green-400">${stat.w}</span> - <span class="text-red-400">${stat.l}</span>
                    </td>
                    <td class="p-3 text-right">
                        <span class="${isHot ? 'text-emerald-400 font-bold' : 'text-gray-500'}">${stat.rate}%</span>
                    </td>
                </tr>
            `;
        }).join('');
    }
}