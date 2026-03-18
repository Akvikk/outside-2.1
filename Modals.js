import Simulator from '../../engine/Simulator.js';
import Progression from '../../engine/Progression.js';

export default class Modals {
    constructor(controller, state) { this.controller = controller; this.state = state; }

    renderFilters() {
        const el = document.getElementById('filters-list'); if (!el) return;
        el.innerHTML = '';
        const names = Object.keys(this.state.filters);
        const allChecked = names.every(n => this.state.filters[n]);
        
        let html = `<label class="flex items-center gap-2 p-1.5 hover:bg-white/10 rounded-lg cursor-pointer transition-colors border-b border-white/10 mb-1"><input type="checkbox" ${allChecked ? 'checked' : ''} onchange="app.baccarat.toggleAllPatternFilters(this.checked)" class="filter-checkbox"><span class="text-yellow-500 font-bold text-[10px] uppercase tracking-wider flex-1">SELECT ALL</span></label>`;
        
        names.forEach(name => {
            const stats = this.state.patternStats[name] || { w: 0, l: 0 };
            const wr = (stats.w + stats.l) > 0 ? Math.round((stats.w / (stats.w + stats.l)) * 100) : 0;
            html += `<label class="flex items-center gap-2 p-1.5 hover:bg-gray-800 rounded cursor-pointer transition-colors"><input type="checkbox" ${this.state.filters[name] ? 'checked' : ''} onchange="app.baccarat.togglePatternFilter('${name}', this.checked)" class="filter-checkbox"><span class="text-white font-bold text-[10px] uppercase tracking-wider flex-1">${name} <span class="text-gray-500 ml-1">[${wr}%]</span></span></label>`;
        });
        el.innerHTML = html;
    }

    updateSim() {
        const strategy = document.getElementById('sim-strategy')?.value || 'flat';
        const ignoreTies = document.getElementById('sim-toggle-ties')?.checked || false;
        const res = Simulator.run(this.state, strategy, ignoreTies);
        
        const simTotal = res.simHits + res.simMisses;
        const simHr = simTotal === 0 ? 0 : Math.round((res.simHits / simTotal) * 100);
        const e = (id) => document.getElementById(id);
        if(e('sim-kpi-hr')) { e('sim-kpi-hr').innerText = simHr + "%"; e('sim-kpi-hr').className = `text-2xl font-black ${simHr >= 50 ? 'text-[#30D158]' : (simTotal === 0 ? 'text-white' : 'text-[#FF453A]')}`; }
        if(e('sim-kpi-net')) { e('sim-kpi-net').innerText = (res.simNet > 0 ? '+' : '') + (Number.isInteger(res.simNet) ? res.simNet : res.simNet.toFixed(2)); e('sim-kpi-net').className = `text-2xl font-black ${res.simNet >= 0 ? (res.simNet === 0 ? 'text-white' : 'text-[#30D158]') : 'text-[#FF453A]'}`; }
        if(e('sim-kpi-opps')) e('sim-kpi-opps').innerText = simTotal;
        if(e('sim-kpi-dd')) e('sim-kpi-dd').innerText = (Number.isInteger(res.maxDrawdown) ? res.maxDrawdown : res.maxDrawdown.toFixed(2));
        if(e('sim-hud-w')) e('sim-hud-w').innerText = res.simHits; if(e('sim-hud-h')) e('sim-hud-h').innerText = simTotal; if(e('sim-hud-l')) e('sim-hud-l').innerText = res.simMisses;
        
        if(window.app?.utils?.drawAdvancedGraph) window.app.utils.drawAdvancedGraph(res.simBankroll, res.simHits, res.simMisses, 'sim-graph-container', '#BF5AF2');
        
        const heatBody = document.getElementById('sim-heatmap-body');
        if (heatBody) {
            heatBody.innerHTML = '';
            const entries = Object.entries(res.simStats).sort((a, b) => { const rA = (a[1].w + a[1].l) > 0 ? a[1].w / (a[1].w + a[1].l) : 0; const rB = (b[1].w + b[1].l) > 0 ? b[1].w / (b[1].w + b[1].l) : 0; return rB - rA; });
            entries.forEach(([name, s]) => {
                const tot = s.w + s.l; if (tot === 0) return;
                const wr = Math.round((s.w / tot) * 100);
                heatBody.innerHTML += `<tr class="hover:bg-[#BF5AF2]/10"><td class="p-3 font-bold text-[#E0B0FF]">${name}</td><td class="p-3 text-center text-[#BF5AF2]/60">${tot}</td><td class="p-3 text-center text-[#BF5AF2]">${s.w}</td><td class="p-3 text-right font-black ${wr >= 55 ? 'text-[#BF5AF2]' : (wr <= 45 ? 'text-[#FF453A]' : 'text-[#E0B0FF]')}">${wr}%</td></tr>`;
            });
        }
    }

    renderVault() {
        let actualNet = 0, actualHits = 0, actualLosses = 0, peak = 0, maxDrawdown = 0, bankroll = [0];
        let currentBet = 1, seqIdx = 0, strat = document.getElementById('vault-strategy')?.value || 'flat';
        const ledgerBody = document.getElementById('vault-ledger-body'); if(ledgerBody) ledgerBody.innerHTML = '';

        [...this.state.myBetsHistory].forEach(bet => {
            let isPush = bet.status === 'PUSH', isWin = bet.status === 'WIN';
            let odds = (bet.pred === 'B' && this.state.commissionExact) ? 0.95 : 1;
            let handNet = isPush ? 0 : (isWin ? currentBet * odds : -currentBet);
            
            const nxt = Progression.calculate(isWin, isPush, currentBet, strat, seqIdx);
            let displayBet = currentBet; currentBet = nxt.bet; seqIdx = nxt.seq;
            
            actualNet += handNet; if(isWin) actualHits++; if(bet.status === 'LOSS') actualLosses++; bankroll.push(actualNet);
            if(actualNet > peak) peak = actualNet; if(actualNet - peak < maxDrawdown) maxDrawdown = actualNet - peak;
            
            if (ledgerBody) {
                let nc = handNet > 0 ? 'text-[#30D158]' : (handNet < 0 ? 'text-[#FF453A]' : 'text-white/50');
                let sc = isWin ? 'bg-[#30D158]/20 text-[#30D158] border-[#30D158]/30' : (bet.status==='LOSS'?'bg-[#FF453A]/20 text-[#FF453A] border-[#FF453A]/30':'bg-white/10 text-white/70');
                ledgerBody.insertAdjacentHTML('afterbegin', `<tr class="border-b border-[#FFD60A]/10"><td class="p-3 text-white/50 text-xs">#${bet.handNum}</td><td class="p-3 font-bold text-[#FFD60A] text-[10px]">${bet.pattern}</td><td class="p-3 text-center text-white text-sm">${bet.pred}</td><td class="p-3 text-center"><span class="px-2 py-1 rounded-md text-[9px] font-black border ${sc}">${bet.status}</span></td><td class="p-3 text-right font-black text-sm ${nc}">${handNet>0?'+':''}${Number.isInteger(handNet)?handNet:handNet.toFixed(2)}${strat!=='flat'&&!isPush?`<span class="block text-white/40 text-[7px]">Wager: ${displayBet}U</span>`:''}</td></tr>`);
            }
        });

        const e = (id) => document.getElementById(id);
        const hr = (actualHits + actualLosses) === 0 ? 0 : Math.round((actualHits/(actualHits+actualLosses))*100);
        if(e('vault-kpi-hr')) e('vault-kpi-hr').innerText = hr+"%";
        if(e('vault-kpi-net')) e('vault-kpi-net').innerText = (actualNet>0?'+':'')+(Number.isInteger(actualNet)?actualNet:actualNet.toFixed(2));
        if(e('vault-kpi-opps')) e('vault-kpi-opps').innerText = this.state.myBetsHistory.length;
        if(e('vault-kpi-dd')) e('vault-kpi-dd').innerText = (Number.isInteger(maxDrawdown)?maxDrawdown:maxDrawdown.toFixed(2));
        
        if(window.app?.utils?.drawAdvancedGraph) window.app.utils.drawAdvancedGraph(bankroll, actualHits, actualLosses, 'vault-graph-container', '#30D158');
    }

    renderLogs() {
        const b = document.getElementById('log-ledger-body'); if(!b) return; b.innerHTML = '';
        [...this.state.history].reverse().forEach((h, i) => {
            if (!h.patternList) return;
            h.patternList.forEach(p => {
                let sc = h.val==='T'?'bg-white/10 text-white/70':(p.win?'bg-[#30D158]/20 text-[#30D158]':'bg-[#FF453A]/20 text-[#FF453A]');
                b.innerHTML += `<tr class="border-b border-[#32ADE6]/10"><td class="p-3 text-white/50 text-xs">#${this.state.history.length-i}</td><td class="p-3 font-bold text-[#32ADE6] text-[10px]">${p.name}</td><td class="p-3 text-center ${p.pred==='P'?'text-[#0A84FF]':'text-[#FF453A]'} text-sm">${p.pred}</td><td class="p-3 text-center text-white text-sm">${h.val}</td><td class="p-3 text-right"><span class="px-2 py-1 rounded-md text-[9px] font-black border ${sc}">${h.val==='T'?'PUSH':(p.win?'WIN':'LOSS')}</span></td></tr>`;
            });
        });
    }
}