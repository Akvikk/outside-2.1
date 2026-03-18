/**
 * EventBus: A lightweight Publisher/Subscriber system.
 * Decouples the Engine (math) from the UI (DOM) so they never touch.
 */
export default class EventBus {
    constructor() {
        this.listeners = {};
    }

    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = new Set();
        }
        this.listeners[event].add(callback);
    }

    off(event, callback) {
        if (!this.listeners[event]) return;
        this.listeners[event].delete(callback);
    }

    emit(event, data) {
        if (!this.listeners[event]) return;
        for (const callback of this.listeners[event]) {
            callback(data);
        }
    }
}