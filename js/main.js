import RouletteState from './roulette/state.js';
import RouletteEngine from './roulette/engine.js';
import RouletteUI from './roulette/ui.js';

const appState = new RouletteState();
const engine = new RouletteEngine(appState);
const ui = new RouletteUI(appState);

document.getElementById('test-spin-btn').addEventListener('click', () => {
    engine.processSpin(0);
    ui.renderDashboard();
});
