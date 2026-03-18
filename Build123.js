export default class Build123 {
    static check(m) {
        if (m.s1 === 2 && m.s2 === 2 && m.s3 === 1 && m.pMid !== 'X' && m.pFirst !== 'X' && m.pEnd !== m.pMid && m.pFirst === m.pEnd) {
            if (m.isPure(m.firstEnd - m.s3 + 1, m.pFirst)) {
                return {
                    pred: m.pEnd,
                    name: `1-2-3 (${m.contextName})`,
                    rawName: '1-2-3',
                    indices: [m.idx(m.end), m.idx(m.end - 1), m.idx(m.midEnd), m.idx(m.midEnd - 1), m.idx(m.firstEnd)],
                    isGolden: false
                };
            }
        }
        return null;
    }
}