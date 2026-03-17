export default class RouletteUI {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.isCompactMobile = window.matchMedia && window.matchMedia('(max-width: 640px)').matches;
    }

    renderRow(spin, activeFilters, gridSettings) {
        const tbody = document.getElementById('historyBody');
        if (!tbody) return;

        const tr = document.createElement('tr');
        const bgNum = spin.val === 0 ? 'bg-green-600 text-white' : (spin.color === 'R' ? 'bg-red-600 text-white' : 'bg-black text-white');
        const cHL = spin.hl === 'H' ? 'cat-hl-high' : (spin.hl === 'L' ? 'cat-hl-low' : '');
        const cOE = spin.oe === 'Odd' ? 'cat-oe-odd' : (spin.oe === 'Even' ? 'cat-oe-even' : '');
        const cDZ = spin.doz === 'D1' ? 'cat-doz-d1' : (spin.doz === 'D2' ? 'cat-doz-d2' : (spin.doz === 'D3' ? 'cat-doz-d3' : ''));
        const cCL = spin.col === 'C1' ? 'cat-col-c1' : (spin.col === 'C2' ? 'cat-col-c2' : (spin.col === 'C3' ? 'cat-col-c3' : ''));

        const visibleBets = (spin.bets || []).filter(bet => {
            if (activeFilters[bet.pattern] === false) return false;
            if (bet.category === 'Color') return activeFilters.color;
            if (bet.category === 'High/Low') return activeFilters.hl;
            if (bet.category === 'Odd/Even') return activeFilters.oe;
            if (bet.category === 'Dozens') return activeFilters.doz;
            if (bet.category === 'Columns') return activeFilters.col;
            return true;
        });

        const pObj = this.calculatePredictionResult(visibleBets, spin);
        const zTxt = spin.val === 0 ? '<span style="color:var(--zero-green); font-weight:900">ZERO</span>' : '';
        const hlTxt = spin.hl === 'H' ? (this.isCompactMobile ? 'H' : 'High') : (this.isCompactMobile ? 'L' : 'Low');
        const oeTxt = spin.oe === 'Odd' ? (this.isCompactMobile ? 'O' : 'Odd') : (spin.oe === 'Even' ? (this.isCompactMobile ? 'E' : 'Even') : spin.oe);

        tr.innerHTML = `
            <td class="data-cell w-[8%] text-gray-400 border-white/10 text-xs font-mono">${spin.spinNumber}</td>
            <td class="data-cell w-[10%] ${bgNum} text-lg border-white/20">${spin.val}</td>
            ${gridSettings.hl ? `<td class="data-cell w-[18%] ${cHL}">${zTxt || hlTxt}</td>` : ''}
            ${gridSettings.oe ? `<td class="data-cell w-[18%] ${cOE}">${zTxt || oeTxt}</td>` : ''}
            ${gridSettings.doz ? `<td class="data-cell w-[12%] ${cDZ}">${zTxt || spin.doz}</td>` : ''}
            ${gridSettings.col ? `<td class="data-cell w-[12%] ${cCL}">${zTxt || spin.col}</td>` : ''}
            <td class="data-cell w-[22%] bg-black/40 border-l border-white/10 font-bold ${pObj.style}" title="${pObj.tooltip}">${pObj.text}</td>
        `;
        tbody.appendChild(tr);

        const anchor = document.getElementById('scrollAnchor');
        if (anchor) anchor.scrollIntoView({ behavior: 'smooth' });
    }

    renderDashboard(pendingBets, statsMaster, activeFilters, ghostMode, showTrendIcons) {
        const dashboard = document.getElementById('roulette-dashboard');
        if (!dashboard) return;
        
        dashboard.innerHTML = '';
        dashboard.classList.remove('mobile-overflow-hint');
        
        const anyFilterActive = Object.values(activeFilters).some(v => v === true);
        if (!anyFilterActive) {
            dashboard.innerHTML = `<div class="grid-item w-full flex flex-col items-center justify-center text-gray-500 py-2 border border-dashed border-white/10 rounded-xl"><span class="font-mono text-xs uppercase tracking-widest text-red-500"><i class="fas fa-filter-circle-xmark"></i> ALL FILTERS OFF</span></div>`;
            return;
        }

        if (pendingBets.length === 0) {
            const scanLabel = ghostMode ? 'Scanning Patterns (Ghost Mode Active)' : 'Scanning Patterns';
            dashboard.innerHTML = `<div class="grid-item w-full flex flex-col items-center justify-center text-gray-500 py-2 border border-dashed border-white/10 rounded-xl"><span class="font-mono text-xs uppercase tracking-widest text-gray-500">${scanLabel}</span></div>`;
            return;
        }

        dashboard.classList.toggle('mobile-overflow-hint', this.isCompactMobile && pendingBets.length > 1);
        const isDense = pendingBets.length > (this.isCompactMobile ? 3 : 4);

        pendingBets.forEach((bet, index) => {
            const div = document.createElement('div');
            const bgClass = bet.confirmed ? 'card-confirmed' : '';
            const baseClass = `grid-item p-2 pl-2.5 flex flex-col justify-between relative overflow-hidden select-none cursor-pointer`;
            
            div.className = `${baseClass} ${bgClass} ${bet.style}`;
            div.style.flex = isDense ? "1 1 110px" : "1 1 160px";
            div.style.maxWidth = "280px";
            
            div.innerHTML = `
                <div class="w-full flex justify-between items-start relative z-10 gap-1">
                    <div class="flex flex-wrap items-center gap-1 flex-1 overflow-hidden opacity-90">
                        <span class="text-[8px] uppercase font-bold tracking-widest opacity-80 bg-black bg-opacity-40 px-1 rounded truncate max-w-full">${bet.category}</span>
                    </div>
                </div>
                <div class="flex flex-col text-left mt-1 relative z-10 min-w-0">
                    <div class="flex items-center justify-between gap-1 min-w-0">
                        <span class="text-sm font-black leading-none truncate text-white drop-shadow-md">${bet.betName}</span>
                    </div>
                    <div class="flex items-center justify-between mt-0.5 min-w-0">
                        <span class="text-[9px] font-bold text-blue-300 truncate">${bet.pattern}</span>
                    </div>
                </div>
            `;
            dashboard.appendChild(div);
        });
    }

    calculatePredictionResult(bets, currentSpin) {
        if (!bets || bets.length === 0) return { text: '-', style: '', tooltip: '' };

        let hits = 0;
        bets.forEach(bet => {
            if (bet.category === 'Color') { if (currentSpin.color === bet.target) hits++; }
            else if (bet.category === 'High/Low') { if (currentSpin.hl === bet.target) hits++; }
            else if (bet.category === 'Odd/Even') { if ((currentSpin.oe === 'Odd' ? 'O' : (currentSpin.oe === 'Even' ? 'E' : 'Z')) === bet.target) hits++; }
            else if (bet.category === 'Dozens') { if (currentSpin.doz === bet.target) hits++; }
            else if (bet.category === 'Columns') { if (currentSpin.col === bet.target) hits++; }
        });

        const isWin = hits === 1;
        if (bets.length === 1) return { text: bets[0].betName.replace('BET ', ''), style: isWin ? 'text-green-400' : 'text-gray-500', tooltip: '' };
        return { text: `${hits}/${bets.length} HIT`, style: hits === bets.length ? 'text-green-400 font-black' : (hits > 0 ? 'text-orange-400 font-bold' : 'text-gray-500'), tooltip: '' };
    }
}
