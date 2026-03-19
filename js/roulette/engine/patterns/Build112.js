export default class Build112 {
    static check1to1(seq, categoryName, typeA, typeB) {
        const n = seq.length;
        if (n >= 5) {
            const s0 = seq[n - 5], s1 = seq[n - 4], s2 = seq[n - 3], s3 = seq[n - 2], s4 = seq[n - 1];
            
            // Looking for: Opposite (s0), Single (s1), Single (s2), Double (s3 + s4)
            // Example: B (s0) !== R (s1) !== B (s2) !== R (s3) === R (s4)
            if (s0 !== s1 && s1 !== s2 && s2 !== s3 && s3 === s4) {
                const prediction = s4 === typeA ? typeB : typeA;
                return { 
                    category: categoryName, 
                    patternName: '1-1-2 BUILD', 
                    sub: 'Aftermath Drop', 
                    targetToken: prediction 
                };
            }
        }
        return null;
    }

    static check2to1(seq, categoryName) {
        const n = seq.length;
        if (n >= 5) {
            const s0 = seq[n - 5], s1 = seq[n - 4], s2 = seq[n - 3], s3 = seq[n - 2], s4 = seq[n - 1];
            
            if (s0 !== s1 && s1 !== s2 && s2 !== s3 && s3 === s4) {
                // For Dozens/Columns, predicting the drop means reverting to the previous block in the sequence (s2)
                return { 
                    category: categoryName, 
                    patternName: '1-1-2 BUILD', 
                    sub: 'Aftermath Drop', 
                    targetToken: s2 
                };
            }
        }
        return null;
    }
}