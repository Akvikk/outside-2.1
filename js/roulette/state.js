export default class RouletteState {
    constructor() {
        this.history = [];
        this.activeFilters = {};
        this.bankroll = 0;
    }

    saveState() {
        console.log("State saved to localStorage");
    }
}
