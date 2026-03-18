import RoadGenerator from '../../engine/RoadGenerator.js';

export default class Roads {
    constructor(controller, state) { this.controller = controller; this.state = state; }

    renderBeadPlate(highlightOnly = false) {
        const container = document.getElementById('dt-bead-plate');
        if (!container) return;
        let grid = container.querySelector('.road-grid');
        if (!grid) { grid = document.createElement('div'); grid.className = 'road-grid flex-1'; container.appendChild(grid); }

        const reqCols = Math.max(14, Math.ceil(this.state.history.length / 6) + 1);
        const curCols = grid.children.length / 6;

        if (reqCols > curCols || curCols === 0) {
            grid.style.gridTemplateColumns = `repeat(${reqCols}, 26px)`;
            const frag = document.createDocumentFragment();
            for (let i = 0; i < (reqCols > curCols ? (reqCols - curCols) * 6 : reqCols * 6); i++) {
                const cell = document.createElement('div'); cell.className = 'road-cell'; frag.appendChild(cell);
            }
            grid.appendChild(frag);
        } else if (reqCols < curCols) {
            for (let i = 0; i < (curCols - reqCols) * 6; i++) grid.removeChild(grid.lastChild);
            grid.style.gridTemplateColumns = `repeat(${reqCols}, 26px)`;
        }

        const cells = grid.children;
        for (let i = 0; i < cells.length; i++) {
            const cell = cells[i];
            if (i < this.state.history.length) {
                const h = this.state.history[i]; let bead = cell.firstChild;
                let bClass = `bead bead-${h.val.toLowerCase()}`;
                if (h.val === 'X') bClass = 'bead bead-dt-t';
                
                if (!bead) { bead = document.createElement('div'); bead.className = bClass; bead.innerText = h.val; cell.appendChild(bead); } 
                else if (!highlightOnly) { if (bead.innerText !== h.val) { bead.className = bClass; bead.innerText = h.val; } }
                
                const existRing = Array.from(bead.classList).find(c => c.startsWith('highlight-ring-'));
                const newRing = this.state.currentHighlightMap.has(i) ? `highlight-ring-${this.state.currentHighlightMap.get(i)}` : null;
                if (existRing !== newRing) { if (existRing) bead.classList.remove(existRing); if (newRing) bead.classList.add(newRing); }
            } else if (cell.firstChild) cell.removeChild(cell.firstChild);
        }
        if (!highlightOnly) setTimeout(() => { if (container.clientWidth > 0) container.scrollLeft = Math.max(0, (Math.max(0, Math.ceil(this.state.history.length / 6) - 1)) * 27 - container.clientWidth + 80); }, 10);
    }

    renderBigRoad() {
        const container = document.getElementById('dt-big-road');
        if (!container) return;
        const roadData = RoadGenerator.generateBigRoad(this.state.history, 'X');
        let grid = container.querySelector('.road-grid');
        if (!grid) { grid = document.createElement('div'); grid.className = 'road-grid h-full'; container.appendChild(grid); }

        const cols = Math.max(25, roadData.length + 1);
        const curCols = grid.children.length / 6;

        if (cols > curCols || curCols === 0) {
            grid.style.gridTemplateColumns = `repeat(${cols}, 18px)`;
            const frag = document.createDocumentFragment();
            for (let i = 0; i < (cols > curCols ? (cols - curCols) * 6 : cols * 6); i++) {
                const cell = document.createElement('div'); cell.className = 'road-cell'; frag.appendChild(cell);
            }
            grid.appendChild(frag);
        } else if (cols < curCols) {
            for (let i = 0; i < (curCols - cols) * 6; i++) grid.removeChild(grid.lastChild);
            grid.style.gridTemplateColumns = `repeat(${cols}, 18px)`;
        }

        const cells = grid.children;
        for (let c = 0; c < cols; c++) {
            const columnData = roadData[c] || [];
            for (let r = 0; r < 6; r++) {
                const cell = cells[(c * 6) + r]; const data = columnData[r];
                if (data) {
                    const hollowClass = `hollow-${data.val.toLowerCase()}`;
                    if (cell.children.length === 0) {
                        if (data.ties > 0) { const tie = document.createElement('div'); tie.className = 'tie-marker'; cell.appendChild(tie); }
                        const circ = document.createElement('div'); circ.className = hollowClass; cell.appendChild(circ);
                    } else {
                        const hasTie = data.ties > 0;
                        const existHasTie = cell.firstChild && cell.firstChild.className === 'tie-marker';
                        const existHollow = existHasTie ? cell.children[1] : cell.firstChild;
                        if (existHasTie !== hasTie || !existHollow || existHollow.className !== hollowClass) {
                            cell.innerHTML = '';
                            if (hasTie) { const tie = document.createElement('div'); tie.className = 'tie-marker'; cell.appendChild(tie); }
                            const circ = document.createElement('div'); circ.className = hollowClass; cell.appendChild(circ);
                        }
                    }
                } else if (cell.firstChild) cell.innerHTML = '';
            }
        }
        setTimeout(() => { if (container.clientWidth > 0) container.scrollLeft = Math.max(0, Math.max(0, roadData.length - 1) * 19 - container.clientWidth + 60); }, 10);
    }
}