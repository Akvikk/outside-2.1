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
            const cStat = this.state.engineStatsMaster.categoryStats ? this.state.engineStatsMaster.categoryStats[bet.category] : null;
            const catRate = (cStat && (cStat.w + cStat.l > 0)) ? Math.round((cStat.w / (cStat.w + cStat.l)) * 100) : 0;
            
            const localStat = perimeterStats[bet.pattern];
            const isHot = localStat && localStat.rate > 0;
            const localHits = localStat ? localStat.w : 0;

            const styleClass = Formatters.getStyle(bet.target);
            const rawBetName = 'BET ' + Formatters.getName(bet.category, bet.target);
            const betLabel = isCompact ? Formatters.compactTokenLabel(rawBetName.replace('BET ', '')) : rawBetName;
            const patternLabel = isCompact ? Formatters.compactPatternLabel(bet.pattern) : bet.pattern;

            div.className = `grid-item relative overflow-hidden rounded-lg border border-white/10 bg-white/5 backdrop-blur-md p-2 pl-3 flex flex-col gap-1 select-none cursor-pointer ${styleClass} ${bet.confirmed ? 'card-confirmed' : ''} ${isHot ? 'ring-2 ring-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : ''}`;
            div.style.flex = "1 1 120px"; div.style.maxWidth = "280px";
            div.setAttribute('ondblclick', `app.roulette.toggleBetConfirmation(${index})`);

            div.innerHTML = `
                <div class="absolute top-2 right-2 z-20">
                    <input type="checkbox" class="bet-checkbox" ${bet.confirmed ? 'checked' : ''} onclick="app.roulette.toggleBetConfirmation(${index})">
                </div>
                <div class="flex justify-between items-center pr-6 relative z-10 min-w-0">
                    <span class="text-base font-black truncate text-white drop-shadow-md">${betLabel}</span>
                    <span class="text-xs font-black text-yellow-400 shrink-0">${catRate}%</span>
                </div>
                <div class="flex justify-between items-center text-[10px] text-gray-300 relative z-10 min-w-0">
                    <span class="truncate pr-2 font-bold">${patternLabel} <span class="opacity-70 font-mono font-normal">| ${patRate}%</span></span>
                    <span class="font-mono shrink-0 ${localHits > 0 ? 'text-[#30D158] font-bold' : 'text-gray-500'}">${localHits}/${pLimit}</span>
                </div>`;
            dashboard.appendChild(div);
        });
    }
}