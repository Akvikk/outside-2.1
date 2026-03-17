﻿// =========================================================
// FON OUTSIDE - Dragon Tiger Engine
// =========================================================

app.dragontiger = {
    history: [],
    stats: { p: 0, b: 0, t: 0, wins: 0, total: 0 },
    patternStats: {},
    currentPrediction: null,
    currentHighlightIndices: [],
    currentHighlightMap: new Map(),
    commissionExact: true,

    // "MY BETS" State
    myBetsHistory: [],
    activeLockedBet: null,
    lastCardTap: 0,

    // "GOLDEN BETS" State
    goldenBetsHistory: [],

    // VOICE SYNTHESIS STATE
    lastSpokenId: null,

    // ONE-SHOT PATTERN TRACKING
    // Tracks which patterns have already fired to prevent continuous repeats
    firedSignals: {},

    // MAIN DASHBOARD FILTERS
    filters: {
        'FLOW': true, 'ZIG-ZAG': true, 'FALSE BREAK': true,
        '1-2-3': true, '3-2-1': true, '1-1-3': true, '3-1-1 DOWN': true
    },

    // SIMULATION LAB FILTERS
    simFilters: {
        'FLOW': true, 'ZIG-ZAG': true, 'FALSE BREAK': true,
        '1-2-3': true, '3-2-1': true, '1-1-3': true, '3-1-1 DOWN': true
    },

    toggleMenu(e) {
        if (e) e.stopPropagation();
        const menu = document.getElementById('mainMenuDropdown');
        const overlay = document.getElementById('menuOverlay');
        menu.classList.toggle('hidden');
        if (overlay) overlay.classList.toggle('hidden');
    },

    // --- PERSISTENCE ENGINE ---
    saveLocal() {
        const data = {
            history: this.history.length > 2000 ? this.history.slice(-2000) : this.history,
            stats: this.stats,
            patternStats: this.patternStats,
            myBetsHistory: this.myBetsHistory.length > 2000 ? this.myBetsHistory.slice(-2000) : this.myBetsHistory,
            goldenBetsHistory: this.goldenBetsHistory.length > 2000 ? this.goldenBetsHistory.slice(-2000) : this.goldenBetsHistory,
            filters: this.filters,
            simFilters: this.simFilters,
            commissionExact: this.commissionExact
        };
        app.utils.saveLocal('dt_v4_session', data);
    },

    loadLocal() {
        const data = app.utils.loadLocal('dt_v4_session');
        if (!data) return;
        try {
            if (data.history) this.history = data.history;
            if (data.stats) this.stats = data.stats;
            if (data.patternStats) this.patternStats = data.patternStats;
            if (data.myBetsHistory) {
                // Backward compatibility: older sessions stored DT ties as PUSH (0).
                this.myBetsHistory = data.myBetsHistory.map(bet =>
                    (bet && bet.status === 'PUSH' && bet.result === 'X')
                        ? { ...bet, status: 'LOSS', net: -0.5 }
                        : bet
                );
            }
            if (data.goldenBetsHistory) {
                this.goldenBetsHistory = data.goldenBetsHistory.map(bet =>
                    (bet && bet.status === 'PUSH' && bet.result === 'X')
                        ? { ...bet, status: 'LOSS', net: -0.5 }
                        : bet
                );
            }
            if (data.filters) this.filters = data.filters;
            if (data.simFilters) this.simFilters = data.simFilters;
            if (data.commissionExact !== undefined) this.commissionExact = data.commissionExact;

            // Sync UI
            document.getElementById('dt-comm-toggle').checked = this.commissionExact;
            document.getElementById('dt-toggle-ignore-ties').checked = true; // Default preference
        } catch (e) { console.error('Dragon Tiger load failed:', e); }
    },



    toggleCommission() {
        this.commissionExact = document.getElementById('dt-comm-toggle').checked;
        this.renderStats();
        this.renderVault();
    },





    // --- PROGRESSION / MONEY MANAGEMENT ENGINE ---


    // Double Tap / Double Click logic for Premium Cards
    handleCardClick(rawName, pred) {
        this.lockBet(rawName, pred);
    },

    lockBet(rawName, pred) {
        // Toggle unlock if clicking same card
        if (this.activeLockedBet && this.activeLockedBet.pattern === rawName && this.activeLockedBet.pred === pred) {
            this.activeLockedBet = null;
        } else {
            this.activeLockedBet = { pattern: rawName, pred: pred };
        }
        this.runEngine(); // Rerender to show locked UI instantly
    },

    input(result) {
        // Haptic feedback
        if (navigator.vibrate) navigator.vibrate(10);

        let patternsResolved = [];
        let isGlobalWin = false;

        // Track Golden Bets independently
        let goldenBetData = null;

        // Process theoretical live tracking & Golden Bets
        if (this.currentPrediction && this.currentPrediction.candidates) {

            // Did we have a Golden Convergence on this hand?
            const goldenCand = this.currentPrediction.candidates.find(c => c.isGolden);
            if (goldenCand) {
                const isTie = (result === 'X');
                const isWin = (goldenCand.pred === result);
                let net = isWin ? 1 : (isTie ? -0.5 : -1);
                goldenBetData = {
                    handNum: this.history.length + 1,
                    convergence: goldenCand.rawName,
                    pred: goldenCand.pred,
                    result: result,
                    status: isWin ? 'WIN' : 'LOSS',
                    net: net
                };
                this.goldenBetsHistory.push(goldenBetData);
            }
        }

        // Re-evaluate ALL patterns that triggered this hand (regardless of Golden fusion) to keep Heatmap perfectly accurate
        const fullHistoryForStats = this.history.map((h, i) => ({ val: h.val, index: i }));
        const ignoreTiesStatsEl = document.getElementById('dt-toggle-ignore-ties') || document.getElementById('toggle-ignore-ties');
        const ignoreTiesStats = ignoreTiesStatsEl ? ignoreTiesStatsEl.checked : false;
        const processSeqStats = ignoreTiesStats ? fullHistoryForStats.filter(h => h.val !== 'X') : fullHistoryForStats;

        if (processSeqStats.length >= 3) {
            const isTieResult = result === 'X';
            let vCands = this.detectPatterns(processSeqStats, "Vertical");
            let hCands = this.detectPatterns(processSeqStats.filter(h => h.index % 6 === this.history.length % 6), "Horizontal");

            let allRaw = [...vCands, ...hCands];

            const seenRaw = new Set();
            allRaw.forEach(c => {
                const key = `${c.pred}-${c.name}`;
                if (!seenRaw.has(key)) {
                    seenRaw.add(key);
                    const isWin = (c.pred === result);
                    this.updatePatternStats(c.rawName, isWin, 'add');
                    patternsResolved.push({ name: c.rawName, win: isWin, pred: c.pred, tie: isTieResult });
                    if (isWin) isGlobalWin = true;
                }
            });
        }

        // Process Actual Vault Bet (if locked)
        let myBetData = null;
        if (this.activeLockedBet) {
            const isTie = (result === 'X');
            const isWin = (this.activeLockedBet.pred === result);
            let net = -1;
            let status = 'LOSS';

            if (isWin) {
                net = 1;
                status = 'WIN';
            } else if (isTie) {
                net = -0.5;
            }

            myBetData = {
                handNum: this.history.length + 1,
                pattern: this.activeLockedBet.pattern,
                pred: this.activeLockedBet.pred,
                result: result,
                status: status,
                net: net
            };

            this.myBetsHistory.push(myBetData);
            this.activeLockedBet = null; // reset lock after bet resolution
        }

        this.history.push({ val: result, isWin: isGlobalWin, patternList: patternsResolved, myBetResolved: myBetData !== null, goldenBetResolved: goldenBetData !== null });
        this.updateCounters(result, 1);

        // Clear an active lock if skipping a hand without betting
        this.activeLockedBet = null;

        // Use requestAnimationFrame to yield to the browser, allowing the button ripple 
        // and CSS active states to render instantly, eliminating perceived input delay.
        requestAnimationFrame(() => {
            this.renderDataBinding();
        });
    },

    renderDataBinding() {
        this.runEngine();
        this.render();

        if (!document.getElementById('dt-stats-modal').classList.contains('hidden')) this.renderStats();
        if (!document.getElementById('dt-filters-modal').classList.contains('hidden')) this.renderFilters();
        if (!document.getElementById('dt-sim-modal').classList.contains('hidden')) this.updateSim();
        if (!document.getElementById('dt-vault-modal').classList.contains('hidden')) this.renderVault();
        if (!document.getElementById('dt-log-modal').classList.contains('hidden')) this.renderLogs();
        this.saveLocal();
    },

    updateCounters(res, delta) {
        if (res === 'D') this.stats.p += delta;
        if (res === 'T') this.stats.b += delta;
        if (res === 'X') this.stats.t += delta;
        this.stats.total += delta;
    },

    updatePatternStats(name, win, op) {
        if (!this.patternStats[name]) this.patternStats[name] = { w: 0, l: 0 };
        if (op === 'add') { if (win) this.patternStats[name].w++; else this.patternStats[name].l++; }
        else { if (win) this.patternStats[name].w--; else this.patternStats[name].l--; }
    },

    undo() {
        if (this.history.length === 0) return;
        const last = this.history.pop();
        this.updateCounters(last.val, -1);
        if (last.patternList) last.patternList.forEach(p => this.updatePatternStats(p.name, p.win, 'remove'));

        // Undo Vault Data
        if (last.myBetResolved) {
            this.myBetsHistory.pop();
        }

        // Undo Golden Data
        if (last.goldenBetResolved) {
            this.goldenBetsHistory.pop();
        }

        this.activeLockedBet = null; // safety reset
        // Allow speech to re-trigger if we undo
        this.lastSpokenId = null;
        // Reset one-shot tracking so patterns can re-fire
        this.firedSignals = {};

        this.renderDataBinding();
    },

    reset() {
        this.toggleModal('reset-modal-dragontiger');
    },

    executeReset() {
        this.history = [];
        this.stats = { p: 0, b: 0, t: 0, wins: 0, total: 0 };
        this.patternStats = {};
        this.myBetsHistory = [];
        this.goldenBetsHistory = [];
        this.currentPrediction = null;
        this.activeLockedBet = null;
        this.currentHighlightMap = new Map();
        this.lastSpokenId = null;
        this.firedSignals = {};

        this.runEngine();
        this.render();

        // Close all modals after reset
        document.getElementById('dt-stats-modal').classList.add('hidden');
        document.getElementById('dt-filters-modal').classList.add('hidden');
        document.getElementById('dt-sim-modal').classList.add('hidden');
        document.getElementById('dt-vault-modal').classList.add('hidden');
        document.getElementById('dt-log-modal').classList.add('hidden');
        this.toggleModal('reset-modal-dragontiger'); // Close the reset modal itself

        this.saveLocal();
    },

    render() {
        this.renderBeadPlate();
        this.renderBigRoad();

        // Update Shoe Composition HUD
        const t = this.stats.total;
        const fmtComp = (count) => t ? `[${count} | ${Math.round((count / t) * 100)}%]` : '[0 | 0%]';
        document.getElementById('dragontiger-hands-count').innerText = `${t} Hands`;
        document.getElementById('dragontiger-comp-p').innerText = fmtComp(this.stats.p);
        document.getElementById('dragontiger-comp-b').innerText = fmtComp(this.stats.b);
        document.getElementById('dragontiger-comp-t').innerText = fmtComp(this.stats.t);
    },

    renderBeadPlate(highlightOnly = false) {
        const container = document.getElementById('dt-bead-plate');
        if (!container) return;

        let grid = container.querySelector('.road-grid');
        if (!grid) {
            grid = document.createElement('div');
            grid.className = 'road-grid flex-1';
            container.appendChild(grid);
        }

        const requiredCols = Math.max(14, Math.ceil(this.history.length / 6) + 1);
        const currentCols = grid.children.length / 6;

        if (requiredCols > currentCols || currentCols === 0) {
            grid.style.gridTemplateColumns = `repeat(${requiredCols}, 26px)`;
            const diff = requiredCols > currentCols ? (requiredCols - currentCols) * 6 : requiredCols * 6;
            const frag = document.createDocumentFragment();
            for (let i = 0; i < diff; i++) {
                const cell = document.createElement('div');
                cell.className = 'road-cell';
                frag.appendChild(cell);
            }
            grid.appendChild(frag);
        } else if (requiredCols < currentCols) {
            for (let i = 0; i < (currentCols - requiredCols) * 6; i++) {
                grid.removeChild(grid.lastChild);
            }
            grid.style.gridTemplateColumns = `repeat(${requiredCols}, 26px)`;
        }

        const cells = grid.children;
        for (let i = 0; i < cells.length; i++) {
            const cell = cells[i];
            if (i < this.history.length) {
                const h = this.history[i];
                let bead = cell.firstChild;

                if (!bead) {
                    bead = document.createElement('div');
                    let bClass = `bead bead-${h.val.toLowerCase()}`;
                    if (h.val === 'T') bClass = 'bead bead-dt-t';
                    bead.className = bClass;
                    bead.innerText = h.val;
                    cell.appendChild(bead);
                } else if (!highlightOnly) {
                    if (bead.innerText !== h.val) {
                        let bClass = `bead bead-${h.val.toLowerCase()}`;
                        if (h.val === 'T') bClass = 'bead bead-dt-t';
                        bead.className = bClass;
                        bead.innerText = h.val;
                    }
                }

                const existingRing = Array.from(bead.classList).find(c => c.startsWith('highlight-ring-'));
                const newRing = (this.currentHighlightMap && this.currentHighlightMap.has(i))
                    ? `highlight-ring-${this.currentHighlightMap.get(i)}`
                    : null;

                if (existingRing !== newRing) {
                    if (existingRing) bead.classList.remove(existingRing);
                    if (newRing) bead.classList.add(newRing);
                }
            } else {
                if (cell.firstChild) cell.removeChild(cell.firstChild);
            }
        }

        if (!highlightOnly) {
            const activeColBP = Math.max(0, Math.ceil(this.history.length / 6) - 1);
            const targetX_BP = activeColBP * 27;
            requestAnimationFrame(() => {
                if (container.clientWidth > 0) {
                    container.scrollLeft = Math.max(0, targetX_BP - container.clientWidth + 80);
                }
            });
        }
    },

    renderBigRoad() {
        const container = document.getElementById('dt-big-road');
        if (!container) return;

        let roadData = [], currentCol = [], lastMain = null;

        this.history.forEach(h => {
            if (h.val === 'X') {
                if (currentCol.length > 0) currentCol[currentCol.length - 1].ties++;
            } else {
                if (h.val === lastMain) currentCol.push({ val: h.val, ties: 0 });
                else {
                    if (currentCol.length > 0) roadData.push(currentCol);
                    currentCol = [{ val: h.val, ties: 0 }];
                    lastMain = h.val;
                }
            }
        });
        if (currentCol.length > 0) roadData.push(currentCol);

        let grid = container.querySelector('.road-grid');
        if (!grid) {
            grid = document.createElement('div');
            grid.className = 'road-grid h-full';
            container.appendChild(grid);
        }

        const cols = Math.max(25, roadData.length + 1);
        const currentCols = grid.children.length / 6;

        if (cols > currentCols || currentCols === 0) {
            grid.style.gridTemplateColumns = `repeat(${cols}, 18px)`;
            const frag = document.createDocumentFragment();
            const diff = cols > currentCols ? (cols - currentCols) * 6 : cols * 6;
            for (let i = 0; i < diff; i++) {
                const cell = document.createElement('div');
                cell.className = 'road-cell';
                frag.appendChild(cell);
            }
            grid.appendChild(frag);
        } else if (cols < currentCols) {
            for (let i = 0; i < (currentCols - cols) * 6; i++) {
                grid.removeChild(grid.lastChild);
            }
            grid.style.gridTemplateColumns = `repeat(${cols}, 18px)`;
        }

        const cells = grid.children;
        for (let c = 0; c < cols; c++) {
            const columnData = roadData[c] || [];
            for (let r = 0; r < 6; r++) {
                const cell = cells[(c * 6) + r];
                const data = columnData[r];

                if (data) {
                    const hollowClass = `hollow-${data.val.toLowerCase()}`;
                    if (cell.children.length === 0) {
                        if (data.ties > 0) {
                            const tie = document.createElement('div');
                            tie.className = 'tie-marker';
                            cell.appendChild(tie);
                        }
                        const circ = document.createElement('div');
                        circ.className = hollowClass;
                        cell.appendChild(circ);
                    } else {
                        const hasTieMarker = data.ties > 0;
                        const existingHasTie = cell.firstChild && cell.firstChild.className === 'tie-marker';
                        const existingHollow = existingHasTie ? cell.children[1] : cell.firstChild;

                        if (existingHasTie !== hasTieMarker || !existingHollow || existingHollow.className !== hollowClass) {
                            cell.innerHTML = '';
                            if (hasTieMarker) {
                                const tie = document.createElement('div');
                                tie.className = 'tie-marker';
                                cell.appendChild(tie);
                            }
                            const circ = document.createElement('div');
                            circ.className = hollowClass;
                            cell.appendChild(circ);
                        }
                    }
                } else {
                    if (cell.firstChild) cell.innerHTML = '';
                }
            }
        }

        const activeColBR = Math.max(0, roadData.length - 1);
        const targetX_BR = activeColBR * 19;
        requestAnimationFrame(() => {
            if (container.clientWidth > 0) {
                container.scrollLeft = Math.max(0, targetX_BR - container.clientWidth + 60);
            }
        });
    },

    // --- MAIN ENGINE ---
    runEngine() {
        const fullHistory = this.history.map((h, i) => ({ val: h.val, index: i }));
        const ignoreTiesEl = document.getElementById('dt-toggle-ignore-ties') || document.getElementById('toggle-ignore-ties');
        const ignoreTies = ignoreTiesEl ? ignoreTiesEl.checked : false;
        const processSeq = ignoreTies ? fullHistory.filter(h => h.val !== 'X') : fullHistory;
        const statusArea = document.getElementById('dragontiger-dashboard');

        if (processSeq.length < 3) {
            statusArea.innerHTML = `<div class="scanning-text uppercase font-bold text-xs opacity-60 w-full flex items-center justify-center h-full">Analyzing data... ${processSeq.length}/3</div>`;
            this.currentHighlightIndices = [];
            this.currentHighlightMap = new Map();
            this.currentPrediction = null;
            return;
        }

        let allCandidates = [];
        let vertCands = this.detectPatterns(processSeq, "Vertical");
        allCandidates.push(...vertCands);

        const rows = 6;
        const nextRowIdx = this.history.length % rows;
        const rowSequence = processSeq.filter(h => h.index % rows === nextRowIdx);

        let horizCands = this.detectPatterns(rowSequence, `Horizontal`);
        allCandidates.push(...horizCands);

        if (allCandidates.length === 0) {
            statusArea.innerHTML = `<div class="scanning-text uppercase font-bold text-xs opacity-60 w-full flex items-center justify-center h-full">Scanning for patterns...</div>`;
            this.currentHighlightIndices = [];
            this.currentHighlightMap = new Map();
            this.currentPrediction = null;
            return;
        }

        const uniqueCands = [];
        const seen = new Set();
        allCandidates.forEach(c => {
            const key = `${c.pred}-${c.name}`;
            if (!seen.has(key)) { seen.add(key); uniqueCands.push(c); }
        });

        // Apply UI Filters
        let visibleCands = uniqueCands.filter(c => this.filters[c.rawName] !== false);

        // --- ONE-SHOT SUPPRESSION (Flow & Zig-Zag) ---
        // These patterns fire continuously while active. We only show them
        // on the FIRST hand they appear, then suppress until they break.
        const oneShotPatterns = new Set(['FLOW', 'ZIG-ZAG']);
        const getOneShotKey = (cand) => `${cand.rawName}|${cand.name.includes('Horizontal') ? 'H' : 'V'}`;
        const detectedOneShotKeys = new Set(
            visibleCands
                .filter(c => oneShotPatterns.has(c.rawName))
                .map(c => getOneShotKey(c))
        );

        // Clear tracking for patterns that are no longer detected (pattern broke)
        Object.keys(this.firedSignals).forEach(name => {
            if (!detectedOneShotKeys.has(name)) {
                delete this.firedSignals[name];
            }
        });

        visibleCands = visibleCands.filter(c => {
            if (!oneShotPatterns.has(c.rawName)) return true; // Non one-shot patterns pass through

            const oneShotKey = getOneShotKey(c);
            const isLockedOneShot = this.activeLockedBet
                && this.activeLockedBet.pattern === c.rawName
                && this.activeLockedBet.pred === c.pred;

            if (this.firedSignals[oneShotKey] && !isLockedOneShot) {
                // Already fired — suppress until pattern breaks and re-forms
                return false;
            }

            // First detection of this pattern instance — fire once and record
            if (!this.firedSignals[oneShotKey]) this.firedSignals[oneShotKey] = true;
            return true;
        });

        // --- GOLDEN BET CONVERGENCE LOGIC ---
        // Group candidates by prediction (P, B, T). If any group has 2 or more patterns, merge them!
        const grouped = { 'D': [], 'T': [], 'X': [] };
        visibleCands.forEach(c => grouped[c.pred].push(c));

        const newVisibleCands = [];
        for (const pred in grouped) {
            const group = grouped[pred];
            if (group.length >= 2) {
                // Merge into a single Golden Card
                const mergedName = group.map(g => g.rawName).join(' + ');
                const allIndices = [...new Set(group.flatMap(g => g.indices))];
                newVisibleCands.push({
                    pred: pred,
                    name: mergedName,
                    rawName: mergedName, // Used for logging/stats
                    indices: allIndices,
                    isGolden: true
                });
            } else if (group.length === 1) {
                // Keep as a normal card
                newVisibleCands.push(group[0]);
            }
        }
        visibleCands = newVisibleCands;

        // --- DYNAMIC CARD SORTING ("HOT" SORT) ---
        visibleCands.sort((a, b) => {
            // Golden bets always get priority #1
            if (a.isGolden && !b.isGolden) return -1;
            if (!a.isGolden && b.isGolden) return 1;

            const getWr = (rawName) => {
                const s = this.patternStats[rawName] || { w: 0, l: 0 };
                const tot = s.w + s.l;
                return tot > 0 ? (s.w / tot) : 0;
            };

            return getWr(b.rawName) - getWr(a.rawName); // Descending Win Rate
        });

        this.currentPrediction = { candidates: visibleCands };
        this.currentHighlightIndices = [...new Set(visibleCands.flatMap(a => a.indices))];

        this.currentHighlightMap = new Map();
        visibleCands.forEach(c => {
            c.indices.forEach(idx => {
                this.currentHighlightMap.set(idx, 'signal');
            });
        });

        if (visibleCands.length === 0) {
            statusArea.innerHTML = `<div class="scanning-text uppercase font-bold text-xs opacity-40 w-full flex items-center justify-center h-full"><i class="fas fa-eye-slash mr-2"></i> Signal Hidden by Filter</div>`;
        } else {
            const getPatternWr = (rawName) => {
                if (!rawName) return null;

                const getSingleWr = (name) => {
                    const stats = this.patternStats[name] || { w: 0, l: 0 };
                    const total = stats.w + stats.l;
                    if (total <= 0) return null;
                    return { w: stats.w, l: stats.l };
                };

                if (!rawName.includes('+')) {
                    const single = getSingleWr(rawName.trim());
                    if (!single) return null;
                    return Math.round((single.w / (single.w + single.l)) * 100);
                }

                let aggW = 0;
                let aggL = 0;
                let hasData = false;
                rawName.split('+').map(s => s.trim()).forEach(name => {
                    const s = getSingleWr(name);
                    if (!s) return;
                    aggW += s.w;
                    aggL += s.l;
                    hasData = true;
                });

                if (!hasData || (aggW + aggL) <= 0) return null;
                return Math.round((aggW / (aggW + aggL)) * 100);
            };

            let cardsHtml = '<div class="flex gap-3 overflow-x-auto overscroll-contain px-1 w-full items-center justify-center h-full no-scrollbar min-w-0">';
            visibleCands.forEach(c => {
                const isP = c.pred === 'D';
                const fullPredText = isP ? 'DRAGON' : 'TIGER';
                const isLocked = this.activeLockedBet && this.activeLockedBet.pattern === c.rawName && this.activeLockedBet.pred === c.pred;
                const wr = getPatternWr(c.rawName);
                const wrLabel = wr === null ? '--%' : `${wr}%`;

                let baseClass = '';
                let textMain = '';
                let textSub = '';

                if (c.isGolden) {
                    baseClass = 'pred-card-gold';
                    textMain = 'text-white drop-shadow-[0_0_8px_rgba(0,0,0,0.8)]';
                    textSub = 'text-white/90 drop-shadow-md';

                    // --- VOICE SYNTHESIS ALERT ---
                    let currentId = this.history.length + "-" + c.pred;
                    if (this.lastSpokenId !== currentId) {
                        if (window.speechSynthesis && typeof SpeechSynthesisUtterance !== 'undefined') {
                            window.speechSynthesis.cancel(); // kill active speech to prevent overlap
                            const utterance = new SpeechSynthesisUtterance("Golden Bet. " + (isP ? "Dragon" : "Tiger"));
                            window.speechSynthesis.speak(utterance);
                        }
                        this.lastSpokenId = currentId;
                    }

                } else {
                    baseClass = isP ? 'pred-card-dragon' : 'pred-card-tiger';
                    textMain = 'text-white';
                    textSub = 'text-white/80';
                }

                const displayTitle = c.isGolden ? `GOLDEN BET: ${fullPredText}` : `BET ${fullPredText}`;

                const iconClass = isP ? 'fa-user-tie' : 'fa-crown';

                cardsHtml += `
                            <div class="pred-card ${baseClass} ${isLocked ? 'pred-card-locked' : ''} rounded-xl px-4 h-10 flex-1 flex flex-row items-center justify-center gap-3 cursor-pointer select-none max-w-[400px] min-w-[200px] transition-all duration-300" onclick="app.dragontiger.handleCardClick('${c.rawName}', '${c.pred}')">
                                ${isLocked ? '<i class="fas fa-check-circle absolute top-1.5 right-1.5 text-[#FFD60A] text-[11px] drop-shadow-md"></i>' : ''}
                                <i class="fas ${iconClass} text-lg opacity-90 text-white"></i>
                                <span class="text-xs font-black uppercase tracking-widest leading-none ${isLocked ? 'text-[#FFD60A] drop-shadow-[0_0_8px_rgba(255,214,10,0.8)]' : textMain} transition-colors whitespace-nowrap">${isLocked ? 'LOCKED ' : ''}${displayTitle}</span>
                                <span class="text-[9px] font-bold uppercase tracking-widest leading-none ${isLocked ? 'text-[#FFD60A]/90' : textSub} transition-colors whitespace-nowrap opacity-70">${c.name} [${wrLabel}]</span>
                            </div>
                        `;
            });
            cardsHtml += '</div>';
            statusArea.innerHTML = cardsHtml;
        }
    },

    detectPatterns(seq, context) {
        if (seq.length < 3) return [];
        const len = seq.length;
        const val = (i) => (i >= 0 && i < len) ? seq[i].val : null;
        const idx = (i) => (i >= 0 && i < len) ? seq[i].index : -1;
        let cands = [];

        const getStreak = (endIdx) => {
            if (endIdx < 0 || endIdx >= len) return 0;
            const baseVal = val(endIdx);
            if (baseVal === 'X' || baseVal === null) return 0;
            let count = 1;
            for (let i = endIdx - 1; i >= 0; i--) {
                if (val(i) === baseVal) count++; else break;
            }
            return count;
        };

        const getOpposite = (color) => color === 'D' ? 'T' : (color === 'T' ? 'D' : null);
        const isPure = (startIdx, patternColor) => {
            if (startIdx <= 0) return false;
            const valBefore = val(startIdx - 1);
            return valBefore === getOpposite(patternColor);
        };

        const end = len - 1;
        const pEnd = val(end);
        if (pEnd === 'X' || pEnd === null) return [];

        const s1 = getStreak(end);
        const midEnd = end - s1;
        const pMid = val(midEnd);
        const s2 = getStreak(midEnd);
        const firstEnd = midEnd - s2;
        const pFirst = val(firstEnd);
        const s3 = getStreak(firstEnd);

        if (s1 >= 4) cands.push({ pred: pEnd, name: `FLOW (${context})`, rawName: 'FLOW', indices: Array.from({ length: 4 }, (_, i) => idx(end - i)) });
        if (len >= 3 && val(end) !== 'X' && val(end - 1) !== 'X' && val(end - 2) !== 'X') {
            if (val(end) !== val(end - 1) && val(end - 1) !== val(end - 2)) {
                cands.push({ pred: pEnd === 'D' ? 'T' : 'D', name: `ZIG-ZAG (${context})`, rawName: 'ZIG-ZAG', indices: [idx(end), idx(end - 1), idx(end - 2)] });
            }
        }
        if (s1 === 1 && s2 >= 5 && pMid !== 'X') {
            let indices = [idx(end)];
            for (let i = 0; i < 5; i++) indices.push(idx(midEnd - i));
            cands.push({ pred: pMid, name: `FALSE BREAK (${context})`, rawName: 'FALSE BREAK', indices });
        }

        if (s1 === 2 && s2 === 2 && s3 === 1 && pMid !== 'X' && pFirst !== 'X' && pEnd !== pMid && pFirst === pEnd) {
            if (isPure(firstEnd - s3 + 1, pFirst)) cands.push({ pred: pEnd, name: `1-2-3 (${context})`, rawName: '1-2-3', indices: [idx(end), idx(end - 1), idx(midEnd), idx(midEnd - 1), idx(firstEnd)] });
        }
        if (s1 === 2 && s2 === 3 && pMid !== 'X' && pEnd !== pMid) {
            if (isPure(midEnd - s2 + 1, pMid)) cands.push({ pred: pMid, name: `3-2-1 (${context})`, rawName: '3-2-1', indices: [idx(end), idx(end - 1), idx(midEnd), idx(midEnd - 1), idx(midEnd - 2)] });
        }
        if (s1 === 2 && s2 === 1 && s3 === 1 && pMid !== 'X' && pFirst !== 'X' && pEnd !== pMid && pFirst === pEnd) {
            if (isPure(firstEnd - s3 + 1, pFirst)) cands.push({ pred: pEnd, name: `1-1-3 (${context})`, rawName: '1-1-3', indices: [idx(end), idx(end - 1), idx(midEnd), idx(firstEnd)] });
        }
        if (s1 === 1 && s2 === 3 && pMid !== 'X' && pEnd !== pMid) {
            if (isPure(midEnd - s2 + 1, pMid)) cands.push({ pred: pMid, name: `3-1-1 DOWN (${context})`, rawName: '3-1-1 DOWN', indices: [idx(end), idx(midEnd), idx(midEnd - 1), idx(midEnd - 2)] });
        }

        return cands;
    },

    // --- MODALS & RENDERERS ---


    renderFilters() {
        const container = document.getElementById('dt-filters-list');
        container.innerHTML = '';
        const patternNames = Object.keys(this.filters);
        const allChecked = patternNames.every(name => this.filters[name]);
        const colorMap = {
            'FLOW': 'text-cyan-300',
            'ZIG-ZAG': 'text-yellow-300',
            'FALSE BREAK': 'text-red-300',
            '1-2-3': 'text-emerald-300',
            '3-2-1': 'text-purple-300',
            '1-1-3': 'text-orange-300',
            '3-1-1 DOWN': 'text-pink-300'
        };

        let htmlBuilder = `
                    <label class="flex items-center gap-2 p-1.5 hover:bg-white/10 rounded-lg cursor-pointer transition-colors border-b border-white/10 mb-1">
                        <input type="checkbox" ${allChecked ? 'checked' : ''} onchange="app.dragontiger.toggleAllPatternFilters(this.checked)" class="filter-checkbox">
                        <span class="text-yellow-500 font-bold text-[10px] uppercase tracking-wider flex-1">SELECT ALL</span>
                    </label>
                `;

        patternNames.forEach(name => {
            const isActive = this.filters[name];
            const stats = this.patternStats[name] || { w: 0, l: 0 };
            const total = stats.w + stats.l;
            const wr = total > 0 ? Math.round((stats.w / total) * 100) : 0;
            const wrDisplay = `${wr}%`;
            const labelColor = colorMap[name] || 'text-white';

            htmlBuilder += `
                        <label class="flex items-center gap-2 p-1.5 hover:bg-gray-800 rounded cursor-pointer transition-colors">
                            <input type="checkbox" ${isActive ? 'checked' : ''} onchange="app.dragontiger.togglePatternFilter('${name}', this.checked)" class="filter-checkbox">
                            <span class="${labelColor} font-bold text-[10px] uppercase tracking-wider flex-1">${name} <span class="text-gray-500 ml-1">[${wrDisplay}]</span></span>
                        </label>
                    `;
        });

        container.innerHTML = htmlBuilder;
    },

    togglePatternFilter(name, isChecked) {
        this.filters[name] = isChecked;
        this.runEngine();
        this.renderFilters();
    },

    toggleAllPatternFilters(isChecked) {
        Object.keys(this.filters).forEach(name => {
            this.filters[name] = isChecked;
        });
        this.runEngine();
        this.renderFilters();
    },

    renderStats() {
        let totalHits = 0, totalMisses = 0, totalNet = 0;
        let bankroll = [0];

        this.history.forEach(h => {
            if (h.patternList && h.patternList.length > 0) {
                h.patternList.forEach(p => {
                    if (p.win) {
                        totalHits++;
                        totalNet += 1;
                    } else {
                        totalMisses++;
                        totalNet -= (p.tie ? 0.5 : 1);
                    }
                });
                bankroll.push(totalNet);
            }
        });

        const totalSignals = totalHits + totalMisses;
        const hitRate = totalSignals === 0 ? 0 : Math.round((totalHits / totalSignals) * 100);

        app.ui['kpi-hr'].innerText = hitRate + "%";
        app.ui['kpi-hr'].className = `text-2xl font-black ${hitRate >= 50 ? 'text-[#30D158]' : 'text-[#FFD60A]'}`;
        app.ui['kpi-signals'].innerText = totalSignals;
        document.getElementById('dt-kpi-hr').innerText = hitRate + "%";
        document.getElementById('dt-kpi-hr').className = `text-2xl font-black ${hitRate >= 50 ? 'text-[#30D158]' : 'text-[#FFD60A]'}`;
        document.getElementById('dt-kpi-signals').innerText = totalSignals;
        const netDisplay = (totalNet > 0 ? '+' : '') + (Number.isInteger(totalNet) ? totalNet : totalNet.toFixed(2));
        app.ui['kpi-net'].innerText = netDisplay;
        app.ui['kpi-net'].className = `text-2xl font-black ${totalNet >= 0 ? 'text-[#30D158]' : 'text-[#FFD60A]'}`;
        document.getElementById('dt-kpi-net').innerText = netDisplay;
        document.getElementById('dt-kpi-net').className = `text-2xl font-black ${totalNet >= 0 ? 'text-[#30D158]' : 'text-[#FFD60A]'}`;

        // Max Drawdown
        let peak = 0, maxDD = 0;
        bankroll.forEach(v => { if (v > peak) peak = v; const dd = peak - v; if (dd > maxDD) maxDD = dd; });
        const ddElOld = document.getElementById('kpi-dd');
        if (ddElOld) { ddElOld.innerText = maxDD > 0 ? '-' + (Number.isInteger(maxDD) ? maxDD : maxDD.toFixed(2)) : '0'; }
        const ddEl = document.getElementById('dt-kpi-dd');
        if (ddEl) { ddEl.innerText = maxDD > 0 ? '-' + (Number.isInteger(maxDD) ? maxDD : maxDD.toFixed(2)) : '0'; }

        app.ui['hud-w'].innerText = totalHits;
        app.ui['hud-h'].innerText = totalSignals;
        app.ui['hud-l'].innerText = totalMisses;
        document.getElementById('dt-hud-w').innerText = totalHits;
        document.getElementById('dt-hud-h').innerText = totalSignals;
        document.getElementById('dt-hud-l').innerText = totalMisses;

        // Always draw the trend graph (single-scroll view, no tabs)
        this.drawTrendGraph(bankroll, totalHits, totalMisses, 'graph-container', '#30D158', '#FFD60A', false);
        this.drawTrendGraph(bankroll, totalHits, totalMisses, 'dt-graph-container', '#30D158', '#FFD60A', false);

        const heatBody = document.getElementById('dt-heatmap-body') || document.getElementById('heatmap-body');
        if (heatBody) heatBody.innerHTML = '';
        const entries = Object.entries(this.patternStats);

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
                const color = wr >= 55 ? 'text-[#30D158]' : (wr <= 45 ? 'text-[#FFD60A]' : 'text-[#FFD60A]');

                htmlBuilder += `
                        <tr class="border-b border-white/10 hover:bg-white/5 transition-colors">
                            <td class="p-3">
                                <div class="flex items-center justify-between">
                                    <span class="font-bold text-gray-300">${name}</span>
                                    <button onclick="app.dragontiger.viewPatternLog('${name}')" class="ml-2 w-6 h-6 flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 rounded text-[10px] text-blue-400 transition-colors" title="View Log"><i class="fas fa-list-ul"></i></button>
                                </div>
                            </td>
                            <td class="p-3 text-right text-sm text-white/60 font-mono">${total}</td>
                            <td class="p-3 text-right text-sm text-[#30D158] font-bold">${s.w}</td>
                            <td class="p-3 text-right font-bold text-sm ${color}">${wr}%</td>
                        </tr>
                    `;
            });
            heatBody.innerHTML += htmlBuilder;
        }

        // --- RENDER GOLDEN BETS TAB DATA ---
        this.renderGoldenStats();
    },

    renderGoldenStats() {
        let goldenNet = 0, goldenHits = 0, goldenLosses = 0;
        let goldenBankroll = [0];
        let peak = 0, maxDrawdown = 0;

        const ledgerBody = document.getElementById('dt-golden-ledger-body') || document.getElementById('golden-ledger-body');
        if (ledgerBody) ledgerBody.innerHTML = '';

        let htmlBuilder = '';
        [...this.goldenBetsHistory].reverse().forEach((bet) => {
            let netColor = bet.net > 0 ? 'text-[#30D158]' : (bet.net < 0 ? 'text-[#FFD60A]' : 'text-white/50');
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

        if (this.goldenBetsHistory.length === 0) {
            ledgerBody.innerHTML = '<tr><td colspan="4" class="p-8 text-center text-[#FFD60A]/40 italic text-xs uppercase tracking-widest">No Golden Bets found yet</td></tr>';
        }

        this.goldenBetsHistory.forEach(bet => {
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

        app.ui['golden-kpi-hr'].innerText = goldenHr + "%";
        app.ui['golden-kpi-hr'].className = `text-xl font-black ${goldenHr >= 50 ? 'text-[#30D158]' : (totalGolden === 0 ? 'text-white' : 'text-[#FFD60A]')}`;
        document.getElementById('dt-golden-kpi-hr').innerText = goldenHr + "%";
        document.getElementById('dt-golden-kpi-hr').className = `text-xl font-black ${goldenHr >= 50 ? 'text-[#30D158]' : (totalGolden === 0 ? 'text-white' : 'text-[#FFD60A]')}`;

        const netDisplay = (goldenNet > 0 ? '+' : '') + (Number.isInteger(goldenNet) ? goldenNet : goldenNet.toFixed(2));
        app.ui['golden-kpi-net'].innerText = netDisplay;
        app.ui['golden-kpi-net'].className = `text-xl font-black ${goldenNet >= 0 ? (goldenNet === 0 ? 'text-white' : 'text-[#FFD60A]') : 'text-[#FFD60A]'}`;
        document.getElementById('dt-golden-kpi-net').innerText = netDisplay;
        document.getElementById('dt-golden-kpi-net').className = `text-xl font-black ${goldenNet >= 0 ? (goldenNet === 0 ? 'text-white' : 'text-[#FFD60A]') : 'text-[#FFD60A]'}`;

        app.ui['golden-kpi-opps'].innerText = this.goldenBetsHistory.length;
        app.ui['golden-kpi-dd'].innerText = (Number.isInteger(maxDrawdown) ? maxDrawdown : maxDrawdown.toFixed(2));
        document.getElementById('dt-golden-kpi-opps').innerText = this.goldenBetsHistory.length;
        document.getElementById('dt-golden-kpi-dd').innerText = (Number.isInteger(maxDrawdown) ? maxDrawdown : maxDrawdown.toFixed(2));

        // Always draw the golden graph (single-scroll view, no tabs)
        this.drawTrendGraph(goldenBankroll, goldenHits, goldenLosses, 'golden-graph-container', '#FFD60A', '#FFD60A', false, true);
        this.drawTrendGraph(goldenBankroll, goldenHits, goldenLosses, 'dt-golden-graph-container', '#FFD60A', '#FFD60A', false, true);
    },

    viewPatternLog(name) {
        const modal = document.getElementById('dt-patternLogModal');
        const title = document.getElementById('dt-pl-title');
        const body = document.getElementById('dt-pl-body');

        title.innerText = `${name} — Full History`;
        body.innerHTML = '';

        const logs = [];
        for (let i = this.history.length - 1; i >= 0; i--) {
            const h = this.history[i];
            if (!h.patternList) continue;
            h.patternList.filter(p => p.name === name).forEach(p => {
                logs.push({ hand: h.handNumber || (i + 1), pred: p.pred, actual: h.val, outcome: p.win ? 'WIN' : 'LOSS' });
            });
        }

        if (logs.length === 0) {
            body.innerHTML = '<tr><td colspan="3" class="p-4 text-center text-gray-500 text-xs italic">No history found</td></tr>';
        } else {
            let html = '';
            logs.forEach(log => {
                const color = log.outcome === 'WIN' ? 'text-green-400' : 'text-red-400';
                html += `<tr class="border-b border-white/10"><td class="p-2 text-gray-500 text-xs">#${log.hand}</td><td class="p-2 text-gray-300 font-bold text-xs">${log.pred} <span class="text-[9px] text-gray-500 font-normal">→ ${log.actual}</span></td><td class="p-2 text-right font-bold text-xs ${color}">${log.outcome}</td></tr>`;
            });
            body.innerHTML = html;
        }
        modal.style.display = 'flex';
    },

    closePatternLog() {
        document.getElementById('dt-patternLogModal').style.display = 'none';
    },

    // --- PREDICTION LOGS RENDERER ---
    renderLogs() {
        const ledgerBody = document.getElementById('dt-log-ledger-body');

        this.renderedLogCount = this.renderedLogCount || 0;
        if (this.renderedLogCount === this.history.length && ledgerBody.children.length > 0) return;

        const isFullRender = this.renderedLogCount === 0 || this.history.length < this.renderedLogCount;
        if (isFullRender) {
            ledgerBody.innerHTML = '';
            this.renderedLogCount = 0;
        }

        const newItems = this.history.slice(this.renderedLogCount);
        if (newItems.length === 0) return;

        let hasLogs = !isFullRender;
        let htmlBuilder = '';

        [...newItems].reverse().forEach((h, reverseIndex) => {
            const handNum = this.history.length - reverseIndex;
            if (h.patternList && h.patternList.length > 0) {
                h.patternList.forEach(p => {
                    hasLogs = true;
                    let statusColor, statusText;

                    if (h.val === 'X') {
                        statusText = 'HALF LOSS';
                        statusColor = 'bg-[#FFD60A]/20 text-[#FFD60A] border-[#FFD60A]/30';
                    } else if (p.win) {
                        statusText = 'WIN';
                        statusColor = 'bg-[#30D158]/20 text-[#30D158] border-[#30D158]/30';
                    } else {
                        statusText = 'LOSS';
                        statusColor = 'bg-[#FFD60A]/20 text-[#FFD60A] border-[#FFD60A]/30';
                    }

                    const predColor = p.pred === 'D' ? 'text-[#FF453A]' : 'text-[#FFD60A]';

                    htmlBuilder += `
                                <tr class="hover:bg-white/5 transition-colors border-b border-[#32ADE6]/10 last:border-0">
                                    <td class="p-3 text-white/50 font-mono text-xs">#${handNum}</td>
                                    <td class="p-3 font-bold text-[#32ADE6] tracking-wider text-[10px]">${p.name}</td>
                                    <td class="p-3 text-center font-black ${predColor} text-sm">${p.pred}</td>
                                    <td class="p-3 text-center font-black text-white text-sm">${h.val}</td>
                                    <td class="p-3 text-right"><span class="px-2 py-1 rounded-md text-[9px] font-black tracking-widest border ${statusColor}">${statusText}</span></td>
                                </tr>
                            `;
                });
            }
        });

        if (isFullRender) {
            if (htmlBuilder !== '') ledgerBody.innerHTML = htmlBuilder;
            else ledgerBody.innerHTML = '<tr><td colspan="5" class="p-8 text-center text-[#32ADE6]/40 italic text-xs uppercase tracking-widest">No predictions recorded yet</td></tr>';
        } else if (htmlBuilder !== '') {
            ledgerBody.insertAdjacentHTML('afterbegin', htmlBuilder);
        }

        this.renderedLogCount = this.history.length;
    },

    // --- VAULT (MY BETS) RENDERER WITH PROGRESSION ---
    renderVault() {
        let actualNet = 0, actualHits = 0, actualLosses = 0;
        let bankroll = [0];
        let peak = 0, maxDrawdown = 0;

        const ledgerBody = document.getElementById('dt-vault-ledger-body') || document.getElementById('vault-ledger-body');

        let currentBet = 1;
        let seqIdx = 0;
        let stratEl = document.getElementById('dt-vault-strategy') || document.getElementById('vault-strategy');
        let strat = stratEl ? stratEl.value : 'flat';

        let calculatedBets = [];

        this.myBetsHistory.forEach((bet) => {
            const fallbackUnitNet = (bet.status === 'PUSH')
                ? 0
                : (bet.status === 'WIN' ? 1 : -1);
            const unitNet = Number.isFinite(bet.net) ? bet.net : fallbackUnitNet;
            const handNet = currentBet * unitNet;
            const isWin = handNet > 0;
            const isPush = handNet === 0;

            calculatedBets.push({ ...bet, currentBetU: currentBet, dynamicNet: handNet });

            const nxt = this.calculateProgression(isWin, isPush, currentBet, strat, seqIdx);
            currentBet = nxt.bet;
            seqIdx = nxt.seq;

            actualNet += handNet;
            if (isWin) actualHits++;
            if (handNet < 0) actualLosses++;
            bankroll.push(actualNet);

            if (actualNet > peak) peak = actualNet;
            let drawdown = actualNet - peak;
            if (drawdown < maxDrawdown) maxDrawdown = drawdown;
        });

        this.renderedVaultCount = this.renderedVaultCount || 0;
        const isFullRender = this.renderedVaultCount === 0 || calculatedBets.length < this.renderedVaultCount || this.lastVaultStrat !== strat;

        if (isFullRender) {
            ledgerBody.innerHTML = '';
            this.renderedVaultCount = 0;
        } else if (this.renderedVaultCount === calculatedBets.length) {
            // Skip DOM update if arrays match, but still update KPIs
        }

        if (this.renderedVaultCount < calculatedBets.length) {
            const newItems = calculatedBets.slice(this.renderedVaultCount);
            let htmlBuilder = '';

            [...newItems].reverse().forEach((bet) => {
                let netColor = bet.dynamicNet > 0 ? 'text-[#30D158]' : (bet.dynamicNet < 0 ? 'text-[#FFD60A]' : 'text-white/50');
                let netStr = (bet.dynamicNet > 0 ? '+' : '') + (Number.isInteger(bet.dynamicNet) ? bet.dynamicNet : bet.dynamicNet.toFixed(2));
                let statusColor = bet.status === 'WIN' ? 'bg-[#30D158]/20 text-[#30D158] border-[#30D158]/30' : (bet.status === 'LOSS' ? 'bg-[#FFD60A]/20 text-[#FFD60A] border-[#FFD60A]/30' : 'bg-white/10 text-white/70 border-white/20');
                let stratText = strat !== 'flat' && bet.dynamicNet !== 0 ? `<span class="block text-white/40 text-[7px] mt-0.5">Wager: ${bet.currentBetU}U</span>` : '';

                htmlBuilder += `
                            <tr class="hover:bg-white/5 transition-colors border-b border-[#FFD60A]/10 last:border-0">
                                <td class="p-3 text-white/50 font-mono text-xs">#${bet.handNum}</td>
                                <td class="p-3 font-bold text-[#FFD60A] tracking-wider text-[10px]">${bet.pattern}</td>
                                <td class="p-3 text-center font-black text-white text-sm">${bet.pred}</td>
                                <td class="p-3 text-center"><span class="px-2 py-1 rounded-md text-[9px] font-black tracking-widest border ${statusColor}">${bet.status}</span></td>
                                <td class="p-3 text-right font-black text-sm ${netColor} leading-tight">${netStr}${stratText}</td>
                            </tr>
                        `;
            });

            if (isFullRender) {
                if (htmlBuilder !== '') ledgerBody.innerHTML = htmlBuilder;
                else ledgerBody.innerHTML = '<tr><td colspan="5" class="p-8 text-center text-[#FFD60A]/40 italic text-xs uppercase tracking-widest">No bets committed yet</td></tr>';
            } else if (htmlBuilder !== '') {
                ledgerBody.insertAdjacentHTML('afterbegin', htmlBuilder);
            }
        }

        this.renderedVaultCount = calculatedBets.length;
        this.lastVaultStrat = strat;

        const totalResolved = actualHits + actualLosses;
        const actualHr = totalResolved === 0 ? 0 : Math.round((actualHits / totalResolved) * 100);

        document.getElementById('vault-kpi-hr').innerText = actualHr + "%";
        document.getElementById('vault-kpi-hr').className = `text-2xl font-black ${actualHr >= 50 ? 'text-[#30D158]' : (totalResolved === 0 ? 'text-white' : 'text-[#FFD60A]')}`;
        document.getElementById('dt-vault-kpi-hr').innerText = actualHr + "%";
        document.getElementById('dt-vault-kpi-hr').className = `text-2xl font-black ${actualHr >= 50 ? 'text-[#30D158]' : (totalResolved === 0 ? 'text-white' : 'text-[#FFD60A]')}`;

        const netDisplay = (actualNet > 0 ? '+' : '') + (Number.isInteger(actualNet) ? actualNet : actualNet.toFixed(2));
        document.getElementById('vault-kpi-net').innerText = netDisplay;
        document.getElementById('vault-kpi-net').className = `text-2xl font-black ${actualNet >= 0 ? (actualNet === 0 ? 'text-white' : 'text-[#30D158]') : 'text-[#FFD60A]'}`;
        document.getElementById('dt-vault-kpi-net').innerText = netDisplay;
        document.getElementById('dt-vault-kpi-net').className = `text-2xl font-black ${actualNet >= 0 ? (actualNet === 0 ? 'text-white' : 'text-[#30D158]') : 'text-[#FFD60A]'}`;

        document.getElementById('vault-kpi-opps').innerText = this.myBetsHistory.length;
        document.getElementById('vault-kpi-dd').innerText = (Number.isInteger(maxDrawdown) ? maxDrawdown : maxDrawdown.toFixed(2));
        document.getElementById('dt-vault-kpi-opps').innerText = this.myBetsHistory.length;
        document.getElementById('dt-vault-kpi-dd').innerText = (Number.isInteger(maxDrawdown) ? maxDrawdown : maxDrawdown.toFixed(2));

        this.drawTrendGraph(bankroll, actualHits, actualLosses, 'vault-graph-container', '#30D158', '#FFD60A', false);
        this.drawTrendGraph(bankroll, actualHits, actualLosses, 'dt-vault-graph-container', '#30D158', '#FFD60A', false);
    },

    // --- SIMULATION LAB LOGIC WITH PROGRESSION ---
    updateSim() {
        this.renderSimFilters();
        this.calculateBaccaratNet();

        let activeCount = Object.values(this.simFilters).filter(v => v).length;
        document.getElementById('dt-sim-active-text').innerText = `Simulating: ${activeCount} Pattern${activeCount === 1 ? '' : 's'}`;
    },

    renderSimFilters() {
        const container = document.getElementById('dt-sim-filters-list');
        container.innerHTML = '';
        const patternNames = Object.keys(this.simFilters);

        let htmlBuilder = '';
        patternNames.forEach(name => {
            const isActive = this.simFilters[name];

            // Add real overall efficiency metrics so user knows what to filter
            const stats = this.patternStats[name] || { w: 0, l: 0 };
            const total = stats.w + stats.l;
            const wr = total > 0 ? Math.round((stats.w / total) * 100) : 0;
            const color = wr >= 55 ? 'text-[#30D158]' : (wr > 0 && wr <= 45 ? 'text-[#FFD60A]' : (total > 0 ? 'text-[#FFD60A]' : 'text-[#BF5AF2]/40'));
            const wrDisplay = total > 0 ? `${wr}%` : '--%';

            htmlBuilder += `
                        <label class="flex items-center justify-between p-2.5 bg-[#BF5AF2]/5 rounded-xl border border-[#BF5AF2]/20 cursor-pointer hover:bg-[#BF5AF2]/10 transition-colors">
                            <div class="flex flex-col">
                                <span class="text-[10px] font-black text-[#E0B0FF] uppercase tracking-wider">${name}</span>
                                <span class="text-[8px] font-bold uppercase tracking-widest mt-0.5 ${color}">Win Rate: ${wrDisplay} <span class="text-[#BF5AF2]/40 lowercase font-normal ml-1">(${total} hits)</span></span>
                            </div>
                            <div class="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" ${isActive ? 'checked' : ''} onchange="app.dragontiger.toggleSimFilter('${name}', this.checked)" class="sr-only peer neon-toggle">
                                <div class="w-8 h-4 bg-black/80 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all shadow-inner border border-[#BF5AF2]/30"></div>
                            </div>
                        </label>
                    `;
        });
        container.innerHTML = htmlBuilder;
    },

    toggleSimFilter(name, isChecked) {
        this.simFilters[name] = isChecked;
        this.calculateBaccaratNet();
        let activeCount = Object.values(this.simFilters).filter(v => v).length;
        document.getElementById('dt-sim-active-text').innerText = `Simulating: ${activeCount} Pattern${activeCount === 1 ? '' : 's'}`;
    },

    calculateBaccaratNet() {
        let simHits = 0, simMisses = 0, simNet = 0;
        let simBankroll = [0];
        let peak = 0;
        let maxDrawdown = 0;

        let currentBet = 1;
        let seqIdx = 0;
        let strat = document.getElementById('dt-sim-strategy').value;

        let simStats = {};
        Object.keys(this.simFilters).forEach(k => simStats[k] = { w: 0, l: 0 });

        const simIgnoreTies = document.getElementById('dt-sim-toggle-ties').checked;
        const fullHistory = this.history.map((h, i) => ({ val: h.val, index: i }));

        let simFiredSignals = {}; // For one-shot patterns in Sim

        let retroHistory = [];
        fullHistory.forEach((step, index) => {
            const currentSeq = simIgnoreTies ? retroHistory.filter(h => h.val !== 'X') : [...retroHistory];

            if (currentSeq.length >= 3 && step.val !== 'X') {
                let vCands = this.detectPatterns(currentSeq, "Vertical");

                const rows = 6;
                const nextRowIdx = index % rows;
                const rowSeq = currentSeq.filter(h => h.index % rows === nextRowIdx);
                let hCands = this.detectPatterns(rowSeq, `Horizontal`);
                let cands = [...vCands, ...hCands];

                const activeCands = cands.filter(c => this.simFilters[c.rawName] !== false);

                let uniqueActive = [];
                const seen = new Set();
                activeCands.forEach(c => {
                    const key = `${c.pred}-${c.name}`;
                    if (!seen.has(key)) { seen.add(key); uniqueActive.push(c); }
                });

                // ONE-SHOT SUPPRESSION (Flow & Zig-Zag) for Sim
                const oneShotPatterns = new Set(['FLOW', 'ZIG-ZAG']);
                const getOneShotKey = (cand) => `${cand.rawName}|${cand.name.includes('Horizontal') ? 'H' : 'V'}`;
                const detectedOneShotKeys = new Set(
                    uniqueActive
                        .filter(c => oneShotPatterns.has(c.rawName))
                        .map(c => getOneShotKey(c))
                );

                Object.keys(simFiredSignals).forEach(name => {
                    if (!detectedOneShotKeys.has(name)) {
                        delete simFiredSignals[name];
                    }
                });

                uniqueActive = uniqueActive.filter(c => {
                    if (!oneShotPatterns.has(c.rawName)) return true;
                    const oneShotKey = getOneShotKey(c);
                    if (simFiredSignals[oneShotKey]) return false;
                    simFiredSignals[oneShotKey] = true;
                    return true;
                });

                // GOLDEN BET CONVERGENCE LOGIC for Sim
                const grouped = { 'D': [], 'T': [], 'X': [] };
                uniqueActive.forEach(c => grouped[c.pred].push(c));

                const newVisibleCands = [];
                for (const pred in grouped) {
                    const group = grouped[pred];
                    if (group.length >= 2) {
                        const mergedName = group.map(g => g.rawName).join(' + ');
                        newVisibleCands.push({
                            pred: pred,
                            name: mergedName,
                            rawName: mergedName,
                            isGolden: true
                        });
                    } else if (group.length === 1) {
                        newVisibleCands.push(group[0]);
                    }
                }
                uniqueActive = newVisibleCands;

                if (uniqueActive.length > 0) {
                    let handNet = 0;
                    uniqueActive.forEach(cand => {
                        if (!simStats[cand.rawName]) simStats[cand.rawName] = { w: 0, l: 0 };
                        if (cand.pred === step.val) {
                            simHits++;
                            handNet += currentBet;
                            simStats[cand.rawName].w++;
                        } else if (step.val === 'X') {
                            // Dragon Tiger tie settles at half-loss for non-tie bets.
                            simMisses++;
                            handNet -= currentBet * 0.5;
                            simStats[cand.rawName].l++;
                        } else {
                            simMisses++;
                            handNet -= currentBet;
                            simStats[cand.rawName].l++;
                        }
                    });

                    simNet += handNet;

                    // Advance progression based on the overall net of the hand.
                    let progWin = handNet > 0;
                    const isPush = handNet === 0;
                    const nxt = this.calculateProgression(progWin, isPush, currentBet, strat, seqIdx);
                    currentBet = nxt.bet;
                    seqIdx = nxt.seq;

                    simBankroll.push(simNet);
                    if (simNet > peak) peak = simNet;
                    let drawdown = simNet - peak;
                    if (drawdown < maxDrawdown) maxDrawdown = drawdown;
                }
            }
            retroHistory.push(step);
        });

        const simTotal = simHits + simMisses;
        const simHr = simTotal === 0 ? 0 : Math.round((simHits / simTotal) * 100);

        document.getElementById('dt-sim-kpi-hr').innerText = simHr + "%";
        document.getElementById('dt-sim-kpi-hr').className = `text-2xl font-black ${simHr >= 50 ? 'text-[#30D158]' : (simTotal === 0 ? 'text-white' : 'text-[#FFD60A]')}`;

        const simNetDisplay = (simNet > 0 ? '+' : '') + (Number.isInteger(simNet) ? simNet : simNet.toFixed(2));
        document.getElementById('dt-sim-kpi-net').innerText = simNetDisplay;
        document.getElementById('dt-sim-kpi-net').className = `text-2xl font-black ${simNet >= 0 ? (simNet === 0 ? 'text-white' : 'text-[#30D158]') : 'text-[#FFD60A]'}`;

        document.getElementById('dt-sim-kpi-opps').innerText = simTotal;

        const ddDisplay = (Number.isInteger(maxDrawdown) ? maxDrawdown : maxDrawdown.toFixed(2));
        document.getElementById('dt-sim-kpi-dd').innerText = ddDisplay;

        document.getElementById('dt-sim-hud-w').innerText = simHits;
        document.getElementById('dt-sim-hud-h').innerText = simTotal;
        document.getElementById('dt-sim-hud-l').innerText = simMisses;

        this.drawTrendGraph(simBankroll, simHits, simMisses, 'dt-sim-graph-container', '#BF5AF2', '#BF5AF2', true);

        const heatBody = document.getElementById('dt-sim-heatmap-body');
        heatBody.innerHTML = '';
        const entries = Object.entries(simStats);

        if (simTotal === 0) {
            heatBody.innerHTML = '<tr><td colspan="4" class="p-8 text-center text-[#BF5AF2]/40 italic text-sm uppercase tracking-widest">No valid simulated data</td></tr>';
        } else {
            entries.sort((a, b) => {
                const rA = (a[1].w + a[1].l) > 0 ? a[1].w / (a[1].w + a[1].l) : 0;
                const rB = (b[1].w + b[1].l) > 0 ? b[1].w / (b[1].w + b[1].l) : 0;
                return rB - rA;
            });

            entries.forEach(([name, s]) => {
                const total = s.w + s.l;
                if (total === 0) return;
                const wr = Math.round((s.w / total) * 100);
                const color = wr >= 55 ? 'text-[#BF5AF2]' : (wr <= 45 ? 'text-[#FFD60A]' : 'text-[#E0B0FF]');

                heatBody.innerHTML += `
                            <tr class="hover:bg-[#BF5AF2]/10 transition-colors group">
                                <td class="p-3 font-bold text-[#E0B0FF] tracking-wide">${name}</td>
                                <td class="p-3 text-center text-[#BF5AF2]/60 font-mono text-sm">${total}</td>
                                <td class="p-3 text-center text-[#BF5AF2] font-mono text-sm">${s.w}</td>
                                <td class="p-3 text-right font-black text-sm ${color} drop-shadow-[0_0_8px_currentColor]">${wr}%</td>
                            </tr>
                        `;
            });
        }
    },

};


// Mixin core routines
Object.assign(app.dragontiger, GameEngineCore);
