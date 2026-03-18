export default class Burst113 {
    static check1to1(seq, categoryName, typeA, typeB) {
        const n = seq.length;
        if (n >= 5) {
            const s0 = seq[n - 5], s1 = seq[n - 4], s2 = seq[n - 3], s3 = seq[n - 2], s4 = seq[n - 1];
            if (s0 !== s1 && s1 !== s2 && s2 !== s3 && s3 === s4) return { category: categoryName, patternName: '1-1-3 BURST', sub: 'Momentum Explosion', targetToken: s4 };
        }
        return null;
    }
    static check2to1(seq, categoryName) {
        const n = seq.length;
        if (n >= 5) {
            const last5 = seq.slice(-5);
            if ((n > 5 ? seq[n - 6] !== seq[n - 5] : true) && last5[0] === last5[4] && last5[1] === last5[2] && last5[2] === last5[3] && last5[0] !== last5[1]) return { category: categoryName, patternName: '1-1-3 BURST', sub: 'Burst Follow', targetToken: last5[1] };
        }
        return null;
    }
}