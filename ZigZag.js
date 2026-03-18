import { getStyle, getName } from '../PatternUtils.js';

export default class ZigZag {
    static check1to1(seq, categoryName, typeA, typeB) {
        const n = seq.length;
        if (n >= 4) {
            const s0 = seq[n - 4], s1 = seq[n - 3], s2 = seq[n - 2], s3 = seq[n - 1];
            const isChopStart = n === 4 || seq[n - 5] !== s1;
            if (s0 !== s1 && s1 !== s2 && s2 !== s3 && isChopStart) {
                const prediction = s3 === typeA ? typeB : typeA;
                return { category: categoryName, patternName: 'ZIG-ZAG', msg: `BET ${getName(categoryName, prediction)}`, sub: 'Chop Start', style: getStyle(prediction), targetToken: prediction };
            }
        }
        return null;
    }
    static check2to1(seq, categoryName) {
        const n = seq.length;
        if (n >= 4) {
            const last4 = seq.slice(-4);
            const isPure4 = n > 4 ? seq[n - 5] !== seq[n - 4] : true;
            if (isPure4 && last4[0] === last4[2] && last4[1] === last4[3] && last4[0] !== last4[1]) {
                if (n === 4 || seq[n - 5] !== last4[1]) return { category: categoryName, patternName: 'ZIG-ZAG', msg: `BET ${last4[0]}`, sub: 'Strict Chop', style: getStyle(last4[0]), targetToken: last4[0] };
            }
            else if (isPure4 && last4[0] === last4[2] && last4[1] !== last4[0] && last4[3] !== last4[0]) {
                return { category: categoryName, patternName: 'ZIG-ZAG', msg: `BET ${last4[0]}`, sub: 'Anchor Follow', style: getStyle(last4[0]), targetToken: last4[0] };
            }
        }
        return null;
    }
}