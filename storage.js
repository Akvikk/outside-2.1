export default class StorageManager {
    // Safely save data to localStorage with error catching
    static save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error(`StorageManager: Failed to save [${key}]`, e);
            return false;
        }
    }

    // Safely load and parse data from localStorage
    static load(key) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            console.error(`StorageManager: Failed to load [${key}]`, e);
            return null;
        }
    }
}