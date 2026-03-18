import Flow from './patterns/Flow.js';
import ZigZag from './patterns/ZigZag.js';
import FalseBreak from './patterns/FalseBreak.js';
import Build123 from './patterns/Build123.js';
import Mirror321 from './patterns/Mirror321.js';
import Burst113 from './patterns/Burst113.js';
import Down311 from './patterns/Down311.js';

const PATTERNS = [Flow, ZigZag, FalseBreak, Build123, Mirror321, Burst113, Down311];

export default class PatternScanner {
    static createContext(seq, contextName) {
        const len = seq.length;
        const val = (i) => (i >= 0 && i < len) ? seq[i].val : null;
        const idx = (i) => (i >= 0 && i < len) ? seq[i].index : -1;
        
        const getStreak = (endIdx) => {
            if (endIdx < 0 || endIdx >= len) return 0;
            const baseVal = val(endIdx);
            if (baseVal === 'X' || baseVal === null) return 0;
            let count = 1;
            for (let i = endIdx - 1; i >= 0; i--) {
                if (val(i) === baseVal) count++; else break;
            }
            return count;
        };

        const getOpposite = (color) => color === 'D' ? 'T' : (color === 'T' ? 'D' : null);
        const isPure = (startIdx, patternColor) => {
            if (startIdx <= 0) return false;
            return val(startIdx - 1) === getOpposite(patternColor);
        };

        const end = len - 1;
        const pEnd = val(end);
        if (pEnd === 'X' || pEnd === null) return null;

        const s1 = getStreak(end);
        const midEnd = end - s1;
        const pMid = val(midEnd);
        const s2 = getStreak(midEnd);
        const firstEnd = midEnd - s2;
        const pFirst = val(firstEnd);
        const s3 = getStreak(firstEnd);

        return { end, pEnd, s1, midEnd, pMid, s2, firstEnd, pFirst, s3, val, idx, isPure, contextName, len };
    }

    static scan(seq, contextName) {
        if (seq.length < 3) return [];
        const m = this.createContext(seq, contextName);
        if (!m) return [];

        let cands = [];
        for (let Pattern of PATTERNS) {
            const res = Pattern.check(m);
            if (res) cands.push(res);
        }
        return cands;
    }
}