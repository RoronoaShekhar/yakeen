import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertLiveLectureSchema, insertRecordedLectureSchema } from "@shared/schema";
import { z } from "zod";
import fs from "fs";
import path from "path";

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve player.html
  app.get("/player.html", async (req, res) => {
    try {
      const playerPath = path.resolve(import.meta.dirname, "..", "client", "player.html");
      const playerHtml = await fs.promises.readFile(playerPath, "utf-8");
      res.setHeader("Content-Type", "text/html");
      res.send(playerHtml);
    } catch (error) {
      res.status(404).send("Player page not found");
    }
  });

  // Live Lectures
  app.get("/api/live-lectures", async (req, res) => {
    try {
      const lectures = await storage.getLiveLectures();
      res.json(lectures);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch live lectures" });
    }
  });

  app.post("/api/live-lectures", async (req, res) => {
    try {
      const validatedData = insertLiveLectureSchema.parse(req.body);
      const lecture = await storage.createLiveLecture(validatedData);
      res.status(201).json(lecture);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create live lecture" });
      }
    }
  });

  app.delete("/api/live-lectures/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteLiveLecture(id);
      
      if (success) {
        res.json({ message: "Live lecture deleted successfully" });
      } else {
        res.status(404).json({ message: "Live lecture not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete live lecture" });
    }
  });

  app.patch("/api/live-lectures/:id/viewers", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { viewers } = req.body;
      
      const updated = await storage.updateLiveLecture(id, { viewers });
      
      if (updated) {
        res.json(updated);
      } else {
        res.status(404).json({ message: "Live lecture not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to update viewer count" });
    }
  });

  // Recorded Lectures
  app.get("/api/recorded-lectures", async (req, res) => {
    try {
      const subject = req.query.subject as string;
      const lectures = await storage.getRecordedLectures(subject);
      res.json(lectures);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recorded lectures" });
    }
  });

  app.get("/api/recorded-lectures/subject/:subject", async (req, res) => {
    try {
      const subject = req.params.subject;
      const lectures = await storage.getRecordedLecturesBySubject(subject);
      res.json(lectures);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch lectures by subject" });
    }
  });

  app.post("/api/recorded-lectures", async (req, res) => {
    try {
      const validatedData = insertRecordedLectureSchema.parse(req.body);
      const lecture = await storage.createRecordedLecture(validatedData);
      res.status(201).json(lecture);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create recorded lecture" });
      }
    }
  });

  app.patch("/api/recorded-lectures/:id/bookmark", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updated = await storage.toggleBookmark(id);
      
      if (updated) {
        res.json(updated);
      } else {
        res.status(404).json({ message: "Recorded lecture not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to toggle bookmark" });
    }
  });

  app.patch("/api/recorded-lectures/:id/views", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const lecture = await storage.updateRecordedLecture(id, { 
        views: (await storage.getRecordedLectures()).find(l => l.id === id)?.views || 0 + 1 
      });
      
      if (lecture) {
        res.json(lecture);
      } else {
        res.status(404).json({ message: "Recorded lecture not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to update view count" });
    }
  });

  app.delete("/api/recorded-lectures/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteRecordedLecture(id);
      
      if (success) {
        res.json({ message: "Recorded lecture deleted successfully" });
      } else {
        res.status(404).json({ message: "Recorded lecture not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete recorded lecture" });
    }
  });

  // Stats endpoint
  app.get("/api/stats", async (req, res) => {
    try {
      const liveLectures = await storage.getLiveLectures();
      const recordedLectures = await storage.getRecordedLectures();
      
      const stats = {
        liveLectures: liveLectures.length,
        recordedLectures: recordedLectures.length,
        totalViews: recordedLectures.reduce((sum, lecture) => sum + (lecture.views || 0), 0),
        subjects: {
          physics: recordedLectures.filter(l => l.subject === 'physics').length,
          chemistry: recordedLectures.filter(l => l.subject === 'chemistry').length,
          botany: recordedLectures.filter(l => l.subject === 'botany').length,
          zoology: recordedLectures.filter(l => l.subject === 'zoology').length,
        }
      };
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
