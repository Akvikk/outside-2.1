export default class RouletteUI {
    constructor(state) {
        this.state = state;
    }

    renderDashboard() {
        console.log("UI updated with history length: " + this.state.history.length);
    }
}
