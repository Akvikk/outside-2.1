/**
 * Pure math conversion from Bead Plate raw history to Big Road matrix.
 * Handles logic for Tie markers cascading on the same column.
 */
export default class RoadGenerator {
    static generateBigRoad(history, tieToken = 'X') {
        let roadData = [], currentCol = [], lastMain = null;

        history.forEach(h => {
            if (h.val === tieToken) {
                if (currentCol.length > 0) currentCol[currentCol.length - 1].ties++;
            } else {
                if (h.val === lastMain) currentCol.push({ val: h.val, ties: 0 });
                else {
                    if (currentCol.length > 0) roadData.push(currentCol);
                    currentCol = [{ val: h.val, ties: 0 }];
                    lastMain = h.val;
                }
            }
        });
        if (currentCol.length > 0) roadData.push(currentCol);
        return roadData;
    }
}