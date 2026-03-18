export default class Dashboard {
    constructor(controller, state) { this.controller = controller; this.state = state; }

    renderEmpty(message) {
        const el = document.getElementById('baccarat-dashboard');
        if (el) el.innerHTML = `<div class="scanning-text uppercase font-bold text-xs opacity-60 w-full flex items-center justify-center h-full">${message}</div>`;
    }

    renderCards(cands) {
        const area = document.getElementById('baccarat-dashboard');
        if (!area) return;
        if (cands.length === 0) {
            area.innerHTML = `<div class="scanning-text uppercase font-bold text-xs opacity-40 w-full flex items-center justify-center h-full"><i class="fas fa-eye-slash mr-2"></i> Signal Hidden by Filter</div>`;
            return;
        }
        
        const getWr = (rawName) => {
            if (!rawName) return '--%';
            const names = rawName.split('+').map(s => s.trim());
            let w = 0, l = 0, hasData = false;
            names.forEach(n => { const s = this.state.patternStats[n]; if (s) { w += s.w; l += s.l; hasData = true; } });
            if (!hasData || (w + l) === 0) return '--%';
            return Math.round((w / (w + l)) * 100) + '%';
        };

        let html = '<div class="flex gap-3 overflow-x-auto overscroll-contain px-1 w-full items-center justify-center h-full no-scrollbar min-w-0">';
        cands.forEach(c => {
            const isP = c.pred === 'P';
            const isLocked = this.state.activeLockedBet && this.state.activeLockedBet.pattern === c.rawName && this.state.activeLockedBet.pred === c.pred;
            const wrLabel = getWr(c.rawName);
            
            let baseClass = c.isGolden ? 'pred-card-gold' : (isP ? 'pred-card-p' : 'pred-card-b');
            let tMain = c.isGolden ? 'text-white drop-shadow-[0_0_8px_rgba(0,0,0,0.8)]' : 'text-white';
            let tSub = c.isGolden ? 'text-white/90 drop-shadow-md' : 'text-white/80';
            const title = c.isGolden ? `GOLDEN BET: ${isP?'PLAYER':'BANKER'}` : `BET ${isP?'PLAYER':'BANKER'}`;
            const iClass = isP ? 'fa-user-tie' : 'fa-crown';

            html += `
                <div class="pred-card ${baseClass} ${isLocked ? 'pred-card-locked' : ''} rounded-xl px-4 h-10 flex-1 flex flex-row items-center justify-center gap-3 cursor-pointer select-none max-w-[400px] min-w-[200px] transition-all duration-300" onclick="app.baccarat.handleCardClick('${c.rawName}', '${c.pred}')">
                    ${isLocked ? '<i class="fas fa-check-circle absolute top-1.5 right-1.5 text-[#FFD60A] text-[11px] drop-shadow-md"></i>' : ''}
                    <i class="fas ${iClass} text-lg opacity-90 text-white"></i>
                    <span class="text-xs font-black uppercase tracking-widest leading-none ${isLocked ? 'text-[#FFD60A] drop-shadow-[0_0_8px_rgba(255,214,10,0.8)]' : tMain} whitespace-nowrap">${isLocked ? 'LOCKED ' : ''}${title}</span>
                    <span class="text-[9px] font-bold uppercase tracking-widest leading-none ${isLocked ? 'text-[#FFD60A]/90' : tSub} whitespace-nowrap opacity-70">${c.name} [${wrLabel}]</span>
                </div>
            `;
        });
        html += '</div>';
        area.innerHTML = html;
    }
}