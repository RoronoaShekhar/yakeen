import { RecordedLecture } from "@shared/schema";
import { getYouTubeEmbedUrl } from "@/lib/utils";
import { X, Download, Bookmark } from "lucide-react";

import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface VideoPlayerModalProps {
  isOpen: boolean;
  lecture: RecordedLecture | null;
  onClose: () => void;
  onDownload: () => void;
  onBookmark: () => void;
}

export default function VideoPlayerModal({
  isOpen,
  lecture,
  onClose,
  onDownload,
  onBookmark,
}: VideoPlayerModalProps) {
  if (!lecture) return null;

  const embedUrl = getYouTubeEmbedUrl(lecture.youtubeUrl);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl p-0 bg-black">
        <div className="flex items-center justify-between p-4 bg-gray-900">
          <h3 className="text-lg font-semibold text-white">{lecture.title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors duration-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="aspect-video bg-black">
          {embedUrl && (
            <iframe
              className="w-full h-full"
              src={embedUrl}
              frameBorder="0"
              allowFullScreen
              title={lecture.title}
            />
          )}
        </div>

        <div className="p-4 bg-gray-900 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-300">{lecture.instructor}</p>
              <p className="text-xs text-gray-400">
                {lecture.subject.charAt(0).toUpperCase() + lecture.subject.slice(1)}
                {lecture.duration && ` • ${lecture.duration}`}
              </p>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={onDownload}
                className="bg-blue-600 hover:bg-blue-700 text-sm"
                size="sm"
              >
                <Download className="mr-1 h-4 w-4" />
                Download
              </Button>
              <Button
                onClick={onBookmark}
                variant="outline"
                className="bg-gray-700 hover:bg-gray-600 border-gray-600 text-white text-sm"
                size="sm"
              >
                <Bookmark className={`mr-1 h-4 w-4 ${lecture.isBookmarked ? 'fill-current' : ''}`} />
                Bookmark
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
