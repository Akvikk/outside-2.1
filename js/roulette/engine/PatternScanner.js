import Flow from './patterns/Flow.js';
import ZigZag from './patterns/ZigZag.js';
import FalseBreak from './patterns/FalseBreak.js';
import Build123 from './patterns/Build123.js';
import Mirror321 from './patterns/Mirror321.js';
import Burst113 from './patterns/Burst113.js';
import Down311 from './patterns/Down311.js';
import Build112 from './patterns/Build112.js';
import GroupMarch from './patterns/GroupMarch.js';

const PATTERNS = [Flow, ZigZag, FalseBreak, Build123, Mirror321, Burst113, Down311, Build112, GroupMarch];

export default class PatternScanner {
    constructor(state) {
        this.state = state;
    }

    preparePatternSeq(rawSeq, zeroToken) {
        if (this.state.ignoreZero) return rawSeq.filter(v => v !== zeroToken);
        const lastZeroIdx = rawSeq.lastIndexOf(zeroToken);
        const sliced = lastZeroIdx === -1 ? rawSeq : rawSeq.slice(lastZeroIdx + 1);
        return sliced.filter(v => v !== zeroToken);
    }

    analyze1to1Sequence(seq, categoryName, typeA, typeB) {
        let found = [];
        for (let Pattern of PATTERNS) {
            let res = Pattern.check1to1(seq, categoryName, typeA, typeB);
            if (res) {
                found.push(res);
                if (res.patternName === 'ZIG-ZAG') break;
            }
        }
        return found;
    }

    analyze2to1Sequence(seq, categoryName) {
        let found = [];
        for (let Pattern of PATTERNS) {
            let res = Pattern.check2to1(seq, categoryName);
            if (res) {
                found.push(res);
                if (res.patternName === 'ZIG-ZAG') return found;
            }
        }
        return found;
    }

    scanPatterns(ignoreFilters = false, chasesObj = this.state.engineChases) {
        let alerts = [];
        const subset = this.state.getRecentHistory(50);

        if (ignoreFilters || this.state.activeFilters.color) {
            const seq = this.preparePatternSeq(subset.map(s => s.color), 'G');
            alerts = alerts.concat(this.analyze1to1Sequence(seq, 'Color', 'R', 'B'));
        }
        if (ignoreFilters || this.state.activeFilters.hl) {
            const seq = this.preparePatternSeq(subset.map(s => s.hl), 'Z');
            alerts = alerts.concat(this.analyze1to1Sequence(seq, 'High/Low', 'H', 'L'));
        }
        if (ignoreFilters || this.state.activeFilters.oe) {
            const oeSeq = subset.map(s => s.oe === 'Odd' ? 'O' : (s.oe === 'Even' ? 'E' : 'Z'));
            const seq = this.preparePatternSeq(oeSeq, 'Z');
            alerts = alerts.concat(this.analyze1to1Sequence(seq, 'Odd/Even', 'O', 'E'));
        }
        if (ignoreFilters || this.state.activeFilters.doz) {
            if (chasesObj['Dozens']) {
                alerts.push({ category: 'Dozens', patternName: 'FALSE BREAK', sub: `Chase Attempt ${4 - chasesObj['Dozens'].attemptsLeft}/3`, targetToken: chasesObj['Dozens'].target });
            } else {
                const seq = this.preparePatternSeq(subset.map(s => s.doz), 'Z');
                alerts = alerts.concat(this.analyze2to1Sequence(seq, 'Dozens'));
            }
        }
        if (ignoreFilters || this.state.activeFilters.col) {
            if (chasesObj['Columns']) {
                alerts.push({ category: 'Columns', patternName: 'FALSE BREAK', sub: `Chase Attempt ${4 - chasesObj['Columns'].attemptsLeft}/3`, targetToken: chasesObj['Columns'].target });
            } else {
                const seq = this.preparePatternSeq(subset.map(s => s.col), 'Z');
                alerts = alerts.concat(this.analyze2to1Sequence(seq, 'Columns'));
            }
        }
        return alerts;
    }
}