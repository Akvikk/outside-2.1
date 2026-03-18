import { getStyle, getName } from '../PatternUtils.js';

export default class FalseBreak {
    static check1to1(seq, categoryName, typeA, typeB) {
        const n = seq.length;
        if (n >= 6) {
            const streakType = seq[n - 1] === typeA ? typeB : typeA;
            if (seq[n - 2] === streakType && seq[n - 3] === streakType && seq[n - 4] === streakType && seq[n - 5] === streakType && seq[n - 6] === streakType) {
                return { category: categoryName, patternName: 'FALSE BREAK', msg: `BET ${getName(categoryName, streakType)}`, sub: 'Trend Return', style: getStyle(streakType), targetToken: streakType };
            }
        }
        return null;
    }
    static check2to1(seq, categoryName) {
        const n = seq.length;
        if (n >= 5) {
            const last5 = seq.slice(-5);
            if ((n > 5 ? seq[n - 6] !== seq[n - 5] : true) && last5[0] === last5[1] && last5[1] === last5[2] && last5[2] === last5[3] && last5[4] !== last5[0]) {
                return { category: categoryName, patternName: 'FALSE BREAK', msg: `BET ${last5[0]}`, sub: 'Return Trend', style: getStyle(last5[0]), targetToken: last5[0] };
            }
        }
        return null;
    }
}