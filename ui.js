export default class DragonTigerUI {
    constructor(eventBus, state) {
        this.eventBus = eventBus;
        this.state = state;
    }

    renderAll() {
        this.renderBeadPlate();
        this.renderBigRoad();

        const t = this.state.stats.total;
        const fmtComp = (count) => t ? `[${count} | ${Math.round((count / t) * 100)}%]` : '[0 | 0%]';
        
        const handsCountEl = document.getElementById('dragontiger-hands-count');
        if (handsCountEl) handsCountEl.innerText = `${t} Hands`;
        
        const compPEl = document.getElementById('dragontiger-comp-p');
        if (compPEl) compPEl.innerText = fmtComp(this.state.stats.p);
        
        const compBEl = document.getElementById('dragontiger-comp-b');
        if (compBEl) compBEl.innerText = fmtComp(this.state.stats.b);
        
        const compTEl = document.getElementById('dragontiger-comp-t');
        if (compTEl) compTEl.innerText = fmtComp(this.state.stats.t);
    }

    renderBeadPlate(highlightOnly = false) {
        const container = document.getElementById('dt-bead-plate');
        if (!container) return;

        let grid = container.querySelector('.road-grid');
        if (!grid) {
            grid = document.createElement('div');
            grid.className = 'road-grid flex-1';
            container.appendChild(grid);
        }

        const requiredCols = Math.max(14, Math.ceil(this.state.history.length / 6) + 1);
        const currentCols = grid.children.length / 6;

        if (requiredCols > currentCols || currentCols === 0) {
            grid.style.gridTemplateColumns = `repeat(${requiredCols}, 26px)`;
            const diff = requiredCols > currentCols ? (requiredCols - currentCols) * 6 : requiredCols * 6;
            const frag = document.createDocumentFragment();
            for (let i = 0; i < diff; i++) {
                const cell = document.createElement('div');
                cell.className = 'road-cell';
                frag.appendChild(cell);
            }
            grid.appendChild(frag);
        } else if (requiredCols < currentCols) {
            for (let i = 0; i < (currentCols - requiredCols) * 6; i++) grid.removeChild(grid.lastChild);
            grid.style.gridTemplateColumns = `repeat(${requiredCols}, 26px)`;
        }

        const cells = grid.children;
        for (let i = 0; i < cells.length; i++) {
            const cell = cells[i];
            if (i < this.state.history.length) {
                const h = this.state.history[i];
                let bead = cell.firstChild;
                let bClass = `bead bead-${h.val.toLowerCase()}`;
                if (h.val === 'T') bClass = 'bead bead-dt-t';

                if (!bead) {
                    bead = document.createElement('div');
                    bead.className = bClass;
                    bead.innerText = h.val;
                    cell.appendChild(bead);
                } else if (!highlightOnly && bead.innerText !== h.val) {
                    bead.className = bClass;
                    bead.innerText = h.val;
                }

                const existingRing = Array.from(bead.classList).find(c => c.startsWith('highlight-ring-'));
                const newRing = (this.state.currentHighlightMap && this.state.currentHighlightMap.has(i))
                    ? `highlight-ring-${this.state.currentHighlightMap.get(i)}` : null;

                if (existingRing !== newRing) {
                    if (existingRing) bead.classList.remove(existingRing);
                    if (newRing) bead.classList.add(newRing);
                }
            } else if (cell.firstChild) cell.removeChild(cell.firstChild);
        }

        if (!highlightOnly) {
            const activeColBP = Math.max(0, Math.ceil(this.state.history.length / 6) - 1);
            const targetX_BP = activeColBP * 27;
            requestAnimationFrame(() => {
                if (container.clientWidth > 0) container.scrollLeft = Math.max(0, targetX_BP - container.clientWidth + 80);
            });
        }
    }

    renderBigRoad() {
        const container = document.getElementById('dt-big-road');
        if (!container) return;
        let roadData = [], currentCol = [], lastMain = null;

        this.state.history.forEach(h => {
            if (h.val === 'X') {
                if (currentCol.length > 0) currentCol[currentCol.length - 1].ties++;
            } else {
                if (h.val === lastMain) currentCol.push({ val: h.val, ties: 0 });
                else {
                    if (currentCol.length > 0) roadData.push(currentCol);
                    currentCol = [{ val: h.val, ties: 0 }];
                    lastMain = h.val;
                }
            }
        });
        if (currentCol.length > 0) roadData.push(currentCol);

        let grid = container.querySelector('.road-grid');
        if (!grid) {
            grid = document.createElement('div');
            grid.className = 'road-grid h-full';
            container.appendChild(grid);
        }

        const cols = Math.max(25, roadData.length + 1);
        const currentCols = grid.children.length / 6;

        if (cols > currentCols || currentCols === 0) {
            grid.style.gridTemplateColumns = `repeat(${cols}, 18px)`;
            const frag = document.createDocumentFragment();
            const diff = cols > currentCols ? (cols - currentCols) * 6 : cols * 6;
            for (let i = 0; i < diff; i++) {
                const cell = document.createElement('div');
                cell.className = 'road-cell';
                frag.appendChild(cell);
            }
            grid.appendChild(frag);
        } else if (cols < currentCols) {
            for (let i = 0; i < (currentCols - cols) * 6; i++) grid.removeChild(grid.lastChild);
            grid.style.gridTemplateColumns = `repeat(${cols}, 18px)`;
        }

        const cells = grid.children;
        for (let c = 0; c < cols; c++) {
            const columnData = roadData[c] || [];
            for (let r = 0; r < 6; r++) {
                const cell = cells[(c * 6) + r];
                const data = columnData[r];

                if (data) {
                    const hollowClass = `hollow-${data.val.toLowerCase()}`;
                    if (cell.children.length === 0) {
                        if (data.ties > 0) {
                            const tie = document.createElement('div');
                            tie.className = 'tie-marker';
                            cell.appendChild(tie);
                        }
                        const circ = document.createElement('div');
                        circ.className = hollowClass;
                        cell.appendChild(circ);
                    } else {
                        const hasTieMarker = data.ties > 0;
                        const existingHasTie = cell.firstChild && cell.firstChild.className === 'tie-marker';
                        const existingHollow = existingHasTie ? cell.children[1] : cell.firstChild;

                        if (existingHasTie !== hasTieMarker || !existingHollow || existingHollow.className !== hollowClass) {
                            cell.innerHTML = '';
                            if (hasTieMarker) {
                                const tie = document.createElement('div'); tie.className = 'tie-marker'; cell.appendChild(tie);
                            }
                            const circ = document.createElement('div'); circ.className = hollowClass; cell.appendChild(circ);
                        }
                    }
                } else if (cell.firstChild) cell.innerHTML = '';
            }
        }
        const activeColBR = Math.max(0, roadData.length - 1);
        const targetX_BR = activeColBR * 19;
        requestAnimationFrame(() => {
            if (container.clientWidth > 0) container.scrollLeft = Math.max(0, targetX_BR - container.clientWidth + 60);
        });
    }
}