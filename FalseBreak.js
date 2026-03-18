export default class FalseBreak {
    static check(m) {
        if (m.s1 === 1 && m.s2 >= 5 && m.pMid !== 'X') {
            let indices = [m.idx(m.end)];
            for (let i = 0; i < 5; i++) indices.push(m.idx(m.midEnd - i));
            return {
                pred: m.pMid,
                name: `FALSE BREAK (${m.contextName})`,
                rawName: 'FALSE BREAK',
                indices, isGolden: false
            };
        }
        return null;
    }
}