export default class Burst113 {
    static check(m) {
        if (m.s1 === 2 && m.s2 === 1 && m.s3 === 1 && m.pMid !== 'T' && m.pFirst !== 'T' && m.pEnd !== m.pMid && m.pFirst === m.pEnd) {
            if (m.isPure(m.firstEnd - m.s3 + 1, m.pFirst)) {
                return {
                    pred: m.pEnd,
                    name: `1-1-3 (${m.contextName})`,
                    rawName: '1-1-3',
                    indices: [m.idx(m.end), m.idx(m.end - 1), m.idx(m.midEnd), m.idx(m.firstEnd)],
                    isGolden: false
                };
            }
        }
        return null;
    }
}