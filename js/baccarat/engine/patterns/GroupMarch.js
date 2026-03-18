export default class GroupMarch {
    static check(m) {
        const len = m.len;
        
        if (len >= 8) {
            const b = m.val(len - 1);
            const a = m.val(len - 4);
            if (a !== b && 
                m.val(len - 2) === b && m.val(len - 3) === b && 
                m.val(len - 4) === a && m.val(len - 5) === a && m.val(len - 6) === a && m.val(len - 7) === a && 
                m.val(len - 8) !== a) {
                return { 
                    name: `Group March 4x4 (${m.contextName})`, 
                    rawName: 'GP 4x4', 
                    pred: b, 
                    indices: [m.idx(len-1), m.idx(len-2), m.idx(len-3), m.idx(len-4), m.idx(len-5), m.idx(len-6), m.idx(len-7)] 
                };
            }
        }
        
        if (len >= 6) {
            const b = m.val(len - 1);
            const a = m.val(len - 3);
            if (a !== b && 
                m.val(len - 2) === b && 
                m.val(len - 3) === a && m.val(len - 4) === a && m.val(len - 5) === a && 
                m.val(len - 6) !== a) {
                return { 
                    name: `Group March 3x3 (${m.contextName})`, 
                    rawName: 'GP 3x3', 
                    pred: b, 
                    indices: [m.idx(len-1), m.idx(len-2), m.idx(len-3), m.idx(len-4), m.idx(len-5)] 
                };
            }
        }
        
        if (len >= 4) {
            const b = m.val(len - 1);
            const a = m.val(len - 2);
            if (a !== b && 
                m.val(len - 3) === a && 
                m.val(len - 4) !== a) {
                return { 
                    name: `Group March 2x2 (${m.contextName})`, 
                    rawName: 'GP 2x2', 
                    pred: b, 
                    indices: [m.idx(len-1), m.idx(len-2), m.idx(len-3)] 
                };
            }
        }
        
        return null;
    }
}