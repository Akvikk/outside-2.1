export default class GroupMarch {
    static check1to1(seq, categoryName, typeA, typeB) {
        return this.detect(seq, categoryName);
    }

    static check2to1(seq, categoryName) {
        return this.detect(seq, categoryName);
    }

    static detect(seq, categoryName) {
        const len = seq.length;
        
        if (len >= 8) {
            const b = seq[len - 1];
            const a = seq[len - 4];
            if (a !== b && 
                seq[len - 2] === b && seq[len - 3] === b && 
                seq[len - 4] === a && seq[len - 5] === a && seq[len - 6] === a && seq[len - 7] === a && 
                seq[len - 8] !== a) {
                return { category: categoryName, patternName: 'GP 4x4', sub: 'Block Completion', targetToken: b };
            }
        }
        
        if (len >= 6) {
            const b = seq[len - 1];
            const a = seq[len - 3];
            if (a !== b && seq[len - 2] === b && seq[len - 3] === a && seq[len - 4] === a && seq[len - 5] === a && seq[len - 6] !== a) {
                return { category: categoryName, patternName: 'GP 3x3', sub: 'Block Completion', targetToken: b };
            }
        }
        
        if (len >= 4) {
            const b = seq[len - 1];
            const a = seq[len - 2];
            if (a !== b && seq[len - 3] === a && seq[len - 4] !== a) {
                return { category: categoryName, patternName: 'GP 2x2', sub: 'Block Completion', targetToken: b };
            }
        }
        
        return null;
    }
}