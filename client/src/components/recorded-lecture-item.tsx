import { RecordedLecture } from "@shared/schema";
import { formatTimeAgo, formatViews, getSubjectColor } from "@/lib/utils";
import { Play, Download, Bookmark, Trash2, BookmarkCheck } from "lucide-react";
import { Button } from "./ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useToast } from "../hooks/use-toast";
import VideoPlayerModal from "./video-player-modal";

interface RecordedLectureItemProps {
  lecture: RecordedLecture;
  onShowActions: (lecture: RecordedLecture) => void;
  onBookmark: (lecture: RecordedLecture) => void;
}

export default function RecordedLectureItem({ 
  lecture, 
  onShowActions, 
  onBookmark 
}: RecordedLectureItemProps) {
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const bookmarkMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/recorded-lectures/${id}/bookmark`, {
        method: 'PATCH',
      });
      if (!response.ok) throw new Error('Failed to toggle bookmark');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recorded-lectures"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/recorded-lectures/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete lecture');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recorded-lectures"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      toast({
        title: "Success",
        description: "Lecture deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete lecture",
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this lecture?")) {
      deleteMutation.mutate(lecture.id);
    }
  };

  const handlePlay = () => {
    setIsPlayerOpen(true);
  };

  const subjectColors = {
    physics: 'bg-blue-100 text-blue-700',
    chemistry: 'bg-red-100 text-red-700',
    botany: 'bg-green-100 text-green-700',
    zoology: 'bg-purple-100 text-purple-700',
  };

  return (
    <div 
      className="p-6 hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
      onClick={() => onShowActions(lecture)}
    >
      <div className="flex items-center space-x-4">
        {/* Video Thumbnail */}
        <div className="flex-shrink-0 relative">
          <div className={`w-24 h-16 ${getSubjectColor(lecture.subject)} rounded-lg flex items-center justify-center`}>
            <Play className="text-white text-lg" />
          </div>
          {lecture.duration && (
            <span className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 rounded">
              {lecture.duration}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h5 className="text-base font-semibold text-gray-800 truncate">
                {lecture.title}
              </h5>
              <p className="text-sm text-gray-600">{lecture.instructor}</p>
              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                <span>{formatTimeAgo(lecture.uploadDate!)}</span>
                <span>{formatViews(lecture.views || 0)} views</span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full font-medium ${
                  subjectColors[lecture.subject as keyof typeof subjectColors] || 'bg-gray-100 text-gray-700'
                }`}>
                  {lecture.subject.charAt(0).toUpperCase() + lecture.subject.slice(1)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  bookmarkMutation.mutate(lecture.id);
                }}
                disabled={bookmarkMutation.isPending}
                title="Bookmark"
              >
                {lecture.isBookmarked ? (
                  <BookmarkCheck className="h-4 w-4" />
                ) : (
                  <Bookmark className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                disabled={deleteMutation.isPending}
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlay();
                }}
                size="sm"
                className="ml-auto"
              >
                <Play className="h-4 w-4 mr-2" />
                Watch
              </Button>
            </div>
          </div>
        </div>
      </div>
      <VideoPlayerModal
        isOpen={isPlayerOpen}
        onClose={() => setIsPlayerOpen(false)}
        lecture={lecture}
        onDownload={() => {
          // Handle download functionality
          window.open(lecture.youtubeUrl, '_blank');
        }}
        onBookmark={() => {
          bookmarkMutation.mutate(lecture.id);
        }}
      />
    </div>
  );
}