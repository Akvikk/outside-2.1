// =========================================================
// FON OUTSIDE - Core Engine Utilities
// Included by baccarat.js and dragontiger.js to DRY the codebase
// =========================================================

const GameEngineCore = {

    closeMenuOutside(e) {
        const menu = document.getElementById('mainMenuDropdown');
        const btn = document.getElementById('menuBtn');
        const overlay = document.getElementById('menuOverlay');
        if (menu && !menu.classList.contains('hidden') && !menu.contains(e.target) && !btn.contains(e.target)) {
            menu.classList.add('hidden');
            if (overlay) overlay.classList.add('hidden');
        }
    },

    toggleModal(id) {
        const modal = document.getElementById(id);
        if (!modal) return;
        if (modal.classList.contains('hidden')) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            // Play popup sound if applicable
            if (app && app.roulette && app.roulette.soundEnabled) app.roulette.playTone(600, 'sine', 0.1);
            
            // Trigger baccarat/dragontiger data binding to populate contents if opening
            if (typeof this.renderDataBinding === 'function') {
                this.renderDataBinding();
            }
        } else {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            // Play closure sound
            if (app && app.roulette && app.roulette.soundEnabled) app.roulette.playTone(400, 'sine', 0.1);
        }
    },

    switchStatsTab(tabId) {
        document.querySelectorAll('.stat-tab').forEach(t => {
            t.classList.remove('active');
            t.setAttribute('data-active', 'false');
        });
        const activeTab = document.getElementById(`tab-${tabId}`);
        if (activeTab) {
            activeTab.classList.add('active');
            activeTab.setAttribute('data-active', 'true');
        }

        ['kpis', 'trend', 'heatmap', 'golden'].forEach(id => {
            const el = document.getElementById(`sec-${id}`);
            if (!el) return;
            if (id === tabId) { el.classList.remove('hidden'); el.classList.add('flex'); }
            else { el.classList.add('hidden'); el.classList.remove('flex'); }
        });

        // This relies on the implementer having a renderStats method
        if ((tabId === 'trend' || tabId === 'golden') && typeof this.renderStats === 'function') {
            this.renderStats();
        }
    },

    toggleSimConfig() {
        const panel = document.getElementById('sim-config-panel');
        if (!panel) return;
        if (panel.classList.contains('hidden')) {
            panel.classList.remove('hidden');
            panel.classList.add('flex');
        } else {
            panel.classList.add('hidden');
            panel.classList.remove('flex');
        }
    },

    // --- PROGRESSION / MONEY MANAGEMENT ENGINE ---
    calculateProgression(isWin, isPush, currentBet, strategy, seqIndex) {
        if (isPush) return { bet: currentBet, seq: seqIndex };

        let nextBet = 1;
        let nextSeq = 0;

        if (strategy === 'flat') {
            nextBet = 1;
        } else if (strategy === 'martingale') {
            nextBet = isWin ? 1 : currentBet * 2;
            if (nextBet > 512) nextBet = 1; // Safety cap (10 straight losses)
        } else if (strategy === 'paroli') {
            if (isWin) {
                nextBet = currentBet * 2;
                if (nextBet > 4) nextBet = 1; // Max 3 wins (1->2->4->reset)
            } else {
                nextBet = 1;
            }
        } else if (strategy === '1326') {
            const seq = [1, 3, 2, 6];
            if (isWin) {
                nextSeq = seqIndex + 1;
                if (nextSeq > 3) nextSeq = 0;
            } else {
                nextSeq = 0;
            }
            nextBet = seq[nextSeq];
        }

        return { bet: nextBet, seq: nextSeq };
    },

    drawTrendGraph(data, winCount, lossCount, containerId, colorPos, colorNeg, isSim = false, isGolden = false) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';
        const width = container.clientWidth;
        const totalHeight = container.clientHeight;

        if (!data || data.length < 2 || width === 0) {
            container.innerHTML = `
                <div class="w-full h-full flex flex-col items-center justify-center text-gray-500 space-y-2 select-none">
                    <i class="fas fa-chart-line text-2xl opacity-50"></i>
                    <span class="text-[10px] font-bold uppercase tracking-widest opacity-70">Waiting for Data...</span>
                </div>
            `;
            return;
        }

        // Pre-calculate cumulative stats for scrubber optimization
        const cumWins = [0];
        const cumLoss = [0];
        for (let i = 1; i < data.length; i++) {
            const isWin = data[i] > data[i - 1];
            const isLoss = data[i] < data[i - 1];
            cumWins.push(cumWins[i - 1] + (isWin ? 1 : 0));
            cumLoss.push(cumLoss[i - 1] + (isLoss ? 1 : 0));
        }

        const chartHeight = totalHeight * 0.8;
        const hudHeight = totalHeight * 0.2;
        const padding = 10;

        if (!window.graphData) window.graphData = {};
        window.graphData[containerId] = {
            history: data,
            cumWins: cumWins,
            cumLoss: cumLoss,
            totalWins: winCount,
            totalLosses: lossCount,
            totalSpins: data.length - 1,
            lineColor: null,
            padding: padding
        };

        const gridColor = 'rgba(255,255,255,0.1)';
        const textColor = '#888';
        const strokeWidth = 2.5;

        let maxVal = Math.max(...data);
        let minVal = Math.min(...data);
        if (maxVal === minVal) { maxVal++; minVal--; }
        const range = maxVal - minVal;

        window.graphData[containerId].min = minVal;
        window.graphData[containerId].range = range;

        const getX = (i) => (i / (data.length - 1)) * (width - 2 * padding) + padding;
        const getY = (val) => chartHeight - padding - ((val - minVal) / range) * (chartHeight - 2 * padding);

        const showZeroLine = (minVal <= 0 && maxVal >= 0);

        let gridSvg = '';
        let step = 1;
        if (range > 10) step = 5;
        if (range > 25) step = 10;
        if (range > 50) step = 20;
        if (range > 100) step = 50;
        if (range > 250) step = 100;

        for (let v = Math.ceil(minVal / step) * step; v <= maxVal; v += step) {
            if (v === 0 && showZeroLine) continue;
            const y = getY(v);
            if (y >= padding && y <= chartHeight - padding) {
                gridSvg += `<line x1="${padding}" y1="${y}" x2="${width - padding}" y2="${y}" stroke="${gridColor}" stroke-width="1" stroke-dasharray="2" />`;
                gridSvg += `<text x="${padding}" y="${y - 2}" fill="${textColor}" font-size="9" font-family="monospace">${v > 0 ? '+' : ''}${v}</text>`;
            }
        }

        let pathD = `M ${getX(0)} ${getY(data[0])}`;
        for (let i = 1; i < data.length; i++) {
            pathD += ` L ${getX(i)} ${getY(data[i])}`;
        }

        const zeroY = getY(0);
        const clampedZeroY = Math.min(Math.max(zeroY, padding), chartHeight - padding);
        const areaPathD = pathD + ` L ${getX(data.length - 1)} ${clampedZeroY} L ${getX(0)} ${clampedZeroY} Z`;

        const zeroPercent = Math.max(0, Math.min(100, (maxVal / range) * 100));

        const gradId = `grad_${containerId}_${Date.now()}`;
        const areaGradId = `area_${containerId}_${Date.now()}`;
        const glowFilterId = `glow_${containerId}_${Date.now()}`;

        const hudWinsId = `hud_wins_${containerId}`;
        const hudLossesId = `hud_loss_${containerId}`;
        const hudSpinsId = `hud_spins_${containerId}`;
        const tooltipId = `tooltip_${containerId}`;

        const existingTt = document.getElementById(tooltipId);
        if (existingTt) existingTt.remove();

        const lastVal = data[data.length - 1];
        const lastX = getX(data.length - 1);
        const lastY = getY(lastVal);
        const endMarker = `<circle cx="${lastX}" cy="${lastY}" r="4" fill="${lastVal >= 0 ? colorPos : colorNeg}" stroke="#fff" stroke-width="1.5" />`;

        const svg = `
            <svg width="100%" height="${chartHeight}px" style="display:block; overflow:visible; cursor:crosshair; touch-action: none;"
                        onmousemove="scrubGraph(event, '${containerId}')"
                        ontouchmove="scrubGraph(event, '${containerId}')"
                        onmouseleave="resetGraph('${containerId}')"
                        ontouchend="resetGraph('${containerId}')"
                        ontouchcancel="resetGraph('${containerId}')"
                        onpointerup="resetGraph('${containerId}')"
                        onpointercancel="resetGraph('${containerId}')"
                    >
                        <defs>
                            <filter id="${glowFilterId}" x="-50%" y="-50%" width="200%" height="200%">
                                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                                <feMerge>
                                    <feMergeNode in="coloredBlur"/>
                                    <feMergeNode in="SourceGraphic"/>
                                </feMerge>
                            </filter>
                            <linearGradient id="${gradId}" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stop-color="${colorPos}" />
                                <stop offset="${zeroPercent}%" stop-color="${colorPos}" />
                                <stop offset="${zeroPercent}%" stop-color="${colorNeg}" />
                                <stop offset="100%" stop-color="${colorNeg}" />
                            </linearGradient>
                            <linearGradient id="${areaGradId}" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stop-color="${colorPos}" stop-opacity="0.2" />
                                <stop offset="${zeroPercent}%" stop-color="${colorPos}" stop-opacity="0.05" />
                                <stop offset="${zeroPercent}%" stop-color="${colorNeg}" stop-opacity="0.05" />
                                <stop offset="100%" stop-color="${colorNeg}" stop-opacity="0.2" />
                            </linearGradient>
                        </defs>
                        
                        <path d="${areaPathD}" fill="url(#${areaGradId})" stroke="none" />
                        ${gridSvg}
                        ${showZeroLine ? `<line x1="${padding}" y1="${zeroY}" x2="${width - padding}" y2="${zeroY}" stroke="${gridColor}" stroke-width="1" stroke-dasharray="4" />` : ''}
                        
                        <path d="${pathD}" fill="none" stroke="url(#${gradId})" stroke-width="${strokeWidth}" stroke-linejoin="round" stroke-linecap="round" filter="url(#${glowFilterId})" vector-effect="non-scaling-stroke" />
                        ${endMarker}
                        
                        <line id="scrubberLine_${containerId}" x1="0" y1="0" x2="0" y2="${chartHeight}" stroke="white" stroke-width="1" stroke-opacity="0.2" style="opacity:0; pointer-events:none;" />
                        <circle id="scrubberDot_${containerId}" cx="0" cy="0" r="4" fill="white" stroke="url(#${gradId})" stroke-width="2" style="opacity:0; pointer-events:none;" />
                        
                        <rect x="0" y="0" width="100%" height="100%" fill="transparent" />
                    </svg>
                `;

        const hud = `
            <div style="height:${hudHeight}px" class="w-full bg-black/20 border-t border-white/10 flex items-center justify-between px-4 rounded-b-xl">
                <div class="flex flex-col items-center leading-none">
                    <span class="text-[9px] uppercase font-bold text-gray-500 mb-0.5">Wins</span>
                    <span id="${hudWinsId}" class="text-sm font-black" style="color:${colorPos}">${winCount}</span>
                </div>
                <div class="flex flex-col items-center justify-center bg-white/5 rounded px-3 py-0.5 border border-white/10">
                    <span class="text-[8px] uppercase font-bold text-gray-500">Total Spins</span>
                    <span id="${hudSpinsId}" class="text-xs font-black text-white">${data.length - 1}</span> 
                </div>
                <div class="flex flex-col items-center leading-none">
                    <span class="text-[9px] uppercase font-bold text-gray-500 mb-0.5">Losses</span>
                    <span id="${hudLossesId}" class="text-sm font-black" style="color:${colorNeg}">${lossCount}</span>
                </div>
            </div>
        `;

        container.innerHTML = svg + hud;

        const ttDiv = document.createElement('div');
        ttDiv.id = tooltipId;
        ttDiv.className = "fixed bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/10 text-[10px] rounded-xl p-2.5 pointer-events-none shadow-[0_8px_30px_rgba(0,0,0,0.5)] z-[9999] hidden flex flex-col gap-1.5 min-w-[100px] transition-all duration-75 ease-out";
        ttDiv.innerHTML = `
            <div class="flex justify-between items-center border-b border-white/10 pb-1.5 mb-0.5">
                <span class="text-gray-400 font-bold uppercase tracking-wider text-[9px]">HAND</span>
                <span id="tt_spin_${containerId}" class="text-white font-mono font-bold text-xs">0</span>
            </div>
            <div class="flex justify-between items-center">
                <span class="text-gray-400 font-bold uppercase tracking-wider text-[9px]">NET</span>
                <span id="tt_val_${containerId}" class="font-mono font-black text-sm">0</span>
            </div>
            <div id="tt_res_${containerId}" class="text-center font-bold uppercase tracking-widest text-[9px] mt-0.5 py-1 rounded bg-white/5 hidden"></div>
        `;
        document.body.appendChild(ttDiv);
    }
};
