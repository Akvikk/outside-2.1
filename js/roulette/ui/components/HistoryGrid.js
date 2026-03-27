import Formatters from '../Formatters.js';
import BankrollManager from '../../engine/BankrollManager.js';
import { renderFaceBadges } from './FaceGroups.js';

export default class HistoryGrid {
    constructor(controller, state) {
        this.controller = controller;
        this.state = state;
        this.isCompactMobile = window.matchMedia && window.matchMedia('(max-width: 640px)').matches;
    }

    syncCompactGridHeaders() {
        this.isCompactMobile = window.matchMedia && window.matchMedia('(max-width: 640px)').matches;
        const thFace = document.getElementById('th-face');
        const thHL = document.getElementById('th-hl'); const thOE = document.getElementById('th-oe');
        const thDoz = document.getElementById('th-doz'); const thCol = document.getElementById('th-col');
        if (thFace) thFace.textContent = 'FACE';
        if (thHL) thHL.textContent = 'H/L'; if (thOE) thOE.textContent = 'O/E';
        if (thDoz) thDoz.textContent = this.isCompactMobile ? 'D' : 'DOZ';
        if (thCol) thCol.textContent = this.isCompactMobile ? 'C' : 'COL';
    }

    applyGridSettings() {
        this.syncCompactGridHeaders();

        const headerMap = {
            face: 'th-face',
            hl: 'th-hl',
            oe: 'th-oe',
            doz: 'th-doz',
            col: 'th-col'
        };

        Object.entries(headerMap).forEach(([key, id]) => {
            const el = document.getElementById(id);
            if (el) el.classList.toggle('hidden', this.state.gridSettings[key] === false);
        });

        const inputMap = {
            face: 'grid-face',
            hl: 'grid-hl',
            oe: 'grid-oe',
            doz: 'grid-doz',
            col: 'grid-col'
        };

        Object.entries(inputMap).forEach(([key, id]) => {
            const el = document.getElementById(id);
            if (el) el.checked = this.state.gridSettings[key] !== false;
        });
    }

    calculatePredictionResult(bets, currentSpin) {
        if (!bets || bets.length === 0) return { text: '-', style: '', tooltip: '' };
        let hits = 0, details = [], netProfit = 0;
        bets.forEach(bet => {
            const isWin = BankrollManager.isBetWin(currentSpin, bet.category, bet.target);
            if (isWin) { hits++; netProfit += (bet.category === 'Dozens' || bet.category === 'Columns') ? 2 : 1; }
            else { netProfit -= 1; }
            details.push(`BET ${Formatters.getName(bet.category, bet.target)} (${isWin ? 'WIN' : 'LOSS'})`);
        });
        details.push(`Net Units: ${netProfit > 0 ? '+' : ''}${netProfit}`);
        if (bets.length === 1) {
            const isWin = hits === 1;
            let text = Formatters.getName(bets[0].category, bets[0].target);
            if (this.isCompactMobile) text = Formatters.compactTokenLabel(text);
            return { text: text, style: isWin ? 'text-[#30D158] drop-shadow-[0_0_5px_rgba(48,209,88,0.5)]' : 'text-gray-400', tooltip: details.join('\n') };
        }
        let style = hits === bets.length ? 'text-[#30D158] font-black drop-shadow-[0_0_5px_rgba(48,209,88,0.5)]' : (netProfit > 0 ? 'text-yellow-400 font-bold drop-shadow-md' : (hits > 0 ? 'text-orange-400 font-bold drop-shadow-md' : 'text-gray-400'));
        return { text: this.isCompactMobile ? `${hits}/${bets.length}` : `${hits}/${bets.length} HIT`, style: style, tooltip: details.join('\n') };
    }

    renderRow(spin) {
        const tbody = document.getElementById('historyBody');
        if (!tbody) return;

        const visibleBets = (spin.bets || []).filter(bet => this.state.activeFilters[bet.pattern] !== false && this.state.activeFilters[bet.category === 'High/Low' ? 'hl' : (bet.category === 'Odd/Even' ? 'oe' : (bet.category === 'Dozens' ? 'doz' : (bet.category === 'Columns' ? 'col' : 'color')))]);
        const pObj = this.calculatePredictionResult(visibleBets, spin);

        const tr = document.createElement('tr');
        tr.className = 'data-row';

        const zTxt = spin.val === 0 ? '<span class="text-emerald-400 drop-shadow-md font-black">ZERO</span>' : '';
        const bgNum = spin.val === 0 ? 'bg-emerald-600/90 border-emerald-500/50 text-white shadow-[inset_0_0_10px_rgba(16,185,129,0.4)]' : (spin.color === 'R' ? 'bg-rose-600/90 border-rose-500/50 text-white shadow-[inset_0_0_10px_rgba(244,63,94,0.4)]' : 'bg-slate-900/90 border-slate-700/50 text-white shadow-[inset_0_0_10px_rgba(255,255,255,0.1)]');
        const cHL = spin.hl === 'H' ? 'cat-hl-high' : (spin.hl === 'L' ? 'cat-hl-low' : '');
        const cOE = spin.oe === 'Odd' ? 'cat-oe-odd' : (spin.oe === 'Even' ? 'cat-oe-even' : '');
        const cDZ = spin.doz === 'D1' ? 'cat-doz-d1' : (spin.doz === 'D2' ? 'cat-doz-d2' : (spin.doz === 'D3' ? 'cat-doz-d3' : ''));
        const cCL = spin.col === 'C1' ? 'cat-col-c1' : (spin.col === 'C2' ? 'cat-col-c2' : (spin.col === 'C3' ? 'cat-col-c3' : ''));

        tr.innerHTML = `
            <td class="data-cell w-[7%] text-gray-400 border-white/10 text-xs font-mono bg-black/40">${spin.spinNumber}</td>
            <td class="data-cell w-[10%] ${bgNum} text-lg font-black">${spin.val}</td>
            ${this.state.gridSettings.face ? `<td class="data-cell w-[16%] border-white/10 bg-black/20">${renderFaceBadges(spin.val)}</td>` : ''}
            ${this.state.gridSettings.hl ? `<td class="data-cell w-[13%] ${cHL}">${zTxt || (spin.hl === 'H' ? (this.isCompactMobile ? 'H' : 'High') : (this.isCompactMobile ? 'L' : 'Low'))}</td>` : ''}
            ${this.state.gridSettings.oe ? `<td class="data-cell w-[13%] ${cOE}">${zTxt || (spin.oe === 'Odd' ? (this.isCompactMobile ? 'O' : 'Odd') : (this.isCompactMobile ? 'E' : 'Even'))}</td>` : ''}
            ${this.state.gridSettings.doz ? `<td class="data-cell w-[10%] ${cDZ}">${zTxt || spin.doz}</td>` : ''}
            ${this.state.gridSettings.col ? `<td class="data-cell w-[10%] ${cCL}">${zTxt || spin.col}</td>` : ''}
            <td class="data-cell w-[21%] bg-black/30 border-l border-white/10 font-bold ${pObj.style}" title="${pObj.tooltip}">${pObj.text}</td>
        `;
        tbody.appendChild(tr);

        // Auto-scroll grid to the newest spin
        const container = document.querySelector('.history-container');
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }
}
