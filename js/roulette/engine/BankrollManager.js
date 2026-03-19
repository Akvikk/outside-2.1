export default class BankrollManager {
    static isBetWin(spin, category, target) {
        if (category === 'Color') return spin.color === target;
        if (category === 'High/Low') return spin.hl === target;
        if (category === 'Odd/Even') {
            const type = spin.oe === 'Odd' ? 'O' : (spin.oe === 'Even' ? 'E' : 'Z');
            return type === target;
        }
        if (category === 'Dozens') return spin.doz === target;
        if (category === 'Columns') return spin.col === target;
        return false;
    }

    static updateStatObj(stats, bet, result) {
        const isWin = result === 'WIN';
        const winReward = (bet.category === 'Dozens' || bet.category === 'Columns') ? 2 : 1;

        if (isWin) {
            stats.totalWins++; stats.netUnits += winReward;
            if (stats.currentStreak >= 0) stats.currentStreak++; else stats.currentStreak = 1;
        } else {
            stats.totalLosses++; stats.netUnits -= 1;
            if (stats.currentStreak <= 0) stats.currentStreak--; else stats.currentStreak = -1;
        }
        stats.bankrollHistory.push(stats.netUnits);
        
        if (!stats.patternStats[bet.pattern]) stats.patternStats[bet.pattern] = { w: 0, l: 0 };
        if (isWin) stats.patternStats[bet.pattern].w++; else stats.patternStats[bet.pattern].l++;

        if (!stats.targetStats) stats.targetStats = {};
        if (!stats.targetStats[bet.target]) stats.targetStats[bet.target] = { w: 0, l: 0 };
        if (isWin) stats.targetStats[bet.target].w++; else stats.targetStats[bet.target].l++;

        if (!stats.categoryStats) stats.categoryStats = {};
        if (!stats.categoryStats[bet.category]) stats.categoryStats[bet.category] = { w: 0, l: 0 };
        if (isWin) stats.categoryStats[bet.category].w++; else stats.categoryStats[bet.category].l++;
    }

    static calculatePerimeterStats(state) {
        const limit = state.perimeterLimit || 14;
        const subset = state.history.slice(-limit);
        const stats = {};

        subset.forEach(spin => {
            if (!spin.bets) return;
            spin.bets.forEach(bet => {
                const isWin = this.isBetWin(spin, bet.category, bet.target);
                const compositeKey = `${bet.pattern} [${bet.category}]`;
                if (!stats[compositeKey]) {
                    stats[compositeKey] = { w: 0, l: 0, rate: 0 };
                }
                if (isWin) stats[compositeKey].w++;
                else stats[compositeKey].l++;
            });
        });
        for (const pattern in stats) {
            const total = stats[pattern].w + stats[pattern].l;
            stats[pattern].rate = total > 0 ? Math.round((stats[pattern].w / total) * 100) : 0;
        }
        return stats;
    }

    static resolveBackgroundBets(state, spinObj) {
        state.backgroundBets.forEach(bet => {
            const isWin = this.isBetWin(spinObj, bet.category, bet.target);
            const result = isWin ? 'WIN' : 'LOSS';
            this.updateStatObj(state.engineStatsMaster, bet, result);
            if (['Color', 'High/Low', 'Odd/Even'].includes(bet.category)) this.updateStatObj(state.engineStats1to1, bet, result);
            else if (['Dozens', 'Columns'].includes(bet.category)) this.updateStatObj(state.engineStats2to1, bet, result);
        });
    }

    static resolveUserBets(state, spinObj) {
        let spinWins = 0, spinLosses = 0;
        state.pendingBets.filter(b => b.confirmed).forEach(bet => {
            const isWin = this.isBetWin(spinObj, bet.category, bet.target);
            if (isWin) spinWins++; else spinLosses++;
            const result = isWin ? 'WIN' : 'LOSS';
            const winReward = (bet.category === 'Dozens' || bet.category === 'Columns') ? 2 : 1;
            state.userStats.totalBets++;
            if (isWin) { state.userStats.totalWins++; state.userStats.netUnits += winReward; if (state.userStats.currentStreak >= 0) state.userStats.currentStreak++; else state.userStats.currentStreak = 1; }
            else { state.userStats.totalLosses++; state.userStats.netUnits -= 1; if (state.userStats.currentStreak <= 0) state.userStats.currentStreak--; else state.userStats.currentStreak = -1; }
            state.userStats.bankrollHistory.push(state.userStats.netUnits);
            state.confirmedBetLog.unshift({ betNumber: state.userStats.totalBets, pattern: bet.pattern, category: bet.category || 'Unknown', target: bet.target, resultSpin: spinObj.val, outcome: result });
        });
        return { wins: spinWins, losses: spinLosses };
    }
}