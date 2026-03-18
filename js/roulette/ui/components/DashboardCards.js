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

        this.state.pendingBets.forEach((bet, index) => {
            const div = document.createElement('div');
            const pStat = patStats[bet.pattern];
            const patRate = (pStat && (pStat.w + pStat.l > 0)) ? Math.round((pStat.w / (pStat.w + pStat.l)) * 100) : 0;
            const cStat = this.state.engineStatsMaster.categoryStats ? this.state.engineStatsMaster.categoryStats[bet.category] : null;
            const catRate = (cStat && (cStat.w + cStat.l > 0)) ? Math.round((cStat.w / (cStat.w + cStat.l)) * 100) : 0;
            
            const localStat = perimeterStats[bet.pattern];
            const isHot = localStat && localStat.rate > 0;

            const styleClass = Formatters.getStyle(bet.target);
            const rawBetName = 'BET ' + Formatters.getName(bet.category, bet.target);
            const categoryLabel = isCompact ? Formatters.compactCategoryLabel(bet.category) : bet.category;
            const betLabel = isCompact ? Formatters.compactTokenLabel(rawBetName.replace('BET ', '')) : rawBetName;
            const patternLabel = isCompact ? Formatters.compactPatternLabel(bet.pattern) : bet.pattern;

            div.className = `grid-item p-2 pl-2.5 flex flex-col justify-between relative overflow-hidden select-none cursor-pointer ${styleClass} ${bet.confirmed ? 'card-confirmed' : ''} ${isHot ? 'ring-2 ring-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : ''}`;
            div.style.flex = "1 1 120px"; div.style.maxWidth = "280px";
            div.setAttribute('ondblclick', `app.roulette.toggleBetConfirmation(${index})`);

            div.innerHTML = `
                <div class="w-full flex justify-between items-start relative z-10 gap-1">
                    <div class="flex flex-wrap items-center gap-1 flex-1 overflow-hidden opacity-90">
                        <span class="text-[8px] uppercase font-bold tracking-widest opacity-80 bg-black bg-opacity-40 px-1 rounded truncate">${categoryLabel}</span>
                        ${isHot ? '<span class="text-[8px] uppercase font-bold tracking-widest text-emerald-400 bg-emerald-900/40 px-1 rounded border border-emerald-500/30 whitespace-nowrap"><i class="fas fa-fire mr-0.5"></i>HOT</span>' : ''}
                    </div>
                    <div class="z-20 shrink-0"><input type="checkbox" class="bet-checkbox" ${bet.confirmed ? 'checked' : ''} onclick="app.roulette.toggleBetConfirmation(${index})"></div>
                </div>
                <div class="flex flex-col text-left mt-1 relative z-10 min-w-0">
                    <div class="flex items-center justify-between gap-1 min-w-0"><span class="text-sm font-black leading-none truncate text-white drop-shadow-md">${betLabel}</span><span class="text-[9px] shrink-0 font-bold text-yellow-300 opacity-90">${catRate}%</span></div>
                    <div class="flex items-center justify-between mt-0.5 min-w-0"><span class="text-[8px] font-bold text-blue-300 truncate">${patternLabel}</span><span class="text-[9px] font-mono text-gray-300 shrink-0">${patRate}%</span></div>
                </div>`;
            dashboard.appendChild(div);
        });
    }
}