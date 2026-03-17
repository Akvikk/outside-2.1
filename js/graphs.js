// =========================================================
// FON OUTSIDE - Graph & Scrubber System
// =========================================================

// Shared graph cache for hover scrub interactions.
window.graphData = window.graphData || {};

// 120Hz+ Optimized Scrubber (Decoupled Rendering)
let scrubRafId = null;
let activeGraphContainerId = null;

const resetGraphVisualState = (containerId) => {
    if (!containerId) return;
    const line = document.getElementById(`scrubberLine_${containerId}`);
    const dot = document.getElementById(`scrubberDot_${containerId}`);
    const tt = document.getElementById(`tooltip_${containerId}`);
    if (line) line.style.opacity = '0';
    if (dot) dot.style.opacity = '0';
    if (tt) tt.classList.add('hidden');

    const data = window.graphData && window.graphData[containerId];
    if (!data) return;
    const wEl = document.getElementById(`hud_wins_${containerId}`);
    const lEl = document.getElementById(`hud_loss_${containerId}`);
    const sEl = document.getElementById(`hud_spins_${containerId}`);
    if (wEl) wEl.textContent = String(data.totalWins || 0);
    if (lEl) lEl.textContent = String(data.totalLosses || 0);
    if (sEl) sEl.textContent = String(data.totalSpins || 0);
};

window.scrubGraph = (event, containerId) => {
    if (!window.graphData || !window.graphData[containerId]) return;
    const data = window.graphData && window.graphData[containerId];
    if (!data || !data.history || data.history.length < 2) return;
    if (activeGraphContainerId && activeGraphContainerId !== containerId) {
        resetGraphVisualState(activeGraphContainerId);
    }
    activeGraphContainerId = containerId;

    const svg = event.currentTarget || event.target;
    if (!svg || !svg.getBoundingClientRect) return;

    // Capture event data synchronously
    const rect = svg.getBoundingClientRect();
    const clientX = event.touches && event.touches[0] ? event.touches[0].clientX : event.clientX;
    if (typeof clientX !== 'number') return;

    // Logic moved inside RAF for 120Hz smoothness
    const performRender = () => {
        const padding = data.padding || 10;
        const width = rect.width;
        const relX = clientX - rect.left;

        // Calculate snapped index
        let idx;
        if (relX <= padding) idx = 0;
        else if (relX >= width - padding) idx = data.history.length - 1;
        else {
            const graphWidth = width - 2 * padding;
            const ratio = (relX - padding) / graphWidth;
            idx = Math.round(ratio * (data.history.length - 1));
        }
        idx = Math.max(0, Math.min(data.history.length - 1, idx));

        // Calculate Snapped X
        const snappedX = padding + (idx / (data.history.length - 1)) * (width - 2 * padding);

        const minVal = Number.isFinite(data.min) ? data.min : Math.min(...data.history);
        const range = Number.isFinite(data.range) && data.range !== 0 ? data.range : Math.max(1, Math.max(...data.history) - minVal);
        const chartHeight = rect.height;
        const val = data.history[idx];
        const y = chartHeight - padding - ((val - minVal) / range) * (chartHeight - 2 * padding);

        const line = document.getElementById(`scrubberLine_${containerId}`);
        const dot = document.getElementById(`scrubberDot_${containerId}`);
        const tt = document.getElementById(`tooltip_${containerId}`);
        const ttSpin = document.getElementById(`tt_spin_${containerId}`);
        const ttVal = document.getElementById(`tt_val_${containerId}`);
        const ttRes = document.getElementById(`tt_res_${containerId}`);

        if (line) {
            line.setAttribute('x1', snappedX.toString());
            line.setAttribute('x2', snappedX.toString());
            line.style.opacity = '1';
        }
        if (dot) {
            dot.setAttribute('cx', snappedX.toString());
            dot.setAttribute('cy', y.toString());
            dot.style.opacity = '1';
        }
        if (tt) {
            // Keep tooltip readable on mobile and out of top control clusters.
            const fixedX = rect.left + snappedX;
            const fixedY = rect.top + y;
            const ttWidth = 132;
            const ttHeight = 98;
            const margin = 8;
            const topSafe = 92;
            const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

            let top = fixedY - ttHeight - 14;
            if (top < topSafe) top = fixedY + 14;
            top = clamp(top, topSafe, window.innerHeight - ttHeight - margin);
            const left = clamp(fixedX, (ttWidth / 2) + margin, window.innerWidth - (ttWidth / 2) - margin);

            tt.style.left = `${left}px`;
            tt.style.top = `${top}px`;
            tt.style.transform = 'translate(-50%, 0)';
            tt.classList.remove('hidden');
        }

        if (ttSpin) ttSpin.textContent = String(idx);
        if (ttVal) {
            const displayVal = parseFloat(val.toFixed(2));
            ttVal.textContent = `${displayVal > 0 ? '+' : ''}${displayVal}`;
            ttVal.className = `font-mono font-black text-sm ${val > 0 ? 'text-[#30D158]' : (val < 0 ? 'text-[#FF453A]' : 'text-white')}`;
        }

        if (ttRes) {
            if (idx > 0) {
                const prev = data.history[idx - 1];
                const diff = parseFloat((val - prev).toFixed(2));
                ttRes.classList.remove('hidden');
                if (diff > 0) {
                    ttRes.textContent = `WIN (+${diff})`;
                    ttRes.className = "text-center font-bold uppercase tracking-widest text-[9px] mt-1 py-0.5 rounded bg-[#30D158]/20 text-[#30D158] border border-[#30D158]/30";
                } else if (diff < 0) {
                    ttRes.textContent = `LOSS (${diff})`;
                    ttRes.className = "text-center font-bold uppercase tracking-widest text-[9px] mt-1 py-0.5 rounded bg-[#FF453A]/20 text-[#FF453A] border border-[#FF453A]/30";
                } else {
                    ttRes.textContent = "PUSH";
                    ttRes.className = "text-center font-bold uppercase tracking-widest text-[9px] mt-1 py-0.5 rounded bg-white/10 text-white/70 border border-white/10";
                }
            } else {
                ttRes.classList.add('hidden');
            }
        }

        const wId = `hud_wins_${containerId}`;
        const lId = `hud_loss_${containerId}`;
        const sId = `hud_spins_${containerId}`;
        const wEl = document.getElementById(wId);
        const lEl = document.getElementById(lId);
        const sEl = document.getElementById(sId);
        if (wEl && Array.isArray(data.cumWins)) wEl.textContent = String(data.cumWins[idx] || 0);
        if (lEl && Array.isArray(data.cumLoss)) lEl.textContent = String(data.cumLoss[idx] || 0);
        if (sEl) sEl.textContent = String(idx);
    };

    // Debounce via RAF
    if (scrubRafId) cancelAnimationFrame(scrubRafId);
    scrubRafId = requestAnimationFrame(() => {
        performRender();
        scrubRafId = null;
    });
};

window.resetGraph = (containerId) => {
    resetGraphVisualState(containerId);
    if (activeGraphContainerId === containerId) activeGraphContainerId = null;
};

window.hideAllGraphTooltips = () => {
    if (!window.graphData) return;
    Object.keys(window.graphData).forEach(id => resetGraphVisualState(id));
    activeGraphContainerId = null;
};

if (!window.__graphTooltipGlobalListenersBound) {
    const hideAllTooltips = () => window.hideAllGraphTooltips();
    document.addEventListener('touchend', hideAllTooltips, { passive: true });
    document.addEventListener('touchcancel', hideAllTooltips, { passive: true });
    document.addEventListener('scroll', hideAllTooltips, true);
    window.addEventListener('resize', hideAllTooltips, { passive: true });
    window.addEventListener('orientationchange', hideAllTooltips, { passive: true });
    window.addEventListener('blur', hideAllTooltips, { passive: true });
    document.addEventListener('pointerdown', (event) => {
        if (!event.target || typeof event.target.closest !== 'function') {
            hideAllTooltips();
            return;
        }
        if (!event.target.closest('svg')) hideAllTooltips();
    }, true);
    window.__graphTooltipGlobalListenersBound = true;
}
