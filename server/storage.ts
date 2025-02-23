import { notes, type Note, type InsertNote } from "@shared/schema";

export interface IStorage {
  getNotes(): Promise<Note[]>;
  getNote(id: number): Promise<Note | undefined>;
  createNote(note: InsertNote): Promise<Note>;
  updateNote(id: number, note: InsertNote): Promise<Note>;
  deleteNote(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private notes: Map<number, Note>;
  private currentId: number;

  constructor() {
    this.notes = new Map();
    this.currentId = 1;
  }

  async getNotes(): Promise<Note[]> {
    return Array.from(this.notes.values());
  }

  async getNote(id: number): Promise<Note | undefined> {
    return this.notes.get(id);
  }

  async createNote(insertNote: InsertNote): Promise<Note> {
    const id = this.currentId++;
    const note: Note = {
      ...insertNote,
      id,
      lastModified: new Date(),
    };
    this.notes.set(id, note);
    return note;
  }

  async updateNote(id: number, updateNote: InsertNote): Promise<Note> {
    const existing = await this.getNote(id);
    if (!existing) {
      throw new Error(`Note ${id} not found`);
    }
    const note: Note = {
      ...existing,
      ...updateNote,
      lastModified: new Date(),
    };
    this.notes.set(id, note);
    return note;
  }

  async deleteNote(id: number): Promise<void> {
    this.notes.delete(id);
  }
}

export const storage = new MemStorage();
