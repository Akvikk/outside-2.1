export default class TrendGraph {
    static drawAdvancedGraph(historyArray, winCount, lossCount, containerId, lineColor = null) {
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
        window.graphData[containerId] = { history: historyArray, totalWins: winCount, totalLosses: lossCount, padding, min: minVal, range };

        const gridColor = 'rgba(255,255,255,0.1)', textColor = '#888', strokeWidth = 4, colorWin = '#30D158', colorLoss = '#FF453A';
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
        const endMarker = `<circle cx="${getX(historyArray.length - 1)}" cy="${getY(lastVal)}" r="6" fill="${lastVal >= 0 ? colorWin : colorLoss}" stroke="#000" stroke-width="2" />`;

        const svg = `
            <svg width="100%" height="${chartHeight}px" style="display:block; overflow:visible;">
                <defs>
                    <linearGradient id="${gradId}" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="${colorWin}" /><stop offset="${zeroPercent}%" stop-color="${colorWin}" /><stop offset="${zeroPercent}%" stop-color="${colorLoss}" /><stop offset="100%" stop-color="${colorLoss}" /></linearGradient>
                    <linearGradient id="${areaGradId}" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="${colorWin}" stop-opacity="0.25" /><stop offset="${zeroPercent}%" stop-color="${colorWin}" stop-opacity="0" /><stop offset="${zeroPercent}%" stop-color="${colorLoss}" stop-opacity="0" /><stop offset="100%" stop-color="${colorLoss}" stop-opacity="0.25" /></linearGradient>
                </defs>
                <path d="${areaPathD}" fill="url(#${areaGradId})" stroke="none" />
                <line x1="${padding}" y1="${zeroY}" x2="${width - padding}" y2="${zeroY}" stroke="${gridColor}" stroke-width="1" stroke-dasharray="4" />
                <path d="${pathD}" fill="none" stroke="url(#${gradId})" stroke-width="${strokeWidth}" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke" />
                ${endMarker}
            </svg>`;
        const hud = `<div style="height:${hudHeight}px" class="w-full bg-black/20 border-t border-white/10 flex items-center justify-between px-4 rounded-b-xl"><div class="flex flex-col items-center leading-none"><span class="text-[9px] uppercase font-bold text-gray-500 mb-0.5">Wins</span><span class="text-sm font-black text-[#4ade80]">${winCount}</span></div><div class="flex flex-col items-center justify-center bg-white/5 rounded px-3 py-0.5 border border-white/10"><span class="text-[8px] uppercase font-bold text-gray-500">Spins</span><span class="text-xs font-black text-white">${historyArray.length - 1}</span></div><div class="flex flex-col items-center leading-none"><span class="text-[9px] uppercase font-bold text-gray-500 mb-0.5">Losses</span><span class="text-sm font-black text-[#f87171]">${lossCount}</span></div></div>`;
        container.innerHTML = svg + hud;
    }
}