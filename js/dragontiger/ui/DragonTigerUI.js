import Roads from './components/Roads.js';
import Dashboard from './components/Dashboard.js';
import Modals from './components/Modals.js';

export default class DragonTigerUI {
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
        if(e('dragontiger-hands-count')) e('dragontiger-hands-count').innerText = `${t} Hands`;
        if(e('dragontiger-comp-p')) e('dragontiger-comp-p').innerText = fmt(this.state.stats.p);
        if(e('dragontiger-comp-b')) e('dragontiger-comp-b').innerText = fmt(this.state.stats.b);
        if(e('dragontiger-comp-t')) e('dragontiger-comp-t').innerText = fmt(this.state.stats.t);
    }
}