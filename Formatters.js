export default class Formatters {
    static getStyle(t) {
        if (t === 'R' || t === 'C1') return 'card-style style-red';
        if (t === 'B' || t === 'C2') return 'card-style style-black';
        if (t === 'H') return 'card-style style-orange';
        if (t === 'L') return 'card-style style-blue';
        if (t === 'O') return 'card-style style-purple';
        if (t === 'E') return 'card-style style-pink';
        if (t === 'D1') return 'card-style style-cyan';
        if (t === 'D2') return 'card-style style-gray';
        if (t === 'D3' || t === 'C3') return 'card-style style-yellow';
        return 'card-style style-gray';
    }

    static getName(categoryName, t) {
        if (categoryName === 'Color') return t === 'R' ? 'RED' : 'BLACK';
        if (categoryName === 'High/Low') return t === 'H' ? 'HIGH' : 'LOW';
        if (categoryName === 'Odd/Even') return t === 'O' ? 'ODD' : 'EVEN';
        return t;
    }

    static compactTokenLabel(value) {
        const raw = String(value || '').trim();
        if (!raw) return raw;
        const map = { RED: 'R', BLACK: 'B', HIGH: 'H', LOW: 'L', ODD: 'O', EVEN: 'E' };
        let compact = raw.toUpperCase();
        Object.entries(map).forEach(([full, short]) => compact = compact.replace(new RegExp(`\\b${full}\\b`, 'g'), short));
        return compact;
    }

    static compactCategoryLabel(category) {
        const map = { 'Color': 'CLR', 'High/Low': 'H/L', 'Odd/Even': 'O/E', 'Dozens': 'DOZ', 'Columns': 'COL' };
        return map[category] || category;
    }

    static compactPatternLabel(pattern) {
        const map = { 'FLOW': 'FLOW', 'ZIG-ZAG': 'ZZ', 'FALSE BREAK': 'FB', '1-2-3 BUILD': '123', '3-2-1 MIRROR': '321', '1-1-3 BURST': '113', '3-1-1 DOWN': '311', '1-1-2 BUILD': '112' };
        return map[pattern] || pattern;
    }
}