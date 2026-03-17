import { WHEEL_DATA } from './state.js';

export default class RouletteEngine {
    constructor(state) {
        this.state = state;
        // This holds temporary, non-persisted alerts from the last spin
        if (!this.state.pendingBets) {
            this.state.pendingBets = [];
        }
    }

    /**
     * Gets a slice of the most recent history.
     * @param {number} count The number of items to retrieve.
     * @returns {Array} The last `count` items from history.
     */
    getRecentHistory(count = 50) {
        return this.state.history.slice(-count);
    }

    /**
     * The main entry point to process a new spin.
     * @param {*} val The raw value of the spin (e.g., a number from 0-36).
     */
    processSpin(val) {
        const wheelData = WHEEL_DATA[val];
        if (wheelData === undefined) {
            console.error(`Invalid spin value received: ${val}`);
            return;
        }

        const spinObject = {
            id: Date.now(), // Unique ID for React keys or other purposes
            spinNumber: this.state.history.length + 1,
            val: val,
            ...wheelData
        };

        this.state.history.push(spinObject);
        this.state.saveState(); // Persist the new history

        // Scan for patterns and store the alerts in the state (transiently)
        this.state.pendingBets = this.scanPatterns();
        
        console.log(`Engine processed spin: ${val}. Found ${this.state.pendingBets.length} pending bets.`);
    }

    /**
     * Master scanner that orchestrates pattern analysis across all categories.
     * @returns {Array} A flattened array of all detected pattern alerts.
     */
    scanPatterns() {
        const history = this.getRecentHistory();
        if (history.length < 2) return [];

        // Prepare sequences, filtering out zeros by checking for null properties
        const colors = history.map(h => h.color).filter(c => c !== 'green');
        const highLows = history.map(h => h.highLow).filter(Boolean);
        const oddEvens = history.map(h => h.oddEven).filter(Boolean);
        const dozens = history.map(h => h.dozen).filter(Boolean);
        const columns = history.map(h => h.column).filter(Boolean);
        
        let allAlerts = [];

        // Analyze 1-to-1 markets (Even Chances)
        allAlerts.push(...this.analyze1to1Sequence(colors, 'Color', 'red', 'black'));
        allAlerts.push(...this.analyze1to1Sequence(highLows, 'High/Low', 'high', 'low'));
        allAlerts.push(...this.analyze1to1Sequence(oddEvens, 'Odd/Even', 'odd', 'even'));

        // Analyze 2-to-1 markets
        allAlerts.push(...this.analyze2to1Sequence(dozens, 'Dozen', 'd1', 'd2', 'd3'));
        allAlerts.push(...this.analyze2to1Sequence(columns, 'Column', 'c1', 'c2', 'c3'));

        // Filter alerts based on user's active filter settings
        const activeAlerts = allAlerts.filter(alert => this.state.activeFilters[alert.pattern]);

        return activeAlerts;
    }

    /**
     * Analyzes sequences for binary (1-to-1) outcomes like Red/Black.
     * @param {Array<string>} seq The sequence of outcomes (e.g., ['red', 'black']).
     * @param {string} categoryName The name of the category (e.g., 'Color').
     * @param {string} typeA The first outcome type (e.g., 'red').
     * @param {string} typeB The second outcome type (e.g., 'black').
     * @returns {Array} An array of prediction objects.
     */
    analyze1to1Sequence(seq, categoryName, typeA, typeB) {
        const alerts = [];
        const n = seq.length;

        // --- Standard Patterns ---
        if (n >= 2) {
            // FLOW: R, R -> predicts R
            if (seq[n-2] === seq[n-1]) {
                alerts.push({ pattern: 'FLOW', prediction: seq[n-1], category: categoryName, subtext: `Follows ${seq[n-1]}` });
            }
            // ZIG-ZAG: R, B -> predicts R
            if (seq[n-2] !== seq[n-1]) {
                alerts.push({ pattern: 'ZIG-ZAG', prediction: seq[n-2], category: categoryName, subtext: `Follows ${seq[n-2]}` });
            }
        }
        if (n >= 3) {
            // FALSE BREAK: B, R, R -> predicts R
            if (seq[n-3] !== seq[n-2] && seq[n-2] === seq[n-1]) {
                 alerts.push({ pattern: 'FALSE BREAK', prediction: seq[n-1], category: categoryName, subtext: 'Continuation' });
            }
        }
        if (n >= 4) {
            // 1-1-2 BUILD: B, R, B, B -> predicts B
            if (seq[n-4] !== seq[n-3] && seq[n-3] !== seq[n-2] && seq[n-2] === seq[n-1]) {
                alerts.push({ pattern: '1-1-2 BUILD', prediction: seq[n-1], category: categoryName, subtext: 'Build Up' });
            }
        }

        // --- Group March Patterns ---
        // GP 2x2: wall, A, A, B -> predicts B
        if (n >= 4) {
            const [s0, s1, s2, s3] = [seq[n-4], seq[n-3], seq[n-2], seq[n-1]];
            if (s0 !== s1 && s1 === s2 && s2 !== s3) {
                alerts.push({ pattern: 'GP 2x2', prediction: s3, category: categoryName, subtext: 'Block Completion' });
            }
        }
        // GP 3x3: wall, A, A, A, B, B -> predicts B
        if (n >= 6) {
            const [s0, s1, s2, s3, s4, s5] = [seq[n-6], seq[n-5], seq[n-4], seq[n-3], seq[n-2], seq[n-1]];
            if (s0 !== s1 && (s1 === s2 && s2 === s3) && s3 !== s4 && s4 === s5) {
                alerts.push({ pattern: 'GP 3x3', prediction: s5, category: categoryName, subtext: 'Block Completion' });
            }
        }
        // GP 4x4: wall, A, A, A, A, B, B, B -> predicts B
        if (n >= 8) {
            const [s0, s1, s2, s3, s4, s5, s6, s7] = [seq[n-8], seq[n-7], seq[n-6], seq[n-5], seq[n-4], seq[n-3], seq[n-2], seq[n-1]];
            if (s0 !== s1 && (s1 === s2 && s2 === s3 && s3 === s4) && s4 !== s5 && (s5 === s6 && s6 === s7)) {
                 alerts.push({ pattern: 'GP 4x4', prediction: s7, category: categoryName, subtext: 'Block Completion' });
            }
        }
        
        // Note: Did not implement 1-2-3, 3-2-1, 1-1-3, 3-1-1 as logic is ambiguous from name alone.
        // The core GP logic has been implemented as requested.
        
        return alerts;
    }
    
    /**
     * Analyzes sequences for 2-to-1 outcomes like Dozens/Columns.
     * The logic for pattern matching is kept consistent with 1-to-1 where applicable.
     * @param {Array<string>} seq The sequence of outcomes (e.g., ['d1', 'd3']).
     * @param {string} categoryName The name of the category (e.g., 'Dozen').
     * @returns {Array} An array of prediction objects.
     */
    analyze2to1Sequence(seq, categoryName) {
        // For 2-to-1, we can reuse the 1-to-1 logic by treating the last two distinct items
        // as a binary relationship (A vs B).
        const alerts = this.analyze1to1Sequence(seq, categoryName, null, null);
        return alerts;
    }
}
