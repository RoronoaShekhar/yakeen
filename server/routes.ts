
import type { Express } from "express";
import { createServer, type Server } from "http";
import { databaseStorage } from "./database-storage";
import { storage } from "./storage";
import { insertLiveLectureSchema, insertRecordedLectureSchema } from "@shared/schema";
import { z } from "zod";
import fs from "fs";
import path from "path";

// Use database storage with fallback to memory storage
const getStorage = () => {
  try {
    return databaseStorage;
  } catch (error) {
    console.warn("Database storage unavailable, falling back to memory storage");
    return storage;
  }
};

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
      const currentStorage = getStorage();
      const lectures = await currentStorage.getLiveLectures();
      res.json(lectures);
    } catch (error) {
      console.error("Error fetching live lectures:", error);
      res.status(500).json({ message: "Failed to fetch live lectures" });
    }
  });

  app.post("/api/live-lectures", async (req, res) => {
    try {
      const validatedData = insertLiveLectureSchema.parse(req.body);
      const currentStorage = getStorage();
      const lecture = await currentStorage.createLiveLecture(validatedData);
      res.status(201).json(lecture);
    } catch (error) {
      console.error("Error creating live lecture:", error);
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
      const currentStorage = getStorage();
      const success = await currentStorage.deleteLiveLecture(id);

      if (success) {
        res.json({ message: "Live lecture deleted successfully" });
      } else {
        res.status(404).json({ message: "Live lecture not found" });
      }
    } catch (error) {
      console.error("Error deleting live lecture:", error);
      res.status(500).json({ message: "Failed to delete live lecture" });
    }
  });

  app.patch("/api/live-lectures/:id/viewers", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { viewers } = req.body;
      const currentStorage = getStorage();

      const updated = await currentStorage.updateLiveLecture(id, { viewers });

      if (updated) {
        res.json(updated);
      } else {
        res.status(404).json({ message: "Live lecture not found" });
      }
    } catch (error) {
      console.error("Error updating viewer count:", error);
      res.status(500).json({ message: "Failed to update viewer count" });
    }
  });

  // Recorded Lectures
  app.get("/api/recorded-lectures", async (req, res) => {
    try {
      const subject = req.query.subject as string;
      const currentStorage = getStorage();
      const lectures = await currentStorage.getRecordedLectures(subject);
      res.json(lectures);
    } catch (error) {
      console.error("Error fetching recorded lectures:", error);
      res.status(500).json({ message: "Failed to fetch recorded lectures" });
    }
  });

  app.get("/api/recorded-lectures/subject/:subject", async (req, res) => {
    try {
      const subject = req.params.subject;
      const currentStorage = getStorage();
      const lectures = await currentStorage.getRecordedLecturesBySubject(subject);
      res.json(lectures);
    } catch (error) {
      console.error("Error fetching lectures by subject:", error);
      res.status(500).json({ message: "Failed to fetch lectures by subject" });
    }
  });

  app.post("/api/recorded-lectures", async (req, res) => {
    try {
      const validatedData = insertRecordedLectureSchema.parse(req.body);
      const currentStorage = getStorage();
      const lecture = await currentStorage.createRecordedLecture(validatedData);
      res.status(201).json(lecture);
    } catch (error) {
      console.error("Error creating recorded lecture:", error);
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
      const currentStorage = getStorage();
      const lecture = await currentStorage.toggleBookmark(id);

      if (lecture) {
        res.json(lecture);
      } else {
        res.status(404).json({ message: "Recorded lecture not found" });
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      res.status(500).json({ message: "Failed to toggle bookmark" });
    }
  });

  app.post("/api/recorded-lectures/bulk", async (req, res) => {
    try {
      const { lectures } = req.body;

      if (!Array.isArray(lectures)) {
        res.status(400).json({ message: "Lectures must be an array" });
        return;
      }

      const currentStorage = getStorage();
      const addedLectures = [];
      let errorCount = 0;

      for (const lecture of lectures) {
        try {
          if (!lecture.subject || !lecture.lecture_name || !lecture.lecture_link) {
            errorCount++;
            continue;
          }

          const newLecture = await currentStorage.createRecordedLecture({
            title: lecture.lecture_name,
            subject: lecture.subject.toLowerCase(),
            youtubeUrl: lecture.lecture_link,
          });
          addedLectures.push(newLecture);
        } catch (error) {
          console.error("Error adding bulk lecture:", error);
          errorCount++;
        }
      }

      res.json({
        message: `Successfully added ${addedLectures.length} lectures${errorCount > 0 ? `, ${errorCount} failed` : ''}`,
        added: addedLectures.length,
        failed: errorCount
      });
    } catch (error) {
      console.error("Error processing bulk lectures:", error);
      res.status(500).json({ message: "Failed to process bulk lectures" });
    }
  });

  app.patch("/api/recorded-lectures/:id/views", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const currentStorage = getStorage();
      
      // Get current lecture to increment views
      const lectures = await currentStorage.getRecordedLectures();
      const currentLecture = lectures.find(l => l.id === id);
      
      if (!currentLecture) {
        res.status(404).json({ message: "Recorded lecture not found" });
        return;
      }

      const lecture = await currentStorage.updateRecordedLecture(id, {
        views: (currentLecture.views || 0) + 1
      });

      if (lecture) {
        res.json(lecture);
      } else {
        res.status(404).json({ message: "Recorded lecture not found" });
      }
    } catch (error) {
      console.error("Error updating view count:", error);
      res.status(500).json({ message: "Failed to update view count" });
    }
  });

  app.delete("/api/recorded-lectures/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const currentStorage = getStorage();
      const success = await currentStorage.deleteRecordedLecture(id);

      if (success) {
        res.json({ message: "Recorded lecture deleted successfully" });
      } else {
        res.status(404).json({ message: "Recorded lecture not found" });
      }
    } catch (error) {
      console.error("Error deleting recorded lecture:", error);
      res.status(500).json({ message: "Failed to delete recorded lecture" });
    }
  });

  // Stats endpoint
  app.get("/api/stats", async (req, res) => {
    try {
      const currentStorage = getStorage();
      const liveLectures = await currentStorage.getLiveLectures();
      const recordedLectures = await currentStorage.getRecordedLectures();

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
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
