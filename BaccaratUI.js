import Roads from './components/Roads.js';
import Dashboard from './components/Dashboard.js';
import Modals from './components/Modals.js';

export default class BaccaratUI {
    constructor(controller, state) {
        this.controller = controller;
        this.state = state;
        this.roads = new Roads(controller, state);
        this.dashboard = new Dashboard(controller, state);
        this.modals = new Modals(controller, state);
    }
    
    updateShoeStats() {
        const t = this.state.stats.total; const e = (id) => document.getElementById(id);
        const fmt = (c) => t ? `[${c} | ${Math.round((c/t)*100)}%]` : '[0 | 0%]';
        if(e('baccarat-hands-count')) e('baccarat-hands-count').innerText = `${t} Hands`;
        if(e('baccarat-comp-p')) e('baccarat-comp-p').innerText = fmt(this.state.stats.p);
        if(e('baccarat-comp-b')) e('baccarat-comp-b').innerText = fmt(this.state.stats.b);
        if(e('baccarat-comp-t')) e('baccarat-comp-t').innerText = fmt(this.state.stats.t);
    }
}