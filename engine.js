export default class DragonTigerEngine {
    constructor(state) {
        this.state = state;
    }

    processHand(result, ignoreTies) {
        let patternsResolved = [];
        let isGlobalWin = false;
        let goldenBetData = null;

        if (this.state.currentPrediction && this.state.currentPrediction.candidates) {
            const goldenCand = this.state.currentPrediction.candidates.find(c => c.isGolden);
            if (goldenCand) {
                const isTie = (result === 'X');
                const isWin = (goldenCand.pred === result);
                let net = isWin ? 1 : (isTie ? -0.5 : -1);
                goldenBetData = {
                    handNum: this.state.history.length + 1,
                    convergence: goldenCand.rawName, pred: goldenCand.pred,
                    result: result, status: isWin ? 'WIN' : 'LOSS', net: net
                };
                this.state.goldenBetsHistory.push(goldenBetData);
            }
        }

        const fullHistoryForStats = this.state.history.map((h, i) => ({ val: h.val, index: i }));
        const processSeqStats = ignoreTies ? fullHistoryForStats.filter(h => h.val !== 'X') : fullHistoryForStats;

        if (processSeqStats.length >= 3) {
            const isTieResult = result === 'X';
            let vCands = this.detectPatterns(processSeqStats, "Vertical");
            let hCands = this.detectPatterns(processSeqStats.filter(h => h.index % 6 === this.state.history.length % 6), "Horizontal");
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

        let myBetData = null;
        if (this.state.activeLockedBet) {
            const isTie = (result === 'X');
            const isWin = (this.state.activeLockedBet.pred === result);
            let net = -1; let status = 'LOSS';

            if (isWin) { net = 1; status = 'WIN'; }
            else if (isTie) { net = -0.5; }

            myBetData = {
                handNum: this.state.history.length + 1,
                pattern: this.state.activeLockedBet.pattern, pred: this.state.activeLockedBet.pred,
                result: result, status: status, net: net
            };
            this.state.myBetsHistory.push(myBetData);
            this.state.activeLockedBet = null; 
        }

        this.state.history.push({ val: result, isWin: isGlobalWin, patternList: patternsResolved, myBetResolved: myBetData !== null, goldenBetResolved: goldenBetData !== null });
        this.updateCounters(result, 1);
        
        return { isGlobalWin, goldenBetData, myBetData };
    }

    undo() {
        if (this.state.history.length === 0) return null;
        const last = this.state.history.pop();
        this.updateCounters(last.val, -1);
        if (last.patternList) last.patternList.forEach(p => this.updatePatternStats(p.name, p.win, 'remove'));

        if (last.myBetResolved) this.state.myBetsHistory.pop();
        if (last.goldenBetResolved) this.state.goldenBetsHistory.pop();

        this.state.activeLockedBet = null;
        this.state.lastSpokenId = null;
        this.state.firedSignals = {};
        return last;
    }

    updateCounters(res, delta) {
        if (res === 'D') this.state.stats.p += delta;
        if (res === 'T') this.state.stats.b += delta;
        if (res === 'X') this.state.stats.t += delta;
        this.state.stats.total += delta;
    }

    updatePatternStats(name, win, op) {
        if (!this.state.patternStats[name]) this.state.patternStats[name] = { w: 0, l: 0 };
        if (op === 'add') { if (win) this.state.patternStats[name].w++; else this.state.patternStats[name].l++; }
        else { if (win) this.state.patternStats[name].w--; else this.state.patternStats[name].l--; }
    }

    runPredictionScan(ignoreTies) {
        const fullHistory = this.state.history.map((h, i) => ({ val: h.val, index: i }));
        const processSeq = ignoreTies ? fullHistory.filter(h => h.val !== 'X') : fullHistory;

        if (processSeq.length < 3) {
            this.state.currentHighlightIndices = [];
            this.state.currentHighlightMap = new Map();
            this.state.currentPrediction = null;
            return;
        }

        let allCandidates = [];
        let vertCands = this.detectPatterns(processSeq, "Vertical");
        allCandidates.push(...vertCands);

        const rows = 6;
        const nextRowIdx = this.state.history.length % rows;
        const rowSequence = processSeq.filter(h => h.index % rows === nextRowIdx);

        let horizCands = this.detectPatterns(rowSequence, `Horizontal`);
        allCandidates.push(...horizCands);

        const uniqueCands = [];
        const seen = new Set();
        allCandidates.forEach(c => {
            const key = `${c.pred}-${c.name}`;
            if (!seen.has(key)) { seen.add(key); uniqueCands.push(c); }
        });

        let visibleCands = uniqueCands.filter(c => this.state.filters[c.rawName] !== false);

        const oneShotPatterns = new Set(['FLOW', 'ZIG-ZAG']);
        const getOneShotKey = (cand) => `${cand.rawName}|${cand.name.includes('Horizontal') ? 'H' : 'V'}`;
        const detectedOneShotKeys = new Set(visibleCands.filter(c => oneShotPatterns.has(c.rawName)).map(c => getOneShotKey(c)));

        Object.keys(this.state.firedSignals).forEach(name => {
            if (!detectedOneShotKeys.has(name)) delete this.state.firedSignals[name];
        });

        visibleCands = visibleCands.filter(c => {
            if (!oneShotPatterns.has(c.rawName)) return true;
            const oneShotKey = getOneShotKey(c);
            const isLockedOneShot = this.state.activeLockedBet && this.state.activeLockedBet.pattern === c.rawName && this.state.activeLockedBet.pred === c.pred;
            if (this.state.firedSignals[oneShotKey] && !isLockedOneShot) return false;
            if (!this.state.firedSignals[oneShotKey]) this.state.firedSignals[oneShotKey] = true;
            return true;
        });

        const grouped = { 'D': [], 'T': [], 'X': [] };
        visibleCands.forEach(c => grouped[c.pred].push(c));

        const newVisibleCands = [];
        for (const pred in grouped) {
            const group = grouped[pred];
            if (group.length >= 2) {
                newVisibleCands.push({
                    pred: pred, name: group.map(g => g.rawName).join(' + '), rawName: group.map(g => g.rawName).join(' + '),
                    indices: [...new Set(group.flatMap(g => g.indices))], isGolden: true
                });
            } else if (group.length === 1) {
                newVisibleCands.push(group[0]);
            }
        }
        visibleCands = newVisibleCands;

        visibleCands.sort((a, b) => {
            if (a.isGolden && !b.isGolden) return -1;
            if (!a.isGolden && b.isGolden) return 1;
            const getWr = (rawName) => {
                const s = this.state.patternStats[rawName] || { w: 0, l: 0 };
                return (s.w + s.l) > 0 ? (s.w / (s.w + s.l)) : 0;
            };
            return getWr(b.rawName) - getWr(a.rawName);
        });

        this.state.currentPrediction = { candidates: visibleCands };
        this.state.currentHighlightIndices = [...new Set(visibleCands.flatMap(a => a.indices))];
        this.state.currentHighlightMap = new Map();
        visibleCands.forEach(c => c.indices.forEach(idx => this.state.currentHighlightMap.set(idx, 'signal')));
    }

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
            for (let i = endIdx - 1; i >= 0; i--) { if (val(i) === baseVal) count++; else break; }
            return count;
        };

        const isPure = (startIdx, patternColor) => {
            if (startIdx <= 0) return false;
            return val(startIdx - 1) === (patternColor === 'D' ? 'T' : (patternColor === 'T' ? 'D' : null));
        };

        const end = len - 1;
        const pEnd = val(end);
        if (pEnd === 'X' || pEnd === null) return [];

        const s1 = getStreak(end), midEnd = end - s1, pMid = val(midEnd), s2 = getStreak(midEnd);
        const firstEnd = midEnd - s2, pFirst = val(firstEnd), s3 = getStreak(firstEnd);

        if (s1 >= 4) cands.push({ pred: pEnd, name: `FLOW (${context})`, rawName: 'FLOW', indices: Array.from({ length: 4 }, (_, i) => idx(end - i)) });
        if (len >= 3 && val(end) !== 'X' && val(end - 1) !== 'X' && val(end - 2) !== 'X') {
            if (val(end) !== val(end - 1) && val(end - 1) !== val(end - 2)) cands.push({ pred: pEnd === 'D' ? 'T' : 'D', name: `ZIG-ZAG (${context})`, rawName: 'ZIG-ZAG', indices: [idx(end), idx(end - 1), idx(end - 2)] });
        }
        if (s1 === 1 && s2 >= 5 && pMid !== 'X') cands.push({ pred: pMid, name: `FALSE BREAK (${context})`, rawName: 'FALSE BREAK', indices: [idx(end), ...Array.from({ length: 5 }, (_, i) => idx(midEnd - i))] });
        if (s1 === 2 && s2 === 2 && s3 === 1 && pMid !== 'X' && pFirst !== 'X' && pEnd !== pMid && pFirst === pEnd) { if (isPure(firstEnd - s3 + 1, pFirst)) cands.push({ pred: pEnd, name: `1-2-3 (${context})`, rawName: '1-2-3', indices: [idx(end), idx(end - 1), idx(midEnd), idx(midEnd - 1), idx(firstEnd)] }); }
        if (s1 === 2 && s2 === 3 && pMid !== 'X' && pEnd !== pMid) { if (isPure(midEnd - s2 + 1, pMid)) cands.push({ pred: pMid, name: `3-2-1 (${context})`, rawName: '3-2-1', indices: [idx(end), idx(end - 1), idx(midEnd), idx(midEnd - 1), idx(midEnd - 2)] }); }
        if (s1 === 2 && s2 === 1 && s3 === 1 && pMid !== 'X' && pFirst !== 'X' && pEnd !== pMid && pFirst === pEnd) { if (isPure(firstEnd - s3 + 1, pFirst)) cands.push({ pred: pEnd, name: `1-1-3 (${context})`, rawName: '1-1-3', indices: [idx(end), idx(end - 1), idx(midEnd), idx(firstEnd)] }); }
        if (s1 === 1 && s2 === 3 && pMid !== 'X' && pEnd !== pMid) { if (isPure(midEnd - s2 + 1, pMid)) cands.push({ pred: pMid, name: `3-1-1 DOWN (${context})`, rawName: '3-1-1 DOWN', indices: [idx(end), idx(midEnd), idx(midEnd - 1), idx(midEnd - 2)] }); }

        return cands;
    }
}