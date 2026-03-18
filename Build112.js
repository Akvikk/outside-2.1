/**
 * 100% PURE MATH PATTERN.
 * NO CSS, NO HTML, NO STRINGS.
 */
export default class Build112 {
    static check1to1(seq, categoryName, typeA, typeB) {
        const n = seq.length;
        if (n >= 5) {
            const s0 = seq[n - 5], s1 = seq[n - 4], s2 = seq[n - 3], s3 = seq[n - 2], s4 = seq[n - 1];
            if (s0 === s1 && s1 !== s2 && s2 !== s3 && s3 !== s4) {
                return { category: categoryName, patternName: '1-1-2 BUILD', sub: 'Structure Completion', targetToken: s4 };
            }
        }
        return null;
    }
    static check2to1() { return null; }
}