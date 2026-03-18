import PatternScanner from './PatternScanner.js';
import ConvergenceCalc from './ConvergenceCalc.js';
import Progression from './Progression.js';

/**
 * Pure Math: Processes the retroactive sandbox analysis.
 */
export default class Simulator {
    static run(state, strategy, ignoreTies) {
        let simHits = 0, simMisses = 0, simNet = 0, peak = 0, maxDrawdown = 0;
        let simBankroll = [0], currentBet = 1, seqIdx = 0;
        let simStats = {};
        Object.keys(state.simFilters).forEach(k => simStats[k] = { w: 0, l: 0 });

        const fullHistory = state.history.map((h, i) => ({ val: h.val, index: i }));
        let simFiredSignals = {}, retroHistory = [];

        fullHistory.forEach((step, index) => {
            const currentSeq = ignoreTies ? retroHistory.filter(h => h.val !== 'T') : [...retroHistory];
            if (currentSeq.length >= 3 && step.val !== 'T') {
                let vCands = PatternScanner.scan(currentSeq, "Vertical");
                const rows = 6, nextRowIdx = index % rows;
                const rowSeq = currentSeq.filter(h => h.index % rows === nextRowIdx);
                let hCands = PatternScanner.scan(rowSeq, `Horizontal`);
                
                let activeCands = [...vCands, ...hCands].filter(c => state.simFilters[c.rawName] !== false);
                let uniqueActive = [];
                const seen = new Set();
                activeCands.forEach(c => { const key = `${c.pred}-${c.name}`; if (!seen.has(key)) { seen.add(key); uniqueActive.push(c); } });

                const oneShotPatterns = new Set(['FLOW', 'ZIG-ZAG']);
                const getOneShotKey = (cand) => `${cand.rawName}|${cand.name.includes('Horizontal') ? 'H' : 'V'}`;
                const detectedOneShotKeys = new Set(uniqueActive.filter(c => oneShotPatterns.has(c.rawName)).map(getOneShotKey));
                Object.keys(simFiredSignals).forEach(name => { if (!detectedOneShotKeys.has(name)) delete simFiredSignals[name]; });
                uniqueActive = uniqueActive.filter(c => {
                    if (!oneShotPatterns.has(c.rawName)) return true;
                    const oneShotKey = getOneShotKey(c);
                    if (simFiredSignals[oneShotKey]) return false;
                    simFiredSignals[oneShotKey] = true; return true;
                });

                uniqueActive = ConvergenceCalc.calculate(uniqueActive);

                if (uniqueActive.length > 0) {
                    const isPush = step.val === 'T'; let handNet = 0;
                    if (!isPush) {
                        uniqueActive.forEach(cand => {
                            if (!simStats[cand.rawName]) simStats[cand.rawName] = { w: 0, l: 0 };
                            if (cand.pred === step.val) { simHits++; handNet += currentBet * ((cand.pred === 'B') ? 0.95 : 1); simStats[cand.rawName].w++; } 
                            else { simMisses++; handNet -= currentBet; simStats[cand.rawName].l++; }
                        });
                        simNet += handNet; let progWin = handNet > 0;
                        const nxt = Progression.calculate(progWin, isPush, currentBet, strategy, seqIdx);
                        currentBet = nxt.bet; seqIdx = nxt.seq;
                    }
                    simBankroll.push(simNet); if (simNet > peak) peak = simNet; let drawdown = simNet - peak; if (drawdown < maxDrawdown) maxDrawdown = drawdown;
                }
            } retroHistory.push(step); });
        return { simHits, simMisses, simNet, simBankroll, maxDrawdown, simStats }; }}