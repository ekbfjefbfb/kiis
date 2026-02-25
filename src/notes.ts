export interface Professor {
  name: string;
  phone: string;
  email: string;
}

export interface Note {
  id: string;
  title: string;
  className: string;
  professor: Professor;
  content: string;
  category: 'resumen' | 'tarea' | 'importante' | 'general';
  createdAt: number;
  updatedAt: number;
  hasAudio?: boolean;
  audioId?: string;
}

import { DatabaseService } from './database';

export class NotesService {
  private notes: Note[] = [];
  private db: DatabaseService;

  constructor(db: DatabaseService) {
    this.db = db;
  }

  async loadNotes(): Promise<void> {
    this.notes = await this.db.getAllNotes();
  }

  private async saveNote(note: Note): Promise<void> {
    await this.db.saveNote(note);
  }

  async createNote(
    title: string,
    className: string,
    professor: Professor,
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

    await this.saveNote(note);
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
    
    await this.saveNote(this.notes[index]);
    return true;
  }

  async deleteNote(id: string): Promise<boolean> {
    const index = this.notes.findIndex(n => n.id === id);
    if (index === -1) return false;

    await this.db.deleteNote(id);
    
    // Delete audio if exists
    if (this.notes[index].hasAudio && this.notes[index].audioId) {
      await this.db.deleteAudio(this.notes[index].audioId!);
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
