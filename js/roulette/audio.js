export default class AudioController {
    constructor(settings) {
        this.settings = settings || { predictions: false, wins: false, losses: false };
        this.audioCtx = (() => {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return null;
            try { return new AudioCtx(); } catch { return null; }
        })();
    }

    playTone(freq, type, duration, startTime = 0) {
        if (!this.audioCtx) return;
        if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
        
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
    }

    playPrediction() {
        if (this.settings.predictions) { this.playTone(880, 'sine', 0.1); this.playTone(1760, 'sine', 0.1, 0.05); }
    }

    playWin() {
        if (this.settings.wins) { this.playTone(523.25, 'sine', 0.2, 0); this.playTone(659.25, 'sine', 0.2, 0.1); this.playTone(783.99, 'sine', 0.4, 0.2); this.playTone(1046.50, 'sine', 0.6, 0.3); }
    }

    playLoss() {
        if (this.settings.losses) { this.playTone(150, 'sawtooth', 0.4); this.playTone(100, 'sawtooth', 0.4, 0.1); }
    }
}