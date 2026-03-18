export default class Build123 {
    static check1to1(seq, categoryName, typeA, typeB) {
        const n = seq.length;
        if (n >= 6) {
            const s0 = seq[n - 6], s1 = seq[n - 5], s2 = seq[n - 4], s3 = seq[n - 3], s4 = seq[n - 2], s5 = seq[n - 1];
            if (s0 !== s1 && s1 !== s2 && s2 === s3 && s3 !== s4 && s4 === s5) return { category: categoryName, patternName: '1-2-3 BUILD', sub: 'Staircase Build', targetToken: s5 };
        }
        return null;
    }
    static check2to1(seq, categoryName) {
        const n = seq.length;
        if (n >= 4) {
            const last4 = seq.slice(-4);
            if ((n > 4 ? seq[n - 5] !== seq[n - 4] : true) && last4[0] === last4[2] && last4[2] === last4[3] && last4[1] !== last4[0]) return { category: categoryName, patternName: '1-2-3 BUILD', sub: 'Block Build (A)', targetToken: last4[1] };
        }
        return null;
    }
}