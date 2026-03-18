import Simulator from '../../engine/Simulator.js';
import Progression from '../../engine/Progression.js';

export default class Modals {
    constructor(controller, state) { this.controller = controller; this.state = state; }

    renderFilters() {
        const el = document.getElementById('dt-filters-list'); if (!el) return;
        el.innerHTML = '';
        const names = Object.keys(this.state.filters);
        const allChecked = names.every(n => this.state.filters[n]);
        
        let html = `<label class="flex items-center gap-2 p-1.5 hover:bg-white/10 rounded-lg cursor-pointer transition-colors border-b border-white/10 mb-1"><input type="checkbox" ${allChecked ? 'checked' : ''} onchange="app.dragontiger.toggleAllPatternFilters(this.checked)" class="filter-checkbox"><span class="text-yellow-500 font-bold text-[10px] uppercase tracking-wider flex-1">SELECT ALL</span></label>`;
        
        names.forEach(name => {
            const stats = this.state.patternStats[name] || { w: 0, l: 0 };
            const wr = (stats.w + stats.l) > 0 ? Math.round((stats.w / (stats.w + stats.l)) * 100) : 0;
            html += `<label class="flex items-center gap-2 p-1.5 hover:bg-gray-800 rounded cursor-pointer transition-colors"><input type="checkbox" ${this.state.filters[name] ? 'checked' : ''} onchange="app.dragontiger.togglePatternFilter('${name}', this.checked)" class="filter-checkbox"><span class="text-white font-bold text-[10px] uppercase tracking-wider flex-1">${name} <span class="text-gray-500 ml-1">[${wr}%]</span></span></label>`;
        });
        el.innerHTML = html;
    }

    updateSim() {
        const strategy = document.getElementById('dt-sim-strategy')?.value || 'flat';
        const ignoreTies = document.getElementById('dt-sim-toggle-ties')?.checked || false;
        const res = Simulator.run(this.state, strategy, ignoreTies);
        
        const simTotal = res.simHits + res.simMisses;
        const simHr = simTotal === 0 ? 0 : Math.round((res.simHits / simTotal) * 100);
        const e = (id) => document.getElementById(id);
        if(e('dt-sim-kpi-hr')) { e('dt-sim-kpi-hr').innerText = simHr + "%"; e('dt-sim-kpi-hr').className = `text-2xl font-black ${simHr >= 50 ? 'text-[#30D158]' : (simTotal === 0 ? 'text-white' : 'text-[#FFD60A]')}`; }
        if(e('dt-sim-kpi-net')) { e('dt-sim-kpi-net').innerText = (res.simNet > 0 ? '+' : '') + (Number.isInteger(res.simNet) ? res.simNet : res.simNet.toFixed(2)); e('dt-sim-kpi-net').className = `text-2xl font-black ${res.simNet >= 0 ? (res.simNet === 0 ? 'text-white' : 'text-[#30D158]') : 'text-[#FFD60A]'}`; }
        if(e('dt-sim-kpi-opps')) e('dt-sim-kpi-opps').innerText = simTotal;
        if(e('dt-sim-kpi-dd')) e('dt-sim-kpi-dd').innerText = (Number.isInteger(res.maxDrawdown) ? res.maxDrawdown : res.maxDrawdown.toFixed(2));
        if(e('dt-sim-hud-w')) e('dt-sim-hud-w').innerText = res.simHits; if(e('dt-sim-hud-h')) e('dt-sim-hud-h').innerText = simTotal; if(e('dt-sim-hud-l')) e('dt-sim-hud-l').innerText = res.simMisses;
        
        if(window.app?.utils?.drawAdvancedGraph) window.app.utils.drawAdvancedGraph(res.simBankroll, res.simHits, res.simMisses, 'dt-sim-graph-container', '#BF5AF2');
        
        const heatBody = document.getElementById('dt-sim-heatmap-body');
        if (heatBody) {
            heatBody.innerHTML = '';
            const entries = Object.entries(res.simStats).sort((a, b) => { const rA = (a[1].w + a[1].l) > 0 ? a[1].w / (a[1].w + a[1].l) : 0; const rB = (b[1].w + b[1].l) > 0 ? b[1].w / (b[1].w + b[1].l) : 0; return rB - rA; });
            entries.forEach(([name, s]) => {
                const tot = s.w + s.l; if (tot === 0) return;
                const wr = Math.round((s.w / tot) * 100);
                heatBody.innerHTML += `<tr class="hover:bg-[#BF5AF2]/10"><td class="p-3 font-bold text-[#E0B0FF]">${name}</td><td class="p-3 text-center text-[#BF5AF2]/60">${tot}</td><td class="p-3 text-center text-[#BF5AF2]">${s.w}</td><td class="p-3 text-right font-black ${wr >= 55 ? 'text-[#BF5AF2]' : (wr <= 45 ? 'text-[#FFD60A]' : 'text-[#E0B0FF]')}">${wr}%</td></tr>`;
            });
        }
    }

    renderVault() {
        let actualNet = 0, actualHits = 0, actualLosses = 0, peak = 0, maxDrawdown = 0, bankroll = [0];
        let currentBet = 1, seqIdx = 0, strat = document.getElementById('dt-vault-strategy')?.value || 'flat';
        const ledgerBody = document.getElementById('dt-vault-ledger-body') || document.getElementById('vault-ledger-body'); 
        if(ledgerBody) ledgerBody.innerHTML = '';

        [...this.state.myBetsHistory].forEach(bet => {
            const fallbackUnitNet = (bet.status === 'PUSH') ? 0 : (bet.status === 'WIN' ? 1 : -1);
            const unitNet = Number.isFinite(bet.net) ? bet.net : fallbackUnitNet;
            const handNet = currentBet * unitNet;
            const isWin = handNet > 0;
            const isPush = handNet === 0;
            
            const nxt = Progression.calculate(isWin, isPush, currentBet, strat, seqIdx);
            let displayBet = currentBet; currentBet = nxt.bet; seqIdx = nxt.seq;
            
            actualNet += handNet; if(isWin) actualHits++; if(handNet < 0) actualLosses++; bankroll.push(actualNet);
            if(actualNet > peak) peak = actualNet; if(actualNet - peak < maxDrawdown) maxDrawdown = actualNet - peak;
            
            if (ledgerBody) {
                let nc = handNet > 0 ? 'text-[#30D158]' : (handNet < 0 ? 'text-[#FFD60A]' : 'text-white/50');
                let sc = isWin ? 'bg-[#30D158]/20 text-[#30D158] border-[#30D158]/30' : (bet.status==='LOSS'?'bg-[#FFD60A]/20 text-[#FFD60A] border-[#FFD60A]/30':'bg-white/10 text-white/70');
                ledgerBody.insertAdjacentHTML('afterbegin', `<tr class="border-b border-[#FFD60A]/10"><td class="p-3 text-white/50 text-xs">#${bet.handNum}</td><td class="p-3 font-bold text-[#FFD60A] text-[10px]">${bet.pattern}</td><td class="p-3 text-center text-white text-sm">${bet.pred}</td><td class="p-3 text-center"><span class="px-2 py-1 rounded-md text-[9px] font-black border ${sc}">${bet.status}</span></td><td class="p-3 text-right font-black text-sm ${nc}">${handNet>0?'+':''}${Number.isInteger(handNet)?handNet:handNet.toFixed(2)}${strat!=='flat'&&handNet!==0?`<span class="block text-white/40 text-[7px]">Wager: ${displayBet}U</span>`:''}</td></tr>`);
            }
        });

        const e = (id) => document.getElementById(id);
        const hr = (actualHits + actualLosses) === 0 ? 0 : Math.round((actualHits/(actualHits+actualLosses))*100);
        if(e('dt-vault-kpi-hr')) e('dt-vault-kpi-hr').innerText = hr+"%";
        if(e('dt-vault-kpi-net')) e('dt-vault-kpi-net').innerText = (actualNet>0?'+':'')+(Number.isInteger(actualNet)?actualNet:actualNet.toFixed(2));
        if(e('dt-vault-kpi-opps')) e('dt-vault-kpi-opps').innerText = this.state.myBetsHistory.length;
        if(e('dt-vault-kpi-dd')) e('dt-vault-kpi-dd').innerText = (Number.isInteger(maxDrawdown)?maxDrawdown:maxDrawdown.toFixed(2));
        
        if(window.app?.utils?.drawAdvancedGraph) window.app.utils.drawAdvancedGraph(bankroll, actualHits, actualLosses, 'dt-vault-graph-container', '#30D158');
    }

    renderLogs() {
        const b = document.getElementById('dt-log-ledger-body'); if(!b) return; b.innerHTML = '';
        [...this.state.history].reverse().forEach((h, i) => {
            if (!h.patternList) return;
            h.patternList.forEach(p => {
                let statusText = h.val==='X'?'HALF LOSS':(p.win?'WIN':'LOSS');
                let sc = h.val==='X'?'bg-[#FFD60A]/20 text-[#FFD60A]':(p.win?'bg-[#30D158]/20 text-[#30D158]':'bg-[#FFD60A]/20 text-[#FFD60A]');
                b.innerHTML += `<tr class="border-b border-[#32ADE6]/10"><td class="p-3 text-white/50 text-xs">#${this.state.history.length-i}</td><td class="p-3 font-bold text-[#32ADE6] text-[10px]">${p.name}</td><td class="p-3 text-center ${p.pred==='D'?'text-[#FF453A]':'text-[#FFD60A]'} text-sm">${p.pred}</td><td class="p-3 text-center text-white text-sm">${h.val}</td><td class="p-3 text-right"><span class="px-2 py-1 rounded-md text-[9px] font-black border ${sc}">${statusText}</span></td></tr>`;
            });
        });
    }

    renderStats() {
        let totalHits = 0, totalMisses = 0, totalNet = 0;
        let bankroll = [0];

        this.state.history.forEach(h => {
            if (h.patternList && h.patternList.length > 0) {
                h.patternList.forEach(p => {
                    if (p.win) {
                        totalHits++;
                        totalNet += 1;
                    } else if (p.tie) {
                        totalMisses++;
                        totalNet -= 0.5;
                    } else {
                        totalMisses++;
                        totalNet -= 1;
                    }
                });
                bankroll.push(totalNet);
            }
        });

        const totalSignals = totalHits + totalMisses;
        const hitRate = totalSignals === 0 ? 0 : Math.round((totalHits / totalSignals) * 100);

        const e = (id) => document.getElementById(id);
        if(e('dt-kpi-hr')) { e('dt-kpi-hr').innerText = hitRate + "%"; e('dt-kpi-hr').className = `text-4xl font-black ${hitRate >= 50 ? 'text-[#30D158]' : 'text-[#FF453A]'}`; }
        if(e('dt-kpi-signals')) e('dt-kpi-signals').innerText = totalSignals;
        
        const netDisplay = (totalNet > 0 ? '+' : '') + (Number.isInteger(totalNet) ? totalNet : totalNet.toFixed(2));
        if(e('dt-kpi-net')) { e('dt-kpi-net').innerText = netDisplay; e('dt-kpi-net').className = `text-2xl font-black ${totalNet >= 0 ? 'text-[#30D158]' : 'text-[#FF453A]'}`; }

        if(e('dt-hud-w')) e('dt-hud-w').innerText = totalHits;
        if(e('dt-hud-h')) e('dt-hud-h').innerText = totalSignals;
        if(e('dt-hud-l')) e('dt-hud-l').innerText = totalMisses;

        const trendTab = document.getElementById('dt-tab-trend');
        if (trendTab && trendTab.getAttribute('data-active') === 'true') {
            if(window.app?.utils?.drawAdvancedGraph) window.app.utils.drawAdvancedGraph(bankroll, totalHits, totalMisses, 'dt-graph-container', '#30D158', '#FF453A');
        }

        const heatBody = document.getElementById('dt-heatmap-body');
        if (heatBody) {
            heatBody.innerHTML = '';
            const entries = Object.entries(this.state.patternStats);

            if (entries.length === 0) {
                heatBody.innerHTML = '<tr><td colspan="4" class="p-8 text-center text-white/20 italic text-xs uppercase tracking-widest">No data recorded</td></tr>';
            } else {
                entries.sort((a, b) => {
                    const rA = (a[1].w + a[1].l) > 0 ? a[1].w / (a[1].w + a[1].l) : 0;
                    const rB = (b[1].w + b[1].l) > 0 ? b[1].w / (b[1].w + b[1].l) : 0;
                    return rB - rA;
                });

                let htmlBuilder = '';
                entries.forEach(([name, s]) => {
                    const total = s.w + s.l;
                    if (total === 0) return;
                    const wr = Math.round((s.w / total) * 100);
                    const color = wr >= 55 ? 'text-[#30D158]' : (wr <= 45 ? 'text-[#FF453A]' : 'text-[#FFD60A]');

                    htmlBuilder += `
                    <tr class="hover:bg-white/5 transition-colors group">
                        <td class="p-4 font-bold text-gray-200 tracking-wide">${name}</td>
                        <td class="p-4 text-center text-white/60 font-mono text-sm">${total}</td>
                        <td class="p-4 text-center text-[#30D158] font-mono text-sm">${s.w}</td>
                        <td class="p-4 text-right font-black text-sm ${color}">${wr}%</td>
                    </tr>
                `;
                });
                heatBody.innerHTML += htmlBuilder;
            }
        }

        this.renderGoldenStats();
    }

    renderGoldenStats() {
        let goldenNet = 0, goldenHits = 0, goldenLosses = 0;
        let goldenBankroll = [0];
        let peak = 0, maxDrawdown = 0;

        const ledgerBody = document.getElementById('dt-golden-ledger-body');
        if(ledgerBody) {
            ledgerBody.innerHTML = '';

            let htmlBuilder = '';
            [...this.state.goldenBetsHistory].reverse().forEach((bet) => {
                let netColor = bet.net > 0 ? 'text-[#30D158]' : (bet.net < 0 ? 'text-[#FF453A]' : 'text-white/50');
                let netStr = (bet.net > 0 ? '+' : '') + (Number.isInteger(bet.net) ? bet.net : bet.net.toFixed(2));
                let predColor = bet.pred === 'D' ? 'text-[#FF453A]' : 'text-[#FFD60A]';

                htmlBuilder += `
                <tr class="hover:bg-[#FFD60A]/10 transition-colors border-b border-[#FFD60A]/10 last:border-0">
                    <td class="p-3 text-white/50 font-mono text-[10px]">#${bet.handNum}</td>
                    <td class="p-3 font-bold text-[#FFD60A] tracking-wider text-[9px]">${bet.convergence}</td>
                    <td class="p-3 text-center font-black ${predColor} text-sm">${bet.pred}</td>
                    <td class="p-3 text-right font-black text-sm ${netColor}">${netStr}</td>
                </tr>
            `;
            });
            if (htmlBuilder !== '') ledgerBody.innerHTML += htmlBuilder;

            if (this.state.goldenBetsHistory.length === 0) {
                ledgerBody.innerHTML = '<tr><td colspan="4" class="p-8 text-center text-[#FFD60A]/40 italic text-xs uppercase tracking-widest">No Golden Bets found yet</td></tr>';
            }
        }

        this.state.goldenBetsHistory.forEach(bet => {
            goldenNet += bet.net;
            if (bet.status === 'WIN') goldenHits++;
            if (bet.status === 'LOSS') goldenLosses++;
            goldenBankroll.push(goldenNet);

            if (goldenNet > peak) peak = goldenNet;
            let drawdown = goldenNet - peak;
            if (drawdown < maxDrawdown) maxDrawdown = drawdown;
        });

        const totalGolden = goldenHits + goldenLosses;
        const goldenHr = totalGolden === 0 ? 0 : Math.round((goldenHits / totalGolden) * 100);
        
        const e = (id) => document.getElementById(id);
        if(e('dt-golden-kpi-hr')) { e('dt-golden-kpi-hr').innerText = goldenHr + "%"; e('dt-golden-kpi-hr').className = `text-xl font-black ${goldenHr >= 50 ? 'text-[#30D158]' : (totalGolden === 0 ? 'text-white' : 'text-[#FF453A]')}`; }

        const netDisplay = (goldenNet > 0 ? '+' : '') + (Number.isInteger(goldenNet) ? goldenNet : goldenNet.toFixed(2));
        if(e('dt-golden-kpi-net')) { e('dt-golden-kpi-net').innerText = netDisplay; e('dt-golden-kpi-net').className = `text-xl font-black ${goldenNet >= 0 ? (goldenNet === 0 ? 'text-white' : 'text-[#FFD60A]') : 'text-[#FF453A]'}`; }

        if(e('dt-golden-kpi-opps')) e('dt-golden-kpi-opps').innerText = this.state.goldenBetsHistory.length;
        if(e('dt-golden-kpi-dd')) e('dt-golden-kpi-dd').innerText = (Number.isInteger(maxDrawdown) ? maxDrawdown : maxDrawdown.toFixed(2));

        const goldenTab = document.getElementById('dt-tab-golden');
        if (goldenTab && goldenTab.getAttribute('data-active') === 'true') {
            if(window.app?.utils?.drawAdvancedGraph) window.app.utils.drawAdvancedGraph(goldenBankroll, goldenHits, goldenLosses, 'dt-golden-graph-container', '#FFD60A', '#FF453A');
        }
    }
}