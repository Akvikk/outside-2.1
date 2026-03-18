import re

# app.js rewriting
with open('js/app.js', 'r', encoding='utf-8-sig') as f:
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
            // Pause
            this.swState.elapsed += (Date.now() - this.swState.startTime);
            this.swState.startTime = null;
            this.swState.running = false;
        } else {
            // Start
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

    saveGlobalState() {
        try {
            localStorage.setItem('fon_outside_app_state', JSON.stringify({
                swState: this.swState
            }));
        } catch (e) { console.warn("Failed to save global state", e); }
    },

    loadGlobalState() {
        try {
            const data = localStorage.getItem('fon_outside_app_state');
            if (data) {
                const parsed = JSON.parse(data);
                if (parsed.swState) {
                    this.swState = parsed.swState;
                    if (this.swState.running && !this.swState.startTime) {
                        this.swState.running = false;
                    }
                }
            }
        } catch (e) { console.warn("Failed to load global state", e); }
        this.updateStopwatchUIState();
    }
"""

app_js = app_js.replace('});\n\n// Initialize App', '});\n' + functions_to_add + '\n// Initialize App')

# 4. Updates to bottom bindings
app_js = re.sub(r'window\.toggleStopwatchState = \(\) => app\.roulette\.toggleStopwatchState\(\);', 'window.toggleStopwatchState = () => app.toggleStopwatchState();', app_js)
app_js = re.sub(r'window\.resetStopwatch = \(\) => app\.roulette\.resetStopwatch\(\);', 'window.resetStopwatch = () => app.resetStopwatch();', app_js)

with open('js/app.js', 'w', encoding='utf-8-sig') as f:
    f.write(app_js)

# roulette.js rewriting
with open('js/roulette.js', 'r', encoding='utf-8-sig') as f:
    roulette_js = f.read()

# 1. Remove swState
roulette_js = re.sub(r'\s*swState:\s*\{\s*running:\s*false,\s*startTime:\s*null,\s*elapsed:\s*0\s*\},', '', roulette_js)

# 2. Cleanup session reset call
roulette_js = re.sub(r'this\.resetStopwatch\(\);', 'if (app && app.resetStopwatch) app.resetStopwatch();', roulette_js)

# 3. Remove stopwatch block
# Search for `    // --- SESSION TIMER ---` which starts the stopwatch section and remove down to the end of the file except `};`
# Actually it might be safer to remove specific methods.
methods_to_remove = [
    r'\s*_swTickInterval:\s*null,',
    r'\s*toggleStopwatchState\(\)\s*\{[\s\S]*?this\.saveLocal\(\);\s*\}',
    r'\s*resetStopwatch\(\)\s*\{[\s\S]*?this\.saveLocal\(\);\s*\}',
    r'\s*_tickStopwatch\(\)\s*\{[\s\S]*?\}\s*\},?',
    r'\s*updateStopwatchUIState\(\)\s*\{[\s\S]*?\}\s*\}'
]

# We will just remove everything from `// --- STOPWATCH LOGIC ---` up to the end of the file's object
block_start = roulette_js.find('    // --- STOPWATCH LOGIC ---')
if block_start != -1:
    end_bracket = roulette_js.rfind('};', block_start)
    if end_bracket != -1:
        roulette_js = roulette_js[:block_start] + '\n' + roulette_js[end_bracket:]
        
with open('js/roulette.js', 'w', encoding='utf-8-sig') as f:
    f.write(roulette_js)

print("Rewrote app.js and roulette.js successfully")
