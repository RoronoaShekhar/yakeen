import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getYouTubeVideoId(url: string): string | null {
  const match = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

export function getYouTubeEmbedUrl(url: string): string {
  const videoId = getYouTubeVideoId(url);
  return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
}

export function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  
  return new Date(date).toLocaleDateString();
}

export function getSubjectColor(subject: string): string {
  switch (subject) {
    case 'physics': return 'bg-gradient-physics';
    case 'chemistry': return 'bg-gradient-chemistry';
    case 'botany': return 'bg-gradient-botany';
    case 'zoology': return 'bg-gradient-zoology';
    default: return 'bg-gradient-primary';
  }
}

export function getSubjectIcon(subject: string): string {
  switch (subject) {
    case 'physics': return 'fas fa-atom';
    case 'chemistry': return 'fas fa-flask';
    case 'botany': return 'fas fa-leaf';
    case 'zoology': return 'fas fa-dna';
    default: return 'fas fa-book';
  }
}

export function formatDuration(duration: string): string {
  // Assuming duration is in format "HH:MM:SS" or "MM:SS"
  return duration || '0:00';
}

export function formatViews(views: number): string {
  if (views < 1000) return views.toString();
  if (views < 1000000) return `${(views / 1000).toFixed(1)}K`;
  return `${(views / 1000000).toFixed(1)}M`;
}
