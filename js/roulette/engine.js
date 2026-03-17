export default class RouletteEngine {
    constructor(state) {
        this.state = state;
    }

    processSpin(number) {
        this.state.history.push(number);
        this.state.saveState();
        console.log("Engine processed spin: " + number);
    }
}
