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
                if (!patStats[bet.pattern]) patStats[bet.pattern] = { w: 0, l: 0 };
                if (BankrollManager.isBetWin(spin, bet.category, bet.target)) patStats[bet.pattern].w++; else patStats[bet.pattern].l++;
            });
        });

        const perimeterStats = BankrollManager.calculatePerimeterStats(this.state);
        const pLimit = this.state.perimeterLimit || 14;

        this.state.pendingBets.forEach((bet, index) => {
            const div = document.createElement('div');
            const pStat = patStats[bet.pattern];
            const patRate = (pStat && (pStat.w + pStat.l > 0)) ? Math.round((pStat.w / (pStat.w + pStat.l)) * 100) : 0;
            
            const localStat = perimeterStats[bet.pattern];
            const isHot = localStat && localStat.rate > 0;
            const localHits = localStat ? localStat.w : 0;

            const styleClass = Formatters.getStyle(bet.target);
            const rawBetName = 'BET ' + Formatters.getName(bet.category, bet.target);
            const betLabel = isCompact ? Formatters.compactTokenLabel(rawBetName.replace('BET ', '')) : rawBetName;
            const patternLabel = isCompact ? Formatters.compactPatternLabel(bet.pattern) : bet.pattern;

            div.className = `grid-item relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/10 to-transparent backdrop-blur-lg p-2.5 flex flex-col justify-center gap-1 select-none cursor-pointer transition-transform hover:scale-105 hover:shadow-xl duration-300 ${styleClass} ${bet.confirmed ? 'card-confirmed' : ''} ${isHot ? 'ring-2 ring-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]' : ''}`;
            div.style.flex = "1 1 100px"; div.style.maxWidth = "220px";
            div.setAttribute('ondblclick', `app.roulette.toggleBetConfirmation(${index})`);

            div.innerHTML = `
                <div class="absolute top-2 right-2 z-20">
                    <input type="checkbox" class="bet-checkbox shadow-md" ${bet.confirmed ? 'checked' : ''} onclick="app.roulette.toggleBetConfirmation(${index})">
                </div>
                <div class="flex items-center relative z-10 min-w-0 pr-6 mb-0.5">
                    <span class="text-base sm:text-lg font-black truncate text-white drop-shadow-lg tracking-tight">${betLabel}</span>
                </div>
                <div class="flex justify-between items-center text-[10px] text-gray-200 relative z-10 min-w-0 pt-1.5 border-t border-white/10">
                    <span class="truncate pr-2 font-bold"><i class="fas fa-chart-line opacity-50 mr-1"></i>${patternLabel} <span class="font-mono font-bold text-white ml-0.5 drop-shadow">| ${patRate}%</span></span>
                    <span class="font-mono text-[10px] shrink-0 px-1.5 py-0.5 rounded tracking-wide ${localHits > 0 ? 'bg-emerald-500/30 text-emerald-300 font-black border border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'bg-black/50 text-gray-300 font-bold border border-white/10'}">${localHits}/${pLimit}</span>
                </div>
                <div class="absolute -bottom-6 -right-6 w-20 h-20 bg-white/5 rounded-full blur-2xl pointer-events-none z-0"></div>`;
            dashboard.appendChild(div);
        });
    }
}