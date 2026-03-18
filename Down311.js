import { getStyle, getName } from '../PatternUtils.js';

export default class Down311 {
    static check1to1(seq, categoryName, typeA, typeB) {
        const n = seq.length;
        if (n >= 5) {
            const s0 = seq[n - 5], s1 = seq[n - 4], s2 = seq[n - 3], s3 = seq[n - 2], s4 = seq[n - 1];
            if (s0 !== s1 && s1 === s2 && s2 === s3 && s3 !== s4) return { category: categoryName, patternName: '3-1-1 DOWN', msg: `BET ${getName(categoryName, s1)}`, sub: 'Momentum Death', style: getStyle(s1), targetToken: s1 };
        }
        return null;
    }
    static check2to1(seq, categoryName) {
        const n = seq.length;
        if (n >= 4) {
            const last4 = seq.slice(-4);
            if ((n > 4 ? seq[n - 5] !== seq[n - 4] : true) && last4[0] === last4[1] && last4[1] === last4[2] && last4[2] !== last4[3])
                return { category: categoryName, patternName: '3-1-1 DOWN', msg: `BET ${last4[2]}`, sub: 'Streak Return', style: getStyle(last4[2]), targetToken: last4[2] };
        }
        return null;
    }
}