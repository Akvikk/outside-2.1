import BankrollManager from '../engine/BankrollManager.js';
import { PATTERN_CONFIG } from '../config.js';

export default class RouletteUI {
    constructor(controller, state) {
        this.controller = controller;
        this.state = state;
        this.isCompactMobile = window.matchMedia && window.matchMedia('(max-width: 640px)').matches;
        this._viewportSyncTimer = null;
        this.bindViewportSync();
    }

    showToast(message, type = 'info') {
        if (window.app && window.app.utils) window.app.utils.showToast(message, type);
    }

    isCompactMobileView() {
        return !!(window.matchMedia && window.matchMedia('(max-width: 640px)').matches);
    }

    compactTokenLabel(value) {
        const raw = String(value || '').trim();
        if (!raw) return raw;
        const map = { RED: 'R', BLACK: 'B', HIGH: 'H', LOW: 'L', ODD: 'O', EVEN: 'E' };
        let compact = raw.toUpperCase();
        Object.entries(map).forEach(([full, short]) => {
            compact = compact.replace(new RegExp(`\\b${full}\\b`, 'g'), short);
        });
        return compact;
    }

    compactCategoryLabel(category) {
        const map = { 'Color': 'CLR', 'High/Low': 'H/L', 'Odd/Even': 'O/E', 'Dozens': 'DOZ', 'Columns': 'COL' };
        return map[category] || category;
    }

    compactPatternLabel(pattern) {
        const map = { 'FLOW': 'FLOW', 'ZIG-ZAG': 'ZZ', 'FALSE BREAK': 'FB', '1-2-3 BUILD': '123', '3-2-1 MIRROR': '321', '1-1-3 BURST': '113', '3-1-1 DOWN': '311', '1-1-2 BUILD': '112' };
        return map[pattern] || pattern;
    }

    syncCompactGridHeaders() {
        const isCompactMobile = this.isCompactMobileView();
        const thHL = document.getElementById('th-hl');
        const thOE = document.getElementById('th-oe');
        const thDoz = document.getElementById('th-doz');
        const thCol = document.getElementById('th-col');
        if (thHL) thHL.textContent = 'H/L';
        if (thOE) thOE.textContent = 'O/E';
        if (thDoz) thDoz.textContent = isCompactMobile ? 'D' : 'DOZ';
        if (thCol) thCol.textContent = isCompactMobile ? 'C' : 'COL';
    }

    bindViewportSync() {
        const onViewportChange = () => {
            clearTimeout(this._viewportSyncTimer);
            this._viewportSyncTimer = setTimeout(() => {
                this.syncCompactGridHeaders();
                this.controller.reRenderHistory();
                this.renderDashboard();
            }, 120);
        };
        window.addEventListener('resize', onViewportChange, { passive: true });
        window.addEventListener('orientationchange', onViewportChange, { passive: true });
    }

    calculatePredictionResult(bets, currentSpin) {
        if (!bets || bets.length === 0) return { text: '-', style: '', tooltip: '' };
        const isCompactMobile = this.isCompactMobileView();
        let hits = 0, details = [], netProfit = 0;

        bets.forEach(bet => {
            const isWin = BankrollManager.isBetWin(currentSpin, bet.category, bet.target);
            if (isWin) { hits++; netProfit += (bet.category === 'Dozens' || bet.category === 'Columns') ? 2 : 1; } 
            else { netProfit -= 1; }
            details.push(`${bet.betName} (${isWin ? 'WIN' : 'LOSS'})`);
        });

        details.push(`Net Units: ${netProfit > 0 ? '+' : ''}${netProfit}`);
        if (bets.length === 1) {
            const isWin = hits === 1;
            let text = bets[0].betName.replace('BET ', '');
            if (isCompactMobile) text = this.compactTokenLabel(text);
            return { text: text, style: isWin ? 'text-green-400' : 'text-gray-500', tooltip: details.join('\n') };
        }
        let style = 'text-gray-500';
        if (hits === bets.length) style = 'text-green-400 font-black';
        else if (netProfit > 0) style = 'text-yellow-400 font-bold';
        else if (hits > 0) style = 'text-orange-400 font-bold';
        const resultText = isCompactMobile ? `${hits}/${bets.length}` : `${hits}/${bets.length} HIT`;
        return { text: resultText, style: style, tooltip: details.join('\n') };
    }

    updateFilterEfficiencies() {
        const cats = { 'Color': { w: 0, t: 0 }, 'High/Low': { w: 0, t: 0 }, 'Odd/Even': { w: 0, t: 0 }, 'Dozens': { w: 0, t: 0 }, 'Columns': { w: 0, t: 0 } };
        const pats = {};
        const categoryFilterMap = { 'Color': 'color', 'High/Low': 'hl', 'Odd/Even': 'oe', 'Dozens': 'doz', 'Columns': 'col' };
        PATTERN_CONFIG.forEach(p => pats[p.key] = { w: 0, t: 0 });

        this.state.history.forEach(spin => {
            if (!spin.bets) return;
            spin.bets.forEach(bet => {
                const isWin = BankrollManager.isBetWin(spin, bet.category, bet.target);
                if (cats[bet.category]) { cats[bet.category].t++; if (isWin) cats[bet.category].w++; }
                const categoryFilterKey = categoryFilterMap[bet.category] || bet.category;
                const isCategoryActive = this.state.activeFilters[bet.category] === true || this.state.activeFilters[categoryFilterKey] === true;
                if (pats[bet.pattern] && isCategoryActive) { pats[bet.pattern].t++; if (isWin) pats[bet.pattern].w++; }
            });
        });

        const update = (key, id, source) => {
            const el = document.getElementById(id);
            if (!el) return;
            const d = source[key];
            const rate = d.t === 0 ? 0 : Math.round((d.w / d.t) * 100);
            el.innerText = ` [${rate}%]`;
            el.className = d.t === 0 ? "text-[10px] ml-1 text-gray-600" : (rate >= 50 ? "text-[10px] ml-1 text-green-400 font-bold" : "text-[10px] ml-1 text-red-400 font-bold");
        };
        ['Color', 'High/Low', 'Odd/Even', 'Dozens', 'Columns'].forEach(cat => update(cat, `lbl-filter-${categoryFilterMap[cat] || cat.toLowerCase()}`, cats));
        PATTERN_CONFIG.forEach(p => update(p.key, `lbl-filter-${p.key}`, pats));
    }

    renderRow(spin) {
        const tbody = document.getElementById('historyBody');
        if (!tbody) return;
        const tr = document.createElement('tr');
        const isCompactMobile = this.isCompactMobileView();
        const bgNum = spin.val === 0 ? 'bg-green-600 text-white' : (spin.color === 'R' ? 'bg-red-600 text-white' : 'bg-black text-white');
        const sHL = spin.hl === 'H' ? 'background-color:var(--col-high)' : (spin.hl === 'L' ? 'background-color:var(--col-low)' : '');
        const sOE = spin.oe === 'Odd' ? 'background-color:var(--col-odd)' : (spin.oe === 'Even' ? 'background-color:var(--col-even)' : '');
        const sDZ = spin.doz === 'D1' ? 'background-color:var(--col-d1)' : (spin.doz === 'D2' ? 'background-color:var(--col-d2); color: #000; text-shadow: none' : (spin.doz === 'D3' ? 'background-color:var(--col-d3); color: #000; text-shadow: none' : ''));
        const sCL = spin.col === 'C1' ? 'background-color:var(--col-c1)' : (spin.col === 'C2' ? 'background-color:var(--col-c2); color: #000; text-shadow: none' : (spin.col === 'C3' ? 'background-color:var(--col-c3); color: #000; text-shadow: none' : ''));

        const visibleBets = (spin.bets || []).filter(bet => {
            if (this.state.activeFilters[bet.pattern] === false) return false;
            if (bet.category === 'Color') return this.state.activeFilters.color;
            if (bet.category === 'High/Low') return this.state.activeFilters.hl;
            if (bet.category === 'Odd/Even') return this.state.activeFilters.oe;
            if (bet.category === 'Dozens') return this.state.activeFilters.doz;
            if (bet.category === 'Columns') return this.state.activeFilters.col;
            return true;
        });

        const pObj = this.calculatePredictionResult(visibleBets, spin);
        const zTxt = spin.val === 0 ? '<span style="color:var(--zero-green); font-weight:900">ZERO</span>' : '';
        const hlTxt = spin.hl === 'H' ? (isCompactMobile ? 'H' : 'High') : (isCompactMobile ? 'L' : 'Low');
        const oeTxt = spin.oe === 'Odd' ? (isCompactMobile ? 'O' : 'Odd') : (spin.oe === 'Even' ? (isCompactMobile ? 'E' : 'Even') : spin.oe);

        tr.innerHTML = `
            <td class="data-cell w-[8%] text-gray-400 border-white/10 text-xs font-mono">${spin.spinNumber}</td>
            <td class="data-cell w-[10%] ${bgNum} text-lg border-white/20">${spin.val}</td>
            ${this.state.gridSettings.hl ? `<td class="data-cell w-[18%]" style="${sHL}">${zTxt || hlTxt}</td>` : ''}
            ${this.state.gridSettings.oe ? `<td class="data-cell w-[18%]" style="${sOE}">${zTxt || oeTxt}</td>` : ''}
            ${this.state.gridSettings.doz ? `<td class="data-cell w-[12%]" style="${sDZ}">${zTxt || spin.doz}</td>` : ''}
            ${this.state.gridSettings.col ? `<td class="data-cell w-[12%]" style="${sCL}">${zTxt || spin.col}</td>` : ''}
            <td class="data-cell w-[22%] bg-black/40 border-l border-white/10 font-bold ${pObj.style}" title="${pObj.tooltip}">${pObj.text}</td>
        `;
        tbody.appendChild(tr);
    }

    renderDashboard() {
        const dashboard = document.getElementById('roulette-dashboard');
        if (!dashboard) return;
        const isCompactMobile = this.isCompactMobileView();
        const categoryFilterMap = { 'Color': 'color', 'High/Low': 'hl', 'Odd/Even': 'oe', 'Dozens': 'doz', 'Columns': 'col' };
        
        dashboard.innerHTML = '';
        dashboard.classList.remove('mobile-overflow-hint');
        this.updateFilterEfficiencies();

        if (!Object.values(this.state.activeFilters).some(v => v === true)) {
            dashboard.innerHTML = `<div class="grid-item w-full flex flex-col items-center justify-center text-gray-500 py-2 border border-dashed border-white/10 rounded-xl"><span class="font-mono text-xs uppercase tracking-widest text-red-500"><i class="fas fa-filter-circle-xmark"></i> ALL FILTERS OFF</span></div>`;
            return;
        }
        if (this.state.pendingBets.length === 0) {
            const scanLabel = this.state.ghostMode ? 'Scanning Patterns (Ghost Mode Active)' : 'Scanning Patterns';
            dashboard.innerHTML = `<div class="grid-item w-full flex flex-col items-center justify-center text-gray-500 py-2 border border-dashed border-white/10 rounded-xl"><span class="font-mono text-xs uppercase tracking-widest text-gray-500">${scanLabel}</span></div>`;
            return;
        }

        dashboard.classList.toggle('mobile-overflow-hint', isCompactMobile && this.state.pendingBets.length > 1);
        dashboard.setAttribute('data-card-count', String(this.state.pendingBets.length));

        const patStats = {};
        this.state.history.forEach(spin => {
            if (!spin.bets) return;
            spin.bets.forEach(bet => {
                const categoryFilterKey = categoryFilterMap[bet.category] || bet.category;
                if (!(this.state.activeFilters[bet.category] === true || this.state.activeFilters[categoryFilterKey] === true)) return;
                if (!patStats[bet.pattern]) patStats[bet.pattern] = { w: 0, l: 0 };
                if (BankrollManager.isBetWin(spin, bet.category, bet.target)) patStats[bet.pattern].w++;
                else patStats[bet.pattern].l++;
            });
        });

        this.state.pendingBets.sort((a, b) => {
            const getRate = (bet) => {
                const cStat = this.state.engineStatsMaster.categoryStats ? this.state.engineStatsMaster.categoryStats[bet.category] : null;
                return (cStat && (cStat.w + cStat.l > 0)) ? Math.round((cStat.w / (cStat.w + cStat.l)) * 100) : 0;
            };
            const diff = getRate(b) - getRate(a);
            return diff !== 0 ? diff : (a.id - b.id);
        });

        let maxRate = -1, minRate = 101;
        Object.keys(patStats).forEach(key => {
            const s = patStats[key], total = s.w + s.l;
            if (total > 0) {
                const rate = Math.round((s.w / total) * 100);
                if (rate > maxRate) maxRate = rate; if (rate < minRate) minRate = rate;
            }
        });

        const isDense = this.state.pendingBets.length > (isCompactMobile ? 3 : 4);
        const confidenceMap = {};
        this.state.pendingBets.forEach(b => { confidenceMap[b.category + b.target] = (confidenceMap[b.category + b.target] || 0) + 1; });

        this.state.pendingBets.forEach((bet, index) => {
            const div = document.createElement('div');
            let efficiencyClass = '', badgeHtml = '';
            const pStat = patStats[bet.pattern];
            let patRate = (pStat && (pStat.w + pStat.l > 0)) ? Math.round((pStat.w / (pStat.w + pStat.l)) * 100) : 0;
            
            if (maxRate !== minRate && patRate > 0) {
                if (patRate === maxRate) { efficiencyClass = 'card-best'; badgeHtml = isCompactMobile ? '<span class="badge-hot">HOT</span>' : '<span class="badge-hot">🔥 HOT</span>'; }
                else if (patRate === minRate) { efficiencyClass = 'card-worst'; badgeHtml = isCompactMobile ? '<span class="badge-cold">COLD</span>' : '<span class="badge-cold">❄️ COLD</span>'; }
            }

            const cStat = this.state.engineStatsMaster.categoryStats ? this.state.engineStatsMaster.categoryStats[bet.category] : null;
            let catRate = (cStat && (cStat.w + cStat.l > 0)) ? Math.round((cStat.w / (cStat.w + cStat.l)) * 100) : 0;

            let trendHtml = '';
            if (this.state.showTrendIcons) {
                let recentWins = 0, recentOps = 0;
                for (let i = this.state.history.length - 1; i >= 0 && recentOps < 10; i--) {
                    const hSpin = this.state.history[i];
                    if (!hSpin.bets) continue;
                    hSpin.bets.filter(b => b.category === bet.category).forEach(b => {
                        if (recentOps >= 10) return;
                        if (BankrollManager.isBetWin(hSpin, b.category, b.target)) recentWins++;
                        recentOps++;
                    });
                }
                if (recentOps > 0) {
                    const diff = Math.round((recentWins / recentOps) * 100) - catRate;
                    if (diff >= 5) trendHtml = `<span class="ml-1.5 inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-green-900/60 border border-green-500/50" title="Trending Up (+${diff}%)"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg></span>`;
                    else if (diff <= -5) trendHtml = `<span class="ml-1.5 inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-red-900/60 border border-red-500/50" title="Trending Down (${diff}%)"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg></span>`;
                    else trendHtml = `<span class="ml-1.5 inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-gray-800 border border-gray-600/50" title="Stable"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg></span>`;
                }
            }

            if (confidenceMap[bet.category + bet.target] > 1) {
                efficiencyClass = 'card-confidence';
                badgeHtml += isCompactMobile ? '<span class="badge-gold">CONF</span>' : '<span class="badge-gold">★ HIGH CONFIDENCE</span>';
            }

            const bgClass = bet.confirmed ? 'card-confirmed' : '';
            const baseClass = `grid-item p-2 pl-2.5 flex flex-col justify-between relative overflow-hidden select-none cursor-pointer`;
            div.className = `${baseClass} ${bgClass} ${bet.style} ${efficiencyClass}`;
            if (isCompactMobile) {
                div.style.flex = isDense ? "1 1 126px" : "1 1 142px"; div.style.maxWidth = isDense ? "164px" : "182px";
            } else {
                div.style.flex = isDense ? "1 1 110px" : "1 1 160px"; div.style.maxWidth = "280px";
            }
            div.setAttribute('ondblclick', `app.roulette.toggleBetConfirmation(${index})`);

            const titleSize = isCompactMobile ? (isDense ? 'text-base' : 'text-lg') : (isDense ? 'text-sm' : 'text-lg');
            const subSize = isCompactMobile ? 'text-[9px]' : (isDense ? 'text-[9px]' : 'text-[10px]');
            const tagSize = isCompactMobile ? 'text-[8px]' : (isDense ? 'text-[7px]' : 'text-[8px]');
            const patSize = isCompactMobile ? 'text-[8px]' : (isDense ? 'text-[8px]' : 'text-[9px]');
            const scaleBadge = !isCompactMobile && isDense ? 'transform: scale(0.85); transform-origin: left center;' : '';
            const scaleCheckbox = !isCompactMobile && isDense ? 'transform: scale(0.8); transform-origin: top right;' : '';

            const categoryLabel = isCompactMobile ? this.compactCategoryLabel(bet.category) : bet.category;
            const betLabel = isCompactMobile ? this.compactTokenLabel(bet.betName.replace('BET ', '')) : bet.betName;
            const patternLabel = isCompactMobile ? this.compactPatternLabel(bet.pattern) : bet.pattern;
            const trendMarkup = (isCompactMobile && isDense) ? '' : trendHtml;

            div.innerHTML = `
                <div class="w-full flex justify-between items-start relative z-10 gap-1">
                    <div class="flex flex-wrap items-center gap-1 flex-1 overflow-hidden opacity-90" style="${scaleBadge}">
                        <span class="${tagSize} uppercase font-bold tracking-widest opacity-80 bg-black bg-opacity-40 px-1 rounded truncate max-w-full">${categoryLabel}</span>
                        ${badgeHtml}
                    </div>
                    <div class="z-20 shrink-0" style="${scaleCheckbox}" title="Confirm Bet to Track">
                        <input type="checkbox" class="bet-checkbox" ${bet.confirmed ? 'checked' : ''} onclick="app.roulette.toggleBetConfirmation(${index})">
                    </div>
                </div>
                <div class="flex flex-col text-left mt-1 relative z-10 min-w-0">
                    <div class="flex items-center justify-between gap-1 min-w-0">
                        <span class="${titleSize} font-black leading-none truncate text-white drop-shadow-md">${betLabel}</span>
                        <span class="${subSize} shrink-0 font-bold text-yellow-300 opacity-90">${catRate}%${trendMarkup}</span>
                    </div>
                    <div class="flex items-center justify-between mt-0.5 min-w-0">
                        <span class="${patSize} font-bold text-blue-300 truncate">${patternLabel}</span>
                        <span class="${patSize} font-mono text-gray-300 shrink-0">${patRate}%</span>
                    </div>
                </div>
            `;
            dashboard.appendChild(div);
        });
    }

    updateAnalyticsUI() {
        let stats = this.state.currentAnalyticsTab === 'master' ? this.state.engineStatsMaster :
                    (this.state.currentAnalyticsTab === '1to1' ? this.state.engineStats1to1 : this.state.engineStats2to1);

        const total = stats.totalWins + stats.totalLosses;
        const rate = total === 0 ? 0 : Math.round((stats.totalWins / total) * 100);
        
        const hrEl = document.getElementById('engHitRate');
        if (hrEl) { hrEl.innerHTML = `${rate}%`; hrEl.className = `text-2xl font-black ${rate >= 50 ? 'text-green-400' : 'text-red-400'}`; }

        const nuEl = document.getElementById('engNetUnits');
        if (nuEl) { nuEl.innerHTML = `${stats.netUnits > 0 ? '+' : ''}${stats.netUnits}`; nuEl.className = `text-2xl font-black ${stats.netUnits > 0 ? 'text-green-400' : (stats.netUnits < 0 ? 'text-red-400' : 'text-white')}`; }

        if (document.getElementById('engTotalBets')) document.getElementById('engTotalBets').innerText = total;
        
        const stEl = document.getElementById('engStreak');
        if (stEl) { stEl.innerHTML = `${stats.currentStreak > 0 ? 'Won ' + stats.currentStreak : (stats.currentStreak < 0 ? 'Lost ' + Math.abs(stats.currentStreak) : '0')}`; stEl.className = `text-2xl font-black ${stats.currentStreak > 0 ? 'text-green-400' : (stats.currentStreak < 0 ? 'text-red-400' : 'text-white')}`; }

        this.drawAdvancedGraph(stats.bankrollHistory, stats.totalWins, stats.totalLosses, 'engineGraphContainer');
    }

    updateActualBetsUI() {
        const total = this.state.userStats.totalBets;
        const rate = total === 0 ? 0 : Math.round((this.state.userStats.totalWins / total) * 100);
        
        const nuEl = document.getElementById('userNetUnits');
        if (nuEl) { nuEl.innerHTML = `${this.state.userStats.netUnits > 0 ? '+' : ''}${this.state.userStats.netUnits}`; nuEl.className = `text-xl font-black ${this.state.userStats.netUnits > 0 ? 'text-green-400' : (this.state.userStats.netUnits < 0 ? 'text-red-400' : 'text-white')}`; }
        if (document.getElementById('userHitRate')) document.getElementById('userHitRate').innerText = `${rate}%`; 
        if (document.getElementById('userTotalBets')) document.getElementById('userTotalBets').innerText = total;

        if (this.state.currentBetsTab === 'trend') this.drawAdvancedGraph(this.state.userStats.bankrollHistory, this.state.userStats.totalWins, this.state.userStats.totalLosses, 'userGraphContainer');
        
        const tbody = document.getElementById('actualBetsBody'); 
        if (tbody) {
            tbody.innerHTML = '';
            if (this.state.confirmedBetLog.length === 0) tbody.innerHTML = '<tr><td colspan="4" class="p-8 text-center text-gray-600 italic">No bets confirmed yet.</td></tr>';
            else this.state.confirmedBetLog.forEach(log => {
                const resColor = log.outcome === 'WIN' ? 'text-green-400' : 'text-red-400';
                tbody.innerHTML += `<tr class="hover:bg-white/5 transition-colors"><td class="p-4 border-b border-white/10 text-gray-500">#${log.betNumber}</td><td class="p-4 border-b border-white/10 text-gray-300"><div class="font-bold">${log.pattern}</div></td><td class="p-4 border-b border-white/10 font-bold text-white text-lg">${log.bet}</td><td class="p-4 border-b border-white/10 text-right"><div class="flex flex-col items-end"><span class="text-xs text-gray-500 mb-1">Spin ${log.resultSpin}</span><span class="font-black ${resColor}">${log.outcome}</span></div></td></tr>`;
            });
        }
    }

    drawAdvancedGraph(historyArray, winCount, lossCount, containerId, lineColor = null) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';
        const width = container.clientWidth;
        const totalHeight = container.clientHeight;

        if (!historyArray || historyArray.length < 2 || width === 0) {
            container.innerHTML = `<div class="w-full h-full flex flex-col items-center justify-center text-gray-500 space-y-2 select-none"><i class="fas fa-chart-line text-2xl opacity-50"></i><span class="text-[10px] font-bold uppercase tracking-widest opacity-70">Waiting for Data...</span></div>`;
            return;
        }

        const cumWins = [0], cumLoss = [0];
        for (let i = 1; i < historyArray.length; i++) {
            const isWin = historyArray[i] > historyArray[i - 1];
            const isLoss = historyArray[i] < historyArray[i - 1];
            cumWins.push(cumWins[i - 1] + (isWin ? 1 : 0));
            cumLoss.push(cumLoss[i - 1] + (isLoss ? 1 : 0));
        }

        const chartHeight = totalHeight * 0.8, hudHeight = totalHeight * 0.2, padding = 10;
        let maxVal = Math.max(...historyArray), minVal = Math.min(...historyArray);
        if (maxVal === minVal) { maxVal++; minVal--; }
        const range = maxVal - minVal;

        window.graphData = window.graphData || {};
        window.graphData[containerId] = { history: historyArray, cumWins, cumLoss, totalWins: winCount, totalLosses: lossCount, totalSpins: historyArray.length - 1, lineColor, padding, min: minVal, range };

        const gridColor = 'rgba(255,255,255,0.1)', textColor = '#888', strokeWidth = 4, colorWin = '#30D158', colorLoss = '#FF453A';
        const getX = (i) => (i / (historyArray.length - 1)) * (width - 2 * padding) + padding;
        const getY = (val) => chartHeight - padding - ((val - minVal) / range) * (chartHeight - 2 * padding);
        const showZeroLine = (minVal <= 0 && maxVal >= 0);

        let step = 1;
        if (range > 10) step = 5; if (range > 25) step = 10; if (range > 50) step = 20; if (range > 100) step = 50; if (range > 250) step = 100;
        let gridSvg = '';
        for (let v = Math.ceil(minVal / step) * step; v <= maxVal; v += step) {
            if (v === 0 && showZeroLine) continue;
            const y = getY(v);
            if (y >= padding && y <= chartHeight - padding) {
                gridSvg += `<line x1="${padding}" y1="${y}" x2="${width - padding}" y2="${y}" stroke="${gridColor}" stroke-width="1" stroke-dasharray="2" />`;
                gridSvg += `<text x="${padding}" y="${y - 2}" fill="${textColor}" font-size="9" font-family="monospace">${v > 0 ? '+' : ''}${v}</text>`;
            }
        }

        let pathD = `M ${getX(0)} ${getY(historyArray[0])}`;
        for (let i = 1; i < historyArray.length; i++) pathD += ` L ${getX(i)} ${getY(historyArray[i])}`;

        const zeroY = getY(0);
        const clampedZeroY = Math.min(Math.max(zeroY, padding), chartHeight - padding);
        const areaPathD = pathD + ` L ${getX(historyArray.length - 1)} ${clampedZeroY} L ${getX(0)} ${clampedZeroY} Z`;
        const zeroPercent = Math.max(0, Math.min(100, (maxVal / range) * 100));
        const gradId = `grad_${containerId}_${Date.now()}`, areaGradId = `area_${containerId}_${Date.now()}`, glowFilterId = `glow_${containerId}_${Date.now()}`;
        let strokeUrl = lineColor || `url(#${gradId})`;
        const lastVal = historyArray[historyArray.length - 1];
        const endMarker = `<circle cx="${getX(historyArray.length - 1)}" cy="${getY(lastVal)}" r="6" fill="${lastVal >= 0 ? colorWin : colorLoss}" stroke="#000" stroke-width="2" />`;

        const svg = `
            <svg width="100%" height="${chartHeight}px" style="display:block; overflow:visible; cursor:crosshair; touch-action: none;" onmousemove="scrubGraph(event, '${containerId}')" ontouchmove="scrubGraph(event, '${containerId}')" onmouseleave="resetGraph('${containerId}')" ontouchend="resetGraph('${containerId}')" ontouchcancel="resetGraph('${containerId}')">
                <defs>
                    <filter id="${glowFilterId}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                    <linearGradient id="${gradId}" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="${colorWin}" /><stop offset="${zeroPercent}%" stop-color="${colorWin}" /><stop offset="${zeroPercent}%" stop-color="${colorLoss}" /><stop offset="100%" stop-color="${colorLoss}" /></linearGradient>
                    <linearGradient id="${areaGradId}" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="${colorWin}" stop-opacity="0.25" /><stop offset="${zeroPercent}%" stop-color="${colorWin}" stop-opacity="0" /><stop offset="${zeroPercent}%" stop-color="${colorLoss}" stop-opacity="0" /><stop offset="100%" stop-color="${colorLoss}" stop-opacity="0.25" /></linearGradient>
                </defs>
                <path d="${areaPathD}" fill="url(#${areaGradId})" stroke="none" />
                ${gridSvg}
                ${showZeroLine ? `<line x1="${padding}" y1="${zeroY}" x2="${width - padding}" y2="${zeroY}" stroke="${gridColor}" stroke-width="1" stroke-dasharray="4" /><line x1="${padding}" y1="${zeroY}" x2="${width - padding}" y2="${zeroY}" stroke="rgba(255,255,255,0.3)" stroke-width="2" stroke-dasharray="6 6" />` : ''}
                <path d="${pathD}" fill="none" stroke="${strokeUrl}" stroke-width="${strokeWidth}" stroke-linejoin="round" stroke-linecap="round" filter="url(#${glowFilterId})" vector-effect="non-scaling-stroke" />
                ${endMarker}
                <line id="scrubberLine_${containerId}" x1="0" y1="0" x2="0" y2="${chartHeight}" stroke="white" stroke-width="1" stroke-opacity="0.5" style="opacity:0; pointer-events:none;" vector-effect="non-scaling-stroke" />
                <circle id="scrubberDot_${containerId}" cx="0" cy="0" r="6" fill="white" stroke="url(#${gradId})" stroke-width="2" style="opacity:0; pointer-events:none;" />
                <rect x="0" y="0" width="100%" height="100%" fill="transparent" />
            </svg>`;
        const hud = `<div style="height:${hudHeight}px" class="w-full bg-black/20 border-t border-white/10 flex items-center justify-between px-4 rounded-b-xl"><div class="flex flex-col items-center leading-none"><span class="text-[9px] uppercase font-bold text-gray-500 mb-0.5">Wins</span><span id="hud_wins_${containerId}" class="text-sm font-black text-[#4ade80]">${winCount}</span></div><div class="flex flex-col items-center justify-center bg-white/5 rounded px-3 py-0.5 border border-white/10"><span class="text-[8px] uppercase font-bold text-gray-500">Total Spins</span><span id="hud_spins_${containerId}" class="text-xs font-black text-white">${historyArray.length - 1}</span></div><div class="flex flex-col items-center leading-none"><span class="text-[9px] uppercase font-bold text-gray-500 mb-0.5">Losses</span><span id="hud_loss_${containerId}" class="text-sm font-black text-[#f87171]">${lossCount}</span></div></div>`;
        container.innerHTML = svg + hud;

        const tooltipId = `tooltip_${containerId}`;
        const existingTt = document.getElementById(tooltipId);
        if (existingTt) existingTt.remove();
        const ttDiv = document.createElement('div');
        ttDiv.id = tooltipId;
        ttDiv.className = "fixed bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/10 text-[10px] rounded-xl p-2.5 pointer-events-none shadow-[0_8px_30px_rgba(0,0,0,0.5)] z-[9999] hidden flex flex-col gap-1.5 min-w-[100px] transition-all duration-75 ease-out";
        ttDiv.innerHTML = `<div class="flex justify-between items-center border-b border-white/10 pb-1.5 mb-0.5"><span class="text-gray-400 font-bold uppercase tracking-wider text-[9px]">HAND</span><span id="tt_spin_${containerId}" class="text-white font-mono font-bold text-xs">0</span></div><div class="flex justify-between items-center"><span class="text-gray-400 font-bold uppercase tracking-wider text-[9px]">NET</span><span id="tt_val_${containerId}" class="font-mono font-black text-sm">0</span></div><div id="tt_res_${containerId}" class="text-center font-bold uppercase tracking-widest text-[9px] mt-0.5 py-1 rounded bg-white/5 hidden"></div>`;
        document.body.appendChild(ttDiv);
    }
}