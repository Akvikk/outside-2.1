export default class Mirror321 {
    static check(m) {
        if (m.s1 === 2 && m.s2 === 3 && m.pMid !== 'X' && m.pEnd !== m.pMid) {
            if (m.isPure(m.midEnd - m.s2 + 1, m.pMid)) {
                return {
                    pred: m.pMid,
                    name: `3-2-1 (${m.contextName})`,
                    rawName: '3-2-1',
                    indices: [m.idx(m.end), m.idx(m.end - 1), m.idx(m.midEnd), m.idx(m.midEnd - 1), m.idx(m.midEnd - 2)],
                    isGolden: false
                };
            }
        }
        return null;
    }
}