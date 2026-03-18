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

                const snappedX = padding + (idx / (data.history.length - 1)) * (width - 2 * padding);
                const chartHeight = rect.height;
                const val = data.history[idx];
                const y = chartHeight - padding - ((val - data.min) / data.range) * (chartHeight - 2 * padding);

                const line = document.getElementById(`scrubberLine_${containerId}`);
                const dot = document.getElementById(`scrubberDot_${containerId}`);
                const tt = document.getElementById(`tooltip_${containerId}`);
                
                if (line) { line.setAttribute('x1', snappedX); line.setAttribute('x2', snappedX); line.style.opacity = '1'; }
                if (dot) { dot.setAttribute('cx', snappedX); dot.setAttribute('cy', y); dot.style.opacity = '1'; }
                
                if (tt) {
                    const fixedX = rect.left + snappedX;
                    const fixedY = rect.top + y;
                    let top = fixedY - 112;
                    if (top < 92) top = fixedY + 14;
                    top = Math.max(92, Math.min(top, window.innerHeight - 112));
                    const left = Math.max(74, Math.min(fixedX, window.innerWidth - 74));

                    tt.style.left = `${left}px`; tt.style.top = `${top}px`;
                    tt.style.transform = 'translate(-50%, 0)'; tt.classList.remove('hidden');
                    
                    document.getElementById(`tt_spin_${containerId}`).textContent = String(idx);
                    const vEl = document.getElementById(`tt_val_${containerId}`);
                    vEl.textContent = `${val > 0 ? '+' : ''}${parseFloat(val.toFixed(2))}`;
                    vEl.className = `font-mono font-black text-sm ${val > 0 ? 'text-[#30D158]' : (val < 0 ? 'text-[#FF453A]' : 'text-white')}`;
                }
            });
        };

        window.resetGraph = (containerId) => {
            if (!containerId) return;
            const line = document.getElementById(`scrubberLine_${containerId}`);
            const dot = document.getElementById(`scrubberDot_${containerId}`);
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
            container.innerHTML = `<div class="w-full h-full flex flex-col items-center justify-center text-gray-500 space-y-2 select-none"><i class="fas fa-chart-line text-2xl opacity-50"></i><span class="text-[10px] font-bold uppercase tracking-widest opacity-70">Waiting for Data...</span></div>`;
            return;
        }
        
        const chartHeight = totalHeight * 0.8, hudHeight = totalHeight * 0.2, padding = 10;
        let maxVal = Math.max(...historyArray), minVal = Math.min(...historyArray);
        if (maxVal === minVal) { maxVal++; minVal--; }
        const range = maxVal - minVal;
        
        window.graphData = window.graphData || {};
        window.graphData[containerId] = { history: historyArray, padding, min: minVal, range };

        const getX = (i) => (i / (historyArray.length - 1)) * (width - 2 * padding) + padding;
        const getY = (val) => chartHeight - padding - ((val - minVal) / range) * (chartHeight - 2 * padding);

        let pathD = `M ${getX(0)} ${getY(historyArray[0])}`;
        for (let i = 1; i < historyArray.length; i++) pathD += ` L ${getX(i)} ${getY(historyArray[i])}`;

        const zeroY = getY(0);
        const clampedZeroY = Math.min(Math.max(zeroY, padding), chartHeight - padding);
        const areaPathD = pathD + ` L ${getX(historyArray.length - 1)} ${clampedZeroY} L ${getX(0)} ${clampedZeroY} Z`;
        const zeroPercent = Math.max(0, Math.min(100, (maxVal / range) * 100));
        const gradId = `grad_${containerId}_${Date.now()}`, areaGradId = `area_${containerId}_${Date.now()}`;
        
        const lastVal = historyArray[historyArray.length - 1];
        const endMarker = `<circle cx="${getX(historyArray.length - 1)}" cy="${getY(lastVal)}" r="4" fill="${lastVal >= 0 ? colorPos : colorNeg}" stroke="#fff" stroke-width="1.5" />`;
        
        const existingTt = document.getElementById(`tooltip_${containerId}`);
        if (existingTt) existingTt.remove();

        const svg = `
            <svg width="100%" height="${chartHeight}px" style="display:block; overflow:visible; cursor:crosshair; touch-action:none;" onmousemove="scrubGraph(event, '${containerId}')" ontouchmove="scrubGraph(event, '${containerId}')" onmouseleave="resetGraph('${containerId}')" ontouchend="resetGraph('${containerId}')">
                <defs>
                    <linearGradient id="${gradId}" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="${colorPos}" /><stop offset="${zeroPercent}%" stop-color="${colorPos}" /><stop offset="${zeroPercent}%" stop-color="${colorNeg}" /><stop offset="100%" stop-color="${colorNeg}" /></linearGradient>
                    <linearGradient id="${areaGradId}" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="${colorPos}" stop-opacity="0.2" /><stop offset="${zeroPercent}%" stop-color="${colorPos}" stop-opacity="0.05" /><stop offset="${zeroPercent}%" stop-color="${colorNeg}" stop-opacity="0.05" /><stop offset="100%" stop-color="${colorNeg}" stop-opacity="0.2" /></linearGradient>
                </defs>
                <path d="${areaPathD}" fill="url(#${areaGradId})" stroke="none" />
                ${(minVal <= 0 && maxVal >= 0) ? `<line x1="${padding}" y1="${zeroY}" x2="${width - padding}" y2="${zeroY}" stroke="rgba(255,255,255,0.1)" stroke-width="1" stroke-dasharray="4" />` : ''}
                <path d="${pathD}" fill="none" stroke="url(#${gradId})" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke" />
                ${endMarker}
                <line id="scrubberLine_${containerId}" x1="0" y1="0" x2="0" y2="${chartHeight}" stroke="white" stroke-width="1" stroke-opacity="0.2" style="opacity:0; pointer-events:none;" />
                <circle id="scrubberDot_${containerId}" cx="0" cy="0" r="4" fill="white" stroke="url(#${gradId})" stroke-width="2" style="opacity:0; pointer-events:none;" />
                <rect x="0" y="0" width="100%" height="100%" fill="transparent" />
            </svg>`;
        const hud = `<div style="height:${hudHeight}px" class="w-full bg-black/20 border-t border-white/10 flex items-center justify-between px-4 rounded-b-xl"><div class="flex flex-col items-center leading-none"><span class="text-[9px] uppercase font-bold text-gray-500 mb-0.5">Wins</span><span class="text-sm font-black" style="color:${colorPos}">${winCount}</span></div><div class="flex flex-col items-center justify-center bg-white/5 rounded px-3 py-0.5 border border-white/10"><span class="text-[8px] uppercase font-bold text-gray-500">Spins</span><span class="text-xs font-black text-white">${historyArray.length - 1}</span></div><div class="flex flex-col items-center leading-none"><span class="text-[9px] uppercase font-bold text-gray-500 mb-0.5">Losses</span><span class="text-sm font-black" style="color:${colorNeg}">${lossCount}</span></div></div>`;
        container.innerHTML = svg + hud;
        
        const ttDiv = document.createElement('div');
        ttDiv.id = `tooltip_${containerId}`;
        ttDiv.className = "fixed bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/10 text-[10px] rounded-xl p-2.5 pointer-events-none shadow-[0_8px_30px_rgba(0,0,0,0.5)] z-[9999] hidden flex flex-col gap-1.5 min-w-[100px] transition-all duration-75 ease-out";
        ttDiv.innerHTML = `<div class="flex justify-between items-center border-b border-white/10 pb-1.5 mb-0.5"><span class="text-gray-400 font-bold uppercase tracking-wider text-[9px]">HAND</span><span id="tt_spin_${containerId}" class="text-white font-mono font-bold text-xs">0</span></div><div class="flex justify-between items-center"><span class="text-gray-400 font-bold uppercase tracking-wider text-[9px]">NET</span><span id="tt_val_${containerId}" class="font-mono font-black text-sm">0</span></div>`;
        document.body.appendChild(ttDiv);
    }
}