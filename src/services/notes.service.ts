import { databaseService, Note } from './database.service';

export class NotesService {
  private notes: Note[] = [];

  async init(): Promise<void> {
    await databaseService.init();
    await this.loadNotes();
  }

  async loadNotes(): Promise<void> {
    this.notes = await databaseService.getAllNotes();
  }

  async createNote(
    title: string,
    className: string,
    professor: { name: string; phone: string; email: string },
    content: string,
    category: 'resumen' | 'tarea' | 'importante' | 'general' = 'general'
  ): Promise<Note> {
    const note: Note = {
      id: Date.now().toString(),
      title,
      className,
      professor,
      content,
      category,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    await databaseService.saveNote(note);
    this.notes.unshift(note);
    return note;
  }

  async updateNote(id: string, updates: Partial<Note>): Promise<boolean> {
    const index = this.notes.findIndex(n => n.id === id);
    if (index === -1) return false;

    this.notes[index] = {
      ...this.notes[index],
      ...updates,
      updatedAt: Date.now()
    };
    
    await databaseService.saveNote(this.notes[index]);
    return true;
  }

  async deleteNote(id: string): Promise<boolean> {
    const index = this.notes.findIndex(n => n.id === id);
    if (index === -1) return false;

    await databaseService.deleteNote(id);
    
    if (this.notes[index].hasAudio && this.notes[index].audioId) {
      await databaseService.deleteAudio(this.notes[index].audioId!);
    }

    this.notes.splice(index, 1);
    return true;
  }

  getNotes(): Note[] {
    return this.notes;
  }

  getNoteById(id: string): Note | undefined {
    return this.notes.find(n => n.id === id);
  }

  getNotesByClass(className: string): Note[] {
    return this.notes.filter(n => n.className === className);
  }

  getNotesByCategory(category: string): Note[] {
    return this.notes.filter(n => n.category === category);
  }

  getClasses(): string[] {
    const classes = new Set(this.notes.map(n => n.className));
    return Array.from(classes);
  }
}

export const notesService = new NotesService();
