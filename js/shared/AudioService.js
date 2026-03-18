/**
 * AudioService: Isolated Web Audio API synthesizer.
 * Handles all futuristic UI sounds without needing external sound files.
 */
export default class AudioService {
    constructor() {
        // Initialize lazily to comply with browser autoplay policies
        this.audioCtx = null;
    }

    _initContext() {
        if (!this.audioCtx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                try { this.audioCtx = new AudioCtx(); } catch (e) { /* ignore */ }
            }
        }
        if (this.audioCtx && this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
    }

    playTone(freq, type, duration, startTime = 0) {
        this._initContext();
        if (!this.audioCtx) return;

        try {
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();
            
            osc.type = type;
            osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime + startTime);
            gain.gain.setValueAtTime(0.05, this.audioCtx.currentTime + startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + startTime + duration);
            
            osc.connect(gain);
            gain.connect(this.audioCtx.destination);
            
            osc.start(this.audioCtx.currentTime + startTime);
            osc.stop(this.audioCtx.currentTime + startTime + duration);
        } catch (e) { /* silent fail for audio routing issues */ }
    }

    // Pre-configured sound profiles extracted from the monolith
    playPrediction(enabled = true) { if (enabled) { this.playTone(880, 'sine', 0.1); this.playTone(1760, 'sine', 0.1, 0.05); } }
    playWin(enabled = true) { if (enabled) { this.playTone(523.25, 'sine', 0.2, 0); this.playTone(659.25, 'sine', 0.2, 0.1); this.playTone(783.99, 'sine', 0.4, 0.2); this.playTone(1046.50, 'sine', 0.6, 0.3); } }
    playLoss(enabled = true) { if (enabled) { this.playTone(150, 'sawtooth', 0.4); this.playTone(100, 'sawtooth', 0.4, 0.1); } }
}