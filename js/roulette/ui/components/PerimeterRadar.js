import BankrollManager from '../../engine/BankrollManager.js';

export default class PerimeterRadar {
    constructor(controller, state) {
        this.controller = controller;
        this.state = state;
    }

    render() {
        const body = document.getElementById('perimeterRadarBody');
        if (!body) return;

        const pStats = BankrollManager.calculatePerimeterStats(this.state);
        const patterns = Object.keys(pStats).sort((a, b) => pStats[b].rate - pStats[a].rate);

        if (patterns.length === 0) {
            body.innerHTML = `<tr><td colspan="3" class="p-8 text-center text-gray-600 italic">No patterns detected in the current perimeter.</td></tr>`;
            return;
        }

        body.innerHTML = patterns.map(p => {
            const stat = pStats[p];
            const isHot = stat.rate > 0;
            return `
                <tr class="hover:bg-white/5 transition-colors">
                    <td class="p-3 font-medium text-gray-300 flex items-center gap-2">
                        ${isHot ? '<span class="text-emerald-500"><i class="fas fa-fire"></i></span>' : '<span class="text-gray-600"><i class="fas fa-snowflake"></i></span>'}
                        ${p}
                    </td>
                    <td class="p-3 text-center text-gray-400">
                        <span class="text-green-400">${stat.w}</span> - <span class="text-red-400">${stat.l}</span>
                    </td>
                    <td class="p-3 text-right">
                        <span class="${isHot ? 'text-emerald-400 font-bold' : 'text-gray-500'}">${stat.rate}%</span>
                    </td>
                </tr>
            `;
        }).join('');
    }
}