export default class Flow {
    static check(m) {
        if (m.s1 >= 4) {
            return {
                pred: m.pEnd,
                name: `FLOW (${m.contextName})`,
                rawName: 'FLOW',
                indices: Array.from({ length: 4 }, (_, i) => m.idx(m.end - i)),
                isGolden: false
            };
        }
        return null;
    }
}