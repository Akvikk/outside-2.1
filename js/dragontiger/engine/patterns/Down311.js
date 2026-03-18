export default class Down311 {
    static check(m) {
        if (m.s1 === 1 && m.s2 === 3 && m.pMid !== 'X' && m.pEnd !== m.pMid) {
            if (m.isPure(m.midEnd - m.s2 + 1, m.pMid)) {
                return {
                    pred: m.pMid,
                    name: `3-1-1 DOWN (${m.contextName})`,
                    rawName: '3-1-1 DOWN',
                    indices: [m.idx(m.end), m.idx(m.midEnd), m.idx(m.midEnd - 1), m.idx(m.midEnd - 2)],
                    isGolden: false
                };
            }
        }
        return null;
    }
}