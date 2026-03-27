import HistoryGrid from './components/HistoryGrid.js';
import DashboardCards from './components/DashboardCards.js';
import TrendGraph from './components/TrendGraph.js';
import PerimeterRadar from './components/PerimeterRadar.js';
import FaceHud from './components/FaceHud.js';
import { PATTERN_CONFIG } from '../config.js';

export default class RouletteUI {
    constructor(controller, state) {
        this.controller = controller;
        this.state = state;
        this.grid = new HistoryGrid(controller, state);
        this.dashboard = new DashboardCards(controller, state);
        this.perimeterRadar = new PerimeterRadar(controller, state);
        this.faceHud = new FaceHud(controller, state);
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

    renderFaceHud() { this.faceHud.render(); }

    toggleFaceHud() { this.faceHud.toggle(); }
    
    updateFilterEfficiencies() { this.dashboard.updateFilterEfficiencies(); }

    updateAnalyticsUI() {
        let stats = this.state.currentAnalyticsTab === 'master' ? this.state.engineStatsMaster :
                    (this.state.currentAnalyticsTab === '1to1' ? this.state.engineStats1to1 : this.state.engineStats2to1);
        
        // 1. Update KPIs
        const totalBets = stats.totalWins + stats.totalLosses;
        const hitRate = totalBets > 0 ? Math.round((stats.totalWins / totalBets) * 100) : 0;
        
        const elNet = document.getElementById('engineNetUnits') || document.getElementById('engNetUnits');
        const elHr = document.getElementById('engineHitRate') || document.getElementById('engHitRate');
        const elTotal = document.getElementById('engineTotalBets') || document.getElementById('engTotalBets');

        if (elNet) {
            elNet.textContent = stats.netUnits > 0 ? `+${stats.netUnits}` : stats.netUnits;
            elNet.className = `text-2xl font-black ${stats.netUnits > 0 ? 'text-[#30D158]' : (stats.netUnits < 0 ? 'text-[#FF453A]' : 'text-white')}`;
        }
        if (elHr) {
            elHr.textContent = `${hitRate}%`;
        }
        if (elTotal) {
            elTotal.textContent = totalBets;
        }

        TrendGraph.drawAdvancedGraph(stats.bankrollHistory, stats.totalWins, stats.totalLosses, 'engineGraphContainer');

        // 2. Populate Engine Heatmap
        const tbody = document.getElementById('engineHeatmapBody') || document.getElementById('patternStatsBody');
        if (tbody) {
            const mode = this.state.heatmapMode || 'PATTERNS';
            const source = mode === 'CATEGORIES' ? stats.categoryStats : stats.patternStats;
            
            if (!source || Object.keys(source).length === 0) {
                tbody.innerHTML = `<tr><td colspan="4" class="p-8 text-center text-gray-600 italic">No data available.</td></tr>`;
            } else {
                const rows = Object.keys(source).map(key => {
                    const data = source[key];
                    const t = data.w + data.l;
                    const rate = t > 0 ? Math.round((data.w / t) * 100) : 0;
                    return { key, w: data.w, l: data.l, t, rate };
                }).sort((a, b) => b.t - a.t); 

                tbody.innerHTML = rows.map(r => {
                    let colorClass = 'text-yellow-400';
                    if (r.rate >= 55) colorClass = 'text-[#30D158]';
                    else if (r.rate <= 45) colorClass = 'text-[#FF453A]';

                    return `
                        <tr class="hover:bg-white/5 transition-colors border-b border-white/5">
                            <td class="p-3 font-medium text-white">${r.key}</td>
                            <td class="p-3 text-right font-mono text-gray-400">${r.t}</td>
                            <td class="p-3 text-right font-mono text-gray-300"><span class="text-[#30D158]">${r.w}</span> - <span class="text-[#FF453A]">${r.l}</span></td>
                            <td class="p-3 text-right font-bold ${colorClass}">${r.rate}%</td>
                        </tr>
                    `;
                }).join('');
            }
        }
    }

    updateActualBetsUI() {
        const stats = this.state.userStats;
        const log = this.state.confirmedBetLog;

        // 1. Update KPIs
        const elNet = document.getElementById('userNetUnits');
        const elHr = document.getElementById('userHitRate');
        const elTotal = document.getElementById('userTotalBets');

        if (elNet) {
            elNet.textContent = stats.netUnits > 0 ? `+${stats.netUnits}` : stats.netUnits;
            elNet.className = `text-xl font-black ${stats.netUnits > 0 ? 'text-[#30D158]' : (stats.netUnits < 0 ? 'text-[#FF453A]' : 'text-white')}`;
        }
        if (elHr) {
            const hr = stats.totalBets > 0 ? Math.round((stats.totalWins / stats.totalBets) * 100) : 0;
            elHr.textContent = `${hr}%`;
        }
        if (elTotal) {
            elTotal.textContent = stats.totalBets;
        }

        // 2. & 3. Process Selected Tab Content
        if (this.state.currentBetsTab === 'trend') {
            TrendGraph.drawAdvancedGraph(stats.bankrollHistory, stats.totalWins, stats.totalLosses, 'userGraphContainer');
        
        } else if (this.state.currentBetsTab === 'logs') {
            const tbody = document.getElementById('actualBetsBody');
            if (tbody) {
                if (log.length === 0) {
                    tbody.innerHTML = `<tr><td colspan="4" class="p-8 text-center text-gray-600 italic">No bets confirmed yet.</td></tr>`;
                } else {
                    tbody.innerHTML = log.map(bet => {
                        const isWin = bet.outcome === 'WIN';
                        const badgeStyle = isWin 
                            ? 'text-[#30D158] bg-[#30D158]/10 border-[#30D158]/30' 
                            : 'text-[#FF453A] bg-[#FF453A]/10 border-[#FF453A]/30';
                            
                        return `
                            <tr class="hover:bg-white/5 transition-colors border-b border-white/5">
                                <td class="p-4 text-gray-400 font-mono">${bet.betNumber}</td>
                                <td class="p-4 font-bold text-white">${bet.pattern}</td>
                                <td class="p-4 text-gray-300">${bet.target}</td>
                                <td class="p-4 text-right">
                                    <span class="px-2 py-1 border rounded font-bold text-[10px] uppercase tracking-wider ${badgeStyle}">${bet.outcome}</span>
                                </td>
                            </tr>
                        `;
                    }).join('');
                }
            }
        
        } else if (this.state.currentBetsTab === 'analytics') {
            const tbody = document.getElementById('userHeatmapBody');
            if (tbody) {
                if (log.length === 0) {
                    tbody.innerHTML = `<tr><td colspan="4" class="p-8 text-center text-gray-600 italic">No data available.</td></tr>`;
                } else {
                    const mode = this.state.userHeatmapMode || 'PATTERNS';
                    const agg = {};
                    
                    // Aggregate Logs
                    log.forEach(bet => {
                        const key = mode === 'CATEGORIES' ? bet.category : bet.pattern;
                        if (!agg[key]) agg[key] = { t: 0, w: 0, l: 0 };
                        
                        agg[key].t++;
                        if (bet.outcome === 'WIN') agg[key].w++;
                        else agg[key].l++;
                    });

                    // Sort by total volume
                    const rows = Object.keys(agg).map(key => {
                        const data = agg[key];
                        const rate = Math.round((data.w / data.t) * 100);
                        return { key, ...data, rate };
                    }).sort((a, b) => b.t - a.t); 

                    // Render Rows
                    tbody.innerHTML = rows.map(r => {
                        let colorClass = 'text-yellow-400';
                        if (r.rate >= 55) colorClass = 'text-[#30D158]';
                        else if (r.rate <= 45) colorClass = 'text-[#FF453A]';

                        return `
                            <tr class="hover:bg-white/5 transition-colors border-b border-white/5">
                                <td class="p-3 font-medium text-white">${r.key}</td>
                                <td class="p-3 text-right font-mono text-gray-400">${r.t}</td>
                                <td class="p-3 text-right font-mono text-gray-300"><span class="text-[#30D158]">${r.w}</span> - <span class="text-[#FF453A]">${r.l}</span></td>
                                <td class="p-3 text-right font-bold ${colorClass}">${r.rate}%</td>
                            </tr>
                        `;
                    }).join('');
                }
            }
            
            // Sync Heatmap filter toggle styling
            const btnPat = document.getElementById('uhm-btn-pat');
            const btnCat = document.getElementById('uhm-btn-cat');
            if (btnPat && btnCat) {
                const mode = this.state.userHeatmapMode || 'PATTERNS';
                btnPat.className = `px-3 py-1 text-[10px] font-bold rounded-md transition-all ${mode === 'PATTERNS' ? 'bg-[#007AFF] text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`;
                btnCat.className = `px-3 py-1 text-[10px] font-bold rounded-md transition-all ${mode === 'CATEGORIES' ? 'bg-[#007AFF] text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`;
            }
        }
    }

    updateSimulationUI() {
        if (this.state.simState.mode !== 'simulation') return;

        const simStats = this.controller.runSimulation();

        const elNet = document.getElementById('simNet');
        const elHr = document.getElementById('simRate');
        const elTotal = document.getElementById('simCount');
        const elDd = document.getElementById('simDrawdown');

        if (elNet) {
            elNet.textContent = simStats.netUnits > 0 ? `+${simStats.netUnits}` : simStats.netUnits;
            elNet.className = `text-2xl font-black ${simStats.netUnits > 0 ? 'text-[#30D158]' : (simStats.netUnits < 0 ? 'text-[#FF453A]' : 'text-white')}`;
        }
        if (elHr) {
            const hr = simStats.totalBets > 0 ? Math.round((simStats.totalWins / simStats.totalBets) * 100) : 0;
            elHr.textContent = `${hr}%`;
        }
        if (elTotal) elTotal.textContent = simStats.totalBets;
        if (elDd) elDd.textContent = `-${simStats.maxDrawdown}`;

        TrendGraph.drawAdvancedGraph(simStats.bankrollHistory, simStats.totalWins, simStats.totalLosses, 'simGraphContainer');

        const tbody = document.getElementById('sim-heatmap-body');
        if (tbody) {
            const source = simStats.patternStats;
            if (!source || Object.keys(source).length === 0) {
                tbody.innerHTML = `<tr><td colspan="4" class="p-8 text-center text-gray-600 italic">No simulated data available.</td></tr>`;
            } else {
                const rows = Object.keys(source).map(key => {
                    const data = source[key];
                    const rate = data.t > 0 ? Math.round((data.w / data.t) * 100) : 0;
                    return { key, ...data, rate };
                }).sort((a, b) => b.t - a.t); 

                tbody.innerHTML = rows.map(r => {
                    let colorClass = 'text-yellow-400';
                    if (r.rate >= 55) colorClass = 'text-[#30D158]';
                    else if (r.rate <= 45) colorClass = 'text-[#FF453A]';
                    return `<tr class="hover:bg-white/5 transition-colors border-b border-white/5"><td class="p-3 font-medium text-white">${r.key}</td><td class="p-3 text-center font-mono text-gray-400">${r.t}</td><td class="p-3 text-center font-mono text-gray-300"><span class="text-[#30D158]">${r.w}</span> - <span class="text-[#FF453A]">${r.l}</span></td><td class="p-3 text-right font-bold ${colorClass}">${r.rate}%</td></tr>`;
                }).join('');
            }
        }
    }

    updatePerimeterUI() {
        this.perimeterRadar.render();
    }
    
    renderFilters() {
        const rColors = ['text-cyan-300', 'text-yellow-300', 'text-red-300', 'text-emerald-300', 'text-purple-300', 'text-orange-300', 'text-pink-300', 'text-indigo-300', 'text-rose-300', 'text-rose-400', 'text-rose-500'];
        const rPatList = document.getElementById('roulette-filter-patterns-list');
        const rSimList = document.getElementById('roulette-sim-patterns');
        if (rPatList && this.controller && this.state) {
            rPatList.innerHTML = PATTERN_CONFIG.map((p, i) => `
                <label class="flex items-center gap-2 p-1.5 hover:bg-gray-800 rounded cursor-pointer transition-colors" for="filter-${p.key}">
                    <input type="checkbox" ${this.state.activeFilters[p.key] !== false ? 'checked' : ''} data-r-filter="${p.key}" class="filter-checkbox r-pattern-toggle" id="filter-${p.key}">
                    <span class="${rColors[i % rColors.length]} font-bold text-[10px] uppercase tracking-wider flex-1">${p.label} <span id="lbl-filter-${p.key}" class="text-gray-500 ml-1">[-]</span></span>
                </label>
            `).join('');
        }
        if (rSimList && this.controller && this.state) {
            rSimList.innerHTML = PATTERN_CONFIG.map((p) => `
                <label class="flex items-center gap-2 p-1 hover:bg-white/5 rounded cursor-pointer" for="sim-pat-${p.key}">
                    <input type="checkbox" class="sim-checkbox r-sim-toggle" ${this.state.simState.filters[p.key] !== false ? 'checked' : ''} data-r-sim-filter="${p.key}" id="sim-pat-${p.key}">
                    <span class="text-gray-300 text-xs">${p.label}</span>
                </label>
            `).join('');
        }
    }
}

document.addEventListener('change', (e) => {
    if (e.target.matches('.r-pattern-toggle')) {
        if (window.app && window.app.roulette) window.app.roulette.handleFilterChange(e.target.dataset.rFilter, e.target.checked);
    } else if (e.target.matches('.r-sim-toggle')) {
        if (window.app && window.app.roulette) {
            let chk = document.getElementById('sim-pat-' + e.target.dataset.rSimFilter);
            if(chk) window.app.roulette.toggleSimFilter('pat', e.target.dataset.rSimFilter);
        }
    }
});
