/**
 * Pure Math: Handles bet sizing strategies based on previous hand outcomes.
 */
export default class Progression {
    static calculate(isWin, isPush, currentBet, strategy, seqIndex) {
        if (isPush) return { bet: currentBet, seq: seqIndex };
        let nextBet = 1, nextSeq = 0;
        if (strategy === 'flat') {
            nextBet = 1;
        } else if (strategy === 'martingale') {
            nextBet = isWin ? 1 : currentBet * 2;
            if (nextBet > 512) nextBet = 1; // Safety cap
        } else if (strategy === 'paroli') {
            if (isWin) { nextBet = currentBet * 2; if (nextBet > 4) nextBet = 1; }
            else nextBet = 1;
        } else if (strategy === '1326') {
            const seq = [1, 3, 2, 6];
            if (isWin) { nextSeq = seqIndex + 1; if (nextSeq > 3) nextSeq = 0; }
            else nextSeq = 0;
            nextBet = seq[nextSeq];
        }
        return { bet: nextBet, seq: nextSeq };
    }
}