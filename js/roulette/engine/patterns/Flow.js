export default class Flow {
    static check1to1(seq, categoryName, typeA, typeB) {
        const n = seq.length;
        if (n >= 4) {
            const last4 = seq.slice(-4);
            if (last4.every(v => v === typeA) && (n === 4 || seq[n - 5] !== typeA))
                return { category: categoryName, patternName: 'FLOW', sub: 'Streak Follow', targetToken: typeA };
            else if (last4.every(v => v === typeB) && (n === 4 || seq[n - 5] !== typeB))
                return { category: categoryName, patternName: 'FLOW', sub: 'Streak Follow', targetToken: typeB };
        }
        return null;
    }
    static check2to1() { return null; }
}