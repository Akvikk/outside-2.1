export default class Mirror321 {
    static check1to1(seq, categoryName, typeA, typeB) {
        const n = seq.length;
        if (n >= 6) {
            const s0 = seq[n - 6], s1 = seq[n - 5], s2 = seq[n - 4], s3 = seq[n - 3], s4 = seq[n - 2], s5 = seq[n - 1];
            if (s0 === s4 && s4 === s5 && s1 === s2 && s2 === s3 && s1 !== s4) return { category: categoryName, patternName: '3-2-1 MIRROR', sub: 'Pyramid Tip', targetToken: s1 };
        }
        return null;
    }
    static check2to1(seq, categoryName) {
        const n = seq.length;
        if (n >= 6) {
            const s0 = seq[n - 6], s1 = seq[n - 5], s2 = seq[n - 4], s3 = seq[n - 3], s4 = seq[n - 2], s5 = seq[n - 1];
            if (s0 === s4 && s4 === s5 && s1 === s2 && s2 === s3 && s1 !== s4) return { category: categoryName, patternName: '3-2-1 MIRROR', sub: 'Pyramid Tip', targetToken: s1 };
        }
        return null;
    }
}