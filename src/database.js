export class DatabaseService {
    constructor() {
        this.db = null;
        this.DB_NAME = 'StudentNotesDB';
        this.DB_VERSION = 1;
        this.NOTES_STORE = 'notes';
        this.AUDIO_STORE = 'audio';
    }
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                // Notes store
                if (!db.objectStoreNames.contains(this.NOTES_STORE)) {
                    const notesStore = db.createObjectStore(this.NOTES_STORE, { keyPath: 'id' });
                    notesStore.createIndex('className', 'className', { unique: false });
                    notesStore.createIndex('category', 'category', { unique: false });
                    notesStore.createIndex('createdAt', 'createdAt', { unique: false });
                }
                // Audio store
                if (!db.objectStoreNames.contains(this.AUDIO_STORE)) {
                    db.createObjectStore(this.AUDIO_STORE, { keyPath: 'id' });
                }
            };
        });
    }
    async saveNote(note) {
        if (!this.db)
            throw new Error('Database not initialized');
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.NOTES_STORE], 'readwrite');
            const store = transaction.objectStore(this.NOTES_STORE);
            const request = store.put(note);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
    async getNote(id) {
        if (!this.db)
            throw new Error('Database not initialized');
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.NOTES_STORE], 'readonly');
            const store = transaction.objectStore(this.NOTES_STORE);
            const request = store.get(id);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    async getAllNotes() {
        if (!this.db)
            throw new Error('Database not initialized');
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.NOTES_STORE], 'readonly');
            const store = transaction.objectStore(this.NOTES_STORE);
            const request = store.getAll();
            request.onsuccess = () => {
                const notes = request.result || [];
                notes.sort((a, b) => b.createdAt - a.createdAt);
                resolve(notes);
            };
            request.onerror = () => reject(request.error);
        });
    }
    async deleteNote(id) {
        if (!this.db)
            throw new Error('Database not initialized');
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.NOTES_STORE], 'readwrite');
            const store = transaction.objectStore(this.NOTES_STORE);
            const request = store.delete(id);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
    async saveAudio(id, audioBlob) {
        if (!this.db)
            throw new Error('Database not initialized');
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.AUDIO_STORE], 'readwrite');
            const store = transaction.objectStore(this.AUDIO_STORE);
            const request = store.put({ id, blob: audioBlob, timestamp: Date.now() });
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
    async getAudio(id) {
        if (!this.db)
            throw new Error('Database not initialized');
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.AUDIO_STORE], 'readonly');
            const store = transaction.objectStore(this.AUDIO_STORE);
            const request = store.get(id);
            request.onsuccess = () => resolve(request.result?.blob);
            request.onerror = () => reject(request.error);
        });
    }
    async deleteAudio(id) {
        if (!this.db)
            throw new Error('Database not initialized');
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.AUDIO_STORE], 'readwrite');
            const store = transaction.objectStore(this.AUDIO_STORE);
            const request = store.delete(id);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
}
