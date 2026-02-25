import { Note } from './notes';

export class DatabaseService {
  private db: IDBDatabase | null = null;
  private readonly DB_NAME = 'StudentNotesDB';
  private readonly DB_VERSION = 1;
  private readonly NOTES_STORE = 'notes';
  private readonly AUDIO_STORE = 'audio';

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

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

  async saveNote(note: Note): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.NOTES_STORE], 'readwrite');
      const store = transaction.objectStore(this.NOTES_STORE);
      const request = store.put(note);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getNote(id: string): Promise<Note | undefined> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.NOTES_STORE], 'readonly');
      const store = transaction.objectStore(this.NOTES_STORE);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllNotes(): Promise<Note[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.NOTES_STORE], 'readonly');
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

  async deleteNote(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.NOTES_STORE], 'readwrite');
      const store = transaction.objectStore(this.NOTES_STORE);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async saveAudio(id: string, audioBlob: Blob): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.AUDIO_STORE], 'readwrite');
      const store = transaction.objectStore(this.AUDIO_STORE);
      const request = store.put({ id, blob: audioBlob, timestamp: Date.now() });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAudio(id: string): Promise<Blob | undefined> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.AUDIO_STORE], 'readonly');
      const store = transaction.objectStore(this.AUDIO_STORE);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result?.blob);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteAudio(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.AUDIO_STORE], 'readwrite');
      const store = transaction.objectStore(this.AUDIO_STORE);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}
