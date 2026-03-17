import RouletteController from './roulette/controller.js';

document.addEventListener('DOMContentLoaded', () => {
    // Boot up the Orchestrator and expose it to the window for HTML inline-clicks
    window.app = new RouletteController();
});
