export class NotesService {
    constructor(db) {
        this.notes = [];
        this.db = db;
    }
    async loadNotes() {
        this.notes = await this.db.getAllNotes();
    }
    async saveNote(note) {
        await this.db.saveNote(note);
    }
    async createNote(title, className, professor, content, category = 'general') {
        const note = {
            id: Date.now().toString(),
            title,
            className,
            professor,
            content,
            category,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        await this.saveNote(note);
        this.notes.unshift(note);
        return note;
    }
    async updateNote(id, updates) {
        const index = this.notes.findIndex(n => n.id === id);
        if (index === -1)
            return false;
        this.notes[index] = {
            ...this.notes[index],
            ...updates,
            updatedAt: Date.now()
        };
        await this.saveNote(this.notes[index]);
        return true;
    }
    async deleteNote(id) {
        const index = this.notes.findIndex(n => n.id === id);
        if (index === -1)
            return false;
        await this.db.deleteNote(id);
        // Delete audio if exists
        if (this.notes[index].hasAudio && this.notes[index].audioId) {
            await this.db.deleteAudio(this.notes[index].audioId);
        }
        this.notes.splice(index, 1);
        return true;
    }
    getNotes() {
        return this.notes;
    }
    getNoteById(id) {
        return this.notes.find(n => n.id === id);
    }
    getNotesByClass(className) {
        return this.notes.filter(n => n.className === className);
    }
    getNotesByCategory(category) {
        return this.notes.filter(n => n.category === category);
    }
    getClasses() {
        const classes = new Set(this.notes.map(n => n.className));
        return Array.from(classes);
    }
}
