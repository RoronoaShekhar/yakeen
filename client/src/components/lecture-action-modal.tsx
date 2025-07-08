import { RecordedLecture } from "@shared/schema";
import { Play, Download, Copy, ExternalLink } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface LectureActionModalProps {
  isOpen: boolean;
  lecture: RecordedLecture | null;
  onClose: () => void;
  onPlay: () => void;
}

export default function LectureActionModal({
  isOpen,
  lecture,
  onClose,
  onPlay,
}: LectureActionModalProps) {
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const { toast } = useToast();

  if (!lecture) return null;

  const handlePlayClick = () => {
    onPlay();
    onClose();
  };

  const handleDownloadClick = () => {
    setShowDownloadOptions(true);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(lecture.youtubeUrl);
      toast({
        title: "Link copied",
        description: "YouTube link copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  const handleGoToY2mate = () => {
    window.open("https://v2.www-y2mate.com", "_blank");
  };

  const handleBackToOptions = () => {
    setShowDownloadOptions(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{lecture.title}</DialogTitle>
        </DialogHeader>

        {!showDownloadOptions ? (
          <div className="space-y-3">
            <Button 
              onClick={handlePlayClick}
              className="w-full justify-start h-12"
              size="lg"
            >
              <Play className="mr-3 h-5 w-5" />
              Play Lecture
            </Button>
            <Button 
              onClick={handleDownloadClick}
              variant="outline"
              className="w-full justify-start h-12"
              size="lg"
            >
              <Download className="mr-3 h-5 w-5" />
              Download Lecture
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">YouTube Link:</label>
              <Input 
                value={lecture.youtubeUrl} 
                readOnly 
                className="font-mono text-sm"
              />
            </div>
            
            <div className="space-y-2">
              <Button 
                onClick={handleCopyLink}
                className="w-full justify-start"
                variant="outline"
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Link
              </Button>
              <Button 
                onClick={handleGoToY2mate}
                className="w-full justify-start"
                variant="outline"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Go to y2mate.com
              </Button>
            </div>
            
            <Button 
              onClick={handleBackToOptions}
              variant="ghost"
              className="w-full"
            >
              Back to Options
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}