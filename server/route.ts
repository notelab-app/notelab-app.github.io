import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertNoteSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/notes", async (_req, res) => {
    const notes = await storage.getNotes();
    res.json(notes);
  });

  app.get("/api/notes/:id", async (req, res) => {
    const note = await storage.getNote(parseInt(req.params.id));
    if (!note) {
      res.status(404).json({ message: "Note not found" });
      return;
    }
    res.json(note);
  });

  app.post("/api/notes", async (req, res) => {
    const result = insertNoteSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ message: "Invalid note data" });
      return;
    }
    const note = await storage.createNote(result.data);
    res.json(note);
  });

  app.put("/api/notes/:id", async (req, res) => {
    const result = insertNoteSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ message: "Invalid note data" });
      return;
    }
    try {
      const note = await storage.updateNote(parseInt(req.params.id), result.data);
      res.json(note);
    } catch (err) {
      res.status(404).json({ message: "Note not found" });
    }
  });

  app.delete("/api/notes/:id", async (req, res) => {
    await storage.deleteNote(parseInt(req.params.id));
    res.status(204).end();
  });

  const httpServer = createServer(app);
  return httpServer;
}
