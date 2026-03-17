import re
import os

base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
app_js_path = os.path.join(base_dir, 'js', 'app.js')
roulette_js_path = os.path.join(base_dir, 'js', 'roulette.js')

if os.path.exists(app_js_path):
    with open(app_js_path, 'r', encoding='utf-8-sig') as f:
        app_js = f.read()

    # 1. Add swState
    app_js = app_js.replace(
        "    pendingSwitchMode: null,",
        "    swState: { running: false, startTime: null, elapsed: 0 },\n    _swTickInterval: null,\n    pendingSwitchMode: null,"
    )

    # 2. Add loadGlobalState
    app_js = app_js.replace(
        "    init() {\n        this.roulette.loadLocal();",
        "    init() {\n        this.loadGlobalState();\n        this.roulette.loadLocal();"
    )

    # 3. Add to end of app object
    functions_to_add = """

        // --- GLOBAL STOPWATCH LOGIC ---

        toggleStopwatchState() {
            if (this.swState.running) {
                this.swState.elapsed += (Date.now() - this.swState.startTime);
                this.swState.startTime = null;
                this.swState.running = false;
            } else {
                this.swState.startTime = Date.now();
                this.swState.running = true;
            }
            this.updateStopwatchUIState();
            this.saveGlobalState();
        },

        resetStopwatch() {
            this.swState = { running: false, startTime: null, elapsed: 0 };
            this.updateStopwatchUIState();
            const display = document.getElementById('menuStopwatchDisplay');
            if (display) display.textContent = '00:00:00';
            this.saveGlobalState();
        },

        _tickStopwatch() {
            const display = document.getElementById('menuStopwatchDisplay');
            if (!display) return;
            if (!this.swState.running && this._swTickInterval) {
                clearInterval(this._swTickInterval);
                this._swTickInterval = null;
            }
            let totalMs = this.swState.elapsed;
            if (this.swState.running && this.swState.startTime) {
                totalMs += (Date.now() - this.swState.startTime);
            }
            const totalSec = Math.floor(totalMs / 1000);
            const h = String(Math.floor(totalSec / 3600)).padStart(2, '0');
            const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
            const s = String(totalSec % 60).padStart(2, '0');
            display.textContent = `${h}:${m}:${s}`;
        },

        updateStopwatchUIState() {
            const btn = document.getElementById('btn-sw-toggle');
            if (!btn) return;
            if (this.swState.running) {
                btn.innerHTML = '<i class="fas fa-pause"></i> STOP';
                btn.className = "flex-1 h-8 bg-[#FF9F0A] hover:bg-[#e08b09] text-white text-xs font-bold rounded-lg shadow transition-colors flex items-center justify-center gap-2";
                if (this._swTickInterval) clearInterval(this._swTickInterval);
                this._tickStopwatch();
                this._swTickInterval = setInterval(() => this._tickStopwatch(), 1000);
            } else {
                btn.innerHTML = '<i class="fas fa-play"></i> START';
                btn.className = "flex-1 h-8 bg-[#30D158] hover:bg-[#28c04d] text-white text-xs font-bold rounded-lg shadow transition-colors flex items-center justify-center gap-2";
                if (this._swTickInterval) {
                    clearInterval(this._swTickInterval);
                    this._swTickInterval = null;
                }
                this._tickStopwatch();
            }
        },
    """

    app_js = app_js.replace('});\n\n// Initialize App', '});\n' + functions_to_add + '\n// Initialize App')
    app_js = re.sub(r'window\.toggleStopwatchState = \(\) => app\.roulette\.toggleStopwatchState\(\);', 'window.toggleStopwatchState = () => app.toggleStopwatchState();', app_js)
    app_js = re.sub(r'window\.resetStopwatch = \(\) => app\.roulette\.resetStopwatch\(\);', 'window.resetStopwatch = () => app.resetStopwatch();', app_js)

    with open(app_js_path, 'w', encoding='utf-8-sig') as f:
        f.write(app_js)