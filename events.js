export default class EventBus {
    constructor() {
        this.listeners = {};
    }

    // Subscribe to an event
    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    // Unsubscribe from an event
    off(event, callback) {
        if (!this.listeners[event]) return;
        this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }

    // Fire an event, passing data to all subscribers
    emit(event, data) {
        if (this.listeners[event]) this.listeners[event].forEach(callback => callback(data));
    }
}