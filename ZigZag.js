export default class ZigZag {
    static check(m) {
        if (m.len >= 3 && m.val(m.end) !== 'T' && m.val(m.end - 1) !== 'T' && m.val(m.end - 2) !== 'T') {
            if (m.val(m.end) !== m.val(m.end - 1) && m.val(m.end - 1) !== m.val(m.end - 2)) {
                return {
                    pred: m.pEnd === 'P' ? 'B' : 'P',
                    name: `ZIG-ZAG (${m.contextName})`,
                    rawName: 'ZIG-ZAG',
                    indices: [m.idx(m.end), m.idx(m.end - 1), m.idx(m.end - 2)],
                    isGolden: false
                };
            }
        }
        return null;
    }
}