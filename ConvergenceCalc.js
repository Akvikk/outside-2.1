/**
 * Handles Golden Bet fusion logic.
 * Groups predictions by outcome and merges them if 2+ patterns converge.
 */
export default class ConvergenceCalc {
    static calculate(candidates) {
        const grouped = { 'P': [], 'B': [], 'T': [] };
        candidates.forEach(c => grouped[c.pred].push(c));

        const result = [];
        for (const pred in grouped) {
            const group = grouped[pred];
            if (group.length >= 2) {
                const mergedName = group.map(g => g.rawName).join(' + ');
                const allIndices = [...new Set(group.flatMap(g => g.indices))];
                result.push({
                    pred: pred,
                    name: mergedName,
                    rawName: mergedName,
                    indices: allIndices,
                    isGolden: true
                });
            } else if (group.length === 1) {
                result.push(group[0]);
            }
        }
        return result;
    }
}