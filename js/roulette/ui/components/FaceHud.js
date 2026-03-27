import { FACE_GROUPS, getFaceGroupsForNumber } from './FaceGroups.js';

const STORAGE_KEY = 'roulette_face_hud_state';

export default class FaceHud {
    constructor(controller, state) {
        this.controller = controller;
        this.state = state;
        this.root = null;
        this.rowsEl = null;
        this.dragHandle = null;
        this.isVisible = false;
        this.position = { left: null, top: null };
        this.dragState = null;
        this._resizeHandler = null;
        this.loadState();
        this.bindViewportSync();
    }

    bindViewportSync() {
        this._resizeHandler = () => {
            if (!this.root) return;
            if (this.position.left === null || this.position.top === null) {
                this.placeDefaultPosition();
            } else {
                this.clampPosition();
                this.applyPosition();
            }
        };
        window.addEventListener('resize', this._resizeHandler, { passive: true });
        window.addEventListener('orientationchange', this._resizeHandler, { passive: true });
    }

    loadState() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return;
            const parsed = JSON.parse(raw);
            this.isVisible = parsed.visible === true;
            if (Number.isFinite(parsed.left) && Number.isFinite(parsed.top)) {
                this.position = { left: parsed.left, top: parsed.top };
            }
        } catch (e) {}
    }

    saveState() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                visible: this.isVisible,
                left: this.position.left,
                top: this.position.top
            }));
        } catch (e) {}
    }

    ensureMounted() {
        const host = document.getElementById('roulette-view');
        if (!host) return false;

        host.classList.add('relative');

        if (!this.root) {
            const root = document.createElement('div');
            root.id = 'roulette-face-hud';
            root.className = 'absolute z-30 hidden select-none';
            root.style.width = 'min(300px, calc(100% - 24px))';
            root.style.maxWidth = '300px';

            root.innerHTML = `
                <div class="glass-panel glass-surface relative overflow-hidden rounded-3xl p-3" style="border-color:rgba(48,209,88,0.15); box-shadow:0 24px 60px rgba(0,0,0,0.42), inset 0 1px 0 rgba(48,209,88,0.08), 0 0 35px rgba(48,209,88,0.08);">
                    <div class="pointer-events-none absolute inset-x-6 top-0 h-px" style="background:linear-gradient(90deg, transparent 0%, rgba(48,209,88,0.7) 50%, transparent 100%);"></div>
                    <div
                        id="roulette-face-hud-drag"
                        class="mb-3 flex cursor-grab touch-none items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-3 py-2 active:cursor-grabbing">
                        <div class="flex flex-col">
                            <span class="text-[11px] font-black uppercase tracking-[0.28em]" style="color:#30D158;">Face HUD</span>
                            <span class="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">Roulette Overlay</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <span id="roulette-face-hud-total" class="rounded-full border border-white/10 bg-black/20 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/55">0 Spins</span>
                            <span class="text-white/30"><i class="fas fa-grip-lines"></i></span>
                        </div>
                    </div>
                    <div id="roulette-face-hud-rows" class="flex flex-col gap-2"></div>
                </div>
            `;

            host.appendChild(root);
            this.root = root;
            this.rowsEl = root.querySelector('#roulette-face-hud-rows');
            this.dragHandle = root.querySelector('#roulette-face-hud-drag');

            if (this.dragHandle) {
                this.dragHandle.addEventListener('pointerdown', (event) => this.startDrag(event));
            }

            requestAnimationFrame(() => {
                if (this.position.left === null || this.position.top === null) this.placeDefaultPosition();
                else {
                    this.clampPosition();
                    this.applyPosition();
                }
            });
        }

        return true;
    }

    placeDefaultPosition() {
        const host = document.getElementById('roulette-view');
        if (!host || !this.root) return;

        const hudWidth = this.root.offsetWidth || 300;
        this.position.left = Math.max(12, host.clientWidth - hudWidth - 12);
        this.position.top = 12;
        this.applyPosition();
        this.saveState();
    }

    clampPosition() {
        const host = document.getElementById('roulette-view');
        if (!host || !this.root) return;

        const maxLeft = Math.max(12, host.clientWidth - this.root.offsetWidth - 12);
        const maxTop = Math.max(12, host.clientHeight - this.root.offsetHeight - 12);
        this.position.left = Math.min(Math.max(12, this.position.left ?? 12), maxLeft);
        this.position.top = Math.min(Math.max(12, this.position.top ?? 12), maxTop);
    }

    applyPosition() {
        if (!this.root) return;
        this.root.style.left = `${Math.round(this.position.left ?? 12)}px`;
        this.root.style.top = `${Math.round(this.position.top ?? 12)}px`;
    }

    startDrag(event) {
        if (!this.root) return;

        const startLeft = this.position.left ?? this.root.offsetLeft;
        const startTop = this.position.top ?? this.root.offsetTop;

        this.dragState = {
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            startLeft,
            startTop
        };

        this.dragHandle?.setPointerCapture?.(event.pointerId);
        document.addEventListener('pointermove', this.handleDragMove);
        document.addEventListener('pointerup', this.handleDragEnd);
        document.addEventListener('pointercancel', this.handleDragEnd);
        event.preventDefault();
    }

    handleDragMove = (event) => {
        if (!this.dragState || event.pointerId !== this.dragState.pointerId) return;

        this.position.left = this.dragState.startLeft + (event.clientX - this.dragState.startX);
        this.position.top = this.dragState.startTop + (event.clientY - this.dragState.startY);
        this.clampPosition();
        this.applyPosition();
    };

    handleDragEnd = (event) => {
        if (!this.dragState || event.pointerId !== this.dragState.pointerId) return;

        this.dragHandle?.releasePointerCapture?.(event.pointerId);
        this.dragState = null;
        document.removeEventListener('pointermove', this.handleDragMove);
        document.removeEventListener('pointerup', this.handleDragEnd);
        document.removeEventListener('pointercancel', this.handleDragEnd);
        this.saveState();
    };

    toggle() {
        this.isVisible = !this.isVisible;
        this.saveState();
        this.render();
    }

    syncButton() {
        const button = document.getElementById('faceHudBtn');
        if (!button) return;

        button.classList.remove('text-gray-300');
        if (this.isVisible) {
            button.style.color = '#30D158';
            button.style.borderColor = 'rgba(48, 209, 88, 0.3)';
            button.style.background = 'rgba(48, 209, 88, 0.1)';
            button.style.boxShadow = '0 0 24px rgba(48, 209, 88, 0.12)';
        } else {
            button.classList.add('text-gray-300');
            button.style.color = '';
            button.style.borderColor = '';
            button.style.background = '';
            button.style.boxShadow = '';
        }
    }

    computeStats() {
        const counts = { F1: 0, F2: 0, F3: 0, F4: 0, F5: 0 };
        const totalSpins = this.state.history.length;

        this.state.history.forEach((spin) => {
            getFaceGroupsForNumber(spin.val).forEach((face) => {
                counts[face.key]++;
            });
        });

        return Object.entries(FACE_GROUPS).map(([key, config]) => ({
            key,
            label: config.name.toUpperCase(),
            count: counts[key],
            percent: totalSpins > 0 ? Math.round((counts[key] / totalSpins) * 100) : 0,
            color: config.color
        }));
    }

    render() {
        if (!this.ensureMounted()) return;

        this.root.classList.toggle('hidden', !this.isVisible);
        this.syncButton();

        if (!this.isVisible || !this.rowsEl) return;

        const stats = this.computeStats();
        const total = this.state.history.length;
        const totalEl = this.root.querySelector('#roulette-face-hud-total');
        if (totalEl) totalEl.textContent = `${total} Spin${total === 1 ? '' : 's'}`;

        this.rowsEl.innerHTML = stats.map((face) => `
            <div class="grid-item relative overflow-hidden rounded-[20px] border-white/8 bg-black/20">
                <div
                    class="absolute inset-y-0 left-0 rounded-r-[20px]"
                    style="width:${face.percent}%; background:linear-gradient(90deg, ${face.color}66 0%, ${face.color}1f 100%); box-shadow:0 0 24px ${face.color}22;"></div>
                <div class="relative flex items-center justify-between gap-3 px-4 py-3">
                    <span class="text-sm font-black uppercase tracking-wide text-white">
                        ${face.label}
                        <span class="text-white/45">(${face.percent}%)</span>
                    </span>
                    <span
                        class="rounded-full border px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em]"
                        style="color:${face.color}; border-color:${face.color}66; background:${face.color}14;">
                        ${face.key}
                    </span>
                </div>
            </div>
        `).join('');

        this.clampPosition();
        this.applyPosition();
    }
}
