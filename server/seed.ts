import { db } from "./db";
import { recordedLectures } from "@shared/schema";

const sampleRecordedLectures = [
  {
    title: "Human Anatomy and Physiology - Complete Overview",
    description: "Comprehensive coverage of human body systems including circulatory, respiratory, digestive, and nervous systems. Perfect for NEET 2026 preparation.",
    subject: "zoology" as const,
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnailUrl: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
    duration: "2:45:30",
    views: 15420,
    uploadDate: new Date("2024-12-15"),
    isBookmarked: false,
    tags: ["anatomy", "physiology", "human-body", "neet-2026"]
  },
  {
    title: "Plant Kingdom Classification - Detailed Study",
    description: "In-depth analysis of plant classification, morphology, and anatomy. Covers all major plant groups essential for NEET.",
    subject: "botany" as const,
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnailUrl: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
    duration: "1:58:45",
    views: 12850,
    uploadDate: new Date("2024-12-10"),
    isBookmarked: true,
    tags: ["plant-kingdom", "classification", "botany", "neet-2026"]
  },
  {
    title: "Organic Chemistry - Reaction Mechanisms",
    description: "Master organic chemistry reaction mechanisms with detailed explanations and practice problems. Essential for NEET chemistry section.",
    subject: "chemistry" as const,
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnailUrl: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
    duration: "3:12:20",
    views: 18750,
    uploadDate: new Date("2024-12-08"),
    isBookmarked: false,
    tags: ["organic-chemistry", "reactions", "mechanisms", "neet-2026"]
  },
  {
    title: "Thermodynamics and Heat Transfer",
    description: "Complete thermodynamics chapter with laws, processes, and heat transfer mechanisms. Includes solved examples and practice questions.",
    subject: "physics" as const,
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnailUrl: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
    duration: "2:30:15",
    views: 9680,
    uploadDate: new Date("2024-12-05"),
    isBookmarked: true,
    tags: ["thermodynamics", "heat-transfer", "physics", "neet-2026"]
  },
  {
    title: "Cell Biology and Molecular Biology",
    description: "Comprehensive study of cell structure, functions, and molecular processes. Essential for both botany and zoology sections.",
    subject: "zoology" as const,
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnailUrl: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
    duration: "2:15:40",
    views: 14320,
    uploadDate: new Date("2024-12-03"),
    isBookmarked: false,
    tags: ["cell-biology", "molecular-biology", "genetics", "neet-2026"]
  },
  {
    title: "Photosynthesis and Respiration Processes",
    description: "Detailed explanation of photosynthesis and cellular respiration with biochemical pathways and energy conversion.",
    subject: "botany" as const,
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnailUrl: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
    duration: "1:45:25",
    views: 11240,
    uploadDate: new Date("2024-12-01"),
    isBookmarked: true,
    tags: ["photosynthesis", "respiration", "biochemistry", "neet-2026"]
  },
  {
    title: "Atomic Structure and Chemical Bonding",
    description: "Fundamental concepts of atomic structure, electronic configuration, and different types of chemical bonding.",
    subject: "chemistry" as const,
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnailUrl: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
    duration: "2:05:30",
    views: 16890,
    uploadDate: new Date("2024-11-28"),
    isBookmarked: false,
    tags: ["atomic-structure", "chemical-bonding", "chemistry", "neet-2026"]
  },
  {
    title: "Mechanics - Motion and Forces",
    description: "Complete mechanics chapter covering kinematics, dynamics, and Newton's laws with practical applications.",
    subject: "physics" as const,
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnailUrl: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
    duration: "2:55:10",
    views: 13560,
    uploadDate: new Date("2024-11-25"),
    isBookmarked: true,
    tags: ["mechanics", "motion", "forces", "neet-2026"]
  }
];

export async function seedDatabase() {
  try {
    // Clear existing data
    await db.delete(recordedLectures);
    
    // Insert sample data
    await db.insert(recordedLectures).values(sampleRecordedLectures);
    
    console.log(`[Seed] Successfully seeded database with ${sampleRecordedLectures.length} recorded lectures`);
  } catch (error) {
    console.error('[Seed] Error seeding database:', error);
  }
}