import BankrollManager from '../../engine/BankrollManager.js';
import TrendGraph from './TrendGraph.js';

export default class PerimeterRadar {
    constructor(controller, state) {
        this.controller = controller;
        this.state = state;
    }

    render() {
        const view = document.getElementById('perimeterView');
        if (!view) return;

        const pStats = BankrollManager.calculatePerimeterStats(this.state);
        const patterns = Object.keys(pStats).sort((a, b) => pStats[b].rate - pStats[a].rate);

        const limit = this.state.perimeterLimit || 14;
        const subset = this.state.history.slice(-limit);
        
        let totalBets = 0;
        let totalWins = 0;
        let totalLosses = 0;
        let netUnits = 0;
        let bankrollHistory = [0];

        subset.forEach(spin => {
            if (!spin.bets) return;
            spin.bets.forEach(bet => {
                const isWin = BankrollManager.isBetWin(spin, bet.category, bet.target);
                const winReward = (bet.category === 'Dozens' || bet.category === 'Columns') ? 2 : 1;
                totalBets++;
                if (isWin) {
                    totalWins++;
                    netUnits += winReward;
                } else {
                        totalLosses++;
                    netUnits -= 1;
                }
                    bankrollHistory.push(netUnits);
            });
        });

        const hitRate = totalBets > 0 ? Math.round((totalWins / totalBets) * 100) : 0;
        const netColor = netUnits > 0 ? 'text-[#30D158]' : (netUnits < 0 ? 'text-[#FF453A]' : 'text-white');
        const netSign = netUnits > 0 ? '+' : '';

        let listHTML = '';
        if (patterns.length === 0) {
            listHTML = `<div class="p-8 text-center text-gray-600 italic">No patterns detected in the current perimeter.</div>`;
        } else {
            listHTML = patterns.map(p => {
                const stat = pStats[p];
                const isHot = stat.rate > 0;
                let rateColor = 'text-yellow-400';
                if (stat.rate >= 55) rateColor = 'text-[#30D158]';
                else if (stat.rate <= 45) rateColor = 'text-[#FF453A]';

                return `
                    <div class="flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5">
                        <div class="flex items-center gap-3 flex-1">
                            ${isHot ? '<span class="text-emerald-500 text-sm"><i class="fas fa-fire"></i></span>' : '<span class="text-gray-600 text-sm"><i class="fas fa-snowflake"></i></span>'}
                            <span class="font-medium text-white text-sm">${p}</span>
                        </div>
                        <div class="w-24 text-center font-mono text-gray-300 text-sm">
                            <span class="text-[#30D158]">${stat.w}</span> - <span class="text-[#FF453A]">${stat.l}</span>
                        </div>
                        <div class="w-20 text-right">
                            <span class="font-bold ${rateColor} bg-white/5 border border-white/10 px-2 py-1 rounded-md text-xs shadow-sm">${stat.rate}%</span>
                        </div>
                    </div>
                `;
            }).join('');
        }

        view.innerHTML = `
            <div class="p-6 flex-1 overflow-auto flex flex-col gap-6">
                <div class="flex justify-between items-center border-b border-white/10 pb-2 shrink-0">
                    <h3 class="text-sm font-bold text-emerald-400 uppercase tracking-widest">
                        Localized Momentum
                    </h3>
                    <span class="text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-black/40 px-2 py-1 rounded border border-white/10">LAST ${limit} SPINS</span>
                </div>

                <!-- TOP KPI HEADER -->
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 shrink-0">
                    <div class="grid-item bg-white/5 p-4 rounded-xl text-center border border-white/10 shadow">
                        <div class="text-gray-400 text-[10px] uppercase font-bold mb-1 tracking-wider">Net Units</div>
                        <div class="text-2xl font-black ${netColor}">${netSign}${netUnits}</div>
                    </div>
                    <div class="grid-item bg-white/5 p-4 rounded-xl text-center border border-white/10 shadow">
                        <div class="text-gray-400 text-[10px] uppercase font-bold mb-1 tracking-wider">Hit Rate</div>
                        <div class="text-2xl font-black text-white">${hitRate}%</div>
                    </div>
                    <div class="grid-item bg-white/5 p-4 rounded-xl text-center border border-white/10 shadow">
                        <div class="text-gray-400 text-[10px] uppercase font-bold mb-1 tracking-wider">Bets Placed</div>
                        <div class="text-2xl font-black text-blue-400">${totalBets}</div>
                    </div>
                </div>

                <!-- TREND GRAPH -->
                <div class="w-full shrink-0">
                    <div id="perimeterGraphContainer" class="grid-item bg-black/20 rounded-2xl border border-white/10 h-48 shadow-inner overflow-hidden relative"></div>
                </div>

                <!-- PREMIUM LIST STRUCTURE -->
                <div class="grid-item bg-black/20 rounded-2xl border border-white/10 overflow-hidden shadow-inner flex-1 flex flex-col min-h-[200px]">
                    <div class="flex items-center justify-between px-4 py-3 bg-white/5 text-white/50 text-[10px] tracking-widest uppercase border-b border-white/10 sticky top-0 z-10 backdrop-blur-md">
                        <div class="flex-1">Pattern</div>
                        <div class="w-24 text-center">W / L</div>
                        <div class="w-20 text-right">Win Rate</div>
                    </div>
                    <div class="overflow-y-auto no-scrollbar flex-1 pb-2">
                        ${listHTML}
                    </div>
                </div>
            </div>
        `;

        TrendGraph.drawAdvancedGraph(bankrollHistory, totalWins, totalLosses, 'perimeterGraphContainer');
    }
}