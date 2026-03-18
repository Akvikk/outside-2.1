import Formatters from '../Formatters.js';
import BankrollManager from '../../engine/BankrollManager.js';

export default class HistoryGrid {
    constructor(controller, state) {
        this.controller = controller;
        this.state = state;
        this.isCompactMobile = window.matchMedia && window.matchMedia('(max-width: 640px)').matches;
    }

    syncCompactGridHeaders() {
        this.isCompactMobile = window.matchMedia && window.matchMedia('(max-width: 640px)').matches;
        const thHL = document.getElementById('th-hl'); const thOE = document.getElementById('th-oe');
        const thDoz = document.getElementById('th-doz'); const thCol = document.getElementById('th-col');
        if (thHL) thHL.textContent = 'H/L'; if (thOE) thOE.textContent = 'O/E';
        if (thDoz) thDoz.textContent = this.isCompactMobile ? 'D' : 'DOZ';
        if (thCol) thCol.textContent = this.isCompactMobile ? 'C' : 'COL';
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
            return { text: text, style: isWin ? 'text-green-400' : 'text-gray-500', tooltip: details.join('\n') };
        }
        let style = hits === bets.length ? 'text-green-400 font-black' : (netProfit > 0 ? 'text-yellow-400 font-bold' : (hits > 0 ? 'text-orange-400 font-bold' : 'text-gray-500'));
        return { text: this.isCompactMobile ? `${hits}/${bets.length}` : `${hits}/${bets.length} HIT`, style: style, tooltip: details.join('\n') };
    }

    renderRow(spin) {
        const tbody = document.getElementById('historyBody');
        if (!tbody) return;
        const tr = document.createElement('tr');
        const bgNum = spin.val === 0 ? 'bg-green-600 text-white' : (spin.color === 'R' ? 'bg-red-600 text-white' : 'bg-black text-white');
        const sHL = spin.hl === 'H' ? 'background-color:var(--col-high)' : (spin.hl === 'L' ? 'background-color:var(--col-low)' : '');
        const sOE = spin.oe === 'Odd' ? 'background-color:var(--col-odd)' : (spin.oe === 'Even' ? 'background-color:var(--col-even)' : '');
        const sDZ = spin.doz === 'D1' ? 'background-color:var(--col-d1)' : (spin.doz === 'D2' ? 'background-color:var(--col-d2); color: #000; text-shadow: none' : (spin.doz === 'D3' ? 'background-color:var(--col-d3); color: #000; text-shadow: none' : ''));
        const sCL = spin.col === 'C1' ? 'background-color:var(--col-c1)' : (spin.col === 'C2' ? 'background-color:var(--col-c2); color: #000; text-shadow: none' : (spin.col === 'C3' ? 'background-color:var(--col-c3); color: #000; text-shadow: none' : ''));
        const visibleBets = (spin.bets || []).filter(bet => this.state.activeFilters[bet.pattern] !== false && this.state.activeFilters[bet.category === 'High/Low' ? 'hl' : (bet.category === 'Odd/Even' ? 'oe' : (bet.category === 'Dozens' ? 'doz' : (bet.category === 'Columns' ? 'col' : 'color')))]);
        const pObj = this.calculatePredictionResult(visibleBets, spin);
        const zTxt = spin.val === 0 ? '<span style="color:var(--zero-green); font-weight:900">ZERO</span>' : '';
        tr.innerHTML = `
            <td class="data-cell w-[8%] text-gray-400 border-white/10 text-xs font-mono">${spin.spinNumber}</td>
            <td class="data-cell w-[10%] ${bgNum} text-lg border-white/20">${spin.val}</td>
            ${this.state.gridSettings.hl ? `<td class="data-cell w-[18%]" style="${sHL}">${zTxt || (spin.hl === 'H' ? (this.isCompactMobile ? 'H' : 'High') : (this.isCompactMobile ? 'L' : 'Low'))}</td>` : ''}
            ${this.state.gridSettings.oe ? `<td class="data-cell w-[18%]" style="${sOE}">${zTxt || (spin.oe === 'Odd' ? (this.isCompactMobile ? 'O' : 'Odd') : (spin.oe === 'Even' ? (this.isCompactMobile ? 'E' : 'Even') : spin.oe))}</td>` : ''}
            ${this.state.gridSettings.doz ? `<td class="data-cell w-[12%]" style="${sDZ}">${zTxt || spin.doz}</td>` : ''}
            ${this.state.gridSettings.col ? `<td class="data-cell w-[12%]" style="${sCL}">${zTxt || spin.col}</td>` : ''}
            <td class="data-cell w-[22%] bg-black/40 border-l border-white/10 font-bold ${pObj.style}" title="${pObj.tooltip}">${pObj.text}</td>`;
        tbody.appendChild(tr);
    }
}