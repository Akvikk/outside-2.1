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
        const host = document.body;
        if (!host) return false;

        if (!this.root) {
            const root = document.createElement('div');
            root.id = 'roulette-face-hud';
            root.className = 'fixed z-30 hidden select-none';
            root.style.width = 'min(182px, calc(100% - 20px))';
            root.style.maxWidth = '182px';

            root.innerHTML = `
                <div class="glass-panel glass-surface relative overflow-hidden rounded-[20px] p-2" style="border-color:rgba(48,209,88,0.12); box-shadow:0 12px 28px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.04), 0 0 16px rgba(48,209,88,0.05);">
                    <div class="pointer-events-none absolute inset-x-4 top-0 h-px" style="background:linear-gradient(90deg, transparent 0%, rgba(48,209,88,0.55) 50%, transparent 100%);"></div>
                    <div
                        id="roulette-face-hud-drag"
                        class="mb-1.5 flex cursor-grab touch-none items-center justify-between rounded-[14px] border border-white/10 bg-black/20 px-2 py-1.5 active:cursor-grabbing">
                        <span class="text-[8px] font-black uppercase tracking-[0.26em]" style="color:#30D158;">Faces</span>
                        <div class="flex items-center gap-1">
                            <span id="roulette-face-hud-total" class="rounded-full border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[8px] font-black tracking-[0.08em] text-white/60">0</span>
                            <span class="text-[9px] text-white/25"><i class="fas fa-grip-lines"></i></span>
                        </div>
                    </div>
                    <div id="roulette-face-hud-rows" class="flex flex-col gap-1"></div>
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
        const hudWidth = this.root.offsetWidth || 182;
        this.position.left = Math.max(12, window.innerWidth - hudWidth - 12);
        this.position.top = 84;
        this.applyPosition();
        this.saveState();
    }

    clampPosition() {
        if (!this.root) return;

        const maxLeft = Math.max(12, window.innerWidth - this.root.offsetWidth - 12);
        const maxTop = Math.max(12, window.innerHeight - this.root.offsetHeight - 12);
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

        const rect = this.root.getBoundingClientRect();
        const startLeft = this.position.left ?? rect.left;
        const startTop = this.position.top ?? rect.top;

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
            label: config.label,
            count: counts[key],
            percent: totalSpins > 0 ? Math.round((counts[key] / totalSpins) * 100) : 0,
            color: config.color
        }));
    }

    render() {
        if (!this.ensureMounted()) return;

        const isRouletteMode = window.app?.currentMode === 'roulette';
        this.root.classList.toggle('hidden', !(this.isVisible && isRouletteMode));
        this.syncButton();

        if (!(this.isVisible && isRouletteMode) || !this.rowsEl) return;

        const stats = this.computeStats();
        const total = this.state.history.length;
        const totalEl = this.root.querySelector('#roulette-face-hud-total');
        if (totalEl) totalEl.textContent = String(total);

        this.rowsEl.innerHTML = stats.map((face) => {
            const isHot = face.percent >= 20;
            const icon = isHot ? 'fa-fire' : 'fa-snowflake';
            const iconColor = isHot ? '#FF9F0A' : '#64D2FF';

            return `
                <div class="relative overflow-hidden rounded-[14px] border border-white/8 bg-black/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                    <div
                        class="absolute inset-y-0 left-0 rounded-r-[14px]"
                        style="width:${face.percent}%; background:linear-gradient(90deg, ${face.color}66 0%, ${face.color}24 100%); box-shadow:0 0 14px ${face.color}1f;"></div>
                    <div class="relative flex min-h-[30px] items-center justify-between gap-2 px-2 py-1.5">
                        <div class="flex items-center gap-1.5">
                            <span class="h-1.5 w-1.5 rounded-full" style="background:${face.color}; box-shadow:0 0 8px ${face.color};"></span>
                            <span class="text-[10px] font-black uppercase tracking-[0.14em] text-white">${face.label}</span>
                        </div>
                        <div class="flex items-center gap-1.5">
                            <span class="text-[9px] font-black uppercase tracking-[0.08em] text-white/55">${face.percent}%</span>
                            <span class="text-[10px]" style="color:${iconColor};"><i class="fas ${icon}"></i></span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        this.clampPosition();
        this.applyPosition();
    }
}
