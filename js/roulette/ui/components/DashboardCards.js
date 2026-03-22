import Formatters from '../Formatters.js';
import BankrollManager from '../../engine/BankrollManager.js';
import { PATTERN_CONFIG } from '../../config.js';

export default class DashboardCards {
    constructor(controller, state) {
        this.controller = controller;
        this.state = state;
    }

    updateFilterEfficiencies() {
        const cats = { 'Color': { w: 0, t: 0 }, 'High/Low': { w: 0, t: 0 }, 'Odd/Even': { w: 0, t: 0 }, 'Dozens': { w: 0, t: 0 }, 'Columns': { w: 0, t: 0 } };
        const pats = {};
        const catMap = { 'Color': 'color', 'High/Low': 'hl', 'Odd/Even': 'oe', 'Dozens': 'doz', 'Columns': 'col' };
        PATTERN_CONFIG.forEach(p => pats[p.key] = { w: 0, t: 0 });

        this.state.history.forEach(spin => {
            if (!spin.bets) return;
            spin.bets.forEach(bet => {
                const isWin = BankrollManager.isBetWin(spin, bet.category, bet.target);
                if (cats[bet.category]) { cats[bet.category].t++; if (isWin) cats[bet.category].w++; }
                const cKey = catMap[bet.category] || bet.category;
                if (pats[bet.pattern] && (this.state.activeFilters[bet.category] === true || this.state.activeFilters[cKey] === true)) { pats[bet.pattern].t++; if (isWin) pats[bet.pattern].w++; }
            });
        });

        const update = (key, id, src) => {
            const el = document.getElementById(id); if (!el) return;
            const d = src[key]; const rate = d.t === 0 ? 0 : Math.round((d.w / d.t) * 100);
            el.innerText = ` [${rate}%]`; el.className = d.t === 0 ? "text-[10px] ml-1 text-gray-600" : (rate >= 50 ? "text-[10px] ml-1 text-green-400 font-bold" : "text-[10px] ml-1 text-red-400 font-bold");
        };
        ['Color', 'High/Low', 'Odd/Even', 'Dozens', 'Columns'].forEach(cat => update(cat, `lbl-filter-${catMap[cat]}`, cats));
        PATTERN_CONFIG.forEach(p => update(p.key, `lbl-filter-${p.key}`, pats));
    }

    renderDashboard() {
        const dashboard = document.getElementById('roulette-dashboard');
        if (!dashboard) return;
        const isCompact = window.matchMedia && window.matchMedia('(max-width: 640px)').matches;
        const catMap = { 'Color': 'color', 'High/Low': 'hl', 'Odd/Even': 'oe', 'Dozens': 'doz', 'Columns': 'col' };
        
        dashboard.innerHTML = '';
        this.updateFilterEfficiencies();

        if (!Object.values(this.state.activeFilters).some(v => v === true)) {
            dashboard.innerHTML = `<div class="grid-item w-full flex flex-col items-center justify-center text-gray-500 py-2 border border-dashed border-white/10 rounded-xl"><span class="font-mono text-xs uppercase tracking-widest text-red-500"><i class="fas fa-filter-circle-xmark"></i> ALL FILTERS OFF</span></div>`;
            return;
        }
        if (this.state.pendingBets.length === 0) {
            dashboard.innerHTML = `<div class="grid-item w-full flex flex-col items-center justify-center text-gray-500 py-2 border border-dashed border-white/10 rounded-xl"><span class="font-mono text-xs uppercase tracking-widest text-gray-500">${this.state.ghostMode ? 'Scanning Patterns (Ghost Mode Active)' : 'Scanning Patterns'}</span></div>`;
            return;
        }

        const patStats = {};
        this.state.history.forEach(spin => {
            if (!spin.bets) return;
            spin.bets.forEach(bet => {
                if (!(this.state.activeFilters[bet.category] === true || this.state.activeFilters[catMap[bet.category]] === true)) return;
                const compositeKey = `${bet.pattern} [${bet.category}]`;
                if (!patStats[compositeKey]) patStats[compositeKey] = { w: 0, l: 0 };
                if (BankrollManager.isBetWin(spin, bet.category, bet.target)) patStats[compositeKey].w++; else patStats[compositeKey].l++;
            });
        });

        const perimeterStats = BankrollManager.calculatePerimeterStats(this.state);
        const pLimit = this.state.perimeterLimit || 14;

        let renderedCount = 0;

        this.state.pendingBets.forEach((bet, index) => {
            const compositeKey = `${bet.pattern} [${bet.category}]`;
            
            const localStat = perimeterStats[compositeKey];
            const localHits = localStat ? localStat.w : 0;

            // STRICT PERIMETER FILTER: Only consider bets that have passed (won) in the recent perimeter
            if (localHits === 0) return;

            renderedCount++;

            const div = document.createElement('div');
            const pStat = patStats[compositeKey];
            const patRate = (pStat && (pStat.w + pStat.l > 0)) ? Math.round((pStat.w / (pStat.w + pStat.l)) * 100) : 0;
            
            const isHot = localStat && localStat.rate > 0;

            const styleClass = Formatters.getStyle(bet.target);
            const rawBetName = 'BET ' + Formatters.getName(bet.category, bet.target);
            const betLabel = isCompact ? Formatters.compactTokenLabel(rawBetName.replace('BET ', '')) : rawBetName;
            const patternLabel = isCompact ? Formatters.compactPatternLabel(bet.pattern) : bet.pattern;

            div.className = `grid-item shrink-0 whitespace-normal relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/10 to-transparent backdrop-blur-lg p-2 sm:p-2.5 flex flex-col justify-center gap-0.5 sm:gap-1 select-none cursor-pointer transition-transform hover:scale-105 hover:shadow-xl duration-300 ${styleClass} ${bet.confirmed ? 'card-confirmed' : ''} ${isHot ? 'ring-1 ring-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.25)]' : ''}`;
            div.style.flex = "0 0 auto"; div.style.minWidth = "150px"; div.style.maxWidth = "220px";
            div.setAttribute('ondblclick', `app.roulette.toggleBetConfirmation(${index})`);

            const rateColor = patRate >= 50 ? 'text-emerald-400' : (patRate >= 40 ? 'text-yellow-400' : 'text-rose-400');
            const pulseDot = isHot 
                ? `<span class="relative flex h-1.5 w-1.5"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span></span>` 
                : `<span class="h-1.5 w-1.5 rounded-full bg-gray-500/50"></span>`;

            div.innerHTML = `
                <div class="absolute top-2 right-2 z-20">
                    <input type="checkbox" class="bet-checkbox shadow-md scale-90 sm:scale-100" ${bet.confirmed ? 'checked' : ''} onclick="app.roulette.toggleBetConfirmation(${index})">
                </div>
                <div class="flex items-center relative z-10 min-w-0 pr-6 mb-0.5">
                    <span class="text-sm sm:text-base font-black truncate text-white drop-shadow-lg tracking-tight">${betLabel}</span>
                </div>
                <div class="flex justify-between items-center relative z-10 min-w-0 pt-1 mt-0.5 border-t border-white/10">
                    <div class="flex items-center gap-1.5 truncate pr-2" title="${patternLabel} (Lifetime Win Rate)">
                        <span class="text-[8px] sm:text-[9px] font-bold text-gray-300 uppercase tracking-wider truncate"><i class="fas fa-microchip text-white/40 mr-1"></i>${patternLabel}</span>
                        <span class="text-[8px] sm:text-[9px] font-black ${rateColor} bg-black/40 px-1 rounded shadow-inner border border-white/5">${patRate}%</span>
                    </div>
                    <div class="flex items-center gap-1 shrink-0 bg-black/40 px-1 sm:px-1.5 py-0.5 rounded border border-white/10 shadow-inner" title="Perimeter Momentum: ${localHits} hits in last ${pLimit} spins">
                        ${pulseDot}
                        <span class="font-mono text-[8px] sm:text-[9px] font-bold ${isHot ? 'text-emerald-400' : 'text-gray-400'} tracking-wide">${localHits}/${pLimit}</span>
                    </div>
                </div>
                <div class="absolute -bottom-6 -right-6 w-20 h-20 bg-white/10 rounded-full blur-2xl pointer-events-none z-0"></div>`;
            dashboard.appendChild(div);
        });

        if (renderedCount === 0 && this.state.pendingBets.length > 0) {
            dashboard.innerHTML = `<div class="grid-item w-full flex flex-col items-center justify-center text-gray-500 py-2 border border-dashed border-white/10 rounded-xl"><span class="font-mono text-xs uppercase tracking-widest text-gray-500">Awaiting Proven Signals...</span></div>`;
        }
    }
}