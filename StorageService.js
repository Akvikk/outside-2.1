/**
 * StorageService: A bulletproof wrapper for localStorage.
 * Prevents the app from crashing if storage is disabled or full.
 */
export default class StorageService {
    static save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error(`[StorageService] Failed to save ${key}:`, e);
            return false;
        }
    }

    static load(key) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            console.error(`[StorageService] Failed to load ${key}:`, e);
            return null;
        }
    }

    static remove(key) {
        try { localStorage.removeItem(key); return true; } catch (e) { return false; }
    }
}