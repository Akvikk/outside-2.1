export default class TrendGraph {
    static _bindGlobalListeners() {
        if (window.__graphTooltipGlobalListenersBound) return;
        
        window.scrubGraph = (event, containerId) => {
            const data = window.graphData && window.graphData[containerId];
            if (!data || !data.history || data.history.length < 2) return;
            
            if (window.activeGraphContainerId && window.activeGraphContainerId !== containerId) {
                window.resetGraph(window.activeGraphContainerId);
            }
            window.activeGraphContainerId = containerId;

            const svg = event.currentTarget || event.target;
            if (!svg || !svg.getBoundingClientRect) return;

            const rect = svg.getBoundingClientRect();
            const clientX = event.touches && event.touches[0] ? event.touches[0].clientX : event.clientX;
            if (typeof clientX !== 'number') return;

            if (window.scrubRafId) cancelAnimationFrame(window.scrubRafId);
            window.scrubRafId = requestAnimationFrame(() => {
                const padding = data.padding || 10;
                const width = rect.width;
                const relX = clientX - rect.left;

                let idx;
                if (relX <= padding) idx = 0;
                else if (relX >= width - padding) idx = data.history.length - 1;
                else {
                    const ratio = (relX - padding) / (width - 2 * padding);
                    idx = Math.round(ratio * (data.history.length - 1));
                }
                idx = Math.max(0, Math.min(data.history.length - 1, idx));

                const pt = data.points[idx];
                const val = data.history[idx];
                
                const lineGrp = document.getElementById(`scrubLineGroup_${containerId}`);
                const dotGrp = document.getElementById(`scrubDotGroup_${containerId}`);
                const tt = document.getElementById(`tooltip_${containerId}`);
                
                if (lineGrp) {
                    lineGrp.style.transform = `translateX(${pt.x}px)`;
                    lineGrp.style.opacity = '1';
                }
                if (dotGrp) {
                    dotGrp.style.transform = `translate(${pt.x}px, ${pt.y}px)`;
                    dotGrp.style.opacity = '1';
                    const color = val > 0 ? data.colorPos : (val < 0 ? data.colorNeg : '#ffffff');
                    const dotCore = dotGrp.querySelector('.dot-core');
                    const dotGlow = dotGrp.querySelector('.dot-glow');
                    if (dotCore) dotCore.setAttribute('stroke', color);
                    if (dotGlow) dotGlow.setAttribute('fill', color);
                }
                
                if (tt) {
                    const fixedX = rect.left + pt.x;
                    const fixedY = rect.top + pt.y;
                    let top = fixedY - 90;
                    if (top < 70) top = fixedY + 30;
                    top = Math.max(20, Math.min(top, window.innerHeight - 100));
                    const left = Math.max(70, Math.min(fixedX, window.innerWidth - 70));

                    tt.style.left = `${left}px`; tt.style.top = `${top}px`;
                    tt.style.transform = 'translate(-50%, 0)'; tt.classList.remove('hidden');
                    
                    document.getElementById(`tt_spin_${containerId}`).textContent = String(idx);
                    const vEl = document.getElementById(`tt_val_${containerId}`);
                    vEl.textContent = `${val > 0 ? '+' : ''}${parseFloat(val.toFixed(2))}`;
                    vEl.className = `font-mono font-black text-lg drop-shadow-md ${val > 0 ? 'text-[#30D158]' : (val < 0 ? 'text-[#FF453A]' : 'text-white')}`;
                }
            });
        };

        window.resetGraph = (containerId) => {
            if (!containerId) return;
            const line = document.getElementById(`scrubLineGroup_${containerId}`);
            const dot = document.getElementById(`scrubDotGroup_${containerId}`);
            const tt = document.getElementById(`tooltip_${containerId}`);
            if (line) line.style.opacity = '0';
            if (dot) dot.style.opacity = '0';
            if (tt) tt.classList.add('hidden');
            if (window.activeGraphContainerId === containerId) window.activeGraphContainerId = null;
        };

        const hideAll = () => { if (window.graphData) Object.keys(window.graphData).forEach(id => window.resetGraph(id)); };
        document.addEventListener('touchend', hideAll, { passive: true });
        document.addEventListener('scroll', hideAll, true);
        window.addEventListener('resize', hideAll, { passive: true });
        window.__graphTooltipGlobalListenersBound = true;
    }

    static drawAdvancedGraph(historyArray, winCount, lossCount, containerId, colorPos = '#30D158', colorNeg = '#FF453A') {
        this._bindGlobalListeners();
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';
        const width = container.clientWidth; const totalHeight = container.clientHeight;

        if (!historyArray || historyArray.length < 2 || width === 0) {
            container.innerHTML = `<div class="w-full h-full flex flex-col items-center justify-center text-gray-500 space-y-3 select-none bg-black/20 rounded-2xl">
                <div class="relative">
                    <i class="fas fa-chart-line text-3xl opacity-40"></i>
                    <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                </div>
                <span class="text-[10px] font-black uppercase tracking-widest opacity-60">Awaiting Signal Data...</span>
            </div>`;
            return;
        }
        
        const chartHeight = totalHeight * 0.75, hudHeight = totalHeight * 0.25, padding = 15;
        let maxVal = Math.max(...historyArray), minVal = Math.min(...historyArray);
        if (maxVal === minVal) { maxVal++; minVal--; }
        const range = maxVal - minVal;
        
        const points = historyArray.map((val, i) => ({
            x: (i / (historyArray.length - 1)) * (width - 2 * padding) + padding,
            y: chartHeight - padding - ((val - minVal) / range) * (chartHeight - 2 * padding)
        }));
        
        window.graphData = window.graphData || {};
        window.graphData[containerId] = { history: historyArray, padding, min: minVal, range, points, colorPos, colorNeg };

        // Smooth Catmull-Rom to Cubic Bezier path generation
        let pathD = `M ${points[0].x} ${points[0].y}`;
        for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[Math.max(0, i - 1)], p1 = points[i], p2 = points[i + 1], p3 = points[Math.min(points.length - 1, i + 2)];
            const t = 0.15; // Smoothing tension
            const cp1x = p1.x + (p2.x - p0.x) * t, cp1y = p1.y + (p2.y - p0.y) * t;
            const cp2x = p2.x - (p3.x - p1.x) * t, cp2y = p2.y - (p3.y - p1.y) * t;
            pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
        }

        const zeroY = chartHeight - padding - ((0 - minVal) / range) * (chartHeight - 2 * padding);
        const clampedZeroY = Math.min(Math.max(zeroY, padding), chartHeight - padding);
        const areaPathD = pathD + ` L ${points[points.length - 1].x} ${clampedZeroY} L ${points[0].x} ${clampedZeroY} Z`;
        const zeroPercent = Math.max(0, Math.min(100, (maxVal / range) * 100));
        const gradId = `grad_${containerId}_${Date.now()}`, areaGradId = `area_${containerId}_${Date.now()}`;
        
        let dataMarkers = '';
        if (points.length <= 150) {
            dataMarkers = points.map((pt, i) => {
                const val = historyArray[i];
                const isLast = i === points.length - 1;
                const r = isLast ? 4 : 2.5;
                const stroke = isLast ? '#fff' : 'rgba(255,255,255,0.2)';
                const strokeWidth = isLast ? 2 : 1;
                const filter = isLast ? `filter="url(#shadow_${containerId})"` : '';
                return `<circle cx="${pt.x}" cy="${pt.y}" r="${r}" fill="${val >= 0 ? colorPos : colorNeg}" stroke="${stroke}" stroke-width="${strokeWidth}" ${filter} />`;
            }).join('');
        } else {
            const lastVal = historyArray[historyArray.length - 1];
            const lastPt = points[points.length - 1];
            dataMarkers = `<circle cx="${lastPt.x}" cy="${lastPt.y}" r="4" fill="${lastVal >= 0 ? colorPos : colorNeg}" stroke="#fff" stroke-width="2" filter="url(#shadow_${containerId})" />`;
        }
        
        const existingTt = document.getElementById(`tooltip_${containerId}`);
        if (existingTt) existingTt.remove();

        const svg = `
            <svg width="100%" height="${chartHeight}px" style="display:block; overflow:visible; cursor:crosshair; touch-action:none;" onmousemove="scrubGraph(event, '${containerId}')" ontouchmove="scrubGraph(event, '${containerId}')" onmouseleave="resetGraph('${containerId}')" ontouchend="resetGraph('${containerId}')">
                <defs>
                    <linearGradient id="${gradId}" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="${colorPos}" /><stop offset="${zeroPercent}%" stop-color="${colorPos}" /><stop offset="${zeroPercent}%" stop-color="${colorNeg}" /><stop offset="100%" stop-color="${colorNeg}" /></linearGradient>
                    <linearGradient id="${areaGradId}" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="${colorPos}" stop-opacity="0.4" /><stop offset="${zeroPercent}%" stop-color="${colorPos}" stop-opacity="0.0" /><stop offset="${zeroPercent}%" stop-color="${colorNeg}" stop-opacity="0.0" /><stop offset="100%" stop-color="${colorNeg}" stop-opacity="0.4" /></linearGradient>
                    <filter id="shadow_${containerId}" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.6" />
                    </filter>
                </defs>
                <path d="${areaPathD}" fill="url(#${areaGradId})" stroke="none" />
                ${(minVal <= 0 && maxVal >= 0) ? `<line x1="${padding}" y1="${zeroY}" x2="${width - padding}" y2="${zeroY}" stroke="rgba(255,255,255,0.15)" stroke-width="1.5" stroke-dasharray="6 4" />` : ''}
                <path d="${pathD}" fill="none" stroke="url(#${gradId})" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" filter="url(#shadow_${containerId})" />
                ${dataMarkers}
                <g id="scrubLineGroup_${containerId}" style="opacity:0; transition: transform 0.1s ease-out, opacity 0.2s; pointer-events:none;">
                    <line x1="0" y1="0" x2="0" y2="${chartHeight}" stroke="rgba(255,255,255,0.3)" stroke-width="1" stroke-dasharray="3 3" />
                </g>
                <g id="scrubDotGroup_${containerId}" style="opacity:0; transition: transform 0.1s ease-out, opacity 0.2s; pointer-events:none;">
                    <circle class="dot-glow" cx="0" cy="0" r="14" fill="${colorPos}" opacity="0.3" />
                    <circle class="dot-core" cx="0" cy="0" r="5" fill="#111" stroke="${colorPos}" stroke-width="2.5" />
                </g>
                <rect x="0" y="0" width="100%" height="100%" fill="transparent" />
            </svg>`;
        const hud = `
            <div style="height:${hudHeight}px" class="w-full bg-black/40 border-t border-white/10 flex items-center justify-between px-6 rounded-b-xl backdrop-blur-md">
                <div class="flex flex-col items-start leading-none">
                    <span class="text-[9px] uppercase font-black tracking-widest text-gray-500 mb-1">Wins</span>
                    <span class="text-base font-black drop-shadow-md" style="color:${colorPos}">${winCount}</span>
                </div>
                <div class="flex flex-col items-center justify-center bg-white/5 rounded-lg px-4 py-1 border border-white/10 shadow-inner">
                    <span class="text-[8px] uppercase font-bold tracking-widest text-gray-400 mb-0.5">Total Bets</span>
                    <span class="text-xs font-black text-white">${historyArray.length - 1}</span>
                </div>
                <div class="flex flex-col items-end leading-none">
                    <span class="text-[9px] uppercase font-black tracking-widest text-gray-500 mb-1">Losses</span>
                    <span class="text-base font-black drop-shadow-md" style="color:${colorNeg}">${lossCount}</span>
                </div>
            </div>`;
        container.innerHTML = svg + hud;
        
        const ttDiv = document.createElement('div');
        ttDiv.id = `tooltip_${containerId}`;
        ttDiv.className = "fixed bg-[#0f0a14]/95 backdrop-blur-xl border border-white/20 text-white rounded-xl p-3 pointer-events-none shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-[9999] hidden flex-col gap-2 min-w-[130px] transition-all duration-150 ease-out";
        ttDiv.innerHTML = `
            <div class="flex justify-between items-center border-b border-white/10 pb-2">
                <span class="text-gray-400 font-bold uppercase tracking-widest text-[9px]">BET</span>
                <span id="tt_spin_${containerId}" class="text-white font-mono font-bold text-xs bg-white/10 px-2 py-0.5 rounded-md">0</span>
            </div>
            <div class="flex justify-between items-center pt-0.5">
                <span class="text-gray-400 font-bold uppercase tracking-widest text-[9px]">NET</span>
                <span id="tt_val_${containerId}" class="font-mono font-black text-lg drop-shadow-md">0</span>
            </div>
        `;
        document.body.appendChild(ttDiv);
    }
}